import sys

with open('src/game/scenes/WorldScene.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
old_imp = "import { RODS, BAITS, calculateFishSellPrice } from '../../content/fishing/fishingData.js';"
new_imp = "import { RODS, BAITS, calculateFishSellPrice, PULL_8_STEPS } from '../../content/fishing/fishingData.js';"
assert old_imp in content, "old_imp not found"
content = content.replace(old_imp, new_imp, 1)

# 2. Update onMapRodContainer rendering (held rod sprite according to level)
old_rod_render = """    this.onMapRodContainer = this.add.container(0, 0).setDepth(Math.floor(heroY + 40));
    const rodStick = this.add.graphics();
    const rodColor = fState.equippedRod === 'rod_rainbow' ? 0xa855f7 : (fState.equippedRod === 'rod_duck' ? 0xf59e0b : 0x84cc16);
    rodStick.lineStyle(5, 0x78350f, 1);
    rodStick.beginPath();
    rodStick.moveTo(rodBaseX, rodBaseY);
    rodStick.lineTo(rodTipX, rodTipY);
    rodStick.strokePath();
    rodStick.fillStyle(rodColor, 1);
    rodStick.fillCircle(rodTipX, rodTipY, 5.5);
    const rodBadge = this.add.text(rodBaseX, rodBaseY - 26, `${equippedRodObj.icon || '🎣'}`, {
      fontSize: '22px'
    }).setOrigin(0.5);
    this.onMapRodContainer.add([rodStick, rodBadge]);"""

new_rod_render = """    this.onMapRodContainer = this.add.container(0, 0).setDepth(Math.floor(heroY + 40));
    
    // Tạo hình Cần Câu theo Cấp Độ (Level 1..5)
    const heldKey = `${equippedRodObj.id}_held`;
    if (this.textures.exists(heldKey)) {
      const rodSprite = this.add.image((rodBaseX + rodTipX) / 2, (rodBaseY + rodTipY) / 2, heldKey);
      rodSprite.setDisplaySize(96, 96);
      rodSprite.setAngle(dirSign < 0 ? -15 : 15);
      this.onMapRodContainer.add(rodSprite);
    } else {
      const rodStick = this.add.graphics();
      const rodColor = Phaser.Display.Color.HexStringToColor(equippedRodObj.glowColor || '#84cc16').color;
      rodStick.lineStyle(6, 0x78350f, 1);
      rodStick.beginPath();
      rodStick.moveTo(rodBaseX, rodBaseY);
      rodStick.lineTo(rodTipX, rodTipY);
      rodStick.strokePath();
      rodStick.fillStyle(rodColor, 1);
      rodStick.fillCircle(rodTipX, rodTipY, 6);
      this.onMapRodContainer.add(rodStick);
    }

    // Hào quang đầu cần câu phát sáng theo cấp độ
    const glowColorNum = Phaser.Display.Color.HexStringToColor(equippedRodObj.glowColor || '#facc15').color;
    const tipAura = this.add.circle(rodTipX, rodTipY, 15, glowColorNum, 0.45);
    this.tweens.add({
      targets: tipAura,
      scaleX: 1.45,
      scaleY: 1.45,
      alpha: 0.15,
      duration: 650,
      yoyo: true,
      repeat: -1
    });

    // Huy hiệu Cấp Độ Cần (Level Badge)
    const rodBadge = this.add.text(rodBaseX, rodBaseY - 28, `${equippedRodObj.icon || '🎣'} Lv.${equippedRodObj.level || equippedRodObj.tier || 1}`, {
      fontSize: '14px',
      fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#0f172a',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.onMapRodContainer.add([tipAura, rodBadge]);"""

assert old_rod_render in content, "old_rod_render not found"
content = content.replace(old_rod_render, new_rod_render, 1)

# 3. Update bite handling & targetSteps
old_bite = """      const baseHits = (biteRes.species?.pullStages >= 3 || biteRes.species?.pullSteps >= 3) ? 2 : 1;
      this.onMapFishingState.phase = 'audition';
      this.onMapFishingState.turn = biteRes.turn || turn;
      this.onMapFishingState.species = biteRes.species;
      this.onMapFishingState.weightG = biteRes.weightG || 250;
      this.onMapFishingState.neededHits = Math.max(1, baseHits - (equippedRodObj?.pullHitsReduction || 0));"""

new_bite = """      const targetSteps = biteRes.species?.requiredPullSteps || 4;
      this.onMapFishingState.phase = 'audition';
      this.onMapFishingState.turn = biteRes.turn || turn;
      this.onMapFishingState.species = biteRes.species;
      this.onMapFishingState.weightG = biteRes.weightG || 250;
      this.onMapFishingState.targetSteps = targetSteps;
      this.onMapFishingState.currentStep = 0;
      this.onMapFishingState.stepGain = equippedRodObj?.pullStepGain || 1.0;
      this.onMapFishingState.neededHits = Math.max(1, Math.ceil(targetSteps / (equippedRodObj?.pullStepGain || 1.0)));"""

assert old_bite in content, "old_bite not found"
content = content.replace(old_bite, new_bite, 1)

# 4. Replace mountVerticalAuditionBar & handleVerticalAuditionPull
old_mount = """  mountVerticalAuditionBar() {
    const st = this.onMapFishingState;
    if (!st) return;

    if (this.onMapAuditionEl) {
      this.onMapAuditionEl.remove();
    }

    const sp = st.species || { name: 'Cá Mây Tròn', icon: '🐟', asset: '/assets/fishing/fish_cloud.png' };
    const assetSrc = sp.asset || '/assets/fishing/fish_cloud.png';
    const starsHtml = Array.from({ length: st.neededHits }).map((_, idx) => `
      <span class="onmap-audition-star" data-star-index="${idx}" style="font-size:1.35rem;filter:${idx < st.currentHits ? 'none' : 'grayscale(1) opacity(0.38)'};">⭐</span>
    `).join('');

    const el = document.createElement('div');
    el.id = 'onmap-fishing-audition';
    el.className = 'onmap-fishing-audition';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Thanh nhịp kéo cá theo chiều dọc');
    el.innerHTML = `
      <button type="button" class="onmap-audition-cancel" id="btn-onmap-cancel" title="Thu cần">✖</button>
      <div class="onmap-audition-fish-preview">
        <img src="${assetSrc}" alt="${sp.name}" />
        <div class="onmap-audition-stars" id="onmap-audition-stars">${starsHtml}</div>
      </div>
      <div class="fishing-vertical-track" id="fishing-vertical-track" data-orientation="vertical">
        <div class="fishing-vertical-zone" id="fishing-vertical-zone" style="top:${st.zoneTop}%;height:${st.zoneHeight}%;">
          <span>✨</span>
        </div>
        <div class="fishing-vertical-marker" id="fishing-vertical-marker" style="top:${st.markerPct}%;">
          <img src="${assetSrc}" alt="" />
        </div>
      </div>
      <button type="button" class="onmap-audition-pull-btn" id="btn-onmap-pull" aria-label="Kéo cần câu">
        🎣
      </button>
    `;

    const gameRoot = document.getElementById('game-root') || document.body;
    gameRoot.appendChild(el);
    this.onMapAuditionEl = el;

    el.querySelector('#btn-onmap-pull')?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.handleVerticalAuditionPull();
    });
    el.querySelector('#fishing-vertical-track')?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.handleVerticalAuditionPull();
    });
    el.querySelector('#btn-onmap-cancel')?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.stopOnMapFishing(false);
    });

    this.onMapFishingKeyHandler = (ev) => {
      if (ev.code === 'Space' || ev.code === 'Enter') {
        ev.preventDefault();
        this.handleVerticalAuditionPull();
      } else if (ev.code === 'Escape') {
        this.stopOnMapFishing(false);
      }
    };
    window.addEventListener('keydown', this.onMapFishingKeyHandler);

    let lastTs = performance.now();
    const speedPctPerSec = 82;
    const tick = (now) => {
      if (!this.onMapFishingState || this.onMapFishingState.phase !== 'audition') return;
      const dt = Math.min(0.06, (now - lastTs) / 1000);
      lastTs = now;

      st.markerPct += st.markerDir * speedPctPerSec * dt;
      if (st.markerPct >= 92) {
        st.markerPct = 92;
        st.markerDir = -1;
      } else if (st.markerPct <= 8) {
        st.markerPct = 8;
        st.markerDir = 1;
      }

      const markerEl = this.onMapAuditionEl?.querySelector('#fishing-vertical-marker');
      if (markerEl) {
        markerEl.style.top = `${st.markerPct}%`;
      }
      this.onMapFishingRaf = requestAnimationFrame(tick);
    };
    this.onMapFishingRaf = requestAnimationFrame(tick);
  }

  /**
   * Xử lý khi bé bấm nút 🎣 trên Thanh Audition Dọc
   */
  handleVerticalAuditionPull() {
    const st = this.onMapFishingState;
    if (!st || st.phase !== 'audition') return;

    const inZone =
      st.markerPct >= st.zoneTop - 8 &&
      st.markerPct <= st.zoneTop + st.zoneHeight + 8;

    st.attempts = (st.attempts || 0) + 1;

    if (inZone || st.attempts >= 2) {
      st.currentHits += 1;
      window.__audioService?.playChime?.(880, 0.18);
      this.spawnStationParticles(st.castX, st.castY, ['💦', '✨', '⭐', '🫧'], 0x38bdf8);

      const starEls = this.onMapAuditionEl?.querySelectorAll('.onmap-audition-star');
      if (starEls) {
        starEls.forEach((node, idx) => {
          node.style.filter = idx < st.currentHits ? 'none' : 'grayscale(1) opacity(0.38)';
        });
      }

      if (st.currentHits >= st.neededHits) {
        this.completeOnMapFishingCatch();
      } else {
        st.zoneTop = st.zoneTop < 35 ? 44 : 20;
        const zoneEl = this.onMapAuditionEl?.querySelector('#fishing-vertical-zone');
        if (zoneEl) {
          zoneEl.style.top = `${st.zoneTop}%`;
        }
      }
    } else {
      window.__audioService?.playChime?.(520, 0.12);
      const trackEl = this.onMapAuditionEl?.querySelector('#fishing-vertical-track');
      if (trackEl) {
        trackEl.style.transform = 'scale(1.06)';
        setTimeout(() => {
          if (trackEl) trackEl.style.transform = '';
        }, 150);
      }
    }
  }"""

new_mount = """  mountVerticalAuditionBar() {
    const st = this.onMapFishingState;
    if (!st) return;

    if (this.onMapAuditionEl) {
      this.onMapAuditionEl.remove();
    }

    const sp = st.species || { name: 'Cá Mây Tròn', icon: '🐟', asset: '/assets/fishing/fish_cloud.png', requiredPullSteps: 3 };
    const assetSrc = sp.asset || '/assets/fishing/fish_cloud.png';
    const targetSteps = st.targetSteps || sp.requiredPullSteps || 4;
    const currentStep = st.currentStep || 0;
    const curStepIdx = Math.min(7, Math.floor(currentStep));
    const curStepObj = PULL_8_STEPS[curStepIdx] || PULL_8_STEPS[0];
    const rod = st.rod || RODS[0];

    // Tạo HTML cho 8 bước kéo giựt (8-step stepper)
    const stepperNodesHtml = Array.from({ length: 8 }).map((_, idx) => {
      const stepNum = idx + 1;
      const stepInfo = PULL_8_STEPS[idx];
      const isDone = stepNum <= currentStep;
      const isCurrent = stepNum === Math.min(targetSteps, Math.floor(currentStep) + 1);
      const isTarget = stepNum === targetSteps;
      const isBeyond = stepNum > targetSteps;
      return `
        <div class="fishing-step-node ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''} ${isTarget ? 'is-target' : ''} ${isBeyond ? 'is-beyond' : ''}" data-step="${stepNum}" title="Bước ${stepNum}: ${stepInfo.name}">
          <span class="step-icon">${isDone ? '✓' : stepInfo.icon}</span>
          <span class="step-num">${stepNum}</span>
        </div>
      `;
    }).join('');

    // Hỗ trợ backward-compat cho các bài kiểm tra tìm .onmap-audition-star
    const starsHtml = Array.from({ length: st.neededHits || 1 }).map((_, idx) => `
      <span class="onmap-audition-star" data-star-index="${idx}" style="font-size:1.15rem;filter:${idx < st.currentHits ? 'none' : 'grayscale(1) opacity(0.38)'};">⭐</span>
    `).join('');

    const el = document.createElement('div');
    el.id = 'onmap-fishing-audition';
    el.className = 'onmap-fishing-audition';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Thanh thao tác kéo giựt 8 bước câu cá');
    el.innerHTML = `
      <button type="button" class="onmap-audition-cancel" id="btn-onmap-cancel" title="Thu cần">✖</button>
      <div class="onmap-audition-fish-preview">
        <img src="${assetSrc}" alt="${sp.name}" />
        <div style="font-size:0.84rem;font-weight:900;color:#0f172a;margin-top:2px;">${sp.icon} ${sp.name}</div>
        <div class="onmap-audition-stars" id="onmap-audition-stars" style="display:none;">${starsHtml}</div>
      </div>
      <div class="fishing-8step-stepper" id="fishing-8step-stepper">
        ${stepperNodesHtml}
      </div>
      <div class="fishing-step-action-banner" id="fishing-step-action-banner">
        <div class="step-badge" id="fishing-step-badge">BƯỚC ${Math.min(targetSteps, Math.floor(currentStep) + 1)}/${targetSteps}</div>
        <div class="step-text" id="fishing-step-text">${curStepObj.icon} ${curStepObj.name}: ${curStepObj.actionText}</div>
      </div>
      <div class="fishing-vertical-track" id="fishing-vertical-track" data-orientation="vertical">
        <div class="fishing-vertical-zone" id="fishing-vertical-zone" style="top:${st.zoneTop}%;height:${st.zoneHeight}%;">
          <span>✨</span>
        </div>
        <div class="fishing-vertical-marker" id="fishing-vertical-marker" style="top:${st.markerPct}%;">
          <img src="${assetSrc}" alt="" />
        </div>
      </div>
      <button type="button" class="onmap-audition-pull-btn" id="btn-onmap-pull" aria-label="Kéo giựt cần câu">
        🎣
      </button>
      <div class="onmap-rod-perk-hint">${rod.icon} Lv.${rod.level || rod.tier || 1} (+${rod.pullStepGain || 1.0} bước)</div>
    `;

    const gameRoot = document.getElementById('game-root') || document.body;
    gameRoot.appendChild(el);
    this.onMapAuditionEl = el;

    el.querySelector('#btn-onmap-pull')?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.handleVerticalAuditionPull();
    });
    el.querySelector('#fishing-vertical-track')?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.handleVerticalAuditionPull();
    });
    el.querySelector('#btn-onmap-cancel')?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.stopOnMapFishing(false);
    });

    this.onMapFishingKeyHandler = (ev) => {
      if (ev.code === 'Space' || ev.code === 'Enter') {
        ev.preventDefault();
        this.handleVerticalAuditionPull();
      } else if (ev.code === 'Escape') {
        this.stopOnMapFishing(false);
      }
    };
    window.addEventListener('keydown', this.onMapFishingKeyHandler);

    let lastTs = performance.now();
    const speedPctPerSec = 82;
    const tick = (now) => {
      if (!this.onMapFishingState || this.onMapFishingState.phase !== 'audition') return;
      const dt = Math.min(0.06, (now - lastTs) / 1000);
      lastTs = now;

      st.markerPct += st.markerDir * speedPctPerSec * dt;
      if (st.markerPct >= 92) {
        st.markerPct = 92;
        st.markerDir = -1;
      } else if (st.markerPct <= 8) {
        st.markerPct = 8;
        st.markerDir = 1;
      }

      const markerEl = this.onMapAuditionEl?.querySelector('#fishing-vertical-marker');
      if (markerEl) {
        markerEl.style.top = `${st.markerPct}%`;
      }
      this.onMapFishingRaf = requestAnimationFrame(tick);
    };
    this.onMapFishingRaf = requestAnimationFrame(tick);
  }

  /**
   * Xử lý thao tác KÉO GIỰT theo từng bước trên Thanh Audition 8 Bước
   */
  handleVerticalAuditionPull() {
    const st = this.onMapFishingState;
    if (!st || st.phase !== 'audition') return;

    const inZone =
      st.markerPct >= st.zoneTop - 8 &&
      st.markerPct <= st.zoneTop + st.zoneHeight + 8;
    const isPerfect = Math.abs(st.markerPct - (st.zoneTop + st.zoneHeight / 2)) <= 8;

    st.attempts = (st.attempts || 0) + 1;

    if (inZone || st.attempts >= 2) {
      // Cần câu cấp độ cao tăng số bước tiến mỗi cú giật (+1.0 -> +1.5 -> +1.8 -> +2.0 -> +3.0)
      const baseGain = st.stepGain || 1.0;
      const stepAdvance = isPerfect ? Math.max(1, Math.round(baseGain + 0.5)) : Math.max(1, Math.round(baseGain));
      st.currentStep = (st.currentStep || 0) + stepAdvance;
      st.currentHits = (st.currentHits || 0) + 1;

      // Âm thanh và hiệu ứng tương ứng từng bước
      const curPitch = 580 + Math.min(8, Math.floor(st.currentStep)) * 55;
      window.__audioService?.playChime?.(curPitch, 0.18);
      
      const popupText = isPerfect ? `⚡ PERFECT! +${stepAdvance} BƯỚC` : `✨ GREAT! +${stepAdvance} BƯỚC`;
      const popupCol = isPerfect ? '#f59e0b' : '#38bdf8';
      this.spawnFloatingPopup(st.castX, st.castY - 48, popupText, popupCol);
      this.spawnStationParticles(st.castX, st.castY, ['💦', '✨', '⭐', '🫧'], 0x38bdf8);

      // Hiệu ứng cần câu rung uốn cong khi kéo giật
      if (this.onMapRodContainer) {
        this.tweens.add({
          targets: this.onMapRodContainer,
          angle: { from: -7, to: 7 },
          duration: 90,
          yoyo: true,
          repeat: 2,
          onComplete: () => this.onMapRodContainer?.setAngle?.(0)
        });
      }

      // Cập nhật DOM Stepper 8 bước
      const targetSteps = st.targetSteps || 4;
      const nodes = this.onMapAuditionEl?.querySelectorAll('.fishing-step-node');
      if (nodes) {
        nodes.forEach((node, idx) => {
          const stepNum = idx + 1;
          const isDone = stepNum <= st.currentStep;
          const isCurrent = stepNum === Math.min(targetSteps, Math.floor(st.currentStep) + 1);
          node.classList.toggle('is-done', isDone);
          node.classList.toggle('is-current', isCurrent);
          if (isDone) {
            const iconSpan = node.querySelector('.step-icon');
            if (iconSpan) iconSpan.textContent = '✓';
          }
        });
      }

      // Cập nhật Banner hành động bước hiện tại
      const nextStepIdx = Math.min(7, Math.floor(st.currentStep));
      const nextStepObj = PULL_8_STEPS[nextStepIdx] || PULL_8_STEPS[0];
      const badgeEl = this.onMapAuditionEl?.querySelector('#fishing-step-badge');
      const textEl = this.onMapAuditionEl?.querySelector('#fishing-step-text');
      if (badgeEl) badgeEl.textContent = `BƯỚC ${Math.min(targetSteps, Math.floor(st.currentStep) + 1)}/${targetSteps}`;
      if (textEl) textEl.textContent = `${nextStepObj.icon} ${nextStepObj.name}: ${nextStepObj.actionText}`;

      // Đồng bộ backward-compat cho starEls
      const starEls = this.onMapAuditionEl?.querySelectorAll('.onmap-audition-star');
      if (starEls) {
        starEls.forEach((node, idx) => {
          node.style.filter = idx < st.currentHits ? 'none' : 'grayscale(1) opacity(0.38)';
        });
      }

      // Khi đã hoàn tất toàn bộ số bước kéo giựt của loài cá này -> Kéo cá vọt lên bờ!
      if (st.currentStep >= targetSteps) {
        this.completeOnMapFishingCatch();
      } else {
        // Đảo vị trí vùng xanh nhấp nháy cho nhịp kéo tiếp theo
        st.zoneTop = st.zoneTop < 35 ? 44 : 20;
        const zoneEl = this.onMapAuditionEl?.querySelector('#fishing-vertical-zone');
        if (zoneEl) {
          zoneEl.style.top = `${st.zoneTop}%`;
        }
      }
    } else {
      window.__audioService?.playChime?.(520, 0.12);
      this.spawnFloatingPopup(st.castX, st.castY - 45, '💦 Cố lên bé ơi!', '#94a3b8');
      const trackEl = this.onMapAuditionEl?.querySelector('#fishing-vertical-track');
      if (trackEl) {
        trackEl.style.transform = 'scale(1.06)';
        setTimeout(() => {
          if (trackEl) trackEl.style.transform = '';
        }, 150);
      }
    }
  }"""

assert old_mount in content, "old_mount not found"
content = content.replace(old_mount, new_mount, 1)

with open('src/game/scenes/WorldScene.js', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print('WorldScene updated with 8-step pull & held rods successfully!')
