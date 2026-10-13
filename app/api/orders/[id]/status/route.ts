import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu mã đơn hàng hoặc ID.' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    const adminDb = createAdminClient();
    
    // Tìm theo code hoặc UUID
    const isCode = id.toUpperCase().startsWith('PPT-');
    const query = isCode
      ? adminDb.from('orders').select('*').eq('code', id.toUpperCase())
      : adminDb.from('orders').select('*').eq('id', id);

    const { data: order, error } = await query.maybeSingle();

    if (error || !order) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy đơn hàng.' }, { status: 404 });
    }

    // Nếu người dùng đã đăng nhập, kiểm tra xem có phải đơn của họ không (hoặc admin)
    if (user && order.user_id !== user.id) {
      const { data: profile } = await adminDb
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role !== 'admin') {
        return NextResponse.json(
          { success: false, message: 'Bạn không có quyền xem đơn hàng này.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        code: order.code,
        status: order.status,
        amount: order.amount,
        plan: order.plan,
        paidAt: order.paid_at,
        dueAt: order.due_at,
        completedAt: order.completed_at,
        createdAt: order.created_at
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy trạng thái đơn hàng:', error);
    return NextResponse.json({ success: false, message: 'Lỗi máy chủ.' }, { status: 500 });
  }
}
