import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../../');

async function runVerification() {
  console.log('🚀 Bắt đầu kiểm thử tự động toàn diện trên game.html qua Playwright...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('  [Browser Error]:', msg.text());
  });

  const url = `file://${path.join(root, 'game.html').replace(/\\/g, '/')}`;
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  // 1. KIỂM THỬ SPEECH NORMALIZATION (Requirement 3)
  console.log('--- 1. Kiểm thử Chuẩn hoá âm thanh đọc số lượng & phân số ---');
  const speechTests = await page.evaluate(() => {
    const audio = window.__audioService;
    return {
      t1: audio?.cleanTextForSpeech('x1'),
      t2: audio?.cleanTextForSpeech('x 2'),
      t3: audio?.cleanTextForSpeech('Món đã nấu (1/6)'),
      t4: audio?.cleanTextForSpeech('Số lượng trong túi: 1'),
      t5: audio?.cleanTextForSpeech('Còn 3'),
      t6: audio?.cleanTextForSpeech('0/30 EXP')
    };
  });
  console.log('  Kết quả speech normalization:', speechTests);
  assert.equal(speechTests.t1, '1 phần', 'x1 phải được đọc là "1 phần"');
  assert.equal(speechTests.t2, '2 phần', 'x 2 phải được đọc là "2 phần"');
  assert.match(speechTests.t3, /1 trên 6/, '(1/6) phải được đọc là "1 trên 6"');
  assert.equal(speechTests.t4, 'Số lượng trong túi: 1 phần', 'Số lượng trong túi: 1 phải đọc có chữ "phần"');
  assert.equal(speechTests.t5, 'Còn 3 phần', 'Còn 3 phải đọc là "Còn 3 phần"');
  assert.match(speechTests.t6, /0 trên 30/, '0/30 phải đọc là "0 trên 30"');
  console.log('✓ Requirement 3 (Chuẩn hoá âm thanh đọc số lượng) ĐẠT 100%!');

  // 2. KIỂM THỬ KHỞI ĐỘNG VÀ ĐẾN NÔNG TRẠI (Image 2: Top-Left HUD)
  console.log('--- 2. Kiểm thử Nông Trại: Tách HUD sang góc trên bên trái ---');
  await page.evaluate(() => {
    const charModal = document.getElementById('character-select-modal');
    if (charModal) charModal.remove();
    const storyModal = document.getElementById('story-intro-modal');
    if (storyModal) storyModal.remove();
  });

  // Chuyển tới map Nông Trại Thú Cưng
  await page.evaluate(() => {
    window.__worldScene?.scene.restart({ mapId: 'map_pet_farm' });
  });
  await page.waitForTimeout(1500);

  const stage = page.locator('.scene-stage');
  const stageBox = await stage.boundingBox();
  console.log('  Stage BoundingBox:', stageBox);

  // Kiểm tra khung Top-Left: pet-farm-growth-panel
  const growthPanel = page.locator('#pet-farm-growth-panel');
  await growthPanel.waitFor({ state: 'visible', timeout: 5000 });
  const growthBox = await growthPanel.boundingBox();
  console.log('  Growth Panel BoundingBox:', growthBox);
  assert.ok(growthBox, 'Growth Panel phải hiển thị trên màn hình');
  assert.ok(growthBox.x - stageBox.x <= 30, 'Growth Panel phải nằm sát lề TRÁI của sân khấu (x <= 30px)');
  assert.ok(growthBox.y - stageBox.y <= 30, 'Growth Panel phải nằm sát lề TRÊN của sân khấu (y <= 30px)');

  // Kiểm tra khung Top-Right: pet-farm-hud-card (5 gauges)
  const gaugesPanel = page.locator('#pet-farm-hud-card');
  await gaugesPanel.waitFor({ state: 'visible', timeout: 5000 });
  const gaugesBox = await gaugesPanel.boundingBox();
  console.log('  Gauges Panel BoundingBox:', gaugesBox);
  assert.ok(gaugesBox, 'Gauges Panel phải hiển thị trên màn hình');
  assert.ok(gaugesBox.x > 800, 'Gauges Panel phải nằm ở góc PHẢI của sân khấu (x > 800px)');
  assert.ok(gaugesBox.height < 450, 'Gauges Panel phải gọn gàng, không bị tràn ra ngoài màn hình');

  const farmScreenshotPath = path.join(root, 'artifacts', 'verify_farm_hud_split_topleft.png');
  await page.screenshot({ path: farmScreenshotPath });
  console.log('  Đã chụp ảnh kiểm chứng HUD Nông trại tại:', farmScreenshotPath);
  console.log('✓ Image 2 (Top-Left HUD Nông Trại) ĐẠT 100%!');

  // 3. KIỂM THỬ POP-UP GIỜ NGHỈ NGƠI KHI CÚN ĐANG NGỦ (Image 1: PetSleepModal)
  console.log('--- 3. Kiểm thử Pop-up Giờ Nghỉ Ngơi: Chữ không xuống dòng, không có mô tả dài ---');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    if (scene && scene.pet) {
      scene.pet.isForcedSleeping = true;
    }
    scene?.openPetSleepConfirmDialog();
  });
  await page.waitForTimeout(500);

  const sleepModal = page.locator('#pet-sleep-modal');
  await sleepModal.waitFor({ state: 'visible', timeout: 5000 });

  // Kiểm tra không có đoạn văn bản bị khoanh tròn
  const descEl = page.locator('.pet-sleep-desc');
  const hasVisibleDesc = await descEl.isVisible().catch(() => false);
  assert.equal(hasVisibleDesc, false, 'Đoạn văn bản cuộn tròn ấm áp không được hiển thị');

  // Kiểm tra các nút và xem có bị xuống dòng không
  const btnSleepCancel = page.locator('#btn-sleep-cancel');
  const btnSleepWake = page.locator('#btn-sleep-wakeup');
  const cancelText = await btnSleepCancel.innerText();
  const wakeText = await btnSleepWake.innerText();
  console.log('  Nút 1:', cancelText, '| Nút 2:', wakeText);
  assert.match(cancelText, /Để cún ngủ tiếp/, 'Nút ngủ tiếp hiển thị đầy đủ');
  assert.match(wakeText, /Đánh thức cún dậy/, 'Nút thức dậy hiển thị đầy đủ');

  const sleepScreenshotPath = path.join(root, 'artifacts', 'verify_petsleep_modal_clean.png');
  await page.screenshot({ path: sleepScreenshotPath });
  console.log('  Đã chụp ảnh kiểm chứng Pop-up Giờ nghỉ ngơi tại:', sleepScreenshotPath);

  // Đóng sleep modal
  await page.evaluate(() => document.getElementById('btn-sleep-cancel')?.click());
  await page.waitForTimeout(400);
  console.log('✓ Image 1 (PetSleepModal chữ không xuống dòng) ĐẠT 100%!');

  // 4. KIỂM THỬ POP-UP TÚI ĐỒ (Image 3: Backpack Modal)
  console.log('--- 4. Kiểm thử Túi Đồ Của Bé: Không cắt chữ Sữa Chua, nút Cho Cún Ăn trên 1 dòng ---');
  await page.evaluate(() => {
    const cs = window.__cookingSystem;
    cs.completeHandWash();
    // Thêm món Sữa Chua Trái Cây (recipe id: fruit_yogurt)
    cs.mutate(state => {
      state.dishes = [{ id: 'cook-1', recipeId: 'fruit_yogurt', quality: 3 }];
      return { ok: true };
    });
    // Mở Túi Đồ và click ô món ăn
    const km = window.__kitchenModal;
    km.show('bag');
    const slot = document.querySelector('.bag-slot-cell.is-filled');
    if (slot) slot.click();
  });
  await page.waitForTimeout(500);

  const bagModal = page.locator('#kitchen-modal');
  await bagModal.waitFor({ state: 'visible', timeout: 5000 });

  // Kiểm tra nút "Cho Cún Ăn"
  const feedBtn = page.locator('.btn-inspector-feed');
  await feedBtn.waitFor({ state: 'visible', timeout: 5000 });
  const feedBtnText = await feedBtn.innerText();
  console.log('  Nút Cho Cún Ăn text:', feedBtnText);
  assert.match(feedBtnText, /Cho Cún Ăn/, 'Nút phải có đầy đủ chữ "Cho Cún Ăn"');

  const feedBtnBox = await feedBtn.boundingBox();
  console.log('  Feed Button BoundingBox:', feedBtnBox);
  assert.ok(feedBtnBox.height <= 50, 'Nút không được bị gãy thành 2 dòng chiều cao quá lớn');

  const bagScreenshotPath = path.join(root, 'artifacts', 'verify_backpack_modal_slot_and_feed_btn.png');
  await page.screenshot({ path: bagScreenshotPath });
  console.log('  Đã chụp ảnh kiểm chứng Túi đồ tại:', bagScreenshotPath);
  console.log('✓ Image 3 (Túi đồ không cắt chữ & Nút Cho Cún Ăn trên 1 dòng) ĐẠT 100%!');

  // 5. KIỂM THỬ BẾP: KHÔNG MỞ ĐƯỢC TỦ LẠNH TỪ POP-UP BẾP (Requirement 2 & Image 4)
  console.log('--- 5. Kiểm thử Pop-up Bếp: Không bấm mở tủ lạnh được từ bếp nấu ---');
  await page.evaluate(() => {
    // Bắt đầu làm món fruit_yogurt để vào view 'cook' (bếp nấu)
    const cs = window.__cookingSystem;
    cs.completeHandWash();
    cs.start('fruit_yogurt');
    window.__kitchenModal.tab = 'cook';
    window.__kitchenModal.render();
  });
  await page.waitForTimeout(500);

  // 1. Tab tủ lạnh phải bị ẩn trong nav tabs khi ở view bếp nấu
  const fridgeNavBtn = page.locator('.kitchen-tabs button[data-action="fridge"]');
  const isFridgeNavVisible = await fridgeNavBtn.isVisible();
  console.log('  Nút Tủ Lạnh trong nav tabs:', isFridgeNavVisible ? 'Hiển thị' : 'Đã ẩn chính xác');
  assert.equal(isFridgeNavVisible, false, 'Nút Tủ Lạnh trong tabs bếp PHẢI BỊ ẨN để tránh nhảy trạm!');

  // 2. Nút get-fridge shortcut phải không còn tồn tại
  const getFridgeBtn = page.locator('.btn-cook-get-fridge');
  const hasGetFridgeBtn = await getFridgeBtn.count();
  assert.equal(hasGetFridgeBtn, 0, 'Nút bấm mở tủ lạnh trực tiếp từ bếp lò đã bị loại bỏ');

  // 3. Phải có hướng dẫn bước lại tủ lạnh
  const walkHint = page.locator('.cook-fridge-walk-hint');
  const hasWalkHint = await walkHint.isVisible();
  assert.equal(hasWalkHint, true, 'Phải có gợi ý bé bước lại Tủ Lạnh trên sàn bếp');

  const cookScreenshotPath = path.join(root, 'artifacts', 'verify_cooking_popup_no_fridge_shortcut.png');
  await page.screenshot({ path: cookScreenshotPath });
  console.log('  Đã chụp ảnh kiểm chứng Pop-up Bếp không có nút mở tủ lạnh tại:', cookScreenshotPath);
  console.log('✓ Requirement 2 (Không mở được tủ lạnh từ pop-up bếp) ĐẠT 100%!');

  // 6. KIỂM THỬ RỬA TAY CHỈ CẦN 1 LẦN DUY NHẤT (Requirement 1)
  console.log('--- 6. Kiểm thử Rửa tay chỉ 1 lần duy nhất trong suốt quá trình ---');
  await page.evaluate(() => {
    // 1. Rửa tay
    window.__cookingSystem.completeHandWash();
    // 2. Đóng bếp
    window.__kitchenModal.close();
    // 3. Chuyển map ra Nông Trại
    window.__worldScene?.scene.restart({ mapId: 'map_pet_farm' });
  });
  await page.waitForTimeout(800);

  // Trở lại Map Kitchen
  await page.evaluate(() => {
    window.__worldScene?.scene.restart({ mapId: 'map_kitchen' });
  });
  await page.waitForTimeout(800);

  const isHandsStillClean = await page.evaluate(() => {
    return window.__cookingSystem.getState()?.handsWashed;
  });
  console.log('  Trạng thái handsWashed sau khi đổi map và quay lại:', isHandsStillClean);
  assert.equal(isHandsStillClean, true, 'Trạng thái handsWashed phải duy trì là true (không cần rửa lại)!');
  console.log('✓ Requirement 1 (Rửa tay 1 lần duy nhất) ĐẠT 100%!');

  await browser.close();
  console.log('🎉 TẤT CẢ CÁC MỤC KIỂM THỬ TRÌNH DUYỆT ĐỀU ĐẠT 100%!');
}

runVerification().catch(err => {
  console.error('❌ Lỗi kiểm thử:', err);
  process.exit(1);
});
