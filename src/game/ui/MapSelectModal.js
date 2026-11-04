/**
 * Map Selection Modal (Campaign Hub)
 * Màn hình bản đồ thế giới Vương Quốc Cầu Vồng: Cho phép xem tiến độ 6 vùng đất,
 * chọn vùng để chơi lại mà không mất tiến trình, và xem bộ sưu tập Pha Lê Cầu Vồng.
 */

import { CAMPAIGN_ZONES, getCampaignProgress, canAccessGrandFinale } from '../../content/campaign/campaignGraph.js';
import map1BgUrl from '../../../assets/maps/backgrounds/map_1_bg.png?url';
import map2BgUrl from '../../../assets/maps/backgrounds/map_2_bg.png?url';
import map3BgUrl from '../../../assets/maps/backgrounds/map_3_bg.png?url';
import map4BgUrl from '../../../assets/maps/backgrounds/map_4_bg.png?url';
import map5BgUrl from '../../../assets/maps/backgrounds/map_5_bg.png?url';
import map6BgUrl from '../../../assets/maps/backgrounds/map_6_bg.png?url';

export const MAP_THUMBNAILS = {
  map1: map1BgUrl,
  map2: map2BgUrl,
  map3: map3BgUrl,
  map4: map4BgUrl,
  map5: map5BgUrl,
  map6: map6BgUrl
};

export class MapSelectModal {
  constructor({ onSelectZone, onOpenFinale, onResetProgress, onClose } = {}) {
    this.onSelectZone = onSelectZone;
    this.onOpenFinale = onOpenFinale;
    this.onResetProgress = onResetProgress;
    this.onClose = onClose;
    this.modalEl = null;
  }

  show(saveState) {
    this.hide();

    const progress = getCampaignProgress(saveState);
    const unlockedMaps = saveState?.campaign?.unlockedMaps || ['map1'];
    const completedMaps = saveState?.campaign?.completedMaps || [];
    const storyItems = saveState?.campaign?.storyItems || [];
    const currentMapId = saveState?.campaign?.currentMapId || 'map1';

    const overlay = document.createElement('div');
    overlay.className = 'map-select-overlay';
    overlay.id = 'map-select-modal';

    const zonesHtml = Object.values(CAMPAIGN_ZONES).map(zone => {
      const isUnlocked = unlockedMaps.includes(zone.id);
      const isCompleted = completedMaps.includes(zone.id);
      const isCurrent = currentMapId === zone.id;
      const hasCrystal = storyItems.includes(zone.storyItem.id);

      let statusBadge = '';
      let cardClass = 'zone-card';

      if (isCompleted) {
        cardClass += ' completed';
        statusBadge = '<span class="status-badge badge-completed">🌟 Hoàn thành</span>';
      } else if (isUnlocked) {
        cardClass += ' unlocked';
        statusBadge = '<span class="status-badge badge-current">🚀 Đang chơi</span>';
      } else {
        cardClass += ' locked';
        statusBadge = '<span class="status-badge badge-locked">🔒 Đang khóa</span>';
      }

      if (isCurrent) {
        cardClass += ' active-pin';
      }

      const crystalBadge = hasCrystal
        ? `<span class="crystal-tag" title="${zone.storyItem.name}">${zone.storyItem.icon} Đã có</span>`
        : `<span class="crystal-tag empty" title="Chưa có">⚪ Chưa nhận</span>`;

      const thumbUrl = MAP_THUMBNAILS[zone.id] || map1BgUrl;
      const thumbHtml = `
        <div class="zone-thumb-box">
          <img src="${thumbUrl}" alt="${zone.name}" class="zone-thumb-img" loading="lazy" />
          ${!isUnlocked ? `
            <div class="zone-thumb-locked">
              <span class="lock-icon">🔒</span>
              <span class="lock-text">Đang khóa</span>
            </div>
          ` : ''}
          ${isCurrent ? `<span class="zone-thumb-here">📍 Đang khám phá</span>` : ''}
          ${isCompleted ? `<span class="zone-thumb-complete-badge">⭐ Hoàn thành</span>` : ''}
        </div>
      `;

      return `
        <div class="${cardClass}" data-zone-id="${zone.id}" ${isUnlocked ? 'role="button" tabindex="0"' : 'aria-disabled="true"'}>
          ${thumbHtml}
          <div class="zone-card-header">
            <span class="zone-num" style="background-color: ${zone.colorCode};">Vùng ${zone.order}</span>
            ${statusBadge}
          </div>
          <div class="zone-title">${zone.name}</div>
          <div class="zone-subtitle">${zone.subtitle}</div>
          <div class="zone-learning">🎯 <strong>Mục tiêu:</strong> ${zone.learningFocus}</div>
          <div class="zone-card-footer">
            <div class="zone-crystal">${crystalBadge}</div>
            ${isUnlocked ? `<button class="btn-zone-enter" data-zone-id="${zone.id}">${isCompleted ? 'Chơi lại' : 'Khám phá'}</button>` : ''}
          </div>
        </div>
      `;
    }).join('');

    const finaleAvailable = canAccessGrandFinale(saveState);

    overlay.innerHTML = `
      <div class="map-select-container" role="dialog" aria-modal="true" aria-labelledby="map-select-title">
        <div class="map-select-header">
          <div>
            <h2 id="map-select-title" class="map-select-heading">🗺️ Bản Đồ Vương Quốc Cầu Vồng</h2>
            <p class="map-select-sub">Khám phá các vùng đất, thu thập 6 viên Pha Lê Diệu Kỳ!</p>
          </div>
          <button id="map-btn-close" class="modal-close-btn" aria-label="Đóng bản đồ">✕</button>
        </div>

        <div class="campaign-progress-bar-wrap">
          <div class="progress-info">
            <span>Tiến độ vương quốc: <strong>${progress.completedCount}/${progress.totalZones} vùng</strong> (${progress.percentage}%)</span>
            <span>Pha lê đã thu thập: <strong>${progress.collectedCrystals}/6 💎</strong></span>
          </div>
          <div class="campaign-progress-bar">
            <div class="progress-fill" style="width: ${progress.percentage}%;"></div>
          </div>
        </div>

        <div class="zones-grid">
          ${zonesHtml}
        </div>

        ${finaleAvailable ? `
          <div class="finale-banner-card">
            <div class="finale-text">
              <h3>🌈 ĐẠI TIỆC CẦU VỒNG ĐÃ MỞ!</h3>
              <p>Bé đã thu thập đủ cả 6 viên Pha Lê Cầu Vồng!</p>
            </div>
            <button id="btn-grand-finale" class="btn-finale-action">✨ Tham Gia Đại Tiệc ✨</button>
          </div>
        ` : ''}

        <div class="map-select-footer" style="flex-wrap:wrap;gap:10px;">
          <button id="btn-visit-pet-farm" class="btn-farm-action" type="button">🏡 Nông Trại Thú Cưng 🐰</button>
          <button id="btn-visit-fashion-street" class="btn-farm-action" type="button" style="background:linear-gradient(180deg,#c084fc 0%,#9333ea 100%);border-color:#6b21a8;">👗 Phố Thời Trang ✨</button>
          <button id="btn-visit-fishing-pond" class="btn-farm-action" type="button" style="background:linear-gradient(180deg,#38bdf8 0%,#0284c7 100%);border-color:#0369a1;">🌸 Hồ Câu Lá Sen 🎣</button>
          <button id="btn-visit-rainbow-market" class="btn-farm-action" type="button" style="background:linear-gradient(180deg,#f472b6 0%,#db2777 100%);border-color:#9d174d;">🏮 Chợ Cầu Vồng 🐚</button>
          <button id="btn-visit-kitchen" class="btn-farm-action" type="button" style="background:linear-gradient(180deg,#fbbf24 0%,#d97706 100%);border-color:#92400e;">🍳 Bếp Cầu Vồng 🍲</button>
          <button id="btn-parent-reset" class="btn-parent-action" type="button">🔒 Đặt lại dữ liệu (Dành cho Phụ huynh)</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.modalEl = overlay;

    // Gắn sự kiện đóng
    overlay.querySelector('#map-btn-close').addEventListener('click', () => {
      this.hide();
      if (this.onClose) this.onClose();
    });

    // Gắn sự kiện chọn vùng
    overlay.querySelectorAll('.btn-zone-enter, .zone-card.unlocked, .zone-card.completed').forEach(el => {
      el.addEventListener('click', (e) => {
        const zoneId = el.getAttribute('data-zone-id') || el.closest('.zone-card')?.getAttribute('data-zone-id');
        if (zoneId && unlockedMaps.includes(zoneId)) {
          this.hide();
          if (this.onSelectZone) this.onSelectZone(zoneId);
        }
      });
    });

    // Gắn sự kiện Grand Finale
    const btnFinale = overlay.querySelector('#btn-grand-finale');
    if (btnFinale) {
      btnFinale.addEventListener('click', () => {
        this.hide();
        if (this.onOpenFinale) this.onOpenFinale();
      });
    }

    // Gắn sự kiện Vào Nông Trại Thú Cưng & các khu vực đặc biệt
    const specialMapButtons = [
      ['#btn-visit-pet-farm', 'map_pet_farm'],
      ['#btn-visit-fashion-street', 'map_fashion_street'],
      ['#btn-visit-fishing-pond', 'map_fishing_pond'],
      ['#btn-visit-rainbow-market', 'map_rainbow_market'],
      ['#btn-visit-kitchen', 'map_kitchen']
    ];
    for (const [selector, mapId] of specialMapButtons) {
      const btn = overlay.querySelector(selector);
      if (btn) {
        btn.addEventListener('click', () => {
          this.hide();
          if (this.onSelectZone) this.onSelectZone(mapId);
        });
      }
    }

    // Gắn sự kiện Parental Gate Reset
    const btnReset = overlay.querySelector('#btn-parent-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (this.onResetProgress) this.onResetProgress();
      });
    }
  }

  hide() {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }

  isOpen() {
    return Boolean(this.modalEl && document.body.contains(this.modalEl));
  }
}
