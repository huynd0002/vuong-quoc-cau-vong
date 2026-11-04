const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const files = [
    { label: 'Moth Idle In Arena', path: 'scratch/actual_arena_moth_idle.png' },
    { label: 'Moth Attack In Arena', path: 'scratch/actual_arena_moth_attack.png' }
  ];

  for (const f of files) {
    const b64 = 'data:image/png;base64,' + fs.readFileSync(f.path).toString('base64');
    const info = await page.evaluate(async (uri) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = uri; });
      const cvs = document.createElement('canvas');
      cvs.width = img.width; cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, img.width, img.height).data;

      let eyeLeft = 0, eyeRight = 0;
      const midX = img.width / 2;
      for (let y = 0; y < img.height * 0.7; y++) {
        for (let x = 0; x < img.width; x++) {
          const idx = (y * img.width + x) * 4;
          const r = d[idx], g = d[idx+1], b = d[idx+2], a = d[idx+3];
          if (a > 180 && r < 55 && g < 55 && b < 55) {
            if (x < midX) eyeLeft++;
            else eyeRight++;
          }
        }
      }
      return { w: img.width, h: img.height, eyeLeft, eyeRight, facing: eyeLeft > eyeRight ? '👈 FACING LEFT (TOWARDS HERO)' : '👉 FACING RIGHT (AWAY FROM HERO)' };
    }, b64);
    console.log(f.label, info);
  }

  await browser.close();
})();
