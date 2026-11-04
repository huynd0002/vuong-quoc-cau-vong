import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';

console.log('--- 1. Khởi động Vite test server ---');
const server = await createServer({
  server: { host: '127.0.0.1', port: 4210, strictPort: true }
});
await server.listen();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

try {
  console.log('--- 2. Vào game với bản đồ Nông Trại Thú Cưng (map_pet_farm) ---');
  await page.addInitScript(() => {
    localStorage.setItem('RAINBOW_KIDS_RPG_SAVE_V1', JSON.stringify({
      version: 2,
      player: { level: 2, selectedSkin: 'knight', unlockedSkins: ['default', 'knight'], stars: 20 },
      campaign: { currentMapId: 'map_pet_farm' },
      settings: { soundEnabled: false }
    }));
  });

  await page.goto('http://127.0.0.1:4210/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__worldScene?.sys?.isActive(), null, { timeout: 25000 });
  await page.waitForTimeout(1000);

  // Đóng bảng chọn nhân vật khởi đầu nếu có
  const startAdventureBtn = page.locator('#char-btn-start-adventure');
  if (await startAdventureBtn.isVisible()) {
    await startAdventureBtn.click();
    await page.waitForTimeout(500);
  }

  console.log('--- 3. Kiểm tra KHÔNG CÓ pop-up chào mừng (Story Intro Modal) ---');
  const isStoryModalHidden = await page.evaluate(() => {
    const el = document.getElementById('story-modal');
    return !el || el.hidden || el.style.display === 'none';
  });
  console.log('Pop-up chào mừng có bị ẩn/không hiển thị không:', isStoryModalHidden);
  assert.equal(isStoryModalHidden, true, 'StoryIntro modal chào mừng nông trại KHÔNG được hiển thị');

  // Kiểm tra không có toast chào mừng
  const toastText = await page.evaluate(() => {
    const t = document.querySelector('.toast-notification, .game-toast');
    return t ? t.textContent : '';
  });
  console.log('Nội dung Toast (nếu có):', toastText);
  assert.equal(toastText.includes('Chào mừng'), false, 'Không có thông báo chào mừng nông trại');

  // Kiểm tra bé có thể đi lại tự do ngay lập tức
  const isExploring = await page.evaluate(() => window.__worldScene?.isExploring);
  console.log('Trạng thái bé khám phá tự do (isExploring):', isExploring);
  assert.equal(isExploring, true, 'Bé phải tự do khám phá nông trại ngay lập tức');

  await page.screenshot({ path: 'artifacts/verify_farm_no_welcome_modal.png' });
  console.log('Đã chụp ảnh: artifacts/verify_farm_no_welcome_modal.png');

  console.log('========================================================');
  console.log(' ĐÃ BỎ PHẦN CHÀO MỪNG NÔNG TRẠI THÀNH CÔNG 100%! ');
  console.log('========================================================');

} finally {
  await browser.close();
  await server.close();
}
