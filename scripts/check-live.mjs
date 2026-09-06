const DEFAULT_WEB_ORIGIN = 'https://dtfseeds.com';
const GAME_PATH = '/games/thc-u-know/';
const GAME_HEALTH_PATH = '/games/thc-u-know/healthz';
const ROOT_HEALTH_PATH = '/healthz';
const SOCKET_PATH = '/games/thc-u-know/socket.io/?EIO=4&transport=polling';
const REQUEST_TIMEOUT_MS = 12_000;

function normalizeOrigin(value, fallback = DEFAULT_WEB_ORIGIN) {
  const url = new URL(value || fallback);
  return `${url.protocol}//${url.host}`;
}

function fail(message) {
  throw new Error(message);
}

async function request(origin, pathname, options = {}) {
  const response = await fetch(new URL(pathname, origin), {
    redirect: 'follow',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      'user-agent': 'thc-u-know-live-smoke/1.2',
      accept: options.accept || '*/*'
    }
  });

  const body = await response.text();
  return {
    status: response.status,
    contentType: response.headers.get('content-type') || '',
    body,
    finalUrl: response.url
  };
}

function assertStatus(result, expected, label) {
  if (result.status !== expected) {
    fail(`${label}: expected HTTP ${expected}, got ${result.status} from ${result.finalUrl}`);
  }
}

function routingHint(result) {
  if (result.contentType.includes('text/html') || /<html/i.test(result.body)) {
    return ' The request returned HTML, which usually means the WordPress/static frontend router handled a request that should reach the THC U Know Node server.';
  }
  return '';
}

async function checkGame(origin) {
  const result = await request(origin, GAME_PATH, { accept: 'text/html' });
  assertStatus(result, 200, 'game route');
  if (!/THC U Know/i.test(result.body)) fail('game route: response does not contain the THC U Know app');
  if (!result.contentType.includes('text/html')) fail(`game route: expected HTML, got ${result.contentType || 'unknown content type'}`);
  console.log(`PASS game route ${new URL(GAME_PATH, origin)}`);
}

async function checkHealth(origin, pathname, label) {
  const result = await request(origin, pathname, { accept: 'application/json' });
  assertStatus(result, 200, label);
  if (!result.contentType.includes('application/json')) {
    fail(`${label}: expected JSON, got ${result.contentType || 'unknown content type'}.${routingHint(result)}`);
  }

  let payload;
  try {
    payload = JSON.parse(result.body);
  } catch {
    fail(`${label}: response is not valid JSON.${routingHint(result)}`);
  }

  if (payload?.ok !== true) fail(`${label}: expected { ok: true }`);
  if (payload?.service !== 'thc-u-know-server') fail(`${label}: unexpected service ${JSON.stringify(payload?.service)}`);
  console.log(`PASS ${label} ${new URL(pathname, origin)}`);
}

async function checkOptionalRootHealth(origin) {
  try {
    await checkHealth(origin, ROOT_HEALTH_PATH, 'root health');
  } catch (error) {
    console.warn(`WARN root health is not routed to THC U Know: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function checkSocket(origin) {
  const result = await request(origin, SOCKET_PATH, { accept: 'text/plain' });
  assertStatus(result, 200, 'Socket.IO polling handshake');

  if (!result.body.startsWith('0')) {
    fail(`Socket.IO polling handshake: expected Engine.IO open packet, got ${JSON.stringify(result.body.slice(0, 120))}.${routingHint(result)}`);
  }

  let handshake;
  try {
    handshake = JSON.parse(result.body.slice(1));
  } catch {
    fail(`Socket.IO polling handshake: malformed Engine.IO open packet ${JSON.stringify(result.body.slice(0, 160))}`);
  }

  if (!handshake?.sid) fail('Socket.IO polling handshake: missing session id');
  if (!Array.isArray(handshake?.upgrades)) fail('Socket.IO polling handshake: missing upgrades array');
  if (!Number.isFinite(handshake?.pingInterval) || !Number.isFinite(handshake?.pingTimeout)) {
    fail('Socket.IO polling handshake: missing ping timing metadata');
  }

  if (result.contentType.includes('text/html') || /<html/i.test(result.body)) {
    fail('Socket.IO polling handshake: request was incorrectly routed to the frontend');
  }

  console.log(`PASS Socket.IO handshake ${new URL(SOCKET_PATH, origin)}`);
}

async function main() {
  const webOrigin = normalizeOrigin(process.env.LIVE_BASE_URL || process.argv[2] || DEFAULT_WEB_ORIGIN);
  const serverOrigin = normalizeOrigin(process.env.LIVE_SERVER_URL, webOrigin);
  console.log(`THC U Know production smoke: web=${webOrigin} server=${serverOrigin}`);

  await checkGame(webOrigin);
  await checkHealth(serverOrigin, GAME_HEALTH_PATH, 'game health');
  await checkSocket(serverOrigin);
  await checkOptionalRootHealth(serverOrigin);

  console.log('THC U Know production smoke passed: frontend, game health, and Socket.IO routing are live.');
}

main().catch((error) => {
  console.error(`THC U Know production smoke failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
