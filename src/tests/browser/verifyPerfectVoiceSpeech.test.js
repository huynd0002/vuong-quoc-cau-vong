import { chromium } from 'playwright';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function run() {
  console.log('🚀 Bắt đầu kiểm thử E2E: Giọng đọc câu hỏi & hướng dẫn trên trình duyệt thực tế...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Cài đặt listener để bắt toàn bộ các utterance được gọi qua window.speechSynthesis.speak
  await page.evaluate(() => {
    window.__spokenUtterances = [];
    const origSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak = function(utterance) {
      window.__spokenUtterances.push({
        text: utterance.text,
        lang: utterance.lang,
        rate: utterance.rate,
        pitch: utterance.pitch
      });
      // Gọi onend ngay để giải phóng
      setTimeout(() => {
        if (typeof utterance.onend === 'function') utterance.onend();
      }, 50);
    };
  });

  // Đóng các modal mở đầu
  await page.evaluate(() => {
    document.querySelectorAll('.game-modal, .kitchen-overlay, [role="dialog"], #character-select-modal, #story-modal').forEach(m => {
      m.style.display = 'none';
      m.setAttribute('hidden', 'true');
    });
  });

  // TEST 1: Bật âm thanh và đọc câu hỏi thông thường qua audioService.speak
  console.log('\n--- TEST 1: Đọc câu hỏi thường có dấu hỏi "?" ---');
  await page.evaluate(() => {
    window.__spokenUtterances = [];
    const audio = window.__audioService;
    audio.setSoundEnabled(true);
    audio.speak('Bông hoa hướng dương có màu gì vậy bé?');
  });
  await page.waitForTimeout(300);

  const tts1 = await page.evaluate(() => window.__spokenUtterances.pop());
  console.log('Nội dung phát âm Test 1:', tts1);
  assert.strictEqual(tts1.text, 'Bông hoa hướng dương có màu gì vậy bé?');
  assert.ok(!tts1.text.includes('mấy'), 'Không được đọc thành "vậy bé mấy"');
  console.log('✓ Test 1 ĐẠT: Dấu hỏi giữ nguyên ngữ điệu tiếng Việt tự nhiên, không bị chèn "mấy"!');

  // TEST 2: Đọc phép toán số học 3 + 2 = ?
  console.log('\n--- TEST 2: Đọc câu hỏi phép tính số học "3 + 2 = ?" ---');
  await page.evaluate(() => {
    window.__spokenUtterances = [];
    window.__audioService.speak('3 + 2 = ?');
  });
  await page.waitForTimeout(400);

  const tts2 = await page.evaluate(() => {
    const list = window.__spokenUtterances.filter(u => u.text.includes('cộng') || u.text.includes('bằng'));
    return list.pop();
  });
  console.log('Nội dung phát âm Test 2:', tts2);
  assert.ok(tts2, 'Phải có utterance phép tính');
  assert.strictEqual(tts2.text, '3 cộng 2 bằng mấy?');
  console.log('✓ Test 2 ĐẠT: Phép tính được đọc chuẩn xác "3 cộng 2 bằng mấy?"');

  // TEST 3: Lọc emoji hình ảnh và HTML trong câu hỏi đấu đài BattleArenaModal
  console.log('\n--- TEST 3: Đọc câu hỏi trong Battle Arena (lọc sạch emoji rác) ---');
  await page.evaluate(() => {
    window.__spokenUtterances = [];
    const arena = window.__battleArenaModal;
    if (arena) {
      if (arena.arenaModal) arena.arenaModal.hidden = false;
      arena.currentQuestion = {
        id: 'q_test_voice',
        prompt: '🦁 Bé hãy quan sát bạn Sư Tử và chọn chiếc bóng tương ứng nhé! ✨',
        speak: 'Bé hãy quan sát bạn Sư Tử và chọn chiếc bóng tương ứng nhé!',
        hint: '💡 Bạn Sư Tử có chiếc bờm tròn xòe rất to đấy bé!',
        choices: [
          'Chiếc bóng số 1',
          'Chiếc bóng số 2'
        ],
        correctIndex: 0
      };
      arena.setupTurn();
    }
  });
  await page.waitForTimeout(500);

  const tts3 = await page.evaluate(() => window.__spokenUtterances.pop());
  console.log('Nội dung phát âm Test 3:', tts3);
  assert.strictEqual(tts3.text, 'Bé hãy quan sát bạn Sư Tử và chọn chiếc bóng tương ứng nhé!');
  assert.ok(!tts3.text.includes('🦁') && !tts3.text.includes('✨'), 'Emoji đã được loại bỏ');
  console.log('✓ Test 3 ĐẠT: Giọng đọc câu hỏi thi đấu trong đấu đài trong trẻo, không lẫn emoji!');

  // TEST 4: Bấm nút Gợi ý (Hint) và kiểm tra giọng đọc hướng dẫn
  console.log('\n--- TEST 4: Bấm nút Gợi ý (Hint) đọc hướng dẫn ---');
  await page.evaluate(() => {
    window.__spokenUtterances = [];
    const hintBtn = document.getElementById('arena-btn-hint');
    if (hintBtn) hintBtn.click();
  });
  await page.waitForTimeout(500);

  const tts4 = await page.evaluate(() => window.__spokenUtterances.pop());
  console.log('Nội dung phát âm Test 4:', tts4);
  assert.strictEqual(tts4.text, 'Bạn Sư Tử có chiếc bờm tròn xòe rất to đấy bé!');
  assert.ok(!tts4.text.includes('💡'), 'Emoji bóng đèn đã được lọc sạch');
  console.log('✓ Test 4 ĐẠT: Giọng đọc hướng dẫn ấm áp, chuẩn tiếng Việt cho bé mầm non!');

  // Chụp ảnh màn hình giao diện phát âm chuẩn
  await page.screenshot({
    path: path.join(artifactDir, 'verified_tts_perfect_speech_and_hints.png')
  });
  console.log('✓ Đã chụp ảnh giao diện câu hỏi kèm Loa đọc chuẩn xác');

  await browser.close();
  console.log('🎉 TẤT CẢ 4/4 BÀI KIỂM THỬ GIỌNG ĐỌC CÂU HỎI & HƯỚNG DẪN ĐỀU THÀNH CÔNG RỰC RỠ!');
}

run().catch(err => {
  console.error('❌ Lỗi kiểm thử E2E:', err);
  process.exit(1);
});
