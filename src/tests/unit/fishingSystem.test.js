/**
 * src/tests/unit/fishingSystem.test.js
 * Unit tests kiểm thử toàn diện hệ thống Câu Cá Hồ Lá Sen, Chợ Cầu Vồng & Tích hợp Nhà Bếp (FISHING_PLAN mục 14.1)
 */

import assert from 'node:assert/strict';
import { SaveAdapter } from '../../services/save/saveAdapter.js';
import { FishingSystem, defaultFishingState, normalizeFishingState } from '../../game/systems/fishingSystem.js';
import { CookingSystem } from '../../game/systems/cookingSystem.js';
import {
  FISH_SPECIES,
  FISHING_LIMITS,
  getRod,
  getFishSpecies,
  getFishMaxStack,
  isSpecialFish,
  calculateFishSellPrice,
  calculateFishPortions,
  rollFishSpeciesAndWeight
} from '../../content/fishing/fishingData.js';
import { getRecipe, INGREDIENTS, calculateDishSellPrice, calculateIngredientSellPrice, calculateDishCost } from '../../content/cooking/recipes.js';
import { BACKPACKS, getBackpack, calculateBackpackSellPrice } from '../../content/backpacks/backpackData.js';
import { ACCESSORIES_CATALOG, calculateAccessorySellPrice } from '../../game/systems/fashionSystem.js';
import { getMapConfig } from '../../content/maps/mapsConfig.js';
import { ProgressionSystem } from '../../game/systems/progressionSystem.js';

export function runFishingSystemTests() {
  console.log('--- [Test] Hệ Thống Câu Cá Hồ Lá Sen & Chợ Cầu Vồng ---');

  const adapter = new SaveAdapter('TEST_FISHING_SYSTEM');
  adapter.reset();

  let nowTs = 50000;
  const fishing = new FishingSystem(adapter, () => {}, () => nowTs);

  // 1. Khởi tạo state mặc định & chuẩn hóa
  {
    const st = fishing.getState();
    assert.equal(st.shells, 0);
    assert.equal(st.starterBorrowed, false);
    assert.equal(st.equippedRod, 'rod_lotus');
    assert.equal(st.equippedBait, 'bait_lotus');
    assert.equal(st.basket.length, 0);
    assert.deepEqual(st.ownedRods, []);

    const corrupted = normalizeFishingState({
      shells: -50,
      starterBorrowed: true,
      ownedRods: ['rod_lotus', 'rod_lotus', 'invalid_rod'],
      baits: { bait_crunchy: 500, bait_sweet_cake: -5 }
    });
    assert.equal(corrupted.shells, 0);
    assert.deepEqual(corrupted.ownedRods, ['rod_lotus']);
    assert.equal(corrupted.baits.bait_crunchy, 99);
    assert.equal(corrupted.baits.bait_sweet_cake, 0);
    console.log('✓ Test 1 Passed: Default & normalized fishing state');
  }

  // 2. Mượn bộ câu khởi đầu miễn phí (idempotent, không tạo bản sao cần trùng)
  {
    const r1 = fishing.borrowStarterKit();
    const r2 = fishing.borrowStarterKit();
    assert.equal(r1.ok, true);
    assert.equal(r2.ok, true);
    const st = fishing.getState();
    assert.equal(st.starterBorrowed, true);
    assert.deepEqual(st.ownedRods, ['rod_lotus']);
    assert.equal(st.shells, 0);
    console.log('✓ Test 2 Passed: Borrow starter kit is free and idempotent');
  }

  // 3. Lượt câu đầu tiên (Tutorial): thoát trước khi cắn không mất mồi; cắn thật khóa Cá Mây Tròn 250g
  {
    const start1 = fishing.startFishingTurn('lotus_dock');
    assert.equal(start1.ok, true);
    assert.equal(fishing.cancelTurnBeforeBite().ok, true);
    assert.equal(fishing.getState().activeTurn, null);

    // Bắt đầu lại và cho cá cắn thật
    assert.equal(fishing.startFishingTurn('lotus_dock').ok, true);
    const bite = fishing.commitRealBite(true);
    assert.equal(bite.ok, true);
    assert.equal(bite.species.id, 'cloud_fish');
    assert.equal(bite.weightG, 250);

    const catchRes = fishing.recordTurnCatch({ keepForCooking: false });
    assert.equal(catchRes.ok, true);
    assert.equal(catchRes.fish.speciesId, 'cloud_fish');
    assert.equal(catchRes.fish.weightG, 250);
    assert.equal(fishing.getState().tutorialCompleted, true);
    assert.equal(fishing.getState().milestones.firstCatch, true);
    assert.equal(fishing.getState().fishBook.cloud_fish.maxWeightG, 250);
    console.log('✓ Test 3 Passed: First tutorial catch, cancel before bite, and FishBook update');
  }

  // 4. Quy tắc tính giá bán cá 1-5 Vỏ Sò & bán cá tại Chợ Cầu Vồng
  {
    assert.equal(calculateFishSellPrice(100), 1);
    assert.equal(calculateFishSellPrice(400), 1);
    assert.equal(calculateFishSellPrice(450), 2);
    assert.equal(calculateFishSellPrice(800), 2);
    assert.equal(calculateFishSellPrice(850), 3);
    assert.equal(calculateFishSellPrice(1300), 3);
    assert.equal(calculateFishSellPrice(1350), 4);
    assert.equal(calculateFishSellPrice(1750), 4);
    assert.equal(calculateFishSellPrice(1800), 5);
    assert.equal(calculateFishSellPrice(2000), 5);

    const fishId = fishing.getState().basket[0].id;
    // Khóa "Giữ để nấu" phải chặn bán nhầm ở chợ
    assert.equal(fishing.setFishKeepForCooking(fishId, true).ok, true);
    assert.equal(fishing.sellFishAtMarket(fishId).reason, 'kept_for_cooking');

    // Mở khóa rồi bán nhận Vỏ Sò
    assert.equal(fishing.setFishKeepForCooking(fishId, false).ok, true);
    const sold = fishing.sellFishAtMarket(fishId);
    assert.equal(sold.ok, true);
    assert.equal(sold.shellsEarned, 1);
    assert.equal(fishing.getState().shells, 1);
    assert.equal(fishing.getState().milestones.firstMarketSale, true);
    console.log('✓ Test 4 Passed: Price brackets, keepForCooking lock, and market sale');
  }

  // 5. Mua cần câu, mua gói mồi & trừ đúng 1 viên mồi trả phí khi cá cắn thật
  {
    // Chưa đủ Vỏ Sò thì từ chối mua Cần Vịt Con (12 Vỏ Sò) và Mồi Hạt Giòn (2 Vỏ Sò)
    assert.equal(fishing.buyRod('rod_duck').reason, 'shells');
    assert.equal(fishing.buyBaitPack('bait_crunchy').reason, 'shells');

    // Cấp 60 Vỏ Sò để kiểm thử mua sắm
    const game = adapter.load();
    game.fishing.shells = 60;
    adapter.save(game, { writeFishing: true });

    const buyDuck = fishing.buyRod('rod_duck');
    assert.equal(buyDuck.ok, true);
    assert.equal(buyDuck.shells, 25);
    assert.equal(fishing.getState().equippedRod, 'rod_duck');

    const buyBait = fishing.buyBaitPack('bait_crunchy');
    assert.equal(buyBait.ok, true);
    assert.equal(buyBait.count, 5);
    assert.equal(buyBait.shells, 10);
    assert.equal(fishing.getState().equippedBait, 'bait_crunchy');

    // Bắt đầu câu với Mồi Hạt Giòn nhưng thoát trước khi cá cắn -> vẫn còn nguyên 5 viên
    assert.equal(fishing.startFishingTurn('sunny_dock').ok, true);
    assert.equal(fishing.cancelTurnBeforeBite().ok, true);
    assert.equal(fishing.getState().baits.bait_crunchy, 5);

    // Cá cắn thật -> trừ đúng 1 viên mồi trả phí (còn 4 viên)
    assert.equal(fishing.startFishingTurn('sunny_dock').ok, true);
    assert.equal(fishing.commitRealBite(false).ok, true);
    assert.equal(fishing.getState().baits.bait_crunchy, 4);
    assert.equal(fishing.recordTurnCatch().ok, true);
    console.log('✓ Test 5 Passed: Rod & bait purchase, bait reservation vs bite consumption');
  }

  // 6. Luật cân nặng bước 50g & chống lặp 3 lần liên tiếp cùng một loài
  {
    for (let i = 0; i < 40; i++) {
      const r = rollFishSpeciesAndWeight({
        baitId: 'bait_sweet_cake',
        dockId: 'sunny_dock',
        recentSpecies: ['rainbow_fish', 'rainbow_fish', 'rainbow_fish']
      });
      assert.notEqual(r.speciesId, 'rainbow_fish', 'Anti-repeat must block 4th consecutive identical species');
      assert.equal(r.weightG % FISHING_LIMITS.WEIGHT_STEP_G, 0, 'Weight must be a multiple of 50g');
      const sp = FISH_SPECIES.find((s) => s.id === r.speciesId);
      assert.ok(r.weightG >= sp.minWeightG && r.weightG <= sp.maxWeightG);
    }
    console.log('✓ Test 6 Passed: 50g weight steps and 3-turn anti-repeat rule');
  }

  // 7. Giới hạn Giỏ Cá tối đa 6 chỗ & Thả cá về hồ
  {
    const s7 = adapter.load(); s7.fishing.baits.bait_lotus = 50; adapter.save(s7);
    while (fishing.getState().basket.length < FISHING_LIMITS.MAX_BASKET_SIZE) {
      assert.equal(fishing.startFishingTurn('lotus_dock').ok, true);
      assert.equal(fishing.commitRealBite(true).ok, true);
      assert.equal(fishing.recordTurnCatch().ok, true);
    }
    assert.equal(fishing.getState().basket.length, 6);
    assert.equal(fishing.startFishingTurn('lotus_dock').reason, 'basket_full');

    const firstId = fishing.getState().basket[0].id;
    const rel = fishing.releaseFish(firstId);
    assert.equal(rel.ok, true);
    assert.equal(fishing.getState().basket.length, 5);
    assert.equal(fishing.getState().milestones.firstRelease, true);
    console.log('✓ Test 7 Passed: Basket capacity limit (6) and pond release');
  }

  // 8. Chuyển cá thành nguyên liệu nấu ăn (`fish`) & nấu 2 món cá mới ở Nhà Bếp
  {
    assert.equal(calculateFishPortions(250), 1);
    assert.equal(calculateFishPortions(600), 2);
    assert.equal(calculateFishPortions(1200), 3);

    const targetFish = fishing.getState().basket[0];
    const expectedPortions = calculateFishPortions(targetFish.weightG);
    const conv = fishing.convertFishToCookingPortions(targetFish.id, true);
    assert.equal(conv.ok, true);
    assert.ok(conv.portionsAdded >= expectedPortions);
    assert.equal(fishing.getState().basket.length, 4);

    // Kiểm tra Nhà Bếp nhận đúng phần cá tươi và nấu được Cháo cá bí đỏ & Cơm cá rau củ
    const game = adapter.load();
    game.player.stars = 100;
    adapter.save(game);

    const cooking = new CookingSystem(adapter, () => {}, () => nowTs);
    assert.ok(cooking.getState().ingredients.fish >= expectedPortions);

    const porridgeRecipe = getRecipe('fish_pumpkin_porridge');
    const riceRecipe = getRecipe('fish_veggie_rice');
    assert.ok(porridgeRecipe, 'Must define fish_pumpkin_porridge');
    assert.ok(riceRecipe, 'Must define fish_veggie_rice');

    for (const item of porridgeRecipe.ingredients) {
      while ((cooking.getState().ingredients[item.id] || 0) < item.count) {
        assert.equal(cooking.buy(item.id).ok, true);
      }
    }
    assert.equal(cooking.completeHandWash().ok, true);
    assert.equal(cooking.start('fish_pumpkin_porridge').ok, true);
    const session = cooking.getState().session;
    for (const item of porridgeRecipe.ingredients) {
      for (let c = 0; c < item.count; c++) {
        assert.equal(cooking.stage(session.id, item.id).ok, true);
      }
    }
    assert.equal(cooking.cookInstant(session.id).ok, true);
    assert.ok(cooking.getState().dishes.some((d) => d.recipeId === 'fish_pumpkin_porridge'));
    console.log('✓ Test 8 Passed: Atomic fish-to-cooking conversion & cooking new fish recipes');
  }

  // 9. Kiểm tra cấu hình 2 Map mới & Lưu/Tải lại qua SaveAdapter
  {
    const pondCfg = getMapConfig('map_fishing_pond');
    const marketCfg = getMapConfig('map_rainbow_market');
    assert.equal(pondCfg.id, 'map_fishing_pond');
    assert.equal(marketCfg.id, 'map_rainbow_market');
    assert.ok(Array.isArray(pondCfg.fishingStations) && pondCfg.fishingStations.length >= 5);
    assert.ok(Array.isArray(marketCfg.marketStations) && marketCfg.marketStations.length >= 4);
    assert.ok(pondCfg.pondWaterZone && pondCfg.pondWaterZone.walkableDockRect, 'Pond water zone must block red pond water while allowing the wooden pier dock');
    const lotusDock = pondCfg.fishingStations.find((s) => s.id === 'station_lotus_dock');
    const fishBook = pondCfg.fishingStations.find((s) => s.id === 'station_fish_book');
    assert.deepEqual(lotusDock.interactionPoint, { x: 688, y: 360 });
    assert.equal(fishBook.x, 985);
    assert.equal(fishBook.y, 230);

    // Kiểm tra mồi bait_lotus cũng trừ đi 1 viên mỗi khi cá cắn câu
    fishing.equipBait('bait_lotus');
    const beforeLotus = fishing.getState().baits.bait_lotus;
    fishing.releaseFish(fishing.getState().basket[0].id);
    assert.equal(fishing.startFishingTurn('lotus_dock').ok, true);
    assert.equal(fishing.commitRealBite(true).ok, true);
    assert.equal(fishing.getState().baits.bait_lotus, beforeLotus - 1, 'Bait in bag must decrement by 1 on bite');
    assert.equal(fishing.recordTurnCatch().ok, true);

    const prog = new ProgressionSystem(adapter.load());
    assert.equal(prog.isMapUnlocked('map_fishing_pond'), true);
    assert.equal(prog.isMapUnlocked('map_rainbow_market'), true);

    const reloadedFishing = new FishingSystem(adapter);
    assert.ok(reloadedFishing.getState().ownedRods.includes('rod_duck'));
    assert.equal(reloadedFishing.getState().baits.bait_crunchy, 0);
    assert.equal(reloadedFishing.getState().equippedBait, 'bait_lotus');
    console.log('✓ Test 9 Passed: New special maps config, progression unlock, and persistence');
  }

  // 10. Mua cần bằng Sao (player.stars) & Cần càng xịn bắt càng nhanh hơn và cá tốt hơn
  {
    const rodLotus = getRod('rod_lotus');
    const rodDuck = getRod('rod_duck');
    const rodRainbow = getRod('rod_rainbow');
    assert.ok(rodLotus.biteTimeMs > rodDuck.biteTimeMs, 'Cần Vịt Con phải bắt nhanh hơn Cần Lá Sen');
    assert.ok(rodDuck.biteTimeMs > rodRainbow.biteTimeMs, 'Cần Cầu Vồng phải bắt nhanh hơn Cần Vịt Con');
    assert.ok(rodRainbow.pullHitsReduction >= 1, 'Cần Cầu Vồng giảm số nhịp kéo còn 1 nhịp');

    // Kiểm tra mua Cần Cầu Vồng (160 Sao) trừ trực tiếp vào game.player.stars
    const gBefore = adapter.load();
    gBefore.player.stars = 250;
    adapter.save(gBefore);

    const buyRb = fishing.buyRod('rod_rainbow');
    assert.equal(buyRb.ok, true);
    assert.equal(buyRb.stars, 90);
    assert.equal(fishing.getStars(), 90);
    assert.equal(adapter.load().player.stars, 90, 'Mua cần phải trừ đúng vào Sao của người chơi');

    // Kiểm tra cần xịn cho cá nặng hơn & tỷ lệ cá quý cao hơn
    let sumWeightLotus = 0;
    let sumWeightRainbow = 0;
    let rareCountLotus = 0;
    let rareCountRainbow = 0;
    const samples = 80;
    for (let i = 0; i < samples; i++) {
      const fakeRng = () => ((i * 37 + 13) % 100) / 100;
      const rLotus = rollFishSpeciesAndWeight({
        baitId: 'bait_lotus',
        dockId: 'lotus_dock',
        rodId: 'rod_lotus',
        rng: fakeRng
      });
      const rRainbow = rollFishSpeciesAndWeight({
        baitId: 'bait_lotus',
        dockId: 'lotus_dock',
        rodId: 'rod_rainbow',
        rng: fakeRng
      });
      sumWeightLotus += rLotus.weightG;
      sumWeightRainbow += rRainbow.weightG;
      if (['sun_spot_fish', 'rainbow_fish', 'silver_bell_fish'].includes(rLotus.speciesId)) {
        rareCountLotus++;
      }
      if (['sun_spot_fish', 'rainbow_fish', 'silver_bell_fish'].includes(rRainbow.speciesId)) {
        rareCountRainbow++;
      }
    }
    assert.ok(sumWeightRainbow > sumWeightLotus, 'Cần Cầu Vồng phải câu được cá có tổng trọng lượng nặng hơn Cần Lá Sen');
    assert.ok(rareCountRainbow > rareCountLotus, 'Cần Cầu Vồng phải câu được nhiều cá tốt/hiếm hơn Cần Lá Sen');
    console.log('✓ Test 10 Passed: Star currency unification & better rods catch faster and better/heavier fish');
  }

  // 11. Hệ thống Xếp Chồng Cá (Stacking) & Cá Đặc Biệt Phát Sáng (Glow & MaxStack 1)
  {
    // 11.1 Kiểm tra cấu hình maxStack từng loài cá
    assert.equal(getFishSpecies('cloud_fish').maxStack, 5, 'Cá nhỏ nhất (Cá Mây Tròn) xếp chồng tối đa 5 con');
    assert.equal(getFishSpecies('lotus_fish').maxStack, 4, 'Cá lớn hơn (Cá Lá Sen) xếp chồng tối đa 4 con');
    assert.equal(getFishSpecies('orange_fish').maxStack, 3, 'Cá tiếp theo (Cá Cam) xếp chồng tối đa 3 con');
    assert.equal(getFishSpecies('silver_bell_fish').maxStack, 3, 'Cá Chuông Bạc xếp chồng tối đa 3 con');
    assert.equal(getFishSpecies('sun_spot_fish').maxStack, 2, 'Cá Đốm Nắng xếp chồng tối đa 2 con');
    
    // Cá đặc biệt
    const rbSp = getFishSpecies('rainbow_fish');
    assert.equal(rbSp.maxStack, 1, 'Cá đặc biệt (Cá Cầu Vồng) chỉ có 1 con thôi (maxStack = 1)');
    assert.equal(rbSp.isSpecial, true, 'Cá Cầu Vồng là cá đặc biệt');
    assert.equal(rbSp.isGlow, true, 'Cá Cầu Vồng phát sáng lung linh');

    // 11.2 Kiểm tra tự động xếp chồng khi câu cá cùng loài
    const testAdapter = new SaveAdapter('TEST_FISHING_STACKING');
    testAdapter.reset();
    testAdapter.save({
      fishing: {
        basket: [],
        seq: 1,
        activeTurn: null,
        baits: { bait_lotus: 99 },
        equippedBait: 'bait_lotus'
      }
    });
    const testFs = new FishingSystem(testAdapter);

    // Bắt cá 1: cloud_fish
    testFs.mutate((f) => {
      f.activeTurn = { dockId: 'lotus_dock', rodId: 'rod_lotus', baitId: 'bait_lotus', speciesId: 'cloud_fish', weightG: 150, biteCommitted: true };
      return { ok: true };
    });
    const c1 = testFs.recordTurnCatch();
    assert.equal(c1.ok, true);
    assert.equal(c1.isStacked, false);
    assert.equal(testFs.getState().basket.length, 1);
    assert.equal(testFs.getState().basket[0].count, 1);

    // Bắt cá 2: cloud_fish -> Tự động xếp chồng lên ô 1 (count: 2)
    testFs.mutate((f) => {
      f.activeTurn = { dockId: 'lotus_dock', rodId: 'rod_lotus', baitId: 'bait_lotus', speciesId: 'cloud_fish', weightG: 200, biteCommitted: true };
      return { ok: true };
    });
    const c2 = testFs.recordTurnCatch();
    assert.equal(c2.ok, true);
    assert.equal(c2.isStacked, true);
    assert.equal(testFs.getState().basket.length, 1, 'Không tốn thêm ô giỏ khi xếp chồng');
    assert.equal(testFs.getState().basket[0].count, 2);
    assert.deepEqual(testFs.getState().basket[0].weights, [150, 200]);

    // Bắt thêm 3 con cloud_fish -> Đạt tối đa 5 con (maxStack = 5)
    for (let i = 3; i <= 5; i++) {
      testFs.mutate((f) => {
        f.activeTurn = { dockId: 'lotus_dock', rodId: 'rod_lotus', baitId: 'bait_lotus', speciesId: 'cloud_fish', weightG: 100 + i * 20, biteCommitted: true };
        return { ok: true };
      });
      const c = testFs.recordTurnCatch();
      assert.equal(c.ok, true);
      assert.equal(c.isStacked, true);
      assert.equal(testFs.getState().basket.length, 1);
      assert.equal(testFs.getState().basket[0].count, i);
    }
    assert.equal(testFs.getState().basket[0].count, 5, 'Đã đạt maxStack 5 con');

    // Bắt con cloud_fish thứ 6 -> Ô 1 đã đầy (5/5) nên phải tạo ô mới (slot 2)
    testFs.mutate((f) => {
      f.activeTurn = { dockId: 'lotus_dock', rodId: 'rod_lotus', baitId: 'bait_lotus', speciesId: 'cloud_fish', weightG: 250, biteCommitted: true };
      return { ok: true };
    });
    const c6 = testFs.recordTurnCatch();
    assert.equal(c6.ok, true);
    assert.equal(c6.isStacked, false);
    assert.equal(testFs.getState().basket.length, 2, 'Tạo ô thứ 2 khi ô đầu đã đầy 5 con');
    assert.equal(testFs.getState().basket[1].count, 1);

    // 11.3 Kiểm tra Cá Đặc Biệt (Cá Cầu Vồng) không xếp chồng
    testFs.mutate((f) => {
      f.activeTurn = { dockId: 'lotus_dock', rodId: 'rod_rainbow', baitId: 'bait_sweet_cake', speciesId: 'rainbow_fish', weightG: 1500, biteCommitted: true };
      return { ok: true };
    });
    const rbCatch1 = testFs.recordTurnCatch();
    assert.equal(rbCatch1.ok, true);
    assert.equal(rbCatch1.isStacked, false);
    assert.equal(rbCatch1.isSpecial, true);
    assert.equal(rbCatch1.isGlow, true);
    assert.equal(testFs.getState().basket[2].count, 1);

    // Thử bắt thêm 1 con Cá Cầu Vồng -> tạo ô riêng chứ không xếp chồng
    testFs.mutate((f) => {
      f.activeTurn = { dockId: 'lotus_dock', rodId: 'rod_rainbow', baitId: 'bait_sweet_cake', speciesId: 'rainbow_fish', weightG: 1800, biteCommitted: true };
      return { ok: true };
    });
    const rbCatch2 = testFs.recordTurnCatch();
    assert.equal(rbCatch2.ok, true);
    assert.equal(rbCatch2.isStacked, false, 'Cá đặc biệt không bao giờ xếp chồng');
    assert.equal(testFs.getState().basket[3].count, 1);

    // 11.4 Kiểm tra kéo thả xếp chồng thủ công (stackFish)
    // Tạo 2 xấp Cá Lá Sen: xấp 1 có 2 con, xấp 2 có 1 con
    testFs.mutate((f) => {
      f.basket.push({
        id: 'fish-lotus-a',
        speciesId: 'lotus_fish',
        weightG: 300,
        weights: [300, 350],
        count: 2
      });
      f.basket.push({
        id: 'fish-lotus-b',
        speciesId: 'lotus_fish',
        weightG: 400,
        weights: [400],
        count: 1
      });
      return { ok: true };
    });
    const mergeRes = testFs.stackFish('fish-lotus-b', 'fish-lotus-a');
    assert.equal(mergeRes.ok, true);
    assert.equal(mergeRes.newTargetCount, 3, 'Gộp 1 con vào 2 con thành 3 con');
    // Ô nguồn b đã được chuyển hết -> bị xóa khỏi giỏ
    assert.equal(testFs.getState().basket.some(f => f.id === 'fish-lotus-b'), false);

    // Chặn xếp chồng khác loài
    const diffRes = testFs.stackFish('fish-lotus-a', testFs.getState().basket[0].id);
    assert.equal(diffRes.ok, false);
    assert.equal(diffRes.reason, 'different_species');

    // Chặn xếp chồng cá đặc biệt
    const specialStack = testFs.stackFish(testFs.getState().basket[2].id, testFs.getState().basket[3].id);
    assert.equal(specialStack.ok, false);
    assert.equal(specialStack.reason, 'cannot_stack_special');

    // 11.5 Bán 1 con từ xấp (sellFishAtMarket với sellAll = false)
    const cloudSlotId = testFs.getState().basket[0].id;
    assert.equal(testFs.getState().basket[0].count, 5);
    const sell1 = testFs.sellFishAtMarket(cloudSlotId, false);
    assert.equal(sell1.ok, true);
    assert.equal(sell1.soldCount, 1);
    assert.equal(sell1.remainingCount, 4);
    assert.equal(testFs.getState().basket[0].count, 4, 'Bán 1 con thì xấp còn lại 4 con');

    // 11.6 Sơ chế 1 con từ xấp (convertFishToCookingPortions)
    const conv1 = testFs.convertFishToCookingPortions(cloudSlotId, false);
    assert.equal(conv1.ok, true);
    assert.equal(conv1.portionsAdded >= 1, true);
    assert.equal(testFs.getState().basket[0].count, 3, 'Sơ chế 1 con thì xấp còn lại 3 con');

    console.log('✓ Test 11 Passed: Hệ thống Xếp Chồng Cá (3-5-7 con theo loài) & Cá Đặc Biệt Phát Sáng (1 con)');

    // =========================================================================
    // Test 12: Bán tất cả các vật phẩm tại quầy bán cá (Dữ liệu bán rồi mất luôn)
    // =========================================================================
    testFs.mutate((fishing, game) => {
      // 1. Setup giỏ cá
      fishing.basket = [
        { id: 'fish-sell-test', speciesId: 'cloud_fish', weightG: 200, count: 1 }
      ];
      // 2. Setup món ăn trong Bếp
      game.cooking = {
        dishes: [
          { id: 'cook-99', recipeId: 'rainbow_sandwich', quality: 3 }
        ],
        ingredients: {
          banana: 2
        }
      };
      // 3. Setup Balo
      game.backpacks = {
        owned: ['backpack_bunny_pink', 'backpack_bunny_pink'],
        equipped: ['backpack_bunny_pink', null, null, null]
      };
      // 4. Setup Phụ kiện
      game.fashion = {
        ownedAccessories: ['acc_rainbow_crown', 'acc_star_glasses'],
        equippedAccessoryId: 'acc_rainbow_crown'
      };
      fishing.shells = 10;
      game.player.stars = 10;
      return { ok: true, writeCooking: true };
    });

    // 12.1 Bán Cá
    const sellFishRes = testFs.sellItemAtMarket('fish', 'fish-sell-test');
    assert.equal(sellFishRes.ok, true);
    assert.equal(testFs.getState().basket.some(f => f.id === 'fish-sell-test'), false, 'Cá bán xong phải mất luôn');
    assert.equal(testFs.getStars() > 10, true, 'Sao phải tăng lên sau khi bán cá');

    const starsAfterFish = testFs.getStars();

    // 12.2 Bán Món Ăn
    const sellDishRes = testFs.sellItemAtMarket('dish', 'cook-99');
    assert.equal(sellDishRes.ok, true);
    assert.equal(sellDishRes.starsEarned, 10, 'Món ăn bán lại bị lỗ 50% (21 Sao -> 10 Sao)');
    assert.equal(testFs.getStars(), starsAfterFish + 10);
    const gameAfterDish = testFs.loadGame();
    assert.equal(gameAfterDish.cooking.dishes.some(d => d.id === 'cook-99'), false, 'Món ăn bán xong phải mất luôn vĩnh viễn');

    // 12.3 Bán Nguyên Liệu
    const sellIngRes = testFs.sellItemAtMarket('ingredient', 'banana');
    assert.equal(sellIngRes.ok, true);
    assert.equal(sellIngRes.starsEarned, 4, 'Nguyên liệu bán lại bị lỗ 50% (Chuối 8 Sao -> 4 Sao)');
    const gameAfterIng = testFs.loadGame();
    assert.equal(gameAfterIng.cooking.ingredients.banana, 1, 'Chuối từ 2 trừ 1 còn 1');

    // 12.4 Bán Balo trong Túi (chiếc thứ 2 chưa đeo)
    const sellBpRes = testFs.sellItemAtMarket('backpack', 'backpack_bunny_pink');
    assert.equal(sellBpRes.ok, true);
    assert.equal(sellBpRes.starsEarned, 15, 'Balo bán lại bị lỗ 50% (30 Sao -> 15 Sao)');
    const gameAfterBp = testFs.loadGame();
    assert.equal(gameAfterBp.backpacks.owned.length, 1, 'Balo đã bán 1 cái chỉ còn 1 cái đang đeo');
    assert.equal(gameAfterBp.backpacks.equipped[0], 'backpack_bunny_pink', 'Balo đang đeo vẫn giữ nguyên');

    // Chặn bán Balo đang đeo
    const failBpRes = testFs.sellItemAtMarket('backpack', 'backpack_bunny_pink');
    assert.equal(failBpRes.ok, false, 'Không thể bán Balo đang đeo');

    // 12.5 Bán Phụ Kiện trong Túi (acc_star_glasses chưa đeo)
    const sellAccRes = testFs.sellItemAtMarket('accessory', 'acc_star_glasses');
    assert.equal(sellAccRes.ok, true);
    assert.equal(sellAccRes.starsEarned, 15, 'Phụ kiện bán lại bị lỗ 50% (acc_star_glasses 30 Sao -> 15 Sao)');
    const gameAfterAcc = testFs.loadGame();
    assert.equal(gameAfterAcc.fashion.ownedAccessories.includes('acc_star_glasses'), false, 'Kính ngôi sao bán xong mất luôn');

    // Chặn bán Phụ Kiện đang đeo trên người (acc_rainbow_crown)
    const failAccRes = testFs.sellItemAtMarket('accessory', 'acc_rainbow_crown');
    assert.equal(failAccRes.ok, false, 'Không thể bán Phụ kiện đang đeo trên người');

    console.log('✓ Test 12 Passed: Bán tất cả các loại vật phẩm (Cá, Món ăn, Nguyên liệu, Balo, Phụ kiện) - Dữ liệu bán rồi mất luôn vĩnh viễn!');

  }
  // 13. Kiểm thử toàn diện Quy tắc Bán lại đồ lỗ 50% cho tất cả chủng loại đồ đạc (Phụ kiện, Balo, Nguyên liệu, Món ăn)
  {
    // 13.1 Phụ kiện thời trang: Lỗ 50% so với giá mua gốc
    for (const [accId, acc] of Object.entries(ACCESSORIES_CATALOG)) {
      const sellPrice = calculateAccessorySellPrice(accId);
      const expectedSell = Math.max(1, Math.floor(acc.price * 0.5));
      assert.equal(sellPrice, expectedSell, `Phụ kiện ${acc.name} giá gốc ${acc.price} bán lại phải lỗ 50% thành ${expectedSell}`);
    }

    // 13.2 Balo mở rộng túi: Lỗ 50% so với giá mua gốc
    for (const bp of BACKPACKS) {
      const sellPrice = calculateBackpackSellPrice(bp.id);
      const expectedSell = Math.max(1, Math.floor(bp.costStars * 0.5));
      assert.equal(sellPrice, expectedSell, `Balo ${bp.name} giá gốc ${bp.costStars} bán lại phải lỗ 50% thành ${expectedSell}`);
    }

    // 13.3 Nguyên liệu nấu ăn: Lỗ 50% so với giá mua gốc
    for (const ing of INGREDIENTS) {
      const sellPrice = calculateIngredientSellPrice(ing.id);
      const expectedSell = Math.max(1, Math.floor(ing.price * 0.5));
      assert.equal(sellPrice, expectedSell, `Nguyên liệu ${ing.name} giá gốc ${ing.price} bán lại phải lỗ 50% thành ${expectedSell}`);
    }

    // 13.4 Món ăn đã nấu: Lỗ 50% so với tổng chi phí nguyên liệu trong công thức
    const testDishes = ['fruit_yogurt', 'rainbow_sandwich', 'veggie_soup', 'egg_rice', 'pumpkin_porridge', 'rainbow_plate'];
    for (const recipeId of testDishes) {
      const recipe = getRecipe(recipeId);
      const totalCost = calculateDishCost(recipe);
      const sellPrice = calculateDishSellPrice(recipe);
      const expectedSell = Math.max(1, Math.floor(totalCost * 0.5));
      assert.equal(sellPrice, expectedSell, `Món ăn ${recipe.name} chi phí ${totalCost} bán lại phải lỗ 50% thành ${expectedSell}`);
    }

    console.log('✓ Test 13 Passed: Toàn bộ đồ đạc (Phụ kiện, Balo, Nguyên liệu, Món ăn) khi bán lại đều bị lỗ chính xác 50%!');
  }


  adapter.reset();
}
