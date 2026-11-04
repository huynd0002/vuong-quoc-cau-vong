import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAccessorySlotInBag() {
  console.log('[Test] Starting Accessory Slot in Bag E2E Verification...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('console', msg => console.log('[Browser]', msg.text()));

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  console.log(`[Test] Navigating to ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);

  // Close intro modals if present
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });

  // Step 1: Open Bag Modal and inspect initial state
  console.log('[Test] Step 1: Open Bag and check Accessory Dropzone...');
  const initialBagState = await page.evaluate(async () => {
    const km = window.__kitchenModal;
    const fs = window.__fashionSystem;
    const ws = window.__worldScene;

    // Reset fashion accessories for a clean test
    fs.saveState({
      ownedAccessories: [],
      equippedAccessoryId: null,
      currentAccessory: null
    });

    // Give some stars
    fs.grantStars(500);

    // Open bag tab
    km.show('bag');
    await new Promise(r => setTimeout(r, 200));

    const dropzone = document.getElementById('bag-accessory-dropzone');
    const isEquipped = dropzone?.classList.contains('is-equipped');
    const isEmpty = dropzone?.classList.contains('is-empty');
    const accInBag = document.querySelectorAll('.bag-slot-cell.is-accessory-cell').length;

    return {
      dropzoneExists: Boolean(dropzone),
      isEquipped,
      isEmpty,
      accInBag,
      heroHasAcc: Boolean(ws.hero.accessoryId)
    };
  });

  console.log('[Test] Initial Bag State:', initialBagState);
  assert.strictEqual(initialBagState.dropzoneExists, true, 'Accessory dropzone must exist in Bag top bar');
  assert.strictEqual(initialBagState.isEmpty, true, 'Accessory dropzone must be empty initially');
  assert.strictEqual(initialBagState.accInBag, 0, 'No accessories in bag yet');
  assert.strictEqual(initialBagState.heroHasAcc, false, 'Hero should not have accessory initially');

  // Step 2: Buy accessory at Fashion Street
  console.log('[Test] Step 2: Buy an accessory (acc_panda_headband)...');
  const purchaseState = await page.evaluate(async () => {
    const fs = window.__fashionSystem;
    const km = window.__kitchenModal;
    const ws = window.__worldScene;

    // Give stars and purchase accessory via FashionSystem
    fs.grantStars(500);
    const adapter = fs.getAdapter();
    const gs = adapter.load();
    if (!gs.player) gs.player = {};
    if (!gs.campaign) gs.campaign = {};
    gs.player.stars = 500;
    gs.campaign.stars = 500;
    adapter.save(gs);

    const res = fs.purchaseAccessory('acc_panda_headband');
    console.log('purchase result:', res, 'stars:', fs.getPlayerStars());

    // Re-render bag
    km.render();
    await new Promise(r => setTimeout(r, 200));

    const dropzone = document.getElementById('bag-accessory-dropzone');
    const accCells = document.querySelectorAll('.bag-slot-cell.is-accessory-cell');
    const firstAccCell = accCells[0];

    return {
      purchaseSuccess: res.success,
      accInBag: accCells.length,
      accCellId: firstAccCell?.getAttribute('data-accessory-slot'),
      dropzoneIsEmpty: dropzone?.classList.contains('is-empty'),
      heroHasAcc: Boolean(ws.hero.accessoryId),
      equippedAccessoryId: fs.getState().equippedAccessoryId
    };
  });

  console.log('[Test] Purchase State:', purchaseState);
  assert.strictEqual(purchaseState.purchaseSuccess, true, 'Purchase must succeed');
  assert.strictEqual(purchaseState.accInBag, 1, 'Purchased accessory must now be in Bag grid');
  assert.strictEqual(purchaseState.accCellId, 'acc_panda_headband', 'Correct accessory in Bag grid');
  assert.strictEqual(purchaseState.dropzoneIsEmpty, true, 'Dropzone must still be empty (not auto-equipped)');
  assert.strictEqual(purchaseState.heroHasAcc, false, 'Hero must not wear accessory yet');
  assert.strictEqual(purchaseState.equippedAccessoryId, null, 'FashionSystem equippedAccessoryId must be null');

  // Step 3: Select accessory in bag and inspect details
  console.log('[Test] Step 3: Inspect accessory in Bag and equip via button...');
  const inspectorState = await page.evaluate(async () => {
    const km = window.__kitchenModal;
    const accBtn = document.querySelector('[data-accessory-slot="acc_panda_headband"]');
    accBtn.click();
    await new Promise(r => setTimeout(r, 100));

    const inspectorBadge = document.querySelector('.inspector-type-badge')?.textContent.trim();
    const inspectorTitle = document.querySelector('.inspector-title')?.textContent.trim();
    const equipBtn = document.querySelector('[data-equip-accessory-id="acc_panda_headband"]');

    return {
      inspectorBadge,
      inspectorTitle,
      hasEquipBtn: Boolean(equipBtn)
    };
  });

  console.log('[Test] Inspector State:', inspectorState);
  assert.ok(inspectorBadgeContainsAccessory(inspectorState.inspectorBadge), 'Inspector badge must indicate Phụ Kiện');
  assert.ok(inspectorState.inspectorTitle.includes('Băng Đô Gấu Trúc'), 'Inspector title must match accessory name');
  assert.strictEqual(inspectorState.hasEquipBtn, true, 'Inspector must have equip button');

  // Step 4: Click equip button
  console.log('[Test] Step 4: Click Equip Button...');
  const afterEquipState = await page.evaluate(async () => {
    const km = window.__kitchenModal;
    const fs = window.__fashionSystem;
    const ws = window.__worldScene;

    const equipBtn = document.querySelector('[data-equip-accessory-id="acc_panda_headband"]');
    equipBtn.click();
    await new Promise(r => setTimeout(r, 300));

    const dropzone = document.getElementById('bag-accessory-dropzone');
    const isEquippedInDropzone = dropzone?.classList.contains('is-equipped');
    const accCells = document.querySelectorAll('.bag-slot-cell.is-accessory-cell');
    const heroAccId = ws.hero.accessoryId;
    const heroAccVisible = ws.hero.accessorySprite?.visible;

    return {
      isEquippedInDropzone,
      accInBagGrid: accCells.length,
      heroAccId,
      heroAccVisible,
      fsEquippedId: fs.getState().equippedAccessoryId
    };
  });

  console.log('[Test] After Equip State:', afterEquipState);
  assert.strictEqual(afterEquipState.isEquippedInDropzone, true, 'Accessory dropzone must show equipped status');
  assert.strictEqual(afterEquipState.accInBagGrid, 0, 'Equipped accessory must disappear from bag grid (transferred to dropzone)');
  assert.strictEqual(afterEquipState.heroAccId, 'acc_panda_headband', 'Hero must equip acc_panda_headband');
  assert.strictEqual(afterEquipState.heroAccVisible, true, 'Hero accessory sprite must be visible on map');
  assert.strictEqual(afterEquipState.fsEquippedId, 'acc_panda_headband', 'FashionSystem equippedAccessoryId matches');

  // Step 5: Click unequip button from Inspector
  console.log('[Test] Step 5: Unequip accessory back to Bag...');
  const afterUnequipState = await page.evaluate(async () => {
    const km = window.__kitchenModal;
    const fs = window.__fashionSystem;
    const ws = window.__worldScene;

    // Click dropzone to select equipped accessory
    const dropzone = document.getElementById('bag-accessory-dropzone');
    dropzone.click();
    await new Promise(r => setTimeout(r, 100));

    // Click unequip button in inspector
    const unequipBtn = document.querySelector('[data-unequip-accessory-id="acc_panda_headband"]');
    unequipBtn.click();
    await new Promise(r => setTimeout(r, 300));

    const dropzoneAfter = document.getElementById('bag-accessory-dropzone');
    const accCells = document.querySelectorAll('.bag-slot-cell.is-accessory-cell');
    const heroAccId = ws.hero.accessoryId;
    const heroAccVisible = ws.hero.accessorySprite?.visible;

    return {
      dropzoneIsEmpty: dropzoneAfter?.classList.contains('is-empty'),
      accInBagGrid: accCells.length,
      heroAccId,
      heroAccVisible,
      fsEquippedId: fs.getState().equippedAccessoryId
    };
  });

  console.log('[Test] After Unequip State:', afterUnequipState);
  assert.strictEqual(afterUnequipState.dropzoneIsEmpty, true, 'Dropzone must be empty after unequip');
  assert.strictEqual(afterUnequipState.accInBagGrid, 1, 'Accessory returned to bag grid');
  assert.strictEqual(afterUnequipState.heroAccId, null, 'Hero accessory removed');
  assert.strictEqual(afterUnequipState.fsEquippedId, null, 'FashionSystem equippedAccessoryId is null');

  // Step 6: Test equip by clicking dropzone when accessory is selected in bag
  console.log('[Test] Step 6: Equip again by selecting in bag and clicking dropzone...');
  const fastEquipState = await page.evaluate(async () => {
    const km = window.__kitchenModal;
    const ws = window.__worldScene;

    const accBtn = document.querySelector('[data-accessory-slot="acc_panda_headband"]');
    accBtn.click();
    await new Promise(r => setTimeout(r, 100));

    const dropzoneBefore = document.getElementById('bag-accessory-dropzone');
    dropzoneBefore.click();
    await new Promise(r => setTimeout(r, 300));

    const dropzoneAfter = document.getElementById('bag-accessory-dropzone');
    return {
      isEquipped: dropzoneAfter?.classList.contains('is-equipped'),
      heroAccId: ws.hero.accessoryId
    };
  });

  console.log('[Test] Fast Equip State:', fastEquipState);
  assert.strictEqual(fastEquipState.isEquipped, true, 'Equipped via click on dropzone');
  assert.strictEqual(fastEquipState.heroAccId, 'acc_panda_headband', 'Hero wearing accessory');

  // Capture screenshot of bag with equipped accessory slot
  const screenshotPath = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_accessory_slot_in_bag.png';
  await page.screenshot({ path: screenshotPath });
  console.log(`[Test] Saved verified screenshot to ${screenshotPath}`);

  await browser.close();
  console.log('🎉 ALL ACCESSORY SLOT IN BAG REQUIREMENTS CONFIRMED PASSED WITH 100% SUCCESS!');
}

function inspectorBadgeContainsAccessory(text) {
  return text && (text.includes('Phụ Kiện') || text.includes('👑'));
}

testAccessorySlotInBag().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
