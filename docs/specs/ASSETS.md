# DANH MỤC TÀI NGUYÊN ĐỒ HỌA & ÂM THANH (ASSETS.md)

File này quy định cấu trúc thư mục, tên file chuẩn và kích thước hình ảnh `.png` để AI trong Antigravity và bộ `AssetLoader` tự động nhận diện.

---

## 1. Lệnh Tạo Nhanh Thư Mục Con (Chạy trong Terminal)

Copy dòng lệnh sau vào Terminal để tạo toàn bộ cây thư mục chứa ảnh:

`mkdir -p assets/hero assets/equip/hats assets/equip/outfits assets/equip/weapons assets/equip/trails assets/monsters/map1 assets/monsters/map2 assets/monsters/map3 assets/pets assets/maps/backgrounds assets/maps/props assets/ui assets/edu assets/audio`

---

## 2. Quy Chuẩn Kỹ Thuật Khi Tải / Xuất File Ảnh (.PNG)

- **Định dạng:** `.png` nền trong suốt (Transparent Background).
- **Tỷ lệ khung Nhân vật / Trang bị / Quái vật:** Khung hình vuông tỉ lệ `1:1` (`128x128px` hoặc `256x256px`), đặt đối tượng ở chính giữa khung.
- **Quy tắc Ghép Lớp (Paper-Doll):** Các file trong `hats/` và `outfits/` cần căn chỉnh vị trí khớp với khung của `hero_idle.png` để khi vẽ đè lên cùng tọa độ `(x, y)` không bị lệch.
- **Cơ chế Fallback:** Nếu file `.png` nào chưa có trong thư mục, code bắt buộc tự động hiển thị Emoji mặc định để không gây lỗi vỡ ảnh.

---

## 3. Danh Sách 26 File Ảnh Cốt Lõi Cần Tải (Giai Đoạn 1)

### 3.1. Nhân Vật Chính (Bé Sam) & Thú Cưng
| Thư mục | Tên file chuẩn | Key trong Code | Kích thước | Fallback | Mô tả chi tiết |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `assets/hero/` | `hero_idle.png` | `hero_idle` | `128x128px` | 😊 | Bé Sam tư thế đứng chính diện (PNG trong suốt). |
| `assets/hero/sam/` | `sam_idle.webp` | `sam_idle` | `128x128px` | 😊 | Hoạt họa Bé Sam đứng thở (8 frames, WebP hoạt họa trong suốt). |
| `assets/hero/sam/` | `sam_walk.webp` | `sam_walk` | `128x128px` | 😊 | Hoạt họa Bé Sam bước đi (8 frames, WebP hoạt họa trong suốt). |
| `assets/hero/sam/` | `sam_attack.webp` | `sam_attack` | `128x128px` | ⭐ | Hoạt họa Bé Sam nhảy vung tay xuất chiêu & ăn mừng (16 frames). |
| `assets/hero/sam/` | `sam_walk_sheet.png` | `sam_walk_sheet` | `1024x512px` | 😊 | Sprite Sheet bước đi 4 hướng (Xuống, Phải, Lên, Trái) trên Canvas. |
| `assets/hero/sam/` | `sam_idle_sheet.png` | `sam_idle_sheet` | `1024x512px` | 😊 | Sprite Sheet đứng thở 4 hướng (Xuống, Phải, Lên, Trái) trên Canvas. |
| `assets/pets/` | `pet_bunny_idle.png` | `pet_bunny` | `128x128px` | 🐰 | Thú cưng Thỏ Trắng đi theo bé & ở trong Phòng Thú. |

### 3.2. Quái Vật & Boss Theo Các Bản Đồ
| Thư mục | Tên file chuẩn | Key trong Code | Kích thước | Fallback | Mô tả chi tiết |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `assets/monsters/map1/` | `mon_mushroom.png` | `m1_mushroom` | `384x384px` | 🍄 | Quái Nấm Rơm Tinh Nghịch mỉm cười (PNG trong suốt). |
| `assets/monsters/map1/` | `mon_mushroom_idle.webp` | `m1_mushroom_idle` | `384x384px` | 🍄 | Quái Nấm đứng thở, nhún nhảy đáng yêu (WebP hoạt họa). |
| `assets/monsters/map1/` | `mon_mushroom_attack.webp` | `m1_mushroom_attack` | `384x384px` | 🍄 | Quái Nấm tụ năng lượng, niệm phép tung Cầu Bào Tử (5 frame). |
| `assets/monsters/map1/` | `mon_mushroom_celebrate.webp` | `m1_mushroom_celebrate` | `384x384px` | 🍄 | Quái Nấm vui mừng nhảy múa khi được bé giải cứu (WebP hoạt họa). |
| `assets/monsters/map1/` | `spore_proj.png` | `spore_proj` | `256x256px` | 🍄 | Đạn phép "Cầu Bào Tử Thần" xoay 360 độ rực rỡ lấp lánh. |
| `assets/monsters/map1/` | `rainbow_explosion.png` | `rainbow_explosion` | `384x384px` | 💥 | Hiệu ứng va chạm Nổ Sao Cầu Vồng hoạt họa comic. |
| `assets/monsters/map1/` | `fireworm_idle.png` | `m1_fireworm` | `90x90px` | 🐛 | Quái Sâu Lửa pixel art tĩnh (PNG trong suốt). |
| `assets/monsters/map1/` | `fireworm_idle.webp` | `m1_fireworm_idle` | `90x90px` | 🐛 | Quái Sâu Lửa ngoe nguẩy đuôi lửa (9 frames). |
| `assets/monsters/map1/` | `fireworm_attack.webp` | `m1_fireworm_attack` | `90x90px` | 🔥 | Quái Sâu Lửa phun cầu lửa vào nhân vật (16 frames). |
| `assets/monsters/map1/` | `fireball.webp` | `fireball_proj` | `46x46px` | 🔥 | Đạn Cầu Lửa bay rực lửa của Quái Sâu. |
| `assets/monsters/map1/` | `mon_bee.png` | `m1_bee` | `128x128px` | 🐝 | Ong Vàng nhỏ tinh nghịch (Map 1). |
| `assets/monsters/map1/` | `boss_bunny.png` | `boss_bunny` | `256x256px` | 🐇 | Boss Thỏ Khổng Lồ ôm cà rốt (Trùm Map 1). |
| `assets/monsters/map2/` | `mon_caterpillar.png` | `m2_caterpillar` | `128x128px` | 🐛 | Sâu Xanh lá cây tròn trịa (Map 2). |
| `assets/monsters/map2/` | `mon_monkey.png` | `m2_monkey` | `128x128px` | 🐵 | Khỉ Con nâu cầm chuối (Map 2). |
| `assets/monsters/map2/` | `boss_bear.png` | `boss_bear` | `256x256px` | 🐻 | Boss Gấu Nâu ôm hũ mật ong (Trùm Map 2). |
| `assets/monsters/map3/` | `mon_pudding.png` | `m3_pudding` | `128x128px` | 🍮 | Quái Kẹo Dẻo / Bánh Pudding hồng (Map 3). |
| `assets/monsters/map3/` | `mon_cupcake.png` | `m3_cupcake` | `128x128px` | 🧁 | Quái Bánh Kem Cupcake dâu tây (Map 3). |
| `assets/monsters/map3/` | `boss_candydino.png` | `boss_candydino` | `256x256px` | 🦕 | Boss Khủng Long Kẹo Ngọt pastel (Trùm Map 3). |

### 3.3. Vũ Khí, Trang Phục, Mũ & Vệt Bước Chân (10 Files)
| Thư mục | Tên file chuẩn | Key trong Code | Kích thước | Fallback | Mô tả chi tiết |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `assets/equip/weapons/` | `wand_bubble.png` | `wand_bubble` | `64x64px` | 🫧 | Đũa phép bong bóng xanh (Vũ khí Cấp 1). |
| `assets/equip/weapons/` | `wand_candy.png` | `wand_candy` | `64x64px` | 🍭 | Gậy kẹo mút xoắn hồng (Vũ khí Cấp 3). |
| `assets/equip/weapons/` | `wand_star.png` | `wand_star` | `64x64px` | 🌟 | Trượng ngôi sao vàng lấp lánh (Vũ khí Cấp 5). |
| `assets/equip/hats/` | `hat_crown.png` | `hat_crown` | `64x64px` | 👑 | Vương miện vàng nhỏ đội trên đầu. |
| `assets/equip/hats/` | `hat_bunny.png` | `hat_bunny` | `64x64px` | 🐰 | Mũ tai thỏ trắng hồng. |
| `assets/equip/hats/` | `hat_wizard.png` | `hat_wizard` | `64x64px` | 🎩 | Nón chóp phù thủy tím đính sao. |
| `assets/equip/outfits/` | `outfit_red.png` | `outfit_red` | `128x128px` | 🧣 | Áo choàng đỏ khoác lên thân nhân vật. |
| `assets/equip/outfits/` | `outfit_dino.png` | `outfit_dino` | `128x128px` | 🦖 | Bộ đồ liền thân Khủng Long xanh. |
| `assets/equip/trails/` | `trail_flower.png` | `trail_flower` | `48x48px` | 🌸 | Bông hoa nhỏ hiện ra dưới bước chân. |
| `assets/equip/trails/` | `trail_star.png` | `trail_star` | `48x48px` | ✨ | Hạt sao lấp lánh hiện ra dưới bước chân. |

### 3.4. Hình Nền Bản Đồ & Vật Cản Tương Tác (9 Files)
| Thư mục | Tên file chuẩn | Key trong Code | Kích thước | Fallback | Mô tả chi tiết |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `assets/maps/backgrounds/` | `map_1_bg.png` | `map_1_bg` | `1536x1024px` | Nền xanh | Map 1: Làng Quê Yên Bình (Cây đa, quán nước, mái đình, ao sen, ruộng lúa). |
| `assets/maps/backgrounds/` | `map_2_bg.png` | `map_2_bg` | `1536x1024px` | Nền vàng | Map 2: Vịnh Biển Cát Vàng (Bờ biển nhiệt đới, rặng tre, biển xanh ngọc). |
| `assets/maps/backgrounds/` | `map_3_bg.png` | `map_3_bg` | `1536x1024px` | Nền tím tối | Map 3: Động Pha Lê Lung Linh (Hang đá ngầm, thạch anh tím & pha lê phát quang). |
| `assets/maps/backgrounds/` | `map_4_bg.png` | `map_4_bg` | `1536x1024px` | Nền sa mạc | Map 4: Đấu Trường Sa Mạc Thái Dương (Kim tự tháp, vòng hoa văn mặt trời, ốc đảo). |
| `assets/maps/backgrounds/` | `map_5_bg.png` | `map_5_bg` | `1264x848px` | Nền núi đá | Map 5: Hẻm Núi Đá Hùng Vĩ (Đấu trường sỏi đá, vách núi cheo leo). |
| `assets/maps/backgrounds/` | `map_6_bg.png` | `map_6_bg` | `1536x1024px` | Nền hoàng gia | Map 6: Cung Đình Thần Long (Hoàng cung rồng vàng, hồ sen, điện Thần Long). |
| `assets/maps/props/` | `prop_dong_rom.png` | `prop_dong_rom` | `320x320px` | 🌾 | Đống rơm vàng làng quê che giấu Quái Nấm ở Map 1. |
| `assets/maps/props/` | `prop_bush.png` | `prop_bush` | `128x128px` | 🌳 | Bụi hoa / Bụi tre che giấu quái vật. |
| `assets/maps/props/` | `prop_log.png` | `prop_log` | `128x128px` | 🪵 | Khúc gỗ dạt bờ chặn đường ở Map 2. |


---

## 4. Danh Sách Tài Nguyên Mở Rộng (Giai Đoạn 2 - Bổ Sung Sau)

### 4.1. Học Liệu & Giao Diện (`assets/edu/` & `assets/ui/`)
- `assets/edu/apple_red.png`, `banana.png`, `strawberry.png`, `honey.png` (`96x96px`): Hình ảnh minh họa câu hỏi đếm số.
- `assets/ui/icon_heart.png`, `icon_star.png`, `btn_speaker.png` (`64x64px`): Icon thanh máu, ngôi sao và nút loa đọc câu hỏi.

### 4.2. Âm Thanh & Giọng Đọc (`assets/audio/`)
- `bgm_map.mp3`: Nhạc nền vui tươi khi đi dạo trên bản đồ.
- `sfx_correct.mp3`: Tiếng chuông/vỗ tay khi bé chọn đúng.
- `sfx_wrong.mp3`: Tiếng lò xo vui nhộn khi bé chọn sai.
- `sfx_levelup.mp3`: Âm thanh chúc mừng lên cấp.

### 4.3. Tài nguyên mở rộng cho Nuôi Thú (`assets/pets/`)
- `pet_bunny_idle.png` (đã tích hợp): Thỏ Bông đứng trong Phòng Thú và đi theo trên bản đồ.
- `pet_bunny_happy.webp` (tuỳ chọn): hoạt ảnh khi cho ăn, chơi và lên cấp; nếu thiếu sẽ dùng ảnh idle + huy hiệu Emoji.
- `pet_bunny_bubble.webp` (tuỳ chọn): hoạt ảnh tắm bong bóng; nếu thiếu sẽ dùng ảnh idle + 🫧.
- `pet_food_strawberry.png`, `pet_toy_balloon.png` (tuỳ chọn): vật phẩm minh họa cho các nút chăm sóc.
- `sfx_pet_feed.mp3`, `sfx_pet_bath.mp3`, `sfx_pet_play.mp3`, `sfx_pet_levelup.mp3` (tuỳ chọn): âm thanh riêng; bản MVP dùng Web Audio fallback.
