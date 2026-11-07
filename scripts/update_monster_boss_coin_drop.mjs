import fs from 'fs';

const normalize = s => s.replace(/\r\n/g, '\n');

// 1. Monster.js
let monsterContent = fs.readFileSync('src/game/entities/Monster.js', 'utf8');
const isMonsterCrlf = monsterContent.includes('\r\n');
let normMonster = normalize(monsterContent);

const targetMonsterSnippet = `          onComplete: () => {
            this.destroy();
          }`;

const replacementMonsterSnippet = `          onComplete: () => {
            const posX = this.sprite?.x || this.x;
            const posY = this.sprite?.y || this.y;
            this.destroy();
            if (this.scene && typeof this.scene.playCoinDropVFX === 'function') {
              this.scene.playCoinDropVFX(posX, posY, this.data?.rewardStars || 2);
            }
          }`;

normMonster = normMonster.replace(normalize(targetMonsterSnippet), normalize(replacementMonsterSnippet));
if (isMonsterCrlf) normMonster = normMonster.replace(/\n/g, '\r\n');
fs.writeFileSync('src/game/entities/Monster.js', normMonster, 'utf8');
console.log('Monster.js updated for coin drop!');

// 2. Boss.js
let bossContent = fs.readFileSync('src/game/entities/Boss.js', 'utf8');
const isBossCrlf = bossContent.includes('\r\n');
let normBoss = normalize(bossContent);

const targetBossSnippet = `          onComplete: () => {
            this.destroy();
          }`;

const replacementBossSnippet = `          onComplete: () => {
            const posX = this.sprite?.x || this.x;
            const posY = this.sprite?.y || this.y;
            this.destroy();
            if (this.scene && typeof this.scene.playCoinDropVFX === 'function') {
              this.scene.playCoinDropVFX(posX, posY, 5);
            }
          }`;

normBoss = normBoss.replace(normalize(targetBossSnippet), normalize(replacementBossSnippet));
if (isBossCrlf) normBoss = normBoss.replace(/\n/g, '\r\n');
fs.writeFileSync('src/game/entities/Boss.js', normBoss, 'utf8');
console.log('Boss.js updated for coin drop!');
