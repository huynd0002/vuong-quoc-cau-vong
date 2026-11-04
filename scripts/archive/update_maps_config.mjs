import fs from 'fs';

let content = fs.readFileSync('./src/content/maps/mapsConfig.js', 'utf8');

// Cập nhật targetMapName ở portal_map3
content = content.replace(
  `"targetMapName": "Rừng Kẹo Ngọt",\n      "badgeText": "🌀 SANG RỪNG KẸO 🍭"`,
  `"targetMapName": "Đền Mặt Trời Sa Mạc",\n      "badgeText": "🌀 SANG ĐỀN SA MẠC ☀️"`
);
content = content.replace(
  `"targetMapName": "Rừng Kẹo Ngọt",\r\n      "badgeText": "🌀 SANG RỪNG KẸO 🍭"`,
  `"targetMapName": "Đền Mặt Trời Sa Mạc",\r\n      "badgeText": "🌀 SANG ĐỀN SA MẠC ☀️"`
);

// Map 4 config mới
const newMap4Config = `  "map4": {
    "id": "map4",
    "order": 4,
    "name": "Đền Mặt Trời Sa Mạc",
    "subtitle": "Đấu trường cổ đại ngập tràn ánh dương",
    "objective": "Phép trừ trực quan trong phạm vi 5 đến 10",
    "bgKey": "map_4_bg",
    "heroSpawn": {
      "x": 280,
      "y": 670
    },
    "storyIntro": {
      "title": "Chào mừng đến Đền Mặt Trời Sa Mạc!",
      "story": "Đấu trường cổ kính ngập tràn ánh nắng vàng rực rỡ và những kỳ quan cát vàng! Bé hãy cùng các bạn sa mạc thực hiện phép trừ sẻ chia thông thái nhé!",
      "voice": "Chào mừng bé đến với Đền Mặt Trời Sa Mạc! Cùng Bé Sâu khám phá phép trừ ánh dương nhé!"
    },
    "propsPuzzle": {
      "id": "puzzle_sun_altar",
      "name": "Phong Ấn Bệ Thờ Ánh Dương",
      "x": 820,
      "y": 340,
      "requiredRescues": [
        "enc_map4_1",
        "enc_map4_2",
        "enc_map4_3"
      ],
      "hintLocked": "Phong Ấn Bệ Thờ Ánh Dương đang ngủ say dưới bão cát! Bé hãy giúp đỡ Cáo Cát, Bọ Ánh Dương và Chim Ưng Mặt Trời trước nhé!",
      "hintUnlocked": "Phong Ấn Ánh Dương đã bừng sáng rực rỡ! Bậc thang dẫn lên ngai thờ Thần Nhân Sư đã mở!"
    },
    "encounters": [
      {
        "id": "enc_map4_1",
        "name": "Cáo Cát Ánh Dương",
        "x": 490,
        "y": 550,
        "spriteKey": "mon_desert_fox",
        "questionId": "q_map4_sub_fox",
        "reward": {
          "stars": 2,
          "exp": 20
        }
      },
      {
        "id": "enc_map4_2",
        "name": "Bọ Cánh Cứng Ánh Dương",
        "x": 790,
        "y": 550,
        "spriteKey": "mon_scarab",
        "questionId": "q_map4_sub_scarab",
        "reward": {
          "stars": 2,
          "exp": 20
        }
      },
      {
        "id": "enc_map4_3",
        "name": "Chim Ưng Mặt Trời",
        "x": 640,
        "y": 410,
        "spriteKey": "mon_desert_falcon",
        "questionId": "q_map4_sub_falcon",
        "reward": {
          "stars": 2,
          "exp": 20
        }
      }
    ],
    "boss": {
      "id": "boss_map4",
      "name": "Thần Nhân Sư Ánh Dương",
      "spriteKey": "boss_desert_sphinx",
      "x": 970,
      "y": 220,
      "questionId": "q_map4_boss",
      "phases": [
        {
          "phase": 1,
          "name": "Thần Nhân Sư (Thử thách Ánh Dương)",
          "questionId": "q_map4_boss_p1",
          "instruction": "Pha 1: Xoa dịu bão cát bằng phép trừ tia nắng!"
        },
        {
          "phase": 2,
          "name": "Thần Nhân Sư (Hào Quang Thái Dương)",
          "questionId": "q_map4_boss_p2",
          "instruction": "Pha 2: Giải đố nước mát ốc đảo để kết bạn cùng Thần Nhân Sư!"
        }
      ],
      "reward": {
        "stars": 3,
        "exp": 40,
        "unlockMap": "map5"
      }
    },
    "teleportPortal": {
      "id": "portal_map4",
      "name": "Cổng Dịch Chuyển Sang Hẻm Núi Gió Hát",
      "x": 1140,
      "y": 260,
      "targetMapId": "map5",
      "targetMapName": "Hẻm Núi Gió Hát",
      "badgeText": "🌀 SANG HẺM NÚI ⛰️"
    },
    "returnPortal": {
      "id": "return_portal_map4",
      "name": "Cổng Dịch Chuyển Trở Về Động Pha Lê",
      "x": 210,
      "y": 720,
      "targetMapId": "map3",
      "targetMapName": "Động Pha Lê Lấp Lánh",
      "isReturn": true,
      "badgeText": "↩️ VỀ ĐỘNG PHA LÊ 💎"
    }
  },`;

// Thay thế block map4 cũ
const startTag = '  "map4": {';
const endTag = '  "map5": {';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + newMap4Config + '\n' + content.slice(endIndex);
  fs.writeFileSync('./src/content/maps/mapsConfig.js', content, 'utf8');
  console.log('✓ mapsConfig.js updated successfully!');
} else {
  console.error('Could not find map4 tags in mapsConfig.js');
}
