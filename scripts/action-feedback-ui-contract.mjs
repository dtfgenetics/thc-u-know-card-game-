import assert from 'node:assert/strict';
import fs from 'node:fs';

const table = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');
const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(
  table,
  /const latestAction = publicState\.actionLog\.at\(-1\)/,
  'table must identify the latest authoritative action'
);
assert.match(
  table,
  /className="latest-action-banner"/,
  'latest table action needs a visible feedback surface'
);
assert.match(
  table,
  /manifestEntry\(pendingWild\.kind\)\.effect/,
  'wild picker must explain the authoritative card effect'
);
assert.match(
  table,
  /manifestEntry\(pendingTarget\.kind\)\.effect/,
  'target picker must explain the authoritative card effect'
);
assert.match(
  table,
  /playGameSound\('turn', soundEnabled\)/,
  'becoming the active player should provide a turn cue'
);
assert.match(css, /\.latest-action-banner\s*\{/, 'latest-action feedback needs dedicated styling');
assert.match(css, /@keyframes table-action-pop/, 'latest-action feedback needs a restrained state-change animation');

console.log('THC U Know action feedback and special-card guidance contract passed.');
