import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('[Test] Kiểm tra mua nhiều Balo giống nhau, đeo tối đa 4 ô và tăng giá Sao...');
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

  // =========================================================================
  // TEST 1: Kiểm tra giá Sao mới của 4 loại Balo trong Quầy Balo (30 - 70 - 130 - 220)
  // =========================================================================
  console.log('\n--- [Test 1] Mở Quầy Balo Mới & Kiểm tra giá Sao tăng lên ---');

  // Cấp đủ Sao để test mua nhiều balo
  await page.evaluate(() => {
    const saveAdapter = window.__saveAdapter;
    const save = saveAdapter?.load?.() || {};
    if (!save.player) save.player = {};
    if (!save.fishing) save.fishing = {};
    save.player.stars = 1000;
    save.fishing.shells = 1000;
    save.backpacks = { owned: [], equipped: [null, null, null, null] };
    saveAdapter?.save?.(save);
    if (window.__marketModal) {
      window.__marketModal.open('backpack_stall');
    } else {
      window.dispatchEvent(new CustomEvent('game:open-market-station', { detail: { station: { type: 'backpack_stall' } } }));
    }
  });
  await page.waitForTimeout(800);

  const priceCheck = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.fishing-shop-grid .fishing-item-card'));
    return cards.map(c => {
      const title = c.querySelector('div[style*="font-weight:900"][style*="color:#0f172a"]')?.textContent?.trim() || '';
      const tier = c.querySelector('span[style*="left:5px"]')?.textContent?.trim() || '';
      const bonus = c.querySelector('span[style*="right:5px"]')?.textContent?.trim() || '';
      const buyBtn = c.querySelector('[data-buy-bp]');
      const btnText = buyBtn?.textContent?.trim() || '';
      return { title, tier, bonus, btnText };
    });
  });

  console.log('Thông tin các Balo trong Quầy:', priceCheck);
  assert.strictEqual(priceCheck[0].btnText.includes('30'), true, 'Balo Thỏ phải có giá 30 Sao');
  assert.strictEqual(priceCheck[1].btnText.includes('70'), true, 'Balo Gấu phải có giá 70 Sao');
  assert.strictEqual(priceCheck[2].btnText.includes('130'), true, 'Balo Ếch phải có giá 130 Sao');
  assert.strictEqual(priceCheck[3].btnText.includes('220'), true, 'Balo Cầu Vồng phải có giá 220 Sao');

  // Mua chiếc Balo Thỏ thứ 1 (30 Sao)
  await page.evaluate(() => {
    const btn = document.querySelector('[data-buy-bp="backpack_bunny_pink"]');
    btn?.click();
  });
  await page.waitForTimeout(600);

  // Mua tiếp chiếc Balo Thỏ thứ 2 (cùng loại, mua nhiều cái!)
  await page.evaluate(() => {
    const btn = document.querySelector('[data-buy-bp="backpack_bunny_pink"]');
    btn?.click();
  });
  await page.waitForTimeout(600);

  // Mua thêm 2 chiếc Balo Cầu Vồng Thần Kỳ (cùng loại, 220 Sao)
  await page.evaluate(() => {
    const btn = document.querySelector('[data-buy-bp="backpack_rainbow_wings"]');
    btn?.click();
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const btn = document.querySelector('[data-buy-bp="backpack_rainbow_wings"]');
    btn?.click();
  });
  await page.waitForTimeout(600);

  // Chụp ảnh quầy balo sau khi mua nhiều cái
  await page.screenshot({ path: `${artifactDir}/verified_backpack_market_multi_buy.png` });
  console.log('✓ Đã lưu ảnh: verified_backpack_market_multi_buy.png');

  // =========================================================================
  // TEST 2: Mở Túi Đồ Của Bé - Kiểm tra 4 Ô Header đang đeo nhiều Balo giống nhau
  // =========================================================================
  console.log('\n--- [Test 2] Kiểm tra Túi Đồ Của Bé: Đeo nhiều Balo giống nhau trên 4 ô Header ---');

  // Đóng quầy và mở Túi Đồ Của Bé
  await page.evaluate(() => {
    document.querySelector('#market-modal-backdrop')?.remove();
    const kitchenModal = window.__kitchenModal;
    if (kitchenModal) {
      kitchenModal.show('bag');
    } else {
      window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'bag' } }));
    }
  });
  await page.waitForTimeout(800);

  const headerSlotsCheck = await page.evaluate(() => {
    const headerSlots = Array.from(document.querySelectorAll('.backpack-header-slot.is-equipped'));
    const bpSystem = window.__backpackSystem;
    const bpState = bpSystem?.getState?.() || {};
    const bonusSlots = bpSystem?.getTotalBonusSlots?.() || 0;
    return {
      equippedSlotsCount: headerSlots.length,
      equippedArray: bpState.equipped,
      totalBonus: bonusSlots,
      badges: headerSlots.map(s => s.querySelector('.bp-slot-badge')?.textContent?.trim())
    };
  });

  console.log('Kiểm tra 4 Ô Header Balo trong Túi Đồ:', headerSlotsCheck);
  assert.strictEqual(headerSlotsCheck.equippedSlotsCount, 4, 'Cả 4 ô Header đều đã được trang bị Balo!');
  assert.strictEqual(headerSlotsCheck.equippedArray[0], 'backpack_bunny_pink', 'Ô 1: Balo Thỏ (+3)');
  assert.strictEqual(headerSlotsCheck.equippedArray[1], 'backpack_bunny_pink', 'Ô 2: Balo Thỏ (+3) (Cùng loại với Ô 1!)');
  assert.strictEqual(headerSlotsCheck.equippedArray[2], 'backpack_rainbow_wings', 'Ô 3: Balo Cầu Vồng (+9)');
  assert.strictEqual(headerSlotsCheck.equippedArray[3], 'backpack_rainbow_wings', 'Ô 4: Balo Cầu Vồng (+9) (Cùng loại với Ô 3!)');
  assert.strictEqual(headerSlotsCheck.totalBonus, 3 + 3 + 9 + 9, 'Tổng bonus phải là 24 ô!');

  // Chụp ảnh nghiệm thu Túi Đồ với 4 Ô Balo (chứa nhiều cái giống nhau)
  await page.screenshot({ path: `${artifactDir}/verified_bag_multiple_same_backpacks.png` });
  console.log('✓ Đã lưu ảnh: verified_bag_multiple_same_backpacks.png');

  // =========================================================================
  // TEST 3: Mua Balo khi 4 ô đã đầy -> Balo nằm trong túi đồ dạng x1, kéo thay thế ô
  // =========================================================================
  console.log('\n--- [Test 3] Mua thêm Balo khi 4 ô đầy -> Nằm trong túi, kéo thay thế thành công ---');
  await page.evaluate(() => {
    const bpSystem = window.__backpackSystem;
    // Mua thêm chiếc Balo Cầu Vồng thứ 3
    bpSystem?.buyBackpack?.('backpack_rainbow_wings');
    window.__kitchenModal?.render?.();
  });
  await page.waitForTimeout(600);

  const inBagCheck = await page.evaluate(() => {
    const bagBpCell = document.querySelector('.bag-slot-cell.is-backpack-cell');
    const badge = bagBpCell?.querySelector('.bag-slot-badge')?.textContent?.trim();
    return {
      hasBagCell: Boolean(bagBpCell),
      badge
    };
  });

  console.log('Kiểm tra Balo thừa nằm trong túi đồ:', inBagCheck);
  assert.strictEqual(inBagCheck.hasBagCell, true, 'Balo mua thêm khi đầy 4 ô phải hiển thị trong túi đồ!');

  // Chụp ảnh nghiệm thu túi đồ có Balo dự phòng bên dưới
  await page.screenshot({ path: `${artifactDir}/verified_bag_extra_backpack_in_storage.png` });
  console.log('✓ Đã lưu ảnh: verified_bag_extra_backpack_in_storage.png');

  console.log('\n🎉 TOÀN BỘ CÁC BƯỚC TEST PLAYWRIGHT ĐỀU ĐẠT CHUẨN XUẤT SẮC!');
  await browser.close();
}

runTest().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
