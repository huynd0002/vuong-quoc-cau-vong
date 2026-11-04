/**
 * Campaign Graph Configuration
 * Định nghĩa đồ thị chiến dịch 6 vùng đất, nhiệm vụ chính/phụ, điều kiện mở khóa và vật phẩm cốt truyện.
 */

export const CAMPAIGN_ZONES = {
  map1: {
    id: 'map1',
    order: 1,
    name: 'Làng Quê Yên Bình',
    subtitle: 'Vườn Cầu Vồng rực rỡ',
    learningFocus: 'Màu sắc và hình khối cơ bản',
    colorCode: '#FF6B6B',
    prerequisites: [],
    storyItem: {
      id: 'crystal_red',
      name: 'Pha Lê Đỏ Tình Bạn',
      icon: '💎'
    },
    mainQuests: [
      { id: 'quest_m1_sprout', title: 'Giúp Bạn Mầm Lá nhớ lại màu sắc', encounterId: 'enc_map1_1' },
      { id: 'quest_m1_shroom', title: 'Giúp Nấm Con Vui Vẻ nhớ lại hình khối', encounterId: 'enc_map1_2' },
      { id: 'quest_m1_gate', title: 'Kích hoạt Cổng Hoa Cầu Vồng', type: 'puzzle' },
      { id: 'quest_m1_boss', title: 'Đánh thức & giải cứu Nấm Mũ Đỏ', bossId: 'boss_map1' }
    ],
    sideQuests: [
      { id: 'side_m1_pet', title: 'Thỏ Bông đạt mức thân thiết Cấp 2', type: 'pet_affinity', target: 2 },
      { id: 'side_m1_perfect', title: 'Hoàn thành 3 câu đố không cần thử lại', type: 'first_try_streak', target: 3 }
    ],
    nextZoneId: 'map2'
  },

  map2: {
    id: 'map2',
    order: 2,
    name: 'Vịnh Biển Pha Lê',
    subtitle: 'Bờ biển sóng vỗ rì rào',
    learningFocus: 'Đếm số lượng trong phạm vi 10',
    colorCode: '#FFA94D',
    prerequisites: ['map1'],
    storyItem: {
      id: 'crystal_orange',
      name: 'Pha Lê Cam Năng Động',
      icon: '💎'
    },
    mainQuests: [
      { id: 'quest_m2_crab', title: 'Giúp Cua Kẹp Nhỏ đếm vỏ sò', encounterId: 'enc_map2_1' },
      { id: 'quest_m2_boss', title: 'Giải cứu Cua Vua Vỏ Ngọc', bossId: 'boss_map2' }
    ],
    sideQuests: [
      { id: 'side_m2_feed', title: 'Cho Thỏ Bông ăn no trên 90%', type: 'pet_hunger', target: 90 }
    ],
    nextZoneId: 'map3'
  },

  map3: {
    id: 'map3',
    order: 3,
    name: 'Động Pha Lê Lấp Lánh',
    subtitle: 'Hang đá lung linh sắc màu',
    learningFocus: 'Phép cộng trực quan trong phạm vi 5',
    colorCode: '#FFD43B',
    prerequisites: ['map2'],
    storyItem: {
      id: 'crystal_yellow',
      name: 'Pha Lê Vàng Rực Rỡ',
      icon: '💎'
    },
    mainQuests: [
      { id: 'quest_m3_crystal', title: 'Cộng đá năng lượng cùng Thạch Nhũ', encounterId: 'enc_map3_1' },
      { id: 'quest_m3_moth', title: 'Thắp sáng hang đá cùng Bướm Đêm', encounterId: 'enc_map3_2' },
      { id: 'quest_m3_bat', title: 'Thu thập đá tím cùng Dơi Pha Lê', encounterId: 'enc_map3_3' },
      { id: 'quest_m3_boss', title: 'Đánh thức Rồng Pha Lê Ngủ Quên', bossId: 'boss_map3' }
    ],
    sideQuests: [
      { id: 'side_m3_clean', title: 'Tắm sạch cho Thỏ Bông sau khi khám phá động', type: 'pet_clean', target: 90 }
    ],
    nextZoneId: 'map4'
  },

  map4: {
    id: 'map4',
    order: 4,
    name: 'Đền Mặt Trời Sa Mạc',
    subtitle: 'Đấu trường cổ đại ngập tràn ánh dương',
    learningFocus: 'Phép trừ trực quan trong phạm vi 5 đến 10',
    colorCode: '#f59e0b',
    prerequisites: ['map3'],
    storyItem: {
      id: 'crystal_green',
      name: 'Pha Lê Xanh Hy Vọng',
      icon: '💎'
    },
    mainQuests: [
      { id: 'quest_m4_cookie', title: 'Chia sẻ bánh cùng Bánh Quy Tinh Nghịch', encounterId: 'enc_map4_1' },
      { id: 'quest_m4_boss', title: 'Giúp Vua Gấu Kẹo Bông bình tĩnh', bossId: 'boss_map4' }
    ],
    sideQuests: [
      { id: 'side_m4_play', title: 'Chơi ném bóng cùng Thỏ Bông trong Rừng Kẹo', type: 'pet_play', target: 1 }
    ],
    nextZoneId: 'map5'
  },

  map5: {
    id: 'map5',
    order: 5,
    name: 'Hẻm Núi Gió Hát',
    subtitle: 'Đỉnh núi quanh năm gió mát',
    learningFocus: 'So sánh Lớn hơn - Bé hơn - Bằng nhau',
    colorCode: '#4DABF7',
    prerequisites: ['map4'],
    storyItem: {
      id: 'crystal_blue',
      name: 'Pha Lê Lam Trí Tuệ',
      icon: '💎'
    },
    mainQuests: [
      { id: 'quest_m5_bird', title: 'So sánh quả ngọt cùng Chim Lông Xù', encounterId: 'enc_map5_1' },
      { id: 'quest_m5_boss', title: 'Vượt qua câu đố của Cú Thông Thái', bossId: 'boss_map5' }
    ],
    sideQuests: [
      { id: 'side_m5_energy', title: 'Giữ Thỏ Bông luôn tràn đầy năng lượng', type: 'pet_energy', target: 80 }
    ],
    nextZoneId: 'map6'
  },

  map6: {
    id: 'map6',
    order: 6,
    name: 'Cung Đình Thần Long',
    subtitle: 'Đỉnh cầu vồng ngập tràn ánh sáng',
    learningFocus: 'Quy luật chuỗi hình và tổng kết',
    colorCode: '#9775FA',
    prerequisites: ['map5'],
    storyItem: {
      id: 'crystal_purple',
      name: 'Pha Lê Tím Diệu Kỳ',
      icon: '💎'
    },
    mainQuests: [
      { id: 'quest_m6_cloud', title: 'Tìm quy luật mây cùng Rồng Con Mây Trắng', encounterId: 'enc_map6_1' },
      { id: 'quest_m6_boss', title: 'Hội ngộ và thanh tẩy Thần Long Cầu Vồng', bossId: 'boss_map6' }
    ],
    sideQuests: [
      { id: 'side_m6_all_crystals', title: 'Thu thập đủ cả 6 viên Pha Lê Cầu Vồng', type: 'crystals_count', target: 6 }
    ],
    nextZoneId: 'finale'
  }
};

export const SPECIAL_ZONES = {
  map_pet_farm: {
    id: 'map_pet_farm',
    order: 99,
    name: 'Nông Trại Thú Cưng',
    subtitle: 'Vương quốc ngọt ngào của các bạn nhỏ',
    learningFocus: 'Tình yêu thương và chăm sóc thú cưng',
    colorCode: '#4ade80'
  },
  map_kitchen: {
    id: 'map_kitchen',
    order: 100,
    name: 'Căn Bếp Thần Kỳ',
    subtitle: 'Nấu ăn ngon và bổ dưỡng',
    learningFocus: 'Dinh dưỡng và vệ sinh sạch sẽ',
    colorCode: '#f59e0b'
  },
  map_fishing_pond: {
    id: 'map_fishing_pond',
    order: 101,
    name: 'Hồ Câu Lá Sen',
    subtitle: 'Quan sát phao, rèn tính kiên nhẫn và làm quen cân nặng',
    learningFocus: 'Kiên nhẫn, nhịp điệu và so sánh Nặng hơn — Nhẹ hơn',
    colorCode: '#38bdf8'
  },
  map_rainbow_market: {
    id: 'map_rainbow_market',
    order: 102,
    name: 'Chợ Cầu Vồng',
    subtitle: 'Mua cần câu, mua mồi và cân cá đổi Vỏ Sò',
    learningFocus: 'Đo khối lượng (gam) và trao đổi Vỏ Sò',
    colorCode: '#ec4899'
  },
  map_fashion_street: {
    id: 'map_fashion_street',
    order: 103,
    name: 'Phố Thời Trang Cầu Vồng',
    subtitle: 'Kinh đô thời trang lộng lẫy và rực rỡ sắc màu',
    learningFocus: 'Tư duy thẩm mỹ, dành dụm Sao và quản lý tài chính',
    colorCode: '#a855f7'
  }
};

export const GRAND_FINALE = {
  id: 'finale',
  title: 'Đại Tiệc Cầu Vồng Khải Hoàn',
  subtitle: 'Vương Quốc Cầu Vồng hoàn toàn khôi phục!',
  requiredCrystals: [
    'crystal_red',
    'crystal_orange',
    'crystal_yellow',
    'crystal_green',
    'crystal_blue',
    'crystal_purple'
  ],
  message: 'Chúc mừng bé đã hoàn thành xuất sắc toàn bộ chuyến phiêu lưu! Cả 6 viên pha lê đã tỏa sáng, mang lại nụ cười và phép màu rực rỡ cho muôn loài bạn bè.'
};

/**
 * Kiểm tra xem một vùng đất đã đủ điều kiện mở khóa hay chưa
 */
export function isZoneUnlockable(zoneId, saveState) {
  const zone = CAMPAIGN_ZONES[zoneId];
  if (!zone) return false;
  if (!zone.prerequisites || zone.prerequisites.length === 0) return true;

  const completedMaps = saveState?.campaign?.completedMaps || [];
  return zone.prerequisites.every(prereq => completedMaps.includes(prereq));
}

/**
 * Kiểm tra xem người chơi đã hoàn thành vùng đất này chưa
 */
export function isZoneCompleted(zoneId, saveState) {
  const completedMaps = saveState?.campaign?.completedMaps || [];
  return completedMaps.includes(zoneId);
}

/**
 * Kiểm tra điều kiện mở Grand Finale
 */
export function canAccessGrandFinale(saveState) {
  const storyItems = saveState?.campaign?.storyItems || [];
  return GRAND_FINALE.requiredCrystals.every(crystalId => storyItems.includes(crystalId));
}

/**
 * Lấy tiến độ tổng thể của chiến dịch (% hoàn thành)
 */
export function getCampaignProgress(saveState) {
  const totalZones = Object.keys(CAMPAIGN_ZONES).length;
  const completedCount = (saveState?.campaign?.completedMaps || []).length;
  const collectedCrystals = (saveState?.campaign?.storyItems || []).length;
  const percentage = Math.round((completedCount / totalZones) * 100);

  return {
    totalZones,
    completedCount,
    collectedCrystals,
    percentage: Math.min(100, percentage),
    canFinale: canAccessGrandFinale(saveState)
  };
}
