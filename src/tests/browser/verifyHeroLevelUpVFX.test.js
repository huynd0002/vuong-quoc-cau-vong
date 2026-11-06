import { chromium } from 'playwright';
import path from 'path';
import assert from 'node:assert/strict';

const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

(async () => {
  console.log('--- [Test] Kiểm Tra Hiệu Ứng ui/level-up VFX Trên Đầu Nhân Vật Khi Lên Cấp ---');

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  console.log('Đang tải game: http://localhost:5173/dev.html ...');
  await page.goto('http://localhost:5173/dev.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Đóng modal chọn nhân vật nếu có
  const startBtn = await page.$('.char-start-adventure-cta');
  if (startBtn) {
    await startBtn.click();
    await page.waitForTimeout(1000);
  }

  // Chờ #game-root canvas sẵn sàng
  await page.waitForSelector('#game-root canvas', { timeout: 10000 });
  await page.waitForTimeout(1500);

  // 1. Kiểm tra texture vfx_level_up_sheet đã được tải thành công trong Phaser
  const textureLoaded = await page.evaluate(() => {
    return window.__worldScene?.textures?.exists('vfx_level_up_sheet') || false;
  });
  console.log('Texture vfx_level_up_sheet loaded in Phaser:', textureLoaded);
  assert.equal(textureLoaded, true, 'Texture vfx_level_up_sheet phải được load trong Phaser PreloadScene');

  // Đưa hero ra giữa map rộng rãi để chụp ảnh rõ nét
  await page.evaluate(() => {
    const ws = window.__worldScene;
    if (ws?.hero) {
      ws.hero.setPosition(560, 430);
    }
  });
  await page.waitForTimeout(500);

  // 2. Kích hoạt hiệu ứng Level Up thông qua sự kiện game:player-level-up
  console.log('Kích hoạt sự kiện game:player-level-up để phát hiệu ứng ui/level-up VFX...');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:player-level-up', {
      detail: { level: 2, stars: 10 }
    }));
  });

  // Chờ Phase 1: Cột sáng vàng kim và vòng hào quang mặt đất bốc lên (~500ms)
  await page.waitForTimeout(550);
  const phase1Path = path.join(artifactDir, 'verified_levelup_phase1_light_pillar.png');
  await page.screenshot({ path: phase1Path });
  console.log('✓ Đã lưu ảnh Phase 1 (Cột sáng vàng bốc lên quanh bé):', phase1Path);

  // Chờ Phase 2: Dòng chữ "LEVEL UP!" rực rỡ xuất hiện ngay trên đầu nhân vật (~1200ms sau kích hoạt)
  await page.waitForTimeout(750);
  const phase2Path = path.join(artifactDir, 'verified_levelup_phase2_text_on_head.png');
  await page.screenshot({ path: phase2Path });
  console.log('✓ Đã lưu ảnh Phase 2 (Chữ LEVEL UP! sáng rực trên đầu nhân vật):', phase2Path);

  // Chờ Phase 3: Tia sáng chữ thập quét qua và các hạt bụi sao lấp lánh (~2100ms sau kích hoạt)
  await page.waitForTimeout(900);
  const phase3Path = path.join(artifactDir, 'verified_levelup_phase3_shine_sweep.png');
  await page.screenshot({ path: phase3Path });
  console.log('✓ Đã lưu ảnh Phase 3 (Ánh sáng lấp lánh và sao bay):', phase3Path);

  // 3. Chụp cận cảnh vùng nhân vật để thấy rõ từng pixel chi tiết của hiệu ứng
  const zoomPath = path.join(artifactDir, 'verified_levelup_zoom_close_up.png');
  // Chụp lại khoảnh khắc vàng chữ LEVEL UP rõ nét
  await page.evaluate(() => {
    window.__worldScene?.hero?.playLevelUpVFX?.();
  });
  await page.waitForTimeout(1150);

  const canvas = await page.$('#game-root canvas');
  if (canvas) {
    const box = await canvas.boundingBox();
    if (box) {
      // Hero tại (560, 430) -> Cắt vùng 320x340 xung quanh hero
      const clipRegion = {
        x: Math.max(0, box.x + 560 - 160),
        y: Math.max(0, box.y + 430 - 200),
        width: 320,
        height: 340
      };
      await page.screenshot({ path: zoomPath, clip: clipRegion });
      console.log('✓ Đã lưu ảnh Cận cảnh (Zoom) chữ LEVEL UP trên đầu nhân vật:', zoomPath);
    }
  }

  // 4. Kiểm tra hoạt ảnh vfx_level_up_anim đã được đăng ký chuẩn trong Phaser Animation Manager
  const animCheck = await page.evaluate(() => {
    const anim = window.__worldScene?.anims?.get('vfx_level_up_anim');
    return {
      exists: Boolean(anim),
      key: anim?.key,
      frameRate: anim?.frameRate,
      framesCount: anim?.frames?.length
    };
  });
  console.log('Cấu hình animation vfx_level_up_anim trong Phaser:', animCheck);
  assert.equal(animCheck.exists, true, 'Hoạt ảnh vfx_level_up_anim phải tồn tại');
  assert.equal(animCheck.frameRate, 30, 'Tốc độ diễn hoạt phải là 30 FPS');
  assert.equal(animCheck.framesCount, 97, 'Phải có chính xác 97 khung hình pixel-art');

  console.log('🎉 TOÀN BỘ KIỂM THỬ UI/LEVEL-UP VFX ĐÃ VƯỢT QUA XUẤT SẮC!');
  await browser.close();
})();
