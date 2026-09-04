# THC U Know — Production Release Gate

THC U Know is not release-ready merely because the repository builds. It is a realtime multiplayer browser game and must pass both repository verification and live runtime verification.

## Required pre-release gate

Run:

```bash
pnpm install --frozen-lockfile
pnpm verify
```

`pnpm verify` must run lint, build, and shared game-engine tests.

## Required production runtime contract

The production deployment must provide all of the following:

- Web app: `/games/thc-u-know/`
- Health endpoint: `/games/thc-u-know/healthz`
- Socket.IO endpoint: `/games/thc-u-know/socket.io`
- WebSocket upgrade forwarding through the reverse proxy
- A persistent Node.js process running `pnpm start`

Expected production environment:

```bash
NODE_ENV=production
WEB_ORIGIN=https://dtfseeds.com,https://www.dtfseeds.com
WEB_BASE_PATH=/games/thc-u-know
WEB_DIST_DIR=apps/web/dist
SOCKET_IO_PATH=/games/thc-u-know/socket.io
VITE_BASE_PATH=/games/thc-u-know/
VITE_SOCKET_PATH=/games/thc-u-know/socket.io
```

Do not set `VITE_SERVER_URL` when web and Socket.IO share the same origin. If the backend is moved to a Node-capable subdomain, set `VITE_SERVER_URL` explicitly and verify CORS/WebSocket behavior from both dtfseeds.com origins.

## Required live verification

After deployment:

```bash
LIVE_BASE_URL=https://dtfseeds.com pnpm live:check
```

Then perform a two-browser multiplayer check:

1. Open the game in browser A.
2. Create a room with a player name.
3. Join the invite from browser B.
4. Ready both players and start.
5. Draw a card.
6. Play a legal number card.
7. Play at least one action card.
8. Play a wild card and change the active strain/color.
9. Refresh one client and confirm rejoin/recovery behavior.
10. Finish or rematch without stale room state.

## Release status rule

The game may be labeled production-ready only when both repository verification and the live multiplayer checks pass. A green repository CI run by itself is not sufficient.
