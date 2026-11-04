with open('src/game/scenes/PreloadScene.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_import = "import bobberFloat3dUrl from '../../../assets/fishing/bobber_float_3d.png?url';"
new_import = """import bobberFloat3dUrl from '../../../assets/fishing/bobber_float_3d.png?url';
import rodLotusHeldUrl from '../../../assets/fishing/rod_lotus_held.png?url';
import rodDuckHeldUrl from '../../../assets/fishing/rod_duck_held.png?url';
import rodOceanStarHeldUrl from '../../../assets/fishing/rod_ocean_star_held.png?url';
import rodRainbowHeldUrl from '../../../assets/fishing/rod_rainbow_held.png?url';
import rodDragonHeldUrl from '../../../assets/fishing/rod_dragon_held.png?url';"""

assert old_import in content, 'old_import not found'
content = content.replace(old_import, new_import, 1)

old_load = "    this.load.image('bobber_float_3d', bobberFloat3dUrl);"
new_load = """    this.load.image('bobber_float_3d', bobberFloat3dUrl);
    this.load.image('rod_lotus_held', rodLotusHeldUrl);
    this.load.image('rod_duck_held', rodDuckHeldUrl);
    this.load.image('rod_ocean_star_held', rodOceanStarHeldUrl);
    this.load.image('rod_rainbow_held', rodRainbowHeldUrl);
    this.load.image('rod_dragon_held', rodDragonHeldUrl);"""

assert old_load in content, 'old_load not found'
content = content.replace(old_load, new_load, 1)

with open('src/game/scenes/PreloadScene.js', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print('PreloadScene patched successfully!')
