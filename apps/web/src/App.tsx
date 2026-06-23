import { useEffect, useMemo, useState } from 'react';
import type { Player, PrivatePlayerState, PublicGameState } from '@thc-u-know/shared';
import { Events } from '@thc-u-know/shared';
import { GameTable } from './components/GameTable';
import { InvitePanel } from './components/InvitePanel';
import { socket } from './realtime/socket';

type PublicSession = {
  code: string;
  hostId: string;
  players: Player[];
  started: boolean;
};

export function App() {
  const joinCode = useMemo(() => new URLSearchParams(window.location.search).get('join') ?? '', []);
  const [name, setName] = useState('');
  const [code, setCode] = useState(joinCode);
  const [player, setPlayer] = useState<Player | null>(null);
  const [session, setSession] = useState<PublicSession | null>(null);
  const [publicState, setPublicState] = useState<PublicGameState | null>(null);
  const [privateState, setPrivateState] = useState<PrivatePlayerState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    socket.on(Events.SESSION_CREATED, payload => {
      setPlayer(payload.player);
      setSession(payload.session);
      setError(null);
    });
    socket.on(Events.SESSION_JOINED, payload => {
      setPlayer(payload.player);
      setSession(payload.session);
      setError(null);
    });
    socket.on(Events.SESSION_UPDATE, setSession);
    socket.on(Events.GAME_STARTED, setSession);
    socket.on(Events.GAME_PUBLIC_STATE, setPublicState);
    socket.on(Events.GAME_PRIVATE_STATE, setPrivateState);
    socket.on(Events.ERROR, payload => setError(payload.message ?? 'Something went wrong'));
    socket.on(Events.GAME_OVER, payload => setError(`Winner: ${payload.winnerId}`));

    return () => {
      socket.off(Events.SESSION_CREATED);
      socket.off(Events.SESSION_JOINED);
      socket.off(Events.SESSION_UPDATE);
      socket.off(Events.GAME_STARTED);
      socket.off(Events.GAME_PUBLIC_STATE);
      socket.off(Events.GAME_PRIVATE_STATE);
      socket.off(Events.ERROR);
      socket.off(Events.GAME_OVER);
    };
  }, []);

  function hostGame() {
    socket.emit(Events.SESSION_CREATE, { playerName: name });
  }

  function joinGame() {
    socket.emit(Events.SESSION_JOIN, { code, playerName: name });
  }

  function startGame() {
    if (!session || !player) return;
    socket.emit(Events.GAME_START, { code: session.code, playerId: player.id });
  }

  if (player && session && publicState && privateState) {
    return <GameTable playerId={player.id} publicState={publicState} privateState={privateState} />;
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Online multiplayer parody card game</p>
        <h1>THC U Know</h1>
        <p>Host a Smoke Circle, invite friends, and play original UNNO-style cannabis parody rules.</p>
      </header>

      {error && <div className="error-box">{error}</div>}

      {!session && (
        <section className="panel start-panel">
          <label>
            Player name
            <input value={name} onChange={event => setName(event.target.value)} placeholder="Enter your name" />
          </label>
          <div className="button-row">
            <button type="button" disabled={!name.trim()} onClick={hostGame}>Host Smoke Circle</button>
          </div>
          <label>
            Session code
            <input value={code} onChange={event => setCode(event.target.value.toUpperCase())} placeholder="ABC123" />
          </label>
          <button type="button" disabled={!name.trim() || !code.trim()} onClick={joinGame}>Join Smoke Circle</button>
        </section>
      )}

      {session && player && (
        <section className="lobby-grid">
          <InvitePanel code={session.code} />
          <section className="panel">
            <h2>Smoke Circle</h2>
            <ul className="player-list">
              {session.players.map(item => (
                <li key={item.id}>{item.host ? '👑 ' : ''}{item.name}{item.connected ? '' : ' · disconnected'}</li>
              ))}
            </ul>
            <button type="button" disabled={session.players.length < 2 || session.hostId !== player.id} onClick={startGame}>
              Start Game
            </button>
            {session.players.length < 2 && <p>Waiting for at least one more player.</p>}
          </section>
        </section>
      )}
    </div>
  );
}
