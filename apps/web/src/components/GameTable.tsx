import type { Card, CardColor, PrivatePlayerState, PublicGameState } from '@thc-u-know/shared';
import { Events } from '@thc-u-know/shared';
import { socket } from '../realtime/socket';
import { PlayerRail } from './PlayerRail';
import { ThcCard } from './ThcCard';

type Props = {
  playerId: string;
  publicState: PublicGameState;
  privateState: PrivatePlayerState;
};

const wildColors: CardColor[] = ['purple', 'green', 'gold', 'blue'];

export function GameTable({ playerId, publicState, privateState }: Props) {
  const isMyTurn = publicState.currentPlayerId === playerId;

  function play(card: Card) {
    let chosenColor: CardColor | undefined;
    if (card.color === 'black') {
      const choice = window.prompt('Choose strain color: purple, green, gold, or blue', 'purple') as CardColor | null;
      chosenColor = wildColors.includes(choice as CardColor) ? (choice as CardColor) : 'purple';
    }

    socket.emit(Events.GAME_PLAY_CARD, {
      code: publicState.sessionCode,
      playerId,
      cardId: card.id,
      chosenColor
    });
  }

  function draw() {
    socket.emit(Events.GAME_DRAW_CARD, { code: publicState.sessionCode, playerId });
  }

  function callThcUKnow() {
    socket.emit(Events.GAME_CALL_THC_U_KNOW, { code: publicState.sessionCode, playerId });
  }

  return (
    <main className="game-table">
      <PlayerRail players={publicState.players} currentPlayerId={publicState.currentPlayerId} />
      <section className="table-center">
        <div className="status-row">
          <strong>Active strain: {publicState.activeColor}</strong>
          <span>Direction: {publicState.direction === 1 ? 'Clockwise' : 'Counter-clockwise'}</span>
          {publicState.pendingDraw > 0 && <span className="danger">Pending draw: {publicState.pendingDraw}</span>}
        </div>
        <div className="piles">
          <button className="pile" type="button" disabled={!isMyTurn} onClick={draw}>
            <span>Stash</span>
            <strong>{publicState.drawPileCount}</strong>
          </button>
          <div className="pile ashtray">
            <span>Ashtray</span>
            <ThcCard card={publicState.topDiscard} />
          </div>
        </div>
      </section>
      <section className="hand-zone">
        <div className="hand-header">
          <h2>Your Hand</h2>
          <button type="button" onClick={callThcUKnow}>THC U Know!</button>
        </div>
        <div className="hand-scroll">
          {privateState.hand.map(card => (
            <ThcCard key={card.id} card={card} disabled={!isMyTurn} onClick={play} />
          ))}
        </div>
      </section>
    </main>
  );
}
