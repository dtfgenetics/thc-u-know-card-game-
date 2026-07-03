import type { Card, CardColor, GameMode } from '../types.js';
import { cardManifest, copiesForMode, numberCardRules } from './cardManifest.js';
import { actionLabels, classicColors, colorLabels, valueLabels } from './cardNames.js';
import { shuffle } from './shuffle.js';

function cardId(parts: Array<string | number>): string {
  return parts.join('-').toLowerCase().replace(/\s+/g, '-');
}

function numberCard(color: CardColor, value: number, copy: number): Card {
  const valueLabel = valueLabels[value] ?? `${colorLabels[color]} ${value}`;

  return {
    id: cardId(['card', color, value, copy]),
    color,
    kind: 'number',
    label: valueLabel,
    value,
    points: value
  };
}

function actionCard(color: CardColor, kind: Exclude<Card['kind'], 'number'>, copy: number, points: number): Card {
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
    for (let copy = 1; copy <= numberCardRules.zeroCopiesPerColor; copy += 1) {
      cards.push(numberCard(color, 0, copy));
    }

    for (let value = 1; value <= 9; value += 1) {
      for (let copy = 1; copy <= numberCardRules.nonZeroCopiesPerColor; copy += 1) {
        cards.push(numberCard(color, value, copy));
      }
    }

    for (const entry of cardManifest.filter(item => item.deckGroup === 'classic-color-action')) {
      const copies = copiesForMode(entry, mode);
      for (let copy = 1; copy <= copies; copy += 1) {
        cards.push(actionCard(color, entry.kind, copy, entry.points));
      }
    }
  }

  for (const entry of cardManifest.filter(item => item.deckGroup !== 'classic-color-action')) {
    const copies = copiesForMode(entry, mode);
    for (let copy = 1; copy <= copies; copy += 1) {
      cards.push(actionCard('black', entry.kind, copy, entry.points));
    }
  }

  return shuffle(cards, random);
}
