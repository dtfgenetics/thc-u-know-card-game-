import assert from 'node:assert/strict';
import fs from 'node:fs';

const checker = fs.readFileSync('scripts/check-live.mjs', 'utf8');
const workflow = fs.readFileSync('.github/workflows/live-smoke.yml', 'utf8');

assert.match(checker, /const DEFAULT_SERVER_ORIGIN = 'https:\/\/api\.dtfseeds\.com';/, 'live smoke needs an explicit API fallback');
assert.match(
  checker,
  /normalizeOrigin\(process\.env\.LIVE_SERVER_URL, DEFAULT_SERVER_ORIGIN\)/,
  'blank LIVE_SERVER_URL must fall back to the Node API origin'
);
assert.doesNotMatch(
  checker,
  /normalizeOrigin\(process\.env\.LIVE_SERVER_URL, webOrigin\)/,
  'live smoke must not fall back to the frontend origin'
);
assert.match(
  workflow,
  /THC_U_KNOW_SERVER_ORIGIN/,
  'scheduled workflow must continue honoring the configured backend origin override'
);

console.log('THC U Know live smoke origin contract passed.');
