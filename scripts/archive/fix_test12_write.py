with open('src/tests/unit/fishingSystem.test.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    """      fishing.shells = 10;
      game.player.stars = 10;
      return { ok: true };
    });""",
    """      fishing.shells = 10;
      game.player.stars = 10;
      return { ok: true, writeCooking: true };
    });"""
)

with open('src/tests/unit/fishingSystem.test.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated return { ok: true, writeCooking: true }")
