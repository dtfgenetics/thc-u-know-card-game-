# THC U Know Card Game

**THC U Know** is a standalone online multiplayer parody card game for browser play, with a Discord version scaffolded for invite sharing.

This repository is intentionally separate from the High Land game project.

## Project goals

- Browser multiplayer card game for 2-8 players.
- Private invite links and room codes.
- Player names before joining.
- Server-side rule validation.
- Mobile-first game table.
- Discord bot scaffold for future session creation and invite sharing.
- Original parody-safe names, artwork, and wording.

## Approved classic deck

The classic deck is locked to 108 cards:

- 72 number cards: values 1-9, four colors, two copies each.
- 24 color action cards: Couch Lock, Pass It Back, Cottonmouth, four colors, two copies each.
- 12 wild cards: Strain Swap, Greenout, Dealer's Choice, and Mystery Nug.

A regression test verifies this distribution before deployment.

## Repository structure

```txt
apps/
  web/          React/Vite browser game
  server/       Express + Socket.IO realtime game server
  discord-bot/  Discord command scaffold
packages/
  shared/       Game engine, card definitions, shared types, tests
docs/           Rules, invite flow, deployment notes, branding notes
assets/         Placeholder art/sounds folder
```

## Local setup

```bash
pnpm install
pnpm -r build
pnpm test
```

Run the server:

```bash
pnpm --filter @thc-u-know/server dev
```

Run the web app:

```bash
pnpm --filter @thc-u-know/web dev
```

## Production notes

- Target route: `/games/thc-u-know/` on dtfseeds.com.
- The server exposes `/healthz`.
- The server can serve the built React app when `WEB_DIST_DIR` points to `apps/web/dist`.
- In production, the web app uses the same origin Socket.IO server unless `VITE_SERVER_URL` is set.
- For subdirectory deployment, Socket.IO should use `/games/thc-u-know/socket.io`.

See `docs/DTFSEEDS_DEPLOYMENT.md`, `docs/CODEX_LIVE_DEPLOY_PROMPT.md`, and `docs/LIVE_READINESS_CHECKLIST.md` for deployment steps.

## License

MIT. See `LICENSE`.
