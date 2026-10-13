import { z } from 'zod';

export const VIETNAM_PHONE_REGEX = /^(03|05|07|08|09)\d{8}$/;

export const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.')
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự.').max(100, 'Họ tên quá dài.'),
  email: z.string().email('Email không đúng định dạng.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
  phone: z
    .string()
    .regex(VIETNAM_PHONE_REGEX, 'Số điện thoại Việt Nam không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09).'),
  zalo: z.string().min(1, 'Vui lòng cung cấp số điện thoại hoặc username Zalo để tiện liên hệ.')
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
