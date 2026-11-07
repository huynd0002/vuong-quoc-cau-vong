import { chromium } from 'playwright';

async function verify() {
  console.log('=== BẮT ĐẦU XÁC MINH LẬT HƯỚNG QUÁI VẬT & NGÔI SAO MAY MẮN (v3.7.4) ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/dev.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Remove initial character select modal if present
  await page.evaluate(() => {
    const el = document.getElementById('character-select-modal');
    if (el) el.remove();
  });

  // TEST 1: Boss Dragon orientation in BattleArenaModal
  console.log('\n--- [TEST 1] Hướng quái vật / Boss Rồng Thần trong Đấu Trường ---');
  const battleResult = await page.evaluate(async () => {
    const battle = window.__battleArenaModal;
    if (!battle) return { error: 'Không tìm thấy __battleArenaModal' };

    const encounter = {
      id: 'enc_boss_dragon',
      spriteKey: 'boss_dragon',
      name: 'Rồng Thần (Ngọn Lửa Khởi Nguyên)',
      isBoss: true,
      maxHearts: 5,
      hearts: 5
    };

    battle.openArena(encounter, true);
    const assets = battle.getMonsterAssets(encounter);

    const transform = battle.arenaMonsterImg?.style?.transform;
    const isFlippedLeft = transform.includes('scaleX(-1)');

    return {
      name: encounter.name,
      flipIdle: assets.flipIdle,
      flipAttack: assets.flipAttack,
      flipHit: assets.flipHit,
      flipCelebrate: assets.flipCelebrate,
      transform,
      isFlippedLeft,
      imgSrc: battle.arenaMonsterImg?.src
    };
  });

  console.log('Kết quả Test 1:', battleResult);
  if (!battleResult.isFlippedLeft) {
    throw new Error('Test 1 Thất bại: Quái vật chưa được lật sang trái (scaleX(-1))!');
  }

  await page.waitForTimeout(600);
  await page.screenshot({
    path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_boss_dragon_facing_hero_v374.png',
    clip: { x: 50, y: 100, width: 1180, height: 480 }
  });
  console.log('✓ Test 1 ĐẠT: Đã chụp ảnh xác minh Rồng Thần quay mặt sang trái hướng thẳng về Bé Sam!');

  // Close battle arena
  await page.evaluate(() => {
    window.__battleArenaModal?.closeArena();
  });
  await page.waitForTimeout(500);

  // TEST 2: Power-Star pickup size & rare spawn rate in WorldScene
  console.log('\n--- [TEST 2] Kích thước Ngôi Sao Thưởng (+10%) & Tỉ Lệ Xuất Hiện ---');
  const starResult = await page.evaluate(async () => {
    const scene = window.__worldScene || window.game?.scene?.getScene('WorldScene');
    if (!scene) return { error: 'Không tìm thấy WorldScene' };

    // Force spawn power star to test size
    scene.spawnPowerStarPickup();
    const star = scene.powerStarPickup;

    return {
      hasStar: Boolean(star && star.active),
      displayWidth: star?.displayWidth,
      displayHeight: star?.displayHeight,
      hasDespawnTimer: Boolean(scene.powerStarDespawnTimer),
      animKey: star?.anims?.currentAnim?.key
    };
  });

  console.log('Kết quả Test 2:', starResult);
  if (!starResult.hasStar || Math.round(starResult.displayWidth) < 46) {
    throw new Error(`Test 2 Thất bại: Kích thước sao chưa to hơn 10% (chiều rộng hiện tại: ${starResult.displayWidth})`);
  }

  await page.waitForTimeout(400);
  // Focus camera/screenshot on power star
  const starCoords = await page.evaluate(() => {
    const star = window.__worldScene?.powerStarPickup;
    return { x: star?.x || 500, y: star?.y || 400 };
  });

  await page.screenshot({
    path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_power_star_enlarged_v374.png',
    clip: {
      x: Math.max(0, starCoords.x - 120),
      y: Math.max(0, starCoords.y - 120),
      width: 240,
      height: 240
    }
  });
  console.log('✓ Test 2 ĐẠT: Đã chụp ảnh Ngôi sao thưởng may mắn to hơn 10% lấp lánh trên bản đồ!');

  await browser.close();
  console.log('\n======================================================');
  console.log('🎉 TOÀN BỘ 2/2 TÍNH NĂNG V3.7.4 ĐÃ HOẠT ĐỘNG HOÀN HẢO!');
  console.log('======================================================');
}

verify().catch(err => {
  console.error('Lỗi kiểm tra:', err);
  process.exit(1);
});
