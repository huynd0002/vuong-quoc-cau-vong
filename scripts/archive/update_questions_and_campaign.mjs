import fs from 'fs';

// 1. Cập nhật questionBank.js
let qCode = fs.readFileSync('./src/content/questions/questionBank.js', 'utf8');

const newQuestions = `
  // ========================================================
  // === VÙNG 4: PHÉP TRỪ TRỰC QUAN PHẠM VI 5 - 10 (SA MẠC) ===
  // ========================================================
  q_map4_sub_fox: {
    id: 'q_map4_sub_fox',
    skillId: 'subtraction',
    difficulty: 2,
    prompt: 'Trên đĩa có 7 quả cam ngọt 🍊🍊🍊🍊🍊🍊🍊, bé chia cho bạn Cáo Cát 3 quả 🍊🍊🍊. Trên đĩa còn lại mấy quả cam?',
    speak: 'Trên đĩa có bảy quả cam ngọt, bé chia cho bạn Cáo Cát ba quả. Trên đĩa còn lại mấy quả cam?',
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
  },`;

// Cập nhật boss map 4 questions
qCode = qCode.replace(
  `q_map4_boss_p1: {
    id: 'q_map4_boss_p1',
    skillId: 'subtraction',
    difficulty: 2,
    prompt: 'Gấu Kẹo Bông Pha 1: 4 quả bóng bay 🎈🎈🎈🎈, bay mất 1 quả. Còn mấy quả bóng?',
    speak: 'Gấu Kẹo Bông Pha 1: Bốn quả bóng bay, bay lên trời mất một quả. Còn lại mấy quả bóng?',
    choices: ['2 quả', '3 quả', '4 quả'],
    correct: 1,
    hint: 'Bốn bớt một thì còn ba quả bóng bay rực rỡ!'
  },
  q_map4_boss_p2: {
    id: 'q_map4_boss_p2',
    skillId: 'subtraction',
    difficulty: 3,
    prompt: 'Gấu Kẹo Bông Pha 2: 5 cái kẹo dẻo 🍬🍬🍬🍬🍬, chia cho các bạn 3 cái. Còn mấy cái kẹo?',
    speak: 'Gấu Kẹo Bông Pha 2: Năm cái kẹo dẻo, chia cho các bạn ba cái. Còn lại mấy cái kẹo?',
    choices: ['1 cái kẹo', '2 cái kẹo', '3 cái kẹo'],
    correct: 1,
    hint: 'Năm bớt ba thì còn hai cái kẹo dẻo ngọt mát!'
  },
  q_map4_boss: {
    id: 'q_map4_boss',
    skillId: 'subtraction',
    difficulty: 3,
    prompt: 'Có 5 chú gấu con 🐻, 2 chú đi ngủ trưa. Còn mấy chú gấu đang chơi?',
    speak: 'Có năm chú gấu con, hai chú đi ngủ trưa. Còn mấy chú gấu đang chơi?',
    choices: ['2 chú', '3 chú', '4 chú'],
    correct: 1,
    hint: 'Năm ngón tay cụp lại hai ngón thì còn ba ngón giơ lên nè!'
  },`,
  `q_map4_boss_p1: {
    id: 'q_map4_boss_p1',
    skillId: 'subtraction',
    difficulty: 2,
    prompt: 'Thần Nhân Sư Pha 1: 8 tia nắng vàng ☀️☀️☀️☀️☀️☀️☀️☀️, mây sa mạc che bớt 3 tia nắng. Còn lại mấy tia nắng chiếu sáng?',
    speak: 'Thần Nhân Sư Pha 1: Có tám tia nắng vàng, mây sa mạc che bớt ba tia nắng. Còn lại mấy tia nắng chiếu sáng rực rỡ?',
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
    choices: ['3 bông', '4 bông', '5 bông'],
    correct: 1,
    hint: 'Bảy bớt ba còn lại bốn bông hoa sen đá sa mạc kiên cường!'
  },`
);

if (!qCode.includes('q_map4_sub_fox')) {
  qCode = qCode.replace(
    '  // ================================================\n  // === VÙNG 4: PHÉP TRỪ TRỰC QUAN 1-5 (RỪNG KẸO) ===\n  // ================================================',
    newQuestions
  );
  qCode = qCode.replace(
    '  // ================================================\r\n  // === VÙNG 4: PHÉP TRỪ TRỰC QUAN 1-5 (RỪNG KẸO) ===\r\n  // ================================================',
    newQuestions
  );
}

// Cập nhật theme map4 trong createMazeQuestion
qCode = qCode.replace(
  "map4: { id: 'candy', name: 'Rừng Kẹo Bông' },",
  "map4: { id: 'desert', name: 'Đền Mặt Trời Sa Mạc' },"
);

fs.writeFileSync('./src/content/questions/questionBank.js', qCode, 'utf8');
console.log('✓ questionBank.js updated successfully!');

// 2. Cập nhật campaignGraph.js
let campCode = fs.readFileSync('./src/content/campaign/campaignGraph.js', 'utf8');

const oldMap4Campaign = `  map4: {
    id: 'map4',
    order: 4,
    name: 'Rừng Kẹo Ngọt',
    subtitle: 'Xứ sở bánh gừng và kẹo dẻo',
    learningFocus: 'Phép trừ trực quan trong phạm vi 5',
    colorCode: '#69DB7C',
    prerequisites: ['map3'],
    storyItem: { id: 'crystal_green', name: 'Pha Lê Xanh Hy Vọng', icon: '💎' },
    mainQuests: [
      { id: 'quest_m4_cookie', title: 'Chia sẻ bánh cùng Bánh Quy Tinh Nghịch', encounterId: 'enc_map4_1' },
      { id: 'quest_m4_boss', title: 'Giúp Vua Gấu Kẹo Bông bình tĩnh', bossId: 'boss_map4' }
    ],
    sideQuests: [
      { id: 'side_m4_play', title: 'Chơi ném bóng cùng Thỏ Bông trong Rừng Kẹo', type: 'pet_play', target: 1 }
    ],
    nextZoneId: 'map5'
  },`;

const newMap4Campaign = `  map4: {
    id: 'map4',
    order: 4,
    name: 'Đền Mặt Trời Sa Mạc',
    subtitle: 'Đấu trường cổ đại ngập tràn ánh dương',
    learningFocus: 'Phép trừ trực quan phạm vi 5 đến 10',
    colorCode: '#F59E0B',
    prerequisites: ['map3'],
    storyItem: { id: 'crystal_sun', name: 'Pha Lê Vàng Thái Dương', icon: '☀️' },
    mainQuests: [
      { id: 'quest_m4_fox', title: 'Chia sẻ cam cùng Cáo Cát Ánh Dương', encounterId: 'enc_map4_1' },
      { id: 'quest_m4_scarab', title: 'Đếm ngọc sa mạc cùng Bọ Cánh Cứng', encounterId: 'enc_map4_2' },
      { id: 'quest_m4_falcon', title: 'Ngắm đàn chim cùng Chim Ưng Mặt Trời', encounterId: 'enc_map4_3' },
      { id: 'quest_m4_altar', title: 'Kích hoạt Phong Ấn Bệ Thờ Ánh Dương', type: 'puzzle' },
      { id: 'quest_m4_boss', title: 'Hội ngộ và kết bạn cùng Thần Nhân Sư Ánh Dương', bossId: 'boss_map4' }
    ],
    sideQuests: [
      { id: 'side_m4_play', title: 'Chơi đùa cùng Thú Cưng dưới ánh nắng sa mạc', type: 'pet_play', target: 1 }
    ],
    nextZoneId: 'map5'
  },`;

campCode = campCode.replace(oldMap4Campaign.replace(/\r\n/g, '\n'), newMap4Campaign);
campCode = campCode.replace(oldMap4Campaign, newMap4Campaign);

fs.writeFileSync('./src/content/campaign/campaignGraph.js', campCode, 'utf8');
console.log('✓ campaignGraph.js updated successfully!');
