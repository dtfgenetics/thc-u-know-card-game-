# THC U Know Deployment Status

Last updated: 2026-07-09

## Current Status

- Frontend: redeployed and verified at `https://dtfseeds.com/games/thc-u-know/`.
- Backend: not deployed publicly. The current Hostinger shared account has no Node.js runtime or process manager.
- Multiplayer: fully verified locally, but unavailable on the public URL until a persistent Node/WebSocket service is provisioned.
- Repository: pull requests `#2` and `#3` merged into `main`; GitHub CI runs `168` and `170` passed.

The live frontend explicitly reports that the multiplayer server is unavailable and disables Host/Join instead of silently failing.

## Live Paths

```txt
Frontend URL: https://dtfseeds.com/games/thc-u-know/
Frontend directory: /home/u933876325/domains/dtfseeds.com/public_html/games/thc-u-know/
Expected health URL: https://dtfseeds.com/healthz
Expected Socket.IO URL: https://dtfseeds.com/games/thc-u-know/socket.io
```

Public verification:

- Game page: HTTP 200 on 2026-07-10T01:08:32Z static redeploy.
- Current JavaScript: `/games/thc-u-know/assets/index-D9F_rE0M.js`, HTTP 200.
- Current stylesheet: `/games/thc-u-know/assets/index-BlAUcrwn.css`, HTTP 200.
- Logo, digital card art, and table assets: HTTP 200.
- Mobile rendering: visually verified with screenshot `C:\Users\green\AppData\Local\Temp\thc-u-know-live-20260710T001407Z.png`.
- Browser render check: page title `THC U Know`, logo loaded, and unavailable-server message visible.
- `/healthz`: WordPress HTTP 404, so no public Node service is present.
- Game-route health and Socket.IO paths: return static SPA HTML, not backend JSON/Socket.IO handshakes.
- Hostinger SSH check on 2026-07-10T01:08:32Z: `node`, `npm`, and `pm2` were still unavailable.

## Deployment Backups

Backups created during deployment:

```txt
/home/u933876325/backups/thc-u-know-before-20260710T010832Z.tar.gz
SHA-256: afa21c31ab45bb4f2c722ab3a5c2b92c13200238c54ec9825aa107cc7096f516

/home/u933876325/backups/thc-u-know-before-20260710T001407Z.tar.gz
SHA-256: 33a2925f6555419eaafdafec0c61a878d609be4e5f63a8d2bda50c5daf1f7e15

/home/u933876325/backups/thc-u-know-before-20260707T172750Z.tar.gz
SHA-256: 670ded86e419e2ee4ade97b117ce5d1a419cc8891404bb50adadabf9dafeb65d

/home/u933876325/backups/thc-u-know-before-20260707T173830Z.tar.gz
SHA-256: a0446b28b3002a5b30957e8fd8df7647145e0e01a8870063ba8e9c46ea09fbee
```

Only the `games/thc-u-know` directory was replaced. Other dtfseeds.com files and game directories were not changed.

## Production Configuration

No secrets were committed or uploaded.

```txt
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

`VITE_SERVER_URL` is omitted for same-origin deployment. Use a separate HTTPS backend URL only if the Node service is hosted elsewhere.

## Verification Results

- `pnpm install`: passed; `pnpm-lock.yaml` generated and committed.
- `pnpm -r lint`: passed.
- `pnpm -r build`: passed.
- `pnpm test`: passed, 17 tests.
- Full two-player Playwright test: passed after transport fallback hardening.
- Host/join/start: passed locally.
- Draw, number card, action card, wild color, target selection, and pending draw: passed locally.
- Winner announcement, score update, and rematch score preservation: passed locally.
- Production page, asset, health, polling, and WebSocket smoke tests: passed locally from one Node process.

## Remaining Blocker

Provision a persistent Node host that supports WebSocket upgrades, then route these paths to `pnpm start`:

```txt
/games/thc-u-know/
/games/thc-u-know/socket.io
/healthz
```

The current shared Hostinger shell cannot provide that process. A Hostinger Node Web App plan, Hostinger VPS, or another persistent Node provider is required before public multiplayer can be marked live.
