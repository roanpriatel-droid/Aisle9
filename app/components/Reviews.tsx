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

export function ProductJsonLd({
  title,
  description,
  image,
  url,
  price,
  currencyCode,
  available,
  brand = 'AISLE 9',
}: {
  title: string;
  description?: string;
  image?: string;
  url: string;
  price?: string;
  currencyCode?: string;
  available?: boolean;
  brand?: string;
}) {
  const data = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: title,
    brand: {'@type': 'Brand', name: brand},
    ...(description ? {description} : {}),
    ...(image ? {image: [image]} : {}),
    ...(price && currencyCode
      ? {
          offers: {
            '@type': 'Offer',
            url,
            price,
            priceCurrency: currencyCode,
            availability: available
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
        }
      : {}),
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
