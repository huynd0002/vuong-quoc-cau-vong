import assert from 'node:assert/strict';
import { BackpackSystem, defaultBackpackState, normalizeBackpackState } from '../../game/systems/backpackSystem.js';
import { BACKPACKS, BACKPACK_SLOTS_COUNT, getBackpack } from '../../content/backpacks/backpackData.js';

class MockSaveAdapter {
  constructor(initialState = {}) {
    this.state = initialState;
  }
  load() {
    return JSON.parse(JSON.stringify(this.state));
  }
  save(next) {
    this.state = JSON.parse(JSON.stringify(next));
  }
}

export function runBackpackSystemTests() {
  console.log('--- [Test] Hệ Thống 4 Ô Balo & Mở Rộng Túi Đồ (3-5-7-9) ---');

  // Test 1: Config & Data
  assert.equal(BACKPACK_SLOTS_COUNT, 4, 'Phải có đúng 4 ô Balo theo hình vẽ của người dùng');
  assert.equal(BACKPACKS.length, 4, 'Phải có ít nhất 4 loại Balo');
  assert.deepEqual(
    BACKPACKS.map(b => b.slotsBonus),
    [3, 5, 7, 9],
    'Các loại Balo phải mở thêm ô lần lượt 3 - 5 - 7 - 9'
  );
  assert.deepEqual(
    BACKPACKS.map(b => b.costStars),
    [30, 70, 130, 220],
    'Giá mua bằng Sao phải tăng dần từ nhỏ đến lớn (30 - 70 - 130 - 220)'
  );
  console.log('✓ Test 1 Passed: 4 loại Balo cấu hình đúng chuẩn 3 - 5 - 7 - 9 ô và giá Sao tăng lên 30 - 70 - 130 - 220');

  // Test 2: Default state & normalization
  const defaultState = defaultBackpackState();
  assert.deepEqual(defaultState.owned, []);
  assert.equal(defaultState.equipped.length, 4);
  assert.deepEqual(defaultState.equipped, [null, null, null, null]);

  const normalized = normalizeBackpackState({
    owned: ['backpack_bunny_pink', 'backpack_bunny_pink', 'invalid_id'],
    equipped: ['backpack_bunny_pink', 'backpack_bunny_pink', 'invalid_id', null]
  });
  assert.deepEqual(normalized.owned, ['backpack_bunny_pink', 'backpack_bunny_pink']);
  assert.deepEqual(normalized.equipped, ['backpack_bunny_pink', 'backpack_bunny_pink', null, null]);
  console.log('✓ Test 2 Passed: Khởi tạo và chuẩn hóa trạng thái 4 ô cho phép trùng loại Balo an toàn');

  // Test 3: Buy backpack with stars & auto-equip
  const adapter = new MockSaveAdapter({
    player: { stars: 100 },
    fishing: { shells: 100 }
  });
  const system = new BackpackSystem(adapter);

  assert.equal(system.getStars(), 100);
  assert.equal(system.getTotalBonusSlots(), 0, 'Chưa đeo balo nào thì bonus = 0');

  // Mua Balo 1 lần thứ 1 (30 stars -> +3 slots)
  const buy1 = system.buyBackpack('backpack_bunny_pink');
  assert.ok(buy1.ok);
  assert.equal(system.getStars(), 70);
  assert.equal(system.getTotalBonusSlots(), 3, 'Balo 1 tự đeo vào Ô 1 -> mở +3 ô');
  assert.equal(system.getState().equipped[0], 'backpack_bunny_pink');

  // MUA NHIỀU CÁI GIỐNG NHAU: Mua Balo Thỏ lần thứ 2 (30 stars -> +3 slots)
  const buy1_second = system.buyBackpack('backpack_bunny_pink');
  assert.ok(buy1_second.ok, 'Phải mua được chiếc Balo Thỏ thứ 2');
  assert.equal(system.getStars(), 40);
  assert.equal(system.getState().equipped[1], 'backpack_bunny_pink', 'Tự động đeo Balo Thỏ thứ 2 vào Ô 2');
  assert.equal(system.getTotalBonusSlots(), 6, 'Đeo 2 Balo Thỏ giống nhau -> tổng bonus = 6 ô');
  console.log('✓ Test 3 Passed: Mua nhiều Balo giống nhau thành công, đeo được nhiều cái giống nhau vào các ô!');

  // Test 4: Mua các loại Balo khác và lấp đầy 4 ô
  adapter.state.player.stars = 1000;
  adapter.state.fishing.shells = 1000;

  const buyFrog = system.buyBackpack('backpack_frog_green'); // 130 stars -> Ô 3
  assert.ok(buyFrog.ok);
  assert.equal(system.getState().equipped[2], 'backpack_frog_green');

  const buyRainbow = system.buyBackpack('backpack_rainbow_wings'); // 220 stars -> Ô 4
  assert.ok(buyRainbow.ok);
  assert.equal(system.getState().equipped[3], 'backpack_rainbow_wings');

  // Đeo đủ 4 ô: [Balo Thỏ (+3), Balo Thỏ (+3), Balo Ếch (+7), Balo Cầu Vồng (+9)] -> Tổng: 3 + 3 + 7 + 9 = 22
  assert.equal(system.getTotalBonusSlots(), 22, 'Bonus 4 ô = 22 ô');
  console.log('✓ Test 4 Passed: Trang bị tối đa 4 ô Balo với các loại giống và khác nhau (tổng 22 ô)');

  // Test 5: Mua khi cả 4 ô đã đầy -> Balo mới vào túi đồ, có thể thay thế vào ô
  const buyRainbow2 = system.buyBackpack('backpack_rainbow_wings'); // Mua thêm 1 Balo Cầu Vồng nữa
  assert.ok(buyRainbow2.ok);
  assert.equal(buyRainbow2.autoEquippedSlot, -1, '4 ô đã đầy nên không tự động đeo');
  assert.equal(system.getState().equipped[0], 'backpack_bunny_pink');

  // Thay thế Ô 1 (Balo Thỏ) bằng Balo Cầu Vồng mới mua
  const replaceRes = system.equipBackpack('backpack_rainbow_wings', 0);
  assert.ok(replaceRes.ok);
  assert.equal(system.getState().equipped[0], 'backpack_rainbow_wings');
  // Lúc này 4 ô: [Cầu Vồng (+9), Thỏ (+3), Ếch (+7), Cầu Vồng (+9)] -> Tổng: 28 ô!
  assert.equal(system.getTotalBonusSlots(), 28);
  console.log('✓ Test 5 Passed: Mua thêm Balo khi đầy ô cất vào túi, thay thế vào ô thành công');

  // Test 6: Unequip & Swap slots
  const unequipRes = system.unequipSlot(0);
  assert.ok(unequipRes.ok);
  assert.equal(system.getState().equipped[0], null);
  assert.equal(system.getTotalBonusSlots(), 19);

  // Hoán đổi ô 1 và ô 3
  system.swapSlots(1, 3);
  assert.equal(system.getState().equipped[1], 'backpack_rainbow_wings');
  assert.equal(system.getState().equipped[3], 'backpack_bunny_pink');
  console.log('✓ Test 6 Passed: Tháo gỡ và hoán đổi vị trí ô Balo hoạt động hoàn hảo');

  // Test 7: Từ chối khi không đủ sao
  adapter.state.player.stars = 5;
  adapter.state.fishing.shells = 5;
  const brokeBuy = system.buyBackpack('backpack_rainbow_wings');
  assert.equal(brokeBuy.ok, false);
  assert.equal(brokeBuy.reason, 'not_enough_stars');
  console.log('✓ Test 7 Passed: Chặn khi không đủ Sao an toàn');

  console.log('🎉 TẤT CẢ 7/7 TEST CỦA BACKPACK SYSTEM ĐỀU ĐẠT CHUẨN XUẤT SẮC!');
}

if (process.argv[1]?.endsWith('backpackSystem.test.js')) {
  runBackpackSystemTests();
}
