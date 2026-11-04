/**
 * PetFarmStatusHUD - Vòng tròn trạng thái thú cưng dạng % trên map Nông Trại Thú Cưng
 * Hiển thị 5 chỉ số cốt lõi: No bụng, Uống nước, Sạch sẽ, Vui vẻ, Năng lượng
 * Tự động cập nhật % theo thời gian thực (game:pet-updated)
 * Tương tác nhấp: Cho phép bé chạm vào từng vòng tròn để cún chạy lại trạm tương ứng và nhận chăm sóc!
 */

export class PetFarmStatusHUD {
  constructor(options = {}) {
    this.saveAdapter = options.saveAdapter;
    this.audioService = options.audioService;
    this.petSystem = options.petSystem;

    this.hudElement = document.getElementById('pet-farm-hud');
    this.headerName = document.getElementById('pet-hud-name');
    this.headerIcon = document.getElementById('pet-hud-header-icon');

    // Cấp độ và tăng trưởng (Yêu thương, EXP)
    this.levelBadge = document.getElementById('pet-hud-level-badge');
    this.levelText = document.getElementById('pet-hud-level-text');

    this.cardAffection = document.getElementById('pet-hud-card-affection');
    this.affectionVal = document.getElementById('pet-hud-affection-val');
    this.affectionTier = document.getElementById('pet-hud-affection-tier');
    this.barAffectionFill = document.getElementById('pet-hud-bar-affection-fill');

    this.cardExp = document.getElementById('pet-hud-card-exp');
    this.expVal = document.getElementById('pet-hud-exp-val');
    this.barExpFill = document.getElementById('pet-hud-bar-exp-fill');

    // Nút Bật / Tắt Yêu cầu Cún đi cùng
    this.btnCompanionToggle = document.getElementById('pet-companion-toggle-btn');
    this.iconCompanionToggle = document.getElementById('pet-companion-toggle-icon');
    this.textCompanionToggle = document.getElementById('pet-companion-toggle-text');

    // 5 vòng tròn
    this.gauges = {
      hunger: {
        btn: document.getElementById('gauge-hunger'),
        bar: document.getElementById('ring-bar-hunger'),
        pct: document.getElementById('pct-hunger'),
        stationType: 'feed'
      },
      thirst: {
        btn: document.getElementById('gauge-thirst'),
        bar: document.getElementById('ring-bar-thirst'),
        pct: document.getElementById('pct-thirst'),
        stationType: 'water'
      },
      clean: {
        btn: document.getElementById('gauge-clean'),
        bar: document.getElementById('ring-bar-clean'),
        pct: document.getElementById('pct-clean'),
        stationType: 'bath'
      },
      fun: {
        btn: document.getElementById('gauge-fun'),
        bar: document.getElementById('ring-bar-fun'),
        pct: document.getElementById('pct-fun'),
        stationType: 'play'
      },
      energy: {
        btn: document.getElementById('gauge-energy'),
        bar: document.getElementById('ring-bar-energy'),
        pct: document.getElementById('pct-energy'),
        stationType: 'shelter'
      }
    };

    // Chu vi vòng tròn SVG (r = 28 -> C = 2 * PI * 28 = 175.929)
    this.circumference = 2 * Math.PI * 28;

    this.initEventListeners();
    this.initClickHandlers();

    if (this.saveAdapter) {
      const state = this.saveAdapter.load();
      if (state?.pet) {
        this.updateStats(state.pet);
      }
    }
  }

  initEventListeners() {
    // 1. Lắng nghe chuyển map: Chỉ hiển thị khi ở map_pet_farm
    window.addEventListener('game:map-ready', (e) => {
      const mapConfig = e.detail?.mapConfig;
      const stage = document.querySelector('.scene-stage');
      if (mapConfig?.id === 'map_pet_farm') {
        this.show();
        if (stage) stage.classList.add('on-pet-farm');
      } else {
        this.hide();
        if (stage) stage.classList.remove('on-pet-farm');
      }
    });

    // 2. Lắng nghe cập nhật chỉ số thú cưng
    window.addEventListener('game:pet-updated', (e) => {
      const pet = e.detail?.pet;
      if (pet) {
        this.updateStats(pet);
      } else if (this.saveAdapter) {
        const state = this.saveAdapter.load();
        if (state.pet) this.updateStats(state.pet);
      }
    });
  }

  initClickHandlers() {
    Object.entries(this.gauges).forEach(([statKey, gauge]) => {
      if (!gauge.btn) return;
      gauge.btn.addEventListener('click', () => {
        this.handleGaugeClick(statKey, gauge.stationType);
      });
    });

    // Tương tác bấm vào Cấp độ
    if (this.levelBadge) {
      this.levelBadge.addEventListener('click', () => {
        this.audioService?.playChime?.(840, 0.15);
        const state = this.saveAdapter?.load() || {};
        const pet = state.pet || {};
        const level = pet.level || 1;
        const petName = pet.name || (pet.type === 'bunny' ? 'Thỏ Bông' : 'Bé Cún Vàng');
        window.dispatchEvent(new CustomEvent('game:show-toast', {
          detail: { message: `👑 ${petName} đang đạt Cấp ${level}! Chăm sóc cún mỗi ngày để cún ngày càng lớn khôn nhé!` }
        }));
      });
    }

    // Tương tác bấm vào Cột Yêu Thương
    if (this.cardAffection) {
      this.cardAffection.addEventListener('click', () => {
        this.audioService?.playChime?.(880, 0.15);
        const state = this.saveAdapter?.load() || {};
        const pet = state.pet || {};
        const aff = Math.round(pet.affection ?? 10);
        let tierLabel = 'Dè dặt';
        if (aff >= 90) tierLabel = 'Tri kỷ';
        else if (aff >= 75) tierLabel = 'Quấn quýt';
        else if (aff >= 50) tierLabel = 'Gắn bó';
        else if (aff >= 25) tierLabel = 'Thân thiện';
        const petName = pet.name || (pet.type === 'bunny' ? 'Thỏ Bông' : 'Bé Cún Vàng');
        window.dispatchEvent(new CustomEvent('game:show-toast', {
          detail: { message: `💖 Độ Yêu Thương của ${petName}: ${aff}% (${tierLabel}) - Bé hãy cho ăn, tắm mát và chơi bóng cùng cún nhé!` }
        }));
      });
    }

    // Tương tác bấm vào Nút Dẫn Cún Đi Cùng / Ở Lại Nông Trại
    if (this.btnCompanionToggle) {
      this.btnCompanionToggle.addEventListener('click', () => {
        this.toggleCompanion();
      });
    }

    // Tương tác bấm vào Cột EXP
    if (this.cardExp) {
      this.cardExp.addEventListener('click', () => {
        this.audioService?.playChime?.(920, 0.15);
        const state = this.saveAdapter?.load() || {};
        const pet = state.pet || {};
        const exp = pet.exp || 0;
        const level = pet.level || 1;
        const petName = pet.name || (pet.type === 'bunny' ? 'Thỏ Bông' : 'Bé Cún Vàng');
        window.dispatchEvent(new CustomEvent('game:show-toast', {
          detail: { message: `⭐ Điểm EXP của ${petName}: ${exp}/30 (Cấp ${level}) - Chăm sóc cún cưng để nhận thêm EXP và lên cấp mới!` }
        }));
      });
    }
  }

  handleGaugeClick(statKey, stationType) {
    if (this.audioService) {
      this.audioService.playChime(700, 0.12);
    }

    const scene = window.__worldScene;
    if (!scene || scene.currentMapId !== 'map_pet_farm') return;

    // Tìm trạm tương ứng trên map nông trại
    let targetStation = null;
    if (Array.isArray(scene.petStationContainers)) {
      const found = scene.petStationContainers.find(st => st.data.type === stationType);
      if (found) targetStation = found.data;
    }

    if (targetStation) {
      scene.handlePetStationInteraction(targetStation);
    } else {
      // Fallback trực tiếp nếu không tìm thấy vị trí trạm cụ thể
      const state = this.saveAdapter ? this.saveAdapter.load() : { pet: {} };
      const pet = state.pet || {};
      const petName = pet.name || (pet.type === 'bunny' ? 'Thỏ Bông' : 'Bé Cún Vàng');

      if (statKey === 'clean') {
        pet.clean = Math.min(100, (pet.clean || 0) + 40);
        pet.affection = Math.min(100, (pet.affection || 10) + 1);
        const msg = `🧼 ${petName} được tắm bọt xà phòng thơm tho sạch sẽ! (+40 Sạch)`;
        this.applyDirectStatChange(state, pet, msg, 0x10b981);
      }
    }
  }

  applyDirectStatChange(state, pet, feedback, colorHex) {
    const scene = window.__worldScene;
    pet.lastCareTimestamp = Date.now();
    state.pet = pet;
    if (this.saveAdapter) this.saveAdapter.save(state);

    if (scene) {
      if (scene.pet?.celebrate) scene.pet.celebrate();
      const heroX = scene.hero?.sprite?.x || 640;
      const heroY = scene.hero?.sprite?.y || 360;
      scene.spawnStationParticles?.(heroX, heroY, ['🧼', '🫧', '✨', '💖'], colorHex);
      scene.spawnFloatingPopup?.(heroX, heroY - 45, '+40 Sạch sẽ 🧼', '#10b981');
    }

    window.dispatchEvent(new CustomEvent('game:pet-updated', { detail: { pet, message: feedback } }));
    window.dispatchEvent(new CustomEvent('game:show-toast', { detail: { message: feedback } }));
  }

  show() {
    if (!this.hudElement) return;
    this.hudElement.hidden = false;
    this.hudElement.style.display = 'block';

    // Cập nhật dữ liệu mới nhất
    if (this.saveAdapter) {
      const state = this.saveAdapter.load();
      if (state.pet) {
        this.updateStats(state.pet);
      }
    }
  }

  hide() {
    if (!this.hudElement) return;
    this.hudElement.hidden = true;
    this.hudElement.style.display = 'none';
  }

  updateStats(pet) {
    if (!pet) return;

    // Cập nhật tên và icon
    const isBunny = pet.type === 'bunny' || (pet.name && pet.name.toLowerCase().includes('thỏ'));
    if (this.headerName) {
      this.headerName.textContent = pet.name || (isBunny ? 'Thỏ Bông' : 'Bé Cún Vàng');
    }
    if (this.headerIcon) {
      this.headerIcon.textContent = isBunny ? '🐰' : '🐶';
    }

    // 1. Cập nhật Cấp độ (Level)
    const level = Math.max(1, Math.min(10, pet.level || 1));
    if (this.levelText) {
      this.levelText.textContent = `Cấp ${level}`;
    }

    // 2. Cập nhật Cột Yêu Thương (Affection: 0 - 100%)
    const affection = Math.max(0, Math.min(100, Math.round(pet.affection ?? 10)));
    let tierLabel = 'Dè dặt';
    if (affection >= 90) tierLabel = 'Tri kỷ';
    else if (affection >= 75) tierLabel = 'Quấn quýt';
    else if (affection >= 50) tierLabel = 'Gắn bó';
    else if (affection >= 25) tierLabel = 'Thân thiện';

    if (this.affectionVal) {
      this.affectionVal.textContent = `${affection}%`;
    }
    if (this.affectionTier) {
      this.affectionTier.textContent = `(${tierLabel})`;
    }
    if (this.barAffectionFill) {
      this.barAffectionFill.style.width = `${affection}%`;
    }

    // 3. Cập nhật Cột EXP (0 - 30 EXP / Cấp)
    const exp = Math.max(0, pet.exp || 0);
    const maxExp = 30;
    const expPct = Math.min(100, Math.round((exp / maxExp) * 100));

    if (this.expVal) {
      this.expVal.textContent = `${exp}/${maxExp}`;
    }
    if (this.barExpFill) {
      this.barExpFill.style.width = `${expPct}%`;
    }

    // Giá trị 5 chỉ số (0-100)
    const statValues = {
      hunger: Math.max(0, Math.min(100, Math.round(pet.hunger ?? 100))),
      thirst: Math.max(0, Math.min(100, Math.round(pet.thirst ?? 100))),
      clean: Math.max(0, Math.min(100, Math.round(pet.clean ?? 100))),
      fun: Math.max(0, Math.min(100, Math.round(pet.fun ?? 80))),
      energy: Math.max(0, Math.min(100, Math.round(pet.energy ?? 100)))
    };

    // Cập nhật trạng thái nút Dẫn cún đi cùng / Ở lại nông trại
    this.updateCompanionButton(Boolean(pet.isCompanion));

    Object.entries(this.gauges).forEach(([key, gauge]) => {
      const val = statValues[key];
      if (gauge.pct) {
        gauge.pct.textContent = `${val}%`;
      }

      if (gauge.bar) {
        const offset = this.circumference * (1 - val / 100);
        gauge.bar.style.strokeDashoffset = `${offset.toFixed(1)}px`;
      }

      // Cảnh báo nếu chỉ số dưới 30%
      if (gauge.btn) {
        gauge.btn.classList.toggle('low-stat', val < 30);
      }
    });
  }

  updateCompanionButton(isCompanion) {
    if (!this.btnCompanionToggle) return;
    const accompanying = Boolean(isCompanion);
    this.btnCompanionToggle.classList.toggle('accompanying', accompanying);
    if (this.iconCompanionToggle) {
      this.iconCompanionToggle.textContent = accompanying ? '🏡' : '🐾';
    }
    if (this.textCompanionToggle) {
      this.textCompanionToggle.textContent = accompanying ? 'Cho Cún Ở Lại Nông Trại' : 'Dẫn Cún Đi Cùng';
    }
    this.btnCompanionToggle.title = accompanying
      ? 'Bé Cún đang đi cùng bé. Chạm để cún ở lại nông trại vui chơi và trông nhà!'
      : 'Bé Cún đang ở nông trại. Chạm để cún đồng hành cùng bé qua các bản đồ phiêu lưu!';
  }

  toggleCompanion() {
    const state = this.saveAdapter?.load() || {};
    if (!state.pet) state.pet = {};
    const nextCompanion = !Boolean(state.pet.isCompanion);
    state.pet.isCompanion = nextCompanion;
    if (this.petSystem?.pet) {
      this.petSystem.pet.isCompanion = nextCompanion;
    }
    this.saveAdapter?.save(state);
    this.updateCompanionButton(nextCompanion);

    const petName = state.pet.name || (state.pet.type === 'bunny' ? 'Thỏ Bông' : 'Bé Cún Vàng');
    if (nextCompanion) {
      this.audioService?.playVictoryChime?.(880, 0.22);
      window.dispatchEvent(new CustomEvent('game:show-toast', {
        detail: { message: `🐾 Gâu gâu! ${petName} rất háo hức được theo bé đi khám phá các vùng đất! 💖` }
      }));
    } else {
      this.audioService?.playChime?.(560, 0.18);
      window.dispatchEvent(new CustomEvent('game:show-toast', {
        detail: { message: `🏡 ${petName} sẽ ngoan ngoãn ở lại nông trại vui chơi và trông nhà cho bé nhé! 🐕` }
      }));
    }

    window.dispatchEvent(new CustomEvent('game:pet-companion-toggled', {
      detail: { isCompanion: nextCompanion, pet: state.pet }
    }));
    window.dispatchEvent(new CustomEvent('game:pet-updated', {
      detail: { pet: state.pet }
    }));
  }
}
