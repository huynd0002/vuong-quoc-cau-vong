import * as Phaser from 'phaser';
import { Hero } from '../entities/Hero.js';
import { Pet } from '../entities/Pet.js';
import { Monster } from '../entities/Monster.js';
import { Boss } from '../entities/Boss.js';
import { PropsPuzzle } from '../entities/PropsPuzzle.js';
import { PropEntity } from '../entities/PropEntity.js';
import { Butterfly } from '../entities/Butterfly.js';
import { PondFish } from '../entities/PondFish.js';
import { TeleportPortal } from '../entities/TeleportPortal.js';
import { FireflyEffect } from '../effects/FireflyEffect.js';
import { FireworkCelebrationEffect } from '../effects/FireworkCelebrationEffect.js';
import { CloudEffect } from '../effects/CloudEffect.js';
import { LakeWaterEffect, isPointInLake, clampOutOfLake } from '../effects/LakeWaterEffect.js';
import { PetBathWaterEffect } from '../effects/PetBathWaterEffect.js';
import { PetBedSleepEffect } from '../effects/PetBedSleepEffect.js';
import { createGroundShadow } from '../effects/GroundShadow.js';
import { PetSleepModal } from '../ui/PetSleepModal.js';
import { ToyBall } from '../entities/ToyBall.js';
import { getMapConfig } from '../../content/maps/mapsConfig.js';
import { CAMPAIGN_ZONES } from '../../content/campaign/campaignGraph.js';
import { RODS, FISH_DIFFICULTY_PROFILES, BAITS, calculateFishSellPrice, PULL_8_STEPS } from '../../content/fishing/fishingData.js';
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

const MAP_BG_ASSETS = {
  map_1_bg: map1BgUrl,
  map_2_bg: map2BgUrl,
  map_3_bg: map3BgUrl,
  map_4_bg: map4BgUrl,
  map_5_bg: map5BgUrl,
  map_6_bg: map6BgUrl,
  map_pet_farm_bg: mapPetFarmBgUrl,
  map_kitchen_bg: mapKitchenBgUrl,
  map_fishing_pond_bg: mapFishingPondBgUrl,
  map_rainbow_market_bg: mapRainbowMarketBgUrl,
  map_fashion_street_bg: mapFashionStreetBgUrl
};

export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
    this.hero = null;
    this.pet = null;
    this.monsters = [];
    this.boss = null;
    this.propsPuzzle = null;
    this.teleportPortal = null;
    this.returnPortal = null;
    this.portals = [];
    this.fireflyEffect = null;
    this.cloudEffect = null;
    this.lakeWaterEffect = null;
    this.petBathWaterEffect = null;
    this.petBathSprite = null;
    this.petBathShadow = null;
    this.petToiletShadow = null;
    this.petToiletSprite = null;
    this.petBedShadow = null;
    this.petBedSprite = null;
    this.petBedSleepEffect = null;
    this.toyBall = null;
    this.petSleepModal = null;
    this.currentPetStationAction = null;
    this.petActionProgressBar = null;
    this.petActionTween = null;
    this.petProgressTween = null;
    this.petStationFinishTimer = null;
    this.windowListeners = [];
    this.propsList = [];
    this.currentMapId = 'map_pet_farm';
    this.isExploring = true;
  }

  init(data) {
    if (data && data.mapId) {
      this.currentMapId = data.mapId;
    } else {
      const state = saveAdapter.load();
      this.currentMapId = state?.campaign?.currentMapId || 'map_pet_farm';
    }
  }

  addManagedListener(eventName, handler) {
    window.addEventListener(eventName, handler);
    this.windowListeners.push({ eventName, handler });
  }

  setJoystickDirection(x, y) {
    this.joystickVector = {
      x: Number(x) || 0,
      y: Number(y) || 0
    };
  }

  isWorldPointer(pointer) {
    // DOM care/HUD controls overlay the canvas. Their pointer coordinates must
    // never also select an unrelated station underneath the button.
    const target = pointer?.event?.target;
    return this.isExploring && (!target || target === this.game.canvas);
  }

  create() {
    window.__worldScene = this;
    window.__currentMapId = this.currentMapId;
    const mapConfig = getMapConfig(this.currentMapId);
    this.mapConfig = mapConfig;
    const saveState = saveAdapter.load();

    try {

    // Tự động phát nhạc nền phù hợp với từng vùng đất (BGM)
    if (window.__audioService) {
      window.__audioService.playMapMusic(this.currentMapId);
    }

    // Kiểm tra xem map hiện tại có phải map chiến đấu (có quái hoặc Boss) hay không
    const isBattleMap = Boolean(mapConfig?.boss || (Array.isArray(mapConfig?.encounters) && mapConfig.encounters.length > 0));

    // Yêu cầu: "Phải giết tất cả các maps thì cổng di chuyển mới xuất hiện" & "các maps đã hoàn thành nếu đi đến và quay lại thì sẽ hiện lại từ đầu để có thể làm lại ."
    // Khi vào hoặc quay lại bất kỳ map chiến đấu nào, làm mới trạng thái quái và boss của map đó
    // để thử thách luôn bắt đầu từ đầu: quái nhỏ hồi sinh, boss ẩn đợi quái con bị hạ, cổng dịch chuyển chưa xuất hiện.
    if (isBattleMap && Array.isArray(mapConfig?.encounters)) {
      let stateModified = false;
      if (!saveState.campaign) saveState.campaign = {};
      if (saveState.campaign.rescuedFriends) {
        mapConfig.encounters.forEach(enc => {
          if (saveState.campaign.rescuedFriends[enc.id]) {
            delete saveState.campaign.rescuedFriends[enc.id];
            stateModified = true;
          }
        });
        if (mapConfig.boss?.id && saveState.campaign.rescuedFriends[mapConfig.boss.id]) {
          delete saveState.campaign.rescuedFriends[mapConfig.boss.id];
          stateModified = true;
        }
      }
      if (mapConfig.boss?.id && saveState.campaign.bossDeathPositions?.[mapConfig.boss.id]) {
        delete saveState.campaign.bossDeathPositions[mapConfig.boss.id];
        stateModified = true;
      }
      if (stateModified) {
        saveAdapter.save(saveState);
      }
    }

    // 1. Vẽ hình nền map với cơ chế bảo đảm nạp tức thì và nền an toàn
    this.drawFallbackBackground();
    this.bgImage = null;
    if (this.textures.exists(mapConfig.bgKey)) {
      this.bgImage = this.add.image(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2, mapConfig.bgKey)
        .setDisplaySize(DESIGN_WIDTH, DESIGN_HEIGHT)
        .setDepth(-5);
    } else {
      const targetUrl = MAP_BG_ASSETS[mapConfig.bgKey] || map1BgUrl;
      this.load.image(mapConfig.bgKey, targetUrl);
      this.load.once(`filecomplete-image-${mapConfig.bgKey}`, () => {
        if (!this.sys || !this.sys.isActive()) return;
        if (this.bgImage && this.bgImage.active) {
          this.bgImage.setTexture(mapConfig.bgKey);
        } else {
          this.bgImage = this.add.image(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2, mapConfig.bgKey)
            .setDisplaySize(DESIGN_WIDTH, DESIGN_HEIGHT)
            .setDepth(-5);
        }
      });
      this.load.start();

      if (this.textures.exists('map_1_bg')) {
        this.bgImage = this.add.image(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2, 'map_1_bg')
          .setDisplaySize(DESIGN_WIDTH, DESIGN_HEIGHT)
          .setDepth(-5);
      } else {
        this.drawFallbackBackground();
      }
    }

    // 2. Trang trí hoa cỏ nhẹ & Bộ Props Sống Động
    this.createDecorations();
    this.createProps(mapConfig);

    // 3. Khởi tạo Hero (Bé Sâu / Bé Sâu Hiệp Sĩ Nâng Cấp)
    const spawn = mapConfig.heroSpawn || { x: 380, y: 510 };
    const initialSkin = saveState?.player?.selectedSkin || (saveState?.player?.level >= 2 ? 'knight' : 'default');
    this.hero = new Hero(this, spawn.x, spawn.y, { skin: initialSkin });
    this.hero.restoreDisplaySize();

    // Hien thi Huy Hieu tren dau nhan vat neu da deo
    const badgeSys = window.__badgeSystem;
    const initialBadge = badgeSys?.getEquippedBadge() || (saveState?.player?.equippedBadge ? badgeSys?.getBadge(saveState.player.equippedBadge) : null);
    if (initialBadge && this.hero) {
      this.hero.setHeadBadge(initialBadge);
    }

    this.onBadgeEquipped = (e) => {
      const badge = e.detail?.badge;
      if (badge && this.hero) {
        this.hero.setHeadBadge(badge);
      }
    };
    this.addManagedListener('game:badge-equipped', this.onBadgeEquipped);

    this.onBadgeUnequipped = () => {
      if (this.hero) {
        this.hero.clearHeadBadge();
      }
    };
    this.addManagedListener('game:badge-unequipped', this.onBadgeUnequipped);

    // Hiển thị Phụ Kiện trên người nhân vật nếu đã đeo
    const fashionSys = window.__fashionSystem;
    const initialAccId = fashionSys?.getState?.()?.currentAccessory || saveState?.fashion?.currentAccessory;
    if (initialAccId && this.hero) {
      this.hero.setAccessory(initialAccId);
    }

    this.onAccessoryChanged = (e) => {
      const accId = e.detail?.accessoryId;
      if (this.hero) {
        if (accId) {
          this.hero.setAccessory(accId);
        } else {
          this.hero.clearAccessory();
        }
      }
    };
    this.addManagedListener('game:accessory-changed', this.onAccessoryChanged);

    // Lắng nghe sự kiện đổi ngoại trang thời gian thực
    this.onSkinChanged = (e) => {
      const newSkin = e.detail?.skin;
      if (newSkin && this.hero) {
        this.hero.setSkin(newSkin);
      }
    };
    this.addManagedListener('hero:skin-changed', this.onSkinChanged);

    this.cachedPetStats = saveState?.pet || {};
    this.onPetUpdated = (e) => {
      if (e?.detail?.pet) {
        this.cachedPetStats = e.detail.pet;
        if (this.pet && e.detail.pet.type) {
          this.pet.type = e.detail.pet.type;
        }
      }
    };
    this.addManagedListener('game:pet-updated', this.onPetUpdated);

    this.onPetCompanionToggled = (e) => {
      const isAccompanying = Boolean(e?.detail?.isCompanion);
      if (this.currentMapId === 'map_pet_farm' && this.pet) {
        if (isAccompanying) {
          this.pet.celebrate?.(2200);
          this.pet.spawnEmote?.('🐾');
        } else {
          this.pet.celebrate?.(1200);
          this.pet.spawnEmote?.('🏡');
        }
      }
    };
    this.addManagedListener('game:pet-companion-toggled', this.onPetCompanionToggled);

    // 4. Khởi tạo Pet (Bé Cún Vàng / Thỏ Bông):
    // QUY TẮC: Chú cún CHỈ đi theo qua các maps khi ĐÃ ĐƯỢC YÊU CẦU tại nông trại (map_pet_farm).
    // Tuyệt đối KHÔNG tự động đi theo mặc định!
    const isFarmMap = this.currentMapId === 'map_pet_farm';
    const isCompanion = Boolean(saveState?.pet?.isCompanion);
    const petType = saveState?.pet?.type || 'dog';

    if (isFarmMap) {
      // Tại Nông Trại Nuôi Thú: Chú cún luôn hiện diện tự do để bé chăm sóc, cho ăn, tắm mát, chơi bóng
      this.pet = new Pet(this, this.hero, {
        type: petType,
        size: 96,
        visible: true,
        mode: 'farm_roam',
        x: 480,
        y: 420
      });
    } else if (isCompanion) {
      // Tại các maps khác: Cún CHỈ xuất hiện và đi theo KHI VÀ CHỈ KHI đã được bé yêu cầu tại nông trại
      this.pet = new Pet(this, this.hero, {
        type: petType,
        size: 96,
        visible: true,
        mode: 'follow'
      });
    } else {
      // Chưa được yêu cầu: Cún ở lại nông trại, hoàn toàn không xuất hiện ở map này
      this.pet = null;
    }

    // 5. Props Puzzle (Cổng Hoa Cầu Vồng) đã loại bỏ khỏi map theo yêu cầu của người dùng
    this.propsPuzzle = null;

    // 5b. Cổng Dịch Chuyển Chuyển Maps (Teleport Portal):
    // YÊU CẦU: "Phải giết tất cả các maps thì cổng di chuyển mới xuất hiện"
    // Đối với maps có quái vật và Boss (map1 -> map6):
    // Tuyệt đối KHÔNG hiển thị cổng dịch chuyển khi mới vào map!
    // Cổng chỉ xuất hiện tại vị trí Boss ngã xuống sau khi đã tiêu diệt toàn bộ quái và hạ gục Boss.
    this.portals = [];
    if (isBattleMap) {
      this.teleportPortal = null;
    } else if (mapConfig.teleportPortal) {
      // Dành cho map hòa bình không có quái (map_pet_farm): cổng chuyển cảnh là lối đi thông thường
      this.teleportPortal = new TeleportPortal(this, mapConfig.teleportPortal);
      this.portals.push(this.teleportPortal);
    }

    // 5c. Khởi tạo Cổng Dịch Chuyển Trở Về Map Cũ Trước Đó (Return Portal)
    if (mapConfig.returnPortal) {
      const canShow = !mapConfig.returnPortal.requiresUnlock ||
        (saveState?.campaign?.unlockedMaps || []).includes(mapConfig.returnPortal.requiresUnlock);
      if (canShow) {
        this.returnPortal = new TeleportPortal(this, mapConfig.returnPortal);
        this.portals.push(this.returnPortal);
      }
    }

    // 5c2. Khởi tạo danh sách các cổng phụ nếu có (extraPortals)
    if (Array.isArray(mapConfig.extraPortals)) {
      for (const pCfg of mapConfig.extraPortals) {
        const canShow = !pCfg.requiresUnlock ||
          (saveState?.campaign?.unlockedMaps || []).includes(pCfg.requiresUnlock);
        if (canShow) {
          const extraPortal = new TeleportPortal(this, pCfg);
          this.portals.push(extraPortal);
        }
      }
    }

    // 5d. Khởi tạo Hiệu Ứng Đom Đóm Dạ Quang Bay Lượn
    this.fireflyEffect = new FireflyEffect(this, this.currentMapId, 16);
    // 5g. Khởi tạo Hiệu Ứng Mây bay 8 hướng & Hiện tượng Bóng Mây Đổ Mặt Đất
        this.kitchenMotes = [];
    if (this.currentMapId === 'map_kitchen') {
      const windowLight = this.add.polygon(345, 120, [
        0, 0,
        140, 0,
        360, 480,
        -80, 480
      ], 0xffedd5, 0.12).setDepth(1);
      this.tweens.add({
        targets: windowLight,
        alpha: { from: 0.08, to: 0.18 },
        duration: 2600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      for (let i = 0; i < 20; i++) {
        const mx = Phaser.Math.Between(160, 1120);
        const my = Phaser.Math.Between(120, 640);
        const size = Phaser.Math.FloatBetween(2.5, 6.5);
        const color = Phaser.Math.RND.pick([0xffedd5, 0xfef08a, 0xfde047, 0xffffff]);
        const alpha = Phaser.Math.FloatBetween(0.25, 0.65);
        const mote = this.add.circle(mx, my, size, color, alpha).setDepth(Phaser.Math.Between(7, 18));
        mote.baseX = mx;
        mote.baseY = my;
        mote.parallaxFactor = Phaser.Math.FloatBetween(0.012, 0.038);
        this.tweens.add({
          targets: mote,
          y: my + Phaser.Math.Between(-18, 18),
          x: mx + Phaser.Math.Between(-12, 12),
          alpha: { from: alpha * 0.4, to: alpha },
          duration: Phaser.Math.Between(1800, 3200),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        this.kitchenMotes.push(mote);
      }
    }
    if (this.currentMapId !== 'map_kitchen') {
      this.cloudEffect = new CloudEffect(this);
    }

    // 5e. Khởi tạo Hiệu Ứng Mặt Nước Hồ Sen Làng Quê (Map 1)
    if (this.currentMapId === 'map1' || !this.currentMapId) {
      this.lakeWaterEffect = new LakeWaterEffect(this);
    }

    // 5f. Khởi tạo Đường Kết Nối Phố Thời Trang & Bồn Tắm Thú Cưng (map_pet_farm)
    if (this.currentMapId === 'map_pet_farm') {
      // Đã chuyển đường sang Phố Thời Trang từ Chợ Cầu Vồng theo yêu cầu
      const bathStation = mapConfig.petStations?.find(s => s.type === 'bath');
      const bathX = bathStation?.x ?? 512;
      const bathY = bathStation?.y ?? 597;
      const bathScale = 0.20; // Thu nhỏ lại theo yêu cầu

      // Bóng đổ chân thực dưới bồn tắm (tương ứng kích thước mới thu nhỏ)
      this.petBathShadow = createGroundShadow(this, bathX, bathY + 50, 126, 38, 0.68).setDepth(2);

      if (this.textures.exists('prop_pet_bath')) {
        this.petBathSprite = this.add.image(bathX, bathY, 'prop_pet_bath')
          .setScale(bathScale)
          .setOrigin(0.5, 0.5)
          .setDepth(3)
          .setInteractive({ useHandCursor: true });

        this.petBathSprite.on('pointerdown', (pointer) => {
          if (!this.isWorldPointer(pointer)) return;
          pointer?.event?.stopPropagation?.();
          const st = mapConfig.petStations?.find(s => s.type === 'bath');
          if (st) this.handlePetStationInteraction(st);
        });
        // Reuse the actual front of the tub as an occlusion layer. The dog is
        // between the rear water and this lip, rather than pasted on the step.
        this.petBathFront = this.add.image(bathX, bathY, 'prop_pet_bath')
          .setScale(bathScale).setOrigin(0.5).setCrop(0, 400, 751, 408)
          .setDepth(7).setVisible(false);
      }
      this.petBathWaterEffect = new PetBathWaterEffect(this, {
        x: bathX,
        y: bathY,
        scale: bathScale
      });

      // 5g. Khởi tạo Bồn Cầu Thú Cưng Mới (prop_pet_toilet) dời ra bên hông nhà
      const toiletStation = mapConfig.petStations?.find(s => s.type === 'potty');
      const toiletX = toiletStation?.x ?? 1040;
      const toiletY = toiletStation?.y ?? 365;

      // Bóng đổ dưới bồn cầu
      this.petToiletShadow = createGroundShadow(this, toiletX, toiletY + 30, 68, 24, 0.68).setDepth(2);

      if (this.textures.exists('prop_pet_toilet')) {
        this.petToiletSprite = this.add.image(toiletX, toiletY, 'prop_pet_toilet')
          .setDisplaySize(68, 88)
          .setOrigin(0.5, 0.5)
          .setDepth(3)
          .setInteractive({ useHandCursor: true });

        this.petToiletSprite.on('pointerdown', (pointer) => {
          if (!this.isWorldPointer(pointer)) return;
          pointer?.event?.stopPropagation?.();
          const st = mapConfig.petStations?.find(s => s.type === 'potty');
          if (st) this.handlePetStationInteraction(st);
        });
      }

      // 5h. Khởi tạo Chỗ Nằm Thú Cưng (Đệm Ngủ Ấm Áp) & Hiệu Ứng Giấc Ngủ
      const bedX = 578;
      const bedY = 360;

      // Bóng đổ chân thực rõ nét dưới phao nằm (GroundShadow)
      this.petBedShadow = createGroundShadow(this, bedX, bedY + 36, 148, 42, 0.72);
      this.petBedShadow.setDepth(2);

      // Phao ngủ (138 x 106 px) cho cún nằm vừa vặn, êm ái
      if (this.textures.exists('prop_pet_bed')) {
        this.petBedSprite = this.add.image(bedX, bedY, 'prop_pet_bed')
          .setDisplaySize(138, 106)
          .setOrigin(0.5, 0.5)
          .setDepth(3)
          .setInteractive(new Phaser.Geom.Circle(149, 114, 110), Phaser.Geom.Circle.Contains, { useHandCursor: true });

        this.petBedSprite.on('pointerdown', (pointer) => {
          if (!this.isWorldPointer(pointer)) return;
          pointer?.event?.stopPropagation?.();
          this.openPetSleepConfirmDialog();
        });
      }

      this.petBedSleepEffect = new PetBedSleepEffect(this, {
        x: bedX,
        y: bedY - 32,
        scale: 0.32
      });

      // 5i. Khởi tạo Trái Banh Cầu Vồng Tương Tác & Lăn 8 Hướng (ToyBall)
      this.toyBall = new ToyBall(this, 770, 565);
    }

    this.events.once('shutdown', () => {
      if (this.windowListeners && this.windowListeners.length > 0) {
        this.windowListeners.forEach(({ eventName, handler }) => {
          window.removeEventListener(eventName, handler);
        });
        this.windowListeners = [];
      }
      if (this.petSleepModal) {
        this.petSleepModal.hide();
        this.petSleepModal = null;
      }
      if (this.fireworkCelebration) {
        this.fireworkCelebration.stop();
      }
      this.interruptPetStationAction(false);
      if (this.petBedShadow) {
        this.petBedShadow.destroy();
        this.petBedShadow = null;
      }
      if (this.petBathShadow) {
        this.petBathShadow.destroy();
        this.petBathShadow = null;
      }
      if (this.petToiletShadow) {
        this.petToiletShadow.destroy();
        this.petToiletShadow = null;
      }
      if (this.petToiletSprite) {
        this.petToiletSprite.destroy();
        this.petToiletSprite = null;
      }
      if (this.petBathWaterEffect) {
        this.petBathWaterEffect.destroy();
        this.petBathWaterEffect = null;
      }
      if (this.petBathSprite) {
        this.petBathSprite.destroy();
        this.petBathSprite = null;
      }
      if (this.petBedSleepEffect) {
        this.petBedSleepEffect.destroy();
        this.petBedSleepEffect = null;
      }
      if (this.petBedSprite) {
        this.petBedSprite.destroy();
        this.petBedSprite = null;
      }
      if (this.toyBall) {
        this.toyBall.destroy();
        this.toyBall = null;
      }
      if (this.fireflyEffect) {
        this.fireflyEffect.destroy();
        this.fireflyEffect = null;
      }
      if (this.cloudEffect) {
        this.cloudEffect.destroy();
        this.cloudEffect = null;
      }
      if (this.lakeWaterEffect) {
        this.lakeWaterEffect.destroy();
        this.lakeWaterEffect = null;
      }
      if (Array.isArray(this.butterflies)) {
        this.butterflies.forEach(b => {
          if (b && typeof b.destroy === 'function') b.destroy();
        });
        this.butterflies = [];
      }
      if (Array.isArray(this.pondFishes)) {
        this.pondFishes.forEach(f => f?.destroy?.());
        this.pondFishes = [];
      }
      if (this.dockStartFishingBtnEl) {
        this.dockStartFishingBtnEl.remove();
        this.dockStartFishingBtnEl = null;
      }
      if (this._onBasketFullNotice) {
        window.removeEventListener('game:basket-full-notice', this._onBasketFullNotice);
        this._onBasketFullNotice = null;
      }
      document.getElementById('basket-full-notice-modal')?.remove();
      this.stopOnMapFishing?.();
    });

    this._onBasketFullNotice = () => this.showBasketFullNoticeModal();
    window.addEventListener('game:basket-full-notice', this._onBasketFullNotice);

    // 5e. Khởi tạo các Trạm Chăm Sóc Thú Cưng Nông Trại (Pet Farm Stations)
    this.petStationContainers = [];
    if (Array.isArray(mapConfig.petStations) && mapConfig.petStations.length > 0) {
      if (this.pet) {
        this.pet.setVisible(true);
        this.pet.setMode('farm_roam');
        this.pet.setFarmStations(mapConfig.petStations);
      }
      this.initPetFarmStations(mapConfig.petStations);
    }

    // 5h. Khởi tạo các Trạm Chức Năng Căn Bếp (Kitchen Stations)
    this.kitchenStationContainers = [];
    if (Array.isArray(mapConfig.kitchenStations) && mapConfig.kitchenStations.length > 0) {
      this.initKitchenStations(mapConfig.kitchenStations);
      // Tự động mở Pop-up Chào Mừng & Hướng Dẫn khi bé vừa bước vào Căn Bếp
      this.time.delayedCall(450, () => {
        if (this.currentMapId === 'map_kitchen' && this.sys?.isActive()) {
          window.dispatchEvent(new CustomEvent('game:open-kitchen-station-popup', { detail: { station: 'kitchen_enter' } }));
        }
      });
    }

    // 5i. Khởi tạo các Trạm Hồ Câu Lá Sen (Fishing Pond Stations)
    this.fishingStationContainers = [];
    if (Array.isArray(mapConfig.fishingStations) && mapConfig.fishingStations.length > 0) {
      this.initFishingPondStations(mapConfig.fishingStations, mapConfig.pondWaterZone);
    }

    // 5j. Khởi tạo các Trạm Chợ Cầu Vồng (Rainbow Market Stations)
    this.marketStationContainers = [];
    if (Array.isArray(mapConfig.marketStations) && mapConfig.marketStations.length > 0) {
      this.initRainbowMarketStations(mapConfig.marketStations);
    }

    // 5g. Đã xóa bỏ đường vẽ theo yêu cầu người dùng (giữ nguyên nền gạch Chợ tự nhiên, sạch sẽ)

    // 5k. Khởi tạo các Trạm Phố Thời Trang Cầu Vồng (Fashion Street Stations)
    this.fashionStationContainers = [];
    if (Array.isArray(mapConfig.fashionStations) && mapConfig.fashionStations.length > 0) {
      this.initFashionStreetStations(mapConfig.fashionStations);
    }

    this.encounterCooldownUntil = 0;

    // 6. Khởi tạo quái vật thường / bạn cần giải cứu
    this.monsters = [];
    mapConfig.encounters.forEach((enc) => {
      const monster = new Monster(this, enc, enc.spriteKey || 'mon_sprout');
      monster.onInteract((encounterData) => {
        if (!this.isExploring) return;
        this.encounterCooldownUntil = 0;
        this.triggerEncounterPrompt(encounterData, false);
      });
      if (saveState.campaign.rescuedFriends?.[enc.id]) {
        monster.isRescued = true;
        monster.destroy();
      }
      this.monsters.push(monster);
    });

    // 7. Khởi tạo Boss (Chỉ xuất hiện khi đã giải cứu hết quái nhỏ)
    if (mapConfig.boss) {
      this.boss = new Boss(this, mapConfig.boss, mapConfig.boss.spriteKey || 'boss_dragon');
      this.boss.onInteract((bossData, phase) => {
        if (!this.isExploring || !this.boss.isAppeared) return;
        this.encounterCooldownUntil = 0;

        const phaseConfig = bossData.phases ? bossData.phases[phase - 1] : null;
        const questionId = phaseConfig ? phaseConfig.questionId : bossData.questionId;
        this.triggerEncounterPrompt({
          ...bossData,
          questionId,
          name: phaseConfig ? phaseConfig.name : bossData.name
        }, true);
      });

      if (saveState.campaign.rescuedFriends?.[mapConfig.boss.id]) {
        this.boss.isRescued = true;
        this.boss.destroy();
      } else {
        const totalSmallMonsters = mapConfig.encounters.length;
        const rescuedCount = mapConfig.encounters.filter(enc => saveState.campaign.rescuedFriends?.[enc.id]).length;
        // Phải tiêu diệt / giải cứu hết TẤT CẢ quái vật nhỏ thì Boss lớn mới xuất hiện!
        if (totalSmallMonsters > 0 && rescuedCount < totalSmallMonsters) {
          this.boss.hide();
        }
      }
    }

    // 8. Điều khiển bàn phím an toàn cho mọi thiết bị (máy tính, tablet, cảm ứng)
    const dummyKey = { isDown: false };
    this.cursors = this.input?.keyboard ? this.input.keyboard.createCursorKeys() : {
      up: dummyKey, down: dummyKey, left: dummyKey, right: dummyKey
    };
    this.wasd = this.input?.keyboard ? this.input.keyboard.addKeys('W,A,S,D') : {
      W: dummyKey, A: dummyKey, S: dummyKey, D: dummyKey
    };

    // 9. Điều khiển cảm ứng (Tap/Click to move)
    this.input.on('pointerdown', (pointer) => {
      if (!this.isWorldPointer(pointer)) return;
      // Bé vẫn có thể đi lại tự do khi đang câu cá trên bản đồ hồ câu
      const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

      const nearMonster = this.monsters.some(m => Math.hypot(point.x - m.sprite.x, point.y - m.sprite.y) < 110);
      const nearBoss = this.boss && this.boss.isAppeared && Math.hypot(point.x - this.boss.sprite.x, point.y - this.boss.sprite.y) < 125;
      const nearPuzzle = this.propsPuzzle && Math.hypot(point.x - this.propsPuzzle.x, point.y - this.propsPuzzle.y) < 80;
      const nearProp = this.propsList && this.propsList.some(p => Math.hypot(point.x - p.x, point.y - p.y) < 65);
      const clickedPortal = (this.portals && this.portals.length > 0)
        ? this.portals.find(p => p && Math.hypot(point.x - p.x, point.y - p.y) < 75)
        : (this.teleportPortal && Math.hypot(point.x - this.teleportPortal.x, point.y - this.teleportPortal.y) < 75 ? this.teleportPortal : null);
      if (clickedPortal) {
        clickedPortal.handleInteract();
        return;
      }
      // Kiểm tra chạm trực tiếp vào trạm bếp trong map_kitchen
      if (this.currentMapId === 'map_kitchen' && this.kitchenStationContainers) {
        const clickedKitchen = this.kitchenStationContainers.find(st => {
          if (st.data.type === 'pantry') {
            return (point.x >= 305 && point.x <= 455 && point.y >= 80 && point.y <= 360) ||
                   Math.hypot(point.x - st.data.x, point.y - st.data.y) < 85;
          }
          if (st.data.type === 'prep') {
            return (point.x >= 525 && point.x <= 685 && point.y >= 70 && point.y <= 210) ||
                   Math.hypot(point.x - st.data.x, point.y - st.data.y) < 85;
          }
          if (st.data.type === 'cook') {
            return (point.x >= 650 && point.x <= 1120 && point.y >= 100 && point.y <= 360) ||
                   Math.hypot(point.x - st.data.x, point.y - st.data.y) < 140;
          }
          return Math.hypot(point.x - st.data.x, point.y - st.data.y) < 110;
        });
        if (clickedKitchen) {
          this.handleKitchenStationInteraction(clickedKitchen.data);
          return;
        }
      }
      // Kiểm tra chạm trực tiếp vào trạm trên Nông Trại thú cưng
      if (this.currentMapId === 'map_pet_farm' && this.petStationContainers) {
        const clickedPet = this.petStationContainers.find(st => {
          const r = st.data.type === 'water' ? 120 : (st.data.type === 'bath' ? 100 : 85);
          return Math.hypot(point.x - st.data.x, point.y - st.data.y) < r;
        });
        if (clickedPet) {
          this.handlePetStationInteraction(clickedPet.data);
          return;
        }
      }

      // Kiểm tra chạm trực tiếp vào trạm trên Hồ Câu Lá Sen
      if (this.currentMapId === 'map_fishing_pond' && this.fishingStationContainers) {
        // Nếu chạm vào bất kỳ đâu trên cầu gỗ hoặc gần điểm câu
        const isOnDockArea = (mapConfig.pondWaterZone && this.isPointOnPondDock(point.x, point.y, mapConfig.pondWaterZone))
          || (point.x >= 615 && point.x <= 830 && point.y >= 290 && point.y <= 425)
          || (this.fishingDockBlueCircle && Math.hypot(point.x - 688, point.y - 398) < 80)
          || Math.hypot(point.x - 688, point.y - 360) < 85;
        if (isOnDockArea) {
          const dockSt = (mapConfig.fishingStations || []).find(s => s.id === 'station_lotus_dock') || {
            id: 'station_lotus_dock',
            type: 'dock',
            dockId: 'lotus_dock',
            x: 688,
            y: 360,
            interactionPoint: { x: 688, y: 360 },
            castTarget: { x: 485, y: 445 }
          };
          this.handleFishingStationInteraction(dockSt);
          return;
        }
        const clickedFishing = this.fishingStationContainers.find(st =>
          st.container?.visible !== false && Math.hypot(point.x - st.data.x, point.y - st.data.y) < 76
        );
        if (clickedFishing) {
          this.handleFishingStationInteraction(clickedFishing.data);
          return;
        }
      }

      // Kiểm tra chạm trực tiếp vào trạm trên Chợ Cầu Vồng
      if (this.currentMapId === 'map_rainbow_market' && this.marketStationContainers) {
        const clickedMarket = this.marketStationContainers.find(st =>
          Math.hypot(point.x - st.data.x, point.y - st.data.y) < 105
        );
        if (clickedMarket) {
          this.handleMarketStationInteraction(clickedMarket.data);
          return;
        }
      }

      // Kiểm tra chạm trực tiếp vào trạm trên Phố Thời Trang
      if (this.currentMapId === 'map_fashion_street' && this.fashionStationContainers) {
        const clickedFashion = this.fashionStationContainers.find(st =>
          Math.hypot(point.x - st.data.x, point.y - st.data.y) < 105
        );
        if (clickedFashion) {
          this.handleFashionStationInteraction(clickedFashion.data);
          return;
        }
      }

      const nearStation = this.petStationContainers && this.petStationContainers.some(st => Math.hypot(point.x - st.data.x, point.y - st.data.y) < 85);
      const nearKitchenStation = this.kitchenStationContainers && this.kitchenStationContainers.some(st => {
        if (st.data.type === 'pantry') {
          return (point.x >= 305 && point.x <= 455 && point.y >= 80 && point.y <= 360) ||
                 Math.hypot(point.x - st.data.x, point.y - st.data.y) < 85;
        }
        if (st.data.type === 'prep') {
          return (point.x >= 525 && point.x <= 685 && point.y >= 70 && point.y <= 210) ||
                 Math.hypot(point.x - st.data.x, point.y - st.data.y) < 85;
        }
        if (st.data.type === 'cook') {
          return (point.x >= 650 && point.x <= 1120 && point.y >= 100 && point.y <= 360) ||
                 Math.hypot(point.x - st.data.x, point.y - st.data.y) < 140;
        }
        return Math.hypot(point.x - st.data.x, point.y - st.data.y) < 110;
      });

      if (nearMonster || nearBoss || nearPuzzle || nearProp || nearStation || nearKitchenStation) return;

      let targetX = point.x;
      let targetY = point.y;
      if (this.currentMapId === 'map1' || !this.currentMapId) {
        if (isPointInLake(targetX, targetY)) {
          const safe = clampOutOfLake(targetX, targetY, 15);
          targetX = safe.x;
          targetY = safe.y;
        }
      } else if (this.currentMapId === 'map_fishing_pond' && mapConfig.pondWaterZone) {
        const clamped = this.clampOutOfFishingPondWater(targetX, targetY, mapConfig.pondWaterZone);
        targetX = clamped.x;
        targetY = clamped.y;
      }

      this.hero.moveTo(targetX, targetY);
    });

    // 11. Lắng nghe các sự kiện giao diện
    this.initEventListeners();

    this.setWorldScale();
    } catch (sceneErr) {
      console.error('[WorldScene] Lỗi khi tạo cảnh:', sceneErr);
      try {
        this.drawFallbackBackground();
        if (!this.hero) {
          const spawn = this.mapConfig?.heroSpawn || { x: 380, y: 510 };
          this.hero = new Hero(this, spawn.x, spawn.y);
        }
      } catch (fbErr) {
        console.error('[WorldScene] Lỗi fallback khẩn cấp:', fbErr);
      }
    } finally {
      try {
        this.setWorldScale?.();
      } catch {}
      // Báo hiệu bản đồ đã sẵn sàng 100% để UI / HUD luôn được kích hoạt
      window.dispatchEvent(new CustomEvent('game:map-ready', {
        detail: { mapConfig: this.mapConfig || getMapConfig(this.currentMapId) }
      }));
    }
  }

  initEventListeners() {
    // 1. Quái thường được giải cứu
    this.addManagedListener('game:encounter-resolved', (e) => {
      const { encounterId } = e.detail || {};
      const monster = this.monsters.find(m => m.data.id === encounterId);
      if (monster) {
        monster.isRescued = true;
        monster.playRescueAnimation();
      }
      if (this.pet) {
        this.pet.celebrate();
      }

      // Rung màn hình thế giới và rung xúc giác khi đánh bại quái vật giải cứu thành công
      if (this.cameras?.main) {
        this.cameras.main.shake(380, 0.010);
      }
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try { navigator.vibrate([40, 30, 60]); } catch {}
      }

      const mapConfig = getMapConfig(this.currentMapId);
      const state = saveAdapter.load();

      const inSceneRescuedIds = this.monsters.filter(m => m.isRescued).map(m => m.data.id);
      const mergedRescuedMap = { ...(state.campaign?.rescuedFriends || {}) };
      if (encounterId) {
        mergedRescuedMap[encounterId] = { rescuedAt: Date.now() };
      }
      inSceneRescuedIds.forEach(id => {
        if (!mergedRescuedMap[id]) mergedRescuedMap[id] = { rescuedAt: Date.now() };
      });

      if (this.propsPuzzle) {
        this.propsPuzzle.checkUnlockCondition(mergedRescuedMap);
      }

      // Phải tiêu diệt / giải cứu hết TẤT CẢ quái vật con nhỏ thì Boss lớn mới xuất hiện!
      const totalSmallMonsters = mapConfig.encounters.length;
      const rescuedCount = mapConfig.encounters.filter(enc => Boolean(mergedRescuedMap[enc.id])).length;
      const canBossAppear = totalSmallMonsters > 0 && rescuedCount >= totalSmallMonsters;

      if (canBossAppear && this.boss && !this.boss.isRescued && !this.boss.isAppeared) {
        setTimeout(() => {
          this.boss.appearWithCinematic(() => {
            window.dispatchEvent(new CustomEvent('game:show-toast', {
              detail: { message: `🔥 ${this.boss.data.name.toUpperCase()} ĐÃ XUẤT HIỆN! Bé hãy sẵn sàng cho Đại Thử Thách nhé!` }
            }));
          });
        }, 900);
      }
      this.isExploring = true;
    });

    // 2. Boss chuyển sang Pha 2
    this.addManagedListener('game:boss-phase-advance', () => {
      if (this.boss) {
        this.boss.transitionToPhase2();
      }
    });

    // 3. Boss được giải cứu hoàn toàn
    this.addManagedListener('game:boss-resolved', (e) => {
      const { bossName, reward, unlockedNewMap } = e.detail || {};
      const mapCfg = this.mapConfig || getMapConfig(this.currentMapId);

      const bossDeathX = (this.boss && this.boss.sprite?.active) ? this.boss.sprite.x : (mapCfg.boss?.x ?? 960);
      const bossDeathY = (this.boss && this.boss.sprite?.active) ? this.boss.sprite.y : (mapCfg.boss?.y ?? 360);

      try {
        const state = saveAdapter.load();
        if (state?.campaign) {
          state.campaign.completedMaps = state.campaign.completedMaps || [];
          if (!state.campaign.completedMaps.includes(this.currentMapId)) {
            state.campaign.completedMaps.push(this.currentMapId);
          }
        }
        if (state?.campaign && mapCfg.boss?.id) {
          state.campaign.bossDeathPositions = state.campaign.bossDeathPositions || {};
          state.campaign.bossDeathPositions[mapCfg.boss.id] = { x: bossDeathX, y: bossDeathY };
          state.campaign.rescuedFriends = state.campaign.rescuedFriends || {};
          state.campaign.rescuedFriends[mapCfg.boss.id] = { name: bossName || mapCfg.boss.name, rescuedAt: Date.now() };
          saveAdapter.save(state);
        }
      } catch (err) {
        console.warn('Could not save boss death position:', err);
      }

      if (this.boss) {
        this.boss.playRescueAnimation();
      }
      if (this.pet) {
        this.pet.celebrate();
      }

      // Kích hoạt pháo hoa PixelFX (explosions/firework-rocket) ăn mừng hạ gục Boss rực rỡ!
      if (!this.fireworkCelebration) {
        this.fireworkCelebration = new FireworkCelebrationEffect();
        window.__fireworkCelebration = this.fireworkCelebration;
      }
      this.fireworkCelebration.launchSequence({
        bossX: bossDeathX,
        bossY: bossDeathY,
        count: 4,
        audioService: window.__audioService
      });

      // Rung chấn động đỉnh cao khi hạ gục Boss vượt ải toàn map
      if (this.cameras?.main) {
        this.cameras.main.shake(650, 0.018);
      }
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try { navigator.vibrate([80, 50, 120, 60, 200]); } catch {}
      }
      this.isExploring = true;

      if (mapCfg.teleportPortal) {
        if (!this.teleportPortal) {
          this.teleportPortal = new TeleportPortal(this, {
            ...mapCfg.teleportPortal,
            x: bossDeathX,
            y: bossDeathY
          });
          this.teleportPortal.spawnAt(bossDeathX, bossDeathY);
          this.portals.push(this.teleportPortal);
        } else {
          this.teleportPortal.spawnAt(bossDeathX, bossDeathY);
          if (!this.portals.includes(this.teleportPortal)) {
            this.portals.push(this.teleportPortal);
          }
        }
      }

      const currentZoneConfig = CAMPAIGN_ZONES[this.currentMapId] || {};
      const zoneDisplayName = currentZoneConfig.name || mapCfg.name || 'Vùng Đất';
      const friendNames = (mapCfg.encounters || []).map(e => e.name).concat([bossName || mapCfg.boss?.name || 'Trùm']);
      const nextMapId = unlockedNewMap || currentZoneConfig.nextZoneId || 'map2';
      const nextMapName = CAMPAIGN_ZONES[nextMapId]?.name || 'Vùng Đất Mới';

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('game:show-recap', {
          detail: {
            title: `CHIẾN THẮNG ${zoneDisplayName.toUpperCase()}! 🎉`,
            rescuedFriends: friendNames,
            learningSummary: currentZoneConfig.learningFocus ? `Bé đã rất giỏi về: ${currentZoneConfig.learningFocus}!` : 'Bé đã xuất sắc hoàn thành tất cả thử thách!',
            reward,
            unlockedNewMap: nextMapId,
            unlockedMapName: nextMapName
          }
        }));
      }, 2200);
    });

    // 4. Khi đóng dialog câu hỏi hoặc bấm "Để sau nhé"
    this.addManagedListener('game:encounter-retreat', (e) => {
      const { encounter, isBoss } = e.detail || {};
      this.handleEncounterRetreat(encounter, isBoss);
    });

    this.addManagedListener('game:encounter-closed', () => {
      this.isExploring = true;
      this.monsters.forEach(m => m.resumePatrol?.());
      if (this.boss) this.boss.resumePatrol?.();
    });

    // 5. Thưởng khi tương tác với Rương Thần Kỳ hoặc Props
    this.addManagedListener('game:prop-reward', (e) => {
      const { reward } = e.detail || {};
      const state = saveAdapter.load();
      if (reward?.stars && state?.progression) {
        state.progression.stars = (state.progression.stars || 0) + reward.stars;
        state.progression.exp = (state.progression.exp || 0) + (reward.exp || 15);
        saveAdapter.save(state);
      }
    });

    // 6. Hiệu ứng khi Bé Sâu bước vào Cổng Dịch Chuyển Cầu Vồng (VFX Implosion & Hút nhân vật vào cổng)
    this.addManagedListener('game:portal-warp-start', (e) => {
      const { portalX, portalY } = e.detail || {};
      this.isExploring = false;
      const targetX = portalX !== undefined ? portalX : (this.teleportPortal ? this.teleportPortal.x : this.hero?.getX() || 640);
      const targetY = portalY !== undefined ? portalY : (this.teleportPortal ? this.teleportPortal.y : this.hero?.getY() || 360);

      // Kích hoạt hiệu ứng VFX explosions/implosion rực rỡ tại tâm cổng thần kỳ
      this.playPortalImplosionVFX(targetX, targetY);

      if (this.hero) {
        if (typeof this.hero.onPortalWarpStart === 'function') {
          this.hero.onPortalWarpStart({ targetX, targetY: targetY + 10, duration: 850 });
        } else {
          this.hero.stop();
        }
      }

      // Nếu có bạn thú cưng đi cùng (Pet Dog / Bunny), cũng bị hút theo vào Cổng Thần Kỳ
      if (this.pet && this.pet.sprite && this.pet.sprite.visible) {
        this.tweens.add({
          targets: [this.pet.sprite, this.pet.shadow].filter(Boolean),
          x: targetX,
          y: targetY,
          scaleX: 0,
          scaleY: 0,
          angle: 720,
          alpha: 0,
          duration: 800,
          delay: 80,
          ease: 'Quad.easeIn'
        });
      }
    });

    // 7. Khi hoàn tất dịch chuyển sang map mới
    this.addManagedListener('game:portal-warp-complete', () => {
      this.isExploring = true;
      if (this.hero) {
        if (typeof this.hero.onPortalWarpComplete === 'function') {
          this.hero.onPortalWarpComplete();
        } else {
          this.hero.isMoving = false;
          this.hero.restoreDisplaySize();
        }
      }
    });

    // 7b. Hiệu ứng khi Bé Thăng Cấp (ui/level-up VFX trên đầu nhân vật)
    this.addManagedListener('game:player-level-up', (e) => {
      this.playHeroLevelUpVFX(e.detail?.level);
    });
    this.addManagedListener('hero:level-up', (e) => {
      this.playHeroLevelUpVFX(e.detail?.level);
    });

    // 8. Lắng nghe khi bé ăn món ăn tại Bếp Cầu Vồng để hiển thị hiệu ứng chúc mừng sinh động
    this.addManagedListener('game:dish-eaten', () => {
      if (this.currentMapId !== 'map_kitchen' || !this.hero?.sprite) return;
      
      // Hoạt ảnh Bé Sâu nhảy mừng
      this.tweens.add({
        targets: this.hero.sprite,
        y: this.hero.sprite.y - 18,
        yoyo: true,
        repeat: 2,
        duration: 180,
        ease: 'Back.easeOut'
      });

      // Hiệu ứng tim đỏ, tim vàng và tia sét năng lượng bay lên
      const icons = ['❤️', '💛', '⚡', '✨'];
      for (let i = 0; i < 8; i++) {
        const iconText = icons[i % icons.length];
        const fx = this.add.text(
          this.hero.sprite.x + Phaser.Math.Between(-35, 35),
          this.hero.sprite.y - 20 + Phaser.Math.Between(-15, 15),
          iconText,
          { fontSize: `${Phaser.Math.Between(18, 26)}px` }
        ).setOrigin(0.5).setDepth(20);

        this.tweens.add({
          targets: fx,
          y: fx.y - Phaser.Math.Between(45, 80),
          x: fx.x + Phaser.Math.Between(-25, 25),
          alpha: 0,
          scaleX: 1.4,
          scaleY: 1.4,
          duration: Phaser.Math.Between(900, 1400),
          ease: 'Sine.easeOut',
          onComplete: () => fx.destroy()
        });
      }
    });

    // Care modal and farm gauges share exactly the same station flow.
    this.addManagedListener('game:pet-action-requested', (e) => {
      if (this.currentMapId !== 'map_pet_farm' || !this.sys.isActive()) return;
      const type = { drink: 'water', bathe: 'bath', potty: 'potty' }[e.detail?.action];
      if (!type) return;
      const station = this.mapConfig?.petStations?.find(s => s.type === type || (type === 'potty' && s.type === 'toilet'));
      if (station) this.handlePetStationInteraction(station);
    });
  }

  /**
   * Phát hiệu ứng ui/level-up VFX (97 frames pixel-art VFX) trên đầu nhân vật khi lên cấp
   */
  playHeroLevelUpVFX(level) {
    if (this.hero && typeof this.hero.playLevelUpVFX === 'function') {
      return this.hero.playLevelUpVFX();
    }
    return null;
  }

  /**
   * Hiệu ứng VFX explosions/implosion (Sprite 51 frames + Xoáy sáng + Bụi sao ma thuật)
   * Kích hoạt khi Bé Sâu bước qua Cổng Thần Kỳ và bị hút vào tâm vòng xoáy
   */
  playPortalImplosionVFX(x, y) {
    if (!this.anims.exists('vfx_implosion_anim')) {
      if (this.textures.exists('vfx_implosion_sheet')) {
        this.anims.create({
          key: 'vfx_implosion_anim',
          frames: this.anims.generateFrameNumbers('vfx_implosion_sheet', { start: 0, end: 50 }),
          frameRate: 30,
          repeat: 0
        });
      }
    }

    if (this.anims.exists('vfx_implosion_anim')) {
      // 1. Sprite VFX Implosion chính (51 frames pixel-art VFX)
      const implosion = this.add.sprite(x, y - 6, 'vfx_implosion_sheet');
      implosion.setDepth(26); // Nổi rõ rệt trên Hero (depth 10) và Cổng (depth 8)
      implosion.setScale(1.25); // Phóng nhẹ để bao trọn Cổng 84px và ôm trọn nhân vật
      implosion.play('vfx_implosion_anim');

      // 2. Vòng xoáy ma thuật phát sáng bổ trợ (Aura Pulse Ring)
      const pulseRing = this.add.circle(x, y - 4, 65, 0x9333ea, 0);
      pulseRing.setStrokeStyle(3.5, 0xc084fc, 0.92).setDepth(24);
      this.tweens.add({
        targets: pulseRing,
        scale: 0.08,
        alpha: 1,
        duration: 800,
        ease: 'Quad.easeIn',
        onComplete: () => pulseRing.destroy()
      });

      // 3. Hiệu ứng hạt bụi sáng xoáy vào tâm (Inward swirling sparks)
      const sparkColors = [0xfacc15, 0x38bdf8, 0xf43f5e, 0xa855f7, 0xffffff];
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2;
        const dist = 75 + Math.random() * 30;
        const spark = this.add.circle(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 3, sparkColors[i % sparkColors.length], 0.95).setDepth(27);
        this.tweens.add({
          targets: spark,
          x,
          y: y - 6,
          scale: 0.15,
          alpha: 0,
          duration: 650 + Math.random() * 200,
          ease: 'Quad.easeIn',
          onComplete: () => spark.destroy()
        });
      }

      implosion.on('animationcomplete', () => {
        implosion.destroy();
      });
    }
  }

  triggerEncounterPrompt(encounterData, isBoss = false) {
    this.isExploring = false;
    if (this.hero) this.hero.stop();
    this.monsters.forEach(m => m.pausePatrol?.());
    if (this.boss) this.boss.pausePatrol?.();
    window.dispatchEvent(new CustomEvent('game:encounter-prompt', {
      detail: { encounter: encounterData, isBoss }
    }));
  }

  handleEncounterRetreat(encounter, isBoss) {
    this.encounterCooldownUntil = Date.now() + 3000;
    this.isExploring = true;
    this.monsters.forEach(m => m.resumePatrol?.());
    if (this.boss) this.boss.resumePatrol?.();

    if (!this.hero || !this.hero.sprite?.active) return;

    let targetX = encounter?.x;
    let targetY = encounter?.y;
    if (isBoss && this.boss?.sprite?.active) {
      targetX = this.boss.sprite.x;
      targetY = this.boss.sprite.y;
    } else if (encounter?.id) {
      const monster = this.monsters.find(m => m.data?.id === encounter.id);
      if (monster?.sprite?.active) {
        targetX = monster.sprite.x;
        targetY = monster.sprite.y;
      }
    }

    const heroX = this.hero.getX();
    const heroY = this.hero.getY();

    if (this.currentMapId === 'map_kitchen' && Array.isArray(this.mapConfig?.kitchenStations)) {
      const targetStations = this.mapConfig.kitchenStations.filter(s => s.type === 'pantry' || s.type === 'prep');
      if (this.activeKitchenProximityId) {
        const activeSt = targetStations.find(s => s.id === this.activeKitchenProximityId);
        if (!activeSt || Math.hypot(heroX - activeSt.x, heroY - activeSt.y) > 70) {
          this.activeKitchenProximityId = null;
        }
      } else if (dirX !== 0 || dirY !== 0) {
        const enteredSt = targetStations.find(s => Math.hypot(heroX - s.x, heroY - s.y) <= 45);
        if (enteredSt) {
          this.activeKitchenProximityId = enteredSt.id;
          this.hero.stop();
          this.openKitchenStationInteraction(enteredSt);
          return;
        }
      }
    }

    let dx = heroX - (targetX ?? heroX);
    let dy = heroY - (targetY ?? heroY);
    const dist = Math.hypot(dx, dy);

    if (dist < 10) {
      dx = -1;
      dy = 0.5;
    } else {
      dx /= dist;
      dy /= dist;
    }

    const pushDist = 65;
    const bounds = this.physics?.world?.bounds || { width: 1280, height: 720 };
    const targetHeroX = Phaser.Math.Clamp(heroX + dx * pushDist, 80, bounds.width - 80);
    const targetHeroY = Phaser.Math.Clamp(heroY + dy * pushDist, 80, bounds.height - 80);

    this.hero.stop();

    this.tweens.add({
      targets: [this.hero.sprite, this.hero.shadow].filter(Boolean),
      x: targetHeroX,
      y: targetHeroY,
      duration: 350,
      ease: 'Power2.easeOut',
      onComplete: () => {
        if (this.hero?.sprite?.active) {
          this.hero.sprite.x = targetHeroX;
          this.hero.sprite.y = targetHeroY;
          this.hero.updateShadow();
        }
      }
    });
  }

  triggerEncounter(encounterData, monster) {
    this.triggerEncounterPrompt(encounterData, false);
  }

  triggerBossEncounter(bossData, phase) {
    const phaseConfig = bossData.phases ? bossData.phases[phase - 1] : null;
    const questionId = phaseConfig ? phaseConfig.questionId : bossData.questionId;
    this.triggerEncounterPrompt({
      ...bossData,
      questionId,
      name: phaseConfig ? phaseConfig.name : bossData.name
    }, true);
  }

  drawFallbackBackground() {
    const gfx = this.add.graphics().setDepth(-10);
    gfx.fillGradientStyle(0xc8e8bf, 0xc8e8bf, 0x78b894, 0x78b894, 1);
    gfx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    gfx.fillStyle(0xf3e7bd, 1);
    gfx.fillEllipse(640, 610, 990, 240);
  }

  createDecorations() {
    const container = this.add.container(0, 0).setDepth(3);
    const accents = this.add.graphics();
    for (let i = 0; i < 16; i++) {
      const x = 50 + ((i * 141) % 1180);
      const y = 250 + ((i * 87) % 260);
      accents.fillStyle(i % 2 ? 0xffe6ef : 0xfff3ba, 0.7);
      accents.fillCircle(x, y, 4 + (i % 4));
    }
    container.add([accents]);
  }

  createProps(mapConfig) {
    this.propsList = [];
    if (Array.isArray(mapConfig.props) && mapConfig.props.length > 0) {
      mapConfig.props.forEach((propConfig) => {
        if (this.textures.exists(propConfig.type)) {
          const prop = new PropEntity(this, propConfig);
          this.propsList.push(prop);
        }
      });
    }

    this.createRandomButterflies(mapConfig);
  }

  createRandomButterflies(mapConfig) {
    // Dọn dẹp bướm cũ nếu có
    if (Array.isArray(this.butterflies)) {
      this.butterflies.forEach(b => {
        if (b && typeof b.destroy === 'function') b.destroy();
      });
    }
    this.butterflies = [];

    // Chỉ xuất hiện random ở các maps quái (có encounters)
    // Tuyệt đối không xuất hiện ở map_pet_farm hoặc map_kitchen
    const isMonsterMap = this.currentMapId !== 'map_pet_farm' &&
      this.currentMapId !== 'map_kitchen' &&
      Array.isArray(mapConfig?.encounters) &&
      mapConfig.encounters.length > 0;

    if (!isMonsterMap) return;

    // Số lượng bướm ngẫu nhiên (2 - 4 con)
    const count = Phaser.Math.Between(2, 4);
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(160, 1120);
      const y = Phaser.Math.Between(180, 560);
      const butterfly = new Butterfly(this, x, y);
      this.butterflies.push(butterfly);
    }
  }

  setWorldScale() {
    if (!this.cameras.main) return;
    this.cameras.main.setViewport(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    this.cameras.main.setZoom(1);
    this.cameras.main.centerOn(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2);
    this.cameras.main.setBounds(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
  }

  update(time, delta) {
    if (Array.isArray(this.butterflies) && this.butterflies.length > 0) {
      for (let i = 0; i < this.butterflies.length; i++) {
        const b = this.butterflies[i];
        if (b && typeof b.update === 'function') {
          b.update(time, delta);
        }
      }
    }
    if (!this.isExploring || !this.hero?.sprite?.active) return;
    if (this.currentMapId === 'map_kitchen' && this.kitchenMotes && this.hero?.sprite) {
      const offsetX = (this.hero.sprite.x - 640);
      const offsetY = (this.hero.sprite.y - 360);
      for (const mote of this.kitchenMotes) {
        mote.x = mote.baseX - offsetX * mote.parallaxFactor;
        mote.y = mote.baseY - offsetY * mote.parallaxFactor;
      }
    }


    // Khi câu cá: nhân vật vẫn có thể tự do đi lại và khám phá quanh hồ
    const heroSpeed = this.hero.speed || 165;
    const speed = (delta / 1000) * heroSpeed;
    const rightDown = Boolean(this.cursors?.right?.isDown || this.wasd?.D?.isDown);
    const leftDown = Boolean(this.cursors?.left?.isDown || this.wasd?.A?.isDown);
    const downDown = Boolean(this.cursors?.down?.isDown || this.wasd?.S?.isDown);
    const upDown = Boolean(this.cursors?.up?.isDown || this.wasd?.W?.isDown);
    let dirX = Number(rightDown) - Number(leftDown);
    let dirY = Number(downDown) - Number(upDown);

    const jX = this.joystickVector ? this.joystickVector.x : 0;
    const jY = this.joystickVector ? this.joystickVector.y : 0;
    const jDist = Math.hypot(jX, jY);

    if (jDist > 0.12) {
      dirX = jX;
      dirY = jY;
      if (this.tweens.isTweening(this.hero.sprite)) {
        this.tweens.killTweensOf(this.hero.sprite);
      }
    }

    if (dirX !== 0 || dirY !== 0) {
      const len = Math.hypot(dirX, dirY);
      const moveFactor = jDist > 0.12 ? Math.min(1, Math.max(0.35, jDist)) : 1;
      const moveX = (dirX / len) * speed * moveFactor;
      const moveY = (dirY / len) * speed * moveFactor;
      this.hero.move(moveX, moveY, dirX, dirY);
      if (this.currentMapId === 'map_fishing_pond' && this.mapConfig?.pondWaterZone && this.hero?.sprite) {
        const clamped = this.clampOutOfFishingPondWater(this.hero.sprite.x, this.hero.sprite.y, this.mapConfig.pondWaterZone);
        if (clamped.x !== this.hero.sprite.x || clamped.y !== this.hero.sprite.y) {
          this.hero.sprite.x = clamped.x;
          this.hero.sprite.y = clamped.y;
          this.hero.updateShadow?.();
        }
      }
    } else if (this.hero.isMoving && !this.tweens.isTweening(this.hero.sprite)) {
      this.hero.stop();
    }

    if (this.hero?.coordGuide) {
      this.hero.coordGuide.update();
    }

    const heroX = this.hero.getX();
    const heroY = this.hero.getY();

    if (this.currentMapId === 'map_kitchen' && Array.isArray(this.mapConfig?.kitchenStations)) {
      const targetStations = this.mapConfig.kitchenStations.filter(s => s.type === 'pantry' || s.type === 'prep');
      if (this.activeKitchenProximityId) {
        const activeSt = targetStations.find(s => s.id === this.activeKitchenProximityId);
        if (!activeSt || Math.hypot(heroX - activeSt.x, heroY - activeSt.y) > 70) {
          this.activeKitchenProximityId = null;
        }
      } else if (dirX !== 0 || dirY !== 0) {
        const enteredSt = targetStations.find(s => Math.hypot(heroX - s.x, heroY - s.y) <= 45);
        if (enteredSt) {
          this.activeKitchenProximityId = enteredSt.id;
          this.hero.stop();
          this.openKitchenStationInteraction(enteredSt);
          return;
        }
      }
    }

    const isUnderEncounterCooldown = this.encounterCooldownUntil && Date.now() < this.encounterCooldownUntil;

    if (!isUnderEncounterCooldown) {
      for (const monster of this.monsters) {
        if (monster.isRescued || !monster.sprite?.active) continue;
        const dist = Math.hypot(heroX - monster.sprite.x, heroY - monster.sprite.y);
        if (dist < 75) {
          this.triggerEncounterPrompt(monster.data, false);
          return;
        }
      }

      if (this.boss && !this.boss.isRescued && this.boss.sprite?.active && this.boss.isAppeared) {
        const bossDist = Math.hypot(heroX - this.boss.sprite.x, heroY - this.boss.sprite.y);
        if (bossDist < 110) {
          const phaseConfig = this.boss.data.phases ? this.boss.data.phases[this.boss.phase - 1] : null;
          const questionId = phaseConfig ? phaseConfig.questionId : this.boss.data.questionId;
          this.triggerEncounterPrompt({
            ...this.boss.data,
            questionId,
            name: phaseConfig ? phaseConfig.name : this.boss.data.name
          }, true);
          return;
        }
      }
    }

    if (this.portals && this.portals.length > 0) {
      for (const portal of this.portals) {
        portal.update(heroX, heroY);
      }
    } else if (this.teleportPortal) {
      this.teleportPortal.update(heroX, heroY);
    }

    if (this.fireflyEffect) {
      this.fireflyEffect.update(time, delta, heroX, heroY);
    }

    if (this.cloudEffect) {
      this.cloudEffect.update(time, delta);
    }

    if (this.pet) {
      this.pet.update(time, delta, this.cachedPetStats || {});
      if (this.currentMapId === 'map_fishing_pond' && this.mapConfig?.pondWaterZone && this.pet?.sprite) {
        const clampedPet = this.clampOutOfFishingPondWater(this.pet.sprite.x, this.pet.sprite.y, this.mapConfig.pondWaterZone, false);
        if (clampedPet.x !== this.pet.sprite.x || clampedPet.y !== this.pet.sprite.y) {
          this.pet.sprite.x = clampedPet.x;
          this.pet.sprite.y = clampedPet.y;
          if (this.pet.shadow) {
            this.pet.shadow.x = clampedPet.x;
            this.pet.shadow.y = clampedPet.y + 32;
          }
        }
      }
    }

    if (this.currentMapId === 'map_fishing_pond') {
      if (Array.isArray(this.pondFishes)) {
        for (let i = 0; i < this.pondFishes.length; i++) {
          this.pondFishes[i]?.update?.(delta);
        }
      }
      this.updateDockFishingProximityButton(heroX, heroY);
    }

    if (this.petBathWaterEffect) {
      this.petBathWaterEffect.update(time, delta);
    }
  }


  /**
   * Khởi tạo các trạm tương tác trong Bếp Cầu Vồng (Rửa tay, Kệ nguyên liệu, Bếp lò, Bàn ăn)
   * Thiết kế theo đúng triết lý COOKING_PLAN.md cho bé 5-6 tuổi
   */
  initKitchenStations(stations) {
    this.kitchenStationContainers = [];
    this.kitchenSteamTimers = [];

    stations.forEach((st) => {
      const container = this.add.container(st.x, st.y).setDepth(4);

      // Vòng hào quang sàn bếp: Đã xóa để sàn gỗ tự nhiên luôn sạch bóng theo yêu cầu người dùng
      const aura = null;

      // Vùng chạm cảm ứng tương tác rộng rãi (nổi trên bề mặt, bắt chạm nhạy bén)
      const touchZone = this.add.zone(st.x, st.y, 150, 120).setInteractive({ useHandCursor: true }).setDepth(15);
      touchZone.on('pointerdown', (pointer) => {
        if (!this.isWorldPointer(pointer)) return;
        pointer?.event?.stopPropagation?.();
        this.handleKitchenStationInteraction(st);
      });
      container.setSize(184, 90).setInteractive({ useHandCursor: true });
      container.on('pointerdown', (pointer) => {
        if (!this.isWorldPointer(pointer)) return;
        pointer?.event?.stopPropagation?.();
        this.handleKitchenStationInteraction(st);
      });

      // Hiệu ứng hơi khói bốc nhẹ trên Nồi Bếp Lò (Đợt B: Căn bếp sinh động)
      if (st.type === 'cook') {
        const steamTimer = this.time.addEvent({
          delay: 1000,
          loop: true,
          callback: () => {
            if (!this.sys?.isActive()) return;
            const steamX = st.x + Phaser.Math.Between(-8, 8);
            const steamY = st.y - 15;
            const steam = this.add.circle(steamX, steamY, Phaser.Math.Between(5, 10), 0xffffff, 0.42).setDepth(6);
            this.tweens.add({
              targets: steam,
              y: steam.y - Phaser.Math.Between(35, 55),
              x: steam.x + Phaser.Math.Between(-10, 10),
              scaleX: 1.6,
              scaleY: 1.6,
              alpha: 0,
              duration: 1300,
              ease: 'Quad.easeOut',
              onComplete: () => steam.destroy()
            });
          }
        });
        this.kitchenSteamTimers.push(steamTimer);

        // Ánh lửa lò nướng ấm áp bập bùng
        const ovenGlow = this.add.ellipse(st.x, st.y + 55, 52, 38, 0xf97316, 0.38).setDepth(2);
        this.tweens.add({
          targets: ovenGlow,
          alpha: { from: 0.2, to: 0.55 },
          scaleX: { from: 0.92, to: 1.08 },
          scaleY: { from: 0.94, to: 1.06 },
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      // Hiệu ứng bong bóng xà phòng nhẹ nhàng ở Bồn Rửa Tay (tại vị trí vòng tròn xanh dương trên bồn rửa)
      if (st.type === 'prep') {
        const bubbleTimer = this.time.addEvent({
          delay: 1500,
          loop: true,
          callback: () => {
            if (!this.sys?.isActive()) return;
            const b = this.add.circle(st.x + Phaser.Math.Between(-15, 15), st.y, Phaser.Math.Between(3, 7), 0xbae6fd, 0.65).setDepth(6);
            this.tweens.add({
              targets: b,
              y: b.y - Phaser.Math.Between(25, 45),
              alpha: 0,
              duration: 1200,
              ease: 'Sine.easeOut',
              onComplete: () => b.destroy()
            });
          }
        });
        this.kitchenSteamTimers.push(bubbleTimer);
      }

      // Trạm Túi của Bé đã đưa ra thành icon ngoài HUD theo yêu cầu

      // Vùng chạm nồi nấu trên bệ đá (vị trí người dùng khoanh dấu X đỏ thứ 3 tại x: 710, y: 240)
      if (st.type === 'cook') {
        const potTouchZone = this.add.zone(710, 240, 140, 110)
          .setInteractive({ useHandCursor: true })
          .setDepth(15);
        potTouchZone.on('pointerdown', (pointer) => {
          if (!this.isWorldPointer(pointer)) return;
          pointer?.event?.stopPropagation?.();
          this.handleKitchenStationInteraction(st);
        });
        this.kitchenStationContainers.push({ data: st, container, touchZone: potTouchZone, aura });
      }

      this.kitchenStationContainers.push({ data: st, container, touchZone, aura });
    });

    // Biểu tượng 🔒🧼 trên Tủ Lạnh & Bếp Lò khi bé chưa rửa tay
    this.kitchenLockBadges = [];
    this.refreshKitchenLockBadges();
    this.addManagedListener?.('game:hands-washed', () => this.refreshKitchenLockBadges(true));
  }

  isKitchenHandsWashed() {
    return Boolean(
      window.__cookingSystem?.getState()?.handsWashed ??
      this.saveAdapter?.load()?.cooking?.handsWashed
    );
  }

  refreshKitchenLockBadges(celebrate = false) {
    const washed = this.isKitchenHandsWashed();
    (this.kitchenLockBadges || []).forEach(({ badge, tween, st }) => {
      tween?.stop();
      if (celebrate && badge?.active) {
        const pop = this.add.text(badge.x, badge.y, '🔓✨', { fontSize: '30px' }).setOrigin(0.5).setDepth(22);
        this.tweens.add({ targets: pop, y: pop.y - 40, alpha: 0, scale: 1.5, duration: 900, ease: 'Cubic.easeOut', onComplete: () => pop.destroy() });
      }
      badge?.destroy();
    });
    this.kitchenLockBadges = [];
    if (washed || !this.mapConfig?.kitchenStations) return;

    this.mapConfig.kitchenStations
      .filter(s => s.type === 'cook' || s.type === 'pantry')
      .forEach((st) => {
        const bx = st.type === 'cook' ? st.x + 20 : st.x;
        const by = st.type === 'cook' ? st.y + 20 : st.y - 70;
        const badge = this.add.container(bx, by).setDepth(21);
        const bg = this.add.circle(0, 0, 24, 0xffffff, 0.95).setStrokeStyle(3, 0x38bdf8);
        const icon = this.add.text(0, 0, '🔒', { fontSize: '24px' }).setOrigin(0.5);
        const soap = this.add.text(18, 16, '🧼', { fontSize: '18px' }).setOrigin(0.5);
        badge.add([bg, icon, soap]);
        badge.setName(`kitchen-lock-${st.type}`);
        const tween = this.tweens.add({ targets: badge, y: by - 6, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.kitchenLockBadges.push({ badge, tween, st });
      });
  }

  showHandWashLockBubble(st) {
    // Rung biểu tượng khóa và chỉ dẫn tới bồn rửa tay
    const entry = (this.kitchenLockBadges || []).find(b => b.st?.id === st?.id);
    if (entry?.badge) {
      this.tweens.add({ targets: entry.badge, angle: { from: -15, to: 15 }, duration: 80, yoyo: true, repeat: 4, onComplete: () => entry.badge?.setAngle?.(0) });
    }
    const sink = this.mapConfig?.kitchenStations?.find(s => s.type === 'prep');
    if (sink) {
      const arrow = this.add.text(sink.x, sink.y - 60, '👇🧼', { fontSize: '34px' }).setOrigin(0.5).setDepth(22);
      this.tweens.add({ targets: arrow, y: arrow.y + 14, duration: 320, yoyo: true, repeat: 4, onComplete: () => arrow.destroy() });
    }
  }

  handleKitchenStationInteraction(st) {
    if (!st || !this.hero) return;
    let targetX = st.x;
    let targetY = st.y;
    if (st.type === 'cook') {
      targetX = 940;
      targetY = 290;
    } else if (st.type === 'dining') {
      targetX = st.x - 55;
      targetY = st.y;
    } else if (st.type === 'pantry') {
      targetX = st.x; // 398 (vòng tròn xanh dương trên cánh tủ lạnh)
      targetY = st.y; // 291
    } else if (st.type === 'bag') {
      targetX = st.x;      // 450
      targetY = st.y - 60;  // 590
    } else if (st.type === 'prep') {
      targetX = st.x; // 605 (vòng tròn xanh dương tại bồn rửa tay)
      targetY = st.y; // 131
    }

    // Open only after the character arrives; another destination cancels it.
    this.kitchenStationVisit = st.id;
    this.hero.moveTo(targetX, targetY, () => {
      if (this.kitchenStationVisit !== st.id || !this.sys.isActive() || !this.isExploring) return;
      this.openKitchenStationInteraction(st);
    });
  }

  openKitchenStationInteraction(st) {

    // Phản hồi âm thanh
    if (window.__audioService) {
      window.__audioService.playChime(640, 0.15);
    }

    // YÊU CẦU BẮT BUỘC: Phải rửa tay sạch mới được mở Tủ Lạnh và Bếp Lò nấu ăn!
    const isHandsWashed = Boolean(
      window.__cookingSystem?.getState()?.handsWashed ??
      this.saveAdapter?.load()?.cooking?.handsWashed
    );

    // Chỉ mở được Tủ Lạnh hoặc Bếp Lò nấu ăn khi đã rửa tay sạch khuẩn!
    if ((st.type === 'cook' || st.type === 'pantry') && !isHandsWashed) {
      const isFridge = st.type === 'pantry';
      if (window.__audioService) {
        window.__audioService.playChime(420, 0.25);
        window.__audioService.speak(
          isFridge
            ? 'Bé ơi, tay chưa rửa sạch khuẩn! Hãy đến bồn rửa tay trước khi mở tủ lạnh nhé!'
            : 'Bé ơi, tay chưa rửa sạch khuẩn! Hãy đến bồn rửa tay trước khi vào bếp nấu ăn nhé!'
        );
      }
      window.dispatchEvent(new CustomEvent('game:show-toast', {
        detail: {
          message: isFridge
            ? '🧼 Bé hãy rửa tay thật sạch tại bồn rửa trước khi mở Tủ Lạnh nhé!'
            : '🧼 Bé hãy rửa tay thật sạch tại bồn rửa trước khi vào Bếp nấu nhé!'
        }
      }));
      this.showHandWashLockBubble?.(st);

      const sinkStation = this.kitchenStationContainers?.find(c => c.data?.type === 'prep');
      if (sinkStation?.aura) {
        this.tweens.add({
          targets: sinkStation.aura,
          scaleX: 1.4,
          scaleY: 1.4,
          alpha: 0.9,
          duration: 300,
          yoyo: true,
          repeat: 3
        });
      }
      window.dispatchEvent(new CustomEvent('game:open-kitchen-station-popup', { detail: { station: 'sink' } }));
      return;
    }

    if (false && st.type === 'cook' && !isHandsWashed) {
      if (window.__audioService) {
        window.__audioService.playChime(420, 0.25);
        window.__audioService.speak('Bé ơi, tay chưa rửa sạch khuẩn! Hãy đến bồn rửa tay trước khi vào bếp nấu ăn nhé!');
      }
      window.dispatchEvent(new CustomEvent('game:show-toast', {
        detail: {
          message: '🧼 Bé hãy rửa tay thật sạch tại bồn rửa trước khi vào Bếp nấu nhé!'
        }
      }));
      this.showHandWashLockBubble?.(st);

      // Hiệu ứng nhấp nháy dẫn hướng đến bồn rửa tay (prep)
      const sinkStation = this.kitchenStationContainers?.find(c => c.data?.type === 'prep');
      if (sinkStation?.aura) {
        this.tweens.add({
          targets: sinkStation.aura,
          scaleX: 1.4,
          scaleY: 1.4,
          alpha: 0.9,
          duration: 300,
          yoyo: true,
          repeat: 3
        });
      }
      return;
    }

    // 1. TRẠM BẾP LÒ: Mở giao diện nấu ăn ngay lập tức (khi tay đã sạch)
    if (st.type === 'cook') {
      window.dispatchEvent(new CustomEvent('game:show-toast', {
        detail: { message: '🍳 Cùng vào bếp nấu món ăn ngon dinh dưỡng nhé!' }
      }));
      window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'cook' } }));
      return;
    }

    // 2. TRẠM BÀN ĂN: Mở Hộp Món Ăn để thưởng thức hoặc cho thú cưng ăn
    if (st.type === 'dining') {
      window.dispatchEvent(new CustomEvent('game:show-toast', {
        detail: { message: '🍽️ Mở Hộp Món Ăn để thưởng thức món bé tự làm nhé!' }
      }));
      window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'bag' } }));
      return;
    }

    // 3. TRẠM TÚI CỦA BÉ: Mở Pop-up xem túi đồ của bé ngay
    if (st.type === 'bag') {
      window.dispatchEvent(new CustomEvent('game:show-toast', {
        detail: { message: '🎒 Mở Túi Đồ Của Bé xem món ngon và nguyên liệu!' }
      }));
      window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'bag' } }));
      return;
    }

    // 4. TRẠM BỒN RỬA TAY: Mở Pop-up tương tác rửa tay sạch sẽ ngay
    if (st.type === 'prep') {
      for (let i = 0; i < 8; i++) {
        const bubble = this.add.circle(
          st.x + Phaser.Math.Between(-25, 25),
          st.y + Phaser.Math.Between(-10, 10),
          Phaser.Math.Between(4, 10),
          0xbae6fd,
          0.8
        ).setDepth(10);
        this.tweens.add({
          targets: bubble,
          y: bubble.y - Phaser.Math.Between(35, 70),
          x: bubble.x + Phaser.Math.Between(-18, 18),
          alpha: 0,
          duration: Phaser.Math.Between(650, 1100),
          ease: 'Sine.easeOut',
          onComplete: () => bubble.destroy()
        });
      }
      window.dispatchEvent(new CustomEvent('game:open-kitchen-station-popup', { detail: { station: 'sink' } }));
      return;
    }

    // 5. TRẠM KỆ / TỦ LẠNH: Chỉ mở được Tủ Lạnh khi đã rửa tay sạch
    if (st.type === 'pantry') {
      if (!isHandsWashed) {
        this.showHandWashLockBubble?.(st);
        window.dispatchEvent(new CustomEvent('game:open-kitchen-station-popup', { detail: { station: 'sink' } }));
        return;
      }
      window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'fridge' } }));
      return;
    }

    // 6. TRẠM CỬA RA VÀO: Mở Pop-up hỏi trở về Nông Trại Thú Cưng ngay
    if (st.type === 'door') {
      window.dispatchEvent(new CustomEvent('game:open-kitchen-station-popup', { detail: { station: 'door' } }));
      return;
    }

    window.dispatchEvent(new CustomEvent('game:show-toast', {
      detail: { message: `${st.icon || '🍳'} ${st.badge || ''}: ${st.actionPrompt || ''}` }
    }));
  }

  initPetFarmStations(stations) {
    this.lastPetInteractionTime = 0;
    this.petStationContainers = [];

    stations.forEach((st, idx) => {
      const container = this.add.container(st.x, st.y).setDepth(4);

      // Only the scene artwork and invisible touch zones identify stations.
      const zoneW = st.type === 'water' ? 140 : 115;
      const zoneH = st.type === 'water' ? 120 : 115;
      const touchZone = this.add.zone(st.x, st.y, zoneW, zoneH)
        .setInteractive({ useHandCursor: true })
        .setDepth(15);
      touchZone.on('pointerdown', (pointer) => {
        if (!this.isWorldPointer(pointer)) return;
        pointer?.event?.stopPropagation?.();
        this.handlePetStationInteraction(st);
      });

      // Hiển thị huy hiệu hình ảnh tinh gọn nếu chưa có Cổng TeleportPortal chuyên biệt
      const hasPortal = this.portals && this.portals.some(p => p.data?.targetMapId?.includes(st.type) || p.data?.id?.includes(st.type));
      if (!hasPortal && (st.type === 'fishing_pond' || st.type === 'rainbow_market' || st.type === 'fashion_street')) {
        const signBg = this.add.graphics();
        signBg.fillStyle(st.type === 'fishing_pond' ? 0x0284c7 : 0xdb2777, 0.94);
        signBg.fillRoundedRect(-46, -22, 92, 44, 22);
        signBg.lineStyle(3, 0xffffff, 0.96);
        signBg.strokeRoundedRect(-46, -22, 92, 44, 22);
        const signText = this.add.text(0, 0, st.badge || (st.type === 'fishing_pond' ? '🎣 🪷' : '🏮 🐚'), {
          fontFamily: 'Quicksand, Nunito, Segoe UI, sans-serif',
          fontSize: '20px',
          fontStyle: 'bold',
          color: '#ffffff'
        }).setOrigin(0.5);
        container.add([signBg, signText]);
        this.tweens.add({
          targets: container,
          y: st.y - 6,
          duration: 1400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      this.petStationContainers.push({
        data: st,
        container,
        touchZone
      });
    });
  }

  /**
   * Hiển thị Hộp thoại thông báo khi Giỏ Cá đã đầy (6/6)
   * Yêu cầu: "hiện thông báo , túi đầy rồi không thể câu cá nữa , bé hãy đi đổi cá nhé !"
   */
  showBasketFullNoticeModal() {
    const noticeText = 'Túi đầy rồi không thể câu cá nữa, bé hãy đi đổi cá nhé!';

    // 1. Âm thanh chuông báo & giọng đọc tiếng Việt ấm áp
    if (window.__audioService) {
      window.__audioService.playChime?.(650, 0.15);
      window.__audioService.speak?.(noticeText);
    }

    // 2. Spawn floating popup trên đầu nhân vật
    if (this.hero) {
      this.spawnFloatingPopup(this.hero.getX(), this.hero.getY() - 55, '🎒 Túi đầy cá! Đi đổi cá nhé!', '#f59e0b');
    }

    // 3. Dispatch sự kiện Toast toàn cục
    window.dispatchEvent(new CustomEvent('game:show-toast', { detail: { message: `🧺 ${noticeText}` } }));

    // 4. Modal Pop-up thân thiện, chuẩn mầm non
    const oldModal = document.getElementById('basket-full-notice-modal');
    if (oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'basket-full-notice-modal';
    overlay.className = 'basket-full-modal-overlay';
    overlay.innerHTML = `
      <div class="basket-full-card" role="dialog" aria-modal="true" aria-labelledby="basket-full-title">
        <div class="basket-full-badge">🧺 GIỎ CÁ ĐÃ ĐẦY (6/6 CHỖ)</div>
        <div class="basket-full-hero-icon">🧺 🐟 ✨</div>
        <h2 id="basket-full-title" class="basket-full-title">${noticeText}</h2>
        <p class="basket-full-desc">
          Giỏ của bé đã chứa đủ 6 bạn cá rồi! Bé hãy ghé sang <strong>Chợ Cầu Vồng</strong> gặp Cô Mèo để đổi cá lấy thật nhiều Sao ⭐ hoặc mở Túi để xem các bạn cá nhé!
        </p>
        <div class="basket-full-actions">
          <button type="button" id="btn-basket-notice-market" class="basket-full-btn-market">
            <span>🏮 Đến Chợ Cầu Vồng (Đổi Cá) ⭐</span>
          </button>
          <button type="button" id="btn-basket-notice-bag" class="basket-full-btn-bag">
            <span>🎒 Xem Túi Của Bé</span>
          </button>
          <button type="button" id="btn-basket-notice-close" class="basket-full-btn-close">
            <span>Để sau</span>
          </button>
        </div>
      </div>
    `;

    const gameRoot = document.getElementById('game-root') || document.body;
    gameRoot.appendChild(overlay);

    const closeModal = () => {
      if (overlay.parentNode) overlay.remove();
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    overlay.querySelector('#btn-basket-notice-close')?.addEventListener('click', closeModal);

    overlay.querySelector('#btn-basket-notice-bag')?.addEventListener('click', () => {
      closeModal();
      window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'bag' } }));
    });

    overlay.querySelector('#btn-basket-notice-market')?.addEventListener('click', () => {
      closeModal();
      window.dispatchEvent(new CustomEvent('game:portal-teleport', {
        detail: { targetMapId: 'map_rainbow_market', targetMapName: 'Chợ Cầu Vồng' }
      }));
    });
  }

  /**
   * Mở đường & Biển chỉ dẫn kết nối từ Nông Trại đến Phố Thời Trang
   * Yêu cầu: "mở đường từ nông trại đến Phố thời trang, tôi chưa thấy đường kết nối"
   */
  /**
   * Mở đường & Biển chỉ dẫn kết nối từ Chợ Cầu Vồng đến Phố Thời Trang
   * Yêu cầu: "Bỏ đường qua ở đây , tạo đường qua từ Chợ Cầu Vòng có đường đi qua ."
   */
  drawMarketFashionRoad() {
    // Đã xóa bỏ theo yêu cầu người dùng
  }

  drawPetFarmFashionRoad() {
    // 1. Dải đường lát đá cuội uốn cong tự nhiên nối từ sân trung tâm sang Cổng Phố Thời Trang
    // Bắt đầu từ bãi cỏ trung tâm (x: 820, y: 560), qua (x: 960, y: 590) đến (x: 1110, y: 625)
    const roadGfx = this.add.graphics().setDepth(2);
    
    // Tạo chuỗi điểm đường cong Bézier bậc 2 từ sân cỏ sang Cổng Phố Thời Trang
    const roadPoints = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const rx = (1 - t) * (1 - t) * 810 + 2 * (1 - t) * t * 940 + t * t * 1105;
      const ry = (1 - t) * (1 - t) * 560 + 2 * (1 - t) * t * 580 + t * t * 625;
      roadPoints.push({ x: rx, y: ry });
    }

    // Nền đất lót đường màu cát vàng ấm áp
    roadGfx.lineStyle(56, 0xfde68a, 0.45);
    roadGfx.beginPath();
    roadGfx.moveTo(roadPoints[0].x, roadPoints[0].y);
    for (let i = 1; i < roadPoints.length; i++) {
      roadGfx.lineTo(roadPoints[i].x, roadPoints[i].y);
    }
    roadGfx.strokePath();

    roadGfx.lineStyle(42, 0xfef3c7, 0.65);
    roadGfx.beginPath();
    roadGfx.moveTo(roadPoints[0].x, roadPoints[0].y);
    for (let i = 1; i < roadPoints.length; i++) {
      roadGfx.lineTo(roadPoints[i].x, roadPoints[i].y);
    }
    roadGfx.strokePath();

    // Các viên đá cuội lót đường (Stepping stones)
    const stones = [
      { x: 825, y: 560, r: 15 },
      { x: 865, y: 566, r: 17 },
      { x: 905, y: 574, r: 16 },
      { x: 945, y: 583, r: 18 },
      { x: 985, y: 594, r: 16 },
      { x: 1025, y: 606, r: 18 },
      { x: 1065, y: 618, r: 17 },
      { x: 1098, y: 625, r: 19 }
    ];

    for (const stone of stones) {
      // Bóng đá
      roadGfx.fillStyle(0xb45309, 0.22);
      roadGfx.fillEllipse(stone.x + 2, stone.y + 4, stone.r * 2.1, stone.r * 1.4);
      // Mặt đá cuội nhẵn mịn
      roadGfx.fillStyle(0xfffbeb, 0.88);
      roadGfx.fillEllipse(stone.x, stone.y, stone.r * 2.0, stone.r * 1.35);
      // Viền đá vàng nhạt
      roadGfx.lineStyle(2, 0xf59e0b, 0.5);
      roadGfx.strokeEllipse(stone.x, stone.y, stone.r * 2.0, stone.r * 1.35);
    }

    // 2. Các bụi hoa nhỏ xinh xắn 2 bên mép đường
    const roadsideFlowers = [
      { x: 840, y: 540, char: '🌸' },
      { x: 890, y: 595, char: '🌼' },
      { x: 940, y: 560, char: '🌷' },
      { x: 990, y: 618, char: '🌸' },
      { x: 1045, y: 590, char: '✨' },
      { x: 1085, y: 650, char: '🎀' }
    ];
    for (const fl of roadsideFlowers) {
      this.add.text(fl.x, fl.y, fl.char, { fontSize: '15px' })
        .setOrigin(0.5)
        .setDepth(3)
        .setAlpha(0.9);
    }

    // Đã xóa bỏ biển gỗ chỉ dẫn thừa theo yêu cầu người dùng

    // 4. Mũi tên dạ quang lấp lánh chỉ dọc con đường
    const arrows = [
      { x: 910, y: 575 },
      { x: 995, y: 598 },
      { x: 1070, y: 618 }
    ];
    arrows.forEach((pos, idx) => {
      const arrow = this.add.text(pos.x, pos.y, '➜', {
        fontSize: '14px',
        color: '#c084fc',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(3).setRotation(0.24);

      this.tweens.add({
        targets: arrow,
        alpha: { from: 0.35, to: 0.95 },
        scale: { from: 0.9, to: 1.25 },
        delay: idx * 300,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  handlePetStationInteraction(st) {
    if (!st) return;
    // Resolve commands to the current map's canonical station, never an old
    // object retained by a modal or a previous scene.
    st = this.mapConfig?.petStations?.find(item => item.type === st.type);
    if (!st) return;

    if (st.type === 'kitchen') {
      window.dispatchEvent(new CustomEvent('game:open-kitchen-station-popup', { detail: { station: 'hub' } }));
      return;
    }

    if (st.type === 'fishing_pond') {
      const portal = this.portals?.find(p => p.targetMapId === 'map_fishing_pond' || p.data?.id?.includes('fishing'));
      if (portal) {
        portal.handleInteract();
      } else {
        this.hero?.moveTo(st.x - 45, st.y, () => {
          if (!this.sys.isActive() || !this.isExploring) return;
          window.dispatchEvent(new CustomEvent('game:portal-warp-start', {
            detail: { portalX: st.x, portalY: st.y, targetMapId: 'map_fishing_pond', targetMapName: 'Hồ Câu Lá Sen' }
          }));
        });
      }
      return;
    }

    if (st.type === 'rainbow_market') {
      const portal = this.portals?.find(p => p.targetMapId === 'map_rainbow_market' || p.data?.id?.includes('market'));
      if (portal) {
        portal.handleInteract();
      } else {
        this.hero?.moveTo(st.x, st.y - 30, () => {
          if (!this.sys.isActive() || !this.isExploring) return;
          window.dispatchEvent(new CustomEvent('game:portal-warp-start', {
            detail: { portalX: st.x, portalY: st.y, targetMapId: 'map_rainbow_market', targetMapName: 'Chợ Cầu Vồng' }
          }));
        });
      }
      return;
    }

    if (st.type === 'fashion_street') {
      const portal = this.portals?.find(p => p.targetMapId === 'map_fashion_street' || p.data?.id?.includes('fashion'));
      if (portal) {
        portal.handleInteract();
      } else {
        this.hero?.moveTo(st.x, st.y - 30, () => {
          if (!this.sys.isActive() || !this.isExploring) return;
          window.dispatchEvent(new CustomEvent('game:portal-warp-start', {
            detail: { portalX: st.x, portalY: st.y, targetMapId: 'map_fashion_street', targetMapName: 'Phố Thời Trang Cầu Vồng' }
          }));
        });
      }
      return;
    }

    if (st.type === 'shelter' || st.type === 'bed') {
      this.openPetSleepConfirmDialog();
      return;
    }

    // Ignore duplicate events for this station, but accept a different command
    // immediately. A global debounce used to discard legitimate drink requests.
    const current = this.currentPetStationAction;
    if (current?.station.type === st.type && current.phase !== 'celebrating') return;
    this.lastPetInteractionTime = Date.now();

    // Nếu đang trong tiến trình khác, huỷ tiến trình cũ trước
    if (this.currentPetStationAction) {
      this.interruptPetStationAction(false);
    }

    this.startPetStationAction(st);
  }

  startPetStationAction(st) {
    if (!this.pet || !this.pet.sprite?.active) return;

    // Đánh thức hoàn toàn nếu đang ngủ hoặc ở trạng thái ngủ
    if (this.pet.isSleepingOnBed || this.pet.isForcedSleeping || this.pet.currentAnimState === 'sleep') {
      this.pet.wakeUp();
    }
    this.pet.isBusyWithStation = true;

    // Xác định toạ độ cún đứng tương tác chuẩn xác cạnh từng trạm
    let targetX = st.x;
    let targetY = st.y;

    if (st.type === 'feed') {
      targetX = 280;
      targetY = 385;
    } else if (st.type === 'water') {
      targetX = st.interactionPoint?.x ?? st.x;
      targetY = st.interactionPoint?.y ?? st.y;
    } else if (st.type === 'bath') {
      targetX = st.interactionPoint?.x ?? st.x;
      targetY = st.interactionPoint?.y ?? st.y + 10;
    } else if (st.type === 'potty' || st.type === 'toilet') {
      targetX = 1005;
      targetY = 395;
    } else if (st.type === 'play') {
      if (this.toyBall) {
        targetX = this.toyBall.x > 700 ? this.toyBall.x - 48 : this.toyBall.x + 48;
        targetY = this.toyBall.y;
      } else {
        targetX = 740;
        targetY = 575;
      }
    }

    const action = {
      station: st,
      targetX,
      targetY,
      phase: 'walking'
    };
    this.currentPetStationAction = action;

    // Cún bước đi từ từ thong thả tới trạm chức năng giống hệt như đi ngủ, không bay đến ngay
    this.pet.walkToStation(targetX, targetY, () => {
      if (this.currentPetStationAction !== action || !this.sys.isActive()) return;
      this.executeStationActionProgress(st, targetX, targetY, action);
    });
  }

  executeStationActionProgress(st, targetX, targetY, action = this.currentPetStationAction) {
    if (!action || this.currentPetStationAction !== action || action.phase !== 'walking') return;
    this.currentPetStationAction.phase = 'action';

    this.pet.isMoving = false;
    this.pet.stopHop();
    this.pet.sprite.setPosition(targetX, targetY);
    this.pet.sprite.setAngle(0);

    // Hướng mặt về phía trạm và thực hiện hành động Đang ăn
    if (st.type === 'feed') {
      this.pet.sprite.setFlipX(true);
      this.pet.beginStationPose('feed', targetX, targetY);
      window.__audioService?.playPetEat();
    } else if (st.type === 'water') {
      this.pet.beginStationPose('water', targetX, targetY);
      window.__audioService?.playPetDrink();
    } else if (st.type === 'bath') {
      this.pet.beginStationPose('bath', targetX, targetY);
      this.petBathFront?.setVisible(true);
      if (this.petBathWaterEffect) this.petBathWaterEffect.triggerSplashBurst();
      window.__audioService?.playBobberSplash();
    } else if (st.type === 'potty' || st.type === 'toilet') {
      this.pet.sprite.setFlipX(false);
      this.pet.playPotty(true);
      window.__audioService?.playPetFlush();
    } else if (st.type === 'play') {
      const dxToBall = (this.toyBall ? this.toyBall.x : 770) - this.pet.sprite.x;
      this.pet.sprite.setFlipX(dxToBall < 0);
      this.pet.celebrate(3500);
      if (this.toyBall) {
        this.toyBall.nudgeTap();
      }
      window.__audioService?.playPetBark();
    }

    // Tạo thanh tương tác % (Interactive Progress Bar)
    this.createPetActionProgressBar(targetX, targetY - (st.type === 'bath' ? 70 : 65), st, action);
  }

  createPetActionProgressBar(x, y, st, action = this.currentPetStationAction) {
    // Ẩn tạm bảng hiệu trạm để không bị đè chữ lên thanh tiến trình
    if (Array.isArray(this.petStationContainers)) {
      const activeC = this.petStationContainers.find(c => c.data.type === st.type);
      if (activeC && activeC.container) activeC.container.setAlpha(0);
    }
    if (this.petActionProgressBar) {
      this.petActionProgressBar.destroy();
      this.petActionProgressBar = null;
    }

    const container = this.add.container(x, y).setDepth(25);
    this.petActionProgressBar = container;

    const barWidth = 120;
    const barHeight = 22;
    const radius = 11;

    // Nền tối bán trong suốt
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.88);
    bg.fillRoundedRect(-barWidth / 2, -barHeight / 2, barWidth, barHeight, radius);
    bg.lineStyle(2, 0xffffff, 0.95);
    bg.strokeRoundedRect(-barWidth / 2, -barHeight / 2, barWidth, barHeight, radius);
    container.add(bg);

    // Màu sắc theo loại trạm
    const colorMap = {
      feed: 0xf59e0b,
      bath: 0x38bdf8,
      water: 0x38bdf8,
      potty: 0xa855f7,
      toilet: 0xa855f7,
      play: 0x10b981
    };
    const fillColor = colorMap[st.type] || 0x10b981;

    // Thanh tiến trình bên trong
    const fillGfx = this.add.graphics();
    container.add(fillGfx);

    // Icon trạm nhỏ xinh bên trái
    const iconMap = {
      feed: '🥕',
      bath: '🛁',
      water: '💧',
      potty: '🚽',
      toilet: '🚽',
      play: '⚽'
    };
    const iconTxt = this.add.text(-barWidth / 2 + 16, 0, iconMap[st.type] || '✨', {
      fontSize: '15px'
    }).setOrigin(0.5);
    container.add(iconTxt);

    // Chữ phần trăm %
    const pctTxt = this.add.text(barWidth / 2 - 18, 0, '0%', {
      fontFamily: 'Segoe UI, Arial, sans-serif' ,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(pctTxt);

    // Tiêu đề hành động nhỏ phía trên
    const labelMap = {
      feed: 'Đang ăn... 🥕',
      bath: 'Đang tắm... 🛁',
      water: 'Đang uống nước... 💧',
      potty: 'Đang vệ sinh... 🚽',
      toilet: 'Đang vệ sinh... 🚽',
      play: 'Đang chơi đùa... ⚽'
    };
    const actionLabel = this.add.text(0, -18, labelMap[st.type] || 'Đang thực hiện...', {
      fontFamily: 'Segoe UI, Arial, sans-serif' ,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#00000066',
      padding: { left: 6, right: 6, top: 2, bottom: 2 }
    }).setOrigin(0.5);
    container.add(actionLabel);

    // Hiệu ứng scale xuất hiện mềm mại
    container.setScale(0.2);
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 250,
      ease: 'Back.easeOut'
    });

    // Tween tăng phần trăm từ từ từ 0% lên 100% trong 3200ms
    const progressObj = { value: 0 };
    const maxInnerW = barWidth - 44;
    const startInnerX = -barWidth / 2 + 28;

    this.petProgressTween = this.tweens.add({
      targets: progressObj,
      value: 1,
      duration: 3200,
      ease: 'Linear',
      onUpdate: () => {
        if (this.currentPetStationAction !== action) return;
        const val = Phaser.Math.Clamp(progressObj.value, 0, 1);
        const curW = Math.max(4, Math.round(maxInnerW * val));
        fillGfx.clear();
        fillGfx.fillStyle(fillColor, 1);
        fillGfx.fillRoundedRect(startInnerX, -barHeight / 2 + 3, curW, barHeight - 6, (barHeight - 6) / 2);

        const currentPct = Math.round(val * 100);
        pctTxt.setText(`${currentPct}%`);

        if (Math.random() < 0.08) {
          if (st.type === 'bath' || st.type === 'water') {
            this.spawnStationParticles(x, y + 25, ['🫧', '💧'], 0x38bdf8);
          } else if (st.type === 'feed') {
            this.spawnStationParticles(x, y + 25, ['🥕', '✨'], 0xf59e0b);
          } else if (st.type === 'potty' || st.type === 'toilet') {
            this.spawnStationParticles(x, y + 25, ['✨', '🌸'], 0xa855f7);
          }
        }
      },
      onComplete: () => {
        this.completePetStationAction(st, action);
      }
    });
  }

  interruptPetStationAction(isUserInterrupt = true) {
    const hadAction = Boolean(this.currentPetStationAction);
    // Invalidate callbacks before stopping tweens or creating any idle motion.
    this.currentPetStationAction = null;
    this.petBathFront?.setVisible(false);
    this.pet?.endStationPose();
    this.petStationFinishTimer?.remove();
    this.petStationFinishTimer = null;
    if (Array.isArray(this.petStationContainers)) {
      this.petStationContainers.forEach(c => c.container?.setAlpha?.(1));
    }
    if (this.pet?.stationTween) {
      this.pet.stationTween.stop();
      this.pet.stationTween = null;
    }
    if (this.petActionTween) {
      this.petActionTween.stop();
      this.petActionTween = null;
    }
    if (this.petProgressTween) {
      this.petProgressTween.stop();
      this.petProgressTween = null;
    }

    if (this.petActionProgressBar) {
      const bar = this.petActionProgressBar;
      this.petActionProgressBar = null;
      this.tweens.add({
        targets: bar,
        scale: 0.2,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          bar.destroy();
        }
      });
    }

    if (this.pet?.sprite?.active) {
      this.pet.stopCelebration();
      this.pet.stopHop();
      this.tweens.killTweensOf([this.pet.sprite, this.pet.shadow].filter(Boolean));
      this.pet.isBusyWithStation = false;
      this.pet.isMoving = false;
      this.pet.stopBathe?.();
      this.pet.sprite.setAngle(0);
      if (this.pet.shadow) {
        this.pet.shadow.setVisible(true);
      }

      if (isUserInterrupt && hadAction) {
        this.pet.celebrate?.(1400);
        this.pet.spawnEmote?.('🐾');
        this.spawnFloatingPopup(this.pet.sprite.x, this.pet.sprite.y - 45, 'Bé gọi Cún dừng lại! 🐶', '#f59e0b');
        if (this.audioService) {
          this.audioService.playChime(520, 0.15);
        }
      } else if (this.sys?.isActive()) {
        this.pet.playIdle?.();
      }
    }
  }

  completePetStationAction(st, action = this.currentPetStationAction) {
    if (!action || this.currentPetStationAction !== action || action.phase !== 'action') return;
    action.phase = 'celebrating';
    this.petProgressTween = null;
    if (Array.isArray(this.petStationContainers)) {
      this.petStationContainers.forEach(c => c.container?.setAlpha?.(1));
    }
    if (this.petActionProgressBar) {
      const bar = this.petActionProgressBar;
      this.petActionProgressBar = null;
      this.tweens.add({
        targets: bar,
        scale: 1.15,
        alpha: 0,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => bar.destroy()
      });
    }

    const state = saveAdapter.load();
    const pet = state.pet || {};
    const petName = pet.name || (pet.type === 'bunny' ? 'Thỏ Bông' : 'Bé Cún Vàng');
    const now = Date.now();
    let feedback = '';

    if (st.type === 'feed') {
      pet.hunger = Math.min(100, (pet.hunger || 0) + 40);
      pet.exp = (pet.exp || 0) + 5;
      pet.affection = Math.min(100, (pet.affection || 10) + 1);
      feedback = `🥕 ${petName} ăn cà rốt và bánh giòn ngon miệng! (+40 No)`;
      this.spawnStationParticles(st.x, st.y, ['🥕', '🍎', '✨', '💖'], 0xf59e0b);
      this.spawnFloatingPopup(this.pet?.sprite?.x || st.x, (this.pet?.sprite?.y || st.y) - 45, '+40 No bụng 🥕', '#f59e0b');
    } else if (st.type === 'water') {
      pet.thirst = Math.min(100, (pet.thirst ?? 80) + 60);
      pet.exp = (pet.exp || 0) + 5;
      pet.affection = Math.min(100, (pet.affection || 10) + 1);
      feedback = `💧 ${petName} uống dòng nước suối trong lành ngọt mát! (+60 Đã khát)`;
      this.spawnStationParticles(st.x, st.y, ['💧', '✨', '💙'], 0x38bdf8);
      this.spawnFloatingPopup(this.pet?.sprite?.x || st.x, (this.pet?.sprite?.y || st.y) - 45, '+60 Đã khát 💧', '#38bdf8');
    } else if (st.type === 'bath') {
      pet.clean = Math.min(100, (pet.clean || 0) + 65);
      pet.exp = (pet.exp || 0) + 6;
      pet.affection = Math.min(100, (pet.affection || 10) + 1);
      feedback = `🛁 ${petName} được tắm bồn bọt xà phòng thơm tho sạch bong! (+65 Sạch sẽ)`;
      this.spawnStationParticles(st.x, st.y, ['🧼', '🫧', '✨', '💙'], 0x38bdf8);
      this.spawnFloatingPopup(this.pet?.sprite?.x || st.x, (this.pet?.sprite?.y || st.y) - 45, '+65 Sạch sẽ 🛁', '#38bdf8');
      if (this.petBathWaterEffect) this.petBathWaterEffect.triggerSplashBurst();
    } else if (st.type === 'play') {
      pet.energy = Math.max(10, (pet.energy || 0) - 5);
      pet.fun = Math.min(100, (pet.fun ?? 80) + 18);
      pet.affection = Math.min(100, (pet.affection || 10) + 1);
      pet.affinity = Math.min(5, Math.ceil(pet.affection / 20));
      pet.exp = (pet.exp || 0) + 8;
      feedback = `⚽ ${petName} nhảy cẫng đá bóng cầu vồng vui hết nấc! (+18 Vui vẻ)`;
      this.spawnStationParticles(this.toyBall?.x || st.x, this.toyBall?.y || st.y, ['⚽', '🎉', '⭐', '🌈'], 0x10b981);
      this.spawnFloatingPopup(this.pet?.sprite?.x || st.x, (this.pet?.sprite?.y || st.y) - 45, '+18 Vui vẻ ⭐', '#10b981');
      // Khi hoàn tất tiến trình chơi đùa, bóng nảy bật đi chỗ khác!
      if (this.toyBall) {
        this.toyBall.bounceAwayFrom(this.pet?.sprite?.x || st.x, this.pet?.sprite?.y || st.y, 220);
      }
    } else if (st.type === 'potty' || st.type === 'toilet') {
      pet.bladder = 0;
      pet.clean = Math.min(100, (pet.clean || 0) + 30);
      pet.affection = Math.min(100, (pet.affection || 10) + 0.5);
      pet.exp = (pet.exp || 0) + 3;
      feedback = `🚽 ${petName} đi vệ sinh vào bồn cầu sạch sẽ ngoan ngoãn! (+30 Sạch)`;
      this.spawnStationParticles(st.x, st.y, ['🚽', '✨', '🌸', '💖'], 0x8b5cf6);
      this.spawnFloatingPopup(this.pet?.sprite?.x || st.x, (this.pet?.sprite?.y || st.y) - 45, 'Sạch sẽ thơm tho 🚽', '#8b5cf6');
    }

    // Kiểm tra thăng cấp thú cưng (30 EXP / Cấp)
    while ((pet.exp || 0) >= 30 && (pet.level || 1) < 10) {
      pet.exp -= 30;
      pet.level = (pet.level || 1) + 1;
      pet.affection = Math.min(100, (pet.affection || 10) + 2);
      this.spawnFloatingPopup(this.pet?.sprite?.x || st.x, (this.pet?.sprite?.y || st.y) - 80, `⭐ ${petName} LÊN CẤP ${pet.level}! ⭐`, '#eab308');
      feedback += ` ⭐ Lên Cấp ${pet.level}!`;
    }

    pet.lastCareTimestamp = now;
    state.pet = pet;
    saveAdapter.save(state);

    if (this.audioService) {
      this.audioService.playChime(880, 0.28);
    }

    if (this.pet) {
      this.pet.stopBathe?.();
      this.pet.endStationPose();
      this.petBathFront?.setVisible(false);
      // Step out before celebrating; do not leave a full standing sprite
      // painted over the front of the tub after the water pose ends.
      if (st.type === 'bath') this.pet.sprite.setPosition(st.x + 100, st.y + 15);
      this.pet.celebrate?.(2200);
      this.pet.spawnEmote?.(st.type === 'feed' ? '🥕' : (st.type === 'water' ? '💧' : (st.type === 'bath' ? '🫧' : '💖')));
      this.petStationFinishTimer = this.time.delayedCall(2200, () => {
        if (this.currentPetStationAction === action && this.pet?.sprite?.active) {
          this.currentPetStationAction = null;
          this.petStationFinishTimer = null;
          this.pet.isBusyWithStation = false;
          this.pet.playIdle?.();
        }
      });
    }

    window.dispatchEvent(new CustomEvent('game:pet-updated', { detail: { pet, message: feedback } }));
    window.dispatchEvent(new CustomEvent('game:show-toast', { detail: { message: feedback } }));
  }

  spawnStationParticles(x, y, items, color) {
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const dist = Phaser.Math.Between(30, 65);
      const emoji = items[i % items.length];
      const p = this.add.text(x, y - 10, emoji, { fontSize: '18px' }).setDepth(8);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 25,
        alpha: 0,
        scale: 1.4,
        duration: 850,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  spawnFloatingPopup(x, y, text, colorHex = '#ffffff') {
    const pop = this.add.text(x, y, text, {
      fontFamily: 'Segoe UI, Arial, sans-serif' ,
      fontSize: '18px',
      fontStyle: 'bold',
      color: colorHex,
      stroke: '#ffffff',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(9);

    this.tweens.add({
      targets: pop,
      y: y - 40,
      alpha: 0,
      scale: 1.15,
      duration: 1200,
      ease: 'Sine.easeOut',
      onComplete: () => pop.destroy()
    });
  }

  openPetSleepConfirmDialog() {
    const state = saveAdapter.load();
    const pet = state?.pet || {};
    const petName = pet.name || (pet.type === 'bunny' ? 'Thỏ Bông' : 'Bé Cún');
    const isSleeping = Boolean(this.pet?.isSleepingOnBed || this.pet?.isForcedSleeping);

    if (!this.petSleepModal) {
      this.petSleepModal = new PetSleepModal({
        audioService: window.__audioService
      });
    }

    this.petSleepModal.show({
      petName,
      isSleeping,
      onConfirm: () => {
        this.forcePetToSleep();
      },
      onWakeUp: () => {
        this.wakePetUp();
      }
    });
  }

  forcePetToSleep() {
    const bedX = 578;
    const bedY = 360;

    // Ép cún đi ngủ ngay lập tức không cần đợi tới lúc buồn ngủ
    if (this.pet) {
      this.pet.forceSleep(bedX, bedY);
    }

    const state = saveAdapter.load();
    if (state.pet) {
      state.pet.isSleeping = true;
      state.pet.energy = Math.min(100, (state.pet.energy || 0) + 40);
      state.pet.lastCareTimestamp = Date.now();
      saveAdapter.save(state);
      window.dispatchEvent(new CustomEvent('game:pet-updated', { detail: { pet: state.pet } }));
    }

    const petName = state?.pet?.name || (state?.pet?.type === 'bunny' ? 'Thỏ Bông' : 'Bé Cún');
    const msg = `💤 ${petName} đang đi tới đệm ngủ ấm áp...`;
    window.dispatchEvent(new CustomEvent('game:show-toast', { detail: { message: msg } }));
  }


  onBallDragStart(ball) {
    if (this.pet) {
      this.pet.noticeBall(ball);
    }
  }

  onBallDragged(ball) {
    if (this.pet && !this.pet.isSleepingOnBed && !this.pet.isForcedSleeping) {
      const dx = ball.x - this.pet.sprite.x;
      if (dx < -6) {
        this.pet.sprite.setFlipX(true);
        this.pet.facing = 'left';
      } else if (dx > 6) {
        this.pet.sprite.setFlipX(false);
        this.pet.facing = 'right';
      }
    }
  }

  onBallReleased(ball) {
    if (!this.pet || this.pet.isSleepingOnBed || this.pet.isForcedSleeping) return;
    // Cún con đuổi theo quả bóng trong 1 khoảng thời gian nhất định (7.5 giây)
    this.pet.startChaseBall(ball, 7500, () => {
      this.onPetCatchBall();
    });
  }

  onPetCatchBall() {
    if (!this.toyBall) return;
    const petX = this.pet?.sprite?.x || this.toyBall.x;
    const petY = this.pet?.sprite?.y || this.toyBall.y;

    // Bóng nảy đi chỗ khác khi cún chạm vào
    this.toyBall.bounceAwayFrom(petX, petY, 210);

    // Cập nhật chỉ số Vui vẻ cho thú cưng
    const state = saveAdapter.load();
    const pet = state.pet || {};
    const petName = pet.name || (pet.type === 'bunny' ? 'Thỏ Bông' : 'Bé Cún Vàng');
    pet.energy = Math.max(10, (pet.energy || 0) - 4);
    pet.fun = Math.min(100, (pet.fun ?? 80) + 16);
    pet.affection = Math.min(100, (pet.affection || 10) + 1);
    pet.affinity = Math.min(5, Math.ceil(pet.affection / 20));
    pet.exp = (pet.exp || 0) + 6;
    // Kiểm tra thăng cấp thú cưng khi chơi bóng
    while ((pet.exp || 0) >= 30 && (pet.level || 1) < 10) {
      pet.exp -= 30;
      pet.level = (pet.level || 1) + 1;
      pet.affection = Math.min(100, (pet.affection || 10) + 2);
      this.spawnFloatingPopup(petX, petY - 80, `⭐ ${petName} LÊN CẤP ${pet.level}! ⭐`, '#eab308');
    }

    pet.lastCareTimestamp = Date.now();
    state.pet = pet;
    saveAdapter.save(state);

    this.spawnFloatingPopup(petX, petY - 45, '+16 Vui vẻ ⚽', '#10b981');
    this.spawnStationParticles(petX, petY, ['⚽', '⭐', '🌈'], 0x10b981);
    if (this.audioService) {
      this.audioService.playChime(780, 0.2);
    }
    // Gửi sự kiện cập nhật HUD
    window.dispatchEvent(new CustomEvent('game:pet-updated', { detail: pet }));
  }

  wakePetUp() {
    if (this.pet) {
      this.pet.wakeUp();
    }
    const state = saveAdapter.load();
    if (state.pet) {
      state.pet.isSleeping = false;
      saveAdapter.save(state);
      window.dispatchEvent(new CustomEvent('game:pet-updated', { detail: { pet: state.pet } }));
    }
    const petName = state?.pet?.name || (state?.pet?.type === 'bunny' ? 'Thỏ Bông' : 'Bé Cún');
    const msg = `☀️ ${petName} đã thức dậy tràn đầy năng lượng chào bé!`;
    window.dispatchEvent(new CustomEvent('game:show-toast', { detail: { message: msg } }));
  }

  isPointInsidePondWater(x, y, zone, allowDock = true) {
    if (!zone) return false;
    if (allowDock && zone.walkableDockRect) {
      const d = zone.walkableDockRect;
      if (x >= d.xMin && x <= d.xMax && y >= d.yMin && y <= d.yMax) {
        return false;
      }
    }
    const dx = x - zone.cx;
    const dy = y - zone.cy;
    const rx = Math.max(40, zone.rx);
    const ry = Math.max(40, zone.ry);
    return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) < 1;
  }

  /**
   * Kẹp toạ độ người chơi hoàn toàn ra ngoài vùng nước đỏ Hồ Câu Lá Sen (nhưng cho phép đi trên cầu gỗ ra vòng tròn xanh 668, 426)
   */
  isPointOnPondDock(x, y, zone) {
    if (!zone) return false;
    const poly = zone.dockPoly;
    if (poly && poly.length >= 3) {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x, yi = poly[i].y;
        const xj = poly[j].x, yj = poly[j].y;
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    }
    if (zone.walkableDockRect) {
      const d = zone.walkableDockRect;
      return x >= d.xMin && x <= d.xMax && y >= d.yMin && y <= d.yMax;
    }
    return false;
  }

  /**
   * Kẹp toạ độ người chơi hoàn toàn ra ngoài vùng nước Hồ Câu Lá Sen (nhưng cho phép đi trên cầu gỗ ra điểm câu 702, 348)
   */
  clampOutOfFishingPondWater(x, y, zone, allowDock = true) {
    if (!zone) return { x, y };
    const footOffset = 38;
    const checkY = y + footOffset;

    if (allowDock && this.isPointOnPondDock(x, checkY, zone)) {
      return { x, y };
    }

    const rad = ((zone.angle || 7) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rx = (zone.rx || 305) + 6;
    const ry = (zone.ry || 175) + 6;
    const dx = x - zone.cx;
    const dy = checkY - zone.cy;
    const nx = cos * dx + sin * dy;
    const ny = -sin * dx + cos * dy;
    const norm = (nx * nx) / (rx * rx) + (ny * ny) / (ry * ry);
    if (norm >= 1) {
      return { x, y };
    }
    const angle = Math.atan2(ny / ry, nx / rx);
    const safeNx = Math.cos(angle) * (rx + 8);
    const safeNy = Math.sin(angle) * (ry + 8);
    return {
      x: Math.round(zone.cx + cos * safeNx - sin * safeNy),
      y: Math.round(zone.cy + sin * safeNx + cos * safeNy - footOffset)
    };
  }

  /**
   * Khởi tạo Hồ Câu Lá Sen:
   * - Gộp 2 điểm câu thành 1 vòng tròn xanh dương duy nhất trên mũi cầu gỗ (668, 426)
   * - Khi bé đi tới đứng trong vòng tròn xanh mới hiện nút "🎣 Bắt đầu câu cá" (#btn-start-fishing-dock)
   * - Cuốn sách Sổ Huy Hiệu (🏅) đặt ở vị trí mới trên mái hiên nhà (985, 230)
   * - Tạo 5 thực thể cá bơi 8 hướng, ngoi lên, lặn xuống tự nhiên trong lòng hồ
   */
  initFishingPondStations(stations, waterZone) {
    this.fishingStationContainers = [];
    this.pondFishes = [];

    // Hiệu ứng gợn nước trong lòng hồ + 5 bạn cá bơi 8 hướng, ngoi lên lặn xuống
    if (waterZone) {
      for (let i = 0; i < 4; i++) {
        const rx = waterZone.cx + Phaser.Math.Between(-150, 80);
        const ry = waterZone.cy + Phaser.Math.Between(-85, 80);
        const ripple = this.add.ellipse(rx, ry, 46, 20).setStrokeStyle(2, 0xffffff, 0.4).setDepth(2);
        this.tweens.add({
          targets: ripple,
          scaleX: { from: 0.6, to: 1.65 },
          scaleY: { from: 0.6, to: 1.65 },
          alpha: { from: 0.5, to: 0 },
          duration: 2400 + i * 350,
          repeat: -1,
          delay: i * 450
        });
      }

      const sheetKeys = [
        'fish_pond_swim_8dir',
        'fish_orange_swim_8dir',
        'fish_cloud_swim_8dir',
        'fish_pond_swim_8dir',
        'fish_orange_swim_8dir'
      ];
      const spawnPoints = [
        { x: 380, y: 395 },
        { x: 440, y: 440 },
        { x: 360, y: 450 },
        { x: 460, y: 380 },
        { x: 420, y: 480 }
      ];
      for (let i = 0; i < 5; i++) {
        const texKey = this.textures.exists(sheetKeys[i]) ? sheetKeys[i] : 'fish_pond_swim_8dir';
        if (this.textures.exists(texKey)) {
          const pondFish = new PondFish(this, {
            id: `pond_fish_${i + 1}`,
            textureKey: texKey,
            x: spawnPoints[i].x,
            y: spawnPoints[i].y,
            scale: 0.42 + (i % 3) * 0.04,
            speed: 38 + i * 5,
            pondBounds: {
              cx: 425,
              cy: 425,
              rx: 135,
              ry: 95
            }
          });
          this.pondFishes.push(pondFish);
        }
      }
    }

    // Vẽ vòng tròn xanh dương phát sáng tại điểm câu chỉ định trên cầu gỗ (tâm hero 688, 360; chân đứng 688, 398)
    const dockSpotX = 688;
    const dockSpotY = 360;
    const dockFeetY = 398;
    const dockCircleContainer = this.add.container(dockSpotX, dockFeetY).setDepth(5);
    const outerGlow = this.add.ellipse(0, 0, 56, 30, 0x38bdf8, 0.32);
    outerGlow.setStrokeStyle(2.5, 0x0284c7, 0.94);
    const innerRing = this.add.ellipse(0, 0, 38, 20, 0xe0f2fe, 0.40);
    innerRing.setStrokeStyle(2, 0xffffff, 0.92);
    dockCircleContainer.add([outerGlow, innerRing]);
    this.fishingDockBlueCircle = dockCircleContainer;

    this.tweens.add({
      targets: outerGlow,
      scaleX: { from: 0.92, to: 1.15 },
      scaleY: { from: 0.92, to: 1.15 },
      alpha: { from: 0.38, to: 0.14 },
      duration: 1350,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Vùng chạm rộng khắp mặt cầu gỗ: chạm vào để bé đi tới đứng vào bến câu hoặc bắt đầu câu ngay
    const dockStation = stations.find(s => s.id === 'station_lotus_dock') || {
      id: 'station_lotus_dock',
      name: 'Bến Câu',
      type: 'dock',
      dockId: 'lotus_dock',
      x: dockSpotX,
      y: dockSpotY,
      interactionPoint: { x: dockSpotX, y: dockSpotY },
      castTarget: { x: 485, y: 445 }
    };
    const dockTouchZone = this.add.zone(dockSpotX, 375, 140, 100)
      .setInteractive({ useHandCursor: true })
      .setDepth(16);
    dockTouchZone.on('pointerdown', (pointer) => {
      if (!this.isWorldPointer(pointer)) return;
      pointer?.event?.stopPropagation?.();
      this.handleFishingStationInteraction(dockStation);
    });

    // Khởi tạo nút DOM "🎣 Bắt đầu câu cá"
    this.mountDockStartFishingButton(dockStation);

    stations.forEach((st) => {
      // Ẩn hoàn toàn 2 nhãn câu cá màu xanh trên map (station_lotus_dock, station_sunny_dock)
      // và các trạm phụ (otter_guide, prep_basket). Chỉ giữ lại icon Huy Hiệu 🏅 trên mái hiên nhà (985, 230)!
      const isHiddenStation =
        st.type === 'dock' ||
        st.type === 'otter_guide' ||
        st.type === 'prep_basket';
      const container = this.add.container(st.x, st.y).setDepth(6);
      if (isHiddenStation) {
        container.setVisible(false);
        this.fishingStationContainers.push({ data: st, container, touchZone: st.id === 'station_lotus_dock' ? dockTouchZone : null });
        return;
      }

      const pillBg = this.add.graphics();
      const fillColor = 0x7c3aed;
      const w = 74;
      const h = 44;
      pillBg.fillStyle(fillColor, 0.95);
      pillBg.fillRoundedRect(-w / 2, -h / 2, w, h, 22);
      pillBg.lineStyle(3, 0xffffff, 0.96);
      pillBg.strokeRoundedRect(-w / 2, -h / 2, w, h, 22);

      const iconText = st.badge || st.icon || '📖';
      const label = this.add.text(0, 0, iconText, {
        fontFamily: 'Quicksand, Nunito, Segoe UI, sans-serif',
        fontSize: '21px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);

      container.add([pillBg, label]);

      this.tweens.add({
        targets: container,
        y: st.y - 6,
        duration: 1450,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      const touchZone = this.add.zone(st.x, st.y, 100, 80)
        .setInteractive({ useHandCursor: true })
        .setDepth(16);
      touchZone.on('pointerdown', (pointer) => {
        if (!this.isWorldPointer(pointer)) return;
        pointer?.event?.stopPropagation?.();
        this.handleFishingStationInteraction(st);
      });

      this.fishingStationContainers.push({ data: st, container, touchZone });
    });
  }

  /**
   * Tạo nút bấm "🎣 Bắt đầu câu cá" chỉ hiển thị khi bé đứng trong vòng tròn xanh dương trên cầu gỗ (668, 426)
   */
  mountDockStartFishingButton(dockStation) {
    if (this.dockStartFishingBtnEl) {
      this.dockStartFishingBtnEl.remove();
      this.dockStartFishingBtnEl = null;
    }
    const oldBtn = document.getElementById('btn-start-fishing-dock');
    if (oldBtn) oldBtn.remove();

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btn-start-fishing-dock';
    btn.className = 'dock-start-fishing-btn';
    btn.style.display = 'none';
    btn.innerHTML = `
      <span class="dock-start-fishing-icon">🎣</span>
      <span class="dock-start-fishing-label">Bắt đầu câu cá</span>
    `;
    const handleStartFishing = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const curFishing = window.__fishingSystem?.getState?.() || {};
      if ((curFishing.basket?.length || 0) >= 6) {
        this.showBasketFullNoticeModal();
        return;
      }
      this.startOnMapFishing(dockStation);
    };
    btn.addEventListener('click', handleStartFishing);
    btn.addEventListener('pointerdown', handleStartFishing);
    btn.addEventListener('touchstart', handleStartFishing, { passive: false });

    // Xoá bỏ hoàn toàn phần nút Skill thêm cá theo yêu cầu người chơi
    const oldSkillBtn = document.getElementById('btn-fishing-skill-dock');
    if (oldSkillBtn) oldSkillBtn.remove();
    this.dockFishingSkillBtnEl = null;

    const gameRoot = document.getElementById('game-root') || document.body;
    gameRoot.appendChild(btn);
    this.dockStartFishingBtnEl = btn;

    if (this.hero) {
      this.updateDockFishingProximityButton(this.hero.getX(), this.hero.getY());
    }
  }

  /**
   * Kiểm tra khoảng cách của bé tới vòng tròn xanh trên cầu gỗ (668, 384..426):
   * Chỉ khi bé đứng trong vùng khoanh xanh (<= 78px) và chưa quăng cần thì mới hiện button "🎣 Bắt đầu câu cá"
   */
  updateDockFishingProximityButton(heroX, heroY) {
    if (!this.dockStartFishingBtnEl) return;
    if (this.currentMapId !== 'map_fishing_pond' || this.onMapFishingState) {
      this.dockStartFishingBtnEl.style.display = 'none';
      if (this.dockFishingSkillBtnEl) this.dockFishingSkillBtnEl.style.display = 'none';
      return;
    }
    const dist = Math.hypot(heroX - 688, heroY - 360);
    const isOnDock = (heroX >= 615 && heroX <= 830 && heroY >= 290 && heroY <= 425) || dist <= 85;
    this.dockStartFishingBtnEl.style.display = isOnDock ? 'inline-flex' : 'none';
    if (this.dockFishingSkillBtnEl) {
      this.dockFishingSkillBtnEl.style.display = 'none';
    }
    if (isOnDock) {
      this.dockStartFishingBtnEl.style.left = '50%';
      this.dockStartFishingBtnEl.style.top = '34%';
      const curFishing = window.__fishingSystem?.getState?.() || {};
      const isBasketFull = (curFishing.basket?.length || 0) >= 6;
      if (isBasketFull) {
        this.dockStartFishingBtnEl.classList.add('basket-full-btn');
        this.dockStartFishingBtnEl.innerHTML = `
          <span class="dock-start-fishing-icon">🧺</span>
          <span class="dock-start-fishing-label">Túi đầy rồi (6/6) · Đi đổi cá nhé!</span>
        `;
      } else {
        this.dockStartFishingBtnEl.classList.remove('basket-full-btn');
        this.dockStartFishingBtnEl.innerHTML = `
          <span class="dock-start-fishing-icon">🎣</span>
          <span class="dock-start-fishing-label">Bắt đầu câu cá</span>
        `;
      }
    }
  }

  handleFishingStationInteraction(st, customCastTarget = null) {
    if (!st || !this.hero) return;
    if (st.type === 'fish_book') {
      const targetX = st.interactionPoint?.x ?? st.x;
      const targetY = st.interactionPoint?.y ?? st.y;
      this.activeFishingStationVisit = st.id;
      this.hero.moveTo(targetX, targetY, () => {
        if (this.activeFishingStationVisit !== st.id || !this.sys.isActive()) return;
        window.dispatchEvent(new CustomEvent('game:open-fishing-station', { detail: { station: st } }));
      });
      return;
    }

    if (st.type === 'prep_basket') {
      window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'bag' } }));
      return;
    }

    // Trạm câu cá ('dock' tại vòng tròn trên cầu gỗ: heroX=688, heroY=360, chân đứng 398):
    const curFishingState = window.__fishingSystem?.getState?.() || {};
    if ((curFishingState.basket?.length || 0) >= 6) {
      this.showBasketFullNoticeModal();
      return;
    }

    const dockX = 688;
    const dockY = 360;
    const curDist = Math.hypot(this.hero.getX() - dockX, this.hero.getY() - dockY);
    this.activeFishingStationVisit = st.id;

    // Nếu đã ở bến câu (trong khoảng cách 85px): BẤM LÀ BẮT ĐẦU CÂU CÁ NGAY LẬP TỨC!
    if (curDist <= 85) {
      this.updateDockFishingProximityButton(this.hero.getX(), this.hero.getY());
      if (!this.onMapFishingState) {
        this.startOnMapFishing(st, customCastTarget);
      }
      return;
    }

    this.stopOnMapFishing();
    const startX = this.hero.getX();
    const startY = this.hero.getY();
    const originalSpeed = this.hero.speed;
    this.hero.speed = 220; // Di chuyển nhịp nhàng, tới bến nhanh hơn

    const arriveAtDock = () => {
      this.hero.speed = originalSpeed;
      if (this.activeFishingStationVisit !== st.id || !this.sys.isActive()) return;
      this.hero.facing = 'left';
      this.hero.isMoving = false;
      if (this.hero.sprite) {
        this.hero.sprite.setFlipX(false);
        const idleLeftKey = `${this.hero.getAnimPrefix()}_idle_left`;
        if (this.anims.exists(idleLeftKey)) {
          this.hero.sprite.play(idleLeftKey, true);
        }
      }
      this.updateDockFishingProximityButton(this.hero.getX(), this.hero.getY());
    };

    if (startX < 610) {
      const waypointY = startY > 400 ? 620 : 205;
      this.hero.moveTo(780, waypointY, () => {
        if (this.activeFishingStationVisit !== st.id || !this.sys.isActive()) return;
        this.hero.moveTo(780, dockY, () => {
          if (this.activeFishingStationVisit !== st.id || !this.sys.isActive()) return;
          this.hero.moveTo(dockX, dockY, arriveAtDock);
        });
      });
    } else {
      this.hero.moveTo(dockX, dockY, arriveAtDock);
    }
  }

  /**
   * Dọn dẹp trạng thái câu cá trực tiếp trên map
   */
  stopOnMapFishing(cancelTurn = true) {
    this.cleanupBiteCatchPrompt();
    if (this.onMapFishingRaf) {
      cancelAnimationFrame(this.onMapFishingRaf);
      this.onMapFishingRaf = null;
    }
    if (this.onMapFishingBiteTimer) {
      clearTimeout(this.onMapFishingBiteTimer);
      this.onMapFishingBiteTimer = null;
    }
    if (this.onMapFishingKeyHandler) {
      window.removeEventListener('keydown', this.onMapFishingKeyHandler);
      this.onMapFishingKeyHandler = null;
    }
    if (this.onMapAuditionEl) {
      this.onMapAuditionEl.remove();
      this.onMapAuditionEl = null;
    }
    if (this.onMapFishingLine) {
      this.onMapFishingLine.destroy();
      this.onMapFishingLine = null;
    }
    if (this.onMapBobber) {
      this.onMapBobber.destroy();
      this.onMapBobber = null;
    }
    if (this.onMapRodContainer) {
      this.onMapRodContainer.destroy();
      this.onMapRodContainer = null;
    }
    if (this.onMapFishShadow) {
      this.onMapFishShadow.destroy();
      this.onMapFishShadow = null;
    }
    if (this.onMapBiteExclamation) {
      this.onMapBiteExclamation.destroy();
      this.onMapBiteExclamation = null;
    }
    if (cancelTurn && this.onMapFishingState?.phase === 'casting') {
      window.__fishingSystem?.cancelTurnBeforeBite?.();
    }
    this.onMapFishingState = null;
    if (this.hero) {
      this.updateDockFishingProximityButton(this.hero.getX(), this.hero.getY());
    }
  }

  /**
   * Hiệu ứng VFX khi quăng cần & phao chạm mặt nước (Requirement 3)
   */
  spawnFishingCastVfx(rodTipX, rodTipY, castX, castY) {
    // Hạt giọt nước lấp lánh bay theo đường cong từ đầu cần xuống điểm thả phao
    for (let i = 1; i <= 5; i++) {
      const t = i / 6;
      const px = rodTipX + (castX - rodTipX) * t;
      const py = rodTipY + (castY - rodTipY) * t - Math.sin(t * Math.PI) * 42;
      const drop = this.add.circle(px, py, 4, 0xbae6fd, 0.9).setDepth(24);
      this.tweens.add({
        targets: drop,
        y: py + 14,
        alpha: 0,
        scale: 0.2,
        delay: i * 35,
        duration: 320,
        onComplete: () => drop.destroy()
      });
    }

    // 3 vòng sóng nước đồng tâm tỏa sáng tại điểm phao rơi
    for (let r = 0; r < 3; r++) {
      const ring = this.add.ellipse(castX, castY + 4, 24, 12)
        .setStrokeStyle(3 - r * 0.6, r === 0 ? 0xffffff : 0x38bdf8, 0.9)
        .setDepth(21);
      this.tweens.add({
        targets: ring,
        scaleX: 2.4 + r * 0.55,
        scaleY: 2.1 + r * 0.45,
        alpha: 0,
        delay: r * 110,
        duration: 720,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy()
      });
    }

    this.spawnStationParticles(castX, castY, ['💦', '✨', '🫧'], 0x38bdf8);
  }

  /**
   * Hiệu ứng VFX khi cá cắn câu thật (Requirement 3)
   */
  spawnFishingBiteVfx(castX, castY) {
    // Vòng sóng vàng cam bùng nổ báo hiệu cá đớp phao
    for (let i = 0; i < 2; i++) {
      const shock = this.add.ellipse(castX, castY + 4, 32, 16)
        .setStrokeStyle(3.5, i === 0 ? 0xfacc15 : 0xf97316, 0.95)
        .setDepth(22);
      this.tweens.add({
        targets: shock,
        scaleX: 2.8 + i * 0.6,
        scaleY: 2.4 + i * 0.5,
        alpha: 0,
        delay: i * 90,
        duration: 580,
        ease: 'Back.easeOut',
        onComplete: () => shock.destroy()
      });
    }

    this.cameras?.main?.shake?.(130, 0.0025);
    this.spawnStationParticles(castX, castY, ['💦', '⚡', '✨', '🫧'], 0xfacc15);
  }

  /**
   * Câu cá trực tiếp ngay trên bản đồ Hồ Câu Lá Sen (khi bé đứng ở vòng tròn xanh 668, 426 và bấm Bắt đầu câu cá)
   */
  startOnMapFishing(st, customCastTarget = null) {
    const fishingSystem = window.__fishingSystem;
    if (!fishingSystem || !this.hero?.sprite) return;

    this.stopOnMapFishing(true);

    // Tự động trang bị cần câu khởi đầu nếu bé chưa có cần trong tay phải
    let fState = fishingSystem.getState();
    if (!fState.ownedRods || fState.ownedRods.length === 0) {
      fishingSystem.borrowStarterKit();
      fState = fishingSystem.getState();
    }
    if (!fState.equippedRod || !fState.ownedRods.includes(fState.equippedRod)) {
      fishingSystem.equipRod(fState.ownedRods[0] || 'rod_lotus');
      fState = fishingSystem.getState();
    }

    // Kiểm tra mồi câu trong Túi Của Bé (trừ đi khi câu cá)
    let curBaitId = fState.equippedBait || 'bait_lotus';
    if ((fState.baits?.[curBaitId] || 0) <= 0) {
      const availableBait = Object.keys(fState.baits || {}).find(k => (fState.baits[k] || 0) > 0);
      if (availableBait) {
        fishingSystem.equipBait(availableBait);
        curBaitId = availableBait;
      } else {
        fishingSystem.borrowStarterKit();
        fishingSystem.equipBait('bait_lotus');
        curBaitId = 'bait_lotus';
        this.spawnFloatingPopup(this.hero.getX(), this.hero.getY() - 55, '+5 🌿🎒', '#16a34a');
      }
      fState = fishingSystem.getState();
    }

    const turnRes = fishingSystem.startFishingTurn(st?.dockId || 'lotus_dock');
    if (!turnRes.ok) {
      if (turnRes.reason === 'basket_full') {
        this.showBasketFullNoticeModal();
      }
      return;
    }

    const turn = turnRes.turn;
    const heroX = this.hero.getX();
    const heroY = this.hero.getY();
    const castX = customCastTarget?.x ?? st?.castTarget?.x ?? 485;
    const castY = customCastTarget?.y ?? st?.castTarget?.y ?? 445;

    // Đảm bảo nhân vật đứng chuẩn xác tại bến câu (688, 360) khi bắt đầu câu cá
    const dockX = 688;
    const dockY = 360;
    this.hero.setPosition(dockX, dockY);
    this.hero.updateShadow?.();

    // 1. Hướng nhân vật khi câu cá: Quay mặt ra hồ nước (bên trái)
    this.hero.facing = 'left';
    this.hero.isMoving = false;
    if (this.hero.sprite) {
      this.hero.sprite.setFlipX(false);
      const idleLeftKey = `${this.hero.getAnimPrefix()}_idle_left`;
      if (this.anims.exists(idleLeftKey)) {
        this.hero.sprite.play(idleLeftKey, true);
      }
    }

    // 2. Ẩn nút "🎣 Bắt đầu câu cá" và nút Skill trong lúc đang thả câu
    if (this.dockStartFishingBtnEl) {
      this.dockStartFishingBtnEl.style.display = 'none';
    }
    if (this.dockFishingSkillBtnEl) {
      this.dockFishingSkillBtnEl.style.display = 'none';
    }
    this.spawnFloatingPopup(this.hero.getX(), this.hero.getY() - 56, '🎣 Thả cần...', '#38bdf8');

    // 3. Hiển thị cần câu cắm ở bến hồ hướng tự nhiên về phía phao trên mặt hồ (bé vẫn đi lại tự do)
    const equippedRodObj = RODS.find(r => r.id === fState.equippedRod) || RODS[0];
    const equippedBaitObj = BAITS.find(b => b.id === curBaitId) || BAITS[0];
    // Cắm cần câu chắc chắn ở mép gỗ trước mặt bé (652, 340)
    const rodBaseX = 652;
    const rodBaseY = 340;

    const scaleSize = 88;
    const rodLength = 94; // Chiều dài cần câu vươn từ chuôi cắm bến câu (~94px)
    let rodTipX, rodTipY;

    this.onMapRodContainer = this.add.container(rodBaseX, rodBaseY).setDepth(21);

    // Tính góc chuẩn từ chuôi cần cắm bến hướng thẳng êm ái ra phao câu trên hồ:
    const targetRad = Math.atan2(castY - rodBaseY, castX - rodBaseX);
    // Cần câu chúc nhẹ theo trọng lực và hướng tự nhiên về phía phao câu
    const desiredAngle = targetRad - 0.06;
    // Ảnh gốc có góc nghiêng -45° (-Math.PI / 4) từ chuôi (0.12, 0.88) tới ngọn (0.88, 0.12)
    const rotRad = desiredAngle - (-Math.PI / 4);

    rodTipX = rodBaseX + Math.cos(desiredAngle) * rodLength;
    rodTipY = rodBaseY + Math.sin(desiredAngle) * rodLength;

    // Tạo hình Cần Câu theo Cấp Độ (Level 1..5) xoay chuẩn từ bến câu hướng ra hồ
    const heldKey = `${equippedRodObj.id}_held`;
    if (this.textures.exists(heldKey)) {
      const rodSprite = this.add.image(0, 0, heldKey);
      rodSprite.setDisplaySize(scaleSize, scaleSize);
      rodSprite.setOrigin(0.12, 0.88);
      rodSprite.setRotation(rotRad);
      this.onMapRodContainer.add(rodSprite);
    } else {
      const rodStick = this.add.graphics();
      const rodColor = Phaser.Display.Color.HexStringToColor(equippedRodObj.glowColor || '#84cc16').color;
      rodStick.lineStyle(6, 0x78350f, 1);
      rodStick.beginPath();
      rodStick.moveTo(0, 0);
      rodStick.lineTo(rodTipX - rodBaseX, rodTipY - rodBaseY);
      rodStick.strokePath();
      rodStick.fillStyle(rodColor, 1);
      rodStick.fillCircle(rodTipX - rodBaseX, rodTipY - rodBaseY, 5);
      this.onMapRodContainer.add(rodStick);
    }

    // Vẽ dây câu cong mềm mại từ đầu cần câu tới phao câu dưới mặt hồ
    this.onMapFishingLine = this.add.graphics().setDepth(22);
    const drawFishingLine = (bx, by, tension = 0) => {
      if (!this.onMapFishingLine) return;
      this.onMapFishingLine.clear();
      this.onMapFishingLine.lineStyle(2.5, 0xffffff, 0.94);
      const midX = (rodTipX + bx) / 2;
      const midY = (rodTipY + by) / 2 + (tension ? -6 : 24);
      const curve = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(rodTipX, rodTipY),
        new Phaser.Math.Vector2(midX, midY),
        new Phaser.Math.Vector2(bx, by)
      );
      curve.draw(this.onMapFishingLine, 24);
    };
    drawFishingLine(castX, castY, 0);

    // Tạo phao câu 3D nổi trên mặt hồ + VFX quăng phao
    this.onMapBobber = this.add.container(castX, castY).setDepth(23);
    const bobberRipple = this.add.ellipse(0, 6, 38, 18).setStrokeStyle(2.5, 0xffffff, 0.8);
    this.onMapBobber.add(bobberRipple);

    if (this.textures.exists('bobber_float_3d')) {
      const bobberSprite = this.add.image(0, -4, 'bobber_float_3d').setDisplaySize(40, 40);
      this.onMapBobber.add(bobberSprite);
    } else {
      const bobberBottom = this.add.circle(0, 0, 9, 0xffffff, 1);
      const bobberTop = this.add.circle(0, -5, 8, 0xef4444, 1);
      const bobberStick = this.add.rectangle(0, -13, 3, 10, 0xfacc15, 1);
      this.onMapBobber.add([bobberBottom, bobberTop, bobberStick]);
    }

    this.tweens.add({
      targets: bobberRipple,
      scaleX: { from: 0.7, to: 1.65 },
      scaleY: { from: 0.7, to: 1.65 },
      alpha: { from: 0.85, to: 0 },
      duration: 1050,
      repeat: -1
    });

    this.spawnFishingCastVfx(rodTipX, rodTipY, castX, castY);
    window.__audioService?.playCastRod?.();
    setTimeout(() => window.__audioService?.playBobberSplash?.(), 380);

    // Gọi 1 thực thể cá trong hồ bơi 8 hướng lại gần phao câu
    this.activeBitingPondFish = null;
    if (Array.isArray(this.pondFishes) && this.pondFishes.length > 0) {
      let nearestFish = this.pondFishes[0];
      let bestDist = Infinity;
      for (const pf of this.pondFishes) {
        const d = Math.hypot((pf.x || 0) - castX, (pf.y || 0) - castY);
        if (d < bestDist) {
          bestDist = d;
          nearestFish = pf;
        }
      }
      this.activeBitingPondFish = nearestFish;
      nearestFish.approachBobber(castX, castY);
    }

    window.__audioService?.playChime?.(580, 0.14);

    const neededHits = 1;
    const zoneHeight = 38 + (equippedRodObj?.auditionZoneBonus || 0);
    const zoneTop = Math.max(12, Math.round(41 - zoneHeight / 2));
    const biteTimeMs = equippedRodObj?.biteTimeMs || 650;
    this.onMapFishingState = {
      phase: 'casting',
      turn,
      rod: equippedRodObj,
      species: null,
      weightG: 250,
      castX,
      castY,
      rodTipX,
      rodTipY,
      neededHits,
      currentHits: 0,
      markerPct: 50,
      markerDir: 1,
      zoneTop,
      zoneHeight,
      drawFishingLine
    };

    // Cần câu càng xịn thì cá đớp phao càng nhanh (650ms -> 420ms -> 260ms)
    this.onMapFishingBiteTimer = setTimeout(() => {
      if (!this.sys?.isActive() || !this.onMapFishingState) return;
      const biteRes = fishingSystem.commitRealBite(true);
      if (!biteRes.ok) {
        this.stopOnMapFishing(false);
        return;
      }

      const spId = biteRes.species?.id || 'cloud_fish';
      const diff = (typeof FISH_DIFFICULTY_PROFILES !== 'undefined' && FISH_DIFFICULTY_PROFILES[spId]) || {
        requiredHits: biteRes.species?.requiredHits || 2,
        zoneHeight: biteRes.species?.zoneHeight || 36,
        markerSpeed: biteRes.species?.markerSpeed || 80,
        label: `${biteRes.species?.requiredHits || 2} Lần Canh`
      };

      const targetHits = diff.requiredHits;
      const baseZoneHeight = Math.max(12, Math.min(60, diff.zoneHeight + (equippedRodObj?.auditionZoneBonus || 0)));
      const markerSpeed = diff.markerSpeed;

      this.onMapFishingState.phase = 'bite_waiting';
      this.onMapFishingState.turn = biteRes.turn || turn;
      this.onMapFishingState.species = biteRes.species;
      this.onMapFishingState.weightG = biteRes.weightG || 250;
      this.onMapFishingState.diff = diff;
      this.onMapFishingState.targetHits = targetHits;
      this.onMapFishingState.currentHits = 0;
      this.onMapFishingState.neededHits = targetHits;
      this.onMapFishingState.targetSteps = targetHits;
      this.onMapFishingState.currentStep = 0;
      this.onMapFishingState.zoneHeight = baseZoneHeight;
      this.onMapFishingState.zoneTop = Math.max(12, Math.round(42 - baseZoneHeight / 2));
      this.onMapFishingState.markerSpeed = markerSpeed;
      const updatedState = fishingSystem.getState();
      const remainingBait = updatedState.baits?.[curBaitId] ?? 0;

      // Cá trong hồ ngoi lên đớp phao + VFX sóng vàng tung tóe
      if (this.activeBitingPondFish) {
        this.activeBitingPondFish.biteAtBobber(castX, castY);
      }
      this.spawnFishingBiteVfx(castX, castY);
      window.__audioService?.playFishBite?.();

      // Hiệu ứng VFX ui/exclamation trên đầu nhân vật khi cá cắn mồi!
      this.hero?.playExclamationVFX?.();

      // Hiệu ứng trừ 1 mồi câu trực quan trên đầu bé
      this.spawnFloatingPopup(heroX, heroY - 58, `-1 ${equippedBaitObj.icon || '🌿'} (${remainingBait})`, '#0284c7');
      window.__audioService?.playChime?.(760, 0.18);

      // Phao câu nhấp nhô mạnh báo hiệu cá cắn câu
      if (this.onMapBobber) {
        this.tweens.add({
          targets: this.onMapBobber,
          y: castY + 10,
          duration: 150,
          yoyo: true,
          repeat: -1
        });
      }
      drawFishingLine(castX, castY, 1);

      // Hiển thị nút "🎣 BẮT!" rung rung giữa màn hình với thời gian đếm ngược 5 giây
      this.mountBiteCatchPrompt();
    }, biteTimeMs);
  }

  /**
   * Hiển thị nút "BẮT" rung rung giữa màn hình với 5s đếm ngược khi cá cắn mồi.
   * Bé có 5 giây để bấm "BẮT":
   * - Nếu bấm trong 5s: Bắt đầu audition để bắt cá như hiện tại.
   * - Nếu hết 5s chưa bấm: Cá vuột mất và bơi đi.
   */
  mountBiteCatchPrompt() {
    const st = this.onMapFishingState;
    if (!st) return;

    this.cleanupBiteCatchPrompt();

    // 1. Tạo container cố định ở chính giữa màn hình (đặt ở top 60% để không che nhân vật và bến câu)
    const container = document.createElement('div');
    container.id = 'onmap-bite-catch-container';
    container.className = 'onmap-bite-catch-container';
    container.style.cssText = `
      position: fixed;
      left: 50%;
      top: 60%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      pointer-events: auto;
      user-select: none;
      -webkit-user-select: none;
      animation: biteContainerPop 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    // Nhúng style CSS hiệu ứng rung rung rực rỡ và đếm ngược nếu chưa có
    if (!document.getElementById('bite-catch-keyframes-style')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'bite-catch-keyframes-style';
      styleTag.textContent = `
        @keyframes biteContainerPop {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes biteRumbleShake {
          0% { transform: scale(1) translate(0, 0) rotate(0deg); }
          12% { transform: scale(1.1) translate(-6px, 3px) rotate(-5deg); }
          25% { transform: scale(1.12) translate(6px, -3px) rotate(5deg); }
          38% { transform: scale(1.1) translate(-5px, -2px) rotate(-4deg); }
          50% { transform: scale(1.14) translate(5px, 2px) rotate(4deg); }
          62% { transform: scale(1.1) translate(-4px, 2px) rotate(-3deg); }
          75% { transform: scale(1.12) translate(4px, -2px) rotate(3deg); }
          88% { transform: scale(1.1) translate(-3px, 1px) rotate(-1deg); }
          100% { transform: scale(1) translate(0, 0) rotate(0deg); }
        }
        @keyframes biteGlowRingPulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.85), 0 10px 28px rgba(220, 38, 38, 0.65); }
          50% { box-shadow: 0 0 0 26px rgba(239, 68, 68, 0), 0 16px 36px rgba(234, 88, 12, 0.75); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0), 0 10px 28px rgba(220, 38, 38, 0.65); }
        }
        .btn-bite-catch-shaking {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: linear-gradient(135deg, #ef4444 0%, #ea580c 45%, #facc15 100%);
          border: 4.5px solid #ffffff;
          border-radius: 9999px;
          padding: 18px 48px;
          font-family: inherit;
          font-size: 34px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 1.5px;
          text-shadow: 0 3px 6px rgba(0,0,0,0.45);
          cursor: pointer;
          animation: biteRumbleShake 0.35s infinite ease-in-out, biteGlowRingPulse 1.1s infinite ease-out;
          transition: transform 0.1s ease;
          outline: none;
        }
        .btn-bite-catch-shaking:hover {
          filter: brightness(1.1);
        }
        .btn-bite-catch-shaking:active {
          transform: scale(0.92) !important;
        }
        .bite-timer-bar-wrap {
          width: 240px;
          height: 12px;
          background: rgba(0, 0, 0, 0.55);
          border: 2px solid #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .bite-timer-bar-fill {
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, #22c55e, #eab308, #ef4444);
          transition: width 0.05s linear;
        }
        .bite-timer-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 0, 0, 0.72);
          color: #fef08a;
          padding: 5px 18px;
          border-radius: 20px;
          font-size: 16px;
          font-weight: 800;
          border: 1.5px solid rgba(254, 240, 138, 0.7);
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        }
      `;
      document.head.appendChild(styleTag);
    }

    container.innerHTML = `
      <button id="btn-onmap-fishing-catch" class="btn-bite-catch-shaking" type="button" aria-label="Bắt cá ngay">
        <span style="font-size: 40px; line-height: 1;">🎣</span>
        <span>BẮT!</span>
      </button>
      <div class="bite-timer-label">
        <span>⏱️</span>
        <span>Bấm nhanh: <strong id="bite-timer-val">5.0</strong>s</span>
      </div>
      <div class="bite-timer-bar-wrap">
        <div id="bite-timer-bar-fill" class="bite-timer-bar-fill"></div>
      </div>
    `;

    const gameRoot = document.getElementById('game-root') || document.body;
    gameRoot.appendChild(container);
    this.onMapBiteCatchEl = container;

    const catchBtn = container.querySelector('#btn-onmap-fishing-catch');
    const timerValEl = container.querySelector('#bite-timer-val');
    const timerBarEl = container.querySelector('#bite-timer-bar-fill');

    const totalDurationMs = 5000;
    const startTime = Date.now();

    // 2. Xử lý khi bé bấm nút "BẮT!"
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
    };

    if (catchBtn) {
      catchBtn.addEventListener('click', handleCatch);
      catchBtn.addEventListener('pointerdown', handleCatch);
      catchBtn.addEventListener('touchstart', handleCatch, { passive: false });
    }

    // Cho phép bấm phím Space hoặc Enter để BẮT cho thuận tiện
    this.onMapFishingCatchKeyHandler = (ev) => {
      if (ev.code === 'Space' || ev.key === ' ' || ev.key === 'Enter') {
        ev.preventDefault();
        handleCatch();
      }
    };
    window.addEventListener('keydown', this.onMapFishingCatchKeyHandler);

    // 3. Cập nhật thanh thời gian và số giây đếm ngược mượt mà mỗi 50ms
    this.onMapFishingCatchInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingMs = Math.max(0, totalDurationMs - elapsed);
      const remainingSec = (remainingMs / 1000).toFixed(1);
      const pct = Math.max(0, Math.min(100, (remainingMs / totalDurationMs) * 100));

      if (timerValEl) timerValEl.textContent = remainingSec;
      if (timerBarEl) timerBarEl.style.width = `${pct}%`;

      if (remainingMs <= 0) {
        clearInterval(this.onMapFishingCatchInterval);
        this.onMapFishingCatchInterval = null;
      }
    }, 50);

    // 4. Nếu sau 5 giây bé chưa bấm -> Cá vụt mất và bơi đi!
    this.onMapFishingCatchTimeout = setTimeout(() => {
      if (!this.onMapFishingState || this.onMapFishingState.phase !== 'bite_waiting') return;

      this.cleanupBiteCatchPrompt();

      // Âm thanh và thông báo cá trốn thoát
      window.__audioService?.playChime?.(300, 0.22);
      this.spawnFloatingPopup(st.castX, st.castY - 48, '💨 Cá đã bơi mất rồi! Bé hãy thử lại nhé!', '#ef4444');
      this.spawnStationParticles(st.castX, st.castY, ['💦', '💨', '🫧'], 0x94a3b8);

      if (this.activeBitingPondFish && typeof this.activeBitingPondFish.swimAway === 'function') {
        this.activeBitingPondFish.swimAway();
      } else if (this.activeBitingPondFish && typeof this.activeBitingPondFish.resetBackToPond === 'function') {
        this.activeBitingPondFish.resetBackToPond();
      }

      window.__fishingSystem?.recordTurnMiss?.('escaped');
      this.stopOnMapFishing(false);
    }, totalDurationMs);
  }

  cleanupBiteCatchPrompt() {
    if (this.onMapFishingCatchTimeout) {
      clearTimeout(this.onMapFishingCatchTimeout);
      this.onMapFishingCatchTimeout = null;
    }
    if (this.onMapFishingCatchInterval) {
      clearInterval(this.onMapFishingCatchInterval);
      this.onMapFishingCatchInterval = null;
    }
    if (this.onMapFishingCatchKeyHandler) {
      window.removeEventListener('keydown', this.onMapFishingCatchKeyHandler);
      this.onMapFishingCatchKeyHandler = null;
    }
    if (this.onMapBiteCatchEl) {
      this.onMapBiteCatchEl.remove();
      this.onMapBiteCatchEl = null;
    }
  }

  /**
   * Hiển thị Thanh Audition Dọc (#onmap-fishing-audition) ngay trên bản đồ Hồ Câu Lá Sen
   */
  mountVerticalAuditionBar() {
    const st = this.onMapFishingState;
    if (!st) return;

    if (this.onMapAuditionEl) {
      this.onMapAuditionEl.remove();
    }

    const sp = st.species || { name: 'Cá Mây Tròn', icon: '🐟', asset: '/assets/fishing/fish_cloud.png', requiredHits: 1 };
    const assetSrc = sp.asset || '/assets/fishing/fish_cloud.png';
    const targetHits = st.targetHits || sp.requiredHits || 1;
    const curHit = st.currentHits || 0;
    const rod = st.rod || RODS[0];
    const diff = st.diff || { label: `${targetHits} Lần Canh` };

    // Tạo các ngôi sao lớn hiển thị số lượt canh yêu cầu (1 lần cho cá dễ, 2-5 lần cho cá khó)
    const starsHtml = Array.from({ length: targetHits }).map((_, idx) => {
      const isEarned = idx < curHit;
      return `
        <span class="onmap-audition-star ${isEarned ? 'earned' : ''}" data-star-index="${idx}" style="font-size:1.35rem;filter:${isEarned ? 'drop-shadow(0 0 6px #facc15)' : 'grayscale(1) opacity(0.32)'};transition:all 0.25s ease;">⭐</span>
      `;
    }).join('');

    const el = document.createElement('div');
    el.id = 'onmap-fishing-audition';
    el.className = 'onmap-fishing-audition';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Thanh thao tác kéo giựt câu cá');
    el.innerHTML = `
      <button type="button" class="onmap-audition-cancel" id="btn-onmap-cancel" title="Thu cần">✖</button>
      <div class="onmap-audition-fish-preview">
        <img src="${assetSrc}" alt="${sp.name}" />
        <div style="font-size:0.88rem;font-weight:900;color:#0f172a;margin-top:2px;">${sp.icon} ${sp.name}</div>
        <div class="onmap-audition-diff-pill" style="font-size:0.72rem;font-weight:900;color:#0369a1;background:#e0f2fe;border:1.5px solid #7dd3fc;border-radius:999px;padding:2px 8px;margin-top:2px;">
          ${diff.label || `${targetHits} Lần Canh`}
        </div>
        <div class="onmap-audition-stars" id="onmap-audition-stars" style="display:flex;justify-content:center;gap:3px;margin-top:3px;">
          ${starsHtml}
        </div>

      </div>
      <div class="fishing-vertical-track" id="fishing-vertical-track" data-orientation="vertical">
        <div class="fishing-vertical-zone" id="fishing-vertical-zone" style="top:${st.zoneTop}%;height:${st.zoneHeight}%;">
          <span>✨</span>
        </div>
        <div class="fishing-vertical-marker" id="fishing-vertical-marker" style="top:${st.markerPct}%;">
          <img src="${assetSrc}" alt="" />
        </div>
      </div>
      <button type="button" class="onmap-audition-pull-btn" id="btn-onmap-pull" aria-label="Kéo giựt cần câu">
        🎣
      </button>
      <div class="onmap-rod-perk-hint">${rod.icon} Lv.${rod.level || rod.tier || 1} (+${rod.pullStepGain || 1.0} bước)</div>
    `;

    const gameRoot = document.getElementById('game-root') || document.body;
    gameRoot.appendChild(el);
    this.onMapAuditionEl = el;


    el.querySelector('#btn-onmap-pull')?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.handleVerticalAuditionPull();
    });
    el.querySelector('#fishing-vertical-track')?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.handleVerticalAuditionPull();
    });
    el.querySelector('#btn-onmap-cancel')?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.stopOnMapFishing(false);
    });

    this.onMapFishingKeyHandler = (ev) => {
      if (ev.code === 'Space' || ev.code === 'Enter') {
        ev.preventDefault();
        this.handleVerticalAuditionPull();
      } else if (ev.code === 'Escape') {
        this.stopOnMapFishing(false);
      }
    };
    window.addEventListener('keydown', this.onMapFishingKeyHandler);

    let lastTs = performance.now();
    const tick = (now) => {
      if (!this.onMapFishingState || this.onMapFishingState.phase !== 'audition') return;
      const dt = Math.min(0.06, (now - lastTs) / 1000);
      lastTs = now;
      const speedPctPerSec = st.markerSpeed || 82;

      st.markerPct += st.markerDir * speedPctPerSec * dt;
      if (st.markerPct >= 92) {
        st.markerPct = 92;
        st.markerDir = -1;
      } else if (st.markerPct <= 8) {
        st.markerPct = 8;
        st.markerDir = 1;
      }

      const markerEl = this.onMapAuditionEl?.querySelector('#fishing-vertical-marker');
      if (markerEl) {
        markerEl.style.top = `${st.markerPct}%`;
      }
      this.onMapFishingRaf = requestAnimationFrame(tick);
    };
    this.onMapFishingRaf = requestAnimationFrame(tick);
  }

  /**
   * Xử lý thao tác KÉO GIỰT theo từng bước trên Thanh Audition 8 Bước
   */
  handleVerticalAuditionPull() {
    const st = this.onMapFishingState;
    if (!st || st.phase !== 'audition') return;

    const inZone =
      st.markerPct >= st.zoneTop - 5 &&
      st.markerPct <= st.zoneTop + st.zoneHeight + 5;
    const isPerfect = Math.abs(st.markerPct - (st.zoneTop + st.zoneHeight / 2)) <= 6;

    st.attempts = (st.attempts || 0) + 1;

    // Yêu cầu: Bấm trúng vùng canh mới được tính nhịp kéo
    if (inZone) {
      st.currentHits = (st.currentHits || 0) + 1;
      st.currentStep = st.currentHits;

      const targetHits = st.targetHits || 1;
      const curHit = st.currentHits;

      // 1. Rung camera màn hình nhẹ nhàng (Screen Shake)
      this.cameras?.main?.shake?.(130, isPerfect ? 0.005 : 0.0035);

      // 2. Rung xúc giác nhẹ trên thiết bị cảm ứng / mobile (Haptic Vibration)
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          navigator.vibrate(isPerfect ? [45, 25, 45] : 38);
        }
      } catch (e) {}

      // 3. Rung nhẹ giao diện Thanh Audition (UI Shake) & nảy nút kéo
      if (this.onMapAuditionEl) {
        this.onMapAuditionEl.classList.remove('audition-hit-shake');
        void this.onMapAuditionEl.offsetWidth;
        this.onMapAuditionEl.classList.add('audition-hit-shake');
        setTimeout(() => {
          this.onMapAuditionEl?.classList.remove('audition-hit-shake');
        }, 320);

        const pullBtn = this.onMapAuditionEl.querySelector('#btn-onmap-pull');
        if (pullBtn) {
          pullBtn.classList.remove('pull-btn-hit-bounce');
          void pullBtn.offsetWidth;
          pullBtn.classList.add('pull-btn-hit-bounce');
          setTimeout(() => pullBtn?.classList.remove('pull-btn-hit-bounce'), 300);
        }
      }

      // 4. Âm thanh và hiệu ứng
      const curPitch = 580 + curHit * 85;
      window.__audioService?.playChime?.(curPitch, 0.20);

      const popupText = isPerfect ? '⚡ HOÀN HẢO! +1 NHỊP' : '✨ CHÍNH XÁC! +1 NHỊP';
      const popupCol = isPerfect ? '#f59e0b' : '#38bdf8';
      this.spawnFloatingPopup(st.castX, st.castY - 48, popupText, popupCol);
      this.spawnStationParticles(st.castX, st.castY, ['💦', '✨', '⭐', '🫧'], 0x38bdf8);

      // Hiệu ứng cần câu rung uốn cong khi kéo giật
      if (this.onMapRodContainer) {
        this.tweens.add({
          targets: this.onMapRodContainer,
          angle: { from: -8, to: 8 },
          duration: 90,
          yoyo: true,
          repeat: 2,
          onComplete: () => this.onMapRodContainer?.setAngle?.(0)
        });
      }

      // Cập nhật số sao sáng trực quan trên thanh Audition
      const starEls = this.onMapAuditionEl?.querySelectorAll('.onmap-audition-star');
      if (starEls) {
        starEls.forEach((node, idx) => {
          const earned = idx < curHit;
          node.classList.toggle('earned', earned);
          node.style.filter = earned ? 'drop-shadow(0 0 6px #facc15)' : 'grayscale(1) opacity(0.32)';
          if (earned) {
            node.style.transform = 'scale(1.25)';
            setTimeout(() => { if (node) node.style.transform = 'scale(1)'; }, 200);
          }
        });
      }

      // Khi đã hoàn tất đủ số lần yêu cầu (1 lần với cá dễ, 2-5 lần với cá khó) -> Kéo cá lên bờ!
      if (curHit >= targetHits) {
        this.completeOnMapFishingCatch();
      } else {
        // Đảo vị trí điểm canh ngẫu nhiên cho nhịp kéo tiếp theo
        const minTop = 14;
        const maxTop = Math.max(16, 86 - st.zoneHeight);
        let newTop = Math.floor(minTop + Math.random() * (maxTop - minTop));
        if (Math.abs(newTop - st.zoneTop) < 14) {
          newTop = (st.zoneTop > 45) ? 20 : 60;
        }
        st.zoneTop = newTop;
        const zoneEl = this.onMapAuditionEl?.querySelector('#fishing-vertical-zone');
        if (zoneEl) {
          zoneEl.style.top = `${st.zoneTop}%`;
        }
      }
    } else {
      // Yêu cầu: Câu cá hụt 1 lần là mất cá luôn!
      window.__audioService?.playChime?.(300, 0.22);
      this.spawnFloatingPopup(st.castX, st.castY - 48, '💨 Hụt rồi! Cá vụt mất rồi!', '#ef4444');
      this.spawnStationParticles(st.castX, st.castY, ['💦', '💨', '🫧'], 0x94a3b8);
      const trackEl = this.onMapAuditionEl?.querySelector('#fishing-vertical-track');
      if (trackEl) {
        trackEl.style.transform = 'scale(1.08)';
        trackEl.style.borderColor = '#ef4444';
      }

      // Cá trong hồ vụt lặn sâu trốn thoát
      if (this.activeBitingPondFish && typeof this.activeBitingPondFish.swimAway === 'function') {
        this.activeBitingPondFish.swimAway();
      } else if (this.activeBitingPondFish && typeof this.activeBitingPondFish.resetBackToPond === 'function') {
        this.activeBitingPondFish.resetBackToPond();
      }

      window.__fishingSystem?.recordTurnMiss?.('escaped');

      setTimeout(() => {
        this.stopOnMapFishing(false);
      }, 420);
    }
  }

  /**
   * Hoàn tất câu cá ngay trên bản đồ:
   * - Cá trong hồ (PondFish) bị kéo văng theo đường parabol từ mặt hồ lên bờ cầu gỗ giãy dụa (Requirement 5)
   * - VFX cầu vồng & tia nước tung tóe (Requirement 3)
   * - Thẻ hình ảnh Cá 3D bay vào Túi Của Bé
   */
  completeOnMapFishingCatch() {
    const st = this.onMapFishingState;
    if (!st) return;
    st.phase = 'caught';

    const fishingSystem = window.__fishingSystem;
    const catchRes = fishingSystem?.recordTurnCatch?.();
    const sp = catchRes?.species || st.species || {
      name: 'Cá Mây Tròn',
      icon: '🐟',
      asset: '/assets/fishing/fish_cloud.png'
    };
    const rawAsset = sp.asset || st.turn?.species?.asset || '/assets/fishing/fish_cloud.png';
    const assetSrc = rawAsset;
    const fishSpId = st.species?.speciesId || st.species?.id || catchRes?.fish?.speciesId || st.turn?.speciesId || sp.id || sp.speciesId || 'cloud_fish';
    const caughtFish = {
      speciesId: fishSpId,
      name: sp.name,
      icon: sp.icon,
      asset: assetSrc,
      weightG: catchRes?.weightG || catchRes?.fish?.weightG || st.weightG || 250
    };

    const heroX = this.hero?.getX?.() ?? 688;
    const heroY = this.hero?.getY?.() ?? 360;
    const { castX, castY } = st;
    const bitingFish = this.activeBitingPondFish;

    // Ẩn thanh Audition và cần câu
    this.stopOnMapFishing(false);
    window.__audioService?.playFishCatch?.();

    // Thực thể cá trong hồ văng từ mặt nước (castX, castY) lên sàn cầu gỗ (heroX - 28, heroY + 8) và giãy dụa!
    const landX = Math.max(625, heroX - 26);
    const landY = heroY + 8;
    if (bitingFish && typeof bitingFish.playCaughtPullAshore === 'function') {
      bitingFish.playCaughtPullAshore(castX, castY, landX, landY, () => {
        this.spawnStationParticles(landX, landY, ['✨', '🌈', '⭐'], 0xfacc15);
      });
    }

    const isRareFish = (
      caughtFish.speciesId === 'rainbow_fish' ||
      caughtFish.speciesId === 'sun_spot_fish' ||
      caughtFish.speciesId === 'golden_dragon_fish' ||
      caughtFish.speciesId === 'crystal_fairy_fish' ||
      caughtFish.speciesId === 'galaxy_star_fish' ||
      sp.id === 'rainbow_fish' ||
      sp.id === 'golden_dragon_fish' ||
      sp.id === 'crystal_fairy_fish' ||
      sp.id === 'galaxy_star_fish'
    );
    const isBigFish = (caughtFish.weightG >= 500);

    // Hiệu ứng tia nước tung tóe và Bé nhảy mừng trên cầu gỗ
    this.spawnStationParticles(castX, castY, isRareFish ? ['✨', '🌟', '🌈', '💫', '⭐', '🪄', '🔮'] : ['💦', '🎉', '⭐', '🪷', '🌈'], 0x38bdf8);
    if (this.hero?.sprite) {
      this.tweens.add({
        targets: this.hero.sprite,
        y: this.hero.sprite.y - 20,
        yoyo: true,
        repeat: isRareFish ? 6 : (isBigFish ? 3 : 1),
        duration: 180,
        ease: 'Back.easeOut'
      });
    }

    // 3. Vinh danh Danh Hiệu khi câu cá tại vị trí khoanh đỏ (kèm âm thanh chúc mừng & VFX rung ánh sáng)
    this.showFishingTitleCelebration(caughtFish, isBigFish || isRareFish);

    const sellStars = calculateFishSellPrice(caughtFish.weightG, caughtFish.speciesId);
    const oldToast = document.getElementById('onmap-catch-visual-card');
    if (oldToast) oldToast.remove();

    const card = document.createElement('div');
    card.id = 'onmap-catch-visual-card';

    // Helper: Định vị chính xác Nút Túi Của Bé để cá bay vào túi và nảy túi
    const triggerFlyToBag = (flyDelay, removeDelay) => {
      setTimeout(() => {
        if (!card.parentNode) return;
        const bagBtn = document.getElementById('btn-floating-bag') || document.querySelector('.floating-bag-btn');
        if (bagBtn) {
          const bagRect = bagBtn.getBoundingClientRect();
          const rootEl = document.getElementById('game-root') || document.body;
          const rootRect = rootEl.getBoundingClientRect();
          const targetX = Math.round(bagRect.left + bagRect.width / 2 - rootRect.left);
          const targetY = Math.round(bagRect.top + bagRect.height / 2 - rootRect.top);
          card.style.setProperty('--bag-fly-x', `${targetX}px`);
          card.style.setProperty('--bag-fly-y', `${targetY}px`);

          setTimeout(() => {
            bagBtn.classList.remove('bag-bounce-on-catch');
            void bagBtn.offsetWidth;
            bagBtn.classList.add('bag-bounce-on-catch');
            setTimeout(() => bagBtn.classList.remove('bag-bounce-on-catch'), 450);
          }, 300);
        }
        card.classList.add('fly-to-bag');
      }, flyDelay);
      setTimeout(() => {
        card.remove();
      }, removeDelay);
    };

    const doubleCatchHtml = (catchRes?.doubleCatchAwarded || fishingSystem?.isFishingSkillActive?.())
      ? `<div class="double-catch-ribbon">⚡ SKILL x2 CÁ! BÉ NHẬN ĐƯỢC 2 BẠN CÁ VÀO TÚI 🐟🐟</div>`
      : '';

    if (isRareFish) {
      // CÁ THẦN THOẠI QUÝ HIẾM: Hiệu ứng Magic cực đỉnh, tia sáng vũ trụ, vinh danh rực rỡ!
      card.className = 'onmap-catch-visual-card rare-fish-magic-celebration';
      card.innerHTML = `
        <div class="magic-celestial-rays"></div>
        ${doubleCatchHtml}
        <div class="magic-ribbon-title">✨ 🌟 🌈 CÁ THẦN THOẠI QUÝ HIẾM! 🌈 🌟 ✨</div>
        <div class="big-fish-halo magic-halo-wrap">
          <div class="magic-aura-ring"></div>
          <img src="${caughtFish.asset}" alt="${caughtFish.name}" style="position:relative;z-index:2;width:96px;height:96px;object-fit:contain;filter:drop-shadow(0 0 14px rgba(250,204,21,0.85));" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-flex';" />
          <span style="display:none;font-size:4.2rem;line-height:1;position:relative;z-index:2;">${caughtFish.icon || '🌈'}</span>
          <span style="position:absolute;top:-6px;right:-14px;background:linear-gradient(135deg,#f59e0b,#ea580c);border:2.5px solid #ffffff;color:#fff;font-size:1.05rem;font-weight:900;padding:3px 12px;border-radius:999px;box-shadow:0 0 15px rgba(245,158,11,0.8);z-index:3;">⭐ +${sellStars}</span>
        </div>
        <div class="onmap-catch-meta" style="font-size:1.15rem;gap:12px;margin-top:8px;">
          <span class="onmap-catch-weight" style="font-size:1.25rem;font-weight:900;color:#7e22ce;">👑 ${caughtFish.name} · ⚖️ ${caughtFish.weightG}g</span>
        </div>
        <div style="font-size:0.95rem;font-weight:900;color:#9333ea;margin-top:4px;letter-spacing:0.3px;">
          🔮 Phép màu giáng lâm! Bé đã câu được bạn Cá Quý Hiếm Thần Thoại!
        </div>
      `;

      // Hạt ma thuật vũ trụ bùng nổ khắp cầu gỗ
      this.spawnStationParticles(landX, landY, ['✨', '🌟', '🌈', '💫', '⭐', '🪄', '🎆', '🔮', '💎'], 0xc084fc);
      if (this.hero?.sprite) {
        this.spawnStationParticles(this.hero.sprite.x, this.hero.sprite.y - 25, ['✨', '🌟', '🌈', '👑', '⭐', '🪄'], 0xf59e0b);
      }
      this.cameras?.main?.shake?.(700, 0.016);
      this.cameras?.main?.flash?.(350, 255, 255, 255);

      if (typeof window.__audioService?.playGrandFanfare === 'function') {
        window.__audioService.playGrandFanfare();
      } else {
        window.__audioService?.playSuccess?.();
      }
      window.__speechService?.speak?.(`Kỳ diệu quá! Bé vừa bắt được Cá Thần Thoại cực kỳ quý hiếm ${caughtFish.name} nặng ${caughtFish.weightG} gam!`);
      window.dispatchEvent(new CustomEvent('game:show-toast', { detail: { message: `🔮 MA THUẬT KỲ DIỆU! ${caughtFish.name} (${caughtFish.weightG}g) vọt lên bờ!` } }));

      const gameRoot = document.getElementById('game-root') || document.body;
      gameRoot.appendChild(card);

      // Cá hiếm hiển thị ăn mừng rực rỡ 3.4s trước khi bay vào túi
      triggerFlyToBag(3400, 4000);
    } else if (isBigFish) {
      // CÁ TO KHỦNG: Hiệu ứng chúc mừng rực rỡ, pháo hoa, vinh danh huy hoàng!
      card.className = 'onmap-catch-visual-card big-fish-celebration';
      card.innerHTML = `
        ${doubleCatchHtml}
        <div class="big-fish-ribbon">🎉 CÁ TO KHỦNG VỌT LÊN BỜ! 🏆</div>
        <div class="big-fish-halo">
          <img src="${caughtFish.asset}" alt="${caughtFish.name}" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-flex';" />
          <span style="display:none;font-size:3.6rem;line-height:1;">${caughtFish.icon || '🐟'}</span>
          <span style="position:absolute;top:-4px;right:-12px;background:#f59e0b;border:2px solid #ffffff;color:#fff;font-size:0.95rem;font-weight:900;padding:2px 10px;border-radius:999px;box-shadow:0 3px 8px rgba(0,0,0,0.25);">⭐ +${sellStars}</span>
        </div>
        <div class="onmap-catch-meta" style="font-size:1.05rem;gap:12px;margin-top:6px;">
          <span class="onmap-catch-weight" style="font-size:1.15rem;font-weight:900;color:#92400e;">⚖️ ${caughtFish.weightG}g (${caughtFish.name})</span>
        </div>
      `;
      // Pháo hoa giấy vinh danh cá to
      this.spawnStationParticles(landX, landY, ['🎉', '🎆', '⭐', '✨', '🌈', '👑'], 0xfacc15);
      if (this.hero?.sprite) {
        this.spawnStationParticles(this.hero.sprite.x, this.hero.sprite.y - 20, ['✨', '⭐', '🎉', '🏆'], 0x38bdf8);
      }
      if (typeof window.__audioService?.playGrandFanfare === 'function') {
        window.__audioService.playGrandFanfare();
      } else {
        window.__audioService?.playSuccess?.();
      }
      window.__speechService?.speak?.(`Tuyệt cú mèo! Bé vừa câu được bạn cá to khổng lồ ${caughtFish.name} nặng ${caughtFish.weightG} gam!`);
      window.dispatchEvent(new CustomEvent('game:show-toast', { detail: { message: `🏆 CÁ TO KHỦNG! ${caughtFish.name} (${caughtFish.weightG}g) vọt lên bờ!` } }));

      const gameRoot = document.getElementById('game-root') || document.body;
      gameRoot.appendChild(card);

      // Cá to hiển thị ăn mừng 2.4s trước khi bay vào túi
      triggerFlyToBag(2400, 3000);
    } else {
      // CÁ NHỎ: Chỉ bay thẳng nhanh vào túi, không gián đoạn rình rang
      card.className = 'onmap-catch-visual-card small-fish-quick';
      card.innerHTML = `
        <div style="position:relative;display:inline-flex;">
          <img src="${caughtFish.asset}" alt="${caughtFish.name}" class="onmap-catch-fish-img" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-flex';" />
          <span style="display:none;font-size:1.8rem;line-height:1;">${caughtFish.icon || '🐟'}</span>
          <span style="position:absolute;top:-6px;right:-10px;background:#facc15;border:2px solid #ca8a04;color:#713f12;font-size:0.82rem;font-weight:900;padding:1px 7px;border-radius:999px;">⭐ +${sellStars}</span>
        </div>
        <div class="onmap-catch-meta">
          <span class="onmap-catch-weight">⚖️ ${caughtFish.weightG}g</span>
          <span class="onmap-catch-bag">➡️ 🎒</span>
        </div>
      `;
      this.spawnStationParticles(landX, landY, ['✨', '⭐', '🐟'], 0x38bdf8);
      window.__audioService?.playSuccess?.();

      const gameRoot = document.getElementById('game-root') || document.body;
      gameRoot.appendChild(card);

      // Cá nhỏ bay vào túi siêu nhanh trong 600ms
      triggerFlyToBag(600, 1150);
    }
  }

  /**
   * Hiển thị Danh Hiệu khi câu cá tại vị trí khoanh đỏ phía trên (top banner):
   * - Có âm thanh chúc mừng (Fanfare / Chime) và giọng đọc ngọt ngào
   * - Có VFX rung (camera shake & banner vibration)
   * - Có VFX ánh sáng (hào quang sunburst xoay 360°, tia sáng quét, neon aura)
   * - Tự động đồng bộ và kích hoạt huy hiệu trên đầu nhân vật
   */
  showFishingTitleCelebration(caughtFish, isBigFish) {
    // 1. Kiểm tra mở khóa huy hiệu thật trong BadgeSystem
    let unlockedBadge = null;
    if (window.__badgeSystem) {
      const newlyUnlocked = window.__badgeSystem.checkAllBadges(null, { notify: false, autoEquipIfNone: true });
      const fishingBadge = newlyUnlocked.find(b => b.category === 'fishing');
      if (fishingBadge) {
        unlockedBadge = fishingBadge;
      }
    }

    // Chỉ hiển thị Top Banner Vinh Danh khi bắt được Cá To/Thần Thoại hoặc Mở Khóa Danh Hiệu mới!
    // Đối với cá nhỏ thông thường, không spam banner trên cùng để pop-up nhận cá hiển thị gọn gàng, đúng chỗ tại bến câu.
    if (!isBigFish && !unlockedBadge) {
      return;
    }

    // 2. Xác định danh hiệu câu cá
    let titleName = 'CẦN THỦ TẬP SỰ';
    let titleIcon = '🎣';
    let titleTag = '🎉 DANH HIỆU CÂU CÁ HỒ LÁ SEN 🏆';
    let subText = `Bé đã xuất sắc câu được bạn ${caughtFish.name} (${caughtFish.weightG}g)!`;

    if (unlockedBadge) {
      titleName = unlockedBadge.title.toUpperCase();
      titleIcon = unlockedBadge.icon || '👑';
      titleTag = '🌟 BÉ ĐẠT DANH HIỆU MỚI! 🏆';
      subText = unlockedBadge.desc;
    } else if (caughtFish.weightG >= 1000) {
      titleName = 'ĐỆ NHẤT THỢ SĂN CÁ KHỦNG';
      titleIcon = '👑';
      titleTag = '🏆 KỶ LỤC CÁ TO KHỔNG LỒ! 🌟';
      subText = `Bắt được bạn ${caughtFish.name} nặng tới ${caughtFish.weightG}g!`;
    } else if (isBigFish) {
      titleName = 'THỢ SĂN CÁ KHỦNG';
      titleIcon = '🐋';
      titleTag = '🎉 CÁ TO VỌT LÊN BỜ! 🏆';
      subText = `Bé đã chinh phục bạn ${caughtFish.name} nặng ${caughtFish.weightG}g!`;
    } else if (caughtFish.weightG >= 350) {
      titleName = 'BẬC THẦY KÉO CẦN';
      titleIcon = '🎣';
      titleTag = '✨ CẦN THỦ KHÉO TAY! 🐟';
      subText = `Kéo cá điêu luyện, thu phục bạn ${caughtFish.name} (${caughtFish.weightG}g)!`;
    } else {
      titleName = 'CẦN THỦ TẬP SỰ';
      titleIcon = '🐟';
      titleTag = '🎉 BÉ CÂU ĐƯỢC CÁ RỒI! 🎣';
      subText = `Bé câu được bạn ${caughtFish.name} (${caughtFish.weightG}g) vào túi!`;
    }

    // 3. VFX Rung: Camera shake & Banner rumble
    this.cameras.main.shake(480, isBigFish ? 0.012 : 0.007);

    // 4. VFX Ánh sáng: Camera flash + Particle bursts
    this.cameras.main.flash(260, 255, 255, 210, false);
    const heroX = this.hero?.getX?.() ?? 688;
    const heroY = this.hero?.getY?.() ?? 360;
    this.spawnStationParticles(heroX, heroY - 40, ['✨', '⭐', '🎉', '🌟', '🏆', '🌈', '👑'], 0xfacc15);

    // 5. Âm thanh chúc mừng & Giọng nói
    if (isBigFish || unlockedBadge) {
      window.__audioService?.playGrandFanfare?.();
    } else {
      window.__audioService?.playVictoryChime?.(880, 0.35);
    }
    window.__speechService?.speak?.(`Chúc mừng Cần thủ nhí! Bé đạt danh hiệu ${titleName}!`);

    // 6. Gắn Banner Danh Hiệu lên vị trí khoanh đỏ phía trên
    const oldBanner = document.getElementById('fishing-title-celebration-banner');
    if (oldBanner) oldBanner.remove();

    const banner = document.createElement('div');
    banner.id = 'fishing-title-celebration-banner';
    banner.className = 'fishing-title-celebration-banner';
    const sellStars = calculateFishSellPrice(caughtFish.weightG, caughtFish.speciesId);

    banner.innerHTML = `
      <div class="fishing-title-sunburst" aria-hidden="true"></div>
      <div class="fishing-title-card">
        <div class="fishing-title-icon-wrap">
          <span class="fishing-title-icon">${titleIcon}</span>
        </div>
        <div class="fishing-title-content">
          <div class="fishing-title-tag">${titleTag}</div>
          <div class="fishing-title-name">${titleName}</div>
          <div class="fishing-title-sub">${subText}</div>
        </div>
        <div class="fishing-title-stars">
          <span>⭐ +${sellStars}</span>
        </div>
      </div>
    `;

    const gameRoot = document.getElementById('game-root') || document.body;
    gameRoot.appendChild(banner);

    // Cập nhật huy hiệu đeo trên đầu bé nếu có
    if (this.hero?.updateHeadBadge) {
      this.hero.updateHeadBadge();
    }

    // Tự động gỡ sau 4 giây
    setTimeout(() => {
      if (banner && banner.parentNode) {
        banner.classList.add('fade-out');
        setTimeout(() => banner.remove(), 600);
      }
    }, 4000);
  }

  /**
   * Khởi tạo các trạm tương tác tinh gọn tại Chợ Cầu Vồng (chỉ biểu tượng minh hoạ Mua Cần & Bán Cá Đổi Sao)
   */
  initRainbowMarketStations(stations) {
    this.marketStationContainers = [];

    stations.forEach((st) => {
      const container = this.add.container(st.x, st.y).setDepth(6);
      if (st.type === 'help_board' || st.type === 'veggie_corner') {
        container.setVisible(false);
        this.marketStationContainers.push({ data: st, container, touchZone: null });
        return;
      }

      const pillBg = this.add.graphics();
      const fillColor =
        st.type === 'rod_bait_stall'
          ? 0xd97706
          : (st.type === 'backpack_stall' ? 0x8b5cf6 : 0xdb2777);

      const badgeText =
        st.type === 'rod_bait_stall'
          ? 'Quầy Bán Cần Câu'
          : (st.type === 'backpack_stall' ? 'Quầy Balo Mới' : (st.type === 'fish_scale_stall' ? 'Quầy Bán Cá' : (st.badge || st.icon || '🏮')));

      const label = this.add.text(0, 0, badgeText, {
        fontFamily: 'Quicksand, Nunito, Segoe UI, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      const w = Math.max(145, Math.ceil(label.width + 32));
      const h = 42;
      const radius = h / 2;

      pillBg.fillStyle(fillColor, 0.94);
      pillBg.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
      pillBg.lineStyle(3, 0xffffff, 0.96);
      pillBg.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);

      container.add([pillBg, label]);

      this.tweens.add({
        targets: container,
        y: st.y - 6,
        duration: 1550,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      const touchZone = this.add.zone(st.x, st.y, Math.max(195, w + 30), 125)
        .setInteractive({ useHandCursor: true })
        .setDepth(16);
      touchZone.on('pointerdown', (pointer) => {
        if (!this.isWorldPointer(pointer)) return;
        pointer?.event?.stopPropagation?.();
        this.handleMarketStationInteraction(st);
      });

      this.marketStationContainers.push({ data: st, container, touchZone });
    });
  }

  handleMarketStationInteraction(st) {
    if (!st || !this.hero) return;
    const targetX = st.interactionPoint?.x ?? st.x;
    const targetY = st.interactionPoint?.y ?? st.y;
    this.activeMarketStationVisit = st.id;
    this.hero.moveTo(targetX, targetY, () => {
      if (this.activeMarketStationVisit !== st.id || !this.sys.isActive() || !this.isExploring) return;
      window.dispatchEvent(new CustomEvent('game:open-market-station', { detail: { station: st } }));
    });
  }

  /**
   * Khởi tạo các trạm tương tác tại Phố Thời Trang Cầu Vồng (5 Trạm: Quần Áo, Phụ Kiện, Gương, Dành Dụm, Chụp Ảnh)
   */
  initFashionStreetStations(stations) {
    this.fashionStationContainers = [];

    stations.forEach((st) => {
      const container = this.add.container(st.x, st.y).setDepth(6);

      const pillBg = this.add.graphics();
      const fillColor = st.auraColor || 0xc084fc;
      const badgeText = st.badge || st.name || '👗';

      const label = this.add.text(0, 0, badgeText, {
        fontFamily: 'Quicksand, Nunito, Segoe UI, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#4a044e',
        strokeThickness: 3
      }).setOrigin(0.5);

      const w = Math.max(150, Math.ceil(label.width + 36));
      const h = 44;
      const radius = h / 2;

      pillBg.fillStyle(fillColor, 0.94);
      pillBg.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
      pillBg.lineStyle(3, 0xffffff, 0.96);
      pillBg.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);

      container.add([pillBg, label]);

      this.tweens.add({
        targets: container,
        y: st.y - 7,
        duration: 1600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      const touchZone = this.add.zone(st.x, st.y, Math.max(180, w + 24), 115)
        .setInteractive({ useHandCursor: true })
        .setDepth(16);
      touchZone.on('pointerdown', (pointer) => {
        if (!this.isWorldPointer(pointer)) return;
        pointer?.event?.stopPropagation?.();
        this.handleFashionStationInteraction(st);
      });

      this.fashionStationContainers.push({ data: st, container, touchZone });
    });
  }

  handleFashionStationInteraction(st) {
    if (!st || !this.hero) return;
    const targetX = st.interactionPoint?.x ?? st.x;
    const targetY = st.interactionPoint?.y ?? st.y;
    this.activeFashionStationVisit = st.id;
    this.hero.moveTo(targetX, targetY, () => {
      if (this.activeFashionStationVisit !== st.id || !this.sys.isActive() || !this.isExploring) return;
      if (st.type === 'backpack_stall') {
        window.dispatchEvent(new CustomEvent('game:open-market-station', { detail: { station: st } }));
      } else {
        window.dispatchEvent(new CustomEvent('game:open-fashion-modal', {
          detail: { station: st, tabIndex: st.tabIndex ?? 0 }
        }));
      }
    });
  }
  /**
   * Kích hoạt Kỹ Năng Câu Cá: Tăng số lượng cá bơi trong hồ và bật Double Catch (x2 cá)
   */
  activateFishingSkill() {
    const fishingSystem = window.__fishingSystem;
    if (!fishingSystem) return;
    fishingSystem.activateFishingSkill();

    // 1. Tăng ngay số lượng cá bơi trong hồ (gọi thêm 8 bạn cá mới)
    this.spawnMorePondFishes(8);

    // 2. Hào quang nhân vật & sóng nước bọt khí
    const px = this.hero?.getX?.() ?? 688;
    const py = (this.hero?.getY?.() ?? 360);
    this.spawnStationParticles(px, py, ['⚡', '✨', '🌈', '🐟', '🫧', '⭐'], 0xf59e0b);
    this.spawnStationParticles(425, 425, ['💦', '✨', '🫧', '🐟'], 0x38bdf8);

    // 3. Âm thanh phép thuật ngân vang
    window.__audioService?.playChime?.(880, 0.35);

    // 4. Thông báo bay nổi bật
    this.spawnFloatingPopup(px, py - 55, '⚡ SKILL BÙNG NỔ: ĐÀN CÁ TĂNG VỌT! BẮT X2 CÁ! 🐟🐟✨', '#f59e0b');

    // 5. Cập nhật trạng thái các nút
    if (this.dockFishingSkillBtnEl) {
      this.dockFishingSkillBtnEl.classList.add('skill-active');
      this.dockFishingSkillBtnEl.innerHTML = '<span>✨ Đang Bật Skill x2 Cá!</span>';
    }
    const auditionSkillBtn = document.getElementById('btn-audition-skill');
    if (auditionSkillBtn) {
      auditionSkillBtn.classList.add('skill-active');
      auditionSkillBtn.textContent = '✨ x2 Cá Đang Bật';
    }
  }

  /**
   * Sinh thêm đàn cá bơi lội sinh động trong Hồ Câu Lá Sen
   */
  spawnMorePondFishes(count = 8) {
    if (!this.pondFishes) this.pondFishes = [];
    const sheetKeys = [
      'fish_pond_swim_8dir',
      'fish_orange_swim_8dir',
      'fish_cloud_swim_8dir'
    ];
    for (let i = 0; i < count; i++) {
      const texKey = sheetKeys[i % sheetKeys.length];
      const startPos = {
        x: 425 + Phaser.Math.Between(-120, 120),
        y: 425 + Phaser.Math.Between(-70, 70)
      };
      if (this.textures.exists(texKey)) {
        const pondFish = new PondFish(this, {
          id: `pond_fish_extra_${Date.now()}_${i}`,
          textureKey: texKey,
          x: startPos.x,
          y: startPos.y,
          scale: 0.38 + Math.random() * 0.16,
          speed: 46 + Math.random() * 25,
          pondBounds: {
            cx: 425,
            cy: 425,
            rx: 135,
            ry: 95
          }
        });
        this.spawnStationParticles(startPos.x, startPos.y, ['✨', '🫧', '🐟'], 0x38bdf8);
        this.pondFishes.push(pondFish);
      }
    }
  }
}
