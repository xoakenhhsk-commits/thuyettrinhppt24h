import { z } from 'zod';
import { VIETNAM_PHONE_REGEX } from './auth';

export const ALLOWED_INPUT_EXTENSIONS = ['.docx', '.pdf', '.txt'];
export const MAX_INPUT_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_OUTPUT_EXTENSIONS = ['.pptx'];
export const MAX_OUTPUT_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const orderStep1Schema = z.object({
  customerName: z.string().min(2, 'Vui lòng nhập họ và tên (tối thiểu 2 ký tự).'),
  customerPhone: z
    .string()
    .regex(VIETNAM_PHONE_REGEX, 'Số điện thoại Việt Nam không hợp lệ (ví dụ: 0912345678).'),
  customerZalo: z.string().min(1, 'Vui lòng nhập số Zalo để nhận cập nhật tiến độ bài làm.')
});

export const orderStep2Schema = z
  .object({
    brief: z.string().optional(),
    hasInputFile: z.boolean().default(false),
    plan: z.enum(['standard', 'rush'], {
      required_error: 'Vui lòng chọn gói dịch vụ.'
    })
  })
  .refine(
    (data) => {
      const hasText = data.brief && data.brief.trim().length >= 10;
      return hasText || data.hasInputFile;
    },
    {
      message: 'Vui lòng nhập yêu cầu/chủ đề (tối thiểu 10 ký tự) HOẶC tải lên file tài liệu nội dung.',
      path: ['brief']
    }
  );

export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự.'),
  customerPhone: z.string().regex(VIETNAM_PHONE_REGEX, 'Số điện thoại không hợp lệ.'),
  customerZalo: z.string().min(1, 'Vui lòng nhập Zalo.'),
  brief: z.string().optional().nullable(),
  inputFilePath: z.string().optional().nullable(),
  plan: z.enum(['standard', 'rush'])
});

export type OrderStep1Input = z.infer<typeof orderStep1Schema>;
export type OrderStep2Input = z.infer<typeof orderStep2Schema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
