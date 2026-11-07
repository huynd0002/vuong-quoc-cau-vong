import sauActionUrl from '../../../assets/hero/sau/sau_action.webp?url';
import heroUpgradeActionUrl from '../../../assets/hero/sau_upgrade/hero_upgrade_action.webp?url';
import petDogUrl from '../../../assets/pets/dog/dog_idle.png?url';
import { saveAdapter } from '../../services/save/saveAdapter.js';

/**
 * MapLoadingOverlay (Màn Hình Loading Chuyển Maps Thần Kỳ Cho Bé)
 * - Thiết kế phong cách Chibi mầm non, màu sắc Cầu Vồng tươi vui, ấm áp
 * - Bé Sâu tung tăng bước đi cùng bạn Bé Cún
 * - Hiển thị tên vùng đất chuẩn bị đến với icon sinh động
 * - Lời dặn dò, động viên ngọt ngào và thanh tiến trình Candy Rainbow 3D
 * - Hiệu ứng chuyển cảnh mượt mà không gây giật màn hình
 */
export class MapLoadingOverlay {
  constructor(options = {}) {
    this.audioService = options.audioService;
    this.hudController = options.hudController;
    this.isLoading = false;

    this.overlay = null;
    this.mascotImg = null;
    this.titleEl = null;
    this.tipEl = null;
    this.progressBar = null;
    this.percentEl = null;

    this.tips = [
      '🎒 Bé Sâu đang chuẩn bị ba lô thần kỳ để cùng bé khám phá!',
      '🌈 Mỗi câu đố giải đúng sẽ thắp sáng một ngôi sao lấp lánh!',
      '🌸 Hãy lắng nghe thật kỹ để tìm ra những người bạn nhỏ nhé!',
      '⭐ Lòng tốt và trí thông minh sẽ giúp bé vượt qua mọi thử thách!',
      '🌊 Vùng đất mới có biết bao nhiêu điều kỳ thú đang chờ bé đó!',
      '🏡 Cùng đến Nông Trại để chăm sóc và chơi đùa với Bé Cún nhé! 🦴'
    ];

    this.mapIcons = {
      map1: '🌾',
      map2: '🌊',
      map3: '💎',
      map4: '🍭',
      map5: '❄️',
      map6: '🐉',
      map_pet_farm: '🏡'
    };

    this.initDOM();
  }

  getMascotSrc() {
    try {
      const state = saveAdapter.load();
      if (state?.player?.selectedSkin === 'knight') {
        return heroUpgradeActionUrl;
      }
    } catch {
      // fallback
    }
    return sauActionUrl;
  }

  initDOM() {
    // Hoàn toàn không tạo DOM loading phía sau theo yêu cầu người dùng:
    // "Chỉ giữ lại loading phía trước , phía sau xoá không cần"
    const existing = document.getElementById('map-loading-overlay');
    if (existing) {
      existing.remove();
    }
    this.overlay = null;
  }

  /**
   * Hiển thị màn hình Loading chuyển map mượt mà
   * Yêu cầu: "Chỉ giữ lại loading phía trước , phía sau xoá không cần"
   * Vô hiệu hóa loading phía sau, chuyển scene trực tiếp cho màn hình 8 bước phía trước dẫn dắt
   */
  show({ targetMapId = 'map2', targetMapName = 'Vịnh Biển Pha Lê', onSwitch, onComplete }) {
    if (typeof onSwitch === 'function') {
      onSwitch();
    }
    if (typeof onComplete === 'function') {
      onComplete();
    }
  }

  setProgress(percent, statusText) {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    if (this.progressBar) {
      this.progressBar.style.width = `${clamped}%`;
    }
    if (this.percentEl) {
      this.percentEl.textContent = `${clamped}%`;
    }
    if (this.statusTextEl && statusText) {
      this.statusTextEl.textContent = statusText;
    }
  }
}
