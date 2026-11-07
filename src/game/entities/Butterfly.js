/**
 * 8-direction flight vectors and angles for butterflies.
 */
export const DIRECTIONS_8 = [
  { name: 'E',  vx: 1,                    vy: 0,                   tilt: 0,   flipX: false },
  { name: 'NE', vx: Math.SQRT1_2,         vy: -Math.SQRT1_2,       tilt: -12, flipX: false },
  { name: 'N',  vx: 0,                    vy: -1,                  tilt: -20, flipX: false },
  { name: 'NW', vx: -Math.SQRT1_2,        vy: -Math.SQRT1_2,       tilt: 12,  flipX: true  },
  { name: 'W',  vx: -1,                   vy: 0,                   tilt: 0,   flipX: true  },
  { name: 'SW', vx: -Math.SQRT1_2,        vy: Math.SQRT1_2,        tilt: -12, flipX: true  },
  { name: 'S',  vx: 0,                    vy: 1,                   tilt: 20,  flipX: false },
  { name: 'SE', vx: Math.SQRT1_2,         vy: Math.SQRT1_2,        tilt: 12,  flipX: false },
];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export class Butterfly {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} [options]
   */
  constructor(scene, x, y, options = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.altitude = options.altitude || randomBetween(16, 28); // Height above ground
    this.speed = options.speed || randomBetween(45, 75);
    this.phaseOffset = Math.random() * Math.PI * 2;
    this.bounds = options.bounds || { minX: 70, maxX: 1210, minY: 110, maxY: 640 };

    // Ground shadow (thu nhỏ 50% khớp kích thước bướm)
    this.shadow = scene.add.ellipse(x, y + this.altitude, 8, 4, 0x1a2e10, 0.25)
      .setDepth(4);

    // 8. Thay thế toàn bộ bướm bằng vfx critters/butterfly (v3.7.1)
    const hasVfxButterfly = Boolean(scene?.textures?.exists?.('vfx_butterfly'));
    if (hasVfxButterfly) {
      if (scene.anims && !scene.anims.exists('anim_butterfly')) {
        scene.anims.create({
          key: 'anim_butterfly',
          frames: scene.anims.generateFrameNumbers('vfx_butterfly', { start: 0, end: 95 }),
          frameRate: 28,
          repeat: -1
        });
      }
      this.sprite = scene.add.sprite(x, y, 'vfx_butterfly')
        .setDisplaySize(32, 22)
        .setOrigin(0.5, 0.5)
        .setDepth(20);
      if (scene.anims?.exists('anim_butterfly')) {
        this.sprite.play('anim_butterfly');
      }
      this.flapTween = null;
    } else {
      const textureKey = scene.textures && scene.textures.exists('butterfly_rainbow') ? 'butterfly_rainbow' : null;
      if (textureKey) {
        this.sprite = scene.add.image(x, y, textureKey)
          .setDisplaySize(19, 19)
          .setOrigin(0.5, 0.5)
          .setDepth(20);
      } else {
        this.sprite = scene.add.text(x, y, '🦋', { fontSize: '13px' })
          .setOrigin(0.5, 0.5)
          .setDepth(20);
      }

      this.baseScaleX = this.sprite.scaleX || 1;
      this.baseScaleY = this.sprite.scaleY || 1;
      this.flapTween = scene.tweens.add({
        targets: this.sprite,
        scaleX: { from: this.baseScaleX, to: this.baseScaleX * 0.25 },
        duration: randomBetween(85, 120),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Flight state
    this.currentDirection = null;
    this.isHovering = false;
    this.directionTimer = 0;
    this.nextDirectionTime = 0;

    // Pick an initial random direction from the 8 directions
    this.pickRandomDirection();
  }

  /**
   * Picks a random direction from the 8 available directions or brief hover.
   */
  pickRandomDirection() {
    // 15% chance to briefly hover
    if (Math.random() < 0.15) {
      this.isHovering = true;
      this.currentDirection = null;
      this.nextDirectionTime = randomBetween(800, 1500);
      return;
    }

    this.isHovering = false;
    const candidates = DIRECTIONS_8.filter(d => {
      // Avoid steering directly into boundaries
      if (this.x <= this.bounds.minX + 80 && d.vx < 0) return false;
      if (this.x >= this.bounds.maxX - 80 && d.vx > 0) return false;
      if (this.y <= this.bounds.minY + 60 && d.vy < 0) return false;
      if (this.y >= this.bounds.maxY - 60 && d.vy > 0) return false;
      return true;
    });

    const pool = candidates.length > 0 ? candidates : DIRECTIONS_8;
    this.currentDirection = pool[Math.floor(Math.random() * pool.length)];
    this.nextDirectionTime = randomBetween(1800, 3800);
    this.applyDirectionVisuals();
  }

  /**
   * Updates flip and tilt angle based on current 8-way heading.
   */
  applyDirectionVisuals() {
    if (!this.currentDirection || !this.sprite?.active) return;
    const { flipX, tilt } = this.currentDirection;

    // Flip horizontal based on heading
    if (flipX) {
      this.sprite.setFlipX(true);
      this.sprite.setAngle(-tilt);
    } else {
      this.sprite.setFlipX(false);
      this.sprite.setAngle(tilt);
    }
  }

  /**
   * Per-frame update logic.
   * @param {number} time
   * @param {number} delta (ms)
   */
  update(time, delta) {
    if (!this.sprite?.active) return;

    const dt = delta / 1000;
    this.directionTimer += delta;

    // Check timer for picking new direction
    if (this.directionTimer >= this.nextDirectionTime) {
      this.directionTimer = 0;
      this.pickRandomDirection();
    }

    // Erratic vertical bobbing wave
    const bob = Math.sin(time * 0.007 + this.phaseOffset) * 0.8;
    const hoverWiggle = Math.cos(time * 0.004 + this.phaseOffset) * 0.4;

    if (!this.isHovering && this.currentDirection) {
      this.x += this.currentDirection.vx * this.speed * dt;
      this.y += this.currentDirection.vy * this.speed * dt;
    }

    this.x += hoverWiggle;
    this.y += bob;

    // Soft boundary bounce/steering
    let bounced = false;
    if (this.x < this.bounds.minX) {
      this.x = this.bounds.minX;
      bounced = true;
    } else if (this.x > this.bounds.maxX) {
      this.x = this.bounds.maxX;
      bounced = true;
    }

    if (this.y < this.bounds.minY) {
      this.y = this.bounds.minY;
      bounced = true;
    } else if (this.y > this.bounds.maxY) {
      this.y = this.bounds.maxY;
      bounced = true;
    }

    if (bounced) {
      this.pickRandomDirection();
    }

    // Update sprite and shadow coordinates
    this.sprite.setPosition(this.x, this.y);
    if (this.shadow?.active) {
      this.shadow.setPosition(this.x, this.y + this.altitude);
      // Shadow shrinks slightly as butterfly bobs higher
      const shadowScale = clamp(1.0 - (bob * 0.05), 0.7, 1.2);
      this.shadow.setScale(shadowScale, shadowScale);
    }
  }

  /**
   * Returns current direction name ('N', 'NE', 'E', etc.) or 'HOVER'.
   */
  getDirectionName() {
    return this.isHovering || !this.currentDirection ? 'HOVER' : this.currentDirection.name;
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.flapTween) {
      this.flapTween.stop();
      this.flapTween = null;
    }
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null;
    }
  }
}
