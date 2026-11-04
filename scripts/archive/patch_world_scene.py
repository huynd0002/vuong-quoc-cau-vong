with open('src/game/scenes/WorldScene.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Butterfly import
import_target = "import { PropEntity } from '../entities/PropEntity.js';"
import_replacement = import_target + "\nimport { Butterfly } from '../entities/Butterfly.js';"
assert import_target in content, "import_target not found"
content = content.replace(import_target, import_replacement, 1)

# 2. Add butterfly cleanup in shutdown
shutdown_target = "if (this.lakeWaterEffect) {\n        this.lakeWaterEffect.destroy();\n        this.lakeWaterEffect = null;\n      }"
if shutdown_target not in content:
    shutdown_target = "if (this.lakeWaterEffect) {\r\n        this.lakeWaterEffect.destroy();\r\n        this.lakeWaterEffect = null;\r\n      }"
assert shutdown_target in content, "shutdown_target not found"

shutdown_replacement = shutdown_target + """
      if (Array.isArray(this.butterflies)) {
        this.butterflies.forEach(b => {
          if (b && typeof b.destroy === 'function') b.destroy();
        });
        this.butterflies = [];
      }"""
content = content.replace(shutdown_target, shutdown_replacement, 1)

# 3. Replace createProps call and createAmbientButterflies
old_butterflies_target = """  createProps(mapConfig) {
    this.propsList = [];
    if (Array.isArray(mapConfig.props) && mapConfig.props.length > 0) {
      mapConfig.props.forEach((propConfig) => {
        if (this.textures.exists(propConfig.type)) {
          const prop = new PropEntity(this, propConfig);
          this.propsList.push(prop);
        }
      });
    }

    this.createAmbientButterflies();
  }

  createAmbientButterflies() {
    this.butterflies = [];
    const pts = [
      { x: 290, y: 390 },
      { x: 490, y: 380 },
      { x: 910, y: 410 }
    ];

    pts.forEach((pt, idx) => {
      const bText = this.add.text(pt.x, pt.y, '🦋', { fontSize: '20px' })
        .setOrigin(0.5)
        .setDepth(6);

      this.tweens.add({
        targets: bText,
        x: pt.x + (idx % 2 ? 35 : -35),
        y: pt.y - 18,
        scaleX: idx % 2 ? -1 : 1,
        duration: 1800 + idx * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.butterflies.push(bText);
    });
  }"""

# Normalize CRLF / LF for matching
old_norm = old_butterflies_target.replace('\r\n', '\n')
content_norm = content.replace('\r\n', '\n')
assert old_norm in content_norm, "old_norm not found in content_norm"

new_butterflies = """  createProps(mapConfig) {
    this.propsList = [];
    if (Array.isArray(mapConfig.props) && mapConfig.props.length > 0) {
      mapConfig.props.forEach((propConfig) => {
        if (this.textures.exists(propConfig.type)) {
          const prop = new PropEntity(this, propConfig);
          this.propsList.push(prop);
        }
      });
    }

    this.createRandomButterflies(mapConfig);
  }

  createRandomButterflies(mapConfig) {
    // Dọn dẹp bướm cũ nếu có
    if (Array.isArray(this.butterflies)) {
      this.butterflies.forEach(b => {
        if (b && typeof b.destroy === 'function') b.destroy();
      });
    }
    this.butterflies = [];

    // Chỉ xuất hiện random ở các maps quái (có encounters)
    // Tuyệt đối không xuất hiện ở map_pet_farm hoặc map_kitchen
    const isMonsterMap = this.currentMapId !== 'map_pet_farm' &&
      this.currentMapId !== 'map_kitchen' &&
      Array.isArray(mapConfig?.encounters) &&
      mapConfig.encounters.length > 0;

    if (!isMonsterMap) return;

    // Số lượng bướm ngẫu nhiên (2 - 4 con)
    const count = Phaser.Math.Between(2, 4);
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(160, 1120);
      const y = Phaser.Math.Between(180, 560);
      const butterfly = new Butterfly(this, x, y);
      this.butterflies.push(butterfly);
    }
  }"""

content_norm = content_norm.replace(old_norm, new_butterflies, 1)

# 4. Add butterfly update in update(time, delta)
update_target = "  update(time, delta) {\n    if (!this.isExploring || !this.hero?.sprite?.active) return;"
assert update_target in content_norm, "update_target not found"
update_replacement = """  update(time, delta) {
    if (Array.isArray(this.butterflies) && this.butterflies.length > 0) {
      for (let i = 0; i < this.butterflies.length; i++) {
        const b = this.butterflies[i];
        if (b && typeof b.update === 'function') {
          b.update(time, delta);
        }
      }
    }
    if (!this.isExploring || !this.hero?.sprite?.active) return;"""

content_norm = content_norm.replace(update_target, update_replacement, 1)

with open('src/game/scenes/WorldScene.js', 'w', encoding='utf-8') as f:
    f.write(content_norm)

print("Updated WorldScene.js successfully!")
