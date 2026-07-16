import {Link} from 'react-router';
import type {Route} from './+types/pages.about';
import {BRAND, COLLECTIONS} from '~/lib/brand';
import {ClearanceSticker} from '~/components/brand/ClearanceSticker';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `${BRAND.name} — ABOUT THE STORE`},
    {
      name: 'description',
      content:
        'Aisle 9 is a store that does not exist, selling shirts that admit things. Printed on demand. Nothing you need.',
    },
  ];
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="label-type text-ink/50">STORE HISTORY</p>
      <h1 className="sign-type mt-2 text-4xl">ABOUT THE STORE</h1>

      <div className="mt-8 flex flex-col gap-5 text-ink/80">
        <p>
          Somewhere between the seasonal candy and the motor oil there is an
          aisle the planogram does not account for. It is lit like every other
          aisle. The floor is the same floor. Nothing on the shelf is
          essential, which is the point.
        </p>
        <p>
          AISLE 9 sells t-shirts that say true things in the most boring
          typeface we could justify. No mascots. No slogans that believe in
          you. Just admissions, printed in ink on cotton, priced to end in 9.
        </p>
        <p>
          Every shirt is printed when you order it — not before. This means no
          warehouse of regret, no landfill of unsold motivational apparel, and
          a short wait while your specific shirt is made because of a decision
          you specifically made.
        </p>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <div className="border-2 border-ink bg-white p-4">
          <h2 className="sign-type text-sm">PRINTED TO ORDER</h2>
          <p className="mt-1.5 text-xs text-ink/60">
            Made when you buy it. Ships in 5–7 business days.
          </p>
        </div>
        <div className="border-2 border-ink bg-white p-4">
          <h2 className="sign-type text-sm">PRICED IN 9s</h2>
          <p className="mt-1.5 text-xs text-ink/60">
            Every price ends in 9. Store policy. Nobody remembers why.
          </p>
        </div>
        <div className="border-2 border-ink bg-white p-4">
          <h2 className="sign-type text-sm">BULK LADDER</h2>
          <p className="mt-1.5 text-xs text-ink/60">
            2 tees save 10%. 3 save 20%. 4 save 30%. Applies itself.
          </p>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-6 border-2 border-ink bg-fluorescent p-6">
        <ClearanceSticker topLine="EST." bigLine="AISLE 9" />
        <p className="text-sm text-ink/70">
          The store is not real. The shirts are. That distinction is the whole
          business model.
        </p>
      </div>

      <div className="mt-10">
        <Link className="btn" prefetch="intent" to={COLLECTIONS.shopAll}>
          WALK THE AISLE
        </Link>
      </div>
    </div>
  );
}
