import { chromium } from 'playwright';
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('--- [Test] Kiểm Tra Toàn Diện: Phiên Bản Trò Chơi (ver 3.0.0) & Tối Ưu Máy Tính Bảng ---');
  const browser = await chromium.launch({ headless: true });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  const tabletViewports = [
    { name: 'iPad (4:3)', width: 1024, height: 768, isLandscape: true },
    { name: 'Android Tablet (16:10)', width: 1280, height: 800, isLandscape: true },
    { name: 'iPad Air / Pro (~3:2)', width: 1180, height: 820, isLandscape: true },
    { name: 'iPad Portrait (Turn Hint)', width: 768, height: 1024, isLandscape: false }
  ];

  for (const vp of tabletViewports) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      hasTouch: true,
      isMobile: true
    });
    const page = await context.newPage();
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Dismiss character select modal if open
    await page.evaluate(() => {
      document.querySelectorAll('#character-select-modal, .character-modal-backdrop').forEach(el => {
        el.style.display = 'none';
      });
    });

    if (vp.isLandscape) {
      // 1. Kiểm tra Version hiển thị ở góc phải
      const versionData = await page.evaluate(() => {
        const badge = document.getElementById('game-version-badge');
        const watermark = document.getElementById('stage-version-watermark');
        const metaViewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content');
        const bodyStyles = window.getComputedStyle(document.body);
        return {
          badgeText: badge ? badge.textContent.trim() : null,
          badgeVisible: badge ? badge.offsetParent !== null : false,
          watermarkText: watermark ? watermark.textContent.trim() : null,
          watermarkVisible: watermark ? watermark.offsetParent !== null : false,
          metaViewport,
          touchAction: bodyStyles.touchAction,
          overscrollBehavior: bodyStyles.overscrollBehavior,
          userSelect: bodyStyles.userSelect || bodyStyles.webkitUserSelect
        };
      });

      console.log(`[${vp.name}] Version & Touch checks:`, versionData);
      assert(versionData.badgeText && versionData.badgeText.includes('ver 3.0.0'), `Badge must show version ver 3.0.0. Found: ${versionData.badgeText}`);
      assert(versionData.watermarkText && versionData.watermarkText.includes('ver 3.0.0'), `Watermark must show version ver 3.0.0. Found: ${versionData.watermarkText}`);
      assert(versionData.metaViewport.includes('user-scalable=no'), 'Viewport meta must disable pinch-to-zoom for tablet gameplay');
      assert.strictEqual(versionData.touchAction, 'manipulation', 'Touch action must be manipulation to prevent double tap zoom delay');

      // 2. Kiểm tra Canvas Phaser render và căn giữa màn hình
      const canvasDims = await page.evaluate(() => {
        const canvas = document.querySelector('#game-root canvas');
        const stage = document.querySelector('.scene-stage');
        const stageRect = stage ? stage.getBoundingClientRect() : null;
        return {
          hasCanvas: Boolean(canvas),
          width: canvas ? canvas.width : 0,
          height: canvas ? canvas.height : 0,
          stageWidth: stageRect ? stageRect.width : 0,
          stageHeight: stageRect ? stageRect.height : 0
        };
      });
      console.log(`[${vp.name}] Canvas & Stage geometry:`, canvasDims);
      assert(canvasDims.hasCanvas && canvasDims.width > 0, 'Canvas must render on tablet');
      assert(canvasDims.stageWidth <= vp.width, 'Stage width must fit within tablet viewport width');

      // 3. Rotate hint must be hidden in landscape
      const rotateHintVisible = await page.evaluate(() => {
        const hint = document.querySelector('.rotate-hint');
        return hint ? window.getComputedStyle(hint).display !== 'none' : false;
      });
      assert.strictEqual(rotateHintVisible, false, 'Rotate hint must be hidden in landscape');

      if (vp.name.includes('iPad (4:3)')) {
        const artifactDir = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5');
        const shotPath = path.join(artifactDir, 'verified_ipad_tablet_landscape_version.png');
        await page.screenshot({ path: shotPath, fullPage: false });
        console.log(`Saved screenshot artifact: ${shotPath}`);
      }
    } else {
      // Portrait mode check: rotate hint should be visible to guide child to hold tablet horizontally
      const rotateHintVisible = await page.evaluate(() => {
        const hint = document.querySelector('.rotate-hint');
        return hint ? window.getComputedStyle(hint).display !== 'none' : false;
      });
      console.log(`[${vp.name}] Rotate hint visible in portrait:`, rotateHintVisible);
      assert.strictEqual(rotateHintVisible, true, 'Rotate hint must be visible when tablet is held vertically');

      const artifactDir = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5');
      const shotPath = path.join(artifactDir, 'verified_tablet_portrait_rotate_hint.png');
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`Saved screenshot artifact: ${shotPath}`);
    }

    await context.close();
  }

  await browser.close();
  console.log('\n✅ ALL TABLET AND VERSION TESTS PASSED WITH 100% SUCCESS!');
})();
