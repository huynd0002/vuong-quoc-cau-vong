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

    // Duyệt tuần tự theo đúng Rank 1 -> 20 của chuỗi
    for (const badge of BADGES) {
      if (!unlockedList.includes(badge.id)) {
        try {
          if (typeof badge.checkUnlocked === 'function' && badge.checkUnlocked(state)) {
            unlockedList.push(badge.id);
            newlyUnlocked.push(badge);
          }
        } catch (err) {
          console.warn('[BadgeSystem] Error checking badge:', badge.id, err);
        }
      }
    }

    if (newlyUnlocked.length > 0) {
      // Auto-equip the latest badge if no badge is equipped, or if enabled
      if (options.autoEquipIfNone && (!this.gameState.player.equippedBadge || newlyUnlocked.length === 1)) {
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
        for (const badge of newlyUnlocked) {
          this._notifyUnlock(badge);
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
        this.audioService.speak(`Chúc mừng bé đã đạt huy hiệu mới: ${badge.title}!`);
      }
    }

    // 2. Dispatch event
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('game:badge-unlocked', { detail: { badge } }));
      } catch (e) {}
    }

    // 3. Floating celebratory Toast UI
    this._showUnlockToast(badge);
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
            🎉 BÉ ĐẠT HUY HIỆU MỚI!
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
