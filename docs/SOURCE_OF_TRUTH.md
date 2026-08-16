# THC U Know — Source of Truth

`dtfgenetics/thc-u-know-card-game-` is the canonical code and machine-readable game-data repository for THC U Know.

Google Drive `04 Games/THC U Know` is canonical for approved human-readable rules, artwork, printable components, playtest evidence, proofs, and release packages.

THC U Know is a separate UNO-like cannabis card game. It must never be merged with High IQ, which is the cannabis grower trivia project.

## Locked system

- Classic deck: 108 cards.
- Browser multiplayer: 2–8 players.
- Private room/invite flow and player naming.
- Server-side rule validation.
- Shared engine/card definitions live under `packages/shared`.

## Release

A release requires deck-distribution regression tests, server/client build checks, multiplayer smoke testing, invite flow verification, mobile layout QA, approved original art, and production route/Socket.IO verification.
