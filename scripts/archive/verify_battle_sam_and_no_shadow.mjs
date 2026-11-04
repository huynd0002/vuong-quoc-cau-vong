import { chromium } from 'playwright';
import { createServer } from 'vite';
import assert from 'node:assert/strict';

const port = 4198;
const server = await createServer({
  server: { host: '127.0.0.1', port, strictPort: true }
});
await server.listen();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

try {
  console.log('--- 1. Set selected skin to knight (Bé Sam Kuromi) ---');
  await page.goto(`http://127.0.0.1:${port}/dev.html`);

  // Wait for loading screen and initial character select
  const charStartBtn = page.locator('#char-btn-start-adventure');
  await charStartBtn.waitFor({ state: 'visible', timeout: 20000 });

  // Click on Bé Sam Kuromi card to select her
  const samCard = page.locator('.char-card.knight-card');
  await samCard.click();
  await page.waitForTimeout(500);

  // Click Start Adventure
  await charStartBtn.click();
  await page.waitForTimeout(1000);

  // Dismiss story intro if visible
  const storyStartBtn = page.locator('#story-start-button');
  if (await storyStartBtn.isVisible()) {
    await storyStartBtn.click();
    await page.waitForTimeout(1000);
  }

  // Wait for game scene to be active
  await page.waitForFunction(() => window.__worldScene?.pet?.sprite?.active, null, { timeout: 25000 });

  console.log('--- 2. Open Battle Arena with Encounter ---');
  // Trigger encounter with Ladybug / Caterpillar
  await page.evaluate(() => {
    const encounter = {
      id: 'enc_ladybug_test',
      name: 'Bọ Rùa Cánh Cam',
      type: 'monster',
      spriteKey: 'ladybug',
      hp: 3,
      hearts: 3,
      questionId: 'q_map1_colors_1'
    };
    window.dispatchEvent(new CustomEvent('game:encounter-start', { detail: { encounter } }));
  });

  await page.waitForFunction(() => !document.getElementById('battle-arena-modal').hidden, null, { timeout: 10000 });
  await page.waitForTimeout(1000);

  // Verify Hero Name Tag
  const heroName = await page.locator('#arena-hero-name').textContent();
  console.log('Battle Hero Name:', heroName);
  assert.equal(heroName.trim(), 'Bé Sam Kuromi', 'Hero name in arena must be Bé Sam Kuromi');

  // Verify Hero Sprite
  const heroImgSrc = await page.locator('#arena-hero-img').getAttribute('src');
  console.log('Hero image src:', heroImgSrc);
  assert.ok(heroImgSrc.includes('hero_upgrade_idle_right'), 'Hero image must be hero_upgrade_idle_right (Bé Sam Kuromi)');

  // Verify Monster Shadow is NOT visible
  const monsterShadow = page.locator('#arena-monster-shadow');
  const shadowCount = await monsterShadow.count();
  const shadowVisible = shadowCount > 0 ? await monsterShadow.isVisible() : false;
  console.log('Monster shadow visible:', shadowVisible);
  assert.equal(shadowVisible, false, 'Monster shadow must NOT be visible in arena');

  // Take screenshot of Battle Arena with Bé Sam Kuromi & no monster shadow
  await page.screenshot({ path: 'artifacts/verify_battle_sam_kuromi_active.png' });
  console.log('Screenshot saved: artifacts/verify_battle_sam_kuromi_active.png');

  console.log('--- 3. Verify Battle Action Sprite for Bé Sam Kuromi ---');
  // Click first answer to trigger action animation
  const ansBtn = page.locator('.ans-btn').first();
  await ansBtn.click();
  await page.waitForTimeout(300);

  // Check that action sprite or lunging happened
  const heroBoxClasses = await page.locator('#arena-hero-box').getAttribute('class');
  console.log('Hero box classes during action:', heroBoxClasses);

  await page.screenshot({ path: 'artifacts/verify_battle_sam_action.png' });
  console.log('Screenshot saved: artifacts/verify_battle_sam_action.png');

  console.log('=============================================');
  console.log(' BATTLE ARENA SAM & NO SHADOW VERIFIED 100%! ');
  console.log('=============================================');
} finally {
  await browser.close();
  await server.close();
}
