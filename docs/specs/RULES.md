# WORKSPACE RULES - GAME GIÁO DỤC RPG CHO TRẺ 5-6 TUỔI (WEB MOBILE LANDSCAPE)

## 1. Quy chuẩn Màn hình & Trải nghiệm (UX/UI Rules)
- **Màn hình Ngang (Landscape 16:9):** Khung game cố định tỷ lệ ngang, tự động co giãn (responsive) vừa khít màn hình điện thoại/máy tính bảng. Hiển thị màn hình nhắc xoay ngang nếu thiết bị đang để dọc.
- **Chống chạm nhầm (Touch Guard):** Khóa zoom (`user-scalable=no`), khóa cuộn trang (`overflow: hidden`), khóa menu chuột phải (`contextmenu`).
- **Kích thước điểm chạm (Kid-Friendly Touch):** Mọi nút tương tác của bé phải >= `64x64px`, chữ to, ưu tiên biểu tượng (Emoji/SVG/Sprite) kèm màu sắc rực rỡ.
- **Không Thất Bại (No-Fail Combat):** Nhân vật của bé không bao giờ chết. Trong Pop-up đánh theo lượt, nếu chọn sai: Quái vật chỉ trêu chọc nhẹ, nút đáp án sai tự động mờ đi (`disabled`), giữ nguyên lượt để bé chọn lại.
- **Âm thanh & Giọng đọc (Voice-First):** Tự động đọc câu hỏi bằng Tiếng Việt (`speechSynthesis` hoặc Audio file) khi Pop-up hiện lên. Luôn có nút Loa to để nghe lại.

## 2. Quy chuẩn Kiến trúc Code (Technical Rules)
- **Data-Driven:** Toàn bộ cấu hình Map, Vũ khí, Trang phục, Câu hỏi phải tách biệt trong biến cấu hình `GAME_CONFIG` (hoặc tách ra thư mục `config/` khi mở rộng). Không hardcode câu hỏi vào hàm xử lý UI.
- **Storage Adapter (`SaveManager`):** Mọi thao tác lưu/tải dữ liệu người chơi bắt buộc đi qua `SaveManager.save()` và `SaveManager.load()`. Hiện tại dùng `localStorage`, sẵn sàng thay bằng Firebase/Backend khi thêm tính năng Đăng nhập.
- **State Machine:** Quản lý trạng thái rõ ràng: `HUB`, `MAP`, `BATTLE`, `SHOP`, `PET_ROOM`. Khi mở Pop-up (`BATTLE`, `SHOP`, `PET_ROOM`), phải khóa di chuyển trên Canvas.
- **Paper-Doll Character:** Nhân vật được vẽ theo lớp (Layer): `Vệt bước chân (Trail)` -> `Thân & Trang phục (Outfit)` -> `Mũ (Hat)` -> `Vũ khí (Weapon)` -> `Thú cưng đi theo (Companion Pet)`.