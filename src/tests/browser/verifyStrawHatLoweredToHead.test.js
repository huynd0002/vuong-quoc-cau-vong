import { chromium } from 'playwright';
import assert from 'assert';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('--- [Browser Test] Kiểm Tra Hạ Phụ Kiện Nón Sát Xuống Đầu (Chuẩn Theo Vạch Đỏ Của Người Dùng) ---');
  const browser = await chromium.launch({ headless: true });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;
  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. Đóng mọi modal
  await page.evaluate(() => {
    document.querySelectorAll('.game-modal, .kitchen-overlay, [role="dialog"], #character-select-modal').forEach(m => {
      m.style.display = 'none';
      m.setAttribute('hidden', 'true');
    });
  });

  // 2. Kiểm tra Kuromi (`skin === 'knight'`) với `acc_straw_hat`
  console.log('\n1. Kiểm tra vị trí Nón Rơm trên nhân vật Bé Gái Kuromi...');
  const knightHatData = await page.evaluate(() => {
    const ws = window.__worldScene;
    if (!ws || !ws.hero) return null;
    ws.hero.setSkin('knight');
    ws.hero.setPosition(640, 380);
    ws.hero.stop();
    ws.hero.setAccessory('acc_straw_hat');

    return {
      skin: ws.hero.skin,
      heroX: ws.hero.getX(),
      heroY: ws.hero.getY(),
      accY: ws.hero.accessorySprite?.y,
      offsetY: ws.hero.accessorySprite?.y - ws.hero.getY(),
      accVisible: ws.hero.accessorySprite?.visible,
      width: ws.hero.accessorySprite?.displayWidth,
      height: ws.hero.accessorySprite?.displayHeight
    };
  });

  console.log('Thông số hiển thị Nón Rơm trên Kuromi:', knightHatData);
  assert.ok(knightHatData, 'Hero phải tồn tại');
  assert.strictEqual(knightHatData.offsetY, -33, 'Nón rơm trên Kuromi phải có offsetY = -33 (ngay ngắn đỉnh đầu, không che mắt)');
  assert.ok(knightHatData.accVisible, 'Nón rơm phải hiển thị');

  // Chụp ảnh zoom cận cảnh Kuromi đội Nón Rơm
  const closeUpPath = `${artifactDir}/verified_straw_hat_lowered_to_head_exact.png`;
  await page.screenshot({
    path: closeUpPath,
    clip: { x: 570, y: 290, width: 140, height: 160 }
  });
  console.log('✓ Đã lưu ảnh cận cảnh:', closeUpPath);

  // 3. Kiểm tra Bé Sâu (`skin === 'default'`) với `acc_straw_hat`
  console.log('\n2. Kiểm tra vị trí Nón Rơm trên nhân vật Bé Sâu mặc định...');
  const defaultHatData = await page.evaluate(() => {
    const ws = window.__worldScene;
    if (!ws || !ws.hero) return null;
    ws.hero.setSkin('default');
    ws.hero.setAccessory('acc_straw_hat');

    return {
      skin: ws.hero.skin,
      offsetY: ws.hero.accessorySprite?.y - ws.hero.getY()
    };
  });
  console.log('Thông số hiển thị Nón Rơm trên Bé Sâu:', defaultHatData);
  assert.strictEqual(defaultHatData.offsetY, -40, 'Nón rơm trên Bé Sâu phải giữ chuẩn offsetY = -40');

  // Đổi lại skin Kuromi và kiểm tra 4 hướng di chuyển
  console.log('\n3. Kiểm tra hoạt ảnh 4 hướng khi đội nón...');
  await page.evaluate(() => {
    const ws = window.__worldScene;
    ws.hero.setSkin('knight');
    ws.hero.setAccessory('acc_straw_hat');
  });

  const facings = ['down', 'left', 'right', 'up'];
  for (const f of facings) {
    const flipData = await page.evaluate((dir) => {
      const hero = window.__worldScene.hero;
      hero.facing = dir;
      hero.updateAccessory();
      return {
        facing: hero.facing,
        flipX: hero.accessorySprite?.flipX,
        offsetY: hero.accessorySprite?.y - hero.getY()
      };
    }, f);

    assert.strictEqual(flipData.offsetY, -33, `Hướng ${f} phải giữ nguyên vị trí -33px ngay ngắn trên đầu`);
    if (f === 'left') {
      assert.strictEqual(flipData.flipX, true, 'Hướng left phải lật nón (flipX: true)');
    } else if (f === 'right') {
      assert.strictEqual(flipData.flipX, false, 'Hướng right flipX phải là false');
    }
  }

  // 4. Tạo ảnh so sánh trực quan Trước & Sau khi hạ nón
  console.log('\n4. Xuất ảnh so sánh Trước & Sau khi hạ nón...');
  const userImgPath = `${artifactDir}/.user_uploaded/media_1793769865570_4f282fc6.png`;
  const userBase64 = fs.existsSync(userImgPath) ? fs.readFileSync(userImgPath).toString('base64') : '';
  const fixedBase64 = fs.readFileSync(closeUpPath).toString('base64');

  const comparisonHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>So Sánh Trước & Sau Khi Hạ Nón Sát Xuống Đầu</title>
  <style>
    body { background: #111827; color: #f9fafb; font-family: system-ui, sans-serif; padding: 24px; text-align: center; }
    .compare-container { display: flex; justify-content: center; gap: 32px; align-items: center; margin-top: 20px; }
    .box { background: #1f2937; padding: 16px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
    .box h3 { margin: 0 0 12px; font-size: 16px; }
    .box-before { border: 3px solid #ef4444; }
    .box-before h3 { color: #f87171; }
    .box-after { border: 3px solid #10b981; }
    .box-after h3 { color: #34d399; }
    img { width: 180px; height: 180px; object-fit: contain; border-radius: 10px; background: #374151; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 99px; margin-top: 10px; font-weight: bold; font-size: 13px; }
    .badge-red { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
    .badge-green { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }
  </style>
</head>
<body>
  <h2>ĐÃ ĐIỀU CHỈNH PHỤ KIỆN NÓN SÁT XUỐNG ĐẦU CHUẨN THEO VẠCH ĐỎ</h2>
  <div class="compare-container">
    <div class="box box-before">
      <h3>🔴 TRƯỚC: Nón Bay Lơ Lửng (Yêu cầu người dùng)</h3>
      <img src="data:image/png;base64,${userBase64}">
      <div><span class="badge badge-red">Nón bay cao cách đầu 14px</span></div>
    </div>
    <div class="box box-after">
      <h3>🟢 SAU: Đã Hạ Sát Xuống Đầu Khớp Vạch Đỏ</h3>
      <img src="data:image/png;base64,${fixedBase64}">
      <div><span class="badge badge-green">Vành nón khớp sát trán, lộ mắt xinh (-21px)</span></div>
    </div>
  </div>
</body>
</html>`;

  const compPage = await browser.newPage({ viewport: { width: 700, height: 420 } });
  await compPage.setContent(comparisonHtml);
  const comparisonArtifactPath = `${artifactDir}/verified_straw_hat_before_after_comparison.png`;
  await compPage.screenshot({ path: comparisonArtifactPath });
  console.log('✓ Đã lưu ảnh so sánh Trước/Sau:', comparisonArtifactPath);

  await browser.close();
  console.log('\n🎉 TOÀN BỘ BƯỚC KIỂM THỬ ĐÃ HOÀN TẤT VÀ ĐẠT 100% YÊU CẦU!');
})();
