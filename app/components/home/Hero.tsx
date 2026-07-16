import {Link} from 'react-router';
import {AisleMarker} from '~/components/brand/AisleMarker';
import {COLLECTIONS} from '~/lib/brand';

/**
 * Full-width hero. Linoleum floor, hanging aisle marker, deadpan copy.
 * Opening-week framing only — no invented social proof.
 */
export function Hero() {
  return (
    <section className="border-b-2 border-ink bg-linoleum">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-14 text-center">
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
          <Link className="btn" prefetch="intent" to={COLLECTIONS.bestSellers}>
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
    </section>
  );
}
