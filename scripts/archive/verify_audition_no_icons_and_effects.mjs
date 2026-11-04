import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';

console.log('--- 1. Khởi động Vite test server ---');
const server = await createServer({
  server: { host: '127.0.0.1', port: 4205, strictPort: true }
});
await server.listen();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

try {
  console.log('--- 2. Khởi tạo save game có sẵn nguyên liệu và tay đã rửa ---');
  await page.addInitScript(() => {
    localStorage.setItem('RAINBOW_KIDS_RPG_SAVE_V1', JSON.stringify({
      version: 2,
      player: { level: 2, selectedSkin: 'knight', unlockedSkins: ['default', 'knight'], stars: 25 },
      campaign: { currentMapId: 'map_kitchen' },
      cooking: {
        handsWashed: true,
        ingredients: { banana: 10, yogurt: 10 },
        dishes: []
      },
      settings: { soundEnabled: false }
    }));
  });

  await page.goto('http://127.0.0.1:4205/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__kitchenModal && window.__worldScene?.sys?.isActive(), null, { timeout: 25000 });
  await page.waitForTimeout(600);

  console.log('--- 3. Mở Bếp Nấu Thần Kỳ và Thả đủ nguyên liệu ---');
  await page.evaluate(() => {
    window.__cookingSystem.start('fruit_yogurt');
    const s = window.__cookingSystem.getState().session;
    window.__cookingSystem.stage(s.id, 'banana');
    window.__cookingSystem.stage(s.id, 'banana');
    window.__cookingSystem.stage(s.id, 'yogurt');
    window.__kitchenModal.show('cook');
  });
  await page.waitForTimeout(600);

  const isModalOpen = await page.evaluate(() => !document.getElementById('kitchen-modal').hidden);
  assert.equal(isModalOpen, true, 'Modal bếp phải mở');

  // Bấm bắt đầu canh nhịp Audition
  console.log('--- 4. Bắt đầu Canh Nhịp Audition ---');
  const startBtn = page.locator('.btn-start-cook-audition');
  await startBtn.waitFor({ state: 'visible', timeout: 5000 });
  await startBtn.click();
  await page.waitForTimeout(400);

  // 4.1. Kiểm tra "xoá các icon" (Không còn raw emoji)
  const auditionConsole = page.locator('.audition-console');
  await auditionConsole.waitFor({ state: 'visible' });

  const titleText = await page.locator('.audition-title').textContent();
  console.log('Tiêu đề audition:', titleText);
  assert.equal(titleText.includes('🎵'), false, 'Không còn icon nốt nhạc 🎵 trong tiêu đề');

  const zoneLabel = await page.locator('.target-zone-label').textContent();
  console.log('Nhãn vùng đỏ:', zoneLabel);
  assert.equal(zoneLabel.includes('🎯'), false, 'Không còn icon 🎯 trong nhãn vùng đỏ');
  assert.equal(zoneLabel.trim(), 'VÙNG ĐỎ');

  const triggerBtnText = await page.locator('.btn-audition-trigger').textContent();
  console.log('Nút trigger:', triggerBtnText);
  assert.equal(triggerBtnText.includes('⌨️'), false, 'Không còn icon bàn phím ⌨️ trong nút bấm');

  const starBeadsCount = await page.locator('.audition-stars-meter .star-bead').count();
  console.log('Số hạt ngọc CSS nhịp:', starBeadsCount);
  assert.ok(starBeadsCount > 0, 'Hiển thị hạt ngọc CSS thay cho emoji sao');

  await page.screenshot({ path: 'artifacts/verify_audition_no_icons.png' });
  console.log('Đã chụp ảnh: artifacts/verify_audition_no_icons.png');

  // 4.2. Kích hoạt hiệu ứng khi bấm Audition (Bấm Trúng / HIT)
  console.log('--- 5. Bấm Audition và kiểm tra hiệu ứng HIT ---');
  await page.evaluate(() => {
    // Đặt bóng vào vùng đỏ và kích hoạt hit
    window.__kitchenModal.ballPos = 75;
    window.__kitchenModal.evaluateAuditionHit();
  });

  const hasFlyout = await page.locator('.audition-hit-flyout.hit').count();
  console.log('Có chữ bay hiệu ứng HIT:', hasFlyout > 0);
  assert.equal(hasFlyout > 0, true, 'Phải xuất hiện chữ bay hiệu ứng HIT');

  await page.screenshot({ path: 'artifacts/verify_audition_hit_effect.png' });
  console.log('Đã chụp ảnh: artifacts/verify_audition_hit_effect.png');

  // 4.3. Đạt điểm tối đa và hoàn thành thành công
  console.log('--- 6. Hoàn thành toàn bộ nhịp -> Kiểm tra hiệu ứng THÀNH CÔNG ---');
  await page.evaluate(() => {
    // Đặt điểm sắp hoàn thành và hit nốt cuối
    window.__kitchenModal.rhythmScore = window.__kitchenModal.rhythmTarget - 1;
    window.__kitchenModal.ballPos = 78;
    window.__kitchenModal.evaluateAuditionHit();
  });
  await page.waitForTimeout(600);

  // Kiểm tra giao diện Thành Công
  const successContainer = page.locator('.cook-success-container');
  await successContainer.waitFor({ state: 'visible', timeout: 5000 });

  const hasConfetti = await page.locator('.success-confetti-layer .confetti-piece').count();
  console.log('Số pháo hoa giấy Confetti chúc mừng:', hasConfetti);
  assert.ok(hasConfetti >= 20, 'Phải có hiệu ứng pháo hoa giấy rơi mừng chiến thắng');

  const hasHaloRays = await page.locator('.success-dish-halo-rays').count();
  console.log('Có vòng hào quang tia sáng quay quanh món ăn:', hasHaloRays > 0);
  assert.equal(hasHaloRays > 0, true, 'Phải có vòng hào quang quay quanh món ăn');

  const hasDishBounce = await page.locator('.animate-dish-bounce').count();
  console.log('Có hiệu ứng nhún nhảy món ăn:', hasDishBounce > 0);
  assert.equal(hasDishBounce > 0, true, 'Món ăn phải có hiệu ứng nhún nhảy');

  await page.screenshot({ path: 'artifacts/verify_audition_success_celebration.png' });
  console.log('Đã chụp ảnh: artifacts/verify_audition_success_celebration.png');

  console.log('========================================================');
  console.log(' TẤT CẢ KIỂM THỬ AUDITION & HIỆU ỨNG ĐÃ ĐẠT 100%! ');
  console.log('========================================================');

} finally {
  await browser.close();
  await server.close();
}
