import type { Server, Socket } from 'socket.io';
import { Events, createGameState, drawCards, playCard } from '@thc-u-know/shared';
import type { CardColor } from '@thc-u-know/shared';
import {
  createSession,
  getSession,
  joinSession,
  markDisconnected,
  publicSession,
  saveSession,
  setGame
} from '../state/memoryStore.js';
import { broadcastGame, broadcastSession } from './broadcast.js';

function joinSocketRooms(socket: Socket, code: string, playerId: string): void {
  socket.join(code);
  socket.join(`player:${playerId}`);
  socket.data.sessionCode = code;
  socket.data.playerId = playerId;
}

export function registerSocketHandlers(io: Server): void {
  io.on('connection', socket => {
    socket.on(Events.SESSION_CREATE, payload => {
      const name = String(payload?.playerName ?? '').trim();
      if (!name) {
        socket.emit(Events.ERROR, { message: 'Player name is required' });
        return;
      }

      const session = createSession(name, payload?.settings);
      const player = session.players[0];
      if (!player) return;
      joinSocketRooms(socket, session.code, player.id);
      socket.emit(Events.SESSION_CREATED, { session: publicSession(session), player });
      broadcastSession(io, session);
    });

    socket.on(Events.SESSION_JOIN, payload => {
      const code = String(payload?.code ?? '').trim().toUpperCase();
      const name = String(payload?.playerName ?? '').trim();
      const result = joinSession(code, name, payload?.playerId);
      if (result.error || !result.session || !result.player) {
        socket.emit(Events.ERROR, { message: result.error ?? 'Unable to join Smoke Circle' });
        return;
      }

      joinSocketRooms(socket, result.session.code, result.player.id);
      socket.emit(Events.SESSION_JOINED, { session: publicSession(result.session), player: result.player });
      broadcastSession(io, result.session);
    });

    socket.on(Events.GAME_START, payload => {
      const code = String(payload?.code ?? socket.data.sessionCode ?? '').trim().toUpperCase();
      const playerId = String(payload?.playerId ?? socket.data.playerId ?? '');
      const session = getSession(code);
      if (!session) return socket.emit(Events.ERROR, { message: 'Smoke Circle not found' });
      if (session.hostId !== playerId) return socket.emit(Events.ERROR, { message: 'Only the host can start the game' });
      if (session.players.length < 2) return socket.emit(Events.ERROR, { message: 'At least 2 players are required' });

      const game = createGameState({ sessionCode: session.code, players: session.players, settings: session.settings });
      const updated = setGame(code, game);
      if (!updated) return;
      io.to(code).emit(Events.GAME_STARTED, publicSession(updated));
      broadcastGame(io, updated);
    });

    socket.on(Events.GAME_PLAY_CARD, payload => {
      const code = String(payload?.code ?? socket.data.sessionCode ?? '').trim().toUpperCase();
      const playerId = String(payload?.playerId ?? socket.data.playerId ?? '');
      const session = getSession(code);
      if (!session?.game) return socket.emit(Events.ERROR, { message: 'Game not found' });

      const result = playCard(session.game, {
        playerId,
        cardId: String(payload?.cardId ?? ''),
        chosenColor: payload?.chosenColor as CardColor | undefined,
        targetPlayerId: payload?.targetPlayerId
      });

      if (!result.ok) return socket.emit(Events.ERROR, { message: result.reason ?? 'Invalid move' });
      const updated = saveSession({ ...session, game: result.state });
      broadcastGame(io, updated);
      if (result.state.winnerId) io.to(code).emit(Events.GAME_OVER, { winnerId: result.state.winnerId });
    });

    socket.on(Events.GAME_DRAW_CARD, payload => {
      const code = String(payload?.code ?? socket.data.sessionCode ?? '').trim().toUpperCase();
      const playerId = String(payload?.playerId ?? socket.data.playerId ?? '');
      const session = getSession(code);
      if (!session?.game) return socket.emit(Events.ERROR, { message: 'Game not found' });

      const drawCount = session.game.pendingDraw > 0 ? session.game.pendingDraw : 1;
      const result = drawCards(session.game, playerId, drawCount, true);
      if (!result.ok) return socket.emit(Events.ERROR, { message: result.reason ?? 'Unable to draw' });
      const updated = saveSession({ ...session, game: result.state });
      broadcastGame(io, updated);
    });

    socket.on(Events.GAME_CALL_THC_U_KNOW, payload => {
      const code = String(payload?.code ?? socket.data.sessionCode ?? '').trim().toUpperCase();
      const playerId = String(payload?.playerId ?? socket.data.playerId ?? '');
      const session = getSession(code);
      if (!session?.game) return;
      const game = {
        ...session.game,
        players: session.game.players.map(player =>
          player.id === playerId ? { ...player, calledThcUKnow: true } : player
        )
      };
      const updated = saveSession({ ...session, game });
      broadcastGame(io, updated);
    });

    socket.on(Events.CHAT_SEND, payload => {
      const code = String(payload?.code ?? socket.data.sessionCode ?? '').trim().toUpperCase();
      const playerId = String(payload?.playerId ?? socket.data.playerId ?? '');
      const session = getSession(code);
      const player = session?.players.find(item => item.id === playerId);
      if (!session || !player) return;
      io.to(code).emit(Events.CHAT_RECEIVE, {
        playerId,
        playerName: player.name,
        message: String(payload?.message ?? '').slice(0, 240),
        createdAt: Date.now()
      });
    });

    socket.on('disconnect', () => {
      const playerId = socket.data.playerId;
      if (!playerId) return;
      const session = markDisconnected(playerId);
      if (session) broadcastSession(io, session);
    });
  });
}
