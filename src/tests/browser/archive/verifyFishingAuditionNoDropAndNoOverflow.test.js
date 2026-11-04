import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFishingAuditionFix() {
  console.log('[Test] Starting Fishing Audition Pop-up Fix Verification...');
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

  // Switch to map_fishing_pond
  console.log('[Test] Switching to map_fishing_pond...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map_fishing_pond' });
  });
  await page.waitForTimeout(2000);

  // Mount Audition bar with Cá Chuông Bạc (4 Lần Canh)
  console.log('[Test] Mounting Audition bar for Cá Chuông Bạc (4 hits)...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.onMapFishingState = {
      phase: 'audition',
      turn: { id: 'turn_test' },
      species: {
        id: 'silver_bell_fish',
        name: 'Cá Chuông Bạc',
        icon: '🔔',
        asset: '/assets/fishing/fish_silver_bell.png',
        requiredHits: 4,
        zoneHeight: 24,
        markerSpeed: 100
      },
      weightG: 650,
      diff: { label: 'Khó - 4 Lần Canh', requiredHits: 4 },
      targetHits: 4,
      currentHits: 0,
      neededHits: 4,
      targetSteps: 4,
      currentStep: 0,
      zoneHeight: 28,
      zoneTop: 28,
      markerSpeed: 100,
      markerPct: 30,
      markerDir: 1,
      rod: { icon: '🎋', level: 1, pullStepGain: 1.0 }
    };
    ws.mountVerticalAuditionBar();
  });
  await page.waitForTimeout(500);

  // 1. Check Stepper Overflow
  const stepperMetrics = await page.evaluate(() => {
    const stepper = document.querySelector('.fishing-8step-stepper');
    const nodes = Array.from(document.querySelectorAll('.fishing-step-node'));
    const modal = document.querySelector('#onmap-fishing-audition');
    const sRect = stepper.getBoundingClientRect();
    const mRect = modal.getBoundingClientRect();

    const nodeRects = nodes.map((n, i) => {
      const r = n.getBoundingClientRect();
      return {
        step: i + 1,
        left: r.left,
        right: r.right,
        isInsideStepper: r.left >= sRect.left - 2 && r.right <= sRect.right + 2
      };
    });

    return {
      modalBottom: mRect.bottom,
      viewportHeight: window.innerHeight,
      isModalInsideScreen: mRect.top >= 0 && mRect.bottom <= window.innerHeight,
      nodeRects,
      allNodesInside: nodeRects.every(n => n.isInsideStepper)
    };
  });

  console.log('[Test] Stepper & Modal metrics:', stepperMetrics);
  assert.strictEqual(stepperMetrics.allNodesInside, true, 'All 4 stepper nodes must be 100% inside stepper container without overflowing!');
  assert.strictEqual(stepperMetrics.isModalInsideScreen, true, 'Modal bottom must NOT overflow viewport height!');

  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
  const noOverflowScreen = path.join(artifactDir, 'verified_fishing_audition_no_overflow.png');
  await page.screenshot({ path: noOverflowScreen });
  console.log('[Test] Saved screenshot at:', noOverflowScreen);

  // 2. Click Pull button and check if modal drops down
  console.log('[Test] Clicking Pull button and testing Y position stability...');
  const initialTop = await page.evaluate(() => {
    return document.querySelector('#onmap-fishing-audition').getBoundingClientRect().top;
  });

  // Click pull
  await page.click('#btn-onmap-pull');
  await page.waitForTimeout(100); // In the middle of shake animation

  const midShakeTop = await page.evaluate(() => {
    return document.querySelector('#onmap-fishing-audition').getBoundingClientRect().top;
  });

  await page.waitForTimeout(400); // After shake animation ends

  const postShakeTop = await page.evaluate(() => {
    return document.querySelector('#onmap-fishing-audition').getBoundingClientRect().top;
  });

  console.log('[Test] Y Positions (initial, midShake, postShake):', { initialTop, midShakeTop, postShakeTop });
  const maxDeltaY = Math.abs(midShakeTop - initialTop);
  console.log('[Test] Max Delta Y during click:', maxDeltaY);

  // Before fix, delta Y was > 200px (dropped down completely). Now it should be subtle vibration <= 6px!
  assert.ok(maxDeltaY < 15, `Modal must NOT drop down when clicked! Max delta was ${maxDeltaY}px`);
  assert.ok(Math.abs(postShakeTop - initialTop) < 3, 'Modal must return to exact vertical center');

  const pullPressScreen = path.join(artifactDir, 'verified_fishing_audition_pull_press.png');
  await page.screenshot({ path: pullPressScreen });
  console.log('[Test] Saved pull press screenshot at:', pullPressScreen);

  await browser.close();
  console.log('✅ ALL FISHING AUDITION POPUP FIXES VERIFIED SUCCESSFULLY!');
}

testFishingAuditionFix().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
