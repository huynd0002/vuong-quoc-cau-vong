# Tinh gọn và mở game trực tiếp — 28/10/2026

## Bản chơi

- `game.html`: khoảng 43,77 MiB, chứa mã rút gọn, CSS và 159 tài nguyên đang được tham chiếu. Chép riêng file này là đủ để chơi.
- Không dùng module tải qua HTTP, đường dẫn ảnh gốc `/assets/`, Google Fonts hay service worker khi mở file trực tiếp.
- Không đổi kích thước sprite sheet hay khung hình; giữ nguyên cơ chế tắm, uống nước, bếp và lưu tiến trình.

## Đã xoá

- `dist/`: bản đóng gói cũ khoảng 109,55 MiB, chứa nhiều ảnh sao chép trùng.
- `legacy_index_oct18.html.bak`: bản HTML cũ không còn chạy.
- `assets/maps/backgrounds/map_pet_farm_bg_backup.png` và `map_pet_farm_bg_clean.png`: ảnh dự phòng không được nguồn hiện tại tham chiếu.
- `artifacts/`: ảnh kiểm thử sinh tự động và ảnh lỗi cũ; lần chạy test tiếp theo sẽ tự tạo lại khi cần.

Giữ mã nguồn, tài liệu kế hoạch, ảnh gốc còn phục vụ phát triển, kiểm thử và bộ công cụ trong `node_modules`. Các phần này không cần đi kèm khi gửi bản chơi cho người khác.

## Kiểm chứng

- `npm run build`: thành công, không có cảnh báo CSS.
- `npm run test:unit`: 10/10 bộ kiểm thử thành công.
- `node src/tests/browser/cookingJourney.test.js --file`: thành công ở 1280×800 và 844×390, ngắt mạng; thử thách nhận Sao, mua nguyên liệu, kéo bằng chuột/cảm ứng, nấu, tải lại, nhận món, dùng và huỷ.
- `node src/tests/browser/petStationRegression.test.js --file`: thành công khi ngắt mạng; kiểm tra nhiều khung hình tắm/uống, vị trí, tỷ lệ, lớp thành bồn, đổi hành động, thao tác nhanh, điện thoại và rời bản đồ.

Tiến trình của địa chỉ localhost cũ vẫn thuộc vùng lưu cũ của trình duyệt; bản file dùng vùng lưu riêng.
