# Session Store Wiring Report

Date: 2026-06-23

## What changed

The live Socket.IO gameplay path now uses the `SessionStore` interface instead of importing the in-memory store directly.

## New files

```txt
apps/server/src/state/memorySessionStore.ts
apps/server/src/state/createSessionStore.ts
```

Previously added and now wired:

```txt
apps/server/src/state/store.ts
apps/server/src/state/redisStore.ts
apps/server/src/state/sessionCode.ts
apps/server/src/config/env.ts
apps/server/src/realtime/socketRedisAdapter.ts
```

## Store selection

The server chooses the session store at startup:

```txt
SESSION_STORE=memory
SESSION_STORE=redis
```

- `memory` keeps the current local-dev behavior.
- `redis` uses `RedisSessionStore.fromEnv()` and requires `REDIS_URL`.

## Redis adapter selection

Realtime broadcast scaling is separate from session persistence:

```txt
ENABLE_REDIS_ADAPTER=false
ENABLE_REDIS_ADAPTER=true
```

Use the Redis adapter only when running more than one Node server process. Use the Redis session store before public launch so sessions survive restarts.

## Important fix

Boolean env parsing was corrected so the string `false` is treated as `false`, not JavaScript truthy.

## Current status

```txt
✅ Socket handlers use SessionStore interface
✅ Memory store remains default
✅ Redis store can be selected by env
✅ Redis Socket.IO adapter can be selected by env
✅ Session codes use shared helper
✅ Deployment docs and .env example updated
```

## Remaining verification

A real dependency install/build is still needed:

```bash
pnpm install
pnpm -r build
pnpm test
pnpm --filter @thc-u-know/web test:e2e
```

Run Redis mode locally:

```bash
docker compose up -d redis
SESSION_STORE=redis ENABLE_REDIS_ADAPTER=false pnpm --filter @thc-u-know/server dev
```

Run Redis adapter mode when testing multiple server processes:

```bash
SESSION_STORE=redis ENABLE_REDIS_ADAPTER=true pnpm --filter @thc-u-know/server dev
```
