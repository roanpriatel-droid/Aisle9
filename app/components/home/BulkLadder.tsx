import {BASE_PRICE, LADDER, ladderMath} from '~/lib/brand';

const money = (n: number) =>
  n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;

/**
 * BUY MORE, PAY LESS — the warehouse-club sign. Highest-priority section.
 *
 * UI only: checkout is honored by a Shopify automatic discount (quantity
 * tiers, mix and match) configured in the store admin. Until that discount
 * exists, checkout will NOT apply these prices — see README launch checklist.
 */
export function BulkLadder() {
  return (
    <section
      aria-labelledby="bulk-ladder-heading"
      className="border-b-2 border-ink bg-ink"
    >
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="label-type text-linoleum/50">WAREHOUSE PRICING</p>
        <h2
          id="bulk-ladder-heading"
          className="sign-type mt-2 text-4xl text-linoleum sm:text-5xl"
        >
          BUY MORE, PAY LESS.
        </h2>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LADDER.map((tier) => {
            const {perShirt, total, saved} = ladderMath(tier);
            const best = 'bestDeal' in tier && tier.bestDeal;
            return (
              <div
                key={tier.qty}
                className={`relative flex flex-col border-2 p-5 ${
                  best
                    ? 'border-signage bg-signage text-white'
                    : 'border-linoleum/30 bg-ink text-linoleum'
                }`}
              >
                {best && (
                  <span className="label-type absolute -top-3 left-4 bg-tag px-2 py-1 text-signage">
                    BEST DEAL
                  </span>
                )}
                <span className="sign-type text-6xl">{tier.qty}</span>
                <span className="label-type mt-1 opacity-70">
                  {tier.qty === 1 ? 'TEE' : 'TEES'}
                </span>

                <div className="mt-6 flex flex-col gap-1.5 border-t-2 border-current/30 pt-4">
                  <span className="sign-type text-2xl">
                    {money(perShirt)}
                    <span className="label-type opacity-70"> / SHIRT</span>
                  </span>
                  <span className="label-type opacity-70">
                    {tier.discountPct > 0
                      ? `${tier.discountPct}% OFF · TOTAL ${money(total)}`
                      : `LIST PRICE · TOTAL ${money(total)}`}
                  </span>
                  <span className="label-type">
                    {saved > 0 ? `YOU SAVE ${money(saved)}` : ' '}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="label-type mt-8 text-linoleum/50">
          APPLIES AUTOMATICALLY AT CHECKOUT · MIX AND MATCH ANY DESIGNS · NO
          CODE · BASE PRICE {money(BASE_PRICE)}
        </p>
      </div>
    </section>
  );
}
