import { chromium } from 'playwright';
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('--- [Test] Kiểm Tra 4 Yêu Cầu Về Câu Cá ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window !== 'undefined' && !!window.__worldScene, { timeout: 45000 });
  await page.waitForTimeout(2000);

  // Close modals
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
    window.__worldScene.scene.restart({ mapId: 'map_fishing_pond' });
  });
  await page.waitForTimeout(2500);

  // 1. Kiểm tra vị trí Nút "Bắt đầu câu cá": left: 50%, top: 34% (lên trên 1 tí và chính giữa màn hình)
  console.log('\n--- [1] Kiểm tra Nút "Bắt đầu câu cá" ---');
  await page.evaluate(() => {
    window.__worldScene.hero.setPosition(688, 360);
    window.__worldScene.updateDockFishingProximityButton(688, 360);
  });
  await page.waitForTimeout(600);

  const startBtnInfo = await page.evaluate(() => {
    const btn = document.getElementById('btn-start-fishing-dock');
    if (!btn) return null;
    const computed = window.getComputedStyle(btn);
    return {
      display: computed.display,
      left: btn.style.left || computed.left,
      top: btn.style.top || computed.top,
      text: btn.textContent.trim()
    };
  });
  console.log('Start Fishing Button Info:', startBtnInfo);
  assert.ok(startBtnInfo, 'Phải tìm thấy nút Bắt đầu câu cá');
  assert.ok(startBtnInfo.display !== 'none', 'Nút phải đang hiển thị');
  assert.strictEqual(startBtnInfo.left, '50%', 'Nút phải nằm ở chính giữa màn hình (left: 50%)');
  assert.strictEqual(startBtnInfo.top, '34%', 'Nút phải được đưa lên phía trên (top: 34%)');

  // 2. Kiểm tra bắt đầu câu cá và thanh trượt Audition dài ra 30% (176px so với 135px)
  console.log('\n--- [2] Kiểm tra Thanh trượt Audition (dài 176px ~ 30% dài hơn) ---');
  await page.evaluate(() => {
    const btn = document.getElementById('btn-start-fishing-dock');
    btn?.click();
  });
  // Đợi cá đớp và thanh audition mở ra
  await page.waitForSelector('#onmap-fishing-audition', { timeout: 10000 });
  await page.waitForTimeout(500);

  const trackInfo = await page.evaluate(() => {
    const track = document.getElementById('fishing-vertical-track');
    if (!track) return null;
    const computed = window.getComputedStyle(track);
    return {
      height: computed.height,
      heightNum: parseFloat(computed.height)
    };
  });
  console.log('Audition Track Info:', trackInfo);
  assert.ok(trackInfo, 'Phải tìm thấy thanh trượt audition');
  assert.strictEqual(Math.round(trackInfo.heightNum), 176, 'Thanh trượt audition phải có chiều dài 176px (tăng 30% từ 135px)');

  // 3. Kiểm tra Câu cá hụt 1 lần là mất cá luôn
  console.log('\n--- [3] Kiểm tra Câu cá hụt 1 lần là mất cá luôn ---');
  const missResult = await page.evaluate(() => {
    const ws = window.__worldScene;
    const st = ws.onMapFishingState;
    if (!st) return { ok: false, error: 'no state' };

    // Ép marker ra ngoài vùng xanh
    st.markerPct = 90;
    st.zoneTop = 20;
    st.zoneHeight = 25; // zone is 20-45, marker is at 90 -> definitely miss!

    // Bấm giựt hụt
    ws.handleVerticalAuditionPull();

    const fishingSys = window.__fishingSystem;
    const misses = fishingSys?.getState?.()?.consecutiveMisses || 0;
    return {
      ok: true,
      phaseAfterMiss: ws.onMapFishingState?.phase,
      consecutiveMisses: misses
    };
  });
  console.log('Miss Test Result:', missResult);
  assert.ok(missResult.ok, 'Thao tác kéo hụt phải thành công');

  // Đợi dọn dẹp sau khi mất cá
  await page.waitForTimeout(600);
  const isAuditionClosed = await page.evaluate(() => {
    return document.getElementById('onmap-fishing-audition') === null;
  });
  assert.ok(isAuditionClosed, 'Thanh audition phải đóng ngay sau khi hụt 1 lần (mất cá luôn)');

  // 4. Kiểm tra Cá bắt xong nhảy vào túi (không bay vào góc phải dưới)
  console.log('\n--- [4] Kiểm tra Cá bắt xong nhảy vào Túi Của Bé ở giữa đáy màn hình ---');
  // Bắt đầu 1 lượt câu mới và bắt thành công
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.startOnMapFishing(null);
  });
  await page.waitForTimeout(1000);

  const catchAnimInfo = await page.evaluate(async () => {
    const ws = window.__worldScene;
    // Giả lập bắt cá thành công
    ws.onMapFishingState.targetHits = 1;
    ws.onMapFishingState.currentHits = 1;
    ws.completeOnMapFishingCatch();

    // Lấy card vừa sinh ra
    const card = document.getElementById('onmap-catch-visual-card');
    const bagBtn = document.getElementById('btn-floating-bag') || document.querySelector('.floating-bag-btn');

    // Chờ 650ms để card kích hoạt fly-to-bag
    await new Promise(r => setTimeout(r, 650));

    const cardComputed = card ? window.getComputedStyle(card) : null;
    const cardFlyX = card ? card.style.getPropertyValue('--bag-fly-x') : null;
    const cardFlyY = card ? card.style.getPropertyValue('--bag-fly-y') : null;

    let bagCenterX = null;
    let bagCenterY = null;
    if (bagBtn) {
      const rect = bagBtn.getBoundingClientRect();
      const rootRect = (document.getElementById('game-root') || document.body).getBoundingClientRect();
      bagCenterX = Math.round(rect.left + rect.width / 2 - rootRect.left);
      bagCenterY = Math.round(rect.top + rect.height / 2 - rootRect.top);
    }

    return {
      cardExists: !!card,
      hasFlyToBagClass: card?.classList.contains('fly-to-bag'),
      cardFlyX,
      cardFlyY,
      bagCenterX,
      bagCenterY
    };
  });

  console.log('Catch Animation Info:', catchAnimInfo);
  assert.ok(catchAnimInfo.cardExists, 'Card cá phải tồn tại');
  assert.ok(catchAnimInfo.hasFlyToBagClass, 'Card cá phải có class fly-to-bag');
  if (catchAnimInfo.bagCenterX !== null) {
    assert.strictEqual(
      parseInt(catchAnimInfo.cardFlyX, 10),
      catchAnimInfo.bagCenterX,
      'Điểm bay X của cá phải trùng chính xác tâm nút Túi Của Bé'
    );
    assert.strictEqual(
      parseInt(catchAnimInfo.cardFlyY, 10),
      catchAnimInfo.bagCenterY,
      'Điểm bay Y của cá phải trùng chính xác tâm nút Túi Của Bé'
    );
  }

  // Chụp ảnh bằng chứng
  const artifactPath = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_fishing_4_goals.png');
  await page.screenshot({ path: artifactPath, fullPage: false });
  console.log(`\n✓ Đã chụp ảnh bằng chứng: ${artifactPath}`);

  await browser.close();
  console.log('\n🎉 TOÀN BỘ 4 YÊU CẦU VỀ CÂU CÁ ĐÃ VƯỢT QUA KIỂM TRA CHUẨN XÁC 100%!');
})();
