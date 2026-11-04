import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BRAIN_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
const OUT_DIR = path.resolve('assets/monsters/map3');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const sources = {
  idleSprout: path.join(BRAIN_DIR, 'mon_crystal_sprout_idle_1793506606808.jpg'),
  idleMoth: path.join(BRAIN_DIR, 'mon_crystal_moth_idle_1793506623876.jpg'),
  idleBat: path.join(BRAIN_DIR, 'mon_crystal_bat_idle_1793506639869.jpg'),
  idleDragon: path.join(BRAIN_DIR, 'boss_crystal_dragon_idle_1793506657280.jpg'),
  attacks: path.join(BRAIN_DIR, 'crystal_monsters_attacks_1793506871511.jpg'),
  defenses: path.join(BRAIN_DIR, 'crystal_monsters_defenses_1793506889049.jpg'),
  vfx: path.join(BRAIN_DIR, 'crystal_projectiles_and_impacts_1793506904462.jpg')
};

console.log('Launching browser to process Map 3 Crystal Monsters...');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const imagesB64 = {};
for (const [key, filePath] of Object.entries(sources)) {
  imagesB64[key] = fs.readFileSync(filePath).toString('base64');
}

const result = await page.evaluate(async ({ imagesB64 }) => {
  // Helper to load image
  function loadImage(b64) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = 'data:image/jpeg;base64,' + b64;
    });
  }

  // Flood fill remove white background
  function removeBackground(ctx, w, h, threshold = 230) {
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    const visited = new Uint8Array(w * h);
    const queue = [];

    // Push border pixels
    for (let x = 0; x < w; x++) {
      queue.push(x, 0);
      queue.push(x, h - 1);
      visited[x] = 1;
      visited[(h - 1) * w + x] = 1;
    }
    for (let y = 0; y < h; y++) {
      queue.push(0, y);
      queue.push(w - 1, y);
      visited[y * w] = 1;
      visited[y * w + (w - 1)] = 1;
    }

    let head = 0;
    while (head < queue.length) {
      const qx = queue[head++];
      const qy = queue[head++];
      const idx = (qy * w + qx) * 4;
      const r = d[idx], g = d[idx + 1], b = d[idx + 2];

      const isWhite = (r >= threshold && g >= threshold && b >= threshold) ||
                      (r >= threshold - 15 && g >= threshold - 15 && b >= threshold - 15 &&
                       Math.abs(r - g) < 20 && Math.abs(g - b) < 20);

      if (isWhite) {
        const brightness = (r + g + b) / 3;
        if (brightness >= 246) {
          d[idx + 3] = 0;
        } else {
          const factor = (246 - brightness) / 16;
          d[idx + 3] = Math.max(0, Math.min(255, Math.round(factor * 255)));
        }

        const neighbors = [
          [qx + 1, qy], [qx - 1, qy],
          [qx, qy + 1], [qx, qy - 1]
        ];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nIdx = ny * w + nx;
            if (!visited[nIdx]) {
              visited[nIdx] = 1;
              queue.push(nx, ny);
            }
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // Find non-transparent bounding box
  function getBoundingBox(ctx, w, h) {
    const data = ctx.getImageData(0, 0, w, h).data;
    let minX = w, maxX = 0, minY = h, maxY = 0;
    let count = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const a = data[(y * w + x) * 4 + 3];
        if (a > 20) {
          count++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (count === 0) return { minX: 0, maxX: w, minY: 0, maxY: h, width: w, height: h };
    return { minX, maxX, minY, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
  }

  // Load all images
  const loaded = {};
  for (const [k, b64] of Object.entries(imagesB64)) {
    loaded[k] = await loadImage(b64);
  }

  // Helper to extract a region and make transparent
  function extractRegion(img, sx, sy, sw, sh, targetSize = 256, padding = 16) {
    const temp = document.createElement('canvas');
    temp.width = sw;
    temp.height = sh;
    const tCtx = temp.getContext('2d');
    tCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    removeBackground(tCtx, sw, sh, 225);

    const bb = getBoundingBox(tCtx, sw, sh);

    const out = document.createElement('canvas');
    out.width = targetSize;
    out.height = targetSize;
    const outCtx = out.getContext('2d');

    const maxContentDim = targetSize - (padding * 2);
    const scale = Math.min(maxContentDim / bb.width, maxContentDim / bb.height);
    const dw = Math.round(bb.width * scale);
    const dh = Math.round(bb.height * scale);
    const dx = Math.round((targetSize - dw) / 2);
    const dy = Math.round((targetSize - dh) / 2);

    outCtx.drawImage(temp, bb.minX, bb.minY, bb.width, bb.height, dx, dy, dw, dh);
    return out;
  }

  // Generate walk sheet (8 frames) from a base canvas
  function createWalkSheet(baseCanvas, isFlying = false, targetSize = 256) {
    const sheet = document.createElement('canvas');
    sheet.width = targetSize * 8;
    sheet.height = targetSize;
    const sCtx = sheet.getContext('2d');

    // 8 frame variations
    for (let i = 0; i < 8; i++) {
      const fx = i * targetSize;
      sCtx.save();
      sCtx.translate(fx + targetSize / 2, targetSize / 2);

      let dy = 0;
      let rot = 0;
      let sx = 1.0;
      let sy = 1.0;

      if (isFlying) {
        // Floating harmonic oscillation + subtle wing flap scale
        const angle = (i / 8) * Math.PI * 2;
        dy = Math.sin(angle) * (targetSize * 0.04);
        rot = Math.cos(angle) * 0.05;
        sx = 1.0 + Math.sin(angle * 2) * 0.05;
        sy = 1.0 - Math.sin(angle * 2) * 0.04;
      } else {
        // Bipedal/golem cute walking waddle
        const step = i % 4;
        if (step === 0) { // Neutral contact
          dy = 0;
          rot = 0;
        } else if (step === 1) { // Foot down squash
          dy = targetSize * 0.015;
          sx = 1.03;
          sy = 0.97;
          rot = (i < 4 ? -0.04 : 0.04);
        } else if (step === 2) { // Push off
          dy = -targetSize * 0.02;
          sx = 0.98;
          sy = 1.02;
          rot = (i < 4 ? -0.06 : 0.06);
        } else if (step === 3) { // Pass / high point
          dy = -targetSize * 0.035;
          rot = (i < 4 ? -0.02 : 0.02);
        }
      }

      sCtx.translate(0, dy);
      sCtx.rotate(rot);
      sCtx.scale(sx, sy);
      sCtx.drawImage(baseCanvas, -targetSize / 2, -targetSize / 2);
      sCtx.restore();
    }
    return sheet;
  }

  // Generate boss idle sheet (4 frames)
  function createIdleSheet(baseCanvas, targetSize = 320) {
    const sheet = document.createElement('canvas');
    sheet.width = targetSize * 4;
    sheet.height = targetSize;
    const sCtx = sheet.getContext('2d');
    for (let i = 0; i < 4; i++) {
      const fx = i * targetSize;
      const angle = (i / 4) * Math.PI * 2;
      const dy = Math.sin(angle) * 6;
      const sy = 1.0 + Math.cos(angle) * 0.025;
      const sx = 1.0 - Math.cos(angle) * 0.015;
      sCtx.save();
      sCtx.translate(fx + targetSize / 2, targetSize / 2 + dy);
      sCtx.scale(sx, sy);
      sCtx.drawImage(baseCanvas, -targetSize / 2, -targetSize / 2);
      sCtx.restore();
    }
    return sheet;
  }

  // Generate boss skill sheet (8 frames)
  function createSkillSheet(idleCanvas, attackCanvas, targetSize = 320) {
    const sheet = document.createElement('canvas');
    sheet.width = targetSize * 8;
    sheet.height = targetSize;
    const sCtx = sheet.getContext('2d');

    // Frames 0-2: Charge up (idle crouch & glow), Frames 3-6: Attack blast forward, Frame 7: Recover
    for (let i = 0; i < 8; i++) {
      const fx = i * targetSize;
      sCtx.save();
      sCtx.translate(fx + targetSize / 2, targetSize / 2);
      if (i < 3) {
        // Charging
        const chargeBack = -i * 8;
        const squash = 1 - (i * 0.03);
        sCtx.translate(chargeBack, i * 4);
        sCtx.scale(squash, squash);
        sCtx.drawImage(idleCanvas, -targetSize / 2, -targetSize / 2);
      } else if (i < 7) {
        // Unleashing attack
        const lungeForward = -((i - 3) * 6) - 15;
        sCtx.translate(lungeForward, 0);
        sCtx.scale(1.04, 1.04);
        sCtx.drawImage(attackCanvas, -targetSize / 2, -targetSize / 2);
      } else {
        // Recovery
        sCtx.drawImage(idleCanvas, -targetSize / 2, -targetSize / 2);
      }
      sCtx.restore();
    }
    return sheet;
  }

  // Helper to create celebration pose with sparkles
  function createCelebrate(baseCanvas, targetSize = 256) {
    const c = document.createElement('canvas');
    c.width = targetSize;
    c.height = targetSize;
    const ctx = c.getContext('2d');
    ctx.save();
    ctx.translate(targetSize / 2, targetSize / 2 - 12);
    ctx.scale(1.05, 1.05);
    ctx.drawImage(baseCanvas, -targetSize / 2, -targetSize / 2);
    ctx.restore();

    // Draw festive little victory sparkles
    ctx.fillStyle = '#fbbf24';
    const sparkles = [
      [30, 40, 8], [targetSize - 35, 45, 10],
      [targetSize / 2 - 40, 20, 6], [targetSize / 2 + 50, 25, 7],
      [20, targetSize / 2, 5], [targetSize - 25, targetSize / 2 + 10, 6]
    ];
    for (const [sx, sy, sr] of sparkles) {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    return c;
  }

  // 1. EXTRACT IDLES
  const sproutIdle = extractRegion(loaded.idleSprout, 0, 0, 1024, 1024, 256, 14);
  const mothIdle = extractRegion(loaded.idleMoth, 0, 0, 1024, 1024, 256, 14);
  const batIdle = extractRegion(loaded.idleBat, 0, 0, 1024, 1024, 256, 14);
  const dragonIdle = extractRegion(loaded.idleDragon, 0, 0, 1024, 1024, 320, 16);

  // 2. EXTRACT ATTACKS (2x2 grid from attacks)
  // Top-left: Sprout, Top-right: Moth, Bottom-left: Bat, Bottom-right: Dragon
  const sproutAttack = extractRegion(loaded.attacks, 0, 0, 512, 512, 256, 14);
  const mothAttack = extractRegion(loaded.attacks, 512, 0, 512, 512, 256, 14);
  const batAttack = extractRegion(loaded.attacks, 0, 512, 512, 512, 256, 14);
  const dragonAttack = extractRegion(loaded.attacks, 512, 512, 512, 512, 320, 16);

  // 3. EXTRACT DEFENSES / HITS (2x2 grid from defenses)
  const sproutHit = extractRegion(loaded.defenses, 0, 0, 512, 512, 256, 14);
  const mothHit = extractRegion(loaded.defenses, 512, 0, 512, 512, 256, 14);
  const batHit = extractRegion(loaded.defenses, 0, 512, 512, 512, 256, 14);
  const dragonHit = extractRegion(loaded.defenses, 512, 512, 512, 512, 320, 16);

  // 4. CELEBRATES
  const sproutCelebrate = createCelebrate(sproutIdle, 256);
  const mothCelebrate = createCelebrate(mothIdle, 256);
  const batCelebrate = createCelebrate(batIdle, 256);
  const dragonCelebrate = createCelebrate(dragonIdle, 320);

  // 5. WALK SHEETS (8-directional motion loops)
  const sproutWalkSheet = createWalkSheet(sproutIdle, false, 256);
  const mothWalkSheet = createWalkSheet(mothIdle, true, 256);
  const batWalkSheet = createWalkSheet(batIdle, true, 256);
  const dragonWalkSheet = createWalkSheet(dragonIdle, true, 320);

  // 6. BOSS SHEETS
  const dragonIdleSheet = createIdleSheet(dragonIdle, 320);
  const dragonSkillSheet = createSkillSheet(dragonIdle, dragonAttack, 320);

  // 7. EXTRACT PROJECTILES & IMPACTS (2x4 grid: Row 0 Proj, Row 1 Impact)
  const sproutProj = extractRegion(loaded.vfx, 0, 0, 256, 512, 128, 8);
  const mothProj = extractRegion(loaded.vfx, 256, 0, 256, 512, 128, 8);
  const batProj = extractRegion(loaded.vfx, 512, 0, 256, 512, 128, 8);
  const dragonProj = extractRegion(loaded.vfx, 768, 0, 256, 512, 160, 10);

  const sproutImpact = extractRegion(loaded.vfx, 0, 512, 256, 512, 256, 12);
  const mothImpact = extractRegion(loaded.vfx, 256, 512, 256, 512, 256, 12);
  const batImpact = extractRegion(loaded.vfx, 512, 512, 256, 512, 256, 12);
  const dragonImpact = extractRegion(loaded.vfx, 768, 512, 256, 512, 320, 14);

  // Package everything into data URLs
  function pack(cvs) {
    return {
      png: cvs.toDataURL('image/png'),
      webp: cvs.toDataURL('image/webp', 0.95)
    };
  }

  return {
    // Sprout
    sprout_idle: pack(sproutIdle),
    sprout_attack: pack(sproutAttack),
    sprout_hit: pack(sproutHit),
    sprout_celebrate: pack(sproutCelebrate),
    sprout_walk_sheet: pack(sproutWalkSheet),
    sprout_proj: pack(sproutProj),
    sprout_impact: pack(sproutImpact),

    // Moth
    moth_idle: pack(mothIdle),
    moth_attack: pack(mothAttack),
    moth_hit: pack(mothHit),
    moth_celebrate: pack(mothCelebrate),
    moth_walk_sheet: pack(mothWalkSheet),
    moth_proj: pack(mothProj),
    moth_impact: pack(mothImpact),

    // Bat
    bat_idle: pack(batIdle),
    bat_attack: pack(batAttack),
    bat_hit: pack(batHit),
    bat_celebrate: pack(batCelebrate),
    bat_walk_sheet: pack(batWalkSheet),
    bat_proj: pack(batProj),
    bat_impact: pack(batImpact),

    // Dragon Boss
    dragon_idle: pack(dragonIdle),
    dragon_attack: pack(dragonAttack),
    dragon_hit: pack(dragonHit),
    dragon_celebrate: pack(dragonCelebrate),
    dragon_walk_sheet: pack(dragonWalkSheet),
    dragon_idle_sheet: pack(dragonIdleSheet),
    dragon_skill_sheet: pack(dragonSkillSheet),
    dragon_proj: pack(dragonProj),
    dragon_impact: pack(dragonImpact)
  };
}, { imagesB64 });

await browser.close();

// Write files to assets/monsters/map3
function writeDataUrl(dataUrl, destPath) {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  fs.writeFileSync(destPath, Buffer.from(base64, 'base64'));
}

// Write Sprout assets
writeDataUrl(result.sprout_idle.png, path.join(OUT_DIR, 'mon_crystal_sprout.png'));
writeDataUrl(result.sprout_idle.png, path.join(OUT_DIR, 'mon_crystal_sprout_idle.png'));
writeDataUrl(result.sprout_idle.webp, path.join(OUT_DIR, 'mon_crystal_sprout_idle.webp'));
writeDataUrl(result.sprout_idle.webp, path.join(OUT_DIR, 'mon_crystal_sprout_walk.webp'));
writeDataUrl(result.sprout_attack.webp, path.join(OUT_DIR, 'mon_crystal_sprout_skill.webp'));
writeDataUrl(result.sprout_attack.webp, path.join(OUT_DIR, 'mon_crystal_sprout_action.webp'));
writeDataUrl(result.sprout_attack.webp, path.join(OUT_DIR, 'mon_crystal_sprout_attack.webp'));
writeDataUrl(result.sprout_hit.webp, path.join(OUT_DIR, 'mon_crystal_sprout_hit.webp'));
writeDataUrl(result.sprout_celebrate.webp, path.join(OUT_DIR, 'mon_crystal_sprout_celebrate.webp'));
writeDataUrl(result.sprout_walk_sheet.png, path.join(OUT_DIR, 'mon_crystal_sprout_walk_sheet.png'));
writeDataUrl(result.sprout_proj.png, path.join(OUT_DIR, 'crystal_sprout_proj.png'));
writeDataUrl(result.sprout_impact.png, path.join(OUT_DIR, 'crystal_sprout_impact.png'));

// Write Moth assets
writeDataUrl(result.moth_idle.png, path.join(OUT_DIR, 'mon_crystal_moth.png'));
writeDataUrl(result.moth_idle.png, path.join(OUT_DIR, 'mon_crystal_moth_idle.png'));
writeDataUrl(result.moth_idle.webp, path.join(OUT_DIR, 'mon_crystal_moth_idle.webp'));
writeDataUrl(result.moth_idle.webp, path.join(OUT_DIR, 'mon_crystal_moth_walk.webp'));
writeDataUrl(result.moth_attack.webp, path.join(OUT_DIR, 'mon_crystal_moth_skill.webp'));
writeDataUrl(result.moth_attack.webp, path.join(OUT_DIR, 'mon_crystal_moth_action.webp'));
writeDataUrl(result.moth_attack.webp, path.join(OUT_DIR, 'mon_crystal_moth_attack.webp'));
writeDataUrl(result.moth_hit.webp, path.join(OUT_DIR, 'mon_crystal_moth_hit.webp'));
writeDataUrl(result.moth_celebrate.webp, path.join(OUT_DIR, 'mon_crystal_moth_celebrate.webp'));
writeDataUrl(result.moth_walk_sheet.png, path.join(OUT_DIR, 'mon_crystal_moth_walk_sheet.png'));
writeDataUrl(result.moth_proj.png, path.join(OUT_DIR, 'crystal_moth_proj.png'));
writeDataUrl(result.moth_impact.png, path.join(OUT_DIR, 'crystal_moth_impact.png'));

// Write Bat assets
writeDataUrl(result.bat_idle.png, path.join(OUT_DIR, 'mon_crystal_bat.png'));
writeDataUrl(result.bat_idle.png, path.join(OUT_DIR, 'mon_crystal_bat_idle.png'));
writeDataUrl(result.bat_idle.webp, path.join(OUT_DIR, 'mon_crystal_bat_idle.webp'));
writeDataUrl(result.bat_idle.webp, path.join(OUT_DIR, 'mon_crystal_bat_walk.webp'));
writeDataUrl(result.bat_attack.webp, path.join(OUT_DIR, 'mon_crystal_bat_skill.webp'));
writeDataUrl(result.bat_attack.webp, path.join(OUT_DIR, 'mon_crystal_bat_action.webp'));
writeDataUrl(result.bat_attack.webp, path.join(OUT_DIR, 'mon_crystal_bat_attack.webp'));
writeDataUrl(result.bat_hit.webp, path.join(OUT_DIR, 'mon_crystal_bat_hit.webp'));
writeDataUrl(result.bat_celebrate.webp, path.join(OUT_DIR, 'mon_crystal_bat_celebrate.webp'));
writeDataUrl(result.bat_walk_sheet.png, path.join(OUT_DIR, 'mon_crystal_bat_walk_sheet.png'));
writeDataUrl(result.bat_proj.png, path.join(OUT_DIR, 'crystal_bat_proj.png'));
writeDataUrl(result.bat_impact.png, path.join(OUT_DIR, 'crystal_bat_impact.png'));

// Write Dragon Boss assets
writeDataUrl(result.dragon_idle.png, path.join(OUT_DIR, 'boss_crystal_dragon.png'));
writeDataUrl(result.dragon_idle.png, path.join(OUT_DIR, 'boss_crystal_dragon_idle.png'));
writeDataUrl(result.dragon_idle.webp, path.join(OUT_DIR, 'boss_crystal_dragon_idle.webp'));
writeDataUrl(result.dragon_idle.webp, path.join(OUT_DIR, 'boss_crystal_dragon_walk.webp'));
writeDataUrl(result.dragon_attack.webp, path.join(OUT_DIR, 'boss_crystal_dragon_skill.webp'));
writeDataUrl(result.dragon_attack.webp, path.join(OUT_DIR, 'boss_crystal_dragon_action.webp'));
writeDataUrl(result.dragon_attack.webp, path.join(OUT_DIR, 'boss_crystal_dragon_attack.webp'));
writeDataUrl(result.dragon_hit.webp, path.join(OUT_DIR, 'boss_crystal_dragon_hit.webp'));
writeDataUrl(result.dragon_celebrate.webp, path.join(OUT_DIR, 'boss_crystal_dragon_celebrate.webp'));
writeDataUrl(result.dragon_walk_sheet.png, path.join(OUT_DIR, 'boss_crystal_dragon_walk_sheet.png'));
writeDataUrl(result.dragon_idle_sheet.png, path.join(OUT_DIR, 'boss_crystal_dragon_idle_sheet.png'));
writeDataUrl(result.dragon_skill_sheet.png, path.join(OUT_DIR, 'boss_crystal_dragon_skill_sheet.png'));
writeDataUrl(result.dragon_proj.png, path.join(OUT_DIR, 'boss_crystal_dragon_proj.png'));
writeDataUrl(result.dragon_impact.png, path.join(OUT_DIR, 'boss_crystal_dragon_impact.png'));

console.log('✅ Successfully generated and saved all Map 3 Crystal Monster assets!');
