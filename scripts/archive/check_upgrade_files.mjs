import fs from 'node:fs';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const files = [
  'assets/hero/sau_upgrade/hero_upgrade_idle_right.png',
  'assets/hero/sau_upgrade/hero_upgrade_idle_right.webp',
  'assets/hero/sau_upgrade/hero_upgrade_action.webp',
  'assets/hero/sau_upgrade/hero_upgrade_hit.webp',
  'assets/hero/sau_upgrade/hero_upgrade_celebrate.webp'
];

for (const f of files) {
  const b64 = fs.readFileSync(f).toString('base64');
  const mime = f.endsWith('.png') ? 'image/png' : 'image/webp';
  const res = await page.evaluate(async ({ b64, mime }) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = `data:${mime};base64,` + b64; });
    return { w: img.width, h: img.height };
  }, { b64, mime });
  console.log(f, res);
}

await browser.close();
