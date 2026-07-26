import type {Route} from './+types/[sitemap-pages.xml]';
import {ALL_AISLES} from '~/lib/brand';

/**
 * Supplemental sitemap for app-managed routes that aren't Shopify resources
 * (the standalone pages + the aisle collections). Referenced from robots.txt
 * alongside Hydrogen's resource sitemap so every real route is discoverable.
 */
export function loader({request}: Route.LoaderArgs) {
  const origin = new URL(request.url).origin;

  const staticPaths = [
    '/',
    '/collections',
    '/pages/weekly-circular',
    '/pages/about',
    '/pages/faq',
    '/pages/shipping',
    '/pages/size-guide',
    '/pages/contact',
    '/pages/careers',
    '/search',
  ];

  const collectionPaths = ALL_AISLES.map((a) => `/collections/${a.handle}`);
  const paths = [...staticPaths, ...collectionPaths];

  const urls = paths
    .map(
      (p) =>
        `  <url><loc>${origin}${p}</loc><changefreq>weekly</changefreq></url>`,
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}
