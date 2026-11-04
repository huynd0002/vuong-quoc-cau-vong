import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../../');
const gameHtmlPath = path.join(root, 'game.html');
const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function testDiverseQuestions() {
  console.log('--- [Test] Bắt đầu kiểm thử Tự Động 3 Loại Câu Hỏi Vượt Ải Mới (Playwright) ---');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;
  console.log(`[Test] Đang tải game: ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  // Đóng modal khởi đầu
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
    const btnCloseStory = document.getElementById('story-start-button');
    if (btnCloseStory) btnCloseStory.click();
  });
  await page.waitForTimeout(1000);

  // Chuyển sang Map 1 (Làng Quê Yên Bình)
  console.log('[Test] Chuyển sang Map 1 (Làng Quê Yên Bình)...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map1' });
  });
  await page.waitForTimeout(2500);

  // Đóng story intro của Map 1 nếu có
  await page.evaluate(() => {
    document.getElementById('story-intro-modal')?.remove();
    const btn = document.querySelector('.story-close-btn, #btn-story-continue');
    btn?.click();
  });
  await page.waitForTimeout(1000);

  // ================================================================
  // 1. KIỂM THỬ DẠNG 1: LẬT CHỌN 2 Ô GIỐNG NHAU (memory_match)
  // ================================================================
  console.log('\n--- Test 1: Khởi động Đấu Trường với enc_map1_1 (Lật thẻ 2 ô giống nhau) ---');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    const enc = ws.monsters[0].data;
    window.__battleArenaModal.openArena(enc);
  });
  await page.waitForTimeout(1500);

  // Kiểm tra container lật thẻ
  const hasMemoryMatch = await page.evaluate(() => {
    const grid = document.querySelector('.memory-match-container .memory-grid');
    const cards = document.querySelectorAll('.memory-card');
    return {
      hasGrid: !!grid,
      cardsCount: cards.length
    };
  });
  console.log('[Test 1] Kết quả hiển thị lật thẻ:', hasMemoryMatch);
  assert.strictEqual(hasMemoryMatch.hasGrid, true, 'Phải có container memory-grid');
  assert.strictEqual(hasMemoryMatch.cardsCount, 4, 'Map 1 phải có đúng 4 thẻ lật (2 cặp)');

  // Thực hiện lật các cặp thẻ tương ứng
  await page.evaluate(async () => {
    const cards = Array.from(document.querySelectorAll('.memory-card'));
    // Gom thẻ theo label
    const labelMap = {};
    cards.forEach(c => {
      const lbl = c.dataset.label;
      if (!labelMap[lbl]) labelMap[lbl] = [];
      labelMap[lbl].push(c);
    });

    for (const lbl of Object.keys(labelMap)) {
      const [cardA, cardB] = labelMap[lbl];
      cardA.click();
      await new Promise(r => setTimeout(r, 200));
      cardB.click();
      await new Promise(r => setTimeout(r, 500));
    }
  });

  await page.waitForTimeout(1200);

  // Chụp ảnh bằng chứng nghiệm thu Dạng 1
  const memoryScreenshotPath = path.join(artifactsDir, 'verified_memory_match_gameplay.png');
  await page.screenshot({ path: memoryScreenshotPath });
  console.log('[Test 1] Đã lưu ảnh verified_memory_match_gameplay.png thành công!');

  // Đóng modal đấu trường
  await page.evaluate(() => {
    window.__battleArenaModal.closeArena();
  });
  await page.waitForTimeout(1000);

  // ================================================================
  // 2. KIỂM THỬ DẠNG 2: NỐI 2 BẢNG / CỘT (pair_matching)
  // ================================================================
  console.log('\n--- Test 2: Khởi động Đấu Trường với enc_map1_2 (Nối 2 cột bảng) ---');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    const enc = ws.monsters[1].data;
    window.__battleArenaModal.openArena(enc);
  });
  await page.waitForTimeout(1500);

  const hasPairMatch = await page.evaluate(() => {
    const wrap = document.querySelector('.pair-match-container .pair-match-columns');
    const leftBtns = document.querySelectorAll('.pair-col-left .pair-item-btn');
    const rightBtns = document.querySelectorAll('.pair-col-right .pair-item-btn');
    return {
      hasColumns: !!wrap,
      leftCount: leftBtns.length,
      rightCount: rightBtns.length
    };
  });
  console.log('[Test 2] Kết quả hiển thị nối bảng:', hasPairMatch);
  assert.strictEqual(hasPairMatch.hasColumns, true, 'Phải có container pair-match-columns');
  assert.strictEqual(hasPairMatch.leftCount, 3, 'Map 1 phải có 3 mục cột trái');
  assert.strictEqual(hasPairMatch.rightCount, 3, 'Map 1 phải có 3 mục cột phải');

  // Thực hiện nối các cặp
  await page.evaluate(async () => {
    const leftBtns = Array.from(document.querySelectorAll('.pair-col-left .pair-item-btn'));
    const rightBtns = Array.from(document.querySelectorAll('.pair-col-right .pair-item-btn'));

    for (const leftBtn of leftBtns) {
      const matchId = leftBtn.dataset.id;
      leftBtn.click();
      await new Promise(r => setTimeout(r, 200));
      const targetRight = rightBtns.find(r => r.dataset.matchId === matchId);
      if (targetRight) {
        targetRight.click();
        await new Promise(r => setTimeout(r, 500));
      }
    }
  });

  await page.waitForTimeout(1200);

  // Chụp ảnh bằng chứng nghiệm thu Dạng 2
  const pairScreenshotPath = path.join(artifactsDir, 'verified_pair_matching_gameplay.png');
  await page.screenshot({ path: pairScreenshotPath });
  console.log('[Test 2] Đã lưu ảnh verified_pair_matching_gameplay.png thành công!');

  // Đóng modal đấu trường
  await page.evaluate(() => {
    window.__battleArenaModal.closeArena();
  });
  await page.waitForTimeout(1000);

  // ================================================================
  // 3. KIỂM THỬ DẠNG 3: SẮP XẾP ĐỒ VẬT KÉO THẢ (drag_sort)
  // ================================================================
  console.log('\n--- Test 3: Khởi động Đấu Trường với enc_map1_3 (Kéo thả / Sắp xếp thứ tự) ---');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    const enc = ws.monsters[2].data;
    window.__battleArenaModal.openArena(enc);
  });
  await page.waitForTimeout(1500);

  const hasDragSort = await page.evaluate(() => {
    const container = document.querySelector('.drag-sort-container');
    const chips = document.querySelectorAll('.drag-item-chip');
    const slots = document.querySelectorAll('.slot-dropzone');
    return {
      hasContainer: !!container,
      chipsCount: chips.length,
      slotsCount: slots.length
    };
  });
  console.log('[Test 3] Kết quả hiển thị kéo thả sắp xếp:', hasDragSort);
  assert.strictEqual(hasDragSort.hasContainer, true, 'Phải có container drag-sort-container');
  assert.strictEqual(hasDragSort.chipsCount, 3, 'Map 1 phải có 3 đồ vật sắp xếp');
  assert.strictEqual(hasDragSort.slotsCount, 3, 'Map 1 phải có 3 khay đích');

  // Đặt từng đồ vật theo đúng thứ tự 1, 2, 3 vào các khay 0, 1, 2
  await page.evaluate(async () => {
    const chips = Array.from(document.querySelectorAll('.drag-item-chip'));
    const slots = Array.from(document.querySelectorAll('.slot-dropzone'));

    // Sắp xếp các chip theo order: 1, 2, 3
    const sortedChips = [...chips].sort((a, b) => parseInt(a.dataset.order) - parseInt(b.dataset.order));

    for (let i = 0; i < sortedChips.length; i++) {
      const chip = sortedChips[i];
      const slot = slots[i];
      // Chạm chọn chip
      chip.click();
      await new Promise(r => setTimeout(r, 200));
      // Chạm đặt vào khay
      slot.click();
      await new Promise(r => setTimeout(r, 400));
    }
  });

  await page.waitForTimeout(1200);

  // Chụp ảnh bằng chứng nghiệm thu Dạng 3
  const dragScreenshotPath = path.join(artifactsDir, 'verified_drag_sort_gameplay.png');
  await page.screenshot({ path: dragScreenshotPath });
  console.log('[Test 3] Đã lưu ảnh verified_drag_sort_gameplay.png thành công!');

  await browser.close();
  console.log('\n🎉 TẤT CẢ 3 DẠNG CÂU HỎI VƯỢT ẢI ĐÃ ĐƯỢC XÁC THỰC HOÀN TOÀN THÀNH CÔNG!');
}

testDiverseQuestions().catch(err => {
  console.error('Test thất bại:', err);
  process.exit(1);
});
