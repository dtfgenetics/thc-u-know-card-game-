# GitHub Source File Plan

Date: 2026-06-23

Goal: identify external GitHub files that are useful for THC U Know, decide what can be copied, what should only be studied, and what files we should add to this repo next.

## Decision

Do not copy a full UNO clone into this repo. The safest and best path is:

1. Use MIT or official examples as implementation patterns.
2. Rebuild the logic in our own THC U Know architecture.
3. Avoid unlicensed repositories except as general inspiration.
4. Do not use UNO branding, card art, logos, trade dress, or exact UI language.

## Sources worth using

### 1. `karanpratapsingh/uno`

Repo: `karanpratapsingh/uno`

Use level: **Safe to reference and adapt with attribution**

Why:

- License is MIT.
- It has clean room/event separation.
- It has a browser invite-link pattern.
- It has reconnect-room behavior worth studying.

Files to study:

| File | Use |
| --- | --- |
| `server/app.py` | Room join/leave/start/draw/play event flow. Useful as a checklist, not a direct copy because it is Python/Flask and our app is TypeScript/Node. |
| `server/lib/events.py` | Event naming structure. We already rebuilt this idea in `packages/shared/src/events.ts`. |
| `server/lib/state.py` | Room/session validation and expiry idea. We should rebuild the same concept using Redis. |
| `web/src/pages/play.tsx` | Connection status, reconnect handling, and invite copy behavior. We already rebuilt part of this in `apps/web/src/App.tsx`. |
| `web/src/components/game.tsx` | Client-side play/draw state handling. Useful for UI checklist only. |

What to pull into THC U Know:

- Event-flow checklist.
- Reconnect checklist.
- Invite link checklist.
- Room validation checklist.

Do not pull:

- Original UNO naming.
- Original card visuals.
- Python server code directly.
- Two-player limitations.

### 2. Socket.IO official docs repo

Repo: `socketio/socket.io-website`

Use level: **Use official implementation pattern**

Important file:

| File | Use |
| --- | --- |
| `docs/categories/05-Adapters/adapter-redis.md` | Official Redis adapter setup for scaling Socket.IO across multiple server processes. |

What to pull into THC U Know:

- Add `@socket.io/redis-adapter`.
- Add Redis pub/sub adapter setup.
- Add Redis security notes to deployment docs.
- Prefer `ioredis` or carefully test the `redis` client reconnect behavior.

Files to add in our repo:

```txt
apps/server/src/realtime/socketRedisAdapter.ts
apps/server/src/config/env.ts
docker-compose.yml
```

### 3. `Sherry141/Uno-Multiplayer-MERN`

Repo: `Sherry141/Uno-Multiplayer-MERN`

Use level: **Study only. Do not copy.**

Why:

- No license file was found.
- Uses global in-memory state.
- Starts automatically at exactly 4 players.
- Some validation is commented out or client-trusting.

Useful ideas only:

- Basic TypeScript Socket.IO server shape.
- Four-player waiting room flow.
- Card draw/pass-turn event names.

Do not pull:

- Any code directly.
- Global state structure.
- Client-trusting card validation.
- Exact event names or UI.

## Files we should add next

### A. Production session store

Add:

```txt
apps/server/src/state/store.ts
apps/server/src/state/redisStore.ts
apps/server/src/state/sessionCode.ts
```

Purpose:

- Replace memory-only sessions.
- Persist game state through server restarts.
- Add TTL expiry for abandoned Smoke Circles.
- Support future horizontal scaling.

### B. Socket.IO Redis adapter

Add:

```txt
apps/server/src/realtime/socketRedisAdapter.ts
```

Purpose:

- Let multiple Node server instances broadcast to the same rooms.
- Required for real production hosting if scaling beyond one process.

### C. Environment/config layer

Add:

```txt
apps/server/src/config/env.ts
```

Purpose:

- Validate `PORT`, `WEB_ORIGIN`, `REDIS_URL`, `SESSION_TTL_SECONDS`.
- Stop scattering env parsing through server files.

### D. Local dev Redis

Add:

```txt
docker-compose.yml
```

Purpose:

- One-command local Redis for dev/testing.

### E. Playwright multiplayer smoke test

Add:

```txt
apps/web/e2e/multiplayer.spec.ts
apps/web/playwright.config.ts
```

Purpose:

- Launch two browser contexts.
- Host Smoke Circle.
- Join by invite code.
- Start game.
- Verify private hand visibility.
- Verify draw/play/rematch flow.

### F. Better test fixtures

Add:

```txt
packages/shared/src/game/testUtils.ts
packages/shared/src/game/pendingDraw.test.ts
packages/shared/src/game/rematch.test.ts
```

Purpose:

- Lock rules before adding more custom THC party cards.
- Prevent pending-draw, wild-color, and target-card regressions.

## Priority order

1. Add pending-draw tests.
2. Add Redis-backed store interface.
3. Add Socket.IO Redis adapter setup.
4. Add Docker Compose Redis.
5. Add multiplayer E2E tests.
6. Add deployment config for `dtfseeds.com/games/thc-u-know`.

## License rule

Only copy code when the license allows it and attribution is kept. When a repo has no license, treat it as source-visible but not reusable. Rebuild the idea in original code instead.
