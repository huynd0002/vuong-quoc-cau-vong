/**
 * src/content/fishing/fishingData.js
 * Dữ liệu chuẩn cho hệ thống Câu Cá Hồ Lá Sen & Chợ Cầu Vồng (FISHING_PLAN v2.0)
 * Thiết kế cho trẻ 5–6 tuổi: trọng lượng bước nhảy 50g, nhịp kéo khoan thai, không áp lực.
 */

export const FISHING_LIMITS = Object.freeze({
  MAX_BASKET_SIZE: 6,
  MAX_BAIT_STACK: 99,
  MAX_SHELLS: 999,
  WEIGHT_STEP_G: 50,
  HOOK_WINDOW_MS: 2200,
  HOOK_WINDOW_ASSIST_MS: 3000,
  PULL_TIMEOUT_MS: 30000,
  MAX_PULL_STRIKES: 1, // Bé chỉ được hụt 1 lần, hụt 1 lần là mất cá luôn
  INPUT_DEBOUNCE_MS: 350,
  ANTI_REPEAT_HISTORY: 3
});

export const DOCKS = Object.freeze([
  {
    id: 'lotus_dock',
    name: 'Bến Sen',
    icon: '🌸',
    badgeAsset: '/assets/fishing/dock_lotus.png',
    desc: 'Bến gỗ ấm áp giữa đầm hoa sen hồng, mặt nước êm dịu rất hợp tập câu.',
    voiceIntro: 'Chào mừng bé đến Bến Sen! Nước hồ êm ả, cá đang bơi quanh lá sen kìa!'
  },
  {
    id: 'sunny_dock',
    name: 'Bến Nắng',
    icon: '☀️',
    badgeAsset: '/assets/fishing/dock_sunny.png',
    desc: 'Bờ hồ ngập nắng vàng lấp lánh, nơi các bạn cá lớn thích phơi nắng.',
    voiceIntro: 'Bé đang ở Bến Nắng! Mặt nước lấp lánh, nhiều bạn cá to đang chờ bé đấy!'
  }
]);

export const PULL_8_STEPS = Object.freeze([
  {
    step: 1,
    name: 'Giật Cần',
    icon: '🎣',
    actionText: 'Giật cần đón đầu!',
    cue: 'Cá cắn câu! Bé hãy giật cần lên nào!',
    color: '#38bdf8'
  },
  {
    step: 2,
    name: 'Khóa Dây',
    icon: '⚓',
    actionText: 'Khóa chặt dây câu!',
    cue: 'Cá quẫy mạnh! Giữ chặt dây câu không cho tuột nhé!',
    color: '#06b6d4'
  },
  {
    step: 3,
    name: 'Cuộn Nhịp 1',
    icon: '🔄',
    actionText: 'Cuộn dây đều tay!',
    cue: 'Cá đã thấm mệt! Cuộn dây kéo cá lại gần nào!',
    color: '#10b981'
  },
  {
    step: 4,
    name: 'Cân Bằng',
    icon: '⚖️',
    actionText: 'Giữ cần cân bằng!',
    cue: 'Cá đảo hướng bơi! Bé giữ cần thật cân bằng nhé!',
    color: '#f59e0b'
  },
  {
    step: 5,
    name: 'Chống Quẫy',
    icon: '💦',
    actionText: 'Khống chế quẫy nước!',
    cue: 'Nước bắn tung tóe! Ghìm chắc phao câu!',
    color: '#ec4899'
  },
  {
    step: 6,
    name: 'Kéo Tốc Độ',
    icon: '⚡',
    actionText: 'Tăng tốc cuộn dây!',
    cue: 'Kéo nhanh hơn nữa! Cá đã vào sát mép cầu gỗ rồi!',
    color: '#8b5cf6'
  },
  {
    step: 7,
    name: 'Ngoi Lên Mặt Nước',
    icon: '🌟',
    actionText: 'Cá ngoi lên mặt hồ!',
    cue: 'Bóng cá lấp lánh hiện rõ rồi! Chuẩn bị kéo vọt lên bờ!',
    color: '#f97316'
  },
  {
    step: 8,
    name: 'Vọt Lên Bờ!',
    icon: '🏆',
    actionText: 'Bắt trọn bạn cá!',
    cue: 'Tuyệt cú mèo! Kéo vọt bạn cá lên bờ giãy tung tăng!',
    color: '#eab308'
  }
]);

export const RODS = Object.freeze([
  {
    id: 'rod_lotus',
    name: 'Cần Lá Sen',
    level: 1,
    levelLabel: 'Cấp 1 · Tập Sự',
    icon: '🎋',
    asset: '/assets/fishing/rod_lotus.png',
    heldAsset: '/assets/fishing/rod_lotus_held.png',
    tier: 1,
    costStars: 0,
    costShells: 0,
    biteTimeMs: 650,
    auditionZoneBonus: 0,
    pullHitsReduction: 0,
    pullStepGain: 1.0,
    rareFishBoost: 1.0,
    minWeightBonusRatio: 0.0,
    perkBadge: '⭐ Cấp 1 · ⚡ Tốc độ thường · 🐟 Kéo 1 bước/nhịp',
    castZoneBonus: 0,
    pullZoneBonus: 0,
    fxType: 'lotus',
    glowColor: '#22c55e',
    desc: 'Cần câu tre xanh gắn lá sen nhỏ miễn phí. Kéo giựt 1 bước/nhịp, câu cá nhỏ và vừa.',
    voiceDesc: 'Cần Lá Sen nhẹ nhàng, vừa tay cho bé mới tập câu!'
  },
  {
    id: 'rod_duck',
    name: 'Cần Vịt Con',
    level: 2,
    levelLabel: 'Cấp 2 · Nhanh Nhẹn',
    icon: '🦆',
    asset: '/assets/fishing/rod_duck.png',
    heldAsset: '/assets/fishing/rod_duck_held.png',
    tier: 2,
    costStars: 35,
    costShells: 35,
    biteTimeMs: 420,
    auditionZoneBonus: 10,
    pullHitsReduction: 0,
    pullStepGain: 1.5,
    rareFishBoost: 2.2,
    minWeightBonusRatio: 0.25,
    perkBadge: '⭐ Cấp 2 · ⚡ Nhanh +35% · 🦆 Kéo +1.5 bước/nhịp',
    castZoneBonus: 0.08,
    pullZoneBonus: 0.10,
    fxType: 'duck',
    glowColor: '#facc15',
    desc: 'Cần câu phao Vịt Vàng (35 ⭐): bắt cá nhanh hơn +35%, kéo giựt +1.5 bước mỗi nhịp và tăng gấp đôi tỷ lệ cá to, cá hiếm!',
    voiceDesc: 'Cần Vịt Con xịn hơn, cá cắn phao nhanh hơn và dễ gặp các bạn cá lớn hơn!'
  },
  {
    id: 'rod_ocean_star',
    name: 'Cần Sao Biển',
    level: 3,
    levelLabel: 'Cấp 3 · Tinh Anh',
    icon: '🌟',
    asset: '/assets/fishing/rod_ocean_star.png',
    heldAsset: '/assets/fishing/rod_ocean_star_held.png',
    tier: 3,
    costStars: 80,
    costShells: 80,
    biteTimeMs: 340,
    auditionZoneBonus: 14,
    pullHitsReduction: 0,
    pullStepGain: 1.8,
    rareFishBoost: 3.0,
    minWeightBonusRatio: 0.35,
    perkBadge: '⭐ Cấp 3 · ⚡ Nhanh +48% · 🌟 Kéo +1.8 bước/nhịp',
    castZoneBonus: 0.12,
    pullZoneBonus: 0.14,
    fxType: 'ocean_star',
    glowColor: '#06b6d4',
    desc: 'Cần câu ngọc lam Sao Biển (80 ⭐): phao sao biển phát sáng, kéo giựt êm ái +1.8 bước mỗi nhịp và chống cá tuột dây!',
    voiceDesc: 'Cần Sao Biển xanh mát, phao phát sáng lung linh câu cá to cực đã!'
  },
  {
    id: 'rod_rainbow',
    name: 'Cần Cầu Vồng',
    level: 4,
    levelLabel: 'Cấp 4 · Kỳ Diệu',
    icon: '🌈',
    asset: '/assets/fishing/rod_rainbow.png',
    heldAsset: '/assets/fishing/rod_rainbow_held.png',
    tier: 4,
    costStars: 160,
    costShells: 160,
    biteTimeMs: 260,
    auditionZoneBonus: 18,
    pullHitsReduction: 1,
    pullStepGain: 2.0,
    rareFishBoost: 4.0,
    minWeightBonusRatio: 0.50,
    perkBadge: '⭐ Cấp 4 · ⚡ Siêu tốc +60% · 🌈 Kéo +2 bước/nhịp',
    castZoneBonus: 0.15,
    pullZoneBonus: 0.18,
    fxType: 'rainbow',
    glowColor: '#c084fc',
    desc: 'Cần câu phép thuật Cầu Vồng (160 ⭐): cá đớp siêu tốc +60%, kéo giựt +2 bước/nhịp cực mạnh và thu hút cá quý nặng ký x4!',
    voiceDesc: 'Cần Cầu Vồng xịn nhất hồ, bắt cá siêu nhanh và gọi cả Cá Cầu Vồng tới đấy!'
  },
  {
    id: 'rod_dragon',
    name: 'Cần Rồng Thần',
    level: 5,
    levelLabel: 'Cấp 5 · Thần Thoại',
    icon: '🐉',
    asset: '/assets/fishing/rod_dragon.png',
    heldAsset: '/assets/fishing/rod_dragon_held.png',
    tier: 5,
    costStars: 320,
    costShells: 320,
    biteTimeMs: 180,
    auditionZoneBonus: 24,
    pullHitsReduction: 2,
    pullStepGain: 3.0,
    rareFishBoost: 6.0,
    minWeightBonusRatio: 0.70,
    perkBadge: '⭐ Cấp 5 · ⚡ Cực tốc +75% · 🐉 Kéo +3 bước/nhịp',
    castZoneBonus: 0.22,
    pullZoneBonus: 0.24,
    fxType: 'dragon',
    glowColor: '#f59e0b',
    desc: 'Cần câu Thần Thoại Hoàng Kim (320 ⭐): thần long phù trợ, giật 1 cú tiến 3 bước, kéo vọt cá lên bờ trong chớp mắt!',
    voiceDesc: 'Cần Rồng Thần uy phong lẫm liệt, sức mạnh thần long kéo cá siêu nhanh!'
  }
]);

export const BAITS = Object.freeze([
  {
    id: 'bait_lotus',
    name: 'Mồi Lá Tập',
    icon: '🌿',
    asset: '/assets/fishing/bait_lotus.png',
    unlimited: true,
    packCostStars: 0,
    packCostShells: 0,
    packCount: 1,
    desc: 'Mồi lá non thơm mát miễn phí (0 ⭐), thu hút các bạn cá nhỏ thân thiện.',
    voiceDesc: 'Mồi Lá Tập miễn phí, lúc nào bé cũng có thể nhận thêm vào túi!'
  },
  {
    id: 'bait_crunchy',
    name: 'Mồi Hạt Giòn',
    icon: '🌰',
    asset: '/assets/fishing/bait_crunchy.png',
    unlimited: false,
    packCostStars: 15,
    packCostShells: 15,
    packCount: 5,
    desc: 'Túi 5 viên hạt ngũ cốc giòn rụm (15 ⭐). Cá vừa và cá lém lỉnh rất mê!',
    voiceDesc: 'Mồi Hạt Giòn thơm phức, các bạn Cá Cam và Cá Chuông Bạc thích mê!'
  },
  {
    id: 'bait_sweet_cake',
    name: 'Mồi Bánh Thơm',
    icon: '🧁',
    asset: '/assets/fishing/bait_sweet_cake.png',
    unlimited: false,
    packCostStars: 30,
    packCostShells: 30,
    packCount: 5,
    desc: 'Túi 5 viên bánh mật ong ngọt ngào (30 ⭐). Thu hút Cá Đốm Nắng và Cá Cầu Vồng!',
    voiceDesc: 'Mồi Bánh Thơm ngọt lịm, gọi cả Cá Đốm Nắng và Cá Cầu Vồng tới đấy!'
  }
]);

export const FISH_DIFFICULTY_PROFILES = Object.freeze({
  cloud_fish: {
    requiredHits: 1,
    zoneHeight: 46,
    markerSpeed: 58,
    maxRetries: 2,
    label: 'Cực Dễ · 1 Lần Canh'
  },
  lotus_fish: {
    requiredHits: 2,
    zoneHeight: 38,
    markerSpeed: 76,
    maxRetries: 2,
    label: 'Dễ · 2 Lần Canh'
  },
  orange_fish: {
    requiredHits: 3,
    zoneHeight: 30,
    markerSpeed: 98,
    maxRetries: 3,
    label: 'Khó Vừa · 3 Lần Canh'
  },
  silver_bell_fish: {
    requiredHits: 4,
    zoneHeight: 24,
    markerSpeed: 124,
    maxRetries: 3,
    label: 'Khó · 4 Lần Canh'
  },
  sun_spot_fish: {
    requiredHits: 5,
    zoneHeight: 18,
    markerSpeed: 148,
    maxRetries: 3,
    label: 'Rất Khó · 5 Lần Canh'
  },
  rainbow_fish: {
    requiredHits: 5,
    zoneHeight: 14,
    markerSpeed: 176,
    maxRetries: 3,
    label: 'Thần Thoại · 5 Lần Canh'
  },
  crystal_fairy_fish: {
    requiredHits: 6,
    zoneHeight: 13,
    markerSpeed: 195,
    maxRetries: 3,
    label: 'Kỳ Ảo · 6 Lần Canh'
  },
  golden_dragon_fish: {
    requiredHits: 6,
    zoneHeight: 12,
    markerSpeed: 210,
    maxRetries: 3,
    label: 'Hoàng Kim · 6 Lần Canh'
  },
  galaxy_star_fish: {
    requiredHits: 7,
    zoneHeight: 10,
    markerSpeed: 240,
    maxRetries: 3,
    label: 'Vũ Trụ · 7 Lần Canh'
  }
});

export const FISH_SPECIES = Object.freeze([
  {
    id: 'cloud_fish',
    name: 'Cá Mây Tròn',
    icon: '🐟',
    color: '#7dd3fc',
    asset: '/assets/fishing/fish_cloud.png',
    swimSheetKey: 'fish_cloud_swim_8dir',
    minWeightG: 100,
    maxWeightG: 300,
    pullStages: 1,
    requiredHits: 1,
    requiredPullSteps: 3,
    pullStepsLabel: '1 Nhịp Kéo (Cực Dễ)',
    zoneHeight: 46,
    markerSpeed: 58,
    sweepDurationMs: 2400,
    greenZoneRatio: 0.46,
    fakeNibblesMin: 1,
    fakeNibblesMax: 1,
    splashChance: 0.15,
    splashDurationMs: 1100,
    preferredBaits: ['bait_lotus', 'bait_crunchy'],
    preferredDock: 'lotus_dock',
    temperament: 'Chậm rãi, hiền lành, chỉ cần 1 nhịp canh chuẩn là vọt lên bờ.',
    hint: 'Thích Mồi Lá Tập ở Bến Sen',
    voiceIntro: 'Cá Mây Tròn bụ bẫm như đám mây nhỏ trên bầu trời!',
    maxStack: 5,
    sizeTier: 'tiny',
    isSpecial: false,
    isGlow: false
  },
  {
    id: 'lotus_fish',
    name: 'Cá Lá Sen',
    icon: '🐠',
    color: '#34d399',
    asset: '/assets/fishing/fish_lotus.png',
    swimSheetKey: 'fish_pond_swim_8dir',
    minWeightG: 250,
    maxWeightG: 600,
    pullStages: 2,
    requiredHits: 2,
    requiredPullSteps: 4,
    pullStepsLabel: '2 Nhịp Kéo (Dễ)',
    zoneHeight: 38,
    markerSpeed: 76,
    sweepDurationMs: 2250,
    greenZoneRatio: 0.38,
    fakeNibblesMin: 1,
    fakeNibblesMax: 2,
    splashChance: 0.25,
    splashDurationMs: 1200,
    preferredBaits: ['bait_lotus', 'bait_crunchy'],
    preferredDock: 'lotus_dock',
    temperament: 'Bơi quanh lá sen, cần 2 lần canh nhịp nhàng để bắt.',
    hint: 'Thích Mồi Lá Tập hoặc Mồi Hạt Giòn ở Bến Sen',
    voiceIntro: 'Cá Lá Sen có chiếc vây hồng xinh như cánh hoa sen!',
    maxStack: 4,
    sizeTier: 'small',
    isSpecial: false,
    isGlow: false
  },
  {
    id: 'orange_fish',
    name: 'Cá Cam Lém Lỉnh',
    icon: '🍊',
    color: '#fb923c',
    asset: '/assets/fishing/fish_orange.png',
    swimSheetKey: 'fish_orange_swim_8dir',
    minWeightG: 300,
    maxWeightG: 700,
    pullStages: 3,
    requiredHits: 3,
    requiredPullSteps: 5,
    pullStepsLabel: '3 Nhịp Kéo (Khó Vừa)',
    zoneHeight: 30,
    markerSpeed: 98,
    sweepDurationMs: 2150,
    greenZoneRatio: 0.30,
    fakeNibblesMin: 2,
    fakeNibblesMax: 3,
    splashChance: 0.35,
    splashDurationMs: 1250,
    preferredBaits: ['bait_crunchy'],
    preferredDock: 'sunny_dock',
    temperament: 'Hay rỉa thử và đảo hướng, cần 3 lần canh dứt khoát.',
    hint: 'Thích Mồi Hạt Giòn ở Bến Nắng',
    voiceIntro: 'Cá Cam Lém Lỉnh tinh nghịch, hay chạm nhẹ phao thử tài kiên nhẫn của bé!',
    maxStack: 3,
    sizeTier: 'medium',
    isSpecial: false,
    isGlow: false
  },
  {
    id: 'silver_bell_fish',
    name: 'Cá Chuông Bạc',
    icon: '🔔',
    color: '#93c5fd',
    asset: '/assets/fishing/fish_silver_bell.png',
    swimSheetKey: 'fish_cloud_swim_8dir',
    minWeightG: 400,
    maxWeightG: 900,
    pullStages: 4,
    requiredHits: 4,
    requiredPullSteps: 6,
    pullStepsLabel: '4 Nhịp Kéo (Khó)',
    zoneHeight: 24,
    markerSpeed: 124,
    sweepDurationMs: 2050,
    greenZoneRatio: 0.24,
    fakeNibblesMin: 1,
    fakeNibblesMax: 2,
    splashChance: 0.40,
    splashDurationMs: 1300,
    preferredBaits: ['bait_crunchy', 'bait_sweet_cake'],
    preferredDock: 'lotus_dock',
    temperament: 'Quẫy nước ngân vang như tiếng chuông, cần 4 lần canh vững vàng.',
    hint: 'Thích Mồi Hạt Giòn hoặc Mồi Bánh Thơm',
    voiceIntro: 'Cá Chuông Bạc lấp lánh ánh bạc, chiếc đuôi khẽ rung như chuông nhỏ!',
    maxStack: 3,
    sizeTier: 'medium_large',
    isSpecial: false,
    isGlow: false
  },
  {
    id: 'sun_spot_fish',
    name: 'Cá Đốm Nắng',
    icon: '☀️',
    color: '#fbbf24',
    asset: '/assets/fishing/fish_sun_spot.png',
    swimSheetKey: 'fish_orange_swim_8dir',
    minWeightG: 700,
    maxWeightG: 1400,
    pullStages: 5,
    requiredHits: 5,
    requiredPullSteps: 7,
    pullStepsLabel: '5 Nhịp Kéo (Rất Khó)',
    zoneHeight: 18,
    markerSpeed: 148,
    sweepDurationMs: 2100,
    greenZoneRatio: 0.18,
    fakeNibblesMin: 2,
    fakeNibblesMax: 3,
    splashChance: 0.45,
    splashDurationMs: 1350,
    preferredBaits: ['bait_sweet_cake'],
    preferredDock: 'sunny_dock',
    temperament: 'Thân hình to tròn khỏe khoắn, cần 5 lần canh dứt khoát kiên trì.',
    hint: 'Thích Mồi Bánh Thơm ở Bến Nắng',
    voiceIntro: 'Chà! Cá Đốm Nắng to tròn ấm áp như tia nắng mùa hè!',
    maxStack: 2,
    sizeTier: 'large',
    isSpecial: false,
    isGlow: false
  },
  {
    id: 'rainbow_fish',
    name: 'Cá Cầu Vồng',
    icon: '🌈',
    color: '#c084fc',
    asset: '/assets/fishing/fish_rainbow.png',
    swimSheetKey: 'fish_pond_swim_8dir',
    minWeightG: 1000,
    maxWeightG: 2000,
    pullStages: 5,
    requiredHits: 5,
    requiredPullSteps: 8,
    pullStepsLabel: '5 Nhịp Kéo (Thần Thoại)',
    zoneHeight: 14,
    markerSpeed: 176,
    sweepDurationMs: 1950,
    greenZoneRatio: 0.14,
    fakeNibblesMin: 2,
    fakeNibblesMax: 4,
    splashChance: 0.55,
    splashDurationMs: 1500,
    preferredBaits: ['bait_sweet_cake'],
    preferredDock: 'lotus_dock',
    temperament: 'Cá thần thoại 7 sắc tuyệt đẹp, cần 5 lần canh đỉnh cao với điểm canh siêu nhỏ và tốc độ nhanh.',
    hint: 'Rất quý hiếm! Dùng Mồi Bánh Thơm và Cần Cầu Vồng / Rồng Thần',
    voiceIntro: 'Ôi kì diệu quá! Cá Cầu Vồng thần thoại lung linh bảy sắc đang cắn câu!',
    maxStack: 1,
    sizeTier: 'special',
    isSpecial: true,
    isGlow: true
  },
  {
    id: 'crystal_fairy_fish',
    name: 'Cá Pha Lê Huyền Ảo',
    icon: '💎',
    color: '#38bdf8',
    asset: '/assets/fishing/fish_crystal_fairy.png',
    swimSheetKey: 'fish_cloud_swim_8dir',
    minWeightG: 1200,
    maxWeightG: 2600,
    pullStages: 6,
    requiredHits: 6,
    requiredPullSteps: 8,
    pullStepsLabel: '6 Nhịp Kéo (Kỳ Ảo · Siêu Khó)',
    zoneHeight: 13,
    markerSpeed: 195,
    sweepDurationMs: 1800,
    greenZoneRatio: 0.13,
    fakeNibblesMin: 2,
    fakeNibblesMax: 4,
    splashChance: 0.60,
    splashDurationMs: 1600,
    preferredBaits: ['bait_sweet_cake', 'bait_crunchy'],
    preferredDock: 'lotus_dock',
    temperament: 'Cá tiên tử pha lê ngọc bích phát quang trong suốt, cần 6 lần canh chuẩn xác dứt khoát!',
    hint: 'Quý hiếm! Dùng Mồi Bánh Thơm hoặc bật Skill Câu Cá để triệu hồi',
    voiceIntro: 'Kì diệu chưa kìa! Cá Pha Lê Huyền Ảo long lanh như ngọc bích đang cắn câu!',
    maxStack: 1,
    sizeTier: 'special',
    isSpecial: true,
    isGlow: true
  },
  {
    id: 'golden_dragon_fish',
    name: 'Cá Rồng Hoàng Kim',
    icon: '🐲',
    color: '#eab308',
    asset: '/assets/fishing/fish_golden_dragon.png',
    swimSheetKey: 'fish_orange_swim_8dir',
    minWeightG: 1500,
    maxWeightG: 3200,
    pullStages: 6,
    requiredHits: 6,
    requiredPullSteps: 8,
    pullStepsLabel: '6 Nhịp Kéo (Hoàng Kim · Rất Khó)',
    zoneHeight: 12,
    markerSpeed: 210,
    sweepDurationMs: 1700,
    greenZoneRatio: 0.12,
    fakeNibblesMin: 3,
    fakeNibblesMax: 4,
    splashChance: 0.70,
    splashDurationMs: 1750,
    preferredBaits: ['bait_sweet_cake'],
    preferredDock: 'sunny_dock',
    temperament: 'Vương giả rồng vàng uy phong, quẫy sóng hoàng kim dữ dội, cần 6 nhịp canh thần tốc tuyệt đối!',
    hint: 'Thần thoại Bến Nắng! Dùng Mồi Bánh Thơm, Cần Rồng Thần hoặc bật Skill',
    voiceIntro: 'Oa! Cá Rồng Hoàng Kim vảy vàng chói lọi, râu rồng lộng lẫy đang cắn câu!',
    maxStack: 1,
    sizeTier: 'special',
    isSpecial: true,
    isGlow: true
  },
  {
    id: 'galaxy_star_fish',
    name: 'Cá Ngân Hà Tinh Tú',
    icon: '🌌',
    color: '#a855f7',
    asset: '/assets/fishing/fish_galaxy_star.png',
    swimSheetKey: 'fish_pond_swim_8dir',
    minWeightG: 2200,
    maxWeightG: 4500,
    pullStages: 7,
    requiredHits: 7,
    requiredPullSteps: 8,
    pullStepsLabel: '7 Nhịp Kéo (Vũ Trụ · Cực Khó Đỉnh Cao)',
    zoneHeight: 10,
    markerSpeed: 240,
    sweepDurationMs: 1600,
    greenZoneRatio: 0.10,
    fakeNibblesMin: 3,
    fakeNibblesMax: 5,
    splashChance: 0.80,
    splashDurationMs: 1900,
    preferredBaits: ['bait_sweet_cake'],
    preferredDock: 'lotus_dock',
    temperament: 'Bạn cá huyền bí nhất vũ trụ, mang dải ngân hà muôn ánh sao, thử thách tối thượng 7 lần canh hoàn mỹ!',
    hint: 'Bảo vật tối thượng của Hồ Sen! Bật Skill Câu Cá để triệu hồi từ vũ trụ',
    voiceIntro: 'Trời ơi phi thường quá! Cá Ngân Hà Tinh Tú mang ánh sáng muôn vì sao đã xuất hiện!',
    maxStack: 1,
    sizeTier: 'special',
    isSpecial: true,
    isGlow: true
  }
]);

/**
 * Bảng trọng số xuất hiện theo Mồi + Bến Câu (FISHING_PLAN mục 7.3)
 */
export const BAIT_SPECIES_WEIGHTS = Object.freeze({
  bait_lotus: {
    lotus_dock: { cloud_fish: 48, lotus_fish: 36, orange_fish: 12, silver_bell_fish: 4, sun_spot_fish: 0, rainbow_fish: 0, crystal_fairy_fish: 0, golden_dragon_fish: 0, galaxy_star_fish: 0 },
    sunny_dock: { cloud_fish: 38, lotus_fish: 28, orange_fish: 26, silver_bell_fish: 8, sun_spot_fish: 0, rainbow_fish: 0, crystal_fairy_fish: 0, golden_dragon_fish: 0, galaxy_star_fish: 0 }
  },
  bait_crunchy: {
    lotus_dock: { cloud_fish: 20, lotus_fish: 34, orange_fish: 26, silver_bell_fish: 17, sun_spot_fish: 2, rainbow_fish: 0, crystal_fairy_fish: 1, golden_dragon_fish: 0, galaxy_star_fish: 0 },
    sunny_dock: { cloud_fish: 15, lotus_fish: 24, orange_fish: 36, silver_bell_fish: 20, sun_spot_fish: 4, rainbow_fish: 0, crystal_fairy_fish: 0, golden_dragon_fish: 1, galaxy_star_fish: 0 }
  },
  bait_sweet_cake: {
    lotus_dock: { cloud_fish: 10, lotus_fish: 22, orange_fish: 26, silver_bell_fish: 19, sun_spot_fish: 9, rainbow_fish: 5, crystal_fairy_fish: 5, golden_dragon_fish: 2, galaxy_star_fish: 2 },
    sunny_dock: { cloud_fish: 6, lotus_fish: 18, orange_fish: 26, silver_bell_fish: 22, sun_spot_fish: 12, rainbow_fish: 6, crystal_fairy_fish: 2, golden_dragon_fish: 6, galaxy_star_fish: 2 }
  }
});

/**
 * Bảng giá bán cá tại Sạp Cá Cô Mèo ở Chợ Cầu Vồng (FISHING_PLAN mục 9.2)
 */
export const SELL_PRICE_BRACKETS = Object.freeze([
  { minG: 100, maxG: 400, shells: 1, sizeLabel: 'Cá nhỏ xinh' },
  { minG: 450, maxG: 800, shells: 2, sizeLabel: 'Cá vừa tay' },
  { minG: 850, maxG: 1300, shells: 3, sizeLabel: 'Cá khá nặng' },
  { minG: 1350, maxG: 1750, shells: 4, sizeLabel: 'Cá lớn' },
  { minG: 1800, maxG: 2000, shells: 5, sizeLabel: 'Cá thật to' }
]);

/**
 * Quy đổi cá -> phần cá (cooking ingredient `fish`) tại Nhà Bếp (FISHING_PLAN Phase D)
 */
export const FISH_PORTION_BRACKETS = Object.freeze([
  { minG: 100, maxG: 550, portions: 1 },
  { minG: 600, maxG: 1150, portions: 2 },
  { minG: 1200, maxG: 2000, portions: 3 }
]);

/**
 * Bảng nhờ giúp không giới hạn thời gian tại Chợ Cầu Vồng (FISHING_PLAN mục 3.4 & 9.3)
 */
export const VILLAGE_HELP_REQUESTS = Object.freeze([
  {
    id: 'req_kitchen_500g',
    title: 'Bếp Làng Nấu Cháo Ấm',
    npcName: 'Đầu Bếp Thỏ',
    npcIcon: '🐰',
    desc: 'Bếp làng cần 1 bạn cá nặng từ 500g trở lên để nấu nồi cháo thơm cho cả làng.',
    minWeightG: 500,
    speciesId: null,
    rewardShells: 6,
    stickerId: 'sticker_kind_chef',
    stickerName: 'Huy Hiệu Đầu Bếp Nhí Ấm Áp'
  },
  {
    id: 'req_cat_lotus_fish',
    title: 'Món Quà Hoa Sen Của Cô Mèo',
    npcName: 'Cô Mèo Cân Cá',
    npcIcon: '🐱',
    desc: 'Cô Mèo muốn ngắm 1 bạn Cá Lá Sen tươi tắn từ Bến Sen.',
    minWeightG: 250,
    speciesId: 'lotus_fish',
    rewardShells: 5,
    stickerId: 'sticker_lotus_friend',
    stickerName: 'Huy Hiệu Bạn Thân Đầm Sen'
  },
  {
    id: 'req_sunny_feast_800g',
    title: 'Bữa Trưa Nắng Vàng',
    npcName: 'Bác Gấu Nâu',
    npcIcon: '🐻',
    desc: 'Bác Gấu nhờ bé tìm giúp 1 bạn cá to từ 800g trở lên nhé!',
    minWeightG: 800,
    speciesId: null,
    rewardShells: 8,
    stickerId: 'sticker_strong_angler',
    stickerName: 'Huy Hiệu Tay Câu Khéo Léo'
  }
]);

export const FISHING_MILESTONES = Object.freeze([
  { id: 'firstCatch', title: 'Con Cá Đầu Tiên', icon: '🐟', desc: 'Bé đã câu được bạn cá đầu tiên ở Hồ Lá Sen!' },
  { id: 'allSixSpecies', title: 'Nhà Thám Hiểm Hồ Sen', icon: '📖', desc: 'Bé đã làm quen đủ cả 6 loài cá trong Sổ Cá!' },
  { id: 'heavyFish1000g', title: 'Cá Lớn Hơn 1000g', icon: '⚖️', desc: 'Bé đã câu được một bạn cá nặng từ 1000g trở lên!' },
  { id: 'firstRelease', title: 'Tấm Lòng Yêu Thiên Nhiên', icon: '💚', desc: 'Bé đã nhẹ nhàng thả một bạn cá về lại hồ nước!' },
  { id: 'firstMarketSale', title: 'Khách Quý Chợ Cầu Vồng', icon: '⭐', desc: 'Bé đã cân cá cùng Cô Mèo và quy đổi Sao đầu tiên!' },
  { id: 'firstScaleGame', title: 'Nhà Toán Học Cân Đo', icon: '🎓', desc: 'Bé đã chơi trò so sánh Nặng hơn — Nhẹ hơn trong Sổ Cá!' }
]);

export function getFishSpecies(speciesId) {
  return FISH_SPECIES.find((f) => f.id === speciesId) || null;
}

export function getFishMaxStack(speciesId) {
  const sp = getFishSpecies(speciesId);
  return sp?.maxStack || 1;
}

export function isSpecialFish(speciesId) {
  const sp = getFishSpecies(speciesId);
  return Boolean(sp?.isSpecial || sp?.isGlow);
}

export function getRod(rodId) {
  return RODS.find((r) => r.id === rodId) || null;
}

export function getBait(baitId) {
  return BAITS.find((b) => b.id === baitId) || null;
}

export function getDock(dockId) {
  return DOCKS.find((d) => d.id === dockId) || DOCKS[0];
}

export function calculateFishSellPrice(weightG, speciesId = null) {
  if (speciesId === 'galaxy_star_fish') return 16; // Cá Ngân Hà Tinh Tú cực phẩm vũ trụ nhận 16 Sao!
  if (speciesId === 'golden_dragon_fish') return 12; // Cá Rồng Hoàng Kim nhận 12 Sao!
  if (speciesId === 'crystal_fairy_fish') return 10; // Cá Pha Lê Huyền Ảo nhận 10 Sao!
  if (speciesId === 'rainbow_fish') return 8; // Cá Cầu Vồng thần thoại nhận thưởng lớn 8 Sao!
  const w = Math.max(100, Math.min(5000, Math.round((Number(weightG) || 100) / 50) * 50));
  for (const b of SELL_PRICE_BRACKETS) {
    if (w >= b.minG && w <= b.maxG) return b.shells;
  }
  if (w < 100) return 1;
  return 5;
}

export function getFishSizeLabel(weightG) {
  const w = Math.max(100, Math.min(5000, Math.round((Number(weightG) || 100) / 50) * 50));
  for (const b of SELL_PRICE_BRACKETS) {
    if (w >= b.minG && w <= b.maxG) return b.sizeLabel;
  }
  return w >= 1400 ? 'Cá thật to' : 'Cá nhỏ xinh';
}

export function calculateFishPortions(weightG) {
  const w = Number(weightG) || 100;
  if (w < 600) return 1;
  if (w < 1200) return 2;
  if (w < 2000) return 3;
  if (w < 3000) return 4;
  return 5;
}

/**
 * Chọn loài cá và cân nặng bước 50g có áp dụng luật chống lặp 3 lần liên tiếp (FISHING_PLAN 8.1)
 * và cộng thưởng chất lượng cá + cân nặng theo cấp độ Cần Câu (rodId), cùng hiệu ứng DÙNG SKILL CÂU CÁ.
 */
export function rollFishSpeciesAndWeight({
  baitId = 'bait_lotus',
  dockId = 'lotus_dock',
  rodId = 'rod_lotus',
  recentSpecies = [],
  isFirstTutorial = false,
  isSkillActive = false,
  rng = Math.random
} = {}) {
  if (isFirstTutorial) {
    const tutorialFish = getFishSpecies('cloud_fish');
    return {
      speciesId: tutorialFish.id,
      weightG: 250,
      species: tutorialFish
    };
  }

  const rod = getRod(rodId) || RODS[0];
  const baitMap = BAIT_SPECIES_WEIGHTS[baitId] || BAIT_SPECIES_WEIGHTS.bait_lotus;
  const rawWeights = { ...(baitMap[dockId] || baitMap.lotus_dock) };

  // HIỆU ỨNG DÙNG SKILL: Tăng đột biến cơ hội gọi các bạn cá mới quý hiếm và khó bắt!
  if (isSkillActive) {
    rawWeights.cloud_fish = Math.max(2, Math.round((rawWeights.cloud_fish || 0) * 0.3));
    rawWeights.lotus_fish = Math.max(5, Math.round((rawWeights.lotus_fish || 0) * 0.4));
    rawWeights.crystal_fairy_fish = (rawWeights.crystal_fairy_fish || 0) + 18;
    rawWeights.golden_dragon_fish = (rawWeights.golden_dragon_fish || 0) + 16;
    rawWeights.galaxy_star_fish = (rawWeights.galaxy_star_fish || 0) + 14;
    rawWeights.rainbow_fish = (rawWeights.rainbow_fish || 0) + 18;
    rawWeights.sun_spot_fish = (rawWeights.sun_spot_fish || 0) + 15;
  }

  // Cần xịn tăng nhẹ cơ hội cá lớn, giữ cá hiếm thật sự quý và bất ngờ
  if (rod.tier === 2) {
    rawWeights.cloud_fish = Math.max(8, Math.round((rawWeights.cloud_fish || 0) * 0.75));
    rawWeights.orange_fish = Math.round((rawWeights.orange_fish || 0) * 1.2);
    rawWeights.silver_bell_fish = Math.round((rawWeights.silver_bell_fish || 0) * 1.2);
    if (rawWeights.sun_spot_fish > 0) {
      rawWeights.sun_spot_fish = Math.round(rawWeights.sun_spot_fish * 1.15);
    }
    if (rawWeights.rainbow_fish > 0) {
      rawWeights.rainbow_fish = Math.round(rawWeights.rainbow_fish * 1.15);
    }
  } else if (rod.tier >= 3) {
    rawWeights.cloud_fish = Math.max(5, Math.round((rawWeights.cloud_fish || 0) * 0.6));
    rawWeights.lotus_fish = Math.max(12, Math.round((rawWeights.lotus_fish || 0) * 0.8));
    rawWeights.orange_fish = Math.round((rawWeights.orange_fish || 0) * 1.25);
    rawWeights.silver_bell_fish = Math.round((rawWeights.silver_bell_fish || 0) * 1.3);
    if (rawWeights.sun_spot_fish > 0) {
      rawWeights.sun_spot_fish = Math.min(16, Math.round(rawWeights.sun_spot_fish * (1 + (rod.tier - 2) * 0.15)));
    }
    if (rawWeights.rainbow_fish > 0) {
      rawWeights.rainbow_fish = Math.min(10, Math.round(rawWeights.rainbow_fish * (1 + (rod.tier - 2) * 0.2)));
    }
    if (rawWeights.crystal_fairy_fish > 0) {
      rawWeights.crystal_fairy_fish = Math.min(12, Math.round(rawWeights.crystal_fairy_fish * (1 + (rod.tier - 2) * 0.2)));
    }
    if (rawWeights.golden_dragon_fish > 0) {
      rawWeights.golden_dragon_fish = Math.min(12, Math.round(rawWeights.golden_dragon_fish * (1 + (rod.tier - 2) * 0.2)));
    }
    if (rawWeights.galaxy_star_fish > 0) {
      rawWeights.galaxy_star_fish = Math.min(10, Math.round(rawWeights.galaxy_star_fish * (1 + (rod.tier - 2) * 0.25)));
    }
  }

  // Anti-repeat: nếu 3 lượt gần nhất cùng 1 loài thì khóa loài đó ở lượt kế tiếp
  if (
    Array.isArray(recentSpecies) &&
    recentSpecies.length >= FISHING_LIMITS.ANTI_REPEAT_HISTORY
  ) {
    const tail = recentSpecies.slice(-FISHING_LIMITS.ANTI_REPEAT_HISTORY);
    const first = tail[0];
    if (first && tail.every((s) => s === first)) {
      rawWeights[first] = 0;
    }
  }

  const entries = Object.entries(rawWeights).filter(([, w]) => w > 0);
  let chosenSpeciesId = 'cloud_fish';
  const totalWeight = entries.reduce((acc, [, w]) => acc + w, 0);
  if (totalWeight > 0) {
    let roll = rng() * totalWeight;
    for (const [spId, w] of entries) {
      roll -= w;
      if (roll <= 0) {
        chosenSpeciesId = spId;
        break;
      }
    }
  }

  const species = getFishSpecies(chosenSpeciesId) || FISH_SPECIES[0];
  const steps = Math.floor((species.maxWeightG - species.minWeightG) / FISHING_LIMITS.WEIGHT_STEP_G);
  const minStep = Math.min(steps, Math.floor(steps * (rod.minWeightBonusRatio || 0)));
  const span = Math.max(0, steps - minStep);
  const stepIndex = minStep + Math.min(span, Math.floor(rng() * (span + 1)));
  const weightG = species.minWeightG + stepIndex * FISHING_LIMITS.WEIGHT_STEP_G;

  return {
    speciesId: species.id,
    weightG,
    species
  };
}
