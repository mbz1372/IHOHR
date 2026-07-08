import { NextResponse } from 'next/server';
function normalizeMobile(input) {
    const en = String(input)
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
        .replace(/[^0-9+]/g, '');
    if (en.startsWith('+98'))
        return `0${en.slice(3)}`;
    if (en.startsWith('98'))
        return `0${en.slice(2)}`;
    return en;
}
function validIranMobile(mobile) {
    return /^09\d{9}$/.test(mobile);
}
export async function POST(request) {
    try {
        const body = (await request.json());
        const mobiles = (body.mobiles ?? []).map(normalizeMobile).filter(Boolean);
        const messageText = String(body.messageText ?? '').trim();
        const lineNumber = body.lineNumber ?? process.env.SMS_IR_LINE_NUMBER;
        const apiKey = process.env.SMS_IR_API_KEY;
        const baseUrl = process.env.SMS_IR_BASE_URL || 'https://api.sms.ir';
        const dryRun = process.env.SMS_DRY_RUN !== 'false' || !apiKey;
        if (!messageText) {
            return NextResponse.json({ ok: false, status: 103, message: 'متن پیامک خالی است.' }, { status: 400 });
        }
        if (!mobiles.length) {
            return NextResponse.json({ ok: false, status: 107, message: 'لیست موبایل خالی است.' }, { status: 400 });
        }
        if (mobiles.length > 100) {
            return NextResponse.json({ ok: false, status: 105, message: 'در هر درخواست حداکثر ۱۰۰ شماره موبایل مجاز است.' }, { status: 400 });
        }
        const invalidMobiles = mobiles.filter((m) => !validIranMobile(m));
        if (invalidMobiles.length) {
            return NextResponse.json({ ok: false, status: 104, message: 'شماره موبایل نامعتبر است.', invalidMobiles }, { status: 400 });
        }
        if (!lineNumber && !dryRun) {
            return NextResponse.json({ ok: false, status: 101, message: 'شماره خط پیامک تنظیم نشده است.' }, { status: 400 });
        }
        const sendDateTime = body.scheduledAt ? Math.floor(new Date(body.scheduledAt).getTime() / 1000) : null;
        if (body.scheduledAt && (!sendDateTime || Number.isNaN(sendDateTime))) {
            return NextResponse.json({ ok: false, status: 109, message: 'زمان ارسال نامعتبر است.' }, { status: 400 });
        }
        const payload = {
            lineNumber: Number(lineNumber || 0),
            MessageText: messageText,
            Mobiles: mobiles,
            SendDateTime: sendDateTime
        };
        if (dryRun) {
            return NextResponse.json({
                ok: true,
                dryRun: true,
                status: 1,
                message: 'ارسال تستی انجام شد. برای ارسال واقعی SMS_DRY_RUN=false و SMS_IR_API_KEY را تنظیم کنید.',
                data: {
                    packId: `dry-${Date.now()}`,
                    messageIds: mobiles.map((_, index) => Date.now() + index),
                    cost: 0
                },
                payload
            });
        }
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/send/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-API-KEY': apiKey
            },
            body: JSON.stringify(payload),
            cache: 'no-store'
        });
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        }
        catch {
            data = { raw: text };
        }
        return NextResponse.json(data, { status: res.ok ? 200 : res.status });
    }
    catch (error) {
        return NextResponse.json({
            ok: false,
            status: 500,
            message: error instanceof Error ? error.message : 'خطای ناشناخته در ارسال پیامک'
        }, { status: 500 });
    }
}
