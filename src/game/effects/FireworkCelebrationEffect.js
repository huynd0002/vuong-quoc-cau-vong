import { PIXELFX_SHEETS, preloadSheetImage, drawPixelFxFrame } from './pixelfxRegistry.js';

const FIREWORK_TINTS = ['#ffd860', '#ff6ec7', '#7dd3fc', '#a78bfa'];

export class FireworkCelebrationEffect {
  constructor(options = {}) {
    this.width = options.width || 640;
    this.height = options.height || 360;
    this.audioService = options.audioService || null;
    this.canvas = null;
    this.ctx = null;
    this.activeRockets = [];
    this.confettiBursts = [];
    this.questBadges = [];
    this.sheetImages = {};
    this.animId = null;
    this.lastTime = 0;
    this.elapsedMs = 0;
    this.lastRenderTime = 0;
    this.isRunning = false;

    this.initCanvas();
  }

  /**
   * Khởi tạo hoặc tái sử dụng canvas overlay trên giao diện game
   */
  initCanvas() {
    if (typeof document === 'undefined') return;

    let canvas = document.getElementById('firework-celebration-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'firework-celebration-canvas';
      canvas.className = 'firework-celebration-canvas';
      canvas.width = this.width;
      canvas.height = this.height;

      const targetContainer = document.querySelector('.scene-stage') || document.getElementById('game-root') || document.body;
      targetContainer.appendChild(canvas);
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.preloadSheets();
  }

  preloadSheets() {
    for (const key of ['vfx_firework_burst', 'vfx_confetti', 'vfx_quest_complete']) {
      preloadSheetImage(key).then((img) => {
        if (img) this.sheetImages[key] = img;
      });
    }
  }

  /**
   * Bắn chuỗi pháo hoa tên lửa bằng PixelFX spritesheet (GPU/Canvas2D blit nhẹ, không giật FPS)
   */
  launchSequence(params = {}) {
    if (!this.canvas || !this.ctx) {
      this.initCanvas();
    }
    if (!this.canvas) return;

    this.preloadSheets();

    const audio = params.audioService || this.audioService || (typeof window !== 'undefined' ? window.__audioService : null);
    const originX = params.bossX !== undefined ? (params.bossX / 2) : 320;
    const count = Math.max(1, Math.min(6, params.count || 4));

    this.canvas.style.display = 'block';
    this.activeRockets = [];
    this.confettiBursts = [];
    this.questBadges = [];

    const rocketConfigs = [
      { delay: 0.0,  x: originX,        targetY: 118, size: 220, colorIdx: 0 },
      { delay: 0.35, x: originX - 95,   targetY: 105, size: 200, colorIdx: 1 },
      { delay: 0.72, x: originX + 98,   targetY: 112, size: 215, colorIdx: 2 },
      { delay: 1.15, x: originX - 30,   targetY: 95,  size: 230, colorIdx: 3 },
      { delay: 1.50, x: originX + 45,   targetY: 130, size: 205, colorIdx: 0 }
    ].slice(0, count);

    rocketConfigs.forEach((cfg) => {
      this.activeRockets.push({
        x: Math.max(85, Math.min(this.width - 85, cfg.x)),
        startY: this.height - 15,
        targetY: cfg.targetY,
        size: cfg.size,
        color: FIREWORK_TINTS[cfg.colorIdx % FIREWORK_TINTS.length],
        delay: cfg.delay,
        flightDur: 0.55,
        flightElapsed: 0,
        started: false,
        exploded: false,
        burstElapsed: 0
      });
    });

    // Bổ sung pháo giấy ăn mừng PixelFX (ui/confetti) ở 2 bên + giữa
    this.confettiBursts.push(
      { delay: 0.45, x: 180, y: 150, size: 210, elapsed: 0 },
      { delay: 0.85, x: 460, y: 145, size: 210, elapsed: 0 }
    );

    if (params.showQuestBanner !== false) {
      this.questBadges.push({ delay: 0.55, x: 320, y: 95, width: 250, height: 112, elapsed: 0 });
    }

    if (audio) {
      audio.playGrandFanfare?.();
    }

    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }

    this.isRunning = true;
    this.elapsedMs = 0;
    this.lastTime = performance.now();
    this.lastRenderTime = 0;
    this.loop = this.loop.bind(this);
    this.animId = requestAnimationFrame(this.loop);
  }

  /**
   * Vòng lặp vẽ tối ưu (~33 FPS blit spritesheet, tính dt thực tế chuẩn cho cả màn 60Hz/120Hz)
   */
  loop(now) {
    if (!this.isRunning) return;

    // Giới hạn vẽ tối đa ~33fps (mỗi 30ms) để nhường băng thông cho Phaser WorldScene
    if (this.lastRenderTime && now - this.lastRenderTime < 28) {
      this.animId = requestAnimationFrame(this.loop);
      return;
    }

    const prevTime = this.lastRenderTime || this.lastTime || now;
    const dt = Math.max(0.016, Math.min((now - prevTime) / 1000, 0.08));
    this.lastRenderTime = now;
    this.lastTime = now;
    this.elapsedMs += dt * 1000;

    if (!this.ctx) {
      this.stop();
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    let allDone = true;
    const audio = this.audioService || (typeof window !== 'undefined' ? window.__audioService : null);
    const fwSpec = PIXELFX_SHEETS.vfx_firework_burst;
    const fwImg = this.sheetImages.vfx_firework_burst;
    const fwTotalDur = fwSpec ? fwSpec.frames / fwSpec.fps : 2.2;

    for (const rocket of this.activeRockets) {
      if (rocket.delay > 0) {
        rocket.delay -= dt;
        allDone = false;
        continue;
      }

      if (!rocket.started) {
        rocket.started = true;
        audio?.playTone?.(560 + Math.random() * 120, 0.12, 'sine');
      }

      if (!rocket.exploded) {
        allDone = false;
        rocket.flightElapsed += dt;
        const progress = Math.min(1, rocket.flightElapsed / rocket.flightDur);
        const curY = rocket.startY - (rocket.startY - rocket.targetY) * (1 - Math.pow(1 - progress, 2));

        // Vẽ đuôi tên lửa nhỏ gọn (chỉ vài hình vuông pixel, không allocate)
        this.ctx.fillStyle = rocket.color;
        this.ctx.fillRect(Math.round(rocket.x - 2), Math.round(curY - 4), 5, 10);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(Math.round(rocket.x - 1), Math.round(curY + 6), 3, 6);

        if (progress >= 1) {
          rocket.exploded = true;
          audio?.playSuccess?.();
          audio?.playTone?.(920, 0.2, 'triangle');
          if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            try { navigator.vibrate([35, 20, 55]); } catch {}
          }
        }
      } else if (rocket.burstElapsed < fwTotalDur) {
        allDone = false;
        const frameIdx = Math.floor(rocket.burstElapsed * (fwSpec?.fps || 14));
        if (fwImg && fwSpec) {
          const drawSize = rocket.size;
          drawPixelFxFrame(
            this.ctx,
            'vfx_firework_burst',
            fwImg,
            frameIdx,
            Math.round(rocket.x - drawSize / 2),
            Math.round(rocket.targetY - drawSize / 2),
            drawSize,
            drawSize
          );
        } else {
          // Fallback pixel sparks trong lúc ảnh chưa giải mã xong
          const p = rocket.burstElapsed / 1.4;
          const rad = 12 + p * 70;
          this.ctx.fillStyle = rocket.color;
          for (let a = 0; a < 10; a++) {
            const ang = (a / 10) * Math.PI * 2;
            this.ctx.fillRect(
              Math.round(rocket.x + Math.cos(ang) * rad),
              Math.round(rocket.targetY + Math.sin(ang) * rad),
              4,
              4
            );
          }
        }
        rocket.burstElapsed += dt;
      }
    }

    // Vẽ pháo giấy PixelFX ui/confetti
    const cfSpec = PIXELFX_SHEETS.vfx_confetti;
    const cfImg = this.sheetImages.vfx_confetti;
    const cfDur = cfSpec ? cfSpec.frames / cfSpec.fps : 2.0;
    for (const burst of this.confettiBursts) {
      if (burst.delay > 0) {
        burst.delay -= dt;
        allDone = false;
        continue;
      }
      if (burst.elapsed < cfDur) {
        allDone = false;
        if (cfImg && cfSpec) {
          const frameIdx = Math.floor(burst.elapsed * cfSpec.fps);
          const dh = Math.round(burst.size * (cfSpec.frameHeight / cfSpec.frameWidth));
          drawPixelFxFrame(
            this.ctx,
            'vfx_confetti',
            cfImg,
            frameIdx,
            Math.round(burst.x - burst.size / 2),
            Math.round(burst.y - dh / 2),
            burst.size,
            dh
          );
        }
        burst.elapsed += dt;
      }
    }

    // Vẽ huy hiệu Quest Complete PixelFX ở trên
    const qcSpec = PIXELFX_SHEETS.vfx_quest_complete;
    const qcImg = this.sheetImages.vfx_quest_complete;
    const qcDur = qcSpec ? qcSpec.frames / qcSpec.fps : 2.4;
    for (const badge of this.questBadges) {
      if (badge.delay > 0) {
        badge.delay -= dt;
        allDone = false;
        continue;
      }
      if (badge.elapsed < qcDur) {
        allDone = false;
        if (qcImg && qcSpec) {
          const frameIdx = Math.floor(badge.elapsed * qcSpec.fps);
          drawPixelFxFrame(
            this.ctx,
            'vfx_quest_complete',
            qcImg,
            frameIdx,
            Math.round(badge.x - badge.width / 2),
            Math.round(badge.y - badge.height / 2),
            badge.width,
            badge.height
          );
        }
        badge.elapsed += dt;
      }
    }

    if (allDone || this.elapsedMs > 4800) {
      this.stop();
    } else {
      this.animId = requestAnimationFrame(this.loop);
    }
  }

  /**
   * Dừng và ẩn canvas pháo hoa
   */
  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.canvas.style.display = 'none';
    }
    this.activeRockets = [];
    this.confettiBursts = [];
    this.questBadges = [];
  }

  destroy() {
    this.stop();
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
  }
}
