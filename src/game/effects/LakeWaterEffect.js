import * as Phaser from 'phaser';

/**
 * LakeWaterEffect (Hiệu Ứng Mặt Nước Hồ Sen Làng Quê)
 * - Tọa độ lòng hồ Map 1: Tâm (1085, 575), bán kính ngang ~180px, bán kính dọc ~80px.
 * - Sóng nước lăn tăn phản chiếu ánh sáng (Shimmering Caustics & Gentle Wave Drift).
 * - Vòng sóng nước loang nở tự nhiên (Water Ripple Rings) quanh cụm hoa sen và mạn thuyền.
 * - Đốm nắng lấp lánh mặt trời (Sunlight Glints / Sparkles) nhấp nháy lung linh trên mặt hồ.
 * - Toàn bộ hiệu ứng được giới hạn chính xác bên trong phạm vi mặt nước, không tràn ra bờ đất.
 */

export const LAKE_CONFIG = {
  centerX: 1085,
  centerY: 575,
  radiusX: 182,
  radiusY: 80,
  safeMargin: 12
};

/**
 * Kiểm tra một tọa độ (x, y) có nằm trong vùng mặt nước của hồ hay không
 */
export function isPointInLake(x, y, margin = 0) {
  const rx = LAKE_CONFIG.radiusX + margin;
  const ry = LAKE_CONFIG.radiusY + margin;
  const dx = (x - LAKE_CONFIG.centerX) / rx;
  const dy = (y - LAKE_CONFIG.centerY) / ry;
  return (dx * dx + dy * dy) <= 1.0;
}

/**
 * Đẩy một tọa độ ra mép bờ hồ an toàn gần nhất nếu điểm đó rơi vào trong hồ
 */
export function clampOutOfLake(x, y, extraMargin = 15) {
  if (!isPointInLake(x, y, 4)) return { x, y };

  const dx = x - LAKE_CONFIG.centerX;
  const dy = y - LAKE_CONFIG.centerY;
  const angle = Math.atan2(dy / LAKE_CONFIG.radiusY, dx / LAKE_CONFIG.radiusX);

  const targetX = LAKE_CONFIG.centerX + Math.cos(angle) * (LAKE_CONFIG.radiusX + extraMargin);
  const targetY = LAKE_CONFIG.centerY + Math.sin(angle) * (LAKE_CONFIG.radiusY + extraMargin);

  return {
    x: Math.round(targetX),
    y: Math.round(targetY)
  };
}

export class LakeWaterEffect {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(-3); // Nằm ngay trên ảnh nền (-5), dưới chân các thực thể (>= 1)

    this.waves = [];
    this.sparkles = [];
    this.rippleTimer = null;

    this.ensureTextures();
    this.createCausticShimmerWaves();
    this.createSunlightSparkles();
    this.startRippleSpawns();
  }

  ensureTextures() {
    if (!this.scene.textures.exists('fx_lake_sparkle')) {
      // Đốm sáng 4 cánh lấp lánh (Sunlight diamond glint)
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      // Hình thoi 4 cánh
      g.fillTriangle(8, 0, 10, 8, 8, 16);
      g.fillTriangle(8, 0, 6, 8, 8, 16);
      g.fillTriangle(0, 8, 8, 6, 16, 8);
      g.fillTriangle(0, 8, 8, 10, 16, 8);
      // Tâm sáng tròn
      g.fillStyle(0x67e8f9, 0.9);
      g.fillCircle(8, 8, 2.5);
      g.generateTexture('fx_lake_sparkle', 16, 16);
      g.destroy();
    }

    if (!this.scene.textures.exists('fx_lake_ripple_ring')) {
      // Vòng tròn sóng nước elip mỏng
      const canvas = this.scene.textures.createCanvas('fx_lake_ripple_ring', 96, 48);
      const ctx = canvas.context;
      ctx.clearRect(0, 0, 96, 48);
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.75)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(48, 24, 44, 20, 0, 0, Math.PI * 2);
      ctx.stroke();
      canvas.refresh();
    }
  }

  /**
   * Tạo các dải sóng nước lăn tăn trôi nhẹ (Caustic waves)
   */
  createCausticShimmerWaves() {
    // 7 dải sóng lăn tăn phân bố hài hòa trên mặt hồ
    const waveConfigs = [
      { rx: 55, ry: 9, ox: -65, oy: -15, delay: 0, speed: 2800 },
      { rx: 80, ry: 11, ox: 25, oy: -25, delay: 400, speed: 3200 },
      { rx: 70, ry: 10, ox: -20, oy: 15, delay: 800, speed: 2900 },
      { rx: 90, ry: 12, ox: 50, oy: 10, delay: 300, speed: 3400 },
      { rx: 65, ry: 9, ox: -80, oy: 25, delay: 900, speed: 2600 },
      { rx: 75, ry: 10, ox: 10, oy: 35, delay: 600, speed: 3100 },
      { rx: 60, ry: 8, ox: 70, oy: -10, delay: 1100, speed: 2700 }
    ];

    waveConfigs.forEach(cfg => {
      const g = this.scene.add.graphics();
      // Vẽ vệt sóng nước cong nhẹ ánh sáng xanh ngọc và trắng mờ
      g.lineStyle(1.8, 0xbae6fd, 0.45);
      g.beginPath();
      g.arc(0, 0, cfg.rx, Math.PI * 0.1, Math.PI * 0.9, false);
      g.stroke();

      g.lineStyle(1.2, 0xffffff, 0.55);
      g.beginPath();
      g.arc(0, 2, cfg.rx * 0.75, Math.PI * 0.2, Math.PI * 0.8, false);
      g.stroke();

      const wx = LAKE_CONFIG.centerX + cfg.ox;
      const wy = LAKE_CONFIG.centerY + cfg.oy;
      g.setPosition(wx, wy);
      g.setScale(1.0, 0.35); // Dẹp góc nhìn 2.5D
      this.container.add(g);
      this.waves.push(g);

      // Chuyển động nhấp nhô sóng nước theo hình sin
      this.scene.tweens.add({
        targets: g,
        x: wx + 14,
        alpha: { from: 0.55, to: 0.18 },
        duration: cfg.speed,
        delay: cfg.delay,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  /**
   * Tạo các đốm nắng phản chiếu lấp lánh (Sunlight Sparkles)
   */
  createSunlightSparkles() {
    const sparkleSpots = [
      { ox: -75, oy: -15, delay: 0 },
      { ox: -30, oy: -35, delay: 600 },
      { ox: 40, oy: -20, delay: 1200 },
      { ox: 95, oy: -10, delay: 300 },
      { ox: -60, oy: 20, delay: 1500 },
      { ox: 15, oy: 15, delay: 900 },
      { ox: 65, oy: 28, delay: 1800 },
      { ox: -10, oy: -8, delay: 450 }
    ];

    sparkleSpots.forEach(sp => {
      const sx = LAKE_CONFIG.centerX + sp.ox;
      const sy = LAKE_CONFIG.centerY + sp.oy;

      const img = this.scene.add.image(sx, sy, 'fx_lake_sparkle');
      img.setBlendMode(Phaser.BlendModes.ADD);
      img.setScale(0);
      img.setAlpha(0);
      this.container.add(img);
      this.sparkles.push(img);

      // Nhấp nháy tự nhiên như ánh nắng rọi mặt hồ
      this.scene.tweens.add({
        targets: img,
        scale: { from: 0, to: 0.9 },
        alpha: { from: 0, to: 0.95 },
        angle: { from: 0, to: 45 },
        duration: 900,
        delay: sp.delay,
        yoyo: true,
        repeat: -1,
        repeatDelay: 1200 + Math.random() * 1500,
        ease: 'Quad.easeInOut'
      });
    });
  }

  /**
   * Định kỳ phát ra vòng sóng nước lan tỏa từ mạn thuyền hoặc cụm hoa sen
   */
  startRippleSpawns() {
    // Các vị trí tự nhiên: mạn thuyền (ox: 20, oy: -25), cầu gỗ (ox: -90, oy: -30), cụm sen (ox: -55, oy: 15)
    const rippleOrigins = [
      { ox: 25, oy: -25 },  // Gần mạn thuyền gỗ
      { ox: -85, oy: -28 }, // Gần chân cầu gỗ
      { ox: -50, oy: 20 },  // Gần cụm hoa sen hồng
      { ox: 60, oy: 18 }    // Gần bông sen phía đông
    ];

    let currentIdx = 0;
    this.rippleTimer = this.scene.time.addEvent({
      delay: 2200,
      loop: true,
      callback: () => {
        if (!this.container || !this.scene?.sys?.isActive()) return;
        const origin = rippleOrigins[currentIdx % rippleOrigins.length];
        currentIdx++;

        const rx = LAKE_CONFIG.centerX + origin.ox + (Math.random() - 0.5) * 16;
        const ry = LAKE_CONFIG.centerY + origin.oy + (Math.random() - 0.5) * 10;

        const ring = this.scene.add.image(rx, ry, 'fx_lake_ripple_ring');
        ring.setScale(0.2, 0.15);
        ring.setAlpha(0.7);
        this.container.add(ring);

        this.scene.tweens.add({
          targets: ring,
          scaleX: 1.15,
          scaleY: 0.7,
          alpha: 0,
          duration: 2600,
          ease: 'Sine.easeOut',
          onComplete: () => {
            ring.destroy();
          }
        });
      }
    });
  }

  destroy() {
    if (this.rippleTimer) {
      this.rippleTimer.remove(false);
      this.rippleTimer = null;
    }
    this.waves.forEach(w => w.destroy());
    this.waves = [];
    this.sparkles.forEach(s => s.destroy());
    this.sparkles = [];
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}
