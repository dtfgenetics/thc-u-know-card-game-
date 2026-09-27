import { describe, expect, it } from 'vitest';
import type { Card, GameState, Player } from '../types.js';
import { playCard } from './applyMove.js';

function player(id: string, host = false): Player {
  return { id, name: id, connected: true, host, calledThcUKnow: false };
}

function numberCard(id: string, value: number): Card {
  return { id, color: 'green', kind: 'number', label: String(value), value, points: value };
}

function baseState(finalCard: Card, otherHands: Record<string, Card[]>): GameState {
  const players = [player('actor', true), player('target'), player('other')];
  return {
    sessionCode: 'ABC123',
    settings: {
      mode: 'party',
      maxPlayers: 8,
      startingHandSize: 7,
      stacking: false,
      jumpIn: false,
      targetScore: 500,
      thcUKnowPenaltyCards: 2
    },
    players,
    hands: [
      { playerId: 'actor', cards: [finalCard] },
      { playerId: 'target', cards: otherHands.target ?? [] },
      { playerId: 'other', cards: otherHands.other ?? [] }
    ],
    drawPile: [numberCard('draw', 9)],
    discardPile: [numberCard('top', 5)],
    currentPlayerId: 'actor',
    direction: 1,
    activeColor: 'green',
    pendingDraw: 0,
    actionLog: [],
    scores: { actor: 0, target: 0, other: 0 },
    roundNumber: 1,
    started: true,
    createdAt: 1,
    updatedAt: 1
  };
}

describe('last-card hand-moving effects', () => {
  it('Greener Side applies the swap before deciding the round winner', () => {
    const greenerSide: Card = {
      id: 'greener',
      color: 'black',
      kind: 'greener-side',
      label: 'Greener Side',
      points: 50
    };
    const targetCards = [numberCard('t1', 3), numberCard('t2', 4)];
    const game = baseState(greenerSide, {
      target: targetCards,
      other: [numberCard('o1', 6)]
    });

    const result = playCard(game, {
      playerId: 'actor',
      cardId: greenerSide.id,
      targetPlayerId: 'target'
    });

    expect(result.ok).toBe(true);
    expect(result.state.hands.find(hand => hand.playerId === 'actor')?.cards).toEqual(targetCards);
    expect(result.state.hands.find(hand => hand.playerId === 'target')?.cards).toEqual([]);
    expect(result.state.winnerId).toBe('target');
  });

  it('Pass the Tray continues the round when its final-card effect gives the actor another card', () => {
    const passTray: Card = {
      id: 'tray',
      color: 'black',
      kind: 'pass-the-tray',
      label: 'Pass the Tray',
      points: 50
    };
    const game = baseState(passTray, {
      target: [numberCard('t1', 2), numberCard('t2', 3)],
      other: [numberCard('o1', 4)]
    });

    const result = playCard(game, {
      playerId: 'actor',
      cardId: passTray.id
    });

    expect(result.ok).toBe(true);
    expect(result.state.winnerId).toBeUndefined();
    expect(result.state.hands.find(hand => hand.playerId === 'actor')?.cards).toHaveLength(1);
    expect(result.state.currentPlayerId).toBe('target');
  });
});
