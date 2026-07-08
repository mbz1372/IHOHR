import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'پنل اطلاع‌رسانی HR ایران‌هتل',
  description: 'مدیریت کاندیداها، مصاحبه‌ها و پیامک‌های منابع انسانی ایران‌هتل'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f766e'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
