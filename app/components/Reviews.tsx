/**
 * Product structured data + Judge.me review wiring.
 *
 * - `ProductJsonLd` emits schema.org Product/Offer markup (legitimate SEO). We
 *   do NOT emit aggregateRating/review until real reviews exist — no fabricated
 *   counts or stars.
 * - `JudgeMeReviews` renders Judge.me's standard widget containers, which the
 *   Judge.me script populates once the app is connected to the store. Until
 *   then it shows an honest empty state.
 */

export type VariantOffer = {
  sku?: string;
  name?: string;
  price: string;
  currencyCode: string;
  available: boolean;
};

/**
 * schema.org Product markup. When per-variant offers are supplied it emits an
 * AggregateOffer with one Offer per variant (lowPrice/highPrice + offerCount);
 * otherwise a single Offer. No aggregateRating/review until real reviews exist.
 */
export function ProductJsonLd({
  title,
  description,
  image,
  url,
  currencyCode,
  available,
  offers,
  brand = 'AISLE 9',
}: {
  title: string;
  description?: string;
  image?: string;
  url: string;
  currencyCode?: string;
  available?: boolean;
  /** Per-variant offers; if 2+, rendered as an AggregateOffer. */
  offers?: VariantOffer[];
  brand?: string;
}) {
  const list = (offers ?? []).filter((o) => o.price && o.currencyCode);
  let offerBlock: Record<string, unknown> | undefined;

  if (list.length > 0) {
    const currency = list[0].currencyCode;
    const prices = list.map((o) => Number(o.price)).filter(Number.isFinite);
    const low = Math.min(...prices);
    const high = Math.max(...prices);
    const anyAvailable = list.some((o) => o.available);
    const offerItems = list.map((o) => ({
      '@type': 'Offer',
      url,
      price: o.price,
      priceCurrency: o.currencyCode,
      ...(o.sku ? {sku: o.sku} : {}),
      ...(o.name ? {name: o.name} : {}),
      availability: o.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    }));
    offerBlock = {
      '@type': 'AggregateOffer',
      priceCurrency: currency,
      lowPrice: low.toFixed(2),
      highPrice: high.toFixed(2),
      offerCount: list.length,
      availability: anyAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      offers: offerItems,
    };
  } else if (currencyCode) {
    offerBlock = {
      '@type': 'Offer',
      url,
      priceCurrency: currencyCode,
      availability: available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    };
  }

  const data = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: title,
    brand: {'@type': 'Brand', name: brand},
    ...(description ? {description} : {}),
    ...(image ? {image: [image]} : {}),
    ...(offerBlock ? {offers: offerBlock} : {}),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  );
}

/**
 * Judge.me review widget mount. `productId` is the numeric Shopify product id
 * Judge.me keys on (derived from the storefront GID). The Judge.me script,
 * installed on the store, hydrates these containers.
 */
export function JudgeMeReviews({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  return (
    <section
      aria-labelledby="reviews-heading"
      className="col-span-full mt-14 border-t-2 border-ink pt-10"
    >
      <p className="label-type text-ink/50">CUSTOMER FEEDBACK · UNEDITED</p>
      <h2 id="reviews-heading" className="sign-type mt-1 text-3xl">
        REVIEWS
      </h2>

      {/* Judge.me populates this container when the app is connected. */}
      <div
        className="jdgm-widget jdgm-review-widget mt-6"
        data-id={productId}
        data-product-title={productTitle}
      />

      {/* Honest fallback until reviews exist / Judge.me is live. */}
      <div className="jdgm-empty mt-6 border-2 border-ink bg-white p-6 text-center">
        <p className="sign-type text-lg">NO REVIEWS ON FILE YET.</p>
        <p className="mt-2 text-sm text-ink/60">
          Be the first to state something on the record. Reviews post here once
          verified — no fabricated stars, no invented shoppers.
        </p>
      </div>
    </section>
  );
}

/** Judge.me preview badge (stars summary) for PDP headers, once connected. */
export function JudgeMeBadge({productId}: {productId: string}) {
  return (
    <div className="jdgm-widget jdgm-preview-badge" data-id={productId} />
  );
}
