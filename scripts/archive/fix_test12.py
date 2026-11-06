with open('src/tests/unit/fishingSystem.test.js', 'r', encoding='utf-8') as f:
    t = f.read()

t = t.replace(
    "{ id: 'fish-sell-test', speciesId: 'fish_lotus', weightG: 500, count: 1 }",
    "{ id: 'fish-sell-test', speciesId: 'cloud_fish', weightG: 200, count: 1 }"
)
t = t.replace(
    "{ id: 'dish-sell-test', recipeId: 'recipe_fish_soup', quality: 3 }",
    "{ id: 'dish-sell-test', recipeId: 'rainbow_sandwich', quality: 3 }"
)

with open('src/tests/unit/fishingSystem.test.js', 'w', encoding='utf-8') as f:
    f.write(t)

print("Updated fishingSystem.test.js with valid speciesId and recipeId")
