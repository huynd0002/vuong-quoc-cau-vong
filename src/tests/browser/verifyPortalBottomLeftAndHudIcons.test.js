import { chromium } from 'playwright';
import path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.error(`[PAGE ERROR]`, err));

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  // Wait for canvas or WorldScene ready
  console.log('Waiting for #game-root canvas...');
  await page.waitForSelector('#game-root canvas', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // If character select dialog appears, click start
  const startBtn = await page.$('.char-start-adventure-cta');
  if (startBtn && await startBtn.isVisible()) {
    console.log('Clicking start adventure button...');
    await startBtn.click();
    await page.waitForTimeout(1500);
  }

  // Take screenshot of map_pet_farm showing the new portal position and HUD
  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
  const fullShotPath = path.join(artifactDir, 'verified_new_portal_bottom_left.png');
  await page.screenshot({ path: fullShotPath });
  console.log('Saved full screenshot to:', fullShotPath);

  // Take zoomed screenshot of the Pet HUD gauges
  const petHudElement = await page.$('#pet-farm-hud-card');
  if (petHudElement) {
    const hudShotPath = path.join(artifactDir, 'verified_shrunk_hud_icons_and_ring.png');
    await petHudElement.screenshot({ path: hudShotPath });
    console.log('Saved Pet HUD screenshot to:', hudShotPath);
  } else {
    console.warn('#pet-farm-hud-card element not found!');
  }

  // Check portal coordinates in WorldScene
  const portalInfo = await page.evaluate(() => {
    const ws = window.__worldScene;
    if (!ws) return { error: 'no worldScene' };
    const portals = ws.portals?.map(p => ({
      id: p.data?.id,
      name: p.data?.name,
      x: p.x,
      y: p.y,
      targetMapId: p.targetMapId
    }));
    return {
      currentMapId: ws.currentMapId,
      portals
    };
  });
  console.log('Portal Info from game:', JSON.stringify(portalInfo, null, 2));

  // Test clicking the newly moved portal at (235, 615)
  console.log('Testing click on new portal...');
  const canvas = await page.$('#game-root canvas');
  const box = await canvas.boundingBox();
  if (box) {
    // Map coords (235, 615) converted to canvas scale
    const clickX = box.x + (235 / 1280) * box.width;
    const clickY = box.y + (615 / 720) * box.height;
    await page.mouse.click(clickX, clickY);
    console.log('Clicked portal at screen coords:', clickX, clickY);
    // Wait for warp / transition
    await page.waitForTimeout(3500);
    const newMapId = await page.evaluate(() => window.__worldScene?.currentMapId);
    console.log('Map after clicking portal:', newMapId);
    const warpShotPath = path.join(artifactDir, 'verified_warp_to_fishing_pond.png');
    await page.screenshot({ path: warpShotPath });
    console.log('Saved warp transition screenshot to:', warpShotPath);
  }

  await browser.close();
  console.log('Done verification!');
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
