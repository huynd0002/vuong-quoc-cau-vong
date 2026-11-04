# GIAI ĐOẠN 3: VERTICAL SLICE VÙNG 1 HOÀN CHỈNH (KHU RỪNG CỔ TÍCH)
**Dự án:** Tái xây dựng Vương Quốc Cầu Vồng (Rainbow Kingdom RPG)  
**Trạng thái:** HOÀN THÀNH NGHIỆM THU  
**Ngày thực hiện:** 18/10/2026  
**Quy chuẩn áp dụng:** `KE_HOACH_REBUILD_GAME.md` — Mục 5: Giai đoạn 3  

---

## 1. Mục tiêu và phạm vi của Giai đoạn 3

Giai đoạn 3 chuyển đổi Vertical Slice khung cơ bản của Giai đoạn 2 thành một **Trải nghiệm chơi hoàn chỉnh (Complete Playable Vertical Slice) tại Vùng 1 — Khu Rừng Cổ Tích**:
1. **Cốt truyện mở đầu (Narrative Intro Modal):** Hộp thoại cốt truyện ấm áp với giọng đọc tiếng Việt và hình minh họa Thỏ Bông, giới thiệu bối cảnh Vương Quốc Cầu Vồng bị màn sương tím bao phủ và sứ mệnh dùng phép màu tri thức để giải cứu các bạn nhỏ.
2. **Ngân hàng câu hỏi Vùng 1 mở rộng & Cơ chế chống lặp (Anti-repeat):**
   - Mở rộng từ 2 lên 8 câu hỏi chuẩn hóa sư phạm mầm non 5–6 tuổi về nhận biết màu sắc và hình khối cơ bản (Đỏ, Xanh dương, Vàng, Xanh lá, Hình tròn, Hình vuông, Hình tam giác, Hình ngôi sao).
   - Cơ chế chọn câu ngẫu nhiên có kiểm tra lịch sử câu hỏi vừa hỏi (`recentQuestionIds`) nhằm tránh việc bé gặp lại câu hỏi giống hệt liên tiếp.
3. **Cơ chế gợi ý trực quan (Hint & Encouragement):**
   - Nút "💡 Bé cần gợi ý?" cho phép bé nhận sự trợ giúp bất cứ lúc nào.
   - Khi trả lời chưa đúng, hệ thống đưa ra lời động viên êm dịu ("Không sao đâu bé ơi, thử lại lần nữa nhé!"), tự động đọc to gợi ý và cho phép thử lại ngay mà không bị trừ mạng hay phạt điểm.
4. **Câu đố tương tác bản đồ (Props Puzzle — Cổng Hoa Cầu Vồng):**
   - Vật thể tương tác trên bản đồ (`PropsPuzzle.js`) kết nối logic tiến trình: Cổng hoa cổ thụ tỏa sáng và yêu cầu giải cứu đủ 2 bạn quái vật nhỏ (`caterpillar_green` và `caterpillar_yellow`) trước khi cánh cổng mở ra dẫn đến Sào huyệt Nấm Mũ Đỏ.
5. **Trận đấu Trùm 2 pha sư phạm (Multi-phase Boss — Nấm Mũ Đỏ):**
   - **Pha 1 (Màn sương buồn ngủ):** Nấm Mũ Đỏ bị mộng du dưới màn sương tím, thử thách giải đố màu sắc để xua tan sương mù.
   - **Pha 2 (Bừng tỉnh rực rỡ):** Nấm Mũ Đỏ thức tỉnh, thử thách đếm cánh hoa/hình học để hoàn tất nghi thức giải cứu.
   - **Thanh tiến trình 2 pha trực quan:** Bé theo dõi rõ ràng tiến độ thanh hoa 2 pha, sau khi giải cứu thành công Nấm Mũ Đỏ hóa thành Bạn Nấm Cầu Vồng thân thiện tặng Sao và mở khóa Vùng 2.
6. **Bảng chăm sóc Thỏ Bông tương tác (Pet Care Modal):**
   - Giao diện dạng Bottom Sheet thân thiện với trẻ nhỏ: Cho ăn cà rốt giòn, Tắm bọt xà phòng, Ném bóng vui vẻ, Cho ngủ lấy sức.
   - Cập nhật thời gian thực các chỉ số No bụng, Sạch sẽ, Vui vẻ, Năng lượng và điểm Thân thiết (Affinity), tuân thủ 100% quy chuẩn `PET_PLAN.md`.
7. **Màn hình vinh danh & chuyển vùng (Recap Screen):**
   - Tổng kết thành tích: Sao thu thập, Số bạn bè được giải cứu, Cấp độ đạt được.
   - Hiệu ứng pháo hoa sao cầu vồng và âm thanh chiến thắng hân hoan, kèm nút dẫn lối bước sang Vùng 2 (Đồi Cỏ May Mắn).

---

## 2. Các thành phần mã nguồn mới và nâng cấp

```text
src/
├── content/
│   └── questions/
│       └── questionBank.js       # Bổ sung 8 câu hỏi Vùng 1 + hàm getRandomZoneQuestion chống lặp
├── game/
│   ├── entities/
│   │   ├── Boss.js               # Thực thể Trùm 2 pha (Nấm Mũ Đỏ, thanh máu pha, hoạt ảnh thức tỉnh)
│   │   └── PropsPuzzle.js        # Thực thể Cổng Hoa Cầu Vồng (logic tương tác chạm, kiểm tra điều kiện)
│   ├── scenes/
│   │   └── WorldScene.js         # Nâng cấp: Tích hợp Story Modal, Props Puzzle, Boss 2 pha, Recap Modal
│   ├── systems/
│   │   └── combatSystem.js       # Nâng cấp: Xử lý trận đấu nhiều pha, chuyển pha mềm mượt
│   └── ui/
│       ├── HudController.js      # Nâng cấp: Nút mở nhanh bảng chăm sóc Thỏ Bông
│       ├── PetCareModal.js       # MỚI: Bảng điều khiển tương tác chăm sóc Thỏ Bông
│       ├── QuestionDialog.js     # Nâng cấp: Nút trợ giúp gợi ý, giao diện đấu Trùm 2 pha
│       ├── RecapModal.js         # MỚI: Màn hình vinh danh chiến thắng và chuyển tiếp Vùng 2
│       └── StoryIntroModal.js    # MỚI: Hộp thoại dẫn dắt cốt truyện đầu game
├── styles/
│   └── game.css                  # Bổ sung style cho Story Modal, Pet Care Sheet, Boss Phase Bar, Recap Modal
└── tests/
    ├── browser/
    │   └── browserSmoke.test.js  # Mở rộng kịch bản test toàn diện luồng Vùng 1 trên 3 Viewports
    └── unit/
        ├── runAllUnitTests.js    # Runner tổng hợp 5 bộ unit test
        └── zone1Content.test.js  # MỚI: Bộ unit test cho nội dung Vùng 1, câu đố và trùm 2 pha
```

---

## 3. Kết quả đo kiểm và kiểm thử tự động (Verification Evidence)

### 3.1. Kết quả Build Production (Vite 6)
```text
> vite build
✓ 33 modules transformed.
dist/game.html                                9.49 kB │ gzip:   2.99 kB
dist/assets/pet_bunny_idle-viJNGFSm.png      11.74 kB
dist/assets/mon_caterpillar-dXsXZalI.png     80.26 kB
dist/assets/hero_idle-CwPuxE1X.png           99.36 kB
dist/assets/map_1_bg-DT7YdxRS.png           495.14 kB
dist/assets/main-CPmb5tQI.css                11.71 kB │ gzip:   3.43 kB
dist/assets/main-DJeLsx0k.js              1,532.87 kB │ gzip: 354.75 kB
✓ built in 5.26s
```
- **Tốc độ build:** 5.26 giây.
- **Tổng dung lượng tải qua mạng (Gzip):** ~358 kB (vẫn đảm bảo tối ưu dưới 400 kB).

### 3.2. Kết quả Unit Tests (`npm run test:unit`)
Tất cả 5/5 bộ kiểm thử độc lập vượt qua với kết quả tuyệt đối:
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
✓ Test 5 Passed: All 19 questions in QUESTION_BANK are 100% valid
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
```

### 3.3. Kết quả Kiểm thử Trình duyệt Playwright (`npm run test:browser`)
Chạy kiểm thử tương tác thực tế toàn diện trên 3 môi trường màn hình:
```text
--- [Test] Playwright Browser Smoke Test (Giai đoạn 3: Vùng 1 Vertical Slice) ---
✓ Desktop HD (1280x720): Full Vertical Slice Playthrough (Story, Pet, Encounter, Boss 2-Phase, Recap) PASS 100%!
✓ Mobile Landscape (844x390): Full Vertical Slice Playthrough (Story, Pet, Encounter, Boss 2-Phase, Recap) PASS 100%!
✓ Mobile Portrait (390x844): Story intro & Rotate hint verified

====================================================
  KIỂM THỬ TRÌNH DUYỆT GIAI ĐOẠN 3 ĐẠT 100%!     
====================================================
```
- **Kịch bản đã kiểm chứng trên browser:**
  1. Hộp thoại cốt truyện (Story Intro) hiển thị đẹp mắt, đóng hộp thoại bắt đầu chơi.
  2. Mở bảng chăm sóc Thỏ Bông (Pet Care Sheet), thao tác cho ăn, cập nhật thanh no bụng.
  3. Bắt đầu thử thách giải cứu bạn sâu xanh, kiểm tra bấm nút Gợi ý (Hint), thử chọn đáp án sai để kiểm tra thông điệp động viên và thử lại ngay, chọn đáp án đúng để hoàn tất giải cứu.
  4. Tiếp cận và kích hoạt trận đấu Trùm Nấm Mũ Đỏ:
     - Hoàn thành Pha 1 (Màn sương buồn ngủ) $\to$ Trùm chuyển sang Pha 2.
     - Hoàn thành Pha 2 (Bừng tỉnh rực rỡ) $\to$ Chiến thắng giải cứu Trùm.
  5. Màn hình Vinh danh (Recap Modal) xuất hiện đầy đủ huy hiệu sao, bạn bè được cứu và nút mở khóa Vùng 2.
  6. Xoay màn hình dọc (Mobile Portrait) hiển thị đúng hướng dẫn xoay ngang `rotate-hint`.

### 3.4. Kiểm tra tương thích ngược mã nguồn cũ
- `python scripts/verify_game.py`: **100% PASS**
- `node scripts/test_pet_system.cjs`: **100% PASS**

---

## 4. Kết luận Cổng nghiệm thu Giai đoạn 3

- [x] Vertical Slice Vùng 1 đã hoàn chỉnh 100% về cả gameplay, câu chuyện, câu đố và trùm 2 pha.
- [x] Không tồn tại màn hình "Game Over" hay cơ chế trừng phạt; trẻ em luôn được hỗ trợ gợi ý và thử lại ngay lập tức.
- [x] Hệ thống Thỏ Bông hoạt động gắn kết với trải nghiệm chơi và bảo đảm an toàn dữ liệu.
- [x] Toàn bộ 5 bộ Unit Test và Browser Playwright Test trên Desktop lẫn Mobile đều đạt chuẩn 100%.

**CỔNG NGHIỆM THU GIAI ĐOẠN 3: HOÀN THÀNH XUẤT SẮC — ĐỦ ĐIỀU KIỆN TIẾN HÀNH GIAI ĐOẠN 4 (MỞ RỘNG CHIẾN DỊCH 6 VÙNG & HOÀN THIỆN LƯU TRỮ TRỌN VẸN).**
