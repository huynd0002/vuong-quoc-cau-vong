import sauActionUrl from '../../../assets/hero/sau/sau_action.webp?url';
import heroUpgradeActionUrl from '../../../assets/hero/sau_upgrade/hero_upgrade_action.webp?url';
import petDogUrl from '../../../assets/pets/dog/dog_idle.png?url';
import { saveAdapter } from '../../services/save/saveAdapter.js';

/**
 * MapLoadingOverlay (Màn Hình Loading Chuyển Maps Thần Kỳ Cho Bé)
 * - Thiết kế phong cách Chibi mầm non, màu sắc Cầu Vồng tươi vui, ấm áp
 * - Bé Sâu tung tăng bước đi cùng bạn Bé Cún
 * - Hiển thị tên vùng đất chuẩn bị đến với icon sinh động
 * - Lời dặn dò, động viên ngọt ngào và thanh tiến trình Candy Rainbow 3D
 * - Hiệu ứng chuyển cảnh mượt mà không gây giật màn hình
 */
export class MapLoadingOverlay {
  constructor(options = {}) {
    this.audioService = options.audioService;
    this.hudController = options.hudController;
    this.isLoading = false;

    this.overlay = null;
    this.mascotImg = null;
    this.titleEl = null;
    this.tipEl = null;
    this.progressBar = null;
    this.percentEl = null;

    this.tips = [
      '🎒 Bé Sâu đang chuẩn bị ba lô thần kỳ để cùng bé khám phá!',
      '🌈 Mỗi câu đố giải đúng sẽ thắp sáng một ngôi sao lấp lánh!',
      '🌸 Hãy lắng nghe thật kỹ để tìm ra những người bạn nhỏ nhé!',
      '⭐ Lòng tốt và trí thông minh sẽ giúp bé vượt qua mọi thử thách!',
      '🌊 Vùng đất mới có biết bao nhiêu điều kỳ thú đang chờ bé đó!',
      '🏡 Cùng đến Nông Trại để chăm sóc và chơi đùa với Bé Cún nhé! 🦴'
    ];

    this.mapIcons = {
      map1: '🌾',
      map2: '🌊',
      map3: '💎',
      map4: '🏜️',
      map5: '❄️',
      map6: '🐉',
      map_pet_farm: '🏡',
      map_kitchen: '🍳',
      map_fishing: '🎣',
      map_market: '🛍️',
      map_fashion: '🎀'
    };

    this._timers = new Set();
    this._readyHandler = null;
    this._lastTipIdx = -1;

    this.initDOM();
  }

  getMascotSrc() {
    try {
      const state = saveAdapter.load();
      if (state?.player?.selectedSkin === 'knight') {
        return heroUpgradeActionUrl;
      }
    } catch {
      // fallback
    }
    return sauActionUrl;
  }

  schedule(fn, delayMs) {
    const id = setTimeout(() => {
      this._timers.delete(id);
      fn();
    }, delayMs);
    this._timers.add(id);
    return id;
  }

  clearPending() {
    for (const id of this._timers) {
      clearTimeout(id);
    }
    this._timers.clear();
    if (this._readyHandler && typeof window !== 'undefined') {
      window.removeEventListener('game:map-ready', this._readyHandler);
      this._readyHandler = null;
    }
  }

  initDOM() {
    if (typeof document === 'undefined') return;

    let el = document.getElementById('map-loading-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'map-loading-overlay';
      el.className = 'map-loading-overlay';
      el.hidden = true;
      el.innerHTML = `
        <div class="map-loading-backdrop">
          <div class="map-loading-aurora"></div>
        </div>
        <div class="map-loading-card">
          <div class="map-loading-mascots">
            <img class="loading-mascot-hero" id="map-loading-hero-img" src="${this.getMascotSrc()}" alt="Bé Sâu" />
            <img class="loading-mascot-pet" src="${petDogUrl}" alt="Bé Cún" />
          </div>
          <div class="map-loading-badge">✨ ĐANG CHUYỂN VÙNG ĐẤT MỚI</div>
          <h2 class="map-loading-title" id="map-loading-title">
            <span class="map-icon" id="map-loading-icon">🌈</span>
            <span class="map-name" id="map-loading-name">Vương Quốc Cầu Vồng</span>
          </h2>
          <p class="map-loading-tip" id="map-loading-tip">${this.tips[0]}</p>
          <div class="map-loading-bar-track">
            <div class="map-loading-bar-fill" id="map-loading-bar-fill" style="width: 15%">
              <div class="map-loading-bar-gloss"></div>
            </div>
          </div>
          <div class="map-loading-status-row">
            <span class="loading-pulse-dot"></span>
            <span class="loading-status-text" id="map-loading-status">Đang chuẩn bị bản đồ...</span>
            <span class="loading-percent" id="map-loading-percent">15%</span>
          </div>
        </div>
      `;
      document.body.appendChild(el);
    }

    this.overlay = el;
    this.mascotImg = el.querySelector('#map-loading-hero-img');
    this.iconEl = el.querySelector('#map-loading-icon');
    this.nameEl = el.querySelector('#map-loading-name');
    this.titleEl = el.querySelector('#map-loading-title');
    this.tipEl = el.querySelector('#map-loading-tip');
    this.progressBar = el.querySelector('#map-loading-bar-fill');
    this.statusTextEl = el.querySelector('#map-loading-status');
    this.percentEl = el.querySelector('#map-loading-percent');
  }

  /**
   * Hiển thị màn hình Loading chuyển map mượt mà và đợi sự kiện game:map-ready thật từ Phaser.
   */
  show({ targetMapId = 'map2', targetMapName = 'Vùng Đất Mới', onSwitch, onComplete } = {}) {
    if (typeof document === 'undefined') {
      if (typeof onSwitch === 'function') onSwitch();
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    if (!this.overlay) this.initDOM();
    this.clearPending();
    this.isLoading = true;

    if (this.mascotImg) {
      this.mascotImg.src = this.getMascotSrc();
    }
    if (this.iconEl) {
      this.iconEl.textContent = this.mapIcons[targetMapId] || '🌈';
    }
    if (this.nameEl) {
      this.nameEl.textContent = targetMapName;
    }
    if (this.tipEl && this.tips.length > 0) {
      let idx = Math.floor(Math.random() * this.tips.length);
      if (this.tips.length > 1 && idx === this._lastTipIdx) {
        idx = (idx + 1) % this.tips.length;
      }
      this._lastTipIdx = idx;
      this.tipEl.textContent = this.tips[idx];
    }

    this.setProgress(18, `Đang mở đường tới ${targetMapName}...`);

    if (this.overlay) {
      this.overlay.hidden = false;
      void this.overlay.offsetWidth;
      this.overlay.classList.add('active');
    }

    let sceneReady = false;
    let minHoldElapsed = false;
    let finished = false;
    let switchInvoked = false;

    const tryFinish = () => {
      if (finished || !sceneReady || !minHoldElapsed) return;
      finished = true;
      this.clearPending();
      this.setProgress(100, `Chào mừng đến ${targetMapName}! ✨`);
      this.schedule(() => {
        this.overlay?.classList.remove('active');
        this.schedule(() => {
          if (this.overlay) {
            this.overlay.hidden = true;
          }
          this.isLoading = false;
          if (typeof onComplete === 'function') {
            onComplete();
          }
        }, 220);
      }, 180);
    };

    this._readyHandler = (evt) => {
      if (!switchInvoked) return;
      const readyId = evt?.detail?.mapConfig?.id || evt?.detail?.mapId;
      if (readyId && targetMapId && readyId !== targetMapId) return;
      sceneReady = true;
      this.setProgress(92, 'Đang hoàn tất khung cảnh...');
      tryFinish();
    };
    window.addEventListener('game:map-ready', this._readyHandler);

    this.schedule(() => {
      this.setProgress(45, 'Đang chuyển bản đồ thần kỳ...');
      switchInvoked = true;
      if (typeof onSwitch === 'function') {
        onSwitch();
      }
    }, 150);

    this.schedule(() => {
      if (!finished) {
        this.setProgress(sceneReady ? 92 : 76, 'Đang tải nhân vật và bối cảnh...');
      }
    }, 360);

    this.schedule(() => {
      minHoldElapsed = true;
      tryFinish();
    }, 560);

    // Watchdog 3.8s phòng trường hợp scene restart không phát sự kiện ready
    this.schedule(() => {
      sceneReady = true;
      minHoldElapsed = true;
      tryFinish();
    }, 3800);
  }

  hide() {
    this.clearPending();
    this.isLoading = false;
    if (this.overlay) {
      this.overlay.classList.remove('active');
      this.overlay.hidden = true;
    }
  }

  setProgress(percent, statusText) {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    if (this.progressBar) {
      this.progressBar.style.width = `${clamped}%`;
    }
    if (this.percentEl) {
      this.percentEl.textContent = `${clamped}%`;
    }
    if (this.statusTextEl && statusText) {
      this.statusTextEl.textContent = statusText;
    }
  }
}
