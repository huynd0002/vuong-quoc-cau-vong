import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const browser = await chromium.launch({ headless: true });

async function enterWorld(page) {
  await page.waitForFunction(() => {
    const n = document.getElementById('initial-loading-screen');
    return !n || getComputedStyle(n).display === 'none';
  }, null, { timeout: 20000 });

  const start = page.locator('#char-btn-start-adventure');
  if (await start.isVisible()) await start.click();
  const story = page.locator('#story-start-button');
  if (await story.isVisible()) await story.click();
  await page.waitForFunction(() => window.__worldScene?.sys.isActive() && window.__worldScene.isExploring, null, { timeout: 20000 });
}

try {
  console.log('=== BẮT ĐẦU KIỂM THỬ: TÁCH RIÊNG CÁC POP-UP BẾP, YÊU CẦU RỬA TAY VÀ ICON TÚI TRÊN SÀN ===');
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem('RAINBOW_KIDS_RPG_SAVE_V1', JSON.stringify({
      version: 2,
      player: { stars: 20 },
      campaign: { currentMapId: 'map_pet_farm' },
      cooking: { handsWashed: false, ingredients: { banana: 2, yogurt: 2 }, dishes: [] },
      pet: { type: 'dog', energy: 100, isSleeping: false },
      settings: { soundEnabled: false }
    }));
  });

  await page.goto(pathToFileURL(path.resolve('game.html')).href, { waitUntil: 'networkidle' });
  await enterWorld(page);

  // 1. Chuyển scene sang map_kitchen
  console.log('Chuyển scene sang map_kitchen...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    scene.scene.restart({ mapId: 'map_kitchen' });
  });

  await page.waitForFunction(() => window.__worldScene?.currentMapId === 'map_kitchen' && window.__worldScene.sys.isActive(), null, { timeout: 15000 });
  await page.waitForTimeout(800);

  // Đóng bất kỳ pop-up welcome nào nếu có
  const closeWelcome = page.locator('#kitchen-station-popup-root [data-action="close-popup"]').first();
  if (await closeWelcome.isVisible()) {
    await closeWelcome.click();
    await page.waitForTimeout(400);
  }

  // 2. Kiểm tra các trạm trong map_kitchen
  const stations = await page.evaluate(() => {
    const scene = window.__worldScene;
    return scene.mapConfig?.kitchenStations?.map(s => ({ id: s.id, type: s.type, x: s.x, y: s.y }));
  });
  console.log('Danh sách trạm trong map_kitchen:', stations);

  const bagStation = stations.find(s => s.type === 'bag');
  assert.ok(bagStation, 'Phải có trạm Túi Đồ Của Bé (station_bag)');
  assert.equal(bagStation.x, 450, 'Tọa độ X của Túi phải là 450');
  assert.equal(bagStation.y, 650, 'Tọa độ Y của Túi phải là 650');

  // Chụp ảnh toàn cảnh gian bếp với icon Túi trên sàn
  const screenshotKitchenOverview = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\verify_kitchen_overview_bag_icon.png';
  await page.screenshot({ path: screenshotKitchenOverview });
  console.log('Đã lưu ảnh gian bếp với Icon Túi trên sàn:', screenshotKitchenOverview);

  // 3. KIỂM THỬ: Khi chưa rửa tay -> Click Tủ lạnh hoặc Bếp lò phải bị CHẶN và CẢNH BÁO
  console.log('Kiểm tra chặn mở Tủ Lạnh khi chưa rửa tay...');
  await page.evaluate(() => {
    const system = window.__cookingSystem;
    if (system) system.getState().handsWashed = false;
    const scene = window.__worldScene;
    const pantrySt = scene.kitchenStationContainers?.find(st => st.data.type === 'pantry');
    scene.handleKitchenStationInteraction(pantrySt.data);
  });

  await page.waitForFunction(() => !window.__worldScene.hero?.isMoving, null, { timeout: 10000 });
  await page.waitForTimeout(500);

  const isModalOpenUnwashed = await page.locator('#kitchen-modal').isVisible();
  assert.equal(isModalOpenUnwashed, false, 'Tủ Lạnh KHÔNG ĐƯỢC mở khi chưa rửa tay!');
  console.log('✓ Tủ Lạnh đã bị chặn mở chính xác vì chưa rửa tay!');

  const screenshotWarning = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\verify_kitchen_handwash_required_warning.png';
  await page.screenshot({ path: screenshotWarning });
  console.log('Đã lưu ảnh cảnh báo yêu cầu rửa tay:', screenshotWarning);

  // 4. KIỂM THỬ: Click vào Bồn Rửa Tay -> Mở Pop-up Rửa Tay 8 bước riêng biệt
  console.log('Click vào Bồn Rửa Tay...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const prepSt = scene.kitchenStationContainers?.find(st => st.data.type === 'prep');
    scene.handleKitchenStationInteraction(prepSt.data);
  });

  await page.waitForFunction(() => {
    const sinkPopup = document.getElementById('kitchen-station-popup-root');
    return sinkPopup && !sinkPopup.hidden && getComputedStyle(sinkPopup).display !== 'none';
  }, null, { timeout: 10000 });

  console.log('✓ Pop-up Rửa Tay đã mở thành công!');

  // Hoàn thành rửa tay để mở khóa
  await page.evaluate(() => {
    window.__cookingSystem?.completeHandWash();
    window.__kitchenStationModal?.close();
  });
  await page.waitForTimeout(500);

  const isHandsClean = await page.evaluate(() => window.__cookingSystem?.getState()?.handsWashed);
  assert.equal(isHandsClean, true, 'Trạng thái handsWashed phải là true sau khi rửa tay!');

  // 5. KIỂM THỬ: Khi tay đã sạch -> Mở Tủ Lạnh (Pop-up riêng, KHÔNG có tab)
  console.log('Click vào Tủ Lạnh sau khi tay đã sạch...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const pantrySt = scene.kitchenStationContainers?.find(st => st.data.type === 'pantry');
    scene.handleKitchenStationInteraction(pantrySt.data);
  });

  await page.waitForFunction(() => {
    const modal = document.getElementById('kitchen-modal');
    return modal && !modal.hidden && getComputedStyle(modal).display !== 'none';
  }, null, { timeout: 10000 });

  const fridgeTitle = await page.locator('#kitchen-title').textContent();
  console.log('Tiêu đề Pop-up Tủ Lạnh:', fridgeTitle);
  assert.ok(fridgeTitle.includes('Tủ Lạnh'), 'Tiêu đề phải là Tủ Lạnh');

  // Kiểm tra thanh Tab đã bị ẩn hoàn toàn
  const tabsDisplay = await page.locator('.kitchen-tabs').evaluate(el => getComputedStyle(el).display);
  assert.equal(tabsDisplay, 'none', 'Thanh tabs phải được ẩn hoàn toàn để tạo pop-up riêng biệt!');

  // Kiểm tra nút đóng riêng biệt "✕ Đóng tủ lạnh"
  const fridgeCloseBtnText = await page.locator('.kitchen-bottom button').textContent();
  console.log('Nút đóng tủ lạnh:', fridgeCloseBtnText);
  assert.ok(fridgeCloseBtnText.includes('Đóng tủ lạnh'), 'Nút đóng phải là Đóng tủ lạnh');

  const screenshotFridge = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\verify_kitchen_separate_fridge_modal.png';
  await page.screenshot({ path: screenshotFridge });
  console.log('Đã lưu ảnh Pop-up Tủ Lạnh riêng biệt:', screenshotFridge);

  // Đóng tủ lạnh
  await page.locator('.kitchen-bottom button').click();
  await page.waitForTimeout(500);

  // 6. KIỂM THỬ: Click vào Bếp Nấu -> Mở Pop-up Bếp Nấu riêng biệt
  console.log('Click vào Bếp Nấu...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const cookSt = scene.kitchenStationContainers?.find(st => st.data.type === 'cook');
    scene.handleKitchenStationInteraction(cookSt.data);
  });

  await page.waitForFunction(() => {
    const modal = document.getElementById('kitchen-modal');
    return modal && !modal.hidden && getComputedStyle(modal).display !== 'none';
  }, null, { timeout: 10000 });

  const cookTitle = await page.locator('#kitchen-title').textContent();
  console.log('Tiêu đề Pop-up Bếp Nấu:', cookTitle);
  assert.ok(cookTitle.includes('Bếp Nấu'), 'Tiêu đề phải là Bếp Nấu');

  const cookCloseBtnText = await page.locator('.kitchen-bottom button').textContent();
  console.log('Nút đóng bếp:', cookCloseBtnText);
  assert.ok(cookCloseBtnText.includes('Đóng bếp'), 'Nút đóng phải là Đóng bếp');

  const screenshotCook = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\verify_kitchen_separate_cook_modal.png';
  await page.screenshot({ path: screenshotCook });
  console.log('Đã lưu ảnh Pop-up Bếp Nấu riêng biệt:', screenshotCook);

  // Đóng bếp nấu
  await page.locator('.kitchen-bottom button').click();
  await page.waitForTimeout(500);

  // 7. KIỂM THỬ: Click vào Túi trên sàn tại (450, 650) -> Mở Pop-up Túi Đồ Của Bé riêng biệt
  console.log('Click vào Túi Đồ Của Bé trên sàn tại (450, 650)...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const bagSt = scene.kitchenStationContainers?.find(st => st.data.type === 'bag');
    scene.handleKitchenStationInteraction(bagSt.data);
  });

  await page.waitForFunction(() => {
    const modal = document.getElementById('kitchen-modal');
    return modal && !modal.hidden && getComputedStyle(modal).display !== 'none';
  }, null, { timeout: 10000 });

  const bagTitle = await page.locator('#kitchen-title').textContent();
  console.log('Tiêu đề Pop-up Túi Đồ:', bagTitle);
  assert.ok(bagTitle.includes('Túi Đồ Của Bé'), 'Tiêu đề phải là Túi Đồ Của Bé');

  const bagCloseBtnText = await page.locator('.kitchen-bottom button').textContent();
  console.log('Nút đóng túi:', bagCloseBtnText);
  assert.ok(bagCloseBtnText.includes('Đóng túi đồ'), 'Nút đóng phải là Đóng túi đồ');

  const screenshotBag = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\verify_kitchen_separate_bag_modal.png';
  await page.screenshot({ path: screenshotBag });
  console.log('Đã lưu ảnh Pop-up Túi Đồ Của Bé riêng biệt:', screenshotBag);

  console.log('=== TẤT CẢ KIỂM THỬ TÁCH BIỆT POP-UP, YÊU CẦU RỬA TAY VÀ ICON TÚI TRÊN SÀN ĐỀU ĐẠT 100%! ===');
} catch (err) {
  console.error('LỖI KIỂM THỬ:', err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
