# Source Assets

This folder is for THC U Know source/master assets used by artists, designers, VS Code, and Codex.

These files are not automatically served by the Vite web app. Export optimized browser-ready versions into:

```txt
apps/web/public/assets/
```

## Folder structure

```txt
assets/
  cards/       Original card face/back art, layered exports, high-res PNGs.
  logos/       THC U Know, DTF Genetics, and brand marks.
  music/       Source background music loops.
  sounds/      Source sound effects.
  ui/          Table textures, buttons, badges, icons, overlays.
  reference/   Screenshots, print references, design inspiration, style locks.
```

## Rules

- Keep original/high-quality work here.
- Use clear lowercase filenames with hyphens.
- Do not rely on this folder for browser loading.
- Mirror final web-ready files into `apps/web/public/assets/`.
