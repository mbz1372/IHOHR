import { NextResponse } from 'next/server';
export async function GET() {
    const hasApiKey = Boolean(process.env.SMS_IR_API_KEY);
    const lineNumber = process.env.SMS_IR_LINE_NUMBER || '';
    const dryRun = process.env.SMS_DRY_RUN !== 'false' || !hasApiKey;
    return NextResponse.json({
        ok: true,
        provider: 'SMS.ir',
        hasApiKey,
        hasLineNumber: Boolean(lineNumber),
        dryRun,
        message: dryRun
            ? 'پنل در حالت تستی است و پیامک واقعی ارسال نمی‌شود.'
            : 'پنل برای ارسال واقعی آماده است.'
    });
}
