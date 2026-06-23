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

function playerName(state: GameState, playerId: string): string {
  return state.players.find(player => player.id === playerId)?.name ?? 'A player';
}

function logDraw(state: GameState, playerId: string, count: number): GameState {
  const now = Date.now();
  return {
    ...state,
    actionLog: [
      ...state.actionLog.slice(-24),
      {
        id: `log-${now}-${Math.random().toString(36).slice(2, 7)}`,
        playerId,
        message: `${playerName(state, playerId)} drew ${count} card${count === 1 ? '' : 's'} from the Stash.`,
        createdAt: now
      }
    ]
  };
}

export function drawCards(state: GameState, playerId: string, count = 1, endTurn = true): MoveResult {
  if (state.winnerId) return { ok: false, reason: 'The game is already over', state };
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

  nextState = logDraw(nextState, playerId, drawn.length);
  if (endTurn) nextState = advanceTurn(nextState);
  return { ok: true, state: nextState };
}
