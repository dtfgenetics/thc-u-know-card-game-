import type { PublicPlayerState } from '@thc-u-know/shared';

type Props = {
  players: PublicPlayerState[];
  currentPlayerId: string;
  localPlayerId: string;
  roundComplete: boolean;
};

export function PlayerRail({ players, currentPlayerId, localPlayerId, roundComplete }: Props) {
  return (
    <aside className="player-rail" aria-label="Players">
      {players.map(player => {
        const isLocal = player.id === localPlayerId;
        const isCurrent = !roundComplete && player.id === currentPlayerId;

        return (
          <div
            key={player.id}
            className={`player-pill ${isCurrent ? 'active' : ''}${isLocal ? ' is-local' : ''}${player.connected ? '' : ' is-disconnected'}`}
            data-player-id={player.id}
            data-score={player.score}
            data-connected={String(player.connected)}
            data-local={String(isLocal)}
            data-current-turn={String(isCurrent)}
          >
            <div className="player-badges">
              {isLocal && <span>You</span>}
              {player.host && <span>Host</span>}
              {isCurrent && <span>Turn</span>}
              {!player.connected && <span>Offline</span>}
            </div>
            <span className="player-name">{player.name}</span>
            <small>{player.connected ? `${player.score} pts` : `Disconnected · ${player.score} pts`}</small>
            <strong>{player.cardCount} card{player.cardCount === 1 ? '' : 's'}</strong>
            {player.calledThcUKnow && <em>THC U Know!</em>}
          </div>
        );
      })}
    </aside>
  );
}
