import assert from 'node:assert/strict';
import fs from 'node:fs';

const invite = fs.readFileSync('apps/web/src/components/InvitePanel.tsx', 'utf8');
const appCss = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');
const polish = fs.readFileSync('apps/web/src/styles/polish.css', 'utf8');
const browserExperience = fs.readFileSync('apps/web/src/browserExperience.ts', 'utf8');
const gameTable = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');

assert.match(invite, /shareInviteWithFallback/);
assert.match(invite, /Sharing was unavailable, so the invite link was copied instead\./);
assert.match(invite, /QRCodeSVG/);
assert.match(browserExperience, /navigator\.clipboard\?\.writeText/);
assert.match(browserExperience, /document\.createElement\('textarea'\)/);
assert.match(browserExperience, /document\.execCommand\?\.\('copy'\) === true/);
assert.match(browserExperience, /navigator\.share/);
assert.match(browserExperience, /wakeLock\?\.request/);
assert.match(gameTable, /createScreenWakeLockController/);
assert.match(gameTable, /controller\.acquire\(\)/);

assert.match(appCss, /button \{[\s\S]*min-height: 44px;[\s\S]*touch-action: manipulation;/);
assert.match(polish, /@media \(forced-colors: active\)/);
assert.match(polish, /outline: 3px solid Highlight/);

console.log('THC U Know lobby invite and accessibility contract passed.');
