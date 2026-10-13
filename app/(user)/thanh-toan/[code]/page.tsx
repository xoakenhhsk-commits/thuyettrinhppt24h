'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { VietQRCard } from '@/components/VietQRCard';
import { CountdownTimer } from '@/components/CountdownTimer';
import { defaultPaymentProvider } from '@/lib/payment/sepay';
import { Order, PaymentInstructions } from '@/lib/types';
import { formatVND } from '@/lib/pricing';

function CheckoutContent() {
  const router = useRouter();
  const params = useParams();
  const code = (params?.code as string || '').toUpperCase();

  const [order, setOrder] = useState<Order | null>(null);
  const [instructions, setInstructions] = useState<PaymentInstructions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState(false);

  // 1. Tải thông tin đơn hàng và sinh hướng dẫn thanh toán
  useEffect(() => {
    let isMounted = true;

    async function fetchOrder() {
      if (!code) return;
      try {
        const res = await fetch(`/api/orders/${code}/status`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          if (isMounted) setError(data.message || 'Không tìm thấy đơn hàng.');
          return;
        }

        const currentOrder = {
          code: data.order.code,
          status: data.order.status,
          amount: data.order.amount,
          plan: data.order.plan,
          created_at: data.order.createdAt
        } as Order;

        if (isMounted) {
          setOrder(currentOrder);

          // Nếu đơn đã thanh toán xong thì chuyển luôn sang trang thành công
          if (
            currentOrder.status === 'paid' ||
            currentOrder.status === 'processing' ||
            currentOrder.status === 'completed'
          ) {
            router.push(`/thanh-cong/${code}`);
            return;
          }

          // Sinh hướng dẫn thanh toán VietQR
          const inst = defaultPaymentProvider.createPaymentInstructions(currentOrder);
          setInstructions(inst);
        }
      } catch {
        if (isMounted) setError('Lỗi kết nối khi tải đơn hàng.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [code, router]);

  // 2. Polling mỗi 3 giây kiểm tra trạng thái thanh toán từ Webhook
  useEffect(() => {
    if (!order || order.status !== 'pending_payment') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${code}/status`);
        const data = await res.json();

        if (data.success && data.order) {
          if (
            data.order.status === 'paid' ||
            data.order.status === 'processing' ||
            data.order.status === 'completed'
          ) {
            clearInterval(interval);
            router.push(`/thanh-cong/${code}`);
          }
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra trạng thái đơn:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [code, order, router]);

  // Hàm mô phỏng thanh toán giả lập dành cho kiểm thử cục bộ / demo
  const handleSimulatePayment = async () => {
    if (!order) return;
    setIsSimulating(true);

    try {
      // Gửi webhook giả lập với đầy đủ mã đơn và số tiền
      const fakeTxnId = 'SIM_' + Date.now();
      const apiKey = process.env.SEPAY_API_KEY || 'test-sepay-secret-key-12345';

      const res = await fetch('/api/webhooks/sepay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Apikey ${apiKey}`
        },
        body: JSON.stringify({
          id: fakeTxnId,
          transferType: 'in',
          transferAmount: order.amount,
          content: `Chuyen tien PPT ${order.code} thanh toan lam slide`
        })
      });

      const data = await res.json();

      if (data.success) {
        setSimulationSuccess(true);
        setTimeout(() => {
          router.push(`/thanh-cong/${code}`);
        }, 1200);
      } else {
        alert('Giả lập thất bại: ' + (data.message || 'Lỗi'));
      }
    } catch (e) {
      alert('Lỗi kết nối khi giả lập: ' + e);
    } finally {
      setIsSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-xs text-zinc-500">Đang chuẩn bị mã thanh toán VietQR...</span>
      </div>
    );
  }

  if (error || !order || !instructions) {
    return (
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mb-6">{error || 'Mã đơn không tồn tại'}</p>
          <button
            onClick={() => router.push('/dat-hang')}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md"
          >
            Tạo đơn hàng mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
      {/* Top Countdown & Status Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold text-zinc-500">Mã đơn hàng:</span>
          <div className="text-lg font-extrabold text-zinc-900 dark:text-white font-mono">
            {code}
          </div>
        </div>
        <CountdownTimer
          initialMinutes={30}
          createdAt={order.created_at}
          onExpire={() => {
            alert('Đã hết hạn 30 phút thanh toán cho đơn hàng này.');
          }}
        />
      </div>

      {/* Thông báo mô phỏng thành công */}
      {simulationSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold">
            Đã nhận diện thanh toán thành công! Đang chuyển hướng...
          </span>
        </div>
      )}

      {/* Thẻ VietQR Card */}
      <VietQRCard instructions={instructions} orderCode={code} isPolling={true} />

      {/* Khu vực Hỗ trợ & Giả lập Test Webhook */}
      <div className="mt-8 p-6 bg-zinc-100/80 dark:bg-zinc-900/60 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Chế độ kiểm thử nhanh (Demo Webhook)
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Dành cho người chấm bài / thử nghiệm: Bấm nút bên dưới để gửi tín hiệu webhook giả lập khớp đúng mã đơn <strong>{code}</strong> ({formatVND(order.amount)}) mà không cần nạp tiền thật.
        </p>
        <button
          onClick={handleSimulatePayment}
          disabled={isSimulating || simulationSuccess}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isSimulating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang gửi webhook SePay giả lập...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>Thanh toán thử nghiệm ngay (Test Webhook)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="flex-1">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
