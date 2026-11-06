import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const gameHtmlPath = path.join(root, 'game.html');

async function testBlankScreenFix() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  });

  const errors = [];
  page.on('pageerror', err => {
    errors.push(err.message);
  });

  await page.goto('file:///' + gameHtmlPath.replace(/\\/g, '/'), { waitUntil: 'load' });
  await page.waitForTimeout(4000);

  const state = await page.evaluate(() => {
    const game = window.__PHASER_GAME__;
    const ws = window.__worldScene;
    return {
      hasGame: Boolean(game),
      hasWorldScene: Boolean(ws),
      worldSceneActive: Boolean(ws?.sys?.isActive()),
      hasHero: Boolean(ws?.hero?.sprite?.active),
      childrenCount: ws?.children?.list?.length || 0,
      versionBadge: document.getElementById('game-version-badge')?.textContent
    };
  });

  assert.strictEqual(state.hasGame, true, 'Phaser game phải được khởi tạo');
  assert.strictEqual(state.hasWorldScene, true, 'WorldScene phải tồn tại');
  assert.strictEqual(state.worldSceneActive, true, 'WorldScene phải đang hoạt động (active)');
  assert.strictEqual(state.hasHero, true, 'Nhân vật chính (Hero) phải được render trên màn hình');
  assert.ok(state.childrenCount > 20, 'WorldScene phải render đầy đủ cảnh vật và props');
  assert.strictEqual(state.versionBadge, 'ver 3.5.7', 'Phiên bản phải là ver 3.5.7');
  assert.strictEqual(errors.length, 0, 'Không được có lỗi JavaScript nào xảy ra');

  console.log('✓ TEST HOÀN TOÀN THÀNH CÔNG: Màn hình game khởi động mượt mà, đầy đủ bản đồ, Hero và Props (Không còn bị màn hình xanh trống)!');

  await browser.close();
}

testBlankScreenFix().catch(err => {
  console.error('Test thất bại:', err);
  process.exit(1);
});
