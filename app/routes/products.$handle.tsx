import {Suspense} from 'react';
import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  Image,
  Money,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {PriceTag} from '~/components/PriceTag';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {AddToCartButton} from '~/components/AddToCartButton';
import {SizeChartModal} from '~/components/SizeChartModal';
import {RecentlyViewed, useTrackScanned} from '~/components/RecentlyViewed';
import {JudgeMeReviews, ProductJsonLd} from '~/components/Reviews';
import {useAside} from '~/components/Aside';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {
  COLLECTIONS,
  COLLECTION_PAIRS,
  PAIR_FALLBACK_HANDLE,
  LADDER,
  PRODUCTION,
  VOICE,
  aisleLabelForHandle,
} from '~/lib/brand';
import type {
  ProductFragment,
  PairedProductFragment,
} from 'storefrontapi.generated';

type PairedData = {
  handle: string;
  title: string;
  products: PairedProductFragment[];
};

export const meta: Route.MetaFunction = ({data}) => {
  const title = data?.product.title ?? '';
  const description =
    data?.product.seo?.description ||
    data?.product.description?.slice(0, 160) ||
    `${title} — a deadpan graphic tee, printed on demand at AISLE 9.`;
  return [
    {title: `AISLE 9 — ${title}`},
    {name: 'description', content: description},
    {property: 'og:title', content: `AISLE 9 — ${title}`},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'product'},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Critical product data first — the deferred cross-sell keys off its collection.
  const criticalData = await loadCriticalData(args);
  const deferredData = loadDeferredData(args, criticalData.product);
  return {...criticalData, ...deferredData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
}

/**
 * FREQUENTLY PAIRED — deferred cross-sell. Uses the product's first collection
 * to pick a paired collection (COLLECTION_PAIRS, falling back to best sellers),
 * then streams in a few products from it, minus the current one.
 */
function loadDeferredData(
  {context}: Route.LoaderArgs,
  product: ProductFragment,
) {
  const firstCollection = product.collections?.nodes?.[0]?.handle;
  const pairHandle =
    (firstCollection && COLLECTION_PAIRS[firstCollection]) ||
    PAIR_FALLBACK_HANDLE;

  const paired = context.storefront
    .query(PAIRED_QUERY, {variables: {handle: pairHandle}})
    .then((res) => ({
      handle: pairHandle,
      title: res.collection?.title ?? '',
      products: (res.collection?.products?.nodes ?? [])
        .filter((p) => p.handle !== product.handle)
        .slice(0, 4),
    }))
    .catch((error: Error) => {
      console.error(error);
      return {handle: pairHandle, title: '', products: []};
    });

  return {paired};
}

export default function Product() {
  const {product, paired} = useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  // Aisle breadcrumb from the product's first collection.
  const firstCollection = product.collections?.nodes?.[0];
  const aisleLabel = firstCollection
    ? aisleLabelForHandle(firstCollection.handle, firstCollection.title)
    : 'THE SHELF';
  const aisleTo = firstCollection
    ? `/collections/${firstCollection.handle}`
    : COLLECTIONS.shopAll;

  // Live price-range note when variants span more than one price ($25–$29).
  const min = product.priceRange?.minVariantPrice;
  const max = product.priceRange?.maxVariantPrice;
  const rangeNote =
    min && max && Number(min.amount) !== Number(max.amount)
      ? `${fmtMoney(min)}–${fmtMoney(max)} BY SIZE`
      : undefined;

  const available = selectedVariant?.availableForSale ?? false;
  const numericProductId = product.id.split('/').pop() ?? product.id;

  // Record this product in "Previously Scanned" (recently viewed).
  useTrackScanned({
    handle: product.handle,
    title: product.title,
    imageUrl: selectedVariant?.image?.url,
    imageAlt: selectedVariant?.image?.altText ?? product.title,
    amount: selectedVariant?.price?.amount ?? min?.amount ?? '0',
    currencyCode: selectedVariant?.price?.currencyCode ?? min?.currencyCode ?? 'USD',
  });

  return (
    <div className="product pb-24 md:pb-0">
      <ProductImage image={selectedVariant?.image} />
      <div className="product-main">
        <nav aria-label="Breadcrumb" className="label-type mb-4 text-ink/50">
          <Link className="no-underline hover:text-signage" to="/">
            AISLE 9
          </Link>
          {' / '}
          <Link className="no-underline hover:text-signage" to={aisleTo}>
            {aisleLabel}
          </Link>
        </nav>

        <h1>{title}</h1>

        <div className="mt-4">
          <PriceTag
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
            rangeNote={rangeNote}
          />
          <p className="label-type mt-3 text-signage">
            {available
              ? 'IN STOCK · PRINTED TO ORDER · DISCONTINUED WITHOUT CEREMONY'
              : 'OUT OF STOCK · CHECK BACK, OR DON’T'}
          </p>
        </div>

        <div className="mt-6">
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />
        </div>

        {/* Ladder reminder — honored at checkout by the automatic discount */}
        <div className="mt-4 border-2 border-ink bg-fluorescent p-3">
          <p className="label-type text-ink/60">BUY MORE, PAY LESS</p>
          <p className="label-type mt-1.5 text-ink">
            {LADDER.filter((t) => t.discountPct > 0)
              .map((t) => `${t.qty} TEES −${t.discountPct}%`)
              .join(' · ')}
          </p>
          <p className="mt-1.5 text-xs text-ink/60">
            Applies automatically at checkout. Mix and match any designs.
          </p>
        </div>

        {/* Size guide + chart modal */}
        <div className="mt-4 flex items-center justify-between gap-4 border-2 border-ink bg-white p-3">
          <span className="label-type text-ink/70">
            ✓ {PRODUCTION.blank}
          </span>
          <SizeChartModal />
        </div>

        {/* Trust row */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {TRUST.map((item) => (
            <div key={item} className="border-2 border-ink bg-white p-3">
              <p className="label-type text-ink/70">✓ {item}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="label-type text-ink/50">SPECIFICATIONS</p>
          <div
            className="a9-prose mt-2 text-sm"
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
          />
        </div>
      </div>

      <FrequentlyPaired paired={paired} />

      <JudgeMeReviews productId={numericProductId} productTitle={title} />

      <RecentlyViewed excludeHandle={product.handle} />

      <ProductJsonLd
        title={product.title}
        description={product.description}
        image={selectedVariant?.image?.url}
        url={`/products/${product.handle}`}
        price={selectedVariant?.price?.amount}
        currencyCode={selectedVariant?.price?.currencyCode}
        available={available}
      />

      <StickyBasketBar title={title} selectedVariant={selectedVariant} />
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const TRUST = [
  PRODUCTION.method,
  PRODUCTION.turnaround,
  PRODUCTION.returns,
  'SECURE CHECKOUT BY SHOPIFY',
] as const;

function fmtMoney(m: {amount: string; currencyCode: string}) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: m.currencyCode,
      maximumFractionDigits: 0,
    }).format(Number(m.amount));
  } catch {
    return `${m.amount} ${m.currencyCode}`;
  }
}

/**
 * FREQUENTLY PAIRED — cross-sell shelf below the fold. Renders nothing until
 * the deferred query resolves (skeleton meanwhile), and nothing at all if the
 * paired collection has no other products.
 */
function FrequentlyPaired({paired}: {paired: Promise<PairedData>}) {
  return (
    <section
      aria-labelledby="paired-heading"
      className="col-span-full mt-14 border-t-2 border-ink pt-10"
    >
      <p className="label-type text-ink/50">{VOICE.pairedSub}</p>
      <h2 id="paired-heading" className="sign-type mt-1 text-3xl">
        {VOICE.pairedHeading}
      </h2>

      <Suspense fallback={<PairedSkeleton />}>
        <Await resolve={paired} errorElement={<span />}>
          {(data) => {
            const products = data?.products ?? [];
            if (!products.length) {
              return (
                <p className="mt-4 text-sm text-ink/50">
                  Nothing to pair right now. The shirt stands alone.
                </p>
              );
            }
            return (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {products.map((p) => (
                  <Link
                    key={p.id}
                    to={`/products/${p.handle}`}
                    prefetch="intent"
                    className="group block border-2 border-ink bg-white no-underline"
                  >
                    {p.featuredImage && (
                      <div className="border-b-2 border-ink">
                        <Image
                          alt={p.featuredImage.altText || p.title}
                          aspectRatio="1/1"
                          data={p.featuredImage}
                          loading="lazy"
                          sizes="(min-width: 45em) 300px, 50vw"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="sign-type text-sm group-hover:text-signage">
                        {p.title}
                      </h3>
                      <span className="mt-1 flex items-baseline gap-1 text-sm font-bold">
                        <Money data={p.priceRange.minVariantPrice} />
                        <span className="label-type text-ink/40">EACH</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}

function PairedSkeleton() {
  return (
    <div
      className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      role="status"
      aria-label="Finding pairings"
    >
      {Array.from({length: 4}).map((_, i) => (
        <div key={i} className="skeleton-card" aria-hidden>
          <div className="skeleton-media">
            <span className="label-type skeleton-note">PAIRING…</span>
          </div>
          <div className="skeleton-talker">
            <span className="skeleton-line skeleton-line-title" />
            <span className="skeleton-line skeleton-line-price" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Mobile-only sticky bar so the buy button never scrolls away.
 * Desktop already keeps the form in view via the sticky product-main column.
 */
function StickyBasketBar({
  title,
  selectedVariant,
}: {
  title: string;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const {open} = useAside();
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 flex items-center gap-3 border-t-2 border-ink bg-linoleum p-3 md:hidden">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold uppercase tracking-wide">
          {title}
        </p>
        <div className="text-sm font-bold">
          <ProductPrice price={selectedVariant?.price} />
        </div>
      </div>
      <div className="shrink-0">
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => open('cart')}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                    selectedVariant,
                  },
                ]
              : []
          }
        >
          {selectedVariant?.availableForSale ? 'ADD TO BASKET' : 'OUT OF STOCK'}
        </AddToCartButton>
      </div>
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    collections(first: 3) {
      nodes {
        handle
        title
      }
    }
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
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const PAIRED_QUERY = `#graphql
  fragment PairedProduct on Product {
    id
    title
    handle
    featuredImage {
      id
      altText
      url
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
  query PairedCollection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: 6, sortKey: BEST_SELLING) {
        nodes {
          ...PairedProduct
        }
      }
    }
  }
` as const;
