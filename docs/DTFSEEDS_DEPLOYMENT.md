# DTFSeeds Deployment Runbook

Target URL: `https://dtfseeds.com/games/thc-u-know/`

The game needs a Node.js process because multiplayer uses Socket.IO. Static hosting alone will not support live rooms.

Use `docs/dtfseeds-multiplayer-hosting-standard.md` as the reusable multiplayer hosting rule for this game and future dtfseeds.com games.

## Verify before deploy

```bash
pnpm install
pnpm -r lint
pnpm -r build
pnpm test
```

Do not deploy if any command fails.

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
- Alternate health check: `/games/thc-u-know/healthz`

If the main domain is handled by another app, route those paths to this Node process and allow WebSocket upgrades.

Hostinger options:

- If hPanel has Node.js Web App deployment available, connect the GitHub repo, use Node 22, `pnpm install --frozen-lockfile`, `pnpm -r build`, and `pnpm start`.
- If hPanel cannot run the app under `/games/thc-u-know/`, run the backend on a Node-capable subdomain such as `https://games-api.dtfseeds.com` and set `VITE_SERVER_URL` for the frontend.
- If using VPS, run the server with PM2 or systemd and configure the reverse proxy to preserve WebSocket upgrades.
- If the host can only upload static files, deploy the frontend only and keep the unavailable-server warning visible.

## Post-deploy checks

1. Open `https://dtfseeds.com/healthz` and confirm JSON ok response.
2. Open `https://dtfseeds.com/games/thc-u-know/healthz` and confirm JSON ok response.
3. Open `https://dtfseeds.com/games/thc-u-know/socket.io/?EIO=4&transport=polling` and confirm it returns a Socket.IO handshake, not the React `index.html`.
4. Open `https://dtfseeds.com/games/thc-u-know/`.
5. Create a room with player one.
6. Join through the invite link in a second browser.
7. Start game, draw, play a number card, play action cards, play a wild, refresh/rejoin, and rematch.

Rollback branch: `backup-main-before-direct-push`.
