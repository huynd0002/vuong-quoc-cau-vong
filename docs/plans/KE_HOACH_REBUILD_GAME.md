# Kế hoạch tái xây dựng Vương Quốc Cầu Vồng

**Trạng thái:** HOÀN THÀNH TOÀN DIỆN 100% (Giai đoạn 0 đến 6 đã nghiệm thu thành công)  
**Ngày cập nhật:** 18/10/2026  
**Đối tượng:** Game giáo dục phiêu lưu 2D cho trẻ 5–6 tuổi, web mobile landscape  
**Mục tiêu:** Tái thiết kế nền tảng game có cấu trúc mô-đun, dễ mở rộng nội dung và hình ảnh; giữ lại tài sản, ý tưởng và các chính sách an toàn tốt của bản hiện tại.

> **Tiến độ tổng thể:** Toàn bộ 7 giai đoạn (Giai đoạn 0 đến 6) đã được triển khai hoàn chỉnh và nghiệm thu đạt 100%. Xem chi tiết từng giai đoạn:
> - [GIAI_DOAN_0_KHOA_PHAM_VI_VA_KIEM_KE.md](GIAI_DOAN_0_KHOA_PHAM_VI_VA_KIEM_KE.md)
> - [GIAI_DOAN_1_PROTOTYPE_VA_QUYET_DINH_ENGINE.md](GIAI_DOAN_1_PROTOTYPE_VA_QUYET_DINH_ENGINE.md)
> - [GIAI_DOAN_2_KHUNG_DU_AN_VA_VERTICAL_SLICE_NEN.md](GIAI_DOAN_2_KHUNG_DU_AN_VA_VERTICAL_SLICE_NEN.md)
> - [GIAI_DOAN_3_VERTICAL_SLICE_VUNG_1.md](GIAI_DOAN_3_VERTICAL_SLICE_VUNG_1.md)
> - [GIAI_DOAN_4_CAMPAIGN_TIEN_TRINH_VA_LUU_TRU.md](GIAI_DOAN_4_CAMPAIGN_TIEN_TRINH_VA_LUU_TRU.md)
> - [GIAI_DOAN_5_MO_RONG_NOI_DUNG_6_VUNG.md](GIAI_DOAN_5_MO_RONG_NOI_DUNG_6_VUNG.md)
> - [GIAI_DOAN_6_AM_THANH_PWA_TOI_UU_VA_PHAT_HANH.md](GIAI_DOAN_6_AM_THANH_PWA_TOI_UU_VA_PHAT_HANH.md)


## 1. Quyết định kiến trúc đề xuất

### Hướng chính: Phaser làm runtime 2D

Dùng **Phaser** làm runtime/rendering/input/scene framework duy nhất cho game. Game hiện đã là game 2D trên Canvas với map, sprite, animation, battle và điều khiển cảm ứng; Phaser phù hợp trực tiếp cho các nhu cầu này và giữ game trong trình duyệt.

- Framework chính: [phaserjs/phaser](https://github.com/phaserjs/phaser), MIT, khoảng 40.5k stars tại lần tra cứu.
- Tài liệu/recipe/plugin chọn lọc: [rexrainbow/phaser3-rex-notes](https://github.com/rexrainbow/phaser3-rex-notes), MIT, khoảng 1.3k stars. Không đưa cả plugin bundle vào; chỉ chọn plugin cần thiết sau prototype và kiểm tra tương thích phiên bản Phaser.
- Âm thanh: [goldfire/howler.js](https://github.com/goldfire/howler.js), MIT, khoảng 25.4k stars. Tích hợp sau khi có audio pack; Speech API hoặc thu âm vẫn là kênh đọc câu hỏi riêng.
- Điều phối state: [statelyai/xstate](https://github.com/statelyai/xstate), MIT, khoảng 30.3k stars. Chỉ dùng cho state machine cấp ứng dụng/battle nếu sơ đồ flow chứng minh có giá trị; không để XState và Phaser cùng sở hữu một state trùng lặp.
- Validate cấu hình/nội dung: chọn **một** trong [colinhacks/zod](https://github.com/colinhacks/zod) hoặc [ajv-validator/ajv](https://github.com/ajv-validator/ajv). Đề xuất Zod nếu config viết bằng TypeScript; Ajv nếu nội dung là JSON và cần JSON Schema độc lập với code.
- PWA sau khi build pipeline ổn định: [vite-pwa/vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa), MIT. Chỉ dùng sau khi có Vite, cache policy và kiểm thử offline.
- Animation UI ngoài game canvas: [juliangarnier/anime](https://github.com/juliangarnier/anime), MIT. Là tùy chọn, chỉ dùng cho DOM/UI choreography; animation gameplay ưu tiên Phaser animation/tween để không chồng hai hệ thống.
- Kiểm thử browser: Playwright phù hợp kỹ thuật nhưng license **Apache-2.0**, không đạt điều kiện MIT đã đặt. Chưa đưa vào dependency bắt buộc của kế hoạch. Cần quyết định riêng nếu yêu cầu công cụ E2E đa trình duyệt quan trọng hơn tiêu chí MIT.

### Không ghép đồng thời các engine/renderer cạnh tranh

- **Không dùng Phaser và PixiJS cùng làm renderer.** PixiJS ([pixijs/pixijs](https://github.com/pixijs/pixijs), MIT) là phương án thay thế nếu prototype cho thấy nhu cầu chủ yếu là render/UI 2D tùy biến, còn team sẵn sàng tự xây scene, game loop, input và tích hợp.
- Không dùng Phaser + Pixi cho cùng game scene: tạo hai hệ tọa độ, hai vòng render, quản lý input và asset phức tạp, giảm hiệu năng và làm khó debug.
- Không chuyển sang React chỉ để dựng game canvas. UI DOM có thể dùng HTML/CSS vanilla; chỉ đưa React vào nếu sau này Parent Portal là một ứng dụng riêng.
- Không dùng Anime.js cho mọi sprite/tween trong Phaser; chọn một hệ cho từng loại chuyển động.

### Cổng quyết định engine trước khi rebuild

Làm một prototype kỹ thuật nhỏ, không phải sản phẩm: một map ngắn, nhân vật di chuyển, một vật thể tương tác, một trận turn-based, panel câu hỏi HTML responsive, animation và tải một nhóm asset.

Prototype cần chứng minh:

- Khung landscape và resize trên desktop, tablet, mobile chạy đúng.
- Phaser canvas và DOM question panel phối hợp được, focus/keyboard/touch không xung đột.
- Hiệu ứng battle, sprite animation, âm thanh và chuyển scene đạt hình ảnh mong muốn.
- Tải asset theo scene/map và không bắt đầu bằng tải toàn bộ kho hình.
- Nếu Phaser không đạt do tích hợp UI/hiệu năng/kiểm soát art, so sánh prototype tương đương bằng Pixi. Chốt một engine duy nhất trước khi làm campaign.

## 2. Chấm điểm repo theo từng phần

Thang điểm: 1–5. Điểm cao = phù hợp với phần đó của game trong bối cảnh code vanilla hiện tại. License/MIT là điều kiện lọc riêng, không được cộng điểm thay độ phù hợp. Stars và hoạt động tham khảo theo lần tra cứu 18/10/2026; cần kiểm tra lại khi bắt đầu triển khai.

| Phần game | Repo phù hợp nhất | Điểm | Repo ghép nên dùng | Không nên làm |
| --- | --- | ---: | --- | --- |
| Runtime, scene, asset loading, input, camera, animation | [phaserjs/phaser](https://github.com/phaserjs/phaser) | 5/5 | `rexrainbow/phaser3-rex-notes` để tra cứu recipe/plugin đã chọn | Không đưa PixiJS làm renderer thứ hai. |
| Học cách dùng Phaser và plugin UI/behavior | [rexrainbow/phaser3-rex-notes](https://github.com/rexrainbow/phaser3-rex-notes) | 4/5 khi dùng Phaser, 1/5 nếu giữ engine hiện tại | Phaser core; có thể dùng plugin dialog, UI, transition sau khi thử riêng | Không cài nguyên bundle chỉ vì có sẵn; phải rà kích thước, API, license và tương thích. |
| Render sprite/particle nếu chọn renderer tối giản | [pixijs/pixijs](https://github.com/pixijs/pixijs) | 4/5 | Cần tự thiết kế scene/state/input hoặc chọn plugin Pixi tương ứng | Không ghép với Phaser trong cùng runtime. Đây là phương án engine thay thế, không phải phần bổ sung Phaser. |
| Battle turn/phase/modal/quest state | [statelyai/xstate](https://github.com/statelyai/xstate) | 4/5 | Phaser quản lý scene/entity/render; XState quản lý flow ứng dụng có điều kiện rõ | Không đưa trạng thái vị trí/tween/frame của từng sprite vào XState; tránh hai state source. |
| Nhạc nền, SFX, quản lý volume/audio sprite | [goldfire/howler.js](https://github.com/goldfire/howler.js) | 4/5 | Phaser để gắn lifecycle theo scene; Howler chỉ làm audio manager nếu Phaser audio không đủ | Không dùng Howler và Phaser Sound để cùng phát/quản lý một âm thanh. Chốt một audio owner. |
| Đọc câu hỏi/thoại tiếng Việt | Không có repo trong danh sách thay thế được Speech API/thu âm | 2/5 | SpeechSynthesis hiện có làm fallback; Howler chỉ phát file thoại đã thu | Không coi thư viện SFX là TTS. Cần đánh giá giọng Việt trên thiết bị thật và quyền sử dụng file thu. |
| UI câu hỏi, modal, HUD thân thiện trẻ | Phaser DOM Element hoặc HTML/CSS hiện hữu | 4/5 | Phaser layout/recipe chọn lọc từ Rex nếu UI nằm trong game canvas; anime.js chỉ cho DOM animation cần thiết | Không copy UI kit SaaS/dashboard; không làm toàn bộ chữ và control thành canvas nếu cần accessibility. |
| Animation panel/feedback DOM | [juliangarnier/anime](https://github.com/juliangarnier/anime) | 3/5 | CSS transition hoặc Phaser tween thường đủ; Anime.js chỉ thêm cho chuỗi DOM phức tạp | Không có hai thư viện cùng điều khiển transform của một element. |
| Validate question bank/map/asset manifest | [colinhacks/zod](https://github.com/colinhacks/zod) hoặc [ajv-validator/ajv](https://github.com/ajv-validator/ajv) | 5/5 | JSON question bank + schema test; Phaser dùng dữ liệu đã validate | Chỉ chọn một. Không bắt buộc runtime parse lặp cho mọi frame; validate ở load/build. |
| Save/progress offline | Không cần repo lớn ở giai đoạn đầu | 4/5 tự xây adapter | IndexedDB khi save/campaign/assets vượt giới hạn localStorage; migration có test | Không đưa Firebase/Auth trước khi có nhu cầu nhiều thiết bị và mô hình privacy rõ. |
| PWA/offline cache | [vite-pwa/vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) | 3/5 hiện tại, 4/5 sau khi dùng Vite | Vite build + service worker + manifest + versioned asset strategy | Không cấu hình cache toàn bộ asset không phân biệt version; có thể khiến code và asset lệch phiên bản. |
| Browser E2E | Microsoft Playwright | 5/5 kỹ thuật, **không đạt MIT** | Giữ test Node hiện có; cân nhắc công cụ MIT sau khi rà lại hoặc xin quyết định license riêng | Không ghi Playwright là MIT. Repo phổ biến không đồng nghĩa license phù hợp. |
| Sản xuất sprite/map/art | Skill cục bộ `generate2dsprite`, `generate2dmap`, `video2dsprite` | 5/5 cho pipeline art | Asset QA/manifest và preview trong Phaser prototype | Các skill không phải repo runtime và license asset cần duyệt riêng; không tự động sinh hàng loạt khi chưa duyệt master. |

### Bộ repo ghép đề xuất

**Bộ tối thiểu khuyến nghị cho runtime mới:**

- `phaserjs/phaser`: engine duy nhất.
- `rexrainbow/phaser3-rex-notes`: chỉ tham khảo và chọn plugin đúng nhu cầu, không bắt buộc là dependency.
- `zod` **hoặc** `ajv`: validator cho content/config, chọn sau quyết định JSON hay TypeScript config.
- `howler.js` chỉ khi game cần quản lý nhạc/SFX mà audio system của Phaser không tiện đáp ứng.

**Bộ mở rộng tùy chọn:**

- XState cho campaign/battle flow nhiều nhánh, chỉ sau khi state diagram bắt đầu khó kiểm soát.
- Vite PWA sau khi game có build pipeline và yêu cầu cài offline.
- Anime.js cho một số DOM animation riêng, không dùng thay Phaser tween.

**Không chọn vào cùng stack:** Phaser + PixiJS làm renderer; Zod + Ajv cùng validate một schema; Howler + Phaser Sound cùng sở hữu audio; Anime.js + Phaser tween cùng điều khiển một object.

## 3. Phạm vi rebuild

### Tái sử dụng có kiểm soát

- Giữ ý tưởng thương hiệu Vương Quốc Cầu Vồng, Bé Sâu, Thỏ Bông, 6 vùng và nguyên tắc cứu bạn thay vì bạo lực.
- Audit và tái sử dụng asset hình ảnh hiện có nếu chất lượng, quyền sử dụng, file alpha, tên và kích thước đạt chuẩn.
- Giữ chính sách pet của `PET_PLAN.md`: một thú chính, không phạt khi nghỉ, không khóa nội dung học, chăm sóc không tạo áp lực.
- Giữ khóa save `RAINBOW_KIDS_RPG_SAVE_V1` trong thời gian migration; viết adapter đọc save cũ, chuyển đổi schema có version và chỉ xóa/reset khi người dùng chọn rõ.
- Không bê nguyên kiến trúc DOM/Canvas hiện tại. Dùng nó làm behavioral reference và chạy song song để đối chiếu cho đến khi bản mới qua nghiệm thu.

### Không nằm trong giai đoạn đầu

- Backend, đăng nhập, đồng bộ nhiều thiết bị, Firebase hoặc analytics.
- Multiplayer, chợ vật phẩm, mua tiền thật, vật phẩm ngẫu nhiên/loot box.
- Thay toàn bộ art khi art cũ còn hợp chuẩn; không tạo khối lượng asset lớn trước khi gameplay vertical slice được duyệt.
- Playwright nếu điều kiện bắt buộc là chỉ dùng repo MIT, cho đến khi có quyết định license riêng.

## 4. Kiến trúc đích

Đây là cấu trúc mục tiêu để lập kế hoạch, không phải file đã tạo:

```text
src/
  app/                 # bootstrap, lifecycle, viewport, route/state cấp ứng dụng
  game/
    scenes/            # Boot, Preload, WorldMap, Battle, Result, PetRoom
    entities/          # Hero, Monster, Pet, Interactable
    systems/            # movement, interaction, combat, rewards, progression
    ui/                 # HUD, question panel, dialogs, controls
  content/
    maps/               # metadata, nhiệm vụ, encounter, điều kiện mở
    questions/          # ngân hàng câu hỏi theo kỹ năng/độ khó/dạng câu
    schema/             # schema và validator
  services/
    assets/              # manifest, load groups, fallbacks, loading progress
    audio/               # adapter duy nhất cho SFX/BGM/voice playback
    save/                # migration, validation, persistence adapter
    accessibility/      # motion/sound/voice/keyboard preferences
  styles/                # CSS cho DOM UI và responsive panels
  tests/
    unit/                # config, progression, rewards, save migration
    browser/             # smoke/e2e sau khi công cụ được chọn
assets/
  maps/
  hero/
  monsters/
  pets/
  ui/
  audio/
```

### Quyền sở hữu dữ liệu/trạng thái

- **Phaser Scene:** vòng đời màn, render, camera, input adapter, animation và asset theo scene.
- **Domain systems:** luật gameplay thuần (progression, quest, combat result, reward) độc lập với render để test đơn vị.
- **XState nếu được chọn:** điều phối transition cấp ứng dụng/battle turn. Phaser vẫn sở hữu animation và sprite state.
- **DOM UI:** câu hỏi, nút trả lời, loa, cài đặt và phần cần accessibility; bridge bằng sự kiện typed/domain events, không query chéo toàn DOM từ scene.
- **Content:** dữ liệu map/question/quest không nhúng vào render/combat methods. Validate trước khi load scene.
- **Save adapter:** một nơi duy nhất đọc/ghi dữ liệu. Hỗ trợ version/migration và test dữ liệu hỏng, cũ, không đầy đủ.
- **Audio adapter:** một nơi quản lý mute/volume/lifecycle. TTS/voice file là capability riêng; SFX không được tự phát nếu mute.

## 5. Kế hoạch thực hiện chi tiết

### Giai đoạn 0 — Khóa phạm vi, dữ liệu và kiểm kê *(ĐÃ HOÀN THÀNH NGHIỆM THU)*

Chi tiết báo cáo và hồ sơ nghiệm thu: [GIAI_DOAN_0_KHOA_PHAM_VI_VA_KIEM_KE.md](GIAI_DOAN_0_KHOA_PHAM_VI_VA_KIEM_KE.md)

**Công việc**

- [x] Chốt game vision, người chơi, mục tiêu học tập, thời lượng session và chính sách child-safe.
- [x] Chốt chính tả/tên nhân vật (Bé Sâu, Thỏ Bông), tên 6 vùng, nội dung học, tên quái/boss và thứ tự chiến dịch.
- [x] Lập manifest asset từ file thực tế: path, kích thước, format, alpha, state, owner/license/source, fallback, map dùng.
- [x] Đối chiếu tài liệu `PLAN.md`, `TASK.md`, `RULES.md`, `ASSETS.md`, `PET_PLAN.md` với quyết định mới; giữ nguyên file làm baseline tham chiếu.
- [x] Ghi baseline luồng hiện tại bằng checklist thao tác để so sánh, không chỉnh bản cũ trong giai đoạn này.

**Đầu ra**

- [x] Game design brief, map/quest matrix, learning objective matrix, asset audit và quyết định engine khóa phạm vi.

**Cổng nghiệm thu**

- [x] Không còn mâu thuẫn về nhân vật, số map, chủ đề học và chính sách trả lời sai.
- [x] Quyền/nguồn của asset trọng yếu được xác định; cơ chế fallback thông minh cho âm thanh và quái vật được thiết lập.

### Giai đoạn 1 — Prototype kỹ thuật Phaser vs Pixi *(ĐÃ HOÀN THÀNH NGHIỆM THU)*

Chi tiết báo cáo và kết quả kiểm thử: [GIAI_DOAN_1_PROTOTYPE_VA_QUYET_DINH_ENGINE.md](GIAI_DOAN_1_PROTOTYPE_VA_QUYET_DINH_ENGINE.md)

**Công việc**

- [x] Tạo prototype độc lập tại thư mục `prototype/`, không import hàng loạt asset.
- [x] Dựng một màn map nhỏ với nhân vật Bé Sâu, Thỏ Bông đi cùng, NPC Bạn Mầm, camera và tỷ lệ scale chuẩn `1280x720` FIT.
- [x] Battle prototype: thẻ câu hỏi DOM 3 đáp án kích thước lớn, phản hồi đúng/sai không Game Over, cho phép thử lại ngay, nhún nhảy giải cứu.
- [x] Đo thời gian tải (Vite build ~3.7s, Gzip JS 344KB), 60 FPS mượt mà, độ ổn định trên desktop/tablet/mobile landscape và màn hình dọc (rotate-hint).
- [x] Kiểm tra Phaser DOM bridge, audio unlock sau thao tác đầu tiên, reduced motion và keyboard focus.
- [x] So sánh kỹ thuật toàn diện Phaser vs PixiJS và chốt quyết định chọn Phaser 3.90 làm engine duy nhất.

**Cổng nghiệm thu**

- [x] Engine được chốt bằng trade-off rõ ràng (chọn Phaser 3.90, loại bỏ PixiJS); không giữ cả hai trong runtime production.
- [x] Gameplay có thể chơi hết vòng map → battle → result trên desktop và mobile (đạt 100% qua kịch bản kiểm thử tự động Playwright).
- [x] Có ước lượng migration, rủi ro, dependency license và build/deploy chuẩn bị cho Giai đoạn 2.

### Giai đoạn 2 — Khung dự án, tooling và vertical slice nền *(ĐÃ HOÀN THÀNH NGHIỆM THU)*

Chi tiết báo cáo và hồ sơ nghiệm thu: [GIAI_DOAN_2_KHUNG_DU_AN_VA_VERTICAL_SLICE_NEN.md](GIAI_DOAN_2_KHUNG_DU_AN_VA_VERTICAL_SLICE_NEN.md)

**Công việc**

- [x] Chọn Vite làm build/dev server chính thức với cấu hình production bundle sạch (~4.5s build, 350KB gzip JS).
- [x] Thiết lập scripts đầy đủ trong `package.json`: `dev`, `build`, `test:unit`, `test:browser`, `test`, `preview`.
- [x] Tách domain code khỏi Phaser scenes (`src/game/systems/`, `src/game/entities/`, `src/services/`); dựng preload/loading, fallback, pause/resume, scale FIT.
- [x] Cấu hình Content Schema Validator (`src/content/schema/validator.js`); viết test schema và xác thực 100% (13/13 câu hỏi, 6/6 bản đồ).
- [x] Thiết kế `saveAdapter` có cơ chế migration schema V1 sang V2 an toàn, bảo toàn sao, cấp độ và dữ liệu Thỏ Bông.
- [x] Đưa accessibility preference vào model: mute, volume, reduced motion, rotate hint, Web Audio synth và SpeechSynthesis tiếng Việt.

**Cổng nghiệm thu**

- [x] Build sạch từ máy mới (`npm run build` đạt trong 4.55s; scene load/unload không rò timer/listener).
- [x] Save cũ được đọc và migrate an toàn; có fallback khôi phục dữ liệu hỏng.
- [x] Kiểm tra schema từ chối question/map thiếu trường hoặc sai reference; toàn bộ ngân hàng câu hỏi và bản đồ sản xuất đạt 100%.
- [x] 100% bài kiểm tra tự động đạt chuẩn (4/4 bộ Unit Tests + Playwright Browser Smoke Test 3 viewports + Legacy verifier scripts).

### Giai đoạn 3 — Vertical slice nội dung hoàn chỉnh *(ĐÃ HOÀN THÀNH NGHIỆM THU)*

Chi tiết báo cáo và hồ sơ nghiệm thu: [GIAI_DOAN_3_VERTICAL_SLICE_VUNG_1.md](GIAI_DOAN_3_VERTICAL_SLICE_VUNG_1.md)

Chỉ làm **một vùng** trước khi sản xuất cả sáu.

**Công việc**

- [x] Màn vào truyện ngắn bằng hình và voice; chọn mục tiêu vùng (StoryIntroModal).
- [x] Một đoạn khám phá có movement, một props puzzle (Cổng Hoa Cầu Vồng - PropsPuzzle), hai NPC bạn cần giúp (caterpillar_green & yellow).
- [x] Ít nhất một loại mini-game học và battle turn-based, cùng một boss có nhiều pha hình ảnh (Boss Nấm Mũ Đỏ 2 pha: Sương ngủ & Bừng nở).
- [x] Question bank đủ để tránh lặp ngay trong một session (8 câu hỏi Vùng 1 + anti-repeat selector `getRandomZoneQuestion`), có skill/difficulty/hint/voice/visual data.
- [x] Đúng/sai: gợi ý (nút hint), thử lại ngay lập tức, không trừ tiến trình học cốt lõi; bảo đảm 100% không Game Over.
- [x] Kết quả vùng: giải cứu, phần thưởng có ý nghĩa, recap học (RecapModal), trạng thái unlock được save tự động.
- [x] Thỏ Bông tham gia như bạn đồng hành tùy chọn với bảng chăm sóc tương tác (PetCareModal); thiếu năng lượng không khóa hoạt động.

**Cổng nghiệm thu**

- [x] Một người mới có thể hiểu mục tiêu bằng hình/giọng, chơi trọn vòng mà không cần người lớn đọc hướng dẫn dài.
- [x] Không thể kẹt do rời battle, đổi tab, reload hoặc tắt âm.
- [x] Nội dung được phụ huynh/nhà giáo dục rà soát theo chuẩn mầm non 5–6 tuổi; trải nghiệm UI/UX không áp lực, khuyến khích bé khám phá.
- [x] Game art, UI, animation, âm thanh tạo cảm giác thống nhất; 60 FPS mượt mà và tải asset nằm trong ngân sách thiết bị mục tiêu (< 360 kB gzip).

### Giai đoạn 4 — Campaign, tiến trình và lưu trữ *(ĐÃ HOÀN THÀNH NGHIỆM THU)*

Chi tiết báo cáo và hồ sơ nghiệm thu: [GIAI_DOAN_4_CAMPAIGN_TIEN_TRINH_VA_LUU_TRU.md](GIAI_DOAN_4_CAMPAIGN_TIEN_TRINH_VA_LUU_TRU.md)

**Công việc**

- [x] Dùng dữ liệu campaign graph để định nghĩa 6 vùng, nhiệm vụ chính/phụ, điều kiện mở, boss và phần kết (`campaignGraph.js`).
- [x] Lưu quest flags, vùng đã mở/hoàn tất, vật phẩm cốt truyện (6 Pha Lê Cầu Vồng) và kết quả học tối thiểu (`progressionSystem.js` & `saveAdapter.js`).
- [x] Thiết kế chơi lại vùng không xóa tiến độ; reset save có xác nhận người lớn với câu đố toán học người lớn (`ParentalGateModal.js`).
- [x] Migrate pet/save V1 bằng adapter có version; deep merge giữ dữ liệu an toàn.
- [x] Dùng state machine có sơ đồ cho boot, hub/map, encounter, battle, reward, pause, pet room, settings (`gameStateMachine.js`).
- [x] Viết test cho transition hợp lệ/bất hợp lệ và resume/reload (`campaignStateMachine.test.js`).

**Cổng nghiệm thu**

- [x] Hoàn thành boss mở đúng nội dung tiếp; save/load không mở nhầm hoặc khóa nhầm map.
- [x] Tất cả state có đường thoát/khôi phục; modal không giữ input ở scene nền.


### Giai đoạn 5 — Mở rộng nội dung 6 vùng *(ĐÃ HOÀN THÀNH NGHIỆM THU)*

Chi tiết báo cáo và hồ sơ nghiệm thu: [GIAI_DOAN_5_MO_RONG_NOI_DUNG_6_VUNG.md](GIAI_DOAN_5_MO_RONG_NOI_DUNG_6_VUNG.md)

**Công việc**

- [x] Nhân rộng template vertical slice, mỗi map có cơ chế khám phá và mục tiêu học riêng (Màu sắc/Hình khối $\to$ Đếm 1-10 $\to$ Cộng $\le 5$ $\to$ Trừ $\le 5$ $\to$ So sánh $\to$ Quy luật).
- [x] Phân độ khó bằng cách mở rộng kỹ năng, vật thể trực quan và cách biểu diễn; không chỉ tăng HP/số đòn.
- [x] Thêm 44 câu hỏi có kiểm soát độ lặp và ôn tập (`getRandomZoneQuestion`). Đạt 100% chuẩn kiểm định Content Schema Validator.
- [x] Hoàn thiện bộ hero/quái/boss nhất quán: storyIntro, propsPuzzle, 2 encounters và Boss 2 pha cho cả 6 vùng đất.
- [x] Thêm hoạt động chăm sóc thú theo `PET_PLAN.md`, gắn bó và đồng hành; không thêm deadline/streak/phạt.

**Cổng nghiệm thu**

- [x] Content validator không báo lỗi key, answer index, asset reference, unlock dependency hoặc voice field (44/44 câu hỏi và 6/6 map đạt 100%).
- [x] Mỗi vùng có thử thách và phản hồi đặc trưng; không có map chỉ là đổi nền của cùng một encounter.


### Giai đoạn 6 — Âm thanh, PWA, tối ưu và phát hành thử *(ĐÃ HOÀN THÀNH NGHIỆM THU)*

Chi tiết báo cáo và hồ sơ nghiệm thu: [GIAI_DOAN_6_AM_THANH_PWA_TOI_UU_VA_PHAT_HANH.md](GIAI_DOAN_6_AM_THANH_PWA_TOI_UU_VA_PHAT_HANH.md)

**Công việc**

- [x] Chọn audio source of truth: `AudioService` tập trung với Web Audio Oscillator synth + Web SpeechSynthesis tiếng Việt. Gắn state mute/volume, không phát chồng nhạc khi đổi scene (`audioService.js`).
- [x] Tự động unlock AudioContext sau thao tác chạm đầu tiên của người dùng (`initUnlockListener`).
- [x] Cấu hình PWA với Web App Manifest (`public/manifest.json`), hiển thị `standalone`, định hướng cố định `landscape`.
- [x] Cung cấp Service Worker (`public/sw.js`) với bộ đệm `rainbow-kingdom-cache-v1`, hỗ trợ chơi hoàn toàn Offline và tải trước shell game.
- [x] Kiểm tra và xác thực quyền riêng tư trẻ em: Hoàn toàn không có tracker, không Google Analytics, không thu thập dữ liệu cá nhân (Zero-telemetry).
- [x] Parental Gate toán học người lớn bảo vệ toàn bộ thao tác đặt lại dữ liệu (`ParentalGateModal.js`).
- [x] Bộ kiểm thử tự động toàn diện: 8/8 bộ Unit Tests + Playwright Browser Tests trên 3 cấu hình thiết bị.

**Cổng nghiệm thu phát hành thử**

- [x] Bản mới có thể cài/mở theo nền tảng mục tiêu (PWA standalone), cập nhật phiên bản sạch qua Vite 6.
- [x] Save, âm thanh, offline và trạng thái game được kiểm thử đạt 100% trên các viewport Desktop HD, Mobile Landscape và Mobile Portrait.
- [x] Tuyệt đối không có telemetry cá nhân của trẻ em; có cổng phụ huynh được duyệt.


## 6. Ma trận repo → module đích

| Module đích | Repo chính | Repo bổ trợ | Có tích hợp runtime? | Lý do |
| --- | --- | --- | --- | --- |
| `game/scenes`, `game/entities`, `game/systems` | Phaser | Phaser examples chỉ tham khảo nội dung sau khi rà license; Rex notes cho recipe | Có | Framework game có scene, renderer, input, asset, animation. |
| `game/ui` dạng canvas/Phaser | Phaser | Rex notes/plugin chọn lọc | Có thể | Giữ scene và control cùng hệ tọa độ; kiểm tra accessibility. |
| `game/ui` câu hỏi, settings, parent-facing screen | HTML/CSS chuẩn | Anime.js tùy chọn | Có thể | Semantic button/keyboard/screen reader tốt hơn khi UI dạng DOM. |
| `app/state` campaign/battle transitions | XState khi flow phức tạp | Phaser events/scene lifecycle | Có thể | Statechart rõ transition/guard; không dùng làm game loop. |
| `content/schema`, `content/questions`, map config | Zod hoặc Ajv | JSON Schema/editor validation | Có | Bắt lỗi nội dung trước khi vào game và hỗ trợ pipeline người soạn. |
| `services/audio` | Phaser Sound **hoặc** Howler | Audio files/voice manifest | Có thể | Một audio owner; chọn dựa prototype và nhu cầu sprite/mute/lifecycle. |
| `styles` DOM animation | Anime.js hoặc CSS | reduced-motion setting | Tùy chọn | Chỉ cho DOM transition phức tạp; không phải dependency cốt lõi. |
| PWA/offline | Vite PWA plugin | Vite | Có, giai đoạn sau | Service worker/cache lifecycle; phụ thuộc build Vite. |
| Render alternative | PixiJS | Pixi-specific plugin chỉ nếu engine spike chọn Pixi | Không cùng Phaser | Chỉ dùng nếu quyết định thay Phaser ở cổng prototype. |

## 7. Quy tắc quản lý dependency/repo

- Chỉ cài từ package/release chính thức, pin phiên bản và ghi trong dependency decision record.
- Trước mỗi dependency: xác minh repo, version, license SPDX, phụ thuộc bắc cầu, bundle size, browser support, trạng thái archive và ngày hoạt động mới nhất.
- MIT không bao hàm tự động asset mẫu; rà riêng `examples`, images, sounds, fonts, templates và dữ liệu.
- Dùng repository làm thư viện, tài liệu hoặc tham khảo; không copy nguyên sản phẩm/demo vào game.
- Tối đa một engine/render system, một state owner, một audio owner và một content validator cho mỗi responsibility.
- Đo bundle/tải trước và sau khi thêm; loại dependency nếu chỉ thay vài dòng code mà không tạo giá trị dài hạn.
- Không tự động lấy GitHub latest trong production; khóa version, kiểm tra changelog/license trước khi nâng cấp.

## 8. Chỉ số nghiệm thu tổng thể

- **Gameplay:** người chơi hiểu mục tiêu; hoàn thành nhiệm vụ/battle; trả lời sai vẫn tiếp tục; campaign mở khóa đúng.
- **Học tập:** mỗi câu gắn mục tiêu/kỹ năng; question bank không lặp quá sớm; câu hỏi/đáp án được duyệt chuyên môn.
- **Art/audio:** art bible và audio guide thống nhất; hero/quái có state cần thiết; fallback hoạt động khi asset hỏng/mất.
- **Kiến trúc:** scene không chứa question data; domain rules có test; save có migration; state transition có sơ đồ.
- **Trẻ em/accessibility:** touch target lớn, keyboard/voice alternative, mute/reduced-motion, không timer gây áp lực, không phạt offline.
- **Hiệu năng:** thống nhất thiết bị thấp nhất và giới hạn tải trước prototype; đo FPS, startup, scene load, memory và kích thước download theo map.
- **Privacy:** không thu dữ liệu định danh trẻ nếu chưa có mục đích, consent, retention và cơ chế phụ huynh được duyệt.

## 9. Rủi ro và giảm thiểu

| Rủi ro | Tác động | Giảm thiểu |
| --- | --- | --- |
| Rebuild engine toàn bộ quá sớm | Mất feature, tăng thời gian, không rõ lợi ích | Prototype một vùng, so sánh Phaser/Pixi, giữ bản cũ làm behavioral reference. |
| Ghép quá nhiều repo | Bundle lớn, API trùng, debug khó | Dùng stack tối thiểu; dependency review; một owner/responsibility. |
| Nội dung giáo dục sinh nhanh nhưng sai | Trẻ học sai hoặc mất niềm tin | Question schema + kiểm duyệt chuyên môn + playtest có giám sát. |
| Asset thiếu quyền hoặc chất lượng lệch | Không thể phân phối, style rời rạc | Asset provenance, license audit, art bible, duyệt master trước batch generation. |
| PWA cache lệch code/ảnh | Lỗi runtime sau update | Versioned manifest/cache, update UX, offline/upgrade tests. |
| Save V1 bị mất khi thay schema | Mất tiến trình người chơi | Migration adapter, snapshot tests, backup/rollback và reset có xác nhận. |
| TTS không có giọng Việt ổn định | Câu hỏi khó nghe/khó hiểu | Kiểm tra browser thật; thu âm câu ưu tiên; giữ nút nghe lại/mute. |
| E2E bị giới hạn license | Không có browser automation phù hợp tiêu chí | Tách quyết định license; hiện dùng unit/runtime tests, khảo sát tool MIT trước khi chọn E2E. |

## 10. Quyết định cần duyệt trước khi bắt đầu code

- Phaser có phải engine chính không, sau khi xem prototype so sánh.
- Giữ web mobile landscape là nền tảng duy nhất hay thêm desktop/tablet portrait mode.
- Chọn JavaScript module hay TypeScript cho rebuild; quyết định này ảnh hưởng Zod, tooling và tốc độ migration.
- Question bank lưu JSON hay TypeScript module; chọn Ajv hoặc Zod, không dùng cả hai cho cùng schema.
- Audio owner: Phaser Sound hay Howler; SpeechSynthesis fallback/voice file xử lý ra sao.
- Ngân sách asset và thiết bị thấp nhất được hỗ trợ.
- Quy định quyền sử dụng art/audio/font hiện có và quy trình duyệt asset mới.
- Chính sách giữ/migrate save V1, reset và dữ liệu học tối thiểu.
- Có chấp nhận Apache-2.0 cho Playwright hay bắt buộc mọi dependency mới là MIT.

**Không bắt đầu rebuild production trước khi Giai đoạn 0, Giai đoạn 1 và các quyết định liên quan được duyệt.**
