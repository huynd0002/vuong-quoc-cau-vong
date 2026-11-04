# GIAI ĐOẠN 5: MỞ RỘNG TOÀN DIỆN NỘI DUNG 6 VÙNG ĐẤT
**Dự án:** Tái xây dựng Vương Quốc Cầu Vồng (Rainbow Kingdom RPG)  
**Trạng thái:** HOÀN THÀNH NGHIỆM THU  
**Ngày thực hiện:** 18/10/2026  
**Quy chuẩn áp dụng:** `KE_HOACH_REBUILD_GAME.md` — Mục 5: Giai đoạn 5  

---

## 1. Mục tiêu và phạm vi của Giai đoạn 5

Giai đoạn 5 nhân rộng thành công kiến trúc Vertical Slice của Vùng 1 ra **toàn bộ 6 vùng đất** của Vương Quốc Cầu Vồng theo đúng ma trận mục tiêu học tập mầm non (5–6 tuổi) đã được khóa tại Giai đoạn 0:

### 1.1. Ma trận 6 Vùng Đất Hoàn Chỉnh

| Vùng đất | Tên vùng | Mục tiêu học tập cốt lõi | Câu đố môi trường (Props Puzzle) | Bạn bè giải cứu (Encounters) | Trùm đặc trưng (Boss 2 Pha) | Vật phẩm cốt truyện |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Vùng 1** | Làng Quê Yên Bình | Nhận biết Màu sắc & Hình khối | Cổng Hoa Cầu Vồng | Bạn Mầm Lá, Nấm Con Vui Vẻ | Nấm Mũ Đỏ Khổng Lồ (Màn sương ngủ $\to$ Bừng tỉnh) | Pha Lê Đỏ Tình Bạn 💎 |
| **Vùng 2** | Vịnh Biển Pha Lê | Đếm số lượng trong phạm vi 10 | Vỏ Sò Khổng Lồ Phát Sáng | Cua Kẹp Nhỏ, Cá Heo Vui Vẻ | Cua Vua Vỏ Ngọc (Sóng biển $\to$ Vỏ ngọc tỏa sáng) | Pha Lê Cam Năng Động 💎 |
| **Vùng 3** | Động Pha Lê Lấp Lánh | Phép cộng trực quan trong phạm vi 5 | Trụ Tinh Thể Năng Lượng | Thạch Nhũ Tinh Tinh, Bướm Đêm | Rồng Pha Lê Ngủ Quên (Mộng mị $\to$ Thức giấc) | Pha Lê Vàng Rực Rỡ 💎 |
| **Vùng 4** | Rừng Kẹo Ngọt | Phép trừ trực quan trong phạm vi 5 | Cây Cầu Bánh Gừng | Bánh Quy Tinh Nghịch, Kẹo Mút | Vua Gấu Kẹo Bông (Cơn lốc ngọt $\to$ Nụ cười kẹo) | Pha Lê Xanh Hy Vọng 💎 |
| **Vùng 5** | Hẻm Núi Gió Hát | So sánh Lớn hơn - Bé hơn - Bằng nhau | Chuông Gió Núi Cao | Chim Lông Xù, Sóc Bay | Cú Thông Thái Núi Cao (Gió thử thách $\to$ Đôi mắt thông tuệ) | Pha Lê Lam Trí Tuệ 💎 |
| **Vùng 6** | Cung Đình Thần Long | Dãy quy luật & Ôn tập tổng hợp | Cung Đàn Ánh Sáng | Rồng Con Mây Trắng, Kỳ Lân Ánh Sáng | Thần Long Cầu Vồng (Màn sương tím $\to$ Ánh sáng hòa bình) | Pha Lê Tím Diệu Kỳ 💎 |

### 1.2. Mở rộng Ngân hàng câu hỏi sư phạm (44 câu hỏi chuẩn hóa)
- Ngân hàng câu hỏi `src/content/questions/questionBank.js` được mở rộng từ 19 lên **44 câu hỏi phong phú**, bao phủ toàn diện 6 kỹ năng tư duy toán học mầm non.
- Mỗi câu hỏi đều có:
  - Hình minh họa emoji trực quan sinh động (hoa hướng dương 🌻, dâu tây 🍓, cua 🦀, sò 🐚, táo 🍎, bánh quy 🍪, kẹo 🍭, chim 🐦...).
  - Giọng đọc mẫu tiếng Việt (`speak`) ấm áp, chuẩn ngữ điệu trẻ thơ.
  - Gợi ý tư duy êm dịu (`hint`) không tiết lộ thô đáp án mà dẫn dắt bé tự suy nghĩ.
  - Ít nhất 3 phương án lựa chọn với chỉ số `correct` chính xác tuyệt đối.
- Tích hợp bộ chọn câu hỏi chống lặp ngẫu nhiên `getRandomZoneQuestion(zoneId, excludeIds)` bảo đảm trải nghiệm không bị lặp lại câu hỏi vừa trả lời.

### 1.3. Cơ chế Khám phá & Boss 2 pha đồng bộ
- Mỗi vùng đất có một câu đố môi trường độc đáo (`PropsPuzzle`) gắn chặt với tiến trình: Bé cần giải cứu đủ 2 bạn nhỏ trong vùng để giải trừ phong ấn câu đố, từ đó mở lối bước vào thử thách với Trùm.
- Cả 6 Trùm đều sở hữu cơ chế 2 pha hình ảnh và âm thanh rõ rệt: Pha 1 xua tan màn sương lú lẫn $\to$ Pha 2 giải cứu hoàn toàn và thanh tẩy Trùm trở thành bạn đồng hành thân thiện.

---

## 2. Kiến trúc & Tệp mã nguồn mới / nâng cấp

```text
src/
├── content/
│   ├── maps/
│   │   └── mapsConfig.js       # NÂNG CẤP: Đầy đủ 6 vùng đất với storyIntro, propsPuzzle, 2 encounters & 2-phase Boss
│   └── questions/
│       └── questionBank.js     # NÂNG CẤP: Mở rộng 44 câu hỏi sư phạm chuẩn hóa cho cả 6 vùng
└── tests/
    └── unit/
        ├── runAllUnitTests.js      # NÂNG CẤP: Mở rộng lên 7/7 bộ kiểm thử độc lập
        └── zoneContent6Zones.test.js # MỚI: Kiểm thử toàn diện 6 vùng, props puzzle, boss 2 pha và tiến trình liên vùng
```

---

## 3. Bằng chứng kiểm thử và xác thực tự động (100% PASS)

### 3.1. Kết quả Build Production (Vite 6)
```text
> vite build
✓ 38 modules transformed.
dist/game.html                                9.89 kB │ gzip:   3.07 kB
dist/assets/pet_bunny_idle-viJNGFSm.png      11.74 kB
dist/assets/mon_caterpillar-dXsXZalI.png     80.26 kB
dist/assets/hero_idle-CwPuxE1X.png           99.36 kB
dist/assets/map_1_bg-DT7YdxRS.png           495.14 kB
dist/assets/main--zRcAjxN.css                18.82 kB │ gzip:   4.94 kB
dist/assets/main-DJUVBbm_.js              1,570.87 kB │ gzip: 364.81 kB
✓ built in 4.64s
```
- **Tốc độ build:** 4.64 giây.
- **Tổng dung lượng tải qua mạng (Gzip):** ~368 kB.

### 3.2. Kết quả Unit Tests (`npm run test:unit`)
Toàn bộ **7/7 bộ kiểm thử độc lập** đều vượt qua tuyệt đối:
```text
--- [Test] SaveAdapter & Migration ---
✓ Test 1 Passed: Default state load
✓ Test 2 Passed: Save and reload V2 state
✓ Test 3 Passed: Legacy V1 to V2 migration
✓ Test 4 Passed: Corrupt data fallback

--- [Test] Content Schema Validator ---
✓ Test 1 Passed: Valid question schema
✓ Test 2 Passed: Invalid question rejection with exact errors
✓ Test 3 Passed: Valid map schema
✓ Test 4 Passed: Invalid map rejection
✓ Test 5 Passed: All 44 questions in QUESTION_BANK are 100% valid
✓ Test 6 Passed: All 6 maps in MAPS_CONFIG are 100% valid

--- [Test] Progression System ---
✓ Test 1 Passed: Add rewards
✓ Test 2 Passed: Level up calculation
✓ Test 3 Passed: Map unlocking
✓ Test 4 Passed: Friend rescue tracking

--- [Test] Pet System (Thỏ Bông) ---
✓ Test 1 Passed: Feed and Bathe care activities
✓ Test 2 Passed: Pet level up and affinity gain
✓ Test 3 Passed: Safe offline decay (never drops below 30%)
✓ Test 4 Passed: Toggle companion

--- [Test] Giai đoạn 3: Vùng 1 Content & Multi-phase Boss ---
✓ Test 1 Passed: All 8 Zone 1 questions are valid
✓ Test 2 Passed: Anti-repeat question selection
✓ Test 3 Passed: Flower gate puzzle unlocking condition
✓ Test 4 Passed: Multi-phase Boss victory and Map 2 unlocking

--- [Test] Giai đoạn 4: Campaign, State Machine & Lưu trữ ---
✓ Test 1 Passed: Campaign Graph unlock rules
✓ Test 2 Passed: 6 Crystals & Grand Finale condition
✓ Test 3 Passed: Quest flags and Learning stats tracking
✓ Test 4 Passed: FSM transitions, guard rejections, and recovery
✓ Test 5 Passed: Replay zone preserves all progress and rewards
✓ Test 6 Passed: Parental gate challenge generation

--- [Test] Giai đoạn 5: Mở rộng nội dung 6 Vùng Đất ---
✓ Test 1 Passed: All 6 maps have valid storyIntro & propsPuzzle matching encounters
✓ Test 2 Passed: All 6 maps have verified 2-phase Bosses with valid questions
✓ Test 3 Passed: Anti-repeat question selection across all 6 zones
✓ Test 4 Passed: Linear campaign progression chain from Zone 1 to Zone 6

====================================================
  TẤT CẢ 7/7 BỘ UNIT TESTS ĐÃ VƯỢT QUA XUẤT SẮC!   
====================================================
```

### 3.3. Kết quả Kiểm thử Trình duyệt Playwright (`npm run test:browser`)
```text
--- [Test] Playwright Browser Smoke Test ---
✓ Desktop HD (1280x720): Full Vertical Slice & Campaign Map (Story, Pet, Encounter, Boss 2-Phase, Recap, Map Hub, Parental Gate) PASS 100%!
✓ Mobile Landscape (844x390): Full Vertical Slice & Campaign Map (Story, Pet, Encounter, Boss 2-Phase, Recap, Map Hub, Parental Gate) PASS 100%!
✓ Mobile Portrait (390x844): Story intro & Rotate hint verified

====================================================
  KIỂM THỬ TRÌNH DUYỆT ĐẠT 100%!     
====================================================
```

### 3.4. Kiểm tra tương thích mã nguồn cũ
- `python scripts/verify_game.py`: **ALL VERIFICATIONS PASSED SUCCESSFULLY!**
- `node scripts/test_pet_system.cjs`: **10 pet runtime checks passed.**

---

## 4. Kết luận Cổng nghiệm thu Giai đoạn 5

- [x] Cả 6 vùng đất đều có nội dung hoàn chỉnh, câu đố môi trường và trận đấu Trùm 2 pha đặc trưng.
- [x] Toàn bộ 44 câu hỏi đạt 100% chuẩn xác thực schema và phù hợp độ tuổi mầm non 5–6 tuổi.
- [x] Không tồn tại màn hình phạt hay Game Over; luôn có nút gợi ý và cho phép thử lại ngay.
- [x] 100% các bài kiểm tra tự động (7 bộ Unit Test + Playwright Browser Test) đều đạt kết quả xuất sắc.

**CỔNG NGHIỆM THU GIAI ĐOẠN 5: HOÀN THÀNH TOÀN DIỆN — ĐỦ ĐIỀU KIỆN TIẾN HÀNH GIAI ĐOẠN 6 (ÂM THANH, PWA, TỐI ƯU VÀ PHÁT HÀNH THỬ NGHIỆM).**
