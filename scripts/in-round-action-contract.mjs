import assert from 'node:assert/strict';
import fs from 'node:fs';

const table = fs.readFileSync('apps/web/src/components/GameTable.tsx', 'utf8');
const css = fs.readFileSync('apps/web/src/styles/app.css', 'utf8');

assert.match(table, /const \[actionPending, setActionPending\] = useState\(false\)/, 'local action lock missing');
assert.match(table, /if \(actionPending\) return;/, 'play and draw actions must ignore duplicate taps while awaiting state');
assert.match(table, /setActionPending\(true\)/, 'server-bound actions must mark the UI busy');
assert.match(table, /useEffect\(\(\) => \{[\s\S]*?setActionPending\(false\)[\s\S]*?\}, \[publicState\.updatedAt, privateState\.hand\.length\]\)/, 'action lock must clear when authoritative state changes');
assert.match(table, /aria-busy=\{actionPending\}/, 'game surface must expose pending-action state');
assert.match(table, /socket\.on\(Events\.ERROR, onActionError\)/, 'server errors must release the local action lock');
assert.match(table, /socket\.off\(Events\.ERROR, onActionError\)/, 'server error recovery listener must be cleaned up');
assert.match(table, /function onActionError\((?:payload: \{ message\?: string \})?\) \{[\s\S]*?setActionPending\(false\)/, 'server action errors must clear actionPending');
assert.match(table, /disabled=\{!isMyTurn \|\| actionPending(?: \|\| !socketConnected)?\}/, 'stash must lock while an action is pending');
assert.match(table, /disabled=\{!result\.ok \|\| actionPending(?: \|\| !socketConnected)?\}/, 'hand cards must lock while an action is pending');
assert.match(table, /const canCallThcUKnow = [^;]*privateState\.hand\.length === 1[^;]*!localPlayer\?\.calledThcUKnow/, 'THC U Know call should only be offered at one card and before calling');
assert.match(table, /className="action-picker" role="dialog" aria-modal="true"/, 'wild and target decisions must use focused action-picker dialogs');
assert.match(css, /\.action-picker\s*\{/, 'action picker needs dedicated visual treatment');
assert.match(css, /\.game-action-status\s*\{/, 'pending action feedback needs a visible status style');

console.log('THC U Know in-round action feedback contract passed.');
