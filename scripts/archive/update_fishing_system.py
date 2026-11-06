with open('src/game/systems/fishingSystem.js', 'r', encoding='utf-8') as f:
    code = f.read()

code_norm = code.replace('\r\n', '\n')

# 1. Thêm import
import_target = "} from '../../content/fishing/fishingData.js';"
import_replacement = """} from '../../content/fishing/fishingData.js';
import { getRecipe } from '../../content/kitchen/recipesData.js';
import { INGREDIENTS } from '../../content/kitchen/ingredientsData.js';
import { getBackpack } from '../../content/backpacks/backpackData.js';
import { ACCESSORIES_CATALOG } from '../../content/fashion/accessoriesData.js';"""

if import_target in code_norm:
    code_norm = code_norm.replace(import_target, import_replacement, 1)
    print("1. Added imports to fishingSystem.js")
else:
    print("ERROR 1: import_target not found")
    exit(1)

# 2. Thêm method sellItemAtMarket
method_target = """  sellFishAtMarket(fishId, sellAll = false) {"""
method_code = """  /**
   * Bán bất kỳ vật phẩm nào trong túi đồ tại quầy bán cá (cá, món ăn, nguyên liệu, balo, phụ kiện)
   * Dữ liệu bán rồi sẽ mất luôn vĩnh viễn khỏi túi và save game.
   */
  sellItemAtMarket(itemKind, itemId) {
    return this.mutate((fishing, game) => {
      let starsEarned = 0;
      let soldItem = null;
      let writeCooking = false;

      if (itemKind === 'fish') {
        const idx = fishing.basket.findIndex((f) => f.id === itemId);
        if (idx === -1) return { ok: false, reason: 'not_found' };
        const target = fishing.basket[idx];
        const currentCount = target.count || 1;
        const sp = getFishSpecies(target.speciesId);
        const w = target.weightG || 250;
        const price = calculateFishSellPrice(w, target.speciesId);
        starsEarned = price;
        soldItem = {
          kind: 'fish',
          name: sp?.name || 'Cá',
          asset: sp?.asset || '/assets/fishing/fish_cloud.png',
          subText: `${w}g`,
          starsEarned: price
        };
        if (currentCount <= 1) {
          fishing.basket.splice(idx, 1);
        } else {
          target.count = currentCount - 1;
        }
        fishing.milestones.firstMarketSale = true;
      } else if (itemKind === 'dish') {
        writeCooking = true;
        const dishes = game.cooking?.dishes || [];
        const idx = dishes.findIndex((d) => d.id === itemId);
        if (idx === -1) return { ok: false, reason: 'not_found' };
        const d = dishes[idx];
        const recipe = getRecipe(d.recipeId);
        starsEarned = 3;
        soldItem = {
          kind: 'dish',
          name: recipe?.name || 'Món Ăn',
          asset: recipe?.image || null,
          icon: recipe?.icon || '🍲',
          subText: 'Món ăn',
          starsEarned
        };
        dishes.splice(idx, 1);
      } else if (itemKind === 'ingredient') {
        writeCooking = true;
        if (!game.cooking) game.cooking = {};
        if (!game.cooking.ingredients) game.cooking.ingredients = {};
        const current = game.cooking.ingredients[itemId] || 0;
        if (current <= 0) return { ok: false, reason: 'not_found' };
        const ing = INGREDIENTS.find((i) => i.id === itemId);
        starsEarned = 1;
        soldItem = {
          kind: 'ingredient',
          name: ing?.name || 'Nguyên Liệu',
          asset: ing?.image || null,
          icon: ing?.icon || '🥕',
          subText: '1 phần',
          starsEarned
        };
        game.cooking.ingredients[itemId] = current - 1;
        if (game.cooking.ingredients[itemId] <= 0) {
          delete game.cooking.ingredients[itemId];
        }
      } else if (itemKind === 'backpack') {
        if (!game.backpacks) game.backpacks = { owned: [], equipped: [] };
        const owned = game.backpacks.owned || [];
        const equipped = game.backpacks.equipped || [];
        const ownedCount = owned.filter((id) => id === itemId).length;
        const equippedCount = equipped.filter((id) => id === itemId).length;
        if (ownedCount <= equippedCount) {
          return { ok: false, reason: 'equipped', message: 'Balo đang đeo không thể bán!' };
        }
        const bp = getBackpack(itemId);
        starsEarned = Math.floor((bp?.costStars || 30) * 0.5);
        soldItem = {
          kind: 'backpack',
          name: bp?.name || 'Balo',
          asset: bp?.asset || null,
          icon: bp?.icon || '🎒',
          subText: 'Balo',
          starsEarned
        };
        const idx = owned.indexOf(itemId);
        if (idx !== -1) owned.splice(idx, 1);
      } else if (itemKind === 'accessory') {
        if (!game.fashion) game.fashion = { ownedAccessories: [], equippedAccessoryId: null };
        const ownedAcc = game.fashion.ownedAccessories || [];
        if (itemId === game.fashion.equippedAccessoryId) {
          return { ok: false, reason: 'equipped', message: 'Phụ kiện đang đeo không thể bán!' };
        }
        const idx = ownedAcc.indexOf(itemId);
        if (idx === -1) return { ok: false, reason: 'not_found' };
        const acc = ACCESSORIES_CATALOG[itemId];
        starsEarned = 15;
        soldItem = {
          kind: 'accessory',
          name: acc?.name || 'Phụ kiện',
          asset: acc?.icon || null,
          icon: acc?.badge || '👑',
          subText: 'Phụ kiện',
          starsEarned
        };
        ownedAcc.splice(idx, 1);
      } else {
        return { ok: false, reason: 'unsupported_kind' };
      }

      fishing.shells = Math.min(FISHING_LIMITS.MAX_SHELLS, (fishing.shells || 0) + starsEarned);
      if (game?.player) game.player.stars = fishing.shells;

      return {
        ok: true,
        itemKind,
        soldItem,
        starsEarned,
        shellsEarned: starsEarned,
        writeCooking
      };
    });
  }

  sellFishAtMarket(fishId, sellAll = false) {"""

if method_target in code_norm:
    code_norm = code_norm.replace(method_target, method_code, 1)
    print("2. Added sellItemAtMarket to fishingSystem.js")
else:
    print("ERROR 2: method_target not found")
    exit(1)

with open('src/game/systems/fishingSystem.js', 'w', encoding='utf-8') as f:
    f.write(code_norm)
print("fishingSystem.js updated successfully!")
