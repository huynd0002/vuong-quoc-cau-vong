import fs from 'fs';

let css = fs.readFileSync('./src/styles/game.css', 'utf8');

// 1. Cập nhật .arena-banner-title thành căn giữa tuyệt đối
const oldTitleCss = `.arena-banner-title {
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  background: transparent url('/assets/ui/game_ui_pack/banner_ribbon_gold.png') center / 100% 100% no-repeat;
  padding: 8px 36px 14px;
  min-width: 250px;
  text-align: center;
  text-shadow: 0 2px 4px rgba(69, 26, 3, 0.85);
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.35));
  letter-spacing: 0.04em;
}`;

const newTitleCss = `.arena-banner-title {
  position: absolute;
  left: 50%;
  top: 5px;
  transform: translateX(-50%);
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  background: transparent url('/assets/ui/game_ui_pack/banner_ribbon_gold.png') center / 100% 100% no-repeat;
  padding: 6px 36px 12px;
  min-width: 250px;
  text-align: center;
  text-shadow: 0 2px 4px rgba(69, 26, 3, 0.85);
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.35));
  letter-spacing: 0.04em;
  z-index: 5;
}`;

css = css.replace(oldTitleCss, newTitleCss);

// 2. Cập nhật vị trí của Hero và Monster trên sàn đấu
const oldFighterPos = `/* Bé Sâu: Đặt tại vòng tròn màu xanh dương bên trái (khoảng 25.5% chiều ngang, 51.5% chiều dọc sàn đấu) */
.arena-fighter.hero-side {
  left: 25.5%;
  top: 51.5%;
}

/* Quái vật: Đặt tại vòng tròn màu xanh dương bên phải trên sân đình (khoảng 77.0% chiều ngang, 49.5% chiều dọc sàn đấu) */
.arena-fighter.monster-side {
  left: 77%;
  top: 49.5%;
}`;

const newFighterPos = `/* Bé Sâu: Đặt tại khoảng 27% chiều ngang, 55% chiều dọc sàn đấu trên nền sa mạc */
.arena-fighter.hero-side {
  left: 27%;
  top: 55%;
}

/* Quái vật: Đặt tại khoảng 73% chiều ngang, 55% chiều dọc đối diện trực tiếp Bé Sâu */
.arena-fighter.monster-side {
  left: 73%;
  top: 55%;
}`;

css = css.replace(oldFighterPos, newFighterPos);

// 3. Cập nhật các ô đáp án thu nhỏ lại để không bị tràn
const oldGridCss = `.arena-answers-grid {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 14px;
  margin: 4px auto 2px;
  padding: 2px 6px;
  max-width: 960px;
  width: 100%;
}`;

const newGridCss = `.arena-answers-grid {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 10px;
  margin: 2px auto;
  padding: 2px 4px;
  max-width: 660px;
  width: 100%;
}`;

css = css.replace(oldGridCss, newGridCss);

const oldAnsBtnCss = `.ans-btn {
  flex: 1 1 130px;
  max-width: 190px;
  min-height: 74px;
  border-radius: 16px;
  padding: 3px 6px 4px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.16s ease, border-color 0.16s ease;
}`;

const newAnsBtnCss = `.ans-btn {
  flex: 1 1 105px;
  max-width: 155px;
  min-height: 58px;
  border-radius: 14px;
  padding: 3px 6px 4px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.16s ease, border-color 0.16s ease;
}`;

css = css.replace(oldAnsBtnCss, newAnsBtnCss);

// Cập nhật kích thước icon và huy hiệu trong đáp án
const oldBadgeCss = `.ans-badge-img {
  height: 40px;
  width: auto;
  max-width: 68px;
  object-fit: contain;
  margin-bottom: 4px;
}`;

const newBadgeCss = `.ans-badge-img {
  height: 28px !important;
  width: auto;
  max-width: 48px;
  object-fit: contain;
  margin-bottom: 2px;
}`;

css = css.replace(oldBadgeCss, newBadgeCss);

// Thêm style cho Khiên Thái Dương phòng thủ và thu nhỏ icon đếm quả cam
const shieldAndCompactCss = `
/* Thu nhỏ icon quả và khay đếm trong các ô đáp án để không bị tràn viền */
.math-card-num, .ans-number {
  font-size: 22px !important;
  line-height: 1.1;
}
.math-count-tray {
  padding: 2px 6px !important;
  gap: 3px !important;
  border-radius: 16px !important;
  margin: 2px auto !important;
}
.count-item-icon {
  font-size: 19px !important;
  line-height: 1;
  margin: 0 1px;
}
.ans-label-text, .math-card-label {
  font-size: 11px !important;
  font-weight: 800;
  margin-top: 1px;
}

/* Hiệu ứng Khiên Thái Dương Phòng Thủ cho Map 4 */
.hero-defense-shield-wrap {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 190px;
  height: 190px;
  pointer-events: none;
  z-index: 12;
  animation: shieldSolarPulse 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.hero-defense-shield-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 18px rgba(245, 158, 11, 0.95)) drop-shadow(0 0 32px rgba(234, 88, 12, 0.8));
}
@keyframes shieldSolarPulse {
  0% { transform: translate(-50%, -50%) scale(0.3) rotate(-20deg); opacity: 0; }
  70% { transform: translate(-50%, -50%) scale(1.15) rotate(5deg); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
}
`;

if (!css.includes('hero-defense-shield-wrap')) {
  css += shieldAndCompactCss;
}

fs.writeFileSync('./src/styles/game.css', css, 'utf8');
console.log('✓ src/styles/game.css updated successfully!');
