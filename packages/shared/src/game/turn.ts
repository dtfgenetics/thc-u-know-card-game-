import type { GameState } from '../types.js';

export function currentPlayerIndex(state: GameState): number {
  return state.players.findIndex(player => player.id === state.currentPlayerId);
}

export function nextPlayerId(state: GameState, steps = 1): string {
  const currentIndex = currentPlayerIndex(state);
  if (currentIndex < 0) throw new Error('Current player is not in the game');
  if (steps <= 0) return state.currentPlayerId;

  const playerCount = state.players.length;
  if (playerCount <= 1 || !state.players.some(player => player.connected)) {
    return state.currentPlayerId;
  }

  let index = currentIndex;
  let connectedMoves = 0;

  while (connectedMoves < steps) {
    index = (index + state.direction + playerCount) % playerCount;
    const candidate = state.players[index];
    if (candidate?.connected) connectedMoves += 1;
  }

  return state.players[index]?.id ?? state.currentPlayerId;
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


export function advancePastDisconnectedCurrentPlayer(state: GameState): GameState {
  const currentIndex = currentPlayerIndex(state);
  if (currentIndex < 0) return state;

  const currentPlayer = state.players[currentIndex];
  if (!currentPlayer || currentPlayer.connected) return state;

  for (let step = 1; step < state.players.length; step += 1) {
    const index = (currentIndex + step * state.direction + state.players.length * 10) % state.players.length;
    const candidate = state.players[index];
    if (candidate?.connected) {
      return {
        ...state,
        currentPlayerId: candidate.id,
        updatedAt: Date.now()
      };
    }
  }

  return state;
}
