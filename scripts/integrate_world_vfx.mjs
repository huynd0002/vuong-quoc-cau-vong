import fs from 'fs';

let content = fs.readFileSync('src/game/scenes/WorldScene.js', 'utf8');

const normalize = s => s.replace(/\r\n/g, '\n');
const isCrlf = content.includes('\r\n');
let norm = normalize(content);

// 1. Add initPixelFXAnimations & helper methods before playPortalImplosionVFX
const markerImplosion = '  playPortalImplosionVFX(x, y) {';

const newMethods = `  /**
   * Khởi tạo toàn bộ Animation từ 9 PixelFX Spritesheets (v3.7.1)
   */
  initPixelFXAnimations() {
    if (!this.anims) return;

    // 1. spawn/respawn-beam (128x150, 76 frames, 30fps)
    if (!this.anims.exists('anim_respawn_beam') && this.textures.exists('vfx_respawn_beam')) {
      this.anims.create({
        key: 'anim_respawn_beam',
        frames: this.anims.generateFrameNumbers('vfx_respawn_beam', { start: 0, end: 75 }),
        frameRate: 30,
        repeat: 0
      });
    }

    // 2. spawn/coin-drop (160x88, 91 frames, 30fps)
    if (!this.anims.exists('anim_coin_drop') && this.textures.exists('vfx_coin_drop')) {
      this.anims.create({
        key: 'anim_coin_drop',
        frames: this.anims.generateFrameNumbers('vfx_coin_drop', { start: 0, end: 90 }),
        frameRate: 30,
        repeat: 0
      });
    }

    // 3. holy/heal-aoe (256x136, 88 frames, 30fps)
    if (!this.anims.exists('anim_heal_aoe') && this.textures.exists('vfx_heal_aoe')) {
      this.anims.create({
        key: 'anim_heal_aoe',
        frames: this.anims.generateFrameNumbers('vfx_heal_aoe', { start: 0, end: 87 }),
        frameRate: 30,
        repeat: 0
      });
    }

    // 4. status/charmed (60x76, 72 frames, 18fps - dịu nhẹ lơ lửng)
    if (!this.anims.exists('anim_charmed') && this.textures.exists('vfx_charmed')) {
      this.anims.create({
        key: 'anim_charmed',
        frames: this.anims.generateFrameNumbers('vfx_charmed', { start: 0, end: 71 }),
        frameRate: 18,
        repeat: -1
      });
    }

    // 5. ui/countdown (152x136, 94 frames, 30fps)
    if (!this.anims.exists('anim_countdown') && this.textures.exists('vfx_countdown')) {
      this.anims.create({
        key: 'anim_countdown',
        frames: this.anims.generateFrameNumbers('vfx_countdown', { start: 0, end: 93 }),
        frameRate: 30,
        repeat: 0
      });
    }

    // 6. pickups/power-star (88x84, 48 frames, 24fps)
    if (!this.anims.exists('anim_power_star') && this.textures.exists('vfx_power_star')) {
      this.anims.create({
        key: 'anim_power_star',
        frames: this.anims.generateFrameNumbers('vfx_power_star', { start: 0, end: 47 }),
        frameRate: 24,
        repeat: -1
      });
    }

    // 7. transitions/glitch-wipe (320x180, 55 frames, 30fps)
    if (!this.anims.exists('anim_glitch_wipe') && this.textures.exists('vfx_glitch_wipe')) {
      this.anims.create({
        key: 'anim_glitch_wipe',
        frames: this.anims.generateFrameNumbers('vfx_glitch_wipe', { start: 0, end: 54 }),
        frameRate: 30,
        repeat: 0
      });
    }

    // 8. critters/butterfly (128x88, 96 frames, 28fps)
    if (!this.anims.exists('anim_butterfly') && this.textures.exists('vfx_butterfly')) {
      this.anims.create({
        key: 'anim_butterfly',
        frames: this.anims.generateFrameNumbers('vfx_butterfly', { start: 0, end: 95 }),
        frameRate: 28,
        repeat: -1
      });
    }

    // 9. critters/frog (112x88, 78 frames, 22fps)
    if (!this.anims.exists('anim_frog') && this.textures.exists('vfx_frog')) {
      this.anims.create({
        key: 'anim_frog',
        frames: this.anims.generateFrameNumbers('vfx_frog', { start: 0, end: 77 }),
        frameRate: 22,
        repeat: -1
      });
    }
  }

  /**
   * 1. Hiệu ứng Hồi Sinh với Beam (spawn/respawn-beam) và xuất hiện từ từ (v3.7.1)
   */
  playRespawnBeamSequence() {
    if (!this.hero?.sprite?.active) return;
    this.hero.sprite.setAlpha(0);
    if (this.hero.shadow) this.hero.shadow.setAlpha(0);

    const hx = this.hero.sprite.x;
    const hy = this.hero.sprite.y;

    this.initPixelFXAnimations();

    if (this.anims.exists('anim_respawn_beam') && this.textures.exists('vfx_respawn_beam')) {
      const beam = this.add.sprite(hx, hy - 25, 'vfx_respawn_beam')
        .setDisplaySize(160, 190)
        .setDepth(25);

      beam.play('anim_respawn_beam');
      window.__audioService?.playChime?.(880, 0.4);

      // Nhân vật xuất hiện từ từ kết hợp với beam
      this.tweens.add({
        targets: [this.hero.sprite, this.hero.shadow].filter(Boolean),
        alpha: 1,
        duration: 2000,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          this.spawnFloatingPopup(hx, hy - 50, '✨ HỒI SINH THÀNH CÔNG! Chào mừng bé về lại Nông Trại! ✨', '#4ade80');
        }
      });

      beam.on('animationcomplete', () => {
        beam.destroy();
      });
    } else {
      this.tweens.add({
        targets: [this.hero.sprite, this.hero.shadow].filter(Boolean),
        alpha: 1,
        duration: 1200,
        ease: 'Linear'
      });
    }
  }

  /**
   * 2. Hiệu ứng Coin Drop khi quái vật bị thua và biến mất (v3.7.1)
   */
  playCoinDropVFX(x, y, starsAwarded = 2) {
    this.initPixelFXAnimations();

    const awardStars = () => {
      try {
        const state = saveAdapter.load();
        if (state?.player) {
          state.player.stars = (state.player.stars || 0) + starsAwarded;
          if (state.progression) state.progression.stars = state.player.stars;
          saveAdapter.save(state);
          window.dispatchEvent(new CustomEvent('game:stars-changed', { detail: { stars: state.player.stars } }));
          if (typeof window.__updateHeroVitalsHud === 'function') {
            window.__updateHeroVitalsHud();
          }
        }
      } catch (err) {
        console.warn('Lỗi cộng sao từ coin drop:', err);
      }
    };

    if (this.anims.exists('anim_coin_drop') && this.textures.exists('vfx_coin_drop')) {
      const coin = this.add.sprite(x, y, 'vfx_coin_drop')
        .setDisplaySize(180, 100)
        .setDepth(25);

      coin.play('anim_coin_drop');
      window.__audioService?.playChime?.(1046, 0.2);

      this.spawnFloatingPopup(x, y - 30, \`+\${starsAwarded} ⭐\`, '#facc15');
      awardStars();

      coin.on('animationcomplete', () => {
        coin.destroy();
      });
    } else {
      this.spawnFloatingPopup(x, y - 30, \`+\${starsAwarded} ⭐\`, '#facc15');
      awardStars();
    }
  }

  /**
   * 3. Hiệu ứng sử dụng thức ăn: Holy Heal-AOE + Charmed + Thanh Loading 100% (v3.7.1)
   */
  playFoodConsumptionVFX(dishId, ingredientId) {
    if (!this.hero?.sprite?.active) return;
    this.hero.stopMovement?.();

    const hx = this.hero.sprite.x;
    const hy = this.hero.sprite.y;

    this.initPixelFXAnimations();

    let healSprite = null;
    if (this.textures.exists('vfx_heal_aoe') && this.anims.exists('anim_heal_aoe')) {
      healSprite = this.add.sprite(hx, hy + 12, 'vfx_heal_aoe')
        .setDisplaySize(200, 110)
        .setDepth(9);
      healSprite.play('anim_heal_aoe');
    }

    let charmedSprite = null;
    if (this.textures.exists('vfx_charmed') && this.anims.exists('anim_charmed')) {
      charmedSprite = this.add.sprite(hx, hy - 48, 'vfx_charmed')
        .setDisplaySize(55, 70)
        .setDepth(28);
      charmedSprite.play('anim_charmed');
    }

    const barWidth = 90;
    const barHeight = 10;
    const barBg = this.add.graphics().setDepth(30);
    barBg.fillStyle(0x0f172a, 0.85);
    barBg.fillRoundedRect(hx - barWidth / 2, hy - 26, barWidth, barHeight, 5);
    barBg.lineStyle(1.5, 0x38bdf8, 1);
    barBg.strokeRoundedRect(hx - barWidth / 2, hy - 26, barWidth, barHeight, 5);

    const barFill = this.add.graphics().setDepth(31);
    const label = this.add.text(hx, hy - 36, 'Đang dùng... 0%', {
      fontSize: '11px',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#0369a1',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5).setDepth(32);

    const durationMs = 2200;
    const startTime = Date.now();

    const progressTimer = this.time.addEvent({
      delay: 50,
      repeat: Math.floor(durationMs / 50),
      callback: () => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));

        barFill.clear();
        barFill.fillStyle(0x4ade80, 1);
        const fillW = Math.max(0, ((barWidth - 4) * pct) / 100);
        barFill.fillRoundedRect(hx - (barWidth - 4) / 2, hy - 24, fillW, barHeight - 4, 3);

        label.setText(\`Đang dùng... \${pct}%\`);

        if (pct >= 100) {
          progressTimer.remove(false);

          let res = null;
          if (dishId && window.__cookingSystem?.eat) {
            res = window.__cookingSystem.eat(dishId);
          } else if (ingredientId && window.__cookingSystem?.useIngredient) {
            res = window.__cookingSystem.useIngredient(ingredientId);
          }

          window.__audioService?.playChime?.(659, 0.25);
          setTimeout(() => window.__audioService?.playChime?.(880, 0.35), 150);

          this.spawnFloatingPopup(hx, hy - 50, '❤️ ĐÃ DÙNG MÓN THÀNH CÔNG! Tim đã hồi phục! ✨', '#4ade80');
          if (typeof window.__updateHeroVitalsHud === 'function') {
            window.__updateHeroVitalsHud();
          }

          this.tweens.add({
            targets: [barBg, barFill, label, healSprite, charmedSprite].filter(Boolean),
            alpha: 0,
            duration: 400,
            onComplete: () => {
              barBg.destroy();
              barFill.destroy();
              label.destroy();
              if (healSprite) healSprite.destroy();
              if (charmedSprite) charmedSprite.destroy();
            }
          });
        }
      }
    });
  }

  /**
   * 4. Hiệu ứng Countdown trước khi hiện pop-up câu cá (v3.7.1)
   */
  playFishingCountdownVFX(onComplete) {
    this.initPixelFXAnimations();

    if (!this.anims.exists('anim_countdown') || !this.textures.exists('vfx_countdown')) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    const cx = DESIGN_WIDTH / 2;
    const cy = DESIGN_HEIGHT / 2 - 20;

    const countdownSprite = this.add.sprite(cx, cy, 'vfx_countdown')
      .setDisplaySize(180, 160)
      .setDepth(150);

    countdownSprite.play('anim_countdown');
    window.__audioService?.playChime?.(580, 0.15);

    countdownSprite.on('animationcomplete', () => {
      countdownSprite.destroy();
      if (typeof onComplete === 'function') onComplete();
    });
  }

  /**
   * 6. Quản lý Pickups Ngôi Sao May Mắn (vfx pickups/power-star) (v3.7.1)
   */
  schedulePowerStarSpawn() {
    const isAdventureMap = !['map_pet_farm', 'map_kitchen', 'map_fishing_pond', 'map_rainbow_market', 'map_fashion_street'].includes(this.currentMapId);
    if (!isAdventureMap) return;

    const delay = Phaser.Math.Between(16000, 28000);
    this.powerStarSpawnTimer = this.time.delayedCall(delay, () => {
      this.spawnPowerStarPickup();
    });
  }

  spawnPowerStarPickup() {
    if (this.powerStarPickup && this.powerStarPickup.active) return;
    this.initPixelFXAnimations();
    if (!this.textures.exists('vfx_power_star') || !this.anims.exists('anim_power_star')) return;

    const x = Phaser.Math.Between(220, 1060);
    const y = Phaser.Math.Between(200, 560);

    const star = this.add.sprite(x, y, 'vfx_power_star')
      .setDisplaySize(42, 40)
      .setDepth(15);

    star.play('anim_power_star');

    this.tweens.add({
      targets: star,
      y: y - 8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.powerStarPickup = star;
  }

  updatePowerStarPickup(time, delta) {
    if (!this.powerStarPickup || !this.powerStarPickup.active || !this.hero?.sprite?.active) return;

    const dist = Phaser.Math.Distance.Between(
      this.hero.sprite.x,
      this.hero.sprite.y,
      this.powerStarPickup.x,
      this.powerStarPickup.y
    );

    if (dist < 42) {
      const star = this.powerStarPickup;
      this.powerStarPickup = null;

      const starsWon = Phaser.Math.Between(1, 10);
      try {
        const state = saveAdapter.load();
        if (state?.player) {
          state.player.stars = (state.player.stars || 0) + starsWon;
          if (state.progression) state.progression.stars = state.player.stars;
          saveAdapter.save(state);
          window.dispatchEvent(new CustomEvent('game:stars-changed', { detail: { stars: state.player.stars } }));
          if (typeof window.__updateHeroVitalsHud === 'function') {
            window.__updateHeroVitalsHud();
          }
        }
      } catch (err) {
        console.warn('Lỗi cộng sao từ power star:', err);
      }

      window.__audioService?.playChime?.(1174, 0.3);
      this.spawnFloatingPopup(star.x, star.y - 30, \`+\${starsWon} ⭐ NGÔI SAO MAY MẮN!\`, '#facc15');

      this.tweens.add({
        targets: star,
        scaleX: 1.8,
        scaleY: 1.8,
        alpha: 0,
        duration: 350,
        onComplete: () => {
          star.destroy();
          this.schedulePowerStarSpawn();
        }
      });
    }
  }

  /**
   * 7. Hiệu ứng transitions/glitch-wipe chuyển cảnh (v3.7.1)
   */
  playGlitchWipeTransition(onComplete) {
    this.initPixelFXAnimations();
    if (!this.anims.exists('anim_glitch_wipe') || !this.textures.exists('vfx_glitch_wipe')) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    const wipe = this.add.sprite(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2, 'vfx_glitch_wipe')
      .setDisplaySize(DESIGN_WIDTH, DESIGN_HEIGHT)
      .setScrollFactor(0)
      .setDepth(9999);

    wipe.play('anim_glitch_wipe');
    wipe.on('animationcomplete', () => {
      wipe.destroy();
      if (typeof onComplete === 'function') onComplete();
    });
  }

  /**
   * 9. Thêm chú ếch critters/frog ở cạnh hồ câu cá (v3.7.1)
   */
  createFishingPondFrog() {
    if (this.currentMapId !== 'map_fishing_pond') return;
    this.initPixelFXAnimations();
    if (!this.textures.exists('vfx_frog') || !this.anims.exists('anim_frog')) return;

    const frog = this.add.sprite(350, 530, 'vfx_frog')
      .setDisplaySize(48, 38)
      .setDepth(8)
      .setInteractive({ useHandCursor: true });

    frog.play('anim_frog');

    frog.on('pointerdown', (pointer) => {
      if (!this.isWorldPointer(pointer)) return;
      pointer?.event?.stopPropagation?.();

      this.tweens.add({
        targets: frog,
        y: frog.y - 25,
        scaleX: 1.25,
        scaleY: 1.25,
        duration: 220,
        yoyo: true,
        ease: 'Back.easeOut'
      });

      window.__audioService?.playChime?.(360, 0.25);
      this.spawnFloatingPopup(frog.x, frog.y - 45, '🐸 Ộp ộp! Chúc bé câu được cá to nha! ✨', '#4ade80');
    });

    this.pondFrog = frog;
  }
\n` + markerImplosion;

norm = norm.replace(markerImplosion, newMethods);

// 2. Call initPixelFXAnimations & feature triggers in create()
const markerPostDecor = '      this.createDecorations();';
const newPostDecor = `      this.createDecorations();
      this.initPixelFXAnimations();

      // Kích hoạt vfx glitch-wipe chuyển cảnh (v3.7.1)
      this.playGlitchWipeTransition();

      // Kích hoạt hồi sinh respawn-beam nếu bé vừa hết tim hồi sinh (v3.7.1)
      if (this.currentMapId === 'map_pet_farm' && typeof window !== 'undefined' && window.__triggerRespawnBeam) {
        window.__triggerRespawnBeam = false;
        this.time.delayedCall(120, () => this.playRespawnBeamSequence());
      }

      // Khởi tạo chú ếch cạnh hồ câu nếu ở map Hồ Câu (v3.7.1)
      if (this.currentMapId === 'map_fishing_pond') {
        this.createFishingPondFrog();
      }

      // Khởi tạo power-star pickups định kỳ trên các bản đồ phiêu lưu (v3.7.1)
      this.schedulePowerStarSpawn();`;

norm = norm.replace(markerPostDecor, newPostDecor);

// 3. Register hero:use-food event listener
const markerPortalComplete = "    this.addManagedListener('game:portal-warp-complete', () => {";
const newEventListeners = `    // Lắng nghe sự kiện bé dùng thức ăn / nguyên liệu (v3.7.1)
    this.addManagedListener('hero:use-food', (e) => {
      const { dishId, ingredientId } = e.detail || {};
      this.playFoodConsumptionVFX(dishId, ingredientId);
    });

    ` + markerPortalComplete;

norm = norm.replace(markerPortalComplete, newEventListeners);

// 4. Update fishing handleCatch to trigger playFishingCountdownVFX before audition bar
const targetHandleCatch = `    // 2. Xử lý khi bé bấm nút "BẮT!"
    const handleCatch = (ev) => {
      if (ev) {
        ev.preventDefault();
        ev.stopPropagation();
      }
      if (!this.onMapFishingState || this.onMapFishingState.phase !== 'bite_waiting') return;

      this.cleanupBiteCatchPrompt();
      window.__audioService?.playChime?.(920, 0.22);

      // Chuyển sang giai đoạn Audition để giật cá như hiện tại
      this.onMapFishingState.phase = 'audition';
      this.mountVerticalAuditionBar();
    };`;

const replacementHandleCatch = `    // 2. Xử lý khi bé bấm nút "BẮT!"
    const handleCatch = (ev) => {
      if (ev) {
        ev.preventDefault();
        ev.stopPropagation();
      }
      if (!this.onMapFishingState || this.onMapFishingState.phase !== 'bite_waiting') return;

      this.cleanupBiteCatchPrompt();
      window.__audioService?.playChime?.(920, 0.22);

      // Kích hoạt vfx ui/countdown trước khi hiện pop-up câu cá (v3.7.1)
      this.playFishingCountdownVFX(() => {
        if (!this.onMapFishingState) return;
        this.onMapFishingState.phase = 'audition';
        this.mountVerticalAuditionBar();
      });
    };`;

norm = norm.replace(normalize(targetHandleCatch), normalize(replacementHandleCatch));

// 5. Update update() loop for power-star pickup
const targetUpdate = `  update(time, delta) {
    if (Array.isArray(this.butterflies) && this.butterflies.length > 0) {`;

const replacementUpdate = `  update(time, delta) {
    this.updatePowerStarPickup(time, delta);
    if (Array.isArray(this.butterflies) && this.butterflies.length > 0) {`;

norm = norm.replace(targetUpdate, replacementUpdate);

// 6. Clean up in shutdown
const targetShutdown = `      if (this.toyBall) {
        this.toyBall.destroy();
        this.toyBall = null;
      }`;

const replacementShutdown = `      if (this.toyBall) {
        this.toyBall.destroy();
        this.toyBall = null;
      }
      if (this.pondFrog) {
        this.pondFrog.destroy();
        this.pondFrog = null;
      }
      if (this.powerStarPickup) {
        this.powerStarPickup.destroy();
        this.powerStarPickup = null;
      }
      if (this.powerStarSpawnTimer) {
        this.powerStarSpawnTimer.remove(false);
        this.powerStarSpawnTimer = null;
      }`;

norm = norm.replace(targetShutdown, replacementShutdown);

if (isCrlf) norm = norm.replace(/\n/g, '\r\n');
fs.writeFileSync('src/game/scenes/WorldScene.js', norm, 'utf8');
console.log('WorldScene.js successfully updated with all 8 VFX features!');
