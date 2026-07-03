# Codex Live Deployment Prompt

You are working in `dtfgenetics/thc-u-know-card-game-` on branch `prep/thc-u-know-live-readiness`.

Goal: get the browser game production-ready and deployed at `/games/thc-u-know/` with working multiplayer rooms, invite links, player names, and a Discord invite helper.

## Required verification

Run these before any deploy:

```bash
pnpm install
pnpm -r lint
pnpm -r build
pnpm test
```

Do not deploy if any command fails.

## Required production settings

Web app:

```bash
VITE_BASE_PATH=/games/thc-u-know/
VITE_SERVER_URL=<production socket server origin>
```

Server:

```bash
NODE_ENV=production
PORT=<production port>
WEB_ORIGIN=https://dtfseeds.com
SESSION_STORE=memory
ENABLE_REDIS_ADAPTER=false
```

Use Redis only after the first live version is stable.

## Functional smoke test

1. Open the web route.
2. Enter a player name.
3. Host a Smoke Circle.
4. Copy invite link.
5. Open invite link in another browser profile.
6. Join as player two.
7. Start game.
8. Play a number card.
9. Draw from Stash.
10. Play an action card.
11. Play a color-changing wild card and confirm color picker works.
12. Confirm both players receive realtime state updates.
13. End a round or force a near-end hand and verify rematch works.
14. Refresh a tab and confirm saved session rejoin works.

## Current branch changes

- Classic deck locked to 108 cards.
- Zero cards removed to match the approved print deck.
- Number labels now use the approved growth-stage names.
- Core action labels now match the approved print cards.
- Extra wild cards from the approved print sheet are included.
- Deck distribution regression test added.
- Digital card display changed to landscape ratio closer to the approved print cards.
- Live readiness checklist added.

## Do not change

- Do not add official UNO names, logos, or art.
- Do not change the approved 108-card classic deck count without updating the regression test and documenting the reason.
- Do not hard-code local server URLs into production builds.
- Do not deploy with failing tests.
