import { chromium } from 'playwright';
import assert from 'node:assert/strict';

async function main() {
  console.log('🚀 Bắt đầu kiểm thử Cổng Dịch Chuyển Nhà Thú Cưng & Căn Bếp...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.text()));

  await page.goto('http://127.0.0.1:5173/dev.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Nhấn Bắt đầu phiêu lưu nếu có modal chọn nhân vật
  try {
    const startBtn = page.locator('#char-btn-start-adventure');
    if (await startBtn.isVisible({ timeout: 2500 })) {
      await startBtn.click();
      await page.waitForTimeout(1500);
    }
  } catch (e) {
    console.log('Không có modal nhân vật hoặc đã qua');
  }

  // Đóng bất kỳ modal nào đang mở
  await page.evaluate(() => {
    window.__characterSelectModal?.hide?.();
    const sinkModal = document.getElementById('kitchen-sink-modal');
    if (sinkModal) sinkModal.style.display = 'none';
  });
  await page.waitForTimeout(600);

  // 1. Kiểm tra Cổng Vào Bếp tại Cửa Ngôi Nhà Thú Cưng trên map_pet_farm
  console.log('\n--- 1. Kiểm tra Cổng Vào Bếp tại Cửa Nhà Thú Cưng (map_pet_farm) ---');
  const farmPortalInfo = await page.evaluate(async () => {
    const scene = window.__worldScene;
    if (scene.currentMapId !== 'map_pet_farm') {
      window.__travelToZone('map_pet_farm');
      await new Promise(r => setTimeout(r, 1500));
    }

    const portals = scene.portals || [];
    const kitchenPortal = portals.find(p => p.targetMapId === 'map_kitchen' || p.data?.id === 'portal_farm_to_kitchen');

    return {
      currentMapId: scene.currentMapId,
      portalFound: Boolean(kitchenPortal),
      portalX: kitchenPortal?.x,
      portalY: kitchenPortal?.y,
      badgeText: kitchenPortal?.badgeText,
      targetMapId: kitchenPortal?.targetMapId
    };
  });

  console.log('  Thông tin cổng nhà thú cưng:', farmPortalInfo);
  assert.ok(farmPortalInfo.portalFound, 'Tìm thấy Cổng Vào Bếp trên map_pet_farm');
  assert.strictEqual(farmPortalInfo.portalX, 740, 'Cổng đặt đúng trục X cửa ngôi nhà thú cưng (740)');
  assert.strictEqual(farmPortalInfo.portalY, 305, 'Cổng đặt đúng trục Y cửa ngôi nhà thú cưng (305)');
  assert.strictEqual(farmPortalInfo.targetMapId, 'map_kitchen', 'Đích đến là map_kitchen');

  await page.screenshot({ path: 'scripts/verified_farm_kitchen_portal.png' });
  console.log('  Đã chụp ảnh verified_farm_kitchen_portal.png');

  // 2. Tương tác Cổng Vào Bếp -> Dịch chuyển vào Căn Bếp
  console.log('\n--- 2. Tương tác Cổng Vào Bếp -> Bước vào Căn Bếp Cầu Vồng ---');
  await page.evaluate(async () => {
    const scene = window.__worldScene;
    const kitchenPortal = scene.portals.find(p => p.targetMapId === 'map_kitchen');
    kitchenPortal.handleInteract();
  });

  // Chờ dịch chuyển không gian (3.5s - 4.6s)
  await page.waitForTimeout(4800);

  // Đóng pop-up bồn rửa tay hoặc các modal nếu tự động mở khi vào bếp
  await page.evaluate(() => {
    window.__kitchenStationModal?.close?.();
    const root = document.getElementById('kitchen-station-popup-root');
    if (root) {
      root.hidden = true;
      root.style.display = 'none';
      root.innerHTML = '';
    }
    const sink = document.getElementById('kitchen-sink-modal');
    if (sink) {
      sink.style.display = 'none';
      sink.classList.remove('active');
    }
    const kitchenModal = document.getElementById('kitchen-main-modal');
    if (kitchenModal) {
      kitchenModal.style.display = 'none';
      kitchenModal.classList.remove('active');
    }
    document.querySelectorAll('.modal-overlay.active, .kitchen-modal-overlay.active, .sink-modal-overlay.active').forEach(m => {
      m.style.display = 'none';
      m.classList.remove('active');
    });
  });
  await page.waitForTimeout(600);

  // Đảm bảo đóng popup một lần nữa ngay trước khi chụp ảnh
  await page.evaluate(() => {
    window.__kitchenStationModal?.close?.();
    const root = document.getElementById('kitchen-station-popup-root');
    if (root) {
      root.hidden = true;
      root.style.display = 'none';
      root.innerHTML = '';
    }
  });
  await page.waitForTimeout(200);

  // 3. Kiểm tra Cổng Ra Nông Trại ở Thảm Chùi Chân Hình Trái Tim trên map_kitchen
  console.log('\n--- 3. Kiểm tra Cổng Trở Về Nông Trại tại Cửa & Thảm Trái Tim (map_kitchen) ---');
  const kitchenPortalInfo = await page.evaluate(() => {
    const scene = window.__worldScene;
    const portals = scene.portals || [];
    const returnPortal = scene.returnPortal || portals.find(p => p.isReturn || p.targetMapId === 'map_pet_farm');

    return {
      currentMapId: scene.currentMapId,
      portalFound: Boolean(returnPortal),
      portalX: returnPortal?.x,
      portalY: returnPortal?.y,
      badgeText: returnPortal?.badgeText,
      targetMapId: returnPortal?.targetMapId,
      heroX: scene.hero?.getX(),
      heroY: scene.hero?.getY()
    };
  });

  console.log('  Thông tin cổng trong Bếp:', kitchenPortalInfo);
  assert.strictEqual(kitchenPortalInfo.currentMapId, 'map_kitchen', 'Đang ở map_kitchen');
  assert.ok(kitchenPortalInfo.portalFound, 'Tìm thấy Cổng Trở Về trên map_kitchen');
  assert.strictEqual(kitchenPortalInfo.portalX, 205, 'Cổng đặt đúng trục X thảm chùi chân trái tim (205)');
  assert.strictEqual(kitchenPortalInfo.portalY, 630, 'Cổng đặt đúng trục Y thảm chùi chân trái tim (630)');
  assert.strictEqual(kitchenPortalInfo.targetMapId, 'map_pet_farm', 'Cổng dẫn về map_pet_farm');

  await page.screenshot({ path: 'scripts/verified_kitchen_door_portal.png' });
  console.log('  Đã chụp ảnh verified_kitchen_door_portal.png');

  // 4. Bấm Cổng ở Thảm Trái Tim -> Dịch chuyển trở về Nông Trại
  console.log('\n--- 4. Tương tác Cổng Trở Về -> Bước ra Nông Trại Thú Cưng ---');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const returnPortal = scene.returnPortal || scene.portals.find(p => p.isReturn);
    returnPortal.handleInteract();
  });

  await page.waitForTimeout(4800);

  const returnFarmInfo = await page.evaluate(() => {
    const scene = window.__worldScene;
    return {
      currentMapId: scene.currentMapId,
      heroActive: Boolean(scene.hero)
    };
  });

  console.log('  Kết quả quay lại Nông Trại:', returnFarmInfo);
  assert.strictEqual(returnFarmInfo.currentMapId, 'map_pet_farm', 'Đã quay trở lại map_pet_farm an toàn');

  await page.screenshot({ path: 'scripts/verified_return_to_farm.png' });
  console.log('  Đã chụp ảnh verified_return_to_farm.png');

  console.log('\n🎉 TẤT CẢ CÁC BƯỚC KIỂM THỬ VỊ TRÍ CỔNG ĐÃ HOÀN HẢO 100%!');
  await browser.close();
}

main().catch(err => {
  console.error('❌ Kiểm thử thất bại:', err);
  process.exit(1);
});
