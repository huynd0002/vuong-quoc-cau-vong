import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../../');
const gameHtmlPath = path.join(root, 'game.html');
const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

try {
  console.log('--- [Test] Kiểm thử Giao diện & Tính năng Phụ Kiện Thời Trang Mua Bằng Sao ---');

  await page.goto(`file://${gameHtmlPath}`, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  // Đóng story modal hoặc modal khởi đầu nếu có
  try {
    const btnCloseStory = page.locator('#story-start-button');
    if (await btnCloseStory.isVisible({ timeout: 1500 })) {
      await btnCloseStory.click();
    }
  } catch (e) {}

  // 1. Chuyển sang map_fashion_street và cộng 50 Sao cho bé
  await page.evaluate(() => {
    // Nạp sao cho người chơi
    const save = window.__saveAdapter.load();
    if (!save.player) save.player = {};
    save.player.stars = 150;
    save.campaign = save.campaign || {};
    save.campaign.stars = 150;
    window.__saveAdapter.save(save);

    // Dịch chuyển sang Phố Thời Trang
    const game = window.__PHASER_GAME__;
    const scene = game.scene.getScene('WorldScene');
    scene.scene.restart({ mapId: 'map_fashion_street' });
  });

  await page.waitForTimeout(1200);

  // 2. Xác thực trên map_fashion_street KHÔNG CÒN Tiệm May Cô Cừu (Quần Áo)
  const stationsInfo = await page.evaluate(() => {
    const game = window.__PHASER_GAME__;
    const scene = game.scene.getScene('WorldScene');
    return (scene.fashionStationContainers || []).map(s => ({
      id: s.data.id,
      name: s.data.name,
      badge: s.data.badge
    }));
  });

  console.log('Các trạm trên Phố Thời Trang:', stationsInfo);
  assert.ok(!stationsInfo.some(s => s.id === 'station_sheep_tailor'), 'Tiệm May Cô Cừu (quần áo) phải bị xoá bỏ hoàn toàn!');
  assert.ok(stationsInfo.some(s => s.id === 'station_squirrel_accessories'), 'Phải có Quầy Phụ Kiện Bạn Sóc');
  assert.ok(stationsInfo.some(s => s.id === 'station_fitting_mirror'), 'Phải có Gương Thử & Đeo Phụ Kiện');
  assert.ok(stationsInfo.some(s => s.id === 'station_savings_board'), 'Phải có Bảng Dành Dụm');
  assert.ok(stationsInfo.some(s => s.id === 'station_photo_booth'), 'Phải có Góc Chụp Ảnh');

  // 3. Mở Quầy Phụ Kiện (Tab 0)
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:open-fashion-modal', { detail: { tabIndex: 0 } }));
  });

  await page.waitForTimeout(500);

  // Xác thực Modal Phụ Kiện mở ra
  const isModalActive = await page.evaluate(() => {
    const el = document.getElementById('fashion-street-modal');
    return el && !el.hidden && el.classList.contains('active');
  });
  assert.ok(isModalActive, 'Modal Thời Trang / Phụ Kiện phải hiển thị');

  // Kiểm tra danh sách phụ kiện tạo sinh
  const renderedAccessories = await page.evaluate(() => {
    const cards = document.querySelectorAll('#fashion-accessories-list .fashion-item-card');
    return Array.from(cards).map(c => ({
      id: c.getAttribute('data-id'),
      name: c.querySelector('.fashion-item-name')?.textContent?.trim(),
      badge: c.querySelector('.fashion-card-badge')?.textContent?.trim(),
      hasImg: Boolean(c.querySelector('.fashion-item-img'))
    }));
  });

  console.log('Danh sách phụ kiện hiển thị:', renderedAccessories);
  assert.strictEqual(renderedAccessories.length, 7, 'Phải có đủ 7 phụ kiện tạo sinh');
  assert.ok(renderedAccessories.every(a => a.hasImg), 'Tất cả phụ kiện phải hiển thị ảnh icon PNG sắc nét');

  // Chụp ảnh Modal Quầy Phụ Kiện
  await page.screenshot({ path: path.join(artifactsDir, 'verified_fashion_accessories_shop.png') });
  console.log('✓ Đã chụp ảnh Quầy Phụ Kiện: verified_fashion_accessories_shop.png');

  // 4. Mua Vương Miện Cầu Vồng (10 Sao) và Cánh Tiên Bướm (12 Sao)
  await page.evaluate(() => {
    const crownCard = document.querySelector('.fashion-item-card[data-id="acc_rainbow_crown"]');
    const buyCrownBtn = crownCard.querySelector('[data-action="buy-acc"]');
    buyCrownBtn.click();
  });
  await page.waitForTimeout(300);

  await page.evaluate(() => {
    const wingsCard = document.querySelector('.fashion-item-card[data-id="acc_fairy_wings"]');
    const buyWingsBtn = wingsCard.querySelector('[data-action="buy-acc"]');
    buyWingsBtn.click();
  });
  await page.waitForTimeout(300);

  // Kiểm tra số Sao bị trừ chính xác (150 - 50 - 75 = 25 Sao)
  const currentStars = await page.evaluate(() => window.__fashionSystem.getPlayerStars());
  assert.strictEqual(currentStars, 25, 'Số sao phải bị trừ chuẩn xác: 150 - 50 - 75 = 25');

  // 5. Đeo Vương Miện Cầu Vồng lên nhân vật Bé Sam
  await page.evaluate(() => {
    window.__fashionSystem.equipAccessory('acc_rainbow_crown');
  });
  await page.waitForTimeout(300);

  // Đóng modal để kiểm tra nhân vật trong thế giới Phaser
  await page.evaluate(() => {
    window.__fashionStreetModal.close();
  });
  await page.waitForTimeout(500);

  const heroCrownCheck = await page.evaluate(() => {
    const game = window.__PHASER_GAME__;
    const scene = game.scene.getScene('WorldScene');
    const hero = scene.hero;
    return {
      hasAccessory: Boolean(hero.accessorySprite),
      accessoryId: hero.accessoryId,
      textureKey: hero.accessorySprite?.texture?.key,
      visible: hero.accessorySprite?.visible,
      heroX: hero.getX(),
      heroY: hero.getY(),
      accX: hero.accessorySprite?.x,
      accY: hero.accessorySprite?.y
    };
  });

  console.log('Kiểm tra Bé Sam đeo Vương Miện trong game:', heroCrownCheck);
  assert.strictEqual(heroCrownCheck.accessoryId, 'acc_rainbow_crown');
  assert.strictEqual(heroCrownCheck.textureKey, 'acc_rainbow_crown');
  assert.ok(heroCrownCheck.visible, 'Phụ kiện vương miện phải hiển thị trên người Bé Sam');

  // Chụp ảnh Bé Sam đội Vương Miện trong WorldScene
  await page.screenshot({ path: path.join(artifactsDir, 'verified_hero_wearing_crown.png') });
  console.log('✓ Đã chụp ảnh Bé Sam đội Vương Miện: verified_hero_wearing_crown.png');

  // 6. Đổi sang đeo Cánh Tiên Bướm Cầu Vồng
  await page.evaluate(() => {
    window.__fashionSystem.equipAccessory('acc_fairy_wings');
  });
  await page.waitForTimeout(500);

  const heroWingsCheck = await page.evaluate(() => {
    const game = window.__PHASER_GAME__;
    const scene = game.scene.getScene('WorldScene');
    const hero = scene.hero;
    return {
      accessoryId: hero.accessoryId,
      textureKey: hero.accessorySprite?.texture?.key,
      depth: hero.accessorySprite?.depth,
      heroDepth: hero.sprite?.depth
    };
  });

  console.log('Kiểm tra Bé Sam đeo Cánh Tiên:', heroWingsCheck);
  assert.strictEqual(heroWingsCheck.accessoryId, 'acc_fairy_wings');
  assert.strictEqual(heroWingsCheck.textureKey, 'acc_fairy_wings');

  await page.screenshot({ path: path.join(artifactsDir, 'verified_hero_wearing_wings.png') });
  console.log('✓ Đã chụp ảnh Bé Sam đeo Cánh Tiên: verified_hero_wearing_wings.png');

  // 7. Mở Gương Thử Đồ (Tab 1) và kiểm tra soi gương
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:open-fashion-modal', { detail: { tabIndex: 1 } }));
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(artifactsDir, 'verified_fashion_mirror_preview.png') });
  console.log('✓ Đã chụp ảnh Gương Thử Phụ Kiện: verified_fashion_mirror_preview.png');

  // 8. Kiểm tra tháo phụ kiện (Unequip)
  await page.evaluate(() => {
    window.__fashionSystem.unequipAccessory();
    window.__fashionStreetModal.close();
  });
  await page.waitForTimeout(300);

  const heroEmptyCheck = await page.evaluate(() => {
    const game = window.__PHASER_GAME__;
    const scene = game.scene.getScene('WorldScene');
    return Boolean(scene.hero.accessorySprite);
  });
  assert.strictEqual(heroEmptyCheck, false, 'Sau khi tháo ra, accessorySprite phải bị dọn sạch');

  console.log('🎉 TẤT CẢ CÁC BƯỚC KIỂM THỬ PLAYWRIGHT BROWSER ĐÃ THÀNH CÔNG RỰC RỠ!');
} catch (err) {
  console.error('❌ Lỗi kiểm thử browser:', err);
  process.exit(1);
} finally {
  await browser.close();
}
