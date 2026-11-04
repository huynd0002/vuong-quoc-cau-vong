import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testOnlyFrontLoadingKept() {
  console.log('[Test] Starting Only Front Loading Verification...');
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

  // Trigger portal warp to map_rainbow_market
  console.log('[Test] Triggering portal warp to Chợ Cầu Vồng...');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:portal-warp-start', {
      detail: {
        targetMapId: 'map_rainbow_market',
        portalData: { targetMapName: 'Chợ Cầu Vồng' }
      }
    }));
  });

  // Wait until Step 8 (3600ms)
  await page.waitForTimeout(3700);

  // Check state of both overlays at Step 8
  const overlayStates = await page.evaluate(() => {
    const frontContainer = document.getElementById('warp-overlay-container');
    const frontBanner = document.getElementById('warp-hud-banner');
    const frontStepText = document.getElementById('warp-hud-step-badge')?.textContent;
    const frontMessage = document.getElementById('warp-hud-text')?.textContent;

    const backOverlay = document.getElementById('map-loading-overlay');
    const backStyle = backOverlay ? window.getComputedStyle(backOverlay) : null;

    return {
      frontVisible: frontBanner?.classList.contains('active') || frontContainer?.classList.contains('active'),
      frontStepText,
      frontMessage,
      backExists: Boolean(backOverlay),
      backDisplay: backStyle ? backStyle.display : null,
      backOpacity: backStyle ? backStyle.opacity : null,
      backVisibility: backStyle ? backStyle.visibility : null,
      backHasActive: backOverlay ? backOverlay.classList.contains('active') : false
    };
  });

  console.log('[Test] Overlay States at Step 8:', overlayStates);

  // Assertions:
  assert.strictEqual(overlayStates.frontVisible, true, 'Front loading banner (8-step) MUST be active & visible');
  assert.ok(overlayStates.frontStepText.includes('8/8'), 'Front banner must show BƯỚC 8/8');
  assert.ok(overlayStates.frontMessage.includes('Chợ Cầu Vồng'), 'Front banner must welcome to Chợ Cầu Vồng');

  // Background loading must be completely hidden/disabled or removed from DOM
  if (overlayStates.backExists) {
    assert.strictEqual(overlayStates.backDisplay, 'none', 'Back loading overlay MUST have display: none');
  }
  assert.strictEqual(overlayStates.backHasActive, false, 'Back loading overlay must NOT have active class');

  // Capture screenshot of Step 8
  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
  const screenshotPath = path.join(artifactDir, 'verified_only_front_loading_banner.png');
  await page.screenshot({ path: screenshotPath });
  console.log('[Test] Captured Step 8 screenshot at:', screenshotPath);

  await browser.close();
  console.log('✅ ALL TESTS PASSED: Only front loading is kept, back loading is completely removed!');
}

testOnlyFrontLoadingKept().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
