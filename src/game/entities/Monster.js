import * as Phaser from 'phaser';
import { createGroundShadow, isFlyingMonster } from '../effects/GroundShadow.js';
import { isPointInLake, clampOutOfLake } from '../effects/LakeWaterEffect.js';

/**
 * Monster / Friend Entity
 * Sinh vật cần được giải cứu trên bản đồ.
 */

const MONSTER_PROFILES = {
  mon_bee: {
    speed: 95,            // Ong Vàng bay lượn nhịp nhàng, đổi hướng nhanh
    minDist: 45,
    maxDist: 170,
    roamRadius: 280,
    pauseMin: 300,
    pauseMax: 1000,
    ease: 'Sine.easeInOut'
  },
  mon_mushroom: {
    speed: 55,            // Nấm bước đi chậm rãi đáng yêu, dừng lại ngắm nhìn
    minDist: 35,
    maxDist: 120,
    roamRadius: 200,
    pauseMin: 1000,
    pauseMax: 2400,
    ease: 'Sine.easeInOut'
  },
  mon_ladybug: {
    speed: 80,            // Bọ Rùa bò nhanh thoăn thoắt
    minDist: 40,
    maxDist: 150,
    roamRadius: 240,
    pauseMin: 500,
    pauseMax: 1400,
    ease: 'Quad.easeOut'
  },
  mon_caterpillar: {
    speed: 65,            // Sâu xanh bò nhấp nhô
    minDist: 35,
    maxDist: 130,
    roamRadius: 210,
    pauseMin: 700,
    pauseMax: 1800,
    ease: 'Sine.easeInOut'
  },
  mon_crab: {
    speed: 75,            // Cua Kẹp Nhỏ bò ngang lạch bạch vui nhộn
    minDist: 40,
    maxDist: 150,
    roamRadius: 230,
    pauseMin: 600,
    pauseMax: 1600,
    ease: 'Sine.easeInOut'
  },
  mon_starfish: {
    speed: 55,            // Sao Biển Vàng nhấp nhô lắc lư theo sóng
    minDist: 35,
    maxDist: 120,
    roamRadius: 190,
    pauseMin: 900,
    pauseMax: 2200,
    ease: 'Sine.easeInOut'
  },
  mon_emerald_crab: {
    speed: 80,            // Cua Ngọc Bích bò nhanh thoăn thoắt
    minDist: 45,
    maxDist: 160,
    roamRadius: 240,
    pauseMin: 500,
    pauseMax: 1400,
    ease: 'Quad.easeOut'
  },
  mon_crystal_sprout: {
    speed: 65,            // Thạch Nhũ bước đi vững vàng lấp lánh
    minDist: 35,
    maxDist: 130,
    roamRadius: 210,
    pauseMin: 700,
    pauseMax: 1800,
    ease: 'Sine.easeInOut'
  },
  mon_crystal_moth: {
    speed: 85,            // Bướm Đêm bay lượn dạ quang 8 hướng
    minDist: 40,
    maxDist: 160,
    roamRadius: 250,
    pauseMin: 400,
    pauseMax: 1200,
    ease: 'Quad.easeInOut'
  },
  mon_desert_fox: {
    speed: 95,            // Cáo Cát Ánh Dương di chuyển nhanh nhẹn, tinh nghịch
    minDist: 40,
    maxDist: 150,
    roamRadius: 240,
    pauseMin: 400,
    pauseMax: 1200,
    ease: 'Quad.easeInOut'
  },
  mon_scarab: {
    speed: 65,            // Bọ Cánh Cứng bò vững vàng, túc tắc trên cát
    minDist: 35,
    maxDist: 120,
    roamRadius: 200,
    pauseMin: 600,
    pauseMax: 1500,
    ease: 'Sine.easeInOut'
  },
  mon_desert_falcon: {
    speed: 100,           // Chim Ưng Mặt Trời bay liệng chao nghiêng
    minDist: 50,
    maxDist: 180,
    roamRadius: 280,
    pauseMin: 300,
    pauseMax: 1000,
    ease: 'Quad.easeOut'
  },
  mon_crystal_bat: {
    speed: 90,            // Dơi Pha Lê bay lượn nhịp nhàng 8 hướng
    minDist: 45,
    maxDist: 170,
    roamRadius: 260,
    pauseMin: 350,
    pauseMax: 1100,
    ease: 'Quad.easeOut'
  },
  default: {
    speed: 70,
    minDist: 40,
    maxDist: 140,
    roamRadius: 220,
    pauseMin: 600,
    pauseMax: 1600,
    ease: 'Sine.easeInOut'
  }
};

export class Monster {
  constructor(scene, encounterData, textureKey = 'mon_sprout') {
    this.scene = scene;
    this.data = encounterData;
    // Kích thước chuẩn hóa cân đối giữa các Maps: quái thường 80px, riêng các quái dạng dẹt/thấp như Cua, Sao Biển là 95px để diện tích ngang bằng quái khác
    const isMap2Crab = encounterData?.spriteKey?.includes('crab') || textureKey?.includes('crab');
    const isMap2Starfish = encounterData?.spriteKey?.includes('starfish') || textureKey?.includes('starfish');
        const isMap3Crystal = encounterData?.spriteKey?.includes('crystal') || textureKey?.includes('crystal');
    const isMap4Desert = encounterData?.spriteKey?.includes('desert') || encounterData?.spriteKey?.includes('scarab') || textureKey?.includes('desert') || textureKey?.includes('scarab');
    this.size = (isMap2Crab || isMap2Starfish || isMap3Crystal || isMap4Desert) ? 95 : 80;
    this.isRescued = false;
    this.isPaused = false;
    this.wanderTimer = null;
    this.activeTween = null;

    const { x, y } = encounterData;
    this.startX = x;
    this.startY = y;
    this.patrolDist = encounterData.patrolDist || 36;
    this.profile = MONSTER_PROFILES[textureKey] || MONSTER_PROFILES.default;

    // 0. Khởi tạo Animations nếu chưa có
    Monster.initAnimations(scene);

    // 1. Bóng đổ dưới chân quái vật: Xoá bỏ hoàn toàn đổ bóng của tất cả quái vật theo yêu cầu người dùng
    const isMap2 = scene?.currentMapId === 'map2';
    this.shadowOffsetY = isMap2 ? Math.round(this.size * 0.20) : Math.round(this.size * 0.38);
    this.shadowWidth = Math.round(this.size * (isMap2 ? 0.88 : 0.70));
    this.shadowHeight = Math.round(this.size * (isMap2 ? 0.26 : 0.22));
    this.shadowAlpha = isMap2 ? 0.78 : 0.65;
    this.shadow = null;

    // 2. Sprite chính (Hỗ trợ hoạt ảnh walk 8 hướng của Nấm, Ong, Bọ Rùa...)
    const walkSheetKey = `${textureKey}_walk_sheet`;
    this.walkAnimKey = scene.anims?.exists(`${textureKey}_walk`) ? `${textureKey}_walk` : 'mon_sprout_walk';
    this.idleAnimKey = scene.anims?.exists(`${textureKey}_idle`) ? `${textureKey}_idle` : this.walkAnimKey;

    if (scene.textures.exists(walkSheetKey)) {
      this.sprite = scene.add.sprite(x, y, walkSheetKey, 0).setDisplaySize(this.size, this.size);
      this.playAnim(this.walkAnimKey);
    } else if (scene.textures.exists('mon_sprout_walk_sheet')) {
      this.sprite = scene.add.sprite(x, y, 'mon_sprout_walk_sheet', 0).setDisplaySize(this.size, this.size);
      this.playAnim('mon_sprout_walk');
    } else if (scene.textures.exists(textureKey)) {
      this.sprite = scene.add.image(x, y, textureKey).setDisplaySize(this.size, this.size);
    } else {
      this.sprite = scene.add.circle(x, y, this.size * 0.42, 0xd7edb4, 1).setStrokeStyle(5, 0xffffff, 0.9);
      this.label = scene.add.text(x, y, '🍄', { fontSize: '42px' }).setOrigin(0.5);
    }
    this.sprite.setDepth(4);

    // 3. Vùng bấm cảm ứng thân thiện
    this.sprite.setInteractive(
      new Phaser.Geom.Circle(this.size / 2, this.size / 2, this.size * 0.55),
      Phaser.Geom.Circle.Contains,
      { useHandCursor: true }
    );

    // 4. Khởi động di chuyển ngẫu nhiên tự do khắp bản đồ
    this.startPatrol();
  }

  static initAnimations(scene) {
    if (!scene.anims) return;
    const configs = [
      { key: 'mon_sprout', sheet: 'mon_sprout_walk_sheet', frames: 4, fps: 6 },
      { key: 'mon_mushroom', sheet: 'mon_mushroom_walk_sheet', frames: 8, fps: 8 },
      { key: 'mon_bee', sheet: 'mon_bee_walk_sheet', frames: 8, fps: 8 },
      { key: 'mon_ladybug', sheet: 'mon_ladybug_walk_sheet', frames: 8, fps: 8 },
      { key: 'mon_crab', sheet: 'mon_crab_walk_sheet', frames: 8, fps: 8 },
      { key: 'mon_starfish', sheet: 'mon_starfish_walk_sheet', frames: 8, fps: 8 },
      { key: 'mon_emerald_crab', sheet: 'mon_emerald_crab_walk_sheet', frames: 8, fps: 8 },
      { key: 'mon_crystal_sprout', sheet: 'mon_crystal_sprout_walk_sheet', frames: 8, fps: 8 },
      { key: 'mon_crystal_moth', sheet: 'mon_crystal_moth_walk_sheet', frames: 8, fps: 8 },
      { key: 'mon_crystal_bat', sheet: 'mon_crystal_bat_walk_sheet', frames: 8, fps: 8 },
      { key: 'mon_desert_fox', sheet: 'mon_desert_fox_walk_sheet', frames: 8, fps: 8 },
      { key: 'mon_scarab', sheet: 'mon_scarab_walk_sheet', frames: 8, fps: 8 },
      { key: 'mon_desert_falcon', sheet: 'mon_desert_falcon_walk_sheet', frames: 8, fps: 8 }
    ];

    configs.forEach(cfg => {
      const animKey = `${cfg.key}_walk`;
      if (scene.textures.exists(cfg.sheet) && !scene.anims.exists(animKey)) {
        scene.anims.create({
          key: animKey,
          frames: scene.anims.generateFrameNumbers(cfg.sheet, { start: 0, end: cfg.frames - 1 }),
          frameRate: cfg.fps,
          repeat: -1
        });
      }
    });

    if (scene.textures.exists('mon_sprout_idle_sheet') && !scene.anims.exists('mon_sprout_idle')) {
      scene.anims.create({
        key: 'mon_sprout_idle',
        frames: scene.anims.generateFrameNumbers('mon_sprout_idle_sheet', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1
      });
    }
  }

  playAnim(key) {
    if (this.sprite?.play && this.scene?.anims?.exists(key)) {
      this.sprite.play(key, true);
    }
  }

  startPatrol() {
    if (!this.scene || !this.sprite || this.isRescued) return;
    this.stopPatrol();
    this.isPaused = false;

    // Khởi đầu so le ngẫu nhiên để các quái vật khác nhau không di chuyển đồng loạt
    const initialDelay = Phaser.Math.Between(100, 1000);
    this.wanderTimer = this.scene.time.delayedCall(initialDelay, () => {
      this.stepRandomWander();
    });
  }

  stepRandomWander() {
    if (!this.scene || !this.sprite?.active || this.isRescued || this.isPaused) return;

    const currentX = this.sprite.x;
    const currentY = this.sprite.y;

    // 1. Chọn hướng di chuyển hoàn toàn ngẫu nhiên (góc ngẫu nhiên 0 đến 360 độ)
    const angle = Math.random() * Math.PI * 2;
    const dist = Phaser.Math.Between(this.profile.minDist, this.profile.maxDist);

    let targetX = currentX + Math.cos(angle) * dist;
    let targetY = currentY + Math.sin(angle) * dist;

    // 2. Không bị giới hạn vùng, di chuyển tự do khắp bản đồ trong phạm vi an toàn
    const minMapX = 65;
    const maxMapX = 1215;
    const minMapY = 85;
    const maxMapY = 645;

    // Nếu mục tiêu đi quá xa vị trí gốc hoặc sát biên map, bẻ lái ngẫu nhiên quay về hướng tâm
    const distFromStart = Math.hypot(targetX - this.startX, targetY - this.startY);
    if (distFromStart > this.profile.roamRadius || targetX < minMapX || targetX > maxMapX || targetY < minMapY || targetY > maxMapY) {
      const returnAngle = Math.atan2(this.startY - currentY, this.startX - currentX) + (Math.random() - 0.5) * 1.2;
      const returnDist = Phaser.Math.Between(this.profile.minDist, Math.min(dist, 110));
      targetX = currentX + Math.cos(returnAngle) * returnDist;
      targetY = currentY + Math.sin(returnAngle) * returnDist;
    }

    targetX = Phaser.Math.Clamp(targetX, minMapX, maxMapX);
    targetY = Phaser.Math.Clamp(targetY, minMapY, maxMapY);

    // Không cho quái vật đi vào khu vực hồ ở Map 1 (Làng Quê Yên Bình)
    const isMap1 = this.scene?.currentMapId === 'map1' || !this.scene?.currentMapId;
    if (isMap1 && isPointInLake(targetX, targetY + (this.size * 0.35))) {
      const safe = clampOutOfLake(targetX, targetY + (this.size * 0.35), 25);
      targetX = safe.x;
      targetY = safe.y - (this.size * 0.35);
    }

    const actualDist = Math.hypot(targetX - currentX, targetY - currentY);
    if (actualDist < 12) {
      this.playAnim(this.idleAnimKey);
      this.wanderTimer = this.scene.time.delayedCall(Phaser.Math.Between(400, 1000), () => {
        this.stepRandomWander();
      });
      return;
    }

    // 3. Đổi hướng quay mặt theo hướng di chuyển thực tế (dx)
    const dx = targetX - currentX;
    if (dx > 3) {
      this.sprite.setFlipX(false); // Quay sang phải
    } else if (dx < -3) {
      this.sprite.setFlipX(true);  // Quay sang trái
    }

    // 4. Bật hoạt ảnh bước đi / bay lượn
    this.playAnim(this.walkAnimKey);

    // 5. Tính thời gian di chuyển dựa theo tốc độ riêng của từng loài
    const duration = Math.round((actualDist / this.profile.speed) * 1000);

    this.activeTween = this.scene.tweens.add({
      targets: this.sprite,
      x: targetX,
      y: targetY,
      duration,
      ease: this.profile.ease,
      onUpdate: () => {
        this.syncShadow();
      },
      onComplete: () => {
        this.activeTween = null;
        if (!this.sprite?.active || this.isRescued || this.isPaused) return;

        // 6. Đến nơi: Dừng lại thở / idle ngẫu nhiên
        this.playAnim(this.idleAnimKey);

        const pauseTime = Phaser.Math.Between(this.profile.pauseMin, this.profile.pauseMax);
        this.wanderTimer = this.scene.time.delayedCall(pauseTime, () => {
          this.stepRandomWander();
        });
      }
    });
  }

  syncShadow() {
    if (this.shadow?.active && this.sprite?.active) {
      const offset = this.shadowOffsetY !== undefined ? this.shadowOffsetY : Math.round(this.size * 0.38);
      this.shadow.setPosition(this.sprite.x, this.sprite.y + offset);
      this.shadow.setDepth(Math.max(1, Math.floor(this.sprite.y + 10)));
    }
    if (this.label?.active && this.sprite?.active) {
      this.label.setPosition(this.sprite.x, this.sprite.y);
    }
  }

  stopPatrol() {
    if (this.wanderTimer) {
      this.wanderTimer.remove(false);
      this.wanderTimer = null;
    }
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }
    if (this.sprite?.active) {
      this.sprite.setAngle(0);
      this.sprite.setFlipX(false);
      this.playAnim(this.idleAnimKey);
    }
  }

  pausePatrol() {
    this.isPaused = true;
    if (this.wanderTimer) {
      this.wanderTimer.paused = true;
    }
    if (this.activeTween) {
      this.activeTween.pause();
    }
    if (this.sprite?.active) {
      this.sprite.setAngle(0);
      this.playAnim(this.idleAnimKey);
    }
  }

  resumePatrol() {
    if (this.isRescued || !this.sprite?.active) return;
    this.isPaused = false;
    if (this.activeTween && this.activeTween.isPaused()) {
      this.activeTween.resume();
      this.playAnim(this.walkAnimKey);
    } else if (this.wanderTimer && this.wanderTimer.paused) {
      this.wanderTimer.paused = false;
    } else {
      this.stepRandomWander();
    }
  }

  onInteract(callback) {
    this.sprite.on('pointerdown', () => {
      if (typeof callback === 'function') callback(this.data);
    });
  }

  playRescueAnimation() {
    this.isRescued = true;
    this.stopPatrol();

    // Nhún nhảy vui mừng rồi biến mất hoàn toàn khỏi map
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.startY - 25,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 260,
      yoyo: true,
      repeat: 2,
      ease: 'Back.easeOut',
      onUpdate: () => this.syncShadow(),
      onComplete: () => {
        // Biến mất mượt mà với hiệu ứng thu nhỏ và tan biến
        this.scene.tweens.add({
          targets: [this.sprite, this.shadow, this.label].filter(Boolean),
          alpha: 0,
          scaleX: 0.1,
          scaleY: 0.1,
          duration: 450,
          ease: 'Power2',
          onComplete: () => {
            const posX = this.sprite?.x || this.x;
            const posY = this.sprite?.y || this.y;
            this.destroy();
            if (this.scene && typeof this.scene.playCoinDropVFX === 'function') {
              this.scene.playCoinDropVFX(posX, posY, this.data?.rewardStars || 2);
            }
          }
        });
      }
    });
  }

  destroy() {
    this.stopPatrol();
    if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null;
    }
    if (this.label) {
      this.label.destroy();
      this.label = null;
    }
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
