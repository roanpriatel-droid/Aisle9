import {Link, useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {Route} from './+types/pages.gift-guide';
import type {GiftCardFragment} from 'storefrontapi.generated';
import {
  BASE_PRICE,
  GIFT_DEPARTMENTS,
  HOLIDAY_CUTOFF,
  LADDER,
  ladderMath,
} from '~/lib/brand';
import {seoMeta} from '~/lib/seo';
import {BreadcrumbJsonLd} from '~/components/StructuredData';
import {CollectionHero} from '~/components/CollectionHero';
import {ProductItem} from '~/components/ProductItem';

export const meta: Route.MetaFunction = ({data, matches}) => {
  return seoMeta({
    matches,
    title: data?.seo?.title || 'Funny Gift Guide — Gifts Under $40 | AISLE 9',
    fullTitle: true,
    description: data?.seo?.description,
    path: '/pages/gift-guide',
  });
};

type Faq = {q: string; a: string}[];

/** GIFT_DEPARTMENTS order ↔ query aliases d0–d5. Keep both in sync. */
const DEPT_ALIASES = ['d0', 'd1', 'd2', 'd3', 'd4', 'd5'] as const;

export async function loader({context}: Route.LoaderArgs) {
  const data = await context.storefront.query(GIFT_GUIDE_QUERY);
  const {page} = data;

  let faq: Faq = [];
  try {
    const parsed = JSON.parse(page?.faq?.value ?? '[]') as Array<
      Partial<{q: unknown; a: unknown}>
    >;
    faq = parsed.filter(
      (f): f is {q: string; a: string} =>
        typeof f?.q === 'string' && typeof f?.a === 'string',
    );
  } catch {
    faq = [];
  }

  // Per-department products (best-selling), keyed by handle.
  const byDept = GIFT_DEPARTMENTS.map((d, i) => ({
    handle: d.handle,
    // Gift pages stay SafeSearch-friendly: no adults-only designs.
    products: (
      (data[DEPT_ALIASES[i]]?.products?.nodes ?? []) as GiftCardFragment[]
    ).filter((p) => !p.tags.includes('adults-only')),
  }));

  // "Top gifts": interleave the recipient departments, de-duplicated.
  const seen = new Set<string>();
  const topGifts: GiftCardFragment[] = [];
  for (let r = 0; r < 4; r++) {
    for (const d of byDept) {
      const p = d.products[r];
      if (p && !seen.has(p.id)) {
        seen.add(p.id);
        topGifts.push(p);
      }
    }
  }

  return {
    heading: page?.title ?? 'The Gift Department',
    bodyHtml: page?.body ?? '',
    seo: page?.seo ?? null,
    faq,
    beforeCutoff: Date.now() < Date.parse(HOLIDAY_CUTOFF.orderBy),
    byDept,
    topGifts: topGifts.slice(0, 8),
  };
}

export default function GiftGuide() {
  const {heading, bodyHtml, faq, beforeCutoff, byDept, topGifts} =
    useLoaderData<typeof loader>();

  // Receipt-style budget cards: the real ladder math, not a promise.
  const budgets = [
    {
      qty: 1,
      total: BASE_PRICE,
      perShirt: BASE_PRICE,
      note: 'ONE SHIRT. ONE PERSON.',
      saved: 0,
    },
    ...LADDER.filter((t) => t.qty > 1).map((tier) => {
      const m = ladderMath(tier);
      return {
        qty: tier.qty,
        total: m.total,
        perShirt: m.perShirt,
        note: `${tier.label} · APPLIES ITSELF`,
        saved: m.saved,
      };
    }),
  ];

  return (
    <div className="gift-guide">
      <CollectionHero
        marker="GIFT"
        eyebrow="SEASONAL · GIFT DEPARTMENT"
        title={heading.replace(/\.?$/, '.')}
        blurb="Shop by person, by budget, or by how badly you know them. Every shirt is $36, and every extra shirt costs less."
        countText={
          beforeCutoff ? HOLIDAY_CUTOFF.label : 'SHOP BY RECIPIENT BELOW'
        }
        products={topGifts}
        crumbs={[{label: 'AISLE 9', to: '/'}, {label: 'GIFT DEPARTMENT'}]}
      />

      {/* Shop by recipient — big tiles with a real shirt peeking in */}
      <section
        aria-labelledby="dept-heading"
        className="section-pad border-b-2 border-ink bg-linoleum"
        id="departments"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div
            className="flex flex-wrap items-end justify-between gap-6"
            data-reveal
          >
            <div>
              <p className="eyebrow text-signage">SHOP BY RECIPIENT</p>
              <h2 id="dept-heading" className="display-xl">
                Who is this for, roughly.
              </h2>
            </div>
            <p className="max-w-sm text-ink/70">
              Six departments, sorted by the person you are trying to impress,
              appease, or confuse.
            </p>
          </div>
          <ul className="aisle-tiles">
            {GIFT_DEPARTMENTS.map((d, i) => {
              const image = byDept[i]?.products[0]?.featuredImage;
              return (
                <li
                  key={d.handle}
                  data-reveal
                  style={{['--reveal-i' as string]: i % 3}}
                >
                  <Link
                    to={`/collections/${d.handle}`}
                    prefetch="intent"
                    className="aisle-tile group"
                  >
                    <span className="aisle-tile-n">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="aisle-tile-body">
                      <span className="aisle-tile-title">{d.title}</span>
                      <span className="aisle-tile-blurb">{d.line}</span>
                      <span className="aisle-tile-cta">SHOP THIS AISLE →</span>
                    </span>
                    {image ? (
                      <span className="aisle-tile-peek" aria-hidden>
                        <Image
                          alt=""
                          aspectRatio="1/1"
                          data={image}
                          loading="lazy"
                          sizes="(min-width: 64em) 14vw, 30vw"
                        />
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Shop by budget — oversized receipts */}
      <section
        aria-labelledby="budget-heading"
        className="section-pad border-b-2 border-ink bg-fluorescent"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div data-reveal>
            <p className="eyebrow text-signage">SHOP BY BUDGET</p>
            <h2 id="budget-heading" className="display-xl">
              What it costs, itemized.
            </h2>
          </div>
          <ul className="receipt-grid">
            {budgets.map((b, i) => (
              <li key={b.qty} data-reveal style={{['--reveal-i' as string]: i}}>
                <Link
                  to="/collections/best-sellers"
                  prefetch="intent"
                  className={`receipt-big${b.qty === 4 ? ' is-best' : ''}`}
                >
                  <span className="receipt-big-head">
                    <span>RECEIPT #{String(b.qty).padStart(4, '0')}</span>
                    {b.qty === 4 ? (
                      <span className="receipt-big-flag">BEST DEAL</span>
                    ) : null}
                  </span>
                  <span className="receipt-big-qty">
                    {b.qty}
                    <small>{b.qty === 1 ? 'SHIRT' : 'SHIRTS'}</small>
                  </span>
                  <span className="receipt-big-line">
                    <span>EACH</span>
                    <span>${b.perShirt.toFixed(2)}</span>
                  </span>
                  {b.saved > 0 ? (
                    <span className="receipt-big-line receipt-big-saved">
                      <span>YOU SAVE</span>
                      <span>−${b.saved.toFixed(2)}</span>
                    </span>
                  ) : null}
                  <span className="receipt-big-total">
                    <span>TOTAL</span>
                    <span>${b.total.toFixed(2)}</span>
                  </span>
                  <span className="receipt-big-note">{b.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Top gifts — shoppable */}
      {topGifts.length > 0 && (
        <section
          aria-labelledby="top-gifts-heading"
          className="section-pad bg-linoleum"
        >
          <div className="mx-auto max-w-7xl px-4">
            <div
              className="flex flex-wrap items-end justify-between gap-4"
              data-reveal
            >
              <div>
                <p className="eyebrow text-signage">FROM EVERY GIFT AISLE</p>
                <h2 id="top-gifts-heading" className="display-xl">
                  Top gifts.
                </h2>
              </div>
              <Link
                className="label-type text-ink underline underline-offset-4 hover:text-signage"
                prefetch="intent"
                to="/collections/white-elephant"
              >
                MORE GIFTS UNDER $40 →
              </Link>
            </div>
            <div className="gift-grid">
              {topGifts.map((p, i) => (
                <ProductItem
                  key={p.id}
                  product={p}
                  loading={i < 4 ? 'eager' : 'lazy'}
                  quickAdd
                  reveal
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About + FAQ */}
      {(bodyHtml || faq.length > 0) && (
        <section className="mx-auto max-w-7xl px-4">
          <div className="aisle-notes" data-reveal>
            {bodyHtml ? (
              <div>
                <p className="eyebrow text-signage">
                  POSTED AT THE SERVICE DESK
                </p>
                <h2 className="display-l">How gifting works here.</h2>
                <div
                  className="aisle-copy mt-6 text-ink/80"
                  // Merchant-authored HTML from the Shopify page body.
                  dangerouslySetInnerHTML={{__html: bodyHtml}}
                />
              </div>
            ) : (
              <span />
            )}
            {faq.length > 0 && (
              <div>
                <p className="eyebrow text-signage">CUSTOMER SERVICE DESK</p>
                <h2 className="display-l">Gifting questions.</h2>
                <div className="mt-6 divide-y-2 divide-ink border-2 border-ink bg-white">
                  {faq.map((item) => (
                    <details key={item.q} className="group p-4">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-bold">
                        <span>{item.q}</span>
                        <span
                          aria-hidden
                          className="text-signage transition-transform group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm text-ink/75">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Closing band */}
      <section className="gift-cta" data-reveal>
        <div className="mx-auto max-w-7xl px-4">
          <p className="eyebrow">ATTENTION SHOPPERS</p>
          <p className="gift-cta-title">Four gifts. Thirty percent off.</p>
          <p className="gift-cta-sub">
            Mix any designs, any recipients. The ladder applies itself at
            checkout — no code, no coupon, no conversation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/collections/best-sellers"
              prefetch="intent"
              className="btn btn-invert"
            >
              START A GIFT PILE
            </Link>
            <Link
              to="/collections/matching-sets"
              prefetch="intent"
              className="btn btn-ghost-light"
            >
              MATCHING SETS
            </Link>
          </div>
        </div>
      </section>

      <BreadcrumbJsonLd
        items={[
          {name: 'AISLE 9', path: '/'},
          {name: 'Gift Department', path: '/pages/gift-guide'},
        ]}
      />
    </div>
  );
}

const GIFT_GUIDE_QUERY = `#graphql
  fragment GiftCard on Product {
    cardImages: images(first: 2) {
      nodes { id url altText width height }
    }
    cardVariants: variants(first: 12) {
      nodes {
        id
        availableForSale
        selectedOptions { name value }
      }
    }
    cardOptions: options(first: 2) {
      name
      optionValues { name }
    }
    id
    handle
    title
    tags
    featuredImage { id altText url width height }
    selectedOrFirstAvailableVariant(selectedOptions: [], ignoreUnknownOptions: true) {
      id
      availableForSale
    }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
  }
  query GiftGuidePage($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    page(handle: "gift-guide") {
      title
      body
      seo { title description }
      faq: metafield(namespace: "aisle9", key: "faq") { value }
    }
    d0: collection(handle: "gifts-for-him") {
      products(first: 8, sortKey: BEST_SELLING) { nodes { ...GiftCard } }
    }
    d1: collection(handle: "gifts-for-her") {
      products(first: 8, sortKey: BEST_SELLING) { nodes { ...GiftCard } }
    }
    d2: collection(handle: "matching-sets") {
      products(first: 8, sortKey: BEST_SELLING) { nodes { ...GiftCard } }
    }
    d3: collection(handle: "white-elephant") {
      products(first: 8, sortKey: BEST_SELLING) { nodes { ...GiftCard } }
    }
    d4: collection(handle: "bachelor-party") {
      products(first: 8, sortKey: BEST_SELLING) { nodes { ...GiftCard } }
    }
    d5: collection(handle: "gifts-for-idiots") {
      products(first: 8, sortKey: BEST_SELLING) { nodes { ...GiftCard } }
    }
  }
` as const;
