import { NextRequest, NextResponse } from 'next/server';
import { defaultPaymentProvider } from '@/lib/payment/sepay';
import { createAdminClient } from '@/lib/supabase/admin';
import { transitionOrderStatus } from '@/lib/order-service';
import { Order } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);

    // Chuyển đổi headers sang Record
    const headersRecord: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersRecord[key.toLowerCase()] = value;
    });

    // 1. Xác thực webhook và trích xuất dữ liệu
    const verification = await defaultPaymentProvider.verifyWebhook(rawBody, headersRecord);

    if (!verification.isValid && !verification.transactionId) {
      // Trường hợp không hợp lệ ngay từ xác thực chữ ký/khóa bí mật
      return NextResponse.json(
        { success: false, message: verification.errorMessage || 'Xác thực thất bại' },
        { status: 401 }
      );
    }

    const { transactionId, orderCode, amount = 0, rawPayload = {} } = verification;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: 'Thiếu transactionId' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 2. Chống xử lý trùng (Idempotent): kiểm tra provider_txn_id đã tồn tại chưa
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, matched')
      .eq('provider_txn_id', transactionId)
      .maybeSingle();

    if (existingPayment) {
      // Đã ghi nhận giao dịch này trước đó, trả về 200 để SePay không gửi lại
      return NextResponse.json({
        success: true,
        message: 'Giao dịch đã được ghi nhận trước đó (Idempotent OK)',
        duplicate: true
      });
    }

    // 3. Nếu không tìm thấy mã đơn hàng trong nội dung chuyển khoản
    if (!orderCode) {
      await supabase.from('payments').insert({
        order_id: null,
        provider: 'sepay',
        provider_txn_id: transactionId,
        amount,
        raw_payload: rawPayload,
        matched: false
      });

      return NextResponse.json({
        success: true,
        message: 'Đã lưu giao dịch nhưng không tìm thấy mã đơn hợp lệ (Cần đối soát tay)'
      });
    }

    // 4. Tìm đơn hàng theo mã đơn
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('code', orderCode)
      .maybeSingle();

    const order = orderData as Order | null;

    if (orderError || !order) {
      // Lưu payment không khớp mã đơn
      await supabase.from('payments').insert({
        order_id: null,
        provider: 'sepay',
        provider_txn_id: transactionId,
        amount,
        raw_payload: rawPayload,
        matched: false
      });

      return NextResponse.json({
        success: true,
        message: `Mã đơn ${orderCode} không tồn tại trong hệ thống (Đã lưu để admin đối soát)`
      });
    }

    // 5. Kiểm tra điều kiện hợp lệ để thanh toán tự động:
    // - Đơn đang ở trạng thái pending_payment
    // - Số tiền thanh toán >= số tiền của đơn
    const isPending = order.status === 'pending_payment';
    const isAmountSufficient = amount >= order.amount;

    if (!isPending || !isAmountSufficient) {
      // Số tiền không đủ hoặc trạng thái đơn không phải pending_payment (VD: đã hủy hoặc đã trả)
      await supabase.from('payments').insert({
        order_id: order.id,
        provider: 'sepay',
        provider_txn_id: transactionId,
        amount,
        raw_payload: rawPayload,
        matched: false
      });

      return NextResponse.json({
        success: true,
        message: `Giao dịch không khớp điều kiện (Đang: ${order.status}, Cần: ${order.amount}đ, Nhận: ${amount}đ) - Chờ admin xử lý`
      });
    }

    // 6. Giao dịch hợp lệ 100%: Lưu payment matched = true và cập nhật trạng thái đơn sang 'paid'
    await supabase.from('payments').insert({
      order_id: order.id,
      provider: 'sepay',
      provider_txn_id: transactionId,
      amount,
      raw_payload: rawPayload,
      matched: true
    });

    await transitionOrderStatus({
      orderId: order.id,
      toStatus: 'paid',
      note: `Thanh toán thành công qua SePay VietQR (Mã GD: ${transactionId}, Số tiền: ${amount}đ)`,
      isAdmin: true
    });

    return NextResponse.json({
      success: true,
      message: `Đơn hàng ${order.code} đã được tự động thanh toán thành công!`
    });
  } catch (error) {
    console.error('Lỗi xử lý webhook SePay:', error);
    // Vẫn trả về 200 hoặc 500 có kiểm soát
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ nội bộ khi xử lý webhook' },
      { status: 500 }
    );
  }
}
