import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {AisleMarker} from '~/components/brand/AisleMarker';
import {COLLECTIONS} from '~/lib/brand';

/**
 * Hero: aisle sign + deadpan pitch on the left, actual product on the shelf
 * to the right so there is merchandise above the fold. Opening-week framing
 * only — no invented social proof.
 */
export function Hero({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section className="border-b-2 border-ink bg-linoleum">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <AisleMarker variant="hero" />

          <h1 className="sign-type mt-10 text-4xl text-ink sm:text-5xl">
            NOTHING YOU NEED.
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink/70 sm:text-lg">
            Deadpan graphic tees, printed on demand and restocked out of
            obligation.
          </p>

          <p className="label-type mt-6 text-ink/50">
            NOW OPEN · NEW STOCK WEEKLY · EVERY PRICE ENDS IN 9
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="btn"
              prefetch="intent"
              to={COLLECTIONS.bestSellers}
            >
              SHOP BEST SELLERS
            </Link>
            <Link
              className="btn btn-outline"
              prefetch="intent"
              to={COLLECTIONS.newStock}
            >
              NEW STOCK
            </Link>
          </div>
        </div>

        <HeroShelf products={products} />
      </div>
    </section>
  );
}

/** First item off the newest stock, staged like an endcap display. */
function HeroShelf({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className="hidden pt-10 lg:block">
      <Suspense fallback={<HeroShelfFrame />}>
        <Await resolve={products} errorElement={<HeroShelfFrame />}>
          {(response) => {
            const product = response?.products.nodes[0];
            if (!product?.featuredImage) return <HeroShelfFrame />;
            return (
              <Link
                className="group block no-underline"
                prefetch="intent"
                to={`/products/${product.handle}`}
              >
                <div className="border-2 border-ink bg-white">
                  <div className="flex items-center justify-between border-b-2 border-ink bg-fluorescent px-4 py-2">
                    <span className="label-type text-ink/60">
                      ENDCAP DISPLAY
                    </span>
                    <span className="label-type bg-signage px-2 py-1 text-white">
                      JUST SHELVED
                    </span>
                  </div>
                  <Image
                    alt={product.featuredImage.altText || product.title}
                    aspectRatio="1/1"
                    data={product.featuredImage}
                    loading="eager"
                    sizes="(min-width: 64em) 480px, 0px"
                  />
                  <div className="flex items-center justify-between border-t-2 border-ink px-4 py-3">
                    <span className="sign-type text-sm group-hover:text-signage">
                      {product.title}
                    </span>
                    <span className="label-type text-signage">
                      HAVE A LOOK →
                    </span>
                  </div>
                </div>
              </Link>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}

/** Empty shelf frame while stock loads (or if the query fails). */
function HeroShelfFrame() {
  return (
    <div className="flex aspect-square items-center justify-center border-2 border-ink bg-fluorescent">
      <span className="label-type text-ink/40">RESTOCKING ...</span>
    </div>
  );
}
