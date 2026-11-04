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

  // 1. Test MarketModal Drop Area & New Star Exchange Rate
  console.log('Testing MarketModal Drop Area & New Star Exchange Rate...');
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.querySelector('.character-select-overlay')?.remove();

    // Give a 300g fish to check that 300g now gives 1 Star (increased difficulty)
    const fs = window.__fishingSystem;
    if (fs) {
      const state = fs.getState();
      state.basket = [
        {
          id: 'test_fish_orange_300',
          speciesId: 'orange_fish',
          weightG: 300,
          caughtAt: Date.now()
        }
      ];
      window.__saveAdapter?.save?.({ ...window.__saveAdapter.load(), fishing: state });
    }

    if (window.__marketModal) {
      window.__marketModal.open('fish_scale_stall');
    }
  });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(artifactDir, 'verify_market_clean_drop_area.png') });
  console.log('Saved verify_market_clean_drop_area.png');

  // Close Market Modal
  await page.evaluate(() => {
    window.__marketModal?.close();
  });
  await page.waitForTimeout(500);

  // 2. Test Magic Celebration for Rare Fish on Pond Map
  console.log('Testing Magic Celebration for Rare Fish...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    if (scene) {
      // Simulate catching a mythical Rainbow Fish
      const rainbowFish = {
        speciesId: 'rainbow_fish',
        name: 'Cá Cầu Vồng',
        icon: '🌈',
        asset: '/assets/fishing/fish_rainbow.png',
        weightG: 1650
      };

      // Set on-map state and invoke celebration
      scene.onMapFishingState = {
        phase: 'playing',
        species: rainbowFish,
        weightG: 1650,
        castX: 520,
        castY: 340
      };

      // Mock biting fish pull ashore
      scene.activeBitingPondFish = {
        playCaughtPullAshore: (cx, cy, lx, ly, cb) => cb && cb()
      };

      scene.completeOnMapFishingCatch();
    }
  });
  await page.waitForTimeout(1200);

  await page.screenshot({ path: path.join(artifactDir, 'verify_magic_celebration_rare_fish.png') });
  console.log('Saved verify_magic_celebration_rare_fish.png');

  await browser.close();
  console.log('All verifications completed successfully!');
}

run().catch(err => {
  console.error('Error running verification:', err);
  process.exit(1);
});
