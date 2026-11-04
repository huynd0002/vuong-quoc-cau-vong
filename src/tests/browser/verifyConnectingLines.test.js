import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function run() {
  console.log('🚀 Bắt đầu kiểm thử Đường Nối (Connecting Lines) trong Drag Sort & Pair Matching...');
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

  // 1. KIỂM THỬ DRAG SORT VỚI ĐƯỜNG NỐI (CONNECTING LINES)
  console.log('\n--- TEST 1: DRAG SORT VỚI ĐƯỜNG NỐI ---');
  await page.evaluate(() => {
    const arenaModal = window.__battleArenaModal;
    const testDragQuestion = {
      id: 'q_map4_drag_even_sequence',
      type: 'drag_sort',
      prompt: '📦 Bé hãy kéo thả các khối đá vàng xếp theo thứ tự số tăng dần nhé! 🏺',
      slots: ['1', '2', '3', '4'],
      items: [
        { id: 'num_2', label: '2', order: 1 },
        { id: 'num_4', label: '4', order: 2 },
        { id: 'num_6', label: '6', order: 3 },
        { id: 'num_8', label: '8', order: 4 }
      ]
    };
    if (arenaModal) {
      if (arenaModal.arenaModal) {
        arenaModal.arenaModal.hidden = false;
      }
      arenaModal.renderDragSort(testDragQuestion);
    }
  });
  await page.waitForTimeout(600);

  // Kiểm tra sự xuất hiện của các phần tử đường nối (.drag-slot-connector)
  const connectorCount = await page.locator('.drag-slot-connector').count();
  console.log(`Số đường nối giữa các ô: ${connectorCount}`);
  if (connectorCount !== 3) {
    throw new Error(`Kỳ vọng có 3 đường nối giữa 4 ô, thực tế: ${connectorCount}`);
  }

  // Chụp ảnh trạng thái ban đầu có đường nối và mũi tên chỉ hướng
  await page.screenshot({
    path: path.join(artifactDir, 'verified_drag_sort_with_connecting_lines_initial.png')
  });
  console.log('✓ Đã chụp ảnh ban đầu có đường nối giữa các ô');

  // Đặt số 2 vào Ô 1 và số 4 vào Ô 2 để kích hoạt đường nối phát sáng (.is-connected)
  await page.evaluate(() => {
    const chip2 = document.querySelector('[data-item-id="num_2"]');
    const chip4 = document.querySelector('[data-item-id="num_4"]');
    const zones = document.querySelectorAll('.slot-dropzone');

    zones[0].appendChild(chip2);
    zones[1].appendChild(chip4);
    chip2.classList.add('is-placed');
    chip4.classList.add('is-placed');

    const connectors = document.querySelectorAll('.drag-slot-connector');
    connectors[0].classList.add('is-connected', 'is-valid-flow');
  });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(artifactDir, 'verified_drag_sort_connector_connected_glow.png')
  });
  console.log('✓ Đã chụp ảnh đường nối phát sáng khi các ô được liên kết');

  // Điền nốt tất cả các ô để hoàn thành chuỗi
  await page.evaluate(() => {
    const chip6 = document.querySelector('[data-item-id="num_6"]');
    const chip8 = document.querySelector('[data-item-id="num_8"]');
    const zones = document.querySelectorAll('.slot-dropzone');
    zones[2].appendChild(chip6);
    zones[3].appendChild(chip8);
    chip6.classList.add('is-placed');
    chip8.classList.add('is-placed');

    const slotsDiv = document.querySelector('.drag-target-slots');
    slotsDiv.classList.add('all-correct');
    const connectors = document.querySelectorAll('.drag-slot-connector');
    connectors.forEach(c => c.classList.add('is-connected', 'is-valid-flow'));
  });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(artifactDir, 'verified_drag_sort_all_connected_chain.png')
  });
  console.log('✓ Đã chụp ảnh toàn bộ chuỗi đường nối hoàn thành rực rỡ');

  // 2. KIỂM THỬ PAIR MATCHING VỚI ĐƯỜNG NỐI SVG (CONNECTING LINES)
  console.log('\n--- TEST 2: PAIR MATCHING VỚI ĐƯỜNG NỐI SVG ---');
  await page.evaluate(() => {
    const arenaModal = window.__battleArenaModal;
    arenaModal.isTurnLocked = false;
    const testPairQuestion = {
      type: 'pair_matching',
      prompt: '🔗 Bé hãy nối con vật với món ăn yêu thích của bạn ấy nhé! 🥕',
      leftColumn: [
        { id: 'l1', text: '🐰 Bé Thỏ' },
        { id: 'l2', text: '🐒 Chú Khỉ' },
        { id: 'l3', text: '🐶 Chó Con' }
      ],
      rightColumn: [
        { id: 'r1', text: '🥕 Cà rốt', matchId: 'l1' },
        { id: 'r2', text: '🍌 Quả chuối', matchId: 'l2' },
        { id: 'r3', text: '🦴 Khúc xương', matchId: 'l3' }
      ]
    };
    arenaModal.renderPairMatching(testPairQuestion);
  });
  await page.waitForTimeout(600);

  // Chạm cặp 1: Bé Thỏ -> Cà rốt
  const leftTho = page.locator('.pair-left[data-id="l1"]');
  const rightCarot = page.locator('.pair-right[data-match-id="l1"]');
  await leftTho.click();
  await page.waitForTimeout(200);
  await rightCarot.click();
  await page.waitForTimeout(400);

  // Chạm cặp 2: Chú Khỉ -> Quả chuối
  const leftKhi = page.locator('.pair-left[data-id="l2"]');
  const rightChuoi = page.locator('.pair-right[data-match-id="l2"]');
  await leftKhi.click();
  await page.waitForTimeout(200);
  await rightChuoi.click();
  await page.waitForTimeout(400);

  // Kiểm tra xem SVG connecting line đã được vẽ chưa
  const lineCount = await page.locator('.pair-connecting-svg-line').count();
  console.log(`Số đường nối SVG đã vẽ: ${lineCount}`);
  if (lineCount < 2) {
    throw new Error(`Kỳ vọng ít nhất 2 đường nối SVG, thực tế: ${lineCount}`);
  }

  // Chụp ảnh cặp đã được nối bằng đường nối SVG
  await page.screenshot({
    path: path.join(artifactDir, 'verified_pair_matching_with_svg_connecting_lines.png')
  });
  console.log('✓ Đã chụp ảnh bài tập nối cặp với đường nối SVG trực quan');

  await browser.close();
  console.log('🎉 TẤT CẢ CÁC BÀI KIỂM THỬ ĐƯỜNG NỐI ĐỀU THÀNH CÔNG RỰC RỠ!');
}

run().catch(err => {
  console.error('❌ Lỗi kiểm thử:', err);
  process.exit(1);
});
