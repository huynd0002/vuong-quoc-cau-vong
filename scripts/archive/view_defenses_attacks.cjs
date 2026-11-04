const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BRAIN_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
const defPath = path.join(BRAIN_DIR, 'crystal_monsters_defenses_1793506889049.jpg');
const attPath = path.join(BRAIN_DIR, 'crystal_monsters_attacks_1793506871511.jpg');

let html = `<!DOCTYPE html>
<html>
<body style="background:#1e293b;color:white;font-family:sans-serif;padding:20px;">
<h2>crystal_monsters_defenses (Trạng thái Thủ)</h2>
<img src="data:image/jpeg;base64,${fs.readFileSync(defPath).toString('base64')}" style="max-width:800px;border:3px solid #22c55e;">
<h2>crystal_monsters_attacks (Trạng thái Công / Skill)</h2>
<img src="data:image/jpeg;base64,${fs.readFileSync(attPath).toString('base64')}" style="max-width:800px;border:3px solid #ef4444;">
</body>
</html>`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 2200 } });
  await page.setContent(html);
  await page.waitForTimeout(500);
  const out = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/defenses_and_attacks_view.png';
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log('Saved defenses_and_attacks_view.png');
})();
