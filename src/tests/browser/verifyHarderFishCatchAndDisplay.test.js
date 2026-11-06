import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import assert from 'node:assert/strict';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactDir = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5');

async function testHarderFishCatch() {
  console.log('--- [Test] Kiểm Tra Hiển Thị & Câu Cá Mới Khó Bắt (Cá Rồng Hoàng Kim 6 Sao / Cá Ngân Hà 7 Sao) ---');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1180, height: 820 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173/dev.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Chuyển tới Hồ Câu Lá Sen (map_fishing_pond)
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('char-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
    window.__worldScene?.scene?.restart?.({ mapId: 'map_fishing_pond' });
  });
  await page.waitForTimeout(2500);

  // Đưa Bé Sam tới vị trí bến câu
  await page.evaluate(() => {
    window.__worldScene.hero.setPosition(688, 360);
    window.__worldScene.updateDockFishingProximityButton(688, 360);
  });
  await page.waitForTimeout(600);

  // Kích hoạt Cá Rồng Hoàng Kim (golden_dragon_fish) hoặc Cá Ngân Hà Tinh Tú (galaxy_star_fish)
  console.log('Kích hoạt lượt câu Cá Rồng Hoàng Kim (6 Lần Canh - Siêu Khó)...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    const fs = window.__fishingSystem;
    fs.activateFishingSkill();

    const dragonSpecies = {
      id: 'golden_dragon_fish',
      speciesId: 'golden_dragon_fish',
      name: 'Cá Rồng Hoàng Kim',
      icon: '🐲',
      asset: '/assets/fishing/fish_golden_dragon.png',
      requiredHits: 6,
      requiredPullSteps: 8,
      minWeightG: 1500,
      maxWeightG: 3200
    };

    // Dừng timer tự động nếu có
    if (ws.onMapFishingBiteTimer) {
      clearTimeout(ws.onMapFishingBiteTimer);
      ws.onMapFishingBiteTimer = null;
    }

    // Khởi tạo onMapFishingState với Cá Rồng Hoàng Kim
    ws.onMapFishingState = {
      phase: 'audition',
      species: dragonSpecies,
      targetHits: 6,
      currentHits: 2, // Đã đạt 2/6 nhịp
      zoneTop: 45,
      zoneHeight: 12,
      markerPct: 48,
      markerSpeed: 210,
      markerDir: 1,
      weightG: 2500,
      castX: 485,
      castY: 445,
      diff: { label: '6 Lần Canh (Hoàng Kim)' }
    };
    
    // Gắn giao diện Audition
    ws.mountVerticalAuditionBar();
  });
  await page.waitForTimeout(800);

  // Kiểm tra số sao hiển thị trên thanh audition (phải có đủ 6 ngôi sao)
  const auditionCardInfo = await page.evaluate(() => {
    const auditionEl = document.getElementById('onmap-fishing-audition');
    const stars = auditionEl?.querySelectorAll('.onmap-audition-star') || [];
    const earnedStars = auditionEl?.querySelectorAll('.onmap-audition-star.earned') || [];
    const fishName = auditionEl?.querySelector('.onmap-audition-fish-preview')?.innerText || '';
    const diffText = auditionEl?.querySelector('.onmap-audition-diff-pill')?.innerText || '';
    return {
      auditionExists: Boolean(auditionEl),
      totalStars: stars.length,
      earnedStars: earnedStars.length,
      fishName,
      diffText
    };
  });
  console.log('Thông tin Audition Cá Rồng Hoàng Kim:', auditionCardInfo);
  assert.equal(auditionCardInfo.auditionExists, true);
  assert.equal(auditionCardInfo.totalStars, 6, 'Phải hiển thị chuẩn xác 6 ngôi sao cho Cá Rồng Hoàng Kim');
  assert.equal(auditionCardInfo.earnedStars, 2, 'Đã đạt 2/6 ngôi sao');
  assert.ok(auditionCardInfo.diffText.includes('6 Lần Canh'), 'Nhãn độ khó phải hiển thị 6 Lần Canh');

  // Chụp ảnh bằng chứng thanh audition 6 sao của Cá Rồng Hoàng Kim
  const screenshotAuditionPath = path.join(artifactDir, 'verified_golden_dragon_fish_6_stars.png');
  await page.screenshot({ path: screenshotAuditionPath });
  console.log(`✓ Đã chụp ảnh thanh audition Cá Rồng 6 sao: ${screenshotAuditionPath}`);

  // Test tiếp: Kéo thành công cá lên bờ và kiểm tra Thẻ Mừng Thần Thoại + Thưởng x2 Cá
  console.log('Thực hiện câu hoàn tất Cá Rồng Hoàng Kim...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.onMapFishingState.currentHits = 6;
    ws.completeOnMapFishingCatch();
  });
  await page.waitForTimeout(1000);

  const celebrationInfo = await page.evaluate(() => {
    const card = document.getElementById('onmap-catch-visual-card');
    const ribbon = card?.querySelector('.double-catch-ribbon');
    const title = card?.querySelector('.magic-ribbon-title');
    return {
      cardExists: Boolean(card),
      hasDoubleCatchRibbon: Boolean(ribbon),
      ribbonText: ribbon?.innerText || '',
      isMagicCard: card?.classList.contains('rare-fish-magic-celebration'),
      titleText: title?.innerText || ''
    };
  });
  console.log('Thông tin thẻ ăn mừng:', celebrationInfo);
  assert.equal(celebrationInfo.cardExists, true, 'Thẻ ăn mừng phải xuất hiện');
  assert.equal(celebrationInfo.isMagicCard, true, 'Phải dùng giao diện Magic thần thoại');
  assert.equal(celebrationInfo.hasDoubleCatchRibbon, true, 'Phải có dải ruy băng x2 cá');

  // Chụp ảnh thẻ ăn mừng Cá Rồng Hoàng Kim x2 cá
  const screenshotCatchPath = path.join(artifactDir, 'verified_golden_dragon_fish_double_catch.png');
  await page.screenshot({ path: screenshotCatchPath });
  console.log(`✓ Đã chụp ảnh thẻ ăn mừng Cá Rồng Hoàng Kim x2 cá: ${screenshotCatchPath}`);

  await browser.close();
  console.log('🎉 XÁC MINH CÂU CÁ MỚI KHÓ BẮT VÀ NHÂN ĐÔI CÁ THÀNH CÔNG 100%!');
}

testHarderFishCatch().catch(err => {
  console.error('❌ Lỗi kiểm thử Cá Mới Khó Bắt:', err);
  process.exit(1);
});
