import {Link, redirect, useLoaderData, useSearchParams} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import type {ProductSortKeys} from '@shopify/hydrogen/storefront-api-types';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {BreadcrumbJsonLd} from '~/components/StructuredData';
import {DealStrip} from '~/components/brand/DealStrip';
import {
  aisleLabelForHandle,
  findAisle,
  AISLE_TAG,
  VOICE,
  COLLECTIONS,
} from '~/lib/brand';
import type {
  ProductItemFragment,
  AisleProductsQuery,
} from 'storefrontapi.generated';

type ProductsConnection = AisleProductsQuery['products'];

export const meta: Route.MetaFunction = ({data, params}) => {
  const title = data?.title ?? 'AISLE';
  return [
    {title: `AISLE 9 — ${title}`},
    {
      name: 'description',
      content: data?.description || `Shop ${title} at AISLE 9.`,
    },
    {property: 'og:title', content: `AISLE 9 — ${title}`},
    {property: 'og:type', content: 'website'},
    {rel: 'canonical', href: `/collections/${params.handle}`},
  ];
};

/** URL ?sort= → Storefront ProductSortKeys. */
const SORT_OPTIONS = [
  {value: 'featured', label: 'FEATURED', sortKey: 'BEST_SELLING', reverse: false},
  {value: 'newest', label: 'NEWEST', sortKey: 'CREATED_AT', reverse: true},
  {value: 'price-low', label: 'PRICE ↑', sortKey: 'PRICE', reverse: false},
  {value: 'price-high', label: 'PRICE ↓', sortKey: 'PRICE', reverse: true},
  {value: 'title', label: 'A–Z', sortKey: 'TITLE', reverse: false},
] as const;

function resolveSort(value: string | null | undefined) {
  return SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
}

export async function loader(args: Route.LoaderArgs) {
  return loadCriticalData(args);
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});

  if (!handle) throw redirect('/collections');

  const aisle = findAisle(handle);
  if (!aisle) {
    // Not a known aisle — resolve as a real Shopify collection (e.g. frontpage).
    const {collection} = await storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
    });
    if (!collection) {
      throw new Response(`Collection ${handle} not found`, {status: 404});
    }
    return {
      isAisle: false,
      curated: false,
      handle,
      title: collection.title,
      label: collection.title,
      description: collection.description ?? null,
      products: collection.products as ProductsConnection,
      count: collection.products.nodes.length,
      currentSort: 'featured',
    };
  }

  // Known aisle: filter products by the aisle's tag (collections don't exist).
  const url = new URL(request.url);
  const sortParam =
    url.searchParams.get('sort') ??
    (handle === 'new-arrivals' ? 'newest' : 'featured');
  const sort = resolveSort(sortParam);

  // Best Sellers / New Arrivals have no tag — present them as a curated top set
  // (best-selling / newest) rather than the entire catalog with a load-more.
  const isCurated = handle === 'best-sellers' || handle === 'new-arrivals';
  if (isCurated) {
    const {products} = await storefront.query(AISLE_PRODUCTS_QUERY, {
      variables: {
        query: null,
        sortKey: sort.sortKey as ProductSortKeys,
        reverse: sort.reverse,
        first: 24,
      },
    });
    return {
      isAisle: true,
      curated: true,
      handle,
      title: aisle.title,
      label: aisleLabelForHandle(handle, aisle.title),
      description: aisle.blurb,
      products,
      count: products.nodes.length,
      currentSort: sort.value,
    };
  }

  const tag = AISLE_TAG[handle] ?? null;
  const query = tag ? `tag:'${tag}'` : null;

  const [{products}, countData] = await Promise.all([
    storefront.query(AISLE_PRODUCTS_QUERY, {
      variables: {
        query,
        sortKey: sort.sortKey as ProductSortKeys,
        reverse: sort.reverse,
        ...paginationVariables,
      },
    }),
    storefront.query(AISLE_COUNT_QUERY, {variables: {query}}),
  ]);

  return {
    isAisle: true,
    curated: false,
    handle,
    title: aisle.title,
    label: aisleLabelForHandle(handle, aisle.title),
    description: aisle.blurb,
    products,
    count: countData.products?.nodes?.length ?? products.nodes.length,
    currentSort: sort.value,
  };
}

export default function Collection() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const {label, title, description, products, count, isAisle, handle, curated} =
    data;

  const countLabel = count >= 250 ? '250+' : String(count);
  const countText = curated
    ? `TOP ${count}`
    : `${countLabel} ${VOICE.inStockSuffix}`;
  const isEmpty = products.nodes.length === 0;

  function sortHref(value: string) {
    const p = new URLSearchParams(searchParams);
    p.delete('cursor');
    p.delete('direction');
    p.set('sort', value);
    return `?${p.toString()}`;
  }

  return (
    <div className="collection mx-auto max-w-6xl px-4 py-10">
      {/* Aisle breadcrumb */}
      <nav aria-label="Breadcrumb" className="label-type text-ink/50">
        <Link className="hover:text-signage" to="/">
          AISLE 9
        </Link>
        {' / '}
        <Link className="hover:text-signage" to={COLLECTIONS.shopAll}>
          ALL AISLES
        </Link>
        {' / '}
        <span className="text-ink">{label}</span>
      </nav>

      {/* Sign header */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-4">
        <div>
          <p className="label-type text-signage">{label}</p>
          <h1 className="sign-type mt-1 text-4xl">{title}</h1>
        </div>
        {!isEmpty && (
          <span className="label-type border-2 border-ink bg-fluorescent px-3 py-2 text-ink">
            {countText}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-4 max-w-2xl text-ink/70">{description}</p>
      )}

      <div className="mt-6">
        <DealStrip />
      </div>

      {/* Sort controls (tag-based aisles; not the curated top sets) */}
      {isAisle && !curated && !isEmpty && (
        <div className="mb-8 flex flex-wrap items-center gap-2 border-2 border-ink bg-white p-4">
          <span className="label-type text-ink/50 sm:min-w-24">SORT</span>
          {SORT_OPTIONS.map((opt) => {
            const active = data.currentSort === opt.value;
            return (
              <Link
                key={opt.value}
                to={sortHref(opt.value)}
                preventScrollReset
                aria-pressed={active}
                className={`label-type border-2 px-3 py-1.5 no-underline ${
                  active
                    ? 'border-signage bg-signage text-white'
                    : 'border-ink bg-white text-ink hover:bg-fluorescent'
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      )}

      {isEmpty ? (
        <div className="border-2 border-ink bg-white p-10 text-center">
          <p className="sign-type text-2xl">{VOICE.outOfStockHeading}</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
            {VOICE.outOfStockBody}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link className="btn" prefetch="intent" to={COLLECTIONS.shopAll}>
              BROWSE ALL PRODUCTS
            </Link>
            <Link className="btn btn-outline" prefetch="intent" to="/search">
              SEARCH THE SHELVES
            </Link>
          </div>
        </div>
      ) : curated ? (
        <div className="products-grid">
          {products.nodes.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : 'lazy'}
              quickAdd
            />
          ))}
        </div>
      ) : (
        <PaginatedResourceSection<ProductItemFragment>
          connection={products}
          resourcesClassName="products-grid"
        >
          {({node: product, index}) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : 'lazy'}
              quickAdd
            />
          )}
        </PaginatedResourceSection>
      )}

      <BreadcrumbJsonLd
        items={[
          {name: 'AISLE 9', path: '/'},
          {name: title, path: `/collections/${handle}`},
        ]}
      />

      <Analytics.CollectionView
        data={{collection: {id: `aisle:${handle}`, handle}}}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    selectedOrFirstAvailableVariant(selectedOptions: [], ignoreUnknownOptions: true) {
      id
      availableForSale
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

/** Tag-filtered (or whole-catalog) products for an aisle. */
const AISLE_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query AisleProducts(
    $country: CountryCode
    $language: LanguageCode
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      nodes {
        ...ProductItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
      }
    }
  }
` as const;

const AISLE_COUNT_QUERY = `#graphql
  query AisleCount(
    $country: CountryCode
    $language: LanguageCode
    $query: String
  ) @inContext(country: $country, language: $language) {
    products(first: 250, query: $query) {
      nodes {
        id
      }
    }
  }
` as const;

// Real Shopify collection fallback (e.g. frontpage / future collections).
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
