import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(
  css,
  /@media \(min-width: 900px\)[\s\S]*?grid-template-columns:\s*clamp\(220px, 24vw, 280px\) 1fr;/,
  'desktop table must use a bounded responsive player-rail column'
);
assert.match(
  css,
  /@media \(min-width: 900px\)[\s\S]*?\.player-rail\s*\{[\s\S]*?overflow-y:\s*auto;/,
  'desktop player rail must scroll vertically for full lobbies'
);
assert.match(
  css,
  /@media \(min-width: 900px\)[\s\S]*?\.player-rail\s*\{[\s\S]*?max-height:\s*calc\(100svh - 2rem\);/,
  'desktop player rail must stay bounded to the viewport'
);
assert.match(
  css,
  /@media \(min-width: 900px\)[\s\S]*?\.player-rail\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?top:\s*1rem;/,
  'desktop player rail must remain visible while the table scrolls'
);
assert.match(
  css,
  /@media \(min-width: 900px\) and \(max-width: 1180px\)[\s\S]*?\.game-table\s*\{[\s\S]*?gap:\s*0\.75rem;/,
  'smaller desktop widths need reduced chrome spacing'
);

console.log('THC U Know desktop table density contract passed.');
