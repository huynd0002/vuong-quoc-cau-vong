// src/tests/browser/verifyPetFarmHUD.test.js
import { chromium } from 'playwright';
import path from 'path';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('Navigating to game...');
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });

  // 1. Initial Screen: click "BẮT ĐẦU PHIÊU LƯU" if visible
  try {
    const startAdventureBtn = page.locator('#char-btn-start-adventure');
    if (await startAdventureBtn.isVisible({ timeout: 2500 })) {
      await startAdventureBtn.click();
      console.log('Clicked start adventure button');
      await page.waitForTimeout(1000);
    }
  } catch (e) {}

  // Also check if character modal or story modal is open
  await page.evaluate(() => {
    const charModal = document.getElementById('character-select-modal');
    if (charModal) charModal.style.display = 'none';
    const storyModal = document.getElementById('story-intro-modal');
    if (storyModal) storyModal.hidden = true;
  });

  // Check map1: #pet-farm-hud should be HIDDEN
  const hud = page.locator('#pet-farm-hud');
  const isVisibleOnMap1 = await hud.isVisible();
  console.log('HUD visible on Map 1?', isVisibleOnMap1);
  if (isVisibleOnMap1) {
    throw new Error('Pet Farm HUD should NOT be visible on Map 1!');
  }

  // 2. Go to map_pet_farm
  console.log('Traveling to map_pet_farm...');
  await page.evaluate(() => {
    const btn = document.getElementById('btn-quick-pet-farm');
    if (btn) btn.click();
  });

  // Wait for map_pet_farm to load and storyIntro to close if any
  await page.waitForTimeout(2500);

  // Close story intro if shown
  try {
    const storyClose = page.locator('#story-intro-close');
    if (await storyClose.isVisible({ timeout: 1500 })) {
      await storyClose.click();
      console.log('Closed story intro');
      await page.waitForTimeout(500);
    }
  } catch (e) {}

  await page.evaluate(() => {
    const storyModal = document.getElementById('story-intro-modal');
    if (storyModal) storyModal.hidden = true;
    const charModal = document.getElementById('character-select-modal');
    if (charModal) charModal.style.display = 'none';
  });

  // 3. Verify HUD is now visible on map_pet_farm
  const isVisibleOnFarm = await hud.isVisible();
  console.log('HUD visible on map_pet_farm?', isVisibleOnFarm);
  if (!isVisibleOnFarm) {
    throw new Error('Pet Farm HUD MUST be visible on map_pet_farm!');
  }

  // Check all 5 gauges
  const hungerPct = await page.locator('#pct-hunger').innerText();
  const thirstPct = await page.locator('#pct-thirst').innerText();
  const cleanPct = await page.locator('#pct-clean').innerText();
  const funPct = await page.locator('#pct-fun').innerText();
  const energyPct = await page.locator('#pct-energy').innerText();

  console.log('Gauge Values:', {
    hungerPct,
    thirstPct,
    cleanPct,
    funPct,
    energyPct
  });

  // Verify format e.g. "100%" or "80%"
  if (!hungerPct.includes('%') || !thirstPct.includes('%') || !cleanPct.includes('%') || !funPct.includes('%') || !energyPct.includes('%')) {
    throw new Error('Gauge values must display percentages with % sign!');
  }

  // 4. Test clicking on a gauge
  console.log('Testing gauge click interaction (feed)...');
  await page.locator('#gauge-hunger').click();
  await page.waitForTimeout(1000);

  // Take screenshot of pet farm with circular gauges in the top-right
  const artifactPath = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_pet_farm_circular_gauges.png');
  await page.screenshot({ path: artifactPath });
  console.log('Saved screenshot to:', artifactPath);

  // 5. Test returning to map1 and ensuring HUD hides
  console.log('Testing return to map1...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    if (scene) {
      scene.scene.restart({ mapId: 'map1' });
    }
  });
  await page.waitForTimeout(2000);

  const isVisibleAfterReturn = await hud.isVisible();
  console.log('HUD visible after returning to map1?', isVisibleAfterReturn);
  if (isVisibleAfterReturn) {
    throw new Error('Pet Farm HUD should be hidden after leaving map_pet_farm!');
  }

  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  await browser.close();
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
