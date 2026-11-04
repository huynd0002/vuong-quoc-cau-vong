import { chromium } from 'playwright';
import fs from 'node:fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const idleB64 = fs.readFileSync('assets/hero/sau_upgrade/hero_upgrade_idle.png').toString('base64');
const idleSheetB64 = fs.readFileSync('assets/hero/sau_upgrade/hero_upgrade_idle_sheet.png').toString('base64');
const walkSheetB64 = fs.readFileSync('assets/hero/sau_upgrade/hero_upgrade_walk_sheet.png').toString('base64');

const res = await page.evaluate(async ({ idleB64, idleSheetB64, walkSheetB64 }) => {
  function load(b64) {
    return new Promise(r => {
      const img = new Image();
      img.onload = () => r({ w: img.width, h: img.height });
      img.src = 'data:image/png;base64,' + b64;
    });
  }
  return {
    idle: await load(idleB64),
    idleSheet: await load(idleSheetB64),
    walkSheet: await load(walkSheetB64)
  };
}, { idleB64, idleSheetB64, walkSheetB64 });

console.log(res);
await browser.close();
