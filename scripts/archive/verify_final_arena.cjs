const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const fileUrl = 'file:///' + path.resolve('game.html').replace(/\\/g, '/');
  await page.goto(fileUrl);

  const outDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

  const testCases = [
    { id: 'enc_map3_2', name: 'Bướm Đêm (Map 3)', spriteKey: 'mon_crystal_moth' },
    { id: 'enc_map3_1', name: 'Thạch Nhũ (Map 3)', spriteKey: 'mon_crystal_sprout' },
    { id: 'enc_map3_3', name: 'Dơi Pha Lê (Map 3)', spriteKey: 'mon_crystal_bat' },
    { id: 'boss_map3', name: 'Rồng Pha Lê (Map 3 Boss)', spriteKey: 'boss_crystal_dragon', isBoss: true },
    { id: 'boss_map1', name: 'Rồng Thần (Map 1 Boss)', spriteKey: 'boss_dragon', isBoss: true }
  ];

  for (const tc of testCases) {
    console.log(`Testing ${tc.name}...`);
    // 1. Mở sàn đấu -> Trạng thái Thủ (Idle)
    await page.evaluate((mon) => {
      window.__battleArenaModal.openArena(mon);
    }, tc);
    await page.waitForTimeout(200);

    const stage = await page.$('.arena-fighters-stage');
    await stage.screenshot({ path: path.join(outDir, `verified_idle_${tc.spriteKey}.png`) });

    // 2. Kích hoạt chiêu thức quái vật (executeMonsterAttack)
    await page.evaluate(() => {
      window.__battleArenaModal.executeMonsterAttack(true); // true = showcase mode
    });
    // Chờ đạn bay đến giữa chừng (bước 4/8 ~ 400ms)
    await page.waitForTimeout(400);
    await stage.screenshot({ path: path.join(outDir, `verified_skill_flight_${tc.spriteKey}.png`) });

    // Chờ nổ impact (bước 8 ~ 800ms)
    await page.waitForTimeout(350);
    await stage.screenshot({ path: path.join(outDir, `verified_skill_impact_${tc.spriteKey}.png`) });

    // Chờ kết thúc impact quay lại trạng thái Thủ
    await page.waitForTimeout(500);
    await stage.screenshot({ path: path.join(outDir, `verified_return_idle_${tc.spriteKey}.png`) });
  }

  await browser.close();
  console.log('✅ Hoàn thành xác minh toàn diện Đấu Trường!');
})();
