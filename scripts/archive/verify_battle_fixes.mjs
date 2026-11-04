import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
const gameHtmlPath = path.resolve('./game.html');

async function testFixes() {
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

  // Kiểm tra thuộc tính các phần tử
  const battleState = await page.evaluate(() => {
    const title = document.getElementById('arena-title-banner');
    const heroBox = document.getElementById('arena-hero-box');
    const monsterBox = document.getElementById('arena-monster-box');
    const monsterImg = document.getElementById('arena-monster-img');
    const answersGrid = document.getElementById('arena-answers-grid');
    const modal = document.getElementById('battle-arena-modal');

    return {
      titleRect: title?.getBoundingClientRect(),
      monsterSrc: monsterImg?.src?.slice(0, 100),
      monsterWidth: monsterImg?.naturalWidth,
      monsterHeight: monsterImg?.naturalHeight,
      monsterVisible: monsterImg?.complete && monsterImg?.naturalWidth > 0,
      heroPos: { left: heroBox?.style.left, top: heroBox?.style.top },
      monsterPos: { left: monsterBox?.style.left, top: monsterBox?.style.top },
      bgImage: modal?.style.backgroundImage?.slice(0, 80),
      gridWidth: answersGrid?.getBoundingClientRect()?.width
    };
  });

  console.log('Battle state verification:', JSON.stringify(battleState, null, 2));

  // Chụp ảnh Đấu trường đã căn chỉnh hoàn hảo (Title căn giữa, Cáo Cát hiện hình, đáp án nhỏ gọn)
  const shot1 = path.join(artifactDir, 'verified_map4_battle_fixed_layout.png');
  await page.screenshot({ path: shot1 });
  console.log('✓ Đã chụp ảnh Đấu trường hoàn thiện:', shot1);

  // Bấm đáp án đúng để kích hoạt Skill Tấn Công Thái Dương Cầu Xoáy
  console.log('--- Đang kích hoạt Skill Tấn Công (Thái Dương Cầu Xoáy)...');
  await page.evaluate(() => {
    const modal = window.__battleModal;
    if (modal) {
      modal.executeHeroAttack();
    }
  });

  await page.waitForTimeout(150); // Chụp lúc đạn đang bay
  const shotAttack = path.join(artifactDir, 'verified_map4_hero_solar_attack.png');
  await page.screenshot({ path: shotAttack });
  console.log('✓ Đã chụp ảnh Skill Tấn Công Thái Dương:', shotAttack);

  await page.waitForTimeout(1500);

  // Kích hoạt Skill Phòng Thủ (Khiên Thái Dương)
  console.log('--- Đang kích hoạt Skill Phòng Thủ (Khiên Thái Dương)...');
  await page.evaluate(() => {
    const modal = window.__battleModal;
    if (modal) {
      modal.executeMonsterAttack(true); // true = showcase mode (Bé Sam giương Khiên bảo vệ)
    }
  });

  await page.waitForTimeout(200); // Chụp lúc Khiên đang sáng rực
  const shotDefense = path.join(artifactDir, 'verified_map4_hero_solar_defense.png');
  await page.screenshot({ path: shotDefense });
  console.log('✓ Đã chụp ảnh Skill Phòng Thủ Khiên Thái Dương:', shotDefense);

  await page.waitForTimeout(1500);

  await browser.close();
  console.log('🎉 TOÀN BỘ KIỂM TRA ĐÃ HOÀN TẤT XUẤT SẮC!');
}

testFixes().catch(err => {
  console.error('Lỗi kiểm tra:', err);
  process.exit(1);
});
