import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { transitionOrderStatus } from '@/lib/order-service';
import { OrderStatus } from '@/lib/types';

export async function POST(
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

    // Kiểm tra quyền Admin
    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Chỉ Admin mới có quyền thực hiện thao tác này.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { toStatus, note, deliveredFilePath, cancelReason } = body as {
      toStatus: OrderStatus;
      note?: string;
      deliveredFilePath?: string;
      cancelReason?: string;
    };

    if (!toStatus) {
      return NextResponse.json({ success: false, message: 'Thiếu trạng thái mục tiêu.' }, { status: 400 });
    }

    const result = await transitionOrderStatus({
      orderId,
      toStatus,
      actorId: user.id,
      note: note || `Admin cập nhật trạng thái sang ${toStatus}`,
      isAdmin: true,
      deliveredFilePath,
      cancelReason
    });

    if (!result.success || !result.order) {
      return NextResponse.json(
        { success: false, message: result.error || 'Cập nhật trạng thái thất bại.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      message: 'Cập nhật trạng thái thành công!'
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn:', error);
    return NextResponse.json(
      { success: false, message: 'Đã có lỗi hệ thống xảy ra.' },
      { status: 500 }
    );
  }
}
