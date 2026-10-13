import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ authenticated: false, user: null, profile: null });
    }

    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return NextResponse.json({
      authenticated: true,
      user,
      profile: profile || {
        id: user.id,
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
        zalo: user.user_metadata?.zalo || '',
        role: user.user_metadata?.role || 'user'
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    return NextResponse.json({ authenticated: false, user: null, profile: null });
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true, message: 'Đã đăng xuất.' });
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    return NextResponse.json({ success: false, message: 'Lỗi đăng xuất.' }, { status: 500 });
  }
}
