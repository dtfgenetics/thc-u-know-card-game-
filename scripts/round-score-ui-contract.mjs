import assert from 'node:assert/strict';
import fs from 'node:fs';

const table = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');
const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(
  table,
  /className="round-score-breakdown"[\s\S]*?publicState\.lastRoundScore\?\.remainingCardPoints/,
  'round result must explain remaining-card points by player'
);
assert.match(
  table,
  /className="round-standing"/,
  'round result must expose per-player standing rows'
);
assert.match(
  table,
  /<strong>\{player\.score\} total<\/strong>/,
  'round breakdown must show cumulative player scores'
);
assert.match(
  css,
  /\.round-score-breakdown\s*\{/,
  'round score breakdown needs a dedicated layout'
);
assert.match(
  css,
  /\.round-standing\s*\{/,
  'round standing rows need a dedicated visual treatment'
);

console.log('THC U Know round score breakdown contract passed.');
