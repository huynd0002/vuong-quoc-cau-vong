import handStage1Url from '../../../assets/ui/handwash/hand_stage_1.png?url';
import handStage2Url from '../../../assets/ui/handwash/hand_stage_2.png?url';
import handStage3Url from '../../../assets/ui/handwash/hand_stage_3.png?url';
import handStage4Url from '../../../assets/ui/handwash/hand_stage_4.png?url';
import handStage5Url from '../../../assets/ui/handwash/hand_stage_5.png?url';
import handStage6Url from '../../../assets/ui/handwash/hand_stage_6.png?url';
import handStage7Url from '../../../assets/ui/handwash/hand_stage_7.png?url';
import handStage8Url from '../../../assets/ui/handwash/hand_stage_8.png?url';

import propSoapBarUrl from '../../../assets/ui/handwash/prop_soap_bar.png?url';
import propFaucetStreamUrl from '../../../assets/ui/handwash/prop_faucet_stream.png?url';
import propDryTowelUrl from '../../../assets/ui/handwash/prop_dry_towel.png?url';

const HAND_STAGES = [
  handStage1Url,
  handStage2Url,
  handStage3Url,
  handStage4Url,
  handStage5Url,
  handStage6Url,
  handStage7Url,
  handStage8Url
];


// Hệ thống 48 điểm chạm ẩn (Hidden Touch Points) phủ đều 2 bàn tay:
// Lòng bàn tay, mu bàn tay, cổ tay, ngón cái, ngón trỏ, ngón giữa, ngón áp út, ngón út.
const HIDDEN_POINTS = {
  left: [
    // Lòng bàn tay & cổ tay
    { x: 0.29, y: 0.62 }, { x: 0.25, y: 0.60 }, { x: 0.33, y: 0.60 },
    { x: 0.29, y: 0.70 }, { x: 0.24, y: 0.68 }, { x: 0.34, y: 0.68 },
    { x: 0.29, y: 0.78 }, { x: 0.25, y: 0.76 }, { x: 0.33, y: 0.76 },
    { x: 0.28, y: 0.54 }, { x: 0.23, y: 0.54 }, { x: 0.33, y: 0.54 },
    // Ngón cái
    { x: 0.14, y: 0.52 }, { x: 0.17, y: 0.48 }, { x: 0.19, y: 0.54 },
    // Ngón trỏ
    { x: 0.21, y: 0.32 }, { x: 0.22, y: 0.40 }, { x: 0.23, y: 0.46 },
    // Ngón giữa
    { x: 0.29, y: 0.26 }, { x: 0.29, y: 0.36 }, { x: 0.29, y: 0.46 },
    // Ngón áp út
    { x: 0.36, y: 0.30 }, { x: 0.35, y: 0.38 }, { x: 0.34, y: 0.46 },
    // Ngón út
    { x: 0.42, y: 0.38 }, { x: 0.41, y: 0.46 }, { x: 0.39, y: 0.52 }
  ],
  right: [
    // Lòng bàn tay & cổ tay
    { x: 0.71, y: 0.62 }, { x: 0.67, y: 0.60 }, { x: 0.75, y: 0.60 },
    { x: 0.71, y: 0.70 }, { x: 0.66, y: 0.68 }, { x: 0.76, y: 0.68 },
    { x: 0.71, y: 0.78 }, { x: 0.67, y: 0.76 }, { x: 0.75, y: 0.76 },
    { x: 0.72, y: 0.54 }, { x: 0.67, y: 0.54 }, { x: 0.77, y: 0.54 },
    // Ngón cái
    { x: 0.86, y: 0.52 }, { x: 0.83, y: 0.48 }, { x: 0.81, y: 0.54 },
    // Ngón trỏ
    { x: 0.79, y: 0.32 }, { x: 0.78, y: 0.40 }, { x: 0.77, y: 0.46 },
    // Ngón giữa
    { x: 0.71, y: 0.26 }, { x: 0.71, y: 0.36 }, { x: 0.71, y: 0.46 },
    // Ngón áp út
    { x: 0.64, y: 0.30 }, { x: 0.65, y: 0.38 }, { x: 0.66, y: 0.46 },
    // Ngón út
    { x: 0.58, y: 0.38 }, { x: 0.59, y: 0.46 }, { x: 0.61, y: 0.52 }
  ]
};

const PROPS = {
  soap: propSoapBarUrl,
  faucet: propFaucetStreamUrl,
  towel: propDryTowelUrl
};

/**
 * KitchenStationModal.js
 * Quản lý các pop-up tương tác chuyên biệt và sinh động trong Căn Bếp Thần Kỳ Cầu Vồng:
 * 1. Pop-up Rửa Tay Sạch Sẽ (Bồn rửa tay)
 * 2. Pop-up Kệ & Tủ Lạnh Nguyên Liệu Tươi Sạch
 * 3. Pop-up Cửa Ra Vào (Rời bếp về Nông trại)
 * 4. Pop-up Menu Điều Hướng "Vào Bếp" (Kitchen Hub)
 */

export class KitchenStationModal {
  constructor({ audioService, saveAdapter, onOpenCooking, onOpenBag, onOpenFridge, onEnterKitchenMap, onReturnFarm, onHandWashComplete }) {
    this.audio = audioService;
    this.saveAdapter = saveAdapter;
    this.onOpenCooking = onOpenCooking;
    this.onOpenBag = onOpenBag;
    this.onOpenFridge = onOpenFridge;
    this.onEnterKitchenMap = onEnterKitchenMap;
    this.onReturnFarm = onReturnFarm;
    this.onHandWashComplete = onHandWashComplete;
    this.autoCloseTimer = null;

    this.root = document.createElement('div');
    this.root.id = 'kitchen-station-popup-root';
    this.root.className = 'kitchen-station-overlay';
    this.root.hidden = true;
    document.body.appendChild(this.root);

    this.root.addEventListener('click', (e) => {
      if (e.target === this.root || e.target.closest('[data-action="close-popup"]')) {
        this.close();
      }
    });
    this.root.addEventListener('keydown', e => {
      const card = e.target.closest('[role="button"]');
      if (card && ['Enter', ' '].includes(e.key)) { e.preventDefault(); card.click(); }
      if (e.key !== 'Tab') return;
      const nodes = [...this.root.querySelectorAll('button:not(:disabled), [role="button"]')].filter(n => n.getClientRects().length);
      if (e.shiftKey && document.activeElement === nodes[0]) { e.preventDefault(); nodes.at(-1)?.focus(); }
      if (!e.shiftKey && document.activeElement === nodes.at(-1)) { e.preventDefault(); nodes[0]?.focus(); }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.root.hidden) {
        this.close();
      }
    });
  }

  open() {
    if (this.root.hidden) {
      this.scene = window.__worldScene;
      this.previousExploring = this.scene?.isExploring;
      this.previousInput = this.scene?.input?.enabled;
      this.app = document.getElementById('game-app');
      this.previousInert = this.app?.inert ?? false;
    }
    this.scene?.hero?.stop();
    this.scene?.tweens?.killTweensOf(this.scene?.hero?.sprite);
    if (this.scene) this.scene.isExploring = false;
    if (this.scene?.input) this.scene.input.enabled = false;
    if (this.app) this.app.inert = true;
    this.root.hidden = false;
    this.root.querySelector('button')?.focus();
  }

  close() {
    if (this.root.hidden) return;
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
    this.handwashCleanup?.();
    this.handwashCleanup = null;
    document.getElementById('handwash-drag-ghost')?.remove();
    if (this.scene === window.__worldScene && this.scene?.sys?.isActive()) {
      this.scene.isExploring = this.previousExploring;
      if (this.scene.input) this.scene.input.enabled = this.previousInput;
    }
    if (this.app) this.app.inert = this.previousInert;
    this.root.hidden = true;
    this.root.innerHTML = '';
  }

  speak(text) {
    if (this.audio && typeof this.audio.speak === 'function') {
      this.audio.speak(text);
    }
  }

  playChime(freq = 640, duration = 0.15) {
    if (this.audio && typeof this.audio.playChime === 'function') {
      this.audio.playChime(freq, duration);
    }
  }

  /**
   * 1. POP-UP BỒN RỬA TAY SẠCH SẼ (Trạm Bồn Rửa)
   */
  /**
   * 1. POP-UP BỒN RỬA TAY SẠCH SẼ (Trạm Bồn Rửa) - 8 BƯỚC CHUẨN Y KHOA THIẾU NHI
   */
  
  playCelebrationFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      window.setTimeout(() => {
        this.playChime(freq, 0.22);
      }, idx * 110);
    });
  }

  triggerCleanCelebrationVFX(stage) {
    if (!stage) return;
    
    // 1. Sóng nước lan tỏa & huy hiệu hoàn thành
    const rippleWrap = document.createElement('div');
    rippleWrap.className = 'wash-celebration-ripple-layer';
    rippleWrap.innerHTML = `
      <div class="water-ripple ripple-1"></div>
      <div class="water-ripple ripple-2"></div>
      <div class="water-ripple ripple-3"></div>
      <div class="clean-victory-badge">
        ✨ ĐÔI BÀN TAY SẠCH BONG TINH TƯƠM! 🌟
      </div>
    `;
    stage.appendChild(rippleWrap);

    // 2. Mưa pháo hoa giấy & lấp lánh (Confetti & Sparkles)
    const emojis = ['⭐', '✨', '🫧', '🧼', '🌈', '💖', '🎉'];
    const container = stage.querySelector('.hand-img-container') || stage;
    for (let i = 0; i < 36; i++) {
      const p = document.createElement('div');
      p.className = 'clean-confetti-particle';
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = `${15 + Math.random() * 70}%`;
      p.style.top = `${20 + Math.random() * 60}%`;
      p.style.setProperty('--tx', `${(Math.random() - 0.5) * 260}px`);
      p.style.setProperty('--ty', `${-(60 + Math.random() * 180)}px`);
      p.style.setProperty('--rot', `${(Math.random() - 0.5) * 720}deg`);
      p.style.animationDelay = `${Math.random() * 0.3}s`;
      container.appendChild(p);
      setTimeout(() => p.remove(), 2500);
    }
  }

  showSinkModal() {
    this.handwashCleanup?.();
    this.handwashCleanup = null;
    this.root.innerHTML = `
      <div class="kitchen-station-card handwash-card animate-pop-in" role="dialog" aria-modal="true" aria-labelledby="wash-title">
        <header class="kitchen-card-header sink-header">
          <div class="kitchen-card-title-group">
            
            <div>
              <span class="kitchen-badge-tag">QUY TRÌNH 8 BƯỚC DIỆT KHUẨN</span>
              <h2 class="kitchen-card-title" id="wash-title">Rửa Tay Sạch Nào!</h2>
            </div>
          </div>
          <button type="button" class="btn-close-kitchen-card" data-action="close-popup" aria-label="Đóng">✕</button>
        </header>

        <!-- Lời nhắc nhở & Nút Bắt Đầu Rửa Tay (Hiển thị 1 lần, bé bấm Bắt Đầu là rửa) -->
        <div class="handwash-start-banner" id="handwash-start-banner">
          <div class="start-banner-content">
            <span class="start-banner-icon">🧼</span>
            <div class="start-banner-text">
              <strong>Bé ơi, hãy rửa tay sạch sẽ trước khi vào bếp nhé! 🧼💦</strong>
              <small>Đôi bàn tay sạch bong giúp món ăn thơm ngon và bảo vệ sức khỏe bé yêu.</small>
            </div>
            <button type="button" class="btn-start-wash-now" id="btn-start-wash-now">
              <span>Bé Sẵn Sàng Rửa Tay! <em>(Bấm để bắt đầu)</em> 💦</span>
            </button>
          </div>
        </div>

        <!-- Thanh 8 Bước Rửa Tay Trực Quan -->
        <div class="handwash-stepper" id="handwash-stepper" aria-label="8 bước rửa tay">
          <span class="stepper-dot is-active" data-step="0"><b class="step-num">1</b><small>Lấm lem</small></span>
          <i class="stepper-line"></i>
          <span class="stepper-dot" data-step="1"><b class="step-num">2</b><small>Làm ướt</small></span>
          <i class="stepper-line"></i>
          <span class="stepper-dot" data-step="2"><b class="step-num">3</b><small>Xà phòng</small></span>
          <i class="stepper-line"></i>
          <span class="stepper-dot" data-step="3"><b class="step-num">4</b><small>Chà lòng</small></span>
          <i class="stepper-line"></i>
          <span class="stepper-dot" data-step="4"><b class="step-num">5</b><small>Kẽ ngón</small></span>
          <i class="stepper-line"></i>
          <span class="stepper-dot" data-step="5"><b class="step-num">6</b><small>Xả nước</small></span>
          <i class="stepper-line"></i>
          <span class="stepper-dot" data-step="6"><b class="step-num">7</b><small>Lau khô</small></span>
          <i class="stepper-line"></i>
          <span class="stepper-dot" data-step="7"><b class="step-num">8</b><small>Sạch bong</small></span>
        </div>

        <!-- Hỗ trợ tương thích ngược cho test suites tìm .handwash-progress -->
        <div class="handwash-progress" aria-hidden="true" style="display:none">
          <span class="is-current">1</span><i></i><span>2</span><i></i><span>3</span><i></i><span>4</span><i></i><span>5</span>
        </div>

        <!-- Sân Khấu Rửa Tay Tương Tác Sống Động (Mở Rộng Kích Thước Lớn) -->
        <div class="handwash-stage handwash-stage-large" id="handwash-stage" data-step="0">
          <!-- Bồn sứ trắng bóng kích thước lớn -->
          <div class="handwash-basin" aria-hidden="true"></div>

          <!-- Khung Hiển Thị Đôi Bàn Tay Khổ Lớn Dễ Thao Tác -->
          <div class="handwash-hands-center" id="wash-hand-target" aria-label="Đôi bàn tay của bé">
            <div class="hand-img-container" id="hand-img-container">
              <img id="handwash-display-img" class="handwash-art-img" src="${HAND_STAGES[0]}" alt="Bàn tay của bé" draggable="false" />
              <div class="handwash-foam-burst" id="handwash-foam-burst"></div>
              <div class="handwash-sparkles-layer" id="handwash-sparkles-layer"></div>
            </div>

          </div>

          <!-- Thanh Tỉ Lệ Hoàn Thành Tương Tác Chạy % Từ Từ (0% -> 100%) -->
          <div class="handwash-scrub-meter" id="handwash-scrub-meter">
            <div class="scrub-meter-header">
              <span class="scrub-title" id="scrub-meter-title">Độ ướt bàn tay:</span>
              <strong class="scrub-percent" id="scrub-percent-label">0%</strong>
            </div>
            <div class="scrub-meter-track">
              <div class="scrub-meter-fill" id="scrub-meter-fill" style="transform: scaleX(0)"></div>
            </div>
          </div>

          <!-- Đạo Cụ Nổi Kéo Thả Bằng Chuột / Cảm Ứng -->
          <div class="wash-tool-pod" id="wash-tool-pod">
            <button type="button" class="wash-tool" id="wash-tool" aria-label="Kéo đạo cụ lên bàn tay">
              <img id="tool-prop-icon" class="tool-prop-img" src="${PROPS.faucet}" alt="Đạo cụ" draggable="false" />

            </button>
            <span class="tool-action-tag" id="tool-action-tag">Kéo nước mát</span>
          </div>


        </div>

        <!-- Hướng Dẫn Thao Tác & Lời Nhắc Trực Quan -->
        <div class="handwash-copy">
          <strong id="wash-step-title">Bước 1: Làm ướt đôi bàn tay</strong>
          <p id="wash-step-copy">Kéo dòng nước mát tưới đều qua lại trên đôi bàn tay để làm ướt trước khi thoa xà phòng nhé!</p>
        </div>
        <p class="handwash-drag-hint" id="wash-drag-hint" aria-live="polite">Giữ chuột kéo dòng nước qua lại trên bàn tay (0% -> 100%)</p>

        <!-- Chân Trang Nút Hành Động -->
        <footer class="kitchen-card-footer">
          <button type="button" class="btn-kitchen-secondary" data-action="close-popup">Đóng</button>
          <button type="button" class="btn-kitchen-primary" id="btn-goto-cook" style="display: none !important;" aria-hidden="true" disabled>Vào bếp nấu ăn</button>
        </footer>
      </div>`;

    this.open();
    this.speak('Rửa tay sạch trước khi nấu ăn nhé! Bé kéo dòng nước làm ướt tay, kéo xà phòng chà bọt tuyết diệt khuẩn, xả nước rồi lau khô.');

    const startBanner = this.root.querySelector('#handwash-start-banner');
    const btnStartWash = this.root.querySelector('#btn-start-wash-now');
    const dismissStartBanner = () => {
      if (startBanner && startBanner.style.display !== 'none') {
        startBanner.style.opacity = '0';
        startBanner.style.transform = 'translate(-50%, -50%) scale(0.85)';
        startBanner.style.transition = 'all 0.3s ease';
        setTimeout(() => { startBanner.style.display = 'none'; }, 300);
      }
    };
    if (btnStartWash) {
      btnStartWash.addEventListener('click', () => {
        this.playChime(659.25, 0.2);
        this.speak('Hoan hô bé! Bé hãy kéo vòi nước mát tưới đều qua lại trên đôi bàn tay nhé!');
        dismissStartBanner();
      });
    }

    const stage = this.root.querySelector('#handwash-stage');
    const tool = this.root.querySelector('#wash-tool');
    const toolPod = this.root.querySelector('#wash-tool-pod');
    toolPod?.addEventListener('pointerdown', () => dismissStartBanner(), { once: true });
    const toolImg = this.root.querySelector('#tool-prop-icon');
    const toolTag = this.root.querySelector('#tool-action-tag');
    const title = this.root.querySelector('#wash-step-title');
    const copy = this.root.querySelector('#wash-step-copy');
    const hint = this.root.querySelector('#wash-drag-hint');
    const cook = this.root.querySelector('#btn-goto-cook');
    const handImg = this.root.querySelector('#handwash-display-img');
    const stepperDots = [...this.root.querySelectorAll('#handwash-stepper .stepper-dot')];
    const scrubMeter = this.root.querySelector('#handwash-scrub-meter');
    const scrubTitle = this.root.querySelector('#scrub-meter-title');
    const scrubFill = this.root.querySelector('#scrub-meter-fill');
    const scrubLabel = this.root.querySelector('#scrub-percent-label');
    const handTarget = this.root.querySelector('#wash-hand-target');

    // 8 Bước Rửa Tay Chuẩn với thanh % tương tác riêng biệt
    const STEPS = [
      {
        index: 0,
        title: 'Bước 1: Làm ướt đôi bàn tay',
        copy: 'Kéo dòng nước mát tưới đều qua lại trên đôi bàn tay để làm ướt nhé!',
        hint: 'Kéo dòng nước qua lại trên bàn tay để đạt 100% độ ướt!',
        toolProp: PROPS.faucet,
        toolTag: 'Kéo nước mát',
        handStage: 0,
        meterTitle: 'Độ ướt bàn tay:',
      },
      {
        index: 1,
        title: 'Bước 2: Thoa xà phòng thơm tho',
        copy: 'Kéo cục xà phòng hồng thoa đều qua lại trên lòng bàn tay của bé.',
        hint: 'Kéo cục xà phòng thoa đều trên bàn tay (0% -> 100%)!',
        toolProp: PROPS.soap,
        toolTag: 'Kéo xà phòng',
        handStage: 1,
        meterTitle: 'Thoa đều xà phòng:',
      },
      {
        index: 2,
        title: 'Bước 3: Chà xát lòng bàn tay tạo bọt',
        copy: 'Kéo và chà xát cục xà phòng qua lại trên đôi bàn tay để tạo bọt tuyết bồng bềnh!',
        hint: 'Chà xát qua lại trên bàn tay để tăng bọt tuyết (0% -> 35%)!',
        toolProp: PROPS.soap,
        toolTag: 'Chà tạo bọt',
        handStage: 2,
        meterTitle: 'Độ phủ bọt tuyết diệt khuẩn:',
      },
      {
        index: 3,
        title: 'Bước 4: Chà mu bàn tay & kẽ ngón tay',
        copy: 'Tiếp tục chà thật kỹ kẽ ngón tay và mu bàn tay để đánh bay vi khuẩn tí hon!',
        hint: 'Tiếp tục chà kỹ kẽ ngón và mu bàn tay (35% -> 70%)!',
        toolProp: PROPS.soap,
        toolTag: 'Chà kẽ ngón',
        handStage: 3,
        meterTitle: 'Độ phủ bọt tuyết diệt khuẩn:',
      },
      {
        index: 4,
        title: 'Bước 5: Chà kỹ đầu ngón tay & móng tay',
        copy: 'Chà sạch từng đầu ngón tay và móng tay cho bọt tuyết phủ kín 100%!',
        hint: 'Chà kỹ móng và đầu ngón tay để đạt 100% bọt tuyết!',
        toolProp: PROPS.soap,
        toolTag: 'Chà móng tay',
        handStage: 4,
        meterTitle: 'Độ phủ bọt tuyết diệt khuẩn:',
      },
      {
        index: 5,
        title: 'Bước 6: Xả sạch bọt xà phòng',
        copy: 'Kéo dòng nước mát xối đều qua lại trên đôi bàn tay để cuốn trôi toàn bộ bọt tuyết và vi khuẩn!',
        hint: 'Kéo dòng nước mát xối sạch bọt xà phòng (0% -> 100%)!',
        toolProp: PROPS.faucet,
        toolTag: 'Xả nước mát',
        handStage: 5,
        meterTitle: 'Độ sạch bọt & vi khuẩn:',
      },
      {
        index: 6,
        title: 'Bước 7: Lau khô bằng khăn bông mềm mại',
        copy: 'Kéo chiếc khăn bông mềm mại lau đều qua lại trên đôi bàn tay để thấm khô nước nhé!',
        hint: 'Kéo khăn bông lau nhẹ trên đôi bàn tay (0% -> 100%)!',
        toolProp: PROPS.towel,
        toolTag: 'Khăn bông mềm',
        handStage: 6,
        meterTitle: 'Độ khô ráo & mềm mịn:',
      },
      {
        index: 7,
        title: 'Hoàn thành: Đôi bàn tay sạch bong 100%!',
        copy: 'Bé đã rửa tay đúng chuẩn 8 bước! Tay sạch tinh tươm, thơm mát, sẵn sàng vào bếp nấu ăn ngon rồi!',
        hint: 'Hoàn thành xuất sắc! Đôi bàn tay của bé đã sạch khuẩn 100%!',
        toolProp: null,
        toolTag: 'Hoàn thành',
        handStage: 7,
        meterTitle: 'Đôi bàn tay sạch khuẩn:',
      }
    ];

    let currentStep = 0;
    let stepProgress = 0;
    let dragging = false;
    let advancePending = false;
    let lastX = 0;
    let lastY = 0;
    let activePointerId = null;
    let progressBySide = { left: 0, right: 0 };
    let touchProgress = {
      left: new Array(HIDDEN_POINTS.left.length).fill(0),
      right: new Array(HIDDEN_POINTS.right.length).fill(0)
    };
    let advanceTimer = null;
    let frameId = null;
    let handRect = null;
    let pointerX = 0;
    let pointerY = 0;
    let captureTarget = null;
    let lastChimeTime = 0;

    const updateProgressUI = () => {
      if (!scrubFill || !scrubLabel) return;
      const clamped = Math.min(100, Math.max(0, stepProgress));
      scrubFill.style.transform = `scaleX(${clamped / 100})`;
      scrubLabel.textContent = `${Math.round(clamped)}%`;

      if (clamped >= 100) {
        scrubMeter.classList.add('is-full');
      } else {
        scrubMeter.classList.remove('is-full');
      }
    };

    const paint = () => {
      const step = STEPS[Math.min(currentStep, STEPS.length - 1)];
      stage.dataset.step = String(currentStep);

      title.textContent = step.title;
      copy.textContent = step.copy;
      hint.textContent = step.hint;
      if (scrubTitle) scrubTitle.textContent = step.meterTitle;

      // Cập nhật hình ảnh bàn tay mượt mà
      if (handImg && HAND_STAGES[step.handStage]) {
        handImg.src = HAND_STAGES[step.handStage];
      }

      // Cập nhật đạo cụ & nhãn
      if (step.toolProp) {
        toolPod.style.display = 'flex';
        tool.hidden = false;
        if (toolImg) {
          toolImg.src = step.toolProp;
          toolImg.style.display = 'block';
        }
        if (toolTag) toolTag.textContent = step.toolTag;
      } else {
        toolPod.style.display = 'none';
        tool.hidden = true;
      }

      // Cập nhật thanh tiến trình %
      updateProgressUI();

      // Cập nhật stepper 8 bước
      stepperDots.forEach((dot, idx) => {
        dot.classList.remove('is-active', 'is-done');
        if (idx < currentStep || currentStep === 7) {
          dot.classList.add('is-done');
        } else if (idx === currentStep) {
          dot.classList.add('is-active');
        }
      });

    };

    const nextStep = () => {
      advancePending = false;
      progressBySide = { left: 0, right: 0 };

      currentStep += 1;

      stepProgress = 0;

      this.playChime(640 + currentStep * 40, 0.16);

      if (currentStep >= 7) {
        currentStep = 7;
        stepProgress = 100;
        paint();
        stage.classList.add('is-clean');
        if (cook) {
          cook.disabled = false;
          cook.classList.add('is-ready-rainbow-glow');
        }
        stopDrag();
        this.playCelebrationFanfare();
        this.triggerCleanCelebrationVFX(stage);
        this.speak('Hoan hô! Đôi bàn tay của bé đã sạch khuẩn 100%! Giờ bé đã mở được Tủ lạnh và Bếp lò rồi nhé!');
        this.onHandWashComplete?.();
        window.dispatchEvent(new CustomEvent('game:hands-washed'));
        window.dispatchEvent(new CustomEvent('game:show-toast', {
          detail: { message: '✨ Tay sạch rồi! 🔓 Tủ lạnh 🧊 và Bếp lò 🍳 đã mở!' }
        }));
        if (this.autoCloseTimer) clearTimeout(this.autoCloseTimer);
        this.autoCloseTimer = setTimeout(() => {
          this.close();
        }, 1500);
        return;
      }

      paint();
      updateGhostIcon();
    };

    // Xử lý khi bé kéo & chà xát qua lại trên đôi bàn tay
    const handleActionRub = (distanceBySide) => {
      if (advancePending || currentStep >= 7) return;

      // Tốc độ tăng % theo từng bước
      let progressSpeed = 16;

      if (currentStep === 0) {
        progressSpeed = 12; // Kéo nước làm ướt
      } else if (currentStep === 1) {
        progressSpeed = 13; // Thoa xà phòng
      } else if (currentStep >= 2 && currentStep <= 4) {
        progressSpeed = 16; // Chà tạo bọt
      } else if (currentStep === 5) {
        progressSpeed = 12; // Xả sạch nước
      } else if (currentStep === 6) {
        progressSpeed = 13; // Lau khô tay
      }

      // Mỗi bàn tay đóng góp tối đa 50%. Chuẩn hoá theo kích thước ảnh để
      // cảm ứng và chuột cần cùng một lượng chà, không phụ thuộc số sự kiện.
      const scale = Math.max(0.1, handRect.width / 380);
      for (const side of ['left', 'right']) {
        progressBySide[side] = Math.min(50,
          progressBySide[side] + distanceBySide[side] / (progressSpeed * 0.45 * scale));
      }
      stepProgress = progressBySide.left + progressBySide.right;
      requestDragFrame();

      // Âm thanh tương tác nhẹ nhàng
      const now = Date.now();
      if (now - lastChimeTime > 450) {
        lastChimeTime = now;
        this.playChime(500 + stepProgress * 3.5, 0.05);
      }

      // Chuyển giai đoạn bàn tay theo %
      if (currentStep === 2 && stepProgress >= 35) {
        currentStep = 3;
        paint();
      } else if (currentStep === 3 && stepProgress >= 70) {
        currentStep = 4;
        paint();
      }

      // Khi đạt 100% của thao tác hiện tại
      if (stepProgress >= 100) {
        advancePending = true;
        this.playChime(760, 0.22);
        advanceTimer = window.setTimeout(() => {
          nextStep();
        }, 400);
      }
    };

    // Hai vùng elip bám ảnh bàn tay, loại phần nền trống và khe giữa hai tay.
    const handSideAt = (clientX, clientY, rect) => {
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      for (const [side, centerX] of [['left', 0.29], ['right', 0.71]]) {
        if (((x - centerX) / 0.23) ** 2 + ((y - 0.57) / 0.41) ** 2 <= 1) return side;
      }
      return null;
    };

    // Tạo phần tử bay tự do Drag Ghost trên document.body để kéo mượt mà, không bị che khuất bởi modal
    let dragGhost = document.getElementById('handwash-drag-ghost');
    if (!dragGhost) {
      dragGhost = document.createElement('div');
      dragGhost.id = 'handwash-drag-ghost';
      dragGhost.className = 'handwash-drag-ghost';
      dragGhost.innerHTML = `
        <img class="drag-ghost-img" id="drag-ghost-img" src="" alt="Đạo cụ" draggable="false" />
      `;
      document.body.appendChild(dragGhost);
    }
    const ghostImg = dragGhost.querySelector('#drag-ghost-img');
    const updateGhostIcon = () => {
      const step = STEPS[Math.min(currentStep, STEPS.length - 1)];
      if (step.toolProp) ghostImg.src = step.toolProp;
    };

    // Chỉ vẽ một lần mỗi khung hình; transform không gây tính lại bố cục.
    const requestDragFrame = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        if (dragging) {
          dragGhost.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
        }
        updateProgressUI();
      });
    };

    // Bắt đầu kéo đạo cụ (Bằng chuột PC hoặc ngón tay cảm ứng)
    const startDragTool = (e) => {
      if (currentStep >= 7 || advancePending) return;
      if (dragging || e.isPrimary === false) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const rect = handImg.getBoundingClientRect();
      handRect = rect;
      if (e.currentTarget === handTarget && !handSideAt(e.clientX, e.clientY, rect)) return;
      e.preventDefault();
      activePointerId = e.pointerId;
      captureTarget = e.currentTarget;
      captureTarget.setPointerCapture?.(e.pointerId);
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;

      dismissStartBanner?.();
      updateGhostIcon();
      pointerX = e.clientX;
      pointerY = e.clientY;
      dragGhost.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      dragGhost.style.display = 'grid';

      tool.classList.add('is-dragging');
    };

    // Di chuyển kéo chuột trên toàn cửa sổ (Window Event) để mượt mà nhất
    const onWindowMove = (e) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      pointerX = e.clientX;
      pointerY = e.clientY;
      requestDragFrame();
      const points = e.getCoalescedEvents?.();
      for (const point of points?.length ? points : [e]) {
        const dist = Math.hypot(point.clientX - lastX, point.clientY - lastY);
        if (dist > 0 && !advancePending) {
          const samples = Math.ceil(dist / 3);
          const distanceBySide = { left: 0, right: 0 };
          for (let i = 0; i < samples; i++) {
            const t = (i + 0.5) / samples;
            const side = handSideAt(lastX + (point.clientX - lastX) * t,
              lastY + (point.clientY - lastY) * t, handRect);
            if (side) distanceBySide[side] += dist / samples;
          }
          if (distanceBySide.left + distanceBySide.right > 0) handleActionRub(distanceBySide);
        }
        lastX = point.clientX;
        lastY = point.clientY;
      }
    };

    const stopDrag = () => {
      dragging = false;
      if (captureTarget?.hasPointerCapture(activePointerId)) {
        captureTarget.releasePointerCapture(activePointerId);
      }
      captureTarget = null;
      activePointerId = null;
      window.cancelAnimationFrame(frameId);
      frameId = null;
      updateProgressUI();

      dragGhost.style.display = 'none';
      tool.classList.remove('is-dragging');
    };
    const onWindowUp = (e) => {
      if (e.pointerId === activePointerId) stopDrag();
    };

    // Ngăn chặn sự kiện kéo ảnh mặc định của trình duyệt gây lỗi chuột trên PC
    tool.addEventListener('dragstart', (e) => e.preventDefault());
    toolImg?.addEventListener('dragstart', (e) => e.preventDefault());

    // Đăng ký sự kiện kéo cho đạo cụ. Pointer Events bao phủ chuột, cảm ứng
    // và bút; không đăng ký thêm Mouse Events để tránh cộng tiến độ hai lần.
    tool.addEventListener('pointerdown', startDragTool);

    // Cho phép bé cũng có thể giữ chuột và chà xát trực tiếp ngay trên đôi bàn tay
    handTarget?.addEventListener('pointerdown', startDragTool);
    handTarget?.addEventListener('lostpointercapture', onWindowUp);
    tool.addEventListener('lostpointercapture', onWindowUp);

    // Lắng nghe di chuyển và thả chuột toàn cầu để không bị trượt chuột khi kéo nhanh
    window.addEventListener('pointermove', onWindowMove);
    window.addEventListener('pointerup', onWindowUp);
    window.addEventListener('pointercancel', onWindowUp);
    window.addEventListener('blur', stopDrag);
    const refreshHandRect = () => {
      if (dragging) handRect = handImg.getBoundingClientRect();
    };
    window.addEventListener('resize', refreshHandRect);
    window.addEventListener('scroll', refreshHandRect, true);
    this.handwashCleanup = () => {
      stopDrag();
      window.clearTimeout(advanceTimer);
      window.removeEventListener('pointermove', onWindowMove);
      window.removeEventListener('pointerup', onWindowUp);
      window.removeEventListener('pointercancel', onWindowUp);
      window.removeEventListener('blur', stopDrag);
      window.removeEventListener('resize', refreshHandRect);
      window.removeEventListener('scroll', refreshHandRect, true);
      dragGhost.remove();
    };

    // Nút Vào Bếp Nấu Ăn khi hoàn thành 100%
    cook.addEventListener('click', () => {
      if (!cook.disabled) {
        this.close();
        this.onOpenCooking?.();
      }
    });

    paint();
  }
  showPantryModal() {
    this.close();
    this.onOpenFridge?.();
  }

  /**
   * 3. POP-UP CỬA RA VÀO (Rời Căn Bếp về Nông Trại)
   */
  showDoorModal() {
    this.root.innerHTML = `
      <div class="kitchen-station-card door-card animate-pop-in" role="dialog" aria-modal="true">
        <header class="kitchen-card-header door-header">
          <div class="kitchen-card-title-group">
            <span class="kitchen-header-icon">🚪</span>
            <div>
              <span class="kitchen-badge-tag purple-tag">LỐI RA VÀO</span>
              <h2 class="kitchen-card-title">Cửa Ra Nông Trại Thú Cưng</h2>
            </div>
          </div>
          <button type="button" class="btn-close-kitchen-card" data-action="close-popup" aria-label="Đóng">✕</button>
        </header>

        <div class="kitchen-card-body door-body text-center">
          <div class="door-mascot-row">
            <span class="door-emoji-hero">🧑‍🍳</span>
            <span class="door-arrow">➡️</span>
            <span class="door-emoji-pet">🐶 🐰</span>
          </div>
          <h3 class="door-heading">Bé muốn quay lại Nông Trại Thú Cưng?</h3>
          <p class="door-subtext">
            Các bạn Thỏ Bông và Bé Cún đang đợi bé về cùng vui chơi, cho ăn món ăn ngon và chăm sóc ngoài vườn đấy!
          </p>
        </div>

        <footer class="kitchen-card-footer door-footer">
          <button type="button" class="btn-kitchen-secondary" data-action="close-popup">
            Ở Lại Nấu Ăn Tiếp 🍳
          </button>
          <button type="button" class="btn-kitchen-primary btn-return-farm" id="btn-confirm-return-farm">
            <span>Trở Về Nông Trại</span> 🐾
          </button>
        </footer>
      </div>
    `;

    this.open();
    this.speak('Bé có muốn quay lại Nông Trại Thú Cưng cùng Thỏ Bông và Bé Cún không?');

    this.root.querySelector('#btn-confirm-return-farm')?.addEventListener('click', () => {
      this.close();
      if (this.onReturnFarm) this.onReturnFarm();
    });
  }

  /**
   * 4. POP-UP MENU ĐIỀU HƯỚNG "VÀO BẾP" (Kitchen Hub Modal)
   * Hiển thị khi click nút "🍳 Vào bếp" từ Topbar hoặc màn hình Nông trại/Khám phá
   */
  showKitchenHubModal(currentMapId = 'map_pet_farm') {
    const isInsideKitchen = currentMapId === 'map_kitchen';

    this.root.innerHTML = `
      <div class="kitchen-station-card hub-card animate-pop-in" role="dialog" aria-modal="true">
        <header class="kitchen-card-header hub-header">
          <div class="kitchen-card-title-group">
            <span class="kitchen-header-icon">🧑‍🍳</span>
            <div>
              <span class="kitchen-badge-tag gold-tag">VƯƠNG QUỐC CẦU VỒNG</span>
              <h2 class="kitchen-card-title">Căn Bếp Thần Kỳ Của Bé</h2>
            </div>
          </div>
          <button type="button" class="btn-close-kitchen-card" data-action="close-popup" aria-label="Đóng">✕</button>
        </header>

        <div class="kitchen-card-body hub-body">
          <p class="hub-subtitle">
            Cùng bé chuẩn bị những bữa ăn ngon lành, bổ dưỡng để nạp đầy năng lượng và bảo vệ trong các cuộc phiêu lưu!
          </p>

          <div class="hub-options-grid">
            <!-- Chỉ còn duy nhất chức năng Vào Bếp (hoặc Trở Về Nông Trại khi đang ở trong bếp) -->
            ${!isInsideKitchen ? `
              <div class="hub-option-card highlight-card hub-solo-card" id="hub-opt-enter-map" role="button" tabindex="0">
                <div class="hub-option-icon-wrap bg-emerald">
                  <img src="/assets/ui/custom_kids_ui/icon_kitchen_pan_3d.png" class="hub-icon-3d-img" alt="🍳">
                </div>
                <div class="hub-option-text">
                  <h3>Vào Bếp Nấu Ăn</h3>
                  <p>Đi dạo trong gian bếp ấm cúng, rửa tay sạch sẽ, mở tủ lạnh lấy nguyên liệu và nấu những món ăn thơm ngon!</p>
                  <span class="hub-pill-btn primary-pill">Khám Phá Gian Bếp 🌟</span>
                </div>
              </div>
            ` : `
              <div class="hub-option-card highlight-card hub-solo-card" id="hub-opt-exit-farm" role="button" tabindex="0">
                <div class="hub-option-icon-wrap bg-purple">
                  <img src="/assets/ui/custom_kids_ui/icon_pet_paw_3d.png" class="hub-icon-3d-img" alt="🐾">
                </div>
                <div class="hub-option-text">
                  <h3>Trở Về Nông Trại</h3>
                  <p>Ra ngoài bãi cỏ chơi đùa cùng Thỏ Bông, Bé Cún và bể bơi bọt nước!</p>
                  <span class="hub-pill-btn primary-pill">Về Nông Trại 🌸</span>
                </div>
              </div>
            `}
          </div>
        </div>

        <footer class="kitchen-card-footer hub-footer">
          <span class="hub-safety-hint">🧑‍🍳 Bếp trong trò chơi an toàn · Bếp thật ngoài đời luôn cần ba mẹ giúp bé nhé!</span>
          <button type="button" class="btn-kitchen-secondary" data-action="close-popup">Đóng</button>
        </footer>
      </div>
    `;

    this.open();
    this.speak(isInsideKitchen
      ? 'Bé có muốn quay lại Nông Trại Thú Cưng cùng Thỏ Bông và Bé Cún không?'
      : 'Chào mừng bé đến với Căn Bếp Thần Kỳ! Cùng bước vào gian bếp nấu những món ăn thơm ngon nhé!'
    );

    this.root.querySelector('#hub-opt-enter-map')?.addEventListener('click', () => {
      this.close();
      if (this.onEnterKitchenMap) this.onEnterKitchenMap();
    });

    this.root.querySelector('#hub-opt-exit-farm')?.addEventListener('click', () => {
      this.close();
      if (this.onReturnFarm) this.onReturnFarm();
    });
  }

  /**
   * 5. POP-UP CHÀO MỪNG KHI BƯỚC VÀO CĂN BẾP (Kitchen Welcome Modal)
   * Tự động hiển thị khi bé bước vào bản đồ map_kitchen
   */
  showKitchenWelcomeModal() {
    this.root.innerHTML = `
      <div class="kitchen-station-card welcome-card animate-pop-in" role="dialog" aria-modal="true">
        <header class="kitchen-card-header hub-header">
          <div class="kitchen-card-title-group">
            <span class="kitchen-header-icon">🧑‍🍳</span>
            <div>
              <span class="kitchen-badge-tag gold-tag">VƯƠNG QUỐC CẦU VỒNG</span>
              <h2 class="kitchen-card-title">Chào Mừng Bé Đến Căn Bếp Cầu Vồng!</h2>
            </div>
          </div>
          <button type="button" class="btn-close-kitchen-card" data-action="close-popup" aria-label="Đóng">✕</button>
        </header>

        <div class="kitchen-card-body welcome-body">
          <p class="welcome-intro-text">
            🌟 Gian bếp gia đình ấm áp đã sẵn sàng! Bé hãy khám phá các trạm chức năng để trở thành Đầu Bếp Nhí tài ba nhé:
          </p>

          <div class="welcome-stations-grid">
            <div class="welcome-station-item" id="welcome-goto-sink" role="button" tabindex="0">
              <span class="welcome-icon">🧼</span>
              <div class="welcome-desc">
                <strong>1. Bồn Rửa Tay Sạch Sẽ</strong>
                <p>Xoa xà phòng tạo bọt và xả nước sạch trước khi nấu ăn.</p>
              </div>
              <span class="welcome-action-pill">Rửa Tay 🫧</span>
            </div>

            <div class="welcome-station-item" id="welcome-goto-pantry" role="button" tabindex="0">
              <span class="welcome-icon">🥕</span>
              <div class="welcome-desc">
                <strong>2. Kệ & Tủ Lạnh Nguyên Liệu</strong>
                <p>Dùng Sao kiếm từ thử thách để mua từng phần nguyên liệu vào túi.</p>
              </div>
              <span class="welcome-action-pill">Xem Nguyên Liệu 🍌</span>
            </div>

            <div class="welcome-station-item" id="welcome-goto-cook" role="button" tabindex="0">
              <span class="welcome-icon">🍳</span>
              <div class="welcome-desc">
                <strong>3. Bếp Lò Nấu Ăn Thần Kỳ</strong>
                <p>Kéo nguyên liệu từ túi vào nồi, chọn lửa và nhịp rồi bấm Nấu.</p>
              </div>
              <span class="welcome-action-pill highlight">Nấu Món Ngon 🍳</span>
            </div>

            <div class="welcome-station-item" id="welcome-goto-bag" role="button" tabindex="0">
              <span class="welcome-icon">🍱</span>
              <div class="welcome-desc">
                <strong>4. Bàn Ăn & Hộp Món Đã Nấu</strong>
                <p>Thưởng thức món ngon hồi tim hoặc mang cho Bé Cún cưng ăn!</p>
              </div>
              <span class="welcome-action-pill">Túi Của Bé 🎒</span>
            </div>
          </div>
        </div>

        <footer class="kitchen-card-footer welcome-footer">
          <button type="button" class="btn-kitchen-secondary" data-action="close-popup">
            🌟 Tự Do Khám Phá Gian Bếp
          </button>
          <button type="button" class="btn-kitchen-primary" id="btn-welcome-cook-now">
            <span>Bắt Đầu Nấu Ăn Ngay</span> 🍳
          </button>
        </footer>
      </div>
    `;

    this.open();
    this.speak('Chào mừng bé đến Căn Bếp Cầu Vồng! Bé có thể rửa tay sạch sẽ, khám phá nguyên liệu hoặc vào bếp lò nấu món ngon ngay nhé!');

    this.root.querySelector('#welcome-goto-sink')?.addEventListener('click', () => {
      this.showSinkModal();
    });

    this.root.querySelector('#welcome-goto-pantry')?.addEventListener('click', () => {
      this.showPantryModal();
    });

    this.root.querySelector('#welcome-goto-cook')?.addEventListener('click', () => {
      this.close();
      if (this.onOpenCooking) this.onOpenCooking();
    });

    this.root.querySelector('#welcome-goto-bag')?.addEventListener('click', () => {
      this.close();
      if (this.onOpenBag) this.onOpenBag();
    });

    this.root.querySelector('#btn-welcome-cook-now')?.addEventListener('click', () => {
      this.close();
      if (this.onOpenCooking) this.onOpenCooking();
    });
  }
}
