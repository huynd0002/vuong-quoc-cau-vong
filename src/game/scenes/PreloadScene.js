import * as Phaser from 'phaser';
import { saveAdapter } from '../../services/save/saveAdapter.js';
import map1BgUrl from '../../../assets/maps/backgrounds/map_1_bg.png?url';
import map2BgUrl from '../../../assets/maps/backgrounds/map_2_bg.png?url';
import map3BgUrl from '../../../assets/maps/backgrounds/map_3_bg.png?url';
import map4BgUrl from '../../../assets/maps/backgrounds/map_4_bg.png?url';
import map5BgUrl from '../../../assets/maps/backgrounds/map_5_bg.png?url';
import map6BgUrl from '../../../assets/maps/backgrounds/map_6_bg.png?url';
import mapPetFarmBgUrl from '../../../assets/maps/backgrounds/map_pet_farm_bg.png?url';
import mapKitchenBgUrl from '../../../assets/maps/backgrounds/map_kitchen_bg.png?url';
import mapFishingPondBgUrl from '../../../assets/maps/backgrounds/map_fishing_pond_bg.png?url';
import mapRainbowMarketBgUrl from '../../../assets/maps/backgrounds/map_rainbow_market_bg.png?url';
import mapFashionStreetBgUrl from '../../../assets/maps/backgrounds/map_fashion_street_bg.png?url';
import heroUrl from '../../../assets/hero/sau/hero_idle.png?url';
import walkSheetUrl from '../../../assets/hero/sau/sau_walk_sheet.png?url';
import idleSheetUrl from '../../../assets/hero/sau/sau_idle_sheet.png?url';
import heroKnightUrl from '../../../assets/hero/sau_upgrade/hero_upgrade_idle.png?url';
import heroKnightWalkSheetUrl from '../../../assets/hero/sau_upgrade/hero_upgrade_walk_sheet.png?url';
import heroKnightIdleSheetUrl from '../../../assets/hero/sau_upgrade/hero_upgrade_idle_sheet.png?url';
import petUrl from '../../../assets/pets/pet_bunny_idle.png?url';
import petDogIdleUrl from '../../../assets/pets/dog/dog_idle.png?url';
import petDogWalkSheetUrl from '../../../assets/pets/dog/dog_walk_sheet.png?url';
import petDogSadSheetUrl from '../../../assets/pets/dog/dog_sad_sheet.png?url';
import petDogDirtySheetUrl from '../../../assets/pets/dog/dog_dirty_sheet.png?url';
import petDogHappySheetUrl from '../../../assets/pets/dog/dog_happy_sheet.png?url';
import petDogSleepSheetUrl from '../../../assets/pets/dog/dog_sleep_sheet.png?url';
import petDogDrinkSheetUrl from '../../../assets/pets/dog/dog_drink_sheet.png?url';
import petDogPottySheetUrl from '../../../assets/pets/dog/dog_potty_sheet.png?url';
import petDogBathSheetUrl from '../../../assets/pets/dog/dog_bath_sheet.png?url';
import petDogEatSheetUrl from '../../../assets/pets/dog/dog_eat_sheet.png?url';
import sproutUrl from '../../../assets/monsters/map2/mon_caterpillar.png?url';
import sproutWalkSheetUrl from '../../../assets/monsters/map2/mon_caterpillar_walk_sheet.png?url';
import sproutIdleSheetUrl from '../../../assets/monsters/map2/mon_caterpillar_idle_sheet.png?url';
import bossBearUrl from '../../../assets/monsters/map2/boss_bear.png?url';
import bossWalkSheetUrl from '../../../assets/monsters/map2/boss_bear_walk_sheet.png?url';
import bossIdleSheetUrl from '../../../assets/monsters/map2/boss_bear_idle_sheet.png?url';
import mushroomIdleUrl from '../../../assets/monsters/map1/mushroom_idle.png?url';
import mushroomWalkSheetUrl from '../../../assets/monsters/map1/mushroom_walk_sheet.png?url';
import beeIdleUrl from '../../../assets/monsters/map1/bee_idle.png?url';
import beeWalkSheetUrl from '../../../assets/monsters/map1/bee_walk_sheet.png?url';
import ladybugIdleUrl from '../../../assets/monsters/map1/ladybug_idle.png?url';
import ladybugWalkSheetUrl from '../../../assets/monsters/map1/ladybug_walk_sheet.png?url';

import crabIdleUrl from '../../../assets/monsters/map2/mon_crab_idle.png?url';
import crabWalkSheetUrl from '../../../assets/monsters/map2/mon_crab_walk_sheet.png?url';
import starfishIdleUrl from '../../../assets/monsters/map2/mon_starfish_idle.png?url';
import starfishWalkSheetUrl from '../../../assets/monsters/map2/mon_starfish_walk_sheet.png?url';
import emeraldCrabIdleUrl from '../../../assets/monsters/map2/mon_emerald_crab_idle.png?url';
import emeraldCrabWalkSheetUrl from '../../../assets/monsters/map2/mon_emerald_crab_walk_sheet.png?url';
import bossCrabKingUrl from '../../../assets/monsters/map2/boss_crab_king.png?url';
import bossCrabKingWalkSheetUrl from '../../../assets/monsters/map2/boss_crab_king_walk_sheet.png?url';
import bossCrabKingIdleSheetUrl from '../../../assets/monsters/map2/boss_crab_king_idle_sheet.png?url';
import bossCrabKingSkillSheetUrl from '../../../assets/monsters/map2/boss_crab_king_skill_sheet.png?url';

import crystalSproutIdleUrl from '../../../assets/monsters/map3/mon_crystal_sprout_idle.png?url';
import crystalSproutWalkSheetUrl from '../../../assets/monsters/map3/mon_crystal_sprout_walk_sheet.png?url';
import crystalMothIdleUrl from '../../../assets/monsters/map3/mon_crystal_moth_idle.png?url';
import crystalMothWalkSheetUrl from '../../../assets/monsters/map3/mon_crystal_moth_walk_sheet.png?url';
import crystalBatIdleUrl from '../../../assets/monsters/map3/mon_crystal_bat_idle.png?url';
import crystalBatWalkSheetUrl from '../../../assets/monsters/map3/mon_crystal_bat_walk_sheet.png?url';
import bossCrystalDragonUrl from '../../../assets/monsters/map3/boss_crystal_dragon.png?url';
import bossCrystalDragonWalkSheetUrl from '../../../assets/monsters/map3/boss_crystal_dragon_walk_sheet.png?url';
import bossCrystalDragonIdleSheetUrl from '../../../assets/monsters/map3/boss_crystal_dragon_idle_sheet.png?url';
import bossCrystalDragonSkillSheetUrl from '../../../assets/monsters/map3/boss_crystal_dragon_skill_sheet.png?url';
import desertFoxIdleUrl from '../../../assets/monsters/map4/mon_desert_fox_idle.png?url';
import desertFoxWalkSheetUrl from '../../../assets/monsters/map4/mon_desert_fox_walk_sheet.png?url';
import scarabIdleUrl from '../../../assets/monsters/map4/mon_scarab_idle.png?url';
import scarabWalkSheetUrl from '../../../assets/monsters/map4/mon_scarab_walk_sheet.png?url';
import desertFalconIdleUrl from '../../../assets/monsters/map4/mon_desert_falcon_idle.png?url';
import desertFalconWalkSheetUrl from '../../../assets/monsters/map4/mon_desert_falcon_walk_sheet.png?url';
import bossDesertSphinxUrl from '../../../assets/monsters/map4/boss_desert_sphinx.png?url';
import bossDesertSphinxWalkSheetUrl from '../../../assets/monsters/map4/boss_desert_sphinx_walk_sheet.png?url';
import bossDesertSphinxIdleSheetUrl from '../../../assets/monsters/map4/boss_desert_sphinx_idle_sheet.png?url';
import bossDesertSphinxSkillSheetUrl from '../../../assets/monsters/map4/boss_desert_sphinx_skill_sheet.png?url';

import propChestUrl from '../../../assets/props/prop_chest.png?url';
import propSignpostUrl from '../../../assets/props/prop_signpost.png?url';
import propLotusUrl from '../../../assets/props/prop_lotus.png?url';
import propMushroomsUrl from '../../../assets/props/prop_mushrooms.png?url';
import propFlowerBushUrl from '../../../assets/props/prop_flower_bush.png?url';
import propLanternUrl from '../../../assets/props/prop_lantern.png?url';
import propHaystackUrl from '../../../assets/props/prop_dong_rom.png?url';
import propPetBathUrl from '../../../assets/props/prop_pet_bath.png?url';
import propPetBedUrl from '../../../assets/props/prop_pet_bed.png?url';
import propPetToiletUrl from '../../../assets/props/prop_pet_toilet.png?url';
import propBallUrl from '../../../assets/props/prop_ball.png?url';
import propBallSheetUrl from '../../../assets/props/prop_ball_sheet.png?url';
import portalSheetUrl from '../../../assets/props/portal/portal_sheet.png?url';
import implosionSheetUrl from '../../../assets/props/portal/implosion_sheet.png?url';
import vfxLevelUpSheetUrl from '../../../assets/ui/vfx_level_up_sheet.png?url';
import vfxExclamationSheetUrl from '../../../assets/ui/vfx_exclamation_sheet.png?url';
import vfxCartoonPowSheetUrl from '../../../assets/ui/vfx_cartoon_pow_sheet.png?url';

// Phụ Kiện Nhân Vật Thời Trang Mua Bằng Sao (Chibi Accessories)
import accRainbowCrownUrl from '../../../assets/fashion/accessories/acc_rainbow_crown.png?url';
import accCatEarsBowUrl from '../../../assets/fashion/accessories/acc_cat_ears_bow.png?url';
import accWitchHatUrl from '../../../assets/fashion/accessories/acc_witch_hat.png?url';
import accHeartGlassesUrl from '../../../assets/fashion/accessories/acc_heart_glasses.png?url';
import accFairyWingsUrl from '../../../assets/fashion/accessories/acc_fairy_wings.png?url';
import accStrawHatUrl from '../../../assets/fashion/accessories/acc_straw_hat.png?url';
import accAngelHaloUrl from '../../../assets/fashion/accessories/acc_angel_halo.png?url';
import accPandaHeadbandUrl from '../../../assets/fashion/accessories/acc_panda_headband.png?url';
import accBunnyFlowerEarsUrl from '../../../assets/fashion/accessories/acc_bunny_flower_ears.png?url';
import accStarGlassesUrl from '../../../assets/fashion/accessories/acc_star_glasses.png?url';
import accSuperCapeUrl from '../../../assets/fashion/accessories/acc_super_cape.png?url';
import accFlowerWreathUrl from '../../../assets/fashion/accessories/acc_flower_wreath.png?url';
import accBeretArtistUrl from '../../../assets/fashion/accessories/acc_beret_artist.png?url';
import accChefHatUrl from '../../../assets/fashion/accessories/acc_chef_hat.png?url';
import accSailorHatUrl from '../../../assets/fashion/accessories/acc_sailor_hat.png?url';
import accCowboyHatUrl from '../../../assets/fashion/accessories/acc_cowboy_hat.png?url';
import accFrogHatUrl from '../../../assets/fashion/accessories/acc_frog_hat.png?url';
import accRainbowBalloonsUrl from '../../../assets/fashion/accessories/acc_rainbow_balloons.png?url';
import accGiantLollipopUrl from '../../../assets/fashion/accessories/acc_giant_lollipop.png?url';
import accPinwheelUrl from '../../../assets/fashion/accessories/acc_pinwheel.png?url';
import accStarWandUrl from '../../../assets/fashion/accessories/acc_star_wand.png?url';
import iconShopBackpackUrl from '../../../assets/ui/hud/icon_shop_backpack.png?url';
import butterflyRainbowUrl from '../../../assets/sprites/effects/butterfly_rainbow.png?url';

import bossDragonUrl from '../../../assets/monsters/boss_dragon/boss_dragon.png?url';
import bossDragonWalkSheetUrl from '../../../assets/monsters/boss_dragon/boss_dragon_walk_sheet.png?url';
import bossDragonIdleSheetUrl from '../../../assets/monsters/boss_dragon/boss_dragon_idle_sheet.png?url';
import bossDragonSkillSheetUrl from '../../../assets/monsters/boss_dragon/boss_dragon_skill_sheet.png?url';
import bobberFloat3dUrl from '../../../assets/fishing/bobber_float_3d.png?url';
import rodLotusHeldUrl from '../../../assets/fishing/rod_lotus_held.png?url';
import rodDuckHeldUrl from '../../../assets/fishing/rod_duck_held.png?url';
import rodOceanStarHeldUrl from '../../../assets/fishing/rod_ocean_star_held.png?url';
import rodRainbowHeldUrl from '../../../assets/fishing/rod_rainbow_held.png?url';
import rodDragonHeldUrl from '../../../assets/fishing/rod_dragon_held.png?url';
import fishPondSwim8DirUrl from '../../../assets/fishing/fish_pond_swim_8dir_sheet.png?url';
import fishOrangeSwim8DirUrl from '../../../assets/fishing/fish_orange_swim_8dir_sheet.png?url';
import fishCloudSwim8DirUrl from '../../../assets/fishing/fish_cloud_swim_8dir_sheet.png?url';

/**
 * Preload Scene
 * Tải trước tài nguyên hình ảnh theo nhóm có thanh tiến trình và fallback.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // 1. Tải tài nguyên hình nền 6 Bản Đồ Cốt Truyện
    this.load.image('map_1_bg', map1BgUrl);
    this.load.image('map_2_bg', map2BgUrl);
    this.load.image('map_3_bg', map3BgUrl);
    this.load.image('map_4_bg', map4BgUrl);
    this.load.image('map_5_bg', map5BgUrl);
    this.load.image('map_6_bg', map6BgUrl);
    this.load.image('map_pet_farm_bg', mapPetFarmBgUrl);
    this.load.image('map_kitchen_bg', mapKitchenBgUrl);
    this.load.image('map_fishing_pond_bg', mapFishingPondBgUrl);
    this.load.image('map_rainbow_market_bg', mapRainbowMarketBgUrl);
    this.load.image('map_fashion_street_bg', mapFashionStreetBgUrl);

    // Spritesheet nhân vật chính (Cơ bản & Nâng cấp Hiệp Sĩ Cầu Vồng) & Bạn đồng hành
    this.load.image('hero_idle', heroUrl);
    this.load.spritesheet('hero_walk_sheet', walkSheetUrl, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('hero_idle_sheet', idleSheetUrl, { frameWidth: 128, frameHeight: 128 });
    this.load.image('hero_upgrade_idle', heroKnightUrl);
    this.load.spritesheet('hero_upgrade_walk_sheet', heroKnightWalkSheetUrl, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('hero_upgrade_idle_sheet', heroKnightIdleSheetUrl, { frameWidth: 128, frameHeight: 128 });
    this.load.image('pet_bunny_idle', petUrl);
    // Tải tài nguyên Bé Cún Vàng (Pet Dog): Đi bộ 8 hướng, Buồn bã, Ở dơ, Vui vẻ
    this.load.image('pet_dog_idle', petDogIdleUrl);
    this.load.spritesheet('pet_dog_walk_sheet', petDogWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('pet_dog_sad_sheet', petDogSadSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('pet_dog_dirty_sheet', petDogDirtySheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('pet_dog_happy_sheet', petDogHappySheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('pet_dog_sleep_sheet', petDogSleepSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('pet_dog_drink_sheet', petDogDrinkSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('pet_dog_potty_sheet', petDogPottySheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('pet_dog_bath_sheet', petDogBathSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('pet_dog_eat_sheet', petDogEatSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.image('mon_sprout', sproutUrl);
    this.load.spritesheet('mon_sprout_walk_sheet', sproutWalkSheetUrl, { frameWidth: 384, frameHeight: 384 });
    this.load.spritesheet('mon_sprout_idle_sheet', sproutIdleSheetUrl, { frameWidth: 384, frameHeight: 384 });
    this.load.image('boss_bear', bossBearUrl);
    this.load.spritesheet('boss_bear_walk_sheet', bossWalkSheetUrl, { frameWidth: 420, frameHeight: 420 });
    this.load.spritesheet('boss_bear_idle_sheet', bossIdleSheetUrl, { frameWidth: 420, frameHeight: 420 });

    // 2. Tải tài nguyên 3 quái vật Map 1 (Nấm, Ong Vàng, Bọ Rùa)
    this.load.image('mon_mushroom', mushroomIdleUrl);
    this.load.spritesheet('mon_mushroom_walk_sheet', mushroomWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.image('mon_bee', beeIdleUrl);
    this.load.spritesheet('mon_bee_walk_sheet', beeWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.image('mon_ladybug', ladybugIdleUrl);
    this.load.spritesheet('mon_ladybug_walk_sheet', ladybugWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });

    // 2.5. Tải tài nguyên 3 quái vật & 1 Boss Map 2 (Cua Kẹp, Sao Biển, Cua Ngọc Bích, Cua Vua Vỏ Ngọc)
    this.load.image('mon_crab', crabIdleUrl);
    this.load.spritesheet('mon_crab_walk_sheet', crabWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.image('mon_starfish', starfishIdleUrl);
    this.load.spritesheet('mon_starfish_walk_sheet', starfishWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.image('mon_emerald_crab', emeraldCrabIdleUrl);
    this.load.spritesheet('mon_emerald_crab_walk_sheet', emeraldCrabWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });

    this.load.image('boss_crab_king', bossCrabKingUrl);
    this.load.spritesheet('boss_crab_king_walk_sheet', bossCrabKingWalkSheetUrl, { frameWidth: 320, frameHeight: 320 });
    this.load.spritesheet('boss_crab_king_idle_sheet', bossCrabKingIdleSheetUrl, { frameWidth: 320, frameHeight: 320 });
    this.load.spritesheet('boss_crab_king_skill_sheet', bossCrabKingSkillSheetUrl, { frameWidth: 320, frameHeight: 320 });

    // 2.6. Tải tài nguyên 3 quái vật & 1 Boss Map 3 (Thạch Nhũ, Bướm Đêm, Dơi Ngọc Tím, Rồng Pha Lê)
    this.load.image('mon_crystal_sprout', crystalSproutIdleUrl);
    this.load.spritesheet('mon_crystal_sprout_walk_sheet', crystalSproutWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.image('mon_crystal_moth', crystalMothIdleUrl);
    this.load.spritesheet('mon_crystal_moth_walk_sheet', crystalMothWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.image('mon_crystal_bat', crystalBatIdleUrl);
    this.load.spritesheet('mon_crystal_bat_walk_sheet', crystalBatWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });

    this.load.image('boss_crystal_dragon', bossCrystalDragonUrl);
    this.load.spritesheet('boss_crystal_dragon_walk_sheet', bossCrystalDragonWalkSheetUrl, { frameWidth: 320, frameHeight: 320 });
    this.load.spritesheet('boss_crystal_dragon_idle_sheet', bossCrystalDragonIdleSheetUrl, { frameWidth: 320, frameHeight: 320 });
    this.load.spritesheet('boss_crystal_dragon_skill_sheet', bossCrystalDragonSkillSheetUrl, { frameWidth: 320, frameHeight: 320 });

    // 2.7. Tải tài nguyên 3 quái vật & 1 Boss Map 4 (Cáo Cát Ánh Dương, Bọ Cánh Cứng, Chim Ưng Mặt Trời, Thần Nhân Sư Ánh Dương)
    this.load.image('mon_desert_fox', desertFoxIdleUrl);
    this.load.spritesheet('mon_desert_fox_walk_sheet', desertFoxWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.image('mon_scarab', scarabIdleUrl);
    this.load.spritesheet('mon_scarab_walk_sheet', scarabWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.image('mon_desert_falcon', desertFalconIdleUrl);
    this.load.spritesheet('mon_desert_falcon_walk_sheet', desertFalconWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });

    this.load.image('boss_desert_sphinx', bossDesertSphinxUrl);
    this.load.spritesheet('boss_desert_sphinx_walk_sheet', bossDesertSphinxWalkSheetUrl, { frameWidth: 320, frameHeight: 320 });
    this.load.spritesheet('boss_desert_sphinx_idle_sheet', bossDesertSphinxIdleSheetUrl, { frameWidth: 320, frameHeight: 320 });
    this.load.spritesheet('boss_desert_sphinx_skill_sheet', bossDesertSphinxSkillSheetUrl, { frameWidth: 320, frameHeight: 320 });

    // 3. Tải Bộ Prop Làng Quê Sinh Động
    this.load.image('prop_chest', propChestUrl);
    this.load.image('prop_signpost', propSignpostUrl);
    this.load.image('prop_lotus', propLotusUrl);
    this.load.image('prop_mushrooms', propMushroomsUrl);
    this.load.image('prop_flower_bush', propFlowerBushUrl);
    this.load.image('prop_lantern', propLanternUrl);
    this.load.image('prop_haystack', propHaystackUrl);
    this.load.image('prop_pet_bath', propPetBathUrl);
    this.load.image('prop_pet_bed', propPetBedUrl);
    this.load.image('prop_pet_toilet', propPetToiletUrl);
    this.load.image('prop_ball', propBallUrl);
    this.load.image('icon_shop_backpack', iconShopBackpackUrl);
    this.load.image('butterfly_rainbow', butterflyRainbowUrl);
    this.load.spritesheet('prop_ball_sheet', propBallSheetUrl, { frameWidth: 72, frameHeight: 72 });

    // 4. Tải Cổng Dịch Chuyển Không Gian Cầu Vồng (8 Frames Animation) & Hiệu Ứng Implosion (51 Frames)
    this.load.spritesheet('teleport_portal_sheet', portalSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('vfx_implosion_sheet', implosionSheetUrl, { frameWidth: 208, frameHeight: 184 });
    this.load.spritesheet('vfx_level_up_sheet', vfxLevelUpSheetUrl, { frameWidth: 176, frameHeight: 138 });
    this.load.spritesheet('vfx_exclamation_sheet', vfxExclamationSheetUrl, { frameWidth: 84, frameHeight: 104 });
    this.load.spritesheet('vfx_cartoon_pow_sheet', vfxCartoonPowSheetUrl, { frameWidth: 184, frameHeight: 144 });

    // 5. Tải Boss Rồng Thần Cầu Vồng (Walk, Idle, Skill Spritesheets)
    this.load.image('boss_dragon', bossDragonUrl);
    this.load.spritesheet('boss_dragon_walk_sheet', bossDragonWalkSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('boss_dragon_idle_sheet', bossDragonIdleSheetUrl, { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('boss_dragon_skill_sheet', bossDragonSkillSheetUrl, { frameWidth: 256, frameHeight: 256 });

    // 6. Tải Tài Nguyên Câu Cá 3D & Spritesheet Cá Bơi 8 Hướng + Ngoi Lên / Lặn Xuống / Mắc Câu
    this.load.image('bobber_float_3d', bobberFloat3dUrl);
    this.load.image('rod_lotus_held', rodLotusHeldUrl);
    this.load.image('rod_duck_held', rodDuckHeldUrl);
    this.load.image('rod_ocean_star_held', rodOceanStarHeldUrl);
    this.load.image('rod_rainbow_held', rodRainbowHeldUrl);
    this.load.image('rod_dragon_held', rodDragonHeldUrl);
    this.load.spritesheet('fish_pond_swim_8dir', fishPondSwim8DirUrl, { frameWidth: 160, frameHeight: 160 });
    this.load.spritesheet('fish_orange_swim_8dir', fishOrangeSwim8DirUrl, { frameWidth: 160, frameHeight: 160 });
    this.load.spritesheet('fish_cloud_swim_8dir', fishCloudSwim8DirUrl, { frameWidth: 160, frameHeight: 160 });

    // 7. Tải Phụ Kiện Thời Trang Gắn Nhân Vật Mua Bằng Sao
    this.load.image('acc_rainbow_crown', accRainbowCrownUrl);
    this.load.image('acc_cat_ears_bow', accCatEarsBowUrl);
    this.load.image('acc_witch_hat', accWitchHatUrl);
    this.load.image('acc_heart_glasses', accHeartGlassesUrl);
    this.load.image('acc_fairy_wings', accFairyWingsUrl);
    this.load.image('acc_straw_hat', accStrawHatUrl);
    this.load.image('acc_angel_halo', accAngelHaloUrl);
    this.load.image('acc_panda_headband', accPandaHeadbandUrl);
    this.load.image('acc_bunny_flower_ears', accBunnyFlowerEarsUrl);
    this.load.image('acc_star_glasses', accStarGlassesUrl);
    this.load.image('acc_super_cape', accSuperCapeUrl);
    this.load.image('acc_flower_wreath', accFlowerWreathUrl);
    this.load.image('acc_beret_artist', accBeretArtistUrl);
    this.load.image('acc_chef_hat', accChefHatUrl);
    this.load.image('acc_sailor_hat', accSailorHatUrl);
    this.load.image('acc_cowboy_hat', accCowboyHatUrl);
    this.load.image('acc_frog_hat', accFrogHatUrl);
    this.load.image('acc_rainbow_balloons', accRainbowBalloonsUrl);
    this.load.image('acc_giant_lollipop', accGiantLollipopUrl);
    this.load.image('acc_pinwheel', accPinwheelUrl);
    this.load.image('acc_star_wand', accStarWandUrl);

    // 2. Báo tiến trình cho UI bên ngoài
    this.load.on('progress', (value) => {
      const percent = Math.round(value * 100);
      window.dispatchEvent(new CustomEvent('game:load-progress', { detail: { percent } }));
    });

    this.load.on('loaderror', (file) => {
      console.warn(`[PreloadScene] Asset fallback kích hoạt cho: ${file.key}`);
    });

    this.hasTransitioned = false;
    const transitionToWorld = () => {
      if (this.hasTransitioned) return;
      this.hasTransitioned = true;
      if (this.preloadWatchdog) clearTimeout(this.preloadWatchdog);
      try {
        if (this.load.isLoading()) {
          this.load.stop();
        }
      } catch {}
      window.dispatchEvent(new CustomEvent('game:load-complete'));
      if (this.sys && this.sys.isActive()) {
        this.scene.start('WorldScene', { mapId: 'map_pet_farm' });
      }
    };

    // Watchdog an toàn: Nếu mạng chậm hoặc giải mã tài nguyên bị kẹt quá 1.8 giây,
    // tự động bỏ qua và chuyển cảnh ngay vào WorldScene, không để bé bị kẹt ở màn hình xanh
    this.preloadWatchdog = setTimeout(() => {
      console.warn('[PreloadScene] Watchdog kích hoạt: Quá thời gian nạp tài nguyên, tự động vào thế giới!');
      transitionToWorld();
    }, 1800);

    this.load.once('complete', () => {
      transitionToWorld();
    });
  }

  create() {
    if (this.preloadWatchdog) clearTimeout(this.preloadWatchdog);
    if (!this.hasTransitioned) {
      this.hasTransitioned = true;
      this.scene.start('WorldScene', { mapId: 'map_pet_farm' });
    }
  }
}
