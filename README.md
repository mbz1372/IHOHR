# IHO ATS Zero V4 — Fix Address Settings + Jobinja Import

پنل ATS و اطلاع‌رسانی HR ایران‌هتل، بدون وابستگی npm و آماده Deploy روی Vercel.

## تغییرات نسخه V4

- فیکس مشکل اعمال نشدن آدرس تنظیمات در پیامک‌ها
- آدرس، لینک نشان و تلفن HR به صورت پیش‌فرض ایران‌هتل تنظیم شد
- در پیامک‌ها، مقدار `{location}` همیشه از تنظیمات فعلی خوانده می‌شود تا کاندیداهای قدیمی با آدرس قبلی پیامک نگیرند
- در زمان ذخیره تنظیمات، آدرس‌های قدیمی کاندیداها که مقدار پیش‌فرض قبلی داشتند با آدرس جدید sync می‌شوند
- لینک لوکیشن `{link}` و تلفن `{hrPhone}` در قالب‌های مصاحبه کامل‌تر شد
- ایمپورت خروجی جابینجا، لینک رزومه و پیوست فایل رزومه محلی حفظ شده است

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
SMS_IR_API_KEY=your_sms_ir_api_key
SMS_IR_LINE_NUMBER=your_line_number
SMS_IR_BASE_URL=https://api.sms.ir
SMS_DRY_RUN=false
```

بعد از تغییر env در Vercel حتماً Redeploy بگیرید.

## تست محلی

```bash
node scripts/local-server.js
```

سپس آدرس زیر را باز کنید:

```text
http://localhost:3000
```
