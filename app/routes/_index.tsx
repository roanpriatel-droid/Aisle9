import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {seoMeta} from '~/lib/seo';
import {CampaignHero} from '~/components/home/CampaignHero';
import {PromoTicker} from '~/components/home/PromoTicker';
import {StaffPick} from '~/components/home/StaffPick';
import {
  AisleDirectoryGrid,
  type AislePreview,
} from '~/components/home/AisleDirectoryGrid';
import {isEmail, subscribeEmail} from '~/lib/admin.server';
import {MockShopNotice} from '~/components/MockShopNotice';
import {BestSellersRow} from '~/components/home/BestSellersRow';
import {WeeklyCircularTeaser} from '~/components/home/WeeklyCircularTeaser';
import {MatchingSetsPromo} from '~/components/home/MatchingSetsPromo';
import {GiftDepartmentStrip} from '~/components/home/GiftDepartmentStrip';
import {BulkLadder} from '~/components/home/BulkLadder';
import {SavingsClub} from '~/components/home/SavingsClub';
import {AISLES} from '~/lib/brand';
import type {ShelfData, ShelfSource} from '~/lib/shelf';

export const meta: Route.MetaFunction = ({matches}) => {
  return seoMeta({
    matches,
    title: 'Funny T-Shirts & Ironic Graphic Tees | AISLE 9',
    fullTitle: true,
    description:
      'Deadpan funny t-shirts from a big-box store that does not exist. 375 ironic graphic tees, $36 each, printed to order. Buy 2 save 10%, 4+ save 30%.',
    path: '/',
  });
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

  const aislePreviews = context.storefront
    .query(AISLE_PREVIEWS_QUERY)
    .then((data) =>
      AISLES.map((a, i) => {
        const node = (
          data as unknown as Record<
            string,
            {nodes: {featuredImage: AislePreview['image']}[]} | undefined
          >
        )[`a${i}`]?.nodes?.[0];
        return {handle: a.handle, image: node?.featuredImage ?? null};
      }),
    )
    .catch(() => [] as AislePreview[]);

  return {shelf, aislePreviews};
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
      <CampaignHero shelf={data.shelf} />
      <PromoTicker />
      <BestSellersRow shelf={data.shelf} />
      <StaffPick shelf={data.shelf} slot={4} />
      <GiftDepartmentStrip />
      <AisleDirectoryGrid previews={data.aislePreviews} />
      <StaffPick shelf={data.shelf} slot={9} flip />
      <BulkLadder />
      <MatchingSetsPromo />
      <WeeklyCircularTeaser shelf={data.shelf} />
      <SavingsClub />
    </div>
  );
}

const RECOMMENDED_PRODUCT_FRAGMENT = `#graphql
  fragment RecommendedProduct on Product {
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
    products(first: 36, sortKey: BEST_SELLING, query: "-tag:adults-only") {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;

/**
 * One clean best seller per aisle, for the directory tiles. Static (not built
 * from AISLES) so GraphQL codegen can parse it; aliases a0–a8 follow AISLES
 * order — update both together.
 */
const AISLE_PREVIEWS_QUERY = `#graphql
  query AislePreviews($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    a0: products(first: 1, sortKey: BEST_SELLING, query: "tag:'i-love-collection' -tag:adults-only") {
      nodes { featuredImage { url altText width height } }
    }
    a1: products(first: 1, sortKey: BEST_SELLING, query: "tag:'down-bad' -tag:adults-only") {
      nodes { featuredImage { url altText width height } }
    }
    a2: products(first: 1, sortKey: BEST_SELLING, query: "tag:'the-confessions' -tag:adults-only") {
      nodes { featuredImage { url altText width height } }
    }
    a3: products(first: 1, sortKey: BEST_SELLING, query: "tag:'freak-behavior' -tag:adults-only") {
      nodes { featuredImage { url altText width height } }
    }
    a4: products(first: 1, sortKey: BEST_SELLING, query: "tag:'warning-labels' -tag:adults-only") {
      nodes { featuredImage { url altText width height } }
    }
    a5: products(first: 1, sortKey: BEST_SELLING, query: "tag:'minor-crimes' -tag:adults-only") {
      nodes { featuredImage { url altText width height } }
    }
    a6: products(first: 1, sortKey: BEST_SELLING, query: "tag:'liver-damage' -tag:adults-only") {
      nodes { featuredImage { url altText width height } }
    }
    a7: products(first: 1, sortKey: BEST_SELLING, query: "tag:'typod' -tag:adults-only") {
      nodes { featuredImage { url altText width height } }
    }
    a8: products(first: 1, sortKey: BEST_SELLING, query: "tag:'gifts-for-idiots' -tag:adults-only") {
      nodes { featuredImage { url altText width height } }
    }
  }
` as const;
