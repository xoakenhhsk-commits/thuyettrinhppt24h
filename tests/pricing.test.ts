import { describe, it, expect } from 'vitest';
import { calculateOrderPrice, calculateDueAt, getPlanDetails, formatVND } from '../lib/pricing';

describe('Pricing Module (lib/pricing.ts)', () => {
  it('tính đúng giá gói Tiêu chuẩn (30.000đ)', () => {
    const price = calculateOrderPrice('standard');
    expect(price).toBe(30000);
  });

  it('tính đúng giá gói Hỏa tốc (50.000đ)', () => {
    const price = calculateOrderPrice('rush');
    expect(price).toBe(50000);
  });

  it('tính đúng thời hạn giao cho gói Tiêu chuẩn (3 ngày)', () => {
    const baseDate = new Date('2026-10-12T10:00:00Z');
    const dueAt = calculateDueAt('standard', baseDate);
    const diffDays = Math.round((dueAt.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(3);
  });

  it('tính đúng thời hạn giao cho gói Hỏa tốc (1 ngày / 24 giờ)', () => {
    const baseDate = new Date('2026-10-12T10:00:00Z');
    const dueAt = calculateDueAt('rush', baseDate);
    const diffDays = Math.round((dueAt.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(1);
  });

  it('định dạng tiền tệ tiếng Việt chính xác', () => {
    const formatted = formatVND(30000);
    expect(formatted).toContain('30.000');
  });
});
