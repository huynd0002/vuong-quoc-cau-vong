import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function run() {
  console.log('🚀 Bắt đầu kiểm thử Memory Match: Chỉ hiển thị Hình Ảnh không chữ, Sai 2 lần tính thua, tăng số lần sai khi nhiều ô hơn...');
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

  // TEST 1: CHỈ HIỂN THỊ HÌNH ẢNH / EMOJI, HOÀN TOÀN KHÔNG CÓ CHỮ TRONG ĐÁP ÁN
  console.log('\n--- TEST 1: KIỂM TRA CHỈ HIỂN THỊ HÌNH ẢNH, KHÔNG CÓ CHỮ ---');
  await page.evaluate(() => {
    const arenaModal = window.__battleArenaModal;
    const testQuestion = {
      type: 'memory_match',
      prompt: '🃏 Bé hãy lật tìm 2 thẻ hình con vật giống nhau nhé! ✨',
      pairs: 2,
      cards: [
        { id: 'c1', label: '🐰 Thỏ Con' },
        { id: 'c2', label: '🐶 Cún Vàng' },
        { id: 'c1_b', label: '🐰 Thỏ Con' },
        { id: 'c2_b', label: '🐶 Cún Vàng' }
      ]
    };
    if (arenaModal) {
      if (arenaModal.arenaModal) arenaModal.arenaModal.hidden = false;
      arenaModal.renderMemoryMatch(testQuestion);
    }
  });
  await page.waitForTimeout(500);

  // Lật thử 2 thẻ lên và kiểm tra text bên trong mặt thẻ
  const cardBackTexts = await page.evaluate(() => {
    const cards = document.querySelectorAll('.memory-card');
    cards.forEach(c => c.classList.add('flipped')); // Lật mở tất cả để kiểm tra
    const backs = Array.from(document.querySelectorAll('.memory-card-back'));
    return backs.map(b => b.textContent.trim());
  });

  console.log('Nội dung mặt sau các thẻ bài:', cardBackTexts);

  // Xác minh không có chữ tiếng Việt dài "Thỏ Con", "Cún Vàng", chỉ có emoji
  for (const text of cardBackTexts) {
    if (text.includes('Thỏ Con') || text.includes('Cún Vàng')) {
      throw new Error(`Thẻ vẫn còn chứa chữ: "${text}". Yêu cầu chỉ hiển thị hình ảnh!`);
    }
  }
  console.log('✓ Xác minh thành công: Mặt thẻ chỉ hiển thị Hình ảnh / Emoji to đẹp, không còn chữ rườm rà!');

  await page.screenshot({
    path: path.join(artifactDir, 'verified_memory_match_images_only_no_text.png')
  });

  // TEST 2: SAI 2 LẦN BỊ TÍNH THUA (Áp dụng cho 2 cặp / 4 ô)
  console.log('\n--- TEST 2: LẬT SAI 2 LẦN BỊ TÍNH THUA ---');
  await page.evaluate(() => {
    const arenaModal = window.__battleArenaModal;
    arenaModal.isTurnLocked = false;
    const testQuestion = {
      type: 'memory_match',
      prompt: '🃏 Bé hãy lật tìm 2 thẻ hình con vật giống nhau nhé! ✨',
      pairs: 2,
      cards: [
        { id: 'c1', label: '🐰 Thỏ Con' },
        { id: 'c2', label: '🐶 Cún Vàng' },
        { id: 'c1_b', label: '🐰 Thỏ Con' },
        { id: 'c2_b', label: '🐶 Cún Vàng' }
      ]
    };
    arenaModal.renderMemoryMatch(testQuestion);
  });
  await page.waitForTimeout(500);

  // Lấy các thẻ bài theo nhãn label
  const cardsInfo = await page.evaluate(() => {
    const cardEls = Array.from(document.querySelectorAll('.memory-card'));
    return cardEls.map((el, i) => ({ index: i, label: el.dataset.label }));
  });
  console.log('Vị trí các thẻ bài:', cardsInfo);

  // Tìm 2 thẻ khác nhau (ví dụ Thỏ và Cún)
  const thoCard = cardsInfo.find(c => c.label.includes('Thỏ'));
  const cunCard = cardsInfo.find(c => c.label.includes('Cún'));

  // Lần sai 1: Lật Thỏ và Cún
  console.log('Lật sai lần 1...');
  await page.locator(`.memory-card[data-index="${thoCard.index}"]`).click();
  await page.waitForTimeout(150);
  await page.locator(`.memory-card[data-index="${cunCard.index}"]`).click();
  await page.waitForTimeout(1400); // Chờ rung và úp lại

  const mistakesAfter1 = await page.locator('#mem-mistakes-val').textContent();
  console.log(`Số lần sai sau lượt 1: ${mistakesAfter1}/2`);
  if (mistakesAfter1 !== '1') {
    throw new Error(`Kỳ vọng sai 1 lần, thực tế: ${mistakesAfter1}`);
  }

  // Lần sai 2: Lật Thỏ và Cún một lần nữa -> Kích hoạt THUA LƯỢT!
  console.log('Lật sai lần 2 -> Kích hoạt thua lượt...');
  await page.locator(`.memory-card[data-index="${thoCard.index}"]`).click();
  await page.waitForTimeout(150);
  await page.locator(`.memory-card[data-index="${cunCard.index}"]`).click();
  await page.waitForTimeout(600);

  const bannerText = await page.locator('.interactive-instruction-banner').textContent();
  console.log(`Thông báo banner khi sai 2 lần: ${bannerText}`);

  if (!bannerText.includes('ĐÃ SAI 2/2 LẦN') || !bannerText.includes('Quái vật phản công')) {
    throw new Error(`Kỳ vọng thông báo thua lượt do sai 2 lần, thực tế: ${bannerText}`);
  }

  await page.screenshot({
    path: path.join(artifactDir, 'verified_memory_match_failed_after_2_mistakes.png')
  });
  console.log('✓ Đã chụp ảnh tính thua khi sai 2 lần!');

  // TEST 3: NHIỀU Ô LẬT HƠN THÌ SỐ LẦN SAI ĐƯỢC TĂNG LÊN
  console.log('\n--- TEST 3: NHIỀU Ô LẬT HƠN THÌ SỐ LẦN SAI TĂNG LÊN ---');
  // Trường hợp 3 cặp (6 ô): maxMistakes = 3
  await page.evaluate(() => {
    const arenaModal = window.__battleArenaModal;
    arenaModal.isTurnLocked = false;
    const testQuestion6 = {
      type: 'memory_match',
      prompt: '🃏 Bé hãy lật tìm 3 cặp báu vật pha lê lấp lánh giống nhau nhé! 💎',
      pairs: 3,
      cards: [
        { id: 'c1', label: '💎 Pha Lê' },
        { id: 'c2', label: '🔮 Ngọc Tím' },
        { id: 'c3', label: '🦇 Dơi Ngọc' },
        { id: 'c1_b', label: '💎 Pha Lê' },
        { id: 'c2_b', label: '🔮 Ngọc Tím' },
        { id: 'c3_b', label: '🦇 Dơi Ngọc' }
      ]
    };
    arenaModal.renderMemoryMatch(testQuestion6);
  });
  await page.waitForTimeout(500);

  const banner6 = await page.locator('.interactive-instruction-banner').textContent();
  console.log(`Banner 3 cặp (6 ô): ${banner6}`);
  if (!banner6.includes('Sai: 0/3')) {
    throw new Error(`Kỳ vọng 3 cặp cho phép sai 3 lần, thực tế: ${banner6}`);
  }

  // Trường hợp 4 cặp (8 ô): maxMistakes = 4
  await page.evaluate(() => {
    const arenaModal = window.__battleArenaModal;
    arenaModal.isTurnLocked = false;
    const testQuestion8 = {
      type: 'memory_match',
      prompt: '🃏 Bé hãy lật tìm 4 cặp báu vật Rồng Thần nhé! 🌈',
      pairs: 4,
      cards: [
        { id: 'c1', label: '🌈 Cầu Vồng' },
        { id: 'c2', label: '👑 Vương Miện' },
        { id: 'c3', label: '🐲 Rồng Thần' },
        { id: 'c4', label: '⭐ Ngôi Sao' },
        { id: 'c1_b', label: '🌈 Cầu Vồng' },
        { id: 'c2_b', label: '👑 Vương Miện' },
        { id: 'c3_b', label: '🐲 Rồng Thần' },
        { id: 'c4_b', label: '⭐ Ngôi Sao' }
      ]
    };
    arenaModal.renderMemoryMatch(testQuestion8);
  });
  await page.waitForTimeout(500);

  const banner8 = await page.locator('.interactive-instruction-banner').textContent();
  console.log(`Banner 4 cặp (8 ô): ${banner8}`);
  if (!banner8.includes('Sai: 0/4')) {
    throw new Error(`Kỳ vọng 4 cặp cho phép sai 4 lần, thực tế: ${banner8}`);
  }

  await page.screenshot({
    path: path.join(artifactDir, 'verified_memory_match_more_pairs_increased_mistakes.png')
  });
  console.log('✓ Đã chụp ảnh số lần sai tăng lên tương ứng với số ô lật nhiều hơn!');

  await browser.close();
  console.log('🎉 TẤT CẢ CÁC BÀI KIỂM THỬ MEMORY MATCH ĐỀU THÀNH CÔNG RỰC RỠ!');
}

run().catch(err => {
  console.error('❌ Lỗi kiểm thử:', err);
  process.exit(1);
});
