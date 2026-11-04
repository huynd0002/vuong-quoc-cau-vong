# TASK LIST & ROADMAP

## Giai đoạn 1: Bản Demo Cốt Lõi (Đã hoàn thành trong `index.html`)
- [x] Khung màn hình ngang (Landscape), khóa cuộn/chạm nhầm, cảnh báo xoay ngang.
- [x] `SaveManager` lưu trữ tiến trình (`localStorage`) + nút Reset dữ liệu test.
- [x] Hệ thống di chuyển trên Map (Chạm điểm đến trên màn hình hoặc dùng D-Pad ảo).
- [x] 3 Bản đồ với cơ chế tương tác riêng:
  - [x] Map 1 (Vườn Hoa): Chạm bụi hoa rung rinh tìm quái + Câu hỏi Màu sắc & Hình khối.
  - [x] Map 2 (Rừng Táo): Chạm cây gỗ mở đường + Câu hỏi Đếm số lượng (1-5).
  - [x] Map 3 (Đồi Kẹo): Thu thập chìa khóa kẹo mở cầu Boss + Câu hỏi Cộng/Trừ phạm vi 5.
- [x] Pop-up Đánh Theo Lượt (Turn-based Battle):
  - [x] Giọng đọc câu hỏi Tiếng Việt + Nút Loa nghe lại.
  - [x] Bắn hiệu ứng đòn đánh theo Vũ khí đang cầm.
  - [x] 2 Kỹ năng hỗ trợ: "Bóng Đèn Gợi Ý" (xóa đáp án sai) & "Siêu Sao Băng" (đòn kết liễu).
- [x] Hệ thống Lên cấp (Level 1 -> 5) tự động mở khóa Vũ khí & Kỹ năng mới.
- [x] Tiệm Thời Trang (Đổi Sao lấy Mũ, Trang phục, Vệt bước chân).
- [x] Phòng Nuôi Thú Ảo (Cho ăn, Tắm bong bóng, Chơi cùng, Nghỉ, Xoa đầu, đồng hành bảo vệ bé).
- [x] MVP Nuôi Thú: chỉ số No bụng / Sạch sẽ / Năng lượng / Thân thiết, XP & cấp thú, 5 hoạt động chăm sóc, suy giảm theo thời gian có giới hạn và lưu tiến trình tương thích dữ liệu cũ.
- [x] Mục tiêu chăm sóc trong ngày, thưởng một lần và 3 mốc gắn bó; thiết kế dài hạn tại `PET_PLAN.md` theo hướng một thú chính, chăm sóc sâu.
- [x] Thú đồng hành hoạt động trên bản đồ và trong đấu trường; đủ năng lượng có thể đỡ một đòn mỗi trận mà không tạo Game Over.

## Giai đoạn 2: Tách Module & Thay thế Đồ họa (Giao cho Antigravity tiếp theo)
- [x] Tạo đầy đủ cây thư mục con trong `assets/` theo đúng quy định ở `ASSETS.md`.
- [x] Tích hợp module `AssetLoader` (`index.html` & `js/assetLoader.js`) tự động preload toàn bộ ảnh `.png`.
- [x] Cập nhật Canvas và các Pop-up (Battle, Shop, Pet, HUD) hiển thị ảnh PNG nếu có, tự động fallback Emoji nếu chưa có file.
- [x] Tự động sắp xếp, chuẩn hóa đổi tên và tích hợp 6 Map nền (`map_1_bg.png` đến `map_6_bg.png`) cùng hệ thống câu hỏi giáo dục, cơ chế cổng khóa và tỷ lệ hiển thị Cover Fit.
- [x] Tối ưu hiển thị tràn viền (Full-Bleed Cover Fit) trên PC & Mobile: Loại bỏ viền đen 2 bên, tự động co giãn độ phân giải canvas theo tỉ lệ màn hình, bổ sung phím điều hướng PC (Mũi tên / WASD) và nút Phóng To toàn màn hình (⛶ Fullscreen).
- [x] Nâng cấp cơ chế Đánh Theo Lượt (Turn-Based Battle) chuẩn RPG: Chạm/click quái trên map để nhân vật tự đi tới chiến đấu, chuyển sang Đấu Trường toàn màn hình chỉ có nhân vật & quái vật; đúng thì nhân vật xuất chiêu (bắn đạn vũ khí, quái giật lùi mất máu), sai thì quái vật xuất chiêu phản công (quái bắn đạn phép riêng, rung màn hình, khiên bảo vệ, trừ tim, thú cưng hồi phục, không bao giờ Game Over).
- [x] Tối ưu hóa & Thiết kế lại toàn diện giao diện (UI/UX Redesign): Phong cách Candy Claymorphism 3D kẹo ngọt chuẩn giáo dục mầm non (Font Google Baloo 2 bo tròn hỗ trợ 100% tiếng Việt, Top HUD Hero Avatar & Star Pill, D-Pad Arcade tròn trong suốt mượt mà, Bảng Quest Ribbon phiêu lưu, Đấu trường trực quan với nhãn A-B-C, Modals Shop & Phòng thú cưng thân thiện, nút Bật/Tắt âm thanh tiện lợi).
- [ ] Tách code từ `index.html` thành cấu trúc thư mục: `css/style.css`, `js/config.js`, `js/save.js`, `js/battle.js`, `js/game.js`.
- [x] Bổ sung Sprite Sheet 2D nhân vật và quái vật cho từng map:
    - [x] Quái Nấm Map 1 & Map 5: Tách nền trong suốt hoàn hảo từ Gemini sprite sheets, tích hợp hoạt ảnh đứng thở (`mon_mushroom_idle.webp`), hoạt ảnh niệm phép tung chiêu 5 giai đoạn (`mon_mushroom_attack.webp`), hoạt ảnh giải cứu vui sướng (`mon_mushroom_celebrate.webp`), đạn phép "Cầu Bào Tử Thần" xoay 360 độ (`spore_proj.png`) và hiệu ứng nổ sao cầu vồng hoạt họa khi va chạm (`rainbow_explosion.png`).
    - [x] Đồng bộ nhịp độ xuất chiêu & Hiệu ứng sát thương: Quái tụ năng lượng (750ms kèm âm thanh ngân cao) $\rightarrow$ Vung tay phóng chiêu $\rightarrow$ Đạn bay chậm rãi (1.45s) theo tọa độ pixel thực tế trúng tâm nhân vật $\rightarrow$ Nổ sao cầu vồng $\rightarrow$ Hiệu ứng mất máu đa tầng cho Bé Sam (Flash đỏ giật lùi `heroDamageFlash`, chớp viền đỏ màn hình `damageScreenFlash`, bóng bóng tim `-1 ❤️` bay lên).
- [ ] Bổ sung Sprite Sheet 2D các quái vật và nhân vật còn lại (Bé Sam, Ong Vàng, Boss Thỏ, v.v.).
- [ ] Bổ sung file thu âm giọng đọc mp3 chuẩn cho từng câu hỏi.
- [ ] Nuôi thú giai đoạn B: chọn tên, sở thích, hoạt ảnh cảm xúc/hành động, trang trí góc nhà, nhật ký kỷ niệm.
- [ ] Nuôi thú giai đoạn C: đếm phần ăn, chọn khăn theo màu/hình, phân nhóm đồ chơi; sai được thử lại không phạt.
- [ ] Nuôi thú giai đoạn D: cân bằng tốc độ gắn bó/lên cấp với trẻ thật, tối ưu mobile và kiểm tra lưu trữ dài hạn.

## Giai đoạn 3: Mở rộng & Đăng nhập (Dài hạn)
- [ ] Tích hợp Firebase Auth / Đăng nhập tài khoản vào `SaveManager`.
- [ ] Thêm Cổng Phụ Huynh (Parent Gate) xem thống kê học tập của bé.
