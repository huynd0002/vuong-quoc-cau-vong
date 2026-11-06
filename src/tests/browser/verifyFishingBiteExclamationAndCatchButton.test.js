import { chromium } from 'playwright';
import path from 'path';
import assert from 'node:assert/strict';

const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

(async () => {
  console.log('--- [Test] Kiểm Tra Cơ Chế Câu Cá: Thả Cần, ui/exclamation VFX & Nút BẮT Rung Rung 5s ---');

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERR:', err.message));

  console.log('Đang mở game: http://localhost:5173/dev.html ...');
  await page.goto('http://localhost:5173/dev.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Đóng modal chọn nhân vật nếu có
  const startBtn = await page.$('.char-start-adventure-cta');
  if (startBtn) {
    await startBtn.click();
    await page.waitForTimeout(1000);
  }

  // Chờ canvas sẵn sàng
  await page.waitForSelector('#game-root canvas', { timeout: 10000 });
  await page.waitForTimeout(1500);

  // 1. Kiểm tra texture vfx_exclamation_sheet đã được nạp thành công trong Phaser
  const textureLoaded = await page.evaluate(() => {
    return window.__worldScene?.textures?.exists('vfx_exclamation_sheet') || false;
  });
  console.log('Phaser Texture vfx_exclamation_sheet exists:', textureLoaded);
  assert.equal(textureLoaded, true, 'Texture vfx_exclamation_sheet phải được load trong Phaser PreloadScene');

  // 2. Chuyển sang bản đồ Hồ Câu Lá Sen (map_fishing_pond)
  console.log('Chuyển tới Hồ Câu Lá Sen (map_fishing_pond)...');
  await page.evaluate(() => {
    window.__worldScene?.scene?.restart?.({ mapId: 'map_fishing_pond' });
  });
  await page.waitForTimeout(2000);

  // Đặt vị trí Hero trên cầu gỗ bến câu
  await page.evaluate(() => {
    const ws = window.__worldScene;
    if (ws?.hero) {
      ws.hero.setPosition(680, 360);
      ws.updateDockFishingProximityButton(680, 360);
    }
  });
  await page.waitForTimeout(600);

  // 3. Kiểm tra nút bắt đầu câu cá trên bến (#btn-start-fishing-dock)
  const dockBtnVisible = await page.evaluate(() => {
    const btn = document.getElementById('btn-start-fishing-dock');
    return btn && btn.style.display !== 'none';
  });
  console.log('Nút bến câu cá hiển thị:', dockBtnVisible);
  assert.equal(dockBtnVisible, true, 'Nút bắt đầu câu cá trên bến gỗ phải hiển thị');

  // 4. Bấm bắt đầu câu cá -> Bắt đầu Thả cần
  console.log('Bấm "Bắt đầu câu cá" để thả cần...');
  await page.evaluate(() => {
    document.getElementById('btn-start-fishing-dock')?.click();
  });
  await page.waitForTimeout(200);

  const isCasting = await page.evaluate(() => {
    const ws = window.__worldScene;
    return ws?.onMapFishingState?.phase === 'casting';
  });
  console.log('Trạng thái thả cần (casting):', isCasting);
  assert.equal(isCasting, true, 'Giai đoạn thả cần phải là casting');

  // 5. Chờ cá cắn mồi (biteTimeMs ~ 650ms), kiểm tra VFX ui/exclamation và nút BẮT rung rung 5s
  console.log('Chờ cá cắn mồi, kiểm tra VFX ui/exclamation và nút BẮT...');
  await page.waitForFunction(() => {
    const ws = window.__worldScene;
    return ws?.onMapFishingState?.phase === 'bite_waiting';
  }, { timeout: 4000 });
  await page.waitForTimeout(250); // Để VFX Exclamation bung nảy rực rỡ trên đầu bé

  // Kiểm tra VFX exclamation đã được tạo
  const vfxExclamationAnimExists = await page.evaluate(() => {
    return window.__worldScene?.anims?.exists('vfx_exclamation_anim') || false;
  });
  console.log('Phaser Animation vfx_exclamation_anim exists:', vfxExclamationAnimExists);
  assert.equal(vfxExclamationAnimExists, true, 'Hoạt ảnh vfx_exclamation_anim phải được tạo trong Phaser');

  // Chụp ảnh bằng chứng 1: ui/exclamation VFX & Nút BẮT rung rung
  const shot1 = path.join(artifactDir, 'verified_fishing_exclamation_vfx.png');
  await page.screenshot({ path: shot1 });
  console.log('✓ Đã lưu ảnh VFX Exclamation & nút BẮT:', shot1);

  // 6. Kiểm tra các thuộc tính của Nút BẮT (#btn-onmap-fishing-catch) & Thanh đếm ngược 5s
  const catchBtnInfo = await page.evaluate(() => {
    const btn = document.getElementById('btn-onmap-fishing-catch');
    const container = document.getElementById('onmap-bite-catch-container');
    const timerVal = document.getElementById('bite-timer-val');
    const timerBar = document.getElementById('bite-timer-bar-fill');
    if (!btn || !container) return null;

    const btnStyle = window.getComputedStyle(btn);
    return {
      exists: true,
      text: btn.innerText.trim(),
      hasShakeAnim: btnStyle.animation.includes('biteRumbleShake'),
      hasPulseAnim: btnStyle.animation.includes('biteGlowRingPulse'),
      timerText: timerVal ? timerVal.textContent : '',
      timerBarWidth: timerBar ? timerBar.style.width : ''
    };
  });
  console.log('Thông tin Nút BẮT rung rung:', catchBtnInfo);
  assert.ok(catchBtnInfo, 'Nút BẮT phải tồn tại trên màn hình');
  assert.ok(catchBtnInfo.text.includes('BẮT'), 'Nút phải có chữ BẮT');
  assert.equal(catchBtnInfo.hasShakeAnim, true, 'Nút phải có animation rung rung biteRumbleShake');
  assert.equal(catchBtnInfo.hasPulseAnim, true, 'Nút phải có animation hào quang biteGlowRingPulse');

  // Chờ 1 giây để quan sát thanh đếm ngược giảm dần
  await page.waitForTimeout(1000);
  const remainingSec = await page.evaluate(() => {
    return parseFloat(document.getElementById('bite-timer-val')?.textContent || '0');
  });
  console.log('Thời gian còn lại sau 1s:', remainingSec);
  assert.ok(remainingSec < 4.9 && remainingSec > 2.5, 'Thời gian đếm ngược 5s phải đang giảm dần');

  const shot2 = path.join(artifactDir, 'verified_fishing_catch_button_shaking.png');
  await page.screenshot({ path: shot2 });
  console.log('✓ Đã lưu ảnh Nút BẮT rung rung cận cảnh:', shot2);

  // 7. Bé bấm vào nút "BẮT!" -> Chuyển sang Audition minigame như hiện tại
  console.log('Bấm nút "BẮT!"...');
  await page.evaluate(() => {
    document.getElementById('btn-onmap-fishing-catch')?.click();
  });
  await page.waitForTimeout(300);

  const auditionCheck = await page.evaluate(() => {
    const ws = window.__worldScene;
    const auditionEl = document.getElementById('onmap-fishing-audition');
    const catchPrompt = document.getElementById('onmap-bite-catch-container');
    return {
      phase: ws?.onMapFishingState?.phase,
      auditionMounted: Boolean(auditionEl),
      catchPromptCleared: !catchPrompt
    };
  });
  console.log('Kết quả sau khi bấm BẮT:', auditionCheck);
  assert.equal(auditionCheck.phase, 'audition', 'Trạng thái câu cá phải chuyển sang audition');
  assert.equal(auditionCheck.auditionMounted, true, 'Thanh audition minigame phải được mount');
  assert.equal(auditionCheck.catchPromptCleared, true, 'Nút BẮT phải được dọn dẹp biến mất');

  const shot3 = path.join(artifactDir, 'verified_fishing_audition_started_after_catch.png');
  await page.screenshot({ path: shot3 });
  console.log('✓ Đã lưu ảnh Audition Minigame bắt đầu sau khi bấm BẮT:', shot3);

  // Dọn dẹp audition
  await page.evaluate(() => {
    window.__worldScene?.stopOnMapFishing(false);
  });
  await page.waitForTimeout(500);

  // 8. Kiểm tra kịch bản Quá 5 giây không bấm -> Cá bơi mất
  console.log('Kiểm tra kịch bản quá 5 giây bé không bấm BẮT (Cá bơi mất)...');
  await page.evaluate(() => {
    document.getElementById('btn-start-fishing-dock')?.click();
  });
  await page.waitForFunction(() => {
    return window.__worldScene?.onMapFishingState?.phase === 'bite_waiting';
  }, { timeout: 4000 });

  console.log('Đang đợi hết 5.2 giây để kiểm tra cá tự thoát...');
  await page.waitForTimeout(5400);

  const timeoutCheck = await page.evaluate(() => {
    const ws = window.__worldScene;
    const catchPrompt = document.getElementById('onmap-bite-catch-container');
    const startDockBtn = document.getElementById('btn-start-fishing-dock');
    return {
      fishingState: ws?.onMapFishingState,
      catchPromptCleared: !catchPrompt,
      dockBtnRestored: startDockBtn && startDockBtn.style.display !== 'none'
    };
  });
  console.log('Kết quả sau 5s quá hạn:', timeoutCheck);
  assert.equal(timeoutCheck.fishingState, null, 'Trạng thái câu cá phải được reset về null khi cá bơi đi');
  assert.equal(timeoutCheck.catchPromptCleared, true, 'Nút BẮT phải tự động biến mất khi hết giờ');
  assert.equal(timeoutCheck.dockBtnRestored, true, 'Nút bắt đầu câu trên bến phải được khôi phục để bé câu lại');

  const shot4 = path.join(artifactDir, 'verified_fishing_escape_timeout.png');
  await page.screenshot({ path: shot4 });
  console.log('✓ Đã lưu ảnh Cá bơi mất khi quá 5s & khôi phục bến câu:', shot4);

  console.log('🎉 TOÀN BỘ CÁC BƯỚC KIỂM TRA CƠ CHẾ CÂU CÁ, VFX EXCLAMATION & NÚT BẮT RUNG RUNG 5S ĐÃ ĐẠT 100%!');
  await browser.close();
})();
