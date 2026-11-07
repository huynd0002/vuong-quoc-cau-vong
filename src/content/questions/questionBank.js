import { validateQuestion } from '../schema/validator.js';

/**
 * Question Bank
 * Ngân hàng câu hỏi giáo dục toán tư duy mầm non (5-6 tuổi) đầy đủ cho 6 Vùng Đất.
 * Được chuẩn hóa và xác thực nghiêm ngặt bởi Content Schema Validator.
 */

export const QUESTION_BANK = {
  // ==========================================
  // === VÙNG 1: MÀU SẮC & HÌNH KHỐI CƠ BẢN ===
  // ==========================================
  q_map1_colors_1: {
    id: 'q_map1_colors_1',
    skillId: 'colors',
    difficulty: 1,
    prompt: 'Bông hoa hướng dương có màu gì vậy bé? 🌻',
    speak: 'Bông hoa hướng dương có màu gì vậy bé?',
    choices: ['Màu Vàng', 'Màu Xanh Biển', 'Màu Đen'],
    choiceImages: [
      '/assets/edu/colors/color_yellow.png',
      '/assets/edu/colors/color_blue.png',
      '/assets/edu/colors/color_black.png'
    ],
    correct: 0,
    hint: 'Màu vàng rực rỡ như ánh mặt trời ấm áp đó bé!'
  },
  q_map1_colors_2: {
    id: 'q_map1_colors_2',
    skillId: 'colors',
    difficulty: 1,
    prompt: 'Quả dâu tây chín mọng có màu gì vậy bé? 🍓',
    speak: 'Quả dâu tây chín mọng có màu gì vậy bé?',
    choices: ['Màu Đỏ tươi', 'Màu Tím', 'Màu Đen'],
    choiceImages: [
      '/assets/edu/colors/color_red.png',
      '/assets/edu/colors/color_purple.png',
      '/assets/edu/colors/color_black.png'
    ],
    correct: 0,
    hint: 'Màu đỏ tươi ngon ngọt ngào như trái dâu chín trên cành!'
  },
  q_map1_colors_3: {
    id: 'q_map1_colors_3',
    skillId: 'colors',
    difficulty: 1,
    prompt: 'Lá cây non vào mùa xuân có màu gì bé nhỉ? 🍃',
    speak: 'Lá cây non vào mùa xuân có màu gì bé nhỉ?',
    choices: ['Màu Xanh lá cây', 'Màu Nâu đất', 'Màu Xám'],
    choiceImages: [
      '/assets/edu/colors/color_green.png',
      '/assets/edu/colors/color_orange.png',
      '/assets/edu/colors/color_black.png'
    ],
    correct: 0,
    hint: 'Màu xanh lá cây tươi mát của thiên nhiên cây cỏ nè!'
  },
  q_map1_shapes_1: {
    id: 'q_map1_shapes_1',
    skillId: 'shapes',
    difficulty: 1,
    prompt: 'Bánh xe của bác gấu có hình dạng gì? 🚙',
    speak: 'Bánh xe của bác gấu có hình dạng gì?',
    choices: ['Hình Vuông', 'Hình Tròn', 'Hình Tam Giác'],
    choiceImages: [
      '/assets/edu/shapes/shape_square.png',
      '/assets/edu/shapes/shape_circle.png',
      '/assets/edu/shapes/shape_triangle.png'
    ],
    correct: 1,
    hint: 'Hình tròn xoe để bánh xe có thể lăn bon bon trên đường nè!'
  },
  q_map1_shapes_2: {
    id: 'q_map1_shapes_2',
    skillId: 'shapes',
    difficulty: 1,
    prompt: 'Hộp quà sinh nhật có 4 cạnh đều nhau là hình gì? 🎁',
    speak: 'Hộp quà sinh nhật có bốn cạnh đều nhau là hình gì?',
    choices: ['Hình Tròn', 'Hình Vuông', 'Hình Tam Giác'],
    choiceImages: [
      '/assets/edu/shapes/shape_circle.png',
      '/assets/edu/shapes/shape_square.png',
      '/assets/edu/shapes/shape_triangle.png'
    ],
    correct: 1,
    hint: 'Hình vuông vức có 4 cạnh bằng nhau như chiếc hộp quà xinh xắn!'
  },
  q_map1_shapes_3: {
    id: 'q_map1_shapes_3',
    skillId: 'shapes',
    difficulty: 1,
    prompt: 'Cánh buồm chiếc thuyền đón gió có hình gì? ⛵',
    speak: 'Cánh buồm chiếc thuyền đón gió có hình gì?',
    choices: ['Hình Tam Giác', 'Hình Tròn', 'Hình Vuông'],
    choiceImages: [
      '/assets/edu/shapes/shape_triangle.png',
      '/assets/edu/shapes/shape_circle.png',
      '/assets/edu/shapes/shape_square.png'
    ],
    correct: 0,
    hint: 'Cánh buồm đón gió có 3 góc nhọn là hình tam giác đó bé!'
  },
  q_map1_counting_oranges_intro: {
    id: 'q_map1_counting_oranges_intro',
    skillId: 'counting',
    difficulty: 1,
    prompt: '2 quả cam 🍊🍊 + 1 quả cam 🍊 = mấy quả cam?',
    speak: 'Hai quả cam cộng một quả cam bằng mấy quả cam tất cả?',
    choices: ['2 quả cam', '3 quả cam', '4 quả cam'],
    correct: 1,
    hint: 'Hai quả cam thêm một quả cam nữa là có tất cả 3 quả cam ngon lành!'
  },
  q_map1_counting_apples_intro: {
    id: 'q_map1_counting_apples_intro',
    skillId: 'counting',
    difficulty: 1,
    prompt: '2 quả táo 🍎🍎 + 2 quả táo 🍎🍎 = mấy quả táo?',
    speak: 'Hai quả táo cộng hai quả táo bằng mấy quả táo tất cả?',
    choices: ['3 quả táo', '4 quả táo', '5 quả táo'],
    correct: 1,
    hint: 'Hai cộng hai bằng bốn quả táo đỏ tươi ngon!'
  },
  q_map1_boss_p1: {
    id: 'q_map1_boss_p1',
    skillId: 'colors',
    difficulty: 2,
    prompt: 'Boss Nấm Pha 1: Trái dưa hấu có vỏ ngoài màu gì? 🍉',
    speak: 'Cùng đánh thức Nấm Mũ Đỏ: Trái dưa hấu có vỏ ngoài màu gì?',
    choices: ['Màu Xanh lá', 'Màu Vàng chanh', 'Màu Tím'],
    choiceImages: [
      '/assets/edu/colors/color_green.png',
      '/assets/edu/colors/color_yellow.png',
      '/assets/edu/colors/color_purple.png'
    ],
    correct: 0,
    hint: 'Vỏ dưa hấu có những đường sọc màu xanh lá cây mát lành!'
  },
  q_map1_boss_p2: {
    id: 'q_map1_boss_p2',
    skillId: 'shapes_and_colors',
    difficulty: 2,
    prompt: 'Boss Nấm Pha 2: Hình nào có 3 góc nhọn như chiếc nón sinh nhật? 🎪',
    speak: 'Câu hỏi giải cứu quyết định: Hình nào có ba góc nhọn như chiếc nón sinh nhật?',
    choices: ['Hình Tròn', 'Hình Vuông', 'Hình Tam Giác'],
    choiceImages: [
      '/assets/edu/shapes/shape_circle.png',
      '/assets/edu/shapes/shape_square.png',
      '/assets/edu/shapes/shape_triangle.png'
    ],
    correct: 2,
    hint: 'Bé đếm xem hình nào có 3 cạnh và 3 góc nhọn nhé!'
  },
  q_map1_boss: {
    id: 'q_map1_boss',
    skillId: 'shapes_and_colors',
    difficulty: 2,
    prompt: 'Hình nào có 3 góc nhọn như chiếc nón sinh nhật?',
    speak: 'Hình nào có 3 góc nhọn như chiếc nón sinh nhật?',
    choices: ['Hình Tròn', 'Hình Vuông', 'Hình Tam Giác'],
    choiceImages: [
      '/assets/edu/shapes/shape_circle.png',
      '/assets/edu/shapes/shape_square.png',
      '/assets/edu/shapes/shape_triangle.png'
    ],
    correct: 2,
    hint: 'Bé đếm xem hình nào có 3 cạnh và 3 góc nhọn nhé!'
  },

  // --- CÂU HỎI HỌC LIỆU MỚI: TRÁI CÂY DƯA HẤU & GHÉP HÌNH VỚI NHAU ---
  q_map1_shadow_watermelon: {
    id: 'q_map1_shadow_watermelon',
    skillId: 'shadow_matching',
    type: 'shadow_match',
    difficulty: 1,
    image: '/assets/edu/fruits/fruit_watermelon.png',
    prompt: 'Bé hãy tìm xem đâu là bóng đen của quả Dưa Hấu ngọt mát nhé! 🍉',
    speak: 'Bé hãy tìm xem đâu là bóng đen của quả Dưa Hấu ngọt mát nhé!',
    choices: ['Bóng Quả Táo', 'Bóng Dưa Hấu', 'Bóng Quả Cam'],
    choiceImages: [
      '/assets/edu/fruits/fruit_apple_shadow.png',
      '/assets/edu/fruits/fruit_watermelon_shadow.png',
      '/assets/edu/fruits/fruit_orange_shadow.png'
    ],
    correct: 1,
    hint: 'Bé nhìn đường cong tròn và viền của miếng dưa hấu kìa!'
  },
  q_map1_fruit_watermelon_pick: {
    id: 'q_map1_fruit_watermelon_pick',
    skillId: 'colors',
    type: 'multiple_choice',
    difficulty: 1,
    prompt: 'Bé ơi, đâu là quả Dưa Hấu ruột đỏ vỏ xanh thơm ngon? 🍉',
    speak: 'Bé hãy chọn quả Dưa Hấu ruột đỏ vỏ xanh thơm ngon nhé!',
    choices: ['Quả Dưa Hấu', 'Quả Chuối', 'Quả Dâu Tây'],
    choiceImages: [
      '/assets/edu/fruits/fruit_watermelon.png',
      '/assets/edu/fruits/fruit_banana.png',
      '/assets/edu/fruits/fruit_strawberry.png'
    ],
    correct: 0,
    hint: 'Quả dưa hấu có ruột đỏ ngọt lịm và vỏ sọc xanh đó bé!'
  },
  q_map1_counting_watermelon: {
    id: 'q_map1_counting_watermelon',
    skillId: 'counting',
    type: 'counting',
    difficulty: 1,
    visualItems: [
      '/assets/edu/fruits/fruit_watermelon.png',
      '/assets/edu/fruits/fruit_watermelon.png',
      '/assets/edu/fruits/fruit_watermelon.png'
    ],
    prompt: 'Bé đếm xem có bao nhiêu miếng dưa hấu ngon lành trên đĩa nhé! 🍉🍉🍉',
    speak: 'Bé đếm xem có bao nhiêu miếng dưa hấu ngon lành trên đĩa nhé!',
    choices: ['2 miếng', '3 miếng', '4 miếng'],
    correct: 1,
    hint: 'Cùng đếm với bé nào: 1, 2, 3! Có 3 miếng dưa hấu thơm ngon!'
  },
  q_map1_jigsaw_watermelon: {
    id: 'q_map1_jigsaw_watermelon',
    skillId: 'synthesis',
    type: 'jigsaw_match',
    difficulty: 1,
    previewImage: '/assets/edu/puzzles/jigsaw_watermelon_left.png',
    prompt: 'Bé hãy chọn mảnh ghép bên phải để ghép thành quả dưa hấu trọn vẹn nhé! 🍉',
    speak: 'Bé hãy chọn mảnh ghép bên phải để ghép thành quả dưa hấu trọn vẹn nhé!',
    choices: ['Mảnh Táo Đỏ', 'Mảnh Dưa Hấu Khớp', 'Mảnh Cam Vàng'],
    choiceImages: [
      '/assets/edu/puzzles/jigsaw_apple_right.png',
      '/assets/edu/puzzles/jigsaw_watermelon_right.png',
      '/assets/edu/puzzles/jigsaw_orange_right.png'
    ],
    correct: 1,
    hint: 'Mảnh bên phải có viền xanh và ruột đỏ khớp hoàn hảo với nửa bên trái đó bé!'
  },
  q_map1_pair_dog: {
    id: 'q_map1_pair_dog',
    skillId: 'synthesis',
    type: 'pair_match',
    difficulty: 1,
    previewImage: '/assets/edu/puzzles/pair_dog.png',
    prompt: 'Bạn Cún Vàng thích nhất món đồ nào dưới đây để gặm chơi? 🐶',
    speak: 'Bạn Cún Vàng thích nhất món đồ nào dưới đây để gặm chơi bé nhỉ?',
    choices: ['Xẻng Nấu Ăn', 'Khúc Xương Thơm', 'Chảo Nấu Ăn'],
    choiceImages: [
      '/assets/edu/puzzles/pair_spatula.png',
      '/assets/edu/puzzles/pair_bone.png',
      '/assets/edu/puzzles/pair_pan.png'
    ],
    correct: 1,
    hint: 'Bạn cún thích nhất là được gặm khúc xương thơm ngon đó bé!'
  },
  q_map1_pair_kitchen: {
    id: 'q_map1_pair_kitchen',
    skillId: 'synthesis',
    type: 'pair_match',
    difficulty: 1,
    previewImage: '/assets/edu/puzzles/pair_pan.png',
    prompt: 'Chiếc chảo rán cần người bạn nào đi cùng để lật món ăn chín vàng? 🍳',
    speak: 'Chiếc chảo rán cần người bạn nào đi cùng để lật món ăn chín vàng bé nhỉ?',
    choices: ['Khúc Xương', 'Xẻng Lật Thức Ăn', 'Hình Ngôi Sao'],
    choiceImages: [
      '/assets/edu/puzzles/pair_bone.png',
      '/assets/edu/puzzles/pair_spatula.png',
      '/assets/edu/shapes/shape_star.png'
    ],
    correct: 1,
    hint: 'Xẻng lật thức ăn luôn là bạn thân đi cùng chiếc chảo rán nè!'
  },
  q_map1_jigsaw_shape: {
    id: 'q_map1_jigsaw_shape',
    skillId: 'shapes',
    type: 'jigsaw_match',
    difficulty: 1,
    previewImage: '/assets/edu/shapes/shape_triangle.png',
    prompt: 'Mảnh ghép hình nào có 3 cạnh khớp vào chỗ trống chiếc thuyền buồm? ⛵',
    speak: 'Mảnh ghép hình nào có ba cạnh khớp vào chỗ trống chiếc thuyền buồm bé nhỉ?',
    choices: ['Hình Tròn', 'Hình Vuông', 'Hình Tam Giác'],
    choiceImages: [
      '/assets/edu/shapes/shape_circle.png',
      '/assets/edu/shapes/shape_square.png',
      '/assets/edu/shapes/shape_triangle.png'
    ],
    correct: 2,
    hint: 'Cánh buồm có 3 cạnh nhọn khớp với Hình Tam Giác đó bé!'
  },

  // ==========================================
  // === VÙNG 2: ĐẾM SỐ LƯỢNG 1-10 (VỊNH BIỂN) ===
  // ==========================================
  q_map2_counting_1: {
    id: 'q_map2_counting_1',
    skillId: 'counting',
    difficulty: 1,
    prompt: 'Có mấy chú cua nhỏ đang bò trên bãi cát? 🦀 🦀 🦀',
    speak: 'Có mấy chú cua nhỏ đang bò trên bãi cát?',
    choices: ['2 chú cua', '3 chú cua', '4 chú cua'],
    correct: 1,
    hint: 'Bé cùng đếm với bạn Thỏ nhé: một, hai, ba!'
  },
  q_map2_counting_2: {
    id: 'q_map2_counting_2',
    skillId: 'counting',
    difficulty: 1,
    prompt: 'Bé đếm xem có mấy chiếc vỏ sò màu hồng? 🐚 🐚 🐚 🐚 🐚',
    speak: 'Bé đếm xem có mấy chiếc vỏ sò màu hồng?',
    countItem: '/assets/edu/shapes/shape_star.png',
    choices: ['4 chiếc vỏ sò', '5 chiếc vỏ sò', '6 chiếc vỏ sò'],
    correct: 1,
    hint: 'Mỗi ngón trên bàn tay ứng với một chiếc vỏ sò nè, tất cả là 5 chiếc!'
  },
  q_map2_counting_3: {
    id: 'q_map2_counting_3',
    skillId: 'counting',
    difficulty: 2,
    prompt: 'Đàn cá heo có mấy bạn đang nhảy múa vui vẻ? 🐬 🐬 🐬 🐬',
    speak: 'Đàn cá heo có mấy bạn đang nhảy múa vui vẻ?',
    choices: ['3 bạn cá heo', '4 bạn cá heo', '5 bạn cá heo'],
    correct: 1,
    hint: 'Một, hai, ba, bốn bạn cá heo đang bơi lượn tung tăng!'
  },
  q_map2_counting_4: {
    id: 'q_map2_counting_4',
    skillId: 'counting',
    difficulty: 2,
    prompt: 'Bé đếm xem có bao nhiêu bong bóng nước? 🫧 🫧 🫧 🫧 🫧 🫧 🫧',
    speak: 'Bé đếm xem có bao nhiêu bong bóng nước lơ lửng?',
    choices: ['6 bong bóng', '7 bong bóng', '8 bong bóng'],
    correct: 1,
    hint: 'Bé đếm thật chậm từng quả nhé: một, hai, ba, bốn, năm, sáu, bảy quả bong bóng!'
  },
  q_map2_counting_oranges: {
    id: 'q_map2_counting_oranges',
    skillId: 'counting',
    difficulty: 1,
    prompt: 'Bé đếm xem có mấy quả cam trên bàn? 🍊 🍊 🍊 🍊',
    speak: 'Bé đếm xem có mấy quả cam trên bàn nhé?',
    choices: ['3 quả cam', '4 quả cam', '5 quả cam'],
    correct: 1,
    hint: 'Một, hai, ba, bốn. Có tất cả 4 quả cam tròn xoe!'
  },
  q_map2_counting_fruits_mix: {
    id: 'q_map2_counting_fruits_mix',
    skillId: 'counting',
    difficulty: 2,
    prompt: 'Bé đếm xem trong rổ có tất cả mấy trái cây? 🍎 🍊 🍌 🍓 🍇 🍉',
    speak: 'Bé đếm xem trong rổ có tất cả mấy trái cây ngọt lành?',
    countItem: '/assets/edu/fruits/fruit_apple.png',
    choices: ['5 trái cây', '6 trái cây', '7 trái cây'],
    correct: 1,
    hint: 'Cùng đếm từng quả nhé: một, hai, ba, bốn, năm, sáu quả thơm ngon!'
  },
  q_map2_boss_p1: {
    id: 'q_map2_boss_p1',
    skillId: 'counting',
    difficulty: 2,
    prompt: 'Cua Vua Pha 1: Trong rương có mấy viên ngọc trai? 🦪 🦪 🦪 🦪 🦪 🦪',
    speak: 'Cua Vua Pha 1: Trong rương có mấy viên ngọc trai?',
    choices: ['5 viên ngọc', '6 viên ngọc', '7 viên ngọc'],
    correct: 1,
    hint: 'Năm viên thêm một viên nữa là sáu viên ngọc trai lấp lánh!'
  },
  q_map2_boss_p2: {
    id: 'q_map2_boss_p2',
    skillId: 'counting',
    difficulty: 3,
    prompt: 'Cua Vua Pha 2: Bé đếm xem có mấy bạn rùa biển nhỏ? 🐢 🐢 🐢 🐢 🐢 🐢 🐢 🐢',
    speak: 'Cua Vua Pha 2: Bé đếm xem có mấy bạn rùa biển nhỏ?',
    choices: ['7 bạn rùa', '8 bạn rùa', '9 bạn rùa'],
    correct: 1,
    hint: 'Tất cả có 8 bạn rùa con đang bơi về tổ đó bé!'
  },
  q_map2_boss: {
    id: 'q_map2_boss',
    skillId: 'counting',
    difficulty: 2,
    prompt: 'Bé đếm xem có bao nhiêu ngôi sao biển? ⭐ ⭐ ⭐ ⭐ ⭐',
    speak: 'Bé đếm xem có bao nhiêu ngôi sao biển nhé!',
    choices: ['4 ngôi sao', '5 ngôi sao', '6 ngôi sao'],
    correct: 1,
    hint: 'Một bàn tay bé xíu có mấy ngón tay thì có bấy nhiêu ngôi sao nè!'
  },

  // ===============================================
  // === VÙNG 3: PHÉP CỘNG TRỰC QUAN 1-5 (ĐỘNG ĐÁ) ===
  // ===============================================
  q_map3_addition_1: {
    id: 'q_map3_addition_1',
    skillId: 'addition',
    difficulty: 2,
    prompt: 'Bé có 1 quả táo 🍎, được mẹ tặng thêm 2 quả táo 🍎 🍎. Hỏi bé có tất cả mấy quả?',
    speak: 'Bé có một quả táo, được mẹ tặng thêm hai quả táo. Hỏi bé có tất cả mấy quả?',
    choices: ['2 quả', '3 quả', '4 quả'],
    correct: 1,
    hint: 'Gộp lại cùng nhau: 1 quả táo rồi thêm 2 quả nữa là 3 quả táo!'
  },
  q_map3_addition_2: {
    id: 'q_map3_addition_2',
    skillId: 'addition',
    difficulty: 2,
    prompt: 'Bé nhặt được 2 viên đá tím 💎💎, bạn Thỏ nhặt thêm 1 viên 💎. Có tất cả mấy viên?',
    speak: 'Bé nhặt được hai viên đá tím, bạn Thỏ nhặt thêm một viên. Có tất cả mấy viên?',
    choices: ['2 viên', '3 viên', '4 viên'],
    correct: 1,
    hint: 'Hai cộng thêm một bằng ba viên đá tím lấp lánh!'
  },
  q_map3_addition_3: {
    id: 'q_map3_addition_3',
    skillId: 'addition',
    difficulty: 2,
    prompt: 'Trong động có 3 bông hoa phát sáng 🌸🌸🌸, nở thêm 1 bông 🌸. Có tất cả mấy bông hoa?',
    speak: 'Trong động có ba bông hoa phát sáng, nở thêm một bông nữa. Có tất cả mấy bông?',
    countItem: '/assets/edu/flower_sakura.svg',
    choices: ['3 bông', '4 bông', '5 bông'],
    correct: 1,
    hint: 'Ba cộng một bằng bốn bông hoa thơm ngát!'
  },
  q_map3_addition_4: {
    id: 'q_map3_addition_4',
    skillId: 'addition',
    difficulty: 3,
    prompt: 'Bé thấy 2 bạn đom đóm 🌟🌟, bay tới thêm 3 bạn 🌟🌟🌟. Có tất cả mấy bạn đom đóm?',
    speak: 'Bé thấy hai bạn đom đóm, bay tới thêm ba bạn nữa. Có tất cả mấy bạn đom đóm?',
    choices: ['4 bạn', '5 bạn', '6 bạn'],
    correct: 1,
    hint: 'Hai cộng ba bằng đúng năm bạn đom đóm sáng lung linh!'
  },
  q_map3_addition_oranges: {
    id: 'q_map3_addition_oranges',
    skillId: 'addition',
    difficulty: 2,
    prompt: '4 quả cam 🍊🍊🍊🍊 + 2 quả cam 🍊🍊 = mấy quả cam?',
    speak: 'Bốn quả cam cộng hai quả cam bằng mấy quả cam tất cả?',
    choices: ['5 quả cam', '6 quả cam', '7 quả cam'],
    correct: 1,
    hint: 'Bé đếm tiếp từ 4 quả cam nhé: bốn, thêm một là năm, thêm một nữa là sáu quả cam!'
  },
  q_map3_addition_apples: {
    id: 'q_map3_addition_apples',
    skillId: 'addition',
    difficulty: 2,
    prompt: '3 quả táo đỏ 🍎🍎🍎 + 2 quả táo đỏ 🍎🍎 = mấy quả táo?',
    speak: 'Ba quả táo đỏ cộng hai quả táo đỏ bằng mấy quả táo tất cả?',
    choices: ['4 quả táo', '5 quả táo', '6 quả táo'],
    correct: 1,
    hint: 'Ba quả táo thêm hai quả nữa gộp lại thành 5 quả táo chín đỏ!'
  },
  q_map3_addition_bananas: {
    id: 'q_map3_addition_bananas',
    skillId: 'addition',
    difficulty: 2,
    prompt: '2 quả chuối 🍌🍌 + 3 quả chuối 🍌🍌🍌 = mấy quả chuối?',
    speak: 'Hai quả chuối cộng ba quả chuối bằng mấy quả chuối tất cả?',
    choices: ['4 quả chuối', '5 quả chuối', '6 quả chuối'],
    correct: 1,
    hint: 'Hai quả chuối gộp với ba quả chuối là vừa đúng 5 quả chuối vàng tươi!'
  },
  q_map3_addition_carrots: {
    id: 'q_map3_addition_carrots',
    skillId: 'addition',
    difficulty: 2,
    prompt: '3 củ cà rốt 🥕🥕🥕 + 1 củ cà rốt 🥕 = mấy củ cà rốt?',
    speak: 'Ba củ cà rốt cộng một củ cà rốt bằng mấy củ cà rốt tất cả?',
    choices: ['3 củ cà rốt', '4 củ cà rốt', '5 củ cà rốt'],
    correct: 1,
    hint: 'Ba củ cà rốt thêm một củ nữa là có tất cả 4 củ cà rốt cho bạn Thỏ!'
  },
  q_map3_addition_strawberries: {
    id: 'q_map3_addition_strawberries',
    skillId: 'addition',
    difficulty: 2,
    prompt: '4 quả dâu tây 🍓🍓🍓🍓 + 1 quả dâu tây 🍓 = mấy quả dâu?',
    speak: 'Bốn quả dâu tây cộng một quả dâu tây bằng mấy quả dâu tây tất cả?',
    choices: ['4 quả dâu', '5 quả dâu', '6 quả dâu'],
    correct: 1,
    hint: 'Bốn quả dâu thêm một quả nữa là được 5 quả dâu tây ngọt ngào!'
  },
  q_map3_addition_watermelons: {
    id: 'q_map3_addition_watermelons',
    skillId: 'addition',
    difficulty: 2,
    prompt: '1 miếng dưa hấu 🍉 + 3 miếng dưa hấu 🍉🍉🍉 = mấy miếng dưa?',
    speak: 'Một miếng dưa hấu cộng ba miếng dưa hấu bằng mấy miếng dưa hấu tất cả?',
    choices: ['3 miếng dưa', '4 miếng dưa', '5 miếng dưa'],
    correct: 1,
    hint: 'Một miếng dưa thêm ba miếng nữa gộp lại thành 4 miếng dưa hấu mát lành!'
  },
  q_map3_boss_p1: {
    id: 'q_map3_boss_p1',
    skillId: 'addition',
    difficulty: 2,
    prompt: 'Rồng Pha Lê Pha 1: 1 ngọn đuốc sáng 🔥 cộng thêm 3 ngọn đuốc 🔥🔥🔥 bằng mấy?',
    speak: 'Rồng Pha Lê Pha 1: Một ngọn đuốc sáng cộng thêm ba ngọn đuốc nữa bằng mấy?',
    choices: ['3 ngọn đuốc', '4 ngọn đuốc', '5 ngọn đuốc'],
    correct: 1,
    hint: 'Một cộng ba bằng bốn ngọn đuốc ấm áp!'
  },
  q_map3_boss_p2: {
    id: 'q_map3_boss_p2',
    skillId: 'addition',
    difficulty: 3,
    prompt: 'Rồng Pha Lê Pha 2: 2 viên pha lê vàng 💎💎 cộng 3 viên xanh 💎💎💎 bằng mấy viên?',
    speak: 'Rồng Pha Lê Pha 2: Hai viên pha lê vàng cộng ba viên xanh bằng mấy viên tất cả?',
    choices: ['4 viên', '5 viên', '6 viên'],
    correct: 1,
    hint: 'Hai cộng ba bằng năm viên pha lê rực rỡ!'
  },
  q_map3_boss: {
    id: 'q_map3_boss',
    skillId: 'addition',
    difficulty: 3,
    prompt: 'Phép tính kỳ diệu: 2 viên pha lê 💎💎 cộng thêm 2 viên 💎💎 bằng mấy?',
    speak: 'Phép tính kỳ diệu: 2 viên pha lê cộng thêm 2 viên nữa bằng mấy?',
    choices: ['3 viên', '4 viên', '5 viên'],
    correct: 1,
    hint: 'Hai cộng hai bằng bốn viên pha lê lấp lánh!'
  },


  // ========================================================
  // === VÙNG 4: PHÉP TRỪ TRỰC QUAN PHẠM VI 5 - 10 (SA MẠC) ===
  // ========================================================
  q_map4_sub_fox: {
    id: 'q_map4_sub_fox',
    skillId: 'subtraction',
    difficulty: 2,
    prompt: 'Trên đĩa có 7 quả cam ngọt 🍊🍊🍊🍊🍊🍊🍊, bé chia cho bạn Cáo Cát 3 quả 🍊🍊🍊. Trên đĩa còn lại mấy quả cam?',
    speak: 'Trên đĩa có bảy quả cam ngọt, bé chia cho bạn Cáo Cát ba quả. Trên đĩa còn lại mấy quả cam?',
    countItem: '/assets/edu/fruits/fruit_orange.png',
    choices: ['3 quả', '4 quả', '5 quả'],
    correct: 1,
    hint: 'Bé bớt đi nhé: 7 quả cam bớt 3 quả còn đúng 4 quả cam mọng nước!'
  },
  q_map4_sub_scarab: {
    id: 'q_map4_sub_scarab',
    skillId: 'subtraction',
    difficulty: 3,
    prompt: 'Có 8 viên ngọc sa mạc lấp lánh ✨, bọ Scarab mang 3 viên vào tổ. Còn lại mấy viên ngọc trên cát?',
    speak: 'Có tám viên ngọc sa mạc lấp lánh, bọ Scarab mang ba viên vào tổ. Còn lại mấy viên ngọc trên cát?',
    countItem: '/assets/edu/shapes/shape_star.png',
    choices: ['4 viên', '5 viên', '6 viên'],
    correct: 1,
    hint: 'Tám bớt ba còn đúng năm viên ngọc lấp lánh!'
  },
  q_map4_sub_falcon: {
    id: 'q_map4_sub_falcon',
    skillId: 'subtraction',
    difficulty: 2,
    prompt: 'Có 6 chú chim ưng 🦅 đang đậu trên tháp đá, 2 chú vỗ cánh bay đi. Còn lại mấy chú chim?',
    speak: 'Có sáu chú chim ưng đang đậu trên tháp đá, hai chú vỗ cánh bay đi. Còn lại mấy chú chim đang đậu?',
    countItem: '/assets/edu/animals/anim_penguin.png',
    choices: ['3 chú', '4 chú', '5 chú'],
    correct: 1,
    hint: 'Sáu bớt hai còn lại đúng bốn chú chim ưng dũng mãnh!'
  },
  q_map4_sub_water: {
    id: 'q_map4_sub_water',
    skillId: 'subtraction',
    difficulty: 3,
    prompt: 'Trên ốc đảo có 9 bình nước mát 🏺, chia cho các bạn lạc đà 4 bình. Còn lại mấy bình nước?',
    speak: 'Trên ốc đảo có chín bình nước mát, chia cho các bạn lạc đà bốn bình. Còn lại mấy bình nước?',
    countItem: '/assets/edu/shapes/shape_heart.png',
    choices: ['4 bình', '5 bình', '6 bình'],
    correct: 1,
    hint: 'Chín bớt bốn còn lại năm bình nước trong lành!'
  },
  q_map4_sub_dates: {
    id: 'q_map4_sub_dates',
    skillId: 'subtraction',
    difficulty: 3,
    prompt: 'Có 10 quả chà là ngọt lịm 🌴, bé ăn hết 3 quả. Còn lại mấy quả chà là?',
    speak: 'Có mười quả chà là ngọt lịm, bé ăn hết ba quả. Còn lại mấy quả chà là trên cành?',
    countItem: '/assets/edu/fruits/fruit_orange.png',
    choices: ['6 quả', '7 quả', '8 quả'],
    correct: 1,
    hint: 'Mười bớt ba còn lại đúng bảy quả chà là ngọt thơm!'
  },
  q_map4_sub_oasis_fish: {
    id: 'q_map4_sub_oasis_fish',
    skillId: 'subtraction',
    difficulty: 2,
    prompt: 'Trong hồ ốc đảo có 8 chú cá nhỏ 🐟, 4 chú bơi vào hang đá. Còn lại mấy chú cá đang bơi ngoài hồ?',
    speak: 'Trong hồ ốc đảo có tám chú cá nhỏ, bốn chú bơi vào hang đá. Còn lại mấy chú cá đang bơi ngoài hồ?',
    choices: ['3 chú', '4 chú', '5 chú'],
    correct: 1,
    hint: 'Tám bớt bốn còn lại bốn chú cá nhỏ bơi lội tung tăng!'
  },
  q_map4_sub_balloons: {
    id: 'q_map4_sub_balloons',
    skillId: 'subtraction',
    difficulty: 3,
    prompt: 'Bé cầm chùm 10 quả bóng bay 🎈, gió cuốn bay mất 5 quả. Bé còn giữ được mấy quả bóng bay?',
    speak: 'Bé cầm chùm mười quả bóng bay, gió cuốn bay mất năm quả. Bé còn giữ được mấy quả bóng bay?',
    choices: ['4 quả', '5 quả', '6 quả'],
    correct: 1,
    hint: 'Mười bớt năm còn lại năm quả bóng bay xinh xắn!'
  },
  q_map4_subtraction_1: {
    id: 'q_map4_subtraction_1',
    skillId: 'subtraction',
    difficulty: 2,
    prompt: 'Trên đĩa có 3 cây kẹo 🍭🍭🍭, bé mời bạn Thỏ 1 cây. Trên đĩa còn mấy cây?',
    speak: 'Trên đĩa có ba cây kẹo, bé mời bạn Thỏ một cây. Trên đĩa còn lại mấy cây?',
    choices: ['1 cây', '2 cây', '3 cây'],
    correct: 1,
    hint: 'Ba bớt một thì còn hai cây kẹo ngọt ngào!'
  },
  q_map4_subtraction_2: {
    id: 'q_map4_subtraction_2',
    skillId: 'subtraction',
    difficulty: 2,
    prompt: 'Có 4 chiếc bánh quy gừng 🍪🍪🍪🍪, bé ăn 2 chiếc bánh. Còn lại mấy chiếc?',
    speak: 'Có bốn chiếc bánh quy gừng, bé ăn hai chiếc. Còn lại mấy chiếc bánh?',
    choices: ['1 chiếc', '2 chiếc', '3 chiếc'],
    correct: 1,
    hint: 'Bốn bớt hai thì còn hai chiếc bánh quy thơm lừng!'
  },
  q_map4_subtraction_3: {
    id: 'q_map4_subtraction_3',
    skillId: 'subtraction',
    difficulty: 3,
    prompt: 'Có 5 trái dâu phủ socola 🍓🍓🍓🍓🍓, rơi mất 1 trái. Còn lại mấy trái dâu?',
    speak: 'Có năm trái dâu phủ socola, rơi mất một trái. Còn lại mấy trái dâu trên đĩa?',
    choices: ['3 trái', '4 trái', '5 trái'],
    correct: 1,
    hint: 'Năm bớt một thì còn bốn trái dâu ngon lành!'
  },
  q_map4_subtraction_4: {
    id: 'q_map4_subtraction_4',
    skillId: 'subtraction',
    difficulty: 2,
    prompt: 'Bé cầm 3 que kem mát lạnh 🍦🍦🍦, bé cùng 2 bạn ăn hết cả 3 que. Còn lại mấy que kem?',
    speak: 'Bé cầm ba que kem mát lạnh, các bạn đã ăn hết cả ba que kem. Còn lại mấy que?',
    choices: ['0 que kem', '1 que kem', '2 que kem'],
    correct: 0,
    hint: 'Ăn hết cả 3 que thì không còn que nào, là số 0 tròn trĩnh!'
  },
  q_map4_subtraction_oranges: {
    id: 'q_map4_subtraction_oranges',
    skillId: 'subtraction',
    difficulty: 2,
    prompt: '6 quả cam 🍊🍊🍊🍊🍊🍊 - 2 quả cam 🍊🍊 = mấy quả cam?',
    speak: 'Sáu quả cam bớt đi hai quả cam thì còn lại mấy quả cam tất cả?',
    choices: ['3 quả cam', '4 quả cam', '5 quả cam'],
    correct: 1,
    hint: 'Sáu bớt hai thì còn đúng 4 quả cam mọng nước bé nhé!'
  },
  q_map4_subtraction_apples: {
    id: 'q_map4_subtraction_apples',
    skillId: 'subtraction',
    difficulty: 2,
    prompt: '5 quả táo đỏ 🍎🍎🍎🍎🍎 - 2 quả táo 🍎🍎 = mấy quả táo?',
    speak: 'Năm quả táo đỏ bé ăn mất hai quả thì còn lại mấy quả táo?',
    choices: ['2 quả táo', '3 quả táo', '4 quả táo'],
    correct: 1,
    hint: 'Năm bớt hai thì còn ba quả táo đỏ tươi giòn ngọt!'
  },
  q_map4_subtraction_strawberries: {
    id: 'q_map4_subtraction_strawberries',
    skillId: 'subtraction',
    difficulty: 2,
    prompt: '4 quả dâu tây 🍓🍓🍓🍓 - 1 quả dâu tây 🍓 = mấy quả dâu?',
    speak: 'Bốn quả dâu tây bớt đi một quả dâu tây thì còn lại mấy quả dâu?',
    choices: ['2 quả dâu', '3 quả dâu', '4 quả dâu'],
    correct: 1,
    hint: 'Bốn bớt một thì còn lại 3 quả dâu tây xinh xắn!'
  },
  q_map4_subtraction_bananas: {
    id: 'q_map4_subtraction_bananas',
    skillId: 'subtraction',
    difficulty: 2,
    prompt: '5 quả chuối 🍌🍌🍌🍌🍌 - 3 quả chuối 🍌🍌🍌 = mấy quả chuối?',
    speak: 'Năm quả chuối tặng bạn ba quả thì còn lại mấy quả chuối?',
    choices: ['1 quả chuối', '2 quả chuối', '3 quả chuối'],
    correct: 1,
    hint: 'Năm bớt ba thì còn lại đúng 2 quả chuối vàng thơm!'
  },
  q_math_oranges_add_4_2: {
    id: 'q_math_oranges_add_4_2',
    skillId: 'addition',
    difficulty: 2,
    prompt: '4 quả cam 🍊🍊🍊🍊 + 2 quả cam 🍊🍊 = mấy quả cam?',
    speak: 'Bốn quả cam cộng hai quả cam bằng mấy quả cam tất cả?',
    choices: ['5 quả cam', '6 quả cam', '7 quả cam'],
    correct: 1,
    hint: 'Bốn quả cam thêm hai quả cam nữa là có tất cả 6 quả cam mọng nước!'
  },
  q_map4_boss_p1: {
    id: 'q_map4_boss_p1',
    skillId: 'subtraction',
    difficulty: 2,
    prompt: 'Thần Nhân Sư Pha 1: 8 tia nắng vàng ☀️☀️☀️☀️☀️☀️☀️☀️, mây sa mạc che bớt 3 tia nắng. Còn lại mấy tia nắng chiếu sáng?',
    speak: 'Thần Nhân Sư Pha 1: Có tám tia nắng vàng, mây sa mạc che bớt ba tia nắng. Còn lại mấy tia nắng chiếu sáng rực rỡ?',
    countItem: '/assets/edu/shapes/shape_star.png',
    choices: ['4 tia nắng', '5 tia nắng', '6 tia nắng'],
    correct: 1,
    hint: 'Tám bớt ba còn đúng năm tia nắng mặt trời ấm áp!'
  },
  q_map4_boss_p2: {
    id: 'q_map4_boss_p2',
    skillId: 'subtraction',
    difficulty: 3,
    prompt: 'Thần Nhân Sư Pha 2: Ốc đảo có 10 bình nước mát 🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺, chia cho các bạn du mục 5 bình. Còn lại mấy bình nước?',
    speak: 'Thần Nhân Sư Pha 2: Ốc đảo có mười bình nước mát, chia cho các bạn du mục năm bình. Còn lại mấy bình nước mát trong lành?',
    countItem: '/assets/edu/shapes/shape_heart.png',
    choices: ['4 bình', '5 bình', '6 bình'],
    correct: 1,
    hint: 'Mười bớt năm còn lại đúng năm bình nước ngọt mát kết bạn cùng Thần Nhân Sư!'
  },
  q_map4_boss: {
    id: 'q_map4_boss',
    skillId: 'subtraction',
    difficulty: 3,
    prompt: 'Trên bệ thờ có 7 bông hoa sen đá sa mạc 🌺, bé tưới nước cho 3 bông hoa. Còn lại mấy bông hoa đang chờ bé tưới?',
    speak: 'Trên bệ thờ có bảy bông hoa sen đá sa mạc, bé tưới nước cho ba bông hoa. Còn lại mấy bông hoa đang chờ bé?',
    countItem: '/assets/edu/flower_sakura.svg',
    choices: ['3 bông', '4 bông', '5 bông'],
    correct: 1,
    hint: 'Bảy bớt ba còn lại bốn bông hoa sen đá sa mạc kiên cường!'
  },

  // ==============================================
  // === VÙNG 5: SO SÁNH LỚN / BÉ / BẰNG NHAU (HẺM NÚI) ===
  // ==============================================
  q_map5_comparison_1: {
    id: 'q_map5_comparison_1',
    skillId: 'comparison',
    difficulty: 2,
    prompt: 'Giữa số 3 và số 5, số nào lớn hơn hả bé?',
    speak: 'Giữa số ba và số năm, số nào lớn hơn hả bé?',
    choices: ['Số 3', 'Số 5', 'Hai số bằng nhau'],
    correct: 1,
    hint: 'Năm cái kẹo thì nhiều hơn ba cái kẹo, vậy số 5 lớn hơn số 3!'
  },
  q_map5_comparison_2: {
    id: 'q_map5_comparison_2',
    skillId: 'comparison',
    difficulty: 2,
    prompt: 'Đĩa A có 4 quả cam 🍊🍊🍊🍊, đĩa B có 2 quả cam 🍊🍊. Đĩa nào có nhiều quả hơn?',
    speak: 'Đĩa A có bốn quả cam, đĩa B có hai quả cam. Đĩa nào có nhiều quả hơn hả bé?',
    choices: ['Đĩa A nhiều hơn', 'Đĩa B nhiều hơn', 'Hai đĩa bằng nhau'],
    correct: 0,
    hint: 'Bốn quả cam thì nhiều hơn hai quả cam, nên đĩa A nhiều hơn!'
  },
  q_map5_comparison_3: {
    id: 'q_map5_comparison_3',
    skillId: 'comparison',
    difficulty: 2,
    prompt: 'Bên trái có 3 hạt dẻ 🌰🌰🌰, bên phải có 3 hạt dẻ 🌰🌰🌰. Hai bên thế nào với nhau?',
    speak: 'Bên trái có ba hạt dẻ, bên phải cũng có ba hạt dẻ. Hai bên thế nào với nhau?',
    choices: ['Bên trái nhiều hơn', 'Bên phải nhiều hơn', 'Hai bên bằng nhau'],
    correct: 2,
    hint: 'Số lượng hai bên đều là 3, vậy là bằng nhau đó bé!'
  },
  q_map5_comparison_4: {
    id: 'q_map5_comparison_4',
    skillId: 'comparison',
    difficulty: 1,
    prompt: 'Bạn nào cao lớn hơn: Bạn Hươu cao cổ 🦒 hay bạn Chuột nhỏ 🐭?',
    speak: 'Bạn nào cao lớn hơn: Bạn Hươu cao cổ hay bạn Chuột nhỏ xíu?',
    choices: ['Bạn Hươu cao cổ cao hơn', 'Bạn Chuột cao hơn', 'Hai bạn bằng nhau'],
    correct: 0,
    hint: 'Bạn Hươu có chiếc cổ dài chạm tới mây, cao lớn hơn bạn Chuột rất nhiều!'
  },
  q_map5_boss_p1: {
    id: 'q_map5_boss_p1',
    skillId: 'comparison',
    difficulty: 2,
    prompt: 'Cú Thông Thái Pha 1: Rổ A có 1 quả trứng 🥚, rổ B có 4 quả trứng 🥚🥚🥚🥚. Rổ nào ít hơn?',
    speak: 'Cú Thông Thái Pha 1: Rổ A có một quả trứng, rổ B có bốn quả trứng. Rổ nào ít hơn hả bé?',
    choices: ['Rổ A ít hơn', 'Rổ B ít hơn', 'Hai rổ bằng nhau'],
    correct: 0,
    hint: 'Một quả trứng thì ít hơn bốn quả trứng, nên rổ A ít hơn!'
  },
  q_map5_boss_p2: {
    id: 'q_map5_boss_p2',
    skillId: 'comparison',
    difficulty: 3,
    prompt: 'Cú Thông Thái Pha 2: Cành cây có 5 chiếc lá 🍃, cành kia cũng có 5 chiếc lá 🍃. So sánh hai cành cây?',
    speak: 'Cú Thông Thái Pha 2: Hai cành cây đều có năm chiếc lá. So sánh hai cành cây thế nào?',
    choices: ['Cành thứ nhất nhiều hơn', 'Cành thứ hai nhiều hơn', 'Hai cành bằng nhau'],
    correct: 2,
    hint: 'Cả hai cành đều có 5 chiếc lá, nên hai cành bằng nhau!'
  },
  q_map5_boss: {
    id: 'q_map5_boss',
    skillId: 'comparison',
    difficulty: 3,
    prompt: 'Cây nào cao hơn: Cây dừa cao vút 🌴 hay cây nấm nhỏ 🍄?',
    speak: 'Cây nào cao hơn: Cây dừa cao vút hay cây nấm nhỏ?',
    choices: ['Cây dừa cao hơn', 'Cây nấm cao hơn', 'Bằng nhau'],
    correct: 0,
    hint: 'Cây dừa vươn tận trời mây, cao hơn rất nhiều so với cây nấm ở dưới mặt đất!'
  },

  // =======================================================
  // === VÙNG 6: DÃY QUY LUẬT & ÔN TẬP TỔNG HỢP (THẦN LONG) ===
  // =======================================================
  q_map6_pattern_1: {
    id: 'q_map6_pattern_1',
    skillId: 'pattern',
    difficulty: 3,
    prompt: 'Bé tìm hình tiếp theo: 🔴 🟡 🔴 🟡 🔴 ...?',
    speak: 'Bé tìm hình tiếp theo của dãy quy luật: Đỏ, Vàng, Đỏ, Vàng, Đỏ, rồi đến gì?',
    choices: ['Hình Tròn Đỏ 🔴', 'Hình Tròn Vàng 🟡', 'Hình Tròn Xanh 🔵'],
    correct: 1,
    hint: 'Cứ một hình đỏ rồi đến một hình vàng xen kẽ nhau đó bé!'
  },
  q_map6_pattern_2: {
    id: 'q_map6_pattern_2',
    skillId: 'pattern',
    difficulty: 3,
    prompt: 'Bé tìm hình tiếp theo của chuỗi: 🟦 🔺 🟦 🔺 🟦 ...?',
    speak: 'Bé tìm hình tiếp theo của chuỗi: Vuông, Tam giác, Vuông, Tam giác, Vuông, rồi đến gì?',
    choices: ['Hình Vuông 🟦', 'Hình Tam Giác 🔺', 'Hình Tròn 🟡'],
    correct: 1,
    hint: 'Sau hình vuông màu xanh là chiếc nón hình tam giác màu đỏ nè!'
  },
  q_map6_pattern_3: {
    id: 'q_map6_pattern_3',
    skillId: 'pattern',
    difficulty: 2,
    prompt: 'Đếm xuôi dãy số tự nhiên: 1, 2, 3, 4, ...?',
    speak: 'Đếm xuôi dãy số tự nhiên: một, hai, ba, bốn, rồi đến số mấy hả bé?',
    choices: ['Số 5', 'Số 6', 'Số 7'],
    correct: 0,
    hint: 'Sau số bốn là số năm đáng yêu đó bé!'
  },
  q_map6_pattern_4: {
    id: 'q_map6_pattern_4',
    skillId: 'pattern',
    difficulty: 2,
    prompt: 'Dãy quy luật bầu trời: ☀️ 🌙 ☀️ 🌙 ☀️ ...?',
    speak: 'Dãy quy luật ngày và đêm: Mặt trời, Mặt trăng, Mặt trời, Mặt trăng, Mặt trời, rồi đến gì?',
    choices: ['Mặt trời ☀️', 'Mặt trăng 🌙', 'Ngôi sao ⭐'],
    correct: 1,
    hint: 'Ban ngày có mặt trời chiếu sáng, ban đêm có mặt trăng hiền hòa!'
  },
  q_map6_boss_p1: {
    id: 'q_map6_boss_p1',
    skillId: 'pattern',
    difficulty: 3,
    prompt: 'Thần Long Pha 1: Tìm quả tiếp theo: 🍎 🍌 🍎 🍌 🍎 ...?',
    speak: 'Thần Long Pha 1: Táo, Chuối, Táo, Chuối, Táo, rồi đến quả gì tiếp theo hả bé?',
    choices: ['Quả Táo 🍎', 'Quả Chuối 🍌', 'Quả Dưa Hấu 🍉'],
    correct: 1,
    hint: 'Sau quả táo đỏ ngọt lịm là quả chuối vàng cong cong!'
  },
  q_map6_boss_p2: {
    id: 'q_map6_boss_p2',
    skillId: 'synthesis',
    difficulty: 3,
    prompt: 'Thần Long Pha 2: Cầu vồng kỳ diệu trên bầu trời có mấy màu sắc?',
    speak: 'Thần Long Pha 2: Cầu vồng kỳ diệu trên bầu trời có mấy màu sắc tất cả?',
    choices: ['5 màu', '6 màu', '7 màu rực rỡ'],
    correct: 2,
    hint: 'Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím — tất cả có đúng 7 màu tươi sáng!'
  },
  q_map6_boss: {
    id: 'q_map6_boss',
    skillId: 'synthesis',
    difficulty: 3,
    prompt: 'Thần Long hỏi bé: Cầu vồng kỳ diệu trên bầu trời có mấy màu sắc?',
    speak: 'Thần Long hỏi bé: Cầu vồng kỳ diệu trên bầu trời có mấy màu sắc?',
    choices: ['5 màu', '6 màu', '7 màu rực rỡ'],
    correct: 2,
    hint: 'Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím — tất cả có 7 màu tươi sáng!'
  },

  // ==========================================================================
  // === NÂNG CẤP LỚN: HỆ THỐNG CÂU HỎI TRỰC QUAN MẦM NON 5-6 TUỔI (34 CÂU MỚI) ===
  // === HỌC LIỆU 3D CHIBI: GHÉP BÓNG, ĐẾM SỐ 3D, QUY LUẬT, TÌM KHÁC BIỆT ===
  // ==========================================================================
  q_map1_shadow_bunny: {
      "id": "q_map1_shadow_bunny",
      "skillId": "shadow_matching",
      "difficulty": 1,
      "type": "shadow_match",
      "image": "/assets/edu/animals/anim_bunny.png",
      "visualBadge": "Thỏ Trắng 🐰",
      "prompt": "Bé hãy tìm bóng của bạn Thỏ Trắng nhé!",
      "speak": "Bé hãy nhìn thật kỹ bạn thỏ trắng đáng yêu và tìm xem đâu là chiếc bóng của bạn ấy nhé!",
      "choices": [
          "Bóng 1",
          "Bóng 2",
          "Bóng 3"
      ],
      "choiceImages": [
          "/assets/edu/animals/anim_bear_shadow.png",
          "/assets/edu/animals/anim_bunny_shadow.png",
          "/assets/edu/animals/anim_frog_shadow.png"
      ],
      "correct": 1,
      "hint": "Bạn thỏ có đôi tai dài dựng đứng xinh xắn đó bé!"
  },
  q_map1_shadow_cat: {
      "id": "q_map1_shadow_cat",
      "skillId": "shadow_matching",
      "difficulty": 1,
      "type": "shadow_match",
      "image": "/assets/edu/animals/anim_cat.png",
      "visualBadge": "Mèo Con 🐱",
      "prompt": "Đâu là bóng của bạn Mèo Con vậy bé?",
      "speak": "Bé hãy tìm xem đâu là chiếc bóng của bạn mèo con mắt tròn xoe nhé!",
      "choices": [
          "Bóng 1",
          "Bóng 2",
          "Bóng 3"
      ],
      "choiceImages": [
          "/assets/edu/animals/anim_cat_shadow.png",
          "/assets/edu/animals/anim_dog_shadow.png",
          "/assets/edu/animals/anim_duck_shadow.png"
      ],
      "correct": 0,
      "hint": "Bóng của bạn mèo có hai tai nhọn tam giác vểnh lên đó bé!"
  },
  q_map1_counting_ducks: {
      "id": "q_map1_counting_ducks",
      "skillId": "counting",
      "difficulty": 1,
      "type": "counting",
      "visualItems": [
          "/assets/edu/animals/anim_duck.png",
          "/assets/edu/animals/anim_duck.png",
          "/assets/edu/animals/anim_duck.png"
      ],
      "prompt": "Bé đếm xem có mấy bạn Vịt Vàng đang bơi?",
      "speak": "Bé hãy đếm xem trên màn hình có bao nhiêu bạn vịt con màu vàng nhé!",
      "choices": [
          "2",
          "3",
          "4"
      ],
      "correct": 1,
      "hint": "Cùng đếm với Bé Sâu nào: 1, 2, 3! Có 3 bạn vịt vàng!"
  },
  q_map1_counting_puppies: {
      "id": "q_map1_counting_puppies",
      "skillId": "counting",
      "difficulty": 1,
      "type": "counting",
      "visualItems": [
          "/assets/edu/animals/anim_dog.png",
          "/assets/edu/animals/anim_dog.png",
          "/assets/edu/animals/anim_dog.png",
          "/assets/edu/animals/anim_dog.png"
      ],
      "prompt": "Có bao nhiêu bạn Cún Con tinh nghịch?",
      "speak": "Bé hãy đếm xem có bao nhiêu bạn cún con đáng yêu đang vẫy đuôi nhé!",
      "choices": [
          "3",
          "4",
          "5"
      ],
      "correct": 1,
      "hint": "Bé đếm từng bạn cún nhé: 1, 2, 3, 4 bạn cún!"
  },
  q_map1_pattern_farm: {
      "id": "q_map1_pattern_farm",
      "skillId": "pattern",
      "difficulty": 1,
      "type": "pattern",
      "patternItems": [
          "/assets/edu/animals/anim_cat.png",
          "/assets/edu/animals/anim_dog.png",
          "/assets/edu/animals/anim_cat.png",
          "/assets/edu/animals/anim_dog.png",
          "?"
      ],
      "prompt": "Bé tìm bạn tiếp theo theo quy luật nhé!",
      "speak": "Mèo con, cún con, mèo con, cún con. Bạn tiếp theo là bạn nào vậy bé?",
      "choices": [
          "Mèo Con",
          "Cún Con",
          "Gấu Nâu"
      ],
      "choiceImages": [
          "/assets/edu/animals/anim_cat.png",
          "/assets/edu/animals/anim_dog.png",
          "/assets/edu/animals/anim_bear.png"
      ],
      "correct": 0,
      "hint": "Sau bạn cún con lại đến lượt bạn mèo con đó bé!"
  },
  q_map1_odd_one_out: {
      "id": "q_map1_odd_one_out",
      "skillId": "observation",
      "difficulty": 1,
      "type": "odd_one_out",
      "prompt": "Bạn nào KHÁC BIỆT nhất so với các bạn còn lại?",
      "speak": "Trong bốn bạn sau đây, bạn nào khác biệt nhất vậy bé?",
      "choices": [
          "Mèo Con",
          "Thỏ Trắng",
          "Cún Con",
          "Cá Heo"
      ],
      "choiceImages": [
          "/assets/edu/animals/anim_cat.png",
          "/assets/edu/animals/anim_bunny.png",
          "/assets/edu/animals/anim_dog.png",
          "/assets/edu/animals/anim_whale.png"
      ],
      "correct": 3,
      "hint": "Mèo, thỏ và cún đi trên cạn, còn bạn cá heo biết bơi dưới nước nè!"
  },
  q_map2_shadow_turtle: {
      "id": "q_map2_shadow_turtle",
      "skillId": "shadow_matching",
      "difficulty": 1,
      "type": "shadow_match",
      "image": "/assets/edu/animals/anim_turtle.png",
      "visualBadge": "Rùa Biển 🐢",
      "prompt": "Đâu là bóng của bạn Rùa Biển?",
      "speak": "Bé hãy tìm chiếc bóng mai tròn xinh của bạn rùa biển nhé!",
      "choices": [
          "Bóng 1",
          "Bóng 2",
          "Bóng 3"
      ],
      "choiceImages": [
          "/assets/edu/animals/anim_crab_shadow.png",
          "/assets/edu/animals/anim_turtle_shadow.png",
          "/assets/edu/animals/anim_whale_shadow.png"
      ],
      "correct": 1,
      "hint": "Bạn rùa biển có chiếc mai tròn và bốn chiếc vây bơi đó bé!"
  },
  q_map2_shadow_crab: {
      "id": "q_map2_shadow_crab",
      "skillId": "shadow_matching",
      "difficulty": 1,
      "type": "shadow_match",
      "image": "/assets/edu/animals/anim_crab.png",
      "visualBadge": "Cua Nhỏ 🦀",
      "prompt": "Tìm bóng của bạn Cua Nhỏ giơ hai càng tròn!",
      "speak": "Bé hãy tìm xem đâu là chiếc bóng của bạn cua nhỏ đang giơ hai càng nhé!",
      "choices": [
          "Bóng 1",
          "Bóng 2",
          "Bóng 3"
      ],
      "choiceImages": [
          "/assets/edu/animals/anim_crab_shadow.png",
          "/assets/edu/animals/anim_bee_shadow.png",
          "/assets/edu/animals/anim_turtle_shadow.png"
      ],
      "correct": 0,
      "hint": "Chiếc bóng có hai chiếc càng nhô lên cao chính là bạn cua đó!"
  },
  q_map2_counting_crabs: {
      "id": "q_map2_counting_crabs",
      "skillId": "counting",
      "difficulty": 1,
      "type": "counting",
      "visualItems": [
          "/assets/edu/animals/anim_crab.png",
          "/assets/edu/animals/anim_crab.png",
          "/assets/edu/animals/anim_crab.png",
          "/assets/edu/animals/anim_crab.png",
          "/assets/edu/animals/anim_crab.png"
      ],
      "prompt": "Có bao nhiêu bạn Cua Đỏ trên bãi cát?",
      "speak": "Bé hãy đếm xem có bao nhiêu bạn cua đỏ đang bò trên bãi cát nhé!",
      "choices": [
          "4",
          "5",
          "6"
      ],
      "correct": 1,
      "hint": "Bé đếm từng bạn cua: 1, 2, 3, 4, 5 bạn cua đỏ!"
  },
  q_map2_counting_turtles: {
      "id": "q_map2_counting_turtles",
      "skillId": "counting",
      "difficulty": 1,
      "type": "counting",
      "visualItems": [
          "/assets/edu/animals/anim_turtle.png",
          "/assets/edu/animals/anim_turtle.png",
          "/assets/edu/animals/anim_turtle.png"
      ],
      "prompt": "Có mấy bạn Rùa Biển bơi dưới làn nước trong xanh?",
      "speak": "Có mấy bạn rùa biển đang bơi lội vậy bé?",
      "choices": [
          "2",
          "3",
          "4"
      ],
      "correct": 1,
      "hint": "Có tất cả 3 bạn rùa biển xanh ngọc!"
  },
  q_map2_pattern_ocean: {
      "id": "q_map2_pattern_ocean",
      "skillId": "pattern",
      "difficulty": 1,
      "type": "pattern",
      "patternItems": [
          "/assets/edu/animals/anim_turtle.png",
          "/assets/edu/animals/anim_crab.png",
          "/assets/edu/animals/anim_turtle.png",
          "/assets/edu/animals/anim_crab.png",
          "?"
      ],
      "prompt": "Bạn sinh vật biển tiếp theo là bạn nào?",
      "speak": "Rùa biển, cua nhỏ, rùa biển, cua nhỏ. Bạn tiếp theo là bạn nào?",
      "choices": [
          "Rùa Biển",
          "Cua Nhỏ",
          "Cá Heo"
      ],
      "choiceImages": [
          "/assets/edu/animals/anim_turtle.png",
          "/assets/edu/animals/anim_crab.png",
          "/assets/edu/animals/anim_whale.png"
      ],
      "correct": 0,
      "hint": "Quy luật lặp lại: Rùa rồi lại đến Cua, tiếp theo là bạn Rùa biển!"
  },
  q_map2_odd_one_out: {
      "id": "q_map2_odd_one_out",
      "skillId": "observation",
      "difficulty": 1,
      "type": "odd_one_out",
      "prompt": "Bạn nào KHÔNG SỐNG ở dưới biển?",
      "speak": "Trong bốn bạn này, bạn nào không phải là sinh vật dưới nước vậy bé?",
      "choices": [
          "Rùa Biển",
          "Cá Heo",
          "Mèo Con",
          "Cua Nhỏ"
      ],
      "choiceImages": [
          "/assets/edu/animals/anim_turtle.png",
          "/assets/edu/animals/anim_whale.png",
          "/assets/edu/animals/anim_cat.png",
          "/assets/edu/animals/anim_crab.png"
      ],
      "correct": 2,
      "hint": "Bạn mèo con sống trên cạn, bạn ấy sợ nước đó bé!"
  },
  q_map3_shadow_car: {
      "id": "q_map3_shadow_car",
      "skillId": "shadow_matching",
      "difficulty": 1,
      "type": "shadow_match",
      "image": "/assets/edu/toys/toy_car.png",
      "visualBadge": "Ô Tô Đỏ 🚗",
      "prompt": "Bé hãy tìm bóng của chiếc Ô Tô con màu đỏ!",
      "speak": "Bé hãy tìm xem đâu là chiếc bóng của chiếc ô tô đồ chơi màu đỏ nhé!",
      "choices": [
          "Bóng 1",
          "Bóng 2",
          "Bóng 3"
      ],
      "choiceImages": [
          "/assets/edu/toys/toy_plane_shadow.png",
          "/assets/edu/toys/toy_car_shadow.png",
          "/assets/edu/toys/toy_boat_shadow.png"
      ],
      "correct": 1,
      "hint": "Bóng của ô tô có bánh xe tròn lăn bon bon trên đường nè!"
  },
  q_map3_shadow_plane: {
      "id": "q_map3_shadow_plane",
      "skillId": "shadow_matching",
      "difficulty": 1,
      "type": "shadow_match",
      "image": "/assets/edu/toys/toy_plane.png",
      "visualBadge": "Máy Bay ✈️",
      "prompt": "Đâu là bóng của chiếc Máy Bay cánh vàng?",
      "speak": "Bé hãy tìm chiếc bóng có đôi cánh sải rộng của chiếc máy bay nhé!",
      "choices": [
          "Bóng 1",
          "Bóng 2",
          "Bóng 3"
      ],
      "choiceImages": [
          "/assets/edu/toys/toy_boat_shadow.png",
          "/assets/edu/toys/toy_balloon_shadow.png",
          "/assets/edu/toys/toy_plane_shadow.png"
      ],
      "correct": 2,
      "hint": "Chiếc bóng có hai cánh vươn dài bay lượn trên bầu trời!"
  },
  q_map3_counting_balloons: {
      "id": "q_map3_counting_balloons",
      "skillId": "counting",
      "difficulty": 1,
      "type": "counting",
      "visualItems": [
          "/assets/edu/toys/toy_balloon.png",
          "/assets/edu/toys/toy_balloon.png",
          "/assets/edu/toys/toy_balloon.png",
          "/assets/edu/toys/toy_balloon.png",
          "/assets/edu/toys/toy_balloon.png",
          "/assets/edu/toys/toy_balloon.png"
      ],
      "prompt": "Bé đếm xem có bao nhiêu chùm Bóng Bay bay trên trời?",
      "speak": "Có bao nhiêu chùm bóng bay sắc màu rực rỡ vậy bé?",
      "choices": [
          "5",
          "6",
          "7"
      ],
      "correct": 1,
      "hint": "Có tất cả 6 chùm bóng bay bay bổng trong gió!"
  },
  q_map3_counting_cars: {
      "id": "q_map3_counting_cars",
      "skillId": "counting",
      "difficulty": 1,
      "type": "counting",
      "visualItems": [
          "/assets/edu/toys/toy_car.png",
          "/assets/edu/toys/toy_car.png",
          "/assets/edu/toys/toy_car.png",
          "/assets/edu/toys/toy_car.png"
      ],
      "prompt": "Có mấy chiếc Ô Tô đồ chơi đang đỗ trong bãi?",
      "speak": "Có bao nhiêu chiếc ô tô con màu đỏ vậy bé?",
      "choices": [
          "3",
          "4",
          "5"
      ],
      "correct": 1,
      "hint": "Đếm cùng Bé Sâu: 1, 2, 3, 4 chiếc ô tô!"
  },
  q_map3_pattern_vehicles: {
      "id": "q_map3_pattern_vehicles",
      "skillId": "pattern",
      "difficulty": 1,
      "type": "pattern",
      "patternItems": [
          "/assets/edu/toys/toy_car.png",
          "/assets/edu/toys/toy_plane.png",
          "/assets/edu/toys/toy_car.png",
          "/assets/edu/toys/toy_plane.png",
          "?"
      ],
      "prompt": "Phương tiện tiếp theo là gì vậy bé?",
      "speak": "Ô tô, máy bay, ô tô, máy bay. Tiếp theo là phương tiện gì bé nhỉ?",
      "choices": [
          "Ô Tô",
          "Máy Bay",
          "Thuyền Buồm"
      ],
      "choiceImages": [
          "/assets/edu/toys/toy_car.png",
          "/assets/edu/toys/toy_plane.png",
          "/assets/edu/toys/toy_boat.png"
      ],
      "correct": 0,
      "hint": "Sau chiếc máy bay lại đến lượt chiếc ô tô đồ chơi màu đỏ!"
  },
  q_map3_odd_one_out: {
      "id": "q_map3_odd_one_out",
      "skillId": "observation",
      "difficulty": 1,
      "type": "odd_one_out",
      "prompt": "Món nào KHÔNG PHẢI là đồ chơi?",
      "speak": "Trong bốn món sau đây, món nào là đồ ăn chứ không phải đồ chơi?",
      "choices": [
          "Ô Tô",
          "Máy Bay",
          "Quả Táo",
          "Thuyền Buồm"
      ],
      "choiceImages": [
          "/assets/edu/toys/toy_car.png",
          "/assets/edu/toys/toy_plane.png",
          "/assets/edu/fruit_apple.svg",
          "/assets/edu/toys/toy_boat.png"
      ],
      "correct": 2,
      "hint": "Quả táo là trái cây thơm ngon để ăn, không phải đồ chơi bé nhé!"
  },
  q_map4_shadow_bear: {
      "id": "q_map4_shadow_bear",
      "skillId": "shadow_matching",
      "difficulty": 2,
      "type": "shadow_match",
      "image": "/assets/edu/toys/toy_teddy.png",
      "visualBadge": "Gấu Bông 🧸",
      "prompt": "Tìm bóng của bạn Gấu Bông nơ chấm bi!",
      "speak": "Bé hãy tìm xem đâu là chiếc bóng của bạn gấu bông teddy đeo nơ nhé!",
      "choices": [
          "Bóng 1",
          "Bóng 2",
          "Bóng 3"
      ],
      "choiceImages": [
          "/assets/edu/toys/toy_teddy_shadow.png",
          "/assets/edu/toys/toy_drum_shadow.png",
          "/assets/edu/toys/toy_umbrella_shadow.png"
      ],
      "correct": 0,
      "hint": "Chiếc bóng có hai tai tròn xoe và hai tay dang rộng của bạn gấu bông!"
  },
  q_map4_shadow_drum: {
      "id": "q_map4_shadow_drum",
      "skillId": "shadow_matching",
      "difficulty": 2,
      "type": "shadow_match",
      "image": "/assets/edu/toys/toy_drum.png",
      "visualBadge": "Trống Đồ Chơi 🥁",
      "prompt": "Bé tìm bóng của chiếc Trống Đồ Chơi nhé!",
      "speak": "Đâu là chiếc bóng của chiếc trống đồ chơi có dùi gõ vậy bé?",
      "choices": [
          "Bóng 1",
          "Bóng 2",
          "Bóng 3"
      ],
      "choiceImages": [
          "/assets/edu/toys/toy_ball_shadow.png",
          "/assets/edu/toys/toy_drum_shadow.png",
          "/assets/edu/toys/toy_blocks_shadow.png"
      ],
      "correct": 1,
      "hint": "Chiếc bóng tròn có hai thanh dùi trống nhỏ xinh xắn!"
  },
  q_map4_counting_lollipops: {
      "id": "q_map4_counting_lollipops",
      "skillId": "counting",
      "difficulty": 2,
      "type": "counting",
      "visualItems": [
          "/assets/edu/toys/toy_lollipop.png",
          "/assets/edu/toys/toy_lollipop.png",
          "/assets/edu/toys/toy_lollipop.png",
          "/assets/edu/toys/toy_lollipop.png",
          "/assets/edu/toys/toy_lollipop.png"
      ],
      "prompt": "Có bao nhiêu cây Kẹo Mút Cầu Vồng ngọt ngào?",
      "speak": "Bé đếm xem có bao nhiêu cây kẹo mút xoắn ốc cầu vồng nhé!",
      "choices": [
          "4",
          "5",
          "6"
      ],
      "correct": 1,
      "hint": "Bé đếm từng cây kẹo mút: 1, 2, 3, 4, 5 cây kẹo mút thơm ngon!"
  },
  q_map4_visual_math_plus: {
      "id": "q_map4_visual_math_plus",
      "skillId": "math",
      "difficulty": 2,
      "type": "visual_math",
      "prompt": "3 quả bóng 🎈🎈🎈 + 2 quả bóng 🎈🎈 = mấy quả bóng?",
      "speak": "Ba quả bóng bay thêm hai quả bóng bay nữa là có tất cả bao nhiêu quả bóng bay?",
      "choices": [
          "4",
          "5",
          "6"
      ],
      "correct": 1,
      "hint": "Ba cộng hai bằng năm quả bóng bay rực rỡ!"
  },
  q_map4_pattern_sweets: {
      "id": "q_map4_pattern_sweets",
      "skillId": "pattern",
      "difficulty": 2,
      "type": "pattern",
      "patternItems": [
          "/assets/edu/toys/toy_icecream.png",
          "/assets/edu/toys/toy_lollipop.png",
          "/assets/edu/toys/toy_icecream.png",
          "/assets/edu/toys/toy_lollipop.png",
          "?"
      ],
      "prompt": "Món tráng miệng tiếp theo là món nào?",
      "speak": "Kem ốc quế, kẹo mút, kem ốc quế, kẹo mút. Món tiếp theo là món gì bé nhỉ?",
      "choices": [
          "Kem Ốc Quế",
          "Kẹo Mút",
          "Bánh Mì"
      ],
      "choiceImages": [
          "/assets/edu/toys/toy_icecream.png",
          "/assets/edu/toys/toy_lollipop.png",
          "/assets/cooking/ingredients/ing_bread.png"
      ],
      "correct": 0,
      "hint": "Tiếp theo là cây kem ốc quế 3 tầng mát lạnh!"
  },
  q_map4_compare_trays: {
      "id": "q_map4_compare_trays",
      "skillId": "comparison",
      "difficulty": 2,
      "type": "comparison",
      "compareTrays": {
          "a": [
              "/assets/edu/toys/toy_car.png",
              "/assets/edu/toys/toy_car.png",
              "/assets/edu/toys/toy_car.png",
              "/assets/edu/toys/toy_car.png"
          ],
          "b": [
              "/assets/edu/toys/toy_car.png",
              "/assets/edu/toys/toy_car.png"
          ]
      },
      "prompt": "Khay nào có NHIỀU ô tô hơn?",
      "speak": "Khay A có bốn chiếc ô tô, khay B có hai chiếc ô tô. Khay nào có nhiều ô tô hơn vậy bé?",
      "choices": [
          "Khay A (4)",
          "Khay B (2)"
      ],
      "correct": 0,
      "hint": "Khay A có 4 chiếc ô tô, nhiều hơn khay B chỉ có 2 chiếc!"
  },
  q_map5_shadow_boat: {
      "id": "q_map5_shadow_boat",
      "skillId": "shadow_matching",
      "difficulty": 2,
      "type": "shadow_match",
      "image": "/assets/edu/toys/toy_boat.png",
      "visualBadge": "Thuyền Buồm ⛵",
      "prompt": "Tìm bóng của chiếc Thuyền Buồm rẽ sóng!",
      "speak": "Bé hãy tìm xem đâu là chiếc bóng của chiếc thuyền buồm cánh sọc nhé!",
      "choices": [
          "Bóng 1",
          "Bóng 2",
          "Bóng 3"
      ],
      "choiceImages": [
          "/assets/edu/toys/toy_boat_shadow.png",
          "/assets/edu/toys/toy_umbrella_shadow.png",
          "/assets/edu/toys/toy_partyhat_shadow.png"
      ],
      "correct": 0,
      "hint": "Bóng của chiếc thuyền buồm có cánh buồm tam giác no gió!"
  },
  q_map5_counting_blocks: {
      "id": "q_map5_counting_blocks",
      "skillId": "counting",
      "difficulty": 2,
      "type": "counting",
      "visualItems": [
          "/assets/edu/toys/toy_blocks.png",
          "/assets/edu/toys/toy_blocks.png",
          "/assets/edu/toys/toy_blocks.png",
          "/assets/edu/toys/toy_blocks.png",
          "/assets/edu/toys/toy_blocks.png",
          "/assets/edu/toys/toy_blocks.png",
          "/assets/edu/toys/toy_blocks.png"
      ],
      "prompt": "Có bao nhiêu khối gỗ xếp hình rực rỡ?",
      "speak": "Bé hãy đếm xem có bao nhiêu bộ khối gỗ xếp hình chữ số nhé!",
      "choices": [
          "6",
          "7",
          "8"
      ],
      "correct": 1,
      "hint": "Bé đếm cẩn thận nhé, có tất cả 7 bộ khối gỗ xếp hình!"
  },
  q_map5_visual_math_minus: {
      "id": "q_map5_visual_math_minus",
      "skillId": "math",
      "difficulty": 2,
      "type": "visual_math",
      "prompt": "5 chiếc ô tô 🚗🚗🚗🚗🚗 bớt đi 2 chiếc ô tô 🚗🚗 = mấy chiếc ô tô?",
      "speak": "Năm chiếc ô tô bớt đi hai chiếc ô tô thì còn lại mấy chiếc ô tô vậy bé?",
      "choices": [
          "2",
          "3",
          "4"
      ],
      "correct": 1,
      "hint": "Năm bớt hai thì còn lại ba chiếc ô tô bon bon!"
  },
  q_map5_compare_animals: {
      "id": "q_map5_compare_animals",
      "skillId": "comparison",
      "difficulty": 2,
      "type": "comparison",
      "compareTrays": {
          "a": [
              "/assets/edu/animals/anim_dog.png",
              "/assets/edu/animals/anim_dog.png"
          ],
          "b": [
              "/assets/edu/animals/anim_dog.png",
              "/assets/edu/animals/anim_dog.png",
              "/assets/edu/animals/anim_dog.png",
              "/assets/edu/animals/anim_dog.png",
              "/assets/edu/animals/anim_dog.png"
          ]
      },
      "prompt": "Khay nào có NHIỀU bạn Cún Con hơn?",
      "speak": "Khay A có hai bạn cún, khay B có năm bạn cún. Khay nào có nhiều bạn cún hơn vậy bé?",
      "choices": [
          "Khay A (2)",
          "Khay B (5)"
      ],
      "correct": 1,
      "hint": "Khay B có 5 bạn cún, đông vui hơn khay A!"
  },
  q_map5_pattern_advanced: {
      "id": "q_map5_pattern_advanced",
      "skillId": "pattern",
      "difficulty": 2,
      "type": "pattern",
      "patternItems": [
          "/assets/edu/animals/anim_frog.png",
          "/assets/edu/animals/anim_duck.png",
          "/assets/edu/animals/anim_frog.png",
          "/assets/edu/animals/anim_duck.png",
          "?"
      ],
      "prompt": "Bé tìm bạn nhỏ tiếp theo theo quy luật nhé!",
      "speak": "Ếch xanh, vịt vàng, ếch xanh, vịt vàng. Bạn tiếp theo là bạn nào?",
      "choices": [
          "Ếch Xanh",
          "Vịt Vàng",
          "Cánh Cụt"
      ],
      "choiceImages": [
          "/assets/edu/animals/anim_frog.png",
          "/assets/edu/animals/anim_duck.png",
          "/assets/edu/animals/anim_penguin.png"
      ],
      "correct": 0,
      "hint": "Sau bạn vịt vàng là bạn ếch xanh nhảy ộp ộp!"
  },
  q_map6_shadow_penguin: {
      "id": "q_map6_shadow_penguin",
      "skillId": "shadow_matching",
      "difficulty": 2,
      "type": "shadow_match",
      "image": "/assets/edu/animals/anim_penguin.png",
      "visualBadge": "Chim Cánh Cụt 🐧",
      "prompt": "Tìm bóng của bạn Chim Cánh Cụt mập mạp!",
      "speak": "Đâu là chiếc bóng của bạn chim cánh cụt má hồng chân cam vậy bé?",
      "choices": [
          "Bóng 1",
          "Bóng 2",
          "Bóng 3"
      ],
      "choiceImages": [
          "/assets/edu/animals/anim_duck_shadow.png",
          "/assets/edu/animals/anim_penguin_shadow.png",
          "/assets/edu/animals/anim_bear_shadow.png"
      ],
      "correct": 1,
      "hint": "Chiếc bóng có đôi cánh nhỏ xuôi theo thân hình tròn trịa của bạn cánh cụt!"
  },
  q_map6_counting_frogs: {
      "id": "q_map6_counting_frogs",
      "skillId": "counting",
      "difficulty": 2,
      "type": "counting",
      "visualItems": [
          "/assets/edu/animals/anim_frog.png",
          "/assets/edu/animals/anim_frog.png",
          "/assets/edu/animals/anim_frog.png",
          "/assets/edu/animals/anim_frog.png",
          "/assets/edu/animals/anim_frog.png",
          "/assets/edu/animals/anim_frog.png",
          "/assets/edu/animals/anim_frog.png",
          "/assets/edu/animals/anim_frog.png"
      ],
      "prompt": "Có bao nhiêu chú Ếch Xanh mắt to nhảy nhót?",
      "speak": "Bé hãy đếm xem có tất cả bao nhiêu chú ếch xanh nhé!",
      "choices": [
          "7",
          "8",
          "9"
      ],
      "correct": 1,
      "hint": "Bé đếm từng bạn ếch nhé: có tất cả 8 chú ếch xanh ngộ nghĩnh!"
  },
  q_map6_visual_math_sum: {
      "id": "q_map6_visual_math_sum",
      "skillId": "math",
      "difficulty": 2,
      "type": "visual_math",
      "prompt": "4 quả dâu 🍓🍓🍓🍓 + 3 quả dâu 🍓🍓🍓 = mấy quả dâu?",
      "speak": "Bốn quả dâu tây chín mọng cộng thêm ba quả dâu tây nữa là có mấy quả dâu tất cả?",
      "choices": [
          "6",
          "7",
          "8"
      ],
      "correct": 1,
      "hint": "Bốn cộng ba bằng bảy quả dâu tây ngọt ngào!"
  },
  q_map6_odd_advanced: {
      "id": "q_map6_odd_advanced",
      "skillId": "observation",
      "difficulty": 2,
      "type": "odd_one_out",
      "prompt": "Hình nào KHÔNG PHẢI là phương tiện di chuyển?",
      "speak": "Trong bốn món sau, món nào là cây kem chứ không phải xe cộ hay tàu bè?",
      "choices": [
          "Ô Tô",
          "Máy Bay",
          "Kem Ốc Quế",
          "Thuyền Buồm"
      ],
      "choiceImages": [
          "/assets/edu/toys/toy_car.png",
          "/assets/edu/toys/toy_plane.png",
          "/assets/edu/toys/toy_icecream.png",
          "/assets/edu/toys/toy_boat.png"
      ],
      "correct": 2,
      "hint": "Cây kem là món ăn mát lạnh thơm ngon, không phải phương tiện di chuyển!"
  },
  q_map6_pattern_grand: {
      "id": "q_map6_pattern_grand",
      "skillId": "pattern",
      "difficulty": 2,
      "type": "pattern",
      "patternItems": [
          "/assets/edu/animals/anim_bunny.png",
          "/assets/edu/animals/anim_bear.png",
          "/assets/edu/animals/anim_bunny.png",
          "/assets/edu/animals/anim_bear.png",
          "?"
      ],
      "prompt": "Bé hãy tìm bạn thú tiếp theo theo quy luật nhé!",
      "speak": "Thỏ trắng, gấu nâu, thỏ trắng, gấu nâu. Tiếp theo là bạn nào vậy bé?",
      "choices": [
          "Thỏ Trắng",
          "Gấu Nâu",
          "Ếch Xanh"
      ],
      "choiceImages": [
          "/assets/edu/animals/anim_bunny.png",
          "/assets/edu/animals/anim_bear.png",
          "/assets/edu/animals/anim_frog.png"
      ],
      "correct": 0,
      "hint": "Theo quy luật lặp lại, sau bạn gấu nâu là bạn thỏ trắng tai dài!"
  },

  // =========================================================================
  // === BỘ CÂU HỎI VƯỢT ẢI ĐA DẠNG: LẬT Ô, NỐI CỘT, KÉO THẢ (ĐỘ KHÓ TĂNG DẦN) ===
  // =========================================================================

  // --- VÙNG 1: LÀNG QUÊ YÊN BÌNH (ĐỘ KHÓ 1 - RẤT DỄ, TRỰC QUAN GẦN GŨI) ---
  q_map1_memory_animals: {
    id: 'q_map1_memory_animals',
    skillId: 'memory',
    type: 'memory_match',
    difficulty: 1,
    prompt: '🃏 Bé hãy lật tìm 2 cặp thẻ hình con vật giống nhau nhé! ✨',
    speak: 'Bé hãy lật tìm hai cặp thẻ hình con vật giống nhau nhé!',
    pairs: 2,
    maxMistakes: 2,
    cards: [
      { id: 'c1', label: '🐰 Thỏ Con' },
      { id: 'c2', label: '🐶 Cún Vàng' },
      { id: 'c1_b', label: '🐰 Thỏ Con' },
      { id: 'c2_b', label: '🐶 Cún Vàng' }
    ],
    choices: ['Thỏ Con', 'Cún Vàng', 'Mèo Con'],
    correct: 0,
    hint: 'Bé lật mở từng ô và ghi nhớ hình bạn Thỏ trắng và bạn Cún vàng nhé!'
  },
  q_map1_pair_food: {
    id: 'q_map1_pair_food',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 1,
    prompt: '🔗 Bé hãy chạm nối con vật với món ăn yêu thích của bạn ấy nhé! 🥕',
    speak: 'Bé hãy chạm nối con vật với món ăn yêu thích của bạn ấy nhé!',
    leftColumn: [
      { id: 'l1', text: 'Thỏ Trắng', image: '/assets/edu/animals/anim_bunny.png' },
      { id: 'l2', text: 'Chú Khỉ', image: '/assets/edu/animals/anim_monkey.png' },
      { id: 'l3', text: 'Mèo Con', image: '/assets/edu/animals/anim_cat.png' }
    ],
    rightColumn: [
      { id: 'r1', text: 'Cà Rốt', image: '/assets/edu/matching/pair_rabbit_carrot.jpg', matchId: 'l1' },
      { id: 'r2', text: 'Chuối Vàng', image: '/assets/edu/matching/pair_monkey_banana.jpg', matchId: 'l2' },
      { id: 'r3', text: 'Cá Nhỏ', image: '/assets/edu/matching/pair_cat_fish.jpg', matchId: 'l3' }
    ],
    choices: ['Cà rốt', 'Chuối', 'Cá ngon'],
    correct: 0,
    hint: 'Bé Thỏ thích ăn cà rốt, Chú Khỉ thích chuối ngọt, còn Bé Mèo thích cá tươi ngon!'
  },
  q_map1_pair_nature: {
    id: 'q_map1_pair_nature',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 1,
    prompt: '🔗 Bé hãy nối hình ảnh thiên nhiên tương ứng với nhau nhé! 🌸',
    speak: 'Bé hãy nối hình ảnh thiên nhiên tương ứng với nhau nhé!',
    leftColumn: [
      { id: 'l1', text: 'Mây Mưa', image: '/assets/edu/matching/pair_rain_cloud.jpg' },
      { id: 'l2', text: 'Hoa Hướng Dương', image: '/assets/edu/matching/pair_sun_flower.jpg' },
      { id: 'l3', text: 'Tổ Chim', image: '/assets/edu/matching/pair_bird_nest.jpg' }
    ],
    rightColumn: [
      { id: 'r1', text: 'Chiếc Ô', image: '/assets/edu/toys/toy_umbrella.png', matchId: 'l1' },
      { id: 'r2', text: 'Chú Ong', image: '/assets/edu/animals/anim_bee.png', matchId: 'l2' },
      { id: 'r3', text: 'Chú Vịt Con', image: '/assets/edu/animals/anim_duck.png', matchId: 'l3' }
    ],
    choices: ['Chiếc Ô', 'Chú Ong', 'Vịt Con'],
    correct: 0,
    hint: 'Trời mưa thì che ô, hoa thơm gọi bạn ong đến, tổ chim có chim con ngoan ngoãn!'
  },
  q_map1_drag_size: {
    id: 'q_map1_drag_size',
    skillId: 'ordering',
    type: 'drag_sort',
    difficulty: 1,
    prompt: '📦 Bé hãy kéo thả các bạn nhỏ xếp từ NHỎ NHẤT đến LỚN NHẤT nhé! 🐥',
    speak: 'Bé hãy kéo thả các bạn nhỏ xếp từ nhỏ nhất đến lớn nhất nhé!',
    slots: ['1. Nhỏ nhất', '2. Vừa vừa', '3. Lớn nhất'],
    items: [
      { id: 'it1', label: '🐥 Gà Con', text: 'Gà Con (Nhỏ)', order: 1, image: '/assets/edu/animals/anim_chick.svg' },
      { id: 'it2', label: '🐰 Bé Thỏ', text: 'Bé Thỏ (Vừa)', order: 2, image: '/assets/edu/animals/anim_bunny.svg' },
      { id: 'it3', label: '🐻 Bác Gấu', text: 'Bác Gấu (Lớn)', order: 3, image: '/assets/edu/animals/anim_bear.svg' }
    ],
    choices: ['Gà Con', 'Bé Thỏ', 'Bác Gấu'],
    correct: 0,
    hint: 'Bạn Gà con bé xíu số 1, bạn Thỏ nhỡ số 2, Bác Gấu to lớn nhất số 3 nè!'
  },

  // --- VÙNG 2: RỪNG NẤM & VỊNH BIỂN (ĐỘ KHÓ 2 - HÌNH KHỐI, ĐẾM SỐ 1-4) ---
  q_map2_memory_mushrooms: {
    id: 'q_map2_memory_mushrooms',
    skillId: 'memory',
    type: 'memory_match',
    difficulty: 2,
    prompt: '🃏 Bé hãy lật tìm 4 cặp thẻ sinh vật biển và rừng xanh giống nhau nhé! 🍄🦀',
    speak: 'Bé hãy lật tìm bốn cặp thẻ sinh vật biển và rừng xanh giống nhau nhé!',
    pairs: 4,
    maxMistakes: 4,
    cards: [
      { id: 'c1', label: '🍄 Nấm Đỏ' },
      { id: 'c2', label: '🐝 Chú Ong' },
      { id: 'c3', label: '🦀 Chú Cua' },
      { id: 'c4', label: '⭐ Sao Biển' },
      { id: 'c1_b', label: '🍄 Nấm Đỏ' },
      { id: 'c2_b', label: '🐝 Chú Ong' },
      { id: 'c3_b', label: '🦀 Chú Cua' },
      { id: 'c4_b', label: '⭐ Sao Biển' }
    ],
    choices: ['Nấm Đỏ', 'Chú Ong', 'Chú Cua', 'Sao Biển'],
    correct: 0,
    hint: 'Có 4 cặp bạn nhỏ: nấm đỏ, chú ong, chú cua kẹp và bạn sao biển vàng!'
  },
  q_map2_pair_shapes: {
    id: 'q_map2_pair_shapes',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 2,
    prompt: '🔗 Bé hãy nối hình khối với đồ vật có hình dạng tương ứng nhé! ⭕',
    speak: 'Bé hãy nối hình khối với đồ vật có hình dạng tương ứng nhé!',
    leftColumn: [
      { id: 'l1', text: 'Hình Tròn', image: '/assets/edu/shapes/shape_circle.png' },
      { id: 'l2', text: 'Hình Vuông', image: '/assets/edu/shapes/shape_square.png' },
      { id: 'l3', text: 'Hình Tam Giác', image: '/assets/edu/shapes/shape_triangle.png' }
    ],
    rightColumn: [
      { id: 'r1', text: 'Quả Bóng Tròn', image: '/assets/edu/toys/toy_ball.png', matchId: 'l1' },
      { id: 'r2', text: 'Hộp Quà Vuông', image: '/assets/edu/toys/toy_blocks.png', matchId: 'l2' },
      { id: 'r3', text: 'Cánh Buồm Nhọn', image: '/assets/edu/toys/toy_boat.png', matchId: 'l3' }
    ],
    choices: ['Hình Tròn', 'Hình Vuông', 'Hình Tam Giác'],
    correct: 0,
    hint: 'Quả bóng tròn xoe, chiếc hộp quà vuông vức, cánh buồm hình tam giác!'
  },
  q_map2_pair_colors_fruits: {
    id: 'q_map2_pair_colors_fruits',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 2,
    prompt: '🔗 Bé hãy nối sắc màu với loại quả có màu sắc tương ứng nhé! 🍎',
    speak: 'Bé hãy nối sắc màu với loại quả có màu sắc tương ứng nhé!',
    leftColumn: [
      { id: 'l1', text: 'Màu Đỏ', image: '/assets/edu/colors/color_red.png' },
      { id: 'l2', text: 'Màu Vàng', image: '/assets/edu/colors/color_yellow.png' },
      { id: 'l3', text: 'Màu Cam', image: '/assets/edu/colors/color_orange.png' }
    ],
    rightColumn: [
      { id: 'r1', text: 'Quả Táo Đỏ', image: '/assets/edu/fruits/fruit_apple.png', matchId: 'l1' },
      { id: 'r2', text: 'Quả Chuối Vàng', image: '/assets/edu/matching/pair_monkey_banana.jpg', matchId: 'l2' },
      { id: 'r3', text: 'Quả Cam Mọng', image: '/assets/edu/fruits/fruit_orange.png', matchId: 'l3' }
    ],
    choices: ['Quả Táo', 'Quả Chuối', 'Quả Cam'],
    correct: 0,
    hint: 'Táo tươi màu đỏ, chuối thơm màu vàng, quả cam mọng nước màu cam!'
  },
  q_map2_drag_count_sequence: {
    id: 'q_map2_drag_count_sequence',
    skillId: 'ordering',
    type: 'drag_sort',
    difficulty: 2,
    prompt: '📦 Bé hãy kéo thả sắp xếp các số theo thứ tự từ 1 đến 4 nhé! 🔢',
    speak: 'Bé hãy kéo thả sắp xếp các số theo thứ tự từ một đến bốn nhé!',
    slots: ['Số 1', 'Số 2', 'Số 3', 'Số 4'],
    items: [
      { id: 's1', label: '1️⃣ Một', order: 1 },
      { id: 's2', label: '2️⃣ Hai', order: 2 },
      { id: 's3', label: '3️⃣ Ba', order: 3 },
      { id: 's4', label: '4️⃣ Bốn', order: 4 }
    ],
    choices: ['Số 1', 'Số 2', 'Số 3', 'Số 4'],
    correct: 0,
    hint: 'Bé đếm thuận theo thứ tự: một, hai, ba, bốn nhé!'
  },

  // --- VÙNG 3: ĐỘNG PHA LÊ LẤP LÁNH (ĐỘ KHÓ 3 - 6 THẺ LẬT, ĐẾM SỐ LƯỢNG) ---
  q_map3_memory_crystals: {
    id: 'q_map3_memory_crystals',
    skillId: 'memory',
    type: 'memory_match',
    difficulty: 3,
    prompt: '🃏 Bé hãy lật tìm 4 cặp bảo vật pha lê lấp lánh giống nhau nhé! 💎🔮',
    speak: 'Bé hãy lật tìm bốn cặp bảo vật pha lê lấp lánh giống nhau nhé!',
    pairs: 4,
    maxMistakes: 4,
    cards: [
      { id: 'c1', label: '💎 Pha Lê' },
      { id: 'c2', label: '🔮 Ngọc Tím' },
      { id: 'c3', label: '🦇 Dơi Ngọc' },
      { id: 'c4', label: '🦋 Bướm Đêm' },
      { id: 'c1_b', label: '💎 Pha Lê' },
      { id: 'c2_b', label: '🔮 Ngọc Tím' },
      { id: 'c3_b', label: '🦇 Dơi Ngọc' },
      { id: 'c4_b', label: '🦋 Bướm Đêm' }
    ],
    choices: ['Pha Lê', 'Ngọc Tím', 'Dơi Ngọc', 'Bướm Đêm'],
    correct: 0,
    hint: 'Có 4 cặp bảo vật: viên pha lê xanh, quả cầu ngọc tím, chú dơi ngọc và bạn bướm dạ quang!'
  },
  q_map3_pair_quantities: {
    id: 'q_map3_pair_quantities',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 3,
    prompt: '🔗 Bé hãy chạm nối các bạn nhỏ với món quà yêu thích nhé! ⭐',
    speak: 'Bé hãy chạm nối các bạn nhỏ với món quà yêu thích nhé!',
    leftColumn: [
      { id: 'l1', text: 'Gấu Bông', image: '/assets/edu/toys/toy_teddy.png' },
      { id: 'l2', text: 'Bé Khỉ', image: '/assets/edu/animals/anim_monkey.png' },
      { id: 'l3', text: 'Bé Ong', image: '/assets/edu/animals/anim_bee.png' }
    ],
    rightColumn: [
      { id: 'r1', text: 'Quả Táo Đỏ', image: '/assets/edu/fruits/fruit_apple.png', matchId: 'l1' },
      { id: 'r2', text: 'Quả Chuối Vàng', image: '/assets/edu/matching/pair_monkey_banana.jpg', matchId: 'l2' },
      { id: 'r3', text: 'Hoa Hướng Dương', image: '/assets/edu/matching/pair_sun_flower.jpg', matchId: 'l3' }
    ],
    choices: ['Gấu và Táo', 'Khỉ và Chuối', 'Ong và Hoa'],
    correct: 0,
    hint: 'Bác Gấu thích ăn táo, Bé Khỉ thích ăn chuối ngọt, chú Ong thích hút mật hoa!'
  },
  q_map3_pair_toys: {
    id: 'q_map3_pair_toys',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 3,
    prompt: '🔗 Bé hãy nối các cặp đồ chơi cùng nhóm với nhau nhé! 🧸',
    speak: 'Bé hãy nối các cặp đồ chơi cùng nhóm với nhau nhé!',
    leftColumn: [
      { id: 'l1', text: 'Gấu Bông', image: '/assets/edu/toys/toy_teddy.png' },
      { id: 'l2', text: 'Máy Bay', image: '/assets/edu/toys/toy_plane.png' },
      { id: 'l3', text: 'Kem Ốc Quế', image: '/assets/edu/toys/toy_icecream.png' }
    ],
    rightColumn: [
      { id: 'r1', text: 'Trống Vui Nhộn', image: '/assets/edu/toys/toy_drum.png', matchId: 'l1' },
      { id: 'r2', text: 'Ô Tô Con', image: '/assets/edu/toys/toy_car.png', matchId: 'l2' },
      { id: 'r3', text: 'Kẹo Mút', image: '/assets/edu/toys/toy_lollipop.png', matchId: 'l3' }
    ],
    choices: ['Gấu và Trống', 'Xe và Máy Bay', 'Kem và Kẹo'],
    correct: 0,
    hint: 'Gấu bông chơi cùng trống rộn rã, máy bay bay cùng ô tô, kem ngọt sánh đôi kẹo mút!'
  },
  q_map3_drag_stars_sequence: {
    id: 'q_map3_drag_stars_sequence',
    skillId: 'ordering',
    type: 'drag_sort',
    difficulty: 3,
    prompt: '📦 Bé hãy kéo thả các thẻ sao từ ÍT NHẤT đến NHIỀU NHẤT nhé! ⭐',
    speak: 'Bé hãy kéo thả các thẻ sao từ ít nhất đến nhiều nhất nhé!',
    slots: ['1 Sao', '2 Sao', '3 Sao', '4 Sao'],
    items: [
      { id: 'st1', label: '⭐ (1 Sao)', order: 1 },
      { id: 'st2', label: '⭐⭐ (2 Sao)', order: 2 },
      { id: 'st3', label: '⭐⭐⭐ (3 Sao)', order: 3 },
      { id: 'st4', label: '⭐⭐⭐⭐ (4 Sao)', order: 4 }
    ],
    choices: ['1 Sao', '2 Sao', '3 Sao', '4 Sao'],
    correct: 0,
    hint: 'Ô 1 ngôi sao là ít nhất, xếp lần lượt tăng dần đến 4 ngôi sao nhé!'
  },

  // --- VÙNG 4: ĐỀN MẶT TRỜI SA MẠC (ĐỘ KHÓ 4 - PHÉP TÍNH, CHUỖI SỐ CÁCH ĐỀU) ---
  q_map4_memory_desert: {
    id: 'q_map4_memory_desert',
    skillId: 'memory',
    type: 'memory_match',
    difficulty: 4,
    prompt: '🃏 Bé hãy lật tìm 5 cặp linh vật ánh dương sa mạc nhé! ☀️🏜️',
    speak: 'Bé hãy lật tìm năm cặp linh vật ánh dương sa mạc nhé!',
    pairs: 5,
    maxMistakes: 5,
    cards: [
      { id: 'c1', label: '🦊 Cáo Cát' },
      { id: 'c2', label: '🪲 Bọ Vàng' },
      { id: 'c3', label: '🦅 Chim Ưng' },
      { id: 'c4', label: '☀️ Mặt Trời' },
      { id: 'c5', label: '🌵 Xương Rồng' },
      { id: 'c1_b', label: '🦊 Cáo Cát' },
      { id: 'c2_b', label: '🪲 Bọ Vàng' },
      { id: 'c3_b', label: '🦅 Chim Ưng' },
      { id: 'c4_b', label: '☀️ Mặt Trời' },
      { id: 'c5_b', label: '🌵 Xương Rồng' }
    ],
    choices: ['Cáo Cát', 'Bọ Vàng', 'Chim Ưng', 'Mặt Trời', 'Xương Rồng'],
    correct: 0,
    hint: 'Có 5 cặp linh vật: Cáo cát đuôi dài, Bọ cánh cứng, Chim ưng dũng mãnh, Vầng mặt trời và Cây xương rồng!'
  },
  q_map4_pair_math: {
    id: 'q_map4_pair_math',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 4,
    prompt: '🔗 Bé hãy chạm nối các cặp sinh vật biển nhiệm màu nhé! 🌊',
    speak: 'Bé hãy chạm nối các cặp sinh vật biển nhiệm màu nhé!',
    leftColumn: [
      { id: 'l1', text: 'Cá Voi', image: '/assets/edu/animals/anim_whale.png' },
      { id: 'l2', text: 'Chú Rùa', image: '/assets/edu/animals/anim_turtle.png' },
      { id: 'l3', text: 'Chú Cua', image: '/assets/edu/animals/anim_crab.png' }
    ],
    rightColumn: [
      { id: 'r1', text: 'Cá Voi', image: '/assets/edu/animals/anim_whale.png', matchId: 'l1' },
      { id: 'r2', text: 'Chú Rùa', image: '/assets/edu/animals/anim_turtle.png', matchId: 'l2' },
      { id: 'r3', text: 'Chú Cua', image: '/assets/edu/animals/anim_crab.png', matchId: 'l3' }
    ],
    choices: ['Cá Voi', 'Chú Rùa', 'Chú Cua'],
    correct: 0,
    hint: 'Bé hãy tìm hình chú cá voi, bạn rùa biển và bạn cua đỏ giống nhau để nối nhé!'
  },
  q_map4_drag_even_sequence: {
    id: 'q_map4_drag_even_sequence',
    skillId: 'ordering',
    type: 'drag_sort',
    difficulty: 4,
    prompt: '📦 Bé hãy kéo thả các khối đá vàng xếp theo thứ tự số tăng dần nhé! 🏺',
    speak: 'Bé hãy kéo thả các khối đá vàng xếp theo thứ tự số tăng dần nhé!',
    slots: ['Bậc 1', 'Bậc 2', 'Bậc 3', 'Bậc 4'],
    items: [
      { id: 'n2', label: '2️⃣ Số Hai', order: 1 },
      { id: 'n4', label: '4️⃣ Số Bốn', order: 2 },
      { id: 'n6', label: '6️⃣ Số Sáu', order: 3 },
      { id: 'n8', label: '8️⃣ Số Tám', order: 4 }
    ],
    choices: ['Số 2', 'Số 4', 'Số 6', 'Số 8'],
    correct: 0,
    hint: 'Dãy số chẵn cách đều: hai, bốn, sáu, tám!'
  },

  // --- VÙNG 5: HẺM NÚI GIÓ HÁT (ĐỘ KHÓ 5 - TỪ ĐỐI LẬP, ĐẾM NGƯỢC) ---
  q_map5_memory_canyon: {
    id: 'q_map5_memory_canyon',
    skillId: 'memory',
    type: 'memory_match',
    difficulty: 5,
    prompt: '🃏 Bé hãy lật tìm 6 cặp giai điệu gió ngàn lấp lánh nhé! 🎵🍃',
    speak: 'Bé hãy lật tìm sáu cặp giai điệu gió ngàn lấp lánh nhé!',
    pairs: 6,
    maxMistakes: 6,
    cards: [
      { id: 'c1', label: '🎵 Nốt Nhạc' },
      { id: 'c2', label: '🍃 Chiếc Lá' },
      { id: 'c3', label: '🔔 Chuông Gió' },
      { id: 'c4', label: '🦉 Cú Thông Thái' },
      { id: 'c5', label: '🐿️ Sóc Bay' },
      { id: 'c6', label: '🌪️ Cơn Gió' },
      { id: 'c1_b', label: '🎵 Nốt Nhạc' },
      { id: 'c2_b', label: '🍃 Chiếc Lá' },
      { id: 'c3_b', label: '🔔 Chuông Gió' },
      { id: 'c4_b', label: '🦉 Cú Thông Thái' },
      { id: 'c5_b', label: '🐿️ Sóc Bay' },
      { id: 'c6_b', label: '🌪️ Cơn Gió' }
    ],
    choices: ['Nốt Nhạc', 'Chiếc Lá', 'Chuông Gió', 'Cú Thông Thái', 'Sóc Bay', 'Cơn Gió'],
    correct: 0,
    hint: '6 cặp âm thanh tuyệt diệu: nốt nhạc vui, chiếc lá bay, chuông reo, cú thông thái, sóc bay và cơn gió mát!'
  },
  q_map5_pair_opposites: {
    id: 'q_map5_pair_opposites',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 5,
    prompt: '🔗 Bé hãy nối các cặp hình ảnh tương phản đối lập nhé! ⚖️',
    speak: 'Bé hãy nối các cặp hình ảnh tương phản đối lập nhé!',
    leftColumn: [
      { id: 'l1', text: 'Ban Ngày', icon: '☀️' },
      { id: 'l2', text: 'Bác Voi To', image: '/assets/edu/animals/anim_elephant.png' },
      { id: 'l3', text: 'Lửa Nóng', icon: '🔥' }
    ],
    rightColumn: [
      { id: 'r1', text: 'Ban Đêm', icon: '🌙', matchId: 'l1' },
      { id: 'r2', text: 'Kiến Bé Xíu', icon: '🐜', matchId: 'l2' },
      { id: 'r3', text: 'Tuyết Lạnh', icon: '❄️', matchId: 'l3' }
    ],
    choices: ['Ban Đêm', 'Kiến Nhỏ', 'Lạnh Giá'],
    correct: 0,
    hint: 'Mặt trời đối lập với Mặt trăng, Bác Voi to lớn đối lập bạn Kiến bé xíu, Ngọn lửa ấm đối lập bông tuyết lạnh!'
  },
  q_map5_drag_countdown: {
    id: 'q_map5_drag_countdown',
    skillId: 'ordering',
    type: 'drag_sort',
    difficulty: 5,
    prompt: '📦 Bé hãy kéo thả xếp chuỗi số đếm ngược từ 5 về 2 nhé! 🚀',
    speak: 'Bé hãy kéo thả xếp chuỗi số đếm ngược từ năm về hai nhé!',
    slots: ['Vị trí 1', 'Vị trí 2', 'Vị trí 3', 'Vị trí 4'],
    items: [
      { id: 'c5', label: '5️⃣ Số Năm', order: 1 },
      { id: 'c4', label: '4️⃣ Số Bốn', order: 2 },
      { id: 'c3', label: '3️⃣ Số Ba', order: 3 },
      { id: 'c2', label: '2️⃣ Số Hai', order: 4 }
    ],
    choices: ['Số 5', 'Số 4', 'Số 3', 'Số 2'],
    correct: 0,
    hint: 'Đếm lùi chuẩn bị phóng tàu vũ trụ nào: năm, bốn, ba, hai!'
  },

  // --- VÙNG 6: VƯƠNG QUỐC CẦU VỒNG (ĐỘ KHÓ 5 - 8 THẺ LẬT, QUY LUẬT CẦU VỒNG) ---
  q_map6_memory_rainbow: {
    id: 'q_map6_memory_rainbow',
    skillId: 'memory',
    type: 'memory_match',
    difficulty: 5,
    prompt: '🃏 Bé hãy lật tìm 6 cặp bảo vật Hoàng Gia Rồng Thần nhé! 🌈👑',
    speak: 'Bé hãy lật tìm sáu cặp bảo vật Hoàng Gia Rồng Thần nhé!',
    pairs: 6,
    maxMistakes: 6,
    cards: [
      { id: 'c1', label: '🌈 Cầu Vồng' },
      { id: 'c2', label: '👑 Vương Miện' },
      { id: 'c3', label: '🐉 Rồng Thần' },
      { id: 'c4', label: '🌟 Ngôi Sao' },
      { id: 'c5', label: '🦄 Kỳ Lân' },
      { id: 'c6', label: '💎 Kim Cương' },
      { id: 'c1_b', label: '🌈 Cầu Vồng' },
      { id: 'c2_b', label: '👑 Vương Miện' },
      { id: 'c3_b', label: '🐉 Rồng Thần' },
      { id: 'c4_b', label: '🌟 Ngôi Sao' },
      { id: 'c5_b', label: '🦄 Kỳ Lân' },
      { id: 'c6_b', label: '💎 Kim Cương' }
    ],
    choices: ['Cầu Vồng', 'Vương Miện', 'Rồng Thần', 'Ngôi Sao', 'Kỳ Lân', 'Kim Cương'],
    correct: 0,
    hint: '6 cặp bảo vật hoàng gia: dải cầu vồng, vương miện hoàng gia, rồng thần, ngôi sao, kỳ lân và kim cương lấp lánh!'
  },
  q_map6_pair_logic: {
    id: 'q_map6_pair_logic',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 5,
    prompt: '🔗 Bé hãy nối hình khối với đồ vật tương ứng nhé! 📐',
    speak: 'Bé hãy nối hình khối với đồ vật tương ứng nhé!',
    leftColumn: [
      { id: 'l1', text: 'Hình Tròn', image: '/assets/edu/shapes/shape_circle.png' },
      { id: 'l2', text: 'Hình Vuông', image: '/assets/edu/shapes/shape_square.png' },
      { id: 'l3', text: 'Hình Trái Tim', image: '/assets/edu/shapes/shape_heart.png' }
    ],
    rightColumn: [
      { id: 'r1', text: 'Bóng Tròn', image: '/assets/edu/toys/toy_ball.png', matchId: 'l1' },
      { id: 'r2', text: 'Khối Hộp Vuông', image: '/assets/edu/toys/toy_blocks.png', matchId: 'l2' },
      { id: 'r3', text: 'Kẹo Mút Tròn', image: '/assets/edu/toys/toy_lollipop.png', matchId: 'l3' }
    ],
    choices: ['Tam Giác', 'Hình Vuông', 'Hình Tròn'],
    correct: 0,
    hint: 'Bé nối hình tròn với quả bóng, hình vuông với khối hộp, trái tim với kẹo ngọt ngào!'
  },
  q_map6_drag_rainbow_spectrum: {
    id: 'q_map6_drag_rainbow_spectrum',
    skillId: 'ordering',
    type: 'drag_sort',
    difficulty: 5,
    prompt: '📦 Bé hãy kéo thả các dải màu xếp thành dải Cầu Vồng rực rỡ nhé! 🌈',
    speak: 'Bé hãy kéo thả các dải màu xếp thành dải Cầu Vồng rực rỡ nhé!',
    slots: ['Màu 1', 'Màu 2', 'Màu 3', 'Màu 4', 'Màu 5'],
    items: [
      { id: 'm1', label: '🔴 Màu Đỏ', order: 1 },
      { id: 'm2', label: '🟠 Màu Cam', order: 2 },
      { id: 'm3', label: '🟡 Màu Vàng', order: 3 },
      { id: 'm4', label: '🟢 Màu Lục', order: 4 },
      { id: 'm5', label: '🔵 Màu Lam', order: 5 }
    ],
    choices: ['Màu Đỏ', 'Màu Cam', 'Màu Vàng', 'Màu Lục', 'Màu Lam'],
    correct: 0,
    hint: 'Thứ tự 7 sắc cầu vồng bắt đầu: Đỏ, Cam, Vàng, Lục, Lam nhé bé!'
  },

  // ===============================================================
  // === CÁC CÂU HỎI MỚI VỚI HỌC LIỆU MINH HỌA TẠO SINH SINH ĐỘNG ===
  // ===============================================================

  // --- VÙNG 2: THỬ THÁCH BÓNG & ĐỘNG VẬT RỪNG NẤM (SƯ TỬ, VOI, HƯƠU, KHỈ) ---
  q_map2_shadow_lion: {
    id: 'q_map2_shadow_lion',
    skillId: 'shadow_matching',
    type: 'shadow_match',
    difficulty: 1,
    zone: 'zone2',
    prompt: 'Bé hãy tìm xem đây là bóng của bạn động vật nào? 🦁',
    speak: 'Bé hãy tìm xem đây là bóng của bạn động vật nào?',
    image: '/assets/edu/animals/anim_lion_shadow.png',
    choices: ['Chú Sư Tử', 'Bác Gấu', 'Bé Thỏ'],
    choiceImages: [
      '/assets/edu/animals/anim_lion.png',
      '/assets/edu/animals/anim_bear.png',
      '/assets/edu/animals/anim_bunny.png'
    ],
    correct: 0,
    hint: 'Bạn ấy có chiếc bờm tròn xoe như ánh mặt trời đó bé!'
  },
  q_map2_shadow_elephant: {
    id: 'q_map2_shadow_elephant',
    skillId: 'shadow_matching',
    type: 'shadow_match',
    difficulty: 1,
    zone: 'zone2',
    prompt: 'Chiếc bóng có đôi tai to và chiếc vòi cong này là của ai nhỉ? 🐘',
    speak: 'Chiếc bóng có đôi tai to và chiếc vòi cong này là của ai nhỉ?',
    image: '/assets/edu/animals/anim_elephant_shadow.png',
    choices: ['Chú Cún', 'Chú Voi Con', 'Chú Mèo'],
    choiceImages: [
      '/assets/edu/animals/anim_dog.png',
      '/assets/edu/animals/anim_elephant.png',
      '/assets/edu/animals/anim_cat.png'
    ],
    correct: 1,
    hint: 'Chú voi con có chiếc vòi dài biết hút nước nè!'
  },
  q_map2_shadow_giraffe: {
    id: 'q_map2_shadow_giraffe',
    skillId: 'shadow_matching',
    type: 'shadow_match',
    difficulty: 1,
    zone: 'zone2',
    prompt: 'Bé ơi, chiếc bóng có chiếc cổ cao tít này là của bạn nào? 🦒',
    speak: 'Bé ơi, chiếc bóng có chiếc cổ cao tít này là của bạn nào?',
    image: '/assets/edu/animals/anim_giraffe_shadow.png',
    choices: ['Chú Rùa', 'Chú Vịt', 'Hươu Cao Cổ'],
    choiceImages: [
      '/assets/edu/animals/anim_turtle.png',
      '/assets/edu/animals/anim_duck.png',
      '/assets/edu/animals/anim_giraffe.png'
    ],
    correct: 2,
    hint: 'Bạn hươu cao cổ có chiếc cổ dài để ăn lá cây trên cao!'
  },
  q_map2_shadow_monkey: {
    id: 'q_map2_shadow_monkey',
    skillId: 'shadow_matching',
    type: 'shadow_match',
    difficulty: 1,
    zone: 'zone2',
    prompt: 'Chiếc bóng đang cầm quả chuối này là bạn nào vậy bé? 🐒',
    speak: 'Chiếc bóng đang cầm quả chuối này là bạn nào vậy bé?',
    image: '/assets/edu/animals/anim_monkey_shadow.png',
    choices: ['Chú Khỉ Con', 'Chú Ếch', 'Chú Cua'],
    choiceImages: [
      '/assets/edu/animals/anim_monkey.png',
      '/assets/edu/animals/anim_frog.png',
      '/assets/edu/animals/anim_crab.png'
    ],
    correct: 0,
    hint: 'Bạn khỉ rất thích ăn chuối và leo trèo cây đó bé!'
  },
  q_map2_animals_tall: {
    id: 'q_map2_animals_tall',
    skillId: 'comparison',
    difficulty: 1,
    zone: 'zone2',
    prompt: 'Trong ba bạn nhỏ này, bạn nào CAO NHẤT? 🦒',
    speak: 'Trong ba bạn nhỏ này, bạn nào cao nhất?',
    choices: ['Hươu Cao Cổ', 'Bé Thỏ', 'Chú Rùa'],
    choiceImages: [
      '/assets/edu/animals/anim_giraffe.png',
      '/assets/edu/animals/anim_bunny.png',
      '/assets/edu/animals/anim_turtle.png'
    ],
    correct: 0,
    hint: 'Bạn hươu cao cổ có chiếc cổ cao vút nè!'
  },
  q_map2_animals_ears: {
    id: 'q_map2_animals_ears',
    skillId: 'comparison',
    difficulty: 1,
    zone: 'zone2',
    prompt: 'Bạn nào có ĐÔI TAI TO NHẤT trong ba bạn dưới đây? 🐘',
    speak: 'Bạn nào có đôi tai to nhất trong ba bạn dưới đây?',
    choices: ['Chú Mèo', 'Chú Voi Con', 'Chú Vịt'],
    choiceImages: [
      '/assets/edu/animals/anim_cat.png',
      '/assets/edu/animals/anim_elephant.png',
      '/assets/edu/animals/anim_duck.png'
    ],
    correct: 1,
    hint: 'Bạn voi con có đôi tai to như hai chiếc quạt mát!'
  },
  q_map2_counting_monkeys: {
    id: 'q_map2_counting_monkeys',
    skillId: 'counting',
    type: 'counting',
    difficulty: 2,
    zone: 'zone2',
    prompt: 'Bé hãy đếm xem có bao nhiêu chú khỉ con tinh nghịch? 🐒',
    speak: 'Bé hãy đếm xem có bao nhiêu chú khỉ con tinh nghịch?',
    countItem: '/assets/edu/animals/anim_monkey.png',
    targetCount: 4,
    choices: ['3 Chú khỉ', '4 Chú khỉ', '5 Chú khỉ'],
    correct: 1,
    hint: 'Bé cùng đếm: 1, 2, 3, 4 chú khỉ nhé!'
  },
  q_map2_counting_lions: {
    id: 'q_map2_counting_lions',
    skillId: 'counting',
    type: 'counting',
    difficulty: 2,
    zone: 'zone2',
    prompt: 'Bé đếm xem có bao nhiêu chú sư tử con dũng cảm? 🦁',
    speak: 'Bé đếm xem có bao nhiêu chú sư tử con dũng cảm?',
    countItem: '/assets/edu/animals/anim_lion.png',
    targetCount: 3,
    choices: ['2 Chú sư tử', '3 Chú sư tử', '4 Chú sư tử'],
    correct: 1,
    hint: 'Cùng đếm: 1, 2, 3 chú sư tử bờm vàng rực rỡ!'
  },

  // --- VÙNG 5: HỌC LIỆU ĐỒ CHƠI & TOÁN TRỰC QUAN HẺM NÚI GIÓ HÁT ---
  q_map5_toys_cars_count: {
    id: 'q_map5_toys_cars_count',
    skillId: 'counting',
    type: 'counting',
    difficulty: 2,
    zone: 'zone5',
    prompt: 'Có bao nhiêu chiếc xe ô tô con màu đỏ trên đường đua? 🚗',
    speak: 'Có bao nhiêu chiếc xe ô tô con màu đỏ trên đường đua?',
    countItem: '/assets/edu/toys/toy_car.png',
    targetCount: 5,
    choices: ['4 Chiếc xe', '5 Chiếc xe', '6 Chiếc xe'],
    correct: 1,
    hint: 'Bé cùng đếm từng chiếc xe: 1, 2, 3, 4, 5 chiếc xe ô tô!'
  },
  q_map5_toys_boats_count: {
    id: 'q_map5_toys_boats_count',
    skillId: 'counting',
    type: 'counting',
    difficulty: 2,
    zone: 'zone5',
    prompt: 'Bé hãy đếm xem có mấy chiếc thuyền buồm đang lướt sóng? ⛵',
    speak: 'Bé hãy đếm xem có mấy chiếc thuyền buồm đang lướt sóng?',
    countItem: '/assets/edu/toys/toy_boat.png',
    targetCount: 6,
    choices: ['5 Chiếc thuyền', '6 Chiếc thuyền', '7 Chiếc thuyền'],
    correct: 1,
    hint: 'Bé đếm từ 1 đến 6 chiếc thuyền buồm nhé!'
  },
  q_map5_toys_airplanes_count: {
    id: 'q_map5_toys_airplanes_count',
    skillId: 'counting',
    type: 'counting',
    difficulty: 2,
    zone: 'zone5',
    prompt: 'Trên bầu trời có bao nhiêu chiếc máy bay đồ chơi đang bay? ✈️',
    speak: 'Trên bầu trời có bao nhiêu chiếc máy bay đồ chơi đang bay?',
    countItem: '/assets/edu/toys/toy_plane.png',
    targetCount: 7,
    choices: ['6 Máy bay', '7 Máy bay', '8 Máy bay'],
    correct: 1,
    hint: 'Có 7 chiếc máy bay đang lượn vòng trên mây xanh!'
  },
  q_map5_shadow_airplane: {
    id: 'q_map5_shadow_airplane',
    skillId: 'shadow_matching',
    type: 'shadow_match',
    difficulty: 2,
    zone: 'zone5',
    prompt: 'Chiếc bóng có đôi cánh dài đang bay lượn này là của phương tiện nào? ✈️',
    speak: 'Chiếc bóng có đôi cánh dài đang bay lượn này là của phương tiện nào?',
    image: '/assets/edu/toys/toy_plane_shadow.png',
    choices: ['Xe Ô Tô', 'Máy Bay', 'Thuyền Buồm'],
    choiceImages: [
      '/assets/edu/toys/toy_car.png',
      '/assets/edu/toys/toy_plane.png',
      '/assets/edu/toys/toy_boat.png'
    ],
    correct: 1,
    hint: 'Máy bay có đôi cánh bay vút trên bầu trời đó bé!'
  },
  q_map5_shadow_sailboat: {
    id: 'q_map5_shadow_sailboat',
    skillId: 'shadow_matching',
    type: 'shadow_match',
    difficulty: 2,
    zone: 'zone5',
    prompt: 'Chiếc bóng có cánh buồm tam giác này là của bạn nào bé nhỉ? ⛵',
    speak: 'Chiếc bóng có cánh buồm tam giác này là của bạn nào bé nhỉ?',
    image: '/assets/edu/toys/toy_boat_shadow.png',
    choices: ['Thuyền Buồm', 'Trống Đồ Chơi', 'Quả Bóng'],
    choiceImages: [
      '/assets/edu/toys/toy_boat.png',
      '/assets/edu/toys/toy_drum.png',
      '/assets/edu/toys/toy_ball.png'
    ],
    correct: 0,
    hint: 'Chiếc thuyền buồm nhỏ lướt trên mặt nước êm đềm!'
  },
  q_map5_visual_add_balloons: {
    id: 'q_map5_visual_add_balloons',
    skillId: 'addition_subtraction',
    type: 'visual_math',
    difficulty: 2,
    zone: 'zone5',
    prompt: 'Bé Sam có 3 quả bóng bay, bạn Thỏ tặng thêm 2 quả bóng nữa. Hỏi có tất cả mấy quả bóng bay? 🎈',
    speak: 'Bé Sam có ba quả bóng bay, bạn Thỏ tặng thêm hai quả bóng nữa. Hỏi có tất cả mấy quả bóng bay?',
    itemImage: '/assets/edu/toys/toy_balloon.png',
    num1: 3,
    num2: 2,
    operation: '+',
    choices: ['4 Quả bóng', '5 Quả bóng', '6 Quả bóng'],
    correct: 1,
    hint: 'Ba quả bóng thêm hai quả bóng bằng năm quả bóng: 3 + 2 = 5!'
  },
  q_map5_visual_sub_icecream: {
    id: 'q_map5_visual_sub_icecream',
    skillId: 'addition_subtraction',
    type: 'visual_math',
    difficulty: 2,
    zone: 'zone5',
    prompt: 'Có 5 cây kem mát lạnh, các bạn đã ăn mất 2 cây kem. Hỏi còn lại mấy cây kem? 🍦',
    speak: 'Có năm cây kem mát lạnh, các bạn đã ăn mất hai cây kem. Hỏi còn lại mấy cây kem?',
    itemImage: '/assets/edu/toys/toy_icecream.png',
    num1: 5,
    num2: 2,
    operation: '-',
    choices: ['2 Cây kem', '3 Cây kem', '4 Cây kem'],
    correct: 1,
    hint: 'Năm cây kem bớt đi hai cây kem còn ba cây kem: 5 - 2 = 3!'
  },

  // --- VÙNG 6: LOGIC & QUY LUẬT TOÁN HỌC NÚI LỬA CẦU VỒNG ---
  q_map6_pattern_toys: {
    id: 'q_map6_pattern_toys',
    skillId: 'patterns',
    difficulty: 3,
    zone: 'zone6',
    prompt: 'Quy luật đồ chơi: Xe ô tô 🚗, Quả bóng ⚽, Xe ô tô 🚗, Quả bóng ⚽, Xe ô tô 🚗, ... Tiếp theo là món gì? 🎁',
    speak: 'Xe ô tô, quả bóng, xe ô tô, quả bóng, xe ô tô... Tiếp theo là món gì?',
    choices: ['Quả Bóng ⚽', 'Xe Ô Tô 🚗', 'Máy Bay ✈️'],
    choiceImages: [
      '/assets/edu/toys/toy_ball.png',
      '/assets/edu/toys/toy_car.png',
      '/assets/edu/toys/toy_plane.png'
    ],
    correct: 0,
    hint: 'Quy luật xen kẽ: Sau xe ô tô thì đến lượt quả bóng tròn!'
  },
  q_map6_visual_add_drums: {
    id: 'q_map6_visual_add_drums',
    skillId: 'addition_subtraction',
    type: 'visual_math',
    difficulty: 3,
    zone: 'zone6',
    prompt: 'Đội trống có 4 chiếc trống nhỏ, bác gấu mang thêm 4 chiếc trống nữa. Hỏi có tất cả mấy chiếc trống? 🥁',
    speak: 'Đội trống có bốn chiếc trống nhỏ, bác gấu mang thêm bốn chiếc trống nữa. Hỏi có tất cả mấy chiếc trống?',
    itemImage: '/assets/edu/toys/toy_drum.png',
    num1: 4,
    num2: 4,
    operation: '+',
    choices: ['7 Chiếc trống', '8 Chiếc trống', '9 Chiếc trống'],
    correct: 1,
    hint: 'Bốn chiếc trống cộng bốn chiếc trống bằng tám chiếc trống: 4 + 4 = 8!'
  },
  q_map6_visual_sub_teddies: {
    id: 'q_map6_visual_sub_teddies',
    skillId: 'addition_subtraction',
    type: 'visual_math',
    difficulty: 3,
    zone: 'zone6',
    prompt: 'Trên kệ có 8 chú gấu bông, các bạn nhỏ đã mượn 3 chú gấu đi chơi. Còn lại mấy chú gấu bông? 🧸',
    speak: 'Trên kệ có tám chú gấu bông, các bạn nhỏ đã mượn ba chú gấu đi chơi. Còn lại mấy chú gấu bông?',
    itemImage: '/assets/edu/toys/toy_teddy.png',
    num1: 8,
    num2: 3,
    operation: '-',
    choices: ['4 Chú gấu', '5 Chú gấu', '6 Chú gấu'],
    correct: 1,
    hint: 'Tám chú gấu bớt đi ba chú gấu còn năm chú gấu: 8 - 3 = 5!'
  },
  q_map6_memory_match_toys: {
    id: 'q_map6_memory_match_toys',
    skillId: 'memory',
    type: 'memory_match',
    difficulty: 3,
    zone: 'zone6',
    prompt: 'Bé hãy lật tìm 2 thẻ hình đồ chơi giống nhau nhé! 🃏',
    speak: 'Bé hãy lật tìm hai thẻ hình đồ chơi giống nhau nhé!',
    cards: [
      { id: 'c1', label: 'Xe Ô Tô', icon: '🚗', image: '/assets/edu/toys/toy_car.png', matchId: 'm1' },
      { id: 'c2', label: 'Máy Bay', icon: '✈️', image: '/assets/edu/toys/toy_plane.png', matchId: 'm2' },
      { id: 'c3', label: 'Xe Ô Tô', icon: '🚗', image: '/assets/edu/toys/toy_car.png', matchId: 'm1' },
      { id: 'c4', label: 'Máy Bay', icon: '✈️', image: '/assets/edu/toys/toy_plane.png', matchId: 'm2' }
    ],
    choices: ['Tìm đúng cặp', 'Khác nhau'],
    correct: 0,
    hint: 'Hãy ghi nhớ vị trí của chiếc xe ô tô và máy bay nhé!'
  },
  q_map6_pair_matching_animals: {
    id: 'q_map6_pair_matching_animals',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 3,
    zone: 'zone6',
    prompt: '🔗 Bé hãy chạm nối hai hình con vật giống nhau để mở cổng cầu vồng nhé! 🦁🐘🦒',
    speak: 'Bé hãy chạm nối hai hình con vật giống nhau để mở cổng cầu vồng nhé!',
    leftColumn: [
      { id: 'l1', text: 'Sư Tử', image: '/assets/edu/animals/anim_lion.png' },
      { id: 'l2', text: 'Chú Voi', image: '/assets/edu/animals/anim_elephant.png' },
      { id: 'l3', text: 'Hươu Cao Cổ', image: '/assets/edu/animals/anim_giraffe.png' }
    ],
    rightColumn: [
      { id: 'r1', text: 'Sư Tử', image: '/assets/edu/animals/anim_lion.png', matchId: 'l1' },
      { id: 'r2', text: 'Chú Voi', image: '/assets/edu/animals/anim_elephant.png', matchId: 'l2' },
      { id: 'r3', text: 'Hươu Cao Cổ', image: '/assets/edu/animals/anim_giraffe.png', matchId: 'l3' }
    ],
    choices: ['Sư Tử', 'Voi', 'Hươu Cao Cổ'],
    correct: 0,
    hint: 'Nối bạn Sư tử với Sư tử, Voi với Voi, Hươu với Hươu nhé!'
  }

};

// Bộ nhớ câu hỏi đã gặp trong phiên chơi để chống trùng lặp tuyệt đối
export const sessionQuestionHistory = [];
const MAX_SESSION_HISTORY = 18;

let lastShuffledCorrectIndex = -1;

export function recordQuestionSeen(questionId) {
  if (!questionId) return;
  if (!sessionQuestionHistory.includes(questionId)) {
    sessionQuestionHistory.push(questionId);
    if (sessionQuestionHistory.length > MAX_SESSION_HISTORY) {
      sessionQuestionHistory.shift();
    }
  }
}

export function clearQuestionHistory() {
  sessionQuestionHistory.length = 0;
  lastShuffledCorrectIndex = -1;
}

/**
 * Trộn ngẫu nhiên vị trí các đáp án (A, B, C...) của câu hỏi
 * Giữ nguyên tính liên kết chuẩn xác giữa choices, choiceImages và chỉ mục đáp án đúng correct
 * Đảm bảo đáp án đúng xuất hiện ngẫu nhiên ở mọi vị trí (A, B, C, D) và KHÔNG bị cố định lặp lại 1 vị trí liên tiếp
 */
export function shuffleQuestion(question) {
  if (!question || !Array.isArray(question.choices) || question.choices.length <= 1) {
    return question ? { ...question } : question;
  }
  if (question.isMaze || question.isAudition || question.type === 'audition_rhythm' || question.type === 'memory_match' || question.type === 'pair_matching' || question.type === 'drag_sort') {
    return { ...question };
  }

  const numChoices = question.choices.length;
  const originalCorrect = typeof question.correct === 'number' ? question.correct : 0;
  let indices = question.choices.map((_, i) => i);
  let newCorrect = originalCorrect;
  let attempts = 0;

  // Fisher-Yates shuffle kèm thuật toán chống lặp vị trí đáp án đúng liên tiếp:
  // Nếu có từ 2 đáp án trở lên, cố gắng tránh để newCorrect trùng với lastShuffledCorrectIndex
  do {
    indices = question.choices.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    newCorrect = indices.indexOf(originalCorrect);
    attempts++;
  } while (numChoices > 1 && newCorrect === lastShuffledCorrectIndex && attempts < 10);

  lastShuffledCorrectIndex = newCorrect;

  const newChoices = indices.map(i => question.choices[i]);
  const newChoiceImages = Array.isArray(question.choiceImages)
    ? indices.map(i => question.choiceImages[i])
    : (question.choiceImages ? { ...question.choiceImages } : undefined);

  return {
    ...question,
    choices: newChoices,
    choiceImages: newChoiceImages,
    correct: newCorrect
  };
}

export function getQuestion(questionId) {
  return QUESTION_BANK[questionId] || QUESTION_BANK.q_map1_colors_1;
}

export function getAllQuestions() {
  return Object.values(QUESTION_BANK);
}

/**
 * Chọn câu hỏi ngẫu nhiên trong vùng, ưu tiên loại trừ các câu vừa xuất hiện cả trong trận lẫn trong phiên chơi
 */
export function getRandomZoneQuestion(zoneId, excludeIds = []) {
  const prefix = `q_${zoneId}_`;
  const allZone = Object.values(QUESTION_BANK).filter(
    q => q.id.startsWith(prefix) && !q.id.includes('boss')
  );

  // 1. Ưu tiên số 1: Các câu hỏi CHƯA gặp trong excludeIds VÀ CHƯA gặp trong sessionQuestionHistory
  const unseenCandidates = allZone.filter(
    q => !excludeIds.includes(q.id) && !sessionQuestionHistory.includes(q.id)
  );

  if (unseenCandidates.length > 0) {
    const chosen = unseenCandidates[Math.floor(Math.random() * unseenCandidates.length)];
    recordQuestionSeen(chosen.id);
    return chosen;
  }

  // 2. Nếu đã gặp gần hết ngân hàng, chọn trong các câu không nằm trong excludeIds của trận hiện tại
  const eligible = allZone.filter(q => !excludeIds.includes(q.id));
  if (eligible.length > 0) {
    // Sắp xếp ưu tiên câu nào xuất hiện lâu nhất trong quá khứ lên trước
    eligible.sort((a, b) => {
      const idxA = sessionQuestionHistory.indexOf(a.id);
      const idxB = sessionQuestionHistory.indexOf(b.id);
      return idxA - idxB;
    });
    const chosen = eligible[0];
    recordQuestionSeen(chosen.id);
    return chosen;
  }

  // 3. Fallback: Lấy ngẫu nhiên từ ngân hàng câu hỏi
  const fallback = allZone.length > 0 ? allZone : Object.values(QUESTION_BANK).filter(q => !q.id.includes('boss'));
  const chosen = fallback[Math.floor(Math.random() * fallback.length)] || getQuestion(`${prefix}colors_1`);
  recordQuestionSeen(chosen.id);
  return chosen;
}

/**
 * Tạo câu hỏi thử thách Mini Game Mê Cung Kỳ Diệu khi vượt ải
 * Tích hợp chuẩn Schema mầm non cho phép trẻ chạm tay vẽ đường vượt ải
 */
/**
 * Tạo câu hỏi thử thách Mini Game Audition Nhịp Điệu Cầu Vồng khi vượt ải
 * Trẻ canh nhịp bi lăn vào vùng đỏ Perfect và bấm phím Space hoặc nút trên màn hình!
 */
export function createAuditionQuestion({ id, encounter, phase = 1, isBoss = false } = {}) {
  const encName = encounter?.name || 'Quái vật';
  const mapId = encounter?.mapId || (encounter?.id?.includes('map') ? ('map' + encounter.id.split('map')[1].charAt(0)) : 'map1');
  const target = 1;

  const prompt = isBoss
    ? `🎵 VŨ ĐIỆU AUDITION CẦU VỒNG: Bé hãy canh viên bi vào VÙNG ĐỎ và bấm BẮT NHỊP (hoặc phím CÁCH) để xuất chiêu Âm Nhạc đánh trúng ${encName}! ⚡`
    : `🎵 VŨ ĐIỆU AUDITION CẦU VỒNG: Bé hãy canh viên bi vào VÙNG ĐỎ và bấm BẮT NHỊP (hoặc phím CÁCH) để xuất chiêu đánh trúng ${encName}! ⚡`;

  const speak = isBoss
    ? `Thử thách vũ điệu Audition! Bé hãy canh viên bi vào vùng đỏ rồi bấm bắt nhịp để tấn công ${encName} nhé!`
    : `Vũ điệu Audition sôi động! Bé hãy canh viên bi vào vùng màu đỏ rồi bấm bắt nhịp nhé!`;

  return {
    id: id || `q_${mapId}_audition_${phase}_${encounter?.id || 'enc'}`,
    skillId: 'rhythm',
    difficulty: isBoss ? 2 : 1,
    type: 'audition_rhythm',
    isAudition: true,
    target,
    prompt,
    speak,
    choices: [
      '🎵 Bắt Đầu Vũ Điệu Bắt Nhịp',
      '💡 Xem Hướng Dẫn Bắt Nhịp'
    ],
    correct: 0,
    hint: 'Bé quan sát viên bi di chuyển, khi bi lăn vào đúng vạch màu đỏ phát sáng thì bấm nút Bắt Nhịp hoặc phím Cách thật nhanh nhé!'
  };
}

export function createMazeQuestion({ id, encounter, phase = 1, isBoss = false } = {}) {
  const encName = encounter?.name || 'Quái vật';
  const mapId = encounter?.mapId || (encounter?.id?.includes('map') ? encounter.id.split('_')[1] : 'map1');

  const themeMap = {
    map1: { id: 'garden', name: 'Khu Vườn Cầu Vồng' },
    map2: { id: 'ocean', name: 'Vịnh Biển Pha Lê' },
    map3: { id: 'candy', name: 'Rừng Kẹo Bông' },
    map4: { id: 'desert', name: 'Đền Mặt Trời Sa Mạc' },
    map5: { id: 'desert', name: 'Sa Mạc Hoàng Kim' },
    map6: { id: 'garden', name: 'Khu Vườn Thần Long' }
  };
  const theme = themeMap[mapId] || themeMap.map1;

  const prompt = isBoss
    ? `🌀 THỬ THÁCH MÊ CUNG VƯỢT ẢI: Bé hãy chạm tay vẽ đường vượt qua ma trận để hóa giải tuyệt chiêu của ${encName}!`
    : `🌀 THỬ THÁCH MÊ CUNG VƯỢT ẢI: Bé hãy chạm tay vẽ đường giúp Bé Sâu thoát mê cung để tung chiêu đánh trúng ${encName}!`;

  const speak = isBoss
    ? `Thử thách mê cung vượt ải! Bé hãy vẽ đường vượt qua ma trận để đánh trúng ${encName} nhé!`
    : `Thử thách mê cung vượt ải! Bé hãy vẽ đường giúp Bé Sâu thoát khỏi mê cung để đánh trúng ${encName} nhé!`;

  return {
    id: id || `q_${mapId}_maze_${phase}_${encounter?.id || 'enc'}`,
    skillId: 'maze',
    difficulty: 1,
    type: 'maze',
    isMaze: true,
    mazeThemeId: theme.id,
    prompt,
    speak,
    choices: [
      '🚀 Bắt Đầu Vẽ Đường Mê Cung',
      '💡 Xem Gợi Ý Đường Đi'
    ],
    correct: 0,
    hint: 'Bé chạm tay vào Bé Sâu và vẽ đường theo lối đi màu sáng đến Cổng Cầu Vồng nhé!'
  };
}

export const CUSTOM_QUESTIONS_STORAGE_KEY = 'RAINBOW_CUSTOM_QUESTIONS_V1';

export function loadCustomQuestions() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_QUESTIONS_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (Array.isArray(list)) {
      list.forEach(q => {
        if (q && q.id) {
          QUESTION_BANK[q.id] = q;
        }
      });
      return list;
    }
  } catch (err) {
    console.warn('[QuestionBank] Lỗi đọc câu hỏi tùy chỉnh:', err);
  }
  return [];
}

export function getCustomQuestions() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_QUESTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addCustomQuestion(questionData) {
  const zonePrefix = questionData.zoneId ? `q_${questionData.zoneId}_` : 'q_map1_';
  const customId = questionData.id || `${zonePrefix}custom_${Date.now()}`;
  const question = {
    ...questionData,
    id: customId,
    difficulty: Number(questionData.difficulty) || 1
  };

  const validation = validateQuestion(question);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  // Lưu vào QUESTION_BANK bộ nhớ
  QUESTION_BANK[question.id] = question;

  // Lưu vào localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const currentList = getCustomQuestions();
      const nextList = [...currentList.filter(q => q.id !== question.id), question];
      window.localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(nextList));
    } catch (e) {
      console.error('[QuestionBank] Không thể lưu câu hỏi vào localStorage:', e);
    }
  }

  return { success: true, question };
}

export function deleteCustomQuestion(questionId) {
  delete QUESTION_BANK[questionId];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const currentList = getCustomQuestions();
      const nextList = currentList.filter(q => q.id !== questionId);
      window.localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(nextList));
      return true;
    } catch (e) {
      console.error('[QuestionBank] Không thể xóa câu hỏi:', e);
      return false;
    }
  }
  return true;
}

// Khởi chạy nạp câu hỏi tùy chỉnh nếu có
loadCustomQuestions();

