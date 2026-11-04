import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createServer, preview } from 'vite';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const fileMode = process.argv.includes('--file');
const production = process.argv.includes('--production');
const port = production ? 4232 : 4231;
const server = fileMode ? null : production
  ? await preview({ preview: { host: '127.0.0.1', port, strictPort: true } })
  : await createServer({ server: { host: '127.0.0.1', port, strictPort: true } });
if (!fileMode && !production) await server.listen();
let browser;
const errors = [];
await mkdir('artifacts/pet-stations', { recursive: true });
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.on('pageerror', error => { errors.push(error.message); console.error(error.message); });
  // Isolated test profile: launch directly on the farm, never modify the user's save.
  await page.addInitScript(() => localStorage.setItem('RAINBOW_KIDS_RPG_SAVE_V1', JSON.stringify({
    version: 2, campaign: { currentMapId: 'map_pet_farm', unlockedMaps: ['map1', 'map_pet_farm'] },
    pet: { type: 'dog', clean: 10, thirst: 10, energy: 100, bladder: 0, hunger: 100 }, settings: { soundEnabled: false }
  })));
  if (fileMode) await context.setOffline(true);
  await page.goto(fileMode ? pathToFileURL(path.resolve('game.html')).href : `http://127.0.0.1:${port}/game.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__worldScene?.pet?.sprite?.active, null, { timeout: 25000 });
  await page.waitForFunction(() => getComputedStyle(document.getElementById('initial-loading-screen')).display === 'none', null, { timeout: 20000 });
  await page.locator('#char-btn-start-adventure').click();
  await page.waitForFunction(() => !window.__characterSelectModal?.isVisible);
  if (await page.locator('#story-start-button').isVisible()) await page.locator('#story-start-button').click();
  await page.waitForFunction(() => window.__worldScene?.isExploring);
  // Disable roaming only; requested station movements and callbacks still run normally.
  await page.evaluate(() => window.__worldScene.pet.setMode('idle'));
  await page.locator('#pet-button').click();
  await page.locator('#pet-action-bathe').click();
  await page.waitForFunction(() => document.getElementById('pet-modal').hidden, null, { timeout: 2000 });
  await page.evaluate(() => window.__worldScene.interruptPetStationAction(false));

  async function state() {
    return page.evaluate(() => {
      const scene = window.__worldScene, pet = scene.pet, s = pet.sprite;
      return { type: scene.currentPetStationAction?.station.type, phase: scene.currentPetStationAction?.phase,
        x: s.x, y: s.y, width: s.displayWidth, height: s.displayHeight, scaleX: s.scaleX, scaleY: s.scaleY,
        angle: s.angle, anim: s.anims?.currentAnim?.key, state: pet.currentAnimState,
        bathTimer: Boolean(pet.bathShakeTimer), pose: pet.stationPose, frontVisible: scene.petBathFront?.visible,
        stats: JSON.parse(localStorage.getItem('RAINBOW_KIDS_RPG_SAVE_V1')).pet };
    });
  }
  async function waitAction(type) {
    await page.waitForFunction(type => {
      const scene = window.__worldScene;
      return scene.currentPetStationAction?.station.type === type && scene.currentPetStationAction.phase === 'action';
    }, type, { timeout: 17000 });
  }
  async function sampleAction(type, duration = 1800) {
    const frames = await page.evaluate(({ type, duration }) => new Promise(resolve => {
      const scene = window.__worldScene;
      const samples = [];
      const sample = () => {
        if (scene.currentPetStationAction?.phase !== 'action') return;
        const s = scene.pet.sprite;
        samples.push({ type: scene.currentPetStationAction.station.type, x: s.x, y: s.y,
          width: s.displayWidth, height: s.displayHeight, scaleX: s.scaleX, scaleY: s.scaleY,
          angle: s.angle, anim: s.anims.currentAnim?.key, frame: s.frame.name,
          frameWidth: s.frame.realWidth, frameHeight: s.frame.realHeight,
          shadowVisible: scene.pet.shadow.visible, depth: s.depth,
          frontDepth: scene.petBathFront.depth, frontVisible: scene.petBathFront.visible });
      };
      scene.events.on('postupdate', sample);
      scene.time.delayedCall(duration, () => { scene.events.off('postupdate', sample); resolve(samples); });
    }), { type, duration });
    assert.ok(frames.length > 10, 'sample many rendered frames, not a single still');
    const target = await page.evaluate(type => window.__worldScene.mapConfig.petStations.find(s => s.type === type).interactionPoint, type);
    for (const frame of frames) {
      assert.equal(frame.type, type);
      assert.equal(frame.anim, type === 'bath' ? 'pet_dog_bath' : 'pet_dog_drink');
      assert.ok(Math.abs(frame.x - target.x) < 0.1 && Math.abs(frame.y - target.y) < 0.1, `${type} stayed at its own station: ${JSON.stringify(frame)}`);
      assert.ok(Math.abs(frame.width - 96) < 0.1 && Math.abs(frame.height - 96) < 0.1, 'no stretched/squashed frames');
      assert.ok(Math.abs(frame.scaleX - frame.scaleY) < 0.001, 'uniform scale throughout animation');
      assert.equal(frame.angle, 0);
      assert.equal(frame.frameWidth, 256, 'animate one frame, never a whole sprite strip');
      assert.equal(frame.frameHeight, 256);
      if (type === 'bath') {
        // Independent art geometry: prop is 751×808 at 0.2, centered (512,597).
        // Its water center is texture pixel (350,340), not the doorstep (512,635).
        const waterX = 512 + (350 - 375.5) * .2;
        const waterY = 597 + (340 - 404) * .2;
        const feetY = frame.y + (215 - 128) * (96 / 256);
        assert.ok(Math.abs(frame.x - waterX) < 8 && Math.abs(feetY - waterY) < 14, 'feet must be inside the middle of the water');
        assert.equal(frame.shadowVisible, false, 'no ground shadow floating inside water');
        assert.equal(frame.frontVisible, true);
        assert.ok(frame.depth < frame.frontDepth, 'front lip occludes submerged body');
      } else {
        const muzzleX = frame.x + (205 - 128) * (96 / 256);
        const muzzleY = frame.y + (184 - 128) * (96 / 256);
        assert.ok(Math.abs(muzzleX - 404) < 12 && Math.abs(muzzleY - 250) < 12, 'mouth reaches the drinking trough water');
        assert.ok(Math.hypot(frame.x - 512, frame.y - 597) > 300, 'drinking stays far from bathtub');
        assert.equal(frame.frontVisible, false);
      }
    }
    assert.ok(new Set(frames.map(f => f.frame)).size >= 3, 'real animation advances through multiple frames');
    const visible = await page.evaluate(() => {
      const scene = window.__worldScene, s = scene.pet.sprite, canvas = scene.game.canvas;
      const b = canvas.getBoundingClientRect();
      return [-20, 0, 24].every(offset => {
        const x = b.x + s.x * b.width / 1280;
        const y = b.y + (s.y + offset) * b.height / 720;
        return x > 0 && x < innerWidth && y > 0 && y < innerHeight && document.elementFromPoint(x, y) === canvas;
      });
    });
    assert.equal(visible, true, 'pet head/body/water are visible, not covered by HUD or quick buttons');
    console.log(`✓ ${type}: ${frames.length} rendered frames at (${target.x}, ${target.y}), correct animation and uniform proportions`);
  }
  async function finishAction() {
    await page.waitForFunction(() => window.__worldScene.currentPetStationAction?.phase === 'celebrating', null, { timeout: 6000 });
  }
  await page.locator('#gauge-clean').click();
  await waitAction('bath');
  await sampleAction('bath');
  await page.screenshot({ path: 'artifacts/pet-stations/bath.png' });
  await finishAction();
  const afterBath = await state();
  assert.equal(afterBath.stats.exp, 6, 'care awarded once at completion');
  assert.ok(afterBath.stats.clean >= 74);
  // Immediately after completion: the old celebration must not drag drinking back to the bathtub.
  await page.locator('#gauge-thirst').click();
  await waitAction('water');
  await sampleAction('water');
  assert.equal((await state()).bathTimer, false);
  await page.screenshot({ path: 'artifacts/pet-stations/drink.png' });
  await finishAction();
  assert.equal((await state()).stats.exp, 11);
  assert.ok((await state()).stats.clean >= 74, 'simulation must preserve bath reward');
  assert.ok((await state()).stats.thirst >= 69);

  // Changing commands during the walk: the last click wins, even within 250 ms.
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const bath = scene.mapConfig.petStations.find(s => s.type === 'bath');
    const water = scene.mapConfig.petStations.find(s => s.type === 'water');
    scene.handlePetStationInteraction(bath);
    window.__cancelledBath = scene.currentPetStationAction;
    scene.handlePetStationInteraction(water);
  });
  await waitAction('water');
  // Simulate a late arrival/completion from the cancelled command.
  await page.evaluate(() => {
    const scene = window.__worldScene, old = window.__cancelledBath;
    scene.executeStationActionProgress(old.station, old.targetX, old.targetY, old);
    scene.completePetStationAction(old.station, old);
  });
  await sampleAction('water', 1300);
  assert.equal((await state()).stats.exp, 11, 'cancelled command cannot grant rewards');

  // Change to bath during active drinking, then back during active bathing.
  await page.locator('#gauge-clean').click(); await waitAction('bath');
  await sampleAction('bath', 1300);
  await page.locator('#gauge-thirst').click(); await waitAction('water');
  await sampleAction('water', 1300);
  assert.equal((await state()).bathTimer, false, 'old bath effects are removed');
  assert.equal((await state()).stats.exp, 11, 'interrupted actions give no extra reward');

  // Modal buttons must request stations without immediately granting care.
  await page.locator('#pet-button').click();
  await page.locator('#pet-action-bathe').click();
  assert.equal(await page.locator('#pet-modal').isVisible(), false);
  await waitAction('bath');
  await sampleAction('bath', 1300);
  await page.locator('#pet-button').click(); await page.locator('#pet-action-drink').click();
  assert.equal(await page.locator('#pet-modal').isVisible(), false);
  await waitAction('water'); await sampleAction('water', 1300);
  assert.equal((await state()).stats.exp, 11, 'modal does not double-award care before arrival');
  await finishAction(); assert.equal((await state()).stats.exp, 16);
  console.log('✓ HUD and care modal: completion, rapid switching, cancelled callbacks and exactly-once rewards');

  // Existing sprite tweens (including a stale squash) cannot affect a new action.
  await page.evaluate(() => {
    const scene = window.__worldScene;
    scene.tweens.add({ targets: scene.pet.sprite, scaleX: 1.2, scaleY: 0.1, y: 635, duration: 1800, yoyo: true, repeat: 1 });
    scene.handlePetStationInteraction(scene.mapConfig.petStations.find(s => s.type === 'bath'));
  });
  await waitAction('bath'); await sampleAction('bath');
  await page.screenshot({ path: 'artifacts/pet-stations/bath.png' });

  // A late idle callback or animation event cannot change the owned station pose.
  // Start a fresh action so slow offline image decoding cannot leave only the
  // final frame of the previous action for this independent corruption check.
  await page.evaluate(() => {
    const scene = window.__worldScene;
    scene.interruptPetStationAction(false);
    scene.handlePetStationInteraction(scene.mapConfig.petStations.find(s => s.type === 'bath'));
  });
  await waitAction('bath');
  await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    pet.playIdle();
    pet.sprite.setPosition(512, 635).setScale(1.2, .1);
  });
  await sampleAction('bath', 800);

  // Clicking the real map station remains supported, with no DOM click-through.
  const waterPoint = await page.evaluate(() => {
    const scene = window.__worldScene;
    const station = scene.mapConfig.petStations.find(s => s.type === 'water');
    const rect = scene.game.canvas.getBoundingClientRect();
    return { x: rect.x + station.x * rect.width / 1280, y: rect.y + station.y * rect.height / 720 };
  });
  await page.mouse.click(waterPoint.x, waterPoint.y);
  await waitAction('water'); await sampleAction('water', 1300);
  // A DOM pointer must not select the bathtub underneath the HUD.
  await page.evaluate(() => {
    const scene = window.__worldScene;
    scene.petStationContainers.find(s => s.data.type === 'bath').touchZone.emit('pointerdown', {
      event: { target: document.getElementById('gauge-thirst'), stopPropagation() {} }
    });
  });
  assert.equal((await state()).type, 'water');

  // Mobile landscape: use the same visible controls and inspect live frames.
  await page.setViewportSize({ width: 844, height: 390 });
  await page.locator('#gauge-thirst').click(); await waitAction('water'); await sampleAction('water', 1300);
  await page.screenshot({ path: 'artifacts/pet-stations/drink-mobile.png' });
  await page.locator('#gauge-clean').click(); await waitAction('bath'); await sampleAction('bath', 1300);
  await page.screenshot({ path: 'artifacts/pet-stations/bath-mobile.png' });
  // Leaving the farm invalidates the active action and destroys its timers.
  await page.evaluate(() => { const scene = window.__worldScene; scene.scene.restart({ mapId: 'map1' }); });
  await page.waitForFunction(() => window.__worldScene?.currentMapId === 'map1' && window.__worldScene.pet?.sprite.active);
  await page.waitForTimeout(3500);
  assert.equal(await page.evaluate(() => window.__worldScene.currentPetStationAction), null);
  console.log('✓ Mobile landscape and leaving the farm during care');
  assert.deepEqual(errors, []);
  console.log(`✓ PASS: ${fileMode ? 'offline file:// game.html' : production ? 'production build' : 'development source'} — all pet station regression checks`);
} catch (error) {
  const page = browser?.contexts()[0]?.pages()[0];
  if (page) await page.screenshot({ path: 'artifacts/pet-stations/failure.png' });
  throw error;
} finally {
  await browser?.close();
  if (production && server) { server.httpServer.closeAllConnections(); await new Promise(resolve => server.httpServer.close(resolve)); }
  else await server?.close();
}
