import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testMarketToFashionRoad() {
  console.log('[Test] Starting Market-to-Fashion Connection Verification...');
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

  // 1. VERIFY MAP_PET_FARM: No Fashion Road, No Fashion Sign, No Farm-to-Fashion Portal
  console.log('[Test] 1. Checking map_pet_farm...');
  const farmInfo = await page.evaluate(() => {
    const ws = window.__worldScene;
    const portals = ws.portals || [];
    const portalTargets = portals.map(p => p.data?.targetMapId);
    const hasFashionSign = ws.children?.list?.some(c => 
      c.text?.includes('Phố Thời Trang') || (c.list && c.list.some(sub => sub.text?.includes('Phố Thời Trang')))
    );
    return {
      portalCount: portals.length,
      portalTargets,
      hasFashionPortal: portalTargets.includes('map_fashion_street'),
      hasFashionSign: Boolean(hasFashionSign)
    };
  });

  console.log('[Test] Farm info:', farmInfo);
  assert.strictEqual(farmInfo.hasFashionPortal, false, 'map_pet_farm must NOT have portal to map_fashion_street');
  assert.strictEqual(farmInfo.hasFashionSign, false, 'map_pet_farm must NOT have Phố Thời Trang signpost');

  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
  const farmScreenPath = path.join(artifactDir, 'verified_farm_clean_no_fashion_road.png');
  await page.screenshot({ path: farmScreenPath });
  console.log('[Test] Captured clean Farm screenshot at:', farmScreenPath);

  // 2. VERIFY MAP_RAINBOW_MARKET: Has Fashion Road, Has Fashion Portal
  console.log('[Test] 2. Switching to map_rainbow_market...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map_rainbow_market' });
  });
  await page.waitForTimeout(2500);

  const marketInfo = await page.evaluate(() => {
    const ws = window.__worldScene;
    const portals = ws.portals || [];
    const portalTargets = portals.map(p => p.data?.targetMapId);
    const fashionPortal = portals.find(p => p.data?.targetMapId === 'map_fashion_street');
    const hasFashionSign = ws.children?.list?.some(c => 
      c.text?.includes('Phố Thời Trang') || (c.list && c.list.some(sub => sub.text?.includes('Phố Thời Trang')))
    );
    return {
      portalCount: portals.length,
      portalTargets,
      hasFashionPortal: Boolean(fashionPortal),
      fashionPortalPos: fashionPortal ? { x: fashionPortal.x, y: fashionPortal.y } : null,
      hasFashionSign: Boolean(hasFashionSign)
    };
  });

  console.log('[Test] Market info:', marketInfo);
  assert.strictEqual(marketInfo.hasFashionPortal, true, 'map_rainbow_market MUST have portal to map_fashion_street');
  assert.strictEqual(marketInfo.hasFashionSign, true, 'map_rainbow_market MUST have Phố Thời Trang signpost & road');
  assert.strictEqual(marketInfo.fashionPortalPos.x, 1100, 'Fashion portal X must be 1100');

  const marketScreenPath = path.join(artifactDir, 'verified_market_with_fashion_road.png');
  await page.screenshot({ path: marketScreenPath });
  console.log('[Test] Captured Market with Fashion Road screenshot at:', marketScreenPath);

  // 3. VERIFY TELEPORT TO MAP_FASHION_STREET
  console.log('[Test] 3. Triggering teleport to map_fashion_street from market...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    const fashionPortal = ws.portals.find(p => p.data?.targetMapId === 'map_fashion_street');
    fashionPortal.enterPortal();
  });
  await page.waitForTimeout(3500);

  // Close story intro modal on Fashion Street if any
  await page.evaluate(() => {
    document.getElementById('story-intro-modal')?.remove();
  });
  await page.waitForTimeout(500);

  const fashionStreetInfo = await page.evaluate(() => {
    const ws = window.__worldScene;
    const currentMapId = ws.currentMapId;
    const returnPortal = ws.returnPortal;
    return {
      currentMapId,
      returnTargetMapId: returnPortal?.data?.targetMapId,
      returnTargetMapName: returnPortal?.data?.targetMapName
    };
  });

  console.log('[Test] Fashion Street info:', fashionStreetInfo);
  assert.strictEqual(fashionStreetInfo.currentMapId, 'map_fashion_street', 'Must successfully teleport to map_fashion_street');
  assert.strictEqual(fashionStreetInfo.returnTargetMapId, 'map_rainbow_market', 'Fashion street return portal must lead back to map_rainbow_market');

  const fashionScreenPath = path.join(artifactDir, 'verified_fashion_street_from_market.png');
  await page.screenshot({ path: fashionScreenPath });
  console.log('[Test] Captured Fashion Street screenshot at:', fashionScreenPath);

  await browser.close();
  console.log('✅ ALL MARKET-TO-FASHION ROAD TESTS PASSED 100%!');
}

testMarketToFashionRoad().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
