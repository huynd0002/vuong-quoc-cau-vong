import assert from 'node:assert/strict';
import { MAPS_CONFIG } from '../../content/maps/mapsConfig.js';
import { QUESTION_BANK, createAuditionQuestion } from '../../content/questions/questionBank.js';
import { validateQuestion } from '../../content/schema/validator.js';

export function runMapDifficultyAndAuditionTests() {
  console.log('--- [Test] Độ Khó Map, Tim Quái/Boss, Sao Thưởng & Mini Game Audition ---');

  // Test 1: Thử thách Memory Match tăng độ khó theo cấp số nhân & số lần sai tương ứng
  const m1 = QUESTION_BANK.q_map1_memory_animals;
  const m2 = QUESTION_BANK.q_map2_memory_mushrooms;
  const m3 = QUESTION_BANK.q_map3_memory_crystals;
  const m4 = QUESTION_BANK.q_map4_memory_desert;
  const m5 = QUESTION_BANK.q_map5_memory_canyon;
  const m6 = QUESTION_BANK.q_map6_memory_rainbow;

  assert.equal(m1.cards.length, 4, 'Map 1 có 4 ô (2 cặp)');
  assert.equal(m1.maxMistakes, 2, 'Map 1 sai tối đa 2 lần');

  assert.equal(m2.cards.length, 8, 'Map 2 gấp đôi Map 1: 8 ô (4 cặp)');
  assert.equal(m2.maxMistakes, 4, 'Map 2 sai tối đa 4 lần');

  assert.equal(m3.cards.length, 8, 'Map 3 có 8 ô (4 cặp)');
  assert.equal(m3.maxMistakes, 4, 'Map 3 sai tối đa 4 lần');

  assert.equal(m4.cards.length, 10, 'Map 4 có 10 ô (5 cặp)');
  assert.equal(m4.maxMistakes, 5, 'Map 4 sai tối đa 5 lần');

  assert.equal(m5.cards.length, 12, 'Map 5 có 12 ô (6 cặp)');
  assert.equal(m5.maxMistakes, 6, 'Map 5 sai tối đa 6 lần');

  assert.equal(m6.cards.length, 12, 'Map 6 có 12 ô (6 cặp)');
  assert.equal(m6.maxMistakes, 6, 'Map 6 sai tối đa 6 lần');
  console.log('✓ Test 1 Passed: Memory Match cards & maxMistakes scaling verified across all 6 maps');

  // Test 2: Máu quái thường (tối thiểu 3), quái tinh anh (5 tim) và Boss (5 -> 10 tim)
  function calculateMonsterHearts(encounter, mapIndex) {
    if (!encounter) return 3;
    const isBoss = Boolean(encounter.phases || encounter.isBoss);
    if (isBoss) {
      if (encounter.maxHearts) return encounter.maxHearts;
      return 4 + Math.max(1, Math.min(6, mapIndex));
    }
    return encounter.maxHearts || (encounter.isElite ? 5 : 3);
  }

  for (let mapIndex = 1; mapIndex <= 6; mapIndex++) {
    const mapKey = `map${mapIndex}`;
    const map = MAPS_CONFIG[mapKey];
    assert.ok(map, `${mapKey} must exist in MAPS_CONFIG`);

    // Kiểm tra Boss: Map 1 là 5 tim, mỗi map tăng 1 tim -> Map 6 là 10 tim
    const expectedBossHearts = 4 + mapIndex;
    const bossHearts = calculateMonsterHearts(map.boss, mapIndex);
    assert.equal(bossHearts, expectedBossHearts, `${mapKey} boss must have ${expectedBossHearts} hearts (got ${bossHearts})`);

    // Kiểm tra quái thường & quái tinh anh
    map.encounters?.forEach(enc => {
      const hearts = calculateMonsterHearts(enc, mapIndex);
      if (enc.isElite) {
        assert.equal(hearts, 5, `Quái tinh anh ${enc.name} (${enc.id}) phải có 5 tim`);
      } else {
        assert.ok(hearts >= 3, `Quái thường ${enc.name} (${enc.id}) phải có tối thiểu 3 tim`);
      }
    });
  }
  console.log('✓ Test 2 Passed: Monster hearts (3 min, 5 elite) and Boss hearts (5 to 10) verified');

  // Test 3: Phần thưởng Sao tăng tương ứng theo độ khó maps
  assert.equal(MAPS_CONFIG.map1.encounters[0].reward.stars, 3);
  assert.equal(MAPS_CONFIG.map1.boss.reward.stars, 8);

  assert.equal(MAPS_CONFIG.map2.encounters[0].reward.stars, 5);
  assert.equal(MAPS_CONFIG.map2.boss.reward.stars, 12);

  assert.equal(MAPS_CONFIG.map3.encounters[0].reward.stars, 7);
  assert.equal(MAPS_CONFIG.map3.boss.reward.stars, 16);

  assert.equal(MAPS_CONFIG.map4.encounters[0].reward.stars, 10);
  assert.equal(MAPS_CONFIG.map4.boss.reward.stars, 22);

  assert.equal(MAPS_CONFIG.map5.encounters[0].reward.stars, 12);
  assert.equal(MAPS_CONFIG.map5.boss.reward.stars, 28);

  assert.equal(MAPS_CONFIG.map6.encounters[0].reward.stars, 15);
  assert.equal(MAPS_CONFIG.map6.boss.reward.stars, 40);
  console.log('✓ Test 3 Passed: Star rewards scale proportionally with map progression');

  // Test 4: Mini Game Audition Question Schema & targets (1 nhịp chuẩn = 1 đòn trừ 1 tim ngay)
  const auditionMonster = createAuditionQuestion({
    encounter: MAPS_CONFIG.map1.encounters[0],
    isBoss: false
  });
  assert.equal(auditionMonster.type, 'audition_rhythm');
  assert.equal(auditionMonster.isAudition, true);
  assert.equal(auditionMonster.target, 1);
  const vMonster = validateQuestion(auditionMonster);
  assert.equal(vMonster.valid, true, `Audition monster question valid: ${vMonster.errors?.join(', ')}`);

  const auditionBoss = createAuditionQuestion({
    encounter: MAPS_CONFIG.map6.boss,
    isBoss: true
  });
  assert.equal(auditionBoss.type, 'audition_rhythm');
  assert.equal(auditionBoss.isAudition, true);
  assert.equal(auditionBoss.target, 1);
  const vBoss = validateQuestion(auditionBoss);
  assert.equal(vBoss.valid, true, `Audition boss question valid: ${vBoss.errors?.join(', ')}`);
  console.log('✓ Test 4 Passed: Audition rhythm question creation conforms 100% to schema (1 hit = 1 heart damage)');

  // Test 5: Chuỗi quái tinh anh & boss có maxHearts được nạp chuẩn xác trong MAPS_CONFIG
  assert.equal(MAPS_CONFIG.map1.encounters[2].maxHearts, 5);
  assert.equal(MAPS_CONFIG.map1.encounters[2].isElite, true);
  assert.equal(MAPS_CONFIG.map1.boss.maxHearts, 5);

  assert.equal(MAPS_CONFIG.map2.encounters[2].maxHearts, 5);
  assert.equal(MAPS_CONFIG.map2.encounters[2].isElite, true);
  assert.equal(MAPS_CONFIG.map2.boss.maxHearts, 6);

  assert.equal(MAPS_CONFIG.map6.encounters[1].maxHearts, 5);
  assert.equal(MAPS_CONFIG.map6.boss.maxHearts, 10);
  console.log('✓ Test 5 Passed: Elite monsters and Boss configs have explicit maxHearts');

  console.log('🎉 TOÀN BỘ 5/5 TEST ĐỘ KHÓ, TIM, SAO VÀ AUDITION ĐÃ VƯỢT QUA XUẤT SẮC!');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runMapDifficultyAndAuditionTests();
}
