# 📋 BÁO CÁO NHANH TIẾN ĐỘ & BÀN GIAO KỸ THUẬT (DEVELOPER HANDOVER)

> **Dành cho Lập Trình Viên kế thừa:** Tài liệu này tổng hợp toàn bộ các tính năng, kiến trúc, vị trí file cốt lõi và các quy tắc kỹ thuật của dự án **Vương Quốc Cầu Vồng (Rainbow Kids RPG)** để có thể tiếp tục triển khai ngay mà không bị bỏ sót các tính năng đã hoàn thiện.

---

## 1. 📌 Tổng Quan Kiến Trúc & Công Nghệ

- **Game Engine:** [Phaser 3.90.0](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/package.json) (Canvas 2D / WebGL)
- **Bundler & Tooling:** [Vite 6.x](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/vite.config.js) (ES Modules, Hot Module Replacement)
- **UI Lớp Ngoài:** HTML5/CSS3 Custom Modals (Candy-Claymorphism & Gỗ Chibi thân thiện trẻ mầm non 3-6 tuổi)
- **Hệ Thống Lưu Trữ:** [`SaveAdapter`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/services/save/saveAdapter.js) (`RAINBOW_KIDS_RPG_SAVE_V1` - Tự động migrate V1 ➔ V2)
- **Kiểm Thử (Unit Tests):** 9/9 bộ test tự phát triển (Node.js test runner: `node src/tests/unit/runAllUnitTests.js`)

---

## 2. ✅ Các Tính Năng Đã Hoàn Thành (Done List)

### 🗺️ Bản Đồ & Di Chuyển
- **6 Vùng đất cốt truyện:** Cấu hình chuẩn tại [`MAPS_CONFIG`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/content/maps/mapsConfig.js#L20-L140) (Map 1 đến Map 6).
- **Map Nông Trại Thú Cưng (`map_pet_farm`):** Đặt tại [`SPECIAL_MAPS_CONFIG`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/content/maps/mapsConfig.js#L145-L215) để không phá vỡ schema campaign 6 map.
  - 4 Trạm tương tác: Máng ăn (`+25 Hunger`), Máng nước (`+25 Clean`), Chuồng thú (`+30 Energy`), Bãi cỏ chơi (`+Affinity, +Exp`).
  - Đi vào từ Pet HUD hoặc Map Select; Cổng thoát về lại Làng Cầu Vồng (`map1`).
- **Màn hình Loading chuyển map:** [`MapLoadingOverlay`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/game/ui/MapLoadingOverlay.js) hiển thị linh vật Bé Sâu, thanh tiến trình từ 0% ➔ 100%, tên vùng đất đến và lời khuyên dễ thương.

### 🐉 Boss & Cổng Dịch Chuyển (Cơ Chế Mới Nhất)
- **Cổng chuyển map động:** [`TeleportPortal`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/game/entities/TeleportPortal.js) chỉ xuất hiện tại **đúng tọa độ Boss bị tiêu diệt** (`spawnAt(x, y)`), không xuất hiện trước. Cổng quay về cố định tại `(160, 320)`.
- **Hướng xuất chiêu Boss:** [`Boss.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/game/entities/Boss.js#L120-L160) và [`BattleArenaModal.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/game/ui/BattleArenaModal.js#L260-L310) đã cấu hình `flipAttack: true` (`scaleX(-1)`) quay mặt chuẩn sang trái hướng về phía nhân vật.
- **Trực quan hoá (UI tối giản):** Đã xoá toàn bộ nhãn tên chữ nổi rườm rà trên đầu Boss và Cổng để giao diện thuần hình ảnh, đúng lứa tuổi mầm non.

### 🐛 Nhân Vật & Nâng Cấp Skin
- **Bé Sâu Mặc Định & Bé Sâu Hiệp Sĩ:** [`SkinSelectModal.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/game/ui/SkinSelectModal.js) hỗ trợ chọn trang phục đã mở khóa hoặc khi đạt Cấp 5.
- Đầy đủ bộ Sprite Sheet & WebP animation: Bước đi 4 hướng (xuống, sang phải/trái, lên) và hành động chiến đấu (idle, attack, hit, celebrate).

### ⚔️ Chiến Đấu & Câu Hỏi Trắc Nghiệm
- **Đấu Trường Trắc Nghiệm 3D:** [`BattleArenaModal.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/game/ui/BattleArenaModal.js)
  - Khung câu hỏi đặt chính giữa, trực quan.
  - Các đáp án A/B/C dạng đĩa tròn 3D candy nổi bật.
  - Hiệu ứng chọn Đúng (nổ sao vàng, âm thanh khen ngợi) và Sai (lắc nhẹ, động viên bé thử lại).
- **Bộ Công Cụ Soạn Câu Hỏi Tùy Chỉnh & Mã PIN:** [`QuestionCreatorModal.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/game/ui/QuestionCreatorModal.js)
  - Nút thêm câu hỏi trên thanh điều khiển.
  - Khóa bảo mật mã PIN 4 chữ số chống học sinh nghịch phá.
  - Lưu vào [`customQuestionBank.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/content/questions/customQuestionBank.js) và tích hợp liền mạch vào vòng quay câu hỏi trong trận đấu.

### 🌊 Quái Vật & Boss Map 2 (Vịnh Biển Pha Lê) - MỚI HOÀN THIỆN & TINH CHỈNH HOÀN HẢO
- **3 Quái Thường & 1 Boss Cực Đẹp:**
  1. [`mon_crab`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/assets/monsters/map2/mon_crab.png): Cua Kẹp Nhỏ (Vỏ cam san hô, 8-step skill bão bong bóng)
  2. [`mon_starfish`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/assets/monsters/map2/mon_starfish.png): Sao Biển Vàng (5 cánh tròn xinh xắn, 8-step skill chùm sáng pha lê)
  3. [`mon_emerald_crab`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/assets/monsters/map2/mon_emerald_crab.png): Cua Ngọc Bích Pha Lê (Vỏ xanh ngọc bảo lấp lánh, 8-step skill sóng xoáy ngọc)
  4. [`boss_crab_king`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/assets/monsters/map2/boss_crab_king.png): Boss Cua Vua Vỏ Ngọc (Vương miện san hô, ngọc trai khổng lồ phát sáng, 8-step skill đại hồng thủy & pháo ngọc trai)
- **Đầy đủ hoạt ảnh:** `walk` (8 frames), `idle` (4 frames), `action`, `hit`, `celebrate`, và `skill` đánh về **bên trái 8 bước**.
- **Kỹ thuật xử lý ảnh hoàn hảo:**
  - **Khử sạch 100% viền trắng (0 white pixels):** Xói mòn 1px + De-matting thay thế màu pixel biên mờ bằng màu đặc thân quái vật.
  - **Thu nhỏ an toàn chống mất hình:** Chừa lề an toàn `>= 55 - 65px` quanh canvas, tuyệt đối không bị cụt hay cắt lẹm càng/vương miện.
  - **Kỹ năng 8 bước liên tục:** Thân quái vật luôn hiện diện xuyên suốt mọi frame, đánh chuẩn xác về bên TRÁI hướng thẳng vào Bé Sâu.
- Đã liên kết đầy đủ vào [`PreloadScene.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/game/scenes/PreloadScene.js), [`Monster.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/game/entities/Monster.js), [`Boss.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/game/entities/Boss.js), [`BattleArenaModal.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/game/ui/BattleArenaModal.js) và [`mapsConfig.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/content/maps/mapsConfig.js).

### 🐰 Thú Cưng Đồng Hành (Thỏ Bông)
- [`PetCareModal.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/game/ui/PetCareModal.js): Hệ thống chỉ số Đói (Hunger), Sạch sẽ (Clean), Năng lượng (Energy), Độ thân thiết (Affinity).
- Có cơ chế phân rã offline an toàn (không bao giờ tụt dưới 30%), nút bật/tắt bạn đồng hành chạy theo sau nhân vật chính.

---

## 3. 📂 Cấu Trúc File & Điểm Nóng (Hotspots)

```
c:\Users\Admin\Desktop\GAME_HỌC\
├── assets/
│   ├── hero/                  # Bé Sâu & Hiệp Sĩ (spritesheets & webp)
│   ├── boss/                  # Boss Rồng thần (spritesheet & skill left)
│   ├── monsters/              # Quái vật các vùng (nấm, ong, bọ rùa, sa mạc...)
│   ├── maps/backgrounds/      # Ảnh nền 1280x720 (map1_bg đến map6_bg, map_pet_farm_bg)
│   └── props/                 # Cổng dịch chuyển (portal_sheet.png), rương, biển chỉ dẫn
├── src/
│   ├── app/
│   │   └── main.js            # Entry point, khởi tạo Phaser Game & kết nối các modal
│   ├── content/
│   │   ├── maps/
│   │   │   └── mapsConfig.js  # MAPS_CONFIG (6 map cốt truyện) & SPECIAL_MAPS_CONFIG
│   │   └── questions/
│   │       ├── questionBank.js       # Ngân hàng 44+ câu hỏi gốc
│   │       └── customQuestionBank.js # Ngân hàng câu hỏi giáo viên tự soạn
│   ├── game/
│   │   ├── entities/
│   │   │   ├── Boss.js           # Logic Boss, kỹ năng, sự kiện tử trận
│   │   │   ├── TeleportPortal.js # Cổng dịch chuyển xuất hiện tại tọa độ Boss chết
│   │   │   ├── Player.js         # Di chuyển, sprite skin động, tương tác
│   │   │   └── Pet.js            # Thú cưng đi theo
│   │   ├── scenes/
│   │   │   ├── WorldScene.js     # Scene bản đồ thế giới, đặt trạm, phát hiện va chạm
│   │   │   └── BattleScene.js    # Scene chiến đấu phụ trợ
│   │   ├── systems/
│   │   │   └── ProgressionSystem.js # Cấp độ, kinh nghiệm, mở khóa vùng đất
│   │   └── ui/
│   │       ├── BattleArenaModal.js     # Giao diện thi đấu & trắc nghiệm
│   │       ├── MapLoadingOverlay.js    # Màn hình loading chuyển vùng đất
│   │       ├── QuestionCreatorModal.js # Soạn câu hỏi & mã PIN
│   │       ├── PetCareModal.js         # Chăm sóc thú cưng
│   │       └── SkinSelectModal.js      # Thay trang phục nhân vật
│   ├── services/
│   │   └── save/saveAdapter.js         # Lưu trữ LocalStorage chuẩn V2
│   └── tests/
│       └── unit/runAllUnitTests.js     # Test runner chạy 9 bộ test
└── DEVELOPER_HANDOVER_REPORT.md        # File báo cáo này
```

---

## 4. 🧪 Hướng Dẫn Lệnh & Kiểm Thử (Commands)

| Mục Đích | Lệnh Thực Hiện | Ghi Chú |
| :--- | :--- | :--- |
| **Chạy Local Dev** | `npm run dev` | Khởi chạy Vite Dev Server tại `http://localhost:5173` |
| **Kiểm Thử Toàn Bộ** | `node src/tests/unit/runAllUnitTests.js` | **Bắt buộc** 9/9 bộ test phải pass |
| **Đóng Gói (Build)** | `npm run build` | Tạo thư mục `dist/` kiểm tra lỗi syntax |
| **Chạy Bản Preview** | `npm run preview` | Khởi chạy preview build tại `http://localhost:4173` |

---

## 5. 🚀 Nhiệm Vụ Tiếp Theo Cần Làm (Next Roadmap / Backlog)

1. **Bộ Quái Vật & Boss cho Map 3 (Động Pha Lê Lấp Lánh):**
   - Đề xuất quái chủ đề hang đá thạch nhũ & kẹo pha lê ngọt ngào: Quái Thạch Nhũ Con, Rồng Pha Lê Nhỏ, Khủng Long Kẹo Dẻo.
   - Yêu cầu: Đầy đủ walk, idle, action, hit và skill đánh về bên trái 8 bước.
2. **Âm Thanh (SFX) Cho Trạm Nông Trại & Chiêu Thức Biển:**
   - Tiếng sóng vỗ rì rào & bong bóng nước cho Vịnh Biển Pha Lê.
   - Bổ sung tiếng "nhóp nhép" khi thú cưng ăn táo/cà rốt tại Máng ăn nông trại.

---

## 6. ⚠️ Các Lưu Ý Kỹ Thuật Bất Di Bất Dịch (Important Rules)

> [!CAUTION]
> **Quy Tắc 6 Bản Đồ Cốt Truyện:**
> Bộ kiểm tra [`schemaValidator.test.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/tests/unit/schemaValidator.test.js) bắt buộc `MAPS_CONFIG` có đúng **6 maps**. Bất kỳ bản đồ mini-game, sự kiện, hay nông trại thú cưng nào **phải** được đưa vào `SPECIAL_MAPS_CONFIG` trong [`mapsConfig.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/content/maps/mapsConfig.js) và gọi qua hàm `getMapConfig(mapId)`.

> [!NOTE]
> **Vị Trí Cổng Xuất Hiện:**
> Khi Boss chết, sự kiện trong [`WorldScene.js`](file:///c:/Users/Admin/Desktop/GAME_H%E1%BB%8CC/src/game/scenes/WorldScene.js) sẽ đọc tọa độ tử trận của Boss để gọi `this.teleportPortal.spawnAt(bossX, bossY)`. Vị trí này cũng được ghi vào `saveState.campaign.bossDeathPositions` để khi người chơi tải lại trang, cổng vẫn đứng đúng vị trí đó.
