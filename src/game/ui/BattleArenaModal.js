import { getQuestion, getRandomZoneQuestion, createMazeQuestion, shuffleQuestion } from '../../content/questions/questionBank.js';
import { formatQuestionPromptHtml, resolveChoiceImage, resolveChoiceQuantityAndItem, escapeHtml } from './promptFormatter.js';

// Assets imported directly with ?url so Vite bundles and resolves them with guaranteed valid URLs
import sauIdleUrl from '../../../assets/hero/sau/sau_idle.webp?url';
import sauIdleRightUrl from '../../../assets/hero/sau/sau_idle_right.webp?url';
import sauActionUrl from '../../../assets/hero/sau/sau_action.webp?url';
import sauHitUrl from '../../../assets/hero/sau/sau_hit.webp?url';
import sauCelebrateUrl from '../../../assets/hero/sau/sau_celebrate.webp?url';

import heroUpgradeIdleRightUrl from '../../../assets/hero/sau_upgrade/hero_upgrade_idle_right.webp?url';
import heroUpgradeActionUrl from '../../../assets/hero/sau_upgrade/hero_upgrade_action.webp?url';
import heroUpgradeHitUrl from '../../../assets/hero/sau_upgrade/hero_upgrade_hit.webp?url';
import heroUpgradeCelebrateUrl from '../../../assets/hero/sau_upgrade/hero_upgrade_celebrate.webp?url';

import monCaterpillarUrl from '../../../assets/monsters/map2/mon_caterpillar.png?url';
import monIdleUrl from '../../../assets/monsters/map2/mon_caterpillar_idle.webp?url';
import monAttackUrl from '../../../assets/monsters/map2/mon_caterpillar_attack.webp?url';
import monHitUrl from '../../../assets/monsters/map2/mon_caterpillar_hit.webp?url';
import monCelebrateUrl from '../../../assets/monsters/map2/mon_caterpillar_celebrate.webp?url';

import bossDragonUrl from '../../../assets/monsters/boss_dragon/boss_dragon.png?url';
import bossDragonIdleUrl from '../../../assets/monsters/boss_dragon/boss_dragon_idle.webp?url';
import bossDragonSkillUrl from '../../../assets/monsters/boss_dragon/boss_dragon_skill.webp?url';
import bossDragonHitUrl from '../../../assets/monsters/boss_dragon/boss_dragon_hit.webp?url';
import bossDragonCelebrateUrl from '../../../assets/monsters/boss_dragon/boss_dragon_celebrate.webp?url';
import dragonFireballProjUrl from '../../../assets/monsters/boss_dragon/dragon_fireball_proj.png?url';
import dragonFireImpactUrl from '../../../assets/monsters/boss_dragon/dragon_fire_impact.png?url';

import mushroomIdleUrl from '../../../assets/monsters/map1/mushroom_walk.webp?url';
import mushroomSkillUrl from '../../../assets/monsters/map1/mushroom_skill.webp?url';
import mushroomHitUrl from '../../../assets/monsters/map1/mushroom_hit.webp?url';
import mushroomCelebrateUrl from '../../../assets/monsters/map1/mushroom_celebrate.webp?url';

import beeIdleUrl from '../../../assets/monsters/map1/bee_walk.webp?url';
import beeSkillUrl from '../../../assets/monsters/map1/bee_skill.webp?url';
import beeHitUrl from '../../../assets/monsters/map1/bee_hit.webp?url';
import beeCelebrateUrl from '../../../assets/monsters/map1/bee_celebrate.webp?url';

import ladybugIdleUrl from '../../../assets/monsters/map1/ladybug_walk.webp?url';
import ladybugSkillUrl from '../../../assets/monsters/map1/ladybug_skill.webp?url';
import ladybugHitUrl from '../../../assets/monsters/map1/ladybug_hit.webp?url';
import ladybugCelebrateUrl from '../../../assets/monsters/map1/ladybug_celebrate.webp?url';

import mushroomProjUrl from '../../../assets/monsters/map1/mushroom_proj.png?url';
import mushroomImpactUrl from '../../../assets/monsters/map1/mushroom_impact.png?url';

import beeProjUrl from '../../../assets/monsters/map1/bee_proj.png?url';
import beeImpactUrl from '../../../assets/monsters/map1/bee_impact.png?url';

import ladybugProjUrl from '../../../assets/monsters/map1/ladybug_proj.png?url';
import ladybugImpactUrl from '../../../assets/monsters/map1/ladybug_impact.png?url';

import crabIdleUrl from '../../../assets/monsters/map2/mon_crab_walk.webp?url';
import crabSkillUrl from '../../../assets/monsters/map2/mon_crab_skill.webp?url';
import crabHitUrl from '../../../assets/monsters/map2/mon_crab_hit.webp?url';
import crabCelebrateUrl from '../../../assets/monsters/map2/mon_crab_celebrate.webp?url';
import crabProjUrl from '../../../assets/monsters/map2/mon_crab_proj.png?url';
import crabImpactUrl from '../../../assets/monsters/map2/mon_crab_impact.png?url';

import starfishIdleUrl from '../../../assets/monsters/map2/mon_starfish_walk.webp?url';
import starfishSkillUrl from '../../../assets/monsters/map2/mon_starfish_skill.webp?url';
import starfishHitUrl from '../../../assets/monsters/map2/mon_starfish_hit.webp?url';
import starfishCelebrateUrl from '../../../assets/monsters/map2/mon_starfish_celebrate.webp?url';
import starfishProjUrl from '../../../assets/monsters/map2/mon_starfish_proj.png?url';
import starfishImpactUrl from '../../../assets/monsters/map2/mon_starfish_impact.png?url';

import emeraldCrabIdleUrl from '../../../assets/monsters/map2/mon_emerald_crab_walk.webp?url';
import emeraldCrabSkillUrl from '../../../assets/monsters/map2/mon_emerald_crab_skill.webp?url';
import emeraldCrabHitUrl from '../../../assets/monsters/map2/mon_emerald_crab_hit.webp?url';
import emeraldCrabCelebrateUrl from '../../../assets/monsters/map2/mon_emerald_crab_celebrate.webp?url';
import emeraldCrabProjUrl from '../../../assets/monsters/map2/mon_emerald_crab_proj.png?url';
import emeraldCrabImpactUrl from '../../../assets/monsters/map2/mon_emerald_crab_impact.png?url';

import bossCrabKingUrl from '../../../assets/monsters/map2/boss_crab_king.png?url';
import bossCrabKingIdleUrl from '../../../assets/monsters/map2/boss_crab_king_walk.webp?url';
import bossCrabKingSkillUrl from '../../../assets/monsters/map2/boss_crab_king_skill.webp?url';
import bossCrabKingHitUrl from '../../../assets/monsters/map2/boss_crab_king_hit.webp?url';
import bossCrabKingCelebrateUrl from '../../../assets/monsters/map2/boss_crab_king_celebrate.webp?url';
import bossCrabKingProjUrl from '../../../assets/monsters/map2/boss_crab_king_proj.png?url';
import bossCrabKingImpactUrl from '../../../assets/monsters/map2/boss_crab_king_impact.png?url';

import crystalSproutIdleUrl from '../../../assets/monsters/map3/mon_crystal_sprout_walk.webp?url';
import crystalSproutSkillUrl from '../../../assets/monsters/map3/mon_crystal_sprout_skill.webp?url';
import crystalSproutHitUrl from '../../../assets/monsters/map3/mon_crystal_sprout_hit.webp?url';
import crystalSproutCelebrateUrl from '../../../assets/monsters/map3/mon_crystal_sprout_celebrate.webp?url';
import crystalSproutProjUrl from '../../../assets/monsters/map3/crystal_sprout_proj.png?url';
import crystalSproutImpactUrl from '../../../assets/monsters/map3/crystal_sprout_impact.png?url';

import crystalMothIdleUrl from '../../../assets/monsters/map3/mon_crystal_moth_walk.webp?url';
import crystalMothSkillUrl from '../../../assets/monsters/map3/mon_crystal_moth_skill.webp?url';
import crystalMothHitUrl from '../../../assets/monsters/map3/mon_crystal_moth_hit.webp?url';
import crystalMothCelebrateUrl from '../../../assets/monsters/map3/mon_crystal_moth_celebrate.webp?url';
import crystalMothProjUrl from '../../../assets/monsters/map3/crystal_moth_proj.png?url';
import crystalMothImpactUrl from '../../../assets/monsters/map3/crystal_moth_impact.png?url';

import crystalBatIdleUrl from '../../../assets/monsters/map3/mon_crystal_bat_walk.webp?url';
import crystalBatSkillUrl from '../../../assets/monsters/map3/mon_crystal_bat_skill.webp?url';
import crystalBatHitUrl from '../../../assets/monsters/map3/mon_crystal_bat_hit.webp?url';
import crystalBatCelebrateUrl from '../../../assets/monsters/map3/mon_crystal_bat_celebrate.webp?url';
import crystalBatProjUrl from '../../../assets/monsters/map3/crystal_bat_proj.png?url';
import crystalBatImpactUrl from '../../../assets/monsters/map3/crystal_bat_impact.png?url';

import bossCrystalDragonUrl from '../../../assets/monsters/map3/boss_crystal_dragon.png?url';
import bossCrystalDragonIdleUrl from '../../../assets/monsters/map3/boss_crystal_dragon_walk.webp?url';
import bossCrystalDragonSkillUrl from '../../../assets/monsters/map3/boss_crystal_dragon_skill.webp?url';
import bossCrystalDragonHitUrl from '../../../assets/monsters/map3/boss_crystal_dragon_hit.webp?url';
import bossCrystalDragonCelebrateUrl from '../../../assets/monsters/map3/boss_crystal_dragon_celebrate.webp?url';
import bossCrystalDragonProjUrl from '../../../assets/monsters/map3/boss_crystal_dragon_proj.png?url';
import bossCrystalDragonImpactUrl from '../../../assets/monsters/map3/boss_crystal_dragon_impact.png?url';
import map1BgUrl from '../../../assets/maps/backgrounds/map_1_bg.png?url';
import map2BgUrl from '../../../assets/maps/backgrounds/map_2_bg.png?url';
import map3BgUrl from '../../../assets/maps/backgrounds/map_3_bg.png?url';
import map4BgUrl from '../../../assets/maps/backgrounds/map_4_bg.png?url';
import map5BgUrl from '../../../assets/maps/backgrounds/map_5_bg.png?url';
import map6BgUrl from '../../../assets/maps/backgrounds/map_6_bg.png?url';

import heroSunVortexProjUrl from '../../../assets/skill/hero_sun_vortex_proj.png?url';
import heroSunExplosionUrl from '../../../assets/skill/hero_sun_explosion.png?url';
import heroSunShieldUrl from '../../../assets/skill/hero_sun_shield.png?url';
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
import bossDesertSphinxImpactUrl from '../../../assets/monsters/map4/sphinx_impact.png?url';

import heroVortexProjUrl from '../../../assets/skill/hero_vortex_proj.png?url';
import heroExplosion5Url from '../../../assets/skill/hero_explosion5.webp?url';
import caterpillarProjUrl from '../../../assets/monsters/map2/caterpillar_proj.png?url';
import tornadoImpactUrl from '../../../assets/monsters/map2/sprout_tornado_impact.png?url';

import heartFullUrl from '../../../assets/ui/kids_gui/icon_heart_full.png?url';
import heartEmptyUrl from '../../../assets/ui/kids_gui/icon_heart_empty.png?url';
import btnAnsAUrl from '../../../assets/ui/kids_gui/btn_ans_a.png?url';
import btnAnsBUrl from '../../../assets/ui/kids_gui/btn_ans_b.png?url';
import btnAnsCUrl from '../../../assets/ui/kids_gui/btn_ans_c.png?url';

/**
 * BattleArenaModal & EncounterPrompt Controller
 * Quản lý:
 * 1. Khung thông báo chạm trán & nút [ ⚔️ BẮT ĐẦU ]
 * 2. Đấu trường chuyển cảnh 2 nhân vật nhìn đối diện nhau (Bé Sâu vs Quái/Boss)
 * 3. Hiển thị thanh máu/tim của 2 bên
 * 4. Kỹ năng & đạn bay: Hero Vortex + Explosion_5; Quái vật đạn + lốc xoáy
 * 5. Hiệu ứng bị thương: Chớp đỏ toàn màn hình, rung lắc, pop-up -1 ❤️, hoạt ảnh trúng đòn
 * 6. Triết lý an toàn mầm non: Không Game Over, phép Cầu Vồng hồi phục tim và khích lệ thử lại
 */

export class BattleArenaModal {
  constructor(options = {}) {
    this.combatSystem = options.combatSystem;
    this.audioService = options.audioService;
    this.saveAdapter = options.saveAdapter;
    this.hudController = options.hudController;
    this.cookingSystem = options.cookingSystem;
    this.mazeMinigameModal = options.mazeMinigameModal;
    this.energyButton = document.getElementById('arena-energy-button');
    this.energyButton?.addEventListener('click', () => {
      if (this.isTurnLocked || this.arenaModal?.hidden || this.energyUsed) return;
      if (!this.cookingSystem?.useEnergy().ok) return;
      this.energyUsed = true;
      this.mealShield = true;
      this.updateEnergyButton();
      this.feedbackText.textContent = '🛡️ Năng lượng món ăn sẽ đỡ đòn kế tiếp. Bé tiếp tục chọn đáp án nhé!';
      this.audioService?.speak('Khiên món ăn đã sẵn sàng, bé cứ bình tĩnh chọn nhé!');
    });

    // 1. Elements cho Encounter Prompt (Đã xoá bỏ bảng sẵn sàng ở tất cả các maps theo yêu cầu)
    this.promptModal = document.getElementById('encounter-prompt-modal');
    if (this.promptModal) {
      this.promptModal.hidden = true;
      this.promptModal.style.display = 'none';
    }
    this.promptMonsterImg = document.getElementById('prompt-monster-img');
    this.promptMonsterName = document.getElementById('prompt-monster-name');
    this.promptMonsterDesc = document.getElementById('prompt-monster-desc');
    this.promptBtnStart = document.getElementById('prompt-btn-start');
    this.promptBtnRetreat = document.getElementById('prompt-btn-retreat');

    // 2. Elements cho Battle Arena (Sàn đấu 2 nhân vật)
    this.arenaModal = document.getElementById('battle-arena-modal');
    this.damageOverlay = document.getElementById('battle-damage-overlay');
    this.arenaHeroHearts = document.getElementById('arena-hero-hearts');
    this.arenaMonsterHearts = document.getElementById('arena-monster-hearts');
    this.arenaMonsterName = document.getElementById('arena-monster-name');
    this.arenaTitleBanner = document.getElementById('arena-title-banner');
    this.arenaBtnRetreat = document.getElementById('arena-btn-retreat');
    this.arenaBtnBossSkill = document.getElementById('arena-btn-boss-skill');

    this.arenaHeroBox = document.getElementById('arena-hero-box');
    this.arenaHeroImg = document.getElementById('arena-hero-img');
    this.arenaMonsterBox = document.getElementById('arena-monster-box');
    this.arenaMonsterImg = document.getElementById('arena-monster-img');

    // Fallback ảnh nếu có sự cố
    if (this.arenaMonsterImg) {
      this.arenaMonsterImg.onerror = () => {
        const assets = this.getMonsterAssets(this.currentEncounter);
        this.arenaMonsterImg.src = assets.fallback;
      };
    }
    if (this.arenaHeroImg) {
      this.arenaHeroImg.onerror = () => {
        this.arenaHeroImg.src = this.getHeroSkinAssets().idleRight;
      };
    }

    this.heroProj = document.getElementById('arena-hero-projectile');
    this.monsterProj = document.getElementById('arena-monster-projectile');
    this.impactFx = document.getElementById('arena-impact-fx');
    this.fightersStage = document.querySelector('.arena-fighters-stage');

    this.turnIndicator = document.getElementById('arena-turn-indicator');
    this.btnSpeak = document.getElementById('arena-btn-speak');
    this.promptText = document.getElementById('arena-question-prompt');
    this.btnHint = document.getElementById('arena-btn-hint');
    this.answersGrid = document.getElementById('arena-answers-grid');
    this.feedbackText = document.getElementById('arena-feedback-text');

    // State
    this.currentEncounter = null;
    this.currentQuestion = null;
    this.heroHearts = 3;
    this.monsterHearts = 1;
    this.monsterMaxHearts = 1;
    this.isTurnLocked = false;
    this.isBoss = false;
    this.isBossEnraged = false;

    this.initEventListeners();
  }

  initEventListeners() {
    // 1. Bấm nút BẮT ĐẦU từ prompt chạm trán -> Mới mở sàn đấu và câu hỏi
    if (this.promptBtnStart) {
      this.promptBtnStart.addEventListener('click', () => {
        if (!this.currentEncounter) return;
        const enc = this.currentEncounter;
        this.hidePrompt();
        window.dispatchEvent(new CustomEvent('game:encounter-start', {
          detail: { encounter: enc }
        }));
      });
    }

    if (this.promptBtnRetreat) {
      this.promptBtnRetreat.addEventListener('click', () => {
        const enc = this.currentEncounter;
        const isBoss = this.isBoss;
        this.hidePrompt();
        this.currentEncounter = null;
        if (this.audioService) {
          this.audioService.playClick?.();
        }
        window.dispatchEvent(new CustomEvent('game:encounter-retreat', {
          detail: { encounter: enc, isBoss }
        }));
        window.dispatchEvent(new CustomEvent('game:encounter-closed', {
          detail: { encounter: enc, isBoss, retreated: true }
        }));
      });
    }

    // 2. Nút Rút lui trong Đấu trường
    if (this.arenaBtnRetreat) {
      this.arenaBtnRetreat.addEventListener('click', () => {
        if (this.isTurnLocked) return;
        const enc = this.currentEncounter;
        const isBoss = this.isBoss;
        this.closeArena();
        window.dispatchEvent(new CustomEvent('game:encounter-retreat', {
          detail: { encounter: enc, isBoss }
        }));
      });
    }

    // 2b. Nút Xem Tuyệt Kỹ Boss trực tiếp (Trình diễn kỹ năng Boss)
    if (this.arenaBtnBossSkill) {
      this.arenaBtnBossSkill.addEventListener('click', () => {
        if (this.isTurnLocked) return;
        this.isTurnLocked = true;
        this.executeMonsterAttack(true); // true = showcase / preview mode (Bé Sâu có khiên chắn)
      });
    }

    // 3. Nút Nghe đọc câu hỏi
    if (this.btnSpeak) {
      this.btnSpeak.addEventListener('click', () => {
        if (this.currentQuestion && this.audioService) {
          if (this.audioService.isMuted()) {
            this.audioService.setSoundEnabled(true);
          }
          this.triggerSpeakAnimation(3500);
          this.audioService.playChime(620, 0.14);
          const textToSpeak = this.currentQuestion.speak || this.audioService.cleanTextForSpeech?.(this.currentQuestion.prompt) || this.currentQuestion.prompt;
          setTimeout(() => {
            this.audioService.speak(textToSpeak, () => {
              this.btnSpeak?.classList.remove('speaking');
            });
          }, 120);
        }
      });
    }

    // 4. Nút Gợi ý (Hint)
    if (this.btnHint) {
      this.btnHint.addEventListener('click', () => {
        if (!this.currentQuestion) return;
        const hintText = this.currentQuestion.hint || 'Bé hãy quan sát thật kỹ các đáp án nhé!';
        if (this.feedbackText) {
          this.feedbackText.textContent = `💡 Gợi ý: ${hintText}`;
        }
        if (this.audioService) {
          this.audioService.playChime(640, 0.12);
          this.audioService.speak(hintText);
        }
      });
    }
  }

  /**
   * Lấy bộ assets hoạt ảnh chiến đấu tương ứng cho Hero (Bé Sâu hoặc Bé Sâu Hiệp Sĩ Cầu Vồng)
   */
  getHeroSkinAssets() {
    const state = this.saveAdapter?.load?.() || window.__saveAdapter?.load?.() || null;
    const player = state?.player;
    const skin = player?.selectedSkin || 'default';
    const customName = player?.name;
    const isKnight = skin === 'knight' || (customName && /sam|kuromi|hiệp sĩ/i.test(customName));
    if (isKnight) {
      return {
        idleRight: heroUpgradeIdleRightUrl,
        action: heroUpgradeActionUrl,
        hit: heroUpgradeHitUrl,
        celebrate: heroUpgradeCelebrateUrl,
        name: customName || 'Bé Sam Kuromi'
      };
    }
    return {
      idleRight: sauIdleRightUrl,
      action: sauActionUrl,
      hit: sauHitUrl,
      celebrate: sauCelebrateUrl,
      name: customName || 'Bé Sâu Dũng Cảm'
    };
  }

  /**
   * Lấy bộ assets hoạt ảnh tương ứng cho từng loại Quái vật hoặc Boss:
   * Nấm Con Vui Vẻ, Ong Vàng Chăm Chỉ, Bọ Rùa Cánh Cam, hoặc Thủ lĩnh
   */
  getMonsterAssets(encounter) {
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

    // 1. Quái vật Map 1 (Làng Quê Yên Bình)
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
    if (key.includes('ladybug') || key === 'enc_map1_3' || name.includes('bọ rùa') || name.includes('cánh cam') || (name.includes('rùa') && !name.includes('biển'))) {
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

    // 2. Quái vật Map 4 (Sa Mạc Ánh Dương)
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
    if (key.includes('scarab') || key === 'enc_map4_2' || name.includes('kim quy') || name.includes('bọ hung') || (name.includes('bọ') && !name.includes('rùa'))) {
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

    // 1. Kỹ năng Quái vật Map 1 (Làng Quê Yên Bình)
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
    if (key.includes('ladybug') || key === 'enc_map1_3' || name.includes('bọ rùa') || name.includes('cánh cam') || (name.includes('rùa') && !name.includes('biển'))) {
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

    // 2. Kỹ năng Quái vật Map 4 (Sa Mạc Ánh Dương)
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
    if (key.includes('scarab') || key === 'enc_map4_2' || name.includes('kim quy') || name.includes('bọ hung') || (name.includes('bọ') && !name.includes('rùa'))) {
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
  }  /**
   * Khởi động trận chiến chạm trán (Bỏ hoàn toàn bảng sẵn sàng ở tất cả các maps theo yêu cầu người dùng)
   */
  showPrompt(encounter, isBoss = false) {
    this.currentEncounter = encounter;
    this.isBoss = Boolean(isBoss || encounter?.phases);
    this.hidePrompt();

    // Bỏ tất cả các bảng sẵn sàng ở tất cả các maps theo yêu cầu: Vào thẳng sàn đấu ngay lập tức
    window.dispatchEvent(new CustomEvent('game:encounter-start', {
      detail: { encounter, isBoss: this.isBoss }
    }));
  }

  hidePrompt() {
    if (this.promptModal) {
      this.promptModal.hidden = true;
      this.promptModal.style.display = 'none';
    }
  }

  /**
   * Tạo bộ câu hỏi cho trận chiến (5 câu cho Boss 5 tim, 3 câu cho Quái thường 3 tim)
   * Tích hợp Mini Game Mê Cung Kỳ Diệu trực tiếp vào các lượt câu hỏi khi vượt ải
   */
  getEncounterQuestions(encounter) {
    const isBoss = Boolean(encounter.phases || encounter.isBoss);
    const targetCount = isBoss ? 5 : 3;
    const knowledgeQuestions = [];

    // 1. Nếu là Boss có các pha hoặc câu hỏi định sẵn
    if (encounter.phases && encounter.phases.length > 0) {
      encounter.phases.forEach((p) => {
        if (p.questionId) {
          const q = getQuestion(p.questionId);
          if (q && !knowledgeQuestions.some(item => item.id === q.id)) knowledgeQuestions.push(q);
        }
      });
      if (encounter.questionId && knowledgeQuestions.length < targetCount) {
        const q = getQuestion(encounter.questionId);
        if (q && !knowledgeQuestions.some(item => item.id === q.id)) knowledgeQuestions.push(q);
      }
    } else if (encounter.questionId) {
      const q = getQuestion(encounter.questionId);
      if (q) knowledgeQuestions.push(q);
    }

    // 2. Điền bổ sung các câu hỏi khác trong ngân hàng câu hỏi
    const mapId = encounter.mapId || (encounter.id?.includes('map') ? encounter.id.split('_')[1] : 'map1');
    let safetyCounter = 0;
    while (knowledgeQuestions.length < targetCount && safetyCounter < 30) {
      safetyCounter++;
      const excludeIds = knowledgeQuestions.map(q => q.id);
      const extraQ = getRandomZoneQuestion(mapId, excludeIds);
      if (extraQ && !knowledgeQuestions.some(q => q.id === extraQ.id)) {
        knowledgeQuestions.push(extraQ);
      } else {
        break;
      }
    }

    // 3. Dự phòng câu hỏi nếu ngân hàng chưa đủ số lượng
    const fallbackIds = ['q_map1_colors_1', 'q_map1_shapes_1', 'q_map1_fruits_1', 'q_map1_animals_1', 'q_map1_colors_2'];
    let fbIdx = 0;
    while (knowledgeQuestions.length < targetCount) {
      const fbQ = getQuestion(fallbackIds[fbIdx % fallbackIds.length]);
      if (fbQ && !knowledgeQuestions.some(q => q.id === fbQ.id)) {
        knowledgeQuestions.push(fbQ);
      } else if (fbQ) {
        knowledgeQuestions.push({ ...fbQ, id: `${fbQ.id}_fb_${knowledgeQuestions.length}` });
      }
      fbIdx++;
    }

    // 4. Tích hợp Mini Game Mê Cung Kỳ Diệu trực tiếp vào chuỗi câu hỏi vượt ải
    const list = [];
    if (isBoss) {
      // Boss 5 tim: Q1 (Pha 1) -> Q2 (Mê cung giải mã) -> Q3 (Pha 2) -> Q4 (Mê cung cao trào) -> Q5 (Dứt điểm)
      list.push(knowledgeQuestions[0]);
      list.push(createMazeQuestion({ encounter, phase: 1, isBoss: true }));
      list.push(knowledgeQuestions[1] || knowledgeQuestions[0]);
      list.push(createMazeQuestion({ encounter, phase: 2, isBoss: true }));
      list.push(knowledgeQuestions[2] || knowledgeQuestions[0]);
    } else {
      // Quái thường 3 tim: Q1 (Kiến thức) -> Q2 (Mê cung vượt ải) -> Q3 (Kiến thức kết liễu)
      list.push(knowledgeQuestions[0]);
      list.push(createMazeQuestion({ encounter, phase: 1, isBoss: false }));
      list.push(knowledgeQuestions[1] || knowledgeQuestions[0]);
    }

    return list.slice(0, targetCount).map(q => shuffleQuestion(q));
  }

  /**
   * Mở Sàn đấu Battle Arena: 2 nhân vật nhìn đối diện nhau và thể hiện máu 2 bên (Boss 5 tim, Quái 3 tim)
   */
  openArena(encounter) {
    if (this.arenaModal && !this.arenaModal.hidden) return;
    this.currentEncounter = encounter;
    this.isBoss = Boolean(encounter.phases || encounter.isBoss);
    const meal = this.cookingSystem?.beginBattle() || { hearts: 3, maxHearts: 3, bonus: 0 };
    this.heroHearts = meal.hearts;
    this.heroMaxHearts = meal.maxHearts;
    this.bonusHeartsRemaining = meal.bonus || 0;
    this.energyUsed = false;
    this.mealShield = false;
    this.updateEnergyButton();
    this.monsterMaxHearts = this.isBoss ? 5 : 3; // 5 tim cho Boss, 3 tim cho quái nhỏ
    this.monsterHearts = this.monsterMaxHearts;
    this.isTurnLocked = false;

    // Nạp danh sách câu hỏi theo số tim
    this.encounterQuestions = this.getEncounterQuestions(encounter);
    this.currentQuestionIndex = 0;
    this.currentQuestion = this.encounterQuestions[0] ? shuffleQuestion(this.encounterQuestions[0]) : null;

    if (this.combatSystem) {
      this.combatSystem.startEncounter(encounter, this.currentQuestion);
    }

    // Hiển thị tên & Banner
    if (this.arenaMonsterName) this.arenaMonsterName.textContent = encounter.name;
    if (this.arenaTitleBanner) {
      this.arenaTitleBanner.textContent = this.isBoss ? `🔥 ĐẠI THỬ THÁCH 5 TIM: ${encounter.name}` : `⚔️ ĐẤU TRƯỜNG GIẢI CỨU!`;
    }
    if (this.arenaBtnBossSkill) {
      this.arenaBtnBossSkill.hidden = !this.isBoss;
      if (this.isBoss) {
        const isCrab = String(encounter?.name || '').includes('Cua');
        this.arenaBtnBossSkill.innerHTML = isCrab ? `🦀 <span>Xem Đại Hồng Thủy</span>` : `🐉 <span>Xem Phun Lửa</span>`;
      }
    }

    // Cập nhật máu 2 bên: 3 tim cho Bé, 3 hoặc 5 tim cho Quái
    this.renderHearts(this.arenaHeroHearts, this.heroHearts, this.heroMaxHearts);
    this.renderHearts(this.arenaMonsterHearts, this.monsterHearts, this.monsterMaxHearts);

    // Cấu hình sprite 2 nhân vật nhìn đối diện nhau (không cắt hình, contain)
    const monsterAssets = this.getMonsterAssets(encounter);
    const heroAssets = this.getHeroSkinAssets();
    if (this.arenaHeroImg) {
      this.arenaHeroImg.src = heroAssets.idleRight;
      this.arenaHeroImg.style.transform = 'none';
    }
    const heroNameTag = document.getElementById('arena-hero-name') || this.arenaHeroBox?.querySelector('.arena-name-tag');
    if (heroNameTag) {
      heroNameTag.textContent = heroAssets.name;
    }

    if (this.arenaMonsterImg) {
      this.arenaMonsterImg.src = monsterAssets.idle;
      const idleFlip = monsterAssets.flipIdle ? 'scaleX(-1)' : 'none';
      this.arenaMonsterImg.style.transform = this.getMonsterTransform(idleFlip); // Quái vật nhìn sang trái về phía Bé Sâu
    }

    if (this.arenaMonsterBox) {
      this.arenaMonsterBox.classList.toggle('is-boss-arena', Boolean(this.isBoss));
    }

    // Reset trạng thái Nổi giận (Enrage)
    this.setBossEnrage(false);

    // Xoá bóng đổ của tất cả quái vật theo yêu cầu người dùng
    const monsterShadow = document.getElementById('arena-monster-shadow');
    if (monsterShadow) {
      monsterShadow.style.display = 'none';
    }

    // Cập nhật background cho Sàn đấu đúng với Map hiện tại
    const savedState = this.saveAdapter ? this.saveAdapter.load() : null;
    const encounterMapId = this.currentEncounter?.mapId 
      || (this.currentEncounter?.id?.includes('map') ? ('map' + this.currentEncounter.id.split('map')[1].charAt(0)) : null);
    const currentMapId = encounterMapId
      || window.__currentMapId 
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
      this.arenaModal.style.backgroundImage = `url('${chosenBg}')`;
      this.arenaModal.hidden = false;
      this.arenaModal.classList.remove('screen-shake', 'stage-clear-shake');
      this.arenaModal.parentElement?.classList.add('battle-active');
      document.getElementById('btn-floating-bag')?.classList.add('hidden-during-modal');
      document.getElementById('hero-vitals-hud')?.classList.add('hidden-during-modal');
      this.audioService?.playMusic?.('bgm_battle_boss');
    }

    // Kiểm tra nếu Boss vào trận đã ở mức 2 máu cuối
    if (this.isBoss && this.monsterHearts <= 2) {
      this.checkBossEnrage();
    }

    // Reset FX
    if (this.damageOverlay) this.damageOverlay.classList.remove('active');
    if (this.heroProj) this.heroProj.style.opacity = '0';
    if (this.monsterProj) this.monsterProj.style.opacity = '0';
    if (this.impactFx) {
      this.impactFx.classList.remove('active');
      this.impactFx.innerHTML = '';
    }

    // Thiết lập câu hỏi và lượt chơi
    this.setupTurn();
  }

  setupTurn() {
    this.isTurnLocked = false;
    this.updateEnergyButton();
    if (this.turnIndicator) {
      if (this.currentQuestion?.isMaze) {
        this.turnIndicator.innerHTML = `🌀 <strong>MÊ CUNG VƯỢT ẢI</strong>`;
      } else if (this.isBoss && this.monsterHearts <= 2 && this.monsterHearts > 0) {
        this.turnIndicator.innerHTML = `🔥 <strong>CAO TRÀO (Còn ${this.monsterHearts} tim): Boss tỏa hào quang cực mạnh! Chọn đáp án chính xác để xuất chiêu!</strong>`;
      } else {
        const isM4 = (window.__currentMapId === 'map4' || String(this.currentEncounter?.id || '').includes('map4'));
    this.turnIndicator.innerHTML = isM4 ? '✨ Lượt của Bé: Chọn đáp án đúng để xuất chiêu <strong>Thái Dương Cầu Xoáy! ☀️</strong>' : '✨ Lượt của Bé: Chọn đáp án đúng để xuất chiêu Cầu Xoáy!';
      }
    }
    if (this.promptText) {
      if (this.currentQuestion?.isMaze) {
        this.promptText.innerHTML = `<div class="prompt-title-text maze-minimal-title">🌀 Mê Cung Vượt Ải</div>`;
      } else {
        this.promptText.innerHTML = formatQuestionPromptHtml(this.currentQuestion);
      }
    }
    if (this.feedbackText) {
      if (this.currentQuestion?.isMaze) {
        this.feedbackText.textContent = `Bé hãy chạm tay vẽ đường theo lối đi màu sáng để đánh trúng ${this.currentEncounter?.name || 'quái vật'} nhé!`;
      } else {
        this.feedbackText.textContent = 'Chọn đáp án bé nghĩ là đúng nhé.';
      }
      this.feedbackText.style.color = '#64748b';
      this.feedbackText.style.background = 'transparent';
    }

    this.renderAnswers(this.currentQuestion);

    if (this.audioService) {
      if (this.audioService.isMuted()) {
        this.audioService.setSoundEnabled(true);
      }
      const textToSpeak = this.currentQuestion?.speak || this.audioService.cleanTextForSpeech?.(this.currentQuestion?.prompt) || this.currentQuestion?.prompt;
      if (textToSpeak) {
        this.audioService.playChime(620, 0.16);
        this.triggerSpeakAnimation(3500);
        setTimeout(() => {
          this.audioService.speak(textToSpeak, () => {
            this.btnSpeak?.classList.remove('speaking');
          });
        }, 160);
      }
    }
  }

  updateEnergyButton() {
    if (!this.energyButton) return;
    const energy = this.cookingSystem?.getState().energy || 0;
    this.energyButton.textContent = this.mealShield ? '🛡️ Đang bảo vệ' : this.energyUsed ? '⚡ Đã dùng trận này' : `⚡ Đỡ đòn (${energy})`;
    this.energyButton.disabled = !energy || this.energyUsed;
  }

  renderHearts(containerEl, current, max = 3) {
    if (!containerEl) return;
    containerEl.replaceChildren();
    for (let i = 0; i < max; i++) {
      const img = document.createElement('img');
      img.className = 'battle-heart-img';
      const isHero = containerEl === this.arenaHeroHearts;
      const bonus = isHero ? (this.bonusHeartsRemaining || 0) : 0;
      const filled = isHero ? (i < 3 ? i < current - bonus : i - 3 < bonus) : i < current;
      if (isHero && i >= 3) img.classList.add('temporary-heart');
      img.alt = filled ? (isHero && i >= 3 ? '💛 Tim tạm' : '❤️') : '🤍';
      img.src = filled
        ? heartFullUrl
        : heartEmptyUrl;
      containerEl.appendChild(img);
    }
  }

  renderAnswers(question) {
    if (!this.answersGrid || !question) return;
    this.answersGrid.replaceChildren();

    if (question.type === 'memory_match') {
      this.renderMemoryMatch(question);
      return;
    }
    if (question.type === 'pair_matching') {
      this.renderPairMatching(question);
      return;
    }
    if (question.type === 'drag_sort') {
      this.renderDragSort(question);
      return;
    }

    if (question.isMaze) {
      const card = document.createElement('div');
      card.className = 'arena-maze-prompt-card minimalist';
      card.innerHTML = `
        <button type="button" class="arena-maze-start-btn" id="arena-btn-start-maze">
          <span class="btn-sparkle">✨</span>
          <span>CHẠM ĐỂ VẼ ĐƯỜNG MÊ CUNG</span>
          <span class="btn-rocket">🚀</span>
        </button>
      `;

      const startBtn = card.querySelector('#arena-btn-start-maze');
      if (startBtn) {
        startBtn.onclick = () => {
          this.openMazeChallengeForTurn();
        };
      }

      this.answersGrid.appendChild(card);

      // Tự động mở mê cung sau 700ms để bé trải nghiệm liền mạch
      if (this._autoOpenMazeTimer) clearTimeout(this._autoOpenMazeTimer);
      this._autoOpenMazeTimer = setTimeout(() => {
        if (!this.isTurnLocked && this.currentQuestion?.isMaze && this.arenaModal && !this.arenaModal.hidden) {
          this.openMazeChallengeForTurn();
        }
      }, 700);
      return;
    }

    const badges = ['A', 'B', 'C', 'D'];
    const badgeImgs = [
      btnAnsAUrl,
      btnAnsBUrl,
      btnAnsCUrl,
      btnAnsCUrl
    ];

    question.choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `ans-btn ans-btn-${index + 1}`;

      const choiceImg = question.choiceImages?.[index] || resolveChoiceImage(choice);
      const qtyInfo = resolveChoiceQuantityAndItem(choice, question);

      if (qtyInfo) {
        const { count, itemImg, isPureNumber } = qtyInfo;
        if (itemImg) {
          // CHẾ ĐỘ HÌNH ẢNH SỐ LƯỢNG (Visual Quantity Mode)
          // "Vd 5 quả cam (hình ảnh 5 quả cam, hình ảnh câu hỏi và đáp án giống nhau)"
          btn.classList.add('ans-btn-quantity-mode');
          let trayHtml = '';
          for (let i = 0; i < count; i++) {
            trayHtml += `<img src="${itemImg}" class="ans-quantity-mini-img" alt="${count}">`;
          }

          btn.innerHTML = `
            <img src="${badgeImgs[index] || badgeImgs[0]}" class="ans-badge-img" alt="${badges[index]}">
            <div class="ans-quantity-body">
              <span class="ans-giant-number">${count}</span>
              <div class="ans-quantity-tray count-${count}">
                ${trayHtml}
              </div>
            </div>
            ${!isPureNumber ? `<span class="ans-quantity-caption">${escapeHtml(choice)}</span>` : ''}
          `;
        } else {
          // CHẾ ĐỘ CHỮ SỐ TO (Giant Number Mode)
          // "Cho chữ số đáp án to lên"
          btn.classList.add('ans-btn-number-mode');
          btn.innerHTML = `
            <img src="${badgeImgs[index] || badgeImgs[0]}" class="ans-badge-img" alt="${badges[index]}">
            <div class="ans-number-body">
              <span class="ans-giant-number">${count}</span>
              <div class="ans-counting-dots" aria-hidden="true">
                ${'⭐'.repeat(Math.min(count, 10))}
              </div>
            </div>
            ${!isPureNumber ? `<span class="ans-quantity-caption">${escapeHtml(choice)}</span>` : ''}
          `;
        }
      } else if (choiceImg) {
        btn.classList.add('ans-btn-image-mode');
        btn.innerHTML = `
          <img src="${badgeImgs[index] || badgeImgs[0]}" class="ans-badge-img" alt="${badges[index]}">
          <div class="ans-image-frame">
            <img src="${choiceImg}" class="ans-image-pic" alt="${choice}">
          </div>
          <span class="ans-image-caption">${escapeHtml(choice)}</span>
        `;
      } else {
        btn.classList.add('ans-btn-text-mode');
        btn.innerHTML = `
          <img src="${badgeImgs[index] || badgeImgs[0]}" class="ans-badge-img" alt="${badges[index]}">
          <span class="ans-text">${escapeHtml(choice)}</span>
        `;
      }

      btn.addEventListener('mouseenter', () => {
        if (!this.isTurnLocked && this.audioService?.playChime) {
          this.audioService.playChime(620 + index * 50, 0.04);
        }
      });

      btn.addEventListener('click', () => {
        if (this.isTurnLocked) return;
        this.handleAnswer(index, btn);
      });

      this.answersGrid.appendChild(btn);
    });
  }

  /**
   * Kích hoạt Thử Thách Mê Cung khi đến lượt câu hỏi mê cung
   */

  formatMemoryCardContent(card) {
    if (!card) return '❓';
    if (card.image || card.iconUrl || card.img) {
      const src = card.image || card.iconUrl || card.img;
      return `<img src="${src}" class="memory-card-img" alt="hình ảnh" />`;
    }

    const raw = String(card.label || '').trim();

    // 1. Trích xuất emoji hình ảnh (bỏ hoàn toàn phần chữ tiếng Việt)
    const emojiMatch = raw.match(/(\p{Extended_Pictographic}+)/u);
    if (emojiMatch) {
      return `<span class="memory-card-emoji-hero">${emojiMatch[0]}</span>`;
    }

    // 2. Trích xuất ký hiệu màu sắc / hình khối / sao
    const symbolMatch = raw.match(/[🔴🟠🟡🟢🔵🟣🟤⚫⚪⭐✨💎🔷🔶🔺🔻]/u);
    if (symbolMatch) {
      return `<span class="memory-card-emoji-hero">${symbolMatch[0]}</span>`;
    }

    // 3. Fallback: Nếu là số (1, 2, 3...)
    const numMatch = raw.match(/\d+/);
    if (numMatch) {
      return `<span class="memory-card-emoji-hero">${numMatch[0]}</span>`;
    }

    return `<span class="memory-card-emoji-hero">${raw}</span>`;
  }

  renderMemoryMatch(question) {

    if (!this.answersGrid || !question) return;
    this.answersGrid.replaceChildren();

    const rawCards = question.cards || [
      { id: 'c1', label: '🐰 Thỏ' },
      { id: 'c2', label: '🐶 Chó' },
      { id: 'c1_b', label: '🐰 Thỏ' },
      { id: 'c2_b', label: '🐶 Chó' }
    ];

    const cards = [...rawCards].sort(() => Math.random() - 0.5);
    const totalPairs = question.pairs || Math.floor(cards.length / 2);
    // Quy tắc số lần sai tối đa: Theo yêu cầu, điều chỉnh số lần sai về 1 hết, bé chỉ được sai 1 lần
    const maxMistakes = 1;
    let matchedPairs = 0;
    let mistakeCount = 0;
    let selected = [];
    let isLocked = false;

    const wrap = document.createElement('div');
    wrap.className = `arena-interactive-card memory-match-container count-${cards.length}`;

    const banner = document.createElement('div');
    banner.className = 'interactive-instruction-banner';
    banner.innerHTML = `<span>🃏 Lật 2 ô giống nhau (Đã tìm: <b id="mem-matched-count">0</b>/${totalPairs} cặp • <span class="mem-mistakes-counter">Sai: <b id="mem-mistakes-val">0</b>/${maxMistakes}</span>)</span>`;
    wrap.appendChild(banner);

    const updateBanner = () => {
      const countEl = wrap.querySelector('#mem-matched-count');
      if (countEl) countEl.textContent = matchedPairs;
      const mistakesEl = wrap.querySelector('#mem-mistakes-val');
      if (mistakesEl) mistakesEl.textContent = mistakeCount;
    };

    const grid = document.createElement('div');
    grid.className = `memory-grid grid-${cards.length}`;

    cards.forEach((card, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.dataset.index = idx;
      cardEl.dataset.label = card.label;

      // CHỈ HIỂN THỊ HÌNH ẢNH, BỎ HOÀN TOÀN CHỮ TRONG ĐÁP ÁN THEO YÊU CẦU NGƯỜI DÙNG
      cardEl.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-front">
            <span class="memory-card-mark">❓</span>
          </div>
          <div class="memory-card-back">
            ${this.formatMemoryCardContent(card)}
          </div>
        </div>
      `;

      cardEl.addEventListener('click', () => {
        if (this.isTurnLocked || isLocked) return;
        if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

        cardEl.classList.add('flipped');
        this.audioService?.playCardFlip?.();
        if (this.audioService?.playChime) {
          this.audioService.playChime(620 + selected.length * 100, 0.08);
        }
        selected.push({ el: cardEl, label: card.label });

        if (selected.length === 2) {
          isLocked = true;
          const [first, second] = selected;

          if (first.label === second.label) {
            setTimeout(() => {
              first.el.classList.add('matched');
              second.el.classList.add('matched');
              matchedPairs++;
              updateBanner();

              if (this.audioService?.playChime) {
                this.audioService.playChime(880, 0.16);
              }
              this.spawnAnswerConfetti(second.el);
              selected = [];
              isLocked = false;

              if (matchedPairs >= totalPairs) {
                this.isTurnLocked = true;
                banner.innerHTML = '<span>🎉 XUẤT SẮC! Bé đã tìm đủ các cặp giống nhau! ✨</span>';
                banner.style.background = '#dcfce7';
                banner.style.borderColor = '#22c55e';
                banner.style.color = '#15803d';

                setTimeout(() => {
                  this.executeHeroAttack();
                }, 700);
              }
            }, 300);
          } else {
            mistakeCount++;
            updateBanner();

            setTimeout(() => {
              first.el.classList.add('mismatch-shake');
              second.el.classList.add('mismatch-shake');
              if (this.audioService?.playChime) {
                this.audioService.playChime(320, 0.1);
              }

              if (mistakeCount >= maxMistakes) {
                // ĐÃ SAI ĐỦ SỐ LẦN CHO PHÉP (1 LẦN) -> BỊ TÍNH THUA!
                this.isTurnLocked = true;
                banner.innerHTML = `<span>💥 ĐÃ SAI ${mistakeCount}/${maxMistakes} LẦN! Bé chỉ được sai 1 lần thôi, Quái vật phản công! 💥</span>`;
                banner.style.background = '#fee2e2';
                banner.style.borderColor = '#ef4444';
                banner.style.color = '#b91c1c';

                if (this.audioService?.playPlayerHurt) {
                  this.audioService.playPlayerHurt();
                } else if (this.audioService?.playChime) {
                  this.audioService.playChime(260, 0.25);
                }
                if (this.audioService?.speak) {
                  this.audioService.speak('Bé chỉ được sai 1 lần thôi nhé! Quái vật phản công!');
                }

                setTimeout(() => {
                  this.executeMonsterAttack();
                }, 750);
                return;
              }

              setTimeout(() => {
                first.el.classList.remove('flipped', 'mismatch-shake');
                second.el.classList.remove('flipped', 'mismatch-shake');
                selected = [];
                isLocked = false;
              }, 700);
            }, 500);
          }
        }
      });

      grid.appendChild(cardEl);
    });

    wrap.appendChild(grid);
    this.answersGrid.appendChild(wrap);
  }

  renderPairMatching(question) {
    if (!this.answersGrid || !question) return;
    this.answersGrid.replaceChildren();

    const leftItems = question.leftColumn || [
      { id: 'l1', text: '🐰 Bé Thỏ' },
      { id: 'l2', text: '🐒 Chú Khỉ' },
      { id: 'l3', text: '🐶 Chó Con' }
    ];
    const rawRightItems = question.rightColumn || [
      { id: 'r1', text: '🥕 Cà rốt', matchId: 'l1' },
      { id: 'r2', text: '🍌 Quả chuối', matchId: 'l2' },
      { id: 'r3', text: '🦴 Khúc xương', matchId: 'l3' }
    ];
    const rightItems = [...rawRightItems].sort(() => Math.random() - 0.5);

    let activeLeftBtn = null;
    let matchedCount = 0;
    let mistakeCount = 0;
    const maxMistakes = 1;
    const totalCount = leftItems.length;

    const wrap = document.createElement('div');
    wrap.className = 'arena-interactive-card pair-match-container';

    const banner = document.createElement('div');
    banner.className = 'interactive-instruction-banner';
    banner.innerHTML = `<span>🔗 Nối các cặp tương ứng (Đúng: <b id="pair-matched-count">0</b>/${totalCount} • <span class="pair-mistakes-counter">Sai: <b id="pair-mistakes-val">0</b>/${maxMistakes}</span>)</span>`;
    wrap.appendChild(banner);

    const updateBanner = () => {
      const countEl = wrap.querySelector('#pair-matched-count');
      if (countEl) countEl.textContent = matchedCount;
      const mistakesEl = wrap.querySelector('#pair-mistakes-val');
      if (mistakesEl) mistakesEl.textContent = mistakeCount;
    };

    const colsWrap = document.createElement('div');
    colsWrap.className = 'pair-match-columns';

    // SVG canvas vẽ đường nối giữa 2 cột (Connecting Lines)
    const svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgOverlay.setAttribute('class', 'pair-match-svg-canvas');
    colsWrap.appendChild(svgOverlay);

    const lineColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    let lineIdx = 0;

    const drawPairConnectingLine = (btnA, btnB) => {
      if (!btnA || !btnB || !svgOverlay) return;
      const rectWrap = colsWrap.getBoundingClientRect();
      const rectA = btnA.getBoundingClientRect();
      const rectB = btnB.getBoundingClientRect();

      const x1 = rectA.right - rectWrap.left;
      const y1 = rectA.top + rectA.height / 2 - rectWrap.top;
      const x2 = rectB.left - rectWrap.left;
      const y2 = rectB.top + rectB.height / 2 - rectWrap.top;

      const dx = Math.abs(x2 - x1) * 0.5;
      const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      const color = lineColors[lineIdx % lineColors.length];
      lineIdx++;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'pair-connecting-svg-line');
      path.setAttribute('stroke', color);
      svgOverlay.appendChild(path);

      const dotA = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dotA.setAttribute('cx', String(x1));
      dotA.setAttribute('cy', String(y1));
      dotA.setAttribute('r', '5');
      dotA.setAttribute('fill', color);
      dotA.setAttribute('class', 'pair-connecting-dot');
      svgOverlay.appendChild(dotA);

      const dotB = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dotB.setAttribute('cx', String(x2));
      dotB.setAttribute('cy', String(y2));
      dotB.setAttribute('r', '5');
      dotB.setAttribute('fill', color);
      dotB.setAttribute('class', 'pair-connecting-dot');
      svgOverlay.appendChild(dotB);
    };

    const colLeft = document.createElement('div');
    colLeft.className = 'pair-column pair-col-left';

    const colRight = document.createElement('div');
    colRight.className = 'pair-column pair-col-right';

    leftItems.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pair-item-btn pair-left';
      btn.dataset.id = item.id;
      btn.innerHTML = `<span class="pair-item-text">${item.text}</span>`;

      btn.addEventListener('click', () => {
        if (this.isTurnLocked || btn.classList.contains('matched-pair')) return;
        if (activeLeftBtn) activeLeftBtn.classList.remove('selected-left');

        activeLeftBtn = btn;
        btn.classList.add('selected-left');
        this.audioService?.playCardFlip?.();
        if (this.audioService?.playChime) {
          this.audioService.playChime(640, 0.08);
        }
      });
      colLeft.appendChild(btn);
    });

    rightItems.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pair-item-btn pair-right';
      btn.dataset.id = item.id;
      btn.dataset.matchId = item.matchId;
      btn.innerHTML = `<span class="pair-item-text">${item.text}</span>`;

      btn.addEventListener('click', () => {
        if (this.isTurnLocked || btn.classList.contains('matched-pair')) return;

        if (!activeLeftBtn) {
          if (this.audioService?.speak) {
            this.audioService.speak('Bé hãy chạm vào một ô bên cột trái trước nhé!');
          }
          return;
        }

        const leftId = activeLeftBtn.dataset.id;
        if (btn.dataset.matchId === leftId) {
          drawPairConnectingLine(activeLeftBtn, btn);
          activeLeftBtn.classList.remove('selected-left');
          activeLeftBtn.classList.add('matched-pair');
          btn.classList.add('matched-pair');

          activeLeftBtn.innerHTML = `<span>✓ ${activeLeftBtn.textContent}</span>`;
          btn.innerHTML = `<span>✓ ${btn.textContent}</span>`;

          matchedCount++;
          const countEl = wrap.querySelector('#pair-matched-count');
          if (countEl) countEl.textContent = matchedCount;

          if (this.audioService?.playChime) {
            this.audioService.playChime(880, 0.16);
          }
          this.spawnAnswerConfetti(btn);
          activeLeftBtn = null;

          if (matchedCount >= totalCount) {
            this.isTurnLocked = true;
            banner.innerHTML = '<span>🎉 HOÀN THÀNH! Bé đã nối đúng tất cả các cặp! ✨</span>';
            banner.style.background = '#dcfce7';
            banner.style.borderColor = '#22c55e';
            banner.style.color = '#15803d';

            setTimeout(() => {
              this.executeHeroAttack();
            }, 700);
          }
        } else {
          mistakeCount++;
          updateBanner();
          btn.classList.add('mismatch-shake');
          activeLeftBtn.classList.add('mismatch-shake');
          if (this.audioService?.playChime) {
            this.audioService.playChime(320, 0.1);
          }

          if (mistakeCount >= maxMistakes) {
            this.isTurnLocked = true;
            banner.innerHTML = `<span>💥 BÉ ĐÃ NỐI SAI! Bé chỉ được sai 1 lần thôi, Quái vật phản công! 💥</span>`;
            banner.style.background = '#fee2e2';
            banner.style.borderColor = '#ef4444';
            banner.style.color = '#b91c1c';

            if (this.audioService?.playPlayerHurt) {
              this.audioService.playPlayerHurt();
            } else if (this.audioService?.playChime) {
              this.audioService.playChime(260, 0.25);
            }
            if (this.audioService?.speak) {
              this.audioService.speak('Bé chỉ được sai 1 lần thôi nhé! Quái vật phản công!');
            }

            setTimeout(() => {
              this.executeMonsterAttack();
            }, 750);
            return;
          }

          setTimeout(() => {
            btn.classList.remove('mismatch-shake');
            if (activeLeftBtn) {
              activeLeftBtn.classList.remove('mismatch-shake', 'selected-left');
              activeLeftBtn = null;
            }
          }, 500);
        }
      });
      colRight.appendChild(btn);
    });

    colsWrap.appendChild(colLeft);
    const divider = document.createElement('div');
    divider.className = 'pair-column-divider';
    divider.textContent = '⚡';
    colsWrap.appendChild(divider);
    colsWrap.appendChild(colRight);

    wrap.appendChild(colsWrap);
    this.answersGrid.appendChild(wrap);
  }

  formatChipContent(it) {
    const raw = String(it.label || '').trim();
    // 1. Nếu có số hoặc emoji số (như 2️⃣ Số Hai, 8️⃣ Số Tám, 1️⃣ Một, 5️⃣ Số Năm, "2", "8"...)
    const numMatch = raw.match(/\d+/);
    if (numMatch) {
      return `<span class="drag-chip-num-hero">${numMatch[0]}</span>`;
    }
    // 2. Nếu có sao (⭐ (1 Sao), ⭐⭐...)
    if (raw.includes('⭐')) {
      const count = (raw.match(/⭐/g) || []).length;
      return `<span class="drag-chip-stars-hero">${'⭐'.repeat(Math.max(1, count))}</span>`;
    }
    // 3. Nếu là màu sắc (🔴 Màu Đỏ...)
    const colorMatch = raw.match(/[🔴🟠🟡🟢🔵🟣🟤⚫⚪]/);
    if (colorMatch) {
      return `<span class="drag-chip-emoji-hero">${colorMatch[0]}</span>`;
    }
    // 4. Nếu bắt đầu bằng emoji hình (🐥 Gà Con...)
    const emojiMatch = raw.match(/^(\p{Extended_Pictographic}+)/u);
    if (emojiMatch) {
      return `<span class="drag-chip-emoji-hero">${emojiMatch[1]}</span>`;
    }
    return `<span class="drag-chip-num-hero">${raw}</span>`;
  }

  formatSlotBadge(slotText, index) {
    const raw = String(slotText || '').trim();
    const numMatch = raw.match(/\d+/);
    if (numMatch) {
      return `<span class="slot-idx-num">${numMatch[0]}</span>`;
    }
    return `<span class="slot-idx-num">${index}</span>`;
  }

  renderDragSort(question) {
    if (!this.answersGrid || !question) return;
    this.answersGrid.replaceChildren();

    const slots = question.slots || ['1. Nhỏ nhất', '2. Vừa', '3. Lớn nhất'];
    const rawItems = question.items || [
      { id: 'it1', label: '🐥 Gà Con', order: 1 },
      { id: 'it2', label: '🐰 Bé Thỏ', order: 2 },
      { id: 'it3', label: '🐻 Bác Gấu', order: 3 }
    ];
    const poolItems = [...rawItems].sort(() => Math.random() - 0.5);

    let pickedItem = null;
    let mistakeCount = 0;
    const maxMistakes = 1;
    const totalItems = rawItems.length;

    const wrap = document.createElement('div');
    wrap.className = 'arena-interactive-card drag-sort-container';

    const banner = document.createElement('div');
    banner.className = 'interactive-instruction-banner';
    banner.innerHTML = `<span>🔢 Xếp theo thứ tự (<b id="sort-placed-count">0</b>/${totalItems} • <span class="sort-mistakes-counter">Sai: <b id="sort-mistakes-val">0</b>/${maxMistakes}</span>)</span>`;
    wrap.appendChild(banner);

    const updateBanner = (placedCount) => {
      const countEl = wrap.querySelector('#sort-placed-count');
      if (countEl) countEl.textContent = placedCount;
      const mistakesEl = wrap.querySelector('#sort-mistakes-val');
      if (mistakesEl) mistakesEl.textContent = mistakeCount;
    };

    const poolDiv = document.createElement('div');
    poolDiv.className = 'drag-pool-items';
    poolDiv.id = 'drag-pool-items';

    const arrowDiv = document.createElement('div');
    arrowDiv.className = 'drag-arrow-down';
    arrowDiv.textContent = '🔗 ĐẶT VÀO CÁC Ô THEO ĐƯỜNG NỐI THỨ TỰ ➡️';

    const slotsDiv = document.createElement('div');
    slotsDiv.className = 'drag-target-slots';

    const updateConnectors = () => {
      const connectors = slotsDiv.querySelectorAll('.drag-slot-connector');
      connectors.forEach(conn => {
        const fromIdx = conn.dataset.fromIndex;
        const toIdx = conn.dataset.toIndex;
        const fromZone = slotsDiv.querySelector(`.slot-dropzone[data-slot-index="${fromIdx}"]`);
        const toZone = slotsDiv.querySelector(`.slot-dropzone[data-slot-index="${toIdx}"]`);
        const chipFrom = fromZone?.querySelector('.drag-item-chip');
        const chipTo = toZone?.querySelector('.drag-item-chip');

        if (chipFrom && chipTo) {
          conn.classList.add('is-connected');
          const orderFrom = parseInt(chipFrom.dataset.order, 10);
          const orderTo = parseInt(chipTo.dataset.order, 10);
          if (orderTo > orderFrom) {
            conn.classList.add('is-valid-flow');
          } else {
            conn.classList.remove('is-valid-flow');
          }
        } else if (chipFrom || chipTo) {
          conn.classList.add('is-half-connected');
          conn.classList.remove('is-connected', 'is-valid-flow');
        } else {
          conn.classList.remove('is-connected', 'is-valid-flow', 'is-half-connected');
        }
      });
    };

    const updateGameState = () => {
      this.audioService?.playDragDrop?.();
      if (this.audioService?.playChime) {
        this.audioService.playChime(700, 0.08);
      }

      const zones = wrap.querySelectorAll('.slot-dropzone');
      let filled = 0;
      zones.forEach(z => { if (z.querySelector('.drag-item-chip')) filled++; });

      const countEl = wrap.querySelector('#sort-placed-count');
      if (countEl) countEl.textContent = filled;
      updateBanner(filled);
      updateConnectors();

      if (filled === totalItems) {
        let isAllCorrect = true;
        zones.forEach(z => {
          const slotIdx = parseInt(z.dataset.slotIndex, 10);
          const childChip = z.querySelector('.drag-item-chip');
          const order = parseInt(childChip?.dataset.order, 10);
          if (slotIdx !== order) {
            isAllCorrect = false;
          }
        });

        if (isAllCorrect) {
          slotsDiv.classList.add('all-correct');
          this.isTurnLocked = true;
          banner.innerHTML = '<span>🎉 XUẤT SẮC! Bé đã sắp xếp hoàn toàn chuẩn xác! ✨</span>';
          banner.style.background = '#dcfce7';
          banner.style.borderColor = '#22c55e';
          banner.style.color = '#15803d';

          if (this.audioService?.playChime) {
            this.audioService.playChime(880, 0.2);
          }
          this.spawnAnswerConfetti(slotsDiv);

          setTimeout(() => {
            this.executeHeroAttack();
          }, 700);
        } else {
          mistakeCount++;
          updateBanner(filled);
          slotsDiv.classList.add('has-error');
          if (this.audioService?.playChime) {
            this.audioService.playChime(320, 0.12);
          }

          if (mistakeCount >= maxMistakes) {
            this.isTurnLocked = true;
            banner.innerHTML = `<span>💥 CHƯA ĐÚNG THỨ TỰ RỒI! Bé chỉ được sai 1 lần thôi, Quái vật phản công! 💥</span>`;
            banner.style.background = '#fee2e2';
            banner.style.borderColor = '#ef4444';
            banner.style.color = '#b91c1c';

            if (this.audioService?.playPlayerHurt) {
              this.audioService.playPlayerHurt();
            } else if (this.audioService?.playChime) {
              this.audioService.playChime(260, 0.25);
            }
            if (this.audioService?.speak) {
              this.audioService.speak('Bé chỉ được sai 1 lần thôi nhé! Quái vật phản công!');
            }

            setTimeout(() => {
              this.executeMonsterAttack();
            }, 750);
            return;
          }

          if (this.audioService?.speak) {
            this.audioService.speak('Bé hãy kéo đổi chỗ các số để xếp đúng thứ tự nhé!');
          }
          setTimeout(() => {
            slotsDiv.classList.remove('has-error');
          }, 600);
        }
      }
    };

    const moveOrSwap = (chipA, targetContainer) => {
      if (!chipA || !targetContainer || this.isTurnLocked) return;
      const sourceContainer = chipA.parentElement;
      if (!sourceContainer || sourceContainer === targetContainer) return;

      if (targetContainer === poolDiv) {
        poolDiv.appendChild(chipA);
        chipA.classList.remove('is-placed', 'active-picked');
        updateGameState();
        return;
      }

      const chipB = targetContainer.querySelector('.drag-item-chip');
      if (!chipB) {
        targetContainer.appendChild(chipA);
        chipA.classList.add('is-placed');
        chipA.classList.remove('active-picked');
        updateGameState();
      } else if (chipB !== chipA) {
        sourceContainer.appendChild(chipB);
        targetContainer.appendChild(chipA);

        if (sourceContainer === poolDiv) {
          chipB.classList.remove('is-placed', 'active-picked');
        } else {
          chipB.classList.add('is-placed');
          chipB.classList.remove('active-picked');
        }
        chipA.classList.add('is-placed');
        chipA.classList.remove('active-picked');
        updateGameState();
      }
    };

    poolItems.forEach(it => {
      const chip = document.createElement('div');
      chip.className = 'drag-item-chip';
      chip.draggable = true;
      chip.dataset.itemId = it.id;
      chip.dataset.order = it.order;
      chip.innerHTML = this.formatChipContent(it);

      chip.addEventListener('dragstart', (e) => {
        if (this.isTurnLocked) return;
        e.dataTransfer.setData('text/plain', it.id);
        chip.classList.add('dragging');
      });
      chip.addEventListener('dragend', () => {
        chip.classList.remove('dragging');
      });

      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.isTurnLocked) return;

        if (pickedItem && pickedItem !== chip) {
          const targetZone = chip.parentElement;
          const prevPicked = pickedItem;
          pickedItem = null;
          moveOrSwap(prevPicked, targetZone);
          return;
        }

        if (pickedItem === chip) {
          if (chip.classList.contains('is-placed')) {
            moveOrSwap(chip, poolDiv);
            pickedItem = null;
            return;
          }
          chip.classList.remove('active-picked');
          pickedItem = null;
        } else {
          if (pickedItem) pickedItem.classList.remove('active-picked');
          pickedItem = chip;
          chip.classList.add('active-picked');
          this.audioService?.playChime?.(640, 0.06);
        }
      });

      poolDiv.appendChild(chip);
    });

    poolDiv.addEventListener('dragover', (e) => {
      e.preventDefault();
      poolDiv.classList.add('drag-over');
    });
    poolDiv.addEventListener('dragleave', () => {
      poolDiv.classList.remove('drag-over');
    });
    poolDiv.addEventListener('drop', (e) => {
      e.preventDefault();
      poolDiv.classList.remove('drag-over');
      const itId = e.dataTransfer.getData('text/plain');
      const draggedChip = wrap.querySelector(`[data-item-id="${itId}"]`);
      if (draggedChip && draggedChip.parentElement !== poolDiv) {
        moveOrSwap(draggedChip, poolDiv);
      }
    });
    poolDiv.addEventListener('click', (e) => {
      if (e.target === poolDiv && pickedItem) {
        const p = pickedItem;
        pickedItem = null;
        moveOrSwap(p, poolDiv);
      }
    });

    slots.forEach((slotLabel, sIdx) => {
      if (sIdx > 0) {
        const connector = document.createElement('div');
        connector.className = 'drag-slot-connector';
        connector.dataset.fromIndex = String(sIdx);
        connector.dataset.toIndex = String(sIdx + 1);
        connector.innerHTML = `
          <div class="connector-line-body">
            <span class="connector-flow-arrow">➔</span>
          </div>
        `;
        slotsDiv.appendChild(connector);
      }

      const slotEl = document.createElement('div');
      slotEl.className = 'drag-slot';
      slotEl.dataset.slotIndex = sIdx + 1;

      slotEl.innerHTML = `
        <span class="slot-badge">${this.formatSlotBadge(slotLabel, sIdx + 1)}</span>
        <div class="slot-dropzone" data-slot-index="${sIdx + 1}"></div>
      `;

      const zone = slotEl.querySelector('.slot-dropzone');

      slotEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        slotEl.classList.add('drag-over');
      });
      slotEl.addEventListener('dragleave', () => {
        slotEl.classList.remove('drag-over');
      });
      slotEl.addEventListener('drop', (e) => {
        e.preventDefault();
        slotEl.classList.remove('drag-over');
        const itId = e.dataTransfer.getData('text/plain');
        const draggedChip = wrap.querySelector(`[data-item-id="${itId}"]`);
        if (draggedChip) {
          moveOrSwap(draggedChip, zone);
        }
      });

      slotEl.addEventListener('click', () => {
        if (this.isTurnLocked) return;
        if (pickedItem) {
          const p = pickedItem;
          pickedItem = null;
          moveOrSwap(p, zone);
        }
      });

      slotsDiv.appendChild(slotEl);
    });

    wrap.appendChild(poolDiv);
    wrap.appendChild(arrowDiv);
    wrap.appendChild(slotsDiv);
    this.answersGrid.appendChild(wrap);
  }

  openMazeChallengeForTurn() {
    if (this.isTurnLocked) return;
    const modal = this.mazeMinigameModal || (typeof window !== 'undefined' ? window.__mazeModal : null);
    if (!modal) {
      this.executeHeroAttack();
      return;
    }

    modal.showForEncounter({
      encounter: this.currentEncounter,
      question: this.currentQuestion,
      onComplete: () => {
        this.isTurnLocked = true;
        this.executeHeroAttack();
      },
      onFail: () => {
        modal.hide();
        this.isTurnLocked = false;
        this.executeMonsterAttack();
      },
      onCancel: () => {
        if (this.feedbackText) {
          this.feedbackText.textContent = 'Bé bấm vào nút "CHẠM ĐỂ VẼ ĐƯỜNG MÊ CUNG" để tiếp tục vượt ải nhé!';
        }
      }
    });
  }

  triggerSpeakAnimation(durationMs = 2600) {
    if (!this.btnSpeak) return;
    this.btnSpeak.classList.add('speaking');
    if (this._speakTimer) clearTimeout(this._speakTimer);
    this._speakTimer = setTimeout(() => {
      this.btnSpeak?.classList.remove('speaking');
    }, durationMs);
  }

  spawnAnswerConfetti(buttonEl) {
    if (!buttonEl) return;
    const emojis = ['⭐', '✨', '🌟', '🎉', '💫', '🌸'];

    for (let i = 0; i < 10; i++) {
      const p = document.createElement('span');
      p.className = 'arena-confetti-particle';
      p.textContent = emojis[i % emojis.length];

      const angle = (i / 10) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const dist = 50 + Math.random() * 45;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 25;

      p.style.setProperty('--tx', `${tx}px`);
      p.style.setProperty('--ty', `${ty}px`);
      p.style.left = `${50 + (Math.random() * 24 - 12)}%`;
      p.style.top = `${50 + (Math.random() * 20 - 10)}%`;
      p.style.animationDelay = `${i * 30}ms`;
      buttonEl.appendChild(p);

      setTimeout(() => p.remove(), 1000);
    }
  }

  handleAnswer(choiceIndex, buttonEl) {
    if (this.isTurnLocked) return;
    this.isTurnLocked = true;

    const isCorrect = choiceIndex === this.currentQuestion.correct;

    if (isCorrect) {
      buttonEl.classList.add('correct');
      const stamp = document.createElement('span');
      stamp.className = 'ans-fx-stamp correct-stamp';
      stamp.textContent = '✓';
      buttonEl.appendChild(stamp);
      this.spawnAnswerConfetti(buttonEl);

      if (this.turnIndicator) {
        this.turnIndicator.textContent = '🎯 Chính xác! Bé Sâu tung chiêu Cầu Xoáy Năng Lượng!';
      }
      if (this.feedbackText) {
        this.feedbackText.textContent = 'Tuyệt vời quá! Bé làm đúng rồi!';
        this.feedbackText.style.color = '#15803d';
        this.feedbackText.style.background = '#dcfce7';
      }
      if (this.audioService) {
        this.audioService.playChime(760, 0.2);
      }
      this.executeHeroAttack();
    } else {
      buttonEl.classList.add('try-again');
      buttonEl.disabled = true;
      const stamp = document.createElement('span');
      stamp.className = 'ans-fx-stamp wrong-stamp';
      stamp.textContent = '✕';
      buttonEl.appendChild(stamp);

      if (this.turnIndicator) {
        this.turnIndicator.textContent = `⚠️ Chưa đúng rồi! ${this.currentEncounter.name} phản công!`;
      }
      if (this.feedbackText) {
        this.feedbackText.textContent = 'Chưa đúng cũng không sao, bé thử lại sau đòn phản công nhé!';
        this.feedbackText.style.color = '#b91c1c';
        this.feedbackText.style.background = '#fee2e2';
      }
      if (this.audioService) {
        this.audioService.playChime(320, 0.25);
      }
      this.executeMonsterAttack();
    }
  }

  /**
   * KỸ NĂNG BÉ SÂU: CẦU XOÁY NĂNG LƯỢNG + VỤ NỔ EXPLOSION_5
   */
  executeHeroAttack() {
    if (this.audioService) this.audioService.playAttack();

    // 1. Bé Sâu tung chiêu lunge & Phát sáng hào quang Skill Glow (Yêu cầu 2)
    if (this.arenaHeroImg) {
      this.arenaHeroImg.src = this.getHeroSkinAssets().action;
    }
    if (this.arenaHeroBox) {
      this.arenaHeroBox.classList.add('hero-lunging', 'hero-skill-glow');
    }

    // 2. Tính tọa độ chuẩn trên sàn đấu để đạn Vortex bay từ Hero sang Monster
    const stageParent = this.fightersStage || this.arenaHeroBox?.parentElement || this.arenaModal;
    const stageRect = stageParent.getBoundingClientRect();
    const heroRect = this.arenaHeroBox.getBoundingClientRect();
    const monsterRect = this.arenaMonsterBox.getBoundingClientRect();

    const startX = (heroRect.left - stageRect.left) + heroRect.width * 0.7;
    const startY = (heroRect.top - stageRect.top) + heroRect.height * 0.45;
    const targetX = (monsterRect.left - stageRect.left) + monsterRect.width * 0.45;
    const targetY = (monsterRect.top - stageRect.top) + monsterRect.height * 0.45;

    const savedStateForAttack = this.saveAdapter ? this.saveAdapter.load() : null;
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
      this.heroProj.innerHTML = `
        <img src="${heroProjSrc}" class="vortex-spinning" style="width:64px;height:64px;object-fit:contain;filter:drop-shadow(0 0 16px ${heroProjGlow});" alt="Cầu Xoáy">
      `;
      this.heroProj.style.transition = 'none';
      this.heroProj.style.opacity = '1';
      this.heroProj.style.left = `${startX}px`;
      this.heroProj.style.top = `${startY}px`;
      this.heroProj.style.transform = 'translate(-50%, -50%) scale(0.6) rotate(0deg)';

      // Bay sang Quái vật
      setTimeout(() => {
        this.heroProj.style.transition = 'left 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.35s ease-in-out, transform 0.35s ease-in-out';
        this.heroProj.style.left = `${targetX}px`;
        this.heroProj.style.top = `${targetY}px`;
        this.heroProj.style.transform = 'translate(-50%, -50%) scale(1.1) rotate(360deg)';
      }, 40);
    }

    // 3. Đạn chạm Quái vật -> Nổ Explosion_5 & Quái vật giật mình trúng đòn
    setTimeout(() => {
      if (this.heroProj) this.heroProj.style.opacity = '0';
      if (this.arenaHeroBox) {
        this.arenaHeroBox.classList.remove('hero-lunging', 'hero-skill-glow');
      }
      if (this.arenaHeroImg) this.arenaHeroImg.src = this.getHeroSkinAssets().idleRight;

      // Quái bị trúng đòn
      const monsterAssets = this.getMonsterAssets(this.currentEncounter);
      if (this.arenaMonsterImg) {
        this.arenaMonsterImg.src = monsterAssets.hit;
        const hitFlip = (monsterAssets.flipHit ?? monsterAssets.flipIdle) ? 'scaleX(-1)' : 'none';
        this.arenaMonsterImg.style.transform = this.getMonsterTransform(hitFlip);
      }
      if (this.arenaMonsterBox) this.arenaMonsterBox.classList.add('monster-hit');
      this.triggerScreenShake('hit');

      // Vụ nổ Skill Nhân Vật
      if (this.impactFx) {
        this.impactFx.style.left = `${targetX}px`;
        this.impactFx.style.top = `${targetY}px`;
        this.impactFx.innerHTML = `
          <img src="${heroImpactSrc}" style="width:${heroImpactSize}px;height:${heroImpactSize}px;object-fit:contain;filter:drop-shadow(0 0 22px ${heroProjGlow});" alt="Nổ">
        `;
        this.impactFx.classList.add('active');
      }

      // Pop-up số sát thương -1 ❤️ bay lên
      const dmgPopup = document.createElement('div');
      dmgPopup.className = 'damage-popup damage-monster';
      dmgPopup.textContent = '-1 ❤️';
      this.arenaMonsterBox.appendChild(dmgPopup);
      setTimeout(() => dmgPopup.remove(), 900);

      if (this.audioService) this.audioService.playHit();

      // Giảm máu quái (3 tim = 3 câu hỏi)
      this.monsterHearts = Math.max(0, this.monsterHearts - 1);
      this.renderHearts(this.arenaMonsterHearts, this.monsterHearts, this.monsterMaxHearts);

      // Kiểm tra kích hoạt trạng thái Boss nổi giận ở 2 máu cuối
      this.checkBossEnrage();

      // 4. Kiểm tra kết thúc hoặc chuyển tiếp câu hỏi tiếp theo
      setTimeout(() => {
        if (this.arenaMonsterBox) this.arenaMonsterBox.classList.remove('monster-hit');
        if (this.arenaModal) this.arenaModal.classList.remove('screen-shake', 'stage-clear-shake');
        if (this.impactFx) {
          this.impactFx.classList.remove('active');
          this.impactFx.innerHTML = '';
        }

        // Quái vật hết tim -> Giải cứu thành công!
        if (this.monsterHearts <= 0) {
          this.handleVictory();
        } else {
          // Chuyển sang câu hỏi tiếp theo trong danh sách
          this.currentQuestionIndex = this.monsterMaxHearts - this.monsterHearts;
          this.currentQuestion = this.encounterQuestions[this.currentQuestionIndex] || this.encounterQuestions[0];
          if (this.combatSystem) this.combatSystem.advancePhase?.(this.currentQuestion);

          if (this.arenaMonsterImg) {
            this.arenaMonsterImg.src = monsterAssets.idle;
            const idleFlip = monsterAssets.flipIdle ? 'scaleX(-1)' : 'none';
            this.arenaMonsterImg.style.transform = this.getMonsterTransform(idleFlip);
          }

          if (this.turnIndicator) {
            if (this.isBoss && this.monsterHearts <= 2) {
              this.turnIndicator.innerHTML = `🔥 <strong>CAO TRÀO: Boss bùng nổ sức mạnh! Chỉ còn ${this.monsterHearts} tim cuối!</strong>`;
            } else {
              this.turnIndicator.textContent = `🎯 Chính xác! Còn ${this.monsterHearts} tim nữa! Cùng giải đố câu tiếp theo nhé!`;
            }
          }
          this.setupTurn();
        }
      }, 550);
    }, 420);
  }

  /**
   * KỸ NĂNG QUÁI VẬT: BỘ KỸ NĂNG RIÊNG BIỆT ÁP DỤNG 8 BƯỚC SANG TRÁI VÀ TÁC ĐỘNG VÀO BÉ SÂU
   * @param {boolean} isShowcase - Nếu true là chế độ trình diễn (Cao trào Boss hoặc Xem chiêu, Bé Sâu có khiên bảo vệ)
   */
  executeMonsterAttack(isShowcase = false) {
    const skill = this.getMonsterSkill(this.currentEncounter);
    const monsterAssets = this.getMonsterAssets(this.currentEncounter);

    // 1. Quái vật tụ năng lượng (Charging) và chuyển hoạt ảnh 8 frame xuất chiêu sang trái
    if (this.arenaMonsterImg) {
      this.arenaMonsterImg.src = monsterAssets.attack;
      const attackFlip = monsterAssets.flipAttack ? 'scaleX(-1)' : 'none';
      this.arenaMonsterImg.style.transform = this.getMonsterTransform(attackFlip);
    }
    if (this.arenaMonsterBox) {
      this.arenaMonsterBox.classList.add('monster-charging', 'monster-skill-glow');
    }

    // Hiển thị HUD Bộ Kỹ Năng và đếm 8 Bước sang trái
    if (this.turnIndicator) {
      this.turnIndicator.innerHTML = `
        <div class="skill-step-hud">
          <span class="skill-name-badge" style="background:${skill.glowColor}22; border-color:${skill.glowColor}; color:${skill.glowColor}">
            ${skill.badge} ${this.currentEncounter.name}: <strong>【${skill.name}】</strong>
          </span>
          <span id="skill-step-counter" class="skill-step-counter">⚡ Bước 1/8: ${skill.stepNames[0]}</span>
        </div>
      `;
    }

    if (this.audioService) {
      this.audioService.playTone(skill.baseFreq, 0.16, skill.soundType);
    }

    // 2. Tính toán tọa độ sàn đấu chuẩn và quỹ đạo 8 BƯỚC SANG TRÁI
    const stageParent = this.fightersStage || this.arenaHeroBox?.parentElement || this.arenaModal;
    const stageRect = stageParent.getBoundingClientRect();
    const heroRect = this.arenaHeroBox.getBoundingClientRect();
    const monsterRect = this.arenaMonsterBox.getBoundingClientRect();

    const startX = (monsterRect.left - stageRect.left) + monsterRect.width * 0.28;
    const startY = (monsterRect.top - stageRect.top) + monsterRect.height * 0.45;
    const targetX = (heroRect.left - stageRect.left) + heroRect.width * 0.55;
    const targetY = (heroRect.top - stageRect.top) + heroRect.height * 0.45;

    // Thiết lập đạn kỹ năng riêng biệt của quái vật
    if (this.monsterProj) {
      const projSrc = skill.projUrl || caterpillarProjUrl;
      this.monsterProj.innerHTML = `
        <img src="${projSrc}" style="width:${skill.projSize}px;height:${skill.projSize}px;object-fit:contain;filter:${skill.filter};display:block;pointer-events:none;" alt="${skill.name}" onerror="this.style.display='none'">
      `;
      this.monsterProj.style.transition = 'none';
      this.monsterProj.style.opacity = '1';
      this.monsterProj.style.left = `${startX}px`;
      this.monsterProj.style.top = `${startY}px`;
      this.monsterProj.style.transform = 'translate(-50%, -50%) scale(0.6)';
    }

    // 8 bước chuyển động liên tiếp sang trái
    const stepsProgress = [0.06, 0.18, 0.32, 0.46, 0.60, 0.74, 0.88, 1.00];
    const stepDuration = 60; // ms mỗi bước (tổng 8 bước ~480ms)
    let currentStep = 0;

    const runStep = () => {
      if (!this.arenaModal || this.arenaModal.hidden) return;

      const progress = stepsProgress[currentStep];
      // Quỹ đạo lượn cong nhẹ trên không sang trái
      const curX = startX + (targetX - startX) * progress;
      const curY = startY + (targetY - startY) * progress + Math.sin(progress * Math.PI) * -16;

      // Cập nhật vị trí đạn kỹ năng sang trái
      if (this.monsterProj) {
        this.monsterProj.style.transition = `left ${stepDuration}ms linear, top ${stepDuration}ms linear, transform ${stepDuration}ms linear`;
        this.monsterProj.style.left = `${curX}px`;
        this.monsterProj.style.top = `${curY}px`;
        this.monsterProj.style.transform = `translate(-50%, -50%) scale(${0.7 + progress * 0.4}) rotate(${-currentStep * 40}deg)`;
      }

      // Cập nhật chỉ số Bước 1/8 -> Bước 8/8
      const counterEl = document.getElementById('skill-step-counter');
      if (counterEl) {
        counterEl.textContent = `⚡ Bước ${currentStep + 1}/8: ${skill.stepNames[currentStep]}`;
      }

      // Hạt năng lượng phát sáng đánh dấu từng bước
      const trail = document.createElement('div');
      trail.className = 'skill-step-particle';
      trail.style.left = `${curX}px`;
      trail.style.top = `${curY}px`;
      trail.style.backgroundColor = skill.glowColor;
      trail.style.boxShadow = `0 0 14px ${skill.glowColor}`;
      trail.innerHTML = `<span class="particle-step-num">${currentStep + 1}</span>`;
      stageParent.appendChild(trail);
      setTimeout(() => trail.remove(), 550);

      // Âm thanh tần số tăng dần theo từng bước sang trái
      if (this.audioService) {
        this.audioService.playTone(skill.baseFreq + currentStep * 24, 0.06, skill.soundType);
      }

      currentStep++;

      if (currentStep < 8) {
        setTimeout(runStep, stepDuration);
      } else {
        // BƯỚC 8: TÁC ĐỘNG TRỰC DIỆN VÀO BÉ SÂU!
        setTimeout(() => {
          this.executeMonsterImpact(skill, monsterAssets, targetX, targetY, isShowcase);
        }, stepDuration);
      }
    };

    // Bắt đầu chuỗi 8 bước sau 220ms gồng thế
    setTimeout(runStep, 220);
  }

  /**
   * TÁC ĐỘNG KỸ NĂNG VÀO NHÂN VẬT BÉ SÂU (BƯỚC 8 TRÚNG ĐÍCH)
   * @param {Object} skill
   * @param {Object} monsterAssets
   * @param {number} targetX
   * @param {number} targetY
   * @param {boolean} isShowcase
   */
  executeMonsterImpact(skill, monsterAssets, targetX, targetY, isShowcase = false) {
    if (this.arenaModal?.hidden) return;
    const mealBlocked = !isShowcase && this.mealShield;
    if (mealBlocked) { this.mealShield = false; this.updateEnergyButton(); }
    if (this.monsterProj) this.monsterProj.style.opacity = '0';
    if (this.arenaMonsterBox) {
      this.arenaMonsterBox.classList.remove('monster-charging', 'monster-lunging', 'monster-skill-glow');
    }
    if (this.arenaMonsterImg) {
      this.arenaMonsterImg.src = monsterAssets.idle;
      const idleFlip = monsterAssets.flipIdle ? 'scaleX(-1)' : 'none';
      this.arenaMonsterImg.style.transform = this.getMonsterTransform(idleFlip);
    }

    // 1. Vụ nổ Impact riêng biệt của kỹ năng quái vật
    if (this.impactFx) {
      this.impactFx.style.left = `${targetX}px`;
      this.impactFx.style.top = `${targetY}px`;
      const impactSrc = skill.impactUrl || tornadoImpactUrl;
      this.impactFx.innerHTML = `
        <img src="${impactSrc}" style="width:${skill.impactSize}px;height:${skill.impactSize}px;object-fit:contain;filter:${skill.filter};display:block;pointer-events:none;" alt="${skill.name}" onerror="this.style.display='none'">
      `;
      this.impactFx.classList.add('active');
    }

    this.triggerScreenShake('hit');

    // Chế độ Showcase hoặc Đỡ đòn: Bé Sâu có Khiên Phòng Thủ bảo vệ
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
          sWrap.innerHTML = `<img src="${shieldImg}" class="hero-defense-shield-img" alt="Khiên Thái Dương">`;
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
      setTimeout(() => shieldPopup.remove(), 1000);

      if (this.audioService) {
        this.audioService.playChime(680, 0.25);
      }

      if (this.turnIndicator) {
        this.turnIndicator.innerHTML = `🔥 <strong>${skill.badge} ${this.currentEncounter.name} phô diễn tuyệt kỹ 【${skill.name}】! Bé Sâu giương khiên chống đỡ an toàn!</strong>`;
      }

      setTimeout(() => {
        if (this.arenaHeroBox) {
          this.arenaHeroBox.classList.remove('hero-shielded', 'hero-skill-glow');
        }
        if (this.arenaModal) this.arenaModal.classList.remove('screen-shake', 'stage-clear-shake');
        if (this.impactFx) {
          this.impactFx.classList.remove('active');
          this.impactFx.innerHTML = '';
        }
        if (this.arenaHeroImg) this.arenaHeroImg.src = this.getHeroSkinAssets().idleRight;

        this.isTurnLocked = false;
        if (this.turnIndicator) {
          if (this.isBoss && this.monsterHearts <= 2) {
            this.turnIndicator.innerHTML = `🔥 <strong>CAO TRÀO: Boss bùng nổ sức mạnh! Chỉ còn ${this.monsterHearts} tim cuối! Bé hãy trả lời nhé!</strong>`;
          } else {
            this.turnIndicator.textContent = '✨ Bé hãy chọn đáp án đúng để tiếp tục xuất chiêu nhé!';
          }
        }
      }, 950);
      return;
    }

    // 2. Hoạt ảnh trúng đòn Bé Sâu (Hit reaction)
    if (this.arenaHeroImg) {
      this.arenaHeroImg.src = this.getHeroSkinAssets().hit;
    }
    if (this.arenaHeroBox) this.arenaHeroBox.classList.add('hero-hit');
    if (this.damageOverlay) this.damageOverlay.classList.add('active');

    // Pop-up số sát thương -1 ❤️
    const dmgPopup = document.createElement('div');
    dmgPopup.className = 'damage-popup damage-hero';
    dmgPopup.textContent = '-1 ❤️';
    this.arenaHeroBox.appendChild(dmgPopup);
    setTimeout(() => dmgPopup.remove(), 900);

    if (this.audioService) this.audioService.playPlayerHurt();

    // Trừ máu Bé Sâu
    this.heroHearts = Math.max(0, this.heroHearts - 1);
    this.bonusHeartsRemaining = Math.max(0, (this.bonusHeartsRemaining || 0) - 1);
    this.cookingSystem?.recordBattleHearts(this.heroHearts - this.bonusHeartsRemaining);
    this.renderHearts(this.arenaHeroHearts, this.heroHearts, this.heroMaxHearts);

    // Cập nhật Turn indicator
    if (this.turnIndicator) {
      this.turnIndicator.innerHTML = `💥 <strong>${skill.badge} Bé Sâu bị trúng đòn ${skill.name}! (-1 ❤️)</strong>`;
    }

    // 3. Hồi phục an toàn & Động viên thử lại
    setTimeout(() => {
      if (this.arenaHeroBox) this.arenaHeroBox.classList.remove('hero-hit');
      if (this.damageOverlay) this.damageOverlay.classList.remove('active');
      if (this.arenaModal) this.arenaModal.classList.remove('screen-shake', 'stage-clear-shake');
      if (this.impactFx) {
        this.impactFx.classList.remove('active');
        this.impactFx.innerHTML = '';
      }
      if (this.arenaHeroImg) this.arenaHeroImg.src = this.getHeroSkinAssets().idleRight;

      // Xử lý khi Bé hết Tim: Thông báo Bạn đã bị thua & đưa về maps Nuôi thú (hồi 1 Tim, ăn để lên tim lại)
      if (this.heroHearts <= 0) {
        this.showDefeatModal();
        return;
      }

      if (this.audioService) {
        this.audioService.playTryAgain();
        this.audioService.speak('Chưa đúng rồi! Bé cố lên, cùng chọn lại nhé!');
      }

      this.isTurnLocked = false;
      if (this.turnIndicator) {
        this.turnIndicator.textContent = '✨ Bé hãy chọn lại đáp án đúng nhé!';
      }
    }, 550);
  }

  /**
   * Xử lý khi Bé Sâu hết tim:
   * 1. Báo "Bạn đã bị thua"
   * 2. Hồi đúng 1 Tim (phải ăn đồ ăn trong Bếp để hồi lại đủ tim)
   * 3. Đưa nhân vật quay về map Nuôi thú (map_pet_farm)
   */
  showDefeatModal() {
    this.isTurnLocked = true;

    // 1. Cập nhật 1 Tim theo yêu cầu: Hồi 1 Tim, phải ăn để lên tim lại
    this.heroHearts = 1;
    this.bonusHeartsRemaining = 0;
    if (this.cookingSystem) {
      this.cookingSystem.recordBattleHearts(1);
    }
    if (typeof window !== 'undefined' && typeof window.__updateHeroVitalsHud === 'function') {
      window.__updateHeroVitalsHud();
    }

    // 2. Phát âm thanh và giọng đọc thông báo thua
    if (this.audioService) {
      this.audioService.playPlayerHurt?.();
      setTimeout(() => {
        this.audioService?.speak?.('Bạn đã bị thua! Bé đã hết tim rồi, cùng về Nông Trại nghỉ ngơi và ăn món ngon để hồi phục tim nhé!');
      }, 350);
    }

    // 3. Hiển thị hộp thoại / card thông báo thua
    let defeatOverlay = document.getElementById('arena-defeat-overlay');
    if (!defeatOverlay) {
      defeatOverlay = document.createElement('div');
      defeatOverlay.id = 'arena-defeat-overlay';
      defeatOverlay.className = 'arena-defeat-overlay';
      defeatOverlay.innerHTML = `
        <div class="arena-defeat-card">
          <div class="defeat-badge">💔 THỬ THÁCH CHƯA VƯỢT QUA</div>
          <div class="defeat-avatar-wrap">
            <span class="defeat-icon">🐾</span>
          </div>
          <h2 class="defeat-title">BẠN ĐÃ BỊ THUA!</h2>
          <p class="defeat-desc">
            Bé đã hết trái tim rồi! Đừng buồn nhé, các bạn thú cưng đang đợi bé về Nông Trại nghỉ ngơi đó.
          </p>
          <div class="defeat-heal-notice">
            <span class="heal-pill">❤️ Hồi lại 1 Tim</span>
            <span class="heal-hint">🍳 Bé nhớ vào Bếp ăn thêm món ngon để lên lại đủ 3 Tim nhé!</span>
          </div>
          <div class="defeat-buttons">
            <button class="modal-cta-button defeat-return-cta" id="btn-defeat-return-farm" type="button">
              🏡 Về Nông Trại Nuôi Thú ✨
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(defeatOverlay);
    }

    defeatOverlay.style.display = 'flex';
    defeatOverlay.removeAttribute('hidden');

    const handleReturn = () => {
      defeatOverlay.style.display = 'none';
      defeatOverlay.setAttribute('hidden', 'true');
      this.closeArena();

      // Đưa nhân vật quay về maps Nuôi thú (map_pet_farm)
      if (typeof window !== 'undefined' && typeof window.__travelToZone === 'function') {
        window.__travelToZone('map_pet_farm');
      } else {
        window.dispatchEvent(new CustomEvent('game:portal-warp-start', {
          detail: { targetMapId: 'map_pet_farm' }
        }));
      }
    };

    const returnBtn = document.getElementById('btn-defeat-return-farm');
    if (returnBtn) {
      returnBtn.onclick = handleReturn;
    }
  }

  /**
   * CHIẾN THẮNG & GIẢI CỨU HOÀN THÀNH
   */
  handleVictory() {
    // Hiệu ứng rung chấn động đỉnh cao khi đánh quái vượt ải
    this.triggerScreenShake('stage-clear');

    // Quái ăn mừng vui sướng
    const monsterAssets = this.getMonsterAssets(this.currentEncounter);
    if (this.arenaMonsterImg) {
      this.arenaMonsterImg.src = monsterAssets.celebrate;
      this.arenaMonsterImg.style.transform = 'none';
    }
    if (this.arenaHeroImg) {
      this.arenaHeroImg.src = this.getHeroSkinAssets().celebrate;
    }

    if (this.turnIndicator) {
      this.turnIndicator.textContent = `🎉 Tuyệt vời! ${this.currentEncounter.name} đã được thanh tẩy hoàn toàn!`;
    }
    if (this.feedbackText) {
      this.feedbackText.textContent = 'Bé đã rất dũng cảm và thông minh!';
    }

    if (this.audioService) {
      this.audioService.playSuccess();
      this.audioService.speak(`Tuyệt vời! Bé đã giải cứu thành công ${this.currentEncounter.name}!`);
    }

    // 1. Cập nhật giải cứu và điểm thưởng ngay lập tức vào ProgressionSystem & SaveAdapter
    const enc = this.currentEncounter;
    const isBossEncounter = this.isBoss;

    if (this.saveAdapter && enc?.id) {
      let state = this.saveAdapter.load();
      if (!state.campaign.rescuedFriends) {
        state.campaign.rescuedFriends = {};
      }
      state.campaign.rescuedFriends[enc.id] = {
        name: enc.name,
        rescuedAt: Date.now()
      };

      const rew = enc.reward || (isBossEncounter ? { stars: 3, exp: 30 } : { stars: 1, exp: 10 });
      let rewardRes = null;
      if (this.combatSystem?.progressionSystem) {
        this.combatSystem.progressionSystem.state = state;
        rewardRes = this.combatSystem.progressionSystem.addReward(rew);
        state = this.combatSystem.progressionSystem.state;
      } else {
        state.player.stars = (state.player.stars || 0) + (rew.stars || 1);
        state.player.exp = (state.player.exp || 0) + (rew.exp || 10);
      }

      if (rewardRes?.unlockedNewSkin) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('hero:skin-unlocked', { detail: { skin: rewardRes.unlockedNewSkin } }));
        }, 1200);
      }

      if (isBossEncounter && rew.unlockMap) {
        if (!state.campaign.unlockedMaps.includes(rew.unlockMap)) {
          state.campaign.unlockedMaps.push(rew.unlockMap);
        }
      }

      this.saveAdapter.save(state);

      if (this.combatSystem?.progressionSystem) {
        this.combatSystem.progressionSystem.state = state;
      }
    } else if (this.combatSystem?.progressionSystem && enc?.id) {
      this.combatSystem.progressionSystem.rescueFriend(enc.id, enc.name);
      this.combatSystem.progressionSystem.addReward(enc.reward || (isBossEncounter ? { stars: 3, exp: 30 } : { stars: 1, exp: 10 }));
      if (this.saveAdapter) {
        this.saveAdapter.save(this.combatSystem.progressionSystem.state);
      }
    }

    if (this.hudController) {
      this.hudController.updatePlayerHud();
      this.hudController.setStatus(`${enc?.name || 'Bạn nhỏ'} đã được giải cứu!`);
    }

    // 0. Tắt hiệu ứng nổi giận nếu đang bật
    this.setBossEnrage(false);

    // Gửi sự kiện giải cứu
    setTimeout(() => {
      this.closeArena();

      if (isBossEncounter) {
        window.dispatchEvent(new CustomEvent('game:boss-resolved', {
          detail: {
            encounterId: enc?.id,
            bossName: enc?.name,
            reward: enc?.reward || { stars: 3, exp: 30 },
            unlockedNewMap: enc?.reward?.unlockMap || 'map2'
          }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('game:encounter-resolved', {
          detail: { encounterId: enc?.id }
        }));
      }
    }, 600);
  }

  getMonsterTransform(baseFlip = 'scaleX(-1)') {
    if (this.isBoss && this.isBossEnraged) {
      return baseFlip === 'none' ? 'scale(1.20)' : 'scaleX(-1) scale(1.20)';
    }
    return baseFlip;
  }

  setBossEnrage(active) {
    this.isBossEnraged = active;
    if (this.arenaModal) {
      if (active) {
        this.arenaModal.classList.add('boss-enrage-mode');
      } else {
        this.arenaModal.classList.remove('boss-enrage-mode');
      }
    }
    if (this.arenaMonsterBox) {
      if (active) {
        this.arenaMonsterBox.classList.add('boss-enraged');
      } else {
        this.arenaMonsterBox.classList.remove('boss-enraged');
      }
    }
    if (this.arenaMonsterImg) {
      const monsterAssets = this.currentEncounter ? this.getMonsterAssets(this.currentEncounter) : null;
      const baseFlip = monsterAssets?.flipIdle ? 'scaleX(-1)' : 'none';
      if (active) {
        this.arenaMonsterImg.style.width = '260px';
        this.arenaMonsterImg.style.height = '260px';
        this.arenaMonsterImg.style.transform = baseFlip === 'none' ? 'scale(1.20)' : 'scaleX(-1) scale(1.20)';
      } else {
        const defaultSize = this.isBoss ? '225px' : '170px';
        this.arenaMonsterImg.style.width = defaultSize;
        this.arenaMonsterImg.style.height = defaultSize;
        this.arenaMonsterImg.style.transform = baseFlip;
      }
    }
  }

  checkBossEnrage() {
    if (this.isBoss && this.monsterHearts <= 2 && this.monsterHearts > 0) {
      if (!this.isBossEnraged) {
        this.setBossEnrage(true);

        // Rung chuyển màn hình khi Boss bùng nổ sức mạnh
        this.triggerScreenShake('boss-enrage');

        // Âm thanh cao trào kích tính (tiếng gầm/trống dội trầm)
        if (this.audioService) {
          this.audioService.playTone(90, 0.35, 'sawtooth');
          setTimeout(() => this.audioService?.playTone(70, 0.45, 'triangle'), 160);
        }

        // Banner thông báo giai đoạn cao trào
        if (this.turnIndicator) {
          this.turnIndicator.innerHTML = `🔥 <strong>CẢNH BÁO CAO TRÀO: BOSS BÙNG NỔ HỎA LONG THẦN KỸ!</strong>`;
        }

        // Khóa lượt và ngay lập tức cho Boss phô diễn tuyệt kỹ cao trào!
        this.isTurnLocked = true;
        setTimeout(() => {
          this.executeMonsterAttack(true); // true = showcase mode (Bé Sâu có khiên bảo vệ)
        }, 750);
      }
    } else {
      if (this.isBossEnraged && (!this.isBoss || this.monsterHearts <= 0)) {
        this.setBossEnrage(false);
      }
    }
  }

  /**
   * Kích hoạt hiệu ứng rung màn hình và rung xúc giác (Haptic Vibration)
   * @param {'hit' | 'stage-clear' | 'boss-enrage'} type
   */
  triggerScreenShake(type = 'hit') {
    if (!this.arenaModal) return;
    this.arenaModal.classList.remove('screen-shake', 'stage-clear-shake');
    // Force DOM reflow để kích hoạt lại CSS animation mượt mà
    void this.arenaModal.offsetWidth;

    if (type === 'stage-clear' || type === 'victory') {
      this.arenaModal.classList.add('stage-clear-shake');
      this.triggerHaptic([70, 40, 110, 50, 190]);
      setTimeout(() => {
        this.arenaModal?.classList.remove('stage-clear-shake');
      }, 760);
    } else if (type === 'boss-enrage') {
      this.arenaModal.classList.add('stage-clear-shake');
      this.triggerHaptic([60, 30, 90, 40, 140]);
      setTimeout(() => {
        this.arenaModal?.classList.remove('stage-clear-shake');
      }, 650);
    } else {
      this.arenaModal.classList.add('screen-shake');
      this.triggerHaptic([35, 20, 45]);
      setTimeout(() => {
        this.arenaModal?.classList.remove('screen-shake');
      }, 450);
    }
  }

  triggerHaptic(pattern = [35, 20, 45]) {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {
      // Safe fallback trên môi trường không hỗ trợ rung xúc giác
    }
  }

  closeArena() {
    const defeatOverlay = document.getElementById('arena-defeat-overlay');
    if (defeatOverlay) {
      defeatOverlay.style.display = 'none';
      defeatOverlay.setAttribute('hidden', 'true');
    }
    if (this._autoOpenMazeTimer) {
      clearTimeout(this._autoOpenMazeTimer);
      this._autoOpenMazeTimer = null;
    }
    const modal = this.mazeMinigameModal || (typeof window !== 'undefined' ? window.__mazeModal : null);
    if (modal && modal.isEncounterMode) {
      modal.hide();
    }
    this.setBossEnrage(false);
    const monsterShadow = document.getElementById('arena-monster-shadow');
    if (monsterShadow) {
      monsterShadow.style.display = 'none';
    }
    if (this.btnSpeak) this.btnSpeak.classList.remove('speaking');
    if (this._speakTimer) clearTimeout(this._speakTimer);
    if (this.arenaModal) {
      this.arenaModal.hidden = true;
      this.arenaModal.classList.remove('screen-shake', 'stage-clear-shake');
      this.arenaModal.parentElement?.classList.remove('battle-active');
      document.getElementById('btn-floating-bag')?.classList.remove('hidden-during-modal');
      document.getElementById('hero-vitals-hud')?.classList.remove('hidden-during-modal');
      this.audioService?.playMapMusic?.(window.__currentMapId || 'map1');
    }
    if (this.damageOverlay) this.damageOverlay.classList.remove('active');
    if (this.arenaHeroBox) this.arenaHeroBox.classList.remove('hero-skill-glow', 'hero-lunging', 'hero-hit');
    if (this.arenaMonsterBox) this.arenaMonsterBox.classList.remove('monster-skill-glow', 'monster-charging', 'monster-lunging', 'monster-hit', 'is-boss-arena', 'boss-enraged');
    this.isTurnLocked = false;
    this.currentEncounter = null;
    this.currentQuestion = null;
    this.encounterQuestions = [];

    if (this.combatSystem) {
      this.combatSystem.endEncounter();
    }

    if (this.hudController) {
      this.hudController.setStatus('Khu vườn sẵn sàng');
      this.hudController.setQuest('Bé Sâu tiếp tục hành trình khám phá nhé!');
    }

    window.dispatchEvent(new CustomEvent('game:encounter-closed'));
  }
}
