# IHO HR SMS Panel - Zero Dependency

این نسخه از صفر برای Vercel ساخته شده و هیچ وابستگی خارجی ندارد.

یعنی:

- Next.js ندارد
- React ندارد
- Tailwind ندارد
- pnpm/npm dependency install ندارد
- فقط Static HTML/CSS/JS + یک Vercel Serverless Function برای SMS دارد

هدف این نسخه این است که خطاهای زیر دیگر رخ ندهند:

- `npm error Exit handler never called`
- `ERR_PNPM_META_FETCH_FAIL`
- `ERR_INVALID_THIS`
- خطاهای دانلود package از `registry.npmjs.org`

## اجرا روی Vercel

فایل‌ها را داخل GitHub repo بگذار و Deploy بگیر.

در Vercel این تنظیمات را بگذار:

### Install Command

```bash
node -e "console.log('IHO HR Panel: zero dependencies, install skipped')"
```

### Build Command

```bash
node scripts/build-check.js
```

### Output Directory

```bash
public
```

اگر Vercel خودش از `vercel.json` خواند، نیاز نیست دستی وارد کنی؛ اما اگر باز هم تنظیمات قبلی پروژه باقی مانده بود، دستی این سه مقدار را جایگزین کن.

## Environment Variables

برای تست اولیه:

```env
SMS_DRY_RUN=true
```

برای ارسال واقعی:

```env
SMS_IR_API_KEY=کلید API پیامک
SMS_IR_LINE_NUMBER=شماره خط پیامک
SMS_IR_BASE_URL=https://api.sms.ir
SMS_DRY_RUN=false
```

اختیاری برای امنیت API:

```env
HR_PANEL_API_TOKEN=یک_رمز_داخلی_دلخواه
```

اگر `HR_PANEL_API_TOKEN` را در Vercel گذاشتی، همان مقدار را داخل پنل از بخش تنظیمات هم وارد کن.

## اجرا روی سیستم خودت

```bash
npm start
```

بعد برو به:

```text
http://localhost:3000
```

توجه: سرور محلی فقط UI را نشان می‌دهد و Vercel Function واقعی را اجرا نمی‌کند. برای تست API پیامک، پروژه را روی Vercel Deploy کن.

## امکانات پنل

- داشبورد HR
- بانک کاندیداها
- زمان‌بندی مصاحبه
- قالب‌های پیامک HR
- ارسال پیامک تکی و گروهی
- یادآوری ۲۴ ساعت، ۳ ساعت و ۱ ساعت قبل از مصاحبه
- ورود گروهی کاندیداها
- گزارش ارسال و خروجی CSV
- تنظیمات شرکت، محل مصاحبه، امضای HR و توکن داخلی

## ساختار پروژه

```text
public/
  index.html
  styles.css
  app.js
api/
  sms.js
scripts/
  build-check.js
  local-server.js
vercel.json
package.json
.env.example
```

## نکته مهم

این نسخه برای پایداری Deploy ساخته شده است. برای همین فعلاً دیتابیس ندارد و اطلاعات داخل مرورگر HR با `localStorage` ذخیره می‌شود. قدم بعدی می‌تواند اتصال به دیتابیس مثل Supabase، Neon، یا Google Sheet باشد.
