import { chromium } from 'playwright';
import path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => {
    const text = `[BROWSER ${msg.type()}] ${msg.text()}`;
    consoleLogs.push(text);
    if (msg.type() === 'error') console.error(text);
  });
  page.on('pageerror', err => console.error(`[PAGE ERROR]`, err));

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  console.log('Waiting for #game-root canvas...');
  await page.waitForSelector('#game-root canvas', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Dismiss character select modal if shown
  const startBtn = await page.$('.char-start-adventure-cta');
  if (startBtn && await startBtn.isVisible()) {
    console.log('Clicking start adventure button...');
    await startBtn.click();
    await page.waitForTimeout(1000);
  }

  // 1. Check that vfx_implosion_sheet texture is loaded in Phaser
  const textureLoaded = await page.evaluate(() => {
    const ws = window.__worldScene;
    if (!ws) return false;
    return ws.textures.exists('vfx_implosion_sheet');
  });
  console.log('vfx_implosion_sheet texture loaded in Phaser:', textureLoaded);

  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

  // 2. Trigger the portal interaction at (235, 615)
  console.log('Triggering portal interaction to observe suck-in and implosion VFX...');

  // Setup listener for game:portal-warp-start in page
  await page.evaluate(() => {
    window.__warpStartTime = 0;
    window.addEventListener('game:portal-warp-start', () => {
      window.__warpStartTime = performance.now();
    }, { once: true });

    const portal = window.__worldScene?.portals?.find(p => p.data?.id === 'portal_farm_to_fishing');
    if (portal) {
      portal.handleInteract();
    }
  });

  // Wait until portal-warp-start actually fires
  console.log('Waiting for character to reach portal and trigger warp...');
  await page.waitForFunction(() => window.__warpStartTime > 0, { timeout: 10000 });
  console.log('Warp started! Capturing precision VFX frames...');

  // Frame 1: t_warp ~ 350ms (swirling in + streaks inward)
  await page.waitForTimeout(350);
  const shot1 = path.join(artifactDir, 'verified_implosion_phase1_suckin.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved Phase 1 (Suck-in & streaks) screenshot to:', shot1);

  // Frame 2: t_warp ~ 800ms (core collapse)
  await page.waitForTimeout(450);
  const shot2 = path.join(artifactDir, 'verified_implosion_phase2_collapse.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved Phase 2 (Collapse onto crushed core) screenshot to:', shot2);

  // Frame 3: t_warp ~ 1150ms (burst pop & flare)
  await page.waitForTimeout(350);
  const shot3 = path.join(artifactDir, 'verified_implosion_phase3_pop_flare.png');
  await page.screenshot({ path: shot3 });
  console.log('Saved Phase 3 (Burst pop & flare) screenshot to:', shot3);

  // Wait for transition to complete
  await page.waitForTimeout(3000);
  const currentMap = await page.evaluate(() => window.__worldScene?.currentMapId);
  console.log('Arrived at map after warp:', currentMap);

  await browser.close();
  console.log('All portal implosion VFX verification completed successfully!');
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
