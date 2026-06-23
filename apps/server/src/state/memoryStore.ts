import { randomUUID } from 'node:crypto';
import { defaultSettings } from '@thc-u-know/shared';
import type { GameSettings, GameState, Player } from '@thc-u-know/shared';
import type { Session } from './types.js';

const sessions = new Map<string, Session>();

function sessionCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function syncGamePlayers(session: Session, players: Player[]): Session {
  if (!session.game) return { ...session, players };
  return {
    ...session,
    players,
    game: {
      ...session.game,
      players,
      updatedAt: Date.now()
    }
  };
}

function transferHostIfNeeded(session: Session): Session {
  if (session.players.some(player => player.id === session.hostId)) return session;
  const nextHost = session.players[0];
  if (!nextHost) return session;
  const players = session.players.map(player => ({ ...player, host: player.id === nextHost.id }));
  return syncGamePlayers({ ...session, hostId: nextHost.id }, players);
}

export function createPlayer(name: string, host = false, playerId = randomUUID()): Player {
  return {
    id: playerId,
    name: name.trim(),
    connected: true,
    host,
    calledThcUKnow: false
  };
}

export function createSession(playerName: string, settings?: Partial<GameSettings>): Session {
  let code = sessionCode();
  while (sessions.has(code)) code = sessionCode();

  const host = createPlayer(playerName, true);
  const now = Date.now();
  const mode = settings?.mode ?? defaultSettings.mode;
  const startingHandSize = mode === 'fast-sesh' ? 5 : settings?.startingHandSize ?? defaultSettings.startingHandSize;
  const session: Session = {
    code,
    hostId: host.id,
    players: [host],
    settings: { ...defaultSettings, ...settings, mode, startingHandSize },
    createdAt: now,
    updatedAt: now
  };

  sessions.set(code, session);
  return session;
}

export function getSession(code: string): Session | undefined {
  return sessions.get(code.toUpperCase());
}

export function saveSession(session: Session): Session {
  const updated = { ...session, updatedAt: Date.now() };
  sessions.set(updated.code, updated);
  return updated;
}

export function joinSession(code: string, playerName: string, playerId?: string): { session?: Session; player?: Player; error?: string } {
  const session = getSession(code);
  if (!session) return { error: 'Smoke Circle not found' };

  const normalizedName = playerName.trim();
  if (!normalizedName) return { error: 'Player name is required' };

  const existingById = playerId ? session.players.find(player => player.id === playerId) : undefined;
  if (existingById) {
    const players = session.players.map(player =>
      player.id === playerId ? { ...player, connected: true, name: normalizedName || player.name } : player
    );
    const updated = saveSession(syncGamePlayers(session, players));
    return { session: updated, player: players.find(player => player.id === playerId) };
  }

  if (session.game?.started) return { error: 'This game has already started' };
  if (session.players.length >= session.settings.maxPlayers) return { error: 'Smoke Circle is full' };

  if (session.players.some(player => player.name.toLowerCase() === normalizedName.toLowerCase())) {
    return { error: 'That player name is already taken in this Smoke Circle' };
  }

  const player = createPlayer(normalizedName, false, playerId);
  const updated = saveSession({ ...session, players: [...session.players, player] });
  return { session: updated, player };
}

export function rejoinSession(code: string, playerId: string): { session?: Session; player?: Player; error?: string } {
  const session = getSession(code);
  if (!session) return { error: 'Smoke Circle not found' };
  const player = session.players.find(item => item.id === playerId);
  if (!player) return { error: 'Player is not part of this Smoke Circle' };
  const players = session.players.map(item => (item.id === playerId ? { ...item, connected: true } : item));
  const updated = saveSession(syncGamePlayers(session, players));
  return { session: updated, player: players.find(item => item.id === playerId) };
}

export function setGame(code: string, game: GameState): Session | undefined {
  const session = getSession(code);
  if (!session) return undefined;
  return saveSession({ ...session, game });
}

export function kickPlayer(code: string, hostId: string, targetPlayerId: string): { session?: Session; error?: string } {
  const session = getSession(code);
  if (!session) return { error: 'Smoke Circle not found' };
  if (session.hostId !== hostId) return { error: 'Only the host can kick players' };
  if (targetPlayerId === hostId) return { error: 'Host cannot kick themselves' };
  if (!session.players.some(player => player.id === targetPlayerId)) return { error: 'Player not found' };

  const players = session.players.filter(player => player.id !== targetPlayerId);
  let game = session.game;
  if (game) {
    game = {
      ...game,
      players,
      hands: game.hands.filter(hand => hand.playerId !== targetPlayerId),
      currentPlayerId: game.currentPlayerId === targetPlayerId ? players[0]?.id ?? '' : game.currentPlayerId,
      updatedAt: Date.now()
    };
  }

  return { session: saveSession(transferHostIfNeeded({ ...session, players, game })) };
}

export function markDisconnected(playerId: string): Session | undefined {
  for (const session of sessions.values()) {
    if (!session.players.some(player => player.id === playerId)) continue;
    const players = session.players.map(player =>
      player.id === playerId ? { ...player, connected: false } : player
    );
    return saveSession(syncGamePlayers(session, players));
  }
  return undefined;
}

export function publicSession(session: Session) {
  return {
    code: session.code,
    hostId: session.hostId,
    players: session.players,
    settings: session.settings,
    started: Boolean(session.game?.started)
  };
}
