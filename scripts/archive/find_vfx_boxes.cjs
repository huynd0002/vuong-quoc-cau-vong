const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BRAIN_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
const vfxPath = path.join(BRAIN_DIR, 'crystal_projectiles_and_impacts_1793506904462.jpg');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const b64 = 'data:image/jpeg;base64,' + fs.readFileSync(vfxPath).toString('base64');
  
  const regions = await page.evaluate((uri) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const cvs = document.createElement('canvas');
        cvs.width = img.width; cvs.height = img.height;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, img.width, img.height).data;

        // Sample background color (corners)
        const getPixel = (x, y) => {
          const i = (y * img.width + x) * 4;
          return [d[i], d[i+1], d[i+2]];
        };
        const bg = getPixel(10, 10);

        // Find non-white pixels: distance from white (255, 255, 255)
        // or distance from background
        const isContent = (x, y) => {
          const i = (y * img.width + x) * 4;
          const r = d[i], g = d[i+1], b = d[i+2];
          const dist = Math.hypot(r - 255, g - 255, b - 255);
          return dist > 35; // colored pixel
        };

        // Grid check 2 rows x 4 columns
        const cellW = img.width / 4;
        const cellH = img.height / 2;
        const items = [];

        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 4; col++) {
            const startX = col * cellW;
            const startY = row * cellH;
            let minX = startX + cellW, maxX = startX, minY = startY + cellH, maxY = startY;
            let count = 0;

            for (let y = startY; y < startY + cellH; y++) {
              for (let x = startX; x < startX + cellW; x++) {
                if (isContent(x, y)) {
                  count++;
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }
              }
            }

            items.push({
              row, col,
              box: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY },
              count
            });
          }
        }

        resolve({ bg, items });
      };
      img.src = uri;
    });
  }, b64);

  console.log(JSON.stringify(regions, null, 2));
  await browser.close();
})();
