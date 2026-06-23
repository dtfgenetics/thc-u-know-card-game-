# THC U Know Card Game

**THC U Know** is a standalone online multiplayer UNNO-style parody card game for browser play, with a Discord version scaffolded for later.

This repository is intentionally separate from the High Land game project.

## Project goals

- Browser multiplayer card game for 2-8 players.
- Private invite links and room codes.
- Player names before joining.
- Server-side rule validation.
- Mobile-first game table.
- Discord bot scaffold for future session creation and invite sharing.
- Original parody-safe names, artwork, and wording.

## Parody-safe naming

This project should not use official UNO logos, official card art, official names, or protected branding. The game uses original naming:

| Function | THC U Know name |
| --- | --- |
| Lobby | Smoke Circle |
| Draw pile | Stash |
| Discard pile | Ashtray |
| Skip | Couch Lock |
| Reverse | Puff Puff Pass Back |
| Draw Two | Pack Two |
| Wild | Strain Switch |
| Wild Draw Four | Hotbox +4 |
| One-card call | THC U Know! |

## Repository structure

```txt
apps/
  web/          React/Vite browser game
  server/       Socket.IO realtime game server
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

## Current status

Starter scaffold created with:

- Shared TypeScript game engine.
- Deck generation and basic move validation.
- Socket.IO server room flow.
- React web starter.
- Discord bot placeholder.
- Docs for rules, invites, deployment, and branding.

## License

MIT. See `LICENSE`.
