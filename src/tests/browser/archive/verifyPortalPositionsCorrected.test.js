import { chromium } from 'playwright';
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('--- [Test] Kiểm tra vị trí Cổng Dịch Chuyển & Giao Diện Các Map ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Close intro modals if open
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });

  // 1. Kiểm tra Map Nông Trại Thú Cưng (map_pet_farm)
  console.log('\n--- [1] Kiểm tra map_pet_farm ---');
  await page.evaluate(() => {
    window.__worldScene.scene.restart({ mapId: 'map_pet_farm' });
  });
  await page.waitForTimeout(2000);

  const farmPortals = await page.evaluate(() => {
    const ws = window.__worldScene;
    const portals = (ws.portals || []).map(p => ({
      id: p.data?.id,
      name: p.targetMapName || p.data?.name,
      x: p.x,
      y: p.y
    }));
    return {
      currentMapId: ws.currentMapId,
      portals
    };
  });
  console.log('Farm portals:', farmPortals);

  const fishingPortal = farmPortals.portals.find(p => p.id === 'portal_farm_to_fishing' || (p.name || '').includes('Lá Sen'));
  assert.ok(fishingPortal, 'Phải có Cổng Hồ Câu Lá Sen trên map_pet_farm');
  assert.strictEqual(fishingPortal.x, 1210, 'Cổng Hồ Câu Lá Sen x phải là 1210 (tại khe hàng rào gỗ)');
  assert.strictEqual(fishingPortal.y, 420, 'Cổng Hồ Câu Lá Sen y phải là 420 (tại khe hàng rào gỗ)');

  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_pet_farm_portal_correct.png' });
  console.log('✓ [1] Đã chụp ảnh verified_pet_farm_portal_correct.png');

  // 2. Kiểm tra Map Chợ Cầu Vồng (map_rainbow_market)
  console.log('\n--- [2] Kiểm tra map_rainbow_market ---');
  await page.evaluate(() => {
    window.__worldScene.scene.restart({ mapId: 'map_rainbow_market' });
  });
  await page.waitForTimeout(2000);

  const marketPortals = await page.evaluate(() => {
    const ws = window.__worldScene;
    const portals = (ws.portals || []).map(p => ({
      id: p.data?.id,
      name: p.targetMapName || p.data?.name,
      x: p.x,
      y: p.y
    }));
    return {
      currentMapId: ws.currentMapId,
      portals
    };
  });
  console.log('Market portals:', marketPortals);

  const farmReturnPortal = marketPortals.portals.find(p => p.id === 'portal_market_to_farm' || (p.name || '').includes('Nông Trại'));
  assert.ok(farmReturnPortal, 'Phải có Cổng Về Nông Trại trên map_rainbow_market');
  assert.strictEqual(farmReturnPortal.x, 640, 'Cổng Về Nông Trại x phải là 640 (đúng giữa đường đá lát lối đi chính bên trái)');
  assert.strictEqual(farmReturnPortal.y, 615, 'Cổng Về Nông Trại y phải là 615');

  const fashionPortal = marketPortals.portals.find(p => p.id === 'portal_market_to_fashion' || (p.name || '').includes('Thời Trang'));
  assert.ok(fashionPortal, 'Phải có Cổng Phố Thời Trang');
  assert.strictEqual(fashionPortal.x, 1100, 'Cổng Phố Thời Trang giữ nguyên bên phải x: 1100');

  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_rainbow_market_portal_correct.png' });
  console.log('✓ [2] Đã chụp ảnh verified_rainbow_market_portal_correct.png');

  // 3. Kiểm tra Map Phố Thời Trang (map_fashion_street)
  console.log('\n--- [3] Kiểm tra map_fashion_street ---');
  await page.evaluate(() => {
    window.__worldScene.scene.restart({ mapId: 'map_fashion_street' });
  });
  await page.waitForTimeout(2000);

  const fashionStations = await page.evaluate(() => {
    const ws = window.__worldScene;
    const stations = (ws.fashionStationContainers || []).map(s => ({
      id: s.data?.id,
      name: s.data?.name,
      x: s.data?.x,
      y: s.data?.y
    }));
    return {
      currentMapId: ws.currentMapId,
      stationCount: stations.length,
      stations
    };
  });
  console.log('Fashion stations:', fashionStations);
  assert.strictEqual(fashionStations.stationCount, 2, 'Phố Thời Trang chỉ được có đúng 2 trạm đối diện nhau');

  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_fashion_street_portal_correct.png' });
  console.log('✓ [3] Đã chụp ảnh verified_fashion_street_portal_correct.png');

  await browser.close();
  console.log('\n🎉 TOÀN BỘ CÁC CỔNG ĐÃ ĐƯỢC DI CHUYỂN CHÍNH XÁC VÀ KIỂM CHỨNG THÀNH CÔNG!');
})();
