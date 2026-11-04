import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer, preview } from 'vite';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const fileMode=process.argv.includes('--file');
const production=process.argv.includes('--production'), port=production?4182:4183;
const server=fileMode?null:production?await preview({preview:{host:'127.0.0.1',port,strictPort:true}}):await createServer({server:{host:'127.0.0.1',port,strictPort:true}});
if(!fileMode&&!production) await server.listen();
const browser=await chromium.launch({headless:true});
await mkdir('artifacts/cooking',{recursive:true});
const errors=[];
const read=page=>page.evaluate(()=>({cooking:window.__kitchenModal.system.getState(),stars:window.__kitchenModal.system.getStars()}));
async function enter(page) {
  await page.waitForFunction(()=>window.__worldScene?.pet?.sprite?.active,null,{timeout:25000});
  await page.waitForFunction(()=>getComputedStyle(document.getElementById('initial-loading-screen')).display==='none',null,{timeout:20000});
  if(await page.locator('#char-btn-start-adventure').isVisible()) await page.locator('#char-btn-start-adventure').click();
  if(await page.locator('#story-start-button').isVisible()) await page.locator('#story-start-button').click();
  await page.waitForFunction(()=>window.__worldScene?.isExploring || !document.getElementById('kitchen-station-popup-root').hidden);
}
const action=(page,name)=>page.locator(`#kitchen-modal [data-action="${name}"]`).last();
async function visitStation(page,type) {
  const point=await page.evaluate(type=>{
    const scene=window.__worldScene,s=scene.mapConfig.kitchenStations.find(s=>s.type===type),b=scene.game.canvas.getBoundingClientRect();
    return {x:b.x+s.x*b.width/1280,y:b.y+s.y*b.height/720};
  },type);
  await page.mouse.click(point.x,point.y);
  await page.waitForFunction(()=>!document.getElementById('kitchen-modal').hidden,null,{timeout:10000});
}
async function touchDrag(page,id) {
  const item=page.locator(`[data-ingredient="${id}"]`);
  await item.scrollIntoViewIfNeeded();
  const a=await item.boundingBox(), b=await page.locator('#kitchen-pot-dropzone').boundingBox();
  const cdp=await page.context().newCDPSession(page);
  const start={x:a.x+a.width/2,y:a.y+a.height/2}, end={x:b.x+b.width/2,y:Math.max(b.y+12,Math.min(start.y,b.y+b.height-12))};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
  for(let n=1;n<=8;n++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*n/8,y:start.y+(end.y-start.y)*n/8}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await cdp.detach();
}
async function washHands(page) {
  await page.locator('#kitchen-station-popup-root').waitFor({state:'visible'});
  for(let attempt=0;attempt<30&&await page.locator('#btn-goto-cook').isDisabled();attempt++) {
    const target=page.locator('.wash-target:not([hidden]):not(.is-done)').first();
    if(await target.count()===0){await page.waitForTimeout(350);continue;}
      const tool=await page.locator('#wash-tool').boundingBox(), zone=await target.boundingBox();
      await page.mouse.move(tool.x+tool.width/2,tool.y+tool.height/2); await page.mouse.down();
      await page.mouse.move(zone.x+zone.width/2,zone.y+zone.height/2,{steps:8}); await page.mouse.up();
      await page.waitForTimeout(260);
    if(await target.count()&&!await target.evaluate(node=>node.classList.contains('is-done'))) await target.evaluate(node=>node.click());
  }
  await page.locator('#btn-goto-cook').click();
  await page.locator('#kitchen-modal').waitFor({state:'visible'});
}
try {
  for(const viewport of [{width:1280,height:800},{width:844,height:390}]) {
    const mobile=viewport.width===844;
    const context=await browser.newContext({viewport,hasTouch:mobile,serviceWorkers:'block'});
    const page=await context.newPage();page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
    // Test-owned profile, seeded once so reloading really exercises persistence.
    await page.addInitScript(()=>{if(!localStorage.getItem('kitchen-test-seeded')){
      localStorage.setItem('kitchen-test-seeded','1');localStorage.setItem('RAINBOW_KIDS_RPG_SAVE_V1',JSON.stringify({version:2,player:{stars:10},campaign:{currentMapId:'map_pet_farm'},settings:{soundEnabled:false}}));
    }});
    if(fileMode) await context.setOffline(true);
    await page.goto(fileMode?pathToFileURL(path.resolve('game.html')).href:`http://127.0.0.1:${port}/game.html`,{waitUntil:'networkidle'});await enter(page);
    await page.evaluate(() => (document.getElementById('btn-floating-bag') || document.getElementById('btn-open-bag'))?.click());assert.equal((await read(page)).cooking.dishes.length,0);
    assert.equal(await page.evaluate(()=>window.__worldScene.sys.isPaused()),true);
    await action(page,'close').click();
    // Stars are still awarded by the existing challenge, then spendable in fridge.
    if(!mobile) {
      await page.evaluate(() => document.getElementById('test-encounter')?.click());await page.locator('#prompt-btn-start').click();
      for(let n=0;n<10;n++) {
        await page.waitForFunction(()=>document.getElementById('battle-arena-modal').hidden||document.getElementById('maze-canvas')?.getClientRects().length||(!window.__battleModal.isTurnLocked&&document.querySelector('.ans-btn')),null,{timeout:20000});
        if(await page.locator('#battle-arena-modal').isHidden()) break;
        const hearts=await page.evaluate(()=>window.__battleModal.monsterHearts);
        if(await page.locator('#maze-canvas').isVisible()) {
          const path=await page.evaluate(()=>{
            const m=window.__mazeModal,b=m.canvas.getBoundingClientRect();
            return m.shortestPath.map(p=>{const c=m.getCellCoordinates(p.c,p.r);return {x:b.x+c.centerX*b.width/m.canvas.width,y:b.y+c.centerY*b.height/m.canvas.height};});
          });
          await page.mouse.move(path[0].x,path[0].y);await page.mouse.down();
          for(const point of path.slice(1)) await page.mouse.move(point.x,point.y,{steps:8});
          await page.mouse.up();
          await page.waitForFunction(()=>!document.getElementById('maze-canvas')?.getClientRects().length,null,{timeout:15000});
        } else {
          const correct=await page.evaluate(()=>window.__battleModal.currentQuestion.correct);
          await page.locator('.ans-btn').nth(correct).click();
        }
        await page.waitForFunction(hearts=>window.__battleModal.monsterHearts<hearts||document.getElementById('battle-arena-modal').hidden,hearts,{timeout:20000});
      }
      await page.waitForFunction(()=>window.__kitchenModal.system.getStars()>10);
      await page.waitForFunction(()=>document.getElementById('battle-arena-modal').hidden,null,{timeout:10000});
    }
    const startingStars=(await read(page)).stars;
    await page.locator('#btn-open-kitchen').click();
    await page.waitForFunction(()=>window.__worldScene.currentMapId==='map_kitchen'&&!document.getElementById('kitchen-station-popup-root').hidden,null,{timeout:20000});
    await page.locator('#welcome-goto-pantry').click();
    assert.equal(await page.locator('#kitchen-modal').isVisible(),true);
    await page.waitForFunction(()=>window.__worldScene.sys.isPaused());
    await page.screenshot({path:`artifacts/cooking/fridge-${viewport.width}.png`});
    if(!mobile) {
      await action(page,'close').click();await visitStation(page,'pantry');
      const hero=await page.evaluate(()=>({x:window.__worldScene.hero.sprite.x,y:window.__worldScene.hero.sprite.y}));
      assert.ok(Math.abs(hero.x-398)<2&&Math.abs(hero.y-291)<2,'walk to refrigerator before opening');
    }
    await page.locator('[data-buy="banana"]').click();await page.locator('[data-buy="banana"]').click();await page.locator('[data-buy="yogurt"]').click();
    assert.equal((await read(page)).stars,startingStars-4);
    assert.equal((await read(page)).cooking.ingredients.banana,2);
    assert.match(await page.locator('#hero-stars').textContent(),new RegExp(String(startingStars-4)));
    if(!mobile) {await action(page,'close').click();await visitStation(page,'cook');}
    await action(page,'recipes').click();assert.equal(await page.locator('[data-recipe="veggie_soup"]').isDisabled(),true);
    await page.locator('[data-recipe="fruit_yogurt"]').click();
    await washHands(page);
    await page.locator('[data-recipe="fruit_yogurt"]').click();
    await action(page,'cook').click();assert.match(await page.locator('#kitchen-feedback').textContent(),/đủ số phần/);
    if(mobile) await touchDrag(page,'banana'); else await page.locator('[data-ingredient="banana"]').dragTo(page.locator('#kitchen-pot-dropzone'));
    assert.equal((await read(page)).cooking.session.staged.banana,1,'one drag stages exactly one unit');
    if(mobile) await page.waitForTimeout(360);
    await page.locator('[data-ingredient="banana"]').click();await page.locator('[data-ingredient="yogurt"]').click();
    assert.equal((await read(page)).cooking.ingredients.banana,2,'staging does not spend stock');
    await page.locator('[data-heat="high"]').click();await page.locator('[data-ticks="2"]').click();await action(page,'cook').click();
    assert.equal((await read(page)).cooking.session.phase,'preparing');assert.match(await page.locator('#kitchen-feedback').textContent(),/Nguyên liệu vẫn còn nguyên/);
    await page.locator('[data-heat="off"]').click();await page.screenshot({path:`artifacts/cooking/prepare-${viewport.width}.png`});
    const small=await page.locator('#kitchen-modal button:visible').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect();return r.width<64||r.height<64;}).map(n=>n.textContent));assert.deepEqual(small,[]);
    assert.equal(await page.locator('.kitchen-room').evaluate(n=>n.scrollWidth<=n.clientWidth+1),true);
    await action(page,'cook').click();assert.equal((await read(page)).cooking.ingredients.banana||0,0);
    assert.equal((await read(page)).cooking.session.phase,'cooking');
    await page.screenshot({path:`artifacts/cooking/loading-${viewport.width}.png`});
    // Closing and reloading cannot lose the paid inputs or duplicate the result.
    await action(page,'close').click();await page.reload({waitUntil:'networkidle'});await enter(page);
    const welcome=page.locator('#kitchen-station-popup-root [data-action="close-popup"]').first();
    await page.waitForFunction(()=>!document.getElementById('kitchen-station-popup-root').hidden);
    await welcome.click();
    await page.waitForFunction(()=>window.__kitchenModal.system.getState().dishes.length===1);
    await page.locator('#btn-open-bag').click();const meal=await read(page);assert.equal(meal.cooking.session,null);assert.equal(meal.stars,startingStars-4);
    await page.locator('[data-dish]').click();await page.screenshot({path:`artifacts/cooking/bag-${viewport.width}.png`});
    await page.locator('[data-eat]').click();assert.equal((await read(page)).cooking.bonusHearts,1);assert.equal((await read(page)).cooking.dishes.length,0);
    // A second dish demonstrates the explicit discard action and confirmation.
    await action(page,'fridge').click();await page.locator('[data-buy="bread"]').click();await page.locator('[data-buy="bread"]').click();await page.locator('[data-buy="greens"]').click();
    await action(page,'recipes').click();await page.locator('[data-recipe="rainbow_sandwich"]').click();
    await washHands(page);
    await page.locator('[data-recipe="rainbow_sandwich"]').click();
    await page.locator('[data-ingredient="bread"]').click();await page.locator('[data-ingredient="bread"]').click();await page.locator('[data-ingredient="greens"]').click();
    await page.locator('[data-heat="off"]').click();await page.locator('[data-ticks="2"]').click();await action(page,'cook').click();
    await page.waitForFunction(()=>Boolean(document.querySelector('[data-dish]')));await page.locator('[data-dish]').click();await action(page,'ask-discard').click();await action(page,'keep').click();
    assert.equal((await read(page)).cooking.dishes.length,1);await action(page,'ask-discard').click();await page.locator('[data-discard]').click();assert.equal((await read(page)).cooking.dishes.length,0);
    await action(page,'close').click();assert.equal(await page.evaluate(()=>window.__worldScene.sys.isActive()&&!document.getElementById('game-app').inert),true);
    console.log(`✓ Kitchen ${viewport.width}×${viewport.height}: stars → refrigerator → bag → ${mobile?'real touch':'mouse'} drag → Cook → reload → auto bag → use/discard`);
    await context.close();
  }
  assert.deepEqual(errors,[]);
} catch(error) {const p=browser.contexts()[0]?.pages()[0];if(p)await p.screenshot({path:'artifacts/cooking/failure.png'});throw error;}
finally {await browser.close();if(production&&server){server.httpServer.closeAllConnections();await new Promise(r=>server.httpServer.close(r));}else await server?.close();}
