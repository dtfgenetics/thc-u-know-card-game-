# Deployment Notes

## Local development

Install dependencies:

```bash
pnpm install
```

Optional Redis for local production-style testing:

```bash
docker compose up -d redis
```

Run shared build:

```bash
pnpm --filter @thc-u-know/shared build
```

Run server:

```bash
pnpm --filter @thc-u-know/server dev
```

Run web:

```bash
pnpm --filter @thc-u-know/web dev
```

## Environment variables

Server:

```txt
PORT=5174
WEB_ORIGIN=http://localhost:5173
SESSION_STORE=memory
SESSION_TTL_SECONDS=86400
REDIS_URL=redis://localhost:6379
ENABLE_REDIS_ADAPTER=false
```

Use `SESSION_STORE=memory` for local dev. Use `SESSION_STORE=redis` before public launch so Smoke Circles survive server restarts and can be shared across processes.

Set `ENABLE_REDIS_ADAPTER=true` only when Redis is available and you are running more than one Node server process. The Redis adapter lets Socket.IO broadcasts work across multiple server processes. Redis should be private, authenticated, firewall-protected, and never exposed to public/untrusted networks.

Web:

```txt
VITE_SERVER_URL=http://localhost:5174
```

Discord bot:

```txt
DISCORD_TOKEN=
THC_U_KNOW_WEB_URL=https://dtfseeds.com/games/thc-u-know
```

## Production target

Recommended first production stack:

- Web: static Vite build served by dtfseeds.com under `/games/thc-u-know`.
- Server: Node process with Socket.IO and HTTPS reverse proxy.
- State: Redis before public launch.
- Realtime scaling: Socket.IO Redis adapter when running more than one Node process.

## Pre-launch checklist

- Run full install/build/test with real dependencies.
- Test `SESSION_STORE=memory` locally.
- Test `SESSION_STORE=redis` with `docker compose up -d redis`.
- Test `ENABLE_REDIS_ADAPTER=true` when running multiple server processes.
- Add CORS production origins.
- Run multiplayer E2E tests with two or more browser contexts.
- Add structured logging.
- Add monitoring.
- Commit `pnpm-lock.yaml` after first real `pnpm install`.
