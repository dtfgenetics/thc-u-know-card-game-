import assert from 'node:assert/strict';
import fs from 'node:fs';

const invite = fs.readFileSync('apps/web/src/components/InvitePanel.tsx', 'utf8');
const appCss = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');
const polish = fs.readFileSync('apps/web/src/styles/polish.css', 'utf8');

assert.match(invite, /navigator\.clipboard\?\.writeText/);
assert.match(invite, /document\.createElement\('textarea'\)/);
assert.match(invite, /document\.execCommand\?\.\('copy'\) === true/);
assert.match(invite, /Copy failed\. Share the QR code or select the session code manually\./);
assert.match(invite, /QRCodeSVG/);

assert.match(appCss, /button \{[\s\S]*min-height: 44px;[\s\S]*touch-action: manipulation;/);
assert.match(polish, /@media \(forced-colors: active\)/);
assert.match(polish, /outline: 3px solid Highlight/);

console.log('THC U Know lobby invite and accessibility contract passed.');
