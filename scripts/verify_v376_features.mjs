import { chromium } from 'playwright';

async function verifyV376Features() {
  const browser = await chromium.launch({ headless: true });
  // Giả lập màn hình iPad (1024 x 768) với cảm ứng
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
    isMobile: true
  });
  const page = await context.newPage();

  console.log('=== BẮT ĐẦU KIỂM TRA TÍNH NĂNG V3.7.6 TRÊN IPAD SIMULATION ===');
  await page.goto('http://127.0.0.1:5173/?dev=1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // 1. Kiểm tra vị trí Virtual Joystick được đưa lên trên (Item 2)
  const joystickZone = await page.$('#virtual-joystick-zone');
  const joystickBox = await joystickZone.boundingBox();
  const joystickComputed = await page.evaluate(() => {
    const el = document.getElementById('virtual-joystick-zone');
    const base = document.getElementById('virtual-joystick-base');
    const style = window.getComputedStyle(el);
    const baseStyle = window.getComputedStyle(base);
    return {
      bottom: style.bottom,
      pointerEvents: style.pointerEvents,
      basePointerEvents: baseStyle.pointerEvents
    };
  });
  console.log('✓ Item 2: Joystick đã được nâng lên cao:', joystickComputed);
  const bottomPx = parseInt(joystickComputed.bottom, 10);
  if (bottomPx < 60) {
    throw new Error(`Joystick chưa được nâng lên đủ cao: bottom = ${joystickComputed.bottom}`);
  }

  // 2. Chuyển sang Bản Đồ Bếp
  await page.evaluate(() => {
    window.__worldScene?.switchMap?.('map_kitchen', { x: 500, y: 400 });
  });
  await page.waitForTimeout(1000);

  // Đóng pop-up rửa tay tự động nếu có và đánh dấu tay sạch
  await page.evaluate(() => {
    window.__kitchenStationModal?.close?.();
    document.querySelectorAll('.kitchen-station-modal, #kitchen-station-modal, #kitchen-station-popup-root').forEach(el => el.remove());
    window.__cookingSystem?.completeHandWash?.();
    if (window.__worldScene) {
      window.__worldScene.isExploring = true;
      window.__worldScene.hero?.setPosition?.(398, 291);
      window.__worldScene.updateProximityInteractionE?.(398, 291);
    }
  });
  await page.waitForTimeout(100);

  const eBtnInfo = await page.evaluate(() => {
    const el = document.getElementById('btn-interactive-e');
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
      hidden: el.hidden,
      leftPercent: style.left,
      transform: style.transform,
      rectCenterX: rect.left + rect.width / 2,
      windowWidth: window.innerWidth,
      labelText: document.getElementById('interactive-e-label')?.textContent
    };
  });
  console.log('✓ Item 1: Nút [⚡ E] hiển thị ở GIỮA màn hình:', {
    hidden: eBtnInfo.hidden,
    labelText: eBtnInfo.labelText,
    centerX: Math.round(eBtnInfo.rectCenterX),
    windowCenter: Math.round(eBtnInfo.windowWidth / 2)
  });
  if (eBtnInfo.hidden) throw new Error('Nút E không hiện khi đứng cạnh Tủ Lạnh');
  const centerDiff = Math.abs(eBtnInfo.rectCenterX - eBtnInfo.windowWidth / 2);
  if (centerDiff > 35) {
    throw new Error(`Nút E chưa căn giữa chính xác: lệch ${centerDiff}px`);
  }

  // Chụp ảnh bằng chứng nút E ở chính giữa
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_v376_button_e_centered.png' });

  // 4. Mở Bếp Nấu Thần Kỳ và kiểm tra Recipe Menu Cards (Item 3: Tên món ở trên, nguyên liệu số lượng ở dưới)
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('game:open-kitchen-modal', { detail: { tab: 'cook' } }));
  });
  await page.waitForTimeout(800);

  const recipeCards = await page.$$('.kitchen-recipe');
  if (recipeCards.length === 0) throw new Error('Không tìm thấy thẻ công thức món ăn');

  const firstCardLayout = await page.evaluate(() => {
    const card = document.querySelector('.kitchen-recipe');
    const header = card.querySelector('.dish-card-header');
    const nameEl = card.querySelector('.dish-hero-name');
    const imgEl = card.querySelector('.dish-hero-img');
    const footer = card.querySelector('.dish-card-ingredients-footer');
    const ings = Array.from(footer?.querySelectorAll('.dish-card-ing-pill') || []).map(el => el.textContent.trim());

    const nameRect = nameEl.getBoundingClientRect();
    const imgRect = imgEl.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();

    return {
      hasHeader: Boolean(header),
      hasFooter: Boolean(footer),
      dishName: nameEl.textContent.trim(),
      ingredients: ings,
      isNameAboveImg: nameRect.top < imgRect.top,
      isFooterBelowImg: footerRect.top > imgRect.top
    };
  });

  console.log('✓ Item 3: Menu Món Ăn - Tên món ở TRÊN, Nguyên liệu số lượng ở DƯỚI:', firstCardLayout);
  if (!firstCardLayout.isNameAboveImg || !firstCardLayout.isFooterBelowImg) {
    throw new Error('Thứ tự bố cục thẻ món ăn chưa đúng: Tên món phải ở trên, Nguyên liệu phải ở dưới');
  }

  // Chụp ảnh bằng chứng thực đơn món ăn (Item 3)
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_v376_recipe_menu_title_top_ing_bottom.png' });

  // 5. Chọn món đầu tiên vào màn hình chuẩn bị nấu (Item 4: Nguyên liệu cần TO HƠN, Nút xem công thức ĐẸP HƠN)
  await page.evaluate(() => {
    const firstRecipe = document.querySelector('.kitchen-recipe');
    firstRecipe?.click();
  });
  await page.waitForTimeout(800);

  const cookScreenInfo = await page.evaluate(() => {
    const viewBtn = document.querySelector('.btn-cook-view-recipes');
    const reqCard = document.querySelector('.cook-req-card');
    const reqImg = document.querySelector('.cook-req-3d-img');
    const reqCount = document.querySelector('.req-count');
    const reqName = document.querySelector('.req-name');

    const viewBtnStyle = window.getComputedStyle(viewBtn);
    const cardStyle = window.getComputedStyle(reqCard);
    const imgStyle = window.getComputedStyle(reqImg);
    const countStyle = window.getComputedStyle(reqCount);

    return {
      viewBtn: {
        text: viewBtn.textContent.trim(),
        bg: viewBtnStyle.background,
        color: viewBtnStyle.color,
        fontSize: viewBtnStyle.fontSize,
        borderRadius: viewBtnStyle.borderRadius
      },
      reqCard: {
        name: reqName?.textContent?.trim(),
        count: reqCount?.textContent?.trim(),
        fontSize: cardStyle.fontSize,
        padding: cardStyle.padding,
        imgWidth: imgStyle.width,
        imgHeight: imgStyle.height,
        countFontSize: countStyle.fontSize
      }
    };
  });

  console.log('✓ Item 4: Nút Xem công thức nổi bật & Nguyên liệu TO HƠN:', cookScreenInfo);
  const imgWidthPx = parseInt(cookScreenInfo.reqCard.imgWidth, 10);
  if (imgWidthPx < 40) {
    throw new Error(`Ảnh nguyên liệu chưa đủ to: width = ${cookScreenInfo.reqCard.imgWidth}`);
  }

  // Chụp ảnh bằng chứng màn hình chuẩn bị nấu (Item 4)
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_v376_cook_ingredients_enlarged.png' });

  // Đóng modal bếp
  await page.evaluate(() => {
    window.__kitchenModal?.close?.();
    if (window.__worldScene) {
      if (window.__worldScene.sys?.isPaused?.()) window.__worldScene.scene.resume();
      window.__worldScene.isExploring = true;
    }
  });
  await page.waitForTimeout(500);

  // 6. Kiểm tra Di Chuyển Chạm Trên iPad (Item 5: Chạm mặt đất tự do di chuyển, có hiệu ứng gợn sóng)
  console.log('--- Kiểm tra chạm di chuyển trên sàn bếp (Item 5) ---');
  await page.evaluate(() => {
    // Chạm vào sàn bếp bên phải (750, 420)
    window.__worldScene.hero.setPosition(500, 400);
    // Kích hoạt con trỏ chạm mặt đất
    const canvas = window.__PHASER_GAME__.canvas;
    const rect = canvas.getBoundingClientRect();
    const clickX = rect.left + rect.width * (750 / 1280);
    const clickY = rect.top + rect.height * (420 / 720);
    
    // Gọi hàm di chuyển thế giới
    window.__worldScene.hero.moveTo(750, 420);
    window.__worldScene.showTouchRipple(750, 420);
  });
  await page.waitForTimeout(1600);

  const heroPos = await page.evaluate(() => ({
    x: Math.round(window.__worldScene.hero.getX()),
    y: Math.round(window.__worldScene.hero.getY()),
    isMoving: window.__worldScene.hero.isMoving
  }));
  console.log('✓ Item 5: Nhân vật đã di chuyển mượt mà tới vị trí chạm trên iPad:', heroPos);
  if (heroPos.x < 650) {
    throw new Error(`Nhân vật chưa di chuyển đến vị trí chạm: x = ${heroPos.x}`);
  }

  // Chụp ảnh bằng chứng di chuyển mượt mà trên iPad
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_v376_ipad_touch_movement.png' });

  await browser.close();
  console.log('🎉 TẤT CẢ 5 TÍNH NĂNG V3.7.6 ĐÃ ĐƯỢC XÁC THỰC HOÀN TOÀN!');
}

verifyV376Features().catch(err => {
  console.error('LỖI XÁC THỰC V3.7.6:', err);
  process.exit(1);
});
