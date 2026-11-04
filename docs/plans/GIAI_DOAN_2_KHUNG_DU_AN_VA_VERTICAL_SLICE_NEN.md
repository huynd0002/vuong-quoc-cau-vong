# GIAI ĐOẠN 2: KHUNG DỰ ÁN, TOOLING & VERTICAL SLICE NỀN
**Dự án:** Tái xây dựng Vương Quốc Cầu Vồng (Rainbow Kingdom RPG)  
**Trạng thái:** HOÀN THÀNH NGHIỆM THU  
**Ngày thực hiện:** 18/10/2026  
**Quy chuẩn áp dụng:** `KE_HOACH_REBUILD_GAME.md` — Mục 5: Giai đoạn 2  

---

## 1. Mục tiêu và phạm vi của Giai đoạn 2

Giai đoạn 2 chuyển đổi toàn bộ kết quả của Giai đoạn 0 (Khóa phạm vi, ma trận dữ liệu) và Giai đoạn 1 (Prototype kỹ thuật Phaser) thành **Khung kiến trúc dự án chuẩn (Production Codebase Scaffold)**:
1. Thiết lập Tooling hiện đại dựa trên **Vite 6** và **Phaser 3.90** tại thư mục gốc, bảo đảm build production sạch, bundle tối ưu và tốc độ tải cao.
2. Tách biệt hoàn toàn mã **Domain Game Logic** (Tiến trình, Luật thử thách, Thú cưng, Xác thực nội dung) khỏi mã **Phaser Rendering & Scenes** để có thể viết Unit Test độc lập không cần headless browser.
3. Cung cấp **Content Schema Validator** tự động kiểm định mọi câu hỏi trong `QUESTION_BANK` và bản đồ trong `MAPS_CONFIG`.
4. Thiết lập **Save Adapter & Migration Service** an toàn, bảo đảm dữ liệu từ khóa cũ `RAINBOW_KIDS_RPG_SAVE_V1` được tự động chuyển đổi sang Schema V2 mà không làm mất sao, cấp độ hay dữ liệu Thỏ Bông.
5. Tích hợp Trợ năng (**Accessibility & Child-Safe Controls**): Giảm chuyển động (`prefers-reduced-motion`), âm thanh tổng hợp Web Audio Oscillator, giọng đọc tiếng Việt qua SpeechSynthesis, thông báo xoay máy ngang trực quan.
6. Bảo toàn 100% mã nguồn cũ `index.html` làm baseline tham chiếu an toàn; các script kiểm tra cũ (`verify_game.py`, `test_pet_system.cjs`) tiếp tục đạt 100%.

---

## 2. Cấu trúc thư mục mã nguồn chuẩn (`src/`)

```text
c:\Users\Admin\Desktop\GAME_HỌC\
├── package.json                    # Cấu hình dependency và kịch bản test/build
├── vite.config.js                  # Cấu hình Vite bundler & SPA entry redirect
├── game.html                       # Khung HTML ngữ nghĩa của bản Rebuild mới
├── index.html                      # Bản game cũ được giữ nguyên 100% làm baseline
├── src/
│   ├── app/
│   │   └── main.js                 # Entry point khởi tạo hệ thống, nạp save, gắn kết event bus
│   ├── content/
│   │   ├── maps/
│   │   │   └── mapsConfig.js       # Cấu hình chuẩn 6 vùng đất (Map 1 đến Map 6)
│   │   ├── questions/
│   │   │   └── questionBank.js     # Ngân hàng 13 câu hỏi toán tư duy mầm non 5-6 tuổi
│   │   └── schema/
│   │       └── validator.js        # Schema validator kiểm tra tính hợp lệ của câu hỏi & map
│   ├── game/
│   │   ├── entities/
│   │   │   ├── Hero.js             # Class Bé Sâu (di chuyển, bóng đổ, physics)
│   │   │   ├── Pet.js              # Class Thỏ Bông (bám đuổi mượt mà, ăn mừng)
│   │   │   └── Monster.js          # Class Bạn Quái (vùng chạm cảm ứng, hiệu ứng giải cứu)
│   │   ├── scenes/
│   │   │   ├── BootScene.js        # Khởi tạo camera và cấu hình cơ bản
│   │   │   ├── PreloadScene.js     # Tải asset theo nhóm, thanh tiến trình, fallback
│   │   │   └── WorldScene.js       # Bản đồ thế giới tương tác, camera, điều khiển
│   │   ├── systems/
│   │   │   ├── combatSystem.js     # Luật thử thách turn-based không Game Over
│   │   │   ├── petSystem.js        # Quản lý 4 nhu cầu và chăm sóc Thỏ Bông (PET_PLAN.md)
│   │   │   └── progressionSystem.js# Quản lý cấp Bé Sâu, Sao, mở khóa vùng
│   │   └── ui/
│   │       ├── HudController.js    # Điều khiển HUD đầu trang, âm thanh, cấp độ
│   │       └── QuestionDialog.js   # Điều khiển thẻ câu hỏi DOM, giọng đọc, phản hồi
│   ├── services/
│   │   ├── accessibility/
│   │   │   └── accessibilityService.js # Giảm chuyển động, trợ năng
│   │   ├── assets/
│   │   │   └── assetManifest.js    # Danh mục asset và fallback
│   │   ├── audio/
│   │   │   └── audioService.js     # SFX tone synth & giọng đọc SpeechSynthesis tiếng Việt
│   │   └── save/
│   │       └── saveAdapter.js      # Lưu trữ, nạp và migrate V1 sang V2
│   ├── styles/
│   │   └── game.css                # Hệ thống style responsive, bo tròn, portrait hint
│   └── tests/
│       ├── browser/
│       │   └── browserSmoke.test.js# Kiểm thử Playwright trên 3 viewports
│       └── unit/
│           ├── petSystem.test.js   # Test nhu cầu thú cưng và sàn offline 30%
│           ├── progressionSystem.test.js # Test tăng cấp, trao sao, mở khóa map
│           ├── runAllUnitTests.js  # Runner tổng hợp 4 bộ unit test
│           ├── saveAdapter.test.js # Test nạp, lưu, migrate V1->V2, corrupt fallback
│           └── schemaValidator.test.js # Test từ chối dữ liệu hỏng & xác thực question bank
```

---

## 3. Kết quả đo kiểm và kiểm thử tự động (Verification Evidence)

### 3.1. Kết quả Build Production (Vite 6)
```text
> vite build
✓ 28 modules transformed.
dist/game.html                                4.64 kB │ gzip:   1.73 kB
dist/assets/pet_bunny_idle-viJNGFSm.png      11.74 kB
dist/assets/mon_caterpillar-dXsXZalI.png     80.26 kB
dist/assets/hero_idle-CwPuxE1X.png           99.36 kB
dist/assets/map_1_bg-DT7YdxRS.png           495.14 kB
dist/assets/main-BNSVQVKr.css                 8.30 kB │ gzip:   2.66 kB
dist/assets/main-DvDGDGaO.js              1,514.48 kB │ gzip: 350.54 kB
✓ built in 4.55s
```
- **Thời gian build:** 4.55 giây.
- **Tổng dung lượng tải qua mạng (Gzip):** ~350 kB (tải cực nhanh, mượt mà trên mạng di động 4G).

### 3.2. Kết quả Unit Tests (`npm run test:unit`)
Chạy tự động 4/4 bộ kiểm thử logic độc lập:
1. **SaveAdapter & Migration:**
   - [x] Khởi tạo trạng thái mặc định an toàn khi chưa có save.
   - [x] Lưu và nạp trạng thái Schema V2.
   - [x] Migrate thành công dữ liệu V1 cũ (level, exp, coins $\to$ stars, pet hearts $\to$ affinity).
   - [x] Tự phục hồi về mặc định an toàn khi gặp dữ liệu JSON hỏng / corrupt.
2. **Content Schema Validator:**
   - [x] Chấp nhận câu hỏi chuẩn.
   - [x] Bắt lỗi chính xác và từ chối câu hỏi thiếu `prompt`, `choices < 2`, `correct` sai chỉ mục hoặc thiếu `hint`.
   - [x] Chấp nhận bản đồ hợp lệ và từ chối bản đồ thiếu `encounters` hoặc `order` ngoài 1–6.
   - [x] **Xác thực 100% (13/13 câu hỏi)** trong `QUESTION_BANK` đạt chuẩn không lỗi.
   - [x] **Xác thực 100% (6/6 bản đồ)** trong `MAPS_CONFIG` đạt chuẩn không lỗi.
3. **Progression System:**
   - [x] Cộng dồn Sao, EXP và Đá Quý chính xác.
   - [x] Tính toán thăng cấp Bé Sâu khi đạt ngưỡng 50 EXP.
   - [x] Mở khóa bản đồ tiếp theo và ngăn chặn trùng lặp.
   - [x] Ghi nhận lịch sử giải cứu bạn bè.
4. **Pet System (Thỏ Bông):**
   - [x] Hoạt động Cho ăn (`feed`), Tắm sạch (`bathe`), Chơi đùa (`play`), Đi ngủ (`sleep`), Xoa đầu (`petHead`).
   - [x] Thăng cấp Thỏ Bông và tăng tim thân thiết (affinity).
   - [x] **Kiểm chứng sàn suy giảm Offline:** Giả lập vắng mặt 72 giờ, chỉ số No bụng và Sạch sẽ **tuyệt đối không giảm dưới 30%** (tuân thủ 100% nguyên tắc `PET_PLAN.md`).

### 3.3. Kết quả Kiểm thử Trình duyệt Playwright (`npm run test:browser`)
Chạy kiểm thử đa kích thước màn hình:
```text
--- [Test] Playwright Browser Smoke Test (Giai đoạn 2) ---
✓ Desktop HD (1280x720): Canvas, encounter, retry, and solve flow passed
✓ Mobile Landscape (844x390): Canvas, encounter, retry, and solve flow passed
✓ Mobile Portrait (390x844): Rotate hint verified

====================================================
  KIỂM THỬ TRÌNH DUYỆT PLAYWRIGHT ĐẠT 100%!       
====================================================
```
- Không có bất kỳ lỗi JavaScript runtime / uncaught exception nào trên cả 3 cấu hình màn hình.

### 3.4. Kiểm tra tương thích mã nguồn cũ
- `python scripts/verify_game.py`: **ALL VERIFICATIONS PASSED SUCCESSFULLY!**
- `node scripts/test_pet_system.cjs`: **10 pet runtime checks passed.**

---

## 4. Kết luận Cổng nghiệm thu Giai đoạn 2

- [x] Khung dự án production sạch đã được thiết lập với Vite và Phaser 3.90.
- [x] Domain code đã tách hoàn toàn khỏi Scene rendering.
- [x] Content Validator bảo vệ 100% chất lượng ngân hàng câu hỏi và bản đồ.
- [x] Save Adapter hỗ trợ đọc và migrate dữ liệu cũ sang V2 an toàn tuyệt đối.
- [x] Trợ năng, âm thanh và giao diện trẻ em hoạt động đồng bộ.
- [x] 100% bài kiểm tra (Unit Test + Browser Smoke Test + Legacy Tests) đều đạt kết quả xuất sắc.

**CỔNG NGHIỆM THU GIAI ĐOẠN 2: HOÀN THÀNH TOÀN DIỆN — ĐỦ ĐIỀU KIỆN TIẾN HÀNH GIAI ĐOẠN 3 (VERTICAL SLICE NỘI DUNG HOÀN CHỈNH).**
