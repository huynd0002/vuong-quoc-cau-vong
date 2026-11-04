import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAllUserScreenshotsFixes() {
  console.log('[Test] Starting Verification of All User Screenshot Fixes...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Close initial dialogs
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });

  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

  // 1. VERIFY MAP RAINBOW MARKET (Ảnh 5 & Ảnh 6)
  console.log('\n--- [Test 1] Kiểm tra Chợ Cầu Vồng (Xóa Biển Tím) ---');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map_rainbow_market' });
  });
  await page.waitForTimeout(1800);

  const marketCheck = await page.evaluate(() => {
    const ws = window.__worldScene;
    let hasPurpleSign = false;
    ws.children.list.forEach(c => {
      if (c.type === 'Text' && (c.text || '').includes('Phố Thời Trang ➡️')) hasPurpleSign = true;
      if (c.type === 'Container') {
        c.list?.forEach(sub => {
          if (sub.type === 'Text' && (sub.text || '').includes('Phố Thời Trang ➡️')) hasPurpleSign = true;
        });
      }
    });
    return { hasPurpleSign };
  });

  console.log('Chợ Cầu Vồng hasPurpleSign:', marketCheck.hasPurpleSign);
  assert.strictEqual(marketCheck.hasPurpleSign, false, 'Biển gỗ tím Phố Thời Trang ➡️ phải bị xóa hoàn toàn khỏi Chợ Cầu Vồng!');
  await page.screenshot({ path: path.join(artifactDir, 'verified_market_no_purple_sign.png') });
  console.log('✓ Đã lưu ảnh: verified_market_no_purple_sign.png');

  // 2. VERIFY MAP FASHION STREET (Ảnh 3)
  console.log('\n--- [Test 2] Kiểm tra Phố Thời Trang (Chỉ 2 Quầy Đối Diện) ---');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map_fashion_street' });
  });
  await page.waitForTimeout(1800);

  const fashionCheck = await page.evaluate(() => {
    const ws = window.__worldScene;
    const stations = ws.fashionStationContainers?.map(s => s.data?.name) || [];
    const hasMirror = stations.some(n => n.includes('Gương'));
    const hasPhotoBooth = stations.some(n => n.includes('Chụp Ảnh'));
    const hasPiggyBank = stations.some(n => n.includes('Dành Dụm'));
    const hasAccessories = stations.some(n => n.includes('Phụ Kiện'));
    const hasBackpack = stations.some(n => n.includes('Balo'));

    return {
      stationCount: stations.length,
      stations,
      hasMirror,
      hasPhotoBooth,
      hasPiggyBank,
      hasAccessories,
      hasBackpack
    };
  });

  console.log('Phố Thời Trang Check:', fashionCheck);
  assert.strictEqual(fashionCheck.hasMirror, false, 'Gương Thử Phụ Kiện phải bị xóa!');
  assert.strictEqual(fashionCheck.hasPhotoBooth, false, 'Góc Chụp Ảnh phải bị xóa!');
  assert.strictEqual(fashionCheck.hasPiggyBank, false, 'Bảng Dành Dụm phải bị xóa!');
  assert.strictEqual(fashionCheck.hasAccessories, true, 'Quầy Phụ Kiện phải tồn tại!');
  assert.strictEqual(fashionCheck.hasBackpack, true, 'Quầy Balo phải tồn tại đối diện quầy phụ kiện!');
  assert.strictEqual(fashionCheck.stationCount, 2, 'Chỉ được có đúng 2 trạm đối diện nhau trên Phố Thời Trang!');
  await page.screenshot({ path: path.join(artifactDir, 'verified_fashion_street_only_two_stations.png') });
  console.log('✓ Đã lưu ảnh: verified_fashion_street_only_two_stations.png');

  // 3. VERIFY BACKPACK MODAL BUY BUTTON (Ảnh 4)
  console.log('\n--- [Test 3] Kiểm tra Nút Mua Balo Gọn Gàng Không Rớt Dòng ---');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:open-market-station', {
      detail: { station: { type: 'backpack_stall' } }
    }));
  });
  await page.waitForTimeout(1000);

  const backpackModalCheck = await page.evaluate(() => {
    const buyBtns = Array.from(document.querySelectorAll('[data-buy-bp]'));
    return buyBtns.map(btn => ({
      text: btn.textContent.trim(),
      hasExtraText: btn.textContent.includes('Mua Balo') || btn.textContent.includes('➡️')
    }));
  });

  console.log('Backpack Buy Buttons:', backpackModalCheck);
  backpackModalCheck.forEach(btn => {
    assert.strictEqual(btn.hasExtraText, false, `Nút mua không được có chữ Mua Balo hoặc ➡️ thừa: ${btn.text}`);
    assert.ok(btn.text.startsWith('⭐'), `Nút mua phải bắt đầu bằng ⭐: ${btn.text}`);
  });
  await page.screenshot({ path: path.join(artifactDir, 'verified_backpack_clean_buttons.png') });
  console.log('✓ Đã lưu ảnh: verified_backpack_clean_buttons.png');

  // Đóng modal balo
  await page.evaluate(() => {
    document.querySelector('.market-btn-close')?.click();
  });
  await page.waitForTimeout(500);

  // 4. VERIFY FISHING POPUP ON MAP (Ảnh 1)
  console.log('\n--- [Test 4] Kiểm tra Popup Câu Cá Không Còn Stepper 4 Ô & Vừa Vặn Không Tràn ---');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map_fishing_pond' });
  });
  await page.waitForTimeout(1800);

  // Trigger audition popup
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.onMapFishingState = {
      phase: 'audition',
      turn: 1,
      species: { id: 'silver_bell_fish', name: 'Cá Chuông Bạc', icon: '🔔', asset: '/assets/fishing/fish_silver_bell.png', requiredHits: 4 },
      weightG: 450,
      diff: { requiredHits: 4, label: 'Khó - 4 Lần Canh' },
      targetHits: 4,
      currentHits: 0,
      zoneTop: 35,
      zoneHeight: 30,
      markerPct: 40,
      markerDir: 1,
      markerSpeed: 70
    };
    ws.mountVerticalAuditionBar();
  });
  await page.waitForTimeout(800);

  const fishingAuditionCheck = await page.evaluate(() => {
    const auditionEl = document.getElementById('onmap-fishing-audition');
    if (!auditionEl) return { exists: false };
    const rect = auditionEl.getBoundingClientRect();
    const hasStepper = Boolean(document.getElementById('fishing-8step-stepper') && document.getElementById('fishing-8step-stepper').children.length > 0);
    const stepperDisplay = document.getElementById('fishing-8step-stepper')?.style?.display;
    const isOverflowBottom = rect.bottom > window.innerHeight;
    const stars = Array.from(document.querySelectorAll('.onmap-audition-star')).length;

    return {
      exists: true,
      hasStepper,
      stepperDisplay,
      isOverflowBottom,
      top: rect.top,
      bottom: rect.bottom,
      windowHeight: window.innerHeight,
      height: rect.height,
      stars
    };
  });

  console.log('Fishing Audition Check:', fishingAuditionCheck);
  assert.strictEqual(fishingAuditionCheck.exists, true, 'Fishing audition popup must exist');
  assert.strictEqual(fishingAuditionCheck.hasStepper, false, 'fishing-8step-stepper phải bị xóa hoàn toàn!');
  assert.strictEqual(fishingAuditionCheck.isOverflowBottom, false, 'Popup câu cá không được tràn đáy màn hình!');
  assert.strictEqual(fishingAuditionCheck.stars, 4, 'Phải có 4 ngôi sao thể hiện 4 lần canh!');
  await page.screenshot({ path: path.join(artifactDir, 'verified_fishing_audition_no_stepper.png') });
  console.log('✓ Đã lưu ảnh: verified_fishing_audition_no_stepper.png');

  // 5. VERIFY MAP TRANSITION OVERLAY (Ảnh 2)
  console.log('\n--- [Test 5] Kiểm tra Hiệu Ứng Cổng Thần Cầu Vồng (Chỉ Có Banner 8 Bước Phía Trước) ---');
  await page.evaluate(() => {
    const backOverlay = document.getElementById('map-loading-overlay');
    window.dispatchEvent(new CustomEvent('game:portal-warp-start', {
      detail: {
        targetMapId: 'map_rainbow_market',
        portalData: { targetMapName: 'Chợ Cầu Vồng' }
      }
    }));
  });
  await page.waitForTimeout(3600); // Bước 8

  const transitionCheck = await page.evaluate(() => {
    const frontBanner = document.getElementById('warp-hud-banner');
    const backOverlay = document.getElementById('map-loading-overlay');
    const backDisplay = backOverlay ? window.getComputedStyle(backOverlay).display : 'none';

    return {
      frontBannerActive: frontBanner?.classList.contains('active'),
      frontStepText: document.getElementById('warp-hud-step-badge')?.textContent,
      backOverlayExists: Boolean(backOverlay),
      backDisplay
    };
  });

  console.log('Transition Check:', transitionCheck);
  assert.strictEqual(transitionCheck.frontBannerActive, true, 'Front banner phải đang active');
  assert.ok(transitionCheck.frontStepText.includes('8/8'), 'Bước 8/8 phải hiển thị');
  assert.strictEqual(transitionCheck.backDisplay, 'none', 'Loading phía sau phải hoàn toàn display: none!');
  await page.screenshot({ path: path.join(artifactDir, 'verified_clean_warp_transition.png') });
  console.log('✓ Đã lưu ảnh: verified_clean_warp_transition.png');

  await browser.close();
  console.log('\n🎉 TẤT CẢ CÁC ĐIỂM SỬA THEO HÌNH ẢNH CỦA NGƯỜI DÙNG ĐÃ VƯỢT QUA KIỂM THỬ 100%!');
}

testAllUserScreenshotsFixes().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
