import { describe, expect, it } from 'vitest';
import type { Card, GameState, Player } from '../types.js';
import { playCard } from './applyMove.js';

function player(id: string, connected = true, host = false): Player {
  return { id, name: id, connected, host, calledThcUKnow: false };
}

function number(id: string, value: number): Card {
  return { id, color: 'green', kind: 'number', label: String(value), value, points: value };
}

function action(id: string, kind: Card['kind'], label: string): Card {
  return { id, color: kind === 'puff-puff-pass-back' ? 'green' : 'black', kind, label, points: 50 };
}

function stateWith(card: Card): GameState {
  const players = [
    player('actor', true, true),
    player('away', false),
    player('other', true)
  ];

  return {
    sessionCode: 'CONNECTED',
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
      { playerId: 'actor', cards: [card, number('actor-keep', 9)] },
      { playerId: 'away', cards: [number('away-1', 2)] },
      { playerId: 'other', cards: [number('other-1', 3)] }
    ],
    drawPile: [number('draw-1', 4), number('draw-2', 5), number('draw-3', 6)],
    discardPile: [number('top', 7)],
    currentPlayerId: 'actor',
    direction: 1,
    activeColor: 'green',
    pendingDraw: 0,
    actionLog: [],
    scores: { actor: 0, away: 0, other: 0 },
    roundNumber: 1,
    roundHistory: [],
    started: true,
    createdAt: 1,
    updatedAt: 1
  };
}

describe('connected-player party card semantics', () => {
  it('Pass the Tray skips disconnected seats when passing cards', () => {
    const card = action('tray', 'pass-the-tray', 'Pass the Tray');
    const game = stateWith(card);

    const result = playCard(game, { playerId: 'actor', cardId: card.id });

    expect(result.ok).toBe(true);
    expect(result.state.hands.find(hand => hand.playerId === 'away')?.cards.map(card => card.id))
      .toEqual(['away-1']);
    expect(result.state.hands.find(hand => hand.playerId === 'actor')?.cards.map(card => card.id))
      .toContain('other-1');
    expect(result.state.hands.find(hand => hand.playerId === 'other')?.cards.map(card => card.id))
      .toContain('actor-keep');
  });

  it('Smoke Sesh only makes connected opponents draw', () => {
    const card = action('sesh', 'smoke-sesh', 'Smoke Sesh');
    const game = stateWith(card);

    const result = playCard(game, { playerId: 'actor', cardId: card.id });

    expect(result.ok).toBe(true);
    expect(result.state.hands.find(hand => hand.playerId === 'away')?.cards).toHaveLength(1);
    expect(result.state.hands.find(hand => hand.playerId === 'other')?.cards).toHaveLength(2);
  });

  it('reverse acts as a skip when only two players are connected', () => {
    const card = action('reverse', 'puff-puff-pass-back', 'Pass It Back');
    const game = stateWith(card);

    const result = playCard(game, { playerId: 'actor', cardId: card.id });

    expect(result.ok).toBe(true);
    expect(result.state.currentPlayerId).toBe('actor');
  });
});
