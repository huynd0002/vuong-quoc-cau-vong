const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const skillWebpFiles = [
  'assets/monsters/map3/mon_crystal_sprout_skill.webp',
  'assets/monsters/map3/mon_crystal_moth_skill.webp',
  'assets/monsters/map3/mon_crystal_bat_skill.webp',
  'assets/monsters/map3/boss_crystal_dragon_skill.webp'
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const f of skillWebpFiles) {
    const b64 = 'data:image/webp;base64,' + fs.readFileSync(f).toString('base64');
    const cleanedB64 = await page.evaluate(async (uri) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = uri; });
      const cvs = document.createElement('canvas');
      cvs.width = img.width; cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      const d = imgData.data;

      // In the bottom 18% of the sprite, erase any stray noise/pixels
      const cutoffY = Math.floor(img.height * 0.84);
      for (let y = cutoffY; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const idx = (y * img.width + x) * 4;
          d[idx + 3] = 0; // Clear noise
        }
      }
      ctx.putImageData(imgData, 0, 0);
      return cvs.toDataURL('image/webp', 0.95);
    }, b64);

    fs.writeFileSync(f, Buffer.from(cleanedB64.replace(/^data:image\/webp;base64,/, ''), 'base64'));
    console.log('Cleaned noise from:', f);
  }

  await browser.close();
})();
