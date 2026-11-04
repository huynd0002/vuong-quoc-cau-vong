import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4187, strictPort: true } });
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
  console.log('--- BẮT ĐẦU KIỂM THỬ: ĐÁM MÂY OPACITY 100% VÀ BÓNG MÂY MẶT ĐẤT ---');
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4187/game.html', { waitUntil: 'networkidle' });
  await enterWorld(page);

  // Sinh 1 đám mây cưỡng bức để kiểm tra hiển thị
  console.log('Sinh đám mây kiểm thử với bóng đổ mặt đất...');
  const cloudInfo = await page.evaluate(() => {
    const cloudEffect = window.__cloudEffect;
    if (!cloudEffect) return null;
    const cloud = cloudEffect.spawnCloud({
      x: 640,
      y: 120,
      direction: 'left_to_right',
      angleIndex: 0,
      forceShadow: true
    });
    return {
      spriteAlpha: cloud.sprite.alpha,
      spriteDepth: cloud.sprite.depth,
      hasShadow: cloud.hasShadow,
      shadowAlpha: cloud.groundShadow.alpha,
      shadowDepth: cloud.groundShadow.depth,
      shadowX: cloud.groundShadow.x,
      shadowY: cloud.groundShadow.y,
      spriteX: cloud.sprite.x,
      spriteY: cloud.sprite.y
    };
  });

  console.log('Thông số đám mây:', cloudInfo);
  assert.equal(cloudInfo.spriteAlpha, 1.0, 'Đám mây phải đạt Opacity 100% (alpha = 1.0)');
  assert.equal(cloudInfo.hasShadow, true, 'Đám mây phải có bóng đổ mặt đất');
  assert.ok(cloudInfo.shadowAlpha >= 0.45, 'Bóng mây mặt đất phải rõ ràng');
  assert.equal(cloudInfo.shadowDepth, 2, 'Bóng mây mặt đất có depth 2');
  assert.ok(cloudInfo.shadowY > cloudInfo.spriteY + 200, 'Bóng mây phải đổ xuống mặt đất (y > 320)');

  // Chờ 1s để mây bay một chút và chụp ảnh lưu artifact
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_cloud_100_opacity_and_shadow.png' });

  console.log('✓ XÁC MINH ĐÁM MÂY OPACITY 100% VÀ BÓNG ĐỔ MẶT ĐẤT THÀNH CÔNG 100%!');
} finally {
  await browser.close();
  await server.close();
}
