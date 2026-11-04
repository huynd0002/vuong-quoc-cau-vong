/**
 * HUD Controller
 * Cập nhật thông tin giao diện người dùng:
 * - Avatar, Tên nhân vật bé đặt và Cấp độ nhân vật (Hero Level & Name)
 * - Số lượng Sao Cầu Vồng tích lũy
 * - Nhiệm vụ hiện tại và Tiến trình bản đồ
 * - Độ thân thiết với Thú cưng
 */

export class HudController {
  constructor(options = {}) {
    this.progressionSystem = options.progressionSystem;
    this.petSystem = options.petSystem;

    this.elements = {
      loadStatus: document.getElementById('load-status'),
      soundToggle: document.getElementById('sound-toggle'),
      questCopy: document.getElementById('quest-copy'),
      progressCopy: document.getElementById('progress-copy'),
      heroName: document.getElementById('hero-name'),
      heroLevel: document.getElementById('hero-level'),
      heroAvatar: document.getElementById('topbar-hero-avatar'),
      heroStars: document.getElementById('hero-stars'),
      petAffinity: document.getElementById('pet-affinity')
    };

    this.initEventListeners();
  }

  initEventListeners() {
    // Lắng nghe sự kiện đổi skin để cập nhật Avatar ngay lập tức
    window.addEventListener('hero:skin-changed', (e) => {
      const { skin, avatarUrl, name } = e.detail || {};
      if (this.elements.heroAvatar) {
        if (avatarUrl) {
          this.elements.heroAvatar.src = avatarUrl;
        } else {
          this.elements.heroAvatar.src = skin === 'knight'
            ? '/assets/hero/sau_upgrade/hero_upgrade_idle.png'
            : '/assets/hero/sau/hero_idle.png';
        }
        this.elements.heroAvatar.alt = skin === 'knight' ? 'Bé Sam Kuromi' : 'Bé Sâu';
      }
      if (name && this.elements.heroName) {
        this.elements.heroName.textContent = name;
      }
    });

    // Lắng nghe sự kiện đổi profile để cập nhật toàn diện
    window.addEventListener('hero:profile-changed', () => {
      this.updatePlayerHud();
    });
  }

  setStatus(text) {
    if (this.elements.loadStatus) {
      this.elements.loadStatus.textContent = text;
    }
  }

  setQuest(title, desc = '') {
    if (this.elements.questCopy) {
      if (desc) {
        this.elements.questCopy.innerHTML = `<strong>${title}</strong>: ${desc}`;
      } else {
        this.elements.questCopy.textContent = title;
      }
    }
  }

  setProgress(text) {
    if (this.elements.progressCopy) {
      this.elements.progressCopy.textContent = text;
    }
  }

  setStars(stars) {
    if (this.elements.heroStars) {
      this.elements.heroStars.innerHTML = `<img src="/assets/ui/custom_kids_ui/icon_star_3d.png" class="stat-icon" alt="⭐"> <span>${stars}</span>`;
    }
  }

  updatePlayerHud() {
    if (!this.progressionSystem) return;
    const player = this.progressionSystem.getPlayer();
    if (this.elements.heroName) {
      const displayName = player.name || (player.selectedSkin === 'knight' ? 'Bé Sam' : 'Bé Sâu');
      this.elements.heroName.textContent = displayName;
    }
    if (this.elements.heroLevel) {
      this.elements.heroLevel.textContent = `Lv.${player.level}`;
    }
    if (this.elements.heroStars) {
      this.setStars(player.stars);
    }
    if (this.elements.heroAvatar) {
      const isKnight = player.selectedSkin === 'knight';
      this.elements.heroAvatar.src = isKnight
        ? '/assets/hero/sau_upgrade/hero_upgrade_idle.png'
        : '/assets/hero/sau/hero_idle.png';
      this.elements.heroAvatar.alt = isKnight ? 'Bé Sam Kuromi' : 'Bé Sâu';
    }
  }
}
