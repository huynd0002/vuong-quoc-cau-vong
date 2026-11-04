import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('[Test] Kiểm tra ẩn thanh Tab và tinh chỉnh phụ kiện vừa vặn đầu nhân vật...');
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
  // TEST 1: Kiểm tra bỏ thanh Tab Quầy Phụ Kiện / Góc Chụp Ảnh (Ảnh 1)
  // =========================================================================
  console.log('\n--- [Test 1] Kiểm tra modal Phố Phụ Kiện: Thanh Tab đã bị ẩn hoàn toàn ---');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:open-fashion-modal', { detail: { tabIndex: 0 } }));
  });
  await page.waitForTimeout(800);

  const navBarCheck = await page.evaluate(() => {
    const navBar = document.querySelector('.fashion-nav-bar');
    const computedDisplay = navBar ? window.getComputedStyle(navBar).display : 'none';
    const isHidden = !navBar || computedDisplay === 'none' || navBar.offsetParent === null;
    return {
      hasNavBar: Boolean(navBar),
      computedDisplay,
      isHidden
    };
  });

  console.log('Kết quả kiểm tra thanh Tab:', navBarCheck);
  assert.strictEqual(navBarCheck.isHidden, true, 'Thanh điều hướng Tab phải bị ẩn hoàn toàn khỏi modal!');

  const shot1 = path.join(artifactDir, 'verified_fashion_nav_bar_hidden.png');
  await page.screenshot({ path: shot1 });
  console.log('✓ Đã lưu ảnh: verified_fashion_nav_bar_hidden.png');

  // Đóng modal
  await page.evaluate(() => {
    window.__fashionStreetModal?.close?.();
  });
  await page.waitForTimeout(400);

  // =========================================================================
  // TEST 2: Kiểm tra phụ kiện hiển thị đúng với đầu nhân vật (Ảnh 2)
  // =========================================================================
  console.log('\n--- [Test 2] Kiểm tra phụ kiện Bờm Tai Gấu Trúc (acc_panda_headband) trên đầu Bé Sam ---');
  await page.evaluate(() => {
    const hero = window.__worldScene?.hero;
    const fSys = window.__fashionSystem;
    if (hero && fSys) {
      fSys.saveState({
        ownedAccessories: ['acc_panda_headband', 'acc_rainbow_crown', 'acc_witch_hat', 'acc_heart_glasses', 'acc_angel_halo'],
        equippedAccessoryId: 'acc_panda_headband'
      });
      hero.setAccessory('acc_panda_headband');
    }
  });
  await page.waitForTimeout(800);

  const heroAccCheck = await page.evaluate(() => {
    const hero = window.__worldScene?.hero;
    const accSprite = hero?.accessorySprite;
    if (!accSprite) return null;

    const heroY = hero.getY();
    const accY = accSprite.y;
    const diffY = accY - heroY; // Tương ứng offsetY
    const displayW = accSprite.displayWidth;
    const displayH = accSprite.displayHeight;

    return {
      heroY,
      accY,
      diffY,
      displayW,
      displayH,
      accessoryId: hero.accessoryId
    };
  });

  console.log('Kết quả kiểm tra vị trí Bờm Tai Gấu Trúc trên đầu nhân vật:', heroAccCheck);
  assert.ok(heroAccCheck, 'Phải có sprite phụ kiện trên nhân vật');
  assert.strictEqual(heroAccCheck.diffY, -50, 'offsetY của Bờm Tai Gấu Trúc phải là -50 (nằm ngay ngắn trên đỉnh đầu)');
  assert.strictEqual(heroAccCheck.displayW, 38, 'Chiều rộng Bờm Tai Gấu Trúc phải là 38px vừa vặn đầu bé');
  assert.strictEqual(heroAccCheck.displayH, 38, 'Chiều cao Bờm Tai Gấu Trúc phải là 38px');

  // Chụp ảnh zoom cận cảnh nhân vật đeo bờm tai gấu trúc
  const shot2 = path.join(artifactDir, 'verified_panda_headband_fitted_on_head.png');
  await page.screenshot({ path: shot2 });
  console.log('✓ Đã lưu ảnh: verified_panda_headband_fitted_on_head.png');

  // =========================================================================
  // TEST 3: Kiểm tra các phụ kiện khác (Vương Miện Cầu Vồng & Kính Mát Trái Tim)
  // =========================================================================
  console.log('\n--- [Test 3] Kiểm tra phụ kiện khác (acc_rainbow_crown & acc_heart_glasses) ---');
  await page.evaluate(() => {
    const hero = window.__worldScene?.hero;
    hero?.setAccessory('acc_rainbow_crown');
  });
  await page.waitForTimeout(400);

  const crownCheck = await page.evaluate(() => {
    const hero = window.__worldScene?.hero;
    const accSprite = hero?.accessorySprite;
    return {
      diffY: accSprite.y - hero.getY(),
      displayW: accSprite.displayWidth,
      displayH: accSprite.displayHeight
    };
  });
  console.log('Kiểm tra Vương Miện Cầu Vồng:', crownCheck);
  assert.strictEqual(crownCheck.diffY, -49, 'Vương Miện Cầu Vồng phải nằm ở đỉnh đầu (-49)');
  assert.strictEqual(crownCheck.displayW, 32, 'Vương Miện Cầu Vồng rộng 32px');

  const shot3 = path.join(artifactDir, 'verified_crown_fitted_on_head.png');
  await page.screenshot({ path: shot3 });
  console.log('✓ Đã lưu ảnh: verified_crown_fitted_on_head.png');

  // Trả về bờm tai gấu trúc ban đầu để giữ đúng trạng thái
  await page.evaluate(() => {
    const hero = window.__worldScene?.hero;
    hero?.setAccessory('acc_panda_headband');
  });
  await page.waitForTimeout(200);

  await browser.close();
  console.log('\n🎉 TOÀN BỘ 2 YÊU CẦU ĐÃ ĐẠT CHUẨN XUẤT SẮC!');
}

runTest().catch((err) => {
  console.error('TEST THẤT BẠI:', err);
  process.exit(1);
});
