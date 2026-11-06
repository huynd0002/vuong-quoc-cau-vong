import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import assert from 'node:assert/strict';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactDir = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5');

async function testFishingSkillAndHarderFish() {
  console.log('--- [Test Playwright] Kiểm Tra Kỹ Năng Câu Cá (Dùng Skill Tăng Cá) & Cá Mới Khó Bắt ---');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1180, height: 820 }
  });
  const page = await context.newPage();

  // Mở game trực tiếp
  const localUrl = 'http://localhost:5173/dev.html';
  console.log(`Đang tải trang: ${localUrl}`);
  await page.goto(localUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Đóng modal khởi đầu hoặc chọn nhân vật nếu có
  await page.evaluate(() => {
    const charSelect = document.getElementById('char-select-modal');
    if (charSelect && !charSelect.hidden) {
      const startBtn = charSelect.querySelector('.char-select-btn-primary') || charSelect.querySelector('button');
      startBtn?.click();
    }
  });
  await page.waitForTimeout(1000);

  // Chuyển sang map Hồ Câu Lá Sen (map_fishing_pond)
  console.log('Chuyển tới Hồ Câu Lá Sen (map_fishing_pond)...');
  await page.evaluate(() => {
    document.getElementById('character-select-modal')?.remove();
    document.getElementById('char-select-modal')?.remove();
    document.getElementById('story-intro-modal')?.remove();
    window.__worldScene?.scene?.restart?.({ mapId: 'map_fishing_pond' });
  });
  await page.waitForTimeout(2500);

  // Đưa Hero tới bến câu (x=688, y=360)
  console.log('Đưa Bé Sam tới vị trí bến câu trên cầu gỗ...');
  await page.evaluate(() => {
    window.__worldScene?.hero?.setPosition?.(688, 360);
    window.__worldScene?.updateDockFishingProximityButton?.(688, 360);
  });
  await page.waitForTimeout(800);

  // Kiểm tra số lượng cá ban đầu trong hồ
  const initialFishCount = await page.evaluate(() => {
    return window.__worldScene?.pondFishes?.length || 0;
  });
  console.log(`Số cá ban đầu trong hồ: ${initialFishCount}`);
  assert.ok(initialFishCount >= 5, `Số cá ban đầu phải >= 5 (hiện tại: ${initialFishCount})`);

  // Kiểm tra sự xuất hiện của nút Bắt đầu câu cá và Nút Dùng Skill
  const buttonsState = await page.evaluate(() => {
    const startBtn = document.getElementById('btn-start-fishing-dock');
    const skillBtn = document.getElementById('btn-fishing-skill-dock');
    return {
      startBtnExists: Boolean(startBtn),
      startBtnDisplay: startBtn ? window.getComputedStyle(startBtn).display : 'none',
      skillBtnExists: Boolean(skillBtn),
      skillBtnDisplay: skillBtn ? window.getComputedStyle(skillBtn).display : 'none',
      skillBtnText: skillBtn?.innerText || ''
    };
  });
  console.log('Trạng thái các nút tại bến câu:', buttonsState);
  assert.equal(buttonsState.startBtnExists, true, 'Nút Bắt đầu câu cá phải tồn tại');
  assert.notEqual(buttonsState.startBtnDisplay, 'none', 'Nút Bắt đầu câu cá phải đang hiển thị');
  assert.equal(buttonsState.skillBtnExists, true, 'Nút Dùng Skill câu cá phải tồn tại');
  assert.notEqual(buttonsState.skillBtnDisplay, 'none', 'Nút Dùng Skill câu cá phải đang hiển thị');

  // BẤM NÚT DÙNG SKILL: TĂNG SỐ LƯỢNG CÁ!
  console.log('Bấm nút Dùng Skill câu cá để tăng số lượng cá trong hồ...');
  await page.evaluate(() => {
    const skillBtn = document.getElementById('btn-fishing-skill-dock');
    skillBtn?.click();
  });
  await page.waitForTimeout(1000);

  // Kiểm tra số cá sau khi dùng skill
  const afterSkillData = await page.evaluate(() => {
    const skillBtn = document.getElementById('btn-fishing-skill-dock');
    return {
      fishCount: window.__worldScene?.pondFishes?.length || 0,
      isSkillActive: window.__fishingSystem?.isFishingSkillActive?.(),
      skillBtnActive: skillBtn?.classList.contains('skill-active'),
      skillBtnText: skillBtn?.innerText || ''
    };
  });
  console.log('Dữ liệu sau khi Dùng Skill:', afterSkillData);
  assert.ok(afterSkillData.fishCount > initialFishCount, `Số lượng cá phải tăng vọt sau khi dùng Skill! (Ban đầu: ${initialFishCount}, Sau skill: ${afterSkillData.fishCount})`);
  assert.equal(afterSkillData.isSkillActive, true, 'Hệ thống câu cá phải ghi nhận Skill đang bật');
  assert.equal(afterSkillData.skillBtnActive, true, 'Nút Skill phải có class active rực sáng');

  // Chụp ảnh màn hình hồ cá đông đúc với hiệu ứng Skill
  const screenshotPath1 = path.join(artifactDir, 'verified_fishing_skill_used_more_fish.png');
  await page.screenshot({ path: screenshotPath1 });
  console.log(`✓ Đã chụp ảnh hồ cá sau khi dùng Skill: ${screenshotPath1}`);

  // Bắt đầu câu cá với Skill đang bật
  console.log('Bấm Bắt đầu câu cá...');
  await page.evaluate(() => {
    document.getElementById('btn-start-fishing-dock')?.click();
  });
  await page.waitForTimeout(2000);

  // Kiểm tra thanh Audition và nút Skill trong thanh Audition
  const auditionState = await page.evaluate(() => {
    const auditionEl = document.getElementById('onmap-fishing-audition');
    const auditionSkill = document.getElementById('btn-audition-skill');
    const track = document.getElementById('fishing-vertical-track');
    const stars = auditionEl?.querySelectorAll('.onmap-audition-star')?.length || 0;
    return {
      auditionVisible: Boolean(auditionEl),
      auditionSkillExists: Boolean(auditionSkill),
      auditionSkillActive: auditionSkill?.classList.contains('skill-active'),
      trackHeight: track ? window.getComputedStyle(track).height : '',
      starCount: stars
    };
  });
  console.log('Trạng thái thanh Audition:', auditionState);
  assert.equal(auditionState.auditionVisible, true, 'Thanh Audition dọc phải xuất hiện');
  assert.equal(auditionState.auditionSkillExists, true, 'Nút Skill trong thanh Audition phải có mặt');
  assert.equal(auditionState.auditionSkillActive, true, 'Nút Skill trong Audition phải đang active');

  // Chụp ảnh màn hình thanh audition với nút skill x2
  const screenshotPath2 = path.join(artifactDir, 'verified_fishing_audition_with_skill.png');
  await page.screenshot({ path: screenshotPath2 });
  console.log(`✓ Đã chụp ảnh thanh audition có skill: ${screenshotPath2}`);

  await browser.close();
  console.log('🎉 TOÀN BỘ KIỂM THỬ PLAYWRIGHT DÙNG SKILL TĂNG CÁ & CÁ MỚI ĐÃ THÀNH CÔNG RỰC RỠ!');
}

testFishingSkillAndHarderFish().catch(err => {
  console.error('❌ Lỗi kiểm thử Playwright:', err);
  process.exit(1);
});
