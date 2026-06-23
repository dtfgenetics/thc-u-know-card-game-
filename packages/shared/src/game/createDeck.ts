import type { Card, CardColor, CardKind, GameMode } from '../types.js';
import { actionLabels, classicColors, colorLabels } from './cardNames.js';
import { shuffle } from './shuffle.js';

function cardId(parts: Array<string | number>): string {
  return parts.join('-').toLowerCase().replace(/\s+/g, '-');
}

function numberCard(color: CardColor, value: number, copy: number): Card {
  return {
    id: cardId(['card', color, value, copy]),
    color,
    kind: 'number',
    label: `${colorLabels[color]} ${value}`,
    value,
    points: value
  };
}

function actionCard(color: CardColor, kind: Exclude<CardKind, 'number'>, copy: number): Card {
  const points = color === 'black' ? 50 : 20;
  return {
    id: cardId(['card', color, kind, copy]),
    color,
    kind,
    label: actionLabels[kind],
    points
  };
}

export function createDeck(mode: GameMode = 'classic', random: () => number = Math.random): Card[] {
  const cards: Card[] = [];

  for (const color of classicColors) {
    cards.push(numberCard(color, 0, 1));

    for (let value = 1; value <= 9; value += 1) {
      cards.push(numberCard(color, value, 1));
      cards.push(numberCard(color, value, 2));
    }

    for (let copy = 1; copy <= 2; copy += 1) {
      cards.push(actionCard(color, 'couch-lock', copy));
      cards.push(actionCard(color, 'puff-puff-pass-back', copy));
      cards.push(actionCard(color, 'pack-two', copy));
    }
  }

  for (let copy = 1; copy <= 4; copy += 1) {
    cards.push(actionCard('black', 'strain-switch', copy));
    cards.push(actionCard('black', 'hotbox-plus-four', copy));
  }

  if (mode === 'party' || mode === 'no-mercy') {
    const partyCards: Exclude<CardKind, 'number'>[] = [
      'munchies',
      'paranoia',
      'rotation',
      'tolerance-break',
      'bogart',
      'pass-the-tray',
      'smoke-sesh',
      'greener-side'
    ];
    for (const kind of partyCards) {
      cards.push(actionCard('black', kind, 1));
      if (mode === 'no-mercy') cards.push(actionCard('black', kind, 2));
    }
  }

  return shuffle(cards, random);
}
