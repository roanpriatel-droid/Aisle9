import {Link} from 'react-router';
import {ALL_AISLES} from '~/lib/brand';

/**
 * AISLE MAP — the store directory demoted from a 13-row wall to a compact
 * numbered-chip strip. A light, scannable band: a design flourish, not the
 * main event (the mega-menu handles real navigation).
 */
export function AisleMapStrip() {
  return (
    <section
      aria-labelledby="aisle-map-heading"
      className="border-b-2 border-ink bg-linoleum"
    >
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label-type text-ink/50">STORE DIRECTORY</p>
            <h2
              id="aisle-map-heading"
              className="sign-type text-2xl sm:text-3xl"
            >
              FIND YOUR AISLE
            </h2>
          </div>
          <Link
            className="label-type text-ink underline underline-offset-4 hover:text-signage"
            prefetch="intent"
            to="/collections"
          >
            ALL DEPARTMENTS →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_AISLES.map((a) => (
            <Link
              key={a.handle}
              className="aisle-chip"
              prefetch="intent"
              to={`/collections/${a.handle}`}
            >
              <span
                className={`aisle-chip-num${a.kind === 'department' ? ' is-dept' : ''}`}
              >
                {a.n}
              </span>
              <span className="aisle-chip-label">{a.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
