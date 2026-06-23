import type { Card, GameState, MoveResult } from '../types.js';
import { shuffle } from './shuffle.js';
import { advanceTurn } from './turn.js';

function recycleDiscardPile(state: GameState): GameState {
  if (state.drawPile.length > 0) return state;
  if (state.discardPile.length <= 1) return state;

  const top = state.discardPile[state.discardPile.length - 1] as Card;
  const recycle = state.discardPile.slice(0, -1);

  return {
    ...state,
    drawPile: shuffle(recycle),
    discardPile: [top]
  };
}

export function drawCards(state: GameState, playerId: string, count = 1, endTurn = true): MoveResult {
  if (state.currentPlayerId !== playerId) {
    return { ok: false, reason: 'It is not your turn', state };
  }

  let nextState = recycleDiscardPile(state);
  const hand = nextState.hands.find(entry => entry.playerId === playerId);
  if (!hand) return { ok: false, reason: 'Player hand not found', state };

  const drawn: Card[] = [];
  for (let index = 0; index < count; index += 1) {
    nextState = recycleDiscardPile(nextState);
    const card = nextState.drawPile.pop();
    if (!card) break;
    drawn.push(card);
  }

  hand.cards.push(...drawn);
  nextState = {
    ...nextState,
    hands: nextState.hands.map(entry => (entry.playerId === playerId ? hand : entry)),
    pendingDraw: 0,
    updatedAt: Date.now()
  };

  if (endTurn) nextState = advanceTurn(nextState);
  return { ok: true, state: nextState };
}
