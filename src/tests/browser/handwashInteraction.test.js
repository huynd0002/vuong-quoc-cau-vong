import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
await mkdir('artifacts/handwash', { recursive: true });
try {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 844, height: 390 }]) {
    const touch = viewport.width < 900;
    const context = await browser.newContext({ viewport, hasTouch: touch, serviceWorkers: 'block' });
    await context.setOffline(true);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => localStorage.setItem('RAINBOW_KIDS_RPG_SAVE_V1', JSON.stringify({ version: 2, player: { stars: 10 }, campaign: { currentMapId: 'map_kitchen' }, settings: { soundEnabled: false } })));
    await page.goto(pathToFileURL(path.resolve('game.html')).href, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__kitchenStationModal, null, { timeout: 30000 });
    await page.waitForFunction(() => getComputedStyle(document.getElementById('initial-loading-screen')).display === 'none', null, { timeout: 30000 });
    if (await page.locator('#char-btn-start-adventure').isVisible()) await page.locator('#char-btn-start-adventure').click();
    if (await page.locator('#story-start-button').isVisible()) await page.locator('#story-start-button').click();
    await page.evaluate(() => window.__kitchenStationModal.showSinkModal());
    await page.waitForTimeout(350);
    assert.equal(await page.locator('.wash-target').count(), 0, 'remove the two circles over the hands');
    const session = touch ? await context.newCDPSession(page) : null;
    const down = async (x, y) => {
      if (touch) await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      else { await page.mouse.move(x, y); await page.mouse.down(); }
    };
    const move = async (x, y, steps = 1) => {
      if (touch) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
      else await page.mouse.move(x, y, { steps });
    };
    const up = async () => {
      if (touch) await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      else await page.mouse.up();
    };
    const percent = () => page.locator('#scrub-percent-label').innerText().then(parseFloat);
    const step = () => page.locator('#handwash-stage').getAttribute('data-step').then(Number);
    const hand = await page.locator('#handwash-display-img').boundingBox();
    const x = side => hand.x + hand.width * (side === 'left' ? 0.29 : 0.71);
    const y = hand.y + hand.height * 0.62;
    const tool = await page.locator('#wash-tool').boundingBox();
    await down(tool.x + tool.width / 2, tool.y + tool.height / 2);
    await move(tool.x + tool.width / 2, tool.y + tool.height / 2 - 20);
    await up();
    assert.equal(await percent(), 0, 'dragging outside hands adds no progress');
    await down(x('left'), y);
    await page.waitForTimeout(150);
    await up();
    assert.equal(await percent(), 0, 'holding or tapping without rubbing adds no progress');
    await down(x('left'), y);
    for (let i = 0; i < 20; i++) await move(x('left') + (i % 2 ? -1 : 1) * hand.width * 0.1, y, 8);
    await up();
    assert.equal(await percent(), 50, 'rubbing one hand caps at 50%');
    assert.equal(await step(), 0);
    await down(x('left'), y);
    for (let i = 0; i < 20 && await percent() < 100 && await step() === 0; i++) {
      await move(x(i % 2 ? 'left' : 'right'), y);
    }
    await page.waitForTimeout(450);
    assert.equal(await step(), 1, 'advance without lifting the pointer');
    assert.equal(await page.locator('#handwash-drag-ghost').evaluate(el => getComputedStyle(el).display), 'grid');
    await move(x('left'), y, 8);
    await move(x('right'), y, 8);
    await up();
    assert.ok(await percent() > 0, 'same gesture continues rubbing in the next step');
    assert.equal(await page.locator('.handwash-bubble-particle, .celebration-sparkle-star, .handwash-faucet-unit').count(), 0);
    await page.screenshot({ path: `artifacts/handwash/soap-${viewport.width}.png` });
    for (let attempt = 0; attempt < 20 && await step() < 7; attempt++) {
      const oldStep = await step();
      const box = await page.locator('#wash-tool').boundingBox();
      await down(box.x + box.width / 2, box.y + box.height / 2);
      for (let i = 0; i < 22; i++) {
        await move(x('left') + hand.width * 0.08, y, 8);
        await move(x('right') - hand.width * 0.08, y, 8);
      }
      await up();
      await page.waitForTimeout(450);
      assert.ok(await step() > oldStep, 'rubbing both hands advances the washing step');
      if (await step() === 1) await page.screenshot({ path: `artifacts/handwash/soap-${viewport.width}.png` });
    }
    assert.equal(await step(), 7);
    assert.equal(await page.locator('#btn-goto-cook').isDisabled(), false);
    assert.equal(await page.evaluate(() => window.__kitchenModal.system.getState().handsWashed), true);
    await page.screenshot({ path: `artifacts/handwash/complete-${viewport.width}.png` });
    // Closing while dragging must remove the ghost and global handlers.
    await page.evaluate(() => { window.__kitchenStationModal.close(); window.__kitchenStationModal.showSinkModal(); });
    await page.waitForTimeout(300);
    await down(x('left'), y);
    await move(x('right'), y, 8);
    await page.evaluate(() => window.__kitchenStationModal.close());
    await up();
    await page.waitForTimeout(500);
    assert.equal(await page.locator('#handwash-drag-ghost').count(), 0);
    assert.deepEqual(errors, []);
    console.log(`PASS handwash ${touch ? 'touch' : 'mouse'} ${viewport.width}x${viewport.height}`);
    await context.close();
  }
} finally { await browser.close(); }
