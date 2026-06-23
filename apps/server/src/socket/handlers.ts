import type { Server, Socket } from 'socket.io';
import { Events, createGameState, drawCards, playCard } from '@thc-u-know/shared';
import type { CardColor, GameSettings } from '@thc-u-know/shared';
import { publicSession } from '../state/store.js';
import type { SessionStore } from '../state/store.js';
import { broadcastGame, broadcastSession } from './broadcast.js';

type SocketPayload = Record<string, unknown> | undefined;

function joinSocketRooms(socket: Socket, code: string, playerId: string): void {
  socket.join(code);
  socket.join(`player:${playerId}`);
  socket.data.sessionCode = code;
  socket.data.playerId = playerId;
}

function emitSocketError(socket: Socket, message = 'Server error while handling game action'): void {
  socket.emit(Events.ERROR, { message });
}

function safeOn(
  socket: Socket,
  event: string,
  handler: (payload: SocketPayload) => Promise<void> | void
): void {
  socket.on(event, payload => {
    void Promise.resolve(handler(payload as SocketPayload)).catch(error => {
      console.error(`Socket handler failed for ${event}`, error);
      emitSocketError(socket);
    });
  });
}

function payloadString(payload: SocketPayload, key: string, fallback = ''): string {
  return String(payload?.[key] ?? fallback);
}

function payloadSettings(payload: SocketPayload): Partial<GameSettings> | undefined {
  return payload?.settings && typeof payload.settings === 'object'
    ? (payload.settings as Partial<GameSettings>)
    : undefined;
}

async function emitFullState(io: Server, store: SessionStore, sessionCode: string): Promise<void> {
  const session = await store.getSession(sessionCode);
  if (!session) return;
  broadcastSession(io, session);
  if (session.game) broadcastGame(io, session);
}

export function registerSocketHandlers(io: Server, store: SessionStore): void {
  io.on('connection', socket => {
    safeOn(socket, Events.SESSION_CREATE, async payload => {
      const name = payloadString(payload, 'playerName').trim();
      if (!name) {
        socket.emit(Events.ERROR, { message: 'Player name is required' });
        return;
      }

      const session = await store.createSession(name, payloadSettings(payload));
      const player = session.players[0];
      if (!player) return;
      joinSocketRooms(socket, session.code, player.id);
      socket.emit(Events.SESSION_CREATED, { session: publicSession(session), player });
      broadcastSession(io, session);
    });

    safeOn(socket, Events.SESSION_JOIN, async payload => {
      const code = payloadString(payload, 'code').trim().toUpperCase();
      const name = payloadString(payload, 'playerName').trim();
      const playerId = payloadString(payload, 'playerId') || undefined;
      const result = await store.joinSession(code, name, playerId);
      if (result.error || !result.session || !result.player) {
        socket.emit(Events.ERROR, { message: result.error ?? 'Unable to join Smoke Circle' });
        return;
      }

      joinSocketRooms(socket, result.session.code, result.player.id);
      socket.emit(Events.SESSION_JOINED, { session: publicSession(result.session), player: result.player });
      broadcastSession(io, result.session);
      if (result.session.game) broadcastGame(io, result.session);
    });

    safeOn(socket, Events.SESSION_REJOIN, async payload => {
      const code = payloadString(payload, 'code').trim().toUpperCase();
      const playerId = payloadString(payload, 'playerId');
      const result = await store.rejoinSession(code, playerId);
      if (result.error || !result.session || !result.player) {
        socket.emit(Events.ERROR, { message: result.error ?? 'Unable to reconnect' });
        return;
      }

      joinSocketRooms(socket, result.session.code, result.player.id);
      socket.emit(Events.SESSION_JOINED, { session: publicSession(result.session), player: result.player });
      await emitFullState(io, store, result.session.code);
    });

    safeOn(socket, Events.SESSION_KICK_PLAYER, async payload => {
      const code = payloadString(payload, 'code', socket.data.sessionCode).trim().toUpperCase();
      const hostId = payloadString(payload, 'hostId', socket.data.playerId);
      const targetPlayerId = payloadString(payload, 'targetPlayerId');
      const result = await store.kickPlayer(code, hostId, targetPlayerId);
      if (result.error || !result.session) {
        socket.emit(Events.ERROR, { message: result.error ?? 'Unable to kick player' });
        return;
      }
      io.to(`player:${targetPlayerId}`).emit(Events.ERROR, { message: 'You were removed from the Smoke Circle by the host.' });
      broadcastSession(io, result.session);
      broadcastGame(io, result.session);
    });

    safeOn(socket, Events.GAME_START, async payload => {
      const code = payloadString(payload, 'code', socket.data.sessionCode).trim().toUpperCase();
      const playerId = payloadString(payload, 'playerId', socket.data.playerId);
      const session = await store.getSession(code);
      if (!session) return socket.emit(Events.ERROR, { message: 'Smoke Circle not found' });
      if (session.hostId !== playerId) return socket.emit(Events.ERROR, { message: 'Only the host can start the game' });
      if (session.players.length < 2) return socket.emit(Events.ERROR, { message: 'At least 2 players are required' });

      const game = createGameState({ sessionCode: session.code, players: session.players, settings: session.settings });
      const updated = await store.setGame(code, game);
      if (!updated) return;
      io.to(code).emit(Events.GAME_STARTED, publicSession(updated));
      broadcastGame(io, updated);
    });

    safeOn(socket, Events.GAME_REMATCH, async payload => {
      const code = payloadString(payload, 'code', socket.data.sessionCode).trim().toUpperCase();
      const playerId = payloadString(payload, 'playerId', socket.data.playerId);
      const session = await store.getSession(code);
      if (!session?.game) return socket.emit(Events.ERROR, { message: 'Game not found' });
      if (!session.game.winnerId) return socket.emit(Events.ERROR, { message: 'Round is not over yet' });
      if (!session.players.some(player => player.id === playerId)) return socket.emit(Events.ERROR, { message: 'Player not found' });
      if (session.players.length < 2) return socket.emit(Events.ERROR, { message: 'At least 2 players are required' });

      const resetPlayers = session.players.map(player => ({ ...player, calledThcUKnow: false }));
      const game = createGameState({ sessionCode: session.code, players: resetPlayers, settings: session.settings });
      const updated = await store.saveSession({ ...session, players: resetPlayers, game });
      io.to(code).emit(Events.GAME_STARTED, publicSession(updated));
      broadcastSession(io, updated);
      broadcastGame(io, updated);
    });

    safeOn(socket, Events.GAME_PLAY_CARD, async payload => {
      const code = payloadString(payload, 'code', socket.data.sessionCode).trim().toUpperCase();
      const playerId = payloadString(payload, 'playerId', socket.data.playerId);
      const session = await store.getSession(code);
      if (!session?.game) return socket.emit(Events.ERROR, { message: 'Game not found' });

      const result = playCard(session.game, {
        playerId,
        cardId: payloadString(payload, 'cardId'),
        chosenColor: payload?.chosenColor as CardColor | undefined,
        targetPlayerId: payloadString(payload, 'targetPlayerId') || undefined
      });

      if (!result.ok) return socket.emit(Events.ERROR, { message: result.reason ?? 'Invalid move' });
      const updated = await store.saveSession({ ...session, game: result.state });
      broadcastGame(io, updated);
      if (result.state.winnerId) io.to(code).emit(Events.GAME_OVER, { winnerId: result.state.winnerId });
    });

    safeOn(socket, Events.GAME_DRAW_CARD, async payload => {
      const code = payloadString(payload, 'code', socket.data.sessionCode).trim().toUpperCase();
      const playerId = payloadString(payload, 'playerId', socket.data.playerId);
      const session = await store.getSession(code);
      if (!session?.game) return socket.emit(Events.ERROR, { message: 'Game not found' });

      const drawCount = session.game.pendingDraw > 0 ? session.game.pendingDraw : 1;
      const result = drawCards(session.game, playerId, drawCount, true);
      if (!result.ok) return socket.emit(Events.ERROR, { message: result.reason ?? 'Unable to draw' });
      const updated = await store.saveSession({ ...session, game: result.state });
      broadcastGame(io, updated);
    });

    safeOn(socket, Events.GAME_CALL_THC_U_KNOW, async payload => {
      const code = payloadString(payload, 'code', socket.data.sessionCode).trim().toUpperCase();
      const playerId = payloadString(payload, 'playerId', socket.data.playerId);
      const session = await store.getSession(code);
      if (!session?.game) return;
      const players = session.players.map(player =>
        player.id === playerId ? { ...player, calledThcUKnow: true } : player
      );
      const game = {
        ...session.game,
        players
      };
      const updated = await store.saveSession({ ...session, players, game });
      broadcastSession(io, updated);
      broadcastGame(io, updated);
    });

    safeOn(socket, Events.CHAT_SEND, async payload => {
      const code = payloadString(payload, 'code', socket.data.sessionCode).trim().toUpperCase();
      const playerId = payloadString(payload, 'playerId', socket.data.playerId);
      const session = await store.getSession(code);
      const player = session?.players.find(item => item.id === playerId);
      if (!session || !player) return;
      io.to(code).emit(Events.CHAT_RECEIVE, {
        playerId,
        playerName: player.name,
        message: payloadString(payload, 'message').slice(0, 240),
        createdAt: Date.now()
      });
    });

    socket.on('disconnect', () => {
      void (async () => {
        const playerId = socket.data.playerId;
        if (!playerId) return;
        const session = await store.markDisconnected(playerId);
        if (session) {
          broadcastSession(io, session);
          broadcastGame(io, session);
        }
      })().catch(error => {
        console.error('Socket disconnect handler failed', error);
      });
    });
  });
}
