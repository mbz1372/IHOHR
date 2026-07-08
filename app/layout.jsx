import './globals.css';
export const metadata = {
    title: 'پنل اطلاع‌رسانی HR ایران‌هتل',
    description: 'مدیریت کاندیداها، مصاحبه‌ها و پیامک‌های منابع انسانی ایران‌هتل'
};
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0f766e'
};
export default function RootLayout({ children }) {
    return (<html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>);
}
