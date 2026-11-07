import { chromium } from 'playwright';
import path from 'path';

const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function verifyFishing() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  console.log('--- 1. Tải game tại localhost:5173 ---');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#stage-version-watermark', { timeout: 15000 });

  // Chuyển sang map_fishing_pond và đứng cạnh Bến Câu Sen
  console.log('--- 2. Chuyển sang Hồ Câu Lá Sen (map_fishing_pond) ---');
  await page.evaluate(() => {
    window.__travelToZone('map_fishing_pond');
  });
  await page.waitForTimeout(2500);

  // Đặt nhân vật đứng sát bến câu Lotus Dock (X: 688, Y: 360)
  await page.evaluate(() => {
    const ws = window.__worldScene;
    if (ws && ws.hero) {
      ws.hero.sprite.setPosition(688, 360);
      ws.updateDockFishingProximityButton(688, 360);
    }
  });
  await page.waitForTimeout(500);

  // Kiểm tra nút bến câu xuất hiện
  const dockBtnVisible = await page.evaluate(() => {
    const btn = document.getElementById('btn-start-fishing-dock');
    return btn && btn.style.display !== 'none';
  });
  console.log('Nút Bến câu hiển thị:', dockBtnVisible);

  // --- TEST 1: Thả cần & Đo thời gian random cá cắn câu ---
  console.log('\n--- TEST 1: Thả cần và kiểm tra thời gian chờ ngẫu nhiên từ từ cá mới cắn ---');
  const castStartTime = Date.now();
  await page.evaluate(() => {
    document.getElementById('btn-start-fishing-dock')?.click();
  });

  // Chờ nút BẮT xuất hiện và tính thời gian
  await page.waitForSelector('#btn-onmap-fishing-catch', { timeout: 10000 });
  const biteElapsedMs = Date.now() - castStartTime;
  console.log(`Thời gian từ lúc thả cần đến khi cá cắn câu: ${biteElapsedMs}ms`);
  if (biteElapsedMs < 1600) {
    throw new Error(`Cá cắn câu quá nhanh (${biteElapsedMs}ms), chưa đạt yêu cầu từ từ random!`);
  }

  // --- TEST 2: Chữ BẮT rung nhẹ & Đếm ngược 10s ---
  console.log('\n--- TEST 2: Kiểm tra Chữ BẮT rung nhẹ và thời gian 10s ---');
  const catchBtnInfo = await page.evaluate(() => {
    const btn = document.getElementById('btn-onmap-fishing-catch');
    const wordEl = btn.querySelector('.bite-catch-word-shake');
    const timerVal = document.getElementById('bite-timer-val');
    const btnStyle = window.getComputedStyle(btn);
    const wordStyle = wordEl ? window.getComputedStyle(wordEl) : null;
    return {
      text: btn.innerText.trim(),
      hasBtnAnim: btnStyle.animation.includes('biteRumbleShake'),
      hasWordShake: wordStyle ? wordStyle.animation.includes('wordGentleShake') : false,
      timerText: timerVal ? timerVal.textContent : ''
    };
  });
  console.log('Thông tin Nút BẮT & Chữ Bắt:', catchBtnInfo);
  if (!catchBtnInfo.hasBtnAnim || !catchBtnInfo.hasWordShake) {
    throw new Error('Chữ Bắt chưa được gắn animation rung nhẹ!');
  }
  const initialTimerSec = parseFloat(catchBtnInfo.timerText);
  console.log(`Thời gian ban đầu của Nút BẮT: ${initialTimerSec}s`);
  if (initialTimerSec < 8.0) {
    throw new Error(`Thời gian đếm ngược Nút BẮT phải là 10s, thực tế: ${initialTimerSec}s`);
  }

  // Chụp ảnh Nút BẮT rung nhẹ
  const shot1 = path.join(artifactDir, 'verified_fishing_gentle_bite_catch.png');
  await page.screenshot({ path: shot1 });
  console.log('✓ Đã lưu ảnh Nút BẮT rung nhẹ:', shot1);

  // --- TEST 3: Bấm BẮT -> Mở Audition popup kéo dài ra và thu nhỏ sao ---
  console.log('\n--- TEST 3: Bấm BẮT để mở popup Audition và kiểm tra kích thước ---');
  await page.evaluate(() => {
    document.getElementById('btn-onmap-fishing-catch')?.click();
  });
  await page.waitForSelector('#onmap-fishing-audition', { timeout: 3000 });

  const auditionCheck = await page.evaluate(() => {
    const auditionEl = document.getElementById('onmap-fishing-audition');
    const trackEl = document.getElementById('fishing-vertical-track');
    const starsContainer = document.getElementById('onmap-audition-stars');
    const starEls = document.querySelectorAll('.onmap-audition-star');
    const timerValEl = document.getElementById('onmap-audition-timer-val');

    const auditionRect = auditionEl.getBoundingClientRect();
    const trackRect = trackEl.getBoundingClientRect();
    const trackComputedHeight = parseFloat(window.getComputedStyle(trackEl).height);
    const starsStyle = window.getComputedStyle(starsContainer);
    const firstStarStyle = starEls[0] ? window.getComputedStyle(starEls[0]) : null;

    return {
      auditionHeight: auditionRect.height,
      trackHeight: trackRect.height,
      trackComputedHeight,
      starCount: starEls.length,
      starFontSize: firstStarStyle ? firstStarStyle.fontSize : '',
      starFlexWrap: starsStyle.flexWrap,
      timerVal: timerValEl ? timerValEl.textContent : null
    };
  });

  console.log('Thông số Popup Audition:', auditionCheck);
  if (auditionCheck.trackComputedHeight < 235) {
    throw new Error(`Thanh audition chưa đủ dài ra! Thực tế: ${auditionCheck.trackComputedHeight}px`);
  }
  if (auditionCheck.starFlexWrap !== 'nowrap') {
    throw new Error(`Sao chưa được giữ 1 hàng (nowrap)! Thực tế: ${auditionCheck.starFlexWrap}`);
  }
  if (!auditionCheck.timerVal) {
    throw new Error('Chưa có bộ đếm 10s trong popup Audition!');
  }

  // Chụp ảnh Audition popup dài ra và sao nhỏ gọn
  const shot2 = path.join(artifactDir, 'verified_fishing_audition_elongated_and_small_stars.png');
  await page.screenshot({ path: shot2 });
  console.log('✓ Đã lưu ảnh Audition popup dài ra, sao nhỏ 1 hàng:', shot2);

  // --- TEST 4: Đợi 10s không bấm gì -> Tự động hủy minigame ---
  console.log('\n--- TEST 4: Chờ 10.5 giây không thao tác để kiểm tra Tự Động Hủy ---');
  await page.waitForTimeout(10500);

  const isCancelled = await page.evaluate(() => {
    const ws = window.__worldScene;
    const auditionEl = document.getElementById('onmap-fishing-audition');
    const bitePrompt = document.getElementById('onmap-bite-catch-container');
    return {
      auditionClosed: auditionEl === null,
      bitePromptClosed: bitePrompt === null,
      fishingStateCleared: ws?.onMapFishingState === null
    };
  });

  console.log('Kết quả tự động hủy sau 10s:', isCancelled);
  if (!isCancelled.auditionClosed || !isCancelled.fishingStateCleared) {
    throw new Error('Popup Audition không tự động hủy sau 10 giây không bấm!');
  }

  const shot3 = path.join(artifactDir, 'verified_fishing_audition_auto_cancel_10s.png');
  await page.screenshot({ path: shot3 });
  console.log('✓ Đã lưu ảnh trạng thái đã tự động hủy sau 10s:', shot3);

  console.log('\n🎉 TẤT CẢ 4/4 TIÊU CHÍ YÊU CẦU CÂU CÁ ĐÃ ĐƯỢC XÁC MINH HOÀN TOÀN THÀNH CÔNG!');
  await browser.close();
}

verifyFishing().catch(err => {
  console.error('❌ Thất bại:', err);
  process.exit(1);
});
