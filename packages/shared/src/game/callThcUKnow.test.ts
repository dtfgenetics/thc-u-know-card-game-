import { describe, expect, it } from 'vitest';
import type { GameState } from '../types.js';
import { canCallThcUKnow } from './callThcUKnow.js';

function stateWithHand(cardCount: number, calledThcUKnow = false): GameState {
  const cards = Array.from({ length: cardCount }, (_, index) => ({
    id: `card-${index}`,
    color: 'green' as const,
    kind: 'number' as const,
    label: String(index),
    value: index,
    points: index
  }));

  return {
    sessionCode: 'ABC123',
    settings: {
      mode: 'classic',
      maxPlayers: 4,
      startingHandSize: 7,
      stacking: false,
      jumpIn: false,
      targetScore: 500,
      thcUKnowPenaltyCards: 2
    },
    players: [
      { id: 'p1', name: 'Grower', connected: true, host: true, calledThcUKnow }
    ],
    hands: [{ playerId: 'p1', cards }],
    drawPile: [],
    discardPile: [{
      id: 'discard',
      color: 'purple',
      kind: 'number',
      label: '4',
      value: 4,
      points: 4
    }],
    currentPlayerId: 'p1',
    direction: 1,
    activeColor: 'purple',
    pendingDraw: 0,
    actionLog: [],
    scores: { p1: 0 },
    roundNumber: 1,
    started: true,
    createdAt: 1,
    updatedAt: 1
  };
}

describe('canCallThcUKnow', () => {
  it('allows a player with exactly one card who has not called yet', () => {
    expect(canCallThcUKnow(stateWithHand(1), 'p1')).toEqual({ ok: true });
  });

  it('rejects an early call with more than one card', () => {
    expect(canCallThcUKnow(stateWithHand(2), 'p1')).toEqual({
      ok: false,
      reason: 'THC U Know can only be called when you have exactly one card'
    });
  });

  it('rejects a repeated call', () => {
    expect(canCallThcUKnow(stateWithHand(1, true), 'p1')).toEqual({
      ok: false,
      reason: 'THC U Know has already been called'
    });
  });

  it('rejects a player who is not in the game', () => {
    expect(canCallThcUKnow(stateWithHand(1), 'missing')).toEqual({
      ok: false,
      reason: 'Player not found'
    });
  });
});
