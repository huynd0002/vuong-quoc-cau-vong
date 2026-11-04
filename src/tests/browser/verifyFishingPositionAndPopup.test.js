import { chromium } from 'playwright';
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('--- [Test] Kiểm Tra Toàn Diện: Vị Trí Đứng Câu Cá, Bến Câu & Pop-up Nhận Cá ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  console.log(`[Test] Đang tải game: ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Close introductory modals if open
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });

  // Switch to Hồ Câu Lá Sen (map_fishing_pond)
  console.log('[Test] Chuyển tới Hồ Câu Lá Sen (map_fishing_pond)...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    if (ws) {
      ws.scene.restart({ mapId: 'map_fishing_pond' });
    }
  });
  await page.waitForTimeout(2000);

  // 1. Kiểm tra cấu hình bến câu & vùng câu cá chuẩn xác
  const mapDockConfig = await page.evaluate(() => {
    const ws = window.__worldScene;
    const pondCfg = ws.mapConfig || {};
    const lotusDock = (pondCfg.fishingStations || []).find(s => s.id === 'station_lotus_dock');
    return {
      currentMapId: ws.currentMapId,
      lotusDock: lotusDock ? { x: lotusDock.x, y: lotusDock.y, interactionPoint: lotusDock.interactionPoint } : null,
      walkableDockRect: pondCfg.pondWaterZone?.walkableDockRect
    };
  });
  console.log('[Test] Cấu hình Bến câu:', JSON.stringify(mapDockConfig));
  assert.equal(mapDockConfig.currentMapId, 'map_fishing_pond', 'Phải đang ở map_fishing_pond');
  assert.equal(mapDockConfig.lotusDock?.x, 688, 'Tọa độ X bến câu chuẩn trên cầu gỗ phải là 688');
  assert.equal(mapDockConfig.lotusDock?.y, 360, 'Tọa độ Y bến câu chuẩn trên cầu gỗ phải là 360');

  // 2. Di chuyển nhân vật tới bến câu (688, 360) và kiểm tra Nút "🎣 Bắt đầu câu cá"
  console.log('[Test] Kiểm tra vị trí đứng và nút Bắt đầu câu cá tại bến gỗ...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.hero.setPosition(688, 360);
    ws.updateDockFishingProximityButton(688, 360);
  });
  await page.waitForTimeout(500);

  const startBtnInfo = await page.evaluate(() => {
    const btn = document.getElementById('btn-start-fishing-dock');
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(btn);
    return {
      display: btn.style.display,
      left: btn.style.left,
      top: btn.style.top,
      visible: computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden',
      rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) }
    };
  });
  console.log('[Test] Nút Bắt đầu câu cá:', JSON.stringify(startBtnInfo));
  assert.ok(startBtnInfo, 'Nút Bắt đầu câu cá phải tồn tại');
  assert.ok(startBtnInfo.visible, 'Nút Bắt đầu câu cá phải hiển thị khi đứng ở bến câu');
  assert.equal(startBtnInfo.left, '53.8%', 'Nút phải đặt ở left: 53.8% (trên trục bến câu)');
  assert.equal(startBtnInfo.top, '41%', 'Nút phải đặt ở top: 41% (ngay trên đầu nhân vật)');

  // Chụp ảnh bằng chứng 1: Bến câu gỗ & Nút bắt đầu câu cá
  const artifactPath1 = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_dock_standing_and_start_button.png';
  await page.screenshot({ path: artifactPath1 });
  console.log(`[Test] Đã chụp ảnh xác minh 1: ${artifactPath1}`);

  // 3. Kiểm tra ẩn nút khi nhân vật rời xa bến gỗ
  console.log('[Test] Kiểm tra ẩn nút khi rời xa bến gỗ...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.hero.setPosition(250, 535);
    ws.updateDockFishingProximityButton(250, 535);
  });
  await page.waitForTimeout(300);
  const hiddenBtnDisplay = await page.evaluate(() => {
    const btn = document.getElementById('btn-start-fishing-dock');
    return btn ? btn.style.display : null;
  });
  assert.equal(hiddenBtnDisplay, 'none', 'Nút bắt đầu câu cá phải ẩn khi nhân vật rời xa bến');

  // 4. Bắt đầu câu cá và kiểm tra nhân vật đứng chuẩn xác tại (688, 360) quay mặt sang trái
  console.log('[Test] Bắt đầu câu cá trực tiếp trên bến câu...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.startOnMapFishing();
  });
  await page.waitForTimeout(400);

  const heroFishingPos = await page.evaluate(() => {
    const ws = window.__worldScene;
    return {
      x: ws.hero.getX(),
      y: ws.hero.getY(),
      facing: ws.hero.facing
    };
  });
  console.log('[Test] Vị trí và hướng nhân vật khi câu:', JSON.stringify(heroFishingPos));
  assert.equal(heroFishingPos.x, 688, 'Nhân vật phải đứng chuẩn xác tại X=688 trên cầu gỗ');
  assert.equal(heroFishingPos.y, 360, 'Nhân vật phải đứng chuẩn xác tại Y=360 trên cầu gỗ');
  assert.equal(heroFishingPos.facing, 'left', 'Nhân vật phải quay mặt sang trái (hướng ra mặt hồ)');

  // 5. Kiểm tra Pop-up nhận cá nhỏ (small fish) hiển thị chuẩn xác tại bến câu và không bị duplicate banner
  console.log('[Test] Nhận cá nhỏ (Cá Mây Tròn 250g)...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.onMapFishingState = {
      phase: 'biting',
      castX: 485,
      castY: 445,
      species: { id: 'cloud_fish', name: 'Cá Mây Tròn', asset: '/assets/fishing/fish_cloud.png', icon: '🐟' },
      weightG: 250
    };
    ws.completeOnMapFishingCatch();
  });
  await page.waitForTimeout(300);

  const smallCatchInfo = await page.evaluate(() => {
    const card = document.getElementById('onmap-catch-visual-card');
    const banner = document.getElementById('fishing-title-celebration-banner');
    const cardRect = card ? card.getBoundingClientRect() : null;
    const computedCard = card ? window.getComputedStyle(card) : null;
    return {
      hasCard: !!card,
      hasBanner: !!banner,
      cardClasses: card ? card.className : null,
      cardLeft: computedCard ? computedCard.left : null,
      cardTop: computedCard ? computedCard.top : null,
      cardRect: cardRect ? { x: Math.round(cardRect.x), y: Math.round(cardRect.y), width: Math.round(cardRect.width), height: Math.round(cardRect.height) } : null
    };
  });
  console.log('[Test] Pop-up nhận cá nhỏ:', JSON.stringify(smallCatchInfo));
  assert.ok(smallCatchInfo.hasCard, 'Pop-up nhận cá nhỏ phải xuất hiện');
  assert.equal(smallCatchInfo.hasBanner, false, 'Cá nhỏ không được spam duplicate title banner ở trên đỉnh');
  assert.ok(smallCatchInfo.cardClasses.includes('small-fish-quick'), 'Card phải có class small-fish-quick');

  // Chụp ảnh bằng chứng 2: Pop-up nhận cá nhỏ trên bến câu
  const artifactPath2 = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_small_fish_popup_on_dock.png';
  await page.screenshot({ path: artifactPath2 });
  console.log(`[Test] Đã chụp ảnh xác minh 2: ${artifactPath2}`);

  // Chờ hiệu ứng bay vào túi (kích hoạt ở 600ms, biến mất ở 1150ms)
  await page.waitForTimeout(400);
  const flyState = await page.evaluate(() => {
    const card = document.getElementById('onmap-catch-visual-card');
    return card ? card.classList.contains('fly-to-bag') : false;
  });
  console.log('[Test] Trạng thái bay vào túi:', flyState);
  assert.ok(flyState, 'Card phải kích hoạt hiệu ứng fly-to-bag bay vào Túi Của Bé');
  await page.waitForTimeout(600);

  // 6. Kiểm tra Pop-up nhận cá to khủng (big fish) hiển thị trang trọng, cân đối và không đè vỡ layout
  console.log('[Test] Nhận cá to khủng (Cá Chép Khổng Lồ 850g)...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.onMapFishingState = {
      phase: 'biting',
      castX: 485,
      castY: 445,
      species: { id: 'big_carp', name: 'Cá Chép Khổng Lồ', asset: '/assets/fishing/fish_pond.png', icon: '🐟' },
      weightG: 850
    };
    ws.completeOnMapFishingCatch();
  });
  await page.waitForTimeout(300);

  const bigCatchInfo = await page.evaluate(() => {
    const card = document.getElementById('onmap-catch-visual-card');
    const banner = document.getElementById('fishing-title-celebration-banner');
    const cardRect = card ? card.getBoundingClientRect() : null;
    const bannerRect = banner ? banner.getBoundingClientRect() : null;
    return {
      hasCard: !!card,
      hasBanner: !!banner,
      cardClasses: card ? card.className : null,
      cardRect: cardRect ? { x: Math.round(cardRect.x), y: Math.round(cardRect.y), width: Math.round(cardRect.width), height: Math.round(cardRect.height) } : null,
      bannerRect: bannerRect ? { x: Math.round(bannerRect.x), y: Math.round(bannerRect.y), width: Math.round(bannerRect.width), height: Math.round(bannerRect.height) } : null
    };
  });
  console.log('[Test] Pop-up nhận cá to:', JSON.stringify(bigCatchInfo));
  assert.ok(bigCatchInfo.hasCard, 'Pop-up nhận cá to phải xuất hiện');
  assert.ok(bigCatchInfo.cardClasses.includes('big-fish-celebration'), 'Card phải có class big-fish-celebration');

  // Chụp ảnh bằng chứng 3: Pop-up nhận cá to cân đối, nổi bật
  const artifactPath3 = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_big_fish_celebration_popup.png';
  await page.screenshot({ path: artifactPath3 });
  console.log(`[Test] Đã chụp ảnh xác minh 3: ${artifactPath3}`);

  await browser.close();
  console.log('\n🎉 TOÀN BỘ CÁC BƯỚC KIỂM TRA ĐÃ THÀNH CÔNG RỰC RỠ 100%!');
})();
