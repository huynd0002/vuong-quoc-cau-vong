/**
 * Save Adapter & Migration Service
 * Chịu trách nhiệm lưu trữ và nâng cấp tiến trình người chơi an toàn.
 * Hỗ trợ chuyển đổi từ khóa lưu V1 (RAINBOW_KIDS_RPG_SAVE_V1) sang Schema V2,
 * đồng thời quản lý Profile theo tên nhân vật bé đặt (Name-Based Profile Storage).
 */

import { defaultCookingState, normalizeCookingState } from '../../game/systems/cookingSystem.js';
import { defaultFishingState, normalizeFishingState } from '../../game/systems/fishingSystem.js';
import { defaultFashionState, normalizeFashionState } from '../../game/systems/fashionSystem.js';
import { defaultBackpackState, normalizeBackpackState } from '../../game/systems/backpackSystem.js';

export const SAVE_KEY_V1 = 'RAINBOW_KIDS_RPG_SAVE_V1';
export const CURRENT_SCHEMA_VERSION = 2;
export const PROFILES_INDEX_KEY = 'RAINBOW_KIDS_PROFILES_V1';
export const ACTIVE_PROFILE_KEY = 'RAINBOW_KIDS_ACTIVE_PROFILE_V1';
export const PROFILE_KEY_PREFIX = 'RAINBOW_KIDS_PROFILE_DATA_';

export function sanitizeProfileName(name) {
  if (typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ').slice(0, 30);
}

// Fallback in-memory storage cho môi trường Node.js (Unit test)
let memoryStore = {};

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: (key) => memoryStore[key] || null,
    setItem: (key, val) => { memoryStore[key] = String(val); },
    removeItem: (key) => { delete memoryStore[key]; },
    clear: () => { memoryStore = {}; }
  };
}

export function getDefaultGameState() {
  return {
    version: CURRENT_SCHEMA_VERSION,
    cooking: defaultCookingState(),
    fishing: defaultFishingState(),
    fashion: defaultFashionState(),
    backpacks: defaultBackpackState(),
    player: {
      name: 'Bé Sâu',
      level: 1,
      exp: 0,
      stars: 0,
      gems: 0,
      selectedSkin: 'default',
      unlockedSkins: ['default'],
      unlockedBadges: [],
      equippedBadge: null
    },
    pet: {
      type: 'dog',
      name: 'Thỏ Bông',
      hunger: 100,
      thirst: 100,
      clean: 100,
      fun: 80,
      energy: 100,
      bladder: 0,
      health: 100,
      affection: 10,
      personality: 'quanchu',
      isSleeping: false,
      affinity: 1,
      level: 1,
      exp: 0,
      isCompanion: false,
      lastCareTimestamp: Date.now()
    },
    campaign: {
      currentMapId: 'map_pet_farm',
      unlockedMaps: ['map1'],
      completedMaps: [],
      rescuedFriends: {},
      questFlags: {},
      storyItems: [],
      learningStats: {
        totalAnswers: 0,
        firstTryCount: 0,
        skillsPracticed: {}
      }
    },
    settings: {
      soundEnabled: true,
      volume: 0.9,
      reducedMotion: false,
      textToSpeech: true
    }
  };
}

/**
 * Nâng cấp dữ liệu save V1 cũ sang Schema V2
 */
export function migrateV1toV2(rawV1) {
  const defaultState = getDefaultGameState();
  if (!rawV1 || typeof rawV1 !== 'object') {
    return defaultState;
  }

  const state = { ...defaultState };

  // 1. Chuyển đổi dữ liệu người chơi
  if (rawV1.player || rawV1.playerLevel) {
    state.player.level = Number(rawV1.player?.level || rawV1.playerLevel || 1);
    state.player.exp = Number(rawV1.player?.exp || rawV1.playerExp || 0);
    state.player.stars = Number(rawV1.player?.stars || rawV1.stars || rawV1.coins || 0);
    state.player.gems = Number(rawV1.player?.gems || rawV1.gems || 0);
  }

  // 2. Chuyển đổi dữ liệu Thỏ Bông
  if (rawV1.pet) {
    state.pet.hunger = Math.max(30, Math.min(100, Number(rawV1.pet.hunger ?? 80)));
    state.pet.clean = Math.max(30, Math.min(100, Number(rawV1.pet.clean ?? 80)));
    state.pet.energy = Math.max(30, Math.min(100, Number(rawV1.pet.energy ?? 90)));
    state.pet.affinity = Math.max(1, Math.min(5, Number(rawV1.pet.affinity || rawV1.pet.hearts || 1)));
    state.pet.level = Number(rawV1.pet.level || 1);
    state.pet.exp = Number(rawV1.pet.exp || rawV1.pet.xp || 0);
    state.pet.isCompanion = Boolean(rawV1.pet.isCompanion ?? rawV1.pet.isAccompanying ?? false);
    state.pet.lastCareTimestamp = Number(rawV1.pet.lastCareTimestamp || Date.now());
  }

  // 3. Chuyển đổi tiến trình bản đồ
  if (Array.isArray(rawV1.unlockedMaps) && rawV1.unlockedMaps.length > 0) {
    state.campaign.unlockedMaps = [...new Set(['map1', ...rawV1.unlockedMaps])];
  }
  if (rawV1.currentMapId) {
    state.campaign.currentMapId = String(rawV1.currentMapId);
  }
  if (rawV1.rescuedFriends && typeof rawV1.rescuedFriends === 'object') {
    state.campaign.rescuedFriends = { ...rawV1.rescuedFriends };
  }

  return state;
}

export class SaveAdapter {
  constructor(storageKey = SAVE_KEY_V1) {
    this.storageKey = storageKey;
    this.storage = getStorage();

    const isDefaultKey = storageKey === SAVE_KEY_V1;
    this.profilesIndexKey = isDefaultKey ? PROFILES_INDEX_KEY : `${storageKey}_PROFILES`;
    this.activeProfileKey = isDefaultKey ? ACTIVE_PROFILE_KEY : `${storageKey}_ACTIVE_PROFILE`;
    this.profilePrefix = isDefaultKey ? PROFILE_KEY_PREFIX : `${storageKey}_PROFILE_`;
  }

  getProfileStorageKey(name) {
    const clean = sanitizeProfileName(name).toLowerCase() || 'default';
    return `${this.profilePrefix}${encodeURIComponent(clean)}`;
  }

  /**
   * Lấy danh sách tóm tắt tất cả các profile nhân vật đã lưu
   */
  listProfiles() {
    try {
      const raw = this.storage.getItem(this.profilesIndexKey);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      }
    } catch (e) {
      console.warn('[SaveAdapter] Lỗi đọc danh sách profiles:', e);
    }

    // Nếu chưa có index nhưng đã có save ở storageKey, tự động import thành profile đầu tiên
    try {
      const existingRaw = this.storage.getItem(this.storageKey);
      if (existingRaw) {
        const parsed = JSON.parse(existingRaw);
        if (parsed && typeof parsed === 'object') {
          const charName = sanitizeProfileName(parsed.player?.name) || 'Bé Sâu';
          const profileItem = {
            name: charName,
            skin: parsed.player?.selectedSkin || 'default',
            level: Number(parsed.player?.level) || 1,
            exp: Number(parsed.player?.exp) || 0,
            stars: Number(parsed.player?.stars) || 0,
            updatedAt: parsed.updatedAt || Date.now()
          };
          this.storage.setItem(this.profilesIndexKey, JSON.stringify([profileItem]));
          this.storage.setItem(this.getProfileStorageKey(charName), existingRaw);
          this.storage.setItem(this.activeProfileKey, charName);
          return [profileItem];
        }
      }
    } catch {}

    const defaultProfile = {
      name: 'Bé Sâu',
      skin: 'default',
      level: 1,
      exp: 0,
      stars: 0,
      updatedAt: Date.now()
    };
    return [defaultProfile];
  }

  /**
   * Lấy tên profile nhân vật đang hoạt động
   */
  getActiveProfileName() {
    try {
      const active = this.storage.getItem(this.activeProfileKey);
      if (active && sanitizeProfileName(active)) {
        return sanitizeProfileName(active);
      }
    } catch {}
    const list = this.listProfiles();
    return list[0]?.name || 'Bé Sâu';
  }

  /**
   * Đặt profile nhân vật hoạt động
   */
  setActiveProfile(name) {
    const cleanName = sanitizeProfileName(name);
    if (!cleanName) return false;
    try {
      this.storage.setItem(this.activeProfileKey, cleanName);
      const profileKey = this.getProfileStorageKey(cleanName);
      const rawData = this.storage.getItem(profileKey);
      if (rawData) {
        this.storage.setItem(this.storageKey, rawData);
      }
      return true;
    } catch (e) {
      console.error('[SaveAdapter] Không thể đổi active profile:', e);
      return false;
    }
  }

  /**
   * Phân tích và chuẩn hóa dữ liệu game state từ chuỗi JSON an toàn
   */
  _parseAndNormalizeState(raw, charName) {
    if (!raw) return getDefaultGameState();
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        return getDefaultGameState();
      }

      let state = parsed;
      if (!state.version || state.version < CURRENT_SCHEMA_VERSION) {
        state = migrateV1toV2(state);
      }

      const defaultState = getDefaultGameState();
      const resolvedName = sanitizeProfileName(charName) || sanitizeProfileName(state.player?.name) || 'Bé Sâu';

      return {
        ...defaultState,
        ...state,
        cooking: normalizeCookingState(state.cooking),
        fishing: normalizeFishingState(state.fishing),
        fashion: normalizeFashionState(state.fashion),
        backpacks: normalizeBackpackState(state.backpacks),
        player: (() => {
          const mergedPlayer = { ...defaultState.player, ...(state.player || {}) };
          mergedPlayer.name = resolvedName;
          if (!Array.isArray(mergedPlayer.unlockedSkins)) {
            mergedPlayer.unlockedSkins = ['default'];
          }
          if (mergedPlayer.level >= 2 && !mergedPlayer.unlockedSkins.includes('knight')) {
            mergedPlayer.unlockedSkins.push('knight');
          }
          if (!mergedPlayer.selectedSkin) {
            mergedPlayer.selectedSkin = (resolvedName.toLowerCase().includes('sam') || resolvedName.toLowerCase().includes('kuromi'))
              ? 'knight'
              : 'default';
          }
          if (!Array.isArray(mergedPlayer.unlockedBadges)) {
            mergedPlayer.unlockedBadges = [];
          }
          if (mergedPlayer.equippedBadge === undefined) {
            mergedPlayer.equippedBadge = null;
          }
          return mergedPlayer;
        })(),
        pet: { ...defaultState.pet, ...(state.pet || {}) },
        campaign: {
          ...defaultState.campaign,
          ...(state.campaign || {}),
          rescuedFriends: { ...defaultState.campaign.rescuedFriends, ...(state.campaign?.rescuedFriends || {}) },
          questFlags: { ...defaultState.campaign.questFlags, ...(state.campaign?.questFlags || {}) },
          completedMaps: Array.isArray(state.campaign?.completedMaps) ? state.campaign.completedMaps : defaultState.campaign.completedMaps,
          storyItems: Array.isArray(state.campaign?.storyItems) ? state.campaign.storyItems : defaultState.campaign.storyItems,
          learningStats: {
            ...defaultState.campaign.learningStats,
            ...(state.campaign?.learningStats || {}),
            skillsPracticed: {
              ...(defaultState.campaign.learningStats.skillsPracticed || {}),
              ...(state.campaign?.learningStats?.skillsPracticed || {})
            }
          }
        },
        settings: { ...defaultState.settings, ...(state.settings || {}) }
      };
    } catch (err) {
      console.error('[SaveAdapter] Lỗi parse dữ liệu save:', err);
      return getDefaultGameState();
    }
  }

  /**
   * Tải dữ liệu theo tên nhân vật bé đặt
   */
  loadProfile(name) {
    const cleanName = sanitizeProfileName(name) || this.getActiveProfileName();
    const profileKey = this.getProfileStorageKey(cleanName);
    const raw = this.storage.getItem(profileKey);
    if (raw) {
      return this._parseAndNormalizeState(raw, cleanName);
    }

    // Nếu chưa có file profile riêng nhưng storageKey trùng active profile, dùng storageKey
    if (cleanName === this.getActiveProfileName()) {
      const legacyRaw = this.storage.getItem(this.storageKey);
      if (legacyRaw) {
        const parsed = this._parseAndNormalizeState(legacyRaw, cleanName);
        this.saveProfile(cleanName, parsed);
        return parsed;
      }
    }

    // Nhân vật mới: khởi tạo trạng thái ban đầu gắn liền với tên bé đặt
    const defaultState = getDefaultGameState();
    defaultState.player.name = cleanName;
    const lower = cleanName.toLowerCase();
    if (lower.includes('sam') || lower.includes('kuromi')) {
      defaultState.player.selectedSkin = 'knight';
      if (!defaultState.player.unlockedSkins.includes('knight')) {
        defaultState.player.unlockedSkins.push('knight');
      }
    }
    this.saveProfile(cleanName, defaultState);
    return defaultState;
  }

  /**
   * Lưu dữ liệu cố định theo tên nhân vật bé đặt
   */
  saveProfile(name, state, { writeCooking = false, writeFishing = false } = {}) {
    const cleanName = sanitizeProfileName(name) || 'Bé Sâu';
    try {
      const profileKey = this.getProfileStorageKey(cleanName);
      const existing = this.storage.getItem(profileKey) || (cleanName === this.getActiveProfileName() ? this.storage.getItem(this.storageKey) : null);
      let latestCooking;
      let latestFishing;
      if (existing) {
        try {
          const parsedExisting = JSON.parse(existing);
          if (!writeCooking) latestCooking = parsedExisting?.cooking;
          if (!writeFishing && !state?.fishing) latestFishing = parsedExisting?.fishing;
        } catch {}
      }

      const payload = {
        ...state,
        cooking: normalizeCookingState(latestCooking ?? state.cooking),
        fishing: normalizeFishingState(latestFishing ?? state.fishing),
        fashion: normalizeFashionState(state?.fashion),
        backpacks: normalizeBackpackState(state?.backpacks),
        version: CURRENT_SCHEMA_VERSION,
        updatedAt: Date.now()
      };
      if (!payload.player) payload.player = {};
      payload.player.name = cleanName;

      const appliedSpend = Number.isFinite(state.player?.kitchenSpentStars) ? state.player.kitchenSpentStars : 0;
      payload.player = {
        ...payload.player,
        stars: Math.max(0, (Number(state.player?.stars) || 0) - Math.max(0, payload.cooking.spentStars - appliedSpend)),
        kitchenSpentStars: payload.cooking.spentStars
      };

      const serialized = JSON.stringify(payload);
      this.storage.setItem(profileKey, serialized);

      // Cập nhật Profile Index
      this._updateProfileIndexEntry({
        name: cleanName,
        skin: payload.player.selectedSkin || 'default',
        level: Number(payload.player.level) || 1,
        exp: Number(payload.player.exp) || 0,
        stars: Number(payload.player.stars) || 0,
        updatedAt: payload.updatedAt
      });

      // Đồng bộ vào storageKey chính nếu là active profile
      if (cleanName.toLowerCase() === this.getActiveProfileName().toLowerCase()) {
        this.storage.setItem(this.storageKey, serialized);
      }
      return true;
    } catch (err) {
      console.error('[SaveAdapter] Không thể lưu profile:', err);
      return false;
    }
  }

  _updateProfileIndexEntry(entry) {
    try {
      const profiles = this.listProfiles();
      const existingIdx = profiles.findIndex(p => p.name.toLowerCase() === entry.name.toLowerCase());
      if (existingIdx >= 0) {
        profiles[existingIdx] = { ...profiles[existingIdx], ...entry };
      } else {
        profiles.push(entry);
      }
      this.storage.setItem(this.profilesIndexKey, JSON.stringify(profiles));
    } catch (e) {
      console.warn('[SaveAdapter] Lỗi cập nhật profile index:', e);
    }
  }

  /**
   * Xóa một profile nhân vật
   */
  deleteProfile(name) {
    const cleanName = sanitizeProfileName(name);
    if (!cleanName) return false;
    try {
      this.storage.removeItem(this.getProfileStorageKey(cleanName));
      const profiles = this.listProfiles().filter(p => p.name.toLowerCase() !== cleanName.toLowerCase());
      this.storage.setItem(this.profilesIndexKey, JSON.stringify(profiles));
      if (this.getActiveProfileName().toLowerCase() === cleanName.toLowerCase()) {
        const next = profiles[0]?.name || 'Bé Sâu';
        this.setActiveProfile(next);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Nạp trạng thái trò chơi của profile hiện tại
   */
  load() {
    try {
      const activeName = this.getActiveProfileName();
      return this.loadProfile(activeName);
    } catch (err) {
      console.error('[SaveAdapter] Lỗi nạp save, dùng mặc định an toàn:', err);
      return getDefaultGameState();
    }
  }

  /**
   * Lưu trạng thái trò chơi vào profile hiện tại
   */
  save(state, { writeCooking = false, writeFishing = false } = {}) {
    const charName = sanitizeProfileName(state?.player?.name) || this.getActiveProfileName() || 'Bé Sâu';
    if (state?.player) {
      state.player.name = charName;
    }
    return this.saveProfile(charName, state, { writeCooking, writeFishing });
  }

  /**
   * Xóa sạch dữ liệu (Hỗ trợ dọn dẹp unit test & reset game)
   */
  reset() {
    try {
      const profiles = this.listProfiles();
      for (const p of profiles) {
        this.storage.removeItem(this.getProfileStorageKey(p.name));
      }
      this.storage.removeItem(this.profilesIndexKey);
      this.storage.removeItem(this.activeProfileKey);
      this.storage.removeItem(this.storageKey);
      return true;
    } catch {
      return false;
    }
  }
}

export const saveAdapter = new SaveAdapter();
