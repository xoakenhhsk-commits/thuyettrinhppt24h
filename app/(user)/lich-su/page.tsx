'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  History,
  Download,
  CreditCard,
  Clock,
  Calendar,
  AlertCircle,
  Loader2,
  FileText,
  ExternalLink,
  PlusCircle,
  Zap
} from 'lucide-react';
import { Order } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { formatVND, getPlanDetails } from '@/lib/pricing';

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadMsg, setDownloadMsg] = useState<{ id: string; msg: string; isError?: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/orders/my-orders')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success && data.message === 'Chưa đăng nhập.') {
          router.push('/dang-nhap?redirect=/lich-su');
          return;
        }
        setOrders(data.orders || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  // Tải file bài làm bằng signed URL hết hạn sau 5 phút
  const handleDownload = async (orderId: string, orderCode: string) => {
    setDownloadingId(orderId);
    setDownloadMsg(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/download`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.downloadUrl) {
        setDownloadMsg({
          id: orderId,
          msg: data.message || 'Không thể tạo liên kết tải file.',
          isError: true
        });
        return;
      }

      setDownloadMsg({
        id: orderId,
        msg: 'Liên kết tải file hợp lệ trong 5 phút. Đang bắt đầu tải về...'
      });

      // Mở tải file
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = `${orderCode}_bai_thuyet_trinh.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setDownloadMsg({
        id: orderId,
        msg: 'Đã có lỗi xảy ra khi tải file.',
        isError: true
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-xs text-zinc-500">Đang tải lịch sử đơn hàng của bạn...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-indigo-600" />
            Lịch sử đơn hàng của bạn
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Theo dõi tiến độ thực hiện bài thuyết trình và tải file .pptx khi hoàn thành
          </p>
        </div>
        <Link
          href="/dat-hang"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Đặt làm bài mới
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
            Bạn chưa có đơn hàng nào
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto mt-1 mb-6">
            Hãy bắt đầu đặt làm bài thuyết trình đầu tiên với giá chỉ từ 2.000đ.
          </p>
          <Link
            href="/dat-hang"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md"
          >
            Đặt bài ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const planConfig = getPlanDetails(order.plan);
            const isRush = order.plan === 'rush';

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {order.code}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Đặt ngày: {new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs sm:text-sm">
                  <div>
                    <span className="block text-zinc-500 text-[11px] mb-0.5">Gói dịch vụ:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                      {isRush && <Zap className="w-3.5 h-3.5 text-rose-500" />}
                      {planConfig.name}
                    </span>
                  </div>

                  <div>
                    <span className="block text-zinc-500 text-[11px] mb-0.5">Số tiền:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {formatVND(order.amount)}
                    </span>
                  </div>

                  <div>
                    <span className="block text-zinc-500 text-[11px] mb-0.5">Hạn bàn giao:</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {order.due_at ? (
                        new Date(order.due_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      ) : (
                        <span className="text-zinc-400">Chờ thanh toán xác nhận</span>
                      )}
                    </span>
                  </div>
                </div>

                {order.brief && (
                  <div className="pt-2 pb-3 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 italic">
                    &ldquo;{order.brief}&rdquo;
                  </div>
                )}

                {/* Thông báo tải file cho đơn này */}
                {downloadMsg && downloadMsg.id === order.id && (
                  <div
                    className={`mt-2 mb-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
                      downloadMsg.isError
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{downloadMsg.msg}</span>
                  </div>
                )}

                {/* Action Footer */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-zinc-500">
                    {order.status === 'completed' && (
                      <span className="text-emerald-600 font-medium">
                        ✓ Bài thuyết trình đã sẵn sàng tải về máy
                      </span>
                    )}
                    {order.status === 'processing' && (
                      <span className="text-purple-600 font-medium">
                        • Admin đang tiến hành thiết kế slide cho bạn
                      </span>
                    )}
                    {order.status === 'paid' && (
                      <span className="text-blue-600 font-medium">
                        • Đã nhận thanh toán, đang chờ admin tiếp nhận bài
                      </span>
                    )}
                    {order.status === 'cancelled' && (
                      <span className="text-rose-600 font-medium">
                        Đã hủy {order.cancel_reason ? `(${order.cancel_reason})` : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'pending_payment' && (
                      <Link
                        href={`/thanh-toan/${order.code}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Thanh toán ngay</span>
                      </Link>
                    )}

                    {order.status === 'completed' && (
                      <button
                        onClick={() => handleDownload(order.id, order.code)}
                        disabled={downloadingId === order.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {downloadingId === order.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang tạo link...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải bài về máy (.pptx)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
