import sauIdleRightUrl from '../../../assets/hero/sau/sau_idle_right.webp?url';
import sauCelebrateUrl from '../../../assets/hero/sau/sau_celebrate.webp?url';
import heroUpgradeIdleRightUrl from '../../../assets/hero/sau_upgrade/hero_upgrade_idle_right.webp?url';
import heroUpgradeCelebrateUrl from '../../../assets/hero/sau_upgrade/hero_upgrade_celebrate.webp?url';
import iconStarUrl from '../../../assets/ui/custom_kids_ui/icon_star_3d.png?url';

/**
 * AuditionMinigameModal (Sân Khấu Vũ Điệu Audition Cầu Vồng)
 * Mini game âm nhạc sôi động dành cho bé 5-6 tuổi:
 * Bé canh viên bi nhịp điệu vào VÙNG ĐỎ và nhấn BẮT NHỊP (hoặc phím CÁCH)
 * Đạt đủ 5 nhịp hoàn hảo để biểu diễn thành công và nhận thưởng Sao may mắn!
 */
export class AuditionMinigameModal {
  constructor({ progressionSystem, saveAdapter, audioService, hudController } = {}) {
    this.progressionSystem = progressionSystem;
    this.saveAdapter = saveAdapter;
    this.audioService = audioService;
    this.hudController = hudController;

    this.isOpen = false;
    this.rhythmActive = false;
    this.rhythmScore = 0;
    this.rhythmTarget = 5;
    this.ballPos = 10;
    this.ballDir = 1;
    this.ballSpeed = 68; // % per second
    this.rhythmAnimId = null;
    this.lastTime = 0;
    this.isHitLocked = false;

    this.container = null;
    this.createDom();
  }

  createDom() {
    this.container = document.createElement('div');
    this.container.id = 'audition-minigame-modal';
    this.container.className = 'audition-standalone-modal modal-backdrop';
    this.container.style.display = 'none';
    this.container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.container);
  }

  getHeroAssets() {
    let isUpgrade = false;
    try {
      const state = this.saveAdapter ? this.saveAdapter.load() : null;
      if (state?.player?.activeSkin === 'sau_upgrade' || (state?.player?.level || 1) >= 4) {
        isUpgrade = true;
      }
    } catch {
      // fallback
    }

    return {
      idle: isUpgrade ? heroUpgradeIdleRightUrl : sauIdleRightUrl,
      celebrate: isUpgrade ? heroUpgradeCelebrateUrl : sauCelebrateUrl
    };
  }

  renderUI() {
    const heroAssets = this.getHeroAssets();

    this.container.innerHTML = `
      <div class="audition-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="audition-title">
        <button type="button" class="audition-btn-close" id="audition-btn-close" aria-label="Đóng vũ điệu audition">✕</button>

        <div class="audition-modal-header">
          <div class="audition-header-badge">
            <span class="audition-badge-icon">🎶</span>
            <span class="audition-badge-text" id="audition-title">SÂN KHẤU VŨ ĐIỆU CẦU VỒNG</span>
            <span class="audition-stars-pill"><img src="${iconStarUrl}" alt="⭐" class="audition-star-icon"> +2 ⭐ Thưởng</span>
          </div>
        </div>

        <div class="audition-stage-body">
          <!-- Sân khấu Chibi Khiêu Vũ -->
          <div class="audition-chibi-stage">
            <div class="audition-spotlight"></div>
            <div class="audition-music-notes">
              <span class="note n1">♪</span>
              <span class="note n2">♫</span>
              <span class="note n3">♬</span>
              <span class="note n4">♩</span>
            </div>
            <div class="audition-dancer-wrap" id="audition-dancer-box">
              <img src="${heroAssets.idle}" alt="Bé Sâu Khiêu Vũ" class="audition-dancer-img" id="audition-dancer-img">
            </div>
          </div>

          <!-- Bảng Điều Khiển Nhịp Điệu Audition -->
          <div class="audition-console modal-audition-console">
            <div class="audition-header-row">
              <div class="audition-title-box">
                <span class="audition-icon">🎵</span>
                <strong class="audition-title">Canh viên bi vào VÙNG ĐỎ rồi bấm phím CÁCH (hoặc chạm nút)!</strong>
              </div>
              <div class="audition-score-pill">
                <span class="audition-score-label">Nhịp điệu:</span>
                <strong class="audition-score-text" id="standalone-score-val">0/${this.rhythmTarget}</strong>
                <div class="audition-stars-meter" id="standalone-stars-meter">
                  ${Array.from({ length: this.rhythmTarget }).map(() => '<span class="audition-star"><i class="star-bead"></i></span>').join('')}
                </div>
              </div>
            </div>

            <div class="audition-rail-track" id="standalone-rail-track" aria-label="Thanh canh nhịp Audition">
              <div class="audition-red-target-zone" id="standalone-target-zone">
                <span class="zone-label">PERFECT</span>
              </div>
              <div class="audition-beat-marble" id="standalone-marble" style="left: ${this.ballPos}%"></div>
            </div>

            <div class="audition-trigger-row">
              <button type="button" class="btn-audition-trigger btn-standalone-trigger animate-btn-pulse" id="standalone-trigger-btn">
                🎶 BẮT NHỊP (SPACE) ⚡
              </button>
              <span class="audition-feedback-badge" id="standalone-feedback-badge">Canh bi vào vùng đỏ phát sáng nhé!</span>
            </div>
          </div>

          <!-- Màn Chúc Mừng Chiến Thắng (Ẩn mặc định) -->
          <div class="audition-victory-overlay" id="standalone-victory-overlay" style="display: none;">
            <div class="victory-card">
              <div class="victory-icon">🎉</div>
              <h3 class="victory-title">XUẤT SẮC! BÉ LÀ VŨ CÔNG TÀI BA! 🌈✨</h3>
              <p class="victory-desc">Bé đã hoàn thành trọn vẹn 5 nhịp điệu hoàn hảo và nhận ngay <b>+2 Sao May Mắn</b>!</p>
              <div class="victory-actions">
                <button type="button" class="btn-audition-replay" id="btn-standalone-replay">🎲 Nhảy Điệu Nhạc Mới</button>
                <button type="button" class="btn-audition-finish" id="btn-standalone-finish">🌻 Bé Sẵn Sàng ✨</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Gắn sự kiện đóng
    this.container.querySelector('#audition-btn-close')?.addEventListener('click', () => this.hide());
    this.container.querySelector('#btn-standalone-finish')?.addEventListener('click', () => this.hide());
    this.container.querySelector('#btn-standalone-replay')?.addEventListener('click', () => this.restartGame());

    // Gắn sự kiện bắt nhịp
    this.container.querySelector('#standalone-trigger-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.evaluateHit();
    });
  }

  show() {
    this.isOpen = true;
    this.rhythmScore = 0;
    this.ballPos = 10;
    this.ballDir = 1;
    this.isHitLocked = false;

    this.renderUI();
    this.container.style.display = 'flex';
    this.container.setAttribute('aria-hidden', 'false');

    if (this.audioService?.playChime) {
      this.audioService.playChime(660, 0.2);
    }
    if (this.audioService?.speak) {
      this.audioService.speak('Chào mừng bé đến với Sân Khấu Vũ Điệu Cầu Vồng! Canh viên bi vào vùng đỏ rồi bấm bắt nhịp nhé!');
    }

    this.startLoop();
    this.bindKeyboard();
  }

  hide() {
    this.isOpen = false;
    this.stopLoop();
    this.unbindKeyboard();
    this.container.style.display = 'none';
    this.container.setAttribute('aria-hidden', 'true');
  }

  restartGame() {
    this.rhythmScore = 0;
    this.isHitLocked = false;
    this.ballPos = 10;
    this.ballDir = 1;

    const victoryEl = this.container.querySelector('#standalone-victory-overlay');
    if (victoryEl) victoryEl.style.display = 'none';

    const dancerImg = this.container.querySelector('#audition-dancer-img');
    if (dancerImg) dancerImg.src = this.getHeroAssets().idle;

    this.updateUI('Canh bi vào vùng đỏ phát sáng nhé!', '');
    this.startLoop();
  }

  bindKeyboard() {
    this.unbindKeyboard();
    this._keyHandler = (e) => {
      if (!this.isOpen) return;
      if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
        e.preventDefault();
        this.evaluateHit();
      } else if (e.code === 'Escape') {
        this.hide();
      }
    };
    window.addEventListener('keydown', this._keyHandler);
  }

  unbindKeyboard() {
    if (this._keyHandler) {
      window.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
  }

  startLoop() {
    this.stopLoop();
    this.rhythmActive = true;
    this.lastTime = 0;

    const animate = (now) => {
      if (!this.rhythmActive || !this.isOpen) return;
      if (!this.lastTime) this.lastTime = now;
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;

      this.ballPos += this.ballDir * this.ballSpeed * dt;
      if (this.ballPos >= 96) {
        this.ballPos = 96;
        this.ballDir = -1;
      } else if (this.ballPos <= 4) {
        this.ballPos = 4;
        this.ballDir = 1;
      }

      const marble = this.container.querySelector('#standalone-marble');
      if (marble) marble.style.left = `${this.ballPos}%`;

      this.rhythmAnimId = requestAnimationFrame(animate);
    };

    this.rhythmAnimId = requestAnimationFrame(animate);
  }

  stopLoop() {
    this.rhythmActive = false;
    if (this.rhythmAnimId) {
      cancelAnimationFrame(this.rhythmAnimId);
      this.rhythmAnimId = null;
    }
  }

  updateUI(feedbackText, feedbackType) {
    const scoreVal = this.container.querySelector('#standalone-score-val');
    if (scoreVal) scoreVal.textContent = `${this.rhythmScore}/${this.rhythmTarget}`;

    const starsMeter = this.container.querySelector('#standalone-stars-meter');
    if (starsMeter) {
      starsMeter.innerHTML = Array.from({ length: this.rhythmTarget }).map((_, i) =>
        `<span class="audition-star ${i < this.rhythmScore ? 'is-lit' : ''}">${i < this.rhythmScore ? '⭐' : '☆'}</span>`
      ).join('');
    }

    const badge = this.container.querySelector('#standalone-feedback-badge');
    if (badge) {
      badge.textContent = feedbackText;
      badge.className = `audition-feedback-badge ${feedbackType || ''}`;
    }
  }

  evaluateHit() {
    if (!this.rhythmActive || this.isHitLocked) return;

    const isPerfect = this.ballPos >= 65 && this.ballPos <= 85;
    const isGreat = this.ballPos >= 58 && this.ballPos <= 92;

    const track = this.container.querySelector('#standalone-rail-track');
    const targetZone = this.container.querySelector('#standalone-target-zone');
    const marble = this.container.querySelector('#standalone-marble');
    const dancerBox = this.container.querySelector('#audition-dancer-box');

    if (isPerfect || isGreat) {
      this.rhythmScore++;
      this.isHitLocked = true;

      // FX Nhún nhảy & nháy sáng
      track?.classList.remove('track-hit-flash');
      void track?.offsetWidth;
      track?.classList.add('track-hit-flash');
      targetZone?.classList.add('zone-hit-flash');
      setTimeout(() => targetZone?.classList.remove('zone-hit-flash'), 250);
      marble?.classList.add('marble-hit-burst');
      setTimeout(() => marble?.classList.remove('marble-hit-burst'), 250);

      dancerBox?.classList.add('dancer-bounce');
      setTimeout(() => dancerBox?.classList.remove('dancer-bounce'), 350);

      const msg = isPerfect
        ? `🌟 PERFECT! +1 Nhịp (${this.rhythmScore}/${this.rhythmTarget})`
        : `✨ GREAT! +1 Nhịp (${this.rhythmScore}/${this.rhythmTarget})`;
      this.updateUI(msg, 'hit');

      if (this.audioService?.playChime) {
        this.audioService.playChime(600 + this.rhythmScore * 90, 0.15);
      }

      if (this.rhythmScore >= this.rhythmTarget) {
        this.handleStageVictory();
        return;
      }

      setTimeout(() => {
        this.isHitLocked = false;
      }, 220);
    } else {
      track?.classList.remove('track-miss-shake');
      void track?.offsetWidth;
      track?.classList.add('track-miss-shake');

      this.updateUI('Chưa trúng vùng đỏ rồi! Bé canh lại nhé!', 'miss');
      if (this.audioService?.playChime) {
        this.audioService.playChime(300, 0.1);
      }
    }
  }

  handleStageVictory() {
    this.stopLoop();

    const dancerImg = this.container.querySelector('#audition-dancer-img');
    if (dancerImg) dancerImg.src = this.getHeroAssets().celebrate;

    // Cộng thưởng 2 Sao
    const bonusStars = 2;
    if (this.saveAdapter) {
      const state = this.saveAdapter.load();
      state.player.stars = (state.player.stars || 0) + bonusStars;
      this.saveAdapter.save(state);
      if (this.progressionSystem) {
        this.progressionSystem.state = state;
      }
    }
    if (this.hudController) {
      this.hudController.updatePlayerHud?.();
      this.hudController.setStatus?.('🎉 Bé vừa biểu diễn Vũ Điệu Cầu Vồng và nhận +2 ⭐!');
    }

    if (this.audioService?.playSuccess) {
      this.audioService.playSuccess();
    }
    if (this.audioService?.speak) {
      this.audioService.speak('Xuất sắc! Bé đã hoàn thành vũ điệu cầu vồng và nhận hai ngôi sao may mắn!');
    }

    const victoryEl = this.container.querySelector('#standalone-victory-overlay');
    if (victoryEl) victoryEl.style.display = 'flex';
  }
}
