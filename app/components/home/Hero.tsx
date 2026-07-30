import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {COLLECTIONS} from '~/lib/brand';
import type {ShelfData} from '~/lib/shelf';

/**
 * Hero — "THE ENTRANCE". The homepage first-screen is the store's automatic
 * doors: a lit marquee sign, then two frosted doors that slide apart on load to
 * reveal a wall of real best-selling shirts, over a bold copy band. Deadpan,
 * institutional, in-palette — you're literally walking into Aisle 9.
 */
export function Hero({shelf}: {shelf: Promise<ShelfData | null>}) {
  return (
    <section className="hero-entrance border-b-2 border-ink">
      {/* Lit storefront marquee */}
      <div className="entrance-sign" aria-hidden>
        <span className="entrance-sign-dot" />
        <div className="entrance-sign-track">
          <span className="entrance-sign-text">
            AISLE 9 · NOW OPEN · NOTHING YOU NEED · EVERY SHIRT $36 · NEW STOCK
            WEEKLY · WELCOME, ALLEGEDLY ·&nbsp;
          </span>
          <span className="entrance-sign-text">
            AISLE 9 · NOW OPEN · NOTHING YOU NEED · EVERY SHIRT $36 · NEW STOCK
            WEEKLY · WELCOME, ALLEGEDLY ·&nbsp;
          </span>
        </div>
      </div>

      {/* Door frame — product wall behind, doors slide apart to reveal it */}
      <div className="entrance-frame">
        <span className="entrance-fluoro" aria-hidden />
        <Suspense fallback={<WallFallback />}>
          <Await resolve={shelf} errorElement={<WallFallback />}>
            {(data) => <ProductWall products={data?.products ?? []} />}
          </Await>
        </Suspense>

        <div className="entrance-door entrance-door-left" aria-hidden>
          <DoorFace />
        </div>
        <div className="entrance-door entrance-door-right" aria-hidden>
          <DoorFace />
        </div>
      </div>

      {/* Copy band — the welcome sign under the doorway */}
      <div className="entrance-copy">
        <div className="mx-auto max-w-4xl px-4 py-10 text-center sm:py-12">
          <span className="entrance-open-chip">● NOW OPEN · 24 HRS</span>
          <h1 className="headline-xl mt-5 text-linoleum">NOTHING YOU NEED.</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-linoleum/70 sm:text-lg">
            Deadpan graphic tees, printed on demand and restocked out of
            obligation. Every shirt is $36.
          </p>
          <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
            <Link
              className="btn btn-invert"
              prefetch="intent"
              to={COLLECTIONS.shopAll}
            >
              ENTER THE STORE
            </Link>
            <Link
              className="btn btn-ghost-light"
              prefetch="intent"
              to="/pages/weekly-circular"
            >
              THIS WEEK’S CIRCULAR
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Number of small square tiles in the wall (cycled from available products). */
const WALL_TILES = 54;

/**
 * The wall of shirts revealed behind the doors — many small SQUARE tiles so the
 * (square) product images stay crisp and undistorted, and the grid fills densely
 * regardless of how many products came back (tiles cycle through them).
 */
function ProductWall({products}: {products: ShelfData['products']}) {
  const src = products.filter((p) => p.featuredImage);
  if (src.length === 0) return <WallFallback />;
  const tiles = Array.from({length: WALL_TILES}, (_, i) => src[i % src.length]);
  return (
    <div className="entrance-wall">
      {tiles.map((p, i) => (
        <Link
          key={i}
          to={`/products/${p.handle}`}
          prefetch="intent"
          className="entrance-wall-cell"
          aria-label={p.title}
          tabIndex={-1}
        >
          <Image
            alt=""
            aspectRatio="1/1"
            data={p.featuredImage!}
            loading={i < 12 ? 'eager' : 'lazy'}
            sizes="130px"
          />
        </Link>
      ))}
    </div>
  );
}

/** Frosted-cell placeholder wall while stock streams in. */
function WallFallback() {
  return (
    <div className="entrance-wall entrance-wall-fallback" aria-hidden>
      {Array.from({length: WALL_TILES}).map((_, i) => (
        <span key={i} className="entrance-wall-cell" />
      ))}
    </div>
  );
}

/** One automatic-door face: frosted panel, decals, handle rail, hazard stripe. */
function DoorFace() {
  return (
    <>
      <span className="door-decal-top">AUTOMATIC</span>
      <span className="door-open">OPEN</span>
      <span className="door-decal-bottom">DO NOT FORCE</span>
      <span className="door-handle" aria-hidden />
      <span className="door-hazard" aria-hidden />
    </>
  );
}
