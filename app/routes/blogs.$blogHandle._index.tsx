import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle._index';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {BRAND} from '~/lib/brand';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `${BRAND.name} — ${data?.blog.title ?? 'BULLETIN BOARD'}`}];
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
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Blog() {
  const {blog} = useLoaderData<typeof loader>();
  const {articles} = blog;
  const hasArticles = articles.nodes.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="label-type text-ink/50">
        <Link className="text-ink/50 hover:text-signage" to="/blogs">
          BULLETIN BOARD
        </Link>{' '}
        / {blog.title}
      </p>
      <h1 className="sign-type mt-2 text-4xl">{blog.title}</h1>

      {hasArticles ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <PaginatedResourceSection<ArticleItemFragment> connection={articles}>
            {({node: article, index}) => (
              <ArticleItem
                article={article}
                key={article.id}
                loading={index < 2 ? 'eager' : 'lazy'}
              />
            )}
          </PaginatedResourceSection>
        </div>
      ) : (
        <div className="mt-10 border-2 border-ink bg-white p-8 text-center">
          <p className="sign-type text-lg">NOTHING POSTED HERE YET.</p>
          <p className="mt-2 text-sm text-ink/60">
            This board is up but bare. Come back when there&apos;s something
            worth reading.
          </p>
          <Link className="btn mt-5" prefetch="intent" to="/collections/all">
            WALK THE AISLE
          </Link>
        </div>
      )}
    </div>
  );
}

function ArticleItem({
  article,
  loading,
}: {
  article: ArticleItemFragment;
  loading?: HTMLImageElement['loading'];
}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt!));
  return (
    <Link
      className="group block border-2 border-ink bg-white no-underline"
      key={article.id}
      prefetch="intent"
      to={`/blogs/${article.blog.handle}/${article.handle}`}
    >
      {article.image && (
        <div className="border-b-2 border-ink">
          <Image
            alt={article.image.altText || article.title}
            aspectRatio="3/2"
            data={article.image}
            loading={loading}
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      )}
      <div className="p-4">
        <span className="label-type text-ink/40">{publishedAt}</span>
        <h3 className="sign-type mt-1.5 text-base group-hover:text-signage">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          hasNextPage
          endCursor
          startCursor
        }

      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog {
      handle
    }
  }
` as const;
