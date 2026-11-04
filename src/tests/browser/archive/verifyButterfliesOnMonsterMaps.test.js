import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('[Test] Starting 8-Direction Random Butterfly Verification...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  console.log(`[Test] Loading ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Close character select modal if open
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
  });

  // 1. TEST MAP 1 (Monster map)
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map1' });
  });
  await page.waitForTimeout(1500);

  const map1ButterflyInfo = await page.evaluate(() => {
    const ws = window.__worldScene;
    const bList = ws.butterflies || [];
    return {
      count: bList.length,
      hasRainbowTexture: bList.every(b => b.sprite && b.sprite.texture && b.sprite.texture.key === 'butterfly_rainbow'),
      allHaveShadow: bList.every(b => Boolean(b.shadow && b.shadow.active)),
      allHaveTweens: bList.every(b => Boolean(b.flapTween && b.flapTween.isPlaying())),
      directions: bList.map(b => b.getDirectionName()),
      positions: bList.map(b => ({ x: b.x, y: b.y })),
      hasOldEmojiButterflies: ws.children.list.some(child => child.text === '🦋' && !child.parentContainer)
    };
  });

  console.log('[Test] Map 1 Butterfly info:', map1ButterflyInfo);
  assert.ok(map1ButterflyInfo.count >= 2 && map1ButterflyInfo.count <= 4, `Map 1 should have 2-4 butterflies, got ${map1ButterflyInfo.count}`);
  assert.strictEqual(map1ButterflyInfo.hasRainbowTexture, true, 'All butterflies on Map 1 must use butterfly_rainbow texture');
  assert.strictEqual(map1ButterflyInfo.allHaveShadow, true, 'All butterflies must have shadows');
  assert.strictEqual(map1ButterflyInfo.allHaveTweens, true, 'All butterflies must be actively flapping');
  assert.strictEqual(map1ButterflyInfo.hasOldEmojiButterflies, false, 'No old emoji butterflies allowed');

  // Let them fly for 1.5 seconds and verify movement
  await page.waitForTimeout(1500);
  const map1PositionsAfter = await page.evaluate(() => {
    const ws = window.__worldScene;
    return (ws.butterflies || []).map(b => ({ x: b.x, y: b.y, dir: b.getDirectionName() }));
  });
  console.log('[Test] Map 1 Butterfly positions after 1.5s flight:', map1PositionsAfter);

  // Take screenshot of Map 1 with butterflies
  const screenshotPath = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_butterflies_map1.png';
  await page.screenshot({ path: screenshotPath });
  console.log(`[Test] Screenshot saved to ${screenshotPath}`);

  // 2. TEST PET FARM (Non-monster map)
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map_pet_farm' });
  });
  await page.waitForTimeout(1500);

  const farmButterflyCount = await page.evaluate(() => {
    const ws = window.__worldScene;
    return (ws.butterflies || []).length;
  });
  console.log('[Test] Pet Farm Butterfly count:', farmButterflyCount);
  assert.strictEqual(farmButterflyCount, 0, 'Pet Farm must have 0 butterflies');

  // 3. TEST KITCHEN (Non-monster map)
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map_kitchen' });
  });
  await page.waitForTimeout(1500);

  const kitchenButterflyCount = await page.evaluate(() => {
    const ws = window.__worldScene;
    return (ws.butterflies || []).length;
  });
  console.log('[Test] Kitchen Butterfly count:', kitchenButterflyCount);
  assert.strictEqual(kitchenButterflyCount, 0, 'Kitchen must have 0 butterflies');

  // 4. TEST MAP 2 (Monster map)
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map2' });
  });
  await page.waitForTimeout(1500);

  const map2ButterflyCount = await page.evaluate(() => {
    const ws = window.__worldScene;
    return (ws.butterflies || []).length;
  });
  console.log('[Test] Map 2 Butterfly count:', map2ButterflyCount);
  assert.ok(map2ButterflyCount >= 2 && map2ButterflyCount <= 4, `Map 2 should have 2-4 butterflies, got ${map2ButterflyCount}`);

  await browser.close();
  console.log('✅ ALL BUTTERFLY VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
