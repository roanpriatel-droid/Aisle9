import {LADDER} from '~/lib/brand';

/**
 * Slim bulk-deal reminder posted at the top of shopping pages —
 * the shelf-edge version of the warehouse sign.
 */
export function DealStrip() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-2 border-ink bg-fluorescent px-4 py-2.5">
      <span className="label-type text-signage">BUY MORE, PAY LESS</span>
      <span className="label-type text-ink">
        {LADDER.filter((t) => t.discountPct > 0)
          .map((t) => `${t.qty} TEES −${t.discountPct}%`)
          .join(' · ')}
      </span>
      <span className="label-type text-ink/50">AUTO AT CHECKOUT</span>
    </div>
  );
}
