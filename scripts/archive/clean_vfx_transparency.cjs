const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BRAIN_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
const vfxPath = path.join(BRAIN_DIR, 'crystal_projectiles_and_impacts_1793506904462.jpg');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const b64 = 'data:image/jpeg;base64,' + fs.readFileSync(vfxPath).toString('base64');

  const sliced = await page.evaluate(async (uri) => {
    function loadImage(src) {
      return new Promise(r => {
        const img = new Image();
        img.onload = () => r(img);
        img.src = src;
      });
    }

    const img = await loadImage(uri);

    function cleanVfxItem(sx, sy, sw, sh, targetSize = 128, padding = 10) {
      // Crop inside the cell with an inset to ignore outer grid lines
      const inset = 18;
      const cropX = sx + inset;
      const cropY = sy + inset;
      const cropW = sw - inset * 2;
      const cropH = sh - inset * 2;

      const cvs = document.createElement('canvas');
      cvs.width = cropW;
      cvs.height = cropH;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      const imgData = ctx.getImageData(0, 0, cropW, cropH);
      const d = imgData.data;

      // 1. Remove white/off-white background
      // Any pixel that is bright white or light grayish becomes transparent
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2];
        const brightness = (r + g + b) / 3;
        const isWhite = (r >= 215 && g >= 215 && b >= 215) ||
                        (brightness >= 220) ||
                        (brightness >= 195 && Math.abs(r - g) < 16 && Math.abs(g - b) < 16 && Math.abs(r - b) < 16);

        if (isWhite) {
          if (brightness >= 235) {
            d[i+3] = 0;
          } else {
            // Smooth edge feathering
            const alphaFactor = (235 - brightness) / 40;
            d[i+3] = Math.max(0, Math.min(255, Math.round(alphaFactor * 255)));
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // 2. Find bounding box of remaining content
      let minX = cropW, maxX = 0, minY = cropH, maxY = 0;
      let count = 0;
      for (let y = 0; y < cropH; y++) {
        for (let x = 0; x < cropW; x++) {
          const a = d[(y * cropW + x) * 4 + 3];
          if (a > 30) {
            count++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const out = document.createElement('canvas');
      out.width = targetSize;
      out.height = targetSize;
      const outCtx = out.getContext('2d');

      if (count > 0) {
        const bw = maxX - minX + 1;
        const bh = maxY - minY + 1;
        const maxDim = targetSize - padding * 2;
        const scale = Math.min(maxDim / bw, maxDim / bh);
        const dw = Math.round(bw * scale);
        const dh = Math.round(bh * scale);
        const dx = Math.round((targetSize - dw) / 2);
        const dy = Math.round((targetSize - dh) / 2);

        outCtx.drawImage(cvs, minX, minY, bw, bh, dx, dy, dw, dh);
      }

      return out.toDataURL('image/png');
    }

    // 8 items (4 projectiles in top row, 4 impacts in bottom row)
    return {
      crystal_sprout_proj: cleanVfxItem(0, 0, 256, 512, 128, 8),
      crystal_moth_proj: cleanVfxItem(256, 0, 256, 512, 128, 8),
      crystal_bat_proj: cleanVfxItem(512, 0, 256, 512, 128, 8),
      boss_crystal_dragon_proj: cleanVfxItem(768, 0, 256, 512, 160, 10),

      crystal_sprout_impact: cleanVfxItem(0, 512, 256, 512, 256, 12),
      crystal_moth_impact: cleanVfxItem(256, 512, 256, 512, 256, 12),
      bat_impact: cleanVfxItem(512, 512, 256, 512, 256, 12),
      boss_crystal_dragon_impact: cleanVfxItem(768, 512, 256, 512, 320, 14)
    };
  }, b64);

  // Write new transparent files
  const destDir = path.resolve('assets/monsters/map3');
  for (const [k, dataUrl] of Object.entries(sliced)) {
    const fileName = `${k}.png`;
    const dest = path.join(destDir, fileName);
    fs.writeFileSync(dest, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
    console.log('Saved truly transparent VFX:', dest);
  }
  // also copy crystal_bat_impact
  fs.copyFileSync(path.join(destDir, 'bat_impact.png'), path.join(destDir, 'crystal_bat_impact.png'));

  await browser.close();
})();
