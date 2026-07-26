import {Link} from 'react-router';
import {ALL_AISLES} from '~/lib/brand';

/**
 * STORE DIRECTORY — the design centerpiece. All 13 collections rendered as the
 * numbered supermarket directory board bolted to the wall by the entrance: an
 * ink header plate, then every aisle as a numbered directory row. The signage
 * IS the design. Config-driven from ALL_AISLES — no query, never blocks.
 */
export function StoreDirectory() {
  return (
    <section
      aria-labelledby="directory-heading"
      className="border-b-2 border-ink bg-linoleum"
    >
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="border-2 border-ink bg-white">
          {/* Header plate */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink bg-ink px-4 py-3 sm:px-6">
            <h2
              id="directory-heading"
              className="sign-type text-2xl text-linoleum sm:text-3xl"
            >
              STORE DIRECTORY
            </h2>
            <span className="label-type text-linoleum/60">
              13 DEPARTMENTS · FIND YOUR REGRET
            </span>
          </div>

          {/* Numbered aisles — all 13 */}
          <ul className="grid grid-cols-1 md:grid-cols-2">
            {ALL_AISLES.map((aisle, i) => {
              const isLastOdd =
                i === ALL_AISLES.length - 1 && ALL_AISLES.length % 2 === 1;
              return (
                <li
                  key={aisle.handle}
                  className={`border-ink ${i % 2 === 0 ? 'md:border-r-2' : ''} ${
                    i < ALL_AISLES.length - (ALL_AISLES.length % 2 === 0 ? 2 : 1)
                      ? 'border-b-2'
                      : ''
                  } ${isLastOdd ? 'md:col-span-2 md:border-t-2' : ''}`}
                >
                  <Link
                    to={`/collections/${aisle.handle}`}
                    prefetch="intent"
                    className="group flex items-stretch no-underline"
                  >
                    <span
                      className={`flex w-14 shrink-0 items-center justify-center text-2xl font-bold text-white sm:w-16 ${
                        aisle.kind === 'department' ? 'bg-ink' : 'bg-signage'
                      }`}
                    >
                      {aisle.n}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col justify-center px-4 py-4">
                      <span className="flex items-center gap-2">
                        <span className="sign-type text-base text-ink group-hover:text-signage sm:text-lg">
                          {aisle.title}
                        </span>
                        {aisle.kind === 'department' && (
                          <span className="label-type text-ink/30">
                            FRONT OF STORE
                          </span>
                        )}
                      </span>
                      <span className="mt-1 text-xs text-ink/55">
                        {aisle.blurb}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="label-type flex items-center pr-4 text-ink/30 group-hover:text-signage"
                    >
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
