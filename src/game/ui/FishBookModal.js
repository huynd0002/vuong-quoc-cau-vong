/**
 * src/game/ui/FishBookModal.js
 * Sổ Huy Hiệu & Chuỗi Danh Hiệu Vinh Quang Của Bé (Bậc 1 đến Bậc 20).
 * - Hiển thị thành 1 Chuỗi Tiến Trình Thống Nhất từ Dễ đến Khó (không tách theo từng hạng mục riêng rẽ).
 * - Thanh tiến trình tổng thể, xác định rõ Bậc hiện tại và Thử thách tiếp theo bé cần chinh phục.
 * - Cho phép bé bấm chọn bất kỳ Huy Hiệu nào đã đạt được để "👑 Đeo Lên Đầu" nhân vật.
 */

import { BADGES, getBadgeById } from '../../content/achievements/badgeData.js';

export class FishBookModal {
  constructor({ badgeSystem, fishingSystem, audioService, onClose = () => {} }) {
    this.badgeSystem = badgeSystem || (typeof window !== 'undefined' ? window.__badgeSystem : null);
    this.fishingSystem = fishingSystem || (typeof window !== 'undefined' ? window.__fishingSystem : null);
    this.audioService = audioService || (typeof window !== 'undefined' ? window.__audioService : null);
    this.onClose = onClose;

    this.root = null;
    this.isOpen = false;
  }

  getBadgeSystem() {
    return this.badgeSystem || (typeof window !== 'undefined' ? window.__badgeSystem : null);
  }

  open(category = 'all') {
    return this.show();
  }

  show() {
    this.isOpen = true;
    const badgeSys = this.getBadgeSystem();
    if (badgeSys && typeof badgeSys.checkAllBadges === 'function') {
      badgeSys.checkAllBadges();
    }

    this._speak('Chào mừng bé mở Sổ Huy Hiệu! Hãy cùng vượt qua chuỗi thử thách từ dễ tới khó để đạt vương miện Siêu Sao Toàn Năng nhé!');

    if (!this.root) {
      this.root = document.createElement('div');
      this.root.id = 'fishbook-modal-root';
      this.root.className = 'fishbook-modal-backdrop';
      document.body.appendChild(this.root);
    } else {
      this.root.className = 'fishbook-modal-backdrop';
      this.root.style.display = 'flex';
    }
    this._render();
  }

  hide() {
    this.isOpen = false;
    if (this.root) {
      this.root.style.display = 'none';
    }
    if (typeof this.onClose === 'function') {
      this.onClose();
    }
  }

  close() {
    return this.hide();
  }

  _speak(text) {
    if (!text) return;
    if (this.audioService && typeof this.audioService.speak === 'function') {
      this.audioService.speak(text);
      return;
    }
    const globalAudio = typeof window !== 'undefined' ? window.__audioService : null;
    if (globalAudio && typeof globalAudio.speak === 'function') {
      globalAudio.speak(text);
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'vi-VN';
        u.rate = 0.88;
        window.speechSynthesis.speak(u);
      } catch (e) {
        console.warn('[FishBookModal] TTS error:', e);
      }
    }
  }

  _render() {
    if (!this.root) return;
    const badgeSys = this.getBadgeSystem();
    const unlockedBadges = badgeSys ? badgeSys.getUnlockedBadges() : [];
    const equippedBadge = badgeSys ? badgeSys.getEquippedBadge() : null;
    const totalBadges = BADGES.length;
    const unlockedCount = unlockedBadges.length;
    const progressPct = Math.round((unlockedCount / totalBadges) * 100);

    // Lấy số Sao hiện tại của bé
    let stars = 0;
    if (this.fishingSystem && typeof this.fishingSystem.getStars === 'function') {
      stars = this.fishingSystem.getStars();
    } else if (badgeSys?.gameState?.player?.stars !== undefined) {
      stars = badgeSys.gameState.player.stars;
    }

    // Xác định huy hiệu tiếp theo trong chuỗi cần đạt
    const nextTargetBadge = BADGES.find(b => !badgeSys?.isUnlocked(b.id)) || null;

    this.root.innerHTML = `
      <div class="fishbook-modal-card" role="dialog" aria-label="Sổ Huy Hiệu & Chuỗi Thành Tựu">
        <!-- Header -->
        <div class="fishing-header" style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border-bottom: 3px solid #86efac;">
          <div class="fishing-title-wrap">
            <span class="fishing-title-icon" style="font-size: 2.2rem;">🏅</span>
            <div class="fishing-title-text">
              <h2 style="color: #065f46; margin: 0; font-size: 1.55rem; font-weight: 900;">Chuỗi Huy Hiệu Vinh Quang</h2>
              <div style="font-size: 0.88rem; font-weight: 800; color: #047857; margin-top: 2px;">
                Lộ trình 20 bậc thang từ Dễ đến Khó — Rèn luyện trí tuệ & lòng kiên nhẫn!
              </div>
            </div>
          </div>
          <div class="fishing-header-pills">
            <span class="fishing-stat-pill basket-pill" style="background: #fef08a; border-color: #facc15; color: #854d0e;">
              🏅 ${unlockedCount}/${totalBadges} Bậc
            </span>
            <span class="fishing-stat-pill shells-pill">
              ⭐ ${stars} Sao
            </span>
            <button type="button" class="fishing-close-btn" data-action="close" aria-label="Đóng">✖</button>
          </div>
        </div>

        <!-- Thanh Tiến Trình Chuỗi Danh Hiệu Vinh Quang (Bậc 1 -> Bậc 20) -->
        <div style="
          margin: 10px 18px 4px;
          padding: 10px 16px;
          background: #ffffff;
          border: 2px solid #bbf7d0;
          border-radius: 18px;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.08);
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 0.95rem; font-weight: 900; color: #065f46; display: flex; align-items: center; gap: 6px;">
              <span>🏆 Tiến Trình Chinh Phục Chuỗi Huy Hiệu:</span>
              <span style="color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 999px; font-size: 0.82rem;">
                ${progressPct}% Hoàn Thành
              </span>
            </div>
            <div style="font-size: 0.88rem; font-weight: 800; color: #047857;">
              ${nextTargetBadge ? `🎯 Mục tiêu tiếp theo: ${nextTargetBadge.categoryLabel}` : '🎉 ĐÃ HOÀN THÀNH TRỌN VẸN!'}
            </div>
          </div>
          <div style="
            width: 100%;
            height: 12px;
            background: #e2e8f0;
            border-radius: 999px;
            overflow: hidden;
            border: 1px solid #cbd5e1;
          ">
            <div style="
              width: ${progressPct}%;
              height: 100%;
              background: linear-gradient(90deg, #22c55e 0%, #eab308 50%, #f59e0b 100%);
              border-radius: 999px;
              transition: width 0.4s ease;
            "></div>
          </div>
        </div>

        <!-- Banner Huy Hiệu Đang Đeo Trên Đầu Nhân Vật -->
        <div style="
          margin: 6px 18px 4px;
          padding: 10px 16px;
          background: ${equippedBadge ? 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)' : '#f8fafc'};
          border: 2.5px solid ${equippedBadge ? '#f59e0b' : '#e2e8f0'};
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: ${equippedBadge ? '#ffffff' : '#e2e8f0'};
              border: 2px solid ${equippedBadge ? '#d97706' : '#cbd5e1'};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.5rem;
              box-shadow: ${equippedBadge ? '0 3px 8px rgba(217, 119, 6, 0.3)' : 'none'};
            ">
              ${equippedBadge ? equippedBadge.icon : '👑'}
            </div>
            <div>
              <div style="font-size: 0.8rem; font-weight: 900; color: ${equippedBadge ? '#b45309' : '#64748b'}; text-transform: uppercase;">
                ${equippedBadge ? '✨ Huy Hiệu Đang Tỏa Sáng Trên Đầu Nhân Vật:' : '👑 Chưa Đeo Huy Hiệu Nào'}
              </div>
              <div style="font-size: 1.12rem; font-weight: 900; color: ${equippedBadge ? '#451a03' : '#334155'};">
                ${equippedBadge ? `${equippedBadge.categoryLabel}: ${equippedBadge.title}` : 'Bé hãy chọn một huy hiệu bên dưới rồi bấm "👑 Đeo lên đầu" nhé!'}
              </div>
            </div>
          </div>
          ${
            equippedBadge
              ? `
              <button type="button" class="fishing-secondary-btn" data-action="unequip-badge" style="min-height: 40px; padding: 6px 14px; font-size: 0.95rem; border-color: #f87171; color: #b91c1c;">
                ❌ Bỏ Đeo
              </button>
            `
              : ''
          }
        </div>

        <!-- Nội dung danh sách Chuỗi 20 Huy Hiệu tuần tự từ Dễ đến Khó -->
        <div class="fishing-body" style="padding: 10px 18px 18px;">
          <div class="fishing-grid" style="grid-template-columns: repeat(auto-fill, minmax(295px, 1fr));">
            ${BADGES.map((badge, idx) => this._renderBadgeCard(badge, badgeSys, nextTargetBadge)).join('')}
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _renderBadgeCard(badge, badgeSys, nextTargetBadge) {
    const isUnlocked = Boolean(badgeSys?.isUnlocked(badge.id));
    const isEquipped = badgeSys?.getEquippedBadge()?.id === badge.id;
    const isNextTarget = nextTargetBadge && nextTargetBadge.id === badge.id;

    // Phân loại màu sắc theo cấp bậc chuỗi từ dễ tới khó
    const cardBorderColor = isEquipped 
      ? '#f59e0b' 
      : isUnlocked 
        ? '#22c55e' 
        : isNextTarget 
          ? '#0284c7' 
          : '#cbd5e1';

    const cardBg = isEquipped 
      ? 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)' 
      : isUnlocked 
        ? '#f0fdf4' 
        : isNextTarget 
          ? '#f0f9ff' 
          : '#f8fafc';

    const cardShadow = isEquipped 
      ? '0 0 0 3px rgba(245, 158, 11, 0.4), 0 8px 20px rgba(217, 119, 6, 0.15)' 
      : isNextTarget
        ? '0 0 0 2.5px rgba(2, 132, 199, 0.35), 0 6px 16px rgba(2, 132, 199, 0.12)'
        : isUnlocked 
          ? '0 4px 12px rgba(34, 197, 94, 0.12)' 
          : '0 3px 8px rgba(15, 23, 42, 0.04)';

    return `
      <div class="fishing-item-card ${isNextTarget ? 'next-target-pulse' : ''}" style="
        background: ${cardBg};
        border: 3px solid ${cardBorderColor};
        box-shadow: ${cardShadow};
        border-radius: 20px;
        padding: 14px;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 10px;
      ">
        <!-- Top part -->
        <div class="fishing-item-top" style="align-items: flex-start; gap: 12px;">
          <div class="fishing-item-thumb" style="
            width: 68px;
            height: 68px;
            border-radius: 20px;
            background: ${isUnlocked ? '#ffffff' : isNextTarget ? '#e0f2fe' : '#f1f5f9'};
            border: 2px solid ${isUnlocked ? '#86efac' : isNextTarget ? '#7dd3fc' : '#e2e8f0'};
            font-size: 2.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: ${isUnlocked ? '0 3px 8px rgba(34, 197, 94, 0.25)' : 'none'};
          ">
            ${isUnlocked ? badge.icon : (isNextTarget ? badge.icon : '🔒')}
          </div>
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
              <span style="font-size: 0.78rem; font-weight: 900; color: ${isUnlocked ? '#15803d' : isNextTarget ? '#0369a1' : '#64748b'}; background: ${isUnlocked ? '#dcfce7' : isNextTarget ? '#e0f2fe' : '#f1f5f9'}; padding: 2px 8px; border-radius: 999px;">
                ${badge.categoryLabel}
              </span>
              <button type="button" class="fishing-secondary-btn" style="min-height: 32px; padding: 2px 8px; border-radius: 999px;" data-speak="${badge.title}. ${isUnlocked ? badge.desc : 'Thử thách: ' + badge.goalHint}">
                🔊
              </button>
            </div>
            <div style="font-size: 1.15rem; font-weight: 900; color: ${isUnlocked ? '#0f172a' : isNextTarget ? '#0369a1' : '#64748b'}; margin-top: 4px;">
              ${badge.title}
            </div>
          </div>
        </div>

        <!-- Description / Goal -->
        <div style="font-size: 0.90rem; font-weight: 700; color: ${isUnlocked ? '#334155' : isNextTarget ? '#0f172a' : '#64748b'}; line-height: 1.45;">
          ${isUnlocked 
            ? badge.desc 
            : isNextTarget 
              ? `<span style="color:#0284c7; font-weight:900;">🎯 Thử thách tiếp theo:</span> ${badge.goalHint}`
              : `<span style="color:#d97706; font-weight:800;">🔒 Yêu cầu mở:</span> Đạt Bậc ${badge.rank - 1} trước`}
        </div>

        <!-- Status & Action Row -->
        <div style="margin-top: 4px; padding-top: 8px; border-top: 1.5px dashed ${isUnlocked ? '#bbf7d0' : isNextTarget ? '#bae6fd' : '#e2e8f0'};">
          ${
            isUnlocked
              ? `
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <div style="font-size: 0.88rem; font-weight: 900; color: #15803d; display: flex; align-items: center; gap: 4px;">
                  ✓ Đã đạt được!
                </div>
                ${
                  isEquipped
                    ? `
                    <button type="button" class="fishing-big-btn" data-action="unequip-badge" style="
                      min-height: 38px;
                      padding: 4px 14px;
                      font-size: 0.88rem;
                      background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
                      border-color: #b45309;
                      box-shadow: 0 4px 0 #92400e;
                    ">
                      ✨ Đang Đeo
                    </button>
                  `
                    : `
                    <button type="button" class="fishing-big-btn" data-equip-badge="${badge.id}" style="
                      min-height: 38px;
                      padding: 4px 14px;
                      font-size: 0.88rem;
                      background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
                      border-color: #15803d;
                      box-shadow: 0 4px 0 #166534;
                    ">
                      👑 Đeo Lên Đầu
                    </button>
                  `
                }
              </div>
            `
              : isNextTarget
                ? `
                <div style="font-size: 0.88rem; font-weight: 900; color: #0284c7; display: flex; align-items: center; gap: 5px;">
                  🎯 Đang Thử Thách — Cố lên bé yêu!
                </div>
              `
                : `
                <div style="font-size: 0.84rem; font-weight: 800; color: #94a3b8; display: flex; align-items: center; gap: 5px;">
                  🔒 Chưa đủ điều kiện chuỗi
                </div>
              `
          }
        </div>
      </div>
    `;
  }

  _bindEvents() {
    if (!this.root) return;

    // Close button
    this.root.querySelectorAll('[data-action="close"]').forEach(btn => {
      btn.onclick = () => this.hide();
    });

    // Speak button
    this.root.querySelectorAll('[data-speak]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const text = btn.getAttribute('data-speak');
        this._speak(text);
      };
    });

    // Equip badge
    this.root.querySelectorAll('[data-equip-badge]').forEach(btn => {
      btn.onclick = () => {
        const badgeId = btn.getAttribute('data-equip-badge');
        const badgeSys = this.getBadgeSystem();
        if (badgeSys) {
          const equipped = badgeSys.equipBadge(badgeId);
          if (equipped) {
            this._speak(`Đã đeo huy hiệu ${equipped.title} lên đầu nhân vật!`);
            this._render();
          }
        }
      };
    });

    // Unequip badge
    this.root.querySelectorAll('[data-action="unequip-badge"]').forEach(btn => {
      btn.onclick = () => {
        const badgeSys = this.getBadgeSystem();
        if (badgeSys) {
          badgeSys.unequipBadge();
          this._speak('Đã bỏ đeo huy hiệu.');
          this._render();
        }
      };
    });

    // Click backdrop to close
    this.root.onclick = (e) => {
      if (e.target === this.root) {
        this.hide();
      }
    };
  }
}
