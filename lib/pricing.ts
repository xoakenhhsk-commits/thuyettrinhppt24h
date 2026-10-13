import { PlanConfig, PlanType } from './types';

export const PLANS: Record<PlanType, PlanConfig> = {
  standard: {
    id: 'standard',
    name: 'Gói Tiêu chuẩn',
    price: 30000,
    deliveryDays: 3,
    description: 'Phù hợp cho bài tập lớn, thuyết trình nhóm thông thường.',
    features: [
      'Giao bài trong 3 ngày',
      'Định dạng slide chuẩn PowerPoint (.pptx)',
      'Thiết kế đẹp mắt, bố cục rõ ràng',
      'Hỗ trợ chỉnh sửa theo góp ý'
    ]
  },
  rush: {
    id: 'rush',
    name: 'Gói Nhanh (Hỏa tốc)',
    price: 50000,
    deliveryDays: 1,
    description: 'Dành cho trường hợp gấp, cần nộp bài hoặc thuyết trình ngay.',
    features: [
      'Giao bài hỏa tốc trong 24 giờ (1 ngày)',
      'Ưu tiên xử lý hàng đầu',
      'Thiết kế ấn tượng, hiệu ứng chuyển cảnh mượt',
      'Đầy đủ hình ảnh minh họa chất lượng cao'
    ]
  }
};

export const DEFAULT_PLAN: PlanType = 'standard';

export function getPlanDetails(plan: PlanType): PlanConfig {
  return PLANS[plan] || PLANS.standard;
}

export function calculateOrderPrice(plan: PlanType): number {
  const planConfig = getPlanDetails(plan);
  return planConfig.price;
}

export function calculateDueAt(plan: PlanType, fromDate: Date = new Date()): Date {
  const planConfig = getPlanDetails(plan);
  const due = new Date(fromDate.getTime());
  due.setDate(due.getDate() + planConfig.deliveryDays);
  return due;
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}
