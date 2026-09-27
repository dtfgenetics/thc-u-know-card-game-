import { describe, expect, it } from 'vitest';
import type { GameState, Player } from '../types.js';
import { nextPlayerId } from './turn.js';

function player(id: string, connected = true): Player {
  return { id, name: id, connected, host: id === 'a', calledThcUKnow: false };
}

function state(players: Player[], currentPlayerId = 'a', direction: 1 | -1 = 1): GameState {
  return {
    sessionCode: 'ABC123',
    settings: {
      mode: 'classic',
      maxPlayers: 8,
      startingHandSize: 7,
      stacking: false,
      jumpIn: false,
      targetScore: 500,
      thcUKnowPenaltyCards: 2
    },
    players,
    hands: players.map(item => ({ playerId: item.id, cards: [] })),
    drawPile: [],
    discardPile: [{ id: 'd', color: 'green', kind: 'number', label: '1', value: 1, points: 1 }],
    currentPlayerId,
    direction,
    activeColor: 'green',
    pendingDraw: 0,
    actionLog: [],
    scores: Object.fromEntries(players.map(item => [item.id, 0])),
    roundNumber: 1,
    started: true,
    createdAt: 1,
    updatedAt: 1
  };
}

describe('nextPlayerId disconnected-seat handling', () => {
  it('skips a disconnected next seat', () => {
    const game = state([player('a'), player('b', false), player('c')]);
    expect(nextPlayerId(game)).toBe('c');
  });

  it('skips disconnected seats when moving counter-clockwise', () => {
    const game = state([player('a'), player('b'), player('c', false)], 'a', -1);
    expect(nextPlayerId(game)).toBe('b');
  });

  it('counts only connected players for multi-step movement', () => {
    const game = state([player('a'), player('b', false), player('c'), player('d')]);
    expect(nextPlayerId(game, 2)).toBe('d');
  });

  it('keeps the current player when nobody else is connected', () => {
    const game = state([player('a'), player('b', false), player('c', false)]);
    expect(nextPlayerId(game)).toBe('a');
  });
});
