# GIAI ĐOẠN 4: CAMPAIGN, TIẾN TRÌNH VÀ LƯU TRỮ
**Dự án:** Tái xây dựng Vương Quốc Cầu Vồng (Rainbow Kingdom RPG)  
**Trạng thái:** HOÀN THÀNH NGHIỆM THU  
**Ngày thực hiện:** 18/10/2026  
**Quy chuẩn áp dụng:** `KE_HOACH_REBUILD_GAME.md` — Mục 5: Giai đoạn 4  

---

## 1. Mục tiêu và phạm vi của Giai đoạn 4

Giai đoạn 4 hiện thực hóa cấu trúc tiến trình tổng thể của toàn bộ trò chơi từ Vùng 1 đến Vùng 6 và Đại Tiệc Vinh Quang Kết Thúc (Grand Finale):
1. **Đồ thị Chiến dịch (Campaign Graph):**
   - Thiết lập cấu hình đồ thị chiến dịch tại `src/content/campaign/campaignGraph.js` kết nối tuần tự và logic 6 vùng đất:
     - **Vùng 1: Làng Quê Yên Bình** (Màu sắc & Hình khối) $\to$ Nhận *Pha Lê Đỏ Tình Bạn*.
     - **Vùng 2: Vịnh Biển Pha Lê** (Đếm số lượng 1–10) $\to$ Nhận *Pha Lê Cam Năng Động*.
     - **Vùng 3: Động Pha Lê Lấp Lánh** (Phép cộng trực quan $\le 5$) $\to$ Nhận *Pha Lê Vàng Rực Rỡ*.
     - **Vùng 4: Rừng Kẹo Ngọt** (Phép trừ trực quan $\le 5$) $\to$ Nhận *Pha Lê Xanh Hy Vọng*.
     - **Vùng 5: Hẻm Núi Gió Hát** (So sánh Lớn hơn - Bé hơn - Bằng nhau) $\to$ Nhận *Pha Lê Lam Trí Tuệ*.
     - **Vùng 6: Cung Đình Thần Long** (Quy luật chuỗi hình & Tổng kết) $\to$ Nhận *Pha Lê Tím Diệu Kỳ*.
     - **Đại Tiệc Cầu Vồng Khải Hoàn (Grand Finale):** Mở khóa khi thu thập đủ 6 viên Pha Lê Cầu Vồng.
   - Mỗi vùng đất sở hữu: Điều kiện tiên quyết (`prerequisites`), Danh sách nhiệm vụ chính (`mainQuests`), Nhiệm vụ phụ với Thỏ Bông (`sideQuests`), Vật phẩm cốt truyện (`storyItem`) và Vùng đất tiếp theo (`nextZoneId`).
2. **Quản lý Quest Flags, Vật phẩm cốt truyện & Thống kê học tập:**
   - Mở rộng `saveAdapter.js` và `progressionSystem.js` để lưu trữ an toàn:
     - `questFlags`: Bật/tắt cờ sự kiện môi trường (mở cổng hoa, đánh thức boss...).
     - `completedMaps`: Danh sách các vùng đất đã giải cứu hoàn toàn.
     - `storyItems`: Bộ sưu tập 6 viên Pha Lê Cầu Vồng.
     - `learningStats`: Ghi nhận số câu trả lời đúng ngay lần đầu (`firstTryCount`), tổng số câu (`totalAnswers`), tỷ lệ chính xác (`accuracy`), và thống kê kỹ năng đã rèn luyện (`skillsPracticed`).
3. **Cơ chế Chơi Lại Vùng (Replay Zone) & Khóa Người Lớn (Parental Gate):**
   - Trẻ em có thể tự do bấm chọn bất kỳ vùng đất nào đã mở khóa để chơi lại, luyện tập thêm kỹ năng toán học và nhận thêm Sao/EXP mà **tuyệt đối không bị xóa tiến độ hay khóa lại map cũ**.
   - Thiết lập thành phần `ParentalGateModal.js` bảo vệ trẻ nhỏ: Khi muốn xóa dữ liệu chơi (`Reset Save`) hoặc thay đổi cài đặt nhạy cảm, hệ thống sinh ra một câu đố toán học người lớn (ví dụ: `17 + 19 = ?` hoặc `4 × 7 = ?`). Trẻ 5–6 tuổi không thể vô tình bấm nhầm xóa mất công sức chơi.
4. **Finite State Machine (FSM) kiểm soát chuyển trạng thái:**
   - Xây dựng cỗ máy trạng thái hữu hạn tại `src/game/systems/gameStateMachine.js` với 9 trạng thái chuẩn:
     `BOOT`, `HUB_MAP_SELECT`, `WORLD_EXPLORATION`, `ENCOUNTER_QUESTION`, `BOSS_BATTLE`, `RECAP_VICTORY`, `PET_CARE`, `PARENTAL_GATE`, `GRAND_FINALE`.
   - Bảng chuyển trạng thái hợp lệ (`VALID_TRANSITIONS`) và các bộ lọc bảo vệ (Guard):
     - Ngăn chặn hoàn toàn việc mở đè modal (ví dụ: đang chăm sóc Pet không thể bị quái kích hoạt battle).
     - Tự động tạm dừng / khôi phục nhận diện input ở scene thế giới khi vào/ra modal.
     - Hỗ trợ cơ chế khôi phục khẩn cấp (`recoverToExploration()`).
5. **Giao diện Bản đồ thế giới (Map Selection Hub) & Màn vinh danh Grand Finale:**
   - Giao diện `MapSelectModal.js` hiển thị trực quan tiến độ % chiến dịch, huy hiệu 6 vùng đất, trạng thái Đang chơi / Đã xong / Đang khóa và số lượng Pha Lê đã thu thập.
   - Màn hình `GrandFinaleModal.js` với vương miện cầu vồng, pháo hoa, vinh danh cấp độ và tổng kết quá trình học tập của bé.

---

## 2. Kiến trúc & Tệp mã nguồn mới / nâng cấp

```text
src/
├── content/
│   └── campaign/
│       └── campaignGraph.js      # MỚI: Cấu hình đồ thị chiến dịch 6 vùng & Grand Finale
├── game/
│   ├── systems/
│   │   ├── gameStateMachine.js   # MỚI: Cỗ máy trạng thái FSM (9 trạng thái, guard rules)
│   │   └── progressionSystem.js  # NÂNG CẤP: Quản lý questFlags, completedMaps, storyItems, learningStats
│   └── ui/
│       ├── GrandFinaleModal.js   # MỚI: Màn hình vinh danh kết thúc chiến dịch 6 vùng
│       ├── MapSelectModal.js     # MỚI: Hub chọn vùng đất thế giới, hiển thị tiến độ 6 vùng & pha lê
│       └── ParentalGateModal.js  # MỚI: Hộp thoại xác thực người lớn bảo vệ dữ liệu save
├── services/
│   └── save/
│       └── saveAdapter.js        # NÂNG CẤP: Deep merge & serialization cho Schema V2 mở rộng
├── styles/
│   └── game.css                  # BỔ SUNG: Định dạng CSS cho Map Hub, Parental Gate, Grand Finale
└── tests/
    ├── browser/
    │   └── browserSmoke.test.js  # NÂNG CẤP: Kiểm thử tương tác Playwright Map Hub & Parental Gate
    └── unit/
        ├── campaignStateMachine.test.js # MỚI: 6 bài test độc lập cho Campaign, FSM & Parental Gate
        └── runAllUnitTests.js    # NÂNG CẤP: Tổng hợp 6/6 bộ unit test
```

---

## 3. Kết quả đo kiểm và kiểm thử tự động (Verification Evidence)

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
dist/assets/main-BxwhUZm4.js              1,554.07 kB │ gzip: 360.88 kB
✓ built in 4.62s
```
- **Thời gian build:** 4.62 giây.
- **Tổng dung lượng tải qua mạng (Gzip):** ~365 kB (đạt chuẩn tải nhanh trên di động).

### 3.2. Kết quả Unit Tests (`npm run test:unit`)
Toàn bộ **6/6 bộ unit test** vượt qua xuất sắc:
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

--- [Test] Giai đoạn 4: Campaign, State Machine & Lưu trữ ---
✓ Test 1 Passed: Campaign Graph unlock rules
✓ Test 2 Passed: 6 Crystals & Grand Finale condition
✓ Test 3 Passed: Quest flags and Learning stats tracking
✓ Test 4 Passed: FSM transitions, guard rejections, and recovery
✓ Test 5 Passed: Replay zone preserves all progress and rewards
✓ Test 6 Passed: Parental gate challenge generation
```

### 3.3. Kết quả Kiểm thử Trình duyệt Playwright (`npm run test:browser`)
```text
--- [Test] Playwright Browser Smoke Test (Giai đoạn 4: Campaign & State Machine) ---
✓ Desktop HD (1280x720): Full Vertical Slice & Campaign Map (Story, Pet, Encounter, Boss 2-Phase, Recap, Map Hub, Parental Gate) PASS 100%!
✓ Mobile Landscape (844x390): Full Vertical Slice & Campaign Map (Story, Pet, Encounter, Boss 2-Phase, Recap, Map Hub, Parental Gate) PASS 100%!
✓ Mobile Portrait (390x844): Story intro & Rotate hint verified

====================================================
  KIỂM THỬ TRÌNH DUYỆT GIAI ĐOẠN 4 ĐẠT 100%!     
====================================================
```
- Không có bất kỳ lỗi console / uncaught exception nào.
- Đã kiểm tra mở Map Select Modal, kiểm tra mở Parental Gate và hủy bỏ an toàn, đóng mở nhịp nhàng không xung đột input scene nền.

### 3.4. Kiểm tra tương thích mã nguồn cũ
- `python scripts/verify_game.py`: **ALL VERIFICATIONS PASSED SUCCESSFULLY!**
- `node scripts/test_pet_system.cjs`: **10 pet runtime checks passed.**

---

## 4. Kết luận Cổng nghiệm thu Giai đoạn 4

- [x] Campaign Graph 6 vùng đất kết nối chặt chẽ và nhất quán với ma trận học tập.
- [x] Quản lý cờ nhiệm vụ, vật phẩm cốt truyện và kết quả học tập được lưu trữ an toàn.
- [x] Cơ chế chơi lại vùng hoàn toàn không làm mất tiến độ; khóa người lớn Parental Gate bảo vệ tuyệt đối dữ liệu của bé.
- [x] State machine FSM phân định ranh giới rõ ràng giữa các trạng thái và modal, không rò rỉ input.
- [x] 100% các bài kiểm tra tự động (6 bộ Unit test + Playwright test) đều đạt chuẩn.

**CỔNG NGHIỆM THU GIAI ĐOẠN 4: HOÀN THÀNH XUẤT SẮC — ĐỦ ĐIỀU KIỆN TIẾN HÀNH GIAI ĐOẠN 5 (MỞ RỘNG TOÀN DIỆN NỘI DUNG 6 VÙNG ĐẤT).**
