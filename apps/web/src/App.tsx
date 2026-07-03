import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { GameMode, Player, PrivatePlayerState, PublicGameState } from '@thc-u-know/shared';
import { Events } from '@thc-u-know/shared';
import { GameTable } from './components/GameTable';
import { InvitePanel } from './components/InvitePanel';
import { socket } from './realtime/socket';

type PublicSession = {
  code: string;
  hostId: string;
  players: Player[];
  started: boolean;
  settings?: {
    mode: GameMode;
    maxPlayers: number;
    startingHandSize: number;
    stacking: boolean;
    jumpIn: boolean;
    targetScore: number;
    thcUKnowPenaltyCards: number;
  };
};

type SocketErrorPayload = {
  message?: string;
};

type GameOverPayload = {
  winnerId: string;
  matchWinnerId?: string;
};

const savedSessionKey = 'thc-u-know-session';
const logoPath = 'assets/logos/thc-u-know-logo.svg';

type SavedSession = {
  code: string;
  playerId: string;
  name: string;
};

function readSavedSession(): SavedSession | null {
  try {
    const raw = window.localStorage.getItem(savedSessionKey);
    return raw ? (JSON.parse(raw) as SavedSession) : null;
  } catch {
    return null;
  }
}

function savePlayerSession(code: string, player: Player) {
  window.localStorage.setItem(savedSessionKey, JSON.stringify({ code, playerId: player.id, name: player.name }));
}

export function App() {
  const joinCode = useMemo(() => new URLSearchParams(window.location.search).get('join') ?? '', []);
  const savedSession = useMemo(readSavedSession, []);
  const [name, setName] = useState(savedSession?.name ?? '');
  const [code, setCode] = useState(joinCode || savedSession?.code || '');
  const [mode, setMode] = useState<GameMode>('classic');
  const [player, setPlayer] = useState<Player | null>(null);
  const [session, setSession] = useState<PublicSession | null>(null);
  const [publicState, setPublicState] = useState<PublicGameState | null>(null);
  const [privateState, setPrivateState] = useState<PrivatePlayerState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onJoined(payload: { session: PublicSession; player: Player }) {
      setPlayer(payload.player);
      setSession(payload.session);
      savePlayerSession(payload.session.code, payload.player);
      setError(null);
    }

    socket.on(Events.SESSION_CREATED, onJoined);
    socket.on(Events.SESSION_JOINED, onJoined);
    socket.on(Events.SESSION_UPDATE, setSession);
    socket.on(Events.GAME_STARTED, setSession);
    socket.on(Events.GAME_PUBLIC_STATE, setPublicState);
    socket.on(Events.GAME_PRIVATE_STATE, setPrivateState);
    socket.on(Events.ERROR, (payload: SocketErrorPayload) => setError(payload.message ?? 'Something went wrong'));
    socket.on(Events.GAME_OVER, (payload: GameOverPayload) => {
      setError(payload.matchWinnerId ? `Match winner: ${payload.matchWinnerId}` : `Round winner: ${payload.winnerId}`);
    });

    return () => {
      socket.off(Events.SESSION_CREATED, onJoined);
      socket.off(Events.SESSION_JOINED, onJoined);
      socket.off(Events.SESSION_UPDATE);
      socket.off(Events.GAME_STARTED);
      socket.off(Events.GAME_PUBLIC_STATE);
      socket.off(Events.GAME_PRIVATE_STATE);
      socket.off(Events.ERROR);
      socket.off(Events.GAME_OVER);
    };
  }, []);

  useEffect(() => {
    const saved = readSavedSession();
    if (saved?.code && saved.playerId && !joinCode) {
      socket.emit(Events.SESSION_REJOIN, { code: saved.code, playerId: saved.playerId });
    }
  }, [joinCode]);

  function hostGame() {
    socket.emit(Events.SESSION_CREATE, {
      playerName: name,
      settings: {
        mode,
        startingHandSize: mode === 'fast-sesh' ? 5 : 7,
        stacking: mode === 'no-mercy',
        jumpIn: false,
        targetScore: 500,
        thcUKnowPenaltyCards: 2
      }
    });
  }

  function joinGame() {
    const saved = readSavedSession();
    socket.emit(Events.SESSION_JOIN, { code, playerName: name, playerId: saved?.code === code ? saved.playerId : undefined });
  }

  function startGame() {
    if (!session || !player) return;
    socket.emit(Events.GAME_START, { code: session.code, playerId: player.id });
  }

  function kick(targetPlayerId: string) {
    if (!session || !player) return;
    socket.emit(Events.SESSION_KICK_PLAYER, { code: session.code, hostId: player.id, targetPlayerId });
  }

  function clearSavedSession() {
    window.localStorage.removeItem(savedSessionKey);
    window.location.reload();
  }

  function onNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  function onModeChange(event: ChangeEvent<HTMLSelectElement>) {
    setMode(event.target.value as GameMode);
  }

  function onCodeChange(event: ChangeEvent<HTMLInputElement>) {
    setCode(event.target.value.toUpperCase());
  }

  if (player && session && publicState && privateState) {
    return <GameTable playerId={player.id} publicState={publicState} privateState={privateState} />;
  }

  const isHost = Boolean(player && session?.hostId === player.id);

  return (
    <div className="app-shell">
      <header className="hero">
        <img className="hero-logo" src={logoPath} alt="THC U Know" />
        <p className="eyebrow">Online multiplayer parody card game</p>
        <h1>THC U Know</h1>
        <p>Host a Smoke Circle, invite friends, and play original UNNO-style cannabis parody rules.</p>
      </header>

      {error && <div className="error-box">{error}</div>}

      {!session && (
        <section className="panel start-panel">
          <label>
            Player name
            <input value={name} onChange={onNameChange} placeholder="Enter your name" />
          </label>
          <label>
            Game mode
            <select value={mode} onChange={onModeChange}>
              <option value="classic">Classic Mode</option>
              <option value="party">Party Mode</option>
              <option value="fast-sesh">Fast Sesh</option>
              <option value="no-mercy">No Mercy</option>
            </select>
          </label>
          <div className="button-row">
            <button type="button" disabled={!name.trim()} onClick={hostGame}>Host Smoke Circle</button>
          </div>
          <label>
            Session code
            <input value={code} onChange={onCodeChange} placeholder="ABC123" />
          </label>
          <button type="button" disabled={!name.trim() || !code.trim()} onClick={joinGame}>Join Smoke Circle</button>
          {savedSession && <button className="ghost-button" type="button" onClick={clearSavedSession}>Forget Saved Session</button>}
        </section>
      )}

      {session && player && (
        <section className="lobby-grid">
          <InvitePanel code={session.code} />
          <section className="panel">
            <h2>Smoke Circle</h2>
            {session.settings && <p>Mode: <strong>{session.settings.mode}</strong> · Hand: <strong>{session.settings.startingHandSize}</strong> · Target: <strong>{session.settings.targetScore}</strong></p>}
            <ul className="player-list">
              {session.players.map(item => (
                <li key={item.id}>
                  <span>{item.host ? '👑 ' : ''}{item.name}{item.connected ? '' : ' · disconnected'}</span>
                  {isHost && item.id !== player.id && !session.started && (
                    <button type="button" onClick={() => kick(item.id)}>Kick</button>
                  )}
                </li>
              ))}
            </ul>
            <button type="button" disabled={session.players.length < 2 || !isHost} onClick={startGame}>
              Start Game
            </button>
            {session.players.length < 2 && <p>Waiting for at least one more player.</p>}
          </section>
        </section>
      )}
    </div>
  );
}
