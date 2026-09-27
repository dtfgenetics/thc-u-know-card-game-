import assert from 'node:assert/strict';
import fs from 'node:fs';

const card = fs.readFileSync('apps/web/src/components/ThcCard.tsx', 'utf8');
const table = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');
const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(card, /manifestEntry/, 'special cards must use the canonical effect manifest');
assert.match(card, /className="card-effect"/, 'special cards need visible effect text');
assert.match(card, /card\.kind === 'number' \? undefined : manifestEntry\(card\.kind\)\.effect/, 'effect copy must come from the shared manifest');
assert.match(table, /function onActionError\((?:payload: \{ message\?: string \})?\) \{[\s\S]*?playGameSound\('error', soundEnabled\)/, 'server-rejected actions need audible error feedback');
assert.match(css, /\.card-effect\s*\{/, 'special-card effect text needs dedicated styling');
assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.latest-action-banner/, 'latest-action animation must respect reduced-motion preferences');

console.log('THC U Know special card feedback contract passed.');
