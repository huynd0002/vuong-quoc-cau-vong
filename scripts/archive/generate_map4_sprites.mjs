import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const brainDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
const outputDir = path.resolve('./assets/monsters/map4');
const map5Dir = path.resolve('./assets/monsters/map5');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Chuyển ảnh Cáo Cát mon_desert_fox từ JPG nền trắng thành PNG trong suốt
  const foxSrcJpg = path.join(brainDir, 'mon_desert_fox_idle_1793623258060.jpg');
  const foxJpgBase64 = fs.readFileSync(foxSrcJpg).toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <canvas id="c"></canvas>
    </body>
    </html>
  `);

  console.log('--- Đang xử lý Cáo Cát Fennec (mon_desert_fox)...');
  const foxResult = await page.evaluate(async (jpgBase64) => {
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    const img = new Image();
    img.src = 'data:image/jpeg;base64,' + jpgBase64;
    await new Promise(r => img.onload = r);

    // Vẽ và crop vuông cân đối
    const minDim = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - minDim) / 2;
    const sy = (img.naturalHeight - minDim) / 2;
    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 256, 256);

    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;

    // Tách nền trắng với ngưỡng thông minh
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Nếu pixel rất sáng gần trắng
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0;
      } else if (r > 220 && g > 220 && b > 220) {
        const factor = Math.min(1, Math.max(0, (255 - Math.max(r, g, b)) / 35));
        data[i + 3] = Math.round(data[i + 3] * factor);
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const idlePng = canvas.toDataURL('image/png');

    // Tạo walk_sheet 8 frame (2048 x 256)
    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = 2048;
    sheetCanvas.height = 256;
    const sCtx = sheetCanvas.getContext('2d');

    const frames = [
      { dy: 0, scaleY: 1, rot: 0 },
      { dy: -4, scaleY: 1.02, rot: -0.02 },
      { dy: -8, scaleY: 1.04, rot: -0.04 },
      { dy: -4, scaleY: 1.02, rot: -0.02 },
      { dy: 0, scaleY: 1, rot: 0 },
      { dy: -4, scaleY: 1.02, rot: 0.02 },
      { dy: -8, scaleY: 1.04, rot: 0.04 },
      { dy: -4, scaleY: 1.02, rot: 0.02 }
    ];

    frames.forEach((f, idx) => {
      sCtx.save();
      sCtx.translate(idx * 256 + 128, 128 + f.dy);
      sCtx.rotate(f.rot);
      sCtx.scale(1, f.scaleY);
      sCtx.drawImage(canvas, -128, -128, 256, 256);
      sCtx.restore();
    });

    return {
      idlePng,
      walkSheetPng: sheetCanvas.toDataURL('image/png')
    };
  }, foxJpgBase64);

  // Lưu files Cáo Cát
  fs.writeFileSync(path.join(outputDir, 'mon_desert_fox_idle.png'), Buffer.from(foxResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'mon_desert_fox_walk_sheet.png'), Buffer.from(foxResult.walkSheetPng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'mon_desert_fox.png'), Buffer.from(foxResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'mon_desert_fox_walk.webp'), Buffer.from(foxResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'mon_desert_fox_action.webp'), Buffer.from(foxResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'mon_desert_fox_skill.webp'), Buffer.from(foxResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'mon_desert_fox_hit.webp'), Buffer.from(foxResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'mon_desert_fox_celebrate.webp'), Buffer.from(foxResult.idlePng.split(',')[1], 'base64'));

  console.log('✓ Xử lý Cáo Cát hoàn tất!');

  // 2. Xử lý Chim Ưng Mặt Trời (mon_desert_falcon) từ bộ ảnh desert_monster cực đẹp
  console.log('--- Đang xử lý Chim Ưng Mặt Trời (mon_desert_falcon)...');
  const falconCopies = [
    { src: 'desert_monster_idle.png', dest: 'mon_desert_falcon_idle.png' },
    { src: 'desert_monster_idle.png', dest: 'mon_desert_falcon.png' },
    { src: 'desert_monster_walk_sheet.png', dest: 'mon_desert_falcon_walk_sheet.png' },
    { src: 'desert_monster_walk.webp', dest: 'mon_desert_falcon_walk.webp' },
    { src: 'desert_monster_action.webp', dest: 'mon_desert_falcon_action.webp' },
    { src: 'desert_monster_skill.webp', dest: 'mon_desert_falcon_skill.webp' },
    { src: 'desert_monster_hit.webp', dest: 'mon_desert_falcon_hit.webp' },
    { src: 'desert_monster_celebrate.webp', dest: 'mon_desert_falcon_celebrate.webp' }
  ];
  falconCopies.forEach(({ src, dest }) => {
    fs.copyFileSync(path.join(map5Dir, src), path.join(outputDir, dest));
  });
  console.log('✓ Xử lý Chim Ưng Mặt Trời hoàn tất!');

  // 3. Render Vector Chibi Bọ Cánh Cứng Ánh Dương (mon_scarab)
  console.log('--- Đang render Bọ Cánh Cứng Ánh Dương (mon_scarab)...');
  const scarabResult = await page.evaluate(() => {
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    ctx.clearRect(0, 0, 256, 256);

    // Vẽ Scarab chibi dễ thương
    const cx = 128, cy = 128;

    // 6 Chân nhỏ tròn mập
    ctx.fillStyle = '#b45309';
    const legs = [
      [-60, -20], [-68, 10], [-60, 40],
      [60, -20], [68, 10], [60, 40]
    ];
    legs.forEach(([lx, ly]) => {
      ctx.beginPath();
      ctx.arc(cx + lx, cy + ly, 12, 0, Math.PI * 2);
      ctx.fill();
    });

    // Thân bọ / Mai ngọc bích viền vàng
    ctx.beginPath();
    ctx.ellipse(cx, cy + 15, 62, 72, 0, 0, Math.PI * 2);
    const gradShell = ctx.createLinearGradient(cx - 50, cy - 50, cx + 50, cy + 80);
    gradShell.addColorStop(0, '#10b981'); // Ngọc bích
    gradShell.addColorStop(0.5, '#059669');
    gradShell.addColorStop(1, '#047857');
    ctx.fillStyle = gradShell;
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#fbbf24'; // Viền vàng hoàng kim
    ctx.stroke();

    // Rãnh cánh giữa lưng
    ctx.beginPath();
    ctx.moveTo(cx, cy - 50);
    ctx.lineTo(cx, cy + 85);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    // Điểm nhấn hoa văn mặt trời trên mai
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Đầu bọ tròn dễ thương
    ctx.beginPath();
    ctx.ellipse(cx, cy - 55, 48, 38, 0, 0, Math.PI * 2);
    const gradHead = ctx.createLinearGradient(cx, cy - 90, cx, cy - 20);
    gradHead.addColorStop(0, '#fcd34d');
    gradHead.addColorStop(1, '#f59e0b');
    ctx.fillStyle = gradHead;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    // Hai sừng Scarab nhỏ xinh như vương miện
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 85);
    ctx.quadraticCurveTo(cx - 35, cy - 110, cx - 18, cy - 115);
    ctx.quadraticCurveTo(cx - 10, cy - 105, cx - 8, cy - 88);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 20, cy - 85);
    ctx.quadraticCurveTo(cx + 35, cy - 110, cx + 18, cy - 115);
    ctx.quadraticCurveTo(cx + 10, cy - 105, cx + 8, cy - 88);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.stroke();

    // Mắt to tròn lấp lánh hoạt hình
    const drawEye = (ex, ey) => {
      ctx.beginPath();
      ctx.arc(ex, ey, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      // Ánh sao lấp lánh trong mắt
      ctx.beginPath();
      ctx.arc(ex - 4, ey - 4, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex + 4, ey + 4, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    };
    drawEye(cx - 18, cy - 55);
    drawEye(cx + 18, cy - 55);

    // Má hồng baby
    ctx.beginPath();
    ctx.arc(cx - 30, cy - 45, 9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 30, cy - 45, 9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.fill();

    // Nụ cười mỉm đáng yêu
    ctx.beginPath();
    ctx.arc(cx, cy - 45, 9, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#991b1b';
    ctx.stroke();

    // Quả cầu mặt trời vàng ôm trước ngực
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 24, 0, Math.PI * 2);
    const gradSun = ctx.createRadialGradient(cx - 5, cy - 15, 2, cx, cy - 10, 24);
    gradSun.addColorStop(0, '#ffffff');
    gradSun.addColorStop(0.3, '#fef08a');
    gradSun.addColorStop(0.7, '#f59e0b');
    gradSun.addColorStop(1, '#ea580c');
    ctx.fillStyle = gradSun;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    const idlePng = canvas.toDataURL('image/png');

    // Tạo walk_sheet 8 frame (2048 x 256)
    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = 2048;
    sheetCanvas.height = 256;
    const sCtx = sheetCanvas.getContext('2d');

    const frames = [
      { dy: 0, rot: 0, scaleX: 1 },
      { dy: -3, rot: -0.04, scaleX: 1.02 },
      { dy: -6, rot: -0.06, scaleX: 1.04 },
      { dy: -3, rot: -0.04, scaleX: 1.02 },
      { dy: 0, rot: 0, scaleX: 1 },
      { dy: -3, rot: 0.04, scaleX: 1.02 },
      { dy: -6, rot: 0.06, scaleX: 1.04 },
      { dy: -3, rot: 0.04, scaleX: 1.02 }
    ];

    frames.forEach((f, idx) => {
      sCtx.save();
      sCtx.translate(idx * 256 + 128, 128 + f.dy);
      sCtx.rotate(f.rot);
      sCtx.scale(f.scaleX, 1);
      sCtx.drawImage(canvas, -128, -128, 256, 256);
      sCtx.restore();
    });

    return {
      idlePng,
      walkSheetPng: sheetCanvas.toDataURL('image/png')
    };
  });

  fs.writeFileSync(path.join(outputDir, 'mon_scarab_idle.png'), Buffer.from(scarabResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'mon_scarab_walk_sheet.png'), Buffer.from(scarabResult.walkSheetPng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'mon_scarab.png'), Buffer.from(scarabResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'mon_scarab_walk.webp'), Buffer.from(scarabResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'mon_scarab_action.webp'), Buffer.from(scarabResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'mon_scarab_skill.webp'), Buffer.from(scarabResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'mon_scarab_hit.webp'), Buffer.from(scarabResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'mon_scarab_celebrate.webp'), Buffer.from(scarabResult.idlePng.split(',')[1], 'base64'));
  console.log('✓ Xử lý Bọ Cánh Cứng hoàn tất!');

  // 4. Render Boss: Thần Nhân Sư Ánh Dương (boss_desert_sphinx)
  console.log('--- Đang render Boss Thần Nhân Sư Ánh Dương (boss_desert_sphinx)...');
  const sphinxResult = await page.evaluate(() => {
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    canvas.width = 320;
    canvas.height = 320;
    ctx.clearRect(0, 0, 320, 320);

    const cx = 160, cy = 160;

    // Vầng hào quang mặt trời thái dương tỏa sáng sau đầu
    const numRays = 12;
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    for (let i = 0; i < numRays; i++) {
      const angle = (i * Math.PI * 2) / numRays;
      const r1 = 80;
      const r2 = 118;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle - 0.12) * r1, cy - 30 + Math.sin(angle - 0.12) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy - 30 + Math.sin(angle) * r2);
      ctx.lineTo(cx + Math.cos(angle + 0.12) * r1, cy - 30 + Math.sin(angle + 0.12) * r1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Đôi cánh lông vũ vàng kim hai bên
    const drawWing = (isLeft) => {
      ctx.save();
      ctx.translate(cx + (isLeft ? -85 : 85), cy + 10);
      ctx.scale(isLeft ? 1 : -1, 1);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-45, -55, -80, -35);
      ctx.quadraticCurveTo(-65, 20, 0, 35);
      ctx.closePath();
      const gradWing = ctx.createLinearGradient(-80, -40, 0, 30);
      gradWing.addColorStop(0, '#fef08a');
      gradWing.addColorStop(0.5, '#facc15');
      gradWing.addColorStop(1, '#eab308');
      ctx.fillStyle = gradWing;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ca8a04';
      ctx.stroke();
      ctx.restore();
    };
    drawWing(true);
    drawWing(false);

    // Thân sư tử vàng ngồi bệ cát
    ctx.beginPath();
    ctx.ellipse(cx, cy + 65, 80, 55, 0, 0, Math.PI * 2);
    const gradBody = ctx.createLinearGradient(cx, cy + 10, cx, cy + 120);
    gradBody.addColorStop(0, '#fbbf24');
    gradBody.addColorStop(1, '#d97706');
    ctx.fillStyle = gradBody;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#b45309';
    ctx.stroke();

    // Hai bàn chân mập mạp phía trước
    const drawPaw = (px, py) => {
      ctx.beginPath();
      ctx.ellipse(px, py, 26, 20, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fde68a';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#b45309';
      ctx.stroke();
      // 3 móng tròn dễ thương
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(px + i * 11, py + 12, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    };
    drawPaw(cx - 45, cy + 100);
    drawPaw(cx + 45, cy + 100);

    // Vòng cổ Ai Cập pharaoh kẻ sọc xanh ngọc & vàng
    ctx.beginPath();
    ctx.ellipse(cx, cy + 22, 58, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    // Đầu sư tử tròn mập
    ctx.beginPath();
    ctx.arc(cx, cy - 30, 60, 0, Math.PI * 2);
    const gradHead = ctx.createRadialGradient(cx, cy - 40, 10, cx, cy - 30, 60);
    gradHead.addColorStop(0, '#fef08a');
    gradHead.addColorStop(0.7, '#facc15');
    gradHead.addColorStop(1, '#eab308');
    ctx.fillStyle = gradHead;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#b45309';
    ctx.stroke();

    // Vương miện Nemes Ai Cập trùm trên đầu
    ctx.beginPath();
    ctx.moveTo(cx - 62, cy - 30);
    ctx.quadraticCurveTo(cx - 50, cy - 95, cx, cy - 100);
    ctx.quadraticCurveTo(cx + 50, cy - 95, cx + 62, cy - 30);
    ctx.quadraticCurveTo(cx + 70, cy + 5, cx + 55, cy + 15);
    ctx.lineTo(cx - 55, cy + 15);
    ctx.quadraticCurveTo(cx - 70, cy + 5, cx - 62, cy - 30);
    ctx.closePath();
    ctx.fillStyle = '#0891b2'; // Xanh ngọc Pharaoh
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Hoa văn sọc vàng hoàng gia trên nón Nemes
    for (let sy = -85; sy <= 0; sy += 18) {
      ctx.beginPath();
      ctx.ellipse(cx, cy + sy, 45, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fde047';
      ctx.fill();
    }

    // Đĩa mặt trời vàng trên đỉnh nón
    ctx.beginPath();
    ctx.arc(cx, cy - 105, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Mắt Nhân Sư to tròn long lanh thân thiện
    const drawEye = (ex, ey) => {
      ctx.beginPath();
      ctx.ellipse(ex, ey, 16, 19, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      // Tia sáng trong mắt
      ctx.beginPath();
      ctx.arc(ex - 5, ey - 6, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex + 5, ey + 5, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    };
    drawEye(cx - 24, cy - 28);
    drawEye(cx + 24, cy - 28);

    // Má hồng baby sư tử
    ctx.beginPath();
    ctx.arc(cx - 38, cy - 14, 11, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 38, cy - 14, 11, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.fill();

    // Mũi tam giác hồng dễ thương
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy - 15);
    ctx.lineTo(cx + 7, cy - 15);
    ctx.lineTo(cx, cy - 7);
    ctx.closePath();
    ctx.fillStyle = '#f43f5e';
    ctx.fill();

    // Miệng mỉm cười hiền từ
    ctx.beginPath();
    ctx.moveTo(cx, cy - 7);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx - 8, cy + 2, 8, 0, Math.PI * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 8, cy + 2, 8, Math.PI * 0.15, Math.PI);
    ctx.stroke();

    const idlePng = canvas.toDataURL('image/png');

    // Tạo walk_sheet 8 frame (2560 x 320)
    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = 2560;
    sheetCanvas.height = 320;
    const sCtx = sheetCanvas.getContext('2d');

    const frames = [
      { dy: 0, rot: 0, scaleY: 1 },
      { dy: -4, rot: -0.02, scaleY: 1.02 },
      { dy: -9, rot: -0.04, scaleY: 1.04 },
      { dy: -4, rot: -0.02, scaleY: 1.02 },
      { dy: 0, rot: 0, scaleY: 1 },
      { dy: -4, rot: 0.02, scaleY: 1.02 },
      { dy: -9, rot: 0.04, scaleY: 1.04 },
      { dy: -4, rot: 0.02, scaleY: 1.02 }
    ];

    frames.forEach((f, idx) => {
      sCtx.save();
      sCtx.translate(idx * 320 + 160, 160 + f.dy);
      sCtx.rotate(f.rot);
      sCtx.scale(1, f.scaleY);
      sCtx.drawImage(canvas, -160, -160, 320, 320);
      sCtx.restore();
    });

    return {
      idlePng,
      walkSheetPng: sheetCanvas.toDataURL('image/png')
    };
  });

  fs.writeFileSync(path.join(outputDir, 'boss_desert_sphinx_idle.png'), Buffer.from(sphinxResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'boss_desert_sphinx_walk_sheet.png'), Buffer.from(sphinxResult.walkSheetPng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'boss_desert_sphinx_idle_sheet.png'), Buffer.from(sphinxResult.walkSheetPng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'boss_desert_sphinx_skill_sheet.png'), Buffer.from(sphinxResult.walkSheetPng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'boss_desert_sphinx.png'), Buffer.from(sphinxResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'boss_desert_sphinx_walk.webp'), Buffer.from(sphinxResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'boss_desert_sphinx_action.webp'), Buffer.from(sphinxResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'boss_desert_sphinx_skill.webp'), Buffer.from(sphinxResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'boss_desert_sphinx_hit.webp'), Buffer.from(sphinxResult.idlePng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'boss_desert_sphinx_celebrate.webp'), Buffer.from(sphinxResult.idlePng.split(',')[1], 'base64'));
  console.log('✓ Xử lý Boss Thần Nhân Sư hoàn tất!');

  // 5. Render Projectiles và Impact VFX cho Đấu Trường Sa Mạc
  console.log('--- Đang tạo Projectile & Impact VFX...');
  const vfxResult = await page.evaluate(() => {
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;

    // 5a. Quả cầu lửa ánh dương (sun projectile)
    ctx.clearRect(0, 0, 64, 64);
    const gradProj = ctx.createRadialGradient(32, 32, 4, 32, 32, 28);
    gradProj.addColorStop(0, '#ffffff');
    gradProj.addColorStop(0.3, '#fde047');
    gradProj.addColorStop(0.7, '#f59e0b');
    gradProj.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = gradProj;
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fill();
    const projPng = canvas.toDataURL('image/png');

    // 5b. Impact tia sáng mặt trời bừng sáng (sun impact)
    canvas.width = 96;
    canvas.height = 96;
    ctx.clearRect(0, 0, 96, 96);
    const gradImp = ctx.createRadialGradient(48, 48, 6, 48, 48, 44);
    gradImp.addColorStop(0, '#ffffff');
    gradImp.addColorStop(0.4, '#fef08a');
    gradImp.addColorStop(0.8, '#f59e0b');
    gradImp.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = gradImp;
    ctx.beginPath();
    ctx.arc(48, 48, 44, 0, Math.PI * 2);
    ctx.fill();

    // Các tia sáng sao lóe ra
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.arc(48 + Math.cos(angle) * 35, 48 + Math.sin(angle) * 35, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    const impactPng = canvas.toDataURL('image/png');

    return { projPng, impactPng };
  });

  fs.writeFileSync(path.join(outputDir, 'desert_proj.png'), Buffer.from(vfxResult.projPng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'desert_impact.png'), Buffer.from(vfxResult.impactPng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'fox_proj.png'), Buffer.from(vfxResult.projPng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'fox_impact.png'), Buffer.from(vfxResult.impactPng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'scarab_proj.png'), Buffer.from(vfxResult.projPng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'scarab_impact.png'), Buffer.from(vfxResult.impactPng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'falcon_proj.png'), Buffer.from(vfxResult.projPng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'falcon_impact.png'), Buffer.from(vfxResult.impactPng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'sphinx_proj.png'), Buffer.from(vfxResult.projPng.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'sphinx_impact.png'), Buffer.from(vfxResult.impactPng.split(',')[1], 'base64'));

  console.log('✓ Đã tạo toàn bộ VFX Projectile & Impact!');

  await browser.close();
  console.log('🎉 HOÀN TẤT TẠO TOÀN BỘ ASSETS CHO MAP 4!');
}

run().catch(err => {
  console.error('Lỗi sinh assets:', err);
  process.exit(1);
});
