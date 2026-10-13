import { calculateDueAt, calculateOrderPrice } from './pricing';
import { generateOrderCode } from './order-code';
import { validateStateTransition } from './order-state';
import { Order, OrderStatus, PlanType } from './types';
import { createAdminClient } from './supabase/admin';

/**
 * Tạo đơn hàng mới an toàn trên server
 * - Giá và hạn giao tính hoàn toàn ở server
 * - Thử sinh mã đơn tối đa 5 lần
 */
export async function createOrderServer({
  userId,
  customerName,
  customerPhone,
  customerZalo,
  brief,
  inputFilePath,
  plan
}: {
  userId: string;
  customerName: string;
  customerPhone: string;
  customerZalo: string;
  brief?: string | null;
  inputFilePath?: string | null;
  plan: PlanType;
}): Promise<{ order?: Order; error?: string }> {
  const supabase = createAdminClient();
  const amount = calculateOrderPrice(plan);

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;
    const code = generateOrderCode();

    const { data, error } = await supabase
      .from('orders')
      .insert({
        code,
        user_id: userId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_zalo: customerZalo,
        brief: brief || null,
        input_file_path: inputFilePath || null,
        plan,
        amount,
        status: 'pending_payment'
      })
      .select()
      .single();

    if (!error && data) {
      // Ghi log sự kiện khởi tạo đơn hàng
      await supabase.from('order_events').insert({
        order_id: data.id,
        from_status: null,
        to_status: 'pending_payment',
        actor_id: userId,
        note: `Khởi tạo đơn hàng mới gói ${plan === 'rush' ? 'Hỏa tốc' : 'Tiêu chuẩn'}`
      });

      return { order: data as Order };
    }

    // Nếu lỗi do trùng mã đơn (code unique constraint), vòng lặp sẽ thử lại
    if (error && error.code !== '23505') {
      return { error: error.message };
    }
  }

  return { error: 'Không thể sinh mã đơn hàng duy nhất sau 5 lần thử. Vui lòng thử lại.' };
}

/**
 * Hàm duy nhất để chuyển đổi trạng thái đơn hàng và ghi vào order_events
 */
export async function transitionOrderStatus({
  orderId,
  toStatus,
  actorId,
  note,
  isAdmin = false,
  deliveredFilePath,
  cancelReason
}: {
  orderId: string;
  toStatus: OrderStatus;
  actorId?: string | null;
  note?: string;
  isAdmin?: boolean;
  deliveredFilePath?: string;
  cancelReason?: string;
}): Promise<{ success: boolean; error?: string; order?: Order }> {
  const supabase = createAdminClient();

  // 1. Lấy thông tin đơn hàng hiện tại
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    return { success: false, error: 'Không tìm thấy đơn hàng cần cập nhật.' };
  }

  const fromStatus = order.status as OrderStatus;

  // 2. Kiểm tra tính hợp lệ của việc chuyển đổi
  const validation = validateStateTransition(fromStatus, toStatus, {
    isAdmin,
    reason: cancelReason || note
  });

  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  // 3. Chuẩn bị dữ liệu cập nhật
  const updateData: Record<string, unknown> = {
    status: toStatus
  };

  const now = new Date();

  if (toStatus === 'paid') {
    updateData.paid_at = now.toISOString();
    // Tính hạn giao dựa trên ngày thanh toán thành công
    updateData.due_at = calculateDueAt(order.plan as PlanType, now).toISOString();
  } else if (toStatus === 'completed') {
    if (!deliveredFilePath && !order.delivered_file_path) {
      return { success: false, error: 'Bắt buộc tải lên file PowerPoint (.pptx) khi hoàn thành đơn.' };
    }
    updateData.completed_at = now.toISOString();
    if (deliveredFilePath) {
      updateData.delivered_file_path = deliveredFilePath;
    }
  } else if (toStatus === 'cancelled') {
    updateData.cancel_reason = cancelReason || note || 'Đã hủy';
  }

  // 4. Cập nhật orders
  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (updateError || !updatedOrder) {
    return { success: false, error: updateError?.message || 'Cập nhật đơn hàng thất bại.' };
  }

  // 5. Ghi vào order_events
  await supabase.from('order_events').insert({
    order_id: orderId,
    from_status: fromStatus,
    to_status: toStatus,
    actor_id: actorId || null,
    note: note || `Chuyển trạng thái sang ${toStatus}`
  });

  return { success: true, order: updatedOrder as Order };
}

/**
 * Sinh Signed URL tải file kết quả (.pptx) hết hạn sau 300 giây (5 phút)
 * Kiểm tra người dùng phải sở hữu đơn hàng hoặc là admin, và đơn đã completed
 */
export async function generateDownloadUrl({
  orderId,
  userId,
  isAdmin = false
}: {
  orderId: string;
  userId: string;
  isAdmin?: boolean;
}): Promise<{ url?: string; error?: string }> {
  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return { error: 'Không tìm thấy đơn hàng.' };
  }

  // Kiểm tra quyền: chỉ chủ sở hữu hoặc admin
  if (order.user_id !== userId && !isAdmin) {
    return { error: 'Bạn không có quyền truy cập vào file của đơn hàng này.' };
  }

  // Kiểm tra trạng thái hoàn thành
  if (order.status !== 'completed') {
    return { error: 'Đơn hàng chưa hoàn thành, chưa có file kết quả để tải.' };
  }

  if (!order.delivered_file_path) {
    return { error: 'Chưa có file bài thuyết trình đính kèm cho đơn này.' };
  }

  // Sinh signed url 300s (5 phút)
  const { data: signedData, error: signError } = await supabase.storage
    .from('order-outputs')
    .createSignedUrl(order.delivered_file_path, 300);

  if (signError || !signedData?.signedUrl) {
    return { error: 'Không thể tạo liên kết tải file. Vui lòng thử lại sau.' };
  }

  return { url: signedData.signedUrl };
}
