import React from 'react';
import Link from 'next/link';
import {
  Presentation,
  Zap,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileText,
  CreditCard,
  Download,
  ArrowRight,
  Star,
  Users,
  Award
} from 'lucide-react';
import { PLANS, formatVND } from '@/lib/pricing';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-14 pb-20 md:pt-24 md:pb-32 bg-gradient-to-b from-indigo-50/70 via-white to-zinc-50 dark:from-indigo-950/30 dark:via-zinc-950 dark:to-zinc-950">
        {/* Ambient background light orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-indigo-400/20 via-violet-400/20 to-amber-300/15 blur-3xl pointer-events-none -z-10 rounded-full animate-float"></div>
        <div className="absolute top-36 -left-20 w-72 h-72 bg-indigo-500/10 blur-3xl pointer-events-none -z-10 rounded-full animate-float-delayed"></div>
        <div className="absolute top-28 -right-20 w-72 h-72 bg-amber-500/10 blur-3xl pointer-events-none -z-10 rounded-full animate-float"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 mb-6 shadow-sm hover:scale-105 transition-all cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Dịch vụ thiết kế PowerPoint uy tín #1 cho sinh viên & người đi làm</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Bài Thuyết Trình Ấn Tượng,{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-500 bg-clip-text text-transparent animate-gradient-shift">
              Chỉ Từ 2.000đ
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Không còn nỗi lo thức khuya làm slide. Gửi nội dung bài học hoặc ý tưởng, đội ngũ thiết kế chuyên nghiệp sẽ hoàn thiện bài thuyết trình chỉn chu, giao file .pptx nhanh trong 24h.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/dat-hang"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Zap className="w-5 h-5" />
              Đặt làm bài ngay bây giờ
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#bang-gia"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-base border border-zinc-200 dark:border-zinc-800 transition-all"
            >
              Xem bảng giá dịch vụ
            </Link>
          </div>

          {/* Trust Metrics */}
          <div className="mt-14 pt-10 border-t border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                3,500+
              </span>
              <span className="text-xs text-zinc-500 mt-1">Bài thuyết trình hoàn thành</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                100%
              </span>
              <span className="text-xs text-zinc-500 mt-1">Giao bài đúng thời hạn</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-500">
                4.9/5 ★
              </span>
              <span className="text-xs text-zinc-500 mt-1">Hài lòng từ khách hàng</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                24h
              </span>
              <span className="text-xs text-zinc-500 mt-1">Gói giao hỏa tốc</span>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section className="py-16 bg-white dark:bg-zinc-900/50 border-y border-zinc-200/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Quy trình nhanh gọn
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              Chỉ 4 bước đơn giản để nhận bài PowerPoint hoàn hảo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-lg flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Điền thông tin</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Nhập số điện thoại và Zalo để admin tiện liên hệ trao đổi chi tiết về nội dung.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-extrabold text-lg flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Gửi nội dung</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Nhập yêu cầu làm slide hoặc tải file (.docx, .pdf, .txt). Chọn gói Tiêu chuẩn hoặc Hỏa tốc.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-extrabold text-lg flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Quét mã QR</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Thanh toán chính xác số tiền qua VietQR. Hệ thống tự động kích hoạt đơn hàng trong vài giây.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold text-lg flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Tải bài về máy</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Theo dõi tiến độ trong Lịch sử đơn. Khi hoàn thành, bấm một chạm để tải file .pptx gốc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="bang-gia" className="py-20 bg-zinc-50 dark:bg-zinc-950 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Minh bạch & Tiết kiệm
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-zinc-900 dark:text-white">
              Bảng giá dịch vụ làm PowerPoint
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Giá trọn gói cố định, cam kết không phát sinh phụ phí bất ngờ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Gói Tiêu chuẩn */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-md flex flex-col justify-between relative hover:border-zinc-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {PLANS.standard.name}
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Phổ biến
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                  {PLANS.standard.description}
                </p>
                <div className="mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                    {formatVND(PLANS.standard.price)}
                  </span>
                  <span className="text-xs text-zinc-500 ml-2">/ bài thuyết trình</span>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>Thời hạn bàn giao: trong 3 ngày</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {PLANS.standard.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/dat-hang?plan=standard"
                className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm transition-all"
              >
                Chọn Gói Tiêu chuẩn
              </Link>
            </div>

            {/* Gói Nhanh (Hỏa tốc) */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border-2 border-indigo-600 shadow-xl flex flex-col justify-between relative overflow-hidden animate-pulse-glow hover:-translate-y-1.5 transition-all duration-300">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-violet-600 text-white text-[11px] font-extrabold uppercase px-4 py-1.5 rounded-bl-xl shadow-xs">
                Ưu tiên số 1
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {PLANS.rush.name}
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                  {PLANS.rush.description}
                </p>
                <div className="mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {formatVND(PLANS.rush.price)}
                  </span>
                  <span className="text-xs text-zinc-500 ml-2">/ bài thuyết trình</span>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-bold">
                    <Zap className="w-4 h-4" />
                    <span>Giao hỏa tốc: chỉ trong 24 giờ (1 ngày)</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {PLANS.rush.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/dat-hang?plan=rush"
                className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 hover:scale-[1.01] transition-all"
              >
                Chọn Gói Hỏa tốc 24h
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS & FAQ */}
      <section className="py-16 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Khách hàng nói gì về PPT 24h?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 italic mb-4">
                &ldquo;Mình đặt gói Hỏa tốc lúc tối muộn vì sáng hôm sau phải nộp bài báo cáo thực tập. Sáng dậy đã nhận được bài rất đẹp mắt, thầy giáo khen bố cục chuyên nghiệp!&rdquo;
              </p>
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                — Minh Trang, Sinh viên ĐH Ngoại Thương
              </span>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 italic mb-4">
                &ldquo;Chỉ 30k mà slide đẹp hơn hẳn so với mình tự làm. Thanh toán QR tự động kích hoạt ngay, theo dõi tiến độ rõ ràng.&rdquo;
              </p>
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                — Quốc Huy, Nhân viên Marketing
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-violet-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
            Sẵn sàng để có bài thuyết trình đạt điểm tối đa?
          </h2>
          <p className="text-indigo-100 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Đặt làm bài ngay hôm nay để nhận slide PowerPoint chỉn chu, chuyên nghiệp từ đội ngũ thiết kế hàng đầu.
          </p>
          <Link
            href="/dat-hang"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-700 font-extrabold hover:bg-zinc-100 transition-all shadow-xl hover:scale-105"
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
            Bắt đầu đặt làm slide ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
