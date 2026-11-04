/**
 * src/tests/unit/badgeSystem.test.js
 * Unit test suite cho Hệ Thống Chuỗi Huy Hiệu & Thành Tựu Của Bé (Bậc 1 đến Bậc 20 từ Dễ đến Khó).
 */

import { BADGES, BADGE_CATEGORIES, getBadgeById } from '../../content/achievements/badgeData.js';
import { BadgeSystem } from '../../game/systems/badgeSystem.js';
import { getDefaultGameState } from '../../services/save/saveAdapter.js';

export function runBadgeSystemTests() {
  console.log('\n--- [Test] Hệ Thống Chuỗi Huy Hiệu Từ Dễ Đến Khó (Rank 1 - 20) ---');

  // Test 1: Đủ 20 Huy Hiệu được sắp xếp tuần tự theo rank từ 1 đến 20
  const totalBadges = BADGES.length;
  if (totalBadges !== 20) {
    throw new Error(`Test 1 Failed: Cần đúng 20 huy hiệu trong chuỗi, hiện có ${totalBadges}`);
  }

  for (let i = 0; i < BADGES.length; i++) {
    const badge = BADGES[i];
    if (badge.rank !== i + 1) {
      throw new Error(`Test 1 Failed: Huy hiệu ${badge.id} có rank=${badge.rank}, kỳ vọng rank=${i + 1}`);
    }
    if (i === 0) {
      if (badge.previousBadgeId !== null) {
        throw new Error('Test 1 Failed: Bậc 1 không được có previousBadgeId');
      }
    } else {
      if (badge.previousBadgeId !== BADGES[i - 1].id) {
        throw new Error(`Test 1 Failed: Bậc ${i + 1} (${badge.id}) phải liên kết previousBadgeId với ${BADGES[i - 1].id}`);
      }
    }
  }
  console.log(`✓ Test 1 Passed: Toàn bộ 20 Huy Hiệu được liên kết thành chuỗi rank 1 -> 20 chặt chẽ`);

  // Test 2: Tính tuần tự chuỗi — Không thể mở Bậc 2 nếu chưa đạt Bậc 1
  const state = getDefaultGameState();
  const mockAdapter = {
    save: (s) => {},
    load: () => state
  };
  const badgeSys = new BadgeSystem(mockAdapter, state);

  // Thử thỏa mãn điều kiện Bậc 2 (Rửa tay 8 bước) khi chưa trả lời đúng câu hỏi (Bậc 1)
  state.cooking.handWash8StepsDone = true;
  badgeSys.checkAllBadges(state, { notify: false });

  if (badgeSys.isUnlocked('badge_clean_hands')) {
    throw new Error('Test 2 Failed: Bậc 2 không được mở khi chưa hoàn thành Bậc 1');
  }
  console.log('✓ Test 2 Passed: Đảm bảo tính tuần tự chuỗi — Bậc 2 bị khóa khi chưa đạt Bậc 1');

  // Test 3: Mở khóa Bậc 1 -> Kéo theo mở khóa Bậc 2 tuần tự
  state.campaign.learningStats.totalAnswers = 1;
  badgeSys.checkAllBadges(state, { notify: false });

  if (!badgeSys.isUnlocked('badge_math_genius')) {
    throw new Error('Test 3 Failed: Bậc 1 (Mầm Non Học Hỏi) phải mở khi totalAnswers >= 1');
  }
  if (!badgeSys.isUnlocked('badge_clean_hands')) {
    throw new Error('Test 3 Failed: Bậc 2 (Bé Sạch Khuẩn) phải mở sau khi Bậc 1 đã đạt và tay đã rửa sạch');
  }
  console.log('✓ Test 3 Passed: Mở khóa tuần tự thành công Bậc 1 và Bậc 2');

  // Test 4: Tiến bước chuỗi Bậc 3 (Ăn no) -> Bậc 4 (Tắm mát) -> Bậc 5 (Câu cá)
  state.pet.hunger = 85;
  state.pet.clean = 90;
  state.fishing.caughtCount = 1;
  state.fishing.fishBook = { cloud_fish: { caughtCount: 1, maxWeightG: 220 } };

  badgeSys.checkAllBadges(state, { notify: false });

  if (!badgeSys.isUnlocked('badge_pet_feeder')) {
    throw new Error('Test 4 Failed: Bậc 3 (Bạn Nhỏ Chu Đáo) phải mở');
  }
  if (!badgeSys.isUnlocked('badge_pet_bath')) {
    throw new Error('Test 4 Failed: Bậc 4 (Bé Tắm Mát Rượi) phải mở');
  }
  if (!badgeSys.isUnlocked('badge_first_catch')) {
    throw new Error('Test 4 Failed: Bậc 5 (Cần Thủ Kiên Trì) phải mở');
  }
  console.log('✓ Test 4 Passed: Chuỗi tiến bước liên tục đạt Bậc 3, Bậc 4 và Bậc 5');

  // Test 5: Kiểm tra tiến trình chuỗi và mục tiêu tiếp theo
  const chainProg = badgeSys.getBadgeChainProgress();
  if (chainProg.unlockedCount !== 5) {
    throw new Error(`Test 5 Failed: Kỳ vọng đã mở 5 bậc, thực tế: ${chainProg.unlockedCount}`);
  }
  if (chainProg.nextBadge?.id !== 'badge_little_chef') {
    throw new Error(`Test 5 Failed: Mục tiêu tiếp theo phải là Bậc 6 (badge_little_chef), thực tế: ${chainProg.nextBadge?.id}`);
  }
  console.log('✓ Test 5 Passed: getBadgeChainProgress xác định chuẩn xác 5/20 Bậc và Mục tiêu Bậc 6');

  // Test 6: Trang bị Huy Hiệu lên đầu nhân vật và Tháo xuống
  const equipped = badgeSys.equipBadge('badge_first_catch');
  if (!equipped || equipped.id !== 'badge_first_catch') {
    throw new Error('Test 6 Failed: Không thể trang bị badge_first_catch đã mở');
  }
  if (badgeSys.getEquippedBadge()?.id !== 'badge_first_catch') {
    throw new Error('Test 6 Failed: getEquippedBadge không trả về badge vừa trang bị');
  }

  // Tháo xuống
  badgeSys.unequipBadge();
  if (badgeSys.getEquippedBadge() !== null) {
    throw new Error('Test 6 Failed: unequipBadge phải trả về null');
  }

  // Không thể trang bị badge chưa mở khóa trong chuỗi (ví dụ: Bậc 20)
  const lockedBadge = badgeSys.equipBadge('badge_master_champion');
  if (lockedBadge !== null) {
    throw new Error('Test 6 Failed: Không được phép trang bị badge chưa mở khóa trong chuỗi');
  }
  console.log('✓ Test 6 Passed: Cơ chế Trang Bị Lên Đầu (Equip / Unequip Head Badge) an toàn tuyệt đối');
}
