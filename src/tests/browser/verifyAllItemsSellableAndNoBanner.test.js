import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('[Test] Kiểm tra bán tất cả vật phẩm và bỏ banner quầy balo...');
  const browser = await chromium.launch({ headless: true });
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

  // =========================================================================
  // TEST 1: Bỏ phần trong hình (Banner Quầy Balo) - Yêu cầu 2
  // =========================================================================
  console.log('\n--- [Test 1] Kiểm tra Quầy Balo Mới: Banner đã được bỏ hoàn toàn ---');
  await page.evaluate(() => {
    if (window.__marketModal) {
      window.__marketModal.open('backpack_stall');
    }
  });
  await page.waitForTimeout(800);

  const bannerCheck = await page.evaluate(() => {
    const bannerHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Gian Hàng Balo Mở Rộng'));
    const bannerText = document.body.innerText.includes('Mua Balo bằng Sao rồi kéo thả vào 4 ô');
    const cardsCount = document.querySelectorAll('.fishing-shop-grid .fishing-item-card').length;
    return {
      hasBannerHeading: Boolean(bannerHeading),
      hasBannerText: bannerText,
      cardsCount
    };
  });

  console.log('Kết quả kiểm tra Quầy Balo:', bannerCheck);
  assert.strictEqual(bannerCheck.hasBannerHeading, false, 'Banner Gian Hàng Balo phải bị gỡ bỏ hoàn toàn!');
  assert.strictEqual(bannerCheck.hasBannerText, false, 'Đoạn mô tả banner phải bị gỡ bỏ!');
  assert.strictEqual(bannerCheck.cardsCount, 4, '4 thẻ Balo hiển thị trực tiếp và rõ ràng');

  await page.screenshot({ path: `${artifactDir}/verified_backpack_market_no_banner.png` });
  console.log('✓ Đã lưu ảnh: verified_backpack_market_no_banner.png');

  // =========================================================================
  // TEST 2: Quầy bán cá hiển thị tất cả vật phẩm (Cá, Món ăn, Nguyên liệu, Balo, Phụ kiện)
  // =========================================================================
  console.log('\n--- [Test 2] Kiểm tra Quầy Bán Cá: Hiển thị tất cả các loại vật phẩm ---');

  // Chuẩn bị dữ liệu đầy đủ các loại vật phẩm
  await page.evaluate(() => {
    const saveAdapter = window.__saveAdapter;
    const save = saveAdapter?.load?.() || {};
    if (!save.player) save.player = {};
    if (!save.fishing) save.fishing = {};
    if (!save.cooking) save.cooking = {};
    if (!save.backpacks) save.backpacks = {};
    if (!save.fashion) save.fashion = {};

    save.player.stars = 20;
    save.fishing.shells = 20;
    save.fishing.basket = [
      { id: 'fish-demo-1', speciesId: 'cloud_fish', weightG: 200, count: 1 }
    ];
    save.cooking.dishes = [
      { id: 'cook-1', recipeId: 'rainbow_sandwich', quality: 3 }
    ];
    save.cooking.ingredients = {
      banana: 3,
      carrot: 2
    };
    save.backpacks = {
      owned: ['backpack_bunny_pink', 'backpack_bunny_pink'],
      equipped: ['backpack_bunny_pink', null, null, null]
    };
    save.fashion = {
      ownedAccessories: ['acc_rainbow_crown', 'acc_star_glasses'],
      equippedAccessoryId: 'acc_rainbow_crown'
    };

    saveAdapter?.save?.(save, { writeCooking: true, writeFishing: true });

    // Chuyển sang tab bán cá (fish_scale_stall)
    window.__marketModal.open('fish_scale_stall');
  });
  await page.waitForTimeout(800);

  const sellItemsCheck = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#market-fish-tray [data-drag-sellable]'));
    return cards.map(c => ({
      kind: c.getAttribute('data-sell-kind'),
      id: c.getAttribute('data-sell-id'),
      name: c.getAttribute('data-sell-name'),
      stars: c.getAttribute('data-sell-stars')
    }));
  });

  console.log('Danh sách vật phẩm hiển thị trong Quầy Bán Cá:', sellItemsCheck);
  const kinds = sellItemsCheck.map(i => i.kind);
  assert.strictEqual(kinds.includes('fish'), true, 'Phải có cá');
  assert.strictEqual(kinds.includes('dish'), true, 'Phải có món ăn');
  assert.strictEqual(kinds.includes('ingredient'), true, 'Phải có nguyên liệu');
  assert.strictEqual(kinds.includes('backpack'), true, 'Phải có Balo trong túi');
  assert.strictEqual(kinds.includes('accessory'), true, 'Phải có Phụ kiện trong túi');

  await page.screenshot({ path: `${artifactDir}/verified_market_all_sellable_items_displayed.png` });
  console.log('✓ Đã lưu ảnh: verified_market_all_sellable_items_displayed.png');

  // =========================================================================
  // TEST 3: Bán Món Ăn & Balo qua dropzone - Kiểm tra Dữ Liệu Bán Xong MẤT LUÔN
  // =========================================================================
  console.log('\n--- [Test 3] Kéo bán Món Ăn và Balo: Dữ liệu mất luôn vĩnh viễn khỏi túi ---');

  // Bán món ăn 'cook-1' (Bánh mì sắc màu)
  await page.evaluate(() => {
    window.__marketModal._sellItemByDrop('dish', 'cook-1');
  });
  await page.waitForTimeout(600);

  const postDishCheck = await page.evaluate(() => {
    const saveAdapter = window.__saveAdapter;
    const save = saveAdapter?.load?.() || {};
    const hasDish = (save.cooking?.dishes || []).some(d => d.id === 'cook-1');
    const stars = save.player?.stars || 0;
    const celebration = document.querySelector('.market-sold-celebration')?.textContent || '';
    return { hasDish, stars, celebration };
  });

  console.log('Kiểm tra sau khi bán Món Ăn:', postDishCheck);
  assert.strictEqual(postDishCheck.hasDish, false, 'Món ăn cook-1 phải mất luôn vĩnh viễn khỏi save!');
  assert.strictEqual(postDishCheck.stars, 23, 'Được cộng 3 Sao (20 + 3 = 23)');
  assert.strictEqual(postDishCheck.celebration.includes('Bánh mì sắc màu'), true, 'Dropzone hiển thị đã bán thành công!');

  // Bán chiếc Balo Thỏ thứ 2 trong túi đồ
  await page.evaluate(() => {
    window.__marketModal._sellItemByDrop('backpack', 'backpack_bunny_pink');
  });
  await page.waitForTimeout(600);

  const postBpCheck = await page.evaluate(() => {
    const saveAdapter = window.__saveAdapter;
    const save = saveAdapter?.load?.() || {};
    const ownedCount = (save.backpacks?.owned || []).filter(id => id === 'backpack_bunny_pink').length;
    const equipped = save.backpacks?.equipped?.[0];
    const stars = save.player?.stars || 0;
    return { ownedCount, equipped, stars };
  });

  console.log('Kiểm tra sau khi bán Balo trong túi:', postBpCheck);
  assert.strictEqual(postBpCheck.ownedCount, 1, 'Balo đã bán 1 cái mất luôn, chỉ còn 1 cái đang đeo');
  assert.strictEqual(postBpCheck.equipped, 'backpack_bunny_pink', 'Balo đang đeo vẫn an toàn');
  assert.strictEqual(postBpCheck.stars, 38, 'Được cộng thêm 15 Sao (23 + 15 = 38)');

  await page.screenshot({ path: `${artifactDir}/verified_market_sold_any_item_sparkles.png` });
  console.log('✓ Đã lưu ảnh: verified_market_sold_any_item_sparkles.png');

  console.log('\n🎉 TOÀN BỘ TESTS XÁC THỰC BROWSER ĐÃ THÀNH CÔNG RỰC RỠ!');
  await browser.close();
}

runTest().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
