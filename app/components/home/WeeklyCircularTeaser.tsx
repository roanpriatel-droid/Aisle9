import {Link} from 'react-router';
import {WEEKLY_CIRCULAR} from '~/lib/brand';

/**
 * WEEKLY CIRCULAR teaser band — the "now in circulation" strip pointing at the
 * signature flyer page. Rendered as a folded mailer: an ink masthead plate next
 * to a mock flyer corner. Static; always resolves.
 */
export function WeeklyCircularTeaser() {
  const t = WEEKLY_CIRCULAR.teaser;
  return (
    <section aria-labelledby="circular-teaser" className="border-b-2 border-ink bg-linoleum">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <Link
          to="/pages/weekly-circular"
          prefetch="intent"
          className="group grid items-stretch border-2 border-ink no-underline md:grid-cols-[1.4fr_1fr]"
        >
          <div className="bg-ink p-6 sm:p-10">
            <p className="label-type text-linoleum/50">{t.eyebrow}</p>
            <h2
              id="circular-teaser"
              className="sign-type mt-2 text-4xl text-linoleum sm:text-5xl"
            >
              {t.heading}
            </h2>
            <p className="mt-4 max-w-md text-sm text-linoleum/70">{t.sub}</p>
            <span className="btn mt-6 inline-block border-linoleum bg-linoleum text-ink group-hover:border-signage group-hover:bg-signage group-hover:text-white">
              {t.cta}
            </span>
          </div>

          {/* Mock flyer corner */}
          <div className="relative flex items-center justify-center overflow-hidden bg-signage p-8">
            <div className="w-full max-w-[16rem] -rotate-3 border-2 border-ink bg-white shadow-[8px_8px_0_rgba(26,26,26,1)]">
              <div className="bg-ink px-3 py-1.5 text-center">
                <span className="label-type text-linoleum">AISLE 9 CIRCULAR</span>
              </div>
              <div className="grid grid-cols-2 gap-1 p-2">
                {['$29', '$29', '$29', '$29'].map((p, i) => (
                  <div
                    key={i}
                    className="flex aspect-square flex-col items-center justify-center border border-ink/30 bg-linoleum"
                  >
                    <span className="sign-type text-lg text-signage">{p}</span>
                    <span className="label-type text-ink/40">EACH</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
