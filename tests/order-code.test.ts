import { describe, it, expect } from 'vitest';
import { generateOrderCode, extractOrderCode, isValidOrderCode } from '../lib/order-code';

describe('Order Code Module (lib/order-code.ts)', () => {
  it('sinh mã đơn đúng định dạng PPT-YYMMDD-XXXX', () => {
    const testDate = new Date('2026-10-12T00:00:00Z');
    const code = generateOrderCode(testDate);
    expect(code).toMatch(/^PPT-261012-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/);
  });

  it('không chứa các ký tự dễ nhầm lẫn 0, O, 1, I trong phần ngẫu nhiên', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateOrderCode();
      const randomPart = code.split('-')[2];
      expect(randomPart).not.toMatch(/[01OIoi]/);
    }
  });

  it('trích xuất chính xác mã đơn từ nội dung chuyển khoản của ngân hàng', () => {
    const content1 = 'Nguyen Van A chuyen tien PPT-261012-K7X9 lam slide';
    expect(extractOrderCode(content1)).toBe('PPT-261012-K7X9');

    const content2 = 'ppt-261012-k7x9 thanh toan';
    expect(extractOrderCode(content2)).toBe('PPT-261012-K7X9');

    const invalidContent = 'chuyen tien khong co ma don';
    expect(extractOrderCode(invalidContent)).toBeNull();
  });

  it('kiểm tra hợp lệ định dạng mã đơn hàng', () => {
    expect(isValidOrderCode('PPT-261012-K7X9')).toBe(true);
    expect(isValidOrderCode('ppt-261012-abcd')).toBe(true);
    expect(isValidOrderCode('PPT-INVALID')).toBe(false);
  });
});
