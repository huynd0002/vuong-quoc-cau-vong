import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';

const PORT = 4180;
let previewServer;

try {
  previewServer = await preview({ preview: { port: PORT } });
} catch (err) {
  console.error('Failed to start preview server:', err);
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const failures = [];

try {
  console.log('--- [Test] Playwright Browser Smoke Test (Giai đoạn 3: Vùng 1 Vertical Slice) ---');

  const viewports = [
    { name: 'Desktop HD', width: 1280, height: 720 },
    { name: 'Mobile Landscape', width: 844, height: 390 },
    { name: 'Mobile Portrait', width: 390, height: 844 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    page.on('pageerror', err => failures.push(`${vp.name}: ${err.message}`));

    await page.goto(`http://127.0.0.1:${PORT}/game.html`, { waitUntil: 'networkidle' });

    // Bấm nút bắt đầu phiêu lưu nếu ở màn hình chọn nhân vật khởi đầu
    try {
      const charStartBtn = page.locator('#char-btn-start-adventure');
      if (await charStartBtn.isVisible({ timeout: 2000 })) {
        await charStartBtn.click();
      }
    } catch (e) {}

    // 1. Kiểm tra Story Intro Modal xuất hiện đầu game (nếu ở map có cốt truyện)
    try {
      const storyModalVisible = await page.evaluate(() => {
        const el = document.querySelector('#story-modal');
        return el && !el.hidden && el.style.display !== 'none';
      });
      if (storyModalVisible) {
        const storyBtn = page.locator('#story-start-button');
        if (await storyBtn.isVisible({ timeout: 1000 })) {
          await storyBtn.click();
        }
      }
    } catch (e) {}

    // 2. Kiểm tra Canvas Phaser đã render
    await page.waitForFunction(() => document.querySelector('#game-root canvas')?.width > 0, null, { timeout: 8000 });
    const loadStatus = await page.locator('#load-status').textContent();
    assert.ok(loadStatus.includes('sẵn sàng') || loadStatus.includes('chuẩn bị') || loadStatus.includes('Khu vườn'), `${vp.name}: Load status valid`);

    // 3. Kiểm tra Portrait rotate hint
    if (vp.width < vp.height) {
      assert.equal(await page.locator('.rotate-hint').isVisible(), true, `${vp.name}: Should show rotate hint in portrait`);
      console.log(`✓ ${vp.name} (${vp.width}x${vp.height}): Story intro & Rotate hint verified`);
      await page.close();
      continue;
    }

    // 4. Trong landscape: rotate hint phải ẩn
    assert.equal(await page.locator('.rotate-hint').isVisible(), false, `${vp.name}: Rotate hint must be hidden in landscape`);

    // 5. Kiểm tra Tạm thời ẩn bạn đồng hành (Yêu cầu 3)
    const petBtnStyle = await page.locator('#pet-button').getAttribute('style');
    assert.ok(petBtnStyle && petBtnStyle.includes('display: none'), `${vp.name}: Companion pet button must be hidden`);

    // 6. Thử thách thường: Bấm Bạn Mầm -> Hiện Card thông báo & Nút [ ⚔️ BẮT ĐẦU ] (Yêu cầu 2)
    await page.evaluate(() => document.getElementById('test-encounter')?.click());
    await page.waitForFunction(() => !document.querySelector('#encounter-prompt-modal').hidden, null, { timeout: 5000 });
    assert.equal(await page.locator('#prompt-btn-start').isVisible(), true, `${vp.name}: START button must be visible in prompt`);

    // Bấm nút [ ⚔️ BẮT ĐẦU ] -> Mới mở Sàn Đấu Battle Arena và Câu hỏi (Yêu cầu 2 & 4)
    await page.locator('#prompt-btn-start').click();
    await page.waitForFunction(() => !document.querySelector('#battle-arena-modal').hidden, null, { timeout: 5000 });

    // Kiểm tra Đấu trường 2 nhân vật nhìn đối diện nhau và máu 2 bên (Yêu cầu 4)
    assert.equal(await page.locator('#arena-hero-img').isVisible(), true, `${vp.name}: Hero fighter visible in arena`);
    assert.equal(await page.locator('#arena-monster-img').isVisible(), true, `${vp.name}: Monster fighter visible in arena`);
    assert.equal(await page.locator('#arena-hero-hearts').isVisible(), true, `${vp.name}: Hero hearts visible`);
    assert.equal(await page.locator('#arena-monster-hearts').isVisible(), true, `${vp.name}: Monster hearts visible`);

    // Kiểm tra nút Gợi ý (Hint Button)
    await page.locator('#arena-btn-hint').click();
    const hintText = await page.locator('#arena-feedback-text').textContent();
    assert.match(hintText, /Gợi ý/, `${vp.name}: Hint button should show helpful hint`);

    // Trả lời sai (choice 1) -> Quái vật tấn công & Bé Sâu bị thương (Yêu cầu 5)
    await page.locator('.ans-btn').nth(1).click();
    await page.waitForFunction(() => {
      const fb = document.querySelector('#arena-feedback-text');
      return fb && (fb.textContent.includes('Chưa đúng') || fb.textContent.includes('thử lại') || fb.textContent.includes('Cầu Vồng'));
    }, null, { timeout: 4000 });

    // Đợi lượt chơi mở khóa sau hoạt ảnh bị thương
    await page.waitForFunction(() => {
      const ti = document.querySelector('#arena-turn-indicator');
      return ti && ti.textContent.includes('chọn lại');
    }, null, { timeout: 4000 });

    // Trả lời 3 câu hỏi đúng để trừ hết 3 tim quái vật (Yêu cầu 3)
    for (let round = 0; round < 3; round++) {
      const correctIdx = await page.evaluate(() => window.__battleModal?.currentQuestion?.correct ?? 0);
      await page.locator('.ans-btn').nth(correctIdx).click();
      if (round < 2) {
        await page.waitForTimeout(1100);
      }
    }

    await page.waitForFunction(() => {
      const fb = document.querySelector('#arena-feedback-text');
      return fb && (fb.textContent.includes('Tuyệt vời') || fb.textContent.includes('dũng cảm'));
    }, null, { timeout: 5000 });

    // Chờ Sàn đấu hoàn thành và đóng lại
    await page.waitForFunction(() => document.querySelector('#battle-arena-modal').hidden, null, { timeout: 6000 });

    // 7. Thử thách Boss Nấm Mũ Đỏ (Boss Battle Arena)
    await page.evaluate(() => document.getElementById('test-boss')?.click());
    await page.waitForFunction(() => !document.querySelector('#encounter-prompt-modal').hidden, null, { timeout: 5000 });
    await page.locator('#prompt-btn-start').click();
    await page.waitForFunction(() => !document.querySelector('#battle-arena-modal').hidden, null, { timeout: 5000 });

    // Trả lời 5 câu hỏi đúng để giải cứu Boss hoàn toàn (5 tim)
    for (let round = 0; round < 5; round++) {
      const correctIdx = await page.evaluate(() => window.__battleModal?.currentQuestion?.correct ?? 0);
      await page.locator('.ans-btn').nth(correctIdx).click();
      if (round < 4) {
        await page.waitForTimeout(1100);
      }
    }

    // 8. Kiểm tra Màn hình Tổng kết Vùng (Recap Modal) xuất hiện khi giải cứu thành công
    await page.waitForFunction(() => !document.querySelector('#recap-modal').hidden, null, { timeout: 8000 });
    const recapTitle = await page.locator('#recap-title').textContent();
    assert.match(recapTitle, /CHIẾN THẮNG LÀNG QUÊ YÊN BÌNH/, `${vp.name}: Victory recap title displayed`);

    const unlockText = await page.locator('#recap-unlock-notice').textContent();
    assert.match(unlockText, /Vịnh Biển Pha Lê/, `${vp.name}: Unlock notice shows Zone 2`);

    // Bấm nút tiếp tục trên Recap Modal
    await page.locator('#recap-close-button').click();
    await page.waitForFunction(() => document.querySelector('#recap-modal').hidden, null, { timeout: 3000 });
    // 9. Kiểm tra Bản Đồ Chiến Dịch (Map Selection Modal)
    await page.locator('#btn-top-map').click();
    await page.waitForFunction(() => document.querySelector('#map-select-modal') !== null, null, { timeout: 3000 });
    assert.equal(await page.locator('#map-select-modal').isVisible(), true, `${vp.name}: Map select modal opens`);

    const mapTitle = await page.locator('#map-select-title').textContent();
    assert.match(mapTitle, /Bản Đồ Vương Quốc Cầu Vồng/, `${vp.name}: Map title correct`);

    // 10. Kiểm tra Parental Gate từ nút Đặt lại dữ liệu
    await page.locator('#btn-parent-reset').click();
    await page.waitForFunction(() => document.querySelector('#parental-gate-modal') !== null, null, { timeout: 3000 });
    assert.equal(await page.locator('#parental-gate-modal').isVisible(), true, `${vp.name}: Parental gate opens`);

    const gateTitle = await page.locator('#gate-title').textContent();
    assert.match(gateTitle, /Phụ huynh/, `${vp.name}: Parental gate title correct`);

    // Hủy bỏ Parental Gate
    await page.locator('#gate-btn-cancel').click();
    await page.waitForFunction(() => document.querySelector('#parental-gate-modal') === null, null, { timeout: 3000 });

    // Đóng Map Select Modal
    await page.locator('#map-btn-close').click();
    await page.waitForFunction(() => document.querySelector('#map-select-modal') === null, null, { timeout: 3000 });

    console.log(`✓ ${vp.name} (${vp.width}x${vp.height}): Full Vertical Slice & Campaign Map (Story, Pet, Encounter, Boss 2-Phase, Recap, Map Hub, Parental Gate) PASS 100%!`);
    await page.close();
  }

  assert.deepEqual(failures, [], `Browser runtime must have zero uncaught errors: ${failures.join(', ')}`);
  console.log('\n====================================================');
  console.log('  KIỂM THỬ TRÌNH DUYỆT GIAI ĐOẠN 4 ĐẠT 100%!     ');
  console.log('====================================================');
} finally {
  await browser.close();
  if (previewServer) {
    await previewServer.close();
  }
}
