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
ENABLE_REDIS_ADAPTER=false
REDIS_URL=redis://localhost:6379
SESSION_TTL_SECONDS=86400
```

Set `ENABLE_REDIS_ADAPTER=true` only when Redis is available. The Redis adapter lets Socket.IO broadcasts work across multiple Node server processes. Redis should be private, authenticated, firewall-protected, and never exposed to public/untrusted networks.

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

- Wire socket handlers to the `SessionStore` interface and swap memory store for Redis store.
- Add CORS production origins.
- Confirm session expiration cleanup.
- Run multiplayer E2E tests with two or more browser contexts.
- Add structured logging.
- Add monitoring.
- Run `pnpm install`, commit `pnpm-lock.yaml`, then run full CI build and tests.
