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

let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { background: #0b1120; color: white; font-family: sans-serif; padding: 20px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.card { background: #1e293b; padding: 10px; border-radius: 8px; border: 1px solid #334155; }
.card-title { font-size: 11px; word-break: break-all; margin-bottom: 6px; color: #38bdf8; }
.views { display: flex; gap: 6px; }
.box { flex: 1; height: 100px; display: flex; align-items: center; justify-content: center; border-radius: 4px; overflow: hidden; }
.dark { background: #162032; }
.green { background: #15803d; }
.checkered { background: repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%) 50% / 16px 16px; }
img { max-width: 90%; max-height: 90%; object-fit: contain; }
</style>
</head>
<body>
<h1>Kiểm Tra Nền Tất Cả Đạn & Vụ Nổ Kỹ Năng</h1>
<div class="grid">
`;

for (const f of skillFiles) {
  if (!fs.existsSync(f)) continue;
  const b64 = 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
  html += `
  <div class="card">
    <div class="card-title">${path.basename(f)}</div>
    <div class="views">
      <div class="box dark"><img src="${b64}"></div>
      <div class="box green"><img src="${b64}"></div>
      <div class="box checkered"><img src="${b64}"></div>
    </div>
  </div>
  `;
}

html += `</div></body></html>`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1600 } });
  await page.setContent(html);
  await page.waitForTimeout(500);
  const out = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/all_skills_preview.png';
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log('Saved all_skills_preview.png');
})();
