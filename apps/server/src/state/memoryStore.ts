import { randomUUID } from 'node:crypto';
import { defaultSettings } from '@thc-u-know/shared';
import type { GameSettings, GameState, Player } from '@thc-u-know/shared';
import type { Session } from './types.js';

const sessions = new Map<string, Session>();

function sessionCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
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
  const session: Session = {
    code,
    hostId: host.id,
    players: [host],
    settings: { ...defaultSettings, ...settings },
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
  if (session.game?.started) return { error: 'This game has already started' };
  if (session.players.length >= session.settings.maxPlayers) return { error: 'Smoke Circle is full' };

  const normalizedName = playerName.trim();
  if (!normalizedName) return { error: 'Player name is required' };
  if (session.players.some(player => player.name.toLowerCase() === normalizedName.toLowerCase())) {
    return { error: 'That player name is already taken in this Smoke Circle' };
  }

  const player = createPlayer(normalizedName, false, playerId);
  const updated = saveSession({ ...session, players: [...session.players, player] });
  return { session: updated, player };
}

export function setGame(code: string, game: GameState): Session | undefined {
  const session = getSession(code);
  if (!session) return undefined;
  return saveSession({ ...session, game });
}

export function markDisconnected(playerId: string): Session | undefined {
  for (const session of sessions.values()) {
    if (!session.players.some(player => player.id === playerId)) continue;
    const players = session.players.map(player =>
      player.id === playerId ? { ...player, connected: false } : player
    );
    return saveSession({ ...session, players });
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
