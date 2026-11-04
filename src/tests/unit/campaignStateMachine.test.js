/**
 * Unit Tests: Giai đoạn 4 — Campaign Graph, State Machine, Quest Flags & Parental Gate
 */

import assert from 'node:assert';
import {
  CAMPAIGN_ZONES,
  GRAND_FINALE,
  isZoneUnlockable,
  isZoneCompleted,
  canAccessGrandFinale,
  getCampaignProgress
} from '../../content/campaign/campaignGraph.js';
import { GameStateMachine, GAME_STATES } from '../../game/systems/gameStateMachine.js';
import { ProgressionSystem } from '../../game/systems/progressionSystem.js';
import { SaveAdapter, getDefaultGameState } from '../../services/save/saveAdapter.js';
import { ParentalGateModal } from '../../game/ui/ParentalGateModal.js';

export function runCampaignStateMachineTests() {
  console.log('--- [Test] Giai đoạn 4: Campaign, State Machine & Lưu trữ ---');

  // Test 1: Campaign Graph Unlock & Prerequisites
  {
    const state = getDefaultGameState();
    assert.strictEqual(isZoneUnlockable('map1', state), true, 'Map 1 phải mở mặc định');
    assert.strictEqual(isZoneUnlockable('map2', state), false, 'Map 2 chưa thể mở khi Map 1 chưa hoàn thành');

    // Giả lập hoàn thành Map 1
    state.campaign.completedMaps.push('map1');
    assert.strictEqual(isZoneUnlockable('map2', state), true, 'Map 2 mở khóa sau khi Map 1 hoàn thành');
    assert.strictEqual(isZoneUnlockable('map3', state), false, 'Map 3 vẫn khóa khi Map 2 chưa hoàn thành');
    console.log('✓ Test 1 Passed: Campaign Graph unlock rules');
  }

  // Test 2: Story Items & Grand Finale requirements
  {
    const state = getDefaultGameState();
    assert.strictEqual(canAccessGrandFinale(state), false, 'Chưa thể mở Finale khi chưa có pha lê');

    // Thêm dần 6 pha lê
    const crystals = ['crystal_red', 'crystal_orange', 'crystal_yellow', 'crystal_green', 'crystal_blue'];
    state.campaign.storyItems = [...crystals];
    assert.strictEqual(canAccessGrandFinale(state), false, '5 viên pha lê vẫn chưa đủ');

    state.campaign.storyItems.push('crystal_purple');
    assert.strictEqual(canAccessGrandFinale(state), true, 'Đủ 6 viên pha lê mở khóa Grand Finale');

    const progress = getCampaignProgress(state);
    assert.strictEqual(progress.collectedCrystals, 6);
    assert.strictEqual(progress.canFinale, true);
    console.log('✓ Test 2 Passed: 6 Crystals & Grand Finale condition');
  }

  // Test 3: Quest Flags & Learning Stats in ProgressionSystem
  {
    const state = getDefaultGameState();
    const prog = new ProgressionSystem(state);

    assert.strictEqual(prog.getQuestFlag('flower_gate_opened'), false);
    prog.setQuestFlag('flower_gate_opened', true);
    assert.strictEqual(prog.getQuestFlag('flower_gate_opened'), true);

    // Learning stats
    prog.recordLearningAnswer('colors', true);
    prog.recordLearningAnswer('colors', false);
    prog.recordLearningAnswer('shapes', true);

    const summary = prog.getLearningSummary();
    assert.strictEqual(summary.totalAnswers, 3);
    assert.strictEqual(summary.firstTryCount, 2);
    assert.strictEqual(summary.skillsPracticed['colors'], 2);
    assert.strictEqual(summary.skillsPracticed['shapes'], 1);
    assert.strictEqual(summary.accuracy, 67);
    console.log('✓ Test 3 Passed: Quest flags and Learning stats tracking');
  }

  // Test 4: Game State Machine (FSM) Transitions & Rejections
  {
    const fsm = new GameStateMachine(GAME_STATES.BOOT);
    assert.strictEqual(fsm.getState(), GAME_STATES.BOOT);

    // Hợp lệ: BOOT -> WORLD_EXPLORATION
    assert.strictEqual(fsm.canTransitionTo(GAME_STATES.WORLD_EXPLORATION), true);
    assert.strictEqual(fsm.transition(GAME_STATES.WORLD_EXPLORATION), true);
    assert.strictEqual(fsm.getState(), GAME_STATES.WORLD_EXPLORATION);

    // Hợp lệ: WORLD_EXPLORATION -> PET_CARE
    assert.strictEqual(fsm.transition(GAME_STATES.PET_CARE), true);
    assert.strictEqual(fsm.getState(), GAME_STATES.PET_CARE);
    assert.strictEqual(fsm.isModalActive(), true);

    // Bất hợp lệ: PET_CARE -> BOSS_BATTLE (Phải quay về WORLD_EXPLORATION trước)
    assert.strictEqual(fsm.canTransitionTo(GAME_STATES.BOSS_BATTLE), false);
    assert.strictEqual(fsm.transition(GAME_STATES.BOSS_BATTLE), false);
    assert.strictEqual(fsm.getState(), GAME_STATES.PET_CARE);

    // Hợp lệ: PET_CARE -> WORLD_EXPLORATION
    assert.strictEqual(fsm.transition(GAME_STATES.WORLD_EXPLORATION), true);

    // Khẩn cấp: recoverToExploration
    fsm.recoverToExploration();
    assert.strictEqual(fsm.getState(), GAME_STATES.WORLD_EXPLORATION);
    console.log('✓ Test 4 Passed: FSM transitions, guard rejections, and recovery');
  }

  // Test 5: Replay Zone without progress loss
  {
    const saveAdapter = new SaveAdapter('TEST_REPLAY_SAVE');
    const state = getDefaultGameState();
    state.player.stars = 25;
    state.player.level = 3;
    state.campaign.unlockedMaps = ['map1', 'map2'];
    state.campaign.completedMaps = ['map1'];
    state.campaign.storyItems = ['crystal_red'];
    saveAdapter.save(state);

    const prog = new ProgressionSystem(saveAdapter.load());
    assert.strictEqual(prog.isMapCompleted('map1'), true);

    // Chơi lại map1
    assert.strictEqual(prog.setCurrentMap('map1'), true);
    // Nhận thêm sao khi chơi lại
    prog.addReward({ stars: 2, exp: 20 });
    saveAdapter.save(prog.state);

    const reloaded = saveAdapter.load();
    assert.strictEqual(reloaded.player.stars, 27);
    assert.strictEqual(reloaded.campaign.completedMaps.includes('map1'), true);
    assert.strictEqual(reloaded.campaign.unlockedMaps.includes('map2'), true);
    assert.strictEqual(reloaded.campaign.storyItems.includes('crystal_red'), true);
    console.log('✓ Test 5 Passed: Replay zone preserves all progress and rewards');
  }

  // Test 6: Parental Gate Challenge generation
  {
    const gate = new ParentalGateModal();
    const challenge = gate.generateChallenge();
    assert.ok(challenge.questionText.length > 0);
    assert.ok(typeof challenge.answer === 'number');
    assert.ok(challenge.answer > 0);
    console.log('✓ Test 6 Passed: Parental gate challenge generation');
  }
}
