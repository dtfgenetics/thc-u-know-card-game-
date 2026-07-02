# THC U Know Deployment Status

Date started: 2026-07-01

## Target

```txt
Frontend target: https://dtfseeds.com/games/thc-u-know/
Recommended backend target: https://api.dtfseeds.com
```

## Current status

```txt
Status: NOT LIVE YET
```

## Build status

```txt
pnpm install: NOT RUN / NOT RECORDED
pnpm -r build: NOT RUN / NOT RECORDED
pnpm test: NOT RUN / NOT RECORDED
pnpm -r lint: NOT RUN / NOT RECORDED
pnpm --filter @thc-u-know/web test:e2e: NOT RUN / NOT RECORDED
```

## Frontend deployment

```txt
Host:
URL:
Build command:
Output directory:
VITE_BASE_PATH:
VITE_SERVER_URL:
```

## Backend deployment

```txt
Host:
URL:
Health endpoint:
NODE_ENV:
WEB_ORIGIN:
SESSION_STORE:
Redis enabled:
```

## DTFSeeds integration

```txt
Integration method:
- /games/thc-u-know/ static route
- games.dtfseeds.com subdomain
- iframe
- link/button only

Chosen method:
```

## Live invite test

```txt
Host Smoke Circle: NOT TESTED
Copy invite link: NOT TESTED
Join from second device/browser: NOT TESTED
Start game: NOT TESTED
Play card: NOT TESTED
Draw card: NOT TESTED
Play wild and choose color: NOT TESTED
Play target card and choose target: NOT TESTED
Win round: NOT TESTED
Score update: NOT TESTED
Rematch: NOT TESTED
```

## Known blockers

```txt
1. Real dependency-backed build/test pass still required.
2. Production backend host must support Node + Socket.IO WebSockets.
3. Production VITE_SERVER_URL must point to the deployed backend.
4. dtfseeds route/subdomain must be configured.
5. Live two-player invite test must pass before launch claim.
```

## Notes

Record all deployment changes here. Do not mark live until the frontend loads, the backend health endpoint works, Socket.IO connects, and a two-player game completes one round.
