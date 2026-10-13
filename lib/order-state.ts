import { OrderStatus } from './types';

export interface StateTransitionResult {
  isValid: boolean;
  error?: string;
}

// Bảng các bước chuyển trạng thái hợp lệ
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [], // Trạng thái cuối, không thể chuyển đổi tiếp
  cancelled: []  // Đã hủy thì không cho quay lại
};

/**
 * Kiểm tra xem việc chuyển từ fromStatus sang toStatus có hợp lệ không
 */
export function validateStateTransition(
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
  options?: { isAdmin?: boolean; reason?: string }
): StateTransitionResult {
  if (fromStatus === toStatus) {
    return { isValid: false, error: 'Trạng thái mới trùng với trạng thái hiện tại.' };
  }

  const allowedNextStates = VALID_TRANSITIONS[fromStatus] || [];
  if (!allowedNextStates.includes(toStatus)) {
    return {
      isValid: false,
      error: `Không thể chuyển trực tiếp từ trạng thái "${ORDER_STATUS_META[fromStatus].label}" sang "${ORDER_STATUS_META[toStatus].label}".`
    };
  }

  // Khi hủy từ paid hoặc processing thì bắt buộc admin và có lý do
  if (toStatus === 'cancelled' && (fromStatus === 'paid' || fromStatus === 'processing')) {
    if (!options?.isAdmin) {
      return { isValid: false, error: 'Chỉ Admin mới có quyền hủy đơn đã thanh toán hoặc đang thực hiện.' };
    }
    if (!options?.reason || options.reason.trim().length === 0) {
      return { isValid: false, error: 'Bắt buộc nhập lý do hủy đơn.' };
    }
  }

  return { isValid: true };
}

export interface StatusMeta {
  label: string;
  badgeClass: string;
  description: string;
}

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending_payment: {
    label: 'Chờ thanh toán',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    description: 'Đơn hàng đang chờ khách hàng chuyển khoản xác nhận.'
  },
  paid: {
    label: 'Đã thanh toán',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    description: 'Hệ thống đã nhận được tiền, đang chờ admin tiếp nhận.'
  },
  processing: {
    label: 'Đang làm bài',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    description: 'Admin đang thiết kế bài thuyết trình PowerPoint cho bạn.'
  },
  completed: {
    label: 'Hoàn thành',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    description: 'Bài thuyết trình đã hoàn thành và sẵn sàng tải về.'
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    description: 'Đơn hàng đã bị hủy bỏ.'
  }
};
