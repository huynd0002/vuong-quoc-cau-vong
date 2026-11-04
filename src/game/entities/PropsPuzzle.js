import * as Phaser from 'phaser';

/**
 * Props Puzzle Entity: Cổng Hoa Cầu Vồng
 * Chướng ngại vật môi trường yêu cầu hoàn thành giải cứu bạn bè trước khi mở lối đến Boss.
 */

export class PropsPuzzle {
  constructor(scene, puzzleData) {
    this.scene = scene;
    this.data = puzzleData;
    this.x = puzzleData.x;
    this.y = puzzleData.y;
    this.isUnlocked = false;

    // 1. Vẽ Cổng hoa dạng đồ họa thân thiện
    this.container = scene.add.container(this.x, this.y).setDepth(3);

    // Cột cổng hai bên
    this.archGfx = scene.add.graphics();
    this.drawArch(false);
    this.container.add(this.archGfx);

    // Biểu tượng hoa trung tâm
    this.flowerIcon = scene.add.text(0, -65, '🌸', { fontSize: '42px' }).setOrigin(0.5);
    this.lockIcon = scene.add.text(0, -10, '🔒', { fontSize: '32px' }).setOrigin(0.5);
    this.container.add([this.flowerIcon, this.lockIcon]);

    // Vùng chạm cảm ứng để nghe gợi ý
    this.touchZone = scene.add.zone(this.x, this.y - 25, 110, 150)
      .setInteractive({ useHandCursor: true });

    this.touchZone.on('pointerdown', () => {
      this.handleTouch();
    });

    // Lắc lư nhẹ
    this.bobTween = scene.tweens.add({
      targets: this.flowerIcon,
      y: -70,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  drawArch(unlocked) {
    this.archGfx.clear();
    if (unlocked) {
      // Cổng hoa nở rộ hào quang
      this.archGfx.lineStyle(10, 0xffe066, 0.95);
      this.archGfx.strokeRoundedRect(-45, -75, 90, 150, 45);
      this.archGfx.lineStyle(4, 0xff99c8, 0.85);
      this.archGfx.strokeRoundedRect(-50, -80, 100, 160, 50);
    } else {
      // Cổng hoa dây leo khép cánh
      this.archGfx.lineStyle(8, 0x66a074, 0.9);
      this.archGfx.strokeRoundedRect(-40, -70, 80, 140, 40);
      this.archGfx.fillStyle(0x40734d, 0.25);
      this.archGfx.fillRoundedRect(-36, -66, 72, 132, 36);
    }
  }

  checkUnlockCondition(rescuedFriendsMap = {}) {
    if (this.isUnlocked) return true;
    const required = this.data.requiredRescues || [];
    if (required.length === 0) {
      this.unlock();
      return true;
    }

    // Đếm số bạn quái đã được giải cứu trong map này
    const rescuedCount = required.filter(id => Boolean(rescuedFriendsMap[id])).length;
    // Yêu cầu: Đã giải cứu từ 2 bạn quái trở lên (hoặc tất cả nếu danh sách ít hơn 2)
    const minRequired = this.data.minRequired || required.length;
    const canUnlock = rescuedCount >= minRequired || required.every(id => Boolean(rescuedFriendsMap[id]));

    if (canUnlock) {
      this.unlock();
      return true;
    }
    return false;
  }

  unlock() {
    if (this.isUnlocked) return;
    this.isUnlocked = true;

    this.drawArch(true);
    this.lockIcon.setText('✨');
    this.flowerIcon.setText('🌺');

    this.scene.tweens.add({
      targets: [this.flowerIcon, this.lockIcon],
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 300,
      yoyo: true,
      repeat: 2,
      ease: 'Back.easeOut'
    });

    window.dispatchEvent(new CustomEvent('game:puzzle-unlocked', {
      detail: { puzzleId: this.data.id, message: this.data.hintUnlocked }
    }));
  }

  handleTouch() {
    if (this.isUnlocked) {
      window.dispatchEvent(new CustomEvent('game:puzzle-touch', {
        detail: { puzzleId: this.data.id, message: this.data.hintUnlocked, isUnlocked: true }
      }));
      window.dispatchEvent(new CustomEvent('game:show-toast', {
        detail: { message: this.data.hintUnlocked }
      }));
      return;
    }

    // Tự động kiểm tra lại điều kiện mở khóa khi chạm vào cổng
    const inSceneRescued = this.scene?.monsters ? this.scene.monsters.filter(m => m.isRescued).map(m => m.data.id) : [];
    const checkMap = {};
    inSceneRescued.forEach(id => { checkMap[id] = true; });

    if (this.checkUnlockCondition(checkMap)) {
      return;
    }

    const required = this.data.requiredRescues || [];
    const target = this.data.minRequired || required.length;
    const count = required.filter(id => Boolean(checkMap[id])).length;

    const message = count > 0
      ? `🌸 Cổng hoa đang dần hé nở! Bé đã giúp được ${count}/${target} bạn nhỏ rồi! Cùng giúp thêm bạn tiếp theo nhé!`
      : (this.data.hintLocked || `Cổng hoa đang khép cánh! Bé hãy giúp hết các bạn nhỏ trên đường để mở khóa nhé!`);

    window.dispatchEvent(new CustomEvent('game:puzzle-touch', {
      detail: { puzzleId: this.data.id, message, isUnlocked: false }
    }));
    window.dispatchEvent(new CustomEvent('game:show-toast', {
      detail: { message }
    }));
  }

  destroy() {
    if (this.bobTween) this.bobTween.stop();
    if (this.container) this.container.destroy();
    if (this.touchZone) this.touchZone.destroy();
  }
}
