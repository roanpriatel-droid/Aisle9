import {BRAND} from '~/lib/brand';

/**
 * "SEEN IN STORE" — UGC grid.
 * Placeholder tiles until real customer photos exist. Swap PLACEHOLDER_TILES
 * for an embed (or static images in app/assets/ugc/) once photos come in.
 */

const PLACEHOLDER_TILES = 6;

export function SeenInStore() {
  return (
    <section
      aria-labelledby="seen-in-store-heading"
      className="border-b-2 border-ink bg-linoleum"
    >
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="label-type text-ink/50">SECURITY FOOTAGE, BASICALLY</p>
        <h2 id="seen-in-store-heading" className="sign-type mt-2 text-3xl sm:text-4xl">
          SEEN IN STORE
        </h2>
        <p className="mt-3 max-w-xl text-sm text-ink/70">
          Tag <span className="font-bold">{BRAND.social}</span> wearing yours.
          Get featured on the shelf and 10% off your next order.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({length: PLACEHOLDER_TILES}).map((_, i) => (
            <div
              key={i}
              aria-hidden
              className="flex aspect-square flex-col items-center justify-center gap-2 border-2 border-dashed border-ink/30 bg-fluorescent"
            >
              <span className="label-type text-ink/40">PHOTO</span>
              <span className="label-type text-ink/40">PENDING</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
