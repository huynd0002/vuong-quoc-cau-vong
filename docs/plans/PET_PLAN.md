# Kế hoạch nuôi Thỏ Bông — một bạn đồng hành, gắn bó lâu dài

## 1. Định hướng đã chốt

Trẻ 5–6 tuổi nuôi **một thú chính**, chăm sóc sâu và cùng lớn lên qua việc học. Dùng Thỏ Bông hiện có làm bạn đầu tiên và duy nhất trong phạm vi này. Giá trị nằm ở sự gắn bó, hiểu nhu cầu và biết chăm sóc; không dùng bộ sưu tập thú hay độ hiếm để giữ chân trẻ.

Phòng thú là nhịp nghỉ giữa các chuyến phiêu lưu. Một lượt chăm sóc khoảng 1–3 phút, có thể kết thúc bất cứ lúc nào. Không chết, bỏ nhà, mất cấp, mất tình cảm vì nghỉ chơi; không chuỗi đăng nhập, không mua bằng tiền thật. Nhu cầu thấp chỉ gợi ý hoạt động, không khóa bài học hay bản đồ.

## 2. Phạm vi bản đang chạy

Đã có trong `index.html`: 5 hoạt động chăm sóc, 3 thanh nhu cầu, thân thiết, tâm trạng, XP/cấp, 3 mốc gắn bó bằng tên gọi; mục tiêu chăm sóc trong ngày; lưu và nâng cấp save cũ; đi cùng trên map; hỗ trợ phòng thủ trong battle. Tái sử dụng ảnh thú hiện có, có Emoji dự phòng.

Các mục ở giai đoạn B–D bên dưới là thiết kế tiếp theo, **chưa được coi là tính năng đã hoàn thành**. Tên gọi các mốc hiện tại chưa thay đổi sprite hoặc mở khóa kỹ năng mới.

## 3. Vòng lặp và hành trình

1. Bé vào Nhà Thỏ Bông, nghe một gợi ý theo nhu cầu hiện tại.
2. Chọn cho ăn / tắm / chơi / nghỉ / xoa đầu, thấy phản hồi ngay và nghe lời cảm ơn.
3. Hoàn thành việc chăm tùy chọn trong ngày; nhận XP một lần, không cần liên tiếp nhiều ngày.
4. Gọi Thỏ đi cùng hoặc cho ở nhà nghỉ; phiêu lưu vẫn hoạt động trong cả hai lựa chọn.
5. Khi đi cùng, thú bảo vệ bé một lần trong trận nếu đủ năng lượng; chiến thắng tăng XP thú.
6. Quay lại phòng để nghỉ ngơi, chăm sóc và nhìn thấy mốc gắn bó mới.

Về sau bổ sung: nhận nuôi → chọn tên gọi → học sở thích → các kỷ niệm cùng nhau → trang trí góc nhà → hoạt động chăm sóc có học liệu. Giữ một bạn thú xuyên suốt, không thay bạn cũ để đạt sức mạnh cao hơn.

## 4. Chỉ số và quy tắc cân bằng

| Thành phần | Bản hiện tại | Vai trò |
| --- | --- | --- |
| No bụng | 0–100, khởi tạo 80 | Gợi ý cho ăn khi dưới 55 |
| Sạch sẽ | 0–100, khởi tạo 80 | Gợi ý tắm khi dưới 55 |
| Năng lượng | 0–100, khởi tạo 80 | Nghỉ khi dưới 30; cần 20 để bảo vệ |
| Thân thiết | 0–5 tim, khởi tạo 3 | Tăng qua chăm sóc, lên cấp, chiến thắng khi đi cùng |
| Cấp | 1–5, 30 XP/cấp | Ghi nhận tiến trình, không tăng sát thương |
| Tâm trạng | Suy ra từ trung bình 3 nhu cầu | Phản hồi nhẹ; chỉ dẫn cụ thể ưu tiên nhu cầu thấp |

| Hoạt động | No bụng | Sạch sẽ | Năng lượng | Tim | XP |
| --- | ---: | ---: | ---: | ---: | ---: |
| Cho ăn | +22 | −2 | +4 | +1 | +6 |
| Tắm | −2 | +30 | +3 | +1 | +6 |
| Chơi | −5 | −4 | −12 | +1 | +8 |
| Nghỉ | −3 | −3 | +28 | 0 | +4 |
| Xoa đầu | 0 | 0 | +2 | +1 | +4 |

Mọi chỉ số được chặn trong phạm vi. Mỗi hành động có thời gian chờ 8 giây, hiển thị đếm lùi và tạm vô hiệu nút. Đây là thông số để chơi thử, cần điều chỉnh sau quan sát trẻ: bản hiện tại lên cấp và đầy tim khá nhanh. Trước phát hành nên tăng độ dài tiến trình hoặc chuyển phần thưởng sang hoạt động đa dạng thay vì lặp một nút.

Mỗi giờ vắng mặt: no bụng −2, sạch sẽ −1, năng lượng +2. Chỉ tính tối đa 24 giờ cho một khoảng vắng; suy giảm thụ động không hạ chỉ số dưới 30, không tự nâng chỉ số đang thấp lên 30. Bỏ qua thời gian âm; giữ phần lẻ của giờ để không mất hoặc tính trùng thời gian. Thân thiết, cấp và XP không giảm vì nghỉ chơi.

Mốc tên gọi: cấp 1 **Bạn nhỏ mới quen**, cấp 3 **Bạn thân vui vẻ**, cấp 5 **Tri kỷ cầu vồng**. Sau cấp tối đa không tích XP vô hạn; chăm sóc và đồng hành tiếp tục hoạt động.

## 5. Chăm sóc sâu và giáo dục

**Đã làm:** mục tiêu nhẹ “Cho ăn, Tắm sạch, Xoa đầu”. Hoàn tất nhận 10 XP một lần/ngày theo múi giờ Việt Nam. Không có ngày liên tiếp, mất quà hoặc thưởng bù bắt buộc. Lưu từng hành động đã làm để tải lại không nhận thưởng trùng.

**Giai đoạn B — thấu hiểu và gắn bó:**

- Bé chọn tên gọi từ danh sách được đọc thành tiếng; không bắt buộc gõ chữ.
- Chọn màu vòng cổ/gối ngủ; chỉ có tác dụng trang trí.
- Sở thích ổn định: món yêu thích, đồ chơi yêu thích, cách thể hiện cảm xúc. Không random lại sau mỗi lần mở game.
- Hành động chăm sóc thể hiện qua các bước ngắn: chọn món → đưa món → thú ăn; tắm → bọt → xả; chơi → bắt bóng → ăn mừng. Có nút chạm thay thế thao tác kéo.
- Nhật ký 3–5 kỷ niệm bằng ảnh: lần đầu đi cùng, lên mốc gắn bó, hoàn thành hoạt động học. Không ghi dữ liệu cá nhân của trẻ.

**Giai đoạn C — học khi chăm sóc:**

| Hoạt động | Học liệu | Trả lời sai |
| --- | --- | --- |
| Chuẩn bị bữa ăn | Đếm 1–5 phần ăn, chọn số lượng | Đọc lại, minh họa, cho thử lại; không trừ thức ăn |
| Chọn khăn tắm | Nhận biết màu và hình | Thú làm mẫu, giữ nguyên lượt |
| Cất đồ chơi | Phân nhóm, quy luật đơn giản | Gợi ý một món; không tính giờ |

Mỗi hoạt động 1–3 câu, nút loa luôn có. Đáp án đúng mới nhận thưởng hoàn thành; không thưởng thêm vì bấm nhanh. Thú có thể biểu cảm và khích lệ nhưng không tiết lộ đáp án trước khi bé thử.

## 6. Đồng hành và battle

- Quyền chọn đi/về phòng lưu qua tải lại. Thú đi theo chỉ để hiển thị, không va chạm, mở khóa cổng hoặc tự kích hoạt trận đấu.
- Ưu tiên xử lý: né đòn → khiên của bé → thú bảo vệ → nhận đòn. Không tiêu năng lượng thú khi khiên hoặc né đã xử lý được đòn.
- Thú bảo vệ tối đa một lần/trận, tốn 20 năng lượng. Thiếu năng lượng vẫn đi cùng, phòng thú giải thích cần nghỉ.
- Khi cùng thắng: thú nhận 10 XP, +1 tim thân thiết và tốn 8 năng lượng. Thú ở nhà không bị trừ năng lượng hoặc nhận XP chiến đấu.
- Phép cầu vồng hồi tim khi bé hết tim luôn tồn tại, độc lập với thú. Không nuôi thú vẫn chơi được toàn bộ nội dung học.
- Giai đoạn sau chỉ bổ sung hỗ trợ mang tính khích lệ/quan sát, không dùng thú để tự trả lời hoặc bỏ qua câu hỏi.

## 7. Lưu trữ và kiến trúc

Giữ nguyên khóa `RAINBOW_KIDS_RPG_SAVE_V1` để không mất tiến trình. `pet.version = 2`; `SaveManager.load()` bổ sung mặc định cho save cũ, kiểm tra số, giới hạn chỉ số, lọc hành động hợp lệ, giữ lựa chọn đồng hành. Không đọc/ghi localStorage ngoài SaveManager.

```text
pet
  version, species, name
  hunger, cleanliness, energy, affection
  xp, level, following
  lastCareAt, lastUpdatedAt
  actionAt: { feed, bath, play, sleep, pat }
  daily: { date, done[], rewarded }
```

`lastCareAt` dành cho lần chăm gần nhất; `lastUpdatedAt` dành riêng cho tính thời gian. Không đặt lại mốc suy giảm mỗi lần bấm nút. Mất mạng vẫn chơi và lưu tại máy; chưa có đồng bộ nhiều thiết bị.

Cấu hình thú đặt trong `GAME_CONFIG.pet`; logic đặt trong `PetSystem`. `World` chỉ vẽ thú; `Battle` gọi các điểm nối `beginBattle`, `tryProtect`, `onBattleWin`; `UI` mở phòng và khóa di chuyển. Khi tách module toàn game, chuyển sang `js/petSystem.js`, `js/petRoom.js`, `css/petRoom.css` cùng nhịp refactor; tránh tạo hai nguồn cấu hình trùng nhau.

## 8. Giao diện, âm thanh và tài nguyên

- Nhà Thỏ Bông dùng phong cách kẹo ngọt hiện tại. Hình thú ở trung tâm, biểu tượng + nhãn ngắn + thanh chỉ số; không chỉ dùng màu để truyền trạng thái.
- Nút chăm sóc và nút đóng tối thiểu 64×64 CSS px; khoảng cách ≥8px. Màn hình ngang thấp dùng hai cột; chân dung tiếp tục dùng màn hình nhắc xoay của game.
- Lời thoại đọc tiếng Việt; nghe gợi ý khi vào phòng. Tắt âm thanh phải áp dụng cả giọng đọc của thú.
- Hoạt ảnh hiển thị ngay, không khóa cả phòng trong lúc chờ. Thời gian chờ của từng hành động độc lập.
- Ảnh hiện tại: `pet_bunny_idle.png`; thiếu ảnh dùng Emoji. Đồ họa các mốc lớn lên và hành động mới là tài nguyên tương lai, cần duyệt mẫu trước khi sản xuất hàng loạt.
- Bộ ảnh dự kiến: idle, eat, bath, play, sleep, happy, protect; cùng khung/cùng điểm chân, nền alpha. Âm thanh ngắn và không dùng tiếng khóc thúc ép bé quay lại.

## 9. Lộ trình và tiêu chí hoàn tất

| Giai đoạn | Kết quả | Tiêu chí nghiệm thu |
| --- | --- | --- |
| A — Nền tảng, bản này | Chăm sóc, trạng thái, mục tiêu ngày, tiến trình, đồng hành | Lưu cũ chạy được; chỉ số không vượt phạm vi; không thưởng trùng; battle không Game Over |
| B — Gắn bó | Chọn tên, sở thích, biểu cảm/hành động, kỷ niệm, trang trí | Bé nhận ra nhu cầu qua hình và giọng nói; không cần đọc hướng dẫn dài |
| C — Học qua chăm | 3 hoạt động học, phần thưởng trang trí cố định | Thử lại không phạt; không bấm lặp để bỏ qua học; có voice-first |
| D — Hoàn thiện phát hành | Cân bằng, kiểm thử trẻ/phụ huynh, tối ưu thiết bị, thống kê | Chơi 1–3 phút vẫn có kết quả; không ép quay lại; save bền, UI đủ lớn, hỗ trợ offline |

Thứ tự ưu tiên tiếp theo: hoạt ảnh/biểu cảm và chọn tên → bữa ăn đếm số → trang trí góc nhà → nhật ký kỷ niệm → 2 hoạt động học còn lại. Chưa cần backend, chợ vật phẩm, sinh sản hay nhiều loài.

Kiểm tra kỹ thuật phải bao gồm: save mới/cũ/hỏng; chỉ số bằng 0; đồng hồ lùi; vắng nhiều ngày; tải lại không tính thời gian trùng; cooldown; mục tiêu qua ngày và nhận quà một lần; cấp tối đa; đi cùng/về phòng; khiên và né không làm mất năng lượng thú; hết năng lượng vẫn học được. Kiểm tra UI ở máy tính, tablet, điện thoại ngang 667×375 và màn hình xoay dọc.

## 10. Kiểm chứng bản nền tảng

- `node scripts/test_pet_system.cjs`: 10 kiểm tra runtime đạt, bao gồm đọc save cũ/hỏng, giữ giá trị 0, thời gian vắng và đồng hồ lùi, cooldown, thưởng ngày, cấp tối đa, lưu lựa chọn đồng hành, giới hạn bảo vệ và tích hợp thứ tự khiên/né trong đòn quái thật.
- `python scripts/verify_game.py`: đạt kiểm tra thiết lập game, cú pháp JavaScript và DOM. Một số ảnh Map 1 cũ vẫn dùng fallback theo hiện trạng dự án.
- Trình duyệt: thử cho ăn/tắm/xoa đầu, hoàn thành mục tiêu ngày và lên cấp; tải lại vẫn giữ XP, chỉ số và trạng thái đồng hành; thấy thú trên bản đồ.
- Giao diện: xem ở 1280×720, 667×375, 568×320; các nút chăm sóc ≥64px. Ở màn hình 568×320, phần trạng thái có cuộn riêng để không che nút. Chế độ dọc có nhắc xoay ngang. Tab/Shift+Tab ở trong phòng, Escape đóng phòng.
- Chưa kiểm thử với trẻ thật, chưa sản xuất bộ hoạt ảnh riêng và chưa triển khai các giai đoạn B–D.
