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
  winnerId?: string;
  started: boolean;
  createdAt: number;
  updatedAt: number;
};

export type PublicPlayerState = Player & {
  cardCount: number;
};

export type PublicGameState = Omit<GameState, 'hands' | 'drawPile'> & {
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
