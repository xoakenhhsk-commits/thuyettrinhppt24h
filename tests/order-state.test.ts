import { describe, it, expect } from 'vitest';
import { validateStateTransition } from '../lib/order-state';

describe('Order State Machine (lib/order-state.ts)', () => {
  it('cho phép chuyển trạng thái theo đúng chu trình chuẩn', () => {
    // pending_payment -> paid
    expect(validateStateTransition('pending_payment', 'paid').isValid).toBe(true);

    // paid -> processing
    expect(validateStateTransition('paid', 'processing').isValid).toBe(true);

    // processing -> completed
    expect(validateStateTransition('processing', 'completed').isValid).toBe(true);
  });

  it('ngăn chặn nhảy cóc trạng thái (pending_payment sang completed)', () => {
    const result = validateStateTransition('pending_payment', 'completed');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('ngăn chặn quay lại trạng thái sau khi đã hủy', () => {
    const result = validateStateTransition('cancelled', 'completed');
    expect(result.isValid).toBe(false);
  });

  it('ngăn chặn chuyển sang cùng trạng thái', () => {
    const result = validateStateTransition('paid', 'paid');
    expect(result.isValid).toBe(false);
  });

  it('bắt buộc admin và lý do khi hủy đơn đã thanh toán hoặc đang làm', () => {
    // Không phải admin
    const resNoAdmin = validateStateTransition('paid', 'cancelled', {
      isAdmin: false,
      reason: 'Lý do nào đó'
    });
    expect(resNoAdmin.isValid).toBe(false);

    // Là admin nhưng không có lý do
    const resNoReason = validateStateTransition('processing', 'cancelled', {
      isAdmin: true,
      reason: ''
    });
    expect(resNoReason.isValid).toBe(false);

    // Là admin và có lý do
    const resValid = validateStateTransition('processing', 'cancelled', {
      isAdmin: true,
      reason: 'Khách hàng thay đổi đề tài'
    });
    expect(resValid.isValid).toBe(true);
  });
});
