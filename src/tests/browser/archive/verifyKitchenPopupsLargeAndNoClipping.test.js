import { chromium } from 'playwright';
import path from 'path';
import assert from 'assert';

const htmlPath = path.resolve(process.cwd(), 'game.html');
const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function run() {
  console.log('[Test] Starting Kitchen Popups Large & Anti-clipping Flyout Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 768 }
  });
  const page = await context.newPage();

  console.log(`[Test] Navigating to ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  // Khởi tạo và mở KitchenModal với tab 'recipes'
  console.log('[Test 1] Opening KitchenModal in recipes mode...');
  await page.evaluate(() => {
    // Đảm bảo tay đã sạch để hiển thị menu công thức
    const km = window.__kitchenModal;
    if (km) {
      if (km.system.getState) {
        km.system.getState().handsWashed = true;
      }
      km.show('recipes');
    }
  });
  await page.waitForTimeout(500);

  // 1. Kiểm tra kích thước modal phòng bếp (.kitchen-room)
  const roomBox = await page.evaluate(() => {
    const room = document.querySelector('.kitchen-room');
    const rect = room.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right
    };
  });
  console.log('[Test 1] Kitchen room dimensions:', roomBox);
  // Modal phải to lên: width >= 1150px trên màn hình 1280px
  assert(roomBox.width >= 1150, `Kitchen room width should be >= 1150px (actual: ${roomBox.width}px)`);
  assert(roomBox.height >= 600, `Kitchen room height should be >= 600px (actual: ${roomBox.height}px)`);

  // 2. Di chuột vào món thứ 2 "Bánh mì sắc màu" (card 2 ở hàng 1)
  console.log('[Test 2] Hovering on "Bánh mì sắc màu" recipe card...');
  const recipeCards = await page.$$('.kitchen-recipe');
  assert(recipeCards.length >= 2, 'Should have at least 2 recipe cards');
  
  // Hover vào card 2
  await recipeCards[1].hover();
  await page.waitForTimeout(300);

  // Kiểm tra bounding box của flyout pop-up nhỏ
  const flyoutInfo = await page.evaluate(() => {
    const card = document.querySelectorAll('.kitchen-recipe')[1];
    const flyout = card.querySelector('.dish-hover-flyout');
    const room = document.querySelector('.kitchen-room');
    const fRect = flyout.getBoundingClientRect();
    const rRect = room.getBoundingClientRect();
    return {
      flyout: {
        top: fRect.top,
        bottom: fRect.bottom,
        left: fRect.left,
        right: fRect.right,
        width: fRect.width,
        height: fRect.height
      },
      room: {
        top: rRect.top,
        bottom: rRect.bottom,
        left: rRect.left,
        right: rRect.right
      },
      isCutBottom: fRect.bottom > rRect.bottom,
      isCutTop: fRect.top < rRect.top,
      isCutLeft: fRect.left < rRect.left,
      isCutRight: fRect.right > rRect.right,
      opacity: window.getComputedStyle(flyout).opacity,
      visibility: window.getComputedStyle(flyout).visibility
    };
  });

  console.log('[Test 2] Flyout positioning check:', flyoutInfo);
  assert.strictEqual(flyoutInfo.isCutBottom, false, 'Flyout must NOT be cut off at the bottom of the kitchen room!');
  assert.strictEqual(flyoutInfo.isCutTop, false, 'Flyout must NOT be cut off at the top of the kitchen room!');
  assert.strictEqual(flyoutInfo.isCutLeft, false, 'Flyout must NOT be cut off on the left!');
  assert.strictEqual(flyoutInfo.isCutRight, false, 'Flyout must NOT be cut off on the right!');

  const screenshotPath1 = path.join(artifactDir, 'verify_kitchen_recipes_flyout_no_cut.png');
  await page.screenshot({ path: screenshotPath1 });
  console.log(`[Test 2] Screenshot saved: ${screenshotPath1}`);

  // 3. Di chuột vào món ở hàng 2 ("Cơm trứng rau" hoặc "Đĩa cơm cầu vồng")
  console.log('[Test 3] Hovering on Row 2 card...');
  if (recipeCards.length >= 4) {
    await recipeCards[3].hover();
    await page.waitForTimeout(300);

    const flyoutRow2 = await page.evaluate(() => {
      const card = document.querySelectorAll('.kitchen-recipe')[3];
      const flyout = card.querySelector('.dish-hover-flyout');
      const room = document.querySelector('.kitchen-room');
      const fRect = flyout.getBoundingClientRect();
      const rRect = room.getBoundingClientRect();
      return {
        isCutBottom: fRect.bottom > rRect.bottom,
        isCutTop: fRect.top < rRect.top
      };
    });
    console.log('[Test 3] Row 2 Flyout check:', flyoutRow2);
    assert.strictEqual(flyoutRow2.isCutBottom, false, 'Row 2 flyout must NOT be cut off at bottom!');
    assert.strictEqual(flyoutRow2.isCutTop, false, 'Row 2 flyout must NOT be cut off at top!');

    const screenshotPath2 = path.join(artifactDir, 'verify_kitchen_recipes_flyout_row2.png');
    await page.screenshot({ path: screenshotPath2 });
    console.log(`[Test 3] Screenshot saved: ${screenshotPath2}`);
  }

  // 4. Mở Tủ Lạnh kiểm tra kích thước to lớn
  console.log('[Test 4] Checking Fridge modal size...');
  await page.evaluate(() => {
    window.__kitchenModal?.show('fridge');
  });
  await page.waitForTimeout(400);

  const fridgeBox = await page.evaluate(() => {
    const room = document.querySelector('.kitchen-room.is-fridge-mode');
    const rect = room.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  console.log('[Test 4] Fridge modal dimensions:', fridgeBox);
  assert(fridgeBox.width >= 1150, `Fridge modal width should be >= 1150px (actual: ${fridgeBox.width}px)`);

  const screenshotPathFridge = path.join(artifactDir, 'verify_kitchen_fridge_modal_large.png');
  await page.screenshot({ path: screenshotPathFridge });
  console.log(`[Test 4] Screenshot saved: ${screenshotPathFridge}`);

  // 5. Mở Bồn Rửa Tay (Handwash Modal) kiểm tra kích thước to lớn
  console.log('[Test 5] Checking Handwash modal size...');
  await page.evaluate(() => {
    window.__kitchenModal?.close();
    window.__kitchenStationModal?.showSinkModal();
  });
  await page.waitForTimeout(400);

  const sinkBox = await page.evaluate(() => {
    const card = document.querySelector('.handwash-card');
    const rect = card.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  console.log('[Test 5] Handwash modal dimensions:', sinkBox);
  assert(sinkBox.width >= 980, `Handwash modal width should be >= 980px (actual: ${sinkBox.width}px)`);

  const screenshotPathSink = path.join(artifactDir, 'verify_kitchen_handwash_modal_large.png');
  await page.screenshot({ path: screenshotPathSink });
  console.log(`[Test 5] Screenshot saved: ${screenshotPathSink}`);

  await browser.close();
  console.log('✅ ALL KITCHEN POPUPS LARGE & ANTI-CLIPPING TESTS PASSED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
