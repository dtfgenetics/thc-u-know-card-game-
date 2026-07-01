# THC U Know Deployment Status

Date: 2026-07-01

## Status

- Frontend: deployed as a static Vite build.
- Backend: not deployed. The current Hostinger shared account has no Node.js runtime or process manager and cannot accept incoming WebSocket connections.
- Multiplayer: locally verified, but intentionally disabled on the live page until a persistent Node/Socket.IO backend is provisioned.

## Live Locations

- Frontend URL: `https://dtfseeds.com/games/thc-u-know/`
- Frontend filesystem path: `/home/u933876325/domains/dtfseeds.com/public_html/games/thc-u-know/`
- Backend URL: not available
- Backend filesystem/process: not deployed

The deployed frontend shows a clear backend-unavailable status and disables Host/Join actions when Socket.IO cannot connect.

## Deployed Source

- Branch: `codex/prepare-thc-u-know-deployment`
- Final deployed commit: `0d929d4`
- Build output: `apps/web/dist/`
- Server output verified locally: `apps/server/dist/`

## Backups

Created before the first upload:

`/home/u933876325/backups/dtfseeds-games-before-thc-u-know-20260701T145219Z.tar.gz`

SHA-256:

`e0da42d064e8ec6c36224c7eef79971503f38480558482bb59b663543df4dac0`

Created before replacing the first THC U Know static build:

`/home/u933876325/backups/thc-u-know-before-20260701T150009Z.tar.gz`

SHA-256:

`c0681f45cc1b20fa5f81de389ed2ecd7aa5769f62c240974a300a9e0ce30afb0`

The immediately previous extracted build is retained outside `public_html` at:

`/home/u933876325/thc-u-know-previous-20260701T150009Z`

## Environment Configuration

No secrets were committed or uploaded.

Local server configuration used:

```txt
NODE_ENV=development
PORT=5174
WEB_ORIGIN=http://localhost:5173
SESSION_STORE=memory
ENABLE_REDIS_ADAPTER=false
```

The static production build was created without `VITE_SERVER_URL`. It therefore attempts same-origin Socket.IO at `/socket.io`, which currently returns `404` on this shared Hostinger account.

Required production backend configuration after provisioning a Node-capable host:

```txt
NODE_ENV=production
PORT=<provider-assigned-port>
WEB_ORIGIN=https://dtfseeds.com
SESSION_STORE=memory
ENABLE_REDIS_ADAPTER=false
```

Recommended durable production configuration:

```txt
SESSION_STORE=redis
REDIS_URL=<private authenticated Redis URL>
ENABLE_REDIS_ADAPTER=false
```

Set `ENABLE_REDIS_ADAPTER=true` only when running multiple Node processes.

For a separate backend origin, rebuild the frontend with:

```txt
VITE_SERVER_URL=https://<node-backend-host>
VITE_SOCKET_PATH=/socket.io
```

## Commands Run

```bash
pnpm install --frozen-lockfile
pnpm -r build
pnpm test
pnpm -r lint
pnpm --filter @thc-u-know/server dev
pnpm --filter @thc-u-know/web dev
PLAYWRIGHT_CHANNEL=chrome pnpm --filter @thc-u-know/web test:e2e
```

Local managed runtime:

- Node.js `24.14.0`
- pnpm `11.7.0`
- Repository package manager declaration: pnpm `9.15.4`

## Verification Results

- Recursive workspace build: passed.
- Shared engine tests: 13 passed.
- Workspace lint/type-check: passed.
- Two-player Playwright test: passed.
- Host by session code: passed locally.
- Join from an isolated second browser context: passed locally.
- Start game: passed locally.
- Card play and draw: passed locally.
- Action card: passed locally.
- Wild color choice: passed locally.
- Target selection: passed locally.
- Pending draw resolution: passed locally.
- Round win and score update: passed locally.
- Rematch with preserved scores: passed locally.
- Live frontend route: HTTP 200.
- Required live SVG assets: HTTP 200.
- Live desktop render: passed.
- Live mobile render: passed with no horizontal overflow.
- Live Socket.IO endpoint: failed as expected with HTTP 404.

## Hostinger Limitation

Read-only SSH inspection found no `node`, `npm`, or `pm2` executable on the current account. Hostinger documents incoming WebSockets as unavailable on traditional shared Web/Cloud hosting. Persistent multiplayer requires one of:

1. Hostinger managed Node.js Web App hosting, if the account is upgraded and the product supports Socket.IO WebSockets.
2. A Hostinger VPS with Node.js, a process manager, HTTPS reverse proxy, and optional Redis.
3. Another persistent Node-capable host, with `VITE_SERVER_URL` pointed to that HTTPS origin.

Official references:

- `https://www.hostinger.com/support/1583738-are-sockets-supported-at-hostinger/`
- `https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/`
- `https://www.hostinger.com/tutorials/deploy-node-js-application`

## Remaining Blockers

1. Provision a persistent Node/WebSocket backend host.
2. Configure the production backend environment and HTTPS origin.
3. Rebuild/redeploy the frontend with the final backend URL if it is not same-origin.
4. Repeat the two-player playtest against the public backend.
5. Move session state from memory to private Redis before relying on restart persistence or multiple server instances.
6. Authenticate GitHub CLI before pushing the branch or opening a pull request.
