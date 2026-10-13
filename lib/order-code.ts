import crypto from 'crypto';

// Bảng ký tự không chứa các ký tự dễ nhầm lẫn: 0, O, 1, I
const SAFE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Sinh mã đơn hàng định dạng PPT-YYMMDD-XXXX
 * Ví dụ: PPT-261012-K7X9
 */
export function generateOrderCode(date: Date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const datePart = `${yy}${mm}${dd}`;

  // Sinh 4 ký tự ngẫu nhiên bằng crypto
  const randomBytes = crypto.randomBytes(4);
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    const charIndex = randomBytes[i] % SAFE_CHARS.length;
    randomPart += SAFE_CHARS[charIndex];
  }

  return `PPT-${datePart}-${randomPart}`;
}

export const ORDER_CODE_REGEX = /PPT-\d{6}-[A-Z0-9]{4}/i;

/**
 * Tìm mã đơn hàng hợp lệ trong chuỗi nội dung chuyển khoản
 */
export function extractOrderCode(content: string): string | null {
  if (!content) return null;
  const match = content.match(ORDER_CODE_REGEX);
  return match ? match[0].toUpperCase() : null;
}

/**
 * Kiểm tra xem một chuỗi có phải mã đơn hợp lệ hay không
 */
export function isValidOrderCode(code: string): boolean {
  if (!code) return false;
  return /^PPT-\d{6}-[A-Z0-9]{4}$/i.test(code.trim());
}
