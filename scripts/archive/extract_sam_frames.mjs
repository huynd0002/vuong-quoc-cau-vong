import { chromium } from 'playwright';
import fs from 'node:fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const sheetB64 = fs.readFileSync('assets/hero/sau_upgrade/hero_upgrade_walk_sheet.png').toString('base64');
const idleSheetB64 = fs.readFileSync('assets/hero/sau_upgrade/hero_upgrade_idle_sheet.png').toString('base64');

await page.evaluate(async ({ sheetB64, idleSheetB64 }) => {
  function load(b64) {
    return new Promise(r => {
      const img = new Image();
      img.onload = () => r(img);
      img.src = 'data:image/png;base64,' + b64;
    });
  }
  const walkImg = await load(sheetB64);
  const idleImg = await load(idleSheetB64);

  // 1024x512 -> 8 columns (128px), 4 rows (128px)
  // Row 0: Down (Front)
  // Row 1: Right
  // Row 2: Up (Back)
  // Row 3: Left
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  function exportFrame(img, col, row) {
    ctx.clearRect(0, 0, 128, 128);
    ctx.drawImage(img, col * 128, row * 128, 128, 128, 0, 0, 128, 128);
    return canvas.toDataURL('image/png');
  }

  window.frames = {
    idle_front: exportFrame(idleImg, 0, 0),
    idle_right: exportFrame(idleImg, 0, 1),
    walk_right_1: exportFrame(walkImg, 0, 1),
    walk_right_2: exportFrame(walkImg, 2, 1),
    walk_right_4: exportFrame(walkImg, 4, 1),
  };
}, { sheetB64, idleSheetB64 });

const frames = await page.evaluate(() => window.frames);
for (const [name, dataUrl] of Object.entries(frames)) {
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(`artifacts/sam_frame_${name}.png`, Buffer.from(base64, 'base64'));
  console.log(`Saved artifacts/sam_frame_${name}.png`);
}

await browser.close();
