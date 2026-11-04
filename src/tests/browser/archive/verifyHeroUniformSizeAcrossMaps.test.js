import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  console.log(`[Test] Loading ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Remove character select modal if visible so it doesn't block interaction
  await page.evaluate(() => {
    const charSelect = document.getElementById('character-select-modal');
    if (charSelect) charSelect.remove();
  });

  const mapsToTest = ['map1', 'map2', 'map_pet_farm', 'map_kitchen'];
  const skinsToTest = ['default', 'knight'];

  for (const skin of skinsToTest) {
    console.log(`\n================ Testing skin: ${skin} ================`);
    const heroSizes = {};

    for (const mapId of mapsToTest) {
      await page.evaluate(({ targetMapId, skinId }) => {
        const phaserGame = window.__PHASER_GAME__;
        const worldScene = phaserGame.scene.getScene('WorldScene');
        if (worldScene) {
          worldScene.scene.restart({ mapId: targetMapId });
        }
      }, { targetMapId: mapId, skinId: skin });

      await page.waitForTimeout(1200);

      // Set skin
      await page.evaluate((skinId) => {
        const phaserGame = window.__PHASER_GAME__;
        const worldScene = phaserGame.scene.getScene('WorldScene');
        if (worldScene?.hero) {
          worldScene.hero.setSkin(skinId);
        }
      }, skin);

      // Simulate warp-complete event
      await page.evaluate((targetMapId) => {
        window.dispatchEvent(new CustomEvent('game:portal-warp-complete', {
          detail: { targetMapId, targetMapName: targetMapId }
        }));
      }, mapId);

      await page.waitForTimeout(400);

      const heroMetrics = await page.evaluate(() => {
        const phaserGame = window.__PHASER_GAME__;
        const worldScene = phaserGame.scene.getScene('WorldScene');
        if (!worldScene || !worldScene.hero || !worldScene.hero.sprite) {
          return null;
        }
        return {
          mapId: worldScene.currentMapId,
          heroSize: worldScene.hero.size,
          heroSkin: worldScene.hero.skin,
          displayWidth: Math.round(worldScene.hero.sprite.displayWidth),
          displayHeight: Math.round(worldScene.hero.sprite.displayHeight),
          scaleX: Number(worldScene.hero.sprite.scaleX.toFixed(3)),
          scaleY: Number(worldScene.hero.sprite.scaleY.toFixed(3)),
          shadowWidth: Math.round(worldScene.hero.shadow.displayWidth),
          shadowHeight: Math.round(worldScene.hero.shadow.displayHeight)
        };
      });

      console.log(`[Test] Map ${mapId} (${skin}) Metrics:`, heroMetrics);
      heroSizes[mapId] = heroMetrics;

      const screenshotPath = `C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_hero_size_${skin}_${mapId}.png`;
      await page.screenshot({ path: screenshotPath });
    }

    const baseline = heroSizes['map1'];
    for (const mapId of mapsToTest) {
      const metrics = heroSizes[mapId];
      if (metrics.displayWidth !== baseline.displayWidth || metrics.displayHeight !== baseline.displayHeight) {
        throw new Error(`Size mismatch for skin ${skin} on ${mapId}: got ${metrics.displayWidth}x${metrics.displayHeight}, expected ${baseline.displayWidth}x${baseline.displayHeight}`);
      }
    }
    console.log(`✓ Skin ${skin} verified: IDENTICAL (${baseline.displayWidth}x${baseline.displayHeight}) across all maps!`);
  }

  console.log('\n✓ ALL SKINS AND MAPS VERIFIED 100% UNIFORM!');
  await browser.close();
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
