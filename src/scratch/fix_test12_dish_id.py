with open('src/tests/unit/fishingSystem.test.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("'dish-sell-test'", "'cook-99'")

with open('src/tests/unit/fishingSystem.test.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated dish id to cook-99 in fishingSystem.test.js")
