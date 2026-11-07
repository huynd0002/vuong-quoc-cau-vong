import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('[Test] Kiểm tra Khắc phục Triệt để Lỗi Câu Hỏi Kéo Thả (q_map1_drag_size) & Chống Lặp Đáp Án...');

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

  // 1. Mở câu hỏi q_map1_drag_size (Gà Con, Bé Thỏ, Bác Gấu)
  console.log('\n--- [Test 1] Hiển thị câu hỏi q_map1_drag_size: Kiểm tra ảnh SVG sắc nét & chữ tiếng Việt rõ ràng ---');
  await page.evaluate(() => {
    const arenaModal = window.__battleArenaModal;
    const q = window.__questionBank ? window.__questionBank.getQuestion('q_map1_drag_size') : null;

    if (arenaModal && q) {
      if (arenaModal.arenaModal) {
        arenaModal.arenaModal.hidden = false;
      }
      arenaModal.currentQuestion = q;
      arenaModal.renderDragSort(q);
    }
  });

  await page.waitForTimeout(800);

  const cardInfo = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.drag-item-chip'));
    return chips.map(c => {
      const img = c.querySelector('.drag-chip-img');
      const text = c.querySelector('.drag-chip-text')?.textContent?.trim();
      const rawText = c.textContent;
      const hasCorrupt = rawText.includes('\uFFFD');
      return {
        id: c.dataset.itemId,
        order: c.dataset.order,
        hasImg: Boolean(img),
        imgSrc: img?.getAttribute('src'),
        text,
        hasCorrupt
      };
    });
  });

  console.log('Thông tin các thẻ con vật:', cardInfo);
  assert.equal(cardInfo.length, 3, 'Phải có đúng 3 thẻ con vật');
  cardInfo.forEach(c => {
    assert.ok(c.hasImg, `Thẻ ${c.id} phải có ảnh SVG minh họa`);
    assert.ok(c.text, `Thẻ ${c.id} phải có nhãn text tiếng Việt`);
    assert.equal(c.hasCorrupt, false, `Thẻ ${c.id} tuyệt đối KHÔNG được chứa ký tự lỗi `);
  });
  console.log('✓ Test 1 Passed: 3 thẻ con vật hiển thị đầy đủ hình ảnh SVG và tên gọi, không bị lỗi dấu chấm hỏi đen!');

  // Chụp ảnh thẻ con vật trong pool
  await page.screenshot({ path: path.join(artifactDir, 'verified_drag_sort_animal_cards.png') });
  console.log('✓ Đã lưu ảnh chụp: verified_drag_sort_animal_cards.png');

  // 2. Kiểm tra thao tác 1 chạm đưa thẻ từ ô slot về lại pool
  console.log('\n--- [Test 2] Kiểm tra 1 chạm đưa thẻ từ ô slot về lại pool ---');
  // Chạm thẻ đầu tiên để chọn và đặt vào slot 1
  await page.evaluate(() => {
    const chip = document.querySelector('.drag-pool-items .drag-item-chip');
    const slot = document.querySelector('.slot-dropzone[data-slot-index="1"]');
    chip.click();
    slot.parentElement.click();
  });
  await page.waitForTimeout(300);

  const placedCount1 = await page.evaluate(() => {
    const placedInSlot = document.querySelector('.slot-dropzone[data-slot-index="1"] .drag-item-chip');
    return placedInSlot ? 1 : 0;
  });
  assert.equal(placedCount1, 1, 'Thẻ đã được đặt vào ô slot 1');

  // Chạm 1 lần vào thẻ trong slot -> phải tự động quay về pool
  await page.evaluate(() => {
    const placedChip = document.querySelector('.slot-dropzone[data-slot-index="1"] .drag-item-chip');
    placedChip.click();
  });
  await page.waitForTimeout(300);

  const returnedToPool = await page.evaluate(() => {
    const inSlot = document.querySelector('.slot-dropzone[data-slot-index="1"] .drag-item-chip');
    const poolChips = document.querySelectorAll('.drag-pool-items .drag-item-chip');
    return { inSlot: Boolean(inSlot), poolCount: poolChips.length };
  });
  assert.equal(returnedToPool.inSlot, false, 'Thẻ đã rời khỏi ô slot 1');
  assert.equal(returnedToPool.poolCount, 3, 'Toàn bộ 3 thẻ đã quay lại pool');
  console.log('✓ Test 2 Passed: 1 chạm vào thẻ trong slot đưa ngay về pool thành công!');

  // 3. Kiểm tra cơ chế tự động hồi thẻ về pool khi xếp sai và quái vật phản công
  console.log('\n--- [Test 3] Kiểm tra tự động hồi thẻ về pool khi xếp sai ---');
  await page.evaluate(() => {
    // Đặt sai theo đúng luồng click của bé: Bác Gấu (order 3) vào slot 1, Bé Thỏ (order 2) vào slot 2, Gà Con (order 1) vào slot 3
    const chips = Array.from(document.querySelectorAll('.drag-item-chip'));
    const bear = chips.find(c => c.dataset.order === '3');
    const rabbit = chips.find(c => c.dataset.order === '2');
    const chick = chips.find(c => c.dataset.order === '1');

    const slot1 = document.querySelector('.slot-dropzone[data-slot-index="1"]').parentElement;
    const slot2 = document.querySelector('.slot-dropzone[data-slot-index="2"]').parentElement;
    const slot3 = document.querySelector('.slot-dropzone[data-slot-index="3"]').parentElement;

    // Chọn Gấu -> đặt vào Slot 1
    bear.click();
    slot1.click();

    // Chọn Thỏ -> đặt vào Slot 2
    rabbit.click();
    slot2.click();

    // Chọn Gà -> đặt vào Slot 3
    chick.click();
    slot3.click();
  });

  // Chờ phản công và tự động hồi thẻ (750ms + 500ms)
  await page.waitForTimeout(1600);

  const resetState = await page.evaluate(() => {
    const poolChips = document.querySelectorAll('.drag-pool-items .drag-item-chip');
    const slotChips = document.querySelectorAll('.slot-dropzone .drag-item-chip');
    const bannerText = document.querySelector('.interactive-instruction-banner')?.textContent;
    return {
      poolChipsCount: poolChips.length,
      slotChipsCount: slotChips.length,
      bannerText
    };
  });

  console.log('Trạng thái sau khi quái phản công:', resetState);
  assert.equal(resetState.poolChipsCount, 3, 'Cả 3 thẻ phải được tự động chuyển về lại poolDiv');
  assert.equal(resetState.slotChipsCount, 0, 'Các ô slot dropzone phải được giải phóng hoàn toàn');
  assert.ok(resetState.bannerText.includes('Quái vật phản công') || resetState.bannerText.includes('xếp lại'), 'Banner phải thông báo quái vật phản công và xếp lại');
  console.log('✓ Test 3 Passed: Khi xếp sai quái phản công, toàn bộ thẻ tự động hồi về pool để bé xếp lại!');

  // Chụp ảnh thẻ đã hồi về pool
  await page.screenshot({ path: path.join(artifactDir, 'verified_drag_sort_reset_to_pool.png') });
  console.log('✓ Đã lưu ảnh chụp: verified_drag_sort_reset_to_pool.png');

  await browser.close();
  console.log('\n🎉 TOÀN BỘ CÁC BÀI KIỂM TRA TRÌNH DUYỆT ĐỀU ĐẠT CHUẨN XUẤT SẮC!');
}

runTest().catch(err => {
  console.error('❌ Lỗi kiểm tra:', err);
  process.exit(1);
});
