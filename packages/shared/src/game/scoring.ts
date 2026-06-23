import type { GameState, LastRoundScore, Player, ScoreLedger } from '../types.js';

export function emptyScores(players: Player[]): ScoreLedger {
  return Object.fromEntries(players.map(player => [player.id, 0]));
}

export function normalizeScores(players: Player[], scores: ScoreLedger = {}): ScoreLedger {
  return Object.fromEntries(players.map(player => [player.id, scores[player.id] ?? 0]));
}

export function playerRemainingPoints(state: GameState, playerId: string): number {
  return state.hands
    .find(hand => hand.playerId === playerId)
    ?.cards.reduce((total, card) => total + card.points, 0) ?? 0;
}

export function calculateRoundScore(state: GameState, winnerId: string): LastRoundScore {
  const remainingCardPoints = Object.fromEntries(
    state.players.map(player => [player.id, playerRemainingPoints(state, player.id)])
  );
  const pointsAwarded = Object.entries(remainingCardPoints)
    .filter(([playerId]) => playerId !== winnerId)
    .reduce((total, [, points]) => total + points, 0);

  return {
    winnerId,
    pointsAwarded,
    remainingCardPoints
  };
}

export function applyRoundScore(state: GameState, winnerId: string): GameState {
  const lastRoundScore = calculateRoundScore(state, winnerId);
  const scores = normalizeScores(state.players, state.scores);
  const winnerScore = (scores[winnerId] ?? 0) + lastRoundScore.pointsAwarded;
  const nextScores = { ...scores, [winnerId]: winnerScore };
  const matchWinnerId = winnerScore >= state.settings.targetScore ? winnerId : undefined;

  return {
    ...state,
    scores: nextScores,
    lastRoundScore,
    winnerId,
    matchWinnerId,
    updatedAt: Date.now()
  };
}
