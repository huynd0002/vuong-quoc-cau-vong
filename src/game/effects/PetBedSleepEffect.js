import * as Phaser from 'phaser';

/**
 * PetBedSleepEffect (Hiệu ứng Chỗ Nằm & Giấc Ngủ Ấm Áp Cho Thú Cưng)
 * - Vùng đệm êm ái với ánh sáng ấm áp (warm cozy glow) được phóng to 40%.
 * - Duy nhất 1 chữ 'z-z-z' lơ lửng bay lên nhẹ nhàng, êm dịu khi cún nằm ngủ,
 *   không hiện lung tung, không spam biểu tượng.
 */
export class PetBedSleepEffect {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.x = config.x ?? 578;
    this.y = config.y ?? 340;
    this.scale = config.scale ?? 0.45;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(4); // Nằm ngay trên đệm và dưới thú cưng/popup

    this.isPetSleepingOnBed = false;
    this.activeSleepZText = null;
    this.nextZTimer = null;

    this.createCozyAura();
  }

  /**
   * Tạo quầng sáng ấm áp dưới đáy đệm nằm (được tăng kích thước 40% cho vừa đệm mới)
   */
  createCozyAura() {
    this.aura = this.scene.add.ellipse(this.x, this.y + 14, 118, 53, 0xfbbf24, 0.22);
    this.container.add(this.aura);

    this.scene.tweens.add({
      targets: this.aura,
      scaleX: 1.12,
      scaleY: 1.12,
      alpha: 0.35,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Đặt trạng thái thú cưng đang nằm ngủ trên đệm
   */
  setPetSleeping(isSleeping) {
    const bool = Boolean(isSleeping);
    if (this.isPetSleepingOnBed === bool) return;
    this.isPetSleepingOnBed = bool;

    if (this.isPetSleepingOnBed) {
      this.scheduleNextSleepZ(200);
    } else {
      this.clearActiveSleepZ();
    }
  }

  /**
   * Lên lịch sinh chữ 'z-z-z' tiếp theo (đảm bảo chỉ có tối đa 1 chữ tại một thời điểm)
   */
  scheduleNextSleepZ(delay = 800) {
    if (!this.isPetSleepingOnBed || !this.scene) return;
    if (this.nextZTimer) {
      this.nextZTimer.remove();
      this.nextZTimer = null;
    }

    this.nextZTimer = this.scene.time.delayedCall(delay, () => {
      this.nextZTimer = null;
      this.spawnSingleSleepZ();
    });
  }

  /**
   * Sinh đúng 1 chữ 'z-z-z' bay lên êm dịu, nhẹ nhàng
   */
  spawnSingleSleepZ() {
    if (!this.isPetSleepingOnBed || !this.container || !this.scene) return;
    if (this.activeSleepZText) return; // Đang có 1 chữ bay lên -> không sinh thêm

    // Vị trí hơi chếch phía trên đầu cún đang ngủ (đồng bộ theo độ cao nâng lên trong lòng phao)
    const startX = this.x + 16;
    const startY = this.y - 20;

    const txt = this.scene.add.text(startX, startY, 'z-z-z', {
      fontSize: '18px',
      fontFamily: 'Segoe UI, Arial, sans-serif' ,
      fontStyle: 'bold',
      color: '#38bdf8',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(15);

    this.container.add(txt);
    this.activeSleepZText = txt;

    this.scene.tweens.add({
      targets: txt,
      x: startX + 8,
      y: startY - 32,
      scale: { from: 0.85, to: 1.15 },
      alpha: { from: 0.95, to: 0 },
      duration: 2200,
      ease: 'Sine.easeOut',
      onComplete: () => {
        if (txt?.active) txt.destroy();
        this.activeSleepZText = null;
        // Sau khi chữ cũ tan biến hoàn toàn, đợi 600ms rồi mới cho chữ tiếp theo bay lên
        if (this.isPetSleepingOnBed) {
          this.scheduleNextSleepZ(600);
        }
      }
    });
  }

  clearActiveSleepZ() {
    if (this.nextZTimer) {
      this.nextZTimer.remove();
      this.nextZTimer = null;
    }
    if (this.activeSleepZText) {
      if (this.scene?.tweens) {
        this.scene.tweens.killTweensOf(this.activeSleepZText);
      }
      if (this.activeSleepZText.active) {
        this.activeSleepZText.destroy();
      }
      this.activeSleepZText = null;
    }
  }

  destroy() {
    this.clearActiveSleepZ();
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}
