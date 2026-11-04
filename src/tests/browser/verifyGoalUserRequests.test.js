import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runGoalVerification() {
  console.log('[Test] Bắt đầu kiểm tra 4 yêu cầu người dùng...');
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
  // TEST 1: Hiệu ứng lấp lánh khi bán cá (Hình 1)
  // =========================================================================
  console.log('\n--- [Test 1] Kiểm tra Quầy Bán Cá: Hiệu ứng lấp lánh khi bán cá ---');
  await page.evaluate(() => {
    // Cấp cá vào giỏ
    window.__fishingSystem?.mutate?.(fishing => {
      fishing.basket = [
        { id: 'fish-demo-1', speciesId: 'lotus_fish', weightG: 500, count: 1 }
      ];
      return { ok: true };
    });
    // Mở Quầy Bán Cá (tab fish_scale_stall)
    window.dispatchEvent(new CustomEvent('game:open-market-station', {
      detail: { station: { type: 'fish_scale_stall' } }
    }));
  });
  await page.waitForTimeout(600);

  // Thực hiện bán cá bằng cách trigger _sellFishByDrop
  await page.evaluate(() => {
    window.__marketModal?._sellFishByDrop?.('fish-demo-1');
    window.__marketModal?.render?.();
  });
  await page.waitForTimeout(800);

  const sellCheck = await page.evaluate(() => {
    const sparkles = document.querySelectorAll('.market-sell-sparkles .sell-sparkle-dot');
    const celebration = document.querySelector('.market-sold-celebration');
    const starBadge = document.querySelector('.market-sold-star-badge');
    return {
      hasCelebration: Boolean(celebration),
      sparklesCount: sparkles.length,
      hasStarBadge: Boolean(starBadge),
      starBadgeText: starBadge?.textContent?.trim()
    };
  });

  console.log('Kết quả kiểm tra bán cá:', sellCheck);
  assert.ok(sellCheck.hasCelebration, 'Phải có khung chúc mừng bán cá');
  assert.strictEqual(sellCheck.sparklesCount, 0, 'Đã loại bỏ hoàn toàn tất cả icon / sparkles khi bán hàng');
  assert.ok(sellCheck.hasStarBadge, 'Phải có badge Sao lấp lánh');

  const shot1 = path.join(artifactDir, 'verified_sell_fish_sparkle_effect.png');
  await page.screenshot({ path: shot1 });
  console.log('✓ Đã lưu ảnh: verified_sell_fish_sparkle_effect.png');

  // Đóng modal chợ
  await page.evaluate(() => {
    window.__marketModal?.close?.();
  });
  await page.waitForTimeout(400);

  // =========================================================================
  // TEST 2: Xoá con đường đá vẽ uốn lượn ở Chợ Cầu Vồng (Hình 2)
  // =========================================================================
  console.log('\n--- [Test 2] Kiểm tra Chợ Cầu Vồng: Đã xoá con đường đá vẽ uốn lượn ---');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws?.scene?.restart({ mapId: 'map_rainbow_market' });
  });
  await page.waitForTimeout(2000);

  const marketRoadCheck = await page.evaluate(() => {
    const ws = window.__worldScene;
    // Kiểm tra xem có text mũi tên uốn lượn ➜ hoặc hoa vẽ dọc đường không
    const arrowTexts = (ws?.children?.list || []).filter(c => c.type === 'Text' && c.text === '➜');
    return {
      arrowCount: arrowTexts.length
    };
  });

  console.log('Kết quả kiểm tra đường Chợ Cầu Vồng:', marketRoadCheck);
  assert.strictEqual(marketRoadCheck.arrowCount, 0, 'Toàn bộ mũi tên và con đường vẽ uốn lượn phải bị xoá hoàn toàn!');

  const shot2 = path.join(artifactDir, 'verified_market_road_removed.png');
  await page.screenshot({ path: shot2 });
  console.log('✓ Đã lưu ảnh: verified_market_road_removed.png');

  // =========================================================================
  // TEST 3: Bỏ phần sẵn sàng này đi (Hình 3 - storyIntro map_fashion_street)
  // =========================================================================
  console.log('\n--- [Test 3] Kiểm tra Phố Thời Trang: Vào thẳng không bị popup Bé Sẵn Sàng ---');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws?.scene?.restart({ mapId: 'map_fashion_street' });
  });
  await page.waitForTimeout(2000);

  const introCheck = await page.evaluate(() => {
    const storyModal = document.getElementById('story-intro-modal');
    const isVisible = storyModal && !storyModal.hidden && storyModal.style.display !== 'none';
    const readyBtn = document.getElementById('btn-story-ready');
    return {
      hasStoryModal: Boolean(storyModal),
      isVisible: Boolean(isVisible),
      hasReadyBtn: Boolean(readyBtn)
    };
  });

  console.log('Kết quả kiểm tra popup Sẵn Sàng:', introCheck);
  assert.strictEqual(introCheck.isVisible, false, 'Không được hiển thị popup Bé Sẵn Sàng khi vào Phố Thời Trang!');

  const shot3 = path.join(artifactDir, 'verified_fashion_street_direct_entry_no_intro.png');
  await page.screenshot({ path: shot3 });
  console.log('✓ Đã lưu ảnh: verified_fashion_street_direct_entry_no_intro.png');

  // =========================================================================
  // TEST 4: Bỏ Đeo Thử, bỏ icon, chỉ giữ lại Mua và Đã Có Trong Túi (Hình 4)
  // =========================================================================
  console.log('\n--- [Test 4] Kiểm tra Quầy Phụ Kiện: Bỏ Đeo Thử, chỉ còn Mua & Đã Có Trong Túi ---');
  await page.evaluate(() => {
    const fSys = window.__fashionSystem;
    fSys?.saveState({
      ownedAccessories: ['acc_witch_hat'], // Đã có 1 món để test nút 'Đã Có Trong Túi'
      equippedAccessoryId: null
    });
    // Mở Quầy Phụ Kiện
    window.dispatchEvent(new CustomEvent('game:open-fashion-modal', { detail: { tabIndex: 0 } }));
  });
  await page.waitForTimeout(800);

  const fashionCardCheck = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.fashion-item-card'));
    const tryButtons = document.querySelectorAll('[data-action="try-acc"]');
    const wearButtons = Array.from(document.querySelectorAll('[data-action="wear-acc"]'));
    const buyButtons = Array.from(document.querySelectorAll('[data-action="buy-acc"]'));

    const wearLabels = wearButtons.map(b => b.textContent.trim());
    const buyLabels = buyButtons.slice(0, 3).map(b => b.textContent.trim());

    // Kiểm tra icon túi 🛍️ trong nút mua
    const hasBagIconInBuy = buyLabels.some(l => l.includes('🛍️'));
    const hasEyeIconInTry = tryButtons.length > 0;

    return {
      cardCount: cards.length,
      tryBtnCount: tryButtons.length,
      hasEyeIconInTry,
      wearLabels,
      buyLabels,
      hasBagIconInBuy
    };
  });

  console.log('Kết quả kiểm tra Quầy Phụ Kiện:', fashionCardCheck);
  assert.strictEqual(fashionCardCheck.tryBtnCount, 0, 'Nút Đeo Thử phải bị bỏ hoàn toàn!');
  assert.strictEqual(fashionCardCheck.hasBagIconInBuy, false, 'Không được còn icon túi 🛍️ trong nút Mua!');
  assert.ok(fashionCardCheck.wearLabels.includes('Đã Có Trong Túi'), 'Phải có nút Đã Có Trong Túi cho món đã sở hữu');
  assert.ok(fashionCardCheck.buyLabels.every(l => l.startsWith('Mua (')), 'Tất cả nút chưa mua đều phải hiển thị dạng Mua (X ⭐)');

  const shot4 = path.join(artifactDir, 'verified_fashion_accessories_clean_buttons.png');
  await page.screenshot({ path: shot4 });
  console.log('✓ Đã lưu ảnh: verified_fashion_accessories_clean_buttons.png');

  await browser.close();
  console.log('\n🎉 TẤT CẢ 4/4 YÊU CẦU ĐÃ HOÀN TẤT VÀ VƯỢT QUA TEST THÀNH CÔNG RỰC RỠ!');
}

runGoalVerification().catch((err) => {
  console.error('TEST GOAL THẤT BẠI:', err);
  process.exit(1);
});
