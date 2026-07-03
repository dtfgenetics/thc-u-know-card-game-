import type { CardKind, GameMode } from '../types.js';

export type CardManifestEntry = {
  kind: Exclude<CardKind, 'number'>;
  label: string;
  deckGroup: 'classic-color-action' | 'classic-wild' | 'party-wild';
  points: number;
  copies: Partial<Record<GameMode, number>>;
  needsChosenColor: boolean;
  needsTarget: boolean;
  effect: string;
};

export const numberCardRules = {
  values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  zeroCopiesPerColor: 0,
  nonZeroCopiesPerColor: 2,
  points: 'face value'
} as const;

export const cardManifest: CardManifestEntry[] = [
  {
    kind: 'couch-lock',
    label: 'Couch Lock',
    deckGroup: 'classic-color-action',
    points: 20,
    copies: { classic: 2, party: 2, 'fast-sesh': 2, 'no-mercy': 2 },
    needsChosenColor: false,
    needsTarget: false,
    effect: 'Skip the next player.'
  },
  {
    kind: 'puff-puff-pass-back',
    label: 'Pass It Back',
    deckGroup: 'classic-color-action',
    points: 20,
    copies: { classic: 2, party: 2, 'fast-sesh': 2, 'no-mercy': 2 },
    needsChosenColor: false,
    needsTarget: false,
    effect: 'Reverse turn direction. Acts as a skip in two-player games.'
  },
  {
    kind: 'pack-two',
    label: 'Cottonmouth',
    deckGroup: 'classic-color-action',
    points: 20,
    copies: { classic: 2, party: 2, 'fast-sesh': 2, 'no-mercy': 2 },
    needsChosenColor: false,
    needsTarget: false,
    effect: 'Next player must draw 2 cards from the Stash.'
  },
  {
    kind: 'strain-switch',
    label: 'Strain Swap',
    deckGroup: 'classic-wild',
    points: 50,
    copies: { classic: 6, party: 6, 'fast-sesh': 6, 'no-mercy': 6 },
    needsChosenColor: true,
    needsTarget: false,
    effect: 'Choose the active strain color.'
  },
  {
    kind: 'hotbox-plus-four',
    label: 'Greenout',
    deckGroup: 'classic-wild',
    points: 50,
    copies: { classic: 6, party: 6, 'fast-sesh': 6, 'no-mercy': 6 },
    needsChosenColor: true,
    needsTarget: false,
    effect: 'Choose the active strain color. Next player must draw 4 cards from the Stash.'
  },
  {
    kind: 'munchies',
    label: 'Munchies',
    deckGroup: 'party-wild',
    points: 50,
    copies: { party: 1, 'no-mercy': 2 },
    needsChosenColor: false,
    needsTarget: false,
    effect: 'Party draw card. Next player must draw 2 cards from the Stash.'
  },
  {
    kind: 'paranoia',
    label: 'Paranoia',
    deckGroup: 'party-wild',
    points: 50,
    copies: { party: 1, 'no-mercy': 2 },
    needsChosenColor: false,
    needsTarget: false,
    effect: 'Party skip card. Skip the next player.'
  },
  {
    kind: 'rotation',
    label: 'Rotation',
    deckGroup: 'party-wild',
    points: 50,
    copies: { party: 1, 'no-mercy': 2 },
    needsChosenColor: false,
    needsTarget: false,
    effect: 'Party reverse card. Reverse turn direction.'
  },
  {
    kind: 'tolerance-break',
    label: 'Tolerance Break',
    deckGroup: 'party-wild',
    points: 50,
    copies: { party: 1, 'no-mercy': 2 },
    needsChosenColor: false,
    needsTarget: false,
    effect: 'May be played against pending draw pressure. Clears pending draw pressure, then ends turn.'
  },
  {
    kind: 'bogart',
    label: 'Bogart',
    deckGroup: 'party-wild',
    points: 50,
    copies: { party: 1, 'no-mercy': 2 },
    needsChosenColor: false,
    needsTarget: true,
    effect: 'Target player draws 1 card. Defaults to next player if no target is selected.'
  },
  {
    kind: 'pass-the-tray',
    label: 'Pass the Tray',
    deckGroup: 'party-wild',
    points: 50,
    copies: { party: 1, 'no-mercy': 2 },
    needsChosenColor: false,
    needsTarget: false,
    effect: 'Every player passes one card in turn direction.'
  },
  {
    kind: 'smoke-sesh',
    label: 'Smoke Sesh',
    deckGroup: 'party-wild',
    points: 50,
    copies: { party: 1, 'no-mercy': 2 },
    needsChosenColor: false,
    needsTarget: false,
    effect: 'Every other player draws 1 card.'
  },
  {
    kind: 'greener-side',
    label: 'Greener Side',
    deckGroup: 'party-wild',
    points: 50,
    copies: { party: 1, 'no-mercy': 2 },
    needsChosenColor: false,
    needsTarget: true,
    effect: 'Swap hands with a target player. Defaults to next player if no target is selected.'
  }
];

export function manifestEntry(kind: Exclude<CardKind, 'number'>): CardManifestEntry {
  const entry = cardManifest.find(item => item.kind === kind);
  if (!entry) throw new Error(`Missing card manifest entry for ${kind}`);
  return entry;
}

export function copiesForMode(entry: CardManifestEntry, mode: GameMode): number {
  return entry.copies[mode] ?? 0;
}
