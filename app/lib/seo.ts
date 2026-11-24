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

type SeoInput = {
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
  const desc = clamp(description || DEFAULT_DESCRIPTION, 160);
  return [
    {title: fullTitleText},
    {name: 'description', content: desc},
    {property: 'og:site_name', content: SITE_NAME},
    {property: 'og:title', content: fullTitleText},
    {property: 'og:description', content: desc},
    {property: 'og:type', content: type},
    ...(image ? [{property: 'og:image', content: image}] : []),
    ...(image && imageAlt
      ? [{property: 'og:image:alt', content: imageAlt}]
      : []),
    {name: 'twitter:card', content: image ? 'summary_large_image' : 'summary'},
    {name: 'twitter:title', content: fullTitleText},
    {name: 'twitter:description', content: desc},
    ...(noindex ? [{name: 'robots', content: 'noindex,follow'}] : []),
    ...(path ? [{tagName: 'link', rel: 'canonical', href: path}] : []),
  ];
}
