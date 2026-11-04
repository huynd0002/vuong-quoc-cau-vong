import fs from 'fs';

// 1. Cập nhật Monster.js
let monsterCode = fs.readFileSync('./src/game/entities/Monster.js', 'utf8');

const targetProfile = `  mon_crystal_bat: {
    speed: 90,            // Dơi Pha Lê bay lượn nhịp nhàng 8 hướng
    minDist: 45,
    maxDist: 170,
    roamRadius: 260,
    pauseMin: 350,
    pauseMax: 1100,
    ease: 'Quad.easeOut'
  },`;

const addProfile = `
  mon_desert_fox: {
    speed: 75,            // Cáo Cát Fennec lanh lợi nhún nhảy đáng yêu
    minDist: 40,
    maxDist: 150,
    roamRadius: 230,
    pauseMin: 500,
    pauseMax: 1500,
    ease: 'Sine.easeInOut'
  },
  mon_scarab: {
    speed: 60,            // Bọ Cánh Cứng Ánh Dương bò thong thả lắc lư
    minDist: 35,
    maxDist: 120,
    roamRadius: 200,
    pauseMin: 800,
    pauseMax: 2000,
    ease: 'Sine.easeInOut'
  },
  mon_desert_falcon: {
    speed: 90,            // Chim Ưng Mặt Trời bay lượn trên sa mạc
    minDist: 45,
    maxDist: 170,
    roamRadius: 250,
    pauseMin: 400,
    pauseMax: 1200,
    ease: 'Quad.easeInOut'
  },`;

if (!monsterCode.includes('mon_desert_fox')) {
  monsterCode = monsterCode.replace(targetProfile, targetProfile + addProfile);
}

const targetConfig = `{ key: 'mon_crystal_bat', sheet: 'mon_crystal_bat_walk_sheet', frames: 8, fps: 8 }`;
const addConfig = `,
      { key: 'mon_desert_fox', sheet: 'mon_desert_fox_walk_sheet', frames: 8, fps: 8 },
      { key: 'mon_scarab', sheet: 'mon_scarab_walk_sheet', frames: 8, fps: 8 },
      { key: 'mon_desert_falcon', sheet: 'mon_desert_falcon_walk_sheet', frames: 8, fps: 8 }`;

if (!monsterCode.includes("key: 'mon_desert_fox'")) {
  monsterCode = monsterCode.replace(targetConfig, targetConfig + addConfig);
}

fs.writeFileSync('./src/game/entities/Monster.js', monsterCode, 'utf8');
console.log('✓ Monster.js updated successfully!');

// 2. Cập nhật Boss.js
let bossCode = fs.readFileSync('./src/game/entities/Boss.js', 'utf8');

const targetBossCheck = `    const isCrabKing = textureKey.includes('crab') || bossData.spriteKey === 'boss_crab_king' || bossData.id === 'boss_map2';`;
const addBossCheck = `
    const isSphinx = textureKey.includes('sphinx') || bossData.spriteKey === 'boss_desert_sphinx' || bossData.id === 'boss_map4' || String(bossData.name || '').includes('Nhân Sư');`;

if (!bossCode.includes('isSphinx')) {
  bossCode = bossCode.replace(targetBossCheck, targetBossCheck + addBossCheck);
}

bossCode = bossCode.replace(
  `this.size = isCrabKing ? 190 : (isCrystalDragon ? 175 : 150);`,
  `this.size = isSphinx ? 180 : (isCrabKing ? 190 : (isCrystalDragon ? 175 : 150));`
);

bossCode = bossCode.replace(
  `const auraColor = isCrabKing ? 0x06b6d4 : (isCrystalDragon ? 0xc084fc : 0xf97316);`,
  `const auraColor = isSphinx ? 0xf59e0b : (isCrabKing ? 0x06b6d4 : (isCrystalDragon ? 0xc084fc : 0xf97316));`
);

const targetSpriteInit = `    if (isCrystalDragon && scene.textures.exists('boss_crystal_dragon_walk_sheet')) {`;
const addSpriteInit = `    if (isSphinx && scene.textures.exists('boss_desert_sphinx_walk_sheet')) {
      this.sprite = scene.add.sprite(x, y, 'boss_desert_sphinx_walk_sheet', 0).setDisplaySize(this.size, this.size);
      this.animPrefix = 'boss_desert_sphinx';
      this.playAnim('boss_desert_sphinx_idle');
    } else `;

if (!bossCode.includes('boss_desert_sphinx_walk_sheet')) {
  bossCode = bossCode.replace(targetSpriteInit, addSpriteInit + targetSpriteInit.trim());
}

// Thêm animation init trong Boss.initAnimations
const targetAnimInit = `    if (scene.textures.exists('boss_crystal_dragon_walk_sheet') && !scene.anims.exists('boss_crystal_dragon_walk')) {`;
const addAnimInit = `    if (scene.textures.exists('boss_desert_sphinx_walk_sheet') && !scene.anims.exists('boss_desert_sphinx_walk')) {
      scene.anims.create({
        key: 'boss_desert_sphinx_walk',
        frames: scene.anims.generateFrameNumbers('boss_desert_sphinx_walk_sheet', { start: 0, end: 7 }),
        frameRate: 6,
        repeat: -1
      });
      scene.anims.create({
        key: 'boss_desert_sphinx_idle',
        frames: scene.anims.generateFrameNumbers('boss_desert_sphinx_idle_sheet', { start: 0, end: 7 }),
        frameRate: 6,
        repeat: -1
      });
      scene.anims.create({
        key: 'boss_desert_sphinx_skill',
        frames: scene.anims.generateFrameNumbers('boss_desert_sphinx_skill_sheet', { start: 0, end: 7 }),
        frameRate: 8,
        repeat: 0
      });
    }

`;

if (!bossCode.includes('boss_desert_sphinx_walk')) {
  bossCode = bossCode.replace(targetAnimInit, addAnimInit + targetAnimInit);
}

fs.writeFileSync('./src/game/entities/Boss.js', bossCode, 'utf8');
console.log('✓ Boss.js updated successfully!');
