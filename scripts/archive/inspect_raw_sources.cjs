const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BRAIN_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
const rawFiles = [
  'crystal_monsters_attacks_1793506871511.jpg',
  'crystal_monsters_defenses_1793506889049.jpg',
  'crystal_projectiles_and_impacts_1793506904462.jpg'
];

let html = `<!DOCTYPE html>
<html>
<body style="background:#222;color:#fff;font-family:sans-serif;">
`;

for (const rf of rawFiles) {
  const p = path.join(BRAIN_DIR, rf);
  if (!fs.existsSync(p)) continue;
  const b64 = 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64');
  html += `<h2>${rf}</h2><img src="${b64}" style="max-width:800px;border:2px solid red;"><br>`;
}

html += `</body></html>`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 3200 } });
  await page.setContent(html);
  await page.waitForTimeout(500);
  const out = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/raw_source_inspection.png';
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log('Saved raw_source_inspection.png');
})();
