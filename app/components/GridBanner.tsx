import {Link} from 'react-router';

const BANNERS = [
  {
    eyebrow: 'WAREHOUSE PRICING',
    title: 'Mix any 4. Take 30% off.',
    body: '2 tees −10% · 3 tees −20% · 4+ tees −30%. Any designs, applied automatically at checkout.',
    cta: 'HOW THE LADDER WORKS',
    to: '/pages/faq',
    tone: 'ink',
  },
  {
    eyebrow: 'GIFT DEPARTMENT',
    title: 'Buying for someone else?',
    body: 'Shop by recipient: boyfriends, girlfriends, the office swap, the bachelor party.',
    cta: 'OPEN THE GIFT GUIDE',
    to: '/pages/gift-guide',
    tone: 'signage',
  },
  {
    eyebrow: 'AISLE 12',
    title: 'Two shirts. One bad idea.',
    body: 'Matching sets for people who insist on doing things together. The pair takes 10% off.',
    cta: 'SHOP MATCHING SETS',
    to: '/collections/matching-sets',
    tone: 'fluorescent',
  },
] as const;

/**
 * Full-row promo that breaks up long product grids (rendered after every 12th
 * card). Rotates through the three offers by position.
 */
export function GridBanner({position}: {position: number}) {
  const b = BANNERS[position % BANNERS.length];
  return (
    <aside className={`grid-banner grid-banner-${b.tone}`} data-reveal>
      <div>
        <p className="eyebrow">{b.eyebrow}</p>
        <p className="grid-banner-title">{b.title}</p>
        <p className="grid-banner-body">{b.body}</p>
      </div>
      <Link to={b.to} prefetch="intent" className="grid-banner-cta">
        {b.cta} →
      </Link>
    </aside>
  );
}
