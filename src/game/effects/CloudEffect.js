import * as Phaser from 'phaser';

/**
 * CloudEffect.js
 * Hiệu ứng Mây Trôi Bồng Bềnh 8 Hướng (Opacity 100% có đổ bóng) & Bóng Mây Đổ Xuống Mặt Đất.
 *
 * Tính năng chính:
 * 1. Hoạt ảnh mây bay 8 hướng theo trục chính Trái qua Phải và Ngược lại (E, ENE, ESE, NE, W, WNW, WSW, NW).
 * 2. Đám mây Opacity 100% (hoàn toàn không bị trong suốt / nhìn xuyên qua), nổi bật khối 3D mềm mại xốp phồng.
 * 3. Đổ bóng trực tiếp (Drop Shadow) dưới chân đám mây tạo độ nổi bồng bềnh trong không trung.
 * 4. Đổ bóng mây thật xuống mặt đất (Cloud Ground Shadow Projection) lướt êm ái trên cỏ và mặt đất bên dưới.
 * 5. Mây bay giới hạn ở 1/2 nửa trên bản đồ (y trong khoảng 35 đến 300 px), bóng đổ xuống bãi đất (y trong khoảng 320 đến 650 px).
 * 6. Tỉ lệ xuất hiện mây chuẩn 2% ngẫu nhiên theo yêu cầu.
 */

export const CLOUD_TEXTURE_KEYS = ['fx_cloud_type1', 'fx_cloud_type2', 'fx_cloud_type3'];
export const CLOUD_SHADOW_KEY = 'fx_cloud_ground_shadow';
export const CLOUD_SHADOW_KEYS = ['fx_cloud_shadow_type1', 'fx_cloud_shadow_type2', 'fx_cloud_shadow_type3'];

export const CLOUD_CONFIGS = [
  {
    key: 'fx_cloud_type1',
    shadowKey: 'fx_cloud_shadow_type1',
    width: 210,
    height: 120,
    circles: [
      { x: 55, y: 72, r: 34 },
      { x: 92, y: 54, r: 40 },
      { x: 135, y: 52, r: 38 },
      { x: 172, y: 66, r: 30 },
      { x: 110, y: 78, r: 32 }
    ]
  },
  {
    key: 'fx_cloud_type2',
    shadowKey: 'fx_cloud_shadow_type2',
    width: 280,
    height: 135,
    circles: [
      { x: 52, y: 84, r: 30 },
      { x: 94, y: 66, r: 42 },
      { x: 146, y: 55, r: 48 },
      { x: 198, y: 62, r: 42 },
      { x: 242, y: 78, r: 32 },
      { x: 150, y: 88, r: 36 }
    ]
  },
  {
    key: 'fx_cloud_type3',
    shadowKey: 'fx_cloud_shadow_type3',
    width: 160,
    height: 100,
    circles: [
      { x: 45, y: 62, r: 26 },
      { x: 82, y: 48, r: 34 },
      { x: 118, y: 56, r: 28 },
      { x: 84, y: 68, r: 24 }
    ]
  }
];

export function ensureCloudTextures(scene) {
  if (!scene || !scene.textures) return;

  // Nếu đã tồn tại đầy đủ texture mới 100% opacity, không cần tạo lại
  if (scene.textures.exists(CLOUD_CONFIGS[0].key) && scene.textures.exists(CLOUD_CONFIGS[0].shadowKey)) {
    return;
  }

  // Khởi tạo từng loại mây và bóng đổ mặt đất tương ứng
  for (const cfg of CLOUD_CONFIGS) {
    if (scene.textures.exists(cfg.key)) {
      scene.textures.remove(cfg.key);
    }
    if (scene.textures.exists(cfg.shadowKey)) {
      scene.textures.remove(cfg.shadowKey);
    }

    // 1. Texture Đám Mây Opacity 100% & Đổ bóng nổi khối trên bầu trời
    const cloudCanvas = scene.textures.createCanvas(cfg.key, cfg.width, cfg.height);
    drawFluffyCloud(cloudCanvas.context, cfg.circles, cfg.width, cfg.height);
    cloudCanvas.refresh();

    // 2. Texture Bóng Mây Đổ Xuống Mặt Đất
    const shadowCanvas = scene.textures.createCanvas(cfg.shadowKey, cfg.width, cfg.height);
    drawCloudGroundShadow(shadowCanvas.context, cfg.circles, cfg.width, cfg.height);
    shadowCanvas.refresh();
  }

  // Texture bóng mặt đất chung (tương thích ngược)
  if (!scene.textures.exists(CLOUD_SHADOW_KEY)) {
    const canvas = scene.textures.createCanvas(CLOUD_SHADOW_KEY, 240, 100);
    const ctx = canvas.context;
    drawCloudGroundShadow(ctx, CLOUD_CONFIGS[0].circles, 240, 100);
    canvas.refresh();
  }
}

/**
 * Vẽ khối mây trắng xốp mềm mại với:
 * - Opacity 100% đặc (không thể nhìn xuyên qua)
 * - Đổ bóng nhẹ phía dưới (Drop Shadow) trong bầu trời
 * - Tạo khối 3D phồng trắng bồng bềnh
 */
function drawFluffyCloud(ctx, circles, width, height) {
  ctx.clearRect(0, 0, width, height);

  // Bước 1: Đổ bóng nhẹ phía dưới đáy đám mây (Drop Shadow bầu trời)
  ctx.save();
  ctx.shadowColor = 'rgba(25, 45, 80, 0.32)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 6;

  // Lớp nền silhouette 100% đặc (Opacity 100%) - màu pastel bóng đáy mây
  ctx.fillStyle = 'rgba(206, 224, 246, 1.0)';
  for (const c of circles) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Bước 2: Thân mây 100% đặc - chuyển sắc nhẹ từ trắng kem sang trắng tinh khiết
  for (const c of circles) {
    const midGrad = ctx.createRadialGradient(c.x, c.y + c.r * 0.18, 0, c.x, c.y, c.r);
    midGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    midGrad.addColorStop(0.72, 'rgba(244, 249, 255, 1.0)');
    midGrad.addColorStop(1.0, 'rgba(216, 232, 250, 1.0)');
    ctx.fillStyle = midGrad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r * 0.98, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bước 3: Đỉnh vòm mây trắng tinh khiết 100% tạo hiệu ứng nổi khối phồng xốp
  for (const c of circles) {
    const topGrad = ctx.createRadialGradient(c.x - c.r * 0.2, c.y - c.r * 0.25, 0, c.x, c.y, c.r * 0.85);
    topGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    topGrad.addColorStop(0.68, 'rgba(255, 255, 255, 0.96)');
    topGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r * 0.88, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Vẽ bóng mây đổ xuống mặt đất (Ground Shadow):
 * - Góc nhìn 2.5D nén dẹp theo phối cảnh mặt đất
 * - Độ tán xạ bóng râm mát mịn màng, viền mềm mại tự nhiên
 */
function drawCloudGroundShadow(ctx, circles, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  // Nén dọc góc nghiêng 2.5D trên mặt cỏ/đường đi
  ctx.translate(width / 2, height / 2);
  ctx.scale(1.0, 0.42);
  ctx.translate(-width / 2, -height / 2);

  // Đổ bóng tán xạ mịn màng trên mặt đất
  ctx.shadowColor = 'rgba(10, 24, 40, 0.58)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = 'rgba(12, 26, 44, 0.46)';
  for (const c of circles) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r * 1.08, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export class CloudEffect {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.clouds = [];
    this.maxClouds = options.maxClouds || 2;
    this.spawnChance = options.spawnChance !== undefined ? options.spawnChance : 0.02; // Tỉ lệ xuất hiện mây là 2%
    this.checkInterval = 1200; // Mỗi 1.2s kiểm tra ngẫu nhiên tỉ lệ 2%
    this.nextCheckTime = Date.now() + 1000;

    // Khởi tạo texture mây và bóng đổ mặt đất
    ensureCloudTextures(scene);

    // Bầu trời mặc định trong xanh, xác suất 2% xuất hiện ngay khi vừa vào map
    this.spawnInitialClouds();

    // Gắn vào window để dễ dàng theo dõi và kiểm thử
    if (typeof window !== 'undefined') {
      window.__cloudEffect = this;
    }
  }

  spawnInitialClouds() {
    // Không ép sinh nhiều mây làm chật bản đồ:
    // Bầu trời mặc định trong xanh, chỉ có xác suất 2% xuất hiện 1 đám mây ban đầu
    if (Math.random() < this.spawnChance) {
      this.spawnCloud({
        x: 240 + Math.random() * 800,
        y: 60 + Math.random() * 180,
        forceShadow: true
      });
    }
  }

  /**
   * Sinh một đám mây mới
   * @param {Object} opts - Tuỳ chọn tọa độ, hướng, bóng đổ
   */
  spawnCloud(opts = {}) {
    if (!this.scene?.add) return null;

    // 1. Chọn hướng bay: Trái qua Phải hoặc Phải qua Trái
    const dir = opts.direction || (Math.random() < 0.5 ? 'left_to_right' : 'right_to_left');
    const isL2R = dir === 'left_to_right';

    // 2. Góc bay 8 hướng (chủ đạo ngang, có độ chếch tự nhiên):
    // 0: E (thẳng phải), 1: ENE (chếch lên), 2: ESE (chếch xuống), 3: NE (chéo lên)
    // 4: W (thẳng trái), 5: WNW (chếch lên), 6: WSW (chếch xuống), 7: NW (chéo lên)
    const availableAngles = isL2R ? [0, 1, 2, 3] : [4, 5, 6, 7];
    const angleIndex = opts.angleIndex !== undefined ? opts.angleIndex : availableAngles[Math.floor(Math.random() * availableAngles.length)];

    let vx = 0;
    let vy = 0;
    const baseSpeed = 26 + Math.random() * 18; // 26 - 44 px/s êm đềm

    switch (angleIndex) {
      case 0: // E (thẳng phải)
        vx = baseSpeed;
        vy = 0;
        break;
      case 1: // ENE (chếch lên phải)
        vx = baseSpeed * 0.96;
        vy = -baseSpeed * 0.28;
        break;
      case 2: // ESE (chếch xuống phải)
        vx = baseSpeed * 0.96;
        vy = baseSpeed * 0.28;
        break;
      case 3: // NE (chéo lên phải)
        vx = baseSpeed * 0.88;
        vy = -baseSpeed * 0.46;
        break;
      case 4: // W (thẳng trái)
        vx = -baseSpeed;
        vy = 0;
        break;
      case 5: // WNW (chếch lên trái)
        vx = -baseSpeed * 0.96;
        vy = -baseSpeed * 0.28;
        break;
      case 6: // WSW (chếch xuống trái)
        vx = -baseSpeed * 0.96;
        vy = baseSpeed * 0.28;
        break;
      case 7: // NW (chéo lên trái)
        vx = -baseSpeed * 0.88;
        vy = -baseSpeed * 0.46;
        break;
      default:
        vx = isL2R ? baseSpeed : -baseSpeed;
        vy = 0;
    }

    // 3. Tọa độ xuất phát:
    // Giới hạn ở 1/2 nửa trên bản đồ (y trong khoảng 45 đến 280 px)
    const startX = opts.x !== undefined ? opts.x : (isL2R ? -180 : 1460);
    const startY = opts.y !== undefined ? opts.y : (45 + Math.random() * 235);

    // 4. Chọn kết cấu mây ngẫu nhiên
    const config = CLOUD_CONFIGS[Math.floor(Math.random() * CLOUD_CONFIGS.length)];
    const texKey = config.key;
    const shadowKey = config.shadowKey;
    const scale = 0.85 + Math.random() * 0.35; // 0.85 - 1.2x

    // Sprite đám mây với Opacity 100% hoàn toàn
    const sprite = this.scene.add.image(startX, startY, texKey);
    sprite.setScale(scale);
    sprite.setAlpha(1.0); // Opacity 100% tuyệt đối theo yêu cầu
    sprite.setOrigin(0.5, 0.5);
    sprite.setDepth(85); // Nằm trên nền trời và cây cối, dưới HUD UI

    // 5. Tạo bóng mây đổ xuống mặt đất (Real Ground Shadow Projection)
    const hasShadow = opts.forceShadow !== undefined ? Boolean(opts.forceShadow) : true;
    let groundShadow = null;
    const shadowOffsetX = 45;
    const shadowOffsetY = 250;

    if (hasShadow) {
      // Độ lệch bóng theo góc chiếu mặt trời: x + 45 px, y + 250 px (xuống vùng cỏ/đường đi)
      const shadowX = startX + shadowOffsetX;
      const shadowY = Math.min(650, startY + shadowOffsetY);

      groundShadow = this.scene.add.image(shadowX, shadowY, shadowKey);
      groundShadow.setScale(scale * 1.15, scale * 1.02);
      groundShadow.setAlpha(0.50); // Độ đậm bóng rõ ràng, râm mát trên mặt đất
      groundShadow.setOrigin(0.5, 0.5);
      groundShadow.setDepth(2); // Nằm sát mặt đất, dưới nhân vật và quái vật
    }

    const cloudData = {
      sprite,
      groundShadow,
      hasShadow,
      vx,
      vy,
      scale,
      baseAlpha: 1.0,
      angleIndex,
      isL2R,
      shadowOffsetY,
      shadowOffsetX
    };

    this.clouds.push(cloudData);
    return cloudData;
  }

  update(time, delta) {
    if (!this.scene?.add) return;
    const dt = delta / 1000;

    // 1. Cập nhật vị trí các đám mây đang bay
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      const c = this.clouds[i];
      if (!c.sprite?.active) {
        if (c.groundShadow?.active) c.groundShadow.destroy();
        this.clouds.splice(i, 1);
        continue;
      }

      // Bay ngang và chếch theo vận tốc 8 hướng
      c.sprite.x += c.vx * dt;
      c.sprite.y += c.vy * dt;

      // Giữ mây luôn lơ lửng trong 1/2 nửa trên bản đồ (y: 35 đến 300 px)
      if (c.sprite.y < 40 && c.vy < 0) {
        c.vy = Math.abs(c.vy) * 0.7; // Đảo nhẹ xuống
      } else if (c.sprite.y > 300 && c.vy > 0) {
        c.vy = -Math.abs(c.vy) * 0.7; // Đảo nhẹ lên
      }

      // Cập nhật bóng đổ thật trên mặt đất (đồng bộ theo thời gian thực)
      if (c.groundShadow?.active) {
        c.groundShadow.x = c.sprite.x + c.shadowOffsetX;
        c.groundShadow.y = Math.min(650, c.sprite.y + c.shadowOffsetY);
        c.groundShadow.setAlpha(0.50);
      }

      // Đám mây duy trì Opacity 100%
      c.sprite.setAlpha(1.0);

      // Kiểm tra khi mây bay ra khỏi màn hình (vượt qua lề trái/phải)
      const outOfBounds = (c.isL2R && c.sprite.x > 1500) || (!c.isL2R && c.sprite.x < -200);
      if (outOfBounds) {
        if (c.groundShadow?.active) {
          c.groundShadow.destroy();
        }
        c.sprite.destroy();
        this.clouds.splice(i, 1);
      }
    }

    // 2. Tự động kiểm tra xuất hiện mây mới với tỉ lệ 2% ngẫu nhiên
    const now = Date.now();
    if (this.clouds.length < this.maxClouds && now > this.nextCheckTime) {
      this.nextCheckTime = now + this.checkInterval;
      if (Math.random() < this.spawnChance) {
        this.spawnCloud({ forceShadow: true });
      }
    }
  }

  destroy() {
    for (const c of this.clouds) {
      if (c.groundShadow?.active) c.groundShadow.destroy();
      if (c.sprite?.active) c.sprite.destroy();
    }
    this.clouds = [];
    if (typeof window !== 'undefined' && window.__cloudEffect === this) {
      delete window.__cloudEffect;
    }
  }
}
