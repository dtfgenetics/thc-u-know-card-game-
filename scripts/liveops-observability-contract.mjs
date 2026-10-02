import assert from 'node:assert/strict';
import fs from 'node:fs';

const server=fs.readFileSync('apps/server/src/index.ts','utf8');

for(const marker of [
  'THC_U_KNOW_MAINTENANCE_MODE',
  'THC_U_KNOW_MULTIPLAYER_ENABLED',
  'socketConnections',
  'socketDisconnects',
  'socketRejected',
  'connectedSockets',
  'uptimeSeconds'
]){
  assert.ok(server.includes(marker), `missing THC U Know live-ops marker: ${marker}`);
}
assert.match(server,/maintenanceMode = process\.env\.THC_U_KNOW_MAINTENANCE_MODE === 'true'/);
assert.match(server,/multiplayerEnabled = process\.env\.THC_U_KNOW_MULTIPLAYER_ENABLED !== 'false'/);
assert.match(server,/temporarily under maintenance/);
assert.match(server,/multiplayer is temporarily disabled/);
assert.match(server,/operationalMetrics/);
assert.match(server,/protocolVersion: THC_U_KNOW_PROTOCOL_VERSION/);

console.log('THC U Know live-ops and observability contract passed.');
