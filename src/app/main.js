import * as Phaser from 'phaser';
import '../styles/game.css';
import '../styles/kitchen.css';
import '../styles/fishing.css';
import { CookingSystem } from '../game/systems/cookingSystem.js';
import { FishingSystem } from '../game/systems/fishingSystem.js';
import { KitchenModal } from '../game/ui/KitchenModal.js';
import { KitchenStationModal } from '../game/ui/KitchenStationModal.js';
import { FishingModal } from '../game/ui/FishingModal.js';
import { MarketModal } from '../game/ui/MarketModal.js';
import { FishBookModal } from '../game/ui/FishBookModal.js';
import { FashionSystem } from '../game/systems/fashionSystem.js';
import { BackpackSystem } from '../game/systems/backpackSystem.js';
import { FashionStreetModal } from '../game/ui/FashionStreetModal.js';
import { BootScene } from '../game/scenes/BootScene.js';
import { PreloadScene } from '../game/scenes/PreloadScene.js';
import { WorldScene, DESIGN_WIDTH, DESIGN_HEIGHT } from '../game/scenes/WorldScene.js';
import { saveAdapter } from '../services/save/saveAdapter.js';
import { audioService } from '../services/audio/audioService.js';
import { accessibilityService } from '../services/accessibility/accessibilityService.js';
import { ProgressionSystem } from '../game/systems/progressionSystem.js';
import { PetSystem } from '../game/systems/petSystem.js';
import { CombatSystem } from '../game/systems/combatSystem.js';
import { BadgeSystem } from '../game/systems/badgeSystem.js';
import { HudController } from '../game/ui/HudController.js';
import { QuestionDialog } from '../game/ui/QuestionDialog.js';
import { BattleArenaModal } from '../game/ui/BattleArenaModal.js';
import { StoryIntroModal } from '../game/ui/StoryIntroModal.js';
import { RecapModal } from '../game/ui/RecapModal.js';
import { PetCareModal } from '../game/ui/PetCareModal.js';
import { PetFarmStatusHUD } from '../game/ui/PetFarmStatusHUD.js';
import { MapSelectModal } from '../game/ui/MapSelectModal.js';
import { ParentalGateModal } from '../game/ui/ParentalGateModal.js';
import { GrandFinaleModal } from '../game/ui/GrandFinaleModal.js';
import { QuestionManagerModal } from '../game/ui/QuestionManagerModal.js';
import { CharacterSelectModal } from '../game/ui/CharacterSelectModal.js';
import { GameLoadingScreen } from '../game/ui/GameLoadingScreen.js';
import { MapTransitionOverlay } from '../game/ui/MapTransitionOverlay.js';
import { MapLoadingOverlay } from '../game/ui/MapLoadingOverlay.js';
import { MazeMinigameModal } from '../game/ui/MazeMinigameModal.js';
import { VirtualJoystick } from '../game/ui/VirtualJoystick.js';
import { gameStateMachine, GAME_STATES } from '../game/systems/gameStateMachine.js';
import { CAMPAIGN_ZONES, SPECIAL_ZONES } from '../content/campaign/campaignGraph.js';
import { getMapConfig } from '../content/maps/mapsConfig.js';
import { getQuestion, QUESTION_BANK } from '../content/questions/questionBank.js';

// 1. Nạp và migrate dữ liệu lưu
const gameState = saveAdapter.load();

// 2. Khởi tạo các domain system thuần
const progressionSystem = new ProgressionSystem(gameState);
const petSystem = new PetSystem(gameState.pet);
const combatSystem = new CombatSystem({ progressionSystem, petSystem });
const badgeSystem = new BadgeSystem(saveAdapter, gameState, audioService);
window.__badgeSystem = badgeSystem;

const cookingSystem = new CookingSystem(saveAdapter, (_state, saved) => {
  Object.assign(gameState.player, saved.player);
  Object.assign(progressionSystem.state.player, saved.player);
  hudController.updatePlayerHud();
  updateKitchenStatus();
  badgeSystem.checkAllBadges(gameState);
});
window.__cookingSystem = cookingSystem;

const backpackSystem = new BackpackSystem(saveAdapter);
window.__backpackSystem = backpackSystem;

const fishingSystem = new FishingSystem(saveAdapter, (fishingState, saved) => {
  gameState.fishing = fishingState;
  if (saved?.cooking) {
    gameState.cooking = saved.cooking;
  }
  updateKitchenStatus();
  badgeSystem.checkAllBadges(gameState);
});
window.__fishingSystem = fishingSystem;

// Tự động kiểm tra điều kiện mở khóa huy hiệu ngay khi khởi động game
badgeSystem.checkAllBadges(gameState, { notify: false, autoEquipIfNone: true });

export function updateHeroVitalsHud() {
  const state = window.__cookingSystem?.getState() || { hearts: 3, bonusHearts: 0, energy: 0 };
  const hearts = Math.max(0, Math.min(3, state.hearts ?? 3));
  const bonusHearts = Math.max(0, state.bonusHearts ?? 0);
  const energy = Math.max(0, state.energy ?? 0);

  // 1. Cập nhật 3 trái tim đỏ
  const heartsList = document.getElementById('vitals-hearts-list');
  if (heartsList) {
    heartsList.replaceChildren();
    for (let i = 0; i < 3; i++) {
      const img = document.createElement('img');
      img.className = 'vital-heart-icon';
      if (i < hearts) {
        img.src = '/assets/ui/custom_kids_ui/icon_heart_full.png';
        img.alt = '❤️';
      } else {
        img.src = '/assets/ui/custom_kids_ui/icon_heart_empty.png';
        img.alt = '🤍';
        img.classList.add('is-empty');
      }
      heartsList.appendChild(img);
    }
  }

  // 2. Cập nhật tim vàng cộng thêm
  const bonusBadge = document.getElementById('vitals-bonus-badge');
  const bonusNum = document.getElementById('vitals-bonus-num');
  if (bonusBadge && bonusNum) {
    if (bonusHearts > 0) {
      bonusNum.textContent = bonusHearts;
      bonusBadge.style.display = 'inline-flex';
    } else {
      bonusBadge.style.display = 'none';
    }
  }

  // 3. Cập nhật năng lượng
  const energyVal = document.getElementById('vitals-energy-val');
  if (energyVal) {
    energyVal.textContent = energy;
  }
}
window.__updateHeroVitalsHud = updateHeroVitalsHud;

function updateKitchenStatus() {
  const state = cookingSystem.getState();
  const status = document.getElementById('kitchen-status');
  if (status) status.textContent = `❤️ ${state.hearts} · 💛 +${state.bonusHearts} · ⚡ ${state.energy}`;
  
  // Cập nhật HUD sức sống (Tim, Tim vàng cộng thêm, Năng lượng)
  updateHeroVitalsHud();

  // Cập nhật số lượng món ăn, nguyên liệu, cá câu được và cần/mồi trong Túi Của Bé
  const dishCount = (state?.dishes || []).length;
  const ingCount = Object.values(state?.ingredients || {}).reduce((a, b) => a + b, 0);
  const fState = window.__fishingSystem?.getState?.() || gameState?.fishing || {};
  const fishCount = (fState?.basket || []).length;
  const rodCount = (fState?.ownedRods || []).length;
  const total = dishCount + ingCount + fishCount + rodCount;
  const badge = document.getElementById('floating-bag-badge');
  if (badge) {
    if (total > 0) {
      badge.textContent = total;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }
}
updateKitchenStatus();

// Tương tác bấm vào Tim và Năng lượng trên HUD
document.getElementById('vitals-hearts-pill')?.addEventListener('click', () => {
  audioService?.playChime?.(750, 0.15);
  const state = window.__cookingSystem?.getState() || { hearts: 3, bonusHearts: 0 };
  const hearts = state.hearts ?? 3;
  const bonus = state.bonusHearts ?? 0;
  const bonusMsg = bonus > 0 ? ` (+${bonus} tim vàng tạm thời)` : '';
  window.dispatchEvent(new CustomEvent('game:show-toast', {
    detail: { message: `❤️ Sức sống của Bé: ${hearts}/3 tim${bonusMsg}. Bé hãy ăn món ngon để nạp đầy tim nhé!` }
  }));
});

document.getElementById('vitals-energy-pill')?.addEventListener('click', () => {
  audioService?.playChime?.(820, 0.15);
  const state = window.__cookingSystem?.getState() || { energy: 0 };
  const energy = state.energy ?? 0;
  window.dispatchEvent(new CustomEvent('game:show-toast', {
    detail: { message: `⚡ Năng lượng món ăn: ${energy} điểm. Dùng để kích hoạt Khiên Chắn đỡ đòn trong trận đấu!` }
  }));
});
let kitchenPausedScene = null;
let kitchenStationModal;
const fashionSystem = new FashionSystem(saveAdapter);
window.__fashionSystem = fashionSystem;

const kitchenModal = new KitchenModal({
  cookingSystem, fishingSystem, backpackSystem, fashionSystem, audioService,
  onWashHands: () => {
    kitchenModal.close();
    kitchenStationModal?.showSinkModal();
  },
  onVisitKitchen: () => enterKitchenMapDirect(),
  onChallenge: () => travelToZone('map1'),
  onClose: () => {
    gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
    if (kitchenPausedScene?.sys.isPaused()) kitchenPausedScene.scene.resume();
    kitchenPausedScene = null;
  }
});

const fishBookModal = new FishBookModal({
  badgeSystem,
  fishingSystem,
  audioService,
  onClose: () => {
    if (gameStateMachine.getState() === GAME_STATES.FISHING && !document.getElementById('fishing-modal')) {
      gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
    }
  }
});
window.__fishBookModal = fishBookModal;

const fishingModal = new FishingModal({
  fishingSystem,
  audioService,
  onOpenFishBook: () => {
    fishBookModal.open('all');
  },
  onNavigateMap: (targetMapId) => {
    gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
    travelToZone(targetMapId);
  },
  onClose: () => {
    gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
  }
});
window.__fishingModal = fishingModal;

const marketModal = new MarketModal({
  fishingSystem,
  backpackSystem,
  audioService,
  onNavigateMap: (targetMapId) => {
    gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
    travelToZone(targetMapId);
  },
  onClose: () => {
    gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
  }
});
window.__marketModal = marketModal;

window.addEventListener('game:check-badges', () => {
  badgeSystem.checkAllBadges(gameState);
});

window.addEventListener('game:encounter-resolved', () => {
  badgeSystem.checkAllBadges(gameState);
});

window.addEventListener('game:boss-resolved', () => {
  badgeSystem.checkAllBadges(gameState);
});

window.addEventListener('game:open-fishing-station', (e) => {
  const st = e.detail?.station;
  if (!st) return;
  if (st.type === 'fish_book') {
    gameStateMachine.transition(GAME_STATES.FISHING);
    fishBookModal.open('all');
    return;
  }
  if (st.type === 'prep_basket') {
    window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'bag' } }));
    return;
  }
  // Câu cá trực tiếp trên bản đồ (không mở pop-up riêng)
  window.__worldScene?.startOnMapFishing?.(st);
});

window.addEventListener('game:open-market-station', (e) => {
  const st = e.detail?.station;
  if (!st) return;
  if (st.type === 'veggie_corner') {
    audioService?.speak?.('Rau củ tươi xanh quá! Mình ghé sang Bếp Cầu Vồng để nấu món cá rau củ thơm ngon nhé!');
    travelToZone('map_kitchen');
    return;
  }
  gameStateMachine.transition(GAME_STATES.MARKET);
  marketModal.open(st.type);
});

window.addEventListener('game:portal-teleport', (e) => {
  const { targetMapId } = e.detail || {};
  if (targetMapId) {
    travelToZone(targetMapId);
  }
});
function enterKitchenMapDirect() {
  const scene = window.__worldScene;
  if (!scene?.sys.isActive()) return;
  scene.hero?.stop();
  const state = saveAdapter.load() || {};
  saveAdapter.save({
    ...state,
    campaign: {
      ...(state.campaign || {}),
      currentMapId: 'map_kitchen'
    }
  });
  scene.scene.restart({ mapId: 'map_kitchen' });
  audioService.playChime(640, 0.15);
  window.dispatchEvent(new CustomEvent('game:show-toast', {
    detail: { message: '🍳 Chào mừng bạn bước vào Bếp Cầu Vồng!' }
  }));
}

function returnFarmMapDirect() {
  const scene = window.__worldScene;
  if (!scene?.sys.isActive()) return;
  scene.hero?.stop();
  // Rửa tay 1 lần duy nhất trong suốt quá trình chơi
  // cookingSystem.resetHandWash?.();
  const state = saveAdapter.load() || {};
  saveAdapter.save({
    ...state,
    campaign: {
      ...(state.campaign || {}),
      currentMapId: 'map_pet_farm'
    }
  });
  scene.scene.restart({ mapId: 'map_pet_farm' });
  audioService.playChime(640, 0.15);
  
}

 kitchenStationModal = new KitchenStationModal({
  audioService,
  saveAdapter,
  onHandWashComplete: () => cookingSystem.completeHandWash(),
  onOpenFridge: () => {
    const isWashed = Boolean(cookingSystem.getState()?.handsWashed);
    if (!isWashed) {
      audioService?.playChime?.(420, 0.25);
      audioService?.speak?.('Bé ơi, hãy rửa tay sạch sẽ trước khi mở tủ lạnh lấy thức ăn nhé!');
      window.dispatchEvent(new CustomEvent('game:show-toast', {
        detail: { message: '🧼 Rửa tay sạch sẽ trước khi mở tủ lạnh nhé!' }
      }));
      kitchenStationModal?.showSinkModal();
      return;
    }
    window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'fridge' } }));
  },
  onOpenCooking: () => {
    window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'cook' } }));
  },
  onOpenBag: () => {
    window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'bag' } }));
  },
  onEnterKitchenMap: () => {
    enterKitchenMapDirect();
  },
  onReturnFarm: () => {
    returnFarmMapDirect();
  }
});
window.__kitchenStationModal = kitchenStationModal;

// Bấm nút "Vào Bếp" trên Topbar -> Mở Pop-up Bếp Cầu Vồng
document.getElementById('btn-open-kitchen')?.addEventListener('click', () => {
  if (window.__worldScene?.currentMapId === 'map_kitchen') {
    window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'fridge' } }));
  } else enterKitchenMapDirect();
});
document.getElementById('btn-open-bag')?.addEventListener('click', () => {
  window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'bag' } }));
});
document.getElementById('btn-floating-bag')?.addEventListener('click', () => {
  window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'bag' } }));
});

// Lắng nghe mở pop-up từng trạm từ WorldScene
window.addEventListener('game:open-kitchen-station-popup', (e) => {
  const { station } = e.detail || {};
  if (station === 'hub') {
    enterKitchenMapDirect();
  } else if (station === 'kitchen_enter' || station === 'welcome') {
    const isWashed = Boolean(cookingSystem.getState()?.handsWashed);
    if (!isWashed) {
      if (isGameStarted || window.__worldScene?.sys?.isActive()) {
        audioService.playChime(640, 0.2);
        kitchenStationModal.showSinkModal();
        audioService.speak('Bé ơi, hãy rửa tay sạch sẽ trước khi vào bếp nấu ăn nhé!');
      } else {
        pendingKitchenWelcome = true;
      }
    }
  } else if (station === 'sink') {
    kitchenStationModal.showSinkModal();
  } else if (station === 'pantry') {
    const isWashed = Boolean(cookingSystem.getState()?.handsWashed);
    if (!isWashed) {
      audioService?.playChime?.(420, 0.25);
      audioService?.speak?.('Bé ơi, hãy rửa tay sạch sẽ trước khi mở tủ lạnh nhé!');
      window.dispatchEvent(new CustomEvent('game:show-toast', {
        detail: { message: '🧼 Rửa tay sạch sẽ trước khi mở tủ lạnh nhé!' }
      }));
      kitchenStationModal?.showSinkModal();
      return;
    }
    window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'fridge' } }));
  } else if (station === 'door') {
    kitchenStationModal.showDoorModal();
  }
});

// Lắng nghe sự kiện tương tác trạm bếp từ WorldScene
window.addEventListener('game:open-kitchen-modal', (e) => {
  const { tab } = e.detail || {};
  // Cổng vệ sinh: Chỉ mở được Tủ Lạnh hoặc Bếp nấu khi đã rửa tay sạch sẽ
  const needsCleanHands = tab === 'cook' || tab === 'recipes' || tab === 'fridge';
  const cookState = cookingSystem.getState();
  if (needsCleanHands && !cookState?.handsWashed && !cookState?.session) {
    kitchenModal.close();
    audioService?.playChime?.(420, 0.25);
    const isFridge = tab === 'fridge';
    audioService?.speak?.(
      isFridge
        ? 'Bé ơi, hãy rửa tay sạch sẽ trước khi mở tủ lạnh lấy thức ăn nhé!'
        : 'Bé ơi, rửa tay sạch sẽ trước khi nấu ăn nhé!'
    );
    window.dispatchEvent(new CustomEvent('game:show-toast', {
      detail: {
        message: isFridge
          ? '🧼 Rửa tay sạch sẽ trước khi mở tủ lạnh nhé!'
          : '🧼 Rửa tay trước rồi mới nấu bếp nhé!'
      }
    }));
    kitchenStationModal?.showSinkModal();
    return;
  }
  if (!kitchenModal.root.hidden) { kitchenModal.show(tab); return; }
  kitchenStationModal?.close?.();
  const scene = window.__worldScene;
  if (gameStateMachine.getState() !== GAME_STATES.KITCHEN) {
    if (!gameStateMachine.canTransitionTo(GAME_STATES.KITCHEN)) {
      gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
    }
    gameStateMachine.transition(GAME_STATES.KITCHEN);
  }
  scene?.hero?.stop();
  scene?.tweens?.killTweensOf([scene?.hero?.sprite, scene?.hero?.shadow].filter(Boolean));
  if (scene) {
    scene.scene.pause();
    kitchenPausedScene = scene;
  }
  let targetTab = 'recipes';
  if (tab === 'fridge') {
    targetTab = 'fridge';
  } else if (tab === 'bag') {
    targetTab = 'bag';
  } else if (tab === 'cook') {
    const s = cookingSystem.getState();
    targetTab = s.session ? 'cook' : 'recipes';
  } else if (tab === 'recipes') {
    targetTab = 'recipes';
  }
  kitchenModal.show(targetTab);
});

window.__kitchenModal = kitchenModal;
window.__gameStateMachine = gameStateMachine;
window.__GAME_STATES = GAME_STATES;
window.__saveAdapter = saveAdapter;
window.__progressionSystem = progressionSystem;

// 3. Khởi tạo Audio và Trợ năng
audioService.initUnlockListener();
if (gameState.settings?.soundEnabled) {
  audioService.setSoundEnabled(true);
}
window.__audioService = audioService;

const soundToggleBtn = document.getElementById('sound-toggle');
if (soundToggleBtn) {
  soundToggleBtn.addEventListener('click', () => {
    const isNowEnabled = audioService.toggleMute();
    gameState.settings = gameState.settings || {};
    gameState.settings.soundEnabled = isNowEnabled;
    saveAdapter.save(gameState);
  });
}
audioService.updateSoundToggleUI();

// 4. Khởi tạo giao diện DOM (HUD, Modals & Question Dialog)
const hudController = new HudController({
  audioService,
  saveAdapter,
  progressionSystem,
  petSystem
});
hudController.updatePlayerHud();

const questionDialog = new QuestionDialog({
  combatSystem,
  audioService,
  saveAdapter,
  hudController
});
window.__questionDialog = questionDialog;
window.__questionBank = { getQuestion, QUESTION_BANK };

const mazeMinigameModal = new MazeMinigameModal({
  audioService,
  progressionSystem,
  saveAdapter,
  hudController
});
window.__mazeModal = mazeMinigameModal;

const battleArenaModal = new BattleArenaModal({
  cookingSystem,
  combatSystem,
  audioService,
  saveAdapter,
  hudController,
  mazeMinigameModal
});
window.__battleModal = battleArenaModal;
window.__battleArenaModal = battleArenaModal;

const storyIntroModal = new StoryIntroModal({ audioService });
const recapModal = new RecapModal({ audioService });
const petCareModal = new PetCareModal({
  petSystem,
  audioService,
  saveAdapter,
  onVisitFarm: () => {
    gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
    travelToZone('map_pet_farm');
  },
  onClose: () => {
    gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
  }
});

// Khởi tạo HUD vòng tròn trạng thái thú cưng dạng % trên map Nông Trại
const petFarmStatusHud = new PetFarmStatusHUD({
  saveAdapter,
  audioService,
  petSystem
});
window.__petFarmStatusHud = petFarmStatusHud;

// Khởi tạo Modal Phố Thời Trang Cầu Vồng (FASHION_MAP_PLAN)
const fashionStreetModal = new FashionStreetModal({
  fashionSystem,
  audioService,
  saveAdapter
});
window.__fashionStreetModal = fashionStreetModal;

let grandFinaleModal;
let parentalGateModal;
let mapSelectModal;

// Khởi tạo Màn Hình Loading Chuyển Maps Thần Kỳ Cho Bé
const mapLoadingOverlay = new MapLoadingOverlay({
  audioService,
  hudController
});
window.__mapLoadingOverlay = mapLoadingOverlay;

// Hàm chuyển map mượt mà có màn hình loading sinh động
function travelToZone(zoneId, onComplete) {
  // Duy trì trạng thái rửa tay một lần xuyên suốt session
  // Refresh the shared snapshot before map travel saves it; challenge rewards
  // and kitchen purchases may have committed through a different controller.
  Object.assign(gameState, saveAdapter.load());
  progressionSystem.state = gameState;
  if (!progressionSystem.isMapUnlocked(zoneId)) return;
  progressionSystem.setCurrentMap(zoneId);
  if (gameState?.campaign) {
    gameState.campaign.currentMapId = zoneId;
  }
  saveAdapter.save(gameState);

  const targetName = CAMPAIGN_ZONES[zoneId]?.name || SPECIAL_ZONES[zoneId]?.name || getMapConfig(zoneId)?.name || zoneId;
  hudController.setStatus(`Đang chuyển đến ${targetName}...`);
  hudController.setProgress(targetName);

  // Chỉ dùng Màn Hình Dịch Chuyển 8 Bước phía trước (MapTransitionOverlay), đã xóa bỏ loading phía sau
  const worldScene = game.scene.getScene('WorldScene');
  if (worldScene) {
    worldScene.scene.restart({ mapId: zoneId });
  }
  if (typeof onComplete === 'function') onComplete();
}

// Khởi tạo Bộ Hiệu Ứng Dịch Chuyển Bản Đồ 8 Bước
const mapTransitionOverlay = new MapTransitionOverlay({
  audioService,
  hudController,
  onExecuteMapSwitch: (targetMapId) => {
    travelToZone(targetMapId);
  }
});
window.__travelToZone = travelToZone;
window.__getMapConfig = getMapConfig;
window.__mapTransitionOverlay = mapTransitionOverlay;

// Lắng nghe sự kiện Bé Sâu bước vào Cổng Dịch Chuyển (Tiến tới hoặc Quay về)
window.addEventListener('game:portal-warp-start', (e) => {
  const { targetMapId, portalData } = e.detail || {};
  const nextId = targetMapId || 'map2';
  const targetZone = CAMPAIGN_ZONES[nextId] || SPECIAL_ZONES[nextId] || { name: portalData?.targetMapName || 'Nông Trại Thú Cưng' };

  if (!progressionSystem.isMapUnlocked(nextId)) {
    progressionSystem.unlockMap(nextId);
    saveAdapter.save(gameState);
  }

  mapTransitionOverlay.execute8StepWarp({
    targetMapId: nextId,
    targetMapName: targetZone.name || portalData?.targetMapName || 'Vùng Đất Mới'
  });
});

grandFinaleModal = new GrandFinaleModal({
  onContinueExplore: () => {
    gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
    mapSelectModal.show(saveAdapter.load());
  }
});

parentalGateModal = new ParentalGateModal({
  onConfirm: () => {
    saveAdapter.reset();
    window.location.reload();
  },
  onCancel: () => {
    gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
  }
});

mapSelectModal = new MapSelectModal({
  onSelectZone: (zoneId) => {
    gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
    travelToZone(zoneId);
  },
  onOpenFinale: () => {
    gameStateMachine.transition(GAME_STATES.GRAND_FINALE);
    grandFinaleModal.show(saveAdapter.load());
  },
  onResetProgress: () => {
    gameStateMachine.transition(GAME_STATES.PARENTAL_GATE);
    parentalGateModal.show();
  },
  onClose: () => {
    gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
  }
});

const questionManagerModal = new QuestionManagerModal({
  audioService,
  onQuestionAdded: (q) => {
    hudController.setStatus(`📝 Đã thêm câu hỏi mới: "${q.prompt.slice(0, 30)}..."`);
  }
});

// Nút mở Soạn & Thêm Câu Hỏi (Phụ Huynh / Giáo Viên)
const btnManageQuestions = document.getElementById('btn-manage-questions');
if (btnManageQuestions) {
  btnManageQuestions.addEventListener('click', () => {
    questionManagerModal.show();
  });
}

const btnQuickAddQuestion = document.getElementById('btn-quick-add-question');
if (btnQuickAddQuestion) {
  btnQuickAddQuestion.addEventListener('click', () => {
    questionManagerModal.show();
  });
}

// Khởi tạo Modal Chọn Nhân Vật & Ngoại Trang
const characterSelectModal = new CharacterSelectModal({
  saveAdapter,
  progressionSystem,
  audioService,
  hudController
});
window.__characterSelectModal = characterSelectModal;

// Biến quản lý luồng khởi đầu: Loading -> Chọn Nhân Vật -> Bắt đầu chơi
let isGameStarted = false;
let pendingStoryIntro = null;
let pendingKitchenWelcome = false;

// Khởi tạo Màn Hình Loading Khởi Đầu (Preloader Screen)
const gameLoadingScreen = new GameLoadingScreen({
  audioService,
  onComplete: () => {
    // Sau khi nạp tài nguyên xong -> Mở Màn hình Chọn Nhân Vật trước khi bắt đầu
    characterSelectModal.showInitialSelection({
      onStart: (selectedSkin, selectedName) => {
        isGameStarted = true;
        const displayName = selectedName || (selectedSkin === 'knight' ? 'Bé Sam Kuromi' : 'Bé Sâu Dũng Cảm');
        hudController.setStatus(selectedSkin === 'knight'
          ? `👑 ${displayName} đã sẵn sàng!`
          : `🌱 ${displayName} đã sẵn sàng!`
        );
        hudController.updatePlayerHud();
        updateHeroVitalsHud();

        // Bỏ tất cả các bảng sẵn sàng cốt truyện theo yêu cầu của người dùng
        if (pendingStoryIntro) {
          shownStoryMapIds.add(pendingStoryIntro.mapConfig.id);
          pendingStoryIntro = null;
        }
        if (pendingKitchenWelcome) {
          pendingKitchenWelcome = false;
          const isWashed = Boolean(cookingSystem.getState()?.handsWashed);
          if (!isWashed) {
            audioService.playChime(640, 0.2);
            kitchenStationModal.showSinkModal();
            audioService.speak('Bé ơi, hãy rửa tay sạch sẽ trước khi vào bếp nấu ăn nhé!');
          }
        }
      }
    });
  }
});
window.__gameLoadingScreen = gameLoadingScreen;

const btnSelectCharacter = document.getElementById('btn-select-character');
if (btnSelectCharacter) {
  btnSelectCharacter.addEventListener('click', () => {
    characterSelectModal.show();
  });
}

const btnHeroAvatar = document.getElementById('btn-hero-avatar');
if (btnHeroAvatar) {
  btnHeroAvatar.addEventListener('click', () => {
    characterSelectModal.show();
  });
}

// Cập nhật thông tin nhân vật và avatar khi khởi động
hudController.updatePlayerHud();

// Lắng nghe sự kiện chuyển đổi profile hoặc đổi tên nhân vật thời gian thực
window.addEventListener('hero:profile-changed', () => {
  const latestState = saveAdapter.load();
  Object.assign(gameState, latestState);
  progressionSystem.state = gameState;
  hudController.updatePlayerHud();
  hudController.updateCampaignHud?.();
  updateKitchenStatus();
  updateHeroVitalsHud();
});

// Lắng nghe sự kiện mở khóa skin khi lên cấp
window.addEventListener('hero:skin-unlocked', (e) => {
  const skin = e.detail?.skin;
  hudController.setStatus('🎉 BÉ SÂU ĐÃ LÊN CẤP! Mở khóa ngoại trang Hiệp Sĩ Cầu Vồng!');
  if (audioService) {
    audioService.playLevelUp();
    audioService.speak('Chúc mừng bé đã lên cấp! Mở khóa bộ quần áo Hiệp Sĩ Cầu Vồng mới!');
  }
  characterSelectModal.show();
});

// 5. Cầu nối sự kiện giữa Phaser và DOM UI
window.addEventListener('game:encounter-prompt', (e) => {
  const { encounter, isBoss } = e.detail || {};
  if (!encounter) return;
  battleArenaModal.showPrompt(encounter, isBoss);
});

window.addEventListener('game:encounter-start', (e) => {
  const { encounter } = e.detail || {};
  if (!encounter) return;
  const targetState = encounter.phases ? GAME_STATES.BOSS_BATTLE : GAME_STATES.ENCOUNTER_QUESTION;
  gameStateMachine.transition(targetState);
  battleArenaModal.openArena(encounter);
});

// Nút mở Pet Care Sheet từ topbar
const petBtnTop = document.getElementById('pet-button');
if (petBtnTop) {
  petBtnTop.addEventListener('click', () => {
    if (gameStateMachine.canTransitionTo(GAME_STATES.PET_CARE)) {
      gameStateMachine.transition(GAME_STATES.PET_CARE);
      petCareModal.show();
    }
  });
}

// Nút mở Mini Game Mê Cung Kỳ Diệu từ topbar
const btnOpenMaze = document.getElementById('btn-open-maze');
if (btnOpenMaze) {
  btnOpenMaze.addEventListener('click', () => {
    mazeMinigameModal.show();
  });
}

// Sự kiện kích hoạt Mê Cung (Đã chuyển vào các câu hỏi khi vượt ải thay vì hiện ngẫu nhiên)
window.addEventListener('game:trigger-random-maze', () => {
  // Safe no-op: Mini game Mê Cung hiện đã được tích hợp thẳng vào chuỗi câu hỏi vượt ải
});

// Nút chuyển nhanh đến Nông Trại Nuôi Thú Thần Kỳ
const btnQuickPetFarm = document.getElementById('btn-quick-pet-farm');
if (btnQuickPetFarm) {
  btnQuickPetFarm.addEventListener('click', () => {
    travelToZone('map_pet_farm');
  });
}

// Lắng nghe khi click vào Bé Cún trên bản đồ để mở bảng chăm sóc
window.addEventListener('game:open-pet-modal', () => {
  if (gameStateMachine.canTransitionTo(GAME_STATES.PET_CARE)) {
    gameStateMachine.transition(GAME_STATES.PET_CARE);
    petCareModal.show();
  }
});

// Mô phỏng cập nhật nhu cầu thú cưng mỗi 10 giây thực tế (Mục 1 & 8 he-thong-nuoi-thu.md)
// Station completion replaces the saved pet object; sync the simulation before
// its next tick so it cannot overwrite a freshly completed bath or drink.
window.addEventListener('game:pet-updated', e => {
  const pet = e.detail?.pet || (e.detail?.type ? e.detail : null);
  if (pet && pet !== petSystem.getPet()) {
    Object.assign(petSystem.getPet(), pet);
  }
  if (pet) gameState.pet = petSystem.getPet();
  badgeSystem.checkAllBadges(gameState);
});
setInterval(() => {
  if (petSystem && saveAdapter) {
    petSystem.updateSimulation(10);
    const updatedPet = petSystem.getPet();
    const state = saveAdapter.load();
    state.pet = updatedPet;
    saveAdapter.save(state);
    window.dispatchEvent(new CustomEvent('game:pet-updated', { detail: { pet: updatedPet } }));
  }
}, 10000);

// Nút mở Bản đồ từ Topbar và Quick Actions
function openMapSelector() {
  if (gameStateMachine.canTransitionTo(GAME_STATES.HUB_MAP_SELECT)) {
    gameStateMachine.transition(GAME_STATES.HUB_MAP_SELECT);
    mapSelectModal.show(saveAdapter.load());
  }
}

const btnTopMap = document.getElementById('btn-top-map');
if (btnTopMap) {
  btnTopMap.addEventListener('click', openMapSelector);
}

const btnOpenMap = document.getElementById('btn-open-map');
if (btnOpenMap) {
  btnOpenMap.addEventListener('click', openMapSelector);
}

// Lắng nghe bản đồ sẵn sàng để mở Story Intro cho từng vùng đất mới & đồng bộ Quest HUD
const shownStoryMapIds = new Set();
window.addEventListener('game:map-ready', (e) => {
  const { mapConfig } = e.detail || {};
  if (mapConfig?.id) {
    gameState.campaign.currentMapId = mapConfig.id;
    progressionSystem.state.campaign.currentMapId = mapConfig.id;
  }
  gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);

  // Đồng bộ Nhiệm vụ và Tiến trình bản đồ trên HUD thời gian thực
  if (mapConfig && hudController) {
    const objective = mapConfig.objective || 
      (mapConfig.id === 'map_kitchen' ? 'Rửa tay sạch sẽ, chọn món ăn và nấu bữa cơm ngon lành!' :
       mapConfig.id === 'map_pet_farm' ? 'Chăm sóc và vui chơi cùng Thỏ Bông!' : 'Khám phá và giải đố cùng bạn bè!');
    const zoneName = mapConfig.name || CAMPAIGN_ZONES[mapConfig.id]?.name || 'Vương Quốc Cầu Vồng';
    const subtitle = mapConfig.subtitle || '';

    hudController.setQuest(objective);
    hudController.setProgress(zoneName);
    if (subtitle) {
      hudController.setStatus(subtitle);
    }
  }

  // Đồng bộ các nút chiến đấu nhanh phù hợp theo từng loại bản đồ
  const isCombatMap = Array.isArray(mapConfig?.encounters) && mapConfig.encounters.length > 0;
  const testEncEl = document.getElementById('test-encounter');
  const testBossEl = document.getElementById('test-boss');
  if (testEncEl) testEncEl.style.display = '';
  if (testBossEl) testBossEl.style.display = (isCombatMap && mapConfig?.boss) ? '' : 'none';

  // Cập nhật hướng dẫn điều khiển dưới đáy màn hình
  const controlHintEl = document.querySelector('.control-hint span:last-child');
  if (controlHintEl) {
    if (mapConfig?.id === 'map_kitchen') {
      controlHintEl.textContent = 'chạm trạm bếp để nấu ăn & thưởng thức';
    } else if (mapConfig?.id === 'map_pet_farm') {
      controlHintEl.textContent = 'chạm cún cưng để vuốt ve & chăm sóc';
    } else {
      if (mapConfig?.id === 'map4') {
        controlHintEl.textContent = 'chạm quái vật Sa Mạc để giải đố';
      } else if (mapConfig?.id === 'map3') {
        controlHintEl.textContent = 'chạm quái vật Pha Lê để giải đố';
      } else if (mapConfig?.id === 'map2') {
        controlHintEl.textContent = 'chạm quái vật Vịnh Biển để giải đố';
      } else {
        controlHintEl.textContent = 'chạm các bạn nhỏ để giải đố';
      }
    }
  }

  // Cập nhật nhãn nút Vào Bếp trên topbar (ẩn nút Tủ lạnh khi đang ở trong Bếp Cầu Vồng theo yêu cầu)
  const kitchenBtn = document.getElementById('btn-open-kitchen');
  if (kitchenBtn) {
    if (mapConfig?.id === 'map_kitchen') {
      kitchenBtn.style.display = 'none';
      kitchenBtn.hidden = true;
    } else {
      kitchenBtn.style.display = '';
      kitchenBtn.hidden = false;
      kitchenBtn.innerHTML = '<img src="/assets/ui/custom_kids_ui/icon_kitchen_pan_3d.png" class="topbar-icon" alt=""> <span id="kitchen-btn-label">Vào bếp</span>';
      kitchenBtn.setAttribute('title', 'Mở Căn Bếp Cầu Vồng');
    }
  }

  if (mapConfig?.storyIntro && !shownStoryMapIds.has(mapConfig.id)) {
    shownStoryMapIds.add(mapConfig.id);
    if (audioService) {
      audioService.playChime(640, 0.16);
    }
    window.dispatchEvent(new CustomEvent('game:show-toast', {
      detail: { message: `✨ Chào mừng bé đến ${mapConfig.name}!` }
    }));
  }
});

// Lắng nghe sự kiện hoàn thành vùng khi thắng Boss (Bỏ hoàn toàn bảng recap ở tất cả các maps)
window.addEventListener('game:show-recap', (e) => {
  const recapData = e.detail || {};
  Object.assign(gameState, saveAdapter.load());
  progressionSystem.state = gameState;
  const currentMap = gameState.campaign.currentMapId || 'map_pet_farm';
  
  // Ghi nhận hoàn thành vùng và trao pha lê cốt truyện
  progressionSystem.completeMap(currentMap);
  const zoneConfig = CAMPAIGN_ZONES[currentMap];
  if (zoneConfig?.storyItem) {
    progressionSystem.addStoryItem(zoneConfig.storyItem.id);
  }
  saveAdapter.save(gameState);

  // YÊU CẦU: Bỏ hoàn toàn bảng này ở tất cả các maps (không hiện Recap Modal)
  questionDialog.close();
  gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
  const zoneDisplayName = zoneConfig?.name || 'Vùng đất';
  hudController.setStatus(`🎉 ${zoneDisplayName} đã hoàn thành xuất sắc! Cổng dịch chuyển đã mở!`);
  hudController.updatePlayerHud();

  if (audioService) {
    audioService.playSuccess?.();
    audioService.speak?.(`Chúc mừng bé đã hoàn thành xuất sắc ${zoneDisplayName}! Cổng dịch chuyển đã mở, bé hãy bước vào cổng nhé!`);
  }
});

// Khi đóng dialog câu hỏi
window.addEventListener('game:encounter-closed', () => {
  gameStateMachine.transition(GAME_STATES.WORLD_EXPLORATION);
});

// Lắng nghe thông báo toast từ môi trường / puzzle
window.addEventListener('game:show-toast', (e) => {
  const { message } = e.detail || {};
  hudController.setStatus(message);
  audioService.speak(message);
});

// Lắng nghe khi Cổng Hoa mở khóa thành công
window.addEventListener('game:puzzle-unlocked', (e) => {
  const { message } = e.detail || {};
  const msg = message || '🌺 Cổng hoa đã nở rộ ngát hương! Đường đến Rồng Thần đã mở!';
  hudController.setStatus(msg);
  audioService.playSuccess();
  audioService.speak(msg);
});

// Nút Bật/Tắt và hiển thị trục tọa độ X/Y thời gian thực theo nhân vật
const btnToggleCoords = document.getElementById('btn-toggle-coords');
const coordsDisplayText = document.getElementById('coords-display-text');

if (btnToggleCoords) {
  btnToggleCoords.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('game:toggle-coords'));
  });
}

window.addEventListener('game:coords-updated', (e) => {
  const { x, y, visible } = e.detail || {};
  if (coordsDisplayText && typeof x === 'number' && typeof y === 'number') {
    coordsDisplayText.textContent = `X: ${x} | Y: ${y}`;
  }
  if (btnToggleCoords) {
    if (visible) {
      btnToggleCoords.classList.add('active-coords');
      btnToggleCoords.setAttribute('aria-pressed', 'true');
    } else {
      btnToggleCoords.classList.remove('active-coords');
      btnToggleCoords.setAttribute('aria-pressed', 'false');
    }
  }
});

// ==========================================================================
// CẦN ĐIỀU KHIỂN ẢO (VIRTUAL JOYSTICK) & TỐI ƯU HÓA MÁY TÍNH BẢNG (TABLET)
// ==========================================================================
const virtualJoystick = new VirtualJoystick({
  container: document.querySelector('.scene-stage'),
  onMove: ({ x, y, force }) => {
    const worldScene = window.__worldScene || game.scene.getScene('WorldScene');
    if (worldScene && typeof worldScene.setJoystickDirection === 'function') {
      worldScene.setJoystickDirection(x, y);
    }
  }
});
window.__virtualJoystick = virtualJoystick;

// Nút Bật / Tắt Cần Gạt Ảo trên Topbar
const btnToggleJoystick = document.getElementById('btn-toggle-joystick');
if (btnToggleJoystick) {
  const updateJoystickUI = (enabled) => {
    btnToggleJoystick.classList.toggle('active-joystick', enabled);
    btnToggleJoystick.classList.toggle('inactive-joystick', !enabled);
    btnToggleJoystick.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    const textEl = document.getElementById('joystick-toggle-text');
    if (textEl) {
      textEl.textContent = enabled ? 'Cần Gạt: Bật' : 'Cần Gạt: Tắt';
    }
  };

  // Mặc định luôn BẬT cho trải nghiệm máy tính bảng sẵn sàng xuất sắc
  let joystickEnabled = localStorage.getItem('rkr_joystick_enabled') !== 'false';
  virtualJoystick.setVisible(joystickEnabled);
  updateJoystickUI(joystickEnabled);

  btnToggleJoystick.addEventListener('click', () => {
    joystickEnabled = !joystickEnabled;
    localStorage.setItem('rkr_joystick_enabled', String(joystickEnabled));
    virtualJoystick.setVisible(joystickEnabled);
    updateJoystickUI(joystickEnabled);
  });
}

// Phím tắt 'J' để nhanh chóng Bật / Tắt Cần Gạt Ảo
window.addEventListener('keydown', (e) => {
  if (e.target && e.target.matches('input, textarea')) return;
  if (e.key === 'j' || e.key === 'J') {
    if (btnToggleJoystick) btnToggleJoystick.click();
  }
});

// Tối ưu hóa cử chỉ trình duyệt trên máy tính bảng (chống zoom ngoài ý muốn & chống contextmenu)
if (typeof window !== 'undefined') {
  // Chống pinch-to-zoom trên iOS Safari
  document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });

  // Chống double-tap to zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      if (!e.target?.matches('input, textarea')) {
        e.preventDefault();
      }
    }
    lastTouchEnd = now;
  }, { passive: false });

  // Chống giữ lâu hiện context menu trên tablet
  window.addEventListener('contextmenu', (e) => {
    if (e.target && !e.target.matches('input, textarea')) {
      e.preventDefault();
    }
  });
}


// Nút thử thách Bạn Mầm nhanh (Playtest)
const testEncounterBtn = document.getElementById('test-encounter');
if (testEncounterBtn) {
  testEncounterBtn.addEventListener('click', () => {
    const currentMapId = gameState.campaign?.currentMapId || 'map_pet_farm';
    const mapConfig = getMapConfig(currentMapId);
    const state = saveAdapter.load();
    const rescued = state.campaign?.rescuedFriends || {};
    
    // Tự động chọn quái vật tiếp theo chưa giải cứu trong map
    const encountersList = (Array.isArray(mapConfig?.encounters) && mapConfig.encounters.length > 0)
      ? mapConfig.encounters
      : (getMapConfig('map1')?.encounters || []);
    const unrescued = encountersList.find(enc => !rescued[enc.id]);
    const encounterToPlay = unrescued || encountersList[0] || {
      id: 'enc_map1_1',
      name: 'Nấm Con Vui Vẻ',
      questionId: 'q_map1_colors_1',
      reward: { stars: 1, exp: 10 }
    };
    battleArenaModal.showPrompt(encounterToPlay, false);
  });
}

// Nút thử thách Boss nhanh (Playtest)
const testBossBtn = document.getElementById('test-boss');
if (testBossBtn) {
  testBossBtn.addEventListener('click', () => {
    const currentMapId = gameState.campaign?.currentMapId || 'map1';
    const mapConfig = getMapConfig(currentMapId);
    const bossConfig = mapConfig.boss || {
      id: 'boss_map1',
      name: 'Rồng Thần Lửa Cầu Vồng',
      spriteKey: 'boss_dragon',
      phases: [
        {
          phase: 1,
          name: 'Rồng Thần (Ngọn Lửa Khởi Nguyên)',
          questionId: 'q_map1_boss_p1',
          instruction: 'Pha 1: Gọi Rồng Thần thức dậy và xoa dịu ngọn lửa!'
        },
        {
          phase: 2,
          name: 'Rồng Thần (Hỏa Long Rực Rỡ)',
          questionId: 'q_map1_boss_p2',
          instruction: 'Pha 2: Giải đố để thắp sáng cầu vồng kết bạn với Rồng Thần!'
        }
      ],
      reward: { stars: 3, exp: 30, unlockMap: 'map2' }
    };
    battleArenaModal.showPrompt(bossConfig, true);
  });
}

// Nút thử nghiệm Cổng Dịch Chuyển Cầu Vồng nhanh (Playtest)
const testPortalBtn = document.getElementById('btn-test-portal');
if (testPortalBtn) {
  testPortalBtn.addEventListener('click', () => {
    const currentMapId = gameState.campaign?.currentMapId || 'map1';
    const targetId = currentMapId === 'map1' ? 'map2' : (currentMapId === 'map2' ? 'map3' : 'map1');
    const targetZone = CAMPAIGN_ZONES[targetId] || { name: 'Vịnh Biển Pha Lê' };
    if (!progressionSystem.isMapUnlocked(targetId)) {
      progressionSystem.unlockMap(targetId);
      saveAdapter.save(gameState);
    }
    mapTransitionOverlay.execute8StepWarp({
      targetMapId: targetId,
      targetMapName: targetZone.name || 'Vịnh Biển Pha Lê'
    });
  });
}

// 6. Cấu hình Phaser 2D Engine với khả năng tự động thích ứng & Canvas 2D Fallback
function getPhaserRendererType() {
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (gl && typeof gl.getParameter === 'function') {
      // Giải phóng context thử nghiệm để không làm cạn kiệt tài nguyên WebGL của trình duyệt
      try {
        const loseExt = gl.getExtension('WEBGL_lose_context');
        if (loseExt) loseExt.loseContext();
      } catch {}
      return Phaser.AUTO;
    }
  } catch (err) {
    console.warn('[Phaser] WebGL không khả dụng, sử dụng chế độ Canvas 2D:', err);
  }
  return Phaser.CANVAS;
}

const config = {
  type: getPhaserRendererType(),
  parent: 'game-root',
  width: DESIGN_WIDTH,
  height: DESIGN_HEIGHT,
  backgroundColor: '#a9d5b0',
  transparent: false,
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  input: {
    activePointers: 3
  },
  scene: [BootScene, PreloadScene, WorldScene]
};

// Khởi chạy Phaser Game với cơ chế Fallback tự động đa tầng
let game;
try {
  game = new Phaser.Game(config);
} catch (webglErr) {
  console.warn('[Phaser] Lỗi khởi tạo WebGL, tự động chuyển sang chế độ Canvas 2D an toàn:', webglErr);
  config.type = Phaser.CANVAS;
  game = new Phaser.Game(config);
}
window.__PHASER_GAME__ = game;

// Watchdog an toàn: Đảm bảo WorldScene luôn hiển thị và không bao giờ bị đơ màn hình xanh
setTimeout(() => {
  const ws = window.__worldScene || game?.scene?.getScene('WorldScene');
  if (!ws || !ws.sys || !ws.sys.isActive()) {
    console.warn('[Phaser Watchdog] WorldScene chưa hoạt động sau 2.2s, cưỡng chế kích hoạt thế giới...');
    try {
      if (game?.scene && !game.scene.isActive('WorldScene')) {
        game.scene.start('WorldScene', { mapId: 'map_pet_farm' });
      }
    } catch (e) {
      console.error('[Phaser Watchdog] Không thể khởi động WorldScene tự động:', e);
    }
  }
}, 2200);

// Khắc phục triệt để việc mất hình trên iPad / Safari: Quản lý phục hồi WebGL Context & Visibility
const setupPhaserCanvasRecovery = () => {
  const canvas = game.canvas || document.querySelector('#game-root canvas');
  if (canvas && !canvas.__recoveryBound) {
    canvas.__recoveryBound = true;
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('[Phaser] WebGL Context bị mất! Đang tự động khôi phục khung cảnh...');
      setTimeout(() => {
        const ws = game.scene.getScene('WorldScene');
        if (ws && ws.sys && ws.sys.isActive()) {
          ws.scene.restart();
        }
      }, 500);
    });
    canvas.addEventListener('webglcontextrestored', () => {
      console.info('[Phaser] WebGL Context đã phục hồi! Tái tạo lại khung hình thế giới...');
      const ws = game.scene.getScene('WorldScene');
      if (ws && ws.scene) {
        ws.scene.restart();
      }
    });
  }
};
if (game.canvas) {
  setupPhaserCanvasRecovery();
} else {
  game.events.once('ready', setupPhaserCanvasRecovery);
}

// Khi quay trở lại tab trên Safari / iPad hoặc mở khóa màn hình
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if (window.__PHASER_GAME__) {
      try {
        if (window.__PHASER_GAME__.scale) {
          window.__PHASER_GAME__.scale.refresh();
        }
        const ws = window.__PHASER_GAME__.scene.getScene('WorldScene');
        if (ws) {
          if (ws.setWorldScale) ws.setWorldScale();
          if (ws.hero?.restoreDisplaySize) ws.hero.restoreDisplaySize();
        }
      } catch (err) {
        console.warn('[Game] Lỗi thức tỉnh khung cảnh:', err);
      }
    }
  }
});

// Cập nhật scale khi xoay màn hình hoặc thay đổi kích thước cửa sổ
game.scale.on('resize', () => {
  const worldScene = game.scene.getScene('WorldScene');
  if (worldScene && worldScene.setWorldScale) {
    worldScene.setWorldScale();
  }
});
window.addEventListener('resize', () => {
  if (game && game.scale) {
    game.scale.refresh();
  }
});

// Dọn dẹp tài nguyên âm thanh khi người dùng rời hoặc ẩn trang (không hủy Phaser game để giữ canvas khi quay lại tab)
window.addEventListener('pagehide', () => {
  audioService.stopAll();
});

// Đăng ký Service Worker cho Progressive Web App (PWA)
if (typeof window !== 'undefined' && /^https?:$/.test(window.location.protocol) && 'serviceWorker' in navigator) {
  let hadController = Boolean(navigator.serviceWorker.controller);
  let updatingPage = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !updatingPage) {
      updatingPage = true;
      window.location.reload();
    }
    hadController = true;
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then((registration) => {
      registration.update();
      console.log('[PWA] Service Worker sẵn sàng hoạt động:', registration.scope);
    }).catch((err) => {
      console.info('[PWA] Service Worker không hoạt động ở chế độ dev hiện tại:', err.message);
    });
  });
}

export const GAME_VERSION = '3.5.0';

export function syncGameVersionDisplay() {
  const vText = `ver ${GAME_VERSION}`;
  const badge = document.getElementById('game-version-badge');
  if (badge) badge.textContent = vText;
  const watermark = document.getElementById('stage-version-watermark');
  if (watermark) watermark.textContent = vText;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncGameVersionDisplay);
  } else {
    syncGameVersionDisplay();
  }
}

export { game, gameState, progressionSystem, petSystem, combatSystem };
import './toolbar.js';
