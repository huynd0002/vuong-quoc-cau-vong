import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4192, strictPort: true } });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto('http://127.0.0.1:4192/game.html', { waitUntil: 'networkidle' });

await page.evaluate(async () => {
  const scene = window.__worldScene;
  const texKeys = ['pet_dog_dirty_sheet', 'pet_dog_happy_sheet', 'pet_dog_sleep_sheet', 'pet_dog_drink_sheet', 'pet_dog_potty_sheet'];

  for (const key of texKeys) {
    const tex = scene.textures.get(key);
    if (!tex) continue;
    const sourceImg = tex.getSourceImage();

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceImg, 0, 0, 256, 256, 0, 0, 256, 256);
    const dataUrl = canvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.id = 'export_' + key;
    a.href = dataUrl;
    document.body.appendChild(a);
  }
});

const urls = await page.evaluate(() => {
  const res = {};
  for (const el of document.querySelectorAll('a[id^="export_"]')) {
    res[el.id] = el.href;
  }
  return res;
});

import fs from 'fs';
for (const [id, url] of Object.entries(urls)) {
  const base64 = url.split(',')[1];
  fs.writeFileSync(`C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/frame_${id}.png`, Buffer.from(base64, 'base64'));
  console.log('Saved frame_' + id);
}

await browser.close();
await server.close();
