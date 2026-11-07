import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/game/ui/KitchenModal.js');
let raw = fs.readFileSync(filePath, 'utf8');
const isCRLF = raw.includes('\r\n');
let content = raw.replace(/\r\n/g, '\n');

// 1. renderRecipes: 3D ingredient images in flyout
const oldFlyout = `<span class="ing-icon">\${i.icon}</span>`;
const newFlyout = `<div class="flyout-ing-avatar-wrap"><img src="\${(getIngredient(i.id) || i).image || i.image}" class="flyout-ing-3d-img" alt="\${i.name}" /></div>`;
content = content.replace(oldFlyout, newFlyout);

// 2. Matched staged chips (when recipe is ready)
const oldMatchedChip = `\${i.icon} \${i.name} \${s.staged[i.id]}/\${i.count} ✓ ↩`;
const newMatchedChip = `<img class="staged-chip-3d-img" src="\${(getIngredient(i.id) || i).image || i.image}" alt="\${i.name}" /> <span class="staged-chip-text">\${i.name} \${s.staged[i.id]}/\${i.count} ✓ ↩</span>`;
content = content.replace(oldMatchedChip, newMatchedChip);

// 3. Requirements rack icon
const oldReqIcon = `<span class="req-icon">\${i.icon}</span>`;
const newReqIcon = `<div class="cook-req-avatar-wrap"><img class="cook-req-3d-img" src="\${(getIngredient(i.id) || i).image || i.image}" alt="\${i.name}" /></div>`;
content = content.replace(oldReqIcon, newReqIcon);

// 4. Pending staged chips
const oldPendingChip = `\${i.icon} \${i.name} x\${s.staged[i.id]} ↩`;
const newPendingChip = `<img class="staged-chip-3d-img" src="\${(getIngredient(i.id) || i).image || i.image}" alt="\${i.name}" /> <span class="staged-chip-text">\${i.name} x\${s.staged[i.id]} ↩</span>`;
content = content.replace(oldPendingChip, newPendingChip);

// 5. Audition header: add miss counter
const oldScorePill = `<div class="audition-score-pill">
                    <span>Điểm nhịp:</span>
                    <strong class="audition-score-text">\${this.rhythmScore}/\${this.rhythmTarget}</strong>
                    <div class="audition-stars-meter">
                      \${Array.from({ length: this.rhythmTarget }).map((_, i) => \`<span class="audition-star \${i < this.rhythmScore ? 'is-lit' : ''}"><i class="star-bead"></i></span>\`).join('')}
                    </div>
                  </div>`;

const newScorePill = `<div class="audition-counters-group">
                    <div class="audition-score-pill">
                      <span class="pill-label">🎯 Nhịp trúng:</span>
                      <strong class="audition-score-text">\${this.rhythmScore}/\${this.rhythmTarget}</strong>
                      <div class="audition-stars-meter">
                        \${Array.from({ length: this.rhythmTarget }).map((_, i) => \`<span class="audition-star \${i < this.rhythmScore ? 'is-lit' : ''}"><i class="star-bead"></i></span>\`).join('')}
                      </div>
                    </div>
                    <div class="audition-miss-pill">
                      <span class="pill-label">💔 Lỡ nhịp:</span>
                      <strong class="audition-miss-text \${this.rhythmMisses > 0 ? 'is-danger' : ''}">\${this.rhythmMisses}/\${this.maxAllowedMisses}</strong>
                      <div class="audition-miss-hearts">
                        \${Array.from({ length: this.maxAllowedMisses }).map((_, i) => \`<span class="miss-heart-icon \${i < this.rhythmMisses ? 'is-missed' : ''}">\${i < this.rhythmMisses ? '💔' : '🤍'}</span>\`).join('')}
                      </div>
                    </div>
                  </div>`;

if (content.includes(oldScorePill)) {
  content = content.replace(oldScorePill, newScorePill);
}

// 6. Update updateAuditionScoreUI
const oldUpdateUI = `  updateAuditionScoreUI() {
    const scoreVal = this.content.querySelector('.audition-score-text');
    if (scoreVal) scoreVal.textContent = \`\${this.rhythmScore}/\${this.rhythmTarget}\`;
    
    const starsContainer = this.content.querySelector('.audition-stars-meter');
    if (starsContainer) {
      starsContainer.innerHTML = Array.from({ length: this.rhythmTarget }).map((_, i) =>
        \`<span class="audition-star \${i < this.rhythmScore ? 'is-lit' : ''}">\${i < this.rhythmScore ? '⭐' : '☆'}</span>\`
      ).join('');
    }`;

const newUpdateUI = `  updateAuditionScoreUI() {
    const scoreVal = this.content.querySelector('.audition-score-text');
    if (scoreVal) scoreVal.textContent = \`\${this.rhythmScore}/\${this.rhythmTarget}\`;
    
    const starsContainer = this.content.querySelector('.audition-stars-meter');
    if (starsContainer) {
      starsContainer.innerHTML = Array.from({ length: this.rhythmTarget }).map((_, i) =>
        \`<span class="audition-star \${i < this.rhythmScore ? 'is-lit' : ''}">\${i < this.rhythmScore ? '⭐' : '☆'}</span>\`
      ).join('');
    }

    const missVal = this.content.querySelector('.audition-miss-text');
    if (missVal) {
      missVal.textContent = \`\${this.rhythmMisses}/\${this.maxAllowedMisses}\`;
      missVal.className = \`audition-miss-text \${this.rhythmMisses > 0 ? 'is-danger' : ''}\`;
    }

    const missHearts = this.content.querySelector('.audition-miss-hearts');
    if (missHearts) {
      missHearts.innerHTML = Array.from({ length: this.maxAllowedMisses }).map((_, i) =>
        \`<span class="miss-heart-icon \${i < this.rhythmMisses ? 'is-missed' : ''}">\${i < this.rhythmMisses ? '💔' : '🤍'}</span>\`
      ).join('');
    }`;

if (content.includes(oldUpdateUI)) {
  content = content.replace(oldUpdateUI, newUpdateUI);
}

// 7. evaluateAuditionHit: count misses & fail on 2 misses
const oldMissEval = `    } else {
      this.rhythmFeedback = 'Chưa vào vùng đỏ! Bé canh lại nhé!';
      this.rhythmFeedbackType = 'miss';
      this.audio?.playChime(360, 0.08);
      this.triggerAuditionHitFX(false);
      this.updateAuditionScoreUI();
    }`;

const newMissEval = `    } else {
      this.rhythmMisses++;
      this.triggerAuditionHitFX(false);
      this.audio?.playChime(320, 0.12);
      
      if (this.rhythmMisses >= this.maxAllowedMisses) {
        this.rhythmFeedback = '💔 Đã hụt 2 nhịp! Món ăn bị cháy khét!';
        this.rhythmFeedbackType = 'miss';
        this.updateAuditionScoreUI();
        this.stopAuditionLoop();
        this.rhythmActive = false;
        setTimeout(() => {
          this.failCookingSession(s.id);
        }, 400);
        return;
      }

      this.rhythmFeedback = \`Hụt rồi (\${this.rhythmMisses}/\${this.maxAllowedMisses} lần)! Bé canh lại nhé!\`;
      this.rhythmFeedbackType = 'miss';
      this.updateAuditionScoreUI();
    }`;

if (content.includes(oldMissEval)) {
  content = content.replace(oldMissEval, newMissEval);
}

// 8. Pointer ghost 3D image
const oldGhost = `          const ing = getIngredient(item.dataset.ingredient);
          ghost.textContent=ing ? ing.icon : '🥕';`;

const newGhost = `          const ing = getIngredient(item.dataset.ingredient);
          if (ing?.image) {
            ghost.innerHTML = \`<img src="\${ing.image}" alt="\${ing.name}" class="ghost-3d-img" />\`;
          } else {
            ghost.textContent = ing ? ing.icon : '🥕';
          }`;

if (content.includes(oldGhost)) {
  content = content.replace(oldGhost, newGhost);
}

const finalOutput = isCRLF ? content.replace(/\n/g, '\r\n') : content;
fs.writeFileSync(filePath, finalOutput, 'utf8');
console.log('Replacements completed successfully!');
