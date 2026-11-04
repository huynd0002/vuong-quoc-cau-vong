/**
 * Parental Gate Modal
 * Hộp thoại bảo vệ người lớn: Đảm bảo trẻ 5-6 tuổi không vô tình xóa dữ liệu chơi hoặc thay đổi cài đặt sâu.
 * Yêu cầu giải phép tính số học dành cho người lớn trước khi thực hiện hành động nhạy cảm.
 */

export class ParentalGateModal {
  constructor({ onConfirm, onCancel } = {}) {
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;
    this.modalEl = null;
    this.expectedAnswer = null;
  }

  generateChallenge() {
    // Tạo phép tính ngẫu nhiên đủ khó cho trẻ 5 tuổi nhưng đơn giản cho người lớn
    const type = Math.random() > 0.5 ? 'add' : 'mult';
    if (type === 'add') {
      const a = Math.floor(Math.random() * 20) + 12; // 12..31
      const b = Math.floor(Math.random() * 20) + 11; // 11..30
      this.expectedAnswer = a + b;
      return { questionText: `${a} + ${b} = ?`, answer: this.expectedAnswer };
    } else {
      const a = Math.floor(Math.random() * 5) + 3;  // 3..7
      const b = Math.floor(Math.random() * 6) + 4;  // 4..9
      this.expectedAnswer = a * b;
      return { questionText: `${a} × ${b} = ?`, answer: this.expectedAnswer };
    }
  }

  show({ title = 'Xác nhận của Phụ huynh', description = 'Hành động này sẽ xóa toàn bộ dữ liệu chơi và bắt đầu lại từ đầu.', actionLabel = 'Đặt lại dữ liệu', onConfirm } = {}) {
    if (onConfirm) this.onConfirm = onConfirm;
    this.hide();

    const challenge = this.generateChallenge();

    const overlay = document.createElement('div');
    overlay.className = 'parental-gate-overlay';
    overlay.id = 'parental-gate-modal';

    overlay.innerHTML = `
      <div class="parental-gate-sheet" role="dialog" aria-modal="true" aria-labelledby="gate-title">
        <div class="gate-header">
          <div class="gate-icon">🔒</div>
          <h2 id="gate-title" class="gate-title">${title}</h2>
        </div>
        <p class="gate-desc">${description}</p>
        
        <div class="gate-challenge-box">
          <div class="gate-instruction">Dành riêng cho Phụ huynh — Hãy giải phép tính sau:</div>
          <div class="gate-math-problem" id="gate-problem">${challenge.questionText}</div>
          <input type="number" id="gate-answer-input" class="gate-input" placeholder="Nhập kết quả" autofocus />
          <div id="gate-error" class="gate-error" style="display: none;">Kết quả chưa đúng, vui lòng thử lại!</div>
        </div>

        <div class="gate-actions">
          <button id="gate-btn-cancel" class="gate-btn-secondary" type="button">Hủy bỏ</button>
          <button id="gate-btn-confirm" class="gate-btn-danger" type="button">${actionLabel}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.modalEl = overlay;

    const inputEl = overlay.querySelector('#gate-answer-input');
    const errorEl = overlay.querySelector('#gate-error');
    const btnCancel = overlay.querySelector('#gate-btn-cancel');
    const btnConfirm = overlay.querySelector('#gate-btn-confirm');

    btnCancel.addEventListener('click', () => {
      this.hide();
      if (this.onCancel) this.onCancel();
    });

    const verifyAndExecute = () => {
      const val = parseInt(inputEl.value.trim(), 10);
      if (val === this.expectedAnswer) {
        this.hide();
        if (this.onConfirm) this.onConfirm();
      } else {
        errorEl.style.display = 'block';
        inputEl.value = '';
        inputEl.focus();
        // Sinh lại câu đố mới
        const nextChallenge = this.generateChallenge();
        const problemEl = overlay.querySelector('#gate-problem');
        if (problemEl) problemEl.textContent = nextChallenge.questionText;
      }
    };

    btnConfirm.addEventListener('click', verifyAndExecute);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') verifyAndExecute();
    });

    setTimeout(() => {
      if (inputEl) inputEl.focus();
    }, 50);
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
