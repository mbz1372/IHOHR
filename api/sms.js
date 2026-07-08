function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-HR-Token');
}

function normalizeMobile(value) {
  if (!value) return '';
  let mobile = String(value).trim().replace(/[\s\-()]/g, '');
  if (mobile.startsWith('+98')) mobile = '0' + mobile.slice(3);
  if (mobile.startsWith('98')) mobile = '0' + mobile.slice(2);
  return mobile;
}

function uniqueMobiles(mobiles) {
  return Array.from(new Set((mobiles || [])
    .map(normalizeMobile)
    .filter((m) => /^09\d{9}$/.test(m))));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1024 * 1024) {
        reject(new Error('Request body is too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, message: 'Only POST is allowed.' });
  }

  try {
    const configuredToken = process.env.HR_PANEL_API_TOKEN || '';
    if (configuredToken) {
      const requestToken = req.headers['x-hr-token'] || '';
      if (requestToken !== configuredToken) {
        return json(res, 401, { ok: false, message: 'Unauthorized request.' });
      }
    }

    const body = await readBody(req);
    const messageText = String(body.messageText || '').trim();
    const mobiles = uniqueMobiles(body.mobiles || []);
    const sendDateTime = body.sendDateTime ? String(body.sendDateTime) : undefined;
    const dryRun = String(process.env.SMS_DRY_RUN || 'true').toLowerCase() !== 'false';
    const lineNumber = process.env.SMS_IR_LINE_NUMBER;
    const apiKey = process.env.SMS_IR_API_KEY;
    const baseUrl = process.env.SMS_IR_BASE_URL || 'https://api.sms.ir';

    if (!messageText) {
      return json(res, 400, { ok: false, message: 'متن پیامک خالی است.' });
    }
    if (!mobiles.length) {
      return json(res, 400, { ok: false, message: 'شماره موبایل معتبر پیدا نشد.' });
    }
    if (messageText.length > 900) {
      return json(res, 400, { ok: false, message: 'متن پیامک بیش از حد طولانی است.' });
    }

    if (dryRun) {
      return json(res, 200, {
        ok: true,
        dryRun: true,
        message: 'حالت تست فعال است؛ پیامک واقعی ارسال نشد.',
        count: mobiles.length,
        preview: { mobiles, messageText, sendDateTime: sendDateTime || null }
      });
    }

    if (!apiKey || !lineNumber) {
      return json(res, 500, {
        ok: false,
        message: 'SMS_IR_API_KEY یا SMS_IR_LINE_NUMBER در Environment Variables تنظیم نشده است.'
      });
    }

    const responses = [];
    const chunks = chunkArray(mobiles, 100);

    for (const group of chunks) {
      const payload = {
        lineNumber: Number.isNaN(Number(lineNumber)) ? lineNumber : Number(lineNumber),
        messageText,
        mobiles: group
      };

      if (sendDateTime) payload.sendDateTime = sendDateTime;

      const smsResponse = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/send/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-KEY': apiKey
        },
        body: JSON.stringify(payload)
      });

      const raw = await smsResponse.text();
      let parsed;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch (_) {
        parsed = raw;
      }

      responses.push({
        status: smsResponse.status,
        ok: smsResponse.ok,
        count: group.length,
        response: parsed
      });
    }

    const allOk = responses.every((item) => item.ok);
    return json(res, allOk ? 200 : 502, {
      ok: allOk,
      dryRun: false,
      count: mobiles.length,
      batches: responses.length,
      responses
    });
  } catch (error) {
    return json(res, 500, {
      ok: false,
      message: error.message || 'Unexpected server error.'
    });
  }
};
