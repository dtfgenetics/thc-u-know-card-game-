import type { GameState, PrivatePlayerState, PublicGameState } from '../types.js';

export function toPublicState(state: GameState): PublicGameState {
  const topDiscard = state.discardPile[state.discardPile.length - 1];
  if (!topDiscard) throw new Error('Discard pile is empty');

  const { hands: _hands, drawPile: _drawPile, ...safeState } = state;

  return {
    ...safeState,
    players: state.players.map(player => ({
      ...player,
      cardCount: state.hands.find(hand => hand.playerId === player.id)?.cards.length ?? 0,
      score: state.scores[player.id] ?? 0
    })),
    drawPileCount: state.drawPile.length,
    topDiscard
  };
}

export function toPrivateState(state: GameState, playerId: string): PrivatePlayerState {
  return {
    playerId,
    hand: state.hands.find(hand => hand.playerId === playerId)?.cards ?? []
  };
}
