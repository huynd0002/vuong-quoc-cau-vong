import { chromium } from 'playwright';

async function verifyLivePetIsDog() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  console.log('Truy cập live Vercel để kiểm tra linh vật Bé Cún...');
  await page.goto('https://vuong-quoc-cau-vong.vercel.app/', { waitUntil: 'networkidle' });

  // Clear any cached localStorage to ensure clean state
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  // Chờ watermark phiên bản
  await page.waitForSelector('#stage-version-watermark', { timeout: 20000 });
  const ver = await page.$eval('#stage-version-watermark', el => el.textContent.trim());
  console.log('Live version watermark:', ver);

  // Topbar button
  const topPetName = await page.$eval('#pet-name-top', el => el.textContent.trim());
  console.log('Live topbar pet button:', topPetName);

  // Chuyển sang Nông Trại Thú Cưng
  await page.evaluate(() => {
    if (typeof window.__travelToZone === 'function') {
      window.__travelToZone('map_pet_farm');
    }
  });

  await page.waitForTimeout(3000);

  const hudName = await page.$eval('#pet-hud-name', el => el.textContent.trim());
  const hudIcon = await page.$eval('#pet-hud-header-icon', el => el.textContent.trim());
  const companionBtnText = await page.$eval('#pet-companion-toggle-text', el => el.textContent.trim());

  console.log('Live HUD Pet Name:', hudName);
  console.log('Live HUD Pet Icon:', hudIcon);
  console.log('Live Companion Button:', companionBtnText);

  const screenshotPath = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_live_pet_be_cun.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Đã lưu ảnh xác minh live:', screenshotPath);

  if (hudName.includes('Thỏ') || hudIcon === '🐰') {
    throw new Error(`Live site still shows bunny: ${hudName}`);
  }

  console.log('🎉 XÁC MINH TRỰC TIẾP TRÊN LIVE THÀNH CÔNG RỰC RỠ!');
  await browser.close();
}

verifyLivePetIsDog().catch(err => {
  console.error('Lỗi kiểm tra live:', err);
  process.exit(1);
});
