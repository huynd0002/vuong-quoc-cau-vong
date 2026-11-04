import { chromium } from 'playwright';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function main() {
  console.log('🚀 Bắt đầu kiểm thử: Bỏ tất cả các icon khi bán hàng, có hiệu ứng rung nhẹ khi bán...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Đóng modal mở đầu
  await page.evaluate(() => {
    document.querySelectorAll('.game-modal, .kitchen-overlay, [role="dialog"], #character-select-modal, #story-modal').forEach(m => {
      m.style.display = 'none';
      m.setAttribute('hidden', 'true');
    });
  });

  // Mở Quầy Bán Hàng (tab fish_scale_stall)
  console.log('\n1. Mở Quầy Bán Hàng Chợ Cầu Vồng...');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:open-market-station', {
      detail: { station: { type: 'fish_scale_stall' } }
    }));
  });
  await page.waitForTimeout(600);

  // Bán vật phẩm bằng _sellFishByDrop
  console.log('2. Bán vật phẩm...');
  await page.evaluate(() => {
    const market = window.__marketModal;
    const fishSys = market?.fishingSystem;
    if (fishSys && market) {
      fishSys.mutate((state) => {
        state.basket.push({
          id: 'fish-test-item',
          speciesId: 'cloud_fish',
          weightG: 300,
          count: 1
        });
        return { ok: true };
      });
      market._sellFishByDrop('fish-test-item');
    }
  });
  await page.waitForTimeout(100);

  // Kiểm tra hiệu ứng rung nhẹ (subtle shake) và kiểm tra sạch sẽ không còn icon bay
  const sellResult = await page.evaluate(() => {
    const dropzone = document.querySelector('#market-sell-dropzone');
    const celebration = document.querySelector('.market-sold-celebration');
    const sparkles = document.querySelectorAll('.market-sell-sparkles .sell-sparkle-dot');
    const starBadge = document.querySelector('.market-sold-star-badge');
    const celebrationText = celebration ? celebration.textContent : '';

    return {
      hasDropzone: Boolean(dropzone),
      hasCelebration: Boolean(celebration),
      hasShakingClass: dropzone ? dropzone.classList.contains('market-sell-shaking') : false,
      sparklesCount: sparkles.length,
      starBadgeText: starBadge ? starBadge.textContent.trim() : '',
      celebrationText: celebrationText.trim()
    };
  });

  console.log('Kết quả kiểm tra sau khi bán:', sellResult);

  // Khẳng định 1: Không còn bất kỳ icon sparkles nào bay lơ lửng
  assert.strictEqual(sellResult.sparklesCount, 0, 'Phải loại bỏ hoàn toàn tất cả các hạt icon / sparkles');

  // Khẳng định 2: Có hiệu ứng rung nhẹ (market-sell-shaking)
  assert.strictEqual(sellResult.hasShakingClass, true, 'Ô bán hàng phải có class hiệu ứng rung nhẹ market-sell-shaking');

  // Khẳng định 3: Thẻ nhận sao rõ ràng, không chứa emoji rác
  assert.ok(sellResult.starBadgeText.includes('SAO'), 'Thẻ nhận sao phải ghi rõ SAO');
  assert.ok(!sellResult.starBadgeText.includes('⭐') && !sellResult.starBadgeText.includes('✨'), 'Thẻ nhận sao không chứa emoji rườm rà');

  // Chụp ảnh giao diện bán hàng sạch đẹp, không icon rườm rà
  const shotPath = path.join(artifactDir, 'verified_clean_sell_no_icons_with_subtle_shake.png');
  await page.screenshot({ path: shotPath });
  console.log('✓ Đã lưu ảnh minh chứng:', shotPath);

  await browser.close();
  console.log('🎉 BÀI KIỂM THỬ: BỎ TẤT CẢ ICON & HIỆU ỨNG RUNG NHẸ KHI BÁN ĐÃ ĐẠT 100%!');
}

main().catch(err => {
  console.error('❌ Lỗi kiểm thử:', err);
  process.exit(1);
});
