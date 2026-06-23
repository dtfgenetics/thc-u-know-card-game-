import { randomUUID } from 'node:crypto';
import { defaultSettings } from '@thc-u-know/shared';
import type { GameSettings, GameState, Player } from '@thc-u-know/shared';
import Redis from 'ioredis';
import { env } from '../config/env.js';
import { createSessionCode, normalizeSessionCode } from './sessionCode.js';
import type { JoinResult, SessionResult, SessionStore } from './store.js';
import type { Session } from './types.js';

const sessionPrefix = 'thc-u-know:session:';
const indexKey = 'thc-u-know:sessions:index';

function sessionKey(code: string): string {
  return `${sessionPrefix}${normalizeSessionCode(code)}`;
}

function createPlayer(name: string, host = false, playerId = randomUUID()): Player {
  return {
    id: playerId,
    name: name.trim(),
    connected: true,
    host,
    calledThcUKnow: false
  };
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

export class RedisSessionStore implements SessionStore {
  constructor(private readonly redis: Redis, private readonly ttlSeconds = env.SESSION_TTL_SECONDS) {}

  static fromEnv(): RedisSessionStore {
    const redisUrl = env.REDIS_URL;
    if (!redisUrl) throw new Error('REDIS_URL is required for RedisSessionStore');
    return new RedisSessionStore(new Redis(redisUrl), env.SESSION_TTL_SECONDS);
  }

  async createSession(playerName: string, settings?: Partial<GameSettings>): Promise<Session> {
    let code = createSessionCode();
    while (await this.getSession(code)) code = createSessionCode();

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

    return this.saveSession(session);
  }

  async getSession(code: string): Promise<Session | undefined> {
    const raw = await this.redis.get(sessionKey(code));
    return raw ? (JSON.parse(raw) as Session) : undefined;
  }

  async saveSession(session: Session): Promise<Session> {
    const updated = { ...session, updatedAt: Date.now() };
    await this.redis
      .multi()
      .set(sessionKey(updated.code), JSON.stringify(updated), 'EX', this.ttlSeconds)
      .sadd(indexKey, updated.code)
      .exec();
    return updated;
  }

  async joinSession(code: string, playerName: string, playerId?: string): Promise<JoinResult> {
    const session = await this.getSession(code);
    if (!session) return { error: 'Smoke Circle not found' };

    const normalizedName = playerName.trim();
    if (!normalizedName) return { error: 'Player name is required' };

    const existingById = playerId ? session.players.find(player => player.id === playerId) : undefined;
    if (existingById) {
      const players = session.players.map(player =>
        player.id === playerId ? { ...player, connected: true, name: normalizedName || player.name } : player
      );
      const updated = await this.saveSession(syncGamePlayers(session, players));
      return { session: updated, player: players.find(player => player.id === playerId) };
    }

    if (session.game?.started) return { error: 'This game has already started' };
    if (session.players.length >= session.settings.maxPlayers) return { error: 'Smoke Circle is full' };
    if (session.players.some(player => player.name.toLowerCase() === normalizedName.toLowerCase())) {
      return { error: 'That player name is already taken in this Smoke Circle' };
    }

    const player = createPlayer(normalizedName, false, playerId);
    const updated = await this.saveSession({ ...session, players: [...session.players, player] });
    return { session: updated, player };
  }

  async rejoinSession(code: string, playerId: string): Promise<JoinResult> {
    const session = await this.getSession(code);
    if (!session) return { error: 'Smoke Circle not found' };
    const player = session.players.find(item => item.id === playerId);
    if (!player) return { error: 'Player is not part of this Smoke Circle' };
    const players = session.players.map(item => (item.id === playerId ? { ...item, connected: true } : item));
    const updated = await this.saveSession(syncGamePlayers(session, players));
    return { session: updated, player: players.find(item => item.id === playerId) };
  }

  async setGame(code: string, game: GameState): Promise<Session | undefined> {
    const session = await this.getSession(code);
    if (!session) return undefined;
    return this.saveSession({ ...session, game });
  }

  async kickPlayer(code: string, hostId: string, targetPlayerId: string): Promise<SessionResult> {
    const session = await this.getSession(code);
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

    return { session: await this.saveSession(transferHostIfNeeded({ ...session, players, game })) };
  }

  async markDisconnected(playerId: string): Promise<Session | undefined> {
    const codes = await this.redis.smembers(indexKey);
    for (const code of codes) {
      const session = await this.getSession(code);
      if (!session || !session.players.some(player => player.id === playerId)) continue;
      const players = session.players.map(player =>
        player.id === playerId ? { ...player, connected: false } : player
      );
      return this.saveSession(syncGamePlayers(session, players));
    }
    return undefined;
  }
}
