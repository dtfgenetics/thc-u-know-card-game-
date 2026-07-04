# DTFSeeds Deployment Runbook

Target URL: `https://dtfseeds.com/games/thc-u-know/`

The game needs a Node.js process because multiplayer uses Socket.IO. Static hosting alone will not support live rooms.

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

If the main domain is handled by another app, route those paths to this Node process and allow WebSocket upgrades.

## Post-deploy checks

1. Open `https://dtfseeds.com/healthz` and confirm JSON ok response.
2. Open `https://dtfseeds.com/games/thc-u-know/`.
3. Create a room with player one.
4. Join through the invite link in a second browser.
5. Start game, draw, play a number card, play action cards, play a wild, refresh/rejoin, and rematch.

Rollback branch: `backup-main-before-direct-push`.
