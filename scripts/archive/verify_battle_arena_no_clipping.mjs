import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('--- [Test] Verifying Battle Arena Modal Layout & Zero Clipping ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;
  console.log(`[Test] Loading ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Close character select modal if open
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
  });

  // TEST 1: q_map3_shadow_car (Image 5 - Finding shadow of Red Toy Car)
  console.log('[Test 1] Testing q_map3_shadow_car in Map 3...');
  await page.evaluate(() => {
    const arena = window.__battleArenaModal;
    arena.openArena({
      id: 'enc_map3_bat',
      name: 'Dơi Pha Lê Ngọc Tím',
      mapId: 'map3',
      zoneId: 'map3',
      questionId: 'q_map3_shadow_car'
    });
  });
  await page.waitForTimeout(1000);

  const shadowTestMetrics = await page.evaluate(() => {
    const arenaModal = document.getElementById('battle-arena-modal');
    const bottomDialog = arenaModal.querySelector('.arena-bottom-dialog');
    const titleBanner = arenaModal.querySelector('.arena-banner-title');
    const retreatBtn = arenaModal.querySelector('.arena-retreat-btn');
    const questionBar = arenaModal.querySelector('.arena-question-bar');
    const ansButtons = Array.from(arenaModal.querySelectorAll('.ans-btn'));

    const arenaRect = arenaModal.getBoundingClientRect();
    const dialogRect = bottomDialog.getBoundingClientRect();
    const bannerRect = titleBanner.getBoundingClientRect();
    const retreatRect = retreatBtn.getBoundingClientRect();
    const qBarRect = questionBar.getBoundingClientRect();

    const bannerCenter = bannerRect.left + bannerRect.width / 2;
    const arenaCenter = arenaRect.left + arenaRect.width / 2;
    const bannerCentered = Math.abs(bannerCenter - arenaCenter) < 5;

    const retreatOnRight = retreatRect.right > arenaRect.right - 100;

    const buttonsMetrics = ansButtons.map(btn => {
      const bRect = btn.getBoundingClientRect();
      const caption = btn.querySelector('.ans-image-caption')?.textContent?.trim();
      const imgPic = btn.querySelector('.ans-image-pic');
      const imgPicRect = imgPic ? imgPic.getBoundingClientRect() : null;
      return {
        caption,
        top: bRect.top,
        bottom: bRect.bottom,
        height: bRect.height,
        isInsideDialog: bRect.bottom <= dialogRect.bottom,
        isInsideArena: bRect.bottom <= arenaRect.bottom,
        imgVisible: imgPicRect && imgPicRect.height > 0
      };
    });

    return {
      arenaHeight: arenaRect.height,
      arenaBottom: arenaRect.bottom,
      dialogBottom: dialogRect.bottom,
      dialogHeight: dialogRect.height,
      dialogInsideArena: dialogRect.bottom <= arenaRect.bottom + 1,
      bannerCentered,
      retreatOnRight,
      buttonsMetrics
    };
  });

  console.log('[Test 1 Metrics]', JSON.stringify(shadowTestMetrics, null, 2));

  assert.ok(shadowTestMetrics.dialogInsideArena, 'Bottom dialog must not overflow outside arena modal');
  assert.ok(shadowTestMetrics.bannerCentered, 'Title banner must be horizontally centered');
  assert.ok(shadowTestMetrics.retreatOnRight, 'Retreat button must be pinned to the right');

  for (const b of shadowTestMetrics.buttonsMetrics) {
    assert.ok(b.isInsideDialog, `Button ${b.caption} must be completely inside bottom dialog`);
    assert.ok(b.isInsideArena, `Button ${b.caption} must be completely inside arena modal`);
    assert.ok(b.imgVisible, `Button ${b.caption} image must be visible`);
  }

  const artDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
  await page.screenshot({ path: `${artDir}/verified_arena_shadow_car_no_clip.png` });
  console.log(`[Test 1] Saved screenshot: ${artDir}/verified_arena_shadow_car_no_clip.png`);

  // TEST 2: q_map4_sub_fox (Image 1 - 7 quả cam ngọt chia 3 quả cho Cáo Cát)
  console.log('[Test 2] Testing q_map4_sub_fox in Map 4 (Desert)...');
  await page.evaluate(() => {
    const arena = window.__battleArenaModal;
    arena.openArena({
      id: 'enc_map4_fox',
      name: 'Cáo Cát Ánh Dương',
      mapId: 'map4',
      zoneId: 'map4',
      questionId: 'q_map4_sub_fox'
    });
  });
  await page.waitForTimeout(1000);

  const subFoxMetrics = await page.evaluate(() => {
    const arenaModal = document.getElementById('battle-arena-modal');
    const bottomDialog = arenaModal.querySelector('.arena-bottom-dialog');
    const arenaRect = arenaModal.getBoundingClientRect();
    const dialogRect = bottomDialog.getBoundingClientRect();
    const ansButtons = Array.from(arenaModal.querySelectorAll('.ans-btn'));

    const buttonsMetrics = ansButtons.map(btn => {
      const bRect = btn.getBoundingClientRect();
      const num = btn.querySelector('.ans-giant-number')?.textContent?.trim();
      const caption = btn.querySelector('.ans-quantity-caption')?.textContent?.trim();
      return {
        num,
        caption,
        height: bRect.height,
        isInsideDialog: bRect.bottom <= dialogRect.bottom,
        isInsideArena: bRect.bottom <= arenaRect.bottom
      };
    });

    return {
      dialogInsideArena: dialogRect.bottom <= arenaRect.bottom + 1,
      buttonsMetrics
    };
  });

  console.log('[Test 2 Metrics]', JSON.stringify(subFoxMetrics, null, 2));

  assert.ok(subFoxMetrics.dialogInsideArena, 'Bottom dialog in Map 4 must not overflow');
  for (const b of subFoxMetrics.buttonsMetrics) {
    assert.ok(b.isInsideDialog, `Button ${b.caption} must be inside dialog`);
    assert.ok(b.isInsideArena, `Button ${b.caption} must be inside arena`);
  }

  await page.screenshot({ path: `${artDir}/verified_arena_sub_fox_no_clip.png` });
  console.log(`[Test 2] Saved screenshot: ${artDir}/verified_arena_sub_fox_no_clip.png`);

  await browser.close();
  console.log('✅ ALL BATTLE ARENA NO-CLIPPING TESTS PASSED 100%!');
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
