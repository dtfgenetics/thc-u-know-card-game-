import type { Card, GameState, MoveResult, PlayCardInput } from '../types.js';
import { manifestEntry } from './cardManifest.js';
import { drawCards } from './draw.js';
import { applyRoundScore } from './scoring.js';
import { advanceTurn, nextPlayerId, reverseDirection } from './turn.js';
import { canPlayCard, findPlayerHand, normalizeChosenColor } from './validateMove.js';

function logAction(state: GameState, playerId: string, message: string): GameState {
  const now = Date.now();
  return {
    ...state,
    actionLog: [
      ...state.actionLog.slice(-24),
      {
        id: `log-${now}-${Math.random().toString(36).slice(2, 7)}`,
        playerId,
        message,
        createdAt: now
      }
    ],
    updatedAt: now
  };
}

function playerName(state: GameState, playerId: string): string {
  return state.players.find(player => player.id === playerId)?.name ?? 'A player';
}

function requiresChosenColor(card: Card): boolean {
  return card.kind !== 'number' && manifestEntry(card.kind).needsChosenColor;
}

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

function drawForPlayer(state: GameState, playerId: string, count: number): GameState {
  let nextState = state;
  const originalCurrent = nextState.currentPlayerId;
  nextState = { ...nextState, currentPlayerId: playerId };
  const result = drawCards(nextState, playerId, count, false);
  return result.ok ? { ...result.state, currentPlayerId: originalCurrent, pendingDraw: state.pendingDraw } : state;
}

function swapHands(state: GameState, playerA: string, playerB: string): GameState {
  const handA = state.hands.find(hand => hand.playerId === playerA);
  const handB = state.hands.find(hand => hand.playerId === playerB);
  if (!handA || !handB) return state;
  return {
    ...state,
    hands: state.hands.map(hand => {
      if (hand.playerId === playerA) return { ...hand, cards: handB.cards };
      if (hand.playerId === playerB) return { ...hand, cards: handA.cards };
      return hand;
    })
  };
}

function passTheTray(state: GameState): GameState {
  const handsByPlayer = new Map(state.hands.map(hand => [hand.playerId, hand.cards]));
  const orderedPlayers = state.players.map(player => player.id);
  const passed = new Map<string, Card>();

  for (const playerId of orderedPlayers) {
    const hand = handsByPlayer.get(playerId) ?? [];
    const card = hand[0];
    if (card) passed.set(playerId, card);
  }

  if (passed.size < 2) return state;

  return {
    ...state,
    hands: state.hands.map(hand => {
      const playerIndex = orderedPlayers.indexOf(hand.playerId);
      const fromPlayer = orderedPlayers[(playerIndex - state.direction + orderedPlayers.length) % orderedPlayers.length];
      const outgoing = passed.get(hand.playerId);
      const incoming = fromPlayer ? passed.get(fromPlayer) : undefined;
      let cards = outgoing ? hand.cards.filter(card => card.id !== outgoing.id) : [...hand.cards];
      if (incoming) cards = [...cards, incoming];
      return { ...hand, cards };
    })
  };
}

function applyAction(state: GameState, card: Card, input: PlayCardInput): GameState {
  let nextState = state;
  const chosenColor = normalizeChosenColor(input.chosenColor);
  const actor = playerName(nextState, input.playerId);

  if (card.color === 'black') {
    nextState = { ...nextState, activeColor: requiresChosenColor(card) ? chosenColor ?? 'purple' : nextState.activeColor };
  } else {
    nextState = { ...nextState, activeColor: card.color };
  }

  switch (card.kind) {
    case 'couch-lock':
    case 'paranoia':
      return logAction(advanceTurn(nextState, 2), input.playerId, `${actor} played ${card.label}. Next player got skipped.`);
    case 'puff-puff-pass-back':
    case 'rotation':
      nextState = reverseDirection(nextState);
      return logAction(advanceTurn(nextState, nextState.players.length === 2 ? 2 : 1), input.playerId, `${actor} reversed the rotation.`);
    case 'pack-two':
    case 'munchies':
      return logAction({ ...advanceTurn(nextState), pendingDraw: nextState.pendingDraw + 2 }, input.playerId, `${actor} played ${card.label}. Next player must draw 2.`);
    case 'hotbox-plus-four':
      return logAction({ ...advanceTurn(nextState), pendingDraw: nextState.pendingDraw + 4 }, input.playerId, `${actor} called Hotbox +4 and chose ${nextState.activeColor}.`);
    case 'strain-switch':
      return logAction(advanceTurn(nextState), input.playerId, `${actor} switched the active strain to ${nextState.activeColor}.`);
    case 'tolerance-break':
      return logAction(advanceTurn({ ...nextState, pendingDraw: 0 }), input.playerId, `${actor} took a Tolerance Break and cleared pending draw pressure.`);
    case 'bogart': {
      const targetId = input.targetPlayerId && nextState.players.some(player => player.id === input.targetPlayerId)
        ? input.targetPlayerId
        : nextPlayerId(nextState);
      nextState = drawForPlayer(nextState, targetId, 1);
      return logAction(advanceTurn(nextState), input.playerId, `${actor} used Bogart. ${playerName(nextState, targetId)} drew 1.`);
    }
    case 'pass-the-tray':
      return logAction(advanceTurn(passTheTray(nextState)), input.playerId, `${actor} passed the tray. Everyone passed one card.`);
    case 'smoke-sesh': {
      for (const player of nextState.players) {
        if (player.id !== input.playerId) nextState = drawForPlayer(nextState, player.id, 1);
      }
      return logAction(advanceTurn(nextState), input.playerId, `${actor} started a Smoke Sesh. Everyone else drew 1.`);
    }
    case 'greener-side': {
      const targetId = input.targetPlayerId && nextState.players.some(player => player.id === input.targetPlayerId)
        ? input.targetPlayerId
        : nextPlayerId(nextState);
      nextState = swapHands(nextState, input.playerId, targetId);
      return logAction(advanceTurn(nextState), input.playerId, `${actor} used Greener Side and swapped hands with ${playerName(nextState, targetId)}.`);
    }
    default:
      return logAction(advanceTurn(nextState), input.playerId, `${actor} played ${card.label}.`);
  }
}

export function playCard(state: GameState, input: PlayCardInput): MoveResult {
  const hand = findPlayerHand(state, input.playerId);
  if (!hand) return { ok: false, reason: 'Player hand not found', state };

  const { card, cards } = removeCardFromHand(hand.cards, input.cardId);
  if (!card) return { ok: false, reason: 'Card not found in hand', state };

  const valid = canPlayCard(state, input.playerId, card);
  if (!valid.ok) return { ok: false, reason: valid.reason, state };

  if (requiresChosenColor(card) && !normalizeChosenColor(input.chosenColor)) {
    return { ok: false, reason: 'Color-changing wild cards require a chosen strain color', state };
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
    const scoredState = applyRoundScore(nextState, input.playerId);
    const points = scoredState.lastRoundScore?.pointsAwarded ?? 0;
    const matchText = scoredState.matchWinnerId ? ` Match target reached at ${scoredState.scores[input.playerId]} points.` : '';
    return {
      ok: true,
      state: logAction(scoredState, input.playerId, `${playerName(scoredState, input.playerId)} went out, scored ${points} points, and won the round.${matchText}`)
    };
  }

  nextState = applyAction(nextState, card, input);
  return { ok: true, state: nextState };
}
