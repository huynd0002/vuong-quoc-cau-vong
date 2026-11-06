# 🌈 VƯƠNG QUỐC CẦU VỒNG - GAME HỌC TOÁN 5-6 TUỔI

> **Game phiêu lưu giáo dục 2D tương tác dành cho trẻ mầm non 5-6 tuổi.**  
> Khám phá màu sắc, hình khối, số đếm, tư duy toán học, nấu ăn dinh dưỡng, câu cá thư giãn và chăm sóc thú cưng.

---

## 🎮 Cách Chơi Ngay (Portable Offline)

- **Mở trực tiếp:** Nhấp đúp chuột vào file [`game.html`](./game.html) trên máy tính bằng trình duyệt Google Chrome, Edge hoặc Safari.
- **Hoàn toàn Offline 100%:** Toàn bộ mã nguồn, hình ảnh giao diện, hiệu ứng âm thanh và nhạc nền đã được nhúng đóng gói trọn vẹn trong file duy nhất. Không cần cài đặt máy chủ (Node.js), không cần kết nối mạng Internet.
- **Lưu trữ dữ liệu an toàn:** Tiến trình chơi, Sao tích lũy, huy hiệu và đồ đạc được lưu tự động trong `localStorage` của trình duyệt trên máy bé chơi.

---

## 🛠 Hướng Dẫn Phát Triển (Developer Guide)

### Cài Đặt Ban Đầu
```bash
npm install
```

### Lệnh Thường Dùng
- **Mở môi trường phát triển (Vite Dev Server):**
  ```bash
  npm run dev
  ```
  Truy cập `http://localhost:5173` để trải nghiệm với tính năng Hot Module Reload (HMR).

- **Đóng gói ra bản game độc lập (`game.html`):**
  ```bash
  npm run build
  ```
  Tự động đọc `dev.html`, nén ESBuild, nhúng toàn bộ ảnh/audio trong `assets/` dưới dạng base64 portable.

- **Chạy toàn bộ 14 bộ Unit Tests:**
  ```bash
  npm run test:unit
  ```

- **Kiểm thử giao diện & tính năng tự động (Playwright):**
  ```bash
  npm run test:browser
  npm run test:pet-stations
  npm run test:kitchen
  ```

---

## 📁 Cấu Trúc Thư Mục Chuẩn Hóa

```text
GAME_HỌC/
├── assets/                 # Toàn bộ tài nguyên gốc (audio, hình ảnh, sprite nhân vật, UI)
│   ├── audio/              # Nhạc nền BGM & hiệu ứng âm thanh SFX (100% CC0)
│   ├── cooking/            # Nguyên liệu & món ăn
│   ├── edu/                # Hình ảnh câu hỏi, con vật, hình khối, hoa quả
│   ├── fashion/            # Trang phục & phụ kiện thời trang
│   ├── fishing/            # Cần câu, mồi câu & các loài cá
│   ├── hero/               # Spritesheet & animation nhân vật Bé Sam
│   ├── items/              # Balo & vật phẩm túi đồ
│   ├── maps/               # Bản đồ nền & cảnh quan các vùng đất
│   ├── monsters/           # Quái vật tinh thể & đối thủ đấu trí
│   ├── pets/               # Hoạt ảnh Bé Cún Vàng
│   └── ui/                 # Giao diện nút bấm 3D, khung viền, icon
├── docs/                   # Tài liệu thiết kế, kế hoạch, triển khai & báo cáo
│   ├── deployment/         # Hướng dẫn đưa game lên online (Vercel, Netlify, Firebase)
│   ├── plans/              # Kế hoạch phát triển các giai đoạn
│   ├── reports/            # Báo cáo kỹ thuật & tối ưu
│   └── specs/              # Đặc tả cơ chế, quy chuẩn game & nuôi thú
├── public/                 # File định danh PWA tĩnh (manifest.json, sw.js)
├── scripts/                # Kịch bản build & công cụ tự động hóa
│   ├── build-portable.mjs  # Bộ đóng gói game.html portable độc lập
│   ├── download-free-audio.mjs # Script cập nhật kho âm thanh CC0
│   └── archive/            # Lưu trữ các script di chuyển & sinh tài nguyên cũ
├── src/                    # Toàn bộ mã nguồn trò chơi (ES Modules)
│   ├── app/                # Điểm khởi chạy (main.js)
│   ├── content/            # Ngân hàng 125+ câu hỏi, cấu hình 6 map, công thức bếp
│   ├── game/               # Phaser Scenes, thực thể, hệ thống minigame & UI Modal
│   ├── services/           # Âm thanh (Web Audio), lưu trữ (SaveAdapter), PWA
│   ├── styles/             # CSS giao diện & hiệu ứng hoạt hình
│   └── tests/              # Bộ Unit Tests & Browser Tests tự động
├── dev.html                # Template HTML dùng cho môi trường dev & build
├── game.html               # File Game hoàn chỉnh (Mở chơi ngay lập tức)
├── index.html              # Entrypoint chuyển tiếp
├── package.json            # Cấu hình dự án & scripts npm
└── README.md               # Tài liệu tổng quan dự án
```

---

## 📚 Tra Cứu Tài Liệu Chi Tiết

Xem thêm chi tiết thiết kế hệ thống trong thư mục [`docs/`](./docs/):
- **Hướng Dẫn Đưa Game Lên Online:** [`docs/deployment/HUONG_DAN_DUA_GAME_LEN_ONLINE.md`](./docs/deployment/HUONG_DAN_DUA_GAME_LEN_ONLINE.md)
- **Nuôi Thú Cưng:** [`docs/specs/he-thong-nuoi-thu.md`](./docs/specs/he-thong-nuoi-thu.md)
- **Hồ Câu & Chợ Cầu Vồng:** [`docs/plans/FISHING_PLAN.md`](./docs/plans/FISHING_PLAN.md)
- **Phố Thời Trang:** [`docs/plans/FASHION_MAP_PLAN.md`](./docs/plans/FASHION_MAP_PLAN.md)
- **Bếp Cầu Vồng:** [`docs/plans/COOKING_PLAN.md`](./docs/plans/COOKING_PLAN.md)
- **Kế Hoạch Tổng Thể:** [`docs/plans/KE_HOACH_REBUILD_GAME.md`](./docs/plans/KE_HOACH_REBUILD_GAME.md)
