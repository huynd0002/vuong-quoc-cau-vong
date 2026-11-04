import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({headless:true});
await mkdir('artifacts/ui', {recursive:true});
try {
  for (const viewport of [{width:713,height:495},{width:844,height:390},{width:1280,height:800}]) {
    const context = await browser.newContext({viewport});
    await context.setOffline(true);
    const page = await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(path.resolve('game.html')).href);
    await page.waitForFunction(()=>window.__worldScene?.pet?.sprite?.active,null,{timeout:30000});
    await page.waitForFunction(()=>getComputedStyle(document.getElementById('initial-loading-screen')).display==='none',null,{timeout:25000});
    await page.locator('#char-btn-start-adventure').click();
    await page.locator('#story-modal').waitFor({state:'visible'});
    await page.evaluate(()=>Promise.all(document.querySelector('#story-modal .modal-card').getAnimations().map(a=>a.finished)));
    const presentation=await page.evaluate(async()=>{
      const card=document.querySelector('#story-modal .modal-card'),r=card.getBoundingClientRect();
      const buttons=[...document.querySelectorAll('#story-modal button')].map(b=>{const q=b.getBoundingClientRect();return {w:q.width,h:q.height,x:q.x,y:q.y};});
      // Decode a real CSS texture to catch the previous data:text/plain double encoding.
      const source=getComputedStyle(document.querySelector('.prompt-card')).backgroundImage;
      const image=new Image(); image.src=source.slice(5,-2); await image.decode();
      return {surface:getComputedStyle(card).backgroundColor,rect:{x:r.x,y:r.y,w:r.width,h:r.height},buttons,textureWidth:image.naturalWidth};
    });
    assert.equal(presentation.surface,'rgb(255, 249, 233)');
    assert.ok(presentation.textureWidth>0);
    assert.ok(presentation.rect.x>=0 && presentation.rect.y>=0, JSON.stringify(presentation));
    assert.ok(presentation.rect.y+presentation.rect.h<=viewport.height);
    assert.ok(presentation.buttons.every(b=>b.h>=64 && b.w>=64));
    await page.screenshot({path:`artifacts/ui/welcome-${viewport.width}.png`});
    await page.locator('#story-start-button').click();
    await page.locator('.toolbar-more summary').scrollIntoViewIfNeeded();
    await page.locator('.toolbar-more summary').click();
    await page.locator('.toolbar-more-panel').waitFor({state:'visible'});
    assert.ok(await page.locator('#btn-manage-questions').isVisible());
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.toolbar-more').getAttribute('open'),null);
    const stations=await page.evaluate(()=>window.__worldScene.petStationContainers.map(({container,touchZone})=>({decorations:container.list.length,interactive:!!touchZone.input?.enabled})));
    assert.ok(stations.length>0 && stations.every(s=>s.decorations===0 && s.interactive), 'no floating badges; station touch zones remain active');
    await page.locator('#sound-toggle').scrollIntoViewIfNeeded();
    await page.locator('#sound-toggle').click();
    await page.locator('#sound-toggle').click();
    const broken=await page.evaluate(async()=>{
      const images=[...document.images].filter(i=>i.getAttribute('src'));
      await Promise.all(images.map(i=>i.decode().catch(()=>{})));
      return images.filter(i=>!i.naturalWidth).map(i=>({id:i.id,src:i.getAttribute('src').slice(0,120)}));
    });
    assert.deepEqual(broken,[], 'all HTML and dynamically refreshed HUD images decode offline');
    assert.match(await page.locator('.brand-mark h1').evaluate(e=>getComputedStyle(e).fontFamily),/Segoe UI/);
    await page.screenshot({path:`artifacts/ui/farm-${viewport.width}.png`});
    assert.deepEqual(errors,[]);
    console.log(`PASS offline UI ${viewport.width}×${viewport.height}: images, Vietnamese font, controls, no station badges, active touch zones`);
    await context.close();
  }
} finally { await browser.close(); }
