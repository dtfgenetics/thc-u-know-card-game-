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
          className={`player-pill ${player.id === currentPlayerId ? 'active' : ''}`}
          data-player-id={player.id}
          data-score={player.score}
          data-card-count={player.cardCount}
        >
          <span>{player.host ? 'Host: ' : ''}{player.name}</span>
          <small>{player.score} pts</small>
          <strong>{player.cardCount}</strong>
          {player.calledThcUKnow && <em>THC U Know!</em>}
        </div>
      ))}
    </aside>
  );
}
