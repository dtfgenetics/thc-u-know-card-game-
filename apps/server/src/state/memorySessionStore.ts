import type { GameSettings, GameState } from '@thc-u-know/shared';
import {
  createSession,
  getSession,
  joinSession,
  kickPlayer,
  markDisconnected,
  rejoinSession,
  saveSession,
  setGame
} from './memoryStore.js';
import type { JoinResult, SessionResult, SessionStore } from './store.js';
import type { Session } from './types.js';

export class MemorySessionStore implements SessionStore {
  async createSession(playerName: string, settings?: Partial<GameSettings>): Promise<Session> {
    return createSession(playerName, settings);
  }

  async getSession(code: string): Promise<Session | undefined> {
    return getSession(code);
  }

  async saveSession(session: Session): Promise<Session> {
    return saveSession(session);
  }

  async joinSession(code: string, playerName: string, playerId?: string): Promise<JoinResult> {
    return joinSession(code, playerName, playerId);
  }

  async rejoinSession(code: string, playerId: string): Promise<JoinResult> {
    return rejoinSession(code, playerId);
  }

  async setGame(code: string, game: GameState): Promise<Session | undefined> {
    return setGame(code, game);
  }

  async kickPlayer(code: string, hostId: string, targetPlayerId: string): Promise<SessionResult> {
    return kickPlayer(code, hostId, targetPlayerId);
  }

  async markDisconnected(playerId: string): Promise<Session | undefined> {
    return markDisconnected(playerId);
  }
}
