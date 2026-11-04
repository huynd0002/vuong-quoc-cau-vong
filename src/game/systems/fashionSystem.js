/**
 * Fashion System — Phố Phụ Kiện Thời Trang Cầu Vồng
 * Quản lý phụ kiện nhân vật chibi gắn trên Bé Sam, mua sắm bằng Sao,
 * thử phụ kiện, tủ đồ cá nhân, mục tiêu dành dụm và album kỷ niệm.
 */

import { saveAdapter } from '../../services/save/saveAdapter.js';

// Asset URLs cho phụ kiện tạo sinh (AI Generative Chibi Accessories)
export const FASHION_ASSETS = {
  accRainbowCrown: '/assets/fashion/accessories/acc_rainbow_crown.png',
  accCatEarsBow: '/assets/fashion/accessories/acc_cat_ears_bow.png',
  accWitchHat: '/assets/fashion/accessories/acc_witch_hat.png',
  accHeartGlasses: '/assets/fashion/accessories/acc_heart_glasses.png',
  accFairyWings: '/assets/fashion/accessories/acc_fairy_wings.png',
  accStrawHat: '/assets/fashion/accessories/acc_straw_hat.png',
  accAngelHalo: '/assets/fashion/accessories/acc_angel_halo.png',
  accPandaHeadband: '/assets/fashion/accessories/acc_panda_headband.png',
  accBunnyFlowerEars: '/assets/fashion/accessories/acc_bunny_flower_ears.png',
  accStarGlasses: '/assets/fashion/accessories/acc_star_glasses.png',
  accSuperCape: '/assets/fashion/accessories/acc_super_cape.png',
  accFlowerWreath: '/assets/fashion/accessories/acc_flower_wreath.png',
  accBeretArtist: '/assets/fashion/accessories/acc_beret_artist.png',
  accChefHat: '/assets/fashion/accessories/acc_chef_hat.png',
  accSailorHat: '/assets/fashion/accessories/acc_sailor_hat.png',
  accCowboyHat: '/assets/fashion/accessories/acc_cowboy_hat.png',
  accFrogHat: '/assets/fashion/accessories/acc_frog_hat.png',
  accRainbowBalloons: '/assets/fashion/accessories/acc_rainbow_balloons.png',
  accGiantLollipop: '/assets/fashion/accessories/acc_giant_lollipop.png',
  accPinwheel: '/assets/fashion/accessories/acc_pinwheel.png',
  accStarWand: '/assets/fashion/accessories/acc_star_wand.png',
  npcSquirrelIcon: '/assets/fashion/npc_squirrel_accessories.png',
  defaultAvatar: '/assets/hero/sau_upgrade/hero_upgrade_idle.png'
};

// Trang phục cơ bản mặc định của Bé Sam (không bán quần áo)
export const OUTFITS_CATALOG = {
  default: {
    id: 'default',
    name: 'Trang Phục Cơ Bản',
    shortName: 'Cơ Bản',
    description: 'Bộ trang phục thân thương, năng động và thoải mái để bé thỏa sức vui chơi.',
    price: 0,
    category: 'outfit',
    icon: FASHION_ASSETS.defaultAvatar,
    color: '#8b5cf6',
    badge: '🌱',
    theme: 'basic',
    voicePrompt: 'Bộ trang phục cơ bản thân thương luôn sẵn sàng trong tủ đồ của bé!'
  }
};

// 7 Phụ Kiện Tạo Sinh Chibi Có Thể Gắn Lên Nhân Vật Mua Bằng Sao
export const ACCESSORIES_CATALOG = {
  acc_straw_hat: {
    id: 'acc_straw_hat',
    name: 'Mũ Vành Hoa Cúc',
    shortName: 'Mũ Hoa Cúc',
    description: 'Mũ cói hoa cúc che nắng mùa hè đáng yêu, viền dải ruy băng vàng tươi.',
    price: 12,
    category: 'accessory',
    badge: '👒',
    slot: 'head',
    layer: 'front',
    icon: FASHION_ASSETS.accStrawHat,
    voicePrompt: 'Mũ Vành Hoa Cúc xinh xắn che nắng mùa hè cần mười hai Sao!'
  },
  acc_cat_ears_bow: {
    id: 'acc_cat_ears_bow',
    name: 'Nơ Tai Mèo Hồng',
    shortName: 'Nơ Tai Mèo',
    description: 'Băng đô tai mèo màu hồng siêu dễ thương đính nơ kẹo ngọt ngào và chuông vàng.',
    price: 20,
    category: 'accessory',
    badge: '🐱',
    slot: 'head',
    layer: 'front',
    icon: FASHION_ASSETS.accCatEarsBow,
    voicePrompt: 'Nơ Tai Mèo Hồng kẹo ngọt đáng yêu cần hai mươi Sao!'
  },
  acc_heart_glasses: {
    id: 'acc_heart_glasses',
    name: 'Kính Mát Trái Tim',
    shortName: 'Kính Trái Tim',
    description: 'Kính mát gọng trái tim kẹo ngọt sành điệu, phản chiếu ánh sao lấp lánh.',
    price: 20,
    category: 'accessory',
    badge: '🕶️',
    slot: 'face',
    layer: 'front',
    icon: FASHION_ASSETS.accHeartGlasses,
    voicePrompt: 'Kính Mát Trái Tim thời thượng cho bé cần hai mươi Sao!'
  },
  acc_witch_hat: {
    id: 'acc_witch_hat',
    name: 'Mũ Phù Thủy Ngôi Sao',
    shortName: 'Mũ Phù Thủy',
    description: 'Chiếc mũ phù thủy tím ma thuật đính khóa ngôi sao vàng và ánh sao kỳ diệu.',
    price: 35,
    category: 'accessory',
    badge: '🧙',
    slot: 'head',
    layer: 'front',
    icon: FASHION_ASSETS.accWitchHat,
    voicePrompt: 'Mũ Phù Thủy Ngôi Sao ma thuật nhiệm màu cần ba mươi lăm Sao!'
  },
  acc_rainbow_crown: {
    id: 'acc_rainbow_crown',
    name: 'Vương Miện Cầu Vồng',
    shortName: 'Vương Miện',
    description: 'Vương miện hoàng gia vàng rực rỡ đính ngọc quý cầu vồng và các đỉnh sao lung linh.',
    price: 50,
    category: 'accessory',
    badge: '👑',
    slot: 'head',
    layer: 'front',
    icon: FASHION_ASSETS.accRainbowCrown,
    voicePrompt: 'Vương Miện Cầu Vồng hoàng gia lộng lẫy cần năm mươi Sao!'
  },
  acc_fairy_wings: {
    id: 'acc_fairy_wings',
    name: 'Cánh Bướm Tiên Cầu Vồng',
    shortName: 'Cánh Tiên',
    description: 'Đôi cánh bướm tiên bồng bềnh trong suốt phát ra ánh sáng cầu vồng diệu kỳ sau lưng.',
    price: 75,
    category: 'accessory',
    badge: '🧚',
    slot: 'back',
    layer: 'back',
    icon: FASHION_ASSETS.accFairyWings,
    voicePrompt: 'Đôi Cánh Bướm Tiên Cầu Vồng thần tiên lung linh cần bảy mươi lăm Sao!'
  },
  acc_angel_halo: {
    id: 'acc_angel_halo',
    name: 'Vòng Thiên Thần Tỏa Sáng',
    shortName: 'Vòng Thiên Thần',
    description: 'Vòng hào quang thiên thần hoàng kim lơ lửng trên đầu với bụi sao lấp lánh.',
    price: 100,
    category: 'accessory',
    badge: '✨',
    slot: 'head',
    layer: 'front',
    icon: FASHION_ASSETS.accAngelHalo,
    voicePrompt: 'Vòng Thiên Thần Tỏa Sáng lấp lánh rực rỡ cần một trăm Sao!'
  },
  acc_panda_headband: {
    id: 'acc_panda_headband',
    name: 'Băng Đô Gấu Trúc',
    shortName: 'Băng Đô Trúc',
    description: 'Băng đô tai gấu trúc lông êm ái đính lá trúc non xinh xắn.',
    price: 25,
    category: 'accessory',
    badge: '🐼',
    slot: 'head',
    layer: 'front',
    icon: FASHION_ASSETS.accPandaHeadband,
    voicePrompt: 'Băng Đô Gấu Trúc lông mềm mại đáng yêu cần hai mươi lăm Sao!'
  },
  acc_bunny_flower_ears: {
    id: 'acc_bunny_flower_ears',
    name: 'Tai Thỏ Cài Hoa Xinh',
    shortName: 'Tai Thỏ Hoa',
    description: 'Đôi tai thỏ trắng mịn màng điểm đóa hoa anh đào tươi thắm.',
    price: 40,
    category: 'accessory',
    badge: '🐰',
    slot: 'head',
    layer: 'front',
    icon: FASHION_ASSETS.accBunnyFlowerEars,
    voicePrompt: 'Tai Thỏ Cài Hoa Xinh xắn thướt tha cần bốn mươi Sao!'
  },
  acc_star_glasses: {
    id: 'acc_star_glasses',
    name: 'Kính Ngôi Sao Siêu Sao',
    shortName: 'Kính Ngôi Sao',
    description: 'Kính mát hình ngôi sao hoàng kim lấp lánh phong cách siêu sao nhí.',
    price: 30,
    category: 'accessory',
    badge: '⭐',
    slot: 'face',
    layer: 'front',
    icon: FASHION_ASSETS.accStarGlasses,
    voicePrompt: 'Kính Ngôi Sao Siêu Sao lấp lánh sành điệu cần ba mươi Sao!'
  },
  acc_super_cape: {
    id: 'acc_super_cape',
    name: 'Áo Choàng Siêu Nhân',
    shortName: 'Áo Choàng Đỏ',
    description: 'Chiếc áo choàng anh hùng đỏ thắm kiêu hãnh với huy hiệu sao vàng tung bay sau lưng.',
    price: 60,
    category: 'accessory',
    badge: '🦸',
    slot: 'back',
    layer: 'back',
    icon: FASHION_ASSETS.accSuperCape,
    voicePrompt: 'Áo Choàng Siêu Nhân đỏ rực rỡ dũng cảm cần sáu mươi Sao!'
  },
  acc_flower_wreath: {
    id: 'acc_flower_wreath',
    name: 'Vòng Hoa Cổ Tích',
    shortName: 'Vòng Hoa Rừng',
    description: 'Vòng nguyệt quế kết từ những bông hoa rừng nhiệt đới ngát hương và lá xanh non.',
    price: 45,
    category: 'accessory',
    badge: '🌸',
    slot: 'head',
    layer: 'front',
    icon: FASHION_ASSETS.accFlowerWreath,
    voicePrompt: 'Vòng Hoa Cổ Tích ngát hương thanh khiết cần bốn mươi lăm Sao!'
  },
  acc_beret_artist: {
    id: 'acc_beret_artist',
    name: 'Mũ Beret Họa Sĩ Nhí',
    shortName: 'Mũ Beret Họa Sĩ',
    description: 'Chiếc mũ beret đỏ dâu tây phong cách danh họa nhí Paris, đính bông cúc vàng rực rỡ.',
    price: 20,
    category: 'accessory',
    badge: '🎨',
    slot: 'head',
    layer: 'front',
    icon: FASHION_ASSETS.accBeretArtist,
    voicePrompt: 'Mũ Beret Họa Sĩ Nhí đáng yêu cần hai mươi Sao!'
  },
  acc_chef_hat: {
    id: 'acc_chef_hat',
    name: 'Mũ Đầu Bếp Nhí Siêu Đẳng',
    shortName: 'Mũ Đầu Bếp',
    description: 'Mũ bếp trưởng màu trắng bồng bềnh êm ái, đính huy hiệu muỗng nĩa vàng bé xinh.',
    price: 25,
    category: 'accessory',
    badge: '👨‍🍳',
    slot: 'head',
    layer: 'front',
    icon: FASHION_ASSETS.accChefHat,
    voicePrompt: 'Mũ Đầu Bếp Nhí Siêu Đẳng cần hai mươi lăm Sao!'
  },
  acc_sailor_hat: {
    id: 'acc_sailor_hat',
    name: 'Mũ Thủy Thủ Tí Hon',
    shortName: 'Mũ Thủy Thủ',
    description: 'Mũ thủy thủ hải quân tí hon màu trắng viền xanh navy đính huy hiệu mỏ neo vàng.',
    price: 30,
    category: 'accessory',
    badge: '⚓',
    slot: 'head',
    layer: 'front',
    icon: FASHION_ASSETS.accSailorHat,
    voicePrompt: 'Mũ Thủy Thủ Tí Hon dong buồm ra khơi cần ba mươi Sao!'
  },
  acc_cowboy_hat: {
    id: 'acc_cowboy_hat',
    name: 'Mũ Cao Bồi Nhí Miền Tây',
    shortName: 'Mũ Cao Bồi',
    description: 'Mũ cao bồi da lộn vành cong màu nâu caramel, đính ngôi sao vàng cảnh sát trưởng.',
    price: 35,
    category: 'accessory',
    badge: '🤠',
    slot: 'head',
    layer: 'front',
    icon: FASHION_ASSETS.accCowboyHat,
    voicePrompt: 'Mũ Cao Bồi Nhí Miền Tây phong cách dũng cảm cần ba mươi lăm Sao!'
  },
  acc_frog_hat: {
    id: 'acc_frog_hat',
    name: 'Mũ Ếch Xanh Đáng Yêu',
    shortName: 'Mũ Ếch Xanh',
    description: 'Mũ bucket len xanh lá mạ có 2 mắt ếch to tròn ngộ nghĩnh và chiếc mầm non tươi mát.',
    price: 25,
    category: 'accessory',
    badge: '🐸',
    slot: 'head',
    layer: 'front',
    icon: FASHION_ASSETS.accFrogHat,
    voicePrompt: 'Mũ Ếch Xanh Đáng Yêu vui vẻ cần hai mươi lăm Sao!'
  },
  acc_rainbow_balloons: {
    id: 'acc_rainbow_balloons',
    name: 'Chùm Bong Bóng Cầu Vồng',
    shortName: 'Chùm Bong Bóng',
    description: 'Chùm 4 quả bong bóng trái tim pastel bay bổng buộc ruy băng cho bé cầm tay dạo chơi.',
    price: 30,
    category: 'accessory',
    badge: '🎈',
    slot: 'hand',
    layer: 'front',
    icon: FASHION_ASSETS.accRainbowBalloons,
    voicePrompt: 'Chùm Bong Bóng Cầu Vồng bay bổng diệu kỳ cần ba mươi Sao!'
  },
  acc_giant_lollipop: {
    id: 'acc_giant_lollipop',
    name: 'Kẹo Mút Khổng Lồ Cầu Vồng',
    shortName: 'Kẹo Mút Cầu Vồng',
    description: 'Cây kẹo mút xoắn ốc 7 sắc cầu vồng ngọt ngào trên que cầm đính nơ hồng pastel.',
    price: 20,
    category: 'accessory',
    badge: '🍭',
    slot: 'hand',
    layer: 'front',
    icon: FASHION_ASSETS.accGiantLollipop,
    voicePrompt: 'Kẹo Mút Khổng Lồ Cầu Vồng ngọt ngào cần hai mươi Sao!'
  },
  acc_pinwheel: {
    id: 'acc_pinwheel',
    name: 'Chong Chóng Gió Cầu Vồng',
    shortName: 'Chong Chóng Gió',
    description: 'Chong chóng 4 cánh rực rỡ quay tít trong gió hè gắn trên que cầm nhỏ xinh.',
    price: 15,
    category: 'accessory',
    badge: '✨',
    slot: 'hand',
    layer: 'front',
    icon: FASHION_ASSETS.accPinwheel,
    voicePrompt: 'Chong Chóng Gió Cầu Vồng quay tít cần mười lăm Sao!'
  },
  acc_star_wand: {
    id: 'acc_star_wand',
    name: 'Đũa Phép Ngôi Sao Thần Kỳ',
    shortName: 'Đũa Phép Ngôi Sao',
    description: 'Đũa phép hoàng kim cán dài có ngôi sao vàng tỏa ánh hào quang tiên nữ lung linh.',
    price: 45,
    category: 'accessory',
    badge: '⭐',
    slot: 'hand',
    layer: 'front',
    icon: FASHION_ASSETS.accStarWand,
    voicePrompt: 'Đũa Phép Ngôi Sao Thần Kỳ lung linh nhiệm màu cần bốn mươi lăm Sao!'
  }
};

/**
 * Tính giá bán lại Phụ kiện bị lỗ 50% so với giá mua gốc
 */
export function calculateAccessorySellPrice(accessoryOrId) {
  const acc = typeof accessoryOrId === 'string'
    ? ACCESSORIES_CATALOG[accessoryOrId]
    : accessoryOrId;
  const originalPrice = acc?.price || 20;
  return Math.max(1, Math.floor(originalPrice * 0.5));
}

export const FASHION_NPCS = {
  squirrel_accessories: {
    id: 'squirrel_accessories',
    name: 'Bạn Sóc Phụ Kiện',
    title: 'Quầy Phụ Kiện Lấp Lánh Cho Bé',
    icon: FASHION_ASSETS.npcSquirrelIcon,
    greeting: 'Tớ có rất nhiều nơ xinh, mũ đẹp, kính ngầu và cánh tiên! Bé muốn chọn món phụ kiện nào để gắn lên người?'
  }
};

export function defaultFashionState() {
  return {
    ownedOutfits: ['default'],
    ownedAccessories: [],
    currentOutfit: 'default',
    currentAccessory: null,
    equippedAccessoryId: null,
    wardrobePresets: [
      { id: 'preset_1', name: 'Ngăn 1: Mũ Hoa Cúc', accessoryId: null, date: Date.now() },
      { id: 'preset_2', name: 'Ngăn 2: Kính Trái Tim', accessoryId: null, date: Date.now() },
      { id: 'preset_3', name: 'Ngăn 3: Vương Miện', accessoryId: null, date: Date.now() }
    ],
    savingsGoal: {
      accessoryId: 'acc_straw_hat',
      targetStars: 4,
      completed: false
    },
    album: [],
    visitedFashionStreet: false
  };
}

export function normalizeFashionState(raw) {
  const def = defaultFashionState();
  if (!raw || typeof raw !== 'object') return def;

  const ownedAccessories = Array.isArray(raw.ownedAccessories) ? raw.ownedAccessories : [];
  const currentAccessory = raw.currentAccessory || raw.equippedAccessoryId || null;

  const savingsGoal = raw.savingsGoal && typeof raw.savingsGoal === 'object'
    ? {
        accessoryId: ACCESSORIES_CATALOG[raw.savingsGoal.accessoryId] ? raw.savingsGoal.accessoryId : 'acc_straw_hat',
        targetStars: Number(raw.savingsGoal.targetStars) || (ACCESSORIES_CATALOG[raw.savingsGoal.accessoryId]?.price ?? 4),
        completed: Boolean(raw.savingsGoal.completed)
      }
    : def.savingsGoal;

  return {
    ownedOutfits: ['default'],
    ownedAccessories: [...new Set(ownedAccessories)],
    currentOutfit: 'default',
    currentAccessory,
    equippedAccessoryId: currentAccessory,
    wardrobePresets: Array.isArray(raw.wardrobePresets) && raw.wardrobePresets.length > 0 ? raw.wardrobePresets.slice(0, 3) : def.wardrobePresets,
    savingsGoal,
    album: Array.isArray(raw.album) ? raw.album.slice(0, 24) : [],
    visitedFashionStreet: Boolean(raw.visitedFashionStreet)
  };
}

export class FashionSystem {
  constructor(adapter = null) {
    this._adapter = adapter;
  }

  getAdapter() {
    return this._adapter || saveAdapter;
  }

  getCatalog() {
    return Object.values(ACCESSORIES_CATALOG);
  }

  grantStars(amount) {
    const adapter = this.getAdapter();
    const gameState = adapter.load();
    if (!gameState.player) gameState.player = {};
    gameState.player.stars = (Number(gameState.player.stars) || 0) + amount;
    adapter.save(gameState);
    return gameState.player.stars;
  }

  getState() {
    const adapter = this.getAdapter();
    const gameState = adapter.load();
    if (!gameState.fashion) {
      gameState.fashion = defaultFashionState();
    }
    return normalizeFashionState(gameState.fashion);
  }

  saveState(patch) {
    const adapter = this.getAdapter();
    const gameState = adapter.load();
    const current = normalizeFashionState(gameState.fashion);
    const updated = normalizeFashionState({ ...current, ...patch });
    gameState.fashion = updated;
    adapter.save(gameState);

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('game:fashion-updated', { detail: updated }));
    }
    return updated;
  }

  getPlayerStars() {
    const adapter = this.getAdapter();
    const gameState = adapter.load();
    return Number(gameState.player?.stars ?? gameState.campaign?.stars ?? 0);
  }

  isOutfitOwned(outfitId) {
    return outfitId === 'default';
  }

  isAccessoryOwned(accId) {
    const state = this.getState();
    return state.ownedAccessories.includes(accId);
  }

  canAfford(cost) {
    return this.getPlayerStars() >= Number(cost);
  }

  // Mua phụ kiện bằng Sao
  purchaseAccessory(accId) {
    const acc = ACCESSORIES_CATALOG[accId];
    if (!acc) return { success: false, reason: 'Phụ kiện không tồn tại!' };
    if (this.isAccessoryOwned(accId)) return { success: false, reason: 'Bé đã có món này rồi!' };

    const currentStars = this.getPlayerStars();
    if (currentStars < acc.price) {
      return {
        success: false,
        reason: `Bé còn thiếu ${acc.price - currentStars} Sao nữa. Cùng cố gắng giải đố hoặc câu cá nhé!`,
        missingStars: acc.price - currentStars
      };
    }

    const adapter = this.getAdapter();
    const gameState = adapter.load();
    const newStars = Math.max(0, currentStars - acc.price);
    if (!gameState.player) gameState.player = {};
    if (!gameState.campaign) gameState.campaign = {};
    gameState.player.stars = newStars;
    gameState.campaign.stars = newStars;

    const fashion = normalizeFashionState(gameState.fashion);
    fashion.ownedAccessories.push(accId);

    if (fashion.savingsGoal?.accessoryId === accId) {
      fashion.savingsGoal.completed = true;
    }

    gameState.fashion = fashion;
    adapter.save(gameState);

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('game:stars-changed', { detail: { stars: newStars } }));
      window.dispatchEvent(new CustomEvent('game:fashion-updated', { detail: fashion }));
      window.dispatchEvent(new CustomEvent('game:accessory-purchased', { detail: { accessory: acc, remainingStars: newStars } }));
    }

    return { success: true, accessory: acc, remainingStars: newStars };
  }

  // Đeo phụ kiện gắn vào nhân vật
  equipAccessory(accId) {
    if (accId && !this.isAccessoryOwned(accId)) {
      return { success: false, reason: 'Bé chưa sở hữu phụ kiện này!' };
    }
    const updated = this.saveState({ currentAccessory: accId, equippedAccessoryId: accId });
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('game:accessory-changed', {
        detail: { accessoryId: accId, accessory: ACCESSORIES_CATALOG[accId] || null }
      }));
      window.dispatchEvent(new CustomEvent('game:fashion-equipped', { detail: updated }));
    }
    return { success: true, accessoryId: accId };
  }

  // Tháo phụ kiện
  unequipAccessory() {
    return this.equipAccessory(null);
  }

  // Đặt mục tiêu để dành Sao cho phụ kiện
  setSavingsGoal(accId) {
    const acc = ACCESSORIES_CATALOG[accId] || Object.values(ACCESSORIES_CATALOG)[0];
    if (!acc) return { success: false };

    const savingsGoal = {
      accessoryId: acc.id,
      targetStars: acc.price,
      completed: this.isAccessoryOwned(acc.id)
    };

    const updated = this.saveState({ savingsGoal });
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('game:savings-goal-updated', { detail: savingsGoal }));
    }
    return { success: true, savingsGoal };
  }

  getSavingsGoalProgress() {
    const state = this.getState();
    const goal = state.savingsGoal || { accessoryId: 'acc_straw_hat', targetStars: 4, completed: false };
    const accId = goal.accessoryId || goal.outfitId || 'acc_straw_hat';
    const acc = ACCESSORIES_CATALOG[accId] || Object.values(ACCESSORIES_CATALOG)[0];
    const currentStars = this.getPlayerStars();
    const targetStars = acc?.price ?? 4;
    const remainingStars = Math.max(0, targetStars - currentStars);
    const progressPct = Math.min(100, Math.round((currentStars / targetStars) * 100));
    const isOwned = acc ? this.isAccessoryOwned(acc.id) : false;

    return {
      goal,
      accessory: acc,
      outfit: acc, // Để tương thích giao diện
      currentStars,
      targetStars,
      remainingStars,
      progressPct,
      canAfford: currentStars >= targetStars,
      isOwned,
      isReady: currentStars >= targetStars
    };
  }

  // Lưu 3 ngăn tủ đồ phụ kiện
  saveWardrobePreset(presetIndex = 0, name = 'Ngăn Yêu Thích', accessoryId = null) {
    const state = this.getState();
    const presets = state.wardrobePresets || [];
    const activeAcc = accessoryId !== undefined ? accessoryId : state.currentAccessory;
    const acc = ACCESSORIES_CATALOG[activeAcc];

    presets[presetIndex] = {
      id: `preset_${presetIndex + 1}`,
      name: name || (acc ? `Ngăn: ${acc.shortName}` : `Ngăn ${presetIndex + 1}`),
      accessoryId: activeAcc,
      date: Date.now()
    };

    return this.saveState({ wardrobePresets: presets.slice(0, 3) });
  }

  applyWardrobePreset(presetIndex = 0) {
    const state = this.getState();
    const preset = state.wardrobePresets?.[presetIndex];
    if (!preset) return { success: false };

    if (preset.accessoryId && this.isAccessoryOwned(preset.accessoryId)) {
      this.equipAccessory(preset.accessoryId);
    } else if (!preset.accessoryId) {
      this.unequipAccessory();
    }
    return { success: true, preset };
  }

  addPhotoToAlbum(photoData) {
    const state = this.getState();
    const album = Array.isArray(state.album) ? [...state.album] : [];
    const newPhoto = {
      id: photoData?.id || ('photo_' + Date.now()),
      date: photoData?.date || new Date().toLocaleDateString('vi-VN'),
      accessoryId: photoData?.accessoryId !== undefined ? photoData.accessoryId : state.currentAccessory,
      backdrop: photoData?.backdrop || 'street',
      pose: photoData?.pose || 'stand',
      caption: photoData?.caption || 'Kỷ niệm dạo Phố Phụ Kiện Thời Trang',
      frameStyle: photoData?.frameStyle || 'rainbow_sparkle',
      thumbnailUrl: photoData?.thumbnailUrl || null
    };

    album.unshift(newPhoto);
    const capped = album.slice(0, 24);
    this.saveState({ album: capped });

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('game:photo-added', { detail: newPhoto }));
    }
    return newPhoto;
  }

  evaluateThemeChallenge(themeId, accessoryId) {
    const theme = THEME_CHALLENGES[themeId];
    if (!theme) return { pass: false, feedback: 'Chủ đề không tồn tại.' };

    const state = this.getState();
    const completed = Array.isArray(state.completedThemes) ? [...state.completedThemes] : [];

    let pass = false;
    let feedback = '';

    if (themeId === 'theme_garden') {
      pass = accessoryId === 'acc_straw_hat' || accessoryId === 'acc_cat_ears_bow';
      feedback = pass ? 'Chiếc nón xinh thật tươi vui cho chuyến dạo vườn!' : 'Bé thử đội Mũ Vành Hoa Cúc hoặc Nơ Tai Mèo nhé!';
    } else if (themeId === 'theme_ocean') {
      pass = accessoryId === 'acc_straw_hat' || accessoryId === 'acc_heart_glasses';
      feedback = pass ? 'Phụ kiện che nắng và kính mát rất chuẩn cho buổi câu cá bên hồ!' : 'Bé thử Mũ Vành Hoa Cúc hoặc Kính Mát Trái Tim nha!';
    } else if (themeId === 'theme_festival') {
      pass = accessoryId === 'acc_rainbow_crown' || accessoryId === 'acc_fairy_wings' || accessoryId === 'acc_angel_halo';
      feedback = pass ? 'Lộng lẫy và rực rỡ như hoàng gia trong ngày hội cầu vồng!' : 'Bé thử Vương Miện Cầu Vồng hoặc Cánh Tiên Bướm xem sao nhé!';
    }

    if (pass && !completed.includes(themeId)) {
      completed.push(themeId);
      this.saveState({ completedThemes: completed });
      const adapter = this.getAdapter();
      if (adapter?.addReward) {
        adapter.addReward({ stars: theme.rewardStars || 2, exp: 20 });
      }
    }

    return { pass, feedback, completedThemes: completed };
  }

  // Backward compatibility stubs for legacy tests
  purchaseOutfit(id) {
    return { success: false, reason: 'Quần áo đã được thay thế hoàn toàn bằng phụ kiện!' };
  }
  equipOutfit(id) {
    return { success: true, outfitId: 'default' };
  }
}

export const THEME_CHALLENGES = {
  theme_garden: {
    id: 'theme_garden',
    name: 'Dạo Vườn Nắng Ấm',
    icon: '🌱',
    description: 'Phong cách thiên nhiên tươi mát rực rỡ hoa cúc.',
    hint: 'Đội Mũ Vành Hoa Cúc hoặc Nơ Tai Mèo Hồng.',
    rewardStars: 3
  },
  theme_ocean: {
    id: 'theme_ocean',
    name: 'Đi Câu Hồ Lá Sen',
    icon: '🎣',
    description: 'Năng động, che nắng tốt để kiên nhẫn câu cá to.',
    hint: 'Đội Mũ Vành Hoa Cúc hoặc Kính Mát Trái Tim.',
    rewardStars: 3
  },
  theme_festival: {
    id: 'theme_festival',
    name: 'Lễ Hội Cầu Vồng Rực Rỡ',
    icon: '🌈',
    description: 'Lấp lánh, nổi bật nhất giữa muôn ngàn ánh sao.',
    hint: 'Đeo Vương Miện Cầu Vồng, Cánh Tiên Bướm hoặc Vòng Thiên Thần.',
    rewardStars: 5
  }
};

export const PHOTO_BACKDROPS = {
  street: {
    id: 'street',
    name: 'Phố Cầu Vồng',
    bg: 'linear-gradient(135deg, #fbcfe8 0%, #c084fc 100%)'
  },
  farm: {
    id: 'farm',
    name: 'Nông Trại Xanh',
    bg: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)'
  },
  pond: {
    id: 'pond',
    name: 'Hồ Sen Yên Bình',
    bg: 'linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%)'
  }
};

export const PHOTO_POSES = {
  stand: {
    id: 'stand',
    name: 'Đứng Thẳng',
    icon: '🧍'
  },
  wave: {
    id: 'wave',
    name: 'Vẫy Chào',
    icon: '👋'
  },
  sparkle: {
    id: 'sparkle',
    name: 'Tỏa Sáng',
    icon: '✨'
  }
};

export const fashionSystem = new FashionSystem();
