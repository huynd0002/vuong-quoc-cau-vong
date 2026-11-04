import * as Phaser from 'phaser';

/**
 * PropEntity
 * Quản lý các đối tượng môi trường sống động (Props):
 * - Đèn lồng đung đưa, hoa sen bồng bềnh, khóm nấm phát sáng, đống rơm xào xạc
 * - Bảng chỉ đường có chú chim xanh hót líu lo
 * - Rương báu ma thuật mở ra thưởng 5 ngôi sao may mắn
 * - Tương tác click / chạm cảm ứng và hiệu ứng hạt lấp lánh
 */
export class PropEntity {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.id = config.id;
    this.type = config.type;
    this.x = config.x;
    this.y = config.y;
    this.scale = config.scale || 0.5;
    this.isOpened = false;

    // 1. Tạo Sprite
    const textureKey = config.type;
    const originY = config.type === 'prop_lantern' ? 0.1 : 0.9;
    
    this.sprite = scene.add.image(this.x, this.y, textureKey)
      .setScale(this.scale)
      .setOrigin(0.5, originY)
      .setDepth(config.depth || 4);

    // 2. Thiết lập hoạt ảnh môi trường (Ambient Animation)
    this.setupAmbientAnimation();

    // 3. Tương tác khi chạm / bấm vào Prop
    if (config.interactive !== false) {
      this.sprite.setInteractive({ useHandCursor: true });
      this.sprite.on('pointerdown', (pointer) => {
        this.handleInteract(pointer);
      });
    }
  }

  setupAmbientAnimation() {
    switch (this.type) {
      case 'prop_lotus':
        // Hoa sen dập dềnh bồng bềnh trên mặt nước ao
        this.scene.tweens.add({
          targets: this.sprite,
          y: this.y - 5,
          scaleX: this.scale * 1.03,
          duration: 1600 + Math.random() * 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;

      case 'prop_lantern':
        // Đèn lồng đung đưa êm ả như có gió thoảng
        this.scene.tweens.add({
          targets: this.sprite,
          angle: 4.5,
          duration: 2200 + Math.random() * 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;

      case 'prop_chest':
        // Rương báu nhấp nhô nhẹ mời gọi bé khám phá
        this.scene.tweens.add({
          targets: this.sprite,
          scaleX: this.scale * 1.05,
          scaleY: this.scale * 1.05,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;

      case 'prop_mushrooms':
        // Nấm cổ tích phát quang nhấp nháy êm dịu
        this.scene.tweens.add({
          targets: this.sprite,
          alpha: 0.88,
          scaleY: this.scale * 1.04,
          duration: 1300,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;

      case 'prop_flower_bush':
        // Bụi hoa nhún nhảy nhẹ theo làn gió
        this.scene.tweens.add({
          targets: this.sprite,
          scaleY: this.scale * 1.03,
          duration: 1400 + Math.random() * 300,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;

      case 'prop_signpost':
        // Chú chim trên bảng gỗ nhấp nhô vui vẻ
        this.scene.tweens.add({
          targets: this.sprite,
          y: this.y - 3,
          duration: 1100,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;

      case 'prop_haystack':
        // Đống rơm vàng êm đềm
        this.scene.tweens.add({
          targets: this.sprite,
          scaleX: this.scale * 1.02,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;
    }
  }

  handleInteract() {
    // 1. Hiệu ứng nhún nảy (Squash and stretch)
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: this.scale * 1.25,
      scaleY: this.scale * 0.82,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    const audioService = this.scene.audioService;

    // 2. Xử lý tương tác riêng cho từng loại prop
    switch (this.type) {
      case 'prop_chest':
        this.openChest();
        break;

      case 'prop_signpost':
        if (audioService) {
          audioService.playTone(660, 0.1, 'triangle');
          audioService.playTone(880, 0.12, 'sine');
          audioService.speak('Bảng chỉ đường: Đi thẳng vào làng, rẽ phải đến Cổng Hoa Cầu Vồng!');
        }
        this.spawnFloatingToast('🐦 Chíp chíp! "👈 Vườn Cầu Vồng | Cổng Thần 👉"', '#38bdf8');
        break;

      case 'prop_lotus':
        if (audioService) {
          audioService.playTone(520, 0.15, 'sine');
        }
        this.spawnFloatingToast('🪷 Hoa sen bồng bềnh tỏa hương ngát!', '#f472b6');
        break;

      case 'prop_mushrooms':
        if (audioService) {
          audioService.playTone(580, 0.12, 'sine');
          audioService.playTone(720, 0.15, 'sine');
        }
        this.spawnFloatingToast('🍄 Nấm cổ tích phát sáng lấp lánh!', '#ec4899');
        break;

      case 'prop_flower_bush':
        if (audioService) {
          audioService.playTone(480, 0.1, 'triangle');
        }
        this.spawnFloatingToast('🌸 Hoa tươi rực rỡ đón chào bé!', '#f59e0b');
        break;

      case 'prop_haystack':
        if (audioService) {
          audioService.playTone(320, 0.12, 'square');
        }
        this.spawnFloatingToast('🌾 Đống rơm thơm ngát mùi lúa chín!', '#eab308');
        break;

      case 'prop_lantern':
        if (audioService) {
          audioService.playTone(640, 0.14, 'sine');
        }
        this.spawnFloatingToast('🏮 Đèn lồng đỏ mang niềm vui may mắn!', '#ef4444');
        break;
    }
  }

  openChest() {
    const audioService = this.scene.audioService;
    if (this.isOpened) {
      if (audioService) audioService.playChime(540, 0.1);
      this.spawnFloatingToast('🎁 Rương thần kỳ đã ban may mắn cho bé rồi!', '#facc15');
      return;
    }

    this.isOpened = true;

    // Âm thanh ăn mừng rộn rã
    if (audioService) {
      audioService.playSuccess();
      audioService.speak('Chúc mừng bé tìm thấy Rương Thần Kỳ, nhận 5 Ngôi Sao May Mắn!');
    }

    // Tung hoa sao
    this.spawnFloatingToast('🌟 +5 NGÔI SAO MAY MẮN! 🎁', '#facc15', 26);

    // Bắn sự kiện cộng thưởng sao
    window.dispatchEvent(new CustomEvent('game:prop-reward', {
      detail: {
        propId: this.id,
        reward: { stars: this.config.rewardStars || 5, exp: 15 }
      }
    }));
  }

  spawnFloatingToast(text, color = '#ffffff', fontSize = 16) {
    const toast = this.scene.add.text(this.x, this.y - 75, text, {
      fontFamily: 'Segoe UI, Arial, sans-serif' ,
      fontSize: `${fontSize}px`,
      fontStyle: 'bold',
      color: color,
      stroke: '#1e293b',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(20);

    this.scene.tweens.add({
      targets: toast,
      y: this.y - 125,
      alpha: 0,
      duration: 1400,
      ease: 'Cubic.easeOut',
      onComplete: () => toast.destroy()
    });
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}
