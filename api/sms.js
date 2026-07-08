function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1024 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (_) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function normalizeMobile(value) {
  let mobile = String(value || '').trim().replace(/[\s\-()]/g, '');
  if (mobile.startsWith('+98')) mobile = '0' + mobile.slice(3);
  if (mobile.startsWith('98')) mobile = '0' + mobile.slice(2);
  return mobile;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { ok: false, message: 'Only POST is allowed.' });
    return;
  }

  try {
    const body = await readBody(req);
    const token = process.env.HR_API_TOKEN || '';
    if (token && req.headers['x-hr-token'] !== token) {
      json(res, 401, { ok: false, message: 'توکن داخلی پنل معتبر نیست.' });
      return;
    }

    const mobiles = Array.isArray(body.mobiles) ? body.mobiles.map(normalizeMobile).filter(Boolean) : [];
    const messageText = String(body.messageText || '').trim();
    const sendDateTime = body.sendDateTime ? String(body.sendDateTime) : undefined;

    if (!mobiles.length) {
      json(res, 400, { ok: false, message: 'شماره موبایل ارسال نشده است.' });
      return;
    }
    const invalid = mobiles.filter((mobile) => !/^09\d{9}$/.test(mobile));
    if (invalid.length) {
      json(res, 400, { ok: false, message: 'یک یا چند شماره موبایل معتبر نیست.', invalid });
      return;
    }
    if (!messageText) {
      json(res, 400, { ok: false, message: 'متن پیامک خالی است.' });
      return;
    }
    if (mobiles.length > 100) {
      json(res, 400, { ok: false, message: 'در هر درخواست حداکثر ۱۰۰ شماره قابل ارسال است.' });
      return;
    }

    const dryRun = String(process.env.SMS_DRY_RUN || 'true').toLowerCase() !== 'false';
    if (dryRun) {
      json(res, 200, {
        ok: true,
        dryRun: true,
        message: 'حالت تست سرور فعال است؛ پیامک واقعی ارسال نشد.',
        payload: { mobiles, messageText, sendDateTime }
      });
      return;
    }

    const apiKey = process.env.SMS_IR_API_KEY;
    const lineNumber = process.env.SMS_IR_LINE_NUMBER;
    const baseUrl = (process.env.SMS_IR_BASE_URL || 'https://api.sms.ir').replace(/\/$/, '');

    if (!apiKey || !lineNumber) {
      json(res, 500, { ok: false, message: 'SMS_IR_API_KEY یا SMS_IR_LINE_NUMBER در Vercel تنظیم نشده است.' });
      return;
    }

    const smsPayload = {
      lineNumber: Number(lineNumber) || lineNumber,
      messageText,
      mobiles,
      sendDateTime
    };

    const upstream = await fetch(`${baseUrl}/v1/send/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-KEY': apiKey
      },
      body: JSON.stringify(smsPayload)
    });

    const text = await upstream.text();
    let upstreamData;
    try { upstreamData = text ? JSON.parse(text) : {}; }
    catch (_) { upstreamData = { raw: text }; }

    const success = upstream.ok && (upstreamData.status === 1 || upstreamData.status === 200 || upstreamData.isSuccess === true || upstreamData.data);
    json(res, success ? 200 : upstream.status || 502, {
      ok: Boolean(success),
      provider: 'sms.ir',
      status: upstream.status,
      message: success ? 'درخواست ارسال به SMS.ir ثبت شد.' : 'SMS.ir درخواست را نپذیرفت.',
      data: upstreamData
    });
  } catch (error) {
    json(res, 500, { ok: false, message: error.message || 'خطای ناشناخته در ارسال پیامک.' });
  }
};
