import { chromium } from 'playwright';
import path from 'path';
import assert from 'assert';

const htmlPath = path.resolve(process.cwd(), 'game.html');
const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function run() {
  console.log('[Test] Starting Quest Ribbon Hidden on All Maps Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 768 }
  });
  const page = await context.newPage();

  console.log(`[Test] Navigating to ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  // Helper function kiểm tra ruy băng nhiệm vụ đã biến mất hoàn toàn
  const assertQuestRibbonHidden = async (mapName) => {
    const isHidden = await page.evaluate(() => {
      const ribbon = document.querySelector('.quest-ribbon');
      if (!ribbon) return true;
      const style = window.getComputedStyle(ribbon);
      const rect = ribbon.getBoundingClientRect();
      return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || rect.width === 0 || rect.height === 0;
    });
    console.log(`[Check] Map "${mapName}" -> Quest Ribbon is hidden: ${isHidden}`);
    assert.strictEqual(isHidden, true, `Quest ribbon must be hidden on map "${mapName}"!`);
  };

  // 1. Kiểm tra trên Map 1 (mặc định ban đầu)
  console.log('[Test 1] Checking Map 1 (Garden)...');
  await page.waitForTimeout(500);
  await assertQuestRibbonHidden('Map 1 - Garden');

  const screenshotMap1 = path.join(artifactDir, 'verify_quest_ribbon_hidden_map1.png');
  await page.screenshot({ path: screenshotMap1 });
  console.log(`[Test 1] Screenshot saved: ${screenshotMap1}`);

  // 2. Chuyển sang Nhà Bếp (Map Kitchen - giống trong ảnh người dùng gửi)
  console.log('[Test 2] Switching to Kitchen map (map_kitchen)...');
  await page.evaluate(() => {
    window.__app?.switchMap?.('map_kitchen');
  });
  await page.waitForTimeout(1200);
  await assertQuestRibbonHidden('Map Kitchen');

  const screenshotKitchen = path.join(artifactDir, 'verify_quest_ribbon_hidden_kitchen.png');
  await page.screenshot({ path: screenshotKitchen });
  console.log(`[Test 2] Screenshot saved: ${screenshotKitchen}`);

  // 3. Chuyển sang Nông Trại Nuôi Thú (map_pet_farm)
  console.log('[Test 3] Switching to Pet Farm map (map_pet_farm)...');
  await page.evaluate(() => {
    window.__app?.switchMap?.('map_pet_farm');
  });
  await page.waitForTimeout(1200);
  await assertQuestRibbonHidden('Map Pet Farm');

  const screenshotPetFarm = path.join(artifactDir, 'verify_quest_ribbon_hidden_pet_farm.png');
  await page.screenshot({ path: screenshotPetFarm });
  console.log(`[Test 3] Screenshot saved: ${screenshotPetFarm}`);

  // 4. Chuyển sang Vùng 2 (map2)
  console.log('[Test 4] Switching to Map 2...');
  await page.evaluate(() => {
    window.__app?.switchMap?.('map2');
  });
  await page.waitForTimeout(1200);
  await assertQuestRibbonHidden('Map 2');

  const screenshotMap2 = path.join(artifactDir, 'verify_quest_ribbon_hidden_map2.png');
  await page.screenshot({ path: screenshotMap2 });
  console.log(`[Test 4] Screenshot saved: ${screenshotMap2}`);

  await browser.close();
  console.log('✅ ALL MAPS VERIFIED: QUEST RIBBON COMPLETELY REMOVED ACROSS ALL MAPS!');
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
