import fs from 'fs';

let content = fs.readFileSync('src/game/entities/Butterfly.js', 'utf8');

const targetSnippet = `    // Butterfly sprite (thu nhỏ 50% theo yêu cầu: 19x19 px so với gốc 38x38 px)
    const textureKey = scene.textures && scene.textures.exists('butterfly_rainbow') ? 'butterfly_rainbow' : null;
    if (textureKey) {
      this.sprite = scene.add.image(x, y, textureKey)
        .setDisplaySize(19, 19)
        .setOrigin(0.5, 0.5)
        .setDepth(20);
    } else {
      // Fallback emoji if texture is missing (thu nhỏ 50%)
      this.sprite = scene.add.text(x, y, '🦋', { fontSize: '13px' })
        .setOrigin(0.5, 0.5)
        .setDepth(20);
    }

    // Wing flapping tween: rapid scale oscillation simulating flutter
    this.baseScaleX = this.sprite.scaleX || 1;
    this.baseScaleY = this.sprite.scaleY || 1;
    this.flapTween = scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: this.baseScaleX, to: this.baseScaleX * 0.25 },
      duration: randomBetween(85, 120),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });`;

const replacementSnippet = `    // 8. Thay thế toàn bộ bướm bằng vfx critters/butterfly (v3.7.1)
    const hasVfxButterfly = Boolean(scene?.textures?.exists?.('vfx_butterfly'));
    if (hasVfxButterfly) {
      if (scene.anims && !scene.anims.exists('anim_butterfly')) {
        scene.anims.create({
          key: 'anim_butterfly',
          frames: scene.anims.generateFrameNumbers('vfx_butterfly', { start: 0, end: 95 }),
          frameRate: 28,
          repeat: -1
        });
      }
      this.sprite = scene.add.sprite(x, y, 'vfx_butterfly')
        .setDisplaySize(32, 22)
        .setOrigin(0.5, 0.5)
        .setDepth(20);
      if (scene.anims?.exists('anim_butterfly')) {
        this.sprite.play('anim_butterfly');
      }
      this.flapTween = null;
    } else {
      const textureKey = scene.textures && scene.textures.exists('butterfly_rainbow') ? 'butterfly_rainbow' : null;
      if (textureKey) {
        this.sprite = scene.add.image(x, y, textureKey)
          .setDisplaySize(19, 19)
          .setOrigin(0.5, 0.5)
          .setDepth(20);
      } else {
        this.sprite = scene.add.text(x, y, '🦋', { fontSize: '13px' })
          .setOrigin(0.5, 0.5)
          .setDepth(20);
      }

      this.baseScaleX = this.sprite.scaleX || 1;
      this.baseScaleY = this.sprite.scaleY || 1;
      this.flapTween = scene.tweens.add({
        targets: this.sprite,
        scaleX: { from: this.baseScaleX, to: this.baseScaleX * 0.25 },
        duration: randomBetween(85, 120),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }`;

// Normalize line breaks before replacing
const normalize = s => s.replace(/\r\n/g, '\n');
const isCrlf = content.includes('\r\n');
const normalizedContent = normalize(content);
const normalizedTarget = normalize(targetSnippet);
const normalizedReplacement = normalize(replacementSnippet);

if (!normalizedContent.includes(normalizedTarget)) {
  console.error('Target snippet not found in Butterfly.js!');
  process.exit(1);
}

let updated = normalizedContent.replace(normalizedTarget, normalizedReplacement);
if (isCrlf) {
  updated = updated.replace(/\n/g, '\r\n');
}

fs.writeFileSync('src/game/entities/Butterfly.js', updated, 'utf8');
console.log('Butterfly.js updated to use critters/butterfly!');
