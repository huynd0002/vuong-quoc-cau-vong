import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('[Test] Starting Completed Maps Replay Verification...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Boss') || text.includes('quái') || text.includes('XUẤT HIỆN') || text.includes('hoàn thành')) {
      console.log('BROWSER:', text);
    }
  });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  console.log(`[Test] Loading ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Close character select modal if open
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
  });

  // STEP 1: Simulate that Map 1 was previously completed
  console.log('[Test] Setting up save state: Map 1 is COMPLETED, all monsters & boss previously rescued...');
  await page.evaluate(() => {
    const sa = window.__saveAdapter;
    const state = sa.load();
    state.campaign = state.campaign || {};
    state.campaign.completedMaps = ['map1'];
    state.campaign.unlockedMaps = ['map1', 'map2'];
    state.campaign.rescuedFriends = {
      enc_map1_1: { rescuedAt: 1000 },
      enc_map1_2: { rescuedAt: 2000 },
      enc_map1_3: { rescuedAt: 2500 },
      boss_map1: { name: 'Nấm Mũ Đỏ Khổng Lồ', rescuedAt: 3000 }
    };
    state.campaign.bossDeathPositions = {
      boss_map1: { x: 960, y: 360 }
    };
    sa.save(state);
  });

  // STEP 2: Go to Map 2 first
  console.log('[Test] Traveling to Map 2...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map2' });
  });
  await page.waitForTimeout(1500);

  const onMap2 = await page.evaluate(() => window.__currentMapId === 'map2');
  assert.strictEqual(onMap2, true, 'Should be on Map 2');

  // STEP 3: Return to Map 1 (completed map)
  console.log('[Test] Returning back to Map 1 (completed map)...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map1' });
  });
  await page.waitForTimeout(1500);

  // Verify Map 1 state: all 3 monsters must be ALIVE, boss must be HIDDEN, exit portal must be CLOSED
  const map1ReplayState = await page.evaluate(() => {
    const ws = window.__worldScene;
    return {
      currentMapId: ws.currentMapId,
      monstersCount: ws.monsters.length,
      allMonstersActive: ws.monsters.every(m => m.sprite && m.sprite.active && !m.isRescued),
      bossExists: Boolean(ws.boss),
      bossAppeared: ws.boss?.isAppeared,
      bossVisible: ws.boss?.sprite?.visible,
      teleportPortalExists: Boolean(ws.teleportPortal)
    };
  });

  console.log('[Test] Map 1 Replay State:', map1ReplayState);
  assert.strictEqual(map1ReplayState.currentMapId, 'map1');
  assert.strictEqual(map1ReplayState.monstersCount, 3, 'Map 1 should have 3 monsters respawned');
  assert.strictEqual(map1ReplayState.allMonstersActive, true, 'All monsters must be active and not rescued');
  assert.strictEqual(map1ReplayState.bossExists, true, 'Boss entity must exist');
  assert.strictEqual(map1ReplayState.bossAppeared, false, 'Boss must not have appeared yet');
  assert.strictEqual(map1ReplayState.bossVisible, false, 'Boss must be hidden');
  assert.strictEqual(map1ReplayState.teleportPortalExists, false, 'Exit portal must be closed initially');

  // Take screenshot of reloaded Map 1 with active monsters
  const screenshot1 = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_map1_replayed_from_beginning.png';
  await page.screenshot({ path: screenshot1 });
  console.log(`[Test] Screenshot saved: ${screenshot1}`);

  // STEP 4: Defeat small monster 1 and 2
  console.log('[Test] Defeating small monsters 1 and 2...');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:encounter-resolved', { detail: { encounterId: 'enc_map1_1' } }));
    window.dispatchEvent(new CustomEvent('game:encounter-resolved', { detail: { encounterId: 'enc_map1_2' } }));
  });
  await page.waitForTimeout(500);

  const afterMonsters1and2 = await page.evaluate(() => {
    const ws = window.__worldScene;
    return {
      m1Rescued: ws.monsters.find(m => m.data.id === 'enc_map1_1')?.isRescued,
      m2Rescued: ws.monsters.find(m => m.data.id === 'enc_map1_2')?.isRescued,
      bossAppeared: ws.boss?.isAppeared
    };
  });
  assert.strictEqual(afterMonsters1and2.m1Rescued, true, 'Monster 1 should be rescued');
  assert.strictEqual(afterMonsters1and2.m2Rescued, true, 'Monster 2 should be rescued');
  assert.strictEqual(afterMonsters1and2.bossAppeared, false, 'Boss should still be hidden after 2 monsters');

  // STEP 5: Defeat small monster 3 (all 3 small monsters cleared) -> Boss must appear!
  console.log('[Test] Defeating small monster 3 (all 3 monsters cleared)...');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:encounter-resolved', {
      detail: { encounterId: 'enc_map1_3' }
    }));
  });
  await page.waitForTimeout(1000);

  const afterMonster3 = await page.evaluate(() => {
    const ws = window.__worldScene;
    return {
      m3Rescued: ws.monsters.find(m => m.data.id === 'enc_map1_3')?.isRescued,
      bossAppeared: ws.boss?.isAppeared,
      bossVisible: ws.boss?.sprite?.visible
    };
  });
  console.log('[Test] After Monster 3:', afterMonster3);
  assert.strictEqual(afterMonster3.m3Rescued, true, 'Monster 3 should be rescued');
  assert.strictEqual(afterMonster3.bossAppeared, true, 'Boss must appear once all small monsters are defeated');
  assert.strictEqual(afterMonster3.bossVisible, true, 'Boss sprite must be visible');

  // STEP 6: Defeat the Boss -> Portal must appear!
  console.log('[Test] Defeating the Boss...');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:boss-resolved', {
      detail: {
        bossName: 'Nấm Mũ Đỏ Khổng Lồ',
        reward: { stars: 3, exp: 30 },
        unlockedNewMap: 'map2'
      }
    }));
  });
  await page.waitForTimeout(1500);

  const afterBoss = await page.evaluate(() => {
    const ws = window.__worldScene;
    return {
      portalExists: Boolean(ws.teleportPortal),
      portalVisible: ws.teleportPortal?.sprite?.visible
    };
  });
  console.log('[Test] After Boss defeated:', afterBoss);
  assert.strictEqual(afterBoss.portalExists, true, 'Exit Teleport Portal must appear after boss defeat');
  assert.strictEqual(afterBoss.portalVisible, true, 'Exit Teleport Portal must be visible');

  // Take screenshot of Boss defeated and Teleport Portal spawned
  const screenshot2 = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_boss_defeated_portal_spawned.png';
  await page.screenshot({ path: screenshot2 });
  console.log(`[Test] Screenshot saved: ${screenshot2}`);

  // STEP 7: Re-enter Map 1 again via "Chơi lại" in MapSelectModal
  console.log('[Test] Testing re-entry from MapSelectModal (Chơi lại)...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map1' });
  });
  await page.waitForTimeout(1500);

  const reEnterState = await page.evaluate(() => {
    const ws = window.__worldScene;
    return {
      allMonstersActive: ws.monsters.every(m => m.sprite && m.sprite.active && !m.isRescued),
      bossAppeared: ws.boss?.isAppeared,
      portalExists: Boolean(ws.teleportPortal)
    };
  });
  console.log('[Test] Re-entry state:', reEnterState);
  assert.strictEqual(reEnterState.allMonstersActive, true, 'On re-entering again, monsters must respawn');
  assert.strictEqual(reEnterState.bossAppeared, false, 'On re-entering again, boss must be hidden');
  assert.strictEqual(reEnterState.portalExists, false, 'On re-entering again, portal must be closed');

  await browser.close();
  console.log('✅ ALL COMPLETED MAP REPLAY TESTS PASSED SUCCESSFULLY!');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
