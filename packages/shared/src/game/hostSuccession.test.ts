import { describe, expect, it } from 'vitest';
import type { Player } from '../types.js';
import { ensureConnectedHost } from './hostSuccession.js';

function player(id: string, connected = true, host = false): Player {
  return { id, name: id, connected, host, calledThcUKnow: false };
}

describe('ensureConnectedHost', () => {
  it('keeps a connected host unchanged', () => {
    const players = [player('a', true, true), player('b')];
    expect(ensureConnectedHost(players, 'a')).toEqual({ hostId: 'a', players });
  });

  it('transfers host to the first connected player when the host disconnects', () => {
    const result = ensureConnectedHost(
      [player('a', false, true), player('b', true), player('c', true)],
      'a'
    );

    expect(result.hostId).toBe('b');
    expect(result.players.find(item => item.id === 'a')?.host).toBe(false);
    expect(result.players.find(item => item.id === 'b')?.host).toBe(true);
  });

  it('skips disconnected candidates during succession', () => {
    const result = ensureConnectedHost(
      [player('a', false, true), player('b', false), player('c', true)],
      'a'
    );

    expect(result.hostId).toBe('c');
  });

  it('keeps the existing host assignment when nobody is connected', () => {
    const players = [player('a', false, true), player('b', false)];
    expect(ensureConnectedHost(players, 'a')).toEqual({ hostId: 'a', players });
  });
});
