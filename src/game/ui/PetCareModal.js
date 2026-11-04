import dogWalkWebp from '../../../assets/pets/dog/dog_walk.webp?url';
import dogSadWebp from '../../../assets/pets/dog/dog_sad.webp?url';
import dogDirtyWebp from '../../../assets/pets/dog/dog_dirty.webp?url';
import dogHappyWebp from '../../../assets/pets/dog/dog_happy.webp?url';
import dogSleepWebp from '../../../assets/pets/dog/dog_sleep.webp?url';
import dogDrinkWebp from '../../../assets/pets/dog/dog_drink.webp?url';
import dogPottyWebp from '../../../assets/pets/dog/dog_potty.webp?url';
import dogBathWebp from '../../../assets/pets/dog/dog_bath.webp?url';
import bunnyIdlePng from '../../../assets/pets/pet_bunny_idle.png?url';

/**
 * Pet Care Modal Controller - Chuẩn hóa 100% theo he-thong-nuoi-thu.md
 * Hỗ trợ:
 * - 6 thanh đo trực quan: Độ no, Độ khát, Sạch sẽ, Vui vẻ, Năng lượng, Buồn vệ sinh
 * - Huy hiệu Tính cách & Tình cảm
 * - 8 Hoạt động Chăm sóc: Cho ăn, Uống nước, Tắm sạch, Chải lông, Xoa đầu, Chơi đùa, Đi vệ sinh, Đi ngủ
 * - 7 Hoạt ảnh xem trước: Đi bộ 8 hướng, Buồn chán ăn, Ở dơ lấm lem, Vui mừng rỡ, Ngủ mơ êm, Uống nước, Đi vệ sinh
 */

export class PetCareModal {
  constructor(options = {}) {
    this.petSystem = options.petSystem;
    this.audioService = options.audioService;
    this.saveAdapter = options.saveAdapter;
    this.onVisitFarm = options.onVisitFarm;
    this.onClose = options.onClose;

    this.modal = document.getElementById('pet-modal');
    this.nameTag = document.getElementById('pet-modal-name');
    this.statsCopy = document.getElementById('pet-stats-copy');
    this.feedback = document.getElementById('pet-modal-feedback');
    this.closeBtn = document.getElementById('pet-modal-close');

    this.avatarImg = document.getElementById('pet-modal-avatar-img');
    this.badgeStatus = document.getElementById('pet-badge-status');
    this.traitPill = document.getElementById('pet-trait-pill');
    this.affectionPill = document.getElementById('pet-affection-pill');
    this.expPill = document.getElementById('pet-exp-pill');
    this.barExp = document.getElementById('pet-bar-exp');
    this.expText = document.getElementById('pet-exp-text');
    this.levelDesc = document.getElementById('pet-level-desc');

    // 6 thanh đo chỉ số
    this.barHunger = document.getElementById('pet-bar-hunger');
    this.barThirst = document.getElementById('pet-bar-thirst');
    this.barClean = document.getElementById('pet-bar-clean');
    this.barFun = document.getElementById('pet-bar-fun');
    this.barEnergy = document.getElementById('pet-bar-energy');
    this.barBladder = document.getElementById('pet-bar-bladder');

    this.btnCompanionToggle = document.getElementById('pet-modal-companion-btn');
    this.iconCompanionToggle = document.getElementById('pet-modal-companion-icon');
    this.textCompanionToggle = document.getElementById('pet-modal-companion-text');

    // Tab chuyển đổi
    this.tabDog = document.getElementById('btn-select-pet-dog');
    this.tabBunny = document.getElementById('btn-select-pet-bunny');

    // 8 nút hoạt động chăm sóc
    this.btnFeed = document.getElementById('pet-action-feed');
    this.btnDrink = document.getElementById('pet-action-drink');
    this.btnBathe = document.getElementById('pet-action-bathe');
    this.btnGroom = document.getElementById('pet-action-groom');
    this.btnPet = document.getElementById('pet-action-pet');
    this.btnPlay = document.getElementById('pet-action-play');
    this.btnPotty = document.getElementById('pet-action-potty');
    this.btnSleep = document.getElementById('pet-action-sleep');
    this.btnVisitFarm = document.getElementById('pet-action-visit-farm');

    // 7 nút xem trước hoạt ảnh đặc trưng của cún
    this.btnAnimWalk = document.getElementById('btn-anim-walk');
    this.btnAnimSad = document.getElementById('btn-anim-sad');
    this.btnAnimDirty = document.getElementById('btn-anim-dirty');
    this.btnAnimHappy = document.getElementById('btn-anim-happy');
    this.btnAnimSleep = document.getElementById('btn-anim-sleep');
    this.btnAnimDrink = document.getElementById('btn-anim-drink');
    this.btnAnimPotty = document.getElementById('btn-anim-potty');
    this.btnAnimBathe = document.getElementById('btn-anim-bathe');

    this.currentAnimPreview = 'happy';

    this.initEventListeners();
  }

  initEventListeners() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.tabDog) {
      this.tabDog.addEventListener('click', () => this.switchPetType('dog'));
    }
    if (this.tabBunny) {
      this.tabBunny.addEventListener('click', () => this.switchPetType('bunny'));
    }

    // Gắn sự kiện cho các hành động chăm sóc
    if (this.btnFeed) this.btnFeed.addEventListener('click', () => this.handleAction('feed'));
    if (this.btnDrink) this.btnDrink.addEventListener('click', () => this.handleAction('drink'));
    if (this.btnBathe) this.btnBathe.addEventListener('click', () => this.handleAction('bathe'));
    if (this.btnGroom) this.btnGroom.addEventListener('click', () => this.handleAction('groom'));
    if (this.btnPet) this.btnPet.addEventListener('click', () => this.handleAction('petHead'));
    if (this.avatarImg) {
      this.avatarImg.style.cursor = 'pointer';
      this.avatarImg.title = 'Vuốt ve chạm cún (+1% Vui vẻ)';
      this.avatarImg.addEventListener('click', () => {
        if (!this.petSystem) return;
        this.petSystem.petTouch();
        if (this.saveAdapter) {
          const state = this.saveAdapter.load();
          state.pet = this.petSystem.getPet();
          this.saveAdapter.save(state);
        }
        this.updateDisplay('Bé vuốt ve Cún con thật dịu dàng! (+1% Vui vẻ 💖)');
        if (this.audioService) this.audioService.playChime(740, 0.12);
        window.dispatchEvent(new CustomEvent('game:pet-updated', { detail: this.petSystem.getPet() }));
      });
    }
    if (this.btnPlay) this.btnPlay.addEventListener('click', () => this.handleAction('play'));
    if (this.btnPotty) this.btnPotty.addEventListener('click', () => this.handleAction('potty'));
    if (this.btnSleep) this.btnSleep.addEventListener('click', () => this.handleAction('sleep'));

    if (this.btnCompanionToggle) {
      this.btnCompanionToggle.addEventListener('click', () => {
        this.toggleCompanion();
      });
    }

    if (this.btnVisitFarm) {
      this.btnVisitFarm.addEventListener('click', () => {
        this.close();
        if (typeof this.onVisitFarm === 'function') {
          this.onVisitFarm();
        }
      });
    }

    // Gắn sự kiện chuyển đổi xem trước hoạt ảnh cún
    if (this.btnAnimWalk) this.btnAnimWalk.addEventListener('click', () => this.previewPuppyAnim('walk'));
    if (this.btnAnimSad) this.btnAnimSad.addEventListener('click', () => this.previewPuppyAnim('sad'));
    if (this.btnAnimDirty) this.btnAnimDirty.addEventListener('click', () => this.previewPuppyAnim('dirty'));
    if (this.btnAnimHappy) this.btnAnimHappy.addEventListener('click', () => this.previewPuppyAnim('happy'));
    if (this.btnAnimSleep) this.btnAnimSleep.addEventListener('click', () => this.previewPuppyAnim('sleep'));
    if (this.btnAnimDrink) this.btnAnimDrink.addEventListener('click', () => this.previewPuppyAnim('drink'));
    if (this.btnAnimPotty) this.btnAnimPotty.addEventListener('click', () => this.previewPuppyAnim('potty'));
    if (this.btnAnimBathe) this.btnAnimBathe.addEventListener('click', () => this.previewPuppyAnim('bathe'));
  }

  show() {
    if (!this.modal || !this.petSystem) return;
    const encounterModal = document.getElementById('encounter-prompt-modal');
    if (encounterModal) encounterModal.hidden = true;
    if (window.__worldScene) {
      const scene = window.__worldScene;
      if (this.modal.hidden) {
        this.sceneBeforeOpen = scene;
        this.wasExploring = scene.isExploring;
        this.wasInputEnabled = scene.input.enabled;
      }
      scene.isExploring = false;
      scene.input.enabled = false;
      scene.hero?.stop();
    }
    this.modal.hidden = false;
    this.updateDisplay();

    const pet = this.petSystem.getPet();
    const petName = pet.name || (pet.type === 'bunny' ? 'Thỏ Bông' : 'Bé Cún Vàng');

    if (this.audioService) {
      this.audioService.playChime(620, 0.12);
      this.audioService.speak(`${petName} chào bé! Bé muốn chăm sóc bạn thế nào nè?`);
    }
  }

  switchPetType(type) {
    const pet = this.petSystem.getPet();
    pet.type = type;
    if (type === 'dog') {
      pet.name = 'Bé Cún Vàng';
    } else {
      pet.name = 'Thỏ Bông';
    }

    if (this.tabDog && this.tabBunny) {
      this.tabDog.classList.toggle('active', type === 'dog');
      this.tabBunny.classList.toggle('active', type === 'bunny');
    }

    if (this.saveAdapter) {
      const state = this.saveAdapter.load();
      state.pet = pet;
      this.saveAdapter.save(state);
    }

    const switchMsg = type === 'dog'
      ? 'Bé đã chọn Bé Cún Vàng làm bạn đồng hành! Gâu gâu! 🐶'
      : 'Bé đã chọn Thỏ Bông làm bạn đồng hành! 🐰';

    this.updateDisplay(switchMsg);

    if (this.audioService) {
      this.audioService.playChime(750, 0.15);
      this.audioService.speak(switchMsg);
    }

    window.dispatchEvent(new CustomEvent('game:pet-updated', { detail: { pet, message: switchMsg } }));
  }

  previewPuppyAnim(animName) {
    this.currentAnimPreview = animName;
    const btns = [
      { key: 'walk', el: this.btnAnimWalk },
      { key: 'sad', el: this.btnAnimSad },
      { key: 'dirty', el: this.btnAnimDirty },
      { key: 'happy', el: this.btnAnimHappy },
      { key: 'sleep', el: this.btnAnimSleep },
      { key: 'drink', el: this.btnAnimDrink },
      { key: 'potty', el: this.btnAnimPotty },
      { key: 'bathe', el: this.btnAnimBathe }
    ];
    btns.forEach(b => {
      if (b.el) b.el.classList.toggle('active', b.key === animName);
    });

    let webpSrc = dogHappyWebp;
    let badgeText = 'Vui vẻ ✨';
    let msg = '';

    if (animName === 'walk') {
      webpSrc = dogWalkWebp;
      badgeText = 'Đi dạo 8 hướng 🐾';
      msg = 'Bé Cún tung tăng bước đi 8 hướng, lon ton theo bé khám phá thế giới!';
    } else if (animName === 'sad') {
      webpSrc = dogSadWebp;
      badgeText = 'Buồn chán ăn 😢';
      msg = 'Bé Cún đói bụng ôm bụng thở dài buồn thiu, bé cho cún ăn cà rốt nha!';
    } else if (animName === 'dirty') {
      webpSrc = dogDirtyWebp;
      badgeText = 'Ở dơ lấm lem 🧼';
      msg = 'Bé Cún nghịch bùn lấm lem rũ lông xù, bé đưa cún đi tắm suối cho sạch nhé!';
    } else if (animName === 'happy') {
      webpSrc = dogHappyWebp;
      badgeText = 'Vui mừng rỡ 🎉';
      msg = 'Bé Cún mừng rỡ nhảy cẫng lên, ngoe nguẩy đuôi hoa sao lấp lánh!';
    } else if (animName === 'sleep') {
      webpSrc = dogSleepWebp;
      badgeText = 'Ngủ mơ êm 🌙';
      msg = 'Bé Cún cuộn tròn trên đệm êm ngủ ngon lành, thở khò khè đáng yêu!';
    } else if (animName === 'drink') {
      webpSrc = dogDrinkWebp;
      badgeText = 'Uống nước mát 💧';
      msg = 'Bé Cún cúi đầu uống dòng nước suối trong lành ngọt mát, đã khát thật đã!';
    } else if (animName === 'potty') {
      webpSrc = dogPottyWebp;
      badgeText = 'Đi vệ sinh 🚽';
      msg = 'Bé Cún đi vệ sinh ngoài trời sạch sẽ, ngoan ngoãn được khen thưởng!';
    } else if (animName === 'bathe') {
      webpSrc = dogBathWebp;
      badgeText = 'Tắm mát bọt xà phòng 🧼';
      msg = 'Bé Cún thích mê ngâm mình trong bồn nước ấm, rửa mặt bọt xà phòng và đùa nghịch cùng vịt vàng!';
    }

    if (this.avatarImg) {
      this.avatarImg.src = webpSrc;
      this.avatarImg.classList.add('pop-anim');
      setTimeout(() => this.avatarImg?.classList.remove('pop-anim'), 300);
    }

    if (this.badgeStatus) {
      this.badgeStatus.textContent = badgeText;
    }

    if (this.feedback) {
      this.feedback.textContent = msg;
    }

    if (this.audioService) {
      this.audioService.playChime(680, 0.12);
      this.audioService.speak(msg);
    }
  }

  updateDisplay(feedbackMessage) {
    if (!this.petSystem) return;
    const pet = this.petSystem.getPet();
    const petType = pet.type || 'dog';
    const petName = pet.name || (petType === 'bunny' ? 'Thỏ Bông' : 'Bé Cún Vàng');

    // Cập nhật tab
    if (this.tabDog && this.tabBunny) {
      this.tabDog.classList.toggle('active', petType === 'dog');
      this.tabBunny.classList.toggle('active', petType === 'bunny');
    }

    // Cập nhật tên và cấp độ
    const tier = this.petSystem.getAffectionTier ? this.petSystem.getAffectionTier() : { label: 'Thân thiện' };
    if (this.nameTag) {
      this.nameTag.textContent = `${petName} · Cấp ${pet.level} (${'💖'.repeat(pet.affinity || 1)})`;
    }

    // Huy hiệu tính cách & tình cảm
    if (this.traitPill) {
      const traitNames = {
        quanchu: 'Quấn chủ 🐶',
        doclap: 'Độc lập 🐾',
        nangdong: 'Năng động ⚡',
        diemtinh: 'Điềm tĩnh 🌿',
        nhutnhat: 'Nhút nhát 🌸',
        thichnuoc: 'Thích nước 💧',
        sonuoc: 'Sợ nước 🧼'
      };
      this.traitPill.textContent = traitNames[pet.personality] || 'Quấn chủ 🐶';
    }

    if (this.affectionPill) {
      this.affectionPill.textContent = `Tình cảm: ${Math.round(pet.affection || 10)}% (${tier.label})`;
    }

    if (this.statsCopy) {
      this.statsCopy.textContent = `No: ${Math.round(pet.hunger)}% · Khát: ${Math.round(pet.thirst ?? 100)}% · Sạch: ${Math.round(pet.clean)}% · Vui: ${Math.round(pet.fun ?? 80)}%`;
    }

    // Cập nhật 6 thanh đo
    if (this.barHunger) this.barHunger.style.width = `${Math.min(100, Math.max(5, pet.hunger))}%`;
    if (this.barThirst) this.barThirst.style.width = `${Math.min(100, Math.max(5, pet.thirst ?? 100))}%`;
    if (this.barClean) this.barClean.style.width = `${Math.min(100, Math.max(5, pet.clean))}%`;
    if (this.barFun) this.barFun.style.width = `${Math.min(100, Math.max(5, pet.fun ?? 80))}%`;
    if (this.barEnergy) this.barEnergy.style.width = `${Math.min(100, Math.max(5, pet.energy))}%`;
    if (this.barBladder) this.barBladder.style.width = `${Math.min(100, Math.max(0, pet.bladder ?? 0))}%`;

    // Cập nhật Avatar dựa trên trạng thái thực tế
    if (this.avatarImg) {
      if (petType === 'dog') {
        if (pet.isSleeping || pet.energy <= 20) {
          this.avatarImg.src = dogSleepWebp;
          if (this.badgeStatus) this.badgeStatus.textContent = 'Ngủ ngon 🌙';
        } else if (pet.thirst <= 10) {
          this.avatarImg.src = dogDrinkWebp;
          if (this.badgeStatus) this.badgeStatus.textContent = 'Rất khát! 💧';
        } else if (pet.bladder >= 85) {
          this.avatarImg.src = dogPottyWebp;
          if (this.badgeStatus) this.badgeStatus.textContent = 'Cần vệ sinh 🚽';
        } else if (pet.hunger < 50) {
          this.avatarImg.src = dogSadWebp;
          if (this.badgeStatus) this.badgeStatus.textContent = 'Đói bụng 🥕';
        } else if (pet.clean < 50) {
          this.avatarImg.src = dogDirtyWebp;
          if (this.badgeStatus) this.badgeStatus.textContent = 'Ở dơ 🧼';
        } else {
          this.avatarImg.src = dogHappyWebp;
          if (this.badgeStatus) this.badgeStatus.textContent = 'Vui tươi ✨';
        }
      } else {
        this.avatarImg.src = bunnyIdlePng;
        if (this.badgeStatus) this.badgeStatus.textContent = 'Đáng yêu 🌸';
      }
    }

    const topPetName = document.getElementById('pet-name-top');
    if (topPetName) {
      topPetName.textContent = petType === 'dog' ? '🐶 Bé Cún' : '🐰 Thỏ Bông';
    }

    if (this.feedback && feedbackMessage) {
      this.feedback.textContent = feedbackMessage;
    }

    this.updateCompanionButton(Boolean(pet.isCompanion));
  }

  updateCompanionButton(isCompanion) {
    if (!this.btnCompanionToggle) return;
    const accompanying = Boolean(isCompanion);
    this.btnCompanionToggle.classList.toggle('accompanying', accompanying);
    if (this.iconCompanionToggle) {
      this.iconCompanionToggle.textContent = accompanying ? '🏡' : '🐾';
    }
    if (this.textCompanionToggle) {
      this.textCompanionToggle.textContent = accompanying ? 'Cho Cún Ở Lại Nông Trại' : 'Dẫn Cún Đi Cùng';
    }
  }

  toggleCompanion() {
    if (!this.petSystem) return;
    const pet = this.petSystem.getPet();
    const nextCompanion = !Boolean(pet.isCompanion);
    pet.isCompanion = nextCompanion;
    if (this.saveAdapter) {
      const state = this.saveAdapter.load();
      if (!state.pet) state.pet = {};
      state.pet.isCompanion = nextCompanion;
      this.saveAdapter.save(state);
    }
    this.updateCompanionButton(nextCompanion);
    const petName = pet.name || (pet.type === 'bunny' ? 'Thỏ Bông' : 'Bé Cún Vàng');
    const msg = nextCompanion
      ? `🐾 Bé đã rủ ${petName} đi cùng! Cún sẽ đi theo bé qua các bản đồ phiêu lưu! 💖`
      : `🏡 ${petName} sẽ ở lại nông trại vui chơi và trông nhà cho bé nhé! 🐕`;
    this.updateDisplay(msg);
    if (this.audioService) {
      if (nextCompanion) this.audioService.playVictoryChime(880, 0.22);
      else this.audioService.playChime(560, 0.18);
    }
    window.dispatchEvent(new CustomEvent('game:pet-companion-toggled', {
      detail: { isCompanion: nextCompanion, pet }
    }));
    window.dispatchEvent(new CustomEvent('game:pet-updated', {
      detail: { pet }
    }));
  }

  handleAction(actionName) {
    if (!this.petSystem) return;
    const scene = window.__worldScene;
    const stationType = { drink: 'water', bathe: 'bath', potty: 'potty' }[actionName];
    if (stationType && scene?.currentMapId === 'map_pet_farm' && scene.sys?.isActive() &&
        scene.mapConfig?.petStations?.some(s => s.type === stationType || (stationType === 'potty' && s.type === 'toilet'))) {
      // The station awards care once, on completion. Do not grant it again here.
      this.close();
      window.dispatchEvent(new CustomEvent('game:pet-action-requested', { detail: { action: actionName } }));
      return;
    }
    let res;
    let previewReaction = dogHappyWebp;
    let reactionStatus = 'Rất vui! 💖';

    if (actionName === 'feed') {
      res = this.petSystem.feed();
      previewReaction = dogHappyWebp;
      reactionStatus = 'No bụng 🥕';
    } else if (actionName === 'drink') {
      res = this.petSystem.drink ? this.petSystem.drink() : this.petSystem.feed();
      previewReaction = dogDrinkWebp;
      reactionStatus = 'Đã khát 💧';
      window.dispatchEvent(new CustomEvent('game:pet-action-requested', {
        detail: { action: 'drink' }
      }));
    } else if (actionName === 'bathe') {
      res = this.petSystem.bathe();
      previewReaction = dogBathWebp;
      reactionStatus = 'Tắm mát 🧼';
      window.dispatchEvent(new CustomEvent('game:pet-action-requested', {
        detail: { action: 'bathe' }
      }));
    } else if (actionName === 'groom') {
      res = this.petSystem.groom ? this.petSystem.groom() : this.petSystem.bathe();
      previewReaction = dogHappyWebp;
      reactionStatus = 'Lông mượt ✨';
    } else if (actionName === 'petHead') {
      res = this.petSystem.petHead();
      previewReaction = dogHappyWebp;
      reactionStatus = 'Ấm áp 💖';
    } else if (actionName === 'play') {
      res = this.petSystem.play();
      previewReaction = dogHappyWebp;
      reactionStatus = 'Thích mê 🎈';
    } else if (actionName === 'walk') {
      res = this.petSystem.walk ? this.petSystem.walk() : this.petSystem.play();
      previewReaction = dogWalkWebp;
      reactionStatus = 'Lon ton 🐾';
    } else if (actionName === 'potty') {
      res = this.petSystem.potty ? this.petSystem.potty() : { message: 'Đi vệ sinh sạch sẽ! 🚽' };
      previewReaction = dogPottyWebp;
      reactionStatus = 'Nhẹ nhõm 🚽';
      window.dispatchEvent(new CustomEvent('game:pet-action-requested', {
        detail: { action: 'potty' }
      }));
    } else if (actionName === 'sleep') {
      const isSleeping = !this.petSystem.getPet().isSleeping;
      res = this.petSystem.sleep(isSleeping);
      previewReaction = isSleeping ? dogSleepWebp : dogHappyWebp;
      reactionStatus = isSleeping ? 'Ngủ ngon 🌙' : 'Thức dậy ☀️';
    }

    this.updateDisplay(res.message);

    // Bật hiệu ứng avatar phản ứng sinh động
    const pet = this.petSystem.getPet();
    if (pet.type === 'dog' && this.avatarImg) {
      this.avatarImg.src = previewReaction;
      this.avatarImg.classList.add('pop-anim');
      setTimeout(() => this.avatarImg?.classList.remove('pop-anim'), 350);
      if (this.badgeStatus) this.badgeStatus.textContent = reactionStatus;
    }

    if (this.audioService) {
      this.audioService.playChime(700, 0.14);
      this.audioService.speak(res.message);
    }

    if (this.saveAdapter) {
      const state = this.saveAdapter.load();
      state.pet = this.petSystem.getPet();
      this.saveAdapter.save(state);
    }

    window.dispatchEvent(new CustomEvent('game:pet-updated', { detail: { pet: this.petSystem.getPet(), message: res.message } }));
  }

  close() {
    if (this.modal) {
      this.modal.hidden = true;
    }
    if (this.sceneBeforeOpen === window.__worldScene && this.sceneBeforeOpen?.sys.isActive()) {
      this.sceneBeforeOpen.isExploring = this.wasExploring;
      this.sceneBeforeOpen.input.enabled = this.wasInputEnabled;
    }
    this.sceneBeforeOpen = null;
    if (this.audioService) {
      this.audioService.playInteract();
    }
    if (typeof this.onClose === 'function') {
      this.onClose();
    }
  }
}
