import * as Phaser from 'phaser';
import { isPointInLake, clampOutOfLake } from '../effects/LakeWaterEffect.js';
import { createGroundShadow } from '../effects/GroundShadow.js';

/**
 * Boss Entity: Nấm Mũ Đỏ Khổng Lồ (Multi-phase Boss)
 * Quản lý hoạt ảnh và biến đổi trạng thái hình ảnh qua từng pha:
 * - Pha 1: Ngủ quên dưới làn mây mù
 * - Pha 2: Thức giấc tỏa hào quang hoa cỏ
 * - Đã giải cứu: Thân thiện, mỉm cười và tặng sao
 */

export class Boss {
  constructor(scene, bossData, textureKey = 'boss_dragon_walk_sheet') {
    this.scene = scene;
    this.data = bossData;

    // 0. Khởi tạo Animations nếu chưa có
    Boss.initAnimations(scene);

    // 1. Phân loại Boss và kích thước hiển thị cân bằng trên bản đồ
    const isCrystalDragon = textureKey.includes('crystal_dragon') || bossData.spriteKey === 'boss_crystal_dragon' || bossData.id === 'boss_map3';
    const isDragon = !isCrystalDragon && (textureKey.includes('dragon') || bossData.spriteKey === 'boss_dragon' || bossData.id?.includes('dragon') || bossData.id === 'boss_map1' || String(bossData.name || '').includes('Rồng') || String(bossData.name || '').includes('Long'));
    const isCrabKing = textureKey.includes('crab') || bossData.spriteKey === 'boss_crab_king' || bossData.id === 'boss_map2';
    const isSphinx = textureKey.includes('sphinx') || bossData.spriteKey === 'boss_desert_sphinx' || bossData.id === 'boss_map4' || String(bossData.name || '').includes('Nhân Sư');

    // Kích thước chuẩn hóa cân đối: Cua Vua 190px, Rồng Pha Lê Map 3 175px, Rồng Thần Map 1 150px
    this.size = isSphinx ? 180 : (isCrabKing ? 190 : (isCrystalDragon ? 175 : 150));
    this.phase = 1;
    this.isRescued = false;
    this.isAppeared = true;

    const { x, y } = bossData;
    this.startX = x;
    this.startY = y;
    this.patrolDist = 55;
    this.isPaused = false;
    this.wanderTimer = null;
    this.activeTween = null;

    const auraColor = isSphinx ? 0xf59e0b : (isCrabKing ? 0x06b6d4 : (isCrystalDragon ? 0xc084fc : 0xf97316));
    
    // Bóng đổ sát đáy thân cho Cua Vua để tạo hiệu ứng tiếp xúc mặt cát chân thực
    const shadowOffsetY = isCrabKing ? 32 : 52;
    this.shadow = isCrabKing ? createGroundShadow(scene, x, y + shadowOffsetY, 185, 48, 0.80).setDepth(2) : null;
    this.aura = isDragon ? null : scene.add.ellipse(x, y + shadowOffsetY, isCrabKing ? 180 : 140, isCrabKing ? 46 : 36, auraColor, isCrabKing ? 0.32 : 0.4).setDepth(2);

    // 2. Sprite chính (Ưu tiên Sprite Sheet hoạt ảnh walk/idle/skill thực sự của Boss tương ứng)
    if (isSphinx && scene.textures.exists('boss_desert_sphinx_walk_sheet')) {
      this.sprite = scene.add.sprite(x, y, 'boss_desert_sphinx_walk_sheet', 0).setDisplaySize(this.size, this.size);
      this.animPrefix = 'boss_desert_sphinx';
      this.playAnim('boss_desert_sphinx_idle');
    } else if (isCrystalDragon && scene.textures.exists('boss_crystal_dragon_walk_sheet')) {
      this.sprite = scene.add.sprite(x, y, 'boss_crystal_dragon_walk_sheet', 0).setDisplaySize(this.size, this.size);
      this.animPrefix = 'boss_crystal_dragon';
      this.playAnim('boss_crystal_dragon_idle');
    } else if (isCrabKing && scene.textures.exists('boss_crab_king_walk_sheet')) {
      this.sprite = scene.add.sprite(x, y, 'boss_crab_king_walk_sheet', 0).setDisplaySize(this.size, this.size);
      this.animPrefix = 'boss_crab_king';
      this.playAnim('boss_crab_king_idle');
    } else if (scene.textures.exists('boss_dragon_walk_sheet')) {
      this.sprite = scene.add.sprite(x, y, 'boss_dragon_walk_sheet', 0).setDisplaySize(this.size, this.size);
      this.animPrefix = 'boss_dragon';
      this.playAnim('idle');
    } else if (scene.textures.exists('boss_bear_walk_sheet')) {
      this.sprite = scene.add.sprite(x, y, 'boss_bear_walk_sheet', 0).setDisplaySize(this.size, this.size);
      this.animPrefix = 'boss_dragon';
      this.playAnim('idle');
    } else if (scene.textures.exists(textureKey)) {
      this.sprite = scene.add.image(x, y, textureKey).setDisplaySize(this.size, this.size);
      this.animPrefix = textureKey;
    } else {
      this.sprite = scene.add.circle(x, y, this.size * 0.42, 0xe87a90, 1).setStrokeStyle(6, 0xffffff, 0.95);
      this.animPrefix = 'boss_dragon';
    }
    this.sprite.setDepth(4);

    // 3. Biểu tượng trạng thái & Tên Boss (Đã xoá tên Boss và icon theo yêu cầu người dùng)
    this.statusTag = null;
    this.bossTitle = null;

    // 4. Hit area
    this.sprite.setInteractive(
      new Phaser.Geom.Circle(this.size / 2, this.size / 2, this.size * 0.5),
      Phaser.Geom.Circle.Contains,
      { useHandCursor: true }
    );

    // 5. Bắt đầu di chuyển tuần tra bước đi / bay lượn của Rồng
    this.startPatrol();
  }

  static initAnimations(scene) {
    if (!scene.anims) return;
    
    // 1. Hoạt ảnh Rồng Thần bước đi / bay lượn (8 frames)
    if (scene.textures.exists('boss_dragon_walk_sheet') && !scene.anims.exists('boss_dragon_walk')) {
      scene.anims.create({
        key: 'boss_dragon_walk',
        frames: scene.anims.generateFrameNumbers('boss_dragon_walk_sheet', { start: 0, end: 7 }),
        frameRate: 6,
        repeat: -1
      });
    } else if (scene.textures.exists('boss_bear_walk_sheet') && !scene.anims.exists('boss_dragon_walk')) {
      scene.anims.create({
        key: 'boss_dragon_walk',
        frames: scene.anims.generateFrameNumbers('boss_bear_walk_sheet', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
      });
    }

    // 2. Hoạt ảnh Rồng Thần đứng thở nhẹ nhàng / Idle (4 frames)
    if (scene.textures.exists('boss_dragon_idle_sheet') && !scene.anims.exists('boss_dragon_idle')) {
      scene.anims.create({
        key: 'boss_dragon_idle',
        frames: scene.anims.generateFrameNumbers('boss_dragon_idle_sheet', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1
      });
    } else if (scene.textures.exists('boss_bear_idle_sheet') && !scene.anims.exists('boss_dragon_idle')) {
      scene.anims.create({
        key: 'boss_dragon_idle',
        frames: scene.anims.generateFrameNumbers('boss_bear_idle_sheet', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1
      });
    }

    // 3. Hoạt ảnh Rồng Thần Xuất Chiêu Phun Lửa / Bay Đến (Skill Attack - 8 frames)
    if (scene.textures.exists('boss_dragon_skill_sheet') && !scene.anims.exists('boss_dragon_skill')) {
      scene.anims.create({
        key: 'boss_dragon_skill',
        frames: scene.anims.generateFrameNumbers('boss_dragon_skill_sheet', { start: 0, end: 7 }),
        frameRate: 7,
        repeat: 0
      });
    }

    // 4. Hoạt ảnh Boss Cua Vua Vỏ Ngọc bước đi (8 frames)
    if (scene.textures.exists('boss_crab_king_walk_sheet') && !scene.anims.exists('boss_crab_king_walk')) {
      scene.anims.create({
        key: 'boss_crab_king_walk',
        frames: scene.anims.generateFrameNumbers('boss_crab_king_walk_sheet', { start: 0, end: 7 }),
        frameRate: 6,
        repeat: -1
      });
    }

    // 5. Hoạt ảnh Boss Cua Vua Vỏ Ngọc thở nhẹ nhàng / Idle (4 frames)
    if (scene.textures.exists('boss_crab_king_idle_sheet') && !scene.anims.exists('boss_crab_king_idle')) {
      scene.anims.create({
        key: 'boss_crab_king_idle',
        frames: scene.anims.generateFrameNumbers('boss_crab_king_idle_sheet', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1
      });
    }

    // 6. Hoạt ảnh Boss Cua Vua Vỏ Ngọc Xuất Chiêu Đại Hồng Thủy (Skill Attack - 8 frames)
    if (scene.textures.exists('boss_crab_king_skill_sheet') && !scene.anims.exists('boss_crab_king_skill')) {
      scene.anims.create({
        key: 'boss_crab_king_skill',
        frames: scene.anims.generateFrameNumbers('boss_crab_king_skill_sheet', { start: 0, end: 7 }),
        frameRate: 7,
        repeat: 0
      });
    }

    // 7. Hoạt ảnh Boss Rồng Pha Lê Ngủ Quên bước đi (8 frames)
    if (scene.textures.exists('boss_crystal_dragon_walk_sheet') && !scene.anims.exists('boss_crystal_dragon_walk')) {
      scene.anims.create({
        key: 'boss_crystal_dragon_walk',
        frames: scene.anims.generateFrameNumbers('boss_crystal_dragon_walk_sheet', { start: 0, end: 7 }),
        frameRate: 6,
        repeat: -1
      });
    }

    // 8. Hoạt ảnh Boss Rồng Pha Lê thở nhẹ nhàng / Idle (4 frames)
    if (scene.textures.exists('boss_crystal_dragon_idle_sheet') && !scene.anims.exists('boss_crystal_dragon_idle')) {
      scene.anims.create({
        key: 'boss_crystal_dragon_idle',
        frames: scene.anims.generateFrameNumbers('boss_crystal_dragon_idle_sheet', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1
      });
    }

    // 10. Hoạt ảnh Boss Thần Nhân Sư Ánh Dương bước đi (8 frames)
    if (scene.textures.exists('boss_desert_sphinx_walk_sheet') && !scene.anims.exists('boss_desert_sphinx_walk')) {
      scene.anims.create({
        key: 'boss_desert_sphinx_walk',
        frames: scene.anims.generateFrameNumbers('boss_desert_sphinx_walk_sheet', { start: 0, end: 7 }),
        frameRate: 6,
        repeat: -1
      });
    }

    // 11. Hoạt ảnh Boss Thần Nhân Sư thở nhẹ nhàng / Idle (8 frames)
    if (scene.textures.exists('boss_desert_sphinx_idle_sheet') && !scene.anims.exists('boss_desert_sphinx_idle')) {
      scene.anims.create({
        key: 'boss_desert_sphinx_idle',
        frames: scene.anims.generateFrameNumbers('boss_desert_sphinx_idle_sheet', { start: 0, end: 7 }),
        frameRate: 4,
        repeat: -1
      });
    }

    // 12. Hoạt ảnh Boss Thần Nhân Sư Xuất Chiêu Bão Cát Thái Dương (Skill Attack - 8 frames)
    if (scene.textures.exists('boss_desert_sphinx_skill_sheet') && !scene.anims.exists('boss_desert_sphinx_skill')) {
      scene.anims.create({
        key: 'boss_desert_sphinx_skill',
        frames: scene.anims.generateFrameNumbers('boss_desert_sphinx_skill_sheet', { start: 0, end: 7 }),
        frameRate: 7,
        repeat: 0
      });
    }

    // 9. Hoạt ảnh Boss Rồng Pha Lê Phun Lửa Cầu Vồng (Skill Attack - 8 frames)
    if (scene.textures.exists('boss_crystal_dragon_skill_sheet') && !scene.anims.exists('boss_crystal_dragon_skill')) {
      scene.anims.create({
        key: 'boss_crystal_dragon_skill',
        frames: scene.anims.generateFrameNumbers('boss_crystal_dragon_skill_sheet', { start: 0, end: 7 }),
        frameRate: 7,
        repeat: 0
      });
    }
  }

  playAnim(action) {
    const key = action.includes('_') ? action : `${this.animPrefix || 'boss_dragon'}_${action}`;
    const directKey = this.scene?.anims?.exists(key) ? key : (this.scene?.anims?.exists(action) ? action : null);
    if (this.sprite?.play && directKey) {
      this.sprite.play(directKey, true);
    }
  }

  syncAttachments() {
    if (!this.sprite?.active) return;
    const sx = this.sprite.x;
    const sy = this.sprite.y;
    const isPhase2 = this.phase === 2;
    const isCrabKing = this.data?.id === 'boss_map2' || this.animPrefix === 'boss_crab_king';
    const tagOffsetY = isPhase2 ? -108 : -92;
    const titleOffsetY = isPhase2 ? 108 : 92;
    const shadowOffsetY = isCrabKing ? (isPhase2 ? 34 : 26) : (isPhase2 ? 65 : 52);
    if (this.aura?.active) this.aura.setPosition(sx, sy + shadowOffsetY);
    if (this.shadow?.active) this.shadow.setPosition(sx, sy + shadowOffsetY);
    if (this.statusTag?.active) this.statusTag.setPosition(sx, sy + tagOffsetY);
    if (this.bossTitle?.active) this.bossTitle.setPosition(sx, sy + titleOffsetY);
  }

  startPatrol() {
    if (!this.scene || !this.sprite || this.isRescued || !this.isAppeared) return;
    this.stopPatrol();
    this.isPaused = false;

    // Khởi đầu tuần tra ngẫu nhiên
    const initialDelay = Phaser.Math.Between(300, 1200);
    this.wanderTimer = this.scene.time.delayedCall(initialDelay, () => {
      this.stepRandomWander();
    });
  }

  stepRandomWander() {
    if (!this.scene || !this.sprite?.active || this.isRescued || !this.isAppeared || this.isPaused) return;

    const currentX = this.sprite.x;
    const currentY = this.sprite.y;

    // 1. Chọn hướng di chuyển ngẫu nhiên và khoảng cách bước đi oai vệ của Boss
    const angle = Math.random() * Math.PI * 2;
    const dist = Phaser.Math.Between(45, 140);

    let targetX = currentX + Math.cos(angle) * dist;
    let targetY = currentY + Math.sin(angle) * dist;

    // 2. Vùng tuần tra rộng rãi của Boss trên bản đồ
    const minX = 720;
    const maxX = 1200;
    const minY = 130;
    const maxY = 590;

    const distFromStart = Math.hypot(targetX - this.startX, targetY - this.startY);
    if (distFromStart > 240 || targetX < minX || targetX > maxX || targetY < minY || targetY > maxY) {
      const returnAngle = Math.atan2(this.startY - currentY, this.startX - currentX) + (Math.random() - 0.5) * 1.0;
      const returnDist = Phaser.Math.Between(40, 110);
      targetX = currentX + Math.cos(returnAngle) * returnDist;
      targetY = currentY + Math.sin(returnAngle) * returnDist;
    }

    targetX = Phaser.Math.Clamp(targetX, minX, maxX);
    targetY = Phaser.Math.Clamp(targetY, minY, maxY);

    // Không cho Boss đi vào khu vực hồ ở Map 1 (Làng Quê Yên Bình)
    const isMap1 = this.scene?.currentMapId === 'map1' || !this.scene?.currentMapId;
    if (isMap1) {
      if (targetY > 460) {
        targetY = 460;
      }
      if (isPointInLake(targetX, targetY + 45)) {
        const safe = clampOutOfLake(targetX, targetY + 45, 30);
        targetX = safe.x;
        targetY = Math.min(460, safe.y - 45);
      }
    }

    const actualDist = Math.hypot(targetX - currentX, targetY - currentY);
    if (actualDist < 15) {
      this.playAnim('idle');
      this.wanderTimer = this.scene.time.delayedCall(Phaser.Math.Between(800, 1800), () => {
        this.stepRandomWander();
      });
      return;
    }

    // 3. Đổi hướng quay mặt theo hướng di chuyển thực tế (dx)
    const dx = targetX - currentX;
    if (dx < -3) {
      this.sprite.setFlipX(true); // Tiến về phía trước bên trái
    } else if (dx > 3) {
      this.sprite.setFlipX(false); // Tiến sang phải
    }

    // 4. Bật hoạt ảnh bước đi oai nghiêm
    this.playAnim('walk');

    // 5. Tốc độ di chuyển oai phong (55px/s)
    const duration = Math.round((actualDist / 55) * 1000);

    this.activeTween = this.scene.tweens.add({
      targets: this.sprite,
      x: targetX,
      y: targetY,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.syncAttachments();
      },
      onComplete: () => {
        this.activeTween = null;
        if (!this.sprite?.active || this.isRescued || !this.isAppeared || this.isPaused) return;

        this.playAnim('idle');

        // Thỉnh thoảng (khoảng 1 trong 3 lần tuần tra dừng lại), Boss thi triển skill phun lửa thị uy trên bản đồ!
        const shouldShowSkill = Phaser.Math.Between(1, 3) === 1 && !this.isSkillCasting;
        if (shouldShowSkill && this.scene?.isExploring) {
          const heroX = this.scene.hero ? this.scene.hero.getX() : this.sprite.x - 60;
          const heroY = this.scene.hero ? this.scene.hero.getY() : this.sprite.y;
          this.isSkillCasting = true;
          this.performSkillAttack(heroX, heroY, () => {
            this.isSkillCasting = false;
          });
          return;
        }

        const pauseTime = Phaser.Math.Between(1000, 2600);
        this.wanderTimer = this.scene.time.delayedCall(pauseTime, () => {
          this.stepRandomWander();
        });
      }
    });
  }

  stopPatrol() {
    if (this.wanderTimer) {
      this.wanderTimer.remove(false);
      this.wanderTimer = null;
    }
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }
    if (this.sprite?.active) {
      this.sprite.setAngle(0);
      this.playAnim('idle');
    }
  }

  pausePatrol() {
    this.isPaused = true;
    if (this.wanderTimer) {
      this.wanderTimer.paused = true;
    }
    if (this.activeTween) {
      this.activeTween.pause();
    }
    if (this.sprite?.active) {
      this.sprite.setAngle(0);
      this.playAnim('idle');
    }
  }

  resumePatrol() {
    if (this.isRescued || !this.isAppeared || !this.sprite?.active) return;
    this.isPaused = false;
    if (this.activeTween && this.activeTween.isPaused()) {
      this.activeTween.resume();
      this.playAnim('walk');
    } else if (this.wanderTimer && this.wanderTimer.paused) {
      this.wanderTimer.paused = false;
    } else {
      this.stepRandomWander();
    }
  }

  hide() {
    this.isAppeared = false;
    this.stopPatrol();
    if (this.sprite) {
      this.sprite.setVisible(false);
      this.sprite.disableInteractive();
    }
    if (this.aura) this.aura.setVisible(false);
    if (this.shadow) this.shadow.setVisible(false);
    if (this.statusTag) this.statusTag.setVisible(false);
    if (this.bossTitle) this.bossTitle.setVisible(false);
  }

  show() {
    this.isAppeared = true;
    if (this.sprite) {
      this.sprite.setVisible(true);
      this.sprite.setInteractive();
    }
    if (this.aura) this.aura.setVisible(true);
    if (this.shadow) this.shadow.setVisible(true);
    if (this.statusTag) this.statusTag.setVisible(true);
    if (this.bossTitle) this.bossTitle.setVisible(true);
    this.startPatrol();
  }

  appearWithCinematic(onComplete) {
    this.isAppeared = true;
    if (this.sprite) {
      this.sprite.setVisible(true);
      this.sprite.setDisplaySize(0, 0);
      this.sprite.setAlpha(0);
      this.sprite.setInteractive();
    }
    if (this.aura) {
      this.aura.setVisible(true);
      this.aura.setScale(0);
    }
    if (this.shadow) {
      this.shadow.setVisible(true);
      this.shadow.setScale(0);
    }
    if (this.statusTag) {
      this.statusTag.setVisible(true);
      this.statusTag.setAlpha(0);
    }
    if (this.bossTitle) {
      this.bossTitle.setVisible(true);
      this.bossTitle.setAlpha(0);
    }

    // Hiệu ứng xuất hiện rực rỡ scale từ 0 lên kích thước chuẩn this.size
    this.scene.tweens.add({
      targets: this.sprite,
      displayWidth: this.size,
      displayHeight: this.size,
      alpha: 1,
      duration: 850,
      ease: 'Back.easeOut'
    });
    this.scene.tweens.add({
      targets: [this.aura, this.shadow].filter(Boolean),
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 850,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (this.scene?.cameras?.main) {
          this.scene.cameras.main.shake(350, 0.008);
        }
        if (this.statusTag) this.statusTag.setAlpha(1);
        if (this.bossTitle) this.bossTitle.setAlpha(1);
        this.playAnim('idle');
        this.startPatrol();
        if (typeof onComplete === 'function') onComplete();
      }
    });
  }

  onInteract(callback) {
    this.sprite.on('pointerdown', () => {
      if (!this.isRescued && this.isAppeared && typeof callback === 'function') {
        callback(this.data, this.phase);
      }
    });
  }

  performSkillAttack(targetX, targetY, onComplete) {
    if (!this.sprite?.active || this.isRescued) return;
    this.stopPatrol();

    // Sprite skill tự nhiên đã hướng sang trái, nên nếu mục tiêu ở bên phải thì mới cần lật
    if (typeof targetX === 'number') {
      this.sprite.setFlipX(targetX > this.sprite.x);
    }

    // Phát hoạt ảnh Xuất Chiêu (8 frames)
    this.playAnim('skill');

    // Tạo hiệu ứng sóng nhiệt lửa bùng phát
    if (this.scene) {
      const offsetX = this.sprite.flipX ? 50 : -50;
      const fx = this.scene.add.circle(this.sprite.x + offsetX, this.sprite.y - 12, 36, 0xf97316, 0.85).setDepth(5);
      this.scene.tweens.add({
        targets: fx,
        scale: 2.8,
        alpha: 0,
        duration: 900,
        ease: 'Quad.easeOut',
        onComplete: () => fx.destroy()
      });
    }

    this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.playAnim('idle');
      this.startPatrol();
      if (typeof onComplete === 'function') onComplete();
    });
  }

  transitionToPhase2() {
    this.phase = 2;
    if (this.statusTag) {
      this.statusTag.setText('🔥 🐉 🔥');
    }
    if (this.aura) {
      this.aura.setFillStyle(0xffd166, 0.75);
      this.aura.setScale(1.35);
    }

    if (this.bossTitle) {
      this.bossTitle.setText(this.data.name ? `${this.data.name.toUpperCase()} (PHA 2 - NỔI GIẬN)` : 'RỒNG THẦN (PHA 2 - NỔI GIẬN)');
      this.bossTitle.setColor('#ff6b6b');
    }

    // Rung màn hình thế giới khi Boss bùng nổ chuyển sang Pha 2
    if (this.scene?.cameras?.main) {
      this.scene.cameras.main.shake(450, 0.012);
    }

    // Nhảy dựng dậy hoạt bát chuyển pha & to lớn hơn 35%
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.startY - 35,
      scaleX: 1.35,
      scaleY: 1.35,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.patrolDist = 75; // Pha 2 di chuyển phạm vi rộng hơn
        this.syncAttachments();
        this.startPatrol();
      }
    });
  }

  playRescueAnimation() {
    this.isRescued = true;
    this.stopPatrol();
    if (this.sprite?.active) {
      this.sprite.setFlipX(false);
      this.sprite.setAngle(0);
    }

    if (this.statusTag) {
      this.statusTag.setText('💖 🐉');
    }
    if (this.bossTitle) {
      this.bossTitle.setText('RỒNG THẦN ĐÃ ĐƯỢC GIẢI CỨU!');
      this.bossTitle.setColor('#ffeaa7');
    }

    this.scene.tweens.add({
      targets: [this.sprite, this.statusTag].filter(Boolean),
      y: '-=35',
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 380,
      yoyo: true,
      repeat: 2,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Biến mất mượt mà sau khi giải cứu hoàn tất
        this.scene.tweens.add({
          targets: [this.sprite, this.statusTag, this.aura, this.shadow, this.bossTitle].filter(Boolean),
          alpha: 0,
          scaleX: 0.1,
          scaleY: 0.1,
          duration: 500,
          ease: 'Power2',
          onComplete: () => {
            this.destroy();
          }
        });
      }
    });
  }

  destroy() {
    this.stopPatrol();
    if (this.aura) {
      this.aura.destroy();
      this.aura = null;
    }
    if (this.shadow) {
      this.shadow.destroy();
      this.shadow = null;
    }
    if (this.statusTag) {
      this.statusTag.destroy();
      this.statusTag = null;
    }
    if (this.bossTitle) {
      this.bossTitle.destroy();
      this.bossTitle = null;
    }
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
