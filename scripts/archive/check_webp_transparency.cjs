const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const skillWebpFiles = [
  'assets/monsters/map1/mushroom_walk.webp',
  'assets/monsters/map1/mushroom_skill.webp',
  'assets/monsters/map1/bee_walk.webp',
  'assets/monsters/map1/bee_skill.webp',
  'assets/monsters/map1/ladybug_walk.webp',
  'assets/monsters/map1/ladybug_skill.webp',
  'assets/monsters/boss_dragon/boss_dragon_idle.webp',
  'assets/monsters/boss_dragon/boss_dragon_skill.webp',
  'assets/monsters/map2/mon_crab_walk.webp',
  'assets/monsters/map2/mon_crab_skill.webp',
  'assets/monsters/map2/mon_starfish_walk.webp',
  'assets/monsters/map2/mon_starfish_skill.webp',
  'assets/monsters/map2/mon_emerald_crab_walk.webp',
  'assets/monsters/map2/mon_emerald_crab_skill.webp',
  'assets/monsters/map2/boss_crab_king_walk.webp',
  'assets/monsters/map2/boss_crab_king_skill.webp',
  'assets/monsters/map3/mon_crystal_sprout_walk.webp',
  'assets/monsters/map3/mon_crystal_sprout_skill.webp',
  'assets/monsters/map3/mon_crystal_moth_walk.webp',
  'assets/monsters/map3/mon_crystal_moth_skill.webp',
  'assets/monsters/map3/mon_crystal_bat_walk.webp',
  'assets/monsters/map3/mon_crystal_bat_skill.webp',
  'assets/monsters/map3/boss_crystal_dragon_walk.webp',
  'assets/monsters/map3/boss_crystal_dragon_skill.webp'
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  for (const f of skillWebpFiles) {
    if (!fs.existsSync(f)) {
      console.log(f, 'MISSING');
      continue;
    }
    const b64 = 'data:image/webp;base64,' + fs.readFileSync(f).toString('base64');
    const info = await page.evaluate(async (uri) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = uri; });
      const cvs = document.createElement('canvas');
      cvs.width = img.width; cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, img.width, img.height).data;
      const p = (x, y) => { const i = (y*img.width+x)*4; return [d[i], d[i+1], d[i+2], d[i+3]]; };
      let opaque = 0, trans = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i+3] === 0) trans++;
        else if (d[i+3] === 255) opaque++;
      }
      return {
        w: img.width, h: img.height, trans, opaque, total: img.width * img.height,
        tl: p(0,0), tr: p(img.width-1, 0), bl: p(0, img.height-1), br: p(img.width-1, img.height-1)
      };
    }, b64);
    const cornerOpaque = [info.tl, info.tr, info.bl, info.br].some(c => c[3] > 20);
    console.log(f, 'trans:', info.trans, '/', info.total, cornerOpaque ? '🚨 CORNER NOT TRANSPARENT' : '✅ CORNER TRANSPARENT', info.tl);
  }
  await browser.close();
})();
