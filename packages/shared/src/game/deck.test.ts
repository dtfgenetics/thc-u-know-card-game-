import { describe, expect, it } from 'vitest';
import { createDeck } from './createDeck.js';

describe('createDeck', () => {
  it('creates a classic deck with 108 cards', () => {
    const deck = createDeck('classic', () => 0.5);
    expect(deck).toHaveLength(108);
  });

  it('creates a party deck with extra THC U Know cards', () => {
    const classic = createDeck('classic', () => 0.5);
    const party = createDeck('party', () => 0.5);
    expect(party.length).toBeGreaterThan(classic.length);
    expect(party.some(card => card.kind === 'munchies')).toBe(true);
  });
});
