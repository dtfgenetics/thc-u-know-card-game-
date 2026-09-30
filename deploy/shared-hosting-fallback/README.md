# Shared-hosting fallback candidate

This directory preserves the unique PHP/file-backed THC U Know runtime migrated out of `dtfgenetics/dtf-thc-hub`.

It is **not** the primary production architecture. The canonical production runtime remains the Node/Socket.IO implementation under `apps/server`, `apps/web`, and `packages/shared`.

## Why this exists

The legacy integration repository contained a useful shared-hosting implementation that can run without a persistent Node process. Its artwork and static card assets were mostly exact duplicates of `apps/web/public/assets`, so those duplicate files are not stored here.

## Build

Run:

```bash
pnpm build:shared-hosting-fallback
```

The build creates `dist/shared-hosting-fallback/` containing:

- the PHP room/game endpoint from this directory,
- the fallback HTML/JS/CSS from this directory,
- canonical visual assets copied from `apps/web/public/assets`.

Do not hand-edit generated files under `dist/`.

## Release rule

Treat this as an alternate fallback candidate only. Do not replace the canonical Node/Socket.IO production runtime or change the DTFSeeds public route without a reviewed architecture/release decision and live verification.
