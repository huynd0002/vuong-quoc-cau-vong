import fs from 'fs';

let code = fs.readFileSync('./src/game/ui/BattleArenaModal.js', 'utf8');

// 1. Thêm imports
const targetImport = "import bossCrystalDragonImpactUrl from '../../../assets/monsters/map3/boss_crystal_dragon_impact.png?url';";
const addImport = `
import desertFoxIdleUrl from '../../../assets/monsters/map4/mon_desert_fox_idle.png?url';
import desertFoxSkillUrl from '../../../assets/monsters/map4/mon_desert_fox_skill.webp?url';
import desertFoxHitUrl from '../../../assets/monsters/map4/mon_desert_fox_hit.webp?url';
import desertFoxCelebrateUrl from '../../../assets/monsters/map4/mon_desert_fox_celebrate.webp?url';
import desertFoxProjUrl from '../../../assets/monsters/map4/fox_proj.png?url';
import desertFoxImpactUrl from '../../../assets/monsters/map4/fox_impact.png?url';

import scarabIdleUrl from '../../../assets/monsters/map4/mon_scarab_idle.png?url';
import scarabSkillUrl from '../../../assets/monsters/map4/mon_scarab_skill.webp?url';
import scarabHitUrl from '../../../assets/monsters/map4/mon_scarab_hit.webp?url';
import scarabCelebrateUrl from '../../../assets/monsters/map4/mon_scarab_celebrate.webp?url';
import scarabProjUrl from '../../../assets/monsters/map4/scarab_proj.png?url';
import scarabImpactUrl from '../../../assets/monsters/map4/scarab_impact.png?url';

import desertFalconIdleUrl from '../../../assets/monsters/map4/mon_desert_falcon_idle.png?url';
import desertFalconSkillUrl from '../../../assets/monsters/map4/mon_desert_falcon_skill.webp?url';
import desertFalconHitUrl from '../../../assets/monsters/map4/mon_desert_falcon_hit.webp?url';
import desertFalconCelebrateUrl from '../../../assets/monsters/map4/mon_desert_falcon_celebrate.webp?url';
import desertFalconProjUrl from '../../../assets/monsters/map4/falcon_proj.png?url';
import desertFalconImpactUrl from '../../../assets/monsters/map4/falcon_impact.png?url';

import bossDesertSphinxUrl from '../../../assets/monsters/map4/boss_desert_sphinx.png?url';
import bossDesertSphinxIdleUrl from '../../../assets/monsters/map4/boss_desert_sphinx_walk.webp?url';
import bossDesertSphinxSkillUrl from '../../../assets/monsters/map4/boss_desert_sphinx_skill.webp?url';
import bossDesertSphinxHitUrl from '../../../assets/monsters/map4/boss_desert_sphinx_hit.webp?url';
import bossDesertSphinxCelebrateUrl from '../../../assets/monsters/map4/boss_desert_sphinx_celebrate.webp?url';
import bossDesertSphinxProjUrl from '../../../assets/monsters/map4/sphinx_proj.png?url';
import bossDesertSphinxImpactUrl from '../../../assets/monsters/map4/sphinx_impact.png?url';`;

if (!code.includes('desertFoxIdleUrl')) {
  code = code.replace(targetImport, targetImport + addImport);
}

// 2. Cập nhật getMonsterAssets
const targetBossAssets = `      if (bossKey.includes('crystal_dragon') || bossKey.includes('map3') || String(encounter?.name || '').includes('Rồng Pha Lê')) {`;
const addBossAssets = `      if (bossKey.includes('sphinx') || bossKey.includes('map4') || String(encounter?.name || '').includes('Nhân Sư')) {
        return {
          idle: bossDesertSphinxIdleUrl,
          attack: bossDesertSphinxSkillUrl,
          hit: bossDesertSphinxHitUrl,
          celebrate: bossDesertSphinxCelebrateUrl,
          fallback: bossDesertSphinxUrl,
          flipIdle: false, // Ảnh hướng sang trái nhìn Bé Sâu
          flipAttack: false,
          flipHit: false
        };
      }
`;
if (!code.includes('bossDesertSphinxIdleUrl')) {
  code = code.replace(targetBossAssets, addBossAssets + targetBossAssets);
}

// Thêm các quái nhỏ vào getMonsterAssets
const targetMonsterAssets = `    if (key.includes('crystal_sprout') || key === 'enc_map3_1' || name.includes('thạch nhũ')) {`;
const addMonsterAssets = `    if (key.includes('desert_fox') || key === 'enc_map4_1' || name.includes('cáo') || name.includes('fennec')) {
      return {
        idle: desertFoxIdleUrl,
        attack: desertFoxSkillUrl,
        hit: desertFoxHitUrl,
        celebrate: desertFoxCelebrateUrl,
        fallback: desertFoxIdleUrl,
        flipIdle: false,
        flipAttack: false,
        flipHit: false
      };
    }
    if (key.includes('scarab') || key === 'enc_map4_2' || name.includes('bọ') || name.includes('kim quy')) {
      return {
        idle: scarabIdleUrl,
        attack: scarabSkillUrl,
        hit: scarabHitUrl,
        celebrate: scarabCelebrateUrl,
        fallback: scarabIdleUrl,
        flipIdle: false,
        flipAttack: false,
        flipHit: false
      };
    }
    if (key.includes('desert_falcon') || key === 'enc_map4_3' || name.includes('chim ưng') || name.includes('falcon')) {
      return {
        idle: desertFalconIdleUrl,
        attack: desertFalconSkillUrl,
        hit: desertFalconHitUrl,
        celebrate: desertFalconCelebrateUrl,
        fallback: desertFalconIdleUrl,
        flipIdle: false,
        flipAttack: false,
        flipHit: false
      };
    }
`;
if (!code.includes('desertFoxSkillUrl')) {
  code = code.replace(targetMonsterAssets, addMonsterAssets + targetMonsterAssets);
}

// 3. Cập nhật getMonsterSkill cho Boss Map 4
const targetBossSkill = `      if (bossKey.includes('crystal_dragon') || bossKey.includes('map3') || String(encounter?.name || '').includes('Rồng Pha Lê')) {`;
const addBossSkill = `      if (bossKey.includes('sphinx') || bossKey.includes('map4') || String(encounter?.name || '').includes('Nhân Sư')) {
        return {
          id: 'skill_sphinx_solar_flare',
          name: 'Thái Dương Thần Uy: Hào Quang Mặt Trời & Bão Cát Hoàng Kim',
          badge: '☀️🦁',
          element: 'desert_sun',
          projUrl: bossDesertSphinxProjUrl,
          impactUrl: bossDesertSphinxImpactUrl,
          projSize: 88,
          impactSize: 240,
          glowColor: '#f59e0b',
          filter: 'drop-shadow(0 0 24px rgba(245, 158, 11, 0.98))',
          soundType: 'sawtooth',
          baseFreq: 240,
          stepNames: [
            'Thần Nhân Sư Uy Nghi Thức Tỉnh',
            'Vầng Thái Dương Tỏa Sáng Sau Đầu',
            'Tụ Năng Lượng Ánh Sáng Cổ Đại',
            'Gầm Vang Dâng Cao Bão Cát Vàng',
            'Bắn Quả Cầu Lửa Thái Dương Sang Trái',
            'Hào Quang Mặt Trời Bùng Nổ Rực Rỡ',
            'Đôi Cánh Vàng Vỗ Nhẹ Kiêu Hãnh',
            'Trở Về Ngai Thờ Đá Cổ Kính!'
          ]
        };
      }
`;
if (!code.includes('skill_sphinx_solar_flare')) {
  code = code.replace(targetBossSkill, addBossSkill + targetBossSkill);
}

// Thêm skills cho quái nhỏ map 4
const targetMonsterSkill = `    if (key.includes('crystal_sprout') || key === 'enc_map3_1' || name.includes('thạch nhũ')) {`;
const addMonsterSkill = `    if (key.includes('desert_fox') || key === 'enc_map4_1' || name.includes('cáo')) {
      return {
        id: 'skill_fox_sand_whirl',
        name: 'Hồ Ly Kim Cát: Cơn Lốc Cát Vàng Lấp Lánh',
        badge: '🦊✨',
        element: 'sand',
        projUrl: desertFoxProjUrl,
        impactUrl: desertFoxImpactUrl,
        projSize: 68,
        impactSize: 180,
        glowColor: '#f59e0b',
        filter: 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.9))',
        soundType: 'triangle',
        baseFreq: 380,
        stepNames: [
          'Bé Cáo Vẫy Chiếc Đuôi Xù Bông',
          'Vểnh Đôi Tai To Tụ Hạt Cát Vàng',
          'Chạy Nhún Nhảy Vui Nhộn',
          'Bắn Cầu Lửa Cát Sang Trái',
          'Lốc Xoáy Cát Bay Nhanh Thoăn Thoắt',
          'Hạt Vàng Bùng Nổ Lấp Lánh',
          'Cáo Con Lộn Nhào Dễ Thương',
          'Vui Mừng Vẫy Tai Tươi Cười!'
        ]
      };
    }
    if (key.includes('scarab') || key === 'enc_map4_2' || name.includes('bọ')) {
      return {
        id: 'skill_scarab_jewel_blast',
        name: 'Kim Quy Thần Giáp: Ngọc Bích Thái Dương',
        badge: '🪲☀️',
        element: 'emerald_sun',
        projUrl: scarabProjUrl,
        impactUrl: scarabImpactUrl,
        projSize: 72,
        impactSize: 190,
        glowColor: '#10b981',
        filter: 'drop-shadow(0 0 18px rgba(16, 185, 129, 0.95))',
        soundType: 'sine',
        baseFreq: 320,
        stepNames: [
          'Bọ Kim Quy Giương Mai Ngọc Bích',
          'Viên Ngọc Mặt Trời Tỏa Ánh Hoàng Kim',
          'Bò Lắc Lư Vững Vàng Tích Lực',
          'Bắn Cầu Ngọc Ánh Dương Sang Trái',
          'Ánh Sáng Xanh Ngọc Bay Rực Rỡ',
          'Pháo Hoa Ngọc Bích Bùng Nổ',
          'Bọ Con Cười Tít Mắt Tinh Nghịch',
          'Thu Chân Nhỏ Về Thế Thủ Đáng Yêu!'
        ]
      };
    }
    if (key.includes('desert_falcon') || key === 'enc_map4_3' || name.includes('chim ưng')) {
      return {
        id: 'skill_falcon_solar_gust',
        name: 'Thần Điêu Liệng Cánh: Cơn Lốc Ánh Dương',
        badge: '🦅☀️',
        element: 'solar_wind',
        projUrl: desertFalconProjUrl,
        impactUrl: desertFalconImpactUrl,
        projSize: 75,
        impactSize: 200,
        glowColor: '#eab308',
        filter: 'drop-shadow(0 0 20px rgba(234, 179, 8, 0.95))',
        soundType: 'sawtooth',
        baseFreq: 360,
        stepNames: [
          'Chim Ưng Thần Vỗ Cánh Lông Vàng',
          'Vương Miện Mặt Trời Lóe Sáng',
          'Bay Lượn Nhào Lộn Giữa Không Trung',
          'Quạt Cánh Phóng Lốc Lửa Sang Trái',
          'Gió Lốc Thái Dương Cuộn Sóng Ánh Sáng',
          'Nổ Tung Bụi Sao Vàng Lấp Lánh',
          'Chim Ưng Nghiêng Cánh Điêu Luyện',
          'Đậu Lại Oai Phong Giữa Sa Mạc!'
        ]
      };
    }
`;
if (!code.includes('skill_fox_sand_whirl')) {
  code = code.replace(targetMonsterSkill, addMonsterSkill + targetMonsterSkill);
}

fs.writeFileSync('./src/game/ui/BattleArenaModal.js', code, 'utf8');
console.log('✓ BattleArenaModal.js updated successfully!');
