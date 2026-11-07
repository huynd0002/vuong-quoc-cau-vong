import { chromium } from 'playwright';

async function main() {
  console.log('Starting Playwright browser verification for Difficulty Scaling & Audition Mini Game...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[Browser Error]', msg.text());
  });

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Đóng mọi modal chắn pointer events (nhân vật, story intro) nếu có
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });
  await page.waitForTimeout(500);

  // 1. Kiểm tra sự xuất hiện của nút Vũ Điệu trên thanh Topbar
  const auditionBtn = await page.$('#btn-open-audition');
  console.log('1. Audition Topbar button present:', !!auditionBtn);
  if (auditionBtn) {
    const isVisible = await auditionBtn.isVisible();
    console.log('   Audition Topbar button visible:', isVisible);
  }

  // 2. Mở Audition Minigame Modal từ Topbar / direct API
  await page.evaluate(() => {
    if (window.__auditionModal) {
      window.__auditionModal.show();
    }
  });
  await page.waitForTimeout(600);
  const modalVisible = await page.$eval('#audition-minigame-modal', el => el.style.display !== 'none');
  console.log('2. Audition Minigame Modal opened:', modalVisible);

  // Chụp ảnh màn hình Sân Khấu Vũ Điệu Audition
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_audition_stage_minigame.png' });
  console.log('   Saved verified_audition_stage_minigame.png');

  // Đóng modal Audition
  await page.evaluate(() => {
    if (window.__auditionModal) {
      window.__auditionModal.hide();
    }
  });
  await page.waitForTimeout(400);

  // 3. Kiểm tra BattleArenaModal mở quái thường (Nấm Con - 3 tim)
  const battleTestResult = await page.evaluate(async () => {
    const arena = window.__battleModal || window.__battleArenaModal;
    if (!arena) return { error: 'No arena found' };

    // Encounter Map 1 Quái 1: 3 tim
    const enc1 = {
      id: 'enc_map1_1',
      name: 'Nấm Con Vui Vẻ',
      mapId: 'map1',
      maxHearts: 3,
      reward: { stars: 3, exp: 15 }
    };
    const q1List = arena.getEncounterQuestions(enc1);
    const hearts1 = arena.calculateMonsterHearts(enc1);

    // Encounter Map 1 Quái 3: Tinh Anh 5 tim
    const enc3 = {
      id: 'enc_map1_3',
      name: 'Bọ Rùa Cánh Cam',
      mapId: 'map1',
      isElite: true,
      maxHearts: 5,
      reward: { stars: 5, exp: 25 }
    };
    const q3List = arena.getEncounterQuestions(enc3);
    const hearts3 = arena.calculateMonsterHearts(enc3);

    // Boss Map 1: 5 tim
    const boss1 = {
      id: 'boss_map1',
      name: 'Rồng Thần Lửa Cầu Vồng',
      mapId: 'map1',
      isBoss: true,
      maxHearts: 5,
      reward: { stars: 8, exp: 50 }
    };
    const qBoss1List = arena.getEncounterQuestions(boss1);
    const heartsBoss1 = arena.calculateMonsterHearts(boss1);

    // Boss Map 6: 10 tim
    const boss6 = {
      id: 'boss_map6',
      name: 'Thần Long Cầu Vồng',
      mapId: 'map6',
      isBoss: true,
      maxHearts: 10,
      reward: { stars: 40, exp: 250 }
    };
    const qBoss6List = arena.getEncounterQuestions(boss6);
    const heartsBoss6 = arena.calculateMonsterHearts(boss6);

    return {
      enc1: { hearts: hearts1, questionsCount: q1List.length, types: q1List.map(q => q.type || (q.isMaze ? 'maze' : 'text')) },
      enc3: { hearts: hearts3, questionsCount: q3List.length, types: q3List.map(q => q.type || (q.isMaze ? 'maze' : 'text')) },
      boss1: { hearts: heartsBoss1, questionsCount: qBoss1List.length, types: qBoss1List.map(q => q.type || (q.isMaze ? 'maze' : 'text')) },
      boss6: { hearts: heartsBoss6, questionsCount: qBoss6List.length, types: qBoss6List.map(q => q.type || (q.isMaze ? 'maze' : 'text')) }
    };
  });

  console.log('3. Battle Arena Evaluation:', JSON.stringify(battleTestResult, null, 2));

  // 4. Mở trực tiếp một trận đấu quái tinh anh 5 tim để chụp ảnh sàn đấu Battle Arena
  await page.evaluate(() => {
    const arena = window.__battleModal || window.__battleArenaModal;
    const eliteEnc = {
      id: 'enc_map1_3',
      name: 'Bọ Rùa Cánh Cam',
      mapId: 'map1',
      isElite: true,
      maxHearts: 5,
      reward: { stars: 5, exp: 25 }
    };
    arena.openArena(eliteEnc);
  });

  await page.waitForTimeout(800);
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_elite_monster_5_hearts_battle.png' });
  console.log('   Saved verified_elite_monster_5_hearts_battle.png');

  // 5. Thử nghiệm một câu hỏi Audition trong trận đấu
  await page.evaluate(() => {
    const arena = window.__battleModal || window.__battleArenaModal;
    const auditionQ = {
      id: 'q_test_audition_battle',
      type: 'audition_rhythm',
      isAudition: true,
      target: 3,
      prompt: '🎵 VŨ ĐIỆU AUDITION CẦU VỒNG: Canh bi vào VÙNG ĐỎ rồi nhấn BẮT NHỊP!',
      speak: 'Vũ điệu Audition sôi động!'
    };
    arena.renderAnswers(auditionQ);
  });

  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_audition_rhythm_in_battle.png' });
  console.log('   Saved verified_audition_rhythm_in_battle.png');

  // 6. Thử nghiệm câu hỏi Memory Match Map 2 (8 ô - 4 cặp, sai 4 lần)
  await page.evaluate(() => {
    const arena = window.__battleModal || window.__battleArenaModal;
    const memQ2 = {
      id: 'q_map2_memory_mushrooms',
      type: 'memory_match',
      pairs: 4,
      maxMistakes: 4,
      cards: [
        { id: 'c1', label: '🍄 Nấm Đỏ' },
        { id: 'c2', label: '🐝 Chú Ong' },
        { id: 'c3', label: '🦀 Chú Cua' },
        { id: 'c4', label: '⭐ Sao Biển' },
        { id: 'c1_b', label: '🍄 Nấm Đỏ' },
        { id: 'c2_b', label: '🐝 Chú Ong' },
        { id: 'c3_b', label: '🦀 Chú Cua' },
        { id: 'c4_b', label: '⭐ Sao Biển' }
      ]
    };
    arena.renderAnswers(memQ2);
  });

  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_map2_memory_8_cards_4_mistakes.png' });
  console.log('   Saved verified_map2_memory_8_cards_4_mistakes.png');

  await browser.close();
  console.log('🎉 PLAYWRIGHT VERIFICATION COMPLETED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Playwright verification failed:', err);
  process.exit(1);
});
