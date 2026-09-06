import type { Card, CardColor, GameState, PublicGameState } from '../types.js';

const drawStackCards = new Set(['pack-two', 'munchies', 'hotbox-plus-four']);
const drawPressureEscapeCards = new Set(['tolerance-break']);

type PlayabilityContext = {
  winnerId?: string;
  currentPlayerId: string;
  pendingDraw: number;
  stacking: boolean;
  activeColor: CardColor;
  topDiscard: Card;
};

export function getTopDiscard(state: GameState): Card {
  const top = state.discardPile[state.discardPile.length - 1];
  if (!top) throw new Error('Discard pile is empty');
  return top;
}

export function findPlayerHand(state: GameState, playerId: string) {
  return state.hands.find(hand => hand.playerId === playerId);
}

function evaluateCardPlayability(
  context: PlayabilityContext,
  playerId: string,
  card: Card
): { ok: true } | { ok: false; reason: string } {
  if (context.winnerId) return { ok: false, reason: 'The game is already over' };
  if (context.currentPlayerId !== playerId) return { ok: false, reason: 'It is not your turn' };

  if (context.pendingDraw > 0) {
    if (drawPressureEscapeCards.has(card.kind)) return { ok: true };
    if (!context.stacking) {
      return { ok: false, reason: `You must draw ${context.pendingDraw} before your turn can continue` };
    }
    if (!drawStackCards.has(card.kind)) {
      return { ok: false, reason: 'Only draw cards or Tolerance Break can answer pending draw pressure' };
    }
  }

  const top = context.topDiscard;
  if (card.color === 'black') return { ok: true };
  if (card.color === context.activeColor) return { ok: true };
  if (card.kind === 'number' && top.kind === 'number' && card.value === top.value) return { ok: true };
  if (card.kind !== 'number' && card.kind === top.kind) return { ok: true };

  return { ok: false, reason: 'Card must match active color, number, action, or be a wild card' };
}

export function canPlayCard(state: GameState, playerId: string, card: Card): { ok: true } | { ok: false; reason: string } {
  return evaluateCardPlayability(
    {
      winnerId: state.winnerId,
      currentPlayerId: state.currentPlayerId,
      pendingDraw: state.pendingDraw,
      stacking: state.settings.stacking,
      activeColor: state.activeColor,
      topDiscard: getTopDiscard(state)
    },
    playerId,
    card
  );
}

export function canPlayCardFromPublicState(
  state: PublicGameState,
  playerId: string,
  card: Card
): { ok: true } | { ok: false; reason: string } {
  return evaluateCardPlayability(
    {
      winnerId: state.winnerId,
      currentPlayerId: state.currentPlayerId,
      pendingDraw: state.pendingDraw,
      stacking: state.settings.stacking,
      activeColor: state.activeColor,
      topDiscard: state.topDiscard
    },
    playerId,
    card
  );
}

export function normalizeChosenColor(color?: CardColor): CardColor | undefined {
  if (!color) return undefined;
  if (color === 'black') return undefined;
  return color;
}
