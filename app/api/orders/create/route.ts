import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrderSchema } from '@/lib/validations/order';
import { createOrderServer } from '@/lib/order-service';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng đăng nhập để tạo đơn hàng.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parseResult = createOrderSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.errors[0]?.message || 'Dữ liệu không hợp lệ.'
        },
        { status: 400 }
      );
    }

    const { customerName, customerPhone, customerZalo, brief, inputFilePath, plan } =
      parseResult.data;

    const result = await createOrderServer({
      userId: user.id,
      customerName,
      customerPhone,
      customerZalo,
      brief,
      inputFilePath,
      plan
    });

    if (result.error || !result.order) {
      return NextResponse.json(
        { success: false, message: result.error || 'Tạo đơn thất bại.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result.order
    });
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    return NextResponse.json(
      { success: false, message: 'Đã có lỗi hệ thống xảy ra.' },
      { status: 500 }
    );
  }
}
