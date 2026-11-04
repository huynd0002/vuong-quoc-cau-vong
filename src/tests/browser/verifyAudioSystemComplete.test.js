import { chromium } from 'playwright';
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('--- [Test] Kiểm tra Toàn Diện Hệ Thống Âm Thanh (BGM & SFX) ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Close any intro modals if open
  await page.evaluate(() => {
    document.querySelectorAll('.modal-overlay, .achievement-modal, .intro-overlay, #character-select-modal, .character-modal-backdrop').forEach(el => {
      el.style.display = 'none';
      el.classList.remove('active', 'open', 'show');
    });
  });

  // Verify audioService availability & BGM mapping
  const testResults = await page.evaluate(async () => {
    const s = window.__audioService;
    if (!s) return { success: false, reason: 'window.__audioService not exposed' };

    const bgmMap = {
      pet_farm: s.getBgmForMap('pet_farm'),
      fishing_pond: s.getBgmForMap('fishing_pond'),
      rainbow_market: s.getBgmForMap('rainbow_market'),
      fashion_street: s.getBgmForMap('fashion_street'),
      rainbow_kitchen: s.getBgmForMap('rainbow_kitchen'),
      map1: s.getBgmForMap('map1'),
      battle: s.getBgmForMap('battle_boss')
    };

    // Test calling all SFX methods
    const sfxCalls = [];
    const methods = [
      'playCastRod', 'playBobberSplash', 'playFishBite', 'playFishCatch',
      'playCoinBuy', 'playBagOpen', 'playEquipAccessory', 'playDragDrop',
      'playCardFlip', 'playPetBark', 'playPetEat', 'playPetDrink',
      'playPetFlush', 'playCookingSizzle', 'playDishComplete',
      'playChime', 'playSuccess', 'playStageClear', 'playTryAgain'
    ];

    for (const m of methods) {
      if (typeof s[m] === 'function') {
        try {
          s[m]();
          sfxCalls.push({ method: m, ok: true });
        } catch (err) {
          sfxCalls.push({ method: m, ok: false, error: err.message });
        }
      } else {
        sfxCalls.push({ method: m, ok: false, error: 'method not found' });
      }
    }

    return {
      success: true,
      enabled: s.enabled,
      bgmMap,
      sfxCalls
    };
  });

  console.log('Audio test results:', JSON.stringify(testResults, null, 2));
  assert(testResults.success, 'Audio service should be active');
  assert(testResults.bgmMap.pet_farm.includes('bgm_pet_farm'), 'Pet farm BGM correct');
  assert(testResults.bgmMap.fishing_pond.includes('bgm_fishing_pond'), 'Fishing pond BGM correct');
  assert(testResults.bgmMap.rainbow_market.includes('bgm_rainbow_market'), 'Rainbow market BGM correct');
  assert(testResults.bgmMap.rainbow_kitchen.includes('bgm_kitchen'), 'Kitchen BGM correct');
  assert(testResults.bgmMap.map1.includes('bgm_adventure_main'), 'Map 1 BGM correct');
  assert(testResults.bgmMap.battle.includes('bgm_battle_boss'), 'Battle BGM correct');

  const failedSfx = testResults.sfxCalls.filter(x => !x.ok);
  assert.strictEqual(failedSfx.length, 0, `All SFX methods must pass without errors. Failed: ${JSON.stringify(failedSfx)}`);

  // Test sound toggle button
  const toggleBtn = page.locator('#sound-toggle');
  if (await toggleBtn.count() > 0) {
    console.log('Testing #sound-toggle interaction...');
    await toggleBtn.click({ force: true });
    await page.waitForTimeout(500);

    const isMuted = await page.evaluate(() => {
      const s = window.__audioService;
      const img = document.querySelector('#sound-toggle img');
      return {
        enabled: s ? s.enabled : null,
        hasImg: Boolean(img),
        imgType: img ? (img.src.startsWith('data:') ? 'base64' : img.src) : null
      };
    });
    console.log('Sound state after toggle click:', isMuted);

    // Toggle back on
    await toggleBtn.click({ force: true });
    await page.waitForTimeout(500);
  }

  // Screenshot for verification artifact
  const artifactDir = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5');
  const screenshotPath = path.join(artifactDir, 'verified_audio_system_and_sound_hud.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Saved screenshot artifact: ${screenshotPath}`);

  await browser.close();
  console.log('✅ ALL AUDIO SYSTEM TESTS COMPLETED SUCCESSFULLY!');
})();
