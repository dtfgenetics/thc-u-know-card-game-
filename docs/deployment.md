# Deployment Notes

## Local development

Install dependencies:

```bash
pnpm install
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
```

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
- State: start with memory for testing; move to Redis before public launch.

## Pre-launch checklist

- Replace memory store with Redis or another shared persistent store.
- Add CORS production origins.
- Add session expiration cleanup.
- Add reconnect token support.
- Add logging.
- Add monitoring.
- Add automated CI build and test workflow.
