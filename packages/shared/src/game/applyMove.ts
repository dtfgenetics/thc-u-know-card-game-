import type { Card, GameState, MoveResult, PlayCardInput } from '../types.js';
import { advanceTurn, reverseDirection } from './turn.js';
import { canPlayCard, findPlayerHand, normalizeChosenColor } from './validateMove.js';

function removeCardFromHand(hand: Card[], cardId: string): { card?: Card; cards: Card[] } {
  const index = hand.findIndex(card => card.id === cardId);
  if (index < 0) return { cards: hand };
  const card = hand[index];
  return { card, cards: hand.filter(item => item.id !== cardId) };
}

function updateHand(state: GameState, playerId: string, cards: Card[]): GameState {
  return {
    ...state,
    hands: state.hands.map(hand => (hand.playerId === playerId ? { ...hand, cards } : hand))
  };
}

function applyAction(state: GameState, card: Card, input: PlayCardInput): GameState {
  let nextState = state;
  const chosenColor = normalizeChosenColor(input.chosenColor);

  if (card.color === 'black') {
    nextState = { ...nextState, activeColor: chosenColor ?? 'purple' };
  } else {
    nextState = { ...nextState, activeColor: card.color };
  }

  switch (card.kind) {
    case 'couch-lock':
    case 'paranoia':
      return advanceTurn(nextState, 2);
    case 'puff-puff-pass-back':
    case 'rotation':
      nextState = reverseDirection(nextState);
      return advanceTurn(nextState, nextState.players.length === 2 ? 2 : 1);
    case 'pack-two':
    case 'munchies':
      return { ...advanceTurn(nextState), pendingDraw: nextState.pendingDraw + 2 };
    case 'hotbox-plus-four':
      return { ...advanceTurn(nextState), pendingDraw: nextState.pendingDraw + 4 };
    case 'strain-switch':
      return advanceTurn(nextState);
    case 'tolerance-break':
      return advanceTurn(nextState);
    case 'bogart':
      return advanceTurn(nextState);
    case 'pass-the-tray':
      return advanceTurn(nextState);
    case 'smoke-sesh':
      return advanceTurn(nextState);
    case 'greener-side':
      return advanceTurn(nextState);
    default:
      return advanceTurn(nextState);
  }
}

export function playCard(state: GameState, input: PlayCardInput): MoveResult {
  const hand = findPlayerHand(state, input.playerId);
  if (!hand) return { ok: false, reason: 'Player hand not found', state };

  const { card, cards } = removeCardFromHand(hand.cards, input.cardId);
  if (!card) return { ok: false, reason: 'Card not found in hand', state };

  const valid = canPlayCard(state, input.playerId, card);
  if (!valid.ok) return { ok: false, reason: valid.reason, state };

  if (card.color === 'black' && !normalizeChosenColor(input.chosenColor)) {
    return { ok: false, reason: 'Wild cards require a chosen strain color', state };
  }

  let nextState = updateHand(state, input.playerId, cards);
  nextState = {
    ...nextState,
    discardPile: [...nextState.discardPile, card],
    players: nextState.players.map(player =>
      player.id === input.playerId ? { ...player, calledThcUKnow: false } : player
    ),
    updatedAt: Date.now()
  };

  if (cards.length === 0) {
    return { ok: true, state: { ...nextState, winnerId: input.playerId, updatedAt: Date.now() } };
  }

  nextState = applyAction(nextState, card, input);
  return { ok: true, state: nextState };
}
