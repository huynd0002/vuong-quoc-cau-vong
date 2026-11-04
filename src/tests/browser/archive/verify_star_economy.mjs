import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gameHtmlPath = path.resolve(process.cwd(), 'game.html');
const artifactDir = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  console.log('Navigating to game.html:', gameHtmlPath);
  await page.goto(`file://${gameHtmlPath}`);
  await page.waitForTimeout(3000);

  // Remove onboarding modal and set player stars = 10
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    let save = {};
    try {
      save = JSON.parse(localStorage.getItem('RAINBOW_KINGDOM_V2_SAVE') || '{}');
    } catch {}
    save.player = save.player || {};
    save.player.name = 'Bé Sam';
    save.player.characterId = 'sam';
    save.player.stars = 10;
    save.currentMapId = 'map_rainbow_market';
    localStorage.setItem('RAINBOW_KINGDOM_V2_SAVE', JSON.stringify(save));
  });

  // Open Market Modal
  console.log('Testing Rainbow Market with new rod and bait prices...');
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    if (window.__marketModal) {
      window.__marketModal.open('rod_bait_stall');
    }
  });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(artifactDir, 'verify_market_increased_rod_bait_prices.png') });
  console.log('Saved verify_market_increased_rod_bait_prices.png');

  // Try to click buy rod when not enough stars (stars = 10, Cần Vịt Con = 25)
  console.log('Testing click buy rod with insufficient stars...');
  await page.evaluate(() => {
    const btn = document.querySelector('[data-buy-rod="rod_duck"]');
    if (btn) {
      btn.removeAttribute('disabled');
      btn.click();
    }
  });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(artifactDir, 'verify_market_insufficient_stars_banner.png') });
  console.log('Saved verify_market_insufficient_stars_banner.png');

  await browser.close();
  console.log('Verification completed successfully!');
}

run().catch(err => {
  console.error('Error running verification:', err);
  process.exit(1);
});
