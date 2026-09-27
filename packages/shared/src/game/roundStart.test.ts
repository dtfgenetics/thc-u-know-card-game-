import { describe, expect, it } from 'vitest';
import type { Player } from '../types.js';
import { canStartRound } from './roundStart.js';

function player(id: string, connected = true, host = false): Player {
  return { id, name: id, connected, host, calledThcUKnow: false };
}

describe('canStartRound', () => {
  it('allows the connected host to start with two connected players', () => {
    expect(canStartRound([player('host', true, true), player('guest')], 'host', 'host')).toEqual({ ok: true });
  });

  it('rejects a non-host requester', () => {
    expect(canStartRound([player('host', true, true), player('guest')], 'host', 'guest')).toEqual({
      ok: false,
      reason: 'Only the host can start the round'
    });
  });

  it('requires at least two seated players', () => {
    expect(canStartRound([player('host', true, true)], 'host', 'host')).toEqual({
      ok: false,
      reason: 'At least 2 players are required'
    });
  });

  it('rejects starting while any seated player is disconnected', () => {
    expect(canStartRound([player('host', true, true), player('guest', false)], 'host', 'host')).toEqual({
      ok: false,
      reason: 'All seated players must be connected before starting the round'
    });
  });
});
