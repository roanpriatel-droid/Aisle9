import {Link} from 'react-router';
import {AISLES, DEPARTMENTS} from '~/lib/brand';

/**
 * STORE DIRECTORY — the whole collection list rendered as the supermarket
 * directory board bolted to the wall by the entrance. The signage IS the
 * design: an ink header plate, the front-of-store departments as a chip row,
 * then the nine numbered aisles as a directory list. Config-driven from
 * AISLES/DEPARTMENTS — no query, so it never blocks or breaks.
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
              9 AISLES · FIND YOUR REGRET
            </span>
          </div>

          {/* Front of store */}
          <div className="border-b-2 border-ink px-4 py-4 sm:px-6">
            <p className="label-type text-ink/50">FRONT OF STORE</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DEPARTMENTS.map((dept) => (
                <Link
                  key={dept.handle}
                  to={dept.to}
                  prefetch="intent"
                  className="label-type border-2 border-ink bg-white px-3 py-2 no-underline hover:bg-fluorescent"
                >
                  {dept.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Numbered aisles */}
          <ul className="grid grid-cols-1 md:grid-cols-2">
            {AISLES.map((aisle, i) => (
              <li
                key={aisle.handle}
                className={`border-ink ${i % 2 === 0 ? 'md:border-r-2' : ''} ${
                  i < AISLES.length - (AISLES.length % 2 === 0 ? 2 : 1)
                    ? 'border-b-2'
                    : ''
                }`}
              >
                <Link
                  to={`/collections/${aisle.handle}`}
                  prefetch="intent"
                  className="group flex items-stretch gap-0 no-underline"
                >
                  <span className="flex w-14 shrink-0 items-center justify-center bg-signage text-2xl font-bold text-white sm:w-16">
                    {aisle.n}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col justify-center px-4 py-4">
                    <span className="sign-type text-base text-ink group-hover:text-signage sm:text-lg">
                      {aisle.title}
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
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
