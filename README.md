# ClassQuest RPG Manager v1.9.0

ClassQuest là website quản lý lớp học theo phong cách RPG, gồm cổng giáo viên và cổng học viên riêng. Giao diện chính đã được Việt hóa, có Quest Map, nhân vật, 72 kỹ năng, điểm XP/Gold, biệt đội, cửa hàng và bài nộp.

## Điểm mới của bản Public Ready

- Học viên đăng nhập bằng Firebase Email/Password trên mọi thiết bị.
- Giáo viên tạo hoặc kích hoạt tài khoản học viên ngay trong trang quản lý lớp.
- Mỗi học viên chỉ tải một bản dữ liệu đã lọc riêng; mật khẩu và ghi chú nội bộ không nằm trong dữ liệu học viên.
- Source không chứa Firebase config thật, dữ liệu lớp thật hoặc tài khoản demo.
- Đã kèm bộ ảnh nhân vật trong `src/assets/character`.
- Dùng Hash Router và đường dẫn asset tương đối để chạy ổn trên GitHub Pages.
- Có GitHub Actions tự build và deploy sau mỗi lần push lên nhánh `main`.

## Chạy trên máy

Yêu cầu Node.js 20 trở lên.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Điền sáu biến `VITE_FIREBASE_*` trong `.env.local` trước khi đăng nhập. File `.env.local` đã được chặn bởi `.gitignore` và không được commit.

## Chuẩn bị Firebase

1. Bật Google và Email/Password trong Firebase Authentication.
2. Thêm domain GitHub Pages vào Authentication → Settings → Authorized domains.
3. Publish `firebase/firestore.rules`. Rules này cho phép mọi tài khoản Google đã xác minh tự tạo workspace giáo viên riêng, không cần danh sách lời mời.
4. Áp dụng `firebase/storage.rules` trước khi bật nộp bài bằng hình ảnh. Ảnh mới được lưu trong Firebase Storage; Firestore chỉ giữ URL và metadata nhỏ.
5. Với học viên cũ chưa có tài khoản online, mở phần **Sửa học viên**, đặt mật khẩu tạm từ 8 ký tự rồi lưu. Học viên mới được tạo tài khoản online tự động.

## Deploy GitHub Pages

Trong repository GitHub:

1. Vào Settings → Secrets and variables → Actions.
2. Tạo các repository secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. Vào Settings → Pages và chọn Source là **GitHub Actions**.
4. Push lên nhánh `main`. Workflow `Deploy ClassQuest to GitHub Pages` sẽ build và xuất bản website.

Firebase Web API key sẽ xuất hiện trong bundle chạy trên trình duyệt theo thiết kế của Firebase; an toàn dữ liệu phụ thuộc vào Authentication, Firestore Rules và Storage Rules. Không đưa service-account key hoặc Admin SDK secret vào repository hay GitHub Pages.

Có thể publish riêng Firestore Rules bằng Firebase CLI: `firebase deploy --only firestore:rules`.

## Dữ liệu và quyền truy cập

Workspace đầy đủ chỉ dành cho giáo viên sở hữu. Mỗi học viên nhận một bản dữ liệu đã lọc theo tài khoản của mình; mật khẩu và ghi chú nội bộ không được đưa vào bản dữ liệu này.

Giáo viên đăng nhập bằng Google và tự động có workspace riêng. Học viên đăng nhập bằng username được tạo tự động và mật khẩu tạm riêng. Hãy gửi thông tin này qua kênh riêng cho từng học viên.

## Nhân vật và Skill Tree

- 6 hệ nhân vật: Chiến Binh, Pháp Sư, Tu Sĩ, Thám Hiểm, Hộ Vệ và Thi Sĩ.
- Mỗi hệ có 12 kỹ năng; tổng cộng 72 kỹ năng.
- Mốc kỹ năng: cấp 1, 8, 15 và 25.
- Mốc giáp: cấp 4, 10, 16, 22 và 28.
- Cấp tối đa: 30.

## Kiểm tra trước khi public

```bash
npm ci
npm run build
```

Không commit `.env.local`, `node_modules`, `dist`, service-account JSON, file xuất dữ liệu Firebase hoặc ảnh/bài nộp riêng của học viên.
