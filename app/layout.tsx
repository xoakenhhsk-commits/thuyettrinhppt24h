import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PPT 24h - Dịch Vụ Thiết Kế Slide PowerPoint Chuyên Nghiệp & Hỏa Tốc',
  description:
    'Dịch vụ làm slide thuyết trình PowerPoint theo yêu cầu. Giao bài chỉ từ 24h, thanh toán tự động qua VietQR, theo dõi tiến độ và tải file trực tuyến.',
  keywords: [
    'làm bài thuyết trình',
    'thiết kế powerpoint',
    'làm slide ppt',
    'dịch vụ làm ppt',
    'slide đẹp thuyết trình'
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${plusJakartaSans.variable} font-sans h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white"
        suppressHydrationWarning
      >
        <Suspense fallback={<div className="h-16 w-full border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
