import assert from 'node:assert/strict';
import fs from 'node:fs';

const types = fs.readFileSync('apps/server/src/state/types.ts', 'utf8');
const store = fs.readFileSync('apps/server/src/state/store.ts', 'utf8');
const memory = fs.readFileSync('apps/server/src/state/memoryStore.ts', 'utf8');
const redis = fs.readFileSync('apps/server/src/state/redisStore.ts', 'utf8');
const handlers = fs.readFileSync('apps/server/src/socket/handlers.ts', 'utf8');
const app = fs.readFileSync('apps/web/src/App.tsx', 'utf8');

assert.match(types, /resumeTokens: Record<string, string>/, 'server session must keep private player resume tokens');
assert.match(store, /resumeToken\?: string/, 'join results must return a private resume token');
assert.match(store, /joinSession\(code: string, playerName: string, playerId\?: string, resumeToken\?: string\)/, 'resume token must be accepted when resuming through join');
assert.match(store, /rejoinSession\(code: string, playerId: string, resumeToken: string\)/, 'explicit rejoin must require a resume token');

for (const source of [memory, redis]) {
  assert.match(source, /randomUUID\(\)/, 'session stores must generate private resume tokens');
  assert.match(source, /resumeTokens/, 'session stores must persist private resume tokens');
  assert.match(source, /resumeToken !== session\.resumeTokens\?\.\[playerId\]/, 'session stores must reject invalid resume tokens');
}

assert.match(handlers, /resumeToken: session\.resumeTokens\[player\.id\]/, 'session creation must return the host resume token privately');
assert.match(handlers, /payloadString\(payload, 'resumeToken'\)/, 'join and rejoin handlers must accept the private resume token');
assert.match(app, /resumeToken: string/, 'saved browser session must include the resume token');
assert.match(app, /resumeToken: saved\.resumeToken/, 'automatic reconnect must send the saved resume token');
assert.match(app, /savePlayerSession\(payload\.session\.code, payload\.player, payload\.resumeToken\)/, 'joined response must persist the private resume token');
assert.doesNotMatch(store, /return \{[\s\S]*?resumeTokens[\s\S]*?\};\s*\}/, 'public session projection must not expose resume tokens');

console.log('THC U Know private resume-token contract passed.');
