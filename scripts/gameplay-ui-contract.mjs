import assert from 'node:assert/strict';
import fs from 'node:fs';

const table = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');
const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(
  table,
  /<details className="table-secondary">[\s\S]*?<summary>[\s\S]*?Table Talk[\s\S]*?Smoke Talk[\s\S]*?<\/summary>/,
  'secondary table history and chat must live behind one collapsible disclosure'
);
assert.match(
  table,
  /<details className="table-secondary">[\s\S]*?<section className="action-log">[\s\S]*?<ChatBox code=\{publicState\.sessionCode\} playerId=\{playerId\} \/>[\s\S]*?<\/details>/,
  'action log and chat must remain inside the collapsed secondary surface'
);
assert.match(css, /\.table-secondary\s*\{/, 'collapsible secondary table UI needs a dedicated visual treatment');
assert.match(css, /\.table-secondary\s*>\s*summary\s*\{/, 'secondary disclosure summary needs an explicit touch target');
assert.match(
  css,
  /@media \(max-width: 620px\)[\s\S]*?\.status-row\s*\{\s*display:\s*none;/,
  'mobile layout must remove the duplicated status row so the hand stays closer to the table'
);
assert.match(
  css,
  /@media \(max-width: 620px\)[\s\S]*?\.player-pill\s*\{[\s\S]*?min-width:\s*120px;/,
  'mobile player rail must use compact player pills'
);

console.log('THC U Know gameplay hierarchy contract passed.');
