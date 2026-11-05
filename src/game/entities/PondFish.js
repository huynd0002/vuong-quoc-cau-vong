import * as Phaser from 'phaser';

/**
 * src/game/entities/PondFish.js
 * Thực thể Cá Bơi Trong Hồ Câu Lá Sen (Requirement 5):
 * - Bơi lội 8 hướng (E, SE, S, SW, W, NW, N, NE) tự nhiên trong lòng hồ (Row 0 & Row 1: frames 0..15)
 * - Hành động Ngoi lên mặt nước thở bong bóng (Row 2 cols 0..3: frames 16..19)
 * - Hành động Lặn xuống sâu (Row 2 cols 4..7: frames 20..23)
 * - Hành động Bị bắt & kéo văng lên bờ cầu gỗ giãy dụa (Row 3 cols 0..7: frames 24..31)
 */
export class PondFish {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.id = config.id || `pond_fish_${Math.random().toString(36).slice(2, 7)}`;
    this.textureKey = config.textureKey || 'fish_pond_swim_8dir';
    this.pondBounds = config.pondBounds || {
      cx: 475,
      cy: 430,
      rx: 185,
      ry: 118
    };

    const startPos = config.x && config.y
      ? { x: config.x, y: config.y }
      : this.pickSafePondPoint();

    this.x = startPos.x;
    this.y = startPos.y;
    this.scale = config.scale || 0.44;
    this.speed = config.speed || 42;

    // 8 hướng chuẩn: 0:E, 1:SE, 2:S, 3:SW, 4:W, 5:NW, 6:N, 7:NE
    this.dirIndex = config.dirIndex ?? Math.floor(Math.random() * 8);
    this.wiggleFrame = 0; // 0 hoặc 1 (Row 0 vs Row 1)
    this.wiggleTimer = 0;

    // States: 'swimming' | 'surfacing' | 'diving' | 'approaching' | 'biting' | 'caught_ashore'
    this.state = 'swimming';
    this.actionFrameIdx = 0;
    this.actionTimer = 0;
    this.nextSurfaceCooldown = Phaser.Math.Between(3200, 7800);

    // Bóng cá dưới mặt nước
    this.shadow = scene.add.ellipse(this.x, this.y + 10, 38, 16, 0x064e3b, 0.25);
    this.shadow.setDepth(18);

    // Vòng sóng nước quanh cá khi ngoi lên
    this.ripple = scene.add.ellipse(this.x, this.y + 4, 42, 20, 0xe0f2fe, 0);
    this.ripple.setStrokeStyle(2, 0xbae6fd, 0.75);
    this.ripple.setDepth(19);

    // Sprite chính của cá
    this.sprite = scene.add.sprite(this.x, this.y, this.textureKey, this.dirIndex);
    this.sprite.setScale(this.scale);
    this.sprite.setAlpha(0.84);
    this.sprite.setDepth(20);

    const nextTarget = this.pickSafePondPoint();
    this.targetX = nextTarget.x;
    this.targetY = nextTarget.y;
  }

  isSafeWaterPoint(x, y) {
    // 1. Tuyệt đối không bao giờ bơi qua hoặc chạm cầu gỗ (x >= 548)
    if (x >= 548) {
      return false;
    }
    // 2. Không chạm bờ cỏ trái, bờ trên, bờ dưới
    if (x <= 285 || y <= 305 || y >= 535) {
      return false;
    }
    // 3. Nằm trọn vẹn trong lòng hồ an toàn
    const cx = this.pondBounds?.cx || 425;
    const cy = this.pondBounds?.cy || 425;
    const rx = this.pondBounds?.rx || 135;
    const ry = this.pondBounds?.ry || 95;
    const dx = x - cx;
    const dy = y - cy;
    return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 0.82;
  }

  pickSafePondPoint() {
    const cx = this.pondBounds?.cx || 425;
    const cy = this.pondBounds?.cy || 425;
    const rx = this.pondBounds?.rx || 135;
    const ry = this.pondBounds?.ry || 95;
    for (let attempt = 0; attempt < 25; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.78;
      const px = Math.round(cx + Math.cos(angle) * rx * r);
      const py = Math.round(cy + Math.sin(angle) * ry * r);
      if (this.isSafeWaterPoint(px, py)) {
        return { x: px, y: py };
      }
    }
    return { x: 410, y: 420 };
  }

  /**
   * Tính chỉ số 8 hướng (0..7) từ vector vận tốc (dx, dy)
   * 0: E (Phải), 1: SE (Đông Nam), 2: S (Xuống), 3: SW (Tây Nam),
   * 4: W (Trái), 5: NW (Tây Bắc), 6: N (Lên), 7: NE (Đông Bắc)
   */
  compute8DirIndex(dx, dy) {
    const angle = Math.atan2(dy, dx); // -PI .. PI, 0 là hướng Đông (E)
    const octant = Math.round((angle / (Math.PI * 2)) * 8);
    return ((octant % 8) + 8) % 8;
  }

  /**
   * Bắt đầu hành động Ngoi lên mặt nước (Row 2 cols 0..3: frames 16..19)
   */
  startSurfacing() {
    if (this.state === 'caught_ashore') return;
    this.state = 'surfacing';
    this.actionFrameIdx = 0;
    this.actionTimer = 0;
    this.sprite.setAlpha(0.98);
    this.sprite.setFrame(16);
    this.spawnSurfaceRipple();
  }

  /**
   * Bắt đầu hành động Lặn xuống sâu (Row 2 cols 4..7: frames 20..23)
   */
  startDiving() {
    if (this.state === 'caught_ashore') return;
    this.state = 'diving';
    this.actionFrameIdx = 0;
    this.actionTimer = 0;
    this.sprite.setFrame(20);
    this.spawnSurfaceRipple();
  }

  /**
   * Khi bé thả phao, gọi cá bơi 8 hướng về phía phao
   */
  approachBobber(bobberX, bobberY) {
    if (this.state === 'caught_ashore') return;
    this.state = 'approaching';
    // Giới hạn phao cá bơi tới luôn nằm trong vùng nước an toàn
    const safeTargetX = Math.max(305, Math.min(540, bobberX));
    const safeTargetY = Math.max(315, Math.min(525, bobberY));
    this.targetX = safeTargetX + Phaser.Math.Between(-14, 14);
    this.targetY = safeTargetY + Phaser.Math.Between(-10, 10);
    this.sprite.setAlpha(0.92);
  }

  /**
   * Khi cá cắn phao (hook / pull): cá ngoi lên đớp phao và quẫy nước
   */
  biteAtBobber(bobberX, bobberY) {
    if (this.state === 'caught_ashore') return;
    this.state = 'biting';
    this.x = bobberX + 8;
    this.y = bobberY + 6;
    this.syncPositions();
    this.sprite.setAlpha(1);
    this.sprite.setFrame(17);
    this.spawnSurfaceRipple(1.35);
  }

  /**
   * Hành động khi cá bị bắt kéo văng từ mặt hồ lên bờ cầu gỗ (Row 3 cols 0..7: frames 24..31)
   */
  playCaughtPullAshore(fromX, fromY, shoreX, shoreY, onComplete) {
    this.state = 'caught_ashore';
    this.x = fromX;
    this.y = fromY;
    this.sprite.setPosition(fromX, fromY);
    this.sprite.setAlpha(1);
    this.sprite.setScale(this.scale * 1.28);
    this.sprite.setDepth(860);
    this.shadow.setDepth(855);
    this.sprite.setFrame(24);

    this.spawnSurfaceRipple(1.6);

    const midX = (fromX + shoreX) * 0.5;
    const peakY = Math.min(fromY, shoreY) - 135;
    const progressObj = { t: 0 };

    this.scene.tweens.add({
      targets: progressObj,
      t: 1,
      duration: 760,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        if (!this.sprite?.active) return;
        const t = progressObj.t;
        const inv = 1 - t;
        // Quỹ đạo Parabol bậc 2 văng từ hồ lên cầu gỗ
        const curX = inv * inv * fromX + 2 * inv * t * midX + t * t * shoreX;
        const curY = inv * inv * fromY + 2 * inv * t * peakY + t * t * shoreY;
        const groundY = fromY + (shoreY - fromY) * t;

        this.x = curX;
        this.y = curY;
        this.sprite.setPosition(curX, curY);
        if (this.shadow?.active) {
          this.shadow.setPosition(curX, groundY + 12);
        }

        // Đổi frame giãy dụa liên tục trên không (frames 24..31)
        const wriggleFrame = 24 + (Math.floor(t * 16) % 8);
        this.sprite.setFrame(wriggleFrame);
      },
      onComplete: () => {
        if (!this.sprite?.active) return;
        // Nảy nhẹ trên sàn cầu gỗ 2 nhịp trước khi hoàn tất
        this.scene.tweens.add({
          targets: this.sprite,
          y: shoreY - 14,
          duration: 130,
          yoyo: true,
          repeat: 1,
          onUpdate: () => {
            const wf = 24 + (Math.floor(Date.now() / 70) % 8);
            if (this.sprite?.active) this.sprite.setFrame(wf);
          },
          onComplete: () => {
            if (typeof onComplete === 'function') onComplete();
            // Sau 1.1s, cho cá mới lặn trở lại hồ để hồ luôn sinh động
            this.scene.time.delayedCall(1100, () => {
              this.resetBackToPond();
            });
          }
        });
      }
    });
  }

  /**
   * Cá vụt thoát lặn nhanh xuống sâu khi bé câu hụt (hụt 1 lần là mất cá luôn)
   */
  swimAway() {
    if (!this.sprite?.active) return;
    this.spawnSurfaceRipple(1.8);
    this.state = 'diving';
    if (this.scene?.tweens) {
      this.scene.tweens.killTweensOf(this.sprite);
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.15,
        scale: this.scale * 0.72,
        duration: 380,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          this.resetBackToPond();
        }
      });
    } else {
      this.resetBackToPond();
    }
  }

  resetBackToPond() {
    if (!this.sprite?.active) return;
    const pt = this.pickSafePondPoint();
    this.x = pt.x;
    this.y = pt.y;
    const nextPt = this.pickSafePondPoint();
    this.targetX = nextPt.x;
    this.targetY = nextPt.y;
    this.state = 'swimming';
    this.sprite.setScale(this.scale);
    this.sprite.setAlpha(0.84);
    this.sprite.setDepth(20);
    this.shadow.setDepth(18);
    this.syncPositions();
  }

  spawnSurfaceRipple(scaleMult = 1) {
    if (!this.ripple?.active || !this.scene?.tweens) return;
    this.ripple.setPosition(this.x, this.y + 4);
    this.ripple.setScale(0.45 * scaleMult);
    this.ripple.setAlpha(0.85);
    this.scene.tweens.killTweensOf(this.ripple);
    this.scene.tweens.add({
      targets: this.ripple,
      scaleX: 1.55 * scaleMult,
      scaleY: 1.45 * scaleMult,
      alpha: 0,
      duration: 680,
      ease: 'Cubic.easeOut'
    });
  }

  syncPositions() {
    if (this.sprite?.active) {
      this.sprite.setPosition(this.x, this.y);
    }
    if (this.shadow?.active) {
      this.shadow.setPosition(this.x, this.y + 10);
    }
  }

  update(delta = 16.6) {
    if (!this.sprite?.active) return;

    if (this.state === 'caught_ashore') {
      return;
    }

    if (this.state === 'biting') {
      this.actionTimer += delta;
      if (this.actionTimer >= 120) {
        this.actionTimer = 0;
        this.actionFrameIdx = (this.actionFrameIdx + 1) % 4;
        // Xen kẽ frame ngoi lên đớp mồi (16..19) và giãy nước (24..27)
        this.sprite.setFrame(16 + this.actionFrameIdx);
      }
      return;
    }

    if (this.state === 'surfacing') {
      this.actionTimer += delta;
      if (this.actionTimer >= 180) {
        this.actionTimer = 0;
        this.actionFrameIdx += 1;
        if (this.actionFrameIdx < 4) {
          this.sprite.setFrame(16 + this.actionFrameIdx);
        } else {
          // Chuyển sang Lặn xuống sau khi ngoi lên
          this.startDiving();
        }
      }
      return;
    }

    if (this.state === 'diving') {
      this.actionTimer += delta;
      if (this.actionTimer >= 170) {
        this.actionTimer = 0;
        this.actionFrameIdx += 1;
        if (this.actionFrameIdx < 4) {
          this.sprite.setFrame(20 + this.actionFrameIdx);
        } else {
          // Hoàn tất lặn xuống -> bơi tiếp 8 hướng
          this.state = 'swimming';
          this.sprite.setAlpha(0.84);
          this.nextSurfaceCooldown = Phaser.Math.Between(4200, 8800);
          const nextPt = this.pickSafePondPoint();
          this.targetX = nextPt.x;
          this.targetY = nextPt.y;
        }
      }
      return;
    }

    // Trạng thái 'swimming' hoặc 'approaching': Bơi 8 hướng
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 10) {
      if (this.state === 'approaching') {
        // Khi đã tới sát phao, ngoi lên thăm dò quanh phao
        this.startSurfacing();
        return;
      }
      const nextPt = this.pickSafePondPoint();
      this.targetX = nextPt.x;
      this.targetY = nextPt.y;
      return;
    }

    // Đảm bảo cá luôn ở trong vùng nước an toàn
    if (!this.isSafeWaterPoint(this.x, this.y) && this.state !== 'caught_ashore') {
      const safePt = this.pickSafePondPoint();
      this.x = safePt.x;
      this.y = safePt.y;
      this.targetX = safePt.x;
      this.targetY = safePt.y;
    }

    const moveSpeed = this.state === 'approaching' ? this.speed * 1.35 : this.speed;
    const step = (moveSpeed * delta) / 1000;
    const nx = this.x + (dx / dist) * step;
    const ny = this.y + (dy / dist) * step;

    if (this.isSafeWaterPoint(nx, ny)) {
      this.x = nx;
      this.y = ny;
    } else {
      const nextPt = this.pickSafePondPoint();
      this.targetX = nextPt.x;
      this.targetY = nextPt.y;
    }

    this.dirIndex = this.compute8DirIndex(dx, dy);
    this.wiggleTimer += delta;
    if (this.wiggleTimer >= 165) {
      this.wiggleTimer = 0;
      this.wiggleFrame = this.wiggleFrame === 0 ? 1 : 0;
    }

    const frameIndex = this.wiggleFrame * 8 + this.dirIndex;
    this.sprite.setFrame(frameIndex);
    this.syncPositions();

    // Định kỳ cho cá ngoi lên thở bong bóng rồi lặn xuống
    if (this.state === 'swimming') {
      this.nextSurfaceCooldown -= delta;
      if (this.nextSurfaceCooldown <= 0) {
        this.startSurfacing();
      }
    }
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null;
    }
    if (this.ripple) {
      this.ripple.destroy();
      this.ripple = null;
    }
  }
}
