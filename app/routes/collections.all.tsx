import {Fragment} from 'react';
import type {Route} from './+types/collections.all';
import {useLoaderData} from 'react-router';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {DealStrip} from '~/components/brand/DealStrip';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {seoMeta} from '~/lib/seo';
import {GridBanner} from '~/components/GridBanner';
import {CollectionHero, NextAisle} from '~/components/CollectionHero';

export const meta: Route.MetaFunction = ({matches}) => {
  return seoMeta({
    matches,
    title: 'All Funny T-Shirts',
    description:
      'Every funny t-shirt in the store: 375 deadpan graphic tees across nine aisles. $36 each. Buy 2 save 10%, 3 save 20%, 4+ save 30%.',
    path: '/collections/all',
  });
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 24,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return {products};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div className="collection">
      <CollectionHero
        marker="13"
        eyebrow="FRONT OF STORE · FULL INVENTORY"
        title="Everything on the shelf."
        blurb="The complete stock, in no particular order of importance, because none of it is important. Every shirt $36; the bulk ladder works across all of it."
        countText="EVERY AISLE · ONE SHELF"
        products={products.nodes}
        crumbs={[
          {label: 'AISLE 9', to: '/'},
          {label: 'ALL AISLES', to: '/collections'},
          {label: 'ALL PRODUCTS'},
        ]}
      />
      <div className="collection-body mx-auto max-w-7xl px-4">
        <h2 className="sr-only">All products</h2>
        <div className="collection-toolbar">
          <DealStrip />
        </div>
        <PaginatedResourceSection<CollectionItemFragment>
          connection={products}
          resourcesClassName="products-grid"
        >
          {({node: product, index}) => (
            <Fragment key={product.id}>
              <ProductItem
                product={product}
                loading={index < 8 ? 'eager' : undefined}
                quickAdd
                reveal
              />
              {(index + 1) % 12 === 0 ? (
                <GridBanner position={(index + 1) / 12 - 1} />
              ) : null}
            </Fragment>
          )}
        </PaginatedResourceSection>
      </div>
      <NextAisle handle="all" />
    </div>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    tags
    selectedOrFirstAvailableVariant(selectedOptions: [], ignoreUnknownOptions: true) {
      id
      availableForSale
    }
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
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
