import fs from 'fs';

let code = fs.readFileSync('./src/game/scenes/PreloadScene.js', 'utf8');

const targetImport = "import bossCrystalDragonSkillSheetUrl from '../../../assets/monsters/map3/boss_crystal_dragon_skill_sheet.png?url';";
const addImport = `
import desertFoxIdleUrl from '../../../assets/monsters/map4/mon_desert_fox_idle.png?url';
import desertFoxWalkSheetUrl from '../../../assets/monsters/map4/mon_desert_fox_walk_sheet.png?url';
import scarabIdleUrl from '../../../assets/monsters/map4/mon_scarab_idle.png?url';
import scarabWalkSheetUrl from '../../../assets/monsters/map4/mon_scarab_walk_sheet.png?url';
import desertFalconIdleUrl from '../../../assets/monsters/map4/mon_desert_falcon_idle.png?url';
import desertFalconWalkSheetUrl from '../../../assets/monsters/map4/mon_desert_falcon_walk_sheet.png?url';
import bossDesertSphinxUrl from '../../../assets/monsters/map4/boss_desert_sphinx.png?url';
import bossDesertSphinxWalkSheetUrl from '../../../assets/monsters/map4/boss_desert_sphinx_walk_sheet.png?url';
import bossDesertSphinxIdleSheetUrl from '../../../assets/monsters/map4/boss_desert_sphinx_idle_sheet.png?url';
import bossDesertSphinxSkillSheetUrl from '../../../assets/monsters/map4/boss_desert_sphinx_skill_sheet.png?url';`;

if (!code.includes('desertFoxIdleUrl')) {
  code = code.replace(targetImport, targetImport + addImport);
}

const targetLoad = "this.load.spritesheet('boss_crystal_dragon_skill_sheet', bossCrystalDragonSkillSheetUrl, { frameWidth: 320, frameHeight: 320 });";
const addLoad = `

    // 2.7. Tải tài nguyên 3 quái vật & 1 Boss Map 4 (Cáo Cát, Bọ Ánh Dương, Chim Ưng Mặt Trời, Thần Nhân Sư Ánh Dương)
    this.load.image('mon_desert_fox', desertFoxIdleUrl);
    this.load.spritesheet('mon_desert_fox_walk_sheet', desertFoxWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.image('mon_scarab', scarabIdleUrl);
    this.load.spritesheet('mon_scarab_walk_sheet', scarabWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.image('mon_desert_falcon', desertFalconIdleUrl);
    this.load.spritesheet('mon_desert_falcon_walk_sheet', desertFalconWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });

    this.load.image('boss_desert_sphinx', bossDesertSphinxUrl);
    this.load.spritesheet('boss_desert_sphinx_walk_sheet', bossDesertSphinxWalkSheetUrl, { frameWidth: 320, frameHeight: 320 });
    this.load.spritesheet('boss_desert_sphinx_idle_sheet', bossDesertSphinxIdleSheetUrl, { frameWidth: 320, frameHeight: 320 });
    this.load.spritesheet('boss_desert_sphinx_skill_sheet', bossDesertSphinxSkillSheetUrl, { frameWidth: 320, frameHeight: 320 });`;

if (!code.includes('boss_desert_sphinx')) {
  code = code.replace(targetLoad, targetLoad + addLoad);
}

fs.writeFileSync('./src/game/scenes/PreloadScene.js', code, 'utf8');
console.log('✓ PreloadScene.js updated successfully!');
