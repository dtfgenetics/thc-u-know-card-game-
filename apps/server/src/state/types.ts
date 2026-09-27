import type { GameSettings, GameState, Player } from '@thc-u-know/shared';

export type Session = {
  code: string;
  hostId: string;
  players: Player[];
  resumeTokens: Record<string, string>;
  game?: GameState;
  settings: GameSettings;
  createdAt: number;
  updatedAt: number;
};

export type CreateSessionInput = {
  playerName: string;
  settings?: Partial<GameSettings>;
};

export type JoinSessionInput = {
  code: string;
  playerName: string;
  playerId?: string;
  resumeToken?: string;
};
