/**
 * src/content/achievements/badgeData.js
 * Chuỗi Huy Hiệu & Thành Tựu Vinh Quang Của Bé (Bậc 1 đến Bậc 20).
 * - Sắp xếp thành 1 Chuỗi Tiến Trình Duy Nhất (Linear Rank Progression) từ Dễ đến Khó.
 * - Không phân mảnh rời rạc theo từng hạng mục.
 * - Mỗi bậc huy hiệu yêu cầu đã đạt bậc trước đó (previousBadgeId) kết hợp độ khó thực tế tăng dần.
 */

export const BADGE_CATEGORIES = Object.freeze([
  { id: 'all', name: 'Toàn Bộ Chuỗi', icon: '🏅' },
  { id: 'tier_starter', name: 'Bậc 1 - 5: Khởi Đầu', icon: '🌱' },
  { id: 'tier_growth', name: 'Bậc 6 - 10: Tiến Bước', icon: '⭐' },
  { id: 'tier_challenge', name: 'Bậc 11 - 15: Bứt Phá', icon: '🔥' },
  { id: 'tier_master', name: 'Bậc 16 - 20: Đỉnh Cao', icon: '👑' }
]);

export const BADGES = Object.freeze([
  // ==========================================
  // GIAI ĐOẠN 1: BẬC 1 - 5 (KHỞI ĐẦU HÀNH TRÌNH)
  // ==========================================
  {
    id: 'badge_math_genius',
    rank: 1,
    tier: 'tier_starter',
    previousBadgeId: null,
    title: 'Mầm Non Học Hỏi',
    shortTitle: 'Mầm Non',
    icon: '🎓',
    category: 'tier_starter',
    categoryLabel: '🏅 Bậc 1 / 20',
    desc: 'Bé đã khởi đầu hành trình thông thái, trả lời đúng câu đố học tập đầu tiên!',
    goalHint: 'Trả lời đúng 1 câu đố vượt ải trên bản đồ phiêu lưu để mở màn chuỗi danh hiệu nhé!',
    voiceDesc: 'Bậc một! Mầm Non Học Hỏi! Bé đã khởi đầu hành trình thật thông minh và nhanh nhẹn!',
    checkUnlocked: (state) => {
      const learning = state?.campaign?.learningStats || {};
      const totalAns = learning.totalAnswers || 0;
      return totalAns >= 1 || Boolean(state?.fishing?.milestones?.firstScaleGame);
    }
  },
  {
    id: 'badge_clean_hands',
    rank: 2,
    tier: 'tier_starter',
    previousBadgeId: 'badge_math_genius',
    title: 'Bé Sạch Khuẩn',
    shortTitle: 'Sạch Khuẩn',
    icon: '🧼',
    category: 'tier_starter',
    categoryLabel: '🏅 Bậc 2 / 20',
    desc: 'Bé thực hiện đúng quy trình 8 bước rửa tay sạch khuẩn trước khi chuẩn bị bữa ăn!',
    goalHint: 'Đã đạt Bậc 1 → Ghé bồn rửa tay Bếp Cầu Vồng và hoàn thành đủ 8 bước vệ sinh nhé!',
    voiceDesc: 'Bậc hai! Bé Sạch Khuẩn! Đôi bàn tay bé thơm tho sạch bóng chuẩn bị cho mọi thử thách!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_math_genius')) return false;
      return Boolean(state?.cooking?.handWash8StepsDone);
    }
  },
  {
    id: 'badge_pet_feeder',
    rank: 3,
    tier: 'tier_starter',
    previousBadgeId: 'badge_clean_hands',
    title: 'Bạn Nhỏ Chu Đáo',
    shortTitle: 'Chu Đáo',
    icon: '🍖',
    category: 'tier_starter',
    categoryLabel: '🏅 Bậc 3 / 20',
    desc: 'Bé biết yêu thương, chăm sóc cún cưng ăn thật no và tiếp thêm năng lượng!',
    goalHint: 'Đã đạt Bậc 2 → Mở chăm sóc thú cưng và cho bé cún ăn no đạt trên 80% nhé!',
    voiceDesc: 'Bậc ba! Bạn Nhỏ Chu Đáo! Thú cưng được ăn no ngon miệng đang vẫy đuôi mừng rỡ!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_clean_hands')) return false;
      return (state?.pet?.hunger || 0) >= 80;
    }
  },
  {
    id: 'badge_pet_bath',
    rank: 4,
    tier: 'tier_starter',
    previousBadgeId: 'badge_pet_feeder',
    title: 'Bé Tắm Mát Rượi',
    shortTitle: 'Tắm Mát',
    icon: '🛁',
    category: 'tier_starter',
    categoryLabel: '🏅 Bậc 4 / 20',
    desc: 'Bé đã tắm rửa sạch bóng và xịt bọt xà phòng thơm tho cho thú cưng yêu quý!',
    goalHint: 'Đã đạt Bậc 3 → Tắm bồn nước mát cho thú cưng đạt độ sạch trên 80% nha!',
    voiceDesc: 'Bậc bốn! Bé Tắm Mát Rượi! Thú cưng sạch sẽ thơm tho, bộ lông óng mượt tuyệt đẹp!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_pet_feeder')) return false;
      return (state?.pet?.clean || 0) >= 80;
    }
  },
  {
    id: 'badge_first_catch',
    rank: 5,
    tier: 'tier_starter',
    previousBadgeId: 'badge_pet_bath',
    title: 'Cần Thủ Kiên Trì',
    shortTitle: 'Cần Thủ',
    icon: '🎣',
    category: 'tier_starter',
    categoryLabel: '🏅 Bậc 5 / 20',
    desc: 'Bé kiên nhẫn quan sát nhịp nước và câu thành công bạn cá đầu tiên lên bờ!',
    goalHint: 'Đã đạt Bậc 4 → Ghé cầu gỗ Hồ Lá Sen, canh chuẩn thanh trượt và kéo bạn cá đầu tiên lên nhé!',
    voiceDesc: 'Bậc năm! Cần Thủ Kiên Trì! Bé đã câu được chú cá đầu tiên ở Hồ Lá Sen!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_pet_bath')) return false;
      const fishing = state?.fishing || {};
      const caughtCount = fishing.caughtCount || 0;
      const basketCount = (fishing.basket || []).length;
      const bookCount = Object.keys(fishing.fishBook || {}).length;
      return caughtCount >= 1 || basketCount >= 1 || bookCount >= 1 || Boolean(fishing.milestones?.firstCatch);
    }
  },

  // ==========================================
  // GIAI ĐOẠN 2: BẬC 6 - 10 (TIẾN BƯỚC KHÁM PHÁ)
  // ==========================================
  {
    id: 'badge_little_chef',
    rank: 6,
    tier: 'tier_growth',
    previousBadgeId: 'badge_first_catch',
    title: 'Đầu Bếp Nhí Khéo Tay',
    shortTitle: 'Đầu Bếp Nhí',
    icon: '👨‍🍳',
    category: 'tier_growth',
    categoryLabel: '🏅 Bậc 6 / 20',
    desc: 'Bé đã nấu thành công món ăn dinh dưỡng đầu tiên thơm ngát tại Bếp Cầu Vồng!',
    goalHint: 'Đã đạt Bậc 5 → Rửa tay sạch khuẩn, bật bếp lò và nấu 1 món ăn bổ dưỡng thơm ngon!',
    voiceDesc: 'Bậc sáu! Đầu Bếp Nhí Khéo Tay! Món ăn bé nấu tỏa hương thơm ngát cả gian bếp!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_first_catch')) return false;
      const cooking = state?.cooking || {};
      const count = cooking.cookedDishesCount || 0;
      const history = (cooking.cookedHistory || []).length;
      const inv = (cooking.inventory || []).length;
      return count >= 1 || history >= 1 || inv >= 1;
    }
  },
  {
    id: 'badge_star_collector',
    rank: 7,
    tier: 'tier_growth',
    previousBadgeId: 'badge_little_chef',
    title: 'Bé Tích Sao Ngoan',
    shortTitle: 'Kho Sao',
    icon: '⭐',
    category: 'tier_growth',
    categoryLabel: '🏅 Bậc 7 / 20',
    desc: 'Bé chăm chỉ tích lũy được kho tàng từ 15 Ngôi Sao sáng lấp lánh!',
    goalHint: 'Đã đạt Bậc 6 → Vượt ải, làm việc tốt hoặc bán cá tích lũy đạt từ 15 Ngôi Sao trở lên!',
    voiceDesc: 'Bậc bảy! Bé Tích Sao Ngoan! Kho tàng Ngôi Sao của bé lấp lánh như bầu trời đêm!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_little_chef')) return false;
      const stars = state?.player?.stars || state?.fishing?.shells || 0;
      return stars >= 15;
    }
  },
  {
    id: 'badge_market_vip',
    rank: 8,
    tier: 'tier_growth',
    previousBadgeId: 'badge_star_collector',
    title: 'Khách Quý Chợ Làng',
    shortTitle: 'Khách Quý',
    icon: '🏮',
    category: 'tier_growth',
    categoryLabel: '🏅 Bậc 8 / 20',
    desc: 'Bé đã ghé Sạp Cô Mèo ở Chợ Cầu Vồng, cân cá và đổi lấy những Ngôi Sao rực rỡ!',
    goalHint: 'Đã đạt Bậc 7 → Mang cá câu được sang Chợ Cầu Vồng thả vào ô đổi Sao Cô Mèo!',
    voiceDesc: 'Bậc tám! Khách Quý Chợ Làng! Cô Mèo rất vui mừng chào đón bé ghé sạp hàng!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_star_collector')) return false;
      const fishing = state?.fishing || {};
      return Boolean(fishing.milestones?.firstMarketSale) || (fishing.totalSalesCount || 0) >= 1;
    }
  },
  {
    id: 'badge_world_explorer',
    rank: 9,
    tier: 'tier_growth',
    previousBadgeId: 'badge_market_vip',
    title: 'Nhà Thám Hiểm Nhí',
    shortTitle: 'Thám Hiểm',
    icon: '🗺️',
    category: 'tier_growth',
    categoryLabel: '🏅 Bậc 9 / 20',
    desc: 'Bé đã dũng cảm bước qua cổng ma thuật, mở khóa từ 2 vùng đất kỳ diệu!',
    goalHint: 'Đã đạt Bậc 8 → Mở khóa từ 2 vùng đất trên bản đồ vương quốc Cầu Vồng!',
    voiceDesc: 'Bậc chín! Nhà Thám Hiểm Nhí! Đôi chân nhỏ bé đã đặt dấu chân đến nhiều miền đất xinh đẹp!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_market_vip')) return false;
      const maps = state?.campaign?.unlockedMaps || [];
      return maps.length >= 2;
    }
  },
  {
    id: 'badge_pet_bestie',
    rank: 10,
    tier: 'tier_growth',
    previousBadgeId: 'badge_world_explorer',
    title: 'Đôi Bạn Tri Kỷ',
    shortTitle: 'Tri Kỷ',
    icon: '💖',
    category: 'tier_growth',
    categoryLabel: '🏅 Bậc 10 / 20',
    desc: 'Thú cưng đã nâng lên Cấp 2, tình bạn ngọt ngào quấn quýt bên bé không rời!',
    goalHint: 'Đã đạt Bậc 9 → Chăm sóc, vuốt ve và chơi bóng để thú cưng tăng lên Cấp 2 nhé!',
    voiceDesc: 'Bậc mười! Đôi Bạn Tri Kỷ! Tình bạn ngọt ngào giữa bé và thú cưng thật ấm áp!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_world_explorer')) return false;
      const pet = state?.pet || {};
      return (pet.level || 1) >= 2 || (pet.affinity || 1) >= 2 || (pet.affection || 0) >= 25;
    }
  },

  // ==========================================
  // GIAI ĐOẠN 3: BẬC 11 - 15 (BỨT PHÁ TÀI NĂNG)
  // ==========================================
  {
    id: 'badge_pet_companion',
    rank: 11,
    tier: 'tier_challenge',
    previousBadgeId: 'badge_pet_bestie',
    title: 'Đồng Hành Tung Tăng',
    shortTitle: 'Tung Tăng',
    icon: '🐾',
    category: 'tier_challenge',
    categoryLabel: '🏅 Bậc 11 / 20',
    desc: 'Bé đã dắt thú cưng đi dạo phiêu lưu cùng nhau qua các vùng đất!',
    goalHint: 'Đã đạt Bậc 10 → Bật nút "Dẫn Cún Đi Cùng" tại Nông Trại để cún đi dạo cùng bé!',
    voiceDesc: 'Bậc mười một! Đồng Hành Tung Tăng! Đôi bạn nhỏ cùng nhau phiêu lưu khắp mọi nẻo đường!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_pet_bestie')) return false;
      return Boolean(state?.pet?.isCompanion);
    }
  },
  {
    id: 'badge_fish_master',
    rank: 12,
    tier: 'tier_challenge',
    previousBadgeId: 'badge_pet_companion',
    title: 'Chuyên Gia Cần Thủ',
    shortTitle: 'Chuyên Gia',
    icon: '🐟',
    category: 'tier_challenge',
    categoryLabel: '🏅 Bậc 12 / 20',
    desc: 'Bé đã câu thành công từ 5 bạn cá trở lên ở Hồ Sen, kỹ năng kéo cần điêu luyện!',
    goalHint: 'Đã đạt Bậc 11 → Câu được ít nhất 5 bạn cá các loại để chứng minh sự kiên nhẫn!',
    voiceDesc: 'Bậc mười hai! Chuyên Gia Cần Thủ! Bé thật là khéo tay, đã câu được từ 5 bạn cá trở lên!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_pet_companion')) return false;
      const fishing = state?.fishing || {};
      const totalBookCatches = Object.values(fishing.fishBook || {}).reduce((sum, r) => sum + (r.caughtCount || 0), 0);
      const totalCaught = (fishing.caughtCount || 0) + (fishing.basket || []).length;
      return totalBookCatches >= 5 || totalCaught >= 5;
    }
  },
  {
    id: 'badge_smart_shopper',
    rank: 13,
    tier: 'tier_challenge',
    previousBadgeId: 'badge_fish_master',
    title: 'Quản Gia Tủ Bếp',
    shortTitle: 'Quản Gia',
    icon: '🥕',
    category: 'tier_challenge',
    categoryLabel: '🏅 Bậc 13 / 20',
    desc: 'Bé đã mua và tích trữ sẵn sàng từ 3 nguyên liệu dinh dưỡng tươi sạch trong Tủ Lạnh!',
    goalHint: 'Đã đạt Bậc 12 → Tích lũy Sao, ghé Tủ Lạnh Nhà Bếp và mua ít nhất 3 nguyên liệu tươi!',
    voiceDesc: 'Bậc mười ba! Quản Gia Tủ Bếp! Tủ bếp đã đầy ắp rau củ và cá tươi ngon!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_fish_master')) return false;
      const pantry = state?.cooking?.pantry || {};
      const totalPantry = Object.values(pantry).reduce((s, v) => s + (Number(v) || 0), 0);
      return totalPantry >= 3;
    }
  },
  {
    id: 'badge_master_cook',
    rank: 14,
    tier: 'tier_challenge',
    previousBadgeId: 'badge_smart_shopper',
    title: 'Vua Bếp Cầu Vồng',
    shortTitle: 'Vua Bếp',
    icon: '🍲',
    category: 'tier_challenge',
    categoryLabel: '🏅 Bậc 14 / 20',
    desc: 'Bé đã nấu thành công từ 2 món ăn bổ dưỡng khác nhau, nghệ sĩ ẩm thực tài hoa!',
    goalHint: 'Đã đạt Bậc 13 → Nấu thêm các món mới trong thực đơn như Cháo Cá hay Súp Cà Rốt!',
    voiceDesc: 'Bậc mười bốn! Vua Bếp Cầu Vồng! Bé là một nghệ sĩ ẩm thực nhí tài ba!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_smart_shopper')) return false;
      const cooking = state?.cooking || {};
      const count = cooking.cookedDishesCount || 0;
      const history = (cooking.cookedHistory || []).length;
      return count >= 2 || history >= 2;
    }
  },
  {
    id: 'badge_giant_fish',
    rank: 15,
    tier: 'tier_challenge',
    previousBadgeId: 'badge_master_cook',
    title: 'Thợ Săn Cá Khủng',
    shortTitle: 'Cá Khủng',
    icon: '🐋',
    category: 'tier_challenge',
    categoryLabel: '🏅 Bậc 15 / 20',
    desc: 'Bé đã chinh phục được một bạn cá to lớn nặng từ 500g trở lên!',
    goalHint: 'Đã đạt Bậc 14 → Canh chuẩn nhịp kéo ở Hồ Sen để câu bạn cá to bự từ 500g trở lên!',
    voiceDesc: 'Bậc mười lăm! Thợ Săn Cá Khủng! Chà, bé đã câu được một bạn cá thật to và nặng!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_master_cook')) return false;
      const fishing = state?.fishing || {};
      const bookMax = Object.values(fishing.fishBook || {}).some(r => (r.maxWeightG || 0) >= 500);
      const basketMax = (fishing.basket || []).some(f => (f.weightG || 0) >= 500);
      return bookMax || basketMax || Boolean(fishing.milestones?.heavyFish1000g);
    }
  },

  // ==========================================
  // GIAI ĐOẠN 4: BẬC 16 - 20 (ĐỈNH CAO HUYỀN THOẠI)
  // ==========================================
  {
    id: 'badge_kind_heart',
    rank: 16,
    tier: 'tier_master',
    previousBadgeId: 'badge_giant_fish',
    title: 'Trái Tim Nhân Ái',
    shortTitle: 'Nhân Ái',
    icon: '💚',
    category: 'tier_master',
    categoryLabel: '🏅 Bậc 16 / 20',
    desc: 'Bé có tấm lòng nhân ái, nhẹ nhàng mở giỏ thả bạn cá về với hồ nước tự do!',
    goalHint: 'Đã đạt Bậc 15 → Bấm vào Túi hoặc Giỏ Cá, chọn 1 bạn cá và bấm "Thả Cá Về Hồ" nhé!',
    voiceDesc: 'Bậc mười sáu! Trái Tim Nhân Ái! Bé thật tốt bụng khi thả bạn cá về với tự do trong làn nước mát!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_giant_fish')) return false;
      return Boolean(state?.fishing?.milestones?.firstRelease);
    }
  },
  {
    id: 'badge_brave_hero',
    rank: 17,
    tier: 'tier_master',
    previousBadgeId: 'badge_kind_heart',
    title: 'Hiệp Sĩ Quả Cảm',
    shortTitle: 'Hiệp Sĩ',
    icon: '🛡️',
    category: 'tier_master',
    categoryLabel: '🏅 Bậc 17 / 20',
    desc: 'Bé đã dũng cảm vượt qua thử thách, nâng cấp nhân vật hoặc giải cứu các bạn nhỏ!',
    goalHint: 'Đã đạt Bậc 16 → Nâng cấp nhân vật lên Cấp 2 hoặc hoàn thành thử thách cứu bạn!',
    voiceDesc: 'Bậc mười bảy! Hiệp Sĩ Quả Cảm! Tấm khiên dũng cảm của bé tỏa sáng rạng ngời!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_kind_heart')) return false;
      const player = state?.player || {};
      const camp = state?.campaign || {};
      return (player.level || 1) >= 2 || Object.keys(camp.rescuedFriends || {}).length >= 1 || (camp.completedMaps || []).length >= 1;
    }
  },
  {
    id: 'badge_village_helper',
    rank: 18,
    tier: 'tier_master',
    previousBadgeId: 'badge_brave_hero',
    title: 'Người Hùng Làng Quê',
    shortTitle: 'Người Hùng',
    icon: '🤝',
    category: 'tier_master',
    categoryLabel: '🏅 Bậc 18 / 20',
    desc: 'Bé nhiệt tình hoàn thành lời nhờ giúp ở Bếp Làng và nhận sticker vinh dự!',
    goalHint: 'Đã đạt Bậc 17 → Hoàn thành nhiệm vụ giúp đỡ người dân làng để nhận sticker!',
    voiceDesc: 'Bậc mười tám! Người Hùng Làng Quê! Mọi người trong làng đều yêu quý và cảm ơn bé!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_brave_hero')) return false;
      return (state?.fishing?.stickers || []).length >= 1;
    }
  },
  {
    id: 'badge_rainbow_angler',
    rank: 19,
    tier: 'tier_master',
    previousBadgeId: 'badge_village_helper',
    title: 'Thần Cần Cầu Vồng',
    shortTitle: 'Cần Cầu Vồng',
    icon: '🌈',
    category: 'tier_master',
    categoryLabel: '🏅 Bậc 19 / 20',
    desc: 'Bé sở hữu chiếc Cần Cầu Vồng lung linh 7 sắc, báu vật của các cần thủ!',
    goalHint: 'Đã đạt Bậc 18 → Tích lũy Sao ở Chợ Cầu Vồng để đổi chiếc Cần Câu Cầu Vồng xinh đẹp!',
    voiceDesc: 'Bậc mười chín! Thần Cần Cầu Vồng! Chiếc cần câu lấp lánh ánh cầu vồng tuyệt đẹp!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_village_helper')) return false;
      const fishing = state?.fishing || {};
      const rods = fishing.unlockedRods || [];
      return rods.includes('rod_rainbow') || rods.includes('rod_dragon') || fishing.equippedRodId === 'rod_rainbow';
    }
  },
  {
    id: 'badge_master_champion',
    rank: 20,
    tier: 'tier_master',
    previousBadgeId: 'badge_rainbow_angler',
    title: 'Siêu Sao Toàn Năng',
    shortTitle: 'Siêu Sao',
    icon: '👑',
    category: 'tier_master',
    categoryLabel: '🏅 Bậc 20 / 20',
    desc: 'Đỉnh cao vinh quang! Bé đã xuất sắc vượt qua trọn vẹn 19 bậc thử thách của vương quốc!',
    goalHint: 'Chinh phục đầy đủ 19 bậc huy hiệu tiền đề để chạm tay vào vương miện tối cao!',
    voiceDesc: 'Bậc hai mươi! Siêu Sao Toàn Năng! Chúc mừng bé yêu đã trở thành niềm tự hào lớn nhất của vương quốc Cầu Vồng!',
    checkUnlocked: (state) => {
      const unlocked = state?.player?.unlockedBadges || [];
      if (!unlocked.includes('badge_rainbow_angler')) return false;
      return unlocked.length >= 19;
    }
  }
]);

export function getBadgeById(id) {
  return BADGES.find(b => b.id === id) || null;
}
