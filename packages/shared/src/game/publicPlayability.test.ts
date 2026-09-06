import { describe, expect, it } from 'vitest';
import type { Card, GameState, Player } from '../types.js';
import { createGameState } from './createGame.js';
import { toPublicState } from './publicState.js';
import { canPlayCard, canPlayCardFromPublicState } from './validateMove.js';

const players: Player[] = [
  { id: 'p1', name: 'Grower One', connected: true, host: true, calledThcUKnow: false },
  { id: 'p2', name: 'Grower Two', connected: true, host: false, calledThcUKnow: false }
];

const topPurpleThree: Card = {
  id: 'top-purple-three',
  color: 'purple',
  kind: 'number',
  label: 'Purple 3',
  value: 3,
  points: 3
};
const purpleSeven: Card = {
  id: 'purple-seven',
  color: 'purple',
  kind: 'number',
  label: 'Purple 7',
  value: 7,
  points: 7
};
const greenThree: Card = {
  id: 'green-three',
  color: 'green',
  kind: 'number',
  label: 'Green 3',
  value: 3,
  points: 3
};
const greenSeven: Card = {
  id: 'green-seven',
  color: 'green',
  kind: 'number',
  label: 'Green 7',
  value: 7,
  points: 7
};
const dealerChoice: Card = {
  id: 'dealer-choice',
  color: 'black',
  kind: 'dealer-choice',
  label: 'Dealer Choice',
  points: 50
};
const packTwo: Card = {
  id: 'pack-two',
  color: 'green',
  kind: 'pack-two',
  label: 'Pack Two',
  points: 20
};
const toleranceBreak: Card = {
  id: 'tolerance-break',
  color: 'gold',
  kind: 'tolerance-break',
  label: 'Tolerance Break',
  points: 30
};

function tableState(overrides: Partial<GameState> = {}): GameState {
  const base = createGameState({ sessionCode: 'PLAY01', players, random: () => 0.5 });
  return {
    ...base,
    currentPlayerId: 'p1',
    activeColor: 'purple',
    pendingDraw: 0,
    discardPile: [topPurpleThree],
    winnerId: undefined,
    ...overrides
  };
}

function expectPublicParity(state: GameState, card: Card) {
  const server = canPlayCard(state, 'p1', card);
  const client = canPlayCardFromPublicState(toPublicState(state), 'p1', card);
  expect(client).toEqual(server);
  return client;
}

describe('public card playability', () => {
  it('matches the authoritative server rules for color, number, wild, and blocked cards', () => {
    const state = tableState();

    expect(expectPublicParity(state, purpleSeven).ok).toBe(true);
    expect(expectPublicParity(state, greenThree).ok).toBe(true);
    expect(expectPublicParity(state, dealerChoice).ok).toBe(true);
    expect(expectPublicParity(state, greenSeven)).toEqual({
      ok: false,
      reason: 'Card must match active color, number, action, or be a wild card'
    });
  });

  it('matches pending-draw pressure when stacking is disabled', () => {
    const state = tableState({
      pendingDraw: 4,
      settings: { ...tableState().settings, stacking: false }
    });

    expect(expectPublicParity(state, toleranceBreak).ok).toBe(true);
    expect(expectPublicParity(state, packTwo)).toEqual({
      ok: false,
      reason: 'You must draw 4 before your turn can continue'
    });
  });

  it('allows draw-stack answers when stacking is enabled and still rejects unrelated cards', () => {
    const state = tableState({
      pendingDraw: 2,
      settings: { ...tableState().settings, stacking: true }
    });

    expect(expectPublicParity(state, packTwo).ok).toBe(true);
    expect(expectPublicParity(state, toleranceBreak).ok).toBe(true);
    expect(expectPublicParity(state, purpleSeven)).toEqual({
      ok: false,
      reason: 'Only draw cards or Tolerance Break can answer pending draw pressure'
    });
  });

  it('reports not-your-turn consistently from public state', () => {
    const state = tableState({ currentPlayerId: 'p2' });
    expect(expectPublicParity(state, purpleSeven)).toEqual({ ok: false, reason: 'It is not your turn' });
  });
});
