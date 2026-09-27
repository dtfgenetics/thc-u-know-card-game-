import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(
  css,
  /@media \(min-width: 900px\)[\s\S]*?\.player-rail\s*\{[\s\S]*?grid-column:\s*1;/,
  'desktop player rail must be pinned to the left grid column'
);
assert.match(
  css,
  /@media \(min-width: 900px\)[\s\S]*?\.table-center\s*\{[\s\S]*?grid-column:\s*2;/,
  'desktop table center must be pinned to the play column'
);
assert.match(
  css,
  /@media \(min-width: 900px\)[\s\S]*?\.hand-zone\s*\{[\s\S]*?grid-column:\s*2;/,
  'desktop hand must remain under the play column'
);
assert.match(
  css,
  /@media \(min-width: 900px\)[\s\S]*?\.reconnect-banner,[\s\S]*?\.game-error-banner\s*\{[\s\S]*?grid-column:\s*2;/,
  'desktop reconnect and error banners must never displace the player rail'
);
assert.match(
  css,
  /@media \(min-width: 621px\) and \(max-width: 899px\)/,
  'tablet layout needs a dedicated breakpoint'
);
assert.match(
  css,
  /@media \(min-width: 621px\) and \(max-width: 899px\)[\s\S]*?\.player-rail\s*\{[\s\S]*?position:\s*sticky;/,
  'tablet player rail should stay available without becoming a desktop sidebar'
);
assert.match(
  css,
  /@media \(min-width: 621px\) and \(max-width: 899px\)[\s\S]*?\.card\s*\{[\s\S]*?width:\s*150px;/,
  'tablet cards need an intermediate size'
);

console.log('THC U Know responsive table grid contract passed.');
