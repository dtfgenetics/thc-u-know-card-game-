import assert from 'node:assert/strict';
import fs from 'node:fs';

const handlers = fs.readFileSync('apps/server/src/socket/handlers.ts', 'utf8');
const memoryStore = fs.readFileSync('apps/server/src/state/memoryStore.ts', 'utf8');
const redisStore = fs.readFileSync('apps/server/src/state/redisStore.ts', 'utf8');

assert.match(
  handlers,
  /function boundPlayerId\(socket: Socket\): string \{[\s\S]*?socket\.data\.playerId/,
  'joined socket identity must come from socket.data.playerId'
);

const payloadPlayerReads = [...handlers.matchAll(/payloadString\(payload, 'playerId'/g)].length;
assert.equal(
  payloadPlayerReads,
  2,
  'only initial join/rejoin flows may read a playerId from the client payload'
);

assert.doesNotMatch(
  handlers,
  /payloadString\(payload, 'hostId'/,
  'kick authorization must never trust hostId from the client payload'
);

for (const source of [memoryStore, redisStore]) {
  assert.match(
    source,
    /if \(session\.game\?\.started\) return \{ error: 'Players cannot be kicked after the game starts' \};/,
    'stores must reject kick mutations after gameplay has started'
  );
}

console.log('THC U Know socket-bound player authority contract passed.');
