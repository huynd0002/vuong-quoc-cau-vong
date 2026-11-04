import { chromium } from 'playwright';
import path from 'path';

async function verifyIpadLayout() {
  const browser = await chromium.launch();
  const testCases = [
    { name: 'iPad A16 Full (1180x820)', w: 1180, h: 820 },
    { name: 'iPad A16 Safari (1180x740)', w: 1180, h: 740 },
    { name: 'iPad A16 Safari Compact (1180x700)', w: 1180, h: 700 },
    { name: 'iPad Std (1024x768)', w: 1024, h: 768 },
    { name: 'iPad Std Safari (1024x700)', w: 1024, h: 700 },
    { name: 'iPad Pro 11 (1194x834)', w: 1194, h: 834 },
    { name: 'iPad Pro 12.9 (1366x1024)', w: 1366, h: 1024 },
    { name: 'Desktop PC (1920x1080)', w: 1920, h: 1080 },
    { name: 'Mobile Landscape (844x390)', w: 844, h: 390 }
  ];

  let hasErrors = false;

  for (const tc of testCases) {
    const page = await browser.newPage({ viewport: { width: tc.w, height: tc.h } });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const res = await page.evaluate(() => {
      const app = document.querySelector('#game-app');
      const stage = document.querySelector('.scene-stage');
      const controlBar = document.querySelector('.control-bar');
      const winH = window.innerHeight;
      const docScrollH = document.documentElement.scrollHeight;
      const bodyScrollH = document.body.scrollHeight;
      const appRect = app?.getBoundingClientRect();
      const stageRect = stage?.getBoundingClientRect();
      const cbRect = controlBar?.getBoundingClientRect();
      
      return {
        winH,
        winW: window.innerWidth,
        docScrollH,
        bodyScrollH,
        overflowY: docScrollH - winH,
        appBottom: appRect ? appRect.bottom : null,
        stageBottom: stageRect ? stageRect.bottom : null,
        stageHeight: stageRect ? stageRect.height : null,
        stageWidth: stageRect ? stageRect.width : null,
        cbBottom: cbRect ? cbRect.bottom : null
      };
    });

    const isFitted = res.overflowY <= 0 && res.appBottom <= tc.h + 1;
    console.log(`[${isFitted ? 'PASS' : 'FAIL'}] ${tc.name}: overflow=${res.overflowY}px | appBottom=${res.appBottom?.toFixed(1)} / ${tc.h} | stage: ${res.stageWidth?.toFixed(0)}x${res.stageHeight?.toFixed(0)} (bottom: ${res.stageBottom?.toFixed(1)}) | controlBarBottom=${res.cbBottom?.toFixed(1)}`);

    if (!isFitted) {
      hasErrors = true;
    }

    if (tc.name.includes('iPad A16 Safari (1180x740)')) {
      await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_ipad_a16_safari_perfect_fit.png' });
    }
    if (tc.name.includes('iPad A16 Full (1180x820)')) {
      await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_ipad_a16_fullscreen_perfect_fit.png' });
    }

    await page.close();
  }

  await browser.close();

  if (hasErrors) {
    console.error('Some viewports failed overflow test!');
    process.exit(1);
  } else {
    console.log('\nALL 9 VIEWPORTS PASSED! 100% PERFECT FIT WITHOUT ANY OVERFLOW!');
  }
}

verifyIpadLayout().catch((err) => {
  console.error(err);
  process.exit(1);
});
