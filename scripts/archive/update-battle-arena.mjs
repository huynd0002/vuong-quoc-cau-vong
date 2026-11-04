import fs from 'node:fs';

let code = fs.readFileSync('src/game/ui/BattleArenaModal.js', 'utf8');

const targetCheck = `    if (question.isMaze) {`;
const addition = `    if (question.type === 'memory_match') {
      this.renderMemoryMatch(question);
      return;
    }
    if (question.type === 'pair_matching') {
      this.renderPairMatching(question);
      return;
    }
    if (question.type === 'drag_sort') {
      this.renderDragSort(question);
      return;
    }

    if (question.isMaze) {`;

code = code.replace(targetCheck, addition);

const methods = `
  renderMemoryMatch(question) {
    if (!this.answersGrid || !question) return;
    this.answersGrid.replaceChildren();

    const rawCards = question.cards || [
      { id: 'c1', label: '🐰 Thỏ' },
      { id: 'c2', label: '🐶 Chó' },
      { id: 'c1_b', label: '🐰 Thỏ' },
      { id: 'c2_b', label: '🐶 Chó' }
    ];

    const cards = [...rawCards].sort(() => Math.random() - 0.5);
    const totalPairs = question.pairs || Math.floor(cards.length / 2);
    let matchedPairs = 0;
    let selected = [];
    let isLocked = false;

    const wrap = document.createElement('div');
    wrap.className = \`arena-interactive-card memory-match-container count-\${cards.length}\`;

    const banner = document.createElement('div');
    banner.className = 'interactive-instruction-banner';
    banner.innerHTML = \`<span>🃏 Lật 2 ô giống nhau (Đã tìm: <b id="mem-matched-count">0</b>/\${totalPairs} cặp)</span>\`;
    wrap.appendChild(banner);

    const grid = document.createElement('div');
    grid.className = \`memory-grid grid-\${cards.length}\`;

    cards.forEach((card, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.dataset.index = idx;
      cardEl.dataset.label = card.label;

      cardEl.innerHTML = \`
        <div class="memory-card-inner">
          <div class="memory-card-front">
            <span class="memory-card-mark">❓</span>
          </div>
          <div class="memory-card-back">
            <span class="memory-card-emoji">\${card.label}</span>
          </div>
        </div>
      \`;

      cardEl.addEventListener('click', () => {
        if (this.isTurnLocked || isLocked) return;
        if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

        cardEl.classList.add('flipped');
        if (this.audioService?.playChime) {
          this.audioService.playChime(620 + selected.length * 100, 0.08);
        }
        selected.push({ el: cardEl, label: card.label });

        if (selected.length === 2) {
          isLocked = true;
          const [first, second] = selected;

          if (first.label === second.label) {
            setTimeout(() => {
              first.el.classList.add('matched');
              second.el.classList.add('matched');
              matchedPairs++;
              const countEl = wrap.querySelector('#mem-matched-count');
              if (countEl) countEl.textContent = matchedPairs;

              if (this.audioService?.playChime) {
                this.audioService.playChime(880, 0.16);
              }
              this.spawnAnswerConfetti(second.el);
              selected = [];
              isLocked = false;

              if (matchedPairs >= totalPairs) {
                this.isTurnLocked = true;
                banner.innerHTML = '<span>🎉 XUẤT SẮC! Bé đã tìm đủ các cặp giống nhau! ✨</span>';
                banner.style.background = '#dcfce7';
                banner.style.borderColor = '#22c55e';
                banner.style.color = '#15803d';

                setTimeout(() => {
                  this.executeHeroAttack();
                }, 700);
              }
            }, 300);
          } else {
            setTimeout(() => {
              first.el.classList.add('mismatch-shake');
              second.el.classList.add('mismatch-shake');
              if (this.audioService?.playChime) {
                this.audioService.playChime(320, 0.1);
              }

              setTimeout(() => {
                first.el.classList.remove('flipped', 'mismatch-shake');
                second.el.classList.remove('flipped', 'mismatch-shake');
                selected = [];
                isLocked = false;
              }, 700);
            }, 500);
          }
        }
      });

      grid.appendChild(cardEl);
    });

    wrap.appendChild(grid);
    this.answersGrid.appendChild(wrap);
  }

  renderPairMatching(question) {
    if (!this.answersGrid || !question) return;
    this.answersGrid.replaceChildren();

    const leftItems = question.leftColumn || [
      { id: 'l1', text: '🐰 Bé Thỏ' },
      { id: 'l2', text: '🐒 Chú Khỉ' },
      { id: 'l3', text: '🐶 Chó Con' }
    ];
    const rawRightItems = question.rightColumn || [
      { id: 'r1', text: '🥕 Cà rốt', matchId: 'l1' },
      { id: 'r2', text: '🍌 Quả chuối', matchId: 'l2' },
      { id: 'r3', text: '🦴 Khúc xương', matchId: 'l3' }
    ];
    const rightItems = [...rawRightItems].sort(() => Math.random() - 0.5);

    let activeLeftBtn = null;
    let matchedCount = 0;
    const totalCount = leftItems.length;

    const wrap = document.createElement('div');
    wrap.className = 'arena-interactive-card pair-match-container';

    const banner = document.createElement('div');
    banner.className = 'interactive-instruction-banner';
    banner.innerHTML = \`<span>🔗 Chạm 1 ô Cột Trái rồi chạm ô tương ứng ở Cột Phải (<b id="pair-matched-count">0</b>/\${totalCount})</span>\`;
    wrap.appendChild(banner);

    const colsWrap = document.createElement('div');
    colsWrap.className = 'pair-match-columns';

    const colLeft = document.createElement('div');
    colLeft.className = 'pair-column pair-col-left';

    const colRight = document.createElement('div');
    colRight.className = 'pair-column pair-col-right';

    leftItems.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pair-item-btn pair-left';
      btn.dataset.id = item.id;
      btn.innerHTML = \`<span class="pair-item-text">\${item.text}</span>\`;

      btn.addEventListener('click', () => {
        if (this.isTurnLocked || btn.classList.contains('matched-pair')) return;
        if (activeLeftBtn) activeLeftBtn.classList.remove('selected-left');

        activeLeftBtn = btn;
        btn.classList.add('selected-left');
        if (this.audioService?.playChime) {
          this.audioService.playChime(640, 0.08);
        }
      });
      colLeft.appendChild(btn);
    });

    rightItems.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pair-item-btn pair-right';
      btn.dataset.id = item.id;
      btn.dataset.matchId = item.matchId;
      btn.innerHTML = \`<span class="pair-item-text">\${item.text}</span>\`;

      btn.addEventListener('click', () => {
        if (this.isTurnLocked || btn.classList.contains('matched-pair')) return;

        if (!activeLeftBtn) {
          if (this.audioService?.speak) {
            this.audioService.speak('Bé hãy chạm vào một ô bên cột trái trước nhé!');
          }
          return;
        }

        const leftId = activeLeftBtn.dataset.id;
        if (btn.dataset.matchId === leftId) {
          activeLeftBtn.classList.remove('selected-left');
          activeLeftBtn.classList.add('matched-pair');
          btn.classList.add('matched-pair');

          activeLeftBtn.innerHTML = \`<span>✓ \${activeLeftBtn.textContent}</span>\`;
          btn.innerHTML = \`<span>✓ \${btn.textContent}</span>\`;

          matchedCount++;
          const countEl = wrap.querySelector('#pair-matched-count');
          if (countEl) countEl.textContent = matchedCount;

          if (this.audioService?.playChime) {
            this.audioService.playChime(880, 0.16);
          }
          this.spawnAnswerConfetti(btn);
          activeLeftBtn = null;

          if (matchedCount >= totalCount) {
            this.isTurnLocked = true;
            banner.innerHTML = '<span>🎉 HOÀN THÀNH! Bé đã nối đúng tất cả các cặp! ✨</span>';
            banner.style.background = '#dcfce7';
            banner.style.borderColor = '#22c55e';
            banner.style.color = '#15803d';

            setTimeout(() => {
              this.executeHeroAttack();
            }, 700);
          }
        } else {
          btn.classList.add('mismatch-shake');
          activeLeftBtn.classList.add('mismatch-shake');
          if (this.audioService?.playChime) {
            this.audioService.playChime(320, 0.1);
          }
          setTimeout(() => {
            btn.classList.remove('mismatch-shake');
            if (activeLeftBtn) {
              activeLeftBtn.classList.remove('mismatch-shake', 'selected-left');
              activeLeftBtn = null;
            }
          }, 500);
        }
      });
      colRight.appendChild(btn);
    });

    colsWrap.appendChild(colLeft);
    const divider = document.createElement('div');
    divider.className = 'pair-column-divider';
    divider.textContent = '⚡';
    colsWrap.appendChild(divider);
    colsWrap.appendChild(colRight);

    wrap.appendChild(colsWrap);
    this.answersGrid.appendChild(wrap);
  }

  renderDragSort(question) {
    if (!this.answersGrid || !question) return;
    this.answersGrid.replaceChildren();

    const slots = question.slots || ['1. Nhỏ nhất', '2. Vừa', '3. Lớn nhất'];
    const rawItems = question.items || [
      { id: 'it1', label: '🐥 Gà Con', order: 1 },
      { id: 'it2', label: '🐰 Bé Thỏ', order: 2 },
      { id: 'it3', label: '🐻 Bác Gấu', order: 3 }
    ];
    const poolItems = [...rawItems].sort(() => Math.random() - 0.5);

    let pickedItem = null;
    const totalItems = rawItems.length;

    const wrap = document.createElement('div');
    wrap.className = 'arena-interactive-card drag-sort-container';

    const banner = document.createElement('div');
    banner.className = 'interactive-instruction-banner';
    banner.innerHTML = \`<span>📦 Kéo hoặc Chạm đồ vật để xếp vào đúng khay theo thứ tự (<b id="sort-placed-count">0</b>/\${totalItems})</span>\`;
    wrap.appendChild(banner);

    const poolDiv = document.createElement('div');
    poolDiv.className = 'drag-pool-items';
    poolDiv.id = 'drag-pool-items';

    const arrowDiv = document.createElement('div');
    arrowDiv.className = 'drag-arrow-down';
    arrowDiv.textContent = '⬇️ ĐẶT VÀO CÁC KHAY THEO THỨ TỰ ⬇️';

    const slotsDiv = document.createElement('div');
    slotsDiv.className = 'drag-target-slots';

    poolItems.forEach(it => {
      const chip = document.createElement('div');
      chip.className = 'drag-item-chip';
      chip.draggable = true;
      chip.dataset.itemId = it.id;
      chip.dataset.order = it.order;
      chip.innerHTML = \`<span class="drag-item-label">\${it.label}</span>\`;

      chip.addEventListener('dragstart', (e) => {
        if (this.isTurnLocked) return;
        e.dataTransfer.setData('text/plain', it.id);
        chip.classList.add('dragging');
      });
      chip.addEventListener('dragend', () => {
        chip.classList.remove('dragging');
      });

      chip.addEventListener('click', () => {
        if (this.isTurnLocked) return;
        if (chip.classList.contains('is-placed')) {
          const parentZone = chip.parentElement;
          if (parentZone) {
            parentZone.replaceChildren();
            poolDiv.appendChild(chip);
            chip.classList.remove('is-placed', 'active-picked');
            const zones = wrap.querySelectorAll('.slot-dropzone');
            let filled = 0;
            zones.forEach(z => { if (z.children.length > 0) filled++; });
            const countEl = wrap.querySelector('#sort-placed-count');
            if (countEl) countEl.textContent = filled;
            if (this.audioService?.playChime) this.audioService.playChime(520, 0.05);
            return;
          }
        }

        if (pickedItem === chip) {
          chip.classList.remove('active-picked');
          pickedItem = null;
        } else {
          if (pickedItem) pickedItem.classList.remove('active-picked');
          pickedItem = chip;
          chip.classList.add('active-picked');
          if (this.audioService?.playChime) this.audioService.playChime(640, 0.06);
        }
      });

      poolDiv.appendChild(chip);
    });

    slots.forEach((slotLabel, sIdx) => {
      const slotEl = document.createElement('div');
      slotEl.className = 'drag-slot';
      slotEl.dataset.slotIndex = sIdx + 1;

      slotEl.innerHTML = \`
        <span class="slot-badge">\${slotLabel}</span>
        <div class="slot-dropzone" data-slot-index="\${sIdx + 1}"></div>
      \`;

      const zone = slotEl.querySelector('.slot-dropzone');

      slotEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        slotEl.classList.add('drag-over');
      });
      slotEl.addEventListener('dragleave', () => {
        slotEl.classList.remove('drag-over');
      });
      slotEl.addEventListener('drop', (e) => {
        e.preventDefault();
        slotEl.classList.remove('drag-over');
        const itId = e.dataTransfer.getData('text/plain');
        const chip = poolDiv.querySelector(\`[data-item-id="\${itId}"]\`) || wrap.querySelector(\`[data-item-id="\${itId}"]\`);
        if (chip && zone.children.length === 0) {
          this.placeChipIntoZone(chip, zone, wrap, totalItems);
        }
      });

      slotEl.addEventListener('click', () => {
        if (this.isTurnLocked) return;
        if (zone.children.length === 0 && pickedItem) {
          const chip = pickedItem;
          pickedItem.classList.remove('active-picked');
          pickedItem = null;
          this.placeChipIntoZone(chip, zone, wrap, totalItems);
        }
      });

      slotsDiv.appendChild(slotEl);
    });

    wrap.appendChild(poolDiv);
    wrap.appendChild(arrowDiv);
    wrap.appendChild(slotsDiv);
    this.answersGrid.appendChild(wrap);
  }

  placeChipIntoZone(chip, zone, wrap, totalItems) {
    zone.appendChild(chip);
    chip.classList.add('is-placed');
    if (this.audioService?.playChime) {
      this.audioService.playChime(700, 0.08);
    }

    const zones = wrap.querySelectorAll('.slot-dropzone');
    let filled = 0;
    zones.forEach(z => { if (z.children.length > 0) filled++; });

    const countEl = wrap.querySelector('#sort-placed-count');
    if (countEl) countEl.textContent = filled;

    if (filled === totalItems) {
      let isAllCorrect = true;
      zones.forEach(z => {
        const slotIdx = parseInt(z.dataset.slotIndex, 10);
        const childChip = z.querySelector('.drag-item-chip');
        const order = parseInt(childChip?.dataset.order, 10);
        if (slotIdx !== order) {
          isAllCorrect = false;
        }
      });

      const slotsDiv = wrap.querySelector('.drag-target-slots');
      const banner = wrap.querySelector('.interactive-instruction-banner');

      if (isAllCorrect) {
        slotsDiv.classList.add('all-correct');
        this.isTurnLocked = true;
        banner.innerHTML = '<span>🎉 XUẤT SẮC! Bé đã sắp xếp hoàn toàn chuẩn xác! ✨</span>';
        banner.style.background = '#dcfce7';
        banner.style.borderColor = '#22c55e';
        banner.style.color = '#15803d';

        if (this.audioService?.playChime) {
          this.audioService.playChime(880, 0.2);
        }
        this.spawnAnswerConfetti(slotsDiv);

        setTimeout(() => {
          this.executeHeroAttack();
        }, 700);
      } else {
        slotsDiv.classList.add('has-error');
        if (this.audioService?.playChime) {
          this.audioService.playChime(320, 0.12);
        }
        if (this.audioService?.speak) {
          this.audioService.speak('Bé hãy chạm vào các món đồ để đổi lại vị trí cho đúng nhé!');
        }
        setTimeout(() => {
          slotsDiv.classList.remove('has-error');
        }, 600);
      }
    }
  }
`;

code = code.replace('  openMazeChallengeForTurn() {', methods + '\n  openMazeChallengeForTurn() {');

fs.writeFileSync('src/game/ui/BattleArenaModal.js', code, 'utf8');
console.log('BattleArenaModal.js updated successfully!');
