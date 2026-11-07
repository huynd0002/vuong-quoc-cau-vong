import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const { version } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const name = decodeURIComponent(url.pathname === '/' ? '/game.html' : url.pathname);
    const filename = path.resolve(root, 'dist', '.' + name);
    assert.ok(filename.startsWith(path.join(root, 'dist') + path.sep));
    res.setHeader('Content-Type', mime[path.extname(filename)] || 'application/octet-stream');
    res.end(await readFile(filename));
  } catch { res.writeHead(404); res.end(); }
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const webUrl = `http://127.0.0.1:${server.address().port}/game.html`;
let browser;

async function assertRendered(page, label) {
  await page.waitForFunction(() => window.__worldScene?.hero?.sprite?.active && window.__worldScene.sys.isActive());
  await page.evaluate(() => new Promise(resolve => window.__PHASER_GAME__.events.once('postrender', resolve)));
  const state = await page.evaluate(() => {
    const game = window.__PHASER_GAME__;
    const scene = window.__worldScene;
    const canvas = game.canvas;
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    const colors = new Set();
    let opaque = 0;
    for (let i = 0; i < pixels.length; i += 4 * 97) {
      if (pixels[i + 3] > 0) opaque++;
      colors.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`);
    }
    const rect = canvas.getBoundingClientRect();
    return {
      renderer: game.renderer.type, colors: colors.size, opaque,
      width: rect.width, height: rect.height,
      heroVisible: scene.hero.sprite.visible && scene.hero.sprite.alpha > 0,
      background: scene.bgImage?.active && scene.bgImage.texture.key === scene.mapConfig.bgKey,
      version: document.getElementById('game-version-badge').textContent,
      canvases: document.querySelectorAll('#game-root canvas').length
    };
  });
  assert.equal(state.renderer, 1, `${label}: Canvas renderer must avoid GPU context loss`);
  assert.ok(state.colors > 250 && state.opaque > 5000, `${label}: actual artwork, not a blank canvas: ${JSON.stringify(state)}`);
  assert.ok(state.width > 100 && state.height > 100, `${label}: visible canvas dimensions`);
  assert.ok(state.heroVisible && state.background, `${label}: hero and correct map background`);
  assert.equal(state.canvases, 1);
  assert.equal(state.version, `ver ${version}`);
}

try {
  browser = await chromium.launch({ headless: true });
  for (const [label, url, viewport] of [
    ['portable desktop', pathToFileURL(path.join(root, 'game.html')).href, { width: 1482, height: 1137 }],
    ['web tablet without WebGL', webUrl, { width: 1024, height: 768 }]
  ]) {
    const context = await browser.newContext({ viewport, hasTouch: label.startsWith('web'), serviceWorkers: 'block' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    if (label.startsWith('web')) {
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) {
          return /webgl/i.test(type) ? null : original.call(this, type, ...args);
        };
      });
      // Exceed both former timers: 2.8s splash and 8s preload watchdog.
      await page.route('**/map_pet_farm_bg*.png', async route => {
        await new Promise(resolve => setTimeout(resolve, 9500));
        await route.continue();
      });
    }
    await page.goto(url, { waitUntil: 'load' });
    if (label.startsWith('web')) {
      await page.waitForTimeout(8500);
      assert.equal(await page.locator('#initial-loading-screen').isVisible(), true, 'Loading must remain visible until artwork is ready');
      assert.equal(await page.evaluate(() => Boolean(window.__worldScene)), false, 'Do not stop preload at 8 seconds');
    }
    await page.locator('#char-btn-start-adventure').waitFor({ state: 'visible', timeout: 30000 });
    if (label.startsWith('web')) await page.locator('[data-skin-action="knight"]').click();
    await page.locator('#char-btn-start-adventure').click();
    await assertRendered(page, label);
    await page.keyboard.down('ArrowRight');
    const before = await page.evaluate(() => window.__worldScene.hero.sprite.x);
    await page.waitForTimeout(350);
    await page.keyboard.up('ArrowRight');
    assert.ok(await page.evaluate(x => window.__worldScene.hero.sprite.x > x, before), 'Hero must move after entering game');
    await mkdir(path.join(root, 'artifacts'), { recursive: true });
    await page.screenshot({ path: path.join(root, 'artifacts', label.startsWith('web') ? 'game-fixed-tablet.png' : 'game-fixed-desktop.png') });
    for (const mapId of ['map1', 'map2', 'map3', 'map4', 'map5', 'map6', 'map_kitchen', 'map_fishing_pond', 'map_rainbow_market', 'map_fashion_street', 'map_pet_farm']) {
      await page.evaluate(id => window.__worldScene.scene.restart({ mapId: id }), mapId);
      await page.waitForFunction(id => window.__worldScene?.currentMapId === id && window.__worldScene?.sys.isActive(), mapId);
      await assertRendered(page, `${label} ${mapId}`);
    }
    await page.evaluate(() => window.__worldScene.scene.pause());
    await page.waitForTimeout(1000);
    assert.equal(await page.evaluate(() => window.__worldScene.sys.isPaused()), true);
    await page.evaluate(() => window.__worldScene.scene.resume());
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await assertRendered(page, `${label} resized and resumed`);
    assert.deepEqual(errors, [], `${label}: no JavaScript errors`);
    console.log(`✓ ${label}: actual pixels, all 11 maps, delayed loading, movement, resize and pause verified`);
    await context.close();
  }
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
