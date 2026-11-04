import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 4220, strictPort: true } });
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
  console.log('=== KIỂM THỬ TOÀN DIỆN: UỐNG NƯỚC, TẮM BỒN, KHẮC PHỤC CO BÓP & HUD TABLET ===');
  
  // 1. Kiểm thử trên độ phân giải Tablet / Màn hình ngang thấp (1024 x 500)
  const context = await browser.newContext({ viewport: { width: 1024, height: 500 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  
  await page.goto('http://127.0.0.1:4220/game.html', { waitUntil: 'networkidle' });
  await enterWorld(page);
  
  // Đi tới map_pet_farm nếu chưa ở đó
  await page.evaluate(() => {
    if (window.__worldScene.currentMapId !== 'map_pet_farm') {
      const btn = document.getElementById('btn-quick-pet-farm');
      if (btn) btn.click();
    }
  });
  
  await page.waitForTimeout(2000);
  await page.waitForFunction(() => window.__worldScene?.currentMapId === 'map_pet_farm', null, { timeout: 15000 });
  
  console.log('1. Đã vào Nông trại thú cưng trên màn hình Tablet (1024x500)');
  
  // Kiểm tra 5 gauge trên HUD đều hiển thị và không bị khuất
  const gaugesStatus = await page.evaluate(() => {
    const hunger = document.getElementById('gauge-hunger');
    const thirst = document.getElementById('gauge-thirst');
    const clean = document.getElementById('gauge-clean');
    const fun = document.getElementById('gauge-fun');
    const energy = document.getElementById('gauge-energy');
    
    function isVis(el) {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight;
    }
    
    return {
      hunger: isVis(hunger),
      thirst: isVis(thirst),
      clean: isVis(clean),
      fun: isVis(fun),
      energy: isVis(energy)
    };
  });
  
  console.log('Trạng thái hiển thị 5 gauge trên HUD (Tablet 1024x500):', gaugesStatus);
  assert.ok(gaugesStatus.hunger, 'Nút No bụng phải hiển thị đầy đủ trên màn hình');
  assert.ok(gaugesStatus.thirst, 'Nút Uống nước phải hiển thị đầy đủ trên màn hình');
  assert.ok(gaugesStatus.clean, 'Nút Sạch sẽ phải hiển thị đầy đủ trên màn hình');
  assert.ok(gaugesStatus.fun, 'Nút Vui vẻ phải hiển thị đầy đủ trên màn hình');
  assert.ok(gaugesStatus.energy, 'Nút Năng lượng phải hiển thị đầy đủ trên màn hình');
  
  const shotHUD = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_pet_hud_tablet.png';
  await page.screenshot({ path: shotHUD });
  console.log('Đã lưu ảnh HUD trên Tablet:', shotHUD);

  // 2. Kiểm tra Bảng hiệu nổi (Badges) của các trạm
  const badgesCheck = await page.evaluate(() => {
    const scene = window.__worldScene;
    const containers = scene.petStationContainers || [];
    return containers.map(c => {
      const texts = [];
      if (c.container?.list) {
        c.container.list.forEach(item => {
          if (item.text) texts.push(item.text);
        });
      }
      return {
        type: c.data.type,
        x: c.data.x,
        y: c.data.y,
        texts
      };
    });
  });
  console.log('Các trạm và bảng hiệu nổi trên map:', badgesCheck);
  const waterStation = badgesCheck.find(b => b.type === 'water');
  const bathStation = badgesCheck.find(b => b.type === 'bath');
  assert.ok(waterStation, 'Trạm water phải tồn tại');
  assert.ok(waterStation.texts.some(t => t.includes('Uống Nước')), 'Trạm water phải có bảng hiệu 💧 Uống Nước');
  assert.ok(bathStation, 'Trạm bath phải tồn tại');
  assert.ok(bathStation.texts.some(t => t.includes('Tắm Bồn')), 'Trạm bath phải có bảng hiệu 🛁 Tắm Bồn');

  // 3. Test BẤM UỐNG NƯỚC (Click #gauge-thirst)
  console.log('2. Test hành động: Click nút UỐNG NƯỚC...');
  await page.locator('#gauge-thirst').click();
  
  // Đợi cún bước tới máng nước suối đá (404, 242) và bắt đầu hoạt ảnh uống nước
  await page.waitForFunction(() => {
    const pet = window.__worldScene.pet;
    const action = window.__worldScene.currentPetStationAction;
    return action?.station?.type === 'water' &&
      action?.phase === 'action' &&
      pet.sprite?.anims?.currentAnim?.key === 'pet_dog_drink' &&
      Math.abs(pet.sprite.x - 404) < 15 &&
      Math.abs(pet.sprite.y - 242) < 15;
  }, null, { timeout: 15000 });
  
  const drinkState = await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    const s = pet.sprite;
    return {
      x: Math.round(s.x),
      y: Math.round(s.y),
      animKey: s.anims?.currentAnim?.key,
      displayWidth: Math.round(s.displayWidth),
      displayHeight: Math.round(s.displayHeight),
      scaleX: Math.abs(s.scaleX),
      scaleY: Math.abs(s.scaleY),
      angle: s.angle
    };
  });
  console.log('Trạng thái cún khi uống nước tại (404, 242):', drinkState);
  assert.equal(drinkState.x, 404, 'Tọa độ X phải là 404');
  assert.equal(drinkState.y, 242, 'Tọa độ Y phải là 242');
  assert.equal(drinkState.animKey, 'pet_dog_drink', 'Hoạt ảnh phải là pet_dog_drink (Uống nước)');
  assert.equal(drinkState.displayWidth, drinkState.displayHeight, 'Hình ảnh phải vuông 1:1, tuyệt đối không bị co bóp méo hình');
  assert.equal(drinkState.angle, 0, 'Góc quay phải bằng 0, không bị nghiêng méo');
  
  const shotDrink = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_dog_drinking_clean.png';
  await page.screenshot({ path: shotDrink });
  console.log('Đã lưu ảnh cún uống nước:', shotDrink);

  // 4. Test BẤM TẮM BỒN (Click #gauge-clean)
  console.log('3. Test hành động: Click nút TẮM BỒN...');
  await page.locator('#gauge-clean').click();
  
  // Đợi cún bước tới thềm bồn tắm gỗ (512, 635) và bắt đầu hoạt ảnh tắm
  await page.waitForFunction(() => {
    const pet = window.__worldScene.pet;
    const action = window.__worldScene.currentPetStationAction;
    return action?.station?.type === 'bath' &&
      action?.phase === 'action' &&
      Math.abs(pet.sprite.x - 512) < 25 &&
      Math.abs(pet.sprite.y - 635) < 25;
  }, null, { timeout: 15000 });
  
  const bathState = await page.evaluate(() => {
    const pet = window.__worldScene.pet;
    const s = pet.sprite;
    return {
      x: Math.round(s.x),
      y: Math.round(s.y),
      animKey: s.anims?.currentAnim?.key,
      displayWidth: Math.round(s.displayWidth),
      displayHeight: Math.round(s.displayHeight),
      scaleX: Math.abs(s.scaleX),
      scaleY: Math.abs(s.scaleY),
      angle: s.angle
    };
  });
  console.log('Trạng thái cún khi tắm bồn:', bathState);
  assert.equal(bathState.x, 512, 'Tọa độ X cún tắm phải là 512');
  assert.equal(bathState.y, 635, 'Tọa độ Y cún tắm phải là 635');
  assert.notEqual(bathState.animKey, 'pet_dog_sleep', 'Cún khi tắm tuyệt đối không được phát hoạt ảnh ngủ co bóp');
  assert.equal(bathState.displayWidth, bathState.displayHeight, 'Hình ảnh phải vuông 1:1, tuyệt đối không bị co bóp méo hình');
  assert.equal(bathState.angle, 0, 'Góc quay phải bằng 0');
  
  const shotBath = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_dog_bath_clean.png';
  await page.screenshot({ path: shotBath });
  console.log('Đã lưu ảnh cún tắm bồn:', shotBath);

  console.log('=== TẤT CẢ KIỂM THỬ ĐÃ VƯỢT QUA 100%! ===');
} finally {
  await browser.close();
  await server.close();
}
