/**
 * Unit Tests: Giai đoạn 5 — Mở rộng nội dung 6 Vùng Đất, Câu đố môi trường & Boss 2 pha
 */

import assert from 'node:assert';
import { MAPS_CONFIG, getMapConfig, getAllMaps } from '../../content/maps/mapsConfig.js';
import { QUESTION_BANK, getQuestion, getRandomZoneQuestion } from '../../content/questions/questionBank.js';
import { ProgressionSystem } from '../../game/systems/progressionSystem.js';
import { getDefaultGameState } from '../../services/save/saveAdapter.js';

export function runZoneContent6ZonesTests() {
  console.log('--- [Test] Giai đoạn 5: Mở rộng nội dung 6 Vùng Đất ---');

  const maps = getAllMaps();
  assert.strictEqual(maps.length, 6, 'Phải có đủ 6 bản đồ');

  // Test 1: Kiểm tra cấu hình và câu đố môi trường (Props Puzzle) của cả 6 vùng
  {
    maps.forEach(map => {
      assert.ok(map.storyIntro, `${map.id} phải có storyIntro`);
      assert.ok(map.storyIntro.title, `${map.id} storyIntro thiếu title`);
      assert.ok(map.storyIntro.voice, `${map.id} storyIntro thiếu voice`);

      assert.ok(map.propsPuzzle, `${map.id} phải có propsPuzzle`);
      assert.ok(map.propsPuzzle.id, `${map.id} propsPuzzle thiếu id`);
      assert.ok(Array.isArray(map.propsPuzzle.requiredRescues), `${map.id} propsPuzzle thiếu requiredRescues`);
      assert.ok(map.propsPuzzle.requiredRescues.length >= 2, `${map.id} propsPuzzle phải yêu cầu ít nhất 2 bạn được giải cứu`);

      // Kiểm tra các encounter được yêu cầu thực sự tồn tại trong map
      const encounterIds = map.encounters.map(e => e.id);
      map.propsPuzzle.requiredRescues.forEach(reqId => {
        assert.ok(encounterIds.includes(reqId), `${map.id} propsPuzzle yêu cầu encounter không tồn tại: ${reqId}`);
      });
    });
    console.log('✓ Test 1 Passed: All 6 maps have valid storyIntro & propsPuzzle matching encounters');
  }

  // Test 2: Kiểm tra Boss 2 pha của cả 6 vùng
  {
    maps.forEach(map => {
      assert.ok(map.boss, `${map.id} phải có Boss`);
      assert.ok(Array.isArray(map.boss.phases), `${map.id} Boss phải có mảng phases`);
      assert.strictEqual(map.boss.phases.length, 2, `${map.id} Boss phải có đúng 2 pha thử thách`);

      map.boss.phases.forEach(p => {
        assert.ok(p.questionId, `${map.id} Boss phase ${p.phase} thiếu questionId`);
        assert.ok(QUESTION_BANK[p.questionId], `${map.id} Boss question không tồn tại trong QUESTION_BANK: ${p.questionId}`);
      });
    });
    console.log('✓ Test 2 Passed: All 6 maps have verified 2-phase Bosses with valid questions');
  }

  // Test 3: Cơ chế chống lặp câu hỏi ngẫu nhiên cho tất cả các vùng
  {
    ['map1', 'map2', 'map3', 'map4', 'map5', 'map6'].forEach(mapId => {
      const q1 = getRandomZoneQuestion(mapId, []);
      assert.ok(q1, `${mapId} phải trả về câu hỏi hợp lệ`);
      assert.ok(q1.id.startsWith(`q_${mapId}_`), `${mapId} câu hỏi phải đúng tiền tố zone`);

      // Chọn câu hỏi tiếp theo loại trừ q1
      const q2 = getRandomZoneQuestion(mapId, [q1.id]);
      assert.ok(q2, `${mapId} phải trả về câu hỏi thay thế`);
      assert.notStrictEqual(q2.id, q1.id, `${mapId} anti-repeat selector không được trả về câu vừa xuất hiện`);
    });
    console.log('✓ Test 3 Passed: Anti-repeat question selection across all 6 zones');
  }

  // Test 4: Chuỗi mở khóa liên vùng từ Vùng 1 đến Vùng 6
  {
    const state = getDefaultGameState();
    const prog = new ProgressionSystem(state);

    assert.strictEqual(prog.isMapUnlocked('map1'), true);
    assert.strictEqual(prog.isMapUnlocked('map2'), false);

    // Vùng 1 -> Vùng 2
    prog.unlockMap(MAPS_CONFIG.map1.boss.reward.unlockMap);
    assert.strictEqual(prog.isMapUnlocked('map2'), true);

    // Vùng 2 -> Vùng 3
    prog.unlockMap(MAPS_CONFIG.map2.boss.reward.unlockMap);
    assert.strictEqual(prog.isMapUnlocked('map3'), true);

    // Vùng 3 -> Vùng 4
    prog.unlockMap(MAPS_CONFIG.map3.boss.reward.unlockMap);
    assert.strictEqual(prog.isMapUnlocked('map4'), true);

    // Vùng 4 -> Vùng 5
    prog.unlockMap(MAPS_CONFIG.map4.boss.reward.unlockMap);
    assert.strictEqual(prog.isMapUnlocked('map5'), true);

    // Vùng 5 -> Vùng 6
    prog.unlockMap(MAPS_CONFIG.map5.boss.reward.unlockMap);
    assert.strictEqual(prog.isMapUnlocked('map6'), true);

    // Vùng 6 boss reward unlockMap là null (mở Grand Finale)
    assert.strictEqual(MAPS_CONFIG.map6.boss.reward.unlockMap, null);
    console.log('✓ Test 4 Passed: Linear campaign progression chain from Zone 1 to Zone 6');
  }
}
