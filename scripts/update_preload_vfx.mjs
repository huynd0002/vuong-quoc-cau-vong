import fs from 'fs';

let content = fs.readFileSync('src/game/scenes/PreloadScene.js', 'utf8');

const importMarker = "import vfxCartoonPowSheetUrl from '../../../assets/ui/vfx_cartoon_pow_sheet.png?url';";
const newImports = `${importMarker}

// 9 PixelFX Spritesheets (v3.7.1)
import vfxRespawnBeamUrl from '../../../assets/vfx/vfx_respawn_beam.png?url';
import vfxCoinDropUrl from '../../../assets/vfx/vfx_coin_drop.png?url';
import vfxHealAoeUrl from '../../../assets/vfx/vfx_heal_aoe.png?url';
import vfxCharmedUrl from '../../../assets/vfx/vfx_charmed.png?url';
import vfxCountdownUrl from '../../../assets/vfx/vfx_countdown.png?url';
import vfxPowerStarUrl from '../../../assets/vfx/vfx_power_star.png?url';
import vfxGlitchWipeUrl from '../../../assets/vfx/vfx_glitch_wipe.png?url';
import vfxButterflyUrl from '../../../assets/vfx/vfx_butterfly.png?url';
import vfxFrogUrl from '../../../assets/vfx/vfx_frog.png?url';`;

content = content.replace(importMarker, newImports);

const loadMarker = "this.load.spritesheet('vfx_cartoon_pow_sheet', vfxCartoonPowSheetUrl, { frameWidth: 184, frameHeight: 144 });";
const newLoads = `${loadMarker}

    // 9 PixelFX Spritesheets (v3.7.1)
    this.load.spritesheet('vfx_respawn_beam', vfxRespawnBeamUrl, { frameWidth: 128, frameHeight: 150 });
    this.load.spritesheet('vfx_coin_drop', vfxCoinDropUrl, { frameWidth: 160, frameHeight: 88 });
    this.load.spritesheet('vfx_heal_aoe', vfxHealAoeUrl, { frameWidth: 256, frameHeight: 136 });
    this.load.spritesheet('vfx_charmed', vfxCharmedUrl, { frameWidth: 60, frameHeight: 76 });
    this.load.spritesheet('vfx_countdown', vfxCountdownUrl, { frameWidth: 152, frameHeight: 136 });
    this.load.spritesheet('vfx_power_star', vfxPowerStarUrl, { frameWidth: 88, frameHeight: 84 });
    this.load.spritesheet('vfx_glitch_wipe', vfxGlitchWipeUrl, { frameWidth: 320, frameHeight: 180 });
    this.load.spritesheet('vfx_butterfly', vfxButterflyUrl, { frameWidth: 128, frameHeight: 88 });
    this.load.spritesheet('vfx_frog', vfxFrogUrl, { frameWidth: 112, frameHeight: 88 });`;

content = content.replace(loadMarker, newLoads);

fs.writeFileSync('src/game/scenes/PreloadScene.js', content, 'utf8');
console.log('PreloadScene.js updated successfully!');
