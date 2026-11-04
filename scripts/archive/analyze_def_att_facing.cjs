const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BRAIN_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
const defPath = path.join(BRAIN_DIR, 'crystal_monsters_defenses_1793506889049.jpg');
const attPath = path.join(BRAIN_DIR, 'crystal_monsters_attacks_1793506871511.jpg');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const analyzeGrid = async (filePath, label) => {
    const b64 = 'data:image/jpeg;base64,' + fs.readFileSync(filePath).toString('base64');
    return await page.evaluate(async ({ uri, label }) => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = uri; });
      const cvs = document.createElement('canvas');
      cvs.width = img.width; cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, img.width, img.height).data;

      const cells = [
        { name: 'Top-Left (Sprout)', x: 0, y: 0, w: 512, h: 512 },
        { name: 'Top-Right (Moth)', x: 512, y: 0, w: 512, h: 512 },
        { name: 'Bottom-Left (Bat)', x: 0, y: 512, w: 512, h: 512 },
        { name: 'Bottom-Right (Dragon)', x: 512, y: 512, w: 512, h: 512 }
      ];

      const res = [];
      for (const c of cells) {
        let leftDark = 0, rightDark = 0;
        const midX = c.x + c.w / 2;
        for (let y = c.y + 40; y < c.y + c.h * 0.7; y++) {
          for (let x = c.x + 40; x < c.x + c.w - 40; x++) {
            const idx = (y * img.width + x) * 4;
            const r = d[idx], g = d[idx+1], b = d[idx+2];
            // Dark pixel / feature
            if (r < 70 && g < 70 && b < 70) {
              if (x < midX) leftDark++;
              else rightDark++;
            }
          }
        }
        res.push({
          name: c.name,
          leftDark,
          rightDark,
          facing: leftDark > rightDark ? '👈 FACING LEFT (TOWARDS HERO)' : '👉 FACING RIGHT (AWAY FROM HERO)'
        });
      }
      return { label, res };
    }, { uri: b64, label });
  };

  const defRes = await analyzeGrid(defPath, 'DEFENSES (Trạng thái Thủ)');
  console.log(JSON.stringify(defRes, null, 2));

  const attRes = await analyzeGrid(attPath, 'ATTACKS (Trạng thái Công / Skill)');
  console.log(JSON.stringify(attRes, null, 2));

  await browser.close();
})();
