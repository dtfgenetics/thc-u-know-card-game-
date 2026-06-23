# Card Feature Audit

Date: 2026-06-23

## Goal

Verify that THC U Know has a complete card structure, card value system, game mode structure, and feature map.

## Verified source files

```txt
packages/shared/src/types.ts
packages/shared/src/game/cardManifest.ts
packages/shared/src/game/cardNames.ts
packages/shared/src/game/createDeck.ts
packages/shared/src/game/applyMove.ts
packages/shared/src/game/validateMove.ts
packages/shared/src/game/deck.test.ts
packages/shared/src/game/pendingDraw.test.ts
apps/web/src/components/GameTable.tsx
docs/game-rules.md
docs/card-structure-and-values.md
```

## Features identified

### Core game features

- 2-8 player Smoke Circle sessions.
- Player display names.
- Invite/session code flow.
- Server-authoritative moves.
- Stash draw pile.
- Ashtray discard pile.
- Active strain color.
- Direction/rotation handling.
- Pending draw pressure.
- Winner detection when a player empties their hand.
- Rematch/new round reset.
- THC U Know call tracking.
- Chat/Table Talk.

### Modes

| Mode | Starting hand | Deck total |
| --- | ---: | ---: |
| Classic | 7 | 108 |
| Fast Sesh | 5 | 108 |
| Party | 7 | 116 |
| No Mercy | 7 | 124 |

### Card value system

| Card type | Points |
| --- | ---: |
| Number cards | Face value |
| Classic colored actions | 20 |
| Classic wilds | 50 |
| Party wilds | 50 |

### Deck totals verified

| Mode | Number | Colored action | Classic wild | Party wild | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Classic | 76 | 24 | 8 | 0 | 108 |
| Fast Sesh | 76 | 24 | 8 | 0 | 108 |
| Party | 76 | 24 | 8 | 8 | 116 |
| No Mercy | 76 | 24 | 8 | 16 | 124 |

## Corrections made

### 1. Added canonical card manifest

Created `packages/shared/src/game/cardManifest.ts` as the source of truth for:

- Card labels
- Deck group
- Point value
- Copies by game mode
- Whether a card needs a color choice
- Whether a card needs a target
- Effect description

### 2. Deck builder now uses the manifest

Updated `createDeck.ts` so deck composition is generated from `cardManifest` instead of duplicated hard-coded card lists.

### 3. Action labels now use the manifest

Updated `cardNames.ts` so action labels come from `cardManifest`.

### 4. Web UI now uses the manifest

Updated `GameTable.tsx` so color-choice and target-choice prompts are based on manifest metadata, not hard-coded card sets.

### 5. Rule engine now uses the manifest

Updated `applyMove.ts` so color-choice requirements come from `cardManifest`.

### 6. Tolerance Break rule fixed

Found conflict:

- Tolerance Break was documented as clearing pending draw pressure.
- The validator blocked it during pending draw pressure.

Fix:

- Tolerance Break may now be played against pending draw pressure even when stacking is disabled.
- Pending draw tests now cover this.
- Rules docs and card value docs were updated.

### 7. Exact deck tests added

Updated `deck.test.ts` to verify exact card counts by kind and point values.

## Remaining feature decisions

These are intentionally not finalized yet:

1. THC U Know missed-call penalty timing.
2. Jump-in mode; setting exists but feature is not implemented.
3. Final balance for Party and No Mercy modes.
4. Whether score should accumulate across rounds or the game should only use round wins.
5. Whether empty Stash should end round, reshuffle forever, or create a draw condition.
6. Whether Tolerance Break should exist in Classic or only Party/No Mercy. Current decision: Party/No Mercy only.

## Verification result

```txt
✅ Card types identified
✅ Card labels identified
✅ Card point values identified
✅ Deck totals identified
✅ Game modes identified
✅ Party cards identified
✅ Target/color-prompt requirements identified
✅ Deck builder aligned to manifest
✅ UI prompt logic aligned to manifest
✅ Rule engine color-choice logic aligned to manifest
✅ Tolerance Break pending draw behavior corrected
✅ Tests updated for deck counts and pending draw pressure
```

## Next recommendation

Add `zod` schemas for every socket payload and add a scoring system if we want multi-round matches instead of single-round wins only.
