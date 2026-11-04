with open('src/game/scenes/PreloadScene.js', 'r', encoding='utf-8') as f:
    content = f.read()

target1 = "import iconShopBackpackUrl from '../../../assets/ui/hud/icon_shop_backpack.png?url';"
replacement1 = target1 + "\nimport butterflyRainbowUrl from '../../../assets/sprites/effects/butterfly_rainbow.png?url';"

target2 = "this.load.image('icon_shop_backpack', iconShopBackpackUrl);"
replacement2 = target2 + "\n    this.load.image('butterfly_rainbow', butterflyRainbowUrl);"

assert target1 in content, f"target1 not found"
assert target2 in content, f"target2 not found"

content = content.replace(target1, replacement1, 1)
content = content.replace(target2, replacement2, 1)

with open('src/game/scenes/PreloadScene.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated PreloadScene.js successfully")
