import assert from 'node:assert/strict';
import fs from 'node:fs';

const table = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');
const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(table, /className="round-history"/, 'round results must expose persisted match history');
assert.match(table, /publicState\.roundHistory\?\.slice\(\)\.reverse\(\)/, 'history must render newest completed round first');
assert.match(table, /Round \{entry\.roundNumber\}/, 'history rows must identify the round number');
assert.match(table, /\+\{entry\.pointsAwarded\}/, 'history rows must show awarded points');
assert.match(css, /\.round-history\s*\{/, 'round history needs a dedicated layout');
assert.match(css, /\.round-history-row\s*\{/, 'round history rows need dedicated styling');

console.log('THC U Know round history UI contract passed.');
