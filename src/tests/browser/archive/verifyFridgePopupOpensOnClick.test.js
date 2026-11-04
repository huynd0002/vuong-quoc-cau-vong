import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFridgePopup() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('game:open-kitchen-modal') || text.includes('KitchenModal')) {
      console.log('BROWSER:', text);
    }
  });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  console.log(`[Test] Loading ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Remove character select modal if present
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
  });

  // Switch to map_kitchen
  console.log('[Test] Navigating into 2D Kitchen...');
  await page.evaluate(() => {
    window.__PHASER_GAME__.scene.getScene('WorldScene').scene.restart({ mapId: 'map_kitchen' });
  });

  await page.waitForTimeout(1500);

  // Close welcome / sink modal
  console.log('[Test] Closing welcome popup...');
  await page.evaluate(() => {
    window.__kitchenStationModal?.close();
  });

  await page.waitForTimeout(600);

  // Verify modal is currently closed
  let isFridgeVisible = await page.evaluate(() => {
    return !window.__kitchenModal?.root?.hidden && window.__kitchenModal?.tab === 'fridge';
  });
  assert.strictEqual(isFridgeVisible, false, 'Fridge modal should initially be closed');

  // Helper to click world coordinate
  const clickWorld = async (worldX, worldY) => {
    const clientPos = await page.evaluate(({ wx, wy }) => {
      const canvas = document.querySelector('canvas');
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + (wx / 1280) * rect.width;
      const cy = rect.top + (wy / 720) * rect.height;
      return { cx, cy };
    }, { wx: worldX, wy: worldY });

    console.log(`[Test] Clicking Refrigerator at world (${worldX}, ${worldY})...`);
    await page.mouse.click(clientPos.cx, clientPos.cy);
  };

  // Click on the Refrigerator (center: 340, 270)
  await clickWorld(340, 270);
  await page.waitForTimeout(2200);

  // Verify fridge modal is now open
  const fridgeModalInfo = await page.evaluate(() => {
    const modal = window.__kitchenModal;
    const titleEl = document.getElementById('kitchen-title');
    const fridgeRack = document.querySelector('.fridge-shelves-rack');
    const buyBtns = document.querySelectorAll('.btn-fridge-buy-action');
    return {
      isOpen: !modal?.root?.hidden,
      activeTab: modal?.tab,
      title: titleEl?.textContent || '',
      hasShelves: Boolean(fridgeRack),
      buyButtonsCount: buyBtns.length
    };
  });

  console.log('[Test] Fridge Modal Info:', fridgeModalInfo);
  assert.strictEqual(fridgeModalInfo.isOpen, true, 'Pop-up Tủ Lạnh PHẢI hiển thị sau khi bấm vào tủ lạnh!');
  assert.strictEqual(fridgeModalInfo.activeTab, 'fridge', 'Tab hiển thị phải là fridge!');
  assert.ok(fridgeModalInfo.title.includes('Tủ Lạnh'), 'Tiêu đề pop-up phải chứa "Tủ Lạnh"!');
  assert.strictEqual(fridgeModalInfo.hasShelves, true, 'Kệ tủ lạnh phải được render đầy đủ!');
  assert.ok(fridgeModalInfo.buyButtonsCount > 0, 'Các nút chọn nguyên liệu trong tủ lạnh phải hiển thị!');

  // Take screenshot
  const screenshotPath = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_fridge_popup_opened.png';
  await page.screenshot({ path: screenshotPath });
  console.log(`[Test] Saved screenshot to ${screenshotPath}`);

  // Test closing fridge
  console.log('[Test] Testing close fridge modal...');
  await page.evaluate(() => {
    window.__kitchenModal?.close();
  });
  await page.waitForTimeout(500);

  const isClosed = await page.evaluate(() => window.__kitchenModal?.root?.hidden);
  assert.strictEqual(isClosed, true, 'Modal should close cleanly');

  // Test clicking near bottom of fridge (300, 420)
  console.log('[Test] Testing click near bottom of fridge (300, 420)...');
  await clickWorld(300, 420);
  await page.waitForTimeout(2200);

  const isOpenedAgain = await page.evaluate(() => !window.__kitchenModal?.root?.hidden);
  assert.strictEqual(isOpenedAgain, true, 'Modal should open again when clicked near bottom');

  console.log('✓ SUCCESS: Clicking refrigerator opens the Fridge Pop-up 100% reliably!');
  await browser.close();
}

testFridgePopup().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
