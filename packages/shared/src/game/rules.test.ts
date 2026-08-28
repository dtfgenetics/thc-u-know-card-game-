import { describe, expect, it } from 'vitest';
import type { Card, Player } from '../types.js';
import { createGameState } from './createGame.js';
import { playCard } from './applyMove.js';

const players: Player[] = [
  { id: 'p1', name: 'Grower One', connected: true, host: true, calledThcUKnow: false },
  { id: 'p2', name: 'Grower Two', connected: true, host: false, calledThcUKnow: false }
];

const bogart: Card = { id: 'test-bogart', color: 'black', kind: 'bogart', label: 'Bogart', points: 50 };
const greenerSide: Card = { id: 'test-greener-side', color: 'black', kind: 'greener-side', label: 'Greener Side', points: 50 };

function withPlayerOneCards(state: ReturnType<typeof createGameState>, cards: Card[]) {
  return {
    ...state,
    hands: state.hands.map(hand => (hand.playerId === 'p1' ? { ...hand, cards } : hand))
  };
}

describe('playCard', () => {
  it('rejects moves from the wrong player', () => {
    const state = createGameState({ sessionCode: 'TEST01', players, random: () => 0.5 });
    const card = state.hands[1]?.cards[0];
    expect(card).toBeDefined();
    const result = playCard(state, { playerId: 'p2', cardId: card!.id });
    expect(result.ok).toBe(false);
  });

  it('keeps private hands out of public state through separate serializers', async () => {
    const { toPublicState } = await import('./publicState.js');
    const state = createGameState({ sessionCode: 'TEST02', players, random: () => 0.5 });
    const publicState = toPublicState(state);
    expect('hands' in publicState).toBe(false);
    expect(publicState.players[0]?.cardCount).toBe(7);
  });

  it('rejects self-targeting Bogart without mutating the turn', () => {
    const base = createGameState({ sessionCode: 'TARGET1', players, random: () => 0.5 });
    const filler = base.hands[0]!.cards[0]!;
    const state = withPlayerOneCards(base, [bogart, filler]);
    const result = playCard(state, { playerId: 'p1', cardId: bogart.id, targetPlayerId: 'p1' });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('Target must be another player');
    expect(result.state).toBe(state);
    expect(result.state.currentPlayerId).toBe('p1');
  });

  it('rejects self-targeting Greener Side', () => {
    const base = createGameState({ sessionCode: 'TARGET2', players, random: () => 0.5 });
    const filler = base.hands[0]!.cards[0]!;
    const state = withPlayerOneCards(base, [greenerSide, filler]);
    const result = playCard(state, { playerId: 'p1', cardId: greenerSide.id, targetPlayerId: 'p1' });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('Target must be another player');
  });

  it('rejects unknown targeted player ids', () => {
    const base = createGameState({ sessionCode: 'TARGET3', players, random: () => 0.5 });
    const filler = base.hands[0]!.cards[0]!;
    const state = withPlayerOneCards(base, [bogart, filler]);
    const result = playCard(state, { playerId: 'p1', cardId: bogart.id, targetPlayerId: 'missing-player' });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('Target player was not found');
  });

  it('keeps the documented next-player default when no target is selected', () => {
    const base = createGameState({ sessionCode: 'TARGET4', players, random: () => 0.5 });
    const filler = base.hands[0]!.cards[0]!;
    const state = withPlayerOneCards(base, [bogart, filler]);
    const beforeTargetCards = state.hands.find(hand => hand.playerId === 'p2')!.cards.length;
    const result = playCard(state, { playerId: 'p1', cardId: bogart.id });

    expect(result.ok).toBe(true);
    expect(result.state.hands.find(hand => hand.playerId === 'p2')!.cards.length).toBe(beforeTargetCards + 1);
    expect(result.state.currentPlayerId).toBe('p2');
  });

  it('rejects a self target before final-card scoring can resolve', () => {
    const base = createGameState({ sessionCode: 'TARGET5', players, random: () => 0.5 });
    const state = withPlayerOneCards(base, [bogart]);
    const result = playCard(state, { playerId: 'p1', cardId: bogart.id, targetPlayerId: 'p1' });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('Target must be another player');
    expect(result.state.lastRoundScore).toBeUndefined();
    expect(result.state.roundNumber).toBe(state.roundNumber);
  });
});
