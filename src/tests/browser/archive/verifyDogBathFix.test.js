import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4197, strictPort: true } });
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
  console.log('=== KIỂM THỬ: HOẠT ẢNH TẮM MỚI VÀ SỬA LỖI HÌNH ẢNH CON CHÓ KHI TẮM ===');
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4197/game.html', { waitUntil: 'networkidle' });
  await enterWorld(page);

  // 1. Kiểm tra texture và anim pet_dog_bath tồn tại trong scene
  const animCheck = await page.evaluate(() => {
    const scene = window.__worldScene;
    return {
      hasTexture: scene.textures.exists('pet_dog_bath_sheet'),
      hasAnim: scene.anims.exists('pet_dog_bath'),
      bathStation: scene.mapConfig?.petStations?.find(s => s.type === 'bath')
    };
  });
  console.log('Kiểm tra texture và animation:', animCheck);
  assert.ok(animCheck.hasTexture, 'Texture pet_dog_bath_sheet phải tồn tại!');
  assert.ok(animCheck.hasAnim, 'Animation pet_dog_bath phải tồn tại!');

  // 2. Kích hoạt tương tác trạm tắm
  console.log('Kích hoạt tương tác trạm tắm...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const bathSt = scene.mapConfig.petStations.find(s => s.type === 'bath');
    scene.handlePetStationInteraction(bathSt);
  });

  // Chờ cún đi tới trạm và nhảy vào bồn tắm
  await page.waitForFunction(() => {
    const pet = window.__worldScene.pet;
    return pet.currentAnimState === 'bathe';
  }, null, { timeout: 12000 });

  await page.waitForTimeout(600);

  const bathingState = await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    return {
      animKey: pet.sprite.anims.currentAnim?.key,
      textureKey: pet.sprite.texture?.key,
      currentAnimState: pet.currentAnimState,
      displayWidth: pet.sprite.displayWidth,
      displayHeight: pet.sprite.displayHeight,
      ratio: pet.sprite.displayWidth / pet.sprite.displayHeight,
      x: pet.sprite.x,
      y: pet.sprite.y,
      depth: pet.sprite.depth,
      shadowVisible: pet.shadow ? pet.shadow.visible : null
    };
  });
  console.log('Trạng thái cún khi đang tắm trong bồn:', bathingState);
  assert.equal(bathingState.animKey, 'pet_dog_bath', 'Cún phải đang chơi animation pet_dog_bath!');
  assert.notEqual(bathingState.animKey, 'pet_dog_dirty', 'Tuyệt đối không dùng pet_dog_dirty khi tắm!');
  assert.notEqual(bathingState.animKey, 'pet_dog_sad', 'Tuyệt đối không dùng pet_dog_sad khi tắm!');

  // Tọa độ cún phải ở giữa tâm mặt nước bồn tắm: x quanh 506, y quanh 575
  assert.ok(Math.abs(bathingState.x - 506) <= 5, `Tọa độ X (${bathingState.x}) phải nằm trong bồn tắm quanh 506!`);
  assert.ok(Math.abs(bathingState.y - 575) <= 5, `Tọa độ Y (${bathingState.y}) phải nằm trong bồn tắm quanh 575!`);

  // Tỉ lệ hình thể cún phải 1:1, không bị co dẹt hay méo mó
  assert.ok(Math.abs(bathingState.ratio - 1.0) < 0.08, `Tỉ lệ khung hình cún (${bathingState.ratio}) phải chuẩn 1:1, không được dẹt!`);

  // Chụp ảnh cún đang tắm trong game
  const screenshotPath1 = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\verify_dog_bathe_action_in_game.png';
  await page.screenshot({ path: screenshotPath1 });
  console.log('Đã lưu ảnh cún tắm:', screenshotPath1);

  // 3. Chờ tắm xong (thanh tiến trình chạy ~3.2s)
  console.log('Chờ cún tắm xong và nhảy ra ngoài cỏ ăn mừng...');
  await page.waitForFunction(() => {
    const scene = window.__worldScene;
    return !scene.currentPetStationAction;
  }, null, { timeout: 8000 });

  await page.waitForTimeout(600);

  const afterBathState = await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    return {
      x: pet.sprite.x,
      y: pet.sprite.y,
      shadowVisible: pet.shadow ? pet.shadow.visible : null,
      isBusy: pet.isBusyWithStation
    };
  });
  console.log('Trạng thái sau khi tắm xong:', afterBathState);
  // Sau khi tắm, cún nhảy ra khỏi bồn tắm về vị trí bậc cỏ (535, 640)
  assert.ok(Math.abs(afterBathState.x - 535) <= 15, `Cún phải nhảy ra ngoài bồn tắm X ~ 535 (thực tế: ${afterBathState.x})`);
  assert.ok(afterBathState.y >= 615 && afterBathState.y <= 650, `Cún phải nhảy ra ngoài bồn tắm Y ~ 640 (thực tế: ${afterBathState.y})`);
  assert.equal(afterBathState.shadowVisible, true, 'Bóng đổ mặt đất phải được hiển thị lại!');

  console.log('✅ TẤT CẢ KIỂM THỬ HOẠT ẢNH TẮM CÚN CON THÀNH CÔNG RỰC RỠ!');
} finally {
  await browser.close();
  await server.close();
}
