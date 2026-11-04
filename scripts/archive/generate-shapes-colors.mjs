import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

const SHAPES = [
  {
    name: 'shape_triangle',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="triGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fde047" />
            <stop offset="40%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#d97706" />
          </linearGradient>
          <filter id="triGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#b45309" flood-opacity="0.45"/>
          </filter>
        </defs>
        <!-- Triangle Body -->
        <path d="M 128 32 L 226 206 C 232 216 224 228 212 228 L 44 228 C 32 228 24 216 30 206 Z" 
              fill="url(#triGrad)" stroke="#b45309" stroke-width="8" stroke-linejoin="round" filter="url(#triGlow)"/>
        <!-- 3D Top Bevel Highlight -->
        <path d="M 128 46 L 210 200 C 213 205 208 214 200 214 L 56 214 C 48 214 43 205 46 200 Z" 
              fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="5" stroke-linejoin="round"/>
        <!-- Glossy Specular Bubble -->
        <ellipse cx="128" cy="85" rx="35" ry="18" fill="rgba(255,255,255,0.7)" transform="rotate(-8 128 85)"/>
        <!-- Cute Sparkle -->
        <polygon points="128,45 132,58 145,62 132,66 128,79 124,66 111,62 124,58" fill="#ffffff" />
      </svg>
    `
  },
  {
    name: 'shape_circle',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="circGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#f87171" />
            <stop offset="50%" stop-color="#ef4444" />
            <stop offset="90%" stop-color="#dc2626" />
            <stop offset="100%" stop-color="#991b1b" />
          </radialGradient>
          <filter id="circGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#991b1b" flood-opacity="0.45"/>
          </filter>
        </defs>
        <circle cx="128" cy="128" r="96" fill="url(#circGrad)" stroke="#991b1b" stroke-width="8" filter="url(#circGlow)" />
        <ellipse cx="98" cy="82" rx="42" ry="24" fill="rgba(255,255,255,0.75)" transform="rotate(-30 98 82)" />
        <circle cx="165" cy="165" r="14" fill="rgba(255,255,255,0.35)" />
        <polygon points="85,60 89,70 99,74 89,78 85,88 81,78 71,74 81,70" fill="#ffffff" />
      </svg>
    `
  },
  {
    name: 'shape_square',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sqGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#6ee7b7" />
            <stop offset="40%" stop-color="#10b981" />
            <stop offset="100%" stop-color="#047857" />
          </linearGradient>
          <filter id="sqGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#065f46" flood-opacity="0.45"/>
          </filter>
        </defs>
        <rect x="36" y="36" width="184" height="184" rx="36" ry="36" 
              fill="url(#sqGrad)" stroke="#065f46" stroke-width="8" filter="url(#sqGlow)" />
        <rect x="46" y="46" width="164" height="164" rx="28" ry="28" 
              fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="5" />
        <ellipse cx="100" cy="72" rx="45" ry="18" fill="rgba(255,255,255,0.7)" transform="rotate(-10 100 72)" />
        <polygon points="175,70 178,79 187,82 178,85 175,94 172,85 163,82 172,79" fill="#ffffff" />
      </svg>
    `
  },
  {
    name: 'shape_star',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="starGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="45%" stop-color="#facc15" />
            <stop offset="100%" stop-color="#ca8a04" />
          </linearGradient>
          <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#a16207" flood-opacity="0.45"/>
          </filter>
        </defs>
        <!-- 5-Pointed Rounded Star -->
        <path d="M 128 24 
                 C 131 24, 134 26, 137 32 L 160 84 C 162 88, 166 91, 171 92 L 227 98 C 234 99, 238 103, 237 109 C 236 113, 233 116, 229 119 L 187 158 C 183 162, 181 166, 182 171 L 193 227 C 195 234, 191 239, 185 240 C 181 240, 177 238, 173 235 L 128 207 C 124 205, 120 205, 116 207 L 71 235 C 65 239, 58 236, 56 229 C 55 226, 56 222, 57 218 L 68 162 C 69 157, 67 152, 63 149 L 21 110 C 15 105, 16 98, 22 95 C 25 94, 29 93, 33 93 L 89 87 C 94 86, 98 83, 100 78 L 123 27 C 125 24, 127 24, 128 24 Z" 
              fill="url(#starGrad)" stroke="#a16207" stroke-width="7" stroke-linejoin="round" filter="url(#starGlow)"/>
        <!-- Star highlight -->
        <ellipse cx="120" cy="78" rx="28" ry="14" fill="rgba(255,255,255,0.75)" transform="rotate(-15 120 78)"/>
        <polygon points="128,35 131,43 140,46 131,49 128,57 125,49 116,46 125,43" fill="#ffffff" />
      </svg>
    `
  },
  {
    name: 'shape_heart',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="heartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f472b6" />
            <stop offset="45%" stop-color="#ec4899" />
            <stop offset="100%" stop-color="#be185d" />
          </linearGradient>
          <filter id="heartGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#9d174d" flood-opacity="0.45"/>
          </filter>
        </defs>
        <path d="M 128 220 
                 C 120 212, 32 152, 32 88 
                 C 32 50, 62 24, 98 24 
                 C 118 24, 136 34, 128 50 
                 C 120 34, 138 24, 158 24 
                 C 194 24, 224 50, 224 88 
                 C 224 152, 136 212, 128 220 Z" 
              fill="url(#heartGrad)" stroke="#9d174d" stroke-width="8" stroke-linejoin="round" filter="url(#heartGlow)"/>
        <ellipse cx="80" cy="68" rx="30" ry="16" fill="rgba(255,255,255,0.7)" transform="rotate(-25 80 68)"/>
        <polygon points="175,60 178,69 187,72 178,75 175,84 172,75 163,72 172,69" fill="#ffffff" />
      </svg>
    `
  },
  {
    name: 'shape_rectangle',
    svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rectGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#60a5fa" />
            <stop offset="45%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#1d4ed8" />
          </linearGradient>
          <filter id="rectGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#1e40af" flood-opacity="0.45"/>
          </filter>
        </defs>
        <rect x="24" y="60" width="208" height="136" rx="28" ry="28" 
              fill="url(#rectGrad)" stroke="#1e40af" stroke-width="8" filter="url(#rectGlow)"/>
        <rect x="34" y="70" width="188" height="116" rx="20" ry="20" 
              fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="5" />
        <ellipse cx="90" cy="95" rx="55" ry="15" fill="rgba(255,255,255,0.7)" transform="rotate(-6 90 95)"/>
        <polygon points="190,95 193,103 201,106 193,109 190,117 187,109 179,106 187,103" fill="#ffffff" />
      </svg>
    `
  }
];

const COLORS = [
  { name: 'color_yellow', label: 'Vàng', hex1: '#fef08a', hex2: '#eab308', border: '#a16207' },
  { name: 'color_blue', label: 'Xanh Biển', hex1: '#93c5fd', hex2: '#2563eb', border: '#1e40af' },
  { name: 'color_red', label: 'Đỏ', hex1: '#fca5a5', hex2: '#dc2626', border: '#991b1b' },
  { name: 'color_green', label: 'Xanh Lá', hex1: '#86efac', hex2: '#16a34a', border: '#15803d' },
  { name: 'color_orange', label: 'Cam', hex1: '#fdba74', hex2: '#ea580c', border: '#9a3412' },
  { name: 'color_pink', label: 'Hồng', hex1: '#f9a8d4', hex2: '#db2777', border: '#9d174d' },
  { name: 'color_purple', label: 'Tím', hex1: '#d8b4fe', hex2: '#9333ea', border: '#6b21a8' },
  { name: 'color_black', label: 'Đen', hex1: '#94a3b8', hex2: '#1e293b', border: '#0f172a' }
];

function generateColorBlobSvg(c) {
  return `
    <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="blobGrad_${c.name}" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="${c.hex1}" />
          <stop offset="60%" stop-color="${c.hex2}" />
          <stop offset="100%" stop-color="${c.border}" />
        </radialGradient>
        <filter id="blobShadow_${c.name}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="${c.border}" flood-opacity="0.45"/>
        </filter>
      </defs>
      <!-- Glossy Organic Color Splat / Circle Badge -->
      <path d="M 128 32 C 180 30, 224 72, 224 128 C 224 182, 180 224, 128 224 C 74 224, 32 182, 32 128 C 32 74, 76 34, 128 32 Z" 
            fill="url(#blobGrad_${c.name})" stroke="${c.border}" stroke-width="8" filter="url(#blobShadow_${c.name})" />
      <!-- Top Gloss -->
      <ellipse cx="95" cy="80" rx="42" ry="24" fill="rgba(255,255,255,0.7)" transform="rotate(-28 95 80)" />
      <!-- Star Sparkle -->
      <polygon points="175,75 178,85 188,89 178,93 175,103 172,93 162,89 172,85" fill="#ffffff" />
    </svg>
  `;
}

(async () => {
  console.log('Rendering Shapes & Colors with Playwright...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 256, height: 256 });

  // 1. Render Shapes
  for (const item of SHAPES) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; width: 256px; height: 256px; display: flex; align-items: center; justify-content: center; }
            svg { display: block; }
          </style>
        </head>
        <body>
          ${item.svg}
        </body>
      </html>
    `;
    await page.setContent(html);
    const dest = path.join(root, `assets/edu/shapes/${item.name}.png`);
    await page.screenshot({ path: dest, omitBackground: true });
    console.log(`Rendered: ${dest}`);
  }

  // 2. Render Colors
  for (const c of COLORS) {
    const svg = generateColorBlobSvg(c);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; width: 256px; height: 256px; display: flex; align-items: center; justify-content: center; }
            svg { display: block; }
          </style>
        </head>
        <body>
          ${svg}
        </body>
      </html>
    `;
    await page.setContent(html);
    const dest = path.join(root, `assets/edu/colors/${c.name}.png`);
    await page.screenshot({ path: dest, omitBackground: true });
    console.log(`Rendered: ${dest}`);
  }

  await browser.close();
  console.log('All Shapes & Colors rendered successfully!');
})();
