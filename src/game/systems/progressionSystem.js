/**
 * Progression System
 * Quản lý cấp độ Bé Sâu, Sao Cầu Vồng, Đá Quý và Mở khóa các vùng đất.
 */

export const EXP_PER_LEVEL = 50;

export class ProgressionSystem {
  constructor(saveState) {
    this.state = saveState;
  }

  getPlayer() {
    return this.state.player;
  }

  getPlayerName() {
    return this.state.player?.name || (this.getSelectedSkin() === 'knight' ? 'Bé Sam' : 'Bé Sâu');
  }

  setPlayerName(name) {
    if (!this.state.player) this.state.player = {};
    this.state.player.name = name;
  }

  getCampaign() {
    return this.state.campaign;
  }

  addReward(reward = {}) {
    const player = this.state.player;
    const starsGained = Number(reward.stars || 0);
    const expGained = Number(reward.exp || 0);
    const gemsGained = Number(reward.gems || 0);

    player.stars += starsGained;
    player.exp += expGained;
    player.gems += gemsGained;

    // Tính toán thăng cấp
    let leveledUp = false;
    let unlockedNewSkin = null;
    while (player.exp >= player.level * EXP_PER_LEVEL) {
      player.exp -= player.level * EXP_PER_LEVEL;
      player.level += 1;
      leveledUp = true;
    }

    if (!Array.isArray(player.unlockedSkins)) {
      player.unlockedSkins = ['default'];
    }

    // Tự động mở khóa ngoại trang Hiệp Sĩ Cầu Vồng khi đạt Cấp 2 trở lên
    if (player.level >= 2 && !player.unlockedSkins.includes('knight')) {
      player.unlockedSkins.push('knight');
      unlockedNewSkin = 'knight';
    }

    if (leveledUp && typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('game:player-level-up', {
        detail: {
          level: player.level,
          stars: player.stars,
          unlockedNewSkin
        }
      }));
    }

    return {
      starsGained,
      expGained,
      gemsGained,
      leveledUp,
      currentLevel: player.level,
      currentStars: player.stars,
      unlockedNewSkin
    };
  }

  rescueFriend(encounterId, friendName) {
    if (!this.state.campaign.rescuedFriends) {
      this.state.campaign.rescuedFriends = {};
    }
    const isFirstTime = !this.state.campaign.rescuedFriends[encounterId];
    this.state.campaign.rescuedFriends[encounterId] = {
      name: friendName,
      rescuedAt: Date.now()
    };
    return isFirstTime;
  }

  completeMap(mapId) {
    if (!mapId) return false;
    if (!this.state.campaign.completedMaps) {
      this.state.campaign.completedMaps = [];
    }
    if (!this.state.campaign.completedMaps.includes(mapId)) {
      this.state.campaign.completedMaps.push(mapId);
      return true;
    }
    return false;
  }

  isMapCompleted(mapId) {
    return (this.state.campaign.completedMaps || []).includes(mapId);
  }

  setQuestFlag(flagKey, value = true) {
    if (!this.state.campaign.questFlags) {
      this.state.campaign.questFlags = {};
    }
    this.state.campaign.questFlags[flagKey] = value;
    return true;
  }

  getQuestFlag(flagKey) {
    return Boolean(this.state.campaign.questFlags?.[flagKey]);
  }

  addStoryItem(itemId) {
    if (!itemId) return false;
    if (!this.state.campaign.storyItems) {
      this.state.campaign.storyItems = [];
    }
    if (!this.state.campaign.storyItems.includes(itemId)) {
      this.state.campaign.storyItems.push(itemId);
      return true;
    }
    return false;
  }

  hasStoryItem(itemId) {
    return (this.state.campaign.storyItems || []).includes(itemId);
  }

  recordLearningAnswer(skillKey, isFirstTry = true) {
    if (!this.state.campaign.learningStats) {
      this.state.campaign.learningStats = {
        totalAnswers: 0,
        firstTryCount: 0,
        skillsPracticed: {}
      };
    }
    const stats = this.state.campaign.learningStats;
    stats.totalAnswers += 1;
    if (isFirstTry) {
      stats.firstTryCount += 1;
    }
    if (skillKey) {
      stats.skillsPracticed[skillKey] = (stats.skillsPracticed[skillKey] || 0) + 1;
    }
  }

  getLearningSummary() {
    const stats = this.state.campaign.learningStats || {
      totalAnswers: 0,
      firstTryCount: 0,
      skillsPracticed: {}
    };
    const accuracy = stats.totalAnswers > 0
      ? Math.round((stats.firstTryCount / stats.totalAnswers) * 100)
      : 100;

    return {
      totalAnswers: stats.totalAnswers,
      firstTryCount: stats.firstTryCount,
      accuracy,
      skillsPracticed: { ...stats.skillsPracticed }
    };
  }

  unlockMap(mapId) {
    if (!mapId) return false;
    const unlocked = this.state.campaign.unlockedMaps;
    if (!unlocked.includes(mapId)) {
      unlocked.push(mapId);
      return true;
    }
    return false;
  }

  isMapUnlocked(mapId) {
    if (
      mapId === 'map_pet_farm' ||
      mapId === 'map_kitchen' ||
      mapId === 'map_fishing_pond' ||
      mapId === 'map_rainbow_market' ||
      mapId === 'map_fashion_street'
    ) {
      return true;
    }
    return this.state.campaign.unlockedMaps.includes(mapId);
  }

  setCurrentMap(mapId) {
    if (this.isMapUnlocked(mapId)) {
      this.state.campaign.currentMapId = mapId;
      return true;
    }
    return false;
  }

  // --- QUẢN LÝ NGOẠI TRANG / NHÂN VẬT NÂNG CẤP ---
  getUnlockedSkins() {
    if (!Array.isArray(this.state.player.unlockedSkins)) {
      this.state.player.unlockedSkins = ['default'];
    }
    if (this.state.player.level >= 2 && !this.state.player.unlockedSkins.includes('knight')) {
      this.state.player.unlockedSkins.push('knight');
    }
    return [...this.state.player.unlockedSkins];
  }

  getSelectedSkin() {
    return this.state.player.selectedSkin || 'default';
  }

  setSelectedSkin(skinId) {
    const unlocked = this.getUnlockedSkins();
    if (unlocked.includes(skinId)) {
      this.state.player.selectedSkin = skinId;
      return true;
    }
    return false;
  }

  unlockSkin(skinId) {
    if (!Array.isArray(this.state.player.unlockedSkins)) {
      this.state.player.unlockedSkins = ['default'];
    }
    if (!this.state.player.unlockedSkins.includes(skinId)) {
      this.state.player.unlockedSkins.push(skinId);
      return true;
    }
    return false;
  }

  getAvailableSkins() {
    const unlocked = this.getUnlockedSkins();
    const current = this.getSelectedSkin();
    return [
      {
        id: 'default',
        name: 'Bé Sâu Mặc Định',
        title: 'Mầm Non Đáng Yêu',
        description: 'Chú sâu xanh tròn xoe ngộ nghĩnh, người bạn đồng hành thân thương từ ngày đầu bước vào thế giới thần tiên.',
        unlocked: true,
        selected: current === 'default',
        requiredLevel: 1,
        avatarUrl: '/assets/hero/sau/hero_idle.png'
      },
      {
        id: 'knight',
        name: 'Bé Sam Kuromi',
        title: 'Bé Gái Đáng Yêu 💜',
        description: 'Em bé gái tóc 2 chùm diện bộ đồ tím nhạt pastel dễ thương, mang chiếc balo hoạt hình Kuromi tinh nghịch cùng bé khám phá!',
        unlocked: unlocked.includes('knight') || this.state.player.level >= 2,
        selected: current === 'knight',
        requiredLevel: 2,
        avatarUrl: '/assets/hero/sau_upgrade/hero_upgrade_idle.png'
      }
    ];
  }
}
