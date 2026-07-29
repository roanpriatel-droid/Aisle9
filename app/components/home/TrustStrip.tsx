import {POLICIES} from '~/lib/brand';

/**
 * Slim trust strip under the hero — the real store policies (returns, free
 * shipping, secure checkout, delivery) as an early credibility cue. No
 * fabricated stats; just the facts, stated deadpan.
 */
export function TrustStrip() {
  return (
    <section
      aria-label="Store guarantees"
      className="border-b-2 border-ink bg-ink"
    >
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-3">
        {POLICIES.map((p) => (
          <li
            key={p.title}
            className="label-type flex items-center gap-2 text-linoleum"
          >
            <span aria-hidden className="text-signage">
              ✓
            </span>
            {p.title}
          </li>
        ))}
      </ul>
    </section>
  );
}
