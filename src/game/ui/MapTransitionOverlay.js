import { PIXELFX_SHEETS, preloadSheetImage, drawPixelFxFrame } from '../effects/pixelfxRegistry.js';

/**
 * MapTransitionOverlay (Hiệu ứng Chuyển Cảnh PixelFX Thuần Túy)
 * Bỏ hoàn toàn pop-up loading — chỉ chạy hiệu ứng Star Iris từ bộ pixelfx-repo
 * đóng màn -> chuyển map bên dưới -> mở màn mượt mà trong ~0.9s.
 */
export class MapTransitionOverlay {
  constructor(options = {}) {
    this.audioService = options.audioService;
    this.hudController = options.hudController;
    this.onExecuteMapSwitch = options.onExecuteMapSwitch;

    this.container = null;
    this.fxCanvas = null;

    this._timers = new Set();
    this._fxRafId = null;
    this._irisSheetImg = null;
    this._irisSheetPromise = null;
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

  ensureIrisSheet() {
    if (this._irisSheetImg) return Promise.resolve(this._irisSheetImg);
    if (!this._irisSheetPromise) {
      this._irisSheetPromise = preloadSheetImage('vfx_star_iris')
        .then((img) => {
          this._irisSheetImg = img;
          return img;
        })
        .catch(() => null);
    }
    return this._irisSheetPromise;
  }

  initDOM() {
    if (typeof document === 'undefined') return;

    this.ensureIrisSheet();

    // Ẩn triệt để pop-up loading chuyển map cũ nếu còn trong DOM
    const legacyLoading = document.getElementById('map-loading-overlay');
    if (legacyLoading) {
      legacyLoading.classList.remove('active');
      legacyLoading.setAttribute('hidden', 'true');
      legacyLoading.style.display = 'none';
    }

    let el = document.getElementById('warp-overlay-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'warp-overlay-container';
      el.className = 'warp-overlay-container';
      el.innerHTML = `
        <canvas class="warp-pixelfx-canvas" id="warp-pixelfx-canvas" width="320" height="180" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;image-rendering:pixelated;z-index:2;opacity:1;"></canvas>
      `;
      document.body.appendChild(el);
    }

    this.container = el;
    this.fxCanvas = document.getElementById('warp-pixelfx-canvas');
  }

  drawIrisFrame(frameIdx) {
    if (!this.fxCanvas) return;
    const ctx = this.fxCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
    if (this._irisSheetImg) {
      ctx.imageSmoothingEnabled = false;
      drawPixelFxFrame(
        ctx,
        'vfx_star_iris',
        this._irisSheetImg,
        frameIdx,
        0,
        0,
        this.fxCanvas.width,
        this.fxCanvas.height
      );
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
    }
  }

  playStarIrisRange(fromFrame, toFrame, durationMs, { keepLastFrame = false, onDone = null } = {}) {
    if (!this.fxCanvas) {
      if (typeof onDone === 'function') onDone();
      return;
    }

    if (this._fxRafId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this._fxRafId);
      this._fxRafId = null;
    }

    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const tick = (now) => {
      const elapsed = (typeof now === 'number' ? now : Date.now()) - startTime;
      const progress = Math.min(1, Math.max(0, elapsed / Math.max(16, durationMs)));
      const frame = Math.round(fromFrame + (toFrame - fromFrame) * progress);
      this.drawIrisFrame(frame);

      if (progress < 1) {
        this._fxRafId = requestAnimationFrame(tick);
      } else {
        this._fxRafId = null;
        if (!keepLastFrame) {
          const ctx = this.fxCanvas.getContext('2d');
          ctx?.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
        }
        if (typeof onDone === 'function') onDone();
      }
    };
    this._fxRafId = requestAnimationFrame(tick);
  }

  playStarIrisFx(reverse = false, durationMs = 380) {
    const meta = PIXELFX_SHEETS.vfx_star_iris;
    const maxFrame = (meta?.frames || 41) - 1;
    if (reverse) {
      this.playStarIrisRange(21, maxFrame, durationMs);
    } else {
      this.playStarIrisRange(0, 19, durationMs, { keepLastFrame: true });
    }
  }

  executeUnifiedTransition({ targetMapId = 'map2', targetMapName = 'Vùng Đất Mới', onExecuteSwitch, onComplete } = {}) {
    if (!this.container) this.initDOM();
    this.clearPending();
    this.isTransitioning = true;

    this.container?.classList.add('active');
    this.audioService?.playPortalStep?.(2);
    if (this.hudController) {
      this.hudController.setStatus(`✨ Đang chuyển tới ${targetMapName}...`);
    }

    let finished = false;
    const finishTransition = () => {
      if (finished) return;
      finished = true;
      this.clearPending();
      this.audioService?.playPortalStep?.(8);
      if (this.hudController) {
        this.hudController.setStatus(`Chào mừng bé đến với ${targetMapName}! 🌈🎉`);
        this.hudController.updatePlayerHud?.();
      }

      const completeCleanup = () => {
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
      };

      const maxFrame = (PIXELFX_SHEETS.vfx_star_iris?.frames || 41) - 1;
      this.playStarIrisRange(21, maxFrame, 420, {
        keepLastFrame: false,
        onDone: completeCleanup
      });
    };

    const startTransition = () => {
      // Pha 1: Star Iris xoay đóng lại kín màn hình (~380ms), giữ frame 19 đóng đen khi switch map
      this.playStarIrisRange(0, 19, 380, {
        keepLastFrame: true,
        onDone: () => {
          if (finished) return;
          this.audioService?.playPortalStep?.(6);
          if (typeof onExecuteSwitch === 'function') {
            onExecuteSwitch(finishTransition);
          } else {
            if (typeof this.onExecuteMapSwitch === 'function') {
              this.onExecuteMapSwitch(targetMapId);
            }
            this.schedule(finishTransition, 320);
          }
        }
      });
    };

    if (this._irisSheetImg) {
      startTransition();
    } else {
      this.ensureIrisSheet().then(() => {
        if (!finished) startTransition();
      });
    }

    // Watchdog 3.2s đảm bảo overlay không bao giờ kẹt
    this.schedule(finishTransition, 3200);
  }

  execute8StepWarp({ targetMapId = 'map2', targetMapName = 'Vùng Đất Mới', onComplete } = {}) {
    this.executeUnifiedTransition({
      targetMapId,
      targetMapName,
      onComplete
    });
  }
}
