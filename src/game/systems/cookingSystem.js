import { getRecipe, recipeSteps, RECIPES, INGREDIENTS, getIngredient, KITCHEN_LIMITS as LIMIT } from '../../content/cooking/recipes.js';

const bounded = (value, max, fallback = 0) => Number.isFinite(value) ? Math.max(0, Math.min(max, Math.floor(value))) : fallback;
const fail = (reason, message) => ({ ok: false, reason, message });
export function defaultCookingState() {
  return { revision: 0, nextId: 1, spentStars: 0, hearts: 3, bonusHearts: 0, energy: 0, handsWashed: false, ingredients: {}, dishes: [], mastery: {}, session: null };
}
export function normalizeCookingState(raw) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const state = { ...defaultCookingState(),
    revision: bounded(data.revision, Number.MAX_SAFE_INTEGER), nextId: Math.max(1, bounded(data.nextId, Number.MAX_SAFE_INTEGER, 1)),
    spentStars: bounded(data.spentStars, Number.MAX_SAFE_INTEGER), handsWashed: data.handsWashed === true,
    hearts: bounded(data.hearts, LIMIT.hearts, 3) || 3, bonusHearts: bounded(data.bonusHearts, LIMIT.bonusHearts), energy: bounded(data.energy, LIMIT.energy) };
  for (const item of INGREDIENTS) {
    const count = bounded(data.ingredients?.[item.id], LIMIT.ingredientStack);
    if (count) state.ingredients[item.id] = count;
  }
  const ids = new Set();
  state.dishes = (Array.isArray(data.dishes) ? data.dishes : []).filter(d => {
    if (!d || typeof d.id !== 'string' || !/^cook-\d+$/.test(d.id) || !getRecipe(d.recipeId) || ids.has(d.id)) return false;
    ids.add(d.id); return true;
  }).slice(0, LIMIT.bag).map(d => ({ id: d.id, recipeId: d.recipeId, quality: Math.max(1, bounded(d.quality, 3, 3)) }));
  for (const r of RECIPES) {
    const count = bounded(data.mastery?.[r.id], 9999);
    if (count) state.mastery[r.id] = count;
  }
  const s = data.session;
  const recipe = getRecipe(s?.recipeId);
  if (recipe && typeof s.id === 'string' && /^cook-\d+$/.test(s.id) && !ids.has(s.id)) {
    const phase = s.phase === 'cooking' ? 'cooking' : 'preparing';
    const staged = {};
    for (const item of recipe.ingredients) staged[item.id] = bounded(s.staged?.[item.id], Math.min(item.count, state.ingredients[item.id] || 0));
    state.session = { id: s.id, recipeId: recipe.id, phase, staged,
      heat: ['off','low','medium','high'].includes(s.heat) ? s.heat : null,
      ticks: [2,4,6].includes(s.ticks) ? s.ticks : 0,
      startedAt: bounded(s.startedAt, Number.MAX_SAFE_INTEGER), readyAt: bounded(s.readyAt, Number.MAX_SAFE_INTEGER) };
    // Old completed quiz sessions already earned a dish. Preserve that reward.
    if (!s.phase && s.step === recipeSteps(recipe).length) {
      state.session.phase = 'cooking'; state.session.readyAt = 0;
    }
  }
  state.nextId = Math.max(state.nextId, ...state.dishes.map(d => Number(d.id.slice(5)) + 1), state.session ? Number(state.session.id.slice(5)) + 1 : 1);
  return state;
}

// Every purchase/recipe/item operation reads fresh state and commits once.
export class CookingSystem {
  constructor(saveAdapter, onChange = () => {}, now = () => Date.now()) { this.saveAdapter = saveAdapter; this.onChange = onChange; this.now = now; }
  getState() { return normalizeCookingState(this.saveAdapter.load().cooking); }
  getStars() { return bounded(this.saveAdapter.load().player?.stars, Number.MAX_SAFE_INTEGER); }
  unlocked(recipe, state = this.getState()) { return Object.keys(state.mastery).length >= recipe.unlock; }
  mutate(action) {
    const game = this.saveAdapter.load();
    const state = normalizeCookingState(game.cooking);
    const result = action(state, game);
    if (!result.ok) return result;
    state.revision++;
    game.cooking = state;
    if (!this.saveAdapter.save(game, { writeCooking: true })) return fail('save', 'Chưa lưu được. Đồ của bé vẫn còn, bé thử lại nhé!');
    this.onChange(state, game);
    return result;
  }
  buy(ingredientId) {
    return this.mutate((state, game) => {
      const item = getIngredient(ingredientId);
      if (!item) return fail('invalid', 'Mình chọn nguyên liệu trong tủ lạnh nhé.');
      if ((state.ingredients[item.id] || 0) >= LIMIT.ingredientStack) return fail('full', 'Túi đã đủ 99 phần nguyên liệu này rồi.');
      const stars = bounded(game.player.stars, Number.MAX_SAFE_INTEGER);
      if (stars < item.price) return fail('stars', 'Chưa đủ Sao. Bé làm thử thách để kiếm thêm nhé!');
      state.ingredients[item.id] = (state.ingredients[item.id] || 0) + 1;
      state.spentStars += item.price;
      game.player.stars = stars - item.price;
      game.player.kitchenSpentStars = state.spentStars;
      return { ok: true, item };
    });
  }
  completeHandWash() {
    return this.mutate(state => {
      state.handsWashed = true;
      state.handWash8StepsDone = true;
      return { ok: true };
    });
  }
  resetHandWash() {
    return this.mutate(state => {
      state.handsWashed = false;
      return { ok: true };
    });
  }
  start(recipeId) {
    return this.mutate(state => {
      const recipe = getRecipe(recipeId);
      if (!recipe || !this.unlocked(recipe, state)) return fail('locked', 'Bé làm thêm các món đã mở nhé.');
      if (state.session) return fail('active', 'Bé làm tiếp món đang chuẩn bị nhé.');
      if (state.dishes.length >= LIMIT.bag) return fail('full', 'Túi đã đủ 6 món. Bé dùng hoặc hủy một món trước nhé.');
      if (!state.handsWashed) return fail('hygiene', 'Rửa tay sạch trước khi nấu món nhé!');
      state.session = { id: `cook-${state.nextId++}`, recipeId, phase: 'preparing', staged: {}, heat: null, ticks: 0, startedAt: 0, readyAt: 0 };
      return { ok: true };
    });
  }
  stage(sessionId, ingredientId, remove = false) {
    return this.mutate(state => {
      const s = state.session;
      if (!s || s.id !== sessionId || s.phase !== 'preparing') return fail('stale', 'Món đã đổi rồi, bé chọn lại nhé.');
      const need = getRecipe(s.recipeId).ingredients.find(i => i.id === ingredientId);
      if (!need) return fail('wrong', 'Món này chưa cần nguyên liệu đó. Xem hình công thức nhé!');
      const count = s.staged[ingredientId] || 0;
      if (remove) { s.staged[ingredientId] = Math.max(0, count - 1); return { ok: true }; }
      if (count >= need.count) return fail('enough', 'Đã đủ phần nguyên liệu này rồi!');
      if ((state.ingredients[ingredientId] || 0) <= count) return fail('missing', 'Túi chưa có đủ. Bé qua tủ lạnh mua thêm nhé!');
      s.staged[ingredientId] = count + 1;
      return { ok: true };
    });
  }
  configure(sessionId, field, value) {
    return this.mutate(state => {
      const s = state.session;
      if (!s || s.id !== sessionId || s.phase !== 'preparing') return fail('stale', 'Món đã đổi rồi.');
      if (field === 'heat' && ['off','low','medium','high'].includes(value)) s.heat = value;
      else if (field === 'ticks' && [2,4,6].includes(value)) s.ticks = value;
      else return fail('invalid', 'Bé chọn nút trên bếp nhé.');
      return { ok: true };
    });
  }
  cook(sessionId) {
    return this.mutate(state => {
      const s = state.session;
      if (!s || s.id !== sessionId || s.phase !== 'preparing') return fail('stale', 'Món đang nấu rồi!');
      const recipe = getRecipe(s.recipeId);
      if (state.dishes.length >= LIMIT.bag) return fail('full', 'Túi đã đủ 6 món. Dùng hoặc hủy một món trước nhé.');
      if (!state.handsWashed) return fail('hygiene', 'Rửa tay sạch trước khi bật bếp nhé!');
      if (recipe.ingredients.some(i => s.staged[i.id] !== i.count || (state.ingredients[i.id] || 0) < i.count)) return fail('missing', 'Kéo đủ số phần theo công thức vào nồi nhé!');
      if (s.heat === null && s.ticks === 0) {
        s.heat = recipe.heat;
        s.ticks = recipe.ticks;
      } else if (s.heat !== recipe.heat || s.ticks !== recipe.ticks) {
        return fail('setting', 'Bé xem lại hình lửa và số nhịp trong công thức nhé. Nguyên liệu vẫn còn nguyên!');
      }
      for (const item of recipe.ingredients) state.ingredients[item.id] -= item.count;
      s.phase = 'cooking'; s.startedAt = this.now(); s.readyAt = s.startedAt + recipe.durationMs;
      return { ok: true };
    });
  }
  cookInstant(sessionId) {
    const res = this.cook(sessionId);
    if (!res.ok) return res;
    return this.mutate(state => {
      const s = state.session;
      if (!s || s.phase !== 'cooking') return fail('unfinished');
      if (state.dishes.length >= LIMIT.bag) return fail('full', 'Túi món ăn đang đầy.');
      state.dishes.push({ id: s.id, recipeId: s.recipeId, quality: 3 });
      state.mastery[s.recipeId] = (state.mastery[s.recipeId] || 0) + 1;
      const recipe = getRecipe(s.recipeId);
      state.session = null;
      return { ok: true, recipe };
    });
  }
  finish() {
    const current = this.getState().session;
    if (!current || current.phase !== 'cooking' || this.now() < current.readyAt) return { ok: false, reason: 'unfinished' };
    return this.mutate(state => {
      const s = state.session;
      if (!s || s.phase !== 'cooking' || this.now() < s.readyAt) return fail('unfinished');
      if (state.dishes.length >= LIMIT.bag) return fail('full', 'Túi món ăn đang đầy.');
      state.dishes.push({ id: s.id, recipeId: s.recipeId, quality: 3 });
      state.mastery[s.recipeId] = (state.mastery[s.recipeId] || 0) + 1;
      const recipe = getRecipe(s.recipeId);
      state.session = null;
      return { ok: true, recipe };
    });
  }
  cancel() {
    return this.mutate(state => {
      if (state.session?.phase === 'cooking') return fail('cooking', 'Bếp đang làm món. Bé đợi một chút nhé!');
      state.session = null; return { ok: true };
    });
  }
  failSession(sessionId) {
    return this.mutate(state => {
      const s = state.session;
      if (!s || s.id !== sessionId) return fail('stale', 'Phiên nấu ăn đã kết thúc.');
      const recipe = getRecipe(s.recipeId);
      if (recipe && s.staged) {
        // Hụt nhịp: nguyên liệu trong nồi bị cháy hỏng ("mất hết")
        for (const [ingId, count] of Object.entries(s.staged)) {
          const current = state.ingredients[ingId] || 0;
          state.ingredients[ingId] = Math.max(0, current - count);
          if (state.ingredients[ingId] <= 0) {
            delete state.ingredients[ingId];
          }
        }
      }
      state.session = null;
      return { ok: true, burntRecipe: recipe };
    });
  }

  discardIngredient(ingredientId) {
    return this.mutate(state => {
      const current = state.ingredients[ingredientId] || 0;
      if (current <= 0) return fail('missing', 'Nguyên liệu này không còn trong túi.');
      state.ingredients[ingredientId] = current - 1;
      if (state.ingredients[ingredientId] <= 0) {
        delete state.ingredients[ingredientId];
      }
      return { ok: true };
    });
  }
  useIngredient(ingredientId) {
    return this.mutate(state => {
      const current = state.ingredients[ingredientId] || 0;
      if (current <= 0) return fail('missing', 'Nguyên liệu này không còn trong túi.');
      state.ingredients[ingredientId] = current - 1;
      if (state.ingredients[ingredientId] <= 0) {
        delete state.ingredients[ingredientId];
      }
      if (state.hearts < LIMIT.hearts) {
        state.hearts = Math.min(LIMIT.hearts, state.hearts + 1);
      } else if (state.energy < LIMIT.energy) {
        state.energy = Math.min(LIMIT.energy, state.energy + 1);
      }
      return { ok: true, ingredientId };
    });
  }

  discard(dishId) {
    return this.mutate(state => {
      const index = state.dishes.findIndex(d => d.id === dishId);
      if (index < 0) return fail('missing', 'Món này không còn trong túi.');
      state.dishes.splice(index, 1); return { ok: true };
    });
  }
  feedPet(dishId) {
    return this.mutate((state, game) => {
      const index = state.dishes.findIndex(d => d.id === dishId);
      if (index < 0) return fail('missing', 'Món này không còn trong túi.');
      const pet = game.pet;
      if (!pet || pet.hunger >= 100) return fail('full', 'Cún đã no rồi. Bé để dành món nhé!');
      pet.hunger = Math.min(100, (pet.hunger || 0) + 50);
      pet.affection = Math.min(100, (pet.affection || 0) + 3);
      pet.exp = (pet.exp || 0) + 5;
      pet.lastCareTimestamp = this.now();
      state.dishes.splice(index, 1);
      return { ok: true, pet };
    });
  }
  eat(dishId) {
    return this.mutate(state => {
      const index = state.dishes.findIndex(d => d.id === dishId);
      if (index < 0) return fail('missing', 'Món này không còn trong túi.');
      const effect = getRecipe(state.dishes[index].recipeId).effect;
      const next = { hearts: Math.min(LIMIT.hearts, state.hearts + effect.heal), bonusHearts: Math.max(state.bonusHearts, effect.bonus), energy: Math.min(LIMIT.energy, state.energy + effect.energy) };
      if (Object.keys(next).every(key => next[key] === state[key])) return fail('full', 'Bé đã đủ sức rồi! Để dành món cho sau nhé.');
      Object.assign(state, next); state.dishes.splice(index, 1); return { ok: true };
    });
  }
  beginBattle() {
    const result = this.mutate(state => { const bonus = state.bonusHearts; const hearts = state.hearts + bonus; state.bonusHearts = 0; return { ok: true, hearts, bonus, maxHearts: LIMIT.hearts + bonus }; });
    return result.ok ? result : { ok: false, hearts: 3, maxHearts: 3 };
  }
  recordBattleHearts(hearts) { return this.mutate(state => { state.hearts = Math.max(1, Math.min(LIMIT.hearts, Math.floor(Number(hearts) || 1))); return { ok: true }; }); }
  useEnergy() { return this.mutate(state => { if (!state.energy) return fail('empty'); state.energy--; return { ok: true }; }); }
}
