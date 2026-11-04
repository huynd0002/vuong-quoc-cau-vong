# Script to update promptFormatter.js, BattleArenaModal.js, QuestionDialog.js, and game.css

# 1. Update src/game/ui/promptFormatter.js
with open('src/game/ui/promptFormatter.js', 'r', encoding='utf-8') as f:
    pf = f.read().replace('\r\n', '\n')

item_map_code = """
export const ITEM_IMAGE_MAP = {
  // Trái cây (Fruits)
  'cam': '/assets/edu/fruits/fruit_orange.png',
  'quả cam': '/assets/edu/fruits/fruit_orange.png',
  'táo': '/assets/edu/fruits/fruit_apple.png',
  'quả táo': '/assets/edu/fruits/fruit_apple.png',
  'chuối': '/assets/edu/fruits/fruit_banana.png',
  'quả chuối': '/assets/edu/fruits/fruit_banana.png',
  'dưa hấu': '/assets/edu/fruits/fruit_watermelon.png',
  'miếng dưa hấu': '/assets/edu/fruits/fruit_watermelon.png',
  'dâu': '/assets/edu/fruits/fruit_strawberry.png',
  'dâu tây': '/assets/edu/fruits/fruit_strawberry.png',
  'quả dâu tây': '/assets/edu/fruits/fruit_strawberry.png',
  'cà rốt': '/assets/edu/fruits/fruit_carrot.svg',

  // Động vật (Animals)
  'vịt': '/assets/edu/animals/anim_duck.png',
  'chú vịt': '/assets/edu/animals/anim_duck.png',
  'con vịt': '/assets/edu/animals/anim_duck.png',
  'chó': '/assets/edu/animals/anim_dog.png',
  'cún': '/assets/edu/animals/anim_dog.png',
  'chú cún': '/assets/edu/animals/anim_dog.png',
  'chú chó': '/assets/edu/animals/anim_dog.png',
  'mèo': '/assets/edu/animals/anim_cat.png',
  'chú mèo': '/assets/edu/animals/anim_cat.png',
  'thỏ': '/assets/edu/animals/anim_bunny.png',
  'bé thỏ': '/assets/edu/animals/anim_bunny.png',
  'chú thỏ': '/assets/edu/animals/anim_bunny.png',
  'cua': '/assets/edu/animals/anim_crab.png',
  'chú cua': '/assets/edu/animals/anim_crab.png',
  'con cua': '/assets/edu/animals/anim_crab.png',
  'rùa': '/assets/edu/animals/anim_turtle.png',
  'chú rùa': '/assets/edu/animals/anim_turtle.png',
  'con rùa': '/assets/edu/animals/anim_turtle.png',
  'ếch': '/assets/edu/animals/anim_frog.png',
  'chú ếch': '/assets/edu/animals/anim_frog.png',
  'gấu': '/assets/edu/animals/anim_bear.png',
  'chú gấu': '/assets/edu/animals/anim_bear.png',
  'bác gấu': '/assets/edu/animals/anim_bear.png',
  'ong': '/assets/edu/animals/anim_bee.png',
  'chú ong': '/assets/edu/animals/anim_bee.png',
  'bướm': '/assets/edu/animals/anim_butterfly.png',
  'cá': '/assets/edu/animals/anim_whale.png',
  'cá voi': '/assets/edu/animals/anim_whale.png',
  'chim': '/assets/edu/animals/anim_penguin.png',
  'chim cánh cụt': '/assets/edu/animals/anim_penguin.png',
  'đom đóm': '/assets/edu/shapes/shape_star.png',

  // Đồ chơi & Vật dụng (Toys & Items)
  'bóng bay': '/assets/edu/toys/toy_balloon.png',
  'bong bóng': '/assets/edu/toys/toy_balloon.png',
  'quả bóng': '/assets/edu/toys/toy_ball.png',
  'bóng': '/assets/edu/toys/toy_balloon.png',
  'ô tô': '/assets/edu/toys/toy_car.png',
  'xe': '/assets/edu/toys/toy_car.png',
  'xe hơi': '/assets/edu/toys/toy_car.png',
  'kẹo': '/assets/edu/toys/toy_lollipop.png',
  'kẹo mút': '/assets/edu/toys/toy_lollipop.png',
  'bánh quy': '/assets/edu/toys/toy_lollipop.png',
  'bánh': '/assets/edu/toys/toy_lollipop.png',
  'khối gỗ': '/assets/edu/toys/toy_blocks.png',
  'xếp hình': '/assets/edu/toys/toy_blocks.png',
  'thuyền': '/assets/edu/toys/toy_boat.png',
  'máy bay': '/assets/edu/toys/toy_plane.png',
  'trống': '/assets/edu/toys/toy_drum.png',
  'kem': '/assets/edu/toys/toy_icecream.png',
  'cây dù': '/assets/edu/toys/toy_umbrella.png',
  'ô dù': '/assets/edu/toys/toy_umbrella.png',

  // Hình khối & Biểu tượng (Shapes & Icons)
  'ngôi sao': '/assets/edu/shapes/shape_star.png',
  'sao': '/assets/edu/shapes/shape_star.png',
  'pha lê': '/assets/edu/shapes/shape_star.png',
  'viên pha lê': '/assets/edu/shapes/shape_star.png',
  'đuốc': '/assets/edu/shapes/shape_star.png',
  'trái tim': '/assets/edu/shapes/shape_heart.png',
  'hình tam giác': '/assets/edu/shapes/shape_triangle.png',
  'tam giác': '/assets/edu/shapes/shape_triangle.png',
  'hình tròn': '/assets/edu/shapes/shape_circle.png',
  'tròn': '/assets/edu/shapes/shape_circle.png',
  'hình vuông': '/assets/edu/shapes/shape_square.png',
  'vuông': '/assets/edu/shapes/shape_square.png',
  'hình chữ nhật': '/assets/edu/shapes/shape_rectangle.png',
  'chữ nhật': '/assets/edu/shapes/shape_rectangle.png'
};

export function resolveQuestionItemImage(question) {
  if (!question) return null;
  if (question.countItem && typeof question.countItem === 'string') return question.countItem;
  if (Array.isArray(question.visualItems) && question.visualItems[0]) return question.visualItems[0];
  if (question.itemImage && typeof question.itemImage === 'string') return question.itemImage;
  if (question.image && typeof question.image === 'string' &&
      !question.image.includes('shadow') && !question.image.includes('banner') && !question.image.includes('maze')) {
    return question.image;
  }

  // Phân tích từ prompt hoặc speak
  const text = ((question.prompt || '') + ' ' + (question.speak || '')).toLowerCase();
  for (const [key, url] of Object.entries(ITEM_IMAGE_MAP)) {
    if (text.includes(key)) {
      return url;
    }
  }
  return null;
}

export function resolveChoiceQuantityAndItem(choice, question) {
  if (!choice || typeof choice !== 'string') return null;
  const clean = choice.trim();
  const numMatch = clean.match(/^(\d+)/);
  if (!numMatch) return null;

  const count = parseInt(numMatch[1], 10);
  if (isNaN(count) || count < 1 || count > 10) return null;

  // 1. Tìm hình học liệu từ chính text của đáp án nếu có
  const choiceLower = clean.toLowerCase();
  let itemImg = null;
  for (const [key, url] of Object.entries(ITEM_IMAGE_MAP)) {
    if (choiceLower.includes(key)) {
      itemImg = url;
      break;
    }
  }

  // 2. Nếu đáp án chỉ là số hoặc không chỉ rõ loại quả/vật, lấy hình từ câu hỏi để đồng bộ 100%
  if (!itemImg && question) {
    itemImg = resolveQuestionItemImage(question);
  }

  return {
    count,
    itemImg,
    isPureNumber: /^\\d+$/.test(clean)
  };
}
"""

# Replace resolveChoiceImage block or append functions
target_insert = "export function resolveChoiceImage(choiceText) {"
assert target_insert in pf, "target_insert not found in promptFormatter.js"
pf = pf.replace(target_insert, item_map_code + "\n" + target_insert, 1)

# Export escapeHtml
pf = pf.replace("function escapeHtml(str = '') {", "export function escapeHtml(str = '') {", 1)

# In promptFormatter.js: upgrade countRegex icons to use itemImg when available
old_count_code = """  // 7. Câu hỏi đếm số lượng có dãy icons: "Bé đếm xem có mấy quả cam? 🍊 🍊 🍊"
  const countRegex = /^(.*?[?:]|\\S.*?)\\s+((?:[\\p{Extended_Pictographic}]\\s*){2,})$/u;
  const countMatch = promptText.match(countRegex);
  if (countMatch) {
    const textPart = countMatch[1].trim();
    const iconsPart = countMatch[2].trim().split(/\\s+/).filter(Boolean);
    const iconsHtml = iconsPart.map((icon, idx) => `
      <span class="count-item-icon" style="animation-delay:${idx * 60}ms">${escapeHtml(icon)}</span>
    `).join('');

    return `
      <div class="prompt-count-container">
        <div class="prompt-title-text">${escapeHtml(textPart)}</div>
        <div class="math-count-tray">${iconsHtml}</div>
      </div>
    `.trim();
  }"""

new_count_code = """  // 7. Câu hỏi đếm số lượng có dãy icons: "Bé đếm xem có mấy quả cam? 🍊 🍊 🍊"
  const countRegex = /^(.*?[?:]|\\S.*?)\\s+((?:[\\p{Extended_Pictographic}]\\s*){2,})$/u;
  const countMatch = promptText.match(countRegex);
  if (countMatch) {
    const textPart = countMatch[1].trim();
    const iconsPart = countMatch[2].trim().split(/\\s+/).filter(Boolean);
    const itemImg = resolveQuestionItemImage(q);

    const iconsHtml = iconsPart.map((icon, idx) => {
      if (itemImg) {
        return `
          <div class="count-item-card" style="animation-delay:${idx * 60}ms">
            <img src="${itemImg}" class="count-card-img" alt="Học liệu đếm">
            <span class="count-card-dot">${idx + 1}</span>
          </div>
        `;
      }
      return `<span class="count-item-icon" style="animation-delay:${idx * 60}ms">${escapeHtml(icon)}</span>`;
    }).join('');

    if (itemImg) {
      return `
        <div class="prompt-count-container">
          <div class="prompt-title-text">${escapeHtml(textPart)}</div>
          <div class="prompt-count-tray-grid count-grid-${Math.min(iconsPart.length, 10)}">${iconsHtml}</div>
        </div>
      `.trim();
    }

    return `
      <div class="prompt-count-container">
        <div class="prompt-title-text">${escapeHtml(textPart)}</div>
        <div class="math-count-tray">${iconsHtml}</div>
      </div>
    `.trim();
  }"""

assert old_count_code in pf, "old_count_code not found in promptFormatter.js"
pf = pf.replace(old_count_code, new_count_code, 1)

# In promptFormatter.js: upgrade math equation cards to use itemImg when available
old_math_icons = """    if (!icons1 || icons1.length === 0) {
      const emoji1 = inferEmojiFromLabel(label1);
      icons1 = emoji1.repeat(Math.min(num1, 10));
    }
    if (!icons2 || icons2.length === 0) {
      const emoji2 = inferEmojiFromLabel(label2 || label1);
      icons2 = emoji2.repeat(Math.min(num2, 10));
    }

    return `
      <div class="math-visual-equation">
        <div class="math-visual-card">
          <span class="math-card-num">${num1}</span>
          <span class="math-card-icons">${escapeHtml(icons1)}</span>
          <span class="math-card-label">${escapeHtml(label1)}</span>
        </div>
        <span class="math-visual-operator ${isSubtraction ? 'math-op-minus' : 'math-op-plus'}">${opDisplay}</span>
        <div class="math-visual-card">
          <span class="math-card-num">${num2}</span>
          <span class="math-card-icons">${escapeHtml(icons2)}</span>
          <span class="math-card-label">${escapeHtml(label2)}</span>
        </div>"""

new_math_icons = """    const itemImg = resolveQuestionItemImage(q);
    let iconsDisplay1 = '';
    let iconsDisplay2 = '';

    if (itemImg) {
      iconsDisplay1 = Array(num1).fill(`<img src="${itemImg}" class="math-card-mini-img" alt="${escapeHtml(label1)}">`).join('');
      iconsDisplay2 = Array(num2).fill(`<img src="${itemImg}" class="math-card-mini-img" alt="${escapeHtml(label2)}">`).join('');
    } else {
      if (!icons1 || icons1.length === 0) {
        const emoji1 = inferEmojiFromLabel(label1);
        icons1 = emoji1.repeat(Math.min(num1, 10));
      }
      if (!icons2 || icons2.length === 0) {
        const emoji2 = inferEmojiFromLabel(label2 || label1);
        icons2 = emoji2.repeat(Math.min(num2, 10));
      }
      iconsDisplay1 = `<span class="math-card-icons">${escapeHtml(icons1)}</span>`;
      iconsDisplay2 = `<span class="math-card-icons">${escapeHtml(icons2)}</span>`;
    }

    return `
      <div class="math-visual-equation">
        <div class="math-visual-card">
          <span class="math-card-num">${num1}</span>
          <div class="math-card-items-wrap">${iconsDisplay1}</div>
          <span class="math-card-label">${escapeHtml(label1)}</span>
        </div>
        <span class="math-visual-operator ${isSubtraction ? 'math-op-minus' : 'math-op-plus'}">${opDisplay}</span>
        <div class="math-visual-card">
          <span class="math-card-num">${num2}</span>
          <div class="math-card-items-wrap">${iconsDisplay2}</div>
          <span class="math-card-label">${escapeHtml(label2)}</span>
        </div>"""

assert old_math_icons in pf, "old_math_icons not found in promptFormatter.js"
pf = pf.replace(old_math_icons, new_math_icons, 1)

with open('src/game/ui/promptFormatter.js', 'w', encoding='utf-8') as f:
    f.write(pf)
print("Updated promptFormatter.js successfully!")

# 2. Update BattleArenaModal.js
with open('src/game/ui/BattleArenaModal.js', 'r', encoding='utf-8') as f:
    bam = f.read().replace('\r\n', '\n')

bam_import_target = "import { formatQuestionPromptHtml, resolveChoiceImage } from './promptFormatter.js';"
bam_import_replace = "import { formatQuestionPromptHtml, resolveChoiceImage, resolveChoiceQuantityAndItem, escapeHtml } from './promptFormatter.js';"
assert bam_import_target in bam, "bam_import_target not found in BattleArenaModal.js"
bam = bam.replace(bam_import_target, bam_import_replace, 1)

old_bam_render_choices = """    question.choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `ans-btn ans-btn-${index + 1}`;

      const choiceImg = question.choiceImages?.[index] || resolveChoiceImage(choice);
      const isPureNumber = /^\\d+$/.test(choice.trim());

      if (choiceImg) {
        btn.classList.add('ans-btn-image-mode');
        btn.innerHTML = `
          <img src="${badgeImgs[index] || badgeImgs[0]}" class="ans-badge-img" alt="${badges[index]}">
          <div class="ans-image-frame">
            <img src="${choiceImg}" class="ans-image-pic" alt="${choice}">
          </div>
          <span class="ans-image-caption">${choice}</span>
        `;
      } else if (isPureNumber) {
        btn.classList.add('ans-btn-number-mode');
        btn.innerHTML = `
          <img src="${badgeImgs[index] || badgeImgs[0]}" class="ans-badge-img" alt="${badges[index]}">
          <span class="ans-giant-number">${choice.trim()}</span>
        `;
      } else {
        btn.innerHTML = `
          <img src="${badgeImgs[index] || badgeImgs[0]}" class="ans-badge-img" alt="${badges[index]}">
          <span class="ans-text">${choice}</span>
        `;
      }"""

new_bam_render_choices = """    question.choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `ans-btn ans-btn-${index + 1}`;

      const choiceImg = question.choiceImages?.[index] || resolveChoiceImage(choice);
      const qtyInfo = resolveChoiceQuantityAndItem(choice, question);

      if (qtyInfo) {
        const { count, itemImg, isPureNumber } = qtyInfo;
        if (itemImg) {
          // CHẾ ĐỘ HÌNH ẢNH SỐ LƯỢNG (Visual Quantity Mode)
          // "Vd 5 quả cam (hình ảnh 5 quả cam, hình ảnh câu hỏi và đáp án giống nhau)"
          btn.classList.add('ans-btn-quantity-mode');
          let trayHtml = '';
          for (let i = 0; i < count; i++) {
            trayHtml += `<img src="${itemImg}" class="ans-quantity-mini-img" alt="${count}">`;
          }

          btn.innerHTML = `
            <img src="${badgeImgs[index] || badgeImgs[0]}" class="ans-badge-img" alt="${badges[index]}">
            <div class="ans-quantity-body">
              <span class="ans-giant-number">${count}</span>
              <div class="ans-quantity-tray count-${count}">
                ${trayHtml}
              </div>
            </div>
            ${!isPureNumber ? `<span class="ans-quantity-caption">${escapeHtml(choice)}</span>` : ''}
          `;
        } else {
          // CHẾ ĐỘ CHỮ SỐ TO (Giant Number Mode)
          // "Cho chữ số đáp án to lên"
          btn.classList.add('ans-btn-number-mode');
          btn.innerHTML = `
            <img src="${badgeImgs[index] || badgeImgs[0]}" class="ans-badge-img" alt="${badges[index]}">
            <div class="ans-number-body">
              <span class="ans-giant-number">${count}</span>
              <div class="ans-counting-dots" aria-hidden="true">
                ${'⭐'.repeat(Math.min(count, 10))}
              </div>
            </div>
            ${!isPureNumber ? `<span class="ans-quantity-caption">${escapeHtml(choice)}</span>` : ''}
          `;
        }
      } else if (choiceImg) {
        btn.classList.add('ans-btn-image-mode');
        btn.innerHTML = `
          <img src="${badgeImgs[index] || badgeImgs[0]}" class="ans-badge-img" alt="${badges[index]}">
          <div class="ans-image-frame">
            <img src="${choiceImg}" class="ans-image-pic" alt="${choice}">
          </div>
          <span class="ans-image-caption">${escapeHtml(choice)}</span>
        `;
      } else {
        btn.classList.add('ans-btn-text-mode');
        btn.innerHTML = `
          <img src="${badgeImgs[index] || badgeImgs[0]}" class="ans-badge-img" alt="${badges[index]}">
          <span class="ans-text">${escapeHtml(choice)}</span>
        `;
      }"""

assert old_bam_render_choices in bam, "old_bam_render_choices not found in BattleArenaModal.js"
bam = bam.replace(old_bam_render_choices, new_bam_render_choices, 1)

with open('src/game/ui/BattleArenaModal.js', 'w', encoding='utf-8') as f:
    f.write(bam)
print("Updated BattleArenaModal.js successfully!")

# 3. Update QuestionDialog.js
with open('src/game/ui/QuestionDialog.js', 'r', encoding='utf-8') as f:
    qd = f.read().replace('\r\n', '\n')

qd_import_target = "import { formatQuestionPromptHtml, resolveChoiceImage } from './promptFormatter.js';"
qd_import_replace = "import { formatQuestionPromptHtml, resolveChoiceImage, resolveChoiceQuantityAndItem, escapeHtml } from './promptFormatter.js';"
assert qd_import_target in qd, "qd_import_target not found in QuestionDialog.js"
qd = qd.replace(qd_import_target, qd_import_replace, 1)

old_qd_render_choices = """    question.choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-button';

      const choiceImg = question.choiceImages?.[index] || resolveChoiceImage(choice);
      if (choiceImg) {
        button.classList.add('answer-button-image-mode');
        button.innerHTML = `
          <div class="ans-image-frame"><img src="${choiceImg}" class="ans-image-pic" alt="${choice}"></div>
          <span class="ans-image-caption">${choice}</span>
        `;
      } else {
        button.textContent = choice;
      }"""

new_qd_render_choices = """    question.choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-button';

      const choiceImg = question.choiceImages?.[index] || resolveChoiceImage(choice);
      const qtyInfo = resolveChoiceQuantityAndItem(choice, question);

      if (qtyInfo) {
        const { count, itemImg, isPureNumber } = qtyInfo;
        if (itemImg) {
          button.classList.add('answer-button-quantity-mode');
          let trayHtml = '';
          for (let i = 0; i < count; i++) {
            trayHtml += `<img src="${itemImg}" class="ans-quantity-mini-img" alt="${count}">`;
          }
          button.innerHTML = `
            <div class="ans-quantity-body">
              <span class="ans-giant-number">${count}</span>
              <div class="ans-quantity-tray count-${count}">
                ${trayHtml}
              </div>
            </div>
            ${!isPureNumber ? `<span class="ans-quantity-caption">${escapeHtml(choice)}</span>` : ''}
          `;
        } else {
          button.classList.add('answer-button-number-mode');
          button.innerHTML = `
            <div class="ans-number-body">
              <span class="ans-giant-number">${count}</span>
              <div class="ans-counting-dots" aria-hidden="true">${'⭐'.repeat(Math.min(count, 10))}</div>
            </div>
            ${!isPureNumber ? `<span class="ans-quantity-caption">${escapeHtml(choice)}</span>` : ''}
          `;
        }
      } else if (choiceImg) {
        button.classList.add('answer-button-image-mode');
        button.innerHTML = `
          <div class="ans-image-frame"><img src="${choiceImg}" class="ans-image-pic" alt="${choice}"></div>
          <span class="ans-image-caption">${escapeHtml(choice)}</span>
        `;
      } else {
        button.classList.add('answer-button-text-mode');
        button.innerHTML = `<span class="ans-text">${escapeHtml(choice)}</span>`;
      }"""

assert old_qd_render_choices in qd, "old_qd_render_choices not found in QuestionDialog.js"
qd = qd.replace(old_qd_render_choices, new_qd_render_choices, 1)

with open('src/game/ui/QuestionDialog.js', 'w', encoding='utf-8') as f:
    f.write(qd)
print("Updated QuestionDialog.js successfully!")

# 4. Update src/styles/game.css
with open('src/styles/game.css', 'r', encoding='utf-8') as f:
    css = f.read().replace('\r\n', '\n')

old_css_number_mode = """.ans-btn.ans-btn-number-mode {
  padding: 8px 12px 10px;
}

.ans-giant-number {
  font-family: "Segoe UI", "Arial Rounded MT Bold", sans-serif;
  font-size: clamp(38px, 4.4vw, 54px);
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 3px 0 rgba(255, 255, 255, 0.9), 0 5px 10px rgba(0, 0, 0, 0.12);
  margin-top: 2px;
  letter-spacing: -1px;
}"""

new_css_number_and_quantity = """.ans-btn.ans-btn-number-mode,
.ans-btn.ans-btn-quantity-mode {
  padding: 6px 10px 8px;
  min-height: 140px;
}

/* Chữ số đáp án to rõ ràng nổi bật cho trẻ 5-6 tuổi */
.ans-giant-number {
  font-family: "Segoe UI", "Arial Rounded MT Bold", sans-serif;
  font-size: clamp(44px, 5.2vw, 58px) !important;
  font-weight: 900 !important;
  line-height: 1 !important;
  color: #1e293b;
  text-shadow: 0 3px 0 #ffffff, 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 1px;
  letter-spacing: -1px;
}

/* Khay hình ảnh số lượng trong đáp án (Vd 5 quả cam) */
.ans-quantity-body,
.ans-number-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
}

.ans-quantity-tray {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 170px;
  min-height: 34px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.95);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.ans-quantity-mini-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.18));
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ans-btn:hover .ans-quantity-mini-img {
  transform: scale(1.18);
}

.ans-quantity-tray.count-1 .ans-quantity-mini-img,
.ans-quantity-tray.count-2 .ans-quantity-mini-img,
.ans-quantity-tray.count-3 .ans-quantity-mini-img {
  width: 32px;
  height: 32px;
}

.ans-quantity-tray.count-6 .ans-quantity-mini-img,
.ans-quantity-tray.count-7 .ans-quantity-mini-img,
.ans-quantity-tray.count-8 .ans-quantity-mini-img,
.ans-quantity-tray.count-9 .ans-quantity-mini-img,
.ans-quantity-tray.count-10 .ans-quantity-mini-img {
  width: 21px;
  height: 21px;
  gap: 2px;
}

.ans-quantity-caption {
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #334155;
  text-align: center;
  margin-top: 3px;
  line-height: 1.2;
}

.ans-counting-dots {
  font-size: 16px;
  letter-spacing: 2px;
  margin-top: 2px;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
}

.ans-text {
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: clamp(20px, 2.2vw, 26px) !important;
  font-weight: 800 !important;
  line-height: 1.25 !important;
  text-align: center;
}

.math-card-mini-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.18));
  margin: 1px;
}

.math-card-items-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
  margin: 2px 0;
  max-width: 140px;
}"""

assert old_css_number_mode in css, "old_css_number_mode not found in game.css"
css = css.replace(old_css_number_mode, new_css_number_and_quantity, 1)

with open('src/styles/game.css', 'w', encoding='utf-8') as f:
    f.write(css)
print("Updated game.css successfully!")
