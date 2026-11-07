import { chromium } from 'playwright';
import assert from 'node:assert';

async function testBadgeUnlocksAndCelebration() {
  console.log('=== BẮT ĐẦU KIỂM THỬ: MỞ KHÓA DANH HIỆU, GIẢM ĐỘ KHÓ & HIỆU ỨNG VINH DANH ===');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.text().includes('Badge') || msg.text().includes('danh hiệu') || msg.text().includes('huy hiệu')) {
      console.log('[BROWSER CONSOLE]', msg.text());
    }
  });

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // 1. Kiểm tra mở khóa Bậc 1 (Mầm Non Học Hỏi) và Hiệu ứng Vinh Danh lúc chơi
  console.log('\n--- 1. Kiểm thử Mở Khóa Bậc 1 & Hiệu Ứng Vinh Danh Trực Tiếp ---');
  const unlockedB1 = await page.evaluate(() => {
    const bs = window.__badgeSystem;
    const gs = window.__gameState;
    // Mô phỏng bé trả lời đúng 1 câu đố hoặc giải cứu 1 quái vật
    gs.campaign.learningStats = { totalAnswers: 1, firstTryCount: 1, skillsPracticed: {} };
    const newly = bs.checkAllBadges(gs, { notify: true, autoEquipIfNone: true });
    return {
      unlockedIds: bs.gameState.player.unlockedBadges,
      equippedBadge: bs.getEquippedBadge()?.id,
      newlyCount: newly.length
    };
  });

  console.log('Kết quả mở khóa Bậc 1:', unlockedB1);
  assert.ok(unlockedB1.unlockedIds.includes('badge_math_genius'), 'Bậc 1 (badge_math_genius) phải mở khóa!');
  assert.equal(unlockedB1.equippedBadge, 'badge_math_genius', 'Bậc 1 phải tự động trang bị lên đầu!');

  await page.waitForTimeout(600);

  // Kiểm tra Modal Chúc Mừng Danh Hiệu hiển thị
  const modalVisible = await page.locator('#badge-celebration-popup').isVisible();
  assert.ok(modalVisible, 'Pop-up vinh danh danh hiệu (#badge-celebration-popup) phải xuất hiện rực rỡ!');

  const celebrationDetails = await page.evaluate(() => {
    const modal = document.getElementById('badge-celebration-popup');
    if (!modal) return null;
    const title = modal.querySelector('.badge-celebrate-title')?.textContent?.trim();
    const rankPill = modal.querySelector('.badge-rank-pill')?.textContent?.trim();
    const confettiCount = modal.querySelectorAll('.badge-confetti').length;
    const hasSunburst = Boolean(modal.querySelector('.badge-sunburst-aura'));
    return { title, rankPill, confettiCount, hasSunburst };
  });

  console.log('Chi tiết Pop-up Chúc Mừng:', celebrationDetails);
  assert.equal(celebrationDetails.title.toUpperCase(), 'MẦM NON HỌC HỎI', 'Tiêu đề pop-up phải là MẦM NON HỌC HỎI');
  assert.ok(celebrationDetails.confettiCount >= 20, 'Phải có hiệu ứng pháo hoa giấy confetti bay');
  assert.ok(celebrationDetails.hasSunburst, 'Phải có hào quang sunburst xoay rực rỡ');

  await page.screenshot({
    path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_badge_1_celebration.png'
  });
  console.log('✓ Đã lưu ảnh minh chứng Pop-up Chúc Mừng Danh Hiệu Bậc 1!');

  // Đóng pop-up chúc mừng
  await page.locator('#badge-celebrate-close-btn').click();
  await page.waitForTimeout(500);

  // 2. Kiểm thử Mở Khóa Tuần Tự & Giảm Độ Khó (Bậc 2, 3, 4, 5, 6, 7)
  console.log('\n--- 2. Kiểm thử Giảm Độ Khó & Mở Khóa Bậc 2 đến Bậc 7 ---');
  const cascadeResult = await page.evaluate(() => {
    const bs = window.__badgeSystem;
    const gs = window.__gameState;

    // Bậc 2: Rửa tay
    gs.cooking.handsWashed = true;

    // Bậc 3: Cho cún ăn (độ khó giảm còn 40%)
    gs.pet.hunger = 45;

    // Bậc 4: Tắm cho cún (độ khó giảm còn 40%)
    gs.pet.clean = 45;

    // Bậc 5: Câu 1 bạn cá
    gs.fishing.caughtCount = 1;
    gs.fishing.fishBook = { cloud_fish: { caughtCount: 1 } };

    // Bậc 6: Nấu 1 món ăn
    gs.cooking.cookedDishesCount = 1;

    // Bậc 7: Tích lũy 5 Sao (độ khó giảm từ 15 Sao xuống 5 Sao!)
    gs.player.stars = 5;

    const newly = bs.checkAllBadges(gs, { notify: false, autoEquipIfNone: true });
    return {
      unlockedIds: bs.gameState.player.unlockedBadges,
      equippedBadge: bs.getEquippedBadge()?.id,
      progression: bs.getBadgeChainProgress()
    };
  });

  console.log('Kết quả chuỗi mở khóa:', cascadeResult);
  assert.ok(cascadeResult.unlockedIds.includes('badge_clean_hands'), 'Bậc 2 (badge_clean_hands) phải mở khóa!');
  assert.ok(cascadeResult.unlockedIds.includes('badge_pet_feeder'), 'Bậc 3 (badge_pet_feeder) phải mở khóa với hunger=45%!');
  assert.ok(cascadeResult.unlockedIds.includes('badge_pet_bath'), 'Bậc 4 (badge_pet_bath) phải mở khóa với clean=45%!');
  assert.ok(cascadeResult.unlockedIds.includes('badge_first_catch'), 'Bậc 5 (badge_first_catch) phải mở khóa!');
  assert.ok(cascadeResult.unlockedIds.includes('badge_little_chef'), 'Bậc 6 (badge_little_chef) phải mở khóa!');
  assert.ok(cascadeResult.unlockedIds.includes('badge_star_collector'), 'Bậc 7 (badge_star_collector) phải mở khóa với 5 Sao!');
  assert.equal(cascadeResult.progression.unlockedCount, 7, 'Phải mở khóa thành công trọn vẹn 7 bậc đầu tiên!');

  // 3. Mở Sổ Huy Hiệu (FishBookModal) kiểm tra giao diện & hiển thị Bậc đã mở
  console.log('\n--- 3. Mở Sổ Huy Hiệu kiểm tra giao diện 7 Bậc đã đạt ---');
  await page.evaluate(() => {
    window.__fishBookModal?.open('all');
  });
  await page.waitForTimeout(600);

  const isModalOpen = await page.locator('#fishbook-modal-root').isVisible();
  assert.ok(isModalOpen, 'Sổ Huy Hiệu phải mở hiển thị!');

  const fishbookStats = await page.evaluate(() => {
    const root = document.getElementById('fishbook-modal-root');
    const pills = root?.querySelector('.basket-pill')?.textContent?.trim();
    const equippedText = root?.querySelector('.fishing-title-text')?.textContent?.trim();
    return { pills, equippedText };
  });

  console.log('Thống kê trong Sổ Huy Hiệu:', fishbookStats);
  assert.ok(fishbookStats.pills.includes('7/20'), 'Huy hiệu phải hiển thị 7/20 Bậc');

  await page.screenshot({
    path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_fishbook_unlocked_badges.png'
  });
  console.log('✓ Đã lưu ảnh minh chứng Sổ Huy Hiệu với 7 Bậc mở khóa!');

  // Đóng modal Sổ Huy Hiệu
  await page.evaluate(() => window.__fishBookModal?.close());
  await page.waitForTimeout(500);

  // 4. Kiểm tra Huy Hiệu trên đầu nhân vật trong WorldScene
  console.log('\n--- 4. Kiểm tra Huy Hiệu Đang Đeo Trên Đầu Nhân Vật ---');
  const heroBadgeStatus = await page.evaluate(() => {
    const hero = window.__worldScene?.hero;
    return {
      hasHeadBadge: Boolean(hero?.headBadgeContainer),
      badgeText: hero?.headBadgeData?.title
    };
  });

  console.log('Huy hiệu trên đầu Bé Sam:', heroBadgeStatus);
  assert.ok(heroBadgeStatus.hasHeadBadge, 'Hero phải có headBadgeContainer trên đầu');
  assert.equal(heroBadgeStatus.badgeText, 'Bé Tích Sao Ngoan', 'Huy hiệu mới nhất phải hiển thị trên đầu bé');

  await page.screenshot({
    path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_hero_head_badge_in_world.png'
  });
  console.log('✓ Đã lưu ảnh minh chứng Huy Hiệu trên đầu nhân vật Bé Sam!');

  console.log('\n=== TẤT CẢ KIỂM THỬ MỞ KHÓA DANH HIỆU & HIỆU ỨNG VINH DANH ĐỀU ĐẠT 100%! ===');
  await browser.close();
}

testBadgeUnlocksAndCelebration().catch(err => {
  console.error('LỖI KIỂM THỬ:', err);
  process.exit(1);
});
