# Hệ thống nuôi thú trong game

**Phiên bản:** 1.0  
**Mục tiêu:** Tạo thú cưng có nhu cầu, tính cách và hành vi dễ đọc; khuyến khích người chơi chăm sóc và gắn bó mà không ép họ phải đăng nhập liên tục.

## 1. Quy ước phần trăm

Các chỉ số nhu cầu đều nằm trong khoảng **0–100%**. Với **Độ no, Độ khát, Sạch sẽ, Vui vẻ, Năng lượng, Sức khỏe và Tình cảm**, số càng cao càng tốt. Riêng **Buồn vệ sinh** càng cao càng cần đưa thú ra ngoài.

- Mức chỉ số luôn được giới hạn trong khoảng 0–100%.
- Chỉ số tăng/giảm theo thời gian được tính tỷ lệ với thời gian thực đã trôi qua, không phụ thuộc số lần cập nhật khung hình.
- Thời gian trong game: **1 giờ trong game = 2 phút chơi thực tế**.
- Mô phỏng cập nhật tối thiểu mỗi 10 giây thực tế; hoạt ảnh và lời nhắc có thể cập nhật thường xuyên hơn.
- Khi người chơi thoát game, nhu cầu giảm chậm: mỗi 1 giờ vắng mặt chỉ tính **0,5 giờ trong game**, tối đa **4 giờ trong game** cho một lần vắng mặt. Không giảm sức khỏe, tình cảm hay buồn vệ sinh khi offline.

> Các tốc độ dưới đây là thiết lập khởi điểm. Sau khi thử nghiệm, điều chỉnh từng tốc độ khoảng 10–20% mỗi lần, rồi kiểm tra lại cảm giác chơi.

## 2. Chỉ số và tốc độ thay đổi

| Chỉ số | Giá trị bắt đầu | Thay đổi khi đang thức | Ghi chú |
|---|---:|---:|---|
| Độ no | 100% | −3,5% mỗi giờ trong game | Cho ăn làm tăng chỉ số |
| Độ khát | 100% | −5% mỗi giờ trong game | Nước cạn nhanh hơn khi chạy hoặc trời nóng |
| Sạch sẽ | 100% | −1,5% mỗi giờ trong game | Đi mưa, bùn đất làm giảm thêm |
| Vui vẻ | 80% | −4% mỗi giờ trong game | Chơi và đi dạo làm tăng |
| Năng lượng | 100% | −1,5% mỗi giờ trong game | Ngủ phục hồi năng lượng |
| Buồn vệ sinh | 0% | +5% mỗi giờ trong game | Đi vệ sinh ngoài trời đặt lại về 0% |
| Sức khỏe | 100% | Không tự giảm trong trạng thái bình thường | Chỉ giảm nếu nhu cầu nguy cấp kéo dài hoặc có sự kiện bệnh |
| Tình cảm với chủ | 10% khi mới nhận nuôi | Không tự giảm | Tăng qua chăm sóc và hoạt động cùng nhau |

Khi đang ngủ, năng lượng tăng **12% mỗi giờ trong game**. Các nhu cầu khác vẫn giảm như bình thường, ngoại trừ buồn vệ sinh không tăng khi ngủ.

### Ngưỡng biểu hiện chung

| Mức | Ý nghĩa |
|---:|---|
| 70–100% | Ổn; biểu hiện bình thường |
| 40–69% | Bắt đầu có dấu hiệu nhẹ |
| 20–39% | Nhu cầu rõ; thú chủ động tìm cách báo cho chủ |
| 0–19% | Ưu tiên xử lý; thú có biểu hiện khó chịu |

## 3. Hành vi và ngưỡng báo hiệu

| Tình trạng | Ngưỡng bắt đầu | Hành vi của thú | Mức khẩn cấp |
|---|---:|---|---|
| Đói | Độ no ≤60% | Đi đến gần bát ăn, nhìn chủ hoặc ngồi chờ | Độ no ≤25%: rên nhẹ, tìm chủ |
| Khát | Độ khát ≤60% | Tìm bát nước, liếm mép | Độ khát ≤25%: báo chủ rõ hơn; ≤10%: ưu tiên tìm nước |
| Bẩn | Sạch sẽ ≤45% | Chân/lông có vết bẩn; tự liếm lông | Sạch sẽ ≤20%: xuất hiện bùn hoặc mùi rõ |
| Buồn chán | Vui vẻ ≤55% | Đi quanh nhà, nhìn đồ chơi | Vui vẻ ≤25%: mang đồ chơi đến cho chủ |
| Mệt | Năng lượng ≤45% | Ngáp, di chuyển chậm, tìm ổ | Năng lượng ≤20%: tự tìm chỗ ngủ |
| Cần đi vệ sinh | Buồn vệ sinh ≥65% | Ngửi sàn, đi vòng quanh, tìm cửa | ≥85%: rên hoặc đứng cạnh cửa; ≥95%: tai nạn nếu không được đưa đi |
| Muốn gần chủ | Tùy tình cảm và tính cách | Đi theo, tựa vào chân, nằm cạnh hoặc đưa đồ chơi | Đây là hành vi xã hội, không phải chỉ số bị phạt |

Chỉ hiển thị một lời nhắc rõ cho mỗi nhu cầu tại một thời điểm. Tránh lặp âm thanh liên tục; sau khi thú báo hiệu, chờ ít nhất **60 giây thực tế** trước khi phát lại cùng một lời nhắc, trừ khi tình trạng trở nên nguy cấp hơn.

## 4. Tác dụng của hoạt động chăm sóc

Giá trị cộng/trừ áp dụng ngay khi hoạt động hoàn tất. Chỉ số không vượt quá 100% hoặc thấp hơn 0%.

| Hoạt động | Tác dụng mặc định | Tác dụng lên tình cảm | Ghi chú |
|---|---|---:|---|
| Cho một khẩu phần ăn | Độ no +40% | +1% | Nếu độ no >90%, chỉ tăng phần còn thiếu; không gây phạt khi cho ăn thêm |
| Đổ đầy bát nước | Độ khát +60% | +0,5% | Bát nước có thể tự cạn theo thời gian nếu game cần quản lý vật phẩm |
| Chải lông | Sạch sẽ +18% | +1% | Có thể cho thú thích chải lông nhận thêm vui vẻ |
| Tắm | Sạch sẽ +65% | +1,5% | Tắm thú sợ nước vẫn thành công; không trừ tình cảm |
| Lau chân | Sạch sẽ +12% | +0,5% | Dùng sau khi đi mưa hoặc bùn |
| Vuốt ve, trò chuyện | Vui vẻ +5% | +0,5% | Tối đa 3% tình cảm mỗi phút thực tế từ hành động này |
| Chơi một lượt ngắn | Vui vẻ +18%; năng lượng −5% | +1% | Trò chơi thú yêu thích: thêm +5% vui vẻ |
| Đi dạo 3 phút | Vui vẻ +25%; năng lượng −10%; buồn vệ sinh về 0% | +2% | Sạch sẽ −10%; nếu bùn nhiều: −22%; mưa lớn: −35% |
| Ngủ 1 giờ trong game | Năng lượng +12% | +0% | Ngủ gần chủ có thể tạo hoạt ảnh thân thiết |
| Dạy một lệnh ngắn | Năng lượng −3%; vui vẻ +5% | +2% | Thú được thưởng khi làm đúng |
| Đưa đến bác sĩ thú y | Sức khỏe theo điều trị | +1% | Chỉ cần khi sức khỏe thấp hoặc có sự kiện bệnh |

**Chống tăng chỉ số bằng cách lặp thao tác:** cùng một hành động tăng tình cảm chỉ được tính đầy đủ một lần mỗi **5 phút trong game**. Lặp lại trong khoảng đó chỉ nhận 50% tình cảm. Nhu cầu vẫn được xử lý bình thường.

## 5. Buồn vệ sinh, tai nạn và sức khỏe

- Khi buồn vệ sinh đạt **65%**, thú bắt đầu tìm cửa hoặc khu vệ sinh.
- Ở mức **85%**, thú phát tín hiệu rõ hơn.
- Ở mức **95%**, cho người chơi tối đa **1 giờ trong game** để đưa thú đi trước khi xảy ra tai nạn.
- Khi đi vệ sinh đúng nơi, buồn vệ sinh trở về **0%**. Thưởng hoặc khen có thể tăng tình cảm thêm **0,5%**.
- Tai nạn không làm giảm tình cảm. Người chơi dọn chỗ bẩn để khôi phục vệ sinh khu vực; thú có thể tỏ vẻ ngại hoặc tìm chủ để được trấn an.

Sức khỏe chỉ bắt đầu giảm khi **Độ no, Độ khát hoặc Năng lượng dưới 10% liên tục 3 giờ trong game**. Khi điều kiện này xảy ra, sức khỏe giảm **4% mỗi giờ trong game**, tối đa giảm đến 60% do bỏ bê nhu cầu. Sức khỏe không thể tự giảm xuống 0% theo cơ chế này; thú cần được chăm sóc hoặc khám thú y. Không áp dụng suy giảm sức khỏe khi người chơi offline.

## 6. Tình cảm, tính cách và bám theo chủ

Tình cảm không suy giảm theo thời gian. Nó biểu thị mức độ quen thuộc và tin tưởng, không phải nhu cầu cần người chơi liên tục duy trì.

| Tình cảm | Hành vi xã hội |
|---:|---|
| 0–24% | Còn dè dặt; vẫn nhận lệnh cơ bản, nhưng thường giữ khoảng cách |
| 25–49% | Chủ động đến gần khi được gọi; bắt đầu chơi cạnh chủ |
| 50–74% | Đi theo chủ trong nhà khi được yêu cầu; thường kiểm tra xem chủ đang ở đâu |
| 75–89% | Tự đi theo ở khoảng cách vừa phải; chào đón chủ nhiệt tình |
| 90–100% | Có thêm hành vi thân thiết như tựa vào chủ, mang đồ chơi đến hoặc nằm cạnh |

Tính cách điều chỉnh tần suất và hình thức biểu hiện, không khóa các nhu cầu cơ bản:

- **Quấn chủ:** hay đi theo và nằm cạnh chủ.
- **Độc lập:** nghỉ ở chỗ quen; vẫn đến khi được gọi.
- **Năng động:** muốn chơi thường xuyên hơn, vui vẻ giảm nhanh hơn một chút.
- **Điềm tĩnh:** ít chạy quanh; nghỉ nhiều hơn.
- **Nhút nhát:** cần thời gian làm quen với người lạ hoặc tiếng động.
- **Thích nước:** hợp tác khi tắm; có thể vui vẻ hơn sau khi tắm.
- **Sợ nước:** ban đầu do dự, nhưng hoạt động tắm vẫn hoàn tất và không làm giảm tình cảm.

Trong phiên bản đầu, giới hạn ảnh hưởng của tính cách vào tốc độ nhu cầu ở mức **±20%** so với mặc định. Ví dụ, chó năng động có thể mất vui vẻ nhanh hơn 20%; chó điềm tĩnh có thể mất vui vẻ chậm hơn 20%.

## 7. Thứ tự ưu tiên hành vi tự động

Khi có nhiều nhu cầu cùng lúc, thú xử lý theo thứ tự:

1. Tránh nguy hiểm hoặc thoát khỏi vị trí bị kẹt.
2. Lệnh trực tiếp của người chơi, trừ khi sức khỏe đang nguy cấp.
3. Tìm nước khi Độ khát ≤10%.
4. Tìm nơi đi vệ sinh khi Buồn vệ sinh ≥85%.
5. Tìm thức ăn khi Độ no ≤25%.
6. Tìm chỗ ngủ khi Năng lượng ≤20%.
7. Tìm chủ hoặc đồ chơi khi Vui vẻ ≤25%.
8. Đi theo chủ, nghỉ ngơi hoặc thực hiện hành vi theo tính cách.

Nếu thú không thể đến bát, cửa hoặc chủ do vật cản, nó tìm đường khác. Nếu không tìm được trong vài giây, thú đứng ở vị trí an toàn và phát tín hiệu để người chơi nhận ra vấn đề.

## 8. Công thức cập nhật mẫu

Cập nhật theo phần thời gian đã trôi qua để kết quả giống nhau trên thiết bị nhanh hoặc chậm:

`thay_doi = toc_do_moi_gio × so_gio_trong_game_da_troi_qua`

Ví dụ, nếu Độ no giảm 3,5% mỗi giờ trong game và có 30 phút trong game trôi qua, Độ no giảm 1,75%.

Sau mỗi lần cập nhật, giới hạn giá trị:

`gia_tri_moi = min(100, max(0, gia_tri_hien_tai + thay_doi))`

Khi người chơi mở game lại, tính thời gian offline theo quy tắc ở mục 1; áp dụng mức giảm đã giới hạn và không phát lại hàng loạt hoạt ảnh hoặc âm thanh đã lỡ trong lúc offline.

## 9. Kịch bản chơi mẫu

1. Người chơi trở về nhà; chó chạy lại chào nếu tình cảm đủ cao.
2. Nếu Độ khát dưới 60%, chó tìm bát nước. Nếu bát trống, chó nhìn chủ và chờ.
3. Nếu Buồn vệ sinh trên 65%, chó ngửi sàn và tìm đến cửa.
4. Người chơi dắt chó đi dạo 3 phút. Chó vui vẻ hơn, buồn vệ sinh về 0%, nhưng năng lượng và sạch sẽ giảm một ít.
5. Trời mưa làm sạch sẽ giảm thêm. Chó để lại dấu chân khi vào nhà.
6. Người chơi lau chân hoặc tắm. Chó sợ nước có thể do dự, còn chó thích nước thì vui vẻ hơn.
7. Sau khi chơi một lượt ngắn, chó mệt và tự tìm ổ khi năng lượng xuống thấp.
8. Nếu người chơi ngồi gần ổ, chó có thể nằm cạnh chủ; hành vi này không làm giảm nhu cầu nào.

## 10. Phạm vi nên làm trước

**Bản đầu tiên:** Độ no, Độ khát, Sạch sẽ, Vui vẻ, Năng lượng, Buồn vệ sinh, ăn/uống/tắm/chải lông/chơi/đi dạo/ngủ, tín hiệu nhu cầu, bám theo chủ, tính cách cơ bản và lưu chỉ số khi thoát game.

**Mở rộng sau:** huấn luyện nhiều lệnh, đồ chơi yêu thích, thời tiết ảnh hưởng đến lông và chân, bệnh nhẹ, nhiều thú tương tác với nhau, thú lớn lên theo thời gian và các hoạt động theo mùa.

Khi thử nghiệm, theo dõi ba việc: người chơi có nhận ra nhu cầu mà không cần đọc bảng chỉ số không; trong phiên chơi 15–20 phút thú có tạo ra đủ tương tác không; và người chơi vắng một ngày có thấy bị phạt oan không. Chỉ chỉnh tốc độ nhu cầu sau khi đã kiểm tra cả ba.

