# Báo cáo rà soát và định hướng phát triển game

**Dự án:** Vương Quốc Cầu Vồng  
**Ngày rà soát:** 18/10/2026  
**Phạm vi:** Tài liệu `PLAN.md`, `TASK.md`, `PET_PLAN.md`, `RULES.md`, `ASSETS.md`; mã thực thi trong `index.html` và `js/assetLoader.js`; cấu trúc tài nguyên và các kiểm tra hiện có.

## 1. Kết luận điều hành

Dự án đã vượt qua giai đoạn demo đơn giản: có 6 bản đồ, chiến đấu theo lượt gắn với câu hỏi học tập, nhân vật/quái có một phần hoạt ảnh, vật phẩm trang trí, tiến trình và hệ thống chăm sóc Thỏ Bông tương đối sâu. Hướng phù hợp không phải thêm thật nhiều nút hoặc chỉ số, mà là biến nội dung hiện có thành một cuộc phiêu lưu có chương hồi, mục tiêu rõ, tiến trình mở khóa có ý nghĩa, câu hỏi đa dạng theo kỹ năng và phản hồi thị giác/âm thanh thống nhất.

Ưu tiên tiếp theo nên là:

1. Chuẩn hóa một nguồn sự thật giữa tài liệu, cấu hình, asset manifest và hành vi thực tế.
2. Làm vòng lặp bản đồ → nhiệm vụ → giải cứu → phần thưởng → mở đường/boss → kết thúc chương rõ ràng và lưu được.
3. Tăng chiều sâu câu hỏi bằng ngân hàng câu hỏi theo kỹ năng và độ khó, không chỉ tăng HP hoặc lặp câu hỏi.
4. Hoàn thiện phong cách hình ảnh/hoạt ảnh nhất quán, dùng đúng bộ UI sprite đã có và bổ sung asset còn thiếu theo từng đợt có kiểm duyệt.
5. Refactor `index.html` lớn thành module trước khi tăng nhiều nội dung, để nâng cấp không làm hỏng hệ thống cũ.

## 2. Hiện trạng đã xác nhận

### Gameplay và nội dung

- Có 6 cấu hình map trong `GAME_CONFIG.maps`: Làng Quê, Vịnh Biển, Động Pha Lê, Sa Mạc, Hẻm Núi và Cung Đình Thần Long.
- Mỗi map hiện có khoảng 4 câu hỏi viết trực tiếp trong cấu hình; các chủ đề gồm màu sắc/hình khối, đếm, cộng trừ, so sánh và quy luật.
- Bản đồ có di chuyển bằng cảm ứng/bàn phím, quái tuần tra, tự vào trận khi lại gần; một số map có cổng hoặc chìa khóa.
- Battle có câu hỏi đọc bằng Speech API, nút nghe lại, đáp án nhiều lựa chọn, đòn đánh và phản công, tim, khiên/né, gợi ý và phần thưởng.
- Nhân vật, thú và nhiều quái đã có ảnh/hoạt ảnh. `assets/monsters/map2` và `map3` có bộ hoạt ảnh và hiệu ứng phong phú hơn các map khác.
- Phần thắng battle trao sao/EXP; quái thường và boss có phần thưởng khác nhau. Cấp nhân vật và vũ khí được tăng/mở theo ngưỡng hiện tại.
- Hệ thống Thỏ Bông có nhu cầu, chăm sóc, cooldown, XP/cấp, thưởng ngày tùy chọn, suy giảm offline có giới hạn, đi cùng và bảo vệ trong battle. `PET_PLAN.md` mô tả chính sách trẻ em an toàn, không phạt khi nghỉ.
- Save lưu trong `localStorage`, có migration và kiểm tra dữ liệu pet.
- Có bộ UI art lớn trong `assets/ui/kids_gui`, `assets/ui/hud`, `assets/ui/gems` và spritesheet atlas.

### Kiểm tra đã chạy

- `node scripts/test_pet_system.cjs`: 10 kiểm tra runtime cho pet và tích hợp battle đều đạt.
- `python scripts/verify_game.py`: đạt kiểm tra cú pháp, manifest, DOM và một số feature. Script vẫn in các asset Map 1 là tùy chọn/fallback; phần đó không được tính là thiếu nghiêm trọng theo logic của script.
- Đây chưa phải kiểm thử toàn game trên trình duyệt, thiết bị thật hoặc với trẻ em.

## 3. Những điểm chưa đạt hoặc có rủi ro

### A. Kế hoạch và bản chạy không đồng bộ

- `PLAN.md` mô tả 3 map và một số tên map/chủ đề cũ, trong khi mã hiện tại có 6 map và chủ đề đã thay đổi.
- `TASK.md` vẫn đánh dấu một số việc cũ đã hoàn thành hoặc chưa hoàn thành không nhất quán với code hiện tại; ví dụ game vẫn tập trung trong `index.html`, dù task nói module asset đã có, còn task tách module vẫn chưa làm.
- `RULES.md` còn nêu các quy định/ID cũ như HUB và cấm zoom, trong khi state, cấu hình viewport và giao diện hiện tại đã thay đổi.
- `ASSETS.md` mô tả tên nhân vật Sam và cấu trúc cũ; code/asset hiện dùng Bé Sâu. Một số danh mục không phản ánh đầy đủ các asset map 2/3 mới.
- PWA, `manifest.json`, service worker/offline cache, Firebase/Auth và Parent Gate chỉ xuất hiện trong định hướng tài liệu; không tìm thấy triển khai tương ứng trong project.

**Tác động:** người triển khai sau dễ sửa nhầm tên, thiếu asset, cho rằng tính năng đã tồn tại hoặc tạo thêm cấu hình trùng.

### B. Tiến trình và cấu trúc chiến dịch còn nông

- Màn chọn map hiện cho vào chơi ngay cả 6 vùng; chưa thấy quy tắc khóa vùng sau theo hoàn thành vùng trước.
- Map có chủ đề, banner và cơ chế riêng nhưng chưa hình thành campaign có màn mở đầu, nhiệm vụ chính/phụ, tiến độ, kết thúc chương hoặc recap cho bé.
- Chìa khóa/cổng được tạo lại khi nạp map. Cần xác định rõ đây là nhiệm vụ chơi lại có chủ đích hay tiến trình chưa lưu; hiện chưa thấy sổ hoàn thành vùng/boss lưu trong player save.
- Các map 2, 4 và 5 tái sử dụng một số quái/asset từ map khác. Map 6 tái sử dụng boss Pha Lê; cần quyết định đây là chủ ý hay placeholder.
- Phần thưởng cấp nhân vật hiện chỉ xử lý một lần khi EXP đạt ngưỡng trong một trận; nên bảo đảm không bỏ sót cấp nếu sau này phần thưởng lớn hoặc có nhiều ngưỡng.

**Tác động:** game có nhiều bản đồ nhưng chưa tạo cảm giác hành trình dài, mở khóa và trưởng thành có mục tiêu.

### C. Học liệu chưa đủ để chơi dài hạn

- Mỗi map chỉ có khoảng 4 câu hỏi cố định; chơi lặp sẽ nhanh thuộc đáp án thay vì hiểu kỹ năng.
- Chưa thấy phân bậc độ khó, kỹ năng học, dạng câu hỏi, gợi ý từng bước, câu hỏi ôn tập yếu điểm hoặc chống lặp gần đây.
- Nhiều câu chỉ dùng emoji trong chuỗi chữ; chưa dùng tài nguyên minh họa học liệu trong `assets/edu/` như thiết kế `ASSETS.md`.
- Chưa có kiểm tra tự động xác nhận câu hỏi có đủ `q/speak/ans/correct`, đáp án đúng nằm trong phạm vi và hai câu không mâu thuẫn.
- Cần rà độ phù hợp lứa tuổi và tính đúng của mọi câu hỏi/đáp án bởi người làm giáo dục; câu hỏi cần hỗ trợ nghe, hình ảnh và thao tác không phụ thuộc khả năng đọc thành thạo.

**Tác động:** nội dung ngắn hạn, giá trị học tập và khả năng mở rộng bị giới hạn.

### D. Đồ họa và trải nghiệm chưa đồng đều

- Chất lượng asset không đồng nhất giữa các bản đồ: Map 2/3 có nhiều hoạt ảnh state/impact; Map 1 thiếu asset chuẩn trong đường dẫn `assets/monsters/map1` theo lần chạy verifier; Map 4–6 chưa thấy bộ quái/hiệu ứng tương đương trong cây asset được kiểm tra.
- Có nhiều bộ UI khác nhau (`kids_gui`, `hud`, `gems`) nhưng cần chốt một bộ chủ đạo, vai trò từng bộ và quy tắc sử dụng; nếu trộn tự do sẽ mất nhận diện.
- Một số asset/UI trong manifest có thể chỉ được dự phòng hoặc chưa dùng ở mọi màn; cần audit đường dẫn và trạng thái tải thật, không chỉ kiểm tra key tồn tại.
- Hiệu ứng hiện tập trung vào battle; khám phá map, nhặt vật phẩm, mở cổng, hoàn thành nhiệm vụ và chuyển cảnh cần nhiều phản hồi nhỏ có chủ đích.
- SpeechSynthesis phụ thuộc trình duyệt/giọng cài đặt; file thu âm từng câu hỏi được liệt kê nhưng chưa có thư mục âm thanh trong project khi rà soát.

### E. Kiến trúc và chất lượng phát hành

- `index.html` khoảng 4.6 nghìn dòng, chứa cấu hình, UI, state, lưu trữ, map, battle, pet và game loop. Đây là rủi ro lớn nhất khi thêm campaign, nhiều câu hỏi và nhiều loại hoạt động.
- `js/assetLoader.js` tồn tại nhưng một manifest lớn khác vẫn nằm trong HTML; cần tránh hai nguồn sự thật lệch nhau.
- Chưa có package/test runner hoặc bộ test gameplay tổng quát; test pet dùng VM trích code theo chuỗi, hữu ích nhưng nhạy với thay đổi cấu trúc.
- Không tìm thấy kiểm thử trình duyệt tự động, accessibility audit hoặc ma trận thiết bị được chạy trong lần rà soát này.
- Cần kiểm tra hiệu năng tải vì game preload nhiều ảnh lớn và WebP hoạt họa; cần có ngân sách kích thước, lazy-load theo map và báo tiến độ tải.

## 4. Hướng thiết kế gameplay dài hơi

### Đề xuất vòng lặp chính

1. **Chọn hành trình:** bản đồ thế giới hiện chương đang mở, mục tiêu và phần thưởng dự kiến.
2. **Nhận nhiệm vụ ngắn:** một mục tiêu rõ bằng hình/giọng nói, ví dụ tìm 3 vật, giúp 2 bạn hoặc sửa một cây cầu.
3. **Khám phá:** di chuyển, quan sát, tương tác với đồ vật, nhân vật thân thiện; có tùy chọn gợi ý bằng hình/giọng.
4. **Thử thách học:** battle hoặc mini-game gắn với kỹ năng của vùng. Trả lời sai vẫn được thử tiếp và nhận gợi ý, không mất tiến trình cốt lõi.
5. **Giải cứu và kết quả:** hoạt ảnh quái được giải cứu, sao/EXP, vật phẩm sưu tầm có giới hạn, tóm tắt điều bé vừa luyện.
6. **Mở nội dung tiếp:** hoàn thành nhiệm vụ chính mở đường/đích mới; nhiệm vụ phụ, chăm sóc thú và trang trí là tùy chọn.

### Cách tăng chiều sâu mà không làm game quá khó

- Thêm **chương hồi**: mỗi vùng có 3–5 nhiệm vụ nhỏ, 1 thử thách cuối vùng và một cảnh kết thúc.
- Dùng **bậc kỹ năng** thay vì chỉ tăng số: đếm 1–5 → ghép số với lượng → cộng/trừ bằng vật thể → bài toán kể chuyện ngắn.
- Tạo 3 mức hỗ trợ: nghe lại → làm nổi bật thông tin cần chú ý → loại một đáp án sai. Dùng hỗ trợ không làm mất sao hoàn thành.
- Chọn câu hỏi từ ngân hàng theo kỹ năng và lịch sử lượt gần đây; không lặp câu vừa xuất hiện, vẫn giữ tỷ lệ câu ôn tập.
- Cho boss có **nhiều pha hình ảnh** (quan sát dấu hiệu → giải câu hỏi → phá lá chắn → giải cứu), không cần tăng hình phạt hay thời lượng chiến đấu quá dài.
- Thêm vật phẩm sưu tầm/trang trí gắn với khám phá và thành tích học, không bán tiền thật, không dùng chuỗi đăng nhập hoặc phạt khi nghỉ.
- Theo dõi kỹ năng ở dạng tóm tắt thân thiện cho phụ huynh; chỉ lưu dữ liệu học tối thiểu, có giải thích và cổng phụ huynh nếu sau này xuất dữ liệu.
- Giữ Thỏ Bông là bạn đồng hành xuyên suốt. Dùng tương tác chăm sóc ngắn làm nhịp nghỉ, không để chỉ số thú khóa bản đồ hoặc gây áp lực quay lại.

## 5. Lộ trình đề xuất

### P0 — Củng cố nền trước khi thêm nhiều nội dung

- Viết lại `PLAN.md`, `TASK.md`, `RULES.md`, `ASSETS.md` theo hiện trạng 6 map, Bé Sâu và feature thực sự có; ghi trạng thái rõ: hoàn thành, một phần, chưa làm, đề xuất.
- Lập bảng dữ liệu chuẩn cho map: chủ đề học, kỹ năng, nhiệm vụ, quái, boss, asset, điều kiện mở, phần thưởng.
- Thêm validator cho cấu hình câu hỏi, map, asset path và trạng thái unlock.
- Sửa kiểm tra asset để phân biệt bắt buộc/tùy chọn theo map; rà tên file thực tế và manifest hai nơi.
- Tách ít nhất `GAME_CONFIG`, `SaveManager`, `Battle`, `PetSystem`, `UI` thành module riêng; giữ API và khóa save hiện tại để tránh mất tiến trình.

**Điều kiện hoàn tất:** tài liệu khớp game; toàn bộ key/path được báo cáo đúng; test cũ vẫn chạy; game khởi động từ module không đổi hành vi.

### P1 — Campaign và tiến trình có mục tiêu

- Thêm `campaignProgress` vào save: vùng mở khóa, nhiệm vụ hoàn tất, boss đã giải cứu, vật phẩm khám phá.
- Chỉ mở vùng tiếp theo sau mục tiêu cốt lõi phù hợp; vẫn cho chơi lại vùng đã mở và có nút reset an toàn.
- Thiết kế 3 nhiệm vụ ngắn/vùng trước, sau đó mới mở rộng đủ 6 vùng.
- Thêm màn mục tiêu, tiến độ và màn kết quả bằng hình/voice; tránh đoạn văn dài.
- Thay đổi map reload để không âm thầm reset vật phẩm/tiến độ nếu nhiệm vụ có tính liên tục.

**Điều kiện hoàn tất:** tải lại vẫn giữ tiến độ; vùng khóa/mở đúng; hoàn thành boss hiển thị kết quả; không thể soft-lock nếu rời trận.

### P2 — Ngân hàng học liệu và điều chỉnh độ khó

- Tách câu hỏi khỏi cấu hình map thành ngân hàng theo `skillId`, `difficulty`, `format`, `prompt`, `voiceText`, `choices`, `answer`, `hint`, `visualAsset`.
- Bổ sung đủ câu hỏi đã được duyệt cho từng kỹ năng; chọn ngẫu nhiên có kiểm soát và chống lặp.
- Tạo hoạt động ngoài battle: ghép cặp, kéo vật vào nhóm (có phương án bấm thay thế), đếm vật thể, tìm quy luật.
- Có trợ giúp và feedback tích cực; không đặt timer bắt buộc, không trừ thưởng cốt lõi vì trả lời sai.
- Bổ sung rà soát chuyên môn sư phạm và thử nghiệm usability với phụ huynh trước khi mở rộng hàng loạt.

### P3 — Hình ảnh, hoạt ảnh và âm thanh theo chuẩn sản xuất

- Chốt art bible: tỉ lệ đầu/thân, outline, palette từng vùng, hướng sáng, viền alpha, kích thước khung và quy tắc đặt tên.
- Làm asset pack theo vertical slice cho một vùng: idle/walk/attack/hit/rescue của hero và quái, projectile, impact, props, UI phù hợp.
- Dùng cùng pipeline export/QA cho Map 1–6; bảo đảm thumbnail, fallback và cảnh báo asset thiếu.
- Bổ sung hiệu ứng môi trường nhẹ, tương tác map và transition có thể giảm/tắt theo tùy chọn.
- Thu âm câu hỏi/thoại quan trọng sau khi nội dung đã ổn định; giữ Speech API làm fallback, cung cấp điều khiển tắt âm rõ ràng.
- Đặt ngân sách kích thước ảnh/audio, preload theo map thay vì tải toàn bộ mọi vùng ngay từ đầu.

### P4 — Hoàn thiện sản phẩm và kiểm thử

- Kiểm thử trình duyệt desktop/tablet/điện thoại ngang; các tỷ lệ nhỏ và landscape thấp; kiểm tra thao tác cảm ứng, keyboard, âm thanh tắt, giọng đọc thiếu, tải chậm và mất mạng.
- Kiểm thử save mới/cũ/hỏng, unlock, bỏ trận, thắng boss, chơi lại, reset và nâng cấp schema.
- Thêm browser smoke test cho luồng mở map → battle → trả lời → nhận thưởng → tải lại.
- Đánh giá khả năng đọc/độ tương phản, vùng bấm, focus bàn phím, reduced motion và quyền riêng tư.
- Chỉ cân nhắc PWA/offline cache khi luồng tải asset, cập nhật phiên bản và test offline đã có tiêu chí rõ; backend/Firebase chưa phải ưu tiên cho game chạy một thiết bị.

## 6. Danh sách kỹ năng/tool có thể áp dụng

Các tên dưới đây là **skill có sẵn trong môi trường hiện tại**, không đồng nghĩa với repository/package đã được cài vào dự án. Cần nạp skill theo đúng loại công việc; không thêm dependency chỉ vì skill gợi ý.

| Skill | Áp dụng vào dự án | Thời điểm/giới hạn |
| --- | --- | --- |
| `ui-ux-pro-max` | Rà soát UI game cho trẻ, responsive, phân cấp thông tin, accessibility, hành vi màn nhỏ và hướng design system. | Dùng khi sửa HUD, battle panel, màn chọn map, phòng thú; bảo toàn ngôn ngữ hình ảnh đã chọn. |
| `ui-styling` | Thực thi CSS/UI, component states, responsive layout, touch targets và nhất quán style. | Dùng sau khi chốt art direction; dự án hiện vanilla HTML/CSS, không cần đưa shadcn/Tailwind vào nếu không có quyết định đổi stack. |
| `design-system` | Xây token màu, typography, spacing, kích thước nút/panel và đặc tả component dùng chung. | Phù hợp để thống nhất `kids_gui`, `hud`, `gems`; đầu ra nên là token/đặc tả nhẹ, không thêm framework. |
| `generate2dmap` | Lên bố cục map/level, tiles, props, parallax/background và dữ liệu map có đường đi/điểm tương tác. | Rất phù hợp cho thiết kế 6 vùng và vertical slice; dùng khi cần tạo hoặc tái cấu trúc level. |
| `generate2dsprite` | Tạo master/sprite sheet nhân vật, quái, props, icon và hiệu ứng; đóng gói frame/metadata. | Phù hợp để chuẩn hóa asset pack và thay fallback; duyệt master trước khi tạo hàng loạt. |
| `video2dsprite` | Tạo chuyển động cho nhân vật/quái từ ảnh master đã duyệt, sau đó xử lý và đóng gói frame. | Dùng cho idle/attack/hit/celebrate khi muốn tăng chất lượng animation; không dùng cho map hoặc icon. |
| `generate2dmedia` | Kiểm tra route tạo ảnh/video, xử lý capability/key/spend và tạo media qua route được cấu hình. | Chỉ dùng như tầng gọi khi các skill sprite/map yêu cầu sinh media; kiểm tra chi phí và route trước. |
| `brand` | Chốt giọng kể, tên vùng, mô tả thế giới, cách phản hồi đúng/sai và nhất quán thương hiệu. | Hữu ích trước khi viết thêm chiến dịch/thoại; không thay đánh giá sư phạm. |
| `slides` | Tạo bản trình bày chiến lược cho roadmap hoặc review với nhóm/phụ huynh. | Tùy chọn; không cần cho triển khai game runtime. |
| `banner-design` | Làm key art/banner cho trang giới thiệu game hoặc hình quảng bá. | Tùy chọn; không ưu tiên hơn asset trong game. |
| `codeart2d` | Vẽ sprite/map bằng code khi người dùng yêu cầu rõ hoặc pipeline media không có route. | Không dùng mặc định; hình ảnh game nên ưu tiên pipeline tạo/QA art chuyên dụng. |

### Repo/package liên quan

- Trong workspace hiện không có Git repository metadata (`git status` trước đó trả về không phải Git repository), nên chưa xác nhận được remote hoặc repo bên ngoài nào là dependency của dự án.
- Các `skill` nêu trên là quy trình/tài liệu cục bộ tại thư mục skill, không phải package npm cần cài. Có thể áp dụng trực tiếp cho thiết kế và pipeline mà không thêm dependency runtime.
- Project hiện là HTML/CSS/JavaScript thuần. Chỉ chọn thư viện game/rendering (ví dụ engine canvas) sau khi làm prototype và đo được vấn đề cụ thể; chuyển engine ngay có rủi ro rewrite lớn, chưa được chứng minh cần thiết.
- Nên cân nhắc công cụ kiểm thử trình duyệt như Playwright ở giai đoạn P4 nếu nhóm chấp nhận thêm dev dependency và có quy trình cài đặt; chưa bắt buộc cho báo cáo này.

## 6.1. Repository GitHub đã lọc theo tiêu chí

**Tiêu chí:** hơn 500 stars, license MIT được GitHub API nhận diện, repo không bị archive/disabled, và có hoạt động cập nhật gần đây. Số sao là số GitHub API quan sát ngày **18/10/2026**, có thể thay đổi. Repo là thư viện/công cụ để học hoặc tích hợp từng phần, không phải game hoàn chỉnh có thể chép vào dự án.

| Mảng | Repository | Stars | License / hoạt động kiểm tra | Mức phù hợp và cách dùng |
| --- | --- | ---: | --- | --- |
| Engine 2D cho game web | [phaserjs/phaser](https://github.com/phaserjs/phaser) | 40,498 | MIT; API cập nhật 18/10/2026, push gần nhất 21/08/2026; không archive. | Phù hợp nhất nếu quyết định chuyển dần Canvas loop sang engine: scene, input, camera, animation, asset loading và scale cho mobile. Là migration lớn; nên prototype một map/battle độc lập trước, không thay toàn game ngay. |
| Tham khảo API/hiệu ứng Phaser | [rexrainbow/phaser3-rex-notes](https://github.com/rexrainbow/phaser3-rex-notes) | 1,331 | MIT; update 14/10/2026, push 17/10/2026; không archive. | Tài liệu/plugin phong phú cho UI, input, layout, transition và nhiều cơ chế. Dùng để tham khảo hoặc chọn plugin cụ thể sau khi dự án dùng Phaser; tránh cài cả bộ khi chưa cần. |
| Renderer 2D WebGL | [pixijs/pixijs](https://github.com/pixijs/pixijs) | 48,413 | MIT; update 18/10/2026, push 17/10/2026; không archive. | Mạnh về render sprite/texture/particle và cảnh nhiều hình ảnh. Đây là renderer, không phải game framework đầy đủ; chọn thay vì Phaser chỉ khi ưu tiên render/UI canvas và chấp nhận tự quản lý scene/game systems. Không nên dùng cả Pixi và Phaser cùng lúc nếu chưa có lý do. |
| Âm thanh/game audio | [goldfire/howler.js](https://github.com/goldfire/howler.js) | 25,396 | MIT; repo/API được cập nhật 18/10/2026, commit gần nhất API trả về 23/11/2025; không archive. | Quản lý nhạc nền, SFX, sprite audio, volume/mute và fallback cho trình duyệt. Có thể bổ sung sau khi có file audio; repo phổ biến nhưng commit gần nhất cũ hơn các repo khác nên cần kiểm tra release/changelog trước khi chốt phiên bản. Không thay thế Speech API/thu âm lời đọc. |
| Animation UI/DOM/SVG | [juliangarnier/anime](https://github.com/juliangarnier/anime) | 73,682 | MIT; update 18/10/2026, push gần nhất 21/08/2026; không archive. | Có thể dùng cho transition panel, feedback đúng/sai, màn hoàn thành và UI trang trí. Không cần thay animation sprite hoặc CSS hiện có nếu chúng đã đáp ứng; dùng tiết chế và tôn trọng reduced-motion. |
| State machine / flow | [statelyai/xstate](https://github.com/statelyai/xstate) | 30,317 | MIT; update 17/10/2026, push 18/10/2026; không archive. | Phù hợp làm rõ luồng `MAP → BATTLE → RESULT`, khóa input khi animation, modal, pause và các nhánh boss/quest. Chỉ nên đưa vào sau refactor module; không bắt buộc nếu state đơn giản và được kiểm thử tốt bằng state machine tự viết. |
| Kiểm thử end-to-end | [microsoft/playwright](https://github.com/microsoft/playwright) | 97,974 | **Apache-2.0, không đạt điều kiện MIT**; commit 17/10/2026, đang hoạt động. | Dù không đủ tiêu chí license yêu cầu, đây là lựa chọn kỹ thuật nổi bật để test Chrome/Firefox/WebKit, kích thước mobile, battle và save. Chỉ dùng nếu chấp nhận Apache-2.0; nếu bắt buộc MIT cần tìm/lọc công cụ khác, không ghi nhầm repo này là MIT. |
| Validate cấu hình / câu hỏi | [colinhacks/zod](https://github.com/colinhacks/zod) | 44,151 | MIT; update 18/10/2026, push 18/10/2026; không archive. | Validate cấu hình map, câu hỏi, đáp án, dữ liệu nhiệm vụ và migration save ở runtime/build. Repo TypeScript-first; có thể cân nhắc sau khi thêm toolchain module/bundler. Với JavaScript thuần hiện tại, có thể dùng schema JSON/validator nhẹ thay vì thêm framework. |
| Validate JSON Schema | [ajv-validator/ajv](https://github.com/ajv-validator/ajv) | 14,863 | MIT; update 17/10/2026, push 06/09/2026; không archive. | Hợp để kiểm tra file JSON tĩnh cho question bank/map/asset manifest ở build/test. Chọn Ajv hoặc Zod theo dạng schema; không cần giữ cả hai nếu chồng lặp. |
| PWA / offline cache (khi chuyển sang Vite) | [vite-pwa/vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) | 4,300 | MIT; update 18/10/2026, push 09/10/2026; không archive. | Tự sinh manifest/service worker và hỗ trợ cập nhật offline cho Vite. Chỉ áp dụng sau khi có quyết định dùng Vite và chính sách cache/version cho asset; hiện project chưa có toolchain đó. |

### Repo không đưa vào danh sách đạt chuẩn

- [phaserjs/examples](https://github.com/phaserjs/examples) có 1,666 stars và cập nhật, nhưng GitHub API trả `license: null`; không thể xác nhận license MIT nên không đưa vào danh sách đạt chuẩn. Dùng tham khảo mã ví dụ chỉ sau khi kiểm tra license/điều khoản từng nội dung.
- [pixijs/ui](https://github.com/pixijs/ui) là MIT và đang cập nhật nhưng tại ngày tra cứu chỉ có 324 stars, chưa đạt ngưỡng hơn 500.
- [microsoft/playwright](https://github.com/microsoft/playwright) đáp ứng stars và hoạt động nhưng dùng Apache-2.0, không phải MIT. Được nêu riêng vì giá trị kiểm thử cao và minh bạch license.

### Thứ tự đề xuất áp dụng

1. **Chưa chuyển engine ngay:** trước hết chia HTML thành module và tạo kiểm thử smoke. Làm prototype Phaser cho một màn map + battle để so sánh khả năng scene/input/animation với chi phí migration. Chọn Phaser nếu muốn framework game hoàn chỉnh; chọn Pixi nếu chỉ cần renderer mạnh và tự xây phần còn lại.
2. **Tách flow:** khi có module, dùng XState hoặc sơ đồ state được test để quản lý mode/turn/result, tránh timer/animation cho phép input sai trạng thái.
3. **Tạo content validator:** đưa ngân hàng câu hỏi/map ra JSON/JS module, validate bằng Ajv hoặc Zod trong test/build; bắt lỗi thiếu giọng đọc, đáp án ngoài mảng, asset không tồn tại.
4. **Bổ sung âm thanh và motion theo nhu cầu:** Howler cho nhạc/SFX sau khi có audio pack; Anime.js chỉ dùng cho UI DOM cần choreography. Giữ lựa chọn tắt âm/giảm chuyển động.
5. **PWA sau cùng:** chỉ khi có build pipeline Vite, test offline và quy định cập nhật asset; tránh cache phiên bản cũ làm game trộn code/ảnh không tương thích.

### Ghi chú license và nội dung

- MIT áp dụng cho mã nguồn repo, không tự động cấp quyền dùng hình ảnh, nhạc, font, demo asset hoặc dữ liệu bên trong repository; cần kiểm tra license của từng asset/thư mục.
- GitHub API license và sao là bộ lọc ban đầu, không thay tư vấn pháp lý hoặc rà file LICENSE thực tế trước khi phân phối sản phẩm thương mại.
- Tránh copy nguyên mẫu/game demo. Ưu tiên dependency package chính thức hoặc học kiến trúc/API, giữ thông báo copyright/license khi phân phối mã thuộc MIT.

## 7. Ranh giới an toàn cho game trẻ em

- Không Game Over, không mất tiến trình cốt lõi vì trả lời sai hoặc nghỉ chơi.
- Không chuỗi đăng nhập, đồng hồ đếm ngược gây áp lực, thông báo thúc bé quay lại, loot ngẫu nhiên gây nghiện hoặc mua tiền thật.
- Thú cưng không chết, bỏ đi, mất cấp hoặc mất tình cảm vì bé không mở game.
- Âm thanh, chuyển động mạnh và hiệu ứng chớp cần tùy chọn giảm/tắt.
- Dùng font dễ đọc tiếng Việt, câu ngắn, nút lớn, giọng đọc dễ hiểu; cung cấp thao tác thay thế cho kéo/thả.
- Nếu thêm báo cáo học tập hoặc tài khoản, chỉ thu thập dữ liệu cần thiết, giải thích cho phụ huynh và đặt cổng phụ huynh phù hợp.

## 8. Việc nên làm ngay

1. Chốt và cập nhật nguồn tài liệu chuẩn: 6 vùng, Bé Sâu, các feature thực sự có và feature còn thiếu.
2. Chạy audit manifest/path trên toàn bộ ảnh đang dùng; xử lý asset Map 1 và quyết định bộ quái/hoạt ảnh tối thiểu cho Map 4–6.
3. Thiết kế schema `campaignProgress` và bảng nhiệm vụ/map trước khi viết thêm nội dung.
4. Tách `GAME_CONFIG` và `SaveManager` khỏi `index.html`, bổ sung migration test.
5. Làm vertical slice hoàn chỉnh cho một chương (mở đầu, 3 nhiệm vụ, câu hỏi nhiều dạng, boss, kết quả, lưu/mở tiến trình); lấy đó làm chuẩn nhân rộng.
6. Sau khi vòng lặp đã ổn, mở rộng ngân hàng câu hỏi và pipeline art/audio theo từng chương.

## 9. Giới hạn của lần rà soát

- Đánh giá dựa trên file và cây asset hiện diện trong workspace; không có Git remote, lịch sử issue hoặc thiết kế ngoài workspace để xác minh.
- Không thực hiện playtest trực quan toàn game trong trình duyệt hoặc trên thiết bị di động.
- Không thử nghiệm với trẻ/phụ huynh và không đánh giá chuyên môn chương trình giáo dục.
- Danh sách asset phản ánh đường dẫn tìm thấy trong workspace; trạng thái tải/hiển thị từng asset cần xác nhận thêm bằng runtime smoke test.
