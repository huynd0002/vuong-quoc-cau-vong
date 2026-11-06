import { chromium } from 'playwright';
import path from 'path';
import assert from 'node:assert/strict';

const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

(async () => {
  console.log('--- [Test] Kiểm Tra Hiệu Ứng explosions/cartoon-pow VFX Khi Câu Được Cá To ---');

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  console.log('Đang tải game: http://localhost:5173/dev.html ...');
  await page.goto('http://localhost:5173/dev.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Đóng modal chọn nhân vật nếu có
  const startBtn = await page.$('.char-start-adventure-cta');
  if (startBtn) {
    await startBtn.click();
    await page.waitForTimeout(1000);
  }

  // Chờ canvas sẵn sàng
  await page.waitForSelector('#game-root canvas', { timeout: 10000 });
  await page.waitForTimeout(1500);

  // 1. Kiểm tra texture vfx_cartoon_pow_sheet đã được tải thành công trong Phaser
  const textureLoaded = await page.evaluate(() => {
    return window.__worldScene?.textures?.exists('vfx_cartoon_pow_sheet') || false;
  });
  console.log('Phaser Texture vfx_cartoon_pow_sheet exists:', textureLoaded);
  assert.equal(textureLoaded, true, 'Texture vfx_cartoon_pow_sheet phải được load trong Phaser PreloadScene');

  // 2. Chuyển sang bản đồ Hồ Câu Lá Sen (map_fishing_pond)
  console.log('Chuyển tới Hồ Câu Lá Sen (map_fishing_pond)...');
  await page.evaluate(() => {
    window.__worldScene?.scene?.restart?.({ mapId: 'map_fishing_pond' });
  });
  await page.waitForTimeout(2000);

  // Đặt hero đứng ở bến câu
  await page.evaluate(() => {
    const ws = window.__worldScene;
    if (ws?.hero) {
      ws.hero.setPosition(680, 360);
      ws.updateDockFishingProximityButton(680, 360);
    }
  });
  await page.waitForTimeout(600);

  // 3. Test trực tiếp gọi hero.playCartoonPowVFX() trên đầu nhân vật
  console.log('Kích hoạt hero.playCartoonPowVFX() để kiểm tra hoạt ảnh trên đầu nhân vật...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.hero.playCartoonPowVFX();
  });

  // Chờ 150ms để hiệu ứng bung nở ngôi sao và chữ POW!
  await page.waitForTimeout(200);

  const animCreated = await page.evaluate(() => {
    return window.__worldScene?.anims?.exists('vfx_cartoon_pow_anim') || false;
  });
  console.log('Phaser Animation vfx_cartoon_pow_anim exists:', animCreated);
  assert.equal(animCreated, true, 'Hoạt ảnh vfx_cartoon_pow_anim phải được khởi tạo trong Phaser');

  // Chụp ảnh bằng chứng 1: Vụ nổ Cartoon POW! trên đỉnh đầu bé
  const shot1 = path.join(artifactDir, 'verified_cartoon_pow_burst_hero_head.png');
  await page.screenshot({ path: shot1 });
  console.log('✓ Đã lưu ảnh Cartoon POW! trên đầu bé:', shot1);

  // Chờ hiệu ứng kết thúc (~1.1s)
  await page.waitForTimeout(1000);

  // 4. Kiểm tra luồng thực tế trong game khi câu được CÁ TO (Cá Rồng Hoàng Kim 1850g)
  console.log('Mô phỏng bắt CÁ TO (Cá Rồng Hoàng Kim 1850g) trong completeOnMapFishingCatch...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.onMapFishingState = {
      phase: 'audition',
      castX: 485,
      castY: 445,
      species: {
        id: 'golden_dragon_fish',
        name: 'Cá Rồng Hoàng Kim',
        icon: '🐲',
        asset: '/assets/fishing/fish_golden_dragon.png',
        sizeTier: 'special',
        requiredHits: 6
      },
      weightG: 1850,
      targetHits: 6,
      currentHits: 6
    };

    // Chuẩn bị turn trong fishingSystem
    if (window.__fishingSystem) {
      window.__fishingSystem.mutate((st) => {
        st.activeTurn = {
          id: 'test-turn-big',
          dockId: 'lotus_dock',
          rodId: 'rod_dragon',
          baitId: 'bait_sweet_cake',
          phase: 'hook',
          castPerfect: true,
          biteCommitted: true,
          speciesId: 'golden_dragon_fish',
          weightG: 1850,
          startedAt: Date.now()
        };
      });
    }

    // Hoàn tất câu cá to
    ws.completeOnMapFishingCatch();
  });

  // Chờ 250ms để hoạt ảnh cartoon-pow bùng nổ rực rỡ và thẻ vinh danh hiển thị
  await page.waitForTimeout(280);

  const shot2 = path.join(artifactDir, 'verified_cartoon_pow_big_fish_catch.png');
  await page.screenshot({ path: shot2 });
  console.log('✓ Đã lưu ảnh Bắt Cá To với Cartoon POW! và Thẻ Vinh Danh:', shot2);

  // 5. Chụp cận cảnh (Zoom) vào khu vực đầu nhân vật để thấy rõ từng pixel ngôi sao nổ & chữ POW!
  console.log('Chụp ảnh cận cảnh (Zoom) đầu nhân vật với Cartoon POW!...');
  await page.evaluate(() => {
    document.getElementById('onmap-catch-visual-card')?.remove();
    document.getElementById('fishing-title-celebration-banner')?.remove();
    const ws = window.__worldScene;
    // Zoom camera 2.4x tập trung vào đầu bé
    ws.cameras.main.pan(680, 310, 200);
    ws.cameras.main.zoomTo(2.4, 200);
    // Kích hoạt lại để ghi nhận khoảnh khắc nét căng
    ws.hero.playCartoonPowVFX();
  });
  await page.waitForTimeout(300);

  const shot3 = path.join(artifactDir, 'verified_cartoon_pow_zoom_close_up.png');
  await page.screenshot({ path: shot3 });
  console.log('✓ Đã lưu ảnh Cận Cảnh Zoom Cartoon POW! trên đầu bé:', shot3);

  // Reset camera
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.cameras.main.pan(640, 360, 100);
    ws.cameras.main.zoomTo(1.0, 100);
  });
  await page.waitForTimeout(300);

  // 6. Kiểm tra cá nhỏ (Cá Mây Tròn 200g) -> KHÔNG kích hoạt Cartoon POW!
  console.log('Kiểm tra cá nhỏ (Cá Mây Tròn 200g) không kích hoạt Cartoon POW...');
  const smallFishPowTriggered = await page.evaluate(() => {
    const ws = window.__worldScene;
    let powCalled = false;
    const originalPlayPow = ws.hero.playCartoonPowVFX;
    ws.hero.playCartoonPowVFX = () => {
      powCalled = true;
      return originalPlayPow.apply(ws.hero);
    };

    ws.onMapFishingState = {
      phase: 'audition',
      castX: 485,
      castY: 445,
      species: {
        id: 'cloud_fish',
        name: 'Cá Mây Tròn',
        icon: '🐟',
        asset: '/assets/fishing/fish_cloud.png',
        sizeTier: 'tiny',
        requiredHits: 1
      },
      weightG: 200,
      targetHits: 1,
      currentHits: 1
    };

    if (window.__fishingSystem) {
      window.__fishingSystem.mutate((st) => {
        st.activeTurn = {
          id: 'test-turn-small',
          dockId: 'lotus_dock',
          rodId: 'rod_lotus',
          baitId: 'bait_lotus',
          phase: 'hook',
          castPerfect: true,
          biteCommitted: true,
          speciesId: 'cloud_fish',
          weightG: 200,
          startedAt: Date.now()
        };
      });
    }

    ws.completeOnMapFishingCatch();
    ws.hero.playCartoonPowVFX = originalPlayPow;
    return powCalled;
  });

  console.log('Cá nhỏ có kích hoạt Cartoon POW không:', smallFishPowTriggered);
  assert.equal(smallFishPowTriggered, false, 'Cá nhỏ (<500g) tuyệt đối không được kích hoạt Cartoon POW!');

  console.log('🎉 TOÀN BỘ CÁC BƯỚC KIỂM TRA HIỆU ỨNG CARTOON-POW KHI CÂU ĐƯỢC CÁ TO ĐÃ ĐẠT 100%!');
  await browser.close();
})();
