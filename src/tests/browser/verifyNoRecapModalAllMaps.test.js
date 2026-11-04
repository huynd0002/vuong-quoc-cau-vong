import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function run() {
  console.log('🚀 Bắt đầu kiểm thử: Bỏ hoàn toàn bảng Tổng kết Chiến thắng (Recap Modal) ở tất cả các maps...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Đóng dialog mở đầu
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-modal')?.remove();
  });

  // TEST 1: KIỂM THỬ TẠI MAP 4 (Đền Mặt Trời Sa Mạc như trong ảnh đính kèm của người dùng)
  console.log('\n--- TEST 1: MAP 4 (Đền Mặt Trời Sa Mạc) - KHÔNG HIỆN BẢNG CHIẾN THẮNG ---');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:show-recap', {
      detail: {
        title: 'CHIẾN THẮNG ĐỀN MẶT TRỜI SA MẠC! 🎉',
        rescuedFriends: ['Cáo Cát Ánh Dương', 'Bọ Cánh Cứng Ánh Dương', 'Chim Ưng Mặt Trời', 'Thần Nhân Sư'],
        learningSummary: 'Bé đã rất giỏi về: Phép trừ trực quan trong phạm vi 5 đến 10!',
        reward: { stars: 3, exp: 30 },
        unlockedNewMap: 'map5',
        unlockedMapName: 'Hẻm Núi Gió Hát'
      }
    }));
  });
  await page.waitForTimeout(600);

  // Kiểm tra recap-modal hoàn toàn ẩn
  const isRecapVisible = await page.locator('#recap-modal').isVisible();
  console.log(`Bảng Recap Modal hiển thị: ${isRecapVisible}`);
  if (isRecapVisible) {
    throw new Error('Lỗi: Bảng Recap Modal vẫn đang hiển thị trên màn hình!');
  }

  // Kiểm tra trạng thái HUD
  const hudStatus = await page.locator('#quest-status-text').textContent().catch(() => '');
  console.log(`Trạng thái HUD thông báo: ${hudStatus}`);

  await page.screenshot({
    path: path.join(artifactDir, 'verified_no_recap_modal_on_boss_victory_map4.png')
  });
  console.log('✓ Đã chụp ảnh Map 4 không còn bảng Chiến Thắng / Bé Sẵn Sàng làm gián đoạn');

  // TEST 2: KIỂM THỬ TẠI MAP 1 (Làng Quê Yên Bình)
  console.log('\n--- TEST 2: MAP 1 (Làng Quê Yên Bình) - KHÔNG HIỆN BẢNG CHIẾN THẮNG ---');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:show-recap', {
      detail: {
        title: 'CHIẾN THẮNG LÀNG QUÊ YÊN BÌNH! 🎉',
        rescuedFriends: ['Nấm Con Vui Vẻ', 'Ong Vàng Chăm Chỉ', 'Bọ Rùa Cánh Cam', 'Rồng Thần Cầu Vồng'],
        learningSummary: 'Bé đã rất xuất sắc nhận biết các Màu Sắc rực rỡ và Hình Khối cơ bản!',
        reward: { stars: 3, exp: 30 },
        unlockedNewMap: 'map2',
        unlockedMapName: 'Bờ Hồ Xanh'
      }
    }));
  });
  await page.waitForTimeout(600);

  const isRecapVisibleMap1 = await page.locator('#recap-modal').isVisible();
  console.log(`Bảng Recap Modal Map 1 hiển thị: ${isRecapVisibleMap1}`);
  if (isRecapVisibleMap1) {
    throw new Error('Lỗi: Bảng Recap Modal Map 1 vẫn đang hiển thị trên màn hình!');
  }

  await page.screenshot({
    path: path.join(artifactDir, 'verified_no_recap_modal_on_boss_victory_map1.png')
  });
  console.log('✓ Đã chụp ảnh Map 1 không còn bảng Chiến Thắng / Bé Sẵn Sàng');

  await browser.close();
  console.log('🎉 TẤT CẢ CÁC BÀI KIỂM THỬ BỎ BẢNG CHIẾN THẮNG ĐỀU THÀNH CÔNG RỰC RỠ!');
}

run().catch(err => {
  console.error('❌ Lỗi kiểm thử:', err);
  process.exit(1);
});
