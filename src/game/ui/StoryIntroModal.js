/**
 * Story Intro Modal Controller
 * Giới thiệu cốt truyện ngắn đầu vùng đất bằng hình ảnh, chữ to và giọng đọc tiếng Việt.
 */

export class StoryIntroModal {
  constructor(options = {}) {
    this.audioService = options.audioService;
    this.modal = document.getElementById('story-modal');
    this.title = document.getElementById('story-title');
    this.body = document.getElementById('story-body');
    this.listenBtn = document.getElementById('story-listen-button');
    this.startBtn = document.getElementById('story-start-button');

    this.currentVoiceText = '';
    this.modal?.setAttribute('role', 'dialog');
    this.modal?.setAttribute('aria-modal', 'true');
    this.modal?.setAttribute('aria-describedby', 'story-body');
    this.modal?.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      if (this.listenBtn && e.shiftKey && document.activeElement === this.listenBtn) { e.preventDefault(); this.startBtn?.focus(); }
      else if (this.listenBtn && !e.shiftKey && document.activeElement === this.startBtn) { e.preventDefault(); this.listenBtn.focus(); }
    });
    this.initEventListeners();
  }

  initEventListeners() {
    if (this.listenBtn) {
      this.listenBtn.addEventListener('click', () => {
        if (this.currentVoiceText && this.audioService) {
          this.audioService.speak(this.currentVoiceText);
        }
      });
    }

    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => {
        this.close();
      });
    }
  }

  show(storyData, onStart) {
    // Bỏ tất cả các bảng sẵn sàng cốt truyện theo yêu cầu của người dùng
    if (this.modal) {
      this.modal.hidden = true;
      this.modal.style.display = 'none';
    }
    if (typeof onStart === 'function') {
      onStart();
    }
  }

  close() {
    if (this.modal) {
      this.modal.hidden = true;
      this.modal.style.display = 'none';
      this.previousFocus?.focus?.({ preventScroll: true });
    }
    if (this.audioService) {
      this.audioService.playInteract();
    }
    if (typeof this.onStartCallback === 'function') {
      this.onStartCallback();
      this.onStartCallback = null;
    }
  }
}
