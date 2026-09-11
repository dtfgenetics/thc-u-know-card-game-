# DTFSeeds Deployment Runbook

Target URL: `https://dtfseeds.com/games/thc-u-know/`

The game needs a Node.js process because multiplayer uses Socket.IO. Static hosting alone will not support live rooms.

Use `docs/dtfseeds-multiplayer-hosting-standard.md` as the reusable multiplayer hosting rule for this game and future dtfseeds.com games.

## Verify before deploy

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm test:production-runtime
```

Do not deploy if any command fails. Repository validation is deterministic and does not depend on Playwright or a browser-automation gate. The production-runtime check boots the compiled server, verifies the scoped app route, health endpoints, Socket.IO handshake, subpath isolation, built asset base path, and the approved DTFSeeds V5 header contract.

## Production environment

```bash
NODE_ENV=production
PORT=5174
WEB_ORIGIN=https://dtfseeds.com,https://www.dtfseeds.com
WEB_BASE_PATH=/games/thc-u-know
WEB_DIST_DIR=apps/web/dist
SOCKET_IO_PATH=/games/thc-u-know/socket.io
SESSION_STORE=memory
ENABLE_REDIS_ADAPTER=false
VITE_BASE_PATH=/games/thc-u-know/
VITE_SOCKET_PATH=/games/thc-u-know/socket.io
```

Omit `VITE_SERVER_URL` when the web app and Socket.IO server share the same origin. Set it only when Socket.IO runs on a separate origin.

## Start command

```bash
pnpm start
```

## Hosting requirement

The Node app should serve:

- React app: `/games/thc-u-know/`
- Socket.IO: `/games/thc-u-know/socket.io`
- Health check: `/healthz`
- Game-scoped health check: `/games/thc-u-know/healthz`

If the main domain is handled by another app, route the game-scoped paths to this Node process and allow WebSocket upgrades. The game-scoped health route is the authoritative production check because `/healthz` may belong to the main site/router.

Hostinger options:

- If hPanel has Node.js Web App deployment available, connect the GitHub repo, use Node 22, `pnpm install --frozen-lockfile`, `pnpm verify`, `pnpm test:production-runtime`, and `pnpm start`.
- If hPanel cannot run the app under `/games/thc-u-know/`, run the backend on a Node-capable subdomain such as `https://games-api.dtfseeds.com` and set `VITE_SERVER_URL` for the frontend.
- If using VPS, run the server with PM2 or systemd and configure the reverse proxy to preserve WebSocket upgrades.
- If the host can only upload static files, deploy the frontend only and keep the unavailable-server warning visible. Do not label that state as production-ready multiplayer.

## Post-deploy checks

### Same-origin Node routing

```bash
LIVE_BASE_URL=https://dtfseeds.com pnpm live:check
```

This expects the frontend, `/games/thc-u-know/healthz`, and `/games/thc-u-know/socket.io` to be routed through the same public origin.

### Separate Node backend origin

If WordPress/static hosting serves the frontend while a Node-capable origin serves multiplayer, run:

```bash
LIVE_BASE_URL=https://dtfseeds.com \
LIVE_SERVER_URL=https://games-api.dtfseeds.com \
pnpm live:check
```

Set the repository Actions variable `THC_U_KNOW_SERVER_ORIGIN` to the deployed Node origin so scheduled smoke checks use the same split-origin topology. The web build must use the same origin through `VITE_SERVER_URL`.

Then verify:

1. The public game route contains the THC U Know app and `data-dtf-shell="header-v5"`.
2. `${LIVE_SERVER_URL:-$LIVE_BASE_URL}/games/thc-u-know/healthz` returns JSON `{ "ok": true, "service": "thc-u-know-server" }`.
3. `${LIVE_SERVER_URL:-$LIVE_BASE_URL}/games/thc-u-know/socket.io/?EIO=4&transport=polling` returns an Engine.IO open packet, not HTML.
4. Create a room with player one.
5. Join through the invite link in a second browser.
6. Start game, draw, play a number card, play action cards, play a wild, refresh/rejoin, and rematch.

The scheduled `Live Production Smoke` workflow runs every six hours to detect routing/runtime regressions between deployments. If a health or Socket.IO request returns HTML, the request is reaching the WordPress/static frontend instead of the Node multiplayer process and the route/proxy or dedicated backend origin still needs deployment work.

Rollback branch: `backup-main-before-direct-push`.
