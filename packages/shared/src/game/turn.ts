import type { GameState } from '../types.js';

export function currentPlayerIndex(state: GameState): number {
  return state.players.findIndex(player => player.id === state.currentPlayerId);
}

export function nextPlayerId(state: GameState, steps = 1): string {
  const currentIndex = currentPlayerIndex(state);
  if (currentIndex < 0) throw new Error('Current player is not in the game');

  const playerCount = state.players.length;
  const offset = steps * state.direction;
  const nextIndex = (currentIndex + offset + playerCount * 10) % playerCount;
  return state.players[nextIndex]?.id ?? state.currentPlayerId;
}

export function advanceTurn(state: GameState, steps = 1): GameState {
  return {
    ...state,
    currentPlayerId: nextPlayerId(state, steps),
    updatedAt: Date.now()
  };
}

export function reverseDirection(state: GameState): GameState {
  return {
    ...state,
    direction: state.direction === 1 ? -1 : 1,
    updatedAt: Date.now()
  };
}
