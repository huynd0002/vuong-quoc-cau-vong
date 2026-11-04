import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const outputDir = path.resolve('./assets/skill');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <canvas id="c"></canvas>
    </body>
    </html>
  `);

  console.log('--- Đang tạo sinh hình ảnh Skill Nhân Vật cho Map 4 (Tấn công & Phòng thủ)...');

  const skills = await page.evaluate(() => {
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');

    // 1. Skill Tấn Công: Quả Cầu Xoáy Thái Dương (hero_sun_vortex_proj.png - 128x128)
    canvas.width = 128;
    canvas.height = 128;
    ctx.clearRect(0, 0, 128, 128);

    const cx = 64, cy = 64;

    // Hào quang tỏa sáng bên ngoài
    const outerAura = ctx.createRadialGradient(cx, cy, 10, cx, cy, 62);
    outerAura.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
    outerAura.addColorStop(0.4, 'rgba(245, 158, 11, 0.7)');
    outerAura.addColorStop(0.8, 'rgba(234, 88, 12, 0.35)');
    outerAura.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = outerAura;
    ctx.beginPath();
    ctx.arc(cx, cy, 62, 0, Math.PI * 2);
    ctx.fill();

    // 6 Cánh xoáy lửa mặt trời lộng lẫy (Solar Swirl Vortex)
    ctx.save();
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((i * Math.PI) / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(25, -15, 48, -10, 52, -2);
      ctx.bezierCurveTo(45, 12, 20, 20, 0, 0);
      const gradBlade = ctx.createLinearGradient(0, 0, 52, 0);
      gradBlade.addColorStop(0, '#fef08a');
      gradBlade.addColorStop(0.5, '#f59e0b');
      gradBlade.addColorStop(1, '#ea580c');
      ctx.fillStyle = gradBlade;
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Lõi năng lượng mặt trời trắng vàng chói sáng
    const coreGrad = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 26);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.35, '#fef08a');
    coreGrad.addColorStop(0.7, '#f59e0b');
    coreGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Các tia sáng sao lấp lánh xung quanh
    ctx.fillStyle = '#ffffff';
    const sparkles = [
      [-30, -28, 4], [34, -26, 3.5], [-28, 30, 3], [32, 28, 4.5],
      [0, -45, 3.5], [45, 0, 4], [0, 45, 3], [-45, 0, 3.5]
    ];
    sparkles.forEach(([sx, sy, r]) => {
      ctx.beginPath();
      ctx.arc(cx + sx, cy + sy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    const sunVortexProj = canvas.toDataURL('image/png');

    // 2. Skill Tấn Công: Vụ Nổ Ánh Dương (hero_sun_explosion.png - 256x256)
    canvas.width = 256;
    canvas.height = 256;
    ctx.clearRect(0, 0, 256, 256);
    const ncx = 128, ncy = 128;

    // Vầng hào quang nổ lớn
    const expAura = ctx.createRadialGradient(ncx, ncy, 10, ncx, ncy, 120);
    expAura.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    expAura.addColorStop(0.3, 'rgba(254, 240, 138, 0.85)');
    expAura.addColorStop(0.65, 'rgba(245, 158, 11, 0.55)');
    expAura.addColorStop(0.9, 'rgba(234, 88, 12, 0.25)');
    expAura.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = expAura;
    ctx.beginPath();
    ctx.arc(ncx, ncy, 120, 0, Math.PI * 2);
    ctx.fill();

    // 12 Tia sáng mặt trời phóng ra ngoài
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      ctx.save();
      ctx.translate(ncx, ncy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-8, 30);
      ctx.lineTo(0, 118);
      ctx.lineTo(8, 30);
      ctx.closePath();
      const rayGrad = ctx.createLinearGradient(0, 30, 0, 118);
      rayGrad.addColorStop(0, '#ffffff');
      rayGrad.addColorStop(0.5, '#fef08a');
      rayGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = rayGrad;
      ctx.fill();
      ctx.restore();
    }

    // Vòng tròn sóng xung kích hoàng kim (Shockwave Ring)
    ctx.beginPath();
    ctx.arc(ncx, ncy, 75, 0, Math.PI * 2);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ncx, ncy, 88, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Tâm nổ rực sáng
    const coreExp = ctx.createRadialGradient(ncx, ncy, 0, ncx, ncy, 45);
    coreExp.addColorStop(0, '#ffffff');
    coreExp.addColorStop(0.5, '#fef08a');
    coreExp.addColorStop(0.85, '#f59e0b');
    coreExp.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = coreExp;
    ctx.beginPath();
    ctx.arc(ncx, ncy, 45, 0, Math.PI * 2);
    ctx.fill();

    const sunExplosion = canvas.toDataURL('image/png');

    // 3. Skill Phòng Thủ: Khiên Thái Dương Hoàng Kim (hero_sun_shield.png - 256x256)
    canvas.width = 256;
    canvas.height = 256;
    ctx.clearRect(0, 0, 256, 256);
    const scx = 128, scy = 128;

    // Vòm hào quang bảo vệ hình quả cầu năng lượng
    const shieldAura = ctx.createRadialGradient(scx, scy, 30, scx, scy, 115);
    shieldAura.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
    shieldAura.addColorStop(0.7, 'rgba(245, 158, 11, 0.45)');
    shieldAura.addColorStop(0.95, 'rgba(234, 88, 12, 0.7)');
    shieldAura.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = shieldAura;
    ctx.beginPath();
    ctx.arc(scx, scy, 115, 0, Math.PI * 2);
    ctx.fill();

    // Chiếc Khiên Hoàng Kim Mặt Trời (Golden Sun Shield)
    // Khung khiên hình vương giả Ai Cập
    ctx.save();
    ctx.translate(scx, scy);
    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.bezierCurveTo(75, -90, 85, -20, 80, 25);
    ctx.bezierCurveTo(75, 75, 25, 95, 0, 105);
    ctx.bezierCurveTo(-25, 95, -75, 75, -80, 25);
    ctx.bezierCurveTo(-85, -20, -75, -90, 0, -90);
    ctx.closePath();

    const shieldGrad = ctx.createLinearGradient(-80, -90, 80, 105);
    shieldGrad.addColorStop(0, '#fef08a');
    shieldGrad.addColorStop(0.3, '#fde047');
    shieldGrad.addColorStop(0.7, '#f59e0b');
    shieldGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = shieldGrad;
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Viền trong ngọc bích hoàng gia
    ctx.beginPath();
    ctx.moveTo(0, -75);
    ctx.bezierCurveTo(60, -75, 68, -15, 64, 20);
    ctx.bezierCurveTo(60, 60, 20, 78, 0, 88);
    ctx.bezierCurveTo(-20, 78, -60, 60, -64, 20);
    ctx.bezierCurveTo(-68, -15, -60, -75, 0, -75);
    ctx.closePath();
    ctx.fillStyle = '#06b6d4'; // Ngọc lam Pharaoh
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // Biểu tượng mặt trời vàng rực rỡ ở tâm khiên
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    const sunGrad = ctx.createRadialGradient(-5, -8, 2, 0, 0, 32);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.4, '#fef08a');
    sunGrad.addColorStop(0.8, '#f59e0b');
    sunGrad.addColorStop(1, '#ea580c');
    ctx.fillStyle = sunGrad;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // 8 Tia nắng mặt trời trên khiên
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle - 0.18) * 34, Math.sin(angle - 0.18) * 34);
      ctx.lineTo(Math.cos(angle) * 50, Math.sin(angle) * 50);
      ctx.lineTo(Math.cos(angle + 0.18) * 34, Math.sin(angle + 0.18) * 34);
      ctx.closePath();
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    const sunShield = canvas.toDataURL('image/png');

    return {
      sunVortexProj,
      sunExplosion,
      sunShield
    };
  });

  fs.writeFileSync(path.join(outputDir, 'hero_sun_vortex_proj.png'), Buffer.from(skills.sunVortexProj.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'hero_sun_explosion.png'), Buffer.from(skills.sunExplosion.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outputDir, 'hero_sun_shield.png'), Buffer.from(skills.sunShield.split(',')[1], 'base64'));

  console.log('✓ Đã tạo thành công bộ Skill Tấn Công & Phòng Thủ cho Map 4:');
  console.log('  - assets/skill/hero_sun_vortex_proj.png');
  console.log('  - assets/skill/hero_sun_explosion.png');
  console.log('  - assets/skill/hero_sun_shield.png');

  await browser.close();
}

run().catch(err => {
  console.error('Lỗi tạo skill:', err);
  process.exit(1);
});
