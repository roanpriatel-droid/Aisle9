import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blogs._index';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import type {BlogsQuery} from 'storefrontapi.generated';
import {BRAND} from '~/lib/brand';

type BlogNode = BlogsQuery['blogs']['nodes'][0];

export const meta: Route.MetaFunction = () => {
  return [
    {title: `${BRAND.name} — BULLETIN BOARD`},
    {
      name: 'description',
      content:
        'Store notices, restock announcements, and things posted to the corkboard by the entrance.',
    },
  ];
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
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {blogs};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Blogs() {
  const {blogs} = useLoaderData<typeof loader>();
  const hasBoards = blogs.nodes.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="label-type text-ink/50">POSTED BY THE ENTRANCE</p>
      <h1 className="sign-type mt-2 text-4xl">BULLETIN BOARD</h1>
      <p className="mt-4 max-w-prose text-ink/70">
        Store notices, restock announcements, and whatever else gets pinned to
        the corkboard. Read in the order posted.
      </p>

      {hasBoards ? (
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <PaginatedResourceSection<BlogNode> connection={blogs}>
            {({node: blog}) => (
              <Link
                className="group border-2 border-ink bg-white p-5 no-underline"
                key={blog.handle}
                prefetch="intent"
                to={`/blogs/${blog.handle}`}
              >
                <span className="sign-type text-base group-hover:text-signage">
                  {blog.title}
                </span>
                <span className="label-type mt-2 block text-ink/40">
                  READ THE BOARD →
                </span>
              </Link>
            )}
          </PaginatedResourceSection>
        </div>
      ) : (
        <div className="mt-10 border-2 border-ink bg-white p-8 text-center">
          <p className="sign-type text-lg">THE BOARD IS EMPTY.</p>
          <p className="mt-2 text-sm text-ink/60">
            Nothing pinned up yet. Check back — or don&apos;t. The shelf is
            stocked either way.
          </p>
          <Link className="btn mt-5" prefetch="intent" to="/collections/all">
            WALK THE AISLE
          </Link>
        </div>
      )}
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
` as const;
