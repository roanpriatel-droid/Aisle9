import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {MockShopNotice} from '~/components/MockShopNotice';
import {MarqueeStrip} from '~/components/brand/MarqueeStrip';
import {Hero} from '~/components/home/Hero';
import {TodaysStock} from '~/components/home/TodaysStock';
import {BulkLadder} from '~/components/home/BulkLadder';
import {CommentCards} from '~/components/home/CommentCards';
import {SeenInStore} from '~/components/home/SeenInStore';
import {TrustBar} from '~/components/home/TrustBar';
import {PriceCheck} from '~/components/home/PriceCheck';
import {BRAND} from '~/lib/brand';

export const meta: Route.MetaFunction = () => {
  const description =
    'Deadpan graphic tees, printed on demand. Buy more, pay less. Every price ends in 9.';
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
 * STUB: "Price check" email capture.
 * TODO(launch): forward to the real email platform (Shopify Email / Klaviyo)
 * once the real store is connected. Until then this accepts and discards.
 */
export async function action({request}: Route.ActionArgs) {
  const form = await request.formData();
  if (form.get('intent') === 'price-check') {
    return {ok: true};
  }
  return {ok: false};
}

/**
 * Below-the-fold shelf stock. Deferred so the sign lights up before the
 * shelves are stocked.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const stockProducts = context.storefront
    .query(STOCK_PRODUCTS_QUERY)
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    stockProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      {data.isShopLinked ? null : <MockShopNotice />}
      <Hero />
      <MarqueeStrip />
      <TodaysStock products={data.stockProducts} />
      <BulkLadder />
      <CommentCards />
      <SeenInStore />
      <TrustBar />
      <PriceCheck />
    </div>
  );
}

const STOCK_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
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
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
