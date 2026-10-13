'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  FileText,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  XCircle,
  Play,
  Check,
  CreditCard,
  FileCheck
} from 'lucide-react';
import { Order, OrderEvent, OrderStatus, Payment } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { formatVND, getPlanDetails } from '@/lib/pricing';
import { ALLOWED_OUTPUT_EXTENSIONS, MAX_OUTPUT_FILE_SIZE } from '@/lib/validations/order';

function AdminOrderDetailContent() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [inputFileUrl, setInputFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State upload file hoàn thành (.pptx)
  const [outputFile, setOutputFile] = useState<File | null>(null);
  const [uploadedOutputPath, setUploadedOutputPath] = useState<string | null>(null);
  const [uploadingOutput, setUploadingOutput] = useState(false);

  // Modal / form hủy đơn
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 403 || res.status === 401) {
          router.push('/dang-nhap?redirect=/admin');
          return;
        }
        setError(data.message || 'Không tìm thấy đơn hàng.');
        return;
      }

      setOrder(data.order);
      setEvents(data.events || []);
      setPayments(data.payments || []);
      setInputFileUrl(data.inputFileUrl || null);
    } catch {
      setError('Lỗi kết nối khi tải chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  // Upload file .pptx hoàn thành
  const handleOutputFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order) return;

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_OUTPUT_EXTENSIONS.includes(ext)) {
      alert('Chỉ hỗ trợ tải lên file PowerPoint (.pptx).');
      return;
    }

    if (file.size > MAX_OUTPUT_FILE_SIZE) {
      alert('Dung lượng file tối đa là 50 MB.');
      return;
    }

    setOutputFile(file);
    setUploadingOutput(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'order-outputs');
      formData.append('orderCode', order.code);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'Tải file .pptx lên thất bại.');
        setOutputFile(null);
      } else {
        setUploadedOutputPath(data.filePath);
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err);
      setOutputFile(null);
    } finally {
      setUploadingOutput(false);
    }
  };

  // Chuyển trạng thái đơn
  const handleTransition = async (toStatus: OrderStatus, customDeliveredPath?: string) => {
    if (!order) return;
    setActionLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        toStatus
      };

      if (toStatus === 'completed') {
        const path = customDeliveredPath || uploadedOutputPath || order.delivered_file_path;
        if (!path) {
          alert('Bắt buộc phải tải file PowerPoint (.pptx) lên trước khi bấm Hoàn thành!');
          setActionLoading(false);
          return;
        }
        payload.deliveredFilePath = path;
        payload.note = 'Admin hoàn thành bài và đã tải file .pptx lên cho khách';
      }

      if (toStatus === 'processing') {
        payload.note = 'Admin tiếp nhận đơn và bắt đầu tiến hành làm bài';
      }

      if (toStatus === 'paid') {
        payload.note = 'Admin xác nhận thanh toán thủ công (đối soát tay)';
      }

      const res = await fetch(`/api/orders/${orderId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || 'Cập nhật trạng thái thất bại.');
      } else {
        await fetchOrderDetail();
      }
    } catch {
      alert('Lỗi kết nối khi cập nhật.');
    } finally {
      setActionLoading(false);
    }
  };

  // Xác nhận hủy đơn
  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Bắt buộc phải nhập lý do hủy đơn.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toStatus: 'cancelled',
          cancelReason: cancelReason.trim(),
          note: `Admin hủy đơn: ${cancelReason.trim()}`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'Hủy đơn thất bại.');
      } else {
        setShowCancelModal(false);
        await fetchOrderDetail();
      }
    } catch (e) {
      alert('Lỗi: ' + e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-xs text-zinc-500">Đang tải chi tiết đơn hàng...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 py-12 px-4 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold">{error || 'Không tìm thấy đơn hàng'}</h2>
        <Link
          href="/admin"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  const planConfig = getPlanDetails(order.plan);

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      {/* Back button & Title */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách đơn
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">
              {order.code}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <div className="text-xs text-zinc-500">
            Khởi tạo: {new Date(order.created_at).toLocaleString('vi-VN')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CỘT TRÁI (2/3): YÊU CẦU, TÀI LIỆU, FILE HOÀN THÀNH */}
        <div className="md:col-span-2 space-y-6">
          {/* Box 1: Thông tin yêu cầu nội dung */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <h2 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <FileText className="w-4 h-4 text-indigo-600" />
              Yêu cầu & Nội dung từ khách hàng
            </h2>

            {order.brief ? (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {order.brief}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">Khách hàng không nhập mô tả chữ.</p>
            )}

            {/* File đính kèm của khách */}
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-500 block mb-2">
                File tài liệu khách gửi:
              </span>
              {inputFileUrl ? (
                <a
                  href={inputFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải file tài liệu của khách (.docx, .pdf, .txt)</span>
                </a>
              ) : (
                <span className="text-xs text-zinc-400 italic">Không có file đính kèm.</span>
              )}
            </div>
          </div>

          {/* Box 2: Tải lên bài thuyết trình hoàn thành (.pptx) */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <h2 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
              <UploadCloud className="w-5 h-5 text-indigo-600" />
              Tải lên file bài thuyết trình (.pptx)
            </h2>
            <p className="text-xs text-zinc-500 mb-4">
              File PowerPoint bài làm chỉ gắn vào đúng đơn và khách này. Tối đa 50 MB.
            </p>

            <div className="p-5 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/30 text-center">
              {uploadingOutput ? (
                <div className="flex flex-col items-center py-2">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                  <span className="text-xs text-zinc-600">Đang tải file .pptx lên máy chủ...</span>
                </div>
              ) : uploadedOutputPath || order.delivered_file_path ? (
                <div className="flex flex-col items-center py-2">
                  <FileCheck className="w-10 h-10 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {outputFile ? outputFile.name : 'Đã có file bài làm .pptx trên hệ thống'}
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Đường dẫn: {uploadedOutputPath || order.delivered_file_path}
                  </p>

                  <label className="mt-3 text-xs text-indigo-600 font-semibold cursor-pointer hover:underline">
                    <span>Thay đổi file khác</span>
                    <input
                      type="file"
                      accept=".pptx"
                      onChange={handleOutputFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all">
                    <UploadCloud className="w-4 h-4" />
                    <span>Chọn file .pptx để tải lên</span>
                    <input
                      type="file"
                      accept=".pptx"
                      onChange={handleOutputFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-[11px] text-zinc-400 mt-2">
                    Bắt buộc phải tải file trước khi chuyển sang trạng thái Hoàn thành
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Box 3: Lịch sử thao tác & sự kiện (order_events) */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <h2 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-indigo-600" />
              Lịch sử sự kiện đơn hàng
            </h2>

            <div className="space-y-3">
              {events.map((ev, i) => (
                <div
                  key={ev.id || i}
                  className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl text-xs"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {ev.to_status}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {new Date(ev.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    {ev.note && <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">{ev.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (1/3): THÔNG TIN KHÁCH & HÀNH ĐỘNG ADMIN */}
        <div className="space-y-6">
          {/* Box Khách hàng */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Thông tin liên hệ khách
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 block text-[11px]">Họ tên:</span>
                <span className="font-bold text-sm text-zinc-900 dark:text-white">
                  {order.customer_name}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Số điện thoại:</span>
                <span className="font-mono font-bold text-sm text-zinc-900 dark:text-white">
                  {order.customer_phone}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Zalo:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {order.customer_zalo}
                </span>
              </div>

              {/* Nút gọi và nút mở Zalo */}
              <div className="pt-3 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${order.customer_phone}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 transition-all text-center"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Gọi điện
                </a>
                <a
                  href={`https://zalo.me/${order.customer_zalo || order.customer_phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition-all text-center"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Mở Zalo
                </a>
              </div>
            </div>
          </div>

          {/* Box Chi tiết gói & Giá */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs text-xs space-y-3">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              Chi tiết thanh toán
            </h3>

            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Gói dịch vụ:</span>
              <span className="font-bold">{planConfig.name}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Số tiền đơn:</span>
              <span className="font-extrabold text-indigo-600 text-sm">
                {formatVND(order.amount)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Hạn giao bài:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {order.due_at ? new Date(order.due_at).toLocaleString('vi-VN') : 'Chưa kích hoạt'}
              </span>
            </div>

            {order.paid_at && (
              <div className="flex justify-between py-1 text-emerald-600">
                <span>Đã trả lúc:</span>
                <span className="font-medium">
                  {new Date(order.paid_at).toLocaleString('vi-VN')}
                </span>
              </div>
            )}
          </div>

          {/* Box Điều khiển trạng thái (Admin Actions) */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-2">
              Thao tác cập nhật đơn
            </h3>

            {/* Nút duyệt thanh toán thủ công nếu đơn pending_payment */}
            {order.status === 'pending_payment' && (
              <button
                onClick={() => handleTransition('paid')}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Xác nhận thanh toán thủ công</span>
              </button>
            )}

            {/* Nút chuyển sang Đang làm bài nếu đơn paid */}
            {order.status === 'paid' && (
              <button
                onClick={() => handleTransition('processing')}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Tiếp nhận đơn & Bắt đầu làm bài</span>
              </button>
            )}

            {/* Nút Hoàn thành nếu đơn processing */}
            {order.status === 'processing' && (
              <button
                onClick={() => handleTransition('completed')}
                disabled={actionLoading || uploadingOutput}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Hoàn thành & Bàn giao bài cho khách</span>
              </button>
            )}

            {/* Nút Hủy đơn */}
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Hủy đơn hàng</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL HỦY ĐƠN */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-rose-600 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Xác nhận hủy đơn hàng
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Vui lòng nhập lý do hủy đơn (bắt buộc ghi rõ lý do để lưu lịch sử).
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ví dụ: Khách yêu cầu hủy, hoặc nội dung không hợp lệ..."
              className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white mb-4 focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={actionLoading || !cancelReason.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:opacity-50"
              >
                {actionLoading ? 'Đang hủy...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <AdminOrderDetailContent />
    </Suspense>
  );
}

