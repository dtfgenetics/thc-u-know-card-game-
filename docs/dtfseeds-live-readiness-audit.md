# DTFSeeds Live Readiness Audit — THC U Know

Date: 2026-07-01

Goal: identify exactly what still needs improvement before THC U Know can be pushed live as a playable invite-based game on dtfseeds.com.

## Desired live URL

```txt
https://dtfseeds.com/games/thc-u-know/
```

## Current readiness summary

```txt
✅ Game engine foundation exists.
✅ Multiplayer socket server exists.
✅ Invite panel exists with link, code, Discord text, and QR.
✅ Browser-ready visual asset folders exist.
✅ Specific digital card SVG assets exist for all current card kinds.
✅ Server has a production start script.
✅ Server has a health endpoint at /healthz.
⚠️ Full dependency-backed VS Code build/test pass is still required.
⚠️ Vite base path is not configured for /games/thc-u-know/.
⚠️ Server CORS only supports one WEB_ORIGIN string.
⚠️ Production backend host is not selected/verified.
⚠️ Production VITE_SERVER_URL is not locked.
⚠️ Redis/session persistence is not verified for public launch.
⚠️ No deployment-status doc with actual live URLs exists yet.
```

## What already works in the repo

### Server package

The server package has usable production scripts:

```json
"build": "tsc -p tsconfig.json",
"start": "node dist/index.js"
```

### Health check

The server exposes:

```txt
GET /healthz
```

Expected response:

```json
{ "ok": true, "service": "thc-u-know-server" }
```

### Invite UI

The invite panel creates:

```txt
Copy Invite Link
Copy Session Code
Copy Discord Invite
QR code
```

The invite URL is currently built from:

```ts
window.location.origin + window.location.pathname + '?join=' + code
```

This is good for dtfseeds if the frontend is actually served at `/games/thc-u-know/`.

### Visual cards

The digital card visual resolver maps every current card kind to a browser-ready SVG asset under:

```txt
apps/web/public/assets/cards/digital/
```

## Live blockers to fix before deployment

### 1. Run the real VS Code compile/test pass

Required commands:

```bash
pnpm install
pnpm -r build
pnpm test
pnpm -r lint
pnpm --filter @thc-u-know/web test:e2e
```

Deployment must not be called ready until these pass with real dependencies.

### 2. Commit pnpm-lock.yaml

If `pnpm-lock.yaml` is missing, run:

```bash
pnpm install
```

Then commit the generated lockfile. Public deployment providers need deterministic installs.

### 3. Configure frontend base path for dtfseeds route

Current target route:

```txt
/games/thc-u-know/
```

Vite should support this path. Recommended pattern:

```ts
base: process.env.VITE_BASE_PATH ?? '/'
```

Production env for dtfseeds:

```txt
VITE_BASE_PATH=/games/thc-u-know/
```

If deploying to the root of a subdomain like `games.dtfseeds.com`, use:

```txt
VITE_BASE_PATH=/
```

### 4. Lock production backend URL

Frontend currently reads:

```txt
VITE_SERVER_URL
```

Production must set this to the actual multiplayer backend URL, for example:

```txt
VITE_SERVER_URL=https://api.dtfseeds.com
```

or the external Node/WebSocket host if `api.dtfseeds.com` is not configured yet.

### 5. Fix production CORS to support multiple allowed origins

Current server env expects one URL:

```txt
WEB_ORIGIN=https://dtfseeds.com
```

For launch, support comma-separated origins:

```txt
WEB_ORIGIN=https://dtfseeds.com,https://www.dtfseeds.com,https://games.dtfseeds.com,http://localhost:5173
```

Do not use `*` in production.

### 6. Choose backend hosting path

THC U Know needs a persistent Node/Socket.IO WebSocket backend.

Acceptable production patterns:

```txt
Option A: dtfseeds hosting can run Node/WebSockets directly.
Frontend: https://dtfseeds.com/games/thc-u-know/
Backend: same host or https://dtfseeds.com/socket.io

Option B: dtfseeds hosts frontend and api.dtfseeds.com points to Node backend.
Frontend: https://dtfseeds.com/games/thc-u-know/
Backend: https://api.dtfseeds.com

Option C: dtfseeds links to a subdomain game host.
Frontend: https://games.dtfseeds.com/
Backend: https://api.dtfseeds.com
```

Best brand-safe setup:

```txt
https://dtfseeds.com/games/thc-u-know/  -> frontend
https://api.dtfseeds.com                -> backend
```

### 7. Redis/session persistence decision

Current docs recommend memory for local dev and Redis before public launch.

For first small test launch:

```txt
SESSION_STORE=memory
```

Known limitation:

```txt
Smoke Circles disappear if the backend restarts.
```

For stable public launch:

```txt
SESSION_STORE=redis
REDIS_URL=<private redis url>
```

### 8. Add production deployment config

Missing recommended files:

```txt
render.yaml or equivalent backend host config
apps/web/.env.production.example
apps/server/.env.production.example
docs/deployment-status.md
```

### 9. Live two-player test required

The game is not production-ready until this passes live:

```txt
1. Open dtfseeds game URL on device/browser A.
2. Host Smoke Circle.
3. Copy invite link.
4. Open invite link on device/browser B.
5. Join session.
6. Start game.
7. Play number card.
8. Draw card.
9. Play wild card and choose color.
10. Play target card and choose target.
11. Win round.
12. Confirm score updates.
13. Start rematch.
14. Confirm scores preserve.
```

### 10. Remaining gameplay hardening

Before wider public launch, still add:

```txt
THC U Know missed-call challenge penalty
Strict zod schemas for all socket payloads
Socket action/chat rate limiting
Final empty-Stash behavior
Reconnect stress test
Mobile layout pass
Audio/music files
Final print-matched art replacement
```

## Immediate next coding tasks

```txt
1. Update Vite config for VITE_BASE_PATH.
2. Update server WEB_ORIGIN parsing to support comma-separated origins.
3. Add .env.production.example files.
4. Add backend deploy config for the selected provider.
5. Add docs/deployment-status.md template.
6. Run build/test in VS Code and fix errors.
7. Deploy staging version.
8. Run live two-player invite test.
```

## Not ready until

```txt
✅ pnpm install passes
✅ pnpm -r build passes
✅ pnpm test passes
✅ pnpm -r lint passes
✅ Frontend loads at dtfseeds route
✅ Backend health endpoint works over HTTPS
✅ Socket.IO connects from deployed frontend
✅ Invite link joins the same Smoke Circle
✅ Two-player live game completes one round
✅ Deployment status doc is updated with real URLs
```
