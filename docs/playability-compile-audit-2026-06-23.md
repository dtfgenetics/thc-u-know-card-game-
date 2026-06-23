# Playability and Compile Audit

Date: 2026-06-23

## Goal

Verify that the GitHub codebase has the information and structure needed for THC U Know to be playable, and correct source-level conflicts before a real dependency-backed compile.

## Files audited

```txt
packages/shared/src/types.ts
packages/shared/src/index.ts
packages/shared/src/game/cardManifest.ts
packages/shared/src/game/cardNames.ts
packages/shared/src/game/createDeck.ts
packages/shared/src/game/createGame.ts
packages/shared/src/game/scoring.ts
packages/shared/src/game/nextRound.ts
packages/shared/src/game/applyMove.ts
packages/shared/src/game/validateMove.ts
packages/shared/src/game/draw.ts
packages/shared/src/game/publicState.ts
packages/shared/src/game/deck.test.ts
packages/shared/src/game/pendingDraw.test.ts
packages/shared/src/game/scoring.test.ts
apps/server/src/socket/handlers.ts
apps/web/src/App.tsx
apps/web/src/components/GameTable.tsx
apps/web/src/components/PlayerRail.tsx
.github/workflows/ci.yml
package.json
```

## Playability systems verified

```txt
✅ Host Smoke Circle
✅ Join by Session Code / invite link
✅ Player names
✅ 2-8 players
✅ Start game as host
✅ Deal cards
✅ Stash draw pile
✅ Ashtray discard pile
✅ Active strain color
✅ Turn direction
✅ Skip/reverse/draw actions
✅ Wild color choice
✅ Target card selection
✅ Pending draw pressure
✅ Tolerance Break clears draw pressure
✅ Win when hand is empty
✅ Round scoring by remaining card points
✅ Target score / match winner support
✅ Score visibility in public player state
✅ Scores shown in player rail
✅ Rematch / next round preserving scores
✅ New match after target score reached
✅ Chat/Table Talk
✅ Server-authoritative move validation
```

## Conflicts found and fixed

### 1. Scoring was partially added but not wired

Problem:

- `scores`, `roundNumber`, and scoring helpers existed.
- `playCard()` still only set `winnerId` and did not award points.
- Public state did not expose player scores.
- Rematch reset the game and wiped scoring context.

Fix:

- `playCard()` now calls `applyRoundScore()` when a player empties their hand.
- Public player state includes `score`.
- Server rematch now uses `createNextRoundState()` to preserve scores until a match winner reaches target score.
- PlayerRail displays scores.

### 2. Circular dependency risk

Problem:

- `createGame.ts` imported scoring helpers.
- `scoring.ts` imported `createGameState()`.
- That created a circular module dependency.

Fix:

- Removed `createGameState()` from `scoring.ts`.
- Added `packages/shared/src/game/nextRound.ts` for next-round creation.
- Exported `nextRound.ts` through the shared package index.

### 3. Shared export conflict

Problem:

- The server imported `createNextRoundState` from `@thc-u-know/shared`.
- It was not exported yet.

Fix:

- Added `export * from './game/nextRound.js';` to `packages/shared/src/index.ts`.

### 4. Browser settings mismatch

Problem:

- `GameSettings` now includes `targetScore` and `thcUKnowPenaltyCards`.
- The browser host flow did not send or display those settings.

Fix:

- Browser host flow now sends `targetScore: 500` and `thcUKnowPenaltyCards: 2`.
- Lobby displays target score.

### 5. Score visibility mismatch

Problem:

- Public player type had a score, but UI was not displaying it.

Fix:

- `PlayerRail` now shows each player's score.

## Source-level compile check

Verified import/export alignment after patches:

```txt
✅ @thc-u-know/shared exports scoring helpers
✅ @thc-u-know/shared exports next round helper
✅ Server handler imports now resolve through shared index
✅ Scoring helpers no longer import createGameState
✅ createGameState initializes all required GameState fields
✅ Public state maps scores into public player data
✅ UI types include new score settings
```

## CI compile path

The repo already has a GitHub Actions compile/test workflow:

```bash
pnpm install --frozen-lockfile=false
pnpm -r build
pnpm test
```

Root scripts also support:

```bash
pnpm -r build
pnpm --filter @thc-u-know/shared test
pnpm -r lint
```

## Important limitation

A real compile cannot be completed inside the current ChatGPT tool runtime because dependency installation from the package registry is not available here. The code has been source-audited and patched for the conflicts identified above, but the final dependency-backed compile must be run through GitHub Actions or a local machine with network/package access.

## Commands to run next

```bash
pnpm install
pnpm -r build
pnpm test
pnpm -r lint
pnpm --filter @thc-u-know/web test:e2e
```

## Remaining feature work after compile passes

```txt
1. Add THC U Know missed-call challenge event and penalty draw.
2. Add strict zod schemas for all socket payloads.
3. Add socket action/chat rate limiting.
4. Decide final empty-Stash behavior: draw-round, error-only, or reshuffle-only.
5. Add Playwright CI startup for server + web.
```
