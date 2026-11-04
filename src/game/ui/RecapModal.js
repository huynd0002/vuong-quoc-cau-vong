/**
 * Recap Modal Controller
 * Màn hình vinh danh chiến thắng và tổng kết kiến thức học tập sau khi giải cứu Boss vùng.
 */

export class RecapModal {
  constructor(options = {}) {
    this.audioService = options.audioService;
    this.modal = document.getElementById('recap-modal');
    this.title = document.getElementById('recap-title');
    this.summaryList = document.getElementById('recap-summary-list');
    this.learningRecap = document.getElementById('recap-learning-text');
    this.unlockNotice = document.getElementById('recap-unlock-notice');
    this.closeBtn = document.getElementById('recap-close-button');

    this.initEventListeners();
  }

  initEventListeners() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.close();
      });
    }
  }

  show(recapData, onClose) {
    // YÊU CẦU: Bỏ hoàn toàn bảng này ở tất cả các maps
    if (this.modal) {
      this.modal.hidden = true;
      this.modal.style.display = 'none';
    }

    if (this.audioService) {
      this.audioService.playSuccess?.();
    }

    if (typeof onClose === 'function') {
      onClose();
    }
  }

  close() {
    if (this.modal) {
      this.modal.hidden = true;
    }
    if (this.audioService) {
      this.audioService.playInteract();
    }
    if (typeof this.onCloseCallback === 'function') {
      this.onCloseCallback();
      this.onCloseCallback = null;
    }
  }
}
