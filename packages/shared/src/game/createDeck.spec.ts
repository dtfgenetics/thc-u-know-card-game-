import { describe, expect, it } from 'vitest';
import { createDeck } from './createDeck.js';
import type { CardColor, CardKind } from '../types.js';

const colors: CardColor[] = ['purple', 'green', 'gold', 'blue'];

function countKind(deck: ReturnType<typeof createDeck>, kind: CardKind): number {
  return deck.filter(card => card.kind === kind).length;
}

describe('classic deck manifest', () => {
  it('creates the approved 108-card print deck size without zero cards', () => {
    const deck = createDeck('classic', () => 0.5);

    expect(deck).toHaveLength(108);
    expect(deck.filter(card => card.kind === 'number' && card.value === 0)).toHaveLength(0);

    for (const color of colors) {
      const cardsForColor = deck.filter(card => card.color === color);
      const numberCardsForColor = cardsForColor.filter(card => card.kind === 'number');
      const actionCardsForColor = cardsForColor.filter(card => card.kind !== 'number');

      expect(numberCardsForColor).toHaveLength(18);
      expect(actionCardsForColor).toHaveLength(6);

      for (let value = 1; value <= 9; value += 1) {
        expect(numberCardsForColor.filter(card => card.value === value)).toHaveLength(2);
      }
    }

    expect(countKind(deck, 'couch-lock')).toBe(8);
    expect(countKind(deck, 'puff-puff-pass-back')).toBe(8);
    expect(countKind(deck, 'pack-two')).toBe(8);
    expect(countKind(deck, 'strain-switch')).toBe(6);
    expect(countKind(deck, 'hotbox-plus-four')).toBe(6);
  });
});
