import fs from 'node:fs';

let content = fs.readFileSync('src/content/questions/questionBank.js', 'utf8');

// Update shuffleQuestion
const oldShuffle = `  if (question.isMaze) return { ...question };`;
const newShuffle = `  if (question.isMaze || question.type === 'memory_match' || question.type === 'pair_matching' || question.type === 'drag_sort') {
    return { ...question };
  }`;
content = content.replace(oldShuffle, newShuffle);

const newQuestions = `
  // =========================================================================
  // === BỘ CÂU HỎI VƯỢT ẢI ĐA DẠNG: LẬT Ô, NỐI CỘT, KÉO THẢ (ĐỘ KHÓ TĂNG DẦN) ===
  // =========================================================================

  // --- VÙNG 1: LÀNG QUÊ YÊN BÌNH (ĐỘ KHÓ 1 - RẤT DỄ, TRỰC QUAN GẦN GŨI) ---
  q_map1_memory_animals: {
    id: 'q_map1_memory_animals',
    skillId: 'memory',
    type: 'memory_match',
    difficulty: 1,
    prompt: '🃏 Bé hãy lật tìm 2 thẻ hình con vật giống nhau nhé! ✨',
    speak: 'Bé hãy lật tìm hai thẻ hình con vật giống nhau nhé!',
    pairs: 2,
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
    prompt: '🔗 Bé hãy nối con vật với món ăn yêu thích của bạn ấy nhé! 🥕',
    speak: 'Bé hãy nối con vật với món ăn yêu thích của bạn ấy nhé!',
    leftColumn: [
      { id: 'l1', text: '🐰 Bé Thỏ' },
      { id: 'l2', text: '🐒 Chú Khỉ' },
      { id: 'l3', text: '🐶 Chó Cún' }
    ],
    rightColumn: [
      { id: 'r1', text: '🥕 Củ Cà Rốt', matchId: 'l1' },
      { id: 'r2', text: '🍌 Quả Chuối', matchId: 'l2' },
      { id: 'r3', text: '🦴 Khúc Xương', matchId: 'l3' }
    ],
    choices: ['Cà rốt', 'Chuối', 'Xương'],
    correct: 0,
    hint: 'Bé Thỏ thích ăn cà rốt, Chú Khỉ thích chuối ngọt, còn Cún con gặm khúc xương!'
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
      { id: 'it1', label: '🐥 Gà Con', order: 1 },
      { id: 'it2', label: '🐰 Bé Thỏ', order: 2 },
      { id: 'it3', label: '🐻 Bác Gấu', order: 3 }
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
    prompt: '🃏 Bé hãy lật tìm 2 thẻ nấm và ong rừng giống nhau nhé! 🍄',
    speak: 'Bé hãy lật tìm hai thẻ nấm và ong rừng giống nhau nhé!',
    pairs: 2,
    cards: [
      { id: 'c1', label: '🍄 Nấm Đỏ' },
      { id: 'c2', label: '🐝 Chú Ong' },
      { id: 'c1_b', label: '🍄 Nấm Đỏ' },
      { id: 'c2_b', label: '🐝 Chú Ong' }
    ],
    choices: ['Nấm Đỏ', 'Chú Ong', 'Cây Thông'],
    correct: 0,
    hint: 'Hai cây nấm đỏ có chấm tròn giống hệt nhau, và hai chú ong chăm chỉ!'
  },
  q_map2_pair_shapes: {
    id: 'q_map2_pair_shapes',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 2,
    prompt: '🔗 Bé hãy nối hình khối với đồ vật có hình dạng tương ứng nhé! ⭕',
    speak: 'Bé hãy nối hình khối với đồ vật có hình dạng tương ứng nhé!',
    leftColumn: [
      { id: 'l1', text: '⭕ Hình Tròn' },
      { id: 'l2', text: '⬛ Hình Vuông' },
      { id: 'l3', text: '🔺 Hình Tam Giác' }
    ],
    rightColumn: [
      { id: 'r1', text: '⚽ Quả Bóng Tròn', matchId: 'l1' },
      { id: 'r2', text: '🎁 Hộp Quà Vuông', matchId: 'l2' },
      { id: 'r3', text: '⛵ Cánh Buồm Nhọn', matchId: 'l3' }
    ],
    choices: ['Hình Tròn', 'Hình Vuông', 'Hình Tam Giác'],
    correct: 0,
    hint: 'Quả bóng tròn xoe, chiếc hộp quà vuông vức, cánh buồm hình tam giác!'
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
    prompt: '🃏 Bé hãy lật tìm 3 cặp bảo vật pha lê lấp lánh giống nhau nhé! 💎',
    speak: 'Bé hãy lật tìm ba cặp bảo vật pha lê lấp lánh giống nhau nhé!',
    pairs: 3,
    cards: [
      { id: 'c1', label: '💎 Pha Lê' },
      { id: 'c2', label: '🔮 Ngọc Tím' },
      { id: 'c3', label: '🦇 Dơi Ngọc' },
      { id: 'c1_b', label: '💎 Pha Lê' },
      { id: 'c2_b', label: '🔮 Ngọc Tím' },
      { id: 'c3_b', label: '🦇 Dơi Ngọc' }
    ],
    choices: ['Pha Lê', 'Ngọc Tím', 'Dơi Ngọc'],
    correct: 0,
    hint: 'Có 3 cặp hình: viên pha lê xanh, quả cầu ngọc tím và chú dơi ngọc!'
  },
  q_map3_pair_quantities: {
    id: 'q_map3_pair_quantities',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 3,
    prompt: '🔗 Bé hãy nối chữ số với số lượng quả pha lê tương ứng nhé! ⭐',
    speak: 'Bé hãy nối chữ số với số lượng quả pha lê tương ứng nhé!',
    leftColumn: [
      { id: 'l1', text: 'Số 2️⃣' },
      { id: 'l2', text: 'Số 3️⃣' },
      { id: 'l3', text: 'Số 4️⃣' }
    ],
    rightColumn: [
      { id: 'r1', text: '💎💎 (2 viên)', matchId: 'l1' },
      { id: 'r2', text: '💎💎💎 (3 viên)', matchId: 'l2' },
      { id: 'r3', text: '💎💎💎💎 (4 viên)', matchId: 'l3' }
    ],
    choices: ['2 viên', '3 viên', '4 viên'],
    correct: 0,
    hint: 'Bé đếm số viên pha lê ở mỗi ô rồi nối với số tương ứng nhé!'
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
    prompt: '🃏 Bé hãy lật tìm 3 cặp linh vật ánh dương sa mạc nhé! ☀️',
    speak: 'Bé hãy lật tìm ba cặp linh vật ánh dương sa mạc nhé!',
    pairs: 3,
    cards: [
      { id: 'c1', label: '🦊 Cáo Cát' },
      { id: 'c2', label: '🪲 Bọ Vàng' },
      { id: 'c3', label: '🦅 Chim Ưng' },
      { id: 'c1_b', label: '🦊 Cáo Cát' },
      { id: 'c2_b', label: '🪲 Bọ Vàng' },
      { id: 'c3_b', label: '🦅 Chim Ưng' }
    ],
    choices: ['Cáo Cát', 'Bọ Vàng', 'Chim Ưng'],
    correct: 0,
    hint: 'Có 3 cặp bạn nhỏ sa mạc: Cáo cát đuôi dài, Bọ cánh cứng và Chim ưng dũng mãnh!'
  },
  q_map4_pair_math: {
    id: 'q_map4_pair_math',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 4,
    prompt: '🔗 Bé hãy nối phép tính tia nắng với kết quả đúng nhé! ☀️',
    speak: 'Bé hãy nối phép tính tia nắng với kết quả đúng nhé!',
    leftColumn: [
      { id: 'l1', text: '1 + 2' },
      { id: 'l2', text: '2 + 2' },
      { id: 'l3', text: '5 - 1' }
    ],
    rightColumn: [
      { id: 'r1', text: '= 3 ⭐', matchId: 'l1' },
      { id: 'r2', text: '= 4 ⭐', matchId: 'l2' },
      { id: 'r3', text: '= 4 ☀️', matchId: 'l3' }
    ],
    choices: ['3', '4', '4'],
    correct: 0,
    hint: '1 cộng 2 bằng 3, 2 cộng 2 bằng 4, 5 bớt 1 còn 4!'
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
    prompt: '🃏 Bé hãy lật tìm 3 cặp nốt nhạc gió ngàn lấp lánh nhé! 🎵',
    speak: 'Bé hãy lật tìm ba cặp nốt nhạc gió ngàn lấp lánh nhé!',
    pairs: 3,
    cards: [
      { id: 'c1', label: '🎵 Nốt Nhạc' },
      { id: 'c2', label: '🍃 Chiếc Lá' },
      { id: 'c3', label: '🔔 Chuông Gió' },
      { id: 'c1_b', label: '🎵 Nốt Nhạc' },
      { id: 'c2_b', label: '🍃 Chiếc Lá' },
      { id: 'c3_b', label: '🔔 Chuông Gió' }
    ],
    choices: ['Nốt Nhạc', 'Chiếc Lá', 'Chuông Gió'],
    correct: 0,
    hint: 'Tìm cặp nốt nhạc vui ca, chiếc lá bay trong gió và chiếc chuông vàng ngân nga!'
  },
  q_map5_pair_opposites: {
    id: 'q_map5_pair_opposites',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 5,
    prompt: '🔗 Bé hãy nối các cặp từ và hình ảnh tương phản đối lập nhé! ⚖️',
    speak: 'Bé hãy nối các cặp từ và hình ảnh tương phản đối lập nhé!',
    leftColumn: [
      { id: 'l1', text: '☀️ Ban Ngày' },
      { id: 'l2', text: '🐘 Voi Rất To' },
      { id: 'l3', text: '🔥 Nóng Ấm' }
    ],
    rightColumn: [
      { id: 'r1', text: '🌙 Ban Đêm', matchId: 'l1' },
      { id: 'r2', text: '🐜 Kiến Rất Nhỏ', matchId: 'l2' },
      { id: 'r3', text: '❄️ Lạnh Giá', matchId: 'l3' }
    ],
    choices: ['Ban Đêm', 'Kiến Nhỏ', 'Lạnh Giá'],
    correct: 0,
    hint: 'Ngày đối lập với Đêm, Voi to lớn đối lập với Kiến bé xíu, Nóng đối lập với Lạnh!'
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
    prompt: '🃏 Bé hãy lật tìm 4 cặp bảo vật Rồng Thần Cầu Vồng nhé! 🌈👑',
    speak: 'Bé hãy lật tìm bốn cặp bảo vật Rồng Thần Cầu Vồng nhé!',
    pairs: 4,
    cards: [
      { id: 'c1', label: '🌈 Cầu Vồng' },
      { id: 'c2', label: '👑 Vương Miện' },
      { id: 'c3', label: '🐉 Rồng Thần' },
      { id: 'c4', label: '🌟 Ngôi Sao' },
      { id: 'c1_b', label: '🌈 Cầu Vồng' },
      { id: 'c2_b', label: '👑 Vương Miện' },
      { id: 'c3_b', label: '🐉 Rồng Thần' },
      { id: 'c4_b', label: '🌟 Ngôi Sao' }
    ],
    choices: ['Cầu Vồng', 'Vương Miện', 'Rồng Thần', 'Ngôi Sao'],
    correct: 0,
    hint: 'Tìm 4 cặp huy hoàng: dải cầu vồng, vương miện hoàng gia, rồng thần và ngôi sao!'
  },
  q_map6_pair_logic: {
    id: 'q_map6_pair_logic',
    skillId: 'matching',
    type: 'pair_matching',
    difficulty: 5,
    prompt: '🔗 Bé hãy nối số lượng góc với hình khối kỳ diệu nhé! 📐',
    speak: 'Bé hãy nối số lượng góc với hình khối kỳ diệu nhé!',
    leftColumn: [
      { id: 'l1', text: '3 Góc nhọn' },
      { id: 'l2', text: '4 Góc vuông' },
      { id: 'l3', text: '0 Góc (tròn)' }
    ],
    rightColumn: [
      { id: 'r1', text: '🔺 Hình Tam Giác', matchId: 'l1' },
      { id: 'r2', text: '⬛ Hình Vuông', matchId: 'l2' },
      { id: 'r3', text: '⭕ Hình Tròn', matchId: 'l3' }
    ],
    choices: ['Tam Giác', 'Hình Vuông', 'Hình Tròn'],
    correct: 0,
    hint: '3 góc nhọn là Hình Tam Giác, 4 góc đều là Hình Vuông, không có góc nào là Hình Tròn!'
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
  }
`;

const insertTarget = '\n};\n\n/**\n * Trộn ngẫu nhiên vị trí các đáp án';
content = content.replace(insertTarget, newQuestions + insertTarget);

fs.writeFileSync('src/content/questions/questionBank.js', content, 'utf8');
console.log('Added 18 diverse interactive questions to questionBank.js successfully!');
