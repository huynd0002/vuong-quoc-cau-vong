import * as Phaser from 'phaser';
import { createGroundShadow } from '../effects/GroundShadow.js';
import { isPointInLake, clampOutOfLake } from '../effects/LakeWaterEffect.js';
import { saveAdapter } from '../../services/save/saveAdapter.js';

/**
 * Pet Entity: Bé Cún Vàng (Bạn đồng hành trung thành)
 * Hỗ trợ bạn đồng hành di chuyển 8 hướng mượt mà,
 * đầy đủ 4 bộ hành động biểu cảm: Đi bộ (8 hướng), Buồn bã chán ăn, Ở dơ lấm lem, Vui vẻ nhảy cẫng.
 * Tích hợp AI dạo chơi tự động trên Nông Trại Nuôi Thú (Pet Farm).
 */

export const PET_ANIM_STATES = {
  WALK: 'walk',
  IDLE: 'idle',
  SAD: 'sad',
  DIRTY: 'dirty',
  HAPPY: 'happy',
  SLEEP: 'sleep',
  DRINK: 'drink',
  POTTY: 'potty',
  BATHE: 'bathe',
  EAT: 'eat'
};

export class Pet {
  constructor(scene, targetHero, options = {}) {
    this.scene = scene;
    this.hero = targetHero;
    
    // Tùy chọn cấu hình
    const cfg = typeof options === 'string' ? { textureKey: options } : (options || {});
    this.type = cfg.type || (cfg.textureKey?.includes('dog') ? 'dog' : 'dog'); // Mặc định là Bé Cún
    this.size = cfg.size || 96; // Kích thước hiển thị vừa vặn, rõ nét cho bé
    this.visible = cfg.visible ?? true;
    this.mode = cfg.mode || 'follow'; // 'follow' | 'farm_roam' | 'idle'
    
    // Tọa độ khởi tạo
    const heroX = targetHero ? targetHero.getX() : 640;
    const heroY = targetHero ? targetHero.getY() : 360;
    this.x = cfg.x ?? (heroX - 88);
    this.y = cfg.y ?? (heroY + 25);

    this.currentAnimState = null;
    this.facing = 'right';
    this.isMoving = false;
    this.lockedAnimUntil = 0;

    // 1. Khởi tạo Animation nếu chưa có
    Pet.initAnimations(scene);

    // 2. Bóng đổ mềm mại chân thực dưới chân cún (Soft Ambient Occlusion)
    this.shadow = createGroundShadow(scene, this.x, this.y + 36, 64, 20, 0.68);
    this.shadow.setDepth(Math.max(1, Math.floor(this.y + 8)));

    // 3. Khởi tạo Sprite
    const hasDogWalk = scene.textures.exists('pet_dog_walk_sheet');
    if (this.type === 'dog' && hasDogWalk) {
      this.sprite = scene.add.sprite(this.x, this.y, 'pet_dog_walk_sheet', 0);
      this.sprite.setDisplaySize(this.size, this.size);
      this.sprite.setOrigin(0.5, 0.5);
      this.playIdle();
    } else if (scene.textures.exists('pet_bunny_idle')) {
      this.sprite = scene.add.image(this.x, this.y, 'pet_bunny_idle').setDisplaySize(this.size, this.size);
      this.sprite.setOrigin(0.5, 0.5);
    } else {
      this.sprite = scene.add.text(this.x, this.y, '🐶', { fontSize: '48px' }).setOrigin(0.5);
    }
    this.sprite.setDepth(4);

    // Cho phép click vào cún để tương tác cọ má / thả tim
    // Thiết lập vùng chạm cảm ứng thân thiện (Hit Area) ôm sát chuẩn xác theo tâm thân Bé Cún:
    // Texture frame 256x256, thân cún thực tế nằm ở tâm (cx=127.5, cy=152).
    // Dùng hình tròn bán kính 95px căn đúng tâm thân cún, không bị lệch lên khoảng trống trên đầu.
    if (this.type === 'dog') {
      this.sprite.setInteractive(
        new Phaser.Geom.Circle(128, 152, 95),
        Phaser.Geom.Circle.Contains,
        { useHandCursor: true }
      );
    } else {
      this.sprite.setInteractive({ useHandCursor: true });
    }
    this.sprite.on('pointerdown', (pointer) => {
      this.handlePetClick(pointer);
    });
    this.sprite.on('pointermove', (pointer) => {
      if (pointer?.isDown) {
        this.handlePetClick(pointer);
      }
    });

    // 4. Biến hỗ trợ Roam trên Nông Trại
    this.farmStations = [];
    this.currentRoamTarget = null;
    this.nextRoamDecisionTime = Date.now() + 2000;
    this.roamSpeed = 65; // Tốc độ thong dong đáng yêu
    this.isSleepingOnBed = false;
    this.isForcedSleeping = false;
    this.isBusyWithStation = false;
    this.lastSleepZTime = 0;
    this.lastSleepyEmoteTime = 0;

    // Biến hỗ trợ chơi đùa và rượt đuổi bóng
    this.isChasingBall = false;
    this.chaseBallTarget = null;
    this.chaseTimeout = 0;
    this.chaseOnCatch = null;
    this.chaseSpeed = 120;
    this.lastChaseEmoteTime = 0;

    // Biến hỗ trợ Đi theo Nhân vật (Follow Hero) với khoảng cách ngẫu nhiên sinh động:
    this.followBaseDist = 138; // Khoảng cách cơ sở tăng lên (trước đây là 68px)
    this.followTargetDist = 138; // Khoảng cách ngẫu nhiên mục tiêu (118px - 176px)
    this.followCurrentDist = 138; // Khoảng cách hiện tại nội suy mượt mà
    this.followAngleOffset = 0; // Góc lệch cánh cung ngẫu nhiên (-30° đến +30°)
    this.nextFollowDistanceRerollTime = 0; // Thời điểm re-roll khoảng cách tiếp theo
    this.wasHeroMoving = false;

    this.setVisible(this.visible);
  }

  static initAnimations(scene) {
    if (!scene.anims) return;

    // 1. Hoạt ảnh Đi bộ Bé Cún (8 frames nhịp nhàng)
    if (!scene.anims.exists('pet_dog_walk') && scene.textures.exists('pet_dog_walk_sheet')) {
      scene.anims.create({
        key: 'pet_dog_walk',
        frames: scene.anims.generateFrameNumbers('pet_dog_walk_sheet', { start: 0, end: 7 }),
        frameRate: 9,
        repeat: -1
      });
    }

    // 2. Hoạt ảnh Buồn bã chán ăn / Đói bụng (6 frames tai cụp, ôm bụng, thở dài)
    if (!scene.anims.exists('pet_dog_sad') && scene.textures.exists('pet_dog_sad_sheet')) {
      scene.anims.create({
        key: 'pet_dog_sad',
        frames: scene.anims.generateFrameNumbers('pet_dog_sad_sheet', { start: 0, end: 5 }),
        frameRate: 4,
        repeat: -1
      });
    }

    // 3. Hoạt ảnh Ở dơ lấm lem bùn đất (6 frames gãi tai, rũ lông xù)
    if (!scene.anims.exists('pet_dog_dirty') && scene.textures.exists('pet_dog_dirty_sheet')) {
      scene.anims.create({
        key: 'pet_dog_dirty',
        frames: scene.anims.generateFrameNumbers('pet_dog_dirty_sheet', { start: 0, end: 5 }),
        frameRate: 4,
        repeat: -1
      });
    }

    // 4. Hoạt ảnh Vui vẻ mừng rỡ (6 frames nhảy cẫng, vẫy đuôi, tung sao & tim)
    if (!scene.anims.exists('pet_dog_happy') && scene.textures.exists('pet_dog_happy_sheet')) {
      scene.anims.create({
        key: 'pet_dog_happy',
        frames: scene.anims.generateFrameNumbers('pet_dog_happy_sheet', { start: 0, end: 5 }),
        frameRate: 7,
        repeat: -1
      });
    }

    // 5. Hoạt ảnh Ngủ cuộn tròn (4 frames thở nhẹ nhàng, bong bóng ngủ)
    if (!scene.anims.exists('pet_dog_sleep') && scene.textures.exists('pet_dog_sleep_sheet')) {
      scene.anims.create({
        key: 'pet_dog_sleep',
        frames: scene.anims.generateFrameNumbers('pet_dog_sleep_sheet', { start: 0, end: 3 }),
        frameRate: 3,
        repeat: -1
      });
    }

    // 6. Hoạt ảnh Uống nước suối mát (4 frames cúi đầu uống nước, liếm mép)
    if (!scene.anims.exists('pet_dog_drink') && scene.textures.exists('pet_dog_drink_sheet')) {
      scene.anims.create({
        key: 'pet_dog_drink',
        frames: scene.anims.generateFrameNumbers('pet_dog_drink_sheet', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
      });
    }

    // 7. Hoạt ảnh Đi vệ sinh ngoài trời & ngửi sàn (4 frames)
    if (!scene.anims.exists('pet_dog_potty') && scene.textures.exists('pet_dog_potty_sheet')) {
      scene.anims.create({
        key: 'pet_dog_potty',
        frames: scene.anims.generateFrameNumbers('pet_dog_potty_sheet', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1
      });
    }

       // 8. Hoạt ảnh Tắm bồn bọt xà phòng & nghịch vịt vàng (4 frames chuyên biệt)
    if (!scene.anims.exists('pet_dog_bath') && scene.textures.exists('pet_dog_bath_sheet')) {
      scene.anims.create({
        key: 'pet_dog_bath',
        frames: scene.anims.generateFrameNumbers('pet_dog_bath_sheet', { start: 0, end: 3 }),
        frameRate: 3.5,
        repeat: -1
      });
    }

    // 9. Hoạt ảnh Đang ăn ngon lành (4 frames cúi người gặm ăn, nhai nhóp nhép, má phúng phính)
    if (!scene.anims.exists('pet_dog_eat') && scene.textures.exists('pet_dog_eat_sheet')) {
      scene.anims.create({
        key: 'pet_dog_eat',
        frames: scene.anims.generateFrameNumbers('pet_dog_eat_sheet', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
      });
    }
  }

  /**
   * Bộ lọc Schmitt-Trigger Hysteresis chống lật mặt qua lại liên tục (Triệt tiêu rung lắc hình)
   * - Đang quay sang phải (!flipX): Chỉ đổi sang trái nếu targetDx < -threshold
   * - Đang quay sang trái (flipX): Chỉ đổi sang phải nếu targetDx > +threshold
   * - Vùng đệm [-threshold, +threshold] (bao gồm di chuyển thẳng đứng): Tuyệt đối giữ nguyên hướng nhìn
   */
  updateFacingDirection(targetDx, threshold = 22, cooldownMs = 400) {
    const now = Date.now();
    if (!this.lastFlipTime) this.lastFlipTime = 0;
    if (now - this.lastFlipTime < cooldownMs) return;

    const isFlipped = Boolean(this.sprite.flipX);
    if (!isFlipped && targetDx < -threshold) {
      this.sprite.setFlipX(true);
      this.facing = 'left';
      this.lastFlipTime = now;
    } else if (isFlipped && targetDx > threshold) {
      this.sprite.setFlipX(false);
      this.facing = 'right';
      this.lastFlipTime = now;
    }
  }

  /**
   * Tính toán hướng di chuyển 8 hướng từ vector (dx, dy)
   * Trả về: direction, flipX, tilt
   */
  getDirection8(dx, dy) {
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;

    let dir = 'east';
    let flipX = false;
    let tilt = 0;

    // Phân tách 8 góc quạt 45 độ:
    // East: [-22.5, 22.5]
    // South-East: [22.5, 67.5]
    // South: [67.5, 112.5]
    // South-West: [112.5, 157.5]
    // West: [157.5, 180] or [-180, -157.5]
    // North-West: [-157.5, -112.5]
    // North: [-112.5, -67.5]
    // North-East: [-67.5, -22.5]

    if (angleDeg >= -22.5 && angleDeg < 22.5) {
      dir = 'east';
      flipX = false;
      tilt = 0;
    } else if (angleDeg >= 22.5 && angleDeg < 67.5) {
      dir = 'south-east';
      flipX = false;
      tilt = 5;
    } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
      dir = 'south';
      flipX = false;
      tilt = 0;
    } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
      dir = 'south-west';
      flipX = true;
      tilt = -5;
    } else if (angleDeg >= 157.5 || angleDeg < -157.5) {
      dir = 'west';
      flipX = true;
      tilt = 0;
    } else if (angleDeg >= -157.5 && angleDeg < -112.5) {
      dir = 'north-west';
      flipX = true;
      tilt = 5;
    } else if (angleDeg >= -112.5 && angleDeg < -67.5) {
      dir = 'north';
      flipX = false;
      tilt = 0;
    } else if (angleDeg >= -67.5 && angleDeg < -22.5) {
      dir = 'north-east';
      flipX = false;
      tilt = -5;
    }

    return { dir, flipX, tilt, angleDeg };
  }

  update(time, delta = 16, petStats = {}) {
    if (!this.visible || !this.sprite?.active) return;

    // A station owns its complete pose, including the animation and transform.
    // Roaming, sleep, idle and old celebration tweens cannot move or squash it.
    if (this.stationPose) {
      this.applyStationPose();
      return;
    }

    const anchorY = typeof this.baseIdleY === 'number' ? this.baseIdleY : this.sprite.y;

    // Giữ bóng đổ theo sát cún cố định trên mặt đất (không bị giật khi cún nhấp nhô)
    if (this.shadow?.active) {
      this.shadow.x = this.sprite.x;
      this.shadow.y = anchorY + 36;
      this.shadow.setDepth(Math.max(1, Math.floor(anchorY + 9)));
    }
    this.sprite.setDepth(Math.floor(anchorY + 10));

    // Nếu đang bị khóa animation (ví dụ đang ăn mừng, đang ăn)
    if (Date.now() < this.lockedAnimUntil) {
      return;
    }

    if (this.isBusyWithStation) {
      return;
    }

    if (this.mode === 'farm_roam') {
      this.updateFarmRoam(delta, petStats);
    } else if (this.mode === 'follow' && this.hero) {
      this.updateFollowHero(delta, petStats);
    }
  }

  /**
   * Re-roll khoảng cách và góc lệch ngẫu nhiên khi đi theo Bé Sâu
   * Tạo cảm giác cún đi theo tự nhiên, thỉnh thoảng đi chếch hông, đi sau xa hơn một chút
   * @param {boolean} force - Bắt buộc re-roll ngay
   */
  rerollFollowTarget(force = false) {
    const now = Date.now();
    if (!force && now < this.nextFollowDistanceRerollTime) return;

    // Khoảng cách theo sau ngẫu nhiên trong dải 118px - 176px (tăng đáng kể so với 68px cũ)
    const minDist = 118;
    const maxDist = 176;
    this.followTargetDist = Math.floor(minDist + Math.random() * (maxDist - minDist));

    // Góc lệch ngẫu nhiên: -0.52 rad đến +0.52 rad (~ -30° đến +30°) giúp cún đi chếch sang hông trái/phải
    this.followAngleOffset = (Math.random() - 0.5) * 1.05;

    // Chu kỳ ngẫu nhiên: 2.8s đến 4.8s mỗi lần đổi khoảng cách/vị trí
    this.nextFollowDistanceRerollTime = now + Math.floor(2800 + Math.random() * 2000);
  }

  /**
   * Bám đuổi Bé Sâu theo 8 hướng mượt mà, giữ khoảng cách NGẪU NHIÊN và TĂNG RỘNG (118px - 176px),
   * triệt tiêu hoàn toàn hiện tượng rung lắc/lật hình, KHÔNG BAO GIỜ TỰ NHIÊN NGỦ khi đi theo.
   */
  updateFollowHero(delta, petStats = {}) {
    const heroX = this.hero.getX();
    const heroY = this.hero.getY() + 15; // Điểm neo tự nhiên gần chân Bé Sâu
    const anchorY = typeof this.baseIdleY === 'number' ? this.baseIdleY : this.sprite.y;

    const dxToHero = heroX - this.sprite.x;
    const dyToHero = heroY - anchorY;
    const distToHero = Math.hypot(dxToHero, dyToHero);
    const isHeroMoving = Boolean(this.hero.isMoving);

    // Re-roll khoảng cách ngẫu nhiên khi nhân vật bắt đầu bước đi hoặc hết chu kỳ
    if (isHeroMoving && !this.wasHeroMoving) {
      this.rerollFollowTarget(true);
    } else {
      this.rerollFollowTarget(false);
    }
    this.wasHeroMoving = isHeroMoving;

    // Nội suy mượt mà (smooth lerp) khoảng cách follow hiện tại tới khoảng cách mục tiêu
    const lerpRate = Math.min(1, 2.2 * (delta / 1000));
    this.followCurrentDist += (this.followTargetDist - this.followCurrentDist) * lerpRate;

    // 1. Cơ chế Nhường đường tự động & Giữ khoảng cách rộng rãi (Anti-crowding & Spacing):
    // Tăng khoảng cách an toàn tối thiểu lên 105px (trước đây là 55px),
    // cún luôn chủ động lùi lại hoặc né sang bên nếu Bé Sâu tiến lại quá gần để giữ khoảng cách thoáng đãng.
    const minSafeDist = 105;
    if (distToHero < minSafeDist && distToHero > 0.5) {
      const pushDist = (minSafeDist - distToHero);
      const pushStep = Math.min(pushDist, (isHeroMoving ? 130 : 90) * (delta / 1000));
      this.sprite.x -= (dxToHero / distToHero) * pushStep;
      this.sprite.y -= (dyToHero / distToHero) * pushStep;
      if (typeof this.baseIdleY === 'number') {
        this.baseIdleY = this.sprite.y;
      }
    }

    // 2. Khoảng cách theo sau ngẫu nhiên và Deadband chống giật rung (Hysteresis):
    // startFollowDist: khoảng cách ngẫu nhiên + 38px
    // stopFollowDist: khoảng cách ngẫu nhiên
    const targetDist = this.followCurrentDist;
    const startFollowDist = isHeroMoving ? (targetDist + 28) : (targetDist + 42);
    const stopFollowDist = Math.max(minSafeDist + 12, targetDist);
    const shouldMove = this.isMoving ? (distToHero > stopFollowDist) : (distToHero > startFollowDist);

    if (shouldMove && distToHero > 1) {
      this.isMoving = true;
      this.stopHop(); // Dừng ngay idle hop khi di chuyển

      // Điểm mục tiêu: Giữ khoảng cách ngẫu nhiên và góc lệch ngẫu nhiên sang bên hông
      const baseAngle = Math.atan2(this.sprite.y - heroY, this.sprite.x - heroX);
      const finalAngle = baseAngle + this.followAngleOffset * 0.4;
      const targetX = heroX + Math.cos(finalAngle) * targetDist;
      const targetY = heroY + Math.sin(finalAngle) * targetDist;

      const dx = targetX - this.sprite.x;
      const dy = targetY - this.sprite.y;
      const moveDist = Math.hypot(dx, dy);

      const heroSpeed = this.hero?.speed || 165;
      // Tốc độ điều chỉnh tự nhiên: nếu bị tụt lại quá xa (> 230px), chạy nhanh hơn để bắt kịp
      let targetSpeed;
      if (distToHero > 230) {
        targetSpeed = heroSpeed * 1.35;
      } else if (isHeroMoving) {
        targetSpeed = Math.max(heroSpeed * 0.95, Math.min(distToHero * 2.2, heroSpeed * 1.25));
      } else {
        targetSpeed = Math.min(moveDist * 3.2, heroSpeed);
      }
      const speed = targetSpeed * (delta / 1000);
      const step = Math.min(moveDist, speed);

      if (moveDist > 0.5) {
        let nextX = this.sprite.x + (dx / moveDist) * step;
        let nextY = this.sprite.y + (dy / moveDist) * step;

        // Cấm thú cưng đi vào khu vực hồ ở Map 1
        const isMap1 = this.scene?.currentMapId === 'map1' || !this.scene?.currentMapId;
        if (isMap1 && isPointInLake(nextX, nextY + 32)) {
          const safe = clampOutOfLake(nextX, nextY + 32, 14);
          nextX = safe.x;
          nextY = safe.y - 32;
        }

        this.sprite.x = nextX;
        this.sprite.y = nextY;
      }

      // Hysteresis chống lật mặt qua lại liên tục:
      this.updateFacingDirection(dxToHero, 18, 300);
      this.sprite.setAngle(0);

      const dir8 = this.getDirection8(dx, dy);
      this.facing = dir8.dir;

      this.playWalk();
    } else {
      // Đã đến khoảng cách vừa vặn lý tưởng, dừng lại êm ái, giữ nguyên góc nhìn
      if (this.isMoving) {
        this.isMoving = false;
        this.sprite.setAngle(0);
      }

      // Khi đứng một chỗ: chỉ lật mặt nếu Bé Sâu bước hẳn sang bên đối diện (> 35px)
      this.updateFacingDirection(dxToHero, 35, 450);

      // QUAN TRỌNG: Áp dụng hoạt ảnh theo trạng thái (nhưng CÚN KHÔNG TỰ NHIÊN NGỦ khi đi theo)
      this.applyStateBasedAnimation(petStats);
    }
  }

  /**
   * AI tự do dạo chơi trên Nông Trại Nuôi Thú (Pet Farm)
   * Tự đi thăm máng ăn, máng nước, chuồng thú, bãi cỏ bằng 8 hướng mượt mà không lật mặt rung giật
   */
  updateFarmRoam(delta, petStats = {}) {
    // 1. Nếu đang bận di chuyển tới trạm chức năng hoặc thực hiện hành động trạm, AI tự do không được can thiệp
    if (this.isBusyWithStation) {
      return;
    }

    const now = Date.now();
    const anchorY = typeof this.baseIdleY === 'number' ? this.baseIdleY : this.sprite.y;

    const energy = petStats?.energy ?? 100;
    const isSleeping = Boolean(petStats?.isSleeping);
    const isSleepy = isSleeping || energy <= 35;

    // Tìm trạm đệm nằm ngủ (shelter / bed)
    const bedStation = Array.isArray(this.farmStations)
      ? this.farmStations.find(st => st.type === 'shelter' || st.type === 'bed')
      : null;
    const bedX = bedStation ? bedStation.x : 578;
    const bedY = bedStation ? bedStation.y : 360;
    const bedSleepY = bedY - 32;
    const distToBed = Math.hypot(bedX - this.sprite.x, bedSleepY - anchorY);

    // TRƯỜNG HỢP ƯU TIÊN CAO NHẤT: ĐANG ĐUỔI THEO BÓNG
    if (this.isChasingBall && this.chaseBallTarget) {
      const now = Date.now();
      if (now > this.chaseTimeout) {
        this.stopChaseBall(true);
        return;
      }

      const ballX = this.chaseBallTarget.x;
      const ballY = this.chaseBallTarget.y;
      const dx = ballX - this.sprite.x;
      const dy = ballY - anchorY;
      const dist = Math.hypot(dx, dy);

      if (dist < 52) {
        // Bắt kịp quả bóng!
        const cb = this.chaseOnCatch;
        this.stopChaseBall(false);
        this.celebrate(1800);
        this.spawnEmote('⭐');
        if (cb) cb();
        return;
      }

      // Tiếp tục chạy rượt theo bóng
      const moveDist = (delta / 1000) * this.chaseSpeed;
      const step = Math.min(dist, moveDist);
      this.sprite.x += (dx / dist) * step;
      this.sprite.y += (dy / dist) * step;
      if (this.shadow) {
        this.shadow.setPosition(this.sprite.x, this.sprite.y + (this.type === 'dog' ? 36 : 18));
      }

      if (dx < -4) {
        this.sprite.setFlipX(true);
        this.facing = 'left';
      } else if (dx > 4) {
        this.sprite.setFlipX(false);
        this.facing = 'right';
      }

      this.isMoving = true;
      this.playWalk();

      if (now - this.lastChaseEmoteTime > 1600) {
        this.lastChaseEmoteTime = now;
        const emotes = ['🐾', '💖', '🐶', '⚡'];
        this.spawnEmote(emotes[Math.floor(Math.random() * emotes.length)]);
      }
      return;
    }

    // TRƯỜNG HỢP 0: THÚ CƯNG BỊ ÉP ĐI NGỦ ("Cho cún đi ngủ nhé")
    if (this.isForcedSleeping) {
      if (this.isSleepingOnBed) {
        this.isMoving = false;
        this.stopHop();
        this.sprite.x = bedX;
        this.sprite.y = bedSleepY;
        this.sprite.setAngle(0);
        this.facing = 'right';
        this.sprite.setFlipX(false);
        this.playSleep();
        if (this.shadow) this.shadow.setVisible(false);

        if (this.scene?.petBedSleepEffect) {
          this.scene.petBedSleepEffect.setPetSleeping(true);
        }

        return;
      }
      return;
    }

    // TRƯỜNG HỢP 1: THÚ CƯNG ĐANG BUỒN NGỦ (isSleepy) -> TỰ ĐẾN CHỖ ĐỆM NẰM NGỦ
    if (isSleepy) {
      if (distToBed <= 22) {
        // Đã đến đúng chỗ nằm: Nằm cuộn tròn ngủ ngoan trên đệm ấm
        this.isMoving = false;
        this.stopHop();
        this.sprite.x = bedX;
        this.sprite.y = bedSleepY;
        this.sprite.setAngle(0);
        this.facing = 'right';
        this.isSleepingOnBed = true;
        if (this.shadow) this.shadow.setVisible(false);

        this.playSleep();
        if (this.scene?.petBedSleepEffect) {
          this.scene.petBedSleepEffect.setPetSleeping(true);
        }

        this.currentRoamTarget = null;
        return;
      } else {
        // Chưa tới đệm nằm: Đi trực tiếp về chỗ đệm nằm với dáng đi buồn ngủ đáng yêu
        this.isSleepingOnBed = false;
        if (this.shadow) this.shadow.setVisible(true);
        const dx = bedX - this.sprite.x;
        const dy = bedSleepY - anchorY;
        const dist = Math.hypot(dx, dy);

        if (dist > 18) {
          this.isMoving = true;
          this.stopHop();
          // Bước đi buồn ngủ chậm rãi, dễ thương (50 px/s)
          const sleepySpeed = this.roamSpeed * 0.8;
          const speed = Math.min(dist, sleepySpeed * (delta / 1000));
          this.sprite.x += (dx / dist) * speed;
          this.sprite.y += (dy / dist) * speed;

          this.updateFacingDirection(dx, 20, 350);
          this.sprite.setAngle(0);

          const dir8 = this.getDirection8(dx, dy);
          this.facing = dir8.dir;
          this.playWalk();

          return;
        }
      }
    }

    // TRƯỜNG HỢP 2: THÚ CƯNG ĐÃ TỈNH TÁO (Không còn buồn ngủ)
    if (this.isSleepingOnBed && !isSleepy) {
      // Vừa thức dậy: Vươn vai nhảy ăn mừng vui sướng chào ngày mới!
      this.isSleepingOnBed = false;
      if (this.shadow) this.shadow.setVisible(true);
      if (this.scene?.petBedSleepEffect) {
        this.scene.petBedSleepEffect.setPetSleeping(false);
      }
      this.celebrate?.();
      this.spawnEmote('✨');
      this.nextRoamDecisionTime = now + 3500;
      return;
    }

    // TRƯỜNG HỢP 3: THÚ CƯNG ĐANG BUỒN VỆ SINH (isPotty: bladder >= 85) -> PHẢI ĐI ĐẾN BỒN CẦU MỚI BẮT ĐẦU VỆ SINH!
    const bladder = petStats?.bladder ?? 0;
    const isPotty = bladder >= 85;

    // Tìm trạm bồn cầu thú cưng (potty / toilet)
    const pottyStation = Array.isArray(this.farmStations)
      ? this.farmStations.find(st => st.type === 'potty' || st.type === 'toilet')
      : null;
    const targetPottyX = 1005;
    const targetPottyY = 395;
    const distToPotty = pottyStation
      ? Math.hypot(targetPottyX - this.sprite.x, targetPottyY - anchorY)
      : 999;

    if (isPotty && !isSleepy && pottyStation) {
      if (this.scene?.handlePetStationInteraction && !this.isBusyWithStation) {
        this.scene.handlePetStationInteraction(pottyStation);
        return;
      }

      if (distToPotty <= 25) {
        // Đã đến đúng bồn cầu: Dừng lại, quay mặt sang phải hướng về bồn cầu và thực hiện hành động vệ sinh
        this.isMoving = false;
        this.stopHop();
        this.sprite.x = targetPottyX;
        this.sprite.y = targetPottyY;
        this.sprite.setAngle(0);
        this.sprite.setFlipX(false);
        this.facing = 'right';

        this.playPotty(true);
        this.currentRoamTarget = null;
        if (petStats) petStats.bladder = 0;
        return;
      } else {
        // Chưa tới bồn cầu: Đi trực tiếp về phía bồn cầu, CHƯA ĐƯỢC ĐI VỆ SINH BỪA BÃI!
        const dx = targetPottyX - this.sprite.x;
        const dy = targetPottyY - anchorY;
        const dist = Math.hypot(dx, dy);

        if (dist > 18) {
          this.isMoving = true;
          this.stopHop();
          const pottySpeed = this.roamSpeed * 1.1; // Bước nhanh vì đang buồn vệ sinh
          const speed = Math.min(dist, pottySpeed * (delta / 1000));
          this.sprite.x += (dx / dist) * speed;
          this.sprite.y += (dy / dist) * speed;

          this.updateFacingDirection(dx, 20, 350);
          this.sprite.setAngle(0);

          const dir8 = this.getDirection8(dx, dy);
          this.facing = dir8.dir;
          this.playWalk();

          if (now - (this.lastPottyEmoteTime || 0) > 2200) {
            this.lastPottyEmoteTime = now;
            this.spawnEmote('🚽');
          }

          return;
        }
      }
    }

    // 1. Nếu Bé Sâu ở rất gần, cún tạm dừng lại âu yếm hướng về Bé Sâu (với hysteresis chống chập chờn)
    if (this.hero) {
      const heroDist = Math.hypot(this.hero.getX() - this.sprite.x, (this.hero.getY() + 15) - anchorY);
      const isGreeting = this.isGreetingHero || false;
      const greetThreshold = isGreeting ? 80 : 48; // Vào vùng chào: < 48px, Ra khỏi vùng chào: > 80px
      if (heroDist < greetThreshold) {
        this.isGreetingHero = true;
        this.isMoving = false;
        this.stopHop();
        const dx = this.hero.getX() - this.sprite.x;
        this.updateFacingDirection(dx, 35, 500);
        this.sprite.setAngle(0);
        this.applyStateBasedAnimation(petStats);
        return;
      }
      this.isGreetingHero = false;
    }

    // 2. Nếu đã đến giờ quyết định mục tiêu mới
    if (!this.currentRoamTarget || now >= this.nextRoamDecisionTime) {
      this.pickNewRoamTarget(isSleepy, isPotty);
    }

    // 3. Di chuyển về phía mục tiêu
    if (this.currentRoamTarget) {
      const dx = this.currentRoamTarget.x - this.sprite.x;
      const dy = this.currentRoamTarget.y - this.sprite.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 25) {
        this.isMoving = true;
        this.stopHop();
        const speed = Math.min(dist, this.roamSpeed * (delta / 1000));
        this.sprite.x += (dx / dist) * speed;
        this.sprite.y += (dy / dist) * speed;

        this.updateFacingDirection(dx, 20, 350);
        this.sprite.setAngle(0);

        const dir8 = this.getDirection8(dx, dy);
        this.facing = dir8.dir;

        this.playWalk();
      } else {
        // Đã đến trạm / điểm đến: dừng lại thư giãn và biểu diễn hành động
        this.isMoving = false;
        this.sprite.setAngle(0);

        const stationType = this.currentRoamTarget.stationType;
        if (stationType === 'feed') {
          this.playHappy();
          this.spawnEmote('🥕');
          if (petStats) petStats.hunger = Math.min(100, (petStats.hunger || 0) + 3);
        } else if (stationType === 'water' || stationType === 'bath') {
          const station = this.farmStations.find(s => s.type === stationType);
          if (station && this.scene.handlePetStationInteraction) {
            this.scene.handlePetStationInteraction(station);
          }
          return;
        } else if (stationType === 'shelter' || stationType === 'bed') {
          this.playSleep();
          this.spawnEmote('💤');
        } else if (stationType === 'play') {
          this.playHappy();
          this.spawnEmote('⚽');
        } else if (stationType === 'potty' || stationType === 'toilet') {
          const pottySt = this.farmStations?.find(s => s.type === 'potty' || s.type === 'toilet');
          if (this.scene?.handlePetStationInteraction && pottySt) {
            this.scene.handlePetStationInteraction(pottySt);
          } else {
            this.playPotty(true);
            this.spawnEmote('🌸');
          }
        } else {
          this.applyStateBasedAnimation(petStats);
        }

        this.currentRoamTarget = null;
        // Dừng nhẹ 1.2 - 1.8s ngắm cảnh rồi tung tăng bước đi tiếp, không dừng khựng lâu
        this.nextRoamDecisionTime = now + 1200 + Math.random() * 600;
      }
    }
  }

  pickNewRoamTarget(isSleepy = false, isPotty = false) {
    const now = Date.now();
    this.nextRoamDecisionTime = now + 6000 + Math.random() * 2500;
    if (Array.isArray(this.farmStations) && this.farmStations.length > 0) {
      if (isSleepy) {
        const bedSt = this.farmStations.find(st => st.type === 'shelter' || st.type === 'bed');
        if (bedSt) {
          this.currentRoamTarget = {
            x: bedSt.x,
            y: bedSt.y,
            stationType: 'shelter'
          };
          return;
        }
      }

      if (isPotty) {
        const pottySt = this.farmStations.find(st => st.type === 'potty' || st.type === 'toilet');
        if (pottySt) {
          this.currentRoamTarget = {
            x: 1005,
            y: 395,
            stationType: 'potty'
          };
          return;
        }
      }

      // Tỷ lệ cực thấp (~6%) cún mới tự ghé trạm ăn hoặc uống
      if (Math.random() < 0.06) {
        const leisureStations = this.farmStations.filter(s => s.type === 'feed' || s.type === 'water');
        if (leisureStations.length > 0) {
          const randSt = leisureStations[Math.floor(Math.random() * leisureStations.length)];
          this.currentRoamTarget = {
            x: randSt.interactionPoint?.x ?? (randSt.type === 'feed' ? 280 : randSt.x),
            y: randSt.interactionPoint?.y ?? (randSt.type === 'feed' ? 385 : randSt.y),
            stationType: randSt.type
          };
          return;
        }
      }
    }

    // Lộ trình tuần hoàn quanh bãi cỏ thoáng mát giúp cún tung tăng đi vòng vòng mượt mà
    const meadowCircuit = [
      { x: 380, y: 460 },
      { x: 550, y: 530 },
      { x: 780, y: 490 },
      { x: 860, y: 410 },
      { x: 650, y: 390 }
    ];
    if (typeof this.meadowWaypointIdx !== 'number') this.meadowWaypointIdx = 0;
    this.meadowWaypointIdx = (this.meadowWaypointIdx + 1) % meadowCircuit.length;
    const pt = meadowCircuit[this.meadowWaypointIdx];
    this.currentRoamTarget = {
      x: pt.x + (Math.random() * 40 - 20),
      y: pt.y + (Math.random() * 30 - 15),
      stationType: 'meadow'
    };
  }

  setFarmStations(stations) {
    this.farmStations = stations || [];
  }

  noticeBall(ball) {
    if (this.isSleepingOnBed || this.isForcedSleeping) return;
    if (this.stationTween) {
      this.stationTween.stop();
      this.stationTween = null;
    }
    this.currentRoamTarget = null;
    this.isMoving = false;
    this.stopHop();
    const dx = ball.x - this.sprite.x;
    if (dx < -5) {
      this.sprite.setFlipX(true);
      this.facing = 'left';
    } else if (dx > 5) {
      this.sprite.setFlipX(false);
      this.facing = 'right';
    }
    this.spawnEmote('👀');
  }

  startChaseBall(ball, durationMs = 7000, onCatch) {
    if (this.isSleepingOnBed || this.isForcedSleeping) return;
    if (this.stationTween) {
      this.stationTween.stop();
      this.stationTween = null;
    }
    this.currentRoamTarget = null;
    this.isChasingBall = true;
    this.chaseBallTarget = ball;
    this.chaseTimeout = Date.now() + durationMs;
    this.chaseOnCatch = onCatch;
    this.chaseSpeed = 120;
    this.lastChaseEmoteTime = Date.now();
    this.spawnEmote('🐾');
  }

  stopChaseBall(triggerEmote = true) {
    this.isChasingBall = false;
    this.chaseBallTarget = null;
    this.chaseOnCatch = null;
    this.isMoving = false;
    this.sprite.setAngle(0);
    this.playIdle();
    if (triggerEmote) {
      this.spawnEmote('🐶');
    }
    this.nextRoamDecisionTime = Date.now() + 3000;
  }

  setMode(mode) {
    this.mode = mode;
    this.currentRoamTarget = null;
    if (mode === 'follow') {
      this.wakeUp();
      this.rerollFollowTarget(true);
    }
  }

  /**
   * Di chuyển từ từ, thong thả tới trạm chức năng (ăn, uống, tắm, bồn cầu, chơi bóng, ngủ)
   * Tương tự như cách cún bước đi khi đi ngủ, không dịch chuyển tức thời
   */
  walkToStation(targetX, targetY, onArrive) {
    // Đánh thức hoàn toàn nếu đang ngủ, triệt tiêu mọi trạng thái co bóp ngủ cũ
    this.wakeUp();
    this.isBusyWithStation = true;
    this.currentRoamTarget = null;
    this.stopHop();
    this.stopBathe();
    this.sprite.setAngle(0);
    this.sprite.setDisplaySize(this.size, this.size);

    const dx = targetX - this.sprite.x;
    const dy = targetY - this.sprite.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 15) {
      this.isMoving = true;
      this.playWalk();
      if (dx < -8) {
        this.sprite.setFlipX(true);
        this.facing = 'left';
      } else if (dx > 8) {
        this.sprite.setFlipX(false);
        this.facing = 'right';
      }

      // Tốc độ cún bước đi thong thả tự nhiên (~65 px/s) giống hệt như đi ngủ
      const walkSpeed = 65;
      const duration = Math.max(500, Math.round((dist / walkSpeed) * 1000));

      if (this.stationTween) {
        this.stationTween.stop();
        this.stationTween = null;
      }

      this.stationTween = this.scene.tweens.add({
        targets: [this.sprite, this.shadow].filter(Boolean),
        x: targetX,
        y: targetY,
        duration,
        ease: 'Linear',
        onUpdate: () => {
          if (this.shadow) {
            this.shadow.setPosition(this.sprite.x, this.sprite.y + (this.type === 'dog' ? 36 : 18));
          }
        },
        onComplete: () => {
          this.stationTween = null;
          this.isMoving = false;
          this.isBusyWithStation = true;
          this.sprite.setAngle(0);
          this.sprite.setDisplaySize(this.size, this.size);
          if (onArrive) onArrive();
        }
      });
    } else {
      this.isMoving = false;
      this.sprite.setPosition(targetX, targetY);
      if (onArrive) onArrive();
    }
  }

  /**
   * Cho cún đi ngủ: Bước đi tự nhiên từ từ đến đệm nằm giống như các điểm chức năng khác
   */
  forceSleep(targetX = 578, targetY = 360) {
    this.isForcedSleeping = true;
    this.isSleepingOnBed = false;
    this.stopHop();

    const sleepY = targetY - 32;
    // Bước đi thong thả tới lòng đệm ngủ
    this.walkToStation(targetX, sleepY, () => {
      this.isBusyWithStation = false;
      this.arriveAtBedToSleep(targetX, targetY);
    });
  }

  arriveAtBedToSleep(bedX = 578, bedY = 360) {
    this.isMoving = false;
    this.stopHop();
    // Căn chuẩn tâm lòng đệm phao ngủ (tâm phao y = 360, lòng đệm trũng ở y = 328)
    const bedSleepY = bedY - 32;
    this.sprite.x = bedX;
    this.sprite.y = bedSleepY;
    this.sprite.setAngle(0);
    this.facing = 'right';
    this.sprite.setFlipX(false);
    this.isSleepingOnBed = true;
    this.playSleep();
    if (this.shadow) this.shadow.setVisible(false);

    if (this.scene?.petBedSleepEffect) {
      this.scene.petBedSleepEffect.setPetSleeping(true);
    }
  }

  wakeUp() {
    this.endStationPose();
    // New station commands own position and scale; old celebrations must stop.
    this.stopCelebration();
    this.stopHop();
    this.stopBathe();
    this.scene.tweens.killTweensOf([this.sprite, this.shadow].filter(Boolean));
    this.isChasingBall = false;
    this.chaseBallTarget = null;
    this.chaseOnCatch = null;
    this.lockedAnimUntil = 0;
    this.isForcedSleeping = false;
    this.isBusyWithStation = false;
    this.isSleepingOnBed = false;
    if (this.shadow) this.shadow.setVisible(true);
    if (this.stationTween) {
      this.stationTween.stop();
      this.stationTween = null;
    }
    if (this.scene?.petBedSleepEffect) {
      this.scene.petBedSleepEffect.setPetSleeping(false);
      this.scene.petBedSleepEffect.clearActiveSleepZ();
    }
    this.sprite.setDisplaySize(this.size, this.size);
    this.playIdle(true);
    this.nextRoamDecisionTime = Date.now() + 3500;
  }

  /**
   * Áp dụng hoạt ảnh theo chỉ số thực tế của thú cưng tuân theo thứ tự ưu tiên (Mục 7 & Mục 3 he-thong-nuoi-thu.md):
   * 1. Đang ngủ hoặc Năng lượng cạn kiệt (<= 20%) -> Ngủ cuộn tròn (pet_dog_sleep)
   * 2. Khát nguy cấp (<= 10%) hoặc Đói bụng (<= 25%) -> Buồn bã rên nhẹ tìm chủ (pet_dog_sad)
   * 3. Buồn vệ sinh (>= 85%) -> Ngửi sàn tìm chỗ đi vệ sinh (pet_dog_potty)
   * 4. Ở dơ lấm lem (<= 45%) -> Gãi tai, rũ lông bùn đất (pet_dog_dirty)
   * 5. Buồn chán (<= 25%) -> Nhìn đồ chơi buồn thiu (pet_dog_sad)
   * 6. Nhu cầu bình thường: Tình cảm cao (>= 75%) vui vẻ (pet_dog_happy), hoặc thong thả đứng ngắm cảnh (pet_dog_idle)
   */
  applyStateBasedAnimation(petStats = {}) {
    const hunger = petStats.hunger ?? 100;
    const thirst = petStats.thirst ?? 100;
    const clean = petStats.clean ?? 100;
    const fun = petStats.fun ?? 80;
    const energy = petStats.energy ?? 100;
    const bladder = petStats.bladder ?? 0;
    const isSleeping = Boolean(petStats.isSleeping);
    const affection = petStats.affection ?? 10;

    // YÊU CẦU ĐẶC BIỆT: Khi cún đang đi theo nhân vật (this.mode === 'follow'),
    // cún sẽ KHÔNG BAO GIỜ TỰ NHIÊN NGỦ (trạng thái ngủ chỉ dành riêng cho Nông Trại Nuôi Thú)
    if (this.mode !== 'follow' && (isSleeping || energy <= 20)) {
      this.playSleep();
    } else if (thirst <= 10) {
      this.playSad();
    } else if (bladder >= 85) {
      const targetPottyX = 1005;
      const targetPottyY = 395;
      const distToPotty = Math.hypot(targetPottyX - this.sprite.x, targetPottyY - this.sprite.y);
      if (distToPotty <= 35) {
        this.playPotty(true);
      } else {
        // Cún đang buồn vệ sinh, nhăn mặt khó chịu và đi về bồn cầu
        this.playSad();
      }
    } else if (hunger <= 25) {
      this.playSad();
    } else if (clean <= 45) {
      this.playDirty();
    } else if (fun <= 25) {
      this.playSad();
    } else if (thirst <= 60 || hunger <= 60) {
      this.playSad();
    } else {
      // Khi bình thường: đứng yên tĩnh tại và thở nhẹ nhàng (Idle), không lặp hoạt ảnh nhảy cẫng liên tục
      this.playIdle();
    }
  }

  playWalk() {
    if (!this.scene?.sys?.isActive() || !this.sprite?.active) return;
    if (this.currentAnimState === PET_ANIM_STATES.WALK) return;
    this.currentAnimState = PET_ANIM_STATES.WALK;
    this.stopHop();
    this.stopBathe();

    if (this.scene.anims.exists('pet_dog_walk') && this.sprite.anims) {
      this.sprite.play('pet_dog_walk', true);
      this.sprite.setDisplaySize(this.size, this.size);
    }
  }

  playIdle(force = false) {
    if (!this.scene?.sys?.isActive() || !this.sprite?.active) return;
    if (!force && this.currentAnimState === PET_ANIM_STATES.IDLE && this.hopTween) return;
    this.currentAnimState = PET_ANIM_STATES.IDLE;
    this.stopBathe();

    if (this.sprite.anims) {
      this.sprite.anims.stop();
    }
    if (this.type === 'bunny' && this.scene.textures.exists('pet_bunny_idle')) {
      this.sprite.setTexture('pet_bunny_idle');
    } else if (this.scene.textures.exists('pet_dog_idle')) {
      this.sprite.setTexture('pet_dog_idle');
    } else if (this.scene.textures.exists('pet_dog_walk_sheet')) {
      this.sprite.setTexture('pet_dog_walk_sheet');
      this.sprite.setFrame(0);
    }
    this.sprite.setDisplaySize(this.size, this.size);
    this.startGentleHop();
  }

  playSad() {
    if (!this.scene?.sys?.isActive() || !this.sprite?.active) return;
    if (this.currentAnimState === PET_ANIM_STATES.SAD) return;
    this.currentAnimState = PET_ANIM_STATES.SAD;
    this.stopHop();
    this.stopBathe();

    if (this.scene.anims.exists('pet_dog_sad') && this.sprite.anims) {
      this.sprite.play('pet_dog_sad', true);
      this.sprite.setDisplaySize(this.size, this.size);
    }
  }

  playDirty() {
    if (!this.scene?.sys?.isActive() || !this.sprite?.active) return;
    if (this.currentAnimState === PET_ANIM_STATES.DIRTY) return;
    this.currentAnimState = PET_ANIM_STATES.DIRTY;
    this.stopHop();
    this.stopBathe();

    if (this.scene.anims.exists('pet_dog_dirty') && this.sprite.anims) {
      this.sprite.play('pet_dog_dirty', true);
      this.sprite.setDisplaySize(this.size, this.size);
    }
  }

  playHappy() {
    if (!this.scene?.sys?.isActive() || !this.sprite?.active) return;
    if (this.currentAnimState === PET_ANIM_STATES.HAPPY) return;
    this.currentAnimState = PET_ANIM_STATES.HAPPY;
    this.stopHop();
    this.stopBathe();

    if (this.scene.anims.exists('pet_dog_happy') && this.sprite.anims) {
      this.sprite.play('pet_dog_happy', true);
      this.sprite.setDisplaySize(this.size, this.size);
    }
  }

  playSleep() {
    if (!this.scene?.sys?.isActive() || !this.sprite?.active) return;
    // Cún đang đi theo nhân vật -> KHÔNG TỰ NHIÊN NGỦ, chuyển sang Idle
    if (this.mode === 'follow') {
      this.playIdle();
      return;
    }
    this.stopBathe();
    // Kích thước cún khi ngủ giữ tỷ lệ tương đương với khi đứng/đi (~58-60px chiều rộng cơ thể),
    // triệt tiêu hiện tượng cún tự động phóng to bất thường khi nằm vào phao ngủ (156/219 ~ 0.71)
    const sleepSize = Math.round(this.size * 0.71);

    if (this.currentAnimState === PET_ANIM_STATES.SLEEP) {
      if (this.sprite) this.sprite.setDisplaySize(sleepSize, sleepSize);
      return;
    }
    this.currentAnimState = PET_ANIM_STATES.SLEEP;
    this.stopHop();

    if (this.scene.anims.exists('pet_dog_sleep') && this.sprite.anims) {
      this.sprite.play('pet_dog_sleep', true);
      this.sprite.setDisplaySize(sleepSize, sleepSize);
    }
  }

  playDrink() {
    if (!this.scene?.sys?.isActive() || !this.sprite?.active) return;
    if (this.currentAnimState === PET_ANIM_STATES.DRINK) return;
    this.currentAnimState = PET_ANIM_STATES.DRINK;
    this.stopHop();
    this.stopBathe();
    this.sprite.setAngle(0);
    this.sprite.setDisplaySize(this.size, this.size);

    if (this.scene.anims.exists('pet_dog_drink') && this.sprite.anims) {
      this.sprite.play('pet_dog_drink', true);
      this.sprite.setDisplaySize(this.size, this.size);
    }
  }

    playEat() {
    if (!this.scene?.sys?.isActive() || !this.sprite?.active) return;
    if (this.currentAnimState === PET_ANIM_STATES.EAT) return;
    this.currentAnimState = PET_ANIM_STATES.EAT;
    this.stopHop();
    this.stopBathe();
    this.sprite.setAngle(0);
    this.sprite.setDisplaySize(this.size, this.size);

    if (this.scene.anims.exists('pet_dog_eat') && this.sprite.anims) {
      this.sprite.play('pet_dog_eat', true);
      this.sprite.setDisplaySize(this.size, this.size);
    }
  }

  beginStationPose(type, x, y) {
    this.stopCelebration();
    this.stopHop();
    this.stopBathe();
    this.scene.tweens.killTweensOf([this.sprite, this.shadow].filter(Boolean));
    this.sprite.setCrop();
    this.sprite.setOrigin(0.5, 0.5).setFlip(false, false).setAngle(0);
    const animMap = {
      bath: 'pet_dog_bath',
      water: 'pet_dog_drink',
      feed: 'pet_dog_eat'
    };
    this.stationPose = { type, x, y, animation: animMap[type] || 'pet_dog_happy' };
    this.isBusyWithStation = true;
    this.currentRoamTarget = null;
    this.isChasingBall = false;
    this.isMoving = false;
    if (type === 'bath') this.playBathe(3200);
    else if (type === 'feed') this.playEat();
    else this.playDrink();
    this.applyStationPose();
  }

  applyStationPose() {
    const pose = this.stationPose;
    if (!pose || !this.sprite?.active) return;
    this.sprite.setPosition(pose.x, pose.y).setOrigin(0.5, 0.5).setAngle(0).setFlip(false, false);
    if (this.sprite.anims?.currentAnim?.key !== pose.animation || !this.sprite.anims.isPlaying) {
      this.sprite.play(pose.animation);
    }
    // Uniform scale derived from a single frame, never from the whole strip.
    this.sprite.setScale(this.size / this.sprite.frame.realWidth);
    this.sprite.setDepth(pose.type === 'bath' ? 6 : Math.floor(pose.y + 10));
    if (pose.type === 'bath') {
      this.currentAnimState = PET_ANIM_STATES.BATHE;
    } else if (pose.type === 'feed') {
      this.currentAnimState = PET_ANIM_STATES.EAT;
    } else {
      this.currentAnimState = PET_ANIM_STATES.DRINK;
    }
    if (this.shadow) {
      this.shadow.setPosition(pose.x, pose.y + 36);
      this.shadow.setVisible(this.visible && pose.type !== 'bath');
    }
  }

  endStationPose() {
    this.stationPose = null;
    this.sprite?.setCrop?.();
    if (this.shadow) this.shadow.setVisible(this.visible);
  }

  playPotty(bypassToiletCheck = false) {
    const targetPottyX = 1005;
    const targetPottyY = 395;
    const distToToilet = Math.hypot(targetPottyX - this.sprite.x, targetPottyY - this.sprite.y);
    const hasToilet = this.scene?.currentMapId === 'map_pet_farm' ||
      (Array.isArray(this.farmStations) && this.farmStations.some(s => s.type === 'potty' || s.type === 'toilet'));

    // Nếu trên map có bồn cầu và cún chưa đến sát bồn cầu:
    // BẮT BUỘC cún phải bước đi tới đúng bồn cầu trước, tuyệt đối không được đi vệ sinh bừa bãi tại chỗ!
    if (!bypassToiletCheck && hasToilet && distToToilet > 35) {
      const pottySt = this.farmStations?.find(s => s.type === 'potty' || s.type === 'toilet') || { type: 'potty', x: targetPottyX, y: targetPottyY };
      if (this.scene?.handlePetStationInteraction) {
        this.scene.handlePetStationInteraction(pottySt);
      } else {
        this.walkToStation(targetPottyX, targetPottyY, () => {
          this._startPottyAnimAtToilet();
        });
      }
      return;
    }

    this._startPottyAnimAtToilet();
  }

  _startPottyAnimAtToilet() {
    if (this.currentAnimState === PET_ANIM_STATES.POTTY) return;
    this.currentAnimState = PET_ANIM_STATES.POTTY;
    this.stopHop();
    this.stopBathe();

    if (this.scene.anims.exists('pet_dog_potty') && this.sprite.anims) {
      this.sprite.play('pet_dog_potty', true);
      this.sprite.setDisplaySize(this.size, this.size);
    }
  }

  playBathe(duration = 4500) {
    if (!this.scene?.sys?.isActive() || !this.sprite?.active) return;
    this.currentAnimState = PET_ANIM_STATES.BATHE;
    this.stopHop();
    this.stopBathe();

    // Giữ nguyên kích thước chuẩn (this.size), tuyệt đối KHÔNG thêm hiệu ứng scale hay biến dạng để không bị lỗi
    this.sprite.setAngle(0);
    this.sprite.setDisplaySize(this.size, this.size);

    // Giữ bóng đổ mặt đất tự nhiên
    if (this.shadow) this.shadow.setVisible(this.visible);

    // Use dedicated bath frames with uniform size, without scale/squash tweens.
    if (this.scene.anims.exists('pet_dog_bath') && this.sprite.anims) {
      this.sprite.play('pet_dog_bath', true);
      this.sprite.setDisplaySize(this.size, this.size);
    } else {
      this.sprite.anims?.stop();
      this.sprite.setTexture(this.type === 'bunny' ? 'pet_bunny_idle' : 'pet_dog_idle');
      this.sprite.setDisplaySize(this.size, this.size);
    }

    // Hiệu ứng bọt xà phòng và bong bóng nước bay quanh khi tắm rửa thơm tho
    this.bathShakeTimer = this.scene.time.addEvent({
      delay: 180,
      repeat: Math.max(0, Math.ceil(duration / 180) - 1),
      callback: () => {
        if (!this.sprite?.active || !this.scene?.sys?.isActive() || this.currentAnimState !== PET_ANIM_STATES.BATHE) return;
        this.spawnBathWaterSplashes();
      }
    });
  }

  stopBathe() {
    if (this.shakeTween) {
      this.shakeTween.stop();
      this.shakeTween = null;
    }
    if (this.bathShakeTimer) {
      this.bathShakeTimer.remove();
      this.bathShakeTimer = null;
    }
    if (this.shadow) {
      this.shadow.setVisible(this.visible);
    }
    if (this.sprite?.active) {
      this.sprite.setAngle(0);
      this.sprite.setDisplaySize(this.size, this.size);
    }
  }

  spawnBathWaterSplashes() {
    if (!this.scene || !this.sprite?.active) return;
    const px = this.sprite.x;
    const py = this.sprite.y;

    for (let i = 0; i < 3; i++) {
      const isLeft = Math.random() < 0.5;
      const angle = isLeft ? Phaser.Math.Between(135, 215) : Phaser.Math.Between(-35, 45);
      const dist = Phaser.Math.Between(25, 55);
      const rad = Phaser.Math.DegToRad(angle);

      const useBubble = Math.random() < 0.45;
      const tex = useBubble && this.scene.textures.exists('fx_bath_bubble') ? 'fx_bath_bubble' : 'fx_bath_droplet';
      
      let p;
      if (this.scene.textures.exists(tex)) {
        p = this.scene.add.image(px, py - 5, tex).setScale(Phaser.Math.FloatBetween(0.6, 1.2)).setDepth(8);
      } else {
        p = this.scene.add.circle(px, py - 5, Phaser.Math.Between(3, 6), 0x38bdf8, 0.85).setDepth(8);
      }

      this.scene.tweens.add({
        targets: p,
        x: px + Math.cos(rad) * dist,
        y: py - 10 + Math.sin(rad) * dist,
        alpha: 0,
        scale: { from: 1, to: 0.3 },
        duration: Phaser.Math.Between(350, 600),
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  startGentleHop() {
    if (this.hopTween) return; // Đang thở nhẹ nhàng rồi thì giữ nguyên, không reset giữa chừng
    this.baseIdleY = this.sprite.y;
    this.hopTween = this.scene.tweens.add({
      targets: this.sprite,
      y: this.baseIdleY - 4,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  stopHop() {
    if (this.hopTween) {
      this.hopTween.stop();
      this.hopTween = null;
    }
    if (typeof this.baseIdleY === 'number') {
      this.sprite.y = this.baseIdleY;
      this.baseIdleY = null;
    }
  }

  celebrate(durationMs = 2500) {
    this.stopCelebration();
    this.lockedAnimUntil = Date.now() + durationMs;
    this.stopHop();
    this.playHappy();
    this.spawnEmote('💖');
    this.spawnEmote('⭐');

    const startY = this.sprite.y;
    const tween = this.scene.tweens.add({
      targets: this.sprite,
      y: startY - 14,
      duration: 250,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (this.celebrationTween !== tween) return;
        this.celebrationTween = null;
        if (this.sprite?.active) {
          this.sprite.setAngle(0);
          this.sprite.setDisplaySize(this.size, this.size);
          this.sprite.y = startY;
        }
      }
    });
    this.celebrationTween = tween;
  }

  stopCelebration() {
    if (this.celebrationTween) {
      const tween = this.celebrationTween;
      this.celebrationTween = null;
      tween.stop();
    }
    this.lockedAnimUntil = 0;
  }

  handlePetClick(pointer) {
    if (pointer && this.scene?.isWorldPointer && !this.scene.isWorldPointer(pointer)) return;
    this.addPetJoyOnTouch();
    if (this.isChasingBall) {
      this.stopChaseBall(false);
      this.celebrate(1800);
      this.spawnEmote('💖');
      return;
    }
    if (this.isBusyWithStation && this.scene?.interruptPetStationAction) {
      this.scene.interruptPetStationAction(true);
      return;
    }
    this.celebrate(1800);
    this.spawnEmote('💖');

    // Bắn sự kiện ra ngoài để UI mở modal hoặc phát âm thanh vui tai
    window.dispatchEvent(new CustomEvent('game:pet-clicked', {
      detail: { type: this.type, x: this.sprite.x, y: this.sprite.y }
    }));
  }

  spawnEmote(emoji = '💖') {
    if (!this.scene || !this.sprite?.active) return;
    const txt = this.scene.add.text(
      this.sprite.x + (Math.random() * 30 - 15),
      this.sprite.y - 45,
      emoji,
      { fontSize: '26px' }
    ).setOrigin(0.5).setDepth(15);

    this.scene.tweens.add({
      targets: txt,
      y: txt.y - 45,
      alpha: 0,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy()
    });
  }

  /**
   * Thêm 1% Vui vẻ khi bé vuốt ve hoặc chạm vào thú cưng
   */
  addPetJoyOnTouch() {
    const now = Date.now();
    // Giới hạn tần suất vuốt ve tối thiểu 300ms giữa các lần chạm
    if (this.lastTouchJoyTime && now - this.lastTouchJoyTime < 300) {
      return;
    }
    this.lastTouchJoyTime = now;

    try {
      const state = saveAdapter.load();
      const pet = state.pet || {};
      const oldFun = typeof pet.fun === 'number' ? pet.fun : 80;
      const newFun = Math.min(100, oldFun + 1);
      pet.fun = newFun;
      pet.lastCareTimestamp = now;
      state.pet = pet;
      saveAdapter.save(state);

      if (this.scene?.audioService) {
        this.scene.audioService.playChime(680 + (newFun % 10) * 20, 0.12);
      }

      if (this.scene?.spawnFloatingPopup) {
        this.scene.spawnFloatingPopup(this.sprite.x, this.sprite.y - 45, '+1% Vui vẻ 💖', '#ec4899');
      }

      window.dispatchEvent(new CustomEvent('game:pet-updated', { detail: { pet } }));
    } catch (err) {
      console.warn('[Pet] Lỗi tăng vui vẻ khi vuốt ve:', err);
    }
  }

  setVisible(visible) {
    this.visible = Boolean(visible);
    if (this.sprite?.active) this.sprite.setVisible(this.visible);
    if (this.shadow?.active) this.shadow.setVisible(this.visible);
  }

  destroy() {
    this.stopCelebration();
    this.stopHop();
    this.stopBathe();
    if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null;
    }
    if (this.sprite) this.sprite.destroy();
  }
}
