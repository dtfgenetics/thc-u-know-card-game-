# Source Audit

This project was built as a clean standalone THC U Know codebase. Existing UNO-style projects were reviewed only as operational references.

## Primary reference: karanpratapsingh/uno

Useful ideas:

- React client with Socket.IO realtime multiplayer.
- Host and join flow.
- `?join=<room>` invite link pattern.
- Server events for room, join, leave, start, state, play, draw, and game over.
- Redis-backed room expiration pattern.
- MIT license.

Do not copy directly:

- UNO branding.
- Visual assets.
- Two-player-only assumptions.
- Personal-use production shortcuts.

## Secondary reference: bahaaEldeen1999/uno-multiplayer

Useful ideas:

- Create game operation.
- Join game operation.
- Start game operation.
- Play card operation.
- Draw card and end turn operations.
- Chat, rematch, disconnect handling, and kick-player operations.

Do not copy directly:

- Old jQuery/Materialize UI.
- Official UNO wording or imagery.
- Broad socket broadcasts that should be room-scoped.
- Outdated dependency structure.

## THC U Know implementation decisions

- Use TypeScript across shared, server, web, and Discord packages.
- Keep game rules in `packages/shared` so server and web do not drift.
- Server validates moves; client only requests actions.
- Public game state excludes private hands and draw pile contents.
- Private game state is emitted only to `player:<playerId>` socket rooms.
