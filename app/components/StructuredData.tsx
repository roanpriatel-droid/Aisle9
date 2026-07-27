import {useRouteLoaderData} from 'react-router';

/** Absolute site origin from the root loader (empty string during SSR fallback). */
function useOrigin(): string {
  const root = useRouteLoaderData('root') as {origin?: string} | undefined;
  return root?.origin ?? '';
}

function JsonLd({data}: {data: unknown}) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  );
}

/**
 * Sitewide Organization + WebSite structured data. The WebSite SearchAction
 * enables Google's sitelinks search box pointing at /search.
 */
export function SiteJsonLd() {
  const origin = useOrigin();
  const base = origin || '/';
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${origin}/#org`,
            name: 'AISLE 9',
            url: base,
            slogan: 'NOTHING YOU NEED.',
          },
          {
            '@type': 'WebSite',
            '@id': `${origin}/#site`,
            name: 'AISLE 9',
            url: base,
            publisher: {'@id': `${origin}/#org`},
            potentialAction: {
              '@type': 'SearchAction',
              target: `${origin}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
        ],
      }}
    />
  );
}

/** BreadcrumbList structured data. `items` are {name, path} in order. */
export function BreadcrumbJsonLd({
  items,
}: {
  items: {name: string; path: string}[];
}) {
  const origin = useOrigin();
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: it.name,
          item: `${origin}${it.path}`,
        })),
      }}
    />
  );
}
