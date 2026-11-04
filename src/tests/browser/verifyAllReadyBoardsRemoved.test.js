import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('[Test] Kiểm tra: Bỏ tất cả các bảng sẵn sàng (Story Intro Popups) trên toàn bộ bản đồ...');

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

  // 1. Kiểm tra Làng Quê Yên Bình (map_village): Vào thẳng, không có pop-up Bé Sẵn Sàng
  console.log('\n--- [Test 1] Chuyển đến Làng Quê Yên Bình: Không hiển thị bảng Bé Sẵn Sàng ---');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    if (scene) {
      scene.scene.restart({ mapId: 'map_village' });
    }
  });

  await page.waitForTimeout(1800);

  const villageCheck = await page.evaluate(() => {
    const storyModal = document.getElementById('story-modal');
    const isVisible = storyModal && !storyModal.hidden && getComputedStyle(storyModal).display !== 'none';
    const currentMapId = window.__worldScene?.currentMapId;
    return {
      isVisible: Boolean(isVisible),
      currentMapId
    };
  });

  console.log('Kết quả kiểm tra tại Làng Quê Yên Bình:', villageCheck);
  assert.strictEqual(villageCheck.isVisible, false, 'FAIL: Bảng Bé Sẵn Sàng vẫn xuất hiện tại Làng Quê Yên Bình!');

  await page.screenshot({ path: path.join(artifactDir, 'verified_village_direct_entry_no_ready_board.png') });
  console.log('✓ Đã lưu ảnh: verified_village_direct_entry_no_ready_board.png');

  // 2. Kiểm tra Hẻm Núi Gió Hát (map_canyon): Vào thẳng, không có bảng Bé Sẵn Sàng
  console.log('\n--- [Test 2] Chuyển đến Hẻm Núi Gió Hát: Không hiển thị bảng Bé Sẵn Sàng ---');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    if (scene) {
      scene.scene.restart({ mapId: 'map_canyon' });
    }
  });

  await page.waitForTimeout(1800);

  const canyonCheck = await page.evaluate(() => {
    const storyModal = document.getElementById('story-modal');
    const isVisible = storyModal && !storyModal.hidden && getComputedStyle(storyModal).display !== 'none';
    const currentMapId = window.__worldScene?.currentMapId;
    return {
      isVisible: Boolean(isVisible),
      currentMapId
    };
  });

  console.log('Kết quả kiểm tra tại Hẻm Núi Gió Hát:', canyonCheck);
  assert.strictEqual(canyonCheck.isVisible, false, 'FAIL: Bảng Bé Sẵn Sàng vẫn xuất hiện tại Hẻm Núi Gió Hát!');

  await page.screenshot({ path: path.join(artifactDir, 'verified_canyon_direct_entry_no_ready_board.png') });
  console.log('✓ Đã lưu ảnh: verified_canyon_direct_entry_no_ready_board.png');

  // 3. Kiểm tra gọi trực tiếp storyIntroModal.show(): Vẫn bị ẩn tuyệt đối
  console.log('\n--- [Test 3] Kiểm tra gọi storyIntroModal.show: Không hiển thị bảng ---');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:open-story-intro', {
      detail: {
        title: 'Chào mừng đến Vùng Đất Mới',
        story: 'Đây là câu chuyện giới thiệu',
        voice: 'Chào mừng bé'
      }
    }));
  });

  await page.waitForTimeout(600);

  const manualCheck = await page.evaluate(() => {
    const storyModal = document.getElementById('story-modal');
    return {
      hidden: storyModal?.hidden,
      display: storyModal ? getComputedStyle(storyModal).display : 'none'
    };
  });

  console.log('Kết quả kiểm tra ép mở bảng:', manualCheck);
  assert.strictEqual(manualCheck.display, 'none', 'FAIL: Bảng Bé Sẵn Sàng bị ép mở hiển thị!');

  console.log('\n🎉 TOÀN BỘ TESTS XÁC THỰC BỎ TẤT CẢ BẢNG SẴN SÀNG ĐÃ THÀNH CÔNG RỰC RỠ!');
  await browser.close();
}

runTest().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
