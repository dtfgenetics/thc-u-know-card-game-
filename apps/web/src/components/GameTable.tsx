import { useEffect, useRef, useState } from 'react';
import type { Card, CardColor, PrivatePlayerState, PublicGameState } from '@thc-u-know/shared';
import { Events, manifestEntry } from '@thc-u-know/shared';
import { socket } from '../realtime/socket';
import { playGameSound } from '../audio/gameSounds';
import { ChatBox } from './ChatBox';
import { PlayerRail } from './PlayerRail';
import { ThcCard } from './ThcCard';

type Props = {
  playerId: string;
  publicState: PublicGameState;
  privateState: PrivatePlayerState;
};

const wildColors: CardColor[] = ['purple', 'green', 'gold', 'blue'];

function cardNeedsChosenColor(card: Card): boolean {
  return card.kind !== 'number' && manifestEntry(card.kind).needsChosenColor;
}

function cardNeedsTarget(card: Card): boolean {
  return card.kind !== 'number' && manifestEntry(card.kind).needsTarget;
}

export function GameTable({ playerId, publicState, privateState }: Props) {
  const isMyTurn = publicState.currentPlayerId === playerId && !publicState.winnerId;
  const [pendingWild, setPendingWild] = useState<Card | null>(null);
  const [pendingTarget, setPendingTarget] = useState<Card | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => window.localStorage.getItem('thc-u-know-sound') !== 'off');
  const previousActionId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const latestAction = publicState.actionLog.at(-1);
    if (!latestAction || latestAction.id === previousActionId.current) return;
    previousActionId.current = latestAction.id;

    if (publicState.winnerId) playGameSound('win', soundEnabled);
    else if (/drew|stash/i.test(latestAction.message)) playGameSound('draw', soundEnabled);
    else playGameSound('card', soundEnabled);
  }, [publicState.actionLog, publicState.winnerId, soundEnabled]);

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
    if (cardNeedsChosenColor(card)) {
      setPendingWild(card);
      return;
    }
    if (cardNeedsTarget(card)) {
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
    playGameSound('draw', soundEnabled);
    socket.emit(Events.GAME_DRAW_CARD, { code: publicState.sessionCode, playerId });
  }

  function callThcUKnow() {
    socket.emit(Events.GAME_CALL_THC_U_KNOW, { code: publicState.sessionCode, playerId });
  }

  function rematch() {
    playGameSound('turn', soundEnabled);
    socket.emit(Events.GAME_REMATCH, { code: publicState.sessionCode, playerId });
  }

  function leaveGame() {
    window.localStorage.removeItem('thc-u-know-session');
    window.location.assign(import.meta.env.BASE_URL);
  }

  function toggleSound() {
    const nextValue = !soundEnabled;
    setSoundEnabled(nextValue);
    window.localStorage.setItem('thc-u-know-sound', nextValue ? 'on' : 'off');
    playGameSound('turn', nextValue);
  }

  const latestLog = publicState.actionLog.slice(-5).reverse();
  const targetOptions = publicState.players.filter(player => player.id !== playerId);
  const winner = publicState.winnerId ? publicState.players.find(player => player.id === publicState.winnerId) : undefined;

  return (
    <main
      className="game-table"
      data-current-player-id={publicState.currentPlayerId}
      data-player-id={playerId}
      data-pending-draw={publicState.pendingDraw}
      data-round-number={publicState.roundNumber}
      data-winner-id={publicState.winnerId}
      data-updated-at={publicState.updatedAt}
    >
      <PlayerRail players={publicState.players} currentPlayerId={publicState.currentPlayerId} />
      <section className="table-center">
        {winner && (
          <section className="winner-panel">
            <p className="eyebrow">Round Over</p>
            <h2>{winner.name} wins!</h2>
            <div className="button-row winner-actions">
              <button type="button" onClick={rematch}>Start Rematch</button>
              <button className="ghost-button" type="button" onClick={leaveGame}>Back to Home</button>
            </div>
          </section>
        )}
        <div className="status-row">
          <strong>Active strain: {publicState.activeColor}</strong>
          <span>Direction: {publicState.direction === 1 ? 'Clockwise' : 'Counter-clockwise'}</span>
          {publicState.pendingDraw > 0 && <span className="danger">Pending draw: {publicState.pendingDraw}</span>}
          <label className="sound-toggle">
            <input type="checkbox" checked={soundEnabled} onChange={toggleSound} />
            <span>Sound</span>
          </label>
        </div>
        <div className="piles">
          <button className="pile" type="button" disabled={!isMyTurn} onClick={draw}>
            <span>Stash</span>
            <strong>{publicState.drawPileCount}</strong>
          </button>
          <div className="pile ashtray">
            <span>Ashtray</span>
            <ThcCard card={publicState.topDiscard} zone="discard" />
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
          <button type="button" disabled={Boolean(publicState.winnerId)} onClick={callThcUKnow}>THC U Know!</button>
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
            <ThcCard key={card.id} card={card} zone="hand" disabled={!isMyTurn} onClick={play} />
          ))}
        </div>
      </section>
    </main>
  );
}
