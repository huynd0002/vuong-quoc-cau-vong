/**
 * GameLoadingScreen
 * Màn hình Loading Khởi Đầu (Preloader / Splash Screen) trước khi vào game.
 * - Thiết kế phong cách Cầu Vồng mầm non rực rỡ, ấm áp, ngộ nghĩnh
 * - Linh vật Bé Sâu & Bé Cún nhún nhảy đón chào bé
 * - Thanh tiến trình Rainbow Candy 3D chạy từ 0% đến 100%
 * - Lời dẫn động viên ngọt ngào kích thích trí tò mò
 * - Chuyển tiếp mượt mà sang Màn hình Chọn Nhân Vật Khởi Đầu
 */

import sauActionUrl from '../../../assets/hero/sau/sau_action.webp?url';
import petDogUrl from '../../../assets/pets/dog/dog_idle.png?url';
import bannerRibbonUrl from '../../../assets/ui/custom_kids_ui/banner_ribbon_gold.png?url';
import iconStarUrl from '../../../assets/ui/custom_kids_ui/icon_star_3d.png?url';

export class GameLoadingScreen {
  constructor(options = {}) {
    this.audioService = options.audioService;
    this.onComplete = options.onComplete;

    this.container = null;
    this.barFill = null;
    this.percentBadge = null;
    this.statusText = null;

    this.currentProgress = 10;
    this.targetProgress = 10;
    this.isDone = false;
    this.worldReady = false;
    this.animInterval = null;
    this.tipInterval = null;
    this.heartbeatInterval = null;
    this.safetyWatchdogTimeout = null;

    this.tips = [
      '🌱 Đang gieo mầm hoa thơm trong khu vườn cổ tích...',
      '🌈 Đang pha màu rực rỡ cho chiếc Cầu Vồng diệu kỳ...',
      '⭐ Đang thắp sáng những viên pha lê toán học thông minh...',
      '🐶 Bé Sâu và Bé Cún đang chuẩn bị đồ chơi cho bé...',
      '🍎 Táo chín ngọt ngào và những người bạn nhỏ đang đợi bé!',
      '✨ Thế giới phép thuật sắp sẵn sàng chào đón bé yêu!'
    ];
    this.tipIndex = 0;

    this.initDOM();
    this.startLoop();
  }

  initDOM() {
    let el = document.getElementById('initial-loading-screen');
    if (!el) {
      el = document.createElement('div');
      el.id = 'initial-loading-screen';
      el.className = 'initial-loading-screen';
      document.body.prepend(el);
    }
    this.container = el;

    this.container.innerHTML = `
      <div class="ils-sky-backdrop"></div>
      <div class="ils-sun-glow" aria-hidden="true"></div>
      <div class="ils-floating-clouds" aria-hidden="true">
        <div class="ils-cloud c1">☁️</div>
        <div class="ils-cloud c2">☁️</div>
        <div class="ils-cloud c3">☁️</div>
      </div>

      <div class="ils-card">
        <!-- Banner Tiêu Đề Vương Quốc Cầu Vồng -->
        <div class="ils-title-wrap">
          <div class="ils-rainbow-ribbon">
            <img src="${bannerRibbonUrl}" class="ils-ribbon-bg" alt="" />
            <div class="ils-title-text-group">
              <span class="ils-star-icon"><img src="${iconStarUrl}" alt="⭐" /></span>
              <h1 class="ils-game-title">VƯƠNG QUỐC CẦU VỒNG</h1>
              <span class="ils-star-icon"><img src="${iconStarUrl}" alt="⭐" /></span>
            </div>
          </div>
          <p class="ils-subtitle">🌈 Phiêu Lưu Học Tập Diệu Kỳ Dành Cho Bé 5-6 Tuổi 🌈</p>
        </div>

        <!-- Sân khấu Linh vật: Bé Sâu & Bé Cún -->
        <div class="ils-mascot-stage">
          <div class="ils-mascot-aura"></div>
          <img class="ils-mascot-hero" src="${sauActionUrl}" alt="Bé Sâu" />
          <img class="ils-mascot-pet" src="${petDogUrl}" alt="Bé Cún" />
          <div class="ils-sparkles" aria-hidden="true">
            <span class="ils-spk s1">✨</span>
            <span class="ils-spk s2">🌸</span>
            <span class="ils-spk s3">⭐</span>
            <span class="ils-spk s4">💖</span>
          </div>
        </div>

        <!-- Lời động viên, trạng thái tải -->
        <p id="ils-status-text" class="ils-status-text">
          🌱 Đang gieo mầm hoa thơm trong khu vườn cổ tích...
        </p>

        <!-- Thanh Tiến Trình Kẹo Cầu Vồng 3D -->
        <div class="ils-progress-container">
          <div class="ils-bar-track">
            <div id="ils-bar-fill" class="ils-bar-fill" style="width: 10%">
              <span class="ils-bar-runner">🌟</span>
            </div>
          </div>
          <div id="ils-percent-badge" class="ils-percent-badge">10%</div>
        </div>

        <!-- Chân trang khích lệ -->
        <div class="ils-footer-note">
          <span>💖 Bé yêu hãy chuẩn bị tinh thần để cùng khám phá thế giới nhé!</span>
        </div>
      </div>
    `;

    this.barFill = this.container.querySelector('#ils-bar-fill');
    this.percentBadge = this.container.querySelector('#ils-percent-badge');
    this.statusText = this.container.querySelector('#ils-status-text');

    // Lắng nghe sự kiện tiến trình từ Phaser PreloadScene
    this.onLoadProgress = (e) => {
      const p = e.detail?.percent ?? 10;
      this.setProgress(p);
    };
    this.onLoadComplete = () => {
      this.setProgress(99);
      setTimeout(() => {
        if (!this.isDone) {
          this.ensureWorldReadyAndFinish();
        }
      }, 600);
    };

    this.onMapReady = () => {
      this.worldReady = true;
      this.finish();
    };
    window.addEventListener('game:load-progress', this.onLoadProgress);
    window.addEventListener('game:load-complete', this.onLoadComplete);
    window.addEventListener('game:map-ready', this.onMapReady);
  }

  startLoop() {
    // 1. Vòng lặp nội suy mượt mà & siêu tốc cho thanh tiến trình (Smooth Fast Ease-Out)
    this.animInterval = setInterval(() => {
      if (this.currentProgress < this.targetProgress) {
        const factor = this.targetProgress >= 100 ? 0.35 : 0.25;
        const minStep = this.targetProgress >= 100 ? 4 : 2;
        const step = Math.max(minStep, (this.targetProgress - this.currentProgress) * factor);
        this.currentProgress = Math.min(this.targetProgress, this.currentProgress + step);
        this.updateBarUI(Math.round(this.currentProgress));
      }

      if (this.currentProgress >= 100 && this.targetProgress >= 100 && !this.isDone) {
        this.isDone = true;
        this.handleComplete();
      }
    }, 20);

    // 2. Chuyển đổi lời khuyên thân thiện mỗi 1.2 giây
    this.tipInterval = setInterval(() => {
      if (this.isDone) return;
      this.tipIndex = (this.tipIndex + 1) % this.tips.length;
      if (this.statusText) {
        this.statusText.style.opacity = '0';
        setTimeout(() => {
          if (this.statusText && !this.isDone) {
            this.statusText.textContent = this.tips[this.tipIndex];
            this.statusText.style.opacity = '1';
          }
        }, 150);
      }
    }, 1200);

    // 3. Heartbeat tiến trình thông minh: Nhẹ nhàng đẩy thanh loading từ 10% đến 88%
    // để bé không bao giờ bị cảm giác game đơ hay đứng im ở 10%
    this.heartbeatInterval = setInterval(() => {
      if (this.isDone) return;
      if (this.targetProgress < 88) {
        const nextVal = Math.min(88, this.targetProgress + Math.floor(Math.random() * 3) + 2);
        this.setProgress(nextVal);
      }
    }, 280);

    // 4. Watchdog an toàn: Sau 16 giây nếu chưa xong, tự động kích hoạt WorldScene và vào game
    this.safetyWatchdogTimeout = setTimeout(() => {
      if (!this.isDone) {
        console.warn('[GameLoadingScreen] Watchdog an toàn: Đảm bảo WorldScene khởi chạy và mở màn hình vào game!');
        this.ensureWorldReadyAndFinish();
      }
    }, 16000);
  }

  ensureWorldReadyAndFinish() {
    try {
      const game = typeof window !== 'undefined' ? window.__PHASER_GAME__ : null;
      const ws = typeof window !== 'undefined' ? (window.__worldScene || game?.scene?.getScene?.('WorldScene')) : null;
      if (game && (!ws || !ws.sys?.isActive?.())) {
        const rootEl = document.getElementById('game-root');
        if (rootEl && game.canvas && !rootEl.contains(game.canvas)) {
          rootEl.appendChild(game.canvas);
        }
        game.scene?.start?.('WorldScene', { mapId: 'map_pet_farm' });
      }
    } catch (err) {
      console.warn('[GameLoadingScreen] Lỗi kích hoạt WorldScene dự phòng:', err);
    }
    this.worldReady = true;
    this.targetProgress = 100;
    this.finish();
  }

  setProgress(percent) {
    if (this.isDone) return;
    this.targetProgress = Math.max(this.targetProgress, Math.min(this.worldReady ? 100 : 99, Number(percent) || 0));
  }

  updateBarUI(percent) {
    if (this.barFill) {
      this.barFill.style.width = `${percent}%`;
    }
    if (this.percentBadge) {
      this.percentBadge.textContent = `${percent}%`;
    }
  }

  finish() {
    this.worldReady = true;
    this.targetProgress = 100;
  }

  handleComplete() {
    clearInterval(this.animInterval);
    clearInterval(this.tipInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.safetyWatchdogTimeout) clearTimeout(this.safetyWatchdogTimeout);
    window.removeEventListener('game:load-progress', this.onLoadProgress);
    window.removeEventListener('game:load-complete', this.onLoadComplete);
    window.removeEventListener('game:map-ready', this.onMapReady);

    this.updateBarUI(100);

    if (this.statusText) {
      this.statusText.textContent = '✨ THẾ GIỚI ĐÃ SẴN SÀNG! CHỌN BẠN ĐỒNG HÀNH NÀO BÉ ƠI! ✨';
      this.statusText.style.color = '#15803d';
      this.statusText.style.fontWeight = '900';
    }

    if (this.audioService) {
      this.audioService.playChime(660, 0.12);
      setTimeout(() => this.audioService.playChime(880, 0.2), 120);
    }

    // Sau khoảnh khắc ăn mừng hoàn tất -> Mờ dần và chuyển tiếp sang màn hình chọn nhân vật
    setTimeout(() => {
      if (this.container) {
        this.container.classList.add('ils-fade-out');
      }
      setTimeout(() => {
        if (this.container) {
          this.container.style.display = 'none';
        }
        if (typeof this.onComplete === 'function') {
          this.onComplete();
        }
      }, 550);
    }, 400);
  }
}
