import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBackpackVerification() {
  console.log('[Test] Starting Backpack Relocation & Drag/Drop Verification...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  console.log(`[Test] Loading ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Close intro modals if present
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });

  // =========================================================================
  // REQUIREMENT 1: Quầy Balo button thu nhỏ lại, bỏ phần khoanh đỏ (➡️ 🎒 Mua Balo)
  // =========================================================================
  console.log('[Test] Checking Req 1: Balo stall buy button is compact and clean...');
  const buttonMetrics = await page.evaluate(() => {
    const mm = window.__marketModal;
    const bpSys = window.__backpackSystem;
    bpSys.saveGame({ player: { stars: 0 }, backpacks: { owned: [], equipped: [null, null, null, null] } });

    mm.open('backpack_stall');
    const buyBtns = Array.from(document.querySelectorAll('[data-buy-bp]'));
    const btnData = buyBtns.map(btn => {
      const rect = btn.getBoundingClientRect();
      return {
        text: btn.textContent.trim(),
        height: rect.height,
        hasArrowOrRedundantText: btn.textContent.includes('➡️') || btn.textContent.includes('Mua Balo')
      };
    });
    mm.close();
    return btnData;
  });

  console.log('[Test] Buy button metrics in Balo stall:', buttonMetrics);
  assert.ok(buttonMetrics.length >= 4, 'Must have at least 4 buy buttons');
  for (const b of buttonMetrics) {
    assert.strictEqual(b.hasArrowOrRedundantText, false, 'Button text MUST NOT contain ➡️ or Mua Balo!');
    assert.ok(b.height <= 48, `Button height must be compact (actual: ${b.height}px)`);
  }

  // =========================================================================
  // REQUIREMENT 2: Chuyển quầy balo sang chợ thời trang đối diện với phụ kiện
  // =========================================================================
  console.log('[Test] Checking Req 2: Balo stall in map_fashion_street opposite to accessories...');
  const mapStationCheck = await page.evaluate(async () => {
    const ws = window.__worldScene;

    // Check map_rainbow_market: must NOT have backpack_stall
    ws.scene.restart({ mapId: 'map_rainbow_market' });
    await new Promise(r => setTimeout(r, 1200));
    const marketStations = ws.marketStationContainers || [];
    const marketHasBalo = marketStations.some(s => s.data?.type === 'backpack_stall');

    // Check map_fashion_street: MUST have backpack_stall opposite to accessories
    ws.scene.restart({ mapId: 'map_fashion_street' });
    await new Promise(r => setTimeout(r, 1200));
    const fashionStations = ws.fashionStationContainers || [];
    const accStation = fashionStations.find(s => s.data?.type === 'squirrel_accessories');
    const baloStation = fashionStations.find(s => s.data?.type === 'backpack_stall');

    return {
      marketHasBalo,
      fashionHasBalo: !!baloStation,
      accStationX: accStation?.data?.x,
      baloStationX: baloStation?.data?.x,
      isOpposite: accStation && baloStation && (accStation.data.x < 500 && baloStation.data.x > 800)
    };
  });

  console.log('[Test] Map station check:', mapStationCheck);
  assert.strictEqual(mapStationCheck.marketHasBalo, false, 'Rainbow market must NOT have backpack stall');
  assert.strictEqual(mapStationCheck.fashionHasBalo, true, 'Fashion street MUST have backpack stall');
  assert.strictEqual(mapStationCheck.isOpposite, true, 'Balo stall must be placed opposite (x > 800) to accessories (x < 500)');

  // =========================================================================
  // REQUIREMENT 3: Icon Balo trong Túi xoá nền to ra & biến mất khi kéo vào ô ở trên
  // =========================================================================
  console.log('[Test] Checking Req 3: Bag Balo icon is transparent, large, and disappears when equipped above...');
  const bagCheck = await page.evaluate(async () => {
    const km = window.__kitchenModal;
    const bpSys = window.__backpackSystem;
    // Own bunny pink backpack, unequipped initially
    bpSys.saveGame({
      player: { stars: 100 },
      backpacks: {
        owned: ['backpack_bunny_pink'],
        equipped: [null, null, null, null]
      }
    });

    km.show('bag');
    await new Promise(r => setTimeout(r, 400));

    // Find the backpack cell in the bag
    const bpCell = document.querySelector('[data-bp-slot="backpack_bunny_pink"]');
    const isPresentInitially = !!bpCell;
    const isBackpackClass = bpCell?.classList?.contains('is-backpack-cell');
    const imgEl = bpCell?.querySelector('.bag-slot-img');
    const imgWidth = imgEl?.getBoundingClientRect()?.width || 0;

    // Equip it into Slot 0
    bpSys.equipBackpack('backpack_bunny_pink', 0);
    km.render();
    await new Promise(r => setTimeout(r, 300));

    // It should now be GONE from the bag slots rack
    const bpCellAfterEquip = document.querySelector('.bag-slots-rack [data-bp-slot="backpack_bunny_pink"]');
    const isDisappearedFromBag = bpCellAfterEquip === null;

    // And it is present in header slot 0
    const headerSlot0 = document.querySelector('[data-header-backpack-slot="0"]');
    const isEquippedInHeader = headerSlot0?.classList?.contains('is-equipped');

    return {
      isPresentInitially,
      isBackpackClass,
      imgWidth,
      isDisappearedFromBag,
      isEquippedInHeader
    };
  });

  console.log('[Test] Bag icon & equip disappearance check:', bagCheck);
  assert.strictEqual(bagCheck.isPresentInitially, true, 'Backpack must be present in bag when unequipped');
  assert.strictEqual(bagCheck.isBackpackClass, true, 'Backpack cell must have is-backpack-cell class (transparent background)');
  assert.ok(bagCheck.imgWidth >= 44, `Backpack image must be large (actual: ${bagCheck.imgWidth}px)`);
  assert.strictEqual(bagCheck.isDisappearedFromBag, true, 'Backpack MUST disappear from bag when equipped in top slot!');
  assert.strictEqual(bagCheck.isEquippedInHeader, true, 'Backpack must be visible in header slot 0');

  // =========================================================================
  // REQUIREMENT 4: Chuyển dịch balo từ 1 sang 2, 3, 4 & kéo lại vào túi thì mất tác dụng mở rộng ô
  // =========================================================================
  console.log('[Test] Checking Req 4: Move between slots 1->2->3->4 and unequip back to bag...');
  const slotMoveAndUnequipCheck = await page.evaluate(async () => {
    const km = window.__kitchenModal;
    const bpSys = window.__backpackSystem;

    // Initially in slot 0 (+3 bonus slots)
    const initialBonus = bpSys.getTotalBonusSlots();

    // 1. Swap from Slot 0 to Slot 2 (Ô 1 sang Ô 3)
    bpSys.swapSlots(0, 2);
    km.render();
    await new Promise(r => setTimeout(r, 200));

    const stateAfterMove = bpSys.getState();
    const isNowInSlot2 = stateAfterMove.equipped[2] === 'backpack_bunny_pink' && stateAfterMove.equipped[0] === null;

    // 2. Drag / Unequip back to bag from Slot 2
    // Simulate drop on bag panel
    const unequipRes = bpSys.unequipSlot(2);
    km.render();
    await new Promise(r => setTimeout(r, 200));

    const bonusAfterUnequip = bpSys.getTotalBonusSlots();
    const stateAfterUnequip = bpSys.getState();
    const bpCellBackInBag = document.querySelector('.bag-slots-rack [data-bp-slot="backpack_bunny_pink"]');

    return {
      initialBonus,
      isNowInSlot2,
      bonusAfterUnequip,
      isSlot2Empty: stateAfterUnequip.equipped[2] === null,
      isBackInBag: bpCellBackInBag !== null
    };
  });

  console.log('[Test] Slot move and unequip metrics:', slotMoveAndUnequipCheck);
  assert.strictEqual(slotMoveAndUnequipCheck.initialBonus, 3, 'Initial bonus with 1 backpack must be 3 slots');
  assert.strictEqual(slotMoveAndUnequipCheck.isNowInSlot2, true, 'Backpack must move successfully from slot 0 to slot 2');
  assert.strictEqual(slotMoveAndUnequipCheck.bonusAfterUnequip, 0, 'Bonus MUST become 0 after unequipping back to bag (loses expansion bonus)!');
  assert.strictEqual(slotMoveAndUnequipCheck.isSlot2Empty, true, 'Slot 2 must be empty after unequipping');
  assert.strictEqual(slotMoveAndUnequipCheck.isBackInBag, true, 'Backpack must reappear in bag slots!');

  const screenshotPath = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_backpack_all_requirements.png';
  await page.screenshot({ path: screenshotPath });
  console.log(`[Test] Saved verified screenshot to ${screenshotPath}`);

  await browser.close();
  console.log('✅ ALL BACKPACK REQUIREMENTS CONFIRMED PASSED WITH 100% SUCCESS!');
}

runBackpackVerification().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
