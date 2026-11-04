const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const monsters = [
  { name: 'Nấm Con (Map 1)', hit: 'assets/monsters/map1/mushroom_hit.webp' },
  { name: 'Ong Vàng (Map 1)', hit: 'assets/monsters/map1/bee_hit.webp' },
  { name: 'Bọ Rùa (Map 1)', hit: 'assets/monsters/map1/ladybug_hit.webp' },
  { name: 'Rồng Thần (Map 1 Boss)', hit: 'assets/monsters/boss_dragon/boss_dragon_hit.webp' },
  { name: 'Cua Nhỏ (Map 2)', hit: 'assets/monsters/map2/mon_crab_hit.webp' },
  { name: 'Sao Biển (Map 2)', hit: 'assets/monsters/map2/mon_starfish_hit.webp' },
  { name: 'Cua Ngọc Bích (Map 2)', hit: 'assets/monsters/map2/mon_emerald_crab_hit.webp' },
  { name: 'Cua Vua (Map 2 Boss)', hit: 'assets/monsters/map2/boss_crab_king_hit.webp' },
  { name: 'Thạch Nhũ (Map 3)', hit: 'assets/monsters/map3/mon_crystal_sprout_hit.webp' },
  { name: 'Bướm Đêm (Map 3)', hit: 'assets/monsters/map3/mon_crystal_moth_hit.webp' },
  { name: 'Dơi Pha Lê (Map 3)', hit: 'assets/monsters/map3/mon_crystal_bat_hit.webp' },
  { name: 'Rồng Pha Lê (Map 3 Boss)', hit: 'assets/monsters/map3/boss_crystal_dragon_hit.webp' }
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const m of monsters) {
    if (!fs.existsSync(m.hit)) {
      console.log(m.name, 'MISSING HIT FILE');
      continue;
    }
    const b64 = 'data:image/webp;base64,' + fs.readFileSync(m.hit).toString('base64');
    const res = await page.evaluate(async (uri) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = uri; });
      const cvs = document.createElement('canvas');
      cvs.width = img.width; cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, img.width, img.height).data;

      let minX = img.width, maxX = 0;
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          if (d[(y * img.width + x) * 4 + 3] > 30) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
          }
        }
      }

      const midX = (minX + maxX) / 2;
      let leftDark = 0, rightDark = 0;
      for (let y = 0; y < img.height * 0.7; y++) {
        for (let x = minX; x <= maxX; x++) {
          const idx = (y * img.width + x) * 4;
          if (d[idx+3] > 180 && d[idx] < 60 && d[idx+1] < 60 && d[idx+2] < 60) {
            if (x < midX) leftDark++;
            else rightDark++;
          }
        }
      }
      return { leftDark, rightDark, facing: leftDark >= rightDark ? '👈 FACING LEFT' : '👉 FACING RIGHT' };
    }, b64);
    console.log(m.name, res);
  }

  await browser.close();
})();
