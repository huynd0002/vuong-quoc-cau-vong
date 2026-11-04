const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const b64 = 'data:image/png;base64,' + fs.readFileSync('scratch/transparent_vfx_sheet.png').toString('base64');

  const sliced = await page.evaluate(async (uri) => {
    function loadImage(src) {
      return new Promise(r => {
        const img = new Image();
        img.onload = () => r(img);
        img.src = src;
      });
    }

    const sheet = await loadImage(uri);
    // Find non-transparent bounding box for a region
    function extractItem(sx, sy, sw, sh, targetSize = 256, padding = 12) {
      const temp = document.createElement('canvas');
      temp.width = sw; temp.height = sh;
      const tCtx = temp.getContext('2d');
      tCtx.drawImage(sheet, sx, sy, sw, sh, 0, 0, sw, sh);
      const d = tCtx.getImageData(0, 0, sw, sh).data;

      let minX = sw, maxX = 0, minY = sh, maxY = 0;
      let count = 0;
      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          const a = d[(y * sw + x) * 4 + 3];
          if (a > 25) {
            count++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (count === 0) return temp.toDataURL('image/png');
      const bw = maxX - minX + 1;
      const bh = maxY - minY + 1;

      const out = document.createElement('canvas');
      out.width = targetSize; out.height = targetSize;
      const outCtx = out.getContext('2d');
      const maxDim = targetSize - padding * 2;
      const scale = Math.min(maxDim / bw, maxDim / bh);
      const dw = Math.round(bw * scale);
      const dh = Math.round(bh * scale);
      const dx = Math.round((targetSize - dw) / 2);
      const dy = Math.round((targetSize - dh) / 2);

      outCtx.drawImage(temp, minX, minY, bw, bh, dx, dy, dw, dh);
      return out.toDataURL('image/png');
    }

    return {
      crystal_sprout_proj: extractItem(0, 0, 256, 512, 128, 8),
      crystal_moth_proj: extractItem(256, 0, 256, 512, 128, 8),
      crystal_bat_proj: extractItem(512, 0, 256, 512, 128, 8),
      boss_crystal_dragon_proj: extractItem(768, 0, 256, 512, 160, 10),

      crystal_sprout_impact: extractItem(0, 512, 256, 512, 256, 12),
      crystal_moth_impact: extractItem(256, 512, 256, 512, 256, 12),
      crystal_bat_impact: extractItem(512, 512, 256, 512, 256, 12),
      boss_crystal_dragon_impact: extractItem(768, 512, 256, 512, 320, 14)
    };
  }, b64);

  // Write new transparent files
  const destDir = path.resolve('assets/monsters/map3');
  for (const [k, dataUrl] of Object.entries(sliced)) {
    const fileName = `${k}.png`;
    const dest = path.join(destDir, fileName);
    fs.writeFileSync(dest, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
    console.log('Saved transparent file:', dest);
  }

  await browser.close();
})();
