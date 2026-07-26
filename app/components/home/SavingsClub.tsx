import {useFetcher} from 'react-router';
import {SAVINGS_CLUB} from '~/lib/brand';

/**
 * SAVINGS CLUB — email capture styled as a supermarket loyalty-card
 * application. Left: the pitch + enrollment form. Right: a mock membership
 * card. The joke stays deadpan — the club saves you nothing; the 10% first
 * order is stated as the one real benefit so it isn't a lie.
 *
 * Posts to the homepage action (intent "savings-club"), which is a STUB until
 * the store's email platform is wired. See README launch checklist.
 */
export function SavingsClub() {
  const fetcher = useFetcher<{ok: boolean}>();
  const confirmed = fetcher.data?.ok;

  return (
    <section aria-labelledby="savings-club-heading" className="bg-ink">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="label-type text-linoleum/50">{SAVINGS_CLUB.eyebrow}</p>
          <h2
            id="savings-club-heading"
            className="sign-type mt-2 text-4xl text-linoleum sm:text-5xl"
          >
            {SAVINGS_CLUB.heading}
          </h2>
          <p className="sign-type mt-2 text-xl text-signage">
            {SAVINGS_CLUB.motto}
          </p>
          <p className="mt-4 max-w-md text-sm text-linoleum/70">
            {SAVINGS_CLUB.sub}
          </p>

          <ul className="mt-5 flex flex-col gap-1.5">
            {SAVINGS_CLUB.perks.map((perk) => (
              <li key={perk} className="label-type text-linoleum/80">
                ✓ {perk}
              </li>
            ))}
          </ul>

          {confirmed ? (
            <p className="label-type mt-6 inline-block border-2 border-signage bg-signage px-4 py-3 text-white">
              {SAVINGS_CLUB.success}
            </p>
          ) : (
            <fetcher.Form method="post" className="mt-6 flex w-full max-w-md">
              <label className="sr-only" htmlFor="savings-club-email">
                Email address
              </label>
              <input
                className="w-full border-2 border-linoleum bg-linoleum px-3 py-3 text-sm text-ink placeholder:text-ink/50"
                id="savings-club-email"
                name="email"
                placeholder={SAVINGS_CLUB.placeholder}
                required
                type="email"
              />
              <button
                className="btn shrink-0 border-signage bg-signage text-white hover:border-linoleum hover:bg-linoleum hover:text-ink"
                disabled={fetcher.state !== 'idle'}
                name="intent"
                type="submit"
                value="savings-club"
              >
                {SAVINGS_CLUB.cta}
              </button>
            </fetcher.Form>
          )}

          <p className="mt-3 max-w-md text-xs text-linoleum/40">
            {SAVINGS_CLUB.finePrint}
          </p>
        </div>

        {/* Mock membership card */}
        <div className="hidden lg:block" aria-hidden>
          <div className="-rotate-2 border-2 border-linoleum bg-linoleum p-5 shadow-[8px_8px_0_rgba(204,34,41,1)]">
            <div className="flex items-center justify-between">
              <span className="sign-type text-lg text-ink">AISLE 9</span>
              <span className="label-type text-ink/50">SAVINGS CLUB</span>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="label-type text-ink/40">MEMBER</p>
                <p className="sign-type text-base text-ink">VALUED SHOPPER</p>
              </div>
              <span className="label-type text-ink/50">
                {SAVINGS_CLUB.cardHolder}
              </span>
            </div>
            {/* barcode */}
            <div className="mt-5 flex h-10 items-end gap-[2px]">
              {BARCODE.map((w, i) => (
                <span
                  key={i}
                  className="block h-full bg-ink"
                  style={{width: `${w}px`}}
                />
              ))}
            </div>
            <p className="label-type mt-2 text-center text-ink/40">
              0000 0000 0000 — SAVES NOTHING
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Static barcode bar widths — deterministic (no Math.random at module load). */
const BARCODE = [
  2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 1,
  3, 2, 4, 1, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1,
];
