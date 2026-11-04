import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('[Test] Starting Large Numbers & Quantity Images Verification...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const gameHtmlPath = path.resolve(__dirname, '../../../game.html');
  const fileUrl = `file://${gameHtmlPath.replace(/\\/g, '/')}`;

  console.log(`[Test] Loading ${fileUrl}...`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Close character select modal if open
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
  });

  // TEST 1: Open Battle Arena with q_map2_counting_oranges
  console.log('[Test 1] Opening battle with counting oranges question (q_map2_counting_oranges)...');
  await page.evaluate(() => {
    const qb = window.__questionBank;
    const q = qb.getQuestion('q_map2_counting_oranges');
    const arena = window.__battleArenaModal;
    arena.openArena({
      id: 'enc_test_oranges',
      name: 'Bạn Cua Cam',
      questionId: 'q_map2_counting_oranges'
    });
  });
  await page.waitForTimeout(1000);

  const test1Info = await page.evaluate(() => {
    const arena = window.__battleArenaModal;
    const promptImgs = Array.from(document.querySelectorAll('#arena-question-prompt img')).map(img => img.src);
    const btns = Array.from(document.querySelectorAll('#arena-answers-grid .ans-btn'));

    const btnDetails = btns.map(b => {
      const numEl = b.querySelector('.ans-giant-number');
      const numSize = numEl ? window.getComputedStyle(numEl).fontSize : null;
      const trayImgs = Array.from(b.querySelectorAll('.ans-quantity-mini-img')).map(img => img.src);
      const caption = b.querySelector('.ans-quantity-caption')?.textContent?.trim();
      return {
        number: numEl?.textContent?.trim(),
        numSize,
        trayImagesCount: trayImgs.length,
        firstImgSrc: trayImgs[0],
        caption
      };
    });

    return {
      promptImagesCount: promptImgs.length,
      promptFirstImg: promptImgs[0],
      buttons: btnDetails
    };
  });

  console.log('[Test 1] Details:', JSON.stringify(test1Info, null, 2));

  // Assert prompt has 4 oranges
  assert.strictEqual(test1Info.promptImagesCount, 4, 'Prompt should display 4 orange cards');
  assert.ok(test1Info.promptFirstImg.length > 50, 'Prompt should have valid image source');

  // Assert button 1 has 3 oranges, button 2 has 4 oranges, button 3 has 5 oranges
  assert.strictEqual(test1Info.buttons.length, 3, 'Should have 3 answer buttons');
  
  // Check button 1: "3 quả cam"
  assert.strictEqual(test1Info.buttons[0].number, '3');
  assert.strictEqual(test1Info.buttons[0].trayImagesCount, 3, 'Button 1 should have 3 orange images');
  assert.strictEqual(test1Info.buttons[0].firstImgSrc, test1Info.promptFirstImg, 'Button 1 image must match prompt image');
  assert.ok(parseFloat(test1Info.buttons[0].numSize) >= 40, `Number font size should be >= 40px, got ${test1Info.buttons[0].numSize}`);

  // Check button 2: "4 quả cam"
  assert.strictEqual(test1Info.buttons[1].number, '4');
  assert.strictEqual(test1Info.buttons[1].trayImagesCount, 4, 'Button 2 should have 4 orange images');
  assert.strictEqual(test1Info.buttons[1].firstImgSrc, test1Info.promptFirstImg, 'Button 2 image must match prompt image');

  // Check button 3: "5 quả cam"
  assert.strictEqual(test1Info.buttons[2].number, '5');
  assert.strictEqual(test1Info.buttons[2].trayImagesCount, 5, 'Button 3 should have 5 orange images');
  assert.strictEqual(test1Info.buttons[2].firstImgSrc, test1Info.promptFirstImg, 'Button 3 image must match prompt image');

  // Take screenshot 1
  const screenshot1 = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_counting_oranges_quantity_answers.png';
  await page.screenshot({ path: screenshot1 });
  console.log(`[Test 1] Screenshot saved: ${screenshot1}`);

  // TEST 2: Test Math Equation Question (q_map1_counting_oranges_intro: 2 cam + 1 cam = ?)
  console.log('[Test 2] Opening battle with math oranges intro (q_map1_counting_oranges_intro)...');
  await page.evaluate(() => {
    const qb = window.__questionBank;
    const q = qb.getQuestion('q_map1_counting_oranges_intro');
    const arena = window.__battleArenaModal;
    arena.currentQuestion = q;
    arena.setupTurn();
  });
  await page.waitForTimeout(1000);

  const test2Info = await page.evaluate(() => {
    const mathImgs = Array.from(document.querySelectorAll('.math-card-mini-img')).map(img => img.src);
    const btns = Array.from(document.querySelectorAll('#arena-answers-grid .ans-btn'));
    return {
      mathImgsCount: mathImgs.length,
      mathFirstImg: mathImgs[0],
      buttons: btns.map(b => ({
        number: b.querySelector('.ans-giant-number')?.textContent?.trim(),
        trayImagesCount: b.querySelectorAll('.ans-quantity-mini-img').length,
        imgSrc: b.querySelector('.ans-quantity-mini-img')?.src
      }))
    };
  });

  console.log('[Test 2] Math Equation Details:', JSON.stringify(test2Info, null, 2));
  assert.strictEqual(test2Info.mathImgsCount, 3, 'Math equation should show 2 + 1 = 3 orange images in cards');
  assert.strictEqual(test2Info.mathFirstImg, test2Info.buttons[0].imgSrc, 'Math card image and button images must match');
  assert.strictEqual(test2Info.buttons[0].number, '2');
  assert.strictEqual(test2Info.buttons[0].trayImagesCount, 2);
  assert.strictEqual(test2Info.buttons[1].number, '3');
  assert.strictEqual(test2Info.buttons[1].trayImagesCount, 3);
  assert.strictEqual(test2Info.buttons[2].number, '4');
  assert.strictEqual(test2Info.buttons[2].trayImagesCount, 4);

  // Take screenshot 2
  const screenshot2 = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5/verify_math_equation_quantity_answers.png';
  await page.screenshot({ path: screenshot2 });
  console.log(`[Test 2] Screenshot saved: ${screenshot2}`);

  // TEST 3: Click the correct answer ('3' is index 1 for 2+1=3)
  console.log('[Test 3] Answering correct option (3 quả cam)...');
  await page.evaluate(() => {
    const arena = window.__battleArenaModal;
    const correctIdx = arena.currentQuestion?.correct ?? 1;
    const btns = Array.from(document.querySelectorAll('#arena-answers-grid .ans-btn'));
    btns[correctIdx]?.click();
  });
  await page.waitForTimeout(1000);

  await browser.close();
  console.log('✅ ALL LARGE NUMBERS & QUANTITY IMAGE TESTS PASSED SUCCESSFULLY!');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
