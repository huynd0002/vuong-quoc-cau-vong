import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const gameHtmlPath = 'file:///' + path.join(root, 'game.html').replace(/\\/g, '/');

(async () => {
  console.log('Launching browser to verify game.html...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const pageErrors = [];
  const failedRequests = [];

  page.on('pageerror', err => {
    console.error('Page error:', err.message);
    pageErrors.push(err.message);
  });

  page.on('requestfailed', req => {
    console.warn('Request failed:', req.url());
    failedRequests.push(req.url());
  });

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(gameHtmlPath, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Take screenshot of the startup / character selection modal
  const charModalVisible = await page.locator('#character-select-modal').isVisible();
  console.log('Character select modal visible:', charModalVisible);

  await page.screenshot({ path: path.join(root, 'verify_startup.png') });

  // If character select modal is visible, choose "Bé Sam" and start game
  if (charModalVisible) {
    const btnSam = page.locator('button.char-card[data-skin="knight"]');
    if (await btnSam.isVisible()) {
      await btnSam.click();
      console.log('Clicked Bé Sam Kuromi card');
    }
    const btnStart = page.locator('#char-modal-btn-start');
    if (await btnStart.isVisible()) {
      await btnStart.click();
      console.log('Clicked Start Adventure button');
    }
    await page.waitForTimeout(1500);
  }

  // Take screenshot of World / Map
  await page.screenshot({ path: path.join(root, 'verify_world_map.png') });

  // Test sound click
  const soundResult = await page.evaluate(() => {
    try {
      if (window.__audioService) {
        window.__audioService.setSoundEnabled(true);
        window.__audioService.playClick();
        window.__audioService.playSuccess();
        return { success: true };
      }
      return { success: false, reason: 'window.__audioService not found' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  console.log('Audio test result:', soundResult);

  console.log('Page errors count:', pageErrors.length);
  console.log('Failed requests count:', failedRequests.length);

  await browser.close();
  console.log('Browser verification finished successfully!');
})();
