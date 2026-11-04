/**
 * Grand Finale Modal
 * Màn hình vinh danh Đại Tiệc Cầu Vồng Khải Hoàn khi bé hoàn thành xuất sắc cả 6 vùng đất.
 */

import { GRAND_FINALE } from '../../content/campaign/campaignGraph.js';

export class GrandFinaleModal {
  constructor({ onClose, onContinueExplore } = {}) {
    this.onClose = onClose;
    this.onContinueExplore = onContinueExplore;
    this.modalEl = null;
  }

  show(saveState) {
    this.hide();

    const player = saveState?.player || {};
    const learningStats = saveState?.campaign?.learningStats || {};
    const totalAnswers = learningStats.totalAnswers || 0;
    const firstTryCount = learningStats.firstTryCount || 0;
    const accuracy = totalAnswers > 0 ? Math.round((firstTryCount / totalAnswers) * 100) : 100;

    const overlay = document.createElement('div');
    overlay.className = 'grand-finale-overlay';
    overlay.id = 'grand-finale-modal';

    overlay.innerHTML = `
      <div class="grand-finale-container" role="dialog" aria-modal="true" aria-labelledby="finale-title">
        <div class="confetti-cannon">🎉 🌈 ✨ 🌟 🎈 🎊</div>
        
        <div class="finale-header">
          <div class="finale-rainbow-crown">👑</div>
          <h1 id="finale-title" class="finale-heading">${GRAND_FINALE.title}</h1>
          <p class="finale-sub">${GRAND_FINALE.subtitle}</p>
        </div>

        <div class="finale-crystals-row">
          <div class="crystal-slot active" title="Pha Lê Đỏ">🔴</div>
          <div class="crystal-slot active" title="Pha Lê Cam">🟠</div>
          <div class="crystal-slot active" title="Pha Lê Vàng">🟡</div>
          <div class="crystal-slot active" title="Pha Lê Xanh Lá">🟢</div>
          <div class="crystal-slot active" title="Pha Lê Lam">🔵</div>
          <div class="crystal-slot active" title="Pha Lê Tím">🟣</div>
        </div>

        <p class="finale-congrats-text">${GRAND_FINALE.message}</p>

        <div class="finale-stats-card">
          <div class="stat-pill">
            <span class="stat-icon">⭐</span>
            <span class="stat-value">${player.stars || 0}</span>
            <span class="stat-label">Sao Cầu Vồng</span>
          </div>
          <div class="stat-pill">
            <span class="stat-icon">🏆</span>
            <span class="stat-value">Cấp ${player.level || 1}</span>
            <span class="stat-label">Bé Sâu Dũng Cảm</span>
          </div>
          <div class="stat-pill">
            <span class="stat-icon">💡</span>
            <span class="stat-value">${totalAnswers}</span>
            <span class="stat-label">Câu đố hoàn thành</span>
          </div>
          <div class="stat-pill">
            <span class="stat-icon">🎯</span>
            <span class="stat-value">${accuracy}%</span>
            <span class="stat-label">Chính xác xuất sắc</span>
          </div>
        </div>

        <div class="finale-character-celebrate">
          <span class="char-icon">🐛</span>
          <span class="char-balloon">"Cảm ơn bé đã cùng Bé Sâu và Thỏ Bông khôi phục vương quốc rực rỡ!"</span>
          <span class="char-icon">🐰</span>
        </div>

        <div class="finale-actions">
          <button id="finale-btn-explore" class="btn-finale-primary" type="button">🌈 Bé Sẵn Sàng ✨</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.modalEl = overlay;

    overlay.querySelector('#finale-btn-explore').addEventListener('click', () => {
      this.hide();
      if (this.onContinueExplore) this.onContinueExplore();
      else if (this.onClose) this.onClose();
    });
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
