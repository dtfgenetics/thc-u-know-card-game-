import type { Card } from '@thc-u-know/shared';
import { assetPaths } from '../assets/assetRegistry';

type Props = {
  card?: Card;
  hidden?: boolean;
  disabled?: boolean;
  onClick?: (card: Card) => void;
};

const partyKinds = new Set(['munchies', 'paranoia', 'rotation', 'tolerance-break', 'bogart', 'pass-the-tray', 'smoke-sesh', 'greener-side']);

function cardArt(card: Card): string {
  if (card.kind === 'number') return assetPaths.cards.frontNumber;
  if (partyKinds.has(card.kind)) return assetPaths.cards.frontParty;
  if (card.color === 'black') return assetPaths.cards.frontWild;
  return assetPaths.cards.frontAction;
}

export function ThcCard({ card, hidden = false, disabled = false, onClick }: Props) {
  if (hidden || !card) {
    return (
      <div className="card card-back" aria-label="Hidden THC U Know card">
        <img className="card-art" src={assetPaths.cards.back} alt="THC U Know card back" />
        <span className="card-back-title">THC U Know</span>
      </div>
    );
  }

  return (
    <button
      className={`card card-${card.color}`}
      type="button"
      disabled={disabled}
      onClick={() => onClick?.(card)}
      title={card.label}
    >
      <img className="card-art" src={cardArt(card)} alt="" aria-hidden="true" />
      <span className="card-label">{card.label}</span>
      <strong className="card-value">{card.kind === 'number' ? card.value : card.label}</strong>
      <span className="card-footer">{card.points} pts</span>
    </button>
  );
}
