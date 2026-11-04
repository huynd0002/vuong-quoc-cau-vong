/**
 * Combat & Challenge System (Turn-based Child-Safe)
 * Quản lý logic thử thách câu hỏi:
 * - Không có Game Over
 * - Trả lời sai được thử lại ngay và nhận gợi ý
 * - Hỗ trợ Boss nhiều pha hình ảnh (Multi-phase Boss)
 * - Trả lời đúng hoàn thành giải cứu và nhận thưởng
 */

export class CombatSystem {
  constructor(options = {}) {
    this.petSystem = options.petSystem || null;
    this.progressionSystem = options.progressionSystem || null;
    this.currentEncounter = null;
    this.currentQuestion = null;
    this.answered = false;
    this.attempts = 0;
    this.currentPhaseIndex = 0;
    this.totalPhases = 1;
  }

  startEncounter(encounter, question) {
    this.currentEncounter = encounter;
    this.currentQuestion = question;
    this.answered = false;
    this.attempts = 0;

    // Thiết lập pha nếu là Boss
    if (encounter.phases && Array.isArray(encounter.phases) && encounter.phases.length > 0) {
      this.currentPhaseIndex = 0;
      this.totalPhases = encounter.phases.length;
    } else {
      this.currentPhaseIndex = 0;
      this.totalPhases = 1;
    }

    return {
      encounterName: encounter.name,
      prompt: question.prompt,
      speak: question.speak,
      choices: question.choices,
      hint: question.hint,
      isBoss: Boolean(encounter.phases),
      currentPhase: this.currentPhaseIndex + 1,
      totalPhases: this.totalPhases
    };
  }

  getHint() {
    return this.currentQuestion ? this.currentQuestion.hint : 'Bé hãy quan sát thật kỹ các đáp án nhé!';
  }

  advancePhase(nextQuestion) {
    this.currentPhaseIndex += 1;
    this.currentQuestion = nextQuestion;
    this.answered = false;
    this.attempts = 0;

    return {
      currentPhase: this.currentPhaseIndex + 1,
      totalPhases: this.totalPhases,
      prompt: nextQuestion.prompt,
      speak: nextQuestion.speak,
      choices: nextQuestion.choices,
      hint: nextQuestion.hint
    };
  }

  submitAnswer(choiceIndex) {
    if (!this.currentQuestion) {
      return { status: 'error', message: 'Không có thử thách nào đang diễn ra' };
    }

    this.attempts += 1;
    const isCorrect = choiceIndex === this.currentQuestion.correct;

    if (!isCorrect) {
      return {
        status: 'retry',
        isCorrect: false,
        message: 'Chưa đúng cũng không sao, bé thử đáp án khác nhé!',
        hint: this.currentQuestion.hint,
        canRetry: true
      };
    }

    // Trả lời đúng
    this.answered = true;

    // Kiểm tra nếu là Boss và còn pha tiếp theo
    const isMultiPhaseBoss = this.currentEncounter?.phases && this.currentPhaseIndex + 1 < this.totalPhases;

    if (isMultiPhaseBoss) {
      return {
        status: 'phase_advance',
        isCorrect: true,
        message: 'Nấm Mũ Đỏ đã thức giấc rồi! Cùng trả lời câu hỏi quyết định để giải cứu bạn nhé!',
        nextPhaseIndex: this.currentPhaseIndex + 1,
        totalPhases: this.totalPhases
      };
    }

    // Hoàn thành toàn bộ thử thách (hoặc đã xong pha cuối của Boss)
    let rewardResult = null;
    let unlockedNewMap = null;

    if (this.progressionSystem && this.currentEncounter) {
      const reward = this.currentEncounter.reward || { stars: 1, exp: 10 };
      rewardResult = this.progressionSystem.addReward(reward);
      this.progressionSystem.rescueFriend(this.currentEncounter.id, this.currentEncounter.name);

      if (reward.unlockMap) {
        this.progressionSystem.unlockMap(reward.unlockMap);
        unlockedNewMap = reward.unlockMap;
      }
    }

    if (this.petSystem) {
      this.petSystem.addExp(5);
    }

    return {
      status: 'success',
      isCorrect: true,
      isBoss: Boolean(this.currentEncounter?.phases),
      message: `Tuyệt vời! Bé đã giúp ${this.currentEncounter.name} nhớ lại rồi!`,
      reward: rewardResult,
      unlockedNewMap,
      friendName: this.currentEncounter.name
    };
  }

  endEncounter() {
    const enc = this.currentEncounter;
    this.currentEncounter = null;
    this.currentQuestion = null;
    this.answered = false;
    this.attempts = 0;
    this.currentPhaseIndex = 0;
    this.totalPhases = 1;
    return enc;
  }
}
