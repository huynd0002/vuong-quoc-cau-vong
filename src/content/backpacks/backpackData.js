/**
 * src/content/backpacks/backpackData.js
 * Dữ liệu 4 loại Balo cho Bé mở rộng ô chứa vật phẩm trong Túi Đồ Của Bé.
 * Đáp ứng yêu cầu người dùng:
 * 1. 4 ô chứa Balo ở thanh tiêu đề (hình vẽ người dùng)
 * 2. Hình ảnh 3D Claymorphism các loại Balo
 * 3. Balo bán trong Chợ Cầu Vồng bằng Sao, giá từ nhỏ đến lớn
 * 4. Kéo Balo bỏ vào ô thì mở thêm ô chứa vật phẩm
 * 5. Mở thêm ô theo cấp độ 3 - 5 - 7 - 9
 */

export const BACKPACK_SLOTS_COUNT = 4; // 4 ô trang bị Balo ở header Túi Đồ Của Bé

export const BACKPACKS = [
  {
    id: 'backpack_bunny_pink',
    name: 'Balo Thỏ Bông Hồng',
    shortName: 'Balo Thỏ',
    icon: '🐰',
    asset: '/assets/items/backpacks/backpack_bunny_pink.png',
    slotsBonus: 3,
    costStars: 30, // Tăng giá Sao theo yêu cầu (30 Sao)
    tier: 1,
    tierLabel: 'Cấp 1',
    themeColor: '#ec4899',
    bgColor: '#fdf2f8',
    borderColor: '#f472b6',
    badgeText: '+3 Ô',
    description: 'Balo Thỏ Bông màu hồng xinh xắn, mở thêm +3 ô chứa đồ trong túi!'
  },
  {
    id: 'backpack_bear_brown',
    name: 'Balo Gấu Nâu Thám Hiểm',
    shortName: 'Balo Gấu',
    icon: '🐻',
    asset: '/assets/items/backpacks/backpack_bear_brown.png',
    slotsBonus: 5,
    costStars: 70, // Tăng giá Sao theo yêu cầu (70 Sao)
    tier: 2,
    tierLabel: 'Cấp 2',
    themeColor: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#f59e0b',
    badgeText: '+5 Ô',
    description: 'Balo chú gấu nâu thám hiểm bền bỉ, mở thêm +5 ô chứa đồ trong túi!'
  },
  {
    id: 'backpack_frog_green',
    name: 'Balo Ếch Xanh Mầm Non',
    shortName: 'Balo Ếch',
    icon: '🐸',
    asset: '/assets/items/backpacks/backpack_frog_green.png',
    slotsBonus: 7,
    costStars: 130, // Tăng giá Sao theo yêu cầu (130 Sao)
    tier: 3,
    tierLabel: 'Cấp 3',
    themeColor: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#22c55e',
    badgeText: '+7 Ô',
    description: 'Balo chú ếch xanh vui vẻ chống nước, mở thêm +7 ô chứa đồ trong túi!'
  },
  {
    id: 'backpack_rainbow_wings',
    name: 'Balo Cầu Vồng Thần Kỳ',
    shortName: 'Balo Cầu Vồng',
    icon: '🌈',
    asset: '/assets/items/backpacks/backpack_rainbow_wings.png',
    slotsBonus: 9,
    costStars: 220, // Tăng giá Sao theo yêu cầu (220 Sao)
    tier: 4,
    tierLabel: 'Cấp 4',
    themeColor: '#8b5cf6',
    bgColor: '#f5f3ff',
    borderColor: '#a855f7',
    badgeText: '+9 Ô',
    description: 'Balo cánh thiên thần 7 sắc cầu vồng kỳ diệu, mở thêm +9 ô chứa đồ trong túi!'
  }
];

export function getBackpack(id) {
  return BACKPACKS.find(b => b.id === id) || null;
}

/**
 * Tính giá bán lại Balo bị lỗ 50% so với giá mua gốc
 */
export function calculateBackpackSellPrice(backpackOrId) {
  const bp = typeof backpackOrId === 'string'
    ? getBackpack(backpackOrId)
    : backpackOrId;
  const originalPrice = bp?.costStars || 30;
  return Math.max(1, Math.floor(originalPrice * 0.5));
}
