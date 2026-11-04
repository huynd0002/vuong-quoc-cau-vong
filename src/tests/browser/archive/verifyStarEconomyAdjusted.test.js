import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../../');
const gameHtmlPath = path.join(root, 'game.html');
const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function testEconomyAdjusted() {
  console.log('--- [Test] Bắt đầu kiểm thử Cân Bằng Kinh Tế Sao (Kéo dài thời gian chơi & Tăng độ khó) ---');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  // Đóng modals ban đầu
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });
  await page.waitForTimeout(1000);

  // 1. Kiểm tra Giá Cần Câu & Mồi Câu ở Chợ Cầu Vồng
  console.log('\n[Test 1] Kiểm tra Quầy Cần & Mồi Câu ở Chợ Cầu Vồng...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map_rainbow_market' });
  });
  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    window.__marketModal.open('rod_bait_stall');
  });
  await page.waitForTimeout(1000);

  const marketRodInfo = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.fishing-item-card'));
    return cards.map(c => {
      const title = c.querySelector('div[style*="font-weight:900"]')?.textContent?.trim();
      const text = c.textContent;
      return { title, text };
    });
  });
  console.log('[Test 1] Quầy Cần & Mồi:', marketRodInfo.length, 'món hàng');
  assert.ok(marketRodInfo.length >= 4, 'Phải có ít nhất 4 cần câu / mồi câu');

  const marketRodShotPath = path.join(artifactsDir, 'verified_market_rods_baits_prices.png');
  await page.screenshot({ path: marketRodShotPath });
  console.log('✓ Đã lưu ảnh: verified_market_rods_baits_prices.png');

  // Đóng modal chợ
  await page.evaluate(() => {
    window.__marketModal.close();
  });
  await page.waitForTimeout(600);

  // 2. Kiểm tra Giá Balo ở Quầy Balo Chợ Cầu Vồng
  console.log('\n[Test 2] Kiểm tra Quầy Balo 4 Cấp...');
  await page.evaluate(() => {
    window.__marketModal.open('backpack_stall');
  });
  await page.waitForTimeout(1000);

  const backpackInfo = await page.evaluate(() => {
    const buyBtns = Array.from(document.querySelectorAll('[data-buy-bp]'));
    return buyBtns.map(b => ({
      id: b.getAttribute('data-buy-bp'),
      text: b.textContent?.trim()
    }));
  });
  console.log('[Test 2] Nút mua Balo:', backpackInfo);
  assert.ok(backpackInfo.some(b => b.text.includes('15')), 'Balo Thỏ phải có giá 15 Sao');
  assert.ok(backpackInfo.some(b => b.text.includes('35')), 'Balo Gấu phải có giá 35 Sao');
  assert.ok(backpackInfo.some(b => b.text.includes('65')), 'Balo Ếch phải có giá 65 Sao');
  assert.ok(backpackInfo.some(b => b.text.includes('110')), 'Balo Cầu Vồng phải có giá 110 Sao');

  const marketBpShotPath = path.join(artifactsDir, 'verified_market_backpack_prices.png');
  await page.screenshot({ path: marketBpShotPath });
  console.log('✓ Đã lưu ảnh: verified_market_backpack_prices.png');

  await page.evaluate(() => {
    window.__marketModal.close();
  });
  await page.waitForTimeout(600);

  // 3. Kiểm tra Quầy Phụ Kiện Thời Trang ở Phố Thời Trang
  console.log('\n[Test 3] Kiểm tra Quầy Phụ Kiện Phố Thời Trang...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map_fashion_street' });
  });
  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:open-fashion-modal', { detail: { tabIndex: 0 } }));
  });
  await page.waitForTimeout(1000);

  const accCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.fashion-item-card'));
    return cards.map(c => ({
      id: c.getAttribute('data-id'),
      name: c.querySelector('.fashion-card-title')?.textContent?.trim(),
      badge: c.querySelector('.fashion-card-badge')?.textContent?.trim(),
      btnText: c.querySelector('[data-action="buy-acc"]')?.textContent?.trim()
    }));
  });
  console.log('[Test 3] Danh sách phụ kiện thời trang:', accCards);

  const strawHat = accCards.find(a => a.id === 'acc_straw_hat');
  const catEars = accCards.find(a => a.id === 'acc_cat_ears_bow');
  const crown = accCards.find(a => a.id === 'acc_rainbow_crown');
  const wings = accCards.find(a => a.id === 'acc_fairy_wings');
  const halo = accCards.find(a => a.id === 'acc_angel_halo');

  assert.ok(strawHat.badge.includes('12') || strawHat.btnText.includes('12'), 'Mũ Hoa Cúc giá 12 Sao');
  assert.ok(catEars.badge.includes('20') || catEars.btnText.includes('20'), 'Nơ Tai Mèo giá 20 Sao');
  assert.ok(crown.badge.includes('50') || crown.btnText.includes('50'), 'Vương Miện giá 50 Sao');
  assert.ok(wings.badge.includes('75') || wings.btnText.includes('75'), 'Cánh Tiên giá 75 Sao');
  assert.ok(halo.badge.includes('100') || halo.btnText.includes('100'), 'Vòng Thiên Thần giá 100 Sao');

  const fashionShotPath = path.join(artifactsDir, 'verified_fashion_increased_prices.png');
  await page.screenshot({ path: fashionShotPath });
  console.log('✓ Đã lưu ảnh: verified_fashion_increased_prices.png');

  // Đóng modal thời trang
  await page.evaluate(() => {
    window.__fashionStreetModal?.close?.();
  });
  await page.waitForTimeout(600);

  // 4. Kiểm tra Phần Thưởng Vượt Ải Của Các Bản Đồ
  console.log('\n[Test 4] Kiểm tra Phần Thưởng Vượt Ải Của Các Bản Đồ...');
  const { MAPS_CONFIG } = await import('../../content/maps/mapsConfig.js');
  const mapRewards = {
    map1_boss: MAPS_CONFIG.map1?.boss?.reward,
    map2_boss: MAPS_CONFIG.map2?.boss?.reward,
    map4_boss: MAPS_CONFIG.map4?.boss?.reward,
    map6_boss: MAPS_CONFIG.map6?.boss?.reward
  };
  console.log('[Test 4] Phần thưởng Boss các vùng:', mapRewards);
  assert.strictEqual(mapRewards.map1_boss?.stars, 3, 'Map 1 Boss: 3 Sao');
  assert.strictEqual(mapRewards.map2_boss?.stars, 5, 'Map 2 Boss: 5 Sao');
  assert.strictEqual(mapRewards.map4_boss?.stars, 8, 'Map 4 Boss: 8 Sao');
  assert.strictEqual(mapRewards.map6_boss?.stars, 15, 'Map 6 Boss: 15 Sao');

  await browser.close();
  console.log('\n🎉 TOÀN BỘ CƠ CHẾ KINH TẾ SAO ĐÃ ĐƯỢC XÁC THỰC HOÀN TOÀN THÀNH CÔNG!');
}

testEconomyAdjusted().catch(err => {
  console.error('Test thất bại:', err);
  process.exit(1);
});
