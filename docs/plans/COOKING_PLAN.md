# Bếp cầu vồng — kế hoạch và cơ chế đã triển khai

Cập nhật: 27/10/2026 · Phiên bản 2.0 · Trẻ 5–6 tuổi, màn hình ngang.

## 1. Quy trình mới

Thực hiện thử thách kiếm Sao → Vào bếp → đến tủ lạnh → mua nguyên liệu vào túi nhân vật → qua bếp chọn công thức → kéo từng phần nguyên liệu vào nồi → chọn lửa và nhịp → bấm Nấu → hiệu ứng chế biến và thanh tiến độ → tự cất thành phẩm vào túi → chạm món để Dùng hoặc Hủy.

Nút 🎒 Túi nằm trên thanh menu, dùng được ngoài gian bếp. Trong túi có hai phần: nguyên liệu và món đã nấu. Nhân vật đi đến trạm trước khi mở tủ lạnh hoặc bếp. Các cửa sổ thao tác khóa di chuyển.

## 2. Sao và mua nguyên liệu

Sao tiếp tục được nhận từ thử thách/mê cung và vượt ải hiện có. Không cấp Sao miễn phí, không đổi quy tắc mở 6 vùng đất. Nút Kiếm Sao đưa bé đến vùng đầu tiên.

| Nguyên liệu | Giá mỗi phần |
|---|---:|
| Chuối, bánh mì, rau sạch, cà rốt, bông cải, nước, cơm, gạo, bí đỏ | 1 Sao |
| Sữa chua, trứng | 2 Sao |

Mỗi lần bấm mua nhận đúng 1 phần. Thiếu Sao hoặc đủ 99 phần thì nút mua bị khóa. Sao bị trừ và nguyên liệu được thêm trong cùng một lần lưu. Sao trên thanh menu cập nhật ngay. Lần lưu từ màn hình khác không hoàn lại Sao đã tiêu.

## 3. Công thức

| Món | Nguyên liệu | Lửa | Nhịp | Giá từ túi trống | Mở khóa |
|---|---|---|---:|---:|---|
| Sữa chua trái cây | 2 chuối + 1 sữa chua | Tắt | 2 | 4 Sao | Sẵn có |
| Bánh mì sắc màu | 2 bánh mì + 1 rau sạch | Tắt | 2 | 3 Sao | Sẵn có |
| Súp rau củ | 2 cà rốt + 2 bông cải + 1 nước | Nhỏ | 4 | 5 Sao | Biết 2 món khác nhau |
| Cơm trứng rau | 2 cơm + 1 trứng + 1 rau sạch | Vừa | 4 | 5 Sao | Biết 2 món khác nhau |
| Cháo bí đỏ | 1 gạo + 3 bí đỏ + 2 nước | Nhỏ | 6 | 6 Sao | Biết 4 món khác nhau |
| Đĩa cơm cầu vồng | 2 cơm + 1 cà rốt + 3 bông cải + 1 trứng | Vừa | 6 | 8 Sao | Biết 4 món khác nhau |

Một nhịp bằng một giây trong trò chơi; đây là ký hiệu học tập, không phải thời gian nấu ăn ngoài đời.

## 4. Kéo thả và nấu

- Mỗi lần kéo hoặc chạm nguyên liệu thêm 1 phần vào nồi. Hỗ trợ chuột, cảm ứng và bàn phím qua nút chạm.
- Công thức hiển thị số đã thêm / số cần. Nguyên liệu không thuộc món được nhắc thử lại; không mất đồ.
- Chạm nguyên liệu trong nồi để bớt 1 phần. Chỉ là chuẩn bị, chưa trừ đồ trong túi.
- Bấm Nấu khi đủ nguyên liệu, đúng lửa, đúng nhịp mới trừ đồ và chạy tiến độ. Sai được thử lại, không cháy món.
- Đổi món hoặc đóng màn hình lúc chuẩn bị giữ nguyên nguyên liệu. Đồ đã nấu không thể hủy giữa chừng để tránh mất nguyên liệu đã tiêu.
- Đóng game hoặc tải lại trong lúc nấu vẫn giữ thời điểm hoàn thành. Xong nhận đúng 1 món, không cần bấm nhận.
- Món nguội dùng hiệu ứng trộn/xếp, không hiển thị lửa đang cháy.

## 5. Túi và hiệu ứng món

Tối đa 6 món đã nấu; mỗi nguyên liệu xếp chồng tối đa 99 phần, độc lập với 6 ô món. Bếp giữ trước một ô cho thành phẩm; túi món đầy thì không bắt đầu món mới.

Chạm món mở Dùng / Hủy. Dùng ăn ngay và nhận hiệu ứng; nếu mọi chỉ số đã đủ thì giữ lại món. Hủy có câu hỏi xác nhận trong túi để tránh bé chạm nhầm, không hoàn Sao. Nút Cho cún ăn được giữ lại; món và chỉ số cún cập nhật trong cùng một lần lưu, cún đã no thì giữ món.

| Món | Hồi tim | Tim tạm | Năng lượng |
|---|---:|---:|---:|
| Sữa chua trái cây | 1 | 1 | 0 |
| Bánh mì sắc màu | 1 | 0 | 1 |
| Súp rau củ | 2 | 1 | 1 |
| Cơm trứng rau | 2 | 1 | 1 |
| Cháo bí đỏ | 3 | 2 | 1 |
| Đĩa cơm cầu vồng | 3 | 2 | 2 |

Tim thường tối đa 3. Tim tạm lấy mức cao hơn, tối đa +2, được đưa vào trận kế tiếp một lần; không tăng máu vĩnh viễn. Năng lượng tích tối đa 3; cơ chế chiến đấu hiện có dùng năng lượng để đỡ đòn.

## 6. Lưu trữ và tương thích

Toàn bộ thao tác qua SaveAdapter. Lưu riêng nguyên liệu, món ăn, thành thạo, tổng Sao đã tiêu và phiên nấu. Hỏng dữ liệu bị giới hạn về giá trị hợp lệ. Món đã lưu và thành thạo từ bản cũ được giữ; phiên trắc nghiệm cũ hoàn tất được chuyển thành món chờ nhận tự động. Phiên cũ chưa xong chuyển sang chuẩn bị theo luật mới, không trừ Sao.

Mua hàng, bắt đầu nấu, nhận món, dùng/hủy đều lưu một lần. Khi lưu thất bại, tài nguyên đã lưu không thay đổi và màn hình hướng dẫn thử lại. Sự kiện lặp không nhân đôi thành phẩm.

## 7. Kiểm thử chấp nhận

- Unit: thiếu Sao, giao dịch mua, số lượng sai, nguyên liệu sai, đổi món, sai lửa/nhịp, lưu lỗi, nấu lặp, hoàn thành lặp, tải lại, giới hạn túi, dùng/hủy, tim tạm và năng lượng.
- Trình duyệt: thử thách thật nhận Sao → mua tại tủ lạnh → kéo vào nồi bằng chuột và cảm ứng thật → hiệu ứng Nấu → đóng/tải lại → nhận món tự động → dùng và hủy.
- Kiểm tra 1280×800 và 844×390, nút tối thiểu 64×64, không tràn ngang, khóa di chuyển khi mở túi/bếp.

Lệnh: `npm run test:unit`, `npm run test:kitchen`, `npm run build`, `npm run test:kitchen -- --production`.
