# DTFSeeds Multiplayer Hosting Standard

Last researched: 2026-07-09

This is the default deployment pattern for THC U Know and future dtfseeds.com games.

## Core rule

Static hosting is enough for single-player games and slow async games that use HTTP polling.

Live room games need a persistent backend process. If players can host a room, join by code, see turns update, use chat, or react to another player without refreshing, the game needs one of these:

- Node.js with Socket.IO or WebSocket support.
- A polling backend with PHP/MySQL or another database, only for slower turn-based games.

Do not mark a multiplayer game live until the public URL proves both the page and the multiplayer backend are working.

## THC U Know status

THC U Know is already built as a real multiplayer game:

- The shared game engine is server authoritative.
- The backend is Node, Express, and Socket.IO.
- The frontend connects with Socket.IO.
- Two-player host, join, play, draw, action, wild, win, scoring, and rematch flow passed locally.

The current live blocker is hosting, not game architecture. The current Hostinger SSH shell for dtfseeds.com has no `node`, `npm`, or `pm2`, so it cannot run the multiplayer process directly.

The browser client should prefer WebSocket for speed and keep Socket.IO polling as a fallback for stricter networks or proxies.

## Recommended setup for THC U Know

Preferred public path:

```txt
https://dtfseeds.com/games/thc-u-know/
```

Required backend paths:

```txt
/games/thc-u-know/socket.io
/healthz
/games/thc-u-know/healthz
```

Production environment:

```txt
NODE_ENV=production
PORT=<provider assigned port>
WEB_ORIGIN=https://dtfseeds.com,https://www.dtfseeds.com
WEB_BASE_PATH=/games/thc-u-know
WEB_DIST_DIR=apps/web/dist
SOCKET_IO_PATH=/games/thc-u-know/socket.io
SESSION_STORE=memory
ENABLE_REDIS_ADAPTER=false
VITE_BASE_PATH=/games/thc-u-know/
VITE_SOCKET_PATH=/games/thc-u-know/socket.io
```

Use `SESSION_STORE=redis`, `REDIS_URL`, and `ENABLE_REDIS_ADAPTER=true` only when running more than one Node process for the same game.

## Hosting choices

### Option A - Hostinger Node.js Web App

Use this if hPanel shows `Add Website` -> `Deploy Web App` or `Node.js Web App` for the dtfseeds.com plan.

Suggested settings:

```txt
Repository: dtfgenetics/thc-u-know-card-game-
Branch: main
Framework: Express.js or Other
Node version: 22
Package manager: pnpm
Install command: pnpm install --frozen-lockfile
Build command: pnpm -r build
Start command: pnpm start
```

If Hostinger cannot mount the Node app under `/games/thc-u-know/`, deploy the backend on a subdomain such as:

```txt
https://games-api.dtfseeds.com
```

Then rebuild the frontend with:

```txt
VITE_SERVER_URL=https://games-api.dtfseeds.com
VITE_SOCKET_PATH=/games/thc-u-know/socket.io
```

Gate before calling it live:

- `https://dtfseeds.com/games/thc-u-know/` returns the game page.
- `https://dtfseeds.com/healthz` or the backend health URL returns JSON.
- `https://dtfseeds.com/games/thc-u-know/socket.io/?EIO=4&transport=polling` returns an Engine.IO handshake, not static HTML.
- Two separate browser sessions can create and join the same room.

### Option B - Hostinger VPS

Use this when we need guaranteed WebSocket control, multiple games, PM2, Redis, or Nginx routing.

Standard server layout:

```txt
/var/www/games/thc-u-know
/var/www/games/<future-game-slug>
```

Standard process command for THC U Know:

```bash
cd /var/www/games/thc-u-know
pnpm install --frozen-lockfile
pnpm -r build
pm2 start apps/server/dist/index.js --name thc-u-know
pm2 save
```

Nginx must preserve WebSocket upgrades:

```nginx
location /games/thc-u-know/ {
  proxy_pass http://127.0.0.1:5174/games/thc-u-know/;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```

### Option C - Shared hosting polling fallback

Use this only for slower turn-based games where a one-to-three second delay is acceptable. This is not the best fit for THC U Know because the current game is already Socket.IO-based and has target choices, pending draws, wild choices, and rematches wired through the realtime server.

Shared-hosting polling games need:

- PHP or another host-supported backend.
- MySQL tables for games, players, moves, room codes, and session tokens.
- Browser polling for game updates.
- Server-side move validation.
- No secrets in the frontend.

## Standard for all future dtfseeds games

Pick the multiplayer class before coding:

```txt
Static only: single-player, local pass-and-play, no remote rooms.
Polling multiplayer: slow board/card games where brief delay is fine.
Realtime multiplayer: lobbies, live turns, action cards, timers, chat, combat, racing, or anything that must update immediately.
```

Every remote multiplayer game must ship with:

- Server-authoritative move validation.
- Room/session code support.
- Reconnect-safe player identity.
- Health endpoint.
- Public socket or polling smoke check.
- Two-player automated or manual playtest.
- A documented production route under `/games/<slug>/`.
- A rollback backup path before upload.

## Live verification commands

Page and asset check:

```powershell
Invoke-WebRequest https://dtfseeds.com/games/thc-u-know/ -UseBasicParsing
```

Health check:

```powershell
Invoke-WebRequest https://dtfseeds.com/healthz -UseBasicParsing
```

Socket.IO handshake check:

```powershell
Invoke-WebRequest "https://dtfseeds.com/games/thc-u-know/socket.io/?EIO=4&transport=polling" -UseBasicParsing
```

The Socket.IO response must not be the React `index.html`. A static HTML response means the backend is not connected.

## References

- Hostinger Node.js Web App guide: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
- Hostinger Node deployment guide: https://www.hostinger.com/ca/tutorials/deploy-node-js-application/
- Hostinger sockets note: https://www.hostinger.com/support/1583738-are-sockets-supported-at-hostinger/
- Socket.IO introduction: https://socket.io/docs/v4/
