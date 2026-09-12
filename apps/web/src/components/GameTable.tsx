import { useEffect, useRef, useState } from 'react';
import type { Card, CardColor, PrivatePlayerState, PublicGameState } from '@thc-u-know/shared';
import { Events, canPlayCardFromPublicState, manifestEntry } from '@thc-u-know/shared';
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

function centeredHandScrollLeft(containerWidth: number, scrollWidth: number, itemLeft: number, itemWidth: number): number {
  const maxScroll = Math.max(0, scrollWidth - containerWidth);
  const desired = itemLeft + itemWidth / 2 - containerWidth / 2;
  return Math.max(0, Math.min(desired, maxScroll));
}

export function GameTable({ playerId, publicState, privateState }: Props) {
  const isMyTurn = publicState.currentPlayerId === playerId && !publicState.winnerId;
  const [pendingWild, setPendingWild] = useState<Card | null>(null);
  const [pendingTarget, setPendingTarget] = useState<Card | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => window.localStorage.getItem('thc-u-know-sound') !== 'off');
  const previousActionId = useRef<string | undefined>(undefined);
  const handScrollRef = useRef<HTMLDivElement | null>(null);
  const wasMyTurnRef = useRef(false);
  const previousPlayableCountRef = useRef(0);

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
  const currentPlayer = publicState.players.find(player => player.id === publicState.currentPlayerId);
  const handPlayability = privateState.hand.map(card => ({
    card,
    result: canPlayCardFromPublicState(publicState, playerId, card)
  }));
  const playableCount = handPlayability.filter(entry => entry.result.ok).length;
  const drawRecommended = isMyTurn && playableCount === 0;

  useEffect(() => {
    const justBecameMyTurn = isMyTurn && !wasMyTurnRef.current;
    const newlyHasPlayableCard = isMyTurn && previousPlayableCountRef.current === 0 && playableCount > 0;
    wasMyTurnRef.current = isMyTurn;
    previousPlayableCountRef.current = playableCount;

    if ((!justBecameMyTurn && !newlyHasPlayableCard) || playableCount <= 0 || publicState.winnerId) return;
    const scroller = handScrollRef.current;
    const target = scroller?.querySelector<HTMLButtonElement>('.card.is-playable:not(:disabled)');
    if (!scroller || !target) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    window.requestAnimationFrame(() => {
      if (!target.isConnected) return;
      const left = centeredHandScrollLeft(scroller.clientWidth, scroller.scrollWidth, target.offsetLeft, target.offsetWidth);
      scroller.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }, [isMyTurn, playableCount, publicState.winnerId]);

  const turnHeadline = winner
    ? 'Round complete'
    : isMyTurn
      ? drawRecommended
        ? 'Draw from the Stash'
        : 'Play a highlighted card'
      : `${currentPlayer?.name ?? 'Another grower'} is up`;

  const turnDetail = winner
    ? `${winner.name} took the round.`
    : isMyTurn && publicState.pendingDraw > 0
      ? playableCount > 0
        ? `${publicState.pendingDraw}-card draw pressure is active. ${playableCount} legal response${playableCount === 1 ? '' : 's'} in hand.`
        : `Draw ${publicState.pendingDraw} card${publicState.pendingDraw === 1 ? '' : 's'} from the Stash to clear the pressure.`
      : isMyTurn && playableCount > 0
        ? `${playableCount} playable card${playableCount === 1 ? '' : 's'} match the ${publicState.activeColor} strain, top card, or wild rules.`
        : isMyTurn
          ? 'No legal card is in your hand right now.'
          : 'Watch the table. Your hand unlocks automatically when the turn reaches you.';

  return (
    <main
      className="game-table"
      data-current-player-id={publicState.currentPlayerId}
      data-player-id={playerId}
      data-is-my-turn={String(isMyTurn)}
      data-playable-count={playableCount}
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
        <section
          className={`turn-banner ${isMyTurn ? 'is-my-turn' : 'is-waiting'} ${publicState.pendingDraw > 0 ? 'has-pressure' : ''}`}
          aria-live="polite"
        >
          <div className="turn-copy">
            <span>{isMyTurn ? 'YOUR TURN' : winner ? 'ROUND STATUS' : 'TABLE TURN'}</span>
            <strong>{turnHeadline}</strong>
            <small>{turnDetail}</small>
          </div>
          <div className="turn-facts" aria-label="Current table facts">
            <span className={`strain-chip card-${publicState.activeColor}`}>{publicState.activeColor}</span>
            <span><b>{playableCount}</b> playable</span>
            {publicState.pendingDraw > 0 && <span className="pressure-chip">+{publicState.pendingDraw} pressure</span>}
          </div>
        </section>
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
          <button
            className={`pile stash-pile ${drawRecommended ? 'draw-recommended' : ''}`}
            type="button"
            disabled={!isMyTurn}
            onClick={draw}
          >
            <span>{drawRecommended ? 'Draw here' : 'Stash'}</span>
            <strong>{publicState.drawPileCount}</strong>
            {drawRecommended && <small>No legal card</small>}
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
          <div>
            <h2>Your Hand</h2>
            <p className={`hand-guidance ${drawRecommended ? 'draw-needed' : ''}`} aria-live="polite">
              {winner
                ? 'Round complete.'
                : isMyTurn
                  ? playableCount > 0
                    ? `${playableCount} card${playableCount === 1 ? '' : 's'} ready to play.`
                    : 'No legal card. Draw from the Stash.'
                  : 'Cards are dimmed until your turn.'}
            </p>
          </div>
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
        <div className="hand-scroll" ref={handScrollRef}>
          {handPlayability.map(({ card, result }) => (
            <ThcCard
              key={card.id}
              card={card}
              zone="hand"
              playable={result.ok}
              disabled={!result.ok}
              disabledReason={result.ok ? undefined : result.reason}
              onClick={play}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
