import { describe, expect, it } from 'vitest';
import type { Card, Player } from '../types.js';
import { playCard } from './applyMove.js';
import { createGameState } from './createGame.js';
import { createNextRoundState } from './nextRound.js';
import { calculateRoundScore } from './scoring.js';

const players: Player[] = [
  { id: 'p1', name: 'Grower One', connected: true, host: true, calledThcUKnow: false },
  { id: 'p2', name: 'Grower Two', connected: true, host: false, calledThcUKnow: false }
];

const winningCard: Card = { id: 'win-card', color: 'purple', kind: 'number', label: 'Purple Haze 7', value: 7, points: 7 };
const fivePointCard: Card = { id: 'five-card', color: 'green', kind: 'number', label: 'Green Room 5', value: 5, points: 5 };
const actionCard: Card = { id: 'action-card', color: 'gold', kind: 'pack-two', label: 'Pack Two', points: 20 };

describe('round scoring', () => {
  it('calculates remaining hand points for the round winner', () => {
    const state = createGameState({ sessionCode: 'SCORE1', players, random: () => 0.5 });
    const testState = {
      ...state,
      currentPlayerId: 'p1',
      activeColor: 'purple' as const,
      discardPile: [winningCard],
      hands: [
        { playerId: 'p1', cards: [winningCard] },
        { playerId: 'p2', cards: [fivePointCard, actionCard] }
      ]
    };

    const score = calculateRoundScore(testState, 'p1');
    expect(score.pointsAwarded).toBe(25);
    expect(score.remainingCardPoints.p2).toBe(25);
  });

  it('applies score when a player empties their hand', () => {
    const state = createGameState({ sessionCode: 'SCORE2', players, random: () => 0.5 });
    const testState = {
      ...state,
      currentPlayerId: 'p1',
      activeColor: 'purple' as const,
      discardPile: [winningCard],
      hands: [
        { playerId: 'p1', cards: [winningCard] },
        { playerId: 'p2', cards: [fivePointCard, actionCard] }
      ]
    };

    const result = playCard(testState, { playerId: 'p1', cardId: 'win-card' });
    expect(result.ok).toBe(true);
    expect(result.state.winnerId).toBe('p1');
    expect(result.state.scores.p1).toBe(25);
    expect(result.state.lastRoundScore?.pointsAwarded).toBe(25);
  });

  it('preserves scores into the next round', () => {
    const state = createGameState({ sessionCode: 'SCORE3', players, random: () => 0.5 });
    const scoredState = { ...state, scores: { p1: 25, p2: 0 }, roundNumber: 1 };
    const nextRound = createNextRoundState(scoredState, () => 0.5);

    expect(nextRound.roundNumber).toBe(2);
    expect(nextRound.scores.p1).toBe(25);
    expect(nextRound.winnerId).toBeUndefined();
    expect(nextRound.matchWinnerId).toBeUndefined();
  });
});
