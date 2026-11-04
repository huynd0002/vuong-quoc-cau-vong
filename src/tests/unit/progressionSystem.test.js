import assert from 'node:assert/strict';
import { ProgressionSystem, EXP_PER_LEVEL } from '../../game/systems/progressionSystem.js';
import { getDefaultGameState } from '../../services/save/saveAdapter.js';

export function runProgressionSystemTests() {
  console.log('--- [Test] Progression System ---');

  const state = getDefaultGameState();
  const sys = new ProgressionSystem(state);

  // Test 1: Thêm phần thưởng sao và exp
  const rewardRes = sys.addReward({ stars: 5, exp: 20, gems: 2 });
  assert.equal(rewardRes.starsGained, 5);
  assert.equal(rewardRes.expGained, 20);
  assert.equal(sys.getPlayer().stars, 5);
  assert.equal(sys.getPlayer().exp, 20);
  assert.equal(rewardRes.leveledUp, false);
  console.log('✓ Test 1 Passed: Add rewards');

  // Test 2: Thăng cấp khi đủ EXP
  const levelUpRes = sys.addReward({ exp: 35 }); // Tổng 55 EXP >= 50
  assert.equal(levelUpRes.leveledUp, true);
  assert.equal(sys.getPlayer().level, 2);
  assert.equal(sys.getPlayer().exp, 5); // 55 - 50 = 5
  console.log('✓ Test 2 Passed: Level up calculation');

  // Test 3: Mở khóa bản đồ
  assert.equal(sys.isMapUnlocked('map1'), true);
  assert.equal(sys.isMapUnlocked('map2'), false);

  const unlocked = sys.unlockMap('map2');
  assert.equal(unlocked, true);
  assert.equal(sys.isMapUnlocked('map2'), true);

  const duplicate = sys.unlockMap('map2');
  assert.equal(duplicate, false, 'Do not duplicate unlocked map');
  console.log('✓ Test 3 Passed: Map unlocking');

  // Test 4: Giải cứu bạn bè
  const firstRescue = sys.rescueFriend('enc_test', 'Bạn Mầm');
  assert.equal(firstRescue, true, 'First rescue must return true');

  const repeatRescue = sys.rescueFriend('enc_test', 'Bạn Mầm');
  assert.equal(repeatRescue, false, 'Repeat rescue returns false');
  console.log('✓ Test 4 Passed: Friend rescue tracking');

  // Test 5: Ngoại trang & Nâng cấp nhân vật khi lên cấp
  assert.equal(levelUpRes.unlockedNewSkin, 'knight', 'Knight skin must be unlocked on Level 2');
  assert.deepEqual(sys.getUnlockedSkins(), ['default', 'knight'], 'Both default and knight skins should be unlocked');
  assert.equal(sys.getSelectedSkin(), 'default', 'Initial selected skin is default');
  
  const switched = sys.setSelectedSkin('knight');
  assert.equal(switched, true, 'Switch to knight skin should succeed');
  assert.equal(sys.getSelectedSkin(), 'knight', 'Selected skin must now be knight');

  const skinsList = sys.getAvailableSkins();
  assert.equal(skinsList.length, 2, 'Must have 2 available skins');
  assert.equal(skinsList[0].id, 'default');
  assert.equal(skinsList[1].id, 'knight');
  assert.equal(skinsList[1].selected, true);
  assert.equal(skinsList[1].unlocked, true);
  console.log('✓ Test 5 Passed: Character upgrade & skin selector system');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runProgressionSystemTests();
}
