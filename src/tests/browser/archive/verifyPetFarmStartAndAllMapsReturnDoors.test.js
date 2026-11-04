import { chromium } from 'playwright';
import path from 'path';
import assert from 'assert';

const htmlPath = path.resolve(process.cwd(), 'game.html');
const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function run() {
  console.log('[Test] Starting Pet Farm Start & Return Doors Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 768 }
  });
  const page = await context.newPage();

  console.log(`[Test] Navigating to ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  // 1. Kiểm tra maps khởi đầu khi bé vào game: phải là map_pet_farm!
  console.log('[Test 1] Verifying game starts on map_pet_farm...');
  const initialMapId = await page.evaluate(() => {
    return window.__worldScene?.currentMapId;
  });
  console.log(`[Test 1] Initial map ID on game start: "${initialMapId}"`);
  assert.strictEqual(initialMapId, 'map_pet_farm', 'Game MUST start on map_pet_farm!');

  const screenshotStartPetFarm = path.join(artifactDir, 'verify_game_starts_at_pet_farm.png');
  await page.screenshot({ path: screenshotStartPetFarm });
  console.log(`[Test 1] Screenshot saved: ${screenshotStartPetFarm}`);

  // 2. Chuyển sang Map 1 và kiểm tra có Cửa/Cổng quay về Nông trại (map_pet_farm)
  console.log('[Test 2] Switching to Map 1 to verify return door to pet farm...');
  await page.evaluate(() => {
    window.__travelToZone?.('map1');
  });
  await page.waitForTimeout(2000);

  const map1ReturnPortalInfo = await page.evaluate(() => {
    const scene = window.__worldScene;
    const rp = scene?.returnPortal;
    return {
      currentMapId: scene?.currentMapId,
      hasReturnPortal: Boolean(rp),
      targetMapId: rp?.targetMapId,
      targetMapName: rp?.targetMapName,
      badgeText: rp?.badgeText,
      x: rp?.x,
      y: rp?.y
    };
  });
  console.log('[Test 2] Map 1 return portal info:', map1ReturnPortalInfo);
  assert.strictEqual(map1ReturnPortalInfo.currentMapId, 'map1', 'Should be on map1');
  assert.strictEqual(map1ReturnPortalInfo.hasReturnPortal, true, 'Map 1 MUST have a return portal!');
  assert.strictEqual(map1ReturnPortalInfo.targetMapId, 'map_pet_farm', 'Map 1 return portal MUST point to map_pet_farm!');

  const screenshotMap1Return = path.join(artifactDir, 'verify_map1_has_return_portal_to_pet_farm.png');
  await page.screenshot({ path: screenshotMap1Return });
  console.log(`[Test 2] Screenshot saved: ${screenshotMap1Return}`);

  // 3. Tương tác với Cổng trở về trên Map 1 -> kiểm tra quay lại map_pet_farm an toàn
  console.log('[Test 3] Interacting with Map 1 return portal to return to pet farm...');
  await page.evaluate(() => {
    window.__worldScene?.returnPortal?.handleInteract?.();
  });
  // Đợi hiệu ứng warp 8 bước hoàn tất
  await page.waitForTimeout(5000);

  const returnedMapId = await page.evaluate(() => {
    return window.__worldScene?.currentMapId;
  });
  console.log(`[Test 3] Map ID after stepping through return portal: "${returnedMapId}"`);
  assert.strictEqual(returnedMapId, 'map_pet_farm', 'Should have returned to map_pet_farm via return portal!');

  const screenshotReturnedFarm = path.join(artifactDir, 'verify_returned_to_pet_farm_via_portal.png');
  await page.screenshot({ path: screenshotReturnedFarm });
  console.log(`[Test 3] Screenshot saved: ${screenshotReturnedFarm}`);

  // 4. Kiểm tra cấu hình Cửa/Cổng trở về của tất cả các maps còn lại:
  // map2 -> map1
  // map3 -> map2
  // map4 -> map3
  // map5 -> map4
  // map6 -> map5
  // map_kitchen -> map_pet_farm
  console.log('[Test 4] Verifying return portals configuration for all remaining maps...');
  const mapConfigsCheck = await page.evaluate(() => {
    const maps = ['map2', 'map3', 'map4', 'map5', 'map6', 'map_kitchen'];
    const results = {};
    for (const mId of maps) {
      const cfg = window.__getMapConfig?.(mId);
      results[mId] = {
        hasReturnPortal: Boolean(cfg?.returnPortal),
        targetMapId: cfg?.returnPortal?.targetMapId,
        badgeText: cfg?.returnPortal?.badgeText
      };
    }
    return results;
  });

  console.log('[Test 4] All maps return portal check results:', mapConfigsCheck);
  assert.strictEqual(mapConfigsCheck.map2.targetMapId, 'map1', 'Map 2 return portal must target map1');
  assert.strictEqual(mapConfigsCheck.map3.targetMapId, 'map2', 'Map 3 return portal must target map2');
  assert.strictEqual(mapConfigsCheck.map4.targetMapId, 'map3', 'Map 4 return portal must target map3');
  assert.strictEqual(mapConfigsCheck.map5.targetMapId, 'map4', 'Map 5 return portal must target map4');
  assert.strictEqual(mapConfigsCheck.map6.targetMapId, 'map5', 'Map 6 return portal must target map5');
  assert.strictEqual(mapConfigsCheck.map_kitchen.targetMapId, 'map_pet_farm', 'Kitchen return portal must target map_pet_farm');

  await browser.close();
  console.log('✅ ALL MAPS RETURN DOORS & PET FARM START VERIFIED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
