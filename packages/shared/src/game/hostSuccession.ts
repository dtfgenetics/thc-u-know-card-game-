import type { Player } from '../types.js';

export function ensureConnectedHost(
  players: Player[],
  hostId: string
): { hostId: string; players: Player[] } {
  const currentHost = players.find(player => player.id === hostId);
  if (currentHost?.connected) {
    return { hostId, players };
  }

  const nextHost = players.find(player => player.connected);
  if (!nextHost) {
    return { hostId, players };
  }

  return {
    hostId: nextHost.id,
    players: players.map(player => ({
      ...player,
      host: player.id === nextHost.id
    }))
  };
}
