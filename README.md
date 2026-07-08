# IHO ATS Zero V3

پنل ATS سبک منابع انسانی ایران‌هتل، بدون وابستگی npm و آماده Deploy روی Vercel.

## امکانات V3

- مدیریت فرصت‌های شغلی، کاندیداها، پایپ‌لاین جذب، مصاحبه، تسک‌های HR و پیامک
- ورود مستقیم خروجی جابینجا با فرمت `.xlsx` یا `.csv`
- ایمپورت کامل ستون‌های اصلی جابینجا:
  - #شناسه
  - عنوان آگهی
  - نام متقاضی
  - شماره تماس متقاضی
  - ایمیل
  - تاریخ ارسال درخواست همکاری
  - آدرس فایل رزومه متقاضی
- خواندن لینک مخفی رزومه از فایل Excel جابینجا و اتصال آن به پرونده کاندیدا
- ساخت خودکار فرصت شغلی از روی «عنوان آگهی» اگر قبلاً در پنل وجود نداشته باشد
- تشخیص تکراری‌ها بر اساس شناسه جابینجا یا موبایل + عنوان شغلی
- امکان پیوست فایل رزومه محلی برای هر کاندیدا با IndexedDB مرورگر
- ذخیره تنظیمات، بکاپ JSON و خروجی CSV
- اتصال امن SMS.ir از مسیر `/api/sms`

## Deploy در Vercel

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

Environment Variables:

```env
SMS_IR_API_KEY=YOUR_KEY
SMS_IR_LINE_NUMBER=YOUR_LINE
SMS_IR_BASE_URL=https://api.sms.ir
SMS_DRY_RUN=false
```

## نکته درباره فایل رزومه محلی

فایل‌های رزومه محلی داخل مرورگر همان کاربر ذخیره می‌شوند. برای ATS سازمانی چندکاربره مرحله بعد باید دیتابیس و فایل‌استوریج مرکزی اضافه شود.
