const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BRAIN_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
const vfxPath = path.join(BRAIN_DIR, 'crystal_projectiles_and_impacts_1793506904462.jpg');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const b64 = 'data:image/jpeg;base64,' + fs.readFileSync(vfxPath).toString('base64');

  const processed = await page.evaluate(async (uri) => {
    function loadImage(src) {
      return new Promise(r => {
        const img = new Image();
        img.onload = () => r(img);
        img.src = src;
      });
    }

    const img = await loadImage(uri);
    const cvs = document.createElement('canvas');
    cvs.width = img.width; cvs.height = img.height;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Flood fill from all 4 borders to remove black background
    const w = cvs.width, h = cvs.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    const visited = new Uint8Array(w * h);
    const queue = [];

    for (let x = 0; x < w; x++) {
      queue.push(x, 0); queue.push(x, h - 1);
      visited[x] = 1; visited[(h - 1) * w + x] = 1;
    }
    for (let y = 0; y < h; y++) {
      queue.push(0, y); queue.push(w - 1, y);
      visited[y * w] = 1; visited[y * w + (w - 1)] = 1;
    }

    let head = 0;
    while (head < queue.length) {
      const qx = queue[head++];
      const qy = queue[head++];
      const idx = (qy * w + qx) * 4;
      const r = d[idx], g = d[idx+1], b = d[idx+2];
      const maxVal = Math.max(r, g, b);

      if (maxVal < 42) {
        d[idx+3] = 0; // Pure transparent

        const neighbors = [[qx+1, qy], [qx-1, qy], [qx, qy+1], [qx, qy-1]];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nIdx = ny * w + nx;
            if (!visited[nIdx]) {
              visited[nIdx] = 1;
              queue.push(nx, ny);
            }
          }
        }
      } else if (maxVal < 90) {
        // Soft alpha gradient transition at edges of glow
        const factor = (maxVal - 42) / (90 - 42);
        d[idx+3] = Math.round(factor * 255);
      }
    }
    ctx.putImageData(imgData, 0, 0);

    return cvs.toDataURL('image/png');
  }, b64);

  fs.writeFileSync('scratch/transparent_vfx_sheet.png', Buffer.from(processed.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log('Saved scratch/transparent_vfx_sheet.png');
  await browser.close();
})();
