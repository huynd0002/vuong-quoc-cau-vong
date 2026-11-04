import sauIdleUrl from '../../../assets/hero/sau/sau_idle.webp?url';
import sauCelebrateUrl from '../../../assets/hero/sau/sau_celebrate.webp?url';
import heroUpgradeIdleRightUrl from '../../../assets/hero/sau_upgrade/hero_upgrade_idle_right.webp?url';
import heroUpgradeCelebrateUrl from '../../../assets/hero/sau_upgrade/hero_upgrade_celebrate.webp?url';
import iconStarUrl from '../../../assets/ui/custom_kids_ui/icon_star_3d.png?url';

/**
 * Maze Minigame Modal (Trò Chơi Mê Cung Kỳ Diệu)
 * Pop-up mini game ngẫu nhiên cho trẻ 5-6 tuổi:
 * Trẻ dùng ngón tay (hoặc chuột) vẽ đường theo lối đi để giúp Bé Sâu thoát khỏi mê cung!
 */

const MAZE_THEMES = [
  {
    id: 'garden',
    name: 'Khu Vườn Cầu Vồng 🌻',
    wallColor: '#10b981',
    wallShadow: '#047857',
    floorColor: '#fefce8',
    trailColor: '#f59e0b',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    goalIcon: '🌈'
  },
  {
    id: 'ocean',
    name: 'Vịnh Biển Pha Lê 🌊',
    wallColor: '#0ea5e9',
    wallShadow: '#0369a1',
    floorColor: '#f0f9ff',
    trailColor: '#38bdf8',
    glowColor: 'rgba(14, 165, 233, 0.35)',
    goalIcon: '⭐'
  },
  {
    id: 'candy',
    name: 'Rừng Kẹo Bông 🍭',
    wallColor: '#f43f5e',
    wallShadow: '#be123c',
    floorColor: '#fff1f2',
    trailColor: '#ec4899',
    glowColor: 'rgba(244, 63, 94, 0.35)',
    goalIcon: '🎂'
  },
  {
    id: 'desert',
    name: 'Sa Mạc Hoàng Kim 🏜️',
    wallColor: '#d97706',
    wallShadow: '#92400e',
    floorColor: '#fffbeb',
    trailColor: '#f59e0b',
    glowColor: 'rgba(217, 119, 6, 0.35)',
    goalIcon: '💎'
  }
];


/**
 * Cấu hình độ khó và kích thước mê cung theo Cấp Độ Bản Đồ (Map 1 -> Map 6)
 * "càng maps cao thì càng khó đường đi nhỏ lại để bé cẩn thận hơn"
 */
export const MAP_MAZE_CONFIGS = {
  1: {
    mapId: 'map1',
    name: 'Làng Quê Yên Bình',
    levelLabel: 'Cấp 1 • Lối Đi Rộng Rãi',
    cols: 6,
    rows: 4,
    shortcuts: 3, // Nhiều lối mở phụ, thoáng đãng
    wallShadowWidth: 16,
    wallStrokeWidth: 12,
    playerTrailGlowWidth: 24,
    playerTrailStrokeWidth: 12,
    playerTrailCoreWidth: 4,
    heroSize: 56,
    collisionThreshold: 6.5,
    voiceHint: 'Mê cung Làng Quê đường đi rộng rãi, bé hãy vẽ nhẹ nhàng dẫn bạn Bé Sâu nhé!'
  },
  2: {
    mapId: 'map2',
    name: 'Bờ Hồ Xanh',
    levelLabel: 'Cấp 2 • Lối Đi Vừa Phải',
    cols: 7,
    rows: 5,
    shortcuts: 2,
    wallShadowWidth: 14,
    wallStrokeWidth: 10,
    playerTrailGlowWidth: 20,
    playerTrailStrokeWidth: 10,
    playerTrailCoreWidth: 3.5,
    heroSize: 50,
    collisionThreshold: 7.5,
    voiceHint: 'Mê cung Bờ Hồ Xanh thử thách hơn một chút, bé khéo léo đừng chạm vách đá nhé!'
  },
  3: {
    mapId: 'map3',
    name: 'Hang Động Tinh Thể',
    levelLabel: 'Cấp 3 • Thử Thách Vừa',
    cols: 8,
    rows: 6,
    shortcuts: 2,
    wallShadowWidth: 13,
    wallStrokeWidth: 9,
    playerTrailGlowWidth: 18,
    playerTrailStrokeWidth: 9,
    playerTrailCoreWidth: 3,
    heroSize: 46,
    collisionThreshold: 8.5,
    voiceHint: 'Mê cung Hang Động nhiều ngã rẽ pha lê, đường đi bắt đầu hẹp hơn, bé hãy tập trung nhé!'
  },
  4: {
    mapId: 'map4',
    name: 'Đền Mặt Trời Sa Mạc',
    levelLabel: 'Cấp 4 • Đường Đi Nhỏ Hẹp',
    cols: 9,
    rows: 6,
    shortcuts: 1,
    wallShadowWidth: 12,
    wallStrokeWidth: 8,
    playerTrailGlowWidth: 16,
    playerTrailStrokeWidth: 8,
    playerTrailCoreWidth: 2.5,
    heroSize: 42,
    collisionThreshold: 8.5,
    voiceHint: 'Đền Sa Mạc đường đi nhỏ lại rồi! Bé hãy thật cẩn thận nắn nót nét vẽ nhé!'
  },
  5: {
    mapId: 'map5',
    name: 'Hẻm Núi Cầu Vồng',
    levelLabel: 'Cấp 5 • Đường Nhỏ Cẩn Thận',
    cols: 10,
    rows: 7,
    shortcuts: 1,
    wallShadowWidth: 11,
    wallStrokeWidth: 7,
    playerTrailGlowWidth: 14,
    playerTrailStrokeWidth: 7,
    playerTrailCoreWidth: 2.5,
    heroSize: 38,
    collisionThreshold: 8.5,
    voiceHint: 'Mê cung Hẻm Núi hiểm trở với lối đi nhỏ hẹp, bé hãy đưa ngón tay thật chuẩn xác!'
  },
  6: {
    mapId: 'map6',
    name: 'Vương Quốc Thần Tiên',
    levelLabel: 'Cấp 6 • Cao Cấp • Đường Cực Hẹp',
    cols: 12,
    rows: 8,
    shortcuts: 0, // 0 shortcut - mê cung thuần túy ma trận chuẩn, nhiều ngõ cụt
    wallShadowWidth: 9,
    wallStrokeWidth: 6,
    playerTrailGlowWidth: 12,
    playerTrailStrokeWidth: 6,
    playerTrailCoreWidth: 2,
    heroSize: 32,
    collisionThreshold: 8.5,
    voiceHint: 'Đại mê cung Vương Quốc Thần Tiên! Đường đi rất nhỏ và ngoằn ngoèo, bé hãy cực kỳ cẩn thận nhé!'
  }
};

export class MazeMinigameModal {
  constructor({ audioService, progressionSystem, saveAdapter, hudController } = {}) {
    this.audioService = audioService;
    this.progressionSystem = progressionSystem;
    this.saveAdapter = saveAdapter;
    this.hudController = hudController;

    this.container = null;
    this.canvas = null;
    this.ctx = null;

    // Maze Grid Configuration
    this.cols = 8;
    this.rows = 6;
    this.grid = [];
    this.walls = []; // list of wall segments for collision check
    this.theme = MAZE_THEMES[0];
    this.shortestPath = []; // BFS solution
    this.isHintVisible = false;

    // Drawing state
    this.isDrawing = false;
    this.playerPath = []; // [{x, y}]
    this.isVictory = false;
    this.animatingHero = false;
    this.heroProgress = 0; // index along playerPath

    // Images
    this.heroImg = new Image();
    this.heroImg.src = sauIdleUrl;
    this.heroCelebrateImg = new Image();
    this.heroCelebrateImg.src = sauCelebrateUrl;

    // Confetti particles for victory
    this.confetti = [];

    // Chế độ Vượt Ải (Đấu Trường Đánh Quái)
    this.isEncounterMode = false;
    this.encounterData = null;
    this.encounterQuestion = null;
    this.encounterCallback = null;
    this.encounterCancelCallback = null;

    // Quản lý độ khó theo Map (càng map cao càng khó, đường đi càng nhỏ)
    this.overrideMapLevel = null;
    this.currentMapLevel = 1;
    this.currentConfig = MAP_MAZE_CONFIGS[1];

    this.createDom();
  }

  /**
   * Tự động xác định Cấp Độ Bản Đồ hiện tại (Map 1 -> Map 6)
   */
  getCurrentMapLevel() {
    if (this.overrideMapLevel && MAP_MAZE_CONFIGS[this.overrideMapLevel]) {
      return this.overrideMapLevel;
    }

    // 1. Kiểm tra từ thông tin encounter hoặc question
    const encId = String(this.encounterData?.id || '');
    const mapIdFromEnc = String(this.encounterData?.mapId || this.encounterQuestion?.mapId || '');
    const qId = String(this.encounterQuestion?.id || '');

    const candidate = mapIdFromEnc + ' ' + encId + ' ' + qId;
    const match = candidate.match(/map([1-6])/i);
    if (match) {
      return parseInt(match[1], 10);
    }

    // 2. Kiểm tra từ worldScene
    if (typeof window !== 'undefined' && window.__worldScene?.currentMapId) {
      const matchScene = String(window.__worldScene.currentMapId).match(/map([1-6])/i);
      if (matchScene) {
        return parseInt(matchScene[1], 10);
      }
    }

    // 3. Kiểm tra từ progressionSystem hoặc saveAdapter
    const campaignMapId = this.progressionSystem?.state?.campaign?.currentMapId 
      || this.saveAdapter?.load()?.campaign?.currentMapId 
      || '';
    const matchCamp = String(campaignMapId).match(/map([1-6])/i);
    if (matchCamp) {
      return parseInt(matchCamp[1], 10);
    }

    // 4. Nếu là map phụ (nông trại, bếp, sảnh...): Lấy theo map cao nhất bé đã mở khóa
    const unlocked = this.progressionSystem?.state?.campaign?.unlockedMaps || [];
    if (Array.isArray(unlocked) && unlocked.length > 0) {
      let maxLvl = 1;
      for (const m of unlocked) {
        const mMatch = String(m).match(/map([1-6])/i);
        if (mMatch) {
          const l = parseInt(mMatch[1], 10);
          if (l > maxLvl) maxLvl = l;
        }
      }
      return maxLvl;
    }

    return 1;
  }

  createDom() {
    let modal = document.getElementById('maze-minigame-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'maze-minigame-modal';
      modal.className = 'maze-modal-backdrop';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }
    this.container = modal;
  }

  /**
   * Tạo mê cung ngẫu nhiên đảm bảo có đường đi từ (0,0) đến (cols-1, rows-1)
   */
  generateMaze(keepTheme = false) {
    const level = this.getCurrentMapLevel();
    const cfg = MAP_MAZE_CONFIGS[level] || MAP_MAZE_CONFIGS[1];
    this.currentMapLevel = level;
    this.currentConfig = cfg;

    // Kích thước ô cờ mê cung: Càng map cao thì số ô càng nhiều, đường đi càng nhỏ hẹp
    this.cols = cfg.cols;
    this.rows = cfg.rows;

    // Chọn theme ngẫu nhiên nếu không giữ theme
    if (!keepTheme) {
      this.theme = MAZE_THEMES[Math.floor(Math.random() * MAZE_THEMES.length)];
    }

    // Cập nhật ngoại trang nhân vật đang dùng
    const state = this.saveAdapter ? this.saveAdapter.load() : null;
    const skin = state?.player?.selectedSkin || 'default';
    if (skin === 'knight') {
      this.heroImg.src = heroUpgradeIdleRightUrl;
      this.heroCelebrateImg.src = heroUpgradeCelebrateUrl;
    } else {
      this.heroImg.src = sauIdleUrl;
      this.heroCelebrateImg.src = sauCelebrateUrl;
    }

    // Khởi tạo lưới ô
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        row.push({
          c,
          r,
          visited: false,
          top: true,
          right: true,
          bottom: true,
          left: true
        });
      }
      this.grid.push(row);
    }

    // Thuật toán DFS Recursive Backtracking
    const stack = [];
    let current = this.grid[0][0];
    current.visited = true;

    while (true) {
      // Tìm các ô hàng xóm chưa thăm
      const neighbors = [];
      const { c, r } = current;

      if (r > 0 && !this.grid[r - 1][c].visited) neighbors.push({ cell: this.grid[r - 1][c], dir: 'top' });
      if (c < this.cols - 1 && !this.grid[r][c + 1].visited) neighbors.push({ cell: this.grid[r][c + 1], dir: 'right' });
      if (r < this.rows - 1 && !this.grid[r + 1][c].visited) neighbors.push({ cell: this.grid[r + 1][c], dir: 'bottom' });
      if (c > 0 && !this.grid[r][c - 1].visited) neighbors.push({ cell: this.grid[r][c - 1], dir: 'left' });

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        stack.push(current);

        // Đục tường giữa current và next
        if (next.dir === 'top') {
          current.top = false;
          next.cell.bottom = false;
        } else if (next.dir === 'right') {
          current.right = false;
          next.cell.left = false;
        } else if (next.dir === 'bottom') {
          current.bottom = false;
          next.cell.top = false;
        } else if (next.dir === 'left') {
          current.left = false;
          next.cell.right = false;
        }

        next.cell.visited = true;
        current = next.cell;
      } else if (stack.length > 0) {
        current = stack.pop();
      } else {
        break;
      }
    }

    // Mở các ô ngẫu nhiên: Càng map cao càng ít lối tắt, buộc bé phải quan sát và cẩn thận hơn
    const shortcuts = typeof cfg.shortcuts === 'number' ? cfg.shortcuts : 2;
    for (let i = 0; i < shortcuts; i++) {
      const r = Math.floor(Math.random() * (this.rows - 1));
      const c = Math.floor(Math.random() * (this.cols - 1));
      if (Math.random() > 0.5) {
        this.grid[r][c].right = false;
        this.grid[r][c + 1].left = false;
      } else {
        this.grid[r][c].bottom = false;
        this.grid[r + 1][c].top = false;
      }
    }

    // Mở cửa vào (0, 0) bên trái và cửa ra (cols-1, rows-1) bên phải
    this.grid[0][0].left = false;
    this.grid[this.rows - 1][this.cols - 1].right = false;

    // Tìm đường đi ngắn nhất (BFS Solution) để phục vụ tính năng Gợi Ý
    this.solveShortestPath();

    // Reset trạng thái vẽ
    this.playerPath = [];
    this.isVictory = false;
    this.animatingHero = false;
    this.heroProgress = 0;
    this.isHintVisible = false;
    this.confetti = [];
  }

  /**
   * Tìm đường giải mẫu bằng thuật toán BFS
   */
  solveShortestPath() {
    const queue = [[{ c: 0, r: 0 }]];
    const visited = new Set(['0,0']);
    const targetC = this.cols - 1;
    const targetR = this.rows - 1;

    while (queue.length > 0) {
      const path = queue.shift();
      const curr = path[path.length - 1];

      if (curr.c === targetC && curr.r === targetR) {
        this.shortestPath = path;
        return;
      }

      const cell = this.grid[curr.r][curr.c];

      // Di chuyển lên
      if (!cell.top && curr.r > 0) {
        const key = `${curr.c},${curr.r - 1}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push([...path, { c: curr.c, r: curr.r - 1 }]);
        }
      }
      // Di chuyển phải
      if (!cell.right && curr.c < this.cols - 1) {
        const key = `${curr.c + 1},${curr.r}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push([...path, { c: curr.c + 1, r: curr.r }]);
        }
      }
      // Di chuyển xuống
      if (!cell.bottom && curr.r < this.rows - 1) {
        const key = `${curr.c},${curr.r + 1}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push([...path, { c: curr.c, r: curr.r + 1 }]);
        }
      }
      // Di chuyển trái
      if (!cell.left && curr.c > 0) {
        const key = `${curr.c - 1},${curr.r}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push([...path, { c: curr.c - 1, r: curr.r }]);
        }
      }
    }
  }

  show({ mapLevel } = {}) {
    this.isEncounterMode = false;
    this.encounterData = null;
    this.encounterQuestion = null;
    this.encounterCallback = null;
    this.encounterFailCallback = null;
    this.encounterCancelCallback = null;
    this.wallTouchCount = 0;
    this.overrideMapLevel = mapLevel || null;
    this.generateMaze();
    this.render();
    if (this.container) {
      this.container.style.display = 'flex';
    }

    if (this.audioService) {
      this.audioService.playChime(640, 0.15);
      const hint = this.currentConfig?.voiceHint || 'Mê cung kỳ diệu xuất hiện! Bé hãy chạm tay vào Bé Sâu và vẽ đường để thoát ra nhé!';
      this.audioService.speak(hint);
    }
  }

  /**
   * Kích hoạt Thử Thách Mê Cung khi Vượt Ải trong Đấu Trường Đánh Quái
   * @param {Object} options
   * @param {Object} options.encounter - Thông tin quái vật / boss
   * @param {Object} options.question - Câu hỏi thử thách mê cung
   * @param {Function} options.onComplete - Hàm gọi khi bé vượt mê cung thành công -> Tung chiêu sát thương
   * @param {Function} options.onFail - Hàm gọi khi bé chạm tường >2 lần -> Quái vật phản công gây mất 1 máu
   * @param {Function} options.onCancel - Hàm gọi khi bé đóng modal
   */
  showForEncounter({ encounter, question, mapLevel, onComplete, onFail, onCancel } = {}) {
    this.isEncounterMode = true;
    this.encounterData = encounter;
    this.encounterQuestion = question;
    this.encounterCallback = onComplete;
    this.encounterFailCallback = onFail;
    this.encounterCancelCallback = onCancel;
    this.wallTouchCount = 0;
    this.overrideMapLevel = mapLevel || null;

    if (question?.mazeThemeId) {
      const matchedTheme = MAZE_THEMES.find(t => t.id === question.mazeThemeId);
      if (matchedTheme) this.theme = matchedTheme;
    }

    this.generateMaze(Boolean(question?.mazeThemeId));
    this.render();

    if (this.container) {
      this.container.style.display = 'flex';
    }

    if (this.audioService) {
      this.audioService.playChime(680, 0.18);
      const encName = encounter?.name || 'quái vật';
      const hint = this.currentConfig?.voiceHint || '';
      this.audioService.speak('Thử thách mê cung vượt ải! Bé hãy vẽ đường giúp Bé Sâu vượt qua mê cung để tung chiêu đánh trúng ' + encName + ' nhé! ' + hint);
    }
  }

  hide() {
    if (this._autoAttackTimer) {
      clearTimeout(this._autoAttackTimer);
      this._autoAttackTimer = null;
    }
    if (this.container) {
      this.container.style.display = 'none';
    }
    this.animatingHero = false;
  }

  render() {
    if (!this.container) return;

    const titleIcon = this.isEncounterMode ? '⚔️' : '<img src="/assets/ui/custom_kids_ui/icon_maze_portal_3d.png" class="maze-header-3d-icon" alt="🌀">';
    const titleText = this.isEncounterMode ? 'MÊ CUNG VƯỢT ẢI' : 'MÊ CUNG KỲ DIỆU';
    const themeTag = this.isEncounterMode
      ? `⚔️ ${this.encounterData?.name || this.theme.name}`
      : this.theme.name;

    const instruction = this.isEncounterMode
      ? `👉 <strong>Bé chạm tay vẽ một đường</strong> từ <strong>Bé Sâu</strong> theo lối đi sáng đến <strong>Cổng ${this.theme.goalIcon}</strong> để tung đòn Cầu Xoáy đánh trúng ${this.encounterData?.name || 'quái vật'} nhé!`
      : `👉 <strong>Bé chạm tay vẽ một đường</strong> từ <strong>Bé Sâu</strong> theo lối đi sáng đến <strong>Cổng Cầu Vồng ${this.theme.goalIcon}</strong> nhé!`;

    const victoryBadge = this.isEncounterMode ? '🎉 VƯỢT MÊ CUNG XUẤT SẮC! 🎉' : '🎉 BÉ THẬT TUYỆT VỜI! 🎉';
    const victoryText = this.isEncounterMode
      ? `Bé đã khéo léo dẫn đường cho Bé Sâu vượt qua mê cung! Năng lượng Cầu Vồng đã bùng nổ để tấn công ${this.encounterData?.name || 'quái vật'}!`
      : `Bé đã khéo léo vẽ đường giúp Bé Sâu vượt qua mê cung thành công!`;

    const victoryRewards = this.isEncounterMode
      ? `
        <span class="reward-pill">+40 EXP ✨</span>
        <span class="reward-pill">+1 Đòn Tuyệt Kỹ ⚔️</span>
      `
      : `
        <span class="reward-pill">+30 EXP ✨</span>
        <span class="reward-pill">+1 Ngôi Sao ⭐</span>
      `;

    const victoryActions = this.isEncounterMode
      ? `
        <button type="button" class="maze-btn-victory-attack" id="maze-btn-victory-attack">
          ⚔️ XUẤT CHIÊU TẤN CÔNG NGAY! 💥
        </button>
      `
      : `
        <button type="button" class="maze-btn-victory-replay" id="maze-btn-replay">
          🎲 Thử Mê Cung Khác
        </button>
        <button type="button" class="maze-btn-victory-continue" id="maze-btn-continue">
          🌻 Bé Sẵn Sàng ✨
        </button>
      `;

    this.container.innerHTML = `
      <div class="maze-modal-dialog ${this.isEncounterMode ? 'maze-encounter-dialog' : ''}" role="dialog" aria-modal="true" aria-labelledby="maze-title">
        <!-- Nút Đóng -->
        <button type="button" class="maze-btn-close" id="maze-btn-close" aria-label="Đóng trò chơi mê cung">✕</button>

        <!-- Tiêu Đề Mê Cung kèm Cấp Độ Bản Đồ (càng map cao đường đi càng nhỏ) -->
        <div class="maze-header">
          <div class="maze-title-badge ${this.isEncounterMode ? 'maze-encounter-badge' : ''}">
            <span class="maze-title-icon">${titleIcon}</span>
            <span class="maze-title-text" id="maze-title">${titleText}</span>
            <span class="maze-difficulty-pill" id="maze-difficulty-pill">${this.currentConfig?.levelLabel || 'Cấp 1'}</span>
          </div>
        </div>

        <!-- maze-instruction-text removed per user request -->

        <!-- Khu vực Canvas Mê Cung 16:9 Dạng Ngang To Hơn -->
        <div class="maze-canvas-container" id="maze-canvas-wrap">
          <canvas id="maze-canvas" width="960" height="540"></canvas>
          <div class="maze-feedback-toast" id="maze-feedback-toast" style="display: none;"></div>
        </div>

        <!-- Thanh Nút Điều Khiển Thao Tác Trực Quan -->
        <div class="maze-control-bar">
          <button type="button" class="maze-btn maze-btn-clear" id="maze-btn-clear" title="Xóa đường vẽ để vẽ lại">
            <span>🔄</span> <span>Vẽ Lại</span>
          </button>
          <!-- maze-btn-hint removed per user request -->
          ${!this.isEncounterMode ? `
          <button type="button" class="maze-btn maze-btn-new" id="maze-btn-new" title="Đổi sang một mê cung ngẫu nhiên khác">
            <span>🎲</span> <span>Mê Cung Mới</span>
          </button>
          ` : ''}
          <button type="button" class="maze-btn maze-btn-voice" id="maze-btn-voice" title="Nghe lại hướng dẫn">
            <span>🔊</span> <span>Nghe Gợi Ý</span>
          </button>
        </div>

        <!-- Màn Hình Chúc Mừng Chiến Thắng (Ẩn ban đầu) -->
        <div class="maze-victory-overlay" id="maze-victory-overlay" style="display: none;">
          <div class="maze-victory-card ${this.isEncounterMode ? 'maze-victory-card-encounter' : ''}">
            <div class="maze-victory-badge">${victoryBadge}</div>
            <img src="${this.heroCelebrateImg.src}" class="maze-victory-hero-img" alt="Bé Sâu vui mừng" />
            <p class="maze-victory-text">
              ${victoryText}
            </p>
            <div class="maze-victory-rewards">
              ${victoryRewards}
            </div>
            <div class="maze-victory-actions">
              ${victoryActions}
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.setupCanvas();
    this.draw();
  }

  bindEvents() {
    const btnClose = this.container.querySelector('#maze-btn-close');
    if (btnClose) {
      btnClose.onclick = () => {
        this.hide();
        if (this.isEncounterMode && typeof this.encounterCancelCallback === 'function') {
          this.encounterCancelCallback();
        }
      };
    }

    const btnClear = this.container.querySelector('#maze-btn-clear');
    if (btnClear) {
      btnClear.onclick = () => {
        if (this.animatingHero) return;
        this.playerPath = [];
        this.isVictory = false;
        this.showToast('✨ Đã xóa đường vẽ! Bé hãy chạm vẽ lại từ Bé Sâu nhé!');
        if (this.audioService) this.audioService.playChime(520, 0.08);
        this.draw();
      };
    }

    const btnHint = this.container.querySelector('#maze-btn-hint');
    if (btnHint) {
      btnHint.onclick = () => {
        this.isHintVisible = !this.isHintVisible;
        const label = this.container.querySelector('#maze-hint-label');
        if (label) label.textContent = this.isHintVisible ? 'Ẩn Gợi Ý' : 'Gợi Ý';
        if (this.isHintVisible) {
          this.showToast('💡 Đã bật đường chấm vàng gợi ý lối thoát hiểm!');
          if (this.audioService) {
            this.audioService.playChime(680, 0.1);
            this.audioService.speak('Bé có thể vẽ theo các ngôi sao vàng gợi ý nhé!');
          }
        }
        this.draw();
      };
    }

    const btnNew = this.container.querySelector('#maze-btn-new');
    if (btnNew) {
      btnNew.onclick = () => {
        this.generateMaze();
        const themeTag = this.container.querySelector('.maze-theme-tag');
        if (themeTag) themeTag.textContent = this.theme.name;
        this.showToast('🎲 Mê cung mới đã sẵn sàng!');
        if (this.audioService) this.audioService.playChime(600, 0.1);
        this.draw();
      };
    }

    const btnVoice = this.container.querySelector('#maze-btn-voice');
    if (btnVoice) {
      btnVoice.onclick = () => {
        if (this.audioService) {
          this.audioService.speak('Gợi ý cho bé: Hãy chạm tay vào Bé Sâu và vẽ theo lối đi màu sáng đến Cổng Cầu Vồng nhé! Khéo léo đừng để nét vẽ chạm vào vách tường nha!');
        }
      };
    }

    // Các nút màn hình chiến thắng
    const btnReplay = this.container.querySelector('#maze-btn-replay');
    if (btnReplay) {
      btnReplay.onclick = () => {
        const victoryEl = this.container.querySelector('#maze-victory-overlay');
        if (victoryEl) victoryEl.style.display = 'none';
        this.generateMaze();
        const themeTag = this.container.querySelector('.maze-theme-tag');
        if (themeTag) themeTag.textContent = this.theme.name;
        this.draw();
      };
    }

    const btnContinue = this.container.querySelector('#maze-btn-continue');
    if (btnContinue) {
      btnContinue.onclick = () => {
        this.hide();
      };
    }

    const btnAttack = this.container.querySelector('#maze-btn-victory-attack');
    if (btnAttack) {
      btnAttack.onclick = () => {
        if (this._autoAttackTimer) {
          clearTimeout(this._autoAttackTimer);
          this._autoAttackTimer = null;
        }
        this.hide();
        if (typeof this.encounterCallback === 'function') {
          this.encounterCallback();
        }
      };
    }
  }

  showToast(text) {
    const toast = this.container.querySelector('#maze-feedback-toast');
    if (!toast) return;
    toast.textContent = text;
    toast.style.display = 'block';
    toast.classList.remove('fade-out');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.style.display = 'none';
    }, 2200);
  }

  setupCanvas() {
    this.canvas = this.container.querySelector('#maze-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Lắng nghe sự kiện pointer (Hỗ trợ cả chạm tay cảm ứng & chuột máy tính)
    this.canvas.onpointerdown = (e) => this.handlePointerDown(e);
    this.canvas.onpointermove = (e) => this.handlePointerMove(e);
    this.canvas.onpointerup = (e) => this.handlePointerUp(e);
    this.canvas.onpointercancel = (e) => this.handlePointerUp(e);
  }

  getCanvasPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  getCellCoordinates(c, r) {
    const marginX = 40;
    const marginY = 35;
    const cellW = (this.canvas.width - marginX * 2) / this.cols;
    const cellH = (this.canvas.height - marginY * 2) / this.rows;
    return {
      x: marginX + c * cellW,
      y: marginY + r * cellH,
      w: cellW,
      h: cellH,
      centerX: marginX + c * cellW + cellW / 2,
      centerY: marginY + r * cellH + cellH / 2
    };
  }

  handlePointerDown(e) {
    if (this.isVictory || this.animatingHero) return;
    try { if (e.pointerId != null) this.canvas.setPointerCapture(e.pointerId); } catch {}

    const pos = this.getCanvasPos(e);
    const startCoord = this.getCellCoordinates(0, 0);

    // Kiểm tra xem vị trí chạm có gần điểm bắt đầu hoặc nối tiếp đường đã vẽ không
    const distToStart = Math.hypot(pos.x - startCoord.centerX, pos.y - startCoord.centerY);

    if (this.playerPath.length === 0) {
      if (distToStart < startCoord.w * 0.95) {
        this.isDrawing = true;
        this.playerPath = [{ x: startCoord.centerX, y: startCoord.centerY }, pos];
        if (this.audioService) this.audioService.playChime(640, 0.08);
      } else {
        this.showToast('👉 Bé hãy chạm tay vào bạn Bé Sâu ở điểm bắt đầu nhé!');
      }
    } else {
      // Cho phép tiếp tục vẽ nếu chạm gần điểm cuối cùng của đường đã vẽ
      const lastPoint = this.playerPath[this.playerPath.length - 1];
      const distToLast = Math.hypot(pos.x - lastPoint.x, pos.y - lastPoint.y);
      if (distToLast < startCoord.w * 0.8) {
        this.isDrawing = true;
        this.playerPath.push(pos);
      } else if (distToStart < startCoord.w * 0.8) {
        // Vẽ lại từ đầu
        this.isDrawing = true;
        this.playerPath = [{ x: startCoord.centerX, y: startCoord.centerY }, pos];
      }
    }

    this.draw();
  }

  handlePointerMove(e) {
    if (!this.isDrawing || this.isVictory || this.animatingHero) return;

    const pos = this.getCanvasPos(e);
    const lastPoint = this.playerPath[this.playerPath.length - 1];

    if (!lastPoint) return;

    // Khoảng cách tối thiểu giữa 2 điểm để đường vẽ mượt
    const dist = Math.hypot(pos.x - lastPoint.x, pos.y - lastPoint.y);
    if (dist < 4) return;

    // Kiểm tra va chạm với tường mê cung -> Lập tức thua lượt vẽ theo yêu cầu người dùng
    if (this.checkWallCollision(lastPoint, pos)) {
      this.handleMazeFailure(pos);
      return;
    }

    this.playerPath.push(pos);

    // Kiểm tra đã đến đích (Cổng ra ở ô cuối cùng)
    const goalCoord = this.getCellCoordinates(this.cols - 1, this.rows - 1);
    const distToGoal = Math.hypot(pos.x - goalCoord.centerX, pos.y - goalCoord.centerY);

    if (distToGoal < goalCoord.w * 0.65) {
      this.isDrawing = false;
      this.playerPath.push({ x: goalCoord.centerX, y: goalCoord.centerY });
      this.triggerVictory();
    }

    this.draw();
  }

  handlePointerUp(e) {
    this.isDrawing = false;
  }

    pointNearSegment(px, py, x1, y1, x2, y2, threshold = 8.5) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(px - x1, py - y1) < threshold;
    let t = ((px - x1) * dx + (py - y1) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.hypot(px - projX, py - projY) < threshold;
  }

  handleMazeFailure(pos = null) {
    this.isDrawing = false;
    this.playerPath = [];
    this.failCollisionPoint = pos;
    this.wallTouchCount = (this.wallTouchCount || 0) + 1;

    if (this.canvas) {
      this.canvas.classList.add('maze-fail-shake');
      setTimeout(() => {
        this.canvas?.classList.remove('maze-fail-shake');
        this.failCollisionPoint = null;
        this.draw();
      }, 700);
    }

    // Nếu chạm tường > 2 lần (lần thứ 3 trở lên): Được tính thua, quái vật tấn công làm mất 1 máu!
    if (this.wallTouchCount > 2) {
      this.showToast(`💥 Bé chạm tường lần thứ ${this.wallTouchCount}! Bị tính thua, quái vật phản công làm mất 1 ❤️!`);
      if (this.audioService) {
        this.audioService.playPlayerHurt?.();
        this.audioService.speak?.('Úi, bé chạm tường quá 2 lần rồi! Quái vật phản công làm mất 1 tim!');
      }
      this.draw();

      setTimeout(() => {
        this.hide();
        if (typeof this.encounterFailCallback === 'function') {
          this.encounterFailCallback();
        }
      }, 750);
      return;
    }

    // Lần 1 và 2: Nhắc nhở bé cẩn thận, chưa bị trừ máu, yêu cầu vẽ lại từ Bé Sâu
    this.showToast(`⚠️ Chạm tường lần ${this.wallTouchCount}/2! Bé cẩn thận nhé, chạm quá 2 lần sẽ bị quái vật tấn công!`);
    if (this.audioService) {
      this.audioService.playTryAgain?.();
      this.audioService.speak?.(`Bé chạm tường lần ${this.wallTouchCount} rồi! Bé hãy vẽ lại từ bạn Bé Sâu thật khéo léo nhé!`);
    }
    this.draw();
  }

  /**
   * Kiểm tra xem đoạn đường [p1, p2] có cắt ngang qua bức tường nào của mê cung không
   */
  checkWallCollision(p1, p2) {
    const marginX = 40;
    const marginY = 35;
    const cellW = (this.canvas.width - marginX * 2) / this.cols;
    const cellH = (this.canvas.height - marginY * 2) / this.rows;
    const threshold = this.currentConfig?.collisionThreshold || 8.5;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        const x = marginX + c * cellW;
        const y = marginY + r * cellH;

        // Tường trên
        if (cell.top && (this.linesIntersect(p1.x, p1.y, p2.x, p2.y, x, y, x + cellW, y) || this.pointNearSegment(p2.x, p2.y, x, y, x + cellW, y, threshold))) {
          return true;
        }
        // Tường phải (ngoại trừ cửa ra)
        if (cell.right && !(c === this.cols - 1 && r === this.rows - 1) && (this.linesIntersect(p1.x, p1.y, p2.x, p2.y, x + cellW, y, x + cellW, y + cellH) || this.pointNearSegment(p2.x, p2.y, x + cellW, y, x + cellW, y + cellH, threshold))) {
          return true;
        }
        // Tường dưới
        if (cell.bottom && (this.linesIntersect(p1.x, p1.y, p2.x, p2.y, x, y + cellH, x + cellW, y + cellH) || this.pointNearSegment(p2.x, p2.y, x, y + cellH, x + cellW, y + cellH, threshold))) {
          return true;
        }
        // Tường trái (ngoại trừ cửa vào)
        if (cell.left && !(c === 0 && r === 0) && (this.linesIntersect(p1.x, p1.y, p2.x, p2.y, x, y, x, y + cellH) || this.pointNearSegment(p2.x, p2.y, x, y, x, y + cellH, threshold))) {
          return true;
        }
      }
    }
    return false;
  }

  linesIntersect(a, b, c, d, p, q, r, s) {
    const det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) return false;
    const lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    const gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }

  /**
   * Kích hoạt chuỗi sự kiện Chiến thắng: Bé Sâu chạy dọc theo đường vẽ thoát ra cổng
   */
  triggerVictory() {
    this.isVictory = true;
    this.animatingHero = true;
    this.heroProgress = 0;

    this.showToast('🎉 Tuyệt vời! Bé Sâu đang chạy theo đường bé vẽ để thoát ra!');

    if (this.audioService) {
      this.audioService.playChime(750, 0.12);
    }

    // Animation vòng lặp chạy dọc đường vẽ
    const animate = () => {
      if (!this.animatingHero) return;

      this.heroProgress += 2.5; // Tốc độ di chuyển của nhân vật dọc theo mảng điểm

      if (this.heroProgress >= this.playerPath.length - 1) {
        this.heroProgress = this.playerPath.length - 1;
        this.animatingHero = false;
        this.completeVictory();
        return;
      }

      this.draw();
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  completeVictory() {
    // Tạo pháo hoa chúc mừng
    this.initConfetti();

    if (this.audioService) {
      this.audioService.playSuccess();
      this.audioService.speak('Hoan hô! Bé đã giúp Bé Sâu thoát khỏi mê cung an toàn rồi! Bé giỏi quá!');
    }

    // Tặng thưởng EXP và Ngôi sao
    if (this.progressionSystem) {
      if (typeof this.progressionSystem.addReward === 'function') {
        this.progressionSystem.addReward({ exp: 30, stars: 1 });
      } else if (typeof this.progressionSystem.addRewards === 'function') {
        this.progressionSystem.addRewards({ exp: 30, stars: 1 });
      }
      if (this.saveAdapter && typeof this.saveAdapter.save === 'function') {
        this.saveAdapter.save(this.progressionSystem.state);
      }
    }

    if (this.hudController) {
      this.hudController.updatePlayerHud();
      this.hudController.setStatus('Thoát khỏi mê cung thành công!');
    }

    // YÊU CẦU: "Bỏ pop-up này mà tấn công luôn nhé ."
    // Khi đang trong trận chiến đấu chạm trán (isEncounterMode): Bỏ hoàn toàn pop-up vượt mê cung trung gian,
    // tự động đóng mê cung và tung chiêu tấn công quái vật ngay lập tức!
    if (this.isEncounterMode) {
      setTimeout(() => {
        this.hide();
        if (typeof this.encounterCallback === 'function') {
          this.encounterCallback();
        }
      }, 250);
      return;
    }

    // Hiển thị Overlay Chúc mừng sau 800ms (chỉ dùng cho chế độ chơi mê cung thông thường ngoài sảnh)
    setTimeout(() => {
      const victoryEl = this.container.querySelector('#maze-victory-overlay');
      if (victoryEl) victoryEl.style.display = 'flex';
    }, 800);

    // Vòng lặp pháo hoa
    const renderConfettiLoop = () => {
      if (!this.isVictory) return;
      this.updateConfetti();
      this.draw();
      requestAnimationFrame(renderConfettiLoop);
    };
    requestAnimationFrame(renderConfettiLoop);
  }

  initConfetti() {
    this.confetti = [];
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'];
    for (let i = 0; i < 70; i++) {
      this.confetti.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 300,
        y: this.canvas.height / 2 + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 10,
        vy: -Math.random() * 8 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }
  }

  updateConfetti() {
    for (const p of this.confetti) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // trọng lực
      p.rotation += p.rotSpeed;
    }
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Xóa nền canvas
    ctx.clearRect(0, 0, w, h);

    // 1. Vẽ nền mê cung sàn gạch đồ chơi sáng bóng
    ctx.fillStyle = this.theme.floorColor;
    ctx.fillRect(0, 0, w, h);

    const marginX = 40;
    const marginY = 35;
    const cellW = (w - marginX * 2) / this.cols;
    const cellH = (h - marginY * 2) / this.rows;

    // 2. Vẽ các ô sàn có viền mềm mại
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.035)';
    ctx.lineWidth = 1;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = marginX + c * cellW;
        const y = marginY + r * cellH;
        ctx.strokeRect(x, y, cellW, cellH);
      }
    }

    // 3. Vẽ ô Đích (Goal Exit Portal) phát sáng lung linh
    const goalCoord = this.getCellCoordinates(this.cols - 1, this.rows - 1);
    ctx.save();
    ctx.fillStyle = 'rgba(251, 191, 36, 0.28)';
    ctx.beginPath();
    ctx.arc(goalCoord.centerX, goalCoord.centerY, cellW * 0.42, 0, Math.PI * 2);
    ctx.fill();

    // Vòng tròn hào quang nhấp nháy
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(goalCoord.centerX, goalCoord.centerY, cellW * 0.46, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Biểu tượng đích (tự động co giãn theo cỡ ô)
    const goalFontSize = Math.min(36, Math.max(20, Math.round(cellW * 0.44)));
    ctx.font = goalFontSize + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.theme.goalIcon, goalCoord.centerX, goalCoord.centerY);
    ctx.restore();

    // 4. Vẽ đường Gợi Ý (nếu bật)
    if (this.isHintVisible && this.shortestPath.length > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
      ctx.lineWidth = 5;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      for (let i = 0; i < this.shortestPath.length; i++) {
        const node = this.shortestPath[i];
        const coord = this.getCellCoordinates(node.c, node.r);
        if (i === 0) ctx.moveTo(coord.centerX, coord.centerY);
        else ctx.lineTo(coord.centerX, coord.centerY);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 5. Vẽ bức tường Mê Cung 3D dạng khối đồ chơi dày dặn, bo góc mềm mại
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const cfg = this.currentConfig || MAP_MAZE_CONFIGS[1];

    // Đổ bóng tường (Shadow) - thu hẹp theo cấp độ map để dành diện tích cho đường đi
    ctx.strokeStyle = this.theme.wallShadow;
    ctx.lineWidth = cfg.wallShadowWidth;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        const x = marginX + c * cellW;
        const y = marginY + r * cellH;
        const offsetY = 4;

        if (cell.top) this.drawLine(ctx, x, y + offsetY, x + cellW, y + offsetY);
        if (cell.right && !(c === this.cols - 1 && r === this.rows - 1)) {
          this.drawLine(ctx, x + cellW, y + offsetY, x + cellW, y + cellH + offsetY);
        }
        if (cell.bottom) this.drawLine(ctx, x, y + cellH + offsetY, x + cellW, y + cellH + offsetY);
        if (cell.left && !(c === 0 && r === 0)) {
          this.drawLine(ctx, x, y + offsetY, x, y + cellH + offsetY);
        }
      }
    }

    // Thân tường chính (Main Wall)
    ctx.strokeStyle = this.theme.wallColor;
    ctx.lineWidth = cfg.wallStrokeWidth;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        const x = marginX + c * cellW;
        const y = marginY + r * cellH;

        if (cell.top) this.drawLine(ctx, x, y, x + cellW, y);
        if (cell.right && !(c === this.cols - 1 && r === this.rows - 1)) {
          this.drawLine(ctx, x + cellW, y, x + cellW, y + cellH);
        }
        if (cell.bottom) this.drawLine(ctx, x, y + cellH, x + cellW, y + cellH);
        if (cell.left && !(c === 0 && r === 0)) {
          this.drawLine(ctx, x, y, x, y + cellH);
        }
      }
    }
    ctx.restore();

    // 6. Vẽ ĐƯỜNG TAY BÉ VẼ (Rainbow Magic Glowing Trail)
    if (this.playerPath.length > 1) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Hào quang phát sáng (Neon Outer Glow) - thu nhỏ tương ứng với lòng đường đi hẹp
      ctx.strokeStyle = this.isVictory ? 'rgba(245, 158, 11, 0.45)' : 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = cfg.playerTrailGlowWidth;
      ctx.beginPath();
      ctx.moveTo(this.playerPath[0].x, this.playerPath[0].y);
      for (let i = 1; i < this.playerPath.length; i++) {
        ctx.lineTo(this.playerPath[i].x, this.playerPath[i].y);
      }
      ctx.stroke();

      // Lớp đường vẽ gradient sắc nét
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.35, '#ec4899');
      grad.addColorStop(0.7, '#3b82f6');
      grad.addColorStop(1, '#10b981');

      ctx.strokeStyle = this.isVictory ? '#f59e0b' : grad;
      ctx.lineWidth = cfg.playerTrailStrokeWidth;
      ctx.beginPath();
      ctx.moveTo(this.playerPath[0].x, this.playerPath[0].y);
      for (let i = 1; i < this.playerPath.length; i++) {
        ctx.lineTo(this.playerPath[i].x, this.playerPath[i].y);
      }
      ctx.stroke();

      // Tâm sáng trắng ở giữa
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = cfg.playerTrailCoreWidth;
      ctx.beginPath();
      ctx.moveTo(this.playerPath[0].x, this.playerPath[0].y);
      for (let i = 1; i < this.playerPath.length; i++) {
        ctx.lineTo(this.playerPath[i].x, this.playerPath[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 7. Vẽ Nhân Vật Bé Sâu
    const startCoord = this.getCellCoordinates(0, 0);
    let heroPos = { x: startCoord.centerX, y: startCoord.centerY };

    if (this.animatingHero && this.playerPath.length > 0) {
      const idx = Math.floor(this.heroProgress);
      if (idx < this.playerPath.length) {
        heroPos = this.playerPath[idx];
      }
    } else if (this.playerPath.length > 0 && !this.isVictory) {
      // Bé Sâu di chuyển theo đầu ngón tay bé đang vẽ
      heroPos = this.playerPath[this.playerPath.length - 1];
    } else if (this.isVictory) {
      heroPos = { x: goalCoord.centerX, y: goalCoord.centerY };
    }

    ctx.save();
    const heroSize = cfg.heroSize;
    const heroImgToDraw = this.isVictory ? this.heroCelebrateImg : this.heroImg;

    // Vầng hào quang dưới chân Bé Sâu
    ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.beginPath();
    ctx.ellipse(heroPos.x, heroPos.y + 18, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vẽ sprite Bé Sâu
    if (heroImgToDraw && heroImgToDraw.complete && heroImgToDraw.naturalWidth > 0) {
      ctx.drawImage(heroImgToDraw, heroPos.x - heroSize / 2, heroPos.y - heroSize / 2 - 8, heroSize, heroSize);
    } else {
      ctx.font = '36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐛', heroPos.x, heroPos.y);
    }
    ctx.restore();

    // 8. Vẽ Pháo Hoa Confetti khi chiến thắng
    if (this.isVictory && this.confetti.length > 0) {
      ctx.save();
      for (const p of this.confetti) {
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      ctx.restore();
    }
  }

  drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}
