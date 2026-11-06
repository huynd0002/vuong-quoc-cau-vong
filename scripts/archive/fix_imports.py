# Sửa import trong fishingSystem.js
with open('src/game/systems/fishingSystem.js', 'r', encoding='utf-8') as f:
    fc = f.read()

fc = fc.replace(
    "import { getRecipe } from '../../content/kitchen/recipesData.js';",
    "import { getRecipe, INGREDIENTS } from '../../content/cooking/recipes.js';"
)
fc = fc.replace(
    "import { INGREDIENTS } from '../../content/kitchen/ingredientsData.js';",
    ""
)
fc = fc.replace(
    "import { ACCESSORIES_CATALOG } from '../../content/fashion/accessoriesData.js';",
    "import { ACCESSORIES_CATALOG } from './fashionSystem.js';"
)

with open('src/game/systems/fishingSystem.js', 'w', encoding='utf-8') as f:
    f.write(fc)
print("Updated fishingSystem.js imports")

# Sửa import trong MarketModal.js
with open('src/game/ui/MarketModal.js', 'r', encoding='utf-8') as f:
    mc = f.read()

mc = mc.replace(
    "import { getRecipe } from '../../content/kitchen/recipesData.js';",
    "import { getRecipe, INGREDIENTS } from '../../content/cooking/recipes.js';"
)
mc = mc.replace(
    "import { INGREDIENTS } from '../../content/kitchen/ingredientsData.js';",
    ""
)
mc = mc.replace(
    "import { ACCESSORIES_CATALOG } from '../../content/fashion/accessoriesData.js';",
    "import { ACCESSORIES_CATALOG } from '../systems/fashionSystem.js';"
)

with open('src/game/ui/MarketModal.js', 'w', encoding='utf-8') as f:
    f.write(mc)
print("Updated MarketModal.js imports")
