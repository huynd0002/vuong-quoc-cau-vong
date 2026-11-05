import { chromium } from 'playwright';
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('--- [Test] Kiểm tra thu nhỏ Cổng Di Chuyển & Tối ưu vị trí trên Maps ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window !== 'undefined' && !!window.__worldScene, { timeout: 45000 });
  await page.waitForTimeout(2000);

  // Close modals if present
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });

  // 1. Chuyển sang map_pet_farm để kiểm tra Cổng thần
  console.log('\n--- [1] Kiểm tra map_pet_farm & Cổng thần ---');
  await page.evaluate(() => {
    window.__worldScene.scene.restart({ mapId: 'map_pet_farm' });
  });
  await page.waitForTimeout(2000);

  const farmPortalInfo = await page.evaluate(() => {
    const ws = window.__worldScene;
    const portals = (ws.portals || []).map(p => ({
      id: p.data?.id,
      name: p.targetMapName || p.data?.name,
      x: p.x,
      y: p.y,
      size: p.size,
      depth: p.container?.depth,
      spriteWidth: p.sprite?.displayWidth,
      spriteHeight: p.sprite?.displayHeight,
      touchZoneW: p.touchZone?.width,
      touchZoneH: p.touchZone?.height
    }));
    return {
      currentMapId: ws.currentMapId,
      portals
    };
  });

  console.log('Farm portal info:', JSON.stringify(farmPortalInfo, null, 2));

  assert.ok(farmPortalInfo.portals.length >= 2, 'map_pet_farm phải có các cổng');
  const p1 = farmPortalInfo.portals[0];
  assert.strictEqual(p1.size, 84, 'Kích thước cổng phải thu nhỏ về 84px');
  assert.strictEqual(p1.depth, 8, 'Depth của cổng phải là 8 để không bị che khuất');
  assert.ok(p1.spriteWidth >= 83 && p1.spriteWidth <= 88, 'Sprite display width phải nằm trong khoảng dao động nhịp thở 84px');
  assert.ok(p1.spriteHeight >= 83 && p1.spriteHeight <= 88, 'Sprite display height phải nằm trong khoảng dao động nhịp thở 84px');

  // Kiểm tra cổng hồ câu không trùng station (1210, 310 vs station 1210, 420)
  const fishingPortal = farmPortalInfo.portals.find(p => p.id === 'portal_farm_to_fishing');
  assert.ok(fishingPortal, 'Phải có portal_farm_to_fishing');
  assert.strictEqual(fishingPortal.y, 310, 'Cổng Hồ câu phải ở y=310, không trùng station y=420');

  // Kiểm tra cổng hành trình không bị joystick che (y: 440)
  const journeyPortal = farmPortalInfo.portals.find(p => p.id === 'portal_pet_farm_to_journey');
  assert.ok(journeyPortal, 'Phải có portal_pet_farm_to_journey');
  assert.strictEqual(journeyPortal.y, 440, 'Cổng hành trình phải ở y=440 để không bị joystick che');

  // 2. Kiểm tra map_rainbow_market: Cổng về nông trại không bị nút túi đè lên (x: 640, y: 505)
  console.log('\n--- [2] Kiểm tra map_rainbow_market ---');
  await page.evaluate(() => {
    window.__worldScene.scene.restart({ mapId: 'map_rainbow_market' });
  });
  await page.waitForTimeout(2000);

  const marketPortalInfo = await page.evaluate(() => {
    const ws = window.__worldScene;
    return (ws.portals || []).map(p => ({
      id: p.data?.id,
      name: p.targetMapName || p.data?.name,
      x: p.x,
      y: p.y
    }));
  });
  console.log('Market portal info:', JSON.stringify(marketPortalInfo, null, 2));

  const marketToFarm = marketPortalInfo.find(p => p.id === 'portal_market_to_farm');
  assert.ok(marketToFarm, 'Phải có portal_market_to_farm');
  assert.strictEqual(marketToFarm.y, 505, 'portal_market_to_farm y phải là 505 (thông thoáng phía trên nút Túi)');

  // Chụp ảnh bằng chứng
  const artifactPath = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_optimized_smaller_portals.png');
  await page.screenshot({ path: artifactPath, fullPage: false });
  console.log(`\n✓ Đã chụp ảnh bằng chứng: ${artifactPath}`);

  await browser.close();
  console.log('\n🎉 TẤT CẢ KIỂM TRA THU NHỎ CỔNG VÀ TỐI ƯU VỊ TRÍ ĐÃ THÀNH CÔNG RỰC RỠ!');
})();
