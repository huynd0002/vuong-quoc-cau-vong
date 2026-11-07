import { RECIPES, INGREDIENTS, getIngredient, getRecipe, effectLabel, KITCHEN_LIMITS } from '../../content/cooking/recipes.js';
import { RODS, BAITS, getRod, getBait, getFishSpecies, calculateFishPortions, calculateFishSellPrice } from '../../content/fishing/fishingData.js';
import { BACKPACKS, BACKPACK_SLOTS_COUNT, getBackpack } from '../../content/backpacks/backpackData.js';
import { ACCESSORIES_CATALOG } from '../systems/fashionSystem.js';

const HEAT = { off: '⭕ Tắt bếp', low: '🔥 Lửa nhỏ', medium: '🔥🔥 Lửa vừa', high: '🔥🔥🔥 Lửa lớn' };

export class KitchenModal {
  constructor({ cookingSystem, fishingSystem = null, backpackSystem = null, fashionSystem = null, audioService, onClose, onVisitKitchen, onChallenge, onWashHands }) {
    this.system = cookingSystem; this.fishingSystem = fishingSystem; this.backpackSystem = backpackSystem || (typeof window !== 'undefined' ? window.__backpackSystem : null); this.fashionSystem = fashionSystem || (typeof window !== 'undefined' ? window.__fashionSystem : null); this.audio = audioService;
    this.selectedBackpack = null;
    this.selectedAccessory = null;
    this.onClose = onClose; this.onVisitKitchen = onVisitKitchen; this.onChallenge = onChallenge; this.onWashHands = onWashHands;
    this.tab = 'fridge'; this.selectedDish = null;
    this.rhythmActive = false;
    this.rhythmScore = 0;
    this.rhythmTarget = 5;
    this.rhythmMisses = 0;
    this.maxAllowedMisses = 2;
    this.failedDishRecipe = null;
    this.ballPos = 10;
    this.ballDir = 1;
    this.rhythmAnimId = null;
    this.rhythmLastTime = 0;
    this.rhythmFeedback = 'Canh viên bi vào VÙNG ĐỎ rồi bấm nhé!';
    this.rhythmFeedbackType = '';
    this.cookedDishReward = null;
    this.root = document.createElement('section');
    this.root.id = 'kitchen-modal'; this.root.className = 'kitchen-overlay kitchen-flow'; this.root.hidden = true;
    this.root.setAttribute('role', 'dialog'); this.root.setAttribute('aria-modal', 'true'); this.root.setAttribute('aria-labelledby', 'kitchen-title');
    this.root.innerHTML = `<div class="kitchen-room">
      <header class="kitchen-header"><div><span class="kitchen-eyebrow">BÉ SÂU • ĐẦU BẾP NHÍ</span><h2 id="kitchen-title">Bếp cầu vồng</h2></div>
        <div id="kitchen-header-backpack-slots" class="kitchen-header-backpack-slots" style="display:none;"></div>
        <div class="kitchen-header-actions"><span id="kitchen-wallet" aria-label="Sao hiện có"></span><button type="button" data-action="speak" aria-label="Nghe hướng dẫn">🔊</button><button type="button" data-action="close">✕ Đóng</button></div></header>
      <div class="kitchen-layout"><aside class="kitchen-companion"><img src="/assets/hero/sau/sau_idle.webp" alt="Bé Sâu" />
        <h3>Túi của nhân vật</h3><div id="kitchen-vitals"></div><p>❤️ Hồi tim<br>💛 Tối đa 2 tim tạm cho trận kế tiếp<br>⚡ Đỡ một đòn</p>
        <button type="button" data-action="visit">🏠 Đi trong bếp</button><p class="kitchen-safety">Bếp trong trò chơi.<br>Bếp thật cần người lớn giúp bé.</p></aside>
      <div class="kitchen-workspace"><nav class="kitchen-tabs" aria-label="Các góc bếp">
        <button type="button" data-action="fridge">🧊 Tủ lạnh</button><button type="button" data-action="recipes">🍳 Bếp nấu</button><button type="button" data-action="bag">🎒 Túi</button></nav>
        <p id="kitchen-feedback" class="kitchen-feedback" role="status" aria-live="polite"></p><div id="kitchen-content"></div>
      </div></div></div>`;
    document.body.append(this.root);
    this.content = this.root.querySelector('#kitchen-content'); this.feedback = this.root.querySelector('#kitchen-feedback');
    this.root.addEventListener('click', e => {
      if (Date.now() < (this.suppressClickUntil || 0)) return;
      const button = e.target.closest('button');
      if (button && !button.disabled) {
        this.handle(button);
        return;
      }
      const card = e.target.closest('.fridge-item-card[data-card]');
      if (card) {
        const buyBtn = card.querySelector('[data-buy]');
        if (buyBtn && !buyBtn.disabled) this.handle(buyBtn);
      }
    });
    this.root.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.close(); }
      if ((e.code === 'Space' || e.key === ' ') && this.rhythmActive) {
        e.preventDefault();
        e.stopPropagation();
        this.evaluateAuditionHit();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = [...this.root.querySelectorAll('button:not(:disabled)')].filter(n => n.getClientRects().length);
      if (e.shiftKey && document.activeElement === nodes[0]) { e.preventDefault(); nodes.at(-1)?.focus(); }
      if (!e.shiftKey && document.activeElement === nodes.at(-1)) { e.preventDefault(); nodes[0]?.focus(); }
    });
    // Completion belongs to the system clock, including while the bag is closed.
    this.timer = setInterval(() => this.tick(), 200);
  }
  show(tab = 'fridge') {
    const st = this.system.getState();
    if ((tab === 'fridge' || tab === 'recipes' || tab === 'cook') && !st.handsWashed && !st.session) {
      this.audio?.playChime?.(420, .2);
      this.say(tab === 'fridge' ? 'Bé ơi, rửa tay sạch sẽ trước khi mở tủ lạnh nhé!' : 'Bé ơi, rửa tay sạch sẽ trước khi nấu ăn nhé!');
      this.onWashHands?.();
      return;
    }
    if (!this.root.hidden) { this.tab = tab; this.render(); return; }
    this.returnFocus = document.activeElement;
    this.app = document.getElementById('game-app'); this.wasInert = this.app?.inert ?? false;
    if (this.app) this.app.inert = true;
    this.root.hidden = false; this.tab = tab; this.selectedDish = null;
    if (tab === 'bag') { this.audio?.playBagOpen?.(); } else { this.audio?.playSelect?.(); }
    this.tick(); this.render(); this.root.querySelector('[data-action="close"]').focus();
    this.say(tab === 'bag' ? 'Túi của bé có nguyên liệu và món ăn. Chạm vào món để dùng hoặc hủy.' : 'Dùng Sao mua nguyên liệu ở tủ lạnh, kéo vào bếp, rồi bấm Nấu nhé!');
  }
  close() {
    if (this.root.hidden) return;
    this.stopAuditionLoop();
    this.rhythmActive = false;
    this.cleanupDrag?.(); this.root.hidden = true;
    if (this.app) this.app.inert = this.wasInert;
    this.onClose?.(); this.returnFocus?.focus();
  }
  say(text) { this.spoken = text; this.audio?.speak(text); }
  notify(text) { this.feedback.textContent = text; this.say(text); }
  tick() {
    const state = this.system.getState(); const s = state.session;
    if (!s || s.phase !== 'cooking') return;
    if (Date.now() >= s.readyAt) {
      const result = this.system.finish();
      if (result.ok && !this.root.hidden) {
        this.tab = 'bag'; this.selectedDish = null; this.render();
        this.notify(`${result.recipe.icon} ${result.recipe.name} đã tự cất vào túi!`);
        this.audio?.playChime(880, .2);
      } else if (!result.ok && !this.root.hidden && this.lastSaveError !== s.id) {
        this.lastSaveError = s.id; this.notify(result.message || 'Bé đợi bếp một chút nhé.');
      }
    } else if (!this.root.hidden) {
      const progress = this.content.querySelector('#cooking-progress');
      const percent = Math.min(100, Math.floor((Date.now() - s.startedAt) / (s.readyAt - s.startedAt) * 100));
      if (progress) progress.value = percent;
      const label = this.content.querySelector('#cooking-percent'); if (label) label.textContent = `${percent}%`;
    }
  }

  renderHeaderBackpackSlots() {
    const container = this.root.querySelector('#kitchen-header-backpack-slots');
    if (!container) return;
    if (this.tab !== 'bag') {
      container.style.display = 'none';
      return;
    }
    container.style.display = 'flex';

    const bpSystem = this.backpackSystem || (typeof window !== 'undefined' ? window.__backpackSystem : null);
    const bpState = bpSystem?.getState?.() || { owned: [], equipped: [null, null, null, null] };

    container.innerHTML = bpState.equipped.map((bpId, idx) => {
      const bp = bpId ? getBackpack(bpId) : null;
      if (bp) {
        const isSelected = this.selectedBackpack === bp.id && this.selectedBackpackSlot === idx;
        return `
          <button type="button" class="backpack-header-slot is-equipped ${isSelected ? 'is-selected' : ''}" data-header-backpack-slot="${idx}" data-drag-equipped-slot="${idx}" draggable="true" title="${bp.name} (Ô ${idx + 1}): Mở thêm +${bp.slotsBonus} ô chứa đồ! Bấm để xem hoặc tháo">
            <img src="${bp.asset}" alt="${bp.name}" class="bp-slot-img" draggable="false" />
            <span class="bp-slot-badge" style="background:${bp.themeColor};">${bp.badgeText}</span>
            <span class="bp-slot-num-equipped">${idx + 1}</span>
          </button>
        `;
      }
      return `
        <button type="button" class="backpack-header-slot is-empty" data-header-backpack-slot="${idx}" data-drop-slot-index="${idx}" title="Ô Balo ${idx + 1}: Kéo Balo vào đây để mở thêm ô chứa đồ!">
          <span class="bp-slot-empty-icon">🎒</span>
          <span class="bp-slot-num">Ô ${idx + 1}</span>
          <span class="bp-slot-empty-plus">+</span>
        </button>
      `;
    }).join('');
  }

  render() {
    this.cleanupDrag?.();
    const state = this.system.getState();
    const walletEl = this.root.querySelector('#kitchen-wallet');
    if (walletEl) {
      walletEl.textContent = `⭐ ${this.system.getStars()}`;
      walletEl.style.display = '';
    }
    this.root.querySelector('#kitchen-vitals').textContent = `❤️ ${state.hearts}/3 · 💛 +${state.bonusHearts} · ⚡ ${state.energy}`;
    const count = Object.values(state.ingredients).reduce((a,b) => a+b, 0);
    this.root.querySelector('[data-action="bag"]').textContent = `🎒 Túi (${count + state.dishes.length})`;
    this.root.querySelectorAll('.kitchen-tabs button').forEach(b => b.setAttribute('aria-current', String(b.dataset.action === (this.tab === 'cook' ? 'recipes' : this.tab))));
    // Quy tắc: Pop-up bếp không có bấm mở tủ lạnh được, phải di chuyển qua tủ lạnh trên sàn mới mở được
    const fridgeTabBtn = this.root.querySelector('.kitchen-tabs button[data-action="fridge"]');
    if (fridgeTabBtn) {
      const isCookingView = this.tab === 'cook' || this.tab === 'recipes' || this.tab === 'cook-success';
      fridgeTabBtn.style.display = isCookingView ? 'none' : '';
    }
    this.feedback.textContent = '';
    const roomEl = this.root.querySelector('.kitchen-room');
    if (roomEl) {
      roomEl.classList.toggle('is-fridge-mode', this.tab === 'fridge');
      roomEl.classList.toggle('is-bag-mode', this.tab === 'bag');
      roomEl.classList.toggle('is-cook-mode', this.tab === 'cook' || this.tab === 'recipes' || this.tab === 'cook-success');
    }
    const titleEl = this.root.querySelector('#kitchen-title');
    const eyebrowEl = this.root.querySelector('.kitchen-eyebrow');
    if (this.tab === 'fridge') {
      if (titleEl) titleEl.innerHTML = 'Tủ Lạnh Nguyên Liệu <img src="/assets/ui/custom_kids_ui/icon_fridge_3d.png" class="modal-title-3d-icon" alt="🧊">';
      if (eyebrowEl) eyebrowEl.textContent = 'BẾP CẦU VỒNG • NGUYÊN LIỆU TƯƠI SẠCH';
      return this.renderFridge(state);
    }
    this.renderHeaderBackpackSlots();
    if (this.tab === 'bag') {
      if (titleEl) titleEl.innerHTML = 'Túi Đồ Của Bé <img src="/assets/ui/custom_kids_ui/icon_backpack_3d.png" class="modal-title-3d-icon" alt="🎒">';
      if (eyebrowEl) eyebrowEl.textContent = 'BẾP CẦU VỒNG • TÚI HÀNH TRANG';
      return this.renderBag(state);
    }
    if (this.tab === 'cook-success') {
      if (titleEl) titleEl.innerHTML = 'Món Ngon Hoàn Thành! <img src="/assets/ui/custom_kids_ui/icon_star_3d.png" class="modal-title-3d-icon" alt="🌟">';
      if (eyebrowEl) eyebrowEl.textContent = 'BẾP CẦU VỒNG • ĐẦU BẾP NHÍ XUẤT SẮC';
      return this.renderCookSuccess(this.cookedDishReward);
    }
    if (this.tab === 'cook-failed') {
      if (titleEl) titleEl.innerHTML = 'Món Ăn Bị Cháy Khét! <img src="/assets/ui/custom_kids_ui/icon_heart_empty.png" class="modal-title-3d-icon" alt="⚠️">';
      if (eyebrowEl) eyebrowEl.textContent = 'BẾP CẦU VỒNG • CHƯA THÀNH CÔNG';
      return this.renderCookFailed(this.failedDishRecipe);
    }
    if (titleEl) titleEl.innerHTML = 'Bếp Nấu Thần Kỳ <img src="/assets/ui/custom_kids_ui/icon_kitchen_pan_3d.png" class="modal-title-3d-icon" alt="🍳">';
    if (eyebrowEl) eyebrowEl.textContent = 'BẾP CẦU VỒNG • ĐẦU BẾP NHÍ';
    if (state.session) { this.tab = 'cook'; return this.renderCook(state); }
    this.tab = 'recipes'; this.renderRecipes(state);
  }
  renderFridge(state) {
    const stars = this.system.getStars();

    const shelfGroups = [
      {
        name: 'Ngăn Rau Củ & Quả Tươi Mát',
        icon: '🥕',
        badgeColor: '#10b981',
        items: ['banana', 'carrot', 'broccoli', 'greens', 'pumpkin']
      },
      {
        name: 'Ngăn Bánh, Cá Tươi & Sữa Bổ Dưỡng',
        icon: '🐟',
        badgeColor: '#f59e0b',
        items: ['fish', 'yogurt', 'bread', 'egg']
      },
      {
        name: 'Ngăn Lương Thực & Nước Trong Lành',
        icon: '💧',
        badgeColor: '#0ea5e9',
        items: ['water', 'rice', 'grain']
      }
    ];

    this.content.innerHTML = `
      <div class="fridge-horizontal-container">
        <!-- Shelves Interior (3 Kệ tủ lạnh mát lạnh giao diện ngang) -->
        <div class="fridge-shelves-rack">
          ${shelfGroups.map(shelf => {
            const shelfItems = shelf.items.map(id => getIngredient(id)).filter(Boolean);
            return `
              <div class="fridge-shelf-row">
                <div class="fridge-shelf-header">
                  <span class="shelf-tag-badge">${shelf.icon} ${shelf.name}</span>
                </div>
                <div class="fridge-shelf-glass-tray">
                  ${shelfItems.map(item => {
                    const owned = state.ingredients[item.id] || 0;
                    const isFull = owned >= KITCHEN_LIMITS.ingredientStack;
                    const hasStars = stars >= item.price;
                    return `
                      <article data-card="${item.id}" class="fridge-item-card kitchen-stock ${owned > 0 ? 'is-stocked' : ''}" title="${item.name} (⭐ ${item.price})">
                        ${owned > 0 ? `<div class="fridge-owned-chip" title="Số lượng trong túi">Đang có: <b>${owned}</b></div>` : ''}
                        <div class="fridge-item-avatar-wrap">
                          <img class="fridge-food-3d-asset" src="${item.image}" alt="${item.name}" draggable="false" />
                        </div>
                        <strong class="fridge-item-title">${item.name}</strong>
                        <button type="button" class="btn-fridge-buy-action ${!hasStars ? 'is-disabled' : ''}" data-buy="${item.id}" ${isFull ? 'disabled' : ''}>
                          <span class="buy-label">Mua 1</span>
                          <span class="buy-cost">⭐ ${item.price}</span>
                        </button>
                      </article>
                    `;
                  }).join('')}
                </div>
                <div class="fridge-shelf-bottom-ledge"></div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Footer Bottom Bar removed per user request (clean border, top header close button is sufficient) -->
      </div>
    `;
  }
  renderRecipes(state) {
    const hygiene = state.handsWashed
      ? '<div class="kitchen-hygiene-ready">✨ Tay đã sạch, sẵn sàng vào bếp nấu món ngon!</div>'
      : '<div class="kitchen-hygiene-gate"><span>🖐️</span><div><strong>Rửa tay trước khi nấu</strong><small>Đôi tay sạch giúp món ăn ngon và an toàn cho bé.</small></div><button type="button" data-action="wash-hands">Rửa tay</button></div>';

    this.content.innerHTML = `${hygiene}<div class="kitchen-recipe-header"><p class="kitchen-intro">🍲 Thực đơn món ngon diệu kỳ · Lướt qua để xem nguyên liệu</p></div><div class="kitchen-recipes">${RECIPES.map(r => {
      const unlocked = this.system.unlocked(r, state);
      const mastery = state.mastery[r.id] || 0;
      const totalStars = r.ingredients.reduce((sum, item) => sum + (getIngredient(item.id)?.price || 1) * item.count, 0);
      return `<button type="button" class="kitchen-recipe ${unlocked ? 'is-unlocked' : 'is-locked'}" data-recipe="${r.id}" ${!unlocked ? 'disabled aria-disabled="true"' : ''} aria-label="${r.name}">
        <div class="dish-badge-pill ${unlocked ? 'ready' : 'locked'}">${unlocked ? `⭐ Đã nấu ${mastery} · Cần ~${totalStars}⭐` : `🔒 Cần ${r.unlock} món · ~${totalStars}⭐`}</div>
        <div class="dish-hero-wrapper"><img class="dish-hero-img" src="${r.image}" alt="${r.name}" /></div>
        <strong class="dish-hero-name">${r.name}</strong>
        <div class="dish-hover-flyout" role="tooltip">
          <div class="dish-flyout-title-bar"><span class="flyout-dish-title">${r.name}</span><span class="flyout-tier-badge">Cấp ${r.tier}</span></div>
          <div class="dish-flyout-content">
            <div class="dish-flyout-section"><span class="dish-flyout-label">⭐ Chi phí nguyên liệu:</span> <span style="font-weight:900;color:#ea580c;font-size:0.95rem;">Cần khoảng ~${totalStars} ⭐ để mua đủ nguyên liệu</span></div>
            <div class="dish-flyout-section"><span class="dish-flyout-label">🥕 Thành phần cần có:</span>
              <div class="dish-flyout-ingredients">${r.ingredients.map(i => {
                const owned = state.ingredients[i.id] || 0;
                const isEnough = owned >= i.count;
                return `<div class="dish-flyout-ing ${isEnough ? 'has-enough' : 'is-missing'}"><div class="flyout-ing-avatar-wrap"><img src="${(getIngredient(i.id) || i).image || i.image}" class="flyout-ing-3d-img" alt="${i.name}" /></div><span class="ing-name">${i.name}</span><span class="ing-qty">${owned}/${i.count}</span><span class="ing-state">${isEnough ? '✓ Đủ' : 'Thiếu'}</span></div>`;
              }).join('')}</div>
            </div>
            <div class="dish-flyout-section"><span class="dish-flyout-label">✨ Dinh dưỡng & Tiếp sức:</span>
              <div class="dish-flyout-effects"><span class="buff-chip buff-heal">❤️ +${r.effect.heal} Tim</span>${r.effect.bonus ? `<span class="buff-chip buff-bonus">💛 +${r.effect.bonus} Tim tạm</span>` : ''}${r.effect.energy ? `<span class="buff-chip buff-energy">⚡ +${r.effect.energy} Năng lượng</span>` : ''}</div>
            </div>
            <div class="dish-flyout-footer ${unlocked ? 'ready' : 'locked'}">${unlocked ? '👉 Chạm để vào bếp nấu ngay!' : `🔒 Hãy làm ${r.unlock} món khác nhau để mở khóa`}</div>
          </div>
        </div>
      </button>`;
    }).join('')}</div>
      <div class="kitchen-bottom"><button type="button" class="kitchen-primary" data-action="close">✕ Đóng bếp</button></div>`;
    this.setupRecipeCardInteractions();
  }
  setupRecipeCardInteractions() {
    const cards = this.content.querySelectorAll('.kitchen-recipe');
    const room = this.root.querySelector('.kitchen-room');
    if (!room) return;

    cards.forEach(card => {
      const flyout = card.querySelector('.dish-hover-flyout');
      if (!flyout) return;

      const positionFlyout = () => {
        const cardRect = card.getBoundingClientRect();
        const roomRect = room.getBoundingClientRect();
        if (!cardRect.width || !roomRect.width) return;

        const flyoutHeight = flyout.offsetHeight || 200;
        const flyoutWidth = flyout.offsetWidth || 310;

        // 1. CHIỀU DỌC: Tính toán vị trí không bao giờ tràn mép trên/dưới của phòng bếp
        const spaceBelow = roomRect.bottom - cardRect.bottom;
        const spaceAbove = cardRect.top - roomRect.top;

        let targetY;
        let isDown = true;

        if (spaceBelow >= flyoutHeight + 14) {
          // Thoải mái bên dưới
          targetY = cardRect.bottom + 8;
          isDown = true;
        } else if (spaceAbove >= flyoutHeight + 14) {
          // Thiếu chỗ bên dưới nhưng thừa chỗ bên trên
          targetY = cardRect.top - flyoutHeight - 8;
          isDown = false;
        } else {
          // Màn hình chật: chọn phía rộng hơn và kẹp chặt trong biên modal
          if (spaceBelow >= spaceAbove) {
            targetY = Math.min(cardRect.bottom + 6, roomRect.bottom - flyoutHeight - 12);
            isDown = true;
          } else {
            targetY = Math.max(roomRect.top + 12, cardRect.top - flyoutHeight - 6);
            isDown = false;
          }
        }

        // Kẹp chặt tuyệt đối targetY giữa [roomRect.top + 10, roomRect.bottom - flyoutHeight - 10]
        if (targetY < roomRect.top + 10) {
          targetY = roomRect.top + 10;
        }
        if (targetY + flyoutHeight > roomRect.bottom - 10) {
          targetY = Math.max(roomRect.top + 10, roomRect.bottom - flyoutHeight - 10);
        }

        const relativeTop = targetY - cardRect.top;
        flyout.style.top = `${Math.round(relativeTop)}px`;
        flyout.style.bottom = 'auto';

        if (isDown) {
          flyout.classList.add('flyout-down');
          flyout.classList.remove('flyout-up');
        } else {
          flyout.classList.add('flyout-up');
          flyout.classList.remove('flyout-down');
        }

        // 2. CHIỀU NGANG: Căn giữa theo thẻ món ăn nhưng kẹp an toàn không tràn 2 mép
        let targetX = cardRect.left + (cardRect.width - flyoutWidth) / 2;
        const safeMarginX = 14;
        if (targetX < roomRect.left + safeMarginX) {
          targetX = roomRect.left + safeMarginX;
        } else if (targetX + flyoutWidth > roomRect.right - safeMarginX) {
          targetX = roomRect.right - flyoutWidth - safeMarginX;
        }

        const relativeLeft = targetX - cardRect.left;
        flyout.style.left = `${Math.round(relativeLeft)}px`;
        flyout.style.right = 'auto';
        flyout.style.transform = 'none';

        // 3. MŨI TÊN (ARROW): Căn vị trí mũi tên hướng vào tâm thẻ món ăn
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const arrowRelativeX = Math.max(18, Math.min(flyoutWidth - 18, cardCenterX - targetX));
        flyout.style.setProperty('--arrow-left', `${Math.round(arrowRelativeX)}px`);
      };

      card.addEventListener('pointerenter', positionFlyout);
      card.addEventListener('pointerdown', positionFlyout);
      card.addEventListener('mouseenter', positionFlyout);
      card.addEventListener('focus', positionFlyout);

      // Pre-calculate initially
      requestAnimationFrame(positionFlyout);
    });
  }
  renderBag(state) {
    const dishes = state.dishes || [];
    const ingredients = state.ingredients || {};
    const filter = this.bagFilter || 'all';

    const fs = this.fishingSystem || (typeof window !== 'undefined' ? window.__fishingSystem : null);
    let fState = fs?.getState?.();
    if (fs && fState && !fState.starterBorrowed && (!fState.ownedRods || fState.ownedRods.length === 0)) {
      fs.borrowStarterKit();
      fState = fs.getState();
    }
    fState = fState || {
      ownedRods: ['rod_lotus'],
      equippedRod: 'rod_lotus',
      baits: { bait_lotus: 10, bait_crunchy: 0, bait_sweet_cake: 0 },
      equippedBait: 'bait_lotus',
      basket: [],
      shells: 0
    };

    const activeRod = getRod(fState.equippedRod) || RODS[0];
    const activeBait = getBait(fState.equippedBait) || BAITS[0];
    const activeBaitCount = fState.baits?.[activeBait.id] ?? 0;

    let selectedItem = null;
    let selectedType = null;

    if (this.selectedDish) {
      const d = dishes.find(x => x.id === this.selectedDish);
      if (d) {
        selectedItem = { ...d, recipe: getRecipe(d.recipeId) };
        selectedType = 'dish';
      } else {
        this.selectedDish = null;
      }
    } else if (this.selectedIngredient) {
      const count = ingredients[this.selectedIngredient] || 0;
      if (count > 0) {
        selectedItem = { id: this.selectedIngredient, count, item: getIngredient(this.selectedIngredient) };
        selectedType = 'ingredient';
      } else {
        this.selectedIngredient = null;
      }
    } else if (this.selectedRod) {
      if (fState.ownedRods.includes(this.selectedRod)) {
        selectedItem = { id: this.selectedRod, rod: getRod(this.selectedRod), isEquipped: fState.equippedRod === this.selectedRod };
        selectedType = 'rod';
      } else {
        this.selectedRod = null;
      }
    } else if (this.selectedBait) {
      const count = fState.baits?.[this.selectedBait] || 0;
      if (count > 0) {
        selectedItem = { id: this.selectedBait, count, bait: getBait(this.selectedBait), isEquipped: fState.equippedBait === this.selectedBait };
        selectedType = 'bait';
      } else {
        this.selectedBait = null;
      }
    } else if (this.selectedBackpack) {
      const bp = getBackpack(this.selectedBackpack);
      const bpState = (this.backpackSystem || window.__backpackSystem)?.getState?.() || { owned: [], equipped: [] };
      if (bp && bpState.owned.includes(bp.id)) {
        const isFromHeader = this.selectedBackpackSlot !== undefined && this.selectedBackpackSlot !== null && bpState.equipped[this.selectedBackpackSlot] === bp.id;
        const totalOwned = bpState.owned.filter(id => id === bp.id).length;
        const totalEquipped = bpState.equipped.filter(id => id === bp.id).length;
        const inBagCount = Math.max(0, totalOwned - totalEquipped);
        selectedItem = {
          ...bp,
          isEquipped: isFromHeader,
          equippedSlot: isFromHeader ? this.selectedBackpackSlot : -1,
          count: isFromHeader ? 1 : Math.max(1, inBagCount)
        };
        selectedType = 'backpack';
      } else {
        this.selectedBackpack = null;
        this.selectedBackpackSlot = null;
      }
    } else if (this.selectedFish) {
      const fish = (fState.basket || []).find(f => f.id === this.selectedFish);
      if (fish) {
        selectedItem = { ...fish, species: getFishSpecies(fish.speciesId), sellStars: calculateFishSellPrice(fish.weightG), portions: calculateFishPortions(fish.weightG) };
        selectedType = 'fish';
      } else {
        this.selectedFish = null;
      }
    } else if (this.selectedAccessory) {
      const fSys = this.fashionSystem || (typeof window !== 'undefined' ? window.__fashionSystem : null);
      const fashionState = fSys?.getState?.() || { ownedAccessories: [], equippedAccessoryId: null };
      const acc = ACCESSORIES_CATALOG[this.selectedAccessory];
      if (acc && (fashionState.ownedAccessories || []).includes(acc.id)) {
        const equippedAccId = fashionState.equippedAccessoryId || fashionState.currentAccessory || null;
        const isEquipped = equippedAccId === acc.id;
        selectedItem = {
          ...acc,
          count: 1,
          isEquipped
        };
        selectedType = 'accessory';
      } else {
        this.selectedAccessory = null;
      }
    }

    // Cần câu đã trang bị vào Tay Phải thì biến mất khỏi túi đồ bên dưới (chỉ hiện cần chưa trang bị)
    const rodItems = (fState.ownedRods || [])
      .filter(rodId => rodId !== fState.equippedRod)
      .map(rodId => {
        const r = getRod(rodId);
        if (!r) return null;
        return {
          type: 'rod',
          id: r.id,
          name: r.name,
          icon: r.icon,
          image: r.asset,
          count: 1,
          badgeText: '🎣',
          isSelected: this.selectedRod === r.id,
          isEquipped: false,
          dataAttr: `data-rod-slot="${r.id}" data-drag-rod="${r.id}" draggable="true"`
        };
      }).filter(Boolean);

    // Mồi câu đang gắn ở ô Mồi Câu thì biến mất khỏi túi đồ bên dưới
    const baitItems = BAITS
      .filter(b => (fState.baits?.[b.id] || 0) > 0 && b.id !== fState.equippedBait)
      .map(b => {
        const cnt = fState.baits?.[b.id] || 0;
        return {
          type: 'bait',
          id: b.id,
          name: b.name,
          icon: b.icon,
          image: b.asset,
          count: cnt,
          badgeText: `x${cnt}`,
          isSelected: this.selectedBait === b.id,
          isEquipped: false,
          dataAttr: `data-bait-slot="${b.id}" data-drag-bait="${b.id}" draggable="true"`
        };
      });

    const fishItems = (fState.basket || []).map(f => {
      const sp = getFishSpecies(f.speciesId);
      const sellStars = calculateFishSellPrice(f.weightG);
      const count = f.count || 1;
      const maxStack = f.maxStack || sp?.maxStack || 1;
      const isSpecial = Boolean(f.isSpecial || sp?.isSpecial || sp?.isGlow);
      return {
        type: 'fish',
        id: f.id,
        speciesId: f.speciesId,
        name: sp?.name || 'Cá',
        icon: '🐟',
        image: sp?.asset || '/assets/fishing/fish_cloud.png',
        count,
        maxStack,
        isSpecial,
        isGlow: isSpecial,
        badgeText: count > 1 ? `x${count}` : `⭐ +${sellStars}`,
        isSelected: this.selectedFish === f.id,
        dataAttr: `data-fish-slot="${f.id}" data-drag-fish="${f.id}" draggable="true"`
      };
    });

    const dishItems = dishes.map(d => ({
      type: 'dish',
      id: d.id,
      dishId: d.id,
      name: getRecipe(d.recipeId)?.name || 'Món ăn',
      icon: getRecipe(d.recipeId)?.icon || '🍲',
      image: getRecipe(d.recipeId)?.image || null,
      count: 1,
      badgeText: 'x1',
      isSelected: this.selectedDish === d.id,
      dataAttr: `data-dish="${d.id}"`
    }));

    const ingItems = INGREDIENTS.filter(i => (ingredients[i.id] || 0) > 0).map(i => ({
      type: 'ingredient',
      id: i.id,
      ingredientId: i.id,
      name: i.name,
      icon: i.icon,
      image: i.image,
      count: ingredients[i.id],
      badgeText: `x${ingredients[i.id]}`,
      isSelected: this.selectedIngredient === i.id,
      dataAttr: `data-ing-slot="${i.id}"`
    }));

    
    const bpSystem = this.backpackSystem || (typeof window !== 'undefined' ? window.__backpackSystem : null);
    const bpState = bpSystem?.getState?.() || { owned: [], equipped: [null, null, null, null] };
    const bonusSlots = bpSystem?.getTotalBonusSlots?.() || 0;
    const BASE_BAG_SLOTS = 12;
    const unlockedCapacity = BASE_BAG_SLOTS + bonusSlots;

    // Đếm số lượng balo còn dư trong túi đồ (tổng sở hữu - số lượng đang đeo ở 4 ô header)
    const inBagBackpackCounts = {};
    for (const bpId of (bpState.owned || [])) {
      inBagBackpackCounts[bpId] = (inBagBackpackCounts[bpId] || 0) + 1;
    }
    for (const bpId of (bpState.equipped || [])) {
      if (bpId && inBagBackpackCounts[bpId] > 0) {
        inBagBackpackCounts[bpId]--;
      }
    }

    const backpackItems = [];
    for (const [bpId, count] of Object.entries(inBagBackpackCounts)) {
      if (count <= 0) continue;
      const bp = getBackpack(bpId);
      if (!bp) continue;
      backpackItems.push({
        type: 'backpack',
        id: bp.id,
        backpackId: bp.id,
        name: bp.name,
        icon: bp.icon,
        image: bp.asset,
        count,
        badgeText: count > 1 ? `x${count}` : bp.badgeText,
        isSelected: this.selectedBackpack === bp.id && (this.selectedBackpackSlot === null || this.selectedBackpackSlot === undefined),
        isEquipped: false,
        equippedSlot: -1,
        slotsBonus: bp.slotsBonus,
        dataAttr: `data-bp-slot="${bp.id}" data-drag-bp="${bp.id}" draggable="true"`
      });
    }

    const fSys = this.fashionSystem || (typeof window !== 'undefined' ? window.__fashionSystem : null);
    const fashionState = fSys?.getState?.() || { ownedAccessories: [], equippedAccessoryId: null };
    const equippedAccId = fashionState.equippedAccessoryId || fashionState.currentAccessory || null;
    const equippedAcc = equippedAccId ? ACCESSORIES_CATALOG[equippedAccId] : null;

    // Phụ kiện đã sở hữu nhưng chưa đeo thì nằm trong Túi đồ (kéo vào Ô Phụ Kiện thì biến mất khỏi túi)
    const accessoryItems = (fashionState.ownedAccessories || [])
      .filter(accId => accId !== equippedAccId)
      .map(accId => {
        const acc = ACCESSORIES_CATALOG[accId];
        if (!acc) return null;
        return {
          type: 'accessory',
          id: acc.id,
          accessoryId: acc.id,
          name: acc.name,
          icon: acc.badge || '👑',
          image: acc.icon,
          count: 1,
          badgeText: '👑 Phụ kiện',
          isSelected: this.selectedAccessory === acc.id,
          isEquipped: false,
          dataAttr: `data-accessory-slot="${acc.id}" data-drag-accessory="${acc.id}" draggable="true"`
        };
      }).filter(Boolean);

    const fishingItems = [...rodItems, ...baitItems, ...fishItems];

    // Túi chỉ hiển thị Tất Cả vật phẩm (không chia tab con theo yêu cầu người dùng)
    const displayedItems = [...rodItems, ...baitItems, ...fishItems, ...dishItems, ...ingItems, ...backpackItems, ...accessoryItems];

    const bagCapacity = BASE_BAG_SLOTS + bonusSlots;
    const emptySlotsCount = Math.max(0, bagCapacity - displayedItems.length);
    const lockedSlotsCount = Math.max(0, 36 - bagCapacity);

    this.content.innerHTML = `
      <div class="bag-horizontal-container">
        <!-- KHU VỰC TRANG BỊ TAY PHẢI, MỒI CÂU & Ô PHỤ KIỆN GẮN NHÂN VẬT -->
        <div class="bag-right-hand-equip-bar" style="display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(180deg,#f0f9ff 0%,#e0f2fe 100%);border:3px solid #38bdf8;border-radius:20px;padding:8px 14px;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <button type="button" id="bag-right-hand-dropzone" class="bag-equip-dropzone" data-rod-slot="${activeRod.id}" title="${activeRod.name} (Tay Phải)" aria-label="Tay phải: ${activeRod.name}" style="width:74px;height:74px;position:relative;display:flex;align-items:center;justify-content:center;background:#ffffff;border:3px dashed ${this.selectedRod === activeRod.id ? '#f59e0b' : '#0284c7'};border-radius:18px;padding:6px;cursor:pointer;transition:all 0.15s ease;box-shadow:${this.selectedRod === activeRod.id ? '0 0 0 3px #fde68a' : '0 4px 10px rgba(2,132,199,0.12)'};">
              <img src="${activeRod.asset}" alt="${activeRod.name}" style="width:54px;height:54px;object-fit:contain;" draggable="false" />
              <span style="position:absolute;top:-6px;left:-6px;background:#fef3c7;border:2px solid #f59e0b;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:0.86rem;box-shadow:0 2px 4px rgba(0,0,0,0.12);">🤚</span>
            </button>

            <button type="button" id="bag-bait-dropzone" class="bag-equip-dropzone" data-bait-slot="${activeBait.id}" title="${activeBait.name} (x${activeBaitCount})" aria-label="Mồi câu: ${activeBait.name}" style="width:74px;height:74px;position:relative;display:flex;align-items:center;justify-content:center;background:#ffffff;border:3px dashed ${this.selectedBait === activeBait.id ? '#f59e0b' : '#10b981'};border-radius:18px;padding:6px;cursor:pointer;transition:all 0.15s ease;box-shadow:${this.selectedBait === activeBait.id ? '0 0 0 3px #fde68a' : '0 4px 10px rgba(16,185,129,0.12)'};">
              <img src="${activeBait.asset}" alt="${activeBait.name}" style="width:52px;height:52px;object-fit:contain;" draggable="false" />
              <span style="position:absolute;top:-6px;left:-6px;background:#dcfce7;border:2px solid #22c55e;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:0.82rem;box-shadow:0 2px 4px rgba(0,0,0,0.12);">${activeBait.icon || '🌿'}</span>
              <span style="position:absolute;bottom:-5px;right:-6px;background:#15803d;color:#fff;font-size:0.74rem;font-weight:900;padding:1px 6px;border-radius:999px;border:2px solid #fff;">x${activeBaitCount}</span>
            </button>

            <!-- Ô PHỤ KIỆN GẮN NHÂN VẬT (KÉO PHỤ KIỆN VÀO ĐÂY ĐỂ ĐEO LÊN BÉ) -->
            <button type="button" id="bag-accessory-dropzone" class="bag-equip-dropzone ${equippedAcc ? 'is-equipped' : 'is-empty'} ${this.selectedAccessory === equippedAccId && equippedAccId ? 'is-selected' : ''}" data-accessory-dropzone="true" ${equippedAcc ? `data-drag-equipped-accessory="${equippedAcc.id}" draggable="true"` : ''} title="${equippedAcc ? `${equippedAcc.name} (Đang đeo lên nhân vật · Kéo ra túi hoặc chạm để tháo)` : 'Ô Phụ Kiện: Kéo phụ kiện từ túi vào đây để đeo lên nhân vật!'}" aria-label="Ô Phụ Kiện: ${equippedAcc ? equippedAcc.name : 'Còn trống'}" style="width:74px;height:74px;position:relative;display:flex;align-items:center;justify-content:center;background:#ffffff;border:3px dashed ${equippedAcc ? '#a855f7' : '#c084fc'};border-radius:18px;padding:6px;cursor:pointer;transition:all 0.15s ease;box-shadow:${this.selectedAccessory && this.selectedAccessory === equippedAccId ? '0 0 0 3px #f5d0fe' : '0 4px 10px rgba(168,85,247,0.15)'};">
              ${equippedAcc ? `
                <img src="${equippedAcc.icon}" alt="${equippedAcc.name}" style="width:52px;height:52px;object-fit:contain;filter:drop-shadow(0 4px 6px rgba(147,51,234,0.3));" draggable="false" />
                <span style="position:absolute;top:-6px;left:-6px;background:#f3e8ff;border:2px solid #a855f7;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:0.86rem;box-shadow:0 2px 4px rgba(0,0,0,0.12);">👑</span>
                <span style="position:absolute;bottom:-5px;right:-4px;background:#9333ea;color:#fff;font-size:0.68rem;font-weight:900;padding:1px 6px;border-radius:999px;border:2px solid #fff;">Đeo</span>
              ` : `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0.65;">
                  <span style="font-size:1.6rem;line-height:1;">👑</span>
                  <span style="font-size:0.66rem;font-weight:900;color:#9333ea;margin-top:2px;">Ô Phụ Kiện</span>
                </div>
                <span style="position:absolute;top:-6px;left:-6px;background:#fdf4ff;border:2px solid #d8b4fe;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;color:#a855f7;font-weight:900;">+</span>
              `}
            </button>
          </div>

          <div style="display:flex;align-items:center;gap:6px;background:#fffbeb;border:2px solid #f59e0b;border-radius:14px;padding:8px 12px;font-weight:900;color:#92400e;" title="Số Sao của bé">
            <span style="font-size:1.15rem;">⭐</span>
            <span style="font-size:1.08rem;">${typeof fs?.getStars === 'function' ? fs.getStars() : (this.system?.getStars?.() ?? fState.shells ?? 0)}</span>
          </div>
        </div>

        <!-- Thanh Tiêu Đề Tất Cả & Chỉ Số Ô Đồ (Chỉ có Tất cả theo yêu cầu người dùng) -->
        <div class="bag-filter-bar">
          <div class="bag-filter-group">
            <button type="button" class="btn-bag-filter is-active" data-bag-filter="all">
              🎒 Tất cả (${displayedItems.length})
            </button>
          </div>

          <div class="bag-stats-group">
            <span class="bag-stat-pill bag-capacity-pill" title="Sức chứa Túi Đồ của bé: 12 ô gốc + ${bonusSlots} ô Balo">
              <span>🎒</span> <strong>${displayedItems.length}/${bagCapacity} Ô ${bonusSlots > 0 ? `(+ ${bonusSlots} Balo)` : ''}</strong>
            </span>
            ${state.session ? `
              <button type="button" class="btn-bag-resume-cook" data-action="recipes">
                🍳 ${state.session.phase === 'cooking' ? 'Bếp đang nấu' : 'Làm tiếp món'}
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Main Horizontal Split Layout: Left = Grid, Right = Detail Inspector -->
        <div class="bag-horizontal-layout">
          <!-- Left: Horizontal Slots Grid -->
          <div class="bag-slots-panel">
            <div class="bag-slots-rack">
              ${displayedItems.map(item => `
                <button type="button" class="bag-slot-cell is-filled ${item.type === 'backpack' ? 'is-backpack-cell' : ''} ${item.type === 'accessory' ? 'is-accessory-cell' : ''} ${item.isSelected ? 'is-selected' : ''} ${item.isEquipped ? 'is-equipped-slot' : ''} ${item.isSpecial ? 'is-special-fish' : ''}" ${item.dataAttr} title="${item.name}" style="${item.isEquipped ? 'border-color:#0284c7;box-shadow:0 0 0 3px #bae6fd;' : ''}">
                  <div class="bag-slot-avatar-wrap">
                    ${item.image ? `<img class="bag-slot-img ${item.isSpecial ? 'special-fish-glow-img' : ''}" src="${item.image}" alt="${item.name}" draggable="false" />` : `<span class="bag-slot-emoji">${item.icon}</span>`}
                  </div>
                  <span class="bag-slot-badge">${item.badgeText || `x${item.count}`}</span>
                  ${item.type === 'fish' && item.count > 1 ? `<span class="fish-stack-badge ${item.count >= item.maxStack ? 'stack-full' : ''}">x${item.count}</span>` : ''}
                  ${item.isSpecial ? `<span class="special-fish-label" style="position:absolute;top:-6px;left:-6px;font-size:0.62rem;padding:0 5px;z-index:6;">✨ 1</span>` : ''}
                </button>
              `).join('')}
              ${Array.from({ length: emptySlotsCount }).map(() => `
                <div class="bag-slot-cell is-empty" aria-hidden="true" title="Ô trống chứa đồ">
                  <span class="empty-slot-plus">+</span>
                </div>
              `).join('')}
              ${Array.from({ length: lockedSlotsCount }).map(() => `
                <div class="bag-slot-cell is-locked" aria-hidden="true" title="🔒 Ô bị khóa: Đeo thêm Balo ở thanh trên để mở rộng!">
                  <span class="locked-slot-icon">🔒</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: Item Detail & Action Inspector -->
          <div class="bag-inspector-panel">
            ${selectedItem ? `
              <div class="bag-inspector-card animate-card-pop">
                <div class="inspector-header">
                  <span class="inspector-type-badge ${selectedType === 'dish' ? 'badge-dish' : 'badge-ing'}">
                    ${selectedType === 'dish' ? '🍽️ Món Ăn' : selectedType === 'rod' ? '🤚 Cần Câu' : selectedType === 'bait' ? '🌿 Mồi Câu' : selectedType === 'fish' ? '🐟 Cá Câu Được' : selectedType === 'backpack' ? '🎒 Balo Mở Rộng' : selectedType === 'accessory' ? '👑 Phụ Kiện' : '🥕 Nguyên Liệu'}
                  </span>
                  <button type="button" class="btn-inspector-close" data-action="clear-selection" title="Bỏ chọn">✕</button>
                </div>

                <div class="inspector-avatar-box">
                  ${selectedType === 'dish' ? (
                    selectedItem.recipe.image ? `<img class="inspector-large-img" src="${selectedItem.recipe.image}" alt="${selectedItem.recipe.name}" />` : `<span class="inspector-large-emoji">${selectedItem.recipe.icon}</span>`
                  ) : selectedType === 'rod' ? (
                    `<img class="inspector-large-img" src="${selectedItem.rod.asset}" alt="${selectedItem.rod.name}" />`
                  ) : selectedType === 'bait' ? (
                    `<img class="inspector-large-img" src="${selectedItem.bait.asset}" alt="${selectedItem.bait.name}" />`
                  ) : selectedType === 'backpack' ? (
                    `<img class="inspector-large-img" src="${selectedItem.asset || selectedItem.image}" alt="${selectedItem.name}" />`
                  ) : selectedType === 'accessory' ? (
                    `<img class="inspector-large-img" src="${selectedItem.icon || selectedItem.image}" alt="${selectedItem.name}" style="object-fit:contain;filter:drop-shadow(0 4px 10px rgba(168,85,247,0.4));" />`
                  ) : selectedType === 'fish' ? (
                    `<img class="inspector-large-img" src="${selectedItem.species?.asset || '/assets/fishing/fish_cloud.png'}" alt="${selectedItem.species?.name || 'Cá'}" />`
                  ) : (
                    selectedItem.item.image ? `<img class="inspector-large-img" src="${selectedItem.item.image}" alt="${selectedItem.item.name}" />` : `<span class="inspector-large-emoji">${selectedItem.item.icon}</span>`
                  )}
                </div>

                <h4 class="inspector-title">
                  ${selectedType === 'dish' ? selectedItem.recipe.name : selectedType === 'rod' ? selectedItem.rod.name : selectedType === 'bait' ? selectedItem.bait.name : selectedType === 'accessory' ? selectedItem.name : selectedType === 'fish' ? `${selectedItem.species?.name || 'Cá'} (${selectedItem.weightG}g)` : selectedType === 'backpack' ? selectedItem.name : selectedItem.item.name}
                </h4>

                <div class="inspector-quantity-pill">
                  <span class="qty-icon">📦</span>
                  <span class="qty-label">Số lượng trong túi:</span>
                  <strong class="qty-value">${selectedType === 'dish' || selectedType === 'rod' || selectedType === 'accessory' ? 1 : selectedType === 'fish' ? `${selectedItem.count || 1} / ${selectedItem.maxStack || 1} con` : selectedItem.count}</strong>
                </div>

                <div class="inspector-effect-note">
                  ${selectedType === 'dish' ? `
                    <p class="effect-text">✨ ${effectLabel(selectedItem.recipe.effect)}</p>
                  ` : selectedType === 'backpack' ? `
                    <p class="effect-text" style="color:#b45309;font-weight:900;margin-bottom:4px;">🎒 ${selectedItem.name} (${selectedItem.isEquipped ? `Đang đeo Ô ${selectedItem.equippedSlot + 1}` : 'Đang ở trong túi'})</p>
                    <p class="effect-text">Mở rộng thêm <b>+${selectedItem.slotsBonus} ô</b> sức chứa túi đồ.</p>
                  ` : selectedType === 'accessory' ? `
                    <p class="effect-text" style="color:#9333ea;font-weight:900;margin-bottom:4px;">👑 ${selectedItem.name} (${selectedItem.isEquipped ? 'Đang đeo trên người' : 'Đang ở trong túi'})</p>
                    <p class="effect-text">Phụ kiện xinh xắn gắn vào nhân vật. Kéo vào <b>Ô Phụ Kiện</b> hoặc bấm nút bên dưới để đeo lên Bé nhé!</p>
                  ` : selectedType === 'rod' ? `
                    <p class="effect-text" style="color:#0369a1;font-weight:900;margin-bottom:4px;">${selectedItem.rod.perkBadge || '⚡ Tốc độ thường · 🐟 Cá nhỏ & vừa'}</p>
                    <p class="effect-text">🤚 Kéo vào <b>Tay Phải</b> hoặc bấm nút bên dưới để cầm câu cá!</p>
                  ` : selectedType === 'bait' ? `
                    <p class="effect-text">🌿 Tự trừ <b>-1 viên</b> mỗi khi cá cắn câu.</p>
                  ` : selectedType === 'fish' ? `
                    <p class="effect-text">
                      ${selectedItem.isSpecial ? '✨ <b>Cá Cầu Vồng Đặc Biệt</b>: Độc bản duy nhất, phát sáng lung linh không xếp chồng!' : `📦 Xấp cá: <b>${selectedItem.count || 1} / ${selectedItem.maxStack || 1} con</b>`}
                    </p>
                    <p class="effect-text">⚖️ Nặng <b>${selectedItem.weightG}g</b> · Giá bán: <b>⭐ +${selectedItem.sellStars} Sao / con</b></p>
                  ` : `
                    <p class="effect-text">🥗 Nguyên liệu tươi nấu ăn hoặc ăn nhẹ.</p>
                  `}
                </div>

                <div class="inspector-actions-box">
                  ${selectedType === 'accessory' ? `
                    <div class="inspector-main-buttons">
                      ${selectedItem.isEquipped ? `
                        <button type="button" class="btn-inspector-action btn-inspector-use" data-unequip-accessory-id="${selectedItem.id}" style="background:linear-gradient(180deg,#fef3c7 0%,#fde68a 100%);color:#92400e;border-color:#f59e0b;">
                          <span>🎒 Tháo cất lại vào túi</span>
                        </button>
                      ` : `
                        <button type="button" class="btn-inspector-action btn-inspector-use" data-equip-accessory-id="${selectedItem.id}" style="background:linear-gradient(180deg,#f3e8ff 0%,#e9d5ff 100%);color:#6b21a8;border-color:#a855f7;">
                          <span>👑 Đeo vào Ô Phụ Kiện</span>
                        </button>
                      `}
                    </div>
                  ` : selectedType === 'backpack' ? `
                    <div class="inspector-main-buttons">
                      ${selectedItem.isEquipped ? `
                        <button type="button" class="btn-inspector-action btn-inspector-use" data-unequip-bp-slot="${selectedItem.equippedSlot}" style="background:linear-gradient(180deg,#fef3c7 0%,#fde68a 100%);color:#92400e;border-color:#f59e0b;">
                          <span>🎒 Tháo cất lại vào túi (Mất +${selectedItem.slotsBonus} ô)</span>
                        </button>
                      ` : `
                        <button type="button" class="btn-inspector-action btn-inspector-use" data-equip-bp-id="${selectedItem.id}">
                          <span>✨ Đeo vào Ô trên (+${selectedItem.slotsBonus} ô)</span>
                        </button>
                      `}
                    </div>
                  ` : selectedType === 'rod' ? `
                    <div class="inspector-main-buttons">
                      <button type="button" class="btn-inspector-action btn-inspector-use" data-equip-bag-rod="${selectedItem.id}" ${selectedItem.isEquipped ? 'disabled' : ''}>
                        <span>${selectedItem.isEquipped ? '✅ Đang cầm Tay Phải' : '🤚 Cầm Tay Phải'}</span>
                      </button>
                    </div>
                  ` : selectedType === 'bait' ? `
                    <div class="inspector-main-buttons">
                      <button type="button" class="btn-inspector-action btn-inspector-use" data-equip-bag-bait="${selectedItem.id}" ${selectedItem.isEquipped ? 'disabled' : ''}>
                        <span>${selectedItem.isEquipped ? '✅ Đang dùng mồi này' : '🌿 Dùng Mồi Này'}</span>
                      </button>
                    </div>
                  ` : selectedType === 'fish' ? `
                    <div class="inspector-main-buttons">
                      <button type="button" class="btn-inspector-action btn-inspector-use" data-open-market-sell="${selectedItem.id}">
                        <span>🏮 Bán ở Chợ (⭐ +${selectedItem.sellStars})</span>
                      </button>
                      <div class="inspector-sub-btn-row">
                        <button type="button" class="btn-inspector-action btn-inspector-discard" data-release-bag-fish="${selectedItem.id}">
                          <span>🌊 Thả về hồ</span>
                        </button>
                      </div>
                    </div>
                  ` : this.confirmDiscard ? `
                    <div class="inspector-confirm-discard-box">
                      <p class="confirm-msg">⚠️ Bé có chắc muốn huỷ vật phẩm này không?</p>
                      <div class="confirm-btn-row">
                        ${selectedType === 'dish' ? `
                          <button type="button" class="btn-inspector-confirm-yes" data-discard="${selectedItem.id}">🗑️ Đồng ý huỷ</button>
                        ` : `
                          <button type="button" class="btn-inspector-confirm-yes" data-discard-ingredient="${selectedItem.id}">🗑️ Đồng ý huỷ 1 phần</button>
                        `}
                        <button type="button" class="btn-inspector-confirm-no" data-action="keep">Giữ lại</button>
                      </div>
                    </div>
                  ` : `
                    <div class="inspector-main-buttons">
                      ${selectedType === 'dish' ? `
                        <button type="button" class="btn-inspector-action btn-inspector-use" data-eat="${selectedItem.id}">
                          <span>😋 Dùng Món</span>
                        </button>
                        <div class="inspector-sub-btn-row">
                          <button type="button" class="btn-inspector-action btn-inspector-feed" data-feed-pet="${selectedItem.id}">
                            <span>🐶 Cho Cún Ăn</span>
                          </button>
                          <button type="button" class="btn-inspector-action btn-inspector-discard" data-action="ask-discard">
                            <span>🗑️ Huỷ</span>
                          </button>
                        </div>
                      ` : `
                        <div class="inspector-sub-btn-row" style="display:flex;gap:8px;width:100%;box-sizing:border-box;align-items:center;">
                          <button type="button" class="btn-inspector-action btn-inspector-use" data-use-ingredient="${selectedItem.id}" style="flex:1.7;min-width:0;width:auto;padding:0 8px;">
                            <span>😋 Dùng Ăn (+1 ❤️)</span>
                          </button>
                          <button type="button" class="btn-inspector-action btn-inspector-discard" data-action="ask-discard" style="flex:1;min-width:0;width:auto;padding:0 6px;">
                            <span>🗑️ Huỷ</span>
                          </button>
                        </div>
                      `}
                    </div>
                  `}
                </div>
              </div>
            ` : `
              <div class="bag-inspector-empty-card">
                <div class="inspector-placeholder-icon">🤚</div>
                <h4>Túi Đồ & Tay Phải</h4>
                <p>Kéo <b>Cần câu</b> vào <b>Tay Phải</b> hoặc chạm vào vật phẩm để dùng nhé!</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
    this.setupBagEquipmentDragAndDrop();
  }
  renderCook(state) {
    const s = state.session, r = getRecipe(s.recipeId);
    if (!r) { this.tab = 'recipes'; return this.render(); }

    if (s.phase === 'cooking') {
      this.content.innerHTML = `<div class="kitchen-result"><div class="kitchen-cooking-animation ${r.heat === 'off' ? 'cold' : ''}" aria-hidden="true"><span class="kitchen-steam">♨</span><span class="kitchen-cooking-pot">${r.heat === 'off' ? '🥣' : '🍲'}</span><span>${r.heat === 'off' ? '🥄' : '🔥🔥'}</span></div>
        <h3>Đang ${r.heat === 'off' ? 'trộn / xếp' : 'nấu'} ${r.name.toLowerCase()}…</h3><progress id="cooking-progress" max="100" value="0" aria-label="Tiến độ nấu"></progress><strong id="cooking-percent">0%</strong><p>Xong là tự cất vào túi. Bé có thể đóng bếp hoặc đợi chín nhé.</p>
        <div class="kitchen-bottom"><button type="button" class="kitchen-primary" data-action="close">✕ Đóng bếp (Bếp tự nấu)</button></div></div>`;
      this.tick(); return;
    }

    const isRecipeReady = r.ingredients.every(i => (s.staged[i.id] || 0) >= i.count);
    const ownedIngredients = INGREDIENTS.filter(i => (state.ingredients[i.id] || 0) > 0);
    this.rhythmTarget = 5;

    this.content.innerHTML = `
      <div class="cook-widescreen-container">
        <!-- 1. Thanh Top Bar: Thông tin món & Nút Xem Công Thức ở góc -->
        <div class="cook-top-bar">
          <div class="cook-top-info">
            <span class="cook-info-badge">🍳 Đang chuẩn bị: <strong>${r.icon} ${r.name}</strong></span>
            <span class="cook-diff-badge">⭐ Canh 5 nhịp chuẩn xác (Hụt 2 nhịp là hỏng món)</span>
          </div>
          <!-- NÚT XEM CÔNG THỨC Ở GÓC (Theo yêu cầu người dùng) -->
          <button type="button" class="btn-cook-view-recipes" data-action="cancel" title="Xem danh sách công thức">
            <span>📖 Xem công thức</span>
          </button>
        </div>

        <!-- 2. TÚI NGUYÊN LIỆU NẰM TRÊN VÀ KÉO THẢ XUỐNG (Theo yêu cầu người dùng) -->
        <div class="cook-top-pantry-panel">
          <div class="cook-pantry-header">
            <span class="pantry-title">🎒 Túi Nguyên Liệu (Kéo xuống nồi hoặc chạm để cho vào):</span>
          </div>
          <div class="cook-top-pantry-rack">
            ${ownedIngredients.length > 0 ? ownedIngredients.map(i => {
              const remaining = (state.ingredients[i.id] || 0) - (s.staged[i.id] || 0);
              return `
                <button type="button" draggable="true" data-ingredient="${i.id}" class="cook-pantry-item ${remaining <= 0 ? 'is-depleted' : ''}" ${remaining <= 0 ? 'disabled' : ''} title="${i.name} (Còn ${remaining})">
                  <div class="pantry-item-avatar">
                    ${i.image ? `<img class="pantry-item-img" src="${i.image}" alt="${i.name}" />` : `<span class="pantry-item-emoji">${i.icon}</span>`}
                  </div>
                  <span class="pantry-item-label">${i.name}</span>
                  <span class="pantry-item-count">x${remaining}</span>
                </button>
              `;
            }).join('') : `
              <div class="cook-pantry-empty">
                <span>Túi chưa có nguyên liệu nào.</span>
                <p class="cook-fridge-walk-hint">🚶 Bé hãy bước lại <b>Tủ Lạnh</b> trên sàn bếp để lấy thêm nguyên liệu nhé!</p>
                <button type="button" class="btn-cook-close-to-walk" data-action="close">✕ Ra sàn bếp đến Tủ Lạnh</button>
              </div>
            `}
          </div>
        </div>

        <!-- 3. KÉO THẢ VÀO GIỮA & NẾU ĐÚNG NGUYÊN LIỆU THÌ HIỆN LÊN MÓN ĂN (Theo yêu cầu người dùng) -->
        <div id="kitchen-pot-dropzone" class="cook-center-pot-dropzone" aria-label="Nồi nhận nguyên liệu">
          ${isRecipeReady ? `
            <!-- NẾU ĐỦ/ĐÚNG NGUYÊN LIỆU: HIỆN LÊN MÓN ĂN TỎA SÁNG Ở TRUNG TÂM -->
            <div class="cook-matched-dish-showcase animate-dish-glow">
              <div class="matched-dish-aura"></div>
              <div class="matched-dish-img-wrap">
                ${r.image ? `<img class="matched-dish-img" src="${r.image}" alt="${r.name}" />` : `<span class="matched-dish-emoji">${r.icon}</span>`}
              </div>
              <div class="matched-dish-info">
                <h4 class="matched-dish-title">${r.icon} ${r.name}</h4>
                <span class="matched-dish-badge">✨ ĐÃ ĐỦ NGUYÊN LIỆU! SẴN SÀNG NẤU (5 NHỊP) ✨</span>
              </div>
              <div class="cook-staged-chips">
                ${r.ingredients.map(i => `
                  <button type="button" class="staged-chip is-complete" data-remove="${i.id}" title="Chạm để bớt 1 phần">
                    <img class="staged-chip-3d-img" src="${(getIngredient(i.id) || i).image || i.image}" alt="${i.name}" /> <span class="staged-chip-text">${i.name} ${s.staged[i.id]}/${i.count} ✓ ↩</span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : `
            <!-- CHƯA ĐỦ NGUYÊN LIỆU: HIỂN THỊ NỒI VÀ YÊU CẦU NGUYÊN LIỆU -->
            <div class="cook-pot-workbench">
              <div class="cook-pot-visual">
                <span class="cook-pot-emoji">${r.heat === 'off' ? '🥣' : '🥘'}</span>
                <strong class="cook-pot-title">Thả vào đây</strong>
                <span class="cook-pot-guide">Hoặc chạm nguyên liệu ở trên để thêm vào nồi</span>
              </div>
              <div class="cook-requirements-rack">
                ${r.ingredients.map(i => {
                  const current = s.staged[i.id] || 0;
                  const done = current >= i.count;
                  return `
                    <div class="cook-req-card ${done ? 'is-done' : 'is-pending'}">
                      <div class="cook-req-avatar-wrap"><img class="cook-req-3d-img" src="${(getIngredient(i.id) || i).image || i.image}" alt="${i.name}" /></div>
                      <span class="req-name">${i.name}</span>
                      <span class="req-count">${current}/${i.count}</span>
                      ${done ? '<span class="req-check">✓</span>' : ''}
                    </div>
                  `;
                }).join('')}
              </div>
              ${r.ingredients.some(i => s.staged[i.id]) ? `
                <div class="cook-staged-chips">
                  ${r.ingredients.filter(i => s.staged[i.id]).map(i => `
                    <button type="button" class="staged-chip" data-remove="${i.id}" title="Chạm để bớt 1 phần">
                      <img class="staged-chip-3d-img" src="${(getIngredient(i.id) || i).image || i.image}" alt="${i.name}" /> <span class="staged-chip-text">${i.name} x${s.staged[i.id]} ↩</span>
                    </button>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `}
        </div>

        <!-- 4. THAY ĐỔI PHẦN MÀU ĐEN: NÚT BẮT ĐẦU NẤU & CANH NHỊP AUDITION (Theo yêu cầu người dùng) -->
        <div class="cook-bottom-console">
          ${!isRecipeReady ? `
            <div class="cook-waiting-bar">
              <span class="waiting-text">Bé hãy thả đủ nguyên liệu vào nồi để sẵn sàng nấu nhé!</span>
            </div>
          ` : (
            !this.rhythmActive ? `
              <div class="cook-start-action-row">
                <button type="button" class="btn-start-cook-audition animate-btn-pulse" data-action="start-rhythm">
                  <span class="btn-text">BẮT ĐẦU NẤU (CANH NHỊP AUDITION)</span>
                </button>
              </div>
            ` : `
              <div class="audition-console">
                <div class="audition-header-row">
                  <div class="audition-title-box">
                    <strong class="audition-title">Canh viên bi vào VÙNG ĐỎ rồi bấm phím CÁCH (hoặc chạm nút)!</strong>
                  </div>
                  <div class="audition-counters-group">
                    <div class="audition-score-pill">
                      <span class="pill-label">🎯 Nhịp trúng:</span>
                      <strong class="audition-score-text">${this.rhythmScore}/${this.rhythmTarget}</strong>
                      <div class="audition-stars-meter">
                        ${Array.from({ length: this.rhythmTarget }).map((_, i) => `<span class="audition-star ${i < this.rhythmScore ? 'is-lit' : ''}"><i class="star-bead"></i></span>`).join('')}
                      </div>
                    </div>
                    <div class="audition-miss-pill">
                      <span class="pill-label">💔 Lỡ nhịp:</span>
                      <strong class="audition-miss-text ${this.rhythmMisses > 0 ? 'is-danger' : ''}">${this.rhythmMisses}/${this.maxAllowedMisses}</strong>
                      <div class="audition-miss-hearts">
                        ${Array.from({ length: this.maxAllowedMisses }).map((_, i) => `<span class="miss-heart-icon ${i < this.rhythmMisses ? 'is-missed' : ''}">${i < this.rhythmMisses ? '💔' : '🤍'}</span>`).join('')}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- THANH RAY & VIÊN BI & VÙNG ĐỎ AUDITION -->
                <div class="audition-rail-track" aria-label="Thanh canh nhịp Audition">
                  <div class="audition-red-target-zone">
                    <span class="target-zone-label">VÙNG ĐỎ</span>
                  </div>
                  <div class="audition-beat-marble" style="left: ${this.ballPos}%"></div>
                </div>

                <!-- NÚT BẤM CÁCH VÀ PHẢN HỒI -->
                <div class="audition-trigger-row">
                  <button type="button" class="btn-audition-trigger" data-action="rhythm-hit">
                    <span>BẤM CÁCH HOẶC CHẠM ĐÂY! (SPACE)</span>
                  </button>
                  <span class="audition-feedback-badge ${this.rhythmFeedbackType}">
                    ${this.rhythmFeedback}
                  </span>
                </div>
              </div>
            `
          )}
        </div>
      </div>
    `;

    if (this.rhythmActive && !this.rhythmAnimId) {
      this.startAuditionLoop(this.rhythmTarget);
    }
    this.setupDragAndDrop();
  }

  startAuditionLoop(target = 5) {
    this.rhythmActive = true;
    this.rhythmScore = 0;
    this.rhythmTarget = target;
    this.ballPos = 8;
    this.ballDir = 1;
    this.rhythmFeedback = 'Canh viên bi vào VÙNG ĐỎ rồi bấm CÁCH hoặc chạm nút nhé!';
    this.rhythmFeedbackType = '';
    this.stopAuditionLoop();
    this.rhythmLastTime = performance.now();
    
    const speed = 72; // percent per second -> ~1.35 seconds per sweep
    const animate = (now) => {
      if (!this.rhythmActive) return;
      const dt = Math.min(0.05, (now - this.rhythmLastTime) / 1000);
      this.rhythmLastTime = now;
      
      this.ballPos += this.ballDir * speed * dt;
      if (this.ballPos >= 96) {
        this.ballPos = 96;
        this.ballDir = -1;
      } else if (this.ballPos <= 4) {
        this.ballPos = 4;
        this.ballDir = 1;
      }
      
      this.updateAuditionBallUI();
      this.rhythmAnimId = requestAnimationFrame(animate);
    };
    
    this.rhythmAnimId = requestAnimationFrame(animate);
  }

  stopAuditionLoop() {
    if (this.rhythmAnimId) {
      cancelAnimationFrame(this.rhythmAnimId);
      this.rhythmAnimId = null;
    }
  }

  updateAuditionBallUI() {
    const ballEl = this.content.querySelector('.audition-beat-marble');
    if (ballEl) {
      ballEl.style.left = `${this.ballPos}%`;
    }
  }

  updateAuditionScoreUI() {
    const scoreVal = this.content.querySelector('.audition-score-text');
    if (scoreVal) scoreVal.textContent = `${this.rhythmScore}/${this.rhythmTarget}`;
    
    const starsContainer = this.content.querySelector('.audition-stars-meter');
    if (starsContainer) {
      starsContainer.innerHTML = Array.from({ length: this.rhythmTarget }).map((_, i) =>
        `<span class="audition-star ${i < this.rhythmScore ? 'is-lit' : ''}">${i < this.rhythmScore ? '⭐' : '☆'}</span>`
      ).join('');
    }

    const missVal = this.content.querySelector('.audition-miss-text');
    if (missVal) {
      missVal.textContent = `${this.rhythmMisses}/${this.maxAllowedMisses}`;
      missVal.className = `audition-miss-text ${this.rhythmMisses > 0 ? 'is-danger' : ''}`;
    }

    const missHearts = this.content.querySelector('.audition-miss-hearts');
    if (missHearts) {
      missHearts.innerHTML = Array.from({ length: this.maxAllowedMisses }).map((_, i) =>
        `<span class="miss-heart-icon ${i < this.rhythmMisses ? 'is-missed' : ''}">${i < this.rhythmMisses ? '💔' : '🤍'}</span>`
      ).join('');
    }

    const feedbackEl = this.content.querySelector('.audition-feedback-badge');
    if (feedbackEl) {
      feedbackEl.textContent = this.rhythmFeedback;
      feedbackEl.className = `audition-feedback-badge ${this.rhythmFeedbackType}`;
    }

    const trackEl = this.content.querySelector('.audition-rail-track');
    if (trackEl && this.rhythmFeedbackType === 'hit') {
      trackEl.classList.remove('track-hit-flash');
      void trackEl.offsetWidth;
      trackEl.classList.add('track-hit-flash');
    } else if (trackEl && this.rhythmFeedbackType === 'miss') {
      trackEl.classList.remove('track-miss-shake');
      void trackEl.offsetWidth;
      trackEl.classList.add('track-miss-shake');
    }
  }

  
  playCelebrationFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      window.setTimeout(() => {
        this.audio?.playChime?.(freq, 0.22);
      }, idx * 95);
    });
  }

  triggerAuditionHitFX(isHit) {
    const consoleEl = this.content.querySelector('.audition-console');
    if (!consoleEl) return;

    // 1. Chữ bay hiệu ứng (Floating combo text)
    const flyout = document.createElement('div');
    flyout.className = `audition-hit-flyout ${isHit ? 'hit' : 'miss'}`;
    flyout.textContent = isHit
      ? `+1 NHỊP! (${this.rhythmScore}/${this.rhythmTarget})`
      : 'HỤT RỒI!';
    consoleEl.appendChild(flyout);
    setTimeout(() => flyout.remove(), 750);

    // 2. Hiệu ứng blast trên nút bấm
    const triggerBtn = this.content.querySelector('.btn-audition-trigger');
    if (triggerBtn) {
      triggerBtn.classList.remove('is-hit-blast', 'is-miss-blast');
      void triggerBtn.offsetWidth;
      triggerBtn.classList.add(isHit ? 'is-hit-blast' : 'is-miss-blast');
    }

    // 3. Hiệu ứng viên bi phát sáng
    const marble = this.content.querySelector('.audition-beat-marble');
    if (marble && isHit) {
      marble.classList.remove('marble-hit-burst');
      void marble.offsetWidth;
      marble.classList.add('marble-hit-burst');
      setTimeout(() => marble?.classList.remove('marble-hit-burst'), 220);
    }

    // 4. Hiệu ứng vùng đỏ lóe sáng
    const targetZone = this.content.querySelector('.audition-red-target-zone');
    if (targetZone && isHit) {
      targetZone.classList.remove('zone-hit-flash');
      void targetZone.offsetWidth;
      targetZone.classList.add('zone-hit-flash');
      setTimeout(() => targetZone?.classList.remove('zone-hit-flash'), 300);
    }

    // 5. Hiệu ứng rung hoặc chớp thanh ray
    const trackEl = this.content.querySelector('.audition-rail-track');
    if (trackEl) {
      if (isHit) {
        trackEl.classList.remove('track-hit-flash');
        void trackEl.offsetWidth;
        trackEl.classList.add('track-hit-flash');
      } else {
        trackEl.classList.remove('track-miss-shake');
        void trackEl.offsetWidth;
        trackEl.classList.add('track-miss-shake');
      }
    }
  }

evaluateAuditionHit() {
    if (!this.rhythmActive) return;
    const s = this.system.getState().session;
    if (!s) return;
    
    // Target zone: 70% to 86%. With child-friendly tolerance: 66% to 90%
    const inRedZone = this.ballPos >= 66 && this.ballPos <= 90;
    
    if (inRedZone) {
      this.rhythmScore++;
      this.rhythmFeedback = `PERFECT! +1 Nhịp (${this.rhythmScore}/${this.rhythmTarget})`;
      this.rhythmFeedbackType = 'hit';
      const pitch = 560 + (this.rhythmScore * 95);
      this.audio?.playChime(pitch, 0.15);
      try { if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(38); } catch(e){}
      this.triggerAuditionHitFX(true);
      this.updateAuditionScoreUI();
      
      if (this.rhythmScore >= this.rhythmTarget) {
        this.stopAuditionLoop();
        this.rhythmActive = false;
        this.completeCookingSuccess(s.id);
      }
    } else {
      this.rhythmMisses++;
      this.triggerAuditionHitFX(false);
      this.audio?.playChime(320, 0.12);
      
      if (this.rhythmMisses >= this.maxAllowedMisses) {
        this.rhythmFeedback = '💔 Đã hụt 2 nhịp! Món ăn bị cháy khét!';
        this.rhythmFeedbackType = 'miss';
        this.updateAuditionScoreUI();
        this.stopAuditionLoop();
        this.rhythmActive = false;
        setTimeout(() => {
          this.failCookingSession(s.id);
        }, 400);
        return;
      }

      this.rhythmFeedback = `Hụt rồi (${this.rhythmMisses}/${this.maxAllowedMisses} lần)! Bé canh lại nhé!`;
      this.rhythmFeedbackType = 'miss';
      this.updateAuditionScoreUI();
    }
  }


  failCookingSession(sessionId) {
    const s = this.system.getState().session;
    const recipe = s ? getRecipe(s.recipeId) : null;
    this.failedDishRecipe = recipe;
    this.stopAuditionLoop();
    this.rhythmActive = false;
    
    if (this.system.failSession) {
      this.system.failSession(sessionId);
    } else if (this.system.cancel) {
      this.system.cancel();
    }
    
    this.tab = 'cook-failed';
    this.render();
  }

  renderCookFailed(recipe) {
    const titleEl = this.root.querySelector('#kitchen-title');
    const eyebrowEl = this.root.querySelector('.kitchen-eyebrow');
    if (titleEl) titleEl.innerHTML = 'Món Ăn Bị Cháy Khét! <img src="/assets/ui/custom_kids_ui/icon_heart_empty.png" class="modal-title-3d-icon" alt="⚠️">';
    if (eyebrowEl) eyebrowEl.textContent = 'BẾP CẦU VỒNG • CHƯA THÀNH CÔNG';

    this.content.innerHTML = `
      <div class="cook-failed-screen">
        <div class="failed-header-ribbon">
          <span class="ribbon-sparkle">⚠️</span>
          <h3 class="failed-screen-heading">CHÁY KHÉT MẤT RỒI!</h3>
          <span class="ribbon-sparkle">⚠️</span>
        </div>
        
        <div class="failed-dish-card animate-card-pop">
          <div class="failed-smoke-fx" aria-hidden="true">💨</div>
          <div class="failed-dish-avatar-wrap">
            <span class="failed-dish-burnt-pot">🥘💨💔</span>
          </div>
          <h4 class="failed-dish-name">${recipe ? recipe.name : 'Món ăn'}</h4>
          <div class="failed-reason-pill">
            <span>💔 Hụt 2/2 nhịp Audition</span>
          </div>
          <p class="failed-dish-desc">Bé đã bấm lỡ 2 nhịp nên món ăn bị cháy khét mất rồi! Toàn bộ nguyên liệu nấu đã bị hỏng.</p>
          <div class="failed-advice-box">
            💡 Bé hãy ghé <b>Tủ Lạnh</b> lấy thêm nguyên liệu và lần sau canh viên bi vào đúng <b>VÙNG ĐỎ</b> nhé!
          </div>
        </div>

        <div class="failed-actions-row">
          <button type="button" class="btn-failed-go-fridge animate-btn-pulse" data-action="fridge">
            <span>🧊 Vào Tủ Lạnh Lấy Thêm</span>
          </button>
          <button type="button" class="btn-failed-back-recipes" data-action="recipes">
            <span>📖 Trở Về Danh Sách Món</span>
          </button>
        </div>
      </div>
    `;
    this.audio?.playChime?.(220, 0.4);
    this.say('Cháy khét mất rồi! Bé đã hụt hai nhịp nên món ăn chưa thành công. Toàn bộ nguyên liệu đã bị hỏng mất rồi. Bé hãy thử lại nhé!');
  }

  completeCookingSuccess(sessionId) {
    const s = this.system.getState().session;
    if (!s) return;
    const recipe = getRecipe(s.recipeId);
    const result = this.system.cookInstant ? this.system.cookInstant(s.id) : this.system.cook(s.id);
    if (result.ok) {
      this.cookedDishReward = result.recipe || recipe;
      this.tab = 'cook-success';
      this.render();
      this.audio?.playChime(1046, 0.4);
      this.notify(`🎉 Tuyệt vời! Bé đã nấu thành công món ${recipe.name}!`);
    } else {
      this.notify(result.message || 'Có chút nhầm lẫn, bé thử lại nhé!');
      this.render();
    }
  }

  renderCookSuccess(recipe) {
    if (!recipe) { this.tab = 'recipes'; return this.render(); }
    this.content.innerHTML = `
      <div class="cook-success-container">
        <!-- Lớp pháo hoa giấy confetti chúc mừng -->
        <div class="success-confetti-layer" aria-hidden="true">
          ${Array.from({ length: 28 }).map((_, i) =>
            `<span class="confetti-piece c-${i % 6}" style="left: ${(i * 3.5 + (i * 7) % 11)}%; animation-delay: ${((i * 0.07) % 1.5).toFixed(2)}s; animation-duration: ${(1.8 + (i % 5) * 0.25).toFixed(2)}s"></span>`
          ).join('')}
        </div>

        <div class="success-ribbon animate-ribbon-down">
          <span class="ribbon-sparkle">✦</span>
          <h3 class="success-title">BÉ NẤU THÀNH CÔNG RỒI!</h3>
          <span class="ribbon-sparkle">✦</span>
        </div>
        
        <div class="success-dish-card animate-card-pop">
          <div class="success-dish-halo"></div>
          <div class="success-dish-halo-rays" aria-hidden="true"></div>
          <div class="success-dish-avatar-wrap">
            ${recipe.image ? `<img class="success-dish-img animate-dish-bounce" src="${recipe.image}" alt="${recipe.name}" />` : `<span class="success-dish-emoji">${recipe.icon}</span>`}
          </div>
          <h4 class="success-dish-name">${recipe.name}</h4>
          <div class="success-dish-effect-pill">
            <span>Tác dụng:</span> <strong>${effectLabel(recipe.effect)}</strong>
          </div>
          <p class="success-dish-desc">Món ăn thơm ngon, bổ dưỡng đã được cất cẩn thận vào túi của bé!</p>
        </div>

        <div class="success-actions-row">
          <button type="button" class="btn-success-open-bag animate-btn-pulse" data-action="bag">
            <span>Mở Túi Đồ Của Bé</span>
          </button>
          <button type="button" class="btn-success-cook-more" data-action="recipes">
            <span>Nấu Tiếp Món Khác</span>
          </button>
        </div>
      </div>
    `;
    this.playCelebrationFanfare();
    this.say(`Hoan hô bé! Món ${recipe.name} thơm ngon đã nấu chín xuất sắc! Bé thật khéo tay!`);
  }

  setupDragAndDrop() {
    const pot = this.content.querySelector('#kitchen-pot-dropzone');
    if (!pot) return;
    const items = this.content.querySelectorAll('[data-ingredient]:not(:disabled)');
    let ghost, active, start, moved = false;
    const cleanup = () => { ghost?.remove(); ghost=null; active=null; pot?.classList.remove('kitchen-drop-hover'); };
    this.cleanupDrag = cleanup;
    const over = (x,y) => {
      if (!pot) return false;
      const b=pot.getBoundingClientRect();
      return x>=b.left && x<=b.right && y>=b.top && y<=b.bottom;
    };
    items.forEach(item => {
      item.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain',item.dataset.ingredient); e.dataTransfer.effectAllowed='copy'; });
      item.addEventListener('dragend', cleanup);
      item.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse') return;
        active=item; start={x:e.clientX,y:e.clientY}; moved=false; item.setPointerCapture(e.pointerId);
      });
      item.addEventListener('pointermove', e => {
        if (active!==item) return;
        if (!moved && Math.hypot(e.clientX-start.x,e.clientY-start.y)<8) return;
        moved=true;
        if (!ghost) {
          ghost=document.createElement('div');
          ghost.className='kitchen-pointer-ghost';
          const ing = getIngredient(item.dataset.ingredient);
          if (ing?.image) {
            ghost.innerHTML = `<img src="${ing.image}" alt="${ing.name}" class="ghost-3d-img" />`;
          } else {
            ghost.textContent = ing ? ing.icon : '🥕';
          }
          document.body.append(ghost);
        }
        ghost.style.left=`${e.clientX}px`; ghost.style.top=`${e.clientY}px`; pot.classList.toggle('kitchen-drop-hover',over(e.clientX,e.clientY));
      });
      item.addEventListener('pointerup', e => {
        if (active!==item) return;
        const drop=moved&&over(e.clientX,e.clientY), id=item.dataset.ingredient;
        if (moved) { e.preventDefault(); this.suppressClickUntil=Date.now()+350; }
        cleanup(); if(drop) this.addIngredient(id);
      });
      item.addEventListener('pointercancel', cleanup);
    });
    pot.addEventListener('dragover', e=> { e.preventDefault(); pot.classList.add('kitchen-drop-hover'); });
    pot.addEventListener('dragleave', ()=>pot.classList.remove('kitchen-drop-hover'));
    pot.addEventListener('drop', e=> { e.preventDefault(); const id=e.dataTransfer.getData('text/plain'); cleanup(); this.addIngredient(id); });
  }

  setupBagEquipmentDragAndDrop() {
    const rightHandZone = this.content.querySelector('#bag-right-hand-dropzone');
    const baitZone = this.content.querySelector('#bag-bait-dropzone');
    const accessoryZone = this.content.querySelector('#bag-accessory-dropzone');
    const headerSlots = this.root.querySelectorAll('.backpack-header-slot');
    const bpSystem = this.backpackSystem || (typeof window !== 'undefined' ? window.__backpackSystem : null);
    const fSys = this.fashionSystem || (typeof window !== 'undefined' ? window.__fashionSystem : null);
    const isOverSlot = (slot, x, y) => {
      if (!slot) return false;
      const r = slot.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    if (!rightHandZone && !baitZone && !headerSlots.length && !accessoryZone) return;

    const fs = this.fishingSystem || (typeof window !== 'undefined' ? window.__fishingSystem : null);
    const rodCards = this.content.querySelectorAll('[data-drag-rod]');
    const baitCards = this.content.querySelectorAll('[data-drag-bait]');

    let ghost = null;
    let activeCard = null;
    let dragKind = null;
    let dragId = null;
    let startPt = null;
    let moved = false;

    const cleanup = () => {
      ghost?.remove();
      ghost = null;
      activeCard = null;
      dragKind = null;
      dragId = null;
      rightHandZone?.classList.remove('kitchen-drop-hover');
      baitZone?.classList.remove('kitchen-drop-hover');
      accessoryZone?.classList.remove('kitchen-drop-hover');
      headerSlots?.forEach(s => s.classList.remove('drag-over'));
    };
    this.cleanupDrag = cleanup;

    const isOver = (zone, x, y) => {
      if (!zone) return false;
      const r = zone.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };

    const applyEquip = (kind, id) => {
      if (kind === 'accessory') {
        if (fSys && id) {
          const prevAccId = fSys.getState?.()?.equippedAccessoryId || fSys.getState?.()?.currentAccessory || null;
          fSys.equipAccessory(id);
          this.selectedAccessory = id;
          this.render();
          const acc = ACCESSORIES_CATALOG[id];
          const prevAcc = prevAccId ? ACCESSORIES_CATALOG[prevAccId] : null;
          if (prevAcc && prevAcc.id !== id) {
            this.notify(`👑 Đã đổi sang ${acc?.name || 'Phụ kiện'}! (${prevAcc.name} đã cất lại vào túi)`);
          } else {
            this.notify(`👑 Đã đeo ${acc?.name || 'Phụ kiện'} lên Bé!`);
          }
          this.audio?.playEquipAccessory?.() || this.audio?.playChime?.(880, 0.16);
        }
        return;
      }
      if (!fs || !id) return;
      if (kind === 'rod') {
        const prevRodId = fs.getState?.()?.equippedRod;
        const res = fs.equipRod(id);
        if (res.ok) {
          this.selectedRod = id;
          this.render();
          const prevRod = prevRodId ? getRod(prevRodId) : null;
          if (prevRod && prevRod.id !== id) {
            this.notify(`🤚 Đã đổi sang ${res.rod?.name || 'Cần câu'}! (${prevRod.name} đã cất lại vào túi)`);
          } else {
            this.notify(`🤚 Đã cầm ${res.rod?.name || 'Cần câu'} vào Tay Phải!`);
          }
          this.audio?.playChime(880, 0.16);
        }
      } else if (kind === 'bait') {
        const prevBaitId = fs.getState?.()?.equippedBait;
        const res = fs.equipBait(id);
        if (res.ok) {
          this.selectedBait = id;
          this.render();
          const prevBait = prevBaitId ? getBait(prevBaitId) : null;
          if (prevBait && prevBait.id !== id) {
            this.notify(`🌿 Đã đổi sang ${res.bait?.name || 'Mồi câu'}! (${prevBait.name} đã cất lại vào túi)`);
          } else {
            this.notify(`🌿 Đã chọn ${res.bait?.name || 'Mồi câu'}!`);
          }
          this.audio?.playChime(840, 0.14);
        }
      }
    };

    const bindDraggable = (card, kind, id, emoji) => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', `${kind}:${id}`);
        e.dataTransfer.effectAllowed = 'copyMove';
      });
      card.addEventListener('dragend', cleanup);

      card.addEventListener('pointerdown', (e) => {
        activeCard = card;
        dragKind = kind;
        dragId = id;
        startPt = { x: e.clientX, y: e.clientY };
        moved = false;
        try { card.setPointerCapture(e.pointerId); } catch {}
      });
      card.addEventListener('pointermove', (e) => {
        if (activeCard !== card) return;
        if (!moved && Math.hypot(e.clientX - startPt.x, e.clientY - startPt.y) < 8) return;
        moved = true;
        if (!ghost) {
          ghost = document.createElement('div');
          ghost.className = 'kitchen-pointer-ghost';
          ghost.textContent = emoji;
          document.body.append(ghost);
        }
        ghost.style.left = `${e.clientX}px`;
        ghost.style.top = `${e.clientY}px`;
        
        if (kind === 'backpack' || kind === 'equipped_backpack_slot') {
          headerSlots.forEach(s => s.classList.toggle('drag-over', isOverSlot(s, e.clientX, e.clientY)));
        }

        if (kind === 'rod' && rightHandZone) {
          rightHandZone.classList.toggle('kitchen-drop-hover', isOver(rightHandZone, e.clientX, e.clientY));
        } else if (kind === 'bait' && baitZone) {
          baitZone.classList.toggle('kitchen-drop-hover', isOver(baitZone, e.clientX, e.clientY));
        } else if (kind === 'accessory' && accessoryZone) {
          accessoryZone.classList.toggle('kitchen-drop-hover', isOver(accessoryZone, e.clientX, e.clientY));
        }
      });
      card.addEventListener('pointerup', (e) => {
        if (activeCard !== card) return;
        const targetZone = kind === 'rod' ? rightHandZone : (kind === 'bait' ? baitZone : (kind === 'accessory' ? accessoryZone : null));
        
        if (kind === 'accessory') {
          if (accessoryZone && isOver(accessoryZone, e.clientX, e.clientY)) {
            cleanup();
            applyEquip('accessory', id);
            return;
          }
          // Kéo phụ kiện này thả lên phụ kiện khác trong túi -> Tự động đổi vị trí!
          const targetAccCard = [...accCards].find(c => c !== card && isOver(c, e.clientX, e.clientY));
          if (targetAccCard) {
            const targetId = targetAccCard.dataset.dragAccessory;
            if (targetId && targetId !== id) {
              const owned = [...(fSys?.getState?.()?.ownedAccessories || [])];
              const idxA = owned.indexOf(id);
              const idxB = owned.indexOf(targetId);
              if (idxA !== -1 && idxB !== -1) {
                owned[idxA] = targetId;
                owned[idxB] = id;
                fSys.saveState({ ownedAccessories: owned });
                cleanup();
                this.render();
                const accA = ACCESSORIES_CATALOG[id];
                const accB = ACCESSORIES_CATALOG[targetId];
                this.notify(`👑 Đã đổi vị trí ${accA?.name} và ${accB?.name}! ✨`);
                this.audio?.playDragDrop?.() || this.audio?.playChime?.(840, 0.14);
                return;
              }
            }
          }
        }
        if (kind === 'equipped_accessory' && fSys) {
          // Kéo phụ kiện đang đeo thả lên một phụ kiện khác trong túi -> TỰ ĐỘNG ĐỔI VỊ TRÍ!
          const targetAccCard = [...accCards].find(c => isOver(c, e.clientX, e.clientY));
          if (targetAccCard) {
            const targetId = targetAccCard.dataset.dragAccessory;
            if (targetId && targetId !== id) {
              fSys.equipAccessory(targetId);
              cleanup();
              this.selectedAccessory = targetId;
              this.render();
              const newAcc = ACCESSORIES_CATALOG[targetId];
              const oldAcc = ACCESSORIES_CATALOG[id];
              this.notify(`👑 Đã đổi sang ${newAcc?.name || 'Phụ kiện'}! (${oldAcc?.name || 'Phụ kiện'} đã cất lại vào túi)`);
              this.audio?.playEquipAccessory?.() || this.audio?.playChime?.(880, 0.16);
              return;
            }
          }
          if (moved) {
            fSys.unequipAccessory();
            cleanup();
            this.selectedAccessory = id;
            this.render();
            const acc = ACCESSORIES_CATALOG[id];
            this.notify(`🎒 Đã tháo ${acc?.name || 'Phụ kiện'} cất lại vào túi!`);
            this.audio?.playDragDrop?.() || this.audio?.playChime?.(660, 0.14);
            return;
          }
        }

        if (kind === 'backpack' && bpSystem) {
          const targetSlot = [...headerSlots].find(s => isOverSlot(s, e.clientX, e.clientY));
          if (targetSlot) {
            const slotIdx = parseInt(targetSlot.dataset.headerBackpackSlot, 10);
            const res = bpSystem.equipBackpack(id, slotIdx);
            if (res.ok) {
              this.selectedBackpack = id;
              this.render();
              this.notify(res.message);
              this.audio?.playChime(880, 0.16);
              return;
            }
          }
        }
        if (kind === 'equipped_backpack_slot' && bpSystem) {
          const targetSlot = [...headerSlots].find(s => isOverSlot(s, e.clientX, e.clientY));
          const fromSlot = parseInt(id, 10);
          if (targetSlot) {
            const toSlot = parseInt(targetSlot.dataset.headerBackpackSlot, 10);
            if (fromSlot !== toSlot) {
              bpSystem.swapSlots(fromSlot, toSlot);
              cleanup();
              this.render();
              this.notify(`Đã chuyển Balo sang Ô ${toSlot + 1}! 🎒`);
              this.audio?.playChime(840, 0.14);
              return;
            }
          } else if (moved) {
            // Kéo từ ô 1-4 thả lại vào túi -> Tháo gỡ và mất tác dụng mở rộng ô
            const res = bpSystem.unequipSlot(fromSlot);
            cleanup();
            if (res.ok) {
              this.selectedBackpack = res.removedId;
              this.render();
              this.notify(`Đã cất ${res.backpack?.name || 'Balo'} lại vào túi!`);
              this.audio?.playChime(660, 0.14);
              return;
            }
          }
        }

        const dropped = moved && targetZone && isOver(targetZone, e.clientX, e.clientY);
        if (moved) {
          e.preventDefault();
          this.suppressClickUntil = Date.now() + 350;
        }
        cleanup();
        if (dropped) {
          applyEquip(kind, id);
        }
      });
      card.addEventListener('pointercancel', cleanup);
    };

    rodCards.forEach((c) => {
      const id = c.dataset.dragRod;
      const rod = getRod(id);
      bindDraggable(c, 'rod', id, rod?.icon || '🎣');
    });

    baitCards.forEach((c) => {
      const id = c.dataset.dragBait;
      const bait = getBait(id);
      bindDraggable(c, 'bait', id, bait?.icon || '🧁');
    });

    const accCards = this.content.querySelectorAll('[data-drag-accessory]');
    accCards.forEach((c) => {
      const id = c.dataset.dragAccessory;
      const acc = ACCESSORIES_CATALOG[id];
      bindDraggable(c, 'accessory', id, acc?.badge || '👑');
    });

    if (accessoryZone && accessoryZone.dataset.dragEquippedAccessory) {
      const eqAccId = accessoryZone.dataset.dragEquippedAccessory;
      const acc = ACCESSORIES_CATALOG[eqAccId];
      bindDraggable(accessoryZone, 'equipped_accessory', eqAccId, acc?.badge || '👑');
    }

    const bpCards = this.content.querySelectorAll('[data-drag-bp]');
    bpCards.forEach((c) => {
      const id = c.dataset.dragBp;
      const bp = getBackpack(id);
      bindDraggable(c, 'backpack', id, bp?.icon || '🎒');
    });

    headerSlots.forEach((slot) => {
      const slotIdx = parseInt(slot.dataset.headerBackpackSlot, 10);
      const eqSlot = slot.dataset.dragEquippedSlot;
      if (eqSlot !== undefined) {
        bindDraggable(slot, 'equipped_backpack_slot', slotIdx, '🎒');
      }

      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.classList.add('drag-over');
      });
      slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        const raw = e.dataTransfer.getData('text/plain') || '';
        cleanup();
        const [k, dId] = raw.split(':');
        if (k === 'backpack' && bpSystem) {
          const res = bpSystem.equipBackpack(dId, slotIdx);
          if (res.ok) {
            this.selectedBackpack = dId;
            this.render();
            this.notify(res.message);
            this.audio?.playEquipAccessory?.();
          }
        } else if (k === 'equipped_backpack_slot' && bpSystem) {
          const fromSlot = parseInt(dId, 10);
          if (fromSlot !== slotIdx) {
            bpSystem.swapSlots(fromSlot, slotIdx);
            this.render();
            this.notify(`Đã chuyển Balo sang Ô ${slotIdx + 1}! 🎒`);
            this.audio?.playDragDrop?.();
          }
        }
      });
    });

    const bagPanel = this.content.querySelector('.bag-slots-panel') || this.content.querySelector('.bag-horizontal-container');
    if (bagPanel) {
      bagPanel.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      bagPanel.addEventListener('drop', (e) => {
        const raw = e.dataTransfer.getData('text/plain') || '';
        const [k, dId] = raw.split(':');
        if (k === 'equipped_backpack_slot' && bpSystem) {
          e.preventDefault();
          cleanup();
          const fromSlot = parseInt(dId, 10);
          const res = bpSystem.unequipSlot(fromSlot);
          if (res.ok) {
            this.selectedBackpack = res.removedId;
            this.render();
            this.notify(`Đã cất ${res.backpack?.name || 'Balo'} lại vào túi!`);
            this.audio?.playDragDrop?.();
          }
        } else if (k === 'equipped_accessory' && fSys) {
          e.preventDefault();
          cleanup();
          fSys.unequipAccessory();
          this.selectedAccessory = dId;
          this.render();
          const acc = ACCESSORIES_CATALOG[dId];
          this.notify(`🎒 Đã tháo ${acc?.name || 'Phụ kiện'} cất lại vào túi!`);
          this.audio?.playDragDrop?.();
        }
      });
    }

    if (accessoryZone) {
      accessoryZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        accessoryZone.classList.add('kitchen-drop-hover');
      });
      accessoryZone.addEventListener('dragleave', () => accessoryZone.classList.remove('kitchen-drop-hover'));
      accessoryZone.addEventListener('drop', (e) => {
        e.preventDefault();
        accessoryZone.classList.remove('kitchen-drop-hover');
        const raw = e.dataTransfer.getData('text/plain') || '';
        cleanup();
        const [k, dId] = raw.split(':');
        if (k === 'accessory') {
          applyEquip('accessory', dId);
        }
      });
    }

    [rightHandZone, baitZone].filter(Boolean).forEach((zone) => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('kitchen-drop-hover');
      });
      zone.addEventListener('dragleave', () => zone.classList.remove('kitchen-drop-hover'));
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData('text/plain') || '';
        cleanup();
        const [kind, id] = raw.split(':');
        if (kind && id) {
          applyEquip(kind, id);
        }
      });
    });
  }

  addIngredient(id) {
    const s=this.system.getState().session; if(!s) return;
    const result=this.system.stage(s.id,id); this.render();
    if(!result.ok) this.notify(result.message); else this.audio?.playChime(700,.08);
  }

  handle(button) {
    if (button.dataset.openMarketSell) {
      this.close();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('game:open-market-station', { detail: { station: { type: 'fish_scale_stall' } } }));
      }
      return;
    }

    if (button.dataset.convertFish) {
      const fs = this.fishingSystem || (typeof window !== 'undefined' ? window.__fishingSystem : null);
      if (fs) {
        const res = fs.convertFishToCookingPortions(button.dataset.convertFish);
        this.render();
        if (res.ok) {
          const sp = getFishSpecies(res.fish.speciesId);
          this.notify(`🐟 Đã sơ chế ${sp?.name || 'cá'} (${res.fish.weightG}g) thành +${res.portionsAdded} phần cá tươi trong túi!`);
          this.audio?.playChime(880, 0.18);
        } else {
          this.notify('Túi cá tươi đã đầy 99 phần rồi!');
        }
      }
      return;
    }

    if (button.dataset.bagFilter) { this.bagFilter = button.dataset.bagFilter; return this.render(); }
    if (button.dataset.action === 'clear-selection') {
      this.selectedDish = null;
      this.selectedIngredient = null;
      this.selectedRod = null;
      this.selectedBait = null;
      this.selectedFish = null;
      this.selectedBackpack = null;
      this.selectedBackpackSlot = null;
      this.confirmDiscard = false;
      return this.render();
    }

    if (button.dataset.bpSlot) {
      this.selectedBackpack = button.dataset.bpSlot;
      this.selectedBackpackSlot = null;
      this.selectedDish = null;
      this.selectedIngredient = null;
      this.selectedRod = null;
      this.selectedBait = null;
      this.selectedFish = null;
      this.confirmDiscard = false;
      return this.render();
    }
    if (button.dataset.headerBackpackSlot !== undefined) {
      const slotIdx = parseInt(button.dataset.headerBackpackSlot, 10);
      const bpSystem = this.backpackSystem || (typeof window !== 'undefined' ? window.__backpackSystem : null);
      const bpState = bpSystem?.getState?.() || { owned: [], equipped: [] };
      const equippedBpId = bpState.equipped[slotIdx];
      if (equippedBpId) {
        this.selectedBackpack = equippedBpId;
        this.selectedBackpackSlot = slotIdx;
        this.selectedDish = null;
        this.selectedIngredient = null;
        this.selectedRod = null;
        this.selectedBait = null;
        this.selectedFish = null;
        this.confirmDiscard = false;
        return this.render();
      } else {
        // Tìm balo còn dư trong túi chưa đeo
        const counts = {};
        for (const id of bpState.owned) counts[id] = (counts[id] || 0) + 1;
        for (const id of bpState.equipped) if (id && counts[id] > 0) counts[id]--;
        const availableBpId = Object.keys(counts).find(id => counts[id] > 0);
        if (availableBpId) {
          const res = bpSystem.equipBackpack(availableBpId, slotIdx);
          if (res.ok) {
            this.selectedBackpack = availableBpId;
            this.selectedBackpackSlot = slotIdx;
            this.render();
            this.notify(res.message);
            this.audio?.playChime(880, 0.16);
          }
        } else {
          this.notify('Ô Balo còn trống! Bé hãy ghé Chợ Cầu Vồng để mua Balo mới bằng Sao nhé! 🎒');
          this.say('Ô Balo còn trống. Bé hãy ghé Chợ Cầu Vồng để mua Balo mới bằng Sao nhé!');
        }
        return;
      }
    }
    if (button.dataset.equipBpId) {
      const bpSystem = this.backpackSystem || (typeof window !== 'undefined' ? window.__backpackSystem : null);
      if (bpSystem) {
        const res = bpSystem.equipBackpack(button.dataset.equipBpId);
        if (res.ok) {
          this.selectedBackpack = button.dataset.equipBpId;
          this.render();
          this.notify(res.message);
          this.audio?.playChime(880, 0.16);
        } else {
          this.notify(res.message);
        }
      }
      return;
    }
    if (button.dataset.unequipBpSlot !== undefined) {
      const bpSystem = this.backpackSystem || (typeof window !== 'undefined' ? window.__backpackSystem : null);
      if (bpSystem) {
        const slotIdx = parseInt(button.dataset.unequipBpSlot, 10);
        const res = bpSystem.unequipSlot(slotIdx);
        if (res.ok) {
          this.render();
          this.notify(res.message);
          this.audio?.playChime(660, 0.14);
        }
      }
      return;
    }

    if (button.dataset.ingSlot) {
      this.selectedIngredient = button.dataset.ingSlot;
      this.selectedDish = null;
      this.selectedRod = null;
      this.selectedBait = null;
      this.selectedFish = null;
      this.confirmDiscard = false;
      return this.render();
    }
    if (button.dataset.rodSlot) {
      this.selectedRod = button.dataset.rodSlot;
      this.selectedDish = null;
      this.selectedIngredient = null;
      this.selectedBait = null;
      this.selectedFish = null;
      this.confirmDiscard = false;
      return this.render();
    }
    if (button.dataset.baitSlot) {
      this.selectedBait = button.dataset.baitSlot;
      this.selectedDish = null;
      this.selectedIngredient = null;
      this.selectedRod = null;
      this.selectedFish = null;
      this.confirmDiscard = false;
      return this.render();
    }
    if (button.dataset.fishSlot) {
      this.selectedFish = button.dataset.fishSlot;
      this.selectedDish = null;
      this.selectedIngredient = null;
      this.selectedRod = null;
      this.selectedBait = null;
      this.selectedAccessory = null;
      this.confirmDiscard = false;
      return this.render();
    }
    if (button.dataset.accessorySlot) {
      this.selectedAccessory = button.dataset.accessorySlot;
      this.selectedDish = null;
      this.selectedIngredient = null;
      this.selectedRod = null;
      this.selectedBait = null;
      this.selectedFish = null;
      this.selectedBackpack = null;
      this.confirmDiscard = false;
      return this.render();
    }
    if (button.dataset.accessoryDropzone) {
      const fSys = this.fashionSystem || (typeof window !== 'undefined' ? window.__fashionSystem : null);
      const fashionState = fSys?.getState?.() || { ownedAccessories: [], equippedAccessoryId: null };
      const equippedAccId = fashionState.equippedAccessoryId || fashionState.currentAccessory || null;
      if (equippedAccId) {
        this.selectedAccessory = equippedAccId;
        this.selectedDish = null;
        this.selectedIngredient = null;
        this.selectedRod = null;
        this.selectedBait = null;
        this.selectedFish = null;
        this.selectedBackpack = null;
        this.confirmDiscard = false;
        return this.render();
      } else {
        if (this.selectedAccessory) {
          if (fSys) {
            fSys.equipAccessory(this.selectedAccessory);
            const acc = ACCESSORIES_CATALOG[this.selectedAccessory];
            this.render();
            this.notify(`👑 Đã đeo ${acc?.name || 'Phụ kiện'} lên Bé!`);
            this.audio?.playChime(880, 0.16);
          }
        } else {
          this.notify('👑 Ô Phụ Kiện còn trống! Hãy chọn phụ kiện trong túi rồi kéo vào đây để đeo nhé!');
          this.say('Ô Phụ Kiện còn trống. Bé hãy kéo phụ kiện vào đây để đeo nhé!');
        }
        return;
      }
    }
    if (button.dataset.equipAccessoryId) {
      const fSys = this.fashionSystem || (typeof window !== 'undefined' ? window.__fashionSystem : null);
      if (fSys) {
        const prevAccId = fSys.getState?.()?.equippedAccessoryId || fSys.getState?.()?.currentAccessory || null;
        const newId = button.dataset.equipAccessoryId;
        fSys.equipAccessory(newId);
        this.selectedAccessory = newId;
        this.render();
        const acc = ACCESSORIES_CATALOG[newId];
        const prevAcc = prevAccId ? ACCESSORIES_CATALOG[prevAccId] : null;
        if (prevAcc && prevAcc.id !== newId) {
          this.notify(`👑 Đã đổi sang ${acc?.name || 'Phụ kiện'}! (${prevAcc.name} đã cất lại vào túi)`);
        } else {
          this.notify(`👑 Đã đeo ${acc?.name || 'Phụ kiện'} lên Bé!`);
        }
        this.audio?.playEquipAccessory?.() || this.audio?.playChime?.(880, 0.16);
      }
      return;
    }
    if (button.dataset.unequipAccessoryId) {
      const fSys = this.fashionSystem || (typeof window !== 'undefined' ? window.__fashionSystem : null);
      if (fSys) {
        fSys.unequipAccessory();
        this.selectedAccessory = button.dataset.unequipAccessoryId;
        this.render();
        const acc = ACCESSORIES_CATALOG[button.dataset.unequipAccessoryId];
        this.notify(`🎒 Đã tháo ${acc?.name || 'Phụ kiện'} cất lại vào túi!`);
        this.audio?.playChime(660, 0.14);
      }
      return;
    }
    if (button.dataset.equipBagRod) {
      const fs = this.fishingSystem || (typeof window !== 'undefined' ? window.__fishingSystem : null);
      if (fs) {
        const res = fs.equipRod(button.dataset.equipBagRod);
        this.render();
        if (res.ok) {
          this.notify(`🤚 Đã cầm ${res.rod?.name || 'Cần câu'} vào Tay Phải!`);
          this.audio?.playChime(880, 0.16);
        }
      }
      return;
    }
    if (button.dataset.equipBagBait) {
      const fs = this.fishingSystem || (typeof window !== 'undefined' ? window.__fishingSystem : null);
      if (fs) {
        const res = fs.equipBait(button.dataset.equipBagBait);
        this.render();
        if (res.ok) {
          this.notify(`🌿 Đã chọn ${res.bait?.name || 'Mồi câu'}!`);
          this.audio?.playChime(840, 0.14);
        }
      }
      return;
    }
    if (button.dataset.releaseBagFish) {
      const fs = this.fishingSystem || (typeof window !== 'undefined' ? window.__fishingSystem : null);
      if (fs) {
        const res = fs.releaseFish(button.dataset.releaseBagFish);
        this.selectedFish = null;
        this.render();
        if (res.ok) {
          this.notify('🌊 Đã thả cá về Hồ Lá Sen!');
          this.audio?.playChime(740, 0.16);
        }
      }
      return;
    }
    if (button.dataset.useIngredient) {
      const res = this.system.useIngredient(button.dataset.useIngredient);
      this.confirmDiscard = false;
      this.render();
      if (res.ok) {
        this.notify('😋 Bé đã dùng nguyên liệu tươi ngon!');
        this.audio?.playChime(880, 0.15);
      }
      return;
    }
    if (button.dataset.discardIngredient) {
      const res = this.system.discardIngredient(button.dataset.discardIngredient);
      this.confirmDiscard = false;
      this.render();
      if (res.ok) {
        this.notify('Đã bỏ bớt 1 phần nguyên liệu khỏi túi.');
      }
      return;
    }

    if (button.dataset.action === 'start-rhythm') {
      const s = this.system.getState().session;
      if (s) {
        const recipe = getRecipe(s.recipeId);
        const target = recipe.tier === 1 ? 4 : (recipe.tier === 2 ? 5 : 6);
        this.startAuditionLoop(target);
        return this.render();
      }
    }
    if (button.dataset.action === 'rhythm-hit') {
      return this.evaluateAuditionHit();
    }

    const action=button.dataset.action;
    if(action==='close') return this.close();
    if(action==='speak') return this.audio?.speak(this.spoken);
    if(action==='visit' || action==='challenge') { this.close(); return action==='visit' ? this.onVisitKitchen?.() : this.onChallenge?.(); }
    if(action==='wash-hands') return this.onWashHands?.();
    if(['fridge','recipes','bag'].includes(action)) {
      // Cổng vệ sinh: Tủ Lạnh và Túi đồ vẫn mở được tự do mà không phải rửa tay; chỉ Bếp nấu (recipes) mới cần rửa tay
      const st = this.system.getState();
      if (action === 'recipes' && !st.handsWashed && !st.session) {
        this.audio?.playChime?.(420, .2);
        return this.onWashHands?.();
      }
      this.stopAuditionLoop();
      this.rhythmActive = false;
      this.tab=action;
      this.selectedDish=null;
      return this.render();
    }
    if(button.dataset.dish) { this.selectedDish=button.dataset.dish; this.confirmDiscard=false; return this.render(); }
    if(action==='ask-discard' || action==='keep') { this.confirmDiscard=action==='ask-discard'; return this.render(); }
    if(button.dataset.ingredient) return this.addIngredient(button.dataset.ingredient);
    const s=this.system.getState().session;
    let result;
    if(button.dataset.buy) {
      const ingId = button.dataset.buy;
      const item = getIngredient(ingId);
      const stars = this.system.getStars();
      if (item && stars < item.price) {
        this.audioService?.playChime?.(420, 0.2);
        const msg = `⭐ Bé cần ${item.price} Sao để mua 1 phần ${item.name}! Hãy phiêu lưu giải đố để nhận thêm Sao nhé!`;
        this.notify(msg);
        window.dispatchEvent(new CustomEvent('game:show-toast', { detail: { message: msg } }));
        return;
      }
      result=this.system.buy(ingId);
      if (result.ok) this.audioService?.playCoinBuy?.();
    }
    else if(button.dataset.recipe) { result=this.system.start(button.dataset.recipe); if(result.ok)this.tab='cook'; }
    else if(button.dataset.remove && s) result=this.system.stage(s.id,button.dataset.remove,true);
    else if(button.dataset.heat && s) result=this.system.configure(s.id,'heat',button.dataset.heat);
    else if(button.dataset.ticks && s) result=this.system.configure(s.id,'ticks',Number(button.dataset.ticks));
    else if(action==='cook' && s) {
      const r = getRecipe(s.recipeId);
      const isReady = r.ingredients.every(i => (s.staged[i.id] || 0) >= i.count);
      if (isReady && !this.rhythmActive) {
        this.audioService?.playCookingSizzle?.();
        const target = r.tier === 1 ? 4 : (r.tier === 2 ? 5 : 6);
        this.startAuditionLoop(target);
        return this.render();
      }
      result=this.system.cook(s.id);
      if (result?.ok) this.audioService?.playDishComplete?.();
    }
    else if(action==='cancel') {
      this.stopAuditionLoop();
      this.rhythmActive = false;
      result=this.system.cancel();
      if(result.ok)this.tab='recipes';
    }
    else if(button.dataset.eat) {
      result=this.system.eat(button.dataset.eat);
      if (result?.ok) this.audioService?.playPetEat?.();
    }
    else if(button.dataset.discard) result=this.system.discard(button.dataset.discard);
    else if(button.dataset.feedPet) {
      result=this.system.feedPet(button.dataset.feedPet);
      if (result?.ok) this.audioService?.playPetEat?.();
    }
    if(!result) return;
    this.render();
    if(!result.ok) {
      if (result.reason === 'hygiene') return this.onWashHands?.();
      return this.notify(result.message || 'Bé thử lại nhé!');
    }
    if(button.dataset.buy) this.notify(`${result.item.icon} Đã cất 1 phần ${result.item.name} vào túi.`);
    if(button.dataset.eat) this.notify('😋 Bé đã dùng món và được tiếp sức!');
    if(button.dataset.discard) this.notify('Đã hủy món khỏi túi.');
    if(button.dataset.feedPet) {
      window.dispatchEvent(new CustomEvent('game:pet-updated', { detail: { pet: result.pet } }));
      this.notify('🐶 Cún được ăn món ngon của bé!');
    }
    if(action==='cook') this.say('Bếp đang làm món. Xong sẽ tự cất vào túi nhé!');
  }
}
