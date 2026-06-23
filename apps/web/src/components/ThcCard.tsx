import type { Card } from '@thc-u-know/shared';

type Props = {
  card?: Card;
  hidden?: boolean;
  disabled?: boolean;
  onClick?: (card: Card) => void;
};

export function ThcCard({ card, hidden = false, disabled = false, onClick }: Props) {
  if (hidden || !card) {
    return <div className="card card-back">THC<br />U Know</div>;
  }

  return (
    <button
      className={`card card-${card.color}`}
      type="button"
      disabled={disabled}
      onClick={() => onClick?.(card)}
      title={card.label}
    >
      <span className="card-label">{card.label}</span>
      <strong className="card-value">{card.kind === 'number' ? card.value : card.label}</strong>
      <span className="card-footer">{card.points} pts</span>
    </button>
  );
}
