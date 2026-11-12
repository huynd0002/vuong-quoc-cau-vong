# Kế Hoạch Triển Khai: Nâng Cấp Toàn Diện 8 Hạng Mục

**Tham chiếu thiết kế:** [2026-11-12-gameplay-overhaul-design.md](file:///c:/Users/Admin/Desktop/GAME_HỌC/docs/superpowers/specs/2026-11-12-gameplay-overhaul-design.md)  
**Mục tiêu:** Sửa triệt để đơ/lag/đứng hình, tăng $\ge$ 2x nội dung từng map, thu gọn Game nối hết che khung chiến đấu, tối ưu chạm iPad & tắt Joystick mặc định, tăng vùng chọn với nút `E` to đơn giản, bỏ tự động chuyển vùng bắt buộc ấn `E`, đồng bộ chuyển cảnh + loading cho mọi lần đổi map, và mở rộng hiệu ứng từ `pixelfx-repo`.

---

## Task 1: Xuất & Nạp Bộ Hiệu Ứng `pixelfx-repo` Nhẹ Gọn (Hạng mục 8 & nền tảng cho Hạng mục 1, 4, 7)
**Tệp liên quan:**
- Tạo: `scripts/export_gameplay_pixelfx.mjs`
- Tạo tài nguyên: `assets/vfx/*.png|json` và `public/assets/vfx/*.png|json` (`vfx_tap_ripple`, `vfx_stage_clear`, `vfx_firework_burst`, `vfx_hit_spark`, `vfx_crit_hit`, `vfx_poof`, `vfx_level_up`, `vfx_collect_burst`, `vfx_portal_warp`, `vfx_star_iris`)
- Sửa: [PreloadScene.js](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/scenes/PreloadScene.js)

**Bước thực hiện:**
1. Inspect `pixelfx-repo/tools/sheets.mjs` + generator API để tạo `scripts/export_gameplay_pixelfx.mjs` xuất các spritesheet gọn nhẹ (frame width/height chuẩn PixelFX, frame count vừa đủ mượt, bản sao đồng bộ ở `assets/vfx/` và `public/assets/vfx/`).
2. Chạy script xuất và xác nhận JSON metadata (`frameWidth`, `frameHeight`, `frameCount`, `fps`).
3. Import & load toàn bộ spritesheet mới trong `PreloadScene.preload()` và đăng ký animations trong `WorldScene.initPixelFXAnimations()`.

---

## Task 2: Khắc Phục Đơ / Lag / Đứng Hình Vượt Ải (Hạng mục 1 & 8)
**Tệp liên quan:**
- Sửa: [FireworkCelebrationEffect.js](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/effects/FireworkCelebrationEffect.js)
- Sửa: [BattleArenaModal.js](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/BattleArenaModal.js)
- Sửa: [WorldScene.js](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/scenes/WorldScene.js)

**Bước thực hiện:**
1. **Tối ưu [`FireworkCelebrationEffect.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/effects/FireworkCelebrationEffect.js):** Thay thế vòng lặp vẽ từng pixel CPU `640x360` `putImageData` bằng trình phát spritesheet PixelFX (`vfx_firework_burst`, `vfx_stage_clear`, `vfx_confetti` vector nhẹ <= 30fps `clearRect`/`fillRect` fallback) bảo toàn API `trigger(options)` & giữ FPS cao trên Desktop/iPad.
2. **Bảo vệ vòng đời [`BattleArenaModal.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/BattleArenaModal.js):**
   - Thêm `_battleSessionId`, `_pendingTimeouts = new Set()`, `scheduleTimer(fn, delay)` và `clearPendingTimers()` gọi trong `openArena` và `closeArena`.
   - Kiểm tra `sessionId === this._battleSessionId` trong mọi callback trễ (`executeHeroAttack`, `executeMonsterAttack`, `executeMonsterImpact`, `handleVictory`, `showDefeatModal`).
   - Sửa lỗi race ở `openMazeChallengeForTurn`: giữ `isTurnLocked = true` cho đến khi `executeMonsterAttack()` hoàn tất trả về `setupTurn()`, thêm `try/finally` an toàn.
   - Tích hợp PixelFX `vfx_hit_spark` / `vfx_crit_hit` / `vfx_stage_clear` dạng CSS spritesheet nhẹ trên sàn đấu.
3. **Dọn dẹp [`WorldScene.js`](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/scenes/WorldScene.js):**
   - Gỡ bỏ `playGlitchWipeTransition()` nặng 4x khỏi `create()`.
   - Hoàn thiện `shutdown()` / `destroy()`: hủy toàn bộ `monsters`, `boss`, `pet`, `hero`, `portals`, `propsList`, `propsPuzzle`, `butterflies`, `kitchenSteamTimers`, `time.removeAllEvents()`, `tweens.killAll()`, DOM handlers.
   - Thêm watchdog an toàn trong `update()` tự khôi phục `isExploring = true` khi mọi modal và transition đều đã đóng.

---

## Task 3: Thu Gọn & Cân Đối Game Nối Không Che Nhân Vật / Quái (Hạng mục 3)
**Tệp liên quan:**
- Sửa: [BattleArenaModal.js](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/BattleArenaModal.js) (`renderPairMatching`, `setupTurn`, `closeArena`)
- Sửa: [game.css](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/styles/game.css)

**Bước thực hiện:**
1. Thêm class `.is-pair-matching` lên `#battle-arena-modal` trong `renderPairMatching()`; gỡ ngay ở `setupTurn()` và `closeArena()`.
2. Trong `game.css`, tối ưu layout flex dọc cho `.battle-arena-modal.is-pair-matching`:
   - Thu gọn `.pair-item-btn` (`min-height: 46–50px`, `42px` dưới `680px`), `.pair-column` (`gap: 6px`), `.pair-item-img` (`44–50px`), `.pair-giant-emoji` (`32px`), banner 1 dòng gọn.
   - Giữ tỉ lệ `.arena-fighters-stage` rõ thoáng để ảnh Hero (`#arena-hero-img`) và Quái (`#arena-monster-img`) hoàn toàn phía trên `.arena-bottom-dialog` (`0px` bị che, `0px` tràn đáy card ở `1280x720`, `1024x768`, `1024x640`).
   - Giữ nguyên cấu trúc không nhãn chữ tiếng Việt dưới ảnh cặp để bảo toàn `imagePairMatchingNoText.test.js` & `verifyPairMatchingUI.test.js`.
3. Gắn `ResizeObserver` / `requestAnimationFrame` cập nhật SVG connector đúng tâm nút sau layout.

---

## Task 4: Thống Nhất Chuyển Cảnh + Loading Cho Mọi Lối Đổi Map (Hạng mục 7)
**Tệp liên quan:**
- Sửa: [MapLoadingOverlay.js](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/MapLoadingOverlay.js)
- Sửa: [MapTransitionOverlay.js](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/MapTransitionOverlay.js)
- Sửa: [main.js](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/app/main.js)
- Sửa: [index.html](file:///c:/Users/Admin/Desktop/GAME_HỌC/index.html) & [game.css](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/styles/game.css)

**Bước thực hiện:**
1. Khôi phục `#map-loading-overlay` (hoặc tạo lại động an toàn nếu thiếu DOM) trong `MapLoadingOverlay.js` + điều phối chuyển cảnh thống nhất (~1.0–1.5s, hủy toàn bộ timer cũ nếu gọi chồng, đợi sự kiện `game:map-ready` thực sự kèm watchdog 5s).
2. Tích hợp hiệu ứng màn trập chuyển cảnh PixelFX (`vfx_star_iris` / wipe mượt) + thẻ loading thông tin bản đồ đích & thanh tiến trình.
3. Đưa **mọi** điểm chuyển map về cùng 1 luồng chuẩn `transitionAndLoadMap(mapId, options)`:
   - `game:portal-warp-start`
   - `travelToZone` (MapSelect, PetCare farm link, quick actions)
   - `enterKitchenMapDirect` & `returnFarmMapDirect`
   - Nút về thành sau khi thua trận (`BattleArenaModal` -> `game:travel-zone` / callback)
4. Đảm bảo kết thúc mở cảnh có hiệu ứng PixelFX đón nhân vật và mở lại `isExploring = true`.

---

## Task 5: Tối Ưu Chạm iPad, Nút `E` To, Mở Rộng Vùng Chọn & Bắt Buộc Ấn `E` (Hạng mục 4, 5, 6, 8)
**Tệp liên quan:**
- Sửa: [index.html](file:///c:/Users/Admin/Desktop/GAME_HỌC/index.html)
- Sửa: [game.css](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/styles/game.css)
- Sửa: [main.js](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/app/main.js)
- Sửa: [TeleportPortal.js](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/entities/TeleportPortal.js)
- Sửa: [WorldScene.js](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/scenes/WorldScene.js)

**Bước thực hiện:**
1. **iPad Touch-to-Move (`main.js`, `WorldScene.js`):**
   - Đặt mặc định Cần gạt ảo trong `main.js` thành `false` (`localStorage.getItem('rk_joystick_enabled') === 'true'`), ẩn `#virtual-joystick-zone` và hiển thị HUD `Cần Gạt: Tắt`.
   - Hỗ trợ chạm-và-giữ/kéo liên tục trong `WorldScene` (`pointerdown` + `pointermove` khi `pointer.isDown` throttled ~55ms -> `hero.moveTo(x, y)`), hiển thị `vfx_tap_ripple` PixelFX tại điểm chạm.
2. **Nút `E` to đơn giản & Mở rộng vùng chọn (`index.html`, `game.css`, `WorldScene.js`):**
   - Trong `index.html`, rút gọn `#btn-interactive-e` chỉ còn 1 chữ **`E`** lớn (`min-width: 76px; min-height: 76px; font-size: 36px`), bỏ tia sét ⚡ và text nhãn rườm rà; đồng bộ cập nhật trong `WorldScene.js` (không ghi text dài đè vào button).
   - Gỡ trần `let minDistance = 75;` trong `updateProximityInteractionE()`; tăng bán kính vùng tương tác lên **`130–145px`** cho Cổng, Bếp, Chăm thú, Cầu tàu, Chợ, Thời trang, `PropsPuzzle`, và Quái/Boss ở gần; chọn mục tiêu gần nhất hợp lệ.
3. **Bắt buộc ấn `E`, không tự động chuyển vùng (`TeleportPortal.js`, `WorldScene.js`):**
   - Gỡ tự động `this.enterPortal()` khi `dist < 32` trong `TeleportPortal.update()`.
   - Sửa `TeleportPortal.handleInteract()` + toàn bộ trạm Bếp, Chăm thú, Chợ, Thời trang, Cầu tàu: chạm từ xa chỉ dẫn Bé Sâu đi tới gần trong vùng `E` rồi dừng lại hiện **`E`**, không bao giờ tự mở modal hoặc tự chuyển vùng khi đứng gần hay vừa chạm tới.
   - Gỡ tự mở `pantry`/`prep` ở `<= 45px` trong `WorldScene.update()` và gỡ tự khóa câu cá ở `<= 48px` trong `updateDockFishingAutoFlow()`. Người chơi bấm phím `E` hoặc chạm nút `#btn-interactive-e` để thực hiện tương tác (Cổng chuyển map, Bếp/Cửa hàng mở modal, Cầu tàu bắt đầu câu cá).

---

## Task 6: Nhân Đôi Nội Dung Vượt Ải & Đa Dạng Hóa Map (Hạng mục 2)
**Tệp liên quan:**
- Sửa: [questionBank.js](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/content/questions/questionBank.js)
- Sửa: [mapsConfig.js](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/content/maps/mapsConfig.js)
- Sửa: [BattleArenaModal.js](file:///c:/Users/Admin/Desktop/GAME_HỌC/src/game/ui/BattleArenaModal.js)

**Bước thực hiện:**
1. Mở rộng `QUESTION_BANK` từ **148 lên >= 330 câu hỏi** (`>= 54` câu/map ở cả 6 bản đồ, gấp > 2.2 lần) thuộc đa dạng chủ đề & loại câu hỏi (`multiple_choice`, `listening`, `pair_matching`, `memory_match`, `drag_sort`), tận dụng hình ảnh & ảnh bóng mờ (`_shadow.png`) đã kiểm định có trong `assets/edu/` (bảo đảm `validateQuestionBank` pass 100% và `imagePairMatchingNoText` giữ thuần hình/emoji).
2. Nâng cấp `mapsConfig.js`: giữ nguyên ID cũ + `propsPuzzle.requiredRescues` để tương thích unit test, đồng thời thêm encounter mới cho `map5` (`enc_map5_3`) và `map6` (`enc_map6_3`), gán sprite quái phong phú không trùng lặp `mon_sprout` và gắn `questionPool` riêng đa dạng cho mỗi encounter/boss.
3. Tăng `MAX_SESSION_HISTORY` trong `questionBank.js` lên `45` và tinh chỉnh `getEncounterQuestions()` trong `BattleArenaModal.js` trộn xen kẽ đa dạng dạng bài theo từng hiệp đấu.

---

## Task 7: Cập Nhật & Bổ Sung Kiểm Chứng Toàn Diện (Unit + Browser + Build)
**Tệp liên quan:**
- Bổ sung/Cập nhật tests nếu cần trong `src/tests/`
- Chạy `npm run test:unit`, Playwright e2e đa độ phân giải (`1280x720`, `1024x768`, `1024x640`), `npm run build`, `npm test`.

**Tiêu chí nghiệm thu (Verified Facts Only):**
- `npm run test:unit` Pass 100%, `QUESTION_BANK` >= 330 câu hợp lệ (>= 54 câu mỗi map).
- Playwright full playthrough `map1` (3 quái + Boss + Pháo hoa PixelFX): không đứng lượt, không kẹt `isExploring`, FPS trung bình mượt (~50–60 FPS), 0 `pageerror`/`console.error`.
- Game nối (`pair_matching`): Hero & Quái lộ diện hoàn toàn (`0px` bị che, `0px` tràn card) ở cả 3 viewport.
- iPad: Cần gạt mặc định tắt, chạm & giữ/kéo di chuyển mượt kèm PixelFX điểm chạm.
- Vùng chọn lớn (`~135px`) hiện **duy nhất 1 chữ `E` to**; không tự chuyển map hay mở trạm khi đứng sát; bấm `E` mới chuyển kèm **Chuyển cảnh + Loading** đồng bộ trên mọi lối đổi map.
