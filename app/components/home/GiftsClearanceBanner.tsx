import {Link} from 'react-router';
import {ClearanceSticker} from '~/components/brand/ClearanceSticker';
import {GIFTS_BANNER} from '~/lib/brand';

/**
 * GIFTS FOR IDIOTS — the clearance bin by the registers, rendered as a
 * clearance banner: signage-red field, a crooked price-gun sticker (the one
 * sanctioned use of tag yellow), deadpan pitch, one CTA into the collection.
 */
export function GiftsClearanceBanner() {
  return (
    <section aria-labelledby="gifts-heading" className="bg-signage">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <ClearanceSticker
            topLine={GIFTS_BANNER.aisleLabel}
            bigLine={GIFTS_BANNER.sticker}
            className="shrink-0"
          />
          <div>
            <p className="label-type text-white/70">CLEARANCE BIN</p>
            <h2
              id="gifts-heading"
              className="sign-type mt-1 text-3xl text-white sm:text-4xl"
            >
              {GIFTS_BANNER.heading}
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/80">
              {GIFTS_BANNER.sub}
            </p>
          </div>
        </div>
        <Link
          className="btn shrink-0 border-white bg-white text-ink hover:border-ink hover:bg-ink hover:text-white"
          prefetch="intent"
          to={`/collections/${GIFTS_BANNER.handle}`}
        >
          {GIFTS_BANNER.cta}
        </Link>
      </div>
    </section>
  );
}
