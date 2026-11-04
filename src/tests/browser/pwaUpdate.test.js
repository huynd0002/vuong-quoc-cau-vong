import assert from 'node:assert/strict';
import http from 'node:http';
import { preview } from 'vite';
import { chromium } from 'playwright';

// Reproduce a returning player controlled by the previous service worker.
// Proxy only this isolated test origin; never clear the user's browser/storage.
const upstream=await preview({preview:{host:'127.0.0.1',port:4245,strictPort:true}});
let legacy=true;
const server=http.createServer((req,res)=>{
  if(req.url==='/sw.js'&&legacy){
    res.writeHead(200,{'content-type':'application/javascript','cache-control':'no-store'});
    res.end(`self.addEventListener('install',e=>e.waitUntil(caches.open('test-old-game-cache').then(c=>c.put('/old-build',new Response('old'))).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));`);
    return;
  }
  const proxy=http.request({hostname:'127.0.0.1',port:4245,path:req.url,method:req.method,headers:req.headers},p=>{
    res.writeHead(p.statusCode,p.headers);p.pipe(res);
  });
  proxy.on('error',()=>{res.writeHead(502);res.end();});req.pipe(proxy);
});
await new Promise(r=>server.listen(4244,'127.0.0.1',r));
const browser=await chromium.launch({headless:true});
try {
  const context=await browser.newContext({viewport:{width:1280,height:800}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{if(!localStorage.getItem('pwa-test-seed')){
    localStorage.setItem('pwa-test-seed','1');
    localStorage.setItem('RAINBOW_KIDS_RPG_SAVE_V1',JSON.stringify({version:2,player:{stars:7,kitchenSpentStars:4},cooking:{spentStars:4,ingredients:{banana:2},dishes:[{id:'cook-1',recipeId:'fruit_yogurt',quality:3}]},campaign:{currentMapId:'map_pet_farm'},settings:{soundEnabled:false}}));
  }});
  await page.goto('http://127.0.0.1:4244/game.html',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
  assert.equal(await page.evaluate(()=>caches.has('test-old-game-cache')),true);
  let navigations=0;page.on('framenavigated',f=>{if(f===page.mainFrame())navigations++;});
  legacy=false;
  await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});
  await page.waitForFunction(async()=>!await caches.has('test-old-game-cache')&&await caches.has('rainbow-kingdom-cache-v2.9'),null,{timeout:20000});
  await page.waitForFunction(()=>Boolean(window.__kitchenModal),null,{timeout:25000});
  assert.ok(navigations>=1,'new worker refreshes the loaded game, not only its cache');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('RAINBOW_KIDS_RPG_SAVE_V1')));
  assert.equal(saved.player.stars,7);assert.equal(saved.cooking.ingredients.banana,2);assert.equal(saved.cooking.dishes.length,1);
  assert.deepEqual(errors,[]);
  console.log('✓ PWA upgrade: old worker → new cache → automatic page reload; stars, ingredients and dishes preserved');
} finally {
  await browser.close();server.closeAllConnections();upstream.httpServer.closeAllConnections();
  await Promise.all([new Promise(r=>server.close(r)),new Promise(r=>upstream.httpServer.close(r))]);
}
