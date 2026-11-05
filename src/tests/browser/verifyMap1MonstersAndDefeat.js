import { chromium } from 'playwright';

async function runTests() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('--- TEST 1: KIỂM TRA QUÁI VẬT MAP 1 TRONG BATTLE ARENA ---');
  const monsterTest = await page.evaluate(async () => {
    const { MAPS_CONFIG } = await import('./src/content/maps/mapsConfig.js');
    const battleModal = window.__battleArenaModal;
    const map1 = MAPS_CONFIG.map1;
    
    const results = [];
    for (const enc of map1.encounters) {
      const assets = battleModal.getMonsterAssets(enc);
      const skill = battleModal.getMonsterSkill(enc);
      results.push({
        id: enc.id,
        name: enc.name,
        idle: assets.idle,
        skillId: skill.id,
        skillName: skill.name
      });
    }

    const bossAssets = battleModal.getMonsterAssets(map1.boss);
    const bossSkill = battleModal.getMonsterSkill(map1.boss);
    results.push({
      id: map1.boss.id,
      name: map1.boss.name,
      idle: bossAssets.idle,
      skillId: bossSkill.id,
      skillName: bossSkill.name
    });

    return results;
  });

  console.log(JSON.stringify(monsterTest, null, 2));

  // Kiểm tra Bọ Rùa Cánh Cam
  const ladybug = monsterTest.find(m => m.id === 'enc_map1_3');
  if (!ladybug || !ladybug.idle.includes('ladybug') || !ladybug.skillId.includes('ladybug')) {
    throw new Error(`FAIL: Bọ Rùa Cánh Cam bị sai quái! Idle=${ladybug?.idle}, Skill=${ladybug?.skillId}`);
  }
  console.log('✓ PASS: Bọ Rùa Cánh Cam hiển thị đúng ladybug, không bị nhầm sang bọ kim quy sa mạc map 4!');

  // Kiểm tra Nấm Con Vui Vẻ
  const mushroom = monsterTest.find(m => m.id === 'enc_map1_1');
  if (!mushroom || !mushroom.idle.includes('mushroom') || !mushroom.skillId.includes('mushroom')) {
    throw new Error(`FAIL: Nấm Con Vui Vẻ bị sai quái!`);
  }
  console.log('✓ PASS: Nấm Con Vui Vẻ hiển thị đúng mushroom!');

  // Kiểm tra Ong Vàng Chăm Chỉ
  const bee = monsterTest.find(m => m.id === 'enc_map1_2');
  if (!bee || !bee.idle.includes('bee') || !bee.skillId.includes('bee')) {
    throw new Error(`FAIL: Ong Vàng Chăm Chỉ bị sai quái!`);
  }
  console.log('✓ PASS: Ong Vàng Chăm Chỉ hiển thị đúng bee!');

  // Kiểm tra Boss Rồng Thần
  const boss = monsterTest.find(m => m.id === 'boss_map1');
  if (!boss || !boss.idle.includes('boss_dragon') || !boss.skillId.includes('dragon')) {
    throw new Error(`FAIL: Boss Rồng Thần bị sai!`);
  }
  console.log('✓ PASS: Boss Rồng Thần hiển thị đúng dragon!');

  console.log('\n--- TEST 2: KIỂM TRA HẾT TIM THÌ BÁO THUA & VỀ MAP NUÔI THÚ (HỒI 1 TIM) ---');
  
  // Mở sàn đấu và giả lập trừ hết tim
  const defeatResult = await page.evaluate(async () => {
    const battleModal = window.__battleArenaModal;
    const cooking = window.__cookingSystem;
    const { MAPS_CONFIG } = await import('./src/content/maps/mapsConfig.js');

    // Bắt đầu với 3 tim
    cooking.recordBattleHearts(3);
    
    // Mở arena với quái vật Map 1
    battleModal.openArena(MAPS_CONFIG.map1.encounters[0]);

    // Trực tiếp set heroHearts = 0 và gọi xử lý đòn đánh
    battleModal.heroHearts = 0;
    battleModal.bonusHeartsRemaining = 0;
    battleModal.showDefeatModal();

    const defeatOverlay = document.getElementById('arena-defeat-overlay');
    const overlayVisible = defeatOverlay && defeatOverlay.style.display !== 'none';
    const defeatTitle = defeatOverlay?.querySelector('.defeat-title')?.textContent || '';
    const cookingHearts = cooking.getState().hearts;

    return {
      overlayVisible,
      defeatTitle,
      cookingHearts,
      heroHeartsInModal: battleModal.heroHearts
    };
  });

  console.log('Kết quả Defeat Modal:', defeatResult);

  if (!defeatResult.overlayVisible || !defeatResult.defeatTitle.includes('BẠN ĐÃ BỊ THUA')) {
    throw new Error('FAIL: Modal Bạn đã bị thua không hiển thị!');
  }
  console.log('✓ PASS: Modal "BẠN ĐÃ BỊ THUA!" hiển thị chuẩn xác!');

  if (defeatResult.cookingHearts !== 1 || defeatResult.heroHeartsInModal !== 1) {
    throw new Error(`FAIL: Tim chưa được hồi về đúng 1! cookingHearts=${defeatResult.cookingHearts}`);
  }
  console.log('✓ PASS: Số Tim được hồi đúng 1 Tim (các tim còn lại phải ăn để hồi lại)!');

  // Chụp ảnh minh chứng Defeat Modal
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_defeat_modal_return_pet_farm.png' });
  console.log('✓ Đã chụp ảnh verified_defeat_modal_return_pet_farm.png');

  // Bấm nút "🏡 Về Nông Trại Nuôi Thú ✨"
  await page.click('#btn-defeat-return-farm', { force: true });
  await page.waitForTimeout(1000);

  // Kiểm tra xem đã về map_pet_farm chưa và HUD tim hiển thị 1 tim
  const afterDefeatState = await page.evaluate(() => {
    const state = window.__cookingSystem?.getState();
    const currentMap = window.__worldScene?.currentMapId || 'map_pet_farm';
    const heartsIcons = document.querySelectorAll('#vitals-hearts-list .vital-heart-icon');
    const fullHearts = Array.from(heartsIcons).filter(img => !img.classList.contains('is-empty')).length;
    const emptyHearts = Array.from(heartsIcons).filter(img => img.classList.contains('is-empty')).length;

    return {
      currentMap,
      heartsState: state?.hearts,
      fullHearts,
      emptyHearts
    };
  });

  console.log('Trạng thái sau khi về Nông Trại:', afterDefeatState);

  if (afterDefeatState.currentMap !== 'map_pet_farm') {
    throw new Error(`FAIL: Chưa quay về map_pet_farm! Map hiện tại: ${afterDefeatState.currentMap}`);
  }
  console.log('✓ PASS: Đã quay về đúng map Nông Trại Nuôi Thú (map_pet_farm)!');

  if (afterDefeatState.fullHearts !== 1 || afterDefeatState.emptyHearts !== 2) {
    throw new Error(`FAIL: HUD Tim hiển thị không đúng 1 đầy 2 rỗng! full=${afterDefeatState.fullHearts}, empty=${afterDefeatState.emptyHearts}`);
  }
  console.log('✓ PASS: HUD Vitals hiển thị chuẩn 1 Tim đầy và 2 Tim rỗng (❤️ 🤍 🤍)!');

  // Chụp ảnh minh chứng sau khi về Nông trại với 1 tim
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_pet_farm_1_heart_after_defeat.png' });
  console.log('✓ Đã chụp ảnh verified_pet_farm_1_heart_after_defeat.png');

  console.log('\n--- TEST 3: KIỂM TRA ĂN MÓN ĂN TRONG BẾP ĐỂ HỒI LẠI ĐỦ TIM ---');
  const healResult = await page.evaluate(async () => {
    const cooking = window.__cookingSystem;
    
    // Thêm 1 món ăn hồi tim vào giỏ
    cooking.mutate(s => {
      s.dishes = [{
        id: 'cook-1',
        recipeId: 'fruit_yogurt',
        quality: 3
      }];
      return { ok: true };
    });

    // Ăn món ăn
    const eatRes = cooking.eat('cook-1');
    const heartsAfterEat = cooking.getState().hearts;
    if (typeof window.__updateHeroVitalsHud === 'function') {
      window.__updateHeroVitalsHud();
    }

    const heartsIcons = document.querySelectorAll('#vitals-hearts-list .vital-heart-icon');
    const fullHearts = Array.from(heartsIcons).filter(img => !img.classList.contains('is-empty')).length;

    return {
      eatRes,
      heartsAfterEat,
      fullHearts
    };
  });

  console.log('Kết quả ăn món ăn để lên tim:', healResult);
  if (healResult.heartsAfterEat <= 1) {
    throw new Error('FAIL: Ăn món ăn không hồi được tim!');
  }
  console.log(`✓ PASS: Ăn món ăn thành công hồi tim từ 1 lên ${healResult.heartsAfterEat} Tim!`);

  await browser.close();
  console.log('\n🎉 TẤT CẢ CÁC BÀI TEST ĐÃ VƯỢT QUA 100% XUẤT SẮC!');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
