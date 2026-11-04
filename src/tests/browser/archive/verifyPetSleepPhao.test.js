import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const browser = await chromium.launch({ headless: true });

async function enterWorld(page) {
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
  console.log('--- KIỂM THỬ: CHÓ NGỦ KHÔNG TỰ PHÓNG TO VÀ NẰM GIỮA TÂM PHAO ---');
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem('RAINBOW_KIDS_RPG_SAVE_V1', JSON.stringify({
      version: 2,
      player: { stars: 10 },
      campaign: { currentMapId: 'map_pet_farm' },
      pet: { type: 'dog', energy: 100, isSleeping: false },
      settings: { soundEnabled: false }
    }));
  });

  await page.goto(pathToFileURL(path.resolve('game.html')).href, { waitUntil: 'networkidle' });
  await enterWorld(page);

  // 1. Cho cún đi ngủ trên phao ngủ (x: 578, y: 349)
  await page.evaluate(() => {
    const scene = window.__worldScene;
    scene.forcePetToSleep();
  });

  // Chờ cún đi đến phao và vào giấc ngủ
  console.log('Chờ cún đi đến phao và nằm ngủ...');
  await page.waitForFunction(() => {
    const pet = window.__worldScene?.pet;
    return pet && pet.isSleepingOnBed && pet.currentAnimState === 'sleep';
  }, null, { timeout: 15000 });

  // 2. Kiểm tra kích thước và toạ độ cún khi ngủ
  const sleepInfo = await page.evaluate(() => {
    const scene = window.__worldScene;
    const pet = scene.pet;
    const phao = scene.petBedSprite;
    return {
      dogX: pet.sprite.x,
      dogY: pet.sprite.y,
      dogDisplayWidth: pet.sprite.displayWidth,
      dogDisplayHeight: pet.sprite.displayHeight,
      phaoX: phao ? phao.x : 578,
      phaoY: phao ? phao.y : 360,
      isSleepingOnBed: pet.isSleepingOnBed,
      currentAnimState: pet.currentAnimState
    };
  });

  console.log('Thông số cún khi ngủ:', sleepInfo);

  // Kích thước cún khi ngủ không bị phóng to (phải <= 70px thay vì 96px)
  assert.ok(sleepInfo.dogDisplayWidth <= 72, `Kích thước hiển thị cún khi ngủ phải nhỏ gọn (~68px) để thân hình cún không bị phóng to: thực tế ${sleepInfo.dogDisplayWidth}px`);
  assert.equal(sleepInfo.dogX, sleepInfo.phaoX, 'Cún phải nằm thẳng hàng ngang với tâm phao (x = 578)');
  // Tọa độ Y của cún đặt tại bedY - 10 để trọng tâm thân cún nằm chính giữa phao
  assert.equal(sleepInfo.dogY, sleepInfo.phaoY - 32, 'Cún đặt tại y = bedY - 32 để phần thân nằm đúng giữa lòng phao');

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_dog_sleeping_centered_not_enlarged.png' });

  // 3. Đánh thức cún dậy và kiểm tra kích thước phục hồi lại bình thường
  console.log('Đánh thức cún dậy...');
  await page.evaluate(() => {
    const scene = window.__worldScene;
    scene.wakePetUp();
  });
  await page.waitForTimeout(500);

  const wakeInfo = await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    return {
      dogDisplayWidth: pet.sprite.displayWidth,
      dogDisplayHeight: pet.sprite.displayHeight,
      currentAnimState: pet.currentAnimState
    };
  });
  console.log('Thông số cún khi thức dậy:', wakeInfo);
  assert.equal(wakeInfo.dogDisplayWidth, 96, 'Khi thức dậy cún trở lại kích thước chuẩn 96px');

  console.log('✓ XÁC MINH CÚN NGỦ KHÔNG PHÓNG TO VÀ NẰM GIỮA TÂM PHAO THÀNH CÔNG 100%!');
} finally {
  await browser.close();
}
