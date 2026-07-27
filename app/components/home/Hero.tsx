import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {AisleMarker} from '~/components/brand/AisleMarker';
import {COLLECTIONS} from '~/lib/brand';
import type {ShelfData} from '~/lib/shelf';

/**
 * Hero — the storefront gateway. An overhead fluorescent tube over a
 * linoleum-speckled stage: the giant hanging aisle sign, the value line at
 * display scale, two CTAs, and a real "endcap" product that shows on every
 * breakpoint (not hidden on mobile). Opening-week framing only — no invented
 * social proof.
 */
export function Hero({shelf}: {shelf: Promise<ShelfData | null>}) {
  return (
    <section className="hero-stage linoleum-speckle border-b-2 border-ink">
      <div className="fluoro-bar" />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pt-16">
        {/* Marquee sign + value line */}
        <div className="flex flex-col items-center text-center">
          <AisleMarker variant="hero" />
          <h1 className="headline-xl mt-10 text-ink">NOTHING YOU NEED.</h1>
          <p className="mt-5 max-w-xl text-base text-ink/70 sm:text-lg">
            Deadpan graphic tees, printed on demand and restocked out of
            obligation. Every shirt is $36.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link className="btn" prefetch="intent" to={COLLECTIONS.bestSellers}>
              SHOP BEST SELLERS
            </Link>
            <Link
              className="btn btn-outline"
              prefetch="intent"
              to="/pages/weekly-circular"
            >
              THIS WEEK’S CIRCULAR
            </Link>
          </div>
        </div>

        {/* Endcap — one real product, staged, visible on all breakpoints */}
        <div className="mt-14">
          <div className="mb-2 flex items-end justify-between">
            <span className="label-type text-ink/50">ENDCAP DISPLAY</span>
            <Link
              className="label-type text-ink underline underline-offset-4 hover:text-signage"
              prefetch="intent"
              to={COLLECTIONS.shopAll}
            >
              WALK THE AISLE →
            </Link>
          </div>
          <Suspense fallback={<EndcapFrame />}>
            <Await resolve={shelf} errorElement={<EndcapFrame />}>
              {(data) => {
                const product = data?.products?.[0];
                if (!product?.featuredImage) return <EndcapFrame />;
                return (
                  <Link
                    className="group grid items-stretch border-2 border-ink bg-white no-underline md:grid-cols-2"
                    prefetch="intent"
                    to={`/products/${product.handle}`}
                  >
                    <div className="shelf-rail border-b-2 border-ink md:border-b-0 md:border-r-2">
                      <Image
                        alt={product.featuredImage.altText || product.title}
                        aspectRatio="1/1"
                        data={product.featuredImage}
                        loading="eager"
                        sizes="(min-width: 48em) 560px, 100vw"
                      />
                    </div>
                    <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
                      <span className="label-type bg-signage px-2 py-1 text-white w-fit">
                        JUST SHELVED
                      </span>
                      <h2 className="sign-type line-clamp-3 text-3xl group-hover:text-signage sm:text-4xl">
                        {product.title}
                      </h2>
                      <span className="flex items-baseline gap-2 text-2xl font-bold">
                        {formatPrice(product.priceRange.minVariantPrice)}
                        <span className="label-type text-ink/40">EACH</span>
                      </span>
                      <span className="label-type text-ink/50">
                        PICK A SIZE — THE BULK LADDER DOES THE REST →
                      </span>
                    </div>
                  </Link>
                );
              }}
            </Await>
          </Suspense>
        </div>
      </div>
    </section>
  );
}

function formatPrice(m: {amount: string; currencyCode: string}) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: m.currencyCode,
    }).format(Number(m.amount));
  } catch {
    return `${m.amount} ${m.currencyCode}`;
  }
}

/**
 * Endcap placeholder while stock streams in (or if the query fails). Mirrors the
 * loaded endcap's exact box model — a 2-col grid with a square image cell — so
 * there's no layout shift (CLS) when the real product resolves.
 */
function EndcapFrame() {
  return (
    <div className="grid items-stretch border-2 border-ink bg-white md:grid-cols-2">
      <div className="flex aspect-square items-center justify-center border-b-2 border-ink bg-fluorescent md:border-b-0 md:border-r-2">
        <span className="label-type text-ink/40">RESTOCKING THE ENDCAP…</span>
      </div>
      <div className="min-h-[11rem] p-6 sm:p-10 md:min-h-0" aria-hidden />
    </div>
  );
}
