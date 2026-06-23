import { describe, expect, it } from 'vitest';
import type { Player } from '../types.js';
import { createGameState } from './createGame.js';
import { playCard } from './applyMove.js';

const players: Player[] = [
  { id: 'p1', name: 'Grower One', connected: true, host: true, calledThcUKnow: false },
  { id: 'p2', name: 'Grower Two', connected: true, host: false, calledThcUKnow: false }
];

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
});
