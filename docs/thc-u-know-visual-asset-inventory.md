# THC U Know Visual Asset Inventory

Date: 2026-06-23

This file tracks the visual assets required for the digital version of the physical THC U Know card game.

## Rule

The digital game must visually represent the created THC U Know cards. Generic placeholders are allowed only as temporary working assets until final approved art is exported.

## Asset locations

```txt
assets/                         Source/master artwork and references
apps/web/public/assets/          Browser-ready assets used by the live game
apps/web/src/assets/             TypeScript asset registries/mappings
```

## Required card visuals

### Card back

```txt
apps/web/public/assets/cards/digital/card-back.svg
```

### Number card color templates

The number value is rendered by the React card component. These templates provide the color-family visual style.

```txt
apps/web/public/assets/cards/digital/number-purple.svg
apps/web/public/assets/cards/digital/number-green.svg
apps/web/public/assets/cards/digital/number-gold.svg
apps/web/public/assets/cards/digital/number-blue.svg
```

### Classic action card visuals

```txt
apps/web/public/assets/cards/digital/couch-lock.svg
apps/web/public/assets/cards/digital/puff-puff-pass-back.svg
apps/web/public/assets/cards/digital/pack-two.svg
```

### Classic wild card visuals

```txt
apps/web/public/assets/cards/digital/strain-switch.svg
apps/web/public/assets/cards/digital/hotbox-plus-four.svg
```

### Party / No Mercy card visuals

```txt
apps/web/public/assets/cards/digital/munchies.svg
apps/web/public/assets/cards/digital/paranoia.svg
apps/web/public/assets/cards/digital/rotation.svg
apps/web/public/assets/cards/digital/tolerance-break.svg
apps/web/public/assets/cards/digital/bogart.svg
apps/web/public/assets/cards/digital/pass-the-tray.svg
apps/web/public/assets/cards/digital/smoke-sesh.svg
apps/web/public/assets/cards/digital/greener-side.svg
```

## Code files that use these assets

```txt
apps/web/src/assets/assetRegistry.ts
apps/web/src/assets/cardVisualAssets.ts
apps/web/src/components/ThcCard.tsx
```

## Implementation completed

```txt
✅ Existing broad placeholder assets remain as fallbacks.
✅ Specific digital card assets now live under /assets/cards/digital/.
✅ A TypeScript card visual resolver exists.
✅ ThcCard now uses the specific card visual resolver.
✅ Number cards use color-family templates.
✅ Classic action cards use individual action visuals.
✅ Wild cards use individual wild visuals.
✅ Party / No Mercy cards use individual party visuals.
```

## Current status

```txt
✅ Asset inventory defined.
✅ Required digital card files listed.
✅ Specific digital SVG placeholders created.
✅ Digital card resolver created.
✅ Card component wired to digital visuals.
⚠️ Final approved print-matched card art still needs to replace SVG placeholders once exported.
```
