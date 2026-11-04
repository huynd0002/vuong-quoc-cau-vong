/**
 * src/game/systems/backpackSystem.js
 * Quản lý logic sở hữu Balo, trang bị 4 ô Balo và tính toán tổng số ô mở rộng cho Túi Đồ Của Bé.
 */

import { BACKPACKS, BACKPACK_SLOTS_COUNT, getBackpack } from '../../content/backpacks/backpackData.js';

export function defaultBackpackState() {
  return {
    owned: [], // Danh sách ID các Balo bé đã mua: ['backpack_bunny_pink', ...]
    equipped: [null, null, null, null] // 4 ô trang bị Balo trên header
  };
}

export function normalizeBackpackState(raw) {
  const state = defaultBackpackState();
  if (!raw || typeof raw !== 'object') return state;

  if (Array.isArray(raw.owned)) {
    // Cho phép sở hữu nhiều balo giống nhau
    state.owned = raw.owned.filter(id => typeof id === 'string' && getBackpack(id));
  }

  if (Array.isArray(raw.equipped)) {
    const ownedCounts = {};
    for (const id of state.owned) {
      ownedCounts[id] = (ownedCounts[id] || 0) + 1;
    }

    const usedCounts = {};
    for (let i = 0; i < BACKPACK_SLOTS_COUNT; i++) {
      const id = raw.equipped[i];
      if (typeof id === 'string' && getBackpack(id)) {
        const used = usedCounts[id] || 0;
        const total = ownedCounts[id] || 0;
        if (used < total) {
          state.equipped[i] = id;
          usedCounts[id] = used + 1;
        } else {
          // Tự động bổ sung vào owned nếu save cũ trang bị nhiều hơn
          state.owned.push(id);
          ownedCounts[id] = (ownedCounts[id] || 0) + 1;
          state.equipped[i] = id;
          usedCounts[id] = used + 1;
        }
      } else {
        state.equipped[i] = null;
      }
    }
  }

  return state;
}

export class BackpackSystem {
  constructor(saveAdapter, onChange = null) {
    this.saveAdapter = saveAdapter;
    this.onChange = onChange;
  }

  loadGame() {
    if (!this.saveAdapter) return { player: { stars: 0 }, backpacks: defaultBackpackState() };
    const game = this.saveAdapter.load() || {};
    game.backpacks = normalizeBackpackState(game.backpacks);
    return game;
  }

  saveGame(game) {
    if (this.saveAdapter) {
      this.saveAdapter.save(game);
    }
    if (typeof this.onChange === 'function') {
      this.onChange(game.backpacks);
    }
  }

  getState() {
    return this.loadGame().backpacks;
  }

  getStars() {
    const game = this.loadGame();
    return Math.max(0, game.player?.stars ?? game.fishing?.shells ?? 0);
  }

  /**
   * Tính tổng số ô chứa đồ mở rộng được cộng thêm từ 4 ô Balo đang đeo
   */
  getTotalBonusSlots() {
    const state = this.getState();
    let bonus = 0;
    for (let i = 0; i < BACKPACK_SLOTS_COUNT; i++) {
      const id = state.equipped[i];
      if (id) {
        const bp = getBackpack(id);
        if (bp) bonus += bp.slotsBonus;
      }
    }
    return bonus;
  }

  /**
   * Mua Balo trong Chợ Cầu Vồng bằng Sao.
   * Cho phép mua nhiều chiếc (kể cả cùng một loại), tối đa trang bị 4 ô trên Túi Đồ.
   */
  buyBackpack(id) {
    const bp = getBackpack(id);
    if (!bp) return { ok: false, reason: 'not_found', message: 'Không tìm thấy loại Balo này!' };

    const game = this.loadGame();
    const bpState = game.backpacks;

    const currentStars = Math.max(0, game.player?.stars ?? game.fishing?.shells ?? 0);
    if (currentStars < bp.costStars) {
      return {
        ok: false,
        reason: 'not_enough_stars',
        requiredStars: bp.costStars,
        currentStars,
        message: `Bé cần ${bp.costStars} ⭐ để mua ${bp.name} nhé! Hiện bé có ${currentStars} ⭐.`
      };
    }

    // Trừ sao đồng bộ cả player.stars lẫn fishing.shells
    const newBalance = currentStars - bp.costStars;
    if (!game.player) game.player = {};
    game.player.stars = newBalance;
    if (game.fishing) game.fishing.shells = newBalance;

    bpState.owned.push(id);

    // Tự động đeo vào ô trống đầu tiên trong 4 ô nếu còn trống
    const firstEmptyIndex = bpState.equipped.findIndex(slot => !slot);
    let autoEquippedSlot = -1;
    if (firstEmptyIndex !== -1) {
      bpState.equipped[firstEmptyIndex] = id;
      autoEquippedSlot = firstEmptyIndex;
    }

    this.saveGame(game);

    const totalThisType = bpState.owned.filter(x => x === id).length;
    return {
      ok: true,
      backpack: bp,
      stars: newBalance,
      autoEquippedSlot,
      totalOwnedThisType: totalThisType,
      message: `Bé đã mua thành công ${bp.name}! ${autoEquippedSlot !== -1 ? `Balo đã được đeo vào Ô ${autoEquippedSlot + 1} và mở thêm +${bp.slotsBonus} ô chứa đồ!` : 'Đã cất vào Túi Đồ, bé hãy mở túi để đeo nhé!'}`
    };
  }

  /**
   * Đeo Balo vào 1 trong 4 ô (0, 1, 2, 3).
   * Cho phép đeo nhiều chiếc giống nhau ở các ô khác nhau (tối đa 4 ô).
   */
  equipBackpack(id, slotIndex = -1) {
    const bp = getBackpack(id);
    if (!bp) return { ok: false, reason: 'not_found', message: 'Không tìm thấy Balo!' };

    const game = this.loadGame();
    const bpState = game.backpacks;

    // Đếm tổng số balo loại này bé đang sở hữu
    const totalOwned = bpState.owned.filter(x => x === id).length;
    // Đếm số balo loại này đang được đeo trên các ô
    const totalEquipped = bpState.equipped.filter(x => x === id).length;

    // Nếu ô đích đã đang đeo chính loại balo này thì không cần đổi
    if (slotIndex >= 0 && slotIndex < BACKPACK_SLOTS_COUNT && bpState.equipped[slotIndex] === id) {
      return {
        ok: true,
        backpack: bp,
        slotIndex,
        totalBonus: this.getTotalBonusSlots(),
        message: `${bp.name} đã được đeo ở Ô ${slotIndex + 1} rồi nhé!`
      };
    }

    // Nếu tất cả số balo loại này đã đeo hết vào các ô, không còn cái nào dư trong túi
    if (totalEquipped >= totalOwned) {
      return {
        ok: false,
        reason: 'not_available_in_bag',
        message: `Bé đã đeo hết toàn bộ ${bp.name} đang có vào các ô rồi! Hãy mua thêm ở Chợ nhé!`
      };
    }

    let targetIndex = slotIndex;
    if (targetIndex < 0 || targetIndex >= BACKPACK_SLOTS_COUNT) {
      // Tìm ô trống đầu tiên
      const emptyIdx = bpState.equipped.findIndex(slot => !slot);
      targetIndex = emptyIdx !== -1 ? emptyIdx : 0;
    }

    // Đeo vào targetIndex (nếu ô này đang có balo khác, balo khác tự động quay lại túi đồ)
    bpState.equipped[targetIndex] = id;
    this.saveGame(game);

    return {
      ok: true,
      backpack: bp,
      slotIndex: targetIndex,
      totalBonus: this.getTotalBonusSlots(),
      message: `Đã đeo ${bp.name} vào Ô ${targetIndex + 1}! Túi mở thêm +${bp.slotsBonus} ô chứa đồ! 🎉`
    };
  }

  /**
   * Tháo gỡ Balo khỏi 1 ô trong 4 ô
   */
  unequipSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= BACKPACK_SLOTS_COUNT) {
      return { ok: false, reason: 'invalid_slot' };
    }

    const game = this.loadGame();
    const bpState = game.backpacks;
    const removedId = bpState.equipped[slotIndex];

    if (!removedId) {
      return { ok: false, reason: 'slot_empty' };
    }

    const bp = getBackpack(removedId);
    bpState.equipped[slotIndex] = null;
    this.saveGame(game);

    return {
      ok: true,
      removedId,
      backpack: bp,
      slotIndex,
      totalBonus: this.getTotalBonusSlots(),
      message: `Đã tháo ${bp?.name || 'Balo'} khỏi Ô ${slotIndex + 1}.`
    };
  }

  /**
   * Đổi vị trí giữa 2 ô Balo
   */
  swapSlots(fromIndex, toIndex) {
    if (
      fromIndex < 0 || fromIndex >= BACKPACK_SLOTS_COUNT ||
      toIndex < 0 || toIndex >= BACKPACK_SLOTS_COUNT ||
      fromIndex === toIndex
    ) {
      return { ok: false, reason: 'invalid_indices' };
    }

    const game = this.loadGame();
    const bpState = game.backpacks;
    const temp = bpState.equipped[fromIndex];
    bpState.equipped[fromIndex] = bpState.equipped[toIndex];
    bpState.equipped[toIndex] = temp;

    this.saveGame(game);
    return { ok: true, equipped: bpState.equipped };
  }
}
