import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testBossAppearance() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Boss') || text.includes('XUẤT HIỆN') || text.includes('quái')) {
      console.log('BROWSER:', text);
    }
  });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  console.log(`[Test] Loading ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Remove character select modal if present
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
  });

  // Ensure fresh clean state on Map 1
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map1' });
  });
  await page.waitForTimeout(1500);

  // Check initial state on Map 1
  const initialState = await page.evaluate(() => {
    const ws = window.__worldScene;
    return {
      monstersCount: ws.monsters.length,
      monsterIds: ws.monsters.map(m => m.data.id),
      bossExists: Boolean(ws.boss),
      bossAppeared: ws.boss?.isAppeared,
      bossVisible: ws.boss?.sprite?.visible
    };
  });

  console.log('[Test] Initial State on Map 1:', initialState);
  assert.strictEqual(initialState.monstersCount, 3, 'Map 1 phải có đúng 3 quái nhỏ');
  assert.strictEqual(initialState.bossAppeared, false, 'Boss lớn phải ẩn khi chưa tiêu diệt quái nhỏ');
  assert.strictEqual(initialState.bossVisible, false, 'Sprite của Boss lớn không được hiển thị');

  // Step 1: Defeat 1st monster (enc_map1_1)
  console.log('\n[Test] Tiêu diệt quái nhỏ thứ 1 (enc_map1_1)...');
  await page.evaluate((id) => {
    window.dispatchEvent(new CustomEvent('game:encounter-resolved', {
      detail: { encounterId: id }
    }));
  }, 'enc_map1_1');
  await page.waitForTimeout(1000);

  let stateAfter1 = await page.evaluate(() => {
    const ws = window.__worldScene;
    return {
      bossAppeared: ws.boss?.isAppeared,
      bossVisible: ws.boss?.sprite?.visible
    };
  });
  console.log('[Test] Trạng thái sau khi hạ 1/3 quái nhỏ:', stateAfter1);
  assert.strictEqual(stateAfter1.bossAppeared, false, 'Sau khi hạ 1/3 quái nhỏ, Boss VẪN PHẢI ẨN!');
  assert.strictEqual(stateAfter1.bossVisible, false, 'Sau khi hạ 1/3 quái nhỏ, Sprite Boss KHÔNG ĐƯỢC HIỂN THỊ!');

  // Step 2: Defeat 2nd monster (enc_map1_2)
  console.log('\n[Test] Tiêu diệt quái nhỏ thứ 2 (enc_map1_2)...');
  await page.evaluate((id) => {
    window.dispatchEvent(new CustomEvent('game:encounter-resolved', {
      detail: { encounterId: id }
    }));
  }, 'enc_map1_2');
  await page.waitForTimeout(1000);

  let stateAfter2 = await page.evaluate(() => {
    const ws = window.__worldScene;
    return {
      bossAppeared: ws.boss?.isAppeared,
      bossVisible: ws.boss?.sprite?.visible
    };
  });
  console.log('[Test] Trạng thái sau khi hạ 2/3 quái nhỏ:', stateAfter2);
  assert.strictEqual(stateAfter2.bossAppeared, false, 'Sau khi hạ 2/3 quái nhỏ (vẫn còn 1 quái), Boss VẪN PHẢI ẨN!');
  assert.strictEqual(stateAfter2.bossVisible, false, 'Sau khi hạ 2/3 quái nhỏ, Sprite Boss KHÔNG ĐƯỢC HIỂN THỊ!');

  // Step 3: Defeat 3rd monster (enc_map1_3) - THE LAST ONE!
  console.log('\n[Test] Tiêu diệt quái nhỏ cuối cùng thứ 3 (enc_map1_3)...');
  await page.evaluate((id) => {
    window.dispatchEvent(new CustomEvent('game:encounter-resolved', {
      detail: { encounterId: id }
    }));
  }, 'enc_map1_3');

  // Wait for cinematic sequence (900ms delay + 850ms tween)
  console.log('[Test] Đợi hiệu ứng xuất hiện của Boss...');
  await page.waitForTimeout(2200);

  let stateAfter3 = await page.evaluate(() => {
    const ws = window.__worldScene;
    return {
      bossAppeared: ws.boss?.isAppeared,
      bossVisible: ws.boss?.sprite?.visible,
      bossScale: ws.boss?.sprite?.scaleX
    };
  });
  console.log('[Test] Trạng thái sau khi hạ HẾT 3/3 quái nhỏ:', stateAfter3);
  assert.strictEqual(stateAfter3.bossAppeared, true, 'KHI ĐÃ TIÊU DIỆT HẾT TẤT CẢ QUÁI NHỎ, BOSS LỚN PHẢI XUẤT HIỆN!');
  assert.strictEqual(stateAfter3.bossVisible, true, 'Sprite của Boss lớn phải hiển thị trên màn hình!');
  assert.ok(stateAfter3.bossScale > 0.5, 'Boss phải có kích thước đầy đủ sau cinematic!');

  // Take screenshot
  const screenshotPath = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_boss_appeared_after_all_monsters_defeated.png';
  await page.screenshot({ path: screenshotPath });
  console.log(`[Test] Đã chụp ảnh bằng chứng: ${screenshotPath}`);

  console.log('\n✓ KIỂM THỬ THÀNH CÔNG 100%: Boss lớn CHỈ xuất hiện khi và chỉ khi TẤT CẢ các quái nhỏ đã bị tiêu diệt!');
  await browser.close();
}

testBossAppearance().catch(err => {
  console.error('Test thất bại:', err);
  process.exit(1);
});
