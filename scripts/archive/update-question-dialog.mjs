import fs from 'node:fs';

let code = fs.readFileSync('src/game/ui/QuestionDialog.js', 'utf8');

const target = `  renderAnswers(question) {
    if (!this.answerList) return;
    this.answerList.replaceChildren();`;

const addition = `  renderAnswers(question) {
    if (!this.answerList) return;
    this.answerList.replaceChildren();

    if (question.type === 'memory_match' || question.type === 'pair_matching' || question.type === 'drag_sort') {
      const container = document.createElement('div');
      container.className = 'arena-interactive-card';

      if (question.type === 'memory_match') {
        const rawCards = question.cards || [{ id: 'c1', label: '🐰' }, { id: 'c2', label: '🐶' }, { id: 'c1_b', label: '🐰' }, { id: 'c2_b', label: '🐶' }];
        const cards = [...rawCards].sort(() => Math.random() - 0.5);
        const totalPairs = question.pairs || Math.floor(cards.length / 2);
        let matched = 0, sel = [], locked = false;

        const banner = document.createElement('div');
        banner.className = 'interactive-instruction-banner';
        banner.textContent = \`🃏 Lật 2 ô giống nhau (Tìm được 0/\${totalPairs} cặp)\`;
        container.appendChild(banner);

        const grid = document.createElement('div');
        grid.className = \`memory-grid grid-\${cards.length}\`;
        cards.forEach((c) => {
          const el = document.createElement('div');
          el.className = 'memory-card';
          el.innerHTML = \`<div class="memory-card-inner"><div class="memory-card-front"><span class="memory-card-mark">❓</span></div><div class="memory-card-back"><span class="memory-card-emoji">\${c.label}</span></div></div>\`;
          el.onclick = () => {
            if (locked || el.classList.contains('flipped') || el.classList.contains('matched')) return;
            el.classList.add('flipped');
            if (this.audioService?.playChime) this.audioService.playChime(640, 0.08);
            sel.push({ el, label: c.label });
            if (sel.length === 2) {
              locked = true;
              if (sel[0].label === sel[1].label) {
                setTimeout(() => {
                  sel[0].el.classList.add('matched');
                  sel[1].el.classList.add('matched');
                  matched++;
                  banner.textContent = \`🃏 Lật 2 ô giống nhau (Tìm được \${matched}/\${totalPairs} cặp)\`;
                  sel = []; locked = false;
                  if (matched >= totalPairs) {
                    banner.textContent = '🎉 XUẤT SẮC! Hoàn thành câu đố!';
                    if (this.audioService?.playChime) this.audioService.playChime(880, 0.2);
                    setTimeout(() => this.handleChoice(question.correct, container), 600);
                  }
                }, 300);
              } else {
                setTimeout(() => {
                  sel[0].el.classList.add('mismatch-shake');
                  sel[1].el.classList.add('mismatch-shake');
                  setTimeout(() => {
                    sel[0].el.classList.remove('flipped', 'mismatch-shake');
                    sel[1].el.classList.remove('flipped', 'mismatch-shake');
                    sel = []; locked = false;
                  }, 600);
                }, 400);
              }
            }
          };
          grid.appendChild(el);
        });
        container.appendChild(grid);
      } else if (question.type === 'pair_matching') {
        const leftItems = question.leftColumn || [];
        const rightItems = [...(question.rightColumn || [])].sort(() => Math.random() - 0.5);
        let activeLeft = null, matched = 0;

        const banner = document.createElement('div');
        banner.className = 'interactive-instruction-banner';
        banner.textContent = \`🔗 Chạm 1 ô Cột Trái rồi nối sang Cột Phải (0/\${leftItems.length})\`;
        container.appendChild(banner);

        const cols = document.createElement('div');
        cols.className = 'pair-match-columns';
        const colL = document.createElement('div');
        colL.className = 'pair-column pair-col-left';
        const colR = document.createElement('div');
        colR.className = 'pair-column pair-col-right';

        leftItems.forEach(it => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'pair-item-btn pair-left';
          btn.textContent = it.text;
          btn.onclick = () => {
            if (btn.classList.contains('matched-pair')) return;
            if (activeLeft) activeLeft.classList.remove('selected-left');
            activeLeft = btn;
            activeLeft.dataset.id = it.id;
            btn.classList.add('selected-left');
            if (this.audioService?.playChime) this.audioService.playChime(640, 0.08);
          };
          colL.appendChild(btn);
        });

        rightItems.forEach(it => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'pair-item-btn pair-right';
          btn.textContent = it.text;
          btn.onclick = () => {
            if (btn.classList.contains('matched-pair') || !activeLeft) return;
            if (it.matchId === activeLeft.dataset.id) {
              activeLeft.classList.remove('selected-left');
              activeLeft.classList.add('matched-pair');
              btn.classList.add('matched-pair');
              activeLeft.textContent = '✓ ' + activeLeft.textContent;
              btn.textContent = '✓ ' + btn.textContent;
              activeLeft = null;
              matched++;
              banner.textContent = \`🔗 Chạm 1 ô Cột Trái rồi nối sang Cột Phải (\${matched}/\${leftItems.length})\`;
              if (this.audioService?.playChime) this.audioService.playChime(880, 0.16);
              if (matched >= leftItems.length) {
                banner.textContent = '🎉 XUẤT SẮC! Đã nối đúng tất cả!';
                setTimeout(() => this.handleChoice(question.correct, container), 600);
              }
            } else {
              btn.classList.add('mismatch-shake');
              setTimeout(() => btn.classList.remove('mismatch-shake'), 400);
            }
          };
          colR.appendChild(btn);
        });

        cols.appendChild(colL);
        const div = document.createElement('div'); div.className = 'pair-column-divider'; div.textContent = '⚡'; cols.appendChild(div);
        cols.appendChild(colR);
        container.appendChild(cols);
      } else if (question.type === 'drag_sort') {
        const slots = question.slots || [];
        const poolItems = [...(question.items || [])].sort(() => Math.random() - 0.5);
        let picked = null, placed = 0;

        const banner = document.createElement('div');
        banner.className = 'interactive-instruction-banner';
        banner.textContent = \`📦 Chạm hoặc Kéo đồ vật vào khay đúng thứ tự (0/\${slots.length})\`;
        container.appendChild(banner);

        const pool = document.createElement('div');
        pool.className = 'drag-pool-items';

        poolItems.forEach(it => {
          const chip = document.createElement('div');
          chip.className = 'drag-item-chip';
          chip.textContent = it.label;
          chip.dataset.order = it.order;
          chip.onclick = () => {
            if (chip.classList.contains('is-placed')) {
              chip.parentElement.replaceChildren();
              pool.appendChild(chip);
              chip.classList.remove('is-placed', 'active-picked');
              placed = Math.max(0, placed - 1);
              banner.textContent = \`📦 Chạm hoặc Kéo đồ vật vào khay đúng thứ tự (\${placed}/\${slots.length})\`;
              return;
            }
            if (picked === chip) { chip.classList.remove('active-picked'); picked = null; }
            else { if (picked) picked.classList.remove('active-picked'); picked = chip; chip.classList.add('active-picked'); }
          };
          pool.appendChild(chip);
        });

        const slotsWrap = document.createElement('div');
        slotsWrap.className = 'drag-target-slots';

        slots.forEach((sName, sIdx) => {
          const slot = document.createElement('div');
          slot.className = 'drag-slot';
          slot.innerHTML = \`<span class="slot-badge">\${sName}</span><div class="slot-dropzone" data-slot="\${sIdx + 1}"></div>\`;
          const zone = slot.querySelector('.slot-dropzone');
          slot.onclick = () => {
            if (zone.children.length === 0 && picked) {
              const chip = picked;
              picked.classList.remove('active-picked');
              picked = null;
              chip.classList.add('is-placed');
              zone.appendChild(chip);
              placed++;
              banner.textContent = \`📦 Chạm hoặc Kéo đồ vật vào khay đúng thứ tự (\${placed}/\${slots.length})\`;
              if (placed === slots.length) {
                let ok = true;
                slotsWrap.querySelectorAll('.slot-dropzone').forEach(z => {
                  const s = parseInt(z.dataset.slot, 10);
                  const ord = parseInt(z.querySelector('.drag-item-chip')?.dataset.order, 10);
                  if (s !== ord) ok = false;
                });
                if (ok) {
                  slotsWrap.classList.add('all-correct');
                  banner.textContent = '🎉 XUẤT SẮC! Đã xếp đúng thứ tự!';
                  if (this.audioService?.playChime) this.audioService.playChime(880, 0.2);
                  setTimeout(() => this.handleChoice(question.correct, container), 600);
                } else {
                  slotsWrap.classList.add('has-error');
                  setTimeout(() => slotsWrap.classList.remove('has-error'), 600);
                }
              }
            }
          };
          slotsWrap.appendChild(slot);
        });

        container.appendChild(pool);
        container.appendChild(slotsWrap);
      }

      this.answerList.appendChild(container);
      return;
    }`;

code = code.replace(target, addition);
fs.writeFileSync('src/game/ui/QuestionDialog.js', code, 'utf8');
console.log('QuestionDialog.js updated successfully!');
