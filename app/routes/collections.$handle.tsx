import {Link, redirect, useLoaderData, useSearchParams} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import type {
  ProductFilter,
  ProductCollectionSortKeys,
} from '@shopify/hydrogen/storefront-api-types';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import {BreadcrumbJsonLd} from '~/components/StructuredData';
import {DealStrip} from '~/components/brand/DealStrip';
import {
  aisleLabelForHandle,
  findAisle,
  VOICE,
  COLLECTIONS,
} from '~/lib/brand';
import type {ProductItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = ({data, params}) => {
  const title = data?.collection?.title ?? data?.knownAisle?.title ?? 'AISLE';
  return [
    {title: `AISLE 9 — ${title}`},
    {
      name: 'description',
      content:
        data?.collection?.description ||
        data?.knownAisle?.blurb ||
        `Shop ${title} at AISLE 9.`,
    },
    {property: 'og:title', content: `AISLE 9 — ${title}`},
    {property: 'og:type', content: 'website'},
    // Self-canonical without facet/sort params to avoid duplicate content.
    {rel: 'canonical', href: `/collections/${params.handle}`},
  ];
};

/** URL ?sort= value → Storefront sortKey + reverse. */
const SORT_OPTIONS = [
  {value: 'featured', label: 'FEATURED', sortKey: 'COLLECTION_DEFAULT', reverse: false},
  {value: 'newest', label: 'NEWEST', sortKey: 'CREATED', reverse: true},
  {value: 'price-low', label: 'PRICE ↑', sortKey: 'PRICE', reverse: false},
  {value: 'price-high', label: 'PRICE ↓', sortKey: 'PRICE', reverse: true},
  {value: 'best-selling', label: 'BEST SELLING', sortKey: 'BEST_SELLING', reverse: false},
  {value: 'title', label: 'A–Z', sortKey: 'TITLE', reverse: false},
] as const;

function resolveSort(value: string | null) {
  return SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
}

/** Shape of a Storefront product filter facet (typed loosely; JSON input). */
type FacetValue = {id: string; label: string; count: number; input: unknown};
type FacetGroup = {
  id: string;
  label: string;
  type: string;
  values: FacetValue[];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});

  if (!handle) {
    throw redirect('/collections');
  }

  const url = new URL(request.url);
  const sort = resolveSort(url.searchParams.get('sort'));
  // Selected facet filters arrive as repeated ?filter=<json> params.
  const filters: ProductFilter[] = url.searchParams
    .getAll('filter')
    .map((raw) => {
      try {
        return JSON.parse(raw) as ProductFilter;
      } catch {
        return null;
      }
    })
    .filter((f): f is ProductFilter => f !== null);

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        filters,
        sortKey: sort.sortKey as ProductCollectionSortKeys,
        reverse: sort.reverse,
        ...paginationVariables,
      },
    }),
  ]);

  if (!collection) {
    // A known aisle/department that didn't resolve (unpopulated, or a
    // best-guess handle mismatch) renders an in-voice "restocking" page with a
    // 200 — never a 404 for a real nav link. Truly unknown handles 404.
    const knownAisle = findAisle(handle);
    if (knownAisle) {
      return {collection: null, knownAisle};
    }
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {collection, knownAisle: null};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {collection, knownAisle} = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  // Known aisle that didn't resolve → in-voice restocking page (200, no 404).
  if (!collection) {
    return <RestockingAisle aisle={knownAisle} />;
  }

  const label = aisleLabelForHandle(collection.handle, collection.title);
  const activeFilters = searchParams.getAll('filter');
  const hasActiveFilters = activeFilters.length > 0;
  const currentSort = resolveSort(searchParams.get('sort')).value;

  const rawCount = collection.productCount?.nodes?.length ?? 0;
  const countLabel = rawCount >= 250 ? '250+' : String(rawCount);

  const products = collection.products?.nodes ?? [];
  const isEmpty = products.length === 0;

  // Only LIST-type facets (Size, Color/colorway, Availability, …).
  const filterGroups = (
    (collection.products?.filters ?? []) as FacetGroup[]
  ).filter((g) => g.type === 'LIST' && g.values.length > 0);

  /** Build a URL that toggles a filter input, resetting pagination. */
  function toggleFilterHref(inputStr: string) {
    const p = new URLSearchParams(searchParams);
    p.delete('cursor');
    p.delete('direction');
    const existing = p.getAll('filter');
    p.delete('filter');
    let removed = false;
    for (const f of existing) {
      if (f === inputStr) {
        removed = true;
        continue;
      }
      p.append('filter', f);
    }
    if (!removed) p.append('filter', inputStr);
    const qs = p.toString();
    return qs ? `?${qs}` : '?';
  }

  function sortHref(value: string) {
    const p = new URLSearchParams(searchParams);
    p.delete('cursor');
    p.delete('direction');
    p.set('sort', value);
    return `?${p.toString()}`;
  }

  function clearFiltersHref() {
    const p = new URLSearchParams(searchParams);
    p.delete('filter');
    p.delete('cursor');
    p.delete('direction');
    const qs = p.toString();
    return qs ? `?${qs}` : '?';
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
          <h1 className="sign-type mt-1 text-4xl">{collection.title}</h1>
        </div>
        <span className="label-type border-2 border-ink bg-fluorescent px-3 py-2 text-ink">
          {hasActiveFilters
            ? `${countLabel} UNITS MATCH`
            : `${countLabel} ${VOICE.inStockSuffix}`}
        </span>
      </div>

      {collection.description && (
        <p className="mt-4 max-w-2xl text-ink/70">{collection.description}</p>
      )}

      <div className="mt-6">
        <DealStrip />
      </div>

      {/* Controls: filters + sort */}
      {(filterGroups.length > 0 || !isEmpty) && (
        <div className="mb-8 flex flex-col gap-4 border-2 border-ink bg-white p-4">
          {filterGroups.map((group) => (
            <div key={group.id} className="flex flex-wrap items-center gap-2">
              <span className="label-type w-full text-ink/50 sm:w-auto sm:min-w-24">
                {group.label.toUpperCase()}
              </span>
              {group.values.map((value) => {
                const inputStr = String(value.input);
                const active = activeFilters.includes(inputStr);
                return (
                  <Link
                    key={value.id}
                    to={toggleFilterHref(inputStr)}
                    preventScrollReset
                    aria-pressed={active}
                    className={`label-type border-2 border-ink px-3 py-1.5 no-underline ${
                      active
                        ? 'bg-ink text-linoleum'
                        : 'bg-white text-ink hover:bg-fluorescent'
                    }`}
                  >
                    {value.label}
                    {typeof value.count === 'number' ? (
                      <span className={active ? 'text-linoleum/60' : 'text-ink/40'}>
                        {' '}
                        ({value.count})
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-2 border-t-2 border-ink/15 pt-3">
            <span className="label-type text-ink/50 sm:min-w-24">SORT</span>
            {SORT_OPTIONS.map((opt) => {
              const active = currentSort === opt.value;
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
            {hasActiveFilters && (
              <Link
                to={clearFiltersHref()}
                preventScrollReset
                className="label-type ml-auto text-signage underline underline-offset-2"
              >
                {VOICE.clearFilters}
              </Link>
            )}
          </div>
        </div>
      )}

      {isEmpty ? (
        <CollectionEmpty
          hasActiveFilters={hasActiveFilters}
          clearHref={clearFiltersHref()}
        />
      ) : (
        <PaginatedResourceSection<ProductItemFragment>
          connection={collection.products}
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
          {name: collection.title, path: `/collections/${collection.handle}`},
        ]}
      />

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

/** In-voice 200 page for a known aisle that didn't resolve to a collection. */
function RestockingAisle({
  aisle,
}: {
  aisle: {n: number; title: string; handle: string; blurb: string} | null;
}) {
  const label = aisle ? `AISLE ${aisle.n} — ${aisle.title}` : 'THIS AISLE';
  return (
    <div className="collection mx-auto max-w-6xl px-4 py-10">
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

      <div className="mt-4 border-b-2 border-ink pb-4">
        <p className="label-type text-signage">{label}</p>
        <h1 className="sign-type mt-1 text-4xl">{aisle?.title ?? 'AISLE'}</h1>
      </div>

      {aisle?.blurb && (
        <p className="mt-4 max-w-2xl text-ink/70">{aisle.blurb}</p>
      )}

      <div className="mt-8 border-2 border-ink bg-white p-10 text-center">
        <p className="sign-type text-2xl">{VOICE.restockingHeading}</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
          {VOICE.restockingBody}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link className="btn" prefetch="intent" to={COLLECTIONS.bestSellers}>
            SHOP BEST SELLERS
          </Link>
          <Link
            className="btn btn-outline"
            prefetch="intent"
            to={COLLECTIONS.shopAll}
          >
            BROWSE ALL AISLES
          </Link>
        </div>
      </div>
    </div>
  );
}

function CollectionEmpty({
  hasActiveFilters,
  clearHref,
}: {
  hasActiveFilters: boolean;
  clearHref: string;
}) {
  return (
    <div className="border-2 border-ink bg-white p-10 text-center">
      <p className="sign-type text-2xl">
        {hasActiveFilters ? VOICE.noMatchHeading : VOICE.outOfStockHeading}
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
        {hasActiveFilters ? VOICE.noMatchBody : VOICE.outOfStockBody}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasActiveFilters ? (
          <Link className="btn" to={clearHref} preventScrollReset>
            {VOICE.clearFilters}
          </Link>
        ) : null}
        <Link className="btn btn-outline" prefetch="intent" to={COLLECTIONS.shopAll}>
          BROWSE ALL AISLES
        </Link>
      </div>
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

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
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
      productCount: products(first: 250, filters: $filters) {
        nodes {
          id
        }
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        nodes {
          ...ProductItem
        }
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
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
