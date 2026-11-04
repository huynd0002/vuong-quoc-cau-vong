const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const srcJpg = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/outfit_leaf_walk_1793618759362.jpg';
const destPng = path.resolve('assets/hero/outfit_leaf_walk.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const b64 = 'data:image/jpeg;base64,' + fs.readFileSync(srcJpg).toString('base64');

  const pngData = await page.evaluate(async (uri) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cvs = document.createElement('canvas');
        cvs.width = img.width; cvs.height = img.height;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const d = imgData.data;

        // Flood fill remove white background
        const w = img.width, h = img.height;
        const visited = new Uint8Array(w * h);
        const queue = [];
        for (let x = 0; x < w; x++) { queue.push(x, 0); queue.push(x, h - 1); visited[x] = 1; visited[(h - 1) * w + x] = 1; }
        for (let y = 0; y < h; y++) { queue.push(0, y); queue.push(w - 1, y); visited[y * w] = 1; visited[y * w + (w - 1)] = 1; }

        let head = 0;
        while (head < queue.length) {
          const qx = queue[head++];
          const qy = queue[head++];
          const idx = (qy * w + qx) * 4;
          const r = d[idx], g = d[idx+1], b = d[idx+2];
          const brightness = (r + g + b) / 3;

          if (brightness >= 225) {
            d[idx + 3] = 0;
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
          }
        }
        ctx.putImageData(imgData, 0, 0);

        // Bounding box
        let minX = w, maxX = 0, minY = h, maxY = 0;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (d[(y * w + x) * 4 + 3] > 30) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        const out = document.createElement('canvas');
        out.width = 256; out.height = 256;
        const outCtx = out.getContext('2d');
        const bw = maxX - minX + 1;
        const bh = maxY - minY + 1;
        const scale = Math.min(230 / bw, 230 / bh);
        const dw = Math.round(bw * scale);
        const dh = Math.round(bh * scale);
        outCtx.drawImage(cvs, minX, minY, bw, bh, Math.round((256 - dw) / 2), Math.round((256 - dh) / 2), dw, dh);
        resolve(out.toDataURL('image/png'));
      };
      img.src = uri;
    });
  }, b64);

  fs.writeFileSync(destPng, Buffer.from(pngData.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log('Saved outfit_leaf_walk.png:', fs.statSync(destPng).size, 'bytes');

  await browser.close();
})();
