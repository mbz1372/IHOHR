const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'public/index.html',
  'public/styles.css',
  'public/app.js',
  'api/sms.js'
];

let ok = true;
for (const file of requiredFiles) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) {
    console.error(`Missing required file: ${file}`);
    ok = false;
  }
}

if (!ok) process.exit(1);

const html = fs.readFileSync(path.join(process.cwd(), 'public/index.html'), 'utf8');
if (!html.includes('app.js') || !html.includes('styles.css')) {
  console.error('index.html must reference styles.css and app.js');
  process.exit(1);
}

console.log('IHO HR SMS Panel build check passed. Zero dependencies.');
