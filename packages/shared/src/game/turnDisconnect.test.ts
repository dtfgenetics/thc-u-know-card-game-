import { describe, expect, it } from 'vitest';
import type { GameState, Player } from '../types.js';
import { advancePastDisconnectedCurrentPlayer } from './turn.js';

function makePlayer(id: string, connected = true): Player {
  return { id, name: id, connected, host: id === 'p1', calledThcUKnow: false };
}

function makeState(players: Player[], currentPlayerId: string, direction: 1 | -1 = 1): GameState {
  return {
    sessionCode: 'ABC123',
    settings: {
      mode: 'classic',
      maxPlayers: 4,
      startingHandSize: 7,
      stacking: false,
      jumpIn: false,
      targetScore: 500,
      thcUKnowPenaltyCards: 2
    },
    players,
    hands: players.map(player => ({ playerId: player.id, cards: [] })),
    drawPile: [],
    discardPile: [{
      id: 'discard',
      color: 'green',
      kind: 'number',
      label: '1',
      value: 1,
      points: 1
    }],
    currentPlayerId,
    direction,
    activeColor: 'green',
    pendingDraw: 0,
    actionLog: [],
    scores: Object.fromEntries(players.map(player => [player.id, 0])),
    roundNumber: 1,
    started: true,
    createdAt: 1,
    updatedAt: 1
  };
}

describe('advancePastDisconnectedCurrentPlayer', () => {
  it('keeps the turn when the current player is connected', () => {
    const state = makeState([makePlayer('p1'), makePlayer('p2')], 'p1');
    expect(advancePastDisconnectedCurrentPlayer(state)).toBe(state);
  });

  it('moves clockwise to the next connected player', () => {
    const state = makeState(
      [makePlayer('p1', false), makePlayer('p2'), makePlayer('p3')],
      'p1'
    );
    expect(advancePastDisconnectedCurrentPlayer(state).currentPlayerId).toBe('p2');
  });

  it('respects counter-clockwise direction and skips disconnected players', () => {
    const state = makeState(
      [makePlayer('p1'), makePlayer('p2', false), makePlayer('p3', false), makePlayer('p4')],
      'p2',
      -1
    );
    expect(advancePastDisconnectedCurrentPlayer(state).currentPlayerId).toBe('p1');
  });

  it('leaves the turn unchanged when no connected replacement exists', () => {
    const state = makeState(
      [makePlayer('p1', false), makePlayer('p2', false)],
      'p1'
    );
    expect(advancePastDisconnectedCurrentPlayer(state)).toBe(state);
  });
});
