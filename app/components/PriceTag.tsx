import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

/**
 * PRICE TAG — the price rendered as a supermarket shelf label / price tag: a
 * white card with an ink rule, a punched hole, a "SHELF PRICE" strip, the big
 * live price (updates with the selected variant), and a per-unit line. Tag
 * yellow stays reserved for the clearance sticker; this is white/ink/signage.
 *
 * `rangeNote` (e.g. "$25–$29 BY SIZE") appears when a product's variants span
 * more than one price, so the shopper knows the number moves with the size.
 */
export function PriceTag({
  price,
  compareAtPrice,
  rangeNote,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  rangeNote?: string;
}) {
  const onSale = Boolean(
    compareAtPrice &&
      price &&
      Number(compareAtPrice.amount) > Number(price.amount),
  );

  return (
    <div className="price-tag" aria-label="Price">
      <span aria-hidden className="price-tag-hole" />
      <div className="price-tag-strip">
        <span className="label-type">AISLE 9 · SHELF PRICE</span>
        {onSale && <span className="label-type price-tag-sale">ROLLBACK</span>}
      </div>
      <div className="price-tag-body">
        <div className="price-tag-amount">
          {price ? <Money data={price} /> : <span>&mdash;</span>}
          <span className="price-tag-unit">EACH</span>
        </div>
        {onSale && compareAtPrice && (
          <s className="price-tag-compare">
            <Money data={compareAtPrice} />
          </s>
        )}
      </div>
      {rangeNote && <p className="price-tag-note">{rangeNote}</p>}
    </div>
  );
}
