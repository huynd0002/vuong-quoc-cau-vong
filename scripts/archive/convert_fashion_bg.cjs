const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const srcJpg = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/map_fashion_street_bg_1793618741314.jpg';
const destPng = path.resolve('assets/maps/backgrounds/map_fashion_street_bg.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const b64 = 'data:image/jpeg;base64,' + fs.readFileSync(srcJpg).toString('base64');

  const pngDataUrl = await page.evaluate(async (uri) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cvs = document.createElement('canvas');
        cvs.width = 1280;
        cvs.height = 720;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0, 1280, 720);
        resolve(cvs.toDataURL('image/png', 1.0));
      };
      img.src = uri;
    });
  }, b64);

  const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(destPng, Buffer.from(base64Data, 'base64'));
  console.log('Saved map_fashion_street_bg.png:', fs.statSync(destPng).size, 'bytes');

  await browser.close();
})();
