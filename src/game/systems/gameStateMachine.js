/**
 * Game State Machine (FSM)
 * Quản lý trạng thái toàn cục của trò chơi, đảm bảo luồng chuyển cảnh hợp lệ,
 * ngăn chặn việc mở đè modal hoặc rò rỉ sự kiện chạm vào cảnh nền.
 */

export const GAME_STATES = {
  BOOT: 'BOOT',
  HUB_MAP_SELECT: 'HUB_MAP_SELECT',
  WORLD_EXPLORATION: 'WORLD_EXPLORATION',
  ENCOUNTER_QUESTION: 'ENCOUNTER_QUESTION',
  BOSS_BATTLE: 'BOSS_BATTLE',
  RECAP_VICTORY: 'RECAP_VICTORY',
  PET_CARE: 'PET_CARE',
  KITCHEN: 'KITCHEN',
  FISHING: 'FISHING',
  MARKET: 'MARKET',
  PARENTAL_GATE: 'PARENTAL_GATE',
  GRAND_FINALE: 'GRAND_FINALE'
};

// Bảng các bước chuyển trạng thái hợp lệ
export const VALID_TRANSITIONS = {
  [GAME_STATES.BOOT]: [
    GAME_STATES.HUB_MAP_SELECT,
    GAME_STATES.WORLD_EXPLORATION
  ],
  [GAME_STATES.HUB_MAP_SELECT]: [
    GAME_STATES.WORLD_EXPLORATION,
    GAME_STATES.PARENTAL_GATE,
    GAME_STATES.GRAND_FINALE
  ],
  [GAME_STATES.WORLD_EXPLORATION]: [
    GAME_STATES.KITCHEN,
    GAME_STATES.FISHING,
    GAME_STATES.MARKET,
    GAME_STATES.HUB_MAP_SELECT,
    GAME_STATES.ENCOUNTER_QUESTION,
    GAME_STATES.BOSS_BATTLE,
    GAME_STATES.RECAP_VICTORY,
    GAME_STATES.PET_CARE,
    GAME_STATES.PARENTAL_GATE,
    GAME_STATES.GRAND_FINALE
  ],
  [GAME_STATES.ENCOUNTER_QUESTION]: [
    GAME_STATES.WORLD_EXPLORATION
  ],
  [GAME_STATES.BOSS_BATTLE]: [
    GAME_STATES.RECAP_VICTORY,
    GAME_STATES.WORLD_EXPLORATION
  ],
  [GAME_STATES.RECAP_VICTORY]: [
    GAME_STATES.HUB_MAP_SELECT,
    GAME_STATES.WORLD_EXPLORATION,
    GAME_STATES.GRAND_FINALE
  ],
  [GAME_STATES.PET_CARE]: [
    GAME_STATES.WORLD_EXPLORATION
  ],
  [GAME_STATES.KITCHEN]: [GAME_STATES.WORLD_EXPLORATION],
  [GAME_STATES.FISHING]: [GAME_STATES.WORLD_EXPLORATION],
  [GAME_STATES.MARKET]: [GAME_STATES.WORLD_EXPLORATION],
  [GAME_STATES.PARENTAL_GATE]: [
    GAME_STATES.WORLD_EXPLORATION,
    GAME_STATES.HUB_MAP_SELECT
  ],
  [GAME_STATES.GRAND_FINALE]: [
    GAME_STATES.HUB_MAP_SELECT,
    GAME_STATES.WORLD_EXPLORATION
  ]
};

export class GameStateMachine {
  constructor(initialState = GAME_STATES.BOOT) {
    this.currentState = initialState;
    this.previousState = null;
    this.listeners = [];
  }

  getState() {
    return this.currentState;
  }

  getPreviousState() {
    return this.previousState;
  }

  canTransitionTo(nextState) {
    const allowed = VALID_TRANSITIONS[this.currentState] || [];
    return allowed.includes(nextState);
  }

  transition(nextState, payload = {}) {
    if (!this.canTransitionTo(nextState)) {
      console.warn(`[GameStateMachine] Chuyển trạng thái bất hợp lệ từ ${this.currentState} sang ${nextState}`);
      return false;
    }

    const fromState = this.currentState;
    this.previousState = fromState;
    this.currentState = nextState;

    this.notify(fromState, nextState, payload);
    return true;
  }

  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }
    return () => {};
  }

  notify(from, to, payload) {
    this.listeners.forEach(fn => {
      try {
        fn(from, to, payload);
      } catch (err) {
        console.error('[GameStateMachine] Lỗi callback listener:', err);
      }
    });
  }

  // Khôi phục khẩn cấp về chế độ khám phá an toàn
  recoverToExploration() {
    this.previousState = this.currentState;
    this.currentState = GAME_STATES.WORLD_EXPLORATION;
    this.notify(this.previousState, this.currentState, { recovered: true });
  }

  // Kiểm tra xem hiện tại có đang trong modal chặn không
  isModalActive() {
    return [
      GAME_STATES.ENCOUNTER_QUESTION,
      GAME_STATES.BOSS_BATTLE,
      GAME_STATES.RECAP_VICTORY,
      GAME_STATES.PET_CARE,
      GAME_STATES.KITCHEN,
      GAME_STATES.FISHING,
      GAME_STATES.MARKET,
      GAME_STATES.PARENTAL_GATE,
      GAME_STATES.HUB_MAP_SELECT,
      GAME_STATES.GRAND_FINALE
    ].includes(this.currentState);
  }
}

export const gameStateMachine = new GameStateMachine();
