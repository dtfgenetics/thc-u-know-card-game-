import type { Player } from '../types.js';

export function canStartRound(
  players: Player[],
  hostId: string,
  requesterId: string
): { ok: true } | { ok: false; reason: string } {
  if (requesterId !== hostId) {
    return { ok: false, reason: 'Only the host can start the round' };
  }
  if (players.length < 2) {
    return { ok: false, reason: 'At least 2 players are required' };
  }
  if (players.some(player => !player.connected)) {
    return { ok: false, reason: 'All seated players must be connected before starting the round' };
  }
  return { ok: true };
}
