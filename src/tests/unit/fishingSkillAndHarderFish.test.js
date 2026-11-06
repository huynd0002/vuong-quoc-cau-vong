import assert from 'node:assert/strict';
import { SaveAdapter } from '../../services/save/saveAdapter.js';
import { FishingSystem } from '../../game/systems/fishingSystem.js';
import {
  FISH_SPECIES,
  FISH_DIFFICULTY_PROFILES,
  getFishSpecies,
  calculateFishSellPrice,
  calculateFishPortions,
  rollFishSpeciesAndWeight
} from '../../content/fishing/fishingData.js';

export function runFishingSkillAndHarderFishTests() {
  console.log('--- [Test] Kỹ Năng Câu Cá (Dùng Skill Tăng Cá) & Các Loài Cá Mới Khó Bắt Hơn ---');

  // Test 1: Kiểm tra cấu hình và độ khó của 3 loài cá mới
  {
    const dragon = getFishSpecies('golden_dragon_fish');
    assert.ok(dragon, 'Cá Rồng Hoàng Kim phải tồn tại');
    assert.equal(dragon.requiredHits, 6, 'Cá Rồng Hoàng Kim cần 6 lần canh');
    assert.equal(dragon.zoneHeight, 12, 'Vùng canh Cá Rồng là 12px');
    assert.equal(dragon.markerSpeed, 210, 'Tốc độ marker Cá Rồng là 210');
    assert.equal(calculateFishSellPrice(dragon.minWeightG, dragon.id), 12, 'Giá bán Cá Rồng Hoàng Kim là 12 Sao');

    const crystal = getFishSpecies('crystal_fairy_fish');
    assert.ok(crystal, 'Cá Pha Lê Huyền Ảo phải tồn tại');
    assert.equal(crystal.requiredHits, 6, 'Cá Pha Lê Huyền Ảo cần 6 lần canh');
    assert.equal(crystal.zoneHeight, 13, 'Vùng canh Cá Pha Lê là 13px');
    assert.equal(crystal.markerSpeed, 195, 'Tốc độ marker Cá Pha Lê là 195');
    assert.equal(calculateFishSellPrice(crystal.minWeightG, crystal.id), 10, 'Giá bán Cá Pha Lê là 10 Sao');

    const galaxy = getFishSpecies('galaxy_star_fish');
    assert.ok(galaxy, 'Cá Ngân Hà Tinh Tú phải tồn tại');
    assert.equal(galaxy.requiredHits, 7, 'Cá Ngân Hà Tinh Tú cần 7 lần canh (cực hạn đỉnh cao)');
    assert.equal(galaxy.zoneHeight, 10, 'Vùng canh Cá Ngân Hà siêu nhỏ 10px');
    assert.equal(galaxy.markerSpeed, 240, 'Tốc độ marker Cá Ngân Hà siêu nhanh 240');
    assert.equal(calculateFishSellPrice(galaxy.minWeightG, galaxy.id), 16, 'Giá bán Cá Ngân Hà là 16 Sao');

    console.log('✓ Test 1 Passed: Đầy đủ 3 loài cá mới với độ khó 6-7 nhịp canh và chỉ số chuẩn xác');
  }

  // Test 2: Quy đổi phần cá nấu ăn cho các bạn cá lớn mới
  {
    assert.equal(calculateFishPortions(2400), 4, 'Cá 2400g quy đổi 4 phần cá');
    assert.equal(calculateFishPortions(3800), 5, 'Cá 3800g quy đổi 5 phần cá');
    console.log('✓ Test 2 Passed: Tính toán quy đổi phần cá nấu ăn cho cá to khủng chuẩn xác');
  }

  // Test 3: Kích hoạt Kỹ Năng Câu Cá (Dùng Skill)
  {
    const adapter = new SaveAdapter('TEST_FISHING_SKILL');
    adapter.reset();
    const fishing = new FishingSystem(adapter);

    assert.equal(fishing.isFishingSkillActive(), false, 'Ban đầu skill chưa kích hoạt');
    
    const actRes = fishing.activateFishingSkill();
    assert.equal(actRes.ok, true);
    assert.equal(fishing.isFishingSkillActive(), true, 'Skill đã kích hoạt thành công');

    console.log('✓ Test 3 Passed: Kích hoạt Kỹ Năng Câu Cá thành công');
  }

  // Test 4: Roll cá khi Dùng Skill tăng mạnh tỷ lệ cá quý hiếm và cá mới
  {
    let rareCountWithSkill = 0;
    const trials = 100;
    for (let i = 0; i < trials; i++) {
      const rolled = rollFishSpeciesAndWeight({
        baitId: 'bait_sweet_cake',
        dockId: 'lotus_dock',
        rodId: 'rod_rainbow',
        isSkillActive: true
      });
      if (['crystal_fairy_fish', 'golden_dragon_fish', 'galaxy_star_fish', 'rainbow_fish', 'sun_spot_fish'].includes(rolled.speciesId)) {
        rareCountWithSkill++;
      }
    }
    assert.ok(rareCountWithSkill >= 30, `Tỷ lệ cá hiếm khi dùng skill phải cao (đạt ${rareCountWithSkill}/${trials})`);
    console.log(`✓ Test 4 Passed: Khi dùng Skill, tỷ lệ xuất hiện cá mới và cá hiếm tăng vọt (${rareCountWithSkill}% lượt)`);
  }

  // Test 5: Double Catch (Nhận x2 cá) khi câu thành công lúc bật Skill
  {
    const adapter = new SaveAdapter('TEST_FISHING_DOUBLE_CATCH');
    adapter.reset();
    const fishing = new FishingSystem(adapter);
    fishing.borrowStarterKit();
    fishing.activateFishingSkill();

    const startRes = fishing.startFishingTurn('lotus_dock');
    assert.equal(startRes.ok, true);
    
    const biteRes = fishing.commitRealBite(true);
    assert.equal(biteRes.ok, true);

    const catchRes = fishing.recordTurnCatch();
    assert.equal(catchRes.ok, true);
    assert.equal(catchRes.doubleCatchAwarded, true, 'Double catch phải được kích hoạt');

    const basket = fishing.getState().basket;
    // Kiểm tra số lượng cá nhận được: nếu stack được thì count=2, nếu không thì basket có 2 con
    const totalCount = basket.reduce((sum, f) => sum + (f.count || 1), 0);
    assert.equal(totalCount, 2, 'Bé phải nhận được 2 bạn cá khi bật Skill');
    console.log('✓ Test 5 Passed: Bật Skill câu trúng nhận ngay x2 cá vào giỏ/túi đồ');
  }

  console.log('🎉 TOÀN BỘ 5/5 TEST KỸ NĂNG CÂU CÁ & CÁ MỚI KHÓ BẮT ĐÃ VƯỢT QUA XUẤT SẮC!');
}

runFishingSkillAndHarderFishTests();
