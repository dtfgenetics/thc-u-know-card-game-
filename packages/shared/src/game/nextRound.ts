import type { GameState } from '../types.js';
import { createGameState } from './createGame.js';

export function createNextRoundState(previousState: GameState, random?: () => number): GameState {
  const resetPlayers = previousState.players.map(player => ({ ...player, calledThcUKnow: false }));
  return createGameState({
    sessionCode: previousState.sessionCode,
    players: resetPlayers,
    settings: previousState.settings,
    scores: previousState.scores,
    roundNumber: previousState.roundNumber + 1,
    random
  });
}
