import { useState } from 'react';
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
  const [pendingWild, setPendingWild] = useState<Card | null>(null);

  function emitPlay(card: Card, chosenColor?: CardColor) {
    socket.emit(Events.GAME_PLAY_CARD, {
      code: publicState.sessionCode,
      playerId,
      cardId: card.id,
      chosenColor
    });
  }

  function play(card: Card) {
    if (card.color === 'black') {
      setPendingWild(card);
      return;
    }
    emitPlay(card);
  }

  function chooseWildColor(color: CardColor) {
    if (!pendingWild) return;
    emitPlay(pendingWild, color);
    setPendingWild(null);
  }

  function draw() {
    socket.emit(Events.GAME_DRAW_CARD, { code: publicState.sessionCode, playerId });
  }

  function callThcUKnow() {
    socket.emit(Events.GAME_CALL_THC_U_KNOW, { code: publicState.sessionCode, playerId });
  }

  const latestLog = publicState.actionLog.slice(-5).reverse();

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
        <section className="action-log">
          <h3>Table Talk</h3>
          {latestLog.map(item => <p key={item.id}>{item.message}</p>)}
        </section>
      </section>
      <section className="hand-zone">
        <div className="hand-header">
          <h2>Your Hand</h2>
          <button type="button" onClick={callThcUKnow}>THC U Know!</button>
        </div>
        {pendingWild && (
          <div className="wild-picker">
            <strong>Choose strain color for {pendingWild.label}</strong>
            <div>
              {wildColors.map(color => (
                <button key={color} className={`color-choice card-${color}`} type="button" onClick={() => chooseWildColor(color)}>
                  {color}
                </button>
              ))}
              <button className="ghost-button" type="button" onClick={() => setPendingWild(null)}>Cancel</button>
            </div>
          </div>
        )}
        <div className="hand-scroll">
          {privateState.hand.map(card => (
            <ThcCard key={card.id} card={card} disabled={!isMyTurn} onClick={play} />
          ))}
        </div>
      </section>
    </main>
  );
}
