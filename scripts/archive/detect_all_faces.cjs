const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const allMonsters = [
  // Map 1
  { id: 'mushroom', name: 'Nấm Con (Map 1)', idle: 'assets/monsters/map1/mushroom_walk.webp', skill: 'assets/monsters/map1/mushroom_skill.webp' },
  { id: 'bee', name: 'Ong Vàng (Map 1)', idle: 'assets/monsters/map1/bee_walk.webp', skill: 'assets/monsters/map1/bee_skill.webp' },
  { id: 'ladybug', name: 'Bọ Rùa (Map 1)', idle: 'assets/monsters/map1/ladybug_walk.webp', skill: 'assets/monsters/map1/ladybug_skill.webp' },
  { id: 'boss_dragon', name: 'Rồng Thần (Map 1 Boss)', idle: 'assets/monsters/boss_dragon/boss_dragon_idle.webp', skill: 'assets/monsters/boss_dragon/boss_dragon_skill.webp' },
  // Map 2
  { id: 'mon_crab', name: 'Cua Nhỏ (Map 2)', idle: 'assets/monsters/map2/mon_crab_walk.webp', skill: 'assets/monsters/map2/mon_crab_skill.webp' },
  { id: 'mon_starfish', name: 'Sao Biển (Map 2)', idle: 'assets/monsters/map2/mon_starfish_walk.webp', skill: 'assets/monsters/map2/mon_starfish_skill.webp' },
  { id: 'mon_emerald_crab', name: 'Cua Ngọc Bích (Map 2)', idle: 'assets/monsters/map2/mon_emerald_crab_walk.webp', skill: 'assets/monsters/map2/mon_emerald_crab_skill.webp' },
  { id: 'boss_crab_king', name: 'Cua Vua (Map 2 Boss)', idle: 'assets/monsters/map2/boss_crab_king_walk.webp', skill: 'assets/monsters/map2/boss_crab_king_skill.webp' },
  // Map 3
  { id: 'mon_crystal_sprout', name: 'Thạch Nhũ (Map 3)', idle: 'assets/monsters/map3/mon_crystal_sprout_idle.webp', skill: 'assets/monsters/map3/mon_crystal_sprout_skill.webp' },
  { id: 'mon_crystal_moth', name: 'Bướm Đêm (Map 3)', idle: 'assets/monsters/map3/mon_crystal_moth_idle.webp', skill: 'assets/monsters/map3/mon_crystal_moth_skill.webp' },
  { id: 'mon_crystal_bat', name: 'Dơi Pha Lê (Map 3)', idle: 'assets/monsters/map3/mon_crystal_bat_idle.webp', skill: 'assets/monsters/map3/mon_crystal_bat_skill.webp' },
  { id: 'boss_crystal_dragon', name: 'Rồng Pha Lê (Map 3 Boss)', idle: 'assets/monsters/map3/boss_crystal_dragon_idle.webp', skill: 'assets/monsters/map3/boss_crystal_dragon_skill.webp' }
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const m of allMonsters) {
    const analyzeFile = async (filePath) => {
      if (!fs.existsSync(filePath)) return { error: 'not found' };
      const b64 = 'data:image/webp;base64,' + fs.readFileSync(filePath).toString('base64');
      return await page.evaluate(async (uri) => {
        const img = new Image();
        await new Promise(r => { img.onload = r; img.src = uri; });
        const cvs = document.createElement('canvas');
        cvs.width = img.width; cvs.height = img.height;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, img.width, img.height).data;

        // Bounding box
        let minX = img.width, maxX = 0, minY = img.height, maxY = 0;
        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            if (d[(y * img.width + x) * 4 + 3] > 30) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        const midX = (minX + maxX) / 2;
        // Dark pixels (eyes/pupils) in upper half
        const upperYEnd = minY + (maxY - minY) * 0.65;
        let eyeLeft = 0, eyeRight = 0, eyeCount = 0, eyeSumX = 0;
        for (let y = Math.floor(minY); y < upperYEnd; y++) {
          for (let x = minX; x <= maxX; x++) {
            const idx = (y * img.width + x) * 4;
            const r = d[idx], g = d[idx+1], b = d[idx+2], a = d[idx+3];
            if (a > 200 && r < 55 && g < 55 && b < 55) {
              eyeCount++;
              eyeSumX += x;
              if (x < midX) eyeLeft++;
              else eyeRight++;
            }
          }
        }

        return {
          width: img.width,
          height: img.height,
          midX: midX.toFixed(1),
          eyeCount,
          avgEyeX: eyeCount ? (eyeSumX / eyeCount).toFixed(1) : null,
          eyeLeftRatio: eyeCount ? (eyeLeft / eyeCount).toFixed(2) : null
        };
      }, b64);
    };

    const idleRes = await analyzeFile(m.idle);
    const skillRes = await analyzeFile(m.skill);
    console.log(`=== ${m.name} ===`);
    console.log(`  IDLE : midX=${idleRes.midX}, avgEyeX=${idleRes.avgEyeX}, eyeLeftRatio=${idleRes.eyeLeftRatio}`);
    console.log(`  SKILL: midX=${skillRes.midX}, avgEyeX=${skillRes.avgEyeX}, eyeLeftRatio=${skillRes.eyeLeftRatio}`);
  }

  await browser.close();
})();
