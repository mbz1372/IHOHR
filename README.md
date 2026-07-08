# IHO ATS Zero Dependency V6

پنل ATS منابع انسانی ایران‌هتل با Drag Pipeline، گزارش مدیریتی، ایمپورت جابینجا، پیامک SMS.ir و هویت بصری قابل تنظیم.

## قابلیت‌های جدید V6

- پشتیبانی از لوگو در سایدبار
- پشتیبانی از Favicon اختصاصی
- آپلود لوگو و Favicon از داخل تنظیمات
- امکان ثبت لینک لوگو و Favicon
- تم‌های رنگی آماده: ایران‌هتل، آبی سازمانی، سبز استخدام، لوکس تیره و طلایی
- حالت نمایش راحت یا فشرده
- فونت بهتر با استک فارسی مدرن بدون نیاز به دانلود پکیج
- ظاهر شیک‌تر: کارت‌ها، سایدبار، داشبورد، Nav Icons، Hero و تنظیمات

## Deploy روی Vercel

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

## پیامک واقعی

در Vercel Environment Variables:

```env
SMS_IR_API_KEY=your_api_key
SMS_IR_LINE_NUMBER=your_line_number
SMS_IR_BASE_URL=https://api.sms.ir
SMS_DRY_RUN=false
```

داخل پنل هم از تنظیمات، حالت ارسال را روی واقعی بگذار و ذخیره کن.

## نکته لوگو و Favicon

اگر با آپلود فایل تنظیم شوند، فایل به شکل Data URL داخل LocalStorage همان مرورگر ذخیره می‌شود. برای استفاده چندکاربره سازمانی، مرحله بعد دیتابیس و فایل‌استوریج مرکزی است.
