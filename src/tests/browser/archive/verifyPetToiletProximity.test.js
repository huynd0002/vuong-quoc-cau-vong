import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4186, strictPort: true } });
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
  console.log('--- KIỂM THỬ: THÚ CƯNG ĐI VỆ SINH PHẢI TỚI BỒN CẦU ---');
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4186/game.html', { waitUntil: 'networkidle' });
  await enterWorld(page);

  // Mở modal chăm sóc thú cưng và kích hoạt đi vệ sinh khi cún đang ở xa bồn cầu (bồn cầu tại x: 1040, y: 365, điểm đứng 1005, 395)
  const initialPet = await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    return {
      x: pet.sprite.x,
      y: pet.sprite.y,
      currentAnimState: pet.currentAnimState
    };
  });
  console.log(`Cún ban đầu tại: (${Math.round(initialPet.x)}, ${Math.round(initialPet.y)})`);

  // Gọi hành động đi vệ sinh qua dispatch event
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:pet-action-requested', {
      detail: { action: 'potty' }
    }));
  });

  // Chờ 500ms sau khi bấm: Modal đóng và cún bắt đầu bước đi (isMoving = true) hướng tới bồn cầu
  await page.waitForTimeout(550);
  const walkingPet = await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    return {
      x: pet.sprite.x,
      y: pet.sprite.y,
      isMoving: pet.isMoving,
      currentAnimState: pet.currentAnimState
    };
  });
  console.log(`Sau 550ms: Cún tại (${Math.round(walkingPet.x)}, ${Math.round(walkingPet.y)}), isMoving=${walkingPet.isMoving}`);
  assert.equal(walkingPet.isMoving, true, 'Cún phải đang đi về phía bồn cầu');
  assert.notEqual(walkingPet.currentAnimState, 'potty', 'Cún chưa được thực hiện hành động vệ sinh khi chưa tới bồn cầu!');

  // Đợi cún bước đến bồn cầu và chuyển sang trạng thái potty
  console.log('Đợi cún bước đến bồn cầu và chuyển sang trạng thái potty...');
  await page.waitForFunction(() => {
    const pet = window.__worldScene?.pet;
    return pet && pet.currentAnimState === 'potty';
  }, null, { timeout: 15000 });

  const arrivedPet = await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    return {
      x: pet.sprite.x,
      y: pet.sprite.y,
      currentAnimState: pet.currentAnimState,
      dist: Math.hypot(1005 - pet.sprite.x, 395 - pet.sprite.y)
    };
  });
  console.log(`Khi tới bồn cầu: Cún tại (${Math.round(arrivedPet.x)}, ${Math.round(arrivedPet.y)}), dist=${Math.round(arrivedPet.dist)}, anim=${arrivedPet.currentAnimState}`);
  assert.ok(arrivedPet.dist <= 30, 'Cún phải đứng sát bồn cầu');
  assert.equal(arrivedPet.currentAnimState, 'potty', 'Cún phải bắt đầu hành động potty tại bồn cầu');

  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_pet_potty_at_toilet.png' });
  console.log('✓ XÁC MINH CÚN ĐI ĐẾN BỒN CẦU MỚI ĐI VỆ SINH THÀNH CÔNG!');
} finally {
  await browser.close();
  await server.close();
}
