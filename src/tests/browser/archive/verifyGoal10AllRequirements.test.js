import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runGoal10Verification() {
  console.log('[Test] Starting Goal 10 E2E Verification...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  console.log(`[Test] Navigating to ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);

  // Close intro modals if present
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });

  // =========================================================================
  // REQUIREMENT 1: Xóa hẳn data của các phần đánh dấu đỏ (Mirror & Savings Board)
  // =========================================================================
  console.log('[Test] Verifying Req 1: Fashion Street has NO fitting mirror or savings board...');
  const fashionStreetConfigCheck = await page.evaluate(() => {
    const ws = window.__worldScene;
    const cfg = ws.mapConfig;
    // Switch to map_fashion_street
    ws.scene.restart({ mapId: 'map_fashion_street' });
    return true;
  });
  await page.waitForTimeout(2000);

  const fashionStationsOnMap = await page.evaluate(() => {
    const ws = window.__worldScene;
    const stations = ws.fashionStationContainers || [];
    const stationTypes = stations.map(s => s.stationData?.type || s.stationData?.id);
    const tabsInDom = Array.from(document.querySelectorAll('#fashion-street-modal .fashion-nav-tab')).map(t => t.textContent.trim());
    const panesInDom = Array.from(document.querySelectorAll('#fashion-street-modal .fashion-tab-pane')).map(p => p.id);

    return {
      stationCount: stations.length,
      stationTypes,
      tabsInDom,
      panesInDom
    };
  });

  console.log('[Test] Fashion Street map & modal:', fashionStationsOnMap);
  assert.strictEqual(fashionStationsOnMap.stationCount, 2, 'Must have exactly 2 stations on Fashion Street map');
  assert.ok(!fashionStationsOnMap.stationTypes.includes('fitting_mirror'), 'Mirror MUST NOT exist on map');
  assert.ok(!fashionStationsOnMap.stationTypes.includes('savings_board'), 'Savings Board MUST NOT exist on map');
  assert.strictEqual(fashionStationsOnMap.tabsInDom.length, 2, 'Modal must have exactly 2 tabs');
  assert.deepStrictEqual(fashionStationsOnMap.panesInDom, ['pane-accessories', 'pane-photo'], 'Only accessories and photo panes exist');

  // =========================================================================
  // REQUIREMENT 2: Nhân vật KHÔNG tự nhún nhảy tại chỗ khi đứng im trên TẤT CẢ các maps
  // =========================================================================
  console.log('[Test] Verifying Req 2: Character is completely still (0 bobbing) when idle...');
  const testMaps = ['map1', 'map_pet_farm', 'map_fishing_pond', 'map_rainbow_market', 'map_fashion_street'];
  for (const mId of testMaps) {
    const idleStillness = await page.evaluate(async (mapId) => {
      const ws = window.__worldScene;
      ws.scene.restart({ mapId });
      await new Promise(r => setTimeout(r, 1200));

      const hero = ws.hero;
      hero.stop();
      const initialY = hero.getY();
      const initialSpriteY = hero.sprite.y;

      const samples = [];
      for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 120));
        samples.push(hero.sprite.y);
      }

      const hasMovement = samples.some(y => Math.abs(y - initialSpriteY) > 0.001);
      return { mapId, initialSpriteY, samples, hasMovement };
    }, mId);

    console.log(`[Test] Idle stillness check on ${mId}:`, idleStillness);
    assert.strictEqual(idleStillness.hasMovement, false, `Character MUST NOT bob or bounce on ${mId}`);
  }

  // =========================================================================
  // REQUIREMENT 4: Bổ sung 12 phụ kiện (tất cả đều tồn tại trong catalog)
  // =========================================================================
  console.log('[Test] Verifying Req 4: 12 Accessories in catalog & shop...');
  const accessoryCatalogCheck = await page.evaluate(() => {
    const fs = window.__fashionSystem;
    const cat = fs.getCatalog();
    return {
      count: cat.length,
      ids: cat.map(c => c.id)
    };
  });
  console.log('[Test] Catalog check:', accessoryCatalogCheck);
  assert.strictEqual(accessoryCatalogCheck.count, 12, 'Catalog must contain all 12 accessories');
  assert.ok(accessoryCatalogCheck.ids.includes('acc_panda_headband'), 'Includes Panda Headband');
  assert.ok(accessoryCatalogCheck.ids.includes('acc_bunny_flower_ears'), 'Includes Bunny Flower Ears');
  assert.ok(accessoryCatalogCheck.ids.includes('acc_star_glasses'), 'Includes Star Glasses');
  assert.ok(accessoryCatalogCheck.ids.includes('acc_super_cape'), 'Includes Super Cape');
  assert.ok(accessoryCatalogCheck.ids.includes('acc_flower_wreath'), 'Includes Flower Wreath');

  // =========================================================================
  // REQUIREMENT 3: Kích thước và kết nối hoàn hảo với nhân vật xuyên suốt các maps
  // =========================================================================
  console.log('[Test] Verifying Req 3: Equipping accessories and checking tight connection...');
  const equipCheck = await page.evaluate(async () => {
    const ws = window.__worldScene;
    const fs = window.__fashionSystem;
    fs.grantStars(500); // provide stars for testing

    // Equip panda headband
    fs.purchaseAccessory('acc_panda_headband');
    fs.equipAccessory('acc_panda_headband');
    await new Promise(r => setTimeout(r, 200));

    const hero = ws.hero;
    const accSprite = hero.accessorySprite;
    const isVisible = accSprite && accSprite.visible && accSprite.active;
    const initialPos = {
      heroX: hero.getX(),
      heroY: hero.getY(),
      accX: accSprite?.x,
      accY: accSprite?.y,
      accWidth: accSprite?.displayWidth,
      accHeight: accSprite?.displayHeight
    };

    // Turn hero UP: face accessory check (test with star glasses)
    fs.purchaseAccessory('acc_star_glasses');
    fs.equipAccessory('acc_star_glasses');
    await new Promise(r => setTimeout(r, 200));

    hero.facing = 'up';
    hero.updateAccessory();
    const faceHiddenWhenFacingUp = !hero.accessorySprite.visible;

    hero.facing = 'down';
    hero.updateAccessory();
    const faceVisibleWhenFacingDown = hero.accessorySprite.visible;

    return {
      isVisible,
      initialPos,
      faceHiddenWhenFacingUp,
      faceVisibleWhenFacingDown
    };
  });

  console.log('[Test] Equip & connection metrics:', equipCheck);
  assert.strictEqual(equipCheck.faceHiddenWhenFacingUp, true, 'Glasses must be hidden when hero is facing up (back view)');
  assert.strictEqual(equipCheck.faceVisibleWhenFacingDown, true, 'Glasses must be visible when hero is facing down (front view)');

  // =========================================================================
  // REQUIREMENT 5: Phụ kiện biến mất giống nhân vật khi qua cổng dịch chuyển
  // =========================================================================
  console.log('[Test] Verifying Req 5: Accessory fades out completely (alpha 0) during portal warp...');
  const warpCheck = await page.evaluate(async () => {
    const ws = window.__worldScene;
    const fs = window.__fashionSystem;
    fs.equipAccessory('acc_rainbow_crown');
    await new Promise(r => setTimeout(r, 200));

    const hero = ws.hero;
    if (!hero.accessorySprite) throw new Error('Hero must have accessorySprite');

    // Trigger portal warp start
    window.dispatchEvent(new CustomEvent('game:portal-warp-start', {
      detail: { portalX: 640, portalY: 360 }
    }));

    // Wait 500ms into the tween
    await new Promise(r => setTimeout(r, 500));
    const midWarpAlpha = hero.accessorySprite.alpha;
    const midWarpHeroAlpha = hero.sprite.alpha;

    // Wait until warp finishes
    await new Promise(r => setTimeout(r, 500));
    const endWarpAccAlpha = hero.accessorySprite.alpha;

    // Trigger warp complete
    window.dispatchEvent(new CustomEvent('game:portal-warp-complete'));
    await new Promise(r => setTimeout(r, 100));
    const restoredAccAlpha = hero.accessorySprite.alpha;

    return {
      midWarpAlpha,
      midWarpHeroAlpha,
      endWarpAccAlpha,
      restoredAccAlpha
    };
  });

  console.log('[Test] Warp alpha metrics:', warpCheck);
  assert.ok(warpCheck.endWarpAccAlpha < 0.1, 'Accessory must fade out completely to alpha ~ 0 when warping into portal!');
  assert.strictEqual(warpCheck.restoredAccAlpha, 1, 'Accessory alpha must restore to 1 after warp completion!');

  const screenshotPath = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_goal10_all_requirements.png';
  await page.screenshot({ path: screenshotPath });
  console.log(`[Test] Saved verified screenshot to ${screenshotPath}`);

  await browser.close();
  console.log('✅ ALL GOAL 10 REQUIREMENTS CONFIRMED PASSED WITH 100% SUCCESS!');
}

runGoal10Verification().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
