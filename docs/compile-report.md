# Compile Report

Date: 2026-06-23

## Environment limitation

The local sandbox could not clone GitHub directly because outbound DNS was unavailable. To still verify the code, the current repository files were reconstructed locally from the GitHub file contents and compiled with the system TypeScript compiler.

## Compile commands run locally

```bash
tsc -p packages/shared/tsconfig.json
tsc -p apps/server/tsconfig.json
tsc -p apps/web/tsconfig.json
```

Because package installation was not possible in the sandbox, server and web were checked with lightweight local declaration stubs for external packages. This verifies TypeScript syntax, project structure, internal imports, shared-package typing, and strict-mode issues, but the real CI/install pass should still run with actual dependencies.

## Results

| Package | Result | Notes |
| --- | --- | --- |
| `packages/shared` | Pass | Compiled cleanly. |
| `apps/server` | Pass with stubs | Compiled cleanly against shared engine and Socket.IO/Express stubs. |
| `apps/web` | Pass after fixes | Initial strict typing issues were fixed. |

## Errors found and fixed

### 1. Browser reconnect listener order

The auto-rejoin effect was emitting `SESSION_REJOIN` before the socket listeners were registered. That could cause the browser to miss the server response after a refresh.

Fix: moved the listener-registration effect before the rejoin effect.

### 2. Browser strict TypeScript callback typing

Several socket and form callback parameters depended on contextual typing. This can break under strict TypeScript depending on dependency types.

Fixes:

- Added `SocketErrorPayload` and `GameOverPayload` types.
- Added typed React change handlers for player name, game mode, and session code.
- Added typed React input/key handlers in `ChatBox`.

### 3. Wild-card color handling

Party Mode black cards were being treated like color-changing wilds.

Fix: only `Strain Switch` and `Hotbox +4` now require a chosen strain color.

## Smoke test run locally

A minimal engine simulation was run after compiling `packages/shared`:

```txt
deck classic 108
hands 7,7
public exposes hands? false
wrong player ok? false
draw ok? true next p2
```

This confirms:

- Classic deck creates 108 cards.
- Two players are dealt 7 cards each.
- Public state does not expose private hands.
- Wrong-player move is rejected.
- Drawing advances the turn.

## Remaining required verification

Run this in a real dev environment with dependencies installed:

```bash
pnpm install
pnpm -r build
pnpm test
pnpm dev
```

## Next source-code gaps to pull/rebuild

The codebase does not need copied source files from the reference repos. The useful concepts have already been rebuilt cleanly. The next code systems needed are:

1. Redis session store to replace the memory store.
2. Rematch/new-round flow.
3. Host transfer UI after host disconnect.
4. Winner screen and replay controls.
5. Deployment configuration for dtfseeds.com.
6. CI dependency lockfile after first real `pnpm install`.
