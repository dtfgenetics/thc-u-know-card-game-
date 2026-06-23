import { useState } from 'react';
import type { Card, CardColor, PrivatePlayerState, PublicGameState } from '@thc-u-know/shared';
import { Events } from '@thc-u-know/shared';
import { socket } from '../realtime/socket';
import { ChatBox } from './ChatBox';
import { PlayerRail } from './PlayerRail';
import { ThcCard } from './ThcCard';

type Props = {
  playerId: string;
  publicState: PublicGameState;
  privateState: PrivatePlayerState;
};

const wildColors: CardColor[] = ['purple', 'green', 'gold', 'blue'];
const colorChangingWilds = new Set(['strain-switch', 'hotbox-plus-four']);
const targetCards = new Set(['bogart', 'greener-side']);

export function GameTable({ playerId, publicState, privateState }: Props) {
  const isMyTurn = publicState.currentPlayerId === playerId;
  const [pendingWild, setPendingWild] = useState<Card | null>(null);
  const [pendingTarget, setPendingTarget] = useState<Card | null>(null);

  function emitPlay(card: Card, options?: { chosenColor?: CardColor; targetPlayerId?: string }) {
    socket.emit(Events.GAME_PLAY_CARD, {
      code: publicState.sessionCode,
      playerId,
      cardId: card.id,
      chosenColor: options?.chosenColor,
      targetPlayerId: options?.targetPlayerId
    });
  }

  function play(card: Card) {
    if (colorChangingWilds.has(card.kind)) {
      setPendingWild(card);
      return;
    }
    if (targetCards.has(card.kind)) {
      setPendingTarget(card);
      return;
    }
    emitPlay(card);
  }

  function chooseWildColor(color: CardColor) {
    if (!pendingWild) return;
    emitPlay(pendingWild, { chosenColor: color });
    setPendingWild(null);
  }

  function chooseTarget(targetPlayerId: string) {
    if (!pendingTarget) return;
    emitPlay(pendingTarget, { targetPlayerId });
    setPendingTarget(null);
  }

  function draw() {
    socket.emit(Events.GAME_DRAW_CARD, { code: publicState.sessionCode, playerId });
  }

  function callThcUKnow() {
    socket.emit(Events.GAME_CALL_THC_U_KNOW, { code: publicState.sessionCode, playerId });
  }

  const latestLog = publicState.actionLog.slice(-5).reverse();
  const targetOptions = publicState.players.filter(player => player.id !== playerId);

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
        <ChatBox code={publicState.sessionCode} playerId={playerId} />
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
        {pendingTarget && (
          <div className="wild-picker">
            <strong>Choose target for {pendingTarget.label}</strong>
            <div>
              {targetOptions.map(target => (
                <button key={target.id} className="ghost-button" type="button" onClick={() => chooseTarget(target.id)}>
                  {target.name}
                </button>
              ))}
              <button className="ghost-button" type="button" onClick={() => setPendingTarget(null)}>Cancel</button>
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
