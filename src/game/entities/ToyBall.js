import * as Phaser from 'phaser';
import { createGroundShadow } from '../effects/GroundShadow.js';

/**
 * ToyBall: Trái Banh Cầu Vồng Vui Nhộn
 * Hỗ trợ chuyển động lăn 3D 8 hướng mượt mà,
 * vật lý nảy (bouncing arcs) với bóng đổ chân thực (Ground Shadow),
 * kéo/thả/ném tương tác và tự động phản hồi khi cún con chạm vào.
 */
export class ToyBall {
  static initAnimations(scene) {
    if (!scene.anims) return;

    const animsConfig = [
      { key: 'ball_roll_right', start: 0, end: 7 },
      { key: 'ball_roll_down_right', start: 8, end: 15 },
      { key: 'ball_roll_down', start: 16, end: 23 },
      { key: 'ball_roll_down_left', start: 24, end: 31 },
      { key: 'ball_roll_left', start: 32, end: 39 },
      { key: 'ball_roll_up_left', start: 40, end: 47 },
      { key: 'ball_roll_up', start: 48, end: 55 },
      { key: 'ball_roll_up_right', start: 56, end: 63 }
    ];

    animsConfig.forEach(({ key, start, end }) => {
      if (!scene.anims.exists(key) && scene.textures.exists('prop_ball_sheet')) {
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers('prop_ball_sheet', { start, end }),
          frameRate: 14,
          repeat: -1
        });
      }
    });
  }

  constructor(scene, initialX = 770, initialY = 565) {
    this.scene = scene;
    this.x = initialX;
    this.y = initialY;
    this.z = 0; // Chiều cao nảy so với mặt đất

    this.isDragging = false;
    this.isBouncing = false;
    this.currentRollAnim = null;
    this.size = 64;

    // Vùng bãi cỏ an toàn trên map nông trại (không bay ra biển/hồ sen/chuồng)
    this.bounds = {
      minX: 330,
      maxX: 1080,
      minY: 440,
      maxY: 645
    };

    ToyBall.initAnimations(scene);

    // 1. Bóng đổ mềm chân thực dưới chân quả bóng
    this.shadow = createGroundShadow(scene, this.x, this.y + 22, 54, 20, 0.68).setDepth(2);

    // 2. Sprite quả bóng
    if (scene.textures.exists('prop_ball_sheet')) {
      this.sprite = scene.add.sprite(this.x, this.y, 'prop_ball_sheet', 0);
    } else if (scene.textures.exists('prop_ball')) {
      this.sprite = scene.add.sprite(this.x, this.y, 'prop_ball');
    } else {
      this.sprite = scene.add.text(this.x, this.y, '⚽', { fontSize: '48px' }).setOrigin(0.5);
    }
    this.sprite.setDisplaySize(this.size, this.size);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDepth(4);

    // 3. Tương tác Kéo / Thả / Ném bóng (Drag & Throw)
    this.sprite.setInteractive({ draggable: true, useHandCursor: true });
    scene.input.setDraggable(this.sprite);

    this.lastDragTime = 0;
    this.lastDragPos = { x: this.x, y: this.y };
    this.dragVel = { x: 0, y: 0 };
    this.activeTweens = [];

    this.initInteractionEvents();
  }

  initInteractionEvents() {
    this.sprite.on('dragstart', (pointer) => {
      this.isDragging = true;
      this.stopBounces();
      this.lastDragTime = Date.now();
      this.lastDragPos = { x: this.x, y: this.y };
      this.dragVel = { x: 0, y: 0 };

      // Nâng bóng lên một chút khi nhấc tay kéo (z = 18px)
      this.scene.tweens.add({
        targets: this,
        z: 18,
        duration: 120,
        ease: 'Quad.easeOut',
        onUpdate: () => this.updateVisualPosition()
      });

      // Báo hiệu cho cún con chú ý tới quả bóng
      if (this.scene.onBallDragStart) {
        this.scene.onBallDragStart(this);
      }
    });

    this.sprite.on('drag', (pointer, dragX, dragY) => {
      const now = Date.now();
      const dt = Math.max(16, now - this.lastDragTime);

      // Giới hạn trong vùng bãi cỏ
      const clampedX = Phaser.Math.Clamp(dragX, this.bounds.minX, this.bounds.maxX);
      const clampedY = Phaser.Math.Clamp(dragY, this.bounds.minY, this.bounds.maxY);

      // Tính vận tốc kéo tức thời
      this.dragVel.x = ((clampedX - this.lastDragPos.x) / dt) * 1000;
      this.dragVel.y = ((clampedY - this.lastDragPos.y) / dt) * 1000;
      this.lastDragTime = now;
      this.lastDragPos = { x: clampedX, y: clampedY };

      this.x = clampedX;
      this.y = clampedY;
      this.updateVisualPosition();

      // Khi kéo di chuyển bóng, phát hoạt ảnh lăn 8 hướng tương ứng
      const speed = Math.hypot(this.dragVel.x, this.dragVel.y);
      if (speed > 25) {
        this.playRollAnim(this.dragVel.x, this.dragVel.y);
      }

      // Thông báo cho cảnh và cún con cập nhật hướng nhìn/chạy theo
      if (this.scene.onBallDragged) {
        this.scene.onBallDragged(this);
      }
    });

    this.sprite.on('dragend', () => {
      this.isDragging = false;

      // Tính lực ném nếu người chơi vung tay thả bóng nhanh
      const speed = Math.hypot(this.dragVel.x, this.dragVel.y);
      if (speed > 160) {
        const throwDist = Math.min(240, speed * 0.28);
        const dirX = this.dragVel.x / speed;
        const dirY = this.dragVel.y / speed;

        const targetX = Phaser.Math.Clamp(this.x + dirX * throwDist, this.bounds.minX, this.bounds.maxX);
        const targetY = Phaser.Math.Clamp(this.y + dirY * throwDist, this.bounds.minY, this.bounds.maxY);

        this.bounceTo(targetX, targetY, { initialHeight: 28 });
      } else {
        // Thả bóng nhẹ rơi chạm đất với độ nhún đàn hồi
        this.dropToGround();
      }

      // Thông báo cho cảnh bắt đầu tiến trình cún con đuổi theo bóng
      if (this.scene.onBallReleased) {
        this.scene.onBallReleased(this);
      }
    });

    // Chạm nhẹ vào bóng nếu không kéo
    this.sprite.on('pointerdown', (pointer) => {
      if (!this.isDragging && !this.isBouncing) {
        this.nudgeTap();
        const playStation = this.scene.petStationContainers?.find(s => s.data.type === 'play')?.data;
        if (playStation) {
          this.scene.handlePetStationInteraction(playStation);
        }
      }
    });
  }

  /**
   * Phát hoạt ảnh lăn 3D đúng theo 8 hướng
   */
  playRollAnim(vx, vy) {
    let angle = Math.atan2(vy, vx);
    if (angle < 0) angle += 2 * Math.PI;

    // Chia 8 góc (mỗi góc 45 độ = PI/4)
    const sector = Math.round(angle / (Math.PI / 4)) % 8;
    const animKeys = [
      'ball_roll_right',       // 0: Phải
      'ball_roll_down_right',  // 1: Phải - Dưới
      'ball_roll_down',        // 2: Dưới
      'ball_roll_down_left',   // 3: Trái - Dưới
      'ball_roll_left',        // 4: Trái
      'ball_roll_up_left',     // 5: Trái - Trên
      'ball_roll_up',          // 6: Trên
      'ball_roll_up_right'     // 7: Phải - Trên
    ];

    const key = animKeys[sector];
    if (this.currentRollAnim !== key) {
      this.currentRollAnim = key;
      if (this.scene.anims.exists(key) && this.sprite.anims) {
        this.sprite.play(key, true);
      }
    }
  }

  stopRollAnim() {
    this.currentRollAnim = null;
    if (this.sprite.anims) {
      this.sprite.stop();
      this.sprite.setFrame(0);
    }
  }

  /**
   * Cập nhật vị trí hiển thị: Quả bóng bay lên z pixel, bóng đổ ở nguyên mặt đất
   */
  updateVisualPosition() {
    this.sprite.setPosition(this.x, this.y - this.z);
    if (this.shadow) {
      this.shadow.setPosition(this.x, this.y + 22);
      // Khi bóng bay cao, bóng đổ thu nhỏ và nhạt dần
      const shadowScale = Math.max(0.55, 1.0 - this.z / 160);
      this.shadow.setScale(shadowScale, shadowScale);
      this.shadow.setAlpha(Math.max(0.2, 0.68 - this.z / 220));
    }
  }

  /**
   * Thả bóng từ trên không xuống mặt đất với hiệu ứng đàn hồi nảy nhẹ
   */
  dropToGround() {
    this.stopBounces();
    const dropTween = this.scene.tweens.add({
      targets: this,
      z: 0,
      duration: 180,
      ease: 'Quad.easeIn',
      onUpdate: () => this.updateVisualPosition(),
      onComplete: () => {
        this.triggerSquashAndStretch();
        this.spawnBounceParticles();
        this.stopRollAnim();
      }
    });
    this.activeTweens.push(dropTween);
  }

  /**
   * Chạm nhẹ bóng nảy vui mắt
   */
  nudgeTap() {
    this.stopBounces();
    const jumpTween = this.scene.tweens.add({
      targets: this,
      z: 16,
      duration: 140,
      yoyo: true,
      ease: 'Quad.easeOut',
      onUpdate: () => this.updateVisualPosition(),
      onComplete: () => {
        this.triggerSquashAndStretch();
        this.spawnBounceParticles();
      }
    });
    this.activeTweens.push(jumpTween);
    if (this.scene.audioService) {
      this.scene.audioService.playChime(640, 0.08);
    }
  }

  /**
   * Hiệu ứng co giãn đàn hồi (Squash & Stretch) đặc trưng của hoạt hình khi chạm đất
   */
  triggerSquashAndStretch() {
    const baseDisplay = this.size;
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: (baseDisplay / 72) * 1.18,
      scaleY: (baseDisplay / 72) * 0.82,
      duration: 65,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.sprite.setDisplaySize(this.size, this.size);
      }
    });
  }

  /**
   * Di chuyển và nảy bóng (Bouncing Arcs) tới toạ độ mới với 3 nhịp nảy chân thực
   */
  bounceTo(targetX, targetY, options = {}) {
    this.stopBounces();
    this.isBouncing = true;

    // Giới hạn trong bãi cỏ an toàn
    const tx = Phaser.Math.Clamp(targetX, this.bounds.minX, this.bounds.maxX);
    const ty = Phaser.Math.Clamp(targetY, this.bounds.minY, this.bounds.maxY);

    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);

    // Bật hoạt ảnh lăn 8 hướng
    this.playRollAnim(dx, dy);

    // Thời gian nảy tỉ lệ với khoảng cách
    const totalDuration = Math.max(900, Math.min(1600, Math.round(dist * 3.6)));

    // 1. Chuyển động mặt phẳng ngang (X, Y)
    const moveTween = this.scene.tweens.add({
      targets: this,
      x: tx,
      y: ty,
      duration: totalDuration,
      ease: 'Cubic.easeOut',
      onUpdate: () => this.updateVisualPosition(),
      onComplete: () => {
        this.isBouncing = false;
        this.stopRollAnim();
        if (options.onComplete) options.onComplete();
      }
    });
    this.activeTweens.push(moveTween);

    // 2. Chuỗi 3 nhịp nảy hình parabol (Z)
    const initialH = options.initialHeight || 48;
    const h1 = initialH;
    const h2 = Math.round(initialH * 0.45);
    const h3 = Math.round(initialH * 0.18);

    const t1 = Math.round(totalDuration * 0.50);
    const t2 = Math.round(totalDuration * 0.32);
    const t3 = Math.max(120, totalDuration - t1 - t2);

    // Nhịp nảy 1
    const b1Up = this.scene.tweens.add({
      targets: this,
      z: h1,
      duration: Math.round(t1 * 0.48),
      ease: 'Quad.easeOut',
      onUpdate: () => this.updateVisualPosition(),
      onComplete: () => {
        const b1Down = this.scene.tweens.add({
          targets: this,
          z: 0,
          duration: Math.round(t1 * 0.52),
          ease: 'Quad.easeIn',
          onUpdate: () => this.updateVisualPosition(),
          onComplete: () => {
            this.triggerSquashAndStretch();
            this.spawnBounceParticles();
            if (this.scene.audioService) this.scene.audioService.playChime(600, 0.08);

            // Nhịp nảy 2
            const b2Up = this.scene.tweens.add({
              targets: this,
              z: h2,
              duration: Math.round(t2 * 0.48),
              ease: 'Quad.easeOut',
              onUpdate: () => this.updateVisualPosition(),
              onComplete: () => {
                const b2Down = this.scene.tweens.add({
                  targets: this,
                  z: 0,
                  duration: Math.round(t2 * 0.52),
                  ease: 'Quad.easeIn',
                  onUpdate: () => this.updateVisualPosition(),
                  onComplete: () => {
                    this.triggerSquashAndStretch();
                    this.spawnBounceParticles();

                    // Nhịp nảy 3 (nảy nhẹ kết thúc)
                    const b3Up = this.scene.tweens.add({
                      targets: this,
                      z: h3,
                      duration: Math.round(t3 * 0.48),
                      ease: 'Quad.easeOut',
                      onUpdate: () => this.updateVisualPosition(),
                      onComplete: () => {
                        const b3Down = this.scene.tweens.add({
                          targets: this,
                          z: 0,
                          duration: Math.round(t3 * 0.52),
                          ease: 'Quad.easeIn',
                          onUpdate: () => this.updateVisualPosition(),
                          onComplete: () => {
                            this.triggerSquashAndStretch();
                            this.z = 0;
                            this.updateVisualPosition();
                          }
                        });
                        this.activeTweens.push(b3Down);
                      }
                    });
                    this.activeTweens.push(b3Up);
                  }
                });
                this.activeTweens.push(b2Down);
              }
            });
            this.activeTweens.push(b2Up);
          }
        });
        this.activeTweens.push(b1Down);
      }
    });
    this.activeTweens.push(b1Up);
  }

  /**
   * Khi chó tương tác vào bóng, bóng nảy bật đi chỗ khác (Bouncing away from pet)
   */
  bounceAwayFrom(fromX, fromY, distance = 210, onComplete) {
    let dx = this.x - fromX;
    let dy = this.y - fromY;
    let angle = Math.atan2(dy, dx);

    // Nếu khoảng cách quá gần, chọn ngẫu nhiên một góc về hướng bãi cỏ thoáng
    if (Math.hypot(dx, dy) < 10) {
      angle = (Math.random() - 0.5) * Math.PI;
    } else {
      // Thêm chút ngẫu nhiên (+- 25 độ) cho sinh động
      angle += (Math.random() - 0.5) * 0.5;
    }

    let targetX = this.x + Math.cos(angle) * distance;
    let targetY = this.y + Math.sin(angle) * distance;

    // Nếu điểm đích lọt ra ngoài mép, phản xạ ngược vào tâm bãi cỏ
    if (targetX < this.bounds.minX || targetX > this.bounds.maxX ||
        targetY < this.bounds.minY || targetY > this.bounds.maxY) {
      const centerX = (this.bounds.minX + this.bounds.maxX) / 2;
      const centerY = (this.bounds.minY + this.bounds.maxY) / 2;
      targetX = centerX + (Math.random() * 200 - 100);
      targetY = centerY + (Math.random() * 120 - 60);
    }

    this.bounceTo(targetX, targetY, { initialHeight: 52, onComplete });
  }

  spawnBounceParticles() {
    if (!this.scene) return;
    const particles = ['✨', '🌿', '⭐'];
    const p = this.scene.add.text(
      this.x + (Math.random() * 20 - 10),
      this.y + 14,
      particles[Math.floor(Math.random() * particles.length)],
      { fontSize: '14px' }
    ).setOrigin(0.5).setDepth(5);

    this.scene.tweens.add({
      targets: p,
      y: p.y - 18,
      alpha: 0,
      scale: 0.3,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => p.destroy()
    });
  }

  stopBounces() {
    if (this.activeTweens && this.activeTweens.length > 0) {
      this.activeTweens.forEach(t => t.stop());
      this.activeTweens = [];
    }
    this.isBouncing = false;
  }

  destroy() {
    this.stopBounces();
    if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null;
    }
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
