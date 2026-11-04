const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const heroSkin = 'assets/skins/sam_kuromi_idle_right.webp';

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

function toB64(fileRel) {
  const p = path.resolve(fileRel);
  if (!fs.existsSync(p)) return '';
  return 'data:image/webp;base64,' + fs.readFileSync(p).toString('base64');
}

const heroB64 = toB64(heroSkin);

let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { background: #0f172a; color: white; font-family: system-ui, sans-serif; padding: 20px; }
.hero-header { display: flex; align-items: center; justify-content: center; gap: 20px; background: #1e293b; padding: 12px; border-radius: 12px; margin-bottom: 24px; }
.hero-header img { width: 80px; height: 80px; object-fit: contain; }
.container { display: flex; flex-direction: column; gap: 24px; max-width: 1400px; margin: 0 auto; }
.monster-row { background: #1e293b; border-radius: 12px; padding: 16px; border: 1px solid #334155; }
.monster-title { font-size: 18px; font-weight: bold; color: #38bdf8; margin-bottom: 12px; }
.battle-pairs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.battle-stage { background: #0b1120; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; align-items: center; }
.stage-label { font-size: 13px; font-weight: bold; margin-bottom: 8px; }
.stage-view { width: 100%; height: 140px; display: flex; align-items: center; justify-content: space-around; background: linear-gradient(180deg, #1e3a8a 0%, #172554 100%); border-radius: 6px; position: relative; overflow: hidden; }
.hero-avatar { width: 80px; height: 80px; object-fit: contain; }
.mon-avatar { width: 90px; height: 90px; object-fit: contain; }
</style>
</head>
<body>
<div class="hero-header">
  <img src="${heroB64}" alt="Bé Sâu">
  <div>
    <h2>Bé Sâu luôn đứng bên TRÁI quay mặt sang PHẢI (👉)</h2>
    <p>Quái vật phải đứng bên PHẢI và quay mặt sang TRÁI (👈) để nhìn thẳng vào Bé Sâu khi thi đấu</p>
  </div>
</div>
<div class="container">
`;

for (const m of allMonsters) {
  const idleB64 = toB64(m.idle);
  const skillB64 = toB64(m.skill);

  html += `
  <div class="monster-row">
    <div class="monster-title">${m.name}</div>
    <div class="battle-pairs">
      
      <div class="battle-stage">
        <div class="stage-label" style="color:#60a5fa">Tùy chọn A: Idle (none)</div>
        <div class="stage-view">
          <img class="hero-avatar" src="${heroB64}">
          <img class="mon-avatar" src="${idleB64}" style="transform: none;">
        </div>
      </div>

      <div class="battle-stage">
        <div class="stage-label" style="color:#34d399">Tùy chọn B: Idle (scaleX(-1))</div>
        <div class="stage-view">
          <img class="hero-avatar" src="${heroB64}">
          <img class="mon-avatar" src="${idleB64}" style="transform: scaleX(-1);">
        </div>
      </div>

      <div class="battle-stage">
        <div class="stage-label" style="color:#f59e0b">Tùy chọn C: Skill (none)</div>
        <div class="stage-view">
          <img class="hero-avatar" src="${heroB64}">
          <img class="mon-avatar" src="${skillB64}" style="transform: none;">
        </div>
      </div>

      <div class="battle-stage">
        <div class="stage-label" style="color:#ec4899">Tùy chọn D: Skill (scaleX(-1))</div>
        <div class="stage-view">
          <img class="hero-avatar" src="${heroB64}">
          <img class="mon-avatar" src="${skillB64}" style="transform: scaleX(-1);">
        </div>
      </div>

    </div>
  </div>
  `;
}

html += `</div></body></html>`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 2600 } });
  await page.setContent(html);
  await page.waitForTimeout(600);
  const out = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/facing_comparison.png';
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log('Saved facing_comparison.png');
})();
