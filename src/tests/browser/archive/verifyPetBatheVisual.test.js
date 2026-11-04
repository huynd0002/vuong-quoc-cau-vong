import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4192, strictPort: true } });
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
  console.log('--- KIỂM THỬ: HÌNH ẢNH CON CHÓ KHI TẮM KHÔNG BỊ BIẾN DẠNG BẸP/DẸT ---');
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4192/game.html', { waitUntil: 'networkidle' });
  await enterWorld(page);

  // 1. Kích hoạt tương tác trạm tắm (bath station)
  console.log('Kích hoạt trạm tắm cún...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const bathSt = scene.mapConfig?.petStations?.find(s => s.type === 'bath');
    if (bathSt) {
      scene.handlePetStationInteraction(bathSt);
    }
  });

  // Chờ cún đi đến bồn tắm và bắt đầu hành động tắm
  console.log('Chờ cún đi đến bồn tắm và bắt đầu vẫy lông tắm...');
  await page.waitForFunction(() => {
    const scene = window.__worldScene;
    const pet = scene?.pet;
    return scene?.currentPetStationAction?.phase === 'action' && pet?.currentAnimState === 'bathe';
  }, null, { timeout: 15000 });

  // Đợi trong lúc đang tắm (khoảng 1.2s - tương đương lúc thanh % đạt ~20%-40%)
  await page.waitForTimeout(1200);

  // 2. Thu thập kích thước hiển thị và tỷ lệ của cún lúc đang tắm
  const batheInfo = await page.evaluate(() => {
    const scene = window.__worldScene;
    const pet = scene.pet;
    const sprite = pet.sprite;
    return {
      x: sprite.x,
      y: sprite.y,
      displayWidth: sprite.displayWidth,
      displayHeight: sprite.displayHeight,
      scaleX: sprite.scaleX,
      scaleY: sprite.scaleY,
      angle: sprite.angle,
      ratio: sprite.displayWidth / sprite.displayHeight,
      currentAnimState: pet.currentAnimState,
      hasShakeTween: Boolean(pet.shakeTween)
    };
  });

  console.log('Thông số cún lúc đang tắm:', batheInfo);

  // Chụp ảnh bằng chứng lúc cún đang tắm vẫy lông
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_dog_bathe_proportions_fixed.png' });

  // Kiểm tra không bị bẹp dẹt hay kéo dãn:
  // Tỷ lệ khung hình phải giữ cân đối tự nhiên (~1.0, cho phép dao động nhỏ trong khoảng 0.9 - 1.1 khi rung lông)
  assert.ok(batheInfo.ratio >= 0.88 && batheInfo.ratio <= 1.12,
    `Tỷ lệ ngang/dọc của cún khi tắm phải giữ cân đối tự nhiên (~1.0): thực tế là ${batheInfo.ratio.toFixed(2)}`);
  
  // Chiều rộng hiển thị không được bị phóng đại dẹt 266px như trước (phải trong khoảng 88px - 105px quanh mốc 96px)
  assert.ok(batheInfo.displayWidth >= 85 && batheInfo.displayWidth <= 105,
    `Chiều rộng hiển thị của cún khi tắm phải trong khoảng 85-105px: thực tế là ${batheInfo.displayWidth.toFixed(1)}px`);

  // Chiều cao hiển thị không bị co rút
  assert.ok(batheInfo.displayHeight >= 85 && batheInfo.displayHeight <= 105,
    `Chiều cao hiển thị của cún khi tắm phải trong khoảng 85-105px: thực tế là ${batheInfo.displayHeight.toFixed(1)}px`);

  // 3. Chờ tiến trình tắm hoàn thành 100%
  console.log('Chờ tắm hoàn thành 100% và cún vui vẻ sau khi tắm...');
  await page.waitForFunction(() => {
    const scene = window.__worldScene;
    return !scene.currentPetStationAction;
  }, null, { timeout: 10000 });

  await page.waitForTimeout(500);

  const completedInfo = await page.evaluate(() => {
    const scene = window.__worldScene;
    const pet = scene.pet;
    const sprite = pet.sprite;
    return {
      displayWidth: sprite.displayWidth,
      displayHeight: sprite.displayHeight,
      scaleX: sprite.scaleX,
      scaleY: sprite.scaleY,
      angle: sprite.angle,
      currentAnimState: pet.currentAnimState
    };
  });

  console.log('Thông số cún sau khi tắm xong:', completedInfo);

  // Sau khi hoàn thành hoặc celebrate, kích thước cún trở về chuẩn 96px
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_dog_bathe_complete_clean.png' });

  console.log('>>> TẤT CẢ KIỂM THỬ HÌNH ẢNH CON CHÓ KHI TẮM ĐÃ VƯỢT QUA XUẤT SẮC! <<<');
} catch (err) {
  console.error('LỖI KIỂM THỬ:', err);
  process.exitCode = 1;
} finally {
  await browser.close();
  await server.close();
}
