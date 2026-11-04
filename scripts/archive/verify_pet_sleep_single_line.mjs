import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';

console.log('--- 1. Khởi động Vite test server ---');
const server = await createServer({
  server: { host: '127.0.0.1', port: 4218, strictPort: true }
});
await server.listen();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

try {
  console.log('--- 2. Vào game và mở Nông Trại ---');
  await page.addInitScript(() => {
    localStorage.setItem('RAINBOW_KIDS_RPG_SAVE_V1', JSON.stringify({
      version: 2,
      player: { level: 2, selectedSkin: 'knight', unlockedSkins: ['default', 'knight'], stars: 20 },
      campaign: { currentMapId: 'map_pet_farm' },
      pet: { isSleeping: true, energy: 20 },
      settings: { soundEnabled: false }
    }));
  });

  await page.goto('http://127.0.0.1:4218/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__worldScene?.sys?.isActive(), null, { timeout: 25000 });
  await page.waitForTimeout(600);

  // Mở PetSleepModal ở chế độ isSleeping = true thông qua openPetSleepConfirmDialog
  console.log('--- 3. Mở PetSleepModal (Cún đang ngủ) ---');
  await page.evaluate(() => {
    if (window.__worldScene?.pet) {
      window.__worldScene.pet.isSleepingOnBed = true;
    }
    window.__worldScene.openPetSleepConfirmDialog();
  });
  await page.waitForTimeout(400);

  const modal = page.locator('#pet-sleep-modal');
  await modal.waitFor({ state: 'visible' });

  // 3.1. Kiểm tra "bỏ phần khoanh tròn" (Không còn đoạn văn miêu tả)
  const descCount = await page.locator('#pet-sleep-modal .pet-sleep-desc').count();
  console.log('Số lượng phần tử pet-sleep-desc (đoạn văn khoanh tròn):', descCount);
  assert.equal(descCount, 0, 'Phần khoanh tròn (pet-sleep-desc) phải bị xoá hoàn toàn');

  // 3.2. Kiểm tra tiêu đề "chỉnh sửa chữ sao để không phải xuống dòng"
  const titleEl = page.locator('#pet-sleep-title');
  const titleBox = await titleEl.boundingBox();
  const titleText = await titleEl.textContent();
  console.log('Nội dung tiêu đề:', titleText.trim());
  console.log('Chiều cao tiêu đề (px):', titleBox.height);
  assert.ok(titleText.includes('đang ngủ say sưa'));
  // Nếu xuống dòng thì chiều cao sẽ >= 50px, trên 1 dòng chiều cao <= 36px
  assert.ok(titleBox.height <= 36, `Tiêu đề phải nằm trên 1 dòng duy nhất (height hiện tại: ${titleBox.height}px)`);

  // 3.3. Kiểm tra các nút bấm nằm trên 1 dòng
  const btnCancel = page.locator('#btn-sleep-cancel');
  const btnWake = page.locator('#btn-sleep-wakeup');
  const cancelBox = await btnCancel.boundingBox();
  const wakeBox = await btnWake.boundingBox();
  console.log('Chiều cao nút Huỷ (px):', cancelBox.height);
  console.log('Chiều cao nút Đánh thức (px):', wakeBox.height);
  assert.ok(cancelBox.height <= 50, 'Nút không bị vỡ dòng');
  assert.ok(wakeBox.height <= 50, 'Nút không bị vỡ dòng');

  await page.screenshot({ path: 'artifacts/verify_pet_sleep_single_line.png' });
  console.log('Đã chụp ảnh: artifacts/verify_pet_sleep_single_line.png');

  console.log('========================================================');
  console.log(' ĐÃ BỎ PHẦN KHOANH TRÒN & CĂN CHỈNH 1 DÒNG 100% THÀNH CÔNG! ');
  console.log('========================================================');

} finally {
  await browser.close();
  await server.close();
}
