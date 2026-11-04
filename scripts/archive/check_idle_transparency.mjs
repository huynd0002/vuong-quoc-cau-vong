import fs from 'node:fs';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const b64 = fs.readFileSync('assets/hero/sau_upgrade/hero_upgrade_idle.png').toString('base64');
const res = await page.evaluate(async (b64) => {
  const img = new Image();
  await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height).data;
  let transparentCount = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 10) transparentCount++;
  }
  return {
    width: img.width,
    height: img.height,
    transparentPct: Math.round((transparentCount / (img.width * img.height)) * 100)
  };
}, b64);

console.log('hero_upgrade_idle.png:', res);
await browser.close();
