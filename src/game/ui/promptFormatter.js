/**
 * Prompt Formatter for Preschool Kids RPG (5-6 Tuổi)
 * Định dạng câu hỏi đa giác quan: Tranh minh họa 3D, Học liệu đếm số, Ghép bóng, Quy luật hình ảnh, So sánh trực quan.
 * Hạn chế dùng chữ, tập trung vào hình ảnh trực quan và chữ số to rõ ràng.
 */

export const SHAPE_IMAGE_MAP = {
  // Hình học (Shapes)
  'hình tam giác': '/assets/edu/shapes/shape_triangle.png',
  'tam giác': '/assets/edu/shapes/shape_triangle.png',
  'hình tròn': '/assets/edu/shapes/shape_circle.png',
  'tròn': '/assets/edu/shapes/shape_circle.png',
  'hình vuông': '/assets/edu/shapes/shape_square.png',
  'vuông': '/assets/edu/shapes/shape_square.png',
  'hình chữ nhật': '/assets/edu/shapes/shape_rectangle.png',
  'chữ nhật': '/assets/edu/shapes/shape_rectangle.png',
  'ngôi sao': '/assets/edu/shapes/shape_star.png',
  'hình ngôi sao': '/assets/edu/shapes/shape_star.png',
  'trái tim': '/assets/edu/shapes/shape_heart.png',
  'hình trái tim': '/assets/edu/shapes/shape_heart.png',

  // Màu sắc (Colors)
  'màu vàng': '/assets/edu/colors/color_yellow.png',
  'vàng': '/assets/edu/colors/color_yellow.png',
  'vàng chanh': '/assets/edu/colors/color_yellow.png',
  'màu đỏ': '/assets/edu/colors/color_red.png',
  'đỏ': '/assets/edu/colors/color_red.png',
  'đỏ tươi': '/assets/edu/colors/color_red.png',
  'màu xanh biển': '/assets/edu/colors/color_blue.png',
  'xanh biển': '/assets/edu/colors/color_blue.png',
  'xanh dương': '/assets/edu/colors/color_blue.png',
  'màu xanh lá': '/assets/edu/colors/color_green.png',
  'màu xanh lá cây': '/assets/edu/colors/color_green.png',
  'xanh lá': '/assets/edu/colors/color_green.png',
  'xanh lá cây': '/assets/edu/colors/color_green.png',
  'màu cam': '/assets/edu/colors/color_orange.png',
  'cam': '/assets/edu/colors/color_orange.png',
  'màu hồng': '/assets/edu/colors/color_pink.png',
  'hồng': '/assets/edu/colors/color_pink.png',
  'màu tím': '/assets/edu/colors/color_purple.png',
  'tím': '/assets/edu/colors/color_purple.png',
  'màu đen': '/assets/edu/colors/color_black.png',
  'đen': '/assets/edu/colors/color_black.png',

  // Trái cây (Fruits)
  'dưa hấu': '/assets/edu/fruits/fruit_watermelon.png',
  'quả dưa hấu': '/assets/edu/fruits/fruit_watermelon.png',
  'miếng dưa hấu': '/assets/edu/fruits/fruit_watermelon.png',
  'quả táo': '/assets/edu/fruits/fruit_apple.png',
  'táo': '/assets/edu/fruits/fruit_apple.png',
  'quả chuối': '/assets/edu/fruits/fruit_banana.png',
  'chuối': '/assets/edu/fruits/fruit_banana.png',
  'quả dâu tây': '/assets/edu/fruits/fruit_strawberry.png',
  'dâu tây': '/assets/edu/fruits/fruit_strawberry.png',
  'quả cam': '/assets/edu/fruits/fruit_orange.png',

  // Động vật (Animals)
  'chú gấu': '/assets/edu/animals/anim_bear.png',
  'bác gấu': '/assets/edu/animals/anim_bear.png',
  'bé thỏ': '/assets/edu/animals/anim_bunny.png',
  'thỏ': '/assets/edu/animals/anim_bunny.png',
  'chú mèo': '/assets/edu/animals/anim_cat.png',
  'mèo': '/assets/edu/animals/anim_cat.png',
  'cún': '/assets/edu/animals/anim_dog.png',
  'sư tử': '/assets/edu/animals/anim_lion.png',
  'chú sư tử': '/assets/edu/animals/anim_lion.png',
  'voi': '/assets/edu/animals/anim_elephant.png',
  'chú voi': '/assets/edu/animals/anim_elephant.png',
  'chú voi con': '/assets/edu/animals/anim_elephant.png',
  'hươu cao cổ': '/assets/edu/animals/anim_giraffe.png',
  'chú hươu': '/assets/edu/animals/anim_giraffe.png',
  'khỉ': '/assets/edu/animals/anim_monkey.png',
  'chú khỉ': '/assets/edu/animals/anim_monkey.png',
  'chú khỉ con': '/assets/edu/animals/anim_monkey.png',
  'máy bay': '/assets/edu/toys/toy_plane.png',
  'thuyền buồm': '/assets/edu/toys/toy_boat.png',
  'xe ô tô': '/assets/edu/toys/toy_car.png',
  'chó': '/assets/edu/animals/anim_dog.png',
  'vịt': '/assets/edu/animals/anim_duck.png',
  'ếch': '/assets/edu/animals/anim_frog.png',
  'chim cánh cụt': '/assets/edu/animals/anim_penguin.png',
  'rùa': '/assets/edu/animals/anim_turtle.png',
  'cua': '/assets/edu/animals/anim_crab.png',
  'cá voi': '/assets/edu/animals/anim_whale.png'
};


export const ITEM_IMAGE_MAP = {
  // Hoa & Cây cỏ (Flowers & Plants)
  'bông hoa phát sáng': '/assets/edu/flower_sakura.svg',
  'bông hoa': '/assets/edu/flower_sakura.svg',
  'hoa phát sáng': '/assets/edu/flower_sakura.svg',
  'hoa': '/assets/edu/flower_sakura.svg',
  'bông': '/assets/edu/flower_sakura.svg',
  '🌸': '/assets/edu/flower_sakura.svg',

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
  'cà rốt': '/assets/edu/fruit_carrot.svg',

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

export function matchKeywordInText(text, keyword) {
  if (!text || !keyword) return false;
  const kw = keyword.trim().toLowerCase();
  const txt = text.toLowerCase();
  if (/[^\w\s\u00C0-\u1EF9]/i.test(kw)) {
    return txt.includes(kw);
  }
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp('(^|[^a-z0-9à-ỹ_])' + escaped + '([^a-z0-9à-ỹ_]|$)', 'i');
  return regex.test(txt);
}

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
  const sortedKeys = Object.keys(ITEM_IMAGE_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (matchKeywordInText(text, key)) {
      return ITEM_IMAGE_MAP[key];
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

  const questionImg = question ? resolveQuestionItemImage(question) : null;
  const choiceLower = clean.toLowerCase();

  // 1. NGUYÊN TẮC VÀNG: Nếu câu hỏi đã xác định học liệu minh họa (questionImg),
  // toàn bộ các đáp án số lượng ("3 bông", "4 con", "5 quả" hay số trần "3", "5")
  // BẮT BUỘC ĐỒNG BỘ 100% VỚI HỌC LIỆU CÂU HỎI (Hỏi hoa -> vẽ hoa, Hỏi cam -> vẽ cam, không lẫn lộn!)
  if (questionImg) {
    return {
      count,
      itemImg: questionImg,
      isPureNumber: /^\d+$/.test(clean)
    };
  }

  // 2. Nếu câu hỏi chưa có học liệu xác định, tìm hình từ chính text đáp án
  let itemImg = null;
  const sortedKeys = Object.keys(ITEM_IMAGE_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (matchKeywordInText(choiceLower, key)) {
      itemImg = ITEM_IMAGE_MAP[key];
      break;
    }
  }

  return {
    count,
    itemImg: itemImg || null,
    isPureNumber: /^\d+$/.test(clean)
  };
}

export function resolveChoiceImage(choiceText) {
  if (!choiceText || typeof choiceText !== 'string') return null;
  const clean = choiceText.toLowerCase().trim();
  for (const [key, url] of Object.entries(SHAPE_IMAGE_MAP)) {
    if (clean === key || clean.startsWith(key) || clean.includes(key)) {
      return url;
    }
  }
  return null;
}

const FRUIT_EMOJI_MAP = {
  'cam': '🍊',
  'táo': '🍎',
  'chuối': '🍌',
  'dâu': '🍓',
  'cà rốt': '🥕',
  'dưa hấu': '🍉',
  'kẹo': '🍬',
  'bông hoa': '🌸',
  'bông': '🌸',
  'hoa': '🌸',
  'sen đá': '🌺',
  'sao': '⭐',
  'đá': '💎',
  'cua': '🦀',
  'rùa': '🐢',
  'cá': '🐟',
  'bóng': '🎈',
  'mèo': '🐱',
  'cún': '🐶',
  'chó': '🐶',
  'thỏ': '🐰',
  'gấu': '🐻',
  'vịt': '🦆',
  'ếch': '🐸',
  'chim': '🐧',
  'ong': '🐝',
  'bướm': '🦋',
  'ô tô': '🚗',
  'máy bay': '✈️',
  'thuyền': '⛵'
};

function inferEmojiFromLabel(label = '') {
  const lower = label.toLowerCase();
  for (const [key, emoji] of Object.entries(FRUIT_EMOJI_MAP)) {
    if (matchKeywordInText(lower, key)) return emoji;
  }
  return '🌟';
}

export function escapeHtml(str = '') {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Phân tích và tạo giao diện HTML trực quan học liệu cho câu hỏi
 * @param {Object|string} promptOrQuestion
 */
export function formatQuestionPromptHtml(promptOrQuestion) {
  if (!promptOrQuestion) return '';

  const isQuestionObj = typeof promptOrQuestion === 'object' && promptOrQuestion !== null;
  const q = isQuestionObj ? promptOrQuestion : { prompt: String(promptOrQuestion) };
  const promptText = (q.prompt || '').trim();

  // 1b. DẠNG GHÉP HÌNH VỚI NHAU & GHÉP ĐÔI (Jigsaw Matching & Pair Matching)
  if (q.type === 'jigsaw_match' || q.type === 'pair_match' || q.previewImage) {
    const mainImg = q.previewImage || q.image;
    const badgeText = q.visualBadge || (q.type === 'pair_match' ? '🧩 Ghép đôi bạn thân' : '🧩 Tìm mảnh ghép khớp');

    return `
      <div class="prompt-visual-stage prompt-stage-jigsaw">
        <div class="prompt-stage-card">
          <img src="${mainImg}" class="prompt-stage-img bounce-gentle" alt="Mảnh ghép mẫu">
          <div class="prompt-stage-badge">${escapeHtml(badgeText)}</div>
        </div>
        <div class="prompt-title-text visual-compact-title">${escapeHtml(promptText)}</div>
      </div>
    `.trim();
  }

  // 1. DẠNG GHÉP BÓNG (Shadow Matching): Có ảnh chính hoặc bóng đen cần ghép
  if (q.type === 'shadow_match' || q.shadowImage || (q.image && q.skillId === 'shadow_matching')) {
    const mainImg = q.image || q.shadowImage;
    const badgeText = q.visualBadge || (q.isSilhouetteQuestion ? '❓ Tìm hình thật của bóng này' : '❓ Tìm bóng của bạn này');

    return `
      <div class="prompt-visual-stage prompt-stage-shadow">
        <div class="prompt-stage-card">
          <img src="${mainImg}" class="prompt-stage-img bounce-gentle" alt="Học liệu ghép bóng">
          <div class="prompt-stage-badge">${escapeHtml(badgeText)}</div>
        </div>
        <div class="prompt-title-text visual-compact-title">${escapeHtml(promptText)}</div>
      </div>
    `.trim();
  }

  // 2. DẠNG ĐẾM SỐ LƯỢNG HỌC LIỆU 3D (Visual Counting Tray)
  if (q.type === 'counting' && (Array.isArray(q.visualItems) || (q.countItem && q.countNum))) {
    const items = Array.isArray(q.visualItems)
      ? q.visualItems
      : Array(Math.min(q.countNum || 1, 10)).fill(q.countItem);

    return `
      <div class="prompt-visual-stage prompt-stage-counting">
        <div class="prompt-count-tray-grid count-grid-${Math.min(items.length, 10)}">
          ${items.map((imgSrc, i) => `
            <div class="count-item-card" style="animation-delay: ${i * 70}ms">
              <img src="${imgSrc}" class="count-card-img" alt="Học liệu đếm">
              <span class="count-card-dot">${i + 1}</span>
            </div>
          `).join('')}
        </div>
        <div class="prompt-title-text visual-compact-title">${escapeHtml(promptText)}</div>
      </div>
    `.trim();
  }

  // 3. DẠNG QUY LUẬT CHUỖI HÌNH ẢNH (Pattern Recognition)
  if (q.type === 'pattern' && Array.isArray(q.patternItems)) {
    return `
      <div class="prompt-visual-stage prompt-stage-pattern">
        <div class="prompt-pattern-row">
          ${q.patternItems.map((item) => item === '?' ? `
            <div class="pattern-card pattern-card-question">
              <span class="pattern-q-mark">❓</span>
            </div>
          ` : `
            <div class="pattern-card">
              <img src="${item.img || item}" class="pattern-card-img" alt="Quy luật">
            </div>
          `).join('<span class="pattern-arrow">➔</span>')}
        </div>
        <div class="prompt-title-text visual-compact-title">${escapeHtml(promptText)}</div>
      </div>
    `.trim();
  }

  // 4. DẠNG SO SÁNH SỐ LƯỢNG (Comparison Trays: Bên nào nhiều hơn/ít hơn)
  if (q.type === 'comparison' && q.compareTrays) {
    const trayA = q.compareTrays.a || [];
    const trayB = q.compareTrays.b || [];

    return `
      <div class="prompt-visual-stage prompt-stage-compare">
        <div class="compare-trays-wrapper">
          <div class="compare-tray-box tray-a">
            <span class="compare-tray-badge">Khay A</span>
            <div class="compare-tray-items">
              ${trayA.map(src => `<img src="${src}" class="compare-mini-img" alt="A">`).join('')}
            </div>
            <span class="compare-tray-num">${trayA.length}</span>
          </div>
          <div class="compare-vs-badge">VS</div>
          <div class="compare-tray-box tray-b">
            <span class="compare-tray-badge">Khay B</span>
            <div class="compare-tray-items">
              ${trayB.map(src => `<img src="${src}" class="compare-mini-img" alt="B">`).join('')}
            </div>
            <span class="compare-tray-num">${trayB.length}</span>
          </div>
        </div>
        <div class="prompt-title-text visual-compact-title">${escapeHtml(promptText)}</div>
      </div>
    `.trim();
  }

  // 5. CÂU HỎI CÓ HÌNH ẢNH MINH HỌA ĐƠN (Single Hero Image)
  if (q.image && typeof q.image === 'string') {
    return `
      <div class="prompt-visual-stage prompt-stage-hero">
        <div class="prompt-stage-card">
          <img src="${q.image}" class="prompt-stage-img bounce-gentle" alt="Hình học liệu">
        </div>
        <div class="prompt-title-text visual-compact-title">${escapeHtml(promptText)}</div>
      </div>
    `.trim();
  }

  // 6. PHÉP TOÁN HÌNH ẢNH TRỰC QUAN (A + B = ? hoặc A - B = ?)
  const mathRegex = /^(\d+)\s+([^+\-=]+?)\s*([\p{Extended_Pictographic}\s]*)\s*([+\-]|bớt đi)\s*(\d+)\s+([^+\-=]+?)\s*([\p{Extended_Pictographic}\s]*)\s*=\s*(.+)$/u;
  const mathMatch = promptText.match(mathRegex);

  if (mathMatch) {
    const num1 = parseInt(mathMatch[1], 10);
    const label1 = mathMatch[2].trim();
    let icons1 = mathMatch[3].replace(/\s+/g, '');

    const rawOp = mathMatch[4].trim();
    const isSubtraction = rawOp === '-' || rawOp.toLowerCase().includes('bớt');
    const opDisplay = isSubtraction ? '−' : '+';

    const num2 = parseInt(mathMatch[5], 10);
    const label2 = mathMatch[6].trim();
    let icons2 = mathMatch[7].replace(/\s+/g, '');

    const targetLabel = mathMatch[8].replace(/\?+/g, '').replace(/mấy/g, '').trim() || label1;

    const itemImg = resolveQuestionItemImage(q);
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
        </div>
        <span class="math-visual-operator math-op-equal">=</span>
        <div class="math-visual-card math-card-target">
          <span class="math-card-question">?</span>
          <span class="math-card-sublabel">${escapeHtml(targetLabel || 'kết quả')}</span>
        </div>
      </div>
    `.trim();
  }

  // 7. Câu hỏi đếm số lượng có dãy icons: "Bé đếm xem có mấy quả cam? 🍊 🍊 🍊"
  const countRegex = /^(.*?[?:]|\S.*?)\s+((?:[\p{Extended_Pictographic}]\s*){2,})$/u;
  const countMatch = promptText.match(countRegex);
  if (countMatch) {
    const textPart = countMatch[1].trim();
    const iconsPart = countMatch[2].trim().split(/\s+/).filter(Boolean);
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
  }

  // 8. Câu hỏi có emojis nổi bật
  const emojiGroupRegex = /([\p{Extended_Pictographic}](?:\s*[\p{Extended_Pictographic}])*)/gu;
  if (emojiGroupRegex.test(promptText)) {
    const formatted = escapeHtml(promptText).replace(/&lt;|&gt;/g, '').replace(emojiGroupRegex, (match) => {
      return `<span class="prompt-visual-badge">${match}</span>`;
    });
    return `<div class="prompt-title-text">${formatted}</div>`;
  }

  // 9. Mặc định
  return `<div class="prompt-title-text">${escapeHtml(promptText)}</div>`;
}
