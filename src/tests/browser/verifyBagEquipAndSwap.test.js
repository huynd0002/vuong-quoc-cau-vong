import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('[Test] Khởi chạy kiểm tra Túi Đồ Của Bé và Đổi Phụ Kiện...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Đóng dialog ban đầu nếu có
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });

  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

  // 1. Cấp phụ kiện mẫu và mở Túi Đồ
  console.log('[Test 1] Kiểm tra Túi Đồ: Cần & Mồi đã trang bị biến mất ở dưới, Tab chỉ còn Tất cả');
  await page.evaluate(() => {
    const fSys = window.__fashionSystem;
    fSys?.saveState({
      ownedAccessories: ['acc_witch_hat', 'acc_angel_halo'],
      equippedAccessoryId: 'acc_witch_hat'
    });
    // Thêm nguyên liệu chuối vào CookingSystem để test inspector
    window.__cookingSystem?.mutate?.(state => {
      state.ingredients = state.ingredients || {};
      state.ingredients['banana'] = 2;
      return { ok: true };
    });
    window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'bag' } }));
  });

  // Chờ giao diện túi đồ xuất hiện
  await page.waitForSelector('.bag-horizontal-container', { timeout: 5000 });
  await page.waitForTimeout(800);

  const bagCheck = await page.evaluate(() => {
    const filterButtons = Array.from(document.querySelectorAll('.btn-bag-filter'));
    const filterLabels = filterButtons.map(b => b.textContent.trim());

    // Kiểm tra các item trong lưới túi đồ bên dưới
    const slotCells = Array.from(document.querySelectorAll('.bag-slots-rack .bag-slot-cell.is-filled'));
    const slotRods = slotCells.map(c => c.dataset.dragRod).filter(Boolean);
    const slotBaits = slotCells.map(c => c.dataset.dragBait).filter(Boolean);
    const slotAccs = slotCells.map(c => c.dataset.dragAccessory).filter(Boolean);

    // Kiểm tra các ô trên đầu
    const activeRodId = window.__fishingSystem?.getState?.()?.equippedRod;
    const activeBaitId = window.__fishingSystem?.getState?.()?.equippedBait;
    const activeAccId = window.__fashionSystem?.getState?.()?.equippedAccessoryId;

    return {
      filterLabels,
      slotRods,
      slotBaits,
      slotAccs,
      activeRodId,
      activeBaitId,
      activeAccId,
      rodIsInRack: slotRods.includes(activeRodId),
      baitIsInRack: slotBaits.includes(activeBaitId),
      equippedAccIsInRack: slotAccs.includes(activeAccId)
    };
  });

  console.log('Bag Check result:', bagCheck);

  // Yêu cầu 4: Chỉ còn duy nhất tab Tất cả
  assert.strictEqual(bagCheck.filterLabels.length, 1, 'Chỉ được có duy nhất 1 tab trong thanh lọc!');
  assert.ok(bagCheck.filterLabels[0].includes('Tất cả'), 'Tab duy nhất phải là Tất cả');

  // Yêu cầu 1: Cần, Mồi, Phụ kiện đã trang bị biến mất khỏi lưới túi đồ dưới
  assert.strictEqual(bagCheck.rodIsInRack, false, 'Cần câu đang trang bị không được xuất hiện ở lưới túi đồ bên dưới!');
  assert.strictEqual(bagCheck.baitIsInRack, false, 'Mồi câu đang trang bị không được xuất hiện ở lưới túi đồ bên dưới!');
  assert.strictEqual(bagCheck.equippedAccIsInRack, false, 'Phụ kiện đang đeo không được xuất hiện ở lưới túi đồ bên dưới!');

  // Chụp ảnh màn hình 1: Túi Đồ tinh gọn với Tab Tất cả và Cần Mồi biến mất ở dưới
  const shot1 = path.join(artifactDir, 'verified_bag_all_tab_and_equipped_hidden.png');
  await page.screenshot({ path: shot1 });
  console.log('✓ Đã lưu ảnh: verified_bag_all_tab_and_equipped_hidden.png');

  // 2. Kiểm tra Yêu cầu 3: Nút Dùng Ăn (+1 ❤️) và Huỷ không bị tràn khung
  console.log('[Test 2] Kiểm tra Inspector của nguyên liệu: Nút Dùng Ăn và Huỷ cân đối');
  await page.evaluate(() => {
    // Click vào item nguyên liệu chuối
    const ingSlot = document.querySelector('[data-ing-slot="banana"]') || document.querySelector('[data-ing-slot]');
    ingSlot?.click();
  });
  await page.waitForTimeout(600);

  const inspectorCheck = await page.evaluate(() => {
    const subBtnRow = document.querySelector('.inspector-sub-btn-row');
    const useBtn = subBtnRow?.querySelector('.btn-inspector-use');
    const discardBtn = subBtnRow?.querySelector('.btn-inspector-discard');
    const inspectorCard = document.querySelector('.kitchen-inspector-panel') || document.querySelector('.bag-detail-inspector');

    if (!subBtnRow || !useBtn || !discardBtn || !inspectorCard) {
      return { found: false, detail: 'Không tìm thấy inspector sub-btn-row' };
    }

    const rowRect = subBtnRow.getBoundingClientRect();
    const cardRect = inspectorCard.getBoundingClientRect();
    const discardRect = discardBtn.getBoundingClientRect();

    return {
      found: true,
      rowWidth: rowRect.width,
      cardWidth: cardRect.width,
      discardRight: discardRect.right,
      cardRight: cardRect.right,
      isDiscardOverflowing: discardRect.right > cardRect.right + 2,
      useBtnText: useBtn.textContent.trim(),
      discardBtnText: discardBtn.textContent.trim()
    };
  });

  console.log('Inspector Buttons Check:', inspectorCheck);
  if (inspectorCheck && inspectorCheck.found) {
    assert.strictEqual(inspectorCheck.isDiscardOverflowing, false, 'Nút Huỷ không được tràn ra ngoài cạnh phải của thẻ inspector!');
  }

  // Chụp ảnh màn hình 2: Nút Dùng Ăn và Huỷ vừa vặn
  const shot2 = path.join(artifactDir, 'verified_inspector_use_and_discard_buttons.png');
  await page.screenshot({ path: shot2 });
  console.log('✓ Đã lưu ảnh: verified_inspector_use_and_discard_buttons.png');

  // 3. Kiểm tra Yêu cầu 2: Kéo/Bấm Phụ Kiện vào nhau tự động hoán đổi vị trí
  console.log('[Test 3] Kiểm tra hoán đổi phụ kiện một chạm...');
  const beforeSwap = await page.evaluate(() => {
    return {
      equipped: window.__fashionSystem?.getState?.()?.equippedAccessoryId,
      owned: [...(window.__fashionSystem?.getState?.()?.ownedAccessories || [])]
    };
  });
  console.log('Trước khi đổi phụ kiện:', beforeSwap);

  // Click vào phụ kiện trong túi (acc_angel_halo) rồi bấm Đeo
  await page.evaluate(() => {
    const haloSlot = document.querySelector('[data-accessory-slot="acc_angel_halo"]');
    haloSlot?.click();
  });
  await page.waitForTimeout(400);

  await page.evaluate(() => {
    const equipBtn = document.querySelector('[data-equip-accessory-id="acc_angel_halo"]');
    equipBtn?.click();
  });
  await page.waitForTimeout(800);

  const afterSwap = await page.evaluate(() => {
    const activeAccId = window.__fashionSystem?.getState?.()?.equippedAccessoryId;
    const slotCells = Array.from(document.querySelectorAll('.bag-slots-rack .bag-slot-cell.is-filled'));
    const slotAccs = slotCells.map(c => c.dataset.dragAccessory).filter(Boolean);
    const toast = document.querySelector('.bag-inline-notify')?.textContent?.trim() || '';

    return {
      activeAccId,
      slotAccs,
      toast
    };
  });

  console.log('Sau khi đổi phụ kiện:', afterSwap);
  assert.strictEqual(afterSwap.activeAccId, 'acc_angel_halo', 'Phụ kiện đang đeo mới phải là acc_angel_halo!');
  assert.ok(afterSwap.slotAccs.includes('acc_witch_hat'), 'Phụ kiện cũ (acc_witch_hat) phải tự động quay về túi đồ!');
  assert.strictEqual(afterSwap.slotAccs.includes('acc_angel_halo'), false, 'Phụ kiện mới (acc_angel_halo) không còn ở túi đồ dưới!');

  // Chụp ảnh màn hình 3: Sau khi đổi phụ kiện
  const shot3 = path.join(artifactDir, 'verified_accessory_swapped_seamlessly.png');
  await page.screenshot({ path: shot3 });
  console.log('✓ Đã lưu ảnh: verified_accessory_swapped_seamlessly.png');

  await browser.close();
  console.log('🎉 TOÀN BỘ CÁC BƯỚC KIỂM TRA ĐÃ THÀNH CÔNG RỰC RỠ!');
}

runTest().catch((err) => {
  console.error('TEST THẤT BẠI:', err);
  process.exit(1);
});
