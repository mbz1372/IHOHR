const http = require('http');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const port = process.env.PORT || 3000;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  if (req.url === '/api/sms' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, dryRun: true, local: true, message: 'Local server dry run. Deploy to Vercel for real SMS.ir integration.' }));
    return;
  }

  let filePath = path.join(publicDir, decodeURIComponent(req.url.split('?')[0] || '/'));
  if (req.url === '/' || !path.extname(filePath)) filePath = path.join(publicDir, 'index.html');
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404); res.end('Not found'); return;
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(port, () => console.log(`IHO ATS running on http://localhost:${port}`));
