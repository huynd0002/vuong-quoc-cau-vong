import assert from 'assert';
import {
  FashionSystem,
  ACCESSORIES_CATALOG,
  defaultFashionState,
  normalizeFashionState
} from '../../game/systems/fashionSystem.js';

export function runFashionSystemTests() {
  console.log('--- TEST BỘ HỆ THỐNG PHỤ KIỆN THỜI TRANG CẦU VỒNG (AI GENERATIVE ACCESSORIES) ---');

  function createMockSaveAdapter(initialStars = 20) {
    let state = {
      player: { stars: initialStars },
      campaign: { stars: initialStars },
      fashion: defaultFashionState()
    };
    return {
      load() {
        return JSON.parse(JSON.stringify(state));
      },
      save(newState) {
        state = JSON.parse(JSON.stringify(newState));
      },
      getState() {
        return state;
      }
    };
  }

  // 1. Khởi tạo mặc định
  {
    const mockSave = createMockSaveAdapter(10);
    const sys = new FashionSystem(mockSave);
    const st = sys.getState();

    assert.strictEqual(st.currentAccessory, null, 'Ban đầu chưa đeo phụ kiện nào');
    assert.strictEqual(st.ownedAccessories.length, 0, 'Mới bắt đầu chưa có phụ kiện trong tủ');
    assert.strictEqual(st.wardrobePresets.length, 3, 'Khởi tạo sẵn 3 ngăn tủ đồ');
    assert.strictEqual(st.album.length, 0, 'Album ảnh ban đầu trống');
    console.log('  ✓ 1. Khởi tạo mặc định chính xác');
  }

  // 2. Mua phụ kiện bằng Sao
  {
    const mockSave = createMockSaveAdapter(15);
    const sys = new FashionSystem(mockSave);

    // Mua Mũ Vành Hoa Cúc (12 Sao)
    const buyRes = sys.purchaseAccessory('acc_straw_hat');
    assert.strictEqual(buyRes.success, true, 'Mua thành công');
    assert.strictEqual(buyRes.accessory.price, 12, 'Giá đúng 12 sao');
    assert.strictEqual(sys.getPlayerStars(), 3, 'Số sao còn lại: 15 - 12 = 3');
    assert.ok(sys.isAccessoryOwned('acc_straw_hat'), 'Đã sở hữu Mũ Vành Hoa Cúc');

    // Mua lại lần 2 -> không trừ sao
    const buyAgain = sys.purchaseAccessory('acc_straw_hat');
    assert.strictEqual(buyAgain.success, false, 'Không mua lại món đã có');
    assert.strictEqual(sys.getPlayerStars(), 3, 'Không bị trừ sao thêm lần nữa');

    // Không đủ sao mua Vòng Thiên Thần (100 sao, chỉ còn 3 sao)
    const buyExpensive = sys.purchaseAccessory('acc_angel_halo');
    assert.strictEqual(buyExpensive.success, false, 'Không đủ sao thì mua thất bại');
    assert.strictEqual(sys.getPlayerStars(), 3, 'Số sao được bảo toàn');
    console.log('  ✓ 2. Giao dịch trừ đúng Sao, sở hữu vĩnh viễn, không trừ 2 lần');
  }

  // 3. Đeo (Equip) & Tháo (Unequip) phụ kiện lên nhân vật
  {
    const mockSave = createMockSaveAdapter(20);
    const sys = new FashionSystem(mockSave);

    sys.purchaseAccessory('acc_cat_ears_bow');
    const equipRes = sys.equipAccessory('acc_cat_ears_bow');
    assert.strictEqual(equipRes.success, true);
    assert.strictEqual(sys.getState().currentAccessory, 'acc_cat_ears_bow');

    // Tháo phụ kiện
    const unequipRes = sys.unequipAccessory();
    assert.strictEqual(unequipRes.success, true);
    assert.strictEqual(sys.getState().currentAccessory, null);

    // Thử đeo phụ kiện chưa mua -> thất bại
    const failEquip = sys.equipAccessory('acc_rainbow_crown');
    assert.strictEqual(failEquip.success, false);
    assert.strictEqual(sys.getState().currentAccessory, null);
    console.log('  ✓ 3. Đeo và tháo phụ kiện chuẩn xác, chặn món chưa sở hữu');
  }

  // 4. Tủ đồ cá nhân (Wardrobe Presets - tối đa 3 ngăn)
  {
    const mockSave = createMockSaveAdapter(50);
    const sys = new FashionSystem(mockSave);

    sys.purchaseAccessory('acc_straw_hat');
    sys.purchaseAccessory('acc_heart_glasses');

    sys.saveWardrobePreset(0, 'Ngăn 1: Mũ Hoa Cúc', 'acc_straw_hat');
    sys.saveWardrobePreset(1, 'Ngăn 2: Kính Trái Tim', 'acc_heart_glasses');
    sys.saveWardrobePreset(2, 'Ngăn 3: Trống', null);

    const presets = sys.getState().wardrobePresets;
    assert.strictEqual(presets.length, 3, 'Lưu đúng 3 ngăn');
    assert.strictEqual(presets[0].accessoryId, 'acc_straw_hat');
    assert.strictEqual(presets[1].accessoryId, 'acc_heart_glasses');

    // Áp dụng phụ kiện từ ngăn 1
    const applyRes = sys.applyWardrobePreset(1);
    assert.strictEqual(applyRes.success, true);
    assert.strictEqual(sys.getState().currentAccessory, 'acc_heart_glasses');
    console.log('  ✓ 4. Quản lý 3 ngăn tủ đồ phụ kiện yêu thích chuẩn xác');
  }

  // 5. Bảng mục tiêu dành dụm (Savings Goal)
  {
    const mockSave = createMockSaveAdapter(20);
    const sys = new FashionSystem(mockSave);

    sys.setSavingsGoal('acc_rainbow_crown');
    const progress = sys.getSavingsGoalProgress();

    assert.strictEqual(progress.accessory.id, 'acc_rainbow_crown');
    assert.strictEqual(progress.targetStars, 50);
    assert.strictEqual(progress.currentStars, 20);
    assert.strictEqual(progress.remainingStars, 30);
    assert.strictEqual(progress.canAfford, false);
    assert.strictEqual(progress.progressPct, 40);
    console.log('  ✓ 5. Bảng mục tiêu dành dụm tính đúng tiến độ Sao');
  }

  // 6. Album ảnh kỷ niệm (Photo Album - Tối đa 24 ảnh)
  {
    const mockSave = createMockSaveAdapter(10);
    const sys = new FashionSystem(mockSave);

    const photo = sys.addPhotoToAlbum({
      accessoryId: 'acc_straw_hat',
      caption: 'Kỷ niệm dạo Phố Phụ Kiện',
      frameStyle: 'rainbow_sparkle'
    });
    assert.ok(photo.id);
    assert.strictEqual(sys.getState().album.length, 1);
    console.log('  ✓ 6. Lưu ảnh kỷ niệm vào Album thành công');
  }

  // 7. Chuẩn hóa trạng thái save (normalizeFashionState)
  {
    const normalized = normalizeFashionState(null);
    assert.strictEqual(normalized.currentAccessory, null);
    assert.strictEqual(normalized.ownedAccessories.length, 0);

    const partial = normalizeFashionState({
      currentAccessory: 'acc_straw_hat',
      ownedAccessories: ['acc_straw_hat']
    });
    assert.strictEqual(partial.currentAccessory, 'acc_straw_hat');
    assert.strictEqual(partial.ownedAccessories.length, 1);
    assert.ok(Array.isArray(partial.album));
    assert.ok(Array.isArray(partial.wardrobePresets));
    console.log('  ✓ 7. Chuẩn hóa dữ liệu lưu an toàn, chống crash');
  }

  console.log('🎉 TOÀN BỘ 7/7 TEST CỦA HỆ THỐNG PHỤ KIỆN THỜI TRANG ĐỀU ĐẠT CHUẨN XUẤT SẮC!');
}

if (process.argv[1]?.endsWith('fashionSystem.test.js')) {
  runFashionSystemTests();
}
