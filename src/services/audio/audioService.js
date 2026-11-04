/**
 * Audio Service Adapter
 * Quản lý SFX & BGM (qua Kenney & FreePD CC0 Audio + Web Audio API Oscillator fallback) và Giọng đọc (qua Web Speech API).
 * Không phụ thuộc server bên ngoài, an toàn tuyệt đối và chạy mượt mà offline.
 */

// --- SFX URLs ---
const sfxClickUrl = '/assets/audio/sfx_click.wav';
const sfxSelectUrl = '/assets/audio/sfx_select.wav';
const sfxRolloverUrl = '/assets/audio/sfx_rollover.wav';
const sfxSuccessUrl = '/assets/audio/sfx_success.ogg';
const sfxPowerupUrl = '/assets/audio/sfx_powerup.ogg';
const sfxTryagainUrl = '/assets/audio/sfx_tryagain.ogg';
const sfxPetHappyUrl = '/assets/audio/sfx_pet_happy.ogg';
const sfxChimeUrl = '/assets/audio/sfx_chime.ogg';
const sfxStageClearUrl = '/assets/audio/sfx_stage_clear.ogg';
const sfxHealUrl = '/assets/audio/sfx_heal.ogg';

// SFX mới bổ sung (CC0)
const sfxCoinBuyUrl = '/assets/audio/sfx_coin_buy.ogg';
const sfxBagOpenUrl = '/assets/audio/sfx_bag_open.ogg';
const sfxEquipAccessoryUrl = '/assets/audio/sfx_equip_accessory.ogg';
const sfxDragDropUrl = '/assets/audio/sfx_drag_drop.ogg';
const sfxCardFlipUrl = '/assets/audio/sfx_card_flip.ogg';
const sfxBobberSplashUrl = '/assets/audio/sfx_bobber_splash.ogg';
const sfxFishBiteUrl = '/assets/audio/sfx_fish_bite.ogg';
const sfxCastRodUrl = '/assets/audio/sfx_cast_rod.ogg';
const sfxPetBarkUrl = '/assets/audio/sfx_pet_bark.ogg';
const sfxCookingSizzleUrl = '/assets/audio/sfx_cooking_sizzle.ogg';
const sfxDishCompleteUrl = '/assets/audio/sfx_dish_complete.ogg';

// --- BGM URLs (FreePD CC0) ---
export const BGM_TRACKS = {
  bgm_pet_farm: '/assets/audio/bgm_pet_farm.ogg',
  bgm_fishing_pond: '/assets/audio/bgm_fishing_pond.ogg',
  bgm_rainbow_market: '/assets/audio/bgm_rainbow_market.ogg',
  bgm_kitchen: '/assets/audio/bgm_kitchen.ogg',
  bgm_adventure_main: '/assets/audio/bgm_adventure_main.ogg',
  bgm_battle_boss: '/assets/audio/bgm_battle_boss.ogg'
};

export class AudioService {
  constructor() {
    this.soundEnabled = false;
    this.volume = 0.8;
    this.bgmVolume = 0.45; // Âm lượng nhạc nền du dương êm dịu, không lấn át tiếng nói/hiệu ứng
    this.sfxVolume = 0.85;

    this.audioContext = null;
    this.speechSynth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.isUnlocked = false;
    this.audioCache = new Map();

    // Quản lý BGM hiện tại
    this.currentBgmKey = null;
    this.currentBgmAudio = null;
    this.bgmFadeInterval = null;
  }

  initUnlockListener() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.ensureContext();
      this.isUnlocked = true;
      if (this.soundEnabled && this.currentBgmKey && (!this.currentBgmAudio || this.currentBgmAudio.paused)) {
        this.playMusic(this.currentBgmKey);
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  ensureContext() {
    if (typeof window === 'undefined') return null;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      return this.audioContext;
    } catch {
      return null;
    }
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = Boolean(enabled);
    if (!this.soundEnabled) {
      if (this.speechSynth) {
        this.speechSynth.cancel();
      }
      if (this.currentBgmAudio) {
        try {
          this.currentBgmAudio.pause();
        } catch {}
      }
    } else {
      this.playChime(640, 0.12);
      if (this.currentBgmKey) {
        this.playMusic(this.currentBgmKey);
      }
    }
    this.updateSoundToggleUI();
  }

  toggleMute() {
    this.setSoundEnabled(!this.soundEnabled);
    return this.soundEnabled;
  }

  isMuted() {
    return !this.soundEnabled;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentBgmAudio) {
      this.currentBgmAudio.volume = this.bgmVolume * this.volume;
    }
  }

  setBgmVolume(vol) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (this.currentBgmAudio) {
      this.currentBgmAudio.volume = this.bgmVolume * this.volume;
    }
  }

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  updateSoundToggleUI() {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', this.soundEnabled ? 'true' : 'false');
    btn.setAttribute('aria-label', this.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh');
    const img = btn.querySelector('.sound-toggle-img') || btn.querySelector('img');
    if (img) {
      img.src = this.soundEnabled
        ? '/assets/ui/custom_kids_ui/btn_sound_on.png'
        : '/assets/ui/custom_kids_ui/btn_sound_off.png';
      img.alt = this.soundEnabled ? '🔊' : '🔇';
    }
  }

  // ==========================================
  // HỆ THỐNG PHÁT NHẠC NỀN (BACKGROUND MUSIC)
  // ==========================================

  /**
   * Chuyển đổi bản đồ sang bài nhạc nền phù hợp
   */
  getBgmForMap(mapId) {
    if (!mapId) return 'bgm_adventure_main';
    const id = String(mapId).toLowerCase().trim();
    if (id.includes('pet_farm') || id === 'map_farm' || id === 'farm') {
      return 'bgm_pet_farm';
    }
    if (id.includes('fishing') || id.includes('pond')) {
      return 'bgm_fishing_pond';
    }
    if (id.includes('market') || id.includes('fashion')) {
      return 'bgm_rainbow_market';
    }
    if (id.includes('kitchen') || id.includes('bep')) {
      return 'bgm_kitchen';
    }
    if (id.includes('boss') || id.includes('battle') || id.includes('arena')) {
      return 'bgm_battle_boss';
    }
    return 'bgm_adventure_main';
  }

  /**
   * Phát nhạc nền theo mã mapId
   */
  playMapMusic(mapId) {
    const bgmKey = this.getBgmForMap(mapId);
    this.playMusic(bgmKey);
  }

  /**
   * Phát bản nhạc nền BGM (lặp vô tận, chuyển cảnh fade mượt mà)
   */
  playMusic(key, fadeDuration = 800) {
    if (!key || typeof window === 'undefined') return;
    const trackUrl = BGM_TRACKS[key];
    if (!trackUrl) return;

    // Nếu bài đang phát đúng là bài này và chưa bị tạm dừng thì giữ nguyên
    if (this.currentBgmKey === key && this.currentBgmAudio && !this.currentBgmAudio.paused) {
      return;
    }

    this.currentBgmKey = key;
    if (!this.soundEnabled) return;

    if (this.bgmFadeInterval) {
      clearInterval(this.bgmFadeInterval);
      this.bgmFadeInterval = null;
    }

    const oldAudio = this.currentBgmAudio;
    const targetVolume = this.bgmVolume * this.volume;

    try {
      let nextAudio = this.audioCache.get(trackUrl);
      if (!nextAudio) {
        nextAudio = new Audio(trackUrl);
        nextAudio.loop = true;
        this.audioCache.set(trackUrl, nextAudio);
      }
      nextAudio.loop = true;
      nextAudio.currentTime = 0;
      nextAudio.volume = oldAudio ? 0 : targetVolume;

      const playPromise = nextAudio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((e) => {
          console.warn('[AudioService] BGM autoplay blocked until interaction:', e?.message);
        });
      }

      this.currentBgmAudio = nextAudio;

      // Hiệu ứng Cross-fade mượt mà giữa 2 bản nhạc
      if (oldAudio && oldAudio !== nextAudio) {
        const stepTime = 50;
        const totalSteps = Math.max(1, Math.floor(fadeDuration / stepTime));
        let step = 0;
        const initialOldVol = oldAudio.volume;

        this.bgmFadeInterval = setInterval(() => {
          step++;
          const progress = step / totalSteps;
          try {
            oldAudio.volume = Math.max(0, initialOldVol * (1 - progress));
            nextAudio.volume = Math.min(targetVolume, targetVolume * progress);
          } catch {}

          if (step >= totalSteps) {
            clearInterval(this.bgmFadeInterval);
            this.bgmFadeInterval = null;
            try {
              oldAudio.pause();
              oldAudio.currentTime = 0;
            } catch {}
          }
        }, stepTime);
      } else {
        nextAudio.volume = targetVolume;
      }
    } catch (err) {
      console.warn('[AudioService] Lỗi phát nhạc nền:', err);
    }
  }

  /**
   * Dừng phát nhạc nền
   */
  stopMusic(fadeDuration = 600) {
    if (!this.currentBgmAudio) return;
    const audio = this.currentBgmAudio;
    this.currentBgmKey = null;

    if (fadeDuration <= 0) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
      this.currentBgmAudio = null;
      return;
    }

    const initialVol = audio.volume;
    const stepTime = 50;
    const totalSteps = Math.max(1, Math.floor(fadeDuration / stepTime));
    let step = 0;

    const fade = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      try {
        audio.volume = Math.max(0, initialVol * (1 - progress));
      } catch {}

      if (step >= totalSteps) {
        clearInterval(fade);
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {}
        if (this.currentBgmAudio === audio) {
          this.currentBgmAudio = null;
        }
      }
    }, stepTime);
  }

  // ==========================================
  // HỆ THỐNG HIỆU ỨNG ÂM THANH (SFX)
  // ==========================================

  /**
   * Phát file âm thanh đã nạp sẵn với fallback sang hàm synthesizer
   */
  playSound(soundUrl, fallbackFn, customVolume = null) {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      if (typeof Audio !== 'undefined' && soundUrl) {
        let sound = this.audioCache.get(soundUrl);
        if (!sound) {
          sound = new Audio(soundUrl);
          this.audioCache.set(soundUrl, sound);
        }
        const effectiveVol = customVolume !== null ? customVolume : this.sfxVolume * this.volume;
        sound.volume = Math.max(0, Math.min(1, effectiveVol));
        sound.currentTime = 0;
        const playPromise = sound.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            if (typeof fallbackFn === 'function') fallbackFn();
          });
        }
        return;
      }
    } catch {
      // Fallback nếu trình duyệt chặn audio element
    }
    if (typeof fallbackFn === 'function') {
      fallbackFn();
    }
  }

  /**
   * Phát âm thanh tần số bằng Web Audio Oscillator
   */
  playTone(frequency = 520, duration = 0.15, type = 'sine') {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      const targetGain = 0.1 * this.volume;
      gain.gain.setValueAtTime(targetGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio playback failsafe
    }
  }

  // --- Các SFX Cơ Bản Hiện Có ---
  playClick() {
    this.playSound(sfxClickUrl, () => this.playTone(600, 0.05, 'sine'));
  }

  playSelect() {
    this.playSound(sfxSelectUrl, () => this.playTone(640, 0.08, 'sine'));
  }

  playChime(frequency = 580, duration = 0.12) {
    this.playSound(sfxChimeUrl, () => this.playTone(frequency, duration, 'sine'));
  }

  playSuccess() {
    if (!this.soundEnabled) return;
    this.playSound(sfxSuccessUrl, () => {
      setTimeout(() => this.playTone(523.25, 0.12), 0);
      setTimeout(() => this.playTone(659.25, 0.12), 110);
      setTimeout(() => this.playTone(783.99, 0.22), 220);
    });
  }

  playTryAgain() {
    if (!this.soundEnabled) return;
    this.playSound(sfxTryagainUrl, () => {
      setTimeout(() => this.playTone(340, 0.14, 'triangle'), 0);
      setTimeout(() => this.playTone(280, 0.18, 'triangle'), 130);
    });
  }

  playInteract() {
    this.playSound(sfxRolloverUrl, () => this.playTone(740, 0.08, 'sine'));
  }

  playAttack() {
    if (!this.soundEnabled) return;
    this.playTone(480, 0.08, 'triangle');
    setTimeout(() => this.playTone(680, 0.12, 'sine'), 50);
  }

  playHit() {
    if (!this.soundEnabled) return;
    this.playTone(220, 0.15, 'square');
    setTimeout(() => this.playTone(440, 0.18, 'triangle'), 60);
  }

  playPlayerHurt() {
    if (!this.soundEnabled) return;
    this.playTone(200, 0.16, 'sawtooth');
    setTimeout(() => this.playTone(160, 0.22, 'triangle'), 80);
  }

  playHeal() {
    if (!this.soundEnabled) return;
    this.playSound(sfxHealUrl, () => {
      setTimeout(() => this.playTone(440, 0.1, 'sine'), 0);
      setTimeout(() => this.playTone(554.37, 0.1, 'sine'), 80);
      setTimeout(() => this.playTone(659.25, 0.15, 'sine'), 160);
      setTimeout(() => this.playTone(880, 0.25, 'sine'), 240);
    });
  }

  playPetHappy() {
    if (!this.soundEnabled) return;
    this.playSound(sfxPetHappyUrl, () => {
      setTimeout(() => this.playTone(580, 0.1, 'sine'), 0);
      setTimeout(() => this.playTone(880, 0.15, 'sine'), 100);
    });
  }

  playGrandFanfare() {
    if (!this.soundEnabled) return;
    this.playSound(sfxStageClearUrl, () => {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 0.16, 'triangle'), idx * 110);
      });
      setTimeout(() => {
        this.playTone(1046.5, 0.55, 'sine');
        this.playTone(523.25, 0.55, 'triangle');
      }, 480);
    });
  }

  playLevelUp() {
    if (!this.soundEnabled) return;
    this.playSound(sfxPowerupUrl, () => this.playGrandFanfare());
  }

  playStageClear() {
    this.playGrandFanfare();
  }

  // --- CÁC SFX MỚI BỔ SUNG CHO TỪNG HOẠT ĐỘNG ---

  playSfx(name) {
    if (!this.soundEnabled) return;
    switch (name) {
      case 'coin':
      case 'buy':
      case 'sell':
        return this.playCoinBuy();
      case 'correct':
      case 'catch_success':
        return this.playSuccess();
      case 'wrong':
      case 'warning':
        return this.playTryAgain();
      case 'victory':
        return this.playGrandFanfare();
      case 'click':
        return this.playClick();
      case 'select':
        return this.playSelect();
      case 'equip':
        return this.playEquipAccessory();
      case 'bag':
        return this.playBagOpen();
      case 'drag':
      case 'drop':
        return this.playDragDrop();
      default:
        return this.playClick();
    }
  }

  // 1. Mua sắm & Kinh tế Sao
  playCoinBuy() {
    this.playSound(sfxCoinBuyUrl, () => {
      this.playTone(987.77, 0.08, 'sine');
      setTimeout(() => this.playTone(1318.51, 0.14, 'sine'), 60);
    });
  }

  // 2. Mở Túi Đồ Của Bé
  playBagOpen() {
    this.playSound(sfxBagOpenUrl, () => this.playTone(480, 0.08, 'sine'));
  }

  // 3. Đeo Phụ Kiện / Trang Bị Balo
  playEquipAccessory() {
    this.playSound(sfxEquipAccessoryUrl, () => {
      this.playTone(659.25, 0.08, 'sine');
      setTimeout(() => this.playTone(1046.50, 0.16, 'triangle'), 80);
    });
  }

  // 4. Kéo thả vật phẩm (Drag & Drop)
  playDragDrop() {
    this.playSound(sfxDragDropUrl, () => this.playTone(540, 0.05, 'triangle'));
  }

  // 5. Lật thẻ bài / câu hỏi
  playCardFlip() {
    this.playSound(sfxCardFlipUrl, () => this.playTone(700, 0.06, 'sine'));
  }

  // 6. Câu cá: Vung cần câu
  playCastRod() {
    this.playSound(sfxCastRodUrl, () => {
      const ctx = this.ensureContext();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } catch {}
    });
  }

  // 7. Câu cá: Phao rơi tõm xuống nước
  playBobberSplash() {
    this.playSound(sfxBobberSplashUrl, () => {
      this.playTone(280, 0.08, 'sine');
      setTimeout(() => this.playTone(420, 0.1, 'sine'), 40);
    });
  }

  // 8. Câu cá: Cá cắn câu giật phao
  playFishBite() {
    this.playSound(sfxFishBiteUrl, () => {
      this.playTone(880, 0.06, 'triangle');
      setTimeout(() => this.playTone(880, 0.06, 'triangle'), 90);
      setTimeout(() => this.playTone(1174.66, 0.12, 'sine'), 180);
    });
  }

  // 9. Câu cá: Bắt được cá lên bờ
  playFishCatch() {
    this.playSound(sfxBobberSplashUrl);
    setTimeout(() => {
      this.playSuccess();
    }, 150);
  }

  // 10. Thú cưng sủa mừng
  playPetBark() {
    this.playSound(sfxPetBarkUrl, () => {
      this.playTone(392, 0.08, 'triangle');
      setTimeout(() => this.playTone(523.25, 0.12, 'sine'), 80);
    });
  }

  // 11. Thú cưng ăn uống
  playPetEat() {
    this.playTone(440, 0.07, 'triangle');
    setTimeout(() => this.playTone(400, 0.07, 'triangle'), 90);
    setTimeout(() => this.playTone(460, 0.09, 'triangle'), 180);
  }

  playPetDrink() {
    this.playTone(520, 0.06, 'sine');
    setTimeout(() => this.playTone(600, 0.06, 'sine'), 80);
    setTimeout(() => this.playTone(560, 0.08, 'sine'), 160);
  }

  playPetFlush() {
    this.playSound(sfxBobberSplashUrl, () => {
      this.playTone(320, 0.25, 'sawtooth');
      setTimeout(() => this.playTone(220, 0.35, 'sine'), 150);
    });
  }

  // 12. Bếp nấu: Xèo xèo & Hoàn thành món
  playCookingSizzle() {
    this.playSound(sfxCookingSizzleUrl, () => {
      this.playTone(300, 0.2, 'sawtooth');
    });
  }

  playDishComplete() {
    this.playSound(sfxDishCompleteUrl, () => {
      this.playGrandFanfare();
    });
  }

  /**
   * Phát âm thanh 8 Bước Dịch Chuyển Không Gian Cầu Vồng
   */
  playPortalStep(step = 1) {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      if (step === 1) {
        this.playTone(392, 0.25, 'sine');
      } else if (step === 2) {
        this.playTone(523.25, 0.15, 'sine');
        setTimeout(() => this.playTone(659.25, 0.2, 'sine'), 90);
      } else if (step === 3) {
        this.playTone(587.33, 0.12, 'sine');
        setTimeout(() => this.playTone(783.99, 0.22, 'sine'), 80);
      } else if (step === 4) {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          setTimeout(() => this.playTone(freq, 0.12, 'sine'), idx * 70);
        });
      } else if (step === 5) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (step === 6) {
        this.playTone(1046.5, 0.25, 'triangle');
      } else if (step === 7) {
        this.playTone(659.25, 0.18, 'sine');
        setTimeout(() => this.playTone(523.25, 0.3, 'sine'), 100);
      } else if (step === 8) {
        this.playGrandFanfare();
      }
    } catch {}
  }

  // --- HỖ TRỢ GIỌNG ĐỌC TIẾNG VIỆT (SPEECH SYNTHESIS) ---
  cleanTextForSpeech(text) {
    if (!text) return '';
    let clean = String(text);

    // 1. Lọc thẻ HTML và markdown formatting
    clean = clean.replace(/<[^>]*>/g, ' ');
    clean = clean.replace(/[*_#`~]/g, '');

    // 2. Chuẩn hóa công thức và số lượng trong game
    clean = clean.replace(/\bx\s*(\d+)\b/gi, '$1 phần');
    clean = clean.replace(/(\d+)\s*\/\s*(\d+)/g, '$1 trên $2');
    clean = clean.replace(/Số lượng trong túi:\s*(\d+)/gi, 'Số lượng trong túi: $1 phần');
    clean = clean.replace(/Số lượng:\s*(\d+)/gi, 'Số lượng: $1 phần');
    clean = clean.replace(/Còn\s*(\d+)\b/gi, 'Còn $1 phần');

    // 3. Chuẩn hóa khoảng số và phép toán có dấu gạch ngang
    // a. Khoảng số có đơn vị cụ thể (ví dụ: "5-6 tuổi", "1-10 điểm")
    clean = clean.replace(/(\d+)\s*-\s*(\d+)\s*(tuổi|tuoi|phần|phan|bông|con|quả|qua|cái|cai|chiếc|chiec|bậc|bac|người|nguoi|bạn|ban|điểm|diem|sao)/gi, '$1 đến $2 $3');

    // b. Phép tính có dấu hỏi kết quả: biến (= ? hoặc bằng ?) thành "bằng mấy?"
    clean = clean.replace(/(=|bằng)\s*\?/gi, '$1 mấy?');

    // c. Chuẩn hóa phép cộng
    clean = clean.replace(/(\d+)\s*\+\s*(\d+)/g, '$1 cộng $2');

    // d. Phân biệt thông minh giữa Khoảng số (n1 < n2: "1 đến 5") và Phép trừ (n1 >= n2: "8 trừ 3")
    clean = clean.replace(/(\d+)\s*-\s*(\d+)/g, (match, p1, p2) => {
      const n1 = parseInt(p1, 10);
      const n2 = parseInt(p2, 10);
      if (n1 < n2) {
        return `${n1} đến ${n2}`;
      }
      return `${n1} trừ ${n2}`;
    });

    clean = clean.replace(/=/g, ' bằng ');
    clean = clean.replace(/\+/g, ' cộng ');

    // 5. Ký tự phân cách và gạch đầu dòng
    clean = clean.replace(/·/g, ' , ')
                 .replace(/^\s*[-•]\s*/gm, '')
                 .replace(/\s+[-•]\s+/g, ', ')
                 .replace(/[/|]/g, ' hoặc ');

    // 6. Loại bỏ toàn bộ Emoji và ký tự hình ảnh rác để không bị phát âm tên tiếng Anh
    clean = clean.replace(/[•★⭐✨❤️💛⚡📦🍽️🥕🌸🌻🌼🍀🎉🏆👑🃏🧩🕹️💡🔔🎵🎶👉👈👆👇✓✔✕✖❌⭕💯🍎🍓🍌🍊🍇🍉🍐🥕🍅🥦🐟🦐🦀🍳🍲🥢🥣]/gu, ' ');
    clean = clean.replace(/[\u{1F300}-\u{1FADF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '');

    // 7. Dấu hỏi "?" ở câu hỏi thông thường:
    // GIỮ NGUYÊN dấu ? để Web Speech API áp dụng ngữ điệu hỏi (rising intonation) tự nhiên của tiếng Việt.
    // Chỉ loại bỏ dấu ? thừa hoặc lặp lại
    clean = clean.replace(/\?+/g, '?');

    // 8. Dọn dẹp khoảng trắng dư thừa
    clean = clean.replace(/\s+/g, ' ').trim();

    return clean;
  }

  speak(text, onEnd) {
    if (!this.soundEnabled || !text) {
      if (typeof onEnd === 'function') onEnd();
      return;
    }

    const speechText = this.cleanTextForSpeech(text);
    if (!speechText) {
      if (typeof onEnd === 'function') onEnd();
      return;
    }

    if (!this.speechSynth && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynth = window.speechSynthesis;
    }
    if (!this.speechSynth) {
      if (typeof onEnd === 'function') onEnd();
      return;
    }

    try {
      if (this.speechSynth.paused) {
        this.speechSynth.resume();
      }
      this.speechSynth.cancel();

      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(speechText);
          utterance.lang = 'vi-VN';
          utterance.rate = 0.88;
          utterance.pitch = 1.06;
          utterance.volume = this.volume;

          const voices = this.speechSynth.getVoices ? this.speechSynth.getVoices() : [];
          const viVoice = voices.find(v => v.lang === 'vi-VN' || v.lang.startsWith('vi') || v.name?.toLowerCase().includes('vietnam'));
          if (viVoice) {
            utterance.voice = viVoice;
          }

          if (typeof onEnd === 'function') {
            utterance.onend = () => onEnd();
            utterance.onerror = () => onEnd();
          }

          this.speechSynth.speak(utterance);
        } catch (err) {
          console.warn('SpeechSynthesis speak failed:', err);
          if (typeof onEnd === 'function') onEnd();
        }
      }, 50);
    } catch {
      if (typeof onEnd === 'function') onEnd();
    }
  }

  stopAll() {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
    this.stopMusic(300);
  }
}

export const audioService = new AudioService();
