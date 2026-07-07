import { describe, expect, it } from 'vitest';
import type { Card, GameState, Player } from '../types.js';
import { playCard } from './applyMove.js';
import { createGameState } from './createGame.js';

const players: Player[] = [
  { id: 'p1', name: 'Grower One', connected: true, host: true, calledThcUKnow: false },
  { id: 'p2', name: 'Grower Two', connected: true, host: false, calledThcUKnow: false }
];

const purpleOne: Card = { id: 'purple-one', color: 'purple', kind: 'number', label: 'Seed', value: 1, points: 1 };
const greenFive: Card = { id: 'green-five', color: 'green', kind: 'number', label: 'Flower', value: 5, points: 5 };
const mysteryNug: Card = { id: 'mystery-nug', color: 'black', kind: 'mystery-nug', label: 'Mystery Nug', points: 50 };
const greenout: Card = { id: 'greenout', color: 'black', kind: 'hotbox-plus-four', label: 'Greenout', points: 50 };

function stateWith(hands: GameState['hands'], drawPile: Card[]): GameState {
  const state = createGameState({ sessionCode: 'SPECIAL', players, random: () => 0.5 });
  return {
    ...state,
    currentPlayerId: 'p1',
    activeColor: 'purple',
    discardPile: [purpleOne],
    hands,
    drawPile
  };
}

describe('approved classic wild effects', () => {
  it('reveals and plays the next Stash card after Mystery Nug', () => {
    const state = stateWith([
      { playerId: 'p1', cards: [mysteryNug, purpleOne] },
      { playerId: 'p2', cards: [purpleOne] }
    ], [greenFive]);

    const result = playCard(state, { playerId: 'p1', cardId: mysteryNug.id });

    expect(result.ok).toBe(true);
    expect(result.state.drawPile).toHaveLength(0);
    expect(result.state.discardPile.at(-1)).toEqual(greenFive);
    expect(result.state.activeColor).toBe('green');
    expect(result.state.currentPlayerId).toBe('p2');
  });

  it('resolves a final Greenout before scoring the round', () => {
    const stash = [1, 2, 3, 4].map(value => ({
      id: `stash-${value}`,
      color: 'blue' as const,
      kind: 'number' as const,
      label: `Stash ${value}`,
      value,
      points: value
    }));
    const state = stateWith([
      { playerId: 'p1', cards: [greenout] },
      { playerId: 'p2', cards: [purpleOne] }
    ], stash);

    const result = playCard(state, { playerId: 'p1', cardId: greenout.id, chosenColor: 'green' });

    expect(result.ok).toBe(true);
    expect(result.state.winnerId).toBe('p1');
    expect(result.state.hands.find(hand => hand.playerId === 'p2')?.cards).toHaveLength(5);
    expect(result.state.lastRoundScore?.pointsAwarded).toBe(11);
  });

  it('reveals the next Stash card when Mystery Nug wins the round', () => {
    const state = stateWith([
      { playerId: 'p1', cards: [mysteryNug] },
      { playerId: 'p2', cards: [purpleOne] }
    ], [greenFive]);

    const result = playCard(state, { playerId: 'p1', cardId: mysteryNug.id });

    expect(result.ok).toBe(true);
    expect(result.state.winnerId).toBe('p1');
    expect(result.state.discardPile.at(-1)).toEqual(greenFive);
    expect(result.state.activeColor).toBe('green');
  });
});
