import assert from 'node:assert/strict';
import { validateQuestion } from '../../content/schema/validator.js';
import { QUESTION_BANK, getRandomZoneQuestion, getQuestion } from '../../content/questions/questionBank.js';
import { MAPS_CONFIG } from '../../content/maps/mapsConfig.js';
import { CombatSystem } from '../../game/systems/combatSystem.js';
import { ProgressionSystem } from '../../game/systems/progressionSystem.js';
import { getDefaultGameState } from '../../services/save/saveAdapter.js';

export function runZone1ContentTests() {
  console.log('--- [Test] Giai đoạn 3: Vùng 1 Content & Multi-phase Boss ---');

  // Test 1: Kiểm định tất cả câu hỏi Vùng 1 mở rộng
  const zone1QuestionIds = [
    'q_map1_colors_1',
    'q_map1_colors_2',
    'q_map1_colors_3',
    'q_map1_shapes_1',
    'q_map1_shapes_2',
    'q_map1_shapes_3',
    'q_map1_boss_p1',
    'q_map1_boss_p2'
  ];

  for (const qId of zone1QuestionIds) {
    const q = QUESTION_BANK[qId];
    assert.ok(q, `Question ${qId} must exist in bank`);
    const val = validateQuestion(q);
    assert.equal(val.valid, true, `Question ${qId} must be valid: ${val.errors?.join(', ')}`);
  }
  console.log('✓ Test 1 Passed: All 8 Zone 1 questions are valid');

  // Test 2: Cơ chế chọn câu hỏi chống lặp
  const excluded = ['q_map1_colors_1', 'q_map1_colors_2'];
  const picked = getRandomZoneQuestion('map1', excluded);
  assert.ok(picked, 'Must return a question');
  assert.equal(excluded.includes(picked.id), false, 'Picked question must not be in excluded list');
  assert.equal(picked.id.startsWith('q_map1_'), true, 'Must belong to map1');
  console.log('✓ Test 2 Passed: Anti-repeat question selection');

  // Test 3: Logic Cổng Hoa Cầu Vồng (Props Puzzle)
  const map1 = MAPS_CONFIG.map1;
  assert.ok(map1.propsPuzzle, 'Map 1 must have propsPuzzle');
  const reqRescues = map1.propsPuzzle.requiredRescues;
  assert.deepEqual(reqRescues, ['enc_map1_1', 'enc_map1_2', 'enc_map1_3'], 'Requires 3 friend rescues');

  const emptyRescues = {};
  const isUnlockedEmpty = reqRescues.every(id => Boolean(emptyRescues[id]));
  assert.equal(isUnlockedEmpty, false, 'Flower gate must be locked initially');

  const halfRescues = { enc_map1_1: true, enc_map1_2: true };
  const isUnlockedHalf = reqRescues.every(id => Boolean(halfRescues[id]));
  assert.equal(isUnlockedHalf, false, 'Flower gate must be locked with only 2 friends rescued');

  const fullRescues = { enc_map1_1: true, enc_map1_2: true, enc_map1_3: true };
  const isUnlockedFull = reqRescues.every(id => Boolean(fullRescues[id]));
  assert.equal(isUnlockedFull, true, 'Flower gate unlocks when all 3 friends rescued');
  console.log('✓ Test 3 Passed: Flower gate puzzle unlocking condition');

  // Test 4: Boss Nấm Mũ Đỏ 2 Pha (Multi-phase Combat)
  const state = getDefaultGameState();
  const progSys = new ProgressionSystem(state);
  const combatSys = new CombatSystem({ progressionSystem: progSys });

  const boss = map1.boss;
  assert.ok(boss.phases && boss.phases.length === 2, 'Boss must have 2 phases');

  // Khởi động Boss Pha 1
  const phase1Q = getQuestion(boss.phases[0].questionId);
  const startRes = combatSys.startEncounter(boss, phase1Q);
  assert.equal(startRes.isBoss, true, 'Must identify as boss');
  assert.equal(startRes.currentPhase, 1, 'Starts at phase 1');
  assert.equal(startRes.totalPhases, 2, 'Total phases is 2');

  // Pha 1: Trả lời sai -> retry
  const wrongRes = combatSys.submitAnswer(99);
  assert.equal(wrongRes.status, 'retry');
  assert.equal(wrongRes.canRetry, true);

  // Pha 1: Trả lời đúng -> phase_advance sang Pha 2
  const correctP1 = combatSys.submitAnswer(phase1Q.correct);
  assert.equal(correctP1.status, 'phase_advance');
  assert.equal(correctP1.nextPhaseIndex, 1);

  // Chuyển sang Pha 2
  const phase2Q = getQuestion(boss.phases[1].questionId);
  const advanceRes = combatSys.advancePhase(phase2Q);
  assert.equal(advanceRes.currentPhase, 2);

  // Pha 2: Trả lời đúng -> Thắng toàn trận, trao thưởng, mở map 2
  const correctP2 = combatSys.submitAnswer(phase2Q.correct);
  assert.equal(correctP2.status, 'success');
  assert.equal(correctP2.isBoss, true);
  assert.equal(correctP2.unlockedNewMap, 'map2', 'Boss victory unlocks map2');
  assert.equal(progSys.isMapUnlocked('map2'), true, 'Progression reflects map2 unlock');
  assert.equal(state.player.stars, 3, 'Player received 3 stars reward');
  console.log('✓ Test 4 Passed: Multi-phase Boss victory and Map 2 unlocking');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runZone1ContentTests();
}
