'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  History,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';

function OrderSuccessContent() {
  const params = useParams();
  const code = (params?.code as string || '').toUpperCase();

  return (
    <div className="max-w-lg w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-center">
      {/* Animated Success Icon */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
        Thanh toán thành công!
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">
        Đã tiếp nhận đơn hàng
      </h1>

      <div className="my-5 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <span className="block text-xs text-zinc-500 font-semibold mb-1">
          MÃ ĐƠN HÀNG CỦA BẠN:
        </span>
        <span className="font-mono text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
          {code}
        </span>
      </div>

      {/* Thông báo bắt buộc theo yêu cầu đề bài */}
      <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 text-left space-y-2 mb-8">
        <div className="flex items-start gap-2.5 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>
            <strong>Admin sẽ liên hệ với bạn qua Zalo hoặc số điện thoại trong thời gian sớm nhất</strong> để xác nhận thêm các yêu cầu chi tiết (nếu có) và bắt đầu tiến hành làm bài.
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          href="/lich-su"
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all"
        >
          <History className="w-4 h-4" />
          <span>Theo dõi tiến độ trong Lịch sử đơn hàng</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/dat-hang"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-200 font-semibold text-sm border border-zinc-200 dark:border-zinc-700 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Đặt thêm bài thuyết trình khác</span>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-indigo-600" />}>
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}
