# ClassQuest RPG Manager v1.9.0

ClassQuest là website quản lý lớp học theo phong cách RPG, gồm cổng giáo viên và cổng học viên riêng. Giao diện chính đã được Việt hóa, có Quest Map, nhân vật, 54 kỹ năng, điểm XP/Gold, biệt đội, cửa hàng và bài nộp.

## Điểm mới của bản Public Ready

- Học viên đăng nhập bằng email hoặc tên tài khoản trên mọi thiết bị.
- Giáo viên tạo hoặc kích hoạt tài khoản học viên ngay trong trang quản lý lớp.
- Tài khoản học viên mới dùng mật khẩu mặc định `123456789` và bắt buộc đổi mật khẩu trước khi được tải dữ liệu lớp hoặc nộp bài.
- Mỗi học viên chỉ tải một bản dữ liệu đã lọc riêng; mật khẩu và ghi chú nội bộ không nằm trong dữ liệu học viên.
- Source không chứa Firebase config thật, service-account key hoặc dữ liệu lớp riêng tư; dữ liệu mẫu chỉ dùng để minh họa giao diện.
- Đã kèm bộ skin nhân vật trong `public/assets/skins`.
- Dùng Hash Router và đường dẫn asset tương đối để chạy ổn trên GitHub Pages.
- Có GitHub Actions tự build và deploy sau mỗi lần push lên nhánh `main`.
- Không cần Firebase Storage trả phí: học viên có thể nộp đường dẫn/văn bản hoặc xác nhận đã gửi minh chứng qua Zalo, Messenger hay ứng dụng khác.

## Chạy trên máy

Yêu cầu Node.js 20 trở lên.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Điền năm biến `VITE_FIREBASE_*` trong `.env.local` trước khi đăng nhập. File `.env.local` đã được chặn bởi `.gitignore` và không được commit.

## Chuẩn bị Firebase

1. Bật Google và Email/Password trong Firebase Authentication.
2. Thêm domain GitHub Pages vào Authentication → Settings → Authorized domains.
3. Publish `firebase/firestore.rules`. Rules này cho phép mọi tài khoản Google đã xác minh tự tạo workspace giáo viên riêng, không cần danh sách lời mời.
4. Với học viên cũ chưa có tài khoản online, nhấn **Kích hoạt**. Tài khoản mới dùng mật khẩu mặc định `123456789` và phải đổi ngay trong lần đăng nhập đầu.
5. Khi bài làm nằm ngoài ClassQuest, học viên đánh dấu đã gửi minh chứng qua Zalo/ứng dụng khác; giáo viên sẽ thấy xác nhận này trong mục duyệt bài.

Nếu Firebase project đang dùng chung với ứng dụng khác, không ghi đè toàn bộ Firestore Rules. Hãy ghép các block `mhp*` vào bộ rules hiện hành rồi kiểm thử tất cả ứng dụng trước khi publish.

## Deploy GitHub Pages

Trong repository GitHub:

1. Vào Settings → Secrets and variables → Actions.
2. Tạo các repository secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. Vào Settings → Pages và chọn Source là **GitHub Actions**.
4. Push lên nhánh `main`. Workflow `Deploy ClassQuest to GitHub Pages` sẽ build và xuất bản website.

Firebase Web API key sẽ xuất hiện trong bundle chạy trên trình duyệt theo thiết kế của Firebase; an toàn dữ liệu phụ thuộc vào Authentication và Firestore Rules. Không đưa service-account key hoặc Admin SDK secret vào repository hay GitHub Pages.

Có thể publish Rules bằng Firebase CLI: `firebase deploy --only firestore:rules`.

## Dữ liệu và quyền truy cập

Workspace đầy đủ chỉ dành cho giáo viên sở hữu. Mỗi học viên nhận một bản dữ liệu đã lọc theo tài khoản của mình; mật khẩu và ghi chú nội bộ không được đưa vào bản dữ liệu này.

Giáo viên đăng nhập bằng Google và tự động có workspace riêng. Học viên đăng nhập bằng email hoặc username với mật khẩu mặc định `123456789`, sau đó phải đổi mật khẩu trước khi truy cập dữ liệu lớp. Hãy gửi thông tin đăng nhập qua kênh riêng.

## Nhân vật và Skill Tree

- 6 hệ nhân vật: Chiến Binh, Pháp Sư, Tu Sĩ, Thám Hiểm, Hộ Vệ và Thi Sĩ.
- Mỗi hệ có 9 kỹ năng; tổng cộng 54 kỹ năng.
- Mốc kỹ năng: cấp 1, 5, 10, 15, 20, 25, 30, 35 và 40.
- Mốc giáp: cấp 1, 10, 20, 30 và 40.
- Cấp tối đa: 40.

## Kiểm tra trước khi public

```bash
npm ci
npm run check
```

Không commit `.env.local`, `node_modules`, `dist`, service-account JSON hoặc file xuất dữ liệu Firebase.
