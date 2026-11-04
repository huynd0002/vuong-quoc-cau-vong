const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  
  const fileUrl = 'file:///' + path.resolve('game.html').replace(/\\/g, '/');
  await page.goto(fileUrl);
  
  const testMonsters = [
    { id: 'enc_map1_1', name: 'Nấm Con', spriteKey: 'mushroom' },
    { id: 'enc_map1_2', name: 'Ong Vàng', spriteKey: 'bee' },
    { id: 'enc_map1_3', name: 'Bọ Rùa', spriteKey: 'ladybug' },
    { id: 'boss_map1', name: 'Rồng Thần', spriteKey: 'boss_dragon', isBoss: true },
    { id: 'enc_map2_1', name: 'Cua Nhỏ', spriteKey: 'mon_crab' },
    { id: 'enc_map2_2', name: 'Sao Biển', spriteKey: 'mon_starfish' },
    { id: 'enc_map2_3', name: 'Cua Ngọc Bích', spriteKey: 'mon_emerald_crab' },
    { id: 'boss_map2', name: 'Cua Vua', spriteKey: 'boss_crab_king', isBoss: true },
    { id: 'enc_map3_1', name: 'Thạch Nhũ', spriteKey: 'mon_crystal_sprout' },
    { id: 'enc_map3_2', name: 'Bướm Đêm', spriteKey: 'mon_crystal_moth' },
    { id: 'enc_map3_3', name: 'Dơi Pha Lê', spriteKey: 'mon_crystal_bat' },
    { id: 'boss_map3', name: 'Rồng Pha Lê', spriteKey: 'boss_crystal_dragon', isBoss: true }
  ];

  for (const m of testMonsters) {
    await page.evaluate((mon) => {
      window.__battleArenaModal.openArena(mon);
    }, m);
    await page.waitForTimeout(150);
    const box = await page.$('.arena-fighters-stage');
    if (box) {
      await box.screenshot({ path: `scratch/stage_${m.spriteKey}.png` });
    }
  }
  await browser.close();
  console.log('Done stage screenshots');
})();
