with open('src/tests/unit/fishingSystem.test.js', 'r', encoding='utf-8') as f:
    test_code = f.read()

test_norm = test_code.replace('\r\n', '\n')

test12_code = """    console.log('✓ Test 11 Passed: Hệ thống Xếp Chồng Cá (3-5-7 con theo loài) & Cá Đặc Biệt Phát Sáng (1 con)');

    // =========================================================================
    // Test 12: Bán tất cả các vật phẩm tại quầy bán cá (Dữ liệu bán rồi mất luôn)
    // =========================================================================
    testFs.mutate((fishing, game) => {
      // 1. Setup giỏ cá
      fishing.basket = [
        { id: 'fish-sell-test', speciesId: 'fish_lotus', weightG: 500, count: 1 }
      ];
      // 2. Setup món ăn trong Bếp
      game.cooking = {
        dishes: [
          { id: 'dish-sell-test', recipeId: 'recipe_fish_soup', quality: 3 }
        ],
        ingredients: {
          banana: 2
        }
      };
      // 3. Setup Balo
      game.backpacks = {
        owned: ['backpack_bunny_pink', 'backpack_bunny_pink'],
        equipped: ['backpack_bunny_pink', null, null, null]
      };
      // 4. Setup Phụ kiện
      game.fashion = {
        ownedAccessories: ['acc_rainbow_crown', 'acc_star_glasses'],
        equippedAccessoryId: 'acc_rainbow_crown'
      };
      fishing.shells = 10;
      game.player.stars = 10;
      return { ok: true };
    });

    // 12.1 Bán Cá
    const sellFishRes = testFs.sellItemAtMarket('fish', 'fish-sell-test');
    assert.equal(sellFishRes.ok, true);
    assert.equal(testFs.getState().basket.some(f => f.id === 'fish-sell-test'), false, 'Cá bán xong phải mất luôn');
    assert.equal(testFs.getStars() > 10, true, 'Sao phải tăng lên sau khi bán cá');

    const starsAfterFish = testFs.getStars();

    // 12.2 Bán Món Ăn
    const sellDishRes = testFs.sellItemAtMarket('dish', 'dish-sell-test');
    assert.equal(sellDishRes.ok, true);
    assert.equal(sellDishRes.starsEarned, 3, 'Món ăn bán được 3 Sao');
    assert.equal(testFs.getStars(), starsAfterFish + 3);
    const gameAfterDish = testFs.loadGame();
    assert.equal(gameAfterDish.cooking.dishes.some(d => d.id === 'dish-sell-test'), false, 'Món ăn bán xong phải mất luôn vĩnh viễn');

    // 12.3 Bán Nguyên Liệu
    const sellIngRes = testFs.sellItemAtMarket('ingredient', 'banana');
    assert.equal(sellIngRes.ok, true);
    assert.equal(sellIngRes.starsEarned, 1, 'Nguyên liệu bán được 1 Sao');
    const gameAfterIng = testFs.loadGame();
    assert.equal(gameAfterIng.cooking.ingredients.banana, 1, 'Chuối từ 2 trừ 1 còn 1');

    // 12.4 Bán Balo trong Túi (chiếc thứ 2 chưa đeo)
    const sellBpRes = testFs.sellItemAtMarket('backpack', 'backpack_bunny_pink');
    assert.equal(sellBpRes.ok, true);
    const gameAfterBp = testFs.loadGame();
    assert.equal(gameAfterBp.backpacks.owned.length, 1, 'Balo đã bán 1 cái chỉ còn 1 cái đang đeo');
    assert.equal(gameAfterBp.backpacks.equipped[0], 'backpack_bunny_pink', 'Balo đang đeo vẫn giữ nguyên');

    // Chặn bán Balo đang đeo
    const failBpRes = testFs.sellItemAtMarket('backpack', 'backpack_bunny_pink');
    assert.equal(failBpRes.ok, false, 'Không thể bán Balo đang đeo');

    // 12.5 Bán Phụ Kiện trong Túi (acc_star_glasses chưa đeo)
    const sellAccRes = testFs.sellItemAtMarket('accessory', 'acc_star_glasses');
    assert.equal(sellAccRes.ok, true);
    const gameAfterAcc = testFs.loadGame();
    assert.equal(gameAfterAcc.fashion.ownedAccessories.includes('acc_star_glasses'), false, 'Kính ngôi sao bán xong mất luôn');

    // Chặn bán Phụ Kiện đang đeo trên người (acc_rainbow_crown)
    const failAccRes = testFs.sellItemAtMarket('accessory', 'acc_rainbow_crown');
    assert.equal(failAccRes.ok, false, 'Không thể bán Phụ kiện đang đeo trên người');

    console.log('✓ Test 12 Passed: Bán tất cả các loại vật phẩm (Cá, Món ăn, Nguyên liệu, Balo, Phụ kiện) - Dữ liệu bán rồi mất luôn vĩnh viễn!');
"""

old_anchor = "    console.log('✓ Test 11 Passed: Hệ thống Xếp Chồng Cá (3-5-7 con theo loài) & Cá Đặc Biệt Phát Sáng (1 con)');"
if old_anchor in test_norm:
    test_norm = test_norm.replace(old_anchor, test12_code, 1)
    with open('src/tests/unit/fishingSystem.test.js', 'w', encoding='utf-8') as f:
        f.write(test_norm)
    print("Added Test 12 to fishingSystem.test.js successfully")
else:
    print("ERROR: old_anchor not found")
    exit(1)
