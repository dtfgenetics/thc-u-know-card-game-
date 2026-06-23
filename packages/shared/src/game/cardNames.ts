import type { CardColor, CardKind } from '../types.js';

export const colorLabels: Record<CardColor, string> = {
  purple: 'Purple Haze',
  green: 'Green Room',
  gold: 'Gold Kief',
  blue: 'Blue Dream',
  black: 'Wild Smoke'
};

export const actionLabels: Record<Exclude<CardKind, 'number'>, string> = {
  'couch-lock': 'Couch Lock',
  'puff-puff-pass-back': 'Puff Puff Pass Back',
  'pack-two': 'Pack Two',
  'strain-switch': 'Strain Switch',
  'hotbox-plus-four': 'Hotbox +4',
  munchies: 'Munchies',
  paranoia: 'Paranoia',
  rotation: 'Rotation',
  'tolerance-break': 'Tolerance Break',
  bogart: 'Bogart',
  'pass-the-tray': 'Pass the Tray',
  'smoke-sesh': 'Smoke Sesh',
  'greener-side': 'Greener Side'
};

export const classicColors: CardColor[] = ['purple', 'green', 'gold', 'blue'];
