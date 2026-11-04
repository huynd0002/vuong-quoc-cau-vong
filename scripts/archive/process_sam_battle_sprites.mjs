import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const sprites = [
  {
    src: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/sam_battle_idle_right_1793419274535.jpg',
    baseName: 'hero_upgrade_idle_right'
  },
  {
    src: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/sam_battle_action_1793419296181.jpg',
    baseName: 'hero_upgrade_action'
  },
  {
    src: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/sam_battle_hit_1793419332275.jpg',
    baseName: 'hero_upgrade_hit'
  },
  {
    src: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/sam_battle_celebrate_1793419352976.jpg',
    baseName: 'hero_upgrade_celebrate'
  }
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const sprite of sprites) {
  const b64 = fs.readFileSync(sprite.src).toString('base64');
  console.log(`Processing ${sprite.baseName}...`);

  const { pngDataUrl, webpDataUrl } = await page.evaluate(async ({ b64 }) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = 'data:image/jpeg;base64,' + b64; });

    // Step 1: Draw on full size canvas to perform high quality transparent flood-fill
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, img.width, img.height);
    const d = imgData.data;
    const w = img.width, h = img.height;

    // BFS Flood-fill from borders for pure white / near-white background
    const visited = new Uint8Array(w * h);
    const queue = [];

    // Push 4 border pixels
    for (let x = 0; x < w; x++) {
      queue.push(x, 0);
      queue.push(x, h - 1);
      visited[x] = 1;
      visited[(h - 1) * w + x] = 1;
    }
    for (let y = 0; y < h; y++) {
      queue.push(0, y);
      queue.push(w - 1, y);
      visited[y * w] = 1;
      visited[y * w + (w - 1)] = 1;
    }

    let head = 0;
    while (head < queue.length) {
      const qx = queue[head++];
      const qy = queue[head++];
      const idx = (qy * w + qx) * 4;
      const r = d[idx], g = d[idx + 1], b = d[idx + 2];

      // If near-white (background)
      const isWhite = (r >= 235 && g >= 235 && b >= 235) || (r >= 225 && g >= 225 && b >= 225 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15);
      if (isWhite) {
        // Calculate smooth alpha for border anti-aliasing
        const brightness = (r + g + b) / 3;
        if (brightness >= 248) {
          d[idx + 3] = 0; // Completely transparent
        } else {
          // Feathered edge
          const factor = (248 - brightness) / 13;
          d[idx + 3] = Math.round(factor * 255);
        }

        // Neighbors
        const neighbors = [
          [qx + 1, qy], [qx - 1, qy],
          [qx, qy + 1], [qx, qy - 1]
        ];
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

    // Step 2: Resize to 384x384 target size with high quality smoothing
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = 384;
    targetCanvas.height = 384;
    const tCtx = targetCanvas.getContext('2d');
    tCtx.imageSmoothingEnabled = true;
    tCtx.imageSmoothingQuality = 'high';
    tCtx.drawImage(canvas, 0, 0, 384, 384);

    return {
      pngDataUrl: targetCanvas.toDataURL('image/png'),
      webpDataUrl: targetCanvas.toDataURL('image/webp', 0.95)
    };
  }, { b64 });

  const destPng = path.resolve('assets/hero/sau_upgrade', `${sprite.baseName}.png`);
  const destWebp = path.resolve('assets/hero/sau_upgrade', `${sprite.baseName}.webp`);

  const pngBase64 = pngDataUrl.replace(/^data:image\/png;base64,/, '');
  const webpBase64 = webpDataUrl.replace(/^data:image\/webp;base64,/, '');

  fs.writeFileSync(destPng, Buffer.from(pngBase64, 'base64'));
  fs.writeFileSync(destWebp, Buffer.from(webpBase64, 'base64'));

  console.log(`Saved ${destPng} (${fs.statSync(destPng).size} bytes)`);
  console.log(`Saved ${destWebp} (${fs.statSync(destWebp).size} bytes)`);
}

await browser.close();
console.log('All 4 Sam Kuromi battle sprites successfully processed and written to assets/hero/sau_upgrade!');
