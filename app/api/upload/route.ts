import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  ALLOWED_INPUT_EXTENSIONS,
  MAX_INPUT_FILE_SIZE,
  ALLOWED_OUTPUT_EXTENSIONS,
  MAX_OUTPUT_FILE_SIZE
} from '@/lib/validations/order';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Chưa đăng nhập.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'order-inputs';
    const orderCode = (formData.get('orderCode') as string) || 'draft';

    if (!file) {
      return NextResponse.json({ success: false, message: 'Vui lòng chọn file.' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    const adminDb = createAdminClient();

    if (bucket === 'order-inputs') {
      // Kiểm tra định dạng đầu vào (.docx, .pdf, .txt)
      if (!ALLOWED_INPUT_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          {
            success: false,
            message: `Chỉ hỗ trợ file nội dung định dạng ${ALLOWED_INPUT_EXTENSIONS.join(', ')}`
          },
          { status: 400 }
        );
      }
      if (file.size > MAX_INPUT_FILE_SIZE) {
        return NextResponse.json(
          { success: false, message: 'Dung lượng file tối đa là 10 MB.' },
          { status: 400 }
        );
      }
    } else if (bucket === 'order-outputs') {
      // Chỉ admin mới được upload vào order-outputs
      const { data: profile } = await adminDb
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role !== 'admin') {
        return NextResponse.json(
          { success: false, message: 'Chỉ Admin mới có quyền tải file bài làm hoàn thành.' },
          { status: 403 }
        );
      }

      // Kiểm tra file .pptx
      if (!ALLOWED_OUTPUT_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          {
            success: false,
            message: `Chỉ hỗ trợ tải lên file PowerPoint hoàn chỉnh (.pptx)`
          },
          { status: 400 }
        );
      }
      if (file.size > MAX_OUTPUT_FILE_SIZE) {
        return NextResponse.json(
          { success: false, message: 'Dung lượng file tối đa là 50 MB.' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json({ success: false, message: 'Bucket không hợp lệ.' }, { status: 400 });
    }

    // Đổi tên file ngẫu nhiên theo chuẩn bảo mật: {user_id}/{order_code}/{random_uuid}{ext}
    const randomName = crypto.randomUUID();
    const filePath = `${user.id}/${orderCode}/${randomName}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dùng adminDb để upload tránh lỗi permission policies ban đầu khi storage chưa sync
    const { error: uploadError } = await adminDb.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true
      });

    if (uploadError) {
      console.error('Lỗi khi upload file lên Supabase Storage:', uploadError);
      return NextResponse.json(
        { success: false, message: 'Tải file lên máy chủ thất bại: ' + uploadError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      filePath,
      originalName: file.name,
      fileSize: file.size,
      message: 'Tải file lên thành công!'
    });
  } catch (error) {
    console.error('Lỗi upload file:', error);
    return NextResponse.json(
      { success: false, message: 'Đã có lỗi hệ thống xảy ra.' },
      { status: 500 }
    );
  }
}
