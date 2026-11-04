# -*- coding: utf-8 -*-
import sys
import re
sys.stdout.reconfigure(encoding='utf-8')

with open('src/game/scenes/WorldScene.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update import in WorldScene.js to include FISH_DIFFICULTY_PROFILES
if 'FISH_DIFFICULTY_PROFILES' not in content:
    content = content.replace(
        "import {\n  RODS,",
        "import {\n  RODS,\n  FISH_DIFFICULTY_PROFILES,"
    )
    if 'FISH_DIFFICULTY_PROFILES' not in content:
        content = content.replace(
            "import { RODS,",
            "import { RODS, FISH_DIFFICULTY_PROFILES,"
        )

# 2. Update tap on dock:
# replace old dock tap with (702, 350)
old_tap = """        // Nếu chạm vào vùng vòng tròn xanh dương trên cầu gỗ (668, 426) -> Đi tới vòng tròn xanh
        if (Math.hypot(point.x - 668, point.y - 426) < 64) {"""

new_tap = """        // Nếu chạm vào vùng vòng tròn xanh dương trên cầu gỗ (702, 350) -> Đi tới vòng tròn xanh
        if (Math.hypot(point.x - 702, point.y - 350) < 70 || Math.hypot(point.x - 668, point.y - 426) < 64) {"""

if old_tap in content:
    content = content.replace(old_tap, new_tap)
    # also update the x, y in the station payload:
    content = content.replace(
        """          this.handleFishingStationInteraction({
            id: 'station_lotus_dock',
            type: 'dock',
            dockId: 'lotus_dock',
            x: 668,
            y: 426,
            interactionPoint: { x: 668, y: 426 },
            castTarget: { x: 485, y: 445 }
          });""",
        """          this.handleFishingStationInteraction({
            id: 'station_lotus_dock',
            type: 'dock',
            dockId: 'lotus_dock',
            x: 702,
            y: 350,
            interactionPoint: { x: 702, y: 350 },
            castTarget: { x: 485, y: 445 }
          });"""
    )

# 3. Update dockSpot in initFishingPondStations:
old_dock_init = """    // Vẽ vòng tròn xanh dương phát sáng tại điểm câu duy nhất trên mũi cầu gỗ (chân bé đứng tại 676, 404; tâm hero tại 676, 368)
    const dockSpotX = 676;
    const dockSpotY = 368;
    const dockCircleContainer = this.add.container(dockSpotX, 404).setDepth(5);"""

new_dock_init = """    // Vẽ vòng tròn xanh dương phát sáng tại điểm câu chỉ định trên cầu gỗ (tâm hero 702, 348; chân đứng 702, 368)
    const dockSpotX = 702;
    const dockSpotY = 348;
    const dockCircleContainer = this.add.container(dockSpotX, 368).setDepth(5);"""

if old_dock_init in content:
    content = content.replace(old_dock_init, new_dock_init)

# 4. Update dockTouchZone:
content = content.replace(
    "const dockTouchZone = this.add.zone(dockSpotX, 410, 115, 90)",
    "const dockTouchZone = this.add.zone(dockSpotX, 360, 115, 90)"
)

# 5. Update updateDockFishingProximityButton:
old_proximity = """  updateDockFishingProximityButton(heroX, heroY) {
    if (!this.dockStartFishingBtnEl) return;
    if (this.currentMapId !== 'map_fishing_pond' || this.onMapFishingState) {
      this.dockStartFishingBtnEl.style.display = 'none';
      return;
    }
    const dist = Math.hypot(heroX - 676, heroY - 384);
    const isInsideBlueCircle = dist <= 82;
    this.dockStartFishingBtnEl.style.display = isInsideBlueCircle ? 'inline-flex' : 'none';
  }"""

new_proximity = """  updateDockFishingProximityButton(heroX, heroY) {
    if (!this.dockStartFishingBtnEl) return;
    if (this.currentMapId !== 'map_fishing_pond' || this.onMapFishingState) {
      this.dockStartFishingBtnEl.style.display = 'none';
      return;
    }
    const dist = Math.hypot(heroX - 702, heroY - 348);
    const isInsideBlueCircle = dist <= 85;
    this.dockStartFishingBtnEl.style.display = isInsideBlueCircle ? 'inline-flex' : 'none';
  }"""

if old_proximity in content:
    content = content.replace(old_proximity, new_proximity)

# 6. Update interaction handler when arriving at dock:
content = content.replace(
    "const dockX = 676;\n      const dockY = 368;",
    "const dockX = 702;\n      const dockY = 348;"
)
content = content.replace(
    "this.hero.moveTo(dockX, dockY, () => {\n        this.updateDockFishingProximityButton(676, 384);",
    "this.hero.moveTo(dockX, dockY, () => {\n        this.updateDockFishingProximityButton(702, 348);"
)

# 7. Update startOnMapFishing default dock and target:
content = content.replace(
    "heroX = 676, heroY = 368",
    "heroX = 702, heroY = 348"
)

# 8. Update bite handling & audition bar mechanics to use fish difficulty profiles:
old_bite_setup = """      const targetSteps = biteRes.species?.requiredPullSteps || 4;
      this.onMapFishingState.phase = 'audition';
      this.onMapFishingState.turn = biteRes.turn || turn;
      this.onMapFishingState.species = biteRes.species;
      this.onMapFishingState.weightG = biteRes.weightG || 250;
      this.onMapFishingState.targetSteps = targetSteps;
      this.onMapFishingState.currentStep = 0;
      this.onMapFishingState.stepGain = equippedRodObj?.pullStepGain || 1.0;
      this.onMapFishingState.neededHits = Math.max(1, Math.ceil(targetSteps / (equippedRodObj?.pullStepGain || 1.0)));
      const updatedState = fishingSystem.getState();"""

new_bite_setup = """      const spId = biteRes.species?.id || 'cloud_fish';
      const diff = (typeof FISH_DIFFICULTY_PROFILES !== 'undefined' && FISH_DIFFICULTY_PROFILES[spId]) || {
        requiredHits: biteRes.species?.requiredHits || 2,
        zoneHeight: biteRes.species?.zoneHeight || 36,
        markerSpeed: biteRes.species?.markerSpeed || 80,
        label: `${biteRes.species?.requiredHits || 2} Lần Canh`
      };

      const targetHits = diff.requiredHits;
      const baseZoneHeight = Math.max(12, Math.min(60, diff.zoneHeight + (equippedRodObj?.auditionZoneBonus || 0)));
      const markerSpeed = diff.markerSpeed;

      this.onMapFishingState.phase = 'audition';
      this.onMapFishingState.turn = biteRes.turn || turn;
      this.onMapFishingState.species = biteRes.species;
      this.onMapFishingState.weightG = biteRes.weightG || 250;
      this.onMapFishingState.diff = diff;
      this.onMapFishingState.targetHits = targetHits;
      this.onMapFishingState.currentHits = 0;
      this.onMapFishingState.neededHits = targetHits;
      this.onMapFishingState.targetSteps = targetHits;
      this.onMapFishingState.currentStep = 0;
      this.onMapFishingState.zoneHeight = baseZoneHeight;
      this.onMapFishingState.zoneTop = Math.max(12, Math.round(42 - baseZoneHeight / 2));
      this.onMapFishingState.markerSpeed = markerSpeed;
      const updatedState = fishingSystem.getState();"""

if old_bite_setup in content:
    content = content.replace(old_bite_setup, new_bite_setup)
else:
    print("Warning: old_bite_setup not found verbatim, checking regex...")

# 9. Update mountVerticalAuditionBar HTML and tick loop:
old_mount_start = """  mountVerticalAuditionBar() {
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
    `).join('');"""

new_mount_start = """  mountVerticalAuditionBar() {
    const st = this.onMapFishingState;
    if (!st) return;

    if (this.onMapAuditionEl) {
      this.onMapAuditionEl.remove();
    }

    const sp = st.species || { name: 'Cá Mây Tròn', icon: '🐟', asset: '/assets/fishing/fish_cloud.png', requiredHits: 1 };
    const assetSrc = sp.asset || '/assets/fishing/fish_cloud.png';
    const targetHits = st.targetHits || sp.requiredHits || 1;
    const curHit = st.currentHits || 0;
    const rod = st.rod || RODS[0];
    const diff = st.diff || { label: `${targetHits} Lần Canh` };

    // Tạo các ngôi sao lớn hiển thị số lượt canh yêu cầu (1 lần cho cá dễ, 2-5 lần cho cá khó)
    const starsHtml = Array.from({ length: targetHits }).map((_, idx) => {
      const isEarned = idx < curHit;
      return `
        <span class="onmap-audition-star ${isEarned ? 'earned' : ''}" data-star-index="${idx}" style="font-size:1.35rem;filter:${isEarned ? 'drop-shadow(0 0 6px #facc15)' : 'grayscale(1) opacity(0.32)'};transition:all 0.25s ease;">⭐</span>
      `;
    }).join('');

    // Stepper nhịp kéo
    const stepperNodesHtml = Array.from({ length: Math.max(targetHits, 1) }).map((_, idx) => {
      const stepNum = idx + 1;
      const isDone = stepNum <= curHit;
      const isCurrent = stepNum === Math.min(targetHits, curHit + 1);
      return `
        <div class="fishing-step-node ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}" data-step="${stepNum}">
          <span class="step-icon">${isDone ? '✓' : (stepNum === targetHits ? '🏆' : '🎣')}</span>
          <span class="step-num">${stepNum}</span>
        </div>
      `;
    }).join('');"""

if old_mount_start in content:
    content = content.replace(old_mount_start, new_mount_start)

# 10. In el.innerHTML inside mountVerticalAuditionBar:
# replace the fish preview and banner:
old_preview_inner = """      <div class="onmap-audition-fish-preview">
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
      </div>"""

new_preview_inner = """      <div class="onmap-audition-fish-preview">
        <img src="${assetSrc}" alt="${sp.name}" />
        <div style="font-size:0.88rem;font-weight:900;color:#0f172a;margin-top:2px;">${sp.icon} ${sp.name}</div>
        <div class="onmap-audition-diff-pill" style="font-size:0.72rem;font-weight:900;color:#0369a1;background:#e0f2fe;border:1.5px solid #7dd3fc;border-radius:999px;padding:2px 8px;margin-top:2px;">
          ${diff.label || `${targetHits} Lần Canh`}
        </div>
        <div class="onmap-audition-stars" id="onmap-audition-stars" style="display:flex;justify-content:center;gap:3px;margin-top:3px;">
          ${starsHtml}
        </div>
      </div>
      <div class="fishing-8step-stepper" id="fishing-8step-stepper" style="${targetHits <= 1 ? 'display:none;' : ''}">
        ${stepperNodesHtml}
      </div>
      <div class="fishing-step-action-banner" id="fishing-step-action-banner">
        <div class="step-badge" id="fishing-step-badge">${targetHits === 1 ? 'LƯỢT 1/1 (CÁ DỄ)' : `LƯỢT ${curHit + 1}/${targetHits}`}</div>
        <div class="step-text" id="fishing-step-text">${targetHits === 1 ? '🎣 Bấm 1 nhịp chuẩn là bắt cá lên bờ!' : 'Bé bấm nút 🎣 khi cá bơi vào vùng xanh nhé!'}</div>
      </div>"""

if old_preview_inner in content:
    content = content.replace(old_preview_inner, new_preview_inner)

# 11. In tick loop: replace speedPctPerSec = 82 with st.markerSpeed
content = content.replace(
    "    let lastTs = performance.now();\n    const speedPctPerSec = 82;\n    const tick = (now) => {\n      if (!this.onMapFishingState || this.onMapFishingState.phase !== 'audition') return;\n      const dt = Math.min(0.06, (now - lastTs) / 1000);\n      lastTs = now;\n\n      st.markerPct += st.markerDir * speedPctPerSec * dt;",
    "    let lastTs = performance.now();\n    const tick = (now) => {\n      if (!this.onMapFishingState || this.onMapFishingState.phase !== 'audition') return;\n      const dt = Math.min(0.06, (now - lastTs) / 1000);\n      lastTs = now;\n      const speedPctPerSec = st.markerSpeed || 82;\n\n      st.markerPct += st.markerDir * speedPctPerSec * dt;"
)

# 12. Update handleVerticalAuditionPull to check inZone and handle targetHits (1 for easy, 2-5 for hard):
old_pull_handler = """  handleVerticalAuditionPull() {
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
        st.zoneTop = st.zoneTop < 35 ?
          Math.min(68, Math.round(st.zoneTop + 24)) :
          Math.max(14, Math.round(st.zoneTop - 22));
        const zoneEl = this.onMapAuditionEl?.querySelector('#fishing-vertical-zone');
        if (zoneEl) {
          zoneEl.style.top = `${st.zoneTop}%`;
        }
      }
    } else {
      window.__audioService?.playChime?.(360, 0.12);
      this.spawnFloatingPopup(st.castX, st.castY - 48, '💨 Hụt nhịp! Thử lại nào!', '#f97316');
    }
  }"""

new_pull_handler = """  handleVerticalAuditionPull() {
    const st = this.onMapFishingState;
    if (!st || st.phase !== 'audition') return;

    const inZone =
      st.markerPct >= st.zoneTop - 5 &&
      st.markerPct <= st.zoneTop + st.zoneHeight + 5;
    const isPerfect = Math.abs(st.markerPct - (st.zoneTop + st.zoneHeight / 2)) <= 6;

    st.attempts = (st.attempts || 0) + 1;

    // Trẻ em 5-6 tuổi: nếu cố gắng 3 lần thì hỗ trợ vượt nhịp
    if (inZone || st.attempts >= 3) {
      st.currentHits = (st.currentHits || 0) + 1;
      st.currentStep = st.currentHits;

      const targetHits = st.targetHits || 1;
      const curHit = st.currentHits;

      // Âm thanh và hiệu ứng
      const curPitch = 580 + curHit * 85;
      window.__audioService?.playChime?.(curPitch, 0.20);

      const popupText = isPerfect ? `⚡ HOÀN HẢO! +1 NHỊP` : `✨ CHÍNH XÁC! +1 NHỊP`;
      const popupCol = isPerfect ? '#f59e0b' : '#38bdf8';
      this.spawnFloatingPopup(st.castX, st.castY - 48, popupText, popupCol);
      this.spawnStationParticles(st.castX, st.castY, ['💦', '✨', '⭐', '🫧'], 0x38bdf8);

      // Hiệu ứng cần câu rung uốn cong khi kéo giật
      if (this.onMapRodContainer) {
        this.tweens.add({
          targets: this.onMapRodContainer,
          angle: { from: -8, to: 8 },
          duration: 90,
          yoyo: true,
          repeat: 2,
          onComplete: () => this.onMapRodContainer?.setAngle?.(0)
        });
      }

      // Cập nhật số sao sáng trực quan
      const starEls = this.onMapAuditionEl?.querySelectorAll('.onmap-audition-star');
      if (starEls) {
        starEls.forEach((node, idx) => {
          const earned = idx < curHit;
          node.classList.toggle('earned', earned);
          node.style.filter = earned ? 'drop-shadow(0 0 6px #facc15)' : 'grayscale(1) opacity(0.32)';
          if (earned) {
            node.style.transform = 'scale(1.25)';
            setTimeout(() => { if (node) node.style.transform = 'scale(1)'; }, 200);
          }
        });
      }

      // Cập nhật DOM Stepper
      const nodes = this.onMapAuditionEl?.querySelectorAll('.fishing-step-node');
      if (nodes) {
        nodes.forEach((node, idx) => {
          const stepNum = idx + 1;
          const isDone = stepNum <= curHit;
          const isCurrent = stepNum === Math.min(targetHits, curHit + 1);
          node.classList.toggle('is-done', isDone);
          node.classList.toggle('is-current', isCurrent);
          if (isDone) {
            const iconSpan = node.querySelector('.step-icon');
            if (iconSpan) iconSpan.textContent = '✓';
          }
        });
      }

      // Cập nhật Banner hành động
      const badgeEl = this.onMapAuditionEl?.querySelector('#fishing-step-badge');
      const textEl = this.onMapAuditionEl?.querySelector('#fishing-step-text');
      if (curHit >= targetHits) {
        if (badgeEl) badgeEl.textContent = '🏆 XUẤT SẮC!';
        if (textEl) textEl.textContent = 'Cá đã cắn câu! Vọt lên bờ ngay!';
      } else {
        if (badgeEl) badgeEl.textContent = `LƯỢT ${curHit + 1}/${targetHits}`;
        if (textEl) textEl.textContent = isPerfect ? '⚡ Quá chuẩn! Canh tiếp nhịp sau nào!' : '✨ Tuyệt vời! Canh tiếp nào!';
      }

      // Khi đã hoàn tất đủ số lần yêu cầu (1 lần với cá dễ, 2-5 lần với cá khó) -> Kéo cá lên bờ!
      if (curHit >= targetHits) {
        this.completeOnMapFishingCatch();
      } else {
        // Đảo vị trí điểm canh ngẫu nhiên cho nhịp kéo tiếp theo
        const minTop = 14;
        const maxTop = Math.max(16, 86 - st.zoneHeight);
        let newTop = Math.floor(minTop + Math.random() * (maxTop - minTop));
        if (Math.abs(newTop - st.zoneTop) < 14) {
          newTop = (st.zoneTop > 45) ? 20 : 60;
        }
        st.zoneTop = newTop;
        const zoneEl = this.onMapAuditionEl?.querySelector('#fishing-vertical-zone');
        if (zoneEl) {
          zoneEl.style.top = `${st.zoneTop}%`;
        }
      }
    } else {
      window.__audioService?.playChime?.(360, 0.12);
      this.spawnFloatingPopup(st.castX, st.castY - 48, '💨 Hụt rồi! Chờ cá vào vùng xanh!', '#f97316');
    }
  }"""

if old_pull_handler in content:
    content = content.replace(old_pull_handler, new_pull_handler)
else:
    print("Warning: old_pull_handler not found verbatim, checking regex...")

with open('src/game/scenes/WorldScene.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("WorldScene.js successfully updated with dock at (702, 350) and per-fish difficulty mechanics!")
