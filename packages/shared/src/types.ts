export type CardColor = 'purple' | 'green' | 'gold' | 'blue' | 'black';

export type CardKind =
  | 'number'
  | 'couch-lock'
  | 'puff-puff-pass-back'
  | 'pack-two'
  | 'strain-switch'
  | 'hotbox-plus-four'
  | 'munchies'
  | 'paranoia'
  | 'rotation'
  | 'tolerance-break'
  | 'bogart'
  | 'pass-the-tray'
  | 'smoke-sesh'
  | 'greener-side';

export type GameMode = 'classic' | 'party' | 'fast-sesh' | 'no-mercy';

export type Card = {
  id: string;
  color: CardColor;
  kind: CardKind;
  label: string;
  value?: number;
  points: number;
};

export type Player = {
  id: string;
  name: string;
  avatar?: string;
  connected: boolean;
  host: boolean;
  calledThcUKnow: boolean;
};

export type PlayerHand = {
  playerId: string;
  cards: Card[];
};

export type TurnDirection = 1 | -1;

export type GameSettings = {
  mode: GameMode;
  maxPlayers: number;
  startingHandSize: number;
  stacking: boolean;
  jumpIn: boolean;
  targetScore: number;
  thcUKnowPenaltyCards: number;
};

export type GameActionLog = {
  id: string;
  playerId: string;
  message: string;
  createdAt: number;
};

export type ScoreLedger = Record<string, number>;

export type LastRoundScore = {
  winnerId: string;
  pointsAwarded: number;
  remainingCardPoints: Record<string, number>;
};

export type GameState = {
  sessionCode: string;
  settings: GameSettings;
  players: Player[];
  hands: PlayerHand[];
  drawPile: Card[];
  discardPile: Card[];
  currentPlayerId: string;
  direction: TurnDirection;
  activeColor: CardColor;
  pendingDraw: number;
  actionLog: GameActionLog[];
  scores: ScoreLedger;
  roundNumber: number;
  lastRoundScore?: LastRoundScore;
  winnerId?: string;
  matchWinnerId?: string;
  drawRound?: boolean;
  started: boolean;
  createdAt: number;
  updatedAt: number;
};

export type PublicPlayerState = Player & {
  cardCount: number;
  score: number;
};

export type PublicGameState = Omit<GameState, 'hands' | 'drawPile' | 'players'> & {
  players: PublicPlayerState[];
  drawPileCount: number;
  topDiscard: Card;
};

export type PrivatePlayerState = {
  playerId: string;
  hand: Card[];
};

export type PlayCardInput = {
  playerId: string;
  cardId: string;
  chosenColor?: CardColor;
  targetPlayerId?: string;
};

export type MoveResult = {
  ok: boolean;
  reason?: string;
  state: GameState;
};
