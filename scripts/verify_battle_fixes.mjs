import { chromium } from 'playwright';
import assert from 'assert';

async function main() {
  console.log('🚀 Bắt đầu kiểm thử toàn diện cơ chế trừ tim khi bị tấn công & đánh Boss mất tim...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

  page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.text()));
  page.on('pageerror', err => console.error('[BROWSER ERROR]', err));

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Close intro modals
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-modal')?.remove();
    document.getElementById('game-loading-screen')?.remove();
  });

  // 1. Kiểm tra mở Boss Battle Map 1
  console.log('\n--- 1. Kiểm tra mở Sàn Đấu Boss và Hiển thị Tim/Chỉ số Máu rõ ràng ---');
  const initResult = await page.evaluate(async () => {
    const arena = window.__battleArenaModal;
    const mapConfig = window.__getMapConfig?.('map1');
    const boss = mapConfig.boss;

    arena.openArena(boss);

    const monsterHearts = arena.monsterHearts;
    const monsterMaxHearts = arena.monsterMaxHearts;
    const heroHearts = arena.heroHearts;
    const heroMaxHearts = arena.heroMaxHearts;

    const monsterHpText = document.getElementById('arena-monster-hp-text')?.textContent || '';
    const heroHpText = document.getElementById('arena-hero-hp-text')?.textContent || '';

    // Kiểm tra vị trí overhead HP xem có bị âm hoặc đè vào top banner không
    const monsterBox = document.getElementById('arena-monster-box');
    const monsterHpEl = monsterBox?.querySelector('.arena-overhead-hp');
    const monsterHpRect = monsterHpEl?.getBoundingClientRect();
    const topBar = document.querySelector('.arena-top-bar');
    const topBarRect = topBar?.getBoundingClientRect();

    const isHpBelowTopBar = monsterHpRect && topBarRect && monsterHpRect.top >= (topBarRect.bottom - 10);

    return {
      monsterHearts,
      monsterMaxHearts,
      heroHearts,
      heroMaxHearts,
      monsterHpText,
      heroHpText,
      isHpBelowTopBar,
      monsterHpTop: monsterHpRect?.top,
      topBarBottom: topBarRect?.bottom
    };
  });

  console.log('  Kết quả khởi tạo Boss:', initResult);
  assert.strictEqual(initResult.monsterHearts, 5, 'Boss Map 1 phải có đúng 5 tim');
  assert.strictEqual(initResult.monsterMaxHearts, 5, 'Boss Map 1 MaxHearts = 5');
  assert.strictEqual(initResult.heroHearts, 3, 'Bé bắt đầu với 3 tim');
  assert.ok(initResult.monsterHpText.includes('5/5'), 'Text chỉ số máu Boss hiển thị đúng 5/5 ❤️');
  assert.ok(initResult.heroHpText.includes('3/3'), 'Text chỉ số máu Bé hiển thị đúng 3/3 ❤️');
  assert.ok(initResult.isHpBelowTopBar, `Thanh máu Boss phải nằm hoàn toàn bên dưới thanh banner trên (HpTop: ${initResult.monsterHpTop}, BarBottom: ${initResult.topBarBottom})`);

  await page.screenshot({ path: 'scripts/verified_boss_battle_init.png' });

  // 2. Kiểm tra Bé Đánh Boss: Trả lời đúng câu 1 -> Boss mất đúng 1 tim
  console.log('\n--- 2. Kiểm tra Bé Đánh Boss câu 1: Boss mất đúng 1 tim và hiển thị -1 ❤️ ---');
  const hit1Result = await page.evaluate(async () => {
    const arena = window.__battleArenaModal;
    const q1 = arena.currentQuestion;

    // Click đáp án đúng
    const correctIdx = q1.correct ?? 0;
    const buttons = arena.answersGrid.querySelectorAll('.ans-btn');
    buttons[correctIdx]?.click();

    // Chờ đạn bay và hiệu ứng nổ
    await new Promise(r => setTimeout(r, 1200));

    const heartsAfterHit1 = arena.monsterHearts;
    const monsterHpTextAfter1 = document.getElementById('arena-monster-hp-text')?.textContent || '';
    const emptyHeartsCount = arena.arenaMonsterHearts.querySelectorAll('img[alt="🤍"]').length;

    return {
      heartsAfterHit1,
      monsterHpTextAfter1,
      emptyHeartsCount
    };
  });

  console.log('  Kết quả sau khi đánh Boss đòn 1:', hit1Result);
  assert.strictEqual(hit1Result.heartsAfterHit1, 4, 'Sau đòn 1, Boss phải giảm từ 5 xuống 4 tim');
  assert.ok(hit1Result.monsterHpTextAfter1.includes('4/5'), 'Text máu Boss phải cập nhật đúng 4/5 ❤️');
  assert.strictEqual(hit1Result.emptyHeartsCount, 1, 'DOM tim Boss phải có đúng 1 tim rỗng (🤍)');

  await page.screenshot({ path: 'scripts/verified_boss_after_hit1.png' });

  // 3. Kiểm tra Mini Game Audition: Bắt nhịp đúng -> Bé Sâu tấn công và Boss MẤT THÊM 1 TIM NGAY LẬP TỨC!
  console.log('\n--- 3. Kiểm tra Mini Game Audition: Bắt nhịp đúng -> Boss trừ tiếp 1 tim ngay ---');
  const auditionHitResult = await page.evaluate(async () => {
    const arena = window.__battleArenaModal;
    const q2 = arena.currentQuestion;
    const isAudition = q2?.type === 'audition_rhythm' || q2?.isAudition;

    if (!isAudition) return { error: 'Q2 is not audition', q2Type: q2?.type };

    // Giả lập bắt nhịp chuẩn xác (PERFECT)
    arena._testAuditionHit(true);

    // Chờ tung chiêu và trừ máu Boss
    await new Promise(r => setTimeout(r, 1400));

    const heartsAfterAudition = arena.monsterHearts;
    const monsterHpTextAfterAudition = document.getElementById('arena-monster-hp-text')?.textContent || '';
    const emptyHeartsCountAudition = arena.arenaMonsterHearts.querySelectorAll('img[alt="🤍"]').length;

    return {
      isAudition,
      heartsAfterAudition,
      monsterHpTextAfterAudition,
      emptyHeartsCountAudition
    };
  });

  console.log('  Kết quả sau đòn Audition:', auditionHitResult);
  assert.ok(auditionHitResult.isAudition, 'Câu 2 là Mini game Audition');
  assert.strictEqual(auditionHitResult.heartsAfterAudition, 3, 'Sau khi bắt nhịp đúng, Boss phải giảm từ 4 xuống 3 tim');
  assert.ok(auditionHitResult.monsterHpTextAfterAudition.includes('3/5'), 'Text máu Boss phải cập nhật đúng 3/5 ❤️');
  assert.strictEqual(auditionHitResult.emptyHeartsCountAudition, 2, 'DOM tim Boss phải có đúng 2 tim rỗng');

  await page.screenshot({ path: 'scripts/verified_boss_after_audition_hit.png' });

  // 4. Kiểm tra Bé Bị Quái/Boss Tấn Công: MẤT ĐÚNG 1 TIM!
  console.log('\n--- 4. Kiểm tra Bé Bị Quái/Boss Tấn Công: Mất đúng 1 tim ---');
  const heroHurtResult = await page.evaluate(async () => {
    const arena = window.__battleArenaModal;
    const heroHeartsBefore = arena.heroHearts;

    // Giả lập quái vật/Boss phản công thực tế (isShowcase = false)
    arena.executeMonsterAttack(false);

    // Chờ 8 bước tấn công và tác động vào Bé Sâu
    await new Promise(r => setTimeout(r, 1800));

    const heroHeartsAfter = arena.heroHearts;
    const heroHpTextAfter = document.getElementById('arena-hero-hp-text')?.textContent || '';
    const emptyHeroHeartsDom = arena.arenaHeroHearts.querySelectorAll('img[alt="🤍"]').length;

    return {
      heroHeartsBefore,
      heroHeartsAfter,
      heroHpTextAfter,
      emptyHeroHeartsDom
    };
  });

  console.log('  Kết quả Bé bị tấn công:', heroHurtResult);
  assert.strictEqual(heroHurtResult.heroHeartsBefore, 3, 'Bé trước khi bị đánh có 3 tim');
  assert.strictEqual(heroHurtResult.heroHeartsAfter, 2, 'Sau khi bị đánh, Bé phải còn 2 tim');
  assert.ok(heroHurtResult.heroHpTextAfter.includes('2/3'), 'Text máu Bé phải hiển thị đúng 2/3 ❤️');
  assert.strictEqual(heroHurtResult.emptyHeroHeartsDom, 1, 'DOM tim Bé có đúng 1 tim rỗng');

  await page.screenshot({ path: 'scripts/verified_hero_hurt_heart_drop.png' });

  // 5. Kiểm tra Boss Nổi Giận khi còn 2 tim: KHÔNG CÒN ĐÒN ĐÁNH ẢO 0 SÁT THƯƠNG
  console.log('\n--- 5. Kiểm tra Boss Nổi Giận ở 2 tim: Bật hào quang bùng nổ, không có đòn giả 0 sát thương ---');
  const enrageResult = await page.evaluate(async () => {
    const arena = window.__battleArenaModal;

    // Đánh tiếp 1 đòn để Boss xuống 2 tim -> Kích hoạt Enrage
    arena.executeHeroAttack();
    await new Promise(r => setTimeout(r, 1400));

    const bossHeartsEnrage = arena.monsterHearts;
    const isBossEnraged = arena.isBossEnraged;
    const heroHeartsEnrage = arena.heroHearts;

    // Chờ thêm 1000ms để xác minh không có showcase attack tự kích hoạt trừ khiên ảo
    await new Promise(r => setTimeout(r, 1000));

    const heroHeartsStillSafe = arena.heroHearts;
    const monsterHpTextEnrage = document.getElementById('arena-monster-hp-text')?.textContent || '';
    const topBannerText = arena.topBanner?.textContent || '';

    return {
      bossHeartsEnrage,
      isBossEnraged,
      heroHeartsEnrage,
      heroHeartsStillSafe,
      monsterHpTextEnrage,
      topBannerText
    };
  });

  console.log('  Kết quả kiểm tra Enrage:', enrageResult);
  assert.strictEqual(enrageResult.bossHeartsEnrage, 2, 'Boss còn 2 tim');
  assert.ok(enrageResult.isBossEnraged, 'Trạng thái Boss Enraged đã kích hoạt');
  assert.strictEqual(enrageResult.heroHeartsStillSafe, 2, 'Bé Sâu không bị dính đòn ảo vô lý, tim giữ nguyên 2 tim');
  assert.strictEqual(enrageResult.monsterHpTextEnrage, '2/5 ❤️', 'Chỉ số máu Boss hiển thị đúng 2/5 ❤️');

  await page.screenshot({ path: 'scripts/verified_boss_enrage_no_fake_attacks.png' });

  // 6. Kiểm tra Hạ Gục Boss: Đánh nốt 2 tim -> 0 tim và Giải cứu thành công
  console.log('\n--- 6. Kiểm tra Hạ Gục Boss: 0 tim -> Victory & Giải Cứu Thành Công ---');
  const victoryResult = await page.evaluate(async () => {
    const arena = window.__battleArenaModal;
    let bossResolvedDispatched = false;

    window.addEventListener('game:boss-resolved', () => {
      bossResolvedDispatched = true;
    }, { once: true });

    // Đòn 4: 2 tim -> 1 tim
    arena.executeHeroAttack();
    await new Promise(r => setTimeout(r, 1400));

    const heartsAt1 = arena.monsterHearts;

    // Đòn 5: 1 tim -> 0 tim (Hạ gục Boss!)
    arena.executeHeroAttack();
    await new Promise(r => setTimeout(r, 2200));

    const finalHearts = arena.monsterHearts;

    return {
      heartsAt1,
      finalHearts,
      bossResolvedDispatched
    };
  });

  console.log('  Kết quả kiểm tra Hạ Gục Boss:', victoryResult);
  assert.strictEqual(victoryResult.heartsAt1, 1, 'Boss còn 1 tim');
  assert.strictEqual(victoryResult.finalHearts, 0, 'Boss hết sạch tim (0 tim)');
  assert.ok(victoryResult.bossResolvedDispatched, 'Sự kiện game:boss-resolved đã được phát đi thành công');

  console.log('\n🎉 TẤT CẢ 6 BƯỚC KIỂM THỬ ĐÃ THÀNH CÔNG RỰC RỠ 100%!');
  await browser.close();
}

main().catch(err => {
  console.error('❌ Kiểm thử thất bại:', err);
  process.exit(1);
});
