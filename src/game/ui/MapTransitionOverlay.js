import { PIXELFX_SHEETS, preloadSheetImage, drawPixelFxFrame } from '../effects/pixelfxRegistry.js';

/**
 * MapTransitionOverlay (Hiệu ứng Chuyển Cảnh & Dịch Chuyển Bản Đồ Cầu Vồng Thống Nhất)
 * Kết hợp PixelFX Star Iris + sóng xung kích + màn hình Loading thật (game:map-ready)
 * mượt mà trong ~1.1–1.5s cho mọi thao tác chuyển map.
 */
export class MapTransitionOverlay {
  constructor(options = {}) {
    this.audioService = options.audioService;
    this.hudController = options.hudController;
    this.onExecuteMapSwitch = options.onExecuteMapSwitch;

    this.container = null;
    this.banner = null;
    this.badgeEl = null;
    this.textEl = null;
    this.tunnelEl = null;
    this.flashEl = null;
    this.fxCanvas = null;

    this._timers = new Set();
    this._fxRafId = null;
    this._irisSheetImg = null;
    this.isTransitioning = false;

    this.initDOM();
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
    if (this._fxRafId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this._fxRafId);
      this._fxRafId = null;
    }
    if (this.fxCanvas) {
      const ctx = this.fxCanvas.getContext('2d');
      ctx?.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
    }
  }

  initDOM() {
    if (typeof document === 'undefined') return;

    preloadSheetImage(PIXELFX_SHEETS.vfx_star_iris)
      .then((img) => { this._irisSheetImg = img; })
      .catch(() => {});

    let el = document.getElementById('warp-overlay-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'warp-overlay-container';
      el.className = 'warp-overlay-container';
      el.innerHTML = `
        <div class="warp-tunnel-effect" id="warp-tunnel-effect"></div>
        <div class="warp-flash-burst" id="warp-flash-burst"></div>
        <canvas class="warp-pixelfx-canvas" id="warp-pixelfx-canvas" width="320" height="180" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;z-index:2;opacity:0.92;"></canvas>
        <div class="warp-hud-banner" id="warp-hud-banner">
          <div class="warp-hud-badge-row">
            <span class="warp-hud-step-badge" id="warp-hud-step-badge">CHUYỂN CẢNH</span>
            <div class="warp-hud-dots" id="warp-hud-dots">
              <span class="warp-dot active" data-step="1"></span>
              <span class="warp-dot" data-step="2"></span>
              <span class="warp-dot" data-step="3"></span>
            </div>
          </div>
          <span class="warp-hud-text" id="warp-hud-text">Kích hoạt Cổng Thần Cầu Vồng...</span>
        </div>
      `;
      document.body.appendChild(el);
    }

    this.container = el;
    this.banner = document.getElementById('warp-hud-banner');
    this.badgeEl = document.getElementById('warp-hud-step-badge');
    this.dotsContainer = document.getElementById('warp-hud-dots');
    this.textEl = document.getElementById('warp-hud-text');
    this.tunnelEl = document.getElementById('warp-tunnel-effect');
    this.flashEl = document.getElementById('warp-flash-burst');
    this.fxCanvas = document.getElementById('warp-pixelfx-canvas');
  }

  playStarIrisFx(reverse = false, durationMs = 340) {
    if (!this.fxCanvas || !this._irisSheetImg) return;
    const ctx = this.fxCanvas.getContext('2d');
    if (!ctx) return;

    if (this._fxRafId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this._fxRafId);
      this._fxRafId = null;
    }

    const meta = PIXELFX_SHEETS.vfx_star_iris;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, Math.max(0, (now - startTime) / durationMs));
      const norm = reverse ? 1 - progress : progress;
      const frame = Math.min(meta.frames - 1, Math.floor(norm * (meta.frames - 1)));
      ctx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
      ctx.imageSmoothingEnabled = false;
      drawPixelFxFrame(
        ctx,
        this._irisSheetImg,
        meta,
        frame,
        this.fxCanvas.width / 2,
        this.fxCanvas.height / 2,
        1
      );
      if (progress < 1) {
        this._fxRafId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
        this._fxRafId = null;
      }
    };
    this._fxRafId = requestAnimationFrame(tick);
  }

  updateDots(currentStep) {
    if (!this.dotsContainer) return;
    const dots = this.dotsContainer.querySelectorAll('.warp-dot');
    dots.forEach((dot, index) => {
      if (index + 1 <= currentStep) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  executeUnifiedTransition({ targetMapId = 'map2', targetMapName = 'Vùng Đất Mới', onExecuteSwitch, onComplete } = {}) {
    if (!this.container) this.initDOM();
    this.clearPending();
    this.isTransitioning = true;

    this.container?.classList.add('active');
    this.banner?.classList.add('active');
    if (this.flashEl) this.flashEl.classList.remove('flash');
    if (this.tunnelEl) this.tunnelEl.classList.add('spinning');
    this.updateDots(1);

    if (this.badgeEl) this.badgeEl.textContent = '✨ BƯỚC 1/3';
    if (this.textEl) this.textEl.textContent = `🌀 Mở Cổng Cầu Vồng tới ${targetMapName}!`;

    this.audioService?.playPortalStep?.(2);
    this.spawnShockwave();
    this.spawnStardust(14);
    this.playStarIrisFx(false, 320);
    if (this.hudController) {
      this.hudController.setStatus(`🌀 Đang chuyển cảnh tới ${targetMapName}...`);
    }

    let finished = false;
    const finishTransition = () => {
      if (finished) return;
      finished = true;
      this.clearPending();
      if (this.flashEl) this.flashEl.classList.remove('flash');
      if (this.tunnelEl) this.tunnelEl.classList.remove('spinning');
      if (this.badgeEl) this.badgeEl.textContent = '🌈 BƯỚC 3/3';
      if (this.textEl) this.textEl.textContent = `🎉 Chào mừng bé đến với ${targetMapName}! ⭐`;
      this.updateDots(3);
      this.playStarIrisFx(true, 320);
      this.spawnStardust(22);
      this.audioService?.playPortalStep?.(8);
      if (this.hudController) {
        this.hudController.setStatus(`Chào mừng bé đến với ${targetMapName}! 🌈🎉`);
        this.hudController.updatePlayerHud();
      }

      this.schedule(() => {
        this.banner?.classList.remove('active');
        this.container?.classList.remove('active');
        this.isTransitioning = false;
        if (typeof onComplete === 'function') {
          onComplete();
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('game:portal-warp-complete', {
            detail: { targetMapId, targetMapName }
          }));
        }
      }, 360);
    };

    this.schedule(() => {
      this.updateDots(2);
      if (this.badgeEl) this.badgeEl.textContent = '🗺️ BƯỚC 2/3';
      if (this.textEl) this.textEl.textContent = `✨ Đang dịch chuyển tới ${targetMapName}...`;
      this.audioService?.playPortalStep?.(6);
      if (this.flashEl) this.flashEl.classList.add('flash');

      if (typeof onExecuteSwitch === 'function') {
        onExecuteSwitch(finishTransition);
      } else {
        if (typeof this.onExecuteMapSwitch === 'function') {
          this.onExecuteMapSwitch(targetMapId);
        }
        this.schedule(finishTransition, 550);
      }
    }, 260);

    // Watchdog 5.5s đảm bảo overlay không bao giờ kẹt vô hạn
    this.schedule(finishTransition, 5500);
  }

  execute8StepWarp({ targetMapId = 'map2', targetMapName = 'Vịnh Biển Pha Lê', onComplete } = {}) {
    this.executeUnifiedTransition({
      targetMapId,
      targetMapName,
      onComplete
    });
  }

  spawnShockwave() {
    if (!this.container) return;
    const wave = document.createElement('div');
    wave.className = 'warp-shockwave';
    wave.style.left = '50%';
    wave.style.top = '50%';
    wave.style.transform = 'translate(-50%, -50%)';
    this.container.appendChild(wave);
    this.schedule(() => wave.remove(), 750);
  }

  spawnStardust(count = 18) {
    if (!this.container) return;
    const stars = ['✦', '⭐', '✨', '🌈', '💎', '💫', '🌟'];
    const colors = ['#fde047', '#38bdf8', '#f43f5e', '#a855f7', '#4ade80', '#fb923c', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'warp-star-particle';
      p.textContent = stars[Math.floor(Math.random() * stars.length)];
      p.style.color = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = '50%';
      p.style.top = '50%';

      const angle = Math.random() * Math.PI * 2;
      const distance = 120 + Math.random() * 340;
      p.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      p.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);

      this.container.appendChild(p);
      this.schedule(() => p.remove(), 800);
    }
  }
}
