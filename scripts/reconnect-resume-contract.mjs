import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('apps/web/src/App.tsx', 'utf8');
const table = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');
const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(
  app,
  /function requestSavedRejoin\(\)[\s\S]*?socket\.emit\(Events\.SESSION_REJOIN/,
  'client must centralize saved-session rejoin requests'
);
assert.match(
  app,
  /function onConnect\(\) \{[\s\S]*?requestSavedRejoin\(\)/,
  'every Socket.IO reconnect must rejoin the saved session rooms'
);
assert.match(
  app,
  /<GameTable[\s\S]*?socketConnected=\{socketConnected\}/,
  'game table must receive live socket connection state'
);
assert.match(
  table,
  /socketConnected: boolean/,
  'game table props must expose socket connection state'
);
assert.match(
  table,
  /className="reconnect-banner"/,
  'active games need a reconnect status banner'
);
assert.match(
  table,
  /disabled=\{!isMyTurn \|\| actionPending \|\| !socketConnected\}/,
  'draw actions must stay locked while transport is disconnected'
);
assert.match(
  table,
  /disabled=\{!result\.ok \|\| actionPending \|\| !socketConnected\}/,
  'card actions must stay locked while transport is disconnected'
);
assert.match(css, /\.reconnect-banner\s*\{/, 'reconnect status needs dedicated styling');

console.log('THC U Know live reconnect resume contract passed.');
