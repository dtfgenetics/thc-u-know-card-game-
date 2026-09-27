import assert from 'node:assert/strict';
import fs from 'node:fs';

const table = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');

assert.match(
  table,
  /socket\.on\(Events\.ERROR, onActionError\)[\s\S]*?\}, \[soundEnabled\]\)/,
  'server-error listener must follow the current sound setting'
);
assert.match(
  table,
  /controller\.attach\(\)[\s\S]*?controller\.detach\(\)[\s\S]*?\}, \[\]\)/,
  'screen wake lock must not restart when sound settings change'
);

console.log('THC U Know sound-state lifecycle contract passed.');
