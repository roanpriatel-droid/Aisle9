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
            description:
              'AISLE 9 sells deadpan funny graphic t-shirts, printed to order in the USA. Every shirt is $36; buy 2 save 10%, 3 save 20%, 4+ save 30%.',
            logo: `${origin}/favicon.svg`,
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              email: 'aisle9@stratosync.solutions',
              availableLanguage: 'English',
            },
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              applicableCountry: 'US',
              returnPolicyCategory:
                'https://schema.org/MerchantReturnFiniteReturnWindow',
              merchantReturnDays: 30,
              returnMethod: 'https://schema.org/ReturnByMail',
              merchantReturnLink: `${origin}/policies/refund-policy`,
            },
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingDestination: {
                '@type': 'DefinedRegion',
                addressCountry: 'US',
              },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 2,
                  maxValue: 10,
                  unitCode: 'DAY',
                },
                transitTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 2,
                  maxValue: 5,
                  unitCode: 'DAY',
                },
              },
            },
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

/**
 * CollectionPage + ItemList for a product listing — the products shown on the
 * page, in order, as absolute product URLs.
 */
export function ItemListJsonLd({
  name,
  path,
  handles,
}: {
  name: string;
  path: string;
  handles: string[];
}) {
  const origin = useOrigin();
  if (!handles.length) return null;
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name,
        url: `${origin}${path}`,
        isPartOf: {'@id': `${origin}/#site`},
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: handles.length,
          itemListElement: handles.map((handle, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${origin}/products/${handle}`,
          })),
        },
      }}
    />
  );
}
