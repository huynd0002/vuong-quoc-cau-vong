# MASTER PLAN - VƯƠNG QUỐC CẦU VỒNG (WEB MOBILE LANDSCAPE RPG 5-6 TUỔI)

## 1. Tổng quan Dự án
- **Thể loại:** Nhập vai phiêu lưu nhẹ nhàng (Casual RPG) kết hợp Giáo dục sớm (Toán tư duy, Hình khối, Màu sắc) & Nuôi thú ảo.
- **Đối tượng:** Trẻ em 5–6 tuổi (chưa biết đọc chữ thạo, thao tác cảm ứng trên điện thoại/máy tính bảng).
- **Nền tảng & Tỷ lệ khung hình:** Web Mobile (PWA Toàn màn hình), tỷ lệ chuẩn **16:9 Màn hình Ngang (`1280x720`)**.
- **Triết lý Gameplay:** Không bạo lực, không có "Game Over". Đánh quái là "Giải cứu những người bạn bị phù phép lú lẫn". Trả lời sai chỉ bị quái trêu chọc vui nhộn và được chọn lại.

## 1.1. Cơ chế Nuôi Thú Cưng — một thú chính, chăm sóc sâu

Thiết kế đầy đủ, thông số, phạm vi đã làm và lộ trình: [PET_PLAN.md](PET_PLAN.md).

- **Bạn đồng hành đầu tiên:** Thỏ Bông (`bunny`), dùng ảnh `assets/pets/pet_bunny_idle.png` và Emoji fallback.
- **Bốn nhu cầu dễ hiểu:** No bụng, Sạch sẽ, Năng lượng (0–100%) và Thân thiết (0–5 tim). Không có chỉ số nào làm bé thua trận.
- **Năm hoạt động chăm sóc:** Cho ăn, Tắm sạch, Chơi cùng, Ngủ một lát, Xoa đầu. Mỗi hoạt động có phản hồi ảnh, lời thoại, âm thanh, XP và thời gian chờ ngắn để tránh bấm liên tục.
- **Tiến trình:** Thú nhận XP từ chăm sóc và chiến thắng; đủ 30 XP lên cấp, tối đa cấp 5. Lên cấp tăng một tim thân thiết.
- **Đời sống nhẹ nhàng:** No bụng/sạch sẽ giảm chậm theo giờ, tối đa 24 giờ mỗi khoảng vắng và không bị giảm thụ động dưới 30%; nghỉ giúp hồi năng lượng. Thân thiết không mất vì nghỉ chơi.
- **Mục tiêu ngày tùy chọn:** Cho ăn, tắm, xoa đầu, nhận 10 XP một lần/ngày; không có chuỗi đăng nhập hoặc phạt bỏ ngày.
- **Đồng hành:** Nút gọi/về nghỉ. Khi đi cùng, thú hiển thị phía sau Bé Sâu trên map và trong đấu trường. Mỗi trận thú có thể dùng 20 năng lượng để đỡ một đòn; không tạo Game Over và không bắt buộc phải dùng.
- **Mở rộng sau MVP:** Chọn tên cho một bạn thú, sở thích, hoạt ảnh cảm xúc, chăm sóc qua bài học, trang trí nhà và nhật ký kỷ niệm.

---

## 2. Cấu trúc Thư mục Dự án (Khi tách Module & Ráp Sprite)
```text
project-root/
├── index.html               # Khung giao diện chính (Landscape 16:9)
├── manifest.json            # Cấu hình PWA chạy toàn màn hình trên di động
├── RULES.md                 # Quy tắc bắt buộc cho AI Agent trong Antigravity
├── PLAN.md                  # Kế hoạch tổng thể & kiến trúc (File này)
├── TASK.md                  # Danh sách công việc theo từng giai đoạn
├── ASSETS.md                # Danh mục toàn bộ hình ảnh & âm thanh cần thiết
├── css/
│   └── style.css            # Giao diện HUD, Pop-up Battle, Shop, Pet Room
├── js/
│   ├── main.js              # Khởi tạo Game Loop & State Machine
│   ├── config.js            # Dữ liệu Maps, Vũ khí, Trang phục, Ngân hàng câu hỏi
│   ├── saveManager.js       # Cổng lưu trữ (LocalStorage -> nâng cấp lên Firebase)
│   ├── assetLoader.js       # Bộ tải trước (Preload) toàn bộ Sprite & Audio
│   ├── world.js             # Xử lý di chuyển trên Map, va chạm, vật thể tương tác
│   ├── battle.js            # Xử lý Pop-up đánh theo lượt, đọc câu hỏi, bắn Skill
│   ├── shop.js              # Tiệm thời trang đổi Sao & ghép lớp Paper-Doll
│   └── petRoom.js           # Phòng nuôi thú ảo & đồng hành ra trận
└── assets/                  # Thư mục chứa toàn bộ hình ảnh (PNG) & âm thanh (MP3)
```

Hiện game vẫn chạy chủ yếu trong `index.html`; cấu trúc module trên là đích refactor, không phải danh sách file đã có.
