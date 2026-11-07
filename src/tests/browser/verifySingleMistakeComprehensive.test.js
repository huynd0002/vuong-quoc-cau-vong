import { chromium } from 'playwright';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../../');
const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function run() {
  console.log('🚀 Bắt đầu kiểm thử toàn diện: Sai 1 lần quái vật phản công và hết tim về Nông trại nuôi thú...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  const gameHtmlPath = path.resolve(root, 'game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;
  console.log(`Đang tải: ${fileUrl}`);

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);

  // Đóng dialog mở đầu để vào game sạch sẽ
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-modal')?.remove();
  });

  // 1. KIỂM TRA NÚT TÚI CỦA BÉ CĂN GIỮA MÀN HÌNH CHÍNH
  console.log('\n--- 1. Kiểm tra Túi Của Bé căn giữa màn hình ---');
  const bagCheck = await page.evaluate(() => {
    const bag = document.getElementById('btn-floating-bag');
    if (!bag) return null;
    const rect = bag.getBoundingClientRect();
    const bagCenter = rect.left + rect.width / 2;
    const screenCenter = window.innerWidth / 2;
    const diff = Math.abs(bagCenter - screenCenter);
    const style = window.getComputedStyle(bag);
    return {
      left: rect.left,
      width: rect.width,
      diffCenter: diff,
      isCentered: diff < 15,
      bottom: style.bottom,
      zIndex: style.zIndex
    };
  });
  console.log('  Kết quả kiểm tra Túi Của Bé:', bagCheck);
  assert.ok(bagCheck?.isCentered, `Nút Túi Của Bé phải nằm chính giữa (độ lệch: ${bagCheck?.diffCenter}px)`);

  // 2. KIỂM TRA MEMORY MATCH: ĐIỀU CHỈNH RIÊNG CHO TRÒ CHƠI LẬT Ô NHIỀU CƠ HỘI LÀM LẠI (maxMistakes >= 5)
  console.log('\n--- 2. Kiểm tra Memory Match: Có nhiều cơ hội làm lại (maxMistakes >= 5), thẻ tự úp lại cho bé tiếp tục lật ---');
  const memMatchResult = await page.evaluate(async () => {
    const arena = window.__battleArenaModal;
    if (!arena) return { error: 'No arena instance' };

    const mockMemQuestion = {
      type: 'memory_match',
      prompt: '🃏 Bé hãy lật tìm 2 thẻ hình con vật giống nhau nhé!',
      pairs: 2,
      cards: [
        { id: 'c1', label: '🐰 Thỏ' },
        { id: 'c2', label: '🐶 Chó' },
        { id: 'c1_b', label: '🐰 Thỏ' },
        { id: 'c2_b', label: '🐶 Chó' }
      ]
    };

    arena.currentQuestion = mockMemQuestion;
    arena.currentEncounter = { id: 'mon_test', name: 'Sâu Bướm', hearts: 3, maxHearts: 3 };
    arena.heroHearts = 3;
    arena.heroMaxHearts = 3;
    arena.isTurnLocked = false;
    if (arena.arenaModal) arena.arenaModal.hidden = false;

    arena.renderMemoryMatch(mockMemQuestion);

    const banner = arena.answersGrid.querySelector('.interactive-instruction-banner');
    const bannerText = banner?.textContent || '';

    const cards = arena.answersGrid.querySelectorAll('.memory-card');
    let firstCard = null;
    let secondCard = null;
    cards.forEach(c => {
      if (!firstCard) firstCard = c;
      else if (!secondCard && c.dataset.label !== firstCard.dataset.label) secondCard = c;
    });

    let monsterAttacked = false;
    const originalExecuteMonsterAttack = arena.executeMonsterAttack.bind(arena);
    arena.executeMonsterAttack = () => {
      monsterAttacked = true;
      originalExecuteMonsterAttack();
    };

    firstCard.click();
    secondCard.click();

    // Chờ 1.5s để thẻ rung mismatch-shake và tự động úp lại
    await new Promise(r => setTimeout(r, 1600));

    return {
      bannerText,
      hasMultipleChances: bannerText.includes('/5') || bannerText.includes('/6') || bannerText.includes('Thử lại: 1/5') || bannerText.includes('Thử lại: 0/5'),
      monsterDidNotAttackOnFirstTry: !monsterAttacked,
      cardsUnflipped: !firstCard.classList.contains('flipped') && !secondCard.classList.contains('flipped'),
      isUnlockedForNextTry: !arena.isTurnLocked
    };
  });

  console.log('  Kết quả Memory Match:', memMatchResult);
  assert.ok(memMatchResult.hasMultipleChances, 'Banner Memory Match phải có nhiều cơ hội làm lại (tối thiểu 5 lần)');
  assert.ok(memMatchResult.monsterDidNotAttackOnFirstTry, 'Lần sai đầu tiên trong trò chơi lật ô KHÔNG kích hoạt quái vật phản công ngay');
  assert.ok(memMatchResult.cardsUnflipped, 'Hai thẻ lật sai phải tự động úp lại để bé ghi nhớ vị trí');
  assert.ok(memMatchResult.isUnlockedForNextTry, 'Sàn đấu phải mở khóa để bé có thể lật tiếp các thẻ khác');

  // 3. KIỂM TRA PAIR MATCHING: maxMistakes = 1
  console.log('\n--- 3. Kiểm tra Pair Matching: maxMistakes = 1 và sai 1 lần quái vật phản công ---');
  const pairMatchResult = await page.evaluate(async () => {
    const arena = window.__battleArenaModal;
    if (!arena) return { error: 'No arena instance' };

    const mockPairQuestion = {
      type: 'pair_matching',
      prompt: 'Bé hãy nối các cặp tương ứng nhé!',
      leftColumn: [
        { id: 'l1', text: '🐰 Bé Thỏ' },
        { id: 'l2', text: '🐶 Chó Con' }
      ],
      rightColumn: [
        { id: 'r1', text: '🥕 Cà rốt', matchId: 'l1' },
        { id: 'r2', text: '🦴 Khúc xương', matchId: 'l2' }
      ]
    };

    arena.currentQuestion = mockPairQuestion;
    arena.isTurnLocked = false;
    arena.renderPairMatching(mockPairQuestion);

    const banner = arena.answersGrid.querySelector('.interactive-instruction-banner');
    const bannerText = banner?.textContent || '';

    let monsterAttacked = false;
    arena.executeMonsterAttack = () => {
      monsterAttacked = true;
    };

    const leftBtn = arena.answersGrid.querySelector('.pair-item-btn[data-id="l1"]');
    const wrongRightBtn = arena.answersGrid.querySelector('.pair-item-btn[data-id="r2"]');

    leftBtn.click();
    wrongRightBtn.click();

    await new Promise(r => setTimeout(r, 1200));

    return {
      bannerText,
      hasMaxMistake1: bannerText.includes('Sai: 0/1') || bannerText.includes('/1') || bannerText.includes('1 LẦN'),
      monsterAttacked
    };
  });

  console.log('  Kết quả Pair Match:', pairMatchResult);
  assert.ok(pairMatchResult.hasMaxMistake1, 'Banner Pair Match phải có giới hạn 1 lần sai');
  assert.ok(pairMatchResult.monsterAttacked, 'Quái vật phản công ngay khi nối sai 1 lần trong Pair Match');

  // 4. KIỂM TRA DRAG SORT: maxMistakes = 1
  console.log('\n--- 4. Kiểm tra Drag Sort: maxMistakes = 1 và xếp sai 1 lần quái vật phản công ---');
  const dragSortResult = await page.evaluate(async () => {
    const arena = window.__battleArenaModal;
    if (!arena) return { error: 'No arena instance' };

    const mockSortQuestion = {
      type: 'drag_sort',
      prompt: 'Bé hãy sắp xếp theo thứ tự nhé!',
      slots: ['1. Nhỏ nhất', '2. Lớn nhất'],
      items: [
        { id: 'it1', label: '1️⃣ Số Một', order: 1 },
        { id: 'it2', label: '2️⃣ Số Hai', order: 2 }
      ]
    };

    arena.currentQuestion = mockSortQuestion;
    arena.isTurnLocked = false;
    arena.renderDragSort(mockSortQuestion);

    const banner = arena.answersGrid.querySelector('.interactive-instruction-banner');
    const bannerText = banner?.textContent || '';

    let monsterAttacked = false;
    arena.executeMonsterAttack = () => {
      monsterAttacked = true;
    };

    const chip1 = arena.answersGrid.querySelector('[data-item-id="it1"]');
    const chip2 = arena.answersGrid.querySelector('[data-item-id="it2"]');
    const zone1 = arena.answersGrid.querySelector('.slot-dropzone[data-slot-index="1"]');
    const zone2 = arena.answersGrid.querySelector('.slot-dropzone[data-slot-index="2"]');

    // Cố tình đặt ngược thứ tự
    chip2.click();
    zone1.click();
    chip1.click();
    zone2.click();

    await new Promise(r => setTimeout(r, 1200));

    return {
      bannerText,
      hasMaxMistake1: bannerText.includes('Sai: 0/1') || bannerText.includes('/1') || bannerText.includes('1 LẦN'),
      monsterAttacked
    };
  });

  console.log('  Kết quả Drag Sort:', dragSortResult);
  assert.ok(dragSortResult.hasMaxMistake1, 'Banner Drag Sort phải có giới hạn 1 lần sai');
  assert.ok(dragSortResult.monsterAttacked, 'Quái vật phản công ngay khi xếp sai thứ tự');

  // 5. KIỂM TRA HẾT TIM THUA VỀ FARM 1 TIM & PHỤC HỒI QUA BỮA ĂN
  console.log('\n--- 5. Kiểm tra Thua khi hết Tim -> Về Farm 1 Tim -> Ăn để hồi Tim ---');
  const defeatResult = await page.evaluate(async () => {
    const arena = window.__battleArenaModal;
    arena.heroHearts = 1;
    arena.bonusHeartsRemaining = 0;
    arena.executeMonsterImpact(
      { name: 'Kỹ năng thử nghiệm', badge: '⚡', soundType: 'sine', baseFreq: 300 },
      { idle: '', hit: '' },
      100, 100, false
    );

    await new Promise(r => setTimeout(r, 800));

    const defeatModal = document.getElementById('arena-defeat-overlay');
    const defeatTitle = defeatModal?.querySelector('.defeat-title')?.textContent || '';
    const hasDefeatModal = !!defeatModal && defeatModal.style.display !== 'none';
    const returnBtn = defeatModal?.querySelector('#btn-defeat-return-farm');

    if (returnBtn) returnBtn.click();
    await new Promise(r => setTimeout(r, 500));

    const currentHearts = arena.cookingSystem?.getState?.()?.hearts ?? arena.heroHearts;
    const currentMap = window.__currentMapId;

    return {
      hasDefeatModal,
      defeatTitle,
      returnedMap: currentMap,
      currentHearts
    };
  });

  console.log('  Kết quả Xử lý Thua:', defeatResult);
  assert.ok(defeatResult.defeatTitle.includes('THUA'), 'Modal thua phải hiển thị thông báo Bạn đã bị thua');
  assert.equal(defeatResult.returnedMap, 'map_pet_farm', 'Phải chuyển về Map Nuôi thú (map_pet_farm)');
  assert.equal(defeatResult.currentHearts, 1, 'Hồi đúng 1 Tim duy nhất khi thua về Nông trại');

  // Chụp ảnh minh chứng
  const farmScreenshotPath = path.join(artifactDir, 'verified_single_mistake_pet_farm_1_heart.png');
  await page.screenshot({ path: farmScreenshotPath });
  console.log('  ✓ Đã chụp ảnh minh chứng tại Nông trại:', farmScreenshotPath);

  // Test hồi máu bằng ăn món ăn
  const healResult = await page.evaluate(() => {
    const cooking = window.__battleArenaModal?.cookingSystem;
    if (!cooking) return { error: 'No cooking system' };

    cooking.mutate(state => {
      state.dishes.push({ id: 'cook-999', recipeId: 'fruit_yogurt', quality: 3 });
      return { ok: true };
    });

    const before = cooking.getState().hearts;
    const eatRes = cooking.eat('cook-999');
    const after = cooking.getState().hearts;

    return {
      before,
      eatSuccess: eatRes?.ok,
      after
    };
  });

  console.log('  Kết quả Ăn thức ăn để hồi phục tim:', healResult);
  assert.equal(healResult.before, 1, 'Trước khi ăn có 1 tim');
  assert.ok(healResult.eatSuccess, 'Ăn món ăn thành công');
  assert.ok(healResult.after >= 2, 'Sau khi ăn món ăn, tim được hồi phục');

  console.log('\n🎉 TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐỀU ĐẠT CHUẨN XUẤT SẮC 100%!');
  await browser.close();
}

run().catch(err => {
  console.error('❌ LỖI KIỂM THỬ:', err);
  process.exit(1);
});
