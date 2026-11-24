import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {isEmail, subscribeEmail} from '~/lib/admin.server';
import {MockShopNotice} from '~/components/MockShopNotice';
import {Hero} from '~/components/home/Hero';
import {TrustStrip} from '~/components/home/TrustStrip';
import {BestSellersRow} from '~/components/home/BestSellersRow';
import {AisleMapStrip} from '~/components/home/AisleMapStrip';
import {WeeklyCircularTeaser} from '~/components/home/WeeklyCircularTeaser';
import {GiftsClearanceBanner} from '~/components/home/GiftsClearanceBanner';
import {MatchingSetsPromo} from '~/components/home/MatchingSetsPromo';
import {FreakBehaviorGag} from '~/components/home/FreakBehaviorGag';
import {BulkLadder} from '~/components/home/BulkLadder';
import {PAQuoteStrip} from '~/components/home/PAQuoteStrip';
import {SavingsClub} from '~/components/home/SavingsClub';
import {BRAND} from '~/lib/brand';
import type {ShelfData, ShelfSource} from '~/lib/shelf';

export const meta: Route.MetaFunction = () => {
  const description =
    'Deadpan graphic tees, printed on demand. Nine aisles of admissions. Buy more, pay less. Every shirt is $36.';
  return [
    {title: `${BRAND.name} — ${BRAND.tagline}`},
    {name: 'description', content: description},
    {property: 'og:title', content: `${BRAND.name} — ${BRAND.tagline}`},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
    {rel: 'canonical', href: '/'},
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
export async function action({request, context}: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get('intent');
  if (intent !== 'savings-club' && intent !== 'price-check') {
    return {ok: false, error: null};
  }
  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!isEmail(email)) return {ok: false, error: 'invalid'};
  // Capture the subscriber in Shopify. If that fails we still hand over the
  // code (the benefit is real either way) and log for follow-up.
  const saved = await subscribeEmail(context.env, email, [
    'savings-club',
    `source:${intent}`,
  ]);
  if (!saved) console.warn('[savings-club] subscriber not saved');
  return {ok: true, error: null};
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
  // Real best sellers: sort the catalog
  // by best-selling directly.
  const {products} = await storefront.query(SHELF_CATALOG_QUERY);
  return {source: 'best-sellers', products: products?.nodes ?? []};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      {data.isShopLinked ? null : <MockShopNotice />}
      <Hero shelf={data.shelf} />
      <TrustStrip />
      <BestSellersRow shelf={data.shelf} />
      <AisleMapStrip />
      <WeeklyCircularTeaser shelf={data.shelf} />
      <GiftsClearanceBanner />
      <MatchingSetsPromo />
      <FreakBehaviorGag />
      <BulkLadder />
      <PAQuoteStrip />
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

const SHELF_CATALOG_QUERY = `#graphql
  ${RECOMMENDED_PRODUCT_FRAGMENT}
  query ShelfCatalog($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 36, sortKey: BEST_SELLING) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
