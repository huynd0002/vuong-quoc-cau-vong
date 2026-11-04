import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
const gameHtmlPath = path.resolve('./game.html');

async function testMap4() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('--- Đang mở game.html...');
  await page.goto(`file://${gameHtmlPath}`);
  await page.waitForTimeout(2000);

  // Đóng modal chọn nhân vật nếu có
  await page.evaluate(() => {
    const charModal = document.getElementById('character-select-modal');
    if (charModal) {
      charModal.style.display = 'none';
      charModal.remove();
    }
  });

  // Mở Map 4
  console.log('--- Đang chuyển sang Map 4 (Đền Mặt Trời Sa Mạc)...');
  await page.evaluate(() => {
    const game = window.__PHASER_GAME__;
    if (game) {
      const scene = game.scene.getScene('WorldScene');
      if (scene) {
        scene.scene.start('WorldScene', { mapId: 'map4' });
      }
    }
  });

  await page.waitForTimeout(3000);

  // Chụp ảnh toàn cảnh Map 4
  const shotMap4Path = path.join(artifactDir, 'verified_map4_desert_sun_arena.png');
  await page.screenshot({ path: shotMap4Path });
  console.log('✓ Đã chụp ảnh bản đồ Map 4:', shotMap4Path);

  // Kích hoạt chạm trán Quái 1 (Cáo Cát Ánh Dương)
  console.log('--- Đang mở màn chiến đấu với Cáo Cát Ánh Dương...');
  await page.evaluate(() => {
    const game = window.__PHASER_GAME__;
    const scene = game.scene.getScene('WorldScene');
    const enc = scene.mapConfig.encounters[0];
    scene.triggerEncounterPrompt(enc, false);
  });

  await page.waitForTimeout(1000);

  // Bấm nút BẮT ĐẦU từ prompt
  await page.evaluate(() => {
    const startBtn = document.getElementById('prompt-btn-start');
    if (startBtn) startBtn.click();
  });

  await page.waitForTimeout(1500);

  // Chụp ảnh Đấu trường với câu hỏi phép trừ
  const shotBattlePath = path.join(artifactDir, 'verified_map4_battle_subtraction.png');
  await page.screenshot({ path: shotBattlePath });
  console.log('✓ Đã chụp ảnh màn hình chiến đấu câu hỏi phép trừ Map 4:', shotBattlePath);

  // Đóng arena và giải cứu cả 3 quái nhỏ
  console.log('--- Giải cứu 3 quái nhỏ để hiển thị Boss Thần Nhân Sư...');
  await page.evaluate(() => {
    const game = window.__PHASER_GAME__;
    const scene = game.scene.getScene('WorldScene');
    const modal = window.__battleModal;
    if (modal) modal.closeArena();

    const saveState = scene.saveState || window.__saveAdapter?.load?.();
    if (saveState && saveState.campaign) {
      saveState.campaign.rescuedFriends = saveState.campaign.rescuedFriends || {};
      saveState.campaign.rescuedFriends['enc_map4_1'] = true;
      saveState.campaign.rescuedFriends['enc_map4_2'] = true;
      saveState.campaign.rescuedFriends['enc_map4_3'] = true;
      if (window.__saveAdapter?.save) {
        window.__saveAdapter.save(saveState);
      }
    }
    scene.scene.restart({ mapId: 'map4' });
  });

  await page.waitForTimeout(3000);

  // Chụp ảnh Boss Thần Nhân Sư xuất hiện trên bệ thờ
  const shotBossMapPath = path.join(artifactDir, 'verified_map4_boss_sphinx_on_altar.png');
  await page.screenshot({ path: shotBossMapPath });
  console.log('✓ Đã chụp ảnh Boss Thần Nhân Sư trên bệ thờ:', shotBossMapPath);

  // Chạm vào Boss để mở Battle Arena với Boss
  console.log('--- Kích hoạt màn chiến đấu với Boss Thần Nhân Sư...');
  await page.evaluate(() => {
    const game = window.__PHASER_GAME__;
    const scene = game.scene.getScene('WorldScene');
    if (scene.boss) {
      scene.triggerEncounterPrompt(scene.boss.data, true);
    }
  });

  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const startBossBtn = document.getElementById('prompt-btn-start');
    if (startBossBtn) startBossBtn.click();
  });

  await page.waitForTimeout(1500);

  const shotBossBattlePath = path.join(artifactDir, 'verified_map4_boss_sphinx_battle.png');
  await page.screenshot({ path: shotBossBattlePath });
  console.log('✓ Đã chụp ảnh màn đấu Boss Thần Nhân Sư:', shotBossBattlePath);

  await browser.close();
  console.log('🎉 Hoàn tất xác thực Map 4!');
}

testMap4().catch(err => {
  console.error('Lỗi kiểm tra Map 4:', err);
  process.exit(1);
});
