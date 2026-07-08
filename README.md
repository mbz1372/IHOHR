# IHO ATS Zero Dependency V2

پنل جذب و اطلاع‌رسانی منابع انسانی ایران‌هتل، ساخته‌شده بدون React / Next / Tailwind / npm dependencies برای Deploy پایدار روی Vercel.

## امکانات اصلی

- داشبورد ATS
- مدیریت فرصت‌های شغلی / Job Requisition
- بانک کاندیداها
- پایپ‌لاین جذب با مراحل قابل حرکت
- مدیریت مصاحبه و یادآوری SMS
- Scorecard برای ارزیابی کاندیدا
- تسک‌های HR و پیگیری‌ها
- مرکز پیامک با قالب‌های آماده
- گزارش جذب و خروجی CSV
- بکاپ و Restore کامل JSON
- فیکس ذخیره تنظیمات و اعمال فوری روی پنل
- اتصال امن SMS.ir از مسیر `/api/sms`

## تنظیمات Vercel

Install Command:

```bash
node -e "console.log('IHO ATS: zero dependencies, install skipped')"
```

Build Command:

```bash
node scripts/build-check.js
```

Output Directory:

```bash
public
```

## Environment Variables

```env
SMS_IR_API_KEY=YOUR_SMS_IR_API_KEY
SMS_IR_LINE_NUMBER=3000XXXXXXXXXX
SMS_IR_BASE_URL=https://api.sms.ir
SMS_DRY_RUN=true
HR_API_TOKEN=
```

برای ارسال واقعی:

1. داخل پنل: تنظیمات → حالت ارسال از داخل پنل → واقعی
2. در Vercel: `SMS_DRY_RUN=false`
3. Redeploy بگیرید.

## اجرای لوکال

```bash
npm run dev
```

بعد باز کنید:

```text
http://localhost:3000
```

## نکته دیتابیس

این نسخه Zero Dependency است و دیتا را در LocalStorage همان مرورگر ذخیره می‌کند. برای ATS چندکاربره واقعی، نسخه بعدی باید دیتابیس داشته باشد؛ مثل Vercel Postgres / Supabase / MySQL و ورود کاربران.
