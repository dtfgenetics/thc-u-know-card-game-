import type { Card } from '@thc-u-know/shared';
import { cardBackArt, visualAssetForCard } from '../assets/cardVisualAssets';

type Props = {
  card?: Card;
  hidden?: boolean;
  disabled?: boolean;
  playable?: boolean;
  disabledReason?: string;
  zone?: 'hand' | 'discard';
  onClick?: (card: Card) => void;
};

export function ThcCard({
  card,
  hidden = false,
  disabled = false,
  playable,
  disabledReason,
  zone,
  onClick
}: Props) {
  if (hidden || !card) {
    return (
      <div className="card card-back" aria-label="Hidden THC U Know card">
        <img className="card-art" src={cardBackArt()} alt="THC U Know card back" />
        <span className="card-back-title">THC U Know</span>
      </div>
    );
  }

  const playabilityClass = playable === undefined ? '' : playable ? ' is-playable' : ' is-blocked';
  const accessibleLabel = disabledReason ? `${card.label}. ${disabledReason}` : card.label;

  return (
    <button
      className={`card card-${card.color}${playabilityClass}`}
      type="button"
      disabled={disabled || !onClick}
      aria-label={accessibleLabel}
      data-card-id={card.id}
      data-card-kind={card.kind}
      data-card-color={card.color}
      data-card-value={card.value}
      data-card-zone={zone}
      data-card-playable={playable === undefined ? undefined : String(playable)}
      onClick={() => onClick?.(card)}
      title={accessibleLabel}
    >
      <img className="card-art" src={visualAssetForCard(card)} alt="" aria-hidden="true" />
      <span className="card-label">{card.label}</span>
      <strong className="card-value">{card.kind === 'number' ? card.value : card.label}</strong>
      <span className="card-footer">{card.points} pts</span>
    </button>
  );
}
