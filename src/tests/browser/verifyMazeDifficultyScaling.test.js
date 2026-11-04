import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function run() {
  console.log('🚀 Bắt đầu kiểm thử Mê Cung: Càng map cao thì càng khó, đường đi nhỏ lại để bé cẩn thận hơn...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Đóng dialog mở đầu
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-modal')?.remove();
  });

  // TEST 1: KIỂM THỬ MAP 1 (Lối đi rộng rãi, 6x4)
  console.log('\n--- TEST 1: MAP 1 - LỐI ĐI RỘNG RÃI ---');
  await page.evaluate(() => {
    const mazeModal = window.__mazeModal;
    mazeModal.show({ mapLevel: 1 });
  });
  await page.waitForTimeout(600);

  const map1Cols = await page.evaluate(() => window.__mazeModal.cols);
  const map1Rows = await page.evaluate(() => window.__mazeModal.rows);
  const map1Badge = await page.locator('#maze-difficulty-pill').textContent();
  console.log(`Map 1 Grid: ${map1Cols}x${map1Rows}, Badge: ${map1Badge}`);

  if (map1Cols !== 6 || map1Rows !== 4) {
    throw new Error(`Kỳ vọng Map 1 có lưới 6x4, thực tế: ${map1Cols}x${map1Rows}`);
  }

  await page.screenshot({
    path: path.join(artifactDir, 'verified_maze_map1_wide_corridors.png')
  });
  console.log('✓ Đã chụp ảnh Map 1 với đường đi rộng rãi cho bé mới bắt đầu');

  // TEST 2: KIỂM THỬ MAP 4 (Đường đi nhỏ hẹp, 9x6)
  console.log('\n--- TEST 2: MAP 4 - ĐƯỜNG ĐI NHỎ HẸP ---');
  await page.evaluate(() => {
    const mazeModal = window.__mazeModal;
    mazeModal.show({ mapLevel: 4 });
  });
  await page.waitForTimeout(600);

  const map4Cols = await page.evaluate(() => window.__mazeModal.cols);
  const map4Rows = await page.evaluate(() => window.__mazeModal.rows);
  const map4Badge = await page.locator('#maze-difficulty-pill').textContent();
  console.log(`Map 4 Grid: ${map4Cols}x${map4Rows}, Badge: ${map4Badge}`);

  if (map4Cols !== 9 || map4Rows !== 6) {
    throw new Error(`Kỳ vọng Map 4 có lưới 9x6, thực tế: ${map4Cols}x${map4Rows}`);
  }

  await page.screenshot({
    path: path.join(artifactDir, 'verified_maze_map4_narrow_corridors.png')
  });
  console.log('✓ Đã chụp ảnh Map 4 với đường đi nhỏ hẹp thử thách');

  // TEST 3: KIỂM THỬ MAP 6 (Đại mê cung cao cấp, đường cực hẹp 12x8, bé cẩn thận hơn)
  console.log('\n--- TEST 3: MAP 6 - ĐƯỜNG CỰC HẸP, ĐỘ KHÓ CAO NHẤT ---');
  await page.evaluate(() => {
    const mazeModal = window.__mazeModal;
    mazeModal.show({ mapLevel: 6 });
  });
  await page.waitForTimeout(600);

  const map6Cols = await page.evaluate(() => window.__mazeModal.cols);
  const map6Rows = await page.evaluate(() => window.__mazeModal.rows);
  const map6Badge = await page.locator('#maze-difficulty-pill').textContent();
  console.log(`Map 6 Grid: ${map6Cols}x${map6Rows}, Badge: ${map6Badge}`);

  if (map6Cols !== 12 || map6Rows !== 8) {
    throw new Error(`Kỳ vọng Map 6 có lưới 12x8, thực tế: ${map6Cols}x${map6Rows}`);
  }

  // Vẽ thử một đoạn đường mẫu trong mê cung Map 6
  await page.evaluate(() => {
    const mazeModal = window.__mazeModal;
    // Lấy 4 điểm đầu tiên từ shortestPath
    const sampleNodes = mazeModal.shortestPath.slice(0, 5);
    const pts = sampleNodes.map(n => {
      const c = mazeModal.getCellCoordinates(n.c, n.r);
      return { x: c.centerX, y: c.centerY };
    });
    mazeModal.playerPath = pts;
    mazeModal.draw();
  });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(artifactDir, 'verified_maze_map6_super_narrow_careful.png')
  });
  console.log('✓ Đã chụp ảnh Map 6 với đường đi cực nhỏ, nét vẽ thanh thoát và tỉ mỉ');

  await browser.close();
  console.log('🎉 TẤT CẢ CÁC BÀI KIỂM THỬ ĐỘ KHÓ MÊ CUNG THEO MAP ĐỀU THÀNH CÔNG RỰC RỠ!');
}

run().catch(err => {
  console.error('❌ Lỗi kiểm thử:', err);
  process.exit(1);
});
