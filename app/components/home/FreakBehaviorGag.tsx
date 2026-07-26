import {Link} from 'react-router';
import {FREAK_BEHAVIOR} from '~/lib/brand';

/**
 * FREAK BEHAVIOR — the "employees only" beaded-curtain visual gag. A back-of-
 * store doorway: an EMPLOYEES ONLY sign over a beaded curtain (CSS strands) that
 * parts on hover to reveal the aisle behind it. Deadpan; the sign never winks.
 */
export function FreakBehaviorGag() {
  return (
    <section
      aria-labelledby="freak-heading"
      className="border-b-2 border-ink bg-ink"
    >
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Link
          to={`/collections/${FREAK_BEHAVIOR.handle}`}
          prefetch="intent"
          className="group relative mx-auto block max-w-3xl overflow-hidden border-2 border-linoleum/30 no-underline"
          aria-label={`${FREAK_BEHAVIOR.sign} — ${FREAK_BEHAVIOR.heading}`}
        >
          {/* Behind the curtain */}
          <div className="flex min-h-[18rem] flex-col items-center justify-center gap-4 bg-linoleum px-6 py-16 text-center">
            <span className="label-type text-signage">AISLE 4 · BACK OF STORE</span>
            <h2 id="freak-heading" className="sign-type text-4xl sm:text-6xl">
              {FREAK_BEHAVIOR.heading}
            </h2>
            <p className="max-w-md text-sm text-ink/60">{FREAK_BEHAVIOR.sub}</p>
            <span className="btn mt-2">{FREAK_BEHAVIOR.cta}</span>
          </div>

          {/* Beaded curtain — parts on hover/focus */}
          <div
            aria-hidden
            className="beaded-curtain pointer-events-none absolute inset-0"
          >
            <span className="beaded-strand beaded-left" />
            <span className="beaded-strand beaded-right" />
            <div className="beaded-sign">
              <span className="label-type">{FREAK_BEHAVIOR.sign}</span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
