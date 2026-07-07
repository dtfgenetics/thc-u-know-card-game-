import { describe, expect, it } from 'vitest';
import { createDeck } from './createDeck.js';

describe('createDeck', () => {
  it('creates a classic deck with 108 cards', () => {
    const deck = createDeck('classic', () => 0.5);
    expect(deck).toHaveLength(108);
    expect(deck.filter(card => card.kind === 'number')).toHaveLength(72);
    expect(deck.some(card => card.kind === 'number' && card.value === 0)).toBe(false);
    expect(deck.filter(card => card.kind === 'couch-lock')).toHaveLength(8);
    expect(deck.filter(card => card.kind === 'puff-puff-pass-back')).toHaveLength(8);
    expect(deck.filter(card => card.kind === 'pack-two')).toHaveLength(8);
    expect(deck.filter(card => card.kind === 'strain-switch')).toHaveLength(4);
    expect(deck.filter(card => card.kind === 'hotbox-plus-four')).toHaveLength(4);
    expect(deck.filter(card => card.kind === 'dealer-choice')).toHaveLength(2);
    expect(deck.filter(card => card.kind === 'mystery-nug')).toHaveLength(2);
  });

  it('creates a party deck with one copy of each party wild', () => {
    const party = createDeck('party', () => 0.5);
    expect(party).toHaveLength(116);
    expect(party.filter(card => card.kind === 'munchies')).toHaveLength(1);
    expect(party.filter(card => card.kind === 'paranoia')).toHaveLength(1);
    expect(party.filter(card => card.kind === 'rotation')).toHaveLength(1);
    expect(party.filter(card => card.kind === 'tolerance-break')).toHaveLength(1);
    expect(party.filter(card => card.kind === 'bogart')).toHaveLength(1);
    expect(party.filter(card => card.kind === 'pass-the-tray')).toHaveLength(1);
    expect(party.filter(card => card.kind === 'smoke-sesh')).toHaveLength(1);
    expect(party.filter(card => card.kind === 'greener-side')).toHaveLength(1);
  });

  it('creates a no-mercy deck with two copies of each party wild', () => {
    const deck = createDeck('no-mercy', () => 0.5);
    expect(deck).toHaveLength(124);
    expect(deck.filter(card => card.kind === 'munchies')).toHaveLength(2);
    expect(deck.filter(card => card.kind === 'greener-side')).toHaveLength(2);
  });

  it('assigns card values consistently', () => {
    const deck = createDeck('party', () => 0.5);
    const numberNine = deck.find(card => card.kind === 'number' && card.value === 9);
    const colorAction = deck.find(card => card.kind === 'pack-two');
    const wildAction = deck.find(card => card.kind === 'hotbox-plus-four');
    const partyAction = deck.find(card => card.kind === 'smoke-sesh');

    expect(numberNine?.points).toBe(9);
    expect(colorAction?.points).toBe(20);
    expect(wildAction?.points).toBe(50);
    expect(partyAction?.points).toBe(50);
  });
});
