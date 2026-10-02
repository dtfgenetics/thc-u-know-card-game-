import assert from 'node:assert/strict';
import fs from 'node:fs';

const server=fs.readFileSync('apps/server/src/index.ts','utf8');
const client=fs.readFileSync('apps/web/src/realtime/socket.ts','utf8');
const contract=JSON.parse(fs.readFileSync('deploy/runtime-contract.json','utf8'));

assert.equal(contract.protocolVersion,1);
assert.match(server,/THC_U_KNOW_PROTOCOL_VERSION = 1/);
assert.match(server,/socket\.handshake\.auth\?\.protocolVersion/);
assert.match(server,/client protocol is incompatible/i);
assert.match(client,/THC_U_KNOW_PROTOCOL_VERSION = 1/);
assert.match(client,/auth: \{ protocolVersion: THC_U_KNOW_PROTOCOL_VERSION \}/);
assert.match(contract.protocolMigration,/Missing handshake protocolVersion/);

console.log('THC U Know protocol v1 contract passed.');
