import { createFrame, clearFrame, createFx, composite } from './pixelfx/core/index.js';
import * as fireworkRocketMod from './pixelfx/fx/firework-rocket.js';

/**
 * Bảng màu rực rỡ lễ hội cho từng quả pháo hoa tên lửa
 */
const FIREWORK_PALETTES = [
  // 1. Hoàng Kim Lấp Lánh (Gold & White Diamond)
  {
    palette: ['#2a1406', '#6a3a0c', '#b8701a', '#f0a830', '#ffd860', '#fff2b0', '#ffffff'],
    tips: ['#0c2a3a', '#1a5a78', '#36a2c8', '#7cd8f0', '#c8f4ff', '#ffffff'],
    name: 'Gold Star'
  },
  // 2. Cầu Vồng Lục Bảo (Ruby Crimson & Emerald Tips)
  {
    palette: ['#3a0c1a', '#781a36', '#c8365a', '#f07ca2', '#ffc8d8', '#ffffff'],
    tips: ['#062a14', '#0c6a3a', '#1ab870', '#30f0a8', '#60ffd8', '#ffffff'],
    name: 'Ruby Emerald'
  },
  // 3. Ma Thuật Tím & Vàng Ánh Kim (Amethyst & Golden Sparkles)
  {
    palette: ['#240c3a', '#521a78', '#8c36c8', '#bc7cf0', '#e4c8ff', '#ffffff'],
    tips: ['#3a2806', '#78580c', '#c8941a', '#f0bc30', '#ffe260', '#ffffff'],
    name: 'Amethyst Gold'
  },
  // 4. Lam Ngọc & Sao Băng Hồng (Sapphire & Starlight Pink)
  {
    palette: ['#0c1a3a', '#1a3678', '#3668c8', '#7caaf0', '#c8dfff', '#ffffff'],
    tips: ['#3a0c2a', '#781a5a', '#c836a2', '#f07cd8', '#ffc8f4', '#ffffff'],
    name: 'Sapphire Starlight'
  }
];

export class FireworkCelebrationEffect {
  constructor(options = {}) {
    this.width = options.width || 640;
    this.height = options.height || 360;
    this.audioService = options.audioService || null;
    this.canvas = null;
    this.ctx = null;
    this.frame = null;
    this.imageData = null;
    this.activeRockets = [];
    this.animId = null;
    this.lastTime = 0;
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

      // Gắn vào khung .scene-stage hoặc #game-root
      const targetContainer = document.querySelector('.scene-stage') || document.getElementById('game-root') || document.body;
      targetContainer.appendChild(canvas);
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.frame = createFrame(this.width, this.height, 0, 0);
    this.imageData = this.ctx ? this.ctx.createImageData(this.width, this.height) : null;
  }

  /**
   * Bắn chuỗi pháo hoa tên lửa ăn mừng chiến thắng Boss
   * @param {Object} [params]
   * @param {number} [params.bossX] - Tọa độ X của Boss trên map (0-1280)
   * @param {number} [params.bossY] - Tọa độ Y của Boss trên map (0-720)
   * @param {number} [params.count] - Số lượng quả pháo hoa bắn lên (mặc định 4)
   * @param {Object} [params.audioService]
   */
  launchSequence(params = {}) {
    if (!this.canvas || !this.ctx) {
      this.initCanvas();
    }
    if (!this.canvas) return;

    const audio = params.audioService || this.audioService || (typeof window !== 'undefined' ? window.__audioService : null);
    const originX = params.bossX !== undefined ? (params.bossX / 2) : 320;
    const count = params.count || 4;

    this.canvas.style.display = 'block';
    this.activeRockets = [];

    // Cấu hình các quả pháo hoa bắn lên so le
    // Trong firework-rocket: rocket bay lên cao ~192px từ y, sau đó nổ bung Fronds
    const rocketConfigs = [
      { delay: 0.0,  x: originX,        y: 335, palIdx: 0, scale: 1.0 },
      { delay: 0.38, x: originX - 85,   y: 345, palIdx: 1, scale: 0.95 },
      { delay: 0.78, x: originX + 90,   y: 340, palIdx: 2, scale: 1.05 },
      { delay: 1.22, x: originX - 35,   y: 330, palIdx: 3, scale: 1.0 }
    ].slice(0, count);

    rocketConfigs.forEach((cfg, idx) => {
      const pal = FIREWORK_PALETTES[cfg.palIdx % FIREWORK_PALETTES.length];
      const fx = createFx(fireworkRocketMod, {
        x: Math.max(80, Math.min(this.width - 80, cfg.x)),
        y: cfg.y,
        seed: 12 + idx * 17,
        palette: pal.palette,
        tips: pal.tips,
        light: 1.15
      });

      this.activeRockets.push({
        fx,
        delay: cfg.delay,
        started: false,
        hasBurstSound: false,
        name: pal.name
      });
    });

    if (audio) {
      audio.playGrandFanfare?.();
    }

    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }

    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animId = requestAnimationFrame(this.loop);
  }

  /**
   * Vòng lặp vẽ pháo hoa PixelFX ở 60 FPS
   */
  loop(now) {
    if (!this.isRunning) return;

    const dt = Math.min((now - this.lastTime) / 1000, 0.05); // Giới hạn tối đa 50ms chống giật
    this.lastTime = now;

    let allDone = true;
    clearFrame(this.frame);

    const audio = this.audioService || (typeof window !== 'undefined' ? window.__audioService : null);

    for (const rocket of this.activeRockets) {
      if (rocket.delay > 0) {
        rocket.delay -= dt;
        allDone = false;
        continue;
      }

      if (!rocket.started) {
        rocket.started = true;
        // Âm thanh vút bay của tên lửa pháo hoa
        if (audio) {
          audio.playTone?.(560 + Math.random() * 120, 0.12, 'sine');
        }
      }

      if (!rocket.fx.done()) {
        allDone = false;
        rocket.fx.update(dt);
        rocket.fx.draw(this.frame);

        // Kích hoạt âm thanh nổ bung lấp lánh khi pháo nổ (tại thời điểm t >= 1.05s)
        if (!rocket.hasBurstSound && rocket.fx.t >= 1.05) {
          rocket.hasBurstSound = true;
          if (audio) {
            audio.playSuccess?.();
            audio.playTone?.(920, 0.22, 'triangle');
          }
          if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            try { navigator.vibrate([40, 25, 60]); } catch {}
          }
        }
      }
    }

    // Kết xuất pixel frame vào ImageData và đưa lên Canvas
    if (this.ctx && this.imageData) {
      composite(this.frame, this.imageData.data);
      this.ctx.putImageData(this.imageData, 0, 0);
    }

    if (allDone) {
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
  }

  destroy() {
    this.stop();
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
  }
}
