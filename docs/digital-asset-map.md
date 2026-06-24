# THC U Know Digital Asset Map

Date: 2026-06-23

This project uses two asset locations on purpose:

1. `assets/` for source/master files.
2. `apps/web/public/assets/` for browser-ready files the game can load.

Do not place production browser images only in the root `assets/` folder. Vite will not automatically serve those files to the running web app.

## Source/master asset folder

Use this folder for original art, print exports, layered exports, and design source material:

```txt
assets/
  cards/
  logos/
  music/
  sounds/
  ui/
  reference/
```

Examples:

```txt
assets/cards/thc-u-know-card-back-master.png
assets/cards/strain-switch-master.png
assets/logos/thc-u-know-logo-master.png
assets/reference/printed-card-style-reference.png
```

These files are for artists, Codex, VS Code editing, and export work.

## Browser-ready asset folder

Use this folder for optimized files the live web game can use:

```txt
apps/web/public/assets/
  cards/
  logos/
  music/
  sounds/
  ui/
```

Browser paths should be referenced like this:

```txt
/assets/cards/card-back.svg
/assets/logos/thc-u-know-logo.svg
/assets/music/table-loop.mp3
/assets/sounds/card-play.mp3
/assets/ui/table-bg.svg
```

## Working placeholder digital assets

The repo now includes SVG placeholders so the game has visible digital art immediately in VS Code/Vite.

### Card visuals

```txt
apps/web/public/assets/cards/card-back.svg
apps/web/public/assets/cards/card-front-number.svg
apps/web/public/assets/cards/card-front-action.svg
apps/web/public/assets/cards/card-front-wild.svg
apps/web/public/assets/cards/card-front-party.svg
```

### Logo / branding

```txt
apps/web/public/assets/logos/thc-u-know-logo.svg
apps/web/public/assets/logos/dtf-genetics-logo.svg
apps/web/public/assets/logos/favicon.svg
```

### UI/table assets

```txt
apps/web/public/assets/ui/table-bg.svg
apps/web/public/assets/ui/ashtray-bg.svg
apps/web/public/assets/ui/stash-bg.svg
apps/web/public/assets/ui/winner-badge.svg
apps/web/public/assets/ui/player-token.svg
```

## Sound effects still needed

Audio is mapped in code but real audio files still need to be created/exported:

```txt
apps/web/public/assets/sounds/card-play.mp3
apps/web/public/assets/sounds/card-draw.mp3
apps/web/public/assets/sounds/turn-skip.mp3
apps/web/public/assets/sounds/reverse.mp3
apps/web/public/assets/sounds/win-round.mp3
apps/web/public/assets/sounds/error.mp3
```

## Background music still needed

```txt
apps/web/public/assets/music/table-loop.mp3
```

## Asset usage in code

A lightweight registry exists at:

```txt
apps/web/src/assets/assetRegistry.ts
```

Use that registry instead of scattering raw strings everywhere.

Example:

```ts
import { assetPaths } from '../assets/assetRegistry';

<img src={assetPaths.cards.back} alt="Card back" />
```

## Naming rules

- Use lowercase filenames.
- Use hyphens, not spaces.
- Use `.svg` for editable placeholder/vector assets.
- Use `.png` for final transparent UI/card art.
- Use `.webp` for large non-transparent final backgrounds.
- Use `.mp3` or `.ogg` for browser audio.
- Do not commit huge design-source files unless needed.
- Keep browser-ready assets optimized.

## Current status

```txt
✅ Asset locations are defined.
✅ Source/master asset folder is defined.
✅ Browser-ready public asset folder is defined.
✅ Code asset registry is defined.
✅ Placeholder SVG card art exists.
✅ Placeholder SVG logo art exists.
✅ Placeholder SVG table/UI art exists.
✅ ThcCard renders visual assets.
✅ App hero renders the logo asset.
⚠️ Final custom artwork/audio still needs to replace placeholders.
```

## VS Code workflow

1. Put original art in `assets/`.
2. Export optimized browser files into `apps/web/public/assets/`.
3. Reference browser files through `apps/web/src/assets/assetRegistry.ts`.
4. Run the web app and confirm each asset loads in the browser Network tab.
