import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4208, strictPort: true } });
const browser = await chromium.launch({ headless: true });

async function enterWorld(page) {
  await page.waitForFunction(() => window.__worldScene && window.__worldScene.sys.isActive(), null, { timeout: 20000 });
  await page.waitForFunction(() => {
    const n = document.getElementById('initial-loading-screen');
    return !n || getComputedStyle(n).display === 'none';
  }, null, { timeout: 20000 });

  const start = page.locator('#char-btn-start-adventure');
  if (await start.isVisible()) await start.click();
  const story = page.locator('#story-start-button');
  if (await story.isVisible()) await story.click();
  await page.waitForFunction(() => window.__worldScene?.sys.isActive() && window.__worldScene.isExploring, null, { timeout: 20000 });
}

try {
  console.log('=== KIỂM THỬ: BẾP LÒ TẠI (981, 167), POP-UP LIÊN KẾT & KÉO THẢ NGUYÊN LIỆU + VFX LỬA NẤU ===');
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4208/game.html', { waitUntil: 'networkidle' });
  await enterWorld(page);

  // 1. Chuyển vào map_kitchen để kiểm tra vị trí bếp lò
  console.log('Chuyển scene sang map_kitchen...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    scene.scene.restart({ mapId: 'map_kitchen' });
  });

  await page.waitForFunction(() => window.__worldScene?.currentMapId === 'map_kitchen' && window.__worldScene.sys.isActive(), null, { timeout: 15000 });
  await page.waitForTimeout(600);

  // 2. Kiểm tra trạm station_cook trong mapConfig của map_kitchen
  const stationCook = await page.evaluate(() => {
    const scene = window.__worldScene;
    return scene.mapConfig?.kitchenStations?.find(s => s.type === 'cook');
  });
  console.log('Trạm station_cook tại:', stationCook);
  assert.ok(stationCook, 'Trạm Bếp Lò (station_cook) phải tồn tại trong map_kitchen');
  assert.equal(stationCook.x, 981, 'Tọa độ X của Bếp Lò phải là 981');
  assert.equal(stationCook.y, 167, 'Tọa độ Y của Bếp Lò phải là 167');

  // Chụp ảnh bếp lò tại vị trí (981, 167) trên bản đồ bếp
  const screenshotStove = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\verify_kitchen_stove_981_167.png';
  await page.screenshot({ path: screenshotStove });
  console.log('Đã lưu ảnh bếp lò tại (981, 167):', screenshotStove);

  // 3. Click vào Bếp Lò Nấu Ăn Thần Kỳ (hoặc click trực tiếp lên vị trí 981, 167) -> Kiểm tra Pop-up Bếp Cầu Vồng hiện lên!
  console.log('Click vào Bếp lò tại (981, 167)...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    const cookSt = scene.kitchenStationContainers?.find(st => st.data.type === 'cook');
    if (cookSt) {
      scene.handleKitchenStationInteraction(cookSt.data);
    }
  });

  // Kiểm tra Pop-up KitchenModal mở lên
  await page.waitForFunction(() => {
    const modal = document.getElementById('kitchen-modal');
    return modal && !modal.hidden && getComputedStyle(modal).display !== 'none';
  }, null, { timeout: 10000 });

  assert.equal(await page.locator('#kitchen-modal').isVisible(), true, 'Pop-up Bếp Cầu Vồng phải hiện lên khi bấm vào Bếp Lò!');
  console.log('✓ Pop-up Bếp Cầu Vồng đã mở thành công từ Bếp Lò!');

  // 4. Bắt đầu nấu món "Sữa chua trái cây"
  await page.locator('[data-recipe="fruit_yogurt"]').click();
  await page.waitForTimeout(300);

  // Rửa tay bước đầu tiên
  await page.locator('[data-choice="wash"]').click();
  await page.waitForTimeout(300);

  // 5. Kiểm tra Giao diện Kéo Thả Nguyên Liệu: Nồi/Chảo Dropzone & Túi Nguyên Liệu
  const hasDropzone = await page.locator('#kitchen-pot-dropzone').isVisible();
  assert.equal(hasDropzone, true, 'Khu vực Nồi/Chảo Dropzone phải hiển thị rõ ràng');

  const hasBag = await page.locator('.kitchen-bag-panel').isVisible();
  assert.equal(hasBag, true, 'Túi nguyên liệu của bé phải hiển thị');

  // Kiểm tra các item nguyên liệu có thuộc tính draggable="true"
  const draggableCount = await page.locator('.kitchen-drag-item[draggable="true"]').count();
  console.log('Số lượng nguyên liệu có thể kéo thả:', draggableCount);
  assert.ok(draggableCount >= 3, 'Phải có ít nhất 3 lựa chọn nguyên liệu kéo thả');

  // Chụp ảnh giao diện kéo thả nguyên liệu
  const screenshotDragDrop = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\verify_kitchen_drag_drop_stage.png';
  await page.screenshot({ path: screenshotDragDrop });
  console.log('Đã lưu ảnh giao diện kéo thả nguyên liệu:', screenshotDragDrop);

  // 6. Thực hiện kéo thả nguyên liệu (HTML5 drag & drop simulate)
  console.log('Kéo thả 2 phần chuối vào Nồi/Chảo...');
  await page.evaluate(() => {
    const dropzone = document.querySelector('#kitchen-pot-dropzone');
    const dragItem = document.querySelector('[data-choice="2"]');
    
    // Dispatch dragstart
    const dt = new DataTransfer();
    dt.setData('text/plain', '2');
    dragItem.dispatchEvent(new DragEvent('dragstart', { dataTransfer: dt, bubbles: true }));

    // Dispatch dragover trên dropzone
    dropzone.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));

    // Dispatch drop vào dropzone
    dropzone.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
  });

  await page.waitForTimeout(400);

  // Kéo tiếp 1 phần sữa chua vào chảo
  console.log('Kéo thả 1 phần sữa chua vào chảo...');
  await page.evaluate(() => {
    const dropzone = document.querySelector('#kitchen-pot-dropzone');
    const dragItem = document.querySelector('[data-choice="1"]');
    const dt = new DataTransfer();
    dt.setData('text/plain', '1');
    dragItem.dispatchEvent(new DragEvent('dragstart', { dataTransfer: dt, bubbles: true }));
    dropzone.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));
    dropzone.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
  });

  await page.waitForTimeout(400);

  // Trộn nhẹ
  await page.locator('[data-choice="Trộn nhẹ"]').click();
  await page.waitForTimeout(300);

  // 7. Chọn nhiệt độ & bắt đầu nấu
  console.log('Chọn tắt bếp cho món nguội (off)...');
  await page.locator('[data-choice="off"]').click();
  await page.waitForTimeout(300);

  // 8. Bấm nút nấu (chọn 2 nhịp) -> BẮT ĐẦU LOADING NẤU & HIỆN VFX LỬA NẤU
  console.log('Bắt đầu nấu món ăn (chọn 2 nhịp)...');
  await page.locator('[data-choice="2"]').click();

  // Kiểm tra loading tiến trình nấu và VFX lửa nấu
  await page.waitForSelector('.kitchen-clock-stage progress', { timeout: 5000 });
  const isSimmering = await page.locator('.kitchen-cooking-simmer').isVisible();
  assert.equal(isSimmering, true, 'Nồi nấu phải có hiệu ứng sôi sùng sục');

  const hasFireVfx = await page.locator('.kitchen-stove-fire').isVisible();
  assert.equal(hasFireVfx, true, 'VFX Lửa bếp lò phải hiển thị');

  // Chụp ảnh bằng chứng Loading nấu & VFX lửa bếp lò
  const screenshotCooking = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b4d73263-dfb7-48f9-a7e6-9542f5c3bba5\\verify_kitchen_cooking_vfx.png';
  await page.screenshot({ path: screenshotCooking });
  console.log('Đã lưu ảnh Loading nấu & VFX Lửa nấu:', screenshotCooking);

  // Đợi hoàn thành nấu
  await page.waitForSelector('[data-choice="safe"]', { timeout: 6000 });
  await page.locator('[data-choice="safe"]').click();
  await page.waitForTimeout(400);

  // Cất món vào hộp
  await page.locator('[data-action="claim"]').click();
  await page.waitForTimeout(400);

  console.log('=== TẤT CẢ KIỂM THỬ BẾP LÒ (981, 167), POP-UP VÀ KÉO THẢ NGUYÊN LIỆU + VFX LỬA NẤU ĐỀU THÀNH CÔNG RỰC RỠ! ===');
} catch (err) {
  console.error('LỖI KIỂM THỬ:', err);
  process.exitCode = 1;
} finally {
  await browser.close();
  await server.close();
}
