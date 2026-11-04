import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4203, strictPort: true } });
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
  console.log('=== KIỂM THỬ: HÀNH ĐỘNG UỐNG NƯỚC TẠI (404, 242) VÀ TẮM THAY THẾ KHÔNG LỖI SCALE ===');
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4203/game.html', { waitUntil: 'networkidle' });
  await enterWorld(page);

  // 1. Kiểm tra trạm station_water có tọa độ (404, 242)
  const stationWater = await page.evaluate(() => {
    const scene = window.__worldScene;
    return scene.mapConfig?.petStations?.find(s => s.type === 'water');
  });
  console.log('Trạm station_water trên bản đồ:', stationWater);
  assert.ok(stationWater, 'Trạm station_water phải tồn tại trong mapConfig!');
  assert.equal(stationWater.x, 404, 'Tọa độ X của trạm nước phải là 404');
  assert.equal(stationWater.y, 242, 'Tọa độ Y của trạm nước phải là 242');

  // 2. Click nút Uống Nước trên HUD
  console.log('Click nút Uống nước (#gauge-thirst)...');
  await page.locator('#gauge-thirst').click();

  // Đợi cún đi đến vị trí uống nước (404, 242) và bắt đầu hoạt ảnh uống
  await page.waitForFunction(() => {
    const pet = window.__worldScene.pet;
    return pet.sprite?.anims?.currentAnim?.key === 'pet_dog_drink' &&
      Math.abs(pet.sprite.x - 404) < 15 &&
      Math.abs(pet.sprite.y - 242) < 15;
  }, null, { timeout: 12000 });

  const drinkStatus = await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    const action = window.__worldScene.currentPetStationAction;
    return {
      x: Math.round(pet.sprite.x),
      y: Math.round(pet.sprite.y),
      animKey: pet.sprite.anims.currentAnim?.key,
      displayWidth: pet.sprite.displayWidth,
      displayHeight: pet.sprite.displayHeight,
      stationType: action?.station?.type
    };
  });
  console.log('Trạng thái cún khi uống nước:', drinkStatus);
  assert.equal(drinkStatus.animKey, 'pet_dog_drink', 'Hoạt ảnh phải là pet_dog_drink');
  assert.ok(Math.abs(drinkStatus.x - 404) <= 5, `Tọa độ X (${drinkStatus.x}) phải sát 404`);
  assert.ok(Math.abs(drinkStatus.y - 242) <= 5, `Tọa độ Y (${drinkStatus.y}) phải sát 242`);

  // Chụp ảnh bằng chứng cún uống nước tại (404, 242)
  await page.waitForTimeout(600);
  const screenshotDrink = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\dog_drinking_at_404_242.png';
  await page.screenshot({ path: screenshotDrink });
  console.log('Đã lưu ảnh cún uống nước:', screenshotDrink);

  // 3. Chờ xong hành động uống nước hoặc ngắt hành động để test Tắm
  await page.evaluate(() => {
    window.__worldScene.interruptPetStationAction(false);
  });
  await page.waitForTimeout(500);

  // 4. Click nút Tắm trên HUD (#gauge-clean)
  console.log('Click nút Tắm (#gauge-clean)...');
  await page.locator('#gauge-clean').click();

  // Đợi cún đi đến trạm tắm và thực hiện hành động tắm mới
  await page.waitForFunction(() => {
    const pet = window.__worldScene.pet;
    return pet.currentAnimState === 'bathe';
  }, null, { timeout: 12000 });

  await page.waitForTimeout(600);

  const bathStatus = await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    const action = window.__worldScene.currentPetStationAction;
    return {
      x: Math.round(pet.sprite.x),
      y: Math.round(pet.sprite.y),
      animKey: pet.sprite.anims.currentAnim?.key,
      displayWidth: pet.sprite.displayWidth,
      displayHeight: pet.sprite.displayHeight,
      hasShakeTween: !!pet.shakeTween,
      angle: pet.sprite.angle,
      stationType: action?.station?.type
    };
  });
  console.log('Trạng thái cún khi tắm (thay thế sạch sẽ):', bathStatus);
  assert.equal(bathStatus.animKey, 'pet_dog_happy', 'Hoạt ảnh tắm phải thay bằng pet_dog_happy vui vẻ đáng yêu');
  assert.equal(bathStatus.displayWidth, 96, 'Kích thước displayWidth phải giữ nguyên chuẩn this.size=96 (không scale)');
  assert.equal(bathStatus.displayHeight, 96, 'Kích thước displayHeight phải giữ nguyên chuẩn this.size=96 (không scale)');
  assert.equal(bathStatus.hasShakeTween, false, 'Tuyệt đối không có shakeTween biến dạng');
  assert.equal(bathStatus.angle, 0, 'Góc xoay phải bằng 0');
  assert.ok(Math.abs(bathStatus.x - 535) <= 5, `Tọa độ X (${bathStatus.x}) phải ở trước bồn tắm (535)`);
  assert.ok(Math.abs(bathStatus.y - 640) <= 5, `Tọa độ Y (${bathStatus.y}) phải ở trước bậc thềm (640)`);

  // Chụp ảnh bằng chứng cún tắm vui vẻ sạch sẽ không scale/lỗi
  const screenshotBath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\dog_bath_replaced_clean.png';
  await page.screenshot({ path: screenshotBath });
  console.log('Đã lưu ảnh cún tắm:', screenshotBath);

  console.log('=== TẤT CẢ KIỂM THỬ UỐNG NƯỚC (404, 242) & TẮM ĐỀU THÀNH CÔNG RỰC RỠ! ===');
} catch (err) {
  console.error('LỖI KIỂM THỬ:', err);
  process.exitCode = 1;
} finally {
  await browser.close();
  await server.close();
}
