import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('🚀 Bắt đầu kiểm thử: Thu nhỏ con bướm 50% & Bỏ bảng sẵn sàng ở tất cả các maps...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Đóng dialog chọn nhân vật nếu có
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
  });

  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

  // ==========================================
  // PHẦN 1: KIỂM TRA BƯỚM THU NHỎ 50% (19x19)
  // ==========================================
  console.log('\n--- [Test 1] Kiểm tra kích thước bướm trên Map 1 (Làng Quê Yên Bình) ---');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    if (ws) {
      ws.scene.restart({ mapId: 'map1' });
    }
  });
  await page.waitForTimeout(2000);

  const butterflyInfo = await page.evaluate(() => {
    const ws = window.__worldScene;
    const bList = ws.butterflies || [];
    return {
      count: bList.length,
      sizes: bList.map(b => ({
        displayWidth: b.sprite?.displayWidth,
        displayHeight: b.sprite?.displayHeight,
        shadowRadiusX: b.shadow?.radiusX || (b.shadow?.geom ? b.shadow.geom.radiusX : null),
        shadowRadiusY: b.shadow?.radiusY || (b.shadow?.geom ? b.shadow.geom.radiusY : null)
      }))
    };
  });

  console.log('Thông tin bướm trên Map 1:', butterflyInfo);
  assert.ok(butterflyInfo.count >= 2, `Cần ít nhất 2 con bướm, tìm thấy ${butterflyInfo.count}`);
  butterflyInfo.sizes.forEach((s, idx) => {
    assert.strictEqual(s.displayHeight, 19, `Bướm #${idx} chiều cao phải là 19px (50% của 38px), thực tế: ${s.displayHeight}`);
    assert.ok(s.displayWidth <= 19 && s.displayWidth >= 4.5, `Bướm #${idx} chiều rộng phải co giãn theo cánh vẫy trong khoảng 4.75px - 19px, thực tế: ${s.displayWidth}`);
  });
  console.log('✓ Bướm đã được thu nhỏ chính xác 50% (19x19 px so với gốc 38x38 px)!');

  await page.screenshot({ path: path.join(artifactDir, 'verified_butterfly_scaled_down_50_percent.png') });
  console.log('✓ Đã lưu ảnh minh chứng bướm: verified_butterfly_scaled_down_50_percent.png');

  // ==============================================================
  // PHẦN 2: KIỂM TRA BỎ HOÀN TOÀN BẢNG SẴN SÀNG Ở TẤT CẢ CÁC MAPS
  // ==============================================================
  console.log('\n--- [Test 2] Kiểm tra khi chạm trán Nấm Con Vui Vẻ: Vào thẳng sàn đấu, KHÔNG hiện bảng Bé Sẵn Sàng ---');
  const encounterResult = await page.evaluate(() => {
    const ws = window.__worldScene;
    const monster = ws.monsters?.[0]; // Nấm Con Vui Vẻ
    const monsterData = monster?.data || {
      id: 'enc_map1_1',
      name: 'Nấm Con Vui Vẻ',
      questionId: 'q_z1_01'
    };

    // Gọi trigger chạm trán
    ws.triggerEncounterPrompt(monsterData, false);

    const promptModal = document.getElementById('encounter-prompt-modal');
    const arenaModal = document.getElementById('battle-arena-modal');

    return {
      promptHidden: promptModal?.hidden,
      promptDisplay: promptModal ? getComputedStyle(promptModal).display : null,
      arenaHidden: arenaModal?.hidden,
      arenaDisplay: arenaModal ? getComputedStyle(arenaModal).display : null,
      arenaMonsterName: document.getElementById('arena-monster-name')?.textContent
    };
  });

  console.log('Kết quả kiểm tra chạm trán Nấm Con:', encounterResult);
  assert.strictEqual(encounterResult.promptDisplay, 'none', 'Bảng sẵn sàng (encounter-prompt-modal) phải bị ẩn hoàn toàn (display: none)!');
  assert.strictEqual(encounterResult.arenaHidden, false, 'Sàn đấu phải mở thẳng trực tiếp không qua bảng trung gian!');

  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artifactDir, 'verified_no_ready_board_direct_battle.png') });
  console.log('✓ Đã lưu ảnh minh chứng đấu trường trực tiếp: verified_no_ready_board_direct_battle.png');

  // Đóng sàn đấu để kiểm tra map tiếp theo
  await page.evaluate(() => {
    window.__battleArenaModal?.closeArena();
  });
  await page.waitForTimeout(800);

  // ==============================================================
  // PHẦN 3: KIỂM TRA BOSS MAP 4 (Thần Nhân Sư) - KHÔNG HIỆN BẢNG SẴN SÀNG
  // ==============================================================
  console.log('\n--- [Test 3] Kiểm tra Boss Map 4 (Thần Nhân Sư): Vào thẳng Đại Thử Thách, KHÔNG hiện bảng Bé Sẵn Sàng ---');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    if (ws) {
      ws.scene.restart({ mapId: 'map4' });
    }
  });
  await page.waitForTimeout(2000);

  const bossEncounterResult = await page.evaluate(() => {
    const ws = window.__worldScene;
    const bossData = ws.mapConfig?.boss || {
      id: 'boss_map4',
      name: 'Thần Nhân Sư',
      isBoss: true
    };

    ws.triggerEncounterPrompt(bossData, true);

    const promptModal = document.getElementById('encounter-prompt-modal');
    const arenaModal = document.getElementById('battle-arena-modal');

    return {
      promptDisplay: promptModal ? getComputedStyle(promptModal).display : null,
      arenaHidden: arenaModal?.hidden,
      arenaTitle: document.getElementById('arena-title-banner')?.textContent
    };
  });

  console.log('Kết quả kiểm tra Boss Map 4:', bossEncounterResult);
  assert.strictEqual(bossEncounterResult.promptDisplay, 'none', 'Boss Map 4: Bảng sẵn sàng phải bị ẩn hoàn toàn!');
  assert.strictEqual(bossEncounterResult.arenaHidden, false, 'Boss Map 4: Đấu trường phải mở trực tiếp!');

  await page.screenshot({ path: path.join(artifactDir, 'verified_boss_no_ready_board_direct_battle.png') });
  console.log('✓ Đã lưu ảnh minh chứng Boss đấu trường: verified_boss_no_ready_board_direct_battle.png');

  console.log('\n🎉 TOÀN BỘ KIỂM THỬ THU NHỎ BƯỚM 50% VÀ BỎ BẢNG SẴN SÀNG ĐÃ ĐẠT 100%!');
  await browser.close();
}

runTest().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
