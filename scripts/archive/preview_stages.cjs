const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const testMonsters = [
  { id: 'enc_map1_1', name: 'Nấm Con (Map 1)', file: 'scratch/stage_mushroom.png' },
  { id: 'enc_map1_2', name: 'Ong Vàng (Map 1)', file: 'scratch/stage_bee.png' },
  { id: 'enc_map1_3', name: 'Bọ Rùa (Map 1)', file: 'scratch/stage_ladybug.png' },
  { id: 'boss_map1', name: 'Rồng Thần (Map 1 Boss)', file: 'scratch/stage_boss_dragon.png' },
  { id: 'enc_map2_1', name: 'Cua Nhỏ (Map 2)', file: 'scratch/stage_mon_crab.png' },
  { id: 'enc_map2_2', name: 'Sao Biển (Map 2)', file: 'scratch/stage_mon_starfish.png' },
  { id: 'enc_map2_3', name: 'Cua Ngọc Bích (Map 2)', file: 'scratch/stage_mon_emerald_crab.png' },
  { id: 'boss_map2', name: 'Cua Vua (Map 2 Boss)', file: 'scratch/stage_boss_crab_king.png' },
  { id: 'enc_map3_1', name: 'Thạch Nhũ (Map 3)', file: 'scratch/stage_mon_crystal_sprout.png' },
  { id: 'enc_map3_2', name: 'Bướm Đêm (Map 3)', file: 'scratch/stage_mon_crystal_moth.png' },
  { id: 'enc_map3_3', name: 'Dơi Pha Lê (Map 3)', file: 'scratch/stage_mon_crystal_bat.png' },
  { id: 'boss_map3', name: 'Rồng Pha Lê (Map 3 Boss)', file: 'scratch/stage_boss_crystal_dragon.png' }
];

let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { background: #0f172a; color: white; font-family: sans-serif; padding: 20px; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.card { background: #1e293b; padding: 12px; border-radius: 8px; }
img { width: 100%; border-radius: 6px; }
h3 { margin-top: 0; color: #38bdf8; }
</style>
</head>
<body>
<h1>12 Sàn Đấu Trực Tiếp (Hero ở TRÁI, Quái vật ở PHẢI)</h1>
<div class="grid">
`;

for (const m of testMonsters) {
  const b64 = 'data:image/png;base64,' + fs.readFileSync(m.file).toString('base64');
  html += `
  <div class="card">
    <h3>${m.name}</h3>
    <img src="${b64}">
  </div>
  `;
}

html += `</div></body></html>`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 2800 } });
  await page.setContent(html);
  await page.waitForTimeout(500);
  const out = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/all_stages_preview.png';
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log('Saved all_stages_preview.png');
})();
