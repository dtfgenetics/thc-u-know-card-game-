# Web Public Assets

This folder is served directly by the Vite browser app.

Anything placed here can be loaded from the browser using `/assets/...` paths.

Example:

```txt
apps/web/public/assets/cards/card-back.png
```

Browser path:

```txt
/assets/cards/card-back.png
```

## Folder structure

```txt
apps/web/public/assets/
  cards/
  logos/
  music/
  sounds/
  ui/
```

## Required first files

```txt
cards/card-back.png
cards/card-front-number.png
cards/card-front-action.png
cards/card-front-wild.png
cards/card-front-party.png
logos/thc-u-know-logo.png
ui/table-bg.png
ui/ashtray-bg.png
ui/stash-bg.png
sounds/card-play.mp3
sounds/card-draw.mp3
music/table-loop.mp3
```

Use `apps/web/src/assets/assetRegistry.ts` as the code map for these paths.
