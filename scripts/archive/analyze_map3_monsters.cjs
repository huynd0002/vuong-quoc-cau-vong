const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const map3Monsters = [
  { name: 'Crystal Sprout Walk', file: 'assets/monsters/map3/mon_crystal_sprout_walk.webp' },
  { name: 'Crystal Sprout Skill', file: 'assets/monsters/map3/mon_crystal_sprout_skill.webp' },
  { name: 'Crystal Moth Walk', file: 'assets/monsters/map3/mon_crystal_moth_walk.webp' },
  { name: 'Crystal Moth Skill', file: 'assets/monsters/map3/mon_crystal_moth_skill.webp' },
  { name: 'Crystal Bat Walk', file: 'assets/monsters/map3/mon_crystal_bat_walk.webp' },
  { name: 'Crystal Bat Skill', file: 'assets/monsters/map3/mon_crystal_bat_skill.webp' },
  { name: 'Crystal Dragon Walk', file: 'assets/monsters/map3/boss_crystal_dragon_walk.webp' },
  { name: 'Crystal Dragon Skill', file: 'assets/monsters/map3/boss_crystal_dragon_skill.webp' }
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const m of map3Monsters) {
    const b64 = 'data:image/webp;base64,' + fs.readFileSync(m.file).toString('base64');
    const analysis = await page.evaluate(async (uri) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = uri; });
      const cvs = document.createElement('canvas');
      cvs.width = img.width; cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, img.width, img.height).data;

      // Find non-transparent bounding box
      let minX = img.width, maxX = 0, minY = img.height, maxY = 0;
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const a = d[(y * img.width + x) * 4 + 3];
          if (a > 30) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      // Check center of mass of non-transparent pixels
      let leftWeight = 0, rightWeight = 0;
      const midX = (minX + maxX) / 2;
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const a = d[(y * img.width + x) * 4 + 3];
          if (a > 30) {
            if (x < midX) leftWeight++;
            else rightWeight++;
          }
        }
      }

      return {
        w: img.width, h: img.height,
        bbox: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY },
        leftWeight, rightWeight,
        ratio: (leftWeight / (leftWeight + rightWeight)).toFixed(3)
      };
    }, b64);
    console.log(m.name, analysis);
  }
  await browser.close();
})();
