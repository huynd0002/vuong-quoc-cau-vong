import fs from 'fs';

let content = fs.readFileSync('src/game/ui/KitchenModal.js', 'utf8');

const targetSnippet1 = `    if (button.dataset.useIngredient) {
      const res = this.system.useIngredient(button.dataset.useIngredient);
      this.confirmDiscard = false;
      this.render();
      if (res.ok) {
        this.notify('😋 Bé đã dùng nguyên liệu tươi ngon!');
        this.audio?.playChime(880, 0.15);
      }
      return;
    }`;

const replacementSnippet1 = `    if (button.dataset.useIngredient) {
      const ingredientId = button.dataset.useIngredient;
      this.confirmDiscard = false;
      // Đóng pop-up túi ngay lập tức và kích hoạt hiệu ứng vfx ăn món trên thế giới (v3.7.1)
      this.close();
      window.dispatchEvent(new CustomEvent('hero:use-food', {
        detail: { ingredientId }
      }));
      return;
    }`;

const targetSnippet2 = `    else if(button.dataset.eat) {
      result=this.system.eat(button.dataset.eat);
      if (result?.ok) this.audioService?.playPetEat?.();
    }`;

const replacementSnippet2 = `    else if(button.dataset.eat) {
      const dishId = button.dataset.eat;
      // Đóng pop-up túi ngay lập tức và kích hoạt hiệu ứng vfx heal-aoe + charmed + loading 100% (v3.7.1)
      this.close();
      window.dispatchEvent(new CustomEvent('hero:use-food', {
        detail: { dishId }
      }));
      return;
    }`;

const normalize = s => s.replace(/\r\n/g, '\n');
const isCrlf = content.includes('\r\n');
let norm = normalize(content);

norm = norm.replace(normalize(targetSnippet1), normalize(replacementSnippet1));
norm = norm.replace(normalize(targetSnippet2), normalize(replacementSnippet2));

if (isCrlf) norm = norm.replace(/\n/g, '\r\n');
fs.writeFileSync('src/game/ui/KitchenModal.js', norm, 'utf8');
console.log('KitchenModal.js updated for food use VFX!');
