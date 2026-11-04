import { shuffleQuestion } from '../../content/questions/questionBank.js';
import { getQuestion } from '../../content/questions/questionBank.js';
import { formatQuestionPromptHtml, resolveChoiceImage, resolveChoiceQuantityAndItem, escapeHtml } from './promptFormatter.js';

/**
 * Question Dialog Controller
 * Điều phối giao diện câu hỏi, nút trả lời, đọc giọng nói, nút gợi ý và hỗ trợ Boss nhiều pha.
 */

export class QuestionDialog {
  constructor(options = {}) {
    this.combatSystem = options.combatSystem;
    this.audioService = options.audioService;
    this.saveAdapter = options.saveAdapter;
    this.hudController = options.hudController;

    this.card = document.getElementById('question-card');
    this.title = document.getElementById('question-title');
    this.answerList = document.getElementById('answer-list');
    this.feedback = document.getElementById('answer-feedback');
    this.listenBtn = document.getElementById('listen-button');
    this.hintBtn = document.getElementById('hint-button');
    this.escapeBtn = document.getElementById('escape-button');
    this.restartBtn = document.getElementById('restart-button');
    this.phaseBadge = document.getElementById('question-phase-badge');
    this.stage = document.querySelector('.scene-stage');

    this.currentEncounter = null;
    this.currentQuestion = null;

    this.initEventListeners();
  }

  initEventListeners() {
    if (this.listenBtn) {
      this.listenBtn.addEventListener('click', () => {
        if (this.currentQuestion && this.audioService) {
          this.audioService.speak(this.currentQuestion.speak);
        }
      });
    }

    if (this.hintBtn) {
      this.hintBtn.addEventListener('click', () => {
        if (!this.combatSystem || !this.currentQuestion) return;
        const hintText = this.combatSystem.getHint();
        if (this.feedback) {
          this.feedback.textContent = `💡 Gợi ý: ${hintText}`;
        }
        if (this.audioService) {
          this.audioService.playChime(640, 0.12);
          this.audioService.speak(hintText);
        }
      });
    }

    if (this.escapeBtn) {
      this.escapeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => {
        this.close();
      });
    }
  }

  show(encounter, question) {
    this.currentEncounter = encounter;
    this.currentQuestion = shuffleQuestion(question);

    const startInfo = this.combatSystem ? this.combatSystem.startEncounter(encounter, question) : {};

    if (this.stage) this.stage.classList.add('battle-active');
    if (this.card) this.card.hidden = false;
    if (this.escapeBtn) this.escapeBtn.hidden = false;
    if (this.restartBtn) this.restartBtn.hidden = true;

    if (this.title) this.title.innerHTML = formatQuestionPromptHtml(question.prompt);
    if (this.feedback) this.feedback.textContent = 'Chọn đáp án bé nghĩ là đúng nhé.';

    if (this.phaseBadge) {
      if (startInfo.isBoss && startInfo.totalPhases > 1) {
        this.phaseBadge.textContent = `Pha ${startInfo.currentPhase}/${startInfo.totalPhases}`;
        this.phaseBadge.hidden = false;
      } else {
        this.phaseBadge.hidden = true;
      }
    }

    if (this.hudController) {
      this.hudController.setQuest(`Đang cùng ${encounter.name} giải đố!`);
      this.hudController.setStatus('Thử thách học tập');
    }

    this.renderAnswers(question);

    if (this.audioService) {
      if (this.audioService.isMuted()) {
        this.audioService.setSoundEnabled(true);
      }
      this.audioService.playChime(620, 0.16);
      const text = question.speak || this.audioService.cleanTextForSpeech?.(question.prompt) || question.prompt;
      setTimeout(() => {
        this.audioService.speak(text);
      }, 160);
    }
  }

  renderAnswers(question) {
    if (!this.answerList) return;
    this.answerList.replaceChildren();

    question.choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-button';

      const choiceImg = question.choiceImages?.[index] || resolveChoiceImage(choice);
      const qtyInfo = resolveChoiceQuantityAndItem(choice, question);

      if (qtyInfo) {
        const { count, itemImg, isPureNumber } = qtyInfo;
        if (itemImg) {
          button.classList.add('answer-button-quantity-mode');
          let trayHtml = '';
          for (let i = 0; i < count; i++) {
            trayHtml += `<img src="${itemImg}" class="ans-quantity-mini-img" alt="${count}">`;
          }
          button.innerHTML = `
            <div class="ans-quantity-body">
              <span class="ans-giant-number">${count}</span>
              <div class="ans-quantity-tray count-${count}">
                ${trayHtml}
              </div>
            </div>
            ${!isPureNumber ? `<span class="ans-quantity-caption">${escapeHtml(choice)}</span>` : ''}
          `;
        } else {
          button.classList.add('answer-button-number-mode');
          button.innerHTML = `
            <div class="ans-number-body">
              <span class="ans-giant-number">${count}</span>
              <div class="ans-counting-dots" aria-hidden="true">${'⭐'.repeat(Math.min(count, 10))}</div>
            </div>
            ${!isPureNumber ? `<span class="ans-quantity-caption">${escapeHtml(choice)}</span>` : ''}
          `;
        }
      } else if (choiceImg) {
        button.classList.add('answer-button-image-mode');
        button.innerHTML = `
          <div class="ans-image-frame"><img src="${choiceImg}" class="ans-image-pic" alt="${choice}"></div>
          <span class="ans-image-caption">${escapeHtml(choice)}</span>
        `;
      } else {
        button.classList.add('answer-button-text-mode');
        button.innerHTML = `<span class="ans-text">${escapeHtml(choice)}</span>`;
      }

      button.addEventListener('click', () => {
        this.handleChoice(index, button);
      });

      this.answerList.appendChild(button);
    });
  }

  handleChoice(choiceIndex, buttonEl) {
    if (!this.combatSystem) return;
    this.audioService?.playCardFlip?.();

    const result = this.combatSystem.submitAnswer(choiceIndex);

    // 1. Trả lời sai -> Khích lệ thử lại
    if (result.status === 'retry') {
      buttonEl.classList.add('try-again');
      buttonEl.disabled = true;
      if (this.feedback) this.feedback.textContent = result.message;

      if (this.audioService) {
        this.audioService.playTryAgain();
        this.audioService.speak(result.message);
      }
      return;
    }

    // 2. Boss chuyển sang Pha tiếp theo
    if (result.status === 'phase_advance') {
      buttonEl.classList.add('correct');
      [...this.answerList.children].forEach(btn => { btn.disabled = true; });

      if (this.feedback) this.feedback.textContent = result.message;
      if (this.audioService) {
        this.audioService.playSuccess();
        this.audioService.speak(result.message);
      }

      window.dispatchEvent(new CustomEvent('game:boss-phase-advance', {
        detail: { nextPhase: result.nextPhaseIndex + 1 }
      }));

      // Nạp câu hỏi của pha tiếp theo sau 1.2s
      setTimeout(() => {
        const nextPhaseConfig = this.currentEncounter.phases[result.nextPhaseIndex];
        const nextQuestion = getQuestion(nextPhaseConfig.questionId);
        this.currentQuestion = nextQuestion;
        this.combatSystem.advancePhase(nextQuestion);

        if (this.title) this.title.innerHTML = formatQuestionPromptHtml(nextQuestion.prompt);
        if (this.feedback) this.feedback.textContent = nextPhaseConfig.instruction || 'Bé hãy chọn đáp án nhé!';
        if (this.phaseBadge) {
          this.phaseBadge.textContent = `Pha ${result.nextPhaseIndex + 1}/${result.totalPhases}`;
        }
        this.renderAnswers(nextQuestion);

        if (this.audioService) {
          this.audioService.speak(nextQuestion.speak);
        }
      }, 1200);
      return;
    }

    // 3. Hoàn thành toàn bộ thử thách
    if (result.status === 'success') {
      buttonEl.classList.add('correct');
      [...this.answerList.children].forEach(btn => { btn.disabled = true; });

      if (this.feedback) this.feedback.textContent = result.message;
      if (this.hudController) {
        this.hudController.setStatus(`${this.currentEncounter.name} đã được giải cứu!`);
        this.hudController.updatePlayerHud();
        this.hudController.setProgress('Đã hoàn thành 1 thử thách');
      }

      if (this.audioService) {
        this.audioService.playSuccess();
        this.audioService.speak(result.message);
      }

      // Lưu lại tiến trình
      if (this.saveAdapter && this.combatSystem.progressionSystem) {
        this.saveAdapter.save(this.combatSystem.progressionSystem.state);
      }

      // Phát sự kiện giải cứu
      if (result.isBoss) {
        window.dispatchEvent(new CustomEvent('game:boss-resolved', {
          detail: {
            encounterId: this.currentEncounter.id,
            reward: result.reward,
            unlockedNewMap: result.unlockedNewMap,
            bossName: this.currentEncounter.name
          }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('game:encounter-resolved', {
          detail: { encounterId: this.currentEncounter.id }
        }));
      }

      // Hiển thị nút tiếp tục
      setTimeout(() => {
        if (this.card) this.card.hidden = true;
        if (this.escapeBtn) this.escapeBtn.hidden = true;
        if (this.restartBtn) this.restartBtn.hidden = false;
        if (this.stage) this.stage.classList.remove('battle-active');
      }, 1500);
    }
  }

  close() {
    if (this.card) this.card.hidden = true;
    if (this.escapeBtn) this.escapeBtn.hidden = true;
    if (this.restartBtn) this.restartBtn.hidden = true;
    if (this.stage) this.stage.classList.remove('battle-active');

    if (this.combatSystem) {
      this.combatSystem.endEncounter();
    }

    if (this.hudController) {
      this.hudController.setStatus('Khu vườn sẵn sàng');
      this.hudController.setQuest('Bé Sâu tiếp tục hành trình khám phá nhé!');
    }

    if (this.audioService) {
      this.audioService.playChime(520, 0.1);
    }

    window.dispatchEvent(new CustomEvent('game:encounter-closed'));
  }
}
