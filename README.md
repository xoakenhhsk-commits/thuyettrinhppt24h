# PPT 24h - Dịch Vụ Thiết Kế Bài Thuyết Trình PowerPoint

Website fullstack thương mại dịch vụ bán bài thuyết trình PowerPoint (PPT) chuyên nghiệp, tối ưu chi phí với 100% dịch vụ miễn phí (Next.js 16 App Router + Supabase Free + SePay Free + Vercel Free).

---

## 🌟 Tính Năng Nổi Bật

1. **Khách hàng**:
   - Đăng ký / đăng nhập bảo mật với đầy đủ họ tên, email, mật khẩu, số điện thoại Việt Nam và Zalo.
   - Luồng đặt hàng 2 bước nhanh gọn (gõ nội dung yêu cầu hoặc tải file tài liệu .docx, .pdf, .txt tối đa 10 MB).
   - Bảng giá minh bạch (Tiêu chuẩn: 30.000đ - 3 ngày; Hỏa tốc: 50.000đ - 24 giờ).
   - Thanh toán tự động bằng mã VietQR, tự động nhận diện giao dịch qua Webhook SePay và đếm ngược 30 phút.
   - Tự động chuyển hướng ngay sang trang Thành công khi tiền về tài khoản.
   - Theo dõi tiến độ trong Lịch sử đơn hàng cá nhân với nhãn trạng thái trực quan và tải bài thuyết trình hoàn chỉnh (.pptx) bằng **Signed URL bảo mật 5 phút**.

2. **Quản trị Admin**:
   - Đường dẫn `/admin` được bảo vệ chặt chẽ ở cả Server Component, API và Postgres Row Level Security (RLS).
   - Bộ lọc theo trạng thái đơn, tìm kiếm theo mã đơn (`PPT-YYMMDD-XXXX`), tên khách, số điện thoại.
   - Sắp xếp và đánh dấu nổi bật đơn **Gói Hỏa tốc (24h)** lên đầu trang.
   - Cảnh báo đơn hàng sắp đến hạn chót (deadline) hoặc quá hạn.
   - Trang chi tiết đơn hàng: nút gọi trực tiếp, nút mở Zalo trò chuyện với khách, xem nội dung và tải tài liệu khách gửi.
   - Nút chuyển trạng thái máy (state machine): Tiếp nhận làm bài -> Hoàn thành bài (bắt buộc tải file .pptx tối đa 50 MB gắn đúng vào đơn).
   - Nút xác nhận thanh toán thủ công (ghi log `actor_id` đối soát tay) và nút hủy đơn kèm lý do bắt buộc.

3. **Bảo mật & Kỹ thuật**:
   - Kiến trúc `PaymentProvider` trừu tượng, dễ dàng mở rộng sang Casso hoặc payOS.
   - Webhook SePay bảo mật với so sánh hằng thời gian (`timingSafeEqual`) chống timing attacks.
   - Cơ chế **Idempotent** chống xử lý trùng lặp giao dịch (ràng buộc unique `provider_txn_id`).
   - Kiểm tra dữ liệu vào bằng `zod` ở cả client và server.
   - Bộ kiểm thử tự động 18 bài test với `vitest`.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Local

### 1. Yêu cầu hệ thống
- Node.js >= 18.x (khuyên dùng Node.js 20 hoặc 24)
- npm >= 9.x

### 2. Cài đặt thư viện
```bash
npm install
```

### 3. Cấu hình file biến môi trường `.env.local`
Sao chép `.env.example` thành `.env.local`:
```bash
cp .env.example .env.local
```
Điền các giá trị thực tế của bạn:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

SEPAY_API_KEY=your-sepay-secret-token

NEXT_PUBLIC_BANK_NAME=MBBank
NEXT_PUBLIC_BANK_ACCOUNT_NO=0888888888
NEXT_PUBLIC_BANK_ACCOUNT_NAME=NGUYEN VAN A

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Chạy kiểm thử tự động
```bash
npm run test
```

### 5. Chạy ứng dụng ở chế độ phát triển
```bash
npm run dev
```
Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Hướng Dẫn Cấu Hình Supabase (Gói Free)

1. Truy cập [https://supabase.com](https://supabase.com) và tạo một Project mới (chọn region Singapore để tốc độ nhanh nhất).
2. Vào mục **Project Settings** -> **API**, sao chép:
   - **Project URL** -> điền vào `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** -> điền vào `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** -> điền vào `SUPABASE_SERVICE_ROLE_KEY`
3. Vào mục **SQL Editor** trong Supabase Dashboard:
   - Mở file `supabase/migrations/20261012_init_ppt_shop.sql`
   - Dán toàn bộ nội dung và bấm **Run**. Toàn bộ các bảng (`profiles`, `orders`, `payments`, `order_events`), RLS policies, trigger tạo profile tự động và Storage buckets (`order-inputs`, `order-outputs`) sẽ được tạo sẵn.

---

## 👑 Hướng Dẫn Tạo Tài Khoản Admin

1. Vào website tại trang [http://localhost:3000/dang-ky](http://localhost:3000/dang-ky) và đăng ký tài khoản với email bạn muốn làm Admin (ví dụ: `admin@pptshop.vn`).
2. Vào lại **SQL Editor** của Supabase và chạy lệnh SQL:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@pptshop.vn'
);
```
3. Đăng nhập lại với tài khoản trên, menu sẽ hiển thị nút **Quản trị Admin** và bạn có thể truy cập `/admin`.

---

## 💳 Hướng Dẫn Cấu Hình SePay (Tự Động Nhận Tiền Qua VietQR)

1. Đăng ký tài khoản tại [https://sepay.vn](https://sepay.vn) (gói miễn phí hỗ trợ nhận thông báo biến động số dư ngân hàng).
2. Kết nối tài khoản ngân hàng của bạn (MBBank, Vietcombank, TPBank, v.v.).
3. Vào mục **Cấu hình Webhooks** trên SePay:
   - **URL Webhook**: `https://ten-mien-cua-ban.vercel.app/api/webhooks/sepay` (hoặc dùng ngrok URL khi test local: `https://xxxx.ngrok-free.app/api/webhooks/sepay`).
   - **Phương thức**: `POST`
   - **Khóa xác thực (API Key / Secret Token)**: Nhập chuỗi bí mật của bạn (ví dụ `my_secret_token_12345`), và điền chuỗi này vào biến `SEPAY_API_KEY` trong `.env.local` / Vercel.
4. **Cơ chế hoạt động**:
   - Khi khách chuyển khoản quét mã VietQR, nội dung chuyển tiền chứa mã đơn dạng `PPT-YYMMDD-XXXX`.
   - SePay gửi webhook sang Next.js server. Hệ thống kiểm tra chữ ký hằng thời gian (`timingSafeEqual`), tìm mã đơn, kiểm tra số tiền đủ và trạng thái đơn, rồi tự động chuyển đơn sang `paid`, đồng thời kích hoạt hạn giao `due_at`.

> 💡 **Mẹo Demo / Chấm Bài**:
> Tại màn hình thanh toán `/thanh-toan/[code]`, hệ thống có tích hợp sẵn nút **"Thanh toán thử nghiệm ngay (Test Webhook)"**. Bấm nút này sẽ gửi ngay webhook giả lập đúng chuẩn SePay để kích hoạt đơn ngay lập tức mà không cần tài khoản SePay thực tế!

---

## 🚀 Hướng Dẫn Deploy Lên Vercel (Gói Free)

1. Đưa mã nguồn lên GitHub repository cá nhân.
2. Truy cập [https://vercel.com](https://vercel.com) và chọn **Add New Project** -> Import repository vừa tạo.
3. Trong mục **Environment Variables**, cấu hình đầy đủ các biến môi trường:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SEPAY_API_KEY`
   - `NEXT_PUBLIC_BANK_NAME`
   - `NEXT_PUBLIC_BANK_ACCOUNT_NO`
   - `NEXT_PUBLIC_BANK_ACCOUNT_NAME`
   - `NEXT_PUBLIC_APP_URL` (Domain Vercel của bạn, ví dụ: `https://ppt24h.vercel.app`)
4. Bấm **Deploy**. Vercel sẽ tự động build và cấp domain HTTPS miễn phí.

---

## ⚠️ Lưu Ý Quan Trọng Khi Vận Hành

1. **Tài khoản ngân hàng**: Sử dụng đúng một tài khoản ngân hàng chính chủ để nhận tiền. Khi doanh thu tăng trưởng, hãy tìm hiểu nghĩa vụ đăng ký kinh doanh và kê khai thuế theo quy định pháp luật.
2. **Chính sách hoàn tiền**: Chuyển khoản qua VietQR không hỗ trợ hoàn tiền tự động từ phía cổng thanh toán. Hãy soạn thảo rõ ràng điều khoản xử lý hoàn tiền nếu có sai sót và hỗ trợ chuyển khoản hoàn lại qua ngân hàng cho khách.
3. **Quản lý dung lượng Supabase Storage**: Gói Free của Supabase có giới hạn lưu trữ (1 GB). Bạn nên định kỳ xóa các file tài liệu đầu vào của đơn đã hoàn thành sau 30-60 ngày để tiết kiệm dung lượng.
