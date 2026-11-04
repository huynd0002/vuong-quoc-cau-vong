import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testCompactMarketLandscape() {
  console.log('[Test] Starting Verification of Compact Market on Landscape Screen...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  console.log(`[Test] Navigating to ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Close intro modals if present
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
  });

  // Open Market Modal in tab 'rod_bait_stall'
  console.log('[Test] Opening Market Modal (Quầy Bán Cần Câu)...');
  const modalMetrics = await page.evaluate(async () => {
    const mm = window.__marketModal;
    mm.open('rod_bait_stall');
    await new Promise(r => setTimeout(r, 300));

    const card = document.querySelector('.market-modal-card');
    const rect = card?.getBoundingClientRect();

    const rodButtons = Array.from(document.querySelectorAll('.rod-card button')).map(b => {
      const r = b.getBoundingClientRect();
      return {
        text: b.textContent.trim(),
        width: r.width,
        height: r.height
      };
    });

    const rodCards = Array.from(document.querySelectorAll('.rod-card')).map(c => {
      const r = c.getBoundingClientRect();
      return {
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height
      };
    });

    const baitCards = Array.from(document.querySelectorAll('.bait-card')).map(c => {
      const r = c.getBoundingClientRect();
      return {
        width: r.width,
        height: r.height
      };
    });

    // Check if rod cards are on the same row (top coordinates virtually identical)
    const firstTop = rodCards[0]?.top;
    const allOnSameRow = rodCards.every(c => Math.abs(c.top - firstTop) < 5);

    return {
      cardRect: {
        width: rect?.width,
        height: rect?.height,
        top: rect?.top,
        bottom: rect?.bottom
      },
      rodCardsCount: rodCards.length,
      allOnSameRow,
      rodButtons,
      baitCardsCount: baitCards.length
    };
  });

  console.log('[Test] Modal Metrics:', modalMetrics);
  assert.strictEqual(modalMetrics.rodCardsCount, 5, 'Must have 5 rods');
  assert.strictEqual(modalMetrics.allOnSameRow, true, 'All 5 rods must be neatly aligned on 1 row in landscape screen');
  assert.ok(modalMetrics.cardRect.height <= 640, `Modal height must be <= 640px, got ${modalMetrics.cardRect.height}px`);
  assert.ok(modalMetrics.cardRect.top >= 20, `Modal top must have breathing room, got ${modalMetrics.cardRect.top}px`);
  assert.ok(modalMetrics.cardRect.bottom <= 700, `Modal bottom must not exceed viewport, got ${modalMetrics.cardRect.bottom}px`);

  // Verify button heights are compact (<= 40px)
  for (const btn of modalMetrics.rodButtons) {
    console.log(`[Test] Button "${btn.text}": height = ${btn.height}px, width = ${btn.width}px`);
    assert.ok(btn.height <= 40, `Button height must be <= 40px, got ${btn.height}px`);
    assert.ok(!btn.text.includes('➡️ 🎒'), 'Button text should be clean and not have redundant wrapping arrow');
  }

  // Save screenshot of verified landscape layout
  const screenshotPath = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verified_compact_market_landscape.png';
  await page.screenshot({ path: screenshotPath });
  console.log(`[Test] Saved verified screenshot to ${screenshotPath}`);

  await browser.close();
  console.log('🎉 COMPACT MARKET LANDSCAPE VERIFICATION PASSED WITH 100% SUCCESS!');
}

testCompactMarketLandscape().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
