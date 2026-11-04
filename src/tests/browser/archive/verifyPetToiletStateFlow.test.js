import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4193, strictPort: true } });
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
  console.log('--- KIỂM THỬ: TRẠNG THÁI ĐI VỆ SINH PHẢI TỚI BỒN CẦU MỚI BẮT ĐẦU VỆ SINH ---');
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4193/game.html', { waitUntil: 'networkidle' });
  await enterWorld(page);

  // 1. Cho cún đứng ở xa bồn cầu (ví dụ tại x: 450, y: 500)
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const pet = scene.pet;
    pet.sprite.x = 450;
    pet.sprite.y = 500;
    pet.playIdle(true);
  });

  const petPosBefore = await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    return { x: pet.sprite.x, y: pet.sprite.y, anim: pet.currentAnimState };
  });
  console.log('Vị trí cún ban đầu ở xa bồn cầu:', petPosBefore);

  // 2. Kích hoạt trực tiếp hàm playPotty() khi cún đang ở xa bồn cầu
  console.log('Gọi playPotty() khi cún đang ở xa bồn cầu...');
  await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    pet.playPotty();
  });

  // Chờ 300ms: Kiểm tra cún phải BƯỚC ĐI về bồn cầu, CHƯA ĐƯỢC đi vệ sinh tại chỗ!
  await page.waitForTimeout(300);
  const midWalkInfo = await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    return {
      x: pet.sprite.x,
      y: pet.sprite.y,
      isMoving: pet.isMoving,
      currentAnimState: pet.currentAnimState,
      distToToilet: Math.hypot(1005 - pet.sprite.x, 395 - pet.sprite.y)
    };
  });
  console.log('Thông số cún khi đang bước về phía bồn cầu:', midWalkInfo);

  assert.equal(midWalkInfo.isMoving, true, 'Cún phải đang bước đi di chuyển (isMoving=true)');
  assert.notEqual(midWalkInfo.currentAnimState, 'potty', 'Cún tuyệt đối KHÔNG ĐƯỢC ở trạng thái potty khi chưa đến bồn cầu!');
  assert.ok(midWalkInfo.distToToilet > 50, 'Cún vẫn đang trên đường đi đến bồn cầu');

  // 3. Chờ cún bước tới sát bồn cầu và bắt đầu vệ sinh
  console.log('Đợi cún bước tới sát bồn cầu (1005, 395) và bắt đầu vệ sinh...');
  await page.waitForFunction(() => {
    const scene = window.__worldScene;
    const pet = scene?.pet;
    const dist = Math.hypot(1005 - pet.sprite.x, 395 - pet.sprite.y);
    return dist <= 30 && pet.currentAnimState === 'potty';
  }, null, { timeout: 15000 });

  const arriveInfo = await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    return {
      x: pet.sprite.x,
      y: pet.sprite.y,
      currentAnimState: pet.currentAnimState,
      distToToilet: Math.hypot(1005 - pet.sprite.x, 395 - pet.sprite.y)
    };
  });
  console.log('Thông số cún khi đã đến bồn cầu và bắt đầu vệ sinh:', arriveInfo);
  assert.ok(arriveInfo.distToToilet <= 25, 'Cún phải đứng sát vị trí bồn cầu (1005, 395)');
  assert.equal(arriveInfo.currentAnimState, 'potty', 'Cún phải bắt đầu hành động vệ sinh tại bồn cầu');

  // Chụp ảnh bằng chứng
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_potty_state_walks_to_toilet.png' });

  console.log('>>> XÁC MINH HOÀN TẤT: TRẠNG THÁI VỆ SINH LUÔN ĐI ĐẾN BỒN CẦU MỚI BẮT ĐẦU! <<<');
} catch (err) {
  console.error('LỖI KIỂM THỬ:', err);
  process.exitCode = 1;
} finally {
  await browser.close();
  await server.close();
}
