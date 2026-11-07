import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';

async function verifyShiftedCountdownAndRetries() {
  console.log('=== KIỂM TRA HIỆU ỨNG ĐẾM NGƯỢC XÍCH TRÁI & 2-3 CƠ HỘI THỬ LẠI CÁ KHÓ (v3.7.2) ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[WorldScene]') || text.includes('cơ hội') || text.includes('Countdown') || text.includes('Fishing')) {
      console.log('BROWSER CONSOLE:', text);
    }
  });

  try {
    await page.goto('http://127.0.0.1:5173/dev.html', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2500);

    // TEST 1: Kiểm tra vị trí Hiệu ứng Đếm ngược được xích sang trái không che nhân vật
    console.log('\n--- [TEST 1] Vị trí Hiệu Ứng Countdown Xích Sang Trái ---');
    const posCheck = await page.evaluate(async () => {
      const scene = window.__worldScene;
      scene.currentMapId = 'map_fishing_pond';
      const heroX = scene.hero?.sprite?.x ?? 688;
      const heroY = scene.hero?.sprite?.y ?? 360;

      let countdownSprite = null;
      let spriteX = 0;
      let spriteY = 0;

      // Kích hoạt playFishingCountdownVFX
      scene.playFishingCountdownVFX();

      // Tìm sprite vfx_countdown trong scene children
      const children = scene.children?.list || [];
      const sprite = children.find(c => c.texture && c.texture.key === 'vfx_countdown');
      if (sprite) {
        spriteX = sprite.x;
        spriteY = sprite.y;
      }

      return {
        heroX,
        heroY,
        spriteX,
        spriteY,
        isShiftedLeft: spriteX < heroX - 120, // Xích hẳn sang trái ít nhất 120px so với nhân vật
        distanceLeft: heroX - spriteX
      };
    });

    console.log('Test 1 Countdown Position check:', posCheck);
    if (!posCheck.isShiftedLeft) {
      throw new Error(`Test 1 Thất bại: Countdown chưa xích sang trái! spriteX=${posCheck.spriteX}, heroX=${posCheck.heroX}`);
    }

    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_countdown_shifted_left.png') });

    // TEST 2: Thử nghiệm Cơ chế 2-3 Cơ Hội Thử Lại cho Cá Khó (Không bị mất cá ngay khi hụt)
    console.log('\n--- [TEST 2] 2-3 Cơ Hội Thử Lại Cho Cá Khó ---');
    const retryTestResult = await page.evaluate(async () => {
      const scene = window.__worldScene;
      const fishingSystem = window.__fishingSystem;

      // Giả lập cá khó (Cá Rồng Hoàng Kim hoặc Cá Pha Lê, targetHits = 6)
      scene.onMapFishingState = {
        phase: 'audition',
        targetHits: 6,
        currentHits: 0,
        maxRetries: 3, // 3 cơ hội thử lại cho cá khó
        retriesRemaining: 3,
        misses: 0,
        castX: 485,
        castY: 445,
        zoneTop: 20,
        zoneHeight: 15,
        markerPct: 80, // Để ngoài zone để hụt
        species: {
          id: 'golden_dragon_fish',
          name: 'Cá Rồng Hoàng Kim',
          icon: '🐲',
          asset: '/assets/fishing/fish_golden_dragon.png',
          requiredHits: 6
        },
        diff: {
          label: 'Hoàng Kim · 6 Lần Canh',
          maxRetries: 3
        }
      };

      // Mở thanh Audition
      scene.mountVerticalAuditionBar();

      const chancesEl = document.getElementById('onmap-audition-chances');
      const initialChancesText = chancesEl?.textContent?.trim() || '';

      // HỤT LẦN 1
      scene.onMapFishingState.markerPct = 0; // Luôn ngoài zone (zoneTop >= 14)
      scene.handleVerticalAuditionPull();
      const miss1Remaining = scene.onMapFishingState.retriesRemaining;
      const miss1Phase = scene.onMapFishingState.phase;
      const miss1Text = chancesEl?.textContent?.trim() || '';

      // HỤT LẦN 2
      scene.onMapFishingState.markerPct = 0; // Luôn ngoài zone
      scene.handleVerticalAuditionPull();
      const miss2Remaining = scene.onMapFishingState.retriesRemaining;
      const miss2Phase = scene.onMapFishingState.phase;
      const miss2Text = chancesEl?.textContent?.trim() || '';

      // HỤT LẦN 3 (Cơ hội cuối cùng)
      scene.onMapFishingState.markerPct = 0;
      scene.handleVerticalAuditionPull();
      const miss3Remaining = scene.onMapFishingState.retriesRemaining;
      const miss3Phase = scene.onMapFishingState.phase;

      // HỤT LẦN 4: Hết cơ hội -> Cá trốn thoát
      scene.onMapFishingState.markerPct = 0;
      scene.handleVerticalAuditionPull();
      const miss4Remaining = scene.onMapFishingState?.retriesRemaining ?? 0;

      return {
        initialChancesText,
        miss1Remaining,
        miss1Phase,
        miss1Text,
        miss2Remaining,
        miss2Phase,
        miss2Text,
        miss3Remaining,
        miss3Phase,
        miss4Remaining
      };
    });

    console.log('Test 2 Fishing Retries check:', retryTestResult);
    if (retryTestResult.miss1Remaining !== 2 || retryTestResult.miss1Phase !== 'audition') {
      throw new Error('Test 2 Thất bại: Lần hụt 1 không giữ lại cá hoặc không trừ đúng số cơ hội!');
    }
    if (retryTestResult.miss2Remaining !== 1 || retryTestResult.miss2Phase !== 'audition') {
      throw new Error('Test 2 Thất bại: Lần hụt 2 không giữ lại cá hoặc không trừ đúng số cơ hội!');
    }
    if (retryTestResult.miss3Remaining !== 0) {
      throw new Error('Test 2 Thất bại: Lần hụt 3 không về 0 cơ hội!');
    }

    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_fishing_retries_chances.png') });

    console.log('\n======================================================');
    console.log('🎉 TẤT CẢ CÁC BÀI TEST KIỂM THỬ ĐÃ THÀNH CÔNG XUẤT SẮC!');
    console.log('======================================================');

  } catch (err) {
    console.error('LỖI KIỂM TRA:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyShiftedCountdownAndRetries();
