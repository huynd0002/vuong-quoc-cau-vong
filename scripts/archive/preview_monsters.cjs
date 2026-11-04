const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  let html = fs.readFileSync('scratch/preview_monsters.html', 'utf8');
  
  // replace image paths with base64 data URIs so they load via setContent
  const imgRegex = /src="([^"]+)"/g;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    let filePath = src;
    if (src.startsWith('/')) {
      filePath = '.' + src;
    }
    const resolved = path.resolve(filePath);
    if (fs.existsSync(resolved)) {
      const ext = path.extname(resolved).slice(1);
      const mime = ext === 'webp' ? 'image/webp' : (ext === 'png' ? 'image/png' : 'image/jpeg');
      const b64 = `data:${mime};base64,` + fs.readFileSync(resolved).toString('base64');
      html = html.split(src).join(b64);
    }
  }

  await page.setContent(html);
  await page.waitForTimeout(500);
  const outPath = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/preview_monster_directions.png';
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  console.log('Saved screenshot to:', outPath);
})();
