# Live Readiness Checklist

## Immediate checks

- Confirm the browser app builds with `pnpm -r build`.
- Confirm shared package tests pass with `pnpm test`.
- Confirm the web app route matches the production target.
- Confirm the server health endpoint returns `{ ok: true }`.
- Confirm invite links preserve the room code.
- Confirm player names are required before joining.
- Confirm at least two players can create, join, start, play, draw, and rematch.

## Deployment target

- Web route: `/games/thc-u-know/`
- Server health route: `/healthz`
- Main branch: `main`
- Prep branch: `prep/thc-u-know-live-readiness`
