import {Link} from 'react-router';
import type {Route} from './+types/collections._index';
import {ALL_AISLES} from '~/lib/brand';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'AISLE 9 — DEPARTMENTS'},
    {
      name: 'description',
      content:
        'Every department at AISLE 9: nine themed aisles of deadpan graphic tees plus best sellers, new arrivals and matching sets. Every shirt $36.',
    },
    {tagName: 'link', rel: 'canonical', href: '/collections'},
  ];
};

/**
 * The overhead directory: all 13 numbered aisles in store order, straight from
 * the brand directory (the same list as the nav, footer and breadcrumbs), so it
 * never shows Shopify's internal collections or an arbitrary sort.
 */
export default function Collections() {
  return (
    <div className="collections">
      <p className="label-type text-ink/50">OVERHEAD DIRECTORY</p>
      <h1>DEPARTMENTS</h1>
      <p className="collection-description">
        Every aisle in the store. There is currently one store.
      </p>
      <ul className="collections-grid">
        {ALL_AISLES.map((aisle) => (
          <li key={aisle.handle}>
            <Link
              className="collection-item group flex h-full flex-col gap-2 border-2 border-ink bg-white px-4 py-4 no-underline"
              prefetch="intent"
              to={`/collections/${aisle.handle}`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="sign-type flex h-9 w-9 shrink-0 items-center justify-center bg-signage text-base text-white"
                  >
                    {aisle.n}
                  </span>
                  <span className="sign-type text-sm group-hover:text-signage">
                    <span className="sr-only">Aisle {aisle.n}: </span>
                    {aisle.title}
                  </span>
                </span>
                <span className="label-type text-ink/40">
                  {aisle.kind === 'aisle' ? 'AISLE' : 'DEPT'} →
                </span>
              </span>
              <span className="text-sm text-ink/70">{aisle.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
