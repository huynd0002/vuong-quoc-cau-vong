import * as Phaser from 'phaser';

/**
 * FireflyEffect (Hiệu ứng Đom Đóm Dạ Quang Bay Lượn Khắp Bản Đồ)
 * - Tự động tạo kết cấu đom đóm phát sáng đa lớp (Radial Glow Texture).
 * - Hoạt ảnh bay bổng lơ lửng, nhấp nhô theo sóng hình sin mượt mà.
 * - Nhịp thở nhấp nháy phát sáng (Pulsing Glow) chân thực như đom đóm mùa hạ.
 * - Chế độ hòa trộn ADD (Additive Blending) tạo độ rực rỡ, lung linh huyền diệu.
 * - Tương tác né nhẹ khi Bé Sâu bước lại gần (Startled Flutter).
 * - Bảng màu biến thiên theo từng bản đồ (Làng quê, Vịnh biển, Động pha lê, Rừng kẹo, Hẻm núi, Cung đình).
 */
export class FireflyEffect {
  constructor(scene, mapId = 'map1', count = 14) {
    this.scene = scene;
    this.mapId = mapId;
    this.fireflies = [];
    this.ensureTexture();
    this.palette = this.getMapPalette(mapId);
    this.spawnFireflies(count);
  }

  ensureTexture() {
    if (this.scene.textures.exists('fx_firefly_glow')) return;

    // Vẽ kết cấu đom đóm tỏa sáng đa lớp bằng Graphics (chuẩn WebGL & Canvas)
    const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Lớp 1: Hào quang tán xạ xa (vầng sáng mờ ảo)
    g.fillStyle(0xffffff, 0.08);
    g.fillCircle(16, 16, 15);

    // Lớp 2: Hào quang ấm trung tâm
    g.fillStyle(0xffffff, 0.22);
    g.fillCircle(16, 16, 10);

    // Lớp 3: Thân đom đóm phát quang
    g.fillStyle(0xffffff, 0.48);
    g.fillCircle(16, 16, 6);

    // Lớp 4: Lõi sáng tinh khiết
    g.fillStyle(0xffffff, 0.88);
    g.fillCircle(16, 16, 3);

    // Lớp 5: Tâm điểm trắng chói
    g.fillStyle(0xffffff, 1.0);
    g.fillCircle(16, 16, 1.5);

    g.generateTexture('fx_firefly_glow', 32, 32);
    g.destroy();
  }

  getMapPalette(mapId) {
    switch (mapId) {
      case 'map2':
        // Vịnh Biển: Đom đóm dạ quang biển xanh ngọc & vàng cát
        return [0x6ee7b7, 0x34d399, 0xfde047, 0x38bdf8];
      case 'map3':
        // Động Pha Lê: Đom đóm tinh thể lam tím lấp lánh
        return [0x67e8f9, 0xc084fc, 0xa855f7, 0x38bdf8];
      case 'map4':
        // Rừng Kẹo: Đom đóm thần tiên dâu tây & mật ong ngọt ngào
        return [0xf472b6, 0xfbbf24, 0xfca5a5, 0xfde047];
      case 'map5':
        // Hẻm Núi: Đom đóm gió xanh lục đại ngàn & ánh sao
        return [0xa3e635, 0x4ade80, 0xfacc15, 0x86efac];
      case 'map6':
        // Cung Đình: Đom đóm hoàng kim vương giả & hồng ngọc cầu vồng
        return [0xfbbf24, 0xf59e0b, 0xe879f9, 0xfef08a];
      case 'map1':
      default:
        // Làng Quê Yên Bình: Đom đóm vàng ấm mùa hạ bờ sen
        return [0xfde047, 0xfacc15, 0xfef08a, 0xa3e635];
    }
  }

  spawnFireflies(count) {
    for (let i = 0; i < count; i++) {
      const x = 50 + Math.random() * 1180;
      const y = 80 + Math.random() * 560;

      const sprite = this.scene.add.image(x, y, 'fx_firefly_glow');
      sprite.setBlendMode(Phaser.BlendModes.ADD);

      // Chọn màu ngẫu nhiên theo bảng màu bản đồ
      const tintColor = this.palette[i % this.palette.length];
      sprite.setTint(tintColor);

      // Phân tầng độ sâu (một số bay trước các nhân vật, một số bay sau lùm cây)
      const depth = Math.random() > 0.4 ? 6 : 2;
      sprite.setDepth(depth);

      // Kích thước ngẫu nhiên (từ đom đóm tí hon bay xa đến đom đóm to bay gần)
      const baseScale = 0.45 + Math.random() * 0.45;
      sprite.setScale(baseScale);

      this.fireflies.push({
        sprite,
        baseX: x,
        baseY: y,
        speedX: (Math.random() - 0.5) * 22,
        speedY: (Math.random() - 0.5) * 16,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        freqX: 0.0012 + Math.random() * 0.0018,
        freqY: 0.0016 + Math.random() * 0.0022,
        ampX: 20 + Math.random() * 32,
        ampY: 16 + Math.random() * 26,
        blinkSpeed: 0.002 + Math.random() * 0.003,
        blinkPhase: Math.random() * Math.PI * 2,
        baseScale,
        minAlpha: 0.12 + Math.random() * 0.18,
        maxAlpha: 0.72 + Math.random() * 0.28,
        pushVx: 0,
        pushVy: 0
      });
    }
  }

  update(time, delta, heroX = null, heroY = null) {
    const dt = Math.min(delta / 1000, 0.1);

    for (let i = 0; i < this.fireflies.length; i++) {
      const f = this.fireflies[i];
      if (!f.sprite || !f.sprite.active) continue;

      // 1. Cập nhật vị trí trôi tự nhiên
      f.baseX += f.speedX * dt;
      f.baseY += f.speedY * dt;

      // 2. Tương tác với Bé Sâu: Nếu Bé Sâu đến gần, đom đóm giật mình bay tản ra
      if (heroX !== null && heroY !== null) {
        const dx = (f.baseX - heroX);
        const dy = (f.baseY - heroY);
        const dist = Math.hypot(dx, dy);
        if (dist < 85 && dist > 1) {
          const pushForce = ((85 - dist) / 85) * 90;
          f.pushVx += (dx / dist) * pushForce * dt;
          f.pushVy += (dy / dist) * pushForce * dt;
        }
      }

      // Giảm dần lực đẩy tản ra
      f.baseX += f.pushVx * dt;
      f.baseY += f.pushVy * dt;
      f.pushVx *= 0.92;
      f.pushVy *= 0.92;

      // Giới hạn biên bản đồ mượt mà (wrap-around)
      if (f.baseX < 20) f.baseX = 1260;
      else if (f.baseX > 1260) f.baseX = 20;

      if (f.baseY < 60) f.baseY = 660;
      else if (f.baseY > 660) f.baseY = 60;

      // 3. Chuyển động lượn sóng hình sin 2D êm ái
      const waveX = Math.sin(time * f.freqX + f.phaseX) * f.ampX;
      const waveY = Math.cos(time * f.freqY + f.phaseY) * f.ampY;

      f.sprite.x = f.baseX + waveX;
      f.sprite.y = f.baseY + waveY;

      // 4. Nhịp thở nhấp nháy phát sáng (Pulsing Glow)
      const pulse = (Math.sin(time * f.blinkSpeed + f.blinkPhase) + 1) / 2;
      const currentAlpha = f.minAlpha + pulse * (f.maxAlpha - f.minAlpha);
      f.sprite.setAlpha(currentAlpha);

      // Kích thước cũng co giãn nhẹ theo nhịp thở
      const currentScale = f.baseScale * (0.85 + 0.3 * pulse);
      f.sprite.setScale(currentScale);
    }
  }

  destroy() {
    for (const f of this.fireflies) {
      if (f.sprite) f.sprite.destroy();
    }
    this.fireflies = [];
  }
}
