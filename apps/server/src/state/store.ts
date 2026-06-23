import type { GameSettings, GameState, Player } from '@thc-u-know/shared';
import type { Session } from './types.js';

export type JoinResult = { session?: Session; player?: Player; error?: string };
export type SessionResult = { session?: Session; error?: string };

export interface SessionStore {
  createSession(playerName: string, settings?: Partial<GameSettings>): Promise<Session>;
  getSession(code: string): Promise<Session | undefined>;
  saveSession(session: Session): Promise<Session>;
  joinSession(code: string, playerName: string, playerId?: string): Promise<JoinResult>;
  rejoinSession(code: string, playerId: string): Promise<JoinResult>;
  setGame(code: string, game: GameState): Promise<Session | undefined>;
  kickPlayer(code: string, hostId: string, targetPlayerId: string): Promise<SessionResult>;
  markDisconnected(playerId: string): Promise<Session | undefined>;
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
