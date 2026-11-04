# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('src/game/scenes/WorldScene.js', 'r', encoding='utf-8') as f:
    content = f.read()

i1 = content.find('handleVerticalAuditionPull() {')
i2 = content.find('  completeOnMapFishingCatch() {')

if i1 == -1 or i2 == -1:
    print(f"ERROR: could not find bounds i1={i1}, i2={i2}")
    sys.exit(1)

# Find the start of the JSDoc before completeOnMapFishingCatch:
idx_comment = content.rfind('  /**', i1, i2)
if idx_comment == -1:
    idx_end_func = i2
else:
    idx_end_func = idx_comment

NEW_HANDLE_PULL = """handleVerticalAuditionPull() {
    const st = this.onMapFishingState;
    if (!st || st.phase !== 'audition') return;

    const inZone =
      st.markerPct >= st.zoneTop - 5 &&
      st.markerPct <= st.zoneTop + st.zoneHeight + 5;
    const isPerfect = Math.abs(st.markerPct - (st.zoneTop + st.zoneHeight / 2)) <= 6;

    st.attempts = (st.attempts || 0) + 1;

    // Khi bấm trúng vùng canh (hoặc hỗ trợ bé 5-6 tuổi sau 3 lần cố gắng)
    if (inZone || st.attempts >= 3) {
      st.currentHits = (st.currentHits || 0) + 1;
      st.currentStep = st.currentHits;

      const targetHits = st.targetHits || 1;
      const curHit = st.currentHits;

      // Âm thanh và hiệu ứng
      const curPitch = 580 + curHit * 85;
      window.__audioService?.playChime?.(curPitch, 0.20);

      const popupText = isPerfect ? '⚡ HOÀN HẢO! +1 NHỊP' : '✨ CHÍNH XÁC! +1 NHỊP';
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

      // Cập nhật số sao sáng trực quan trên thanh Audition
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
      const trackEl = this.onMapAuditionEl?.querySelector('#fishing-vertical-track');
      if (trackEl) {
        trackEl.style.transform = 'scale(1.06)';
        setTimeout(() => {
          if (trackEl) trackEl.style.transform = '';
        }, 150);
      }
    }
  }

"""

new_content = content[:i1] + NEW_HANDLE_PULL + content[idx_end_func:]

with open('src/game/scenes/WorldScene.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("handleVerticalAuditionPull replaced successfully!")
