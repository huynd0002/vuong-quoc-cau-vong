import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const BRAIN_DIR = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5');

async function main() {
  console.log('--- STARTING VERIFICATION: COOKING INGREDIENTS SYNC & 2-MISS FAILURE ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.error(`[Browser PageError]`, err));

  await page.goto('http://127.0.0.1:5173');
  await page.waitForLoadState('networkidle');

  // Inject save state with plenty of stars, washed hands, and initial ingredients
  await page.evaluate(() => {
    localStorage.clear();
    const save = {
      version: 2,
      profileName: 'Bé Yêu',
      player: {
        stars: 300,
        energy: 3,
        hearts: 3,
        unlockedMaps: ['map_1', 'map_2'],
        headBadge: null,
        unlockedBadges: []
      }
    };
    localStorage.setItem('v2_save_data', JSON.stringify(save));
    localStorage.setItem('v2_profile_Bé Yêu', JSON.stringify(save));
    localStorage.setItem('v2_active_profile', 'Bé Yêu');
  });

  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Click start or enter game
  const startBtn = await page.$('.btn-cta-start, #btn-start-game, button:has-text("Bắt đầu"), button:has-text("Tiếp tục")');
  if (startBtn) {
    await startBtn.click();
    await page.waitForTimeout(800);
  }

  // 1. Open Kitchen Modal via window.__kitchenModal
  console.log('1. Opening Kitchen Modal and testing Fridge & Recipe Sync...');
  await page.evaluate(() => {
    const kitchen = window.__kitchenModal;
    if (kitchen) {
      kitchen.system.completeHandWash();
      const save = window.__saveAdapter.load();
      save.player.stars = 500;
      window.__saveAdapter.save(save);
      kitchen.show('fridge');
    }
  });
  await page.waitForTimeout(600);

  // Check 3D ingredient images in Fridge
  const fridgeFoodImages = await page.$$eval('.fridge-food-3d-asset', imgs => imgs.map(img => img.src));
  console.log(`Found ${fridgeFoodImages.length} 3D images in Fridge.`);
  if (fridgeFoodImages.length === 0 || !fridgeFoodImages.some(src => src.includes('/assets/cooking/ingredients/ing_'))) {
    throw new Error('Fridge does not have proper /assets/cooking/ingredients/ing_*.png images!');
  }

  // Switch to Recipes tab
  await page.evaluate(() => {
    window.__kitchenModal.show('recipes');
  });
  await page.waitForTimeout(500);

  // Inspect flyout images in Recipes
  const flyoutImages = await page.$$eval('.flyout-ing-3d-img', imgs => imgs.map(img => img.src));
  console.log(`Found ${flyoutImages.length} 3D ingredient images inside Recipe hover/flyout.`);
  if (flyoutImages.length === 0 || !flyoutImages.some(src => src.includes('/assets/cooking/ingredients/ing_'))) {
    throw new Error('Recipe list does not use synchronized 3D ingredient images!');
  }

  // Save screenshot of Synced Ingredients in Kitchen
  const syncScreenshotPath = path.join(BRAIN_DIR, 'verified_cooking_ingredients_synced.png');
  await page.screenshot({ path: syncScreenshotPath });
  console.log(`Saved screenshot 1: ${syncScreenshotPath}`);

  // Buy ingredients for fruit_yogurt (banana: 2, yogurt: 1)
  console.log('Buying ingredients (banana: 2, yogurt: 1)...');
  await page.evaluate(() => {
    const kitchen = window.__kitchenModal;
    kitchen.system.buy('banana');
    kitchen.system.buy('banana');
    kitchen.system.buy('yogurt');
  });

  // 2. Select a recipe to cook: Fruit Yogurt (fruit_yogurt)
  console.log('2. Entering Cook preparation screen for fruit_yogurt...');
  await page.evaluate(() => {
    const kitchen = window.__kitchenModal;
    kitchen.system.start('fruit_yogurt');
    kitchen.show('cook');
  });
  await page.waitForTimeout(600);

  // Check requirement cards use 3D images
  const cookReqImages = await page.$$eval('.cook-req-3d-img', imgs => imgs.map(img => img.src));
  console.log(`Found ${cookReqImages.length} 3D images in Cook requirements rack:`, cookReqImages);
  if (cookReqImages.length === 0 || !cookReqImages.some(src => src.includes('/assets/cooking/ingredients/ing_'))) {
    throw new Error('Cook requirements rack does not use 3D ingredient images!');
  }

  // Stage ingredients by calling stage on system and re-rendering
  console.log('Staging banana (count: 2) and yogurt (count: 1)...');
  await page.evaluate(() => {
    const kitchen = window.__kitchenModal;
    const session = kitchen.system.getState().session;
    kitchen.system.stage(session.id, 'banana');
    kitchen.system.stage(session.id, 'banana');
    kitchen.system.stage(session.id, 'yogurt');
    kitchen.render();
  });
  await page.waitForTimeout(500);

  // Check staged chips use 3D images
  const stagedChipImages = await page.$$eval('.staged-chip-3d-img', imgs => imgs.map(img => img.src));
  console.log(`Found ${stagedChipImages.length} 3D images in staged chips:`, stagedChipImages);
  if (stagedChipImages.length === 0 || !stagedChipImages.some(src => src.includes('/assets/cooking/ingredients/ing_'))) {
    throw new Error('Staged chips do not use 3D ingredient images!');
  }

  // Verify ready button has "BẮT ĐẦU NẤU"
  const startRhythmBtn = await page.$('button[data-action="start-rhythm"], button.btn-start-cook-audition');
  if (!startRhythmBtn) {
    throw new Error('Start cooking rhythm button not found!');
  }
  await startRhythmBtn.click();
  await page.waitForTimeout(500);

  // Verify Audition UI is visible and Target = 5
  const scoreText = await page.$eval('.audition-score-text', el => el.textContent.trim());
  const missText = await page.$eval('.audition-miss-text', el => el.textContent.trim());
  console.log(`Audition active! Initial Score: ${scoreText}, Initial Misses: ${missText}`);
  if (!scoreText.includes('/5')) {
    throw new Error(`Expected score target of 5 nhịp, got: ${scoreText}`);
  }
  if (!missText.includes('0/2')) {
    throw new Error(`Expected initial miss count of 0/2, got: ${missText}`);
  }

  // 3. Intentionally trigger 2 misses
  console.log('3. Intentionally triggering 1st miss...');
  await page.evaluate(() => {
    const kitchen = window.__kitchenModal;
    kitchen.ballPos = 15; // definitely outside 66-90 red zone
    kitchen.evaluateAuditionHit();
  });
  await page.waitForTimeout(300);

  const missTextAfter1 = await page.$eval('.audition-miss-text', el => el.textContent.trim());
  console.log(`After 1st miss: ${missTextAfter1}`);
  if (!missTextAfter1.includes('1/2')) {
    throw new Error(`Expected miss count to be 1/2, got: ${missTextAfter1}`);
  }

  console.log('Intentionally triggering 2nd miss (should trigger failure & lose staged ingredients)...');
  await page.evaluate(() => {
    const kitchen = window.__kitchenModal;
    kitchen.ballPos = 15; // outside red zone
    kitchen.evaluateAuditionHit();
  });
  await page.waitForTimeout(900);

  // 4. Verify Cook Failed Screen is displayed
  const failedHeading = await page.$eval('.failed-screen-heading', el => el.textContent.trim());
  const failedReason = await page.$eval('.failed-reason-pill', el => el.textContent.trim());
  console.log(`Failed Screen Heading: "${failedHeading}", Reason: "${failedReason}"`);
  if (!failedHeading.includes('CHÁY KHÉT MẤT RỒI')) {
    throw new Error(`Expected failure heading, got: ${failedHeading}`);
  }
  if (!failedReason.includes('Hụt 2/2 nhịp')) {
    throw new Error(`Expected reason 'Hụt 2/2 nhịp', got: ${failedReason}`);
  }

  // Verify staged ingredients were lost ("mất hết")
  const remainingBanana = await page.evaluate(() => {
    const kitchen = window.__kitchenModal;
    const state = kitchen.system.getState();
    return state.ingredients.banana;
  });
  console.log(`Banana count after failed cooking: ${remainingBanana} (Started with 2, staged 2, now expected undefined/0)`);
  if (remainingBanana !== undefined && remainingBanana !== 0) {
    throw new Error(`Staged ingredients were not deducted upon failure! Banana count is: ${remainingBanana}`);
  }

  // Save screenshot of Cook Failed Screen
  const failedScreenshotPath = path.join(BRAIN_DIR, 'verified_cooking_failed_2_misses.png');
  await page.screenshot({ path: failedScreenshotPath });
  console.log(`Saved screenshot 2: ${failedScreenshotPath}`);

  // Test navigation back from failed screen
  await page.click('button.btn-failed-back-recipes');
  await page.waitForTimeout(500);
  const backInRecipes = await page.$('.kitchen-recipes');
  if (!backInRecipes) {
    throw new Error('Did not return to recipes after clicking back button!');
  }
  console.log('Successfully navigated back to Recipes list.');

  await browser.close();
  console.log('🎉 ALL TESTS PASSED! Sync 3D ingredients and 2-miss failure verified cleanly!');
}

main().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
