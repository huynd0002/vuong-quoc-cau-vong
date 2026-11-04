import { chromium } from 'playwright';
import path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const htmlPath = 'file:///' + path.resolve('game.html').replace(/\\/g, '/');
  console.log('Opening:', htmlPath);
  await page.goto(htmlPath, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Start adventure & travel to map_pet_farm
  await page.evaluate(() => {
    const startBtn = document.getElementById('char-btn-start-adventure');
    if (startBtn) startBtn.click();
    const charModal = document.getElementById('character-select-modal');
    if (charModal) charModal.style.display = 'none';
    const storyModal = document.getElementById('story-intro-modal');
    if (storyModal) storyModal.hidden = true;
    const btn = document.getElementById('btn-quick-pet-farm');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2500);

  await page.evaluate(() => {
    const storyModal = document.getElementById('story-intro-modal');
    if (storyModal) storyModal.hidden = true;
    const charModal = document.getElementById('character-select-modal');
    if (charModal) charModal.style.display = 'none';
  });

  const hud = page.locator('#pet-farm-hud');
  const isHudVisible = await hud.isVisible();
  console.log('1. HUD visible on pet farm:', isHudVisible);
  if (!isHudVisible) throw new Error('HUD must be visible on pet farm');

  // Verify Level Badge
  const levelText = await page.locator('#pet-hud-level-text').innerText();
  console.log('2. Pet Level Text:', levelText);
  if (!levelText.includes('Cấp')) throw new Error('Level badge missing "Cấp"');

  // Verify Affection (Yêu thương) Column / Bar
  const affectionVal = await page.locator('#pet-hud-affection-val').innerText();
  const affectionTier = await page.locator('#pet-hud-affection-tier').innerText();
  const affectionFillWidth = await page.locator('#pet-hud-bar-affection-fill').evaluate(el => el.style.width);
  console.log('3. Affection (Yêu thương):', { affectionVal, affectionTier, affectionFillWidth });
  if (!affectionVal.includes('%')) throw new Error('Affection val must include %');

  // Verify EXP Column / Bar
  const expVal = await page.locator('#pet-hud-exp-val').innerText();
  const expFillWidth = await page.locator('#pet-hud-bar-exp-fill').evaluate(el => el.style.width);
  console.log('4. EXP:', { expVal, expFillWidth });
  if (!expVal.includes('/')) throw new Error('EXP val must include ratio like 0/30');

  // Test interactive clicks on Level, Affection, and EXP cards
  console.log('5. Testing click interactions...');
  await page.locator('#pet-hud-level-badge').click();
  await page.waitForTimeout(400);

  await page.locator('#pet-hud-card-affection').click();
  await page.waitForTimeout(400);

  await page.locator('#pet-hud-card-exp').click();
  await page.waitForTimeout(400);

  // Take full screenshot
  const fullScreenshotPath = 'artifacts/verify_pet_hud_full.png';
  await page.screenshot({ path: fullScreenshotPath });
  console.log('6. Saved full screenshot to:', fullScreenshotPath);

  // Also take zoomed screenshot of the HUD card
  const hudElement = page.locator('#pet-farm-hud');
  const hudScreenshotPath = 'artifacts/verify_pet_hud_card.png';
  await hudElement.screenshot({ path: hudScreenshotPath });
  console.log('7. Saved HUD card screenshot to:', hudScreenshotPath);

  // Test updating stats dynamically (e.g. via game:pet-updated)
  console.log('8. Testing dynamic stat update with level up...');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:pet-updated', {
      detail: {
        pet: {
          name: 'Bé Cún Vàng',
          type: 'dog',
          level: 2,
          exp: 15,
          affection: 45,
          hunger: 90,
          thirst: 90,
          clean: 90,
          fun: 85,
          energy: 95
        }
      }
    }));
  });
  await page.waitForTimeout(500);

  const updatedLevel = await page.locator('#pet-hud-level-text').innerText();
  const updatedAff = await page.locator('#pet-hud-affection-val').innerText();
  const updatedTier = await page.locator('#pet-hud-affection-tier').innerText();
  const updatedExp = await page.locator('#pet-hud-exp-val').innerText();
  const updatedExpFill = await page.locator('#pet-hud-bar-exp-fill').evaluate(el => el.style.width);

  console.log('Updated Stats:', { updatedLevel, updatedAff, updatedTier, updatedExp, updatedExpFill });
  if (updatedLevel !== 'Cấp 2') throw new Error('Level did not update to Cấp 2');
  if (updatedAff !== '45%') throw new Error('Affection did not update to 45%');
  if (updatedTier !== '(Thân thiện)') throw new Error('Affection tier did not update to (Thân thiện)');
  if (updatedExp !== '15/30') throw new Error('EXP did not update to 15/30');

  const updatedHudScreenshotPath = 'artifacts/verify_pet_hud_updated.png';
  await hudElement.screenshot({ path: updatedHudScreenshotPath });
  console.log('9. Saved updated HUD card screenshot to:', updatedHudScreenshotPath);

  await browser.close();
  console.log('ALL VERIFICATIONS PASSED 100%!');
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
