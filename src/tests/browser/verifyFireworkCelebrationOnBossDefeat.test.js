import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('🚀 Bắt đầu kiểm thử: Hiệu ứng pháo hoa tên lửa (explosions/firework-rocket) ăn mừng hạ gục Boss...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Đóng dialog chọn nhân vật nếu có
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
  });

  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

  // 1. Chuyển đến Map 1
  console.log('\n--- [Test 1] Chuyển đến Map 1 để thử nghiệm pháo hoa hạ gục Boss ---');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    if (ws) {
      ws.scene.restart({ mapId: 'map1' });
    }
  });
  await page.waitForTimeout(1800);

  // 2. Kích hoạt sự kiện giải cứu / hạ gục Boss (game:boss-resolved)
  console.log('2. Kích hoạt sự kiện game:boss-resolved (Hạ gục Boss)...');
  const launchStatus = await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:boss-resolved', {
      detail: {
        encounterId: 'boss_dragon',
        bossName: 'Rồng Thần Mùa Thu',
        reward: { stars: 5, exp: 50 },
        unlockedNewMap: 'map2'
      }
    }));

    const canvas = document.getElementById('firework-celebration-canvas');
    return {
      canvasExists: Boolean(canvas),
      canvasDisplay: canvas ? getComputedStyle(canvas).display : null,
      canvasWidth: canvas?.width,
      canvasHeight: canvas?.height
    };
  });

  console.log('Trạng thái Canvas pháo hoa khi Boss ngã xuống:', launchStatus);
  assert.strictEqual(launchStatus.canvasExists, true, 'Canvas pháo hoa phải được tự động tạo và gắn vào giao diện');
  assert.strictEqual(launchStatus.canvasDisplay, 'block', 'Canvas pháo hoa phải đang hiển thị (display: block)');

  // 3. Đợi pháo hoa bay lên và nổ tung (khoảng 1.2s - 2.0s)
  console.log('3. Đợi pháo hoa vút bay lên bầu trời và nổ bung chùm sao lấp lánh...');
  await page.waitForTimeout(1600);

  // Kiểm tra canvas có pixel pháo hoa đang được vẽ
  const pixelCheck = await page.evaluate(() => {
    const canvas = document.getElementById('firework-celebration-canvas');
    if (!canvas) return { hasPixels: false, nonZeroPixels: 0 };
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let nonZero = 0;
    for (let i = 3; i < imgData.data.length; i += 4) {
      if (imgData.data[i] > 10) nonZero++;
    }
    return {
      hasPixels: nonZero > 100,
      nonZeroPixels: nonZero
    };
  });

  console.log('Kết quả kiểm tra pixel pháo hoa đang nổ:', pixelCheck);
  assert.strictEqual(pixelCheck.hasPixels, true, `Pháo hoa phải đang vẽ pixel rực rỡ, tìm thấy ${pixelCheck.nonZeroPixels} pixels`);

  // Chụp ảnh lưu minh chứng
  const screenshotPath = path.join(artifactDir, 'verified_boss_victory_firework_rocket_burst.png');
  await page.screenshot({ path: screenshotPath });
  console.log('✓ Đã lưu ảnh minh chứng pháo hoa nổ ăn mừng:', screenshotPath);

  console.log('\n🎉 TOÀN BỘ BÀI TEST HIỆU ỨNG PHÁO HOA TÊN LỬA PIXELFX ĐÃ ĐẠT 100%!');
  await browser.close();
}

runTest().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
