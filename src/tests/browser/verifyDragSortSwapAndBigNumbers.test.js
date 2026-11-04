import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('[Test] Kiểm tra Kéo thả đổi chỗ, số to bự, hạn chế dùng chữ...');

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

  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

  // 1. Mở câu hỏi drag_sort của Đền Mặt Trời Sa Mạc (q_map4_drag_even_sequence: 2, 4, 6, 8)
  console.log('\n--- [Test 1] Hiển thị câu hỏi xếp thứ tự số: Kiểm tra số to bự & không còn chữ thừa ---');
  await page.evaluate(() => {
    const arenaModal = window.__battleArenaModal;
    const q = {
      id: 'q_map4_drag_even_sequence',
      skillId: 'ordering',
      type: 'drag_sort',
      prompt: '📦 Bé hãy kéo thả các khối đá vàng xếp theo thứ tự số tăng dần nhé! 🏺',
      slots: ['Bậc 1', 'Bậc 2', 'Bậc 3', 'Bậc 4'],
      items: [
        { id: 'n2', label: '2️⃣ Số Hai', order: 1 },
        { id: 'n4', label: '4️⃣ Số Bốn', order: 2 },
        { id: 'n6', label: '6️⃣ Số Sáu', order: 3 },
        { id: 'n8', label: '8️⃣ Số Tám', order: 4 }
      ]
    };

    if (arenaModal) {
      if (arenaModal.arenaModal) {
        arenaModal.arenaModal.hidden = false;
      }
      arenaModal.renderDragSort(q);
    }
  });

  await page.waitForTimeout(1000);

  const visualCheck = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.drag-item-chip'));
    const numbers = chips.map(c => c.querySelector('.drag-chip-num-hero')?.textContent?.trim());
    const hasLongWords = chips.some(c => c.textContent.includes('Số Hai') || c.textContent.includes('Số Tám'));
    const firstNumStyle = chips[0] ? getComputedStyle(chips[0].querySelector('.drag-chip-num-hero')) : null;

    return {
      chipsCount: chips.length,
      numbers,
      hasLongWords,
      fontSize: firstNumStyle?.fontSize,
      fontWeight: firstNumStyle?.fontWeight
    };
  });

  console.log('Kết quả kiểm tra giao diện thẻ số:', visualCheck);
  assert.strictEqual(visualCheck.chipsCount, 4, 'Phải có 4 thẻ số');
  assert.strictEqual(visualCheck.hasLongWords, false, 'Không được còn chữ dài Số Hai / Số Tám!');
  assert.ok(parseInt(visualCheck.fontSize, 10) >= 30, 'Cỡ chữ số phải to >= 30px');

  await page.screenshot({ path: path.join(artifactDir, 'verified_drag_sort_big_numbers_no_text_clutter.png') });
  console.log('✓ Đã lưu ảnh: verified_drag_sort_big_numbers_no_text_clutter.png');

  // 2. Kiểm tra tính năng đổi chỗ (Swap positions):
  console.log('\n--- [Test 2] Kiểm tra kéo thả và chạm đổi chỗ qua lại giữa các ô ---');
  await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.drag-item-chip'));
    const zones = Array.from(document.querySelectorAll('.slot-dropzone'));

    // Đặt chip 2 vào zone 0 (Ô 1) và chip 4 vào zone 1 (Ô 2)
    const chip2 = chips.find(c => c.dataset.itemId === 'n2');
    const chip4 = chips.find(c => c.dataset.itemId === 'n4');
    const chip6 = chips.find(c => c.dataset.itemId === 'n6');
    const chip8 = chips.find(c => c.dataset.itemId === 'n8');

    // Chạm chip 4 đặt vào Ô 1
    chip4.click();
    zones[0].parentElement.click();

    // Chạm chip 2 đặt vào Ô 2
    chip2.click();
    zones[1].parentElement.click();
  });

  await page.waitForTimeout(600);

  const beforeSwap = await page.evaluate(() => {
    const zones = Array.from(document.querySelectorAll('.slot-dropzone'));
    return zones.map(z => z.querySelector('.drag-item-chip')?.dataset.itemId);
  });
  console.log('Trước khi đổi chỗ:', beforeSwap); // ['n4', 'n2', undefined, undefined]
  assert.strictEqual(beforeSwap[0], 'n4');
  assert.strictEqual(beforeSwap[1], 'n2');

  // Bây giờ bấm chip 4 (đang ở Ô 1) rồi bấm chip 2 (đang ở Ô 2) để ĐỔI CHỖ TRỰC TIẾP!
  console.log('Thực hiện đổi chỗ trực tiếp giữa 2 ô...');
  await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.drag-item-chip'));
    const chip4 = chips.find(c => c.dataset.itemId === 'n4');
    const chip2 = chips.find(c => c.dataset.itemId === 'n2');

    // Tap chip 4 (active)
    chip4.click();
    // Tap chip 2 -> Kích hoạt Swap!
    chip2.click();
  });

  await page.waitForTimeout(600);

  const afterSwap = await page.evaluate(() => {
    const zones = Array.from(document.querySelectorAll('.slot-dropzone'));
    return zones.map(z => z.querySelector('.drag-item-chip')?.dataset.itemId);
  });
  console.log('Sau khi đổi chỗ:', afterSwap); // ['n2', 'n4', undefined, undefined]
  assert.strictEqual(afterSwap[0], 'n2', 'Chip 2 phải được đổi sang Ô 1!');
  assert.strictEqual(afterSwap[1], 'n4', 'Chip 4 phải được đổi sang Ô 2!');

  await page.screenshot({ path: path.join(artifactDir, 'verified_drag_sort_swap_positions_working.png') });
  console.log('✓ Đã lưu ảnh: verified_drag_sort_swap_positions_working.png');

  // 3. Đặt tiếp 6 và 8 để hoàn thành xuất sắc
  console.log('\n--- [Test 3] Xếp nốt các ô còn lại -> Hoàn thành chính xác ---');
  await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.drag-item-chip'));
    const zones = Array.from(document.querySelectorAll('.slot-dropzone'));
    const chip6 = chips.find(c => c.dataset.itemId === 'n6');
    const chip8 = chips.find(c => c.dataset.itemId === 'n8');

    chip6.click();
    zones[2].parentElement.click();

    chip8.click();
    zones[3].parentElement.click();
  });

  await page.waitForTimeout(800);

  const finalCheck = await page.evaluate(() => {
    const slotsDiv = document.querySelector('.drag-target-slots');
    const banner = document.querySelector('.interactive-instruction-banner');
    return {
      isAllCorrect: slotsDiv?.classList.contains('all-correct'),
      bannerText: banner?.textContent
    };
  });

  console.log('Kết quả kiểm tra hoàn thành:', finalCheck);
  assert.strictEqual(finalCheck.isAllCorrect, true, 'Tất cả các ô phải đúng và sáng màu xanh');

  await page.screenshot({ path: path.join(artifactDir, 'verified_drag_sort_all_correct_celebration.png') });
  console.log('✓ Đã lưu ảnh: verified_drag_sort_all_correct_celebration.png');

  console.log('\n🎉 TOÀN BỘ TEST ĐỔI CHỖ VÀ SỐ TO BỰ ĐÃ THÀNH CÔNG RỰC RỠ!');
  await browser.close();
}

runTest().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
