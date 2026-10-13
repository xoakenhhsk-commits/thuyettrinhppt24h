'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Phone,
  MessageSquare,
  FileText,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileCheck,
  Zap,
  Clock,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { PLANS, formatVND } from '@/lib/pricing';
import { PlanType } from '@/lib/types';
import { VIETNAM_PHONE_REGEX } from '@/lib/validations/auth';
import { ALLOWED_INPUT_EXTENSIONS, MAX_INPUT_FILE_SIZE } from '@/lib/validations/order';

function OrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = (searchParams.get('plan') as PlanType) || 'standard';

  // State luồng
  const [step, setStep] = useState<1 | 2>(1);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Step 1: Thông tin khách
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerZalo, setCustomerZalo] = useState('');

  // Form Step 2: Nội dung & Gói dịch vụ
  const [brief, setBrief] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [plan, setPlan] = useState<PlanType>(initialPlan === 'rush' ? 'rush' : 'standard');

  // Kiểm tra đăng nhập và điền thông tin tự động
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/dang-nhap?redirect=/dat-hang');
          return;
        }
        if (data.profile) {
          if (data.profile.full_name) setCustomerName(data.profile.full_name);
          if (data.profile.phone) setCustomerPhone(data.profile.phone);
          if (data.profile.zalo) setCustomerZalo(data.profile.zalo);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingUser(false));
  }, [router]);

  // Xử lý sang bước 2
  const handleProceedToStep2 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (customerName.trim().length < 2) {
      setError('Vui lòng nhập họ và tên (tối thiểu 2 ký tự).');
      return;
    }

    if (!VIETNAM_PHONE_REGEX.test(customerPhone.trim())) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam 10 số (bắt đầu bằng 03, 05, 07, 08, 09).');
      return;
    }

    if (!customerZalo.trim()) {
      setCustomerZalo(customerPhone.trim());
    }

    setStep(2);
  };

  // Xử lý chọn file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_INPUT_EXTENSIONS.includes(ext)) {
      setError(`Chỉ hỗ trợ file nội dung định dạng ${ALLOWED_INPUT_EXTENSIONS.join(', ')}`);
      return;
    }

    if (file.size > MAX_INPUT_FILE_SIZE) {
      setError('Dung lượng file tối đa là 10 MB.');
      return;
    }

    setSelectedFile(file);
    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'order-inputs');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Tải file lên thất bại.');
        setSelectedFile(null);
      } else {
        setUploadedFilePath(data.filePath);
      }
    } catch {
      setError('Lỗi kết nối khi tải file.');
      setSelectedFile(null);
    } finally {
      setUploadingFile(false);
    }
  };

  // Tạo đơn hàng
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const hasBrief = brief.trim().length >= 10;
    const hasFile = !!uploadedFilePath || !!selectedFile;

    if (!hasBrief && !hasFile) {
      setError('Vui lòng gõ yêu cầu làm bài (tối thiểu 10 ký tự) HOẶC tải lên file tài liệu nội dung.');
      return;
    }

    if (uploadingFile) {
      setError('Đang trong quá trình tải file lên, vui lòng chờ trong giây lát.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerZalo: customerZalo.trim() || customerPhone.trim(),
          brief: brief.trim() || null,
          inputFilePath: uploadedFilePath || null,
          plan
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.order) {
        setError(data.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
        setSubmitting(false);
        return;
      }

      // Chuyển ngay đến màn hình thanh toán
      router.push(`/thanh-toan/${data.order.code}`);
    } catch {
      setError('Đã có lỗi kết nối mạng xảy ra.');
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
      {/* Title */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Quy trình 2 bước
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
          Đặt làm bài thuyết trình PowerPoint
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Điền yêu cầu của bạn, hệ thống sẽ sinh mã đơn và kết nối thanh toán ngay tức thì
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-sm mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-zinc-200 dark:bg-zinc-800 -z-0"></div>
          <div
            className={`absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-300 -z-0 ${
              step === 2 ? 'w-full' : 'w-1/2'
            }`}
          ></div>

          {/* Step 1 Node */}
          <div
            onClick={() => setStep(1)}
            className={`relative z-10 flex flex-col items-center cursor-pointer`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                step >= 1
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950'
                  : 'bg-zinc-200 text-zinc-600'
              }`}
            >
              1
            </div>
            <span className="text-[11px] font-semibold mt-1 text-zinc-700 dark:text-zinc-300">
              Thông tin liên hệ
            </span>
          </div>

          {/* Step 2 Node */}
          <div
            onClick={() => {
              if (customerName && customerPhone) handleProceedToStep2();
            }}
            className={`relative z-10 flex flex-col items-center cursor-pointer`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                step === 2
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
              }`}
            >
              2
            </div>
            <span className="text-[11px] font-semibold mt-1 text-zinc-700 dark:text-zinc-300">
              Nội dung & Gói bài
            </span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* STEP 1: THÔNG TIN LIÊN HỆ */}
        {step === 1 && (
          <form onSubmit={handleProceedToStep2} className="space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <User className="w-4 h-4 text-indigo-600" />
              Bước 1: Thông tin người nhận bài
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Họ và tên của bạn <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Số điện thoại liên hệ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Số điện thoại 10 chữ số tại Việt Nam để admin liên hệ khi cần xác nhận gấp.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Số Zalo nhận bài & trao đổi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={customerZalo}
                  onChange={(e) => setCustomerZalo(e.target.value)}
                  placeholder="Số điện thoại hoặc username Zalo"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <span>Tiếp tục sang bước 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: NỘI DUNG VÀ CHỌN GÓI */}
        {step === 2 && (
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Bước 2: Yêu cầu bài làm & Chọn gói dịch vụ
              </h2>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Quay lại
              </button>
            </div>

            {/* Cung cấp nội dung: Text hoặc File */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Cách (a): Gõ nội dung, chủ đề, số lượng slide & yêu cầu
                </label>
                <textarea
                  rows={4}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Ví dụ: Làm bài thuyết trình về 'Ứng dụng Trí tuệ nhân tạo trong Y tế'. Khoảng 10-12 slide, tông màu xanh dương hiện đại, có các biểu đồ minh họa và kết luận..."
                  className="w-full p-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Cách (b): Tải file tài liệu (.docx, .pdf, .txt, tối đa 10 MB)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 rounded-2xl transition-colors bg-zinc-50/50 dark:bg-zinc-800/30">
                  <div className="space-y-2 text-center">
                    {uploadingFile ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                        <span className="text-xs text-zinc-600">Đang tải file lên...</span>
                      </div>
                    ) : selectedFile ? (
                      <div className="flex flex-col items-center">
                        <FileCheck className="w-8 h-8 text-emerald-600 mb-1" />
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {selectedFile.name}
                        </span>
                        <span className="text-[11px] text-emerald-600 font-semibold">
                          Đã tải lên máy chủ thành công ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="mx-auto h-8 w-8 text-zinc-400" />
                        <div className="flex text-xs text-zinc-600 dark:text-zinc-400">
                          <label className="relative cursor-pointer font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                            <span>Chọn file từ thiết bị</span>
                            <input
                              type="file"
                              accept=".docx,.pdf,.txt"
                              onChange={handleFileChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">hoặc kéo thả vào đây</p>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Định dạng .docx, .pdf, .txt dung lượng tối đa 10 MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chọn gói dịch vụ */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Chọn gói dịch vụ thực hiện:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Standard */}
                <div
                  onClick={() => setPlan('standard')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    plan === 'standard'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      {PLANS.standard.name}
                    </span>
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatVND(PLANS.standard.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Giao trong 3 ngày</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                    Phù hợp bài tập lớn hoặc kế hoạch thuyết trình tuần tới.
                  </p>
                </div>

                {/* Rush */}
                <div
                  onClick={() => setPlan('rush')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                    plan === 'rush'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      {PLANS.rush.name}
                    </span>
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatVND(PLANS.rush.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-bold mb-2">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Hỏa tốc trong 24 giờ (1 ngày)</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                    Ưu tiên làm trước, giao bài gấp trong ngày mai.
                  </p>
                </div>
              </div>
            </div>

            {/* Tổng tiền và Nút Xác Nhận Tạo Đơn */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="block text-xs text-zinc-500">Tổng thanh toán:</span>
                <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatVND(PLANS[plan].price)}
                </span>
              </div>
              <button
                type="submit"
                disabled={submitting || uploadingFile}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tạo đơn hàng...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Xác nhận & Chuyển sang thanh toán QR</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <OrderForm />
    </Suspense>
  );
}

