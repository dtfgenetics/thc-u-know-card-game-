import assert from 'node:assert/strict';
import fs from 'node:fs';

const table = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');
const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(
  table,
  /const \[actionError, setActionError\] = useState<string \| null>\(null\)/,
  'active games need local server-error state'
);
assert.match(
  table,
  /function onActionError\(payload: \{ message\?: string \}\)/,
  'game error listener must capture server error messages'
);
assert.match(
  table,
  /setActionError\(payload\.message \?\? 'That action could not be completed'\)/,
  'server errors must produce readable fallback copy'
);
assert.match(
  table,
  /setActionError\(null\)[\s\S]*?\}, \[publicState\.updatedAt, privateState\.hand\.length\]\)/,
  'authoritative state changes must clear stale action errors'
);
assert.match(
  table,
  /className="game-error-banner"/,
  'active games need a visible error banner'
);
assert.match(
  table,
  /role="alert" aria-live="assertive"/,
  'active-game errors must be announced accessibly'
);
assert.match(css, /\.game-error-banner\s*\{/, 'game error banner needs dedicated styling');

console.log('THC U Know visible in-game error contract passed.');
