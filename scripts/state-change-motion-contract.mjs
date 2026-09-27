import assert from 'node:assert/strict';
import fs from 'node:fs';

const table = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');
const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(
  table,
  /key=\{publicState\.currentPlayerId\}[\s\S]*?className=\{`turn-banner/,
  'turn banner must remount when the active player changes'
);
assert.match(
  table,
  /className="pile ashtray" key=\{publicState\.topDiscard\.id\}/,
  'discard pile must remount when a new top card lands'
);
assert.match(css, /@keyframes turn-state-in/, 'turn changes need restrained state-change motion');
assert.match(css, /@keyframes discard-land/, 'new discard cards need restrained landing motion');
assert.match(css, /\.turn-banner\s*\{[\s\S]*?animation:\s*turn-state-in/, 'turn banner must use turn-change animation');
assert.match(css, /\.ashtray\s*\{[\s\S]*?animation:\s*discard-land/, 'discard pile must use landing animation');
assert.match(
  css,
  /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.turn-banner,[\s\S]*?\.ashtray[\s\S]*?animation:\s*none;/,
  'state-change motion must be disabled for reduced-motion users'
);

console.log('THC U Know state-change motion contract passed.');
