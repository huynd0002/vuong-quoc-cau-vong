/**
 * Pet System - Triển khai chuẩn hóa 100% theo he-thong-nuoi-thu.md
 * 
 * Quy ước & Thông số:
 * - Quy ước phần trăm: 0–100% (Độ no, Độ khát, Sạch sẽ, Vui vẻ, Năng lượng, Sức khỏe, Tình cảm).
 *   Riêng Buồn vệ sinh càng cao càng cần đưa thú ra ngoài.
 * - Thời gian: 1 giờ trong game = 2 phút chơi thực tế (120 giây).
 * - Tốc độ giảm khi thức (% mỗi giờ trong game):
 *   + Độ no: -3.5%
 *   + Độ khát: -5.0%
 *   + Sạch sẽ: -1.5%
 *   + Vui vẻ: -4.0%
 *   + Năng lượng: -1.5%
 *   + Buồn vệ sinh: +5.0%
 *   + Sức khỏe: 100% (chỉ giảm khi Độ no, Độ khát hoặc Năng lượng < 10% kéo dài 3 giờ trong game)
 *   + Tình cảm: 10% ban đầu, không tự giảm theo thời gian
 * - Khi đang ngủ: Năng lượng +12% / giờ trong game, Buồn vệ sinh không tăng.
 * - Offline decay: 1 giờ vắng mặt = 0.5 giờ trong game, tối đa 4 giờ trong game.
 *   Không giảm sức khỏe, tình cảm hay buồn vệ sinh khi offline.
 * - Chống spam tình cảm: lặp lại cùng hành động trong 5 phút trong game (10s thực tế) chỉ nhận 50% tình cảm.
 */

export const PET_EXP_PER_LEVEL = 30;
export const MIN_OFFLINE_STAT = 30; // Chặn an toàn cho trẻ mầm non
export const SECONDS_PER_GAME_HOUR = 120; // 1 giờ trong game = 120 giây thực tế

export const PERSONALITY_TRAITS = {
  QUAN_CHU: 'quanchu',     // Quấn chủ: gắn bó, hay đi theo
  DOC_LAP: 'doclap',       // Độc lập: nghỉ ở chỗ quen
  NANG_DONG: 'nangdong',   // Năng động: thích chơi, vui vẻ giảm nhanh hơn 20%
  DIEM_TINH: 'diemtinh',   // Điềm tĩnh: vui vẻ & năng lượng giảm chậm hơn 20%
  NHUT_NHAT: 'nhutnhat',   // Nhút nhát: dè dặt ban đầu, thích xoa đầu
  THICH_NUOC: 'thichnuoc', // Thích nước: tắm tăng thêm vui vẻ
  SO_NUOC: 'sonuoc'        // Sợ nước: tắm không trừ tình cảm
};

export const AFFECTION_TIERS = {
  RESERVED: { min: 0, max: 24, label: 'Dè dặt', code: 'reserved' },
  FRIENDLY: { min: 25, max: 49, label: 'Thân thiện', code: 'friendly' },
  ATTACHED: { min: 50, max: 74, label: 'Gắn bó', code: 'attached' },
  LOYAL: { min: 75, max: 89, label: 'Quấn quýt', code: 'loyal' },
  DEVOTED: { min: 90, max: 100, label: 'Tri kỷ', code: 'devoted' }
};

export class PetSystem {
  constructor(petState = {}) {
    this.pet = this.ensureValidPetState(petState);
    this.actionHistory = {}; // Lưu mốc thời gian hành động để chống spam tình cảm
    this.criticalNeglectSeconds = 0; // Đếm thời gian nhu cầu < 10%
    this.applyOfflineDecay();
  }

  ensureValidPetState(state) {
    const now = Date.now();
    return {
      type: (state.type === 'bunny' ? 'dog' : (state.type || 'dog')),
      name: (!state.name || state.name === 'Thỏ Bông' || state.name.toLowerCase().includes('thỏ')) ? 'Bé Cún' : state.name,
      hunger: typeof state.hunger === 'number' ? state.hunger : 100,
      thirst: typeof state.thirst === 'number' ? state.thirst : 100,
      clean: typeof state.clean === 'number' ? state.clean : 100,
      fun: typeof state.fun === 'number' ? state.fun : 80,
      energy: typeof state.energy === 'number' ? state.energy : 100,
      bladder: typeof state.bladder === 'number' ? state.bladder : 0,
      health: typeof state.health === 'number' ? state.health : 100,
      affection: typeof state.affection === 'number' ? state.affection : 10,
      personality: state.personality || PERSONALITY_TRAITS.QUAN_CHU,
      isSleeping: Boolean(state.isSleeping),
      isCompanion: Boolean(state.isCompanion ?? false),
      level: state.level || 1,
      exp: state.exp || 0,
      affinity: state.affinity || 1,
      lastCareTimestamp: state.lastCareTimestamp || now,
      lastSimulationTimestamp: state.lastSimulationTimestamp || now
    };
  }

  getPet() {
    return this.pet;
  }

  /**
   * Tính toán tỷ lệ tính cách (±20% theo mục 6)
   */
  getPersonalityModifier(statName) {
    const p = this.pet.personality;
    if (p === PERSONALITY_TRAITS.NANG_DONG) {
      if (statName === 'fun') return 1.20; // Vui vẻ giảm nhanh hơn 20%
      if (statName === 'energy') return 1.15;
    } else if (p === PERSONALITY_TRAITS.DIEM_TINH) {
      if (statName === 'fun') return 0.80; // Vui vẻ giảm chậm hơn 20%
      if (statName === 'energy') return 0.80;
    } else if (p === PERSONALITY_TRAITS.QUAN_CHU) {
      if (statName === 'fun') return 1.10;
    } else if (p === PERSONALITY_TRAITS.DOC_LAP) {
      if (statName === 'fun') return 0.85;
    }
    return 1.0;
  }

  /**
   * Cập nhật mô phỏng thời gian thực (được gọi từ game loop hoặc timer)
   * deltaSeconds: số giây thực tế trôi qua
   */
  updateSimulation(deltaSeconds = 1) {
    if (deltaSeconds <= 0) return;

    // 1 giờ trong game = 120 giây thực tế
    const gameHoursPassed = deltaSeconds / SECONDS_PER_GAME_HOUR;

    if (this.pet.isSleeping) {
      // Khi đang ngủ: Năng lượng tăng 12% mỗi giờ trong game
      this.pet.energy = Math.min(100, this.pet.energy + 12.0 * gameHoursPassed);
      // Buồn vệ sinh không tăng khi ngủ
    } else {
      // Khi đang thức:
      const energyMod = this.getPersonalityModifier('energy');
      const funMod = this.getPersonalityModifier('fun');

      this.pet.hunger = Math.max(0, this.pet.hunger - 3.5 * gameHoursPassed);
      this.pet.thirst = Math.max(0, this.pet.thirst - 5.0 * gameHoursPassed);
      this.pet.clean = Math.max(0, this.pet.clean - 1.5 * gameHoursPassed);
      this.pet.fun = Math.max(0, this.pet.fun - 4.0 * funMod * gameHoursPassed);
      this.pet.energy = Math.max(0, this.pet.energy - 1.5 * energyMod * gameHoursPassed);
      this.pet.bladder = Math.min(100, this.pet.bladder + 5.0 * gameHoursPassed);
    }

    // Kiểm tra sức khỏe: nếu đói, khát hoặc năng lượng < 10% kéo dài liên tục 3 giờ trong game (360s thực tế)
    const isCritical = this.pet.hunger < 10 || this.pet.thirst < 10 || this.pet.energy < 10;
    if (isCritical) {
      this.criticalNeglectSeconds += deltaSeconds;
      if (this.criticalNeglectSeconds >= 360) {
        // Giảm 4% sức khỏe mỗi giờ trong game, tối đa giảm xuống 60%
        this.pet.health = Math.max(60, this.pet.health - 4.0 * gameHoursPassed);
      }
    } else {
      this.criticalNeglectSeconds = Math.max(0, this.criticalNeglectSeconds - deltaSeconds);
      // Tự hồi phục sức khỏe nhẹ nhàng khi nhu cầu được đáp ứng đầy đủ
      if (this.pet.hunger >= 70 && this.pet.thirst >= 70 && this.pet.clean >= 70 && this.pet.health < 100) {
        this.pet.health = Math.min(100, this.pet.health + 2.0 * gameHoursPassed);
      }
    }

    // Tai nạn vệ sinh nếu buồn vệ sinh >= 95% quá 1 giờ trong game (120s)
    if (this.pet.bladder >= 95) {
      this.bladderAccidentTimer = (this.bladderAccidentTimer || 0) + deltaSeconds;
      if (this.bladderAccidentTimer >= 120) {
        // Xảy ra tai nạn: reset buồn vệ sinh, bẩn lông, không trừ tình cảm
        this.pet.bladder = 0;
        this.pet.clean = Math.max(0, this.pet.clean - 30);
        this.bladderAccidentTimer = 0;
      }
    } else {
      this.bladderAccidentTimer = 0;
    }

    this.pet.lastSimulationTimestamp = Date.now();
  }

  /**
   * Tính toán suy giảm offline an toàn khi mở lại game (Mục 1)
   * Mỗi 1 giờ vắng mặt chỉ tính 0,5 giờ trong game, tối đa 4 giờ trong game.
   * Không giảm sức khỏe, tình cảm hay buồn vệ sinh khi offline.
   */
  applyOfflineDecay() {
    const now = Date.now();
    const lastCare = this.pet.lastCareTimestamp || now;
    const realHoursAway = Math.max(0, (now - lastCare) / (1000 * 60 * 60));

    if (realHoursAway > 0.05) {
      // Tối đa 4 giờ trong game cho một lần vắng mặt
      const inGameHoursAway = Math.min(4, realHoursAway * 0.5);

      this.pet.hunger = Math.max(MIN_OFFLINE_STAT, this.pet.hunger - (3.5 * inGameHoursAway));
      this.pet.thirst = Math.max(MIN_OFFLINE_STAT, (this.pet.thirst ?? 100) - (5.0 * inGameHoursAway));
      this.pet.clean = Math.max(MIN_OFFLINE_STAT, this.pet.clean - (1.5 * inGameHoursAway));
      this.pet.fun = Math.max(MIN_OFFLINE_STAT, (this.pet.fun ?? 80) - (4.0 * inGameHoursAway));
      // Nghỉ ngơi khi offline: năng lượng hồi phục
      this.pet.energy = Math.min(100, this.pet.energy + (6.0 * inGameHoursAway));
      // Không giảm sức khỏe, tình cảm hay buồn vệ sinh khi offline!
    }

    this.pet.lastCareTimestamp = now;
    this.pet.lastSimulationTimestamp = now;
  }

  /**
   * Chống tăng tình cảm bằng cách lặp thao tác (Mục 4):
   * Trong 5 phút trong game (10 giây thực tế), lặp lại chỉ nhận 50% tình cảm.
   */
  calculateAffectionGain(actionKey, baseGain) {
    const now = Date.now();
    const lastAction = this.actionHistory[actionKey] || 0;
    const cooldownMs = 10 * 1000; // 10 giây thực tế = 5 phút trong game
    let multiplier = 1.0;

    if (now - lastAction < cooldownMs) {
      multiplier = 0.5; // Nhận 50% tình cảm
    }

    this.actionHistory[actionKey] = now;
    return baseGain * multiplier;
  }

  addAffection(amount) {
    this.pet.affection = Math.min(100, Math.max(0, this.pet.affection + amount));
    // Đồng bộ cấp độ affinity (1 - 5) cho UI tương thích
    this.pet.affinity = Math.min(5, Math.max(1, Math.ceil(this.pet.affection / 20)));
  }

  addExp(amount) {
    this.pet.exp = (this.pet.exp || 0) + amount;
    let leveledUp = false;

    while (this.pet.exp >= PET_EXP_PER_LEVEL && this.pet.level < 10) {
      this.pet.exp -= PET_EXP_PER_LEVEL;
      this.pet.level += 1;
      this.addAffection(2);
      leveledUp = true;
    }

    return { leveledUp, currentLevel: this.pet.level, affinity: this.pet.affinity, affection: this.pet.affection };
  }

  /**
   * 1. Cho ăn (Feed): Độ no +40%, Tình cảm +1%
   */
  feed(customAmount) {
    const gain = typeof customAmount === 'number' ? customAmount : 40;
    this.pet.hunger = Math.min(100, this.pet.hunger + gain);
    this.pet.lastCareTimestamp = Date.now();

    const affGain = this.calculateAffectionGain('feed', 1.0);
    this.addAffection(affGain);
    const expRes = this.addExp(5);

    const petName = this.pet.name || 'Bé Cún';
    return {
      action: 'feed',
      success: true,
      message: `${petName} ăn ngon lành, bụng no tròn xoe! 🥕 (+${gain}% No)`,
      stats: { hunger: this.pet.hunger, affection: this.pet.affection },
      ...expRes
    };
  }

  /**
   * 2. Uống nước (Drink / Water): Độ khát +60%, Tình cảm +0.5%
   */
  drink(customAmount) {
    const gain = typeof customAmount === 'number' ? customAmount : 60;
    this.pet.thirst = Math.min(100, (this.pet.thirst ?? 100) + gain);
    this.pet.lastCareTimestamp = Date.now();

    const affGain = this.calculateAffectionGain('drink', 0.5);
    this.addAffection(affGain);
    const expRes = this.addExp(5);

    const petName = this.pet.name || 'Bé Cún';
    return {
      action: 'drink',
      success: true,
      message: `${petName} uống dòng nước suối ngọt mát, đã khát thật đã! 💧 (+${gain}% Nước)`,
      stats: { thirst: this.pet.thirst, affection: this.pet.affection },
      ...expRes
    };
  }

  /**
   * 3. Tắm sạch (Bathe): Sạch sẽ +65%, Tình cảm +1.5%
   */
  bathe(customAmount) {
    const gain = typeof customAmount === 'number' ? customAmount : 65;
    this.pet.clean = Math.min(100, this.pet.clean + gain);
    this.pet.lastCareTimestamp = Date.now();

    if (this.pet.personality === PERSONALITY_TRAITS.THICH_NUOC) {
      this.pet.fun = Math.min(100, (this.pet.fun ?? 80) + 10);
    }

    const affGain = this.calculateAffectionGain('bathe', 1.5);
    this.addAffection(affGain);
    const expRes = this.addExp(5);

    const petName = this.pet.name || 'Bé Cún';
    return {
      action: 'bathe',
      success: true,
      message: `${petName} tắm bọt xà phòng thơm phức, lông óng mượt tinh tươm! 🧼 (+${gain}% Sạch)`,
      stats: { clean: this.pet.clean, affection: this.pet.affection },
      ...expRes
    };
  }

  /**
   * 4. Chải lông (Groom): Sạch sẽ +18%, Tình cảm +1%
   */
  groom() {
    this.pet.clean = Math.min(100, this.pet.clean + 18);
    this.pet.lastCareTimestamp = Date.now();

    const affGain = this.calculateAffectionGain('groom', 1.0);
    this.addAffection(affGain);
    const expRes = this.addExp(3);

    const petName = this.pet.name || 'Bé Cún';
    return {
      action: 'groom',
      success: true,
      message: `Bé dùng lược êm chải lông cho ${petName}, lông bồng bềnh sạch sẽ! ✨ (+18% Sạch)`,
      stats: { clean: this.pet.clean, affection: this.pet.affection },
      ...expRes
    };
  }

  /**
   * 5. Vuốt ve, trò chuyện (Pet / Talk): Vui vẻ +5%, Tình cảm +0.5%
   * Tối đa 3% tình cảm mỗi phút thực tế từ hành động này.
   */
  /**
   * 5b. Chạm / Vuốt ve thú cưng (Pet Touch): Vui vẻ +1% (tối đa 100%)
   */
  petTouch() {
    const now = Date.now();
    const oldFun = typeof this.pet.fun === 'number' ? this.pet.fun : 80;
    this.pet.fun = Math.min(100, oldFun + 1);
    this.pet.lastCareTimestamp = now;
    return {
      success: true,
      action: 'petTouch',
      fun: this.pet.fun,
      gain: this.pet.fun - oldFun
    };
  }

  petHead() {
    const now = Date.now();
    this.pet.fun = Math.min(100, (this.pet.fun ?? 80) + 5);
    this.pet.lastCareTimestamp = now;

    // Giới hạn tốc độ tình cảm vuốt ve (tối đa 3% mỗi 60s)
    this.petHeadMinuteLog = (this.petHeadMinuteLog || []).filter(t => now - t < 60000);
    let affGain = 0;
    if (this.petHeadMinuteLog.length < 6) {
      affGain = 0.5;
      this.petHeadMinuteLog.push(now);
      this.addAffection(affGain);
    }

    const expRes = this.addExp(3);
    const petName = this.pet.name || 'Bé Cún';
    return {
      action: 'petHead',
      success: true,
      message: `Bé âu yếm xoa đầu, ${petName} cọ má vẫy đuôi híp mắt sung sướng! 💖 (+5% Vui)`,
      stats: { fun: this.pet.fun, affection: this.pet.affection },
      ...expRes
    };
  }

  /**
   * 6. Chơi một lượt ngắn (Play): Vui vẻ +18%, Năng lượng -5%, Tình cảm +1%
   */
  play() {
    const petName = this.pet.name || 'Bé Cún';
    if (this.pet.energy < 15) {
      return {
        success: false,
        message: `${petName} hơi mệt rồi, bé để bạn chợp mắt nghỉ một lát nhé! 💤`
      };
    }

    let funBonus = 18;
    if (this.pet.personality === PERSONALITY_TRAITS.NANG_DONG) {
      funBonus += 5; // Bé cún năng động chơi thích hơn
    }

    this.pet.fun = Math.min(100, (this.pet.fun ?? 80) + funBonus);
    this.pet.energy = Math.max(0, this.pet.energy - 5);
    this.pet.lastCareTimestamp = Date.now();

    const affGain = this.calculateAffectionGain('play', 1.0);
    this.addAffection(affGain);
    const expRes = this.addExp(8);

    return {
      action: 'play',
      success: true,
      message: `${petName} nhảy cẫng đá bóng cầu vồng vui hết nấc! 🎈 (+${funBonus}% Vui, -5% Năng lượng)`,
      stats: { fun: this.pet.fun, energy: this.pet.energy, affection: this.pet.affection },
      ...expRes
    };
  }

  /**
   * 7. Đi dạo 3 phút (Walk / Stroll): Vui vẻ +25%, Năng lượng -10%, Sạch sẽ -10%, Buồn vệ sinh về 0%, Tình cảm +2%
   */
  walk() {
    const petName = this.pet.name || 'Bé Cún';
    if (this.pet.energy < 15) {
      return {
        success: false,
        message: `${petName} đang mệt, cần nghỉ ngơi trước khi đi dạo! 💤`
      };
    }

    this.pet.fun = Math.min(100, (this.pet.fun ?? 80) + 25);
    this.pet.energy = Math.max(0, this.pet.energy - 10);
    this.pet.clean = Math.max(0, this.pet.clean - 10);
    this.pet.bladder = 0; // Đi vệ sinh ngoài trời sạch sẽ
    this.pet.lastCareTimestamp = Date.now();

    const affGain = this.calculateAffectionGain('walk', 2.0);
    this.addAffection(affGain);
    const expRes = this.addExp(10);

    return {
      action: 'walk',
      success: true,
      message: `Bé dắt ${petName} đi dạo cỏ xanh êm mát, bạn cún lon ton vui vẻ và nhẹ nhõm! 🐾`,
      stats: { fun: this.pet.fun, energy: this.pet.energy, bladder: this.pet.bladder, affection: this.pet.affection },
      ...expRes
    };
  }

  /**
   * 8. Đi vệ sinh ngoài trời (Potty): Buồn vệ sinh về 0%, Tình cảm +0.5%
   */
  potty() {
    this.pet.bladder = 0;
    this.pet.lastCareTimestamp = Date.now();

    const affGain = this.calculateAffectionGain('potty', 0.5);
    this.addAffection(affGain);
    const expRes = this.addExp(3);

    const petName = this.pet.name || 'Bé Cún';
    return {
      action: 'potty',
      success: true,
      message: `${petName} đi vệ sinh đúng nơi sạch sẽ rồi, ngoan quá đi thôi! 🚽✨`,
      stats: { bladder: this.pet.bladder, affection: this.pet.affection },
      ...expRes
    };
  }

  /**
   * 9. Đi ngủ / Thức dậy (Sleep / Wake): Năng lượng +12% / giờ trong game
   */
  sleep(sleeping = true) {
    this.pet.isSleeping = Boolean(sleeping);
    this.pet.lastCareTimestamp = Date.now();
    const petName = this.pet.name || 'Bé Cún';

    if (this.pet.isSleeping) {
      return {
        action: 'sleep',
        success: true,
        message: `${petName} cuộn tròn trên đệm êm, ngủ một giấc mơ đẹp! 🌙💤`,
        stats: { isSleeping: true }
      };
    } else {
      return {
        action: 'wake',
        success: true,
        message: `${petName} vươn vai thức dậy tràn đầy năng lượng chào bé! ☀️`,
        stats: { isSleeping: false }
      };
    }
  }

  /**
   * 10. Dạy lệnh ngắn (Train): Năng lượng -3%, Vui vẻ +5%, Tình cảm +2%
   */
  train(commandName = 'Ngồi xuống') {
    const petName = this.pet.name || 'Bé Cún';
    if (this.pet.energy < 10) {
      return {
        success: false,
        message: `${petName} mệt rồi, hãy để cún ngủ dậy rồi tập tiếp nhé!`
      };
    }

    this.pet.energy = Math.max(0, this.pet.energy - 3);
    this.pet.fun = Math.min(100, (this.pet.fun ?? 80) + 5);
    this.pet.lastCareTimestamp = Date.now();

    const affGain = this.calculateAffectionGain('train', 2.0);
    this.addAffection(affGain);
    const expRes = this.addExp(8);

    return {
      action: 'train',
      success: true,
      message: `Bé dạy ${petName} lệnh "${commandName}". Cún làm theo răm rắp và được khen thưởng! 🎓⭐`,
      stats: { energy: this.pet.energy, fun: this.pet.fun, affection: this.pet.affection },
      ...expRes
    };
  }

  toggleCompanion() {
    this.pet.isCompanion = !this.pet.isCompanion;
    return this.pet.isCompanion;
  }

  /**
   * Lấy mức Tình cảm theo bảng mục 6:
   * 0–24%: Dè dặt
   * 25–49%: Thân thiện
   * 50–74%: Gắn bó
   * 75–89%: Quấn quýt
   * 90–100%: Tri kỷ
   */
  getAffectionTier() {
    const aff = this.pet.affection ?? 10;
    if (aff >= 90) return AFFECTION_TIERS.DEVOTED;
    if (aff >= 75) return AFFECTION_TIERS.LOYAL;
    if (aff >= 50) return AFFECTION_TIERS.ATTACHED;
    if (aff >= 25) return AFFECTION_TIERS.FRIENDLY;
    return AFFECTION_TIERS.RESERVED;
  }

  /**
   * Đánh giá thứ tự ưu tiên hành vi tự động (Mục 7)
   * Trả về nhu cầu cấp bách nhất cần xử lý
   */
  getPrimaryNeed() {
    if (this.pet.thirst <= 10) return { type: 'thirst', urgent: true, prompt: 'Bé Cún đang rất khát nước! 💧' };
    if (this.pet.bladder >= 85) return { type: 'bladder', urgent: true, prompt: 'Bé Cún đang rất muốn đi vệ sinh! 🚽' };
    if (this.pet.hunger <= 25) return { type: 'hunger', urgent: true, prompt: 'Bé Cún đói bụng rên nhẹ tìm thức ăn! 🥕' };
    if (this.pet.energy <= 20) return { type: 'energy', urgent: true, prompt: 'Bé Cún mệt lả muốn tìm ổ ngủ! 💤' };
    if (this.pet.fun <= 25) return { type: 'fun', urgent: true, prompt: 'Bé Cún buồn chán mang đồ chơi tới! 🎈' };

    // Ngưỡng báo hiệu vừa
    if (this.pet.thirst <= 60) return { type: 'thirst', urgent: false, prompt: 'Bé Cún liếm mép tìm bát nước 💧' };
    if (this.pet.bladder >= 65) return { type: 'bladder', urgent: false, prompt: 'Bé Cún ngửi sàn tìm cửa đi dạo 🚽' };
    if (this.pet.hunger <= 60) return { type: 'hunger', urgent: false, prompt: 'Bé Cún ngồi chờ cạnh bát ăn 🥕' };
    if (this.pet.clean <= 45) return { type: 'clean', urgent: false, prompt: 'Lông cún có vết bẩn cần tắm sạch 🧼' };
    if (this.pet.fun <= 55) return { type: 'fun', urgent: false, prompt: 'Bé Cún muốn được chơi cùng bé 🎈' };
    if (this.pet.energy <= 45) return { type: 'energy', urgent: false, prompt: 'Bé Cún ngáp dài, hơi buồn ngủ 💤' };

    return { type: 'happy', urgent: false, prompt: 'Bé Cún đang rất vui vẻ và khỏe mạnh! 💖' };
  }
}
