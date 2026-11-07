// All quantities and times are game symbols, not instructions for a real stove.
export const KITCHEN_LIMITS = { bag: 6, ingredientStack: 99, hearts: 3, bonusHearts: 2, energy: 3 };
export const INGREDIENTS = [
  { id: 'banana', name: 'chuối', icon: '🍌', image: '/assets/cooking/ingredients/ing_banana.png', price: 1 },
  { id: 'yogurt', name: 'sữa chua', icon: '🥛', image: '/assets/cooking/ingredients/ing_yogurt.png', price: 2 },
  { id: 'bread', name: 'bánh mì', icon: '🍞', image: '/assets/cooking/ingredients/ing_bread.png', price: 1 },
  { id: 'greens', name: 'rau sạch', icon: '🥬', image: '/assets/cooking/ingredients/ing_greens.png', price: 1 },
  { id: 'carrot', name: 'cà rốt', icon: '🥕', image: '/assets/cooking/ingredients/ing_carrot.png', price: 1 },
  { id: 'broccoli', name: 'bông cải', icon: '🥦', image: '/assets/cooking/ingredients/ing_broccoli.png', price: 1 },
  { id: 'water', name: 'nước', icon: '💧', image: '/assets/cooking/ingredients/ing_water.png', price: 1 },
  { id: 'rice', name: 'cơm', icon: '🍚', image: '/assets/cooking/ingredients/ing_rice.png', price: 1 },
  { id: 'egg', name: 'trứng', icon: '🥚', image: '/assets/cooking/ingredients/ing_egg.png', price: 2 },
  { id: 'grain', name: 'gạo', icon: '🌾', image: '/assets/cooking/ingredients/ing_grain.png', price: 1 },
  { id: 'pumpkin', name: 'bí đỏ', icon: '🎃', image: '/assets/cooking/ingredients/ing_pumpkin.png', price: 1 },
  { id: 'fish', name: 'cá tươi', icon: '🐟', image: '/assets/cooking/ingredients/ing_fish.png', price: 2 }
];
export const getIngredient = id => INGREDIENTS.find(item => item.id === id);
export const RECIPES = [
  { id: 'fruit_yogurt', name: 'Sữa chua trái cây', icon: '🥣', image: '/assets/cooking/dishes/dish_fruit_yogurt.png', tier: 1, unlock: 0,
    ingredients: [{ name: 'chuối', icon: '🍌', count: 2 }, { name: 'sữa chua', icon: '🥛', count: 1 }],
    action: 'Trộn nhẹ', actionIcon: '🥄', heat: 'off', ticks: 2,
    effect: { heal: 1, bonus: 1, energy: 0 }, skill: 'Đếm đến 2 · trộn' },
  { id: 'rainbow_sandwich', name: 'Bánh mì sắc màu', icon: '🥪', image: '/assets/cooking/dishes/dish_rainbow_sandwich.png', tier: 1, unlock: 0,
    ingredients: [{ name: 'bánh mì', icon: '🍞', count: 2 }, { name: 'rau sạch', icon: '🥬', count: 1 }],
    action: 'Xếp lớp', actionIcon: '👐', heat: 'off', ticks: 2,
    effect: { heal: 1, bonus: 0, energy: 1 }, skill: 'Đếm · xếp lớp' },
  { id: 'veggie_soup', name: 'Súp rau củ', icon: '🍲', image: '/assets/cooking/dishes/dish_veggie_soup.png', tier: 2, unlock: 2,
    ingredients: [{ name: 'cà rốt', icon: '🥕', count: 2 }, { name: 'bông cải', icon: '🥦', count: 2 }, { name: 'nước', icon: '💧', count: 1 }],
    action: 'Khuấy đều', actionIcon: '🥄', heat: 'low', ticks: 4,
    effect: { heal: 2, bonus: 1, energy: 1 }, skill: 'Lửa nhỏ · đếm nhịp' },
  { id: 'egg_rice', name: 'Cơm trứng rau', icon: '🍳', image: '/assets/cooking/dishes/dish_egg_rice.png', tier: 2, unlock: 2,
    ingredients: [{ name: 'cơm', icon: '🍚', count: 2 }, { name: 'trứng', icon: '🥚', count: 1 }, { name: 'rau sạch', icon: '🥬', count: 1 }],
    action: 'Đảo đều', actionIcon: '🥄', heat: 'medium', ticks: 4,
    effect: { heal: 2, bonus: 1, energy: 1 }, skill: 'Lửa vừa · thứ tự' },
  { id: 'pumpkin_porridge', name: 'Cháo bí đỏ', icon: '🥣', image: '/assets/cooking/dishes/dish_pumpkin_porridge.png', tier: 3, unlock: 4,
    ingredients: [{ name: 'gạo', icon: '🌾', count: 1 }, { name: 'bí đỏ', icon: '🎃', count: 3 }, { name: 'nước', icon: '💧', count: 2 }],
    action: 'Khuấy đều', actionIcon: '🥄', heat: 'low', ticks: 6,
    effect: { heal: 3, bonus: 2, energy: 1 }, skill: 'Đếm đến 3 · kiên nhẫn' },
  { id: 'rainbow_plate', name: 'Đĩa cơm cầu vồng', icon: '🍱', image: '/assets/cooking/dishes/dish_rainbow_plate.png', tier: 3, unlock: 4,
    ingredients: [{ name: 'cơm', icon: '🍚', count: 2 }, { name: 'cà rốt', icon: '🥕', count: 1 }, { name: 'bông cải', icon: '🥦', count: 3 }, { name: 'trứng', icon: '🥚', count: 1 }],
    action: 'Xếp lớp', actionIcon: '👐', heat: 'medium', ticks: 6,
    effect: { heal: 3, bonus: 2, energy: 2 }, skill: 'Phối hợp · bữa ăn đa dạng' },
  { id: 'fish_pumpkin_porridge', name: 'Cháo cá bí đỏ', icon: '🥣', image: '/assets/cooking/dishes/dish_fish_pumpkin_porridge.png', tier: 2, unlock: 0,
    ingredients: [{ name: 'cá tươi', icon: '🐟', count: 1 }, { name: 'gạo', icon: '🌾', count: 1 }, { name: 'bí đỏ', icon: '🎃', count: 1 }, { name: 'nước', icon: '💧', count: 1 }],
    action: 'Khuấy đều', actionIcon: '🥄', heat: 'low', ticks: 4,
    effect: { heal: 2, bonus: 1, energy: 1 }, skill: 'Cá câu được · lửa nhỏ' },
  { id: 'fish_veggie_rice', name: 'Cơm cá rau củ', icon: '🍛', image: '/assets/cooking/dishes/dish_fish_veggie_rice.png', tier: 2, unlock: 0,
    ingredients: [{ name: 'cá tươi', icon: '🐟', count: 1 }, { name: 'cơm', icon: '🍚', count: 1 }, { name: 'cà rốt', icon: '🥕', count: 1 }, { name: 'rau sạch', icon: '🥬', count: 1 }],
    action: 'Đảo đều', actionIcon: '🥄', heat: 'medium', ticks: 4,
    effect: { heal: 2, bonus: 1, energy: 2 }, skill: 'Cá câu được · đủ chất' }
];
for (const recipe of RECIPES) {
  recipe.ingredients = recipe.ingredients.map(item => {
    const found = INGREDIENTS.find(i => i.name === item.name || i.id === item.id);
    return {
      ...item,
      id: found?.id || item.id,
      image: found?.image || null
    };
  });
  recipe.durationMs = recipe.ticks * 1000;
}
export const getRecipe = id => RECIPES.find(recipe => recipe.id === id);
export const effectLabel = effect => `Hồi ${effect.heal} tim${effect.bonus ? ` · +${effect.bonus} tim tạm` : ''}${effect.energy ? ` · +${effect.energy} năng lượng` : ''}`;

/**
 * Tính giá gốc nguyên liệu hoặc giá bán lại lỗ 50%
 */
export function calculateIngredientSellPrice(ingredientOrId) {
  const ing = typeof ingredientOrId === 'string'
    ? INGREDIENTS.find((i) => i.id === ingredientOrId || i.name === ingredientOrId)
    : ingredientOrId;
  const originalPrice = ing?.price || 4;
  return Math.max(1, Math.floor(originalPrice * 0.5));
}

/**
 * Tính tổng chi phí nguyên liệu làm nên món ăn
 */
export function calculateDishCost(recipeOrId) {
  const recipe = typeof recipeOrId === 'string'
    ? getRecipe(recipeOrId)
    : recipeOrId;
  if (!recipe || !Array.isArray(recipe.ingredients)) return 6;
  return recipe.ingredients.reduce((sum, item) => {
    const ing = INGREDIENTS.find((i) => i.id === item.id || i.name === item.name || i.id === item.name);
    const count = item.count || 1;
    const price = ing?.price || 6;
    return sum + price * count;
  }, 0);
}

/**
 * Tính giá bán lại món ăn bị lỗ 50% so với tổng chi phí nguyên liệu
 */
export function calculateDishSellPrice(recipeOrId) {
  const totalCost = calculateDishCost(recipeOrId);
  return Math.max(1, Math.floor(totalCost * 0.5));
}

const option = (id, label, icon) => ({ id: String(id), label, icon });
export function recipeSteps(recipe) {
  const steps = [{ id: 'wash', icon: '🧼', prompt: 'Trước khi làm món ăn, bé làm gì?',
    hint: 'Rửa tay sạch xà phòng rồi mình cùng vào bếp nhé!', correct: 'wash',
    choices: [option('play', 'Chơi tiếp', '🧸'), option('wash', 'Rửa tay', '🧼'), option('cook', 'Nấu ngay', '🍲')] }];
  recipe.ingredients.forEach((ingredient, index) => {
    steps.push({ id: `ingredient-${index}`, icon: ingredient.icon,
      prompt: `Cho ${ingredient.count} phần ${ingredient.name} vào nhé!`,
      hint: `Cùng đếm ${Array.from({ length: ingredient.count }, (_, i) => i + 1).join(', ')}. Chọn ${ingredient.count} phần ${ingredient.name}.`,
      correct: String(ingredient.count), choices: [1, 2, 3].map(n => option(n, `${n} phần ${ingredient.name}`, ingredient.icon.repeat(n))) });
  });
  steps.push({ id: 'prepare', icon: recipe.actionIcon, prompt: `Bé hãy ${recipe.action.toLowerCase()} các nguyên liệu.`,
    hint: `Chọn ${recipe.action.toLowerCase()} để chuẩn bị món ${recipe.name.toLowerCase()}.`, correct: recipe.action,
    choices: [option('Trộn nhẹ', 'Trộn nhẹ', '🥄'), option('Xếp lớp', 'Xếp lớp', '👐'), option('Khuấy đều', 'Khuấy đều', '🥄'), option('Đảo đều', 'Đảo đều', '🥄')].filter(o => o.id === recipe.action || !['Khuấy đều', 'Đảo đều'].includes(o.id)) });
  steps.push({ id: 'heat', icon: '🔥', prompt: recipe.heat === 'off' ? 'Món nguội này có cần bật bếp không?' : `Chọn ${recipe.heat === 'low' ? 'lửa nhỏ' : 'lửa vừa'} cho món này.`,
    hint: recipe.heat === 'off' ? 'Món này chỉ cần trộn hoặc xếp. Giữ bếp tắt nhé!' : `Lửa ${recipe.heat === 'low' ? 'nhỏ 🔥' : 'vừa 🔥🔥'} giúp món chín đều trong trò chơi.`,
    correct: recipe.heat, choices: [option('off', 'Tắt bếp', '⭕'), option('low', 'Lửa nhỏ', '🔥'), option('medium', 'Lửa vừa', '🔥🔥'), option('high', 'Lửa lớn', '🔥🔥🔥')] });
  steps.push({ id: 'time', icon: '⏲️', prompt: `${recipe.heat === 'off' ? 'Trộn / xếp' : 'Nấu'} trong ${recipe.ticks} nhịp đồng hồ nhé!`,
    hint: `Chọn ${recipe.ticks} nhịp. Đồng hồ sẽ tự dừng, bé không cần bấm thật nhanh.`, correct: String(recipe.ticks),
    choices: [2, 4, 6].map(n => option(n, `${n} nhịp`, '⏲️')) });
  steps.push({ id: 'serve', icon: '🍽️', prompt: recipe.heat === 'off' ? 'Làm gì trước khi thưởng thức?' : 'Món đang nóng. Bé làm gì trước khi ăn?',
    hint: recipe.heat === 'off' ? 'Bày ra đĩa sạch để thưởng thức nhé!' : 'Tắt bếp và chờ món nguội bớt, rồi mới ăn nhé!', correct: 'safe',
    choices: [option('rush', 'Ăn ngay trong nồi', '🍲'), option('safe', recipe.heat === 'off' ? 'Bày đĩa sạch' : 'Tắt bếp, chờ nguội', '🍽️')] });
  return steps;
}
