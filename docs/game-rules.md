# THC U Know Game Rules

THC U Know is an original UNNO-style parody card game. These rules describe the first playable digital version.

## Players

- 2-8 players.
- Each player chooses a display name before joining.
- The host creates a Smoke Circle and shares the invite link or Session Code.

## Objective

Be the first player to empty your hand.

## Starting the game

- Classic, Party, and No Mercy modes start with 7 cards per player.
- Fast Sesh starts with 5 cards per player.
- One non-wild card starts the Ashtray/discard pile.
- The first player in the Smoke Circle starts.

## Modes

| Mode | Deck | Purpose |
| --- | --- | --- |
| Classic | 108 cards | Clean base game. |
| Fast Sesh | 108 cards | Same deck as Classic, but players start with 5 cards. |
| Party | 116 cards | Adds 1 copy of each THC party wild card. |
| No Mercy | 124 cards | Adds 2 copies of each THC party wild card. |

## Colors

| Code color | Game label |
| --- | --- |
| `purple` | Purple Haze |
| `green` | Green Room |
| `gold` | Gold Kief |
| `blue` | Blue Dream |
| `black` | Wild Smoke |

## Matching rules

A player may play a card if it matches:

- The active strain color.
- The number on the top Ashtray card.
- The action type on the top Ashtray card.
- Any Wild Smoke card.

## Pending draw rule

If pending draw pressure exists:

- Tolerance Break may always be played to clear pending draw pressure.
- Stacking disabled: otherwise, the player must draw the full pending amount.
- Stacking enabled: draw cards may be stacked.
- Stackable draw cards: Cottonmouth, Munchies, Greenout.

## Number cards

There are 4 standard colors. Each color has two copies each of 1-9. There are no zero cards.

| Card | Total copies | Point value |
| --- | ---: | ---: |
| 1-9 | 72 | Face value |

Total number cards: 72.

## Classic colored action cards

Each classic colored action exists in all 4 standard colors with 2 copies per color.

| Card | Total copies | Points | Effect |
| --- | ---: | ---: | --- |
| Couch Lock | 8 | 20 | Skip the next player. |
| Pass It Back | 8 | 20 | Reverse turn direction. Acts as skip in 2-player games. |
| Cottonmouth | 8 | 20 | Next player draws 2. |

Total classic colored action cards: 24.

## Classic wild cards

| Card | Total copies | Points | Effect |
| --- | ---: | ---: | --- |
| Strain Swap | 4 | 50 | Choose active strain color. |
| Greenout | 4 | 50 | Choose active strain color; next player draws 4. |
| Dealer's Choice | 2 | 50 | The player chooses the active strain color. |
| Mystery Nug | 2 | 50 | Reveal and play the next card from the Stash. |

Total classic wild cards: 12.

## Party Mode / No Mercy cards

Party wild cards are Wild Smoke cards. Party mode adds 1 copy of each. No Mercy adds 2 copies of each.

| Card | Party copies | No Mercy copies | Points | Effect |
| --- | ---: | ---: | ---: | --- |
| Munchies | 1 | 2 | 50 | Next player draws 2. |
| Paranoia | 1 | 2 | 50 | Skip the next player. |
| Rotation | 1 | 2 | 50 | Reverse turn direction. |
| Tolerance Break | 1 | 2 | 50 | May be played against pending draw pressure. Clears pending draw pressure, then ends turn. |
| Bogart | 1 | 2 | 50 | Target player draws 1. Defaults to next player. |
| Pass the Tray | 1 | 2 | 50 | Every player passes one card in turn direction. |
| Smoke Sesh | 1 | 2 | 50 | Every other player draws 1. |
| Greener Side | 1 | 2 | 50 | Swap hands with target player. Defaults to next player. |

## Deck totals

| Mode | Number cards | Colored actions | Classic wilds | Party wilds | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Classic | 72 | 24 | 12 | 0 | 108 |
| Fast Sesh | 72 | 24 | 12 | 0 | 108 |
| Party | 72 | 24 | 12 | 8 | 116 |
| No Mercy | 72 | 24 | 12 | 16 | 124 |

## THC U Know call

When a player is down to one card, they should call THC U Know. The current digital version tracks the call state, but penalty timing still needs final balance testing.

## Anti-cheat rule

The server is the source of truth. The browser may request a move, but the server decides whether it is valid.

## Future feature note

`jumpIn` exists in settings but is not active yet. It should remain disabled until a race-safe server-side implementation is added.
