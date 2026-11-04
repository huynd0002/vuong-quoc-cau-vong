/**
 * CharacterSelectModal
 * Giao diện Chọn Nhân Vật & Đặt Tên Cho Bé Yêu (Character Selection & Name-Based Profile Setup).
 * - Cho bé chọn bạn đồng hành: Bé Sâu Dũng Cảm (Mặc định) vs Bé Sam Kuromi.
 * - Ô nhập đặt tên nhân vật có nút đọc phát âm và gợi ý tên nhanh 1 chạm.
 * - Hiển thị Cấp độ (Level) và Thanh Kinh Nghiệm (EXP).
 * - Lưu trữ dữ liệu tiến trình cố định theo tên nhân vật bé đặt (Multi-profile name-based save).
 * - Hỗ trợ 2 chế độ:
 *   1. Chế độ Khởi Đầu Trước Khi Vào Game (`showInitialSelection`):
 *      Đón chào bé, cho bé đặt tên & chọn bạn đồng hành và bấm "BẮT ĐẦU PHIÊU LƯU".
 *   2. Chế độ Tủ Đồ Trong Game (`show`):
 *      Mở khi bấm nút "Nhân Vật" hoặc Avatar trên thanh điều khiển để đổi trang phục & tên tức thì.
 */

import defaultHeroAvatar from '../../../assets/hero/sau/hero_idle.png?url';
import knightHeroAvatar from '../../../assets/hero/sau_upgrade/hero_upgrade_idle.png?url';
import btnCloseUrl from '../../../assets/ui/custom_kids_ui/btn_close_3d.png?url';

export const SUGGESTED_NAMES = [
  { name: 'Bé Sam', skin: 'knight', badge: '💜' },
  { name: 'Bé Sâu', skin: 'default', badge: '🌱' },
  { name: 'Bắp Non', skin: 'default', badge: '🌽' },
  { name: 'Dâu Tây', skin: 'knight', badge: '🍓' },
  { name: 'Bé Thỏ', skin: 'knight', badge: '🐰' },
  { name: 'Bé Gấu', skin: 'default', badge: '🐻' },
  { name: 'Bé Miu', skin: 'knight', badge: '🐱' },
  { name: 'Bé Bon', skin: 'default', badge: '🌟' }
];

export class CharacterSelectModal {
  constructor(options = {}) {
    this.saveAdapter = options.saveAdapter;
    this.progressionSystem = options.progressionSystem;
    this.audioService = options.audioService;
    this.hudController = options.hudController;

    this.container = null;
    this.isVisible = false;
    this.isInitialMode = false;
    this.onStartCallback = null;

    this.selectedSkin = 'default';
    this.characterName = '';

    this.createDom();
  }

  createDom() {
    let modal = document.getElementById('character-select-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'character-select-modal';
      modal.className = 'character-modal-backdrop';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }
    this.container = modal;
  }

  render() {
    if (!this.container) return;

    const state = this.saveAdapter ? this.saveAdapter.load() : null;
    const player = state?.player || { name: 'Bé Sâu', level: 1, exp: 0, selectedSkin: 'default', unlockedSkins: ['default'] };
    const profiles = this.saveAdapter ? this.saveAdapter.listProfiles() : [];
    const activeProfileName = this.saveAdapter ? this.saveAdapter.getActiveProfileName() : (player.name || 'Bé Sâu');

    if (!this.characterName) {
      this.characterName = activeProfileName || player.name || 'Bé Sâu';
    }
    if (!this.selectedSkin) {
      this.selectedSkin = player.selectedSkin || 'default';
    }

    const currentLevel = Number(player.level) || 1;
    const currentExp = Number(player.exp) || 0;
    const maxExp = currentLevel * 50;
    const expPct = Math.min(100, Math.round((currentExp / maxExp) * 100));

    // Tìm thông tin profile tương ứng nếu có
    const findProfile = (skinType) => {
      const match = profiles.find(p => p.skin === skinType);
      return match || { level: currentLevel, exp: currentExp, stars: player.stars || 0 };
    };

    const sauInfo = this.selectedSkin === 'default' ? { level: currentLevel, exp: currentExp, pct: expPct } : {
      level: findProfile('default').level,
      exp: findProfile('default').exp,
      pct: Math.min(100, Math.round((findProfile('default').exp / (findProfile('default').level * 50)) * 100))
    };

    const samInfo = this.selectedSkin === 'knight' ? { level: currentLevel, exp: currentExp, pct: expPct } : {
      level: findProfile('knight').level,
      exp: findProfile('knight').exp,
      pct: Math.min(100, Math.round((findProfile('knight').exp / (findProfile('knight').level * 50)) * 100))
    };

    const headerTitle = this.isInitialMode
      ? 'CHỌN BẠN ĐỒNG HÀNH & ĐẶT TÊN CHO BÉ'
      : 'ĐỔI TRANG PHỤC & TÊN NHÂN VẬT';

    const headerSubtitle = this.isInitialMode
      ? 'Bé hãy chọn bạn đồng hành, đặt tên thật hay và bắt đầu hành trình Cầu Vồng nhé!'
      : 'Bé có thể đổi diện mạo, đặt lại tên và quản lý hồ sơ nhân vật của mình bất cứ lúc nào!';

    this.container.innerHTML = `
      <div class="character-modal-dialog ${this.isInitialMode ? 'initial-select-dialog' : ''}">
        <!-- Nút đóng góc phải (Chỉ hiển thị khi mở trong game) -->
        ${!this.isInitialMode ? `
          <button type="button" class="char-btn-close" id="char-btn-close" aria-label="Đóng bảng nhân vật">
            <img src="${btnCloseUrl}" alt="✕" style="width: 32px; height: 32px;">
          </button>
        ` : ''}

        <!-- Tiêu đề Hoàng Gia Nổi Bật -->
        <div class="char-modal-header">
          <div class="char-banner-wrap">
            <span class="char-banner-icon" aria-hidden="true">👑</span>
            <span class="char-banner-title">${headerTitle}</span>
            <span class="char-banner-icon" aria-hidden="true">✨</span>
          </div>
          <p class="char-modal-subtitle">${headerSubtitle}</p>
        </div>

        <!-- KHUNG 1: ĐẶT TÊN CHO NHÂN VẬT CỦA BÉ -->
        <div class="char-name-setup-card">
          <div class="char-name-header-row">
            <label for="char-name-input" class="char-name-label">
              <span class="name-label-icon">🏷️</span>
              <span>Tên Nhân Vật Của Bé:</span>
            </label>
            <span class="char-name-hint">(Dữ liệu trò chơi sẽ được lưu cố định theo tên này!)</span>
          </div>

          <div class="char-name-input-group">
            <input
              type="text"
              id="char-name-input"
              class="char-name-input"
              maxlength="20"
              placeholder="Nhập tên bé yêu thích... (vd: Bé Sam, Bé Sâu...)"
              value="${this.characterName}"
              autocomplete="off"
              spellcheck="false"
            />
            <button type="button" class="btn-speak-name" id="btn-speak-name" title="Nghe đọc tên nhân vật" aria-label="Nghe đọc tên">
              <span>🔊</span>
            </button>
          </div>

          <!-- Danh sách gợi ý tên hay 1-chạm -->
          <div class="char-suggested-names-wrap">
            <span class="char-suggest-title">💡 Gợi ý tên dễ thương:</span>
            <div class="char-suggest-chips">
              ${SUGGESTED_NAMES.map(s => `
                <button
                  type="button"
                  class="char-name-chip ${this.characterName === s.name ? 'is-selected' : ''}"
                  data-name-chip="${s.name}"
                  data-chip-skin="${s.skin}"
                >
                  <span class="chip-badge">${s.badge}</span>
                  <span class="chip-text">${s.name}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- KHUNG 2: HỒ SƠ NHÂN VẬT ĐÃ LƯU CỐ ĐỊNH (MULTI-PROFILE SWITCHER) -->
        ${(profiles.length > 1 || !this.isInitialMode) ? `
          <div class="char-profiles-section">
            <div class="char-profiles-header">
              <span class="char-profiles-title">📂 Nhân Vật Của Bé Đã Lưu Cố Định:</span>
              <button type="button" class="btn-new-profile-chip" id="btn-create-new-profile" title="Tạo nhân vật tên mới">
                <span>➕ Tạo nhân vật mới</span>
              </button>
            </div>
            <div class="char-profiles-rack">
              ${profiles.map(p => {
                const isActive = p.name.toLowerCase() === this.characterName.toLowerCase();
                const icon = p.skin === 'knight' ? '💜' : '🌱';
                return `
                  <button
                    type="button"
                    class="char-profile-pill ${isActive ? 'is-active-pill' : ''}"
                    data-load-profile="${p.name}"
                    title="Tiếp tục chơi với ${p.name}"
                  >
                    <span class="profile-pill-icon">${icon}</span>
                    <span class="profile-pill-name">${p.name}</span>
                    <span class="profile-pill-level">Lv.${p.level || 1}</span>
                    <span class="profile-pill-stars">⭐ ${p.stars || 0}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- KHUNG 3: DANH SÁCH THẺ CHỌN NHÂN VẬT KÈM CẤP ĐỘ & EXP -->
        <div class="char-cards-grid">
          <!-- THẺ 1: BÉ SÂU DŨNG CẢM (MẶC ĐỊNH) -->
          <div class="char-card default-card ${this.selectedSkin === 'default' ? 'active-equipped' : ''}" data-skin="default" role="button" tabindex="0" aria-label="Chọn Bé Sâu Dũng Cảm">
            <div class="char-card-badge default-badge">🌱 MẦM NON ĐÁNG YÊU</div>
            <div class="char-avatar-frame">
              <div class="char-avatar-glow"></div>
              <img src="${defaultHeroAvatar}" class="char-avatar-img ${this.selectedSkin === 'default' ? 'bouncing' : ''}" alt="Bé Sâu Mặc Định">
            </div>

            <div class="char-info">
              <h3 class="char-name">Bé Sâu Dũng Cảm</h3>

              <!-- CẤP ĐỘ & KINH NGHIỆM EXP CỦA NHÂN VẬT -->
              <div class="char-level-box">
                <div class="char-level-badge-row">
                  <span class="char-level-badge">⭐ Cấp Độ: Cấp ${sauInfo.level} (Lv.${sauInfo.level})</span>
                  <span class="char-exp-text">⚡ EXP: ${sauInfo.exp}/${sauInfo.level * 50}</span>
                </div>
                <div class="char-exp-bar-track" title="Tiến trình kinh nghiệm thăng cấp">
                  <div class="char-exp-bar-fill green-fill" style="width: ${sauInfo.pct}%;"></div>
                </div>
              </div>

              <div class="char-tags">
                <span class="char-tag">🌱 Nhanh Nhẹn</span>
                <span class="char-tag">🍎 Thân Thiện</span>
                <span class="char-tag">🧠 Thông Minh</span>
              </div>
              <p class="char-desc">Chú sâu xanh nhỏ tròn xoe ngộ nghĩnh, người bạn đồng hành thân thuộc luôn sẵn sàng giải mọi câu đố vui!</p>
            </div>

            <div class="char-action-wrap">
              ${this.selectedSkin === 'default'
                ? `<button type="button" class="char-select-btn btn-equipped" disabled>✓ ĐÃ CHỌN</button>`
                : `<button type="button" class="char-select-btn btn-choose" data-skin-action="default">CHỌN BÉ SÂU 🌱</button>`
              }
            </div>
          </div>

          <!-- THẺ 2: BÉ SAM KUROMI (TÓC 2 CHÙM BỘ ĐỒ TÍM NHẠT) -->
          <div class="char-card knight-card ${this.selectedSkin === 'knight' ? 'active-equipped' : ''}" data-skin="knight" role="button" tabindex="0" aria-label="Chọn Bé Sam Kuromi">
            <div class="char-card-badge knight-badge">💜 BÉ SAM KUROMI</div>
            <div class="char-avatar-frame knight-frame">
              <div class="char-avatar-glow purple-glow"></div>
              <img src="${knightHeroAvatar}" class="char-avatar-img ${this.selectedSkin === 'knight' ? 'bouncing' : ''}" alt="Bé Sam Kuromi">
            </div>

            <div class="char-info">
              <h3 class="char-name">Bé Sam Kuromi</h3>

              <!-- CẤP ĐỘ & KINH NGHIỆM EXP CỦA NHÂN VẬT -->
              <div class="char-level-box">
                <div class="char-level-badge-row">
                  <span class="char-level-badge purple-level">⭐ Cấp Độ: Cấp ${samInfo.level} (Lv.${samInfo.level})</span>
                  <span class="char-exp-text purple-exp">⚡ EXP: ${samInfo.exp}/${samInfo.level * 50}</span>
                </div>
                <div class="char-exp-bar-track purple-track" title="Tiến trình kinh nghiệm thăng cấp">
                  <div class="char-exp-bar-fill purple-fill" style="width: ${samInfo.pct}%;"></div>
                </div>
              </div>

              <div class="char-tags">
                <span class="char-tag purple">💜 Tóc 2 Chùm</span>
                <span class="char-tag kuromi">🎒 Cặp Kuromi</span>
                <span class="char-tag star">✨ Đồ Tím Nhạt</span>
              </div>
              <p class="char-desc">Em bé gái tóc 2 chùm siêu dễ thương diện bộ đồ tím nhạt pastel, mang chiếc balo hoạt hình Kuromi tinh nghịch cùng bé khám phá!</p>
            </div>

            <div class="char-action-wrap">
              ${this.selectedSkin === 'knight'
                ? `<button type="button" class="char-select-btn btn-equipped purple" disabled>✓ ĐÃ CHỌN</button>`
                : `<button type="button" class="char-select-btn btn-choose purple" data-skin-action="knight">CHỌN BÉ SAM 💜</button>`
              }
            </div>
          </div>
        </div>

        <!-- NÚT BẮT ĐẦU PHIÊU LƯU HOẶC LƯU & TIẾP TỤC -->
        <div class="char-start-adventure-wrap">
          <button type="button" class="char-start-adventure-cta" id="char-btn-start-adventure">
            <span class="btn-cta-star" aria-hidden="true">⭐</span>
            <span>${this.isInitialMode ? 'BẮT ĐẦU PHIÊU LƯU' : 'LƯU & TIẾP TỤC KHÁM PHÁ'}</span>
            <span class="btn-cta-star" aria-hidden="true">⭐</span>
          </button>
        </div>

        ${!this.isInitialMode ? `
          <div class="char-footer-hint">
            <span>💡 Bé có thể chạm vào avatar trên thanh điều khiển bất kỳ lúc nào để đổi nhân vật & quản lý hồ sơ!</span>
          </div>
        ` : ''}
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const btnClose = this.container.querySelector('#char-btn-close');
    if (btnClose) {
      btnClose.onclick = () => this.hide();
    }

    // 1. Ô nhập tên nhân vật
    const nameInput = this.container.querySelector('#char-name-input');
    if (nameInput) {
      nameInput.oninput = (e) => {
        this.characterName = e.target.value;
      };
      nameInput.onchange = (e) => {
        this.characterName = e.target.value.trim();
      };
    }

    // 2. Nút phát âm tên bé
    const btnSpeak = this.container.querySelector('#btn-speak-name');
    if (btnSpeak) {
      btnSpeak.onclick = () => {
        const nameToSpeak = this.characterName.trim() || (this.selectedSkin === 'knight' ? 'Bé Sam' : 'Bé Sâu');
        if (this.audioService) {
          this.audioService.playChime(640, 0.15);
          this.audioService.speak(`Chào mừng ${nameToSpeak}!`);
        }
      };
    }

    // 3. Gợi ý tên nhanh 1 chạm (Quick Name Chips)
    const chips = this.container.querySelectorAll('[data-name-chip]');
    chips.forEach(chip => {
      chip.onclick = () => {
        const chosenName = chip.getAttribute('data-name-chip');
        const chosenSkin = chip.getAttribute('data-chip-skin');
        this.characterName = chosenName;
        if (chosenSkin) {
          this.selectedSkin = chosenSkin;
        }

        if (this.audioService) {
          this.audioService.playChime(680, 0.12);
          this.audioService.speak(`Chào ${chosenName}!`);
        }

        this.render();
      };
    });

    // 4. Chọn hoặc nạp hồ sơ nhân vật đã lưu
    const profilePills = this.container.querySelectorAll('[data-load-profile]');
    profilePills.forEach(pill => {
      pill.onclick = () => {
        const profName = pill.getAttribute('data-load-profile');
        if (profName && this.saveAdapter) {
          this.saveAdapter.setActiveProfile(profName);
          const loaded = this.saveAdapter.loadProfile(profName);
          this.characterName = profName;
          this.selectedSkin = loaded?.player?.selectedSkin || 'default';

          if (this.audioService) {
            this.audioService.playChime(650, 0.15);
            this.audioService.speak(`Chào mừng ${profName} quay trở lại!`);
          }

          this.render();
        }
      };
    });

    // Nút tạo nhân vật mới
    const btnNewProf = this.container.querySelector('#btn-create-new-profile');
    if (btnNewProf) {
      btnNewProf.onclick = () => {
        this.characterName = '';
        this.selectedSkin = 'knight';
        this.render();
        setTimeout(() => {
          const inp = this.container.querySelector('#char-name-input');
          if (inp) inp.focus();
        }, 80);
      };
    }

    // 5. Chọn thẻ nhân vật
    const cards = this.container.querySelectorAll('.char-card');
    cards.forEach(card => {
      card.onclick = () => {
        const skin = card.getAttribute('data-skin');
        if (skin) {
          this.setSkinSelection(skin);
        }
      };
    });

    const chooseBtns = this.container.querySelectorAll('[data-skin-action]');
    chooseBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const skin = btn.getAttribute('data-skin-action');
        this.setSkinSelection(skin);
      };
    });

    // 6. Nút BẮT ĐẦU PHIÊU LƯU / LƯU & TIẾP TỤC
    const btnStart = this.container.querySelector('#char-btn-start-adventure');
    if (btnStart) {
      btnStart.onclick = () => {
        this.confirmAndStart();
      };
    }

    // Đóng khi click backdrop ngoài (chỉ khi không ở chế độ khởi đầu)
    this.container.onclick = (e) => {
      if (!this.isInitialMode && e.target === this.container) {
        this.hide();
      }
    };
  }

  setSkinSelection(skinId) {
    this.selectedSkin = skinId;

    // Nếu tên chưa đặt hoặc đang là tên mặc định của skin khác thì tự động điều chỉnh
    const currentTrim = this.characterName.trim();
    if (!currentTrim || currentTrim === 'Bé Sâu' || currentTrim === 'Bé Sam') {
      this.characterName = skinId === 'knight' ? 'Bé Sam' : 'Bé Sâu';
    }

    if (this.audioService) {
      this.audioService.playChime(640, 0.12);
      const heroTitle = skinId === 'knight' ? 'Bé Sam Kuromi' : 'Bé Sâu Dũng Cảm';
      this.audioService.speak(`Bé chọn ${heroTitle}!`);
    }

    this.render();
  }

  /**
   * Xác nhận tên và nhân vật, lưu cố định dữ liệu và bắt đầu vào game
   */
  confirmAndStart() {
    const finalName = (this.characterName.trim() || (this.selectedSkin === 'knight' ? 'Bé Sam' : 'Bé Sâu')).trim();
    const finalSkin = this.selectedSkin || 'default';

    if (this.saveAdapter) {
      // Đặt active profile theo tên nhân vật bé đặt
      this.saveAdapter.setActiveProfile(finalName);

      // Nạp hoặc khởi tạo dữ liệu cho nhân vật này
      const state = this.saveAdapter.loadProfile(finalName);
      if (!state.player) state.player = {};
      state.player.name = finalName;
      state.player.selectedSkin = finalSkin;
      if (!Array.isArray(state.player.unlockedSkins)) {
        state.player.unlockedSkins = ['default'];
      }
      if (!state.player.unlockedSkins.includes(finalSkin)) {
        state.player.unlockedSkins.push(finalSkin);
      }

      // Lưu cố định theo tên nhân vật
      this.saveAdapter.saveProfile(finalName, state);
      this.saveAdapter.save(state);

      if (this.progressionSystem) {
        this.progressionSystem.state = state;
        this.progressionSystem.setPlayerName(finalName);
        this.progressionSystem.unlockSkin(finalSkin);
        this.progressionSystem.setSelectedSkin(finalSkin);
      }
    }

    // Cập nhật Topbar HUD
    if (this.hudController) {
      this.hudController.updatePlayerHud();
      this.hudController.setStatus(finalSkin === 'knight'
        ? `👑 ${finalName} đã sẵn sàng!`
        : `🌱 ${finalName} đã sẵn sàng!`
      );
    }

    // Âm thanh khích lệ
    if (this.audioService) {
      this.audioService.playSuccess();
      this.audioService.speak(`Chào mừng ${finalName}! Cùng xuất phát khám phá nào bé ơi!`);
    }

    // Bắn sự kiện thời gian thực cho WorldScene, Topbar & Toàn bộ game
    window.dispatchEvent(new CustomEvent('hero:skin-changed', {
      detail: {
        skin: finalSkin,
        name: finalName,
        avatarUrl: finalSkin === 'knight' ? knightHeroAvatar : defaultHeroAvatar
      }
    }));

    window.dispatchEvent(new CustomEvent('hero:profile-changed', {
      detail: { name: finalName, skin: finalSkin }
    }));

    this.hide();

    const cb = this.onStartCallback;
    this.isInitialMode = false;
    this.onStartCallback = null;

    if (typeof cb === 'function') {
      cb(finalSkin, finalName);
    }
  }

  /**
   * Chế độ Chọn Nhân Vật Khởi Đầu (Trước khi vào game)
   */
  showInitialSelection(options = {}) {
    this.isInitialMode = true;
    this.onStartCallback = options.onStart;

    if (this.saveAdapter) {
      const activeName = this.saveAdapter.getActiveProfileName();
      const state = this.saveAdapter.load();
      this.characterName = activeName || state?.player?.name || 'Bé Sâu';
      this.selectedSkin = state?.player?.selectedSkin || 'default';
    }

    this.render();

    if (this.container) {
      this.container.style.display = 'flex';
      this.container.classList.add('fade-in');
      this.isVisible = true;
    }

    if (this.audioService) {
      this.audioService.playChime(600, 0.15);
      this.audioService.speak('Chào bé yêu! Bé hãy chọn bạn đồng hành và đặt tên để cùng phiêu lưu nhé!');
    }
  }

  show() {
    this.isInitialMode = false;

    if (this.saveAdapter) {
      const activeName = this.saveAdapter.getActiveProfileName();
      const state = this.saveAdapter.load();
      this.characterName = activeName || state?.player?.name || 'Bé Sâu';
      this.selectedSkin = state?.player?.selectedSkin || 'default';
    }

    this.render();

    if (this.container) {
      this.container.style.display = 'flex';
      this.container.classList.add('fade-in');
      this.isVisible = true;
    }

    if (this.audioService) {
      this.audioService.playChime(580, 0.1);
      this.audioService.speak('Chọn trang phục và đặt tên cho nhân vật của bé!');
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      this.isVisible = false;
    }
  }
}
