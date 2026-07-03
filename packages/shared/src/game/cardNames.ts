import type { CardColor, CardKind } from '../types.js';
import { cardManifest } from './cardManifest.js';

export const colorLabels: Record<CardColor, string> = {
  purple: 'Purple Haze',
  green: 'Green Room',
  gold: 'Orange Room',
  blue: 'Blue Dream',
  black: 'Wild Smoke'
};

export const valueLabels: Record<number, string> = {
  1: 'Seed',
  2: 'Sprout',
  3: 'Veg',
  4: 'Stretch',
  5: 'Flower',
  6: 'Frost',
  7: 'Harvest',
  8: 'Cure',
  9: 'Top Shelf'
};

export const actionLabels = Object.fromEntries(
  cardManifest.map(entry => [entry.kind, entry.label])
) as Record<Exclude<CardKind, 'number'>, string>;

export const classicColors: CardColor[] = ['purple', 'green', 'gold', 'blue'];
