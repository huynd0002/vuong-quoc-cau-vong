import { chromium } from 'playwright';
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('--- [Test] Kiểm Tra Xóa Cụm Nút "Bản Đồ 6 Vùng" & "Thêm Câu Hỏi" ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window !== 'undefined' && !!window.__worldScene, { timeout: 45000 });
  await page.waitForTimeout(2000);

  // Close modals
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });
  await page.waitForTimeout(1000);

  const checkElements = await page.evaluate(() => {
    const mapBtn = document.getElementById('btn-open-map');
    const questionBtn = document.getElementById('btn-quick-add-question');
    const quickActions = document.querySelector('.quick-actions');
    const isVisible = (el) => {
      if (!el) return false;
      const comp = window.getComputedStyle(el);
      return comp.display !== 'none' && comp.visibility !== 'hidden' && comp.opacity !== '0';
    };

    return {
      mapBtnExists: !!mapBtn,
      mapBtnVisible: isVisible(mapBtn),
      questionBtnExists: !!questionBtn,
      questionBtnVisible: isVisible(questionBtn),
      quickActionsExists: !!quickActions,
      quickActionsVisible: isVisible(quickActions)
    };
  });

  console.log('Element Status:', checkElements);
  assert.strictEqual(checkElements.mapBtnVisible, false, 'Nút "Bản đồ 6 Vùng" không được hiển thị');
  assert.strictEqual(checkElements.questionBtnVisible, false, 'Nút "Thêm Câu Hỏi" không được hiển thị');
  assert.strictEqual(checkElements.quickActionsVisible, false, 'Cụm .quick-actions không được hiển thị');

  // Chụp ảnh bằng chứng
  const artifactPath = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_removed_quick_actions.png');
  await page.screenshot({ path: artifactPath, fullPage: false });
  console.log(`\n✓ Đã chụp ảnh bằng chứng màn hình sạch sẽ: ${artifactPath}`);

  await browser.close();
  console.log('\n🎉 ĐÃ XÁC NHẬN XÓA HOÀN TOÀN CỤM NÚT "BẢN ĐỒ 6 VÙNG" VÀ "THÊM CÂU HỎI" THÀNH CÔNG RỰC RỠ!');
})();
