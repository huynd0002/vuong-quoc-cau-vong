/**
 * src/game/ui/FishingModal.js
 * Hồ Câu Lá Sen — Trải nghiệm câu cá đầy đủ 6 bước, Góc Chuẩn Bị & Giỏ Cá, Chú Rái Cá Tập Câu (FISHING_PLAN v2.0)
 */

import {
  FISHING_LIMITS,
  DOCKS,
  RODS,
  BAITS,
  getFishSpecies,
  getRod,
  getBait,
  getDock,
  getFishSizeLabel,
  calculateFishSellPrice,
  calculateFishPortions
} from '../../content/fishing/fishingData.js';

export class FishingModal {
  constructor({
    fishingSystem,
    audioService,
    onOpenFishBook = null,
    onNavigateMap = null,
    onClose = () => {}
  }) {
    this.fishingSystem = fishingSystem;
    this.audioService = audioService;
    this.onOpenFishBook = onOpenFishBook;
    this.onNavigateMap = onNavigateMap;
    this.onClose = onClose;

    this.activeTab = 'fishing'; // 'fishing' | 'prep_basket' | 'otter_guide'
    this.phase = 'ready'; // 'ready' | 'cast' | 'waiting' | 'hook' | 'pull' | 'caught' | 'missed'
    this.isPaused = false;
    this.resumeCountdown = 0;

    // Rhythm & turn runtime state
    this.pointerPos = 0.5; // 0..1
    this.pointerDir = 1;
    this.sweepCycle = 0;
    this.lastEvaluatedCycle = -1;
    this.lastTapTimestamp = 0;

    this.castPerfect = false;
    this.fakeNibblesRemaining = 1;
    this.isFakeNibbling = false;
    this.currentSpecies = null;
    this.currentWeightG = 250;

    // Pull state
    this.pullProgress = 0;
    this.pullTargetStages = 2;
    this.pullStrikes = 0;
    this.fishPullState = 'rest'; // 'rest' | 'splash'
    this.pullElapsedMs = 0;
    this.stateTimerMs = 0;
    this.hookRemainingMs = 0;

    this.lastCatchSummary = null;
    this.lastMissMessage = null;
    this.voiceBannerText = 'Bé chọn Bến Câu rồi bấm Thả Câu nhé!';
    this.petReactionText = '🐶 Cún con ngồi ngoan bên cạnh nhìn phao cùng bé!';

    this.rafId = null;
    this.lastFrameTime = 0;
    this.waitTimeoutIds = [];
    this.keydownHandler = null;
    this.root = null;
  }

  open({ tab = 'fishing', dockId = null } = {}) {
    if (dockId) {
      this.fishingSystem.setActiveDock(dockId);
    }
    const state = this.fishingSystem.getState();
    if (!state.starterBorrowed || state.ownedRods.length === 0) {
      this.fishingSystem.borrowStarterKit();
    }

    this.activeTab = ['fishing', 'prep_basket', 'otter_guide'].includes(tab) ? tab : 'fishing';
    this._resetTurnRuntime();
    this._mount();
    this._bindKeyboard();

    const dock = getDock(this.fishingSystem.getState().activeDock);
    if (this.activeTab === 'fishing') {
      this.voiceBannerText = dock.voiceIntro;
      this._speak(dock.voiceIntro);
    } else if (this.activeTab === 'prep_basket') {
      this._speak('Góc chuẩn bị và Giỏ Cá ở Nhà Hồ Câu! Bé có thể đổi cần, gắn mồi hoặc xem cá trong giỏ nhé!');
    } else {
      this._speak('Chú Rái Cá chào bé! Bé nhớ nhìn phao lún sâu mới giật, khi cá quẫy thì nghỉ tay nhé!');
    }
  }

  close() {
    this._clearTimersAndLoop();
    this._unbindKeyboard();
    // Nếu đang ở bước trước khi cá cắn thật, hoàn lại mồi an toàn
    const st = this.fishingSystem.getState();
    if (st.activeTurn && !st.activeTurn.biteCommitted) {
      this.fishingSystem.cancelTurnBeforeBite();
    }
    if (this.root) {
      this.root.remove();
      this.root = null;
    }
    if (typeof this.onClose === 'function') {
      this.onClose();
    }
  }

  _speak(text) {
    if (this.audioService && typeof this.audioService.speak === 'function') {
      this.audioService.speak(text);
    }
  }

  _playSfx(name) {
    if (this.audioService && typeof this.audioService.playSfx === 'function') {
      this.audioService.playSfx(name);
    }
  }

  _clearTimersAndLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    for (const tid of this.waitTimeoutIds) {
      clearTimeout(tid);
    }
    this.waitTimeoutIds = [];
  }

  _resetTurnRuntime() {
    this._clearTimersAndLoop();
    this.phase = 'ready';
    this.isPaused = false;
    this.resumeCountdown = 0;
    this.pointerPos = 0.15;
    this.pointerDir = 1;
    this.sweepCycle = 0;
    this.lastEvaluatedCycle = -1;
    this.castPerfect = false;
    this.isFakeNibbling = false;
    this.pullProgress = 0;
    this.pullStrikes = 0;
    this.fishPullState = 'rest';
    this.pullElapsedMs = 0;
  }

  _getGreenZoneBounds(state, isCast = false) {
    const rod = getRod(state.equippedRod) || RODS[0];
    const baseWidth = isCast
      ? 0.36
      : this.currentSpecies?.greenZoneRatio || 0.32;
    const rodBonus = isCast ? rod.castZoneBonus : rod.pullZoneBonus;
    const assistBonus = state.assistMode ? 0.10 : 0;
    const diffBonus =
      state.difficultyMode === 'easy'
        ? 0.08
        : state.difficultyMode === 'confident'
        ? -0.03
        : 0;

    const width = Math.max(0.24, Math.min(0.62, baseWidth + rodBonus + assistBonus + diffBonus));
    const start = 0.5 - width / 2;
    const end = 0.5 + width / 2;
    return { start, end, width };
  }

  _getSweepSpeedPerMs(state) {
    const baseDuration = this.currentSpecies?.sweepDurationMs || 2200;
    const assistFactor = state.assistMode ? 0.75 : 1.0;
    const diffFactor =
      state.difficultyMode === 'easy'
        ? 0.8
        : state.difficultyMode === 'confident'
        ? 1.12
        : 1.0;
    return (1 / baseDuration) * assistFactor * diffFactor;
  }

  /**
   * Bước 1 & 2: Bắt đầu lượt câu -> chuyển sang Canh Thả Phao
   */
  startCastPhase() {
    const state = this.fishingSystem.getState();
    const res = this.fishingSystem.startFishingTurn(state.activeDock);
    if (!res.ok) {
      if (res.reason === 'basket_full') {
        this.voiceBannerText =
          'Túi đầy rồi không thể câu cá nữa, bé hãy đi đổi cá nhé!';
        this._speak(this.voiceBannerText);
        window.dispatchEvent(new CustomEvent('game:basket-full-notice'));
        this._render();
      }
      return;
    }

    this._resetTurnRuntime();
    this.phase = 'cast';
    this.voiceBannerText =
      '🌸 Bước 1: Khi vạch chạy vào vùng Lá Sen Xanh ở giữa, bé bấm "THẢ PHAO" nhé!';
    this.petReactionText = '🐶 Cún vẫy đuôi cổ vũ bé canh thả phao!';
    this._speak('Bé canh vạch vào vùng lá sen xanh rồi bấm thả phao nhé!');
    this._render();
    this._startAnimationLoop();
  }

  /**
   * Xử lý khi bé bấm nút THẢ PHAO ở Bước 2
   */
  handleCastAction() {
    if (this.phase !== 'cast') return;
    const state = this.fishingSystem.getState();
    const zone = this._getGreenZoneBounds(state, true);
    this.castPerfect = this.pointerPos >= zone.start && this.pointerPos <= zone.end;

    this._playSfx(this.castPerfect ? 'correct' : 'click');
    this._enterWaitingPhase();
  }

  /**
   * Bước 3: Chờ cá & hiển thị Rỉa Thử trước khi Cá Cắn Thật
   */
  _enterWaitingPhase() {
    this._clearTimersAndLoop();
    this.phase = 'waiting';
    this.isFakeNibbling = false;

    const state = this.fishingSystem.getState();
    const isTutorial = !state.tutorialCompleted;
    const nibbleCount = isTutorial ? 1 : 1 + Math.floor(Math.random() * 2); // 1-2 lần rỉa thử
    this.fakeNibblesRemaining = nibbleCount;

    this.voiceBannerText = this.castPerfect
      ? '✨ Thả phao chuẩn vùng Lá Sen! Mặt nước gợn sóng đẹp quá, cùng chờ cá nhé!'
      : '🌊 Phao đã xuống nước êm ả! Bé nhìn kỹ phao nhé: rung nhẹ là cá rỉa thử, lún sâu mới giật!';
    this.petReactionText = '🐶 Suỵt... Cún ngồi im chăm chú nhìn phao nước!';
    this._render();

    const baseStepMs = this.castPerfect ? 1200 : 1650;
    for (let i = 0; i < nibbleCount; i++) {
      const tid = setTimeout(() => {
        if (this.phase !== 'waiting') return;
        this.isFakeNibbling = true;
        this.voiceBannerText =
          '💧 RỈA THỬ: Phao chỉ rung nhẹ thôi, cá đang thăm dò đấy, bé đừng giật vội nhé!';
        this.petReactionText = '🐾 Cún nghiêng đầu: "Chờ chút nữa bé ơi!"';
        this._playSfx('click');
        this._render();

        const stopTid = setTimeout(() => {
          if (this.phase !== 'waiting') return;
          this.isFakeNibbling = false;
          this._render();
        }, 700);
        this.waitTimeoutIds.push(stopTid);
      }, baseStepMs * (i + 1));
      this.waitTimeoutIds.push(tid);
    }

    const biteDelayMs = baseStepMs * (nibbleCount + 1) + 450;
    const biteTid = setTimeout(() => {
      if (this.phase !== 'waiting') return;
      this._triggerRealBite();
    }, biteDelayMs);
    this.waitTimeoutIds.push(biteTid);
  }

  /**
   * Bước 4: Cá cắn thật! Khóa loài cá & cân nặng, mở cửa sổ Giật Cần (2.2s - 3.0s)
   */
  _triggerRealBite() {
    this._clearTimersAndLoop();
    const res = this.fishingSystem.commitRealBite(this.castPerfect);
    if (!res.ok) {
      this._resetTurnRuntime();
      this._render();
      return;
    }

    this.phase = 'hook';
    this.currentSpecies = res.species;
    this.currentWeightG = res.weightG;

    const state = this.fishingSystem.getState();
    const hookWindow =
      state.assistMode || state.difficultyMode === 'easy'
        ? FISHING_LIMITS.HOOK_WINDOW_ASSIST_MS
        : FISHING_LIMITS.HOOK_WINDOW_MS;
    this.hookRemainingMs = hookWindow;

    this.voiceBannerText = '🎯 CÁ CẮN THẬT RỒI! Phao lún sâu kìa, bé bấm GIẬT CẦN NGAY!';
    this.petReactionText = '🐶 Gâu gâu! Cá cắn câu rồi, giật cần ngay bé ơi!';
    this._playSfx('correct');
    this._speak('Cá cắn câu rồi! Giật cần ngay!');
    this._render();
    this._startAnimationLoop();
  }

  /**
   * Khi bé bấm GIẬT CẦN trong Bước 4 -> Chuyển sang Bước 5 (Kéo cá theo nhịp)
   */
  handleHookAction() {
    if (this.phase !== 'hook') return;
    this._playSfx('correct');
    this.phase = 'pull';
    this.pullProgress = 0;
    this.pullStrikes = 0;
    this.pullTargetStages = this.currentSpecies?.pullStages || 2;
    this.fishPullState = 'rest';
    this.pullElapsedMs = 0;
    this.stateTimerMs = 2600;
    this.pointerPos = 0.15;
    this.pointerDir = 1;
    this.sweepCycle = 0;
    this.lastEvaluatedCycle = -1;

    this.voiceBannerText = `🎣 Bước 5: Khi cá đứng yên, đợi vạch vào vùng Xanh rồi bấm KÉO! (Cần ${this.pullTargetStages} nhịp)`;
    this.petReactionText = '🐶 Cún cổ vũ: "Kéo đều tay khi vùng xanh sáng nhé!"';
    this._render();
  }

  /**
   * Xử lý khi bé bấm nút trong Bước 5 (Kéo cá):
   * - Có debounce 350ms
   * - Nếu cá đang quẫy (splash): tính 1 lỗi lệch nhịp
   * - Nếu cá đang nghỉ (rest): chỉ chấm lần chạm đầu tiên trong mỗi chu kỳ quét
   */
  handlePullAction() {
    if (this.phase !== 'pull' || this.isPaused) return;
    const now = performance.now();
    if (now - this.lastTapTimestamp < FISHING_LIMITS.INPUT_DEBOUNCE_MS) {
      return; // Chống bấm liên hồi (anti-spam debounce 350ms)
    }
    this.lastTapTimestamp = now;

    if (this.fishPullState === 'splash') {
      this.pullStrikes += 1;
      this._playSfx('wrong');
      this.voiceBannerText = `✋ Ấy, cá đang quẫy mạnh! Khi cá quẫy bé nhớ NGHỈ TAY nhé! (${this.pullStrikes}/${FISHING_LIMITS.MAX_PULL_STRIKES})`;
      this.petReactionText = '🐾 Cún lấy chân che mắt: "Khi cá quẫy mình nghỉ tay một nhịp nha!"';
      if (this.pullStrikes >= FISHING_LIMITS.MAX_PULL_STRIKES) {
        this._handleFishEscaped('Cá quẫy tuột khỏi lưỡi câu rồi, lần sau khi cá quẫy bé nhớ nghỉ tay một nhịp nhé!');
        return;
      }
      this._render();
      return;
    }

    // Chỉ chấm 1 lần cho mỗi chu kỳ quét
    if (this.lastEvaluatedCycle === this.sweepCycle) {
      return;
    }
    this.lastEvaluatedCycle = this.sweepCycle;

    const state = this.fishingSystem.getState();
    const zone = this._getGreenZoneBounds(state, false);
    const inZone = this.pointerPos >= zone.start && this.pointerPos <= zone.end;

    if (inZone) {
      this._advancePullStage();
    } else {
      this.pullStrikes += 1;
      this._playSfx('wrong');
      this.voiceBannerText = `🌱 Hơi lệch vùng xanh một chút! Bé đợi vạch chạy vào giữa vùng Lá Sen Xanh rồi bấm nhé!`;
      if (this.pullStrikes >= FISHING_LIMITS.MAX_PULL_STRIKES) {
        this._handleFishEscaped('Cá bơi đi mất rồi, mình thử lại và canh đúng vùng xanh nhé!');
        return;
      }
      this._render();
    }
  }

  _advancePullStage(byCoPull = false) {
    this.pullProgress += 1;
    this._playSfx('correct');
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(38);
      }
    } catch (e) {}

    if (this.pullProgress >= this.pullTargetStages) {
      this._handleFishCaught();
      return;
    }

    this.voiceBannerText = byCoPull
      ? `🤝 Chú Rái Cá cùng kéo giúp bé! Đã được ${this.pullProgress}/${this.pullTargetStages} nhịp!`
      : `🌟 Kéo chuẩn nhịp! Đã được ${this.pullProgress}/${this.pullTargetStages} nhịp!`;
    this.petReactionText = '🐶 Gâu! Sắp kéo được bạn cá lên bờ rồi!';

    // Có xác suất chuyển sang nhịp cá quẫy ngắn để bé thực hành "Nghỉ tay"
    const splashChance = this.currentSpecies?.splashChance || 0.25;
    if (Math.random() < splashChance) {
      this.fishPullState = 'splash';
      this.stateTimerMs = this.currentSpecies?.splashDurationMs || 1200;
      this.voiceBannerText = '✋ CÁ ĐANG QUẪY! Bé NGHỈ TAY 1 giây chờ cá êm lại nhé!';
      this.petReactionText = '🐾 Cún giơ biển: "NGHỈ TAY — Đừng bấm khi cá quẫy nhé!"';
    } else {
      this.fishPullState = 'rest';
      this.stateTimerMs = 2600;
    }
    this._render();
  }

  _handleFishCaught() {
    this._clearTimersAndLoop();
    // Mặc định ghi nhận vào giỏ để bé có thể chọn Giữ nấu ăn hoặc Thả ngay trên thẻ kết quả
    const res = this.fishingSystem.recordTurnCatch({ keepForCooking: false, releaseImmediately: false });
    if (!res.ok) {
      this._resetTurnRuntime();
      this._render();
      return;
    }

    this.phase = 'caught';
    this.lastCatchSummary = res;
    const sizeLabel = getFishSizeLabel(res.weightG);
    if (res.isSpecial || res.isGlow) {
      this.voiceBannerText = `✨ Hoan hô! Bé câu được Cá Đặc Biệt ${res.species.name} phát sáng lung linh (chỉ có 1 con duy nhất)!`;
    } else if (res.isStacked) {
      this.voiceBannerText = `🧺 Tuyệt vời! Bạn ${res.species.name} đã được xếp chồng vào giỏ: x${res.count}/${res.maxStack} con!`;
    } else {
      this.voiceBannerText = `🎉 Hoan hô! Bé câu được ${res.species.name} nặng ${res.weightG} gam (${sizeLabel})!`;
    }
    this.petReactionText = `🐶 Cún nhảy tưng bừng: "${res.species.name} nặng ${res.weightG} gam tuyệt quá!"`;
    this._playSfx('victory');
    this._speak(`Hoan hô! Bé câu được ${res.species.name}, nặng ${res.weightG} gam, ${sizeLabel}!`);
    this._render();
  }

  _handleFishEscaped(message) {
    this._clearTimersAndLoop();
    const res = this.fishingSystem.recordTurnMiss('escaped');
    this.phase = 'missed';
    this.lastMissMessage = message;
    this.voiceBannerText = `💙 ${message}`;
    this.petReactionText = '🐶 Cún dụi đầu an ủi bé: "Không sao đâu, mình thả phao thử lại nhé!"';
    this._speak(message);
    this._render();
  }

  /**
   * Tạm dừng & đếm ngược 3-2-1 khi quay lại (FISHING_PLAN 5.6)
   */
  togglePauseTurn() {
    if (!['cast', 'hook', 'pull'].includes(this.phase)) return;
    if (!this.isPaused) {
      this.isPaused = true;
      this.resumeCountdown = 0;
      this._render();
    } else {
      this.resumeCountdown = 3;
      this._render();
      const tick = () => {
        if (!this.isPaused) return;
        this.resumeCountdown -= 1;
        if (this.resumeCountdown <= 0) {
          this.isPaused = false;
          this.lastFrameTime = performance.now();
          this._render();
        } else {
          this._render();
          const tid = setTimeout(tick, 750);
          this.waitTimeoutIds.push(tid);
        }
      };
      const tid = setTimeout(tick, 750);
      this.waitTimeoutIds.push(tid);
    }
  }

  _startAnimationLoop() {
    this.lastFrameTime = performance.now();
    const step = (now) => {
      if (!this.root) return;
      const dt = Math.min(80, Math.max(0, now - this.lastFrameTime));
      this.lastFrameTime = now;

      if (!this.isPaused) {
        this._updateTurnTick(dt);
      }

      if (['cast', 'hook', 'pull'].includes(this.phase)) {
        this.rafId = requestAnimationFrame(step);
      }
    };
    this.rafId = requestAnimationFrame(step);
  }

  _updateTurnTick(dt) {
    const state = this.fishingSystem.getState();

    if (this.phase === 'cast' || (this.phase === 'pull' && this.fishPullState === 'rest')) {
      const speed = this._getSweepSpeedPerMs(state);
      this.pointerPos += this.pointerDir * speed * dt;
      if (this.pointerPos >= 1) {
        this.pointerPos = 1;
        this.pointerDir = -1;
        this.sweepCycle += 1;
      } else if (this.pointerPos <= 0) {
        this.pointerPos = 0;
        this.pointerDir = 1;
        this.sweepCycle += 1;
      }

      // Chế độ Cùng Kéo (Co-Pull): Khi vạch đi vào giữa vùng xanh ở bước Kéo, tự động trợ lực hoàn thành nhịp!
      if (
        this.phase === 'pull' &&
        state.coPullMode &&
        this.lastEvaluatedCycle !== this.sweepCycle &&
        Math.abs(this.pointerPos - 0.5) < 0.04
      ) {
        this.lastEvaluatedCycle = this.sweepCycle;
        this._advancePullStage(true);
        return;
      }

      const pointerEl = this.root?.querySelector('#fishing-live-pointer');
      if (pointerEl) {
        pointerEl.style.left = `${(this.pointerPos * 100).toFixed(1)}%`;
      }
    }

    if (this.phase === 'hook') {
      this.hookRemainingMs -= dt;
      const timerEl = this.root?.querySelector('#fishing-hook-timer');
      if (timerEl) {
        timerEl.textContent = `${Math.max(0, this.hookRemainingMs / 1000).toFixed(1)}s`;
      }
      if (this.hookRemainingMs <= 0) {
        this._handleFishEscaped(
          'Bé giật cần hơi trễ một chút nên cá nhả mồi bơi đi rồi. Lần sau thấy phao lún sâu bé bấm Giật Cần ngay nhé!'
        );
      }
    }

    if (this.phase === 'pull') {
      this.pullElapsedMs += dt;
      if (this.pullElapsedMs >= FISHING_LIMITS.PULL_TIMEOUT_MS) {
        this._handleFishEscaped('Bạn cá đã mỏi và bơi về lại đầm sen rồi, mình thả câu lại nhé!');
        return;
      }

      this.stateTimerMs -= dt;
      if (this.stateTimerMs <= 0) {
        if (this.fishPullState === 'splash') {
          // Bé đã kiên nhẫn nghỉ tay qua nhịp cá quẫy!
          this.fishPullState = 'rest';
          this.stateTimerMs = 2800;
          this.voiceBannerText =
            '💚 Giỏi lắm! Cá đã hết quẫy và đứng yên rồi, bé canh vùng Xanh bấm KÉO tiếp nhé!';
          this.petReactionText = '🐶 Cún vỗ tay: "Bé nghỉ tay đúng lúc giỏi quá!"';
          this._render();
        } else {
          this.stateTimerMs = 2600;
        }
      }
    }
  }

  _bindKeyboard() {
    this._unbindKeyboard();
    this.keydownHandler = (e) => {
      if (!this.root || this.activeTab !== 'fishing') return;
      if (e.code === 'Space' || e.code === 'Enter') {
        if (this.phase === 'cast') {
          e.preventDefault();
          this.handleCastAction();
        } else if (this.phase === 'hook') {
          e.preventDefault();
          this.handleHookAction();
        } else if (this.phase === 'pull') {
          e.preventDefault();
          this.handlePullAction();
        }
      }
    };
    window.addEventListener('keydown', this.keydownHandler);
  }

  _unbindKeyboard() {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
  }

  _mount() {
    if (!this.root) {
      this.root = document.createElement('div');
      this.root.className = 'fishing-modal-backdrop';
      this.root.id = 'fishing-modal';
      document.body.appendChild(this.root);
    }
    this._render();
  }

  _render() {
    if (!this.root) return;
    const state = this.fishingSystem.getState();
    const dock = getDock(state.activeDock);
    const rod = getRod(state.equippedRod) || RODS[0];
    const bait = getBait(state.equippedBait) || BAITS[0];
    const baitCountText = bait.unlimited ? '∞' : `${state.baits[bait.id] || 0}`;

    this.root.innerHTML = `
      <div class="fishing-modal-card" role="dialog" aria-label="Hồ Câu Lá Sen">
        <div class="fishing-header">
          <div class="fishing-title-wrap">
            <span class="fishing-title-icon">${dock.icon}</span>
            <div class="fishing-title-text">
              <h2>Hồ Câu Lá Sen — ${dock.name}</h2>
              <p>Cần đang cầm: <strong>${rod.name}</strong> · Mồi: <strong>${bait.name} (${baitCountText})</strong></p>
            </div>
          </div>
          <div class="fishing-header-pills">
            <span class="fishing-stat-pill basket-pill" id="fishing-basket-pill">
              🧺 Giỏ Cá: <strong>${state.basket.length}/${FISHING_LIMITS.MAX_BASKET_SIZE}</strong>
            </span>
            <span class="fishing-stat-pill shells-pill" id="fishing-shells-pill">
              ⭐ Sao: <strong>${typeof this.fishingSystem.getStars === 'function' ? this.fishingSystem.getStars() : state.shells}</strong>
            </span>
            <button type="button" class="fishing-close-btn" data-action="close">✖ Đóng</button>
          </div>
        </div>

        <div class="fishing-tabs">
          <button type="button" class="fishing-tab-btn ${this.activeTab === 'fishing' ? 'active' : ''}" data-tab="fishing">
            🎣 Bến Câu (${dock.name})
          </button>
          <button type="button" class="fishing-tab-btn ${this.activeTab === 'prep_basket' ? 'active' : ''}" data-tab="prep_basket">
            🧺 Nhà Hồ Câu: Cần, Mồi & Giỏ Cá (${state.basket.length}/${FISHING_LIMITS.MAX_BASKET_SIZE})
          </button>
          <button type="button" class="fishing-tab-btn ${this.activeTab === 'otter_guide' ? 'active' : ''}" data-tab="otter_guide">
            🦦 Chú Rái Cá Tập Câu & Trợ Giúp
          </button>
          ${
            this.onOpenFishBook
              ? `<button type="button" class="fishing-tab-btn" data-action="open-fishbook">🏅 Sổ Huy Hiệu</button>`
              : ''
          }
        </div>

        <div class="fishing-body">
          ${this.activeTab === 'fishing' ? this._renderFishingStage(state, dock, rod, bait) : ''}
          ${this.activeTab === 'prep_basket' ? this._renderPrepAndBasketTab(state) : ''}
          ${this.activeTab === 'otter_guide' ? this._renderOtterGuideTab(state) : ''}
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _renderFishingStage(state, dock, rod, bait) {
    const zone = this._getGreenZoneBounds(state, this.phase === 'cast');
    const bobberClass =
      this.phase === 'hook'
        ? 'real-bite'
        : this.isFakeNibbling
        ? 'fake-nibble'
        : 'idle-float';

    return `
      <!-- Thanh đổi nhanh Bến Câu & Trạng thái Trợ Giúp -->
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${DOCKS.map(
            (d) => `
            <button type="button" class="fishing-secondary-btn" data-switch-dock="${d.id}" ${
              ['cast', 'waiting', 'hook', 'pull'].includes(this.phase) ? 'disabled' : ''
            } style="min-height:48px;padding:6px 14px;${
              d.id === dock.id
                ? 'background:#dcfce7;border-color:#16a34a;color:#14532d;'
                : ''
            }">
              ${d.icon} ${d.name}
            </button>
          `
          ).join('')}
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          ${
            state.assistMode
              ? `<span class="fishing-stat-pill" style="background:#fef3c7;border-color:#f59e0b;color:#78350f;">🌟 Trợ giúp: Đang Bật</span>`
              : ''
          }
          ${
            state.coPullMode
              ? `<span class="fishing-stat-pill" style="background:#dcfce7;border-color:#22c55e;color:#14532d;">🤝 Cùng kéo: Đang Bật</span>`
              : ''
          }
          ${
            ['cast', 'hook', 'pull'].includes(this.phase)
              ? `<button type="button" class="fishing-secondary-btn" data-action="pause-turn" style="min-height:48px;padding:6px 14px;">
                  ${this.isPaused ? '▶️ Tiếp Tục' : '⏸️ Tạm Dừng'}
                </button>`
              : ''
          }
        </div>
      </div>

      <!-- Khung mặt hồ câu -->
      <div class="fishing-pond-stage ${dock.id === 'sunny_dock' ? 'sunny-dock' : ''} ${['caught', 'missed'].includes(this.phase) ? 'compact-stage' : ''}">
        <div class="pond-lotus-decor">
          <div class="pond-lotus-leaf l1"></div>
          <div class="pond-lotus-leaf l2"></div>
          <div class="pond-lotus-leaf l3"></div>
          <div class="pond-lotus-leaf l4"></div>
        </div>

        <div class="pond-top-bar">
          <div class="pond-voice-banner" id="fishing-voice-banner">
            <span>💬</span>
            <span>${this.voiceBannerText}</span>
          </div>
          <div class="pond-pet-companion">
            ${this.petReactionText}
          </div>
        </div>

        <!-- Vùng Phao ở giữa mặt hồ -->
        <div class="pond-center-zone">
          ${
            ['waiting', 'hook', 'pull'].includes(this.phase)
              ? `
              <div class="pond-ripple-ring ${this.fishPullState === 'splash' ? 'splash-active' : ''}"></div>
              <div class="pond-ripple-ring r2 ${this.fishPullState === 'splash' ? 'splash-active' : ''}"></div>
              <div class="pond-bobber ${bobberClass}" id="fishing-bobber">
                ${
                  this.phase === 'hook'
                    ? '❗'
                    : this.fishPullState === 'splash'
                    ? '💦'
                    : rod.icon
                }
              </div>
            `
              : `
              <div style="background:rgba(255,255,255,0.92);padding:12px 22px;border-radius:999px;font-weight:900;color:#0369a1;font-size:1.1rem;box-shadow:0 6px 16px rgba(0,0,0,0.15);">
                ${dock.icon} ${dock.desc}
              </div>
            `
          }
        </div>

        <!-- Thanh nhịp Canh Thả / Kéo Cá -->
        ${
          this.phase === 'cast' || this.phase === 'pull'
            ? `
            <div class="fishing-rhythm-box">
              ${
                this.phase === 'pull'
                  ? `
                  <div class="fishing-pull-stages">
                    ${Array.from({ length: this.pullTargetStages }, (_, idx) => {
                      const done = idx < this.pullProgress;
                      return `<div class="fishing-stage-dot ${done ? 'done' : ''}">${done ? '✓' : idx + 1}</div>`;
                    }).join('')}
                  </div>
                `
                  : ''
              }
              <div class="fishing-rhythm-track">
                <div class="fishing-rhythm-green-zone" style="left:${(zone.start * 100).toFixed(1)}%;width:${(zone.width * 100).toFixed(1)}%;">
                  ${this.fishPullState === 'splash' ? '✋ NGHỈ TAY!' : '🌸 VÙNG LÁ SEN XANH'}
                </div>
                <div class="fishing-rhythm-pointer" id="fishing-live-pointer" style="left:${(this.pointerPos * 100).toFixed(1)}%;">
                  🎣
                </div>
              </div>
            </div>
          `
            : ''
        }
      </div>

      <!-- Khu vực nút bấm tương tác lớn (>= 64px) theo từng Pha -->
      ${this._renderPhaseControls(state)}
    `;
  }

  _renderPhaseControls(state) {
    if (this.isPaused) {
      return `
        <div class="fishing-scale-showcase">
          <div style="font-size:1.3rem;font-weight:900;color:#0c4a6e;">
            ${
              this.resumeCountdown > 0
                ? `⏳ Chuẩn bị tiếp tục trong: ${this.resumeCountdown}...`
                : '⏸️ Trò chơi đang tạm dừng để bé nghỉ tay'
            }
          </div>
          ${
            this.resumeCountdown === 0
              ? `<button type="button" class="fishing-big-btn" data-action="pause-turn">▶️ Tiếp Tục Câu Cá</button>`
              : ''
          }
        </div>
      `;
    }

    if (this.phase === 'ready') {
      const basketFull = state.basket.length >= FISHING_LIMITS.MAX_BASKET_SIZE;
      return `
        <div class="fishing-action-row">
          ${
            basketFull
              ? `
              <button type="button" class="fishing-big-btn rest-btn" data-action="notice-basket-full">
                🧺 Túi Đầy Rồi (6/6) — Bé Hãy Đi Đổi Cá Nhé!
              </button>
              ${
                this.onNavigateMap
                  ? `<button type="button" class="fishing-secondary-btn" data-go-map="map_rainbow_market">🏮 Mang Cá Ra Chợ Cầu Vồng Bán</button>
                     <button type="button" class="fishing-secondary-btn" data-go-map="map_kitchen">🍳 Mang Cá Về Bếp Nấu Ăn</button>`
                  : ''
              }
            `
              : `
              <button type="button" class="fishing-big-btn" id="btn-start-cast" data-action="start-cast">
                🎣 Bắt Đầu Thả Câu
              </button>
              <button type="button" class="fishing-secondary-btn" data-tab="prep_basket">
                🌿 Đổi Cần / Gắn Mồi (${state.basket.length}/6)
              </button>
            `
          }
        </div>
      `;
    }

    if (this.phase === 'cast') {
      return `
        <div class="fishing-action-row">
          <button type="button" class="fishing-big-btn" id="btn-cast-now" data-action="cast-now">
            🌸 THẢ PHAO VÀO VÙNG XANH!
          </button>
          <button type="button" class="fishing-secondary-btn" data-action="cancel-before-bite">
            ↩️ Thu Cần Lại (Giữ Nguyên Mồi)
          </button>
        </div>
      `;
    }

    if (this.phase === 'waiting') {
      return `
        <div class="fishing-action-row">
          <button type="button" class="fishing-secondary-btn" data-action="early-tap-hint" style="min-height:68px;font-size:1.15rem;">
            👀 Đang Quan Sát Phao... (Chờ Phao Lún Sâu Nhé!)
          </button>
          <button type="button" class="fishing-secondary-btn" data-action="cancel-before-bite">
            ↩️ Thu Cần (Không Mất Mồi)
          </button>
        </div>
      `;
    }

    if (this.phase === 'hook') {
      return `
        <div class="fishing-action-row">
          <button type="button" class="fishing-big-btn hook-btn" id="btn-hook-now" data-action="hook-now">
            🎯 GIẬT CẦN NGAY! (<span id="fishing-hook-timer">${(this.hookRemainingMs / 1000).toFixed(1)}s</span>)
          </button>
        </div>
      `;
    }

    if (this.phase === 'pull') {
      if (this.fishPullState === 'splash') {
        return `
          <div class="fishing-action-row">
            <button type="button" class="fishing-big-btn rest-btn" id="btn-pull-now" data-action="pull-now">
              ✋ NGHỈ TAY — CHỜ CÁ HẾT QUẪY NHÉ!
            </button>
          </div>
        `;
      }
      return `
        <div class="fishing-action-row">
          <button type="button" class="fishing-big-btn" id="btn-pull-now" data-action="pull-now">
            💚 KÉO ĐÚNG LÚC! (Nhịp ${this.pullProgress + 1}/${this.pullTargetStages})
          </button>
        </div>
      `;
    }

    if (this.phase === 'caught' && this.lastCatchSummary) {
      const { fish, species, weightG, isNewSpecies, isNewWeightRecord, isStacked, count, maxStack, isSpecial, isGlow } = this.lastCatchSummary;
      const isSpec = Boolean(isSpecial || isGlow || species.isSpecial || species.isGlow);
      const sizeLabel = getFishSizeLabel(weightG);
      const shellsVal = calculateFishSellPrice(weightG);
      const portionsVal = calculateFishPortions(weightG);

      return `
        <div class="fishing-scale-showcase" id="fishing-catch-card">
          <div style="display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;">
            <img src="${species.asset}" alt="${species.name}" class="${isSpec ? 'special-fish-glow-img' : ''}" style="width:96px;height:96px;object-fit:contain;" />
            <div style="text-align:left;">
              <div style="font-size:1.35rem;font-weight:900;color:#0f172a;">
                ${species.icon} ${species.name}
                ${isSpec ? '<span class="special-fish-label" style="margin-left:6px;">✨ PHÁT SÁNG · ĐỘC BẢN 1 CON ✨</span>' : ''}
                ${isStacked ? `<span style="background:#10b981;color:#fff;padding:2px 10px;border-radius:999px;font-size:0.85rem;margin-left:6px;font-weight:900;">XẾP CHỒNG: x${count}/${maxStack} CON!</span>` : ''}
                ${isNewSpecies ? '<span style="background:#22c55e;color:#fff;padding:2px 10px;border-radius:999px;font-size:0.85rem;margin-left:6px;">LOÀI MỚI!</span>' : ''}
                ${!isNewSpecies && isNewWeightRecord ? '<span style="background:#f59e0b;color:#fff;padding:2px 10px;border-radius:999px;font-size:0.85rem;margin-left:6px;">KỶ LỤC MỚI!</span>' : ''}
              </div>
              <div class="toy-scale-dial" style="margin-top:6px;">
                ⚖️ Cân nặng: ${weightG} gam · ${sizeLabel}
              </div>
              <div style="font-size:0.92rem;font-weight:800;color:#475569;margin-top:6px;">
                ⭐ Nếu bán ở Chợ: +${shellsVal} Sao · 🍲 Nếu mang về Bếp: +${portionsVal} phần cá tươi
              </div>
            </div>
          </div>

          <div class="fishing-action-row">
            <button type="button" class="fishing-big-btn" data-action="catch-keep-basket">
              🧺 Cất Vào Giỏ Cá (Câu Tiếp)
            </button>
            <button type="button" class="fishing-secondary-btn" data-action="catch-keep-cooking" style="border-color:#f59e0b;color:#b45309;background:#fffbeb;">
              🍲 Giữ Để Nấu Ăn
            </button>
            <button type="button" class="fishing-secondary-btn" data-action="catch-release-now" style="border-color:#22c55e;color:#15803d;background:#f0fdf4;">
              💚 Thả Cá Về Hồ Sen
            </button>
          </div>
        </div>
      `;
    }

    if (this.phase === 'missed') {
      return `
        <div class="fishing-scale-showcase">
          <div style="font-size:1.2rem;font-weight:900;color:#0369a1;">
            🌱 ${this.lastMissMessage || 'Cá bơi đi mất rồi, mình thử lại nhé!'}
          </div>
          ${
            state.consecutiveMisses >= 2 && (!state.assistMode || !state.coPullMode)
              ? `
              <div style="background:#dcfce7;border:3px solid #22c55e;border-radius:18px;padding:10px 16px;font-weight:800;color:#14532d;">
                🦦 Chú Rái Cá gợi ý: Bé có muốn bật <strong>Chế Độ Trợ Giúp</strong> (vùng xanh rộng hơn, phao chờ lâu hơn) hoặc <strong>Cùng Kéo</strong> không?
              </div>
              <div class="fishing-action-row">
                <button type="button" class="fishing-secondary-btn" data-action="enable-assist-now" style="border-color:#16a34a;color:#15803d;background:#f0fdf4;">
                  🌟 Bật Trợ Giúp & Cùng Kéo Ngay
                </button>
              </div>
            `
              : ''
          }
          <div class="fishing-action-row">
            <button type="button" class="fishing-big-btn" data-action="start-cast">
              🎣 Thả Câu Lại Nhé!
            </button>
          </div>
        </div>
      `;
    }

    return '';
  }

  _renderPrepAndBasketTab(state) {
    const ownedRodsHtml = RODS.filter((r) => state.ownedRods.includes(r.id))
      .map((rod) => {
        const equipped = state.equippedRod === rod.id;
        return `
          <div class="fishing-item-card ${equipped ? 'equipped' : ''}">
            <div class="fishing-item-top">
              <div class="fishing-item-thumb">
                <img src="${rod.asset}" alt="${rod.name}" />
              </div>
              <div>
                <div style="font-size:1.1rem;font-weight:900;color:#0f172a;">${rod.icon} ${rod.name}</div>
                <div style="font-size:0.88rem;font-weight:700;color:#475569;">${rod.desc}</div>
              </div>
            </div>
            <button type="button" class="fishing-secondary-btn" data-equip-rod="${rod.id}" style="width:100%;justify-content:center;">
              ${equipped ? '✅ Đang Cầm Cần Này' : '🎣 Đổi Sang Cần Này'}
            </button>
          </div>
        `;
      })
      .join('');

    const baitsHtml = BAITS.map((bait) => {
      const count = bait.unlimited ? '∞ Không giới hạn' : `${state.baits[bait.id] || 0} viên`;
      const available = bait.unlimited || (state.baits[bait.id] || 0) > 0;
      const equipped = state.equippedBait === bait.id;

      return `
        <div class="fishing-item-card ${equipped ? 'equipped' : ''}">
          <div class="fishing-item-top">
            <div class="fishing-item-thumb">
              <img src="${bait.asset}" alt="${bait.name}" />
            </div>
            <div>
              <div style="font-size:1.1rem;font-weight:900;color:#0f172a;">${bait.icon} ${bait.name}</div>
              <div style="font-size:0.88rem;font-weight:800;color:#0369a1;">Trong túi: ${count}</div>
            </div>
          </div>
          <button type="button" class="fishing-secondary-btn" data-equip-bait="${bait.id}" ${
            available ? '' : 'disabled'
          } style="width:100%;justify-content:center;">
            ${
              equipped
                ? '✅ Đang Gắn Mồi Này'
                : available
                ? '🌿 Gắn Mồi Này'
                : '🏮 Ghé Chợ Cầu Vồng Mua Thêm'
            }
          </button>
        </div>
      `;
    }).join('');

    const basketHtml =
      state.basket.length === 0
        ? `<div style="padding:18px;background:#f8fafc;border-radius:18px;border:2px dashed #94a3b8;text-align:center;font-weight:800;color:#475569;">
            🧺 Giỏ Cá đang trống (0/${FISHING_LIMITS.MAX_BASKET_SIZE}). Bé ra Bến Sen hoặc Bến Nắng câu cá nhé!
          </div>`
        : `<div class="fishing-grid">
            ${state.basket
              .map((fish) => {
                const sp = getFishSpecies(fish.speciesId);
                return `
                  <div class="fishing-item-card ${fish.keepForCooking ? 'equipped' : ''}">
                    <div class="fishing-item-top">
                      <div class="fishing-item-thumb">
                        <img src="${sp?.asset || '/assets/fishing/fish_cloud.png'}" alt="${sp?.name || 'Cá'}" />
                      </div>
                      <div>
                        <div style="font-size:1.08rem;font-weight:900;color:#0f172a;">${sp?.icon || '🐟'} ${sp?.name || 'Cá'}</div>
                        <div style="font-size:0.95rem;font-weight:900;color:#c2410c;">⚖️ ${fish.weightG}g (${getFishSizeLabel(fish.weightG)})</div>
                        <div style="font-size:0.84rem;font-weight:800;color:#475569;">
                          🍲 Quy đổi Bếp: ${calculateFishPortions(fish.weightG)} phần cá · ⭐ Chợ: ${calculateFishSellPrice(fish.weightG, fish.speciesId)} Sao
                        </div>
                      </div>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                      <button type="button" class="fishing-secondary-btn" data-toggle-keep="${fish.id}" style="flex:1;min-height:48px;font-size:0.88rem;justify-content:center;">
                        ${fish.keepForCooking ? '🔒 Đang Giữ Nấu Ăn' : '🍲 Giữ Để Nấu'}
                      </button>
                      <button type="button" class="fishing-secondary-btn" data-release-fish="${fish.id}" style="flex:1;min-height:48px;font-size:0.88rem;justify-content:center;border-color:#22c55e;color:#15803d;">
                        💚 Thả Về Hồ
                      </button>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>`;

    return `
      <div style="background:#f0f9ff;border:2px solid #7dd3fc;border-radius:16px;padding:10px 14px;font-weight:700;color:#0369a1;">
        🏡 <strong>Nhà Hồ Câu:</strong> Tại hồ câu bé chỉ chuẩn bị cần, gắn mồi, giữ cá nấu ăn hoặc thả cá về hồ. Muốn mua cần/mồi mới hoặc cân bán cá nhận Sao ⭐, bé ghé <strong>Chợ Cầu Vồng</strong> nhé!
      </div>
      <h3 style="margin:4px 0 0;color:#0c4a6e;font-size:1.1rem;">🧺 Giỏ Cá Của Bé (${state.basket.length}/${FISHING_LIMITS.MAX_BASKET_SIZE} chỗ)</h3>
      ${basketHtml}
      <h3 style="margin:8px 0 0;color:#0c4a6e;font-size:1.1rem;">🎋 Cần Câu Đã Sở Hữu</h3>
      <div class="fishing-grid">${ownedRodsHtml}</div>
      <h3 style="margin:8px 0 0;color:#0c4a6e;font-size:1.1rem;">🌿 Mồi Câu Trong Túi</h3>
      <div class="fishing-grid">${baitsHtml}</div>
    `;
  }

  _renderOtterGuideTab(state) {
    return `
      <div class="fishing-scale-showcase" style="text-align:left;align-items:stretch;">
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
          <div style="font-size:3rem;">🦦</div>
          <div>
            <div style="font-size:1.25rem;font-weight:900;color:#78350f;">Chú Rái Cá Hướng Dẫn Câu Cá</div>
            <div style="font-size:0.98rem;font-weight:700;color:#92400e;">
              3 bước đơn giản giúp bé câu được thật nhiều bạn cá đáng yêu:
            </div>
          </div>
        </div>

        <div class="fishing-grid" style="margin-top:8px;">
          <div class="fishing-item-card">
            <div style="font-weight:900;font-size:1.05rem;color:#15803d;">1️⃣ Canh Thả Vùng Lá Sen</div>
            <div style="font-weight:700;color:#334155;font-size:0.92rem;">
              Khi vạch chạy vào vùng Lá Sen Xanh ở giữa, bé bấm <strong>Thả Phao</strong>. Nếu lệch một chút phao vẫn xuống nước bình thường!
            </div>
          </div>
          <div class="fishing-item-card">
            <div style="font-weight:900;font-size:1.05rem;color:#c2410c;">2️⃣ Nhìn Phao Lún Sâu Mới Giật</div>
            <div style="font-weight:700;color:#334155;font-size:0.92rem;">
              Phao rung nhẹ là cá <strong>rỉa thử</strong>. Chờ khi phao <strong>lún sâu xuống nước</strong> và hiện nút cam thì bấm <strong>Giật Cần</strong>!
            </div>
          </div>
          <div class="fishing-item-card">
            <div style="font-weight:900;font-size:1.05rem;color:#0369a1;">3️⃣ Kéo Đúng Lúc — Nghỉ Khi Cá Quẫy</div>
            <div style="font-weight:700;color:#334155;font-size:0.92rem;">
              Khi cá đứng yên, bấm <strong>Kéo</strong> lúc vạch vào vùng Xanh. Khi cá <strong>quẫy tung bọt nước ✋</strong>, bé nghỉ tay 1 giây nhé!
            </div>
          </div>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
          <button type="button" class="fishing-secondary-btn" data-speak="Bước một, canh thả phao vào vùng lá sen xanh. Bước hai, chờ phao lún sâu mới bấm giật cần. Bước ba, khi cá đứng yên thì kéo đúng vùng xanh, khi cá quẫy thì nghỉ tay!">
            🔊 Nghe Lại Hướng Dẫn Của Chú Rái Cá
          </button>
          <button type="button" class="fishing-secondary-btn" data-action="toggle-assist" style="${
            state.assistMode ? 'background:#dcfce7;border-color:#16a34a;color:#14532d;' : ''
          }">
            🌟 Chế Độ Trợ Giúp: ${state.assistMode ? 'ĐANG BẬT' : 'ĐANG TẮT'}
          </button>
          <button type="button" class="fishing-secondary-btn" data-action="toggle-copull" style="${
            state.coPullMode ? 'background:#dcfce7;border-color:#16a34a;color:#14532d;' : ''
          }">
            🤝 Cùng Kéo Với Chú Rái Cá / Ba Mẹ: ${state.coPullMode ? 'ĐANG BẬT' : 'ĐANG TẮT'}
          </button>
        </div>

        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:8px;">
          <span style="font-weight:900;color:#78350f;">🎚️ Nhịp độ cho bé:</span>
          ${[
            { id: 'easy', label: '🌱 Dễ (Thong thả)' },
            { id: 'normal', label: '🌼 Bình thường' },
            { id: 'confident', label: '🚀 Tự tin' }
          ]
            .map(
              (m) => `
              <button type="button" class="fishing-secondary-btn" data-diff-mode="${m.id}" style="min-height:46px;padding:6px 14px;${
                state.difficultyMode === m.id
                  ? 'background:#fef08a;border-color:#ca8a04;color:#713f12;'
                  : ''
              }">
                ${m.label}
              </button>
            `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  _bindEvents() {
    if (!this.root) return;

    this.root.querySelector('[data-action="close"]')?.addEventListener('click', () => {
      this._playSfx('click');
      this.close();
    });

    this.root.querySelector('[data-action="open-fishbook"]')?.addEventListener('click', () => {
      this._playSfx('click');
      if (typeof this.onOpenFishBook === 'function') {
        this.onOpenFishBook();
      }
    });

    this.root.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._playSfx('click');
        const nextTab = btn.getAttribute('data-tab');
        if (nextTab !== 'fishing' && ['cast', 'waiting'].includes(this.phase)) {
          this.fishingSystem.cancelTurnBeforeBite();
          this._resetTurnRuntime();
        }
        this.activeTab = nextTab;
        this._render();
      });
    });

    this.root.querySelectorAll('[data-switch-dock]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dockId = btn.getAttribute('data-switch-dock');
        const res = this.fishingSystem.setActiveDock(dockId);
        if (res.ok) {
          this._playSfx('click');
          this.voiceBannerText = res.dock.voiceIntro;
          this._speak(res.dock.voiceIntro);
          this._render();
        }
      });
    });

    this.root.querySelector('[data-action="notice-basket-full"]')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('game:basket-full-notice'));
    });

    this.root.querySelector('[data-action="start-cast"]')?.addEventListener('click', () => {
      this.startCastPhase();
    });

    this.root.querySelector('[data-action="cast-now"]')?.addEventListener('click', () => {
      this.handleCastAction();
    });

    this.root.querySelector('[data-action="cancel-before-bite"]')?.addEventListener('click', () => {
      this._playSfx('click');
      this.fishingSystem.cancelTurnBeforeBite();
      this._resetTurnRuntime();
      this.voiceBannerText = 'Đã thu cần nhẹ nhàng, mồi câu của bé vẫn còn nguyên!';
      this._render();
    });

    this.root.querySelector('[data-action="early-tap-hint"]')?.addEventListener('click', () => {
      this.voiceBannerText =
        '💧 Cá mới đang rỉa thử thôi! Bé kiên nhẫn chờ phao lún sâu xuống nước nhé!';
      this._speak('Cá mới rỉa thử thôi, bé chờ phao lún sâu nhé!');
      this._render();
    });

    this.root.querySelector('[data-action="hook-now"]')?.addEventListener('click', () => {
      this.handleHookAction();
    });

    this.root.querySelector('[data-action="pull-now"]')?.addEventListener('click', () => {
      this.handlePullAction();
    });

    this.root.querySelector('[data-action="pause-turn"]')?.addEventListener('click', () => {
      this._playSfx('click');
      this.togglePauseTurn();
    });

    this.root.querySelector('[data-action="catch-keep-basket"]')?.addEventListener('click', () => {
      this._playSfx('click');
      this._resetTurnRuntime();
      this.voiceBannerText = '🧺 Đã cất cá vào Giỏ Cá! Bé có thể thả câu tiếp nhé!';
      this._render();
    });

    this.root.querySelector('[data-action="catch-keep-cooking"]')?.addEventListener('click', () => {
      this._playSfx('correct');
      if (this.lastCatchSummary?.fish?.id) {
        this.fishingSystem.setFishKeepForCooking(this.lastCatchSummary.fish.id, true);
      }
      this._resetTurnRuntime();
      this.voiceBannerText =
        '🍲 Đã đánh dấu "Giữ để nấu"! Khi ghé Căn Bếp Cầu Vồng bé có thể chế biến món cá thơm lừng!';
      this._render();
    });

    this.root.querySelector('[data-action="catch-release-now"]')?.addEventListener('click', () => {
      this._playSfx('correct');
      if (this.lastCatchSummary?.fish?.id) {
        this.fishingSystem.releaseFish(this.lastCatchSummary.fish.id);
      }
      this._resetTurnRuntime();
      this.voiceBannerText =
        '💚 Bé đã nhẹ nhàng thả bạn cá bơi về lại Hồ Sen! Kỷ lục trong Sổ Cá vẫn được lưu giữ!';
      this._speak('Tạm biệt bạn cá nhé! Hẹn gặp lại ở Hồ Lá Sen!');
      this._render();
    });

    this.root.querySelector('[data-action="enable-assist-now"]')?.addEventListener('click', () => {
      this._playSfx('correct');
      this.fishingSystem.setAssistMode(true);
      this.fishingSystem.setCoPullMode(true);
      this.voiceBannerText =
        '🌟 Đã bật Chế độ Trợ giúp & Cùng kéo! Chú Rái Cá sẽ phụ bé một tay ở lượt tiếp theo nhé!';
      this._render();
    });

    this.root.querySelectorAll('[data-equip-rod]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const res = this.fishingSystem.equipRod(btn.getAttribute('data-equip-rod'));
        if (res.ok) {
          this._playSfx('click');
          this._render();
        }
      });
    });

    this.root.querySelectorAll('[data-equip-bait]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const res = this.fishingSystem.equipBait(btn.getAttribute('data-equip-bait'));
        if (res.ok) {
          this._playSfx('click');
          this._render();
        }
      });
    });

    this.root.querySelectorAll('[data-toggle-keep]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const fishId = btn.getAttribute('data-toggle-keep');
        const st = this.fishingSystem.getState();
        const fish = st.basket.find((f) => f.id === fishId);
        if (!fish) return;
        this.fishingSystem.setFishKeepForCooking(fishId, !fish.keepForCooking);
        this._playSfx('click');
        this._render();
      });
    });

    this.root.querySelectorAll('[data-release-fish]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const fishId = btn.getAttribute('data-release-fish');
        const res = this.fishingSystem.releaseFish(fishId);
        if (res.ok) {
          this._playSfx('correct');
          this._speak('Bạn cá vẫy đuôi cảm ơn bé và bơi về lại đầm sen rồi!');
          this._render();
        }
      });
    });

    this.root.querySelector('[data-action="toggle-assist"]')?.addEventListener('click', () => {
      const st = this.fishingSystem.getState();
      this.fishingSystem.setAssistMode(!st.assistMode);
      this._playSfx('click');
      this._render();
    });

    this.root.querySelector('[data-action="toggle-copull"]')?.addEventListener('click', () => {
      const st = this.fishingSystem.getState();
      this.fishingSystem.setCoPullMode(!st.coPullMode);
      this._playSfx('click');
      this._render();
    });

    this.root.querySelectorAll('[data-diff-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.fishingSystem.setDifficultyMode(btn.getAttribute('data-diff-mode'));
        this._playSfx('click');
        this._render();
      });
    });

    this.root.querySelectorAll('[data-speak]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._playSfx('click');
        this._speak(btn.getAttribute('data-speak'));
      });
    });

    this.root.querySelectorAll('[data-go-map]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetMap = btn.getAttribute('data-go-map');
        this.close();
        if (typeof this.onNavigateMap === 'function') {
          this.onNavigateMap(targetMap);
        }
      });
    });
  }
}
