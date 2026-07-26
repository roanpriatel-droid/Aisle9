import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {ProductGridSkeleton} from '~/components/Skeletons';
import {COLLECTIONS, VOICE} from '~/lib/brand';
import type {ShelfData} from '~/lib/shelf';

/**
 * BEST SELLERS row. Products come from the best-sellers collection, falling
 * back to new-arrivals, then the catalog (see the homepage loader). When the
 * fallback fires we say so plainly rather than mislabel the shelf.
 */
export function BestSellersRow({shelf}: {shelf: Promise<ShelfData | null>}) {
  return (
    <section
      aria-labelledby="best-sellers-heading"
      className="border-b-2 border-ink bg-linoleum"
    >
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-type text-ink/50">MOVING OFF THE SHELF</p>
            <h2
              id="best-sellers-heading"
              className="sign-type mt-1 text-3xl sm:text-4xl"
            >
              BEST SELLERS
            </h2>
          </div>
          <Link
            className="label-type text-ink underline underline-offset-4 hover:text-signage"
            prefetch="intent"
            to={COLLECTIONS.bestSellers}
          >
            VIEW ALL →
          </Link>
        </div>

        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <Await resolve={shelf} errorElement={<ShelfEmpty />}>
            {(data) => {
              const products = data?.products ?? [];
              if (!products.length) return <ShelfEmpty />;
              return (
                <>
                  {data && data.source !== 'best-sellers' && (
                    <p className="label-type mt-4 text-ink/50">
                      {data.source === 'new-arrivals'
                        ? 'BEST SELLERS PENDING · SHOWING NEW ARRIVALS'
                        : 'BEST SELLERS PENDING · SHOWING FRESH STOCK'}
                    </p>
                  )}
                  <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {products.slice(0, 8).map((product, i) => (
                      <ProductItem
                        key={product.id}
                        product={product}
                        loading={i < 4 ? 'eager' : 'lazy'}
                        badge={i < 2 ? 'TOP SELLER' : undefined}
                      />
                    ))}
                  </div>
                </>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

function ShelfEmpty() {
  return (
    <div className="mt-8 border-2 border-ink bg-white p-8 text-center">
      <p className="sign-type text-lg">{VOICE.outOfStockHeading}</p>
      <p className="mt-2 text-sm text-ink/60">{VOICE.outOfStockBody}</p>
      <Link className="btn mt-5" prefetch="intent" to={COLLECTIONS.shopAll}>
        BROWSE ALL PRODUCTS
      </Link>
    </div>
  );
}
