/**
 * One place for page-level SEO tags, so every route ships the same complete
 * set: <title>, description, canonical, Open Graph, Twitter.
 *
 * Titles follow "<Page> | AISLE 9" (keyword first, brand last). Pass a fully
 * formed `title` when Shopify's SEO title field is set — it is used verbatim.
 */
export const SITE_NAME = 'AISLE 9';
export const DEFAULT_DESCRIPTION =
  'Funny t-shirts and deadpan graphic tees from a big-box store that does not exist. Every shirt $36, printed to order. Buy 2 save 10%, 4+ save 30%.';

/** Root-loader origin from meta() `matches`, for absolute social URLs. */
type MetaMatches = ReadonlyArray<{id?: string; data?: unknown} | undefined>;
function originFrom(matches?: MetaMatches): string {
  const root = matches?.find((m) => m?.id === 'root')?.data as
    {origin?: string} | undefined;
  return root?.origin ?? '';
}

export const DEFAULT_OG_IMAGE = '/og-image.png';

type SeoInput = {
  /** meta() matches — lets social tags use absolute URLs. */
  matches?: MetaMatches;
  /** Page name ("Down Bad Shirts") — combined with the brand unless `fullTitle`. */
  title: string;
  /** When true, `title` is used as-is (e.g. Shopify's SEO title). */
  fullTitle?: boolean;
  description?: string | null;
  /** Path for the canonical URL, without query string. */
  path?: string;
  image?: string | null;
  imageAlt?: string | null;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
};

function clamp(text: string, max: number) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

export function seoMeta({
  matches,
  title,
  fullTitle,
  description,
  path,
  image,
  imageAlt,
  type = 'website',
  noindex,
}: SeoInput) {
  const fullTitleText = fullTitle ? title : `${title} | ${SITE_NAME}`;
  const origin = originFrom(matches);
  const abs = (u: string) => (/^https?:/i.test(u) ? u : `${origin}${u}`);
  const shareImage = abs(image || DEFAULT_OG_IMAGE);
  const shareAlt = image ? imageAlt : 'AISLE 9 — Nothing you need.';
  const desc = clamp(description || DEFAULT_DESCRIPTION, 160);
  return [
    {title: fullTitleText},
    {name: 'description', content: desc},
    {property: 'og:site_name', content: SITE_NAME},
    {property: 'og:title', content: fullTitleText},
    {property: 'og:description', content: desc},
    {property: 'og:type', content: type},
    {property: 'og:image', content: shareImage},
    ...(shareAlt ? [{property: 'og:image:alt', content: shareAlt}] : []),
    ...(origin && path ? [{property: 'og:url', content: abs(path)}] : []),
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:image', content: shareImage},
    {name: 'twitter:title', content: fullTitleText},
    {name: 'twitter:description', content: desc},
    ...(noindex ? [{name: 'robots', content: 'noindex,follow'}] : []),
    ...(path ? [{tagName: 'link', rel: 'canonical', href: abs(path)}] : []),
  ];
}
