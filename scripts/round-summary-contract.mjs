import assert from 'node:assert/strict';
import fs from 'node:fs';

const table = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');
const rail = fs.readFileSync('apps/web/src/components/PlayerRail.tsx', 'utf8');
const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(table, /const matchWinner = publicState\.matchWinnerId \? publicState\.players\.find/, 'match winner must be resolved separately from round winner');
assert.match(table, /const roundPoints = publicState\.lastRoundScore\?\.pointsAwarded \?\? 0/, 'round points must be surfaced');
assert.match(table, /publicState\.settings\.targetScore/, 'round summary must expose the match target');
assert.match(table, /matchWinner \? 'New Match' : 'Start Next Round'/, 'round action label must reflect next-round versus new-match behavior');
assert.match(table, /className="round-score-summary"/, 'winner panel needs a round score summary');
assert.match(rail, /player\.connected \? '' : ' is-disconnected'/, 'player rail must visually mark disconnected players');
assert.match(rail, /data-connected=\{String\(player\.connected\)\}/, 'player rail needs deterministic connected-state metadata');
assert.match(rail, /Disconnected/, 'player rail must show disconnected state in text');
assert.match(css, /\.round-score-summary\s*\{/, 'round score summary needs dedicated styling');
assert.match(css, /\.player-pill\.is-disconnected\s*\{/, 'disconnected player state needs dedicated styling');

console.log('THC U Know round summary and player-state contract passed.');
