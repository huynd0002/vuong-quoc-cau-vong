import * as Phaser from 'phaser';

/**
 * PetBathWaterEffect (Hiệu ứng nước đổ bồn tắm thú cưng)
 * - Vòi nước tre đổ dòng nước trong vắt liên tục từ miệng vòi xuống bồn tắm.
 * - Dòng nước uốn lượn tự nhiên (curved fluid stream) với lõi nước phát sáng (inner core shimmer).
 * - Điểm tiếp xúc mặt nước có vòng sóng nước lan tỏa (impact ripple rings) và bọt nước trắng (foam).
 * - Hạt nước bắn tung tóe (bouncing water droplets) nảy lên rồi rơi lại vào bồn nước.
 * - Bọt xà phòng cầu vồng (soap bubbles) và ánh sáng lấp lánh (sparkles) trôi bồng bềnh.
 * - Hỗ trợ hàm triggerSplashBurst() khi bé hoặc thú cưng tương tác tắm nước!
 */

export class PetBathWaterEffect {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.x = config.x ?? 320;
    this.y = config.y ?? 490;
    this.scale = config.scale ?? 0.20;

    // Tọa độ miệng vòi nước đổ (spout tip) và điểm chạm mặt nước (impact point)
    // Tính toán chuẩn xác theo tỷ lệ và kết cấu gốc prop_pet_bath.png (751 x 808 px):
    // Tâm texture tại (375.5, 404.0). Miệng vòi nước tre tại (477, 130). Điểm chạm mặt bồn tại (477, 315).
    const s = this.scale;
    this.spoutX = this.x + Math.round((477 - 375.5) * s);   // x + 101.5 * s
    this.spoutY = this.y + Math.round((130 - 404.0) * s);   // y - 274.0 * s
    this.impactX = this.x + Math.round((477 - 375.5) * s);  // x + 101.5 * s
    this.impactY = this.y + Math.round((315 - 404.0) * s);  // y - 89.0 * s

    // Vùng mặt nước bồn tắm để tạo sóng lấp lánh và bọt nổi
    this.tubWaterCenterX = this.x + Math.round((350 - 375.5) * s);
    this.tubWaterCenterY = this.y + Math.round((380 - 404.0) * s);
    this.tubRadiusX = Math.round(180 * s);
    this.tubRadiusY = Math.round(70 * s);

    this.container = scene.add.container(0, 0);
    this.container.setDepth(5); // Nằm trên thành bồn và dưới các hiệu ứng UI

    this.droplets = [];
    this.splashes = [];
    this.bubbles = [];
    this.ripples = [];
    this.isBursting = false;

    this.ensureTextures();
    this.createStreamGraphics();
    this.createWaterSurfaceShimmer();
    this.startDropletStream();
    this.startRippleLoop();
    this.startAmbientBubbles();
  }

  ensureTextures() {
    // 1. Texture hạt nước giọt tròn (Water droplet bead)
    if (!this.scene.textures.exists('fx_bath_droplet')) {
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
      // Lớp viền xanh ngọc
      g.fillStyle(0x38bdf8, 0.95);
      g.fillCircle(5, 5, 5);
      // Tâm sáng trắng
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(4, 3.5, 2.2);
      g.generateTexture('fx_bath_droplet', 10, 10);
      g.destroy();
    }

    // 2. Texture vòng sóng nước elip (Impact ripple)
    if (!this.scene.textures.exists('fx_bath_ripple')) {
      const canvas = this.scene.textures.createCanvas('fx_bath_ripple', 64, 32);
      const ctx = canvas.context;
      ctx.clearRect(0, 0, 64, 32);
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.85)';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(32, 16, 28, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      canvas.refresh();
    }

    // 3. Texture bọt xà phòng lung linh (Soap bubble)
    if (!this.scene.textures.exists('fx_bath_bubble')) {
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
      // Viền cầu vồng pastel nhẹ
      g.lineStyle(1.5, 0xe0f2fe, 0.9);
      g.strokeCircle(8, 8, 7);
      // Điểm phản chiếu ánh sáng
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(5.5, 5.5, 2);
      g.generateTexture('fx_bath_bubble', 16, 16);
      g.destroy();
    }
  }

  /**
   * Tạo đồ họa dòng nước đổ liên tục (Continuous flowing water column)
   */
  createStreamGraphics() {
    this.streamGfx = this.scene.add.graphics();
    this.container.add(this.streamGfx);

    const sRel = this.scale / 0.20;

    // Điểm sáng lóe tại miệng vòi nước tre
    this.spoutGlow = this.scene.add.circle(this.spoutX, this.spoutY, Math.max(2.5, 3.5 * sRel), 0xe0f2fe, 0.85);
    this.container.add(this.spoutGlow);
    this.scene.tweens.add({
      targets: this.spoutGlow,
      scale: 1.25,
      alpha: 0.5,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Điểm bọt nước trắng tại chỗ nước đổ va chạm vào bồn
    this.impactFoam = this.scene.add.ellipse(this.impactX, this.impactY, Math.round(15 * sRel), Math.round(6 * sRel), 0xffffff, 0.7);
    this.container.add(this.impactFoam);
    this.scene.tweens.add({
      targets: this.impactFoam,
      scaleX: 1.35,
      scaleY: 1.25,
      alpha: 0.9,
      duration: 450,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Vẽ đường cong nước uốn lượn bằng các đoạn thẳng liên tiếp (chuẩn Phaser 3 Graphics)
   */
  drawBezierStream(startX, startY, midX, midY, endX, endY, thickness, color, alpha, offsetX = 0) {
    this.streamGfx.lineStyle(thickness, color, alpha);
    this.streamGfx.beginPath();
    const segments = 10;
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const inv = 1 - u;
      const px = inv * inv * (startX + offsetX) + 2 * inv * u * (midX + offsetX) + u * u * (endX + offsetX);
      const py = inv * inv * startY + 2 * inv * u * midY + u * u * endY;
      if (i === 0) {
        this.streamGfx.moveTo(px, py);
      } else {
        this.streamGfx.lineTo(px, py);
      }
    }
    this.streamGfx.stroke();
  }

  /**
   * Vẽ dòng nước đổ uốn lượn sinh động theo thời gian thực (update frame loop)
   */
  update(time = 0, delta = 16) {
    if (!this.streamGfx) return;

    this.streamGfx.clear();

    const sRel = this.scale / 0.20;
    const t = time * 0.008;
    const wobbleX = Math.sin(t) * (1.0 * sRel);
    const wobbleMid = Math.cos(t * 1.3) * (1.5 * sRel);

    const startX = this.spoutX;
    const startY = this.spoutY;
    const midX = (startX + this.impactX) / 2 + wobbleMid;
    const midY = (startY + this.impactY) / 2;
    const endX = this.impactX + wobbleX;
    const endY = this.impactY;

    // 1. Lớp nước ngoài (Outer aqua body)
    this.drawBezierStream(startX, startY, midX, midY, endX, endY, Math.max(2.0, 4.2 * sRel), 0x38bdf8, 0.65);

    // 2. Lõi nước trong suốt lấp lánh (Inner cyan stream)
    this.drawBezierStream(startX, startY, midX, midY, endX, endY, Math.max(1.4, 2.6 * sRel), 0x7dd3fc, 0.85);

    // 3. Đường gân sáng trắng lướt theo dòng nước (White highlight shimmer)
    const shimmerAlpha = 0.65 + Math.sin(time * 0.015) * 0.25;
    this.drawBezierStream(startX, startY, midX, midY, endX, endY, Math.max(0.7, 1.2 * sRel), 0xffffff, shimmerAlpha, -0.4 * sRel);

    // Cập nhật vật lý các giọt nước bắn tung tóe (Droplet physics)
    this.updateSplashes(delta);
  }

  /**
   * Khởi tạo luồng giọt nước đổ nối tiếp nhau theo phương thẳng đứng
   */
  startDropletStream() {
    this.dropletTimer = this.scene.time.addEvent({
      delay: 95,
      loop: true,
      callback: () => {
        if (!this.container || !this.scene) return;
        this.spawnStreamBead();
      }
    });
  }

  /**
   * Sinh một giọt nước chảy dọc theo dòng nước từ miệng vòi xuống bồn
   */
  spawnStreamBead() {
    const sRel = this.scale / 0.20;
    const startX = this.spoutX + (Math.random() - 0.5) * 2.5 * sRel;
    const startY = this.spoutY;
    const bead = this.scene.add.image(startX, startY, 'fx_bath_droplet');
    bead.setScale(Phaser.Math.FloatBetween(0.28, 0.48) * sRel);
    bead.setAlpha(0.85);
    this.container.add(bead);

    const targetX = this.impactX + (Math.random() - 0.5) * 4 * sRel;
    const targetY = this.impactY;
    const duration = Phaser.Math.Between(260, 340);

    this.scene.tweens.add({
      targets: bead,
      x: { from: startX, to: targetX },
      y: { from: startY, to: targetY },
      scaleY: 1.3, // Co giãn hình giọt nước theo chiều rơi
      duration,
      ease: 'Quad.easeIn',
      onComplete: () => {
        bead.destroy();
        this.spawnSplashDroplet();
      }
    });
  }

  /**
   * Sinh giọt nước nảy lên (splash bounce) khi giọt nước chạm mặt bồn
   */
  spawnSplashDroplet(isBurst = false) {
    if (!this.container || !this.scene) return;

    // Giới hạn số lượng droplet hoạt động đồng thời
    if (this.splashes.length > 25) return;

    const sRel = this.scale / 0.20;
    const drop = this.scene.add.image(this.impactX, this.impactY - 2, 'fx_bath_droplet');
    const scale = Phaser.Math.FloatBetween(0.25, isBurst ? 0.60 : 0.42) * sRel;
    drop.setScale(scale);
    this.container.add(drop);

    // Vận tốc nảy lên
    const vx = Phaser.Math.FloatBetween(isBurst ? -45 : -25, isBurst ? 40 : 22) * sRel;
    const vy = Phaser.Math.FloatBetween(isBurst ? -75 : -48, isBurst ? -45 : -30) * sRel;

    this.splashes.push({
      sprite: drop,
      x: this.impactX,
      y: this.impactY - 2,
      vx,
      vy,
      gravity: 240,
      life: 0,
      maxLife: Phaser.Math.Between(350, 520)
    });
  }

  updateSplashes(delta) {
    const dt = delta / 1000;
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.life += delta;
      s.vy += s.gravity * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      s.sprite.x = s.x;
      s.sprite.y = s.y;
      s.sprite.alpha = Math.max(0, 1 - (s.life / s.maxLife));

      // Biến mất khi chạm lại mặt nước hoặc hết thời gian sống
      if (s.life >= s.maxLife || (s.vy > 0 && s.y >= this.impactY + 5)) {
        s.sprite.destroy();
        this.splashes.splice(i, 1);
      }
    }
  }

  /**
   * Vòng sóng nước loang ra nhịp nhàng từ điểm tiếp xúc
   */
  startRippleLoop() {
    this.rippleTimer = this.scene.time.addEvent({
      delay: 550,
      loop: true,
      callback: () => {
        if (!this.container || !this.scene) return;
        this.spawnImpactRipple();
      }
    });
  }

  spawnImpactRipple(scaleMultiplier = 1.0) {
    const sRel = this.scale / 0.20;
    const rip = this.scene.add.image(this.impactX, this.impactY, 'fx_bath_ripple');
    rip.setScale(0.12 * sRel * scaleMultiplier, 0.08 * sRel * scaleMultiplier);
    rip.setAlpha(0.85);
    this.container.add(rip);

    this.scene.tweens.add({
      targets: rip,
      scaleX: 0.55 * sRel * scaleMultiplier,
      scaleY: 0.30 * sRel * scaleMultiplier,
      alpha: 0,
      duration: 1100,
      ease: 'Cubic.easeOut',
      onComplete: () => rip.destroy()
    });
  }

  /**
   * Tạo các dải sóng lấp lánh (caustic shimmer) trên bề mặt nước bồn tắm
   */
  createWaterSurfaceShimmer() {
    const sRel = this.scale / 0.20;
    const shimmerOffsets = [
      { ox: -22 * sRel, oy: -6 * sRel, scale: 0.65 * sRel, delay: 0 },
      { ox: 10 * sRel, oy: -10 * sRel, scale: 0.75 * sRel, delay: 400 },
      { ox: -8 * sRel, oy: 4 * sRel, scale: 0.8 * sRel, delay: 800 },
      { ox: 18 * sRel, oy: 2 * sRel, scale: 0.6 * sRel, delay: 200 }
    ];

    shimmerOffsets.forEach(cfg => {
      const g = this.scene.add.graphics();
      g.lineStyle(1.4, 0xbae6fd, 0.45);
      g.beginPath();
      g.arc(0, 0, 18 * cfg.scale, Math.PI * 0.15, Math.PI * 0.85, false);
      g.stroke();

      g.x = this.tubWaterCenterX + cfg.ox;
      g.y = this.tubWaterCenterY + cfg.oy;
      this.container.add(g);

      this.scene.tweens.add({
        targets: g,
        scaleX: 1.25,
        alpha: { from: 0.2, to: 0.65 },
        x: g.x + 3 * sRel,
        duration: 2200,
        yoyo: true,
        repeat: -1,
        delay: cfg.delay,
        ease: 'Sine.easeInOut'
      });
    });
  }

  /**
   * Bọt xà phòng nhẹ nhàng trôi bồng bềnh từ mặt bồn tắm
   */
  startAmbientBubbles() {
    this.bubbleTimer = this.scene.time.addEvent({
      delay: 1400,
      loop: true,
      callback: () => {
        if (!this.container || !this.scene) return;
        this.spawnAmbientBubble();
      }
    });
  }

  spawnAmbientBubble(isBurst = false) {
    const sRel = this.scale / 0.20;
    const startX = this.tubWaterCenterX + Phaser.Math.Between(-this.tubRadiusX + 10, this.tubRadiusX - 8);
    const startY = this.tubWaterCenterY + Phaser.Math.Between(-this.tubRadiusY + 3, this.tubRadiusY - 3);

    const bubble = this.scene.add.image(startX, startY, 'fx_bath_bubble');
    const scale = Phaser.Math.FloatBetween(isBurst ? 0.50 : 0.32, isBurst ? 0.90 : 0.60) * sRel;
    bubble.setScale(scale);
    bubble.setAlpha(0.85);
    this.container.add(bubble);

    const riseDistance = Phaser.Math.Between(isBurst ? 35 : 20, isBurst ? 55 : 35) * sRel;
    const swayX = Phaser.Math.Between(-8, 8) * sRel;

    this.scene.tweens.add({
      targets: bubble,
      y: startY - riseDistance,
      x: startX + swayX,
      alpha: 0,
      duration: Phaser.Math.Between(1500, 2400),
      ease: 'Sine.easeOut',
      onComplete: () => bubble.destroy()
    });
  }

  /**
   * Kích hoạt đợt nước bắn mạnh mẽ và bọt xà phòng tung tăng khi bé tương tác tắm!
   */
  triggerSplashBurst() {
    // 1. Sóng nước dâng cao
    this.spawnImpactRipple(1.8);
    this.spawnImpactRipple(1.4);

    // 2. Tung tóe nhiều giọt nước
    for (let i = 0; i < 14; i++) {
      this.scene.time.delayedCall(i * 25, () => {
        this.spawnSplashDroplet(true);
      });
    }

    // 3. Bọt xà phòng lung linh bay lên
    for (let i = 0; i < 7; i++) {
      this.scene.time.delayedCall(i * 60, () => {
        this.spawnAmbientBubble(true);
      });
    }

    // 4. Lóe sáng vòi nước
    if (this.spoutGlow) {
      this.scene.tweens.add({
        targets: this.spoutGlow,
        scale: 2.2,
        alpha: 1.0,
        duration: 200,
        yoyo: true,
        repeat: 2
      });
    }
  }

  destroy() {
    if (this.dropletTimer) this.dropletTimer.destroy();
    if (this.rippleTimer) this.rippleTimer.destroy();
    if (this.bubbleTimer) this.bubbleTimer.destroy();

    this.splashes.forEach(s => s.sprite?.destroy());
    this.splashes = [];

    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}
