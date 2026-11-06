import { chromium } from 'playwright';
import path from 'path';
import assert from 'node:assert/strict';

const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

(async () => {
  console.log('--- [Test] Kiểm Tra Dịch Chuyển Cổng & Xoá Skill Thêm Cá ---');

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  console.log('Đang tải game: http://localhost:5173/dev.html ...');
  await page.goto('http://localhost:5173/dev.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Đóng modal chọn nhân vật nếu có
  const startBtn = await page.$('.char-start-adventure-cta');
  if (startBtn) {
    await startBtn.click();
    await page.waitForTimeout(1000);
  }

  // Chuyển tới Hồ Câu Lá Sen (map_fishing_pond)
  console.log('Chuyển tới Hồ Câu Lá Sen (map_fishing_pond)...');
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
    window.__worldScene?.scene?.restart?.({ mapId: 'map_fishing_pond' });
  });
  await page.waitForTimeout(2500);

  // 1. Kiểm tra vị trí mới của 2 cổng và trạm Sổ Huy Hiệu
  const pondConfig = await page.evaluate(() => {
    const ws = window.__worldScene;
    const cfg = ws?.mapConfig || {};
    const returnPortal = cfg.returnPortal || {};
    const teleportPortal = cfg.teleportPortal || {};
    const fishBook = (cfg.fishingStations || []).find(s => s.id === 'station_fish_book') || {};
    return {
      returnPortal: { id: returnPortal.id, x: returnPortal.x, y: returnPortal.y },
      teleportPortal: { id: teleportPortal.id, x: teleportPortal.x, y: teleportPortal.y },
      fishBook: { id: fishBook.id, x: fishBook.x, y: fishBook.y, interactionPoint: fishBook.interactionPoint }
    };
  });

  console.log('Cấu hình các trạm & cổng mới:', pondConfig);
  assert.equal(pondConfig.returnPortal.x, 160, 'Cổng Về Nông Trại phải chuyển xuống lối đi lát đá x=160');
  assert.equal(pondConfig.returnPortal.y, 645, 'Cổng Về Nông Trại phải chuyển xuống lối đi lát đá y=645');
  assert.equal(pondConfig.teleportPortal.x, 1140, 'Cổng Chợ Cầu Vồng phải chuyển xuống đường đất x=1140');
  assert.equal(pondConfig.teleportPortal.y, 645, 'Cổng Chợ Cầu Vồng phải chuyển xuống đường đất y=645');
  assert.equal(pondConfig.fishBook.x, 985, 'Sổ Huy Hiệu phải chuyển lên mái hiên nhà x=985');
  assert.equal(pondConfig.fishBook.y, 230, 'Sổ Huy Hiệu phải chuyển lên mái hiên nhà y=230');

  // Chụp ảnh tổng thể bản đồ Hồ Câu với vị trí mới của cổng và huy hiệu
  const fullMapPath = path.join(artifactDir, 'verified_pond_new_portals_and_badge.png');
  await page.screenshot({ path: fullMapPath });
  console.log('✓ Đã lưu ảnh tổng quan bản đồ mới:', fullMapPath);

  // 2. Di chuyển Bé tới bến câu (x=688, y=360)
  console.log('Di chuyển Bé tới bến câu trên cầu gỗ...');
  await page.evaluate(() => {
    window.__worldScene?.hero?.setPosition?.(688, 360);
    window.__worldScene?.updateDockFishingProximityButton?.(688, 360);
  });
  await page.waitForTimeout(1000);

  // 3. Kiểm tra nút tại bến câu: chỉ có "Bắt đầu câu cá", KHÔNG CÒN nút Skill!
  const dockButtons = await page.evaluate(() => {
    const startBtn = document.getElementById('btn-start-fishing-dock');
    const skillBtn = document.getElementById('btn-fishing-skill-dock');
    return {
      startBtnExists: Boolean(startBtn),
      startBtnVisible: startBtn ? window.getComputedStyle(startBtn).display !== 'none' : false,
      startBtnText: startBtn ? startBtn.innerText.trim() : '',
      skillBtnExists: Boolean(skillBtn)
    };
  });

  console.log('Trạng thái nút tại bến câu:', dockButtons);
  assert.equal(dockButtons.startBtnExists, true, 'Nút Bắt đầu câu cá phải tồn tại');
  assert.equal(dockButtons.startBtnVisible, true, 'Nút Bắt đầu câu cá phải hiển thị');
  assert.equal(dockButtons.skillBtnExists, false, 'Nút Dùng Skill câu cá (btn-fishing-skill-dock) PHẢI BỊ XOÁ HOÀN TOÀN');

  // Chụp ảnh cận cảnh bến câu chỉ có nút "Bắt đầu câu cá"
  const dockPath = path.join(artifactDir, 'verified_dock_only_start_button_no_skill.png');
  await page.screenshot({ path: dockPath });
  console.log('✓ Đã lưu ảnh bến câu sạch đẹp không còn nút skill:', dockPath);

  // 4. Bấm bắt đầu câu cá để kiểm tra thanh Audition
  console.log('Bấm Bắt đầu câu cá...');
  await page.evaluate(() => {
    document.getElementById('btn-start-fishing-dock')?.click();
  });
  await page.waitForTimeout(2000);

  // Kiểm tra audition modal: KHÔNG CÒN nút skill trong audition!
  const auditionCheck = await page.evaluate(() => {
    const auditionEl = document.getElementById('onmap-fishing-audition');
    const auditionSkillBtn = document.getElementById('btn-audition-skill');
    return {
      auditionOpened: Boolean(auditionEl),
      auditionSkillBtnExists: Boolean(auditionSkillBtn)
    };
  });

  console.log('Trạng thái thanh Audition:', auditionCheck);
  assert.equal(auditionCheck.auditionOpened, true, 'Thanh Audition phải mở ra');
  assert.equal(auditionCheck.auditionSkillBtnExists, false, 'Nút skill trong thanh Audition PHẢI BỊ XOÁ HOÀN TOÀN');

  // Chụp ảnh thanh Audition không có nút skill
  const auditionPath = path.join(artifactDir, 'verified_audition_no_skill_button.png');
  await page.screenshot({ path: auditionPath });
  console.log('✓ Đã lưu ảnh thanh Audition thuần khiết không có skill:', auditionPath);

  // Đóng audition bằng cách huỷ hoặc dừng câu
  await page.evaluate(() => {
    window.__worldScene?.stopOnMapFishing?.();
  });
  await page.waitForTimeout(1000);

  // 5. Kiểm tra tương tác với cổng dịch chuyển mới Về Nông Trại tại (160, 645)
  console.log('Kiểm tra bước vào cổng dịch chuyển Về Nông Trại tại (160, 645)...');
  await page.evaluate(() => {
    window.__warpStartTime = 0;
    window.addEventListener('game:portal-warp-start', () => {
      window.__warpStartTime = performance.now();
    }, { once: true });

    const ws = window.__worldScene;
    const portal = ws?.portals?.find(p => p.targetMapId === 'map_pet_farm');
    // Đưa hero lại gần cổng trước khi tương tác để kích hoạt mượt mà
    ws?.hero?.setPosition?.(180, 645);
    portal?.handleInteract?.();
  });

  console.log('Đang chờ hiệu ứng xoáy hút và Implosion VFX...');
  await page.waitForFunction(() => window.__warpStartTime > 0, { timeout: 10000 });
  console.log('Warp started! Đang chuyển cảnh sang map_pet_farm...');
  await page.waitForFunction(() => window.__worldScene?.currentMapId === 'map_pet_farm', { timeout: 10000 });

  const arrivedMap = await page.evaluate(() => window.__worldScene?.currentMapId);
  console.log('Bản đồ sau khi dịch chuyển:', arrivedMap);
  assert.equal(arrivedMap, 'map_pet_farm', 'Phải dịch chuyển thành công về map_pet_farm');

  console.log('🎉 TẤT CẢ CÁC BƯỚC KIỂM TRA ĐÃ THÀNH CÔNG RỰC RỠ!');
  await browser.close();
})();
