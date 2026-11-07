import fs from 'node:fs';
let content = fs.readFileSync('src/game/ui/KitchenModal.js', 'utf8');
const target = 'return this.renderCookSuccess(this.cookedDishReward);';
console.log('Includes target:', content.includes(target));
if (content.includes(target)) {
  const replacement = `return this.renderCookSuccess(this.cookedDishReward);
    }
    if (this.tab === 'cook-failed') {
      if (titleEl) titleEl.innerHTML = 'Món Ăn Bị Cháy Khét! <img src="/assets/ui/custom_kids_ui/icon_heart_empty.png" class="modal-title-3d-icon" alt="⚠️">';
      if (eyebrowEl) eyebrowEl.textContent = 'BẾP CẦU VỒNG • CHƯA THÀNH CÔNG';
      return this.renderCookFailed(this.failedDishRecipe);`;
  content = content.replace(target, replacement);
  fs.writeFileSync('src/game/ui/KitchenModal.js', content, 'utf8');
  console.log('Successfully inserted cook-failed block!');
} else {
  console.error('Target not found!');
  process.exit(1);
}
