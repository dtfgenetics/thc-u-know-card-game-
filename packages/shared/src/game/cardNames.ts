import type { CardColor, CardKind } from '../types.js';
import { cardManifest } from './cardManifest.js';

export const colorLabels: Record<CardColor, string> = {
  purple: 'Purple Haze',
  green: 'Green Room',
  gold: 'Gold Kief',
  blue: 'Blue Dream',
  black: 'Wild Smoke'
};

export const actionLabels = Object.fromEntries(
  cardManifest.map(entry => [entry.kind, entry.label])
) as Record<Exclude<CardKind, 'number'>, string>;

export const classicColors: CardColor[] = ['purple', 'green', 'gold', 'blue'];
