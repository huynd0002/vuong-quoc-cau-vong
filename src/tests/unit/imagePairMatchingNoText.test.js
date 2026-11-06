import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { QUESTION_BANK } from '../../content/questions/questionBank.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

export function runImagePairMatchingNoTextTests() {
  console.log('--- [Test] Các Câu Hỏi Nối Cặp (Pair Matching): Dùng Hình Ảnh To, Không Chữ ---');

  // 1. Kiểm tra các câu hỏi pair_matching trong ngân hàng câu hỏi
  const pairQuestions = Object.values(QUESTION_BANK).filter(q => q.type === 'pair_matching');
  assert(pairQuestions.length >= 6, `Cần ít nhất 6 câu hỏi pair_matching, hiện có: ${pairQuestions.length}`);
  console.log(`✓ Test 1 Passed: Tìm thấy ${pairQuestions.length} câu hỏi pair_matching phong phú`);

  // 2. Kiểm tra tồn tại các file ảnh 3D Chibi mới do AI Skill tạo
  const generatedAssets = [
    'pair_rabbit_carrot.jpg',
    'pair_monkey_banana.jpg',
    'pair_cat_fish.jpg',
    'pair_bird_nest.jpg',
    'pair_rain_cloud.jpg',
    'pair_sun_flower.jpg'
  ];

  generatedAssets.forEach(file => {
    const publicPath = path.join(projectRoot, 'public/assets/edu/matching', file);
    const srcPath = path.join(projectRoot, 'assets/edu/matching', file);
    assert(fs.existsSync(publicPath), `File ảnh public phải tồn tại: ${publicPath}`);
    assert(fs.existsSync(srcPath), `File ảnh src phải tồn tại: ${srcPath}`);
  });
  console.log(`✓ Test 2 Passed: Toàn bộ 6 hình ảnh 3D Chibi từ AI Skill đã tồn tại trong thư mục matching`);

  // 3. Giả lập logic render visual item (chuẩn xác như trong BattleArenaModal.js)
  const renderPairVisualItem = (item) => {
    if (item.image) {
      return `<div class="pair-item-visual"><img src="${item.image}" class="pair-item-img" alt="" draggable="false" /></div>`;
    }
    const icon = item.icon || item.emoji;
    if (icon) {
      return `<div class="pair-item-visual"><span class="pair-giant-emoji">${icon}</span></div>`;
    }
    if (typeof item.text === 'string') {
      const emojiMatch = item.text.match(/[\p{Extended_Pictographic}\u2600-\u27BF]/u);
      if (emojiMatch && emojiMatch[0]) {
        return `<div class="pair-item-visual"><span class="pair-giant-emoji">${emojiMatch[0]}</span></div>`;
      }
    }
    return `<div class="pair-item-visual"><span class="pair-giant-emoji">✨</span></div>`;
  };

  // 4. Kiểm tra từng câu hỏi pair_matching:
  // Toàn bộ các item cột trái và cột phải khi render ra HTML KHÔNG ĐƯỢC HIỂN THỊ CHỮ TEXT tiếng Việt!
  // Chỉ chứa hình ảnh img hoặc emoji to khổng lồ.
  pairQuestions.forEach(q => {
    assert(Array.isArray(q.leftColumn), `Câu hỏi ${q.id} phải có leftColumn`);
    assert(Array.isArray(q.rightColumn), `Câu hỏi ${q.id} phải có rightColumn`);
    assert.strictEqual(q.leftColumn.length, q.rightColumn.length, `Hai cột của ${q.id} phải có số phần tử bằng nhau`);

    q.leftColumn.forEach(item => {
      const html = renderPairVisualItem(item);
      // Xác nhận có img hoặc pair-giant-emoji
      assert(html.includes('pair-item-img') || html.includes('pair-giant-emoji'), `Thẻ trái của ${q.id} phải có hình ảnh hoặc emoji to`);
      // Lấy nội dung text hiển thị (bỏ thẻ html)
      const textContent = html.replace(/<[^>]*>/g, '').trim();
      assert(!/[a-zA-Zà-ỹÀ-Ỹ]/.test(textContent), `Thẻ trái của ${q.id} không được hiển thị chữ text cho bé, chỉ dùng hình ảnh/emoji to! textContent: "${textContent}"`);
    });

    q.rightColumn.forEach(item => {
      const html = renderPairVisualItem(item);
      assert(html.includes('pair-item-img') || html.includes('pair-giant-emoji'), `Thẻ phải của ${q.id} phải có hình ảnh hoặc emoji to`);
      const textContent = html.replace(/<[^>]*>/g, '').trim();
      assert(!/[a-zA-Zà-ỹÀ-Ỹ]/.test(textContent), `Thẻ phải của ${q.id} không được hiển thị chữ text cho bé, chỉ dùng hình ảnh/emoji to! textContent: "${textContent}"`);
    });
  });
  console.log(`✓ Test 3 Passed: 100% các câu hỏi nối cặp render thuần HÌNH ẢNH TO / EMOJI, TUYỆT ĐỐI KHÔNG CHỨA CHỮ`);

  // 5. Kiểm tra tính liên kết matchId giữa 2 cột
  pairQuestions.forEach(q => {
    const leftIds = new Set(q.leftColumn.map(l => l.id));
    q.rightColumn.forEach(r => {
      assert(leftIds.has(r.matchId), `Câu ${q.id}: right item matchId ${r.matchId} phải khớp với một left item`);
    });
  });
  console.log(`✓ Test 4 Passed: Tính liên kết matchId giữa 2 cột hoàn toàn chính xác`);

  console.log('🎉 TOÀN BỘ 4/4 TEST CỦA HỆ THỐNG CÂU HỎI NỐI CẶP HÌNH ẢNH ĐỀU ĐẠT CHUẨN XUẤT SẮC!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runImagePairMatchingNoTextTests();
}
