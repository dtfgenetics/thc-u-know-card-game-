import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const port = 4180;
const origin = `http://127.0.0.1:${port}`;
const gameBase = '/games/thc-u-know';
const socketPath = `${gameBase}/socket.io/`;

const child = spawn(process.execPath, ['apps/server/dist/index.js'], {
  cwd: repoRoot,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(port),
    WEB_ORIGIN: origin,
    WEB_BASE_PATH: gameBase,
    WEB_DIST_DIR: 'apps/web/dist',
    ENABLE_REDIS_ADAPTER: 'false',
    SESSION_STORE: 'memory'
  },
  stdio: ['ignore', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';
child.stdout.on('data', chunk => { stdout += chunk.toString(); });
child.stderr.on('data', chunk => { stderr += chunk.toString(); });

async function waitForHealth() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Production server exited early (${child.exitCode}).\n${stdout}\n${stderr}`);
    try {
      const response = await fetch(`${origin}/healthz`, { headers: { Accept: 'application/json' } });
      if (response.ok) return response.json();
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 125));
  }
  throw new Error(`Production server did not become healthy.\n${stdout}\n${stderr}`);
}

try {
  const health = await waitForHealth();
  assert.equal(health.ok, true);
  assert.equal(health.service, 'thc-u-know-server');

  const nestedHealth = await fetch(`${origin}${gameBase}/healthz`);
  assert.equal(nestedHealth.status, 200);
  assert.equal((await nestedHealth.json()).ok, true);

  for (const route of [`${gameBase}/`, `${gameBase}/?join=ABC123`]) {
    const response = await fetch(`${origin}${route}`, { redirect: 'manual' });
    assert.equal(response.status, 200, `${route} returned ${response.status}`);
    const html = await response.text();
    assert.match(html, /THC U Know/i, `${route} did not return the built game HTML`);
    // The production shell may contain accessible loading/fallback content inside
    // #root. Requiring an empty root creates a false negative even though React
    // has the correct mount point and the built bundle is served correctly.
    assert.match(html, /<div\s+id="root"(?:\s[^>]*)?>/i, `${route} did not return the React root container`);
    assert.doesNotMatch(html, /src="\/src\//, `${route} returned a development Vite shell`);
  }

  const indexHtml = await readFile(path.join(repoRoot, 'apps/web/dist/index.html'), 'utf8');
  assert.match(indexHtml, /\/games\/thc-u-know\/assets\//, 'Production web build is not based under /games/thc-u-know/.');

  const handshake = await fetch(`${origin}${socketPath}?EIO=4&transport=polling&t=production-smoke`, {
    headers: { Origin: origin }
  });
  assert.equal(handshake.status, 200, `Socket.IO handshake returned ${handshake.status}`);
  const handshakeText = await handshake.text();
  assert.match(handshakeText, /^0\{/, 'Socket route did not return an Engine.IO open packet.');
  assert.doesNotMatch(handshakeText, /<!doctype html>/i, 'Socket route was incorrectly handled by the React SPA fallback.');
  const openPacket = JSON.parse(handshakeText.slice(1));
  assert.equal(typeof openPacket.sid, 'string');
  assert.ok(openPacket.sid.length > 0);
  assert.ok(Array.isArray(openPacket.upgrades));
  assert.ok(Number.isFinite(openPacket.pingInterval));
  assert.ok(Number.isFinite(openPacket.pingTimeout));

  const wrongSocket = await fetch(`${origin}/socket.io/?EIO=4&transport=polling&t=wrong-path`, { redirect: 'manual' });
  assert.notEqual(wrongSocket.status, 200, 'Root /socket.io unexpectedly accepted the production connection; subpath isolation is broken.');

  console.log(JSON.stringify({
    ok: true,
    health: '/healthz',
    nestedHealth: `${gameBase}/healthz`,
    webRoute: `${gameBase}/`,
    socketPath,
    engineIoHandshake: true,
    inviteQueryServedBySpa: true,
    serverStdoutMarker: stdout.includes(socketPath)
  }, null, 2));
} finally {
  child.kill('SIGTERM');
}
