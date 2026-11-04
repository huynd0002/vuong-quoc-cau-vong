import fs from 'fs';

// 1. Update KitchenStationModal.js
let modalCode = fs.readFileSync('src/game/ui/KitchenStationModal.js', 'utf8');

// Add this.autoCloseTimer = null in constructor
if (!modalCode.includes('this.autoCloseTimer = null;')) {
  modalCode = modalCode.replace(
    'this.onHandWashComplete = onHandWashComplete;',
    'this.onHandWashComplete = onHandWashComplete;\r\n    this.autoCloseTimer = null;'
  );
}

// Add autoCloseTimer clear in close()
if (!modalCode.includes('if (this.autoCloseTimer)')) {
  modalCode = modalCode.replace(
    'if (this.root.hidden) return;',
    'if (this.root.hidden) return;\r\n    if (this.autoCloseTimer) {\r\n      clearTimeout(this.autoCloseTimer);\r\n      this.autoCloseTimer = null;\r\n    }'
  );
}

// Update showSinkModal footer: replace Để sau with Đóng, and hide #btn-goto-cook
modalCode = modalCode.replace(
  /<button type="button" class="btn-kitchen-secondary" data-action="close-popup">Để sau<\/button>\s*<button type="button" class="btn-kitchen-primary" id="btn-goto-cook" disabled>Vào bếp nấu ăn<\/button>/,
  '<button type="button" class="btn-kitchen-secondary" data-action="close-popup">Đóng</button>\r\n          <button type="button" class="btn-kitchen-primary" id="btn-goto-cook" style="display: none !important;" aria-hidden="true" disabled>Vào bếp nấu ăn</button>'
);

// Update step 7 completion in nextStep()
const oldStep7Regex = /if\s*\(currentStep\s*>=\s*7\)\s*\{[\s\S]*?this\.onHandWashComplete\?\.\(\);\s*return;\s*\}/;
const newStep7Code = `if (currentStep >= 7) {
        currentStep = 7;
        stepProgress = 100;
        paint();
        stage.classList.add('is-clean');
        if (cook) {
          cook.disabled = false;
          cook.classList.add('is-ready-rainbow-glow');
        }
        stopDrag();
        this.playCelebrationFanfare();
        this.triggerCleanCelebrationVFX(stage);
        this.speak('Hoan hô! Đôi bàn tay của bé đã sạch khuẩn 100%! Bé hãy chạm vào Bếp lò để nấu món ngon nhé!');
        this.onHandWashComplete?.();
        window.dispatchEvent(new CustomEvent('game:show-toast', {
          detail: { message: '✨ Đôi tay bé đã sạch bong 100%! Bé hãy chạm vào Bếp lò để nấu ăn nhé! 🍳' }
        }));
        if (this.autoCloseTimer) clearTimeout(this.autoCloseTimer);
        this.autoCloseTimer = setTimeout(() => {
          this.close();
        }, 1500);
        return;
      }`;

if (oldStep7Regex.test(modalCode)) {
  modalCode = modalCode.replace(oldStep7Regex, newStep7Code);
} else {
  console.error('Could not find oldStep7Regex in KitchenStationModal.js');
}

// Add autoCloseTimer clear in handwashCleanup
if (!modalCode.includes('if (this.autoCloseTimer) clearTimeout(this.autoCloseTimer);')) {
  modalCode = modalCode.replace(
    'this.handwashCleanup = () => {',
    'this.handwashCleanup = () => {\r\n      if (this.autoCloseTimer) {\r\n        clearTimeout(this.autoCloseTimer);\r\n        this.autoCloseTimer = null;\r\n      }'
  );
}

fs.writeFileSync('src/game/ui/KitchenStationModal.js', modalCode, 'utf8');
console.log('KitchenStationModal.js updated successfully!');

// 2. Update kitchen.css
let cssCode = fs.readFileSync('src/styles/kitchen.css', 'utf8');
if (!cssCode.includes('/* Ẩn triệt để nút vào bếp ở pop-up rửa tay')) {
  cssCode += `\r\n/* Ẩn triệt để nút vào bếp ở pop-up rửa tay theo yêu cầu người dùng */\r\n.handwash-card #btn-goto-cook,\r\n#btn-goto-cook {\r\n  display: none !important;\r\n  visibility: hidden !important;\r\n}\r\n.handwash-card .kitchen-card-footer {\r\n  display: flex;\r\n  justify-content: flex-end;\r\n  gap: 12px;\r\n}\r\n`;
  fs.writeFileSync('src/styles/kitchen.css', cssCode, 'utf8');
  console.log('kitchen.css updated successfully!');
}
