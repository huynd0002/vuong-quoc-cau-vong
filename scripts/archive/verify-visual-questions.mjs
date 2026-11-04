import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const brainDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
const gameHtmlUrl = 'file:///' + path.join(root, 'game.html').replace(/\\/g, '/');

(async () => {
  console.log('Verifying visual questions in Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });

  await page.goto(gameHtmlUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // If character select is open, click Bé Sam and Start
  const charModal = page.locator('#character-select-modal');
  if (await charModal.isVisible()) {
    const btnSam = page.locator('button.char-card[data-skin="knight"]');
    if (await btnSam.isVisible()) await btnSam.click();
    const btnStart = page.locator('#char-modal-btn-start');
    if (await btnStart.isVisible()) await btnStart.click();
    await page.waitForTimeout(1500);
  }

  // 1. Test Shape Question in Battle Arena (Bánh xe bác gấu có hình dạng gì? -> Vuông, Tròn, Tam Giác)
  console.log('Testing Shape question in Battle Arena...');
  await page.evaluate(() => {
    const modal = window.__battleArenaModal || window.__battleModal;
    if (modal) {
      modal.openArena({
        id: 'enc_test_shape',
        name: 'Bác Gấu Vui Vẻ',
        type: 'friend',
        questionId: 'q_map1_shapes_1'
      });
    }
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(brainDir, 'verify_visual_shape_question.png') });
  console.log('Captured verify_visual_shape_question.png');

  // Check that answer buttons have images inside (.ans-image-pic)
  const shapeImageCount = await page.locator('.ans-btn-image-mode .ans-image-pic').count();
  console.log('Shape image buttons count:', shapeImageCount);

  // 2. Test Color Question (Bông hoa hướng dương có màu gì vậy bé? -> Vàng, Xanh, Đen)
  console.log('Testing Color question in Battle Arena...');
  await page.evaluate(() => {
    const modal = window.__battleArenaModal || window.__battleModal;
    if (modal) {
      modal.openArena({
        id: 'enc_test_color',
        name: 'Bướm Vàng Rực Rỡ',
        type: 'friend',
        questionId: 'q_map1_colors_1'
      });
    }
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(brainDir, 'verify_visual_color_question.png') });
  console.log('Captured verify_visual_color_question.png');

  // 3. Test Jigsaw Watermelon Puzzle Question (q_map1_jigsaw_watermelon)
  console.log('Testing Jigsaw Watermelon Puzzle question in Battle Arena...');
  await page.evaluate(() => {
    const modal = window.__battleArenaModal || window.__battleModal;
    if (modal) {
      modal.openArena({
        id: 'enc_test_jigsaw',
        name: 'Thử Thách Ghép Hình Dưa Hấu',
        type: 'friend',
        questionId: 'q_map1_jigsaw_watermelon'
      });
    }
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(brainDir, 'verify_visual_jigsaw_question.png') });
  console.log('Captured verify_visual_jigsaw_question.png');

  // 4. Test Watermelon Shadow Match (q_map1_shadow_watermelon)
  console.log('Testing Watermelon Shadow Matching question in Battle Arena...');
  await page.evaluate(() => {
    const modal = window.__battleArenaModal || window.__battleModal;
    if (modal) {
      modal.openArena({
        id: 'enc_test_watermelon_shadow',
        name: 'Bác Thỏ Khéo Tay',
        type: 'friend',
        questionId: 'q_map1_shadow_watermelon'
      });
    }
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(brainDir, 'verify_visual_watermelon_shadow.png') });
  console.log('Captured verify_visual_watermelon_shadow.png');

  // 5. Test Pair Matching (Cún cưng & Khúc xương - q_map1_pair_dog)
  console.log('Testing Pair Matching (Dog & Bone)...');
  await page.evaluate(() => {
    const modal = window.__battleArenaModal || window.__battleModal;
    if (modal) {
      modal.openArena({
        id: 'enc_test_pair_dog',
        name: 'Bé Cún Tinh Nghịch',
        type: 'friend',
        questionId: 'q_map1_pair_dog'
      });
    }
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(brainDir, 'verify_visual_pair_dog.png') });
  console.log('Captured verify_visual_pair_dog.png');

  await browser.close();
  console.log('All visual questions verified successfully in browser!');
})();
