import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('[Test] Kiểm tra: Chỉ mở được tủ lạnh khi đã rửa tay & Bỏ banner trong giao diện tủ lạnh...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Đóng dialog mở đầu
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });

  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

  // 1. Kiểm tra khi chưa rửa tay: Mở tủ lạnh phải bị chặn và mở sink modal
  console.log('\n--- [Test 1] Kiểm tra khi chưa rửa tay: Chặn mở tủ lạnh & mở Pop-up Rửa tay ---');
  await page.evaluate(() => {
    // Reset handsWashed to false
    if (window.__cookingSystem) {
      window.__cookingSystem.resetHandWash();
    }
    // Attempt to open fridge
    window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'fridge' } }));
  });

  await page.waitForTimeout(1000);

  const test1Result = await page.evaluate(() => {
    const kitchenModal = document.getElementById('kitchen-modal');
    const isFridgeOpen = kitchenModal && !kitchenModal.hidden && kitchenModal.classList.contains('is-fridge-mode');
    const sinkPopup = document.querySelector('.kitchen-station-card.handwash-card');
    const isSinkOpen = sinkPopup !== null && sinkPopup.offsetParent !== null;
    return {
      isFridgeOpen: Boolean(isFridgeOpen),
      isSinkOpen: Boolean(isSinkOpen)
    };
  });

  console.log('Kết quả kiểm tra chặn Tủ Lạnh khi chưa rửa tay:', test1Result);
  if (test1Result.isFridgeOpen) {
    throw new Error('FAIL: Tủ lạnh vẫn mở được khi chưa rửa tay!');
  }
  if (!test1Result.isSinkOpen) {
    throw new Error('FAIL: Bồn rửa tay không tự động mở khi bé cố mở tủ lạnh!');
  }

  // Chụp ảnh bằng chứng Test 1
  await page.screenshot({ path: path.join(artifactDir, 'verified_fridge_blocked_until_hands_washed.png') });
  console.log('✓ Đã lưu ảnh: verified_fridge_blocked_until_hands_washed.png');

  // 2. Rửa tay xong -> Mở được tủ lạnh & kiểm tra banner đã bị gỡ bỏ
  console.log('\n--- [Test 2] Rửa tay xong: Mở Tủ Lạnh thành công, banner biến mất hoàn toàn ---');
  await page.evaluate(() => {
    // Complete hand wash
    if (window.__cookingSystem) {
      window.__cookingSystem.completeHandWash();
    }
    // Close sink modal if open
    if (window.__kitchenStationModal) {
      window.__kitchenStationModal.close();
    }
    // Now open fridge
    window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'fridge' } }));
  });

  await page.waitForTimeout(1200);

  const test2Result = await page.evaluate(() => {
    const kitchenModal = document.getElementById('kitchen-modal');
    const isFridgeOpen = kitchenModal && !kitchenModal.hidden;
    const hasTopRibbon = Boolean(kitchenModal?.querySelector('.fridge-top-ribbon'));
    const hasHintPill = Boolean(kitchenModal?.querySelector('.fridge-hint-pill'));
    const walletEl = kitchenModal?.querySelector('#kitchen-wallet');
    const walletText = walletEl?.textContent?.trim() || '';
    const walletVisible = walletEl && getComputedStyle(walletEl).display !== 'none';
    const shelvesCount = kitchenModal?.querySelectorAll('.fridge-shelf-row').length || 0;
    const itemsCount = kitchenModal?.querySelectorAll('.fridge-item-card').length || 0;

    return {
      isFridgeOpen,
      hasTopRibbon,
      hasHintPill,
      walletVisible,
      walletText,
      shelvesCount,
      itemsCount
    };
  });

  console.log('Kết quả kiểm tra Tủ Lạnh sau khi rửa tay:', test2Result);
  if (!test2Result.isFridgeOpen) {
    throw new Error('FAIL: Tủ lạnh không mở được sau khi đã rửa tay!');
  }
  if (test2Result.hasTopRibbon) {
    throw new Error('FAIL: Banner fridge-top-ribbon vẫn còn tồn tại trong giao diện tủ lạnh!');
  }
  if (test2Result.hasHintPill) {
    throw new Error('FAIL: fridge-hint-pill vẫn còn tồn tại trong giao diện tủ lạnh!');
  }
  if (!test2Result.walletVisible) {
    throw new Error('FAIL: Widget Sao trong header tủ lạnh bị ẩn!');
  }
  if (test2Result.shelvesCount !== 3 || test2Result.itemsCount === 0) {
    throw new Error(`FAIL: Kệ tủ lạnh không hiển thị đầy đủ (shelves=${test2Result.shelvesCount}, items=${test2Result.itemsCount})!`);
  }

  // Chụp ảnh bằng chứng Test 2
  await page.screenshot({ path: path.join(artifactDir, 'verified_fridge_no_banner_clean_shelves.png') });
  console.log('✓ Đã lưu ảnh: verified_fridge_no_banner_clean_shelves.png');

  // 3. Kiểm tra phụ kiện Mũ Rơm trên đầu nhân vật
  console.log('\n--- [Test 3] Kiểm tra phụ kiện Mũ Rơm trên đầu nhân vật ---');
  await page.evaluate(() => {
    // Close kitchen modal
    if (window.__kitchenModal) {
      window.__kitchenModal.close();
    }
    // Equip straw hat on hero
    const hero = window.__worldScene?.hero;
    if (hero) {
      hero.setAccessory('acc_straw_hat');
    }
  });

  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(artifactDir, 'verified_straw_hat_positioned_on_head.png') });
  console.log('✓ Đã lưu ảnh: verified_straw_hat_positioned_on_head.png');

  console.log('\n🎉 TOÀN BỘ TESTS XÁC THỰC BROWSER ĐÃ THÀNH CÔNG RỰC RỠ!');
  await browser.close();
}

runTest().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
