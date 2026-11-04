import { chromium } from 'playwright';
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('--- [Browser Test] Kiểm Tra Virtual Joystick & Tối Ưu Màn Hình Máy Tính Bảng (Tablet) ---');
  const browser = await chromium.launch({ headless: true });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;
  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

  const tabletViewports = [
    { name: 'iPad (1024x768)', width: 1024, height: 768 },
    { name: 'iPad Air/Pro (1180x820)', width: 1180, height: 820 },
    { name: 'Samsung Galaxy Tab (1280x800)', width: 1280, height: 800 }
  ];

  for (const vp of tabletViewports) {
    console.log(`\n=== 1. Thử nghiệm trên máy tính bảng: ${vp.name} ===`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      hasTouch: true,
      isMobile: true
    });

    const page = await context.newPage();
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Đóng popup chọn nhân vật nếu đang mở
    await page.evaluate(() => {
      document.querySelectorAll('#character-select-modal, .character-modal-backdrop').forEach(el => {
        el.style.display = 'none';
      });
    });

    // 1. Kiểm tra sự hiện diện của Virtual Joystick và Topbar Button
    const joystickInfo = await page.evaluate(() => {
      const zone = document.getElementById('virtual-joystick-zone');
      const base = document.getElementById('virtual-joystick-base');
      const knob = document.getElementById('virtual-joystick-knob');
      const toggleBtn = document.getElementById('btn-toggle-joystick');

      const isVisible = (el) => {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      };

      return {
        zoneExists: !!zone,
        zoneVisible: isVisible(zone),
        baseExists: !!base,
        knobExists: !!knob,
        toggleBtnExists: !!toggleBtn,
        toggleBtnVisible: isVisible(toggleBtn),
        zoneRect: zone ? zone.getBoundingClientRect() : null,
        baseRect: base ? base.getBoundingClientRect() : null
      };
    });

    console.log(`[${vp.name}] Trạng thái Joystick ban đầu:`, {
      zoneVisible: joystickInfo.zoneVisible,
      baseExists: joystickInfo.baseExists,
      knobExists: joystickInfo.knobExists,
      toggleBtnVisible: joystickInfo.toggleBtnVisible
    });

    assert.ok(joystickInfo.zoneExists, 'Vùng virtual-joystick-zone phải tồn tại');
    assert.ok(joystickInfo.zoneVisible, 'Vùng virtual-joystick-zone phải hiển thị');
    assert.ok(joystickInfo.baseExists, 'Đế xoay virtual-joystick-base phải tồn tại');
    assert.ok(joystickInfo.knobExists, 'Núm gạt virtual-joystick-knob phải tồn tại');
    assert.ok(joystickInfo.toggleBtnExists, 'Nút bật/tắt joystick trên topbar phải tồn tại');

    // 2. Lấy vị trí ban đầu của nhân vật Bé Sâu
    const initialPos = await page.evaluate(() => {
      const ws = window.__worldScene;
      if (!ws || !ws.hero) return null;
      return { x: ws.hero.getX(), y: ws.hero.getY() };
    });
    console.log(`[${vp.name}] Tọa độ xuất phát của Bé Sâu:`, initialPos);
    assert.ok(initialPos, 'Bé Sâu phải tồn tại trong WorldScene');

    // 3. Thao tác điều khiển Cần gạt ảo: Kéo sang phải và xuống dưới (+X, +Y)
    console.log(`[${vp.name}] Giả lập chạm & kéo Joystick sang phải...`);
    const moveResult = await page.evaluate(async () => {
      const vj = window.__virtualJoystick;
      const ws = window.__worldScene;
      if (!vj || !ws) return { ok: false, error: 'Chưa khởi tạo vj/ws' };

      const base = document.getElementById('virtual-joystick-base');
      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Giả lập chạm vào tâm và kéo sang phải 40px
      const targetX = centerX + 40;
      const targetY = centerY + 10;

      // Kích hoạt qua logic controller của VirtualJoystick
      vj.calculateBaseCenter();
      vj.updateStickPosition(targetX, targetY);

      // Chờ 800ms để vòng lặp update() của Phaser di chuyển nhân vật
      await new Promise(r => setTimeout(r, 800));

      const midPos = { x: ws.hero.getX(), y: ws.hero.getY() };
      const vector = { ...ws.joystickVector };

      // Thả tay (reset joystick)
      vj.reset();

      // Chờ thêm 300ms sau khi thả tay
      await new Promise(r => setTimeout(r, 300));

      const finalPos = { x: ws.hero.getX(), y: ws.hero.getY() };
      const stoppedVector = { ...ws.joystickVector };

      return {
        ok: true,
        vector,
        midPos,
        finalPos,
        stoppedVector,
        heroIsMoving: ws.hero.isMoving
      };
    });

    console.log(`[${vp.name}] Kết quả di chuyển bằng Joystick:`, {
      joystickVectorDuringDrag: moveResult.vector,
      midPos: moveResult.midPos,
      finalPos: moveResult.finalPos,
      vectorAfterRelease: moveResult.stoppedVector,
      heroIsMovingAfterRelease: moveResult.heroIsMoving
    });

    assert.ok(moveResult.ok, 'Thao tác kéo Joystick phải thực thi thành công');
    assert.ok(moveResult.vector.x > 0.5, 'Vector X khi gạt sang phải phải > 0.5');
    assert.ok(moveResult.midPos.x > initialPos.x + 20, `Nhân vật phải di chuyển sang phải (từ ${initialPos.x} lên ${moveResult.midPos.x})`);
    assert.strictEqual(moveResult.stoppedVector.x, 0, 'Vector X sau khi thả tay phải trở về 0');
    assert.strictEqual(moveResult.stoppedVector.y, 0, 'Vector Y sau khi thả tay phải trở về 0');
    assert.strictEqual(moveResult.heroIsMoving, false, 'Nhân vật phải dừng lại sau khi buông cần gạt');

    // 4. Kiểm tra nút Bật / Tắt Cần gạt ảo trên Topbar
    console.log(`[${vp.name}] Kiểm tra nút Bật / Tắt Cần Gạt trên Topbar...`);
    const toggleTest = await page.evaluate(async () => {
      const toggleBtn = document.getElementById('btn-toggle-joystick');
      const zone = document.getElementById('virtual-joystick-zone');

      // Click tắt
      toggleBtn.click();
      await new Promise(r => setTimeout(r, 150));
      const isHiddenAfterClick = zone.classList.contains('hidden');

      // Click bật lại
      toggleBtn.click();
      await new Promise(r => setTimeout(r, 150));
      const isVisibleAfterClickAgain = !zone.classList.contains('hidden');

      return { isHiddenAfterClick, isVisibleAfterClickAgain };
    });

    assert.ok(toggleTest.isHiddenAfterClick, 'Sau khi bấm tắt, joystick phải có class hidden');
    assert.ok(toggleTest.isVisibleAfterClickAgain, 'Sau khi bấm bật lại, joystick phải hiện');
    console.log(`[${vp.name}] Nút Bật / Tắt Joystick hoạt động hoàn hảo!`);

    // 5. Chụp ảnh nghiệm thu trên máy tính bảng
    const screenshotPath = `${artifactDir}/verified_tablet_virtual_joystick_${vp.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`[${vp.name}] Đã chụp ảnh nghiệm thu: ${screenshotPath}`);

    await context.close();
  }

  await browser.close();
  console.log('\n🎉 TOÀN BỘ CÁC BƯỚC KIỂM TRA JOYSTICK TRÊN MÁY TÍNH BẢNG ĐÃ THÀNH CÔNG RỰC RỠ!');
})();
