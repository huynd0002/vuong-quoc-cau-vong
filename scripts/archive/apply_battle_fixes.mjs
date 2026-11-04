import fs from 'fs';

// 1. Cập nhật BattleArenaModal.js
let code = fs.readFileSync('./src/game/ui/BattleArenaModal.js', 'utf8');

// 1a. Thêm imports background và hero skill
const targetTopImport = "import bossCrystalDragonImpactUrl from '../../../assets/monsters/map3/boss_crystal_dragon_impact.png?url';";
const addTopImports = `
import map1BgUrl from '../../../assets/maps/backgrounds/map_1_bg.png?url';
import map2BgUrl from '../../../assets/maps/backgrounds/map_2_bg.png?url';
import map3BgUrl from '../../../assets/maps/backgrounds/map_3_bg.png?url';
import map4BgUrl from '../../../assets/maps/backgrounds/map_4_bg.png?url';
import map5BgUrl from '../../../assets/maps/backgrounds/map_5_bg.png?url';
import map6BgUrl from '../../../assets/maps/backgrounds/map_6_bg.png?url';

import heroSunVortexProjUrl from '../../../assets/skill/hero_sun_vortex_proj.png?url';
import heroSunExplosionUrl from '../../../assets/skill/hero_sun_explosion.png?url';
import heroSunShieldUrl from '../../../assets/skill/hero_sun_shield.png?url';`;

if (!code.includes('map4BgUrl')) {
  code = code.replace(targetTopImport, targetTopImport + addTopImports);
}

// 1b. Sửa hoàn toàn phương thức getMonsterAssets và getMonsterSkill
// Tìm đoạn getMonsterAssets
const startAssets = code.indexOf('  getMonsterAssets(encounter) {');
const startSkill = code.indexOf('  getMonsterSkill(encounter) {');
const endSkill = code.indexOf('  /**', startSkill + 30);

if (startAssets !== -1 && startSkill !== -1 && endSkill !== -1) {
  const newAssetsAndSkill = `  getMonsterAssets(encounter) {
    if (this.isBoss || encounter?.phases || encounter?.isBoss) {
      const bossKey = String(encounter?.spriteKey || encounter?.id || '').toLowerCase();
      if (bossKey.includes('sphinx') || bossKey.includes('map4') || String(encounter?.name || '').includes('Nhân Sư')) {
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
      if (bossKey.includes('crystal_dragon') || bossKey.includes('map3') || String(encounter?.name || '').includes('Rồng Pha Lê')) {
        return {
          idle: bossCrystalDragonIdleUrl,
          attack: bossCrystalDragonSkillUrl,
          hit: bossCrystalDragonHitUrl,
          celebrate: bossCrystalDragonCelebrateUrl,
          fallback: bossCrystalDragonUrl,
          flipIdle: false, // Ảnh gốc đã nhìn sang trái về phía Bé Sâu
          flipAttack: true, // Lật sang trái để phun tia laser pha lê về phía Bé Sâu
          flipHit: false
        };
      }
      if (bossKey.includes('crab') || bossKey.includes('map2')) {
        return {
          idle: bossCrabKingIdleUrl,
          attack: bossCrabKingSkillUrl,
          hit: bossCrabKingHitUrl,
          celebrate: bossCrabKingCelebrateUrl,
          fallback: bossCrabKingUrl,
          flipIdle: false, // Hoạt ảnh đã hướng chuẩn sang bên trái nhìn Bé Sâu
          flipAttack: false, // Đòn tấn công sóng thần đã hướng chuẩn sang bên trái
          flipHit: false
        };
      }
      return {
        idle: bossDragonIdleUrl,
        attack: bossDragonSkillUrl,
        hit: bossDragonHitUrl,
        celebrate: bossDragonCelebrateUrl,
        fallback: bossDragonUrl,
        flipIdle: false, // SỬA: Ảnh gốc Rồng Thần đã nhìn sang trái về phía Bé Sâu (không lật)
        flipAttack: true, // SỬA: Đòn phun lửa gốc quay sang phải -> Cần lật sang trái về phía Bé Sâu
        flipHit: true
      };
    }
    const key = String(encounter?.spriteKey || encounter?.monsterId || encounter?.id || '').toLowerCase();
    const name = String(encounter?.name || '').toLowerCase();

    if (key.includes('desert_fox') || key === 'enc_map4_1' || name.includes('cáo') || name.includes('fennec')) {
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
    if (key.includes('mushroom') || key === 'enc_map1_1' || name.includes('nấm')) {
      return {
        idle: mushroomIdleUrl,
        attack: mushroomSkillUrl,
        hit: mushroomHitUrl,
        celebrate: mushroomCelebrateUrl,
        fallback: mushroomIdleUrl,
        flipIdle: true,
        flipAttack: false,
        flipHit: true
      };
    }
    if (key.includes('bee') || key === 'enc_map1_2' || name.includes('ong')) {
      return {
        idle: beeIdleUrl,
        attack: beeSkillUrl,
        hit: beeHitUrl,
        celebrate: beeCelebrateUrl,
        fallback: beeIdleUrl,
        flipIdle: true,
        flipAttack: false,
        flipHit: true
      };
    }
    if (key.includes('ladybug') || key === 'enc_map1_3' || name.includes('bọ rùa')) {
      return {
        idle: ladybugIdleUrl,
        attack: ladybugSkillUrl,
        hit: ladybugHitUrl,
        celebrate: ladybugCelebrateUrl,
        fallback: ladybugIdleUrl,
        flipIdle: true,
        flipAttack: false,
        flipHit: true
      };
    }
    if (key.includes('starfish') || key === 'enc_map2_2' || name.includes('sao biển')) {
      return {
        idle: starfishIdleUrl,
        attack: starfishSkillUrl,
        hit: starfishHitUrl,
        celebrate: starfishCelebrateUrl,
        fallback: starfishIdleUrl,
        flipIdle: false, // Hoạt ảnh đã hướng chuẩn sang bên trái nhìn Bé Sâu
        flipAttack: false, // Hoạt ảnh 8 bước xuất chiêu đã được hướng sang trái
        flipHit: false
      };
    }
    if (key.includes('emerald') || key === 'enc_map2_3' || name.includes('ngọc bích')) {
      return {
        idle: emeraldCrabIdleUrl,
        attack: emeraldCrabSkillUrl,
        hit: emeraldCrabHitUrl,
        celebrate: emeraldCrabCelebrateUrl,
        fallback: emeraldCrabIdleUrl,
        flipIdle: false, // Hoạt ảnh đã hướng chuẩn sang bên trái nhìn Bé Sâu
        flipAttack: false, // Hoạt ảnh 8 bước xuất chiêu đã được hướng sang trái
        flipHit: false
      };
    }
    if (key.includes('crab') || key === 'enc_map2_1' || name.includes('cua')) {
      return {
        idle: crabIdleUrl,
        attack: crabSkillUrl,
        hit: crabHitUrl,
        celebrate: crabCelebrateUrl,
        fallback: crabIdleUrl,
        flipIdle: false, // Hoạt ảnh đã hướng chuẩn sang bên trái nhìn Bé Sâu
        flipAttack: false, // Hoạt ảnh 8 bước xuất chiêu đã được hướng sang trái
        flipHit: false
      };
    }
    if (key.includes('crystal_sprout') || key === 'enc_map3_1' || name.includes('thạch nhũ')) {
      return {
        idle: crystalSproutIdleUrl,
        attack: crystalSproutSkillUrl,
        hit: crystalSproutHitUrl,
        celebrate: crystalSproutCelebrateUrl,
        fallback: crystalSproutIdleUrl,
        flipIdle: false,
        flipAttack: true, // SỬA: Lật sang trái hướng về phía Bé Sâu
        flipHit: false
      };
    }
    if (key.includes('crystal_moth') || key === 'enc_map3_2' || name.includes('bướm đêm')) {
      return {
        idle: crystalMothIdleUrl,
        attack: crystalMothSkillUrl,
        hit: crystalMothHitUrl,
        celebrate: crystalMothCelebrateUrl,
        fallback: crystalMothIdleUrl,
        flipIdle: false,
        flipAttack: true, // SỬA: Lật sang trái hướng về phía Bé Sâu
        flipHit: false
      };
    }
    if (key.includes('crystal_bat') || key === 'enc_map3_3' || name.includes('dơi')) {
      return {
        idle: crystalBatIdleUrl,
        attack: crystalBatSkillUrl,
        hit: crystalBatHitUrl,
        celebrate: crystalBatCelebrateUrl,
        fallback: crystalBatIdleUrl,
        flipIdle: false,
        flipAttack: true, // SỬA: Lật sang trái hướng về phía Bé Sâu
        flipHit: false
      };
    }
    return {
      idle: monIdleUrl,
      attack: monAttackUrl,
      hit: monHitUrl,
      celebrate: monCelebrateUrl,
      fallback: monCaterpillarUrl,
      flipIdle: true,
      flipAttack: true,
      flipHit: true
    };
  }

  /**
   * Bộ kỹ năng riêng biệt cho từng quái vật:
   * Mỗi quái vật có tên chiêu, đạn, hiệu ứng nổ impact, âm thanh, màu hào quang và 8 bước sang trái riêng
   */
  getMonsterSkill(encounter) {
    if (this.isBoss || encounter?.phases || encounter?.isBoss) {
      const bossKey = String(encounter?.spriteKey || encounter?.id || '').toLowerCase();
      if (bossKey.includes('sphinx') || bossKey.includes('map4') || String(encounter?.name || '').includes('Nhân Sư')) {
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
      if (bossKey.includes('crystal_dragon') || bossKey.includes('map3') || String(encounter?.name || '').includes('Rồng Pha Lê')) {
        return {
          id: 'skill_crystal_dragon_prismatic_breath',
          name: 'Long Uy Pha Lê: Đại Hồng Băng Ngọc & Cầu Vồng Lục Sắc',
          badge: '🐉💎',
          element: 'crystal_dragon',
          projUrl: bossCrystalDragonProjUrl,
          impactUrl: bossCrystalDragonImpactUrl,
          projSize: 88,
          impactSize: 235,
          glowColor: '#c084fc',
          filter: 'drop-shadow(0 0 24px rgba(192, 132, 252, 0.98))',
          soundType: 'sawtooth',
          baseFreq: 220,
          stepNames: [
            'Rồng Pha Lê Bừng Tỉnh Mở Mắt Ngọc',
            'Đôi Cánh Pha Lê Vỗ Động Hào Quang',
            'Tích Tụ Năng Lượng Kim Cương Vĩnh Cửu',
            'Lao Tới Gầm Vang Khắp Hang Đá',
            'Phóng Hào Quang Băng Ngọc Sang Trái',
            'Bão Tinh Thể Nổ Tung Ngũ Sắc',
            'Cánh Rồng Tỏa Sáng Lộng Lẫy',
            'Trở Về Tư Thế Oai Nghiêm!'
          ]
        };
      }
      if (bossKey.includes('crab') || bossKey.includes('map2')) {
        return {
          id: 'skill_crab_king_tsunami',
          name: 'Hải Vương Thần Kỹ: Sóng Thần & Pháo Ngọc Trai',
          badge: '🦀🌊',
          element: 'ocean_pearl',
          projUrl: bossCrabKingProjUrl,
          impactUrl: bossCrabKingImpactUrl,
          projSize: 84,
          impactSize: 220,
          glowColor: '#06b6d4',
          filter: 'drop-shadow(0 0 24px rgba(6, 182, 212, 0.98))',
          soundType: 'sawtooth',
          baseFreq: 180,
          stepNames: [
            'Cua Vua Giương Càng Ngọc Uy Phong',
            'Viên Ngọc Trai Hoàng Gia Tỏa Sáng',
            'Tích Tụ Năng Lượng Thủy Triều Biển Cả',
            'Lao Mạnh Về Phía Trước',
            'Kẹp Càng Bắn Đại Hồng Thủy Sang Trái',
            'Pháo Ngọc Trai Bùng Nổ Sóng Thần',
            'Kim Cương Bọt Biển Lấp Lánh',
            'Thu Thế Thủ Lĩnh Biển Cả Oai Nghiêm!'
          ]
        };
      }
      return {
        id: 'skill_dragon_fire_breath',
        name: 'Hỏa Long Thần Kỹ: Phun Lửa Cầu Vồng',
        badge: '🐉🔥',
        element: 'dragon_fire',
        projUrl: dragonFireballProjUrl,
        impactUrl: dragonFireImpactUrl,
        projSize: 78,
        impactSize: 210,
        glowColor: '#f97316',
        filter: 'drop-shadow(0 0 22px rgba(249, 115, 22, 0.98))',
        soundType: 'sawtooth',
        baseFreq: 220,
        stepNames: [
          'Hỏa Long Tung Cánh',
          'Tích Tụ Hỏa Diệm',
          'Lao Mạnh Sang Trái',
          'Phun Lửa Cầu Vồng',
          'Lốc Xoáy Bùng Lửa',
          'Thiêu Đốt Không Gian',
          'Hào Quang Rực Rỡ',
          'Thu Cánh Uy Nghiêm!'
        ]
      };
    }
    const key = String(encounter?.spriteKey || encounter?.monsterId || encounter?.id || '').toLowerCase();
    const name = String(encounter?.name || '').toLowerCase();

    if (key.includes('desert_fox') || key === 'enc_map4_1' || name.includes('cáo') || name.includes('fennec')) {
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
    if (key.includes('scarab') || key === 'enc_map4_2' || name.includes('bọ') || name.includes('kim quy')) {
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
    if (key.includes('desert_falcon') || key === 'enc_map4_3' || name.includes('chim ưng') || name.includes('falcon')) {
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
    if (key.includes('mushroom') || key === 'enc_map1_1' || name.includes('nấm')) {
      return {
        id: 'skill_mushroom_spore_blast',
        name: 'Bào Tử Ma Thuật: Mưa Bào Tử Cầu Vồng',
        badge: '🍄✨',
        element: 'spore',
        projUrl: mushroomProjUrl,
        impactUrl: mushroomImpactUrl,
        projSize: 62,
        impactSize: 170,
        glowColor: '#ec4899',
        filter: 'drop-shadow(0 0 16px rgba(236, 72, 153, 0.95))',
        soundType: 'sine',
        baseFreq: 320,
        stepNames: [
          'Nấm Con Nhún Chân Lấy Đà',
          'Rung Rinh Mũ Nấm Đỏ Chấm Bi',
          'Tụ Lực Bào Tử Thần Kỳ',
          'Bắn Cầu Bào Tử Sang Trái',
          'Bào Tử Xoay Tròn Bay Nhanh',
          'Pháo Bào Tử Bùng Nổ Ngũ Sắc',
          'Nấm Con Vỗ Tay Hoan Hô',
          'Trở Về Vị Trí Vui Tươi!'
        ]
      };
    }
    if (key.includes('bee') || key === 'enc_map1_2' || name.includes('ong')) {
      return {
        id: 'skill_bee_honey_dart',
        name: 'Kim Châm Mật Ong: Phi Tiêu Mật Ngọt',
        badge: '🐝🍯',
        element: 'honey',
        projUrl: beeProjUrl,
        impactUrl: beeImpactUrl,
        projSize: 66,
        impactSize: 175,
        glowColor: '#eab308',
        filter: 'drop-shadow(0 0 16px rgba(234, 179, 8, 0.95))',
        soundType: 'triangle',
        baseFreq: 520,
        stepNames: [
          'Ong Vàng Đập Cánh Bay Vút Lên',
          'Xoay Người Nhắm Trúng Đích',
          'Tụ Mật Ngọt Lấp Lánh',
          'Phóng Kim Châm Mật Sang Trái',
          'Phi Tiêu Xé Gió Lao Tới',
          'Mật Ong Nổ Bung Giọt Vàng',
          'Lượn Một Vòng Số 8 Điệu Nghệ',
          'Hạ Cánh Rung Râu Đắc Ý!'
        ]
      };
    }
    if (key.includes('ladybug') || key === 'enc_map1_3' || name.includes('bọ rùa')) {
      return {
        id: 'skill_ladybug_amber_beam',
        name: 'Quang Ba Hổ Phách: Tia Sáng Ngọc Cam',
        badge: '🐞🔶',
        element: 'amber',
        projUrl: ladybugProjUrl,
        impactUrl: ladybugImpactUrl,
        projSize: 68,
        impactSize: 180,
        glowColor: '#f97316',
        filter: 'drop-shadow(0 0 18px rgba(249, 115, 22, 0.95))',
        soundType: 'sawtooth',
        baseFreq: 400,
        stepNames: [
          'Bọ Rùa Xòe Đôi Cánh Cam Lộng Lẫy',
          'Đốm Tròn Trên Lưng Phát Sáng',
          'Hội Tụ Quang Năng Hổ Phách',
          'Bắn Cầu Sáng Cam Sang Trái',
          'Tia Năng Lượng Rực Rỡ Bay Qua',
          'Hoa Lửa Cam Bùng Nổ Lấp Lánh',
          'Gập Cánh Chắp Tay Dễ Thương',
          'Cười Tít Mắt Tươi Vui!'
        ]
      };
    }
    if (key.includes('starfish') || key === 'enc_map2_2' || name.includes('sao biển')) {
      return {
        id: 'skill_starfish_golden_whirl',
        name: 'Hải Tinh Thần Pháp: Phi Tiêu Sao Vàng Biển Cả',
        badge: '⭐🌊',
        element: 'ocean_star',
        projUrl: starfishProjUrl,
        impactUrl: starfishImpactUrl,
        projSize: 66,
        impactSize: 170,
        glowColor: '#eab308',
        filter: 'drop-shadow(0 0 16px rgba(234, 179, 8, 0.95))',
        soundType: 'sine',
        baseFreq: 480,
        stepNames: [
          'Sao Biển Vàng Nhấc 5 Cánh Sao',
          'Xoay Tròn Tạo Vòng Xoáy Biển Cả',
          'Tụ Năng Lượng Ánh Sao Hoàng Kim',
          'Phóng Phi Tiêu Sao Vàng Sang Trái',
          'Vòng Xoáy Sao Vàng Xé Gió Lao Tới',
          'Bọt Nước Kim Cương Nổ Tung Lấp Lánh',
          'Sao Biển Tiếp Đất Lắc Lư Nhịp Nhàng',
          'Dang 5 Cánh Sao Đắc Thắng Vui Tươi!'
        ]
      };
    }
    if (key.includes('emerald') || key === 'enc_map2_3' || name.includes('ngọc bích')) {
      return {
        id: 'skill_emerald_crab_laser',
        name: 'Ngọc Bích Thần Kỹ: Tia Sáng Ngọc & Pháo Bọt Biển',
        badge: '🦀💚',
        element: 'ocean_emerald',
        projUrl: emeraldCrabProjUrl,
        impactUrl: emeraldCrabImpactUrl,
        projSize: 72,
        impactSize: 185,
        glowColor: '#10b981',
        filter: 'drop-shadow(0 0 18px rgba(16, 185, 129, 0.95))',
        soundType: 'triangle',
        baseFreq: 360,
        stepNames: [
          'Cua Ngọc Bích Giương Đôi Càng Xanh Lấp Lánh',
          'Viên Ngọc Trên Mai Phát Hào Quang Rực Rỡ',
          'Tích Tụ Năng Lượng Bão Biển Xanh Thẳm',
          'Lao Nhanh Sang Trái Tung Cú Kẹp Thần Tốc',
          'Bắn Cầu Năng Lượng Ngọc Bích Sang Trái',
          'Bão Ngọc Lục Bảo Bùng Nổ Sáng Rực Khắp Sân',
          'Cua Ngọc Bích Nghiêng Mình Lướt Nhẹ Kiêu Hãnh',
          'Thu Đôi Càng Về Vị Trí Vững Vàng!'
        ]
      };
    }
    if (key.includes('crab') || key === 'enc_map2_1' || name.includes('cua')) {
      return {
        id: 'skill_crab_water_jet',
        name: 'Hải Kẹp Thần Công: Đại Pháo Bong Bóng Biển',
        badge: '🦀💧',
        element: 'ocean_bubble',
        projUrl: crabProjUrl,
        impactUrl: crabImpactUrl,
        projSize: 68,
        impactSize: 175,
        glowColor: '#06b6d4',
        filter: 'drop-shadow(0 0 16px rgba(6, 182, 212, 0.95))',
        soundType: 'sawtooth',
        baseFreq: 310,
        stepNames: [
          'Cua Kẹp Nhỏ Giơ Đôi Càng Đỏ Thắm',
          'Lắc Lư Sang Ngang Lấy Đà Vui Nhộn',
          'Hít Thật Sâu Tụ Năng Lượng Thủy Triều',
          'Bắn Đại Pháo Bong Bóng Sang Trái',
          'Bong Bóng Khổng Lồ Bay Vèo Trong Gió Biển',
          'Bọt Nước Biển Cả Nổ Tung Lung Linh Hoa Nắng',
          'Cua Nhỏ Nhún Nhảy Đi Ngang Tinh Nghịch',
          'Vẫy Chào Bé Sâu Đầy Thân Thiện!'
        ]
      };
    }
    if (key.includes('crystal_sprout') || key === 'enc_map3_1' || name.includes('thạch nhũ')) {
      return {
        id: 'skill_crystal_sprout_gem_shard',
        name: 'Tinh Thể Thạch Nhũ: Bão Mảnh Băng Ngọc',
        badge: '💎❄️',
        element: 'crystal_earth',
        projUrl: crystalSproutProjUrl,
        impactUrl: crystalSproutImpactUrl,
        projSize: 70,
        impactSize: 180,
        glowColor: '#06b6d4',
        filter: 'drop-shadow(0 0 18px rgba(6, 182, 212, 0.98))',
        soundType: 'triangle',
        baseFreq: 350,
        stepNames: [
          'Bé Thạch Nhũ Dậm Chân Tích Lực',
          'Gai Tinh Thể Trên Đầu Sáng Bừng',
          'Tụ Năng Lượng Đất Mẹ Pha Lê',
          'Bắn Chùm Tinh Thể Ngọc Sang Trái',
          'Mảnh Ngọc Xé Không Gian Bay Vút',
          'Băng Ngọc Va Chạm Nổ Tung Lung Linh',
          'Thạch Nhũ Lắc Lư Vỗ Tay Khen Ngợi',
          'Vững Vàng Đứng Nghiêm Trang!'
        ]
      };
    }
    if (key.includes('crystal_moth') || key === 'enc_map3_2' || name.includes('bướm đêm')) {
      return {
        id: 'skill_crystal_moth_lunar_dust',
        name: 'Nguyệt Quang Dạ Điệp: Phấn Bướm Dạ Quang Ngũ Sắc',
        badge: '🦋🌙',
        element: 'crystal_light',
        projUrl: crystalMothProjUrl,
        impactUrl: crystalMothImpactUrl,
        projSize: 72,
        impactSize: 185,
        glowColor: '#a855f7',
        filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.98))',
        soundType: 'sine',
        baseFreq: 520,
        stepNames: [
          'Bướm Dạ Quang Vỗ Cánh Bay Lên',
          'Tung Rắc Phấn Bướm Dạ Quang Sáng Tím',
          'Tụ Vầng Trăng Khuyết Năng Lượng',
          'Phóng Quả Cầu Ánh Sáng Sang Trái',
          'Tia Nguyệt Quang Uốn Lượn Rực Rỡ',
          'Pháo Hoa Dạ Quang Bùng Nổ Hang Đá',
          'Bướm Con Lượn Vòng Chúc Mừng',
          'Hạ Cánh Rung Râu Lấp Lánh!'
        ]
      };
    }
    if (key.includes('crystal_bat') || key === 'enc_map3_3' || name.includes('dơi')) {
      return {
        id: 'skill_crystal_bat_sonic_wave',
        name: 'Âm Ba Thạch Anh: Sóng Siêu Âm Pha Lê',
        badge: '🦇🔮',
        element: 'crystal_sonic',
        projUrl: crystalBatProjUrl,
        impactUrl: crystalBatImpactUrl,
        projSize: 72,
        impactSize: 180,
        glowColor: '#818cf8',
        filter: 'drop-shadow(0 0 18px rgba(129, 140, 248, 0.98))',
        soundType: 'sawtooth',
        baseFreq: 460,
        stepNames: [
          'Bé Dơi Vểnh Tai Bắt Sóng',
          'Hít Thật Sâu Tụ Năng Lượng Tím',
          'Mở Miệng Phát Sóng Siêu Âm',
          'Bắn Chuỗi Vòng Sóng Âm Sang Trái',
          'Sóng Năng Lượng Rung Chuyển Không Gian',
          'Vòng Siêu Âm Bùng Nổ Hoa Sao',
          'Dơi Tím Lộn Một Vòng Dễ Thương',
          'Treo Mình Lơ Lửng Đắc Thắng!'
        ]
      };
    }

    // Fallback cho quái khác
    return {
      id: 'skill_razor_sprout',
      name: 'Đạn Lá Cuồng Phong',
      badge: '🌱',
      element: 'nature',
      projUrl: caterpillarProjUrl,
      impactUrl: tornadoImpactUrl,
      projSize: 58,
      impactSize: 165,
      glowColor: '#eab308',
      filter: 'drop-shadow(0 0 14px rgba(255, 200, 50, 0.9))',
      soundType: 'triangle',
      baseFreq: 340,
      stepNames: [
        'Tụ Lá Cây',
        'Tạo Lốc Năng Lượng',
        'Xoay Tròn Đạn Lá',
        'Bắn Đạn Sang Trái',
        'Gia Tốc Bay Nhanh',
        'Xé Gió Áp Sát',
        'Nổ Tung Đạn Lá',
        'Thu Thế Thủ Lĩnh'
      ]
    };
  }`;

  code = code.slice(0, startAssets) + newAssetsAndSkill + code.slice(endSkill);
  console.log('✓ Đã cập nhật xong getMonsterAssets và getMonsterSkill!');
} else {
  console.error('Không tìm thấy vị trí getMonsterAssets hoặc getMonsterSkill!');
}

// 1c. Cập nhật Background trong openArena()
const oldBgBlock = `    // Cập nhật background cho Sàn đấu đúng với Map hiện tại
    const savedState = this.saveAdapter ? this.saveAdapter.load() : null;
    const currentMapId = savedState?.campaign?.currentMapId || 'map1';
    const bgMap = {
      map1: '/assets/maps/backgrounds/map_1_bg.png',
      map2: '/assets/maps/backgrounds/map_2_bg.png',
      map3: '/assets/maps/backgrounds/map_3_bg.png',
      map4: '/assets/maps/backgrounds/map_4_bg.png',
      map5: '/assets/maps/backgrounds/map_5_bg.png',
      map6: '/assets/maps/backgrounds/map_6_bg.png'
    };
    if (this.arenaModal) {
      this.arenaModal.style.backgroundImage = \`url('\${bgMap[currentMapId] || bgMap.map1}')\`;`;

const newBgBlock = `    // Cập nhật background cho Sàn đấu đúng với Map hiện tại
    const savedState = this.saveAdapter ? this.saveAdapter.load() : null;
    const currentMapId = window.__currentMapId 
      || (this.currentEncounter?.id?.includes('map') ? ('map' + this.currentEncounter.id.split('map')[1].charAt(0)) : null)
      || (this.currentEncounter?.mapId)
      || savedState?.campaign?.currentMapId 
      || 'map1';
    const bgMap = {
      map1: map1BgUrl,
      map2: map2BgUrl,
      map3: map3BgUrl,
      map4: map4BgUrl,
      map5: map5BgUrl,
      map6: map6BgUrl
    };
    if (this.arenaModal) {
      const chosenBg = bgMap[currentMapId] || bgMap.map1;
      this.arenaModal.style.backgroundImage = \`url('\${chosenBg}')\`;`;

code = code.replace(oldBgBlock, newBgBlock);

// 1d. Cập nhật executeHeroAttack để dùng skill Thái Dương Cầu Xoáy cho Map 4
const oldHeroAttackVortex = `    if (this.heroProj) {
      this.heroProj.innerHTML = \`
        <img src="\${heroVortexProjUrl}" class="vortex-spinning" style="width:58px;height:58px;object-fit:contain;filter:drop-shadow(0 0 14px rgba(56,189,248,0.95));" alt="Cầu Xoáy">
      \`;`;

const newHeroAttackVortex = `    const savedStateForAttack = this.saveAdapter ? this.saveAdapter.load() : null;
    const activeMapId = window.__currentMapId 
      || (this.currentEncounter?.id?.includes('map') ? ('map' + this.currentEncounter.id.split('map')[1].charAt(0)) : null)
      || savedStateForAttack?.campaign?.currentMapId 
      || 'map1';
    const isMap4 = activeMapId === 'map4' || String(this.currentEncounter?.id || '').includes('map4');
    const heroProjSrc = isMap4 ? heroSunVortexProjUrl : heroVortexProjUrl;
    const heroProjGlow = isMap4 ? 'rgba(245,158,11,0.95)' : 'rgba(56,189,248,0.95)';
    const heroImpactSrc = isMap4 ? heroSunExplosionUrl : heroExplosion5Url;
    const heroImpactSize = isMap4 ? 190 : 170;

    if (this.heroProj) {
      this.heroProj.innerHTML = \`
        <img src="\${heroProjSrc}" class="vortex-spinning" style="width:64px;height:64px;object-fit:contain;filter:drop-shadow(0 0 16px \${heroProjGlow});" alt="Cầu Xoáy">
      \`;`;

code = code.replace(oldHeroAttackVortex, newHeroAttackVortex);

const oldHeroExplosion = `      // Vụ nổ Explosion_5
      if (this.impactFx) {
        this.impactFx.style.left = \`\${targetX}px\`;
        this.impactFx.style.top = \`\${targetY}px\`;
        this.impactFx.innerHTML = \`
          <img src="\${heroExplosion5Url}" style="width:170px;height:170px;object-fit:contain;filter:drop-shadow(0 0 20px rgba(56,189,248,0.95));" alt="Nổ">
        \`;
        this.impactFx.classList.add('active');
      }`;

const newHeroExplosion = `      // Vụ nổ Skill Nhân Vật
      if (this.impactFx) {
        this.impactFx.style.left = \`\${targetX}px\`;
        this.impactFx.style.top = \`\${targetY}px\`;
        this.impactFx.innerHTML = \`
          <img src="\${heroImpactSrc}" style="width:\${heroImpactSize}px;height:\${heroImpactSize}px;object-fit:contain;filter:drop-shadow(0 0 22px \${heroProjGlow});" alt="Nổ">
        \`;
        this.impactFx.classList.add('active');
      }`;

code = code.replace(oldHeroExplosion, newHeroExplosion);

// 1e. Cập nhật Khiên Phòng Thủ của Hero
const oldShieldBlock = `    // Chế độ Showcase (Trình diễn kỹ năng Boss / Enrage): Bé Sâu có Khiên Cầu Vồng bảo vệ
    if (isShowcase || mealBlocked) {
      if (this.arenaHeroBox) {
        this.arenaHeroBox.classList.add('hero-shielded', 'hero-skill-glow');
      }

      // Pop-up Khiên Chắn
      const shieldPopup = document.createElement('div');
      shieldPopup.className = 'damage-popup damage-hero';
      shieldPopup.style.color = '#38bdf8';
      shieldPopup.style.textShadow = '0 0 10px #0284c7';
      shieldPopup.textContent = mealBlocked ? '⚡ KHIÊN MÓN ĂN!' : '🛡️ KHIÊN CẦU VỒNG!';
      this.arenaHeroBox.appendChild(shieldPopup);
      setTimeout(() => shieldPopup.remove(), 1000);`;

const newShieldBlock = `    // Chế độ Showcase hoặc Đỡ đòn: Bé Sâu có Khiên Phòng Thủ bảo vệ
    if (isShowcase || mealBlocked) {
      const activeMapForShield = window.__currentMapId 
        || (this.currentEncounter?.id?.includes('map') ? ('map' + this.currentEncounter.id.split('map')[1].charAt(0)) : null)
        || 'map1';
      const isMap4Shield = activeMapForShield === 'map4' || String(this.currentEncounter?.id || '').includes('map4');

      if (this.arenaHeroBox) {
        this.arenaHeroBox.classList.add('hero-shielded', 'hero-skill-glow');
        const shieldImg = isMap4Shield ? heroSunShieldUrl : null;
        if (shieldImg) {
          const sWrap = document.createElement('div');
          sWrap.className = 'hero-defense-shield-wrap';
          sWrap.id = 'hero-defense-shield';
          sWrap.innerHTML = \`<img src="\${shieldImg}" class="hero-defense-shield-img" alt="Khiên Thái Dương">\`;
          this.arenaHeroBox.appendChild(sWrap);
          setTimeout(() => sWrap.remove(), 1100);
        }
      }

      // Pop-up Khiên Chắn
      const shieldPopup = document.createElement('div');
      shieldPopup.className = 'damage-popup damage-hero';
      shieldPopup.style.color = isMap4Shield ? '#f59e0b' : '#38bdf8';
      shieldPopup.style.textShadow = isMap4Shield ? '0 0 12px #d97706' : '0 0 10px #0284c7';
      shieldPopup.textContent = mealBlocked ? '⚡ KHIÊN MÓN ĂN!' : (isMap4Shield ? '🛡️ KHIÊN THÁI DƯƠNG!' : '🛡️ KHIÊN CẦU VỒNG!');
      this.arenaHeroBox.appendChild(shieldPopup);
      setTimeout(() => shieldPopup.remove(), 1000);`;

code = code.replace(oldShieldBlock, newShieldBlock);

// 1f. Cập nhật lời nhắc lượt của Bé
code = code.replace(
  `this.turnIndicator.textContent = '✨ Lượt của Bé: Chọn đáp án đúng để xuất chiêu Cầu Xoáy!';`,
  `const isM4 = (window.__currentMapId === 'map4' || String(this.currentEncounter?.id || '').includes('map4'));\n    this.turnIndicator.innerHTML = isM4 ? '✨ Lượt của Bé: Chọn đáp án đúng để xuất chiêu <strong>Thái Dương Cầu Xoáy! ☀️</strong>' : '✨ Lượt của Bé: Chọn đáp án đúng để xuất chiêu Cầu Xoáy!';`
);

fs.writeFileSync('./src/game/ui/BattleArenaModal.js', code, 'utf8');
console.log('✓ BattleArenaModal.js updated successfully!');
