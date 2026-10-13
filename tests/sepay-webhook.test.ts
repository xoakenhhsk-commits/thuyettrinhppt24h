import { describe, it, expect } from 'vitest';
import { SePayPaymentProvider } from '../lib/payment/sepay';

describe('SePay Payment Provider & Webhook Verification (lib/payment/sepay.ts)', () => {
  const secretKey = 'my-super-secret-sepay-key-12345';
  const provider = new SePayPaymentProvider({ apiKey: secretKey });

  it('xác thực thành công với đúng Authorization header', async () => {
    const payload = {
      id: 998877,
      transferType: 'in',
      transferAmount: 50000,
      content: 'Thanh toan PPT-261012-A8K2 lam slide'
    };

    const headers = {
      authorization: `Apikey ${secretKey}`
    };

    const result = await provider.verifyWebhook(payload, headers);
    expect(result.isValid).toBe(true);
    expect(result.transactionId).toBe('998877');
    expect(result.orderCode).toBe('PPT-261012-A8K2');
    expect(result.amount).toBe(50000);
  });

  it('từ chối khi Authorization header sai khóa bí mật', async () => {
    const payload = {
      id: 998877,
      transferType: 'in',
      transferAmount: 50000,
      content: 'PPT-261012-A8K2'
    };

    const headers = {
      authorization: 'Apikey wrong-secret-key'
    };

    const result = await provider.verifyWebhook(payload, headers);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('không hợp lệ');
  });

  it('từ chối khi giao dịch là tiền ra (transferType != in)', async () => {
    const payload = {
      id: 998878,
      transferType: 'out',
      transferAmount: 30000,
      content: 'PPT-261012-A8K2'
    };

    const headers = {
      authorization: `Apikey ${secretKey}`
    };

    const result = await provider.verifyWebhook(payload, headers);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('transferType != in');
  });

  it('nhận diện payload không có mã đơn hợp lệ (cần đối soát tay)', async () => {
    const payload = {
      id: 998879,
      transferType: 'in',
      transferAmount: 30000,
      content: 'Chuyen tien khong ghi ma don'
    };

    const headers = {
      authorization: `Apikey ${secretKey}`
    };

    const result = await provider.verifyWebhook(payload, headers);
    expect(result.isValid).toBe(true);
    expect(result.orderCode).toBeNull();
  });
});
