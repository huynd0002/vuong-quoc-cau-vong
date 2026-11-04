import fs from 'node:fs';

// 1. Patch src/styles/kitchen.css
let kitchenCss = fs.readFileSync('src/styles/kitchen.css', 'utf8');
const isCRLF = kitchenCss.includes('\r\n');
const normalize = s => s.replace(/\r\n/g, '\n');
let normKitchen = normalize(kitchenCss);

// Flyout alignment additions
const flyoutAlignmentRules = `
.dish-hover-flyout.flyout-align-left {
  left: 0 !important;
  transform: translateY(10px) scale(0.95) !important;
}
.dish-hover-flyout.flyout-align-left::after {
  left: 40px !important;
  transform: none !important;
}
.kitchen-recipe:hover .dish-hover-flyout.flyout-align-left,
.kitchen-recipe:focus-visible .dish-hover-flyout.flyout-align-left,
.kitchen-recipe.show-flyout .dish-hover-flyout.flyout-align-left {
  transform: translateY(0) scale(1) !important;
}

.dish-hover-flyout.flyout-align-right {
  left: auto !important;
  right: 0 !important;
  transform: translateY(10px) scale(0.95) !important;
}
.dish-hover-flyout.flyout-align-right::after {
  left: auto !important;
  right: 40px !important;
  transform: none !important;
}
.kitchen-recipe:hover .dish-hover-flyout.flyout-align-right,
.kitchen-recipe:focus-visible .dish-hover-flyout.flyout-align-right,
.kitchen-recipe.show-flyout .dish-hover-flyout.flyout-align-right {
  transform: translateY(0) scale(1) !important;
}
`;

if (!normKitchen.includes('.dish-hover-flyout.flyout-align-left')) {
  normKitchen = normKitchen.replace('.dish-hover-flyout.flyout-down::after {', flyoutAlignmentRules + '\n.dish-hover-flyout.flyout-down::after {');
}

// In fridge mode: hide top duplicate wallet & hide bottom bar
const oldFridgeWallet = `.kitchen-room.is-fridge-mode #kitchen-wallet {
  font-size: 16px !important;
  color: #d97706 !important;
}`;

const newFridgeWallet = `.kitchen-room.is-fridge-mode #kitchen-wallet {
  display: none !important;
}
.fridge-bottom-bar {
  display: none !important;
}`;

if (normKitchen.includes(normalize(oldFridgeWallet))) {
  normKitchen = normKitchen.replace(normalize(oldFridgeWallet), normalize(newFridgeWallet));
} else if (!normKitchen.includes('.kitchen-room.is-fridge-mode #kitchen-wallet { display: none !important; }')) {
  normKitchen += '\n' + normalize(newFridgeWallet);
}

fs.writeFileSync('src/styles/kitchen.css', isCRLF ? normKitchen.replace(/\n/g, '\r\n') : normKitchen, 'utf8');
console.log('src/styles/kitchen.css updated');

// 2. Patch src/game/scenes/WorldScene.js
let worldScene = fs.readFileSync('src/game/scenes/WorldScene.js', 'utf8');
const isCRLFWorld = worldScene.includes('\r\n');
let normWorld = normalize(worldScene);

const oldAura = `      // Vòng hào quang ấm áp dưới sàn
      const aura = this.add.ellipse(0, 24, 100, 34, st.auraColor || 0xf59e0b, 0.38);
      this.tweens.add({
        targets: aura,
        alpha: { from: 0.22, to: 0.55 },
        scaleX: { from: 0.92, to: 1.08 },
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      container.add(aura);`;

const newAura = `      // Vòng hào quang sàn bếp: Đã xóa để sàn gỗ tự nhiên luôn sạch bóng theo yêu cầu người dùng
      const aura = null;`;

if (normWorld.includes(normalize(oldAura))) {
  normWorld = normWorld.replace(normalize(oldAura), normalize(newAura));
  fs.writeFileSync('src/game/scenes/WorldScene.js', isCRLFWorld ? normWorld.replace(/\n/g, '\r\n') : normWorld, 'utf8');
  console.log('src/game/scenes/WorldScene.js updated (auras removed)');
} else {
  console.log('oldAura not found in WorldScene.js, checking if already removed');
}
