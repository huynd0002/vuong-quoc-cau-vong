/**
 * MAPS CONFIG - Cấu hình bản đồ 6 Vùng Đất & Bản Đồ Đặc Biệt
 * Đã bỏ phần chào mừng khi đến Nông Trại theo yêu cầu người dùng.
 */

export const MAPS_CONFIG = {
  "map1": {
    "id": "map1",
    "order": 1,
    "name": "Làng Quê Yên Bình",
    "subtitle": "Vườn Cầu Vồng rực rỡ",
    "objective": "Nhận biết màu sắc và hình khối cơ bản",
    "bgKey": "map_1_bg",
    "heroSpawn": {
      "x": 380,
      "y": 510
    },
    "storyIntro": {
      "title": "Chào mừng đến Làng Quê Yên Bình!",
      "story": "Khu vườn thiên nhiên đang bị làn mây mù lú lẫn bao phủ. Bông hoa và các bạn Mầm quên mất màu sắc và hình khối. Cùng Bé Sâu và Thỏ Bông giúp các bạn nhớ lại nhé!",
      "voice": "Chào mừng bé đến với Làng Quê Yên Bình! Cùng Bé Sâu và Thỏ Bông giải cứu các bạn thiên nhiên nhé!"
    },
    "propsPuzzle": {
      "id": "puzzle_flower_gate",
      "name": "Cổng Hoa Cầu Vồng",
      "x": 1010,
      "y": 410,
      "requiredRescues": [
        "enc_map1_1",
        "enc_map1_2",
        "enc_map1_3"
      ],
      "minRequired": 3,
      "hintLocked": "Cổng hoa đang khép cánh! Bé hãy giúp tất cả các bạn nhỏ trên đường để mở đường tới Rồng Thần nhé!",
      "hintUnlocked": "Cổng hoa đã nở rộ ngát hương! Đường đến Rồng Thần đã mở!"
    },
    "props": [],
    "encounters": [
      {
        "id": "enc_map1_1",
        "name": "Nấm Con Vui Vẻ",
        "x": 570,
        "y": 505,
        "spriteKey": "mon_mushroom",
        "questionId": "q_map1_memory_animals",
        "reward": {
          "stars": 1,
          "exp": 10
        }
      },
      {
        "id": "enc_map1_2",
        "name": "Ong Vàng Chăm Chỉ",
        "x": 740,
        "y": 465,
        "spriteKey": "mon_bee",
        "questionId": "q_map1_pair_food",
        "reward": {
          "stars": 1,
          "exp": 10
        }
      },
      {
        "id": "enc_map1_3",
        "name": "Bọ Rùa Cánh Cam",
        "x": 890,
        "y": 440,
        "spriteKey": "mon_ladybug",
        "questionId": "q_map1_drag_size",
        "reward": {
          "stars": 1,
          "exp": 10
        }
      }
    ],
    "boss": {
      "id": "boss_map1",
      "name": "Rồng Thần Lửa Cầu Vồng",
      "spriteKey": "boss_dragon",
      "x": 1120,
      "y": 350,
      "questionId": "q_map1_boss",
      "phases": [
        {
          "phase": 1,
          "name": "Rồng Thần (Ngọn Lửa Khởi Nguyên)",
          "questionId": "q_map1_boss_p1",
          "instruction": "Pha 1: Gọi Rồng Thần thức dậy và xoa dịu ngọn lửa!"
        },
        {
          "phase": 2,
          "name": "Rồng Thần (Hỏa Long Rực Rỡ)",
          "questionId": "q_map1_boss_p2",
          "instruction": "Pha 2: Giải đố để thắp sáng cầu vồng kết bạn với Rồng Thần!"
        }
      ],
      "reward": {
        "stars": 3,
        "exp": 30,
        "unlockMap": "map2"
      }
    },
    "teleportPortal": {
      "id": "portal_map1",
      "name": "Cổng Dịch Chuyển Sang Vịnh Biển Pha Lê",
      "x": 1215,
      "y": 260,
      "targetMapId": "map2",
      "targetMapName": "Vịnh Biển Pha Lê",
      "badgeText": "🌀 SANG VỊNH BIỂN 🌊"
    },
    "returnPortal": {
      "id": "return_portal_map1",
      "name": "Cổng Dịch Chuyển Trở Về Nông Trại Nuôi Thú",
      "x": 160,
      "y": 320,
      "targetMapId": "map_pet_farm",
      "targetMapName": "Nông Trại Thú Cưng",
      "isReturn": true,
      "badgeText": "🏡 VỀ NÔNG TRẠI 🏡"
    }
  },
  "map2": {
    "id": "map2",
    "order": 2,
    "name": "Vịnh Biển Pha Lê",
    "subtitle": "Bờ biển sóng vỗ rì rào",
    "objective": "Đếm số lượng trong phạm vi 10",
    "bgKey": "map_2_bg",
    "heroSpawn": {
      "x": 300,
      "y": 500
    },
    "storyIntro": {
      "title": "Chào mừng đến Vịnh Biển Pha Lê!",
      "story": "Bờ biển cát vàng sóng vỗ rì rào. Các bạn sinh vật biển đang cần bé giúp đếm số lượng vỏ sò và sao biển. Cùng Bé Sâu và Thỏ Bông khám phá nhé!",
      "voice": "Chào mừng bé đến với Vịnh Biển Pha Lê! Cùng Bé Sâu và Thỏ Bông đếm số lượng các bạn sinh vật biển nhé!"
    },
    "propsPuzzle": {
      "id": "puzzle_pearl_shell",
      "name": "Vỏ Sò Khổng Lồ Phát Sáng",
      "x": 940,
      "y": 440,
      "requiredRescues": [
        "enc_map2_1",
        "enc_map2_2",
        "enc_map2_3"
      ],
      "hintLocked": "Vỏ Sò Khổng Lồ đang ngậm chặt! Bé hãy giúp Bạn Cua Kẹp, Sao Biển Vàng và Cua Ngọc Bích để mở đường tới Cua Vua Vỏ Ngọc nhé!",
      "hintUnlocked": "Vỏ Sò Khổng Lồ đã mở ra viên ngọc sáng bừng! Đường tới Cua Vua đã mở!"
    },
    "encounters": [
      {
        "id": "enc_map2_1",
        "name": "Cua Kẹp Nhỏ",
        "x": 600,
        "y": 490,
        "spriteKey": "mon_crab",
        "questionId": "q_map2_memory_mushrooms",
        "reward": {
          "stars": 2,
          "exp": 15
        }
      },
      {
        "id": "enc_map2_2",
        "name": "Sao Biển Vàng",
        "x": 760,
        "y": 460,
        "spriteKey": "mon_starfish",
        "questionId": "q_map2_pair_shapes",
        "reward": {
          "stars": 2,
          "exp": 15
        }
      },
      {
        "id": "enc_map2_3",
        "name": "Cua Ngọc Bích",
        "x": 890,
        "y": 430,
        "spriteKey": "mon_emerald_crab",
        "questionId": "q_map2_drag_count_sequence",
        "reward": {
          "stars": 2,
          "exp": 15
        }
      }
    ],
    "boss": {
      "id": "boss_map2",
      "name": "Cua Vua Vỏ Ngọc",
      "spriteKey": "boss_crab_king",
      "x": 1080,
      "y": 400,
      "questionId": "q_map2_boss",
      "phases": [
        {
          "phase": 1,
          "name": "Cua Vua (Sóng Biển Lấp Lánh)",
          "questionId": "q_map2_boss_p1",
          "instruction": "Pha 1: Xoa dịu bọt sóng biển!"
        },
        {
          "phase": 2,
          "name": "Cua Vua (Vỏ Ngọc Tỏa Sáng)",
          "questionId": "q_map2_boss_p2",
          "instruction": "Pha 2: Giải đố đếm rùa biển để kết bạn!"
        }
      ],
      "reward": {
        "stars": 5,
        "exp": 35,
        "unlockMap": "map3"
      }
    },
    "teleportPortal": {
      "id": "portal_map2",
      "name": "Cổng Dịch Chuyển Sang Động Pha Lê",
      "x": 1215,
      "y": 270,
      "targetMapId": "map3",
      "targetMapName": "Động Pha Lê Lấp Lánh",
      "badgeText": "🌀 SANG ĐỘNG PHA LÊ 💎"
    },
    "returnPortal": {
      "id": "return_portal_map2",
      "name": "Cổng Dịch Chuyển Trở Về Làng Quê Yên Bình",
      "x": 160,
      "y": 320,
      "targetMapId": "map1",
      "targetMapName": "Làng Quê Yên Bình",
      "isReturn": true,
      "badgeText": "↩️ VỀ LÀNG QUÊ 🌸"
    }
  },
  "map3": {
    "id": "map3",
    "order": 3,
    "name": "Động Pha Lê Lấp Lánh",
    "subtitle": "Hang đá lung linh sắc màu",
    "objective": "Phép cộng trực quan trong phạm vi 5",
    "bgKey": "map_3_bg",
    "heroSpawn": {
      "x": 260,
      "y": 520
    },
    "storyIntro": {
      "title": "Chào mừng đến Động Pha Lê Lấp Lánh!",
      "story": "Hang đá ngầm lung linh những mầm thạch nhũ kỳ diệu. Bé hãy dùng phép cộng vui nhộn để thắp sáng những viên ngọc năng lượng nhé!",
      "voice": "Chào mừng bé đến với Động Pha Lê Lấp Lánh! Cùng Bé Sâu thực hiện phép cộng kỳ diệu nhé!"
    },
    "propsPuzzle": {
      "id": "puzzle_crystal_pillar",
      "name": "Trụ Tinh Thể Năng Lượng",
      "x": 920,
      "y": 430,
      "requiredRescues": [
        "enc_map3_1",
        "enc_map3_2",
        "enc_map3_3"
      ],
      "hintLocked": "Trụ Tinh Thể chưa đủ ánh sáng! Bé hãy giúp Bạn Thạch Nhũ, Bướm Đêm và Dơi Ngọc Tím để mở lối vào sào huyệt Rồng Pha Lê nhé!",
      "hintUnlocked": "Trụ Tinh Thể đã sáng rực rỡ ngút ngàn! Cửa hang Rồng Thần đã mở!"
    },
    "encounters": [
      {
        "id": "enc_map3_1",
        "name": "Thạch Nhũ Tinh Tinh",
        "x": 540,
        "y": 510,
        "spriteKey": "mon_crystal_sprout",
        "questionId": "q_map3_memory_crystals",
        "reward": {
          "stars": 2,
          "exp": 20
        }
      },
      {
        "id": "enc_map3_2",
        "name": "Bướm Đêm Phát Sáng",
        "x": 740,
        "y": 440,
        "spriteKey": "mon_crystal_moth",
        "questionId": "q_map3_pair_quantities",
        "reward": {
          "stars": 2,
          "exp": 20
        }
      },
      {
        "id": "enc_map3_3",
        "name": "Dơi Pha Lê Ngọc Tím",
        "x": 620,
        "y": 310,
        "spriteKey": "mon_crystal_bat",
        "questionId": "q_map3_drag_stars_sequence",
        "reward": {
          "stars": 2,
          "exp": 20
        }
      }
    ],
    "boss": {
      "id": "boss_map3",
      "name": "Rồng Pha Lê Ngủ Quên",
      "spriteKey": "boss_crystal_dragon",
      "x": 1050,
      "y": 380,
      "questionId": "q_map3_boss",
      "phases": [
        {
          "phase": 1,
          "name": "Rồng Pha Lê (Đang chìm trong mộng)",
          "questionId": "q_map3_boss_p1",
          "instruction": "Pha 1: Thắp sáng ngọn đuốc đánh thức Rồng con!"
        },
        {
          "phase": 2,
          "name": "Rồng Pha Lê (Bừng tỉnh tỏa sáng)",
          "questionId": "q_map3_boss_p2",
          "instruction": "Pha 2: Cộng pha lê năng lượng hoàn thành giải cứu!"
        }
      ],
      "reward": {
        "stars": 6,
        "exp": 40,
        "unlockMap": "map4"
      }
    },
    "teleportPortal": {
      "id": "portal_map3",
      "name": "Cổng Dịch Chuyển Sang Rừng Kẹo Ngọt",
      "x": 1220,
      "y": 260,
      "targetMapId": "map4",
      "targetMapName": "Đền Mặt Trời Sa Mạc",
      "badgeText": "🌀 SANG ĐỀN SA MẠC ☀️"
    },
    "returnPortal": {
      "id": "return_portal_map3",
      "name": "Cổng Dịch Chuyển Trở Về Vịnh Biển Pha Lê",
      "x": 160,
      "y": 320,
      "targetMapId": "map2",
      "targetMapName": "Vịnh Biển Pha Lê",
      "isReturn": true,
      "badgeText": "↩️ VỀ VỊNH BIỂN 🌊"
    }
  },
  "map4": {
    "id": "map4",
    "order": 4,
    "name": "Đền Mặt Trời Sa Mạc",
    "subtitle": "Đấu trường cổ đại ngập tràn ánh dương",
    "objective": "Phép trừ trực quan trong phạm vi 5 đến 10",
    "bgKey": "map_4_bg",
    "heroSpawn": {
      "x": 280,
      "y": 650
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
        "questionId": "q_map4_memory_desert",
        "reward": {
          "stars": 3,
          "exp": 25
        }
      },
      {
        "id": "enc_map4_2",
        "name": "Bọ Cánh Cứng Ánh Dương",
        "x": 790,
        "y": 550,
        "spriteKey": "mon_scarab",
        "questionId": "q_map4_pair_math",
        "reward": {
          "stars": 3,
          "exp": 25
        }
      },
      {
        "id": "enc_map4_3",
        "name": "Chim Ưng Mặt Trời",
        "x": 640,
        "y": 410,
        "spriteKey": "mon_desert_falcon",
        "questionId": "q_map4_drag_even_sequence",
        "reward": {
          "stars": 3,
          "exp": 25
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
        "stars": 8,
        "exp": 45,
        "unlockMap": "map5"
      }
    },
    "teleportPortal": {
      "id": "portal_map4",
      "name": "Cổng Dịch Chuyển Sang Hẻm Núi Gió Hát",
      "x": 1180,
      "y": 260,
      "targetMapId": "map5",
      "targetMapName": "Hẻm Núi Gió Hát",
      "badgeText": "🌀 SANG HẺM NÚI ⛰️"
    },
    "returnPortal": {
      "id": "return_portal_map4",
      "name": "Cổng Dịch Chuyển Trở Về Động Pha Lê",
      "x": 200,
      "y": 540,
      "targetMapId": "map3",
      "targetMapName": "Động Pha Lê Lấp Lánh",
      "isReturn": true,
      "badgeText": "↩️ VỀ ĐỘNG PHA LÊ 💎"
    }
  },
  "map5": {
    "id": "map5",
    "order": 5,
    "name": "Hẻm Núi Gió Hát",
    "subtitle": "Đỉnh núi quanh năm gió mát",
    "objective": "So sánh Lớn hơn - Bé hơn - Bằng nhau",
    "bgKey": "map_5_bg",
    "heroSpawn": {
      "x": 280,
      "y": 510
    },
    "storyIntro": {
      "title": "Chào mừng đến Hẻm Núi Gió Hát!",
      "story": "Đỉnh núi quanh năm gió mát và chim ca líu lo. Cùng Bé Sâu và Thỏ Bông so sánh các bạn muông thú để tìm ra điều bất ngờ nhé!",
      "voice": "Chào mừng bé đến với Hẻm Núi Gió Hát! Cùng so sánh các bạn muông thú nhé!"
    },
    "propsPuzzle": {
      "id": "puzzle_wind_chime",
      "name": "Chuông Gió Núi Cao",
      "x": 920,
      "y": 430,
      "requiredRescues": [
        "enc_map5_1",
        "enc_map5_2"
      ],
      "hintLocked": "Chuông Gió chưa ngân vang! Bé hãy giúp Bạn Chim Lông Xù và Sóc Bay để gọi Cú Thông Thái nhé!",
      "hintUnlocked": "Chuông Gió đã ngân vang khúc nhạc êm đềm! Cú Thông Thái đã xuất hiện!"
    },
    "encounters": [
      {
        "id": "enc_map5_1",
        "name": "Chim Lông Xù",
        "x": 640,
        "y": 480,
        "spriteKey": "mon_sprout",
        "questionId": "q_map5_memory_canyon",
        "reward": {
          "stars": 3,
          "exp": 30
        }
      },
      {
        "id": "enc_map5_2",
        "name": "Sóc Bay Nhanh Nhẹn",
        "x": 830,
        "y": 450,
        "spriteKey": "mon_sprout",
        "questionId": "q_map5_pair_opposites",
        "reward": {
          "stars": 3,
          "exp": 30
        }
      }
    ],
    "boss": {
      "id": "boss_map5",
      "name": "Cú Thông Thái Núi Cao",
      "x": 1060,
      "y": 370,
      "questionId": "q_map5_boss",
      "phases": [
        {
          "phase": 1,
          "name": "Cú Thông Thái (Cơn Gió Thử Thách)",
          "questionId": "q_map5_boss_p1",
          "instruction": "Pha 1: So sánh số trứng trong tổ chim!"
        },
        {
          "phase": 2,
          "name": "Cú Thông Thái (Đôi Mắt Thông Tuệ)",
          "questionId": "q_map5_boss_p2",
          "instruction": "Pha 2: So sánh lá cây để hoàn tất thử thách!"
        }
      ],
      "reward": {
        "stars": 9,
        "exp": 50,
        "unlockMap": "map6"
      }
    },
    "teleportPortal": {
      "id": "portal_map5",
      "name": "Cổng Dịch Chuyển Sang Cung Đình Thần Long",
      "x": 1215,
      "y": 260,
      "targetMapId": "map6",
      "targetMapName": "Cung Đình Thần Long",
      "badgeText": "🌀 SANG CUNG ĐÌNH"
    },
    "returnPortal": {
      "id": "return_portal_map5",
      "name": "Cổng Dịch Chuyển Trở Về Rừng Kẹo Ngọt",
      "x": 150,
      "y": 330,
      "targetMapId": "map4",
      "targetMapName": "Rừng Kẹo Ngọt",
      "isReturn": true,
      "badgeText": "↩️ VỀ RỪNG KẸO 🍭"
    }
  },
  "map6": {
    "id": "map6",
    "order": 6,
    "name": "Cung Đình Thần Long",
    "subtitle": "Đỉnh cầu vồng ngập tràn ánh sáng",
    "objective": "Dãy quy luật và ôn tập tổng hợp",
    "bgKey": "map_6_bg",
    "heroSpawn": {
      "x": 300,
      "y": 500
    },
    "storyIntro": {
      "title": "Chào mừng đến Cung Đình Thần Long!",
      "story": "Đỉnh Cầu Vồng ngập tràn ánh sáng rạng ngời! Nơi đây Thần Long nắm giữ bí mật quy luật của vũ trụ và viên Pha Lê Tím cuối cùng!",
      "voice": "Chào mừng bé đến với Cung Đình Thần Long! Cùng hoàn thành thử thách cuối cùng nhé!"
    },
    "propsPuzzle": {
      "id": "puzzle_rainbow_harp",
      "name": "Cung Đàn Ánh Sáng",
      "x": 930,
      "y": 440,
      "requiredRescues": [
        "enc_map6_1",
        "enc_map6_2"
      ],
      "hintLocked": "Cung Đàn Cầu Vồng chưa đủ 7 dải màu! Bé hãy giúp Rồng Con và Kỳ Lân thắp sáng cung đàn nhé!",
      "hintUnlocked": "Cung Đàn đã tấu lên khúc ca khải hoàn rực rỡ! Thần Long Cầu Vồng đã giáng trần!"
    },
    "encounters": [
      {
        "id": "enc_map6_1",
        "name": "Rồng Con Mây Trắng",
        "x": 650,
        "y": 480,
        "spriteKey": "mon_sprout",
        "questionId": "q_map6_memory_rainbow",
        "reward": {
          "stars": 4,
          "exp": 35
        }
      },
      {
        "id": "enc_map6_2",
        "name": "Kỳ Lân Ánh Sáng",
        "x": 840,
        "y": 450,
        "spriteKey": "mon_sprout",
        "questionId": "q_map6_pair_logic",
        "reward": {
          "stars": 4,
          "exp": 35
        }
      }
    ],
    "boss": {
      "id": "boss_map6",
      "name": "Thần Long Cầu Vồng",
      "x": 1070,
      "y": 360,
      "questionId": "q_map6_boss",
      "phases": [
        {
          "phase": 1,
          "name": "Thần Long (Màn Sương Ảo Mộng)",
          "questionId": "q_map6_boss_p1",
          "instruction": "Pha 1: Tìm quy luật hoa quả trên mây!"
        },
        {
          "phase": 2,
          "name": "Thần Long (Ánh Sáng Hòa Bình)",
          "questionId": "q_map6_boss_p2",
          "instruction": "Pha 2: Giải đố 7 sắc cầu vồng kết thúc chiến dịch!"
        }
      ],
      "reward": {
        "stars": 15,
        "exp": 60,
        "unlockMap": null
      }
    },
    "teleportPortal": {
      "id": "portal_map6",
      "name": "Cổng Dịch Chuyển Trở Về Làng Quê Yên Bình",
      "x": 1220,
      "y": 260,
      "targetMapId": "map1",
      "targetMapName": "Làng Quê Yên Bình",
      "badgeText": "🌀 VỀ LÀNG QUÊ 🌸"
    },
    "returnPortal": {
      "id": "return_portal_map6",
      "name": "Cổng Dịch Chuyển Trở Về Hẻm Núi Gió Hát",
      "x": 160,
      "y": 320,
      "targetMapId": "map5",
      "targetMapName": "Hẻm Núi Gió Hát",
      "isReturn": true,
      "badgeText": "↩️ VỀ HẺM NÚI ⛰️"
    }
  }
};

export const SPECIAL_MAPS_CONFIG = {
  "map_pet_farm": {
    "id": "map_pet_farm",
    "order": 99,
    "name": "Nông Trại Thú Cưng",
    "subtitle": "Vương quốc ngọt ngào của các bạn nhỏ",
    "objective": "Chăm sóc cún con & Bước vào Cổng Hành Trình để khám phá!",
    "bgKey": "map_pet_farm_bg",
    "heroSpawn": {
      "x": 420,
      "y": 460
    },
    "storyIntro": null,
    "propsPuzzle": null,
    "props": [],
    "encounters": [],
    "boss": null,
    "petStations": [
      {
        "id": "station_feed",
        "name": "Máng Ăn Thần Kỳ",
        "type": "feed",
        "x": 235,
        "y": 360,
        "icon": "🥕",
        "badge": "MÁNG CÀ RỐT & TÁO",
        "auraColor": 16096779,
        "actionPrompt": "Cho cún ăn cà rốt và táo giòn ngon miệng"
      },
      {
        "id": "station_water",
        "name": "Máng Nước Suối Trong Lành",
        "type": "water",
        "x": 404,
        "y": 242,
        "interactionPoint": {
          "x": 373,
          "y": 230
        },
        "icon": "💧",
        "badge": "MÁNG NƯỚC SUỐI",
        "auraColor": 3718648,
        "actionPrompt": "Cho cún uống dòng nước suối ngọt mát"
      },
      {
        "id": "station_bath",
        "name": "Bồn Tắm Suối Nước Ấm",
        "type": "bath",
        "x": 512,
        "y": 597,
        "interactionPoint": {
          "x": 507,
          "y": 562
        },
        "icon": "🛁",
        "badge": "BỒN TẮM NƯỚC SUỐI",
        "auraColor": 3718648,
        "actionPrompt": "Tắm cho cún sạch sẽ với bọt xà phòng thơm tho"
      },
      {
        "id": "station_shelter",
        "name": "Chỗ Nằm & Đệm Ngủ Ấm Áp",
        "type": "shelter",
        "x": 578,
        "y": 360,
        "icon": "🛏️",
        "badge": "ĐỆM NGỦ ẤM ÁP",
        "auraColor": 16498468,
        "actionPrompt": "Cho cún nằm ngủ một giấc êm đềm"
      },
      {
        "id": "station_play",
        "name": "Bãi Cỏ Vui Chơi",
        "type": "play",
        "x": 790,
        "y": 575,
        "icon": "⚽",
        "badge": "BÓNG CẦU VỒNG",
        "auraColor": 1096065,
        "actionPrompt": "Chơi bóng tung tăng cùng Thỏ Bông"
      },
      {
        "id": "station_potty",
        "name": "Bồn Cầu Thú Cưng Sạch Sẽ",
        "type": "potty",
        "x": 1040,
        "y": 365,
        "icon": "🚽",
        "badge": "BỒN CẦU THÚ CƯNG",
        "auraColor": 9133302,
        "actionPrompt": "Cho cún đi vệ sinh vào bồn cầu"
      },
      {
        "id": "station_farm_kitchen",
        "name": "Cửa Vào Bếp Cầu Vồng",
        "type": "kitchen",
        "x": 740,
        "y": 310,
        "icon": "🍳",
        "badge": "CỬA VÀO BẾP 🍳",
        "auraColor": 16096779,
        "actionPrompt": "Bước vào Căn Bếp Cầu Vồng để nấu ăn ngon và bổ dưỡng"
      },
      {
        "id": "station_farm_fishing",
        "name": "Hồ Câu Lá Sen",
        "type": "fishing_pond",
        "x": 235,
        "y": 615,
        "icon": "🎣",
        "badge": "🎣",
        "auraColor": 3718648,
        "actionPrompt": "Hồ Câu"
      },
      

      {
        "id": "station_farm_market",
        "name": "Chợ Cầu Vồng",
        "type": "rainbow_market",
        "x": 935,
        "y": 605,
        "icon": "🏮",
        "badge": "🏮 🐚",
        "auraColor": 16498468,
        "actionPrompt": "Chợ"
      }
    ],
    "returnPortal": {
      "id": "portal_pet_farm_to_journey",
      "name": "Cổng Bắt Đầu Hành Trình",
      "x": 180,
      "y": 440,
      "targetMapId": "map1",
      "targetMapName": "Làng Quê Yên Bình",
      "isReturn": false,
      "badgeText": "🌀 CỔNG HÀNH TRÌNH 🚀"
    },
    "extraPortals": [
      {
        "id": "portal_farm_to_fishing",
        "name": "Hồ Câu Lá Sen",
        "x": 235,
        "y": 615,
        "targetMapId": "map_fishing_pond",
        "targetMapName": "Hồ Câu Lá Sen",
        "isReturn": false,
        "badgeText": "🎣 HỒ CÂU LÁ SEN 🪷"
      },
      {
        "id": "portal_farm_to_market",
        "name": "Chợ Cầu Vồng",
        "x": 1040,
        "y": 560,
        "targetMapId": "map_rainbow_market",
        "targetMapName": "Chợ Cầu Vồng",
        "isReturn": false,
        "badgeText": "🏮 CHỢ CẦU VỒNG ⭐"
      }
    ]
  },
  "map_kitchen": {
    "id": "map_kitchen",
    "order": 100,
    "name": "Bếp Cầu Vồng",
    "subtitle": "Chuẩn bị bữa ăn bổ dưỡng & tiếp thêm sức mạnh phiêu lưu",
    "objective": "Mua nguyên liệu bằng Sao ở tủ lạnh → kéo vào bếp → nấu và cất vào túi!",
    "bgKey": "map_kitchen_bg",
    "heroSpawn": {
      "x": 320,
      "y": 620
    },
    "storyIntro": null,
    "propsPuzzle": null,
    "props": [],
    "encounters": [],
    "boss": null,
    "kitchenStations": [
      {
        "id": "station_prep",
        "name": "Bồn Rửa Tay Sạch Sẽ",
        "type": "prep",
        "x": 605,
        "y": 131,
        "icon": "🧼",
        "badge": "1. RỬA TAY SẠCH SẼ 🧼",
        "auraColor": 3718648,
        "actionPrompt": "Rửa tay bằng xà phòng thơm tho trước khi vào bếp nhé!"
      },
      {
        "id": "station_pantry",
        "name": "Tủ Lạnh Nguyên Liệu",
        "type": "pantry",
        "x": 398,
        "y": 291,
        "icon": "🥕",
        "badge": "2. TỦ LẠNH · MUA BẰNG SAO ⭐",
        "auraColor": 1096065,
        "actionPrompt": "Dùng Sao từ thử thách để lấy nguyên liệu vào túi rồi qua bếp nhé!"
      },
      {
        "id": "station_cook",
        "name": "Bếp Lò Nấu Ăn Thần Kỳ",
        "type": "cook",
        "x": 981,
        "y": 167,
        "icon": "🍳",
        "badge": "BẾP LÒ NẤU ĂN THẦN KỲ 🍳",
        "auraColor": 16096779,
        "actionPrompt": "Kéo nguyên liệu vào nồi/chảo thần kỳ và nấu món ngon nhé!"
      },
      {
        "id": "station_dining",
        "name": "Bàn Ăn & Hộp Món Ăn",
        "type": "dining",
        "x": 760,
        "y": 640,
        "icon": "🍽️",
        "badge": "4. THƯỞNG THỨC & HỒI TIM 🍽️",
        "auraColor": 15485081,
        "actionPrompt": "Thưởng thức món ăn bé tự làm để hồi tim và nhận tim tạm cho trận kế tiếp!"
      },
      {
        "id": "station_door",
        "name": "Cửa Ra Nông Trại",
        "type": "door",
        "x": 180,
        "y": 660,
        "icon": "🚪",
        "badge": "5. CỬA RA VÀO 🚪",
        "auraColor": 9133302,
        "actionPrompt": "Bước ra ngoài để trở về Nông Trại Thú Cưng"
      }
    ],
    "returnPortal": {
      "id": "portal_kitchen_to_farm",
      "name": "Cửa Về Nông Trại",
      "x": 220,
      "y": 560,
      "targetMapId": "map_pet_farm",
      "targetMapName": "Nông Trại Thú Cưng",
      "isReturn": true,
      "badgeText": "🚪 RA NÔNG TRẠI 🏡"
    }
  },
  "map_fishing_pond": {
    "id": "map_fishing_pond",
    "order": 101,
    "name": "Hồ Câu Lá Sen",
    "subtitle": "Góc thiên nhiên yên bình — kiên nhẫn quan sát phao & nhịp nước",
    "objective": "Mượn cần ở Chú Rái Cá → Ra Bến Sen hoặc Bến Nắng câu cá → Xem Sổ Cá & Giỏ Cá!",
    "bgKey": "map_fishing_pond_bg",
    "heroSpawn": {
      "x": 250,
      "y": 535
    },
    "storyIntro": null,
    "propsPuzzle": null,
    "props": [],
    "encounters": [],
    "boss": null,
    "pondWaterZone": {
      "cx": 540,
      "cy": 410,
      "rx": 305,
      "ry": 175,
      "angle": 7,
      "dockPoly": [
        { "x": 605, "y": 375 },
        { "x": 715, "y": 445 },
        { "x": 780, "y": 395 },
        { "x": 850, "y": 370 },
        { "x": 840, "y": 310 },
        { "x": 665, "y": 270 },
        { "x": 620, "y": 340 }
      ],
      "walkableDockRect": {
        "xMin": 615,
        "xMax": 830,
        "yMin": 290,
        "yMax": 425
      }
    },
    "fishingStations": [
      {
        "id": "station_lotus_dock",
        "name": "Bến Câu",
        "type": "dock",
        "dockId": "lotus_dock",
        "x": 688,
        "y": 360,
        "interactionPoint": {
          "x": 688,
          "y": 360
        },
        "castTarget": {
          "x": 485,
          "y": 445
        },
        "icon": "🎣",
        "badge": "🎣",
        "auraColor": 3718648,
        "actionPrompt": "Bắt đầu câu cá"
      },
      {
        "id": "station_sunny_dock",
        "name": "Bến Nắng",
        "type": "dock",
        "dockId": "sunny_dock",
        "mergedInto": "station_lotus_dock",
        "x": 688,
        "y": 360,
        "interactionPoint": {
          "x": 688,
          "y": 360
        },
        "castTarget": {
          "x": 485,
          "y": 445
        },
        "icon": "☀️",
        "badge": "☀️ 🎣",
        "auraColor": 16498468,
        "actionPrompt": "Bắt đầu câu cá"
      },
      {
        "id": "station_otter_guide",
        "name": "Chú Rái Cá",
        "type": "otter_guide",
        "x": 855,
        "y": 455,
        "interactionPoint": {
          "x": 865,
          "y": 455
        },
        "icon": "🦦",
        "badge": "🦦",
        "auraColor": 1096065,
        "actionPrompt": "Rái cá"
      },
      {
        "id": "station_prep_basket",
        "name": "Túi Cá",
        "type": "prep_basket",
        "x": 1035,
        "y": 345,
        "interactionPoint": {
          "x": 965,
          "y": 405
        },
        "icon": "🎒",
        "badge": "🎒",
        "auraColor": 16096779,
        "actionPrompt": "Túi"
      },
      {
        "id": "station_fish_book",
        "name": "Sổ Huy Hiệu",
        "type": "fish_book",
        "x": 910,
        "y": 315,
        "interactionPoint": {
          "x": 865,
          "y": 365
        },
        "icon": "🏅",
        "badge": "🏅",
        "auraColor": 9133302,
        "actionPrompt": "Huy hiệu"
      }
    ],
    "returnPortal": {
      "id": "portal_pond_to_farm",
      "name": "Về Nông Trại",
      "x": 150,
      "y": 510,
      "targetMapId": "map_pet_farm",
      "targetMapName": "Nông Trại",
      "isReturn": true,
      "badgeText": "🏡"
    },
    "teleportPortal": {
      "id": "portal_pond_to_market",
      "name": "Chợ Cầu Vồng",
      "x": 1120,
      "y": 510,
      "targetMapId": "map_rainbow_market",
      "targetMapName": "Chợ Cầu Vồng",
      "isReturn": false,
      "badgeText": "🏮 ⭐"
    }
  },
  "map_rainbow_market": {
    "id": "map_rainbow_market",
    "order": 102,
    "name": "Chợ Cầu Vồng",
    "subtitle": "Mua cần, mua mồi & bán cá",
    "objective": "⭐ Cân cá · 🎣 Mua cần & mồi",
    "bgKey": "map_rainbow_market_bg",
    "heroSpawn": {
      "x": 640,
      "y": 545
    },
    "storyIntro": null,
    "propsPuzzle": null,
    "props": [],
    "encounters": [],
    "boss": null,
    "marketStations": [
      {
        "id": "station_rod_bait_stall",
        "name": "Quầy Cô Vịt",
        "type": "rod_bait_stall",
        "x": 310,
        "y": 275,
        "interactionPoint": {
          "x": 345,
          "y": 345
        },
        "icon": "🦆",
        "badge": "🦆 🎣",
        "auraColor": 16498468,
        "actionPrompt": "Cần & Mồi"
      },
      {
        "id": "station_fish_scale_stall",
        "name": "Sạp Cô Mèo",
        "type": "fish_scale_stall",
        "x": 965,
        "y": 275,
        "interactionPoint": {
          "x": 930,
          "y": 345
        },
        "icon": "🐱",
        "badge": "🐱 ⚖️",
        "auraColor": 15485081,
        "actionPrompt": "Cân & Bán"
      },
      {
        "id": "station_help_board",
        "name": "Bảng Quà",
        "type": "help_board",
        "x": 240,
        "y": 465,
        "interactionPoint": {
          "x": 290,
          "y": 480
        },
        "icon": "📋",
        "badge": "📋 🎁",
        "auraColor": 1096065,
        "actionPrompt": "Tặng cá"
      },
      {
        "id": "station_veggie_corner",
        "name": "Góc Rau Củ",
        "type": "veggie_corner",
        "x": 1030,
        "y": 465,
        "interactionPoint": {
          "x": 975,
          "y": 480
        },
        "icon": "🥬",
        "badge": "🥕 🍳",
        "auraColor": 3718648,
        "actionPrompt": "Vào bếp"
      }
    ],
    "returnPortal": {
      "id": "portal_market_to_pond",
      "name": "Về Hồ Câu",
      "x": 180,
      "y": 520,
      "targetMapId": "map_fishing_pond",
      "targetMapName": "Hồ Câu",
      "isReturn": true,
      "badgeText": "🎣"
    },
    "teleportPortal": {
      "id": "portal_market_to_farm",
      "name": "Về Nông Trại",
      "x": 640,
      "y": 505,
      "targetMapId": "map_pet_farm",
      "targetMapName": "Nông Trại",
      "isReturn": false,
      "badgeText": "🏡"
    },
    "extraPortals": [
      {
        "id": "portal_market_to_fashion",
        "name": "Phố Thời Trang Cầu Vồng",
        "x": 1120,
        "y": 520,
        "targetMapId": "map_fashion_street",
        "targetMapName": "Phố Thời Trang Cầu Vồng",
        "isReturn": false,
        "badgeText": ""
      }
    ]
  },
  "map_fashion_street": {
    "id": "map_fashion_street",
    "order": 103,
    "name": "Phố Thời Trang Cầu Vồng",
    "subtitle": "Kinh đô thời trang lộng lẫy và rực rỡ sắc màu",
    "objective": "👑 Chọn phụ kiện · 🎒 Quầy Balo Mở Rộng Túi Đồ",
    "bgKey": "map_fashion_street_bg",
    "heroSpawn": {
      "x": 640,
      "y": 500
    },
    "storyIntro": null,
    "propsPuzzle": null,
    "props": [],
    "encounters": [],
    "boss": null,
    "fashionStations": [
      {
        "id": "station_squirrel_accessories",
        "name": "Quầy Phụ Kiện Bạn Sóc",
        "type": "squirrel_accessories",
        "tabIndex": 0,
        "x": 300,
        "y": 340,
        "interactionPoint": { "x": 300, "y": 420 },
        "icon": "🐿️",
        "badge": "🐿️ 👑 QUẦY PHỤ KIỆN",
        "auraColor": 16766720,
        "actionPrompt": "Chọn phụ kiện"
      },
      {
        "id": "station_backpack_stall",
        "name": "Quầy Balo Mới",
        "type": "backpack_stall",
        "x": 980,
        "y": 340,
        "interactionPoint": { "x": 980, "y": 420 },
        "icon": "🎒",
        "badge": "🎒 QUẦY BALO MỚI",
        "auraColor": 9133302,
        "actionPrompt": "Mua Balo"
      }
    ],
    "returnPortal": {
      "id": "portal_fashion_to_market",
      "name": "Về Chợ Cầu Vồng",
      "x": 160,
      "y": 510,
      "targetMapId": "map_rainbow_market",
      "targetMapName": "Chợ Cầu Vồng",
      "isReturn": true,
      "badgeText": "🏮 VỀ CHỢ CẦU VỒNG 🏮"
    },
    "teleportPortal": {
      "id": "portal_fashion_to_farm",
      "name": "Về Nông Trại Thú Cưng",
      "x": 1120,
      "y": 510,
      "targetMapId": "map_pet_farm",
      "targetMapName": "Nông Trại Thú Cưng",
      "isReturn": false,
      "badgeText": "🏡 VỀ NÔNG TRẠI 🐾"
    }
  }
};

export function getMapConfig(mapId) {
  return SPECIAL_MAPS_CONFIG[mapId] || MAPS_CONFIG[mapId] || MAPS_CONFIG.map1;
}

export function getAllMaps() {
  return Object.values(MAPS_CONFIG);
}
