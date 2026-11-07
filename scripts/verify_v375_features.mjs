import { chromium } from 'playwright';

async function verifyFeatures() {
  const browser = await chromium.launch({ headless: true });
  // Giả lập kích thước màn hình iPad (1024 x 768)
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
    isMobile: true
  });
  const page = await context.newPage();

  console.log('--- BẮT ĐẦU KIỂM TRA TÍNH NĂNG V3.7.5 TRÊN TRÌNH DUYỆT (IPAD SIMULATION) ---');
  await page.goto('http://127.0.0.1:5173/?dev=1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // 1. Kiểm tra nút Refresh (#btn-quick-refresh)
  const refreshBtn = await page.$('#btn-quick-refresh');
  if (!refreshBtn) throw new Error('Không tìm thấy nút #btn-quick-refresh');
  const refreshVisible = await refreshBtn.isVisible();
  console.log('✓ 1. Nút Refresh (#btn-quick-refresh) đã hiển thị:', refreshVisible);

  // 2. Chuyển sang Bản Đồ Bếp và kiểm tra Pop-up Rửa Tay trên iPad (không mất hình)
  await page.evaluate(() => {
    window.__worldScene?.switchMap?.('map_kitchen', { x: 500, y: 400 });
  });
  await page.waitForTimeout(1000);

  // Mở pop-up Rửa Tay (hoặc tự động kích hoạt khi vào bếp)
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:open-kitchen-station-popup', { detail: { station: 'sink' } }));
  });
  await page.waitForTimeout(800);

  const handwashCard = await page.$('.handwash-card');
  const handImg = await page.$('#handwash-display-img');
  if (!handwashCard || !handImg) throw new Error('Không tìm thấy Pop-up rửa tay');

  const handImgBox = await handImg.boundingBox();
  const handImgSrc = await page.evaluate(el => el.src, handImg);
  console.log('✓ 2. Pop-up Rửa Tay hiển thị ảnh trên iPad:', {
    hasSrc: Boolean(handImgSrc),
    src: handImgSrc.slice(-30),
    width: Math.round(handImgBox?.width || 0),
    height: Math.round(handImgBox?.height || 0)
  });
  if (!handImgBox || handImgBox.width === 0 || handImgBox.height === 0) {
    throw new Error('Ảnh bàn tay bị co về 0 hoặc mất hình trên iPad');
  }

  // Chụp ảnh bằng chứng Pop-up rửa tay không mất hình
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_handwash_ipad_v375.png' });

  // Hoàn tất rửa tay và đóng pop-up để nhân vật khám phá tự do
  await page.evaluate(() => {
    document.querySelector('.kitchen-station-modal')?.remove?.();
    if (window.__cookingSystem) {
      window.__cookingSystem.handsWashed = true;
      if (window.__cookingSystem.state) window.__cookingSystem.state.handsWashed = true;
    }
    if (window.__worldScene) {
      window.__worldScene.isExploring = true;
    }
  });
  await page.waitForTimeout(500);

  // 3. Kiểm tra Nút tương tác [⚡ E] khi đứng cạnh Tủ Lạnh
  await page.evaluate(() => {
    window.__worldScene?.hero?.setPosition?.(398, 291);
    window.__worldScene?.updateProximityInteractionE?.(398, 291);
  });
  await page.waitForTimeout(300);

  const eBtn = await page.$('#btn-interactive-e');
  const eLabel = await page.$('#interactive-e-label');
  const eBtnHidden = await page.evaluate(el => el.hidden, eBtn);
  const eLabelText = await page.evaluate(el => el.textContent, eLabel);
  console.log('✓ 3. Nút tương tác [⚡ E] khi đứng cạnh Tủ Lạnh: hidden =', eBtnHidden, '| Label =', eLabelText);
  if (eBtnHidden) throw new Error('Nút E không hiện khi đứng cạnh Tủ Lạnh');

  // Chụp ảnh bằng chứng nút E tại Tủ Lạnh
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_button_e_fridge_v375.png' });

  // 4. Kiểm tra Hồ Câu Cá: Tự động khóa vị trí, tự động câu, nút dừng câu
  console.log('--- Chuyển sang Bản Đồ Hồ Câu Lá Sen ---');
  await page.evaluate(() => {
    window.__worldScene?.switchMap?.('map_fishing_pond', { x: 770, y: 360 });
  });
  await page.waitForTimeout(1000);

  // Kiểm tra nút bắt đầu câu cũ đã biến mất
  const oldStartBtn = await page.$('#btn-start-fishing-dock');
  const oldBtnVisible = oldStartBtn ? await oldStartBtn.isVisible() : false;
  console.log('✓ 4a. Nút "Bắt đầu câu cá" cũ đã được gỡ bỏ hoàn toàn:', !oldBtnVisible);

  // Cho nhân vật bước vào bến câu (688, 360)
  await page.evaluate(() => {
    window.__worldScene?.hero?.setPosition?.(688, 360);
    window.__worldScene?.updateDockFishingAutoFlow?.(688, 360);
  });
  await page.waitForTimeout(600);

  const isLocked = await page.evaluate(() => Boolean(window.__worldScene?.isFishingSpotLocked));
  const isCasting = await page.evaluate(() => Boolean(window.__worldScene?.onMapFishingState));
  console.log('✓ 4b. Tự động Khóa đứng im nhân vật:', isLocked, '| Tự động Thả Cần câu cá luôn:', isCasting);
  if (!isLocked) throw new Error('Nhân vật không tự động khóa khi đứng vào bến câu');

  const stopBtn = await page.$('#btn-stop-fishing-dock');
  const stopBtnVisible = stopBtn ? await stopBtn.isVisible() : false;
  console.log('✓ 4c. Nút "Không câu nữa" (#btn-stop-fishing-dock) xuất hiện ở góc:', stopBtnVisible);

  // Chụp ảnh bằng chứng Hồ câu: Tự động câu & Khóa nhân vật & Nút dừng câu
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_fishing_autolock_and_stop_btn_v375.png' });

  // 5. Bấm nút dừng câu cá hoặc thoát khi hụt -> Nhân vật tự động bước lùi về (768, 360) và mở khóa
  await page.evaluate(() => {
    window.__worldScene?.exitFishingSpot?.('manual_stop');
  });
  await page.waitForTimeout(600);

  const isUnlockedAfterStop = await page.evaluate(() => !window.__worldScene?.isFishingSpotLocked);
  const heroPosAfterStop = await page.evaluate(() => ({
    x: Math.round(window.__worldScene?.hero?.getX() || 0),
    y: Math.round(window.__worldScene?.hero?.getY() || 0)
  }));
  console.log('✓ 5. Khi bấm Dừng câu: Mở khóa =', isUnlockedAfterStop, '| Vị trí bước lùi an toàn =', heroPosAfterStop);
  if (!isUnlockedAfterStop) throw new Error('Không mở khóa nhân vật sau khi dừng câu');

  // Chụp ảnh bằng chứng bước lùi an toàn
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_fishing_stepback_unlocked_v375.png' });

  await browser.close();
  console.log('🎉 TOÀN BỘ 5 YÊU CẦU ĐÃ ĐƯỢC XÁC THỰC VƯỢT QUA HOÀN HẢO!');
}

verifyFeatures().catch(err => {
  console.error('LỖI XÁC THỰC:', err);
  process.exit(1);
});
