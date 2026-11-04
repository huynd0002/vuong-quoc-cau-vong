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

  // Switch to map_rainbow_market
  console.log('Switching to map_rainbow_market...');
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.querySelector('.character-select-overlay')?.remove();
    if (window.__worldScene?.scene) {
      window.__worldScene.scene.restart({ mapId: 'map_rainbow_market' });
    }
  });
  await page.waitForTimeout(3000);

  // Take screenshot of map_rainbow_market showing both buttons with text
  await page.screenshot({ path: path.join(artifactDir, 'verify_market_text_buttons.png') });
  console.log('Saved verify_market_text_buttons.png');

  // Open Market Modal to check updated tabs
  console.log('Opening Market Modal to check updated tabs...');
  await page.evaluate(() => {
    if (window.__marketModal) {
      window.__marketModal.open('rod_bait_stall');
    }
  });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(artifactDir, 'verify_market_modal_text_tabs.png') });
  console.log('Saved verify_market_modal_text_tabs.png');

  await browser.close();
  console.log('Verification completed successfully!');
}

run().catch(err => {
  console.error('Error running verification:', err);
  process.exit(1);
});
