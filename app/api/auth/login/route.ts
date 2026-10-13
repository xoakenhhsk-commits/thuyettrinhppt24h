import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.errors[0]?.message || 'Dữ liệu không hợp lệ.'
        },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Sai email hoặc mật khẩu.' },
        { status: 400 }
      );
    }

    // Lấy role của user
    let role = 'user';
    if (data.user) {
      const adminDb = createAdminClient();
      const { data: profile } = await adminDb
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile?.role) {
        role = profile.role;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: data.user,
      role
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi hệ thống khi đăng nhập.' },
      { status: 500 }
    );
  }
}
