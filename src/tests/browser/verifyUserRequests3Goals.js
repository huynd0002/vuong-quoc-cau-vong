import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../../');

async function runTests() {
  console.log('🚀 Bắt đầu kiểm thử tự động xác minh 3 yêu cầu của người dùng...');
  const browser = await chromium.launch();

  // Test trên iPad A16 và máy tính bảng phổ biến (1024x768, 1180x820)
  const viewports = [
    { name: 'iPad Landscape (1024x768)', width: 1024, height: 768 },
    { name: 'iPad A16 Air/Pro (1180x820)', width: 1180, height: 820 },
    { name: 'Desktop Standard (1280x720)', width: 1280, height: 720 }
  ];

  for (const vp of viewports) {
    console.log(`\n======================================================`);
    console.log(`📱 KIỂM THỬ TRÊN KHUNG NHÌN: ${vp.name}`);
    console.log(`======================================================`);

    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const gameUrl = `file://${path.join(root, 'game.html').replace(/\\/g, '/')}`;

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(gameUrl, { waitUntil: 'load' });
    await page.waitForTimeout(2500);

    // ========================================================
    // TEST 1: KHẮC PHỤC TRIỆT ĐỂ VIỆC MẤT HÌNH
    // ========================================================
    console.log('--- [Test 1] Kiểm tra hiển thị hình ảnh thế giới & bảo vệ WebKit Canvas ---');
    const stageCheck = await page.evaluate(() => {
      const stage = document.querySelector('.scene-stage');
      const gameRoot = document.getElementById('game-root');
      const canvas = document.querySelector('#game-root canvas');
      const ws = window.__worldScene;

      const stageStyle = window.getComputedStyle(stage);
      const canvasStyle = window.getComputedStyle(canvas);

      return {
        stageExists: !!stage,
        stageWidth: stage?.clientWidth,
        stageHeight: stage?.clientHeight,
        hasCanvas: !!canvas,
        canvasWidth: canvas?.width,
        canvasHeight: canvas?.height,
        hasHero: !!(ws && ws.hero && ws.hero.sprite),
        hasBgImage: !!(ws && ws.bgImage && ws.bgImage.active),
        bgTexture: ws?.bgImage?.texture?.key,
        currentMapId: window.__currentMapId,
        transformStage: stageStyle.transform,
        transformCanvas: canvasStyle.transform
      };
    });

    console.log('  Thực tế kiểm tra sân khấu game:', stageCheck);
    assert.ok(stageCheck.stageExists, 'Sân khấu game .scene-stage phải tồn tại');
    assert.ok(stageCheck.hasCanvas, 'Canvas Phaser trong #game-root phải tồn tại');
    assert.ok(stageCheck.canvasWidth > 0 && stageCheck.canvasHeight > 0, 'Canvas phải có kích thước thực dương');
    assert.ok(stageCheck.hasHero, 'Hero phải hiển thị trong WorldScene');
    assert.ok(stageCheck.hasBgImage, 'Hình nền bản đồ phải được nạp và kích hoạt thành công');
    console.log('  ✓ Test 1 ĐẠT: Thế giới game hiển thị sắc nét đầy đủ nhân vật & hình nền!');

    // ========================================================
    // TEST 2: ĐƯA TÚI VÀO GIỮA & THU NHỎ LẠI 20%
    // ========================================================
    console.log('\n--- [Test 2] Kiểm tra Nút Túi Của Bé vào giữa & thu nhỏ 20% ---');
    const bagCheck = await page.evaluate(() => {
      const stage = document.querySelector('.scene-stage');
      const bag = document.getElementById('btn-floating-bag');
      const bagImg = bag?.querySelector('.floating-bag-img');
      const bagLabel = bag?.querySelector('.floating-bag-label');

      const stageRect = stage.getBoundingClientRect();
      const bagRect = bag.getBoundingClientRect();

      const stageCenterX = stageRect.left + stageRect.width / 2;
      const bagCenterX = bagRect.left + bagRect.width / 2;
      const diffCenter = Math.abs(stageCenterX - bagCenterX);

      const bagStyle = window.getComputedStyle(bag);
      const imgStyle = window.getComputedStyle(bagImg);
      const labelStyle = window.getComputedStyle(bagLabel);

      return {
        bagExists: !!bag,
        diffCenter,
        isCentered: diffCenter <= 4, // Lệch không quá 4px tâm
        width: bagRect.width,
        height: bagRect.height,
        imgWidth: parseFloat(imgStyle.width),
        imgHeight: parseFloat(imgStyle.height),
        fontSize: parseFloat(labelStyle.fontSize),
        bottomDist: stageRect.bottom - bagRect.bottom
      };
    });

    console.log('  Thực tế kiểm tra Nút Túi Của Bé:', bagCheck);
    assert.ok(bagCheck.bagExists, 'Nút Túi Của Bé phải tồn tại trong DOM');
    assert.ok(bagCheck.isCentered, `Nút Túi Của Bé phải nằm chính giữa màn hình (độ lệch tâm: ${bagCheck.diffCenter}px)`);
    assert.ok(bagCheck.imgWidth <= 30, `Icon Túi phải được thu nhỏ 20% (thực tế: ${bagCheck.imgWidth}px <= 30px)`);
    assert.ok(bagCheck.fontSize <= 14, `Font nhãn Túi phải được thu nhỏ 20% (thực tế: ${bagCheck.fontSize}px <= 14px)`);
    console.log('  ✓ Test 2 ĐẠT: Nút Túi Của Bé nằm chính giữa cạnh dưới và thu nhỏ gọn gàng 20%!');

    // ========================================================
    // TEST 3: RESIZE CHỖ CHỌN NHÂN VẬT ĐỂ BẮT ĐẦU KHÔNG CẦN KÉO
    // ========================================================
    console.log('\n--- [Test 3] Kiểm tra Resize Khung Chọn Nhân Vật Để Bắt Đầu Không Cần Kéo ---');
    // Mở màn hình chọn nhân vật
    await page.evaluate(() => {
      window.__characterSelectModal.showInitialSelection();
    });
    await page.waitForTimeout(600);

    const charModalCheck = await page.evaluate(() => {
      const modal = document.getElementById('character-select-modal');
      const dialog = modal?.querySelector('.character-modal-dialog');
      const startBtn = modal?.querySelector('#char-btn-start-adventure');

      const modalVisible = modal && window.getComputedStyle(modal).display !== 'none';
      const dialogRect = dialog ? dialog.getBoundingClientRect() : null;
      const startBtnRect = startBtn ? startBtn.getBoundingClientRect() : null;

      const isStartBtnVisible = startBtnRect &&
        startBtnRect.top >= 0 &&
        startBtnRect.bottom <= window.innerHeight &&
        startBtnRect.bottom <= (dialogRect.bottom + 2);

      const hasNoVerticalScrollbar = dialog ? (dialog.scrollHeight <= dialog.clientHeight + 4) : false;

      return {
        modalVisible,
        viewportHeight: window.innerHeight,
        dialogHeight: dialogRect?.height,
        dialogScrollHeight: dialog?.scrollHeight,
        dialogClientHeight: dialog?.clientHeight,
        startBtnTop: startBtnRect?.top,
        startBtnBottom: startBtnRect?.bottom,
        isStartBtnFullyVisibleWithoutScroll: isStartBtnVisible,
        hasNoVerticalScrollbar
      };
    });

    console.log('  Thực tế kiểm tra Modal Chọn Nhân Vật:', charModalCheck);
    assert.ok(charModalCheck.modalVisible, 'Modal Chọn Nhân Vật phải hiển thị');
    assert.ok(charModalCheck.isStartBtnFullyVisibleWithoutScroll, 'Nút BẮT ĐẦU PHIÊU LƯU phải hiển thị 100% trọn vẹn trong màn hình mà không cần kéo xuống dưới!');
    assert.ok(charModalCheck.hasNoVerticalScrollbar, 'Khung modal phải nằm vừa vặn không bị cuộn thanh trượt!');
    console.log('  ✓ Test 3 ĐẠT: Toàn bộ chỗ chọn nhân vật & nút Bắt Đầu nằm trọn vẹn trong màn hình, không cần kéo xuống dưới!');

    // Chụp ảnh bằng chứng cho khung nhìn
    const shotPath = `verified_3_goals_${vp.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.png`;
    await page.screenshot({ path: shotPath });
    console.log(`  📸 Đã chụp ảnh xác minh: ${shotPath}`);

    await page.close();
  }

  await browser.close();
  console.log('\n======================================================');
  console.log('🎉 TẤT CẢ 3 YÊU CẦU ĐÃ ĐƯỢC XÁC MINH VƯỢT QUA 100%!');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('❌ Lỗi kiểm thử:', err);
  process.exit(1);
});
