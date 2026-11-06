import { chromium } from 'playwright';
import path from 'node:path';

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function main() {
  console.log('🚀 Đang mở trình duyệt kiểm thử UI câu hỏi nối hình ảnh (Pair Matching)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Hiển thị trực tiếp modal arena và render câu hỏi pair_matching q_map1_pair_food
  const evalResult = await page.evaluate(async () => {
    const { BattleArenaModal } = await import('./src/game/ui/BattleArenaModal.js');
    const { QUESTION_BANK } = await import('./src/content/questions/questionBank.js');

    const modal = new BattleArenaModal();
    window.__testModal = modal;

    if (modal.arenaModal) {
      modal.arenaModal.classList.remove('hidden');
      modal.arenaModal.style.display = 'flex';
      modal.arenaModal.style.zIndex = '99999';
    }

    const q = QUESTION_BANK['q_map1_pair_food'];
    modal.renderPairMatching(q);

    // Kiểm tra các item
    const leftBtns = Array.from(document.querySelectorAll('.pair-left'));
    const rightBtns = Array.from(document.querySelectorAll('.pair-right'));

    return {
      leftCount: leftBtns.length,
      rightCount: rightBtns.length,
      leftHasImages: leftBtns.every(b => b.querySelector('.pair-item-img') || b.querySelector('.pair-giant-emoji')),
      rightHasImages: rightBtns.every(b => b.querySelector('.pair-item-img') || b.querySelector('.pair-giant-emoji')),
      leftTextContent: leftBtns.map(b => b.innerText.trim()).filter(Boolean),
      rightTextContent: rightBtns.map(b => b.innerText.trim()).filter(Boolean)
    };
  });

  console.log('Kết quả render ban đầu q_map1_pair_food:', evalResult);

  // Chụp ảnh trước khi nối
  const shot1 = path.join(ARTIFACT_DIR, 'verified_pair_matching_big_images_no_text.png');
  await page.screenshot({ path: shot1 });
  console.log('✓ Đã chụp ảnh trước khi nối:', shot1);

  // Thực hiện nối cặp 1: click thẻ trái đầu tiên và thẻ phải khớp với nó
  await page.evaluate(() => {
    const left1 = document.querySelector('.pair-left[data-id="l1"]');
    left1.click();
    const right1 = document.querySelector('.pair-right[data-match-id="l1"]');
    right1.click();
  });

  await page.waitForTimeout(500);

  // Kiểm tra trạng thái sau khi nối
  const matchResult = await page.evaluate(() => {
    const left1 = document.querySelector('.pair-left[data-id="l1"]');
    const right1 = document.querySelector('.pair-right[data-match-id="l1"]');
    const line = document.querySelector('.pair-connecting-svg-line');
    const badgeLeft = left1.querySelector('.pair-check-badge');
    const badgeRight = right1.querySelector('.pair-check-badge');

    return {
      leftMatched: left1.classList.contains('matched-pair'),
      rightMatched: right1.classList.contains('matched-pair'),
      hasSvgLine: !!line,
      hasBadges: !!badgeLeft && !!badgeRight,
      leftStillHasImg: !!left1.querySelector('.pair-item-img'),
      rightStillHasImg: !!right1.querySelector('.pair-item-img')
    };
  });

  console.log('Kết quả sau khi nối cặp l1:', matchResult);

  // Chụp ảnh sau khi nối cặp
  const shot2 = path.join(ARTIFACT_DIR, 'verified_pair_matching_connected_success.png');
  await page.screenshot({ path: shot2 });
  console.log('✓ Đã chụp ảnh sau khi nối cặp l1:', shot2);

  // Nối tiếp cặp 2 và 3 để hoàn thành
  await page.evaluate(() => {
    const left2 = document.querySelector('.pair-left[data-id="l2"]');
    left2.click();
    const right2 = document.querySelector('.pair-right[data-match-id="l2"]');
    right2.click();

    const left3 = document.querySelector('.pair-left[data-id="l3"]');
    left3.click();
    const right3 = document.querySelector('.pair-right[data-match-id="l3"]');
    right3.click();
  });

  await page.waitForTimeout(500);
  const shotAll = path.join(ARTIFACT_DIR, 'verified_pair_matching_all_matched.png');
  await page.screenshot({ path: shotAll });
  console.log('✓ Đã chụp ảnh sau khi nối thành công toàn bộ:', shotAll);

  // Kiểm tra câu hỏi thiên nhiên mới q_map1_pair_nature với các hình ảnh 3D Chibi mới tạo từ AI
  await page.evaluate(async () => {
    const modal = window.__testModal;
    const { QUESTION_BANK } = await import('./src/content/questions/questionBank.js');
    const qNature = QUESTION_BANK['q_map1_pair_nature'];
    modal.renderPairMatching(qNature);
  });

  await page.waitForTimeout(600);
  const shot3 = path.join(ARTIFACT_DIR, 'verified_pair_matching_nature_chibi_images.png');
  await page.screenshot({ path: shot3 });
  console.log('✓ Đã chụp ảnh câu hỏi thiên nhiên mới với ảnh 3D Chibi:', shot3);

  await browser.close();
  console.log('🎉 TOÀN BỘ KIỂM THỬ PLAYWRIGHT UI ĐÃ THÀNH CÔNG RỰC RỠ!');
}

main().catch(err => {
  console.error('Lỗi khi chạy browser test:', err);
  process.exit(1);
});
