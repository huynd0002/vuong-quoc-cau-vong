import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4202, strictPort: true } });
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
  console.log('=== KIỂM THỬ: UỐNG NƯỚC ĐẾN MÁNG NƯỚC & HƯỚNG BƯỚC ĐI CỦA CÚN ===');
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4202/game.html', { waitUntil: 'networkidle' });
  await enterWorld(page);

  // 1. Kiểm tra trạm station_water tồn tại trong mapConfig
  const stationWater = await page.evaluate(() => {
    const scene = window.__worldScene;
    return scene.mapConfig?.petStations?.find(s => s.type === 'water');
  });
  console.log('Trạm uống nước station_water:', stationWater);
  assert.ok(stationWater, 'Trạm station_water phải tồn tại trong mapConfig!');
  assert.equal(stationWater.type, 'water', 'Type trạm phải là water');

  // 2. Click vòng tròn Uống Nước trên HUD (gauge-thirst)
  console.log('Click nút Uống nước trên HUD...');
  await page.locator('#gauge-thirst').click();

  // Đợi cún đi đến máng nước suối và bắt đầu uống nước
  await page.waitForFunction(() => {
    const pet = window.__worldScene.pet;
    return pet.currentAnimState === 'drink' || (window.__worldScene.currentPetStationAction?.station?.type === 'water');
  }, null, { timeout: 10000 });

  // Chờ đến khi cún thực hiện hành động uống nước tại máng
  await page.waitForFunction(() => {
    const pet = window.__worldScene.pet;
    return pet.sprite?.anims?.currentAnim?.key === 'pet_dog_drink';
  }, null, { timeout: 10000 });

  const drinkingState = await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    const action = window.__worldScene.currentPetStationAction;
    return {
      animKey: pet.sprite.anims.currentAnim?.key,
      currentAnimState: pet.currentAnimState,
      flipX: pet.sprite.flipX,
      x: pet.sprite.x,
      y: pet.sprite.y,
      stationType: action?.station?.type
    };
  });
  console.log('Trạng thái cún khi uống nước:', drinkingState);
  assert.equal(drinkingState.animKey, 'pet_dog_drink', 'Cún phải phát hoạt ảnh pet_dog_drink, KHÔNG ĐƯỢC đi tắm!');
  assert.notEqual(drinkingState.animKey, 'pet_dog_bath', 'Tuyệt đối không được kích hoạt tắm khi ấn uống nước!');
  assert.equal(drinkingState.stationType, 'water', 'Station type phải là water, không phải bath!');
  assert.ok(Math.abs(drinkingState.x - 404) < 15, 'Cún phải đứng cạnh máng nước đá (x ~ 390)!');

  // Chụp ảnh cún đang uống nước ở máng nước đá
  await page.waitForTimeout(600);
  const screenshotDrinking = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\verify_dog_drinking_at_trough.png';
  await page.screenshot({ path: screenshotDrinking });
  console.log('Đã lưu ảnh cún uống nước:', screenshotDrinking);

  // 3. Kiểm thử độ mượt của hướng đi cún (không bị lật qua lật lại liên tục)
  console.log('Kiểm tra hướng bước đi và triệt tiêu rung lắc lật mặt...');
  // Cho cún đi từ phải sang trái (x: 800 -> 300)
  const flipHistory = [];
  await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    window.__flipCount = 0;
    let prevFlip = pet.sprite.flipX;
    window.__flipTracker = setInterval(() => {
      if (pet.sprite.flipX !== prevFlip) {
        window.__flipCount++;
        prevFlip = pet.sprite.flipX;
      }
    }, 50);

    // Bắt đầu cho cún đi về phía trái
    pet.walkToStation(300, 450);
  });

  await page.waitForTimeout(1500);

  const flipResult = await page.evaluate(() => {
    clearInterval(window.__flipTracker);
    const pet = window.__worldScene.pet;
    return {
      flipCount: window.__flipCount,
      facing: pet.facing,
      flipX: pet.sprite.flipX
    };
  });
  console.log('Kết quả lật hướng khi bước đi một mạch sang trái:', flipResult);
  assert.ok(flipResult.flipCount <= 1, `Số lần lật mặt khi đi thẳng một mạch phải <= 1, thực tế: ${flipResult.flipCount}`);
  assert.equal(flipResult.flipX, true, 'Đi sang trái thì mặt cún phải quay sang trái (flipX = true)!');

  console.log('=== TẤT CẢ KIỂM THỬ UỐNG NƯỚC & HƯỚNG BƯỚC ĐI ĐÃ VƯỢT QUA 100%! ===');
} finally {
  await browser.close();
  await server.close();
}
