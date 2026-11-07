/**
 * src/game/systems/badgeSystem.js
 * Quản lý kiểm tra điều kiện mở khóa, trang bị và hiển thị Huy Hiệu & Thành Tựu của Bé.
 */

import { BADGES, getBadgeById } from '../../content/achievements/badgeData.js';

export class BadgeSystem {
  constructor(saveAdapter, gameState, audioService = null) {
    this.saveAdapter = saveAdapter;
    this.gameState = gameState;
    this.audioService = audioService;

    this._ensurePlayerState();
  }

  _ensurePlayerState() {
    if (!this.gameState.player) {
      this.gameState.player = {};
    }
    if (!Array.isArray(this.gameState.player.unlockedBadges)) {
      this.gameState.player.unlockedBadges = [];
    }
    if (this.gameState.player.equippedBadge === undefined) {
      this.gameState.player.equippedBadge = null;
    }
  }

  getAllBadges() {
    return BADGES;
  }

  getBadge(id) {
    return getBadgeById(id);
  }

  getUnlockedBadges() {
    this._ensurePlayerState();
    return this.gameState.player.unlockedBadges
      .map(id => getBadgeById(id))
      .filter(Boolean);
  }

  isUnlocked(id) {
    this._ensurePlayerState();
    return this.gameState.player.unlockedBadges.includes(id);
  }

  getEquippedBadge() {
    this._ensurePlayerState();
    const id = this.gameState.player.equippedBadge;
    return id ? getBadgeById(id) : null;
  }

  equipBadge(id) {
    this._ensurePlayerState();
    if (!id) {
      return this.unequipBadge();
    }
    const badge = getBadgeById(id);
    if (!badge) return null;

    if (!this.isUnlocked(id)) {
      return null;
    }

    this.gameState.player.equippedBadge = id;
    this._persist();

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('game:badge-equipped', { detail: { badge } }));
      } catch (e) {}
    }
    return badge;
  }

  unequipBadge() {
    this._ensurePlayerState();
    this.gameState.player.equippedBadge = null;
    this._persist();

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('game:badge-unequipped'));
      } catch (e) {}
    }
    return null;
  }

  getNextTargetBadge() {
    this._ensurePlayerState();
    const unlocked = this.gameState.player.unlockedBadges || [];
    return BADGES.find(b => !unlocked.includes(b.id)) || null;
  }

  getBadgeChainProgress() {
    this._ensurePlayerState();
    const unlocked = this.gameState.player.unlockedBadges || [];
    const total = BADGES.length;
    const unlockedCount = unlocked.length;
    const nextBadge = this.getNextTargetBadge();
    return {
      unlockedCount,
      total,
      pct: Math.round((unlockedCount / total) * 100),
      nextBadge,
      isFullyCompleted: unlockedCount >= total
    };
  }

  checkAllBadges(customState = null, options = { notify: true, autoEquipIfNone: true }) {
    this._ensurePlayerState();
    const state = customState || this.gameState;
    if (!state.player) {
      state.player = this.gameState.player;
    }
    if (!Array.isArray(state.player.unlockedBadges)) {
      state.player.unlockedBadges = this.gameState.player.unlockedBadges;
    }
    const unlockedList = this.gameState.player.unlockedBadges;
    state.player.unlockedBadges = unlockedList;
    const newlyUnlocked = [];

    // Duyệt lặp theo chuỗi Rank 1 -> 20 để tự động kích hoạt chuỗi nếu bé đã hoàn thành nhiều việc
    let keepChecking = true;
    let loopCount = 0;
    const maxLoops = BADGES.length;

    while (keepChecking && loopCount < maxLoops) {
      keepChecking = false;
      loopCount++;

      for (const badge of BADGES) {
        if (!unlockedList.includes(badge.id)) {
          try {
            if (typeof badge.checkUnlocked === 'function' && badge.checkUnlocked(state)) {
              unlockedList.push(badge.id);
              newlyUnlocked.push(badge);
              keepChecking = true;
            }
          } catch (err) {
            console.warn('[BadgeSystem] Error checking badge:', badge.id, err);
          }
        }
      }
    }

    if (newlyUnlocked.length > 0) {
      // Auto-equip the latest badge if no badge is equipped, or if enabled
      if (options.autoEquipIfNone && (!this.gameState.player.equippedBadge || newlyUnlocked.length >= 1)) {
        const latestBadge = newlyUnlocked[newlyUnlocked.length - 1];
        this.gameState.player.equippedBadge = latestBadge.id;
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          try {
            window.dispatchEvent(new CustomEvent('game:badge-equipped', { detail: { badge: latestBadge } }));
          } catch (e) {}
        }
      }

      this._persist();

      if (options.notify) {
        // Vinh danh từng danh hiệu mới mở khóa (ưu tiên danh hiệu cao nhất nếu mở nhiều cùng lúc)
        for (let i = 0; i < newlyUnlocked.length; i++) {
          const badge = newlyUnlocked[i];
          const delay = i * 650;
          setTimeout(() => {
            this._notifyUnlock(badge);
          }, delay);
        }
      }
    }

    return newlyUnlocked;
  }

  _persist() {
    if (this.saveAdapter && typeof this.saveAdapter.save === 'function') {
      try {
        this.saveAdapter.save(this.gameState);
      } catch (err) {
        console.warn('[BadgeSystem] Error saving state:', err);
      }
    }
  }

  _notifyUnlock(badge) {
    if (typeof window === 'undefined') return;

    // 1. Play Fanfare & Speech
    if (this.audioService) {
      if (typeof this.audioService.playSuccess === 'function') {
        this.audioService.playSuccess();
      }
      if (typeof this.audioService.speak === 'function') {
        this.audioService.speak(`Chúc mừng bé đã đạt danh hiệu mới: ${badge.title}!`);
      }
    }

    // 2. Dispatch event to WorldScene & other UI
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('game:badge-unlocked', { detail: { badge } }));
      } catch (e) {}
    }

    // 3. Hiệu ứng vinh danh Danh Hiệu hoành tráng & rực rỡ trực tiếp trong lúc chơi
    this._showBadgeCelebrationModal(badge);
    this._showUnlockToast(badge);
  }

  _showBadgeCelebrationModal(badge) {
    if (typeof document === 'undefined') return;

    const existingModal = document.getElementById('badge-celebration-popup');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'badge-celebration-popup';
    modal.className = 'badge-celebration-backdrop';

    // Tạo các mảnh pháo hoa giấy ngẫu nhiên (Confetti Particles)
    const confettiColors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#facc15'];
    let confettiHtml = '';
    for (let i = 0; i < 36; i++) {
      const left = Math.floor(Math.random() * 100);
      const delay = (Math.random() * 0.8).toFixed(2);
      const dur = (1.5 + Math.random() * 1.5).toFixed(2);
      const color = confettiColors[i % confettiColors.length];
      const size = Math.floor(8 + Math.random() * 10);
      const rotate = Math.floor(Math.random() * 360);
      confettiHtml += `<span class="badge-confetti" style="
        left: ${left}%;
        top: -20px;
        width: ${size}px;
        height: ${size * 1.4}px;
        background-color: ${color};
        animation-delay: ${delay}s;
        animation-duration: ${dur}s;
        transform: rotate(${rotate}deg);
      "></span>`;
    }

    modal.innerHTML = `
      <div class="badge-celebration-overlay" aria-hidden="true"></div>
      <div class="badge-confetti-wrap" aria-hidden="true">${confettiHtml}</div>
      <div class="badge-celebration-container" role="dialog" aria-modal="true" aria-label="Bé đạt danh hiệu mới">
        <!-- Hào quang xoay tròn 360 độ rực rỡ phía sau -->
        <div class="badge-sunburst-aura" aria-hidden="true"></div>

        <!-- Thẻ Danh Hiệu Vinh Quang Mạ Vàng -->
        <div class="badge-celebration-card">
          <!-- Bụi sao lấp lánh trang trí góc -->
          <div class="badge-star-sparkle top-left">✨</div>
          <div class="badge-star-sparkle top-right">⭐</div>
          <div class="badge-star-sparkle bottom-left">🌟</div>
          <div class="badge-star-sparkle bottom-right">✨</div>

          <!-- Dải ruy băng tiêu đề chúc mừng -->
          <div class="badge-ribbon-tag">
            <span class="badge-ribbon-icon">🎉</span>
            <span class="badge-ribbon-text">CHÚC MỪNG BÉ ĐẠT DANH HIỆU MỚI!</span>
            <span class="badge-ribbon-icon">🏆</span>
          </div>

          <!-- Bậc xếp hạng danh hiệu -->
          <div class="badge-rank-pill">
            ${badge.categoryLabel}
          </div>

          <!-- Icon Danh Hiệu 3D Siêu To Nhấp Nhô -->
          <div class="badge-big-icon-wrap">
            <div class="badge-icon-radial-bg"></div>
            <span class="badge-big-icon">${badge.icon || '🏅'}</span>
          </div>

          <!-- Tên Danh Hiệu Nổi Bật -->
          <div class="badge-celebrate-title">
            ${badge.title}
          </div>

          <!-- Mô tả ý nghĩa danh hiệu -->
          <div class="badge-celebrate-desc">
            ${badge.desc}
          </div>

          <!-- Nhãn thông báo đã đeo lên đầu nhân vật -->
          <div class="badge-auto-equip-pill">
            <span style="font-size: 1.15rem;">👑</span>
            <span>Đã tự động vinh danh & đội lên đầu <b>Bé Sam</b>!</span>
          </div>

          <!-- Nút bấm tiếp tục rực rỡ -->
          <button type="button" class="badge-celebrate-confirm-btn" id="badge-celebrate-close-btn">
            ⭐ Tuyệt Vời Quá! Nhận Thưởng ⭐
          </button>
        </div>
      </div>
      <style>
        .badge-celebration-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: 'Nunito', 'Quicksand', system-ui, sans-serif;
          animation: badgeBackdropFadeIn 0.35s ease forwards;
        }
        .badge-celebration-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }
        .badge-confetti-wrap {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }
        .badge-confetti {
          position: absolute;
          opacity: 0.9;
          border-radius: 3px;
          animation: badgeConfettiFall linear infinite;
        }
        @keyframes badgeConfettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0.2; }
        }
        .badge-celebration-container {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: badgeCardPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .badge-sunburst-aura {
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            rgba(254, 240, 138, 0.6) 0deg 15deg,
            transparent 15deg 30deg,
            rgba(250, 204, 21, 0.6) 30deg 45deg,
            transparent 45deg 60deg,
            rgba(254, 240, 138, 0.6) 60deg 75deg,
            transparent 75deg 90deg,
            rgba(250, 204, 21, 0.6) 90deg 105deg,
            transparent 105deg 120deg,
            rgba(254, 240, 138, 0.6) 120deg 135deg,
            transparent 135deg 150deg,
            rgba(250, 204, 21, 0.6) 150deg 165deg,
            transparent 165deg 180deg,
            rgba(254, 240, 138, 0.6) 180deg 195deg,
            transparent 195deg 210deg,
            rgba(250, 204, 21, 0.6) 210deg 225deg,
            transparent 225deg 240deg,
            rgba(254, 240, 138, 0.6) 240deg 255deg,
            transparent 255deg 270deg,
            rgba(250, 204, 21, 0.6) 270deg 285deg,
            transparent 285deg 300deg,
            rgba(254, 240, 138, 0.6) 300deg 315deg,
            transparent 315deg 330deg,
            rgba(250, 204, 21, 0.6) 330deg 345deg,
            transparent 345deg 360deg
          );
          animation: badgeSunburstSpin 8s linear infinite;
          filter: blur(4px);
          pointer-events: none;
        }
        @keyframes badgeSunburstSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .badge-celebration-card {
          position: relative;
          width: 90vw;
          max-width: 420px;
          background: linear-gradient(180deg, #ffffff 0%, #fffbeb 50%, #fef3c7 100%);
          border: 4px solid #f59e0b;
          border-radius: 28px;
          padding: 24px 22px 20px;
          box-shadow: 
            0 0 0 4px #ffffff,
            0 0 45px rgba(245, 158, 11, 0.6),
            0 20px 48px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          z-index: 2;
        }
        .badge-star-sparkle {
          position: absolute;
          font-size: 1.5rem;
          pointer-events: none;
          animation: badgeSparkleFloat 2s ease-in-out infinite alternate;
        }
        .badge-star-sparkle.top-left { top: 12px; left: 14px; animation-delay: 0.1s; }
        .badge-star-sparkle.top-right { top: 12px; right: 14px; animation-delay: 0.4s; }
        .badge-star-sparkle.bottom-left { bottom: 14px; left: 16px; animation-delay: 0.7s; }
        .badge-star-sparkle.bottom-right { bottom: 14px; right: 16px; animation-delay: 1.0s; }
        @keyframes badgeSparkleFloat {
          0% { transform: scale(0.85) rotate(-8deg); opacity: 0.7; }
          100% { transform: scale(1.25) rotate(12deg); opacity: 1; }
        }
        .badge-ribbon-tag {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35);
          border-radius: 999px;
          padding: 6px 18px;
          font-size: 0.88rem;
          font-weight: 900;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        .badge-rank-pill {
          background: #fef08a;
          color: #854d0e;
          border: 1.5px solid #facc15;
          border-radius: 999px;
          padding: 3px 14px;
          font-size: 0.82rem;
          font-weight: 900;
        }
        .badge-big-icon-wrap {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 4px 0;
        }
        .badge-icon-radial-bg {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle, #fde047 0%, #f59e0b 65%, transparent 75%);
          opacity: 0.65;
          animation: badgePulseAura 1.8s ease-in-out infinite alternate;
        }
        @keyframes badgePulseAura {
          0% { transform: scale(0.9); opacity: 0.5; }
          100% { transform: scale(1.2); opacity: 0.85; }
        }
        .badge-big-icon {
          position: relative;
          font-size: 4.2rem;
          line-height: 1;
          filter: drop-shadow(0 6px 12px rgba(180, 83, 9, 0.45));
          animation: badgeBounceIcon 1.6s ease-in-out infinite alternate;
        }
        @keyframes badgeBounceIcon {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-8px) scale(1.08); }
        }
        .badge-celebrate-title {
          font-size: 1.55rem;
          font-weight: 900;
          color: #78350f;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
          line-height: 1.25;
        }
        .badge-celebrate-desc {
          font-size: 0.95rem;
          font-weight: 700;
          color: #451a03;
          line-height: 1.45;
          max-width: 360px;
          padding: 0 8px;
        }
        .badge-auto-equip-pill {
          background: #dcfce7;
          border: 2px solid #86efac;
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 0.88rem;
          font-weight: 800;
          color: #15803d;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .badge-celebrate-confirm-btn {
          width: 100%;
          margin-top: 6px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: #ffffff;
          border: 3px solid #ffffff;
          box-shadow: 0 8px 24px rgba(22, 163, 74, 0.4), 0 0 0 3px #15803d;
          border-radius: 999px;
          padding: 12px 20px;
          font-size: 1.1rem;
          font-weight: 900;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: transform 0.15s ease, filter 0.15s ease;
          font-family: inherit;
        }
        .badge-celebrate-confirm-btn:hover {
          transform: scale(1.03);
          filter: brightness(1.08);
        }
        .badge-celebrate-confirm-btn:active {
          transform: scale(0.97);
        }
        @keyframes badgeBackdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes badgeCardPopIn {
          0% { opacity: 0; transform: scale(0.65) translateY(40px); }
          70% { transform: scale(1.06) translateY(-8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .badge-celebration-backdrop.dismissing {
          transition: opacity 0.4s ease;
          opacity: 0;
          pointer-events: none;
        }
      </style>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
      if (!modal || !modal.parentNode) return;
      modal.classList.add('dismissing');
      setTimeout(() => {
        if (modal && modal.parentNode) modal.remove();
      }, 420);
    };

    const confirmBtn = modal.querySelector('#badge-celebrate-close-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (this.audioService && typeof this.audioService.playChime === 'function') {
          this.audioService.playChime(880, 0.2);
        }
        closeModal();
      });
    }

    // Tự động đóng sau 6 giây nếu bé không bấm để không làm gián đoạn cuộc chơi
    const autoDismissTimer = setTimeout(() => {
      closeModal();
    }, 6000);

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('badge-celebration-overlay')) {
        clearTimeout(autoDismissTimer);
        closeModal();
      }
    });
  }

  _showUnlockToast(badge) {
    if (typeof document === 'undefined') return;

    const existingToast = document.getElementById('badge-unlock-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'badge-unlock-toast';
    toast.innerHTML = `
      <div style="
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: linear-gradient(135deg, #fef08a 0%, #fde047 50%, #f59e0b 100%);
        border: 3.5px solid #ffffff;
        box-shadow: 0 12px 32px rgba(245, 158, 11, 0.45), 0 0 0 4px #d97706;
        border-radius: 999px;
        padding: 10px 24px;
        display: flex;
        align-items: center;
        gap: 14px;
        z-index: 99999;
        font-family: 'Nunito', 'Quicksand', system-ui, sans-serif;
        color: #78350f;
        animation: badgeToastPop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        pointer-events: none;
      ">
        <span style="font-size: 2.2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">${badge.icon}</span>
        <div>
          <div style="font-size: 0.8rem; font-weight: 900; letter-spacing: 1px; color: #b45309; text-transform: uppercase;">
            🎉 BÉ ĐẠT DANH HIỆU MỚI!
          </div>
          <div style="font-size: 1.15rem; font-weight: 900; color: #451a03;">
            ${badge.title} ✨ <span style="font-size: 0.85rem; font-weight: 800; color: #15803d;">(Đã đeo lên đầu)</span>
          </div>
        </div>
      </div>
      <style>
        @keyframes badgeToastPop {
          0% { opacity: 0; transform: translateX(-50%) translateY(-40px) scale(0.8); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      </style>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-30px)';
        setTimeout(() => toast.remove(), 600);
      }
    }, 4000);
  }
}
