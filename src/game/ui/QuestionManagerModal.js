import { addCustomQuestion, getCustomQuestions, deleteCustomQuestion } from '../../content/questions/questionBank.js';
import { MAPS_CONFIG } from '../../content/maps/mapsConfig.js';

export const PARENTAL_SECURITY_PIN_KEY = 'RAINBOW_PARENTAL_PIN_V1';
const DEFAULT_PIN = '1234';
let inMemoryPin = DEFAULT_PIN;

export class QuestionManagerModal {
  constructor({ audioService, onQuestionAdded } = {}) {
    this.audioService = audioService;
    this.onQuestionAdded = onQuestionAdded;
    this.modalEl = null;
    this.currentTab = 'add'; // 'add' | 'list' | 'pin'
    this.selectedCorrectChoice = 0; // 0 (A) | 1 (B) | 2 (C)
    this.isUnlocked = false; // Mở khóa trong phiên làm việc
    this.fallbackChallenge = null;
  }

  getSecurityPin() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(PARENTAL_SECURITY_PIN_KEY) || inMemoryPin;
    }
    return inMemoryPin;
  }

  setSecurityPin(newPin) {
    inMemoryPin = String(newPin).trim();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PARENTAL_SECURITY_PIN_KEY, inMemoryPin);
    }
    return true;
  }

  generateFallbackMath() {
    const a = Math.floor(Math.random() * 18) + 12; // 12..29
    const b = Math.floor(Math.random() * 18) + 11; // 11..28
    this.fallbackChallenge = {
      text: `${a} + ${b} = ?`,
      answer: a + b
    };
    return this.fallbackChallenge;
  }

  show() {
    this.hide();

    const overlay = document.createElement('div');
    overlay.className = 'qm-modal-overlay';
    overlay.id = 'question-manager-modal';

    document.body.appendChild(overlay);
    this.modalEl = overlay;

    if (!this.isUnlocked) {
      this.renderPinGate();
    } else {
      this.renderEditor();
    }
  }

  hide() {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }

  // === 1. GIAO DIỆN MÃ BẢO MẬT PHỤ HUYNH / GIÁO VIÊN ===
  renderPinGate(useMathFallback = false) {
    if (!this.modalEl) return;

    if (useMathFallback) {
      const challenge = this.generateFallbackMath();
      this.modalEl.innerHTML = `
        <div class="qm-card qm-pin-card" role="dialog" aria-modal="true" aria-labelledby="qm-pin-title">
          <div class="qm-header">
            <div class="qm-header-icon">🧮</div>
            <div>
              <h2 id="qm-pin-title" class="qm-title">Xác Minh Phụ Huynh (Toán Học)</h2>
              <p class="qm-subtitle">Giải phép tính dưới đây để xác nhận quyền người lớn và vào soạn câu hỏi:</p>
            </div>
            <button class="qm-close-btn" id="qm-btn-close-pin" type="button" aria-label="Đóng">✕</button>
          </div>

          <div class="qm-math-box">
            <span class="qm-math-problem">${challenge.text}</span>
            <input type="number" id="qm-math-input" class="qm-input qm-math-input" placeholder="Nhập kết quả" autofocus />
          </div>

          <div id="qm-pin-error" class="qm-error-msg" style="display: none;">Kết quả chưa đúng, vui lòng thử lại!</div>

          <div class="qm-btn-row">
            <button id="qm-btn-back-to-pin" class="qm-btn qm-btn-secondary" type="button">Quay lại nhập mã PIN</button>
            <button id="qm-btn-submit-math" class="qm-btn qm-btn-primary" type="button">Xác Nhận & Vào Soạn Đề</button>
          </div>
        </div>
      `;

      this.modalEl.querySelector('#qm-btn-close-pin').onclick = () => this.hide();
      this.modalEl.querySelector('#qm-btn-back-to-pin').onclick = () => this.renderPinGate(false);

      const mathInput = this.modalEl.querySelector('#qm-math-input');
      const submitMath = () => {
        const val = parseInt(mathInput.value.trim(), 10);
        if (val === this.fallbackChallenge.answer) {
          this.isUnlocked = true;
          this.renderEditor();
        } else {
          const err = this.modalEl.querySelector('#qm-pin-error');
          if (err) err.style.display = 'block';
          mathInput.value = '';
          mathInput.focus();
        }
      };

      this.modalEl.querySelector('#qm-btn-submit-math').onclick = submitMath;
      mathInput.onkeydown = (e) => { if (e.key === 'Enter') submitMath(); };
      setTimeout(() => mathInput.focus(), 60);
      return;
    }

    const currentPin = this.getSecurityPin();
    const isDefault = currentPin === DEFAULT_PIN;

    this.modalEl.innerHTML = `
      <div class="qm-card qm-pin-card" role="dialog" aria-modal="true" aria-labelledby="qm-pin-title">
        <div class="qm-header">
          <div class="qm-header-icon">🔒</div>
          <div>
            <h2 id="qm-pin-title" class="qm-title">Mã Bảo Mật Phụ Huynh & Giáo Viên</h2>
            <p class="qm-subtitle">Nhập mã bảo mật để vào khu vực Quản Lý & Soạn Câu Hỏi cho bé:</p>
          </div>
          <button class="qm-close-btn" id="qm-btn-close-pin" type="button" aria-label="Đóng">✕</button>
        </div>

        <div class="qm-pin-body">
          <div class="qm-pin-input-wrap">
            <input type="password" id="qm-pin-input" class="qm-pin-input" maxlength="8" placeholder="Nhập mã PIN" autofocus autocomplete="off" />
          </div>

          <div class="qm-pin-hint">
            ${isDefault ? '💡 <strong>Mã mặc định ban đầu là: 1234</strong>. Bạn có thể đổi mã mới bất kỳ lúc nào.' : '💡 Nhập mã bảo mật bạn đã thiết lập trước đó.'}
          </div>

          <div id="qm-pin-error" class="qm-error-msg" style="display: none;">Mã bảo mật chưa chính xác, xin vui lòng thử lại!</div>

          <div class="qm-btn-row">
            <button id="qm-btn-fallback-math" class="qm-btn qm-btn-link" type="button">Quên mã? Giải phép tính phụ huynh</button>
            <button id="qm-btn-submit-pin" class="qm-btn qm-btn-primary" type="button">Mở Khóa 🔓</button>
          </div>
        </div>
      </div>
    `;

    this.modalEl.querySelector('#qm-btn-close-pin').onclick = () => this.hide();
    this.modalEl.querySelector('#qm-btn-fallback-math').onclick = () => this.renderPinGate(true);

    const pinInput = this.modalEl.querySelector('#qm-pin-input');
    const submitPin = () => {
      const entered = pinInput.value.trim();
      if (entered === this.getSecurityPin()) {
        this.isUnlocked = true;
        this.renderEditor();
      } else {
        const err = this.modalEl.querySelector('#qm-pin-error');
        if (err) err.style.display = 'block';
        pinInput.value = '';
        pinInput.focus();
      }
    };

    this.modalEl.querySelector('#qm-btn-submit-pin').onclick = submitPin;
    pinInput.onkeydown = (e) => { if (e.key === 'Enter') submitPin(); };
    setTimeout(() => pinInput.focus(), 60);
  }

  // === 2. GIAO DIỆN SOẠN VÀ QUẢN LÝ CÂU HỎI CHÍNH ===
  renderEditor() {
    if (!this.modalEl) return;

    const customQuestions = getCustomQuestions();

    this.modalEl.innerHTML = `
      <div class="qm-card qm-editor-card" role="dialog" aria-modal="true" aria-labelledby="qm-editor-title">
        <!-- Top bar của Dialog -->
        <div class="qm-header">
          <div class="qm-header-icon">📝</div>
          <div>
            <h2 id="qm-editor-title" class="qm-title">Góc Phụ Huynh: Soạn Câu Hỏi Cho Bé</h2>
            <p class="qm-subtitle">Tự do tạo câu hỏi và đáp án phù hợp với năng lực & bài học trên lớp của con</p>
          </div>
          <button class="qm-close-btn" id="qm-btn-close-editor" type="button" aria-label="Đóng">✕</button>
        </div>

        <!-- Thanh Tabs -->
        <div class="qm-tabs" role="tablist">
          <button class="qm-tab ${this.currentTab === 'add' ? 'active' : ''}" id="qm-tab-btn-add" type="button" role="tab">
            ➕ Thêm Câu Hỏi Mới
          </button>
          <button class="qm-tab ${this.currentTab === 'list' ? 'active' : ''}" id="qm-tab-btn-list" type="button" role="tab">
            📚 Câu Hỏi Đã Thêm (${customQuestions.length})
          </button>
          <button class="qm-tab ${this.currentTab === 'pin' ? 'active' : ''}" id="qm-tab-btn-pin" type="button" role="tab">
            ⚙️ Đổi Mã Bảo Mật (PIN)
          </button>
        </div>

        <!-- Vùng nội dung từng Tab -->
        <div class="qm-tab-content">
          <div id="qm-tab-pane-add" class="qm-pane ${this.currentTab === 'add' ? 'active' : ''}">
            ${this.renderAddFormHtml()}
          </div>
          <div id="qm-tab-pane-list" class="qm-pane ${this.currentTab === 'list' ? 'active' : ''}">
            ${this.renderListHtml(customQuestions)}
          </div>
          <div id="qm-tab-pane-pin" class="qm-pane ${this.currentTab === 'pin' ? 'active' : ''}">
            ${this.renderPinSettingHtml()}
          </div>
        </div>
      </div>
    `;

    this.bindEditorEvents();
  }

  renderAddFormHtml() {
    return `
      <form id="qm-form-add" class="qm-form" onsubmit="return false;">
        <div class="qm-form-row">
          <div class="qm-field-group">
            <label class="qm-label" for="qm-zone-select">1. Chọn Vùng Đất / Chủ đề kiến thức:</label>
            <select id="qm-zone-select" class="qm-select">
              <option value="map1">Vùng 1: Màu Sắc & Hình Khối (Làng Quê Yên Bình)</option>
              <option value="map2">Vùng 2: Đếm Số 1 - 10 (Vịnh Biển Pha Lê)</option>
              <option value="map3">Vùng 3: Phép Cộng Nhỏ (Động Pha Lê)</option>
              <option value="map4">Vùng 4: Phép Trừ Nhỏ (Rừng Kẹo Ngọt)</option>
              <option value="map5">Vùng 5: So Sánh & Chuỗi Quy Luật (Hẻm Núi Gió Hát)</option>
              <option value="map6">Vùng 6: Thử Thách Tổng Hợp (Cung Đình Thần Long)</option>
            </select>
          </div>
          <div class="qm-field-group">
            <label class="qm-label" for="qm-difficulty-select">Độ khó:</label>
            <select id="qm-difficulty-select" class="qm-select">
              <option value="1">Dễ (Mức 1 - Khởi động)</option>
              <option value="2" selected>Vừa (Mức 2 - Tiêu chuẩn 5-6 tuổi)</option>
              <option value="3">Nâng cao (Mức 3 - Thử thách tư duy)</option>
            </select>
          </div>
        </div>

        <div class="qm-field-group">
          <label class="qm-label" for="qm-input-prompt">2. Nội dung câu hỏi hiển thị ở giữa màn hình: <span class="qm-required">*</span></label>
          <input type="text" id="qm-input-prompt" class="qm-input" placeholder="Ví dụ: Có 3 bạn bướm, thêm 1 bạn nữa bay tới. Hỏi có mấy bạn? 🦋" required />
        </div>

        <div class="qm-field-group">
          <div class="qm-label-row">
            <label class="qm-label" for="qm-input-speak">3. Lời đọc giọng nói (TTS) cho bé nghe: <span class="qm-required">*</span></label>
            <button id="qm-btn-speak-test" class="qm-small-btn" type="button">🔊 Nghe thử giọng đọc</button>
          </div>
          <input type="text" id="qm-input-speak" class="qm-input" placeholder="Tự động điền theo câu hỏi, có thể chỉnh sửa để loa đọc truyền cảm hơn" required />
        </div>

        <div class="qm-field-group">
          <label class="qm-label">4. Nhập 3 đáp án hình tròn & Bấm chọn đáp án đúng (A, B hoặc C): <span class="qm-required">*</span></label>
          <div class="qm-choices-builder">
            <!-- Lựa chọn A -->
            <div class="qm-choice-row ${this.selectedCorrectChoice === 0 ? 'is-correct' : ''}">
              <button type="button" class="qm-correct-picker-btn ${this.selectedCorrectChoice === 0 ? 'active' : ''}" data-choice-index="0" title="Bấm để chọn đáp án này là đúng">
                ${this.selectedCorrectChoice === 0 ? '✓ ĐÚNG' : 'A'}
              </button>
              <input type="text" id="qm-choice-input-0" class="qm-input qm-choice-input" placeholder="Đáp án A (Ví dụ: 3 bạn)" required />
            </div>

            <!-- Lựa chọn B -->
            <div class="qm-choice-row ${this.selectedCorrectChoice === 1 ? 'is-correct' : ''}">
              <button type="button" class="qm-correct-picker-btn ${this.selectedCorrectChoice === 1 ? 'active' : ''}" data-choice-index="1" title="Bấm để chọn đáp án này là đúng">
                ${this.selectedCorrectChoice === 1 ? '✓ ĐÚNG' : 'B'}
              </button>
              <input type="text" id="qm-choice-input-1" class="qm-input qm-choice-input" placeholder="Đáp án B (Ví dụ: 4 bạn)" required />
            </div>

            <!-- Lựa chọn C -->
            <div class="qm-choice-row ${this.selectedCorrectChoice === 2 ? 'is-correct' : ''}">
              <button type="button" class="qm-correct-picker-btn ${this.selectedCorrectChoice === 2 ? 'active' : ''}" data-choice-index="2" title="Bấm để chọn đáp án này là đúng">
                ${this.selectedCorrectChoice === 2 ? '✓ ĐÚNG' : 'C'}
              </button>
              <input type="text" id="qm-choice-input-2" class="qm-input qm-choice-input" placeholder="Đáp án C (Ví dụ: 5 bạn)" required />
            </div>
          </div>
          <p class="qm-field-tip">👉 Bấm vào nút tròn <strong>A, B hoặc C</strong> bên trái để chọn đáp án đúng (nút có chữ <strong>✓ ĐÚNG</strong> sẽ là đáp án chính xác).</p>
        </div>

        <div class="qm-field-group">
          <label class="qm-label" for="qm-input-hint">5. Lời gợi ý cho bé (Khi bé bấm nút Gợi Ý 💡):</label>
          <input type="text" id="qm-input-hint" class="qm-input" placeholder="Ví dụ: Bé đếm 3 rồi cộng thêm 1 bạn nữa nhé!" />
        </div>

        <div id="qm-form-status" class="qm-status-msg" style="display:none;"></div>

        <div class="qm-form-actions">
          <button id="qm-btn-save-question" class="qm-btn qm-btn-success" type="button">
            💾 Lưu Câu Hỏi Vào Game
          </button>
        </div>
      </form>
    `;
  }

  renderListHtml(questions) {
    if (questions.length === 0) {
      return `
        <div class="qm-empty-box">
          <div class="qm-empty-icon">📂</div>
          <p class="qm-empty-text">Chưa có câu hỏi tự tạo nào.</p>
          <p class="qm-empty-sub">Quý phụ huynh hãy bấm qua tab <strong>"➕ Thêm Câu Hỏi Mới"</strong> để bắt đầu soạn đề cho bé nhé!</p>
          <button id="qm-btn-go-add" class="qm-btn qm-btn-primary" type="button" style="margin-top: 14px;">Bắt Đầu Thêm Câu Hỏi</button>
        </div>
      `;
    }

    const itemsHtml = questions.map((q, idx) => {
      const zoneName = MAPS_CONFIG[q.zoneId]?.name || q.zoneId || 'Vùng 1';
      return `
        <div class="qm-question-item" data-qid="${q.id}">
          <div class="qm-item-header">
            <span class="qm-badge qm-badge-zone">${zoneName}</span>
            <span class="qm-item-num">Câu #${idx + 1}</span>
            <button class="qm-btn-delete-q" data-delete-id="${q.id}" type="button" title="Xóa câu hỏi này">🗑️ Xóa</button>
          </div>
          <div class="qm-item-prompt">${q.prompt}</div>
          <div class="qm-item-choices">
            ${q.choices.map((c, cIdx) => `
              <span class="qm-item-choice ${cIdx === q.correct ? 'is-correct' : ''}">
                <span class="qm-choice-tag">${['A', 'B', 'C'][cIdx]}</span> ${c} ${cIdx === q.correct ? '✓' : ''}
              </span>
            `).join('')}
          </div>
          ${q.hint ? `<div class="qm-item-hint">💡 Gợi ý: ${q.hint}</div>` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="qm-list-wrap">
        <div class="qm-list-summary">
          <span>Tổng số câu hỏi phụ huynh đã thêm: <strong>${questions.length}</strong></span>
          <span style="font-size:12px;color:#64748b;">(Tự động xuất hiện trong các thử thách trên bản đồ)</span>
        </div>
        <div class="qm-list-scroll">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  renderPinSettingHtml() {
    return `
      <div class="qm-pin-setting-box">
        <div class="qm-field-group">
          <label class="qm-label" for="qm-current-pin-input">Mã bảo mật (PIN) hiện tại:</label>
          <input type="password" id="qm-current-pin-input" class="qm-input" maxlength="8" placeholder="Mã hiện tại (mặc định 1234)" />
        </div>

        <div class="qm-field-group">
          <label class="qm-label" for="qm-new-pin-input">Mã bảo mật mới (4 đến 8 chữ số):</label>
          <input type="password" id="qm-new-pin-input" class="qm-input" maxlength="8" placeholder="Nhập mã PIN mới" />
        </div>

        <div class="qm-field-group">
          <label class="qm-label" for="qm-confirm-pin-input">Xác nhận lại mã bảo mật mới:</label>
          <input type="password" id="qm-confirm-pin-input" class="qm-input" maxlength="8" placeholder="Nhập lại mã PIN mới" />
        </div>

        <div id="qm-pin-setting-status" class="qm-status-msg" style="display:none;"></div>

        <div class="qm-form-actions">
          <button id="qm-btn-save-pin" class="qm-btn qm-btn-primary" type="button">
            🔒 Cập Nhật Mã Bảo Mật
          </button>
        </div>
      </div>
    `;
  }

  bindEditorEvents() {
    if (!this.modalEl) return;

    // Đóng dialog
    const closeBtn = this.modalEl.querySelector('#qm-btn-close-editor');
    if (closeBtn) closeBtn.onclick = () => this.hide();

    // Chuyển Tab
    const tabAdd = this.modalEl.querySelector('#qm-tab-btn-add');
    const tabList = this.modalEl.querySelector('#qm-tab-btn-list');
    const tabPin = this.modalEl.querySelector('#qm-tab-btn-pin');

    if (tabAdd) tabAdd.onclick = () => { this.currentTab = 'add'; this.renderEditor(); };
    if (tabList) tabList.onclick = () => { this.currentTab = 'list'; this.renderEditor(); };
    if (tabPin) tabPin.onclick = () => { this.currentTab = 'pin'; this.renderEditor(); };

    // --- TAB 1: THÊM CÂU HỎI ---
    if (this.currentTab === 'add') {
      const promptInput = this.modalEl.querySelector('#qm-input-prompt');
      const speakInput = this.modalEl.querySelector('#qm-input-speak');
      const hintInput = this.modalEl.querySelector('#qm-input-hint');
      const zoneSelect = this.modalEl.querySelector('#qm-zone-select');
      const diffSelect = this.modalEl.querySelector('#qm-difficulty-select');
      const testSpeakBtn = this.modalEl.querySelector('#qm-btn-speak-test');
      const statusEl = this.modalEl.querySelector('#qm-form-status');
      const saveBtn = this.modalEl.querySelector('#qm-btn-save-question');

      // Tự động sao chép sang lời đọc nếu lời đọc chưa nhập
      if (promptInput && speakInput) {
        promptInput.addEventListener('input', () => {
          if (!speakInput.dataset.userEdited) {
            speakInput.value = promptInput.value;
          }
        });
        speakInput.addEventListener('input', () => {
          speakInput.dataset.userEdited = 'true';
        });
      }

      // Nghe thử âm thanh giọng đọc
      if (testSpeakBtn && speakInput) {
        testSpeakBtn.onclick = () => {
          const text = speakInput.value.trim() || promptInput.value.trim();
          if (text && this.audioService) {
            this.audioService.playChime(600, 0.1);
            this.audioService.speak(text);
          } else {
            alert('Vui lòng nhập nội dung câu hỏi để nghe thử nhé!');
          }
        };
      }

      // Chọn đáp án đúng A, B, C
      const pickers = this.modalEl.querySelectorAll('.qm-correct-picker-btn');
      const rows = this.modalEl.querySelectorAll('.qm-choice-row');
      pickers.forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.choiceIndex, 10);
          this.selectedCorrectChoice = idx;
          pickers.forEach((p, pIdx) => {
            const isMatch = pIdx === idx;
            p.classList.toggle('active', isMatch);
            p.textContent = isMatch ? '✓ ĐÚNG' : ['A', 'B', 'C'][pIdx];
          });
          rows.forEach((row, rIdx) => {
            row.classList.toggle('is-correct', rIdx === idx);
          });
        };
      });

      // Bấm Lưu Câu Hỏi
      if (saveBtn) {
        saveBtn.onclick = () => {
          const prompt = promptInput?.value.trim();
          const speak = speakInput?.value.trim() || prompt;
          const choice0 = this.modalEl.querySelector('#qm-choice-input-0')?.value.trim();
          const choice1 = this.modalEl.querySelector('#qm-choice-input-1')?.value.trim();
          const choice2 = this.modalEl.querySelector('#qm-choice-input-2')?.value.trim();
          const hint = hintInput?.value.trim() || 'Bé hãy quan sát thật kỹ và đếm nhé!';
          const zoneId = zoneSelect?.value || 'map1';
          const difficulty = parseInt(diffSelect?.value, 10) || 1;

          if (!prompt) {
            this.showStatus(statusEl, 'Vui lòng nhập nội dung câu hỏi!', 'error');
            promptInput?.focus();
            return;
          }

          if (!choice0 || !choice1 || !choice2) {
            this.showStatus(statusEl, 'Vui lòng điền đủ 3 đáp án A, B và C!', 'error');
            return;
          }

          const choices = [choice0, choice1, choice2];
          const skillMap = {
            map1: 'colors',
            map2: 'counting',
            map3: 'addition',
            map4: 'subtraction',
            map5: 'comparison',
            map6: 'synthesis'
          };

          const newQ = {
            zoneId,
            skillId: skillMap[zoneId] || 'colors',
            difficulty,
            prompt,
            speak,
            choices,
            correct: this.selectedCorrectChoice,
            hint
          };

          const res = addCustomQuestion(newQ);
          if (res.success) {
            this.showStatus(statusEl, '🎉 Đã lưu câu hỏi thành công! Bé sẽ được làm câu hỏi này trong game.', 'success');
            if (this.audioService) this.audioService.playSuccess();
            if (typeof this.onQuestionAdded === 'function') {
              this.onQuestionAdded(res.question);
            }
            // Reset form
            if (promptInput) promptInput.value = '';
            if (speakInput) {
              speakInput.value = '';
              delete speakInput.dataset.userEdited;
            }
            const c0 = this.modalEl.querySelector('#qm-choice-input-0');
            const c1 = this.modalEl.querySelector('#qm-choice-input-1');
            const c2 = this.modalEl.querySelector('#qm-choice-input-2');
            if (c0) c0.value = '';
            if (c1) c1.value = '';
            if (c2) c2.value = '';
            if (hintInput) hintInput.value = '';
          } else {
            const errStr = res.errors ? res.errors.join(', ') : 'Lỗi không xác định';
            this.showStatus(statusEl, `Không thể lưu câu hỏi: ${errStr}`, 'error');
          }
        };
      }
    }

    // --- TAB 2: DANH SÁCH CÂU HỎI ---
    if (this.currentTab === 'list') {
      const goAddBtn = this.modalEl.querySelector('#qm-btn-go-add');
      if (goAddBtn) {
        goAddBtn.onclick = () => { this.currentTab = 'add'; this.renderEditor(); };
      }

      const deleteBtns = this.modalEl.querySelectorAll('.qm-btn-delete-q');
      deleteBtns.forEach(btn => {
        btn.onclick = () => {
          const qid = btn.dataset.deleteId;
          if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi game?')) {
            deleteCustomQuestion(qid);
            this.renderEditor();
          }
        };
      });
    }

    // --- TAB 3: ĐỔI MÃ BẢO MẬT ---
    if (this.currentTab === 'pin') {
      const currentPinInput = this.modalEl.querySelector('#qm-current-pin-input');
      const newPinInput = this.modalEl.querySelector('#qm-new-pin-input');
      const confirmPinInput = this.modalEl.querySelector('#qm-confirm-pin-input');
      const pinStatus = this.modalEl.querySelector('#qm-pin-setting-status');
      const savePinBtn = this.modalEl.querySelector('#qm-btn-save-pin');

      if (savePinBtn) {
        savePinBtn.onclick = () => {
          const cur = currentPinInput?.value.trim();
          const n1 = newPinInput?.value.trim();
          const n2 = confirmPinInput?.value.trim();

          if (cur !== this.getSecurityPin()) {
            this.showStatus(pinStatus, 'Mã bảo mật hiện tại không đúng!', 'error');
            currentPinInput?.focus();
            return;
          }

          if (!n1 || n1.length < 4) {
            this.showStatus(pinStatus, 'Mã bảo mật mới phải có ít nhất 4 ký tự/chữ số!', 'error');
            newPinInput?.focus();
            return;
          }

          if (n1 !== n2) {
            this.showStatus(pinStatus, 'Xác nhận mã bảo mật mới không khớp!', 'error');
            confirmPinInput?.focus();
            return;
          }

          this.setSecurityPin(n1);
          this.showStatus(pinStatus, '🔒 Đã cập nhật mã bảo mật mới thành công!', 'success');
          if (this.audioService) this.audioService.playSuccess();
          if (currentPinInput) currentPinInput.value = '';
          if (newPinInput) newPinInput.value = '';
          if (confirmPinInput) confirmPinInput.value = '';
        };
      }
    }
  }

  showStatus(el, text, type) {
    if (!el) return;
    el.style.display = 'block';
    el.className = `qm-status-msg qm-status-${type}`;
    el.textContent = text;
  }
}
