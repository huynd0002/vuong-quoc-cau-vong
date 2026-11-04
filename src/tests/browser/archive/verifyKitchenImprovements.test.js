import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4198, strictPort: true } });
const browser = await chromium.launch({ headless: true });

async function enterWorld(page) {
  await page.waitForFunction(() => window.__worldScene && window.__worldScene.sys.isActive(), null, { timeout: 20000 });
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
  console.log('=== KIỂM THỬ: CẢI TIẾN VÀO BẾP VÀ CÁC POP-UP TƯƠNG TÁC GIAN BẾP ===');
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4198/game.html', { waitUntil: 'networkidle' });
  await enterWorld(page);

  // 1. Kiểm tra bấm nút "Vào bếp" trên topbar mở Pop-up Kitchen Hub
  console.log('1. Bấm nút Vào Bếp trên Topbar...');
  const btnKitchen = page.locator('#btn-open-kitchen');
  assert.ok(await btnKitchen.isVisible(), 'Nút btn-open-kitchen phải hiển thị trên topbar!');
  await btnKitchen.click();
  await page.waitForTimeout(300);

  const hubModal = page.locator('#kitchen-station-popup-root .hub-card');
  assert.ok(await hubModal.isVisible(), 'Pop-up Kitchen Hub Modal phải hiển thị khi bấm Vào Bếp!');

  // Chụp ảnh Pop-up Kitchen Hub
  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\popup_kitchen_hub.png' });
  console.log('Đã lưu ảnh popup_kitchen_hub.png');

  // 2. Bấm vào "Bước Vào Gian Bếp 2D" để dịch chuyển vào map_kitchen
  console.log('2. Bấm Bước Vào Gian Bếp 2D...');
  const btnEnterMap = page.locator('#hub-opt-enter-map');
  assert.ok(await btnEnterMap.isVisible(), 'Thẻ Bước Vào Gian Bếp phải hiển thị!');
  await btnEnterMap.click();

  // Đóng story intro nếu xuất hiện
  await page.waitForTimeout(800);
  const storyBtn = page.locator('#story-start-button');
  if (await storyBtn.isVisible()) {
    await storyBtn.click();
    await page.waitForTimeout(400);
  }

  // Xác nhận đã vào map_kitchen
  const currentMap = await page.evaluate(() => window.__worldScene?.currentMapId);
  console.log('Bản đồ hiện tại:', currentMap);
  assert.equal(currentMap, 'map_kitchen', 'Bản đồ hiện tại phải là map_kitchen!');

  // Nhãn nút topbar đổi thành "Về Nông Trại"
  const topbarLabel = await page.locator('#kitchen-btn-label').textContent();
  console.log('Nhãn nút topbar trong bếp:', topbarLabel);
  assert.ok(topbarLabel.includes('Về Nông Trại'), 'Nhãn nút topbar phải đổi thành Về Nông Trại!');

  // 3. Tương tác trạm Bồn Rửa Tay -> Mở Pop-up Rửa Tay Sạch Sẽ
  console.log('3. Tương tác trạm Bồn Rửa Tay...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const sinkSt = scene.mapConfig.kitchenStations.find(s => s.type === 'prep');
    scene.handleKitchenStationInteraction(sinkSt);
  });
  
  // Chờ Bé Sâu bước tới bồn rửa và mở pop-up
  const sinkModal = page.locator('#kitchen-station-popup-root .sink-header');
  await sinkModal.waitFor({ state: 'visible', timeout: 10000 });
  assert.ok(await sinkModal.isVisible(), 'Pop-up Bồn Rửa Tay Sạch Sẽ phải hiển thị!');

  // Bấm Xoa Xà Phòng và Xả Nước
  const btnSoap = page.locator('#btn-wash-soap');
  await btnSoap.click();
  await page.waitForTimeout(200);

  const btnRinse = page.locator('#btn-wash-rinse');
  assert.ok(!(await btnRinse.isDisabled()), 'Nút Xả nước phải được kích hoạt sau khi xoa xà phòng!');
  await btnRinse.click();
  await page.waitForTimeout(200);

  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\popup_sink_wash.png' });
  console.log('Đã lưu ảnh popup_sink_wash.png');

  // Đóng pop-up rửa tay
  const closeSink = page.locator('#kitchen-station-popup-root [data-action="close-popup"]').first();
  await closeSink.click();
  await page.waitForTimeout(400);

  // 4. Tương tác trạm Kệ Nguyên Liệu -> Mở Pop-up Kệ Nguyên Liệu Tươi Sạch
  console.log('4. Tương tác trạm Kệ Nguyên Liệu...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const pantrySt = scene.mapConfig.kitchenStations.find(s => s.type === 'pantry');
    scene.handleKitchenStationInteraction(pantrySt);
  });

  const pantryModal = page.locator('#kitchen-station-popup-root .pantry-header');
  await pantryModal.waitFor({ state: 'visible', timeout: 10000 });
  assert.ok(await pantryModal.isVisible(), 'Pop-up Kệ Nguyên Liệu phải hiển thị!');

  const ingredientCount = await page.locator('.pantry-item-card').count();
  console.log('Số lượng nguyên liệu hiển thị:', ingredientCount);
  assert.equal(ingredientCount, 6, 'Phải hiển thị đủ 6 nguyên liệu dinh dưỡng!');

  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\popup_pantry_ingredients.png' });
  console.log('Đã lưu ảnh popup_pantry_ingredients.png');

  // Đóng pop-up nguyên liệu
  const closePantry = page.locator('#kitchen-station-popup-root [data-action="close-popup"]').first();
  await closePantry.click();
  await page.waitForTimeout(400);

  // 5. Tương tác trạm Cửa Ra Vào -> Mở Pop-up Cửa Ra Nông Trại
  console.log('5. Tương tác trạm Cửa Ra Vào...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const doorSt = scene.mapConfig.kitchenStations.find(s => s.type === 'door');
    scene.handleKitchenStationInteraction(doorSt);
  });

  const doorModal = page.locator('#kitchen-station-popup-root .door-header');
  await doorModal.waitFor({ state: 'visible', timeout: 10000 });
  assert.ok(await doorModal.isVisible(), 'Pop-up Cửa Ra Nông Trại phải hiển thị!');

  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\popup_door_exit.png' });
  console.log('Đã lưu ảnh popup_door_exit.png');

  // Bấm nút "Trở Về Nông Trại" trên pop-up cửa
  const btnReturn = page.locator('#btn-confirm-return-farm');
  await btnReturn.click();
  await page.waitForTimeout(1000);

  const backMap = await page.evaluate(() => window.__worldScene?.currentMapId);
  console.log('Bản đồ sau khi rời bếp:', backMap);
  assert.equal(backMap, 'map_pet_farm', 'Phải trở về Nông Trại Thú Cưng thành công!');

  console.log('✅ TẤT CẢ KIỂM THỬ CẢI TIẾN VÀO BẾP VÀ POP-UP TƯƠNG TÁC THÀNH CÔNG RỰC RỠ!');
} finally {
  await browser.close();
  await server.close();
}
