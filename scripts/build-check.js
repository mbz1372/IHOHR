const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const required = [
  'public/index.html',
  'public/styles.css',
  'public/app.js',
  'public/assets/logo.svg',
  'public/assets/favicon.svg',
  'api/sms.js',
  'vercel.json',
  'package.json'
];

let ok = true;
for (const file of required) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    console.error('Missing required file:', file);
    ok = false;
  }
}

const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public/styles.css'), 'utf8');

if (!html.includes('id="view-dashboard"')) ok = fail('dashboard view not found');
if (!html.includes('id="settingsForm"')) ok = fail('settings form not found');
if (!js.includes('saveSettings')) ok = fail('settings persistence not found');
if (!js.includes('callSmsApi')) ok = fail('SMS caller not found');
if (!js.includes('renderPipelineBoard')) ok = fail('ATS pipeline not found');
if (!js.includes('applyBrandAssets')) ok = fail('brand asset support not found');
if (!html.includes('id="faviconLink"')) ok = fail('favicon link not found');
if (css.length < 1000) ok = fail('CSS seems too small');

function fail(msg) { console.error(msg); return false; }

if (!ok) process.exit(1);
console.log('IHO ATS build check passed. Zero dependency deploy is ready.');
