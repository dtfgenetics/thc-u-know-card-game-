import assert from 'node:assert/strict';
import fs from 'node:fs';

const rail = fs.readFileSync('apps/web/src/components/PlayerRail.tsx', 'utf8');
const table = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');
const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(rail, /players\.length >= 6/, '6-8 player rooms must expose a crowded rail state');
assert.match(rail, /is-crowded/, 'player rail needs a crowded class');
assert.match(table, /privateState\.hand\.length >= 12/, '12+ card hands must expose a large-hand state');
assert.match(table, /is-large-hand/, 'hand zone needs a large-hand class');
assert.match(table, /data-hand-size=\{privateState\.hand\.length\}/, 'hand size must be inspectable for deterministic QA');
assert.match(css, /\.hand-zone\.is-large-hand\s+\.hand-scroll\s*\{[\s\S]*?gap:\s*0\.45rem;/, 'large hands must reduce horizontal spacing');
assert.match(css, /@media \(min-width: 900px\)[\s\S]*?\.player-rail\.is-crowded\s+\.player-pill\s*\{[\s\S]*?padding:\s*0\.55rem;/, 'crowded desktop rails must compact player pills');
assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.hand-zone\.is-large-hand\s+\.card\s*\{[\s\S]*?width:\s*132px;/, 'large phone hands need a smaller readable card footprint');
assert.match(css, /@media \(min-width: 621px\) and \(max-width: 899px\)[\s\S]*?\.hand-zone\.is-large-hand\s+\.card\s*\{[\s\S]*?width:\s*140px;/, 'large tablet hands need an intermediate compact card footprint');

console.log('THC U Know crowded table stress contract passed.');
