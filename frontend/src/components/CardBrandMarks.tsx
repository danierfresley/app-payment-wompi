import type { CardBrand } from '../utils/card';

interface Props {
  brand: CardBrand;
}

export function CardBrandMarks({ brand }: Props) {
  return (
    <div className="brand-row" aria-label="Marca de tarjeta detectada">
      <span className={`brand-chip ${brand === 'visa' ? 'is-on' : ''}`}>
        <svg viewBox="0 0 48 16" width="42" height="14" aria-hidden="true">
          <text
            x="0"
            y="13"
            fontFamily="Georgia, serif"
            fontStyle="italic"
            fontWeight="700"
            fontSize="16"
            fill="currentColor"
          >
            VISA
          </text>
        </svg>
      </span>
      <span className={`brand-chip ${brand === 'mastercard' ? 'is-on' : ''}`}>
        <svg viewBox="0 0 36 22" width="36" height="22" aria-hidden="true">
          <circle cx="13" cy="11" r="10" fill="#eb001b" />
          <circle cx="23" cy="11" r="10" fill="#f79e1b" />
        </svg>
      </span>
    </div>
  );
}
