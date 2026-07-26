import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {MockShopNotice} from '~/components/MockShopNotice';
import {MarqueeStrip} from '~/components/brand/MarqueeStrip';
import {Hero} from '~/components/home/Hero';
import {StoreDirectory} from '~/components/home/StoreDirectory';
import {BestSellersRow} from '~/components/home/BestSellersRow';
import {MatchingSetsPromo} from '~/components/home/MatchingSetsPromo';
import {GiftsClearanceBanner} from '~/components/home/GiftsClearanceBanner';
import {BulkLadder} from '~/components/home/BulkLadder';
import {TrustBar} from '~/components/home/TrustBar';
import {SavingsClub} from '~/components/home/SavingsClub';
import {BRAND} from '~/lib/brand';
import type {ShelfData, ShelfSource} from '~/lib/shelf';

export const meta: Route.MetaFunction = () => {
  const description =
    'Deadpan graphic tees, printed on demand. Nine aisles of admissions. Buy more, pay less. Every price ends in 9.';
  return [
    {title: `${BRAND.name} — ${BRAND.tagline}`},
    {name: 'description', content: description},
    {property: 'og:title', content: `${BRAND.name} — ${BRAND.tagline}`},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  return {
    isShopLinked: Boolean(args.context.env.PUBLIC_STORE_DOMAIN),
    ...deferredData,
  };
}

/**
 * STUB: Savings Club / email capture.
 * TODO(launch): forward to the real email platform (Shopify Email / Klaviyo)
 * and issue the promised 10%-off first-order code. Until then this accepts and
 * discards the address. See README launch checklist.
 */
export async function action({request}: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get('intent');
  if (intent === 'savings-club' || intent === 'price-check') {
    return {ok: true};
  }
  return {ok: false};
}

/**
 * The homepage "shelf" — best sellers, with a graceful fallback so the shelf is
 * never empty just because a smart collection hasn't populated: try
 * best-sellers, then new-arrivals, then the raw catalog. Deferred so the store
 * signage paints before the shelves are stocked.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const shelf = loadShelf(context.storefront).catch((error: Error) => {
    console.error(error);
    return {source: 'catalog' as ShelfSource, products: []};
  });

  return {shelf};
}

async function loadShelf(
  storefront: Route.LoaderArgs['context']['storefront'],
): Promise<ShelfData> {
  for (const handle of ['best-sellers', 'new-arrivals'] as const) {
    try {
      const {collection} = await storefront.query(SHELF_COLLECTION_QUERY, {
        variables: {handle},
      });
      const nodes = collection?.products?.nodes ?? [];
      if (nodes.length) return {source: handle, products: nodes};
    } catch (error) {
      // Collection may not exist (e.g. on mock.shop) — fall through.
      console.error(error);
    }
  }

  const {products} = await storefront.query(SHELF_CATALOG_QUERY);
  return {source: 'catalog', products: products?.nodes ?? []};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      {data.isShopLinked ? null : <MockShopNotice />}
      <Hero shelf={data.shelf} />
      <MarqueeStrip />
      <StoreDirectory />
      <BestSellersRow shelf={data.shelf} />
      <MatchingSetsPromo />
      <GiftsClearanceBanner />
      <BulkLadder />
      <TrustBar />
      <SavingsClub />
    </div>
  );
}

const RECOMMENDED_PRODUCT_FRAGMENT = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
` as const;

const SHELF_COLLECTION_QUERY = `#graphql
  ${RECOMMENDED_PRODUCT_FRAGMENT}
  query ShelfCollection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      products(first: 8, sortKey: BEST_SELLING) {
        nodes {
          ...RecommendedProduct
        }
      }
    }
  }
` as const;

const SHELF_CATALOG_QUERY = `#graphql
  ${RECOMMENDED_PRODUCT_FRAGMENT}
  query ShelfCatalog($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
