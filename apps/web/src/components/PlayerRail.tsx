import type { PublicPlayerState } from '@thc-u-know/shared';

type Props = {
  players: PublicPlayerState[];
  currentPlayerId: string;
};

export function PlayerRail({ players, currentPlayerId }: Props) {
  return (
    <aside className="player-rail">
      {players.map(player => (
        <div key={player.id} className={`player-pill ${player.id === currentPlayerId ? 'active' : ''}`}>
          <span>{player.host ? '👑 ' : ''}{player.name}</span>
          <strong>{player.cardCount}</strong>
          {player.calledThcUKnow && <em>THC U Know!</em>}
        </div>
      ))}
    </aside>
  );
}
