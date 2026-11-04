/**
 * FashionStreetModal - UI Modal Phố Phụ Kiện Thời Trang Cầu Vồng
 * Thiết kế cho mầm non 5-6 tuổi theo yêu cầu:
 * - Xoá bỏ phần quần áo, tập trung hoàn toàn vào PHỤ KIỆN TẠO SINH gắn lên nhân vật.
 * - 4 Tab tương tác lớn (>= 64x64px), bo tròn kẹo dẻo ấm áp:
 *   0. Quầy Phụ Kiện Bé Xinh (squirrel_accessories - mua bằng Sao)
 *   1. Gương Thử Đồ & Tủ Đồ Phụ Kiện (fitting_mirror - đeo/tháo trực tiếp)
 *   2. Bảng Dành Dụm Sao (savings_board - đặt mục tiêu tích lũy)
 *   3. Góc Chụp Ảnh Kỷ Niệm (photo_booth - lưu album bé cùng phụ kiện)
 * - Tôn trọng trẻ: Thử phụ kiện miễn phí, mua vĩnh viễn bằng Sao, không tạo áp lực.
 * - Hỗ trợ giọng đọc tiếng Việt ấm áp (audioService.speak).
 */

import {
  ACCESSORIES_CATALOG,
  THEME_CHALLENGES,
  PHOTO_BACKDROPS,
  PHOTO_POSES
} from '../systems/fashionSystem.js';

export class FashionStreetModal {
  constructor(options = {}) {
    this.fashionSystem = options.fashionSystem;
    this.audioService = options.audioService;
    this.saveAdapter = options.saveAdapter;

    this.currentTab = 0; // 0: Phụ Kiện, 1: Gương & Tủ Đồ, 2: Dành Dụm, 3: Chụp Ảnh
    this.previewAccessoryId = null;
    this.selectedBackdrop = 'street';
    this.selectedPose = 'stand';

    this.container = document.getElementById('fashion-street-modal');
    this.initElements();
    this.initEventListeners();
  }

  initElements() {
    if (!this.container) return;

    this.btnClose = this.container.querySelector('.fashion-modal-close-btn');
    this.tabButtons = this.container.querySelectorAll('.fashion-nav-tab');
    this.tabContents = this.container.querySelectorAll('.fashion-tab-pane');
    this.starCountEl = this.container.querySelector('#fashion-player-stars-val');
    this.btnHelpVoice = this.container.querySelector('#fashion-help-voice-btn');
  }

  initEventListeners() {
    if (!this.container) return;

    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => {
        this.playClick();
        this.close();
      });
    }

    if (this.tabButtons) {
      this.tabButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
          this.playClick();
          this.switchTab(index);
        });
      });
    }

    if (this.btnHelpVoice) {
      this.btnHelpVoice.addEventListener('click', () => {
        this.speakTabGuidance();
      });
    }

    window.addEventListener('game:fashion-updated', () => {
      this.render();
    });

    window.addEventListener('game:fashion-equipped', () => {
      this.render();
    });

    window.addEventListener('game:accessory-changed', () => {
      this.render();
    });

    window.addEventListener('game:open-fashion-modal', (e) => {
      const tabIndex = e.detail?.tabIndex ?? 0;
      this.open(tabIndex);
    });
  }

  open(tabIndex = 0) {
    if (!this.container) return;
    this.container.hidden = false;
    this.container.classList.add('active');

    const currentFashion = this.fashionSystem?.getState?.() || {};
    this.previewAccessoryId = currentFashion.currentAccessory || currentFashion.equippedAccessoryId || null;

    this.switchTab(tabIndex, false);
    this.speakTabGuidance();
  }

  close() {
    if (!this.container) return;
    this.container.hidden = true;
    this.container.classList.remove('active');
    if (this.audioService?.stopSpeech) {
      this.audioService.stopSpeech();
    }
  }

  switchTab(index = 0, speak = true) {
    this.currentTab = index;
    if (this.tabButtons) {
      this.tabButtons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
      });
    }
    if (this.tabContents) {
      this.tabContents.forEach((pane, i) => {
        pane.classList.toggle('active', i === index);
      });
    }

    this.render();
    if (speak) {
      this.speakTabGuidance();
    }
  }

  speakTabGuidance() {
    if (!this.audioService?.speak) return;
    const guides = [
      'Chào mừng bé đến Quầy Phụ Kiện Xinh Xắn! Bé có thể dùng Sao để mua và đeo trực tiếp những phụ kiện siêu đáng yêu lên Bé Sam nhé!',
      'Góc Chụp Ảnh Kỷ Niệm lung linh! Cười thật tươi và bấm nút tách để lưu ảnh vào album nha!'
    ];
    this.audioService.speak(guides[this.currentTab] || guides[0]);
  }

  playClick() {
    if (this.audioService?.playChime) {
      this.audioService.playChime(640, 0.08);
    }
  }

  render() {
    if (!this.container || this.container.hidden) return;

    const stars = this.fashionSystem?.getPlayerStars?.() ?? 0;
    if (this.starCountEl) {
      this.starCountEl.textContent = `${stars} ⭐`;
    }

    switch (this.currentTab) {
      case 0:
        this.renderAccessoriesShop();
        break;
      case 1:
        this.renderPhotoBooth();
        break;
    }
  }

  /**
   * Tab 0: Quầy Nón & Phụ Kiện Bạn Sóc (Mua bằng Sao)
   */
  renderAccessoriesShop() {
    const listEl = this.container.querySelector('#fashion-accessories-list');
    if (!listEl) return;

    const fashionState = this.fashionSystem?.getState?.() || {};
    const ownedAccs = fashionState.ownedAccessories || [];
    const equippedAccId = fashionState.currentAccessory || fashionState.equippedAccessoryId || null;
    const playerStars = this.fashionSystem?.getPlayerStars?.() ?? 0;

    const accessories = Object.values(ACCESSORIES_CATALOG);

    listEl.innerHTML = accessories.map(acc => {
      const isOwned = ownedAccs.includes(acc.id);
      const isEquipped = equippedAccId === acc.id;
      const isPreviewing = this.previewAccessoryId === acc.id;
      const canAfford = playerStars >= acc.price;

      return `
        <div class="fashion-item-card ${isEquipped ? 'is-equipped' : ''} ${isPreviewing ? 'is-previewing' : ''}" data-id="${acc.id}">
          <div class="fashion-card-badge">${isEquipped ? 'Đang Đeo' : (isOwned ? 'Đã Có' : `${acc.price} ⭐`)}</div>
          <div class="fashion-item-icon-box">
            <img src="${acc.icon}" alt="${acc.name}" class="fashion-item-img" />
          </div>
          <div class="fashion-item-name">${acc.badge} ${acc.name}</div>
          <div class="fashion-item-desc">${acc.description}</div>
          
          <div class="fashion-card-actions">
            ${isOwned ? `
              <button type="button" class="fashion-btn fashion-btn-wear is-owned-btn" data-action="wear-acc" data-id="${acc.id}" style="width:100%;font-size:14.5px;font-weight:900;letter-spacing:0.3px;">
                Đã Có Trong Túi
              </button>
            ` : `
              <button type="button" class="fashion-btn fashion-btn-buy ${canAfford ? 'can-buy' : 'need-more'}" data-action="buy-acc" data-id="${acc.id}" ${canAfford ? '' : 'disabled'} style="width:100%;font-size:14.5px;font-weight:900;letter-spacing:0.3px;${canAfford ? '' : 'filter:grayscale(0.65);opacity:0.75;cursor:not-allowed;'}">
                Mua (${acc.price} ⭐)
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

    // Gắn sự kiện các nút
    listEl.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        const acc = ACCESSORIES_CATALOG[id];
        this.playClick();

        if (action === 'try-acc') {
          this.previewAccessoryId = id;
          this.render();
          this.audioService?.speak?.(`Bé đang đeo thử ${acc?.name || 'món đồ'}! Dễ thương lắm nha!`);
        } else if (action === 'wear-acc') {
          if (equippedAccId === id) {
            this.fashionSystem?.unequipAccessory?.();
            this.previewAccessoryId = null;
            this.audioService?.speak?.(`Bé đã tháo ${acc?.name || 'phụ kiện'} cất vào Túi đồ rồi nha!`);
          } else {
            this.audioService?.speak?.(`Món ${acc?.name || 'phụ kiện'} đang ở trong Túi! Bé hãy mở Túi và kéo vào Ô Phụ Kiện để đeo nhé!`);
            window.dispatchEvent(new CustomEvent('game:show-toast', {
              detail: { message: `🎒 Món ${acc?.name || 'phụ kiện'} đang ở trong Túi! Kéo vào Ô Phụ Kiện để đeo nhé!` }
            }));
          }
          this.render();
        } else if (action === 'buy-acc') {
          const res = this.fashionSystem?.purchaseAccessory?.(id);
          if (res?.success) {
            this.previewAccessoryId = id;
            this.audioService?.speak?.(`Hoan hô! Bé đã mua được món ${acc?.name || 'phụ kiện'} xinh xắn và cất vào Túi Đồ rồi! Bé hãy mở Túi và kéo vào Ô Phụ Kiện để đeo lên người nhé!`);
            window.dispatchEvent(new CustomEvent('game:show-toast', {
              detail: { message: `🎉 Đã cất ${acc?.name || 'phụ kiện'} vào Túi Đồ! Kéo vào Ô Phụ Kiện trong Túi để đeo nhé! 👑` }
            }));
          } else {
            this.fashionSystem?.setSavingsGoal?.(id);
            this.audioService?.speak?.(`Bé đã chọn để dành ${acc?.name || 'phụ kiện'}! Cùng câu cá hoặc giải đố để kiếm thêm Sao nhé!`);
          }
          this.render();
        }
      });
    });
  }

  /**
   * Tab 1: Gương Thử Đồ & Tủ Đồ Phụ Kiện (3 Ngăn Presets)
   */
  renderMirrorAndWardrobe() {
    const mirrorWrap = this.container.querySelector('#fashion-mirror-avatar-wrap');
    const presetsWrap = this.container.querySelector('#fashion-wardrobe-presets-wrap');
    if (!mirrorWrap || !presetsWrap) return;

    const fashionState = this.fashionSystem?.getState?.() || {};
    const equippedAccId = fashionState.currentAccessory || fashionState.equippedAccessoryId || null;
    const activeAccId = this.previewAccessoryId || equippedAccId;
    const activeAcc = activeAccId ? ACCESSORIES_CATALOG[activeAccId] : null;

    mirrorWrap.innerHTML = `
      <div class="fashion-mirror-frame">
        <div class="fashion-mirror-glass">
          <div class="fashion-mirror-char">
            <img src="/assets/hero/sau_upgrade/hero_upgrade_idle.png" alt="Bé Sam" class="fashion-mirror-hero-avatar" />
            ${activeAcc ? `
              <img src="${activeAcc.icon}" alt="${activeAcc.name}" class="fashion-mirror-acc-layer acc-${activeAcc.slot}" />
            ` : ''}
          </div>
          <div class="fashion-mirror-info">
            <span class="mirror-char-title">Bé Sam Đáng Yêu</span>
            <span class="mirror-acc-name">${activeAcc ? `Đang đeo: ${activeAcc.badge} ${activeAcc.name}` : '(Chưa đeo phụ kiện)'}</span>
          </div>
          <div class="fashion-mirror-buttons">
            ${activeAccId ? `
              <button type="button" class="fashion-btn fashion-btn-wear" data-action="mirror-equip" data-id="${activeAccId}">
                ${equippedAccId === activeAccId ? 'Đang Đeo Trực Tiếp' : '✨ Đeo Ngay'}
              </button>
              <button type="button" class="fashion-btn fashion-btn-try" data-action="mirror-unequip">
                ❌ Tháo Ra
              </button>
            ` : `
              <span class="mirror-hint">Bé hãy chọn phụ kiện ở quầy để đeo nhé!</span>
            `}
          </div>
        </div>
      </div>
    `;

    // Gắn sự kiện nút trên gương
    mirrorWrap.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        this.playClick();

        if (action === 'mirror-equip') {
          if (this.fashionSystem?.isAccessoryOwned(id)) {
            this.fashionSystem?.equipAccessory?.(id);
            this.previewAccessoryId = id;
            this.audioService?.speak?.(`Bé đã đeo ${ACCESSORIES_CATALOG[id]?.name} lên người rồi!`);
          } else {
            this.audioService?.speak?.('Bé hãy qua Quầy Phụ Kiện đổi bằng Sao trước nhé!');
          }
        } else if (action === 'mirror-unequip') {
          this.fashionSystem?.unequipAccessory?.();
          this.previewAccessoryId = null;
          this.audioService?.speak?.('Bé đã tháo phụ kiện ra rồi!');
        }
        this.render();
      });
    });

    // 3 Ngăn Tủ Đồ Presets
    const presets = fashionState.wardrobePresets || [
      { name: 'Ngăn 1: Mũ Hoa Cúc', accessoryId: null },
      { name: 'Ngăn 2: Kính Trái Tim', accessoryId: null },
      { name: 'Ngăn 3: Vương Miện', accessoryId: null }
    ];

    presetsWrap.innerHTML = presets.map((p, idx) => {
      const pAcc = p.accessoryId ? ACCESSORIES_CATALOG[p.accessoryId] : null;

      return `
        <div class="fashion-preset-card" data-index="${idx}">
          <div class="preset-header">
            <span class="preset-title">${p.name || `Ngăn ${idx + 1}`}</span>
          </div>
          <div class="preset-items-preview">
            ${pAcc ? `
              <img src="${pAcc.icon}" class="preset-acc-icon" />
              <span class="preset-emoji-tag">${pAcc.badge} ${pAcc.name}</span>
            ` : '<span class="preset-empty-tag">📦 (Ngăn trống)</span>'}
          </div>
          <div class="preset-actions">
            <button type="button" class="fashion-btn fashion-btn-wear" data-action="apply-preset" data-index="${idx}">
              ⚡ Đeo Ngăn Này
            </button>
            <button type="button" class="fashion-btn fashion-btn-save" data-action="save-preset" data-index="${idx}">
              💾 Cất Vào Ngăn
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Sự kiện 3 ngăn tủ đồ
    presetsWrap.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const idx = parseInt(btn.dataset.index, 10);
        this.playClick();

        if (action === 'apply-preset') {
          this.fashionSystem?.applyWardrobePreset?.(idx);
          this.audioService?.speak?.(`Bé đã lấy phụ kiện từ Ngăn ${idx + 1} ra đeo rồi nhé!`);
          this.render();
        } else if (action === 'save-preset') {
          this.fashionSystem?.saveWardrobePreset?.(idx);
          this.audioService?.speak?.(`Đã lưu món phụ kiện hiện tại vào Ngăn ${idx + 1} của bé thành công!`);
          this.render();
        }
      });
    });
  }

  /**
   * Tab 2: Bảng Dành Dụm Sao & Thử Thách Phối Phụ Kiện
   */
  renderSavingsAndThemes() {
    const savingsWrap = this.container.querySelector('#fashion-savings-wrap');
    const themesWrap = this.container.querySelector('#fashion-themes-wrap');
    if (!savingsWrap || !themesWrap) return;

    const fashionState = this.fashionSystem?.getState?.() || {};
    const goalInfo = this.fashionSystem?.getSavingsGoalProgress?.();

    if (goalInfo && goalInfo.accessory) {
      const { accessory, currentStars, targetStars, remainingStars, progressPct, canAfford, isOwned } = goalInfo;
      savingsWrap.innerHTML = `
        <div class="fashion-goal-card ${canAfford ? 'goal-ready' : ''}">
          <div class="goal-header">
            <img src="${accessory.icon}" class="goal-acc-img" />
            <div class="goal-text-group">
              <span class="goal-title">Mục Tiêu Dành Dụm: ${accessory.badge} ${accessory.name}</span>
              <span class="goal-status">
                ${isOwned ? '🎉 Bé đã sở hữu món phụ kiện này rồi!' : (canAfford ? '🎉 Bé đã đủ Sao rồi! Hãy bấm Mua ngay nào!' : `Bé có ${currentStars}/${targetStars} ⭐ (Còn thiếu ${remainingStars} ⭐)`)}
              </span>
            </div>
          </div>
          <div class="goal-progress-bar-track">
            <div class="goal-progress-fill" style="width: ${progressPct}%;"></div>
          </div>
          <div class="goal-tips">
            💡 Gợi ý kiếm thêm Sao: Trả lời đúng câu đố ở các bản đồ, câu cá to ở Hồ Lá Sen, hoặc vượt Mê Cung nhé!
          </div>
        </div>
      `;
    } else {
      savingsWrap.innerHTML = `
        <div class="fashion-goal-card empty">
          <span>🎯 Bé chưa chọn mục tiêu để dành nào. Hãy vào Quầy Phụ Kiện bấm "Để Dành" món đồ bé thích nhất nhé!</span>
        </div>
      `;
    }

    // 3 Chủ Đề Phối Phụ Kiện
    const themes = Object.values(THEME_CHALLENGES);
    const completedThemes = fashionState.completedThemes || [];
    const equippedAccId = fashionState.currentAccessory || fashionState.equippedAccessoryId || null;

    themesWrap.innerHTML = themes.map(th => {
      const isDone = completedThemes.includes(th.id);
      return `
        <div class="fashion-theme-card ${isDone ? 'theme-done' : ''}" data-id="${th.id}">
          <div class="theme-icon">${th.icon}</div>
          <div class="theme-info">
            <div class="theme-name">${th.name} ${isDone ? '🏆' : ''}</div>
            <div class="theme-desc">${th.description}</div>
            <div class="theme-req">Gợi ý: ${th.hint}</div>
          </div>
          <button type="button" class="fashion-btn fashion-btn-theme ${isDone ? 'done' : ''}" data-action="check-theme" data-id="${th.id}">
            ${isDone ? 'Đã Hoàn Thành ✨' : 'Kiểm Tra Phụ Kiện 🌟'}
          </button>
        </div>
      `;
    }).join('');

    themesWrap.querySelectorAll('[data-action="check-theme"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const thId = btn.dataset.id;
        this.playClick();

        const res = this.fashionSystem?.evaluateThemeChallenge?.(thId, equippedAccId);
        if (res?.pass) {
          this.audioService?.speak?.(`Tuyệt đỉnh! ${res.feedback}`);
        } else {
          this.audioService?.speak?.(`Bé phối gần đúng rồi! ${res?.feedback || ''}`);
        }
        this.render();
      });
    });
  }

  /**
   * Tab 3: Góc Chụp Ảnh Kỷ Niệm (Photo Booth)
   */
  renderPhotoBooth() {
    const photoStage = this.container.querySelector('#fashion-photo-stage');
    const albumWrap = this.container.querySelector('#fashion-photo-album');
    if (!photoStage || !albumWrap) return;

    const fashionState = this.fashionSystem?.getState?.() || {};
    const equippedAccId = fashionState.currentAccessory || fashionState.equippedAccessoryId || null;
    const equippedAcc = equippedAccId ? ACCESSORIES_CATALOG[equippedAccId] : null;

    const currentBackdrop = PHOTO_BACKDROPS[this.selectedBackdrop] || PHOTO_BACKDROPS.street;
    const currentPose = PHOTO_POSES[this.selectedPose] || PHOTO_POSES.stand;

    photoStage.innerHTML = `
      <div class="photo-viewfinder" style="background: ${currentBackdrop.bg};">
        <div class="photo-char-pose pose-${this.selectedPose}">
          <img src="/assets/hero/sau_upgrade/hero_upgrade_idle.png" alt="Bé Sam" class="photo-char-figure-img" />
          ${equippedAcc ? `<img src="${equippedAcc.icon}" class="photo-acc-layer acc-${equippedAcc.slot}" />` : ''}
          <span class="photo-pose-badge">${currentPose.icon}</span>
        </div>
        <div class="photo-watermark">📸 Phố Phụ Kiện Thời Trang Cầu Vồng</div>
        <div class="photo-flash-overlay" id="photo-flash-overlay"></div>
      </div>
      
      <div class="photo-controls">
        <div class="photo-control-row">
          <span class="control-label">Phông Nền:</span>
          ${Object.values(PHOTO_BACKDROPS).map(b => `
            <button type="button" class="photo-option-btn ${this.selectedBackdrop === b.id ? 'active' : ''}" data-backdrop="${b.id}">
              ${b.name}
            </button>
          `).join('')}
        </div>
        
        <div class="photo-control-row">
          <span class="control-label">Dáng Pose:</span>
          ${Object.values(PHOTO_POSES).map(p => `
            <button type="button" class="photo-option-btn ${this.selectedPose === p.id ? 'active' : ''}" data-pose="${p.id}">
              ${p.icon} ${p.name}
            </button>
          `).join('')}
        </div>

        <button type="button" class="fashion-shutter-btn" id="fashion-btn-take-photo">
          📸 TÁCH! CHỤP ẢNH
        </button>
      </div>
    `;

    photoStage.querySelectorAll('[data-backdrop]').forEach(bBtn => {
      bBtn.addEventListener('click', () => {
        this.selectedBackdrop = bBtn.dataset.backdrop;
        this.playClick();
        this.renderPhotoBooth();
      });
    });

    photoStage.querySelectorAll('[data-pose]').forEach(pBtn => {
      pBtn.addEventListener('click', () => {
        this.selectedPose = pBtn.dataset.pose;
        this.playClick();
        this.renderPhotoBooth();
      });
    });

    const btnSnap = photoStage.querySelector('#fashion-btn-take-photo');
    if (btnSnap) {
      btnSnap.addEventListener('click', () => {
        this.snapPhoto();
      });
    }

    // Hiển thị Album ảnh đã lưu
    const album = fashionState.album || [];
    albumWrap.innerHTML = `
      <div class="album-header">
        <span class="album-title">🖼️ Album Kỷ Niệm Của Bé (${album.length}/24 ảnh)</span>
      </div>
      <div class="album-grid">
        ${album.length === 0 ? `
          <div class="album-empty">Bé chưa có bức ảnh nào. Hãy bấm "📸 TÁCH!" ở trên để chụp tấm ảnh đầu tiên nhé!</div>
        ` : album.map(photo => {
          const phAcc = photo.accessoryId ? ACCESSORIES_CATALOG[photo.accessoryId] : null;
          const phPose = PHOTO_POSES[photo.pose] || PHOTO_POSES.stand;
          const phBackdrop = PHOTO_BACKDROPS[photo.backdrop] || PHOTO_BACKDROPS.street;

          return `
            <div class="album-photo-polaroid">
              <div class="polaroid-photo" style="background: ${phBackdrop.bg};">
                <img src="/assets/hero/sau_upgrade/hero_upgrade_idle.png" class="polaroid-char-img" />
                ${phAcc ? `<img src="${phAcc.icon}" class="polaroid-acc-img acc-${phAcc.slot}" />` : ''}
                <span class="polaroid-pose">${phPose.icon}</span>
              </div>
              <div class="polaroid-caption">
                <span class="caption-date">${photo.date || 'Hôm nay'}</span>
                <span class="caption-outfit">${phAcc ? phAcc.name : 'Phụ Kiện Cơ Bản'}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  snapPhoto() {
    const flash = this.container.querySelector('#photo-flash-overlay');
    if (flash) {
      flash.classList.add('flash-active');
      setTimeout(() => {
        flash.classList.remove('flash-active');
      }, 350);
    }

    if (this.audioService?.playChime) {
      this.audioService.playChime(880, 0.2);
    }

    const fashionState = this.fashionSystem?.getState?.() || {};
    const photoData = {
      id: `photo_${Date.now()}`,
      accessoryId: fashionState.currentAccessory || fashionState.equippedAccessoryId || null,
      backdrop: this.selectedBackdrop,
      pose: this.selectedPose,
      date: new Date().toLocaleDateString('vi-VN')
    };

    this.fashionSystem?.addPhotoToAlbum?.(photoData);
    this.audioService?.speak?.('Tách! Bức ảnh kỷ niệm của bé đã được lưu vào Album rồi nha! Đẹp tuyệt vời!');
    this.render();
  }
}
