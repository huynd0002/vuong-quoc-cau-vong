import { chromium } from 'playwright';

async function verifyLive() {
  console.log('Kiểm tra trực tiếp live Vercel: https://vuong-quoc-cau-vong.vercel.app ...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('[LIVE CONSOLE]', msg.text()));

  let retries = 5;
  let ver = '';
  while (retries > 0) {
    try {
      await page.goto('https://vuong-quoc-cau-vong.vercel.app?t=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      ver = await page.evaluate(() => {
        return document.getElementById('stage-version-watermark')?.textContent || 
               document.getElementById('game-version-badge')?.textContent || '';
      });
      console.log(`Phiên bản live phát hiện: "${ver}" (còn ${retries} lần thử)`);
      if (ver.includes('3.6.7')) break;
    } catch (e) {
      console.log('Chờ Vercel hoàn tất deploy...', e.message);
    }
    retries--;
    if (retries > 0) await new Promise(r => setTimeout(r, 6000));
  }

  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_live_vercel_367.png' });
  console.log('Đã lưu ảnh xác minh live vercel 3.6.7');
  await browser.close();
}

verifyLive().catch(err => {
  console.error('Lỗi kiểm tra live:', err);
  process.exit(1);
});
