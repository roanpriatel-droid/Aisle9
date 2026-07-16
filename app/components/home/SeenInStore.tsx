import {BRAND} from '~/lib/brand';
import {ClearanceSticker} from '~/components/brand/ClearanceSticker';

/**
 * "SEEN IN STORE" — UGC program, designed as in-store signage.
 * No customer photos exist yet, so this is a full CTA band rather than an
 * empty grid. When real photos come in, add a photo strip above the band
 * (do not fabricate customers in the meantime).
 */
export function SeenInStore() {
  return (
    <section
      aria-labelledby="seen-in-store-heading"
      className="border-b-2 border-ink bg-linoleum"
    >
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="relative border-2 border-ink bg-white">
          <div className="grid gap-0 sm:grid-cols-[1fr_auto]">
            <div className="p-8 sm:p-10">
              <p className="label-type text-ink/50">
                SECURITY FOOTAGE, BASICALLY
              </p>
              <h2
                id="seen-in-store-heading"
                className="sign-type mt-2 text-3xl sm:text-4xl"
              >
                SEEN IN STORE
              </h2>
              <p className="mt-4 max-w-lg text-sm text-ink/70">
                Wear the shirt. Photograph the shirt. Tag{' '}
                <span className="font-bold">{BRAND.social}</span> and the shirt
                gets featured here, on the official shelf of people who
                bought something they did not need.
              </p>
              <p className="sign-type mt-6 text-lg">
                TAG {BRAND.social} → GET FEATURED → 10% OFF YOUR NEXT ORDER
              </p>
            </div>
            <div className="flex items-center justify-center border-t-2 border-ink bg-fluorescent p-8 sm:border-l-2 sm:border-t-0">
              <ClearanceSticker topLine="REWARD" bigLine="10% OFF" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
