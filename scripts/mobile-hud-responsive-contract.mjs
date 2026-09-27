import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(
  css,
  /\.player-rail\s*\{[\s\S]*?scroll-snap-type:\s*x proximity;/,
  'horizontal player rail should use gentle scroll snapping'
);
assert.match(
  css,
  /\.player-pill\s*\{[\s\S]*?scroll-snap-align:\s*start;/,
  'player pills should snap cleanly on narrow screens'
);
assert.match(
  css,
  /\.action-picker\s*\{[\s\S]*?env\(safe-area-inset-top\)[\s\S]*?env\(safe-area-inset-bottom\)/,
  'action picker must respect mobile safe areas'
);
assert.match(
  css,
  /@media \(max-width: 620px\)[\s\S]*?\.player-pill strong\s*\{\s*font-size:\s*0\.95rem;/,
  'mobile labeled card counts must stay compact'
);
assert.match(
  css,
  /@media \(max-width: 620px\)[\s\S]*?\.hand-header\s*\{[\s\S]*?flex-wrap:\s*wrap;/,
  'mobile hand header must wrap instead of crowding'
);
assert.match(
  css,
  /@media \(max-width: 420px\)[\s\S]*?\.hand-header\s*>\s*button\s*\{[\s\S]*?width:\s*100%;/,
  'narrow-phone THC U Know control must become full width'
);

console.log('THC U Know mobile HUD responsive polish contract passed.');
