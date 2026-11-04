import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testMap4MonstersAndSkills() {
  console.log('[Test] Starting Map 4 Monsters & Skills Verification...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  console.log(`[Test] Loading ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Close modals if any
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });

  // Switch to Map 4
  console.log('[Test] Switching to map4 (Đền Mặt Trời Sa Mạc)...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map4' });
  });
  await page.waitForTimeout(3000);

  // Close story intro modal on Map 4
  await page.evaluate(() => {
    document.getElementById('story-intro-modal')?.remove();
    const btn = document.querySelector('.story-close-btn, #btn-story-continue');
    btn?.click();
  });
  await page.waitForTimeout(1000);

  // Verify Monster info on Map 4
  const monsterInfo = await page.evaluate(() => {
    const ws = window.__worldScene;
    const list = ws.monsters || [];
    return list.map(m => ({
      id: m.data?.id,
      name: m.data?.name,
      spriteKey: m.data?.spriteKey,
      textureKey: m.sprite?.texture?.key,
      animKey: m.sprite?.anims?.currentAnim?.key,
      size: m.size,
      x: m.sprite?.x,
      y: m.sprite?.y
    }));
  });

  console.log('[Test] Map 4 Monsters on field:', JSON.stringify(monsterInfo, null, 2));

  assert.strictEqual(monsterInfo.length, 3, 'Must have 3 monsters on Map 4');
  assert.strictEqual(monsterInfo[0].textureKey, 'mon_desert_fox_walk_sheet', 'Monster 1 must use mon_desert_fox_walk_sheet');
  assert.strictEqual(monsterInfo[1].textureKey, 'mon_scarab_walk_sheet', 'Monster 2 must use mon_scarab_walk_sheet');
  assert.strictEqual(monsterInfo[2].textureKey, 'mon_desert_falcon_walk_sheet', 'Monster 3 must use mon_desert_falcon_walk_sheet');
  assert.ok(monsterInfo.every(m => m.textureKey !== 'mon_sprout_walk_sheet'), 'No monster should fallback to mon_sprout!');

  // Check footer hint text
  const footerHint = await page.evaluate(() => {
    return document.querySelector('.control-hint span:last-child')?.textContent;
  });
  console.log('[Test] Footer hint text:', footerHint);
  assert.ok(!footerHint.includes('bạn Mầm'), 'Footer hint must not say "bạn Mầm" on Map 4');

  // Screenshot Map 4 with 3 desert monsters
  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
  const map4ScreenPath = path.join(artifactDir, 'verified_map4_desert_monsters_fixed.png');
  await page.screenshot({ path: map4ScreenPath });
  console.log('[Test] Captured Map 4 field screenshot at:', map4ScreenPath);

  // Now trigger battle with Cáo Cát Ánh Dương (enc_map4_1)
  console.log('[Test] Triggering battle with Cáo Cát Ánh Dương...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    const fox = ws.monsters[0];
    window.__battleArenaModal.openArena(fox.data);
  });
  await page.waitForTimeout(2000);

  const foxBattleInfo = await page.evaluate(() => {
    const modal = window.__battleArenaModal;
    const enc = modal?.currentEncounter;
    const skill = modal?.getMonsterSkill(enc);
    return {
      isOpen: !modal?.arenaModal?.hidden,
      encounterName: enc?.name,
      monsterSkillName: skill?.name,
      monsterSkillBadge: skill?.badge,
      monsterElement: skill?.element
    };
  });
  console.log('[Test] Fox Battle Info:', foxBattleInfo);
  assert.strictEqual(foxBattleInfo.isOpen, true, 'Battle Arena must be open');
  assert.ok(foxBattleInfo.monsterSkillName.includes('Hồ Ly Kim Cát'), 'Skill must be Hồ Ly Kim Cát');
  assert.strictEqual(foxBattleInfo.monsterElement, 'sand', 'Element must be sand');

  const arenaFoxScreenPath = path.join(artifactDir, 'verified_arena_map4_fox_skill.png');
  await page.screenshot({ path: arenaFoxScreenPath });
  console.log('[Test] Captured Fox Arena screenshot at:', arenaFoxScreenPath);

  // Close battle modal
  await page.evaluate(() => {
    window.__battleArenaModal?.closeArena();
  });
  await page.waitForTimeout(1000);

  // Now trigger battle with Boss Thần Nhân Sư Ánh Dương
  console.log('[Test] Triggering battle with Boss Thần Nhân Sư...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    const boss = ws.boss;
    window.__battleArenaModal.openArena(boss.data);
  });
  await page.waitForTimeout(2000);

  const sphinxBattleInfo = await page.evaluate(() => {
    const modal = window.__battleArenaModal;
    const enc = modal?.currentEncounter;
    const skill = modal?.getMonsterSkill(enc);
    return {
      isOpen: !modal?.arenaModal?.hidden,
      encounterName: enc?.name,
      monsterSkillName: skill?.name,
      monsterSkillBadge: skill?.badge,
      monsterElement: skill?.element
    };
  });
  console.log('[Test] Sphinx Boss Battle Info:', sphinxBattleInfo);
  assert.strictEqual(sphinxBattleInfo.isOpen, true, 'Battle Arena must be open for Boss');
  assert.ok(sphinxBattleInfo.monsterSkillName.includes('Thái Dương Thần Uy'), 'Boss skill must be Thái Dương Thần Uy');
  assert.strictEqual(sphinxBattleInfo.monsterElement, 'desert_sun', 'Boss element must be desert_sun');

  const arenaSphinxScreenPath = path.join(artifactDir, 'verified_arena_map4_sphinx_boss.png');
  await page.screenshot({ path: arenaSphinxScreenPath });
  console.log('[Test] Captured Sphinx Arena screenshot at:', arenaSphinxScreenPath);

  await browser.close();
  console.log('✅ ALL MAP 4 MONSTERS AND SKILLS TESTS PASSED 100%!');
}

testMap4MonstersAndSkills().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
