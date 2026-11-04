# KỊCH BẢN DÀI HẠN — MAP PHỐ THỜI TRANG CẦU VỒNG

> **Chỉ là tài liệu kế hoạch để trao đổi. Không triển khai vào game.**
>
> Ngày cập nhật: 02/11/2026 · Bản nháp 0.2 · Trẻ 5–6 tuổi · Web, màn hình ngang.
>
> Đã chốt với chủ game: có map mua sắm thời trang; dùng **Sao** để lựa và mua đồ; nhiều món thay được trên nhân vật; **giữ nguyên nhân vật đang chọn**, mở các nhóm **quần áo, tóc, mũ, giày, túi và phụ kiện**.
>
> Bổ sung đã chốt: khi được giao triển khai sau này, **agent tự dùng skill tạo hình phù hợp nhân vật**, có thể tạo **bộ sprite nguyên nhân vật mặc đồ mới** thay cho ghép từng món. **Bắt đầu với vài bộ**; bản này đề xuất **3 bộ mới**, chưa làm catalog 24 món ngay.
>
> Đang trao đổi thêm: điểm nhấn tương tác dài hạn và cách chia mục tiêu dành dụm. Các lựa chọn chưa được trả lời được ghi là đề xuất, không phải quyết định đã duyệt. Giá, số món và điều kiện mở trong tài liệu đều là thông số dự kiến.

## 1. Ý tưởng cốt lõi

**“Bé tự chọn phong cách, kiếm Sao qua hoạt động trong game, dành dụm mua món yêu thích rồi mặc thành quả của mình đi khắp thế giới.”**

Đây là một **map thời trang riêng có thể đi lại**, đề xuất tên **Phố Thời Trang Cầu Vồng**. Bé bước vào tiệm, đứng trước gương, thử từng món trên chính nhân vật, chọn món muốn mua, phối với đồ đã có và lưu bộ yêu thích.

Chiều sâu không chỉ đến từ việc đưa thêm hàng đắt lên kệ. Map cần ba vòng tương tác:

1. **Vòng ngắn:** vào phố → thử và phối → chụp một tấm ảnh → vui ngay, kể cả khi chưa có Sao.
2. **Vòng vừa:** thích một món → đánh dấu mục tiêu → chơi để kiếm Sao → quay lại mua → mặc đi phiêu lưu.
3. **Vòng dài:** xây tủ đồ cá nhân → khám phá chủ đề mới → phối nhiều cách với đồ cũ → có ảnh và kỷ niệm riêng.

Định hướng cảm xúc: **“Mình đã cố gắng và tự chọn được bộ này”**, không phải “mình cần mặc đồ đắt hơn bạn khác”.

## 2. Những gì hiện tại cần kế thừa

Đã đọc mã nguồn và tài liệu trong workspace ngày 02/11/2026; chưa chạy thử game trong lượt làm kế hoạch này.

| Cơ sở hiện tại | Ý nghĩa với kế hoạch |
|---|---|
| `RULES.md`: chạm lớn, lời đọc tiếng Việt, phong cách trẻ nhỏ, nhân vật theo lớp là định hướng | Các quầy và gương phải dễ dùng, thao tác hình ảnh, nút ít nhất 64 × 64 px |
| `CharacterSelectModal.js`: có lựa chọn diện mạo và hồ sơ theo tên; `Hero.js` dùng các bộ sprite theo skin | Chưa thể coi là đã có tủ đồ ghép độc lập tóc–áo–quần–giày; đây là hạng mục mới cần thiết kế hình ảnh và hệ thống khi triển khai sau |
| `saveAdapter.js`: tiến trình theo hồ sơ, Sao thuộc người chơi | Tủ đồ và mua sắm cần bám đúng hồ sơ, không đổi tên hoặc tạo hồ sơ mới chỉ vì thay áo |
| `progressionSystem.js`, nội dung bản đồ: thử thách thưởng Sao | Có cơ sở cho mục tiêu “chơi và cố gắng để mua món mình thích” |
| `MazeMinigameModal.js`: hoàn thành mê cung có thưởng 1 Sao trong luồng hiện tại | Giá đồ cần phù hợp từng phần thưởng nhỏ, không mặc định bé kiếm rất nhiều Sao mỗi lượt |
| `fishingSystem.js`: luồng mua/bán hiện tại đồng bộ số dư với Sao người chơi | Cân bằng thời trang phải tính cả nguồn Sao từ bán cá; không dựa vào giả định Vỏ Sò riêng trong bản kế hoạch câu cá cũ |
| `mapsConfig.js`: đã có Nông Trại, Bếp, Hồ Câu và Chợ trong cấu hình hiện tại | Đề xuất phố thời trang là map mới, kết nối các khu sinh hoạt; không thay map Chợ |
| Bếp dùng Sao mua nguyên liệu | Tiền mua áo và tiền mua nguyên liệu cùng một ví; cần cho bé thấy lựa chọn và số dư rõ |

**Không tự sửa hệ thống hiện tại theo tài liệu này.** Khi triển khai sau cần đối chiếu lại phiên bản mã nguồn và thử game, đặc biệt nguồn thưởng Sao, hồ sơ nhân vật và các trạng thái hoạt ảnh.

## 3. Map mới — Phố Thời Trang Cầu Vồng

### 3.1. Vai trò và đường đi

- Một map độc lập, có nền, lối đi, cửa ra/vào, tiệm và người bán riêng.
- Đề xuất có cửa từ Nông Trại để bé dễ tìm, và đường nối với Chợ để có cảm giác một khu sinh hoạt chung.
- Đi vào map không tốn Sao. Thử đồ, xem catalog, phối đồ đã có và chụp ảnh cơ bản đều miễn phí.
- Không là một vùng chiến dịch bắt buộc; không cần mua áo mới để qua cổng học, câu cá hoặc chăm thú.
- Đến đúng quầy/gương mới mở tương tác; không mở bảng mua sắm ngay khi chạm ở xa.
- Đóng quầy trả nhân vật về đúng chỗ trong phố. Hai lối về Nông Trại/Chợ đều có biển hình rõ.

### 3.2. Bố cục kịch bản

```text
┌────────────────────────────────────────────────────────────┐
│ [Tiệm Quần Áo]    [Gương Thử & Tủ Đồ]     [Tóc & Mũ]       │
│                                                            │
│              QUẢNG TRƯỜNG — NHÂN VẬT ĐI LẠI                │
│                                                            │
│ [Giày & Túi]      [Góc Chụp Kỷ Niệm]    [Phụ Kiện]         │
│                                                            │
│ [Về Nông Trại]     [Bảng Chủ Đề & Mục Tiêu]     [Sang Chợ] │
└────────────────────────────────────────────────────────────┘
```

Đây là sơ đồ ý tưởng, chưa dựng map hoặc chốt tọa độ. Bản đầu có thể gom Giày–Túi–Phụ Kiện vào một quầy để map không quá dày; dài hạn mới tách nếu việc đi giữa tiệm thật sự vui.

| Khu | Bé làm gì? | Lý do quay lại |
|---|---|---|
| Tiệm Quần Áo | Thử áo, quần/váy hoặc bộ liền; so sánh với đồ đang mặc | Tìm cách phối mới, xem nhóm mẫu mới được mở |
| Tiệm Tóc & Mũ | Đổi kiểu tóc, thử mũ, quan sát mặt trước và sau | Một thay đổi nhỏ làm bộ cũ có cảm giác mới |
| Quầy Giày–Túi | Thử khi đi bộ vài bước, xem túi có vừa nhân vật | Hoàn thiện bộ theo sở thích |
| Quầy Phụ Kiện | Chọn một chi tiết nổi bật, tháo khi không thích | Đổi phong cách với chi phí Sao thấp |
| Gương & Tủ Đồ | Phối đồ đã sở hữu, lưu bộ, mặc bộ đã lưu | Tiếp tục chơi cả khi chưa mua thêm gì |
| Góc Chụp | Chọn tư thế, phông và khung ảnh đã có | Ghi lại một bộ tự phối hoặc thành quả sau mua sắm |
| Bảng Chủ Đề | Xem lời mời phối đồ và món đang dành dụm | Có ý tưởng cụ thể để chơi và mục tiêu quay lại |

### 3.3. Phong cách và người bán

Giữ cảm giác đồ chơi mềm, màu sáng, mái tiệm bo tròn, móc áo và hộp giày lớn dễ nhận ra. Ma-nơ-canh nhỏ cùng tỷ lệ với nhân vật, không tạo kỳ vọng mặc lên sẽ đẹp khác hẳn ảnh bán.

Đề xuất **Cô Cừu thợ may** và **Bạn Sóc phụ kiện** làm nhân vật phụ. Lời chào dựa vào việc bé đang làm: “Bé muốn thử chiếc mũ này không?”, “Món bé đang để dành vẫn ở đây.” Không nhận xét cơ thể, không chê trang phục cũ, không hối mua.

Thú đồng hành có thể ngồi chờ, nghiêng đầu khi bé đổi mũ hoặc vỗ chân lúc chụp ảnh. Không tiêu nhu cầu thú, không yêu cầu thú đủ năng lượng mới được vào phố.

## 4. Các nhóm đồ thay được — đã chốt phạm vi mong muốn

Sáu nhóm dưới là **đích dài hạn**. Bản đầu ưu tiên vài bộ hoàn chỉnh của cùng nhân vật; nếu dùng sprite mặc sẵn thì chỉ mua/thay cả bộ. Chỉ mở nút thay tóc, mũ, áo, giày, túi hoặc phụ kiện riêng khi đã có hình ảnh và cơ chế ghép tương ứng, không hứa tách từng món từ một ảnh nguyên nhân vật.

| Nhóm | Lựa chọn dài hạn | Quy tắc cần rõ |
|---|---|---|
| Quần áo | Áo, quần, váy/chân váy, bộ liền | Bộ liền thay đồng thời phần áo và dưới; không mặc chồng sai |
| Tóc | Kiểu tóc và một số màu được tuyển chọn | Không đổi tên, da, khuôn mặt hoặc chuyển nhân vật khi chọn tóc |
| Mũ | Mũ lá, nón câu cá, mũ thợ bánh, nơ đội đầu | Tóc vẫn lưu khi đội mũ; tháo mũ phục hồi tóc đã chọn |
| Giày | Giày vải, ủng mưa, dép vườn, giày lễ hội | Không thay tốc độ chạy, không mua sức mạnh bằng đồ mặc |
| Túi | Túi đeo, ba lô, túi giỏ nhỏ | Là ngoại trang, không tăng số ô cá hoặc kho nguyên liệu |
| Phụ kiện | Kính, khăn, nơ, huy hiệu cài áo | Bản đầu giới hạn một ô; dài hạn tách kính/khăn khi hình ảnh đủ rõ |

Tất cả món mua phải xuất hiện được **trên nhân vật đang chọn**, không chỉ là icon trong túi hoặc ảnh ở gương. Có thể thay toàn bộ bộ sprite để biểu diễn **cùng nhân vật đó đang mặc đồ mới**, vẫn giữ danh tính, hình thể, tên, hồ sơ và tiến trình. Không tự đổi sang một nhân vật khác để mặc vừa.

Vì hình thể nhân vật hiện tại khác nhau, cùng một mẫu có thể cần các bản vẽ vừa từng hình thể. Nếu chưa làm được mẫu phù hợp, không bán cho nhân vật đó. Mục tiêu dài hạn là thư viện mẫu tương đương cho các nhân vật; không để bé mua xong mới thấy “nhân vật này không mặc được”.

### Luật phối và xung đột

- Mỗi ô chỉ trang bị một món. Thay mới tháo món cùng ô, không xóa quyền sở hữu.
- Chọn bộ liền tạm thay áo và quần/váy; bộ tách trước đó vẫn trong tủ.
- Chuyển về áo/quần tách không khiến nhân vật thiếu đồ: dùng món vừa chọn cùng phần cơ bản tương ứng.
- Mũ che một phần tóc nhưng không đổi kiểu tóc đã lưu. Trường hợp mái tóc/mũ không hợp phải có hình thể hiện hoặc biến thể phù hợp trước khi bán.
- Túi, tóc dài và khăn phải đúng lớp khi quay lưng. Không đè lên tay cầm cần, mặt hoặc công cụ trong các hoạt động.
- Không đổi vũ khí, sức chiến đấu, nhu cầu thú, sức chứa túi hoặc độ khó câu cá chỉ vì thay ngoại trang.
- “Tháo hết” nghĩa là trở về bộ mặc định kín đáo, không tạo trạng thái không mặc đồ.

## 5. Kịch bản chuyến mua sắm đầu tiên

### Cảnh 1 — Một phố mới đang chờ

Bé tới biển áo ở Nông Trại, đi qua cửa và thấy Phố Thời Trang. Cô Cừu chào: **“Bé có thể thử đồ trước. Khi thích món nào, mình cùng để dành Sao nhé!”**

Bé chưa có Sao vẫn đi vào được, không bật ngay hộp báo thiếu tiền.

### Cảnh 2 — Thử bộ đầu tiên thật dễ nhận ra

Bé tới chiếc gương, chọn bộ **Dạo Phố Lá Non**. Nhân vật mặc thử áo và phụ kiện hợp bộ; gương có nút **“Quay người”** và **“Đi thử”**. Thẻ ghi rõ **“Đang thử — chưa mua”**. Nếu dùng sprite nguyên bộ, giao diện ghi “Thay cả bộ”, không cho tháo mũ/áo riêng khi chưa hỗ trợ.

Nút lớn là **“Mua bộ: 6 Sao”**, bên cạnh **“Để dành bộ này”**. Chạm ảnh chỉ thử, không tự mua. Khi mở hệ ghép riêng ở giai đoạn sau, mới bổ sung kịch bản mua từng món giá nhỏ.

### Cảnh 3 — Có mục tiêu mà không bị chặn chơi

Nếu bé có 2 Sao, màn mục tiêu hiện sáu hình Sao: hai đã sáng, bốn còn trống. Lời đọc: **“Bộ này cần sáu Sao. Bé có hai Sao, mình còn cần bốn Sao nữa.”**

Chọn **“Đi kiếm Sao”** mới mở gợi ý hoạt động phù hợp; bé chọn xong mới rời phố. Không tự chuyển sang bài khó, không bỏ qua quà đang nhận hoặc lượt chơi đang dang dở.

Nếu bé đã đủ tiền, có thể mua ngay. Kịch bản không buộc tiêu hết Sao hoặc giả vờ thiếu tiền để dạy dành dụm.

### Cảnh 4 — Cố gắng rồi quay lại

Bé hoàn thành thử thách phù hợp hoặc hoạt động kiếm Sao hợp lệ của game. Khi trở lại, Cô Cừu nói **“Bé đã có đủ Sao cho chiếc mũ rồi!”** nếu thật sự đủ.

Không phát lời chúc này khi chỉ đủ một phần, không tặng Sao chỉ vì mở lại tiệm.

### Cảnh 5 — Bé tự quyết định mua

Hiện đúng ảnh bộ, giá và số Sao còn lại sau mua. Bé chạm xác nhận: ví trừ 6, bộ Dạo Phố Lá Non vào tủ một lần. Lời đọc: **“Bộ đồ này là của bé rồi!”** Không tính bộ hoàn chỉnh thành nhiều món mua riêng nếu nó chưa tách được.

Hai lựa chọn: **“Mặc ngay”** hoặc **“Cất vào tủ”**. Mua không buộc thay bộ đang mặc.

### Cảnh 6 — Mang thành quả vào thế giới

Bé mặc bộ mới, đi vài bước ra phố; toàn bộ diện mạo đi cùng nhân vật. Bạn thú nhún chân, Góc Chụp mời chụp ảnh nếu bé thích.

Khi về Nông Trại, sang Chợ, câu cá hoặc đi học, món đã mặc vẫn hiện đúng theo hành động được hỗ trợ. Kết thúc lượt không tự chọn một món đắt hơn làm mục tiêu kế tiếp.

## 6. Mua, thử và sở hữu là ba việc khác nhau

### Thử đồ

- Thử miễn phí bao nhiêu lần cũng được; không tiêu Sao hoặc nhận thưởng từ việc thử lặp.
- Lưu bộ đang mặc trước khi thử. Chọn **“Thôi thử”** hoặc rời phố khi chưa xác nhận mặc: khôi phục bộ đó.
- Có thể thử phối món chưa mua với món đã có, nhưng từng món chưa mua phải có nhãn rõ và tổng giá các món còn thiếu.
- Không mang đồ chưa sở hữu ra map khác. Góc Chụp cơ bản chỉ lưu ảnh bằng đồ đã có; nếu sau này cho ảnh thử đồ thì phải ghi rõ bản thử, không thay quyền sở hữu.

### Mua

- Dùng đúng **Sao hiện có trong ví nhân vật/hồ sơ**. Không tiền thật, vay Sao, trả góp hoặc thuê đồ theo giờ.
- Xem một món không tự mua. Xác nhận một lần mới trừ Sao và thêm quyền sở hữu trong cùng giao dịch.
- Mua rồi sở hữu mãi, thay ra không mất, mặc nhiều không hỏng.
- Món đã có ghi **“Đã có — Mặc thử”**, không mua trùng.
- Bản đầu mua từng món; bộ đầy đủ cho xem tổng giá, chưa có nút một chạm mua cả bộ.
- Chưa đề xuất bán lại quần áo ở bản đầu, tránh bé bán nhầm và tạo vòng mua–bán kiếm Sao. Quyền hoàn tác mua nhầm, nếu cần, phải thiết kế riêng trước khi thêm.

### Mặc và lưu bộ

- Đồ đã mua thay miễn phí ở gương hoặc tủ đồ nhanh.
- Mua sắm diễn ra trong phố; ở map khác chỉ thay đồ đã có khi đang ở trạng thái an toàn, không mở cửa hàng mua từ xa.
- Tủ nhanh giữ chức năng thay đồ tiện lợi; phố có thêm trải nghiệm thử, người bán, chủ đề và chụp ảnh để có lý do ghé lại.
- Ban đầu lưu 3 bộ, dài hạn đề xuất 6 bộ miễn phí. Có thể ghi tên bằng biểu tượng thay vì bắt bé gõ chữ.
- Chọn bộ có món chưa mua chỉ là xem ý tưởng, không thể bấm “Mặc toàn bộ” để lách sở hữu.

## 7. Sao và động lực cố gắng — cần rõ nhưng vừa sức

### 7.1. Nguyên tắc giá

Không tăng giá theo ví của bé; không giảm giá đếm ngược hoặc món biến mất nếu bỏ chơi. Một món cơ bản đáng thích phải mua được sớm; những món cầu kỳ có mục tiêu dài hơn nhưng không cần để chơi.

| Nhóm giá dự kiến | Ví dụ | Vai trò |
|---|---|---|
| 3–5 Sao | Mũ đơn giản, nơ, phụ kiện nhỏ | Có thành quả sớm, không toàn đồ đẹp đều đắt |
| 6–10 Sao | Bộ mở đầu đơn giản; về sau có áo, giày, kiểu tóc và quần/váy cơ bản | Mục tiêu ngắn, tự chọn món mình thích |
| 12–18 Sao | Bộ theo chủ đề đầu tiên; về sau có túi, mẫu áo và kiểu tóc cầu kỳ hơn | Cần dành dụm qua nhiều hoạt động |
| 20–30 Sao | Bộ liền hoặc món có hoạt ảnh trang trí nhỏ | Mục tiêu trung hạn, không có sức mạnh vượt trội |
| 35–50 Sao | Mẫu kỷ niệm rất cầu kỳ ở giai đoạn sau | Mục tiêu dài hạn tùy thích; không bày tràn ngay từ lần đầu |

Giá là đề xuất để đối chiếu tốc độ kiếm thực tế. Không quy đổi cứng thành số ngày hoặc hứa “chơi 10 phút mua được” khi chưa đo thời lượng và nguồn thưởng.

Ở bản mở đầu, dùng giá 6/12/18 Sao cho ba bộ tại mục 10. Khi đã mở hệ ghép món, ví dụ bộ **Dạo Vườn**: mũ 3 + áo 8 + quần 5 + giày 5 = **21 Sao**. Khi đó bé có thể mua riêng mũ và phối với đồ miễn phí trước, không cần có 21 Sao mới được tham gia chủ đề dạo vườn.

### 7.2. Bé kiếm Sao bằng cách nào?

- Nguồn chính cần được giới thiệu là thử thách học, giải cứu và hoạt động phù hợp trình độ của bé.
- Nguồn kiếm hiện tại khác, gồm bán cá, vẫn được tính nếu game đang trả vào cùng ví. Kế hoạch này không tự vô hiệu nguồn Sao đó.
- Nút “Đi kiếm Sao” gợi ý tối đa 2–3 hoạt động, nêu phần thưởng đúng quy tắc hiện hành và cần trở về đâu; không hứa mọi hành động đều thưởng.
- Phối đồ, thử tóc, chụp đi chụp lại hoặc mua đồ không tự sinh Sao. Tránh vòng “mua đồ → nhận nhiều Sao hơn giá → mua tiếp”.
- Phải còn đường kiếm Sao hợp lệ sau khi hoàn thành chiến dịch: dùng thử thách chơi lại có nội dung thay đổi, được thiết kế và duyệt trước khi phát hành map. Không giả định hoàn thành lần đầu là nguồn vô hạn.
- Một lần hoàn thành chỉ nhận thưởng một lần; tải lại hoặc bấm nhận nhiều lần không tăng thu nhập.

**Điểm cần chủ game chọn thêm:** muốn “cố gắng” chủ yếu là cố gắng học, hay chấp nhận học + câu cá + hoạt động hợp lệ khác ngang nhau? Nếu muốn ưu tiên học, nên điều chỉnh nhịp thưởng toàn game sau khi kiểm kê, thay vì âm thầm biến Sao thời trang thành một tiền tệ thứ hai.

### 7.3. Dành dụm có mục tiêu, không khóa tiền

- Bé đánh dấu **một món đang muốn mua**; có thể thêm tối đa 3 món vào danh sách thích nhưng chỉ một món hiện tiến độ chính.
- Tiến độ dùng **số dư hiện tại / giá món**, không dùng tổng Sao kiếm trong đời để báo nhầm đã đủ tiền.
- Chọn mục tiêu không trừ hoặc chuyển Sao vào một ví phụ. Bé vẫn có thể mua nguyên liệu Bếp hoặc mồi câu bằng cùng ví.
- Mua thứ khác làm số dư giảm thì mục tiêu cập nhật trung thực; không dùng lời trách “Bé tiêu mất rồi”.
- Nếu đổi mục tiêu, không mất phí, không mất mốc học hoặc phần thưởng đã có.
- Mua được món mục tiêu thì tổ chức một phản hồi nhỏ, lưu dấu kỷ niệm nếu bé muốn; không nhận lại phần thưởng vô hạn bằng cách đổi qua lại.

### 7.4. Ví dụ hành trình dành dụm

Bé muốn áo 8 Sao, đang có 3 Sao. Bảng nói còn 5. Hoàn thành hoạt động nhận 2 Sao → ví 5, còn 3. Bé mua nguyên liệu hết 1 → ví 4, còn 4. Khi tích lên 8 và mua áo → ví 0, áo thuộc về bé mãi.

Nếu mỗi lượt kiếm được 1 Sao, phần còn thiếu 5 Sao tương ứng 5 lần hoàn thành hợp lệ. Nếu một thử thách thưởng 3 Sao, không được tiếp tục quảng cáo “cần 5 lượt”. Không tăng độ khó chỉ để kéo dài việc tiết kiệm.

## 8. Những hoạt động làm map sống lâu

Đề xuất mặc định trong lúc chờ chủ game chọn điểm nhấn: **phối chủ đề + lưu bộ + ảnh kỷ niệm**. Các nhánh dưới chia ưu tiên, không mặc định làm tất cả ngay.

### A. Gương thử có phản hồi — cốt lõi

Bé nhìn trước/sau, đi vài bước, ngồi ghế hoặc cầm đồ minh họa phù hợp. Cô Cừu gọi tên chi tiết “Chiếc túi hình lá!” thay vì chỉ nói đẹp với mọi lần bấm.

Mỗi lần đổi tóc/mũ/áo thấy ngay nhân vật thay đổi. Đây là niềm vui không cần tiêu tiền, phải làm tốt trước khi thêm hệ thống sưu tầm.

### B. Lời mời phối đồ theo chủ đề — đề xuất ưu tiên

Ví dụ: **Dạo vườn**, **Đi câu cùng bạn**, **Đầu bếp vui vẻ**, **Ngày mưa**, **Chuyến đi màu xanh**.

- Chủ đề mở theo chương, không đếm ngược theo ngày thật.
- Gợi ý bằng 1–2 hình, không đưa một danh sách dài yêu cầu.
- Luôn có phương án hoàn thành bằng đồ miễn phí/đã sở hữu; món bán là lựa chọn làm phong cách riêng, không là “vé vào”.
- Có lời nhờ cụ thể: “Bạn Sóc cần một chiếc mũ cho chuyến dạo vườn. Bé thử phối nhé!” Hoàn thành được khi có mũ phù hợp; không bắt đúng một món có mã ẩn.
- Với chủ đề tự do, bé chọn xong là được lưu/chụp; không chấm xấu/đẹp hoặc tước ảnh vì phối khác ý người lớn.
- Phản hồi dựa trên chi tiết: “Bé chọn mũ và túi cùng hình lá!” Không dùng nhận xét ngoại hình, giới tính hoặc đắt tiền.
- Thưởng khám phá bằng dấu trong album hoặc phông ảnh cơ bản đã duyệt, không thưởng Sao mỗi lần gửi lại cùng một bộ.

### C. Album hành trình — đề xuất ưu tiên

Mỗi ảnh gồm nhân vật mặc đồ đã sở hữu, tư thế và phông được chọn. Bé xem lại ảnh mặc mũ đầu tiên, chuyến đi câu hoặc bộ tự phối sau một mục tiêu tiết kiệm.

Đề xuất tối đa 24 ảnh lưu cục bộ ở bản đầu; đầy thì hỏi chọn ảnh thay, không tự xóa. Không mở thư viện ảnh người thật, không đăng mạng, không gửi ảnh cho người khác. Xuất ảnh ra máy là lựa chọn riêng về sau, có chủ động của người dùng.

### D. Nhân vật phụ nhớ câu chuyện — trung hạn

Lần đầu mua mũ, Cô Cừu chào theo chi tiết đó. Sau khi bé đã phối vài chủ đề, Bạn Sóc nhờ thử khăn mới. Người bán nhớ mốc thực, không bịa bé đã làm việc chưa làm.

Chuỗi ngắn 2–3 bước, làm lúc nào cũng được. Không phạt vì nghỉ nhiều ngày; không thông báo cửa hàng buồn vì bé không quay lại.

### E. Góc chọn màu và trang trí — dài hạn, chờ chọn

Nếu chủ game thích thiết kế, về sau cho chọn bảng màu tuyển sẵn hoặc gắn một hình thêu lên mẫu hỗ trợ. Có xem trước, luật giá và quyền đổi lại rõ; không tự thu thêm Sao mỗi lần kéo thanh màu.

Ưu tiên mở biến thể sở hữu lâu dài hoặc đổi màu miễn phí cho món đã hỗ trợ. Không biến một món thành hàng chục lần mua gần giống nhau chỉ để hút Sao.

### F. Bộ sưu tập có giá trị sử dụng — dài hạn

Các nhóm như Vườn Lá, Mây Trắng, Nắng Vàng giúp tìm món dễ phối, không buộc mua đủ bộ. Một món vẫn mặc bình thường khi chưa có các món còn lại.

Nếu thưởng khi đủ bộ, ưu tiên khung ảnh hoặc động tác vui, ghi rõ yêu cầu trước và chỉ trao một lần; không trả Sao lớn tạo vòng mua hàng tự hoàn vốn. Không cần người chơi sở hữu toàn bộ catalog để xem hết câu chuyện chính.

## 9. Tiến trình dài hạn theo mốc chơi

Không gắn tiến trình với số ngày liên tục. Mỗi bé có thể đạt mốc theo tốc độ của mình.

| Chặng | Trải nghiệm | Điều kiện đề xuất | Thành quả |
|---|---|---|---|
| Làm quen | Đi phố, thử một món, quay người | Tự chọn vào map | Biết thử khác mua, vẫn chơi được với ví 0 |
| Món của mình | Chọn mục tiêu, kiếm Sao, mua món đầu | Đủ giá món bé chọn | Mặc được thành quả khắp game |
| Biết phối | Dùng vài món sẵn có, lưu bộ và ảnh đầu | Đã hiểu gương/tủ, không cần sở hữu hàng đắt | Bộ tự phối và kỷ niệm |
| Có phong cách | 3 chủ đề có đồ miễn phí phù hợp, vài lời nhờ | Đã hoàn thành giới thiệu, không yêu cầu ba ngày đăng nhập | Mở thêm chủ đề và lựa chọn mẫu |
| Tủ đồ mở rộng | Nhóm mẫu, NPC và phông ảnh mới | Mốc khám phá/học phù hợp đã được duyệt | Có ý tưởng dài hạn và món để dành |
| Sáng tạo riêng | Đổi màu hoặc thêu trên mẫu hỗ trợ | Chỉ khi nhánh này được chủ game chọn | Tái sử dụng đồ cũ theo sở thích |

Mở cửa tiệm cơ bản và tủ đồ không phụ thuộc mua món đắt. Mốc bộ sưu tập, nếu có, là phụ trợ; mốc học có thể mở nhóm mẫu để xem/mua nhưng không tước quyền mặc đồ đã sở hữu.

## 10. Catalog ban đầu và cách mở rộng

### 10.1. Bắt đầu với 3 bộ mới, ngoài bộ mặc định đang có

| Bộ đề xuất | Hướng hình ảnh | Giá thử | Vai trò |
|---|---|---:|---|
| Dạo Phố Lá Non | Xanh lá–kem, dáng gọn, một chi tiết lá dễ nhận ra | 6 Sao | Bộ đầu vừa sức dành dụm, khác rõ diện mạo mặc định |
| Đi Câu Vui Vẻ | Màu nước–vàng nhạt, nón mềm, túi nhỏ; giữ tay cầm cần rõ | 12 Sao | Nối trải nghiệm mặc đồ với map Hồ Câu |
| Mây Cầu Vồng | Kem–xanh trời, họa tiết mây/cầu vồng, một phụ kiện nổi bật | 18 Sao | Mục tiêu tiếp theo, có cá tính nhưng không tăng sức mạnh |

Tên, giá và mỹ thuật là đề xuất; số lượng khởi đầu được giới hạn ở **vài bộ, cụ thể đề xuất 3 mẫu thiết kế**, không phải 24 món ngay. Bộ cơ bản hiện có vẫn miễn phí và luôn mặc lại được.

Một mẫu thiết kế có thể cần bản thể hiện khác nhau cho các hình thể nhân vật. Không hiểu “3 mẫu” là chỉ cần đúng 3 ảnh PNG, cũng không tự nhân thành ba bộ cho mọi nhân vật trước khi kiểm tra khối lượng. Ưu tiên nhân vật hiện có được chọn làm mẫu thử; bản nào đủ hình ảnh mới mở bán cho nhân vật tương ứng.

**Phương án bản đầu:** agent tạo cả nhân vật mặc mỗi bộ, dùng cùng danh tính và tỷ lệ. Mua một lần để thay cả bộ. Chưa cần tách mọi áo/quần/giày; giao diện chỉ cho các lựa chọn thật sự hỗ trợ. Có thể dùng cách ghép lớp ngay nếu thử nghiệm chứng minh các món khớp và khối lượng hợp lý.

**Điều kiện mở rộng:** ba bộ đã mặc thật được ngoài map, đủ hướng/hành động cần thiết, giao dịch và lưu ổn định. Sau đó thêm từng đợt **2–3 bộ hoặc vài món tách rời**, không tạo đồng loạt hàng chục biến thể trước khi biết chất lượng thực tế.

### 10.2. Catalog mục tiêu về sau: 24 món tách rời

Đây là mốc mở rộng dài hạn sau giai đoạn ba bộ, **không phải yêu cầu sản xuất ban đầu**. Không mặc định rằng mua bộ ở giai đoạn đầu đồng nghĩa được sáu món tách rời nếu chúng chưa tồn tại; khi có nâng cấp sang ghép món phải có quy tắc giữ quyền lợi trước khi phát hành.

| Ô | Số mẫu | Ví dụ |
|---|---:|---|
| Tóc | 3 | Tóc gọn, tóc buộc, kiểu mái tròn phù hợp hình thể |
| Mũ | 4 | Mũ lá, mũ vải, nón câu, mũ bếp |
| Áo | 4 | Áo lá, áo mây, áo sọc, áo nắng |
| Quần/váy | 3 | Quần ngắn, quần yếm dưới, chân váy |
| Bộ liền | 2 | Bộ làm vườn, bộ dạo chơi |
| Giày | 3 | Giày vải, ủng mưa, dép vườn |
| Túi | 2 | Túi lá, ba lô nhỏ |
| Phụ kiện | 3 | Kính tròn, khăn nhỏ, huy hiệu vải |
| **Tổng** | **24** | Chưa phải danh sách asset đã được duyệt hoặc tạo |

Không đưa toàn bộ 24 món vào màn hình đầu; chia theo quầy và 4–6 thẻ mỗi trang. Nhóm mẫu mới chỉ trưng bày khi đã hoàn thiện, không bán món mới chỉ có ảnh quảng cáo.

Khi nhánh ghép món đã ổn định, mới cân nhắc mỗi đợt khoảng 6–8 món **phối được với đồ cũ**. Trước đó giữ nhịp đợt nhỏ 2–3 bộ/vài món. Trước khi thêm hàng, kiểm tra có thay đổi đủ rõ trên màn điện thoại, có lý do phối và có mẫu giá thấp. Không lấy đổi màu rất nhỏ làm một bộ sưu tập mới bắt mua lại.

## 11. Yêu cầu trải nghiệm và lời đọc

- Nút ít nhất 64 × 64 px, ký hiệu lớn, nền và chữ tương phản đủ; không chỉ dùng màu để báo đã có/chưa mua.
- Một thao tác chính cho mỗi bước: xem → thử → xác nhận mua → mặc/cất. Nút đóng không đặt sát nút mua.
- Thẻ luôn có ảnh, giá, trạng thái sở hữu và tương thích. Ví và số còn lại sau mua ở gần nhau.
- Giá nhỏ có thể dùng hình từng Sao; giá lớn dùng số to kèm lời đọc, không xếp 50 icon chen chúc.
- Bé không cần biết đọc hoặc tự tính trừ để hiểu thiếu bao nhiêu; nút loa đọc tên, giá và số dư.
- Không đọc dài liên tục khi bé chuyển mẫu nhanh; chỉ đọc món cuối đang chọn, có nút nghe lại.
- Đang thử không tự trang bị thật; đang mặc thử lúc rời đi phải có lựa chọn trở về đồ đã sở hữu rõ ràng.
- Nhân vật, thú và nền sau quầy không tiếp tục nhận chạm để chạy hoặc mở cửa khác.
- Tủ đồ và gương có “Trở về bộ đang mặc”, giúp bé yên tâm thử.
- Nhãn không dùng “đồ xấu”, “đồ nghèo”, “bộ cho bé trai/bé gái”; bé chọn theo sở thích.
- Hiệu ứng nhẹ, có giảm chuyển động, không pháo giấy che nút và không mặc định bật chớp sáng.

## 12. Điều kiện hình ảnh trước khi có thể bán một món

Đây là phần khối lượng lớn của tính năng tương lai. Nhân vật đang dùng sprite theo diện mạo; mua từng áo/giày không thể chỉ thêm icon vào cửa hàng rồi coi là đã thay đồ.

1. Có mẫu vừa hình thể nhân vật đang dùng, vị trí nối/lớp nhất quán.
2. Đứng và đi các hướng cần thiết không lệch, không tách túi/tóc khỏi người.
3. Các trạng thái game thực sự có dùng nhân vật — chiến đấu, câu cá, ngồi hoặc thao tác khác — có cách thể hiện bộ đang mặc phù hợp.
4. Gương và nhân vật trên map dùng cùng mẫu; không quảng cáo một kiểu, mặc ra một kiểu khác.
5. Mũ/tóc/túi/phụ kiện không che mặt, công cụ hoặc dấu tương tác quan trọng.
6. Ảnh chân dung có thể chọn phần đầu để dễ nhìn, nhưng không vì thay ảnh đại diện mà mất đồ đang mặc trên map.
7. Thiếu asset thì ẩn món khỏi danh sách bán; lỗi sau cập nhật dùng bộ cơ bản an toàn và vẫn giữ quyền sở hữu để khôi phục.

Giai đoạn nguyên mẫu chỉ cần một hình thể và vài món để kiểm tra; trước khi mở bán cho người chơi phải xác định rõ phạm vi tương thích, không hứa tất cả nhân vật mặc được khi chưa có hình ảnh tương ứng.

### 12.1. Agent chủ động dùng skill khi được giao sản xuất sau này

Khi chủ game yêu cầu bắt đầu tạo hình/triển khai, agent tự đọc và dùng skill phù hợp, tự tìm ảnh nhân vật hiện có trong dự án, tự viết mô tả, tạo mẫu, kiểm tra và sửa hình. Không mặc định yêu cầu chủ game phải tự chuẩn bị prompt hoặc tự tìm từng ảnh tham chiếu đã có trong workspace.

| Công việc tương lai | Skill/quy trình dùng | Đầu ra cần có |
|---|---|---|
| Tạo hình gốc cùng nhân vật mặc bộ mới; tạo món/phụ kiện độc lập | [generate2dsprite](C:/Users/Admin/.agents/skills/generate2dsprite/SKILL.md) | Hình mẫu gốc, nhận diện nhân vật, biến thể trang phục và nguồn tạo |
| Tạo hoạt ảnh nhân vật mặc đồ mới từ hình gốc đạt yêu cầu | [video2dsprite](C:/Users/Admin/.agents/skills/video2dsprite/SKILL.md), theo luồng được skill chỉ định | Clip từng hành động, khung hình đã xử lý và thông tin hoạt ảnh |
| Tách nền, căn chân, chuẩn hóa kích thước, xuất ảnh/runtime và kiểm tra | Công cụ xử lý và QA trong các skill trên | Asset sạch, bản xem thử đúng cỡ game, báo cáo giới hạn/lỗi còn lại |

Agent phải kiểm tra khả năng công cụ và đọc lại hướng dẫn skill ở thời điểm làm thật; dùng tuyến tạo ảnh/hoạt ảnh mà skill và cấu hình dự án cho phép. Không ghi API key vào tài liệu, không khẳng định đã tạo ảnh nếu công cụ chưa trả kết quả thật. Nếu chưa có tuyến tạo media hoạt động, chuẩn bị mô tả/công việc và báo đúng phần thiếu; không tự thay bằng hình vẽ code hoặc ảnh giả để coi như hoàn thành.

**Phạm vi của yêu cầu hiện tại vẫn chỉ là kế hoạch:** chưa chạy công cụ kiểm tra media, chưa gọi API tạo ảnh/video, chưa tạo ảnh thử, chưa tích hợp asset. Việc mô tả agent tự dùng skill không đồng nghĩa cho phép bắt đầu sản xuất ngay trong lượt này.

### 12.2. Hai cách làm hình ảnh, một danh tính nhân vật

**Cách A — Ghép món vào nhân vật:** tạo tóc, mũ, quần áo, giày, túi và phụ kiện đúng khớp với nền nhân vật. Phù hợp đích phối đồ tự do, nhưng cần các lớp/hướng/điểm nối nhất quán. Chỉ dùng khi kiểm tra cho thấy ghép thật đạt yêu cầu.

**Cách B — Tạo bộ nhân vật mặc sẵn đồ mới:** tạo toàn bộ hình và hoạt ảnh của **cùng nhân vật** trong từng bộ. Đây là lựa chọn thực tế được ưu tiên thử cho ba bộ đầu nếu sprite hiện tại chưa hỗ trợ tách lớp. Khi mặc, đổi bộ hình ảnh nhưng giữ tên, hồ sơ, tỷ lệ cơ thể, cấp, Sao, tiến trình và quyền sở hữu.

“Thêm bộ nhân vật mặc đồ mới” trong bản này nghĩa là thêm **bộ asset ngoại trang**, không tự tạo hồ sơ hoặc một bạn đồng hành khác. Nếu sau này muốn thêm hẳn nhân vật có danh tính mới, đó là nhánh phải chốt riêng. Không dùng thay nhân vật làm cách lách yêu cầu giữ nguyên nhân vật đang chọn.

### 12.3. Quy trình tạo từng bộ — làm xong một bộ rồi mới nhân rộng

1. **Kiểm kê tham chiếu:** lấy hình đứng/đi của nhân vật hiện tại, hình trước–sau/hướng đang hỗ trợ, kích thước hiển thị, màu sắc, phong cách và các hành động thực tế.
2. **Khóa đặc điểm nhận diện:** khuôn mặt, mắt, màu da/thân, hình thể, tỷ lệ đầu–thân, góc máy, bóng và nét vẽ. Chỉ thay các phần trang phục đã định; không làm nhân vật cao, lớn hoặc khác tuổi hơn.
3. **Lập mô tả bộ:** tên, bảng màu, quần áo/phụ kiện, vùng được thay và vùng cần giữ. Đính kèm ảnh tham chiếu thật cho công cụ, không chỉ ghi đường dẫn trong lời mô tả.
4. **Tạo một hình gốc:** bắt đầu với bộ Dạo Phố Lá Non. Agent tự đối chiếu với nhân vật gốc, sửa lỗi cụ thể từ mẫu gần đạt thay vì liên tục tạo nhân vật mới. Chốt một hình gốc đủ nhất quán trước khi tạo hoạt ảnh.
5. **Tạo hướng và hành động:** dùng cùng hình gốc và đặc tả nhận diện. Với hoạt ảnh nhân vật, theo luồng hình–video–khung hình của skill, từng hành động riêng; không mặc định nhờ mô hình vẽ một sheet nhân vật nhiều ô rồi coi các khung đã ổn định.
6. **Xử lý asset:** nền trong suốt thật, cùng khung và chân neo, cùng tỷ lệ qua các hướng/hành động; không tự phóng to/thu nhỏ từng khung theo đường bao làm nhân vật nhấp nhô sai.
7. **Kiểm tra bằng mắt ở cỡ thật:** đứng cạnh nhân vật gốc và thử trên nền sáng/tối, xem vòng lặp đi/đứng, mặt, tay, mép áo, nón và túi. Đọc kết quả QA; số đo tốt không thay thế việc xem hình.
8. **Đóng gói một bộ hoàn chỉnh:** hình gốc, ảnh xem trước, icon cửa hàng, clip/khung hình, thông tin hoạt ảnh, tham chiếu, mô tả đã dùng và kết quả kiểm tra. Chỉ tính là sẵn sàng khi đủ trạng thái game cần dùng.
9. **Lặp lại cho hai bộ còn lại:** tái dùng chuẩn đã đạt của bộ đầu, giữ giới hạn ba mẫu. Không tự mở sang hàng loạt bộ/tóc/mũ mới trong khi một bộ còn lỗi.

Trong phạm vi sản xuất đã được giao sau này, agent tự thực hiện các bước kỹ thuật thường lệ và tự kiểm tra mẫu; không yêu cầu chủ game xác nhận từng prompt hoặc từng lần sửa ảnh. Nếu có thay đổi danh tính, mở thêm nhân vật mới hoặc tăng số bộ ngoài phạm vi đã chốt, cần quay lại trao đổi hướng trước khi mở rộng.

### 12.4. Danh sách đầu ra tối thiểu cho mỗi bộ

| Thành phần | Yêu cầu |
|---|---|
| Hình gốc được chọn | Cùng nhân vật, trang phục nhận ra rõ, không cắt tay/chân/mũ |
| Hướng nhìn | Phù hợp các hướng game thực sự sử dụng; không lấy ảnh hướng trước giả làm hướng sau |
| Đứng và đi | Cùng tỷ lệ, chân neo ổn định, vòng lặp liền |
| Trạng thái khác | Câu cá, chiến đấu và các trạng thái đang dùng phải có cách thể hiện bộ mới phù hợp trước khi bán để mặc khắp game |
| Icon và ảnh thử | Cùng thiết kế với asset mặc thật; không chỉ tạo hình bán hàng |
| Nguồn và QA | Lưu tham chiếu, mô tả, tuyến/model thực tế, file xuất, kết quả và lỗi còn lại; giữ bản đạt trước đó khi sửa |

Nếu mới có ảnh đứng, chỉ coi là **mẫu thiết kế để xem**, chưa đưa vào danh sách bán như một bộ dùng được khắp game. Giới hạn số bộ không có nghĩa bỏ bớt chất lượng hoặc che đi các trạng thái còn thiếu.

## 13. Dữ liệu và giao dịch dự kiến cho giai đoạn triển khai sau

Không viết mã hoặc sửa save trong lượt lên kế hoạch này.

| Nhóm | Cần nhớ |
|---|---|
| Quyền sở hữu | Mã món, biến thể sở hữu, nguồn mua/mở, tương thích |
| Bộ mặc sẵn | Mã bộ và bộ asset tương ứng cùng nhân vật; tách rõ khỏi món ghép riêng và khỏi mã hồ sơ |
| Đang mặc | Tóc, mũ, áo, phần dưới/bộ liền, giày, túi, phụ kiện |
| Gương đang thử | Chỉ là bản xem trước, tách khỏi đồ đang mặc thật |
| Bộ lưu | Tối đa số bộ đã quy định; chỉ mặc các món hợp lệ đã có |
| Mục tiêu | Một món đang để dành, danh sách thích, mốc hoàn thành đã nhận |
| Chủ đề/album | Chủ đề đã làm, ảnh được chủ động lưu, giới hạn dung lượng |
| Giao dịch | Món, giá thực trả, hồ sơ, mã giao dịch, trạng thái hoàn tất |

Quyền sở hữu và tủ đồ đề xuất thuộc **hồ sơ người chơi**, không theo mỗi lần thay tên hiển thị hoặc chọn một bộ đồ. Không chia sẻ Sao/tủ giữa hai hồ sơ nếu chưa có quyết định riêng. Quy tắc đổi tên hiện tại cần được kiểm tra khi thực sự triển khai để không tạo nhân vật mới ngoài ý muốn.

Mua: kiểm tra ví mới nhất → kiểm tra chưa sở hữu và tương thích → trừ Sao + thêm món trong cùng giao dịch → cập nhật mọi nơi hiển thị ví. Nếu giao dịch không lưu được, không lấy Sao hoặc phát quyền sở hữu một nửa.

Tải lại, chạm đúp, đổi quầy hoặc mở đồng thời tủ/Bếp không được tiêu hai lần hay làm quay ngược Sao đã tiêu. Đặc biệt cần tương thích với nguồn Sao đang đồng bộ giữa Bếp, câu cá, chiến đấu và hồ sơ.

Save cũ khởi tạo tủ với bộ cơ bản và quyền ngoại trang cũ đã có; không bắt mua lại phần thưởng đã mở. Bộ thử chưa mua không trở thành tài sản sau tải lại.

## 14. Rủi ro thiết kế và cách giải quyết

| Vấn đề | Hệ quả | Hướng thiết kế |
|---|---|---|
| Đồ chỉ đẹp trong tiệm, ra map không đổi | Mất niềm tin vào mua sắm | Hoàn thiện mặc thật trước khi bán |
| Món nào cũng quá đắt | Bé thấy không thể đạt | Có mẫu đáng thích 3–5 Sao, không chỉ phụ kiện nhạt |
| Kiếm Sao bằng một việc lặp nhanh hơn mọi việc khác | Bé bỏ quan sát/học để cày | Đo nguồn thu toàn game, đa dạng thử thách; chưa tự đổi thưởng ở bản kế hoạch |
| Thời trang tranh toàn bộ Sao với Bếp/mồi | Bé tiêu nhầm rồi nản | Hiện số dư sau mua, mục tiêu không giữ tiền, đồ cơ bản luôn đủ dùng |
| Chủ đề yêu cầu món phải mua | Trẻ nghèo Sao bị đứng ngoài | Luôn có cách phối hợp lệ bằng đồ miễn phí/đã sở hữu |
| Mở nhiều mẫu nhưng không có việc với đồ cũ | Chỉ còn quay lại để tiêu Sao | Gương, bộ lưu, chủ đề và album tái dùng món |
| Quá nhiều lựa chọn cùng lúc | Bé không tự chọn được | Chia theo nhóm, ít mẫu mỗi màn, không ép xem hết |
| Tóc/mũ không hợp hình thể | Món mua bị lỗi | Chuẩn hóa bản thể và kiểm tra tương thích trước bán |
| Mở thêm hồ sơ khi thay đồ | Mất tiến trình hoặc lẫn ví | Tách mặc đồ khỏi chọn hồ sơ/đặt tên |

## 15. Lộ trình dài hạn — chỉ để duyệt thứ tự

### A. Khóa hướng trải nghiệm

Chốt tên map, mục tiêu dài hạn sáu nhóm đồ, cách ưu tiên nguồn Sao, điểm nhấn chủ đề/khám phá/thiết kế, phạm vi nhân vật tương thích. Ghi rõ agent tự dùng skill sản xuất hình và khởi đầu ba bộ, có thể dùng sprite mặc sẵn. Đầu ra là kịch bản được duyệt; chưa tạo hình hoặc làm game.

### B. Nguyên mẫu mặc thật sau khi có yêu cầu triển khai

Agent dùng skill tạo **một bộ Dạo Phố Lá Non cho một nhân vật hiện có** trước, lấy ảnh thật trong dự án làm tham chiếu. So sánh ghép lớp với sprite mặc sẵn để chọn cách đạt chất lượng và vừa sức. Chỉ khi hình gốc ổn mới làm hướng/hoạt ảnh và thử mặc thật. Không tạo đồng thời ba bộ hoặc đủ sáu nhóm ngay.

**Mục tiêu:** xác minh mặc thật, thao tác trẻ hiểu, khối lượng sản xuất art vừa sức.

### C. Map mua sắm hoàn chỉnh

Hoàn thiện **ba bộ mới tổng cộng**, mỗi bộ có hình ảnh/hành động cần thiết và phạm vi nhân vật rõ. Map riêng, cửa nối, quầy, Sao, bộ mặc định, tủ, một mục tiêu dành dụm, lưu và khôi phục giao dịch. Nếu dùng sprite mặc sẵn thì bán/thay cả bộ; chưa mở các ô ghép giả. Catalog 24 món chuyển sang giai đoạn mở rộng.

**Mục tiêu:** bé thử miễn phí, tự mua một món bằng Sao đã kiếm, mặc ra map và không mất tài sản sau tải lại.

### D. Tương tác quay lại

Thêm bộ lưu, các chủ đề có đồ miễn phí, album và chuỗi hội thoại ngắn. Chỉ chọn những nhánh chủ game đồng ý, kiểm tra trẻ có chơi với đồ cũ dù chưa đủ tiền mua mới.

**Mục tiêu:** map có giá trị chơi ngoài giao dịch; bộ yêu thích có thể đồng hành qua học, câu cá và sinh hoạt.

### E. Mở rộng theo chương

Mỗi chương ban đầu chỉ thêm 2–3 bộ hoặc vài món có thể phối được với đồ cũ, chủ đề mới và kỷ niệm; mở bằng mốc khám phá/học được duyệt. Agent tiếp tục dùng skill và chuẩn nhân vật đã đạt. Khi ghép lớp đã ổn định mới hướng tới catalog 24 món tách rời; không bắt mua lại bộ cũ do đổi kỹ thuật. Kiểm tra nhịp Sao khi toàn game có thêm nguồn thu/chi.

**Mục tiêu:** có món để dành trong dài hạn, không phải lạm phát giá hoặc liên tục bắt mua lại.

### F. Sáng tạo nâng cao nếu được chọn

Đổi màu/thêu, phông và tư thế thêm, câu chuyện người bán sâu hơn. Chỉ làm khi phần thử–mua–mặc và tương tác quay lại đã tốt. Chưa cam kết thời gian hoặc tổng số asset trước khi kiểm tra nguyên mẫu.

## 16. Cách biết kế hoạch đang tạo được động lực tốt

Các chỉ tiêu sau là mục tiêu quan sát trong chơi thử có người lớn, chưa là kết quả đã đo và không yêu cầu cài theo dõi cá nhân.

- Bé phân biệt được đang thử, đã có và đã mua.
- Bé nói/diễn tả được đang muốn món gì và còn thiếu Sao; không cần tính phép trừ thành thạo.
- Bé có thể quay lại mua đúng món đã chọn, nhận ra Sao và việc cố gắng trước đó có liên hệ.
- Sau mua, bé thấy món trên nhân vật ngoài phố, không chỉ trong cửa hàng.
- Bé chưa đủ Sao vẫn có việc vui: phối đồ cơ bản, thử mẫu, làm chủ đề phù hợp hoặc chụp ảnh đồ đã có.
- Bé không bị dẫn vào việc lặp một nút/hoạt động ngắn để lấy thưởng không giới hạn.
- Bé dừng chơi được bất kỳ lúc nào, không lo món sắp mất hoặc người bán thất vọng.
- Theo dõi bằng quan sát nhịp thu–chi để chọn giá; không dùng thời gian chơi dài làm thước đo thành công duy nhất.

## 17. Checklist cho ngày được phép triển khai

- [ ] Map thời trang riêng, lối về rõ; Nông Trại/Chợ cũ vẫn hoạt động đúng.
- [ ] Giữ nhân vật, hồ sơ, tên và tiến trình khi thay từng nhóm đồ.
- [ ] Thử miễn phí, rời thử không mất đồ đang mặc hoặc được món chưa mua.
- [ ] Hiện đủ giá và số dư sau mua; mua trùng/chạm đúp không trừ hai lần.
- [ ] Sao mới nhất thống nhất với Bếp, câu cá và nguồn thưởng hợp lệ.
- [ ] Ví 0 vẫn vào phố và dùng các hoạt động miễn phí được.
- [ ] Có món giá thấp đáng thích; giá cao không tăng sức mạnh.
- [ ] Mũ/tóc, áo/quần/bộ liền và túi/phụ kiện xử lý xung đột đúng.
- [ ] Thay đổi thật trên nhân vật ngoài map, khi quay người và trong các hoạt động đã hỗ trợ.
- [ ] Đồ thiếu tương thích không được bán cho nhân vật đó.
- [ ] Khởi đầu giới hạn ba bộ, không lấy catalog 24 món làm yêu cầu sản xuất ngay.
- [ ] Agent dùng ảnh tham chiếu và skill phù hợp, có file kết quả thật cùng nguồn/QA; không chỉ nêu đã tạo trong báo cáo.
- [ ] Sprite mặc sẵn giữ nguyên danh tính, hồ sơ và tiến trình; giao diện ghi thay cả bộ, không giả vờ tháo/ghép từng món chưa hỗ trợ.
- [ ] Một bộ đủ ảnh đứng nhưng thiếu hoạt ảnh chỉ được xem là mẫu, chưa bán như bộ dùng khắp game.
- [ ] Tủ nhanh chỉ dùng đồ đã có; không lách mua hoặc mở giao dịch khi đang chiến đấu/câu cá.
- [ ] Lưu bộ, chuyển map, tải lại và đổi hồ sơ không làm mất hoặc lẫn quyền sở hữu.
- [ ] Hoàn thành cùng chủ đề/ảnh/mốc không phát thưởng lặp vô hạn.
- [ ] Đồ cơ bản đủ tham gia chủ đề; quà mua không khóa hành trình học.
- [ ] Bộ cũ/ngoại trang đã mở trong save cũ được giữ, không bắt mua lại.
- [ ] Hình, lời đọc và nút trên điện thoại ngang dễ hiểu, không chạm nhầm mua.

## 18. Các câu đang trao đổi với chủ game

### Đã trả lời

**Giữ nguyên nhân vật đang chọn; cho thay quần áo, tóc, mũ, giày, túi và phụ kiện.** Đây là hướng đã chốt cho bản kế hoạch.

**Agent tự dùng skill tạo hình phù hợp; cho phép thêm bộ asset nhân vật mặc đồ mới; bắt đầu với vài bộ.** Bản 0.2 đề xuất ba bộ, ưu tiên hoàn thiện một bộ trước. Sáu nhóm ghép độc lập là mục tiêu dài hạn, không bắt làm đầy đủ ngay.

### Đã hỏi, đang chờ lựa chọn

1. **Điểm nhấn khiến bé quay lại:** phối chủ đề + lưu bộ + ảnh; khám phá nhiều tiệm + người bán; hay tự chọn màu/trang trí? Bản nháp tạm đề xuất nhánh phối–lưu–chụp, chưa coi đã được chọn.
2. **Cách tạo mục tiêu Sao:** có món rẻ/món cần tiết kiệm, sở hữu mãi; mở mẫu theo tiến trình học; hay sưu tầm ghép bộ có mốc quà? Có thể kết hợp một hướng chính và một hướng phụ sau khi chốt.

### Nên làm rõ ở vòng tiếp theo

3. Muốn ưu tiên Sao từ học, hay mọi nguồn hợp lệ hiện có, gồm bán cá, đều ngang nhau?
4. Chủ đề đồ yêu thích: đời thường dễ thương, làm vườn–câu cá–nấu ăn, cổ tích/phép thuật, hay kết hợp? Chọn vài chủ đề trước để tránh catalog rời rạc.
5. Bé có được tự đổi màu tóc/quần áo sau khi mua, hay mỗi món giữ một thiết kế rõ? Nếu có đổi màu, nên mở quyền đổi thay vì tính tiền mỗi lần thử.

---

**Trạng thái bản 0.2:** đã bổ sung agent chủ động dùng skill, hai hướng ghép món/sprite mặc sẵn, quy trình tự tạo–sửa–kiểm tra asset và quy mô khởi đầu ba bộ. Sáu nhóm đồ và catalog 24 món là hướng dài hạn. Các nhánh tương tác và nhịp dành dụm còn mở để trao đổi. Chỉ cập nhật `FASHION_MAP_PLAN.md`; chưa tạo ảnh/video, chưa gọi API media, không sửa tài liệu câu cá, mã nguồn, map, asset, giá, phần thưởng hoặc dữ liệu người chơi.
