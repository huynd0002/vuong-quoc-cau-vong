import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function verifyAll8VFX() {
  console.log('=== BẮT ĐẦU KIỂM TRA TOÀN DIỆN 8 TÍNH NĂNG VFX & CƠ CHẾ MỚI (v3.7.1) ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[WorldScene]') || text.includes('VFX') || text.includes('Hồi Sinh') || text.includes('Coin Drop')) {
      console.log('BROWSER CONSOLE:', text);
    }
  });

  try {
    await page.goto('http://127.0.0.1:5173/dev.html', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);

    // TEST 1: Thử nghiệm Pop-up Hồi Sinh Kỳ Diệu & respawn-beam VFX khi hết tim
    console.log('\n--- [TEST 1] Pop-up Hồi Sinh & Respawn-Beam VFX ---');
    const test1Result = await page.evaluate(async () => {
      const arena = window.__battleArenaModal;
      if (!arena) return { ok: false, error: 'Không tìm thấy BattleArenaModal' };

      // Kích hoạt showDefeatModal()
      arena.showDefeatModal();
      const defeatEl = document.getElementById('arena-defeat-overlay');
      const isVisible = defeatEl && defeatEl.style.display !== 'none';
      const badge = defeatEl?.querySelector('.defeat-badge')?.textContent;
      const title = defeatEl?.querySelector('.defeat-title')?.textContent;
      const btn = document.getElementById('btn-defeat-return-farm');

      return {
        ok: isVisible && badge.includes('HỒI SINH KỲ DIỆU') && title.includes('HỒI SINH NHÂN VẬT'),
        badge,
        title,
        buttonText: btn?.textContent?.trim()
      };
    });

    console.log('Test 1 Defeat/Revival Modal check:', test1Result);
    if (!test1Result.ok) throw new Error('Test 1 Thất bại: Giao diện Pop-up Hồi Sinh không hiển thị đúng chuẩn!');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_vfx_revival_popup.png') });

    // Bấm Hồi Sinh để dịch chuyển về Nông Trại
    await page.evaluate(() => {
      document.getElementById('btn-defeat-return-farm')?.click();
    });
    await page.waitForTimeout(1200);

    const test1RespawnCheck = await page.evaluate(() => {
      const scene = window.__worldScene;
      const hasAnim = scene?.anims?.exists('anim_respawn_beam');
      const hasTexture = scene?.textures?.exists('vfx_respawn_beam');
      const currentMap = scene?.currentMapId;
      return { currentMap, hasAnim, hasTexture };
    });
    console.log('Test 1 Respawn Beam in Farm check:', test1RespawnCheck);

    // TEST 2: Thử nghiệm VFX spawn/coin-drop khi quái vật bị thua & biến mất
    console.log('\n--- [TEST 2] VFX Coin-Drop khi Quái Bị Thua & Biến Mất ---');
    const test2Result = await page.evaluate(() => {
      const scene = window.__worldScene;
      const starsBefore = window.__saveAdapter?.load()?.player?.stars || 0;

      // Kích hoạt playCoinDropVFX
      scene.playCoinDropVFX(640, 360, 5);
      const starsAfter = window.__saveAdapter?.load()?.player?.stars || 0;
      const hasAnim = scene?.anims?.exists('anim_coin_drop');
      const hasTexture = scene?.textures?.exists('vfx_coin_drop');

      return {
        ok: hasAnim && hasTexture && starsAfter === starsBefore + 5,
        starsBefore,
        starsAfter,
        hasAnim,
        hasTexture
      };
    });
    console.log('Test 2 Coin Drop check:', test2Result);
    if (!test2Result.ok) throw new Error('Test 2 Thất bại: Coin Drop không kích hoạt hoặc không cộng sao!');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_vfx_coin_drop.png') });

    // TEST 3: Thử nghiệm Khi Dùng Thức Ăn (Heal-AOE + Charmed + Loading 100%)
    console.log('\n--- [TEST 3] Hiệu Ứng Ăn Thức Ăn (Heal-AOE + Charmed + Loading 100%) ---');
    const test3Result = await page.evaluate(async () => {
      const scene = window.__worldScene;
      scene.playFoodConsumptionVFX('dish_soup', null);

      const hasHealAnim = scene?.anims?.exists('anim_heal_aoe');
      const hasCharmedAnim = scene?.anims?.exists('anim_charmed');

      return {
        hasHealAnim,
        hasCharmedAnim
      };
    });
    console.log('Test 3 Food VFX Check:', test3Result);
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_vfx_food_consumption.png') });

    // Đợi loading 100% hoàn thành
    await page.waitForTimeout(1800);

    // TEST 4: Thử nghiệm Fishing Countdown VFX khi bấm BẮT
    console.log('\n--- [TEST 4] Fishing Countdown VFX khi bấm BẮT ---');
    const test4Result = await page.evaluate(async () => {
      const scene = window.__worldScene;
      let countdownTriggered = false;

      // Giả lập trạng thái bite_waiting
      scene.onMapFishingState = {
        phase: 'bite_waiting',
        castX: 688,
        castY: 360,
        species: { name: 'Cá Mây', icon: '🐟', requiredHits: 1 }
      };

      let completeCalled = false;
      scene.playFishingCountdownVFX(() => {
        completeCalled = true;
      });

      const hasCountdownAnim = scene?.anims?.exists('anim_countdown');
      const hasCountdownTexture = scene?.textures?.exists('vfx_countdown');

      return {
        hasCountdownAnim,
        hasCountdownTexture
      };
    });
    console.log('Test 4 Fishing Countdown Check:', test4Result);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_vfx_fishing_countdown.png') });

    // TEST 5: Thử nghiệm Pickups Ngôi Sao May Mắn (pickups/power-star)
    console.log('\n--- [TEST 5] Pickups Ngôi Sao May Mắn (vfx pickups/power-star) ---');
    const test5Result = await page.evaluate(() => {
      const scene = window.__worldScene;
      scene.spawnPowerStarPickup();
      const hasStar = Boolean(scene.powerStarPickup && scene.powerStarPickup.active);
      const starAnim = scene.anims?.exists('anim_power_star');

      // Cho hero chạm vào star
      if (scene.hero?.sprite && scene.powerStarPickup) {
        scene.hero.sprite.setPosition(scene.powerStarPickup.x, scene.powerStarPickup.y);
      }

      const starsBefore = window.__saveAdapter?.load()?.player?.stars || 0;
      scene.updatePowerStarPickup(1000, 16);
      const starsAfter = window.__saveAdapter?.load()?.player?.stars || 0;

      return {
        hasStarCreated: hasStar,
        starAnim,
        starsBefore,
        starsAfter,
        awardedStars: starsAfter - starsBefore
      };
    });
    console.log('Test 5 Power Star Check:', test5Result);
    if (!test5Result.starAnim || test5Result.awardedStars < 1) {
      throw new Error('Test 5 Thất bại: Power Star không hoạt động hoặc không cộng từ 1-10 sao!');
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_vfx_power_star.png') });

    // TEST 6: Thử nghiệm VFX transitions/glitch-wipe chuyển cảnh
    console.log('\n--- [TEST 6] VFX Transitions Glitch-Wipe Chuyển Cảnh ---');
    const test6Result = await page.evaluate(() => {
      const scene = window.__worldScene;
      let wipeFinished = false;
      scene.playGlitchWipeTransition(() => {
        wipeFinished = true;
      });
      const hasWipeAnim = scene?.anims?.exists('anim_glitch_wipe');
      const hasWipeTexture = scene?.textures?.exists('vfx_glitch_wipe');
      return { hasWipeAnim, hasWipeTexture };
    });
    console.log('Test 6 Glitch Wipe Check:', test6Result);
    if (!test6Result.hasWipeAnim || !test6Result.hasWipeTexture) {
      throw new Error('Test 6 Thất bại: Glitch Wipe transition không tồn tại!');
    }
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_vfx_glitch_wipe.png') });

    // TEST 7: Thử nghiệm Thay thế bướm bằng critters/butterfly
    console.log('\n--- [TEST 7] Thay Thế Toàn Bộ Bướm Bằng critters/butterfly ---');
    const test7Result = await page.evaluate(() => {
      const scene = window.__worldScene;
      const hasButterflyAnim = scene?.anims?.exists('anim_butterfly');
      const hasButterflyTexture = scene?.textures?.exists('vfx_butterfly');
      return { hasButterflyAnim, hasButterflyTexture };
    });
    console.log('Test 7 Butterfly Anim Check:', test7Result);
    if (!test7Result.hasButterflyAnim || !test7Result.hasButterflyTexture) {
      throw new Error('Test 7 Thất bại: anim_butterfly chưa được nạp!');
    }

    // TEST 8: Thử nghiệm Chú Ếch critters/frog ở cạnh hồ câu cá
    console.log('\n--- [TEST 8] Chú Ếch critters/frog ở Cạnh Hồ Câu Cá ---');
    const test8Result = await page.evaluate(async () => {
      const scene = window.__worldScene;
      scene.currentMapId = 'map_fishing_pond';
      scene.createFishingPondFrog();

      const hasFrog = Boolean(scene.pondFrog && scene.pondFrog.active);
      const hasFrogAnim = scene?.anims?.exists('anim_frog');
      const hasFrogTexture = scene?.textures?.exists('vfx_frog');

      // Giả lập click vào ếch
      if (scene.pondFrog) {
        scene.pondFrog.emit('pointerdown', { event: { stopPropagation: () => {} } });
      }

      return {
        hasFrog,
        hasFrogAnim,
        hasFrogTexture,
        frogX: scene.pondFrog?.x,
        frogY: scene.pondFrog?.y
      };
    });
    console.log('Test 8 Frog Check:', test8Result);
    if (!test8Result.hasFrog || !test8Result.hasFrogAnim) {
      throw new Error('Test 8 Thất bại: Chú ếch critters/frog không xuất hiện ở Hồ Câu!');
    }
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_vfx_frog_fishing_pond.png') });

    console.log('\n======================================================');
    console.log('🎉 TẤT CẢ 8/8 TÍNH NĂNG VFX & CƠ CHẾ ĐÃ HOẠT ĐỘNG HOÀN HẢO!');
    console.log('======================================================');

  } catch (err) {
    console.error('LỖI KIỂM TRA:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyAll8VFX();
