import { describe, expect, it } from 'vitest';
import type { Card, GameState, Player } from '../types.js';
import { playCard } from './applyMove.js';

function player(id: string, connected = true, host = false): Player {
  return { id, name: id, connected, host, calledThcUKnow: false };
}

function targetedCard(kind: 'bogart' | 'greener-side'): Card {
  return {
    id: kind,
    color: 'black',
    kind,
    label: kind === 'bogart' ? 'Bogart' : 'Greener Side',
    points: 50
  };
}

function state(card: Card, targetConnected: boolean): GameState {
  const players = [
    player('actor', true, true),
    player('target', targetConnected),
    player('other', true)
  ];

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
      { playerId: 'actor', cards: [card, { id: 'keep', color: 'green', kind: 'number', label: '2', value: 2, points: 2 }] },
      { playerId: 'target', cards: [{ id: 'target-card', color: 'blue', kind: 'number', label: '3', value: 3, points: 3 }] },
      { playerId: 'other', cards: [{ id: 'other-card', color: 'gold', kind: 'number', label: '4', value: 4, points: 4 }] }
    ],
    drawPile: [{ id: 'draw', color: 'purple', kind: 'number', label: '5', value: 5, points: 5 }],
    discardPile: [{ id: 'top', color: 'green', kind: 'number', label: '7', value: 7, points: 7 }],
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

describe('targeted action cards', () => {
  for (const kind of ['bogart', 'greener-side'] as const) {
    it(`${kind} rejects a disconnected target`, () => {
      const game = state(targetedCard(kind), false);
      const result = playCard(game, {
        playerId: 'actor',
        cardId: kind,
        targetPlayerId: 'target'
      });

      expect(result).toEqual({
        ok: false,
        reason: 'Target player must be connected',
        state: game
      });
    });

    it(`${kind} accepts a connected target`, () => {
      const game = state(targetedCard(kind), true);
      const result = playCard(game, {
        playerId: 'actor',
        cardId: kind,
        targetPlayerId: 'target'
      });

      expect(result.ok).toBe(true);
    });
  }
});
