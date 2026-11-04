import assert from 'node:assert/strict';
import { PetSystem, MIN_OFFLINE_STAT, PERSONALITY_TRAITS } from '../../game/systems/petSystem.js';
import { getDefaultGameState } from '../../services/save/saveAdapter.js';

export function runPetSystemTests() {
  console.log('--- [Test] Pet System (Chuẩn he-thong-nuoi-thu.md) ---');

  const state = getDefaultGameState();
  const petSys = new PetSystem(state.pet);

  // Test 1: Chăm sóc cơ bản (Cho ăn, Uống nước, Tắm, Vệ sinh) theo he-thong-nuoi-thu.md
  petSys.pet.hunger = 50;
  petSys.pet.thirst = 30;
  petSys.pet.clean = 40;
  petSys.pet.bladder = 80;

  // Cho ăn: +40% Độ no (Mục 4)
  const feedRes = petSys.feed();
  assert.equal(petSys.pet.hunger, 90, 'Hunger should increase by 40% (50 + 40 = 90)');
  assert.ok(feedRes.message.includes('ngon lành'), 'Feed message returned');

  // Uống nước: +60% Độ khát (Mục 4)
  const drinkRes = petSys.drink();
  assert.equal(petSys.pet.thirst, 90, 'Thirst should increase by 60% (30 + 60 = 90)');

  // Tắm sạch: +65% Sạch sẽ (Mục 4)
  const batheRes = petSys.bathe();
  assert.equal(petSys.pet.clean, 100, 'Clean should increase by 65% (capped at 100)');
  assert.ok(batheRes.message.includes('xà phòng'), 'Bathe message returned');

  // Đi vệ sinh: Buồn vệ sinh về 0% (Mục 4)
  const pottyRes = petSys.potty();
  assert.equal(petSys.pet.bladder, 0, 'Bladder should reset to 0% after potty');
  console.log('✓ Test 1 Passed: Feed (+40%), Drink (+60%), Bathe (+65%), Potty (-> 0%)');

  // Test 2: Thăng cấp Pet & Tăng tình cảm
  petSys.pet.exp = 0;
  petSys.pet.level = 1;
  petSys.pet.affection = 10;

  const expRes = petSys.addExp(35); // >= 30 EXP
  assert.equal(expRes.leveledUp, true, 'Pet should level up');
  assert.equal(petSys.pet.level, 2, 'Pet level should be 2');
  assert.ok(petSys.pet.affection >= 12, 'Affection should increase with level up');
  console.log('✓ Test 2 Passed: Pet level up and affection gain');

  // Test 3: Suy giảm Offline an toàn (Tối đa 4 giờ trong game, chặn an toàn >= 30%)
  const petWithLongAbsence = {
    ...getDefaultGameState().pet,
    hunger: 60,
    thirst: 60,
    clean: 50,
    fun: 60,
    energy: 50,
    bladder: 10,
    affection: 35,
    health: 100,
    // Giả lập vắng mặt 3 ngày (72 giờ)
    lastCareTimestamp: Date.now() - 72 * 60 * 60 * 1000
  };

  const offlineSys = new PetSystem(petWithLongAbsence);
  // Offline tối đa tính 4 giờ game:
  // hunger: 60 - (3.5 * 4) = 46 (>= 30%)
  // thirst: 60 - (5.0 * 4) = 40 (>= 30%)
  // clean: 50 - (1.5 * 4) = 44 (>= 30%)
  assert.ok(offlineSys.pet.hunger >= MIN_OFFLINE_STAT, `Hunger (${offlineSys.pet.hunger}) must be >= 30%`);
  assert.ok(offlineSys.pet.clean >= MIN_OFFLINE_STAT, `Clean (${offlineSys.pet.clean}) must be >= 30%`);
  assert.equal(offlineSys.pet.hunger, 46, 'Hunger decayed exactly 4 game hours (3.5 * 4 = 14%)');
  assert.equal(offlineSys.pet.thirst, 40, 'Thirst decayed exactly 4 game hours (5.0 * 4 = 20%)');
  assert.equal(offlineSys.pet.bladder, 10, 'Bladder must NEVER increase offline (Mục 1)');
  assert.equal(offlineSys.pet.affection, 35, 'Affection must NEVER decrease offline (Mục 1)');
  assert.equal(offlineSys.pet.health, 100, 'Health must NEVER decrease offline (Mục 1)');
  assert.ok(offlineSys.pet.energy >= 50, 'Energy recovers during offline rest');
  console.log('✓ Test 3 Passed: Safe offline decay (capped at 4 game hours, zero health/affection loss)');

  // Test 4: Mô phỏng thời gian thực (1 giờ game = 120s thực tế)
  const simSys = new PetSystem({
    ...getDefaultGameState().pet,
    hunger: 100,
    thirst: 100,
    clean: 100,
    fun: 80,
    energy: 100,
    bladder: 0,
    isSleeping: false
  });

  // Giả lập 60 giây thực tế trôi qua = 0.5 giờ trong game
  simSys.updateSimulation(60);
  assert.equal(Math.round(simSys.pet.hunger * 100) / 100, 100 - (3.5 * 0.5), 'Hunger decays 1.75% in 30 game minutes');
  assert.equal(Math.round(simSys.pet.thirst * 100) / 100, 100 - (5.0 * 0.5), 'Thirst decays 2.50% in 30 game minutes');
  assert.equal(Math.round(simSys.pet.clean * 100) / 100, 100 - (1.5 * 0.5), 'Clean decays 0.75% in 30 game minutes');
  assert.equal(Math.round(simSys.pet.bladder * 100) / 100, 0 + (5.0 * 0.5), 'Bladder increases 2.50% in 30 game minutes');

  // Khi ngủ: Năng lượng hồi phục +12% / giờ game, buồn vệ sinh không tăng
  simSys.pet.energy = 50;
  simSys.pet.bladder = 40;
  simSys.sleep(true);
  simSys.updateSimulation(60); // 0.5 giờ game
  assert.equal(Math.round(simSys.pet.energy * 100) / 100, 50 + (12.0 * 0.5), 'Energy recovers 6% in 30 game minutes while sleeping');
  assert.equal(simSys.pet.bladder, 40, 'Bladder does not increase while sleeping');
  console.log('✓ Test 4 Passed: Real-time simulation (1 game hr = 120s, awake decay & sleep recovery)');

  // Test 5: Ưu tiên hành vi tự động & Mức tình cảm (Mục 7 & Mục 6)
  simSys.sleep(false);
  simSys.pet.thirst = 8; // <= 10%
  const urgentNeed = simSys.getPrimaryNeed();
  assert.equal(urgentNeed.type, 'thirst', 'Emergency thirst takes priority');
  assert.equal(urgentNeed.urgent, true, 'Marked as urgent');

  simSys.pet.thirst = 90;
  simSys.pet.affection = 80;
  const tier = simSys.getAffectionTier();
  assert.equal(tier.code, 'loyal', 'Affection 80% is loyal (Quấn quýt)');
  console.log('✓ Test 5 Passed: Behavior priority order & Affection tier calculation');

  // Test 6: Bật/tắt đồng hành
  const companionBefore = petSys.pet.isCompanion;
  const toggled = petSys.toggleCompanion();
  assert.equal(toggled, !companionBefore, 'Toggle companion mode');
  console.log('✓ Test 6 Passed: Toggle companion');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runPetSystemTests();
}
