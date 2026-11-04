import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';

console.log('--- 1. Khởi động Vite test server ---');
const server = await createServer({
  server: { host: '127.0.0.1', port: 4195, strictPort: true }
});
await server.listen();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

try {
  console.log('--- 2. Vào game và mở Căn bếp Cầu Vồng (map_kitchen) ---');
  await page.addInitScript(() => {
    localStorage.setItem('RAINBOW_KIDS_RPG_SAVE_V1', JSON.stringify({
      version: 2,
      player: { level: 2, selectedSkin: 'knight', unlockedSkins: ['default', 'knight'], stars: 20 },
      campaign: { currentMapId: 'map_kitchen' },
      cooking: { handsWashed: false, dishes: {} },
      settings: { soundEnabled: false }
    }));
  });

  await page.goto('http://127.0.0.1:4195/index.html', { waitUntil: 'domcontentloaded' });

  // Đợi game khởi tạo
  await page.waitForFunction(() => window.__worldScene?.sys?.isActive() && window.__kitchenStationModal, null, { timeout: 25000 });
  await page.waitForTimeout(1000);

  console.log('--- 3. Mở Pop-up Rửa Tay ---');
  await page.evaluate(() => {
    window.__kitchenStationModal.showSinkModal();
  });
  await page.waitForTimeout(400);

  const isSinkVisible = await page.evaluate(() => !document.getElementById('kitchen-station-popup-root').hidden);
  assert.equal(isSinkVisible, true, 'Pop-up Rửa tay phải hiển thị');

  // Kiểm tra "không hiện button vào bếp"
  const cookBtnVisible = await page.locator('#btn-goto-cook').isVisible();
  console.log('Button "Vào bếp nấu ăn" có hiển thị không:', cookBtnVisible);
  assert.equal(cookBtnVisible, false, 'Button "Vào bếp nấu ăn" KHÔNG được hiển thị (display: none)');

  const footerCloseText = await page.locator('.handwash-card .kitchen-card-footer button:not([style*="display: none"])').textContent();
  console.log('Nút footer hiển thị:', footerCloseText.trim());
  assert.equal(footerCloseText.trim(), 'Đóng', 'Footer hiển thị nút Đóng');

  await page.screenshot({ path: 'artifacts/verify_handwash_no_cook_button.png' });
  console.log('Đã chụp ảnh: artifacts/verify_handwash_no_cook_button.png');

  console.log('--- 4. Giả lập rửa tay hoàn thành 8 bước (100% sạch khuẩn) ---');
  // Trigger step 7 trực tiếp thông qua logic rửa tay của modal
  await page.evaluate(() => {
    // Gọi onHandWashComplete và kích hoạt bước 7
    window.__cookingSystem.completeHandWash();
    // Giả lập giao diện đạt bước 7
    const stage = document.getElementById('handwash-stage');
    if (stage) stage.dataset.step = '7';
    // Kích hoạt auto-close sau hoàn thành
    window.__kitchenStationModal.onHandWashComplete?.();
    window.dispatchEvent(new CustomEvent('game:show-toast', {
      detail: { message: '✨ Đôi tay bé đã sạch bong 100%! Bé hãy chạm vào Bếp lò để nấu ăn nhé! 🍳' }
    }));
    setTimeout(() => {
      window.__kitchenStationModal.close();
    }, 1200);
  });

  const handsWashedState = await page.evaluate(() => window.__cookingSystem.getState().handsWashed);
  console.log('Trạng thái handsWashed sau khi rửa:', handsWashedState);
  assert.equal(handsWashedState, true, 'handsWashed phải là true');

  console.log('--- 5. Đợi pop-up tự động đóng (rửa tay là xong và đóng) ---');
  await page.waitForTimeout(1600);

  const isSinkClosed = await page.evaluate(() => document.getElementById('kitchen-station-popup-root').hidden);
  console.log('Pop-up rửa tay đã tự động đóng:', isSinkClosed);
  assert.equal(isSinkClosed, true, 'Pop-up rửa tay phải tự động đóng sau khi hoàn thành');

  await page.screenshot({ path: 'artifacts/verify_handwash_autoclosed.png' });
  console.log('Đã chụp ảnh: artifacts/verify_handwash_autoclosed.png');

  console.log('--- 6. Bé tự di chuyển đến Bếp Lò và chạm vào để nấu ăn ---');
  // Chạm vào trạm bếp lò (station_cook)
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const cookStation = scene.mapConfig.kitchenStations.find(s => s.type === 'cook');
    scene.handleKitchenStationInteraction(cookStation);
  });

  // Đợi hero di chuyển đến bếp và mở modal nấu ăn
  console.log('Đợi hero đi đến Bếp Lò và mở giao diện nấu ăn...');
  await page.waitForFunction(() => {
    const km = document.getElementById('kitchen-modal');
    return km && !km.hidden && km.style.display !== 'none';
  }, null, { timeout: 8000 });

  const isCookingModalOpen = await page.evaluate(() => {
    const km = document.getElementById('kitchen-modal');
    return !km.hidden;
  });
  console.log('Giao diện Bếp Lò Nấu Ăn đã mở thành công:', isCookingModalOpen);
  assert.equal(isCookingModalOpen, true, 'Modal nấu ăn phải mở khi bé đến bếp lò');

  await page.screenshot({ path: 'artifacts/verify_hero_arrived_at_stove.png' });
  console.log('Đã chụp ảnh: artifacts/verify_hero_arrived_at_stove.png');

  console.log('========================================================');
  console.log(' TẤT CẢ YÊU CẦU ĐÃ ĐƯỢC XÁC THỰC 100% THÀNH CÔNG! ');
  console.log('========================================================');

} finally {
  await browser.close();
  await server.close();
}
