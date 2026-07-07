import type { Card, CardColor, CardKind } from '@thc-u-know/shared';
import { assetPaths } from './assetRegistry';

type PlayableColor = Exclude<CardColor, 'black'>;
type ActionKind = Exclude<CardKind, 'number'>;
const assetVersion = '20260707';

function versionedAsset(path: string): string {
  return `${path}?v=${assetVersion}`;
}

export const numberCardArtByColor: Record<PlayableColor, string> = {
  purple: 'assets/cards/digital/number-purple.svg',
  green: 'assets/cards/digital/number-green.svg',
  gold: 'assets/cards/digital/number-gold.svg',
  blue: 'assets/cards/digital/number-blue.svg'
};

export const actionCardArtByKind: Record<ActionKind, string> = {
  'couch-lock': 'assets/cards/digital/couch-lock.svg',
  'puff-puff-pass-back': 'assets/cards/digital/puff-puff-pass-back.svg',
  'pack-two': 'assets/cards/digital/pack-two.svg',
  'strain-switch': 'assets/cards/digital/strain-switch.svg',
  'hotbox-plus-four': 'assets/cards/digital/hotbox-plus-four.svg',
  'dealer-choice': 'assets/cards/digital/dealer-choice.svg',
  'mystery-nug': 'assets/cards/digital/mystery-nug.svg',
  munchies: 'assets/cards/digital/munchies.svg',
  paranoia: 'assets/cards/digital/paranoia.svg',
  rotation: 'assets/cards/digital/rotation.svg',
  'tolerance-break': 'assets/cards/digital/tolerance-break.svg',
  bogart: 'assets/cards/digital/bogart.svg',
  'pass-the-tray': 'assets/cards/digital/pass-the-tray.svg',
  'smoke-sesh': 'assets/cards/digital/smoke-sesh.svg',
  'greener-side': 'assets/cards/digital/greener-side.svg'
};

export function cardBackArt(): string {
  return versionedAsset('assets/cards/digital/card-back.svg');
}

export function visualAssetForCard(card: Card): string {
  if (card.kind === 'number') {
    const path = card.color === 'black' ? assetPaths.cards.frontNumber : numberCardArtByColor[card.color as PlayableColor];
    return versionedAsset(path);
  }

  return versionedAsset(actionCardArtByKind[card.kind] ?? assetPaths.cards.frontAction);
}
