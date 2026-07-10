# Live Readiness Checklist

## Immediate checks

- Confirm the browser app builds with `pnpm -r build`.
- Confirm shared package tests pass with `pnpm test`.
- Confirm the web app route matches `/games/thc-u-know/`.
- Confirm the server health endpoint returns `{ ok: true }`.
- Confirm invite links preserve the room code.
- Confirm player names are required before joining.
- Confirm at least two players can create, join, start, play, draw, and rematch.
- Confirm production socket connection works on the same origin when `VITE_SERVER_URL` is omitted.
- Confirm the public Socket.IO path returns an Engine.IO handshake, not the React `index.html`.
- Confirm the Node server can serve the built web app when `WEB_DIST_DIR` points to `apps/web/dist`.

## Deployment target

- Web route: `/games/thc-u-know/`
- Socket route: `/games/thc-u-know/socket.io`
- Server health route: `/healthz`
- Main branch: `main`
- Rollback branch: `backup-main-before-direct-push`

## Standard reference

- Multiplayer hosting standard: `docs/dtfseeds-multiplayer-hosting-standard.md`
