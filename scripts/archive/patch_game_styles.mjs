import fs from 'node:fs';

// 1. Patch src/styles/game.css
let gameCss = fs.readFileSync('src/styles/game.css', 'utf8');

// Replace char-banner-wrap styles
const oldBanner = `.char-banner-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: min(94vw, 560px);
  height: 124px;
}
.char-banner-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 4px 12px rgba(180, 83, 9, 0.28));
}
.char-banner-title {
  position: relative;
  z-index: 2;
  margin-top: 18px;
  color: #78350f;
  font-family: "Nunito", "Segoe UI", Arial, sans-serif;
  font-size: 19px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.95), 0 2px 4px rgba(251, 191, 36, 0.5);
  white-space: nowrap;
}`;

const newBanner = `.char-banner-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: auto;
  min-width: 320px;
  max-width: 95%;
  padding: 10px 32px;
  background: linear-gradient(180deg, #fffbeb 0%, #fef3c7 40%, #fde68a 100%);
  border: 3px solid #f59e0b;
  border-radius: 99px;
  box-shadow: 0 4px 0 #d97706, 0 10px 24px rgba(245, 158, 11, 0.28);
}
.char-banner-icon {
  font-size: 24px;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  flex-shrink: 0;
}
.char-banner-title {
  position: relative;
  z-index: 2;
  margin-top: 0;
  color: #78350f;
  font-family: "Nunito", "Segoe UI", Arial, sans-serif;
  font-size: 20px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}`;

// Replace CRLF to LF for matching
const normalize = str => str.replace(/\r\n/g, '\n');
const isCRLF = gameCss.includes('\r\n');

let normGameCss = normalize(gameCss);
if (normGameCss.includes(normalize(oldBanner))) {
  normGameCss = normGameCss.replace(normalize(oldBanner), normalize(newBanner));
} else {
  console.log('oldBanner not found directly, checking fallback');
}

// Add styles for start adventure button star & flex-wrap
const oldStartCta = `.char-start-adventure-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: auto;
  min-width: 320px;
  max-width: 92%;
  white-space: nowrap;
  min-height: 58px;
  padding: 10px 32px;
  font-family: "Nunito", "Segoe UI", Arial, sans-serif;
  font-size: 21px;
  font-weight: 900;
  color: #ffffff;
  background: linear-gradient(180deg, #34d399 0%, #10b981 45%, #059669 100%);
  border: 4px solid #a7f3d0;
  border-radius: 99px;
  box-shadow: 0 8px 0 #047857, 0 16px 30px rgba(16, 185, 129, 0.45);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.16s ease, filter 0.16s ease;
  animation: startCtaPulse 2s ease-in-out infinite alternate;
}
.btn-cta-3d-star {
  width: 26px;
  height: 26px;
  object-fit: contain;
  vertical-align: middle;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}`;

const newStartCta = `.char-start-adventure-cta {
  display: inline-flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 12px;
  width: auto;
  min-width: 320px;
  max-width: 92%;
  white-space: nowrap;
  min-height: 58px;
  padding: 10px 36px;
  font-family: "Nunito", "Segoe UI", Arial, sans-serif;
  font-size: 21px;
  font-weight: 900;
  color: #ffffff;
  background: linear-gradient(180deg, #34d399 0%, #10b981 45%, #059669 100%);
  border: 4px solid #a7f3d0;
  border-radius: 99px;
  box-shadow: 0 8px 0 #047857, 0 16px 30px rgba(16, 185, 129, 0.45);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.16s ease, filter 0.16s ease;
  animation: startCtaPulse 2s ease-in-out infinite alternate;
}
.btn-cta-star, .btn-cta-3d-star {
  font-size: 24px;
  line-height: 1;
  display: inline-block !important;
  flex-shrink: 0 !important;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}`;

if (normGameCss.includes(normalize(oldStartCta))) {
  normGameCss = normGameCss.replace(normalize(oldStartCta), normalize(newStartCta));
}

// Hide test/debug buttons from top of map according to Image 3
const debugPillsRule = `
/* Hide debug pills according to user request (Keep only Map and Add Questions) */
#test-encounter,
#test-boss,
#btn-test-portal,
#btn-quick-pet-farm {
  display: none !important;
}

/* Hide Mê Cung and Túi from topbar according to Image 2 */
#btn-open-bag,
#btn-open-maze {
  display: none !important;
}

/* Hide kitchen status small text from Vào bếp button according to Image 2 */
#kitchen-status {
  display: none !important;
}
`;

if (!normGameCss.includes('#test-encounter,') || !normGameCss.includes('display: none !important;')) {
  normGameCss += '\n' + normalize(debugPillsRule);
}

fs.writeFileSync('src/styles/game.css', isCRLF ? normGameCss.replace(/\n/g, '\r\n') : normGameCss, 'utf8');
console.log('src/styles/game.css updated successfully');
