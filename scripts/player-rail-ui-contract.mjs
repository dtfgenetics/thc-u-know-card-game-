import assert from 'node:assert/strict';
import fs from 'node:fs';

const rail = fs.readFileSync('apps/web/src/components/PlayerRail.tsx', 'utf8');
const table = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');
const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(rail, /localPlayerId: string/, 'player rail must know which seat belongs to the local player');
assert.match(rail, /roundComplete: boolean/, 'player rail must know when turn highlighting should stop');
assert.match(rail, /className="player-badges"/, 'player rail needs explicit state badges');
assert.match(rail, />You</, 'local player must be labeled in the rail');
assert.match(rail, />Host</, 'host status must be a compact badge rather than name prefix');
assert.match(rail, /\{player\.cardCount\} card\{player\.cardCount === 1 \? '' : 's'\}/, 'card count must be labeled');
assert.match(table, /localPlayerId=\{playerId\}/, 'game table must pass local player identity to the rail');
assert.match(table, /roundComplete=\{Boolean\(winner\)\}/, 'game table must stop turn emphasis when a round completes');
assert.match(css, /\.player-badges\s*\{/, 'player badges need dedicated styling');
assert.match(css, /\.player-pill\.is-local\s*\{/, 'local-player rail state needs dedicated styling');

console.log('THC U Know player rail state feedback contract passed.');
