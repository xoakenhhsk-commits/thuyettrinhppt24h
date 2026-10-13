---
name: ppt-shop
description: Quy ước xây dựng web bán dịch vụ làm PPT (Next.js + Supabase + VietQR/SePay). Dùng khi viết hoặc sửa bất kỳ phần nào của dự án này: đặt hàng, thanh toán, lịch sử đơn, trang admin, tải file.
---

# ppt-shop

## Nguyên tắc chung
- Giao diện và thông báo lỗi bằng tiếng Việt; tên biến, hàm, bảng bằng tiếng Anh.
- Mọi quyết định về tiền (giá, trạng thái đã trả) chỉ được tính ở server.
- Không dùng thư viện trả phí. Ưu tiên gói free của Supabase, Vercel, SePay.

## Cấu trúc thư mục gợi ý
- app/(public): trang chủ, bảng giá, đăng nhập, đăng ký
- app/(user): dat-hang, thanh-toan/[code], thanh-cong/[code], lich-su
- app/admin: danh sách đơn, chi tiết đơn
- app/api/webhooks/sepay: nhận webhook thanh toán
- lib/pricing.ts: bảng giá và hàm tính tiền
- lib/order-code.ts: sinh mã đơn
- lib/payment/: PaymentProvider, sepay.ts
- lib/supabase/: client trình duyệt và client server
- supabase/migrations: SQL và chính sách RLS

## Bảng giá (nguồn duy nhất: lib/pricing.ts)
- standard: 30000, hạn 3 ngày
- rush: 50000, hạn 1 ngày
- due_at = thời điểm thanh toán thành công + số ngày của gói.

## Mã đơn
- Định dạng PPT-YYMMDD-XXXX, XXXX gồm A-Z và 0-9 bỏ ký tự dễ nhầm (0, O, 1, I).
- Sinh bằng crypto, kiểm tra trùng với ràng buộc unique, thử lại tối đa 5 lần.

## Máy trạng thái đơn
pending_payment -> paid -> processing -> completed
pending_payment -> cancelled (hết hạn 30 phút hoặc admin hủy)
paid, processing -> cancelled (chỉ admin, bắt buộc ghi lý do)
- Mọi chuyển trạng thái đi qua một hàm duy nhất ghi vào order_events.
- Không cho nhảy cóc trạng thái; không cho quay về completed sau khi hủy.

## Thanh toán
- Nội dung chuyển khoản = mã đơn; số tiền QR = amount của đơn.
- Webhook phải: xác thực khóa, tìm mã đơn bằng regex, kiểm tra trạng thái và số tiền, ghi payments, rồi mới đổi trạng thái.
- provider_txn_id là unique để chống xử lý trùng.
- Giao dịch không khớp thì lưu với matched = false để admin đối soát, không bỏ qua im lặng.
- Mọi nhà cung cấp phải cài đặt giao diện PaymentProvider: createPaymentInstructions(order) và verifyWebhook(request).

## Phân quyền (RLS)
- profiles: user đọc và sửa hàng của mình; admin đọc tất cả.
- orders: user chỉ đọc và tạo đơn của mình, không tự sửa status hay amount; admin đọc và sửa tất cả.
- payments, order_events: chỉ admin và service role.
- Storage private: user chỉ đọc file trong thư mục có user_id của mình; chỉ admin ghi vào order-outputs.
- Mọi route /admin và API admin kiểm tra role ở server, không chỉ ẩn nút ở giao diện.

## Tải file
- Chỉ tạo signed URL khi đơn thuộc user đang đăng nhập và status = completed.
- Signed URL hết hạn sau 300 giây; mỗi lần bấm tải sinh URL mới.
- File đầu vào: .docx, .pdf, .txt, tối đa 10 MB. File bài làm: .pptx, tối đa 50 MB. Kiểm tra cả phần mở rộng và MIME.

## Giao diện
- Form nhiều bước có thanh tiến trình; Enter chuyển bước khi dữ liệu hợp lệ.
- Nhãn trạng thái có màu và chữ rõ ràng, không chỉ dựa vào màu.
- Trang thanh toán có nút sao chép số tài khoản và nội dung chuyển khoản.
- Đơn Nhanh được đánh dấu nổi bật ở danh sách admin.

## Định nghĩa hoàn thành
- Chạy được từ đầu bằng README, không lỗi TypeScript hay lint.
- Test qua cho: giá, mã đơn, webhook (đúng, sai tiền, trùng), phân quyền.
- Đã tự thử trọn luồng: đăng ký, đặt hàng, thanh toán giả lập qua webhook, admin tải bài lên, khách tải về.
- Không còn khóa bí mật trong mã nguồn.
