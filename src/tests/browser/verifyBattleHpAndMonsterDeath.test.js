import { chromium } from 'playwright';
import path from 'path';
import assert from 'assert';

const root = process.cwd();
const fileUrl = 'file://' + path.resolve(root, 'game.html').replace(/\\/g, '/');

async function run() {
  console.log('🚀 Bắt đầu kiểm thử toàn diện: Mất máu khi đánh quái, Quái hết máu chết, và Lật ô nhiều cơ hội...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  page.on('console', msg => console.log('[PAGE CONSOLE]', msg.text()));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err));

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);

  // Đóng dialog mở đầu
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-modal')?.remove();
  });

  // 1. KIỂM TRA ĐÁNH QUÁI: MỖI LẦN TRẢ LỜI ĐÚNG TRỪ 1 TIM QUÁI, 0 TIM THÌ QUÁI CHẾT VÀ GIẢI CỨU THÀNH CÔNG
  console.log('\n--- 1. Kiểm tra Đánh Quái: Giảm máu quái và Quái hết máu chết (Victory & Rescue) ---');
  const monsterCombatResult = await page.evaluate(async () => {
    const arena = window.__battleArenaModal;
    if (!arena) return { error: 'No arena instance' };

    const mockEncounter = {
      id: 'enc_test_monster',
      name: 'Nấm Tinh Nghịch',
      reward: { stars: 2, exp: 20 }
    };

    arena.openArena(mockEncounter);
    const initialMonsterHearts = arena.monsterHearts;
    const initialMax = arena.monsterMaxHearts;

    // Giả lập trả lời đúng câu 1 -> executeHeroAttack()
    arena.executeHeroAttack();
    await new Promise(r => setTimeout(r, 1200));

    const heartsAfterHit1 = arena.monsterHearts;
    const emptyHeartsDom1 = arena.arenaMonsterHearts.querySelectorAll('img[alt="🤍"]').length;

    // Giả lập trả lời đúng câu 2
    arena.executeHeroAttack();
    await new Promise(r => setTimeout(r, 1200));

    const heartsAfterHit2 = arena.monsterHearts;

    // Giả lập trả lời đúng câu 3 (đòn kết liễu cuối cùng -> 0 tim)
    let victoryHandled = false;
    let encounterResolvedDispatched = false;

    window.addEventListener('game:encounter-resolved', (e) => {
      if (e.detail?.encounterId === 'enc_test_monster') {
        encounterResolvedDispatched = true;
      }
    }, { once: true });

    const origHandleVictory = arena.handleVictory.bind(arena);
    arena.handleVictory = () => {
      victoryHandled = true;
      origHandleVictory();
    };

    arena.executeHeroAttack();
    // 420ms projectile + 550ms hit pause + 600ms victory close = ~1600ms -> chờ 2200ms
    await new Promise(r => setTimeout(r, 2200));

    const finalMonsterHearts = arena.monsterHearts;

    return {
      initialMonsterHearts,
      initialMax,
      heartsAfterHit1,
      emptyHeartsDom1,
      heartsAfterHit2,
      finalMonsterHearts,
      victoryHandled,
      encounterResolvedDispatched
    };
  });

  console.log('  Kết quả kiểm tra Đánh Quái:', monsterCombatResult);
  assert.strictEqual(monsterCombatResult.initialMonsterHearts, 3, 'Quái thường phải bắt đầu với 3 tim');
  assert.strictEqual(monsterCombatResult.heartsAfterHit1, 2, 'Sau đòn 1, quái phải còn 2 tim');
  assert.strictEqual(monsterCombatResult.emptyHeartsDom1, 1, 'DOM hiển thị đúng 1 tim rỗng cho quái');
  assert.strictEqual(monsterCombatResult.heartsAfterHit2, 1, 'Sau đòn 2, quái phải còn 1 tim');
  assert.strictEqual(monsterCombatResult.finalMonsterHearts, 0, 'Sau đòn 3, quái phải hết sạch tim (0 tim)');
  assert.ok(monsterCombatResult.victoryHandled, 'Khi quái 0 tim, phải kích hoạt handleVictory');
  assert.ok(monsterCombatResult.encounterResolvedDispatched, 'Khi quái chết, sự kiện game:encounter-resolved phải được phát đi');

  // 2. KIỂM TRA BÉ BỊ MẤT MÁU KHI TRẢ LỜI SAI & HUD ĐỒNG BỘ
  console.log('\n--- 2. Kiểm tra Bé Bị Mất Máu Khi Trả Lời Sai & HUD Đồng Bộ ---');
  const heroHurtResult = await page.evaluate(async () => {
    const arena = window.__battleArenaModal;
    const cooking = window.__cookingSystem;
    if (!arena) return { error: 'No arena instance' };

    cooking.recordBattleHearts(3);
    arena.openArena({ id: 'enc_test_2', name: 'Bọ Cánh Cứng' });

    const heroHeartsBefore = arena.heroHearts;

    // Giả lập trả lời sai -> executeMonsterAttack()
    arena.executeMonsterAttack(false);
    await new Promise(r => setTimeout(r, 1500));

    const heroHeartsAfter = arena.heroHearts;
    const emptyHeroHeartsDom = arena.arenaHeroHearts.querySelectorAll('img[alt="🤍"]').length;
    const cookingHearts = cooking.getState().hearts;

    return {
      heroHeartsBefore,
      heroHeartsAfter,
      emptyHeroHeartsDom,
      cookingHearts
    };
  });

  console.log('  Kết quả kiểm tra Bé Bị Mất Máu:', heroHurtResult);
  assert.strictEqual(heroHurtResult.heroHeartsBefore, 3, 'Bé bắt đầu với 3 tim');
  assert.strictEqual(heroHurtResult.heroHeartsAfter, 2, 'Bé bị trừ 1 tim sau khi quái phản công (còn 2 tim)');
  assert.strictEqual(heroHurtResult.emptyHeroHeartsDom, 1, 'DOM hiển thị đúng 1 tim rỗng cho Bé');
  assert.strictEqual(heroHurtResult.cookingHearts, 2, 'cookingSystem đồng bộ chính xác 2 tim');

  // 3. KIỂM TRA TRÒ CHƠI LẬT Ô: NHIỀU CƠ HỘI LÀM LẠI & KHÔNG BỊ KẸT
  console.log('\n--- 3. Kiểm tra Trò Chơi Lật Ô: Cho phép nhiều lần thử & không bị kẹt ---');
  const memRetryResult = await page.evaluate(async () => {
    const arena = window.__battleArenaModal;
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

    arena.openArena({ id: 'enc_test_mem', name: 'Nấm Kỷ Niệm' });
    arena.currentQuestion = mockMemQuestion;
    arena.renderMemoryMatch(mockMemQuestion);

    const banner = arena.answersGrid.querySelector('.interactive-instruction-banner');
    const bannerInitial = banner?.textContent || '';

    const cards = arena.answersGrid.querySelectorAll('.memory-card');
    let cardRabbit1 = null, cardDog1 = null, cardRabbit2 = null;
    cards.forEach(c => {
      if (c.dataset.label.includes('Thỏ')) {
        if (!cardRabbit1) cardRabbit1 = c;
        else cardRabbit2 = c;
      } else if (c.dataset.label.includes('Chó')) {
        if (!cardDog1) cardDog1 = c;
      }
    });

    // Lần lật 1: Thỏ + Chó (Sai)
    cardRabbit1.click();
    cardDog1.click();
    await new Promise(r => setTimeout(r, 1600));

    const bannerAfterMistake1 = banner?.textContent || '';
    const cardsUnflippedAfter1 = !cardRabbit1.classList.contains('flipped') && !cardDog1.classList.contains('flipped');
    const unlockedAfter1 = !arena.isTurnLocked;

    // Lần lật 2: Thỏ + Thỏ (Đúng)
    cardRabbit1.click();
    cardRabbit2.click();
    await new Promise(r => setTimeout(r, 600));

    const matchedRabbit = cardRabbit1.classList.contains('matched') && cardRabbit2.classList.contains('matched');

    return {
      bannerInitial,
      bannerAfterMistake1,
      cardsUnflippedAfter1,
      unlockedAfter1,
      matchedRabbit
    };
  });

  console.log('  Kết quả kiểm tra Trò Chơi Lật Ô:', memRetryResult);
  assert.ok(memRetryResult.bannerInitial.includes('Thử lại: 0/5'), 'Banner khởi tạo hiển thị đúng 5 cơ hội thử lại');
  assert.ok(memRetryResult.bannerAfterMistake1.includes('Thử lại: 1/5'), 'Sau 1 lần sai, bộ đếm tăng lên 1/5 và bé không bị phạt thua');
  assert.ok(memRetryResult.cardsUnflippedAfter1, 'Thẻ tự động úp lại sau khi lật sai');
  assert.ok(memRetryResult.unlockedAfter1, 'Sàn đấu vẫn mở khóa để bé lật tiếp');
  assert.ok(memRetryResult.matchedRabbit, 'Bé có thể lật tiếp và ghép đúng cặp Thỏ thành công!');

  console.log('\n🎉 TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐÃ THÀNH CÔNG RỰC RỠ 100%!');
  await browser.close();
}

run().catch(err => {
  console.error('❌ Kiểm thử thất bại:', err);
  process.exit(1);
});
