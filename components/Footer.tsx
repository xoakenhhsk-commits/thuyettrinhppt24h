import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Presentation, ShieldCheck, Clock, Headphones, AlertCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-300 border-t border-zinc-800 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Cột 1: Thương hiệu */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-1 ring-zinc-700 bg-zinc-900 shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="PPT 24h Logo"
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <span className="font-extrabold text-lg text-white">PPT 24h</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dịch vụ làm bài thuyết trình PowerPoint chuyên nghiệp, đẹp mắt, giao bài nhanh đúng hẹn cho học sinh, sinh viên và người đi làm.
            </p>
          </div>

          {/* Cột 2: Cam kết dịch vụ */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Cam kết dịch vụ</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bảo mật tuyệt đối nội dung tài liệu</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Giao bài đúng hạn 100%</span>
              </li>
              <li className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-amber-400" />
                <span>Hỗ trợ chỉnh sửa theo phản hồi</span>
              </li>
            </ul>
          </div>

          {/* Cột 3: Bảng giá & Liên kết */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Bảng giá gói</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <span className="text-zinc-200 font-semibold">Gói Tiêu chuẩn:</span> 100đ (3 ngày)
              </li>
              <li>
                <span className="text-zinc-200 font-semibold">Gói Hỏa tốc:</span> 200đ (24 giờ)
              </li>
              <li className="pt-2">
                <Link href="/dat-hang" className="text-indigo-400 hover:underline font-semibold">
                  Đặt làm bài ngay &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Hỗ trợ & Lưu ý */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Hỗ trợ & Liên hệ</h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-2">
              Có thắc mắc hoặc cần tư vấn trực tiếp? Liên hệ Zalo / Hotline hỗ trợ 24/7.
            </p>
            <div className="p-3 bg-zinc-800/80 rounded-xl border border-zinc-700/60 text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                Thanh toán qua quét mã VietQR tự động. Vui lòng ghi chính xác mã đơn hàng trong nội dung chuyển tiền.
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© 2026 PPT 24h. All rights reserved.</p>
          <p>Thiết kế tối ưu cho điện thoại và máy tính.</p>
        </div>
      </div>
    </footer>
  );
}
