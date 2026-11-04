import { chromium } from 'playwright';
import { createServer } from 'vite';
import assert from 'node:assert/strict';

const port = 4199;
const server = await createServer({
  server: { host: '127.0.0.1', port, strictPort: true }
});
await server.listen();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

try {
  console.log('--- 1. Verification of CharacterSelectModal ---');
  await page.goto(`http://127.0.0.1:${port}/dev.html`);

  const startBtn = page.locator('#char-btn-start-adventure');
  await startBtn.waitFor({ state: 'visible', timeout: 20000 });

  // Take screenshot of Character Select Modal
  await page.screenshot({ path: 'artifacts/verify_character_select_clean.png' });
  console.log('Screenshot saved: artifacts/verify_character_select_clean.png');

  // Verify character card 2 name is Bé Sam Kuromi
  const char2Name = await page.locator('.knight-card .char-name').textContent();
  console.log('Character 2 Name:', char2Name);
  assert.equal(char2Name.trim(), 'Bé Sam Kuromi', 'Character 2 name must be Bé Sam Kuromi');

  const char2Badge = await page.locator('.knight-card .char-card-badge').textContent();
  console.log('Character 2 Badge:', char2Badge);
  assert.ok(char2Badge.includes('BÉ SAM KUROMI'), 'Badge must include BÉ SAM KUROMI');

  // Verify Start Adventure Button
  const startBtnText = await startBtn.textContent();
  console.log('Start Button Content:', startBtnText);
  assert.ok(startBtnText.includes('BẮT ĐẦU PHIÊU LƯU'));

  // Click start adventure to enter game
  await startBtn.click();
  await page.waitForTimeout(1000);

  // If story modal shows, start it
  const storyStartBtn = page.locator('#story-start-button');
  if (await storyStartBtn.isVisible()) {
    await storyStartBtn.click();
    await page.waitForTimeout(1000);
  }

  console.log('--- 2. Verification of Topbar and Quick Actions on Map ---');
  // Wait for canvas to load
  await page.waitForFunction(() => window.__worldScene?.pet?.sprite?.active, null, { timeout: 25000 });

  // Topbar verification
  const bagVisible = await page.locator('#btn-open-bag').isVisible();
  const mazeVisible = await page.locator('#btn-open-maze').isVisible();
  const kitchenStatusVisible = await page.locator('#kitchen-status').isVisible();

  console.log('Topbar #btn-open-bag visible:', bagVisible);
  console.log('Topbar #btn-open-maze visible:', mazeVisible);
  console.log('Topbar #kitchen-status visible:', kitchenStatusVisible);

  assert.equal(bagVisible, false, 'Bag button in topbar must be hidden');
  assert.equal(mazeVisible, false, 'Maze button in topbar must be hidden');
  assert.equal(kitchenStatusVisible, false, 'Kitchen status text below Vào Bếp must be hidden');

  // Quick actions verification
  const testEncounterVisible = await page.locator('#test-encounter').isVisible();
  const testBossVisible = await page.locator('#test-boss').isVisible();
  const testPortalVisible = await page.locator('#btn-test-portal').isVisible();
  const testPetFarmVisible = await page.locator('#btn-quick-pet-farm').isVisible();
  const mapBtnVisible = await page.locator('#btn-open-map').isVisible();
  const questionBtnVisible = await page.locator('#btn-quick-add-question').isVisible();

  console.log('Quick action #test-encounter visible:', testEncounterVisible);
  console.log('Quick action #test-boss visible:', testBossVisible);
  console.log('Quick action #btn-test-portal visible:', testPortalVisible);
  console.log('Quick action #btn-quick-pet-farm visible:', testPetFarmVisible);
  console.log('Quick action #btn-open-map (Bản đồ 6 Vùng) visible:', mapBtnVisible);
  console.log('Quick action #btn-quick-add-question (Thêm Câu Hỏi) visible:', questionBtnVisible);

  assert.equal(testEncounterVisible, false, 'Test encounter must be hidden');
  assert.equal(testBossVisible, false, 'Test boss must be hidden');
  assert.equal(testPortalVisible, false, 'Test portal must be hidden');
  assert.equal(testPetFarmVisible, false, 'Test pet farm quick btn must be hidden');
  assert.equal(mapBtnVisible, true, 'Bản đồ 6 Vùng must be visible');
  assert.equal(questionBtnVisible, true, 'Thêm Câu Hỏi must be visible');

  await page.screenshot({ path: 'artifacts/verify_map_topbar_clean.png' });
  console.log('Screenshot saved: artifacts/verify_map_topbar_clean.png');

  console.log('--- 3. Verification of Kitchen Recipe Preview Flyout Alignment ---');
  // Dispatch open kitchen modal event directly
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'recipes' } }));
  });
  await page.waitForFunction(() => !document.getElementById('kitchen-modal').hidden, null, { timeout: 10000 });
  await page.waitForSelector('.kitchen-recipe', { timeout: 10000 });

  // Hover over first recipe (Sữa chua trái cây)
  const firstRecipe = page.locator('.kitchen-recipe').first();
  await firstRecipe.hover();
  await page.waitForTimeout(600);

  const flyout = firstRecipe.locator('.dish-hover-flyout');
  const flyoutBox = await flyout.boundingBox();
  const modalBox = await page.locator('#kitchen-modal .kitchen-room').boundingBox();

  console.log('Modal box:', modalBox);
  console.log('Flyout box:', flyoutBox);

  // Verify flyout stays strictly within modal boundaries
  assert.ok(flyoutBox.y >= modalBox.y - 5, `Flyout top (${flyoutBox.y}) must not overflow modal top (${modalBox.y})`);
  assert.ok(flyoutBox.x >= modalBox.x - 5, `Flyout left (${flyoutBox.x}) must not overflow modal left (${modalBox.x})`);

  await page.screenshot({ path: 'artifacts/verify_recipe_flyout_aligned.png' });
  console.log('Screenshot saved: artifacts/verify_recipe_flyout_aligned.png');

  console.log('--- 4. Verification of Fridge Modal Clean UI ---');
  // Open fridge tab
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'fridge' } }));
  });
  await page.waitForTimeout(600);

  // Check top header wallet duplicate
  const fridgeTopWalletVisible = await page.locator('#kitchen-modal #kitchen-wallet').isVisible();
  console.log('Fridge top wallet visible:', fridgeTopWalletVisible);
  assert.equal(fridgeTopWalletVisible, false, 'Top header wallet must be hidden in fridge mode');

  // Check bottom bar
  const fridgeBottomBarCount = await page.locator('.fridge-bottom-bar').count();
  const fridgeBottomBarVisible = fridgeBottomBarCount > 0 ? await page.locator('.fridge-bottom-bar').isVisible() : false;
  console.log('Fridge bottom bar visible:', fridgeBottomBarVisible);
  assert.equal(fridgeBottomBarVisible, false, 'Bottom close bar must be hidden in fridge mode');

  await page.screenshot({ path: 'artifacts/verify_fridge_clean.png' });
  console.log('Screenshot saved: artifacts/verify_fridge_clean.png');

  // Close kitchen modal
  await page.evaluate(() => window.__kitchenModal.close());
  await page.waitForTimeout(500);

  console.log('--- 5. Verification of Kitchen Floor (Clean Floor Without Smudges) ---');
  // Restart scene with map_kitchen
  await page.evaluate(() => {
    window.__worldScene.scene.restart({ mapId: 'map_kitchen' });
  });
  await page.waitForTimeout(2000);

  // If sink popup appeared, dismiss it
  const dismissBtn = page.locator('#btn-sink-dismiss');
  if (await dismissBtn.isVisible()) {
    await dismissBtn.click();
    await page.waitForTimeout(800);
  }

  // Verify station auras are null
  const aurasCount = await page.evaluate(() => {
    const scene = window.__worldScene;
    if (!scene?.kitchenStationContainers) return -1;
    return scene.kitchenStationContainers.filter(c => c.aura != null).length;
  });
  console.log('Active kitchen station floor auras count:', aurasCount);
  assert.equal(aurasCount, 0, 'All kitchen station floor auras must be null (no floor smudges)');

  await page.screenshot({ path: 'artifacts/verify_kitchen_clean_floor.png' });
  console.log('Screenshot saved: artifacts/verify_kitchen_clean_floor.png');

  console.log('====================================');
  console.log(' ALL 5 VERIFICATIONS PASSED 100%!  ');
  console.log('====================================');
} finally {
  await browser.close();
  await server.close();
}
