import * as Phaser from 'phaser';

/**
 * TeleportPortal Entity (Cổng Dịch Chuyển Không Gian Cầu Vồng)
 * - 8 Frames Animation Spritesheet
 * - Hiệu ứng hào quang, bụi sao ma thuật xoay tròn
 * - Phát hiện va chạm / tương tác khi Bé Sâu bước vào
 * - Kích hoạt chuỗi 8 Bước Dịch Chuyển Không Gian hoành tráng đa sắc
 */
export class TeleportPortal {
  constructor(scene, portalData = {}) {
    this.scene = scene;
    this.data = portalData;
    this.x = portalData.x || 1200;
    this.y = portalData.y || 440;
    this.targetMapId = portalData.targetMapId || 'map2';
    this.targetMapName = portalData.targetMapName || '';
    this.isReturn = Boolean(portalData.isReturn);
    this.isWarping = false;
    this.isUnlocked = portalData.isUnlocked ?? true;

    // 1. Đăng ký animation 8 frame lặp vô tận nếu chưa có
    if (!scene.anims.exists('portal_vortex_loop')) {
      scene.anims.create({
        key: 'portal_vortex_loop',
        frames: scene.anims.generateFrameNumbers('teleport_portal_sheet', { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1
      });
    }

    // 2. Container hiển thị Cổng thần
    this.container = scene.add.container(this.x, this.y).setDepth(4);
    this.size = 118; // Kích thước cổng thu nhỏ gọn gàng, thanh thoát (từ 165 xuống 118px)

    // Đổ bóng chân thực & Hào quang mặt đất (Ground Shadow & Rainbow Aura)
    this.groundShadow = scene.add.graphics();
    this.drawGroundShadow();
    this.container.add(this.groundShadow);

    // Sprite cổng ma thuật 8-frame loop (kích thước hiển thị 118x118 px)
    this.sprite = scene.add.sprite(0, -6, 'teleport_portal_sheet');
    this.sprite.setDisplaySize(this.size, this.size);
    if (this.isReturn) {
      // Cổng trở về mang sắc hồng ngọc / hoa anh đào huyền bí
      this.sprite.setTint(0xffd5ec);
    }
    this.sprite.play('portal_vortex_loop');
    this.container.add(this.sprite);

    // 3. Nhãn tên điểm đến tinh tế, nhỏ gọn phía trên đỉnh vòm cổng ma thuật
    this.badgeContainer = null;
    this.badgeTween = null;
    this.createDelicateBadge();

    // Nhịp thở nhấp nhô nhẹ cho toàn bộ cổng
    this.pulseTween = scene.tweens.add({
      targets: this.sprite,
      scaleX: this.sprite.scaleX * 1.04,
      scaleY: this.sprite.scaleY * 1.04,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 4. Vùng cảm ứng / Click tương tác vừa vặn
    this.touchZone = scene.add.zone(this.x, this.y - 10, 95, 125)
      .setInteractive({ useHandCursor: true });

    this.touchZone.on('pointerdown', (pointer) => {
      pointer?.event?.stopPropagation?.();
      this.handleInteract();
    });

    // 5. Các hạt sao lơ lửng quanh cổng
    this.sparkles = [];
    this.createFloatingSparkles();
  }

  createDelicateBadge() {
    let rawName = this.targetMapName || this.data.name || '';
    if (!rawName) {
      rawName = this.isReturn ? 'Nông Trại' : 'Đi Tiếp';
    }
    // Rút gọn bớt tiền tố dài nếu có để giữ nhãn luôn nhỏ gọn, tinh tế
    const cleanName = rawName
      .replace(/^Cổng Dịch Chuyển (Sang|Trở Về) /i, '')
      .replace(/^Cổng (Sang|Về|Trở Về) /i, '')
      .replace(/^Cổng /i, '')
      .replace(/^Cửa Về /i, '')
      .trim();

    const icon = this.isReturn ? '🏡 ' : '✨ ';
    const fullText = `${icon}${cleanName}`;

    // Text Phaser nhỏ gọn, thanh thoát (10.5px)
    const labelText = this.scene.add.text(0, 0, fullText, {
      fontFamily: 'Quicksand, Nunito, "Segoe UI", sans-serif',
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Đổ bóng chữ nhẹ nhàng để dễ đọc trên mọi nền cảnh vật
    labelText.setShadow(0, 1, 'rgba(0, 0, 0, 0.75)', 2, false, true);

    const padX = 8;
    const badgeW = Math.max(46, Math.round(labelText.width + padX * 2));
    const badgeH = 19;
    const badgeR = 9.5;
    const badgeY = -72; // Nằm thanh mảnh ngay phía trên đỉnh vòm cổng (vòm cổng đỉnh ~ -65)

    const bg = this.scene.add.graphics();
    const fillColor = this.isReturn ? 0x2e0818 : 0x091428;
    const strokeColor = this.isReturn ? 0xf472b6 : 0x38bdf8;

    // Nền pill bán trong suốt (frosted glass) sang trọng, tinh tế
    bg.fillStyle(fillColor, 0.76);
    bg.fillRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, badgeR);

    // Viền mảnh 1px tinh tế với ánh ngọc
    bg.lineStyle(1, strokeColor, 0.72);
    bg.strokeRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, badgeR);

    // Hai hạt bụi sao lấp lánh nhẹ ở 2 đầu viền pill
    bg.fillStyle(0xffffff, 0.85);
    bg.fillCircle(-badgeW / 2 + 5, 0, 1.1);
    bg.fillCircle(badgeW / 2 - 5, 0, 1.1);

    this.badgeContainer = this.scene.add.container(0, badgeY, [bg, labelText]);
    this.container.add(this.badgeContainer);

    // Nhịp thở nhấp nhô nhẹ nhàng đồng điệu theo cổng (chỉ dao động 2.5px cực kỳ êm ái)
    this.badgeTween = this.scene.tweens.add({
      targets: this.badgeContainer,
      y: badgeY - 2.5,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  drawGroundShadow() {
    this.groundShadow.clear();
    // 1. Bóng đổ mặt đất đậm đà, tự nhiên dưới chân cổng đá trên cạn
    this.groundShadow.fillStyle(0x0a1612, 0.44);
    this.groundShadow.fillEllipse(0, 46, 96, 24);
    this.groundShadow.fillStyle(0x020617, 0.3);
    this.groundShadow.fillEllipse(0, 46, 68, 15);

    // 2. Viền hào quang năng lượng nhẹ nhàng tỏa ra ở đáy cổng (hồng ngọc cho Cổng Về, lam ngọc cho Cổng Tiến)
    const auraColor = this.isReturn ? 0xf472b6 : 0x38bdf8;
    this.groundShadow.fillStyle(auraColor, 0.26);
    this.groundShadow.fillEllipse(0, 46, 110, 30);
  }

  createFloatingSparkles() {
    const chars = this.isReturn ? ['🌸', '🍃', '✨', '💖', '⭐'] : ['✦', '⭐', '✨', '🌈', '💎'];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dist = 48 + (i % 2) * 12;
      const sp = this.scene.add.text(
        Math.cos(angle) * dist,
        -10 + Math.sin(angle) * 32,
        chars[i % chars.length],
        { fontSize: '14px' }
      ).setOrigin(0.5).setAlpha(0.85);

      this.container.add(sp);
      this.sparkles.push(sp);

      // Quỹ đạo xoay nhẹ
      this.scene.tweens.add({
        targets: sp,
        y: sp.y + (i % 2 === 0 ? -12 : 12),
        alpha: 0.4,
        scale: 1.25,
        duration: 900 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  update(heroX, heroY) {
    if (this.isWarping || !this.isUnlocked) return;

    // Chỉ khi nhân vật bước đến sát trước cửa thần kỳ (<32px) mới kích hoạt hiệu ứng hút vào
    const targetStandX = this.x;
    const targetStandY = Math.min(650, Math.max(75, this.y + 15));
    const dist = Math.hypot(heroX - targetStandX, heroY - targetStandY);
    if (dist < 32) {
      this.enterPortal();
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    if (this.container) {
      this.container.setPosition(x, y);
    }
    if (this.touchZone) {
      this.touchZone.setPosition(x, y - 10);
    }
  }

  spawnAt(x, y) {
    this.setPosition(x, y);
    this.isWarping = false;
    this.isUnlocked = true;
    if (this.container) {
      this.container.setVisible(true);
      this.container.setScale(0);
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1,
        scaleY: 1,
        duration: 900,
        ease: 'Back.easeOut',
        delay: 300
      });
    }
    // Hiệu ứng sóng năng lượng Cầu Vồng khi cổng mở ra tại chỗ Boss chết
    if (this.scene) {
      const burst = this.scene.add.circle(x, y, 40, 0x38bdf8, 0.85).setDepth(6);
      this.scene.tweens.add({
        targets: burst,
        scale: 3.2,
        alpha: 0,
        duration: 850,
        ease: 'Cubic.easeOut',
        onComplete: () => burst.destroy()
      });
    }
  }

  handleInteract() {
    if (this.isWarping || !this.isUnlocked) return;

    const hero = this.scene?.hero;
    if (!hero) {
      this.enterPortal();
      return;
    }

    const heroX = hero.getX();
    const heroY = hero.getY();
    const targetStandX = this.x;
    const targetStandY = Math.min(650, Math.max(75, this.y + 15));
    const dist = Math.hypot(heroX - targetStandX, heroY - targetStandY);

    // Nếu đã ở sát trước cửa thần kỳ (<= 35px), kích hoạt hiệu ứng hút vào ngay
    if (dist <= 35) {
      this.enterPortal();
      return;
    }

    // Nếu nhân vật còn ở xa: Di chuyển đến trước cửa thần kỳ, khi đến gần mới bị hút vào!
    hero.moveTo(targetStandX, targetStandY, () => {
      if (!this.isWarping && this.isUnlocked) {
        this.enterPortal();
      }
    });
  }

  enterPortal() {
    if (this.isWarping) return;
    this.isWarping = true;

    // Phát sự kiện bắt đầu chuỗi 8 Bước Dịch Chuyển Không Gian
    window.dispatchEvent(new CustomEvent('game:portal-warp-start', {
      detail: {
        portalX: this.x,
        portalY: this.y,
        targetMapId: this.targetMapId,
        targetMapName: this.targetMapName,
        isReturn: this.isReturn,
        portalData: this.data
      }
    }));
  }

  destroy() {
    if (this.pulseTween) this.pulseTween.stop();
    if (this.badgeTween) this.badgeTween.stop();
    if (this.touchZone) this.touchZone.destroy();
    if (this.container) this.container.destroy();
  }
}
