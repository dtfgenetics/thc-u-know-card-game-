import { describe, expect, it } from 'vitest';
import type { Player } from '../types.js';
import { createGameState } from './createGame.js';

const players: Player[] = [
  { id: 'p1', name: 'Grower One', connected: true, host: true, calledThcUKnow: true },
  { id: 'p2', name: 'Grower Two', connected: true, host: false, calledThcUKnow: true }
];

describe('new round state reset', () => {
  it('creates a fresh round with no winner and reset hands', () => {
    const resetPlayers = players.map(player => ({ ...player, calledThcUKnow: false }));
    const state = createGameState({ sessionCode: 'REMATCH', players: resetPlayers, random: () => 0.5 });

    expect(state.winnerId).toBeUndefined();
    expect(state.started).toBe(true);
    expect(state.pendingDraw).toBe(0);
    expect(state.players.every(player => !player.calledThcUKnow)).toBe(true);
    expect(state.hands).toHaveLength(2);
    expect(state.hands[0]?.cards).toHaveLength(7);
    expect(state.hands[1]?.cards).toHaveLength(7);
  });
});
