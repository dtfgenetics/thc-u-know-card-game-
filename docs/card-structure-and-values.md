# THC U Know Card Structure and Values

Date: 2026-06-23

This document is the human-readable card spec. The code source of truth is `packages/shared/src/game/cardManifest.ts` plus `packages/shared/src/game/createDeck.ts`.

## Game colors

| Code color | Game label | Role |
| --- | --- | --- |
| `purple` | Purple Haze | Standard playable color |
| `green` | Green Room | Standard playable color |
| `gold` | Gold Kief | Standard playable color |
| `blue` | Blue Dream | Standard playable color |
| `black` | Wild Smoke | Wild/party card color |

## Game modes

| Mode | Starting hand | Deck structure |
| --- | ---: | --- |
| Classic | 7 | Classic 108-card deck |
| Fast Sesh | 5 | Classic 108-card deck, faster starting hand |
| Party | 7 | Classic deck + 1 of each party wild = 116 cards |
| No Mercy | 7 | Classic deck + 2 of each party wild = 124 cards |

## Number cards

There are 4 colors. Each color has:

| Value | Copies per color | Points |
| ---: | ---: | ---: |
| 0 | 1 | 0 |
| 1-9 | 2 each | Face value |

Total number cards: 76.

## Classic colored action cards

Each classic colored action exists in all 4 standard colors with 2 copies per color.

| Card | Copies per color | Total copies | Points | Effect |
| --- | ---: | ---: | ---: | --- |
| Couch Lock | 2 | 8 | 20 | Skip the next player. |
| Puff Puff Pass Back | 2 | 8 | 20 | Reverse turn direction. Acts as skip in 2-player games. |
| Pack Two | 2 | 8 | 20 | Next player draws 2 cards from the Stash. |

Total classic colored action cards: 24.

## Classic wild cards

| Card | Color | Classic copies | Party copies | Fast Sesh copies | No Mercy copies | Points | Requires color choice | Effect |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Strain Switch | Wild Smoke | 4 | 4 | 4 | 4 | 50 | Yes | Choose active strain color. |
| Hotbox +4 | Wild Smoke | 4 | 4 | 4 | 4 | 50 | Yes | Choose active strain color; next player draws 4. |

Total classic wild cards: 8.

## Party wild cards

Party cards are Wild Smoke cards. They do not require choosing a new color unless explicitly listed.

| Card | Party copies | No Mercy copies | Points | Target? | Effect |
| --- | ---: | ---: | ---: | --- | --- |
| Munchies | 1 | 2 | 50 | No | Next player draws 2. |
| Paranoia | 1 | 2 | 50 | No | Skip the next player. |
| Rotation | 1 | 2 | 50 | No | Reverse turn direction. |
| Tolerance Break | 1 | 2 | 50 | No | Clear pending draw pressure, then end turn. |
| Bogart | 1 | 2 | 50 | Yes | Target player draws 1. Defaults to next player. |
| Pass the Tray | 1 | 2 | 50 | No | Every player passes one card in turn direction. |
| Smoke Sesh | 1 | 2 | 50 | No | Every other player draws 1. |
| Greener Side | 1 | 2 | 50 | Yes | Swap hands with target player. Defaults to next player. |

Total party wild cards: 8 in Party mode, 16 in No Mercy mode.

## Deck totals

| Mode | Number cards | Colored actions | Classic wilds | Party wilds | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Classic | 76 | 24 | 8 | 0 | 108 |
| Fast Sesh | 76 | 24 | 8 | 0 | 108 |
| Party | 76 | 24 | 8 | 8 | 116 |
| No Mercy | 76 | 24 | 8 | 16 | 124 |

## Matching rules

A card may be played when it matches one of these:

- Active strain color.
- Number value on top Ashtray card.
- Action type on top Ashtray card.
- Any Wild Smoke card.

## Pending draw rule

If pending draw pressure exists:

- Stacking disabled: the player must draw the full pending amount.
- Stacking enabled: only draw cards may be stacked.
- Stackable draw cards: Pack Two, Munchies, Hotbox +4.

## Current intentionally disabled / future feature

`jumpIn` exists in settings but is not implemented yet. It should remain disabled in the UI until a real-time race-safe implementation is added.
