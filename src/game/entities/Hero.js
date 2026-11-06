/**
 * Hero Entity: Bé Sâu
 * Quản lý hoạt ảnh đa hướng, di chuyển mượt mà, bóng đổ và va chạm của nhân vật chính.
 * Hỗ trợ Sprite Sheet 4 hướng đầy đủ, không cắt góc hình.
 */

import { createGroundShadow } from '../effects/GroundShadow.js';
import { CoordinateGuide } from '../effects/CoordinateGuide.js';
import { isPointInLake, clampOutOfLake } from '../effects/LakeWaterEffect.js';

export const ACCESSORY_RENDER_CONFIG = {
  // 1. VƯƠNG MIỆN & TAI THÚ & VÒNG ĐẦU
  acc_rainbow_crown: {
    slot: 'head',
    layer: 'front',
    offsetY: -49,
    knightOffsetY: -38,
    offsetX: 0,
    knightOffsetX: 0,
    width: 32,
    height: 26,
    bobbing: false
  },
  acc_cat_ears_bow: {
    slot: 'head',
    layer: 'front',
    offsetY: -50,
    knightOffsetY: -37,
    offsetX: 0,
    knightOffsetX: 0,
    width: 38,
    height: 38,
    bobbing: false
  },
  acc_panda_headband: {
    slot: 'head',
    layer: 'front',
    offsetY: -50,
    knightOffsetY: -37,
    offsetX: 0,
    knightOffsetX: 0,
    width: 38,
    height: 38,
    bobbing: false
  },
  acc_bunny_flower_ears: {
    slot: 'head',
    layer: 'front',
    offsetY: -53,
    knightOffsetY: -41,
    offsetX: 0,
    knightOffsetX: 0,
    width: 36,
    height: 44,
    bobbing: false
  },
  acc_angel_halo: {
    slot: 'head',
    layer: 'front',
    offsetY: -60,
    knightOffsetY: -46,
    offsetX: 0,
    knightOffsetX: 0,
    width: 36,
    height: 20,
    bobbing: false
  },
  acc_flower_wreath: {
    slot: 'head',
    layer: 'front',
    offsetY: -46,
    knightOffsetY: -34,
    offsetX: 0,
    knightOffsetX: 0,
    width: 40,
    height: 28,
    bobbing: false
  },

  // 2. CÁC LOẠI NÓN (Mũ rơm, Cao bồi, Đầu bếp, Thủy thủ, Nồi họa sĩ, Chú ếch, Phù thủy)
  acc_straw_hat: {
    slot: 'head',
    layer: 'front',
    offsetY: -40,
    knightOffsetY: -33, // Đặt ngay ngắn trên đỉnh trán/tóc mái, không che mắt, không bay lơ lửng
    offsetX: 0,
    knightOffsetX: 0,
    width: 50,
    height: 38,
    bobbing: false
  },
  acc_cowboy_hat: {
    slot: 'head',
    layer: 'front',
    offsetY: -44,
    knightOffsetY: -33,
    offsetX: 0,
    knightOffsetX: 0,
    width: 48,
    height: 36,
    bobbing: false
  },
  acc_chef_hat: {
    slot: 'head',
    layer: 'front',
    offsetY: -52,
    knightOffsetY: -37,
    offsetX: 0,
    knightOffsetX: 0,
    width: 42,
    height: 44,
    bobbing: false
  },
  acc_sailor_hat: {
    slot: 'head',
    layer: 'front',
    offsetY: -45,
    knightOffsetY: -34,
    offsetX: 0,
    knightOffsetX: 0,
    width: 44,
    height: 36,
    bobbing: false
  },
  acc_beret_artist: {
    slot: 'head',
    layer: 'front',
    offsetY: -45,
    knightOffsetY: -36, // Đội ngay ngắn trên đỉnh đầu, lộ rõ trán và lông mày
    offsetX: 0,
    knightOffsetX: 0,
    width: 44,
    height: 36,
    bobbing: false
  },
  acc_frog_hat: {
    slot: 'head',
    layer: 'front',
    offsetY: -45,
    knightOffsetY: -34,
    offsetX: 0,
    knightOffsetX: 0,
    width: 46,
    height: 38,
    bobbing: false
  },
  acc_witch_hat: {
    slot: 'head',
    layer: 'front',
    offsetY: -55,
    knightOffsetY: -42,
    offsetX: 0,
    knightOffsetX: 0,
    width: 46,
    height: 46,
    bobbing: false
  },

  // 3. KÍNH MẮT (Kính trái tim & Kính ngôi sao)
  acc_heart_glasses: {
    slot: 'face',
    layer: 'front',
    offsetY: -20, // Khớp chuẩn vào 2 mắt bé Sâu
    knightOffsetY: -15, // Khớp chuẩn vào đôi mắt to tròn của bé gái
    offsetX: 0,
    knightOffsetX: 0,
    width: 32,
    height: 22,
    bobbing: false
  },
  acc_star_glasses: {
    slot: 'face',
    layer: 'front',
    offsetY: -20,
    knightOffsetY: -15,
    offsetX: 0,
    knightOffsetX: 0,
    width: 32,
    height: 22,
    bobbing: false
  },

  // 4. SAU LƯNG (Cánh tiên & Áo choàng)
  acc_fairy_wings: {
    slot: 'back',
    layer: 'back',
    offsetY: -22,
    knightOffsetY: -12,
    offsetX: 0,
    knightOffsetX: 0,
    width: 52,
    height: 40,
    bobbing: false
  },
  acc_super_cape: {
    slot: 'back',
    layer: 'back',
    offsetY: -14,
    knightOffsetY: -6,
    offsetX: 0,
    knightOffsetX: 0,
    width: 42,
    height: 46,
    bobbing: false
  },

  // 5. CẦM TRÊN TAY (Bong bóng, Kẹo mút, Chong chóng, Đũa phép)
  acc_rainbow_balloons: {
    slot: 'hand',
    layer: 'front',
    offsetY: -32,
    knightOffsetY: -24,
    offsetX: 28,
    knightOffsetX: 30, // Đưa sang bên cạnh tay cầm, không che mặt
    width: 48,
    height: 60,
    bobbing: true
  },
  acc_giant_lollipop: {
    slot: 'hand',
    layer: 'front',
    offsetY: -5,
    knightOffsetY: 0, // Cán kẹo cầm ở tay, kẹo bên cạnh sườn, không che mặt
    offsetX: 26,
    knightOffsetX: 26,
    width: 34,
    height: 44,
    bobbing: false
  },
  acc_pinwheel: {
    slot: 'hand',
    layer: 'front',
    offsetY: -5,
    knightOffsetY: 0,
    offsetX: 26,
    knightOffsetX: 26,
    width: 34,
    height: 42,
    bobbing: false
  },
  acc_star_wand: {
    slot: 'hand',
    layer: 'front',
    offsetY: -5,
    knightOffsetY: 0,
    offsetX: 26,
    knightOffsetX: 25,
    width: 32,
    height: 44,
    bobbing: false
  }
};


export class Hero {
  constructor(scene, x, y, textureKey = 'hero_idle_sheet') {
    this.scene = scene;
    this.x = x;
    this.y = y;

    // Xác định skin (default hoặc knight - Bé Gái Kuromi)
    if (typeof textureKey === 'object' && textureKey !== null) {
      this.skin = textureKey.skin || 'default';
    } else if (typeof textureKey === 'string' && (textureKey.includes('upgrade') || textureKey.includes('knight'))) {
      this.skin = 'knight';
    } else {
      this.skin = 'default';
    }

    this.baseSize = 110; // Kích thước chuẩn Bé Sâu
    // Tăng kích thước bé Kuromi lên 10% (từ 88px lên 97px: 88 * 1.1 = 96.8 ~ 97px) theo yêu cầu người dùng
    this.size = this.skin === 'knight' ? Math.round(88 * 1.1) : this.baseSize;
    this.speed = 165; // Tốc độ di chuyển nhịp nhàng, êm ái cho trẻ mầm non dễ điều khiển
    this.facing = 'down';
    this.isMoving = false;

    // 1. Khởi tạo Animations nếu chưa có
    Hero.initAnimations(scene);

    // 2. Bóng đổ mềm mại chân thực dưới chân nhân vật (Soft Ambient Occlusion)
    this.shadowOffsetY = this.skin === 'knight' ? 33 : 38;
    const shadowWidth = this.skin === 'knight' ? 70 : 80;
    const shadowHeight = this.skin === 'knight' ? 22 : 24;
    this.shadow = createGroundShadow(scene, x, y + this.shadowOffsetY, shadowWidth, shadowHeight, 0.72);
    this.shadow.setDepth(Math.max(1, Math.floor(y + 14)));

    // 3. Khởi tạo Sprite hoặc Fallback
    const idleTex = this.getTextureKey('idle');
    const startAnim = `${this.getAnimPrefix()}_idle_down`;

    if (scene.textures.exists(idleTex)) {
      this.sprite = scene.add.sprite(x, y, idleTex, 0);
      this.sprite.setOrigin(0.5, 0.5);
      if (scene.anims.exists(startAnim)) {
        this.sprite.play(startAnim);
      }
    } else if (scene.textures.exists('hero_idle_sheet')) {
      this.sprite = scene.add.sprite(x, y, 'hero_idle_sheet', 0);
      this.sprite.setOrigin(0.5, 0.5);
      if (scene.anims.exists('hero_idle_down')) {
        this.sprite.play('hero_idle_down');
      }
    } else if (scene.textures.exists('hero_idle')) {
      this.sprite = scene.add.image(x, y, 'hero_idle');
      this.sprite.setOrigin(0.5, 0.5);
    } else {
      this.sprite = scene.add.circle(x, y, this.size * 0.4, 0xbde5ac, 1).setStrokeStyle(5, 0xffffff, 0.9);
      this.label = scene.add.text(x, y, '🐛', { fontSize: '48px' }).setOrigin(0.5);
    }
    this.restoreDisplaySize();
    this.sprite.setDepth(Math.floor(y + 35));

    // 4. Vật lý Arcade Physics
    scene.physics.add.existing(this.sprite);
    if (this.sprite.body) {
      this.sprite.body.setCollideWorldBounds(true);
      const bodyRadius = Math.round(this.size * 0.3);
      const bodyOffset = (this.size - bodyRadius * 2) / 2;
      this.sprite.body.setCircle(bodyRadius, bodyOffset, bodyOffset);
      this.sprite.body.setImmovable(true);
    }

    // 5. Đứng yên vững vàng (không nhún nhảy)
    this.idleTween = null;

    // 6. Trục dóng tọa độ X/Y và huy hiệu tọa độ theo sát nhân vật
    this.coordGuide = new CoordinateGuide(scene, this);

    // 7. Huy Hiệu trên đầu nhân vật (Head Badge)
    this.headBadgeContainer = null;
    this.headBadgeTween = null;
    this.headBadgeData = null;

    // 8. Phụ kiện nhân vật (Accessory: Nón, Kính, Cánh, Vương miện...)
    this.accessorySprite = null;
    this.accessoryId = null;
    this.accessoryTween = null;
  }

  getAnimPrefix() {
    return this.skin === 'knight' ? 'hero_knight' : 'hero';
  }

  getTextureKey(type = 'idle') {
    if (this.skin === 'knight') {
      return type === 'walk' ? 'hero_upgrade_walk_sheet' : 'hero_upgrade_idle_sheet';
    }
    return type === 'walk' ? 'hero_walk_sheet' : 'hero_idle_sheet';
  }

  restoreDisplaySize() {
    if (this.sprite && typeof this.sprite.setDisplaySize === 'function') {
      this.sprite.setDisplaySize(this.size, this.size);
    }
    if (this.shadow && typeof this.shadow.setDisplaySize === 'function') {
      const shadowWidth = this.skin === 'knight' ? 70 : 80;
      const shadowHeight = this.skin === 'knight' ? 22 : 24;
      this.shadow.setDisplaySize(shadowWidth, shadowHeight);
    }
  }

  setSkin(skinId) {
    if (this.skin === skinId) return;
    this.skin = skinId;
    this.size = this.skin === 'knight' ? Math.round(88 * 1.1) : this.baseSize;
    this.shadowOffsetY = this.skin === 'knight' ? 33 : 38;
    this.restoreDisplaySize();
    if (this.shadow) {
      this.shadow.y = this.getY() + this.shadowOffsetY;
    }
    const idleTex = this.getTextureKey('idle');
    if (this.scene.textures.exists(idleTex)) {
      this.sprite.setTexture(idleTex, 0);
      this.restoreDisplaySize();
    }
    if (this.sprite.body) {
      const bodyRadius = Math.round(this.size * 0.3);
      const bodyOffset = (this.size - bodyRadius * 2) / 2;
      this.sprite.body.setCircle(bodyRadius, bodyOffset, bodyOffset);
    }
    const animKey = `${this.getAnimPrefix()}_${this.isMoving ? 'walk' : 'idle'}_${this.facing}`;
    if (this.sprite.anims && this.scene.anims.exists(animKey)) {
      this.sprite.play(animKey, true);
    }
    this.updateHeadBadge();
    this.updateAccessory();
  }

  static initAnimations(scene) {
    if (!scene.anims) return;

    // --- 1. HOẠT ẢNH BÉ SÂU CƠ BẢN ---
    if (!scene.anims.exists('hero_walk_down')) {
      if (scene.textures.exists('hero_walk_sheet')) {
        scene.anims.create({
          key: 'hero_walk_down',
          frames: scene.anims.generateFrameNumbers('hero_walk_sheet', { start: 0, end: 7 }),
          frameRate: 10,
          repeat: -1
        });
        scene.anims.create({
          key: 'hero_walk_right',
          frames: scene.anims.generateFrameNumbers('hero_walk_sheet', { start: 8, end: 15 }),
          frameRate: 10,
          repeat: -1
        });
        scene.anims.create({
          key: 'hero_walk_up',
          frames: scene.anims.generateFrameNumbers('hero_walk_sheet', { start: 16, end: 23 }),
          frameRate: 10,
          repeat: -1
        });
        scene.anims.create({
          key: 'hero_walk_left',
          frames: scene.anims.generateFrameNumbers('hero_walk_sheet', { start: 24, end: 31 }),
          frameRate: 10,
          repeat: -1
        });
      }

      if (scene.textures.exists('hero_idle_sheet')) {
        scene.anims.create({
          key: 'hero_idle_down', frames: scene.anims.generateFrameNumbers('hero_idle_sheet', { start: 0, end: 0 }), frameRate: 1, repeat: 0
        });
        scene.anims.create({
          key: 'hero_idle_right', frames: scene.anims.generateFrameNumbers('hero_idle_sheet', { start: 8, end: 8 }), frameRate: 1, repeat: 0
        });
        scene.anims.create({
          key: 'hero_idle_up', frames: scene.anims.generateFrameNumbers('hero_idle_sheet', { start: 16, end: 16 }), frameRate: 1, repeat: 0
        });
        scene.anims.create({
          key: 'hero_idle_left', frames: scene.anims.generateFrameNumbers('hero_idle_sheet', { start: 24, end: 24 }), frameRate: 1, repeat: 0
        });
      }
    }

    // --- 2. HOẠT ẢNH BÉ SÂU HIỆP SĨ CẦU VỒNG (NÂNG CẤP) ---
    if (!scene.anims.exists('hero_knight_walk_down')) {
      if (scene.textures.exists('hero_upgrade_walk_sheet')) {
        scene.anims.create({
          key: 'hero_knight_walk_down',
          frames: scene.anims.generateFrameNumbers('hero_upgrade_walk_sheet', { start: 0, end: 7 }),
          frameRate: 10,
          repeat: -1
        });
        scene.anims.create({
          key: 'hero_knight_walk_right',
          frames: scene.anims.generateFrameNumbers('hero_upgrade_walk_sheet', { start: 8, end: 15 }),
          frameRate: 10,
          repeat: -1
        });
        scene.anims.create({
          key: 'hero_knight_walk_up',
          frames: scene.anims.generateFrameNumbers('hero_upgrade_walk_sheet', { start: 16, end: 23 }),
          frameRate: 10,
          repeat: -1
        });
        scene.anims.create({
          key: 'hero_knight_walk_left',
          frames: scene.anims.generateFrameNumbers('hero_upgrade_walk_sheet', { start: 24, end: 31 }),
          frameRate: 10,
          repeat: -1
        });
      }

      if (scene.textures.exists('hero_upgrade_idle_sheet')) {
        scene.anims.create({
          key: 'hero_knight_idle_down', frames: scene.anims.generateFrameNumbers('hero_upgrade_idle_sheet', { start: 0, end: 0 }), frameRate: 1, repeat: 0
        });
        scene.anims.create({
          key: 'hero_knight_idle_right', frames: scene.anims.generateFrameNumbers('hero_upgrade_idle_sheet', { start: 8, end: 8 }), frameRate: 1, repeat: 0
        });
        scene.anims.create({
          key: 'hero_knight_idle_up', frames: scene.anims.generateFrameNumbers('hero_upgrade_idle_sheet', { start: 16, end: 16 }), frameRate: 1, repeat: 0
        });
        scene.anims.create({
          key: 'hero_knight_idle_left', frames: scene.anims.generateFrameNumbers('hero_upgrade_idle_sheet', { start: 24, end: 24 }), frameRate: 1, repeat: 0
        });
      }
    }
  }

  move(moveX, moveY, dirX, dirY) {
    // Mở rộng toàn bộ bản đồ, không bị giới hạn vùng di chuyển (toàn bộ khung 1280x720)
    let newX = Math.max(40, Math.min(1240, this.getX() + moveX));
    let newY = Math.max(65, Math.min(665, this.getY() + moveY));

    // Kiểm tra cấm đi vào khu vực hồ nước ở Map 1 (Làng Quê Yên Bình) và Hồ Câu Lá Sen (map_fishing_pond)
    const isMap1 = this.scene?.currentMapId === 'map1' || !this.scene?.currentMapId;
    const isPondMap = this.scene?.currentMapId === 'map_fishing_pond';
    const pondZone = this.scene?.mapConfig?.pondWaterZone;
    const footOffset = this.skin === 'knight' ? 35 : 44;
    if (isMap1 && isPointInLake(newX, newY + footOffset)) {
      // Trượt tự nhiên theo bờ hồ (Wall-sliding along lake shore)
      if (!isPointInLake(newX, this.getY() + footOffset)) {
        newY = this.getY();
      } else if (!isPointInLake(this.getX(), newY + footOffset)) {
        newX = this.getX();
      } else {
        // Đẩy êm về mép bờ đất
        const safe = clampOutOfLake(newX, newY + footOffset, 12);
        newX = safe.x;
        newY = safe.y - footOffset;
      }
    } else if (isPondMap && pondZone && this.isPointInPondWater(newX, newY + footOffset, pondZone)) {
      if (!this.isPointInPondWater(newX, this.getY() + footOffset, pondZone)) {
        newY = this.getY();
      } else if (!this.isPointInPondWater(this.getX(), newY + footOffset, pondZone)) {
        newX = this.getX();
      } else {
        const safe = this.clampOutOfPondWater(newX, newY + footOffset, pondZone, 14);
        newX = safe.x;
        newY = safe.y - footOffset;
      }
    }

    this.setPosition(newX, newY);

    // Xác định hướng nhìn chính
    if (Math.abs(dirX) > Math.abs(dirY)) {
      this.facing = dirX > 0 ? 'right' : 'left';
    } else if (Math.abs(dirY) > 0) {
      this.facing = dirY > 0 ? 'down' : 'up';
    }

    this.isMoving = true;
    const animKey = `${this.getAnimPrefix()}_walk_${this.facing}`;
    if (this.sprite.anims && this.scene.anims.exists(animKey)) {
      this.sprite.play(animKey, true);
    }
  }

  stop() {
    this.isMoving = false;
    if (this.sprite?.anims) {
      this.sprite.anims.stop();
      const frameMap = { down: 0, right: 8, up: 16, left: 24 };
      const frameIdx = frameMap[this.facing] ?? 0;
      const idleTex = this.getTextureKey('idle');
      if (this.scene.textures.exists(idleTex)) {
        this.sprite.setTexture(idleTex, frameIdx);
      }
    }
    this.updateAccessory();
  }

  isPointInPondWater(x, y, zone) {
    if (!zone) return false;
    if (this.isPointOnPondDock(x, y, zone)) {
      return false;
    }
    const rad = ((zone.angle || 7) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = x - zone.cx;
    const dy = y - zone.cy;
    const nx = cos * dx + sin * dy;
    const ny = -sin * dx + cos * dy;
    const rx = zone.rx || 305;
    const ry = zone.ry || 175;
    return (nx * nx) / (rx * rx) + (ny * ny) / (ry * ry) < 1;
  }

  isPointOnPondDock(x, y, zone) {
    if (!zone) return false;
    const poly = zone.dockPoly;
    if (poly && poly.length >= 3) {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x, yi = poly[i].y;
        const xj = poly[j].x, yj = poly[j].y;
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    }
    if (zone.walkableDockRect) {
      const d = zone.walkableDockRect;
      return x >= d.xMin && x <= d.xMax && y >= d.yMin && y <= d.yMax;
    }
    return false;
  }

  clampOutOfPondWater(x, y, zone, pad = 14) {
    if (!zone || !this.isPointInPondWater(x, y, zone)) return { x, y };

    const rad = ((zone.angle || 7) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = x - zone.cx;
    const dy = y - zone.cy;
    const nx = cos * dx + sin * dy;
    const ny = -sin * dx + cos * dy;
    const rx = zone.rx || 305;
    const ry = zone.ry || 175;

    const angle = Math.atan2(ny / ry, nx / rx);
    const safeNx = Math.cos(angle) * (rx + pad);
    const safeNy = Math.sin(angle) * (ry + pad);

    return {
      x: Math.round(zone.cx + cos * safeNx - sin * safeNy),
      y: Math.round(zone.cy + sin * safeNx + cos * safeNy)
    };
  }

  moveTo(targetX, targetY, onComplete) {
    // Kiểm tra cấm mục tiêu rơi vào trong hồ nước ở Map 1 và Hồ Câu Lá Sen
    const isMap1 = this.scene?.currentMapId === 'map1' || !this.scene?.currentMapId;
    const isPondMap = this.scene?.currentMapId === 'map_fishing_pond';
    const pondZone = this.scene?.mapConfig?.pondWaterZone;
    let safeTargetX = targetX;
    let safeTargetY = targetY;
    const footOffset = this.skin === 'knight' ? 35 : 44;

    if (isMap1 && isPointInLake(safeTargetX, safeTargetY + footOffset)) {
      const safe = clampOutOfLake(safeTargetX, safeTargetY + footOffset, 14);
      safeTargetX = safe.x;
      safeTargetY = safe.y - footOffset;
    } else if (isPondMap && pondZone && this.isPointInPondWater(safeTargetX, safeTargetY + footOffset, pondZone)) {
      const safe = this.clampOutOfPondWater(safeTargetX, safeTargetY + footOffset, pondZone, 14);
      safeTargetX = safe.x;
      safeTargetY = safe.y - footOffset;
    }

    // Mở rộng toàn bộ bản đồ, cho phép Bé Sâu tự do đi đến bất kỳ điểm nào trên màn chơi
    const clampedX = Math.max(40, Math.min(1240, safeTargetX));
    const clampedY = Math.max(65, Math.min(665, safeTargetY));

    this.scene.tweens.killTweensOf(this.sprite);
    const deltaX = clampedX - this.getX();
    const deltaY = clampedY - this.getY();
    const dist = Math.hypot(deltaX, deltaY);

    if (dist < 4) {
      this.stop();
      if (onComplete) onComplete();
      return;
    }

    // Đặt hướng quay
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      this.facing = deltaX > 0 ? 'right' : 'left';
    } else {
      this.facing = deltaY > 0 ? 'down' : 'up';
    }

    this.isMoving = true;
    const animKey = `${this.getAnimPrefix()}_walk_${this.facing}`;
    if (this.sprite.anims && this.scene.anims.exists(animKey)) {
      this.sprite.play(animKey, true);
    }

    // Tốc độ di chuyển nhịp nhàng, êm dịu: duration = (dist / speed) * 1000
    const moveSpeed = this.speed || 165;
    const duration = Math.max(220, Math.round((dist / moveSpeed) * 1000));

    this.scene.tweens.add({
      targets: this.sprite,
      x: clampedX,
      y: clampedY,
      duration,
      ease: 'Linear',
      onUpdate: () => {
        if (isPondMap && pondZone && this.isPointInPondWater(this.sprite.x, this.sprite.y + footOffset, pondZone)) {
          const safeStep = this.clampOutOfPondWater(this.sprite.x, this.sprite.y + footOffset, pondZone, 12);
          this.sprite.x = safeStep.x;
          this.sprite.y = safeStep.y - footOffset;
        }
        this.sprite.setDepth(Math.floor(this.sprite.y + 35));
        this.updateShadow();
        if (this.coordGuide) this.coordGuide.update();
        if (this.label) {
          this.label.setPosition(this.sprite.x, this.sprite.y);
          this.label.setDepth(Math.floor(this.sprite.y + 36));
        }
        this.updateHeadBadge();
    this.updateAccessory();
      },
      onComplete: () => {
        this.stop();
        if (onComplete) onComplete();
      }
    });
  }

  updateShadow() {
    if (this.shadow?.active && this.sprite?.active) {
      const offset = this.shadowOffsetY || 38;
      this.shadow.setPosition(this.sprite.x, this.sprite.y + offset);
      this.shadow.setDepth(Math.max(1, Math.floor(this.sprite.y + 14)));
    }
  }

  setPosition(x, y) {
    this.sprite.setPosition(x, y);
    this.sprite.setDepth(Math.floor(y + 35));
    if (this.label) {
      this.label.setPosition(x, y);
      this.label.setDepth(Math.floor(y + 36));
    }
    this.updateShadow();
    if (this.coordGuide) this.coordGuide.update();
    this.updateHeadBadge();
    this.updateAccessory();
  }

  getX() { return this.sprite.x; }
  getY() { return this.sprite.y; }

  setHeadBadge(badgeData) {
    this.clearHeadBadge();
    this.clearAccessory();
    if (!badgeData || !this.scene?.add) return;

    this.headBadgeData = badgeData;
    const badgeText = `${badgeData.icon || '🏅'} ${badgeData.shortTitle || badgeData.title || ''}`;

    const headOffsetY = this.skin === 'knight' ? 58 : 64;
    this.headBadgeContainer = this.scene.add.container(this.getX(), this.getY() - headOffsetY);
    this.headBadgeContainer.setDepth(Math.floor(this.getY() + 85));

    // Inner container for smooth bobbing float tween
    const inner = this.scene.add.container(0, 0);

    const label = this.scene.add.text(0, 0, badgeText, {
      fontFamily: '"Nunito", "Quicksand", system-ui, sans-serif',
      fontSize: '12.5px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#3b1704',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 1, color: 'rgba(0,0,0,0.5)', blur: 2, fill: true }
    }).setOrigin(0.5);

    const padX = 12;
    const padY = 5;
    const pillWidth = Math.max(74, label.width + padX * 2);
    const pillHeight = Math.max(25, label.height + padY * 2);

    const bg = this.scene.add.graphics();
    bg.lineStyle(2.5, 0xfbbf24, 0.95);
    bg.fillStyle(0x0f172a, 0.82);
    bg.fillRoundedRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, pillHeight / 2);
    bg.strokeRoundedRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, pillHeight / 2);

    const leftStar = this.scene.add.text(-pillWidth / 2 + 7, -1, '✨', { fontSize: '9px' }).setOrigin(0.5);
    const rightStar = this.scene.add.text(pillWidth / 2 - 7, -1, '✨', { fontSize: '9px' }).setOrigin(0.5);

    inner.add([bg, label, leftStar, rightStar]);
    this.headBadgeContainer.add(inner);

    if (this.scene.tweens) {
      this.headBadgeTween = this.scene.tweens.add({
        targets: inner,
        y: -4,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  clearHeadBadge() {
    if (this.headBadgeTween) {
      this.headBadgeTween.stop();
      this.headBadgeTween = null;
    }
    if (this.headBadgeContainer) {
      this.headBadgeContainer.destroy();
      this.headBadgeContainer = null;
    }
    this.headBadgeData = null;
  }

  updateHeadBadge() {
    if (this.headBadgeContainer?.active) {
      const headOffsetY = this.skin === 'knight' ? 58 : 64;
      this.headBadgeContainer.setPosition(this.getX(), this.getY() - headOffsetY);
      this.headBadgeContainer.setDepth(Math.floor(this.getY() + 85));
    }
  }

  setAccessory(accessoryId) {
    this.clearAccessory();
    if (!accessoryId || !this.scene?.add) return;

    this.accessoryId = accessoryId;
    const config = ACCESSORY_RENDER_CONFIG[accessoryId] || {
      slot: 'head',
      layer: 'front',
      offsetY: -35,
      offsetX: 0,
      width: 44,
      height: 44,
      bobbing: false
    };

    const effectiveOffsetY = this.skin === 'knight'
      ? (config.knightOffsetY !== undefined ? config.knightOffsetY : (config.slot === 'head' ? config.offsetY + 14 : config.offsetY))
      : config.offsetY;

    if (this.scene.textures.exists(accessoryId)) {
      this.accessorySprite = this.scene.add.image(this.getX(), this.getY() + effectiveOffsetY, accessoryId);
      this.accessorySprite.setDisplaySize(config.width, config.height);
      this.accessorySprite.setOrigin(0.5, 0.5);

      this.updateAccessory();
    }
  }

  clearAccessory() {
    if (this.accessoryTween) {
      this.accessoryTween.stop();
      this.accessoryTween = null;
    }
    if (this.accessorySprite) {
      this.accessorySprite.destroy();
      this.accessorySprite = null;
    }
    this.accessoryId = null;
  }

  updateAccessory() {
    if (!this.accessorySprite?.active || !this.accessoryId) return;

    const config = ACCESSORY_RENDER_CONFIG[this.accessoryId] || {
      slot: 'head',
      layer: 'front',
      offsetY: -35,
      offsetX: 0
    };

    // Khi nhân vật nhìn lên (hướng lưng up), ẩn kính mắt phía trước
    if (config.slot === 'face') {
      if (this.facing === 'up') {
        this.accessorySprite.setVisible(false);
      } else {
        this.accessorySprite.setVisible(true);
      }
    } else {
      this.accessorySprite.setVisible(true);
    }

    const effectiveOffsetY = this.skin === 'knight'
      ? (config.knightOffsetY !== undefined ? config.knightOffsetY : (config.slot === 'head' ? config.offsetY + 14 : config.offsetY))
      : config.offsetY;

    const effectiveOffsetX = this.skin === 'knight'
      ? (config.knightOffsetX !== undefined ? config.knightOffsetX : (config.offsetX || 0))
      : (config.offsetX || 0);

    const horizOffset = config.slot === 'hand'
      ? (this.facing === 'left' ? -(effectiveOffsetX || 16) : (effectiveOffsetX || 16))
      : (this.facing === 'left' ? -(effectiveOffsetX || 0) : (this.facing === 'right' ? (effectiveOffsetX || 0) : 0));

    const bobOffsetY = (config.bobbing && this.scene?.time)
      ? Math.sin(this.scene.time.now / 350) * 3
      : 0;

    this.accessorySprite.setPosition(this.getX() + horizOffset, this.getY() + effectiveOffsetY + bobOffsetY);

    if (this.facing === 'left') {
      this.accessorySprite.setFlipX(true);
    } else {
      this.accessorySprite.setFlipX(false);
    }

    if (config.layer === 'back') {
      if (this.facing === 'up') {
        this.accessorySprite.setDepth(this.sprite.depth + 1);
      } else {
        this.accessorySprite.setDepth(Math.max(1, this.sprite.depth - 1));
      }
    } else {
      this.accessorySprite.setDepth(this.sprite.depth + 2);
    }
  }

  onPortalWarpStart({ targetX, targetY, duration = 850 } = {}) {
    this.stop();
    const destX = targetX !== undefined ? targetX : this.getX();
    const destY = targetY !== undefined ? targetY : this.getY();

    // Hiệu ứng hút xoáy vào tâm Cổng Thần Kỳ (Implosion Vortex Pull):
    // Bé Sâu quay tròn xoáy ốc (angle 720), thu nhỏ dần về 0 và biến mất tại tâm điểm
    if (this.sprite) {
      this.scene.tweens.add({
        targets: this.sprite,
        x: destX,
        y: destY - 6,
        scaleX: 0,
        scaleY: 0,
        angle: 720,
        alpha: 0,
        duration,
        ease: 'Quad.easeIn'
      });
    }

    if (this.shadow) {
      this.scene.tweens.add({
        targets: this.shadow,
        x: destX,
        y: destY - 4,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration,
        ease: 'Quad.easeIn'
      });
    }

    if (this.accessorySprite) {
      this.scene.tweens.add({
        targets: this.accessorySprite,
        x: destX,
        y: destY - 6,
        scaleX: 0,
        scaleY: 0,
        angle: 720,
        alpha: 0,
        duration,
        ease: 'Quad.easeIn'
      });
    }

    if (this.headBadgeContainer) {
      this.scene.tweens.add({
        targets: this.headBadgeContainer,
        x: destX,
        y: destY - 6,
        scaleX: 0,
        scaleY: 0,
        angle: 720,
        alpha: 0,
        duration: Math.min(650, duration),
        ease: 'Quad.easeIn'
      });
    }
  }

  onPortalWarpComplete() {
    this.isMoving = false;
    this.restoreDisplaySize();
    if (this.sprite) {
      this.sprite.setAngle(0);
      this.sprite.setAlpha(1);
    }
    if (this.shadow) {
      this.shadow.setAlpha(1);
    }
    if (this.accessorySprite) {
      this.accessorySprite.setAngle(0);
      this.accessorySprite.setAlpha(1);
      const config = ACCESSORY_RENDER_CONFIG[this.accessoryId];
      if (config) {
        this.accessorySprite.setDisplaySize(config.width, config.height);
      }
      this.updateAccessory();
    }
    if (this.headBadgeContainer) {
      this.headBadgeContainer.setAngle(0);
      this.headBadgeContainer.setScale(1);
      this.headBadgeContainer.setAlpha(1);
    }
  }

  playLevelUpVFX() {
    if (!this.scene?.add) return null;

    if (!this.scene.anims.exists('vfx_level_up_anim') && this.scene.textures.exists('vfx_level_up_sheet')) {
      this.scene.anims.create({
        key: 'vfx_level_up_anim',
        frames: this.scene.anims.generateFrameNumbers('vfx_level_up_sheet', { start: 0, end: 96 }),
        frameRate: 30,
        repeat: 0
      });
    }

    if (!this.scene.anims.exists('vfx_level_up_anim')) return null;

    // Tọa độ hiển thị hiệu ứng: nâng lên 26px để dòng chữ "LEVEL UP!" nổi bật trọn vẹn ngay trên đỉnh đầu nhân vật
    const feetOffsetY = this.skin === 'knight' ? 33 : 38;
    const vfxOffsetY = feetOffsetY - 26;
    const startX = this.getX();
    const startY = this.getY();

    // Sprite VFX Level Up (97 frames pixel-art VFX)
    // Pivot [88, 114] trên kích thước [176, 138] -> Cột sáng vàng vươn lên từ chân và chữ LEVEL UP! tỏa sáng rực rỡ ngay trên đỉnh đầu
    const vfxSprite = this.scene.add.sprite(startX, startY + vfxOffsetY, 'vfx_level_up_sheet');
    vfxSprite.setOrigin(88 / 176, 114 / 138);
    vfxSprite.setScale(1.4); // Phóng nhẹ 1.4x để bao trọn cơ thể bé 110px và chữ LEVEL UP! nổi bật rõ ràng
    vfxSprite.setDepth(Math.floor(startY + 95));
    vfxSprite.play('vfx_level_up_anim');

    // Vòng hào quang vàng kim bừng sáng dưới chân (Golden ground aura pulse)
    const groundPulse = this.scene.add.ellipse(startX, startY + feetOffsetY, 92, 38, 0xfacc15, 0.45);
    groundPulse.setStrokeStyle(3, 0xffffff, 0.9).setDepth(Math.floor(startY + 15));
    this.scene.tweens.add({
      targets: groundPulse,
      scaleX: 1.6,
      scaleY: 1.6,
      alpha: 0,
      duration: 1250,
      repeat: 1,
      onComplete: () => groundPulse.destroy()
    });

    // 14 hạt bụi sao vàng kim bay lơ lửng bốc lên xung quanh (Floating sparkles)
    const sparkChars = ['✨', '⭐', '✦', '💫', '🌟'];
    for (let i = 0; i < 14; i++) {
      const offsetX = (i % 2 === 0 ? 1 : -1) * (15 + (i * 7) % 35);
      const sp = this.scene.add.text(
        startX + offsetX,
        startY + feetOffsetY + ((i * 5) % 20 - 10),
        sparkChars[i % sparkChars.length],
        { fontSize: '13px' }
      ).setOrigin(0.5).setDepth(Math.floor(startY + 96)).setAlpha(0);

      this.scene.tweens.add({
        targets: sp,
        y: sp.y - (65 + (i * 9) % 45),
        alpha: { from: 0.95, to: 0 },
        scale: { from: 0.8, to: 1.35 },
        duration: 900 + i * 120,
        delay: 200 + i * 80,
        ease: 'Quad.easeOut',
        onComplete: () => sp.destroy()
      });
    }

    // Nhịp nhảy nhót ăn mừng dễ thương của nhân vật khi thăng cấp
    if (this.sprite) {
      this.scene.tweens.add({
        targets: [this.sprite, this.accessorySprite].filter(Boolean),
        y: '-=12',
        duration: 220,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut'
      });
    }

    // Bám theo vị trí nhân vật nếu bé đang di chuyển
    const followTimer = this.scene.time.addEvent({
      delay: 16,
      repeat: 200, // ~3.2s
      callback: () => {
        if (!vfxSprite || !vfxSprite.active) {
          followTimer.remove();
          return;
        }
        vfxSprite.setPosition(this.getX(), this.getY() + vfxOffsetY);
        vfxSprite.setDepth(Math.floor(this.getY() + 95));
      }
    });

    vfxSprite.on('animationcomplete', () => {
      followTimer.remove();
      vfxSprite.destroy();
    });

    return vfxSprite;
  }

  destroy() {
    this.clearHeadBadge();
    if (this.idleTween) this.idleTween.stop();
    if (this.coordGuide) {
      this.coordGuide.destroy();
      this.coordGuide = null;
    }
    if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null;
    }
    if (this.label) this.label.destroy();
    if (this.sprite) this.sprite.destroy();
  }
}
