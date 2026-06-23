# Code Verification Report

Date: 2026-06-23

## Scope

Verified the THC U Know code added so far across:

- Shared game engine
- Socket.IO server handlers
- Session store abstraction
- Memory store adapter
- Redis session store scaffold
- Redis Socket.IO adapter
- Server env config
- Draw/pending-draw rules
- Rematch flow
- Playwright E2E scaffold
- Deployment documentation

## Important limitation

The sandbox environment still cannot run a real `pnpm install` against the repo dependencies. That means this was a source-level TypeScript/runtime review and patch pass, not a full dependency-backed build.

The required real verification remains:

```bash
pnpm install
pnpm -r build
pnpm test
pnpm --filter @thc-u-know/web test:e2e
```

## Fixes applied in this pass

### 1. Async socket handler safety

Problem:

The socket handlers were converted to async store calls, but async failures from Redis/store operations could become unhandled promise errors.

Fix:

Added a `safeOn()` wrapper around Socket.IO event handlers. Any thrown error is logged and returned to the player as a generic socket error instead of crashing silently.

### 2. Socket payload typing

Problem:

Raw Socket.IO payloads are untrusted and loosely typed. The previous handlers read fields directly from payload objects.

Fix:

Added typed helpers:

```ts
type SocketPayload = Record<string, unknown> | undefined;
payloadString(...)
payloadSettings(...)
```

This reduces TypeScript strict-mode risk and prevents undefined fallback values from becoming the string `"undefined"`.

### 3. Settings payload casting

Problem:

`payload.settings` is only known as `unknown`, but `store.createSession()` expects `Partial<GameSettings>`.

Fix:

Added `payloadSettings()` to safely narrow object payloads before passing them to the store.

### 4. Draw pile mutation and empty Stash behavior

Problem:

`drawCards()` was mutating nested hand/draw arrays directly and could succeed even if zero cards were drawn.

Fix:

`drawCards()` now clones the draw pile and hand before updating state, and returns an error if no cards are available in the Stash.

### 5. Redis URL narrowing

Problem:

`RedisSessionStore.fromEnv()` checked `env.REDIS_URL`, but TypeScript may not always narrow imported object properties cleanly.

Fix:

Copied the URL into a local `redisUrl` constant before constructing the Redis client.

## Verified code paths

### Live socket session flow

- Create Smoke Circle
- Join Smoke Circle
- Rejoin session
- Kick player
- Start game
- Rematch
- Play card
- Draw card
- Call THC U Know
- Chat send
- Disconnect mark

### Store selection

The server now selects between memory and Redis session persistence by environment:

```txt
SESSION_STORE=memory
SESSION_STORE=redis
```

### Redis adapter selection

Socket.IO Redis broadcast scaling remains separately controlled:

```txt
ENABLE_REDIS_ADAPTER=false
ENABLE_REDIS_ADAPTER=true
```

## Current status

```txt
✅ Source-level verification completed
✅ Async socket handler error handling added
✅ Socket payload helpers added
✅ SessionStore wiring verified
✅ Redis URL handling tightened
✅ Draw logic fixed
✅ Pending draw rules are covered by tests
✅ Rematch reset is covered by a test
✅ E2E scaffold exists
```

## Still required before calling this production-ready

```txt
1. Run real pnpm install/build/test with dependency access.
2. Commit pnpm-lock.yaml.
3. Run server in SESSION_STORE=memory mode.
4. Run server in SESSION_STORE=redis mode with Docker Redis.
5. Run Playwright multiplayer E2E test.
6. Add CI job that starts server + web before E2E.
7. Add zod validation for every socket payload.
8. Add rate limiting for chat/actions.
9. Add production deployment files for dtfseeds.com.
```

## Recommendation

The next coding pass should add strict `zod` schemas for all socket payloads. That will turn the current defensive helpers into full validation and make Redis/public deployment safer.
