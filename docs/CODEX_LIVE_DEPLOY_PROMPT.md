# THC U Know Live Deployment Notes

Work from `dtfgenetics/thc-u-know-card-game-` on branch `main`.

Goal: deploy the browser game at `/games/thc-u-know/` with working multiplayer rooms, invite links, player names, and a Discord invite helper.

## Required verification

Run these before any deploy:

```bash
pnpm install
pnpm -r lint
pnpm -r build
pnpm test
```

Do not deploy if any command fails.

## Production build settings

Web app:

```bash
VITE_BASE_PATH=/games/thc-u-know/
```

The Vite config now defaults to `/games/thc-u-know/`, but setting `VITE_BASE_PATH` explicitly is safer.

If the Socket.IO server runs on the same origin as the web app, `VITE_SERVER_URL` can be omitted. If it runs on a separate origin, set it to that server origin.

Server:

```bash
NODE_ENV=production
PORT=<production port>
WEB_ORIGIN=https://dtfseeds.com,https://www.dtfseeds.com
WEB_BASE_PATH=/games/thc-u-know
WEB_DIST_DIR=<absolute path to apps/web/dist>
SESSION_STORE=memory
ENABLE_REDIS_ADAPTER=false
```

The Node server can serve the built React app from `WEB_DIST_DIR`, so one Node process can host both the game route and Socket.IO multiplayer server.

Use Redis only after the first live version is stable.

## Functional smoke test

1. Open `/games/thc-u-know/`.
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
15. Confirm `/healthz` returns a JSON ok response.

## Current main branch changes

- Classic deck locked to 108 cards.
- Zero cards removed to match the approved print deck.
- Number labels use the approved growth-stage names.
- Core action labels match the approved print cards.
- Extra wild cards from the approved print sheet are included.
- Deck distribution regression test added.
- Digital card display changed to landscape ratio closer to the approved print cards.
- Server can serve the built web app from the Node process when `WEB_DIST_DIR` is set.
- Production socket connection defaults to same origin if `VITE_SERVER_URL` is not set.

## Do not change

- Do not add official UNO names, logos, or art.
- Do not change the approved 108-card classic deck count without updating the regression test and documenting the reason.
- Do not hard-code local server URLs into production builds.
- Do not deploy with failing tests.
