'use client';

import React, { useState } from 'react';
import { Copy, Check, QrCode, ArrowDownRight, RefreshCw, ShieldCheck } from 'lucide-react';
import { PaymentInstructions } from '@/lib/types';
import { formatVND } from '@/lib/pricing';

interface VietQRCardProps {
  instructions: PaymentInstructions;
  orderCode: string;
  isPolling?: boolean;
}

export function VietQRCard({ instructions, orderCode, isPolling = true }: VietQRCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const [qrUrl, setQrUrl] = useState(instructions.qrUrl);
  const [loadError, setLoadError] = useState(false);

  const handleImageError = () => {
    // Nếu link đầu tiên lỗi, thử fallback sang SePay QR hoặc ngược lại
    if (qrUrl.includes('vietqr.io')) {
      const sepayUrl = `https://qr.sepay.vn/img?acc=${encodeURIComponent(
        instructions.accountNumber
      )}&bank=${encodeURIComponent(instructions.bankName)}&amount=${instructions.amount}&des=${encodeURIComponent(
        orderCode
      )}&template=compact`;
      setQrUrl(sepayUrl);
    } else {
      setLoadError(true);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
          <QrCode className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Quét mã VietQR để thanh toán
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Mở ứng dụng ngân hàng bất kỳ để quét mã hoặc chuyển khoản theo thông tin bên dưới
        </p>
      </div>

      {/* QR Code Container */}
      <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 mb-6 relative group">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 bg-white rounded-xl shadow-md p-3 flex items-center justify-center overflow-hidden border border-zinc-200">
          {!loadError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qrUrl}
              alt="Mã QR thanh toán VietQR"
              className="w-full h-full object-contain"
              onError={handleImageError}
            />
          ) : (
            <div className="text-center p-4">
              <QrCode className="w-12 h-12 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">
                Vui lòng chuyển khoản theo số tài khoản bên dưới
              </p>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Tự động nhận diện thanh toán chính xác 100%</span>
        </div>
      </div>

      {/* Chi tiết chuyển khoản */}
      <div className="space-y-3.5 text-sm">
        {/* Ngân hàng */}
        <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <span className="text-zinc-500 dark:text-zinc-400">Ngân hàng thụ hưởng:</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {instructions.bankName}
          </span>
        </div>

        {/* Số tài khoản */}
        <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="block text-zinc-500 dark:text-zinc-400 text-xs">Số tài khoản:</span>
            <span className="font-mono font-bold text-base text-zinc-900 dark:text-zinc-100">
              {instructions.accountNumber}
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(instructions.accountNumber, 'acc')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 transition-all cursor-pointer"
          >
            {copiedField === 'acc' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>

        {/* Chủ tài khoản */}
        <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <span className="text-zinc-500 dark:text-zinc-400">Chủ tài khoản:</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase">
            {instructions.accountName}
          </span>
        </div>

        {/* Số tiền */}
        <div className="flex items-center justify-between p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
          <div>
            <span className="block text-indigo-700 dark:text-indigo-300 text-xs font-medium">
              Số tiền cần chuyển:
            </span>
            <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
              {formatVND(instructions.amount)}
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(String(instructions.amount), 'amount')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
          >
            {copiedField === 'amount' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>

        {/* Nội dung chuyển khoản */}
        <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-800/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              Nội dung chuyển khoản (Bắt buộc ghi chính xác):
            </span>
            <button
              onClick={() => copyToClipboard(orderCode, 'content')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-all cursor-pointer shadow-xs"
            >
              {copiedField === 'content' ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>
          <div className="font-mono text-base font-extrabold tracking-wider text-amber-900 dark:text-amber-200 py-1 px-2 bg-white/70 dark:bg-black/30 rounded border border-amber-200 dark:border-amber-900 text-center select-all">
            {orderCode}
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1.5 leading-snug">
            * Hệ thống tự động kích hoạt đơn hàng trong 5-10 giây ngay sau khi nhận được chuyển khoản với nội dung trên.
          </p>
        </div>
      </div>

      {/* Realtime status polling indicator */}
      {isPolling && (
        <div className="mt-6 flex items-center justify-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 py-2.5 px-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
          <span className="font-medium">Hệ thống đang tự động kiểm tra biến động số dư theo thời gian thực...</span>
        </div>
      )}
    </div>
  );
}
