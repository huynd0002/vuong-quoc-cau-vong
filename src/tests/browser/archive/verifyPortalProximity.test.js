import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4185, strictPort: true } });
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
  console.log('--- BẮT ĐẦU KIỂM THỬ: ĐIỀU CHỈNH CỬA THẦN KỲ (TELEPORT PORTAL PROXIMITY) ---');
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.text().includes('portal') || msg.text().includes('warp')) {
      console.log('BROWSER CONSOLE:', msg.text());
    }
  });

  await page.goto('http://127.0.0.1:4185/game.html', { waitUntil: 'networkidle' });
  await enterWorld(page);

  // 1. Kiểm tra vị trí khởi tạo của Bé Sâu và Cửa Thần Kỳ
  const initialInfo = await page.evaluate(() => {
    const scene = window.__worldScene;
    const hero = scene.hero;
    const portal = scene.returnPortal || (scene.portals && scene.portals[0]);
    return {
      heroX: hero.getX(),
      heroY: hero.getY(),
      portalX: portal.x,
      portalY: portal.y,
      isWarping: portal.isWarping,
      dist: Math.hypot(hero.getX() - portal.x, hero.getY() - (portal.y + 15))
    };
  });

  console.log(`Bé Sâu ban đầu tại: (${initialInfo.heroX}, ${initialInfo.heroY}), Cửa Thần Kỳ tại: (${initialInfo.portalX}, ${initialInfo.portalY}), Khoảng cách: ${Math.round(initialInfo.dist)}px`);
  assert.equal(initialInfo.isWarping, false, 'Cửa thần kỳ ban đầu chưa được kích hoạt');
  assert.ok(initialInfo.dist > 150, 'Bé Sâu ban đầu ở xa cửa thần kỳ');

  // 2. Click / Tương tác vào Cửa Thần Kỳ từ xa
  console.log('Bấm tương tác vào Cửa Thần Kỳ từ xa...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const portal = scene.returnPortal || (scene.portals && scene.portals[0]);
    portal.handleInteract();
  });

  // Chờ 300ms sau khi bấm: Bé Sâu phải đang đi bộ đến cửa, CHƯA BỊ HÚT VÀO NGAY!
  await page.waitForTimeout(350);
  const movingInfo = await page.evaluate(() => {
    const scene = window.__worldScene;
    const hero = scene.hero;
    const portal = scene.returnPortal || (scene.portals && scene.portals[0]);
    return {
      heroX: hero.getX(),
      heroY: hero.getY(),
      isMoving: hero.isMoving,
      isWarping: portal.isWarping,
      dist: Math.hypot(hero.getX() - portal.x, hero.getY() - (portal.y + 15))
    };
  });

  console.log(`Sau 350ms: Bé Sâu di chuyển đến (${Math.round(movingInfo.heroX)}, ${Math.round(movingInfo.heroY)}), isMoving=${movingInfo.isMoving}, isWarping=${movingInfo.isWarping}`);
  assert.equal(movingInfo.isMoving, true, 'Bé Sâu phải đang di chuyển về phía cửa thần kỳ');
  assert.equal(movingInfo.isWarping, false, 'Cửa thần kỳ CHƯA ĐƯỢC hút vào khi nhân vật còn ở xa!');
  assert.ok(movingInfo.heroX < initialInfo.heroX, 'Bé Sâu đang bước về phía trái (hướng cửa x: 180)');

  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_hero_walking_to_portal.png' });

  // 3. Đợi Bé Sâu bước đến sát Cửa Thần Kỳ (dist <= 35px)
  console.log('Đợi Bé Sâu bước đến sát cửa thần kỳ...');
  await page.waitForFunction(() => {
    const scene = window.__worldScene;
    const portal = scene.returnPortal || (scene.portals && scene.portals[0]);
    return portal.isWarping === true;
  }, null, { timeout: 10000 });

  const arriveInfo = await page.evaluate(() => {
    const scene = window.__worldScene;
    const hero = scene.hero;
    const portal = scene.returnPortal || (scene.portals && scene.portals[0]);
    return {
      heroX: hero.getX(),
      heroY: hero.getY(),
      portalX: portal.x,
      portalY: portal.y,
      isWarping: portal.isWarping,
      dist: Math.hypot(hero.getX() - portal.x, hero.getY() - (portal.y + 15))
    };
  });

  console.log(`Khi bị hút vào: Bé Sâu tại (${Math.round(arriveInfo.heroX)}, ${Math.round(arriveInfo.heroY)}), Cửa tại (${arriveInfo.portalX}, ${arriveInfo.portalY}), Khoảng cách: ${Math.round(arriveInfo.dist)}px, isWarping=${arriveInfo.isWarping}`);
  assert.equal(arriveInfo.isWarping, true, 'Cửa thần kỳ đã kích hoạt hút Bé Sâu vào');
  assert.ok(arriveInfo.dist <= 35, `Bé Sâu phải đứng sát cửa (<= 35px), thực tế: ${Math.round(arriveInfo.dist)}px`);

  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_hero_at_portal_suction.png' });

  // 4. Chờ hoàn tất chuyển map
  await page.waitForFunction(() => {
    return window.__worldScene?.currentMapId === 'map1';
  }, null, { timeout: 15000 });

  console.log('Dịch chuyển sang map1 thành công!');
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_portal_warp_complete.png' });

  console.log('✓ TẤT CẢ KIỂM THỬ XÁC MINH CỬA THẦN KỲ ĐÃ ĐẠT 100%!');
} finally {
  await browser.close();
  await server.close();
}
