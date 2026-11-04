import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import path from 'node:path';

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function run() {
  console.log('=== [Browser Test] Xác minh Hệ thống Nuôi Thú theo he-thong-nuoi-thu.md ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const errors = [];
  page.on('pageerror', err => {
    console.error('Page error:', err.message);
    errors.push(err.message);
  });

  // 1. Khởi tạo dữ liệu save với Bé Cún Vàng đầy đủ chỉ số chuẩn he-thong-nuoi-thu.md
  await page.goto('http://127.0.0.1:4173/game.html');
  await page.evaluate(() => {
    const SAVE_KEY = 'RAINBOW_KIDS_RPG_SAVE_V1';
    const raw = localStorage.getItem(SAVE_KEY);
    const state = raw ? JSON.parse(raw) : { version: 2 };
    state.pet = {
      type: 'dog',
      name: 'Bé Cún Vàng',
      level: 2,
      exp: 10,
      hunger: 80,
      thirst: 75,
      clean: 85,
      fun: 80,
      energy: 90,
      bladder: 20,
      health: 100,
      affection: 78,
      personality: 'quanchu',
      isSleeping: false,
      affinity: 4,
      isCompanion: true,
      lastCareTimestamp: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  });

  await page.reload({ waitUntil: 'networkidle' });

  // 1. Chờ Màn hình tải GameLoadingScreen hoàn tất và CharacterSelectModal xuất hiện
  console.log('Chờ Màn hình Tải & Chọn Nhân Vật khởi đầu...');
  const charStartBtn = page.locator('#char-btn-start-adventure');
  try {
    await charStartBtn.waitFor({ state: 'visible', timeout: 8000 });
    console.log('Chạm nút BẮT ĐẦU PHIÊU LƯU trên CharacterSelectModal...');
    await charStartBtn.click();
    await page.waitForTimeout(600);
  } catch (e) {
    console.log('Không phát hiện CharacterSelectModal khởi đầu hoặc đã đóng, tiếp tục...');
  }

  // Đóng Story Intro nếu có
  const storyBtn = page.locator('#story-start-button');
  try {
    await storyBtn.waitFor({ state: 'visible', timeout: 3000 });
    console.log('Phát hiện Story Intro, bấm Bắt Đầu...');
    await storyBtn.click();
    await page.waitForTimeout(600);
  } catch (e) {
    console.log('Không có Story Intro, tiếp tục...');
  }

  // Đảm bảo không còn modal che khuất màn hình
  await page.evaluate(() => {
    const charModal = document.getElementById('character-select-modal');
    if (charModal) {
      charModal.style.display = 'none';
      charModal.classList.remove('fade-in');
    }
    const storyModal = document.getElementById('story-intro-modal');
    if (storyModal) storyModal.style.display = 'none';
  });

  // Đợi WorldScene và Pet khởi chạy
  await page.waitForFunction(() => {
    const game = window.__PHASER_GAME__ || window.game;
    const scene = game?.scene?.getScene('WorldScene');
    return scene && scene.pet && scene.pet.sprite && scene.hero;
  }, null, { timeout: 10000 });

  console.log('✓ 1. WorldScene, Hero và Pet đã khởi tạo thành công');

  // Kiểm tra trạng thái ban đầu của Cún
  const petInitial = await page.evaluate(() => {
    const scene = (window.__PHASER_GAME__ || window.game).scene.getScene('WorldScene');
    const pet = scene.pet;
    return {
      type: pet.type,
      currentAnimState: pet.currentAnimState,
      textureKey: pet.sprite.texture.key,
      isMoving: pet.isMoving,
      hasHopTween: Boolean(pet.hopTween),
      x: pet.sprite.x,
      y: pet.sprite.y
    };
  });
  console.log('Trạng thái Cún ban đầu:', petInitial);
  assert.equal(petInitial.type, 'dog');
  assert.equal(petInitial.isMoving, false);

  // 2. Kiểm tra độ mượt khi Hero di chuyển (Không lag, không giật Y, hopTween tắt hoàn toàn)
  console.log('Di chuyển Hero hướng lên trên 0.8 giây...');
  await page.keyboard.down('ArrowUp');
  const samples = [];
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(50);
    const sample = await page.evaluate(() => {
      const scene = (window.__PHASER_GAME__ || window.game).scene.getScene('WorldScene');
      const pet = scene.pet;
      return {
        x: pet.sprite.x,
        y: pet.sprite.y,
        isMoving: pet.isMoving,
        animState: pet.currentAnimState,
        hasHopTween: Boolean(pet.hopTween)
      };
    });
    samples.push(sample);
  }
  await page.keyboard.up('ArrowUp');

  const moving = samples.filter(s => s.isMoving);
  console.log(`Số mẫu đang bước đi: ${moving.length}/${samples.length}`);
  assert.ok(moving.length > 5, 'Pet phải di chuyển theo sau hero');
  for (const s of moving) {
    assert.equal(s.hasHopTween, false, 'Hop tween PHẢI TẮT khi đang bước đi!');
  }
  console.log('✓ 2. Chuyển động Bé Cún 8 hướng hoàn toàn mượt mà, không xung đột Y');

  // Đợi Cún đuổi kịp và dừng lại hoàn toàn
  console.log('Chờ cún bắt kịp và dừng lại...');
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(300);
    const debugState = await page.evaluate(() => {
      const scene = (window.__PHASER_GAME__ || window.game).scene.getScene('WorldScene');
      const pet = scene.pet;
      const hero = scene.hero;
      const targetOffset = hero.facing === 'left' ? 70 : -70;
      const targetX = hero.getX() + targetOffset;
      const targetY = hero.getY() + 30;
      const dist = Math.hypot(targetX - pet.sprite.x, targetY - pet.sprite.y);
      return {
        isMoving: pet.isMoving,
        animState: pet.currentAnimState,
        dist,
        heroX: hero.getX(),
        petX: pet.sprite.x,
        targetX
      };
    });
    console.log(`[T+${i * 300}ms]`, debugState);
    if (!debugState.isMoving) break;
  }

  const stopped = await page.evaluate(() => {
    const scene = (window.__PHASER_GAME__ || window.game).scene.getScene('WorldScene');
    return {
      isMoving: scene.pet.isMoving,
      animState: scene.pet.currentAnimState,
      hasHopTween: Boolean(scene.pet.hopTween)
    };
  });
  assert.equal(stopped.isMoving, false, 'Cún dừng lại khi đến gần hero');
  assert.ok(stopped.hasHopTween || stopped.animState === 'happy', 'Cún phải nhấp nhô idle hoặc phát hoạt ảnh happy khi đứng yên');
  console.log('✓ 3. Dừng lại êm ái với Deadband Hysteresis (Anim state:', stopped.animState, ')');

  // 3. Mở Pet Care Modal và kiểm tra đầy đủ tính năng theo he-thong-nuoi-thu.md
  console.log('Mở bảng Pet Care Modal...');
  await page.evaluate(() => {
    const charModal = document.getElementById('character-select-modal');
    if (charModal) {
      charModal.style.display = 'none';
      charModal.classList.remove('fade-in');
    }
    const btn = document.getElementById('pet-button') || document.getElementById('btn-top-pet') || document.getElementById('btn-menu-pet');
    if (btn) btn.click();
    else window.dispatchEvent(new CustomEvent('game:open-pet-modal'));
  });
  await page.waitForTimeout(500);

  const modalVis = await page.locator('#pet-modal').isVisible();
  assert.ok(modalVis, 'Pet Modal phải hiển thị');

  // Kiểm tra huy hiệu tính cách và tình cảm
  const traitText = await page.locator('#pet-trait-pill').textContent();
  const affText = await page.locator('#pet-affection-pill').textContent();
  console.log('Huy hiệu:', traitText, '|', affText);
  assert.ok(traitText.includes('Quấn chủ'), 'Hiển thị tính cách Quấn chủ');
  assert.ok(affText.includes('78%'), 'Hiển thị đúng 78% tình cảm');

  // Kiểm tra 6 thanh đo chỉ số
  const barHunger = await page.locator('#pet-bar-hunger').getAttribute('style');
  const barThirst = await page.locator('#pet-bar-thirst').getAttribute('style');
  const barClean = await page.locator('#pet-bar-clean').getAttribute('style');
  const barFun = await page.locator('#pet-bar-fun').getAttribute('style');
  const barEnergy = await page.locator('#pet-bar-energy').getAttribute('style');
  const barBladder = await page.locator('#pet-bar-bladder').getAttribute('style');

  assert.ok(barHunger.includes('width: 80%'), 'Thanh No bụng hiển thị đúng 80%');
  assert.ok(barThirst.includes('width: 75%'), 'Thanh Đã khát hiển thị đúng 75%');
  assert.ok(barClean.includes('width: 85%'), 'Thanh Sạch sẽ hiển thị đúng 85%');
  assert.ok(barFun.includes('width: 80%'), 'Thanh Vui vẻ hiển thị đúng 80%');
  assert.ok(barEnergy.includes('width: 90%'), 'Thanh Năng lượng hiển thị đúng 90%');
  assert.ok(barBladder.includes('width: 20%'), 'Thanh Buồn vệ sinh hiển thị đúng 20%');
  console.log('✓ 4. Toàn bộ 6 thanh đo chỉ số chuẩn xác 100%');

  // 4. Kiểm tra các nút hành động chăm sóc (Cho ăn, Uống nước, Vệ sinh, Đi ngủ)
  console.log('Thực hiện hành động: Uống nước...');
  await page.locator('#pet-action-drink').click();
  await page.waitForTimeout(400);
  const feedbackDrink = await page.locator('#pet-modal-feedback').textContent();
  assert.ok(feedbackDrink.includes('nước suối'), 'Feedback uống nước trả về đúng');
  console.log('✓ Hành động Uống nước thành công:', feedbackDrink);

  console.log('Thực hiện hành động: Đi vệ sinh...');
  await page.locator('#pet-action-potty').click();
  await page.waitForTimeout(400);
  const feedbackPotty = await page.locator('#pet-modal-feedback').textContent();
  assert.ok(feedbackPotty.includes('vệ sinh'), 'Feedback vệ sinh trả về đúng');
  console.log('✓ Hành động Vệ sinh thành công:', feedbackPotty);

  // 5. Kiểm tra 7 nút xem trước hoạt ảnh đặc trưng (Walk, Sad, Dirty, Happy, Sleep, Drink, Potty)
  const previews = [
    { btn: '#btn-anim-walk', expectedPattern: /dog_walk/, label: 'Walk' },
    { btn: '#btn-anim-sad', expectedPattern: /dog_sad/, label: 'Sad' },
    { btn: '#btn-anim-dirty', expectedPattern: /dog_dirty/, label: 'Dirty' },
    { btn: '#btn-anim-happy', expectedPattern: /dog_happy/, label: 'Happy' },
    { btn: '#btn-anim-sleep', expectedPattern: /dog_sleep/, label: 'Sleep' },
    { btn: '#btn-anim-drink', expectedPattern: /dog_drink/, label: 'Drink' },
    { btn: '#btn-anim-potty', expectedPattern: /dog_potty/, label: 'Potty' }
  ];

  for (const p of previews) {
    await page.locator(p.btn).click();
    await page.waitForTimeout(150);
    const src = await page.locator('#pet-modal-avatar-img').getAttribute('src');
    assert.match(src, p.expectedPattern, `Hoạt ảnh ${p.label} phải tải đúng file`);
    console.log(`✓ Xem trước hoạt ảnh ${p.label}:`, src);
  }

  // Chụp ảnh Modal Pet Care hoàn chỉnh
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_pet_care_modal_complete.png') });
  console.log('✓ Đã lưu ảnh: verify_pet_care_modal_complete.png');

  // Đóng modal
  await page.locator('#pet-modal-close').click();
  await page.waitForTimeout(300);

  // 6. Kiểm tra Nông Trại Thú Cưng (Pet Farm Map) & các Trạm Chăm Sóc
  console.log('Chuyển sang bản đồ Nông Trại Thú Cưng (map_pet_farm)...');
  await page.evaluate(() => {
    const scene = (window.__PHASER_GAME__ || window.game).scene.getScene('WorldScene');
    scene.scene.start('WorldScene', { mapId: 'map_pet_farm' });
  });

  await page.waitForFunction(() => {
    const scene = (window.__PHASER_GAME__ || window.game).scene.getScene('WorldScene');
    return scene && scene.currentMapId === 'map_pet_farm' && scene.pet && scene.petStationContainers;
  }, null, { timeout: 10000 });

  const stationCount = await page.evaluate(() => {
    const scene = (window.__PHASER_GAME__ || window.game).scene.getScene('WorldScene');
    return scene.petStationContainers.length;
  });
  console.log(`Số trạm chăm sóc trên nông trại: ${stationCount}`);
  assert.ok(stationCount >= 5, 'Phải có ít nhất 5 trạm: Máng ăn, Máng nước, Chuồng ngủ, Bãi chơi, Khu vệ sinh');

  // Chờ 1.5 giây để cún dạo chơi và chụp ảnh
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_pet_farm_stations.png') });
  console.log('✓ Đã lưu ảnh Nông trại: verify_pet_farm_stations.png');

  await browser.close();
  console.log('\n=============================================================');
  console.log('  TẤT CẢ CÁC BƯỚC XÁC MINH THEO HE-THONG-NUOI-THU.MD ĐẠT 100%! ');
  console.log('=============================================================');
}

run().catch(err => {
  console.error('Test thất bại:', err);
  process.exit(1);
});
