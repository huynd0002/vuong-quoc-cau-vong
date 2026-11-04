/**
 * src/game/ui/MarketModal.js
 * Chợ Cầu Vồng — Quầy Cần & Mồi Cô Vịt, Sạp Cân & Bán Cá Cô Mèo, Bảng Nhờ Giúp Bếp Làng (FISHING_PLAN mục 3.4 & 9)
 */

import {
  RODS,
  BAITS,
  FISHING_LIMITS,
  VILLAGE_HELP_REQUESTS,
  getFishSpecies,
  calculateFishSellPrice,
  getFishSizeLabel
} from '../../content/fishing/fishingData.js';
import { BACKPACKS, getBackpack, calculateBackpackSellPrice } from '../../content/backpacks/backpackData.js';
import {
  getRecipe,
  INGREDIENTS,
  calculateDishSellPrice,
  calculateIngredientSellPrice,
  calculateDishCost
} from '../../content/cooking/recipes.js';
import { ACCESSORIES_CATALOG, calculateAccessorySellPrice } from '../systems/fashionSystem.js';

export class MarketModal {
  constructor({
    fishingSystem,
    audioService,
    onNavigateMap = null,
    onClose = () => {}
  }) {
    this.fishingSystem = fishingSystem;
    this.audioService = audioService;
    this.onNavigateMap = onNavigateMap;
    this.onClose = onClose;
    this.activeTab = 'rod_bait_stall'; // 'rod_bait_stall' | 'fish_scale_stall'
    this.selectedFishIdForScale = null;
    this.lastSoldSummary = null;
    this.bannerMessage = null;
    this.cleanupDrag = null;
    this.root = null;
  }

  open(initialTab = 'rod_bait_stall') {
    if (initialTab === 'backpack_stall' || initialTab === 'fish_scale_stall' || initialTab === 'help_board') {
      this.activeTab = initialTab;
    } else {
      this.activeTab = 'rod_bait_stall';
    }
    this.bannerMessage = null;
    this.lastSoldSummary = null;

    const state = this.fishingSystem.getState();
    if (state.basket.length > 0 && !this.selectedFishIdForScale) {
      this.selectedFishIdForScale = state.basket[0].id;
    }

    this._mount();
    if (this.activeTab === 'rod_bait_stall') {
      this._speak(
        'Cô Vịt chào bé! Ở đây có cần câu miễn phí, cần xịn bắt nhanh hơn và nhiều mồi thơm đổi bằng Sao nhé!'
      );
    } else if (this.activeTab === 'backpack_stall') {
      this._speak(
        'Chào mừng bé đến với Quầy Balo Cầu Vồng! Mua balo xinh để mở rộng thêm nhiều ô chứa đồ nhé!'
      );
    } else {
      this._speak(
        'Cô Mèo chào bé! Bé kéo thả cá vào ô bán cá để đổi lấy Sao nhé!'
      );
    }
  }

  switchTab(tab) {
    this.activeTab = tab;
    this.bannerMessage = null;
    this._render();
  }

  close() {
    if (typeof this.cleanupDrag === 'function') {
      this.cleanupDrag();
      this.cleanupDrag = null;
    }
    if (this.root) {
      this.root.remove();
      this.root = null;
    }
    if (typeof this.onClose === 'function') {
      this.onClose();
    }
  }

  _speak(text) {
    if (this.audioService && typeof this.audioService.speak === 'function') {
      this.audioService.speak(text);
    }
  }

  _playSfx(name) {
    if (this.audioService && typeof this.audioService.playSfx === 'function') {
      this.audioService.playSfx(name);
    }
  }

  _setBanner(text, type = 'info') {
    this.bannerMessage = { text, type };
    this._speak(text);
    this._render();
  }

  _mount() {
    if (!this.root) {
      this.root = document.createElement('div');
      this.root.className = 'market-modal-backdrop';
      this.root.id = 'market-modal';
      document.body.appendChild(this.root);
    }
    this._render();
  }

  _render() {
    if (!this.root) return;
    if (typeof this.cleanupDrag === 'function') {
      this.cleanupDrag();
      this.cleanupDrag = null;
    }
    const state = this.fishingSystem.getState();
    const stars = typeof this.fishingSystem.getStars === 'function' ? this.fishingSystem.getStars() : state.shells;

    let shopIcon = '🏮';
    let shopTitle = 'Chợ Cầu Vồng';
    if (this.activeTab === 'rod_bait_stall') {
      shopIcon = '🎣';
      shopTitle = 'Quầy Bán Cần Câu';
    } else if (this.activeTab === 'backpack_stall') {
      shopIcon = '🎒';
      shopTitle = 'Quầy Balo Mới';
    } else if (this.activeTab === 'fish_scale_stall') {
      shopIcon = '🐟';
      shopTitle = 'Quầy Bán Cá';
    }

    this.root.innerHTML = `
      <div class="market-modal-card" role="dialog" aria-label="${shopTitle}">
        <div class="fishing-header">
          <div class="fishing-title-wrap">
            <span class="fishing-title-icon">${shopIcon}</span>
            <div class="fishing-title-text">
              <h2>${shopTitle}</h2>
            </div>
          </div>
          <div class="fishing-header-pills">
            <span class="fishing-stat-pill shells-pill" id="market-shells-pill" title="Số Sao của bé">
              ⭐ <strong>${stars}</strong>
            </span>
            ${this.activeTab === 'fish_scale_stall' ? `
              <span class="fishing-stat-pill basket-pill" id="market-basket-pill" title="Số ô giỏ cá của bé">
                🐟 <strong>${state.basket.length}/${FISHING_LIMITS.MAX_BASKET_SIZE}</strong>
              </span>
            ` : ''}
            <button type="button" class="fishing-close-btn" data-action="close" title="Đóng cửa hàng">✖</button>
          </div>
        </div>

        <div class="fishing-body">
          ${
            this.bannerMessage
              ? `
              <div style="padding:10px 14px;border-radius:18px;font-weight:900;font-size:1.05rem;text-align:center;background:${
                this.bannerMessage.type === 'success' ? '#dcfce7' : '#fef3c7'
              };color:${this.bannerMessage.type === 'success' ? '#14532d' : '#78350f'};border:3px solid ${
                  this.bannerMessage.type === 'success' ? '#22c55e' : '#f59e0b'
                };">
                ${this.bannerMessage.text}
              </div>
            `
              : ''
          }
          ${this.activeTab === 'rod_bait_stall' ? this._renderRodBaitStall(state, stars) : ''}
          ${this.activeTab === 'backpack_stall' ? this._renderBackpackStall(state, stars) : ''}
          ${this.activeTab === 'fish_scale_stall' ? this._renderFishScaleStall(state) : ''}
        </div>
      </div>
    `;

    this._bindEvents();
    if (this.activeTab === 'fish_scale_stall') {
      this._setupFishSellDragAndDrop();
    }
  }

  _renderRodBaitStall(state, stars = state.shells) {
    const rodsHtml = RODS.map((rod) => {
      const owned = state.ownedRods.includes(rod.id);
      const equipped = state.equippedRod === rod.id && owned;
      const costStars = rod.costStars ?? rod.costShells ?? 0;
      const canAfford = stars >= costStars;
      const perkText = rod.perkBadge || '⚡ Bắt nhanh · 🌟 Cá tốt';

      let actionBtn = '';
      if (owned) {
        actionBtn = equipped
          ? `<button type="button" class="fishing-secondary-btn" disabled style="width:100%;min-height:32px;padding:3px 6px;justify-content:center;border-color:#22c55e;color:#15803d;background:#dcfce7;font-size:0.86rem;font-weight:900;border-radius:10px;">🤚 ✅</button>`
          : `<button type="button" class="fishing-secondary-btn" data-equip-rod="${rod.id}" style="width:100%;min-height:32px;padding:3px 6px;justify-content:center;font-size:0.86rem;font-weight:900;border-radius:10px;">🤚 Cầm</button>`;
      } else if (costStars === 0) {
        actionBtn = `<button type="button" class="fishing-big-btn" data-borrow-starter="true" style="width:100%;min-height:32px;padding:3px 6px;font-size:0.86rem;font-weight:900;border-radius:10px;">🎁 0 ⭐</button>`;
      } else {
        actionBtn = `<button type="button" class="fishing-big-btn" data-buy-rod="${rod.id}" ${
          canAfford ? '' : 'disabled'
        } style="width:100%;min-height:32px;padding:3px 6px;font-size:0.86rem;font-weight:900;border-radius:10px;${
          canAfford ? '' : 'filter:grayscale(0.6);opacity:0.75;'
        }">⭐ ${costStars}</button>`;
      }

      return `
        <div class="fishing-item-card rod-card ${equipped ? 'equipped' : ''}" style="align-items:center;text-align:center;position:relative;padding:8px 6px 6px;gap:4px;border-radius:16px;">
          <span style="position:absolute;top:4px;right:4px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#ffffff;font-size:0.66rem;font-weight:900;padding:1px 6px;border-radius:999px;box-shadow:0 1px 3px rgba(0,0,0,0.15);letter-spacing:0.2px;">
            ${rod.levelLabel || `Cấp ${rod.level || 1}`}
          </span>
          <div class="fishing-item-thumb" style="width:52px;height:52px;margin:2px 0 1px;border-radius:12px;">
            <img src="${rod.asset}" alt="${rod.name}" style="width:44px;height:44px;object-fit:contain;" />
          </div>
          <div style="font-size:0.90rem;font-weight:900;color:#0f172a;line-height:1.2;">${rod.icon} ${rod.name}</div>
          <div class="rod-perk-pill" style="font-size:0.70rem;font-weight:800;color:#0369a1;background:#e0f2fe;border:1.5px solid #7dd3fc;border-radius:999px;padding:1px 6px;line-height:1.2;">
            ${perkText}
          </div>
          <div style="font-size:0.84rem;font-weight:900;color:#b45309;margin-bottom:2px;">
            ${owned ? '🎒 Đã có trong Túi' : (costStars === 0 ? '🎁 0 ⭐' : `⭐ ${costStars}`)}
          </div>
          ${actionBtn}
        </div>
      `;
    }).join('');

    const baitsHtml = BAITS.map((bait) => {
      const ownedCount = state.baits[bait.id] || 0;
      const equipped = state.equippedBait === bait.id;
      const packCost = bait.packCostStars ?? bait.packCostShells ?? 0;
      const canBuyPack =
        !bait.unlimited &&
        ownedCount + bait.packCount <= FISHING_LIMITS.MAX_BAIT_STACK &&
        stars >= packCost;

      return `
        <div class="fishing-item-card bait-card ${equipped ? 'equipped' : ''}" style="align-items:center;text-align:center;padding:8px 10px 6px;gap:4px;border-radius:16px;">
          <div class="fishing-item-thumb" style="width:52px;height:52px;margin:2px 0 1px;border-radius:12px;">
            <img src="${bait.asset}" alt="${bait.name}" style="width:44px;height:44px;object-fit:contain;" />
          </div>
          <div style="font-size:0.90rem;font-weight:900;color:#0f172a;line-height:1.2;">${bait.icon} ${bait.name}</div>
          <div style="font-size:0.84rem;font-weight:900;color:#0369a1;margin-bottom:2px;">
            🎒 x${ownedCount}
          </div>
          <div style="display:flex;gap:6px;width:100%;">
            ${
              !bait.unlimited
                ? `
                <button type="button" class="fishing-big-btn" data-buy-bait="${bait.id}" ${
                    canBuyPack ? '' : 'disabled'
                  } style="flex:1;min-height:32px;font-size:0.82rem;padding:3px 6px;border-radius:10px;${
                    canBuyPack ? '' : 'filter:grayscale(0.6);opacity:0.75;'
                  }">
                  +${bait.packCount} (${packCost} ⭐)
                </button>
              `
                : `
                <button type="button" class="fishing-big-btn" data-borrow-starter="true" style="flex:1;min-height:32px;font-size:0.82rem;padding:3px 6px;border-radius:10px;">
                  +5 🎁 (0 ⭐)
                </button>
              `
            }
            ${
              ownedCount > 0
                ? `<button type="button" class="fishing-secondary-btn" data-equip-bait="${bait.id}" style="flex:1;min-height:32px;justify-content:center;font-size:0.82rem;padding:3px 6px;border-radius:10px;">
                    ${equipped ? '🌿 Đang dùng' : '🌿 Dùng'}
                  </button>`
                : ''
            }
          </div>
        </div>
      `;
    }).join('');

    return `
      <h3 style="margin:2px 0 0;color:#9d174d;font-size:0.98rem;font-weight:900;">🎣 Cần Câu (Đổi bằng ⭐ Sao -> Bắt nhanh & Cá tốt hơn)</h3>
      <div class="fishing-grid-rods" style="display:grid;grid-template-columns:repeat(5, 1fr);gap:8px;">${rodsHtml}</div>
      <h3 style="margin:4px 0 0;color:#0369a1;font-size:0.98rem;font-weight:900;">🌿 Mồi Câu (Lưu trong 🎒 Túi, -1 khi câu)</h3>
      <div class="fishing-grid-baits" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;max-width:700px;margin:0 auto;width:100%;">${baitsHtml}</div>
    `;
  }


  _renderBackpackStall(state, stars = (typeof this.fishingSystem?.getStars === 'function' ? this.fishingSystem.getStars() : state.shells)) {
    const bpSystem = this.backpackSystem || (typeof window !== 'undefined' ? window.__backpackSystem : null);
    const bpState = bpSystem?.getState?.() || { owned: [], equipped: [null, null, null, null] };

    const itemsHtml = BACKPACKS.map((bp) => {
      const totalOwned = bpState.owned.filter(id => id === bp.id).length;
      const equippedSlots = [];
      bpState.equipped.forEach((id, idx) => {
        if (id === bp.id) equippedSlots.push(idx + 1);
      });
      const equippedCount = equippedSlots.length;
      const isEquipped = equippedCount > 0;
      const inBagCount = Math.max(0, totalOwned - equippedCount);
      const canAfford = stars >= bp.costStars;
      const hasEmptySlot = bpState.equipped.includes(null);

      const buyBtnText = totalOwned > 0 ? `⭐ Mua Thêm (${bp.costStars})` : `⭐ ${bp.costStars}`;

      let actionBtn = `
        <button type="button" class="fishing-big-btn" data-buy-bp="${bp.id}" ${
          canAfford ? '' : 'disabled'
        } style="width:100%;min-height:34px;padding:4px 8px;font-size:0.88rem;font-weight:900;border-radius:10px;box-shadow:0 3px 0 #15803d;${
          canAfford ? '' : 'filter:grayscale(0.6);opacity:0.75;'
        }">${buyBtnText}</button>
      `;

      if (inBagCount > 0 && hasEmptySlot) {
        actionBtn += `
          <button type="button" class="fishing-secondary-btn" data-equip-bp="${bp.id}" style="width:100%;min-height:30px;padding:2px 8px;margin-top:4px;justify-content:center;background:#fef3c7;border-color:#f59e0b;color:#92400e;font-weight:900;font-size:0.80rem;border-radius:8px;">🎒 Đeo Vào Ô Trống</button>
        `;
      }

      let ownershipText = `⭐ ${bp.costStars} Sao`;
      if (totalOwned > 0) {
        if (equippedCount > 0 && inBagCount > 0) {
          ownershipText = `🎒 Đã có ${totalOwned} (Đeo ${equippedCount}, Túi ${inBagCount})`;
        } else if (equippedCount > 0) {
          ownershipText = `🎒 Đang đeo ${equippedCount} cái (Ô ${equippedSlots.join(', ')})`;
        } else {
          ownershipText = `🎒 Đã có ${totalOwned} cái trong túi`;
        }
      }

      return `
        <div class="fishing-item-card ${isEquipped ? 'equipped' : ''}" style="align-items:center;text-align:center;position:relative;border-color:${bp.borderColor};background:${bp.bgColor};padding:8px 8px 6px;gap:4px;border-radius:16px;">
          <span style="position:absolute;top:5px;right:5px;background:${bp.themeColor};color:#ffffff;font-size:0.75rem;font-weight:900;padding:2px 8px;border-radius:999px;box-shadow:0 2px 4px rgba(0,0,0,0.15);">
            ${bp.badgeText}
          </span>
          <span style="position:absolute;top:5px;left:5px;background:#ffffff;border:1.5px solid ${bp.borderColor};color:${bp.themeColor};font-size:0.70rem;font-weight:900;padding:1px 6px;border-radius:999px;">
            ${bp.tierLabel}
          </span>
          <div class="fishing-item-thumb" style="width:68px;height:68px;margin:4px 0 2px;border:2.5px solid ${bp.borderColor};background:#ffffff;border-radius:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.06);">
            <img src="${bp.asset}" alt="${bp.name}" style="width:58px;height:58px;object-fit:contain;" />
          </div>
          <div style="font-size:0.96rem;font-weight:900;color:#0f172a;margin-top:1px;">${bp.icon} ${bp.name}</div>
          <div style="font-size:0.80rem;color:#475569;line-height:1.25;margin:2px 0 4px;padding:0 2px;">
            ${bp.description}
          </div>
          <div style="font-size:0.82rem;font-weight:900;color:#b45309;margin-bottom:4px;min-height:18px;">
            ${ownershipText}
          </div>
          ${actionBtn}
        </div>
      `;
    }).join('');

    return `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div class="fishing-shop-grid" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  _renderFishScaleStall(state) {
    // ĐÃ BỎ TOÀN BỘ CÁC ICON / SPARKLES RƯỜM RÀ KHI BÁN HÀNG THEO YÊU CẦU NGƯỜI DÙNG
    const dropzoneContent = this.lastSoldSummary
      ? `
        <div class="market-sold-celebration">
          <div class="market-sold-avatar-box">
            ${this.lastSoldSummary.asset ? `
              <img src="${this.lastSoldSummary.asset}" alt="${this.lastSoldSummary.name}" style="width:68px;height:68px;object-fit:contain;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.12));" draggable="false" />
            ` : `
              <span style="font-size:2.4rem;line-height:1;">${this.lastSoldSummary.icon || ''}</span>
            `}
          </div>
          <div style="text-align:left;">
            <div style="font-size:1.24rem;font-weight:900;color:#14532d;line-height:1.3;">
              Đã bán ${this.lastSoldSummary.name}!
            </div>
            <div class="market-sold-star-badge">
              <span>+${this.lastSoldSummary.starsEarned} SAO</span>
            </div>
          </div>
        </div>
        <div style="margin-top:10px;font-size:0.95rem;font-weight:800;color:#0369a1;">
          Kéo thả tiếp vật phẩm bên dưới vào đây để bán đổi Sao nhé!
        </div>
      `
      : `
        <div style="font-size:1.35rem;font-weight:900;color:#78350f;padding:16px 12px;display:flex;align-items:center;justify-content:center;">
          <span>Thả vật phẩm vào đây để đổi Sao</span>
        </div>
      `;

    // Thu thập TẤT CẢ các vật phẩm có thể bán từ tất cả các hệ thống
    const allSellableItems = [];

    // 1. Cá trong giỏ
    (state.basket || []).forEach((fish) => {
      const fSp = getFishSpecies(fish.speciesId);
      const fStars = calculateFishSellPrice(fish.weightG, fish.speciesId);
      const count = fish.count || 1;
      const isSpecial = Boolean(fish.isSpecial || fSp?.isSpecial || fSp?.isGlow);
      allSellableItems.push({
        kind: 'fish',
        id: fish.id,
        name: fSp?.name || 'Cá',
        asset: fSp?.asset || '/assets/fishing/fish_cloud.png',
        icon: '🐟',
        stars: fStars,
        count,
        subText: `${isSpecial ? '✨ ' : ''}${fish.weightG}g`,
        badgeColor: isSpecial ? '#ec4899' : '#0284c7',
        borderColor: isSpecial ? '#ec4899' : '#38bdf8',
        isSpecial
      });
    });

    // 2. Món ăn trong Bếp
    const gameData = typeof this.fishingSystem?.loadGame === 'function' ? this.fishingSystem.loadGame() : {};
    const dishes = gameData.cooking?.dishes || [];
    dishes.forEach((d) => {
      const recipe = getRecipe(d.recipeId);
      const stars = calculateDishSellPrice(recipe);
      allSellableItems.push({
        kind: 'dish',
        id: d.id,
        name: recipe?.name || 'Món Ăn',
        asset: recipe?.image || null,
        icon: recipe?.icon || '🍲',
        stars,
        originalPrice: calculateDishCost(recipe),
        lossPct: '-50%',
        count: 1,
        subText: 'Món ăn',
        badgeColor: '#ea580c',
        borderColor: '#fb923c',
        isSpecial: false
      });
    });

    // 3. Nguyên liệu trong Bếp
    const ingredients = gameData.cooking?.ingredients || {};
    Object.entries(ingredients).forEach(([ingId, count]) => {
      if (count > 0) {
        const ing = INGREDIENTS.find((i) => i.id === ingId);
        const stars = calculateIngredientSellPrice(ing);
        allSellableItems.push({
          kind: 'ingredient',
          id: ingId,
          name: ing?.name || ingId,
          asset: ing?.image || null,
          icon: ing?.icon || '🥕',
          stars,
          originalPrice: ing?.price || 4,
          lossPct: '-50%',
          count,
          subText: `x${count}`,
          badgeColor: '#16a34a',
          borderColor: '#4ade80',
          isSpecial: false
        });
      }
    });

    // 4. Balo còn trong túi (chưa đeo)
    const bpOwned = gameData.backpacks?.owned || [];
    const bpEquipped = gameData.backpacks?.equipped || [];
    const inBagBpCounts = {};
    bpOwned.forEach((id) => { inBagBpCounts[id] = (inBagBpCounts[id] || 0) + 1; });
    bpEquipped.forEach((id) => { if (id && inBagBpCounts[id] > 0) inBagBpCounts[id]--; });
    Object.entries(inBagBpCounts).forEach(([bpId, count]) => {
      if (count > 0) {
        const bp = getBackpack(bpId);
        if (bp) {
          const stars = calculateBackpackSellPrice(bp);
          allSellableItems.push({
            kind: 'backpack',
            id: bp.id,
            name: bp.name,
            asset: bp.asset,
            icon: bp.icon || '🎒',
            stars,
            originalPrice: bp.costStars,
            lossPct: '-50%',
            count,
            subText: count > 1 ? `x${count} (Túi)` : '🎒 Balo',
            badgeColor: '#8b5cf6',
            borderColor: '#a78bfa',
            isSpecial: false
          });
        }
      }
    });

    // 5. Phụ kiện còn trong túi (chưa đeo)
    const ownedAccessories = gameData.fashion?.ownedAccessories || [];
    const equippedAccId = gameData.fashion?.equippedAccessoryId || null;
    ownedAccessories.filter((accId) => accId !== equippedAccId).forEach((accId) => {
      const acc = ACCESSORIES_CATALOG[accId];
      if (acc) {
        const stars = calculateAccessorySellPrice(acc);
        allSellableItems.push({
          kind: 'accessory',
          id: acc.id,
          name: acc.name,
          asset: acc.icon,
          icon: acc.badge || '👑',
          stars,
          originalPrice: acc.price,
          lossPct: '-50%',
          count: 1,
          subText: 'Phụ kiện',
          badgeColor: '#d946ef',
          borderColor: '#e879f9',
          isSpecial: false
        });
      }
    });

    const itemsHtml =
      allSellableItems.length === 0
        ? `
          <div style="width:100%;padding:24px;text-align:center;background:#fffbeb;border:3px dashed #fcd34d;border-radius:20px;">
            <div style="font-size:2.4rem;">🧺</div>
            <div style="font-size:1.12rem;font-weight:900;color:#78350f;margin-top:4px;">
              Túi đồ của bé chưa có vật phẩm nào để bán!
            </div>
            <div style="font-size:0.95rem;font-weight:700;color:#92400e;margin-top:6px;">
              Bé hãy đi câu cá, nấu ăn hoặc mua phụ kiện rồi mang tới đây bán đổi Sao nhé!
            </div>
          </div>
        `
        : allSellableItems
            .map((item) => `
              <div
                class="market-fish-icon-card ${item.isSpecial ? 'is-special-fish' : ''}"
                data-drag-sellable="true"
                data-sell-kind="${item.kind}"
                data-sell-id="${item.id}"
                data-sell-stars="${item.stars}"
                data-sell-name="${item.name}"
                data-sell-asset="${item.asset || ''}"
                data-sell-icon="${item.icon || ''}"
                draggable="true"
                role="button"
                tabindex="0"
                aria-label="${item.name} giá bán ${item.stars} Sao"
                title="${item.lossPct ? `${item.name} - Bán lại lỗ 50%: +${item.stars} ⭐ (Giá gốc: ${item.originalPrice} ⭐) - Dữ liệu bán rồi mất vĩnh viễn` : `Kéo thả vào ô trên để bán đổi lấy +${item.stars} ⭐ Sao`}"
                style="width:110px;height:118px;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#ffffff;border:3px solid ${item.borderColor};border-radius:18px;padding:8px 6px 4px;cursor:grab;user-select:none;touch-action:none;box-shadow:0 4px 0 #e2e8f0, 0 6px 12px rgba(0,0,0,0.06);transition:transform 0.15s ease, box-shadow 0.15s ease;"
              >
                <!-- Giá bán bằng SAO hiển thị nổi bật -->
                <span
                  style="position:absolute;top:-8px;right:-6px;background:linear-gradient(180deg,#fef08a 0%,#facc15 100%);border:2px solid #ca8a04;color:#713f12;font-size:0.85rem;font-weight:900;padding:1px 8px;border-radius:999px;box-shadow:0 2px 4px rgba(0,0,0,0.16);z-index:2;"
                >
                  +${item.stars} Sao
                </span>

                <!-- Phân loại / cân nặng góc trái trên -->
                <span
                  style="position:absolute;top:-7px;left:-5px;background:#ffffff;border:1.5px solid ${item.badgeColor};color:${item.badgeColor};font-size:0.70rem;font-weight:900;padding:1px 6px;border-radius:999px;z-index:2;"
                >
                  ${item.subText}
                </span>

                ${item.lossPct ? `
                  <!-- Huy hiệu lỗ 50% rõ ràng cho Bé/Phụ huynh -->
                  <span
                    style="position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);background:#ef4444;border:1.5px solid #ffffff;color:#ffffff;font-size:0.66rem;font-weight:900;padding:1px 6px;border-radius:999px;box-shadow:0 2px 4px rgba(0,0,0,0.2);z-index:2;white-space:nowrap;"
                    title="Bán lại đồ bị lỗ 50% so với giá mua gốc"
                  >
                    Lỗ 50%
                  </span>
                ` : ''}

                ${item.asset ? `
                  <img
                    src="${item.asset}"
                    alt="${item.name}"
                    style="width:58px;height:58px;object-fit:contain;pointer-events:none;"
                    draggable="false"
                  />
                ` : `
                  <span style="font-size:2.4rem;line-height:1;margin:6px 0;pointer-events:none;">${item.icon || '📦'}</span>
                `}
                <div style="font-size:0.82rem;font-weight:900;color:#0f172a;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:104px;">
                  ${item.name}
                </div>
              </div>
            `)
            .join('');

    return `
      <!-- VỊ TRÍ BÁN ĐỔI SAO -->
      <div
        id="market-sell-dropzone"
        class="fishing-scale-showcase market-sell-dropzone"
        aria-label="Vị trí bán vật phẩm đổi Sao"
        style="min-height:165px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:4px dashed #f59e0b;background:linear-gradient(180deg,#fffbeb 0%,#fef3c7 100%);border-radius:26px;padding:18px;transition:all 0.18s ease;"
      >
        ${dropzoneContent}
      </div>

      <!-- KHAY VẬT PHẨM CỦA BÉ (CÓ THỂ BÁN TẤT CẢ VẬT PHẨM ĐỔI LẤY SAO) -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin:8px 0 2px;">
        <h3 style="margin:0;color:#065f46;font-size:1.05rem;">
          Vật Phẩm Của Bé (${allSellableItems.length} món) — Kéo thả lên ô trên để bán đổi Sao:
        </h3>
        <span style="font-size:0.82rem;color:#b45309;font-weight:800;">
          (Bán lại đồ sẽ bị lỗ 50% giá gốc & mất vĩnh viễn)
        </span>
      </div>
      <div
        id="market-fish-tray"
        style="display:flex;flex-wrap:wrap;gap:14px;padding:14px 10px;min-height:148px;max-height:260px;overflow-y:auto;align-items:center;justify-content:flex-start;background:#f0f9ff;border:3px solid #bae6fd;border-radius:22px;"
      >
        ${itemsHtml}
      </div>
    `;
  }

  _sellItemByDrop(kind, id) {
    if (!kind || !id) return;
    const res = this.fishingSystem.sellItemAtMarket(kind, id);
    if (res.ok) {
      this._playSfx('correct');
      if (typeof window !== 'undefined' && window.__audioService?.playChime) {
        setTimeout(() => window.__audioService?.playChime?.(1046, 0.15), 100);
        setTimeout(() => window.__audioService?.playChime?.(1318, 0.22), 220);
      }
      this.lastSoldSummary = res.soldItem;
      this._setBanner(
        `Đã bán ${res.soldItem.name} thu hồi 50% (+${res.starsEarned} Sao)! (Đã xoá vĩnh viễn khỏi túi)`,
        'success'
      );
      this._render();

      // Kích hoạt hiệu ứng rung nhẹ phản hồi (Subtle Haptic Shake) trên ô bán hàng
      const dropzone = this.root?.querySelector('#market-sell-dropzone');
      if (dropzone) {
        dropzone.classList.remove('market-sell-shaking');
        void dropzone.offsetWidth; // Force reflow
        dropzone.classList.add('market-sell-shaking');
      }
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try { navigator.vibrate(35); } catch {}
      }
    } else {
      this._playSfx('warning');
      this._setBanner(res.message || 'Không thể bán vật phẩm này!', 'error');
    }
  }

  _sellFishByDrop(fishId) {
    return this._sellItemByDrop('fish', fishId);
  }

  _setupFishSellDragAndDrop() {
    if (!this.root) return;
    const dropzone = this.root.querySelector('#market-sell-dropzone');
    const sellCards = this.root.querySelectorAll('[data-drag-sellable]');
    if (!dropzone || !sellCards.length) return;

    let ghost = null;
    let activeCard = null;
    let dragData = null;
    let startPt = null;
    let moved = false;

    const setDropHover = (hover) => {
      if (!dropzone) return;
      dropzone.classList.toggle('is-drop-hover', hover);
      dropzone.style.borderColor = hover ? '#16a34a' : '#f59e0b';
      dropzone.style.background = hover
        ? 'linear-gradient(180deg,#dcfce7 0%,#bbf7d0 100%)'
        : 'linear-gradient(180deg,#fffbeb 0%,#fef3c7 100%)';
      dropzone.style.transform = hover ? 'scale(1.02)' : 'scale(1)';
    };

    const cleanup = () => {
      ghost?.remove();
      ghost = null;
      if (activeCard) {
        activeCard.style.opacity = '1';
      }
      activeCard = null;
      dragData = null;
      startPt = null;
      moved = false;
      setDropHover(false);
    };
    this.cleanupDrag = cleanup;

    const isPointInDropzone = (x, y) => {
      const r = dropzone.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };

    sellCards.forEach((card) => {
      const kind = card.getAttribute('data-sell-kind');
      const id = card.getAttribute('data-sell-id');
      const stars = card.getAttribute('data-sell-stars') || '1';
      const name = card.getAttribute('data-sell-name') || '';
      const asset = card.getAttribute('data-sell-asset') || '';
      const icon = card.getAttribute('data-sell-icon') || '📦';

      const payload = `${kind}:${id}`;

      // HTML5 Drag & Drop
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer?.setData('text/plain', payload);
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
        dragData = { kind, id, stars, name, asset, icon };
        setDropHover(true);
      });
      card.addEventListener('dragend', () => {
        cleanup();
      });

      // Pointer / Touch Drag & Drop
      card.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        activeCard = card;
        dragData = { kind, id, stars, name, asset, icon };
        startPt = { x: e.clientX, y: e.clientY };
        moved = false;
        try {
          card.setPointerCapture(e.pointerId);
        } catch {}
      });

      card.addEventListener('pointermove', (e) => {
        if (activeCard !== card || !startPt) return;
        if (!moved && Math.hypot(e.clientX - startPt.x, e.clientY - startPt.y) < 6) return;
        moved = true;
        card.style.opacity = '0.45';

        if (!ghost) {
          ghost = document.createElement('div');
          ghost.className = 'market-fish-drag-ghost';
          ghost.style.cssText =
            'position:fixed;z-index:99999;pointer-events:none;transform:translate(-50%,-50%) scale(1.08);width:96px;height:96px;background:#ffffff;border:3px solid #f59e0b;border-radius:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 24px rgba(0,0,0,0.22);';
          ghost.innerHTML = `
            ${asset ? `<img src="${asset}" alt="" style="width:64px;height:64px;object-fit:contain;" />` : `<span style="font-size:2.6rem;">${icon}</span>`}
            <span style="position:absolute;top:-10px;right:-8px;background:#facc15;border:2px solid #ca8a04;color:#713f12;font-size:0.88rem;font-weight:900;padding:2px 8px;border-radius:999px;">⭐ +${stars}</span>
          `;
          document.body.appendChild(ghost);
        }
        ghost.style.left = `${e.clientX}px`;
        ghost.style.top = `${e.clientY}px`;
        setDropHover(isPointInDropzone(e.clientX, e.clientY));
      });

      card.addEventListener('pointerup', (e) => {
        if (activeCard !== card) return;
        const droppedOnSell = moved && isPointInDropzone(e.clientX, e.clientY);
        const currentData = dragData;
        cleanup();
        if (droppedOnSell && currentData) {
          this._sellItemByDrop(currentData.kind, currentData.id);
        }
      });

      card.addEventListener('pointercancel', cleanup);
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      setDropHover(true);
    });
    dropzone.addEventListener('dragleave', () => {
      setDropHover(false);
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      const raw = e.dataTransfer?.getData('text/plain') || '';
      let targetKind = dragData?.kind;
      let targetId = dragData?.id;
      if (raw && raw.includes(':')) {
        const parts = raw.split(':');
        targetKind = parts[0];
        targetId = parts[1];
      } else if (raw) {
        targetKind = 'fish';
        targetId = raw;
      }
      cleanup();
      if (targetKind && targetId) {
        this._sellItemByDrop(targetKind, targetId);
      }
    });
  }

  _bindEvents() {
    if (!this.root) return;

    this.root.querySelector('[data-action="close"]')?.addEventListener('click', () => {
      this._playSfx('click');
      this.close();
    });

    this.root.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._playSfx('click');
        this.activeTab = btn.getAttribute('data-tab');
        this.bannerMessage = null;
        this._render();
      });
    });

    this.root.querySelectorAll('[data-speak]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._playSfx('click');
        this._speak(btn.getAttribute('data-speak'));
      });
    });

    this.root.querySelector('[data-borrow-starter]')?.addEventListener('click', () => {
      const res = this.fishingSystem.borrowStarterKit();
      if (res.ok) {
        this._playSfx('correct');
        this._setBanner('Cô Vịt đã trao Cần Lá Sen và Mồi Lá Tập miễn phí cho bé!', 'success');
      }
    });

    
    this.root.querySelectorAll('[data-buy-bp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const bpId = btn.getAttribute('data-buy-bp');
        const bpSystem = this.backpackSystem || (typeof window !== 'undefined' ? window.__backpackSystem : null);
        if (!bpSystem) return;
        this._playSfx('click');
        const res = bpSystem.buyBackpack(bpId);
        if (res.ok) {
          this._playSfx('catch_success');
          this._setBanner(res.message, 'success');
        } else {
          this._playSfx('warning');
          this._setBanner(res.message, 'error');
        }
      });
    });

    this.root.querySelectorAll('[data-equip-bp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const bpId = btn.getAttribute('data-equip-bp');
        const bpSystem = this.backpackSystem || (typeof window !== 'undefined' ? window.__backpackSystem : null);
        if (!bpSystem) return;
        this._playSfx('click');
        const res = bpSystem.equipBackpack(bpId);
        if (res.ok) {
          this._playSfx('catch_success');
          this._setBanner(res.message, 'success');
        } else {
          this._setBanner(res.message, 'error');
        }
      });
    });

    this.root.querySelectorAll('[data-buy-rod]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rodId = btn.getAttribute('data-buy-rod');
        const res = this.fishingSystem.buyRod(rodId);
        if (res.ok) {
          this._playSfx('correct');
          this._setBanner(`Tuyệt vời! Bé đã đổi Sao lấy ${res.rod.name} (${res.rod.perkBadge || 'Bắt nhanh & cá tốt hơn'})!`, 'success');
        } else {
          this._playSfx('wrong');
          this._setBanner('Bé chưa đủ Sao ⭐. Hãy đi vượt ải các Vùng Đất giải đố hoặc bán cá để nhận thật nhiều Sao nhé! 🌈');
        }
      });
    });

    this.root.querySelectorAll('[data-equip-rod]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rodId = btn.getAttribute('data-equip-rod');
        const res = this.fishingSystem.equipRod(rodId);
        if (res.ok) {
          this._playSfx('click');
          this._setBanner(`Bé đang cầm ${res.rod.name}!`, 'success');
        }
      });
    });

    this.root.querySelectorAll('[data-buy-bait]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const baitId = btn.getAttribute('data-buy-bait');
        const res = this.fishingSystem.buyBaitPack(baitId);
        if (res.ok) {
          this._playSfx('correct');
          this._setBanner(
            `Đã đổi Sao lấy +${res.bait.packCount} viên ${res.bait.name} (Tổng: ${res.count} viên)!`,
            'success'
          );
        } else if (res.reason === 'stack_full') {
          this._setBanner('Túi mồi của bé đã đầy 99 viên rồi, bé dùng bớt rồi mua tiếp nhé!');
        } else {
          this._setBanner('Bé chưa đủ Sao ⭐ để mua gói mồi này. Hãy vượt ải các Vùng Đất hoặc bán cá để nhận thêm Sao nhé! 🌈');
        }
      });
    });

    this.root.querySelectorAll('[data-equip-bait]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const baitId = btn.getAttribute('data-equip-bait');
        const res = this.fishingSystem.equipBait(baitId);
        if (res.ok) {
          this._playSfx('click');
          this._setBanner(`Đã gắn ${res.bait.name} vào lưỡi câu!`, 'success');
        }
      });
    });

    this.root.querySelectorAll('[data-select-scale-fish]').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        this._playSfx('click');
        this.selectedFishIdForScale = card.getAttribute('data-select-scale-fish');
        this._render();
      });
    });

    this.root.querySelectorAll('[data-toggle-keep]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fishId = btn.getAttribute('data-toggle-keep');
        const state = this.fishingSystem.getState();
        const fish = state.basket.find((f) => f.id === fishId);
        if (!fish) return;
        const res = this.fishingSystem.setFishKeepForCooking(fishId, !fish.keepForCooking);
        if (res.ok) {
          this._playSfx('click');
          this._setBanner(
            res.fish.keepForCooking
              ? 'Đã đánh dấu Giữ Để Nấu! Bạn cá này sẽ được bảo vệ để mang về Bếp.'
              : 'Đã mở khóa! Bé có thể cân bán bạn cá này ở Sạp Cô Mèo.'
          );
        }
      });
    });

    this.root.querySelectorAll('[data-sell-fish]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fishId = btn.getAttribute('data-sell-fish');
        const res = this.fishingSystem.sellFishAtMarket(fishId);
        if (res.ok) {
          this._playSfx('correct');
          const sp = getFishSpecies(res.soldFish.speciesId);
          this.selectedFishIdForScale = null;
          this._setBanner(
            `Cô Mèo cảm ơn bé! Bạn ${sp?.name || 'cá'} (${res.soldFish.weightG}g) đổi được +${res.shellsEarned} Sao ⭐!`,
            'success'
          );
        } else if (res.reason === 'kept_for_cooking') {
          this._setBanner('Bạn cá này đang được khóa "Giữ để nấu". Bé mở khóa nếu muốn bán nhé!');
        }
      });
    });

    this.root.querySelectorAll('[data-complete-req]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-complete-req');
        const fishId = btn.getAttribute('data-req-fish');
        const res = this.fishingSystem.completeHelpBoardRequest(reqId, fishId);
        if (res.ok) {
          this._playSfx('victory');
          this._setBanner(
            `Hoan hô! ${res.request.npcName} tặng bé +${res.rewardShells} Sao ⭐ và ${res.request.stickerName}!`,
            'success'
          );
        }
      });
    });

    this.root.querySelectorAll('[data-go-map]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetMap = btn.getAttribute('data-go-map');
        this.close();
        if (typeof this.onNavigateMap === 'function') {
          this.onNavigateMap(targetMap);
        }
      });
    });
  }
}
