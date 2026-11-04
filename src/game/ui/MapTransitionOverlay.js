/**
 * MapTransitionOverlay (Hiệu ứng Dịch Chuyển Bản Đồ Cầu Vồng 8 Bước)
 * Quản lý chuỗi hoạt ảnh chuyển cảnh 8 bước hoành tráng, nhiều màu sắc:
 * - Bước 1: Kích hoạt Cổng Thần Cầu Vồng
 * - Bước 2: Bé Sâu tiến vào tâm vòng xoáy
 * - Bước 3: Vòng hào quang 7 sắc bùng nở
 * - Bước 4: Cơn mưa bụi sao ma thuật
 * - Bước 5: Mở đường hầm không gian Cầu Vồng
 * - Bước 6: Dịch chuyển lượng tử sang Vùng Đất Mới
 * - Bước 7: Hạ cánh an toàn tại miền đất mới
 * - Bước 8: Khúc khải hoàn & Lời chào rực rỡ
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

    this.initDOM();
  }

  initDOM() {
    if (typeof document === 'undefined') return;

    let el = document.getElementById('warp-overlay-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'warp-overlay-container';
      el.className = 'warp-overlay-container';
      el.innerHTML = `
        <div class="warp-tunnel-effect" id="warp-tunnel-effect"></div>
        <div class="warp-flash-burst" id="warp-flash-burst"></div>
        <div class="warp-hud-banner" id="warp-hud-banner">
          <div class="warp-hud-badge-row">
            <span class="warp-hud-step-badge" id="warp-hud-step-badge">BƯỚC 1/8</span>
            <div class="warp-hud-dots" id="warp-hud-dots">
              <span class="warp-dot active" data-step="1"></span>
              <span class="warp-dot" data-step="2"></span>
              <span class="warp-dot" data-step="3"></span>
              <span class="warp-dot" data-step="4"></span>
              <span class="warp-dot" data-step="5"></span>
              <span class="warp-dot" data-step="6"></span>
              <span class="warp-dot" data-step="7"></span>
              <span class="warp-dot" data-step="8"></span>
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

  execute8StepWarp({ targetMapId = 'map2', targetMapName = 'Vịnh Biển Pha Lê', onComplete } = {}) {
    if (!this.container) this.initDOM();

    this.container.classList.add('active');
    this.banner.classList.add('active');
    this.updateDots(1);

    const steps = [
      {
        step: 1,
        time: 0,
        badge: '⚡ BƯỚC 1/8',
        text: '🌀 Kích hoạt Cổng Thần Cầu Vồng ma thuật!',
        action: () => {
          this.audioService?.playPortalStep(1);
          this.spawnShockwave();
          if (this.hudController) this.hudController.setStatus('🌀 Cổng Dịch Chuyển đã kích hoạt!');
        }
      },
      {
        step: 2,
        time: 480,
        badge: '🌟 BƯỚC 2/8',
        text: '✨ Bé Sâu nhẹ nhàng bước vào tâm vòng xoáy!',
        action: () => {
          this.audioService?.playPortalStep(2);
          this.spawnShockwave();
          this.spawnStardust(12);
        }
      },
      {
        step: 3,
        time: 980,
        badge: '💫 BƯỚC 3/8',
        text: '🌈 Vòng hào quang 7 sắc bùng nở rực rỡ!',
        action: () => {
          this.audioService?.playPortalStep(3);
          this.spawnShockwave();
          this.spawnShockwave();
          this.spawnStardust(16);
        }
      },
      {
        step: 4,
        time: 1480,
        badge: '🌠 BƯỚC 4/8',
        text: '⭐ Cơn mưa bụi sao ma thuật xoay tròn!',
        action: () => {
          this.audioService?.playPortalStep(4);
          this.spawnStardust(36);
        }
      },
      {
        step: 5,
        time: 1980,
        badge: '🚀 BƯỚC 5/8',
        text: '🌌 Mở đường hầm không gian Cầu Vồng siêu tốc!',
        action: () => {
          this.audioService?.playPortalStep(5);
          if (this.tunnelEl) {
            this.tunnelEl.classList.add('spinning');
          }
          this.spawnStardust(24);
        }
      },
      {
        step: 6,
        time: 2500,
        badge: '🏝️ BƯỚC 6/8',
        text: `🗺️ Dịch chuyển không gian sang ${targetMapName}!`,
        action: () => {
          this.audioService?.playPortalStep(6);
          // Chớp sáng lượng tử & Chuyển scene bản đồ
          if (this.flashEl) {
            this.flashEl.classList.add('flash');
          }
          if (typeof this.onExecuteMapSwitch === 'function') {
            this.onExecuteMapSwitch(targetMapId);
          }
        }
      },
      {
        step: 7,
        time: 3000,
        badge: '✨ BƯỚC 7/8',
        text: `🌱 Hạ cánh an toàn tại ${targetMapName}!`,
        action: () => {
          this.audioService?.playPortalStep(7);
          if (this.flashEl) {
            this.flashEl.classList.remove('flash');
          }
          if (this.tunnelEl) {
            this.tunnelEl.classList.remove('spinning');
          }
          this.spawnStardust(18);
        }
      },
      {
        step: 8,
        time: 3500,
        badge: '🌈 BƯỚC 8/8',
        text: `🎉 Chào mừng bé đến với ${targetMapName}! 🌈⭐`,
        action: () => {
          this.audioService?.playPortalStep(8);
          if (this.audioService) {
            this.audioService.speak(`Chào mừng bé đến với ${targetMapName}!`);
          }
          if (this.hudController) {
            this.hudController.setStatus(`Chào mừng bé đến với ${targetMapName}! 🌈🎉`);
            this.hudController.updatePlayerHud();
          }
          this.spawnStardust(40);
        }
      }
    ];

    steps.forEach(({ step, time, badge, text, action }) => {
      setTimeout(() => {
        if (this.badgeEl) this.badgeEl.textContent = badge;
        if (this.textEl) this.textEl.textContent = text;
        this.updateDots(step);
        action();
      }, time);
    });

    // Kết thúc chuỗi sau 4.6s và phục hồi điều khiển
    setTimeout(() => {
      if (this.banner) this.banner.classList.remove('active');
      if (this.container) this.container.classList.remove('active');
      if (typeof onComplete === 'function') {
        onComplete();
      }
      window.dispatchEvent(new CustomEvent('game:portal-warp-complete', {
        detail: { targetMapId, targetMapName }
      }));
    }, 4600);
  }

  spawnShockwave() {
    if (!this.container) return;
    const wave = document.createElement('div');
    wave.className = 'warp-shockwave';
    wave.style.left = '50%';
    wave.style.top = '50%';
    wave.style.transform = 'translate(-50%, -50%)';
    this.container.appendChild(wave);
    setTimeout(() => wave.remove(), 800);
  }

  spawnStardust(count = 20) {
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
      const distance = 120 + Math.random() * 380;
      const dx = `${Math.cos(angle) * distance}px`;
      const dy = `${Math.sin(angle) * distance}px`;

      p.style.setProperty('--dx', dx);
      p.style.setProperty('--dy', dy);

      this.container.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }
}
