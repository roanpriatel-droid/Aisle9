import {Link, useLoaderData} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import type {Route} from './+types/pages.weekly-circular';
import type {FlyerProductFragment} from 'storefrontapi.generated';
import {
  ALL_AISLES,
  WEEKLY_CIRCULAR,
  LADDER,
  aisleLabelForHandle,
} from '~/lib/brand';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `AISLE 9 — WEEKLY CIRCULAR`},
    {
      name: 'description',
      content:
        'The AISLE 9 weekly circular. Every department, laid out with price tags, like the mailer nobody asked for. Every shirt is $36. The bulk discount applies itself.',
    },
    {property: 'og:title', content: 'AISLE 9 — WEEKLY CIRCULAR'},
    {property: 'og:type', content: 'website'},
  ];
};

type Section = {handle: string; title: string; products: FlyerProductFragment[]};

/** Order index for a collection handle by its aisle number (unknowns last). */
function aisleOrder(handle: string) {
  const i = ALL_AISLES.findIndex((a) => a.handle === handle);
  return i === -1 ? 999 : i;
}

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const {collections} = await storefront.query(CIRCULAR_QUERY, {
    variables: {first: 14, productsFirst: 4},
  });

  let sections: Section[] = (collections?.nodes ?? [])
    .map((c) => ({
      handle: c.handle,
      title: c.title,
      products: c.products?.nodes ?? [],
    }))
    .filter((s) => s.products.length > 0)
    .sort((a, b) => aisleOrder(a.handle) - aisleOrder(b.handle))
    .slice(0, 6);

  // Fallback so the flyer is never blank: one "THIS WEEK" section from catalog.
  if (sections.length === 0) {
    const {products} = await storefront.query(CIRCULAR_FALLBACK_QUERY, {
      variables: {first: 12},
    });
    const nodes = products?.nodes ?? [];
    if (nodes.length) {
      sections = [{handle: 'all', title: 'THIS WEEK', products: nodes}];
    }
  }

  return {sections};
}

export default function WeeklyCircular() {
  const {sections} = useLoaderData<typeof loader>();
  const hero = sections[0]?.products[0] ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Masthead */}
      <div className="flyer-masthead border-2 border-ink">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-signage px-4 py-2 sm:px-6">
          <span className="label-type text-white">{WEEKLY_CIRCULAR.eyebrow}</span>
          <span className="label-type text-white/80">AISLE 9</span>
        </div>
        <div className="bg-ink px-4 py-8 text-center sm:px-6 sm:py-12">
          <h1 className="sign-type text-5xl text-linoleum sm:text-7xl">
            {WEEKLY_CIRCULAR.heading}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-linoleum/70">
            {WEEKLY_CIRCULAR.sub}
          </p>
          <p className="label-type mt-4 text-linoleum/60">
            {WEEKLY_CIRCULAR.validity}
          </p>
        </div>
      </div>

      {/* Bulk-ladder flyer banner */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 border-2 border-ink bg-fluorescent px-4 py-3 text-center">
        <span className="label-type text-signage">EVERY DAY LOW LADDER</span>
        <span className="sign-type text-sm">
          {LADDER.filter((t) => t.discountPct > 0)
            .map((t) => `${t.qty} FOR −${t.discountPct}%`)
            .join('  ·  ')}
        </span>
        <span className="label-type text-ink/50">APPLIES ITSELF AT CHECKOUT</span>
      </div>

      {/* Hero headliner */}
      {hero && (
        <Link
          to={`/products/${hero.handle}`}
          prefetch="intent"
          className="group mt-4 grid items-stretch border-2 border-ink bg-white no-underline md:grid-cols-2"
        >
          {hero.featuredImage && (
            <div className="border-b-2 border-ink md:border-b-0 md:border-r-2">
              <Image
                alt={hero.featuredImage.altText || hero.title}
                aspectRatio="1/1"
                data={hero.featuredImage}
                loading="eager"
                sizes="(min-width: 48em) 560px, 100vw"
              />
            </div>
          )}
          <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
            <span className="label-type text-signage">
              THIS WEEK’S HEADLINER
            </span>
            <h2 className="sign-type text-3xl group-hover:text-signage sm:text-4xl">
              {hero.title}
            </h2>
            <FlyerPrice price={hero.priceRange.minVariantPrice} big />
            <span className="label-type text-ink/50">
              PICK A SIZE — THE LADDER DOES THE REST →
            </span>
          </div>
        </Link>
      )}

      {/* Department sections */}
      {sections.map((section) => (
        <section key={section.handle} className="mt-10">
          <div className="flex items-center justify-between border-2 border-ink bg-ink px-4 py-2">
            <h2 className="sign-type text-lg text-linoleum">
              {aisleLabelForHandle(section.handle, section.title)}
            </h2>
            <Link
              to={`/collections/${section.handle}`}
              prefetch="intent"
              className="label-type text-linoleum/70 hover:text-linoleum"
            >
              SEE THE AISLE →
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {section.products.map((product) => (
              <FlyerCell key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}

      {/* Disclaimer */}
      <p className="mx-auto mt-12 max-w-2xl border-t-2 border-ink pt-6 text-center text-xs text-ink/50">
        {WEEKLY_CIRCULAR.disclaimer}
      </p>
    </div>
  );
}

/** A single flyer cell: product image, title, and a bold price tag. */
function FlyerCell({product}: {product: FlyerProductFragment}) {
  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className="group flex flex-col border-2 border-ink bg-white no-underline"
    >
      {product.featuredImage && (
        <div className="border-b-2 border-ink">
          <Image
            alt={product.featuredImage.altText || product.title}
            aspectRatio="1/1"
            data={product.featuredImage}
            loading="lazy"
            sizes="(min-width: 64em) 280px, 45vw"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between gap-3 p-3">
        <h3 className="sign-type line-clamp-2 text-sm group-hover:text-signage">
          {product.title}
        </h3>
        <FlyerPrice price={product.priceRange.minVariantPrice} />
      </div>
    </Link>
  );
}

/** Bold flyer price tag — white tag, ink border, signage-red price. */
function FlyerPrice({
  price,
  big = false,
}: {
  price: {amount: string; currencyCode: string};
  big?: boolean;
}) {
  return (
    <span className={`flyer-price${big ? ' flyer-price-big' : ''}`}>
      <span className="flyer-price-amount">
        <Money
          data={{
            amount: price.amount,
            currencyCode: price.currencyCode as CurrencyCode,
          }}
        />
      </span>
      <span className="flyer-price-unit">EACH</span>
    </span>
  );
}

const FLYER_PRODUCT_FRAGMENT = `#graphql
  fragment FlyerProduct on Product {
    id
    handle
    title
    featuredImage {
      id
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
` as const;

const CIRCULAR_QUERY = `#graphql
  ${FLYER_PRODUCT_FRAGMENT}
  query WeeklyCircular(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $productsFirst: Int
  ) @inContext(country: $country, language: $language) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        products(first: $productsFirst, sortKey: BEST_SELLING) {
          nodes {
            ...FlyerProduct
          }
        }
      }
    }
  }
` as const;

const CIRCULAR_FALLBACK_QUERY = `#graphql
  ${FLYER_PRODUCT_FRAGMENT}
  query WeeklyCircularFallback(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        ...FlyerProduct
      }
    }
  }
` as const;
