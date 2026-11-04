const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const fileUrl = 'file:///' + path.resolve('game.html').replace(/\\/g, '/');
  await page.goto(fileUrl);

  const moth = { id: 'enc_map3_2', name: 'Bướm Đêm', spriteKey: 'mon_crystal_moth' };
  await page.evaluate((m) => {
    window.__battleArenaModal.openArena(m);
  }, moth);

  const arenaImg = await page.$('#arena-monster-img');
  await arenaImg.screenshot({ path: 'scratch/actual_arena_moth_idle.png' });

  // Now trigger monster attack preview
  await page.evaluate(() => {
    window.__battleArenaModal.executeMonsterAttack(true);
  });
  await page.waitForTimeout(100);
  await arenaImg.screenshot({ path: 'scratch/actual_arena_moth_attack.png' });

  // Take full stage screenshot during attack
  const stage = await page.$('.arena-fighters-stage');
  await stage.screenshot({ path: 'scratch/actual_arena_stage_attack.png' });

  await page.waitForTimeout(600); // after impact
  await stage.screenshot({ path: 'scratch/actual_arena_stage_after_impact.png' });

  await browser.close();
  console.log('Saved moth idle and attack screenshots');
})();
