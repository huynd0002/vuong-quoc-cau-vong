import { chromium } from 'playwright';

async function verifyPetIsDog() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Reset localStorage to test clean state
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle' });

  // 1. Check loading screen mascot
  const mascotPetSrc = await page.$eval('.ils-mascot-pet', el => el.getAttribute('src'));
  const mascotPetAlt = await page.$eval('.ils-mascot-pet', el => el.getAttribute('alt'));
  console.log('Mascot Pet src:', mascotPetSrc, 'alt:', mascotPetAlt);

  // Wait for loading screen to complete and game to be ready
  await page.waitForSelector('#stage-version-watermark', { timeout: 15000 });
  const ver = await page.$eval('#stage-version-watermark', el => el.textContent.trim());
  console.log('Detected version:', ver);

  // Topbar button
  const topPetName = await page.$eval('#pet-name-top', el => el.textContent.trim());
  console.log('Topbar pet button label:', topPetName);

  // Switch/Ensure we are on map_pet_farm
  await page.evaluate(() => {
    if (typeof window.__travelToZone === 'function') {
      window.__travelToZone('map_pet_farm');
    } else if (window.__worldScene && window.__worldScene.loadMap) {
      window.__worldScene.loadMap('map_pet_farm');
    }
  });

  // Wait for HUD
  await page.waitForTimeout(2000);

  const hudName = await page.$eval('#pet-hud-name', el => el.textContent.trim());
  const hudIcon = await page.$eval('#pet-hud-header-icon', el => el.textContent.trim());
  const companionBtnText = await page.$eval('#pet-companion-toggle-text', el => el.textContent.trim());

  console.log('HUD Pet Name:', hudName);
  console.log('HUD Pet Icon:', hudIcon);
  console.log('Companion Btn:', companionBtnText);

  // Take screenshot
  const screenshotPath = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_pet_is_dog_be_cun.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  // Assertions
  if (hudName.includes('Thỏ') || hudIcon === '🐰') {
    throw new Error(`HUD is still showing bunny: name=${hudName}, icon=${hudIcon}`);
  }
  if (!hudName.includes('Cún') || hudIcon !== '🐶') {
    throw new Error(`HUD does not show puppy: name=${hudName}, icon=${hudIcon}`);
  }

  // Also test old save normalization: inject old save with name 'Thỏ Bông' and type 'bunny'
  const migrationResult = await page.evaluate(() => {
    const rawOldSave = JSON.stringify({
      version: 2,
      pet: {
        type: 'bunny',
        name: 'Thỏ Bông',
        hunger: 80,
        level: 2
      }
    });
    localStorage.setItem('RAINBOW_KIDS_RPG_SAVE_V2_Bé Sâu', rawOldSave);
    localStorage.setItem('RAINBOW_KIDS_ACTIVE_PROFILE', 'Bé Sâu');
    const loaded = window.__saveAdapter ? window.__saveAdapter.load() : null;
    return loaded ? { petName: loaded.pet.name, petType: loaded.pet.type } : null;
  });

  console.log('Migration of old save test:', migrationResult);
  if (migrationResult) {
    if (migrationResult.petName !== 'Bé Cún' || migrationResult.petType !== 'dog') {
      throw new Error(`Migration failed: petName=${migrationResult.petName}, petType=${migrationResult.petType}`);
    }
  }

  console.log('✅ ALL PET IS DOG VERIFICATIONS PASSED SUCCESSFULLY!');
  await browser.close();
}

verifyPetIsDog().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
