import re

with open('src/game/ui/MarketModal.js', 'r', encoding='utf-8') as f:
    code = f.read()

code_norm = code.replace('\r\n', '\n')

# 1. Thêm import các bảng dữ liệu nếu chưa có
import_target = "import { BACKPACKS, getBackpack } from '../../content/backpacks/backpackData.js';"
import_replacement = """import { BACKPACKS, getBackpack } from '../../content/backpacks/backpackData.js';
import { getRecipe } from '../../content/kitchen/recipesData.js';
import { INGREDIENTS } from '../../content/kitchen/ingredientsData.js';
import { ACCESSORIES_CATALOG } from '../../content/fashion/accessoriesData.js';"""

if "import { getRecipe }" not in code_norm:
    if import_target in code_norm:
        code_norm = code_norm.replace(import_target, import_replacement, 1)
        print("1. Added imports to MarketModal.js")
    else:
        print("ERROR 1: import_target not found")
        exit(1)
else:
    print("1. Imports already present")

# 2. Bỏ banner Balo trong _renderBackpackStall (Yeu cau 2)
old_backpack_stall_banner = """    return `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="background:linear-gradient(135deg,#fef3c7,#fed7aa);border:2.5px solid #f59e0b;border-radius:16px;padding:8px 14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <div>
            <h3 style="margin:0;font-size:1.05rem;color:#78350f;font-weight:900;">🎒 Gian Hàng Balo Mở Rộng Túi Đồ</h3>
            <p style="margin:2px 0 0;font-size:0.86rem;color:#92400e;">Mua Balo bằng Sao rồi kéo thả vào 4 ô trên đầu Túi Đồ để mở thêm +3, +5, +7, +9 ô nhé!</p>
          </div>
          <div style="background:#ffffff;border:2px solid #f59e0b;padding:4px 12px;border-radius:999px;font-weight:900;color:#92400e;font-size:0.92rem;">
            ⭐ Hiện có: <strong>${stars}</strong>
          </div>
        </div>
        <div class="fishing-shop-grid" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;">
          ${itemsHtml}
        </div>
      </div>
    `;"""

new_backpack_stall_banner = """    return `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div class="fishing-shop-grid" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;">
          ${itemsHtml}
        </div>
      </div>
    `;"""

if old_backpack_stall_banner in code_norm:
    code_norm = code_norm.replace(old_backpack_stall_banner, new_backpack_stall_banner, 1)
    print("2. Removed backpack stall banner successfully")
else:
    print("2. Banner already removed or not found")

# 3. Viết lại _renderFishScaleStall và drag & drop
pattern = r"  _renderFishScaleStall\(state\) \{[\s\S]*?  _bindEvents\(\) \{"

new_stall_and_drag = """  _renderFishScaleStall(state) {
    const sparkles = [
      { char: '✨', x: '12%', y: '8%', dx: '-24px', dy: '-26px', delay: '0s' },
      { char: '⭐', x: '88%', y: '10%', dx: '28px', dy: '-24px', delay: '0.15s' },
      { char: '🌟', x: '8%', y: '75%', dx: '-26px', dy: '22px', delay: '0.3s' },
      { char: '✦', x: '92%', y: '72%', dx: '25px', dy: '24px', delay: '0.45s' },
      { char: '✨', x: '50%', y: '-12%', dx: '0px', dy: '-30px', delay: '0.2s' },
      { char: '⭐', x: '45%', y: '108%', dx: '10px', dy: '28px', delay: '0.35s' },
      { char: '💖', x: '25%', y: '0%', dx: '-16px', dy: '-20px', delay: '0.25s' },
      { char: '✨', x: '75%', y: '2%', dx: '18px', dy: '-18px', delay: '0.4s' },
      { char: '🌟', x: '32%', y: '96%', dx: '-12px', dy: '22px', delay: '0.5s' },
      { char: '✦', x: '68%', y: '95%', dx: '15px', dy: '20px', delay: '0.1s' }
    ];

    const dropzoneContent = this.lastSoldSummary
      ? `
        <div class="market-sold-celebration">
          <div class="market-sell-sparkles" aria-hidden="true">
            ${sparkles.map(sp => `
              <span class="sell-sparkle-dot" style="left:${sp.x};top:${sp.y};--dx:${sp.dx};--dy:${sp.dy};animation-delay:${sp.delay};">
                ${sp.char}
              </span>
            `).join('')}
          </div>

          <div class="market-sold-avatar-box">
            ${this.lastSoldSummary.asset ? `
              <img src="${this.lastSoldSummary.asset}" alt="${this.lastSoldSummary.name}" style="width:68px;height:68px;object-fit:contain;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.15));" draggable="false" />
            ` : `
              <span style="font-size:2.8rem;line-height:1;">${this.lastSoldSummary.icon || '📦'}</span>
            `}
          </div>
          <div style="text-align:left;">
            <div style="font-size:1.18rem;font-weight:900;color:#14532d;display:flex;align-items:center;gap:6px;">
              <span>🎉 Đã bán ${this.lastSoldSummary.name}!</span>
              <span style="font-size:1.15rem;color:#f59e0b;">✨</span>
            </div>
            <div class="market-sold-star-badge">
              <span>⭐ +${this.lastSoldSummary.starsEarned} SAO</span>
              <span style="font-size:1.2rem;filter:drop-shadow(0 0 6px #ffffff);">✨</span>
            </div>
          </div>
        </div>
        <div style="margin-top:10px;font-size:0.95rem;font-weight:800;color:#0369a1;display:flex;align-items:center;gap:6px;">
          <span>👇</span> <span>Kéo thả tiếp vật phẩm bên dưới vào đây để bán đổi Sao nhé!</span> <span style="color:#f59e0b;">✨</span>
        </div>
      `
      : `
        <div style="font-size:1.35rem;font-weight:900;color:#78350f;padding:16px 12px;display:flex;align-items:center;justify-content:center;gap:8px;">
          <span>Thả vật phẩm vào đây để đổi sao ⭐</span>
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
      allSellableItems.push({
        kind: 'dish',
        id: d.id,
        name: recipe?.name || 'Món Ăn',
        asset: recipe?.image || null,
        icon: recipe?.icon || '🍲',
        stars: 3,
        count: 1,
        subText: '🍲 Món ăn',
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
        allSellableItems.push({
          kind: 'ingredient',
          id: ingId,
          name: ing?.name || ingId,
          asset: ing?.image || null,
          icon: ing?.icon || '🥕',
          stars: 1,
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
          const stars = Math.floor(bp.costStars * 0.5);
          allSellableItems.push({
            kind: 'backpack',
            id: bp.id,
            name: bp.name,
            asset: bp.asset,
            icon: bp.icon || '🎒',
            stars,
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
        allSellableItems.push({
          kind: 'accessory',
          id: acc.id,
          name: acc.name,
          asset: acc.icon,
          icon: acc.badge || '👑',
          stars: 15,
          count: 1,
          subText: '👑 Phụ kiện',
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
                title="Kéo thả vào ô trên để bán đổi lấy +${item.stars} ⭐ Sao (Dữ liệu bán rồi sẽ mất vĩnh viễn khỏi túi)"
                style="width:110px;height:118px;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#ffffff;border:3px solid ${item.borderColor};border-radius:18px;padding:8px 6px 4px;cursor:grab;user-select:none;touch-action:none;box-shadow:0 4px 0 #e2e8f0, 0 6px 12px rgba(0,0,0,0.06);transition:transform 0.15s ease, box-shadow 0.15s ease;"
              >
                <!-- Giá bán bằng SAO hiển thị nổi bật -->
                <span
                  style="position:absolute;top:-8px;right:-6px;background:linear-gradient(180deg,#fef08a 0%,#facc15 100%);border:2px solid #ca8a04;color:#713f12;font-size:0.85rem;font-weight:900;padding:1px 8px;border-radius:999px;box-shadow:0 2px 4px rgba(0,0,0,0.16);z-index:2;"
                >
                  ⭐ +${item.stars}
                </span>

                <!-- Phân loại / cân nặng góc trái trên -->
                <span
                  style="position:absolute;top:-7px;left:-5px;background:#ffffff;border:1.5px solid ${item.badgeColor};color:${item.badgeColor};font-size:0.70rem;font-weight:900;padding:1px 6px;border-radius:999px;z-index:2;"
                >
                  ${item.subText}
                </span>

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
          🎒 Vật Phẩm Của Bé (${allSellableItems.length} món) — Kéo thả lên ô trên để bán đổi Sao:
        </h3>
        <span style="font-size:0.82rem;color:#b45309;font-weight:800;">
          (⚠️ Bán rồi sẽ mất luôn khỏi túi)
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
        `Đã bán ${res.soldItem.name} nhận +${res.starsEarned} ⭐ Sao! (Đã xoá vĩnh viễn khỏi túi)`,
        'success'
      );
      this._render();
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

  _bindEvents() {"""

if re.search(pattern, code_norm):
    code_norm = re.sub(pattern, new_stall_and_drag, code_norm, count=1)
    print("3. Updated _renderFishScaleStall and drag and drop in MarketModal.js")
else:
    print("ERROR 3: pattern for _renderFishScaleStall not matched")
    exit(1)

with open('src/game/ui/MarketModal.js', 'w', encoding='utf-8') as f:
    f.write(code_norm)
print("MarketModal.js successfully updated!")
