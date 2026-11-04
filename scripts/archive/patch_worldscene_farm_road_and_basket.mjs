import fs from 'fs';

let content = fs.readFileSync('src/game/scenes/WorldScene.js', 'utf8');

// 1. Add extraPortals support in create()
const portalTarget = `      if (canShow) {
        this.returnPortal = new TeleportPortal(this, mapConfig.returnPortal);
        this.portals.push(this.returnPortal);
      }
    }`;

const portalReplacement = `      if (canShow) {
        this.returnPortal = new TeleportPortal(this, mapConfig.returnPortal);
        this.portals.push(this.returnPortal);
      }
    }

    // 5c2. Khởi tạo danh sách các cổng phụ nếu có (extraPortals)
    if (Array.isArray(mapConfig.extraPortals)) {
      for (const pCfg of mapConfig.extraPortals) {
        const canShow = !pCfg.requiresUnlock ||
          (saveState?.campaign?.unlockedMaps || []).includes(pCfg.requiresUnlock);
        if (canShow) {
          const extraPortal = new TeleportPortal(this, pCfg);
          this.portals.push(extraPortal);
        }
      }
    }`;

if (!content.includes(portalTarget)) {
  console.error('portalTarget not found!');
  process.exit(1);
}
content = content.replace(portalTarget, portalReplacement);

// 2. Call drawPetFarmFashionRoad when on map_pet_farm
const farmTarget = `    // 5f. Khởi tạo Bồn Tắm Thú Cưng & Hiệu Ứng Nước Đổ (map_pet_farm)
    if (this.currentMapId === 'map_pet_farm') {`;

const farmReplacement = `    // 5f. Khởi tạo Đường Kết Nối Phố Thời Trang & Bồn Tắm Thú Cưng (map_pet_farm)
    if (this.currentMapId === 'map_pet_farm') {
      this.drawPetFarmFashionRoad();`;

if (!content.includes(farmTarget)) {
  console.error('farmTarget not found!');
  process.exit(1);
}
content = content.replace(farmTarget, farmReplacement);

// 3. Basket full listener in create() and cleanup in shutdown
const shutdownTarget = `      if (this.dockStartFishingBtnEl) {
        this.dockStartFishingBtnEl.remove();
        this.dockStartFishingBtnEl = null;
      }`;

const shutdownReplacement = `      if (this.dockStartFishingBtnEl) {
        this.dockStartFishingBtnEl.remove();
        this.dockStartFishingBtnEl = null;
      }
      if (this._onBasketFullNotice) {
        window.removeEventListener('game:basket-full-notice', this._onBasketFullNotice);
        this._onBasketFullNotice = null;
      }
      document.getElementById('basket-full-notice-modal')?.remove();`;

if (!content.includes(shutdownTarget)) {
  console.error('shutdownTarget not found!');
  process.exit(1);
}
content = content.replace(shutdownTarget, shutdownReplacement);

// Add event listener in create()
const eventTarget = `    // 5e. Khởi tạo các Trạm Chăm Sóc Thú Cưng Nông Trại (Pet Farm Stations)`;
const eventReplacement = `    this._onBasketFullNotice = () => this.showBasketFullNoticeModal();
    window.addEventListener('game:basket-full-notice', this._onBasketFullNotice);

    // 5e. Khởi tạo các Trạm Chăm Sóc Thú Cưng Nông Trại (Pet Farm Stations)`;

if (!content.includes(eventTarget)) {
  console.error('eventTarget not found!');
  process.exit(1);
}
content = content.replace(eventTarget, eventReplacement);

// 4. Update mountDockStartFishingButton
const dockBtnTarget = `    const handleStartFishing = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.startOnMapFishing(dockStation);
    };`;

const dockBtnReplacement = `    const handleStartFishing = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const curFishing = window.__fishingSystem?.getState?.() || {};
      if ((curFishing.basket?.length || 0) >= 6) {
        this.showBasketFullNoticeModal();
        return;
      }
      this.startOnMapFishing(dockStation);
    };`;

if (!content.includes(dockBtnTarget)) {
  console.error('dockBtnTarget not found!');
  process.exit(1);
}
content = content.replace(dockBtnTarget, dockBtnReplacement);

// 5. Update updateDockFishingProximityButton
const proxTarget = `    this.dockStartFishingBtnEl.style.display = isInsideBlueCircle ? 'inline-flex' : 'none';
    if (isInsideBlueCircle) {
      this.dockStartFishingBtnEl.style.left = '53.5%';
      this.dockStartFishingBtnEl.style.top = '36%';
    }`;

const proxReplacement = `    this.dockStartFishingBtnEl.style.display = isInsideBlueCircle ? 'inline-flex' : 'none';
    if (isInsideBlueCircle) {
      this.dockStartFishingBtnEl.style.left = '53.5%';
      this.dockStartFishingBtnEl.style.top = '36%';
      const curFishing = window.__fishingSystem?.getState?.() || {};
      const isBasketFull = (curFishing.basket?.length || 0) >= 6;
      if (isBasketFull) {
        this.dockStartFishingBtnEl.classList.add('basket-full-btn');
        this.dockStartFishingBtnEl.innerHTML = \`
          <span class="dock-start-fishing-icon">🧺</span>
          <span class="dock-start-fishing-label">Túi đầy rồi (6/6) · Đi đổi cá nhé!</span>
        \`;
      } else {
        this.dockStartFishingBtnEl.classList.remove('basket-full-btn');
        this.dockStartFishingBtnEl.innerHTML = \`
          <span class="dock-start-fishing-icon">🎣</span>
          <span class="dock-start-fishing-label">Bắt đầu câu cá</span>
        \`;
      }
    }`;

if (!content.includes(proxTarget)) {
  console.error('proxTarget not found!');
  process.exit(1);
}
content = content.replace(proxTarget, proxReplacement);

// 6. Update handleFishingStationInteraction for dock
const interactDockTarget = `    // Trạm câu cá ('dock' tại vòng tròn trên cầu gỗ: heroX=676, heroY=330, chân đứng 365):
    const dockX = 676;
    const dockY = 330;
    const curDist = Math.hypot(this.hero.getX() - dockX, this.hero.getY() - dockY);
    this.activeFishingStationVisit = st.id;

    // Nếu đã ở bến câu (trong khoảng cách 95px): BẤM LÀ BẮT ĐẦU CÂU CÁ NGAY LẬP TỨC!
    if (curDist <= 95) {
      this.updateDockFishingProximityButton(this.hero.getX(), this.hero.getY());
      if (!this.onMapFishingState) {
        this.startOnMapFishing(st, customCastTarget);
      }
      return;
    }`;

const interactDockReplacement = `    // Trạm câu cá ('dock' tại vòng tròn trên cầu gỗ: heroX=676, heroY=330, chân đứng 365):
    const curFishingState = window.__fishingSystem?.getState?.() || {};
    if ((curFishingState.basket?.length || 0) >= 6) {
      this.showBasketFullNoticeModal();
      return;
    }

    const dockX = 676;
    const dockY = 330;
    const curDist = Math.hypot(this.hero.getX() - dockX, this.hero.getY() - dockY);
    this.activeFishingStationVisit = st.id;

    // Nếu đã ở bến câu (trong khoảng cách 95px): BẤM LÀ BẮT ĐẦU CÂU CÁ NGAY LẬP TỨC!
    if (curDist <= 95) {
      this.updateDockFishingProximityButton(this.hero.getX(), this.hero.getY());
      if (!this.onMapFishingState) {
        this.startOnMapFishing(st, customCastTarget);
      }
      return;
    }`;

if (!content.includes(interactDockTarget)) {
  console.error('interactDockTarget not found!');
  process.exit(1);
}
content = content.replace(interactDockTarget, interactDockReplacement);

// 7. Update startOnMapFishing
const startFishingTarget = `    const turnRes = fishingSystem.startFishingTurn(st?.dockId || 'lotus_dock');
    if (!turnRes.ok) {
      if (turnRes.reason === 'basket_full') {
        this.spawnFloatingPopup(this.hero.getX(), this.hero.getY() - 55, '🎒 Đầy cá!', '#f59e0b');
        window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'bag' } }));
      }
      return;
    }`;

const startFishingReplacement = `    const turnRes = fishingSystem.startFishingTurn(st?.dockId || 'lotus_dock');
    if (!turnRes.ok) {
      if (turnRes.reason === 'basket_full') {
        this.showBasketFullNoticeModal();
      }
      return;
    }`;

if (!content.includes(startFishingTarget)) {
  console.error('startFishingTarget not found!');
  process.exit(1);
}
content = content.replace(startFishingTarget, startFishingReplacement);

// 8. Add methods showBasketFullNoticeModal and drawPetFarmFashionRoad
const methodsTarget = `  handlePetStationInteraction(st) {`;
const methodsToAdd = `  /**
   * Hiển thị Hộp thoại thông báo khi Giỏ Cá đã đầy (6/6)
   * Yêu cầu: "hiện thông báo , túi đầy rồi không thể câu cá nữa , bé hãy đi đổi cá nhé !"
   */
  showBasketFullNoticeModal() {
    const noticeText = 'Túi đầy rồi không thể câu cá nữa, bé hãy đi đổi cá nhé!';

    // 1. Âm thanh chuông báo & giọng đọc tiếng Việt ấm áp
    if (window.__audioService) {
      window.__audioService.playChime?.(650, 0.15);
      window.__audioService.speak?.(noticeText);
    }

    // 2. Spawn floating popup trên đầu nhân vật
    if (this.hero) {
      this.spawnFloatingPopup(this.hero.getX(), this.hero.getY() - 55, '🎒 Túi đầy cá! Đi đổi cá nhé!', '#f59e0b');
    }

    // 3. Dispatch sự kiện Toast toàn cục
    window.dispatchEvent(new CustomEvent('game:show-toast', { detail: { message: \`🧺 \${noticeText}\` } }));

    // 4. Modal Pop-up thân thiện, chuẩn mầm non
    const oldModal = document.getElementById('basket-full-notice-modal');
    if (oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'basket-full-notice-modal';
    overlay.className = 'basket-full-modal-overlay';
    overlay.innerHTML = \`
      <div class="basket-full-card" role="dialog" aria-modal="true" aria-labelledby="basket-full-title">
        <div class="basket-full-badge">🧺 GIỎ CÁ ĐÃ ĐẦY (6/6 CHỖ)</div>
        <div class="basket-full-hero-icon">🧺 🐟 ✨</div>
        <h2 id="basket-full-title" class="basket-full-title">\${noticeText}</h2>
        <p class="basket-full-desc">
          Giỏ của bé đã chứa đủ 6 bạn cá rồi! Bé hãy ghé sang <strong>Chợ Cầu Vồng</strong> gặp Cô Mèo để đổi cá lấy thật nhiều Sao ⭐ hoặc mở Túi để xem các bạn cá nhé!
        </p>
        <div class="basket-full-actions">
          <button type="button" id="btn-basket-notice-market" class="basket-full-btn-market">
            <span>🏮 Đến Chợ Cầu Vồng (Đổi Cá) ⭐</span>
          </button>
          <button type="button" id="btn-basket-notice-bag" class="basket-full-btn-bag">
            <span>🎒 Xem Túi Của Bé</span>
          </button>
          <button type="button" id="btn-basket-notice-close" class="basket-full-btn-close">
            <span>Để sau</span>
          </button>
        </div>
      </div>
    \`;

    const gameRoot = document.getElementById('game-root') || document.body;
    gameRoot.appendChild(overlay);

    const closeModal = () => {
      if (overlay.parentNode) overlay.remove();
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    overlay.querySelector('#btn-basket-notice-close')?.addEventListener('click', closeModal);

    overlay.querySelector('#btn-basket-notice-bag')?.addEventListener('click', () => {
      closeModal();
      window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'bag' } }));
    });

    overlay.querySelector('#btn-basket-notice-market')?.addEventListener('click', () => {
      closeModal();
      window.dispatchEvent(new CustomEvent('game:portal-teleport', {
        detail: { targetMapId: 'map_rainbow_market', targetMapName: 'Chợ Cầu Vồng' }
      }));
    });
  }

  /**
   * Mở đường & Biển chỉ dẫn kết nối từ Nông Trại đến Phố Thời Trang
   * Yêu cầu: "mở đường từ nông trại đến Phố thời trang, tôi chưa thấy đường kết nối"
   */
  drawPetFarmFashionRoad() {
    // 1. Dải đường lát đá cuội uốn cong tự nhiên nối từ sân trung tâm sang Cổng Phố Thời Trang
    // Bắt đầu từ bãi cỏ trung tâm (x: 820, y: 560), qua (x: 960, y: 590) đến (x: 1110, y: 625)
    const roadGfx = this.add.graphics().setDepth(2);
    
    // Nền đất lót đường màu cát vàng ấm áp
    roadGfx.lineStyle(56, 0xfde68a, 0.45);
    roadGfx.beginPath();
    roadGfx.moveTo(810, 560);
    roadGfx.quadraticBezierCurveTo(940, 580, 1105, 625);
    roadGfx.strokePath();

    roadGfx.lineStyle(42, 0xfef3c7, 0.65);
    roadGfx.beginPath();
    roadGfx.moveTo(810, 560);
    roadGfx.quadraticBezierCurveTo(940, 580, 1105, 625);
    roadGfx.strokePath();

    // Các viên đá cuội lót đường (Stepping stones)
    const stones = [
      { x: 825, y: 560, r: 15 },
      { x: 865, y: 566, r: 17 },
      { x: 905, y: 574, r: 16 },
      { x: 945, y: 583, r: 18 },
      { x: 985, y: 594, r: 16 },
      { x: 1025, y: 606, r: 18 },
      { x: 1065, y: 618, r: 17 },
      { x: 1098, y: 625, r: 19 }
    ];

    for (const stone of stones) {
      // Bóng đá
      roadGfx.fillStyle(0xb45309, 0.22);
      roadGfx.fillEllipse(stone.x + 2, stone.y + 4, stone.r * 2.1, stone.r * 1.4);
      // Mặt đá cuội nhẵn mịn
      roadGfx.fillStyle(0xfffbeb, 0.88);
      roadGfx.fillEllipse(stone.x, stone.y, stone.r * 2.0, stone.r * 1.35);
      // Viền đá vàng nhạt
      roadGfx.lineStyle(2, 0xf59e0b, 0.5);
      roadGfx.strokeEllipse(stone.x, stone.y, stone.r * 2.0, stone.r * 1.35);
    }

    // 2. Các bụi hoa nhỏ xinh xắn 2 bên mép đường
    const roadsideFlowers = [
      { x: 840, y: 540, char: '🌸' },
      { x: 890, y: 595, char: '🌼' },
      { x: 940, y: 560, char: '🌷' },
      { x: 990, y: 618, char: '🌸' },
      { x: 1045, y: 590, char: '✨' },
      { x: 1085, y: 650, char: '🎀' }
    ];
    for (const fl of roadsideFlowers) {
      this.add.text(fl.x, fl.y, fl.char, { fontSize: '15px' })
        .setOrigin(0.5)
        .setDepth(3)
        .setAlpha(0.9);
    }

    // 3. Biển Chỉ Dẫn Bằng Gỗ 3D Đáng Yêu
    const signX = 855;
    const signY = 535;
    const signContainer = this.add.container(signX, signY).setDepth(4);

    // Cột gỗ
    const postGfx = this.add.graphics();
    postGfx.fillStyle(0x78350f, 0.95);
    postGfx.fillRoundedRect(-5, -5, 10, 42, 3);
    postGfx.lineStyle(1.5, 0x451a03, 1);
    postGfx.strokeRoundedRect(-5, -5, 10, 42, 3);

    // Bảng biển chỉ đường (màu hồng tím thời trang rực rỡ)
    const boardBg = this.add.graphics();
    boardBg.fillStyle(0xa855f7, 0.96);
    boardBg.fillRoundedRect(-85, -28, 170, 36, 18);
    boardBg.lineStyle(3, 0xffffff, 0.98);
    boardBg.strokeRoundedRect(-85, -28, 170, 36, 18);

    const signText = this.add.text(0, -10, '👗 Phố Thời Trang ➡️', {
      fontFamily: 'Quicksand, Nunito, "Segoe UI", sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    signContainer.add([postGfx, boardBg, signText]);

    // Nhấp nhô nhẹ thu hút sự chú ý
    this.tweens.add({
      targets: signContainer,
      y: signY - 6,
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Touch zone cho Biển Chỉ Dẫn: Click là Hero chạy theo đường sang Phố Thời Trang!
    const signTouchZone = this.add.zone(signX, signY, 175, 55)
      .setInteractive({ useHandCursor: true })
      .setDepth(15);
    signTouchZone.on('pointerdown', (pointer) => {
      if (!this.isWorldPointer(pointer)) return;
      pointer?.event?.stopPropagation?.();
      this.hero?.moveTo(1110, 625, () => {
        window.dispatchEvent(new CustomEvent('game:portal-teleport', {
          detail: { targetMapId: 'map_fashion_street', targetMapName: 'Phố Thời Trang Cầu Vồng' }
        }));
      });
    });

    // 4. Mũi tên dạ quang lấp lánh chỉ dọc con đường
    const arrows = [
      { x: 910, y: 575 },
      { x: 995, y: 598 },
      { x: 1070, y: 618 }
    ];
    arrows.forEach((pos, idx) => {
      const arrow = this.add.text(pos.x, pos.y, '➜', {
        fontSize: '14px',
        color: '#c084fc',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(3).setRotation(0.24);

      this.tweens.add({
        targets: arrow,
        alpha: { from: 0.35, to: 0.95 },
        scale: { from: 0.9, to: 1.25 },
        delay: idx * 300,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  handlePetStationInteraction(st) {`;

if (!content.includes(methodsTarget)) {
  console.error('methodsTarget not found!');
  process.exit(1);
}
content = content.replace(methodsTarget, methodsToAdd);

fs.writeFileSync('src/game/scenes/WorldScene.js', content, 'utf8');
console.log('Successfully updated WorldScene.js with road and basket full handling!');
