import { describe, expect, it } from 'vitest';
import type { Card, GameState, Player } from '../types.js';
import { playCard } from './applyMove.js';
import { createGameState } from './createGame.js';
import { canPlayCard } from './validateMove.js';

const players: Player[] = [
  { id: 'p1', name: 'Grower One', connected: true, host: true, calledThcUKnow: false },
  { id: 'p2', name: 'Grower Two', connected: true, host: false, calledThcUKnow: false }
];

function numberCard(id: string): Card {
  return { id, color: 'purple', kind: 'number', label: 'Purple Haze 7', value: 7, points: 7 };
}

function packTwo(id: string): Card {
  return { id, color: 'purple', kind: 'pack-two', label: 'Pack Two', points: 20 };
}

function toleranceBreak(id: string): Card {
  return { id, color: 'black', kind: 'tolerance-break', label: 'Tolerance Break', points: 50 };
}

function createPendingState(stacking: boolean, p2Cards: Card[] = [numberCard('p2-number'), packTwo('p2-pack-two')]): GameState {
  const state = createGameState({ sessionCode: 'DRAW01', players, random: () => 0.5 });
  return {
    ...state,
    settings: { ...state.settings, stacking },
    currentPlayerId: 'p2',
    activeColor: 'purple',
    pendingDraw: 2,
    discardPile: [packTwo('discard-pack-two')],
    hands: [
      { playerId: 'p1', cards: [numberCard('p1-number')] },
      { playerId: 'p2', cards: p2Cards }
    ]
  };
}

describe('pending draw rules', () => {
  it('forces a draw when stacking is disabled', () => {
    const state = createPendingState(false);
    const card = state.hands[1]!.cards[0]!;
    const validation = canPlayCard(state, 'p2', card);
    expect(validation.ok).toBe(false);
    const result = playCard(state, { playerId: 'p2', cardId: card.id });
    expect(result.ok).toBe(false);
  });

  it('allows draw-card stacking when stacking is enabled', () => {
    const state = createPendingState(true);
    const card = state.hands[1]!.cards[1]!;
    const validation = canPlayCard(state, 'p2', card);
    expect(validation.ok).toBe(true);
    const result = playCard(state, { playerId: 'p2', cardId: card.id });
    expect(result.ok).toBe(true);
    expect(result.state.pendingDraw).toBe(4);
  });

  it('allows Tolerance Break to clear draw pressure even when stacking is disabled', () => {
    const state = createPendingState(false, [toleranceBreak('p2-tolerance-break')]);
    const card = state.hands[1]!.cards[0]!;
    const validation = canPlayCard(state, 'p2', card);
    expect(validation.ok).toBe(true);
    const result = playCard(state, { playerId: 'p2', cardId: card.id });
    expect(result.ok).toBe(true);
    expect(result.state.pendingDraw).toBe(0);
  });
});
