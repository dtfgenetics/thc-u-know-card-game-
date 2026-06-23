import type { Server } from 'socket.io';
import { Events, toPrivateState, toPublicState } from '@thc-u-know/shared';
import type { Session } from '../state/types.js';
import { publicSession } from '../state/memoryStore.js';

export function broadcastSession(io: Server, session: Session): void {
  io.to(session.code).emit(Events.SESSION_UPDATE, publicSession(session));
}

export function broadcastGame(io: Server, session: Session): void {
  if (!session.game) return;
  io.to(session.code).emit(Events.GAME_PUBLIC_STATE, toPublicState(session.game));

  for (const player of session.players) {
    io.to(`player:${player.id}`).emit(Events.GAME_PRIVATE_STATE, toPrivateState(session.game, player.id));
  }
}
