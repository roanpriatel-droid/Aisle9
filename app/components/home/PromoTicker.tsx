import {HOLIDAY_CUTOFF} from '~/lib/brand';

/**
 * Slim promo ticker under the hero — the PA system on a loop. Duplicated track
 * so the marquee seams invisibly; static (no motion) for reduced-motion users.
 */
export function PromoTicker() {
  const items = [
    'BUY 2 SAVE 10%',
    'BUY 3 SAVE 20%',
    'BUY 4+ SAVE 30%',
    'FREE US SHIPPING $100+',
    'PRINTED TO ORDER IN THE USA',
    ...(Date.now() < Date.parse(HOLIDAY_CUTOFF.orderBy)
      ? [HOLIDAY_CUTOFF.label]
      : []),
    'NOTHING YOU NEED',
  ];
  const run = items.join('  ·  ') + '  ·  ';
  return (
    <div className="promo-ticker" aria-label={items.join('. ')} role="note">
      <div className="promo-ticker-track animate-marquee" aria-hidden>
        <span>{run}</span>
        <span>{run}</span>
      </div>
    </div>
  );
}
