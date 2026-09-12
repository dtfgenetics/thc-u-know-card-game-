import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');

function centeredHandScrollLeft(containerWidth, scrollWidth, itemLeft, itemWidth) {
  const maxScroll = Math.max(0, scrollWidth - containerWidth);
  const desired = itemLeft + itemWidth / 2 - containerWidth / 2;
  return Math.max(0, Math.min(desired, maxScroll));
}

assert.equal(centeredHandScrollLeft(360, 360, 0, 142), 0, 'non-scrolling hands must stay at zero');
assert.equal(centeredHandScrollLeft(360, 1000, 0, 142), 0, 'first card must clamp to the hand start');
assert.equal(centeredHandScrollLeft(360, 1000, 430, 142), 321, 'middle playable card should center in the hand viewport');
assert.equal(centeredHandScrollLeft(360, 1000, 920, 142), 640, 'last playable card must clamp to the hand end');

assert.match(source, /function centeredHandScrollLeft\(/, 'GameTable must keep deterministic horizontal centering math');
assert.match(source, /const handScrollRef = useRef<HTMLDivElement \| null>\(null\)/, 'hand scroller ref missing');
assert.match(source, /const wasMyTurnRef = useRef\(false\)/, 'turn-transition guard missing');
assert.match(source, /const previousPlayableCountRef = useRef\(0\)/, 'playability-transition guard missing');
assert.match(source, /justBecameMyTurn/, 'hand reveal must respond when the local turn begins');
assert.match(source, /newlyHasPlayableCard/, 'hand reveal must respond when a draw creates a legal play');
assert.match(source, /querySelector<HTMLButtonElement>\('\.card\.is-playable:not\(:disabled\)'\)/, 'hand reveal must target an actually playable card');
assert.match(source, /prefers-reduced-motion: reduce/, 'hand reveal must respect reduced-motion preference');
assert.match(source, /scroller\.scrollTo\(\{ left, behavior:/, 'hand reveal must scroll only the hand container horizontally');
assert.match(source, /className="hand-scroll" ref=\{handScrollRef\}/, 'hand scroller ref must be attached to the visible hand strip');
assert.doesNotMatch(source, /scrollIntoView\(/, 'turn-start playable-card reveal must not vertically move the whole page');

console.log('THC U Know mobile playable-hand visibility contract passed.');
