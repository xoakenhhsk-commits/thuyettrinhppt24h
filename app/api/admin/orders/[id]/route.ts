import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập.' }, { status: 401 });
    }

    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Chỉ Admin mới có quyền xem trang này.' },
        { status: 403 }
      );
    }

    // Lấy thông tin đơn hàng
    const { data: order, error: orderError } = await adminDb
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy đơn hàng.' }, { status: 404 });
    }

    // Lấy lịch sử order_events
    const { data: events } = await adminDb
      .from('order_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    // Lấy payments liên quan
    const { data: payments } = await adminDb
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    // Sinh signed url xem/tải input_file_path của khách nếu có
    let inputFileUrl: string | null = null;
    if (order.input_file_path) {
      const { data: signData } = await adminDb.storage
        .from('order-inputs')
        .createSignedUrl(order.input_file_path, 3600); // 1 giờ cho admin
      if (signData?.signedUrl) {
        inputFileUrl = signData.signedUrl;
      }
    }

    return NextResponse.json({
      success: true,
      order,
      events: events || [],
      payments: payments || [],
      inputFileUrl
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn admin:', error);
    return NextResponse.json({ success: false, message: 'Lỗi máy chủ.' }, { status: 500 });
  }
}
