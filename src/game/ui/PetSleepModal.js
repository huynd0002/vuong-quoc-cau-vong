/**
 * PetSleepModal
 * Hộp thoại pop-up thân thiện hỏi bé có muốn cho cún đi ngủ không
 * Khi bé bấm "Đồng ý", cún sẽ được đưa về phao ngủ ngay lập tức mà không cần đợi buồn ngủ!
 */
export class PetSleepModal {
  constructor({ audioService, onConfirm, onCancel, onWakeUp } = {}) {
    this.audioService = audioService;
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;
    this.onWakeUp = onWakeUp;
    this.modalEl = null;
    this.isOpen = false;
  }

  show({ petName = 'Bé Cún', isSleeping = false, onConfirm, onCancel, onWakeUp } = {}) {
    if (onConfirm) this.onConfirm = onConfirm;
    if (onCancel) this.onCancel = onCancel;
    if (onWakeUp) this.onWakeUp = onWakeUp;

    this.hide();
    this.isOpen = true;

    if (this.audioService) {
      this.audioService.playChime?.(650, 0.15);
      if (isSleeping) {
        this.audioService.speak?.(`${petName} đang ngủ say sưa rồi. Bé có muốn đánh thức cún dậy không?`);
      } else {
        this.audioService.speak?.(`Bé có muốn cho ${petName} đi ngủ nhé?`);
      }
    }

    const overlay = document.createElement('div');
    overlay.className = 'pet-sleep-modal-overlay';
    overlay.id = 'pet-sleep-modal';

    const cardContent = isSleeping
      ? `
        <div class="pet-sleep-card" role="dialog" aria-modal="true" aria-labelledby="pet-sleep-title">
          <div class="pet-sleep-badge">🌙 GIỜ NGHỈ NGƠI</div>
          <div class="pet-sleep-hero-icon">💤</div>
          <h2 id="pet-sleep-title" class="pet-sleep-title">${petName} đang ngủ say sưa!</h2>
          
          <div class="pet-sleep-actions">
            <button type="button" id="btn-sleep-cancel" class="pet-sleep-btn-cancel"><span>💤 Để cún ngủ tiếp</span></button>
            <button type="button" id="btn-sleep-wakeup" class="pet-sleep-btn-wakeup"><span>☀️ Đánh thức cún dậy</span></button>
          </div>
        </div>
      `
      : `
        <div class="pet-sleep-card" role="dialog" aria-modal="true" aria-labelledby="pet-sleep-title">
          <div class="pet-sleep-badge">🛏️ ĐỆM NGỦ ẤM ÁP</div>
          <div class="pet-sleep-hero-icon">🌙</div>
          <h2 id="pet-sleep-title" class="pet-sleep-title">Cho cún đi ngủ nhé?</h2>
          
          <div class="pet-sleep-actions">
            <button type="button" id="btn-sleep-cancel" class="pet-sleep-btn-cancel">Không</button>
            <button type="button" id="btn-sleep-confirm" class="pet-sleep-btn-confirm">✨ Đồng ý</button>
          </div>
        </div>
      `;

    overlay.innerHTML = cardContent;
    document.body.appendChild(overlay);
    this.modalEl = overlay;

    // Click outside overlay to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.handleCancel();
      }
    });

    const btnCancel = overlay.querySelector('#btn-sleep-cancel');
    if (btnCancel) {
      btnCancel.addEventListener('click', () => this.handleCancel());
    }

    const btnConfirm = overlay.querySelector('#btn-sleep-confirm');
    if (btnConfirm) {
      btnConfirm.addEventListener('click', () => this.handleConfirm());
    }

    const btnWakeUp = overlay.querySelector('#btn-sleep-wakeup');
    if (btnWakeUp) {
      btnWakeUp.addEventListener('click', () => this.handleWakeUp());
    }
  }

  handleConfirm() {
    if (this.audioService) {
      this.audioService.playSuccess?.();
    }
    this.hide();
    if (this.onConfirm) this.onConfirm();
  }

  handleWakeUp() {
    if (this.audioService) {
      this.audioService.playChime?.(800, 0.15);
    }
    this.hide();
    if (this.onWakeUp) this.onWakeUp();
  }

  handleCancel() {
    this.hide();
    if (this.onCancel) this.onCancel();
  }

  hide() {
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
    }
    this.modalEl = null;
    this.isOpen = false;
  }
}
