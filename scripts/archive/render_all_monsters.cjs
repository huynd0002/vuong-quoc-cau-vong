const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const monsters = [
  // Map 1
  { name: 'Nấm Con (Map 1)', idle: 'assets/monsters/map1/mushroom_walk.webp', skill: 'assets/monsters/map1/mushroom_skill.webp', flipIdle: true, flipAttack: false },
  { name: 'Ong Vàng (Map 1)', idle: 'assets/monsters/map1/bee_walk.webp', skill: 'assets/monsters/map1/bee_skill.webp', flipIdle: true, flipAttack: false },
  { name: 'Bọ Rùa (Map 1)', idle: 'assets/monsters/map1/ladybug_walk.webp', skill: 'assets/monsters/map1/ladybug_skill.webp', flipIdle: true, flipAttack: false },
  { name: 'Rồng Thần (Map 1 Boss)', idle: 'assets/monsters/boss_dragon/boss_dragon_idle.webp', skill: 'assets/monsters/boss_dragon/boss_dragon_skill.webp', flipIdle: true, flipAttack: false },
  
  // Map 2
  { name: 'Cua Nhỏ (Map 2)', idle: 'assets/monsters/map2/mon_crab_walk.webp', skill: 'assets/monsters/map2/mon_crab_skill.webp', flipIdle: false, flipAttack: false },
  { name: 'Sao Biển (Map 2)', idle: 'assets/monsters/map2/mon_starfish_walk.webp', skill: 'assets/monsters/map2/mon_starfish_skill.webp', flipIdle: false, flipAttack: false },
  { name: 'Cua Ngọc Bích (Map 2)', idle: 'assets/monsters/map2/mon_emerald_crab_walk.webp', skill: 'assets/monsters/map2/mon_emerald_crab_skill.webp', flipIdle: false, flipAttack: false },
  { name: 'Cua Vua (Map 2 Boss)', idle: 'assets/monsters/map2/boss_crab_king_walk.webp', skill: 'assets/monsters/map2/boss_crab_king_skill.webp', flipIdle: false, flipAttack: false },

  // Map 3
  { name: 'Thạch Nhũ (Map 3)', idle: 'assets/monsters/map3/mon_crystal_sprout_walk.webp', skill: 'assets/monsters/map3/mon_crystal_sprout_skill.webp', flipIdle: false, flipAttack: false },
  { name: 'Bướm Đêm (Map 3)', idle: 'assets/monsters/map3/mon_crystal_moth_walk.webp', skill: 'assets/monsters/map3/mon_crystal_moth_skill.webp', flipIdle: false, flipAttack: false },
  { name: 'Dơi Pha Lê (Map 3)', idle: 'assets/monsters/map3/mon_crystal_bat_walk.webp', skill: 'assets/monsters/map3/mon_crystal_bat_skill.webp', flipIdle: false, flipAttack: false },
  { name: 'Rồng Pha Lê (Map 3 Boss)', idle: 'assets/monsters/map3/boss_crystal_dragon_walk.webp', skill: 'assets/monsters/map3/boss_crystal_dragon_skill.webp', flipIdle: false, flipAttack: false }
];

function toB64(fileRel) {
  const p = path.resolve(fileRel);
  if (!fs.existsSync(p)) return '';
  const ext = path.extname(p).slice(1);
  return `data:image/${ext === 'png' ? 'png' : 'webp'};base64,` + fs.readFileSync(p).toString('base64');
}

let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { background: #0f172a; color: white; font-family: system-ui, sans-serif; padding: 20px; }
h1 { text-align: center; color: #38bdf8; }
.hero-ref { text-align: center; margin-bottom: 20px; background: #1e293b; padding: 10px; border-radius: 8px; font-weight: bold; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; max-width: 1400px; margin: 0 auto; }
.card { background: #1e293b; border-radius: 12px; padding: 14px; border: 1px solid #334155; }
.card-title { font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #facc15; }
.columns { display: flex; gap: 12px; }
.box { flex: 1; text-align: center; background: #0b1120; border-radius: 8px; padding: 8px; }
.box-label { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
img { width: 140px; height: 140px; object-fit: contain; }
.current-applied { border: 2px solid #22c55e; border-radius: 6px; }
</style>
</head>
<body>
<h1>Bảng Đối Chiếu Hướng Mặt Quái Vật Trên Đấu Trường (Quái ở bên PHẢI, cần nhìn sang TRÁI về phía Bé Sâu 👈)</h1>
<div class="hero-ref">
  Bé Sâu ở bên TRÁI quay sang PHẢI 👉 | Quái vật ở bên PHẢI PHẢI QUAY SANG TRÁI 👈
</div>
<div class="grid">
`;

for (const m of monsters) {
  const idleB64 = toB64(m.idle);
  const skillB64 = toB64(m.skill);

  html += `
  <div class="card">
    <div class="card-title">${m.name}</div>
    <div class="columns">
      <div class="box ${!m.flipIdle ? 'current-applied' : ''}">
        <div class="box-label">Idle gốc (none) ${!m.flipIdle ? '⭐ Hiện tại' : ''}</div>
        <img src="${idleB64}" style="transform: none;">
      </div>
      <div class="box ${m.flipIdle ? 'current-applied' : ''}">
        <div class="box-label">Idle lật (scaleX(-1)) ${m.flipIdle ? '⭐ Hiện tại' : ''}</div>
        <img src="${idleB64}" style="transform: scaleX(-1);">
      </div>
      <div class="box ${!m.flipAttack ? 'current-applied' : ''}">
        <div class="box-label">Skill gốc (none) ${!m.flipAttack ? '⚡ Hiện tại' : ''}</div>
        <img src="${skillB64}" style="transform: none;">
      </div>
      <div class="box ${m.flipAttack ? 'current-applied' : ''}">
        <div class="box-label">Skill lật (scaleX(-1)) ${m.flipAttack ? '⚡ Hiện tại' : ''}</div>
        <img src="${skillB64}" style="transform: scaleX(-1);">
      </div>
    </div>
  </div>
  `;
}

html += `
</div>
</body>
</html>
`;

fs.writeFileSync('scratch/all_monsters_review.html', html);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1500, height: 2600 } });
  await page.setContent(html);
  await page.waitForTimeout(1000);
  const out = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/all_monsters_review.png';
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log('Saved all monsters review to:', out);
})();
