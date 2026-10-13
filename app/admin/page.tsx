'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Zap,
  Phone,
  Calendar,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { formatVND, getPlanDetails } from '@/lib/pricing';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchOrders = async (status: string, search: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 403 || res.status === 401) {
          router.push('/dang-nhap?redirect=/admin');
          return;
        }
        alert(data.message || 'Lỗi khi tải danh sách đơn.');
        return;
      }

      setOrders(data.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter, searchTerm);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(statusFilter, searchTerm);
  };

  // Hàm tính toán cảnh báo trễ hạn
  const getDeadlineStatus = (order: Order) => {
    if (!order.due_at || order.status === 'completed' || order.status === 'cancelled') {
      return null;
    }

    const dueTime = new Date(order.due_at).getTime();
    const now = Date.now();
    const diffHours = (dueTime - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return {
        isOverdue: true,
        text: `Đã quá hạn ${Math.abs(Math.round(diffHours))} giờ!`,
        className: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
      };
    } else if (diffHours <= 12) {
      return {
        isUrgent: true,
        text: `Sắp đến hạn (còn ${Math.round(diffHours)}h)`,
        className: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
      };
    }

    return null;
  };

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Khu vực Quản trị Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            Quản lý đơn hàng bài thuyết trình
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Theo dõi, phân loại, cảnh báo tiến độ và upload file bài hoàn thành cho khách
          </p>
        </div>
      </div>

      {/* Bộ lọc & Tìm kiếm */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Ô tìm kiếm */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã đơn (PPT-...), tên khách, hoặc số điện thoại..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </form>
          <button
            onClick={handleSearchSubmit}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs hover:bg-zinc-800 transition-all cursor-pointer"
          >
            Tìm kiếm
          </button>
        </div>

        {/* Filter Tabs theo trạng thái */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'pending_payment', label: 'Chờ thanh toán' },
            { id: 'paid', label: 'Đã thanh toán' },
            { id: 'processing', label: 'Đang làm bài' },
            { id: 'completed', label: 'Hoàn thành' },
            { id: 'cancelled', label: 'Đã hủy' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách đơn hàng */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-xs text-zinc-500">Đang tải danh sách đơn hàng...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
          <FileText className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
          <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
            Không tìm thấy đơn hàng nào
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {orders.map((order) => {
            const isRush = order.plan === 'rush';
            const deadline = getDeadlineStatus(order);

            return (
              <div
                key={order.id}
                className={`bg-white dark:bg-zinc-900 rounded-2xl border p-5 shadow-xs transition-all hover:border-indigo-400 ${
                  isRush
                    ? 'border-indigo-300 dark:border-indigo-900/80 bg-indigo-50/20 dark:bg-indigo-950/10'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-extrabold text-base text-zinc-900 dark:text-white">
                      {order.code}
                    </span>
                    <StatusBadge status={order.status} />

                    {/* Huy hiệu HỎA TỐC nếu là đơn Nhanh */}
                    {isRush && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-rose-500 text-white shadow-xs animate-pulse">
                        <Zap className="w-3 h-3 fill-white" />
                        Hỏa tốc 24h (Ưu tiên)
                      </span>
                    )}

                    {/* Cảnh báo trễ hạn */}
                    {deadline && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${deadline.className}`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {deadline.text}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-zinc-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Đặt: {new Date(order.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                </div>

                {/* Thông tin chi tiết tóm tắt */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Khách hàng:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {order.customer_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Số điện thoại:</span>
                    <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                      {order.customer_phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Số tiền:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {formatVND(order.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Hạn giao bài:</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {order.due_at
                        ? new Date(order.due_at).toLocaleString('vi-VN')
                        : 'Chưa kích hoạt'}
                    </span>
                  </div>
                </div>

                {/* Footer với link chi tiết */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="text-xs text-zinc-500 truncate max-w-md">
                    {order.brief ? `Yêu cầu: "${order.brief}"` : 'Có tài liệu đính kèm'}
                  </div>
                  <Link
                    href={`/admin/${order.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-xs"
                  >
                    <span>Xem chi tiết & Xử lý</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
