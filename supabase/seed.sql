-- Seed script: Cách tạo hoặc thăng cấp tài khoản Admin
-- Sau khi tạo tài khoản admin qua giao diện Đăng Ký (hoặc Supabase Dashboard Auth),
-- chạy lệnh SQL sau tại Supabase SQL Editor:

-- Ví dụ thay 'admin@pptshop.vn' bằng email tài khoản của bạn:
/*
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@pptshop.vn'
);
*/

-- Kiểm tra danh sách admin:
SELECT id, full_name, role, created_at FROM public.profiles WHERE role = 'admin';
