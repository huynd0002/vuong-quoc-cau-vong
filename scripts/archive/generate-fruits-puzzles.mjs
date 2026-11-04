import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

const FRUITS = [
  {
    name: 'fruit_watermelon',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="melonFlesh" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ff6b6b" />
            <stop offset="65%" stop-color="#ef4444" />
            <stop offset="100%" stop-color="#b91c1c" />
          </radialGradient>
          <filter id="fruitDrop" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#064e3b" flood-opacity="0.35"/>
          </filter>
        </defs>
        <!-- Outer Green Rind -->
        <path d="M 28 88 C 40 186, 120 226, 228 178 C 220 78, 140 38, 28 88 Z" 
              fill="#15803d" stroke="#065f46" stroke-width="7" filter="url(#fruitDrop)" />
        <!-- Mid White Rind -->
        <path d="M 38 94 C 48 176, 116 212, 218 170 C 210 86, 142 50, 38 94 Z" 
              fill="#dcfce7" />
        <!-- Red Juicy Flesh -->
        <path d="M 48 102 C 58 166, 112 198, 208 162 C 200 96, 142 64, 48 102 Z" 
              fill="url(#melonFlesh)" />
        <!-- Gloss Reflection Highlight -->
        <path d="M 58 108 C 65 140, 95 165, 145 155 C 105 155, 75 130, 68 114 Z" 
              fill="rgba(255,255,255,0.4)" />
        <!-- Black Watermelon Seeds with 3D Shine -->
        <ellipse cx="88" cy="126" rx="5" ry="9" fill="#1e1e1e" transform="rotate(-20 88 126)" />
        <ellipse cx="120" cy="142" rx="5" ry="9" fill="#1e1e1e" transform="rotate(5 120 142)" />
        <ellipse cx="156" cy="132" rx="5" ry="9" fill="#1e1e1e" transform="rotate(25 156 132)" />
        <ellipse cx="115" cy="108" rx="4" ry="7" fill="#1e1e1e" transform="rotate(-5 115 108)" />
        <ellipse cx="168" cy="106" rx="4" ry="7" fill="#1e1e1e" transform="rotate(20 168 106)" />
        <!-- Seed Sparkles -->
        <circle cx="86" cy="123" r="1.5" fill="#ffffff" />
        <circle cx="118" cy="139" r="1.5" fill="#ffffff" />
        <circle cx="154" cy="129" r="1.5" fill="#ffffff" />
        <!-- Top Sweet Sparkle -->
        <polygon points="175,70 178,78 186,81 178,84 175,92 172,84 164,81 172,78" fill="#ffffff" />
      </svg>
    `
  },
  {
    name: 'fruit_apple',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="appleGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#fca5a5" />
            <stop offset="35%" stop-color="#ef4444" />
            <stop offset="85%" stop-color="#dc2626" />
            <stop offset="100%" stop-color="#991b1b" />
          </radialGradient>
          <filter id="appleShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#7f1d1d" flood-opacity="0.4"/>
          </filter>
        </defs>
        <!-- Apple Stem -->
        <path d="M 128 50 C 130 25, 146 18, 156 16 C 150 28, 142 42, 134 56 Z" fill="#78350f" stroke="#451a03" stroke-width="2" />
        <!-- Green Leaf -->
        <path d="M 136 44 C 160 30, 184 34, 186 52 C 164 56, 146 50, 136 44 Z" fill="#22c55e" stroke="#15803d" stroke-width="3" />
        <!-- Apple Body -->
        <path d="M 128 64 
                 C 105 48, 48 55, 42 118 
                 C 36 178, 85 228, 118 228 
                 C 125 228, 126 223, 128 223 
                 C 130 223, 131 228, 138 228 
                 C 171 228, 220 178, 214 118 
                 C 208 55, 151 48, 128 64 Z" 
              fill="url(#appleGrad)" stroke="#991b1b" stroke-width="7" stroke-linejoin="round" filter="url(#appleShadow)" />
        <!-- Gloss Highlight -->
        <ellipse cx="88" cy="98" rx="30" ry="16" fill="rgba(255,255,255,0.75)" transform="rotate(-30 88 98)" />
        <polygon points="76,82 79,90 87,93 79,96 76,104 73,96 65,93 73,90" fill="#ffffff" />
      </svg>
    `
  },
  {
    name: 'fruit_banana',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bananaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="35%" stop-color="#fde047" />
            <stop offset="70%" stop-color="#eab308" />
            <stop offset="100%" stop-color="#ca8a04" />
          </linearGradient>
          <filter id="bananaShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#a16207" flood-opacity="0.4"/>
          </filter>
        </defs>
        <!-- Banana Arc -->
        <path d="M 44 68 
                 C 90 32, 178 52, 212 142 
                 C 226 178, 216 210, 206 214 
                 C 198 210, 186 176, 158 132 
                 C 126 84, 76 68, 44 68 Z" 
              fill="url(#bananaGrad)" stroke="#a16207" stroke-width="7" stroke-linejoin="round" filter="url(#bananaShadow)"/>
        <!-- Banana Stem Green Tip -->
        <path d="M 44 68 C 36 65, 30 55, 32 46 C 38 48, 46 54, 48 64 Z" fill="#65a30d" stroke="#3f6212" stroke-width="3" />
        <!-- Bottom brown tip -->
        <circle cx="206" cy="214" r="5" fill="#78350f" />
        <!-- Highlight Strip -->
        <path d="M 68 66 C 114 62, 168 96, 188 152" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="7" stroke-linecap="round" />
      </svg>
    `
  },
  {
    name: 'fruit_strawberry',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="strawGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#fca5a5" />
            <stop offset="40%" stop-color="#ef4444" />
            <stop offset="85%" stop-color="#dc2626" />
            <stop offset="100%" stop-color="#991b1b" />
          </radialGradient>
          <filter id="strawShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#991b1b" flood-opacity="0.4"/>
          </filter>
        </defs>
        <!-- Strawberry Body -->
        <path d="M 128 228 
                 C 90 200, 42 148, 48 98 
                 C 54 58, 96 54, 128 62 
                 C 160 54, 202 58, 208 98 
                 C 214 148, 166 200, 128 228 Z" 
              fill="url(#strawGrad)" stroke="#991b1b" stroke-width="7" stroke-linejoin="round" filter="url(#strawShadow)" />
        <!-- Golden Seeds -->
        <circle cx="90" cy="100" r="3" fill="#fef08a" />
        <circle cx="128" cy="115" r="3" fill="#fef08a" />
        <circle cx="166" cy="100" r="3" fill="#fef08a" />
        <circle cx="106" cy="145" r="3" fill="#fef08a" />
        <circle cx="150" cy="145" r="3" fill="#fef08a" />
        <circle cx="128" cy="180" r="3" fill="#fef08a" />
        <!-- Top Green Leaves -->
        <path d="M 128 32 C 122 48, 102 58, 82 50 C 98 62, 110 74, 128 72 C 146 74, 158 62, 174 50 C 154 58, 134 48, 128 32 Z" 
              fill="#22c55e" stroke="#15803d" stroke-width="4" stroke-linejoin="round" />
        <ellipse cx="85" cy="85" rx="18" ry="10" fill="rgba(255,255,255,0.7)" transform="rotate(-30 85 85)" />
      </svg>
    `
  },
  {
    name: 'fruit_orange',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="orangeGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#fdba74" />
            <stop offset="40%" stop-color="#fb923c" />
            <stop offset="85%" stop-color="#f97316" />
            <stop offset="100%" stop-color="#c2410c" />
          </radialGradient>
          <filter id="orangeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#9a3412" flood-opacity="0.4"/>
          </filter>
        </defs>
        <!-- Leaf & Stem -->
        <path d="M 128 42 C 148 24, 172 28, 176 46 C 154 48, 138 44, 128 42 Z" fill="#22c55e" stroke="#15803d" stroke-width="3" />
        <circle cx="128" cy="46" r="4" fill="#78350f" />
        <!-- Orange Sphere -->
        <circle cx="128" cy="136" r="88" fill="url(#orangeGrad)" stroke="#c2410c" stroke-width="7" filter="url(#orangeShadow)" />
        <!-- Peel texture & gloss -->
        <ellipse cx="98" cy="95" rx="35" ry="18" fill="rgba(255,255,255,0.7)" transform="rotate(-30 98 95)" />
        <polygon points="85,80 88,88 96,91 88,94 85,102 82,94 74,91 82,88" fill="#ffffff" />
      </svg>
    `
  }
];

// Mảnh ghép đố vui (Puzzles & Jigsaw Matching)
const PUZZLES = [
  {
    name: 'jigsaw_watermelon_left',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="jigMelon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff7675" />
            <stop offset="100%" stop-color="#d63031" />
          </linearGradient>
        </defs>
        <!-- Nửa quả dưa hấu bên TRÁI có chốt ghép lồi ra -->
        <path d="M 128 40 
                 C 68 40, 24 88, 24 148 
                 C 24 200, 64 240, 116 248 
                 L 128 248 
                 L 128 170 
                 C 145 170, 155 158, 155 144 
                 C 155 130, 145 118, 128 118 
                 L 128 40 Z" 
              fill="url(#jigMelon)" stroke="#00b894" stroke-width="8" stroke-linejoin="round" />
        <ellipse cx="75" cy="140" rx="4" ry="8" fill="#2d3436" transform="rotate(-15 75 140)" />
        <ellipse cx="95" cy="180" rx="4" ry="8" fill="#2d3436" transform="rotate(10 95 180)" />
        <ellipse cx="65" cy="95" rx="20" ry="10" fill="rgba(255,255,255,0.6)" transform="rotate(-30 65 95)" />
        <text x="50" y="225" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Nửa Trái</text>
      </svg>
    `
  },
  {
    name: 'jigsaw_watermelon_right',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="jigMelonR" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff7675" />
            <stop offset="100%" stop-color="#d63031" />
          </linearGradient>
        </defs>
        <!-- Nửa quả dưa hấu bên PHẢI có lỗ khuyết vừa vặn (Khớp hoàn hảo!) -->
        <path d="M 128 40 
                 C 188 40, 232 88, 232 148 
                 C 232 200, 192 240, 140 248 
                 L 128 248 
                 L 128 170 
                 C 145 170, 155 158, 155 144 
                 C 155 130, 145 118, 128 118 
                 L 128 40 Z" 
              fill="url(#jigMelonR)" stroke="#00b894" stroke-width="8" stroke-linejoin="round" />
        <ellipse cx="180" cy="140" rx="4" ry="8" fill="#2d3436" transform="rotate(15 180 140)" />
        <ellipse cx="160" cy="180" rx="4" ry="8" fill="#2d3436" transform="rotate(-10 160 180)" />
        <ellipse cx="190" cy="95" rx="20" ry="10" fill="rgba(255,255,255,0.6)" transform="rotate(30 190 95)" />
        <text x="145" y="225" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Mảnh Khớp ✨</text>
      </svg>
    `
  },
  {
    name: 'jigsaw_apple_right',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="jigApple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fca5a5" />
            <stop offset="100%" stop-color="#b91c1c" />
          </linearGradient>
        </defs>
        <!-- Nửa quả táo hình tròn dẹt (Mảnh sai) -->
        <path d="M 128 60 
                 C 185 60, 220 95, 214 150 
                 C 208 200, 165 230, 128 230 
                 L 128 180 
                 C 110 180, 100 168, 100 154 
                 C 100 140, 110 128, 128 128 
                 L 128 60 Z" 
              fill="url(#jigApple)" stroke="#7f1d1d" stroke-width="7" stroke-linejoin="round" />
        <text x="140" y="215" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Mảnh Táo ❌</text>
      </svg>
    `
  },
  {
    name: 'jigsaw_orange_right',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="jigOrange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fed7aa" />
            <stop offset="100%" stop-color="#ea580c" />
          </linearGradient>
        </defs>
        <!-- Nửa quả cam vàng múi (Mảnh sai) -->
        <path d="M 128 50 
                 C 195 50, 235 95, 230 160 
                 C 225 210, 175 240, 128 240 
                 L 128 160 L 115 145 L 128 130 L 128 50 Z" 
              fill="url(#jigOrange)" stroke="#c2410c" stroke-width="7" stroke-linejoin="round" />
        <text x="140" y="225" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Mảnh Cam ❌</text>
      </svg>
    `
  },
  {
    name: 'pair_dog',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="90" fill="#fde68a" stroke="#d97706" stroke-width="8"/>
        <!-- Cute Dog Face -->
        <ellipse cx="80" cy="85" rx="20" ry="38" fill="#b45309" transform="rotate(-20 80 85)" />
        <ellipse cx="176" cy="85" rx="20" ry="38" fill="#b45309" transform="rotate(20 176 85)" />
        <circle cx="98" cy="122" r="10" fill="#1e293b" />
        <circle cx="158" cy="122" r="10" fill="#1e293b" />
        <circle cx="95" cy="119" r="3" fill="#ffffff" />
        <circle cx="155" cy="119" r="3" fill="#ffffff" />
        <ellipse cx="128" cy="144" rx="14" ry="10" fill="#78350f" />
        <path d="M 120 154 C 124 162, 132 162, 136 154" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `
  },
  {
    name: 'pair_bone',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="boneShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#64748b" flood-opacity="0.35"/>
          </filter>
        </defs>
        <!-- Dog Bone -->
        <g transform="translate(18, 20)" filter="url(#boneShadow)">
          <circle cx="50" cy="80" r="24" fill="#f8fafc" stroke="#94a3b8" stroke-width="6"/>
          <circle cx="50" cy="120" r="24" fill="#f8fafc" stroke="#94a3b8" stroke-width="6"/>
          <rect x="50" y="85" width="120" height="30" rx="15" ry="15" fill="#f8fafc" stroke="#94a3b8" stroke-width="6"/>
          <circle cx="170" cy="80" r="24" fill="#f8fafc" stroke="#94a3b8" stroke-width="6"/>
          <circle cx="170" cy="120" r="24" fill="#f8fafc" stroke="#94a3b8" stroke-width="6"/>
        </g>
      </svg>
    `
  },
  {
    name: 'pair_pan',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <circle cx="110" cy="130" r="75" fill="#475569" stroke="#1e293b" stroke-width="8"/>
        <circle cx="110" cy="130" r="58" fill="#334155" />
        <!-- Handle -->
        <rect x="175" y="118" width="65" height="24" rx="12" ry="12" fill="#d97706" stroke="#92400e" stroke-width="6"/>
        <ellipse cx="90" cy="105" rx="30" ry="15" fill="rgba(255,255,255,0.3)" transform="rotate(-20 90 105)"/>
      </svg>
    `
  },
  {
    name: 'pair_spatula',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(35 128 128)">
          <rect x="70" y="40" width="60" height="75" rx="14" ry="14" fill="#3b82f6" stroke="#1d4ed8" stroke-width="6"/>
          <rect x="92" y="110" width="16" height="110" rx="8" ry="8" fill="#d97706" stroke="#92400e" stroke-width="6"/>
          <line x1="85" y1="55" x2="85" y2="95" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
          <line x1="100" y1="55" x2="100" y2="95" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
          <line x1="115" y1="55" x2="115" y2="95" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
        </g>
      </svg>
    `
  }
];

(async () => {
  console.log('Rendering Fruits & Puzzles with Playwright...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 256, height: 256 });

  // 1. Render Fruits (Color + Silhouette Shadow)
  for (const item of FRUITS) {
    // Normal color
    const htmlColor = `
      <!DOCTYPE html>
      <html>
        <head><style>html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; width: 256px; height: 256px; display: flex; align-items: center; justify-content: center; }</style></head>
        <body>${item.svg}</body>
      </html>
    `;
    await page.setContent(htmlColor);
    const destColor = path.join(root, `assets/edu/fruits/${item.name}.png`);
    await page.screenshot({ path: destColor, omitBackground: true });
    console.log(`Rendered: ${destColor}`);

    // Silhouette Shadow (for shadow matching questions)
    const svgShadow = item.svg
      .replace(/fill="url\(#[^"]+\)"/g, 'fill="#1e293b"')
      .replace(/fill="#[0-9a-fA-F]{6}"/g, 'fill="#1e293b"')
      .replace(/fill="rgba\([^"]+\)"/g, 'fill="none"')
      .replace(/stroke="#[0-9a-fA-F]{6}"/g, 'stroke="#0f172a"');
    const htmlShadow = `
      <!DOCTYPE html>
      <html>
        <head><style>html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; width: 256px; height: 256px; display: flex; align-items: center; justify-content: center; }</style></head>
        <body>${svgShadow}</body>
      </html>
    `;
    await page.setContent(htmlShadow);
    const destShadow = path.join(root, `assets/edu/fruits/${item.name}_shadow.png`);
    await page.screenshot({ path: destShadow, omitBackground: true });
    console.log(`Rendered Shadow: ${destShadow}`);
  }

  // 2. Render Puzzles
  for (const p of PUZZLES) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head><style>html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; width: 256px; height: 256px; display: flex; align-items: center; justify-content: center; }</style></head>
        <body>${p.svg}</body>
      </html>
    `;
    await page.setContent(html);
    const dest = path.join(root, `assets/edu/puzzles/${p.name}.png`);
    await page.screenshot({ path: dest, omitBackground: true });
    console.log(`Rendered Puzzle: ${dest}`);
  }

  await browser.close();
  console.log('All Fruits & Puzzles rendered successfully!');
})();
