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

## Automated production routing check

After the frontend and Node/Socket.IO service are routed, run:

```bash
pnpm live:check
```

The command defaults to `https://dtfseeds.com` and verifies all four production surfaces:

1. `/games/thc-u-know/` returns the THC U Know HTML app.
2. `/healthz` returns `{ ok: true, service: "thc-u-know-server" }`.
3. `/games/thc-u-know/healthz` returns the same Node health payload.
4. `/games/thc-u-know/socket.io/?EIO=4&transport=polling` returns a valid Engine.IO open packet with a session id instead of the React `index.html`.

To check another environment:

```bash
LIVE_BASE_URL=https://staging.example.com pnpm live:check
```

GitHub Actions also exposes **Live Production Smoke** as a manual workflow. Run it after any hosting or reverse-proxy change and do not call the multiplayer table production-ready until it passes.

## Deployment target

- Web route: `/games/thc-u-know/`
- Socket route: `/games/thc-u-know/socket.io`
- Server health route: `/healthz`
- Main branch: `main`
- Rollback branch: `backup-main-before-direct-push`

## Standard reference

- Multiplayer hosting standard: `docs/dtfseeds-multiplayer-hosting-standard.md`
