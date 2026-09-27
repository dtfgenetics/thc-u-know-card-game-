import type { PublicPlayerState } from '@thc-u-know/shared';

type Props = {
  players: PublicPlayerState[];
  currentPlayerId: string;
};

export function PlayerRail({ players, currentPlayerId }: Props) {
  return (
    <aside className="player-rail">
      {players.map(player => (
        <div
          key={player.id}
          className={`player-pill ${player.id === currentPlayerId ? 'active' : ''}${player.connected ? '' : ' is-disconnected'}`}
          data-player-id={player.id}
          data-score={player.score}
          data-connected={String(player.connected)}
        >
          <span>{player.host ? 'Host: ' : ''}{player.name}</span>
          <small>{player.connected ? `${player.score} pts` : `Disconnected · ${player.score} pts`}</small>
          <strong>{player.cardCount}</strong>
          {player.calledThcUKnow && <em>THC U Know!</em>}
        </div>
      ))}
    </aside>
  );
}
