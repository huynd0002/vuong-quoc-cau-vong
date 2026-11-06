# HƯỚNG DẪN ĐƯA GAME "VƯƠNG QUỐC CẦU VỒNG" LÊN ONLINE CHO BÉ CHƠI

Game được xây dựng dưới dạng **Web App tĩnh (Phaser 3 + HTML5 + PWA)**, toàn bộ dữ liệu lưu trữ trên trình duyệt của bé (LocalStorage) và không cần máy chủ cơ sở dữ liệu. Do đó, việc đưa game lên online là **100% MIỄN PHÍ**, cực kỳ an toàn, có sẵn HTTPS chuẩn quốc tế để cài đặt thành App trên iPad / Máy tính bảng.

Dưới đây là 4 phương án từ dễ nhất đến nâng cao:

---

## 🌟 PHƯƠNG ÁN 1: Kéo thả lên Netlify Drop (NHANH NHẤT - 10 GIÂY CÓ LINK NGAY)
> Phù hợp nhất nếu bạn muốn có ngay link web để gửi cho bé chơi trên iPad/điện thoại mà không cần biết lập trình hay cài đặt gì thêm.

### Các bước thực hiện:
1. Chạy lệnh đóng gói bản web trên máy tính (nếu vừa sửa game):
   ```bash
   npm run build:web
   ```
2. Thư mục `dist` trong dự án chính là toàn bộ sản phẩm hoàn chỉnh của game.
3. Mở trình duyệt web và truy cập vào: **[https://app.netlify.com/drop](https://app.netlify.com/drop)**
4. Dùng chuột **kéo thả thư mục `dist`** vào vòng tròn trên trang Netlify.
5. Sau 5–10 giây, Netlify sẽ cấp ngay một đường link miễn phí (ví dụ: `https://rainbow-game-xyz.netlify.app`).
6. Bạn có thể đổi tên link dễ nhớ trong phần *Site configuration > Change site name* (ví dụ: `vuong-quoc-cau-vong.netlify.app`).

---

## 🚀 PHƯƠNG ÁN 2: Tự động hoá qua GitHub + Vercel / Netlify (CHUYÊN NGHIỆP - TỰ CẬP NHẬT)
> Phù hợp nhất nếu bạn muốn mỗi khi chỉnh sửa câu hỏi hay cập nhật tính năng mới thì web online sẽ tự động cập nhật ngay lập tức.

### Các bước thực hiện:
1. Đẩy mã nguồn lên tài khoản **GitHub** của bạn (tạo một repository mới, ví dụ: `vuong-quoc-cau-vong`).
2. Đăng nhập vào **[Vercel](https://vercel.com)** hoặc **[Netlify](https://netlify.com)** (đăng nhập bằng tài khoản GitHub).
3. Bấm nút **Add New Project** (hoặc *Import from Git*) và chọn repository vừa đẩy lên.
4. Dự án đã được cấu hình sẵn sẵn sàng các file `vercel.json` và `netlify.toml`:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build:web`
   - **Output Directory:** `dist`
5. Bấm **Deploy**. Sau 1 phút, bạn sẽ có link chính thức chuẩn HTTPS vĩnh viễn.

---

## 🌐 PHƯƠNG ÁN 3: Firebase Hosting (GOOGLE CLOUD - TỐC ĐỘ CAO & BẢO MẬT)
> Hạ tầng CDN của Google cực kỳ mượt mà tại Việt Nam.

### Các bước thực hiện:
1. Cài đặt Firebase CLI (nếu chưa có):
   ```bash
   npm install -g firebase-tools
   ```
2. Đăng nhập tài khoản Google:
   ```bash
   firebase login
   ```
3. Khởi tạo dự án (dự án đã có sẵn file `firebase.json` chuẩn):
   ```bash
   firebase use --add
   ```
4. Đẩy game lên online:
   ```bash
   npm run build:web
   firebase deploy --only hosting
   ```
5. Nhận link truy cập dạng `https://[ten-du-an].web.app`.

---

## 🏠 PHƯƠNG ÁN 4: Chơi qua mạng Wi-Fi gia đình (KHÔNG CẦN INTERNET / KHÔNG CẦN TẠO TÀI KHOẢN)
> Cho bé cầm iPad/máy tính bảng kết nối cùng mạng Wi-Fi với máy tính của bạn để chơi ngay lập tức.

### Các bước thực hiện:
1. Mở cửa sổ dòng lệnh tại thư mục game và chạy:
   ```bash
   npm run preview
   ```
2. Màn hình sẽ hiển thị địa chỉ IP mạng nội bộ của bạn, ví dụ:
   ```text
   ➜  Network: http://192.168.1.15:4173/
   ```
3. Lấy iPad hoặc máy tính bảng của bé mở Safari / Chrome và gõ địa chỉ trên vào: `http://192.168.1.15:4173/`.
4. Bé có thể chơi mượt mà ngay trong mạng gia đình.

---

## 📱 CÁCH CÀI ĐẶT THÀNH APP TOÀN MÀN HÌNH TRÊN IPAD / TABLET (PWA INSTALL)
Khi mở game trên link online (có HTTPS):

- **Trên iPad / iPhone (Safari):**
  1. Mở link game trên Safari.
  2. Bấm vào biểu tượng **Chia sẻ** (hình ô vuông có mũi tên chỉ lên ở thanh công cụ Safari).
  3. Cuộn xuống và chọn **"Thêm vào Màn hình chính" (Add to Home Screen)**.
  4. Bấm **Thêm (Add)**.
  - *Kết quả:* Icon game Bé Sâu Cầu Vồng sẽ xuất hiện ngay trên màn hình chính như một app tải từ App Store. Khi bé bấm vào, game mở full màn hình không có thanh URL trình duyệt, không lo bé bấm thoát ra ngoài.

- **Trên Máy tính bảng Android (Chrome):**
  1. Mở link game trên Chrome.
  2. Bấm vào nút **3 chấm** ở góc trên bên phải.
  3. Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào màn hình chính"**.
  - *Kết quả:* App game được cài đặt trực tiếp vào máy, chơi mượt mà và tự lưu offline.
