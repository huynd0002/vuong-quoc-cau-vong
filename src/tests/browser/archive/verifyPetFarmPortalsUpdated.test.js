import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPetFarmPortals() {
  console.log('[Test] Verifying Pet Farm Portals & Fashion Road from Market...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Close modals
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });

  // Switch to map_pet_farm
  console.log('[Test] Inspecting map_pet_farm...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map_pet_farm' });
  });
  await page.waitForTimeout(2000);

  // Inspect portals/stations on Pet Farm
  const farmInfo = await page.evaluate(() => {
    const ws = window.__worldScene;
    const portals = ws.portals || [];
    const portalNames = portals.map(p => p.data?.name || p.name);
    return {
      portalNames,
      hasFashionStreetPortal: portalNames.some(n => (n || '').includes('Thời Trang'))
    };
  });

  console.log('[Test] Farm Portals:', farmInfo);
  assert.strictEqual(farmInfo.hasFashionStreetPortal, false, 'Pet Farm MUST NOT have any Phố Thời Trang portal!');

  const artDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
  await page.screenshot({ path: path.join(artDir, 'verified_pet_farm_no_fashion_portal.png') });
  console.log('[Test] Captured screenshot at verified_pet_farm_no_fashion_portal.png');

  // Now switch to map_rainbow_market to verify road to fashion street
  console.log('[Test] Inspecting map_rainbow_market...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.scene.restart({ mapId: 'map_rainbow_market' });
  });
  await page.waitForTimeout(2000);

  const marketInfo = await page.evaluate(() => {
    const ws = window.__worldScene;
    const portals = ws.portals || [];
    const portalNames = portals.map(p => p.data?.name || p.name);
    return {
      portalNames,
      hasFashionPortal: portalNames.some(n => (n || '').includes('Thời Trang') || (n || '').includes('THỜI TRANG'))
    };
  });

  console.log('[Test] Market Portals:', marketInfo);
  assert.strictEqual(marketInfo.hasFashionPortal, true, 'Market MUST have portal to Phố Thời Trang!');

  await page.screenshot({ path: path.join(artDir, 'verified_market_fashion_portal.png') });
  console.log('[Test] Captured screenshot at verified_market_fashion_portal.png');

  await browser.close();
  console.log('✅ ALL PORTAL NAVIGATION REQUIREMENTS VERIFIED SUCCESSFULLY!');
}

testPetFarmPortals().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
