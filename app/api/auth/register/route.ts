import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { registerSchema } from '@/lib/validations/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.errors[0]?.message || 'Dữ liệu không hợp lệ.'
        },
        { status: 400 }
      );
    }

    const { email, password, fullName, phone, zalo } = parseResult.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          zalo,
          role: 'user'
        }
      }
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    // Đảm bảo cập nhật bảng profiles nếu trigger chưa chạy kịp hoặc chạy bằng service role
    if (data.user) {
      const adminDb = createAdminClient();
      await adminDb.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        phone,
        zalo,
        role: 'user',
        updated_at: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      user: data.user
    });
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    return NextResponse.json(
      { success: false, message: 'Đã có lỗi xảy ra khi tạo tài khoản.' },
      { status: 500 }
    );
  }
}
