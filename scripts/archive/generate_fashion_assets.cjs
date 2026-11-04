const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve('assets/fashion');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const generated = await page.evaluate(async () => {
    // Helper to draw cute 3D-shaded rounded shapes
    function createIcon(drawFn, size = 256) {
      const cvs = document.createElement('canvas');
      cvs.width = size; cvs.height = size;
      const ctx = cvs.getContext('2d');
      drawFn(ctx, size);
      return cvs.toDataURL('image/png');
    }

    // 1. Cô Cừu Thợ May (Sheep Tailor)
    const sheepTailor = createIcon((ctx, S) => {
      ctx.save();
      const cx = S / 2, cy = S / 2;

      // Soft circular backdrop glow
      const grad = ctx.createRadialGradient(cx, cy, S * 0.1, cx, cy, S * 0.48);
      grad.addColorStop(0, '#fdf4ff');
      grad.addColorStop(1, '#f3e8ff');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, S * 0.46, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#d8b4fe';
      ctx.stroke();

      // Fluffy wool puffs (background)
      ctx.fillStyle = '#ffffff';
      const puffs = [
        [cx - 50, cy - 35, 34], [cx + 50, cy - 35, 34],
        [cx - 65, cy + 10, 32], [cx + 65, cy + 10, 32],
        [cx - 40, cy - 65, 30], [cx + 40, cy - 65, 30],
        [cx, cy - 75, 32], [cx, cy + 50, 42]
      ];
      for (const [px, py, pr] of puffs) {
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Sheep Face
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 10, 48, 52, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#fed7aa';
      ctx.stroke();

      // Cheeks (blush)
      ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
      ctx.beginPath(); ctx.arc(cx - 28, cy, 12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 28, cy, 12, 0, Math.PI * 2); ctx.fill();

      // Sheep Ears
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath(); ctx.ellipse(cx - 52, cy - 12, 22, 10, -0.25, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 52, cy - 12, 22, 10, 0.25, 0, Math.PI * 2); ctx.fill();

      // Cute Eyes (blinking/smiling happy arcs)
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx - 18, cy - 18, 10, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 18, cy - 18, 10, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();

      // Nose & Mouth
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath(); ctx.ellipse(cx, cy + 2, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - 5, cy + 12, 6, 0.1 * Math.PI, 0.8 * Math.PI);
      ctx.arc(cx + 5, cy + 12, 6, 0.2 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Tailor Thimble Hat on head
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.roundRect(cx - 16, cy - 85, 32, 28, [6, 6, 2, 2]);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Hat band
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(cx - 16, cy - 65, 32, 6);

      // Yellow Measuring Tape around neck
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(cx, cy + 38, 38, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      // Tape tick marks
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      for (let a = 0.2 * Math.PI; a <= 0.8 * Math.PI; a += 0.1 * Math.PI) {
        const tx = cx + Math.cos(a) * 38;
        const ty = cy + 38 + Math.sin(a) * 38;
        ctx.beginPath(); ctx.moveTo(tx - 3, ty - 3); ctx.lineTo(tx + 3, ty + 3); ctx.stroke();
      }

      ctx.restore();
    }, 256);

    // 2. Bạn Sóc Phụ Kiện (Squirrel Accessories)
    const squirrelAcc = createIcon((ctx, S) => {
      ctx.save();
      const cx = S / 2, cy = S / 2;

      // Soft circular backdrop glow
      const grad = ctx.createRadialGradient(cx, cy, S * 0.1, cx, cy, S * 0.48);
      grad.addColorStop(0, '#fffbeb');
      grad.addColorStop(1, '#fef3c7');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, S * 0.46, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#fde68a';
      ctx.stroke();

      // Big fluffy bushy squirrel tail in background
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(cx + 60, cy - 20, 42, 68, 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 4;
      ctx.stroke();
      // Tail inner swirl
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.ellipse(cx + 56, cy - 18, 24, 46, 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Squirrel Head & Body
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy, 48, 52, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c2410c';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Cheeks (chubby cream patches)
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath(); ctx.arc(cx - 30, cy + 6, 22, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 10, cy + 6, 22, 0, Math.PI * 2); ctx.fill();

      // Squirrel Ears
      ctx.fillStyle = '#ea580c';
      ctx.beginPath(); ctx.ellipse(cx - 36, cy - 46, 16, 22, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 16, cy - 46, 16, 22, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fecdd3';
      ctx.beginPath(); ctx.ellipse(cx - 36, cy - 46, 9, 14, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 16, cy - 46, 9, 14, 0.2, 0, Math.PI * 2); ctx.fill();

      // Big Sparkling Cartoon Eyes
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.arc(cx - 22, cy - 8, 9, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 2, cy - 8, 9, 0, Math.PI * 2); ctx.fill();
      // Eye highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx - 24, cy - 11, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy - 11, 3.5, 0, Math.PI * 2); ctx.fill();

      // Nose & Smiling Mouth
      ctx.fillStyle = '#431407';
      ctx.beginPath(); ctx.arc(cx - 10, cy + 4, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#431407'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx - 15, cy + 12, 6, 0.1 * Math.PI, 0.8 * Math.PI);
      ctx.arc(cx - 5, cy + 12, 6, 0.2 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Cute Straw Sunhat with Daisy flower
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy - 48, 48, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Daisy
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + 22 + Math.cos(a) * 9, cy - 50 + Math.sin(a) * 9, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(cx + 22, cy - 50, 5, 0, Math.PI * 2); ctx.fill();

      // Ribbon accessory in paws
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy + 42, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }, 256);

    // 3. Outfit Card: Đi Câu Vui Vẻ (Fishing Fun Outfit Icon)
    const outfitFishing = createIcon((ctx, S) => {
      ctx.save();
      const cx = S / 2, cy = S / 2;

      // Soft rounded card background
      const grad = ctx.createRadialGradient(cx, cy, S * 0.1, cx, cy, S * 0.48);
      grad.addColorStop(0, '#e0f2fe');
      grad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, S * 0.46, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = '#38bdf8'; ctx.stroke();

      // Chibi girl sailor body
      // Head
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath(); ctx.arc(cx, cy - 35, 42, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fed7aa'; ctx.lineWidth = 3; ctx.stroke();

      // Ponytails / hair (dark brown cute twin tails)
      ctx.fillStyle = '#451a03';
      ctx.beginPath(); ctx.ellipse(cx - 44, cy - 30, 14, 28, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 44, cy - 30, 14, 28, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy - 55, 40, 26, 0, Math.PI, Math.PI * 2); ctx.fill();
      // Bangs
      ctx.beginPath(); ctx.ellipse(cx - 18, cy - 50, 18, 16, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 18, cy - 50, 18, 16, -0.2, 0, Math.PI * 2); ctx.fill();

      // Fisherman Yellow Bucket Hat
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 60, 48, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#eab308'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(cx - 26, cy - 88, 52, 32, [14, 14, 4, 4]);
      ctx.fill(); ctx.stroke();
      // Little Fish badge on hat
      ctx.fillStyle = '#0284c7';
      ctx.beginPath(); ctx.ellipse(cx, cy - 74, 9, 5, 0, 0, Math.PI * 2); ctx.fill();

      // Eyes & Smile
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.arc(cx - 15, cy - 35, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 15, cy - 35, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx - 17, cy - 37, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 13, cy - 37, 2.5, 0, Math.PI * 2); ctx.fill();
      // Blush
      ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.beginPath(); ctx.arc(cx - 22, cy - 25, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 22, cy - 25, 8, 0, Math.PI * 2); ctx.fill();
      // Smile
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy - 23, 7, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();

      // Sailor Dress / Stripes
      ctx.fillStyle = '#0284c7'; // ocean blue
      ctx.beginPath();
      ctx.roundRect(cx - 32, cy + 8, 64, 55, [8, 8, 12, 12]);
      ctx.fill();
      // Yellow sailor collar
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(cx - 26, cy + 8);
      ctx.lineTo(cx, cy + 28);
      ctx.lineTo(cx + 26, cy + 8);
      ctx.closePath();
      ctx.fill();
      // Sailor red bow
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath(); ctx.arc(cx, cy + 24, 6, 0, Math.PI * 2); ctx.fill();

      // Tackle Bag Pouch cross-body
      ctx.fillStyle = '#b45309';
      ctx.beginPath(); ctx.roundRect(cx + 16, cy + 34, 18, 16, 4); ctx.fill();
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2; ctx.stroke();

      // Shoes
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.ellipse(cx - 14, cy + 76, 12, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 14, cy + 76, 12, 7, 0, 0, Math.PI * 2); ctx.fill();

      ctx.restore();
    }, 256);

    // 4. Outfit Card: Mây Cầu Vồng (Rainbow Cloud Outfit Icon)
    const outfitCloud = createIcon((ctx, S) => {
      ctx.save();
      const cx = S / 2, cy = S / 2;

      // Soft rounded card background with pastel rainbow gradient
      const grad = ctx.createRadialGradient(cx, cy, S * 0.1, cx, cy, S * 0.48);
      grad.addColorStop(0, '#fdf2f8');
      grad.addColorStop(1, '#fce7f3');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, S * 0.46, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = '#f472b6'; ctx.stroke();

      // Fluffy Cloud Fairy Wings behind
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx - 48, cy + 10, 28, 42, -0.4, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 48, cy + 10, 28, 42, 0.4, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Head
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath(); ctx.arc(cx, cy - 35, 42, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fed7aa'; ctx.lineWidth = 3; ctx.stroke();

      // Lavender fairy hair
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath(); ctx.ellipse(cx - 44, cy - 25, 14, 34, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 44, cy - 25, 14, 34, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy - 54, 40, 26, 0, Math.PI, Math.PI * 2); ctx.fill();

      // Golden Star Tiara / Headband
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.arc(cx, cy - 42, 38, 1.1 * Math.PI, 1.9 * Math.PI); ctx.stroke();
      // Star in center
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const tx = cx + Math.cos(a) * 11;
        const ty = cy - 68 + Math.sin(a) * 11;
        if (i === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
      }
      ctx.closePath();
      ctx.fill();

      // Face features
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.arc(cx - 15, cy - 35, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 15, cy - 35, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx - 17, cy - 37, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 13, cy - 37, 2.5, 0, Math.PI * 2); ctx.fill();
      // Sparkly star blush
      ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.beginPath(); ctx.arc(cx - 22, cy - 25, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 22, cy - 25, 8, 0, Math.PI * 2); ctx.fill();
      // Smile
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy - 23, 7, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();

      // Cloud Gown (Puffy cloud dress)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(cx - 30, cy + 8, 60, 56, [14, 14, 18, 18]);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 3; ctx.stroke();

      // Pastel Rainbow Hem
      const colors = ['#f43f5e', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#a855f7'];
      const barW = 54 / colors.length;
      for (let i = 0; i < colors.length; i++) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(cx - 27 + i * barW, cy + 54, barW, 6);
      }

      // Shoes
      ctx.fillStyle = '#ec4899';
      ctx.beginPath(); ctx.ellipse(cx - 14, cy + 74, 11, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 14, cy + 74, 11, 7, 0, 0, Math.PI * 2); ctx.fill();

      ctx.restore();
    }, 256);

    return {
      npc_sheep_tailor: sheepTailor,
      npc_squirrel_accessories: squirrelAcc,
      outfit_fishing_fun: outfitFishing,
      outfit_rainbow_cloud: outfitCloud
    };
  });

  for (const [name, b64Data] of Object.entries(generated)) {
    const filePath = path.join(outDir, `${name}.png`);
    fs.writeFileSync(filePath, Buffer.from(b64Data.replace(/^data:image\/png;base64,/, ''), 'base64'));
    console.log('Saved:', filePath, fs.statSync(filePath).size, 'bytes');
  }

  await browser.close();
})();
