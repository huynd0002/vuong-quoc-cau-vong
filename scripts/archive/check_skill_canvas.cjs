const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const skillFiles = [
  'assets/monsters/boss_dragon/dragon_fireball_proj.png',
  'assets/monsters/boss_dragon/dragon_fire_impact.png',
  'assets/monsters/map1/mushroom_proj.png',
  'assets/monsters/map1/mushroom_impact.png',
  'assets/monsters/map1/bee_proj.png',
  'assets/monsters/map1/bee_impact.png',
  'assets/monsters/map1/ladybug_proj.png',
  'assets/monsters/map1/ladybug_impact.png',
  'assets/monsters/map2/mon_crab_proj.png',
  'assets/monsters/map2/mon_crab_impact.png',
  'assets/monsters/map2/mon_starfish_proj.png',
  'assets/monsters/map2/mon_starfish_impact.png',
  'assets/monsters/map2/mon_emerald_crab_proj.png',
  'assets/monsters/map2/mon_emerald_crab_impact.png',
  'assets/monsters/map2/boss_crab_king_proj.png',
  'assets/monsters/map2/boss_crab_king_impact.png',
  'assets/monsters/map3/crystal_sprout_proj.png',
  'assets/monsters/map3/crystal_sprout_impact.png',
  'assets/monsters/map3/crystal_moth_proj.png',
  'assets/monsters/map3/crystal_moth_impact.png',
  'assets/monsters/map3/crystal_bat_proj.png',
  'assets/monsters/map3/crystal_bat_impact.png',
  'assets/monsters/map3/boss_crystal_dragon_proj.png',
  'assets/monsters/map3/boss_crystal_dragon_impact.png'
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = [];
  for (const f of skillFiles) {
    if (!fs.existsSync(f)) {
      results.push({ file: f, status: 'NOT FOUND' });
      continue;
    }
    const b64 = 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
    const info = await page.evaluate(async (dataUri) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const cvs = document.createElement('canvas');
          cvs.width = img.width;
          cvs.height = img.height;
          const ctx = cvs.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          const data = imgData.data;

          let transCount = 0;
          let opaqueCount = 0;
          let semiCount = 0;

          // Corner sample
          const getPixel = (x, y) => {
            const idx = (y * img.width + x) * 4;
            return [data[idx], data[idx+1], data[idx+2], data[idx+3]];
          };

          const corners = [
            getPixel(0, 0),
            getPixel(img.width - 1, 0),
            getPixel(0, img.height - 1),
            getPixel(img.width - 1, img.height - 1)
          ];

          for (let i = 0; i < data.length; i += 4) {
            const a = data[i+3];
            if (a === 0) transCount++;
            else if (a === 255) opaqueCount++;
            else semiCount++;
          }

          resolve({
            width: img.width,
            height: img.height,
            corners,
            transCount,
            opaqueCount,
            semiCount,
            total: img.width * img.height
          });
        };
        img.onerror = () => resolve({ error: 'failed to load' });
        img.src = dataUri;
      });
    }, b64);
    results.push({ file: f, ...info });
  }

  await browser.close();
  for (const r of results) {
    const cornerMaxA = r.corners ? Math.max(...r.corners.map(c => c[3])) : -1;
    const isBad = cornerMaxA > 20 || (r.transCount < 100);
    console.log(r.file, `trans:${r.transCount}/${r.total}`, `cornerA:${cornerMaxA}`, isBad ? '🚨 HAS BACKGROUND / NOT TRANSPARENT' : '✅ OK Clean');
    if (isBad && r.corners) {
      console.log('  Corner RGBA:', JSON.stringify(r.corners));
    }
  }
})();
