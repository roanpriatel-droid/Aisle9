import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

/**
 * PRICE TAG — the price as a price-gun shelf tag. This is the one sanctioned
 * use of price-tag yellow (#F7D117): a punched yellow tag, ink type, the live
 * variant price, the deadpan unit-pricing line ("$25.00 · $25.00/SHIRT"), and
 * a "WAS" strikethrough when there's a compare-at. Updates with the variant.
 */
export function PriceTag({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  const onSale = Boolean(
    compareAtPrice &&
      price &&
      Number(compareAtPrice.amount) > Number(price.amount),
  );

  return (
    <div
      className="pricetag"
      aria-label={price ? `Price ${price.amount} ${price.currencyCode}` : 'Price'}
    >
      <span aria-hidden className="pricetag-hole" />
      <div className="pricetag-inner">
        {onSale && compareAtPrice ? (
          <span className="pricetag-was">
            WAS{' '}
            <s>
              <Money data={compareAtPrice} />
            </s>
          </span>
        ) : null}
        <div className="pricetag-amount">
          {price ? <Money data={price} /> : <span>&mdash;</span>}
        </div>
        <div className="pricetag-unit">
          {price ? (
            <>
              <Money data={price} /> <span aria-hidden>·</span>{' '}
              <Money data={price} />
              /SHIRT
            </>
          ) : (
            'UNIT PRICE ON REQUEST'
          )}
        </div>
      </div>
    </div>
  );
}
