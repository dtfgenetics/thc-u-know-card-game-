import type { GameState } from '../types.js';

export function canCallThcUKnow(
  state: GameState,
  playerId: string
): { ok: true } | { ok: false; reason: string } {
  const player = state.players.find(item => item.id === playerId);
  if (!player) return { ok: false, reason: 'Player not found' };
  if (player.calledThcUKnow) return { ok: false, reason: 'THC U Know has already been called' };

  const hand = state.hands.find(item => item.playerId === playerId);
  if (!hand) return { ok: false, reason: 'Player hand not found' };
  if (hand.cards.length !== 1) {
    return {
      ok: false,
      reason: 'THC U Know can only be called when you have exactly one card'
    };
  }

  return { ok: true };
}
