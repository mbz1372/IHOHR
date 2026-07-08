# IHO ATS Zero V5 - Drag Pipeline & HR Manager Reports

نسخه V5 پنل ATS ایران‌هتل، بدون وابستگی npm و مناسب Deploy روی Vercel.

## تغییرات V5

- اضافه شدن درگ و دراپ در پایپ‌لاین جذب
- ذخیره خودکار تغییر مرحله کاندیدا بعد از Drop
- گزارش مدیریتی منابع انسانی با فیلتر فرصت شغلی و بازه زمانی
- قیف جذب و نرخ تبدیل مراحل
- گزارش عملکرد هر فرصت شغلی
- گزارش کیفیت منابع جذب مثل جابینجا، معرفی، سایت و...
- کنترل سلامت عملیات HR شامل تسک معوق، کاندیدای راکد، مصاحبه‌های آینده و پرونده‌های بدون رزومه
- خروجی CSV مخصوص گزارش مدیر منابع انسانی

## Vercel Settings

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

## SMS Env

```env
SMS_IR_API_KEY=your-key
SMS_IR_LINE_NUMBER=your-line
SMS_IR_BASE_URL=https://api.sms.ir
SMS_DRY_RUN=false
```
