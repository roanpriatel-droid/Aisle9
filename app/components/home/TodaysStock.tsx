import {Suspense} from 'react';
import {Await, Link, NavLink} from 'react-router';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {COLLECTIONS, NAV} from '~/lib/brand';

const DEPARTMENT_TABS = [
  {title: 'ALL DEPARTMENTS', to: COLLECTIONS.shopAll, current: true},
  {title: 'BEST SELLERS', to: COLLECTIONS.bestSellers, current: false},
  {title: 'NEW STOCK', to: COLLECTIONS.newStock, current: false},
];

/**
 * "TODAY'S STOCK" — the shelf. Filter tabs styled as hanging department
 * signs; cards are shelf talkers (see ProductItem).
 */
export function TodaysStock({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section
      aria-labelledby="todays-stock-heading"
      className="border-b-2 border-ink bg-linoleum"
    >
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="todays-stock-heading" className="sign-type text-3xl sm:text-4xl">
            TODAY&rsquo;S STOCK
          </h2>
          <Link
            className="label-type text-ink underline underline-offset-4 hover:text-signage"
            prefetch="intent"
            to={COLLECTIONS.shopAll}
          >
            VIEW ALL →
          </Link>
        </div>

        {/* Department signs. On the homepage these navigate to their aisle. */}
        <nav
          aria-label="Departments"
          className="mt-6 flex flex-wrap gap-2"
        >
          {DEPARTMENT_TABS.map((tab) => (
            <NavLink
              key={tab.title}
              prefetch="intent"
              to={tab.to}
              aria-current={tab.current ? 'true' : undefined}
              className={`label-type border-2 border-ink px-3 py-2 no-underline ${
                tab.current
                  ? 'bg-ink text-linoleum'
                  : 'bg-transparent text-ink hover:bg-fluorescent'
              }`}
            >
              {tab.title}
            </NavLink>
          ))}
        </nav>

        <Suspense
          fallback={<p className="label-type mt-8 text-ink/50">STOCKING SHELVES ...</p>}
        >
          <Await resolve={products}>
            {(response) => (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {response
                  ? response.products.nodes.map((product, i) => (
                      <ProductItem
                        key={product.id}
                        product={product}
                        loading={i < 4 ? 'eager' : 'lazy'}
                        badge={i < 2 ? 'JUST SHELVED' : undefined}
                      />
                    ))
                  : null}
              </div>
            )}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}
