import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDownloadUrl } from '@/lib/order-service';
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
      return NextResponse.json(
        { success: false, message: 'Vui lòng đăng nhập để tải bài thuyết trình.' },
        { status: 401 }
      );
    }

    // Kiểm tra role admin
    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isAdmin = profile?.role === 'admin';

    const result = await generateDownloadUrl({
      orderId,
      userId: user.id,
      isAdmin
    });

    if (result.error || !result.url) {
      return NextResponse.json(
        { success: false, message: result.error || 'Không thể tạo liên kết tải về.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: result.url,
      expiresIn: 300 // 5 phút
    });
  } catch (error) {
    console.error('Lỗi khi tạo liên kết tải file:', error);
    return NextResponse.json(
      { success: false, message: 'Đã có lỗi hệ thống xảy ra.' },
      { status: 500 }
    );
  }
}
