# KỊCH BẢN PLAN — MAP HỒ CÂU RIÊNG & MAP CHỢ RIÊNG

> **Bản thiết kế để đọc và duyệt trước — chưa triển khai vào game.**
>
> Ngày cập nhật: 01/11/2026 · Phiên bản đề xuất: 2.0 · Đối tượng: trẻ 5–6 tuổi.
>
> Tài liệu này chỉ đề xuất kịch bản, luật chơi, hình ảnh và lộ trình. Các con số về thời gian, giá, xác suất và độ khó bên dưới là **thông số thiết kế để chơi thử**, không phải tính năng hay dữ liệu đã có trong game.

> **Phương án không gian đã chốt theo yêu cầu:** thiết kế **hai bản đồ mới độc lập**: **Hồ Câu Lá Sen** và **Chợ Cầu Vồng**. Mỗi map có nền, bố cục đi lại, điểm vào/ra, nhân vật phụ và hoạt động riêng. Tài liệu này thay thế phương án đặt điểm câu ở Hồ Sen của Map 1; không phải chỉ thêm hai cửa sổ giao diện.

## 1. Ý tưởng trong một phút

**Bé ghé Chợ Cầu Vồng để chuẩn bị đồ, đi sang Hồ Câu Lá Sen cùng bạn thú, thả phao, chờ cá cắn rồi giật — kéo — nghỉ đúng nhịp. Cá bắt được cất vào túi để mang về Chợ bán hoặc về Bếp nấu sau này.**

Niềm vui nằm ở ba khoảnh khắc:

1. **Hồi hộp:** “Phao vừa rung… cá đã ngậm mồi chưa nhỉ?”
2. **Khéo tay:** “Cá đang kéo! Chờ một chút… đúng điểm rồi, kéo nào!”
3. **Bất ngờ có ý nghĩa:** “Một bạn cá tròn vo, nặng 650 g! Mình bán lấy đồ câu mới hay giữ để nấu món ngon?”

Không biến câu cá thành việc bấm liên tục để nhận tiền. Bé phải đọc tín hiệu, chờ thời điểm và biết dừng tay. Khi hụt, cá quẫy đuôi bơi đi; nhân vật và thú phản ứng vui, không buồn bã trách bé.

**Vòng lặp:**

**Chợ: mua cần/mồi hoặc mượn bộ tập → Hồ Câu: chọn bến, trang bị, thả — giật — kéo/nghỉ → bắt được hoặc hụt → tại hồ: cân sơ bộ, cất hoặc thả cá → Chợ: bán cá và mua đồ mới / Bếp: dùng cá để nấu ở giai đoạn sau → chọn chuyến tiếp theo.**

Một lượt câu tiêu chuẩn dự kiến **35–60 giây**; lượt học câu đầu **60–90 giây**, chưa tính đi chợ. Một chuyến ngắn khoảng **3–5 phút** có thể gồm ghé chợ, câu 1–3 lượt rồi bán cá hoặc về nhà; cần chơi thử để chỉnh quãng đi. Bé có thể dừng sau bất kỳ lượt nào và không bắt buộc về Chợ sau mỗi con.

## 2. Bám phong cách game hiện tại

### 2.1. Những gì đã đối chiếu

| Cơ sở trong dự án | Ảnh hưởng tới thiết kế |
|---|---|
| `RULES.md`, `PLAN.md`: game giáo dục cho trẻ 5–6 tuổi, màn hình ngang, ưu tiên chạm và lời đọc | Hướng dẫn ngắn, thao tác lớn, không yêu cầu đọc để chơi |
| `TASK.md`: định hướng Candy Claymorphism 3D, đồ chơi kẹo ngọt | Cần, phao, quầy hàng, thẻ cá đều bo tròn, mềm, màu vui |
| `src/content/maps/mapsConfig.js`: Làng Quê Yên Bình, Nông Trại Thú Cưng và Bếp | Hai map mới kết nối với Nông Trại và Bếp; chưa tồn tại trong cấu hình hiện tại |
| `src/game/effects/LakeWaterEffect.js`: Hồ Sen ở Map 1 đã có hiệu ứng nước | Chỉ tham khảo cảm giác nước và ngôn ngữ hình ảnh; Hồ Câu là map mới, không lấy vị trí hồ cũ làm bến câu |
| `src/game/ui/KitchenModal.js`: đã có thanh viên bi canh nhịp | Dùng ngôn ngữ tương tác quen thuộc, nhưng câu cá thêm quan sát cá và nhịp nghỉ |
| `src/content/cooking/recipes.js`: hiện có 6 món, chưa có cá là nguyên liệu | Món cá và bước chuyển cá sang nguyên liệu là phần mở rộng tương lai |
| `src/game/systems/cookingSystem.js`: mua nguyên liệu dùng Sao | Cần tách rõ kinh tế câu cá và kinh tế học tập trước khi lập trình |

Một số tài liệu cũ gọi thú là Thỏ Bông, trong khi luồng bếp hiện tại cũng có thao tác cho cún ăn. Vì vậy kịch bản dùng **“bạn thú đang đồng hành”**, không tự đổi nhân vật hoặc thay thú của người chơi.

### 2.2. Cảm giác hình ảnh và âm thanh

- **Map Hồ Câu:** hồ xanh ngọc, lá sen đung đưa, nắng lấp lánh; một không gian mới yên bình, cùng phong cách thế giới hiện tại.
- **Map Chợ:** quảng trường nhỏ lát đá sáng, mái quầy như đồ chơi, giỏ rau tròn, biển hàng bằng hình; nhộn nhịp nhẹ và có người bán thân thiện.
- Nhân vật ngồi hoặc đứng vững trên bờ, hai tay ôm cần hơi to so với người, nhìn rất đáng yêu.
- Cần uốn như đồ chơi mềm; phao hình vịt hoặc quả dâu; dây câu hiện rõ trên mặt nước.
- Cá thân bầu, vây tròn, mắt hiền; không lộ móc sắc, không có cảnh đau hoặc làm thịt.
- Giật trúng: một tiếng “ting!”, cần nảy nhẹ, vòng nước bung ra. Cá thoát: “tõm!”, một cái quẫy đuôi tinh nghịch.
- Ưu tiên tiếng nước và lời nhắc; nhạc hạ nhỏ khi có tín hiệu cá cắn. Không dùng tiếng báo động dồn dập.
- Rung thiết bị chỉ là hiệu ứng tùy chọn khi thiết bị hỗ trợ; tín hiệu hình ảnh luôn đủ để chơi.

## 3. Hai map độc lập và hành trình giữa các không gian

### 3.1. Quyết định đã chốt và đề xuất mặc định

1. **Đã chốt: hai map mới riêng hoàn toàn.** Hồ Câu Lá Sen dành cho câu và khám phá cá; Chợ Cầu Vồng dành cho đi lại, gặp người bán, mua đồ và bán cá. Không đặt hoạt động này vào Hồ Sen ở Làng Quê Yên Bình.
2. **Phân vai rõ:** tại Hồ Câu chỉ trang bị đồ đã có, câu, cất hoặc thả cá. **Mua mồi, mua cần và bán cá đều diễn ra tại map Chợ**, sau khi nhân vật đi tới quầy tương ứng.
3. **Cá bắt được không bắt buộc bán.** Bé có thể đem nhiều con về Chợ một lần, giữ lại cho Bếp hoặc thả tại hồ. Không có nút bán từ xa trên màn kết quả ở hồ.
4. **Thao tác chính:** chạm một nút lớn theo thời điểm; lúc cá vùng thì dừng bấm. Không yêu cầu lia tay nhanh hoặc vừa giữ vừa kéo nhiều thanh.
5. **Kinh tế câu cá:** đề xuất **Vỏ Sò**, dùng mua đồ câu ở Chợ và nhận khi bán cá ở Chợ. Đây là lựa chọn còn cần duyệt, không phải tiền đã có.
6. **Cá là thực phẩm trong nhánh nấu ăn:** trình bày bằng chuyển cảnh và nguyên liệu trong bếp, không minh họa sơ chế. Nếu muốn cá hoàn toàn là bạn sinh vật, có phương án thay thế tại mục 18.
7. **Có hụt thật nhưng không phạt nặng:** hụt không mất Sao, không mất cần; mồi tập không giới hạn. Mồi mua chỉ tiêu khi đã xuất hiện một lần cá cắn thật.

### 3.2. Sơ đồ kết nối — không thay thế sáu vùng chiến dịch

```text
                         [MAP HỒ CÂU LÁ SEN]
                           ↕           ↕
                 [NÔNG TRẠI] ↔ [MAP CHỢ CẦU VỒNG]
                           ↕           ↕
                              [BẾP]
```

Sơ đồ chỉ mô tả lối đi dự kiến. Nông Trại vẫn là nơi trở về quen thuộc; Hồ Câu và Chợ đều là map hoạt động hòa bình, không tính thành Map 7/8 của chiến dịch học, không khóa cổng vùng học bằng nhiệm vụ bán cá.

- Đề xuất cả hai map mở từ khu sinh hoạt Nông Trại, không cần hoàn thành một map học mới để dùng.
- Hồ Câu và Chợ có lối đi trực tiếp hai chiều, giúp chuyến bán cá ngắn và dễ nhớ. Mỗi bên có biển hình cá/giỏ hàng và tên đích.
- Chợ có đường về Nông Trại và đường sang Bếp. Hồ Câu có đường về Nông Trại, ngoài đường sang Chợ.
- Các cửa là điểm nhân vật đi tới rồi chuyển cảnh, không phải hai nút mở hai popup trên cùng một bản đồ.
- Chuyển map giữ nguyên cá, mồi, cần, ví và bạn thú. Không tính phí đi lại, không tiêu năng lượng.
- Dấu chỉ đường chỉ hiện khi bé chọn đi tới đích; không thêm ruy băng nhiệm vụ thường trực trên tất cả map.

### 3.3. Map mới A — Hồ Câu Lá Sen

**Vai trò:** nơi thư giãn và thao tác câu cá; nghe nước, quan sát bóng cá, học chờ và kéo đúng lúc. Không có quầy mua bán ở map này.

**Bố cục đề xuất:**

```text
┌─────────────────────────────────────────────────────────┐
│  Góc Sổ Cá       HỒ XANH NGỌC — LÁ SEN — BÓNG CÁ          │
│                  Bến Sen          Bến Nắng               │
│                     │                 │                  │
│          Lối bờ hồ dễ đi, cầu gỗ ngắn, ghế nghỉ           │
│                                                         │
│  Chú Rái Cá / bến tập       Góc chuẩn bị cần và giỏ cá    │
│                                                         │
│ [Về Nông Trại]  ← Quảng đất đặt chân →  [Sang Chợ 🧺]    │
└─────────────────────────────────────────────────────────┘
```

Đây là sơ đồ kịch bản, chưa phải bố trí tọa độ hoặc bản đồ được dựng.

| Khu | Cảnh và tương tác | Vai trò trong bản đầu |
|---|---|---|
| Bến tập ở gần cửa | Chú Rái Cá chỉ phao, làm mẫu chờ–giật–nghỉ | Học lượt đầu, chọn hỗ trợ, mượn bộ tập nếu đi thẳng tới hồ |
| Bến Sen | Phao cạnh lá sen, nước dịu, dấu đứng lớn | Bến câu hoạt động đầu tiên, đủ vòng chơi |
| Bến Nắng | Ánh nắng và bóng cá khác, đường tới nhìn rõ | Mở sau khi thử nhịp; chỉ cho tương tác khi nội dung đã sẵn sàng |
| Góc chuẩn bị | Đặt giỏ, chọn cần/mồi đã sở hữu, xem còn bao nhiêu ô cá | Không bán đồ, không trừ ví, không bắt mua mới |
| Góc Sổ Cá | Bảng gỗ hình quyển sổ; chạm để nhân vật tới xem | Gặp lại hình cá, kỷ lục, gợi ý mồi |
| Lối sang Chợ | Biển giỏ hàng và lối đi an toàn | Đem cá sang bán, mua mồi; chuyển sang map Chợ thật |
| Lối về Nông Trại | Biển nhà và hình thú | Dừng chuyến, tiếp tục sinh hoạt khác |

**Kịch bản khi bước vào:** nhân vật đi vào khoảng đất khô, bạn thú theo sau; mặt nước mở ra trước mắt. Chú Rái Cá vẫy tay: “Bến Sen đang yên lắm. Mình cùng nhìn phao nhé!” Lần sau chỉ chào ngắn, không phát lại toàn bộ bài học.

**Cách chọn bến:** chạm biển bến → nhân vật đi đến dấu chân trên bờ → chọn “Câu ở đây”. Không thả dây từ mọi vị trí trên map; không đi xuống nước.

**Bến khác nhau sau này:** khác cảnh, tín hiệu và trọng số loài; dùng cùng thao tác cơ bản. Bản đầu chỉ có một bến hoạt động. Khi thêm Bến Nắng phải công bố bảng cá riêng; không dùng bến phụ để khóa cá sau một cần đắt hoặc làm mồi bị mất tác dụng.

**Tình huống túi đầy:** Chú Rái Cá chỉ biển Chợ: “Giỏ cá đầy rồi. Bé có thể mang sang Chợ hoặc thả một bạn về hồ.” Bé chọn **“Đi Chợ”** hoặc **“Xem giỏ cá”**; không tự bán, không tự đưa ra khỏi map.

### 3.4. Map mới B — Chợ Cầu Vồng

**Vai trò:** một khu chợ để nhân vật đi lại, chọn quầy, trò chuyện và mua bán. Chợ có nền riêng và các quầy nằm trong không gian; cửa sổ giao dịch chỉ mở sau khi đã tới quầy.

**Không khí:** mái che kem–cam–xanh, giỏ hàng mũm mĩm, cờ vải đung đưa, tiếng bước chân và tiếng chào nhẹ. Không có tiếng rao chồng nhau hoặc đám đông che nhân vật.

```text
┌─────────────────────────────────────────────────────────┐
│  [Quầy Cần & Mồi]              [Sạp Cá — Cân & Bán]      │
│      Cô Vịt                         Cô Mèo               │
│                                                         │
│          QUẢNG TRƯỜNG CHỢ — CHỖ ĐI LẠI RỘNG             │
│                                                         │
│  [Bảng nhờ giúp]               [Góc Rau Củ trang trí]     │
│                                                         │
│ [Về Nông Trại]     [Sang Hồ Câu 🎣]     [Về Bếp 🍲]      │
└─────────────────────────────────────────────────────────┘
```

Tên Cô Vịt, Cô Mèo và Chú Rái Cá là nhân vật phụ đề xuất cho kịch bản; chưa có nhân vật hoặc asset mới nào được tạo.

| Điểm trong Chợ | Tương tác và lời dẫn | Phạm vi |
|---|---|---|
| Quầy Cần & Mồi của Cô Vịt | “Bé chọn chiếc cần vừa tay nhé!”; xem cần, xem gói mồi, mua hoặc mượn bộ tập | Hoạt động cốt lõi; mọi mua cần/mồi đặt tại đây |
| Sạp Cá của Cô Mèo | “Cho cô xem chuyến câu của bé nào!”; đặt cá lên cân, xem giá, chọn bán | Hoạt động cốt lõi; mọi bán cá đặt tại đây |
| Quảng trường và chỗ ngồi | Thú ngửi giỏ rau, người bán chào khi tới gần; cho bé quan sát | Tạo cảm giác một khu chợ, không phải danh sách cửa hàng |
| Bảng nhờ giúp | Gợi ý một việc không hạn giờ, ví dụ mang cá cho bếp làng | Giai đoạn sau; chưa triển khai thì chỉ là biển trang trí, không nhận nhiệm vụ giả |
| Góc Rau Củ | Giỏ rau và người bán làm nền; chạm có thể nghe một câu chào | Bản đầu không mở mua nguyên liệu; muốn bán rau thực sự cần duyệt kinh tế riêng |
| Ba lối ra | Đi Hồ Câu / Nông Trại / Bếp, biển bằng hình lớn | Định hướng hành trình, không thu phí hoặc khóa theo mua hàng |

**Nguyên tắc tới quầy:** chỉ mở một giao dịch tại một thời điểm; không tự bật quầy khi vừa đi ngang. Bé chạm quầy từ xa thì nhân vật đi tới trước, sau đó mới mở.

**Kịch bản bán cá:** chọn Sạp Cá → Cô Mèo mời đặt một con lên cân → thẻ hiện cùng cân nặng đã ghi ở hồ và giá tương ứng → bé chọn Bán hoặc Giữ → nếu bán, Cô Mèo đặt Vỏ Sò lên khay → bé thấy ví tăng → trở lại túi cá hoặc đóng quầy. Không cân lại để ngẫu nhiên đổi trọng lượng/giá, không mặc cả có thể thua tiền.

**Kịch bản mua đồ:** chọn Quầy Cần & Mồi → xem ba nhóm ảnh Cần / Mồi / Đồ đã có → chạm món để xem công dụng và giá → xác nhận mua → món bay vào túi; ví cập nhật. Chưa đủ Vỏ Sò vẫn có “Dùng bộ tập” và biển chỉ Hồ Câu.

**Không ép chuyến đi:** quầy không tự hết hàng, cá không rớt giá do để lâu, không có giờ chợ đóng cửa. Bé có thể vào Chợ chỉ để xem, giữ toàn bộ cá và về nhà.

### 3.5. Vì sao đề xuất Vỏ Sò riêng?

Sao hiện là phần thưởng cho hành trình học và được dùng mua đồ trong bếp. Nếu cá bán thẳng ra Sao vô hạn, bé có thể bỏ hoạt động học để kiếm Sao bằng câu cá. Vỏ Sò giúp vòng lặp mua mồi — bắt cá — bán cá — mua đồ câu tự vận hành mà chưa đổi giá trị của Sao.

Để tránh rối, biểu tượng Vỏ Sò **chỉ xuất hiện trong quầy đồ câu và màn bán cá tại map Chợ**, không thêm một ví tiền thường trực lên HUD chính. Không đổi Vỏ Sò sang Sao hoặc ngược lại trong phạm vi đầu. Góc Rau Củ chưa bán hàng nên không tự phát sinh tiền tệ hoặc thay quầy nguyên liệu trong Bếp.

Nếu chủ game muốn duy nhất một tiền tệ, cần duyệt lại giá mua/bán và nguồn Sao trước khi triển khai; không âm thầm áp dụng cả hai phương án.

## 4. Kịch bản chuyến đầu: Chợ → Hồ Câu → Chợ hoặc Bếp

### Cảnh 1 — Đi Chợ chuẩn bị chuyến câu

**Hình:** Tại Nông Trại, bé chọn biển Chợ có giỏ hàng. Nhân vật đi tới cửa và chuyển sang nền Chợ Cầu Vồng; ba biển Cần & Mồi / Sạp Cá / Hồ Câu dễ nhìn.

**Lời đọc:** “Mình ghé quầy cần câu trước nhé!”

**Tương tác:** Bé chạm quầy Cô Vịt → nhân vật bước đến → hiện lời chào và ảnh bộ tập. Những quầy khác vẫn là cảnh Chợ ở phía sau, không biến thành menu toàn bộ cửa hàng.

### Cảnh 2 — Mượn chiếc cần đầu tiên tại Chợ

**Hình:** Quầy có Cần Lá Sen, lọ mồi và Sổ Cá. Một thẻ duy nhất được làm nổi bật.

**Lời đọc:** “Đây là cần tập và mồi lá. Bé có thể tập bao nhiêu lần cũng được!”

**Tương tác:** Chạm mượn bộ tập. Không cần Sao hoặc Vỏ Sò; các món mua chỉ là lựa chọn xem sau. Cô Vịt chỉ biển hình phao: “Đi theo biển này là tới Hồ Câu.” Bé đi tới cửa Hồ Câu để chuyển map.

Nếu bé đi thẳng từ Nông Trại sang Hồ Câu, Chú Rái Cá cũng cho mượn đúng bộ tập này để không phải quay lại Chợ mới chơi được. Hai nơi cùng nhận biết bộ tập đã mượn; chỉ cấp một lần, không phải hai bộ có thể bán.

### Cảnh 3 — Hồ Câu mở ra trước mắt

**Hình:** Nền và âm thanh chuyển rõ từ Chợ sang Hồ Câu Lá Sen. Nước xanh, bến gỗ, sen và bóng cá hiện ra; Chú Rái Cá đứng cạnh biển bến tập.

**Lời đọc:** “Dưới lá sen có bạn cá kìa! Mình thử câu một chút nhé?”

**Tương tác:** Chạm Bến Sen → nhân vật đi đến dấu chân trên bờ → chọn “Câu ở đây”. Bạn thú ngồi bên cạnh. Từ đây mới mở giao diện thao tác câu; không mua bán tại hồ.

### Cảnh 4 — Gắn mồi

**Hình:** Một hạt mồi mềm nằm cạnh đầu dây câu phóng lớn; không lộ lưỡi móc.

**Lời đọc:** “Chạm hạt mồi để gắn vào nhé.”

**Tương tác:** Chạm mồi → mồi bay vào dây → nút **“Thả câu”** sáng. Kéo thả là tùy chọn, chạm vẫn hoàn thành được.

### Cảnh 5 — Thả vào vòng nước

**Hình:** Một vòng tròn mềm trên nước; chấm phao chạy qua một thanh ngắn phía dưới. Vùng thả tốt được đánh dấu bằng hình lá sen.

**Lời đọc:** “Đợi phao vào chiếc lá… rồi chạm!”

**Tương tác:** Lượt đầu chuyển động rất chậm. Thả đúng: “Tõm! Đúng chỗ rồi!”. Thả lệch: phao vẫn rơi xuống nước, sóng nhẹ đẩy nó vào vùng câu và lời đọc “Mình thử chỗ này nhé!”. Không bắt bé thả lại.

### Cảnh 6 — Cá rỉa thử

**Hình:** Phao nghiêng một lần, một bong bóng nhỏ nổi lên. Nút giật vẫn có biểu tượng bàn tay chờ.

**Lời đọc:** “Phao mới nhúc nhích thôi. Mình chờ thêm một chút…”

**Tương tác:** Nếu bé bấm sớm ở lượt học, màn chậm lại, cho xem lại tín hiệu; không mất mồi. Không tính đây là một lần thất bại của bé.

### Cảnh 7 — Cá cắn thật!

**Hình:** Phao chìm rõ xuống, vòng nước lớn xuất hiện, cần rung hai nhịp. Nút đổi thành **“GIẬT CẦN!”** với hình mũi tên đi lên.

**Lời đọc:** “Phao chìm rồi! Giật cần nào!”

**Tương tác:** Chạm trong cửa sổ đủ rộng → nhân vật nhấc cần, cá vọt lên thoáng qua rồi lặn xuống. Nếu chưa bấm, lượt học phát lại bước này.

### Cảnh 8 — Kéo và nhường cá

**Hình:** Thanh canh điểm hiện ra. Một hình phao đi qua vùng lá sen; ba dấu chân cá dẫn từ xa về sát bờ.

**Lời đọc:** “Cá nghỉ rồi, đợi đúng lá và kéo nhé!”

**Tương tác:** Chạm đúng → cá tiến một chặng. Sau đó cá quẫy, dây hơi căng.

**Lời đọc:** “Bạn cá đang quẫy. Nghỉ tay một chút!”

**Tương tác:** Bé không bấm → dây dịu lại. Cá nghỉ tiếp → bé canh đúng điểm lần nữa. Lượt tập có hai nhịp kéo đúng, có bóng bàn tay và cho thử lại từng nhịp.

### Cảnh 9 — Cân cá tại hồ, cất hoặc thả

**Hình:** Cá nằm trong giỏ nước, nhảy vui một lần. Cân hiện **“250 g”**, Sổ Cá thêm dấu đầu tiên. Bạn thú vỗ chân.

**Lời đọc:** “Một bạn Cá Mây Tròn! Nặng hai trăm năm mươi gam. Bé khéo tay quá!”

**Lựa chọn:** **“Cất vào giỏ”**, **“Giữ để nấu”** khi nhánh nấu đã sẵn sàng, hoặc **“Thả về hồ”**. Chưa có nấu cá thì chỉ ghi “Cất cá”. Lời đọc giải thích lần lượt khi chạm nghe; thao tác xác nhận tách khỏi thao tác nghe.

**Lời dẫn:** “Bé có thể câu thêm, mang cá sang Chợ hoặc về nhà.” Màn kết quả cho **“Câu tiếp”** và **“Về bờ”**. Chọn về bờ trả nhân vật ra map Hồ Câu; biển Chợ ở lối ra được nhắc một lần sau lần đầu cất cá, không tự đưa bé sang map khác.

### Cảnh 10 — Mang cá sang map Chợ để bán

**Hình:** Bé đi tới cửa Chợ ở Hồ Câu → chuyển về quảng trường Chợ → tới Sạp Cá của Cô Mèo. Cô đặt con cá 250 g lên cân đồ chơi.

**Lời đọc:** “Bạn cá nặng hai trăm năm mươi gam. Bé bán được một Vỏ Sò. Bé muốn bán hay giữ?”

**Tương tác:** Chọn đúng con cá → xem giá 1 Vỏ Sò → xác nhận Bán hoặc Giữ. Bán xong con cá rời túi, ví thêm đúng một; dấu khám phá vẫn trong Sổ Cá. Lần đầu bán chỉ giới thiệu lại quầy cần/mồi, không ép mua ngay khi chưa đủ tiền mua gói.

### Cảnh 11 — Chuyến đi có một kết thúc

**Hình:** Bé đứng trong Chợ, nhìn ba biển: Hồ Câu / Nông Trại / Bếp.

**Lời đọc:** “Mình câu tiếp, về nghỉ hay mang cá vào bếp nhỉ?”

**Tương tác:** Nếu còn cá, bé có thể giữ lại và đi Bếp; nếu chưa có nhánh nấu cá, biển Bếp chỉ đưa về Bếp hiện tại, không hứa có món cá. Không có cá vẫn về Bếp hoặc Nông Trại được. Câu tiếp thì quay qua cửa Hồ Câu, không bị buộc mua đồ.

## 5. Luật chi tiết của một lượt câu

### 5.1. Chuẩn bị và mua đồ

- **Tại Chợ:** mua cần/mồi ở Quầy Cần & Mồi. **Tại Hồ Câu:** chỉ chọn cần/mồi đã có ở góc chuẩn bị hoặc trước khi vào bến; không mở quầy mua từ xa.
- Chọn cần đang sở hữu hoặc cần tập; mỗi lần chỉ trang bị một cần.
- Chọn một loại mồi; hiển thị ảnh và số lượng còn lại, không cho dùng khi số lượng bằng 0.
- Mua theo gói nhỏ, hiện tổng giá và số nhận trước khi xác nhận. Không mua một chạm bằng nút nằm sát nút câu.
- Đủ Vỏ Sò mới mua được; thiếu thì gợi ý dùng mồi tập để tiếp tục. Không vay, không tiền thật. Tới hồ mà hết mồi mua vẫn đổi sang mồi tập được ngay, không phải chạy về Chợ.
- Mặc định nhớ cần và mồi vừa dùng. Bé câu liên tục vài lượt bằng đồ đang có, chỉ trở lại Chợ khi chủ động muốn mua/bán hoặc túi cần sắp xếp.

### 5.2. Thả câu — canh chỗ, không gây kẹt

- Thanh thả có con trỏ chạy qua vùng lá sen rộng khoảng **40% thanh** ở mức làm quen.
- Chạm **“Thả câu”** đúng vùng: phao tới vòng nước, thời gian chờ cá giảm 1 giây.
- Chạm lệch: vẫn câu bình thường, không trừ đồ hoặc giảm khả năng bắt được.
- Thả đẹp không làm cá tự tăng cân hay tự biến thành cá đặc biệt.
- Mồi mới được **giữ chỗ**, chưa tiêu ở bước này. Trước cá cắn thật, đóng lượt câu trả mồi về túi.

### 5.3. Chờ cá — có nhịp kể chuyện

- Cá cắn trong **3–6 giây** sau thả; thả đẹp còn **2–5 giây**.
- Mỗi lượt có 0–2 lần rỉa thử. Lượt học có đúng một lần, hiển thị khác hẳn cá cắn thật.
- Rỉa thử: phao nghiêng nhẹ, cần chưa cong, một vòng nước nhỏ. Cắn thật: phao chìm, cần cong và vòng nước rõ.
- Giật lúc rỉa thử ở lượt thường: cá bơi ra xa một chút, chờ thêm tối đa 2 giây; không mất mồi. Mỗi lượt chỉ cộng thêm thời gian này một lần để tránh kéo dài vô tận.
- Luôn có tín hiệu hình ảnh; tắt tiếng vẫn phân biệt được hai trạng thái.
- Không kéo dài chờ đợi chỉ để tạo độ hiếm, không yêu cầu ngồi chờ theo giờ thực.

### 5.4. Giật cần — khoảnh khắc đầu tiên có thể hụt

- Khi cắn thật, mở cửa sổ giật **2,2 giây** ở mức làm quen, **1,8 giây** ở mức khéo tay.
- Chỉ một lần chạm hợp lệ là đủ; không vuốt mạnh điện thoại.
- Bấm đúng → vào giằng co. Không bấm kịp → cá thoát, kết lượt thường.
- Đây là thời điểm tiêu **một mồi mua**, kể cả sau đó hụt. Mồi tập luôn dùng được và không có số lượng.
- Chạm đang giữ từ trước khi cá cắn không tự được tính; cần một lần nhấn mới.

### 5.5. Giằng co — canh điểm và biết dừng

**Lựa chọn thiết kế cốt lõi: một nút thao tác, hai tình huống rõ ràng.**

| Tình huống | Tín hiệu | Bé làm gì? | Kết quả |
|---|---|---|---|
| Cá tạm nghỉ | Cá bơi chậm, dây mềm; vùng lá sen và con trỏ hiện rõ | Chờ con trỏ vào vùng rồi chạm **KÉO!** | Cá tiến gần bờ một chặng |
| Cá vùng vẫy | Cá quẫy, cần cong; hiện bàn tay mở và chữ **NGHỈ TAY** | Dừng bấm khoảng 1–1,5 giây | Dây dịu lại, mở nhịp kéo tiếp |

**Cấu trúc nhịp kéo:**

- Cá nhỏ cần **2** lần kéo đúng; cá vừa **3**; cá lớn **4**.
- Mỗi pha cá nghỉ cho con trỏ chạy tối đa một vòng đi–về. Chỉ đánh giá **lần bấm đầu tiên trong pha**; sau bấm, chốt kết quả rồi chuyển cảnh ngắn.
- Chạm trong vùng lá sen → đúng; chạm vùng viền mềm sát lá → “Gần được rồi”, không tiến nhưng không mất một cơ hội; chạm xa vùng → một lỗi.
- Không bấm hết một vòng đi–về → một lỗi rồi cho pha mới. Không để đồng hồ chạy vô tận ở lượt thường.
- Sau mỗi lần kéo đúng, cá vùng **một pha nghỉ tay** rồi mới mở pha kéo tiếp. Không đưa hai hành động đối nghịch ra cùng lúc.
- Trong pha nghỉ tay, bấm nhầm làm dây căng và tính **tối đa một lỗi cho cả pha**. Nhả tay là dây trở lại bình thường ở pha kế tiếp; không gãy cần.
- **Lỗi thứ ba** trong giằng co → cá thoát ở lượt thường. Hai lỗi trước chỉ có lời gợi ý, không trừ các chặng đã kéo được.
- Tổng thời gian giằng co tối đa **30 giây**, không tính tạm dừng. Hết thời gian: kết lượt nhẹ nhàng; chế độ hỗ trợ có lựa chọn giúp hoàn thành thay vì cho cá thoát.

**Cách biểu diễn:** Dùng đường về bờ với 2–4 dấu chân cá. Tránh đồng thời hiển thị thanh sức cá, thanh sức bé, thanh căng dây và thanh thời gian. Bé chỉ cần nhìn **một thanh canh điểm và một đường tiến độ**.

### 5.6. Vì sao bấm liên tục không thắng?

- Mỗi pha chỉ nhận lần bấm đầu tiên; bấm sớm chốt một kết quả sai, không thể tiếp tục dò điểm đúng trong cùng pha.
- Khi cá quẫy, bấm không làm cá tới gần bờ.
- Giữ nút hoặc giữ phím Cách không tạo chuỗi lần kéo; bỏ qua tín hiệu tự lặp của bàn phím và chạm đồng thời thứ hai.
- Cửa sổ phản hồi khoảng **350 ms** ngăn một lần chạm bị tính thành cả “giật” lẫn “kéo”.
- Cá khác tính nết nên bé phải quan sát, nhưng không có luật ngầm khiến thao tác đúng vẫn thất bại.

## 6. Hụt, thành công và chế độ hỗ trợ

### 6.1. Hụt có ba nguyên nhân dễ hiểu

| Nguyên nhân | Phản hồi | Lần sau bé hiểu gì? |
|---|---|---|
| Phao chìm mà chưa giật kịp | Cá ló đầu, “tõm!” rồi bơi đi | Nhìn phao chìm rõ và nút giật sáng |
| Kéo sai điểm đủ ba lỗi | Cá xoay một vòng rồi thoát khỏi vòng nước | Đợi con trỏ vào lá sen |
| Kéo khi cá quẫy khiến đủ ba lỗi, hoặc hết thời gian | Cần dịu lại, cá vẫy đuôi | Có lúc phải nghỉ tay |

Lời đọc: “Bạn cá bơi mất rồi. Mình thử lại nhé!” Không dùng “Con kém quá”, “Thua rồi”, tiếng còi phạt hoặc màn hình đỏ.

Kết quả hụt không trừ tim, năng lượng, Sao, độ bền cần hay tiến độ học. Mồi mua đã tiêu khi cắn thật không được hoàn chỉ vì hụt; góc chuẩn bị ở Hồ Câu luôn có mồi tập nếu bé hết mồi. Mua thêm mồi là lựa chọn ở Chợ, không phải điều kiện để câu tiếp.

### 6.2. Hỗ trợ để không bị mắc kẹt

- Lượt hướng dẫn đầu không kết thúc bằng hụt: phát lại từng bước cho tới khi bé hoàn thành hoặc chủ động thoát.
- Hai lượt thường hụt liên tiếp → đề nghị **“Cùng câu chậm hơn nhé?”**.
- Chế độ hỗ trợ: con trỏ chậm 25%, vùng đúng rộng thêm 10 điểm phần trăm, cửa sổ giật 3 giây; dùng cùng phần thưởng và loại cá.
- Nếu vẫn hụt, hiện lựa chọn **“Cùng kéo”** ở lượt sau: dừng con trỏ trong vùng đúng, chờ bé chạm, tự xử lý pha nghỉ tay. Không tự bấm thay bé khi chưa chọn.
- Có thể bật hỗ trợ ngay trong tùy chọn; không cần phải thất bại trước.
- Không tự tăng độ khó theo số lần bé thắng. Mức khó hơn là lựa chọn có tên rõ, bé được quay lại mức dễ.

### 6.3. Thành công và cân cá

- Kéo đủ chặng → cá bật khỏi mặt nước theo vòng cung ngắn → vào giỏ có nước → hiện cân.
- Màn cân cho thấy tên cá, khối lượng, dấu “Lần đầu gặp” hoặc “Kỷ lục của bé” nếu đúng.
- Khối lượng lưu bằng **số gam nguyên**. Thẻ chính ghi ví dụ **650 g**; bảng chi tiết có thể ghi **1 kg 200 g**. Không yêu cầu bé tính số thập phân.
- Kỷ lục là của cá nhân, không bảng xếp hạng, không so với trẻ khác.
- Cá và khối lượng được chốt khi cắn thật; bấm đẹp chỉ làm quá trình gọn và vui hơn, không âm thầm sửa cân nặng sau khi bắt.

## 7. Cần câu và mồi

### 7.1. Cần câu — mua để có cảm giác mới, không bán quyền thắng

| Cần | Giá đề xuất | Đặc điểm chơi | Hình ảnh |
|---|---:|---|---|
| Cần Lá Sen | Mượn miễn phí, dùng mãi | Đủ khả năng bắt mọi cá trong Hồ Câu Lá Sen | Cành mềm, dây sáng, phao lá |
| Cần Vịt Con | 12 Vỏ Sò | Vùng kéo đúng rộng thêm 5 điểm phần trăm | Vàng kem, phao vịt kêu nhỏ |
| Cần Cầu Vồng | 30 Vỏ Sò | Cùng mức hỗ trợ của Cần Vịt; thêm sóng và hoạt ảnh riêng | Cán cầu vồng, sao nước mềm |

Hai cần mua là hai lựa chọn sở thích; Cần Cầu Vồng không cộng dồn thành cần mạnh hơn. Không độ bền, không sửa cần, không gãy/mất đồ. Không khóa cá cơ bản sau cần đắt.

**Địa điểm:** hai cần mua trưng bày và bán tại map Chợ; Hồ Câu chỉ cho trang bị. Bộ tập mượn tại Chợ hoặc nhận từ người hướng dẫn ở hồ nếu đi thẳng tới đó; không bán lại bộ tập để lấy tiền.

### 7.2. Mồi — giúp bé chủ động chọn nhóm cá

| Mồi | Giá đề xuất | Đặc tính | Vai trò |
|---|---:|---|---|
| Mồi Lá Tập | Miễn phí, không giới hạn | Gặp 3 loài dễ làm quen | Luôn có đường chơi khi hết tiền |
| Mồi Hạt Giòn | 2 Vỏ Sò / 5 viên | Gặp 4 loài, gồm cá nhanh nhẹn | Rẻ, mở thêm tính nết |
| Mồi Bánh Thơm | 4 Vỏ Sò / 5 viên | Gặp 4 loài, gồm cá lớn | Mở trải nghiệm khác, không bắt buộc |

Mồi là hạt/bánh hoạt hình, không dùng giun sống để hợp cảm giác dễ thương. Mỗi lượt dùng một viên; không có yêu cầu nạp nhiều viên mới tăng cơ hội.

**Giới hạn:** mồi mua xếp chồng tối đa 99 viên mỗi loại. Quầy ở Chợ chỉ bán khi nhận đủ cả gói; gần đầy thì hiển thị lý do và số chỗ còn thiếu, không thu tiền rồi bỏ phần thừa. Góc chuẩn bị ở hồ không bán hoặc tự mua bù.

### 7.3. Không để vòng lặp mua bán thành bẫy

- Bán con nhỏ nhất được 1 Vỏ Sò. Một gói 5 Mồi Hạt giá 2 Vỏ Sò, nên một vài lần bắt được đã có thể mua lại mồi.
- Cá bắt bằng mồi tập có thể mang về Chợ bán lấy Vỏ Sò, nên không thể kẹt vì hết mồi hoặc hết ví.
- Không đặt quota bán cá theo ngày, không thưởng đăng nhập liên tiếp, không tự hết hạn đồ đã mua.
- Giá 12/30 cần chơi thử để tránh phải lặp quá nhiều. Mục tiêu ban đầu là thấy lựa chọn cần đầu sau khoảng **10–15 phút chơi thực tế có bán cá**, không phải lời hứa đã cân bằng.
- Vỏ Sò không mua nguyên liệu bếp hoặc tăng sức chiến đấu ở bản đầu; phần thưởng tiến trình câu cá là lựa chọn đồ và cảm giác mới.

## 8. Cá có cân nặng, có tính nết, có điều để khám phá

Tên cá dưới đây là **loài hư cấu để lên ý tưởng mỹ thuật**, không phải học liệu phân loại cá thật.

| Cá đề xuất | Khối lượng | Tính nết | Giằng co | Điểm đáng nhớ |
|---|---:|---|---:|---|
| Cá Mây Tròn | 100–300 g | Chậm rãi | 2 chặng | Má hồng, bơi lắc lư |
| Cá Lá Sen | 250–600 g | Nghỉ rõ giữa hai lần kéo | 3 chặng | Vây như chiếc lá |
| Cá Cam Lém Lỉnh | 300–700 g | Hay rỉa mồi trước | 3 chặng | Thổi bong bóng trước khi cắn |
| Cá Chuông Bạc | 400–900 g | Quẫy ngắn, dấu hiệu rõ | 3 chặng | Vây reo tiếng “leng keng” mềm |
| Cá Đốm Nắng | 700–1.400 g | Bơi chậm, pha nghỉ dài hơn | 4 chặng | Đốm tròn như nắng trên nước |
| Cá Cầu Vồng | 1.000–2.000 g | Pha kéo và nghỉ xen kẽ đều | 4 chặng | Vây đổi màu nhẹ dưới nắng |

Khối lượng chọn theo bước 50 g trong khoảng của loài để thẻ cân gọn, không hiện số lẻ khó nhìn. Cá nặng hơn không đồng nghĩa con trỏ chạy nhanh hơn; độ dài cuộc kéo và tính nết tạo khác biệt chính.

### Bảng gặp cá ban đầu để chơi thử

| Mồi | Mây Tròn | Lá Sen | Cam Lém Lỉnh | Chuông Bạc | Đốm Nắng | Cầu Vồng | Tổng |
|---|---:|---:|---:|---:|---:|---:|---:|
| Mồi Lá Tập | 50% | 35% | 15% | 0% | 0% | 0% | 100% |
| Mồi Hạt Giòn | 35% | 25% | 20% | 20% | 0% | 0% | 100% |
| Mồi Bánh Thơm | 0% | 35% | 0% | 25% | 25% | 15% | 100% |

Ngẫu nhiên quyết định loài và cân nặng, **không quyết định thành công sau thao tác đúng**. Cùng một mồi, bé biết trước nhóm loài có thể gặp qua hình trên gói.

**Chống lặp quá nhiều:** nếu ba lượt liên tiếp đã chốt cùng một loài, lượt kế tiếp chọn trong các loài khác mà mồi đó cho phép. Luật này tính cả cá đã cắn rồi thoát và được lưu cùng lượt câu, để tải lại không dùng để đổi loài. Vì có quy tắc chống lặp, tỷ lệ trong bảng là trọng số cơ sở, không phải tỷ lệ thực tế được bảo đảm.

Lượt học dùng cố định Cá Mây Tròn 250 g để kể chuyện nhất quán; sau lượt học mới dùng bảng gặp cá.

## 9. Giữ cá tại Hồ Câu, bán cá tại Chợ và sức chứa túi

### 9.1. Giá bán dễ hiểu

Giá chỉ phụ thuộc bậc khối lượng, không nhân thêm điểm kỹ năng hoặc độ hiếm. Thẻ cá hiển thị giá sẵn, bé không cần tính.

| Khối lượng | Giá bán |
|---|---:|
| Dưới 300 g | 1 Vỏ Sò |
| Từ 300 g đến dưới 600 g | 2 Vỏ Sò |
| Từ 600 g đến dưới 1.000 g | 3 Vỏ Sò |
| Từ 1.000 g đến dưới 1.500 g | 4 Vỏ Sò |
| Từ 1.500 g trở lên | 5 Vỏ Sò |

Ví dụ: cá 250 g = 1; 300 g = 2; 650 g = 3; 1.200 g = 4; 1.500 g = 5 Vỏ Sò. Đây là tiền và tỷ lệ của trò chơi, không là giá hoặc quy đổi cá ngoài đời.

### 9.2. Xử lý cá đúng địa điểm

- **Tại Hồ Câu — Cất vào giỏ:** cá vào ngăn **Cá mới câu** trong túi, còn nguyên tên và cân nặng; có thể đánh dấu giữ để nấu khi nội dung tương ứng đã sẵn sàng. Không tự bán, không tự biến thành món ăn.
- **Tại Hồ Câu — Thả về hồ:** cho xem cá bơi đi, giữ dấu khám phá và kỷ lục trong Sổ Cá. Không hoàn mồi, không nhận tiền, không nhận quà lặp để kiếm tài nguyên. Cá đã cất muốn thả thì phải trở lại góc giỏ cá ở hồ; không thả giữa quảng trường Chợ hoặc trong Bếp.
- **Tại Chợ — Bán:** đi tới Sạp Cá → chọn con trong túi → xem thẻ cân và số Vỏ Sò sẽ nhận → chạm xác nhận → cá rời giỏ, ví tăng đúng một lần. Cá được đưa cho quầy bếp của làng bằng chuyển cảnh nhẹ. Không có giao dịch bán ở màn bắt cá hoặc từ nút túi mở tại map khác.

Không có nút hủy cá một chạm. Màn xác nhận bán/thả ưu tiên ảnh lớn và lời đọc, không dùng hộp thoại chữ nhỏ.

Giữ cá là quyết định thật: bé có thể đóng quầy, quay về hồ hoặc đi thẳng tới Bếp mà không bán. Không có điều kiện “phải bán một con mới mở cửa ra Chợ”.

### 9.3. Túi cá riêng

- Đề xuất **6 ô cá**, mỗi con một ô vì cân nặng khác nhau; tách khỏi 6 ô món ăn hiện có và kho nguyên liệu.
- Có thể bán từng con tại Sạp Cá ở Chợ, kể cả cá đã cất. Nút “Giữ để nấu” là dấu yêu thích giúp tránh bán nhầm; bán cá đã đánh dấu cần gỡ dấu trước.
- Trước khi thả câu, giữ chỗ một ô cho kết quả. Túi cá đầy → cho chọn sang Chợ để bán, xem giỏ để thả tại hồ hoặc mang về Bếp khi nhánh nấu đã có; không bắt xong mới báo mất cá.
- Chưa chọn cất hay thả thì cá đã nằm an toàn trong ô giữ chỗ. Cất chốt giữ cá; thả trả ô. Bán chỉ xử lý sau khi đã sang Chợ và không còn phụ thuộc màn kết quả câu.
- Nếu đóng màn kết quả, con cá đã được lưu ở ô giữ chỗ; lần mở sau thấy lại. Không cần bấm “Nhận” mới sở hữu cá.
- Không có cá hỏng, chết trong túi hoặc mất vì bé nghỉ chơi.

## 10. Nối với cơ chế nấu ăn sau này

### 10.1. Nguyên tắc nối hệ thống

Túi cá lưu **từng con có cân nặng**, còn bếp hiện đếm **phần nguyên liệu**. Phải có bước chuyển rõ, không cho bếp vừa trừ cá vừa trừ phần cá lần nữa.

Đề xuất ở bản nấu ăn: tại tủ lạnh, bé chọn một con → xem **“Dùng cá này để chuẩn bị nguyên liệu?”** → xác nhận → chuyển cảnh có khăn bếp và đĩa sạch → thêm nguyên liệu **“phần cá”**.

| Cỡ cá | Số phần cá trong game |
|---|---:|
| Dưới 600 g | 1 phần |
| Từ 600 g đến dưới 1.200 g | 2 phần |
| Từ 1.200 g trở lên | 3 phần |

Đây là **quy ước trò chơi**, không phải hướng dẫn định lượng thực phẩm thật. Sổ Cá vẫn giữ tên, hình và kỷ lục sau khi cá được bán, thả hoặc dùng trong bếp.

### 10.2. Hai món đầu tiên được đề xuất

| Món mới | Nguyên liệu đề xuất | Học qua thao tác | Hiệu ứng đề xuất |
|---|---|---|---|
| Cháo cá bí đỏ | 1 phần cá + 1 gạo + 1 bí đỏ + 1 nước | Chọn đúng nguyên liệu, đếm đến 1, lửa nhỏ, canh nhịp chậm | Hồi 2 tim + 1 năng lượng |
| Cơm cá rau củ | 1 phần cá + 1 cơm + 1 cà rốt + 1 rau sạch | Phân nhóm, thứ tự cho vào nồi, canh nhịp | Hồi 2 tim + 1 tim tạm + 1 năng lượng |

Món mới dùng các giới hạn tim, tim tạm và năng lượng của bếp hiện tại; không tự nâng trần sức mạnh. Giá nguyên liệu còn lại giữ theo quầy hiện có, cần kiểm tra lại cân bằng khi thực sự thêm món.

**Thời điểm mở:** sau lần đầu bé cất cá, chỉ hiện lời giới thiệu. Công thức chỉ mở ở giai đoạn đã triển khai đầy đủ chuyển nguyên liệu và nấu món cá.

**Đường mang cá về:** Hồ Câu → Nông Trại → Bếp, hoặc Hồ Câu → Chợ → Bếp. Không bắt buộc ghé Sạp Cá, không tự bán cá khi đi ngang quầy. Bếp là khu hiện có, không phải một quầy chế biến thêm vào hai map mới.

Map Chợ mới chưa thay nơi mua nguyên liệu trong Bếp. Nếu sau này chuyển hoặc mở thêm quầy rau thực sự ở Chợ, phải duyệt rõ nguồn mua, giá và cùng một kho trước; không vừa mô tả bán ở Chợ vừa âm thầm bỏ tủ lạnh hiện tại.

Trong bản chỉ có câu cá, nếu nhánh nấu chưa làm: nút ghi **“Cất cá”**, chú thích “Giữ trong túi; dùng nấu khi bếp có món cá”. Không dẫn tới một công thức chưa hoạt động hoặc hứa có thể nấu ngay.

Không cho ăn cá sống; không tự thêm cá vào thức ăn của thú. Món đã nấu chỉ cho thú dùng khi hệ thống hiện tại cho phép và nội dung được chủ game duyệt.

## 11. Những bổ sung giúp câu cá có chiều sâu

### A. Cá có tính nết — ưu tiên cao nhất

Sáu loài dùng cùng luật nhưng có biểu cảm và nhịp khác nhau. Bé nhớ “bạn màu cam thích rỉa trước”, “bạn đốm nắng kéo chậm thôi” thay vì chỉ nhớ món nào bán đắt.

**Giá trị:** tăng kỹ năng quan sát, tạo chuyện để kể sau mỗi lượt, ít phải thêm nút.

### B. Sổ Cá — ghi nhận khám phá, không ép sưu tầm

- Mỗi loài có hình, lời đọc, cá nặng nhất của bé và loại mồi đã giúp gặp.
- Một trang “Bé đã thử” ghi lần đầu thả đúng, lần đầu biết nghỉ tay, lần đầu thả cá về hồ.
- Không dùng chữ “Thiếu 1 con nữa!” nhấp nháy; không có chuỗi đăng nhập, xếp hạng hoặc loài chỉ xuất hiện trong vài phút giờ thực.
- Mở trang mới có tiếng giấy lật, một hình dán sen. Không phát Sao lặp hoặc thưởng tiền vì thả đi rồi bắt lại.

**Giá trị:** thành tích vẫn còn sau khi cá được bán/nấu, bé không phải giữ cá trong túi mãi.

### C. Bạn thú đi câu cùng — cảm xúc, không thêm nghĩa vụ

- Trước cá cắn: thú nhìn theo bóng cá.
- Bé canh đúng: thú nhún chân, mắt sáng.
- Cá vùng: thú ngồi yên, làm mẫu “nghỉ tay”.
- Cá thoát: thú nghiêng đầu rồi cổ vũ; bắt được: thú vỗ chân hoặc nhảy nhẹ.
- Câu cá không trừ nhu cầu thú và không cần thú đủ no/năng lượng mới chơi được.

**Giá trị:** biến thao tác nhỏ thành một kỷ niệm cùng nhân vật quen.

### D. Lời nhờ vả trên Bảng Chợ — giai đoạn sau

Ví dụ ở Bảng nhờ giúp trong Chợ: “Bếp làng muốn một phần cá để làm cháo. Bé có muốn mang sang không?” Chỉ một lời nhờ tại một thời điểm, không hạn giờ, không làm mất cá đang đánh dấu giữ.

Thưởng một hình dán hoặc phụ kiện trang trí sau lần hoàn thành đầu; không cộng Sao theo vô hạn đơn hàng. Bé không nhận lời vẫn câu, bán và nấu bình thường.

**Giá trị:** tạo lý do chọn giữ cá, nối Hồ Câu — Chợ — túi — Bếp thành một hành trình. Không lấy nhiệm vụ này làm điều kiện mở map Hồ Câu hoặc Chợ.

### E. Góc cân “nặng hơn — nhẹ hơn” — tùy chọn sau lượt

Đặt cá mới cạnh hình con cá kỷ lục trên cân minh họa: “Con nào nặng hơn?”. Bé chọn bằng ảnh, sai được thử lại, không giữ cá làm điều kiện trả lời. Chỉ hiện khi chủ động mở Sổ Cá, không ngắt nhịp sau mỗi lần bắt.

**Giá trị:** học so sánh một cách trực quan; không bắt trẻ 5–6 tuổi tính gam hoặc số thập phân.

### Những ý tưởng nên để sau

Bể ngắm cá, trang trí bến, thời tiết trong chuyến, thêm bến ở map Hồ Câu hoặc thêm hồ theo vùng đất. Chỉ thêm sau khi cặp map Hồ Câu và Chợ đã chơi liền mạch; không làm thêm nhu cầu chăm bể, cá đói hoặc giờ cá xuất hiện để ép bé quay lại.

### F. Hai map có cảm xúc khác nhau, cùng một chuyến chơi

Hồ Câu yên để quan sát; Chợ vui để gặp người và quyết định món đồ muốn mua. Khi mang cùng con cá từ mặt hồ tới cân ở Chợ, bé thấy thành quả của chuyến đi hiện hữu trong thế giới.

Không thêm nhiều thao tác đi lại chỉ để kéo dài. Cửa nối hai map nằm dễ tìm, quãng đường ngắn; sau khi kết lượt có thể chạm biển chỉ đường để nhân vật tự đi. Chuyển map vẫn là bước rõ ràng, không giả lập bán từ xa.

## 12. Giao diện để bé tự hiểu

### Khi đang câu

```text
┌────────────────────────────────────────────────────────┐
│ [Về bờ]       HỒ CÂU LÁ SEN          [Loa] [Tạm dừng]   │
│                                                        │
│       Nhân vật + bạn thú       Cần — phao — bóng cá      │
│                                                        │
│                 Đường cá về bờ: ○ ○ ●                   │
│                                                        │
│            < con trỏ đi qua vùng lá sen >               │
│                                                        │
│              [       KÉO ĐÚNG LÚC!       ]              │
└────────────────────────────────────────────────────────┘
```

Đây là sơ đồ bố trí, không phải ảnh giao diện đã làm. Nút chính thay nội dung theo pha; không hiện đủ “Thả / Giật / Kéo / Nghỉ” cùng lúc.

### Khi đi trong hai map và ghé quầy Chợ

- Nhân vật và thú di chuyển trong cảnh Hồ Câu hoặc Chợ thật; thẻ mua bán chỉ là giao diện của từng quầy sau khi nhân vật đã tới nơi.
- Hồ Câu có biểu tượng giỏ cá/số ô, đồ đang trang bị và biển Chợ; không có nút Mua/Bán ở mọi vị trí.
- Chợ dùng biểu tượng **cần + hạt mồi** cho quầy đồ và **cá + cân** cho quầy bán; đóng quầy trả về đúng vị trí đang đứng trong Chợ.
- Màn Sạp Cá có ảnh từng con, gam, giá, dấu giữ để nấu và nút xác nhận. Bản đầu chỉ bán từng con, tránh bán cả túi ngoài ý muốn.
- Màn Quầy Cần & Mồi có giá, số nhận, số còn trong túi và ảnh món đang dùng. Bấm xem không tự mua.
- Cả hai map đều có biển về Nông Trại. Đi Bếp từ Chợ không yêu cầu đã mua hoặc bán.

- Trên điện thoại ngang, mọi vùng chạm tối thiểu **64 × 64 px**; nút chính đề xuất **96 × 96 px trở lên** nếu bố cục cho phép.
- Thanh canh nằm gần nút chính, không bắt mắt nhìn qua hai mép màn hình.
- Gợi ý bằng hình lá, bàn tay, mũi tên và tư thế cá, không chỉ màu xanh/đỏ.
- Bếp đang dùng vùng đỏ để canh nhịp; câu cá ưu tiên biểu tượng **lá sen** và thông điệp “vào vùng có hình”, tránh tạo luật màu đối nghịch. Mỹ thuật cần thử cùng bếp để trẻ nhận ra cùng ý nghĩa thao tác.
- Phím **Cách** tương đương nút chính, **Esc** mở tạm dừng. Phím không tác động màn phía sau.
- Phím Cách chỉ kích hoạt ở pha nhận thao tác; không tự đóng kết quả hoặc xác nhận bán cá.
- Không kéo dây bằng chuyển động thiết bị; không yêu cầu đa chạm hoặc quét ngón tay liên tục.
- Khi lời đọc đang phát mà tới pha cần phản ứng, ưu tiên tín hiệu ngắn “Giật nào!”; không chồng cả câu hướng dẫn dài.
- Tạm dừng đóng băng con trỏ, cửa sổ giật, thời gian pha và âm hiệu. Trở lại có “3, 2, 1” rồi mới chạy tiếp.
- Tắt hiệu ứng rung, giảm chuyển động và tắt tiếng đều chơi được. Không rung toàn màn hình mạnh khi cá thoát.

## 13. Thông số nhịp chơi ban đầu

| Thông số | Lượt học | Làm quen — mặc định | Khéo tay — tự chọn |
|---|---|---|---|
| Vùng thả đúng | 50% thanh | 40% | 35% |
| Tốc độ con trỏ kéo, một chiều hết thanh | 3,5 giây | 3 giây | 2,5 giây |
| Vùng kéo đúng, ở giữa thanh | 45% thanh | 35% | 30% |
| Viền “gần được”, mỗi bên vùng đúng | 5% thanh | 5% | 5% |
| Cửa sổ giật | Phát lại nếu chưa kịp | 2,2 giây | 1,8 giây |
| Pha cá quẫy / nghỉ tay | 1,5 giây, có mẫu | 1–1,5 giây | 1–1,5 giây |
| Số lần kéo đúng | 2 | 2–4 theo loài | 2–4 theo loài |
| Hụt trong giằng co | Thử lại từng bước | Lỗi thứ 3 hoặc hết 30 giây | Lỗi thứ 3 hoặc hết 30 giây |

Mỗi pha kéo bắt đầu con trỏ ở mép ngoài, cho bé thấy nó đang tới vùng lá. Không đổi hướng đột ngột, không dịch vùng đúng vào khoảnh khắc bé chuẩn bị chạm.

Phần hỗ trợ và cần câu cộng **điểm phần trăm** vào độ rộng vùng đúng: ví dụ 35% + 10% hỗ trợ + 5% cần = 50%. Giới hạn vùng đúng tối đa 60% thanh. Hai viền “gần được” nằm sát bên ngoài; cấu hình phải bảo đảm tổng vùng đúng và viền không vượt thanh.

### Mục tiêu kiểm chứng bằng chơi thử

- Sau hướng dẫn, đa số trẻ thử có thể tự nói/diễn tả “phao chìm thì giật, cá quẫy thì nghỉ”.
- Mục tiêu ban đầu: ít nhất 4/5 trẻ thử thực hiện được một lượt ở mức làm quen trong ba lượt đầu sau hướng dẫn; đây là tiêu chí nghiên cứu, chưa phải kết quả đã đo.
- Trẻ nhận ra đúng lý do hụt; nếu chỉ nói “game không cho bắt” thì tín hiệu hoặc cửa sổ thao tác còn chưa tốt.
- Không một lượt thường nào kéo dài quá 60 giây vì hệ thống chờ đợi; tạm dừng và thời gian bé đọc quầy không tính.
- Nếu trẻ liên tục bấm loạn, ưu tiên sửa tín hiệu và hướng dẫn trước khi tăng hình phạt.
- Dùng quan sát có người lớn và đồng ý của phụ huynh; không tự thêm thu thập dữ liệu cá nhân vào game để đo các mục tiêu này.

## 14. Luồng trạng thái và lưu dữ liệu — dành cho bước triển khai sau

Phần này là đặc tả dự kiến, **không yêu cầu viết code trong lượt làm tài liệu này**.

### 14.1. Luồng trạng thái

```text
NÔNG TRẠI ↔ MAP CHỢ [MUA ĐỒ / BÁN CÁ] ↔ MAP HỒ CÂU
                          ↕                    ↕
                         BẾP               NÔNG TRẠI

TRONG MAP HỒ CÂU: BỜ HỒ
  → CHUẨN BỊ
  → CANH THẢ
  → CHỜ CÁ
  → CÁ CẮN THẬT
  → GIẬT CẦN
  → [CÁ NGHỈ: CANH KÉO ↔ CÁ QUẪY: NGHỈ TAY]
  → BẮT ĐƯỢC → KẾT QUẢ → CẤT / THẢ
  hoặc HỤT → THỬ TIẾP / VỀ BỜ

CÁ ĐÃ CẤT → ĐI SANG MAP CHỢ → SẠP CÁ → BÁN / GIỮ
           hoặc ĐI VỀ BẾP → CHUẨN BỊ NGUYÊN LIỆU KHI ĐÃ CÓ
```

Khi mở câu cá hoặc quầy ở Chợ, khóa đi lại và tương tác trạm phía sau; không tự khởi động trận hoặc cổng dịch chuyển trong lúc thao tác. Đóng giao diện trả về đúng map và đúng bến/quầy. Hai map mới không có chiến đấu; tham gia câu cá hoặc mua bán không đổi cờ hoàn thành của sáu map học.

Mỗi map cần nền và điểm xuất hiện riêng; điểm vào phụ thuộc cửa vừa đi qua. Ví dụ từ Chợ sang hồ xuất hiện cạnh biển Chợ, không xuất hiện ở bến tập hoặc trong lòng hồ. Mô tả này chỉ quy định hành vi tương lai, chưa thêm scene, cấu hình hay mã map vào game.

### 14.2. Những dữ liệu cần có

| Nhóm | Nội dung dự kiến |
|---|---|
| Không gian | Map đang ở, cửa vừa đi qua, điểm trở lại an toàn, mốc đã thăm Hồ Câu/Chợ; không dùng cờ hoàn thành chiến dịch để lưu mua bán |
| Ví và đồ câu | Số Vỏ Sò, cần sở hữu, cần trang bị, mồi từng loại |
| Cá trong túi | Mã con cá duy nhất, loài, gam, thời điểm bắt, dấu giữ để nấu |
| Khám phá | Loài từng gặp/bắt, kỷ lục theo loài, mốc hướng dẫn |
| Lượt câu | Mã lượt, mồi giữ chỗ/đã tiêu, loài và khối lượng đã chốt, pha và thời gian còn lại, tiến độ kéo, số lỗi |
| Kết quả | Mã cá, đã cất/bán/thả/chuyển nguyên liệu, giao dịch đã ghi nhận |
| Hỗ trợ | Mức chơi đang chọn, hỗ trợ bật/tắt, chuỗi hụt, chuỗi loài lặp |

Toàn bộ giao dịch đi qua lớp lưu trữ của game hiện tại. Save cũ chưa có mục câu cá thì khởi tạo bộ tập, ví 0 và túi cá trống; không sửa Sao, kho bếp, thú hoặc tiến độ chiến dịch.

### 14.3. Quy tắc tránh mất và nhân đôi đồ

- Mua mồi/cần: trừ ví và thêm đồ trong cùng một giao dịch.
- Cá cắn thật: chốt mã lượt, loài, khối lượng và trừ một mồi mua cùng nhau; phát lại sự kiện không trừ thêm.
- Bắt được: thêm đúng một con vào ô đã giữ chỗ và cập nhật Sổ Cá cùng nhau.
- Bán: chỉ nhận giao dịch khi đang tương tác Sạp Cá tại Chợ; xóa đúng mã cá và cộng ví cùng nhau; chạm hai lần chỉ bán một lần.
- Chuyển nguyên liệu: xóa cá và cộng phần cá cùng nhau; không được vừa bán vừa chuyển cùng một con.
- Thả cá: xóa đúng con, giữ lịch sử khám phá; không hoàn mồi và không cộng tiền.
- Lưu lỗi: giữ nguyên tài nguyên đã lưu, tạm dừng và cho thử ghi lại; không cho tiếp tục với phần thưởng chỉ tồn tại trên màn hình.

### 14.4. Thoát, tải lại và gián đoạn

- Tạm dừng, mất focus, đổi ứng dụng: đóng băng lượt; trở lại mới đếm ngược tiếp, không mô phỏng thời gian câu khi offline.
- Chủ động về bờ trước cá cắn thật: hủy lượt và trả mồi đang giữ chỗ. Sau cắn thật: mồi đã tiêu; hiện lựa chọn tiếp tục hoặc xác nhận kết lượt.
- Đóng/tải lại sau cá cắn thật: phục hồi cùng lượt, cá, mồi đã tiêu, tiến độ và lỗi; không tạo cá mới hoặc trừ thêm mồi. Lưu ở mỗi mốc chuyển pha/ghi kết quả, không ghi liên tục từng khung hình.
- Khôi phục giữa một pha có thao tác dang dở: dùng ảnh chụp trạng thái gần nhất, giữ nguyên lỗi/tiến độ đã ghi; không chấp nhận một hành động chưa lưu là thành công. Chi tiết con trỏ khôi phục cần chọn một quy tắc cố định khi làm nguyên mẫu, không tạo lượt quay cá mới.
- Tải lại sau bắt được nhưng chưa chọn: cá vẫn trong túi; mở lại thẻ kết quả. Tải lại sau bán/thả/chuyển không phục hồi cá đã dùng.
- Chuyển Hồ Câu ↔ Chợ hoặc đi Bếp không trừ/xóa đồ; khi đang câu phải kết lượt hoặc lưu tạm dừng đúng luật trước khi rời map. Tải lại khi đang ở quầy Chợ đặt bé tại điểm an toàn cạnh quầy, không chạy lại giao dịch đã hoàn thành.
- Tải lại sau chuyển map phục hồi map và lối vào hợp lệ; dữ liệu cửa hỏng thì đưa về điểm đất khô/cổng vào của map, không rơi xuống nước hoặc kẹt sau quầy.
- Lượt học chưa xong: tiếp tục bước đang học; bộ tập miễn phí không bị cấp thành đồ có thể bán.

## 15. Danh sách hình ảnh, chuyển động và lời đọc cần chuẩn bị

| Nhóm | Nội dung ưu tiên |
|---|---|
| Map Hồ Câu mới | Một nền riêng, bờ hồ và bến tập, góc chuẩn bị, góc Sổ Cá, lối về Nông Trại và cửa Chợ; không lấy nền Map 1 làm map mới |
| Map Chợ mới | Một nền riêng, quảng trường, quầy Cần & Mồi, Sạp Cá, góc rau trang trí, bảng nhờ giúp, ba cửa nối khu |
| Người hướng dẫn/người bán | Chú Rái Cá tại hồ; Cô Vịt bán đồ, Cô Mèo cân cá ở Chợ; đứng/chào/chỉ dẫn, tên và tạo hình còn chờ duyệt |
| Nhân vật | Cầm cần, thả, chờ, giật, kéo, nghỉ tay, ăn mừng, nhìn cá thoát; dùng nhân vật đang chọn |
| Dây và cần | Cong nhẹ, cong rõ, thả lỏng; điểm nối tay–cần–dây đúng hướng |
| Mặt nước | Vòng thả, rỉa nhỏ, chìm thật, bóng cá, quẫy, cá bật lên |
| Cá | 3 loài đầu: bơi, rỉa, quẫy, lên giỏ, thả về; 3 loài sau mở rộng |
| Giao diện | Thanh lá sen, dấu tiến độ, thẻ cân, 3 nút xử lý cá, ví Vỏ Sò, ngăn cá |
| Đồ vật | Cần tập, 2 cần mua, 3 mồi, giỏ nước, sổ cá; cân và khay Vỏ Sò tại Sạp Cá ở Chợ |
| Bạn thú | Nhìn phao, ngồi làm mẫu, cổ vũ; ưu tiên tái dùng hoạt ảnh phù hợp |
| Âm thanh | Thả phao, rỉa, cắn thật, kéo đúng, nghỉ, thoát, lên cân, mua/bán |
| Giọng đọc | Mỗi lệnh một câu ngắn: “Chờ chút”, “Giật nào”, “Đúng lá rồi”, “Nghỉ tay”, “Bắt được rồi” |

Trước khi sản xuất hàng loạt, duyệt hai khung cảnh: nhân vật thật tại Hồ Câu với cần, cá, thanh canh; nhân vật thật tại Chợ với quầy cần và Sạp Cá. Phải nhìn cùng style với bếp và thú, đồng thời nhận ra ngay đây là hai địa điểm khác nhau. Trong lượt hiện tại chưa dựng hoặc sinh bất kỳ khung cảnh nào.

## 16. Lộ trình triển khai sau khi duyệt

### Giai đoạn A — Chứng minh một lượt thật sự vui

Nguyên mẫu ở **map Hồ Câu mới**, một bến, một cần tập, mồi tập, một cá; đủ thả — rỉa — cắn — giật — kéo/nghỉ — bắt/hụt. Có hướng dẫn, tạm dừng, cảm ứng và phím Cách. Chỉ bắt đầu làm nguyên mẫu sau khi chủ game cho triển khai; dùng mẫu đơn giản để chỉnh nhịp trước khi đặt làm toàn bộ art.

**Đạt khi:** trẻ hiểu lúc kéo/lúc nghỉ, có thể bắt và hụt theo nguyên nhân nhìn thấy; không thắng bằng bấm loạn, không mắc kẹt.

### Giai đoạn B — Hai map và chuyến đi mua — câu — bán

Thêm **map Chợ mới** có nền, đi lại, Cô Vịt, Cô Mèo, quầy cần/mồi, Sạp Cá và cửa nối. Hoàn thiện lối Nông Trại ↔ Hồ Câu ↔ Chợ và Chợ ↔ Bếp/Nông Trại. Thêm 3 loài đầu, cân nặng, Vỏ Sò, cất/thả tại hồ, bán tại Chợ, túi cá và Sổ Cá tối thiểu; lưu và khôi phục giao dịch. Mồi Hạt và các loài/đồ còn lại chỉ mở khi cấu hình tương ứng đã đủ, không hiển thị hàng mua chưa có tác dụng.

**Đạt khi:** bé thực sự đi trong hai map riêng; từ ví 0 vẫn chơi được bằng bộ tập; tự mang cá từ hồ về Sạp Cá để bán rồi ghé quầy mua mồi; không có bán từ xa ở hồ; không mất/nhân đôi cá khi chuyển cảnh; túi đầy được xử lý trước khi câu.

### Giai đoạn C — Cá có cá tính và cảm giác đáng nhớ

Hoàn thiện 6 loài, 3 mồi, 3 cần, biểu cảm thú, Sổ Cá, kỷ lục cá nhân, âm thanh và mỹ thuật cho **cả hai map**. Thêm Bến Nắng chỉ sau khi đã có cấu hình và nội dung riêng. Chơi thử để chỉnh giá, nhịp, quãng đi chợ và trợ giúp; góc rau vẫn là trang trí nếu chưa duyệt mua nguyên liệu.

**Đạt khi:** trẻ kể được ít nhất một sự khác biệt giữa hai loài ngoài màu sắc; một chuyến ngắn vẫn có cảm giác trọn vẹn.

### Giai đoạn D — Hồ Câu, Chợ và Bếp thành một hành trình

Thêm chuyển cá thành phần nguyên liệu, hai món mới, lời nhờ trên Bảng Chợ và hành trình về nấu. Chỉ cập nhật lời hứa “Cất để nấu” thành tính năng dùng ngay khi nhánh này chạy trọn vẹn. Chợ không tự thay quầy nguyên liệu của Bếp ở giai đoạn này.

**Đạt khi:** bắt cá → giữ → về bếp → chuyển nguyên liệu → nấu → dùng món chạy liền mạch, không thay quy tắc của 6 món cũ.

Chưa cam kết số ngày hoặc chi phí thực hiện trước khi duyệt phạm vi, số hoạt ảnh và kết quả nguyên mẫu A.

## 17. Checklist nghiệm thu

### Hai map và đúng vai trò địa điểm

- [ ] Hồ Câu và Chợ có nền, đường đi, điểm vào/ra và hoạt động riêng; không phải hai popup hoặc hai góc trong Map 1.
- [ ] Nông Trại có lối tới cả hai map; Hồ Câu ↔ Chợ đi được hai chiều, Chợ có cửa về Bếp/Nông Trại.
- [ ] Nhân vật đi tới bến/quầy trước khi mở tương tác; đóng xong đứng lại đúng vị trí trong đúng map.
- [ ] Mua cần/mồi và bán cá chỉ tại map Chợ; ở hồ chỉ dùng đồ đã có, nhận bộ tập, câu, cất hoặc thả.
- [ ] Từ ví 0 hoặc đi thẳng tới hồ vẫn có bộ tập, không bị ép vòng lại Chợ để bắt đầu.
- [ ] Túi đầy có hướng đi Chợ/xem giỏ rõ; không tự bán hoặc tự rời map.
- [ ] Đi ngang Sạp Cá không bán cá; đi cửa Bếp không yêu cầu mua bán trước đó.
- [ ] Mở Chợ không thay quầy nguyên liệu hiện có ở Bếp hoặc thay luật mở sáu vùng học.
- [ ] Chuyển map/tải lại giữ đúng túi, ví, thú; không xuất hiện trong nước hoặc sau quầy.

### Cảm giác chơi và nội dung

- [ ] Thả trượt vùng vẫn bắt đầu được lượt; không phạt ngay thao tác đầu.
- [ ] Rỉa mồi và cắn thật phân biệt được khi tắt tiếng.
- [ ] Bấm giật thành công không bị tính tiếp thành một lần kéo sớm.
- [ ] Mỗi pha chỉ nhận một lần đánh giá; giữ phím, đa chạm hoặc bấm liên tục không lách luật.
- [ ] Cá quẫy có tín hiệu đủ sớm để bé dừng; không đột ngột phạt khi nút vừa được bấm hợp lệ ở pha trước.
- [ ] Kéo đúng đủ chặng luôn bắt được, không có lần thoát ngẫu nhiên sau đó.
- [ ] Hụt có lời gợi ý cụ thể và đường thử lại bằng bộ tập.
- [ ] Hỗ trợ không giảm giá cá hoặc tước dấu khám phá của bé.
- [ ] Có lối về bờ rõ, không tự nối lượt và không ép chơi tiếp.

### Đồ, tiền và cân nặng

- [ ] Ví 0 vẫn câu được; mồi hết vẫn dùng mồi tập được.
- [ ] Giá mua, số mồi nhận và ảnh cần khớp thông tin trước xác nhận.
- [ ] Rút cần trước cắn thật không tiêu mồi; sau cắn thật tiêu đúng một.
- [ ] Khối lượng đúng khoảng loài và bước 50 g; kiểm tra biên giá bán 300/600/1.000/1.500 g.
- [ ] Bảng mồi cộng đủ 100% trước quy tắc chống lặp; không ra loài ngoài nhóm mồi.
- [ ] Cá đã bán/thả/chuyển không còn trong túi; Sổ Cá vẫn giữ kỷ lục.
- [ ] Túi đầy không bắt đầu lượt; đóng thẻ kết quả không làm mất cá.
- [ ] Mồi gần 99 không thu tiền nếu không nhận đủ gói; cần đã sở hữu không mua lặp.

### Lưu trữ và nối hệ thống

- [ ] Kiểm tra đóng/tải lại trước cắn, sau tiêu mồi, giữa giằng co, khi vừa bắt, khi chuyển map và sau bán tại Chợ.
- [ ] Chạm nhanh hai lần không bán hai lần, không nhận hai cá, không chuyển nguyên liệu trùng.
- [ ] Lưu lỗi không trừ tài nguyên một nửa hoặc cho nhận phần thưởng không bền vững.
- [ ] Save cũ vẫn giữ Sao, bếp, thú và tiến độ; không yêu cầu chơi lại chiến dịch.
- [ ] Đang câu không mở chiến đấu, cổng hoặc điều khiển nhân vật phía sau.
- [ ] Khi nhánh bếp chưa làm, giao diện nói rõ cá chỉ đang cất, không hứa nấu ngay.
- [ ] Khi nối bếp, kiểm tra biên 600/1.200 g và chuyển một con thành đúng số phần một lần.
- [ ] Kho phần cá đầy thì không xóa cá; ngăn món đầy vẫn tuân thủ luật giữ chỗ của bếp hiện tại.

### Màn hình và hỗ trợ

- [ ] Kiểm tra ngang 844 × 390 và 1280 × 800: nút không bị cắt, không chồng thanh canh.
- [ ] Chơi trọn lượt bằng cảm ứng, chuột và bàn phím; phím không kích hoạt xác nhận bán ngoài ý muốn.
- [ ] Đổi ứng dụng, xoay máy và mở tạm dừng không làm hụt khi bé không nhìn màn hình.
- [ ] Lời đọc không chồng nhau; không cần âm thanh, màu sắc hoặc rung riêng lẻ để hiểu luật.
- [ ] Chế độ giảm chuyển động giữ tín hiệu bắt buộc, giảm rung/nhảy/pháo giấy trang trí.

## 18. Những câu hỏi nên chốt sau khi đọc

**Cấu trúc hai map riêng đã chốt theo yêu cầu, không hỏi lại việc gộp map.** Các câu sau chỉ là lựa chọn nội dung còn lại. Không cần trả lời trước để bản kế hoạch này đọc được; **chỉ triển khai khi có yêu cầu triển khai riêng**.

1. **Bán cá lấy gì?**
   - **Đề xuất: Vỏ Sò riêng cho đồ câu**, giúp bảo toàn vai trò Sao từ học tập.
   - Hoặc dùng Sao chung để giao diện ít tiền tệ hơn; khi đó phải thiết kế lại cân bằng mua/bán với bếp và thử thách.

2. **Cá là thực phẩm hay hoàn toàn là bạn?**
   - **Theo yêu cầu hiện tại: cá bán hoặc giữ để nấu**, không minh họa sơ chế.
   - Nếu muốn tất cả cá chỉ là bạn: bắt–ghi sổ–thả; bếp nhận nguyên liệu tượng trưng qua nhiệm vụ riêng. Phương án này đổi ý nghĩa nhánh nấu, cần bạn chọn rõ.

3. **Mức giằng co mong muốn?**
   - **Đề xuất: chạm đúng điểm + nghỉ khi cá quẫy**, hợp nhịp bếp hiện có và thao tác trẻ 5–6 tuổi.
   - Hoặc giữ để kéo, nhả để giảm căng; có cảm giác kéo dây mạnh hơn nhưng cần thử riêng để tránh khó vận động. Không trộn cả hai kiểu trong bản đầu.

4. **Điểm nhấn ưu tiên để làm xuất sắc?**
   - **Đề xuất: cá có tính nết + bạn thú cổ vũ + Sổ Cá**, tạo cảm xúc trong mỗi lượt.
   - Hoặc dồn vào chuỗi câu cá → nấu món → mời bạn thú dùng món, sau khi duyệt nội dung món cho thú.
   - Hoặc mở thêm bến trong Hồ Câu và trang trí Chợ sau khi hai map đầu đã chơi liền mạch.

5. **Chợ bán thêm gì ngoài đồ câu?**
   - **Đề xuất bản đầu: mua cần/mồi và bán cá**, có góc rau trang trí để Chợ có không khí nhưng chưa thêm hệ kinh tế mới.
   - Mở thêm quầy rau/nguyên liệu thực sự; cần chốt giá, loại tiền và quan hệ với tủ lạnh hiện tại trong một bản kịch bản tiếp theo.

---

**Phạm vi bản kịch bản 2.0:** **hai map mới độc lập — Hồ Câu Lá Sen và Chợ Cầu Vồng**; Hồ Câu có bến, hướng dẫn, canh điểm, kéo/nghỉ, cá có cân nặng, cất/thả và Sổ Cá; Chợ có quầy mua cần/mồi và Sạp Cá để cân/bán; di chuyển giữa hai map để hoàn thành chuyến đi. Thử 3 loài trước, mở đủ 6 loài sau khi chỉnh nhịp. Nhánh nấu cá là giai đoạn tiếp theo, gắn với Bếp hiện có.

**Tình trạng:** chỉ cập nhật `FISHING_PLAN.md`. Chưa triển khai hai map, chưa tạo asset, chưa sửa mã nguồn, cấu hình bản đồ, save, giá bán hay cơ chế đang chạy của game. Các giai đoạn, sơ đồ và checklist trong tài liệu là mô tả để duyệt, không phải công việc đã được thực hiện.
