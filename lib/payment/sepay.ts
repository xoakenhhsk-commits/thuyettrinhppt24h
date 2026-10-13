import crypto from 'crypto';
import { extractOrderCode } from '../order-code';
import { Order, PaymentInstructions } from '../types';
import { PaymentProvider, WebhookVerificationResult } from './provider';

function getNormalizedBankId(bank: string): string {
  const b = (bank || 'MB').toUpperCase().trim();
  if (b.includes('MB')) return 'MB';
  if (b.includes('VIETCOM') || b === 'VCB') return 'VCB';
  if (b.includes('TECHCOM') || b === 'TCB') return 'TCB';
  if (b.includes('BIDV')) return 'BIDV';
  if (b.includes('VIETIN') || b === 'CTG') return 'CTG';
  if (b.includes('TPB') || b.includes('TPBANK')) return 'TPB';
  if (b.includes('ACB')) return 'ACB';
  if (b.includes('VPB') || b.includes('VPBANK')) return 'VPB';
  if (b.includes('VIB')) return 'VIB';
  if (b.includes('SACCOM') || b === 'STB') return 'STB';
  if (b.includes('AGRI') || b.includes('AGRIBANK') || b === 'VBA') return 'VBA';
  return bank || 'MB';
}

export class SePayPaymentProvider implements PaymentProvider {
  name = 'sepay';

  private apiKey: string;
  private bankName: string;
  private accountNumber: string;
  private accountName: string;

  constructor(options?: {
    apiKey?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  }) {
    this.apiKey = options?.apiKey || process.env.SEPAY_API_KEY || '';
    this.bankName = options?.bankName || process.env.NEXT_PUBLIC_BANK_NAME || 'MBBank';
    this.accountNumber = options?.accountNumber || process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || '0888888888';
    this.accountName = options?.accountName || process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'PPT 24H';
  }

  createPaymentInstructions(order: Order): PaymentInstructions {
    const transferContent = order.code;
    const amount = order.amount;
    const acc = (this.accountNumber || process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || '0888888888').trim();
    const bank = (this.bankName || process.env.NEXT_PUBLIC_BANK_NAME || 'MBBank').trim();
    const name = (this.accountName || process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'PPT 24H').trim();
    const bankId = getNormalizedBankId(bank);

    // Chuẩn VietQR quốc gia (Napas) tạo ảnh mã QR tức thời, tương thích 100% app ngân hàng
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${acc}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
      transferContent
    )}&accountName=${encodeURIComponent(name)}`;

    return {
      bankName: bank,
      accountNumber: acc,
      accountName: name,
      amount,
      transferContent,
      qrUrl,
      expiresInMinutes: 30
    };
  }

  /**
   * So sánh an toàn hằng thời gian (constant-time) để chống tấn công phân tích thời gian
   */
  private secureCompare(a: string, b: string): boolean {
    if (!a || !b) return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // Đảm bảo không return ngay lập tức mà vẫn tốn thời gian cố định
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }

  async verifyWebhook(
    body: unknown,
    headers: Record<string, string | string[] | undefined>
  ): Promise<WebhookVerificationResult> {
    // 1. Kiểm tra khóa xác thực trong header
    // SePay gửi header Authorization: Apikey <api_key>
    const authHeader = Array.isArray(headers['authorization'])
      ? headers['authorization'][0]
      : headers['authorization'] || headers['Authorization'];

    let providedKey = '';
    if (typeof authHeader === 'string') {
      const parts = authHeader.trim().split(' ');
      providedKey = parts.length > 1 ? parts[1] : parts[0];
    }

    // Nếu cấu hình có API key, kiểm tra tính hợp lệ
    if (this.apiKey) {
      const isKeyValid = this.secureCompare(providedKey, this.apiKey);
      if (!isKeyValid) {
        return {
          isValid: false,
          errorMessage: 'Khóa xác thực SePay không hợp lệ (Unauthorized).'
        };
      }
    }

    if (!body || typeof body !== 'object') {
      return {
        isValid: false,
        errorMessage: 'Payload webhook không hợp lệ (Trống hoặc sai kiểu).'
      };
    }

    const payload = body as Record<string, unknown>;

    // 2. Trích xuất thông tin giao dịch từ SePay payload
    // Định dạng SePay: id, transferType, transferAmount, content
    const txnId = String(payload.id || payload.transaction_id || payload.referenceCode || '');
    if (!txnId) {
      return {
        isValid: false,
        errorMessage: 'Không tìm thấy ID giao dịch trong payload SePay.'
      };
    }

    // Số tiền giao dịch
    const rawAmount =
      payload.transferAmount ??
      payload.amountIn ??
      payload.amount ??
      payload.transfer_amount;
    const amount = Number(rawAmount);

    if (isNaN(amount) || amount <= 0) {
      return {
        isValid: false,
        transactionId: txnId,
        rawPayload: payload,
        errorMessage: 'Số tiền giao dịch không hợp lệ.'
      };
    }

    // Chỉ nhận tiền vào (transferType = in) nếu trường này tồn tại
    if (payload.transferType && payload.transferType !== 'in') {
      return {
        isValid: false,
        transactionId: txnId,
        rawPayload: payload,
        errorMessage: 'Giao dịch không phải là tiền vào (transferType != in).'
      };
    }

    // 3. Trích xuất mã đơn từ nội dung chuyển khoản
    const content = String(payload.content || payload.description || payload.code || '');
    const orderCode = extractOrderCode(content);

    return {
      isValid: true,
      orderCode,
      amount,
      transactionId: txnId,
      rawPayload: payload
    };
  }
}

// Instance mặc định
export const defaultPaymentProvider = new SePayPaymentProvider();
