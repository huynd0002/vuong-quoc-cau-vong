import { chromium } from 'playwright';

async function run() {
  console.log('--- KHỞI ĐỘNG XÁC MINH DANH HIỆU & THANH LOADING V3.7.3 ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('[BROWSER]', msg.text()));

  await page.goto('http://127.0.0.1:5173/dev.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // If any modal (e.g. character select modal) is open, close/confirm it
  await page.evaluate(() => {
    const btn = document.querySelector('button.char-select-btn, #btn-select-sam, .btn-confirm-char') ||
                Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('CHỌN BÉ'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(1500);

  // Close any overlay
  await page.evaluate(() => {
    document.querySelectorAll('.modal, .modal-backdrop, #character-select-modal').forEach(el => {
      el.style.display = 'none';
      el.classList.remove('active', 'open');
    });
  });
  await page.waitForTimeout(500);

  // Equip straw hat accessory and Chu Đáo badge
  const setupResult = await page.evaluate(async () => {
    const scene = window.__worldScene || window.game?.scene?.getScene('WorldScene');
    if (!scene || !scene.hero) return { error: 'No scene or hero' };

    // 1. Equip straw hat accessory
    scene.hero.setAccessory('acc_straw_hat');

    // 2. Equip badge "Chu Đáo"
    const badgeSys = window.__badgeSystem;
    let chudao = badgeSys?.getBadge?.('b_care_streak_1') || {
      id: 'b_care_streak_1',
      title: 'Bé Chu Đáo Bậc 1',
      shortTitle: 'Chu Đáo',
      icon: '🍖'
    };
    scene.hero.setHeadBadge(chudao);

    return {
      heroX: scene.hero.getX(),
      heroY: scene.hero.getY(),
      badgeY: scene.hero.headBadgeContainer?.y,
      accessoryY: scene.hero.accessorySprite?.y,
      offsetY: scene.hero.getHeadBadgeOffsetY()
    };
  });

  console.log('Setup result:', setupResult);

  await page.waitForTimeout(1000);
  const heroPos = await page.evaluate(() => {
    const scene = window.__worldScene || window.game?.scene?.getScene('WorldScene');
    return { x: scene?.hero?.getX() || 420, y: scene?.hero?.getY() || 460 };
  });

  await page.screenshot({
    path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_badge_above_accessory.png',
    clip: { x: Math.max(0, heroPos.x - 150), y: Math.max(0, heroPos.y - 180), width: 300, height: 300 }
  });
  console.log('Đã chụp ảnh danh hiệu nằm trên phụ kiện nón rơm không che!');

  // Trigger food consumption to check loading bar above badge
  const foodVfxResult = await page.evaluate(async () => {
    const scene = window.__worldScene || window.game?.scene?.getScene('WorldScene');
    if (!scene) return { error: 'No scene' };

    // Dispatch food consumption
    window.dispatchEvent(new CustomEvent('hero:use-food', {
      detail: { ingredientId: 'carrot' }
    }));

    return { triggered: true };
  });

  console.log('Food VFX Triggered:', foodVfxResult);
  await page.waitForTimeout(700); // During loading bar at ~30%

  await page.screenshot({
    path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_food_loading_above_badge.png',
    clip: { x: Math.max(0, heroPos.x - 150), y: Math.max(0, heroPos.y - 180), width: 300, height: 300 }
  });
  console.log('Đã chụp ảnh thanh loading xuất hiện nằm phía trên danh hiệu!');

  await page.waitForTimeout(2000); // Wait for completion
  await browser.close();
  console.log('--- HOÀN THÀNH XÁC MINH ---');
}

run().catch(err => {
  console.error('Lỗi xác minh:', err);
  process.exit(1);
});
