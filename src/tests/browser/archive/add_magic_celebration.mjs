import fs from 'fs';

// 1. Update src/styles/fishing.css with magic celebration styles
let css = fs.readFileSync('src/styles/fishing.css', 'utf8');

const magicCss = `
/* Cá hiếm / Thần thoại: Hiệu ứng Magic rực rỡ đỉnh cao ăn mừng */
.onmap-catch-visual-card.rare-fish-magic-celebration {
  flex-direction: column;
  padding: 22px 36px;
  border-radius: 36px;
  border: 4.5px solid #c084fc;
  background: radial-gradient(circle at 50% 30%, #ffffff 0%, #faf5ff 40%, #fef3c7 75%, #f3e8ff 100%);
  box-shadow: 0 0 0 8px rgba(192, 132, 252, 0.5), 0 0 45px rgba(245, 158, 11, 0.7), 0 25px 60px rgba(147, 51, 234, 0.55);
  animation: magicFishCardEntrance 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  position: absolute;
  overflow: visible;
  z-index: 1300;
}

@keyframes magicFishCardEntrance {
  0% {
    opacity: 0;
    transform: translate(-50%, -30%) scale(0.3) rotate(-8deg);
  }
  60% {
    transform: translate(-50%, -52%) scale(1.12) rotate(3deg);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
}

.magic-ribbon-title {
  background: linear-gradient(90deg, #ec4899, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ec4899);
  background-size: 300% 100%;
  animation: magicRainbowGradient 3s linear infinite;
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 900;
  padding: 6px 22px;
  border-radius: 999px;
  border: 2.5px solid #ffffff;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.45), 0 0 20px rgba(250, 204, 21, 0.6);
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

@keyframes magicRainbowGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.magic-halo-wrap {
  width: 120px !important;
  height: 120px !important;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.magic-aura-ring {
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  border: 3.5px dashed #facc15;
  box-shadow: 0 0 25px rgba(250, 204, 21, 0.8), inset 0 0 15px rgba(192, 132, 252, 0.6);
  animation: magicRingSpin 4s linear infinite;
  pointer-events: none;
}

@keyframes magicRingSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.magic-celestial-rays {
  position: absolute;
  width: 280px;
  height: 280px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(250, 204, 21, 0.4) 0%, rgba(192, 132, 252, 0.3) 50%, transparent 75%);
  border-radius: 50%;
  z-index: -1;
  animation: magicSunburstPulse 2s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes magicSunburstPulse {
  0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.7; }
  100% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
}
`;

if (!css.includes('.rare-fish-magic-celebration')) {
  css += magicCss;
  fs.writeFileSync('src/styles/fishing.css', css, 'utf8');
  console.log('fishing.css updated with magic celebration styles');
}

// 2. Update src/game/scenes/WorldScene.js to trigger magic celebration on rare fish
let ws = fs.readFileSync('src/game/scenes/WorldScene.js', 'utf8');
const normalize = s => s.replace(/\r\n/g, '\n');
ws = normalize(ws);

const targetWsCatch = `    const isBigFish = (caughtFish.weightG >= 500);

    // Hiệu ứng tia nước tung tóe và Bé nhảy mừng trên cầu gỗ
    this.spawnStationParticles(castX, castY, ['💦', '🎉', '⭐', '🪷', '🌈'], 0x38bdf8);
    if (this.hero?.sprite) {
      this.tweens.add({
        targets: this.hero.sprite,
        y: this.hero.sprite.y - 18,
        yoyo: true,
        repeat: isBigFish ? 3 : 1,
        duration: 180,
        ease: 'Back.easeOut'
      });
    }

    // 3. Vinh danh Danh Hiệu khi câu cá tại vị trí khoanh đỏ (kèm âm thanh chúc mừng & VFX rung ánh sáng)
    this.showFishingTitleCelebration(caughtFish, isBigFish);

    const sellStars = calculateFishSellPrice(caughtFish.weightG);
    const oldToast = document.getElementById('onmap-catch-visual-card');
    if (oldToast) oldToast.remove();

    const card = document.createElement('div');
    card.id = 'onmap-catch-visual-card';

    if (isBigFish) {`;

const replacementWsCatch = `    const isRareFish = (caughtFish.speciesId === 'rainbow_fish' || caughtFish.speciesId === 'sun_spot_fish' || sp.id === 'rainbow_fish' || sp.id === 'sun_spot_fish');
    const isBigFish = (caughtFish.weightG >= 500);

    // Hiệu ứng tia nước tung tóe và Bé nhảy mừng trên cầu gỗ
    this.spawnStationParticles(castX, castY, isRareFish ? ['✨', '🌟', '🌈', '💫', '⭐', '🪄', '🔮'] : ['💦', '🎉', '⭐', '🪷', '🌈'], 0x38bdf8);
    if (this.hero?.sprite) {
      this.tweens.add({
        targets: this.hero.sprite,
        y: this.hero.sprite.y - 20,
        yoyo: true,
        repeat: isRareFish ? 6 : (isBigFish ? 3 : 1),
        duration: 180,
        ease: 'Back.easeOut'
      });
    }

    // 3. Vinh danh Danh Hiệu khi câu cá tại vị trí khoanh đỏ (kèm âm thanh chúc mừng & VFX rung ánh sáng)
    this.showFishingTitleCelebration(caughtFish, isBigFish || isRareFish);

    const sellStars = calculateFishSellPrice(caughtFish.weightG);
    const oldToast = document.getElementById('onmap-catch-visual-card');
    if (oldToast) oldToast.remove();

    const card = document.createElement('div');
    card.id = 'onmap-catch-visual-card';

    if (isRareFish) {
      // CÁ THẦN THOẠI QUÝ HIẾM: Hiệu ứng Magic cực đỉnh, tia sáng vũ trụ, vinh danh rực rỡ!
      card.className = 'onmap-catch-visual-card rare-fish-magic-celebration';
      card.innerHTML = \`
        <div class="magic-celestial-rays"></div>
        <div class="magic-ribbon-title">✨ 🌟 🌈 CÁ THẦN THOẠI QUÝ HIẾM! 🌈 🌟 ✨</div>
        <div class="big-fish-halo magic-halo-wrap">
          <div class="magic-aura-ring"></div>
          <img src="\${caughtFish.asset}" alt="\${caughtFish.name}" style="position:relative;z-index:2;width:96px;height:96px;object-fit:contain;filter:drop-shadow(0 0 14px rgba(250,204,21,0.85));" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-flex';" />
          <span style="display:none;font-size:4.2rem;line-height:1;position:relative;z-index:2;">\${caughtFish.icon || '🌈'}</span>
          <span style="position:absolute;top:-6px;right:-14px;background:linear-gradient(135deg,#f59e0b,#ea580c);border:2.5px solid #ffffff;color:#fff;font-size:1.05rem;font-weight:900;padding:3px 12px;border-radius:999px;box-shadow:0 0 15px rgba(245,158,11,0.8);z-index:3;">⭐ +\${sellStars}</span>
        </div>
        <div class="onmap-catch-meta" style="font-size:1.15rem;gap:12px;margin-top:8px;">
          <span class="onmap-catch-weight" style="font-size:1.25rem;font-weight:900;color:#7e22ce;">👑 \${caughtFish.name} · ⚖️ \${caughtFish.weightG}g</span>
        </div>
        <div style="font-size:0.95rem;font-weight:900;color:#9333ea;margin-top:4px;letter-spacing:0.3px;">
          🔮 Phép màu giáng lâm! Bé đã câu được bạn Cá Quý Hiếm Thần Thoại!
        </div>
      \`;

      // Hạt ma thuật vũ trụ bùng nổ khắp cầu gỗ
      this.spawnStationParticles(landX, landY, ['✨', '🌟', '🌈', '💫', '⭐', '🪄', '🎆', '🔮', '💎'], 0xc084fc);
      if (this.hero?.sprite) {
        this.spawnStationParticles(this.hero.sprite.x, this.hero.sprite.y - 25, ['✨', '🌟', '🌈', '👑', '⭐', '🪄'], 0xf59e0b);
      }
      this.cameras?.main?.shake?.(700, 0.016);
      this.cameras?.main?.flash?.(350, 255, 255, 255);

      if (typeof window.__audioService?.playGrandFanfare === 'function') {
        window.__audioService.playGrandFanfare();
      } else {
        window.__audioService?.playSuccess?.();
      }
      window.__speechService?.speak?.(\`Kỳ diệu quá! Bé vừa bắt được Cá Thần Thoại cực kỳ quý hiếm \${caughtFish.name} nặng \${caughtFish.weightG} gam!\`);
      window.dispatchEvent(new CustomEvent('game:show-toast', { detail: { message: \`🔮 MA THUẬT KỲ DIỆU! \${caughtFish.name} (\${caughtFish.weightG}g) vọt lên bờ!\` } }));

      const gameRoot = document.getElementById('game-root') || document.body;
      gameRoot.appendChild(card);

      // Cá hiếm hiển thị ăn mừng rực rỡ 3.4s trước khi bay vào túi
      setTimeout(() => {
        if (card.parentNode) {
          card.classList.add('fly-to-bag');
        }
      }, 3400);
      setTimeout(() => {
        card.remove();
      }, 4000);
    } else if (isBigFish) {`;

if (ws.includes(normalize(targetWsCatch))) {
  ws = ws.replace(normalize(targetWsCatch), normalize(replacementWsCatch));
  fs.writeFileSync('src/game/scenes/WorldScene.js', ws, 'utf8');
  console.log('WorldScene.js updated with magic rare fish celebration');
} else {
  console.error('Target not found in WorldScene.js');
}
