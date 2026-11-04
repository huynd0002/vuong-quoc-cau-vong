/**
 * src/game/systems/fishingSystem.js
 * Hệ thống Câu Cá Hồ Lá Sen & Chợ Cầu Vồng (FISHING_PLAN v2.0)
 * Đảm bảo toàn vẹn dữ liệu (atomic save transactions), chống mất mồi oan,
 * hỗ trợ trẻ 5–6 tuổi với Chế độ Trợ giúp, Cùng kéo và Sổ Cá.
 */

import {
  FISHING_LIMITS,
  RODS,
  BAITS,
  FISH_SPECIES,
  DOCKS,
  VILLAGE_HELP_REQUESTS,
  getFishSpecies,
  getRod,
  getBait,
  getDock,
  calculateFishSellPrice,
  calculateFishPortions,
  rollFishSpeciesAndWeight
} from '../../content/fishing/fishingData.js';
import {
  getRecipe,
  INGREDIENTS,
  calculateDishSellPrice,
  calculateIngredientSellPrice,
  calculateDishCost
} from '../../content/cooking/recipes.js';
import { getBackpack, calculateBackpackSellPrice } from '../../content/backpacks/backpackData.js';
import { ACCESSORIES_CATALOG, calculateAccessorySellPrice } from './fashionSystem.js';

const clampInt = (n, min, max, fallback = min) => {
  const v = Number(n);
  return Number.isFinite(v) ? Math.max(min, Math.min(max, Math.floor(v))) : fallback;
};

export function defaultFishingState() {
  return {
    shells: 0,
    starterBorrowed: false,
    tutorialCompleted: false,
    ownedRods: [],
    equippedRod: 'rod_lotus',
    baits: {
      bait_lotus: 10,
      bait_crunchy: 0,
      bait_sweet_cake: 0
    },
    equippedBait: 'bait_lotus',
    activeDock: 'lotus_dock',
    consecutiveMisses: 0,
    assistMode: false,
    coPullMode: false,
    difficultyMode: 'normal',
    recentSpecies: [],
    basket: [],
    activeTurn: null,
    fishBook: {},
    milestones: {
      firstCatch: false,
      allSixSpecies: false,
      heavyFish1000g: false,
      firstRelease: false,
      firstMarketSale: false,
      firstScaleGame: false
    },
    completedRequests: [],
    stickers: [],
    seq: 1
  };
}

export function normalizeFishingState(raw = {}) {
  const s = raw && typeof raw === 'object' ? raw : {};
  const starterBorrowed = Boolean(s.starterBorrowed);

  const validRodIds = new Set(RODS.map((r) => r.id));
  const ownedSet = new Set(
    Array.isArray(s.ownedRods) ? s.ownedRods.filter((id) => validRodIds.has(id)) : []
  );
  if (starterBorrowed) {
    ownedSet.add('rod_lotus');
  }
  const ownedRods = [...ownedSet];

  let equippedRod = validRodIds.has(s.equippedRod) ? s.equippedRod : 'rod_lotus';
  if (ownedRods.length > 0 && !ownedSet.has(equippedRod)) {
    equippedRod = ownedRods[0];
  }

  const rawBaits = s.baits && typeof s.baits === 'object' ? s.baits : {};
  const baits = {
    bait_lotus: clampInt(rawBaits.bait_lotus, 0, FISHING_LIMITS.MAX_BAIT_STACK, 10),
    bait_crunchy: clampInt(rawBaits.bait_crunchy, 0, FISHING_LIMITS.MAX_BAIT_STACK, 0),
    bait_sweet_cake: clampInt(rawBaits.bait_sweet_cake, 0, FISHING_LIMITS.MAX_BAIT_STACK, 0)
  };

  const validBaitIds = new Set(BAITS.map((b) => b.id));
  let equippedBait = validBaitIds.has(s.equippedBait) ? s.equippedBait : 'bait_lotus';
  if (equippedBait !== 'bait_lotus' && (baits[equippedBait] || 0) <= 0) {
    equippedBait = 'bait_lotus';
  }

  const validDockIds = new Set(DOCKS.map((d) => d.id));
  const activeDock = validDockIds.has(s.activeDock) ? s.activeDock : 'lotus_dock';

  const validDifficulties = new Set(['easy', 'normal', 'confident']);
  const difficultyMode = validDifficulties.has(s.difficultyMode) ? s.difficultyMode : 'normal';

  const validSpeciesIds = new Set(FISH_SPECIES.map((f) => f.id));
  const recentSpecies = Array.isArray(s.recentSpecies)
    ? s.recentSpecies.filter((id) => validSpeciesIds.has(id)).slice(-FISHING_LIMITS.ANTI_REPEAT_HISTORY)
    : [];

  const basket = Array.isArray(s.basket)
    ? s.basket
        .filter((item) => item && validSpeciesIds.has(item.speciesId))
        .slice(0, FISHING_LIMITS.MAX_BASKET_SIZE)
        .map((item, idx) => {
          const sp = getFishSpecies(item.speciesId);
          const maxStack = sp?.maxStack || 1;
          const count = clampInt(item.count || 1, 1, maxStack, 1);
          const rawW = clampInt(item.weightG, sp.minWeightG, sp.maxWeightG, sp.minWeightG);
          const stepW =
            Math.round((rawW - sp.minWeightG) / FISHING_LIMITS.WEIGHT_STEP_G) *
              FISHING_LIMITS.WEIGHT_STEP_G +
            sp.minWeightG;
          const weights = Array.isArray(item.weights) && item.weights.length > 0
            ? item.weights.slice(0, count).map(w => {
                const wClamped = clampInt(w, sp.minWeightG, sp.maxWeightG, sp.minWeightG);
                return Math.round((wClamped - sp.minWeightG) / FISHING_LIMITS.WEIGHT_STEP_G) *
                  FISHING_LIMITS.WEIGHT_STEP_G + sp.minWeightG;
              })
            : Array.from({ length: count }, () => Math.max(sp.minWeightG, Math.min(sp.maxWeightG, stepW)));

          return {
            id: String(item.id || `fish-${idx + 1}`),
            speciesId: item.speciesId,
            weightG: Math.max(sp.minWeightG, Math.min(sp.maxWeightG, stepW)),
            weights,
            count,
            maxStack,
            dockId: validDockIds.has(item.dockId) ? item.dockId : 'lotus_dock',
            caughtAt: clampInt(item.caughtAt, 0, 9e15, 0),
            keepForCooking: Boolean(item.keepForCooking),
            isSpecial: Boolean(sp?.isSpecial),
            isGlow: Boolean(sp?.isGlow)
          };
        })
    : [];

  const fishBook = {};
  if (s.fishBook && typeof s.fishBook === 'object') {
    for (const sp of FISH_SPECIES) {
      const entry = s.fishBook[sp.id];
      if (entry && typeof entry === 'object' && clampInt(entry.caughtCount, 0, 99999, 0) > 0) {
        fishBook[sp.id] = {
          caughtCount: clampInt(entry.caughtCount, 1, 99999, 1),
          maxWeightG: clampInt(entry.maxWeightG, sp.minWeightG, sp.maxWeightG, sp.minWeightG),
          firstCaughtAt: clampInt(entry.firstCaughtAt, 0, 9e15, 0)
        };
      }
    }
  }

  const rawMilestones = s.milestones && typeof s.milestones === 'object' ? s.milestones : {};
  const milestones = {
    firstCatch: Boolean(rawMilestones.firstCatch || Object.keys(fishBook).length > 0),
    allSixSpecies: Boolean(
      rawMilestones.allSixSpecies || Object.keys(fishBook).length >= FISH_SPECIES.length
    ),
    heavyFish1000g: Boolean(
      rawMilestones.heavyFish1000g ||
        Object.values(fishBook).some((entry) => entry.maxWeightG >= 1000)
    ),
    firstRelease: Boolean(rawMilestones.firstRelease),
    firstMarketSale: Boolean(rawMilestones.firstMarketSale),
    firstScaleGame: Boolean(rawMilestones.firstScaleGame)
  };

  let activeTurn = null;
  if (s.activeTurn && typeof s.activeTurn === 'object' && validDockIds.has(s.activeTurn.dockId)) {
    const t = s.activeTurn;
    activeTurn = {
      id: String(t.id || 'turn-1'),
      dockId: t.dockId,
      rodId: validRodIds.has(t.rodId) ? t.rodId : equippedRod,
      baitId: validBaitIds.has(t.baitId) ? t.baitId : 'bait_lotus',
      phase: ['cast', 'waiting', 'hook', 'pull'].includes(t.phase) ? t.phase : 'cast',
      castPerfect: Boolean(t.castPerfect),
      biteCommitted: Boolean(t.biteCommitted),
      speciesId: validSpeciesIds.has(t.speciesId) ? t.speciesId : null,
      weightG: clampInt(t.weightG, 100, 2000, 250),
      startedAt: clampInt(t.startedAt, 0, 9e15, 0)
    };
  }

  const validRequestIds = new Set(VILLAGE_HELP_REQUESTS.map((r) => r.id));
  const completedRequests = Array.isArray(s.completedRequests)
    ? [...new Set(s.completedRequests.filter((id) => validRequestIds.has(id)))]
    : [];

  const stickers = Array.isArray(s.stickers)
    ? [...new Set(s.stickers.filter((id) => typeof id === 'string' && id.length > 0))]
    : [];

  return {
    shells: clampInt(s.shells, 0, FISHING_LIMITS.MAX_SHELLS, 0),
    starterBorrowed,
    tutorialCompleted: Boolean(s.tutorialCompleted),
    ownedRods,
    equippedRod,
    baits,
    equippedBait,
    activeDock,
    consecutiveMisses: clampInt(s.consecutiveMisses, 0, 99, 0),
    assistMode: Boolean(s.assistMode),
    coPullMode: Boolean(s.coPullMode),
    difficultyMode,
    recentSpecies,
    basket,
    activeTurn,
    fishBook,
    milestones,
    completedRequests,
    stickers,
    seq: clampInt(s.seq, 1, 999999, 1)
  };
}

export class FishingSystem {
  constructor(saveAdapter, onChange = () => {}, now = () => Date.now(), rng = Math.random) {
    this.saveAdapter = saveAdapter;
    this.onChange = onChange;
    this.now = now;
    this.rng = rng;
    this._lastSavedBalance = null;
  }

  _syncStarsAndShells(game) {
    if (!game.player || typeof game.player !== 'object') {
      game.player = { stars: 0 };
    }
    const pStars = clampInt(game.player.stars, 0, FISHING_LIMITS.MAX_SHELLS, 0);
    const fShells = clampInt(game.fishing?.shells, 0, FISHING_LIMITS.MAX_SHELLS, 0);
    let unified = pStars;
    if (pStars === fShells) {
      unified = pStars;
    } else if (this._lastSavedBalance !== null) {
      if (fShells !== this._lastSavedBalance) {
        unified = fShells;
      } else if (pStars !== this._lastSavedBalance) {
        unified = pStars;
      } else {
        unified = Math.max(pStars, fShells);
      }
    } else {
      unified = Math.max(pStars, fShells);
    }
    game.player.stars = unified;
    if (game.fishing) {
      game.fishing.shells = unified;
    }
    this._lastSavedBalance = unified;
    return unified;
  }

  loadGame() {
    const game = this.saveAdapter.load();
    game.fishing = normalizeFishingState(game.fishing);
    this._syncStarsAndShells(game);
    return game;
  }

  getState() {
    return this.loadGame().fishing;
  }

  getStars() {
    return this.loadGame().player?.stars || 0;
  }

  mutate(fn) {
    const game = this.loadGame();
    const beforeBalance = game.fishing.shells;
    const res = fn(game.fishing, game);
    if (!res?.ok) {
      return res || { ok: false, reason: 'invalid' };
    }
    game.fishing = normalizeFishingState(game.fishing);
    // Nếu fn thay đổi fishing.shells hoặc game.player.stars, đồng bộ cả hai theo giá trị mới
    const nextShells = clampInt(game.fishing.shells, 0, FISHING_LIMITS.MAX_SHELLS, 0);
    const nextStars = clampInt(game.player?.stars, 0, FISHING_LIMITS.MAX_SHELLS, 0);
    const finalBalance = nextShells !== beforeBalance ? nextShells : nextStars;
    game.fishing.shells = finalBalance;
    if (!game.player || typeof game.player !== 'object') game.player = {};
    game.player.stars = finalBalance;
    this._lastSavedBalance = finalBalance;

    if (!this.saveAdapter.save(game, { writeFishing: true, writeCooking: Boolean(res.writeCooking) })) {
      return { ok: false, reason: 'save' };
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && finalBalance !== beforeBalance) {
      try {
        window.dispatchEvent(new CustomEvent('game:stars-updated', { detail: { stars: finalBalance } }));
      } catch {}
    }
    this.onChange(game.fishing, game);
    return { ...res, state: game.fishing, stars: finalBalance };
  }

  /**
   * Mượn bộ câu khởi đầu miễn phí (Cần Lá Sen + Mồi Lá Tập) tại Chú Rái Cá hoặc Cô Vịt
   */
  borrowStarterKit() {
    return this.mutate((fishing) => {
      fishing.starterBorrowed = true;
      if (!fishing.ownedRods.includes('rod_lotus')) {
        fishing.ownedRods.push('rod_lotus');
      }
      if (!fishing.equippedRod) {
        fishing.equippedRod = 'rod_lotus';
      }
      if ((fishing.baits.bait_lotus || 0) < 5) {
        fishing.baits.bait_lotus = 10;
      }
      if (!fishing.equippedBait) {
        fishing.equippedBait = 'bait_lotus';
      }
      return { ok: true, newlyBorrowed: true };
    });
  }

  /**
   * Đổi bến câu (Bến Sen / Bến Nắng)
   */
  setActiveDock(dockId) {
    const dock = getDock(dockId);
    if (!dock || dock.id !== dockId) {
      return { ok: false, reason: 'dock' };
    }
    return this.mutate((fishing) => {
      fishing.activeDock = dock.id;
      return { ok: true, dock };
    });
  }

  /**
   * Trang bị cần câu đã sở hữu (Góc chuẩn bị ở Hồ hoặc Quầy ở Chợ)
   */
  equipRod(rodId) {
    const rod = getRod(rodId);
    if (!rod) return { ok: false, reason: 'unknown_rod' };
    return this.mutate((fishing) => {
      if (!fishing.ownedRods.includes(rodId)) {
        return { ok: false, reason: 'not_owned' };
      }
      fishing.equippedRod = rodId;
      return { ok: true, rod };
    });
  }

  /**
   * Trang bị mồi câu đang có sẵn
   */
  equipBait(baitId) {
    const bait = getBait(baitId);
    if (!bait) return { ok: false, reason: 'unknown_bait' };
    return this.mutate((fishing) => {
      if (!bait.unlimited && (fishing.baits[baitId] || 0) <= 0) {
        return { ok: false, reason: 'no_bait' };
      }
      fishing.equippedBait = baitId;
      return { ok: true, bait };
    });
  }

  /**
   * Mua cần câu bằng Sao (⭐) tại Quầy Cần & Mồi của Cô Vịt ở Chợ Cầu Vồng
   */
  buyRod(rodId) {
    const rod = getRod(rodId);
    if (!rod) return { ok: false, reason: 'unknown_rod' };
    return this.mutate((fishing, game) => {
      const cost = rod.costStars ?? rod.costShells ?? 0;
      if (cost === 0) {
        fishing.starterBorrowed = true;
      }
      if (fishing.ownedRods.includes(rodId)) {
        return { ok: false, reason: 'already_owned' };
      }
      if (fishing.shells < cost) {
        return { ok: false, reason: 'shells', requiredStars: cost };
      }
      fishing.shells -= cost;
      if (game?.player) game.player.stars = fishing.shells;
      fishing.ownedRods.push(rodId);
      fishing.equippedRod = rodId;
      return { ok: true, rod, shells: fishing.shells, stars: fishing.shells };
    });
  }

  /**
   * Mua gói mồi (5 viên) bằng Sao (⭐) tại Quầy Cần & Mồi ở Chợ Cầu Vồng
   * Kiểm tra owned + 5 <= 99 để không mất viên mồi lẻ
   */
  buyBaitPack(baitId) {
    const bait = getBait(baitId);
    if (!bait) return { ok: false, reason: 'unknown_bait' };
    if (bait.unlimited) return { ok: false, reason: 'unlimited' };
    return this.mutate((fishing, game) => {
      const current = fishing.baits[baitId] || 0;
      if (current + bait.packCount > FISHING_LIMITS.MAX_BAIT_STACK) {
        return { ok: false, reason: 'stack_full' };
      }
      const cost = bait.packCostStars ?? bait.packCostShells ?? 0;
      if (fishing.shells < cost) {
        return { ok: false, reason: 'shells', requiredStars: cost };
      }
      fishing.shells -= cost;
      if (game?.player) game.player.stars = fishing.shells;
      fishing.baits[baitId] = current + bait.packCount;
      fishing.equippedBait = baitId;
      return { ok: true, bait, count: fishing.baits[baitId], shells: fishing.shells, stars: fishing.shells };
    });
  }

  /**
   * Bắt đầu một lượt câu tại bến câu:
   * - Đảm bảo bé đã có bộ câu khởi đầu (tự cho mượn nếu chưa có)
   * - Kiểm tra Giỏ Cá < 6
   * - Tạm giữ 1 mồi (chưa trừ thật cho đến khi cá cắn thật)
   */
  startFishingTurn(dockId = null) {
    return this.mutate((fishing) => {
      if (!fishing.starterBorrowed || fishing.ownedRods.length === 0) {
        fishing.starterBorrowed = true;
        if (!fishing.ownedRods.includes('rod_lotus')) {
          fishing.ownedRods.push('rod_lotus');
        }
      }
      if (fishing.basket.length >= FISHING_LIMITS.MAX_BASKET_SIZE) {
        return {
          ok: false,
          reason: 'basket_full',
          message: 'Túi đầy rồi không thể câu cá nữa, bé hãy đi đổi cá nhé!'
        };
      }
      const chosenDockId = dockId && getDock(dockId)?.id === dockId ? dockId : fishing.activeDock;
      fishing.activeDock = chosenDockId;

      let baitId = fishing.equippedBait || 'bait_lotus';
      const bait = getBait(baitId);
      if (!bait || (!bait.unlimited && (fishing.baits[baitId] || 0) <= 0)) {
        baitId = 'bait_lotus';
        fishing.equippedBait = 'bait_lotus';
      }

      const turn = {
        id: `turn-${fishing.seq++}`,
        dockId: chosenDockId,
        rodId: fishing.equippedRod || 'rod_lotus',
        baitId,
        phase: 'cast',
        castPerfect: false,
        biteCommitted: false,
        speciesId: null,
        weightG: 250,
        startedAt: this.now()
      };
      fishing.activeTurn = turn;
      return { ok: true, turn };
    });
  }

  /**
   * Thoát hoặc hủy lượt câu TRƯỚC khi cá cắn thật -> hoàn trả mồi nguyên vẹn
   */
  isBasketFull() {
    const s = this.getState();
    const basket = s.basket || [];
    if (basket.length < FISHING_LIMITS.MAX_BASKET_SIZE) return false;
    return basket.every((f) => {
      const sp = getFishSpecies(f.speciesId);
      const max = sp?.maxStack || 1;
      return (f.count || 1) >= max;
    });
  }

  getTotalFishCount() {
    const s = this.getState();
    const basket = s.basket || [];
    return basket.reduce((acc, f) => acc + (f.count || 1), 0);
  }

  cancelTurnBeforeBite() {
    return this.mutate((fishing) => {
      if (!fishing.activeTurn) {
        return { ok: false, reason: 'no_turn' };
      }
      if (fishing.activeTurn.biteCommitted) {
        return { ok: false, reason: 'already_bitten' };
      }
      fishing.activeTurn = null;
      return { ok: true };
    });
  }

  /**
   * Khi phao lún sâu (Cá cắn thật):
   * - Khóa loài cá & cân nặng (theo luật chống lặp 3 lần hoặc tutorial lượt đầu)
   * - Trừ 1 viên mồi trả phí (Mồi Lá Tập miễn phí không trừ)
   */
  commitRealBite(castPerfect = false) {
    return this.mutate((fishing) => {
      if (!fishing.activeTurn) {
        return { ok: false, reason: 'no_turn' };
      }
      if (fishing.activeTurn.biteCommitted && fishing.activeTurn.speciesId) {
        const sp = getFishSpecies(fishing.activeTurn.speciesId);
        return {
          ok: true,
          turn: fishing.activeTurn,
          species: sp,
          weightG: fishing.activeTurn.weightG
        };
      }

      const baitId = fishing.activeTurn.baitId || 'bait_lotus';
      const bait = getBait(baitId);
      let effectiveBaitId = baitId;
      if ((fishing.baits[baitId] || 0) > 0) {
        fishing.baits[baitId] -= 1;
      } else if (bait && !bait.unlimited) {
        effectiveBaitId = 'bait_lotus';
        if ((fishing.baits.bait_lotus || 0) > 0) {
          fishing.baits.bait_lotus -= 1;
        }
      }

      const isFirstTutorial = !fishing.tutorialCompleted;
      const activeRodId = fishing.activeTurn.rodId || fishing.equippedRod || 'rod_lotus';
      const rolled = rollFishSpeciesAndWeight({
        baitId: effectiveBaitId,
        dockId: fishing.activeTurn.dockId,
        rodId: activeRodId,
        recentSpecies: fishing.recentSpecies,
        isFirstTutorial,
        rng: this.rng
      });

      fishing.activeTurn.castPerfect = Boolean(castPerfect);
      fishing.activeTurn.biteCommitted = true;
      fishing.activeTurn.phase = 'hook';
      fishing.activeTurn.speciesId = rolled.speciesId;
      fishing.activeTurn.weightG = rolled.weightG;

      // Nếu mồi trả phí vừa về 0, tự động chuyển trang bị cho lượt sau sang Mồi Lá Tập
      if (bait && !bait.unlimited && (fishing.baits[baitId] || 0) <= 0) {
        fishing.equippedBait = 'bait_lotus';
      }

      return {
        ok: true,
        turn: fishing.activeTurn,
        species: rolled.species,
        weightG: rolled.weightG
      };
    });
  }

  /**
   * Ghi nhận kéo cá thành công:
   * - Thêm cá vào Giỏ Cá (hoặc xử lý ngay nếu người chơi chọn thả ngay)
   * - Cập nhật Sổ Cá (fishBook) & Cột mốc (milestones)
   * - Reset consecutiveMisses = 0, đánh dấu tutorialCompleted = true
   */
  recordTurnCatch({ keepForCooking = false, releaseImmediately = false } = {}) {
    return this.mutate((fishing) => {
      const turn = fishing.activeTurn;
      if (!turn || !turn.biteCommitted || !turn.speciesId) {
        return { ok: false, reason: 'no_bitten_turn' };
      }

      const species = getFishSpecies(turn.speciesId);
      if (!species) {
        return { ok: false, reason: 'unknown_species' };
      }

      const weightG = turn.weightG;
      const nowTs = this.now();

      // Cập nhật lịch sử loài gần nhất (chống lặp 3 lần)
      fishing.recentSpecies = [...fishing.recentSpecies, species.id].slice(
        -FISHING_LIMITS.ANTI_REPEAT_HISTORY
      );
      fishing.consecutiveMisses = 0;
      fishing.tutorialCompleted = true;

      // Cập nhật Sổ Cá (luôn ghi nhận kể cả khi bé thả cá về hồ)
      const prevBook = fishing.fishBook[species.id];
      const isNewSpecies = !prevBook;
      const isNewWeightRecord = !prevBook || weightG > prevBook.maxWeightG;
      fishing.fishBook[species.id] = {
        caughtCount: (prevBook?.caughtCount || 0) + 1,
        maxWeightG: Math.max(prevBook?.maxWeightG || 0, weightG),
        firstCaughtAt: prevBook?.firstCaughtAt || nowTs
      };

      // Cập nhật cột mốc
      fishing.milestones.firstCatch = true;
      if (weightG >= 1000) {
        fishing.milestones.heavyFish1000g = true;
      }
      if (Object.keys(fishing.fishBook).length >= FISH_SPECIES.length) {
        fishing.milestones.allSixSpecies = true;
      }

      let caughtFish = null;
      let isStacked = false;
      if (releaseImmediately) {
        fishing.milestones.firstRelease = true;
      } else {
        const maxStack = species.maxStack || 1;
        // Cá đặc biệt (maxStack === 1) không xếp chồng
        const stackableEntry = maxStack > 1
          ? fishing.basket.find(
              (f) => f.speciesId === species.id && (f.count || 1) < maxStack && !f.keepForCooking
            )
          : null;

        if (stackableEntry) {
          isStacked = true;
          stackableEntry.count = (stackableEntry.count || 1) + 1;
          if (!Array.isArray(stackableEntry.weights)) {
            stackableEntry.weights = [stackableEntry.weightG];
          }
          stackableEntry.weights.push(weightG);
          if (weightG > stackableEntry.weightG) {
            stackableEntry.weightG = weightG;
          }
          stackableEntry.caughtAt = nowTs;
          caughtFish = stackableEntry;
        } else {
          if (fishing.basket.length >= FISHING_LIMITS.MAX_BASKET_SIZE) {
            return { ok: false, reason: 'basket_full' };
          }
          caughtFish = {
            id: `fish-${fishing.seq++}`,
            speciesId: species.id,
            weightG,
            weights: [weightG],
            dockId: turn.dockId,
            caughtAt: nowTs,
            keepForCooking: Boolean(keepForCooking),
            count: 1,
            maxStack,
            isSpecial: Boolean(species.isSpecial),
            isGlow: Boolean(species.isGlow)
          };
          fishing.basket.push(caughtFish);
        }
      }

      fishing.activeTurn = null;
      return {
        ok: true,
        fish: caughtFish,
        species,
        weightG,
        isStacked,
        count: caughtFish?.count || 1,
        maxStack: species.maxStack || 1,
        isSpecial: Boolean(species.isSpecial),
        isGlow: Boolean(species.isGlow),
        released: Boolean(releaseImmediately),
        isNewSpecies,
        isNewWeightRecord
      };
    });
  }

  /**
   * Ghi nhận lượt hụt cá (giật trễ hoặc 3 lần lệch nhịp kéo):
   * - Tăng consecutiveMisses (từ 2 lần trở lên sẽ gợi ý Chế độ Trợ giúp / Cùng kéo)
   */
  recordTurnMiss(reason = 'escaped') {
    return this.mutate((fishing) => {
      const turn = fishing.activeTurn;
      if (turn?.speciesId) {
        fishing.recentSpecies = [...fishing.recentSpecies, turn.speciesId].slice(
          -FISHING_LIMITS.ANTI_REPEAT_HISTORY
        );
      }
      fishing.consecutiveMisses = (fishing.consecutiveMisses || 0) + 1;
      fishing.activeTurn = null;
      return {
        ok: true,
        reason,
        consecutiveMisses: fishing.consecutiveMisses,
        suggestAssist: fishing.consecutiveMisses >= 2
      };
    });
  }

  /**
   * Đánh dấu / bỏ đánh dấu "Giữ để nấu" cho 1 con cá trong Giỏ Cá
   */
  setFishKeepForCooking(fishId, keep = true) {
    return this.mutate((fishing) => {
      const target = fishing.basket.find((f) => f.id === fishId);
      if (!target) {
        return { ok: false, reason: 'not_found' };
      }
      target.keepForCooking = Boolean(keep);
      return { ok: true, fish: target };
    });
  }

  /**
   * Thả 1 con cá từ Giỏ Cá về lại Hồ Lá Sen (chỉ thả ở Hồ, giữ nguyên kỷ lục Sổ Cá)
   */
  /**
   * Xếp chồng 2 ô cá cùng loài lại với nhau:
   * - Chuyển số lượng từ source sang target cho đến khi target đạt maxStack
   */
  stackFish(sourceFishId, targetFishId) {
    if (!sourceFishId || !targetFishId || sourceFishId === targetFishId) {
      return { ok: false, reason: 'invalid_ids' };
    }
    return this.mutate((fishing) => {
      const srcIdx = fishing.basket.findIndex((f) => f.id === sourceFishId);
      const tgtIdx = fishing.basket.findIndex((f) => f.id === targetFishId);
      if (srcIdx === -1 || tgtIdx === -1) {
        return { ok: false, reason: 'not_found' };
      }
      const src = fishing.basket[srcIdx];
      const tgt = fishing.basket[tgtIdx];
      if (src.speciesId !== tgt.speciesId) {
        return { ok: false, reason: 'different_species' };
      }
      const sp = getFishSpecies(tgt.speciesId);
      const maxStack = sp?.maxStack || 1;
      if (maxStack <= 1) {
        return { ok: false, reason: 'cannot_stack_special' };
      }
      const srcCount = src.count || 1;
      const tgtCount = tgt.count || 1;
      if (tgtCount >= maxStack) {
        return { ok: false, reason: 'target_stack_full', maxStack };
      }

      const availableRoom = maxStack - tgtCount;
      const moveCount = Math.min(srcCount, availableRoom);

      tgt.count = tgtCount + moveCount;
      if (!Array.isArray(tgt.weights)) tgt.weights = [tgt.weightG];
      const srcWeights = Array.isArray(src.weights) ? src.weights : [src.weightG];
      const movedWeights = srcWeights.slice(0, moveCount);
      tgt.weights.push(...movedWeights);
      tgt.weightG = Math.max(tgt.weightG, ...movedWeights);

      if (srcCount <= moveCount) {
        fishing.basket.splice(srcIdx, 1);
      } else {
        src.count = srcCount - moveCount;
        src.weights = srcWeights.slice(moveCount);
        src.weightG = Math.max(...src.weights);
      }

      return {
        ok: true,
        movedCount: moveCount,
        sourceFish: src,
        targetFish: tgt,
        newTargetCount: tgt.count,
        maxStack
      };
    });
  }

  /**
   * Thả 1 con cá (hoặc cả ô cá nếu releaseAll = true) từ Giỏ Cá về lại Hồ Lá Sen
   */
  releaseFish(fishId, releaseAll = true) {
    return this.mutate((fishing) => {
      const idx = fishing.basket.findIndex((f) => f.id === fishId);
      if (idx === -1) {
        return { ok: false, reason: 'not_found' };
      }
      const target = fishing.basket[idx];
      const count = target.count || 1;
      if (releaseAll || count <= 1) {
        const [removed] = fishing.basket.splice(idx, 1);
        fishing.milestones.firstRelease = true;
        return { ok: true, releasedFish: removed, releasedCount: count, remainingCount: 0 };
      } else {
        target.count = count - 1;
        if (Array.isArray(target.weights)) target.weights.pop();
        fishing.milestones.firstRelease = true;
        return { ok: true, releasedFish: { ...target, count: 1 }, releasedCount: 1, remainingCount: target.count };
      }
    });
  }

  /**
   * Cân và bán cá tại Sạp Cá Cô Mèo ở Chợ Cầu Vồng:
   * - Mặc định bán 1 con trong xấp (hoặc bán cả xấp nếu sellAll = true)
   * - Cá đang đánh dấu "Giữ để nấu" sẽ được bảo vệ (trả về reason: 'kept_for_cooking')
   * - Cộng Sao (⭐) theo bảng cân nặng
   */
  /**
   * Bán bất kỳ vật phẩm nào trong túi đồ tại quầy bán cá (cá, món ăn, nguyên liệu, balo, phụ kiện)
   * Dữ liệu bán rồi sẽ mất luôn vĩnh viễn khỏi túi và save game.
   */
  sellItemAtMarket(itemKind, itemId) {
    return this.mutate((fishing, game) => {
      let starsEarned = 0;
      let soldItem = null;
      let writeCooking = false;

      if (itemKind === 'fish') {
        const idx = fishing.basket.findIndex((f) => f.id === itemId);
        if (idx === -1) return { ok: false, reason: 'not_found' };
        const target = fishing.basket[idx];
        const currentCount = target.count || 1;
        const sp = getFishSpecies(target.speciesId);
        const w = target.weightG || 250;
        const price = calculateFishSellPrice(w, target.speciesId);
        starsEarned = price;
        soldItem = {
          kind: 'fish',
          name: sp?.name || 'Cá',
          asset: sp?.asset || '/assets/fishing/fish_cloud.png',
          subText: `${w}g`,
          starsEarned: price
        };
        if (currentCount <= 1) {
          fishing.basket.splice(idx, 1);
        } else {
          target.count = currentCount - 1;
        }
        fishing.milestones.firstMarketSale = true;
            } else if (itemKind === 'dish') {
        writeCooking = true;
        const dishes = game.cooking?.dishes || [];
        const idx = dishes.findIndex((d) => d.id === itemId);
        if (idx === -1) return { ok: false, reason: 'not_found' };
        const d = dishes[idx];
        const recipe = getRecipe(d.recipeId);
        starsEarned = calculateDishSellPrice(recipe);
        soldItem = {
          kind: 'dish',
          name: recipe?.name || 'Món Ăn',
          asset: recipe?.image || null,
          icon: recipe?.icon || '🍲',
          subText: 'Món ăn (-50%)',
          originalPrice: calculateDishCost(recipe),
          starsEarned
        };
        dishes.splice(idx, 1);
      } else if (itemKind === 'ingredient') {
        writeCooking = true;
        if (!game.cooking) game.cooking = {};
        if (!game.cooking.ingredients) game.cooking.ingredients = {};
        const current = game.cooking.ingredients[itemId] || 0;
        if (current <= 0) return { ok: false, reason: 'not_found' };
        const ing = INGREDIENTS.find((i) => i.id === itemId);
        starsEarned = calculateIngredientSellPrice(ing);
        soldItem = {
          kind: 'ingredient',
          name: ing?.name || 'Nguyên Liệu',
          asset: ing?.image || null,
          icon: ing?.icon || '🥕',
          subText: '1 phần (-50%)',
          originalPrice: ing?.price || 4,
          starsEarned
        };
        game.cooking.ingredients[itemId] = current - 1;
        if (game.cooking.ingredients[itemId] <= 0) {
          delete game.cooking.ingredients[itemId];
        }
      } else if (itemKind === 'backpack') {
        if (!game.backpacks) game.backpacks = { owned: [], equipped: [] };
        const owned = game.backpacks.owned || [];
        const equipped = game.backpacks.equipped || [];
        const ownedCount = owned.filter((id) => id === itemId).length;
        const equippedCount = equipped.filter((id) => id === itemId).length;
        if (ownedCount <= equippedCount) {
          return { ok: false, reason: 'equipped', message: 'Balo đang đeo không thể bán!' };
        }
        const bp = getBackpack(itemId);
        starsEarned = calculateBackpackSellPrice(bp);
        soldItem = {
          kind: 'backpack',
          name: bp?.name || 'Balo',
          asset: bp?.asset || null,
          icon: bp?.icon || '🎒',
          subText: 'Balo (-50%)',
          originalPrice: bp?.costStars || 30,
          starsEarned
        };
        const idx = owned.indexOf(itemId);
        if (idx !== -1) owned.splice(idx, 1);
      } else if (itemKind === 'accessory') {
        if (!game.fashion) game.fashion = { ownedAccessories: [], equippedAccessoryId: null };
        const ownedAcc = game.fashion.ownedAccessories || [];
        if (itemId === game.fashion.equippedAccessoryId) {
          return { ok: false, reason: 'equipped', message: 'Phụ kiện đang đeo không thể bán!' };
        }
        const idx = ownedAcc.indexOf(itemId);
        if (idx === -1) return { ok: false, reason: 'not_found' };
        const acc = ACCESSORIES_CATALOG[itemId];
        starsEarned = calculateAccessorySellPrice(acc);
        soldItem = {
          kind: 'accessory',
          name: acc?.name || 'Phụ kiện',
          asset: acc?.icon || null,
          icon: acc?.badge || '👑',
          subText: 'Phụ kiện (-50%)',
          originalPrice: acc?.price || 20,
          starsEarned
        };
        ownedAcc.splice(idx, 1);
      } else {
        return { ok: false, reason: 'unsupported_kind' };
      }

      fishing.shells = Math.min(FISHING_LIMITS.MAX_SHELLS, (fishing.shells || 0) + starsEarned);
      if (game?.player) game.player.stars = fishing.shells;

      return {
        ok: true,
        itemKind,
        soldItem,
        starsEarned,
        shellsEarned: starsEarned,
        writeCooking
      };
    });
  }

  sellFishAtMarket(fishId, sellAll = false) {
    return this.mutate((fishing, game) => {
      const idx = fishing.basket.findIndex((f) => f.id === fishId);
      if (idx === -1) {
        return { ok: false, reason: 'not_found' };
      }
      const target = fishing.basket[idx];
      if (target.keepForCooking) {
        return { ok: false, reason: 'kept_for_cooking' };
      }
      const currentCount = target.count || 1;
      if (sellAll || currentCount <= 1) {
        let totalStars = 0;
        const weights = Array.isArray(target.weights) && target.weights.length > 0 ? target.weights : [target.weightG];
        for (const w of weights) {
          totalStars += calculateFishSellPrice(w, target.speciesId);
        }
        const [removed] = fishing.basket.splice(idx, 1);
        fishing.shells = Math.min(FISHING_LIMITS.MAX_SHELLS, fishing.shells + totalStars);
        if (game?.player) game.player.stars = fishing.shells;
        fishing.milestones.firstMarketSale = true;
        return {
          ok: true,
          soldFish: removed,
          shellsEarned: totalStars,
          starsEarned: totalStars,
          shells: fishing.shells,
          stars: fishing.shells,
          soldCount: currentCount,
          remainingCount: 0
        };
      } else {
        const singleWeight = Array.isArray(target.weights) && target.weights.length > 0
          ? target.weights.pop()
          : target.weightG;
        const starsEarned = calculateFishSellPrice(singleWeight, target.speciesId);
        target.count = currentCount - 1;
        target.weightG = Array.isArray(target.weights) && target.weights.length > 0
          ? Math.max(...target.weights)
          : target.weightG;
        fishing.shells = Math.min(FISHING_LIMITS.MAX_SHELLS, fishing.shells + starsEarned);
        if (game?.player) game.player.stars = fishing.shells;
        fishing.milestones.firstMarketSale = true;
        return {
          ok: true,
          soldFish: { ...target, weightG: singleWeight, count: 1 },
          starsEarned,
          shellsEarned: starsEarned,
          shells: fishing.shells,
          stars: fishing.shells,
          soldCount: 1,
          remainingCount: target.count
        };
      }
    });
  }

  /**
   * Hoàn thành Bảng Nhờ Giúp tại Chợ Cầu Vồng (không giới hạn thời gian)
   */
  completeHelpBoardRequest(requestId, fishId) {
    const req = VILLAGE_HELP_REQUESTS.find((r) => r.id === requestId);
    if (!req) return { ok: false, reason: 'unknown_request' };

    return this.mutate((fishing, game) => {
      if (fishing.completedRequests.includes(requestId)) {
        return { ok: false, reason: 'already_completed' };
      }
      const idx = fishing.basket.findIndex((f) => f.id === fishId);
      if (idx === -1) {
        return { ok: false, reason: 'not_found' };
      }
      const fish = fishing.basket[idx];
      if (req.speciesId && fish.speciesId !== req.speciesId) {
        return { ok: false, reason: 'wrong_species' };
      }
      if (fish.weightG < req.minWeightG) {
        return { ok: false, reason: 'too_light' };
      }

      fishing.basket.splice(idx, 1);
      fishing.completedRequests.push(requestId);
      if (req.stickerId && !fishing.stickers.includes(req.stickerId)) {
        fishing.stickers.push(req.stickerId);
      }
      fishing.shells = Math.min(FISHING_LIMITS.MAX_SHELLS, fishing.shells + req.rewardShells);
      if (game?.player) game.player.stars = fishing.shells;

      return {
        ok: true,
        request: req,
        fish,
        rewardShells: req.rewardShells,
        rewardStars: req.rewardShells,
        stickerId: req.stickerId
      };
    });
  }

  /**
   * Chuyển 1 con cá trong Giỏ Cá thành nguyên liệu `fish` (phần cá) trong Tủ Lạnh Nhà Bếp:
   * - <600g -> 1 phần cá
   * - 600–1199g -> 2 phần cá
   * - >=1200g -> 3 phần cá
   * Giao dịch nguyên tử (atomic) cập nhật cả `game.fishing.basket` và `game.cooking.ingredients.fish`
   */
  convertFishToCookingPortions(fishId, convertAll = false) {
    return this.mutate((fishing, game) => {
      const idx = fishing.basket.findIndex((f) => f.id === fishId);
      if (idx === -1) {
        return { ok: false, reason: 'not_found' };
      }
      const fish = fishing.basket[idx];
      const count = fish.count || 1;
      const convertCount = convertAll ? count : 1;

      let portions = 0;
      const weights = Array.isArray(fish.weights) && fish.weights.length > 0 ? [...fish.weights] : [fish.weightG];
      for (let i = 0; i < convertCount; i++) {
        const w = weights.pop() || fish.weightG;
        portions += calculateFishPortions(w);
      }

      if (!game.cooking || typeof game.cooking !== 'object') {
        game.cooking = { ingredients: {} };
      }
      if (!game.cooking.ingredients || typeof game.cooking.ingredients !== 'object') {
        game.cooking.ingredients = {};
      }

      const currentFishIng = clampInt(game.cooking.ingredients.fish, 0, 99, 0);
      if (currentFishIng + portions > 99) {
        return { ok: false, reason: 'ingredient_stack_full' };
      }

      if (convertCount >= count) {
        fishing.basket.splice(idx, 1);
      } else {
        fish.count = count - convertCount;
        fish.weights = weights;
        fish.weightG = weights.length > 0 ? Math.max(...weights) : fish.weightG;
      }
      game.cooking.ingredients.fish = currentFishIng + portions;

      return {
        ok: true,
        writeCooking: true,
        fish,
        portionsAdded: portions,
        totalFishPortions: game.cooking.ingredients.fish,
        remainingCount: convertCount >= count ? 0 : fish.count
      };
    });
  }

  /**
   * Ghi nhận bé hoàn thành 1 câu hỏi trong mini-game "Nặng hơn — Nhẹ hơn" ở Sổ Cá
   */
  recordScaleComparisonWin() {
    return this.mutate((fishing) => {
      const firstTime = !fishing.milestones.firstScaleGame;
      fishing.milestones.firstScaleGame = true;
      if (firstTime) {
        fishing.shells = Math.min(FISHING_LIMITS.MAX_SHELLS, fishing.shells + 1);
      }
      return {
        ok: true,
        firstTime,
        shells: fishing.shells
      };
    });
  }

  setAssistMode(enabled) {
    return this.mutate((fishing) => {
      fishing.assistMode = Boolean(enabled);
      return { ok: true, assistMode: fishing.assistMode };
    });
  }

  setCoPullMode(enabled) {
    return this.mutate((fishing) => {
      fishing.coPullMode = Boolean(enabled);
      return { ok: true, coPullMode: fishing.coPullMode };
    });
  }

  setDifficultyMode(mode) {
    if (!['easy', 'normal', 'confident'].includes(mode)) {
      return { ok: false, reason: 'invalid_mode' };
    }
    return this.mutate((fishing) => {
      fishing.difficultyMode = mode;
      return { ok: true, difficultyMode: fishing.difficultyMode };
    });
  }
}
