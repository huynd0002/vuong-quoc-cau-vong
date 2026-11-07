import assert from 'node:assert/strict';
import { SaveAdapter, migrateV1toV2, getDefaultGameState } from '../../services/save/saveAdapter.js';

export function runSaveAdapterTests() {
  console.log('--- [Test] SaveAdapter & Migration ---');

  // Test 1: Khởi tạo mặc định khi không có dữ liệu
  const adapter = new SaveAdapter('TEST_SAVE_KEY_EMPTY');
  adapter.reset();
  const defaultState = adapter.load();
  assert.equal(defaultState.version, 2, 'Default state must have version 2');
  assert.equal(defaultState.player.name, 'Bé Sâu', 'Player name must be Bé Sâu');
  assert.equal(defaultState.pet.name, 'Bé Cún', 'Pet name must be Bé Cún');
  assert.deepEqual(defaultState.campaign.unlockedMaps, ['map1'], 'Initial unlocked map is map1');
  console.log('✓ Test 1 Passed: Default state load');

  // Test 2: Lưu và nạp state mới
  defaultState.player.stars = 25;
  defaultState.player.level = 3;
  adapter.save(defaultState);

  const reloaded = adapter.load();
  assert.equal(reloaded.player.stars, 25, 'Reloaded stars must match');
  assert.equal(reloaded.player.level, 3, 'Reloaded level must match');
  console.log('✓ Test 2 Passed: Save and reload V2 state');

  // Test 3: Migration từ save V1 cũ sang Schema V2
  const legacyV1 = {
    playerLevel: 4,
    playerExp: 80,
    coins: 150,
    unlockedMaps: ['map1', 'map2'],
    pet: {
      hunger: 95,
      clean: 70,
      energy: 85,
      hearts: 3,
      level: 2,
      xp: 20
    }
  };

  const migrated = migrateV1toV2(legacyV1);
  assert.equal(migrated.version, 2, 'Migrated version must be 2');
  assert.equal(migrated.player.level, 4, 'Migrated player level must be 4');
  assert.equal(migrated.player.stars, 150, 'Coins must migrate to stars');
  assert.equal(migrated.pet.affinity, 3, 'Hearts must migrate to affinity');
  assert.equal(migrated.pet.level, 2, 'Pet level must migrate');
  assert.deepEqual(migrated.campaign.unlockedMaps, ['map1', 'map2'], 'Unlocked maps preserved');
  console.log('✓ Test 3 Passed: Legacy V1 to V2 migration');

  // Test 4: Xử lý dữ liệu hỏng / corrupt an toàn
  const corruptAdapter = new SaveAdapter('TEST_CORRUPT_KEY');
  corruptAdapter.storage.setItem('TEST_CORRUPT_KEY', '{not_valid_json');
  const safeState = corruptAdapter.load();
  assert.equal(safeState.version, 2, 'Must return default state without throwing');
  assert.equal(safeState.player.level, 1, 'Default player level on corrupt data');
  console.log('✓ Test 4 Passed: Corrupt data fallback');

  // Test 5: Lưu dữ liệu cố định theo tên nhân vật bé đặt (Multi-Profile Isolation)
  const profileAdapter = new SaveAdapter('TEST_MULTI_PROFILE_KEY');
  profileAdapter.reset();

  // Tạo và lưu tiến trình cho "Bé Sam"
  const samState = profileAdapter.loadProfile('Bé Sam');
  samState.player.level = 5;
  samState.player.exp = 40;
  samState.player.stars = 99;
  samState.player.selectedSkin = 'knight';
  profileAdapter.saveProfile('Bé Sam', samState);

  // Tạo và lưu tiến trình cho "Bé Bắp"
  const bapState = profileAdapter.loadProfile('Bé Bắp');
  bapState.player.level = 2;
  bapState.player.exp = 10;
  bapState.player.stars = 12;
  bapState.player.selectedSkin = 'default';
  profileAdapter.saveProfile('Bé Bắp', bapState);

  // Đổi active profile và nạp lại để kiểm tra tính cố định & độc lập
  const reloadedSam = profileAdapter.loadProfile('Bé Sam');
  assert.equal(reloadedSam.player.name, 'Bé Sam', 'Name must be Bé Sam');
  assert.equal(reloadedSam.player.level, 5, 'Bé Sam level must be 5');
  assert.equal(reloadedSam.player.stars, 99, 'Bé Sam stars must be 99');
  assert.equal(reloadedSam.player.selectedSkin, 'knight', 'Bé Sam skin must be knight');

  const reloadedBap = profileAdapter.loadProfile('Bé Bắp');
  assert.equal(reloadedBap.player.name, 'Bé Bắp', 'Name must be Bé Bắp');
  assert.equal(reloadedBap.player.level, 2, 'Bé Bắp level must be 2');
  assert.equal(reloadedBap.player.stars, 12, 'Bé Bắp stars must be 12');
  assert.equal(reloadedBap.player.selectedSkin, 'default', 'Bé Bắp skin must be default');

  const profilesList = profileAdapter.listProfiles();
  const profileNames = profilesList.map(p => p.name);
  assert.ok(profileNames.includes('Bé Sam'), 'Profiles list must contain Bé Sam');
  assert.ok(profileNames.includes('Bé Bắp'), 'Profiles list must contain Bé Bắp');
  console.log('✓ Test 5 Passed: Multi-profile name-based persistent storage');

  adapter.reset();
  corruptAdapter.reset();
  profileAdapter.reset();
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runSaveAdapterTests();
}
