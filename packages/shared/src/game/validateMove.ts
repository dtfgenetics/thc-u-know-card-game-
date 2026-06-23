import type { Card, CardColor, GameState } from '../types.js';

export function getTopDiscard(state: GameState): Card {
  const top = state.discardPile[state.discardPile.length - 1];
  if (!top) throw new Error('Discard pile is empty');
  return top;
}

export function findPlayerHand(state: GameState, playerId: string) {
  return state.hands.find(hand => hand.playerId === playerId);
}

export function canPlayCard(state: GameState, playerId: string, card: Card): { ok: true } | { ok: false; reason: string } {
  if (state.winnerId) return { ok: false, reason: 'The game is already over' };
  if (state.currentPlayerId !== playerId) return { ok: false, reason: 'It is not your turn' };

  const top = getTopDiscard(state);
  if (card.color === 'black') return { ok: true };
  if (card.color === state.activeColor) return { ok: true };
  if (card.kind === 'number' && top.kind === 'number' && card.value === top.value) return { ok: true };
  if (card.kind !== 'number' && card.kind === top.kind) return { ok: true };

  return { ok: false, reason: 'Card must match active color, number, action, or be a wild card' };
}

export function normalizeChosenColor(color?: CardColor): CardColor | undefined {
  if (!color) return undefined;
  if (color === 'black') return undefined;
  return color;
}
