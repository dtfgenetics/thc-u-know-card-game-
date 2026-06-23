import type { Card, GameMode, GameSettings, GameState, Player, PlayerHand, ScoreLedger } from '../types.js';
import { classicColors } from './cardNames.js';
import { createDeck } from './createDeck.js';
import { normalizeScores } from './scoring.js';

export const defaultSettings: GameSettings = {
  mode: 'classic',
  maxPlayers: 8,
  startingHandSize: 7,
  stacking: false,
  jumpIn: false,
  targetScore: 500,
  thcUKnowPenaltyCards: 2
};

function drawOpeningDiscard(drawPile: Card[]): Card {
  let top = drawPile.pop();
  while (top && top.color === 'black') {
    drawPile.unshift(top);
    top = drawPile.pop();
  }
  if (!top) throw new Error('Deck is empty');
  return top;
}

export function createGameState(input: {
  sessionCode: string;
  players: Player[];
  settings?: Partial<GameSettings>;
  scores?: ScoreLedger;
  roundNumber?: number;
  random?: () => number;
}): GameState {
  const settings: GameSettings = { ...defaultSettings, ...input.settings };
  if (input.players.length < 2) throw new Error('At least 2 players are required');
  if (input.players.length > settings.maxPlayers) throw new Error(`Max players is ${settings.maxPlayers}`);

  const drawPile = createDeck(settings.mode as GameMode, input.random);
  const hands: PlayerHand[] = input.players.map(player => ({ playerId: player.id, cards: [] }));

  for (let round = 0; round < settings.startingHandSize; round += 1) {
    for (const hand of hands) {
      const card = drawPile.pop();
      if (!card) throw new Error('Deck ran out while dealing');
      hand.cards.push(card);
    }
  }

  const topDiscard = drawOpeningDiscard(drawPile);
  const now = Date.now();

  return {
    sessionCode: input.sessionCode,
    settings,
    players: input.players,
    hands,
    drawPile,
    discardPile: [topDiscard],
    currentPlayerId: input.players[0]?.id ?? '',
    direction: 1,
    activeColor: classicColors.includes(topDiscard.color) ? topDiscard.color : 'purple',
    pendingDraw: 0,
    actionLog: [
      {
        id: `log-${now}`,
        playerId: 'system',
        message: `Round ${input.roundNumber ?? 1} started. First Ashtray card is ${topDiscard.label}.`,
        createdAt: now
      }
    ],
    scores: normalizeScores(input.players, input.scores),
    roundNumber: input.roundNumber ?? 1,
    started: true,
    createdAt: now,
    updatedAt: now
  };
}
