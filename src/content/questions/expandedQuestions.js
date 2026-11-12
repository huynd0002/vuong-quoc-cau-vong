/**
 * Bộ Câu Hỏi Mở Rộng Đa Dạng (Map 1 - Map 6)
 * Bổ sung >190 câu hỏi trực quan phong phú: màu sắc, hình khối, bóng hình, đếm số,
 * phép cộng/trừ trực quan, so sánh, quy luật, nối cặp hình ảnh, lật thẻ trí nhớ và sắp xếp.
 */

function mc({ id, skillId, difficulty = 1, prompt, speak, choices, correct = 0, choiceImages, hint }) {
  const q = {
    id,
    skillId,
    difficulty,
    prompt,
    speak: speak || prompt.replace(/[\u{1F300}-\u{1FAFF}✨❓]/gu, '').trim(),
    choices,
    correct,
    hint
  };
  if (Array.isArray(choiceImages)) {
    q.choiceImages = choiceImages;
  }
  return q;
}

function shadowQ({ id, difficulty = 1, prompt, speak, names, keys, basePath = '/assets/edu/animals', correct = 0, hint }) {
  return {
    id,
    skillId: 'shadow_matching',
    difficulty,
    prompt,
    speak,
    image: `${basePath}/${keys[correct]}_shadow.png`,
    choices: names,
    choiceImages: keys.map(k => `${basePath}/${k}.png`),
    correct,
    hint
  };
}

function pairQ({ id, zone, difficulty = 1, prompt, speak, pairs, hint }) {
  return {
    id,
    skillId: 'matching',
    type: 'pair_matching',
    difficulty,
    zone,
    prompt,
    speak,
    leftColumn: pairs.map((p, i) => ({ id: `l${i + 1}`, text: p.leftText, image: p.leftImg })),
    rightColumn: pairs.map((p, i) => ({ id: `r${i + 1}`, text: p.rightText, image: p.rightImg, matchId: `l${i + 1}` })),
    choices: pairs.map(p => p.leftText),
    correct: 0,
    hint
  };
}

function memoryQ({ id, difficulty = 1, prompt, speak, cardsData, extraChoice, hint }) {
  const cards = [];
  cardsData.forEach((item, idx) => {
    cards.push({ id: `c${idx + 1}`, label: item.label, image: item.image });
    cards.push({ id: `c${idx + 1}_b`, label: item.label, image: item.image });
  });
  const choices = cardsData.map(c => c.label.replace(/^[^\p{L}\d]+/u, '').trim());
  while (choices.length < 3) {
    choices.push(extraChoice || 'Ngôi Sao');
  }
  return {
    id,
    skillId: 'memory',
    type: 'memory_match',
    difficulty,
    prompt,
    speak,
    pairs: cardsData.length,
    maxMistakes: Math.max(3, cardsData.length + 1),
    cards,
    choices: [...new Set(choices)].slice(0, 3),
    correct: 0,
    hint
  };
}

function dragQ({ id, difficulty = 1, prompt, speak, slots, items, hint }) {
  return {
    id,
    skillId: 'ordering',
    type: 'drag_sort',
    difficulty,
    prompt,
    speak,
    slots,
    items,
    choices: items.map(it => it.text),
    correct: 0,
    hint
  };
}

const EXPANDED_LIST = [
  // ==========================================================
  // === MAP 1: NHẬN BIẾT MÀU SẮC & HÌNH KHỐI (30 câu mới) ===
  // ==========================================================
  mc({
    id: 'q_map1_colors_x1',
    skillId: 'colors',
    prompt: 'Bầu trời ban ngày nắng đẹp có màu gì vậy bé? ☁️',
    speak: 'Bầu trời ban ngày nắng đẹp có màu gì vậy bé?',
    choices: ['Màu Xanh Biển', 'Màu Đen', 'Màu Cam'],
    choiceImages: ['/assets/edu/colors/color_blue.png', '/assets/edu/colors/color_black.png', '/assets/edu/colors/color_orange.png'],
    hint: 'Ngước lên bầu trời trong xanh là thấy màu xanh biển dịu mát đó bé!'
  }),
  mc({
    id: 'q_map1_colors_x2',
    skillId: 'colors',
    prompt: 'Lá cây xanh non trên cành có màu gì nè bé ơi? 🌿',
    speak: 'Lá cây xanh non trên cành có màu gì nè bé ơi?',
    choices: ['Màu Tím', 'Màu Xanh Lá', 'Màu Hồng'],
    choiceImages: ['/assets/edu/colors/color_purple.png', '/assets/edu/colors/color_green.png', '/assets/edu/colors/color_pink.png'],
    correct: 1,
    hint: 'Lá cây tươi mát luôn mang màu xanh lá cây nhé!'
  }),
  mc({
    id: 'q_map1_colors_x3',
    skillId: 'colors',
    prompt: 'Quả cam chín mọng thơm ngọt có màu gì nhỉ? 🍊',
    speak: 'Quả cam chín mọng thơm ngọt có màu gì nhỉ?',
    choices: ['Màu Cam', 'Màu Xanh Lá', 'Màu Đen'],
    choiceImages: ['/assets/edu/colors/color_orange.png', '/assets/edu/colors/color_green.png', '/assets/edu/colors/color_black.png'],
    hint: 'Tên quả cam cũng là tên màu cam rực rỡ đó bé!'
  }),
  mc({
    id: 'q_map1_colors_x4',
    skillId: 'colors',
    prompt: 'Bông hoa đào mùa xuân dịu dàng có màu gì vậy bé? 🌸',
    speak: 'Bông hoa đào mùa xuân dịu dàng có màu gì vậy bé?',
    choices: ['Màu Đen', 'Màu Xanh Biển', 'Màu Hồng'],
    choiceImages: ['/assets/edu/colors/color_black.png', '/assets/edu/colors/color_blue.png', '/assets/edu/colors/color_pink.png'],
    correct: 2,
    hint: 'Cánh hoa đào phớt màu hồng xinh xắn lắm!'
  }),
  mc({
    id: 'q_map1_colors_x5',
    skillId: 'colors',
    prompt: 'Chùm nho chín ngọt lịm thường có màu gì bé nhỉ? 🍇',
    speak: 'Chùm nho chín ngọt lịm thường có màu gì bé nhỉ?',
    choices: ['Màu Vàng', 'Màu Tím', 'Màu Đỏ'],
    choiceImages: ['/assets/edu/colors/color_yellow.png', '/assets/edu/colors/color_purple.png', '/assets/edu/colors/color_red.png'],
    correct: 1,
    hint: 'Chùm nho tròn xoe mang sắc tím lung linh!'
  }),
  mc({
    id: 'q_map1_colors_x6',
    skillId: 'colors',
    prompt: 'Quả chuối chín thơm ngon có màu gì vậy bé? 🍌',
    speak: 'Quả chuối chín thơm ngon có màu gì vậy bé?',
    choices: ['Màu Vàng', 'Màu Xanh Biển', 'Màu Tím'],
    choiceImages: ['/assets/edu/colors/color_yellow.png', '/assets/edu/colors/color_blue.png', '/assets/edu/colors/color_purple.png'],
    hint: 'Vỏ chuối chín có màu vàng tươi như nắng mai!'
  }),
  mc({
    id: 'q_map1_colors_x7',
    skillId: 'colors',
    prompt: 'Áo của chú bọ rùa có màu đỏ, còn chấm tròn trên lưng màu gì? 🐞',
    speak: 'Chấm tròn trên lưng chú bọ rùa thường có màu gì?',
    choices: ['Màu Hồng', 'Màu Đen', 'Màu Vàng'],
    choiceImages: ['/assets/edu/colors/color_pink.png', '/assets/edu/colors/color_black.png', '/assets/edu/colors/color_yellow.png'],
    correct: 1,
    hint: 'Bọ rùa áo đỏ điểm những chấm tròn màu đen thật nổi bật!'
  }),
  mc({
    id: 'q_map1_colors_x8',
    skillId: 'colors',
    prompt: 'Quả dưa hấu bên ngoài vỏ có màu gì vậy bé? 🍉',
    speak: 'Quả dưa hấu bên ngoài vỏ có màu gì vậy bé?',
    choices: ['Màu Tím', 'Màu Cam', 'Màu Xanh Lá'],
    choiceImages: ['/assets/edu/colors/color_purple.png', '/assets/edu/colors/color_orange.png', '/assets/edu/colors/color_green.png'],
    correct: 2,
    hint: 'Vỏ ngoài quả dưa hấu có màu xanh lá đậm rất mát mắt!'
  }),
  mc({
    id: 'q_map1_shapes_x1',
    skillId: 'shapes',
    prompt: 'Bánh xe ô tô lăn tròn trên đường có hình gì vậy bé? 🚗',
    speak: 'Bánh xe ô tô lăn tròn trên đường có hình gì vậy bé?',
    choices: ['Hình Tròn', 'Hình Vuông', 'Hình Tam Giác'],
    choiceImages: ['/assets/edu/shapes/shape_circle.png', '/assets/edu/shapes/shape_square.png', '/assets/edu/shapes/shape_triangle.png'],
    hint: 'Bánh xe lăn đều không có góc nhọn là hình tròn đó!'
  }),
  mc({
    id: 'q_map1_shapes_x2',
    skillId: 'shapes',
    prompt: 'Miếng bánh pizza có 3 cạnh nhọn giống hình gì nhất bé ơi? 🍕',
    speak: 'Miếng bánh pizza có ba cạnh giống hình gì nhất?',
    choices: ['Hình Tròn', 'Hình Tam Giác', 'Hình Trái Tim'],
    choiceImages: ['/assets/edu/shapes/shape_circle.png', '/assets/edu/shapes/shape_triangle.png', '/assets/edu/shapes/shape_heart.png'],
    correct: 1,
    hint: 'Hình có 3 cạnh và 3 góc nhọn là hình tam giác nhé!'
  }),
  mc({
    id: 'q_map1_shapes_x3',
    skillId: 'shapes',
    prompt: 'Khung cửa sổ có 4 cạnh bằng nhau là hình gì bé nhỉ? 🪟',
    speak: 'Khung cửa sổ có bốn cạnh bằng nhau là hình gì bé nhỉ?',
    choices: ['Hình Ngôi Sao', 'Hình Tròn', 'Hình Vuông'],
    choiceImages: ['/assets/edu/shapes/shape_star.png', '/assets/edu/shapes/shape_circle.png', '/assets/edu/shapes/shape_square.png'],
    correct: 2,
    hint: 'Hình có 4 cạnh dài bằng nhau tăm tắp là hình vuông!'
  }),
  mc({
    id: 'q_map1_shapes_x4',
    skillId: 'shapes',
    prompt: 'Cánh cửa ra vào cao ráo có 2 cạnh dài và 2 cạnh ngắn là hình gì? 🚪',
    speak: 'Cánh cửa ra vào có hai cạnh dài và hai cạnh ngắn là hình gì?',
    choices: ['Hình Chữ Nhật', 'Hình Tam Giác', 'Hình Tròn'],
    choiceImages: ['/assets/edu/shapes/shape_rectangle.png', '/assets/edu/shapes/shape_triangle.png', '/assets/edu/shapes/shape_circle.png'],
    hint: 'Hình có 2 cạnh dài song song và 2 cạnh ngắn là hình chữ nhật!'
  }),
  mc({
    id: 'q_map1_shapes_x5',
    skillId: 'shapes',
    prompt: 'Vật lấp lánh trên bầu trời đêm 5 cánh xinh đẹp là hình gì? ⭐',
    speak: 'Hình lấp lánh năm cánh trên bầu trời là hình gì?',
    choices: ['Hình Trái Tim', 'Hình Ngôi Sao', 'Hình Vuông'],
    choiceImages: ['/assets/edu/shapes/shape_heart.png', '/assets/edu/shapes/shape_star.png', '/assets/edu/shapes/shape_square.png'],
    correct: 1,
    hint: 'Ngôi sao vàng năm cánh tỏa sáng lung linh!'
  }),
  mc({
    id: 'q_map1_shapes_x6',
    skillId: 'shapes',
    prompt: 'Biểu tượng yêu thương dành tặng ông bà bố mẹ là hình gì bé nhỉ? 💖',
    speak: 'Biểu tượng yêu thương dành tặng gia đình là hình gì?',
    choices: ['Hình Trái Tim', 'Hình Chữ Nhật', 'Hình Tam Giác'],
    choiceImages: ['/assets/edu/shapes/shape_heart.png', '/assets/edu/shapes/shape_rectangle.png', '/assets/edu/shapes/shape_triangle.png'],
    hint: 'Hình trái tim ấm áp tượng trưng cho tình yêu thương!'
  }),
  mc({
    id: 'q_map1_shapes_x7',
    skillId: 'shapes',
    prompt: 'Mái nhà nhọn chữ A che nắng che mưa thường có hình gì? 🏠',
    speak: 'Mái nhà nhọn thường có hình gì bé ơi?',
    choices: ['Hình Tròn', 'Hình Vuông', 'Hình Tam Giác'],
    choiceImages: ['/assets/edu/shapes/shape_circle.png', '/assets/edu/shapes/shape_square.png', '/assets/edu/shapes/shape_triangle.png'],
    correct: 2,
    hint: 'Mái nhà chóp nhọn có 3 cạnh là hình tam giác đó bé!'
  }),
  mc({
    id: 'q_map1_shapes_x8',
    skillId: 'shapes',
    prompt: 'Trang vở tập tô ngay ngắn trên bàn học có hình gì vậy bé? 📓',
    speak: 'Trang vở tập tô trên bàn học có hình gì vậy bé?',
    choices: ['Hình Tròn', 'Hình Chữ Nhật', 'Hình Ngôi Sao'],
    choiceImages: ['/assets/edu/shapes/shape_circle.png', '/assets/edu/shapes/shape_rectangle.png', '/assets/edu/shapes/shape_star.png'],
    correct: 1,
    hint: 'Quyển vở dài hơn bề ngang nên là hình chữ nhật nha!'
  }),
  shadowQ({
    id: 'q_map1_shadow_x1',
    prompt: '🕵️ Bóng đen oai vệ có bờm lông quanh đầu này là bạn thú nào thế bé? 🦁',
    speak: 'Bóng đen oai vệ có bờm lông này là bạn thú nào?',
    names: ['Chú Sư Tử', 'Chú Voi', 'Chú Thỏ'],
    keys: ['anim_lion', 'anim_elephant', 'anim_bunny'],
    correct: 0,
    hint: 'Bạn nào có chiếc bờm xù quanh đầu trông thật oai phong nào!'
  }),
  shadowQ({
    id: 'q_map1_shadow_x2',
    prompt: '🕵️ Bóng đen có chiếc vòi dài thật ngộ nghĩnh là bạn nào đây? 🐘',
    speak: 'Bóng đen có chiếc vòi dài là bạn nào đây?',
    names: ['Chú Cún', 'Chú Voi Con', 'Chú Ong'],
    keys: ['anim_dog', 'anim_elephant', 'anim_bee'],
    correct: 1,
    hint: 'Bạn Voi có cái vòi cong dài và đôi tai to đó bé!'
  }),
  shadowQ({
    id: 'q_map1_shadow_x3',
    prompt: '🕵️ Bóng đen có đôi cánh xòe rộng mềm mại là bạn nào nhỉ? 🦋',
    speak: 'Bóng đen có đôi cánh xòe rộng là bạn nào nhỉ?',
    names: ['Chú Khỉ', 'Bạn Bướm Xinh', 'Chú Gấu'],
    keys: ['anim_monkey', 'anim_butterfly', 'anim_bear'],
    correct: 1,
    hint: 'Đôi cánh xòe đối xứng hai bên chính là bạn Bướm xinh!'
  }),
  shadowQ({
    id: 'q_map1_shadow_x4',
    basePath: '/assets/edu/toys',
    prompt: '🕵️ Bóng đen chiếc xe 4 bánh đáng yêu này là đồ chơi nào bé ơi? 🚗',
    speak: 'Bóng đen chiếc xe bốn bánh là đồ chơi nào bé ơi?',
    names: ['Ô Tô Đồ Chơi', 'Quả Bóng', 'Gấu Bông'],
    keys: ['toy_car', 'toy_ball', 'toy_teddy'],
    correct: 0,
    hint: 'Bé nhìn 4 bánh xe phía dưới sẽ nhận ra chiếc ô tô ngay!'
  }),
  shadowQ({
    id: 'q_map1_shadow_x5',
    basePath: '/assets/edu/toys',
    prompt: '🕵️ Bóng đen của bạn thú bông tai tròn mềm mại là món nào thế? 🧸',
    speak: 'Bóng đen bạn thú bông tai tròn mềm mại là món nào?',
    names: ['Cái Ô', 'Gấu Bông Teddy', 'Máy Bay'],
    keys: ['toy_umbrella', 'toy_teddy', 'toy_plane'],
    correct: 1,
    hint: 'Hai tai tròn xinh và dáng ngồi đáng yêu là bạn Gấu bông!'
  }),
  shadowQ({
    id: 'q_map1_shadow_x6',
    prompt: '🕵️ Bóng đen chiếc mai tròn của bạn chậm chạp mà chăm chỉ là ai? 🐢',
    speak: 'Bóng đen có chiếc mai tròn là bạn vật nào thế?',
    names: ['Chú Vịt', 'Chú Rùa Con', 'Mèo Con'],
    keys: ['anim_duck', 'anim_turtle', 'anim_cat'],
    correct: 1,
    hint: 'Bạn nào luôn cõng chiếc mai tròn vững chắc trên lưng nè?'
  }),
  pairQ({
    id: 'q_map1_pair_x1',
    zone: 'zone1',
    prompt: '🔗 Bé hãy chạm nối từng hình khối giống hệt nhau nhé! 🔷',
    speak: 'Bé hãy chạm nối các hình khối giống nhau nhé!',
    pairs: [
      { leftText: 'Hình Tròn', leftImg: '/assets/edu/shapes/shape_circle.png', rightText: 'Hình Tròn', rightImg: '/assets/edu/shapes/shape_circle.png' },
      { leftText: 'Ngôi Sao', leftImg: '/assets/edu/shapes/shape_star.png', rightText: 'Ngôi Sao', rightImg: '/assets/edu/shapes/shape_star.png' },
      { leftText: 'Tam Giác', leftImg: '/assets/edu/shapes/shape_triangle.png', rightText: 'Tam Giác', rightImg: '/assets/edu/shapes/shape_triangle.png' }
    ],
    hint: 'Nối hình tròn với tròn, ngôi sao với ngôi sao, tam giác với tam giác!'
  }),
  pairQ({
    id: 'q_map1_pair_x2',
    zone: 'zone1',
    prompt: '🔗 Bé nối mỗi màu sắc với khung màu tương ứng nhé! 🎨',
    speak: 'Bé nối hai ô màu giống hệt nhau nhé!',
    pairs: [
      { leftText: 'Đỏ', leftImg: '/assets/edu/colors/color_red.png', rightText: 'Đỏ', rightImg: '/assets/edu/colors/color_red.png' },
      { leftText: 'Vàng', leftImg: '/assets/edu/colors/color_yellow.png', rightText: 'Vàng', rightImg: '/assets/edu/colors/color_yellow.png' },
      { leftText: 'Xanh Lá', leftImg: '/assets/edu/colors/color_green.png', rightText: 'Xanh Lá', rightImg: '/assets/edu/colors/color_green.png' }
    ],
    hint: 'Chọn ô màu bên trái rồi chạm vào ô màu y hệt bên phải nha!'
  }),
  pairQ({
    id: 'q_map1_pair_x3',
    zone: 'zone1',
    prompt: '🔗 Bé nối đồ chơi với chiếc bóng đúng của món đó nhé! 🧸',
    speak: 'Bé nối đồ chơi với chiếc bóng đúng của món đó nhé!',
    pairs: [
      { leftText: 'Ô Tô', leftImg: '/assets/edu/toys/toy_car.png', rightText: 'Bóng Ô Tô', rightImg: '/assets/edu/toys/toy_car_shadow.png' },
      { leftText: 'Bóng Bay', leftImg: '/assets/edu/toys/toy_balloon.png', rightText: 'Bóng Bay', rightImg: '/assets/edu/toys/toy_balloon_shadow.png' },
      { leftText: 'Cái Trống', leftImg: '/assets/edu/toys/toy_drum.png', rightText: 'Bóng Trống', rightImg: '/assets/edu/toys/toy_drum_shadow.png' }
    ],
    hint: 'Quan sát đường viền đặc trưng của ô tô, bóng bay và chiếc trống nhé!'
  }),
  pairQ({
    id: 'q_map1_pair_x4',
    zone: 'zone1',
    prompt: '🔗 Bé nối nửa mảnh ghép hoa quả còn thiếu cho tròn vị nha! 🍉',
    speak: 'Bé hãy nối những mảnh ghép hoa quả cùng loại với nhau!',
    pairs: [
      { leftText: 'Quả Táo', leftImg: '/assets/edu/fruits/fruit_apple.png', rightText: 'Nửa Táo', rightImg: '/assets/edu/puzzles/jigsaw_apple_right.png' },
      { leftText: 'Quả Cam', leftImg: '/assets/edu/fruits/fruit_orange.png', rightText: 'Nửa Cam', rightImg: '/assets/edu/puzzles/jigsaw_orange_right.png' },
      { leftText: 'Dưa Hấu', leftImg: '/assets/edu/fruits/fruit_watermelon.png', rightText: 'Nửa Dưa', rightImg: '/assets/edu/puzzles/jigsaw_watermelon_right.png' }
    ],
    hint: 'Ghép quả táo với miếng táo, quả cam với miếng cam và dưa hấu với dưa hấu!'
  }),
  memoryQ({
    id: 'q_map1_mem_x1',
    prompt: '🃏 Lật tìm 2 cặp đồ chơi giống nhau thật nhanh nhé bé! 🎈',
    speak: 'Lật tìm hai cặp đồ chơi giống nhau nhé bé!',
    cardsData: [
      { label: 'Quả Bóng', image: '/assets/edu/toys/toy_ball.png' },
      { label: 'Gấu Bông', image: '/assets/edu/toys/toy_teddy.png' }
    ],
    extraChoice: 'Ô Tô',
    hint: 'Ghi nhớ vị trí Quả Bóng và Bạn Gấu Bông nha!'
  }),
  memoryQ({
    id: 'q_map1_mem_x2',
    prompt: '🃏 Bé lật tìm 3 cặp hình khối rực rỡ nào! ⭐',
    speak: 'Bé lật tìm ba cặp hình khối giống nhau nhé!',
    cardsData: [
      { label: 'Trái Tim', image: '/assets/edu/shapes/shape_heart.png' },
      { label: 'Ngôi Sao', image: '/assets/edu/shapes/shape_star.png' },
      { label: 'Hình Tròn', image: '/assets/edu/shapes/shape_circle.png' }
    ],
    hint: 'Hãy ghi nhớ góc của Hình Tim, Ngôi Sao và Hình Tròn nhé!'
  }),
  dragQ({
    id: 'q_map1_drag_x1',
    prompt: '📦 Xếp 3 bạn thú từ BÉ NHẤT đến TO LỚN NHẤT nhé! 🐘',
    speak: 'Bé hãy xếp ba bạn vật từ bé nhất đến to nhất!',
    slots: ['1. Bé nhất', '2. Vừa', '3. To nhất'],
    items: [
      { id: 'd1', label: '🐝 Ong Vàng', text: 'Ong Vàng', order: 1, image: '/assets/edu/animals/anim_bee.png' },
      { id: 'd2', label: '🐶 Cún Con', text: 'Cún Con', order: 2, image: '/assets/edu/animals/anim_dog.png' },
      { id: 'd3', label: '🐘 Chú Voi', text: 'Chú Voi', order: 3, image: '/assets/edu/animals/anim_elephant.png' }
    ],
    hint: 'Chú Ong bé nhất, rồi đến Cún Con, và Chú Voi to lớn nhất!'
  }),
  dragQ({
    id: 'q_map1_drag_x2',
    prompt: '📦 Xếp phương tiện từ NHỎ đến LỚN NHẤT trên đường đua nhé! ✈️',
    speak: 'Bé xếp đồ chơi từ nhỏ đến lớn nhất nhé!',
    slots: ['1. Nhỏ nhất', '2. Vừa', '3. Lớn nhất'],
    items: [
      { id: 't1', label: '⚽ Quả Bóng', text: 'Quả Bóng', order: 1, image: '/assets/edu/toys/toy_ball.png' },
      { id: 't2', label: '🚗 Ô Tô', text: 'Ô Tô', order: 2, image: '/assets/edu/toys/toy_car.png' },
      { id: 't3', label: '✈️ Máy Bay', text: 'Máy Bay', order: 3, image: '/assets/edu/toys/toy_plane.png' }
    ],
    hint: 'Quả bóng nhỏ xíu xếp đầu, Ô tô ở giữa, Máy bay to nhất cuối hàng!'
  }),

  // ==========================================================
  // === MAP 2: ĐẾM SỐ LƯỢNG PHẠM VI 10 (30 câu mới)       ===
  // ==========================================================
  ...[
    { id: 'q_map2_count_x1', n: 3, emojis: '🦀🦀🦀', noun: 'chú cua', item: 'Chú Cua', opts: ['2 chú cua', '3 chú cua', '4 chú cua'], c: 1 },
    { id: 'q_map2_count_x2', n: 4, emojis: '⛵⛵⛵⛵', noun: 'chiếc thuyền', item: 'Chiếc Thuyền', opts: ['4 chiếc thuyền', '3 chiếc thuyền', '6 chiếc thuyền'], c: 0 },
    { id: 'q_map2_count_x3', n: 5, emojis: '⭐ ⭐ ⭐ ⭐ ⭐', noun: 'ngôi sao biển', item: 'Ngôi Sao', opts: ['3 ngôi sao biển', '5 ngôi sao biển', '7 ngôi sao biển'], c: 1 },
    { id: 'q_map2_count_x4', n: 6, emojis: '🐚🐚🐚🐚🐚🐚', noun: 'vỏ sò ngọc', item: 'Vỏ Sò', opts: ['5 vỏ sò', '6 vỏ sò', '8 vỏ sò'], c: 1 },
    { id: 'q_map2_count_x5', n: 7, emojis: '🐳🐳🐳🐳🐳🐳🐳', noun: 'bạn cá voi', item: 'Cá Voi', opts: ['7 bạn cá voi', '6 bạn cá voi', '9 bạn cá voi'], c: 0 },
    { id: 'q_map2_count_x6', n: 8, emojis: '🐧🐧🐧🐧🐧🐧🐧🐧', noun: 'chim cánh cụt', item: 'Cánh Cụt', opts: ['6 cánh cụt', '9 cánh cụt', '8 cánh cụt'], c: 2 },
    { id: 'q_map2_count_x7', n: 9, emojis: '🍦🍦🍦🍦🍦🍦🍦🍦🍦', noun: 'que kem mát', item: 'Que Kem', opts: ['8 que kem', '9 que kem', '10 que kem'], c: 1 },
    { id: 'q_map2_count_x8', n: 10, emojis: '🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈', noun: 'quả bóng bay', item: 'Bóng Bay', opts: ['10 quả bóng bay', '8 quả bóng bay', '9 quả bóng bay'], c: 0 },
    { id: 'q_map2_count_x9', n: 4, emojis: '🐢🐢🐢🐢', noun: 'bạn rùa biển', item: 'Rùa Biển', opts: ['2 bạn rùa', '4 bạn rùa', '5 bạn rùa'], c: 1 },
    { id: 'q_map2_count_x10', n: 6, emojis: '🦆🦆🦆🦆🦆🦆', noun: 'chú vịt con', item: 'Vịt Con', opts: ['6 chú vịt con', '5 chú vịt con', '7 chú vịt con'], c: 0 },
    { id: 'q_map2_count_x11', n: 7, emojis: '🍓🍓🍓🍓🍓🍓🍓', noun: 'quả dâu tây', item: 'Dâu Tây', opts: ['5 quả dâu', '8 quả dâu', '7 quả dâu'], c: 2 },
    { id: 'q_map2_count_x12', n: 5, emojis: '☂️☂️☂️☂️☂️', noun: 'chiếc dù biển', item: 'Chiếc Dù', opts: ['4 chiếc dù', '5 chiếc dù', '6 chiếc dù'], c: 1 },
    { id: 'q_map2_count_x13', n: 8, emojis: '⚽⚽⚽⚽⚽⚽⚽⚽', noun: 'quả bóng', item: 'Quả Bóng', opts: ['8 quả bóng', '7 quả bóng', '10 quả bóng'], c: 0 },
    { id: 'q_map2_count_x14', n: 9, emojis: '🐠🐠🐠🐠🐠🐠🐠🐠🐠', noun: 'chú cá vàng', item: 'Cá Vàng', opts: ['7 chú cá vàng', '10 chú cá vàng', '9 chú cá vàng'], c: 2 },
    { id: 'q_map2_count_x15', n: 10, emojis: '🌊🐚⭐🐚🌊🐚⭐🐚🌊🐚', noun: 'báu vật biển', item: 'Báu Vật', opts: ['9 báu vật', '10 báu vật', '8 báu vật'], c: 1 },
    { id: 'q_map2_count_x16', n: 3, emojis: '🍉🍉🍉', noun: 'miếng dưa hấu', item: 'Dưa Hấu', opts: ['3 quả dưa hấu', '2 quả dưa hấu', '5 quả dưa hấu'], c: 0 }
  ].map(cfg => mc({
    id: cfg.id,
    skillId: 'counting',
    difficulty: cfg.n > 6 ? 2 : 1,
    prompt: `Bé hãy đếm thật kỹ xem có bao nhiêu ${cfg.noun} dưới đây nhé:\n${cfg.emojis}`,
    speak: `Bé hãy đếm thật kỹ xem có bao nhiêu ${cfg.noun} dưới đây nhé!`,
    choices: cfg.opts,
    correct: cfg.c,
    hint: `Bé đếm lần lượt từng hình từ trái qua phải sẽ ra đúng số ${cfg.n} đấy!`
  })),
  ...[
    { id: 'q_map2_seq_x1', seq: '1 — 2 — ❓ — 4', ans: ['Số 3', 'Số 5', 'Số 6'], c: 0, h: 'Sau số 2 và trước số 4 là số 3 đó bé!' },
    { id: 'q_map2_seq_x2', seq: '4 — 5 — ❓ — 7', ans: ['Số 8', 'Số 6', 'Số 3'], c: 1, h: 'Đếm tiếp 4, 5 rồi đến số 6 nhé!' },
    { id: 'q_map2_seq_x3', seq: '6 — 7 — ❓ — 9', ans: ['Số 8', 'Số 10', 'Số 5'], c: 0, h: 'Sau 7 chính là số 8 nha bé!' },
    { id: 'q_map2_seq_x4', seq: '7 — 8 — 9 — ❓', ans: ['Số 6', 'Số 9', 'Số 10'], c: 2, h: 'Sau số 9 là số tròn chục 10!' },
    { id: 'q_map2_seq_x5', seq: '5 — ❓ — 3 — 2', ans: ['Số 4', 'Số 6', 'Số 1'], c: 0, h: 'Đếm lùi từ 5 xuống 4 rồi 3, 2 nè!' },
    { id: 'q_map2_seq_x6', seq: '10 — 9 — ❓ — 7', ans: ['Số 6', 'Số 8', 'Số 5'], c: 1, h: 'Đếm lùi 10, 9 rồi tới số 8 đó bé!' }
  ].map(s => mc({
    id: s.id,
    skillId: 'counting',
    difficulty: 2,
    prompt: `🔢 Điền số thích hợp vào dấu hỏi chấm nhé bé: ${s.seq}`,
    speak: 'Bé hãy tìm số còn thiếu trong dãy số nhé!',
    choices: s.ans,
    correct: s.c,
    hint: s.h
  })),
  shadowQ({
    id: 'q_map2_shadow_x1',
    prompt: '🕵️ Chiếc bóng chú Cá Voi khổng lồ đang phun nước là hình nào bé nhỉ? 🐳',
    speak: 'Chiếc bóng chú cá voi to lớn là bạn nào đây?',
    names: ['Cá Voi Xanh', 'Chú Cua', 'Rùa Biển'],
    keys: ['anim_whale', 'anim_crab', 'anim_turtle'],
    correct: 0,
    hint: 'Thân hình to tròn và chiếc đuôi cá voi cong lên thật dễ nhận ra!'
  }),
  shadowQ({
    id: 'q_map2_shadow_x2',
    prompt: '🕵️ Bóng đen có hai chiếc càng kẹp ngộ nghĩnh trên cát là ai? 🦀',
    speak: 'Bóng đen có hai chiếc càng kẹp là bạn nào thế?',
    names: ['Chim Cánh Cụt', 'Chú Cua Biển', 'Vịt Vàng'],
    keys: ['anim_penguin', 'anim_crab', 'anim_duck'],
    correct: 1,
    hint: 'Hai chiếc càng kẹp giơ cao lên trời chính là bạn Cua Biển!'
  }),
  shadowQ({
    id: 'q_map2_shadow_x3',
    prompt: '🕵️ Bạn Cánh Cụt đứng thẳng hai tay xòe là bóng nào bé ơi? 🐧',
    speak: 'Bóng đen bạn chim cánh cụt dễ thương là bạn nào?',
    names: ['Rùa Con', 'Cá Voi', 'Chim Cánh Cụt'],
    keys: ['anim_turtle', 'anim_whale', 'anim_penguin'],
    correct: 2,
    hint: 'Dáng đứng thẳng hai cánh nhỏ xòe hai bên là bạn Chim Cánh Cụt!'
  }),
  shadowQ({
    id: 'q_map2_shadow_x4',
    basePath: '/assets/edu/toys',
    prompt: '🕵️ Bóng đen chiếc thuyền buồm lướt sóng ngoài vịnh biển là hình nào? ⛵',
    speak: 'Bóng đen chiếc thuyền buồm là hình nào bé ơi?',
    names: ['Thuyền Buồm', 'Quả Bóng', 'Que Kem'],
    keys: ['toy_boat', 'toy_ball', 'toy_icecream'],
    correct: 0,
    hint: 'Cánh buồm tam giác giương cao là chiếc thuyền buồm nhé!'
  }),
  pairQ({
    id: 'q_map2_pair_x1',
    zone: 'zone2',
    difficulty: 2,
    prompt: '🔗 Nối mỗi bạn sinh vật biển với đúng chiếc bóng của bạn ấy nhé! 🌊',
    speak: 'Nối các bạn sinh vật biển với chiếc bóng đúng nhé!',
    pairs: [
      { leftText: 'Cua Biển', leftImg: '/assets/edu/animals/anim_crab.png', rightText: 'Bóng Cua', rightImg: '/assets/edu/animals/anim_crab_shadow.png' },
      { leftText: 'Cá Voi', leftImg: '/assets/edu/animals/anim_whale.png', rightText: 'Bóng Cá Voi', rightImg: '/assets/edu/animals/anim_whale_shadow.png' },
      { leftText: 'Rùa Biển', leftImg: '/assets/edu/animals/anim_turtle.png', rightText: 'Bóng Rùa', rightImg: '/assets/edu/animals/anim_turtle_shadow.png' }
    ],
    hint: 'Nối Cua với bóng có càng, Cá Voi với bóng đuôi cong, Rùa với bóng có mai tròn!'
  }),
  pairQ({
    id: 'q_map2_pair_x2',
    zone: 'zone2',
    difficulty: 2,
    prompt: '🔗 Ghép các món đồ đi biển giống nhau lại thành cặp nhé bé! 🏖️',
    speak: 'Ghép các đồ dùng đi biển với chiếc bóng đúng nhé!',
    pairs: [
      { leftText: 'Thuyền Buồm', leftImg: '/assets/edu/toys/toy_boat.png', rightText: 'Bóng Thuyền', rightImg: '/assets/edu/toys/toy_boat_shadow.png' },
      { leftText: 'Que Kem', leftImg: '/assets/edu/toys/toy_icecream.png', rightText: 'Bóng Kem', rightImg: '/assets/edu/toys/toy_icecream_shadow.png' },
      { leftText: 'Cái Ô', leftImg: '/assets/edu/toys/toy_umbrella.png', rightText: 'Bóng Ô', rightImg: '/assets/edu/toys/toy_umbrella_shadow.png' }
    ],
    hint: 'Quan sát hình thuyền buồm, ốc quế kem và chiếc ô che nắng nhé!'
  }),
  memoryQ({
    id: 'q_map2_mem_x1',
    difficulty: 2,
    prompt: '🃏 Bé lật tìm 3 cặp bạn biển dễ thương giống nhau nhé! 🐚',
    speak: 'Bé lật tìm ba cặp sinh vật biển giống nhau nhé!',
    cardsData: [
      { label: 'Chú Cua', image: '/assets/edu/animals/anim_crab.png' },
      { label: 'Cá Voi', image: '/assets/edu/animals/anim_whale.png' },
      { label: 'Cánh Cụt', image: '/assets/edu/animals/anim_penguin.png' }
    ],
    hint: 'Nhớ kỹ ô có Cua Đỏ, Cá Voi Xanh và Chim Cánh Cụt nhé!'
  }),
  dragQ({
    id: 'q_map2_drag_x1',
    difficulty: 2,
    prompt: '📦 Xếp đội bạn biển từ BÉ NHẤT đến TO LỚN NHẤT nhé! 🐳',
    speak: 'Bé xếp các bạn ở biển từ bé nhất đến to nhất!',
    slots: ['1. Nhỏ nhất', '2. Vừa', '3. Khổng lồ'],
    items: [
      { id: 's1', label: '🦀 Cua Nhỏ', text: 'Cua Nhỏ', order: 1, image: '/assets/edu/animals/anim_crab.png' },
      { id: 's2', label: '🐧 Cánh Cụt', text: 'Cánh Cụt', order: 2, image: '/assets/edu/animals/anim_penguin.png' },
      { id: 's3', label: '🐳 Cá Voi', text: 'Cá Voi', order: 3, image: '/assets/edu/animals/anim_whale.png' }
    ],
    hint: 'Chú Cua bé nhất, Cánh Cụt ở giữa và Cá Voi khổng lồ to nhất!'
  }),

  // ==========================================================
  // === MAP 3: PHÉP CỘNG TRỰC QUAN PHẠM VI 5 (34 câu mới)  ===
  // ==========================================================
  ...[
    { id: 'q_map3_add_x1', story: '1 quả táo đỏ 🍎 thêm 1 quả táo đỏ 🍎 thành mấy quả táo?', a: 2, unit: 'quả táo', opts: ['2 quả táo', '3 quả táo', '4 quả táo'], c: 0 },
    { id: 'q_map3_add_x2', story: '2 quả cam 🍊🍊 cộng thêm 1 quả cam 🍊 bằng mấy quả cam?', a: 3, unit: 'quả cam', opts: ['2 quả cam', '3 quả cam', '5 quả cam'], c: 1 },
    { id: 'q_map3_add_x3', story: '1 chú ong 🐝 bay cùng 2 chú ong 🐝🐝 thành mấy chú ong?', a: 3, unit: 'chú ong', opts: ['4 chú ong', '2 chú ong', '3 chú ong'], c: 2 },
    { id: 'q_map3_add_x4', story: '2 bạn thỏ 🐰🐰 thêm 2 bạn thỏ 🐰🐰 bằng mấy bạn thỏ?', a: 4, unit: 'bạn thỏ', opts: ['4 bạn thỏ', '3 bạn thỏ', '5 bạn thỏ'], c: 0 },
    { id: 'q_map3_add_x5', story: '3 ngôi sao ⭐ ⭐ ⭐ thêm 1 ngôi sao ⭐ thành mấy ngôi sao?', a: 4, unit: 'ngôi sao', opts: ['5 ngôi sao', '4 ngôi sao', '2 ngôi sao'], c: 1 },
    { id: 'q_map3_add_x6', story: '3 viên ngọc 💎💎💎 thêm 2 viên ngọc 💎💎 được mấy viên ngọc?', a: 5, unit: 'viên ngọc', opts: ['4 viên ngọc', '3 viên ngọc', '5 viên ngọc'], c: 2 },
    { id: 'q_map3_add_x7', story: '2 cây kem 🍦🍦 cộng thêm 3 cây kem 🍦🍦🍦 bằng mấy cây kem?', a: 5, unit: 'cây kem', opts: ['5 cây kem', '4 cây kem', '3 cây kem'], c: 0 },
    { id: 'q_map3_add_x8', story: '4 chiếc kẹo mút 🍭🍭🍭🍭 thêm 1 chiếc kẹo 🍭 bằng mấy chiếc?', a: 5, unit: 'chiếc kẹo', opts: ['3 chiếc kẹo', '5 chiếc kẹo', '4 chiếc kẹo'], c: 1 },
    { id: 'q_map3_add_x9', story: '1 quả bóng ⚽ và 4 quả bóng ⚽⚽⚽⚽ gộp lại có mấy quả bóng?', a: 5, unit: 'quả bóng', opts: ['4 quả bóng', '3 quả bóng', '5 quả bóng'], c: 2 },
    { id: 'q_map3_add_x10', story: '3 bông hoa 🌸🌸🌸 nở thêm 0 bông nào nữa, vẫn còn mấy bông?', a: 3, unit: 'bông hoa', opts: ['3 bông hoa', '4 bông hoa', '1 bông hoa'], c: 0 },
    { id: 'q_map3_add_x11', story: '1 chiếc ô tô 🚗 thêm 3 chiếc ô tô 🚗🚗🚗 thành mấy chiếc?', a: 4, unit: 'chiếc ô tô', opts: ['5 chiếc ô tô', '4 chiếc ô tô', '3 chiếc ô tô'], c: 1 },
    { id: 'q_map3_add_x12', story: '2 quả dâu 🍓🍓 thêm 2 quả dâu 🍓🍓 nữa là mấy quả dâu?', a: 4, unit: 'quả dâu', opts: ['3 quả dâu', '5 quả dâu', '4 quả dâu'], c: 2 },
    { id: 'q_map3_add_x13', story: '3 chú vịt 🦆🦆🦆 bơi cùng 2 chú vịt 🦆🦆 là mấy chú vịt?', a: 5, unit: 'chú vịt', opts: ['5 chú vịt', '4 chú vịt', '2 chú vịt'], c: 0 },
    { id: 'q_map3_add_x14', story: '2 miếng dưa hấu 🍉🍉 + 1 miếng dưa hấu 🍉 = mấy miếng?', a: 3, unit: 'miếng dưa hấu', opts: ['4 miếng dưa hấu', '3 miếng dưa hấu', '5 miếng dưa hấu'], c: 1 },
    { id: 'q_map3_add_x15', story: '1 bạn gấu 🐻 và 1 bạn gấu 🐻 nữa cộng lại là mấy bạn gấu?', a: 2, unit: 'bạn gấu', opts: ['3 bạn gấu', '4 bạn gấu', '2 bạn gấu'], c: 2 },
    { id: 'q_map3_add_x16', story: '4 quả chuối 🍌🍌🍌🍌 cộng 1 quả chuối 🍌 là mấy quả?', a: 5, unit: 'quả chuối', opts: ['5 quả chuối', '3 quả chuối', '4 quả chuối'], c: 0 },
    { id: 'q_map3_add_x17', story: '2 cái bánh 🧁🧁 thêm 1 cái bánh 🧁 cộng 1 cái 🧁 là mấy?', a: 4, unit: 'cái bánh', opts: ['3 cái bánh', '4 cái bánh', '5 cái bánh'], c: 1 },
    { id: 'q_map3_add_x18', story: '0 hạt dẻ cộng thêm 4 hạt dẻ 🌰🌰🌰🌰 bằng mấy hạt dẻ?', a: 4, unit: 'hạt dẻ', opts: ['5 hạt dẻ', '2 hạt dẻ', '4 hạt dẻ'], c: 2 }
  ].map(cfg => mc({
    id: cfg.id,
    skillId: 'addition',
    difficulty: cfg.a >= 5 ? 2 : 1,
    prompt: `➕ ${cfg.story}`,
    speak: cfg.story,
    choices: cfg.opts,
    correct: cfg.c,
    hint: `Bé đếm gộp tất cả ${cfg.unit} ở hai nhóm lại sẽ được ${cfg.a}!`
  })),
  ...[
    { id: 'q_map3_make5_x1', eq: '2 + ❓ = 5', ans: ['3', '2', '4'], c: 0, h: '2 đếm thêm 3 (3, 4, 5) vừa tròn 5!' },
    { id: 'q_map3_make5_x2', eq: '1 + ❓ = 5', ans: ['3', '4', '2'], c: 1, h: '1 cộng thêm 4 bằng 5 nhé bé!' },
    { id: 'q_map3_make5_x3', eq: '4 + ❓ = 5', ans: ['2', '3', '1'], c: 2, h: '4 thêm 1 nữa vừa khít 5!' },
    { id: 'q_map3_make5_x4', eq: '1 + ❓ = 4', ans: ['3', '2', '5'], c: 0, h: '1 thêm 3 (2, 3, 4) bằng 4!' },
    { id: 'q_map3_make5_x5', eq: '2 + ❓ = 4', ans: ['1', '2', '3'], c: 1, h: '2 cộng 2 bằng 4 nè bé!' },
    { id: 'q_map3_make5_x6', eq: '3 + ❓ = 4', ans: ['2', '4', '1'], c: 2, h: '3 thêm 1 bằng 4 nha!' }
  ].map(m => mc({
    id: m.id,
    skillId: 'addition',
    difficulty: 2,
    prompt: `💎 Điền số đúng giúp đèn pha lê sáng rực: ${m.eq}`,
    speak: 'Bé hãy tìm số cộng thêm để phép tính đúng nhé!',
    choices: m.ans,
    correct: m.c,
    hint: m.h
  })),
  shadowQ({
    id: 'q_map3_shadow_x1',
    basePath: '/assets/edu/fruits',
    prompt: '🕵️ Bóng đen quả táo tròn có cuống lá nhỏ là quả nào thế bé? 🍎',
    speak: 'Chiếc bóng quả táo có cuống lá là quả nào thế bé?',
    names: ['Quả Táo', 'Quả Cam', 'Dưa Hấu'],
    keys: ['fruit_apple', 'fruit_orange', 'fruit_watermelon'],
    correct: 0,
    hint: 'Quả có vết lõm nhẹ trên đỉnh và chiếc lá xinh là Quả Táo!'
  }),
  shadowQ({
    id: 'q_map3_shadow_x2',
    basePath: '/assets/edu/toys',
    prompt: '🕵️ Bóng đen chiếc kẹo mút tròn trên cây que xinh xắn là món nào? 🍭',
    speak: 'Bóng đen chiếc kẹo mút trên que là món nào?',
    names: ['Bóng Bay', 'Kẹo Mút Ngọt', 'Ô Tô'],
    keys: ['toy_balloon', 'toy_lollipop', 'toy_car'],
    correct: 1,
    hint: 'Vòng xoắn tròn trên que thẳng chính là Kẹo Mút!'
  }),
  shadowQ({
    id: 'q_map3_shadow_x3',
    prompt: '🕵️ Bóng đen bạn Ong Vàng có đôi cánh nhỏ và râu cong là ai? 🐝',
    speak: 'Bóng đen bạn ong chăm chỉ là bạn nào đây?',
    names: ['Chú Thỏ', 'Chú Gấu', 'Ong Vàng'],
    keys: ['anim_bunny', 'anim_bear', 'anim_bee'],
    correct: 2,
    hint: 'Đôi cánh nhỏ xinh trên lưng là bạn Ong Vàng đó!'
  }),
  shadowQ({
    id: 'q_map3_shadow_x4',
    basePath: '/assets/edu/toys',
    prompt: '🕵️ Bóng đen tháp khối gỗ xếp chồng lên nhau là đồ chơi nào? 🧱',
    speak: 'Bóng đen khối gỗ xếp chồng là món nào bé ơi?',
    names: ['Khối Xếp Hình', 'Quả Bóng', 'Mũ Tiệc'],
    keys: ['toy_blocks', 'toy_ball', 'toy_partyhat'],
    correct: 0,
    hint: 'Những hình khối vuông xếp cạnh nhau là Khối Xếp Hình!'
  }),
  pairQ({
    id: 'q_map3_pair_x1',
    zone: 'zone3',
    difficulty: 2,
    prompt: '🔗 Nối mỗi quả ngọt với chiếc bóng đen đúng của quả đó nhé! 🍎',
    speak: 'Bé nối hoa quả với chiếc bóng đúng nhé!',
    pairs: [
      { leftText: 'Quả Táo', leftImg: '/assets/edu/fruits/fruit_apple.png', rightText: 'Bóng Táo', rightImg: '/assets/edu/fruits/fruit_apple_shadow.png' },
      { leftText: 'Quả Cam', leftImg: '/assets/edu/fruits/fruit_orange.png', rightText: 'Bóng Cam', rightImg: '/assets/edu/fruits/fruit_orange_shadow.png' },
      { leftText: 'Dưa Hấu', leftImg: '/assets/edu/fruits/fruit_watermelon.png', rightText: 'Bóng Dưa', rightImg: '/assets/edu/fruits/fruit_watermelon_shadow.png' }
    ],
    hint: 'Quan sát cuống táo, núm cam và dáng tròn quả dưa hấu nhé!'
  }),
  pairQ({
    id: 'q_map3_pair_x2',
    zone: 'zone3',
    difficulty: 2,
    prompt: '🔗 Ghép các đồ vật pha lê cùng cặp với nhau nhé bé! ✨',
    speak: 'Bé hãy nối các đồ chơi với chiếc bóng tương ứng nhé!',
    pairs: [
      { leftText: 'Máy Bay', leftImg: '/assets/edu/toys/toy_plane.png', rightText: 'Bóng Máy Bay', rightImg: '/assets/edu/toys/toy_plane_shadow.png' },
      { leftText: 'Mũ Tiệc', leftImg: '/assets/edu/toys/toy_partyhat.png', rightText: 'Bóng Mũ', rightImg: '/assets/edu/toys/toy_partyhat_shadow.png' },
      { leftText: 'Khối Gỗ', leftImg: '/assets/edu/toys/toy_blocks.png', rightText: 'Bóng Khối', rightImg: '/assets/edu/toys/toy_blocks_shadow.png' }
    ],
    hint: 'Nối máy bay có cánh, mũ chóp tam giác và bộ khối vuông!'
  }),
  memoryQ({
    id: 'q_map3_mem_x1',
    difficulty: 2,
    prompt: '🃏 Lật tìm 3 cặp trái cây tươi ngon giống nhau nhé bé! 🍓',
    speak: 'Lật tìm ba cặp trái cây giống nhau nhé!',
    cardsData: [
      { label: 'Quả Táo', image: '/assets/edu/fruits/fruit_apple.png' },
      { label: 'Quả Cam', image: '/assets/edu/fruits/fruit_orange.png' },
      { label: 'Quả Chuối', image: '/assets/edu/fruits/fruit_banana.png' }
    ],
    hint: 'Nhớ kỹ ô Táo Đỏ, Cam Vàng và Chuối Ngọt nha!'
  }),
  memoryQ({
    id: 'q_map3_mem_x2',
    difficulty: 2,
    prompt: '🃏 Bé lật tìm 3 cặp đồ dùng bữa tiệc giống nhau nào! 🎉',
    speak: 'Bé lật tìm ba cặp đồ dùng bữa tiệc giống nhau!',
    cardsData: [
      { label: 'Kẹo Mút', image: '/assets/edu/toys/toy_lollipop.png' },
      { label: 'Mũ Tiệc', image: '/assets/edu/toys/toy_partyhat.png' },
      { label: 'Bóng Bay', image: '/assets/edu/toys/toy_balloon.png' }
    ],
    hint: 'Hãy ghi nhớ vị trí Kẹo Mút, Mũ Tiệc và Bóng Bay!'
  }),
  dragQ({
    id: 'q_map3_drag_x1',
    difficulty: 2,
    prompt: '📦 Xếp giỏ trái cây từ QUẢ NHỎ đến QUẢ TO NHẤT nhé! 🍉',
    speak: 'Bé xếp trái cây từ quả nhỏ đến quả to nhất!',
    slots: ['1. Nhỏ nhất', '2. Vừa', '3. To nhất'],
    items: [
      { id: 'f1', label: '🍓 Dâu Tây', text: 'Dâu Tây', order: 1, image: '/assets/edu/fruits/fruit_strawberry.png' },
      { id: 'f2', label: '🍎 Quả Táo', text: 'Quả Táo', order: 2, image: '/assets/edu/fruits/fruit_apple.png' },
      { id: 'f3', label: '🍉 Dưa Hấu', text: 'Dưa Hấu', order: 3, image: '/assets/edu/fruits/fruit_watermelon.png' }
    ],
    hint: 'Dâu Tây bé xíu xếp đầu, Quả Táo ở giữa, Dưa Hấu to nhất!'
  }),
  dragQ({
    id: 'q_map3_drag_x2',
    difficulty: 2,
    prompt: '📦 Xếp 3 đồ chơi phép cộng từ ÍT đến NHIỀU khối nhé! 🧱',
    speak: 'Xếp thứ tự đồ chơi từ nhỏ đến lớn nhé!',
    slots: ['1. Đầu tiên', '2. Tiếp theo', '3. Cuối cùng'],
    items: [
      { id: 'g1', label: '🍭 Kẹo Mút', text: 'Kẹo Mút', order: 1, image: '/assets/edu/toys/toy_lollipop.png' },
      { id: 'g2', label: '🍦 Que Kem', text: 'Que Kem', order: 2, image: '/assets/edu/toys/toy_icecream.png' },
      { id: 'g3', label: '🧸 Gấu Bông', text: 'Gấu Bông', order: 3, image: '/assets/edu/toys/toy_teddy.png' }
    ],
    hint: 'Kẹo Mút nhỏ xinh xếp số 1, Que Kem số 2, Gấu Bông lớn số 3!'
  }),

  // ==========================================================
  // === MAP 4: PHÉP TRỪ TRỰC QUAN 5 ĐẾN 10 (32 câu mới)   ===
  // ==========================================================
  ...[
    { id: 'q_map4_sub_x1', story: 'Có 5 quả táo 🍎🍎🍎🍎🍎, bé ăn hết 2 quả. Hỏi còn lại mấy quả táo?', a: 3, opts: ['3 quả táo', '2 quả táo', '4 quả táo'], c: 0 },
    { id: 'q_map4_sub_x2', story: 'Có 6 quả bóng 🎈🎈🎈🎈🎈🎈, bay mất 2 quả. Còn lại mấy quả?', a: 4, opts: ['5 quả bóng', '4 quả bóng', '3 quả bóng'], c: 1 },
    { id: 'q_map4_sub_x3', story: 'Có 7 ngôi sao ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐, tặng bạn 3 ngôi sao. Còn mấy sao?', a: 4, opts: ['5 ngôi sao', '3 ngôi sao', '4 ngôi sao'], c: 2 },
    { id: 'q_map4_sub_x4', story: 'Có 8 quả cam 🍊🍊🍊🍊🍊🍊🍊🍊, vắt nước 3 quả. Còn mấy quả cam?', a: 5, opts: ['5 quả cam', '6 quả cam', '4 quả cam'], c: 0 },
    { id: 'q_map4_sub_x5', story: 'Có 9 quả dâu 🍓🍓🍓🍓🍓🍓🍓🍓🍓, hái bớt 4 quả. Còn mấy quả dâu?', a: 5, opts: ['4 quả dâu', '5 quả dâu', '6 quả dâu'], c: 1 },
    { id: 'q_map4_sub_x6', story: 'Có 10 bông hoa 🌸, tặng cô giáo 5 bông. Trên cành còn mấy bông?', a: 5, opts: ['4 bông hoa', '6 bông hoa', '5 bông hoa'], c: 2 },
    { id: 'q_map4_sub_x7', story: 'Có 6 que kem 🍦🍦🍦🍦🍦🍦, tan chảy mất 1 que. Còn mấy que kem?', a: 5, opts: ['5 que kem', '4 que kem', '7 que kem'], c: 0 },
    { id: 'q_map4_sub_x8', story: 'Có 7 chú vịt 🦆, lên bờ nghỉ 5 chú. Dưới hồ còn mấy chú vịt?', a: 2, opts: ['3 chú vịt', '2 chú vịt', '4 chú vịt'], c: 1 },
    { id: 'q_map4_sub_x9', story: 'Có 8 quả chuối 🍌, chú khỉ ăn 2 quả. Còn lại mấy quả chuối?', a: 6, opts: ['5 quả chuối', '7 quả chuối', '6 quả chuối'], c: 2 },
    { id: 'q_map4_sub_x10', story: 'Có 9 viên kẹo 🍬, chia cho em 3 viên. Bé còn lại mấy viên kẹo?', a: 6, opts: ['6 viên kẹo', '5 viên kẹo', '7 viên kẹo'], c: 0 },
    { id: 'q_map4_sub_x11', story: 'Có 10 chú ong 🐝, 4 chú bay về tổ. Còn mấy chú ong hút mật?', a: 6, opts: ['7 chú ong', '6 chú ong', '5 chú ong'], c: 1 },
    { id: 'q_map4_sub_x12', story: 'Có 10 chiếc bánh 🍪, gia đình ăn 2 chiếc. Còn mấy chiếc bánh?', a: 8, opts: ['7 chiếc bánh', '9 chiếc bánh', '8 chiếc bánh'], c: 2 },
    { id: 'q_map4_sub_x13', story: 'Có 9 chiếc lá 🍃, gió thổi rơi 2 chiếc. Trên cây còn mấy lá?', a: 7, opts: ['7 chiếc lá', '6 chiếc lá', '8 chiếc lá'], c: 0 },
    { id: 'q_map4_sub_x14', story: 'Có 8 quả bóng ⚽, cho mượn 5 quả. Trong rổ còn mấy quả bóng?', a: 3, opts: ['4 quả bóng', '3 quả bóng', '2 quả bóng'], c: 1 },
    { id: 'q_map4_sub_x15', story: 'Có 6 chú bọ rùa 🐞, bay đi 3 chú. Còn lại mấy chú bọ rùa?', a: 3, opts: ['2 chú bọ rùa', '4 chú bọ rùa', '3 chú bọ rùa'], c: 2 },
    { id: 'q_map4_sub_x16', story: 'Có 7 quả dưa hấu 🍉, đem biếu 1 quả. Trong vườn còn mấy quả?', a: 6, opts: ['6 quả dưa hấu', '5 quả dưa hấu', '8 quả dưa hấu'], c: 0 },
    { id: 'q_map4_sub_x17', story: 'Có 10 cái ô ☂️, cất vào tủ 3 cái. Còn lại mấy cái ô?', a: 7, opts: ['6 cái ô', '7 cái ô', '8 cái ô'], c: 1 },
    { id: 'q_map4_sub_x18', story: 'Có 5 cái trống 🥁, đem đi sửa 1 cái. Còn mấy cái trống gõ nhịp?', a: 4, opts: ['3 cái trống', '5 cái trống', '4 cái trống'], c: 2 }
  ].map(cfg => mc({
    id: cfg.id,
    skillId: 'subtraction',
    difficulty: cfg.a >= 6 ? 2 : 1,
    prompt: `➖ ${cfg.story}`,
    speak: cfg.story,
    choices: cfg.opts,
    correct: cfg.c,
    hint: `Bé đếm bớt đi số vừa lấy ra sẽ còn đúng ${cfg.a} đó!`
  })),
  ...[
    { id: 'q_map4_submiss_x1', eq: '7 - ❓ = 4', ans: ['3', '2', '5'], c: 0, h: '7 bớt đi 3 còn đúng 4 nhé bé!' },
    { id: 'q_map4_submiss_x2', eq: '8 - ❓ = 5', ans: ['4', '3', '2'], c: 1, h: '8 trừ 3 bằng 5 nha!' },
    { id: 'q_map4_submiss_x3', eq: '10 - ❓ = 6', ans: ['5', '3', '4'], c: 2, h: '10 bớt 4 còn 6 đấy bé!' },
    { id: 'q_map4_submiss_x4', eq: '9 - ❓ = 6', ans: ['3', '4', '2'], c: 0, h: '9 trừ 3 bằng 6 nha bé!' },
    { id: 'q_map4_submiss_x5', eq: '6 - ❓ = 2', ans: ['3', '4', '5'], c: 1, h: '6 bớt đi 4 chỉ còn 2!' },
    { id: 'q_map4_submiss_x6', eq: '10 - ❓ = 2', ans: ['7', '6', '8'], c: 2, h: '10 trừ 8 còn lại 2 thôi nè!' }
  ].map(m => mc({
    id: m.id,
    skillId: 'subtraction',
    difficulty: 2,
    prompt: `🏜️ Giải mã bảng đá sa mạc: ${m.eq}`,
    speak: 'Bé tìm số còn thiếu trong phép trừ nhé!',
    choices: m.ans,
    correct: m.c,
    hint: m.h
  })),
  shadowQ({
    id: 'q_map4_shadow_x1',
    basePath: '/assets/edu/toys',
    prompt: '🕵️ Bóng đen chiếc ô xòe rộng che nắng sa mạc là món đồ nào? ☂️',
    speak: 'Bóng đen chiếc ô che nắng là món nào bé nhỉ?',
    names: ['Chiếc Ô', 'Quả Bóng', 'Cái Trống'],
    keys: ['toy_umbrella', 'toy_ball', 'toy_drum'],
    correct: 0,
    hint: 'Vòm tròn xòe trên tay cầm cong là Chiếc Ô che nắng!'
  }),
  shadowQ({
    id: 'q_map4_shadow_x2',
    prompt: '🕵️ Bóng đen chú Khỉ Con nghịch ngợm có chiếc đuôi dài là ai? 🐒',
    speak: 'Bóng đen chú khỉ có chiếc đuôi cong là ai?',
    names: ['Chú Mèo', 'Chú Khỉ Con', 'Chú Ếch'],
    keys: ['anim_cat', 'anim_monkey', 'anim_frog'],
    correct: 1,
    hint: 'Đôi tai to và chiếc đuôi dài uốn lượn là Chú Khỉ Con!'
  }),
  shadowQ({
    id: 'q_map4_shadow_x3',
    prompt: '🕵️ Bóng đen chú Ếch Xanh ngồi xổm bên ốc đảo là ai bé nhỉ? 🐸',
    speak: 'Bóng đen bạn ếch xanh là hình nào thế bé?',
    names: ['Chú Voi', 'Chú Sư Tử', 'Chú Ếch Xanh'],
    keys: ['anim_elephant', 'anim_lion', 'anim_frog'],
    correct: 2,
    hint: 'Hai mắt tròn lồi trên đỉnh đầu là bạn Ếch Xanh đó!'
  }),
  shadowQ({
    id: 'q_map4_shadow_x4',
    basePath: '/assets/edu/toys',
    prompt: '🕵️ Bóng đen chiếc máy bay sải cánh bay cao qua sa mạc là hình nào? ✈️',
    speak: 'Bóng đen chiếc máy bay sải cánh là hình nào?',
    names: ['Máy Bay', 'Thuyền Buồm', 'Gấu Bông'],
    keys: ['toy_plane', 'toy_boat', 'toy_teddy'],
    correct: 0,
    hint: 'Thân dài có hai cánh xòe ngang chính là Máy Bay!'
  }),
  pairQ({
    id: 'q_map4_pair_x1',
    zone: 'zone4',
    difficulty: 2,
    prompt: '🔗 Nối mỗi bạn nhỏ với người bạn thân hay đồ vật hợp cặp nhé! 🥕',
    speak: 'Bé nối các cặp bạn đồng hành ăn ý nhé!',
    pairs: [
      { leftText: 'Chú Cún', leftImg: '/assets/edu/puzzles/pair_dog.png', rightText: 'Xương Ngon', rightImg: '/assets/edu/puzzles/pair_bone.png' },
      { leftText: 'Chảo Bếp', leftImg: '/assets/edu/puzzles/pair_pan.png', rightText: 'Xẻng Xào', rightImg: '/assets/edu/puzzles/pair_spatula.png' },
      { leftText: 'Chú Thỏ', leftImg: '/assets/edu/animals/anim_bunny.png', rightText: 'Cà Rốt', rightImg: '/assets/edu/matching/pair_rabbit_carrot.jpg' }
    ],
    hint: 'Cún thích xương, chảo đi với xẻng bếp, Thỏ thích cà rốt!'
  }),
  pairQ({
    id: 'q_map4_pair_x2',
    zone: 'zone4',
    difficulty: 2,
    prompt: '🔗 Bé nối đúng bạn vật với chiếc bóng trên cát sa mạc nhé! 🐒',
    speak: 'Bé nối các bạn nhỏ với chiếc bóng trên cát nhé!',
    pairs: [
      { leftText: 'Chú Khỉ', leftImg: '/assets/edu/animals/anim_monkey.png', rightText: 'Bóng Khỉ', rightImg: '/assets/edu/animals/anim_monkey_shadow.png' },
      { leftText: 'Sư Tử', leftImg: '/assets/edu/animals/anim_lion.png', rightText: 'Bóng Sư Tử', rightImg: '/assets/edu/animals/anim_lion_shadow.png' },
      { leftText: 'Chú Ếch', leftImg: '/assets/edu/animals/anim_frog.png', rightText: 'Bóng Ếch', rightImg: '/assets/edu/animals/anim_frog_shadow.png' }
    ],
    hint: 'Nhìn kỹ đuôi khỉ, bờm sư tử và dáng ngồi chú ếch nha!'
  }),
  memoryQ({
    id: 'q_map4_mem_x1',
    difficulty: 2,
    prompt: '🃏 Lật tìm 3 cặp đồ chơi sa mạc giống nhau thật nhanh nào! 🎈',
    speak: 'Bé lật tìm ba cặp đồ chơi giống nhau nhé!',
    cardsData: [
      { label: 'Máy Bay', image: '/assets/edu/toys/toy_plane.png' },
      { label: 'Chiếc Ô', image: '/assets/edu/toys/toy_umbrella.png' },
      { label: 'Cái Trống', image: '/assets/edu/toys/toy_drum.png' }
    ],
    hint: 'Nhớ kỹ vị trí Máy Bay, Chiếc Ô và Cái Trống nhé!'
  }),
  dragQ({
    id: 'q_map4_drag_x1',
    difficulty: 2,
    prompt: '📦 Phép trừ đếm ngược: Xếp con vật từ LỚN NHẤT về BÉ NHẤT nhé! 🦁',
    speak: 'Bé xếp bạn thú từ to nhất xuống nhỏ nhất nhé!',
    slots: ['1. To nhất', '2. Vừa', '3. Nhỏ nhất'],
    items: [
      { id: 'r1', label: '🦁 Sư Tử', text: 'Sư Tử', order: 1, image: '/assets/edu/animals/anim_lion.png' },
      { id: 'r2', label: '🐒 Chú Khỉ', text: 'Chú Khỉ', order: 2, image: '/assets/edu/animals/anim_monkey.png' },
      { id: 'r3', label: '🐸 Chú Ếch', text: 'Chú Ếch', order: 3, image: '/assets/edu/animals/anim_frog.png' }
    ],
    hint: 'Sư Tử lớn nhất xếp đầu, Chú Khỉ ở giữa, Chú Ếch nhỏ nhất cuối hàng!'
  }),

  // ==========================================================
  // === MAP 5: SO SÁNH LỚN HƠN - BÉ HƠN - BẰNG (34 câu mới)===
  // ==========================================================
  ...[
    { id: 'q_map5_cmp_x1', p: 'Nhóm bên trái có 5 quả táo 🍎🍎🍎🍎🍎, bên phải có 3 quả táo 🍎🍎🍎. Bên nào NHIỀU hơn?', opts: ['Bên Trái (5 quả)', 'Bên Phải (3 quả)', 'Hai bên bằng nhau'], c: 0, h: '5 nhiều hơn 3 nên bên trái nhiều táo hơn!' },
    { id: 'q_map5_cmp_x2', p: 'Rổ bên trái có 2 quả cam 🍊🍊, rổ bên phải có 6 quả cam 🍊🍊🍊🍊🍊🍊. Rổ nào ÍT hơn?', opts: ['Rổ Phải (6 quả)', 'Rổ Trái (2 quả)', 'Bằng nhau'], c: 1, h: '2 ít hơn 6 nên rổ bên trái ít cam hơn!' },
    { id: 'q_map5_cmp_x3', p: 'Đĩa A có 4 cái bánh 🧁🧁🧁🧁, Đĩa B cũng có 4 cái bánh 🧁🧁🧁🧁. Số bánh hai đĩa thế nào?', opts: ['Đĩa A nhiều hơn', 'Đĩa B nhiều hơn', 'Hai đĩa BẰNG NHAU'], c: 2, h: 'Cùng có 4 cái bánh nên hai đĩa bằng nhau!' },
    { id: 'q_map5_cmp_x4', p: 'Số nào LỚN NHẤT trong các số sau đây: 4, 9, 6?', opts: ['Số 9', 'Số 6', 'Số 4'], c: 0, h: 'Trong 4, 9, 6 thì số 9 đứng lớn nhất!' },
    { id: 'q_map5_cmp_x5', p: 'Số nào BÉ NHẤT trong các số sau đây: 7, 2, 5?', opts: ['Số 7', 'Số 2', 'Số 5'], c: 1, h: 'Trong 7, 2, 5 thì số 2 nhỏ nhất!' },
    { id: 'q_map5_cmp_x6', p: 'Điền dấu đúng vào giữa: 8 ❓ 5', opts: ['Dấu < (Bé hơn)', 'Dấu = (Bằng)', 'Dấu > (Lớn hơn)'], c: 2, h: '8 lớn hơn 5 nên chọn dấu > nhé bé!' },
    { id: 'q_map5_cmp_x7', p: 'Điền dấu đúng vào giữa: 3 ❓ 7', opts: ['Dấu < (Bé hơn)', 'Dấu > (Lớn hơn)', 'Dấu = (Bằng)'], c: 0, h: '3 nhỏ hơn 7 nên chọn dấu < nha!' },
    { id: 'q_map5_cmp_x8', p: 'Điền dấu đúng vào giữa: 6 ❓ 6', opts: ['Dấu > (Lớn hơn)', 'Dấu = (Bằng nhau)', 'Dấu < (Bé hơn)'], c: 1, h: 'Hai số giống hệt nhau nên điền dấu = (bằng nhau)!' },
    { id: 'q_map5_cmp_x9', p: 'Tổ chim trên cây có 7 quả trứng, tổ dưới thấp có 4 quả trứng. Tổ nào có NHIỀU trứng hơn?', opts: ['Tổ dưới (4 trứng)', 'Cả hai bằng nhau', 'Tổ trên (7 trứng)'], c: 2, h: '7 nhiều hơn 4 nên tổ trên cây nhiều trứng hơn!' },
    { id: 'q_map5_cmp_x10', p: 'Bạn Sóc nhặt được 5 hạt dẻ, bạn Thỏ nhặt được 8 hạt dẻ. Bạn nào có ÍT hạt dẻ hơn?', opts: ['Bạn Sóc (5 hạt)', 'Bạn Thỏ (8 hạt)', 'Cả hai bằng nhau'], c: 0, h: '5 ít hơn 8 nên bạn Sóc có ít hạt dẻ hơn bạn Thỏ!' },
    { id: 'q_map5_cmp_x11', p: '9 quả bóng 🎈 và 10 ngôi sao ⭐: Nhóm nào có SỐ LƯỢNG LỚN HƠN?', opts: ['9 quả bóng', '10 ngôi sao', 'Hai nhóm bằng nhau'], c: 1, h: '10 lớn hơn 9 nên nhóm Ngôi Sao nhiều hơn!' },
    { id: 'q_map5_cmp_x12', p: '5 bông hoa 🌸 và 5 chú bướm 🦋: Mỗi bạn bướm đậu 1 bông hoa thì có đủ không?', opts: ['Thiếu bông hoa', 'Thừa bông hoa', 'Vừa ĐỦ BẰNG NHAU'], c: 2, h: '5 hoa và 5 bướm vừa khít bằng nhau luôn bé ơi!' },
    { id: 'q_map5_cmp_x13', p: 'Số nào LỚN HƠN 7 trong các số dưới đây?', opts: ['Số 9', 'Số 5', 'Số 6'], c: 0, h: 'Chỉ có 9 lớn hơn 7 nhé!' },
    { id: 'q_map5_cmp_x14', p: 'Số nào BÉ HƠN 4 trong các số sau?', opts: ['Số 8', 'Số 2', 'Số 6'], c: 1, h: '2 nhỏ hơn 4 trong dãy đếm đó bé!' },
    { id: 'q_map5_cmp_x15', p: 'Phép tính nào có kết quả BẰNG NHAU với 3 + 2?', opts: ['1 + 2', '5 - 1', '4 + 1'], c: 2, h: '3 + 2 = 5 và 4 + 1 cũng bằng 5 luôn!' },
    { id: 'q_map5_cmp_x16', p: 'So sánh: (4 + 2) ❓ 5. Kết quả bên nào lớn hơn?', opts: ['Bên Trái (4 + 2 = 6)', 'Bên Phải (5)', 'Hai bên bằng nhau'], c: 0, h: '4 + 2 = 6 lớn hơn 5 nha bé!' }
  ].map(cfg => mc({
    id: cfg.id,
    skillId: 'comparison',
    difficulty: 2,
    prompt: `⚖️ ${cfg.p}`,
    speak: cfg.p.replace(/[\u{1F300}-\u{1FAFF}❓=><()]/gu, ' '),
    choices: cfg.opts,
    correct: cfg.c,
    hint: cfg.h
  })),
  ...[
    { id: 'q_map5_opp_x1', p: '🦒 Giữa Hươu Cao Cổ và Chú Ếch Con, bạn nào CAO HƠN nhiều?', opts: ['Hươu Cao Cổ', 'Chú Ếch Con', 'Cao bằng nhau'], c: 0, h: 'Hươu cao cổ có chiếc cổ siêu dài vươn tới ngọn cây!' },
    { id: 'q_map5_opp_x2', p: '🐘 Giữa Chú Voi và Chú Ong Vàng, bạn nào NHẸ HƠN?', opts: ['Chú Voi Lớn', 'Chú Ong Vàng', 'Nặng bằng nhau'], c: 1, h: 'Chú Ong bé xíu bay nhẹ nhàng hơn Voi rất nhiều!' },
    { id: 'q_map5_opp_x3', p: '🚂 So sánh Chiếc Ô Tô Đồ Chơi và Quả Bóng Nhỏ, đồ vật nào TO HƠN?', opts: ['Quả Bóng Nhỏ', 'Cả hai bằng nhau', 'Ô Tô Đồ Chơi'], c: 2, h: 'Chiếc Ô Tô to hơn quả bóng nhỏ nhé!' },
    { id: 'q_map5_opp_x4', p: '🌳 Cây cổ thụ cao 10 mét và Bụi hoa thấp 1 mét, cây nào THẤP HƠN?', opts: ['Bụi Hoa Thấp', 'Cây Cổ Thụ', 'Bằng nhau'], c: 0, h: 'Bụi hoa chỉ cao 1 mét nên thấp hơn nhiều!' },
    { id: 'q_map5_opp_x5', p: '📏 Chiếc bút chì mới dài và mẫu tẩy nhỏ ngắn, vật nào DÀI HƠN?', opts: ['Mẫu Tẩy Nhỏ', 'Chiếc Bút Chì', 'Dài bằng nhau'], c: 1, h: 'Chiếc bút chì dài hơn cục tẩy xinh nhiều!' },
    { id: 'q_map5_opp_x6', p: '🍉 Quả Dưa Hấu lớn và Quả Dâu Tây bé xíu, quả nào NẶNG HƠN?', opts: ['Quả Dâu Tây', 'Nặng như nhau', 'Quả Dưa Hấu'], c: 2, h: 'Quả Dưa Hấu to nặng hơn quả dâu rất nhiều!' }
  ].map(cfg => mc({
    id: cfg.id,
    skillId: 'comparison',
    difficulty: 2,
    prompt: cfg.p,
    speak: cfg.p.replace(/[\u{1F300}-\u{1FAFF}]/gu, ''),
    choices: cfg.opts,
    correct: cfg.c,
    hint: cfg.h
  })),
  shadowQ({
    id: 'q_map5_shadow_x1',
    prompt: '🕵️ Chiếc bóng cổ vươn cao chót vót trên đỉnh núi là bạn nào đây? 🦒',
    speak: 'Bóng đen có chiếc cổ vươn cao là bạn nào đây?',
    names: ['Hươu Cao Cổ', 'Chú Cún', 'Chú Thỏ'],
    keys: ['anim_giraffe', 'anim_dog', 'anim_bunny'],
    correct: 0,
    hint: 'Chiếc cổ dài vươn cao nhất chính là bạn Hươu Cao Cổ!'
  }),
  shadowQ({
    id: 'q_map5_shadow_x2',
    prompt: '🕵️ Bóng đen chú Gấu hiền lành đang đứng vẫy tay là bạn nào? 🐻',
    speak: 'Bóng đen chú gấu hiền lành là bạn nào?',
    names: ['Chú Vịt', 'Chú Gấu Nâu', 'Chú Mèo'],
    keys: ['anim_duck', 'anim_bear', 'anim_cat'],
    correct: 1,
    hint: 'Thân hình mũm mĩm tai tròn là chú Gấu Nâu đáng yêu!'
  }),
  shadowQ({
    id: 'q_map5_shadow_x3',
    prompt: '🕵️ Bạn Cún Vàng trung thành có chiếc bóng nào sau đây? 🐶',
    speak: 'Bóng đen bạn cún vàng dễ thương là hình nào?',
    names: ['Chú Sư Tử', 'Bạn Bướm', 'Bé Cún Vàng'],
    keys: ['anim_lion', 'anim_butterfly', 'anim_dog'],
    correct: 2,
    hint: 'Tai cụp xinh xắn và dáng ngồi đáng yêu là Bé Cún Vàng!'
  }),
  shadowQ({
    id: 'q_map5_shadow_x4',
    prompt: '🕵️ Bạn Vịt Vàng có chiếc mỏ xinh là chiếc bóng nào bé nhỉ? 🦆',
    speak: 'Bóng đen bạn vịt có chiếc mỏ xinh là hình nào?',
    names: ['Bé Vịt Vàng', 'Chú Khỉ', 'Chú Rùa'],
    keys: ['anim_duck', 'anim_monkey', 'anim_turtle'],
    correct: 0,
    hint: 'Nhìn chiếc mỏ dẹt đáng yêu phía trước là nhận ra Bé Vịt ngay!'
  }),
  pairQ({
    id: 'q_map5_pair_x1',
    zone: 'zone5',
    difficulty: 2,
    prompt: '🔗 Bé nối mỗi bạn muông thú núi cao với chiếc bóng đúng nha! 🦒',
    speak: 'Bé nối muông thú với đúng chiếc bóng của bạn ấy!',
    pairs: [
      { leftText: 'Hươu Cao Cổ', leftImg: '/assets/edu/animals/anim_giraffe.png', rightText: 'Bóng Hươu', rightImg: '/assets/edu/animals/anim_giraffe_shadow.png' },
      { leftText: 'Ong Vàng', leftImg: '/assets/edu/animals/anim_bee.png', rightText: 'Bóng Ong', rightImg: '/assets/edu/animals/anim_bee_shadow.png' },
      { leftText: 'Bạn Bướm', leftImg: '/assets/edu/animals/anim_butterfly.png', rightText: 'Bóng Bướm', rightImg: '/assets/edu/animals/anim_butterfly_shadow.png' }
    ],
    hint: 'Nối cổ cao với bóng cổ cao, Ong với bóng Ong và Bướm với bóng Bướm!'
  }),
  pairQ({
    id: 'q_map5_pair_x2',
    zone: 'zone5',
    difficulty: 2,
    prompt: '🔗 Nối bạn thú với nơi thân quen trong thiên nhiên núi cao nhé! 🌸',
    speak: 'Nối các bạn với cặp hình ảnh thiên nhiên phù hợp nhé!',
    pairs: [
      { leftText: 'Chú Chim', leftImg: '/assets/edu/matching/pair_bird_nest.jpg', rightText: 'Tổ Chim', rightImg: '/assets/edu/matching/pair_bird_nest.jpg' },
      { leftText: 'Mặt Trời', leftImg: '/assets/edu/matching/pair_sun_flower.jpg', rightText: 'Hướng Dương', rightImg: '/assets/edu/matching/pair_sun_flower.jpg' },
      { leftText: 'Đám Mây', leftImg: '/assets/edu/matching/pair_rain_cloud.jpg', rightText: 'Cơn Mưa', rightImg: '/assets/edu/matching/pair_rain_cloud.jpg' }
    ],
    hint: 'Nối Chim - Tổ, Nắng - Hoa, và Mây - Mưa thật chính xác nhé!'
  }),
  memoryQ({
    id: 'q_map5_mem_x1',
    difficulty: 2,
    prompt: '🃏 Lật tìm 3 cặp bạn thú vùng núi gió hát giống nhau nhé! 🦒',
    speak: 'Lật tìm ba cặp bạn vật trên núi giống nhau nhé!',
    cardsData: [
      { label: 'Hươu Cao Cổ', image: '/assets/edu/animals/anim_giraffe.png' },
      { label: 'Bạn Bướm', image: '/assets/edu/animals/anim_butterfly.png' },
      { label: 'Chú Gấu', image: '/assets/edu/animals/anim_bear.png' }
    ],
    hint: 'Nhớ vị trí Hươu Cao Cổ, Bạn Bướm và Chú Gấu nhé!'
  }),
  memoryQ({
    id: 'q_map5_mem_x2',
    difficulty: 2,
    prompt: '🃏 Bé lật tìm 3 cặp thiên nhiên giống nhau nào! ☀️',
    speak: 'Bé lật tìm ba cặp thiên nhiên giống nhau nhé!',
    cardsData: [
      { label: 'Chú Vịt', image: '/assets/edu/animals/anim_duck.png' },
      { label: 'Chú Ếch', image: '/assets/edu/animals/anim_frog.png' },
      { label: 'Chú Rùa', image: '/assets/edu/animals/anim_turtle.png' }
    ],
    hint: 'Nhớ kỹ ô Vịt Vàng, Ếch Xanh và Rùa Con nha!'
  }),
  dragQ({
    id: 'q_map5_drag_x1',
    difficulty: 2,
    prompt: '📦 So sánh chiều cao: Xếp 3 bạn từ THẤP NHẤT đến CAO NHẤT nhé! 🦒',
    speak: 'Xếp các bạn từ thấp nhất đến cao nhất!',
    slots: ['1. Thấp nhất', '2. Vừa', '3. Cao nhất'],
    items: [
      { id: 'c1', label: '🐢 Rùa Con', text: 'Rùa Con', order: 1, image: '/assets/edu/animals/anim_turtle.png' },
      { id: 'c2', label: '🐶 Cún Con', text: 'Cún Con', order: 2, image: '/assets/edu/animals/anim_dog.png' },
      { id: 'c3', label: '🦒 Hươu Cao Cổ', text: 'Hươu Cao Cổ', order: 3, image: '/assets/edu/animals/anim_giraffe.png' }
    ],
    hint: 'Rùa lùn thấp nhất, Cún cao vừa, Hươu Cao Cổ vươn cao nhất!'
  }),
  dragQ({
    id: 'q_map5_drag_x2',
    difficulty: 2,
    prompt: '📦 Xếp chiều cao từ NHỎ NHẤT tới TO LỚN NHẤT nhé bé! 🦁',
    speak: 'Bé xếp các bạn thú từ nhỏ nhất tới lớn nhất!',
    slots: ['1. Bé xíu', '2. Vừa phải', '3. Lớn nhất'],
    items: [
      { id: 'm1', label: '🐸 Chú Ếch', text: 'Chú Ếch', order: 1, image: '/assets/edu/animals/anim_frog.png' },
      { id: 'm2', label: '🦁 Sư Tử', text: 'Sư Tử', order: 2, image: '/assets/edu/animals/anim_lion.png' },
      { id: 'm3', label: '🐘 Chú Voi', text: 'Chú Voi', order: 3, image: '/assets/edu/animals/anim_elephant.png' }
    ],
    hint: 'Chú Ếch bé xíu số 1, Sư Tử số 2 và Voi to lớn nhất số 3!'
  }),

  // ==========================================================
  // === MAP 6: DÃY QUY LUẬT & ÔN TẬP TỔNG HỢP (36 câu mới) ===
  // ==========================================================
  ...[
    { id: 'q_map6_pat_x1', p: 'Tìm hình tiếp theo trong dãy quy luật:\n🔴 🔵 🔴 🔵 🔴 ❓', opts: ['🔵 Hình Tròn Xanh', '🔴 Hình Tròn Đỏ', '🟡 Hình Tròn Vàng'], c: 0, h: 'Quy luật xen kẽ Đỏ - Xanh - Đỏ - Xanh, sau Đỏ là Xanh Biển!' },
    { id: 'q_map6_pat_x2', p: 'Hoàn thành dãy quy luật lấp lánh:\n⭐ 🌙 ⭐ 🌙 ⭐ ❓', opts: ['⭐ Ngôi Sao', '🌙 Mặt Trăng', '☀️ Mặt Trời'], c: 1, h: 'Sao rồi Trăng rồi Sao rồi Trăng, tiếp theo là Mặt Trăng!' },
    { id: 'q_map6_pat_x3', p: 'Tìm hình tiếp theo trong chuỗi:\n🔺 🔺 🟦 🔺 🔺 ❓', opts: ['🔺 Tam Giác Đỏ', '🟡 Tròn Vàng', '🟦 Vuông Xanh'], c: 2, h: 'Quy luật là 2 Tam Giác rồi 1 Hình Vuông, vậy ô hỏi chấm là Hình Vuông!' },
    { id: 'q_map6_pat_x4', p: 'Tìm bạn tiếp theo xếp hàng:\n🐰 🐻 🐰 🐻 🐰 ❓', opts: ['🐻 Gấu Nâu', '🐰 Thỏ Trắng', '🐶 Cún Con'], c: 0, h: 'Thỏ - Gấu nối đuôi nhau đều đặn, sau Thỏ là bạn Gấu!' },
    { id: 'q_map6_pat_x5', p: 'Hoàn thành dãy trái cây cầu vồng:\n🍎 🍌 🍊 🍎 🍌 ❓', opts: ['🍎 Quả Táo', '🍊 Quả Cam', '🍇 Chùm Nho'], c: 1, h: 'Chu kỳ lặp lại Táo - Chuối - Cam! Sau Chuối chính là Cam!' },
    { id: 'q_map6_pat_x6', p: 'Tìm số tiếp theo theo quy luật nhảy bước:\n2 — 4 — 6 — ❓', opts: ['7', '10', '8'], c: 2, h: 'Mỗi bước cộng thêm 2: 2, 4, 6 rồi đến 8 nhé bé!' },
    { id: 'q_map6_pat_x7', p: 'Tìm số tiếp theo trong dãy đếm cách 2:\n1 — 3 — 5 — ❓', opts: ['7', '6', '9'], c: 0, h: '1 cộng 2 thành 3, 3 cộng 2 thành 5, 5 cộng 2 thành 7!' },
    { id: 'q_map6_pat_x8', p: 'Hoàn thành quy luật 3 sắc màu:\n🟢 🟡 🔴 🟢 🟡 ❓', opts: ['🟡 Màu Vàng', '🔴 Màu Đỏ', '🟢 Màu Xanh'], c: 1, h: 'Xanh - Vàng - Đỏ lặp lại đều đặn, sau Vàng là Đỏ nhé!' },
    { id: 'q_map6_pat_x9', p: 'Tìm hoa quả tiếp theo:\n🍓 🍓 🍉 🍓 🍓 ❓', opts: ['🍓 Quả Dâu', '🍎 Quả Táo', '🍉 Dưa Hấu'], c: 2, h: 'Hai quả Dâu rồi tới một Dưa Hấu, vậy đáp án là Dưa Hấu!' },
    { id: 'q_map6_pat_x10', p: 'Đếm lùi theo quy luật bước đều:\n10 — 8 — 6 — ❓', opts: ['4', '5', '3'], c: 0, h: 'Mỗi bước giảm đi 2: 10, 8, 6 rồi tới 4!' },
    { id: 'q_map6_pat_x11', p: 'Chuỗi âm nhạc cầu vồng:\n🎵 🥁 🎵 🥁 🎵 ❓', opts: ['🎵 Nốt Nhạc', '🥁 Cái Trống', '🎈 Bóng Bay'], c: 1, h: 'Xen kẽ Nốt Nhạc - Trống - Nốt Nhạc - Trống nha bé!' },
    { id: 'q_map6_pat_x12', p: 'Dãy hình trái tim rực rỡ:\n💖 💜 💖 💜 💖 ❓', opts: ['💖 Tim Hồng', '💙 Tim Xanh', '💜 Tim Tím'], c: 2, h: 'Tim Hồng - Tim Tím xen kẽ nhau, sau Tim Hồng là Tim Tím!' },
    { id: 'q_map6_pat_x13', p: 'Dãy số bậc thang tăng dần:\n1 — 2 — 3 — 1 — 2 — ❓', opts: ['3', '4', '1'], c: 0, h: 'Bộ 3 số 1, 2, 3 lặp lại nhịp nhàng -> số tiếp theo là 3!' },
    { id: 'q_map6_pat_x14', p: 'Hoàn thành hàng bạn nhỏ bay lượn:\n🐝 🦋 🦋 🐝 🦋 ❓', opts: ['🐝 Ong Vàng', '🦋 Bướm Xinh', '🐞 Bọ Rùa'], c: 1, h: '1 Ong rồi 2 Bướm -> đã có 1 Ong 1 Bướm nên thiếu 1 bạn Bướm nữa!' }
  ].map(cfg => mc({
    id: cfg.id,
    skillId: 'pattern',
    difficulty: 3,
    prompt: `✨ ${cfg.p}`,
    speak: cfg.p.replace(/[\u{1F300}-\u{1FAFF}🔴🔵🟡🟢🟣💖💜🔺🟦⭐🌙☀️🎵🥁🍎🍌🍊🍇🍓🍉🐝🦋🐞❓]/gu, ' ').trim(),
    choices: cfg.opts,
    correct: cfg.c,
    hint: cfg.h
  })),
  ...[
    { id: 'q_map6_rev_x1', sk: 'addition', p: 'Tổng hợp: Có 3 viên ngọc đỏ và 2 viên ngọc tím, Thần Long có tất cả mấy viên ngọc?', opts: ['5 viên ngọc', '4 viên ngọc', '6 viên ngọc'], c: 0, h: '3 + 2 = 5 viên ngọc lấp lánh!' },
    { id: 'q_map6_rev_x2', sk: 'subtraction', p: 'Tổng hợp: Trên đỉnh cầu vồng có 9 ngôi sao, cho phép 4 sao bay xuống ban phước. Còn mấy sao?', opts: ['6 ngôi sao', '5 ngôi sao', '4 ngôi sao'], c: 1, h: '9 - 4 = 5 ngôi sao!' },
    { id: 'q_map6_rev_x3', sk: 'comparison', p: 'Tổng hợp: 5 + 3 bằng mấy và so với 7 thì thế nào?', opts: ['Bằng 8 và nhỏ hơn 7', 'Bằng 7 và bằng 7', 'Bằng 8 và LỚN HƠN 7'], c: 2, h: '5 + 3 = 8, mà 8 thì lớn hơn 7 đó bé!' },
    { id: 'q_map6_rev_x4', sk: 'shapes', p: 'Tổng hợp: Mặt trống đồng và chiếc bánh xe đều có chung hình dạng nào?', opts: ['Hình Tròn', 'Hình Tam Giác', 'Hình Chữ Nhật'], c: 0, h: 'Cả hai đều tròn trịa là Hình Tròn nha!' },
    { id: 'q_map6_rev_x5', sk: 'colors', p: 'Tổng hợp: Pha màu Đỏ với màu Vàng sẽ tạo thành sắc cầu vồng rực rỡ nào?', opts: ['Màu Tím', 'Màu Cam', 'Màu Đen'], c: 1, h: 'Đỏ trộn Vàng thành màu Cam ấm áp tuyệt đẹp!' },
    { id: 'q_map6_rev_x6', sk: 'counting', p: 'Tổng hợp: Đôi bàn tay xinh xắn của bé có tất cả bao nhiêu ngón tay?', opts: ['8 ngón tay', '9 ngón tay', '10 ngón tay'], c: 2, h: '5 ngón tay trái + 5 ngón tay phải = 10 ngón tay!' },
    { id: 'q_map6_rev_x7', sk: 'addition', p: 'Tổng hợp: 4 + 4 bằng bao nhiêu vậy bé ơi?', opts: ['8', '6', '9'], c: 0, h: '4 cộng 4 bằng 8 đó bé thông minh!' },
    { id: 'q_map6_rev_x8', sk: 'subtraction', p: 'Tổng hợp: 10 - 3 bằng mấy nhỉ?', opts: ['6', '7', '8'], c: 1, h: '10 bớt đi 3 còn 7 nha!' },
    { id: 'q_map6_rev_x9', sk: 'comparison', p: 'Tổng hợp: Phép tính nào lớn nhất trong 3 phép tính sau?', opts: ['2 + 2', '6 - 1', '5 + 4'], c: 2, h: '5 + 4 = 9 là lớn nhất (lớn hơn 4 và 5)!' },
    { id: 'q_map6_rev_x10', sk: 'counting', p: 'Tổng hợp: Số liền sau của số 9 là số nào?', opts: ['Số 10', 'Số 8', 'Số 7'], c: 0, h: 'Đếm 8, 9 rồi liền sau 9 là số 10!' },
    { id: 'q_map6_rev_x11', sk: 'addition', p: 'Tổng hợp: Nếu có 2 đôi dép (mỗi đôi 2 chiếc), bé có tất cả mấy chiếc dép?', opts: ['2 chiếc dép', '4 chiếc dép', '6 chiếc dép'], c: 1, h: '2 + 2 = 4 chiếc dép nè bé!' },
    { id: 'q_map6_rev_x12', sk: 'colors', p: 'Tổng hợp: Cầu vồng rực rỡ xuất hiện sau cơn mưa có mấy sắc màu chính?', opts: ['5 sắc màu', '6 sắc màu', '7 sắc màu'], c: 2, h: 'Cầu vồng gồm Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím — đủ 7 sắc màu!' }
  ].map(cfg => mc({
    id: cfg.id,
    skillId: cfg.sk,
    difficulty: 3,
    prompt: `🌈 ${cfg.p}`,
    speak: cfg.p,
    choices: cfg.opts,
    correct: cfg.c,
    hint: cfg.h
  })),
  pairQ({
    id: 'q_map6_pair_x1',
    zone: 'zone6',
    difficulty: 3,
    prompt: '🔗 Thử thách Thần Long: Nối các bạn nhỏ với đúng chiếc bóng nhé! 🐉',
    speak: 'Bé nối các bạn nhỏ với đúng chiếc bóng nhé!',
    pairs: [
      { leftText: 'Chú Voi', leftImg: '/assets/edu/animals/anim_elephant.png', rightText: 'Bóng Voi', rightImg: '/assets/edu/animals/anim_elephant_shadow.png' },
      { leftText: 'Chú Gấu', leftImg: '/assets/edu/animals/anim_bear.png', rightText: 'Bóng Gấu', rightImg: '/assets/edu/animals/anim_bear_shadow.png' },
      { leftText: 'Sư Tử', leftImg: '/assets/edu/animals/anim_lion.png', rightText: 'Bóng Sư Tử', rightImg: '/assets/edu/animals/anim_lion_shadow.png' }
    ],
    hint: 'Nhìn vòi Voi, tai Gấu và bờm Sư Tử để ghép thật chuẩn!'
  }),
  pairQ({
    id: 'q_map6_pair_x2',
    zone: 'zone6',
    difficulty: 3,
    prompt: '🔗 Ghép nửa dưa hấu và mảnh ghép hoa quả cho tròn vẹn nhé bé! 🍉',
    speak: 'Ghép hai mảnh hoa quả khớp lại với nhau nhé!',
    pairs: [
      { leftText: 'Nửa Dưa Trái', leftImg: '/assets/edu/puzzles/jigsaw_watermelon_left.png', rightText: 'Nửa Dưa Phải', rightImg: '/assets/edu/puzzles/jigsaw_watermelon_right.png' },
      { leftText: 'Quả Táo', leftImg: '/assets/edu/fruits/fruit_apple.png', rightText: 'Bóng Táo', rightImg: '/assets/edu/fruits/fruit_apple_shadow.png' },
      { leftText: 'Quả Cam', leftImg: '/assets/edu/fruits/fruit_orange.png', rightText: 'Bóng Cam', rightImg: '/assets/edu/fruits/fruit_orange_shadow.png' }
    ],
    hint: 'Ghép hai nửa dưa hấu với nhau, Táo với bóng Táo, Cam với bóng Cam!'
  }),
  pairQ({
    id: 'q_map6_pair_x3',
    zone: 'zone6',
    difficulty: 3,
    prompt: '🔗 Nối mỗi đồ chơi đáng yêu với chiếc bóng của món đó nhé! 🎈',
    speak: 'Bé nối đồ chơi với chiếc bóng tương ứng nha!',
    pairs: [
      { leftText: 'Gấu Bông', leftImg: '/assets/edu/toys/toy_teddy.png', rightText: 'Bóng Gấu', rightImg: '/assets/edu/toys/toy_teddy_shadow.png' },
      { leftText: 'Quả Bóng', leftImg: '/assets/edu/toys/toy_ball.png', rightText: 'Bóng Tròn', rightImg: '/assets/edu/toys/toy_ball_shadow.png' },
      { leftText: 'Que Kem', leftImg: '/assets/edu/toys/toy_icecream.png', rightText: 'Bóng Kem', rightImg: '/assets/edu/toys/toy_icecream_shadow.png' }
    ],
    hint: 'Nối đúng hình Gấu Bông, Quả Bóng và Que Kem nha!'
  }),
  pairQ({
    id: 'q_map6_pair_x4',
    zone: 'zone6',
    difficulty: 3,
    prompt: '🔗 Nối màu sắc rực rỡ với hình khối đồng điệu tương ứng nhé! 🌈',
    speak: 'Bé nối cặp hình khối giống nhau trên cầu vồng nhé!',
    pairs: [
      { leftText: 'Ngôi Sao', leftImg: '/assets/edu/shapes/shape_star.png', rightText: 'Ngôi Sao', rightImg: '/assets/edu/shapes/shape_star.png' },
      { leftText: 'Trái Tim', leftImg: '/assets/edu/shapes/shape_heart.png', rightText: 'Trái Tim', rightImg: '/assets/edu/shapes/shape_heart.png' },
      { leftText: 'Hình Vuông', leftImg: '/assets/edu/shapes/shape_square.png', rightText: 'Hình Vuông', rightImg: '/assets/edu/shapes/shape_square.png' }
    ],
    hint: 'Ngôi Sao nối Ngôi Sao, Trái Tim nối Trái Tim, Hình Vuông nối Hình Vuông!'
  }),
  memoryQ({
    id: 'q_map6_mem_x1',
    difficulty: 3,
    prompt: '🃏 Thử thách trí nhớ Thần Long: Tìm 3 cặp bạn thú cưng nhé! 🐉',
    speak: 'Bé hãy lật tìm ba cặp bạn vật giống nhau nhé!',
    cardsData: [
      { label: 'Mèo Con', image: '/assets/edu/animals/anim_cat.png' },
      { label: 'Thỏ Trắng', image: '/assets/edu/animals/anim_bunny.png' },
      { label: 'Bé Cún', image: '/assets/edu/animals/anim_dog.png' }
    ],
    hint: 'Nhớ vị trí Mèo Con, Thỏ Trắng và Bé Cún dễ thương!'
  }),
  memoryQ({
    id: 'q_map6_mem_x2',
    difficulty: 3,
    prompt: '🃏 Tìm 3 cặp trái cây cung đình Thần Long giống nhau nào! 🍓',
    speak: 'Bé lật tìm ba cặp trái cây cung đình nhé!',
    cardsData: [
      { label: 'Dâu Tây', image: '/assets/edu/fruits/fruit_strawberry.png' },
      { label: 'Dưa Hấu', image: '/assets/edu/fruits/fruit_watermelon.png' },
      { label: 'Quả Táo', image: '/assets/edu/fruits/fruit_apple.png' }
    ],
    hint: 'Hãy ghi nhớ Dâu Tây Đỏ, Dưa Hấu Xanh và Quả Táo Ngọt!'
  }),
  memoryQ({
    id: 'q_map6_mem_x3',
    difficulty: 3,
    prompt: '🃏 Mở 3 cặp phép màu màu sắc cầu vồng nha bé ơi! 🎨',
    speak: 'Bé lật tìm ba cặp màu sắc cầu vồng nhé!',
    cardsData: [
      { label: 'Màu Đỏ', image: '/assets/edu/colors/color_red.png' },
      { label: 'Màu Vàng', image: '/assets/edu/colors/color_yellow.png' },
      { label: 'Màu Tím', image: '/assets/edu/colors/color_purple.png' }
    ],
    hint: 'Tìm hai thẻ Đỏ, hai thẻ Vàng và hai thẻ Tím nhé!'
  }),
  dragQ({
    id: 'q_map6_drag_x1',
    difficulty: 3,
    prompt: '📦 Xếp đội bạn thú cung đình từ NHỎ đến TO NHẤT nhé! 🦁',
    speak: 'Bé xếp ba bạn vật từ nhỏ nhất đến to lớn nhất nhé!',
    slots: ['1. Bé xíu', '2. Vừa', '3. Khổng lồ'],
    items: [
      { id: 'z1', label: '🐛 Ong Nhỏ', text: 'Ong Nhỏ', order: 1, image: '/assets/edu/animals/anim_bee.png' },
      { id: 'z2', label: '🐒 Chú Khỉ', text: 'Chú Khỉ', order: 2, image: '/assets/edu/animals/anim_monkey.png' },
      { id: 'z3', label: '🦁 Sư Tử', text: 'Sư Tử', order: 3, image: '/assets/edu/animals/anim_lion.png' }
    ],
    hint: 'Bạn Ong bé xíu đứng đầu, Khỉ đứng giữa và Sư Tử oai vệ đứng thứ ba!'
  }),
  dragQ({
    id: 'q_map6_drag_x2',
    difficulty: 3,
    prompt: '📦 Sắp xếp các quả ngọt từ NHỎ đến TO LỚN NHẤT nha! 🍉',
    speak: 'Sắp xếp quả từ nhỏ nhất tới to nhất nhé!',
    slots: ['1. Nhỏ nhất', '2. Vừa', '3. To nhất'],
    items: [
      { id: 'q1', label: '🍓 Dâu Tây', text: 'Dâu Tây', order: 1, image: '/assets/edu/fruits/fruit_strawberry.png' },
      { id: 'q2', label: '🍊 Quả Cam', text: 'Quả Cam', order: 2, image: '/assets/edu/fruits/fruit_orange.png' },
      { id: 'q3', label: '🍉 Dưa Hấu', text: 'Dưa Hấu', order: 3, image: '/assets/edu/fruits/fruit_watermelon.png' }
    ],
    hint: 'Dâu tây nhỏ nhất, Cam ở giữa và Dưa Hấu to bự nhất!'
  }),
  dragQ({
    id: 'q_map6_drag_x3',
    difficulty: 3,
    prompt: '📦 Sắp xếp đồ chơi lễ hội từ BÉ ĐẾN LỚN cho Thần Long nhé! 🎈',
    speak: 'Bé sắp xếp đồ chơi từ bé đến lớn nhé!',
    slots: ['1. Nhỏ nhất', '2. Vừa', '3. To nhất'],
    items: [
      { id: 'p1', label: '🍭 Kẹo Mút', text: 'Kẹo Mút', order: 1, image: '/assets/edu/toys/toy_lollipop.png' },
      { id: 'p2', label: '🎩 Mũ Tiệc', text: 'Mũ Tiệc', order: 2, image: '/assets/edu/toys/toy_partyhat.png' },
      { id: 'p3', label: '🥁 Cái Trống', text: 'Cái Trống', order: 3, image: '/assets/edu/toys/toy_drum.png' }
    ],
    hint: 'Kẹo Mút bé nhất, đến chiếc Mũ Tiệc và Cái Trống to đứng cuối!'
  })
];

export const EXPANDED_QUESTIONS = Object.fromEntries(
  EXPANDED_LIST.map(q => [q.id, q])
);
