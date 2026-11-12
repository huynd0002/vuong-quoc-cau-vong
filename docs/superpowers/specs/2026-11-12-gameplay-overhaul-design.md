# Thiết Kế Tổng Thể: Nâng Cấp Trải Nghiệm, Hiệu Năng, Nội Dung & PixelFX (8 Hạng Mục)

**Ngày:** 2026-11-12  
**Phân loại Brainstorming:** **Architectural** (Tác động xuyên suốt 8 phân hệ cốt lõi: vòng đời scene/chiến đấu, ngân hàng câu hỏi & quái, CSS sàn đấu Game nối, điều khiển chạm iPad, vùng chọn & nút `E`, cơ chế tương tác bắt buộc ấn `E`, pipeline chuyển cảnh + loading, và pipeline tài nguyên PixelFX).

---

## 1. Bối Cảnh & Bằng Chứng Chẩn Đoán Thực Tế (Phase 1)

Kết quả đo trực tiếp bằng Playwright trên mã nguồn hiện tại (`src/`) ở 3 kích thước màn hình (`desktop 1280x720`, `iPad 1024x768`, `iPad Safari 1024x640`):

1. **Đơ / Giật / Đứng im khi vượt ải (Mục 1):**
   - **Sụt FPS nghiêm trọng lúc thắng Boss:** Lúc hạ Boss trên `map1`, hiệu ứng [`FireworkCelebrationEffect`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/effects/FireworkCelebrationEffect.js) chạy vòng lặp vẽ từng pixel CPU (`640x360` `putImageData` ở 60fps) song song với [`Boss.playRescueAnimation`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/entities/Boss.js), rung camera và decode spritesheet nặng khiến FPS tụt từ **60.9 FPS** xuống **21.5 FPS** (`avgDeltaMs: 46.5ms`, 12 khung hình `>50ms`).
   - **Kẹt trạng thái & Rò rỉ timer:** [`BattleArenaModal`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/BattleArenaModal.js) dùng chuỗi `setTimeout` lồng nhau (`40ms -> 420ms -> 550ms -> 600ms`) không có registry hủy khi đóng sớm; [`openMazeChallengeForTurn`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/BattleArenaModal.js#L2417-L2442) mở khóa `isTurnLocked = false` *trước* khi quái phản công; [`WorldScene.shutdown`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/scenes/WorldScene.js#L616-L722) chưa hủy dứt điểm entity/timer (`monsters`, `boss`, `pet`, `hero`, `portals`, `kitchenSteamTimers`) và thiếu watchdog khôi phục `isExploring`.
2. **Nội dung vượt ải lặp lại quá nhiều (Mục 2):**
   - [`QUESTION_BANK`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/content/questions/questionBank.js) mới có **148 câu** (`map1`: 28, `map2`: 27, `map3`: 23, `map4`: 27, `map5`: 22, `map6`: 20). Với quái 3–5 tim và Boss 6–10 tim, câu hỏi cạn rất nhanh.
   - [`MAPS_CONFIG`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/content/maps/mapsConfig.js) ở `map5` và `map6` chỉ có **2 quái** đều dùng chung `mon_sprout`.
3. **Game nối che khung Chiến đấu (Mục 3):**
   - Đo thực tế khi [`renderPairMatching`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/BattleArenaModal.js#L1755-L2006) mở: `.arena-bottom-dialog` cao tới **436px** (tràn khỏi viewport `720px` và `640px`), ép `.arena-fighters-stage` xuống `min-height: 160px`, khiến **Hero bị che mất 20–27px** và **Quái bị che mất 39px** trên cả 3 độ phân giải.
4. **Di chuyển trên iPad (Mục 4):**
   - [`main.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/app/main.js#L1079-L1124) đang **bật mặc định** Cần gạt ảo (`joystickEnabled = true`), chiếm góc chạm trái dưới; thao tác **chạm giữ / kéo ngón tay** trên sân chơi để nhân vật đi theo mượt chưa được tối ưu và dễ bị các `touchZone` lớn của trạm chặn mất.
5. **Vùng chọn nhỏ & Nút `E` rườm rà (Mục 5):**
   - [`updateProximityInteractionE`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/scenes/WorldScene.js#L3810-L3940) khóa trần `minDistance = 75` khiến các vùng bán kính lớn hơn (`80–90px`) không được ưu tiên, cổng bị kẹt ở `<= 70px` (tại `65px` có trường hợp không kịp hiện `E`); nút `#btn-interactive-e` đang hiện cả `E + ⚡ + chữ mô tả`.
6. **Tự động chuyển vùng không cần ấn `E` (Mục 6):**
   - [`TeleportPortal.update`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/entities/TeleportPortal.js#L189-L199) tự dịch chuyển ngay khi `dist < 32px` (đã tái hiện `warpOverlayShown: true` ở `20px` mà không hề bấm `E`).
   - [`WorldScene`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/scenes/WorldScene.js#L2120-L2127) tự bật modal Bếp ở `<= 45px` (đã tái hiện `stationModalOpen: true`), và tự khóa câu cá ở Cầu tàu [`updateDockFishingAutoFlow`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/scenes/WorldScene.js#L3702-L3758) ở `<= 48px`.
7. **Thiếu chuyển cảnh & loading khi đổi map (Mục 7):**
   - [`MapLoadingOverlay`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/MapLoadingOverlay.js) đã bị vô hiệu hóa thành no-op. Các đường đổi map qua `travelToZone`, `enterKitchenMapDirect`, `returnFarmMapDirect`, và quay về từ thua trận nhảy thẳng `scene.restart` không có chuyển cảnh lẫn màn hình loading. Trong khi [`MapTransitionOverlay`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/MapTransitionOverlay.js) chỉ chạy ở cổng và mất 4.6 giây với `setTimeout` không hủy được.
8. **Chưa tận dụng hết bộ `pixelfx-repo` (Mục 8):**
   - Toàn game mới dùng 9 spritesheet VFX và 1 hiệu ứng pháo hoa CPU, trong khi `pixelfx-repo/src/fx/` có sẵn hơn 200 hiệu ứng rất phù hợp cho điểm chạm, chiến thắng vượt ải, đòn đánh, chuyển cảnh và lên cấp.

---

## 2. Lựa Chọn Kiến Trúc & Trade-Offs

### Phương án 1: Vá rời rạc từng file CSS/JS (Không chọn)
- Giảm `min-height` trong `game.css`, thêm `if` chặn auto-portal, giữ `FireworkCelebrationEffect` CPU và chỉ sửa lẻ các đường gọi `scene.restart`.
- **Nhược điểm:** Dễ tái phát lỗi đứng hình vì thiếu cơ chế quản lý session/timer tập trung; các đường chuyển map vẫn phân mảnh giữa `MapSelect`, `Kitchen`, `Portal`.

### Phương án 2 (Được chọn): Nâng cấp Kiến trúc Thống nhất Giữ Nguyên Phaser `CANVAS` + Hợp đồng Dữ liệu
- Giữ nguyên renderer `Phaser.CANVAS` (đảm bảo ổn định tuyệt đối trên iPad Safari không mất WebGL context) và giữ toàn bộ các `id`/schema cốt lõi để tương thích tối đa hệ thống unit test hiện có.
- Thiết kế lại sạch theo **8 luồng tích hợp chặt chẽ**:
  1. Quản lý vòng đời chiến đấu/scene theo `sessionToken` + loại bỏ render per-pixel 60fps trên CPU.
  2. Nhân đôi (`>= 2.2x`) ngân hàng câu hỏi đa chủ đề tận dụng kho ảnh & bóng mờ có sẵn + đa dạng hóa quái/vòng chơi từng map.
  3. Layout CSS/Flex chuyên biệt cho chế độ Game nối đảm bảo `0px` che khuất nhân vật và quái ở mọi viewport.
  4. Cơ chế chạm & giữ/kéo iPad làm điều khiển chính, Cần gạt ảo mặc định TẮT (vẫn giữ nút bật lại trên HUD).
  5. Vùng phát hiện lớn (`~125–145px`), nút `#btn-interactive-e` tối giản thành **1 chữ `E` to nổi bật**.
  6. Loại bỏ toàn bộ tự động chuyển vùng/mở trạm — chạm từ xa chỉ dẫn Bé Sâu đi tới vùng `E`, bắt buộc bấm `E` hoặc chạm nút `E`.
  7. Tạo bộ điều phối `Transition + Loading` đồng nhất (`~1.0–1.5s`, chờ `game:map-ready`) cho **mọi** điểm chuyển map.
  8. Xuất thêm bộ spritesheet PixelFX nhẹ gọn từ `pixelfx-repo` cho điểm chạm, vượt ải, chiến đấu và chuyển cảnh.

---

## 3. Thiết Kế Chi Tiết Từng Hạng Mục

### Hạng mục 1: Khắc Phục Đơ, Lag, Đứng Im Khi Vượt Ải
1. **Thay thế / tối ưu hiệu ứng CPU nặng:**
   - Trong [`FireworkCelebrationEffect.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/effects/FireworkCelebrationEffect.js): Chuyển từ vẽ từng pixel CPU `640x360` `putImageData` ở 60fps sang kết hợp **spritesheet PixelFX nhẹ (`vfx_firework_burst`, `vfx_confetti`, `vfx_quest_complete`)** chạy trực tiếp trên Canvas2D / DOM overlay tối ưu (nếu giữ fallback particle chỉ dùng `fillRect` vector đơn giản tối đa 30fps trên canvas nhỏ, tuyệt đối không gọi `createImageData/putImageData` 60fps).
   - Loại bỏ `playGlitchWipeTransition()` (`320x180` 55 frames phóng to 4x mỗi lần vào map) trong `WorldScene.create()` và thay bằng bộ chuyển cảnh đồng nhất ở Hạng mục 7.
2. **Bảo vệ vòng đời Timer & Trạng thái [`BattleArenaModal`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/BattleArenaModal.js):**
   - Thêm `this._battleSessionId` (tăng mỗi lần `openArena` / `closeArena`) và `this._pendingTimeouts = new Set()` + helper `this.scheduleTimer(fn, ms)` & `this.clearAllTimers()`.
   - Mọi callback trễ trong `executeHeroAttack`, `executeMonsterAttack`, `executeMonsterImpact`, `handleVictory`, `showDefeatModal`, `setupTurn` phải kiểm tra `if (sessionId !== this._battleSessionId || this.arenaModal?.hidden) return;`.
   - Sửa lỗi race ở `openMazeChallengeForTurn`: không mở `isTurnLocked = false` trước khi gọi `executeMonsterAttack()`; giao quyền mở khóa cho `setupTurn()` hoặc nhánh `finally` an toàn khi không thể đánh tiếp.
   - Mọi handler tương tác (`handleAnswer`, `renderPairMatching`, `renderMemoryMatch`, `renderDragSort`) có bảo vệ `try / catch / finally` để không bao giờ kẹt `isTurnLocked = true` nếu có lỗi runtime bất ngờ.
3. **Dọn dẹp sạch [`WorldScene.shutdown`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/scenes/WorldScene.js#L616-L722) & Watchdog:**
   - Hủy toàn bộ `monsters`, `boss`, `pet`, `hero`, `portals`, `propsList`, `propsPuzzle`, `butterflies`, `kitchenSteamTimers`, `time.removeAllEvents()`, `tweens.killAll()`, và tất cả `window`/`setTimeout` handle thuộc `WorldScene`.
   - Bổ sung watchdog trong `WorldScene.update()`: nếu `!this.isExploring` nhưng không có bất kỳ modal nào đang mở và không đang chạy transition/warp, tự động khôi phục `this.isExploring = true`.

### Hạng mục 2: Nhân Đôi & Làm Phong Phú Nội Dung Vượt Ải (>= 2x)
1. **Mở rộng [`questionBank.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/content/questions/questionBank.js) từ 148 lên >= 330 câu hỏi hợp lệ:**
   - Mỗi map (`map1` đến `map6`) đạt **>= 54 câu hỏi** (tăng > 2.2x ở mọi map, riêng `map5`/`map6` tăng từ 20–22 lên ~54 câu), toàn bộ qua `validateQuestionBank` và giữ nguyên 100% ID cũ để bảo toàn tương thích unit tests.
   - Bổ sung đa dạng hình thức sử dụng toàn bộ ảnh & ảnh bóng mờ có sẵn trong `assets/edu/` (`animals`, `fruits`, `toys`, `shapes`, `colors`, `matching`, `puzzles`):
     - *Trắc nghiệm thị giác & âm thanh:* Đếm vật, nhận diện hình/màu, ghép chữ cái đầu, tìm vật khác loại, ghép bóng mờ (`*_shadow.png`), cộng trừ có hình minh họa, đọc giờ/mùa/thời tiết, từ vựng tiếng Anh/tiếng Việt cơ bản phù hợp từng vùng.
     - *`pair_matching` (Nối cặp hình):* Nối con vật–bóng mờ, đồ vật–công dụng, trái cây–mảnh ghép/nửa hình, cặp bạn thân.
     - *`memory_match` (Lật thẻ trí nhớ):* Nhiều chủ đề mới (trái cây, đồ chơi, động vật biển, hình học, trang trại).
     - *`drag_sort` (Sắp xếp thứ tự):* Tăng dần theo số lượng, kích thước, bảng chữ cái, chu trình sinh trưởng/ngày đêm, dãy số cấp 1 theo cấp độ từng vùng.
2. **Đa dạng hóa Encounter & Quay vòng Vượt ải trong [`mapsConfig.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/content/maps/mapsConfig.js) & [`BattleArenaModal.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/BattleArenaModal.js):**
   - Giữ nguyên toàn bộ encounter ID cũ và `propsPuzzle.requiredRescues` (để không phá hợp đồng unit tests), đồng thời bổ sung encounter thứ 3 cho `map5` (`enc_map5_3`) và `map6` (`enc_map6_3`), thay thế việc `map5`/`map6` cùng dùng lặp lại `mon_sprout` bằng các sprite quái phong phú sẵn có (`mon_crystal_moth`, `mon_scarab`, `mon_desert_falcon`, `mon_starfish`, `mon_crab` kèm biến thể tên/kỹ năng đặc trưng từng vùng).
   - Mỗi encounter/boss gắn `questionPool` phong phú + cơ chế [`getEncounterQuestions`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/BattleArenaModal.js#L1079-L1225) nới rộng bộ nhớ lịch sử `MAX_SESSION_HISTORY` từ 18 lên **45 câu** và ưu tiên trộn xen kẽ đa dạng dạng bài (`multiple_choice`, `pair_matching`, `memory_match`, `drag_sort`) cùng mini-game `audition`/`maze` để hai lần chạm trán hiếm khi lặp kịch bản.

### Hạng mục 3: Thu Gọn & Cân Đối Khung Game Nối Không Che Nhân Vật ([`game.css`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/styles/game.css), [`BattleArenaModal.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/BattleArenaModal.js))
- Khi [`renderPairMatching`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/BattleArenaModal.js#L1755-L2006) chạy, gắn class trạng thái `.is-pair-matching` lên `#battle-arena-modal` (và gỡ bỏ ngay ở `setupTurn` cho các dạng khác hoặc `closeArena`).
- Tối ưu bố cục dọc toàn thẻ `.battle-arena-card` sao cho cả trên `1280x720`, `1024x768`, và `1024x640`:
  - `.battle-arena-card`: `max-height: calc(100vh - 14px); display: flex; flex-direction: column; overflow: hidden;`
  - `.arena-fighters-stage`: giữ không gian an toàn phía trên (không bị ép đè lên ảnh nhân vật/quái), cân chỉnh kích thước hiển thị nhân vật/quái khi `.is-pair-matching` để `heroImg.bottom <= bottomDialog.top` và `monsterImg.bottom <= bottomDialog.top` (độ che phủ `= 0px`).
  - `.arena-bottom-dialog` trong `.is-pair-matching`: thu gọn padding, banner hướng dẫn 1 dòng gọn, `.pair-column` (`gap: 6px`), `.pair-item-btn` (`min-height: 46px–50px`, responsive xuống `42px` nếu viewport `max-height <= 680px`), `.pair-item-img` (`44px–52px`), `.pair-giant-emoji` (`32px–36px`) — **vẫn giữ hình ảnh rõ nét và không có chữ nhãn tiếng Việt dưới thẻ ảnh** để giữ nguyên hợp đồng cho trẻ em & unit tests.
  - Tự động vẽ lại đường nối SVG qua `ResizeObserver` / `requestAnimationFrame` sau khi thu gọn layout để dây nối luôn trúng tâm ô.

### Hạng mục 4: Cải Thiện Điều Khiển Chạm Trên iPad & Tắt Cần Gạt Ảo Mặc Định ([`main.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/app/main.js), [`WorldScene.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/scenes/WorldScene.js))
- **Mặc định TẮT Cần gạt ảo khi vào game:** Trong `main.js`, khởi tạo `joystickEnabled = localStorage.getItem('rk_joystick_enabled') === 'true'` (mặc định `false`), ẩn `#virtual-joystick-zone` và cập nhật nhãn nút HUD `#btn-toggle-joystick` thành `Cần Gạt: Tắt`. Người chơi vẫn có thể bấm nút để bật lại bất cứ lúc nào; `VirtualJoystick` class giữ nguyên `this.enabled = true` mặc định để bảo toàn unit tests.
- **Tối ưu chạm & giữ/kéo để đi trên iPad (`WorldScene`):**
  - Hỗ trợ đầy đủ cả **chạm đơn (tap-to-move)** lẫn **chạm giữ và kéo ngón tay (touch-hold/drag follow)**: khi `pointer.isDown` trượt trên sân chơi, cập nhật liên tục mục tiêu `hero.moveTo(x, y)` (throttle mỗi ~55ms) để Bé Sâu bám mượt theo ngón tay trên iPad.
  - Khi người chơi chạm trên sân chơi gần các trạm lớn (Bếp, Chợ, Thời trang, Bến câu) hoặc Cổng từ xa: tránh để `touchZone` khổng lồ vô tình nuốt hết thao tác muốn đi qua; chạm từ xa chỉ dẫn Bé Sâu đi tới gần đối tượng rồi dừng lại chờ bấm `E`.
  - Hiển thị **hiệu ứng PixelFX điểm chạm** ngay tại tọa độ chạm đất và vệt nhỏ nhẹ nhàng khi kéo.

### Hạng mục 5: Mở Rộng Vùng Chọn & Tối Giản Nút `E` To Rõ ([`WorldScene.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/scenes/WorldScene.js), [`index.html`](file:///c:/Users/Admin/Desktop/GAME_HỌC/index.html), [`game.css`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/styles/game.css))
- **Sửa lỗi & tăng bán kính vùng tương tác:** Trong `updateProximityInteractionE()`, thay biến khóa trần `let minDistance = 75` bằng chiến lược chọn mục tiêu nằm trong vùng riêng của từng đối tượng (`INTERACTION_RADIUS = 125–145px` cho Cổng dịch chuyển, Trạm Bếp, Trạm Nông trại, Cầu tàu câu cá, Quầy Chợ/Thời trang, `PropsPuzzle`, và cả Quái/Boss khi ở gần) và ưu tiên đối tượng gần nhân vật nhất.
- **Tối giản UI nút `#btn-interactive-e`:** Loại bỏ icon tia chớp và dòng chữ phụ rườm rà trong nút tương tác, chỉ hiển thị **một nút tròn/badge với 1 chữ `E` thật to, rõ, dễ chạm trên iPad** (`min-width: 74px`, `min-height: 74px`, font `E` lớn `34–38px`, viền phát sáng và nhịp nhún nhẹ). Đặt vị trí nút thuận tiện vùng ngón tay cái bên phải hoặc ngay trên đối tượng/góc dưới phải không che tầm nhìn nhân vật.

### Hạng mục 6: Bắt Buộc Ấn `E` — Không Tự Động Chuyển Vùng Hay Tự Mở Trạm ([`TeleportPortal.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/entities/TeleportPortal.js), [`WorldScene.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/scenes/WorldScene.js))
- **Cổng dịch chuyển ([`TeleportPortal.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/entities/TeleportPortal.js)):**
  - Gỡ bỏ đoạn tự động gọi `this.enterPortal()` khi `dist < 32` trong `update(heroX, heroY)`.
  - Sửa `handleInteract()`: khi người chơi click/chạm trực tiếp vào cổng, nếu ở xa (`> 125px`), chỉ điều khiển Bé Sâu đi tới gần cổng (khoảng cách `~60px`) rồi dừng lại để hiện nút **`E`** to; **không** tự dịch chuyển kể cả khi đã đứng sát cổng — chỉ chuyển map khi người chơi nhấn phím `E` hoặc chạm nút `#btn-interactive-e`.
- **Trạm Bếp (`map_kitchen`) & Bến Câu (`map_fishing_pond`):**
  - Gỡ bỏ logic tự mở `pantry` / `prep` khi đi vào bán kính `<= 45px` trong `WorldScene.update()`.
  - Gỡ bỏ logic tự khóa nhân vật và tự bật cần câu khi bước vào Cầu tàu (`<= 48px`) trong `updateDockFishingAutoFlow()`. Đi tới Cầu tàu chỉ hiện nút **`E`**, bấm `E` (hoặc nút `E`) mới vào trạng thái câu cá; người chơi vẫn có thể bỏ câu bằng `Esc` hoặc di chuyển ra xa.
- Tương tự áp dụng thống nhất cho Trạm Chăm Thú, Quầy Chợ, Quầy Thời Trang và Câu đố Cổng Hoa (`PropsPuzzle`): chạm từ xa đi tới -> hiện **`E`** -> bấm **`E`** mới kích hoạt. (Quái vật/Boss vẫn giữ kích hoạt chiến đấu an toàn khi tương tác hoặc qua nút `E` khi đứng gần).

### Hạng mục 7: Rà Soát & Thống Nhất Chuyển Cảnh + Loading Cho Mọi Lần Đổi Map
- Hợp nhất [`MapLoadingOverlay.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/MapLoadingOverlay.js) và [`MapTransitionOverlay.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/MapTransitionOverlay.js) thành một luồng điều phối chuyển map chuẩn dùng chung cho **tất cả 100% đường chuyển map**:
  1. Cổng dịch chuyển (`game:portal-warp-start`)
  2. Bảng Chọn Bản Đồ (`travelToZone`)
  3. Vào Bếp / Quay về Nông Trại (`enterKitchenMapDirect`, `returnFarmMapDirect`)
  4. Hồi sinh về Nông Trại sau khi thua (`showDefeatModal`)
- **Luồng chuẩn (~1.0–1.5s, không bao giờ kẹt):**
  1. Khóa di chuyển (`isExploring = false`), dọn trạng thái/timer cũ và đóng mọi modal phụ.
  2. **Chuyển cảnh Đóng (Transition In, ~300–350ms):** Hiệu ứng màn trập cầu vồng / PixelFX iris wipe thu vào mượt mà.
  3. **Màn hình Loading Map:** Hiện `#map-loading-overlay` với tên map đích, biểu tượng/mẹo nhỏ sinh động và thanh tiến trình cầu vồng.
  4. Gọi `worldScene.scene.restart({ mapId })`, **đợi sự kiện `game:map-ready` thực sự** (kèm watchdog tối đa 5000ms đề phòng treo), giữ tối thiểu ~300ms để không bị chớp giật.
  5. **Chuyển cảnh Mở (Transition Out, ~300–350ms):** Ẩn loading, mở màn trập ra vào map mới + phát PixelFX xuất hiện nhân vật (`spawn` / ánh sao), trả `isExploring = true`.
- Mọi timer trong bộ điều phối chuyển cảnh được lưu và hủy an toàn nếu có yêu cầu mới, tránh tuyệt đối kẹt overlay hay `isExploring = false`.

### Hạng mục 8: Tích Hợp Thêm Bộ Hiệu Ứng `pixelfx-repo` Vào Trải Nghiệm Chơi
- Tạo script [`scripts/export_gameplay_pixelfx.mjs`](file:///c:/Users/Admin/Desktop/GAME_HỌC/scripts/export_gameplay_pixelfx.mjs) sử dụng engine `pixelfx-repo` để xuất thêm các spritesheet nhẹ gọn (giới hạn kích thước frame hợp lý & copy đồng bộ vào `assets/vfx/` và `public/assets/vfx/`), nạp sẵn trong [`PreloadScene.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/scenes/PreloadScene.js):
  1. `vfx_tap_ripple` (`water/ripples`): Hiện sóng gợn lấp lánh ngay tại điểm chạm di chuyển trên mặt đất (thay thế vòng tròn đơn điệu trong `showTouchRipple`).
  2. `vfx_collect_burst` (`pickups/collect-burst`): Tỏa sáng khi nhặt thưởng, hoàn thành bước câu đố hoặc chạm đích kéo thả.
  3. `vfx_stage_clear` (`ui/quest-complete` & `ui/confetti`): Bung pháo giấy và huy hiệu hoàn thành khi thắng quái, giải cứu bạn hoặc qua màn Boss (thay thế vòng lặp pixel CPU gây lag).
  4. `vfx_firework_burst` (`explosions/firework-burst`): Đợt pháo hoa pixel mượt mà lúc thắng Boss.
  5. `vfx_hit_spark` & `vfx_crit_hit` (`impacts/hit-spark` & `impacts/crit-hit`): Tia sáng va chạm đòn đánh câu trả lời đúng trong Sàn Đấu (hỗ trợ phát bằng canvas/CSS spritesheet trên DOM arena).
  6. `vfx_poof` (`spawn/poof`) & `vfx_level_up` (`ui/level-up`): Khói phép khi quái hóa bạn nhỏ đáng yêu / mở khóa cổng / thăng cấp nhân vật.
  7. `vfx_portal_warp` (`arcane/portal` hoặc `transitions/star-iris`): Hiệu ứng vòng xoáy/chuyển cảnh nhẹ phục vụ cổng & màn trập đổi map.

---

## 4. Kế Hoạch Kiểm Chứng (Verification Plan)

1. **Unit Tests (`npm run test:unit`):**
   - Kiểm tra `schemaValidator.test.js` xác thực **>= 330 câu hỏi** mới đều `valid === true`, `zoneContent6Zones.test.js` và `zone1Content.test.js` xanh 100%, `virtualJoystick.test.js` xanh 100%.
   - Bổ sung unit test cho anti-repeat question pool >= 2x và rule không tự chuyển vùng.
2. **Kiểm Tra Playwright End-to-End (Desktop `1280x720`, iPad `1024x768`, iPad Safari `1024x640`):**
   - Đo FPS suốt quá trình chơi `map1` -> thắng 3 quái -> thắng Boss -> nổ pháo hoa PixelFX: FPS giữ ổn định cao, `0` frame đơ `>250ms`, `0` kẹt `isTurnLocked` hoặc `isExploring = false`.
   - Kiểm tra `Pair Matching`: `heroCoveredByBottom === 0`, `monsterCoveredByBottom === 0`, không tràn card ở cả 3 độ phân giải, giữ ảnh sạch không nhãn chữ.
   - Kiểm tra iPad: Joystick mặc định ẩn, chạm & giữ/kéo ngón tay di chuyển mượt kèm `vfx_tap_ripple`.
   - Kiểm tra nút `E`: Xuất hiện rõ với **chỉ 1 chữ `E` to** trong bán kính `~125–145px`; đứng sát cổng `15px` hoặc bếp/cầu tàu **không** tự chuyển map hay mở modal; bấm `E` / chạm nút `E` mới chuyển.
   - Kiểm tra chuyển map qua **tất cả các lối** (`Cổng`, `Bản đồ nhanh`, `Vào Bếp`, `Về Nông Trại`, `Thua về thành`) đều hiển thị Chuyển cảnh + Loading và kết thúc vào cảnh sẵn sàng với `0` lỗi console/pageerror.
3. **Build & Regression Suite:**
   - Cập nhật đồng bộ các browser regression test cũ nào khẳng định hành vi cũ nay đã đổi có chủ đích (ví dụ bỏ auto-enter cổng hoặc khôi phục `MapLoadingOverlay`) nếu cần, chạy `npm run build` và `npm test`.
