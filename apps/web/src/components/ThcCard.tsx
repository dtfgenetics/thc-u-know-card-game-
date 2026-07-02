import type { Card } from '@thc-u-know/shared';
import { cardBackArt, visualAssetForCard } from '../assets/cardVisualAssets';

type Props = {
  card?: Card;
  hidden?: boolean;
  disabled?: boolean;
  onClick?: (card: Card) => void;
};

export function ThcCard({ card, hidden = false, disabled = false, onClick }: Props) {
  if (hidden || !card) {
    return (
      <div className="card card-back" aria-label="Hidden THC U Know card">
        <img className="card-art" src={cardBackArt()} alt="THC U Know card back" />
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
      <img className="card-art" src={visualAssetForCard(card)} alt="" aria-hidden="true" />
      <span className="card-label">{card.label}</span>
      <strong className="card-value">{card.kind === 'number' ? card.value : card.label}</strong>
      <span className="card-footer">{card.points} pts</span>
    </button>
  );
}
