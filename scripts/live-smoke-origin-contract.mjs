import assert from 'node:assert/strict';
import fs from 'node:fs';

const checker = fs.readFileSync('scripts/check-live.mjs', 'utf8');
const workflow = fs.readFileSync('.github/workflows/live-smoke.yml', 'utf8');
const verifyWorkflow = fs.readFileSync('.github/workflows/verify-live-runtime.yml', 'utf8');

assert.doesNotMatch(
  checker,
  /DEFAULT_SERVER_ORIGIN\s*=\s*['"]https:\/\/api\.dtfseeds\.com/,
  'live smoke must not hard-code a separate API origin when the production contract defaults to same-origin'
);
assert.match(
  checker,
  /process\.env\.LIVE_SERVER_URL\s*\|\|\s*webOrigin/,
  'blank LIVE_SERVER_URL must use the frontend origin for same-origin Node/Socket.IO routing'
);
assert.match(
  workflow,
  /THC_U_KNOW_SERVER_ORIGIN/,
  'scheduled workflow must continue honoring an explicitly configured separate backend origin'
);
assert.match(
  workflow,
  /live_server_url/,
  'manual live smoke must allow an explicit backend origin override'
);

assert.match(checker, /REQUIRED_NAV_ROUTES/, 'live checker must validate canonical nav routes semantically');
assert.match(checker, /'\/tools\/'/, 'live checker must require the current Tools route');
assert.doesNotMatch(checker, />Diagnostic<|\/diagnostic\//, 'live checker must not require the retired Diagnostic nav label');
assert.match(verifyWorkflow, /same-origin/i, 'live verification summary must explain the default same-origin topology');
assert.match(verifyWorkflow, /LIVE_SERVER_URL|THC_U_KNOW_SERVER_ORIGIN/, 'live verification summary must mention the optional separate backend override');

console.log('THC U Know live smoke origin contract passed.');
